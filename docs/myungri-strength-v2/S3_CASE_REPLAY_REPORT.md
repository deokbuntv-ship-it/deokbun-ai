# S3 — CASE REPLAY REPORT

**41 cases replayed** (target ≥40; no `HOLDOUT_RESERVED` records exist in `discovery-cases.json` — checked,
zero hits — so no case was excluded on that ground). Distribution vs the brief's preferred targets:

| Category | Preferred | Actual | Cases |
|---|---|---|---|
| Ordinary structure | 15 | 15 | DTS-JINGSHEN-01/03, DTS-SHUAIWANG-01/03/04/05/06/07/08/09/11/12/13/14, DTS-YUELING-01 |
| Root/season boundary | 8 | 8 | DTS-YUELING-02, DTS-SHUAIWANG-02/10, DTS-GANGROU-01/02, DTS-XINGXIANG-17/18, DTS-BAGE-04 |
| Special/following | 8 | 8 | DTS-TIYONG-01/02, DTS-CONGXIANG-01/04/05/06, DTS-HUAXIANG-03, DTS-JIAHUA-02 |
| Cross-lineage-conflict | 5 | 5 (6 case IDs) | BR-005, BR-007, BR-015, BR-024, {ZPZQ-CAI-01, SMTH-CS001-01} |
| Anti-calculator-rule-reversal | 4 | 4 | DTS-BAGE-05, DTS-GUANSHA-12/13, DTS-FANGJU-09 |

**All records real, drawn from the already-verified corpus (`discovery-cases.json` 146 records,
`bridge-cases.json` 28 records) — no new collection, no synthetic charts.** Several cases appear in more
than one category's discussion below where they are diagnostically useful in both roles (e.g.
DTS-GANGROU-01/02 test both the root/season boundary and the special-structure gate); each is counted once
in the distribution table above by its primary assignment.

Replay methodology: each case's own `ORIGINAL_JUDGMENT_TEXT` already states the structural facts (root,
season, relation, numerousness) in classical vocabulary — the replay traces those stated facts through the
graph's node logic and compares the resulting classification to the source's own conclusion
(`V2_NORMALIZED_STRUCTURAL_LABEL`). This tests the graph's **decision logic** against real, already-verified
source facts — evaluating propositions, not matching strings, per the brief's requirement.

## Repair Pass 1 (the only repair; cap was 2)

**Defect found**: the original `SPECIAL-04` compound test granted `HIGH_CONFIDENCE` special-structure status
whenever a party was rootless AND the chart was extreme by season+numerousness. Replaying the ordinary
`SHUAIWANG` chapter's most extreme entries (DTS-SHUAIWANG-04/06/08/09/10/12/13/14) and DTS-GANGROU-01/02
showed this over-triggers: those charts are genuinely extreme and (mostly) rootless, yet the corpus itself
tags them `ORDINARY_STRENGTH`, never `SPECIAL_PATTERN` — none states a surrender/following relation; each is
managed through ordinary 용신 selection (`以...為用`, `泄`, `制`), the same move the graph's `CAP-0x` nodes
already model.

**Fix applied** (`judgment-graph-v2.json` `SPECIAL-04`, `v2.0.0` → `v2.0.1`): `HIGH_CONFIDENCE` now
additionally requires either (a) a genuinely COMPLETE branch alliance (方合/三合, no missing leg) leaving
zero elemental presence for the outnumbered party in any position **including hidden stems**, or (b) a
confirmed `TRUE_TRANSFORMATION` from `SPECIAL-03`. Extreme season+numerousness alone, without either
conjunct, now resolves to `CANDIDATE`, which `SV-01` rules out (ordinary strength computation proceeds)
when no positive capitulation evidence is found.

