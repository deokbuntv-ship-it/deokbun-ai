-- Sprint J8/Batch3 Phase 0 — Birthday +5 REWARD_DUK runtime (ADDITIVE, staging-first, OWNER_APPLY).
--
-- IMPLEMENTATION-GAP FIX (not a policy change): the V1 product policy is LOCKED at BIRTHDAY = +5 REWARD_DUK, and
-- economy_policy.birthday_reward is already seeded 5, but run_birthday_notifications only created a notification —
-- it never granted the reward. This grants +5 REWARD Duk on each eligible birthday, server-authoritatively,
-- EXACTLY ONCE per (user, birthday year). The amount is read from economy_policy (source of truth) — the reward
-- amount itself is NOT changed here. Uses the canonical ledger reason 'BIRTHDAY' (already allowed). No client
-- grant path. Reuses the EXISTING birthday occurrence rule (Feb 29 → Feb 28 in non-leap years).
--
-- Idempotency + concurrency: a partial unique index on (user_id, request_id) WHERE reason='BIRTHDAY', with
-- request_id = 'birthday:<year>' + ON CONFLICT DO NOTHING → at most one BIRTHDAY grant per user per year even
-- under repeated/concurrent scheduler runs. Reward truth is independent of push delivery (push send happens in a
-- separate worker); a failed run is retried idempotently without duplicating the notification or the grant.

-- 1. Idempotency guard for the birthday reward.
create unique index if not exists duk_ledger_birthday_uniq
  on public.duk_ledger (user_id, request_id) where reason = 'BIRTHDAY';

-- 2. Re-define the birthday job to also grant the reward.
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
  v_rewards  int := 0;
  v_birthday_reward int;
  v_dedup    text := 'birthday:' || v_year::text;
  v_notif_id uuid;
  v_push_status text;
  r record;
  v_result jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('birthday:' || p_as_of::text));

  select coalesce(birthday_reward, 0) into v_birthday_reward from public.economy_policy where is_active limit 1;
  v_birthday_reward := coalesce(v_birthday_reward, 0);

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

    -- Birthday REWARD (server-authoritative, exactly once per user per year). Independent of push delivery; the
    -- (user_id, request_id) partial unique index makes it idempotent + concurrency-safe.
    if v_birthday_reward > 0 then
      insert into public.duk_ledger (user_id, bucket, delta, reason, request_id, metadata)
      values (r.user_id, 'REWARD', v_birthday_reward, 'BIRTHDAY', v_dedup, jsonb_build_object('occasion_year', v_year))
      on conflict (user_id, request_id) where reason = 'BIRTHDAY' do nothing;
      if found then v_rewards := v_rewards + 1; end if;
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
    'push_pending', v_push_pending, 'skipped_no_token', v_skip_no_token, 'skipped_disabled', v_skip_disabled,
    'birthday_reward_amount', v_birthday_reward, 'birthday_rewards_granted', v_rewards
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
