# Saju YEAR/MONTH Boundary Fix — 立春 year · 12 Jie month (targeted)

> Corrects natal + 세운/월운 year/month **attribution** to standard Korean Four-Pillars boundaries.
> **Not** a calendar redesign: reuses ENGINE-12 Solar-Term V1 (lunar-javascript@1.7.7) as-is.
> Solar↔Lunar calendar conversion is unchanged. No push / deploy / DB.

## 1. Baseline
Branch `admin/master-operations-content`, baseline commit **`5feeb7b`** (Myungri time-axis V1).

## 2. Exact bug confirmed
`saju/fourPillars.ts` fed `calendar.lunarDate.year` / `calendar.lunarDate.month` **directly** into
`calculateYearMonthPillars` — i.e. it used the **lunar calendar** year/month as the Saju year/month.
Correct Four-Pillars rule: **year rolls at 立春, month rolls at the twelve 節(Jie)**. Result: wrong
year pillar for any birth in the 立春↔설날 gap, and wrong month pillar whenever the lunar month ≠
the 節 month (the common case).

## 3. Files changed
- **NEW** `saju/sajuTemporalAttribution.ts` — `resolveSajuYearAndMonth(epoch, adapter)`: most-recent
  節 (REVERSE `getPrevJie`) → month ordinal (立春=寅월1 … 小寒=丑월12) + Saju year (only 丑월 subtracts
  one Gregorian year). Rule `deokbunai.saju-year-month-attribution.v1`.
- `saju/fourPillars.ts` — derives a reference instant from the **civil date + resolved offset** (noon
  when time unknown), calls the resolver, then the **unchanged** `calculateYearPillar` +
  `calculateMonthPillar` (Five-Tiger) arithmetic. Solar-term adapter is an injectable param
  defaulting to `LUNAR_JS_SOLAR_TERM_ADAPTER`.
- `saju/contracts.ts` — additive provenance `yearMonthAttributionRule` + fail-closed reason
  `YEAR_MONTH_ATTRIBUTION_FAILED`.
- `saju/fourPillarsValidation.ts` — removed the stale lunar cross-derivation (day/hour only now) +
  asserts the new attribution provenance.
- `interpretation/index.ts` — exports the resolver/rule/types.
- **NEW** `myungri/services/luckForInstant.ts` — `calculateSewoonForInstant` /
  `calculateWolwoonForInstant` (§10/§11 date attribution) + `myungri/index.ts` exports.
- **NEW tests** `saju/__tests__/sajuBoundaryFix.test.ts`, `myungri/__tests__/luckForInstant.test.ts`.

## 4. Solar/Lunar conversion after fix
Unchanged and still available. `2024-01-03` (solar) and `2023-11-22` (lunar) remain two labels for
the same instant; both normalize via `gregorianDate` and produce the **identical** chart (proven).

## 5. Year-boundary after fix
立春. A birth **before** that year's 立春 → previous Saju year (2024-01-03 → **癸卯**, not 甲辰).
Not Lunar New Year, not Jan 1.

## 6. Month-boundary after fix
The twelve 節. 2024-01-03 → 子월 → **甲子**. A lunar-month change or a Gregorian-month change alone
does **not** move the month pillar; only crossing a 節 does (tested).

## 7. Golden (§4)
solar 2024-01-03 = lunar 2023-11-22 → **癸卯年 甲子月 丙寅日** ✅ (locked as `sajuBoundaryFix.test.ts`).

## 8. Solar-input vs lunar-input equivalence
Identical pillars for the same instant; additionally, a **tampered** `lunarDate` (year 2099/month 5)
with the same `gregorianDate` still yields 癸卯/甲子 — proving lunar date no longer drives the chart. ✅

## 9. Daewoon
ENGINE-12 unchanged/frozen. It takes year+month pillars as explicit inputs, so it inherits the
correction. Proven: corrected natal 癸卯/甲子 + MALE → direction **REVERSE** (癸 yin), first cycle
advances from 甲子 → **癸亥**. ✅

## 10. Sewoon
`calculateSewoonForInstant` rolls the year pillar at 立春 (before 立春 → previous Saju year). ✅

## 11. Wolwoon
`calculateWolwoonForInstant` rolls the month pillar at the active 節; a Gregorian/lunar month change
without a 節 does not move it. ✅

## 12. ruleVersion / provenance (§14)
Added explicit `provenance.yearMonthAttributionRule` = `{ ruleVersion:
'deokbunai.saju-year-month-attribution.v1', yearBoundary: 'START_OF_SPRING_IPCHUN', monthBoundary:
'TWELVE_JIE_JIEQI', solarTerm: lunar-javascript@1.7.7 / deokbunai.solar-term.v1 }`. The legacy
`productRule` (which describes the sexagenary/Five-Tiger STEM arithmetic, unchanged) is retained;
Codex may reconcile its `solarTermRole` label for the arithmetic layer in a follow-up.

