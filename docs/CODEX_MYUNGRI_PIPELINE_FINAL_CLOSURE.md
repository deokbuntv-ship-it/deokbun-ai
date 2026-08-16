# Codex Re-Review — Myungri FULL CONSULTATION PIPELINE FINAL CLOSURE

> The 5 Codex MATERIAL defects on the 명리 → Evidence → Grounding → Prompt → LLM → Structured Result
> pipeline, closed as LOCALIZED integration fixes. Frozen calc (`7c7ed82`) untouched; existing Ziwei
> (`02f1382`) preserved; **Qimen NOT connected**. Status: `READY_FOR_CODEX_MYUNGRI_PIPELINE_FINAL_CLOSURE_REVIEW`.

1. **Starting HEAD:** `02f1382` (Ziwei V1 dual-engine).
2. **Ending HEAD:** this commit — the single local closure commit atop `02f1382` (SHA in `git log -1`).
3. **Changed files (integration layer only):** `analysis/aiOutput.ts`, `analysis/index.ts`,
   `chat/prompts/structuredConsultation.ts`, `chat/prompts/grounding.ts`, `chat/prompts/promptBuilder.ts`,
   `chat/services/chatService.ts`, `chat/services/consultationGrounding.ts`,
   `myungri/adapters/sajuEvidenceAdapter.ts`, + NEW `chat/__tests__/pipelineClosure.test.ts`.
4. **Frozen engine integrity:** `git status -- src/features/interpretation` empty; `git diff 7c7ed82 HEAD
   -- src/features/interpretation` empty. No calc/calendar/立春/12-Jie/Daewoon/Sewoon/Wolwoon/relations change.
5. **Existing Ziwei preservation:** `ENGINE_CONNECTED={saju:true, ziwei:true, qimen:false}` unchanged; all
   ziwei + dual-engine suites green; no ziwei file reverted.

## The 5 material fixes

6. **FIX 1 — semantic rejection never renders raw.** NEW typed `classifyConsultationOutput()` returns
   `ACCEPTED | STRUCTURAL_FALLBACK | SEMANTIC_REJECTED`. chatService renders raw model text ONLY on
   STRUCTURAL_FALLBACK (safe prose, no schema). A SEMANTIC violation — in the structured JSON **or** the
   raw prose — discards the text and shows `SEMANTIC_REJECTION_MESSAGE` (a safe generic retry ask, never a
   fabricated interpretation). The "validate→null→render raw response.text" leak is gone.
7. **FIX 2 — timing covers ALL fields + followUps.** Timing is validated against structured, evidence-derived
   `EngineEvidenceTimingAnchors` (allowed Gregorian years = birth year + current 세운/월운; Daewoon age span),
   NOT a lone boolean. A specific "YYYY년" (or absurd age) not in the anchors is unsupported: in **core prose**
   → reject; in **futureFlow** → stripped; in a **followUp** → that followUp removed. Relative language
   (올해/내년/향후 몇 년) carries no year and is not flagged.
