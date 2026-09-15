-- ============================================================================
-- DeokbunAI — FIX (H7): a price that spans TWO buckets could never be committed
--
-- Owner-approved 2026-09-06. Applied to STAGING first; production reflection follows the normal
-- approval path (OWNER_TODO A0). Index-only: NO price change, NO policy change, NO function change.
--
-- THE BUG. `commit_session_reservation` (20260833000000) writes ONE ledger debit PER ALLOCATED BUCKET:
--
--     if alloc_plus   > 0 then insert ... ('PLUS',   -alloc_plus,   session_reason(product_type), session_id, ...)
--     if alloc_reward > 0 then insert ... ('REWARD', -alloc_reward, session_reason(product_type), session_id, ...)
--     if alloc_paid   > 0 then insert ... ('PAID',   -alloc_paid,   session_reason(product_type), session_id, ...)
--
-- but `duk_ledger_session_reason_uniq` (20260831000000) is UNIQUE on (session_id, reason) alone. Two
-- allocated buckets therefore produce two rows with the SAME key → 23505 → the whole transaction rolls
-- back. Measured 2026-09-06 on staging (RPC called directly, no LLM):
--
--     general 5덕        REWARD 10            → 200 true      REWARD 3  + PAID 20  → 409 23505
--     compatibility 12덕  REWARD 20            → 200 true      REWARD 10 + PAID 50  → 409 23505
--     premium 50덕        REWARD 60            → 200 true      REWARD 10 + PAID 100 → 409 23505
--
-- Live, the Edge answers 503 AFTER the model has already run (ai_usage_logs: status=success,
-- total_tokens=7803) — we pay the cost, the reader gets nothing, and 0덕 is charged (release is correct).
--
-- WHY THE INDEX IS THE DEFECT, NOT THE FUNCTION. The index comment states its purpose: "one session-price
-- debit per (session_id, reason): the first-turn commit cannot double-charge on retry." Per-bucket rows are
-- the DESIGN (a spend must be attributable to the bucket it came out of — `duk_balance` and `duk_spendable`
-- both group by bucket). So the key was simply missing its third column. Adding `bucket` keeps the
-- anti-double-charge guarantee exactly: a second debit for the same session + reason + bucket is still
-- rejected, which is the only thing a retry could produce.
--
-- WHY THIS WAS INVISIBLE. Signup grants 10덕 to REWARD, so an account with ONLY the welcome grant covers a
-- 5덕 consultation from one bucket. Every QA / minipack / dev account was in that state. The failing state —
-- "REWARD remains but the price exceeds it" — is the DEFAULT state of a user who has PURCHASED Duk, and IAP
-- is still closed. Staging evidence at migration time: all 364 session-scoped ledger rows are bucket=REWARD.
--
-- SAFETY / IDEMPOTENCE
--   * Widening a unique key can never be violated by data that satisfied the narrower one. Verified on
--     staging anyway before applying: 0 duplicates on (session_id, reason) AND on (session_id, reason, bucket).
--   * DROP-then-CREATE, in that order, both guarded. Re-running is a no-op. (Creating first under the old
--     name would silently keep the old definition, since `if not exists` matches on NAME.)
--   * The old name is retired rather than reused: `..._session_reason_uniq` would now understate the key.
--     `20260831000000` keeps its original statement as history — this file supersedes it.
--   * `create index` (not concurrently) is correct here: it must be transactional with the drop, and the
--     table is small. A concurrent build cannot run inside the migration transaction.
--
-- NOT CHANGED, DELIBERATELY. `commit_session_reservation` does not re-verify that
-- alloc_plus + alloc_reward + alloc_paid = amount before writing the debits. `reserve_session_duk` DOES
-- enforce it at allocation time (`if v_need <> 0 then raise exception 'allocation_mismatch'`), and
-- duk_reserve rows are written nowhere else, so the invariant holds by construction. Re-declaring a money
-- function to add a defence against unreachable data would mean retyping its whole body — a worse risk than
-- the gap it closes. Recorded in docs/PAID_PATH_MATRIX.md instead.
-- ============================================================================

drop index if exists public.duk_ledger_session_reason_uniq;

-- One session-price debit per (session_id, reason, BUCKET). A spend that draws on two buckets is two rows —
-- that is the ledger's design — while a retry of the same charge is still rejected, which is what the
-- original index existed for.
create unique index if not exists duk_ledger_session_reason_bucket_uniq
  on public.duk_ledger (session_id, reason, bucket) where session_id is not null;

comment on index public.duk_ledger_session_reason_bucket_uniq is
  'H7 (2026-09-06): supersedes duk_ledger_session_reason_uniq. Per-bucket debits are the design; the key '
  'must include bucket or a two-bucket price can never commit. Anti-double-charge is unchanged.';
