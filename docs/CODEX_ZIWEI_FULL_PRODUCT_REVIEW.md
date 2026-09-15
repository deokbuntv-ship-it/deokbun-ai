# Codex Review — Ziwei (자미두수) FULL PRODUCT (engine → live dual-engine consultation)

> One-pass independent review handoff: recover the existing iztro Ziwei engine → EngineEvidence →
> Grounding → Prompt → LLM → validated structured consultation → live chat, **alongside the frozen
> SAJU engine** (dual-engine). **Status: `READY_FOR_CODEX_ZIWEI_FULL_PRODUCT_REVIEW`** (not
> APPROVED_FREEZE / PRODUCTION_READY / FULLY_VERIFIED). Local commits only; no push/deploy/DB.

## Baseline / ancestry

- **Starting HEAD:** `e077b34` (Myungri full-pipeline closure).
- Frozen SAJU/Myungri calc `7c7ed82` — **untouched** (`git status -- src/features/interpretation` empty).
- Owner dirty files preserved: `supabase/config.toml` (M), `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` (??).

## OSS / version / license (§6/§50)

| Item | Value |
|---|---|
| Provider | **iztro** (self-contained 干支/星/四化) |
| Version | **2.5.8** exact pin (package.json + lock; `IZTRO_VERSION`) |
| License | **MIT** (verified via `iztro/package.json`) — commercial-use OK |
| Calendar oracle (lunar→solar + golden) | `lunar-javascript@1.7.7` (MIT) — the SAME lib the frozen SAJU engine trusts |
| Rule set | `iztro-default@2.5.8` (`ZIWEI_RULESET_VERSION`), `fixLeap:true`, `ko-KR` |

No new Ziwei OSS added. iztro's global `astro.config()` is intentionally NOT called (shared side effect avoided); the pin fixes the default rule set deterministically.

## Canonical profile (§5) — unchanged from the existing implementation

`astro.bySolar(solarDate, timeIndex, gender, /*fixLeap*/ true, 'ko-KR')`. `timeIndex` = iztro 0–12
时辰 (早子=0…晚子=12) via `timeIndexFromHour`. Output is ko-KR (별/궁/干支 romanized Korean).

## Production chain (complete, dual-engine)

```
draft.birthInfo
 → toZiweiBirthInput (NEW; lunar→solar via lunar-javascript, solar pass-through)   [calendar READ, not a new impl]
 → computeZiweiChartMemoized → castAstrolabe(iztro) → adaptAstrolabe → validateZiweiChart   [existing engine, unchanged]
 → ZiweiResult (available | missing_birth_time | unsupported_case | calculation_failed)
 → toZiweiEvidence (EXTENDED: + structured sections + provenance/limitations + hasTimingEvidence:false)
 ↘
   buildConsultationGrounding (chat/services) runs BOTH engines:
     • frozen SAJU (executeSajuFromBirthInput + Myungri facts → toSajuEvidence)
     • Ziwei (above)
     → grounding.available when EITHER engine produced facts (dual / SAJU-only / Ziwei-only)
 → toSafeGrounding → renderGroundingContext (BOTH engines' sections + 엔진 구분 + convention note + qimen 미연결)
 → promptBuilder → supabaseEdgeLLMAdapter → edge `chat` (OpenAI key server-side)   [OWNER_ACTION for live]
 → parseStructuredConsultation (substance gate) → validateStructuredAgainstGrounding
       (timing gate + false-engine/theory + NEW cross-engine-consensus gate)
 → buildStructuredConsultationResult → ChatServiceResult.structuredResult → <StructuredConsultationResult>
 → contextual followUps → submitQuestion (re-grounds fresh each turn)
```

## Files (recovered vs. reused vs. new)

- **Recovered & verified callable (existing, unchanged calc):** `ziwei/services/ziweiService.ts`,
  `adapters/iztroAdapter.ts`, `adapters/ziweiResultAdapter.ts`, `adapters/ziweiInputAdapter.ts`,
  `validation/ziweiValidation.ts`, `services/ziweiCache.ts`, `domain/ziweiTypes.ts`.
