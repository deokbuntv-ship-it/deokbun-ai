# 자미두수(紫微斗數) ENGINE — RESEARCH & SPECIFICATION (v0.1, scaffold)

> **STATUS: RESEARCH/SPEC SCAFFOLD — NOT AN IMPLEMENTATION.**
> This document defines the *structure, input/output contract, calculation
> stages, and fixture requirements* for a 자미두수 engine. It deliberately does
> **NOT** contain final placement tables or formulas. Every calculation rule is
> tagged **CONFIRMED / SCHOOL-DEPENDENT / UNVERIFIED**; anything not CONFIRMED
> must be pinned to a **verified reference** before it is implemented. Per
> AI_CONSTITUTION 제3조/제18조, calculation rules are **never invented** — an
> unverified rule stays UNVERIFIED and the engine reports the affected output as
> `unavailable`, it does not guess.

Author: Claude (engine-external prep). Engine implementation ownership: **Codex**
(or a clearly separated Claude-owned path if Codex has not started — see §10).
Frozen 명리 engine (`src/features/interpretation/**`) is the reference for how a
DeokbunAI engine is structured; it is **not modified** by this work.

---

## 1. Scope & product rules

- 자미두수 is a **birth-chart** system: it consumes the **same normalized birth
  input as 사주명리** (solar datetime + timezone + gender + calendar basis). It
  is NOT the point-in-time (시점 질문) system — that is 기문둔갑 (see QIMEN spec).
- The engine produces **structured evidence only** (palaces, stars,
  transformations, periods). Interpretation/narrative is the LLM layer's job via
  the existing `StructuredAiResponse` contract; the engine never writes prose.
- Output must be expressible in the existing seam:
  `EngineEvidence { availability, summary?, detail? }` and the
  `evidence.ziwei` slot of `parseStructuredAiResponse` (see
  `src/features/analysis/aiOutput.ts`). Availability states already include
  `missing_birth_time`, `engine_not_connected`, `calculation_failed`.

## 2. Input contract (normalized)

Reuse the birth-normalization the 사주 engine already performs (do **not**
re-implement calendar math). Required fields:

| field | notes |
|---|---|
| solar birth datetime | Y/M/D + hour/minute, resolved to a definite instant |
| timezone / longitude | for true-solar-time correction (SCHOOL-DEPENDENT whether LMT correction is applied) |
| gender | 陰陽男女 drives 大限 direction |
| calendar basis | 자미두수 is computed on the **lunar** calendar (음력); leap-month handling is a known ambiguity (see §5) |
| birth-time accuracy | `exact` / `approximate` / `unknown` — `unknown` ⇒ 命宮 & hour-dependent stars are **not computable** ⇒ availability `missing_birth_time` |

**CONFIRMED:** 자미두수 requires the lunar month and the birth-hour branch (時支).
Without a known hour, the chart cannot be cast — the engine must return
`missing_birth_time`, never a default hour.

## 3. Output contract (target shape)

```
ZiweiChart {
  palaces: Palace[12]        // fixed order below, each carries its branch + stars
  lifePalace: PalaceRef      // 命宮
  bodyPalace: PalaceRef      // 身宮
  fiveElementBureau: string  // 五行局 (水二局/木三局/金四局/土五局/火六局)
  majorStars: StarPlacement[]     // 14 主星
  auxiliaryStars: StarPlacement[] // 보좌/살성 (subset is SCHOOL-DEPENDENT)
  transformations: SihwaMap  // 四化: 化祿/化權/化科/化忌 → star
  majorPeriods: DaeHan[]     // 大限 10-year periods (direction + bureau based)
  annual?: { yearBranch, ... } // 流年 (optional, later)
  ruleVersion: string        // which rule set produced this (for fixtures)
  warnings: string[]         // e.g. 'leap_month_ambiguous', 'lmt_not_applied'
}
```
Palace order (**CONFIRMED**, 12 palaces): 命宮 · 兄弟 · 夫妻 · 子女 · 財帛 · 疾厄 ·
遷移 · 交友(奴僕) · 官祿(事業) · 田宅 · 福德 · 父母.

## 4. Calendar prerequisites (reuse, do not reinvent)

- Solar→lunar conversion, leap-month determination, 時支 from local time, and any
  절기/LMT correction are **shared** with the 사주 engine. The 자미두수 engine
  should **consume the already-normalized** lunar date + hour branch rather than
  recomputing. **UNVERIFIED integration point:** confirm the frozen engine
  exposes (or can expose) lunar month/day + hour branch in a reusable form; if
  not, that adapter is the first Codex task (see §10).

## 5. Calculation stages (each tagged; formulas intentionally omitted)

1. **命宮 (Life Palace) location** — derived from **lunar month + birth-hour
   branch**. *CONFIRMED (structure)* that it is a function of (month, hour);
   *UNVERIFIED (table)* — the exact counting rule must come from a verified
   排盤 reference before coding.
2. **身宮 (Body Palace)** — also (month, hour) derived. *UNVERIFIED (table).*
3. **12-palace layout** — once 命宮 is fixed, the other 11 palaces follow the
   fixed order around the 12 earthly-branch positions. *CONFIRMED (structure).*
4. **五行局 (Five-Element Bureau)** — from the stem+branch of the 命宮 palace.
   *CONFIRMED (structure)*, *UNVERIFIED (exact納音→局 table).*
