# OWNER ACTIVATION 03C — POST-SMOKE VERIFICATION

> Staging `aephpsiurgkvqcswyeie` **read-only** (SELECT-only `db query`). Production `olvkpaldrwvtexxpoaag`
> never contacted. No billing enabled, no flags/secrets/rows/code/migrations changed. **Production mutations = 0.**

## 1. Target Isolation
`MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (main HEAD `baa1a96`, config project_id still production — unchanged).
`STAGING_TARGET = aephpsiurgkvqcswyeie`. Every query ran read-only against staging via `--linked --project-ref`.
**Production mutations = 0.**

> **Run note (explains the conversation-id spread):** the harness was run **twice**. Run 1 (04:29–04:30) created
> conversation `0048bb9c`, executed GENERAL/FOLLOWUP/WHY, then stopped before COMPAT. Run 2 (04:31) created
> `47c40a80` (C1) + `553fa09a` (C2), **replayed** GENERAL/FOLLOWUP/WHY with **no new LLM calls / decisions /
> reservations**, then ran COMPAT + IDEM fresh. This is a bonus cross-run idempotency proof (see §8–§10).

## 2. General Actual Model
`consultation_decisions[request_id=ACT03B-GENERAL-0001].model_id = **gpt-5-mini**`, workload `chat`,
engine_version `deokbunai.saju-rules.v1`, decision-policy@1.3.0, answer-plan@1.3.0. **Matches expected.**

## 3. Compatibility Actual Model
`ai_usage_logs` COMPAT call `model = **gpt-5.6-terra**`, status success (input 4679 / output 795, 9982 ms).
Server-owned routing (`resolveModelRoute`, code default `DEFAULT_TERRA_MODEL`; env `LLM_MODEL_TERRA` absent → code
default). No client model authority. **Matches expected — Terra invocation succeeded (no provider/model error).**

## 4. Token / Latency Samples (authoritative `ai_usage_logs`, all status=success)
| request | model | input | cached | output | total | latency_ms |
|---|---|---|---|---|---|---|
| GENERAL | gpt-5-mini | 6766 | 0 | 3003 | 9769 | 34605 |
| FOLLOWUP | gpt-5-mini | 7560 | 0 | 1177 | 8737 | 13008 |
| WHY | gpt-5-mini | 5336 | 0 | 1469 | 6805 | 16348 |
| COMPAT | gpt-5.6-terra | 4679 | 0 | 795 | 5474 | 9982 |
| IDEM | gpt-5-mini | 6717 | 0 | 1523 | 8240 | 16168 |
`cached_input_tokens` / `reasoning_tokens` = null (provider did not report cache hits / separate reasoning on
these first-run calls). SAFETY produced **no** `ai_usage_logs` row (short-circuited before the LLM).

## 5. WHY Stored-Evidence Authority — **classification A (correct fail-closed), NOT a failure**
The WHY request (`ACT03B-WHY-0001`) referenced conversation `0048bb9c`, whose latest prior decision was FOLLOWUP.
That FOLLOWUP decision's `decision_meta` has **no `evidenceSnapshot` and no `polarity`** (verified: meta keys =
answerPlanVersion, comparisonContext, decisionPolicyVersion, domain, engineVersion, modelId, promptVersion,
resolvedGranularity, resolvedTargets, resolvedTemporalContext — no evidenceSnapshot/polarity).

Per the frozen contract (`followUpContext.ts:101-111`), WHY has authority **only** when the prior decision carries
a valid `evidenceSnapshot` + `polarity`; otherwise it **fails closed to `{kind:'NONE'}`** rather than fabricating
an explanation from the current turn. WHY correctly loaded the prior decision, found no snapshot, and fell closed
to a general reading. **The WHY mechanism is intact and behaved exactly as designed.**

Why the prior turns had no snapshot: GENERAL/FOLLOWUP were **vague, non-temporal** questions ("전반적인 흐름",
"대인 관계에서 신경 쓸 부분") that the engine deliberately does not ground into a polarity verdict (it returns a
general reading rather than fabricate one). The **IDEM** decision, by contrast, was a concrete grounded question
("올해 재물") and its `decision_meta` **does** carry `evidenceSnapshot` + `polarity` (CAUTION) — proving grounded
decisions produce the snapshot WHY would reuse.

**This is NOT a billing blocker.** It is billing-independent consultation-quality logic, code-verified intact,
failing closed safely. Gap: the smoke did not *positively* exercise WHY-after-a-grounded-question live (§19 HIGH).

## 6. WHY Metadata Explanation (grounded=false, engineVersion=null)
Direct consequence of §5: because WHY resolved to `NONE` (no authoritative prior snapshot), the Edge sets grounding
to `GROUNDING_UNAVAILABLE` (mode general reading, `grounded=false`, `engineVersion=null`) instead of rebuilding
from a stored decision. This is the **intended** presentation of a non-authoritative WHY — not a load failure.

## 7. WHY Polarity Finding
The harness's `polarityMatchesPriorFollowUp=false` is **vacuous**: the prior FOLLOWUP response had
`conclusionPolarity=null` (ungrounded), and the harness guard returns false whenever the prior polarity is null
(`(followUp.conclusionPolarity!=null) && …`). No stored polarity existed to match. **REAL WHY POLARITY MISMATCH = NO.**

## 8. Idempotency DB Evidence (`ACT03B-IDEM-0001`, sent twice)
- `consultation_decisions` where request_id=IDEM → **1** (not 2).
- `global_reservation_requests` where request_id=IDEM → **1** (not 2).
- `paid_request_idempotency` where request_id=IDEM → **1, status COMPLETED**.
- `ai_usage_logs` for the IDEM question → **1** LLM call.
- Cross-run bonus: `global_reservation_requests` where request_id=GENERAL → **1**, despite run 2 re-sending it →
  the replay consumed **no** second slot.

## 9. Second LLM Call
**NO.** Only one IDEM LLM call exists in `ai_usage_logs` (04:31:57). The replayed second request returned the
stored response without invoking the provider.

## 10. Global Reservation Count
`ACT03B-IDEM-0001` → **exactly 1** `global_reservation_requests` row (`GLOBAL_REQ_IDEMPOTENCY_ENABLED=ON`; the
`_idem` wrapper deduped). `ACT03B-SAFETY-0001` → **0** (crisis short-circuits before any paid/global work).

## 11. Decision Count
Per logical request: GENERAL 1, FOLLOWUP 1, **WHY 0** (WHY is never persisted — by contract), COMPAT 0
(compatibility is not persisted to `consultation_decisions`), **IDEM 1** (not 2). All as expected.

## 12. Semantic Replay Equality
- **REPLAY_SEMANTICALLY_IDENTICAL = YES** — same text length (1181), same polarity (CAUTION), one decision, one
  reservation, one LLM call.
- **REPLAY_BYTE_IDENTICAL = NO** — root cause identified: the **fresh** path returns the in-memory JS object
  (`index.ts:575` → `return response`, insertion key order); the **replay** path returns the same object
  round-tripped through Postgres **`jsonb`** (`index.ts:1147`), which normalizes key order. Values are identical;
  only JSON key order differs, and the harness `JSON.stringify` compare is order-sensitive. **Cosmetic** — clients
  must not depend on key order (§20 MEDIUM).
- **SECOND_LLM_CALL = NO.**

## 13. Billing-OFF Accounting (test user)
`duk_reserve` rows = **0**; `duk_ledger` rows = **0**; `consultation_sessions` rows = **0**;
`sessions_with_charge_id` = **0**. Safety = 0 Duk effect; Compatibility = 0 Duk effect. `DUK_BILLING_ENABLED` was
OFF throughout, so the non-billing completion path (`complete_consultation_request_with_decision`) ran — no
reserve/commit/charge anywhere. `global_paid_generation_reservations` total = 5 (one per paid LLM call; the global
rate-limit ledger, not Duk).

## 14. Economy Diagnostics
All **11 invariants = 0 anomalies (PASS)**: negative balance, dup purchase/revocation, double charge, reserve
terminal conflict, expired-still-reserved, charged-no-debit, orphan purchase, open-refund-debt, first-pack
multi-grant, ledger-supply-negative.

## 15. Mini N=1 Cost
GENERAL (gpt-5-mini, input 6766 / cached 0 / output 3003, 34605 ms): **USD $0.00770**, **≈ ₩10.39** @ assumed
1350 KRW/USD (`DEFAULT_USD_KRW`, a code assumption — not a live-configured FX). Verified single-source price
(in $0.25 / cached $0.025 / out $2.00 per 1M). **SAMPLE SIZE = 1.** No Duk price changed.

## 16. Terra N=1 Cost
COMPAT (gpt-5.6-terra, input 4679 / cached 0 / output 795, 9982 ms): **UNPRICED** — the single-source cost model
has **no verified `gpt-5.6-terra` price**; per the no-hardcoding rule I did not fabricate one. Tokens + latency
reported above. **SAMPLE SIZE = 1.** (Owner: add a verified Terra price to `llmCostModel.ts` to enable Terra cost.)

## 17. Final Feature Flags
`DUK_BILLING_ENABLED = OFF` (sha256 of "false", unchanged) · `GLOBAL_REQ_IDEMPOTENCY_ENABLED = ON` (sha256 of
"true", unchanged) · Apple credentials **absent** · Google credentials **absent** · `OPENAI_API_KEY` present.
No mutation this activation.

## 18. BLOCKER
**None.** Every billing-safety property is green: idempotency (no double decision/reservation/LLM, incl. cross-run
replays), safety short-circuit before paid work (0 reservation), billing-off accounting clean, model routing +
cost attribution correct, economy invariants 0.

## 19. HIGH (non-blocking; close before/with billing rollout)
- **WHY positive path not live-proven.** The smoke's WHY followed *ungroundable* questions, so it exercised only
  the fail-closed branch. The mechanism is code-verified and grounded decisions demonstrably carry an
  `evidenceSnapshot` (IDEM), but no live "WHY after a grounded question → reuses stored evidence" was observed.
  Recommend one targeted smoke: grounded prior (e.g. "올해 재물…") → "왜?" and confirm the response reuses the
  prior polarity + `evidenceSnapshot.engineVersion` (not null).

## 20. MEDIUM
- **Replay not byte-identical** (jsonb key-order normalization; §12). Semantically identical; document that clients
  must not depend on key order, or normalize the fresh return to match.
- **Vague questions return ungrounded general readings** (GENERAL/FOLLOWUP: grounded=false, polarity=null). This is
  the safe/conservative frozen design (no fabricated verdict) — confirm it is the intended UX for broad questions.
- **Terra unpriced** in the cost model (§16) — add a verified price to enable Terra cost/economics.

## 21. Owner Action Required
- None to proceed. Billing-safety substrate is verified.
- Recommended before flipping `DUK_BILLING_ENABLED`: (a) run the one grounded-prior WHY smoke (§19); (b) then a
  billing-ON smoke (the Duk reserve/commit/charge path itself was necessarily not exercised with billing OFF).

---

**READY_FOR_DUK_BILLING_ACTIVATION** — all billing-safety, idempotency, accounting, routing, and economy checks
pass on staging with 0 production impact. The WHY item is a code-verified, fail-closed, billing-independent
consultation-quality behavior (§5–§7), tracked as a HIGH test-coverage follow-up (§19), not a blocker.

OWNER_ACTIVATION_03C_COMPLETE
