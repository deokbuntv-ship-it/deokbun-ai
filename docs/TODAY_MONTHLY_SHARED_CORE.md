# TODAY + MONTHLY — SHARED MYUNGRI CORE CONNECTION

오늘의 운세 · 이번 달 운세 now consume the SAME deterministic myungri core as 상담, via one shared orchestrator.
Facts/context only — **no new fortune rule, no eval-semantics change, no UI change, and (per the prior
semantic audit) NO strength verdict** at runtime.

## Shared orchestrator
`src/features/myungri/services/temporalContext.ts` — `buildMyungriTemporalContext({engineResult, natal,
normalizedBirth, instantEpochSeconds, solarBirthYear})`. It ORCHESTRATES existing frozen services
(`calculateSajuDaewoon` + `calculateDaewoonTenGods`, `calculateSewoonForInstant`, `buildRelationsToNatal`) into:
`{ elementCounts (RAW 오행 counts), activeDaewoon (pillar 십신 + 원국 relations), sewoon (AVAILABLE + 원국
relations), warnings }`. No new calculation, no verdict. `selectActiveDaewoonCycleOrdinal` + `currentSajuAge`
are the shared active-대운 selectors (same basis 상담 uses → cross-feature parity, §37).

## BEFORE / AFTER (§38)
**CALCULATION_CHANGED = none.** Every fact comes from services that already existed and are unchanged; the
frozen engine outputs are byte-identical. **CONNECTION_CHANGED:**
- **Today** — was: natal + 일진(dayLuck) + 세운/월운 *availability booleans only* (full 세운 discarded, no 대운,
  no 오행 분포). now: also carries `temporal` (오행 구성 + active 대운 + full 세운). 세운 computed ONCE (§31).
- **Monthly** — was: natal + 節-based 월운 segments + 세운 *boolean only* (대운 explicitly deferred). now: also
  carries `temporal` (오행 구성 + active 대운 + full 세운). 대운 is no longer deferred for context.
**INTERPRETATION_CHANGED:** the day/month TIER derivation is UNCHANGED (still the 일진 / 월운-segment polarity).
The shared facts are exposed as (a) evidence and (b) a GUARDED background-flow note in the prompt — the LLM may
lean on the larger 대운/세운 flow instead of inventing it, but the server-owned tier is untouched (§8/§11/§12).

## How the background reaches the prompt (guarded)
`deriveDailyPlan` / `deriveMonthlyPlan` add `backgroundFlow` (year + 대운 neutral flow via the SAME shared
`derivePolarity` kernel — a background wording, NOT the day/month tier) + `elementComposition` (raw counts).
The prompts add a "큰 배경 흐름(참고용)" block with an explicit guard: *do not recompute 대운/세운, do not state
certain futures.* Term bans (간지/십신/오행/신강·신약) and 쉬운-말 Reading rules are unchanged.

## Cross-feature consistency (§37)
For the same (natal, instant), 오늘 · 월별 · 상담 resolve the IDENTICAL natal 오행 composition + active 대운 +
세운, because they all call the same frozen services. Verified: `오행 composition` deep-equals across 오늘/월별;
same active 대운 ordinal + 세운 year (`sharedCoreCrossFeature.test.ts`).

## Safety / scope
- **STRENGTH_VERDICT_RUNTIME_EXPOSURE = 0** — the disabled 신강/신약 classifier is NOT consumed anywhere; the
  background is 흐름 polarity (the approved kernel), never a strength label.
- 시주 미상: natal composition/대운/세운 still computed; no fake hour (graceful).
- UI unchanged (§40). Economy/Auth/RLS/billing/model-routing/compatibility unchanged. No DB migration
  (evidence/plan are ephemeral; only `evidence_version`/`plan_version`/`prompt_version` string markers bumped).
- Bundle rebuilt (build only, NO deploy).

## Follow-ups
- `DAEWOON_PRECISION_FOLLOWUP` — active-대운 selection is year-granularity (shared `selectActiveDaewoonCycleOrdinal`);
  a solar-term-exact boundary selector remains deferred.
- `CONSULTATION_UNIFY_FOLLOWUP` — 상담 still assembles its own grounding inline (same underlying services, so
  facts already match); it could adopt `buildMyungriTemporalContext` later to share the assembly code too.
