# MYUNGRI_STRENGTH_V1.1 — Source Matrix (Independent-Audit Remediation)

> Companion to `MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md` §2/§0. Revises V1's coarser A/B/C/D LEVEL tags into
> explicit SOURCE_CLASS provenance (original text / named commentary lineage / named school / Deokbuni
> operationalization / deferred), per the independent audit's finding that V1 mixed these tiers. No later
> commentator is listed as though it were the original classic's direct statement.
>
> **CANONICAL_STATUS** values unchanged: `ADOPT` / `ADOPT_WITH_CONDITION` / `REJECT` / `DEFER`.
>
> **Columns:** TEXT_LAYER (SOURCE_CLASS_A/B/C/D/E, with named commentator/school if B or C) · SCHOOL ·
> RULE_SCOPE (what the rule actually governs) · RUNTIME_AUTHORITY (BINDING/CONDITIONAL/ADVISORY/
> NON_AUTHORITATIVE) · DISPUTED (named disagreement, or "none material") · DEFERRED_REASON (only where
> CANONICAL_STATUS = DEFER).

## Step A — Season/month command

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|---|---|---|---|---|---|
| MC-01 | Assign month's dominant seasonal element (4-season + 辰戌丑未 mapping) | SOURCE_CLASS_A — base 五行旺相休囚死 cosmology, pre-Ziping, reproduced in 淵海子平/三命通會 without attribution to either as originator | Cross-school | Fact derivation only | BINDING | None | ADOPT | — |
| MC-02 | Assign 5-state 旺相休囚死 from D-vs-S relation | SOURCE_CLASS_A | Cross-school | Fact derivation only | BINDING | None | ADOPT | — |
| MC-03 | Flag 節氣-boundary births — `BOUNDARY_SENSITIVE` (distance-to-boundary only, no sub-period table needed) | SOURCE_CLASS_D — Deokbuni operationalization of the SOURCE_CLASS_A existence of 餘氣 carryover, deliberately scoped to avoid needing the disputed day-count table | Not school-specific (the flag) | Uncertainty-state trigger (§13) | BINDING (as engineering policy) | None on existence of the underlying effect; the flag's exact distance window is itself SOURCE_CLASS_D, undetermined | ADOPT_WITH_CONDITION | — |
| MC-04 | For 격국 selection, prefer 사령 hidden stem if transparent | SOURCE_CLASS_A/C — 子平真詮's own method (A) as applied procedurally by 격국派 (C) | 格局派 | 격국 (structure) selection — NOT strength reading, out of this project's current scope | CONDITIONAL, but scope is 격국 selection, not strength | None on the procedure within 格局派; other schools de-emphasize 격국 mechanics while still using month evidentially | DEFER | Out of scope for V1.1 (격국 module not being built); recorded for completeness only |
| MC-05/06 | Do not finalize month phase as positive/negative until §5/§6 evidence is checked | SOURCE_CLASS_D | Not school-specific | Pipeline control-flow | BINDING | None | ADOPT | — |
| MC-07 | Flag month branch involved in a detected relation — defer full weight pending §8 integrity check | SOURCE_CLASS_D application of §8's layering to the month branch specifically | Not school-specific | Pipeline gating | ADOPT_WITH_CONDITION — blocked on the relation→root-integrity FACT linkage (P0-2, `IMPLEMENTATION_GAP.md`) | None | ADOPT_WITH_CONDITION | — |
| MC-08 | Check whether a candidate root/support/opposition branch is itself clash/combination-compromised before counting it functional | SOURCE_CLASS_B — 滴天髓, specifically as read through **任鐵樵's** commentary tradition for the rooting-as-substantiality theme (named explicitly per audit finding 7) | Cross-school on the underlying principle; 任鐵樵-lineage for this specific framing | §5/§7/§10's functional-integrity test | CONDITIONAL (principle B-level; concrete test is SOURCE_CLASS_D) | None on the principle | ADOPT_WITH_CONDITION | — blocked on P0-2's fact linkage |
| STR-01 | Synthesize B+C+D as explanatory chain under Axis A, never summed | SOURCE_CLASS_D translation of SOURCE_CLASS_A anti-additive method (子平真詮 structure-first reading; 滴天髓 氣勢 holism) | Cross-school on the anti-additive principle | Reasoning architecture | BINDING (structural) | None | ADOPT | — |
| STR-02 | 억부 application consumes an already-final verdict; never feeds back | SOURCE_CLASS_D — structural/logical requirement, not a doctrinal citation | Not school-specific | Pipeline ordering | BINDING | None | ADOPT | — |

