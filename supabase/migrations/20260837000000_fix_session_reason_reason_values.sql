-- ============================================================================
-- FIX (Owner Activation 04) — session_reason() returned constraint-INVALID ledger reasons.
--
-- BUG: public.session_reason(p_product) (migration 20260833000000) returned 'GENERAL_SESSION' /
-- 'COMPATIBILITY_SESSION', but public.duk_ledger.reason CHECK (migration 20260831000000) only allows the
-- session-spend reasons 'CONSULTATION' / 'COMPATIBILITY' / 'PREMIUM_REPORT' (see the column comment there).
-- commit_session_reservation() inserts a debit whose reason = session_reason(product_type); for 'general' and
-- 'compatibility' this violated duk_ledger_reason_check (SQLSTATE 23514). With DUK_BILLING_ENABLED=true EVERY
-- general and compatibility consultation would therefore FAIL at the atomic Duk commit (complete_consultation_
-- with_billing rolls back → chat Edge returns 503, no answer, no charge). Only premium_report ('PREMIUM_REPORT',
-- already valid) would have committed. Discovered by staging DB-integration commit probe (Activation 04).
--
-- FIX: return the constraint-valid reasons. FORWARD-ONLY, idempotent (create or replace). NO data migration
-- needed — billing was never enabled, so no duk_ledger row with an invalid reason exists (verified: staging
-- test-user ledger = 0 rows). commit_session_reservation() itself is UNCHANGED; only the value session_reason()
-- returns is corrected. The only caller/consumer of the old strings in the entire repo was session_reason()
-- itself (verified by repo-wide grep), so this change is fully isolated.
--
-- OWNER_APPLY_REQUIRED — apply to staging, re-run Activation 04 billing smoke, then production.
-- ============================================================================

create or replace function public.session_reason(p_product text) returns text
language sql immutable as $$
  select case p_product
    when 'general'        then 'CONSULTATION'
    when 'compatibility'  then 'COMPATIBILITY'
    when 'premium_report' then 'PREMIUM_REPORT'
    else 'CONSULTATION'
  end;
$$;