- **Extended:** `adapters/ziweiEvidenceAdapter.ts` (added `sections`/provenance/limitations/
  hasTimingEvidence — summary/detail preserved), `ziwei/index.ts` (exports).
- **New:** `adapters/ziweiBirthMapper.ts` (BirthInfoDraft→ZiweiBirthInput, lunar→solar),
  `adapters/lunar-javascript-lunar.d.ts` (TYPE-ONLY augmentation for `Lunar`; frozen d.ts untouched).
- **Integration edits:** `chat/services/consultationGrounding.ts` (dual + degraded),
  `analysis/engineOrchestration.ts` (`ENGINE_CONNECTED.ziwei=true`), `chat/prompts/grounding.ts`
  (engine-attribution + convention discipline), `chat/prompts/structuredConsultation.ts`
  (cross-engine-consensus gate + instruction).
- **Tests:** `ziwei/__tests__/ziweiEvidenceSections.test.ts` (NEW), `chat/__tests__/dualEngineConsultation.test.ts`
  (NEW), updated `chat/__tests__/{consultationGrounding,structuredConsultationPipeline}.test.ts`,
  `analysis/__tests__/analysis.spec.ts`.

## Deterministic facts exposed (§10/§11)

`命宮/身宮` branch, `五行局`, `命主/身主`, 12 궁 (name·branch·身 flag·major stars), 四化 (star→transformation→landing palace),
chineseDate/lunarDate/timeRange/zodiac, provider/ruleSetVersion.

- **Fact classification:** calendar foundation (day/hour/year 干支) is **independently validated**
  against lunar-javascript (`ziweiGolden.test.ts`, §6). Star/四化 placement is **characterization-
  locked** to iztro-default@2.5.8 — honestly stated in `근거·한계` as "iztro default 학파 기준, 완전
  독립 검증 아님" (class E: reference uncertainty). NOT over-claimed.
- **Excluded from V1 grounding:** 大限(decadal) per-palace ranges — natal structure, no current
  유년/流年 timing computed → `hasTimingEvidence:false` so Ziwei does NOT unlock the LLM `futureFlow`.

## Input policy / Solar-Lunar / convention (§7/§8/§41)

- Ziwei requires an **EXACT** birth time → else `missing_birth_time` (no fabricated 시진). Gender +
  numeric date required → else `unsupported_case`.
- Lunar births convert to their canonical **solar** date via lunar-javascript (leap = negative
  month); solar 2024-01-03 and lunar 2023-11-22 yield **identical** Ziwei evidence (tested).
- **Saju↔Ziwei month-干支 convention difference is preserved as provenance, NOT reconciled** — Ziwei
  uses lunar-month 干支, Saju uses 立春/12-절. `근거·한계` states this is a 관례 차이, not a bug; the
  prompt tells the LLM not to overwrite one with the other. `ziweiGolden.test.ts` asserts the
  difference; `dualEngineConsultation.test.ts` §41 asserts neither engine fails the other.

## Result contract / fail-closed / orchestration (§13/§17/§18)

- `ENGINE_CONNECTED = { saju:true, ziwei:true, qimen:false }` — flipped only after the real path was
  tested end-to-end. **QIMEN stays disconnected.**
- Degraded-mode matrix (honest, nothing fabricated): dual · **SAJU-only** (Ziwei missing_birth_time
  / failed) · **Ziwei-only** (SAJU out of 1970–2050 range, e.g. pre-1970 births — iztro supports a
  wider span) · **both-unavailable → grounding unavailable**. A Ziwei failure never crashes the
  consultation (`buildZiweiEvidence` try/catch → calculation_failed).
- V1 policy note: grounding.available requires EITHER engine's facts; the Saju rule version is the
  reported `engineVersion` when present, else the Ziwei ruleset.

## Prompt / claim discipline (§20/§21/§23/§27/§40)

- `renderGroundingContext` emits BOTH engines' structured sections + an **엔진 구분** block (attribute
  each fact to its engine; never relabel) + the convention note (only when both available) + qimen 미연결.
