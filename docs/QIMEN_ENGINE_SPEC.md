# 기문둔갑(奇門遁甲) ENGINE — RESEARCH & SPECIFICATION (v0.1, scaffold)

> **STATUS: RESEARCH/SPEC SCAFFOLD — NOT AN IMPLEMENTATION.**
> Defines *structure, input/output contract, calculation stages, and fixture
> requirements* for a 기문둔갑 engine. Contains **no final 排盤 tables/formulas**.
> Every rule is tagged **CONFIRMED / SCHOOL-DEPENDENT / UNVERIFIED**; anything not
> CONFIRMED must be pinned to a **verified reference** before implementation.
> AI_CONSTITUTION 제3조/제18조: rules are **never invented** — an unverified rule
> stays UNVERIFIED and the affected output is reported `unavailable`, not guessed.

Author: Claude (engine-external prep). Engine implementation ownership: **Codex**
(or a clearly separated Claude-owned path — see §10). Frozen 명리 engine
(`src/features/interpretation/**`) is untouched.

---

## 1. Scope & product rules (CRITICAL DIFFERENCE from 사주/자미)

- 기문둔갑 in DeokbunAI is a **point-in-time (시점 질문)** system: its primary
  input is the **datetime of the question/decision**, NOT the user's birth chart.
  It answers "지금/이 시점에 …?" It must **not** be treated like a birth-based
  system, and it must not silently reuse the birth pillars as if they were the
  query time.
- Product framing: 시점 기반 판단(택시/의사결정 보조). The engine outputs a
  **structured board (盤)** + derived facts; the LLM narrates via
  `StructuredAiResponse.evidence.qimen`. Engine never writes prose.
- Availability states reuse the seam:
  `not_applicable` (non-timing question), `engine_not_connected`,
  `calculation_failed`, `available`.

## 2. Input contract

| field | notes |
|---|---|
| question datetime | the instant the query is asked/decided (local) — the primary input |
| timezone / longitude | for true-solar-time + hour boundary |
| location (optional) | SCHOOL-DEPENDENT whether direction/location is used in the query |
| solar-term state | derived from the datetime (절기) — drives 음둔/양둔 & 국수 |
| question intent | product-level routing: whether 기문 is even applicable (else `not_applicable`) |

**CONFIRMED:** the board is a function of the **query time** resolved to its
干支 (year/month/day/hour pillars) + the prevailing **절기(solar term)**. No
birth data is required or used.

## 3. Output contract (target shape)

```
QimenBoard {
  queryGanzhi: { year, month, day, hour }   // 사주(간지) of the QUERY time
  solarTerm: string                          // 절기
  dunType: 'yang' | 'yin'                     // 양둔 / 음둔
  ju: number                                  // 국수 (1..9)
  palaces: Palace[9]                          // 구궁(九宮) — Luoshu 3x3 (5 center)
  // per palace, the layered plates:
  earthPlate: StemMap                         // 지반(地盤) 天干
  heavenPlate: StemMap                        // 천반(天盤) 天干
  doors: DoorMap                              // 팔문(八門): 휴/생/상/두/경/사/경/개
  stars: StarMap                              // 구성/구천성(九星): 천봉/천예/…/천영 등
  deities: DeityMap                           // 팔신(八神): 직부/등사/태음/육합/…
  derived: { valueSymbols, keyPalace, ... }   // 용신/사간 등 파생 (SCHOOL-DEPENDENT)
  ruleVersion: string
  warnings: string[]
}
```
**CONFIRMED (structure):** 구궁 is the 3×3 Luoshu grid (palaces 1–9, 5 = center);
the four layers are 지반(earth stems) · 천반(heaven stems) · 팔문(8 doors) ·
구성(9 stars) · 팔신(8 gods). The **placement/rotation rules** for each layer are
UNVERIFIED here and must come from a referenced 排盤 method.

## 4. Calculation stages (each tagged; formulas intentionally omitted)

1. **Query 干支** — convert query datetime → year/month/day/hour pillars. *Reuse
   the 사주 engine's ganzhi + 절기 logic* (do not reinvent). *CONFIRMED (reuse).*
2. **음둔/양둔 (dun type)** — determined by the solar term (roughly 동지→하지 vs
   하지→동지 half-year). *CONFIRMED (that 절기 drives it)*, *UNVERIFIED (exact
   term→dun boundary table).*
3. **국수 (Ju, 1–9)** — from 절기 + 부두(符頭)/삼원(상·중·하원) counting.
   *CONFIRMED (inputs)*, *UNVERIFIED (exact 국 table)* and **SCHOOL-DEPENDENT**
   (拆補法 vs 置閏法 for 절기 boundaries — a major lineage split).
