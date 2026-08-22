# SPRINT G A→Z FINAL REPORT

Final Frozen Consultation Core → Model Routing + Cost Benchmark + Duk Economy Backend. Autonomous, owner-away.

## 1. Start / End HEAD
Start `7ee8880` (Sprint F.1) → End `8f161dd`. 5 commits, **not pushed**. Working tree clean (only owner-dirty
`supabase/config.toml` + `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md`, untouched).

## 2. Consultation Freeze Integrity
Frozen. `git diff 7ee8880..HEAD` touches **no** engine path (`myungri`/`interpretation/saju`/`ziwei`/`qimen`)
and **no** consultation decision-semantic file (buildServerConsultation, answerPlan, decisionMeta, certaintyGuard,
consultationSafety, polarityKernel, grounding). Only integration/billing/model-routing changed.

## 3. Model Routing
- **Current (before):** all chat workloads used one env `gpt-5-mini`.
- **Implemented:** server-owned `resolveModelRoute(workload)` (`modelRouter.ts`, `MODEL_ROUTING_POLICY_VERSION`),
  wired in the Edge; client model ids ignored; modelId stamped into decisionMeta audit + ai_usage_logs cost.
- **Mini:** general consultation + follow-up + today + monthly + summary → `gpt-5-mini`.
- **Terra:** compatibility (FULL_TERRA default) + deep/specific-period/premium seams → `gpt-5.6-terra`. PLUS
  never changes the model.

## 4. Benchmark
- **Live status:** `BENCHMARK_HARNESS_READY` / `LIVE_BENCHMARK_BLOCKED_EXTERNAL` (no local key; live = owner-gated
  spend). Dry-run zero-spend verified.
- **Mini/Terra 1/3/5-turn:** measured on live run (harness drives the Edge, reads real `ai_usage_logs`).
- **Cache ratio / session costs:** computed by the analysis pass (cache_hit_ratio, incremental cost/turn,
  session USD+KRW) from measured rows.
- **Pricing:** official contract metadata (`pricing.official.json`: mini 0.25/0.025/2.00, terra 2.00/0.20/12.00
  USD per 1M; pricing_as_of 2026-08-22) — benchmark-only, never business logic. FX runtime-configurable.
- **Premium:** `PREMIUM_LLM_PATH_NOT_YET_AVAILABLE` (deterministic composer; no LLM path).
- **Economy recommendation:** `INSUFFICIENT_DATA` (needs the live run).

## 5. Duk Policy
V1 LOCKED values seeded in `economy_policy` (economy@1.0.0): WELCOME 10, CANDLE +1/24h (signup-day immediate),
BIRTHDAY 5, GENERAL 5, COMPATIBILITY 12, PREMIUM 50, session 5 turns / 24h TTL, D1–D7 accel OFF, events OFF.
Unchanged this sprint.

## 6. Wallet / Ledger
Append-only `duk_ledger` + `duk_balance` view + three buckets (PLUS/REWARD/PAID), spend priority
PLUS→REWARD→PAID (F.1 migration `20260831`). Pure `walletCore` locks the allocation contract; client
`getWalletState()` READS only (no spend/grant/reserve verb exists on the client).

## 7. Atomic Spend
`spend_duk` RPC (single transaction, advisory lock, fixed allocation, non-negative, idempotent by
`(session_id, reason)`) — F.1 migration. Pure contract + concurrency simulations in `dukEconomyCore.test.ts`.
**DONE** as backend; LIVE_DB_UNVERIFIED (no local Postgres).

## 8. Session Billing
Pure `sessionBilling` core: charge once on first success, no charge turns 2–5, no refund on later-fail/TTL/quit,
safety hard-stop never burns a paid turn. `consultation_sessions` table + `charge_id` identity. **PARTIAL** —
backend + contract + tests done; wiring reserve/commit into the Edge billing order is the next build step.

## 9. Reserve TTL / Fencing
`duk_reserve` (RESERVED→COMMITTED/RELEASED/EXPIRED, version fencing); `commitReserve`/`reconcileExpired` prove a
stale worker cannot commit after reuse and COMMITTED is never TTL-released. Tested.

## 10. Candle / Rewards
`light_candle()` auth RPC (atomic cooldown, server-time, idempotent concurrent-grant-once) + pure `candle` core
+ client `lightCandle()`. Birthday/event are table + policy foundations (events OFF by default). **DONE**
(LIVE_DB_UNVERIFIED).

## 11. Duk Debt / Refund
`duk_debt` (obligation, never negative balance); `applyPurchaseWithDebt` (new PAID clears debt first, never
touches REWARD/PLUS); `grant_duk` idempotent by `purchase_id`; unique `revocation_id`. Contract + tests. **DONE**.

## 12. Purchase / IAP Foundation
`BillingAdapter` interface (verify/restore/processServerNotification/grant/revoke/resolveSubscription) —
server-authority, client-untrusted, idempotent by external id. No store products created. **FOUNDATION**.

## 13. PLUS Foundation
`plus_entitlements` table; PLUS never changes model or answer quality; price + monthly Duk TBD. Foundation only.

## 14. Analytics / Privacy
Server-validated `record_product_event` RPC + RPC-first client (F.1); monetization event names added (G).
**PARTIAL / RELEASE_BLOCKED**: the direct-insert policy revoke (migration `20260830` STEP 2) must be applied
after the RPC client is fully deployed.

