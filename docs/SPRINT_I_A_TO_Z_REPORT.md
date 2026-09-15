# SPRINT I A→Z FINAL REPORT

Local Monetization Finalization → Apple/Google Server Billing Backend → Staging-Ready Release Package.
Autonomous, owner-away. Codex reserved for the post-staging Red Team.

## 1. Start / End HEAD
Start `70c4fa4` (Sprint H) → End `d6c2d02`. 5 commits, **not pushed**. Working tree clean (only owner-dirty
`supabase/config.toml` + `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md`).

## 2. Consultation Freeze
Frozen. `git diff 70c4fa4..HEAD` touches NO engine path and NO consultation decision-semantic file. All changes
are IAP / analytics / global-spend / Edge-seam (monetization only).

## 3. Global Request Idempotency — CLOSED (§4)
The Edge global reservation is now request-scoped when enabled: `reserveGlobalPaidGeneration(admin, userId,
workload, { requestId, idempotent })` → `reserve_global_paid_generation_idem` (migration 20260836) so one
logical request consumes at most one global slot across retries. Flag `GLOBAL_REQ_IDEMPOTENCY_ENABLED` (default
OFF → unchanged legacy). Ceilings/locking/kill-switch untouched. **DONE (local); LIVE_DB_UNVERIFIED.**

## 4. Analytics Privacy — CLOSED (§5/§6)
Direct-insert fallback is now DEV-ONLY (`__DEV__`); PRODUCTION never silently bypasses the validated RPC — a
missing RPC drops the event quietly. The revoke of the insert policy is a concrete migration (20260835). **DONE
(local)**; the remote revoke apply is the owner's step.

## 5. Apple Server Verification (§7-§10)
`apple.ts`: current architecture (signed JWS + Server API), NO legacy verifyReceipt. Cross-runtime JWS decode +
field validation (bundle / environment / transaction identity / revocation) with the x5c→Apple-root signature
check as an injected verifier (NOT_CONFIGURED default → never trusts). **PARTIAL** — decode+validate done; live
crypto **BLOCKED_EXTERNAL** (needs Apple config + real signed payloads).

## 6. Apple Notifications V2 (§11)
`processAppleNotificationV2` (verify outer+inner, dedupe key) + `apple-notifications-v2` Edge seam (rejects
unverified JSON; NOT_CONFIGURED → 503). NO V1. **PARTIAL / BLOCKED_EXTERNAL.**

## 7. Google Play Verification (§14-§17)
`google.ts`: Developer-API state mapping (legacy int + v2 enum), grant only PURCHASED, acknowledge only
PURCHASED+unacknowledged, orderId as external id. **PARTIAL** — logic done; live API **BLOCKED_EXTERNAL**.

## 8. Google RTDN (§18)
`decodeRtdn` (change-signal → requiresAuthoritativeFetch; package-mismatch fail-closed) + `google-rtdn` Edge
seam (authoritative refetch contract; NOT_CONFIGURED). **PARTIAL / BLOCKED_EXTERNAL.**

## 9. Purchase State Machine (§23)
`purchaseStateMachine.ts`: RECEIVED→VERIFIED→GRANT_PENDING→GRANTED / REVOKED / FAILED / RECONCILIATION_REQUIRED;
`planRetry` (response-loss replay, §25). **DONE.**

## 10. Purchase Atomicity (§24/§25)
`record_verified_purchase` (migration 20260834): external-id dedup + first-pack lifetime + debt offset + PAID
grant in one transaction; a replay grants once. **DONE; LIVE_DB_UNVERIFIED.**

## 11. Revocation / Duk Debt (§26/§27)
`record_revocation`: revocation-id unique → reverse PAID else create duk_debt, one effect. Debt policy unchanged
(never blocks CANDLE/BIRTHDAY/EVENT/REWARD; never auto-consumes PLUS). **DONE; LIVE_DB_UNVERIFIED.**

## 12. Billing Runtime Audit (§28)
DUK_BILLING_ENABLED OFF ⇒ byte-identical legacy path (verified by diff + edgeBillingWiring test). ON ⇒
AUTH→SAFETY→OWNERSHIP→SESSION→DUK RESERVE→GLOBAL→MODEL→LLM→VALIDATE→PERSIST+COMMIT→RESPONSE. No hidden paid
path bypasses Duk billing.

## 13. Global Spend Guard (§32/§33)
Duk + global are independent AND-gates; a user with Duk still can't exceed the global ceiling (reserve released
if global denies). Request-idempotency added (§3). Ceilings unchanged.

## 14. Reconciliation (§34/§35)
`planReserveReconciliation` (never releases COMMITTED; expires only stale RESERVED) + `planPurchaseReconciliation`
(GRANT/REVOKE/INVESTIGATE from provider truth). Dry-run planners; owner-runnable. **DONE (dry-run).**

## 15. Staging Harness (§37)
`scripts/staging/economy-e2e.mjs` (13-case plan for users A/B; --live = owner step) + `economy_diagnostics.sql`
(11 invariant queries) + `migration-preflight.mjs` (read-only chain/collision check). **READY.**

## 16. Migration Preflight (§52)
`migration-preflight.mjs` verifies the 8-migration monetization chain is present + ordered + free of conflicting
function redefinitions (no DB connection). Verified locally.

