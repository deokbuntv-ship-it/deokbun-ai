# SPRINT H A→Z FINAL REPORT

Duk Session Billing Runtime Wiring → IAP Server Authority → Monetization Release Hardening. Autonomous, owner-away.

## 1. Start / End HEAD
Start `e72c01e` (Sprint G) → End `5f56f12`. 6 commits, **not pushed**. Working tree clean (only owner-dirty
`supabase/config.toml` + `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md`).

## 2. Consultation Freeze Integrity
Frozen. `git diff e72c01e..HEAD` touches NO engine path and NO consultation decision-semantic file (build*,
answerPlan, decisionMeta, certaintyGuard, consultationSafety, modelRouter, polarityKernel, grounding). All
changes are the monetization wrapper (Duk/IAP/analytics) + flag-gated Edge integration.

## 3. Existing Schema Audit
Existing (G/F.1/E.1): duk_ledger/duk_debt/duk_reserve/spend_duk/grant_duk (20260831); economy_policy/
consultation_sessions/candle_state/events/plus/light_candle (20260832); complete_consultation_request_with_decision
(20260829). Missing (added H): reserve→commit→release flow, spendable-net-of-reserves, atomic session start,
atomic billing completion, IAP catalog/verification, global request-id dedup, analytics revoke.

## 4. Runtime Session Billing
Runtime-neutral orchestrator (billingOrchestrator.ts) enforces the §6 order; migration 20260833 adds
reserve_session_duk / release_session_reservation / commit_session_reservation / complete_consultation_with_billing
+ a duk_spendable view (balance minus active reserves). Edge wired flag-gated (DUK_BILLING_ENABLED, default OFF).
**DONE (code) / LIVE_DB_UNVERIFIED.**

## 5. First-Turn Charge
Atomic: complete_consultation_with_billing commits the reserve in the SAME transaction as the decision persist
(compat = paid-complete + commit). One product session → one charge_id. Reserve idempotent by request_id across
all statuses (post-commit replay creates no spurious hold). **DONE / LIVE_DB_UNVERIFIED.**

## 6. Follow-Up Entitlement
Active session resumes with no reserve/charge; success increments the turn; failed follow-up: no refund, no turn
consumed. Tested (billingOrchestrator.test.ts §15). **DONE.**

## 7. Reserve / Release / Commit
Reserve on first turn; commit atomic-in-persist; release on every pre-commit failure (rate/global/disabled/
apikey/LLM/persist). 'completed'/'processing' never release. **DONE.**

## 8. TTL / Fencing
duk_reserve.version fencing: commit only with matching version + not expired; COMMITTED never TTL-released;
reconciler expires only stale RESERVED. A late stale-version commit is rejected. Tested (sessionBilling). **DONE.**

## 9. Response-Loss / Retry
acquirePaidRequest replay ('completed') + reserve request_id idempotency + complete-*-with-billing replay-read →
no second LLM / reserve / debit / decision. **DONE (code) / LIVE_DB_UNVERIFIED.**

## 10. General Product — 5 DUK, gpt-5-mini (router unchanged). ## 11. Compatibility — 12 DUK, gpt-5.6-terra
(FULL_TERRA). Model routing from Sprint G; audit stamps modelId + routing policy.

## 12. Candle
light_candle() auth RPC (auth.uid, server time, atomic cooldown, one grant under concurrency); pure core tested.
**DONE / LIVE_DB_UNVERIFIED.**

## 13. Duk Debt / Refund
record_verified_purchase offsets debt from new PAID first; record_revocation reverses PAID else creates debt;
REWARD/CANDLE/BIRTHDAY unaffected; PLUS never auto-consumed. **DONE / LIVE_DB_UNVERIFIED.**

## 14. Global Spend Guard
Additive request-id dedup wrapper (20260836); ceilings/kill-switch unchanged. Edge activation owner-sequenced.
**PARTIAL** (migration ready; Edge switch pending).

## 15. IAP Backend / 16. Apple / 17. Google
purchaseVerification orchestration (server-authority, dedup by external id, first-pack lifetime); Apple/Google
verifier foundation (NOT_CONFIGURED without credentials, never a fake success); migration 20260834
(product_catalog/verified_purchases/revocations + record RPCs); verify-purchase Edge seam. **FOUNDATION /
BLOCKED_EXTERNAL** (provider verifiers + credentials pending).

## 18. Product Catalog
DUK_FIRST_20 (20/₩2,900 lifetime-once) / DUK_BASE_50 (50/₩9,900) / DUK_LARGE_120 (120/₩19,900) / PLUS_MONTHLY
(TBD). Server-owned amounts; store ids not finalized.