4. **지반(地盤) 三奇六儀 layout** — arrange 乙丙丁(三奇)+戊己庚辛壬癸(六儀) into
   the 9 palaces per 양둔(순포)/음둔(역포) and 국수. *CONFIRMED (structure)*,
   *UNVERIFIED (table).*
5. **천반(天盤)** — rotate relative to the hour's 旬首/부두 over the earth plate.
   *UNVERIFIED (table).*
6. **팔문(八門)** — 휴생상두경사경개; rotate from 직사문 per hour. *CONFIRMED
   (which 8)*, *UNVERIFIED (rotation).*
7. **구성/구천성(九星)** — 천봉·천예·천충·천보·천금(천심)·천주·천임·천영 계열;
   naming/count is **SCHOOL-DEPENDENT** (九星 vs 九天星 sets). *UNVERIFIED.*
8. **팔신(八神)** — 직부·등사·태음·육합·백호(구지)·현무(구천)·… ; set + order is
   **SCHOOL-DEPENDENT**. *UNVERIFIED.*
9. **파생 판단요소** — 용신(用神)·격국(格局)·길흉 조합 (예: 청룡반수, 비조질혈 등
   格). Heavily **SCHOOL-DEPENDENT / interpretive**; the engine should emit only
   **objective board facts**, and leave 격국 naming to a referenced table or to
   the LLM layer — never invent 格 names.

> As with 자미: no stage ships without a cited reference. Unverified layers make
> their outputs `calculation_failed` / omitted, never guessed.

## 5. School / method uncertainty register (resolve via references)

- **拆補法 vs 置閏法** for 절기/국수 (the dominant lineage split).
- **時家 기문** (hour-based) vs other scales — DeokbunAI is time-based; confirm
  scale explicitly.
- **九星 vs 九天星** naming set; **팔신** set and order.
- **양둔/음둔 boundary** exact terms.
- **旬首/부두/삼원** counting convention.
- **true-solar-time (LMT)** correction for the query time (consistency with 사주).
- **자시(子時) split** near midnight (야자시/조자시).

## 6. Fixtures (verification-first)

```
qimen-fixture {
  input: { queryDateTime, timezone, location?, },
  normalized: { queryGanzhi, solarTerm },
  expected: {
    dunType, ju,
    earthPlate{palace→stem}, heavenPlate{palace→stem},
    doors{palace→door}, stars{palace→star}, deities{palace→deity}
  },
  source: "<verified 排盤 reference + which lineage/method>",
  ruleVersion: "<method id>",
}
```
**Hard rule:** no `expected` board without a verifiable `source`. Do not
hand-derive boards from this spec (it has no tables). Prefer references that
state their method (拆補/置閏) so `ruleVersion` is unambiguous.

## 7. Availability mapping (engine → seam)

| condition | `evidence.qimen.availability` |
|---|---|
| question is not a timing/decision question | `not_applicable` |
| engine not wired into pipeline | `engine_not_connected` |
| a required layer is UNVERIFIED / throws | `calculation_failed` |
| board cast successfully | `available` |

## 8. Integration seam (engine-external, Claude-owned)

Same as 자미: `buildInterpretationContext` → `EngineEnvelope` →
`StructuredAiResponse.evidence.qimen`. New engine-external work when the engine
lands = an **adapter** `QimenBoard → EngineEvidence` that summarizes the palaces
relevant to the question. Forwards `not_applicable` / `calculation_failed`
faithfully; fabricates nothing.

## 9. Product routing note

Because 기문 is `not_applicable` to many questions, the orchestration layer
(`engineOrchestration.resolveEngineEligibility`, already implemented) decides
per-question whether to invoke it (`isTimingQuestion`). That gate is
engine-external and already exists; the engine only runs when eligible.

## 10. Ownership & Codex handoff

- **Engine implementation is Codex-owned.** If unstarted when unblocked, a
  Claude-owned engine may live in a **separate path** (e.g.
  `src/features/qimen-engine-claude/`), never touching
  `src/features/interpretation/**`.
- **First Codex tasks (unblocked):** (1) reuse 사주 ganzhi/절기 for the query
  time; (2) pick a method (拆補法/置閏法) + lineage and cite references for stages
  2–8; (3) add referenced golden fixtures; (4) implement layer-by-layer against
  fixtures; (5) keep 격국 naming out of the engine (reference table or LLM only).
- **Do-not-fabricate:** unverifiable layers/格 stay `unavailable`.

## 11. Open questions for Owner/Codex

- Which method (拆補法 vs 置閏法) and 九星/팔신 set is DeokbunAI's canonical 기문 standard?
- Is location/direction part of the query, or time-only?
- LMT correction consistency with 사주/자미.
