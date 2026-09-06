-- ============================================================================
-- DeokbunAI — ACCOUNT DELETION (회원 탈퇴)
--
-- OWNER_APPLY_REQUIRED — staging first. Additive + idempotent + non-destructive to
-- OTHER users' rows. This migration creates ONE table and ONE service-role RPC.
--
-- WHY THIS EXISTS
--   The privacy policy already promises "이용자는 언제든지 … 회원 탈퇴를 할 수 있습니다"
--   (src/features/legal/legalContent.ts:80) and "회원 탈퇴 시 … 지체 없이 파기"(:74), but no
--   deletion path existed anywhere in the codebase. Apple additionally REQUIRES in-app
--   account deletion for any app that supports account creation (App Store Review 5.1.1(v)).
--
-- WHAT DELETES WHAT — the split matters, read this before changing anything
--   Deleting the `auth.users` row cascades to 36 tables that declare
--   `references auth.users (id) on delete cascade` (measured 2026-09-03 across all
--   migrations + docs/*.sql: 45 user-linked tables / 47 columns). That cascade is the
--   ACTUAL deletion mechanism and it is NOT performed here — the Edge Function
--   (`account-delete`) calls the auth admin API AFTER this RPC returns.
--
--   This RPC does the three things the cascade CANNOT do:
--     1. SNAPSHOT the transaction record before it is destroyed. `verified_purchases`,
--        `purchase_revocations`, `duk_ledger` and `duk_debt` are all CASCADE, so deleting
--        the auth row erases the payment history too. 전자상거래법 상 거래기록 보존 의무의
--        대상일 수 있어 지우기 전에 비식별 요약을 남긴다. (법적 보존기간 판단은 오너/법률
--        검토 항목 — 이 파일은 "지워지기 전에 남긴다"까지만 한다.)
--     2. RELEASE live duk holds. A RESERVED `duk_reserve` row is a hold, not a charge;
--        cascading it away silently would be fine for the user but would leave the
--        global spend guard's view of "held" inconsistent for the lifetime of the row.
--     3. CLEAN the FK-LESS tables. Three tables carry `user_id` with NO foreign key, so
--        the cascade never reaches them and they would keep an orphan user id forever:
--        `global_paid_generation_reservations`, `global_reservation_requests`, and
--        `ai_usage_logs` (whose FK exists only in the live out-of-band DDL, not in the
--        migration that records its shape — so we null it explicitly and are correct
--        under BOTH shapes).
--
-- WHAT IS DELIBERATELY LEFT
--   * `product_events.user_id` — FK is `on delete set null`. Already the anonymization we
--     want; analytics keeps the event, loses the person. No action.
--   * `admin_audit_log.target_user_id` — an ADMIN accountability record (who adjusted whose
--     wallet). No FK, so it survives. Once auth.users is gone the uuid resolves to nobody,
--     which is pseudonymization, not identification. Erasing it would destroy an audit trail
--     about an ADMIN, not about the user. Left intact.
--
-- IDEMPOTENCY
--   `account_deletions.user_ref` is UNIQUE. A second call for the same user returns
--   kind='ALREADY_RECORDED' and performs no writes, so the Edge can safely retry after a
--   failed auth-admin delete (the only crash window: snapshot written, auth row still alive).
--
-- PRIVACY OF THE RETENTION ROW
--   `user_ref` is sha256(user_id) — a UUID has ~122 bits of entropy, so the hash is not
--   reversible by enumeration, and it is NOT a link back to a person once auth.users is gone.
--   No email, no name, no birth data, no question text, no answer text is copied here.
-- ============================================================================

-- ── 1. retention + audit record (one table, no FK to auth.users on purpose) ──────────────
-- No FK: this row must OUTLIVE the auth row it describes. That is the whole point.
create table if not exists public.account_deletions (
  id                  uuid primary key default gen_random_uuid(),
  user_ref            text not null unique,          -- sha256(user_id); not reversible, not PII
  deleted_at          timestamptz not null default now(),
  requested_via       text not null default 'self_service'
                        check (requested_via in ('self_service', 'support', 'admin')),
  -- Balance snapshot at deletion (integers only — no ledger rows are copied).
  duk_balance_plus    integer not null default 0,
  duk_balance_reward  integer not null default 0,
  duk_balance_paid    integer not null default 0,
  unresolved_debt     integer not null default 0,
  -- 거래기록 요약. Empty array on every account that never purchased (IAP is not live yet,
  -- so this is `[]` for every real deletion today — by design, not by accident).
  purchase_record     jsonb not null default '[]'::jsonb,
  revocation_record   jsonb not null default '[]'::jsonb
);

create index if not exists account_deletions_deleted_at_idx
  on public.account_deletions (deleted_at desc);

-- RLS on, NO policies: the client can neither read nor write this table. Only the
-- service-role RPC below touches it. Admin reporting, if ever needed, goes through a
-- future is_admin()-gated RPC — not a client policy.
alter table public.account_deletions enable row level security;

comment on table public.account_deletions is
  '회원 탈퇴 감사 + 거래기록 보존. user_ref = sha256(user_id), 개인정보 없음. RLS 정책 없음(서비스롤 전용).';

-- ── 2. purge_account_data — everything the auth cascade cannot do ────────────────────────
create or replace function public.purge_account_data(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ref            text;
  v_plus           integer := 0;
  v_reward         integer := 0;
  v_paid           integer := 0;
  v_debt           integer := 0;
  v_purchases      jsonb   := '[]'::jsonb;
  v_revocations    jsonb   := '[]'::jsonb;
  v_released       integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_user_id is null then
    raise exception 'user id required' using errcode = '22023';
  end if;

  v_ref := encode(sha256(p_user_id::text::bytea), 'hex');

  -- Serialize per user, exactly as reserve_session_duk does (20260833000000). Two concurrent
  -- delete taps must not both snapshot-and-release.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- §IDEMPOTENCY. A retry after a failed auth-admin delete lands here and must be a no-op.
  if exists (select 1 from public.account_deletions where user_ref = v_ref) then
    return jsonb_build_object('kind', 'ALREADY_RECORDED', 'user_ref', v_ref);
  end if;

  -- ── snapshot balances (raw ledger, not spendable — a hold is not a loss) ───────────────
  select
    coalesce(sum(delta) filter (where bucket = 'PLUS'), 0),
    coalesce(sum(delta) filter (where bucket = 'REWARD'), 0),
    coalesce(sum(delta) filter (where bucket = 'PAID'), 0)
  into v_plus, v_reward, v_paid
  from public.duk_ledger
  where user_id = p_user_id
    and (expires_at is null or expires_at > now());

  select coalesce(sum(amount), 0) into v_debt
  from public.duk_debt
  where user_id = p_user_id and not resolved;

  -- ── snapshot the transaction record (거래기록) BEFORE the cascade destroys it ──────────
  -- Only the fields a transaction record needs. No user id, no email, no receipt blob.
  select coalesce(jsonb_agg(jsonb_build_object(
           'provider', provider,
           'external_transaction_id', external_transaction_id,
           'product', internal_product_key,
           'granted_duk', granted_duk,
           'at', created_at)), '[]'::jsonb)
  into v_purchases
  from public.verified_purchases
  where user_id = p_user_id;

  select coalesce(jsonb_agg(jsonb_build_object(
           'external_revocation_id', external_revocation_id,
           'external_transaction_id', external_transaction_id,
           'amount', amount,
           'reversed_duk', reversed_duk,
           'debt_created', debt_created,
           'at', created_at)), '[]'::jsonb)
  into v_revocations
  from public.purchase_revocations
  where user_id = p_user_id;

  insert into public.account_deletions (
    user_ref, duk_balance_plus, duk_balance_reward, duk_balance_paid,
    unresolved_debt, purchase_record, revocation_record
  ) values (
    v_ref, v_plus, v_reward, v_paid, v_debt, v_purchases, v_revocations
  );

  -- ── release live holds so the spendable view / spend guard stay consistent ─────────────
  update public.duk_reserve
     set status = 'RELEASED', version = version + 1, updated_at = now()
   where user_id = p_user_id and status = 'RESERVED';
  get diagnostics v_released = row_count;

  -- Abandon any still-open consultation session. The table cascades on delete, but this runs
  -- BEFORE the cascade and the session state machine is read by the guard in between.
  -- 'ABANDONED' — not 'COMPLETE' — because nothing was delivered; the status CHECK allows
  -- exactly ('OPEN','ACTIVE','COMPLETE','EXPIRED','ABANDONED') (20260832000000).
  update public.consultation_sessions
     set status = 'ABANDONED', updated_at = now()
   where user_id = p_user_id and status in ('OPEN', 'ACTIVE');

  -- ── FK-less tables the cascade will never reach ───────────────────────────────────────
  delete from public.global_paid_generation_reservations where user_id = p_user_id;
  delete from public.global_reservation_requests          where user_id = p_user_id;

  -- ai_usage_logs: the LIVE table (docs/admin/ADMIN_04_SETUP.sql) declares
  -- `on delete set null`, but the migration that records its shape (20260902000000)
  -- declares no FK at all. Nulling explicitly is correct under both and is idempotent.
  update public.ai_usage_logs set user_id = null where user_id = p_user_id;

  return jsonb_build_object(
    'kind', 'PURGED',
    'user_ref', v_ref,
    'released_reservations', v_released,
    'duk_balance', jsonb_build_object('plus', v_plus, 'reward', v_reward, 'paid', v_paid),
    'unresolved_debt', v_debt,
    'purchase_count', jsonb_array_length(v_purchases),
    'revocation_count', jsonb_array_length(v_revocations)
  );
end $$;

revoke all on function public.purge_account_data(uuid) from public, anon, authenticated;
grant execute on function public.purge_account_data(uuid) to service_role;

-- ── 3. account_deletion_preview — what the user is told BEFORE they confirm ──────────────
-- Runs as the CALLER (invoker, not definer) so RLS decides what it can see: a user can only
-- ever preview their own account. No user id parameter exists on purpose — auth.uid() is the
-- only input, so this cannot be pointed at somebody else.
create or replace function public.account_deletion_preview()
returns jsonb
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'duk_balance', coalesce((
      select sum(delta)::integer from public.duk_ledger
       where user_id = auth.uid() and (expires_at is null or expires_at > now())
    ), 0),
    'subject_count', coalesce((
      select count(*)::integer from public.consultation_subjects where user_id = auth.uid()
    ), 0),
    'consultation_count', coalesce((
      select count(*)::integer from public.conversations where user_id = auth.uid()
    ), 0),
    'report_count', coalesce((
      select count(*)::integer from public.consultation_reports where user_id = auth.uid()
    ), 0)
  );
$$;

revoke all on function public.account_deletion_preview() from public, anon;
grant execute on function public.account_deletion_preview() to authenticated;
