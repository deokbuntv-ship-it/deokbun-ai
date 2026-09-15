# Future-Month (월운) Grounding — implementation plan (NON-frozen, feasible)

Status after the Evidence-Decision sprint: **P0-A / P0-B shipped** (evidence-calibrated decision + best-
supported-alternative, prompt-only, `consultation@1.2.0`). **P0-C / P0-D (real month grounding + month
comparison) are FEASIBLE without touching frozen code** and are scoped here for a focused, review-gated
next increment. The month **parser** (`questionMonths.ts`) is already implemented + tested.

## Frozen-status verdict (investigated)
`calculateWolwoon({ targetYear, lunarMonth, natal }) → WolwoonResult` already exists, is **pure**, and
accepts **any** `(year, month)` — the freeze constrains its *rules*, not its *argument values*. It is
already called in production (for the current instant). Grounding a REQUESTED month = calling this frozen
function with different arguments. **No frozen file changes.** The civil-date → 사주 月 ordinal mapping is
the existing frozen `resolveSajuYearAndMonth` (fail-closed on 節/立春 boundaries). Per `MYUNGRI_V1_FREEZE.md`,
the adapter/wiring layer is explicitly **excluded** from the freeze.

## The 6-file wiring (all NON-frozen product/wiring layer)

1. **`questionMonths.ts`** — DONE. `resolveQuestionMonths(q, refYear, refMonth) → { intent, targets:[{year,month}] }`
   with intents EXACT_MONTH / COMPARE_MONTHS / MONTH_RANGE / BEST_MONTH / NONE. Emits civil months; capped at 12.

2. **`consultationGrounding.ts`** (`buildMyungriEvidence`) — for each resolved month target, compute
   `calculateWolwoonForInstant({ natal, instantEpochSeconds: epochForSajuMonth(year, month) })` (a new pure
   `epochForSajuMonth` mid-month epoch, mirroring `epochForSajuYear`). Collect the AVAILABLE results into a
   new `extraWolwoon: WolwoonResult[]` on the bundle. Cost: EXACT/COMPARE compute only the named months;
   BEST/RANGE compute the range (≤12). **Zero extra LLM calls** — all deterministic/local (§34/§36). Reuse
   the natal foundation across months (already computed once).

3. **`sajuEvidenceAdapter.ts`** — add an `extraWolwoon` channel (mirror of `extraSewoon`). Render compact
   month rows (§35): `월운 {year}·{month}월: {pillar} · {십신 요약} · 세운 대비 {relationToSewoon}` — no
   invented numeric scores (the engine gives categorical 십신/relations, not a score). Extend the timing
   anchor with the grounded months.

4. **`aiOutput.ts` `EngineEvidenceTimingAnchors`** — add `months?: string[]` (`"YYYY-MM"` of grounded
   months). Backward-compatible (optional). Keep `hasMonthlyEvidence` for the current-month gate.

5. **`grounding.ts` `isValidTimingAnchors`** — accept + validate the optional `months: string[]` (each
   `/^\d{4}-\d{1,2}$/`). Fail-closed if malformed.

6. **`structuredConsultation.ts` validator (`timingAnchorsOf` + `hasUnsupportedTiming`)** — the safety-
   critical file. Design so it can only get SAFER:
   - `timingAnchorsOf` reads `months` into a `Set<'YYYY-MM'>`.
   - `hasUnsupportedTiming`: a claim naming `YYYY년 M월` (or a resolved relative month) is allowed ONLY when
     `YYYY-MM ∈ months`. **This also CLOSES a current leak**: today a bare `"2027년 2월"` passes if only the
     YEAR 2027 is grounded (the month is unchecked) — the new rule rejects an ungrounded month even inside a
     grounded year. `다음 달`/`이번 달` require the resolved month be in the set (today `다음 달` is hard-false).
   - This never *loosens* rejection: an ungrounded month is still rejected; a grounded month becomes allowed.

## Claim-type policy (§21/§22) — enforced by evidence, not new LLM logic
- EVENT_PREDICTION ("2월에 반드시 이사합니다") — never allowed (prompt bans; validator's absolute-timing
  posture unchanged).
- SUITABILITY ("2월은 이사하기 좋은 시기") — allowed iff `2027-02 ∈ months`.
- RELATIVE_RECOMMENDATION ("2월을 가장 추천 / 2월 > 5월") — allowed iff ALL compared months are grounded
  (COMPARE_MONTHS grounds both; BEST_MONTH grounds all 12 so a #1 has a comparison set). Ranking is derived
  from deterministic 십신/relation features; if a safe ranking metric can't be derived, say "2월·6월이
  상대적으로 유리" rather than a false #1 (§20).

## Test matrix to add (§30/§31/§K)
Month parser (done) + grounding: EXACT grounds the one month; BEST grounds 12; COMPARE grounds both; RANGE
grounds the range. Validator: grounded month allowed; **ungrounded month inside a grounded year REJECTED**
(the closed leak); `다음 달` allowed only when grounded. Alternative: exact-month unsupported + year
supported → year answer + alternative (no generic failure). Event-prediction never becomes certainty.

## Why deferred (not blocked)
Files 2/3/6 are trust/safety-critical (grounding + validator). The constitution priority is
stability > correctness/grounding > quality, so the validator rewrite must be implemented + reviewed
carefully (prove: no ungrounded month ever passes), not rushed at the tail of a long session. It is
**NOT frozen-blocked** — no owner frozen-approval is needed; it needs a focused implementation pass.