## 19. PLUS Foundation
plus_entitlements (G); PLUS never changes model/answer. Price + grant TBD.

## 20. Analytics Privacy
record_product_event RPC (F.1) + RPC-first client; STEP-2 revoke is now a concrete migration (20260835); client
fallback release-gated (ANALYTICS_INSERT_FALLBACK_ENABLED). **PARTIAL / RELEASE_BLOCKED** until 20260835 applied.

## 21. Analytics Funnel
Monetization events on the validated RPC path; compat-gap probe intact; no PII.

## 22. Benchmark Status
`BENCHMARK_HARNESS_READY` / `LIVE_BENCHMARK_BLOCKED_EXTERNAL` (no key). Dry-run zero-spend verified.

## 23. Migrations
Additive, OWNER_APPLY, no overlap, no remote apply: 20260833 (session runtime), 20260834 (IAP), 20260835
(analytics revoke), 20260836 (global request-id). Plus the prior 20260829-20260832.

## 24. Tests
**166 suites / 1672 tests pass** (+27 H: billingOrchestrator 11, edgeBillingWiring 6, iapVerification 6,
dukClientContract 4). Labeling: UNIT (orchestrator/core), SQL-STATIC (migration review), SOURCE-ASSERTION (Edge
wiring), LIVE-DB-INTEGRATION = deferred (LIVE_DB_UNVERIFIED).

## 25. TypeScript — 0 errors. ## 26. Expo — web export exit 0. ## 27. Edge Bundle — unchanged (no _server graph
change), deterministic, node --check OK, 0 secrets, 3 externals. ## 28. Frozen Diff — ZERO.

## 29. G1–G9
G1 FROZEN (remote E2E pending) · G2 harness ready / live BLOCKED_EXTERNAL · G3 runtime-wired (flag-gated) +
migrations · G4 IAP server-authority FOUNDATION / BLOCKED_EXTERNAL · G5 partial + global request-id migration ·
G6 mapping · G7 analytics RELEASE_BLOCKED on STEP-2 revoke · G8 device/store E2E external · G9 later.

## 30. BLOCKER — none (autonomous-fixable). ## 31. HIGH — none new. ## 32. MEDIUM — global-reserve Edge switch
(owner-sequenced); provider verifier implementation. ## 33. BLOCKED_EXTERNAL — live benchmark, live-DB
verification, Apple/Google products + credentials, remote migration apply, deploy.

## 34. Owner Action Bundle
See [SPRINT_H_OWNER_ACTIONS.md](SPRINT_H_OWNER_ACTIONS.md) — DB migrations (staging→prod), analytics revoke,
Edge deploy + DUK_BILLING_ENABLED ordering, benchmark, IAP credentials/verifiers, minor-purchase verification.

## 35. Local Commits
`6308665` session runtime · `3c69b55` Edge wiring · `124fff3` IAP · `e41d102` analytics/global · `81d8fc3`
client contract · `5f56f12` docs.

## 36. Recommended Sprint I
Owner applies migrations in staging → run the live-DB billing integration test suite (LIVE-DB-INTEGRATION) →
implement Apple/Google verifiers + sandbox E2E → run the live benchmark + set POLICY VALUES → then Codex
red-team the payment/security surface.

## Verdicts
- CONSULTATION_CORE_FROZEN: **YES**
- SESSION_BILLING_RUNTIME: **DONE** (code; LIVE_DB_UNVERIFIED, flag-gated)
- FIRST_TURN_ATOMIC_CHARGE: **DONE** (LIVE_DB_UNVERIFIED)
- FOLLOWUP_ENTITLEMENT: **DONE**
- RESERVE_FENCING: **DONE**
- GLOBAL_REQUEST_IDEMPOTENCY: **PARTIAL** (migration ready; Edge switch owner-sequenced)
- CANDLE_RUNTIME: **DONE** (LIVE_DB_UNVERIFIED)
- DUK_DEBT_RUNTIME: **DONE** (LIVE_DB_UNVERIFIED)
- IAP_SERVER_VERIFICATION: **FOUNDATION** (provider verifiers BLOCKED_EXTERNAL)
- PURCHASE_IDEMPOTENCY: **DONE** (LIVE_DB_UNVERIFIED)
- REVOCATION_IDEMPOTENCY: **DONE** (LIVE_DB_UNVERIFIED)
- ANALYTICS_PRIVACY: **PARTIAL** (STEP-2 revoke owner-gated)
- LIVE_BENCHMARK: **BLOCKED_EXTERNAL**
- LIVE_DB_VERIFICATION: **BLOCKED_EXTERNAL**
- FROZEN_ENGINE_DIFF: **ZERO**

SPRINT_H_A_TO_Z_COMPLETE
