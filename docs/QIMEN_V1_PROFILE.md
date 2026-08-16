# QIMEN DUNJIA V1 — Canonical Profile

The third DeokbunAI engine. **Question-time based** (not natal): it computes the 국(board) for the
instant the user submits the question, never from the birth chart. Facts only — no interpretation,
no scores, no consensus.

## Provider / version / license

| Item | Value |
|---|---|
| Provider | **qimen-dunjia** (時家奇門, 拆補法) |
| Version | **2.1.0** (pinned; `QIMEN_LIBRARY_VERSION`), imported from `qimen-dunjia/dist/qimen.min.js` (CJS) |
| License | **MIT** |
| ruleSetVersion | `qimen-dunjia-chaibu@2.1.0` (`QIMEN_RULESET_VERSION`) |
| Adapter | `QIMEN_ADAPTER_VERSION = 1.0.0` — the only file importing the Core is `qimenCoreAdapter.ts` |
| Activation | `deokbunai.qimen-activation.v1` (deterministic, rule-based) |

## Canonical profile (V1, fixed)

- **時家奇門** (hour-house), **拆補法 (Chai Bu)** 局法 — the method the library implements and DeokbunAI selected.
- **陰陽遁 division at the 二至**: 冬至→芒種 = 陽遁; 夏至→大雪 = 陰遁 (universal 時家 rule).
- **三元 (拆補)**: 節後 0–4일 = 上元, 5–9 = 中元, 10–14 = 下元 (5일 = 1원).
- **時間 기준**: the QUESTION (consultation) instant, as an **Asia/Seoul (UTC+9, fixed)** civil wall-clock
  (`epochToSeoulQueryTime`). V1 Korea-only policy — mirrors the Saju V1 Asia/Seoul zone. Recorded as an
  assumption in every board's provenance. **No LMT / true-solar-time** adjustment (the hour maps raw to 時辰).
- **Day/hour boundary, 子時, leap/calendar, 節氣→局 lookup**: owned by the provider (時家·拆補法 table).
- **Supported range**: whatever the provider's 節氣 table supports; unsupported 節氣 → fail-closed
  (e.g. 小满 currently throws → `calculation_failed`, never a fabricated board).

## Input policy / fail-closed states

Qimen runs ONLY for a timing/decision question WITH a question instant. `QimenResult.availability`:
`available` · `not_applicable` (non-timing question) · `missing_question_time` · `unsupported_case`
(invalid query time) · `calculation_failed` (provider threw / invalid board). No current-clock fallback
inside the engine (the caller supplies the intended instant); no birth reuse; no fabricated board.

## Deterministic fact inventory & classification

| Fact | Source | Classification | In Evidence | In Prompt |
|---|---|---|---|---|
| 陰陽遁 (dunType) | provider + independent 二至 rule | INDEPENDENTLY_VALIDATED | ✓ | ✓ |
| 三元 (sanyuan) | provider + independent 拆補 rule | INDEPENDENTLY_VALIDATED | ✓ | ✓ |
| 節氣 (solarTerm) | provider + lunar-javascript oracle | INDEPENDENTLY_VALIDATED | ✓ | ✓ |
| 질문 四柱 干支 (ganzhi) | provider + lunar-javascript oracle | INDEPENDENTLY_VALIDATED | ✓ | ✓ |
| 局數 (ju 1–9) | provider 節氣→局 table | PROVIDER_DETERMINISTIC_CHARACTERIZATION_LOCKED | ✓ | ✓ |
| 值符/值使 (+落宮) | provider | CHARACTERIZATION_LOCKED | ✓ | ✓ |
| 九宮·地盤·天盤·九星·八門·八神 | provider | CHARACTERIZATION_LOCKED (school-dependent) | ✓ | ✓ |
| 旬首·符首·時干·節後天數 | provider | CHARACTERIZATION_LOCKED | ✓ | ✓ |
| question-time basis (Asia/Seoul) | activation layer | CONVENTION_DEPENDENT (documented) | ✓ (provenance) | ✓ |
| 길흉 점수 / 성공확률 / 등급 | — | EXCLUDED_FROM_V1 (never computed) | — | — |
| long-term year prediction | — | EXCLUDED (question-time only; hasTimingEvidence=false) | — | — |

Golden validation (`qimenGolden.test.ts`) independently checks 陰陽遁·三元·節氣·query 干支 against
lunar-javascript + the universal 二至/拆補 rules across 10 representative fixtures. The 局數 and per-palace
八門/九星/八神 placement are **not** independently re-derived (school-dependent) and stay characterization-locked.

## Assumptions

1. Placement uses the pinned `qimen-dunjia` 時家·拆補法 conventions (provider-owned; not recomputed).
2. Question time = the consultation instant in **Asia/Seoul (UTC+9, fixed)**; this Korea-only local-time
   policy is the current implemented behavior and is NOT independently validated as a universal Qimen convention.
3. The hour maps directly to 時辰; no LMT / true-solar-time correction is applied.

## Limitations

- Provider-unsupported 節氣/inputs → fail-closed (no board). School/lineage differences mean the 局 and
  per-palace placements are provider-dependent, not independently cross-validated.
- The board is a **question-time situational** snapshot; it does NOT license specific long-term year
  claims (`hasTimingEvidence:false`, no timing anchors).

## Excluded from V1

Qimen interpretation/scoring engine (길흉/성공확률/등급), 大운-style long-term projections, formal
cross-engine consensus, non-Korea timezones/LMT, any birth-chart reuse.

## Integration

`chat question + instant → resolveQimenActivation (deterministic) → computeQimenBoard (provider) →
toQimenEvidence (sections+provenance) → buildConsultationGrounding (qimen slot) → renderGroundingContext
→ prompt`. `ENGINE_CONNECTED = {saju:true, ziwei:true, qimen:true}`.