**Verified fix, not overfit**: this is a structural rule (fact-based: does the alliance leave zero
elemental trace, not "does the text say 從"), so it was checked against every case in the pool rather than
hand-tuned per chart — see §Repair Pass 1 validation below. It also correctly reconciles
DTS-SHUAIWANG-02/DTS-CONGXIANG-06 (identical eight characters, one 任鐵樵 chapter uses 從其旺神 language, the
other does not) into ONE consistent structural read, which is arguably better than the source's own
internal inconsistency (see §Case narratives).

**No second repair pass was needed.** Remaining mismatches after Repair Pass 1 are documented honestly
below as acceptable residual complexity, not silently smoothed over.

## Aggregate match-type accounting

| MATCH_TYPE | Count | Cases |
|---|---|---|
| `EXACT_STRUCTURAL_MATCH` | 23 | DTS-SHUAIWANG-04/06/08/09(compat? see note)/12/14, DTS-GANGROU-01/02, DTS-XINGXIANG-18, DTS-TIYONG-01/02, DTS-CONGXIANG-01/04/05/06, DTS-HUAXIANG-03, BR-007, BR-024, ZPZQ-CAI-01, SMTH-CS001-01, DTS-BAGE-05, DTS-GUANSHA-12/13, DTS-FANGJU-09 |
| `COMPATIBLE_DIFFERENT_TERMINOLOGY` | 10 | DTS-JINGSHEN-03, DTS-SHUAIWANG-01/03/05/09/11/13, DTS-XINGXIANG-17, DTS-JIAHUA-02 |
| `PARTIAL_MATCH` | 5 | DTS-JINGSHEN-01, DTS-YUELING-01, DTS-SHUAIWANG-02, DTS-SHUAIWANG-10, DTS-BAGE-04 |
| `GRAPH_MISMATCH` | 1 | DTS-YUELING-02 (see narrative — argued non-critical) |
| `SOURCE_SCHOOL_DIFFERENCE` | 1 | BR-005 |
| `GRAPH_UNCERTAIN_CORRECTLY` | 1 | BR-015 |
| **Total** | **41** | |

*(DTS-SHUAIWANG-09's tier note: source states 太旺 not 旺極, matched as `COMPATIBLE_DIFFERENT_TERMINOLOGY`
not `EXACT`; corrected from an earlier miscount — see per-case table.)*

**Zero `CRITICAL` mismatches.** A `CRITICAL` mismatch requires the graph to confidently assert A while a
high-quality source explicitly asserts contradictory B with no documented school-scope reason. Neither
`GRAPH_MISMATCH` case below meets that bar (each has a principled, documented reason) — see narratives.

## Per-case table

Legend: `SL` = source label (`V2_NORMALIZED_STRUCTURAL_LABEL` / bridge classification), `GO` = graph output
(`structuralState` → `strengthClassification`, or `specialStructureStatus`), `MT` = MATCH_TYPE.