- `validateStructuredAgainstGrounding` (second defensive layer after the prompt):
  - false Ziwei claim when Ziwei unavailable → reject; **allowed when Ziwei available** (tested both ways).
  - false Qimen claim (incl. "기문둔갑까지 …") → reject.
  - "세 학문 … 일치" → reject.
  - **NEW cross-engine consensus gate:** a STRONG "두 학문이 완전히 일치 / 사주와 자미두수가 모두 …"
    claim is rejected — V1 has NO deterministic cross-engine domain mapping (§22 insufficient_evidence
    is the honest default), so a full-consensus claim is never grounded. SOFT per-engine language is
    intentionally allowed (§21).
  - forbidden theory (신강/신약/용신/격국/12운성/12신살) → reject.

**Residual risk (documented):** the false-claim/consensus gates are NARROW high-precision regexes,
not an NL classifier — subtle phrasings rely on the prompt instruction; a rejected result falls back
to plain text (the claim is un-blessed as a card, not regenerated). The prompt is the first defense.

## Cross-analysis (§22) — no new score system

The existing `analysis/crossAnalysis.ts` vocabulary (`aligned/complementary/conflicting/
insufficient_evidence`) is **unchanged and not newly invoked** in the consultation path. V1 produces
NO deterministic cross-engine domain mapping; the honest default is per-engine separation +
consensus rejection (above). No fabricated cross-engine consensus.

## Tests / gates (§34–§48)

- **Full Jest: 48 suites / 505 tests PASS** (was 479 → +26; zero regression).
  - `ziweiEvidenceSections.test.ts` — sections/provenance/limitations/hasTimingEvidence + facts-only.
  - `dualEngineConsultation.test.ts` — prompt E2E (both engines' facts + 관례 + 엔진 구분 + qimen 미연결);
    Solar/Lunar identical Ziwei evidence; 5 dual-engine scenarios; degraded (SAJU-only, Ziwei-only,
    malformed-Ziwei render); false-claims (Qimen / 3-학문 / dual-consensus reject, legit Ziwei allow,
    Ziwei-claim-when-unavailable reject); convention difference; follow-up re-grounding.
  - Existing `ziwei{Service,Evidence,Cache,Golden}.test.ts` unchanged & green (golden 干支 + fail-closed + characterization lock).
- **TypeScript:** 0 errors in changed files (11 pre-existing Expo-Router route-union errors only;
  `Lunar` typed via the new augmentation d.ts).
- **npm ls:** OK (iztro@2.5.8, lunar-javascript@1.7.7).
- **Expo production web export:** `Exported: dist` (exit 0).
- **git diff --check:** clean (LF→CRLF warnings only). **Secret scan:** none in changed src.
- **Frozen Myungri / Qimen regression:** green; `interpretation/**` untouched; `7c7ed82` & `e077b34` ancestors.

## Remaining defects

- **Material:** none known.
- **Minor:** (1) structuredResult reload persistence remains **DEFERRED_MINOR** (inherited from Myungri
  closure; Ziwei did not extend it — live render works, reload loses the card). (2) false-claim/
  consensus validation is narrow-regex (residual risk documented). (3) Ziwei star/四化 remains
  characterization-locked (no independent oracle for placements) — honestly labeled, not a defect.

## OWNER_ACTION_REQUIRED (code cannot do)

Live LLM answers still require (nothing else blocks the pipeline): deploy Supabase Edge `chat` + set
`OPENAI_API_KEY` (server-side) + a logged-in user. All code/tests are complete against the mock LLM boundary.

## Continuation (post-Myungri-closure verification)

The Myungri pipeline closure patches (`e913913` … `ee3be57`) raised the shared integration bar; Ziwei
was **preserved unchanged** through all of them (`git diff 02f1382 HEAD -- src/features/ziwei` was empty
before this continuation). This continuation re-verified Ziwei against the raised bar and added the one
genuine parity item:

- **Assumptions parity**: `toZiweiEvidence`'s `근거·한계` section now carries an explicit `가정:` line —
  the REAL deterministic Ziwei assumptions (exact 시진 required · `fixLeap=true` leap-month policy ·
  star/四化 placement owned by iztro default 학파, not recomputed · ko-KR output). Matches the Saju
  evidence's `가정:` line; no calculation change. Reaches the prompt (`dualEngineConsultation` §37 asserts
  `fixLeap`; `ziweiEvidenceSections` asserts `가정:`/`fixLeap`).