5. **紫微星 placement** — function of (五行局, lunar birth **day**). *CONFIRMED
   (inputs)*, *UNVERIFIED (table).* This is the anchor; the rest of the 紫微系
   and 天府系 stars are placed relative to it.
6. **14 major stars** — 紫微系(紫微·天機·太陽·武曲·天同·廉貞) + 天府系(天府·太陰·
   貪狼·巨門·天相·天梁·七殺·破軍). *CONFIRMED (which 14)*, *UNVERIFIED (relative
   offset rules).*
7. **Auxiliary / malefic stars (보좌성/살성/잡성)** — 문창·문곡·좌보·우필·천괴·천월,
   경양·타라·화성·영성·지겁·지공, etc. *SCHOOL-DEPENDENT* which subset is used and
   how a few are placed. Implement only the CONFIRMED-across-schools subset first;
   gate the rest behind `ruleVersion`.
8. **四化 (Transformations)** — 化祿/化權/化科/化忌 assigned to specific stars by
   the **birth-year heavenly stem (年干)**. *CONFIRMED (structure)*, but the
   **year-stem → star table is SCHOOL-DEPENDENT** (notably 化忌 assignments differ
   between lineages). Must pin one lineage per `ruleVersion` and document it.
9. **大限 (Major 10-year periods)** — starting palace + **direction** from
   陰陽男女 combined with 五行局; each 大限 spans 10 years. *CONFIRMED (structure +
   that direction depends on 陰陽男女)*, *UNVERIFIED (exact start age/table).*
10. **小限 / 流年 (annual)** — later phase; *UNVERIFIED*, out of first scope.

> Only stages whose table is CONFIRMED-and-referenced get implemented. A stage
> left UNVERIFIED makes its outputs `availability: 'calculation_failed'` or omits
> them — it never emits a guessed placement.

## 6. School / calendar uncertainty register (must be resolved by references)

- **Lineage/school (학파)** for 四化 (esp. 化忌) and for the auxiliary-star set.
- **Leap month (윤달)** handling: whether a leap-month birth uses the leap month
  itself or the preceding/following month — lineage-dependent. Surface a
  `leap_month_ambiguous` warning until pinned.
- **True solar time (LMT/균시차)** correction: applied or not, and with what
  longitude basis. Surface `lmt_not_applied` when skipped.
- **Time-zone / birth-place** basis for the hour branch near boundary times.
- **자시(子時) split** (early/late 子, 야자시/조자시) — affects both day pillar and
  hour, lineage-dependent.

## 7. Fixtures (verification-first)

Golden fixtures are required **before** implementation of any stage. Structure:

```
ziwei-fixture {
  input: { solarDateTime, timezone, gender, calendar },
  normalized: { lunarYear, lunarMonth, isLeapMonth, lunarDay, hourBranch },
  expected: {
    lifePalaceBranch, bodyPalaceBranch, fiveElementBureau,
    ziweiStarPalace, majorStarPlacements[], transformations{},
    majorPeriodStartAgeAndDirection
  },
  source: "<verified reference: named 排盤 tool / authoritative text + which lineage>",
  ruleVersion: "<lineage id>",
}
```
**Hard rule:** an `expected` value with no verifiable `source` is NOT added. Do
not hand-compute expected charts from this spec (this spec has no tables). Prefer
multiple independent references agreeing on the same chart.

## 8. Availability mapping (engine → seam)

| condition | `evidence.ziwei.availability` |
|---|---|
| birth hour unknown | `missing_birth_time` |
| engine not wired into pipeline | `engine_not_connected` |
| a required stage is UNVERIFIED / throws | `calculation_failed` |
| chart cast successfully | `available` (summary/detail populated) |

## 9. Integration seam (engine-external, Claude-owned)

The path from chart → LLM already exists as contracts:
`buildInterpretationContext` (`engineOrchestration.ts`) → `EngineEnvelope` →
`StructuredAiResponse.evidence.ziwei`. When the engine lands, the only new
engine-external work is an **adapter** that maps `ZiweiChart` → `EngineEvidence`
(summary of palaces/stars/四化 relevant to the question). No fabricated facts:
if a field is `calculation_failed`, the adapter forwards that state.

## 10. Ownership & Codex handoff

- **Engine implementation is Codex-owned** (it is a divination calculation engine
  in the same family as the frozen 명리 engine). If Codex has NOT started 자미두수
  by the time implementation is unblocked, a Claude-owned engine may live in a
  **separate path** (e.g. `src/features/ziwei-engine-claude/`) and must NOT touch
  `src/features/interpretation/**`.
- **First Codex tasks (unblocked):** (1) confirm/expose reusable normalized lunar
  date + hour branch from the 명리 engine; (2) pin a lineage (`ruleVersion`) and
  cite references for stages 1,4,5,8,9; (3) add referenced golden fixtures; (4)
  implement stage-by-stage against fixtures.
- **Do-not-fabricate:** no stage ships without a cited reference; unverifiable
  outputs stay `unavailable`.

## 11. Open questions for Owner/Codex

- Which 排盤 lineage is DeokbunAI's canonical 자미두수 standard? (drives 四化 +
  auxiliary set)
- Is LMT/true-solar-time correction applied product-wide (consistency with 사주)?
- Leap-month policy (align with whatever the 사주 engine already does).
