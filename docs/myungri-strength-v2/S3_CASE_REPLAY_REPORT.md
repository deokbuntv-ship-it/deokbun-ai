# S3 — CASE REPLAY REPORT (P0 REMEDIATION, v3.1.0)

**Updated for the final single-P0 closure patch (`NEW-P0-01`).** Two correction rounds are folded into this
version: (1) the P0 remediation batch's original 13-case replay, and (2) a second-pass Codex re-audit that
found four season-role (`AX02_fact`) errors in round 1's hand computation, plus the removal of
`TRANSFORM-01` (§below), which changes `DTS-HUAXIANG-03`'s special-structure result. No new cases collected
in either round. All records real, from the already-verified corpus.

## Method note — hand computation, not a running engine, corrected twice

Round 1 (P0 remediation) traced each case's stated classical facts by hand and caught one Day-Master
identity error (`DTS-JINGSHEN-01`, DM is 丙 not 甲). Round 2 (this patch) accepted four further corrections
to `AX02_fact` (season role) that a second-pass audit identified independently:

| CASE_ID | Round-1 season (wrong) | Corrected season | Bottom-line result change? |
|---|---|---|---|
| `DTS-CONGXIANG-01` | SUPPORTED | **DRAINED** | Yes: `ANCHORED→STRONG_LEANING` becomes `MIXED_STRUCTURE→MIXED_EVIDENCE` |
| `DTS-YUELING-02` | IN_COMMAND | **OPPOSED** | Yes: `ANCHORED→STRONG_LEANING` becomes `MIXED_STRUCTURE→MIXED_EVIDENCE` |
| `DTS-TIYONG-02` | OPPOSED | **DRAINED** | No: `DRAINED` and `OPPOSED` share the same `SYNTH-01` lookup bucket against a true root — still `MIXED_STRUCTURE→MIXED_EVIDENCE` |
| `DTS-SHUAIWANG-04` | OPPOSED | **NEUTRAL** | No: with root absent, `NEUTRAL` still routes through "follow `AX01_fact` alone" — still `UNANCHORED→WEAK_LEANING` |

These corrections are accepted as given rather than re-derived from scratch: round 1's own season-role
hand-computation is exactly the process that produced the `DTS-JINGSHEN-01` Day-Master error, so it carries
real, demonstrated error risk, and re-deriving 旺相休囚死 from unaided memory a second time risked repeating
that error rather than fixing it. This is a judgment call, disclosed rather than hidden: an independent
review is treated as more reliable here than a third attempt at the same manual derivation.

Separately, `TRANSFORM-01` (the node that used to grant `DTS-HUAXIANG-03` a `CANDIDATE` special-structure
flag) was removed this patch (`NEW-P0-01` — see `S3_OPERATIONAL_JUDGMENT_GRAPH.md` §2). This is NOT a
season-role correction; it changes `DTS-HUAXIANG-03`'s `specialStructureStatus` from `CANDIDATE` to
`NONE_DETECTED` because the transformation disjunct no longer exists at all.

## Mandatory 8 (remediation brief §39, corrected)

