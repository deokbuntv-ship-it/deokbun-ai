# S3 — CASE REPLAY REPORT (P0 REMEDIATION, v3.0.0)

**Rewritten for the P0 remediation batch.** Per the remediation brief §33/§34, the prior graph's replay
metrics (23/41 EXACT, 0 critical mismatches) are explicitly NOT the target to recover — "do not try to
recover old replay metrics... a lower coverage rate is acceptable... we prefer 70% meaningful deterministic
outcomes + 30% honest unresolved over 95% forced outcomes with unsupported rules." This report replays the
**8 mandatory high-risk cases** named in the remediation brief §39, plus a smaller, carefully hand-verified
supporting set (rather than mechanically re-running all 41 prior cases, several of which would need
per-case hidden-stem/seasonal-role recomputation at a level of manual precision this format cannot fully
guarantee — see §Method note below).

No new cases collected. All records real, from the already-verified corpus.

## Method note — hand computation, not a running engine

This replay traces each case's stated classical facts (root existence, season role, transformation glyphs)
through the graph's node logic by hand, the same methodology used in the prior S2/S3 batch. During this
remediation, re-deriving `DTS-JINGSHEN-01`'s Day Master identity caught a genuine hand-computation error
from the prior batch (the day master is 丙, not 甲 — 甲 is the resource/印 star discussed in the source
text) that changed its classification from `STRONG_LEANING` to `MIXED_EVIDENCE`. This is disclosed rather
than quietly corrected, because it is direct evidence that hand-tracing complex charts at scale (41 cases,
prior batch) carries real error risk that a smaller, more carefully checked set reduces. The mandatory 8
were re-derived from raw pillars (stem/branch), not copied from the prior batch's conclusions.

## Mandatory 8 (remediation brief §39)