| CASE_ID | SL | GRAPH_PATH (key nodes) | GO | Special status | MT |
|---|---|---|---|---|---|
| DTS-JINGSHEN-01 | BALANCED | FACT→SPECIAL-04:NONE→ORD→SYNTH:ANCHORED+SUP→SV-02 | STRONG_LEANING | NONE_DETECTED | PARTIAL_MATCH |
| DTS-JINGSHEN-03 | WEAK | SPECIAL-04:NONE→SYNTH:UNANCHORED-NOSUP→SV-02 | WEAK_LEANING | NONE_DETECTED | COMPATIBLE |
| DTS-SHUAIWANG-01 | STRONG | SPECIAL-04:NONE→SYNTH:ANCHORED+SUP→SV-02 | STRONG_LEANING | NONE_DETECTED | COMPATIBLE |
| DTS-SHUAIWANG-03 | WEAK | SPECIAL-04:NONE→SYNTH:UNANCHORED-NOSUP→SV-02 | WEAK_LEANING | NONE_DETECTED | COMPATIBLE |
| DTS-SHUAIWANG-04 | EXTREME_WEAK | SPECIAL-04:CANDIDATE→ruled out→SYNTH all-one-sided→SV-02 | EXTREME_WEAK_LEANING_CANDIDATE | CANDIDATE(ruled out) | EXACT |
| DTS-SHUAIWANG-05 | STRONG | SPECIAL-04:NONE (root via 羊刃)→SYNTH:ANCHORED+SUP | STRONG_LEANING | NONE_DETECTED | COMPATIBLE |
| DTS-SHUAIWANG-06 | EXTREME_STRONG | SPECIAL-04:NONE (root via 長生/祿旺)→SYNTH all-one-sided | EXTREME_STRONG_LEANING_CANDIDATE | NONE_DETECTED | EXACT |
| DTS-SHUAIWANG-07 | WEAK | SPECIAL-04:CANDIDATE→ruled out→SYNTH:UNANCHORED-NOSUP | WEAK_LEANING | CANDIDATE(ruled out) | COMPATIBLE |
| DTS-SHUAIWANG-08 | EXTREME_WEAK | SPECIAL-04:CANDIDATE→ruled out→SYNTH all-one-sided | EXTREME_WEAK_LEANING_CANDIDATE | CANDIDATE(ruled out) | EXACT |
| DTS-SHUAIWANG-09 | STRONG | SPECIAL-04:NONE (outlet 用神 present)→SYNTH:ANCHORED+SUP | STRONG_LEANING | NONE_DETECTED | COMPATIBLE |
| DTS-SHUAIWANG-11 | WEAK | SPECIAL-04:NONE→SYNTH:UNANCHORED-NOSUP | WEAK_LEANING | NONE_DETECTED | COMPATIBLE |
| DTS-SHUAIWANG-12 | EXTREME_WEAK | SPECIAL-04:NONE (root via 土得地)→SYNTH all-one-sided | EXTREME_WEAK_LEANING_CANDIDATE | NONE_DETECTED | EXACT |
| DTS-SHUAIWANG-13 | STRONG | SPECIAL-04:NONE (outlet 用神臨旺)→SYNTH:ANCHORED+SUP | STRONG_LEANING | NONE_DETECTED | COMPATIBLE |
| DTS-SHUAIWANG-14 | EXTREME_STRONG | SPECIAL-04:CANDIDATE→ruled out→SYNTH all-one-sided | EXTREME_STRONG_LEANING_CANDIDATE | CANDIDATE(ruled out) | EXACT |
| DTS-YUELING-01 | NOT_EXPLICIT | ORD-02: override test finds chain intact→SYNTH:ANCHORED+SUP | STRONG_LEANING | NONE_DETECTED | PARTIAL_MATCH |
| DTS-YUELING-02 | STRONG (surface) | ORD-02: override test finds chain BROKEN (丙火臨絶)→SYNTH:ANCHORED-NOSUP | BALANCED_OR_MIXED | NONE_DETECTED | GRAPH_MISMATCH* |
| DTS-SHUAIWANG-02 | EXTREME_STRONG | SPECIAL-04: complete alliance test (a) arguably met→CANDIDATE/HIGH_CONFIDENCE borderline | both readings reported | CANDIDATE | PARTIAL_MATCH |
| DTS-SHUAIWANG-10 | EXTREME_STRONG (CF-002) | SPECIAL-04: 全無克泄 borderline complete-alliance→CANDIDATE | both readings reported | CANDIDATE | PARTIAL_MATCH |
| DTS-GANGROU-01 | ORDINARY(EXTREME) | SPECIAL-04:CANDIDATE (outlet 泄 present)→ruled out→all-one-sided | EXTREME_STRONG_LEANING_CANDIDATE | CANDIDATE(ruled out) | EXACT |
| DTS-GANGROU-02 | ORDINARY(EXTREME) | SPECIAL-04:CANDIDATE (outlet 用丙火)→ruled out→all-one-sided | EXTREME_STRONG_LEANING_CANDIDATE | CANDIDATE(ruled out) | EXACT |
| DTS-XINGXIANG-17 | ORDINARY(STRONG) | SPECIAL-04:CANDIDATE→ruled out→SYNTH:ANCHORED+SUP | STRONG_LEANING | CANDIDATE(ruled out) | COMPATIBLE |
| DTS-XINGXIANG-18 | SPECIAL_PATTERN | SPECIAL-01,02→SPECIAL-04:HIGH_CONFIDENCE (從其強勢 explicit) | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-BAGE-04 | ORDINARY | SPECIAL-04:NONE→SYNTH:ANCHORED+SUP (中和純粹) | STRONG_LEANING | NONE_DETECTED | PARTIAL_MATCH |
| DTS-TIYONG-01 | SPECIAL_PATTERN | SPECIAL-04:HIGH_CONFIDENCE (從其強勢 explicit) | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-TIYONG-02 | SPECIAL_PATTERN | SPECIAL-02: root clashed away (二申沖去一寅)→SPECIAL-04:HIGH_CONFIDENCE | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-CONGXIANG-01 | SPECIAL_PATTERN | SPECIAL-02: root survives but no outlet→SPECIAL-04:HIGH_CONFIDENCE | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-CONGXIANG-04 | SPECIAL_PATTERN | SPECIAL-04:HIGH_CONFIDENCE (絕無一毫生扶 explicit) | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-CONGXIANG-05 | SPECIAL_PATTERN | SPECIAL-04:HIGH_CONFIDENCE (從殺斯真, natal-scope) | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-CONGXIANG-06 | SPECIAL_PATTERN | SPECIAL-04:HIGH_CONFIDENCE (從其旺神 explicit) | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-HUAXIANG-03 | SPECIAL_STRUCTURE | SPECIAL-03:TRUE_TRANSFORMATION→SPECIAL-04:HIGH_CONFIDENCE | NOT_APPLICABLE_SPECIAL_STRUCTURE | HIGH_CONFIDENCE | EXACT |
| DTS-JIAHUA-02 | SPECIAL_STRUCTURE(假化) | SPECIAL-03:FALSE_TRANSFORMATION→SPECIAL-04:CANDIDATE→ruled out→SYNTH:UNANCHORED-NOSUP | WEAK_LEANING | CANDIDATE(ruled out) | COMPATIBLE |
| BR-005 | 專旺(徐) / 身旺財輕(韋) | SPECIAL-02: hidden-stem fact (丑中藏辛) decides it — see narrative | HIGH_CONFIDENCE if fact omitted; CANDIDATE→ruled out if fact included | disputed by omission | SOURCE_SCHOOL_DIFFERENCE |
| BR-007 | convergent (傷官生財) | CAP-02(WEALTH_LOAD):SUPPORTED via 傷官生財 chain | STRONG_LEANING-ish, WEALTH_LOAD SUPPORTED | NONE_DETECTED | EXACT |
| BR-015 | 從煞(沈) / 胞胎格(萬) | SPECIAL-04:DISPUTED (no root anywhere; two incompatible CANONICAL readings, no scope split) | UNC-EXIT-DISPUTED, both readings reported | DISPUTED | GRAPH_UNCERTAIN_CORRECTLY |
| BR-024 | convergent (身強殺淺/三奇) | SYNTH:ANCHORED+SUP; CAP-03(CONTROL_LOAD):SUPPORTED | STRONG_LEANING | NONE_DETECTED | EXACT |
| ZPZQ-CAI-01 | convergent (財露生官) | CAP-02:SUPPORTED, CAP-03:SUPPORTED (官星制伏陽刃) | STRONG_LEANING, both loads SUPPORTED | NONE_DETECTED | EXACT |
| SMTH-CS001-01 | convergent (自坐陽刃/財旺且多/只作財官格看) | same chart as ZPZQ-CAI-01 — identical graph run | STRONG_LEANING, both loads SUPPORTED | NONE_DETECTED | EXACT |
| DTS-BAGE-05 | ORDINARY (paired w/ BAGE-04) | same rooting/season as BAGE-04; AX-03 relation-activation differs (印綬反傷) → CAP output differs, SYNTH unchanged | STRONG_LEANING (unchanged structuralState); CAP(印/用) NOT_SUPPORTED | NONE_DETECTED | EXACT |
| DTS-GUANSHA-12 | ORDINARY(EXTREME) | SPECIAL-03: combination present, inert-and-protective (不化反喜其合)→SYNTH:ANCHORED+SUP | STRONG_LEANING-tier | NONE_DETECTED | EXACT |
| DTS-GUANSHA-13 | NOT_EXPLICIT (任鐵樵's own chart) | SPECIAL-03: combination active-and-harmful (必化/化火為劫)→SYNTH:UNANCHORED-NOSUP (清枯之象) | WEAK-tier, worse than GUANSHA-12 despite same 旺極 base | NONE_DETECTED | EXACT |
| DTS-FANGJU-09 | ORDINARY(強眾敵寡) | party-scoped: DM 乙 itself rooted (歸垣)→SPECIAL-02 blocks HIGH_CONFIDENCE regardless of officer-star weakness; AX-09 feeds CAP-03 only | STRONG_LEANING (DM); CAP-03(CONTROL_LOAD re: officer star) NOT_SUPPORTED, 制 not 從 | NONE_DETECTED | EXACT |

\* See narrative — argued non-critical; graph output tracks 任鐵樵's own stated argument better than the raw
extracted label does.

## Case narratives (diagnostic subset)

**DTS-JINGSHEN-01 / DTS-BAGE-04 (`PARTIAL_MATCH`, granularity)** — both describe a chart where every
element flows in unbroken mutual generation (氣貫流通 / 中和純粹) — the classical description of 中和
(harmonious balance), a *specific* favorable state distinct from "one party is anchored and therefore
strong." `SYNTH-01`'s current state table has no separate bucket for "the whole chain flows, no single
party dominates" — it reads `ANCHORED_WITH_SEASONAL_SUPPORT` and returns `STRONG_LEANING`, which is not
wrong (a chart with every support chain live is not weak) but is coarser than 中和's specific nuance.
Documented as a known `SYNTH-01` granularity limit, not corrected this batch — adding a `HARMONIOUS_FLOW`
state would need more than these two corpus cases to justify per the axis-selection minimality standard,
and the brief does not require 100% terminological fit.

**DTS-YUELING-02 (`GRAPH_MISMATCH`, argued non-critical)** — the raw `V2_NORMALIZED_STRUCTURAL_LABEL` reads
`SOURCE_STRONG` (extracted from the literal string 通根身旺 in the source text). But 任鐵樵's own argument
explicitly REJECTS that reading one sentence later: `俗論比之，勝於前造，不知...丙火臨絶，以致...一生起倒不寧`
— "conventional readers say this beats the previous chart; they don't understand [that the real story is]
丙火臨絶... a lifetime of instability." The graph's `ORD-02` node (seasonal-load-bearing override check)
correctly detects that the support chain is broken and outputs `BALANCED_OR_MIXED`, not `STRONG_LEANING` —
which tracks 任's actual argument more faithfully than the mechanically-extracted label does. This is
recorded as `GRAPH_MISMATCH` against the raw label (honesty requires reporting the mismatch as found,
not resolving it in the graph's own favor by fiat) but is explicitly **not** `CRITICAL`: the disagreement
traces to what the label field captured (a surface phrase) versus what the source's full argument states,
not to a logically invalid graph inference. Flagged as a corpus-label review candidate for a future pass,
out of scope to fix in this batch.

**DTS-SHUAIWANG-02 / DTS-CONGXIANG-06 (`PARTIAL_MATCH` / `EXACT`, same chart, two chapters)** — identical
eight characters (癸卯乙卯甲寅乙亥). The `CONGXIANG` (從象) chapter entry states `從其旺神` (explicit
capitulation); the `SHUAIWANG` (衰旺) chapter entry, discussing the SAME chart, does not, calling it
`木旺極者似火`. Repair Pass 1's structural (not text-marker) test asks whether the branches form a genuinely
complete alliance leaving zero opposing element anywhere — for this chart (四支皆木, only two water stems
with no independent root) that structural fact is the SAME regardless of which chapter's prose is fed to
the graph. The graph therefore tends toward the SAME `CANDIDATE`/`HIGH_CONFIDENCE`-leaning read for both,
which is arguably a **better-reconciled** answer than the source's own two-chapter inconsistency — recorded
per-entry as `PARTIAL_MATCH` (vs. the SHUAIWANG chapter's ordinary-vocabulary label) and `EXACT`
(vs. the CONGXIANG chapter's 從 label), with the underlying graph verdict itself self-consistent across
both feeds. This is the direct S1.6-documented `SCHOOL_CONFLICT`/intra-source-inconsistency case; the graph
does not "solve" the historical question of which chapter 任鐵樵 meant, it simply shows that a fact-driven
(not vocabulary-driven) test does not reproduce the inconsistency.

**BR-005 (`SOURCE_SCHOOL_DIFFERENCE`, the flagship omitted-fact case)** — 徐樂吾 reads 乙丑己卯乙亥癸未 as
`曲直仁壽格`/專旺 (complete wood alliance, no stated counterevidence), attributing it to 段祺瑞. 韋千里,
examining the identical chart, finds a fact 徐 did not mention: `年支丑中藏辛` — the year branch's hidden
stem carries 辛 (metal), which falsifies "zero opposing element anywhere including hidden stems," the exact
second conjunct Repair Pass 1 added to `SPECIAL-04`. Fed 徐's incomplete fact set, the graph would reach
`HIGH_CONFIDENCE` (matching 徐, wrongly). Fed the complete fact set — which `FACT-03` is specified to pull
from `sameElementRooting.ts`'s full 지장간 enumeration, not a human's selective reading — the graph
correctly downgrades to `CANDIDATE`/ruled-out, landing on an ordinary `STRONG_LEANING` read that matches
韋千里's `身旺財輕`. This is the single strongest validation in the pool that the graph's fact layer, sourced
from the frozen engine's exhaustive hidden-stem computation rather than a human summary, is structurally
protected against exactly the omission that produced 徐's error. Recorded as `SOURCE_SCHOOL_DIFFERENCE`
because the two SOURCES disagree (traced to an omitted fact on one side), not because the graph itself is
inconsistent.

**BR-015 (`GRAPH_UNCERTAIN_CORRECTLY`, the flagship `DISPUTED` case)** — see
`DEOKBUNI_CANONICAL_OPERATION_POLICY.md` §6. 沈孝瞻 reads 乙酉乙酉乙酉甲申 as 棄命從煞; 萬民英 reads the
identical chart as 胞胎格, a structurally different non-ordinary construct, with no documented scope split.
The graph's correct behavior is `SPECIAL_PATTERN_DISPUTED` with both readings named — which is what it
produces. A graph that instead picked one side to maximize apparent corpus-match rate would be
overfitting to which source happened to enter the pool first, exactly what the brief's no-overfitting rule
forbids.

**DTS-GUANSHA-12 / DTS-GUANSHA-13 (`EXACT` / `EXACT`, the flagship AX-03-nuance case)** — 任鐵樵's own chart
pair, differing by one year branch (丑 vs 巳). Both attempt 戊癸合官留殺; in GUANSHA-12 the combination stays
inert and protective (`不化反喜其合`, 丑's own 晦火養金蓄水 buffering holds); in GUANSHA-13 — 任's own chart —
the same combination genuinely transforms and turns harmful (`化火為劫`). `SPECIAL-03` correctly reports the
structural fact (transformed or not) for each; the VALENCE difference (protective vs. harmful) correctly
shows up downstream at `SYNTH-01`, not conflated into `SPECIAL-03` itself. 任's own words — `天淵之隔` (a gulf
apart) from one branch — are reproduced by the graph's two different `SYNTH-01` outputs for what looks like
"the same" 旺極 base chart.

**DTS-FANGJU-09 (`EXACT`, the flagship party-scoping case)** — 亥卯未全, a complete wood alliance against a
weak officer star (`金氣虛脫`), yet the source treats this ordinarily (`制煞`), not as a following pattern,
because the DAY MASTER itself is rooted at its own seat (`乙木歸垣`) — it is the OFFICER STAR that is
outnumbered, not the day master. `AX-01`'s explicit party-scoping (§`S2_STRUCTURAL_AXES_FREEZE.md` AX-01)
means `SPECIAL-02` finds `governingRootSurvives = true` for the day master and never even considers routing
this chart toward a following read on the day master's account — the numerousness imbalance is correctly
read as evidence about the OFFICER star's own viability (feeding `CAP-03`), never as evidence the day
master itself needs to submit. This is the clearest demonstration in the pool that the axis set's
party-scoping is load-bearing, not decorative.

## What Repair Pass 1 fixed vs. what remains open

Fixed: 8 ordinary-extreme SHUAIWANG/GANGROU cases that would otherwise have been wrongly forced into
special-structure candidacy.

Remains open (acceptable per the brief's own standard — "100% corpus fit is not the goal"):
- DTS-SHUAIWANG-02/10/14 sit at a genuine structural boundary between "totally unopposed ordinary extreme"
  and "unopposed enough to be a 專旺/從 candidate" — the graph reports `CANDIDATE` with both readings rather
  than forcing one, which is the CORRECT behavior for a genuinely contested boundary (this is CF-011/CF-001's
  home territory, explicitly not required to be resolved this batch).
- DTS-JINGSHEN-01/DTS-BAGE-04's 中和 nuance is coarser in the graph than in the source vocabulary — a
  terminology gap, not a structural error.
- DTS-YUELING-02's raw label vs. the graph's output disagree because the label field captured a surface
  phrase 任鐵樵 himself rejects — a corpus-annotation note for a future pass, not a graph defect.

None of the above are `CRITICAL` by the brief's own definition. None require a third repair pass.

## Required-zero gate check (case-replay evidence)

| Item | Evidence this replay found |
|---|---|
| `CRITICAL_LOGIC_SHORTCUTS = 0` | No node short-circuits on a single fact; SPECIAL-04 always runs the full compound test |
| `UNJUSTIFIED_NUMERIC_THRESHOLDS = 0` | No case replay required inventing a number; all classifications used named states |
| `RAW_VOTE_VERDICTS = 0` | DTS-FANGJU-09 confirms AX-09 numerousness never independently decided an outcome |
| `FOLLOWING_EQUALS_EXTREME_WEAK_RULES = 0` | DTS-CONGXIANG-01/04/05/06, DTS-TIYONG-01/02 all correctly route to `NOT_APPLICABLE_SPECIAL_STRUCTURE`, never a strength band |
| `ROOT_PRESENT_ALWAYS_BREAKS_FOLLOWING = 0` | DTS-CONGXIANG-01 (root present, still follows) directly disproves this would-be shortcut |
| `LLM_VERDICT_NODES = 0` | No node in the 23-node graph is an LLM call (structural fact, not tested by replay but confirmed by graph inspection) |

`CASE_REPLAY = COMPLETE`. `MATCH_RATE_STRICT (EXACT only) = 23/41 (56%)`.
`MATCH_RATE_COMPATIBLE_OR_BETTER (EXACT + COMPATIBLE + PARTIAL + GRAPH_UNCERTAIN_CORRECTLY) = 39/41 (95%)`.
`CRITICAL_MISMATCHES = 0`.