- **Strict-grounding compatibility (patch #3/#4)**: real Ziwei evidence (non-empty summary + usable
  sections) passes the stricter `toSafeGrounding`; **Ziwei-only** degraded mode survives it end-to-end
  through chatService (new `dualEngineConsultation` test: pre-1970 birth → Saju `calculation_failed`,
  Ziwei `available`, `structuredResult` produced, `grounded=true`).
- **No timing anchors from Ziwei**: `hasTimingEvidence:false`, no `timingAnchors` (natal only; 大限
  excluded from V1) — so the Saju 1970–2050 timing-year gate is unaffected by Ziwei.
- Regression: Ziwei focused/golden/evidence/cache + dual-engine + degraded + false-claim + convention +
  Solar/Lunar all green; full Jest 49 suites / 550 tests.

## Performance / cache (verified)

`computeZiweiChartMemoized` (bounded FIFO, key = gender|solar-date|hour) is local pure iztro calc —
negligible vs. LLM latency; key isolates per birth profile (no wrong-user leakage). No new cache infra.

## Security (verified)

iztro is a local library (no external send); no birth payload logged in the evidence path; the client
never fabricates trusted Ziwei evidence (grounding is built server-path in chatService); no secret in
the Ziwei code; model output passes `classifyConsultationOutput` before render.

## Closure patch (Codex review of `3f904df` → NEEDS_TARGETED_FIX, 2 material defects)

Architecture PASSED; 2 localized defects closed. Provider/profile/frozen-Myungri unchanged.

- **PART A — strict civil-date validation.** `resolveZiweiInput` (ziweiInputAdapter) now runs a pure,
  deterministic Gregorian validity guard (proleptic leap rule, no `Date`, no calendar engine): month
  1–12, day ≥ 1, day ≤ real days-in-month. An impossible date → `unsupported_case` (never silently
  rolled over: 2024-02-30 does NOT become 2024-03-01, never a trusted chart). `toZiweiBirthInput`'s
  lunar path also hardened: a **failed** lunar conversion (lunar-javascript throws on a bad month/day)
  no longer falls back to treating the raw lunar Y/M/D as solar — it returns an invalid month so the
  Gregorian guard fails closed. (No lunar validator invented; lunar-javascript's own throw is reused.)
  Verified: 2024-02-29/2023-02-28/2024-04-30/2024-01-31 valid; 2024-02-30/2023-02-29/2024-04-31/
  2024-01-32/month-0/month-13/day-0 → unsupported_case; malformed lunar (month 13, day 31) → not
  available; Solar/Lunar equivalence + leap-month preserved. Production-grounding: Solar 2024-02-30 →
  `buildZiweiEvidence` not available (no fabricated facts), grounding does not crash.
- **PART B — validation-honesty wording.** The evidence `근거·한계` no longer implies 命宮/五行局 are
  independently verified. Corrected classification: **only the 干支 calendar foundation** (일·시·년) is
  INDEPENDENTLY_VALIDATED (cross-checked vs lunar-javascript); 命宮·身宮·五行局·命主·身主·궁/성계 배치·四化 are
  **PROVIDER_DETERMINISTIC_CHARACTERIZATION_LOCKED** (iztro default @2.5.8), NOT independently
  cross-validated (「특성 고정」). Added an honest limitation describing the ACTUAL code path: the hour is
  mapped raw to 时辰 (0–12) with **no timezone / LMT / true-solar-time** adjustment. Tests assert the
  corrected classification reaches the grounding and the old overstated "verified" wording is gone.
- Files: `ziweiInputAdapter.ts`, `ziweiBirthMapper.ts`, `ziweiEvidenceAdapter.ts` + NEW
  `ziweiDateValidation.test.ts` + `dualEngineConsultation.test.ts` (PART A4). Full Jest 50 suites / 572.
  Frozen `interpretation/**` identical to `7c7ed82`. Qimen disconnected.

## STATUS

`READY_FOR_CODEX_ZIWEI_CLOSURE_REVIEW`. Baseline `02f1382` → closure atop `3f904df`. Qimen NOT connected.
Deferred Myungri theory NOT started.