| CASE_ID | Root (AX01) | Season (AX02) | specialStructureStatus | structuralState → strengthClassification | Source reading | MATCH_TYPE |
|---|---|---|---|---|---|---|
| DTS-TIYONG-01 | TRUE (丙 hidden in hour 巳) | IN_COMMAND (month 午, fire's own season) | NONE_DETECTED | ANCHORED → STRONG_LEANING | 從其強勢 (從强-family: DM's own dominance) | COMPATIBLE |
| DTS-TIYONG-02 | TRUE (丙 hidden in year 寅 — existence only, no clash-removal credited) | **DRAINED** (corrected from OPPOSED) | NONE_DETECTED (root exists) | MIXED_STRUCTURE → MIXED_EVIDENCE | 從其弱勢 (source credits a clash with destroying the root — this graph no longer claims that) | MIXED_EVIDENCE_CORRECT |
| DTS-CONGXIANG-01 | TRUE (乙 hidden root at day branch 未, 蟠根在未) | **DRAINED** (corrected from SUPPORTED) | NONE_DETECTED (root exists) | MIXED_STRUCTURE → **MIXED_EVIDENCE** (corrected from STRONG_LEANING) | 從財 (source: DM submits despite the root, a compound judgment this graph does not attempt) | MIXED_EVIDENCE_CORRECT (upgraded — see narrative) |
| DTS-CONGXIANG-06 | TRUE (甲 hidden root at day branch 寅) | IN_COMMAND (month 卯, wood's own season) | NONE_DETECTED | ANCHORED → STRONG_LEANING | 從其旺神 (從强-family: DM's own party dominance) | COMPATIBLE |
| DTS-YUELING-02 | TRUE (戊 self-seated at day branch 辰) | **OPPOSED** (corrected from IN_COMMAND) | NONE_DETECTED | MIXED_STRUCTURE → **MIXED_EVIDENCE** (corrected from STRONG_LEANING) | SOURCE_STRONG (raw label) | MIXED_EVIDENCE_CORRECT — diverges from the raw label but tracks 任鐵樵's own argument (he explicitly rejects the surface 身旺 reading) better than a forced STRONG_LEANING did |
| BR-015 | FALSE (乙, zero wood hidden anywhere in 酉酉酉申) | OPPOSED (month 酉, metal season vs wood DM) | **CANDIDATE** (single disjunct fires) | UNANCHORED → WEAK_LEANING | 沈孝瞻: 棄命從煞 / 萬民英: 胞胎格 — two incompatible non-ordinary readings | SCHOOL_CONFLICT_DEFERRED |
| DTS-JINGSHEN-01 | TRUE (丙 self-seated at day branch 寅) | OPPOSED (month 子, water season directly conquers fire DM) | NONE_DETECTED | MIXED_STRUCTURE → MIXED_EVIDENCE | SOURCE_BALANCED | MIXED_EVIDENCE_CORRECT |
| DTS-BAGE-04 | TRUE (癸's same-element peer 壬 hidden in month 申) | SUPPORTED (month 申, metal generates water) | NONE_DETECTED | ANCHORED → STRONG_LEANING | 中和純粹 ("balanced and pure") | COMPATIBLE (granularity gap, disclosed — see prior round's note) |

## Supporting cases (smaller set, hand-verified)

