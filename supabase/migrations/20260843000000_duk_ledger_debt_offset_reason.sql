-- Sprint J6 — financial integrity fix (ADDITIVE, staging-first, OWNER_APPLY).
--
-- PRIORITY-0 bug: record_verified_purchase (20260834_iap.sql) offsets outstanding duk_debt from a newly-granted
-- PAID purchase by writing a ledger row with reason='DEBT_OFFSET', but 'DEBT_OFFSET' is NOT permitted by the
-- duk_ledger reason CHECK. So a paying user WITH prior debt would have the entire purchase transaction fail. This
-- migration WIDENS ONLY the reason CHECK to include 'DEBT_OFFSET'. It changes nothing else:
--   * spend order (PLUS->REWARD->PAID) — unchanged
--   * refund / revocation policy — unchanged (REVERSAL + duk_debt as before)
--   * reward-Duk / plus-Duk behavior — unchanged
--   * debt visibility, IAP verification authority — unchanged
--
-- Widening a CHECK is non-destructive: every existing reason stays valid; the new value is merely additionally
-- allowed. No existing row is invalidated. No data is migrated.

alter table public.duk_ledger drop constraint if exists duk_ledger_reason_check;

alter table public.duk_ledger add constraint duk_ledger_reason_check check (
  reason in (
    'WELCOME','CANDLE','BIRTHDAY','EVENT','PURCHASE','PLUS_GRANT',
    'CONSULTATION','COMPATIBILITY','PREMIUM_REPORT','REFUND','REVERSAL','ADMIN_ADJUSTMENT',
    'DEBT_OFFSET'
  )
);
