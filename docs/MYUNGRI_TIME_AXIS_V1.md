# DeokbunAI Myungri Engine V1 — Connected Time-Axis (세운 · 월운 · 관계)

> **Status: `APPROVED_FREEZE` (Codex, canonical commit `7c7ed82`) — see `MYUNGRI_V1_FREEZE.md`.** The 원국 → 대운 → 세운 → 월운
> deterministic time-axis, built ON TOP of the frozen SAJU engine (ENGINE-12) — reuse-first,
> facts-only, fail-closed. **No engine was rebuilt; no rule was invented.** Claude-owned,
> engine-external (`src/features/myungri/**`).
>
> **UPDATE — Saju year/month BOUNDARY FIX (`APPROVED_FREEZE`, `7c7ed82`):** the natal year pillar now rolls at
> **立春** and the month pillar at the twelve **節(Jie)** (was: lunar calendar year/month — a
> confirmed bug). This is a targeted correction inside `interpretation/saju/**` reusing the
> ENGINE-12 solar-term runtime (no new calendar engine). Golden lock: solar `2024-01-03` = lunar
> `2023-11-22` → **癸卯 / 甲子 / 丙寅**. 세운 attribution now rolls at 立春 and 월운 at Jie via
> `calculateSewoonForInstant` / `calculateWolwoonForInstant` — superseding the earlier "year-label
> only / sub-year 立春 out of scope" limitation in §8. See `MYUNGRI_YEAR_MONTH_BOUNDARY_FIX.md`.

## 0. What this delivers (owner directive A–L)

| Phase | Deliverable | State |
|---|---|---|
| A | Integrate ENGINE-12 (`94f9ecf`) as a frozen dependency | ✅ merged `ccdf0ce` (solar-term + Daewoon V1 now in-branch) |
| B | Recover 명리 100-data adoption table | ⚠️ **RECOVERY_NOT_FOUND** — see §6 (not fabricated) |
| C | Capability inventory | ✅ §2 |
| D | OSS selection behind adapter | ✅ `lunar-javascript@1.7.7` (MIT), §5 |
| E | Gap matrix | ✅ §2 |
| F | Missing canonical facts | ✅ pillar-relation tables (§4) — no duplication of existing derived facts |
| G | 세운 (Sewoon) | ✅ `calculateSewoon` |
| H | 월운 (Wolwoon) | ✅ `calculateWolwoon` |
| I | 원국↔대운↔세운↔월운 relations | ✅ `calculateMyungriTimeAxis` |
| J | Golden + independent + regression validation | ✅ 56 tests, §7 |
| K | Freeze V1 candidate | ✅ this doc + rule-version locks (§3) |
| L | Report + STOP | ✅ §8 |

## 1. Connected-by-construction (the core design)

The axis is ONE canonical rule family, not four isolated slices, because every layer is produced by
the SAME frozen functions that produce the natal chart:

- **세운 pillar** = frozen `calculateYearPillar(targetYear)` — the exact function that yields the
  natal YEAR pillar.
- **월운 pillar** = frozen `calculateMonthPillar(세운YearPillar, 月ordinal)` — the exact function
  (五虎遁 년상기월법) that yields the natal MONTH pillar; its 월간 is derived from the 세운 년간.
- **대운 연결** = ENGINE-12 builds Daewoon cycles by advancing the natal month-pillar's sexagenary
  index; 세운/월운 relations attach to that same axis via the shared sexagenary machinery.
- **십신 (ten-gods)** on 세운·월운 = frozen `calculateTenGod` (`deokbunai.saju-ten-gods.v1`) vs the
  natal 일간 — identical-by-rule to the natal chart's ten-gods.

Result: zero new astronomy, zero reinvention, and a genuinely connected axis. The headline proof is
a **삼합 that is absent from the natal chart alone but EMERGES on the axis** when a 세운/월운 지지
completes a natal half-set (test: `timeAxis.test.ts › EMERGENCE`).

## 2. Capability inventory + gap matrix (post-ENGINE-12)

| Need | Source | State |
|---|---|---|
| 원국 4주 (four pillars) | frozen `calculateFourPillars` / `executeSaju` | ✅ pre-existing |
| 십신 / 지장간 / 오행 | frozen `calculateSajuDerivedFacts` (`deokbunai.saju-*.v1`) | ✅ pre-existing |
| 오행 분포 | frozen `calculateFiveElementDistribution` | ✅ pre-existing |
| 대운 (Daewoon) | frozen `calculateSajuDaewoon` (ENGINE-12) | ✅ integrated |
| 절기 (solar term) | frozen `createLunarJsSolarTermAdapter` (ENGINE-12) | ✅ integrated |
| **세운 (Sewoon)** | **NEW `myungri/services/calculateSewoon`** | ✅ this build |
| **월운 (Wolwoon)** | **NEW `myungri/services/calculateWolwoon`** | ✅ this build |
| **합/충/형/파/해 · 삼합 · 방합** | **NEW `myungri/rules/pillarRelations`** | ✅ this build |
| **연결 time-axis** | **NEW `myungri/services/calculateTimeAxis`** | ✅ this build |
| 강약 / 용신 / 격국 | — | ❌ **out of V1 scope** (interpretive classification, deliberately not faked) |

## 3. Rule-version locks (frozen for V1)

