-- Sprint J5 — admin economy + LLM + consultation-audit operations (ADDITIVE, staging-first, OWNER_APPLY).
--
-- Read-only economy aggregates + a single AUDITED admin Duk-adjustment path + consultation decision-audit
-- exposure. All is_admin()-gated SECURITY DEFINER RPCs reading from the LEDGER/business tables (never analytics).
-- Accounting stays on the append-only duk_ledger (no edit/delete of history). Product/billing/engine semantics
-- are unchanged. Does NOT touch the frozen duk_ledger reason CHECK (the DEBT_OFFSET mismatch is reported to the
-- owner, not modified here).

-- ---------------------------------------------------------------------------------------------------------------
-- 1. admin_audit_log — immutable record of privileged admin actions (Duk adjustments, etc.). Append-only.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id             uuid primary key default gen_random_uuid(),
  admin_user_id  uuid,
  action         text not null,
  target_user_id uuid,
  amount         integer,
  bucket         text,
  reason_note    text,
  metadata       jsonb,
  created_at     timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
create index if not exists admin_audit_log_recent_idx on public.admin_audit_log (created_at desc);
-- No client policy; admin reads via RPC; no UPDATE/DELETE path (immutable).

-- ---------------------------------------------------------------------------------------------------------------
-- 2. admin_economy_overview — read-only aggregates from the ledger/business tables.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_economy_overview(
  p_from timestamptz default (now() - interval '30 days'),
  p_to   timestamptz default now()
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', p_to),
    'grants_by_reason', coalesce((select jsonb_object_agg(reason, s) from (
      select reason, sum(delta) s from public.duk_ledger where delta > 0 and created_at between p_from and p_to group by reason) g), '{}'::jsonb),
    'spends_by_reason', coalesce((select jsonb_object_agg(reason, s) from (
      select reason, sum(delta) s from public.duk_ledger where delta < 0 and created_at between p_from and p_to group by reason) sp), '{}'::jsonb),
    'bucket_balances', coalesce((select jsonb_object_agg(bucket, bal) from (
      select bucket, sum(balance) bal from public.duk_balance group by bucket) b), '{}'::jsonb),
    'total_granted', coalesce((select sum(delta) from public.duk_ledger where delta > 0 and created_at between p_from and p_to), 0),
    'total_spent', coalesce((select -sum(delta) from public.duk_ledger where delta < 0 and created_at between p_from and p_to), 0),
    'debt', jsonb_build_object(
      'open_count', (select count(*) from public.duk_debt where not resolved),
      'open_amount', coalesce((select sum(amount) from public.duk_debt where not resolved), 0),
      'resolved_count', (select count(*) from public.duk_debt where resolved)),
    'purchases', jsonb_build_object(
      'count', (select count(*) from public.verified_purchases),
      'granted_duk', coalesce((select sum(granted_duk) from public.verified_purchases), 0)),
    'revocations', (select count(*) from public.purchase_revocations)
  ) into v;
  return v;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 3. admin_user_wallet — full server-authoritative wallet snapshot for one user (admin-only).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_user_wallet(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'user_id', p_user_id,
    'spendable', coalesce((select sum(spendable) from public.duk_spendable where user_id = p_user_id), 0),
    'buckets', coalesce((select jsonb_object_agg(bucket, balance) from public.duk_balance where user_id = p_user_id), '{}'::jsonb),
    'active_reserves', coalesce((select jsonb_agg(jsonb_build_object('session_id', session_id, 'amount', amount, 'status', status, 'expires_at', expires_at))
      from public.duk_reserve where user_id = p_user_id and status = 'RESERVED'), '[]'::jsonb),
    'sessions', coalesce((select jsonb_agg(row_to_json(s)) from (
      select session_id, product_type, status, successful_turn_count, turn_limit, price_duk, created_at
      from public.consultation_sessions where user_id = p_user_id order by created_at desc limit 20) s), '[]'::jsonb),
    'debt', coalesce((select jsonb_agg(row_to_json(d)) from (
      select id, amount, origin, resolved, created_at, resolved_at from public.duk_debt where user_id = p_user_id order by created_at desc) d), '[]'::jsonb),
    'ledger', coalesce((select jsonb_agg(row_to_json(l)) from (
      select id, bucket, delta, reason, session_id, created_at from public.duk_ledger where user_id = p_user_id order by created_at desc limit 50) l), '[]'::jsonb)
  ) into v;
  return v;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 4. admin_list_duk_ledger — filtered ledger rows (admin-only).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_list_duk_ledger(
  p_user_id uuid default null, p_reason text default null, p_limit integer default 100
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v from (
    select id, user_id, bucket, delta, reason, session_id, request_id, created_at
    from public.duk_ledger
    where (p_user_id is null or user_id = p_user_id)
      and (p_reason is null or reason = p_reason)
    order by created_at desc limit greatest(1, least(p_limit, 500))
  ) t;
  return v;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 5. admin_adjust_duk — the ONE audited admin adjustment path. Appends an ADMIN_ADJUSTMENT ledger row (immutable
--    history) + an admin_audit_log entry. No table UPDATE, no history rewrite. Positive = credit, negative =
--    debit; a debit can never drive a bucket below zero (checked against current bucket balance).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_adjust_duk(
  p_user_id uuid, p_amount integer, p_bucket text, p_reason_note text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_ledger_id uuid; v_current integer;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if p_amount is null or p_amount = 0 then raise exception 'amount must be non-zero'; end if;
  if p_bucket not in ('PLUS','REWARD','PAID') then raise exception 'invalid bucket'; end if;
  if p_reason_note is null or btrim(p_reason_note) = '' then raise exception 'reason required'; end if;

  perform pg_advisory_xact_lock(hashtext('duk:' || p_user_id::text));

  if p_amount < 0 then
    select coalesce((select balance from public.duk_balance where user_id = p_user_id and bucket = p_bucket), 0) into v_current;
    if v_current + p_amount < 0 then
      raise exception 'insufficient % balance for debit (have %, adjust %)', p_bucket, v_current, p_amount;
    end if;
  end if;

  insert into public.duk_ledger (user_id, bucket, delta, reason, request_id, metadata)
  values (p_user_id, p_bucket, p_amount, 'ADMIN_ADJUSTMENT', 'admin:' || gen_random_uuid()::text,
          jsonb_build_object('admin_user_id', auth.uid(), 'note', p_reason_note))
  returning id into v_ledger_id;

  insert into public.admin_audit_log (admin_user_id, action, target_user_id, amount, bucket, reason_note, metadata)
  values (auth.uid(), 'DUK_ADJUST', p_user_id, p_amount, p_bucket, p_reason_note, jsonb_build_object('ledger_id', v_ledger_id));

  return v_ledger_id;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 6. admin_list_audit_log — read the immutable audit trail (admin-only).
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_list_audit_log(p_limit integer default 100)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v from (
    select id, admin_user_id, action, target_user_id, amount, bucket, reason_note, created_at
    from public.admin_audit_log order by created_at desc limit greatest(1, least(p_limit, 500))
  ) t;
  return v;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 7. admin_get_consultation_audit — surface the server-owned decision AUDIT scalars for a conversation. Returns
--    versions/polarity/domain metadata ONLY. decision_meta is designed to carry NO prompt/question/answer/
--    chain-of-thought/birth data (see migration 20260829). No raw reasoning is exposed.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.admin_get_consultation_audit(p_conversation_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v from (
    select workload, answer_plan_version, decision_policy_version, engine_version, model_id, decision_meta, created_at
    from public.consultation_decisions where conversation_id = p_conversation_id order by created_at desc
  ) t;
  return v;
end; $$;

-- ---------------------------------------------------------------------------------------------------------------
-- Grants — all is_admin-gated; callable by authenticated (is_admin re-checked inside).
-- ---------------------------------------------------------------------------------------------------------------
revoke all on function public.admin_economy_overview(timestamptz, timestamptz) from public, anon;
revoke all on function public.admin_user_wallet(uuid) from public, anon;
revoke all on function public.admin_list_duk_ledger(uuid, text, integer) from public, anon;
revoke all on function public.admin_adjust_duk(uuid, integer, text, text) from public, anon;
revoke all on function public.admin_list_audit_log(integer) from public, anon;
revoke all on function public.admin_get_consultation_audit(uuid) from public, anon;
grant execute on function public.admin_economy_overview(timestamptz, timestamptz) to authenticated;
grant execute on function public.admin_user_wallet(uuid) to authenticated;
grant execute on function public.admin_list_duk_ledger(uuid, text, integer) to authenticated;
grant execute on function public.admin_adjust_duk(uuid, integer, text, text) to authenticated;
grant execute on function public.admin_list_audit_log(integer) to authenticated;
grant execute on function public.admin_get_consultation_audit(uuid) to authenticated;
