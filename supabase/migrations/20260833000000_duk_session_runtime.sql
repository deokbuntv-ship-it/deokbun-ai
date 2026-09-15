-- ============================================================================
-- DeokbunAI — DUK SESSION BILLING RUNTIME (Sprint H §5-§18, §21, §22)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. DRAFT — MUST be validated in STAGING before production (this SQL is
-- LIVE_DB_UNVERIFIED: no local Postgres). Additive: extends duk_reserve, adds a spendable view + the
-- reserve/commit/release RPCs + an ATOMIC billing-completion wrapper. Builds on 20260831 (ledger/reserve/debt)
-- + 20260832 (economy_policy/sessions) + 20260829 (decision completion). Service-role RPCs are the only writers.
--
-- MODEL: first turn RESERVES the session price (a hold that reduces spendable); the accepted+persisted answer
-- COMMITS the reserve ATOMICALLY with the decision (one transaction); a non-accepted first turn RELEASES the
-- reserve (0 charged). Follow-up turns reuse the session and never re-charge. Fixed allocation PLUS→REWARD→PAID
-- is captured at reserve time. Reservation carries a fencing `version`; a stale worker cannot commit after reuse.
-- ============================================================================

-- ── extend duk_reserve for runtime (additive) ───────────────────────────────────────────────────────────────
alter table public.duk_reserve add column if not exists reservation_id uuid not null default gen_random_uuid();
alter table public.duk_reserve add column if not exists request_id text;
alter table public.duk_reserve add column if not exists product_type text;
alter table public.duk_reserve add column if not exists alloc_plus integer not null default 0;
alter table public.duk_reserve add column if not exists alloc_reward integer not null default 0;
alter table public.duk_reserve add column if not exists alloc_paid integer not null default 0;
create unique index if not exists duk_reserve_reservation_id_uniq on public.duk_reserve (reservation_id);
-- idempotency: one reservation per (user, request_id) — a retried first-turn start reuses it (§22).
create unique index if not exists duk_reserve_request_uniq on public.duk_reserve (user_id, request_id) where request_id is not null;
create index if not exists duk_reserve_user_active_idx on public.duk_reserve (user_id) where status = 'RESERVED';

-- ── spendable = raw ledger balance MINUS active RESERVED holds (§11/§13) ─────────────────────────────────────
-- Per-bucket spendable for a user. Active reserves reduce spendability WITHOUT deleting ledger history.
create or replace view public.duk_spendable as
  with led as (
    select user_id, bucket, sum(delta)::integer as balance from public.duk_ledger
      where expires_at is null or expires_at > now() group by user_id, bucket
  ), held as (
    select user_id,
      coalesce(sum(alloc_plus),0) as h_plus,
      coalesce(sum(alloc_reward),0) as h_reward,
      coalesce(sum(alloc_paid),0) as h_paid
    from public.duk_reserve where status = 'RESERVED' group by user_id
  )
  select l.user_id, l.bucket,
    l.balance - case l.bucket
      when 'PLUS' then coalesce(h.h_plus,0)
      when 'REWARD' then coalesce(h.h_reward,0)
      when 'PAID' then coalesce(h.h_paid,0) else 0 end as spendable
  from led l left join held h on h.user_id = l.user_id;

