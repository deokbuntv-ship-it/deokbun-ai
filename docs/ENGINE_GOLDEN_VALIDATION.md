# Ziwei + Qimen — Independent Golden Validation (V1 rule lock)

> **Purpose (reviewable Codex handoff):** validate the EXISTING iztro / qimen-dunjia engines
> against an **independent** oracle, lock the canonical V1 rule set, and record every
> discrepancy with a classification. **No engine was rebuilt; no library replaced.** Scope is
> commercial/practical (§1) — representative independent coverage, not academic exhaustiveness.

## Independent oracle

**`lunar-javascript@1.7.7` (MIT, 6tail)** — a *separate* calendar implementation used read-only.
It is independent of **iztro** (iztro self-contains its own 干支 conversion) and it is the
**frozen SAJU/Daewoon basis** (`deokbunai.solar-term.v1`), so these checks also serve as the §11
cross-engine consistency check. On top of the oracle's 節氣 + day-count we apply the **universal,
non-school-dependent** 時家 rules (二至 陰陽遁 division; 拆補 5-day 三元) — so the derived
expectations are independent of qimen-dunjia's own 局-selection logic, not circular.

**Why not a full external chart oracle for the esoteric placements:** an authoritative,
lineage-matched external chart source could not be obtained + verified in this environment, and
hand-deriving 排盤/紫微 placements is both error-prone and forbidden by the constitution (rules
are never invented). So the star/局-placement layers are honestly left as **REFERENCE
UNCERTAINTY (E)** pending an owner-supplied reference — NOT fabricated. See "Remaining gap".

## License verification (§16) — authoritative from `node_modules` + lockfile

| package | version | license | commercial | in lockfile |
|---|---|---|---|---|
| iztro | 2.5.8 | **MIT** | ✅ | ✅ |
| qimen-dunjia | 2.1.0 | **MIT** | ✅ | ✅ |
| lunar-javascript (qimen-dunjia dep; also SAJU basis) | 1.7.7 | **MIT** | ✅ | ✅ (`^1.7.7`) |

All MIT → commercial rights clear. No GPL/AGPL/unclear licenses in the engine dependency chain.

---

## Ziwei — `iztro-default@2.5.8`

- **Canonical V1:** iztro `default` algorithm (never calls `astro.config()`), `fixLeap:true`,
  `ko-KR` output. **ruleSetVersion = `iztro-default@2.5.8`.** 中州派 is NOT implemented (V1 = one
  coherent rule set).
- **Independent golden** (`src/features/ziwei/__tests__/ziweiGolden.test.ts`, 10 fixtures):
  across all charts, iztro's **DAY + HOUR + YEAR 干支** match the lunar-javascript oracle
  (convention-invariant fields). Covered: multiple birth hours, male/female, 夏至, **leap-month
  era (2020 윤4월)**, post-立春, pre-1980, and a 子時 boundary observation. Plus structural
  invariants (12 palaces, exactly one 身宮, 命宮 present, 五行局/命主/身主 populated), provenance,
  ruleSetVersion, and fail-closed cases.
- **Validation result:** **PASS** for every independently-verifiable field. No SAME-RULE error.
- **Discrepancies + classification:**
  - **MONTH 干支 (자미 ≠ 사주) — class C/D (convention, NOT a bug).** iztro's `chineseDate` month
    pillar is the **lunar-month** 干支 (e.g. 1990-08-15 → 癸未/未月); 사주 (lunar-javascript/Codex)
    uses the **節-month** 干支 (甲申/申月). Both internally correct under their own system. Asserted
    explicitly as a documented difference; not treated as a failure.
  - **五行局 / 命宮 / 命主·身主 correctness, 14 major-star placement, 四化 table — class E
    (reference uncertainty).** SCHOOL-DEPENDENT; independently un-verified. Kept under the
    existing CHARACTERIZATION lock (`ziweiService.test.ts`) — which locks iztro@2.5.8 output, not
    ground truth.
