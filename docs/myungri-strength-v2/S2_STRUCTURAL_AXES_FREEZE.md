# S2 — STRUCTURAL AXES FREEZE

Selected from the 10 candidates in `S2_AXIS_CANDIDATES.md` against the 7-point minimality standard: (1)
structural meaning, (2) fact/inference support, (3) not a disguised tally, (4) case-demonstrated utility,
(5) known counterevidence documented, (6) explicit scope, (7) actually changes a downstream decision.
**7 axes frozen. 3 candidates deferred (§3).** Layer separation (FACT / INFERENCE / VERDICT-adjacent
STRUCTURAL STATE) is explicit per axis — no axis outputs a numeric score at any layer.

`STRUCTURAL_AXES_READY_TO_FREEZE = YES` (supersedes the S1.6-era `PARTIAL` verdict — per the current
brief's §76/§77, remaining school disagreement is not a structural blocker once the graph has an explicit
`DISPUTED`/`SCHOOL_SENSITIVE` exit, which §6 of `DEOKBUNI_CANONICAL_OPERATION_POLICY.md` and node
`SPECIAL-02` in the graph both provide).

---

## AX-01 — ROOTING (party-scoped)

- **AXIS_ID**: AX-01
- **NAME**: Rooting (통근 / 득지, party-scoped)
- **PURPOSE**: Whether a party (Day Master, or any other 십신 party under a task-relative capacity check) has
  a structural anchor in the branches — and whether that anchor is real or merely present.
- **TYPE**: `STRUCTURAL_INFERENCE_AXIS`
- **LAYERS**:
  - FACT: `ROOT_SAME_STEM_EXISTS(party, position)` (통근 — the party's own 干 sits in a branch's 지장간);
    `ROOT_SAME_ELEMENT_HIDDEN_EXISTS(party, position)` (득지 — a same-element peer sits hidden). Kept
    **structurally distinct**, matching the frozen kernel's F2/F3 split (`myungriStrength.ts`: "the rejected
    build conflated them").
  - INFERENCE: `ROOT_FUNCTIONALLY_MEANINGFUL(party, proposition)` — a root counts only if it survives the
    chart's own relations (not clashed away) and is positionally significant (월/일지 root ≠ 년/시지-only
    root, per `myungriNatal.ts`'s own anchoring rule — a named positional rule, not a count threshold).
- **INPUT_FACTS**: `sameElementRooting.ts` (`SameElementRootingResult`), `rootingTransparency.ts`
  (clash/transparency-aware), `natalRelations.ts` (clash detection to test survival).
- **INFERENCE_REQUIRED**: yes — root existence alone is a fact; root *significance* requires the
  clash-survival + position check above.
- **QUESTION_DOMAIN_RELEVANCE**: feeds structural synthesis (all domains) and the special-structure screen
  (root is a counterevidence conjunct against following/transformation, §2 P2 of the operation policy).
- **SUPPORTING_CASE_IDS**: DTS-SHUAIWANG-03 (木無盤根之處 → 木太衰者), DTS-YUELING-02 (통근+身旺 stated but
  outcome worse than the unrooted sibling — root exists but is NOT the only structural fact that matters),
  DTS-CONGXIANG-05 (root RESTORED by luck breaks an established 從殺 — root significance is time-varying).
- **COUNTEREXAMPLE_CASE_IDS**: DTS-CONGXIANG-01 (root exists — 蟠根在未/餘氣在辰 — yet chart still follows;
  proves root existence does not automatically win against overwhelming numerousness).
- **SCHOOL_SCOPE**: `CANONICAL_WITH_SCOPE` for FACT layer (root existence — cross-lineage invariant per
  `CROSS_LINEAGE_EVIDENCE_MATRIX.md`); `SCHOOL_SENSITIVE` for the INFERENCE layer's exact significance
  weighting (CF-011's 5-way split lives entirely in how root significance interacts with following
  candidacy — resolved operationally, not universally, by policy P2).
- **UNCERTAINTY_CONDITION**: hour pillar unknown → 시지 root cannot be evaluated, downgrade confidence not
  fabricate an assumed absence.
- **DOES_NOT_IMPLY**: `ROOT_EXISTS` does NOT imply `PARTY_IS_STRONG` (that requires seasonal state and
  relation activation too); `NO_ROOT` does NOT imply `PARTY_CANNOT_BEAR` (the V1-fatal invalid converse).
