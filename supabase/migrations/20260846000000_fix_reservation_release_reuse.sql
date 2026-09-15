-- ============================================================================
-- DeokbunAI — FIX: released reservation could be resumed as a free consultation
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. DRAFT — pairs with a TypeScript fix in
-- supabase/functions/chat/index.ts (BUG-1/BUG-2, product-integration-readiness audit,
-- 2026-08-29). MUST be validated in STAGING (rolled-back DB-integration test, mirroring how every prior
-- Duk migration in this chain was verified) before either half of the pair is deployed. Deploying the
-- TypeScript fix WITHOUT this migration would leave BUG-2 MORE exposed (SEMANTIC_REJECTED cases would
-- start releasing instead of over-charging, and every release is a free-resume opportunity until this
-- lands) — apply both together.
--
-- BUG-2 (free consultation after a release): release_session_reservation (20260833000000) only ever
-- touched duk_reserve, never the paired consultation_sessions row, which stayed 'OPEN' forever. A
-- subsequent request — a retry reusing the same request_id (exactly what src/app/chat.tsx's "다시 시도"
-- button does), or simply any new question for the same product before the 24h session TTL — matched
-- reserve_session_duk's "existing reservation by request_id" lookup (which does not distinguish a
-- COMMITTED replay from a RELEASED do-over) and returned price 0, so a session that was released
-- (nothing was ever paid for it) could still deliver a real, billable, ACCEPTED answer for free.
--
-- Fix: release_session_reservation now also marks the session 'ABANDONED' (a status the CHECK constraint
-- already allowed — 20260832000000:44 — but nothing ever set) whenever the release actually took effect.
-- reserve_session_duk's "existing reservation by request_id" lookup now joins consultation_sessions and
-- excludes an ABANDONED one, so a released hold can never be resumed as a free ride — the next attempt
-- correctly falls through to reserving fresh (a real, new charge). The separate "resume an ACTIVE/OPEN
-- session" lookup needs NO change: it was already scoped to `status in ('OPEN','ACTIVE')`, which already
-- excludes ABANDONED — the bug was purely that a released session was never actually transitioned there.
-- ============================================================================

create or replace function public.release_session_reservation(p_reservation_id uuid, p_version integer)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_rows integer; v_session_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  update public.duk_reserve set status = 'RELEASED', updated_at = now()
    where reservation_id = p_reservation_id and status = 'RESERVED' and version = p_version  -- fencing
    returning session_id into v_session_id;
  get diagnostics v_rows = row_count;
  if v_rows = 1 then
    -- This reservation's session was never committed (still 'OPEN'), so it was never paid for — it must
    -- never be silently resumed as if it were. An already-'ACTIVE' session (a genuine committed first turn,
    -- now on a later follow-up turn whose own reservation logic differs) is deliberately left untouched.
    update public.consultation_sessions set status = 'ABANDONED', updated_at = now()
      where session_id = v_session_id and status = 'OPEN';
  end if;
  return v_rows = 1;  -- false when already terminal / stale version (no-op)
end;
$$;

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

  -- §22 idempotency, TIGHTENED (BUG-2 fix): a same-request_id replay means "don't re-charge" only when the
  -- reservation is still live or actually committed. A RELEASED reservation whose session was marked
  -- ABANDONED means the original attempt delivered nothing — exclude it and fall through to reserving
  -- fresh (a genuine new charge) rather than returning a free ACTIVE_SESSION.
  select r.* into v_existing_res from public.duk_reserve r
    join public.consultation_sessions s on s.session_id = r.session_id
    where r.user_id = p_user_id and r.request_id = p_request_id and s.status <> 'ABANDONED'
    order by (r.status = 'RESERVED') desc limit 1;
  if found then
    if v_existing_res.status = 'RESERVED' then
      return jsonb_build_object('kind','RESERVED','reservation_id',v_existing_res.reservation_id,
        'session_id',v_existing_res.session_id,'charge_id',v_existing_res.charge_id,'version',v_existing_res.version,'price',v_existing_res.amount);
    end if;
    return jsonb_build_object('kind','ACTIVE_SESSION','session_id',v_existing_res.session_id,'price',0);
  end if;

  -- §9/§18 resume a valid ACTIVE/OPEN session for THIS product (no new charge) — cross-product isolation via
  -- product_type. Unchanged: already excludes ABANDONED (not in this IN-list).
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
