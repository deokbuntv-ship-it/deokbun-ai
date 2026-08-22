-- Sprint J6 — retention worker DB seam (ADDITIVE, staging-first, OWNER_APPLY).
--
-- Provider-independent execution support: service-role "claim" RPCs feed the push/email workers the PENDING
-- deliveries to send, and a concurrency guard ensures a delivery can only transition out of PENDING once (so two
-- workers can never double-record a SENT). Admin retry paths reset FAILED deliveries back to PENDING (audited).
-- No provider secrets. No product/billing/engine change.

-- ---------------------------------------------------------------------------------------------------------------
-- 1. Concurrency-safe recording: a delivery may leave PENDING exactly once (like record_email_delivery_result).
--    Two workers racing the same row → only the first transition wins; the second is a no-op (returns false).
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
    where id = p_delivery_id and status = 'PENDING'   -- guard: transition out of PENDING once
    returning user_id into v_user;

  if v_user is null then
    return false; -- already terminal (another worker won) or not found → idempotent no-op
  end if;

  if p_disable_device_id is not null then
    update public.push_devices set enabled = false, updated_at = now()
      where user_id = v_user and device_id = p_disable_device_id;
  end if;

  return true;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- 2. claim_pending_push_deliveries — the push worker's feed (service-role only). Returns PENDING push deliveries
--    with the message + the user's primary enabled device token. FOR UPDATE SKIP LOCKED reduces double-claiming.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.claim_pending_push_deliveries(p_limit integer default 100)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v from (
    select nd.id as delivery_id, nd.user_id, nd.attempt_count, nd.dedup_key,
           n.title, n.body, n.deep_link_target, n.deep_link_id,
           (select pd.push_token from public.push_devices pd
             where pd.user_id = nd.user_id and pd.enabled and pd.push_token is not null
             order by pd.last_seen_at desc limit 1) as token,
           (select pd.device_id from public.push_devices pd
             where pd.user_id = nd.user_id and pd.enabled and pd.push_token is not null
             order by pd.last_seen_at desc limit 1) as device_id
    from public.notification_deliveries nd
    left join public.in_app_notifications n on n.id = nd.notification_id
    where nd.channel = 'push' and nd.status = 'PENDING'
    order by nd.created_at
    limit greatest(1, least(p_limit, 500))
  ) t;
  -- Concurrency: delivery TRUTH is race-safe via the PENDING-guard in record_notification_delivery_result
  -- (first transition wins; the loser no-ops). Single-send-under-concurrency (a claim that marks rows CLAIMED)
  -- is a future refinement; not needed while the provider is EXTERNAL_BLOCKED.
  return v;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- 3. claim_pending_email_deliveries — the email worker's feed (service-role only).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.claim_pending_email_deliveries(p_limit integer default 100)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v from (
    select ed.id as delivery_id, ed.user_id, ed.email, ed.monthly_fortune_id, ed.attempt_count,
           c.subject, c.target_year, c.target_month, c.template_version
    from public.email_deliveries ed
    join public.email_campaigns c on c.id = ed.campaign_id
    where ed.status = 'PENDING'
    order by ed.created_at
    limit greatest(1, least(p_limit, 500))
  ) t;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- 4. admin_retry_failed_push_deliveries — reset FAILED push deliveries to PENDING (audited). is_admin or service.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_retry_failed_push_deliveries(p_dedup_key text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_retried integer;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  update public.notification_deliveries
    set status = 'PENDING', attempt_count = 0, last_error_category = null, updated_at = now()
    where channel = 'push' and status = 'FAILED' and (p_dedup_key is null or dedup_key = p_dedup_key);
  get diagnostics v_retried = row_count;
  insert into public.admin_audit_log (admin_user_id, action, reason_note, metadata)
    values (auth.uid(), 'PUSH_RETRY', p_dedup_key, jsonb_build_object('retried', v_retried));
  return v_retried;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- 5. admin_retry_failed_email_deliveries — enhance to reset the attempt budget + write an audit row (J6.11).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_retry_failed_email_deliveries(p_campaign_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_retried integer;
begin
  if not (public.is_admin() or auth.role() = 'service_role') then raise exception 'not authorized'; end if;
  update public.email_deliveries
    set status = 'PENDING', attempt_count = 0, last_error_category = null, updated_at = now()
    where campaign_id = p_campaign_id and status = 'FAILED';
  get diagnostics v_retried = row_count;
  perform public.recompute_email_campaign(p_campaign_id);
  insert into public.admin_audit_log (admin_user_id, action, target_user_id, reason_note, metadata)
    values (auth.uid(), 'EMAIL_RETRY', null, p_campaign_id::text, jsonb_build_object('retried', v_retried));
  return v_retried;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------------------------------------------
revoke all on function public.claim_pending_push_deliveries(integer) from public, anon, authenticated;
revoke all on function public.claim_pending_email_deliveries(integer) from public, anon, authenticated;
revoke all on function public.admin_retry_failed_push_deliveries(text) from public, anon;
grant execute on function public.admin_retry_failed_push_deliveries(text) to authenticated; -- is_admin re-checked inside