- **DOWNSTREAM_USE**: structural synthesis (§4 below), special-structure screen counterevidence conjunct.

## AX-02 — SEASONAL STATE (월령)

- **AXIS_ID**: AX-02
- **NAME**: Seasonal State (월령 role, not score)
- **PURPOSE**: What role the party occupies relative to the month branch's governing 기 — a role, not a
  magnitude.
- **TYPE**: `STRUCTURAL_INFERENCE_AXIS`
- **LAYERS**:
  - FACT: `MONTH_COMMAND_ROLE(party) ∈ {IN_COMMAND, SUPPORTED, NEUTRAL, DRAINED, OPPOSED}` — matches the
    already-frozen kernel's F1 mapping (왕/상→SUPPORT, 휴→NEUTRAL, 수/사→DRAIN) but keeps `IN_COMMAND`
    (득령 itself, 당령/사령) distinct from mere phase-support, since DTS-YUELING-01/02 (AC-01) show 당령
    changes the READING even when the phase-role sentence looks similar.
  - INFERENCE: `SEASONAL_STATE_LOAD_BEARING(party)` — whether the seasonal role is actually decisive or is
    overridden by other structural facts (DTS-SHUAIWANG-02/DTS-CONGXIANG-06: identical eight characters,
    the SAME author gives the seasonal-extreme reading two different downstream treatments across two
    chapters — the seasonal fact alone underdetermines the inference).
- **INPUT_FACTS**: `generalSeasonalPhase.ts` (`GeneralSeasonalPhaseResult`), month-command boolean from
  `monthCommand.ts`.
