-- ============================================================================
-- DeokbunAI — Global reservation REQUEST IDENTITY (Sprint H §44, finishing Sprint F.1 §N)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. ADDITIVE + backward-compatible: adds a dedup table + a NEW wrapper
-- RPC; the existing reserve_global_paid_generation and all budget ceilings/locking are UNCHANGED. Applying this
-- alone is safe (the deployed Edge keeps using the old RPC). The Edge activation (call the _idem variant + pass
-- request_id) is a documented owner-sequenced step — do it WITH or AFTER this migration.
--
-- GOAL: one logical request_id consumes AT MOST one global budget slot, even across response-loss retries.
-- ============================================================================

create table if not exists public.global_reservation_requests (
  user_id        uuid not null,
  workload       text not null,
  request_id     text not null,
  reservation_id uuid,
  created_at     timestamptz not null default now(),
  primary key (user_id, workload, request_id)
);

-- Wrapper: dedup by (user, workload, request_id). A repeat request returns the PRIOR reservation with no new
-- slot; a first request delegates to the existing guard and records the mapping. Same return shape.
create or replace function public.reserve_global_paid_generation_idem(
  p_user_id uuid, p_workload text, p_request_id text, p_units integer default 1
)
returns table (
  allowed boolean, reason text, retry_after_ms integer, reservation_id uuid,
  hourly_used integer, daily_used integer, hourly_limit integer, daily_limit integer,
  utilization_percent integer, warning_level text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_prior record; v_res record;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;

  -- Serialize per request identity so two concurrent retries cannot both consume a slot.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_workload || ':' || p_request_id));

  select * into v_prior from public.global_reservation_requests
    where user_id = p_user_id and workload = p_workload and request_id = p_request_id;
  if found then
    -- Already reserved for this logical request → no new slot consumed.
    return query select true, 'IDEMPOTENT_REPLAY'::text, 0, v_prior.reservation_id,
      null::integer, null::integer, null::integer, null::integer, null::integer, 'NORMAL'::text;
    return;
  end if;

  -- First time: delegate to the unchanged guard (ceilings/locking intact).
  select * into v_res from public.reserve_global_paid_generation(p_user_id, p_workload, p_units);
  if v_res.allowed then
    insert into public.global_reservation_requests (user_id, workload, request_id, reservation_id)
      values (p_user_id, p_workload, p_request_id, v_res.reservation_id)
      on conflict (user_id, workload, request_id) do nothing;
  end if;
  return query select v_res.allowed, v_res.reason, v_res.retry_after_ms, v_res.reservation_id,
    v_res.hourly_used, v_res.daily_used, v_res.hourly_limit, v_res.daily_limit, v_res.utilization_percent, v_res.warning_level;
end;
$$;

revoke all on function public.reserve_global_paid_generation_idem(uuid,text,text,integer) from public, anon, authenticated;
grant execute on function public.reserve_global_paid_generation_idem(uuid,text,text,integer) to service_role;