8. **FIX 3 — full deterministic time-axis evidence.** `calculateMyungriTimeAxis` is now actually CALLED in the
   grounding builder. Evidence preserves: Daewoon **direction** (순행/역행) + start/**end** age + **active/current
   cycle** marker (resolved from the current age); Sewoon **relationsToNatal**; Wolwoon **relationsToNatal** +
   relationToSewoon; the connected **원국↔대운↔세운↔월운** cross-layer relations (합충형파해 + 삼합/방합) as its own
   `시간축 연결` section; per-layer ruleVersions/assumptions/limitations in `근거·한계`. Facts only — no new calc,
   no strength/용신/격국.
9. **FIX 4 — Solar/Lunar canonical full-prompt equivalence.** When a 명식 is available, the subject block's
   reasoning identity is the confirmed 사주 in 【계산 근거】 (identical for the same instant). The raw input
   date/calendar is kept ONLY as a clearly-marked `※ 입력 원본(참고용, 비추론)` audit line. The same birth instant
   entered as 양력 2024-01-03 or 음력 2023-11-22 produces a BYTE-IDENTICAL reasoning prompt (audit line excluded) —
   verified on the real `buildPrompt` output, not just the grounding string.
10. **FIX 5 — strict runtime grounding validation.** `toSafeGrounding` now validates the FULL shape: availability
    enum, summary/detail types, section shape (`label:string`, `lines:string[]`), timingAnchors shape,
    hasTimingEvidence boolean, unavailable-reason enum, engineVersion type, and connected-engine consistency
    (an `available` engine with no usable fact is rejected). Malformed → fail-closed UNAVAILABLE. `buildPrompt`
    now runs inside a guard in chatService (outside the network boundary) so it can never throw uncaught.

## Behavior detail

11. **Semantic rejection behavior:** false engine use (Ziwei when unconnected / Qimen), fake multi-engine or
    Saju↔Ziwei consensus, unsupported theory (신강/신약/용신/격국/12운성/12신살), or unsupported specific timing.
12. **Raw fallback behavior:** only harmless, schema-less prose is shown raw; anything semantically unsafe is replaced.
13. **Timing anchor design:** `{ years:number[], daewoonAgeSpan:{min,max}|null }` built in `sajuEvidenceAdapter`
    from real 세운/월운 target years + birth year + Daewoon cycle ages; consumed by the validator as an allowlist.
14. **All-field validation coverage:** coreSummary/disposition/coreInterpretation/strengths/cautions/
    domainInterpretation/futureFlow/followUps.
15. **Follow-up validation:** empty/duplicate not introduced; unsupported-timing / unconnected-engine / theory
    followUps individually dropped; a bad followUp does NOT reject the whole (still-safe) answer.
16. **Time-axis evidence preservation:** see FIX 3 — reaches the rendered prompt (`시간축 연결`, 대운, 세운, 월운).
17. **Provenance preservation:** 立春(`START_OF_SPRING_IPCHUN`)/12-Jie(`TWELVE_JIE_JIEQI`) + every reused ruleVersion
    (product, ten-gods, 세운, 월운, time-axis) survive to the prompt.
18. **Solar/Lunar full prompt equivalence:** verified via `buildPrompt` (pipelineClosure §FIX 4).
19. **Malformed grounding behavior:** strict `toSafeGrounding` → UNAVAILABLE; a builder returning malformed
    grounding degrades the request to fail-closed (grounded=false), never crashes (tested).
20. **Five consultation scenarios:** 성격 / 직업 / 재물 / 흐름 / follow-up — distinct, grounded, safe (pipelineClosure §8).
21. **SAJU regression:** green (frozen + myungri time-axis + grounding E2E).
22. **Ziwei regression:** green (engine + evidence sections + dual-engine E2E).
23. **Qimen remains unconnected:** `ENGINE_CONNECTED.qimen=false`; any Qimen-use claim rejected.
24. **Total tests:** **49 suites / 523 tests PASS** (was 505 → +18; zero regression).
25. **TypeScript:** 0 errors in changed files (11 pre-existing Expo-Router route-union errors only — baseline unchanged).
26. **npm ls:** OK (iztro@2.5.8, lunar-javascript@1.7.7).
27. **Expo production web export:** `Exported: dist` (exit 0).
28. **git diff --check:** clean (LF→CRLF warnings only).
29. **Security:** no OPENAI_API_KEY / secret in client or commit; user input cannot overwrite system grounding;
    client never fabricates trusted facts; rejected raw LLM content never shown via a validation bypass.
30. **Remaining material defects:** none known.
31. **Remaining minor defects:** structuredResult reload persistence = DEFERRED_MINOR (live render works; not
    extended by this closure); false-claim/consensus validation uses narrow high-precision regexes (documented
    residual risk — the prompt is the first defense; a rejected result is un-blessed, not regenerated).
32. **Owner actions (do NOT do now):** deploy Supabase Edge `chat` + set `OPENAI_API_KEY` (server-side); then a
    logged-in live consultation / Solar-Lunar / timing / Ziwei test. Code+tests complete against the mock boundary.
33. **Commit hash:** this local closure commit (SHA in `git log -1`) — local only. No push / deploy / DB migration.
34. **Final status:** (superseded by PATCH #2 below).

---

# PATCH #2 — Codex re-review of `90f3875` (NEEDS_TARGETED_FIX → 3 remaining findings)

Codex re-review: **Finding 1 (semantic rejection/raw leak) PASS, Finding 4 (Solar/Lunar equivalence)
PASS.** Frozen calc still PASS. 3 material findings closed here as integration-only fixes. Starting
HEAD `90f3875` → ending = this PATCH #2 commit. Frozen `interpretation/**` still byte-identical to
`7c7ed82`; Ziwei `02f1382` preserved; Qimen still disconnected.

## FIX A — relative / age / month timing (Finding 2 refinement)

Explicit years were gated, but relative/age claims slipped through. Now the evidence carries a
`referenceYear` (current 세운 year) + `hasMonthlyEvidence` flag alongside `years` + `daewoonAgeSpan`,
and `hasUnsupportedTiming` resolves:
- **Relative-definite years** 올해(=ref)/내년(ref+1)/내후년(ref+2) and numeric **"N년 뒤/후"** → the
  resolved year must be in `years`, else unsupported. (`referenceYear=null` ⇒ any relative year fails.)
- **Months**: "다음 달/이듬 달" is never evidence-backed (no next-month 월운 computed) → reject; "이번 달"
  requires `hasMonthlyEvidence`.
- **Ages / decades / life-stages** (N세·N0대·중년/장년/노년/말년/청년/초년): with **no** Daewoon age span →
  ANY age claim fails-closed; with a span → numeric ages / decades outside the span fail.
- **Vague** language (향후 몇 년, 앞으로, 조만간) carries no resolvable period and is intentionally allowed.
Applied to every user-facing field: core prose → SEMANTIC_REJECTED; futureFlow → stripped; followUp →
that chip removed. Tests: `pipelineClosure.test.ts` "PATCH#2 FIX A" (13 assertions incl. the §9 matrix).

## FIX B — complete deterministic evidence preservation (Finding 3)

- **Daewoon ten-gods**: the 대운 lines now serialize the FULL `PillarTenGodProfile` — 천간 십신 **+ 지지
  정기 십신 + 지장간(여기/중기/정기) 십신** — not stem-only. (Reads the already-computed profile; no recompute.)
- **Provenance / assumptions / limitations**: the `근거·한계` section now serializes the ACTUAL arrays
  from each result object (대운십신/세운/월운/시간축/월령/통근투간 `ruleVersion`, `assumptions`, `limitations`)
  + the time-axis `provenance` lineage (yearMonthPillar/tenGod/hiddenStem/relation ruleVersions) — real
  values, deduped, not handcrafted summaries.
- **Prompt-delivery proof**: `pipelineClosure.test.ts` "PATCH#2 FIX B" runs the real 1990-08-15 chart
  through buildConsultationGrounding→renderGroundingContext and asserts the PROMPT contains Daewoon
  direction, start/end age, `〈현재〉` active cycle, 지지 + 지장간 ten-gods, `시간축 연결`, `ruleVersions`,
  `도출 근거`, `가정:`, `한계(계산):`, 세운, 월운.

## FIX C — strict runtime grounding + direct buildPrompt fail-closed (Finding 5)

- `isValidTimingAnchors` now also validates `referenceYear` (number|null), `hasMonthlyEvidence`
  (boolean), and rejects `daewoonAgeSpan` with **min > max** (startAge>endAge). `toSafeGrounding` now
  also type-checks `assessmentSummary` / `assessmentVersion`. Adversarial matrix extended in
  "PATCH#2 FIX C" (invalid referenceYear, span order, non-number years, bad monthly flag, malformed
  assessmentSummary, + the valid case) on top of the existing null/enum/section/consistency cases.
- **Direct buildPrompt** now calls `toSafeGrounding` at its own boundary (not only chatService), so a
  malformed grounding handed straight to `buildPrompt` degrades to fail-closed UNAVAILABLE and never
  throws — proven by "FIX 5 — a grounding builder that returns malformed grounding does NOT crash".

## PATCH #2 gates

- Full Jest **49 suites / 541 tests PASS** (was 523 → +18; zero regression).
- TypeScript: 0 in changed files (11 pre-existing route-union errors only). Expo web export OK.
  npm ls OK. git diff --check clean. No secrets. Frozen `interpretation/**` identical to `7c7ed82`.
- Finding 1 + Finding 4 regressions re-verified green (semantic-rejection + Solar/Lunar equivalence tests).
- **Final status:** (superseded by PATCH #3 below).

---

# PATCH #3 — Codex re-review of `2eb5cec` (NEEDS_TARGETED_FIX → 2 remaining findings)

Codex re-review: Findings 1/2/4 + direct-buildPrompt + scenarios + follow-up + gates **PASS**. Only
Finding 3 (raw ENGINE-12 Daewoon metadata) and Finding 5 (strict AVAILABLE shape) remained. Both closed
here, integration-only. Frozen `interpretation/**` still byte-identical to `7c7ed82`; Ziwei `02f1382`
preserved; Qimen still disconnected.

## FIX #1 (Finding 3) — raw ENGINE-12 Daewoon metadata preserved to the prompt

Root cause: `bundle.daewoon` (the raw `SajuDaewoonResult`) was passed to the adapter but only
`.direction` was read; its `.cycles[].ordinal`, `.provenance`, `.assumptions`, `.limitations` were
dropped. Now:
- **Cycle ordinal**: 대운 lines render `제{ordinal}대운` from the canonical `DaewoonCycle.ordinal`
  (verbatim; never renumbered from array position).
- **ENGINE-12 provenance**: a dedicated `근거·한계` line serializes the real `DaewoonProvenance` object —
  `ruleId@ruleVersion` + directionRule (`YANG_MALE_YIN_FEMALE_FORWARD`) + progression/interval/
  start-offset/rounding rules + solar-term provider (`lunar-javascript@1.7.7`/`deokbunai.solar-term.v1`)
  + boundary precision.
- **Assumptions / limitations**: `bundle.daewoon` is now part of the meta-collection loop, so its raw
  `assumptions[]` (`THREE_DAYS_OF_SOLAR_TERM_INTERVAL_EQUALS_ONE_SYMBOLIC_YEAR`, …) and `limitations[]`
  (`ROUNDED_START_AGE_IS_PRESENTATION_GRADE_NOT_ASTRONOMICAL_PRECISION`,
  `SAME_UTC_MINUTE_AS_A_JIE_BOUNDARY_IS_AMBIGUOUS`, `V1_SUPPORTED_BIRTH_RANGE_1970_01_01_THROUGH_2050_12_31`)
  fold into the `가정:` / `한계(계산):` lines — Codex's expected supported-range / boundary-ambiguity /
  rounded-age-precision limitations. No recompute; the values are read from the frozen result object.
- **Prompt-delivery proof**: `pipelineClosure.test.ts` "PATCH#3 FIX #1" runs the real 1990-08-15 chart
  through renderGroundingContext and asserts all of the above are in the rendered prompt.

### Evidence completeness table

| Daewoon field | Status |
|---|---|
| cycle ordinal | **CONNECTED_TO_PROMPT** (`제{ordinal}대운`) |
| ENGINE-12 provenance | **CONNECTED_TO_PROMPT** (`대운 도출(ENGINE-12) …` line) |
| ENGINE-12 assumptions | **CONNECTED_TO_PROMPT** (`가정:` line) |
| ENGINE-12 limitations | **CONNECTED_TO_PROMPT** (`한계(계산):` line) |

## FIX #2 (Finding 5) — strict AVAILABLE shape validation

`isValidEngineEvidence` now requires, for `availability === 'available'`: a **non-empty summary AND**
`hasUsableSections` (≥1 section, each with a non-empty label + ≥1 non-empty-trimmed line). Half-shaped
"available" (summary-only, sections-only, empty label, empty/whitespace lines) → fail-closed UNAVAILABLE.
`isValidTimingAnchors` now enforces integer + sanity-range on `years` and `referenceYear` (rejects
2026.5 / -1 / NaN / Infinity), and integer + `min ≥ 0` + `max ≥ 0` + `min ≤ max` on `daewoonAgeSpan`
(rejects fractional / negative / reversed). `assessmentSummary`/`assessmentVersion` type-checks retained.
Direct-buildPrompt safety (Finding via §11) retained. Matrix: `pipelineClosure.test.ts` "PATCH#3 FIX #2"
covers §15 cases 1–20.

## PATCH #3 gates

- Full Jest **49 suites / 547 tests PASS** (was 541 → +6; zero regression). TypeScript 0 in changed
  files (11 pre-existing route errors only). Expo web export OK. npm ls OK. git diff --check clean.
  No secrets. Frozen `interpretation/**` identical to `7c7ed82`. Ziwei + dual-engine + Solar/Lunar +
  semantic-rejection + relative-timing regressions all green.
- **Finding 3: FIXED. Finding 5: FIXED.** No material computed-but-dropped evidence remains.
- **Final status:** (superseded by PATCH #4 below).

---

# PATCH #4 — Codex absolute-final 2-point closure (atop `e913913`)

Frozen `interpretation/**` still byte-identical to `7c7ed82`; Ziwei preserved; Qimen disconnected.

## A1 — complete ENGINE-12 Daewoon provenance

The `대운 도출(ENGINE-12)` line previously dropped three fields still emitted upstream. Now serialized
from the real `DaewoonProvenance` object: **`adapterRuleVersion`** (`deokbunai.solar-term-lunarjs-adapter.v1`),
**`sourceTimeBasis`** (`FIXED_UTC_PLUS_08`), and **`timezoneDataVersion`** (conditional — rendered as
`tzdata …` only when present). Together with the already-present ruleId/ruleVersion/direction/progression/
interval/start-offset/rounding/solar-term-provider/solar-term-ruleVersion/boundary-precision, the full
provenance object now reaches the prompt. Proven by `pipelineClosure.test.ts` "PATCH#3 FIX #1" (extended
to assert `deokbunai.solar-term-lunarjs-adapter.v1` + `FIXED_UTC_PLUS_08`). No recompute.

## A2 — exact 1970–2050 runtime year range

`isPlausibleYear` narrowed from the 1900–2100 sanity bound to the **frozen product policy
`V1_SUPPORTED_BIRTH_RANGE_1970_01_01_THROUGH_2050_12_31`** (`SUPPORTED_YEAR_MIN=1970`,
`SUPPORTED_YEAR_MAX=2050`). Applied uniformly to `referenceYear` and every `years[]` item. 1969/2051 now
fail closed; 1970/2026/2050 valid; 2026.5/NaN/Infinity/-1/string still fail. NOT a new calendar rule —
it mirrors the existing product-supported range. Matrix: `pipelineClosure.test.ts` "PATCH#4 A2" (boundary
cases for referenceYear + years).

## PATCH #4 gates

- Full Jest **49 suites / 549 tests PASS** (was 547 → +2; zero regression). tsc 11 pre-existing route
  errors only. Expo web export OK. npm ls OK. git diff --check clean. No secrets. Frozen identical to
  `7c7ed82`. Ziwei + dual-engine + Solar/Lunar + semantic-rejection + relative/age-timing + strict-shape
  regressions green.
- **A1: FIXED. A2: FIXED.** No material provenance field dropped; runtime range matches the frozen policy.
- **Final status:** `READY_FOR_CODEX_MYUNGRI_ABSOLUTE_FINAL_REVIEW`. Persistence still DEFERRED_MINOR.
  Owner action unchanged (deploy edge `chat` + `OPENAI_API_KEY`).
