# SPRINT F A→Z — FINAL REPORT

Consultation Final Freeze → LLM Cost Benchmark → Duk Economy Foundation. Autonomous, owner-away.

| # | Item | Result |
|---|---|---|
| 1 | **Start HEAD** | `a1587fe` (E.2) — matches the stated E.2 head |
| 2 | **End HEAD** | `790d1e4` (3 Sprint F commits, not pushed) |
| 3 | **Consultation Core freeze verdict** | **`CONSULTATION_CORE_V1_FREEZE_CANDIDATE`** at `790d1e4` — BLOCKER/HIGH 0, frozen diff 0, tsc 0, jest 155/1549 green |
| 4 | **Remaining BLOCKER** | 0 |
| 5 | **Remaining HIGH** | 0 |
| 6 | **Remaining MEDIUM** | None that block the consultation-core freeze. Non-core MEDIUMs are *future feature build-out* (Duk backend, IAP, monthly/per-model spend guard) — spec'd, not blockers |
| 7 | **Auth guard fix** | §B fixed: `assertAuthenticatedForConversation` gates `ensureConversationId` before any INSERT; unauthenticated first turn → AUTH_REQUIRED, zero side effects (no row/reserve/LLM/decision). `chat.tsx` maps the typed error on first-turn + retry. Commit `1440dea` |
| 8 | **First-conversation test** | PASS. E.2's `executeConversationBoundSend` binds the owned id directly (no stale state); covered by `conversationBoundSend.test.ts` (ordering ensure→persist→send) + E.2 `e2RuntimeClosure.test.ts` (immediate-WHY-finds-first-decision) |
| 9 | **Cross-owner test** | PASS (contract). E.2 rejects a cross-owner id with `CONVERSATION_FORBIDDEN` **before** paid acquisition; `sprintFBoundaries.test.ts` locks the RPC's service-role + owner-mismatch guards + composite FK |
| 10 | **RPC / replay test** | PASS. Atomic RPC completes-then-inserts, returns null if completion failed (no ghost decision, whole call rolls back → 503); retry is idempotent (replay-read returns the persisted answer; unique `(user_id,workload,request_id)` blocks a duplicate decision → no double charge, no duplicate). Gap: the **Duk** first-turn charge is designed (§R) to live inside this same RPC but is **not built** yet |
| 11 | **Full Jest** | **155 suites / 1549 tests — all pass** (+13 from Sprint F) |
| 12 | **TypeScript** | **0 errors** |
| 13 | **Frozen engine diff** | **ZERO** (`myungri` / `interpretation/saju` / `ziwei` / `qimen` untouched) |
| 14 | **LLM routing inventory** | `LLM_ROUTING_INVENTORY.md` — current: **all chat workloads use one `gpt-5-mini`** (effort/ceiling vary by complexity, model does not); report path is **deterministic (no LLM)**. Target Mini/Terra split is unbuilt; "Terra" has no model id in repo (owner decision) |
| 15 | **Benchmark harness status** | `BENCHMARK_HARNESS_READY` — `scripts/benchmark/{run-benchmark.mjs, fixtures.json, prices.example.json}`; dry-run verified |
| 16 | **Live benchmark executed?** | **NO — `LIVE_BENCHMARK_NOT_EXECUTED`** (no local key; live run spends money → owner-gated). `BLOCKED_EXTERNAL` |
| 17 | **Mini token/cost** | Not measured (no live run). Harness collects real `ai_usage_logs` usage when the owner runs it |
| 18 | **Terra token/cost** | Not measured (Terra unmapped + no live run) |
| 19 | **Duk economy spec files** | `DUK_ECONOMY_SPEC_V1.md` (+§O gap), `DUK_LEDGER_DATA_MODEL.md`, `SESSION_BILLING_STATE_MACHINE.md`, `GLOBAL_SPEND_GUARD_SPEC.md`, `ANALYTICS_CONTRACT.md`, `PRODUCT_CATALOG_SPEC.md`, `POLICY_TERMS_REQUIREMENT_MAP.md`, `AI_DISCLAIMER_CONTRACT.md`, `V1_1_REUNION_REPORT_BOUNDARY.md`, `LLM_ROUTING_INVENTORY.md`, `CONSULTATION_CORE_FREEZE.md`, `V1_RELEASE_GATE.md`, `LLM_COST_BENCHMARK.md` |
| 20 | **Ledger / data model** | Append-only `duk_ledger` (bucket + signed delta + reason + idempotency), derived `duk_balance` view, `spend_duk` RPC contract, spend priority PLUS→REWARD→PAID. DESIGN ONLY (no table, no migration applied) |
| 21 | **Session billing state machine** | SAFETY→ENTITLEMENT/BALANCE→RESERVE→LLM→VALIDATOR→PERSIST→COMMIT; charge on **first successful turn**; later-fail/TTL/exit = no refund; idempotent; reuses existing paid-request + reserve machinery |
| 22 | **Duk debt model** | `duk_debt` obligation; offset **only** vs future PAID_DUK; never blocks/《offsets》 REWARD/PLUS or free grants; no negative balance ever; refund-abuse tracked separately |
| 23 | **Spend Guard spec** | Guard **already live** (kill switch, hourly+daily, 50/80/95 warn, 100 hard, per-workload units). Gaps designed: **monthly window**, **per-model attribution**, verify cached-read exemption at 100% |
| 24 | **Analytics contract** | Full event catalog on the existing `product_events` pipeline; PII-free; `compatibility_insufficient_duk` carries the exact gap probe (balance/shortfall/per-bucket/prior-count/days-since-signup) |
| 25 | **Product catalog** | Hypothesis: FIRST 20/₩2,900 (lifetime-once), BASE 50/₩9,900, LARGE 120/₩19,900, PLUS TBD (must beat LARGE per-Duk). Store id **naming proposal only** (no product created) |
| 26 | **Policy / Terms mapping** | 8 documents mapped to code features; 덕 정책 must state 9 items (보상/구매/PLUS덕·유효기간·차감순서·환불·duk_debt·장애·종료) matching code. No legal text written |
| 27 | **V1.1 reunion boundary** | Reserved as a **separate** V1.1 product (not a compat rename); allowed scope + hard forbiddens (no "반드시 돌아온다/몇 월 연락", no other-person certainty); Terra candidate; price post-V1. TODO only |
| 28 | **Release Gate G1–G9** | G1 FREEZE CANDIDATE · G2 harness ready/not run · G3 spec · G4 spec · G5 partial(live) · G6 map done · G7 contract done · G8 not started · G9 not started (no Firebase Dynamic Links, no vendor chosen) |
| 29 | **Local commits** | `1440dea` (§B auth), `9184f0e` (§D/§E/§F tests), `790d1e4` (§I–§Y docs + harness). **Not pushed** |
| 30 | **Owner actions** | see below |