## 17-19. Owner Setup (§50/§51)
`docs/STORE_BILLING_OWNER_SETUP.md`: Apple + Google exact inputs (config names only, no fabricated IDs/keys) +
the Supabase migration sequence (20260829→…→20260836, 20260835 last) + the controlled staging activation
sequence + minor-purchase release blocker.

## 20. Benchmark Status (§41)
Dry-run confirmed: `BENCHMARK_HARNESS_READY` / `LIVE_BENCHMARK_BLOCKED_EXTERNAL`. Prices unchanged.

## 21. Tests by Verification Level
- UNIT: billingOrchestrator, walletCore, sessionBilling, candle, modelRouter, iapVerification, iapAdapters,
  purchaseStateMachine, dukClientContract.
- SIMULATION: concurrency/idempotency invariants (dukEconomyCore) — model of the DB contract.
- SQL-STATIC / SOURCE-ASSERTION: edgeBillingWiring, globalSpendGuard, migration contract review.
- LIVE SUPABASE / APPLE SANDBOX / GOOGLE LICENSE TEST: **not run** (BLOCKED_EXTERNAL).
Full suite: **167 suites / 1691 tests pass** (+45 this sprint).

## 22. TypeScript / Expo / Edge
tsc 0 · Expo web export exit 0 · chat bundle unchanged (no _server graph change), deterministic, node --check
OK, 0 secrets, 3 externals · new Edge seams (verify-purchase, apple-notifications-v2, google-rtdn) syntax-OK.

## 23. Frozen Diff — ZERO (engine + consultation decision semantics).

## 24. G1–G9
G1 FROZEN · G2 harness ready / live BLOCKED_EXTERNAL · G3 runtime-wired (flag-gated) + migrations + global
idempotency · G4 IAP server backend PARTIAL (decode/validate/atomicity/reconciliation done; live crypto/API
BLOCKED_EXTERNAL) · G5 request-idempotent · G6 mapping · G7 analytics production-safe (revoke migration ready) ·
G8 device/store E2E external · G9 later.

## 25. BLOCKER — none. ## 26. HIGH — none. ## 27. MEDIUM — provider verifier crypto/API bodies (need creds +
real payloads to implement+verify safely); §35 live purchase reconciliation (needs provider access).

## 28. BLOCKED_EXTERNAL
Live Apple JWS crypto verification, App Store Server API, Apple sandbox E2E; Google Developer API, RTDN live,
license-test E2E; live-DB verification of all Duk/IAP RPCs; live benchmark; remote migration apply; deploy.

## 29. LOCAL_AUTONOMOUS_WORK_REMAINING
**NO.** Everything closeable AND verifiable locally is closed. The remaining work (provider signature-crypto /
Developer-API bodies, live-DB, sandbox E2E) requires owner credentials + real store payloads to implement and
verify safely — it cannot be done blind without becoming untested crypto.

## 30. Owner Activation Sequence
See [STORE_BILLING_OWNER_SETUP.md](STORE_BILLING_OWNER_SETUP.md) §7 + [SPRINT_H_OWNER_ACTIONS.md](SPRINT_H_OWNER_ACTIONS.md):
preflight → apply migrations (staging) → diagnostics zero → deploy Edge (flag OFF) → smoke → flag ON (cohort) →
economy-e2e --live → configure Apple/Google + implement verifiers → sandbox/license E2E → apply 20260835 →
diagnostics zero → plan production. Then Codex red-team.

## 31. Local Commits
`e03ba31` Apple+Google verification adapters · `004ea42` global idempotency + analytics production-safe ·
`6f9e5b6` notification endpoints + staging harness/diagnostics + owner setup · `d6c2d02` global-guard test
update · (this report).

## Verdicts
- CONSULTATION_CORE_FROZEN: **YES**
- SESSION_BILLING_LOCAL: **DONE**
- GLOBAL_REQUEST_IDEMPOTENCY: **DONE** (local; LIVE_DB_UNVERIFIED)
- ANALYTICS_PRIVACY_LOCAL: **DONE**
- APPLE_SERVER_ADAPTER: **PARTIAL** (live crypto BLOCKED_EXTERNAL)
- APPLE_NOTIFICATION_V2: **PARTIAL** (BLOCKED_EXTERNAL)
- GOOGLE_SERVER_ADAPTER: **PARTIAL** (live API BLOCKED_EXTERNAL)
- GOOGLE_RTDN: **PARTIAL** (BLOCKED_EXTERNAL)
- PURCHASE_ATOMICITY: **DONE** (LIVE_DB_UNVERIFIED)
- REVOCATION_ATOMICITY: **DONE** (LIVE_DB_UNVERIFIED)
- RECONCILIATION: **DONE** (dry-run planners)
- STAGING_HARNESS: **READY**
- LIVE_DB: **UNVERIFIED**
- APPLE_SANDBOX: **UNVERIFIED**
- GOOGLE_LICENSE_TEST: **UNVERIFIED**
- LIVE_BENCHMARK: **BLOCKED_EXTERNAL**
- FROZEN_ENGINE_DIFF: **ZERO**

READY_FOR_OWNER_STAGING_ACTIVATION

SPRINT_I_A_TO_Z_COMPLETE
