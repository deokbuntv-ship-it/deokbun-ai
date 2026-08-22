# OWNER ACTIVATION 04D — WELCOME + CLIENT ANALYTICS CLOSURE

> Staging `aephpsiurgkvqcswyeie` only. Production `olvkpaldrwvtexxpoaag` never contacted. **Production mutations = 0.**
> WELCOME runtime implemented + DB-verified. Client analytics audited — Duk/consultation funnel is NOT wired.
> Apple/Google sandbox NOT started.

## 1. Target Isolation
`MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (HEAD `baa1a96`, unchanged) · `ACTIVATION_WORKTREE_TARGET =
aephpsiurgkvqcswyeie` · `REMOTE_MUTATION_TARGET = aephpsiurgkvqcswyeie`. **Production mutations = 0.**

## 2. Welcome Architecture
Server-authoritative DB trigger (no client change needed for the grant). Migration
`supabase/migrations/20260838000000_welcome_duk_runtime.sql` (applied to staging; uncommitted in main):
1. Partial unique index `duk_ledger_welcome_uniq on duk_ledger (user_id) where reason='WELCOME'` — at most one
   WELCOME row per user (WELCOME rows carry null session_id/purchase_id so existing partial indexes don't apply).
2. `grant_welcome_on_consent()` SECURITY DEFINER trigger fn → inserts `+economy_policy.welcome_reward (10)` REWARD
   `reason='WELCOME'` with `ON CONFLICT DO NOTHING`.
3. Trigger `profiles_grant_welcome AFTER INSERT OR UPDATE OF terms_version ON profiles WHEN (new.terms_version IS
   NOT NULL)`.
Amount from policy (no client authority); immutable ledger; no direct balance UPDATE. **No engine/decision/
evidence/WHY/routing/price/candle/debt/spend-order change.**

## 3. Welcome Runtime Implementation
Trigger + index + function present on staging (verified). Eligibility = onboarding consent (terms_version set) —
the earliest reliable server-owned point; does **not** fire on plain sign-in (login updates that don't touch
terms_version don't fire it), and never grants because the client "claims" new-user (server observes the real
consent state change). **WELCOME_RUNTIME_IMPLEMENTED = PASS.**

## 4. Welcome Idempotency (DB-integration, rolled back)
On the existing user (0 WELCOME rows): first consent → **1** row, `+10 REWARD WELCOME`; re-consent (retry/
re-onboarding) → **still 1** (ON CONFLICT DO NOTHING); a later login-style update not touching terms_version →
trigger doesn't fire → **still 1**. The partial unique index guarantees at-most-one even under concurrent
onboarding (a second concurrent insert violates the index → no-op). **WELCOME_EXACTLY_ONCE = PASS;
WELCOME_CONCURRENT_IDEMPOTENCY = DB_INTEGRATION_ONLY** (index-guaranteed; true multi-connection not run). Live
count of WELCOME grants across all users = **0** (no retroactive grant to existing profiles — new users forward).

## 5. Welcome Live Staging Test
**PENDING OWNER** — needs a NEW staging user (I cannot create accounts). Harness ready:
`scripts/staging/welcome-gap-smoke.mjs` — signs in as the new user, sets terms_version (fires the WELCOME
trigger → +10), lights the candle (+1 → 11), then attempts compatibility → expects the Edge 402 gap. See §7–§9.

## 6. Same-Day Candle
Candle mechanism validated live in 04B (real RPC: +1 REWARD CANDLE, one-per-24h cooldown). The **welcome 10 →
candle 11** sequence for a fresh user is exercised by the pending harness (§5). Locked path preserved: signup 10 +
same-day candle 1 = 11; compatibility stays 12.

## 7. 11-Duk Compatibility Gap / ## 8. Edge-Level Insufficient Proof
**PENDING OWNER harness (new user)** — the harness's third step calls compatibility at 11 Duk and expects
**HTTP 402 `INSUFFICIENT_DUK`, required 12, available 11, shortfall 1, 0 LLM / 0 reservation / 0 debit**. This
closes the 04C MEDIUM (previously insufficient was only proven at reserve-RPC + Edge-code level: reserve returns
INSUFFICIENT at `index.ts:1130` before any LLM → 402 at `:1132`).

## 9. Client Analytics Inventory (§11)
Central emitter `src/services/productEvents.ts` (`trackProductEvent(name,{surface,properties})`) — **privacy-safe
(property allowlist; birth data/tokens/emails/answer text can never appear) and NON-BLOCKING (failure swallowed,
never affects UX)**. `ProductEventName` union = ~71 names; ~31 emitted. **Wired funnels:** onboarding, oauth,
today-fortune, monthly-fortune, popular-questions, notifications/retention, and the compatibility funnel
(`compatibility_started/result_viewed/…`).

## 10. Client Analytics Implementation — GAP
**Every Duk-economy + core-consultation event is DEFINED-ONLY (not emitted):** `welcome_duk_granted`,
`candle_lit`, `consultation_started`, `consultation_completed`, `session_started`, `session_turn_completed`,
`compatibility_insufficient_duk`, `duk_reserved`, `duk_committed`, `duk_spent`, `duk_released`, `duk_exhausted`.
§15 classification:
- **CLIENT-EMITTABLE (should be wired; currently not):** welcome_duk_granted, candle_lit, consultation_started,
  consultation_completed, session_started, session_turn_completed, compatibility_insufficient_duk.
- **SERVER-side outcomes (no emitter today, client can't authoritatively observe):** duk_reserved/committed/spent/
  released/exhausted — would need Edge-side `record_product_event`, currently **NOT-IMPLEMENTED**.

## 11. Privacy Validation
`ANALYTICS_NO_PII = PASS` — the allowlist in `productEvents.ts` structurally prevents PII in `properties`.

## 12. Client-Driven Live Analytics Test
**NOT DONE** — requires running the actual RN/Expo app on staging (I have no app runtime; the direct-Edge harness
bypasses client emission). Because the Duk/consultation events aren't wired (§10), they would not reach
`product_events` even from the app. `CLIENT_ANALYTICS_LIVE = PARTIAL`.

## 13. Analytics Failure Independence
`ANALYTICS_FAILURE_NON_BLOCKING = PASS` by code (`trackProductEvent` swallows all failures; billing/consultation
never depend on it). Live fault-injection = NOT_LIVE_TESTED (needs the app).

## 14. Economy Diagnostics
All 11 invariants = **0 anomalies (PASS)**; WELCOME grant count per user ≤ 1 (index-enforced); no negative wallet,
no duplicate candle, no orphan reservation.

## 15. Frozen Core
`tsc --noEmit` = 0 · duk suites **70/70** · frozen engine diff **ZERO** (`myungri`/`saju`/`ziwei`/`qimen`
untouched) · consultation semantic diff ZERO. The only change is the additive SQL migration 20260838.

## 16. Final Flags
`DUK_BILLING_ENABLED = ON` · `GLOBAL_REQ_IDEMPOTENCY_ENABLED = ON` · Apple/Google absent (unchanged).

## 17. Production Mutation Count
**0.** Main linked to production, HEAD `baa1a96` unchanged. Migration 20260838 applied to **staging only**
(uncommitted in main, pending owner review before any production apply).

## 18. BLOCKER
**None** (WELCOME implemented; billing validated).

## 19. HIGH
- **Client analytics Duk/consultation funnel not wired** (§10) — the monetization/consultation events are
  defined-only; they won't reach `product_events` even in-app. Closing needs: (a) client emission at the real UX
  transitions (candle success, consultation start/complete, session turn, compat insufficient, welcome observed),
  (b) a decision on the server-side `duk_*` billing events (Edge `record_product_event` or drop from scope), (c)
  a client-driven live-app verification. This is the remaining gate for store sandbox.
- **WELCOME live new-user proof pending** (§5/§7–§9) — implementation + idempotency are DB-verified; the live
  onboarding→10→candle→11→compat-402 proof needs an owner-created new staging user + the harness.

## 20. MEDIUM
- Terra unpriced in the cost model (carried).
- Existing production users would not receive WELCOME retroactively (trigger fires only on new consent events) —
  a backfill, if wanted, is a separate owner decision.

## 21. Owner Action Required
1. Create a NEW dedicated staging test user, then run
   `node C:\Development\DeokbunAI-staging-activation\scripts\staging\welcome-gap-smoke.mjs` and paste SAFE RESULTS
   → I verify welcome +10, candle → 11, and the Edge 402 gap from the DB (§5–§9).
2. Authorize a focused **client analytics wiring** task (client-emittable events + decide on server `duk_*`
   events) with an app-driven live verification (§10/§19).
3. Review + (later) apply `20260838` to production.

## 22. Ready For Store Sandbox?
**No — STORE_SANDBOX_BLOCKED.** WELCOME runtime is implemented and DB-verified, but its live new-user proof is
pending and the client Duk/consultation analytics funnel is not wired (the owner's explicit gate #2). Store
sandbox should not begin until both close.

---

### Exact verdicts
```
WELCOME_RUNTIME_IMPLEMENTED             = PASS
WELCOME_EXACTLY_ONCE                    = PASS
WELCOME_CONCURRENT_IDEMPOTENCY          = DB_INTEGRATION_ONLY
CANDLE_AFTER_WELCOME                    = PENDING_OWNER_HARNESS (candle mechanism PASS in 04B)
COMPATIBILITY_11_DUK_INSUFFICIENT_EDGE  = PENDING_OWNER_HARNESS (reserve/code-proven)
INSUFFICIENT_ZERO_LLM                   = PASS (reserve-RPC + Edge-code; live-Edge pending harness)
CLIENT_ANALYTICS_LIVE                   = PARTIAL (infra+funnels wired; Duk/consultation funnel not emitted)
ANALYTICS_NO_PII                        = PASS
ANALYTICS_FAILURE_NON_BLOCKING          = PASS (code); live sim NOT_LIVE_TESTED
ECONOMY_DIAGNOSTICS                     = PASS
FROZEN_CONSULTATION_CORE                = YES
PRODUCTION_MUTATIONS                    = 0
```

**STORE_SANDBOX_BLOCKED** — WELCOME 10-Duk runtime is implemented (server trigger + partial-unique idempotency)
and DB-verified, with a live new-user harness ready; but the client Duk/consultation analytics funnel is
defined-only (not wired), so the owner's analytics-closure gate is not met. Billing remains validated + ON;
production untouched.

OWNER_ACTIVATION_04D_COMPLETE
