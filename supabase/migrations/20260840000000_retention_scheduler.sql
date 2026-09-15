-- Sprint J3 — retention scheduler + delivery substrate (ADDITIVE, staging-first, OWNER_APPLY).
--
-- Provider-independent: this creates notification TRUTH (in_app_notifications, reused) + per-channel DELIVERY
-- records. The actual push send is a separate worker/provider (EXTERNAL) that reads PENDING push deliveries and
-- calls record_notification_delivery_result. Notification truth NEVER depends on push success.
--
-- Idempotency: exactly-one notification per (user, dedup_key) via the EXISTING in_app_notifications unique index,
-- exactly-one delivery per (user, channel, dedup_key), and exactly-one run per (job_type, occurrence_key). A
-- per-occurrence advisory lock serializes concurrent scheduler invocations. Nothing here touches production.
--
-- No PII/tokens are exposed by any admin function. All writers are SECURITY DEFINER service/admin RPCs; the base
-- tables have RLS enabled with NO client policy.

-- ---------------------------------------------------------------------------------------------------------------
-- 1. scheduler_runs — one row per (job_type, occurrence). Exactly-once run tracking + audit.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.scheduler_runs (
  id                 uuid primary key default gen_random_uuid(),
  job_type           text not null check (job_type in ('BIRTHDAY','MONTHLY_FORTUNE','LIFE_EVENT')),
  occurrence_key     text not null,
  status             text not null default 'RUNNING' check (status in ('RUNNING','COMPLETED','FAILED')),
  attempt_count      integer not null default 1,
  last_error_category text,
  result             jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  completed_at       timestamptz,
  unique (job_type, occurrence_key)
);
alter table public.scheduler_runs enable row level security;
-- No client policy: only SECURITY DEFINER RPCs (service/admin) read or write.

-- ---------------------------------------------------------------------------------------------------------------
-- 2. notification_deliveries — per (user, channel, dedup_key) delivery outcome + history. No push token stored.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.notification_deliveries (
  id                  uuid primary key default gen_random_uuid(),
  notification_id     uuid references public.in_app_notifications (id) on delete set null,
  user_id             uuid not null references auth.users (id) on delete cascade,
  channel             text not null check (channel in ('inapp','push')),
  status              text not null check (status in ('PENDING','SENT','FAILED','SKIPPED_NO_TOKEN','SKIPPED_DISABLED','SKIPPED_NO_CONSENT')),
  attempt_count       integer not null default 0,
  last_error_category text,
  dedup_key           text not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  sent_at             timestamptz,
  unique (user_id, channel, dedup_key)
);
alter table public.notification_deliveries enable row level security;
create index if not exists notification_deliveries_status_idx on public.notification_deliveries (status, channel);
create index if not exists notification_deliveries_user_idx on public.notification_deliveries (user_id);
-- No client policy: admin reads via SECURITY DEFINER RPC; the push worker writes via service role.

-- updated_at triggers (reuse the shared helper).
drop trigger if exists scheduler_runs_set_updated on public.scheduler_runs;
create trigger scheduler_runs_set_updated before update on public.scheduler_runs
  for each row execute function public.set_updated_at();