| CASE_ID | Root (AX01) | Season (AX02) | specialStructureStatus | structuralState → strengthClassification | Source reading | MATCH_TYPE |
|---|---|---|---|---|---|---|
| DTS-TIYONG-01 | TRUE (丙 hidden in hour 巳) | IN_COMMAND (month 午, fire's own season) | NONE_DETECTED (season not OPPOSED) | ANCHORED → STRONG_LEANING | 從其強勢 (從强-family: DM's own dominance) | COMPATIBLE |
| DTS-TIYONG-02 | TRUE (丙 hidden in year 寅 — existence only, no clash-removal credited) | OPPOSED (month 申, metal season vs fire DM) | NONE_DETECTED (root exists, so the following disjunct does not fire) | MIXED_STRUCTURE → **MIXED_EVIDENCE** | 從其弱勢 (source explicitly credits a clash with destroying the root — this graph no longer claims that) | MIXED_EVIDENCE_CORRECT |
| DTS-CONGXIANG-01 | TRUE (乙 hidden root at day branch 未, 蟠根在未) | SUPPORTED (month 辰, late spring, still within wood's growing season) | NONE_DETECTED (root exists) | ANCHORED → STRONG_LEANING | 從財 (source: DM submits despite the root, a compound judgment this graph does not attempt) | GRAPH_MISMATCH (argued non-critical — see narrative) |
| DTS-CONGXIANG-06 | TRUE (甲 hidden root at day branch 寅) | IN_COMMAND (month 卯, wood's own season) | NONE_DETECTED (root exists) | ANCHORED → STRONG_LEANING | 從其旺神 (從强-family: DM's own party dominance) | COMPATIBLE |
| DTS-YUELING-02 | TRUE (戊 self-seated at day branch 辰) | IN_COMMAND (month 寅, within 戊's brief 6-day governing sub-period, per source's own "正戊土司令，生於立春後六日") | NONE_DETECTED | ANCHORED → STRONG_LEANING | SOURCE_STRONG (raw label) | COMPATIBLE (raw-label match; deeper 任鐵樵 nuance about the broken 관인 chain not captured — accepted per §32, "do not chase the surface label further than the graph honestly supports") |
| BR-015 | FALSE (乙, zero wood hidden anywhere in 酉酉酉申) | OPPOSED (month 酉, metal season vs wood DM) | **CANDIDATE** (following disjunct fires) | UNANCHORED → WEAK_LEANING | 沈孝瞻: 棄命從煞 / 萬民英: 胞胎格 — two incompatible non-ordinary readings | SCHOOL_CONFLICT_DEFERRED |
| DTS-JINGSHEN-01 | TRUE (丙 self-seated at day branch 寅) | OPPOSED (month 子, water season directly conquers fire DM) | NONE_DETECTED | **MIXED_STRUCTURE → MIXED_EVIDENCE** | SOURCE_BALANCED | MIXED_EVIDENCE_CORRECT |
| DTS-BAGE-04 | TRUE (癸's same-element peer 壬 hidden in month 申) | SUPPORTED (month 申, metal generates water) | NONE_DETECTED | ANCHORED → STRONG_LEANING | 中和純粹 ("balanced and pure") | COMPATIBLE (granularity gap: this graph cannot distinguish "harmoniously strong" from "one-sided strong" — disclosed, not smoothed over; per §31 no bespoke BALANCED state was invented to close this gap) |

## Supporting cases (smaller set, hand-verified)

| CASE_ID | Root | Season | specialStructureStatus | Result | Source | MATCH_TYPE |
|---|---|---|---|---|---|---|
| DTS-SHUAIWANG-03 | FALSE (source states 木無盤根之處 explicitly) | DRAINED/OPPOSED (太衰 tier) | NONE_DETECTED | UNANCHORED → WEAK_LEANING | SOURCE_WEAK | COMPATIBLE |
| DTS-SHUAIWANG-04 | FALSE (zero wood in 巳巳酉戌, source: 全無水氣) | OPPOSED (衰極 tier) | NONE_DETECTED | UNANCHORED → WEAK_LEANING | SOURCE_EXTREME_WEAK | COMPATIBLE (extreme-tier distinction lost — accepted, P0-05 removed EXTREME states entirely) |
| DTS-GANGROU-01 | TRUE (庚 self-seated ×2, 申申) | IN_COMMAND (month 申, metal's own season) | NONE_DETECTED | ANCHORED → STRONG_LEANING | ORDINARY_STRENGTH (旺之極矣, no 從 stated) | COMPATIBLE |
| DTS-XINGXIANG-18 | TRUE (庚 self-seated at year+day 申) | SUPPORTED (month 戌, earth generates metal) | NONE_DETECTED | ANCHORED → STRONG_LEANING | 從其強勢/權在一人 (從强-family) | COMPATIBLE |
| DTS-HUAXIANG-03 | TRUE (壬's peer 癸 hidden in hour 辰) | NEUTRAL (water in wood season — 休/resting, not cleanly DRAINED or SUPPORTED; treated conservatively as NEUTRAL) | **CANDIDATE** (transformation disjunct fires: 甲 transparent for resulting wood + 卯 month in-command for wood) | ANCHORED → STRONG_LEANING (ordinary reading, reported alongside the CANDIDATE flag, independently) | 化象斯真 (confirmed transformation) | COMPATIBLE — the ordinary and special readings are reported side by side without contradiction, the intended v3.0.0 behavior (policy §1) |

## Aggregate accounting

| MATCH_TYPE | Count | Cases |
|---|---|---|
| `COMPATIBLE` | 8 | TIYONG-01, CONGXIANG-06, YUELING-02, BAGE-04, SHUAIWANG-03, SHUAIWANG-04, GANGROU-01, XINGXIANG-18, HUAXIANG-03 *(9 — see note)* |
| `MIXED_EVIDENCE_CORRECT` | 2 | TIYONG-02, JINGSHEN-01 |
| `SCHOOL_CONFLICT_DEFERRED` | 1 | BR-015 |
| `GRAPH_MISMATCH` (argued non-critical) | 1 | CONGXIANG-01 |
| **Total** | **13** | |

*(Count note: `COMPATIBLE` lists 9 case IDs against a stated count of 8 in the table header — corrected
here: `COMPATIBLE = 9`, total replayed = 13 cases across 5 distinct MATCH_TYPEs.)*

**`CRITICAL_MISMATCH = 0`.**

## Case narrative — DTS-CONGXIANG-01, the central "what we gave up" case

This is the one case in the mandatory 8 that the prior (v2.0.1) graph got RIGHT on paper — asserting
`HIGH_CONFIDENCE` following-pattern for a chart with a real root, via a compound test — and that the audit
correctly identified as internally INCONSISTENT: the general rule that produced that answer, read literally,
required root ABSENCE, which this chart does not have. The prior batch's case narrative papered over the
gap with prose ("root exists at a governing position; chart still follows — root alone does not block")
that never made it back into the formal rule. That is a textbook case-memorization pattern dressed as a
general rule (P0-01).

v3.0.0's honest answer is `NONE_DETECTED` for special structure and `STRONG_LEANING` for the ordinary
axes — neither of which is what 任鐵樵 concludes (從財). This is a real, disclosed loss of capability, not
a hidden one: the graph no longer claims to solve "when does a real root still get overridden by
overwhelming numerousness" — because no rule this program has found survives contact with BOTH
`DTS-CONGXIANG-01` (root exists, still follows) AND the ordinary `SHUAIWANG`-chapter charts (root absent,
does NOT follow) without either contradicting a real case or quietly leaning on a case ID. Per §8 of the
remediation brief, this is the textually correct outcome: "accept that those cases remain
CANDIDATE/INSUFFICIENT in V2. This is preferable to false HIGH_CONFIDENCE" (here, `NONE_DETECTED` rather
than `CANDIDATE`, since the specific test that would grant even `CANDIDATE` — root absence — is not met
either; the chart simply does not clear the bar this graph is willing to assert).

## ORDINARY_MEANINGFUL_DECISION_RATE

**ADEQUATE.** Every one of the 13 replayed cases produced a named, non-default `structuralState` →
`strengthClassification` (never a silent fallback) with the correct evidence attached. Two cases
(`TIYONG-02`, `JINGSHEN-01`) correctly land on `MIXED_EVIDENCE` rather than being forced into a leaning —
this is success, not failure, per §17's explicit requirement that `MIXED_EVIDENCE` be reachable. The one
genuinely missing capability is special-structure detection for the "從强/從旺 with an actually-absent DM
root" and "從財/從殺 with a present-but-overridden DM root" families (`CONGXIANG-01`-shaped cases) — named
explicitly rather than papered over, and not chased with an invented predicate.

## What would raise this to HIGH

A `COMPLETE_BRANCH_ALLIANCE_FACT` provider (deferred, `V2_FACT_EXTENSION_CANDIDATES.md`) that can check
"zero elemental trace anywhere, including hidden stems, for the outnumbered party" would let `SPECIAL-01`
add a third, genuinely executable disjunct distinguishing `DTS-CONGXIANG-01`-shaped root-but-still-follows
charts from ordinary rooted charts — without it, this remains the honest ceiling.
