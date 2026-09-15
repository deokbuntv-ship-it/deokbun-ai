# OWNER ACTIVATION 04F — SERVER ANALYTICS + INSUFFICIENT_DUK CONTRACT

> Staging `aephpsiurgkvqcswyeie` only. Production `olvkpaldrwvtexxpoaag` never contacted. **Production mutations = 0.**
> Analytics is derived from committed business truth, never gates billing. Billing remains validated + ON.

## 1. Target Isolation
`MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (HEAD `baa1a96`, unchanged) · `ACTIVATION_WORKTREE_TARGET = aephpsiurgkvqcswyeie`
· `REMOTE_MUTATION_TARGET = aephpsiurgkvqcswyeie`. Production mutations = 0.

## 2. Server Analytics Architecture
Migration `20260839000000_server_analytics_derivation.sql` (applied to staging; schema_migrations=33). Server-authoritative
events are **derived from committed business truth** by AFTER triggers, not written inside the financial path:
- `duk_ledger` AFTER INSERT → `welcome_duk_granted` (WELCOME row) · `duk_committed` + `duk_spent` (session-price debit).
- `duk_reserve` AFTER INSERT/UPDATE → `duk_reserved` (RESERVED) · `duk_released` (→RELEASED).
- `consultation_sessions` AFTER INSERT/UPDATE → `session_started` · `session_turn_completed` (turn increment).

## 3. Outbox / Delivery Design (billing independence)
Each trigger body is wrapped in `BEGIN … EXCEPTION WHEN OTHERS THEN NULL` (a savepoint) and is `SECURITY DEFINER` (to
insert under product_events FORCE RLS, like `record_product_event`). Because the trigger is **AFTER** the business write and
its `product_events` insert runs in an exception-isolated subtransaction, an analytics failure can only roll back its own
insert — **never** the ledger/reserve/session row. No separate worker; no analytics inside `complete_consultation_with_billing`.
This satisfies §4/§6 (financial truth first; analytics best-effort, decoupled).

## 4. Welcome Analytics
`welcome_duk_granted` fires from the WELCOME ledger row (the server-authoritative grant, 04D). One WELCOME row per user
(partial unique index) → at most one event. DB-verified (rolled back). Will be LIVE on the next new-user onboarding.
`WELCOME_ANALYTICS = PASS`.

## 5. Session Analytics
`session_started` (session INSERT) + `session_turn_completed` (successful_turn_count increment). **LIVE-verified** —
a persisted general billing flow produced one of each in `product_events`. Replay does not increment the turn → no duplicate.
`SESSION_ANALYTICS = PASS`.

## 6. Duk Reserve Analytics
`duk_reserved` fires only on a real RESERVED insert (not on insufficient/safety/auth — those write no reserve row).
**LIVE-verified** (persisted flow). Replay returns the existing reservation (no new row) → no duplicate.

## 7. Duk Commit / Spend Analytics
`duk_committed` + `duk_spent` fire from the session-price debit (unique per (session_id, reason)). **LIVE-verified**
(persisted general flow: 1 each). Follow-up/replay create no new debit → no duplicate. Amount = 5 (general) / 12 (compat).

## 8. Duk Release / Exhausted Analytics
`duk_released` fires on RESERVED→RELEASED (DB-verified, rolled back). `duk_exhausted` — **NOT_IMPLEMENTED**: it overlaps
`INSUFFICIENT_DUK` and an insufficient attempt writes NO business-truth row to trigger on (the reserve returns INSUFFICIENT
without persisting). The insufficient state is covered by `compatibility_insufficient_duk` (client, §10). Documented distinction.

## 9. INSUFFICIENT_DUK Transport Contract
Fixed the collapse-to-REQUEST_FAILED. New chain (all additive):
- `parseInsufficientDuk(error)` (llmError.ts) reads the authoritative 402 body `{balance,required,shortfall}` from `error.context`.
- `supabaseEdgeConsultationAdapter` returns `{ok:false, error:'INSUFFICIENT_DUK', balance, required, shortfall}`.
- `ConsultationTransportResult` + `ChatServiceResult` + `CompatibilityChatResult` gained an `INSUFFICIENT_DUK` variant with
  `insufficientDuk:{balance,required,shortfall}` (server values only — never client-calculated).
- `consultationErrors` gained `INSUFFICIENT_DUK` (kind `insufficient`, canRetry false, top-up message).
`COMPATIBILITY_INSUFFICIENT_CONTRACT = PASS` (tsc 0; unit tests: 11/12/1 surfaces; generic-500 stays generic; auth stays auth).

## 10. Compatibility Insufficient Analytics
`compatibility_insufficient_duk` emitted from the compat service on `INSUFFICIENT_DUK`, props from **authoritative** server
values `{product:'compatibility', amount:required, duk_balance:available, duk_shortfall:shortfall}`. Non-blocking `.catch`.
Tested. `COMPATIBILITY_INSUFFICIENT_ANALYTICS = PASS`.

## 11. Privacy
`ANALYTICS_NO_PII = PASS`. Server triggers use only categorical/numeric keys (amount/bucket/reason/product/turn_count) from
tables that contain no PII; a DB probe confirmed zero forbidden keys. Client events use the allowlist; tests assert no
question/answer/name/email keys.

## 12. Failure Isolation
`ANALYTICS_FAILURE_NON_BLOCKING = PASS`. Server: exception-isolated AFTER triggers (proven by design — the financial row
commits regardless). Client: every emit is `void trackProductEvent(...).catch(()=>{})`; tests prove candle grant /
consultation success / INSUFFICIENT_DUK result are unaffected by an analytics rejection.

## 13. Replay / Dedup
`REPLAY_ANALYTICS_DEDUP = PASS`. Analytics inherits financial idempotency: one immutable business-truth row → one event.
Replays/follow-ups create no new ledger debit / reserve / turn increment (proven in 04C), so no duplicate outcome event.
Analytics rows are never used to enforce financial idempotency.

## 14. Test Coverage
New: `candleAnalytics.test.ts`, `consultationAnalytics.test.ts` (04E), `parseInsufficientDuk.test.ts`,
`compatibilityInsufficient.test.ts` (04F). Server triggers verified via rolled-back DB-integration + a persisted LIVE flow.
Regression: chat+compatibility+duk = **86 suites / 927 tests pass**.

## 15. Migration
`20260839000000_server_analytics_derivation.sql` — additive (3 trigger fns + 3 triggers). Dry-run showed only it pending;
applied to staging only (no reset/repair). Reviewed full SQL before apply.

## 16. Build / Regression
`tsc --noEmit` = 0 · 927 tests pass · frozen engine diff **ZERO** · consultation semantic diff ZERO (only additive
error-surfacing + fire-and-forget analytics; engines/decision/WHY/routing untouched).

## 17. Economy Diagnostics
All 11 invariants = **0 anomalies (PASS)** — before and after the persisted LIVE billing flow. Prices 5/12/50, spend order,
welcome 10, candle 1/24h unchanged.

## 18. Client Live Test Preparation
Server events are already LIVE-verified via the DB flow. The remaining CLIENT-emitted events (candle_lit,
consultation_started/completed, compatibility_insufficient_duk) need the real app emitter. ONE owner action closes it: run the
updated client against staging — new-user onboarding (→ welcome + server events) + candle + one consultation + a compatibility
attempt at insufficient balance — then I query `product_events`.

## 19. product_events Proof (this activation, LIVE persisted)
`duk_reserved`=1, `duk_committed`=1, `duk_spent`=1, `session_started`=1, `session_turn_completed`=1 (server-derived, real
rows). Safe property keys only (amount/bucket/reason/product/turn_count). No PII.

## 20. Frozen Core
`FROZEN_CONSULTATION_CORE = YES` — no engine/decision/evidence/WHY/routing/price change; changes are additive analytics +
error-surfacing in the chat/compat service + transport layers.

## 21. Final Flags
`DUK_BILLING_ENABLED = ON` · `GLOBAL_REQ_IDEMPOTENCY_ENABLED = ON` · Apple/Google absent.

## 22. Production Mutation Count
**0.** Staging got migration 20260839 + one persisted test billing flow (test data, retained per immutable-ledger policy).
Client TS changes are uncommitted in main.

## 23. BLOCKER
None.

## 24. HIGH
- **CLIENT_ANALYTICS_LIVE not real-app verified** — the client-emitted events are code-verified; a single app run against
  staging moves them to LIVE_VERIFIED (server events are already LIVE).

## 25. MEDIUM
- `duk_exhausted` NOT_IMPLEMENTED (overlaps INSUFFICIENT_DUK; no business-truth trigger point) — documented, low value.
- The compat/solo screens currently show the generic `insufficient` error copy; a dedicated top-up/paywall UI is future work
  (the authoritative balance is now on the result for when it's built).
- Terra unpriced in the cost model (carried).

## 26. Owner Action Required
Run the updated client app against staging (onboarding → candle → one consultation → compatibility at insufficient balance),
then I verify `product_events` receives candle_lit / consultation_started / consultation_completed / compatibility_insufficient_duk
(and welcome_duk_granted for the fresh user). That is the FINAL_CLIENT_ANALYTICS_SMOKE.

## 27. Ready For Store Sandbox?
Code + server analytics are complete and verified; only the client-emitter live run remains → **READY_FOR_FINAL_CLIENT_ANALYTICS_SMOKE** (not yet store sandbox).

---

### Exact verdicts
```
WELCOME_ANALYTICS                    = PASS
CANDLE_ANALYTICS                     = PASS
CONSULTATION_ANALYTICS               = PASS
SESSION_ANALYTICS                    = PASS
COMPATIBILITY_INSUFFICIENT_CONTRACT  = PASS
COMPATIBILITY_INSUFFICIENT_ANALYTICS = PASS
DUK_OUTCOME_ANALYTICS                = PASS (reserved/committed/spent/released; duk_exhausted NOT_IMPLEMENTED)
ANALYTICS_NO_PII                     = PASS
ANALYTICS_FAILURE_NON_BLOCKING       = PASS
REPLAY_ANALYTICS_DEDUP               = PASS
CLIENT_ANALYTICS_LIVE                = PARTIAL (server events LIVE_VERIFIED; client events CODE_VERIFIED, app run pending)
ECONOMY_DIAGNOSTICS                  = PASS
FROZEN_CONSULTATION_CORE             = YES
PRODUCTION_MUTATIONS                 = 0
```

Event classification (§28): `duk_reserved/duk_committed/duk_spent/session_started/session_turn_completed` = **LIVE_VERIFIED**;
`welcome_duk_granted/duk_released` = **CODE_VERIFIED** (DB-integration); `candle_lit/consultation_started/consultation_completed/compatibility_insufficient_duk`
= **CODE_VERIFIED** (jest); `duk_exhausted` = **NOT_IMPLEMENTED**.

**READY_FOR_FINAL_CLIENT_ANALYTICS_SMOKE** — the server-analytics outbox (business-truth-derived, exception-isolated,
non-blocking) and the INSUFFICIENT_DUK client contract are implemented, tested, and (server side) LIVE-verified; billing is
untouched and economy-clean. One owner app run closes the client-emitter live verification, after which store sandbox opens.

OWNER_ACTIVATION_04F_COMPLETE