drop trigger if exists notification_deliveries_set_updated on public.notification_deliveries;
create trigger notification_deliveries_set_updated before update on public.notification_deliveries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------------------------------------------
-- 3. run_birthday_notifications(as_of) — the daily birthday job. Idempotent + concurrency-safe.
--    * eligibility: canonical SELF subject whose birth month/day matches as_of (Feb 29 observed on Feb 28 in
--      non-leap years, mirroring src/features/retention/birthday.ts), AND notification_preferences.birthday
--      (default true when no prefs row).
--    * creates exactly one in_app_notification per user per year (dedup_key 'birthday:<year>').
--    * records an inapp delivery (SENT) + a push delivery intent (PENDING / SKIPPED_*).
--    * as_of defaults to the current KST civil date; the client clock is never the authority.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.run_birthday_notifications(
  p_as_of date default ((now() at time zone 'Asia/Seoul')::date)
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id   uuid;
  v_status   text;
  v_year     int := extract(year from p_as_of)::int;
  v_month    int := extract(month from p_as_of)::int;
  v_day      int := extract(day from p_as_of)::int;
  v_is_leap  boolean := (v_year % 4 = 0 and (v_year % 100 <> 0 or v_year % 400 = 0));
  v_created  int := 0;
  v_inapp    int := 0;
  v_push_pending int := 0;
  v_skip_no_token int := 0;
  v_skip_disabled int := 0;
  v_eligible int := 0;
  v_dedup    text := 'birthday:' || v_year::text;
  v_notif_id uuid;
  v_push_status text;
  r record;
  v_result jsonb;
begin
  -- Serialize concurrent runs for this occurrence (belt-and-suspenders; unique indexes already enforce dedup).
  perform pg_advisory_xact_lock(hashtext('birthday:' || p_as_of::text));

  select id, status into v_run_id, v_status
  from public.scheduler_runs where job_type = 'BIRTHDAY' and occurrence_key = p_as_of::text;

  if v_run_id is not null and v_status = 'COMPLETED' then
    return coalesce((select result from public.scheduler_runs where id = v_run_id), '{}'::jsonb)
           || jsonb_build_object('idempotent_skip', true);
  end if;

  if v_run_id is null then
    insert into public.scheduler_runs (job_type, occurrence_key, status)
    values ('BIRTHDAY', p_as_of::text, 'RUNNING')
    returning id into v_run_id;
  else
    update public.scheduler_runs set status = 'RUNNING', attempt_count = attempt_count + 1, updated_at = now()
      where id = v_run_id;
  end if;

  for r in
    select cs.user_id,
           exists (
             select 1 from public.push_devices pd
             where pd.user_id = cs.user_id and pd.enabled and pd.push_token is not null
           ) as has_push,
           exists (
             select 1 from public.push_devices pd where pd.user_id = cs.user_id
           ) as has_device
    from public.consultation_subjects cs
    left join public.notification_preferences np on np.user_id = cs.user_id
    where cs.is_self
      and (cs.birth_info ->> 'birthMonth') ~ '^[0-9]+$'
      and (cs.birth_info ->> 'birthDay') ~ '^[0-9]+$'
      and coalesce(np.birthday, true) = true
      and (
        ((cs.birth_info ->> 'birthMonth')::int = v_month and (cs.birth_info ->> 'birthDay')::int = v_day)
        or (not v_is_leap and v_month = 2 and v_day = 28
            and (cs.birth_info ->> 'birthMonth')::int = 2 and (cs.birth_info ->> 'birthDay')::int = 29)
      )
    group by cs.user_id
  loop
    v_eligible := v_eligible + 1;

    -- Notification truth (exactly one per user per year).
    insert into public.in_app_notifications (user_id, category, title, body, deep_link_target, dedup_key)
    values (r.user_id, 'birthday', '생일을 축하드려요 🎉', '오늘은 특별한 날이에요. 이번 달의 흐름을 확인해 보세요.', 'MONTHLY', v_dedup)
    on conflict (user_id, dedup_key) do nothing
    returning id into v_notif_id;

    if v_notif_id is not null then
      v_created := v_created + 1;
    else
      select id into v_notif_id from public.in_app_notifications where user_id = r.user_id and dedup_key = v_dedup;
    end if;

    -- In-app delivery = immediate truth.
    insert into public.notification_deliveries (notification_id, user_id, channel, status, dedup_key, sent_at, attempt_count)
    values (v_notif_id, r.user_id, 'inapp', 'SENT', v_dedup, now(), 1)
    on conflict (user_id, channel, dedup_key) do nothing;
    v_inapp := v_inapp + 1;

    -- Push delivery intent (a worker + real provider will send later; provider is EXTERNAL).
    if r.has_push then
      v_push_status := 'PENDING'; v_push_pending := v_push_pending + 1;
    elsif r.has_device then
      v_push_status := 'SKIPPED_DISABLED'; v_skip_disabled := v_skip_disabled + 1;
    else
      v_push_status := 'SKIPPED_NO_TOKEN'; v_skip_no_token := v_skip_no_token + 1;
    end if;

    insert into public.notification_deliveries (notification_id, user_id, channel, status, dedup_key, attempt_count)
    values (v_notif_id, r.user_id, 'push', v_push_status, v_dedup, 0)
    on conflict (user_id, channel, dedup_key) do nothing;
  end loop;

  v_result := jsonb_build_object(
    'as_of', p_as_of, 'year', v_year, 'eligible', v_eligible,
    'notifications_created', v_created, 'inapp_deliveries', v_inapp,
    'push_pending', v_push_pending, 'skipped_no_token', v_skip_no_token, 'skipped_disabled', v_skip_disabled
  );
  update public.scheduler_runs set status = 'COMPLETED', completed_at = now(), result = v_result, updated_at = now()
    where id = v_run_id;
  return v_result;
exception when others then
  update public.scheduler_runs set status = 'FAILED', last_error_category = 'RUN_ERROR', updated_at = now()
    where id = v_run_id;
  raise;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- 4. record_notification_delivery_result — the push worker calls this after a send attempt. The TRANSIENT vs
--    INVALID classification is decided by the worker (pure TS, tested); this only records the resulting status.
--    On an invalid token the worker also disables the device; this function optionally disables by device.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.record_notification_delivery_result(
  p_delivery_id uuid,
  p_status text,
  p_error_category text default null,
  p_disable_device_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  update public.notification_deliveries
    set status = p_status,
        attempt_count = attempt_count + 1,
        last_error_category = p_error_category,
        sent_at = case when p_status = 'SENT' then now() else sent_at end,
        updated_at = now()
    where id = p_delivery_id
    returning user_id into v_user;

  if v_user is null then
    return false;
  end if;

  -- Invalid-token cleanup (rotation-safe): disable the specific device so we stop targeting it.
  if p_disable_device_id is not null then
    update public.push_devices set enabled = false, updated_at = now()
      where user_id = v_user and device_id = p_disable_device_id;
  end if;

  return true;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- 5. admin_notification_delivery_overview — read-only admin visibility. Counts + recent runs. NO push tokens,
--    NO message bodies, safe user id only.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_notification_delivery_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'deliveries_by_status', coalesce((
      select jsonb_object_agg(k, c) from (
        select channel || ':' || status as k, count(*) as c
        from public.notification_deliveries group by channel, status
      ) s
    ), '{}'::jsonb),
    'recent_runs', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select job_type, occurrence_key, status, attempt_count, last_error_category, result, created_at, completed_at
        from public.scheduler_runs order by created_at desc limit 20
      ) t
    ), '[]'::jsonb),
    'push_pending', (select count(*) from public.notification_deliveries where channel = 'push' and status = 'PENDING')
  ) into v;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- 6. Marketing-consent unification — profiles.marketing_opt_in is the single consent record of truth; mirror it
--    into notification_preferences.marketing so the two never diverge (audit found them unsynced).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.sync_marketing_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_preferences (user_id, marketing)
  values (new.id, coalesce(new.marketing_opt_in, false))
  on conflict (user_id) do update set marketing = excluded.marketing, updated_at = now();
  return new;
end;
$$;
drop trigger if exists profiles_sync_marketing on public.profiles;
create trigger profiles_sync_marketing
  after insert or update of marketing_opt_in on public.profiles
  for each row execute function public.sync_marketing_consent();

-- ---------------------------------------------------------------------------------------------------------------
-- Grants: run/record are service-role only; admin overview is is_admin-gated (callable by authenticated).
-- ---------------------------------------------------------------------------------------------------------------
revoke all on function public.run_birthday_notifications(date) from public, anon, authenticated;
revoke all on function public.record_notification_delivery_result(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_notification_delivery_overview() from public, anon;
grant execute on function public.admin_notification_delivery_overview() to authenticated;