## Step B — Root structure (§5)

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|---|---|---|---|---|---|
| ROOT-B1 | Tag candidate roots (same-stem or same-element/diff-polarity) | SOURCE_CLASS_A (existence test) | Cross-school | Existence-only fact | BINDING (existence) | Polarity-match grading is SOURCE_CLASS_C, school-variable | ADOPT (existence) / ADOPT_WITH_CONDITION (polarity grading) | — |
| ROOT-B2 | Classify qi-tier (본기/중기/여기) | SOURCE_CLASS_A (three-tier concept — 三命通會's fullest tabulation, 淵海子平's earlier/coarser version, both named separately, neither merged) | Cross-school on concept | Root quality tier | BINDING (concept) | Exact day-count values differ between the two named texts and later 徐樂吾-lineage redactions | ADOPT (concept) / DEFER (exact values) | Exact tables not adopted per §4.2's P0→P1 downgrade — no single edition selected |
| ROOT-B3 | 사령-adjusted tier override via elapsed-day count | SOURCE_CLASS_B — 滴天髓 as read through **任鐵樵**'s commentary, and **三命通會**'s own 人元司令 framing (named as a distinct, not-necessarily-identical, source from 任鐵樵's) | 格局派 emphasizes strict application; 億扶派 varies | Root quality tier (precision refinement) | CONDITIONAL — now explicitly P1, not P0 | A simplified "main-qi-always-governs" convention exists in contemporary practice — flagged SOURCE_CLASS_E if adopted as final rather than as an explicit simplification | DEFER | Blocked on the same day-count table gap as ROOT-B2; V1.1 uses §4.2's `BOUNDARY_SENSITIVE` flag instead of requiring this rule |
| ROOT-B4 | **REMOVED as a fixed hierarchy** — 월지's seasonal-command authority and 일지's DM-adjacency remain BINDING for those SPECIFIC reasons; a general 월>일>시>년 ranking is not adopted | 월지 authority: SOURCE_CLASS_A (子平真詮's own organizing premise, but scoped to 월지's seasonal-command role specifically). 일지 adjacency: SOURCE_CLASS_B (滴천수-descended, general 億扶派 pedagogy) | 월지: cross-school. 일지: 億扶派-emphasized | Root authority/closeness — now a set of independent contextual dimensions (§5.6), not one ranking | BINDING (the two specific named facts) / SOURCE_CLASS_E (any general fixed ranking beyond those two) | 시지-vs-년지 relative ranking genuinely contested; no source establishes a general four-way ranking | ADOPT (월지 seasonal authority, 일지 adjacency, as independent facts) / REJECT (the general fixed hierarchy as previously stated) | — |
| ROOT-B5 | Root's own seasonal vitality | SOURCE_CLASS_B (滴천수, dynamic-modifier framing, 任鐵樵-descended reading) | Cross-school on existence | Root vitality | CONDITIONAL (principle) / SOURCE_CLASS_D (VITAL/MODERATE/DORMANT tiering) | None major | ADOPT_WITH_CONDITION | — |
| ROOT-B6 | Grade root survival under 沖 | SOURCE_CLASS_A/B (mechanics: 淵海子平/三命通會; contextual severity reading: 滴천수/任鐵樵) | Schools differ on isolated-clash weight vs. chart-wide reading (named as such, not resolved) | §8.4's FUNCTIONAL EFFECT layer | CONDITIONAL | Degree of damage genuinely school-flavored | ADOPT_WITH_CONDITION | Blocked on P0-2 fact linkage |
| ROOT-B7 | Grade root survival under 合 | SOURCE_CLASS_A/B/C (mechanics: 淵海子平/三命通會; structural consequence: 子平真詮; 化氣 success conditions genuinely school-disputed) | 格局派 weights 化氣 success heavily; 億扶派 narrower focus | §8.1–8.3's TRANSFORMATION layer | CONDITIONAL | 化氣 success strictness disputed across named lineages | ADOPT_WITH_CONDITION | Blocked on P0-2 + §8.1's DM-involvement dispute (unresolved by design) |
| ROOT-B8 | Aggregate root-structure configuration, no summation | SOURCE_CLASS_A (anti-additive — 滴천수 氣勢; 子평真詮 structural reading) | Cross-school rejection of naive counting | §5.7 | BINDING (no-summation) / SOURCE_CLASS_D (specific category-tag scheme) | None on the anti-additive principle | ADOPT | — |
| ROOT-B9 | Emit branch→root fact index for reuse | SOURCE_CLASS_D | Not school-specific | Engineering interface | BINDING | None | ADOPT | — |

## Step C — Support structure (§6)

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|---|---|---|---|---|---|
| SUPPORT-C1 | Identify visible 비견/겁재/정인/편인 stems | SOURCE_CLASS_A (fixed classical Ten-God definition, undisputed) | Cross-school | Mechanical read | BINDING | None | ADOPT | — |
| SUPPORT-C2 | Tag ROOTED vs. FLOATING via root index | SOURCE_CLASS_B (滴천수 통근 substantiality theme) | Cross-school near-universal | §6.1 | BINDING (direction) | Degree is contextual, not disputed in direction | ADOPT | — |
| SUPPORT-C3 | Tag column adjacency to DM | SOURCE_CLASS_C (general 子평 pedagogy on pillar adjacency — no single canonical text formalizes this as rigorously as 월지 primacy) | Widespread convention, not rigorously codified in primary texts | §6.2 | CONDITIONAL | None direct; confidence explicitly lower than the two BINDING §5.6 positional facts | ADOPT_WITH_CONDITION | — |
| SUPPORT-C4 | Check 干合-eligibility and contestedness (爭合/妒합) | SOURCE_CLASS_C (子평 commentary tradition, general, not one precisely citable passage) | Broadly acknowledged, under-formalized | §6.4 | CONDITIONAL | None major | ADOPT_WITH_CONDITION | — |
| SUPPORT-C5 | Adjudicate 합而不화 vs. 합화 for support stems | SOURCE_CLASS_A/B/C — see §8.1's full DM-involvement dispute note | 格局派/億扶派 differ on weighting | §8.1 (cross-referenced) | CONDITIONAL | 化氣-strictness disagreement (same as ROOT-B7) | ADOPT_WITH_CONDITION | — |
| SUPPORT-C6 | Check direct adjacent 克 suppression — CORRECTED to name 財, not 官殺, as the controller of 印 | SOURCE_CLASS_C (general 子평 이론, 오행 상극 at stem-adjacency level, no single named canonical passage) | Widespread, cross-school | §6.5 (corrected) | CONDITIONAL | None material once corrected — the prior version's error (官殺剋印) was a five-phase-cycle mistake, not a genuine school dispute | ADOPT_WITH_CONDITION | — |
| SUPPORT-C7 | Aggregate support-faction facts, forbid vote-count collapse | SOURCE_CLASS_D | Not school-specific | §6.6 | BINDING | None | ADOPT | — |

## Step D — Opposition structure (§7)

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|---|---|---|---|---|---|
| D1/D2 | Enumerate and classify 食傷/財/官殺 candidates | SOURCE_CLASS_A (fixed Ten-God definitions) | Cross-school | Mechanical | BINDING | None | ADOPT | — |
| D3 | Compute each candidate's seasonal phase, flag unresolved sub-cases | SOURCE_CLASS_A (phase concept) / SOURCE_CLASS_D (engine-gap handling) | Cross-school | §4.3 applied to opposition | BINDING (phase) | None | ADOPT_WITH_CONDITION | — |
| D4 | Root-check each opposition candidate, no bucket flattening | Same provenance as ROOT-B1/B2, applied to opposition | Cross-school on concept | §5's logic, opposition side | CONDITIONAL | Tier-grading weight school-variable | ADOPT_WITH_CONDITION | — |
| D5 | Group by kind, flag 財→官殺 chains, no summation | SOURCE_CLASS_A (生剋 cycle logic) | Cross-school | §7.2 | CONDITIONAL (relationship) / SOURCE_CLASS_D (grouping scheme) | None on existence | ADOPT_WITH_CONDITION | — |

## Step E — Functional-force gate (§7.3)

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|---|---|---|---|---|---|
| E1 | Ordinal effective-force label, symmetric to both sides | SOURCE_CLASS_B (窮通寶鑑, 調候派, for seasonal-vitality-as-gate) / SOURCE_CLASS_B (滴천수 病藥 whole-chart framework) | 調候派 for the specific sourcing; principle cross-school | §5/§7 functional grading | BINDING (principle) | Risk of 조후-utility/강약-strength conflation explicitly guarded against (§9), not a doctrinal dispute per se | ADOPT_WITH_CONDITION | Blocked on P0-2 for the clash/combination component |
| E2 | Hard guard: never sum E1 outputs into a vote | SOURCE_CLASS_D, direct corrective to the rejected predecessor's exact defect | Not school-specific | Pipeline prohibition | BINDING | None | ADOPT | — |
| E3 | 正官/七殺 disposition = severity flag, not magnitude | SOURCE_CLASS_A (子平真詮) | 格局派 | §7.1 | CONDITIONAL | Other schools weight this less for pure strength | ADOPT_WITH_CONDITION | — |
| E4 | Hard guard: climate never feeds E1 directly | SOURCE_CLASS_D, per §9's sourcing | Not school-specific | Pipeline prohibition | BINDING | None | ADOPT | — |

## Step F — Relation/transformation layer (§8) — REWRITTEN

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|---|---|---|---|---|---|
| F-천간합-DETECT | Detect 甲己乙庚丙辛丁壬戊癸 stem pairs | SOURCE_CLASS_A | Cross-school | Detection (already a frozen fact) | BINDING | None | ADOPT | — |
| F-천간합-FORM | Adjacency + 爭合/妒合 contest check | SOURCE_CLASS_B/C | Broadly acknowledged, under-formalized | Formation/validity | CONDITIONAL | None major | ADOPT_WITH_CONDITION | — |
| F-천간합-TRANS | 合化 5-precondition test (seasonal support, proximity, no breaking force, unopposed persistence, DM-involvement caution) | SOURCE_CLASS_A/B (framework) — DM-involvement specifically SOURCE_CLASS_C, contested | DM-involvement default is a disclosed engineering choice, not resolved doctrine — named lineages diverge | Transformation | CONDITIONAL, DM-involvement explicitly ADVISORY only (no default adopted) | DM-involvement: explicit, named, unresolved | ADOPT_WITH_CONDITION | DM-involvement sub-question: DEFER |
| F-육합 | Same 5-question structure, branch six-combination | SOURCE_CLASS_A (detection) / SOURCE_CLASS_C (whether pure branch 六合 independently transforms vs. stem-pair 合化's better-codified conditions) | Less uniformly codified than stem 合화 | §8.2 | CONDITIONAL | Real, named | ADOPT_WITH_CONDITION | — |
| F-삼합방합-DETECT | Detect full/partial trio, center-branch inclusion | SOURCE_CLASS_A | Cross-school | Detection | BINDING | None | ADOPT | — |
| F-삼합방합-FORM | 방합-vs-三合 relative ranking | SOURCE_CLASS_C | Real teaching point, genuinely disputed by some commentators | Formation strength ranking | ADVISORY only | Explicit, named, not resolved | DEFER (the ranking specifically) | Genuinely school-dependent, no adopted resolution |
| F-삼합방합-TRANS | Full completed set → STRUCTURAL; partial → FUNCTIONAL only | SOURCE_CLASS_A/B | Cross-school on the full-vs-partial distinction | §8.3 TRANSFORMATION | BINDING (full-vs-partial distinction) | None on the distinction itself | ADOPT | — |
| F-충-FUNC | Grade 沖 damage (INTACT/WEAKENED/DESTROYED/MEDIATED) via vitality+reinforcement+distance+貪合忘沖 | SOURCE_CLASS_A/B (mechanics + 任鐵樵-descended contextual severity reading) | Schools differ on isolated-clash weight | §8.4 | CONDITIONAL | Named, real | ADOPT_WITH_CONDITION | Blocked on P0-2 |
| F-형-POLICY | 형 runtime strength authority | SOURCE_CLASS_E for functional/strength effect; SOURCE_CLASS_A for the branch groupings themselves (real, attested taxonomy) | Substantial, largely unresolved | §8.5 | `DEFER` (product policy, NOT a claim of universal zero-effect) | Explicit, substantial, named | DEFER | Insufficient sourcing for either "matters" or "never matters" as runtime-binding |
| F-해-POLICY | 害 runtime strength authority | Same structure as 형, thinner grounding | Traditionally regarded as among the weakest classical relations | §8.6 | `DEFER` | Low disagreement that it should be DEFERRED (most modern practice already discounts it) | DEFER | Same as 형, weaker grounding still |
| F-파-POLICY | 破 runtime strength authority | SOURCE_CLASS_E even for the pair list itself (derivations disagree) | Many lineages omit entirely | §8.7 | `DEFER` | Explicit — whether to use 破 at all is itself the disagreement | DEFER | Canonical pair list itself contested |
| F7 | Transformation feedback loop — re-trigger D3/D4 before E1 on any STRUCTURAL change | SOURCE_CLASS_D | Not school-specific | Sequencing | BINDING | None | ADOPT | — |

## Step G — Special-structure gate (§10) — REWRITTEN, no universal SG-0

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|---|---|---|---|---|---|
| G-INTEGRITY | Corrected disqualifier mechanism: functional integrity, not mere existence, of a candidate disqualifying element | SOURCE_CLASS_D operationalization applying §5/§8's existing SOURCE_CLASS_A/B machinery to the gate — **no longer a separate universal rule** | Not school-specific (the mechanism); the underlying rooted-opposition-threatens-a-pattern intuition is SOURCE_CLASS_B, 任鐵樵-lineage | Replaces V1's SG-0 | BINDING (as engineering mechanism) | None on the mechanism; individual pattern disqualifiers below retain their own named disputes | ADOPT | — |
| G-從旺 | 從旺格 conditions | SOURCE_CLASS_B (滴천수/任鐵樵-descended, later 徐樂吾-lineage systematization) | 子평真詮 does not use this vocabulary — named school gap, not silently smoothed | §10.1 | CONDITIONAL | 子평真詮's silence vs. active 滴천수-lineage use | ADOPT_WITH_CONDITION | — |
| G-從强 | 從强格 conditions, incl. 從强-vs-從旺 boundary | SOURCE_CLASS_B, same lineage | Boundary itself is SCHOOL_DEPENDENT, explicitly not resolved | §10.1 | CONDITIONAL | Named, explicit | ADOPT_WITH_CONDITION | Boundary question itself: DEFER |
| G-從財 | 從財格 conditions, incl. 財+官殺-both-present dispute | SOURCE_CLASS_B/C | 財+官殺 case: named school split, routes to DOCTRINE_CONFLICT | §10.1 | CONDITIONAL | Explicit, named, resolved via DOCTRINE_CONFLICT not a silent default | ADOPT_WITH_CONDITION | The disputed sub-case specifically: DEFER (routes to runtime DOCTRINE_CONFLICT state instead) |
| G-從官殺 | 從官殺格 conditions | SOURCE_CLASS_B/C | Relatively more confidently attested than 從兒 | §10.1 | CONDITIONAL | None major beyond general 從弱-family disputes | ADOPT_WITH_CONDITION | — |
| G-從兒 | 從兒格 conditions, stricter bar | SOURCE_CLASS_C — thinnest-grounded of the 從弱 patterns per secondary literature | Pattern's own legitimacy more contested than its siblings | §10.1 | CONDITIONAL, biased toward CANDIDATE_UNCONFIRMED | Explicit | ADOPT_WITH_CONDITION | — |
| G-專旺 | 專旺格 (5 named mono-element patterns) conditions | SOURCE_CLASS_C | Named systematizing scholarship, not one classical passage | §10.1 | CONDITIONAL | 방합-vs-三合 ranking dispute inherited where relevant | ADOPT_WITH_CONDITION | — |
| G-OUTPUT | 4-state gate output incl. new DOCTRINE_CONFLICT state | SOURCE_CLASS_D | Not school-specific | §10.3 | BINDING (composition logic) | None | ADOPT | — |
| G-EXCLUDED | 化氣格/兩神成象格/從印格 excluded | 化氣格/兩신成象格: SOURCE_CLASS_E. 從印格: reasoning is SOURCE_CLASS_A (印 generates rather than opposes the DM) | — | §10.2 | NON_AUTHORITATIVE | None on 從印格's exclusion logic; 化氣格/兩신成象格 simply under-sourced | DEFER (化氣格, 兩신成象格) / REJECT (從印格 as a separate category) | Thin/disputed completion-criteria; recommend dedicated follow-up research |

## Reasoning architecture, classification, and evidence contract (structural sections, not per-rule tables)

| Item | TEXT_LAYER | SCHOOL | RUNTIME_AUTHORITY | CANONICAL_STATUS |
|---|---|---|---|---|
| A–I sequenced architecture with corrected gate order (§11) | SOURCE_CLASS_A (anti-vote principle: 子평真詮, 滴천수) / SOURCE_CLASS_D (specific 9-step + gate-order operationalization) | Cross-school on anti-vote; not school-specific on the operationalization | BINDING | ADOPT |
| Seven-band DECISION CONTRACTS, explicitly Level-C product rendering (§12) | SOURCE_CLASS_D throughout — explicitly NOT claimed as classical taxonomy (§12.0) | Not school-specific | BINDING (as product rendering, not as classical citation) | ADOPT |
| Disqualifying/limiting evidence replacing the two removed caps (§12.3) | SOURCE_CLASS_D, resolving the §6.2/Cap-1 internal contradiction | Not school-specific | BINDING | ADOPT |
| Extreme bands separated from special patterns (§12.4) | SOURCE_CLASS_D | Not school-specific | BINDING | ADOPT |
| Five-state uncertainty model incl. widened DOCTRINE_CONFLICT trigger (§13) | SOURCE_CLASS_D, methodologically grounded in genuine commentarial disagreement on hard example charts | Not school-specific | BINDING | ADOPT |
| Evidence contract with full provenance-tuple DOCTRINE_SOURCE (§14) | SOURCE_CLASS_D | Not school-specific | BINDING | ADOPT |

## Explicitly excluded/deferred categories

| Category | CANONICAL_STATUS | DEFERRED_REASON |
|---|---|---|
| 化氣格 | DEFER | Thin/disputed completion-criteria grounding |
| 兩神成象格 | DEFER | Thin classical grounding, inconsistent entry criteria |
| 從印格 (separately named) | REJECT | Collapses into 從强 in mainstream treatment |
| 형 as strength-magnitude authority | DEFER (product policy) | Substantial, unresolved school disagreement — NOT asserted as Level-A universal zero-effect |
| 害 as strength-magnitude authority | DEFER (product policy) | Thin grounding, weaker than 형 |
| 破 as strength-magnitude authority | DEFER (product policy) | Canonical pair list itself contested; many lineages omit entirely |
| Any specific 사령 day-count table | DEFER | Multiple named editions disagree; none selected |
| Any specific per-cell 궁통보감 climate-remedy table | DEFER | Out of scope for strength doctrine; belongs to a future Yongshin phase |
| A universal existence-only special-structure disqualifier (V1's SG-0) | REJECT | Insufficiently supported as a universal classical rule; contradicted the document's own existence-vs-function principle applied everywhere else |
| Two absolute structural caps (V1) | REJECT | Directly contradicted §6.2's floating-support-is-not-zero claim |
| Rigid 월>일>시>년 rooting-position hierarchy (V1) | REJECT (as a general hierarchy) / ADOPT (the two specific named facts: 월지 seasonal-command authority, 일지 DM-adjacency) | No source establishes the general four-way ranking; the two specific facts remain independently sourced |
| DM-involvement 合화 default | DEFER | Genuinely disputed across named lineages; no default adopted, ADVISORY only |
| 財+官殺-both-present 從財 qualification | DEFER (routes to DOCTRINE_CONFLICT at runtime) | Named school split, not silently resolved |