- **INFERENCE_REQUIRED**: yes.
- **QUESTION_DOMAIN_RELEVANCE**: structural synthesis; special-structure screen (a party 得令 but rootless
  is the kernel's own named ambiguity — "표면적 강함").
- **SUPPORTING_CASE_IDS**: DTS-YUELING-01 (AC-01: source explicitly labels 煞旺身弱 a SURFACE read — 似乎 —
  then overturns it once 당령 + no-water + hidden-support facts are weighed together; the final label is
  never even stated — a direct precedent for `UNRESOLVED` as a legitimate output), DTS-SHUAIWANG-07 (chapter
  formula 太衰 printed as 衰 — a known source-fidelity gap, not a structural counterexample).
- **COUNTEREXAMPLE_CASE_IDS**: DTS-YUELING-02 (통근+身旺 AND 득령 stated, yet outcome is WORSE than its
  unrooted-but-당령 sibling — seasonal+root support together still underdetermine the outcome without the
  relation-activation axis: 丙火臨絶 breaks the 印 that would have converted 殺 safely).
- **SCHOOL_SCOPE**: `CANONICAL` for the FACT layer's phase-role vocabulary (attested in every lineage
  checked, including 三命通會's own explicit statement that 旺相休囚死 is non-evaluative — `OBS-20`);
  `SCHOOL_SENSITIVE` for how much the INFERENCE layer should weigh against rooting (subordinate detail of
  CF-011/CF-012).
- **UNCERTAINTY_CONDITION**: 節氣 boundary birth (within ~3 days of a solar-term change) → seasonal role
  itself uncertain; must surface as `INSUFFICIENT`, never silently pick a side.
- **DOES_NOT_IMPLY**: `IN_COMMAND` does NOT imply `PARTY_IS_STRONG` (DTS-SHUAIWANG-02/06 read 당령+extreme
  facts into a following-adjacent treatment, not a plain "strong" verdict); a season fact never substitutes
  for a rooting or relation-activation fact.
- **DOWNSTREAM_USE**: structural synthesis, special-structure screen.

## AX-03 — RELATION ACTIVATION (합충형파해, 진가/진화)

- **AXIS_ID**: AX-03
- **NAME**: Relation Activation
- **PURPOSE**: Whether a stated combination/clash actually structurally activates (transforms, uproots,
  binds) rather than merely being present on paper.
- **TYPE**: `STRUCTURAL_INFERENCE_AXIS`
- **LAYERS**:
  - FACT: `RELATION_EXISTS(positions, kind)` — straight from `relationParticipants.ts` /
    `natalRelations.ts`, the raw 합/충/형/파/해 the frozen engine already computes.
  - INFERENCE: `RELATION_STRUCTURALLY_ACTIVE(relation, chart)` — 真化 vs 假化 (DTS-HUAXIANG-03: 化象斯真,
    元神透露 — transformation confirmed by a further transparent root of the transformed element; vs
    DTS-JIAHUA-02: 化神假而不清 — same combination shape, ruled NOT genuinely transformed because the
    resulting element has no seasonal support); whether a clash uproots (DTS-TIYONG-02: 二申沖去一寅 →
    丙火之根已拔, explicitly treated as removing that root from further consideration).
- **INPUT_FACTS**: `relationParticipants.ts`, `natalRelations.ts`.
- **INFERENCE_REQUIRED**: yes — this is the single richest inference axis in the corpus; a bare relation
  fact is close to useless without the activation judgment.
- **QUESTION_DOMAIN_RELEVANCE**: special-structure screen (transformation candidacy IS this axis), ordinary
  structural synthesis (root-survival check under AX-01 depends on this axis's clash-uproot output),
  RELATION_STABILITY/RELATION_BOND questions downstream (out of this batch's scope but the axis is shared).
- **SUPPORTING_CASE_IDS**: DTS-HUAXIANG-03/DTS-JIAHUA-02 (matched 真化/假化 pair — same combination glyph
  shape, opposite activation outcome, decided by transparency+seasonal support of the resulting element, not
  by the combination's mere presence), DTS-TIYONG-02 (clash-uproot).
- **COUNTEREXAMPLE_CASE_IDS**: none found that break "activation requires an independent structural check" —
  this axis is the one with the strongest cross-lineage invariant support (`CROSS_LINEAGE_EVIDENCE_MATRIX.md`:
  `RELATION_ACTIVATION` supported everywhere, zero contradiction).
- **SCHOOL_SCOPE**: `CANONICAL`. This is the closest thing to a cross-lineage invariant the research found.
- **UNCERTAINTY_CONDITION**: hour unknown → 시지 participant relations cannot be evaluated.
- **DOES_NOT_IMPLY**: a stated combination glyph (甲己/丁壬/etc.) does NOT imply activation (`RELATION_EXISTS`
  ≠ `RELATION_STRUCTURALLY_ACTIVE`) — this is the single most load-bearing FACT≠INFERENCE separation in the
  whole axis set.
- **DOWNSTREAM_USE**: special-structure screen (primary), AX-01 root-survival check, structural synthesis.

## AX-05 — CAPACITY(party, load, ground, time)

- **AXIS_ID**: AX-05
- **NAME**: Task-Relative Capacity
- **PURPOSE**: Whether the chart's structure supports bearing a *specific* load, for a *specific* party, in
  a *specific* temporal ground — never a global "can this person handle things" verdict.
- **TYPE**: `QUESTION_RELATIVE_AXIS`
- **LAYERS**:
  - FACT: which 십신 families are present/absent by position (`familyPresence`, already computed by
    `myungriNatal.ts`'s `readNatalBaseline`).
  - INFERENCE: `CAPACITY(party, loadDomain, ground, time) ∈ {SUPPORTED, NOT_SUPPORTED, MIXED, INSUFFICIENT}`
    — combines the structural synthesis state with which family the load domain natively depends on
    (`domainFamily()`, already implemented in the frozen kernel) and whether an outlet/support chain exists
    for that specific load.
- **INPUT_FACTS**: structural synthesis output (this batch), `tenGodFacts.ts`, `specialPatternPrerequisites.ts`
  (`RoleCategoryPresenceFact`).
- **INFERENCE_REQUIRED**: yes, and it is a SECOND-ORDER inference (built on top of structural synthesis, not
  directly on facts) — this is the axis realizing OBS-11 (足以/capacity is task-relative in 18/18 corpus
  occurrences).
- **QUESTION_DOMAIN_RELEVANCE**: this axis IS the question-domain-relevance mechanism — it exists to answer
  "capacity for what."
- **SUPPORTING_CASE_IDS**: DTS-JINGSHEN-01 (「官來能挡」— capacity-adjacent language scoped to a specific
  threat, not a global strength claim), DTS-XINGXIANG-17/18 (AC-08 — the SAME 旺 state gets two different
  remedies, 傷之有功 vs 洩之有功, chosen by which specific party is deficient — the source's own 任氏曰 states
  a single strength band cannot select the remedy).
- **COUNTEREXAMPLE_CASE_IDS**: none — this axis was built specifically because `TASK_RELATIVE_JUDGMENT_ANALYSIS.md`
  found no corpus case supporting a GLOBAL_CAN_BEAR reading.
- **SCHOOL_SCOPE**: `CANONICAL_WITH_SCOPE` — task-relativity itself is well attested; the exact load-domain
  taxonomy (`WEALTH_LOAD`/`CONTROL_LOAD`/`OUTPUT_LOAD`) is a Deokbuni operational choice, not a historical one.
- **UNCERTAINTY_CONDITION**: a load domain with no corpus-attested family mapping → `INSUFFICIENT`, never
  guessed.
- **DOES_NOT_IMPLY**: `CAPACITY(party, WEALTH_LOAD) = SUPPORTED` does NOT imply `CAPACITY(party, CONTROL_LOAD)
  = SUPPORTED` — the whole point of the axis is that these do not transfer.
- **DOWNSTREAM_USE**: `taskCapacities` in the kernel-integration contract (§8 of the operation policy).

## AX-06 — SPECIAL-STRUCTURE STATUS

- **AXIS_ID**: AX-06
- **NAME**: Special-Structure Status (following / transformation / dominant-element candidacy)
- **PURPOSE**: Detect whether the chart is a non-ordinary structure BEFORE ordinary strength axes are
  synthesized into a strength view — kept permanently separate from the strength view (hard rule: FOLLOWING
  != EXTREME_WEAK, SPECIAL_DOMINANCE != EXTREME_STRONG).
- **TYPE**: `STRUCTURAL_INFERENCE_AXIS` (realized as a `BRANCH`-type node cluster in the S3 graph, §SPECIAL
  nodes).
- **LAYERS**:
  - FACT: extreme one-sidedness of `familyPresence` (from AX-09), extreme one-sidedness of AX-02's seasonal
    role, presence/absence of AX-01 roots for the outnumbered party, AX-03 transformation-combination
    activation.
  - INFERENCE: `SPECIAL_PATTERN_STATUS ∈ {NONE_DETECTED, CANDIDATE, HIGH_CONFIDENCE, DISPUTED, INSUFFICIENT}`
    — never a blind "root⇒exit" or "no-root⇒following" shortcut (required-zero gate item). `HIGH_CONFIDENCE`
    requires the compound test from policy §2 P2: extreme one-sidedness AND absence of countervailing
    evidence in ALL of {surviving root at a governing position, outlet/protector via AX-03 activation,
    documented scope split}.
- **INPUT_FACTS**: AX-01, AX-02, AX-03, AX-09 outputs; `specialPatternPrerequisites.ts`
  (`SpecialPatternPrerequisitesResult`, already computes role-category presence, the closest existing frozen
  fact provider to this axis).
- **INFERENCE_REQUIRED**: yes — the single highest-stakes inference in the whole graph.
- **QUESTION_DOMAIN_RELEVANCE**: gates whether the strength view is computed at all (policy §4).
- **SUPPORTING_CASE_IDS**: DTS-CONGXIANG-01 (root present, follows anyway — compound test, not binary),
  DTS-CONGXIANG-05 (root restored by luck breaks an established following pattern — time-varying), BR-015
  (乙酉乙酉乙酉甲申 — genuine cross-lineage `DISPUTED`: 從煞 per 沈孝瞻 vs 胞胎格 per 萬民英, no documented
  scope split — this is the reference case for the `DISPUTED` output, see policy §6).
- **COUNTEREXAMPLE_CASE_IDS**: DTS-HUAXIANG-04 (真化更真 stated, YET 劫 interferes and the chart's actual
  fortune is mixed — even a `HIGH_CONFIDENCE` special-structure read does not mean unconditioned good
  fortune; the axis reports STRUCTURE, not outcome).
- **SCHOOL_SCOPE**: `SCHOOL_SENSITIVE` at the INFERENCE layer by nature (this is CF-011/CF-012's home axis);
  `CANONICAL_WITH_SCOPE` at the FACT layer (the underlying one-sidedness/root/activation facts are
  themselves cross-lineage stable, only their COMBINATION rule differs).
- **UNCERTAINTY_CONDITION**: any of the four compound-test conjuncts unresolvable (e.g. hour unknown blocks
  a 시지 root check) → `INSUFFICIENT`, not a forced binary.
- **DOES_NOT_IMPLY**: `SPECIAL_PATTERN_STATUS = HIGH_CONFIDENCE` does NOT imply `STRENGTH_VIEW =
  EXTREME_WEAK_LEANING` or `EXTREME_STRONG_LEANING` — strength view returns `NOT_APPLICABLE_SPECIAL_STRUCTURE`
  instead (policy §4). This is the single most important DOES_NOT_IMPLY in the entire axis set.
- **DOWNSTREAM_USE**: gates strength-view computation; feeds `specialStructureStatus` directly in the
  kernel-integration contract.

## AX-09 — NUMEROUSNESS (구성, 眾/寡)

- **AXIS_ID**: AX-09
- **NAME**: Numerousness (visible-stem support-vs-drain count, party-scoped)
- **PURPOSE**: A named, auditable EVIDENCE fact about how many distinct positions carry allied vs opposing
  parties — kept explicitly separate from 強/弱 (CF-005) and NEVER aggregated into a verdict by itself.
- **TYPE**: `FACT_DERIVED_AXIS` (no promotion to an inference layer — this is the one axis that stays
  fact-only by design, to keep the "never a disguised tally" rule structurally impossible to violate, not
  merely a house style).
- **LAYERS**:
  - FACT ONLY: `SUPPORT_COUNT(party, position-scope)` / `DRAIN_COUNT(party, position-scope)` — distinct
    positions, never stem+branch+hidden triple-counted (matches the frozen kernel's own dedup logic in
    `readNatalBaseline`'s `seen` set).
- **INPUT_FACTS**: `tenGodFacts.ts`, `myungriJudge.ts`'s `tenGodFamily()`.
- **INFERENCE_REQUIRED**: **no** — and this absence is itself the point. Any downstream node that wants to
  use numerousness for a decision must combine it with AX-01/AX-02/AX-03 through an explicit, named
  compound test (as AX-06 does) — numerousness alone may never drive a `BRANCH` node's decision.
- **QUESTION_DOMAIN_RELEVANCE**: input evidence to structural synthesis and the special-structure screen.
- **SUPPORTING_CASE_IDS**: DTS-FANGJU-09 (`強眾而敵寡…非煞旺宜制而推也` — the decisive sentence: treatment
  follows the 眾/寡 RELATION between two parties' position-counts, explicitly NOT from whether the officer
  party is itself independently 旺; 強 and 眾 used as separate modifiers of the SAME party in the same
  clause).
- **COUNTEREXAMPLE_CASE_IDS**: none against the fact/inference split itself; CF-005 already closed the
  independence question.
- **SCHOOL_SCOPE**: `CANONICAL` for the raw count fact; not applicable for inference since none is produced
  at this axis.
- **UNCERTAINTY_CONDITION**: hour unknown → 시주 position excluded from the count, counted as
  `INCOMPLETE_COUNT`, never silently treated as zero.
- **DOES_NOT_IMPLY**: `SUPPORT_COUNT > DRAIN_COUNT` does NOT imply `PARTY_IS_STRONG` — this is the direct
  block on "majority voting" (required-zero gate item `RAW_VOTE_VERDICTS = 0`).
- **DOWNSTREAM_USE**: one evidence input among several to AX-06 and structural synthesis; never a sole
  decision input anywhere in the graph.

## AX-10 — UNCERTAINTY / DECLINE-TO-JUDGE

- **AXIS_ID**: AX-10
- **NAME**: Uncertainty & Provenance
- **PURPOSE**: The always-present terminal layer that makes every other axis's silence explicit rather than
  defaulted.
- **TYPE**: `ORCHESTRATION_AXIS`
- **LAYERS**:
  - Not a fact/inference pair — this axis READS the confidence/uncertainty state each other axis and node
    already produced and aggregates it into one qualitative report: `HIGH / MODERATE / LOW_CONFIDENCE`,
    `SCHOOL_SENSITIVE` (points to policy §2 table rows), `INSUFFICIENT` (points to the missing fact).
- **INPUT_FACTS**: every other axis's own `UNCERTAINTY_CONDITION` outputs; `hourKnown`.
- **INFERENCE_REQUIRED**: no — pure aggregation/reporting, by design (an inference here would itself need an
  uncertainty exit, infinite regress).
- **QUESTION_DOMAIN_RELEVANCE**: all — this is what prevents any node from silently defaulting.
- **SUPPORTING_CASE_IDS**: DTS-YUELING-01 (source itself never states a final label — `UNRESOLVED` is not a
  system failure, it is sometimes the textually honest answer); DTS-SHUAIWANG-10 (CF-002, a genuine
  source-internal print contradiction — reported as `SCHOOL_SENSITIVE`/known-defect, not silently resolved).
- **COUNTEREXAMPLE_CASE_IDS**: n/a (this axis has no positive claim to counter).
- **SCHOOL_SCOPE**: `CANONICAL` — uncertainty reporting is a Deokbuni process guarantee, not a school
  position.
- **UNCERTAINTY_CONDITION**: n/a (this axis IS the uncertainty condition).
- **DOES_NOT_IMPLY**: an `INSUFFICIENT`/`SCHOOL_SENSITIVE` output does NOT imply the chart is unusual — most
  charts in the corpus resolve cleanly; this axis exists for the honest minority.
- **DOWNSTREAM_USE**: every terminal output in the kernel-integration contract carries this axis's report.

---

## §1 Axis-type summary

| AXIS_ID | TYPE | Fact layer | Inference layer |
|---|---|---|---|
| AX-01 ROOTING | STRUCTURAL_INFERENCE_AXIS | ROOT_SAME_STEM/ELEMENT_HIDDEN_EXISTS | ROOT_FUNCTIONALLY_MEANINGFUL |
| AX-02 SEASONAL STATE | STRUCTURAL_INFERENCE_AXIS | MONTH_COMMAND_ROLE | SEASONAL_STATE_LOAD_BEARING |
| AX-03 RELATION ACTIVATION | STRUCTURAL_INFERENCE_AXIS | RELATION_EXISTS | RELATION_STRUCTURALLY_ACTIVE |
| AX-05 CAPACITY | QUESTION_RELATIVE_AXIS | family presence by position | CAPACITY(party,load,ground,time) |
| AX-06 SPECIAL-STRUCTURE | STRUCTURAL_INFERENCE_AXIS | one-sidedness+root+activation facts | SPECIAL_PATTERN_STATUS |
| AX-09 NUMEROUSNESS | FACT_DERIVED_AXIS | SUPPORT/DRAIN_COUNT | *(none — fact-only by design)* |
| AX-10 UNCERTAINTY | ORCHESTRATION_AXIS | *(aggregates other axes' uncertainty)* | *(none — reporting only)* |

## §2 Kernel alignment

| This axis set | Frozen kernel factor (`src/features/divination/myungriStrength.ts`) |
|---|---|
| AX-01 ROOTING (통근 sub-fact) | F2 통근 (`rooted = input.rootPositions.length > 0`) |
| AX-01 ROOTING (득지 sub-fact) | F3 득지 (`seated = input.peerHiddenPositions.length > 0`) |
| AX-02 SEASONAL STATE | F1 월령 (`monthFactor`) |
| AX-09 NUMEROUSNESS | F4 구성 (`compositionEffect`) |
| AX-03 RELATION ACTIVATION | transparencyEffect (투간) — partial overlap; this axis set generalizes it to all 합충형파해, not only transparency |
| AX-10 UNCERTAINTY | `ambiguities[]` / `confidence` / `classificationBlocker` |

No axis in this set contradicts a kernel factor; AX-03 and AX-06 are genuine extensions (the kernel computes
F1–F4 as flat evidence and explicitly withholds classification — this axis set adds the special-structure
screen and structural-synthesis layers the kernel's own `classificationBlocker` says are missing: "월령-vs-통근
priority weighting... band boundaries").

## §3 Deferred axes (not built this batch)

| Candidate | Status | Why deferred |
|---|---|---|
| AX-04 OUTLET PRESENCE | **Folded into AX-06**, not promoted to top-level | Single-lineage evidentiary support; no case found where it changes a decision outside the special-structure screen context (policy §2 P6) |
| AX-07 CLIMATE (調候) | **DEFERRED — separate module forever** | Explicit brief instruction; `OBS-18/19` trace 調候-as-baseline-doctrine to 徐樂吾 1936, not the classical corpus |
| AX-08 GEJU (格局) | **DEFERRED — separate/higher-level module** | Explicit brief instruction; not built merely because research exists (`S2_AXIS_CANDIDATES.md` AX-08) |

None of the three deferred candidates block S3 — every graph node in `S3_OPERATIONAL_JUDGMENT_GRAPH.md` is
reachable and terminates using only AX-01/02/03/05/06/09/10.

`S2_AXES = FROZEN_FOR_AUDIT`