- **Known limitations:** no true-solar-time/LMT (DECISION_REQUIRED, align with 사주 — §12);
  早/晚子時 day-boundary is a product-level time-policy question (§13, class D); `warnings[]` is
  hard-coded `[]` (the spec's `lmt_not_applied`/`leap_month_ambiguous` are not yet emitted);
  小限/流年 out of V1 scope.

---

## Qimen — `qimen-dunjia-chaibu@2.1.0`

- **Canonical V1:** 時家 + **拆補法** (三元: 節後 0–4/5–9/10–14일 = 上/中/下元; 二至 陰陽遁).
  **ruleSetVersion = `qimen-dunjia-chaibu@2.1.0`.** 置閏法/초신접기 NOT implemented (V1 = one method).
- **Independent golden** (`src/features/qimen/__tests__/qimenGolden.test.ts`, 10 fixtures):
  across all boards, qimen-dunjia's **dunType (陰/陽遁)**, **sanyuan (上/中/下元)**, governing
  **節氣** (charset-folded), and query **四柱 干支** match the oracle-derived expectations.
  Covered: 陽遁 + 陰遁, 上/中/下元, the 冬至 & 夏至 (二至) boundaries, and simp/trad charset terms
  (惊蛰/驚蟄, 谷雨/穀雨). Plus 9 palaces, ju ∈ [1,9], provenance, ruleSetVersion, adapter
  no-leak, and §10 capability-gating + fail-closed.
- **Validation result:** **PASS** for every independently-verifiable field. No SAME-RULE error.
- **Discrepancies + classification:**
  - **局數 (ju 1–9) — class E (reference uncertainty).** The 節氣→局 lookup table is provided
    only by the library (+ its README) here; not independently re-derived. Kept under the
    existing CHARACTERIZATION lock (`qimenService.test.ts` pins 小寒/中元/陽/**8국**/天輔/杜門 —
    which is exactly the library README's worked example → circular by itself).
  - **八門/九星/八神 per-palace placement — class E.** SCHOOL-DEPENDENT; characterization-locked.
- **§10 activation preserved (unchanged):** a non-timing question → `not_applicable`; a timing
  question with no question-time → `missing_question_time` (never the current clock). Qimen is
  not always-on.
- **Known limitations:** no LMT (DECISION_REQUIRED §12); 자시 boundary UNVERIFIED (§13, class D);
  `missing_question_time`/`unsupported_case` collapse to `calculation_failed` at the shared
  `EngineEvidence` seam (cause survives in `QimenResult.reason`) — a Codex wiring note, not fixed
  here (shared boundary).

---

## Cross-engine + policy observations

**17. Cross-engine calendar consistency (§11):** Ziwei (iztro) and 사주 (lunar-javascript) agree
on **YEAR / DAY / HOUR 干支** on representative and mid-period dates; they **materially differ on
the MONTH 干支** by design (자미=lunar-month, 사주=節-month). Qimen uses lunar-javascript, so its
干支 is by-construction consistent with the SAJU basis. **Verdict:** a real, user-visible
month-干支 difference exists between the 사주 and 자미 charts — but it is a **documented convention
difference (C/D), NOT a bug**, and per §11 it is reported here rather than "fixed" (do NOT build a
shared calendar). Owner/Codex decision: accept as a documented V1 limitation, or reconcile at the
product layer.

**18. LMT / true-solar-time (§12):** neither iztro nor qimen-dunjia applies LMT; both consume the
given wall-clock. Recorded, not compensated. Material only at longitude-sensitive boundary
minutes → unified product-level decision (do not solve inside an engine).

**19. 子時 / 夜子時 (§13):** iztro splits 早子(index 0)/晚子(index 12); the day-boundary 干支 at
23:00–00:59 is a policy question. Observed + recorded (a 子時 fixture asserts availability only,
not a forced day-干支). No multiple 子時 schools implemented.

## Remaining gap / unresolved blocker

The **only** thing between "independently validated" and "authoritative" is a set of
**owner-supplied reference charts** for the SCHOOL-DEPENDENT layers (Ziwei 星/四化 placement;
Qimen 局數 + 八門/九星/八神). Until then those layers are honestly **class E** and remain
characterization-locked (the tests catch library drift, not correctness). Everything foundational
(calendar/干支, 陰陽遁, 三元, 節氣, structure, provenance, fail-closed, activation) is
independently validated and can be frozen for V1.