-- ── reserve_session_duk — atomic first-turn: resume active session OR create session + reserve (§10/§11/§23) ──
create or replace function public.reserve_session_duk(
  p_user_id uuid, p_product_type text, p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_cfg record;
  v_price integer;
  v_ttl integer;
  v_limit integer;
  v_existing_session record;
  v_existing_res record;
  v_plus integer; v_reward integer; v_paid integer;
  v_need integer; v_take integer;
  v_ap integer := 0; v_ar integer := 0; v_apd integer := 0;
  v_session_id uuid; v_reservation_id uuid; v_charge_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_product_type not in ('general','compatibility','premium_report') then raise exception 'bad product' using errcode = '22023'; end if;

  select * into v_cfg from public.economy_policy where is_active limit 1;
  if not found then raise exception 'no active economy policy' using errcode = '55000'; end if;
  v_price := case p_product_type
    when 'general' then v_cfg.general_session_cost
    when 'compatibility' then v_cfg.compatibility_session_cost
    else v_cfg.premium_report_cost end;
  v_ttl := v_cfg.session_ttl_seconds; v_limit := v_cfg.session_turn_limit;

  -- Serialize per-user so two concurrent first-turn starts cannot both create a session + reserve.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- §22 idempotency: a retried first-turn (same request_id) returns its existing reservation. Match ANY status
  -- so a replay AFTER commit does NOT create a spurious new hold — a COMMITTED/RELEASED reserve resolves to its
  -- session with price 0 (no new charge); only a still-RESERVED one is returned as a live reservation.
  select * into v_existing_res from public.duk_reserve
    where user_id = p_user_id and request_id = p_request_id
    order by (status = 'RESERVED') desc limit 1;
  if found then
    if v_existing_res.status = 'RESERVED' then
      return jsonb_build_object('kind','RESERVED','reservation_id',v_existing_res.reservation_id,
        'session_id',v_existing_res.session_id,'charge_id',v_existing_res.charge_id,'version',v_existing_res.version,'price',v_existing_res.amount);
    end if;
    return jsonb_build_object('kind','ACTIVE_SESSION','session_id',v_existing_res.session_id,'price',0);
  end if;

  -- §9/§18 resume a valid ACTIVE session for THIS product (no new charge) — cross-product isolation via product_type.
  select * into v_existing_session from public.consultation_sessions
    where user_id = p_user_id and product_type = p_product_type
      and status in ('OPEN','ACTIVE') and expires_at > now() and successful_turn_count < turn_limit
    order by created_at desc limit 1;
  if found then
    return jsonb_build_object('kind','ACTIVE_SESSION','session_id',v_existing_session.session_id,'price',0);
  end if;

  -- Spendable per bucket (raw balance minus active reserves).
  select coalesce(max(case when bucket='PLUS' then spendable end),0),
         coalesce(max(case when bucket='REWARD' then spendable end),0),
         coalesce(max(case when bucket='PAID' then spendable end),0)
    into v_plus, v_reward, v_paid
  from public.duk_spendable where user_id = p_user_id;

  if v_plus + v_reward + v_paid < v_price then
    return jsonb_build_object('kind','INSUFFICIENT','balance',v_plus+v_reward+v_paid,'required',v_price,'shortfall',v_price-(v_plus+v_reward+v_paid));
  end if;

  -- Fixed allocation PLUS→REWARD→PAID (captured at reserve time, §11).
  v_need := v_price;
  v_take := least(v_need, greatest(v_plus,0));   v_ap := v_take;  v_need := v_need - v_take;
  v_take := least(v_need, greatest(v_reward,0));  v_ar := v_take;  v_need := v_need - v_take;
  v_take := least(v_need, greatest(v_paid,0));    v_apd := v_take; v_need := v_need - v_take;
  if v_need <> 0 then raise exception 'allocation_mismatch' using errcode = 'P0001'; end if;

  v_session_id := gen_random_uuid();
  v_reservation_id := gen_random_uuid();
  v_charge_id := gen_random_uuid();
  insert into public.consultation_sessions (session_id, user_id, product_type, charge_id, status,
      turn_limit, price_duk, economy_policy_version, expires_at)
    values (v_session_id, p_user_id, p_product_type, v_charge_id, 'OPEN', v_limit, v_price,
      v_cfg.policy_version, now() + (v_ttl || ' seconds')::interval);
  insert into public.duk_reserve (session_id, user_id, amount, status, version, charge_id, expires_at,
      reservation_id, request_id, product_type, alloc_plus, alloc_reward, alloc_paid)
    values (v_session_id, p_user_id, v_price, 'RESERVED', 0, v_charge_id,
      now() + (v_cfg.reserve_ttl_seconds || ' seconds')::interval, v_reservation_id, p_request_id, p_product_type, v_ap, v_ar, v_apd);

  return jsonb_build_object('kind','RESERVED','reservation_id',v_reservation_id,'session_id',v_session_id,
    'charge_id',v_charge_id,'version',0,'price',v_price);
end;
$$;

-- ── release_session_reservation — fenced RESERVED→RELEASED (§13/§14) ────────────────────────────────────────
create or replace function public.release_session_reservation(p_reservation_id uuid, p_version integer)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_rows integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  update public.duk_reserve set status = 'RELEASED', updated_at = now()
    where reservation_id = p_reservation_id and status = 'RESERVED' and version = p_version;  -- fencing
  get diagnostics v_rows = row_count;
  return v_rows = 1;  -- false when already terminal / stale version (no-op)
end;
$$;

create or replace function public.session_reason(p_product text) returns text language sql immutable as $$
  select case p_product when 'general' then 'GENERAL_SESSION' when 'compatibility' then 'COMPATIBILITY_SESSION'
    when 'premium_report' then 'PREMIUM_REPORT' else 'GENERAL_SESSION' end;
$$;

-- ── commit_session_reservation — fenced RESERVED→COMMITTED + ledger debits + turn increment (§12) ────────────
-- Callable directly, but the ATOMIC path is complete_consultation_with_billing below (§21).
create or replace function public.commit_session_reservation(p_reservation_id uuid, p_version integer)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_res record;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select * into v_res from public.duk_reserve where reservation_id = p_reservation_id for update;
  if not found then return false; end if;
  if v_res.status = 'COMMITTED' then return true; end if;                 -- idempotent
  if v_res.status <> 'RESERVED' or v_res.version <> p_version then return false; end if;  -- fencing / terminal
  if v_res.expires_at <= now() then return false; end if;                 -- expired reserve cannot commit

  -- Append one immutable debit per allocated bucket (idempotency: unique (session_id, reason) on the ledger).
  if v_res.alloc_plus > 0 then insert into public.duk_ledger (user_id,bucket,delta,reason,session_id,request_id,charge_id)
      values (v_res.user_id,'PLUS',-v_res.alloc_plus, session_reason(v_res.product_type), v_res.session_id, v_res.request_id, v_res.charge_id); end if;
  if v_res.alloc_reward > 0 then insert into public.duk_ledger (user_id,bucket,delta,reason,session_id,request_id,charge_id)
      values (v_res.user_id,'REWARD',-v_res.alloc_reward, session_reason(v_res.product_type), v_res.session_id, v_res.request_id, v_res.charge_id); end if;
  if v_res.alloc_paid > 0 then insert into public.duk_ledger (user_id,bucket,delta,reason,session_id,request_id,charge_id)
      values (v_res.user_id,'PAID',-v_res.alloc_paid, session_reason(v_res.product_type), v_res.session_id, v_res.request_id, v_res.charge_id); end if;

  update public.duk_reserve set status='COMMITTED', updated_at=now() where reservation_id = p_reservation_id;
  update public.consultation_sessions set status='ACTIVE', successful_turn_count = successful_turn_count + 1, updated_at=now()
    where session_id = v_res.session_id;
  return true;
end;
$$;

-- ── complete_consultation_with_billing — ATOMIC decision persist + Duk commit (§21) ─────────────────────────
-- One transaction: complete the paid request + insert the authoritative decision + commit the Duk reservation
-- (first turn) OR just increment the follow-up turn. Either ALL succeed or the whole call rolls back — never
-- "decision persisted but Duk uncommitted" or vice-versa.
create or replace function public.complete_consultation_with_billing(
  p_user_id uuid, p_workload text, p_request_id text, p_lease_token uuid, p_response_json jsonb,
  p_conversation_id uuid, p_decision_meta jsonb, p_answer_plan_version text, p_decision_policy_version text,
  p_engine_version text, p_model_id text,
  p_reservation_id uuid,   -- first turn: the reserve to commit; null for a follow-up
  p_reservation_version integer,
  p_followup_session_id uuid  -- follow-up: the active session to increment; null for a first turn
)
returns uuid
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_decision_id uuid; v_ok boolean;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;

  if p_conversation_id is not null and p_decision_meta is not null then
    -- Solo consultation: reuse the existing atomic decision+completion (ownership-checked, idempotent replay).
    v_decision_id := public.complete_consultation_request_with_decision(
      p_user_id, p_workload, p_request_id, p_lease_token, p_response_json, p_conversation_id,
      p_decision_meta, p_answer_plan_version, p_decision_policy_version, p_engine_version, p_model_id);
    if v_decision_id is null then return null; end if;  -- not completed (replay/failed) → no billing side effect
  else
    -- Compatibility / no-decision: complete the paid request only (no decision store write).
    if not public.complete_paid_request(p_user_id, p_workload, p_request_id, p_lease_token, p_response_json) then
      return null;  -- replay / not completed → no billing side effect
    end if;
    v_decision_id := gen_random_uuid();  -- sentinel non-null: "completed"
  end if;

  if p_reservation_id is not null then
    v_ok := public.commit_session_reservation(p_reservation_id, p_reservation_version);
    if not v_ok then raise exception 'reservation commit failed (stale/expired)' using errcode = 'P0001'; end if;  -- rolls back the whole tx
  elsif p_followup_session_id is not null then
    update public.consultation_sessions set successful_turn_count = successful_turn_count + 1, updated_at = now()
      where session_id = p_followup_session_id and user_id = p_user_id and status in ('OPEN','ACTIVE');
  end if;
  return v_decision_id;
end;
$$;

-- ── grants ──────────────────────────────────────────────────────────────────────────────────────────────────
revoke all on function public.reserve_session_duk(uuid,text,text) from public, anon, authenticated;
revoke all on function public.release_session_reservation(uuid,integer) from public, anon, authenticated;
revoke all on function public.commit_session_reservation(uuid,integer) from public, anon, authenticated;
revoke all on function public.complete_consultation_with_billing(uuid,text,text,uuid,jsonb,uuid,jsonb,text,text,text,text,uuid,integer,uuid) from public, anon, authenticated;
grant execute on function public.reserve_session_duk(uuid,text,text) to service_role;
grant execute on function public.release_session_reservation(uuid,integer) to service_role;
grant execute on function public.commit_session_reservation(uuid,integer) to service_role;
grant execute on function public.complete_consultation_with_billing(uuid,text,text,uuid,jsonb,uuid,jsonb,text,text,text,text,uuid,integer,uuid) to service_role;