| CASE_ID | Root | Season | specialStructureStatus | Result | Source | MATCH_TYPE |
|---|---|---|---|---|---|---|
| DTS-SHUAIWANG-03 | FALSE (source states 木無盤根之處 explicitly) | DRAINED/OPPOSED (太衰 tier) | NONE_DETECTED | UNANCHORED → WEAK_LEANING | SOURCE_WEAK | COMPATIBLE |
| DTS-SHUAIWANG-04 | FALSE (zero wood in 巳巳酉戌, source: 全無水氣) | **NEUTRAL** (corrected from OPPOSED) | NONE_DETECTED | UNANCHORED → WEAK_LEANING (unchanged — root-absent + NEUTRAL still follows root alone) | SOURCE_EXTREME_WEAK | COMPATIBLE (extreme-tier distinction lost — accepted, unchanged from round 1) |
| DTS-GANGROU-01 | TRUE (庚 self-seated ×2, 申申) | IN_COMMAND (month 申, metal's own season) | NONE_DETECTED | ANCHORED → STRONG_LEANING | ORDINARY_STRENGTH (旺之極矣, no 從 stated) | COMPATIBLE |
| DTS-XINGXIANG-18 | TRUE (庚 self-seated at year+day 申) | SUPPORTED (month 戌, earth generates metal) | NONE_DETECTED | ANCHORED → STRONG_LEANING | 從其強勢/權在一人 (從强-family) | COMPATIBLE |
| DTS-HUAXIANG-03 | TRUE (壬's peer 癸 hidden in hour 辰) | NEUTRAL (water in wood season, treated conservatively) | **NONE_DETECTED** (changed from CANDIDATE — TRANSFORM-01 removed, `NEW-P0-01`) | ANCHORED → STRONG_LEANING (unaffected — root exists, so "follow root alone" applies) | 化象斯真 (confirmed transformation) | GRAPH_MISMATCH (argued non-critical — see narrative; direct, disclosed cost of `TRANSFORMATION_JUDGMENT_V2 = DEFERRED`) |

## Aggregate accounting

| MATCH_TYPE | Count | Cases |
|---|---|---|
| `COMPATIBLE` | 7 | TIYONG-01, CONGXIANG-06, BAGE-04, SHUAIWANG-03, SHUAIWANG-04, GANGROU-01, XINGXIANG-18 |
| `MIXED_EVIDENCE_CORRECT` | 4 | TIYONG-02, CONGXIANG-01, YUELING-02, JINGSHEN-01 |
| `SCHOOL_CONFLICT_DEFERRED` | 1 | BR-015 |
| `GRAPH_MISMATCH` (argued non-critical) | 1 | HUAXIANG-03 |
| **Total** | **13** | |

**`CRITICAL_MISMATCH = 0`.**

## Case narrative — DTS-CONGXIANG-01, now MIXED_EVIDENCE (improved from round 1)

This remains the flagship "what we gave up" case: `specialStructureStatus` stays `NONE_DETECTED` (root
exists, so the single surviving disjunct still does not fire), so the graph still does not confirm the
source's own 從財 reading. But the CORRECTED season fact (`DRAINED`, not `SUPPORTED`) changes the ordinary
axis result from a confident `STRONG_LEANING` to an honest `MIXED_EVIDENCE` — root evidence leans one way,
season evidence leans the other, and no rule in this graph resolves the conflict. This is a strictly BETTER
outcome than round 1's: a chart the source treats as genuinely contested (從財 requires overriding a real
root) now gets an output that itself reflects genuine internal tension, rather than confidently asserting
`STRONG_LEANING` — which was arguably closer to a `GRAPH_MISMATCH` in spirit even though it wasn't flagged
`CRITICAL`. No new rule was added to produce this improvement; it fell out of correcting a factual input.

## Case narrative — DTS-HUAXIANG-03, the disclosed cost of deferring transformation judgment

Round 1 gave this case a `CANDIDATE` special-structure flag via `TRANSFORM-01`. That node is now removed
(`NEW-P0-01`) because its own inference needed result-element-scoped facts its declared inputs never
produced. With it gone, `SPECIAL-01`'s one remaining disjunct (Day-Master root-absence + season-opposed)
does not fire for this chart either (Day Master 壬 has a root) — so `DTS-HUAXIANG-03` now gets NO
special-structure flag at all, despite the source's confident 化象斯真 (confirmed transformation). This is
the direct, disclosed price of `TRANSFORMATION_JUDGMENT_V2 = DEFERRED`: the graph does not merely decline to
confirm transformation cases, it currently has no route to flag them as candidates either. Recorded as
`GRAPH_MISMATCH` (non-critical — the graph asserts `NONE_DETECTED`, an absence of evidence, not a confident
contradiction of the source) rather than smoothed over.

## ORDINARY_MEANINGFUL_DECISION_RATE

**ADEQUATE.** All 13 replayed cases still produce a named, non-default `structuralState` →
`strengthClassification`. `MIXED_EVIDENCE` is now hit by 4 of 13 cases (up from 2), which is a direct,
positive consequence of correcting hand-computation errors rather than a regression — it means genuine
root/season tension is being surfaced honestly instead of resolved by an error-prone guess. The two
genuinely missing capabilities, both disclosed rather than hidden, are: (1) special-structure detection for
"root present but overridden" following families (`DTS-CONGXIANG-01`-shaped), and (2) any transformation
detection at all, now that `TRANSFORM-01` is gone (`DTS-HUAXIANG-03`-shaped).

## What would raise this to HIGH

Two independent extensions, neither attempted this batch:

1. A `COMPLETE_BRANCH_ALLIANCE_FACT` provider (deferred, `V2_FACT_EXTENSION_CANDIDATES.md`) — would let
   `SPECIAL-01` add a genuinely executable third disjunct for root-present-but-overridden following charts.
2. A result-element-scoped root/season fact provider (deferred, same document, new entry this patch) — would
   let a transformation disjunct return safely, unlike the removed `TRANSFORM-01`.
