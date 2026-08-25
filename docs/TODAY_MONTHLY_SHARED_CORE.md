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

---

## V2 — Evaluation Depth + Evidence (temporal synthesis reflected; "왜 이렇게 보나요?" fixed)

Builds on the shared-core connection. Still: base tier IMMUTABLE, no strength verdict, no new theory/weights, no UI redesign, no migration.

**Temporal synthesis (§9/§10/§11).** `src/features/fortune-shared/temporalSynthesis.ts` — `synthesizeBackground(baseTier, [daewoonTier, sewoonTier])` → categorical `REINFORCED | BUFFERED | MIXED | NEUTRAL` + a plain-language summary. Pure combination of EXISTING `derivePolarity` outputs — no numbers, no scoring, product-level (not a myungri result, kept out of the frozen polarity kernel). today/monthly plans now carry `backgroundState` + `backgroundSummary`; the **base day/month tier is never changed** (test-enforced: stripping `temporal` leaves the tier identical). The prompt frames PRIMARY(오늘/이번 달) vs SECONDARY(대운·세운 background) and reflects the synthesis summary once — the LLM never recomputes 대운/세운.

**Evidence surface fix (§19 — was missing on Today).** Root cause: `FortuneReading` never rendered an evidence section (while `ReadingEvidence` existed, used by consultation). Fix: `FortuneReading` now renders `ReadingEvidence` ("왜 이렇게 보나요?") from an `evidence` prop; deterministic evidence lines are generated server-side in the plan (`plan.evidence` — day/month flow + background + synthesis, plain language, no 간지/십신/강약), stored in the result JSON (`evidence?`, `backgroundSummary?` — optional, no migration), mapped by the VMs, and passed by the today/monthly screens. Older records ([] evidence) simply hide the section (no fake evidence).

**Anti-repetition (§13/§14/§26).** Prompt adds a dedupe directive: highlights/cautions/actions must cover different life areas; no repeating one advice family ("정리/기록/확인/천천히") or collapsing to a single topic (e.g. 지출·정리).

**Cache invalidation for fresh QA (§28/§30).** `getByDate` filters by `semantic_version`, so bumping the canonical versions makes old cached records miss → fresh regeneration (no purge, no migration): `today-canonical@1.2.0`, `monthly-canonical@1.3.0` (+ evidence/plan/prompt version markers bumped).

**APK note.** The evidence surface is a CLIENT render change (`FortuneReading`), so it requires an APK rebuild to appear on device. The synthesis-enriched prose flows through the existing result fields (visible without rebuild); the collapsed "왜 이렇게 보나요?" card needs the new client.

---

## V3 — Consumer interpretation quality + evidence specificity (server-only, NO APK rebuild)

Device-QA finding: technically correct but the prose read like a finance/admin checklist and the evidence was too abstract. Fixed server-side only (evidence is already a `string[]` rendered by the shipped `ReadingEvidence`, and the result schema is unchanged) → **APK_REBUILD_REQUIRED = NO** (only a staging deploy of the rebuilt bundle).

**Content quality.** `src/features/fortune-shared/contentQuality.ts` — `containsServiceChecklistTone` (conservative, unambiguous finance-admin phrasing: 영수증/계좌·카드 내역/청구서/자동이체/환불 절차/대출·투자 실행 + micro-tasks 최근 N일 / N분 동안) is a fail-closed reject in `parseDailyFortune`/`parseMonthlyFortune` (same pattern as `containsRawGanji`; rare given the prompt ban, client offers retry). Prompts (today@1.4.0 / monthly@1.5.0) add: the service-checklist ban, finance tone examples (흐름·태도 not 대출/계좌 instructions), and section-role separation (highlights=기회 / cautions=지점 / action=방향 하나, no repetition/single-topic collapse).

**Evidence specificity (§18-22).** `plan.evidence` is now SOURCE-SEPARATED — 오늘 일진 / 현재 대운 / 올해 세운 / 종합 (monthly: 이번 달 월운 / 현재 대운 / 올해 세운 / 종합), each line from the actual source's `derivePolarity` tier, available sources only (no fake specificity), plain language (no 간지/십신/강약). The 종합 line reuses the synthesis summary → consistent with the body (§27). Base day/month tier UNCHANGED; no engine/theory change.

**Cache.** Canonical versions bumped (`today-canonical@1.3.0`, `monthly-canonical@1.4.0`) + plan versions (today-plan@1.4.0 / monthly-plan@1.5.0) → stale same-day/month records regenerate for QA (no purge/migration).
