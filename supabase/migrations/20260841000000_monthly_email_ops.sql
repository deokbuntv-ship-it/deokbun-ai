-- Sprint J4 — monthly-fortune email operations (ADDITIVE, staging-first, OWNER_APPLY).
--
-- Campaign + per-recipient delivery model. Email CONSUMES the already-generated authoritative monthly_fortunes
-- digest (NO astrology recompute, NO new LLM). The actual send is a provider-independent worker (EXTERNAL) that
-- reads PENDING deliveries and calls record_email_delivery_result. Consent: a monthly-fortune email is classified
-- as a SERVICE notification gated by notification_preferences.monthly_fortune (NOT marketing) — documented, not a
-- final legal determination. All admin ops are is_admin()-gated; execution/record are service-role. RLS locked.

-- ---------------------------------------------------------------------------------------------------------------
-- 1. email_campaigns — the job.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.email_campaigns (
  id               uuid primary key default gen_random_uuid(),
  campaign_type    text not null default 'MONTHLY_FORTUNE' check (campaign_type in ('MONTHLY_FORTUNE')),
  target_year      integer not null,
  target_month     integer not null check (target_month between 1 and 12),
  audience         text not null default 'ALL_ELIGIBLE' check (audience in ('ALL_ELIGIBLE')),
  template_version text not null default 'monthly-email@1.0.0',
  subject          text not null,
  status           text not null default 'DRAFT' check (status in ('DRAFT','SCHEDULED','PROCESSING','SENT','PARTIAL','FAILED','CANCELLED')),
  scheduled_at     timestamptz,
  created_by       uuid,
  total_count      integer not null default 0,
  sent_count       integer not null default 0,
  failed_count     integer not null default 0,
  skipped_count    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  completed_at     timestamptz
);
alter table public.email_campaigns enable row level security;
create index if not exists email_campaigns_recent_idx on public.email_campaigns (created_at desc);

-- ---------------------------------------------------------------------------------------------------------------
-- 2. email_deliveries — per recipient. `email` is operational (admin-only via RPC); never in analytics.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.email_deliveries (
  id                  uuid primary key default gen_random_uuid(),
  campaign_id         uuid not null references public.email_campaigns (id) on delete cascade,
  user_id             uuid not null references auth.users (id) on delete cascade,
  email               text,
  monthly_fortune_id  uuid,
  status              text not null check (status in ('PENDING','SENT','FAILED','SKIPPED_NO_CONSENT','SKIPPED_INVALID_EMAIL','SKIPPED_NO_FORTUNE','CANCELLED')),
  attempt_count       integer not null default 0,
  last_error_category text,
  sent_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (campaign_id, user_id)
);
alter table public.email_deliveries enable row level security;
create index if not exists email_deliveries_campaign_idx on public.email_deliveries (campaign_id, status);

drop trigger if exists email_campaigns_set_updated on public.email_campaigns;
create trigger email_campaigns_set_updated before update on public.email_campaigns
  for each row execute function public.set_updated_at();