## Owner actions (do only these; everything else is closed)

1. **Deploy (G1):** apply the pending consultation migrations (incl. `20260829000000_consultation_decisions.sql`) and redeploy the `chat` Edge. Preserve owner-dirty `supabase/config.toml`.
2. **Benchmark (G2):** provision a test-user token + service-role read, run `node scripts/benchmark/run-benchmark.mjs --live` (spends money), fill `scripts/benchmark/prices.example.json` with verified prices.
3. **Decide (post-benchmark):** confirm/adjust every POLICY VALUE — Duk grants/prices, session cap/TTL, pack prices, PLUS price+grant, spend-guard limits. Map "Terra" → a real model id.
4. **Build (G3/G4):** Duk ledger + `spend_duk` + session charge inside the atomic RPC; IAP receipt-validation Edge + store products.
5. **Publish (G6):** draft the 8 Korean policy docs (counsel) using the requirement map; wire the shared AI-disclaimer string.
6. **QA (G8/G9):** device E2E; choose an attribution approach (not Firebase Dynamic Links).

## Notes / constraints honored

- No push, no deploy, no remote DB mutation/migration apply, no IAP product creation, no secret change, no
  pricing finalized, no model swapped, no frozen-engine change, no owner-dirty file touched.
- E.2 (`efd68fa`/`2dd147b`/`9c6c1bf`/`a1587fe`) already implemented first-conversation ordering, atomic
  ownership-checked persistence, evidence snapshot, and deterministic loader — Sprint F verified these, closed
  the remaining §B auth MEDIUM, and laid the economy foundation.

SPRINT_F_A_TO_Z_COMPLETE