## 13. Tests added
`sajuBoundaryFix.test.ts` (11): golden, 立春 before/after + boundary-day, 節 before/after, all-12-Jie
map, solar/lunar equivalence + tamper, leap-month invariance, time-unknown, provenance, §9 Daewoon.
`luckForInstant.test.ts` (6): 세운 立春, 월운 節, Gregorian-month-without-節 invariance.

## 14. Full test result
**40 suites / 433 tests PASS** (was 426; +17 boundary/luck tests; zero regression).

## 15. Gates
tsc: 0 errors in changed files (11 pre-existing stale `router.d.ts` route-union errors only) ·
`git diff --check` clean · `npm ls` consistent · no `build`/`export` npm script configured (pure
TS logic, no RN/route surface — tsc+jest apply).

## 16. Adversarial review (§16)
Verified none remain: Lunar-New-Year changing the Saju year (tamper test), lunar-month-1 changing the
month, Gregorian Jan 1 / month 1 changing year/month (12-Jie + boundary tests), leap month resetting
the month (invariance test), solar vs lunar divergence (equivalence test), corrected pillars failing
to reach Daewoon (§9 test), Sewoon using Jan 1 / Wolwoon using lunar rollover (instant tests).

## 17. Unresolved limitations
- **Exact-boundary tie:** a birth in the *same UTC minute* as a 節 uses `getPrevJie` (previous
  interval); ENGINE-12's minute-level policy governs (no seconds research, per §13). Astronomically rare.
- **Time-unknown on a 節-boundary DATE:** resolved at canonical **noon**, which can fall on the wrong
  side of that day's term instant — genuinely ambiguous without a birth time. Non-boundary dates are exact.
- **1970 range edge:** early-January-1970 births need the previous 大雪 (1969), outside the solar-term
  range → fail-closed (same 1970–2050 bound as ENGINE-12).
- `productRule.solarTermRole` label unchanged (describes the arithmetic layer) — Codex reconciliation note.

## 18. Commit
Local only (no push/deploy/DB). Hash recorded in the session report.

---

## Codex re-review — 4 TARGETED FIXES applied (status: `APPROVED_FREEZE`, canonical `7c7ed82`)

Applied on top of the boundary fix, reusing ENGINE-12 policy only (no new theory/calendar/OSS).
The 立春/12-Jie basis is treated as approved and is NOT reopened. ADOPT 3종 (`d256b51`) preserved.

- **FIX 1 — boundary-minute tie:** a reference within the SAME UTC minute as a 立春/Jie boundary
  (incl. exactly AT a term) → `AMBIGUOUS_BOUNDARY_MINUTE` (fail-closed), never forced to a side.
  Detected via a forward probe from one minute earlier (getPrevJie/getNextJie only return neighbours).
- **FIX 2 — unknown/approximate time on a boundary DATE:** if a 立春/Jie falls on the reference date
  and the time is not EXACT → `AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE` (never noon-forced). A
  boundary-free date keeps the existing safe calculation.
- **FIX 3 — supported range:** `resolveSajuYearAndMonth` now explicitly enforces ENGINE-12's
  1970-01-01…2050-12-31 (KST date) → `UNSUPPORTED_DATE_RANGE` for 1969/2051, covering natal +
  Sewoon/Wolwoon-instant (all share the resolver).
- **FIX 4 — provenance/runtime consistency:** `DEOKBUNAI_SAJU_V1_RULE_PROFILE` corrected to
  `yearPillarRule: SOLAR_TERM_START_OF_SPRING`, `monthPillarRule: SOLAR_TERM_TWELVE_JIE`,
  `solarTermRole: USED_FOR_YEAR_AND_MONTH_PILLARS`, ruleVersion bumped `…saju-pillar-rules.v2`
  (stale LUNAR_* removed). `isSupportedRuleProfile` + validation harness updated. EngineEvidence now
  attaches a `SAJU.EVIDENCE.YEAR_MONTH_ATTRIBUTION` RULE node so the year/month facts point to the
  立春/Jie attribution provenance.

Regression added (+8): 立春/Jie minute → ambiguous; boundary-date+unknown-time → ambiguous;
non-boundary safe; 1969/2051 unsupported; provenance = SOLAR_TERM + v2 with golden pillars unchanged.
Full suite **43 suites / 457 tests PASS**; expo web export OK. `interpretation/**` boundary logic is
the re-review target; ADOPT 3종 untouched and green.
