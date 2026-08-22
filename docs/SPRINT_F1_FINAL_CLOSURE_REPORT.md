# SPRINT F.1 FINAL CLOSURE — REPORT

Consultation Core Final Closure → Duk Economy Implementation Readiness. Autonomous, owner-away.

| # | Item | Result |
|---|---|---|
| 1 | **START HEAD** | `887f7d7` (Sprint F end) |
| 2 | **END HEAD** | `a5e2daf` (6 F.1 commits, not pushed) |
| 3 | **Commits** | `8a83e84` implicit-winner · `e232e70` summary safety · `b7a373b` compat auth/single-flight · `b737f66` analytics server-schema + lease/global doc · `0ee4cd7` duk invariants + release sub-gates · `a5e2daf` product-events test update |
| 4 | **Implicit winner status** | **CLOSED.** `containsWinnerClaim` now catches implicit selection/recommendation/direction/weighting/comparative-preference/avoidance (hedge-aware, structure-anchored) + a structural `WINNER_FIELD` guard rejects winner/rank/score JSON fields. Corpus: 32 unsafe rejected, 11 describe-each safe accepted, one-regeneration→fallback preserved (`implicitWinnerCorpus.test.ts`). Wired for COMPARISON/RANKING intents in both solo + compatibility. |
| 5 | **Summary safety status** | **CLOSED.** Safety precedes spend for the summary workload: `summaryContainsHardStop` classifies the source (turns + prior summary) BEFORE `acquirePaidRequest`; a crisis summary reserves nothing, calls no LLM, keeps the prior summary. `summarySafetyBeforeSpend.test.ts`. |
| 6 | **Main auth status** | Auth precedes conversation creation (Sprint F §B); unchanged and green. |
| 7 | **Compatibility auth status** | **CLOSED (§J).** The compat service reads LIVE auth via a per-render ref (no stale closure); a login while mounted is seen immediately. `compatibilityConcurrencyAuth.test.ts`. |
| 8 | **Compatibility single-flight** | **CLOSED (§K).** Synchronous `sendingRef` lock + a pure `createSingleFlight` conversation creator: concurrent sends share ONE createConversation; failed attempt retries. |
| 9 | **Cross-owner status** | Enforced (E.2): a supplied cross-owner conversationId → `CONVERSATION_FORBIDDEN` before reserve/LLM. Compatibility sends no client conversationId; client creation is RLS-owner-scoped. |
| 10 | **Paid lease / fencing** | **INVARIANT HOLDS (§M).** Lease TTL 300s > platform runtime; completion fenced by `lease_token` (only the owner completes). Documented; no change needed. `RUNTIME_LEASE_GLOBAL_IDEMPOTENCY.md`. |
| 11 | **Global request idempotency** | **GAP DOCUMENTED (§N).** Per-request idempotency runs before the global reserve, so common retries don't re-consume. Narrow kill-mid-flight residual + a backward-compatible `p_request_id` fix specified for the owner (coupled migration+deploy; not shipped to avoid breaking the deployed RPC). |
| 12 | **Duk wallet contract** | **EXPLICIT (§O/§P).** Identities (user/session/request/charge/purchase/revocation + cardinality); spend = single locked RPC, fixed PLUS→REWARD→PAID allocation, append-only ledger, non-negative, request/charge uniqueness. `spend_duk` drafted. |
| 13 | **Session charge contract** | **EXPLICIT (§Q).** Reserve on first turn → commit exactly once on first success; turns 2–5 no charge; later-fail/TTL/quit no refund; retry no dup (unique `(session_id,reason)`/`charge_id`). |
| 14 | **Reserve TTL contract** | **EXPLICIT (§R).** RESERVED→COMMITTED/RELEASED/EXPIRED, terminal-once; COMMITTED never auto-released; expiry uses version fencing. `duk_reserve` table drafted. |
| 15 | **Duk debt contract** | **EXPLICIT (§S).** Debt never blocks CANDLE/BIRTHDAY/EVENT/REWARD/PLUS; offsets only future PAID_DUK; unique `purchase_id`/`revocation_id` → grant-once / reverse-once. `grant_duk` idempotent. |
| 16 | **Analytics privacy** | **SERVER ENFORCEMENT DRAFTED (§T).** `record_product_event` SECURITY DEFINER RPC (event-name+surface+mode+property-key/type/length validation); client is RPC-first with a transition-only fallback; STEP 2 revoke = owner. `productEventsPrivacy.test.ts`. |
| 17 | **Initial compatibility gap** | **PRESERVED (§V).** 10 WELCOME → +1 signup-day candle → 11 → +1 D1 candle → 12 → compatibility. No free trial; D1–D7 accel default OFF. Unchanged. |
| 18 | **LLM routing policy** | **PRESERVED (§W).** All chat = `gpt-5-mini` today; target Mini(general)/Terra(compat·deep·report) is workload-based (never membership-based). Terra has no repo model id (owner-gated). No swap made. |
| 19 | **Benchmark harness** | **READY, NOT RUN (§X).** Measures Mini general + Terra compat at 1/3/5 turns via real `ai_usage_logs`; deep = specificTiming fixture present; premium report excluded (no LLM path). No local key → `LIVE_BENCHMARK_NOT_EXECUTED`. |
| 20 | **Release Gate G1–G9** | Updated with 12 F.1 sub-gates. G1 **FINAL FREEZE APPROVED**; G2 harness-ready; G3 contract+RPC draft; G4 spec; G5 partial(live); G6 map done; G7 contract+server-enforcement drafted; G8/G9 owner. `V1_RELEASE_GATE.md`. |
| 21 | **Test results** | **159 suites / 1612 tests — all pass** (+63 F.1). |
| 22 | **Typecheck** | `tsc --noEmit` — **0 errors**. |
| 23 | **Edge bundle** | Regenerated, **deterministic**, `node --check` OK, 0 secrets, `덕분이` (0 덕분AI), 3 externals, F.1 symbols present, committed + current (no stale diff). |
| 24 | **Frozen engine diff** | **ZERO** (`myungri` / `interpretation/saju` / `ziwei` / `qimen` untouched since `887f7d7`). |
| 25 | **BLOCKER** | 0 |
| 26 | **HIGH** | 0 in consultation core (implicit-winner + summary-safety fixed). Analytics PII HIGH: enforcement mechanism shipped in code + migration; **full closure needs the owner to apply the migration + STEP 2 revoke** (G7 item, not a consultation-core blocker). |
| 27 | **MEDIUM** | §N global request-id idempotency (owner coupled migration+deploy); analytics STEP 2 revoke (owner); global spend guard monthly + per-model (owner build); all documented. |
| 28 | **Owner-only actions** | (a) apply migrations `20260829000000` (decisions), `20260830000000` (analytics RPC) + STEP 2 revoke, `20260831000000` (duk foundation) after staging validation; (b) redeploy `chat` Edge (regenerated bundle: implicit-winner + summary safety); (c) run the live benchmark → set POLICY VALUES + map Terra→model id; (d) build the Duk wallet under the locked contract + IAP receipt Edge; (e) apply the §N global request-id fix (coupled). |

## Verdicts

**CONSULTATION_CORE_V1_FINAL_FREEZE_APPROVED** — implicit-winner authority eliminated, safety-before-spend holds
for every LLM workload (consultation, compatibility, summary), compatibility auth + single-flight hardened,
lease/fencing invariant documented, frozen diff ZERO, tsc 0, 1612 tests green, preflight PASS. Owner deploy
(migrations + Edge) is the only remaining step to make the frozen core live.

**DUK_IMPLEMENTATION_READY** — every §O–§S identity/concurrency/reserve/refund invariant is explicit and an
additive, RLS-safe migration draft (`spend_duk`/`grant_duk`/ledger/debt/reserve) is present. The wallet build
starts from a locked contract; nothing blocks it.

## Constraints honored
No push, no deploy, no remote migration apply, no remote DB mutation, no IAP product creation, no secret change,
no frozen-engine change, no pricing/model change, no destructive migration, owner-dirty files untouched.

SPRINT_F1_FINAL_CLOSURE_COMPLETE