drop trigger if exists email_deliveries_set_updated on public.email_deliveries;
create trigger email_deliveries_set_updated before update on public.email_deliveries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------------------------------------------
-- helper: recompute campaign counts + terminal status from its deliveries.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.recompute_email_campaign(p_campaign_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_total int; v_sent int; v_failed int; v_skipped int; v_pending int; v_cancelled int;
begin
  select count(*),
         count(*) filter (where status = 'SENT'),
         count(*) filter (where status = 'FAILED'),
         count(*) filter (where status like 'SKIPPED_%'),
         count(*) filter (where status = 'PENDING'),
         count(*) filter (where status = 'CANCELLED')
    into v_total, v_sent, v_failed, v_skipped, v_pending, v_cancelled
  from public.email_deliveries where campaign_id = p_campaign_id;

  update public.email_campaigns
    set total_count = v_total, sent_count = v_sent, failed_count = v_failed, skipped_count = v_skipped,
        status = case
          when status = 'CANCELLED' then 'CANCELLED'
          when v_pending > 0 then 'PROCESSING'
          when v_total = 0 then status
          when v_sent > 0 and v_failed = 0 then 'SENT'
          when v_sent > 0 and v_failed > 0 then 'PARTIAL'
          when v_sent = 0 and v_failed > 0 then 'FAILED'
          else 'SENT' end,
        completed_at = case when v_pending = 0 and v_total > 0 then now() else completed_at end,
        updated_at = now()
    where id = p_campaign_id;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 3. admin_create_email_campaign — DRAFT campaign (is_admin).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_create_email_campaign(
  p_year integer, p_month integer, p_subject text, p_template_version text default 'monthly-email@1.0.0'
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  if p_month < 1 or p_month > 12 then raise exception 'invalid month'; end if;
  insert into public.email_campaigns (target_year, target_month, subject, template_version, created_by)
  values (p_year, p_month, coalesce(nullif(btrim(p_subject), ''), '이번 달의 운세가 도착했어요'), p_template_version, auth.uid())
  returning id into v_id;
  return v_id;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 4. admin_build_email_recipients — resolve the eligible recipient set for the campaign's month. Idempotent.
--    Eligibility: has an authoritative monthly_fortunes row for (year, month); service consent
--    (notification_preferences.monthly_fortune, default true); a syntactically valid email. Non-eligible users
--    are recorded with the SKIPPED_* reason (auditable), never silently dropped.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_build_email_recipients(p_campaign_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_year int; v_month int; v_status text;
  v_pending int := 0; v_skip_consent int := 0; v_skip_email int := 0;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  select target_year, target_month, status into v_year, v_month, v_status
    from public.email_campaigns where id = p_campaign_id;
  if v_year is null then raise exception 'campaign not found'; end if;
  if v_status in ('SENT','CANCELLED') then raise exception 'campaign already terminal'; end if;

  -- One recipient per user who has a monthly fortune for the target month (the digest the email consumes).
  insert into public.email_deliveries (campaign_id, user_id, email, monthly_fortune_id, status)
  select p_campaign_id,
         mf.user_id,
         au.email,
         mf.id,
         case
           when coalesce(np.monthly_fortune, true) = false then 'SKIPPED_NO_CONSENT'
           when au.email is null or au.email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then 'SKIPPED_INVALID_EMAIL'
           else 'PENDING'
         end
  from (
    -- newest authoritative digest per user for the month
    select distinct on (user_id) id, user_id
    from public.monthly_fortunes
    where fortune_year = v_year and fortune_month = v_month
    order by user_id, created_at desc
  ) mf
  join auth.users au on au.id = mf.user_id
  left join public.notification_preferences np on np.user_id = mf.user_id
  on conflict (campaign_id, user_id) do nothing;

  perform public.recompute_email_campaign(p_campaign_id);

  select count(*) filter (where status='PENDING'),
         count(*) filter (where status='SKIPPED_NO_CONSENT'),
         count(*) filter (where status='SKIPPED_INVALID_EMAIL')
    into v_pending, v_skip_consent, v_skip_email
  from public.email_deliveries where campaign_id = p_campaign_id;

  return jsonb_build_object('pending', v_pending, 'skipped_no_consent', v_skip_consent, 'skipped_invalid_email', v_skip_email);
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 5. schedule / run / cancel / retry
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_schedule_email_campaign(p_campaign_id uuid, p_scheduled_at timestamptz)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  update public.email_campaigns set status = 'SCHEDULED', scheduled_at = p_scheduled_at, updated_at = now()
    where id = p_campaign_id and status in ('DRAFT','SCHEDULED');
  return found;
end; $$;

-- Same domain path for send-now and scheduled execution: ensure recipients exist, then mark PROCESSING so the
-- worker sends PENDING deliveries. Idempotent (re-run never duplicates a delivery or re-sends a SENT one).
create or replace function public.run_email_campaign(p_campaign_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_status text; v_built jsonb;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  select status into v_status from public.email_campaigns where id = p_campaign_id;
  if v_status is null then raise exception 'campaign not found'; end if;
  if v_status in ('SENT','CANCELLED') then
    return jsonb_build_object('status', v_status, 'noop', true);
  end if;
  -- build recipients if not yet built (idempotent)
  if not exists (select 1 from public.email_deliveries where campaign_id = p_campaign_id) then
    v_built := public.admin_build_email_recipients(p_campaign_id);
  end if;
  update public.email_campaigns set status = 'PROCESSING', updated_at = now()
    where id = p_campaign_id and status in ('DRAFT','SCHEDULED','PARTIAL','FAILED');
  perform public.recompute_email_campaign(p_campaign_id);
  return jsonb_build_object('status', 'PROCESSING', 'built', coalesce(v_built, '{}'::jsonb));
end; $$;

create or replace function public.admin_cancel_email_campaign(p_campaign_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_cancelled int;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  -- Only UNSENT recipients are cancelled; already-SENT deliveries are never reversed.
  update public.email_deliveries set status = 'CANCELLED', updated_at = now()
    where campaign_id = p_campaign_id and status = 'PENDING';
  get diagnostics v_cancelled = row_count;
  update public.email_campaigns set status = 'CANCELLED', updated_at = now(), completed_at = now()
    where id = p_campaign_id;
  return v_cancelled;
end; $$;

create or replace function public.admin_retry_failed_email_deliveries(p_campaign_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_retried int;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  -- Retry ONLY failed recipients; never touch SENT (no duplicate send).
  update public.email_deliveries set status = 'PENDING', last_error_category = null, updated_at = now()
    where campaign_id = p_campaign_id and status = 'FAILED';
  get diagnostics v_retried = row_count;
  perform public.recompute_email_campaign(p_campaign_id);
  return v_retried;
end; $$;

-- The worker records each recipient's send outcome. SENT is idempotent (never re-marks a non-PENDING row).
create or replace function public.record_email_delivery_result(
  p_delivery_id uuid, p_status text, p_error_category text default null
) returns boolean language plpgsql security definer set search_path = public as $$
declare v_campaign uuid; v_current text;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  select campaign_id, status into v_campaign, v_current from public.email_deliveries where id = p_delivery_id;
  if v_campaign is null then return false; end if;
  -- Idempotency: only a PENDING delivery may transition to a terminal send result.
  if v_current <> 'PENDING' then return false; end if;
  update public.email_deliveries
    set status = p_status, attempt_count = attempt_count + 1, last_error_category = p_error_category,
        sent_at = case when p_status = 'SENT' then now() else sent_at end, updated_at = now()
    where id = p_delivery_id;
  perform public.recompute_email_campaign(v_campaign);
  return true;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 6. admin read RPCs — list (no emails) + detail (status breakdown; emails only in detail, admin-authorized).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_list_email_campaigns()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v from (
    select id, campaign_type, target_year, target_month, subject, template_version, status,
           scheduled_at, total_count, sent_count, failed_count, skipped_count, created_at, completed_at
    from public.email_campaigns order by created_at desc limit 100
  ) t;
  return v;
end; $$;

create or replace function public.admin_get_email_campaign(p_campaign_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'campaign', (select row_to_json(c) from (
      select id, campaign_type, target_year, target_month, subject, template_version, status, scheduled_at,
             total_count, sent_count, failed_count, skipped_count, created_at, completed_at
      from public.email_campaigns where id = p_campaign_id) c),
    'delivery_status_breakdown', (
      select coalesce(jsonb_object_agg(status, c), '{}'::jsonb)
      from (select status, count(*) c from public.email_deliveries where campaign_id = p_campaign_id group by status) s
    )
  ) into v;
  return v;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------------------------------------------
revoke all on function public.recompute_email_campaign(uuid) from public, anon, authenticated;
revoke all on function public.run_email_campaign(uuid) from public, anon;
revoke all on function public.record_email_delivery_result(uuid, text, text) from public, anon;
grant execute on function public.run_email_campaign(uuid) to authenticated;                 -- is_admin re-checked inside
grant execute on function public.record_email_delivery_result(uuid, text, text) to authenticated; -- is_admin/service re-checked
revoke all on function public.admin_create_email_campaign(integer, integer, text, text) from public, anon;
revoke all on function public.admin_build_email_recipients(uuid) from public, anon;
revoke all on function public.admin_schedule_email_campaign(uuid, timestamptz) from public, anon;
revoke all on function public.admin_cancel_email_campaign(uuid) from public, anon;
revoke all on function public.admin_retry_failed_email_deliveries(uuid) from public, anon;
revoke all on function public.admin_list_email_campaigns() from public, anon;
revoke all on function public.admin_get_email_campaign(uuid) from public, anon;
grant execute on function public.admin_create_email_campaign(integer, integer, text, text) to authenticated;
grant execute on function public.admin_build_email_recipients(uuid) to authenticated;
grant execute on function public.admin_schedule_email_campaign(uuid, timestamptz) to authenticated;
grant execute on function public.admin_cancel_email_campaign(uuid) to authenticated;
grant execute on function public.admin_retry_failed_email_deliveries(uuid) to authenticated;
grant execute on function public.admin_list_email_campaigns() to authenticated;
grant execute on function public.admin_get_email_campaign(uuid) to authenticated;