| Layer | ruleVersion |
|---|---|
| 세운 | `deokbunai.myungri-sewoon.v1` |
| 월운 | `deokbunai.myungri-wolwoon.v1` |
| 관계 (합충형파해/삼합/방합) | `deokbunai.myungri-pillar-relations.v1` |
| 연결 time-axis | `deokbunai.myungri-time-axis.v1` |
| (reused) 십신 | `deokbunai.saju-ten-gods.v1` |
| (reused) 지장간 | `deokbunai.saju-hidden-stems.v1` |
| (reused) 년/월주 | `DEOKBUNAI_SAJU_V1_RULE_VERSION` |

Every result carries a `provenance` block recording each reused frozen ruleVersion (truthful
lineage; a regression test fails if the frozen constants drift from what provenance claims).

## 4. Relation tables (canonical, universal set)

Encoded explicitly and auditable in `rules/pillarRelations.ts`, each verified by unit + invariant
tests (`pillarRelations.test.ts`):

- **천간합** 甲己土·乙庚金·丙辛水·丁壬木·戊癸火 (nominal 化 element — actual 化 is interpretive, not asserted)
- **천간충** 甲庚·乙辛·丙壬·丁癸 (戊·己 무충)
- **지지 육합 / 육충 / 육파 / 육해** (each 6 pairs — invariant-tested)
- **삼합** 申子辰水·亥卯未木·寅午戌火·巳酉丑金 (완전국 + 반합)
- **방합** 寅卯辰木·巳午未火·申酉戌金·亥子丑水 (완전국)
- **형** 寅巳申·丑戌未 (상형) · 子卯 (무례) · 辰午酉亥 (자형)

A single pair may carry several relations simultaneously (e.g. 巳申 = 육합+파+형) — all are returned.

## 5. OSS decision

`lunar-javascript@1.7.7` (**MIT**, verified in lockfile; already the ENGINE-12 solar-term basis) →
**ACCEPT_RUNTIME**, used ONLY as an independent validation oracle in tests (year 干支). The runtime
pillar math reuses the frozen deterministic functions, so no raw OSS leaks into the canonical
contract. iztro / qimen-dunjia are out of SAJU scope.

## 6. 100-data recovery — `RECOVERY_NOT_FOUND`

The "명리 데이터 100종" adoption table (채택/조건부/제외/참고 판정) is **not present** in the repo,
`docs/`, or git history — it was a prior-conversation artifact. Per directive it was **not
re-invented and not fabricated**, and the build was **not held** on it. V1 scope is instead driven
by the existing frozen engine + universal, non-school-dependent 명리 rules + the vetted OSS oracle.
If the owner later supplies the SSOT table, adopted items map cleanly onto the relation/فact layer.

## 7. Validation (56 tests, all green; full suite 416/416, no regression)

- **Unit + invariant** (`pillarRelations.test.ts`): known 명리 facts + structural counts (5 천간합,
  4 천간충, 6/6/6/6 지지 pairs) + multi-relation pairs (刑合破) + 삼합/방합/삼형 완전국.
- **Behavioral** (`sewoonWolwoon.test.ts`): 2026=丙午; 丙年 寅월=庚寅 (五虎遁); ten-gods vs 甲 일간;
  원국 관계; fail-closed (invalid 일간 / non-integer year / month∉1..12).
- **Connected axis** (`timeAxis.test.ts`): composition; **삼합 emergence**; cross-layer 충;
  luck-layer-only pairing invariant; year-only path; fail-closed.
- **Independent golden** (`myungriIndependentGolden.test.ts`): 세운 干支 vs **lunar-javascript**
  calendar oracle (8 years); 십신 vs an **independent first-principles 生剋/陰陽 oracle**; 월운 stem
  vs the **五虎遁訣** table + month-branch sequence.
- **ENGINE-12 regression guard**: frozen pillar/ten-god/hidden-stem primitives still yield canonical
  values; version constants match provenance; Daewoon surface + golden fixtures present.

## 8. V1 scope boundaries (honest limitations — for Codex review)

- **세운** is keyed to a **year label** (사주 년); sub-year 立春/설날 date-level attribution is out of
  V1 scope (documented in `assumptions`/`limitations`).
- **월운** takes a **사주 月 ordinal 1..12** (寅월=1); mapping a civil Gregorian month → 月 ordinal is
  a product-layer concern (use the frozen calendar resolver), intentionally not inside this engine.
- **Relations are unweighted facts** — no 합화 성립 여부, no 충 해소, no strength. 강약/용신/격국 are
  NOT computed (interpretive classification; deliberately not faked).
- **형/파/해** use the standard canonical tables; minor school variants exist (documented).
- Not yet wired to the shared `EngineEvidence` / Assessment / Cross-Analysis / Grounding seams
  (per directive — deferred to a later, separately-reviewed integration).

## 9. What Codex should independently review

1. The relation tables in `rules/pillarRelations.ts` against your reference 명리 tables (esp. 파/해/형).
2. The V1 policy choices in §8 (year-label 세운, 月-ordinal 월운) — accept or refine.
3. Whether `강약/용신/격국` should enter a later scope as separate deterministic facts vs interpretive.
4. The eventual `EngineEvidence` seam shape for 세운/월운 (shared boundary — not touched here).