## 15. Compatibility Gap Analytics
`compatibility_insufficient_duk` carries duk_balance_at_entry / duk_shortfall / per-bucket balances /
prior_consultation_count / days_since_signup (allowlisted). `home_compatibility_impression` +
`first_action_after_onboarding` distinguish IA vs click vs Duk-gap failure. No PII.

## 16. UI Contracts
Wallet data hooks (`getWalletState`/`getCandleAvailability`/`lightCandle`) + payment-failure UX states
documented (§AO/§AP). No UI redesign this sprint (per scope).

## 17. Policy / Terms Mapping
Delta documented (`SPRINT_G_MONETIZATION_INTEGRATION.md` §AR): buckets, spend order, session charge, TTL,
refund/revocation, debt, outage, termination, PLUS. Korean legal text = owner/counsel.

## 18. Migrations
Additive, OWNER_APPLY, no overlap: `20260829` (decisions), `20260830` (analytics RPC + STEP 2 revoke), `20260831`
(ledger/debt/reserve/spend_duk/grant_duk), `20260832` (economy_policy/sessions/candle/events/plus + light_candle).
No remote apply.

## 19. Tests
**162 suites / 1645 tests pass** (+33 this sprint: modelRouter 8, dukEconomyCore 20, dukWalletService 5).

## 20. TypeScript / Expo / Bundle / Preflight
tsc **0** · Expo web export **exit 0** · bundle regenerated deterministically, `node --check` OK, 0 secrets, 3
externals, `덕분이` (0 덕분AI) · **PREFLIGHT PASS**.

## 21. Frozen Engine Diff
**ZERO** (engine + all consultation decision-semantic files untouched).

## 22. G1–G9 Release Gate Status
G1 Consultation Core **FROZEN** (remote E2E pending) · G2 **HARNESS FINALIZED / LIVE BLOCKED_EXTERNAL** · G3
**BACKEND CORE + MIGRATIONS + WALLET SERVICE** (Edge wiring + apply pending) · G4 IAP **FOUNDATION /
BLOCKED_EXTERNAL** · G5 **PARTIAL + per-model attribution feasible** · G6 mapping ready · G7 **server schema
(RELEASE_BLOCKED on STEP 2 revoke)** · G8 device E2E owner · G9 not in scope.

## 23. BLOCKER
None (autonomous-fixable). IAP + analytics-revoke + migration-apply + live-DB are owner/external.

## 24. HIGH
None new. Analytics full enforcement remains RELEASE_BLOCKED on the owner STEP-2 revoke (G7).

## 25. MEDIUM
- Session-billing Edge wiring (reserve/commit into the atomic completion RPC) — next build step.
- §N global request-id idempotency fix (owner coupled migration+deploy, from F.1).
- Global spend guard monthly window + per-model attribution (now feasible via the router).

## 26. BLOCKED_EXTERNAL
Live benchmark (no key), IAP store products (Apple/Google), remote migration apply, live-DB verification of the
Duk RPCs, production/staging deploy.

## 27. Owner Actions
1. Apply migrations `20260829`/`20260830`(+STEP 2 revoke)/`20260831`/`20260832` in staging, verify RLS/RPC, then
   prod. 2. Redeploy the `chat` Edge (regenerated bundle: model routing + summary safety + implicit-winner).
3. Set `LLM_MODEL_TERRA` to the real Terra id; run the live benchmark → set POLICY VALUES. 4. Build the
   session-billing Edge wiring (spend_duk/reserve in the billing order) + the IAP verification Edge. 5. Verify
   minor-purchase policy before IAP launch.

## 28. Local Commits
`c9f5e7a` model routing · `4780c8e` benchmark harness · `4510c7e` duk backend core + migration · `1bc68a4`
analytics events + billing adapter · `8f161dd` integration docs + release gate.

## 29. Recommended Sprint H
Wire session billing into the Edge (spend_duk/reserve/commit inside the atomic completion RPC, with the exact
AUTH→SAFETY→…→COMMIT order); build the IAP verification Edge + real store products; run the live benchmark and
set POLICY VALUES; apply the analytics STEP-2 revoke; then Codex red-team the payment/security surface.

## Verdicts
- CONSULTATION_CORE_FROZEN: **YES**
- MODEL_ROUTING_IMPLEMENTED: **YES**
- MINI_GENERAL: **YES**
- TERRA_COMPATIBILITY: **YES**
- LIVE_BENCHMARK: **BLOCKED_EXTERNAL**
- DUK_LEDGER: **DONE** (LIVE_DB_UNVERIFIED)
- ATOMIC_SPEND: **DONE** (LIVE_DB_UNVERIFIED)
- SESSION_BILLING: **PARTIAL** (backend done; Edge wiring pending)
- CANDLE: **DONE** (LIVE_DB_UNVERIFIED)
- DUK_DEBT: **DONE**
- ANALYTICS_PRIVACY: **PARTIAL** (RPC ready; STEP-2 revoke owner-gated)
- IAP_SERVER_AUTHORITY: **FOUNDATION**
- FROZEN_ENGINE_DIFF: **ZERO**

SPRINT_G_A_TO_Z_COMPLETE
