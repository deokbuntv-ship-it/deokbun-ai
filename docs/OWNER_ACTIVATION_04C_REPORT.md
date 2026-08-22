# OWNER ACTIVATION 04C — AUTHORITATIVE BILLING VERIFICATION

> Staging `aephpsiurgkvqcswyeie` — read-only DB verification of the billing-ON live smoke. Production
> `olvkpaldrwvtexxpoaag` never contacted. **Production mutations = 0.** All invariants passed → billing left ON.

## 1. Target Isolation
`MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (HEAD `baa1a96`, unchanged) · `STAGING_TARGET = aephpsiurgkvqcswyeie` ·
**PRODUCTION_MUTATIONS = 0** (04C was read-only).

## 2. Final Wallet
PLUS 0 · REWARD 0 · PAID 0 · **total_spendable 0** · active_reserved 0 · **open_debt 0** · candle_grants 1.
(17 granted − 5 general − 12 compat = 0, exactly as expected.)

## 3. General 5-Duk Charge (`ACT04B-GEN-1`)
Ledger: **one** debit `REWARD −5 reason=CONSULTATION` (has_session + has_charge). One `general` session
(price_duk 5, charged). One reserve `COMMITTED` amount 5. One decision (`model_id=gpt-5-mini`). One global
reservation. One LLM (06:41:28, mini, 6717→1389). **GENERAL_5_DUK_CHARGE = PASS.**

## 4. General Follow-Up (`ACT04B-GENFUP-1`)
Resumed the same general session (turn 2). **No** second −5 debit (ledger has no CONSULTATION row for GENFUP).
One LLM (mini). One decision persisted (followup). **GENERAL_FOLLOWUP_NO_SECOND_CHARGE = PASS.**

## 5. General Replay (`ACT04B-GEN-1` re-sent)
Totals for the logical request: **debit 1, decision 1, global reservation 1, session 1, LLM 1.** Replay added
**0** of each (session turns stayed 2, no new ledger/decision/reservation/ai_usage). **GENERAL_REPLAY_EXACT_ONCE = PASS.**

## 6. General Session State
`general` session ACTIVE, successful_turn_count **2** (first turn + one follow-up; replay did not increment),
price_duk 5, charge_id set.

## 7. Compatibility 12-Duk Charge (`ACT04B-COMPAT-1`)
Ledger: **one** debit `REWARD −12 reason=COMPATIBILITY` (has_session + has_charge). One `compatibility` session
(price_duk 12, charged). One reserve `COMMITTED` amount 12. One LLM **`gpt-5.6-terra`** (06:41:52, 4679→670).
One global reservation. Client `compatibility.engineVersion` returned (compatibility-engine). **COMPATIBILITY_12_DUK_CHARGE = PASS.**

## 8. Compatibility Follow-Up (`ACT04B-COMPATFUP-1`)
Resumed the compat session (turn 2). **No** second −12 debit. One LLM `gpt-5.6-terra` (FULL_TERRA — follow-up
stays on Terra per locked policy). **COMPATIBILITY_FOLLOWUP_NO_SECOND_CHARGE = PASS.**

## 9. Compatibility Replay (`ACT04B-COMPAT-1` re-sent)
Debit 1, LLM 1, global reservation 1, session 1. Replay added **0**. **COMPATIBILITY_REPLAY_EXACT_ONCE = PASS.**

## 10. Compatibility Session State
`compatibility` session ACTIVE, successful_turn_count **2**, price_duk 12, charge_id set.

## 11. Safety Zero-Duk (`ACT04B-SAFE-1`)
`global_reservation_requests` for SAFE-1 = **0**; no ledger debit, no session, no reserve, **no ai_usage row**
(no LLM). Client returned `groundingMeta.mode='safety'`. Crisis short-circuit precedes all paid/global work.
**SAFETY_ZERO_DUK = PASS.**

## 12. Model Routing (authoritative telemetry)
General + general follow-up → **gpt-5-mini**; Compatibility + compat follow-up → **gpt-5.6-terra**. Server-owned;
matches locked policy. (4 LLM calls total; replays + safety made none.)

## 13. Ledger Exactness
Exactly 4 rows for the user: `REWARD +16 ADMIN_ADJUSTMENT`, `REWARD +1 CANDLE`, `REWARD −5 CONSULTATION` (GEN-1),
`REWARD −12 COMPATIBILITY` (COMPAT-1). No follow-up/replay debits. Net 0. No rows altered/deleted.

## 14. Reserve State
Two reserves, both **COMMITTED** (general v0 amount 5; compat v0 amount 12). No stale ACTIVE/RESERVED hold; none
both COMMITTED and RELEASED.

## 15. Candle Accounting
`CANDLE` ledger grants = **1** (`+1 REWARD`); the immediate second claim produced no additional grant.
**CANDLE_ONE_PER_COOLDOWN = PASS.**

## 16. Global Idempotency
`ACT04B-GEN-1` = 1 global reservation, `ACT04B-COMPAT-1` = 1, `GENFUP-1` = 1, `COMPATFUP-1` = 1, `SAFE-1` = 0.
Replays added no slot. `GLOBAL_REQ_IDEMPOTENCY_ENABLED` remains ON.

## 17. Mini Telemetry / Cost (verified gpt-5-mini price; N=1 each)
- General first-turn: input 6717 / cached 0 / output 1389 / total 8106 / 17003 ms → **$0.00446 ≈ ₩6.02**.
- General follow-up: input 7395 / output 1202 / total 8597 / 13761 ms → **$0.00425 ≈ ₩5.74**.
(Session cost, 2 mini turns on a 5-Duk general session ≈ $0.0087 / ₩11.8.)

## 18. Terra Telemetry / Cost
- Compat first-turn: gpt-5.6-terra, input 4679 / output 670 / total 5349 / 8778 ms → **TERRA_COST_UNPRICED**.
- Compat follow-up: gpt-5.6-terra, input 4681 / output 777 / total 5458 / 10775 ms → **TERRA_COST_UNPRICED**.
No verified `gpt-5.6-terra` price in the repo cost model; not fabricated. Tokens/latency captured.

## 19. Analytics
`product_events` during the run = **ABSENT (0)**. Expected: the harness calls the chat Edge **directly**, bypassing
the client UI where `record_product_event` fires; server billing does not emit product_events. Not an accounting
failure (§18) — but client-side billing/consultation analytics (`duk_committed`, `consultation_started`, …) are
**unverified** because the direct-Edge path doesn't exercise them (see HIGH).

## 20. Economy Diagnostics
All 11 invariants = **0 anomalies (PASS)** — no negative balance, no duplicate/double commit, no reserve-status
conflict, no ledger/session mismatch, no debt anomaly.

## 21. Welcome Runtime Gap
**WELCOME_RUNTIME_IMPLEMENTED = NO** (unchanged; not modified this read-only pass). The 17-Duk test balance came
entirely from a server-authoritative `grant_duk` (ADMIN_ADJUSTMENT +16) + one real candle (+1). New users still
receive **0** Duk at signup. **V1 RELEASE HIGH.** Smallest fix: on first eligible onboarding, one
server-authoritative `grant_duk(user, 10, 'REWARD', 'WELCOME')` — idempotent (unique on user+WELCOME), immutable
ledger, no duplicate across retries/logins.

## 22. Final Flags
All accounting + safety invariants passed → **left ON**: `DUK_BILLING_ENABLED = ON`,
`GLOBAL_REQ_IDEMPOTENCY_ENABLED = ON`. Apple/Google credentials absent. (No revert needed.)

## 23. Production Mutation Count
**0.** Main linked to production, HEAD `baa1a96` unchanged.

## 24. BLOCKER
**None.**

## 25. HIGH
- **WELCOME_RUNTIME_IMPLEMENTED = NO** — new users start at 0 Duk (product integration gap; §21).
- **Client-side billing/consultation analytics unverified** — the direct-Edge harness bypasses client analytics
  emission; `duk_reserved/committed/spent`, `consultation_started/completed`, `session_*` were not observed. Verify
  via a client-driven staging session (not a blocker for billing accounting, which is proven server-side).

## 26. MEDIUM
- **Terra unpriced** in the cost model — add a verified `gpt-5.6-terra` price to enable Terra cost/economics.
- **Live-Edge INSUFFICIENT not exercised this run** — balance-17 funding + same-product session-resume preclude a
  clean Edge-level insufficient (proven at reserve-RPC + Edge-code level: reserve returns INSUFFICIENT before any
  LLM → HTTP 402). A dedicated zero-balance test user would give a live-Edge 402.
- **CONCURRENT_DOUBLE_SPEND_PROTECTION = DB_INTEGRATION_ONLY** — per-user advisory lock + spendable-minus-reserves
  proven transactionally; true multi-connection concurrency not run.

## 27. Owner Action Required
1. Implement the WELCOME runtime grant (§21) — separate, owner-authorized change.
2. Optionally add a verified Terra price to `llmCostModel.ts`.
3. Decide when to promote (apply `20260837` + billing enablement) to production, after store-sandbox activation.

## 28. Next Recommended Activation
**Activation 05 — store sandbox** (Apple/Google credentials + product_catalog mapping + sandbox
purchase/restore/**refund→debt** path). Only after WELCOME runtime is implemented and re-verified.

---

### Exact verdicts
```
GROUNDED_WHY_POSITIVE_PATH             = PASS
GENERAL_5_DUK_CHARGE                   = PASS
GENERAL_FOLLOWUP_NO_SECOND_CHARGE      = PASS
GENERAL_REPLAY_EXACT_ONCE              = PASS
COMPATIBILITY_12_DUK_CHARGE            = PASS
COMPATIBILITY_FOLLOWUP_NO_SECOND_CHARGE= PASS
COMPATIBILITY_REPLAY_EXACT_ONCE        = PASS
SAFETY_ZERO_DUK                        = PASS
CANDLE_ONE_PER_COOLDOWN                = PASS
CONCURRENT_DOUBLE_SPEND_PROTECTION     = DB_INTEGRATION_ONLY
ECONOMY_DIAGNOSTICS                    = PASS
WELCOME_RUNTIME_IMPLEMENTED            = NO
FROZEN_CONSULTATION_CORE               = YES
PRODUCTION_MUTATIONS                   = 0
```

**STAGING_DUK_BILLING_VALIDATED** — real 5-Duk general and 12-Duk compatibility charges commit exactly once with
correct bucket/reason, follow-ups and replays add zero, safety spends zero, candle grants one per cooldown, global
idempotency holds, economy invariants are clean, and production was never touched. Open items (WELCOME runtime,
client analytics, Terra price) are non-blocking HIGH/MEDIUM.

OWNER_ACTIVATION_04C_COMPLETE
