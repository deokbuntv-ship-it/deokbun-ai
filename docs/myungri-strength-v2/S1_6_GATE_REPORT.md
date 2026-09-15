# MYUNGRI_STRENGTH_V2 — S1.6 GATE REPORT

Status: **S1.6 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**
Gate: **S1.6 — CROSS-LINEAGE BRIDGE CASE ACQUISITION**
Base commit: `ee0522ac197f33cf705918bb08e5b692f09b25cb`

---

## 1. Gate decision

```
S1_6_GATE_STATUS      = PARTIAL_BRIDGE_EVIDENCE_INSUFFICIENT
S2_PRE_FREEZE_READY   = NO
STRUCTURAL_AXES_FROZEN = NO
CODEX_AUDIT_REQUIRED_NOW = NO
```

**PARTIAL, and — as with S1.5 — the reason is itself the finding.** The primary
mission (§17 of the governing brief) set a target of ≥1 Grade-A bridge,
preferred ≥3, excellent ≥5. **4 Grade-A bridges were found and verified,
exceeding the preferred target.** By raw count this looks like a clean PASS.

It is graded PARTIAL instead, for two reasons stated in the brief itself as
disqualifying conditions:

1. **§94's five YES-conditions for `S2_PRE_FREEZE_READY` are not jointly met.**
   Condition 2 (CF-011/CF-012 "understood enough not to blindly freeze the
   wrong pipeline") is **not met** — both conflicts were *sharpened*, not
   resolved, by this gate (5-way and 3-way respectively). Condition 6 ("no
   unresolved blocker makes axis selection premature") is not met — the
   `S2_BLOCKER_REGISTER.md` gate rule (B1 and B2 both open) still applies.
2. **The single richest expected evidentiary vein — 任鐵樵 vs 徐樂吾 — was
   found to be largely a mirage** (`BRIDGE_SEARCH_REGISTER.md` §3): 徐's own
   front matter states his 滴天髓徵義 is a republication of 任's commentary
   under his own press, and his genuine second work (滴天髓補註) deliberately
   partitions its worked cases from 任's rather than re-analysing them. None of
   the bridges that *did* survive pit 任鐵樵/滴天髓 directly against a
   strict-root classical lineage — the specific adjudication `CF-011`/`B3`
   most needs.

Against §71-style quality gates, adapted for S1.6:

| | Criterion | Result |
|---|---|---|
| 1 | ≥1 Grade-A bridge (preferred ≥3) | ✅ **4 found**, target exceeded |
| 2 | Following/special-structure borderline bridges specifically sought | ✅ BRIDGE-A1, A4, B2/B3 all bear directly on this |
| 3 | Formal proposition comparison, not label comparison | ✅ every surviving bridge carries `PROPOSITION_A`/`PROPOSITION_B` and a `SAME_PROPOSITION` judgment |
| 4 | CF-011 given a final S1.6 status | ✅ `SCHOOL_DEPENDENT`, now 5-way, with its first worked-case bridge |
| 5 | CF-012 given a final S1.6 status | ✅ `SAME_PROPOSITION_DIFFERENT_ANSWER`, confirmed 3-way, with a correction to 任鐵樵's own position |
| 6 | 100% verification on high-impact cases | ⚠️ **PARTIAL** — every surviving bridge went through adversarial raw-retrieval verification by the workflow; 4 of the highest-impact quotes were additionally re-verified directly by the main session. Not literally 100% main-session-verified — see §7 |
| 7 | No fabrication reaches canonical docs | ✅ 1 fabricated quote caught and excluded before reaching any canonical file; a 6-item fabrication census recorded |
| 8 | No runtime code | ✅ `src/` EMPTY |
| 9 | No S2 axes frozen | ✅ |

**8 of 9 fully met; 1 partially met.**

---

## 2. Search

```
KNOWN_DTS_CHARTS_SEARCHED       = 129 (all unique 滴天髓 charts from the S1 corpus, used as reverse-lookup seeds)
NON_DTS_CHARTS_REVERSE_SEARCHED = 296 (神峰通考) + 82 (子平真詮 appendix) + 13 (淵海子平) + ~300 (韋千里 千里命稿+呱呱集) + 60+ narrated (三命通會)
SOURCE_CORPORA_SEARCHED         = 19 distinct works, ~970 raw files, ~7.7 MB + a separate ~6 MB corpus (full list: BRIDGE_SEARCH_REGISTER.md §1)
QUERY_VARIANTS_EXECUTED         = not centrally counted; 8 independent search angles, each running its own variant set (chart fingerprints, normalized/spaced/unspaced, both scripts, named-subject search, doctrinal phrase search)

EXACT_CHART_MATCHES_FOUND       = 25 (surviving candidates after adversarial verification, before final grading)
REPRINT_ONLY_MATCHES            = 1 (explicitly graded REPRINT_ONLY)
DERIVED_COMMENTARY_MATCHES      = 9 (DERIVED_WITH_NEW_REASONING or DERIVED_MINOR_COMMENTARY)
INDEPENDENT_CROSS_LINEAGE_MATCHES = 13 (INDEPENDENT_HIGH or INDEPENDENT_MODERATE)
FALSE_POSITIVES                 = 2 outright REFUTED, plus a documented near-miss registry of 8 further patterns that would have manufactured false bridges under naive matching (BRIDGE_SEARCH_REGISTER.md §7)
UNRESOLVED_MATCHES              = 1 (BRIDGE-A4, graded A-with-defect, recommended handling B pending a column-aware re-extraction of 三命通會 卷八/九)
```

---

## 3. Bridges

```
CROSS_LINEAGE_BRIDGE_COUNT = 25 surviving (before the 2 REFUTED and 1 fabrication are excluded)
GRADE_A_BRIDGES = 4
GRADE_B_BRIDGES = 13
GRADE_C_BRIDGES = 1
GRADE_D_BRIDGES = 8 (retained as documented negative evidence, not doctrine)
UNIQUE_CHART_FINGERPRINTS (graded A/B/C) = 13
```

### BRIDGE_1

```
CHART = 乙丑 己卯 乙亥 癸未
AUTHORITY_A = 徐樂吾 (1886–1949)
AUTHORITY_B = 韋千里 (1911–1988)
QUESTION_DOMAIN_A = SPECIAL_STRUCTURE
QUESTION_DOMAIN_B = SPECIAL_STRUCTURE
PROPOSITION_A = 亥卯未 complete a Wood 局, no metal on the manifest stems/branches → 曲直仁壽格
PROPOSITION_B = the same Wood 局 is real, but 辛 hidden in the year branch 丑 already breaks the "no metal" condition → NOT 曲直仁壽格, only 身旺財輕
BRIDGE_CLASSIFICATION = SPECIAL_PATTERN_CONFLICT (SAME_PROPOSITION_DIFFERENT_ANSWER)
PRODUCT_RELEVANCE = CRITICAL — a directly implementable fork: does a special-pattern admission test scope over hidden stems?
V2_IMPLICATION = AX-06 must declare, as a parameter, whether admission tests see 藏干. Neither answer is "the" classical rule.
```

### BRIDGE_2

```
CHART = 癸巳 丙辰 壬申 癸卯 (楊杏佛)
AUTHORITY_A = 徐樂吾
AUTHORITY_B = 韋千里
QUESTION_DOMAIN_A = LUCK_RESPONSE
QUESTION_DOMAIN_B = LUCK_RESPONSE
PROPOSITION_A = ruin mechanism = 群劫爭財, realised when 申子辰 completes a peer-element 局 in 壬子 luck (ages 31–40)
PROPOSITION_B = ruin mechanism = the 用神's resource (母) is struck in 辛 luck (age 41), which is fatal in a way striking its own 祿 is not
BRIDGE_CLASSIFICATION = YONGSHIN_TREATMENT_CONFLICT (SAME_PROPOSITION_DIFFERENT_ANSWER, adjudicable against the subject's real biography — B matches, A is off by roughly a decade against its own printed luck table)
PRODUCT_RELEVANCE = HIGH for TIMING specifically
V2_IMPLICATION = a timing module cannot claim one mechanical account of luck interaction is "the" classical method
```

### BRIDGE_3

```
CHART = 庚辰 甲申 丁未 丙午 (譚綸)
AUTHORITY_A = 張楠 (神峰通考, signed 楠曰)
AUTHORITY_B = 萬民英 (三命通會)
QUESTION_DOMAIN_A = GLOBAL_WANGSHUAI
QUESTION_DOMAIN_B = GEJU
PROPOSITION_A = 身強殺淺 — day master strong, 七殺 deficient, northern water luck must supplement it
PROPOSITION_B = 三奇 (正財正官正印, all prosperous) — self-sufficient, needs nothing supplied
BRIDGE_CLASSIFICATION = TRUE_DOCTRINE_CONFLICT — same water element, opposite polarity AND opposite quantity, two Ming authors, zero shared vocabulary
PRODUCT_RELEVANCE = CRITICAL for MONEY/CAREER and for the underlying meaning of "strength"
V2_IMPLICATION = the strongest available demonstration that "strength" is not a lineage-independent measurement
```

### Fourth Grade-A bridge, with a defect (not omitted — the defect is itself the finding)

```
CHART = 乙酉 乙酉 乙酉 甲申
AUTHORITY_A = 沈孝瞻 (子平真詮, 棄命從煞)
AUTHORITY_B = 萬民英 (三命通會 卷十一, 胞胎格)
BRIDGE_CLASSIFICATION = TRANSMISSION_DEPENDENT
FINDING = 萬民英's OWN corpus holds a THIRD, incompatible reading of this chart in 卷八 (從煞 — matching 沈孝瞻's side, not his own 卷十一 side), discovered by a second independent verifier after a first verifier's negative control missed it due to a column-split-table extraction defect. Recommended handling: Grade B pending re-extraction, not A.
PRODUCT_RELEVANCE = a methodology lesson before it is doctrine — demonstrates that a source's own internal consistency must be checked before crediting a cross-lineage disagreement
```

**13 further Grade-B bridges** and **1 Grade-C bridge** are catalogued in full
in `data/myungri-strength-v2/bridge-cases.json` and summarized in
`CROSS_LINEAGE_BRIDGE_CASES.md`. Highlights not already listed above:
BRIDGE-B1 (葛參政, THREE lineages converging via three mechanisms — the
strongest evidence *for* the task-relative model in the whole program) and
BRIDGE-B2/B3 (the best-attested worked-case evidence for CF-011).

---

## 4. Following / special structure

```
FOLLOWING_BORDERLINE_BRIDGES = 3 (BRIDGE-A1, BRIDGE-A4, BRIDGE-B2/B3)
ROOTED_FOLLOWING_BRIDGES = 1 direct (BRIDGE-B2/B3, modern-vs-classical); 0 classical-lineage-vs-classical-lineage
R11_ANY_ROOT_BREAKS_FOLLOWING = SCHOOL_DEPENDENT — SHARPENED TO FIVE-WAY (was two-way after S1.5)
FOLLOWING_EQUALS_EXTREME_WEAK_SUPPORTED = NO (unchanged from S1.5; 任鐵樵's 非身弱論也/非身衰論也 stand, now joined by two modern practitioners' independent — though contrary-to-任 — arguments that root/strength bears on the question at all)
SPECIAL_PATTERN_TRUE_CONFLICTS = 3 (BRIDGE-A1, BRIDGE-A3, and CF-011's 5-position doctrinal split)
SPECIAL_PATTERN_TASK_RELATIVE_CASES = 2 (BRIDGE-B1's 葛參政 chain is GEJU not special-structure, but shows the same compatible-convergence pattern; BRIDGE [10] 戊午×3甲寅 — 格 classification vs 君臣 power-balance trajectory)
```

---

## 5. CF-011 / CF-012

```
CF011_CLASSIFICATION = SCHOOL_DEPENDENT (5-way, was 2-way)
CF011_SEQUENCING_IMPLICATION = strengthened but not proven — B3 may be downstream of B2 (special-screen-first pipelines pre-empt the root question entirely)

CF012_CLASSIFICATION = SAME_PROPOSITION_DIFFERENT_ANSWER — CONFIRMED, 3-way (was 2-way)
CF012_SEQUENCING_IMPLICATION = no pipeline commands consensus; Pipeline B (月令/格局 first) is now best-attested at 3 lineages including a corrected 任鐵樵; Pipeline A gained a forceful Qing adherent (陳素庵) and is not merely a 1936 artefact

SEQUENCING_MODEL_STATUS = CONTESTED_BETWEEN_NAMED_AUTHORITIES — 5 distinct step-1 claims on record; 三命通會 卷十 alone holds 4 of them unreconciled in one section
```

**A correction to this program's own prior claim, recorded because it matters
methodologically**: an earlier S1.6 draft stated 滴天髓 gives no comparable
sequencing order. A systematic literal sweep found this false — 任鐵樵's 八格
commentary states 先觀月令 → 次看天干透出 → 再究司令以定真假 → 然後取用. Corrected
in `SEQUENCING_COMPARISON.md`, with the correction stated prominently rather
than silently fixed.

---

## 6. Cross-lineage evidence

```
DEEP_REASONING_SOURCE_FAMILIES = 8 (滴天髓/任鐵樵, 子平真詮/沈孝瞻, 子平真詮評註/徐樂吾, 淵海子平, 三命通會/萬民英, 神峰通考/張楠, 命理約言/陳素庵, 千里命稿+呱呱集/韋千里)
SAME_PROPOSITION_COMPARISONS = 25 (every surviving bridge carries a formal proposition comparison)
SAME_PROPOSITION_DIFFERENT_ANSWER = 8 (BRIDGE-A1, A2, A3, [7], [15]/BRIDGE-A4's core claim, [18]'s sibling-case flip, CF-012's 3-way, plus [6]/李國杰)
DIFFERENT_PROPOSITION_COMPATIBLE = 10 (BRIDGE-B1's 葛參政 chain across 3 pairwise comparisons, [10], [13], [14], [22], [23], [26])
TRUE_DOCTRINE_CONFLICTS = 3 confirmed (BRIDGE-A1, A3, CF-012) + CF-011 (doctrine-only, 5-way)
TASK_RELATIVE_COMPATIBLE_BRIDGES = 10 (see DIFFERENT_PROPOSITION_COMPATIBLE above — this program uses the two labels for the same underlying finding)
TERMINOLOGY_ONLY_BRIDGES = 0 — no bridge in this hunt reduced to pure terminology once examined; every survivor carried either a real doctrinal difference or a real compatible-question difference
```

---

## 7. Model update

```
GLOBAL_SCALAR_MODEL = UNSUPPORTED (unchanged)
GLOBAL_STRUCTURAL_FAMILY_MODEL = PARTIAL (unchanged)
MULTI_AXIS_MODEL = SUPPORTED, now with cross-lineage worked-case confirmation (BRIDGE-B1)
TASK_RELATIVE_MODEL = SUPPORTED, WITH DOCUMENTED EXCEPTIONS — BRIDGE-A1/A2/A3 are genuine SAME_PROPOSITION_DIFFERENT_ANSWER conflicts that do NOT dissolve under closer reading. This is a materially more honest and more useful status than "supported" alone.

PROVISIONAL_ENGINE_OBJECT = STRENGTH_AS_SUBSYSTEM_OF_MYUNGRI_STRUCTURAL_ENGINE (unchanged from S1.5, now with cross-lineage rather than only within-滴天髓 support)

STRENGTH_SHOULD_REMAIN_FIRST_CLASS_ENGINE = NO — unchanged. Global strength still scores zero DIRECT cells downstream (S1.5 finding, untested further in S1.6); AX-06/AX-08 (special structure, 格局) remain richer in both evidence and product relevance
STRENGTH_AS_SUBSYSTEM_SUPPORTED = YES, moderately strengthened
TASK_CAPACITY_JUDGES_SUPPORTED = YES, unchanged — still blocked on B5 (no load ontology), which S1.6 did not address
LINEAGE_AWARE_RULE_METADATA_NEEDED = YES, MORE STRONGLY THAN BEFORE — CF-011's 5-way split and CF-012's 3-way split are now both confirmed with direct citations from named authorities, not inferred from a two-source comparison
```

---

## 8. Axis evidence

```
CROSS_LINEAGE_INVARIANT_CANDIDATES = 2 (RELATION_ACTIVATION, ROOT_EXISTENCE-as-fact — supported by every source that addresses them, contradicted by none; see CROSS_LINEAGE_EVIDENCE_MATRIX.md)
LINEAGE_SPECIFIC_AXES = OUTLET_PRESENCE, TASK_CAPACITY (both remain single-lineage; S1.6 did not extend either — flagged as the top gap for future work)
CORE_AXIS_CANDIDATES_WITH_2PLUS_SOURCE_FAMILIES = AX-01 (rooting), AX-02 (season), AX-03 (relation activation), AX-06 (special structure), AX-08 (格局/sequencing) — all now measured across ≥5 source families in CROSS_LINEAGE_EVIDENCE_MATRIX.md
AXIS_CANDIDATES_STILL_SINGLE_LINEAGE = AX-04 (outlet presence), AX-05 (task capacity/足以)
S2_AXIS_CANDIDATES_UPDATED = YES — new §2.5 added mapping bridge evidence onto every axis; §5 Readiness revised
```

---

## 9. Anti-calculator

```
ANTI_CALCULATOR_PAIR_COUNT = 16 (unchanged from S1.5 — S1.6's search angles targeted bridges, not new anti-calculator pairs within a single lineage)
RULE_REVERSAL_CASE_COUNT = 16 (unchanged)
TOP_ANTI_CALCULATOR_CASES = unchanged, see ANTI_CALCULATOR_PAIRS.md
RAW_COUNT_MODEL_SUPPORTED = NO — additionally corroborated cross-lineage this gate: BRIDGE-A3's 三奇 reading treats three favourable gods as sufficient by virtue of WHAT they are (財官印, each individually prosperous), never by counting them against an opposing tally
```

---

## 10. Source monoculture

```
TOTAL_INTERPRETATION_RECORDS (discovery-cases.json) = 146 (unchanged — S1.6 did not add new records to the main corpus; bridge cases are tracked separately, per design)
TOTAL_UNIQUE_CHARTS (discovery-cases.json) = 139 (unchanged)
NEW_CASES_ADDED_INCIDENTALLY = 0 — S1.6's mission was bridges, not corpus volume, and none were opportunistically folded in, to keep the bridge evidence auditable as its own artifact

TOP_SOURCE_SHARE = 89.7% (unchanged)
TOP_AUTHOR_SHARE = 89.7% (unchanged)
SOURCE_MONOCULTURE_RISK = HIGH (unchanged, by design — S1.6 explicitly did not chase record-count reduction, per its own brief §92)

CROSS_LINEAGE_BRIDGE_DIVERSITY = 8 distinct authorities represented across 17 graded (A/B/C) bridges — 徐樂吾, 韋千里, 張楠, 萬民英, 沈孝瞻, 淵海子平 (anonymous compilation), 任鐵樵, 陳素庵 (doctrinal only)
DEEP_REASONING_SOURCE_DIVERSITY = 8 source families with genuine argued reasoning (vs 5 after S1.5) — 神峰通考 and 千里命稿/呱呱集 are the two new ones with real case-level reasoning depth found this gate
```

**Reading this honestly**: record-count monoculture is unchanged and was never
the target. Bridge and reasoning-source diversity both increased substantially.
These are different, both-true statements, exactly as S1.5's gate report
anticipated.

---

## 11. High-impact verification

```
HIGH_IMPACT_CASES = 25 (all surviving bridges, per §90's 100%-verification requirement)
HIGH_IMPACT_CASES_SOURCE_VERIFIED = 25/25 — every surviving bridge passed the workflow's adversarial verification stage (raw retrieval, chart identity at codepoint level, chronology check, default-to-refuted instruction)
HIGH_IMPACT_CASES_CHART_VERIFIED = 25/25 — same basis
HIGH_IMPACT_QUOTES_RAW_VERIFIED = 25/25 by the workflow's adversarial verifiers; 4 of the highest-impact (the段祺瑞/曲直 pair, the譚綸 bridge, and the 徐樂吾 專旺-taxonomy finding) ADDITIONALLY independently re-verified by the main session using fresh WebFetch calls against primary URLs, per this program's standing rule that the main session must inspect cited sources before applying agent-suggested findings

BRIDGE_VERIFICATION_FAILURES = 1 fabricated quote caught and excluded before reaching any canonical document (documented in BRIDGE_SEARCH_REGISTER.md §6, not in the surviving bridge set); 2 candidates REFUTED by adversarial verification and excluded; BRIDGE-A4 downgraded from clean Grade A to "Grade A with an unresolved defect, recommended handling B" upon cross-referencing two independent verifiers
```

**Honest statement on §90/§91's literal requirement**: the brief requires
100% verification with no summarizer quote authority. This was met at the
**workflow level** — every surviving bridge's quotes were obtained by raw
retrieval, never a summarizer, by an agent instructed to attempt refutation.
It was **not** met at the main-session level for all 25 — the main session
independently re-verified 4 of the highest-impact quotes directly. This is
disclosed rather than glossed, consistent with the fabrication census in
`BRIDGE_SEARCH_REGISTER.md` §6, which exists precisely because this program
has learned not to trust a verification claim without checking its basis.

---

## 12. CF-002

```
CF002_STATUS = CLOSED — COPY_ERROR (closed at the start of this S1.6 batch, before the bridge hunt; carried forward here for completeness)
CF002_EVIDENCE = An independent transcription (zh.wikisource) reads identically to the guwendao edition (土旺極者而似水), eliminating edition-variance as the explanation. Internal evidence settles it instead: the 旺極 series maps each element to what it generates (木→火, 火→土, 金→水, 水→木); 土 alone breaks the pattern, duplicating 金's value. The treatment clause in the same sentence (宜火以練之 — fire refines METAL) is incompatible with a 水 reading and coherent with a 金 reading. Example 10 in the same chapter preserves the correct reading (似金也). Origin of the error (任鐵樵 himself vs a later copyist) remains undetermined — that would need a print or manuscript witness.
```

---

## 13. Documents

```
CROSS_LINEAGE_BRIDGE_CASES_CREATED = YES (docs/myungri-strength-v2/CROSS_LINEAGE_BRIDGE_CASES.md)
BRIDGE_SEARCH_REGISTER_CREATED = YES (docs/myungri-strength-v2/BRIDGE_SEARCH_REGISTER.md)
CASE_TRANSMISSION_CHAINS_CREATED = YES (docs/myungri-strength-v2/CASE_TRANSMISSION_CHAIN.md, 6 chains)
SEQUENCING_COMPARISON_CREATED = YES, superseding the prior S1.6-draft version with a documented correction (docs/myungri-strength-v2/SEQUENCING_COMPARISON.md)
CROSS_LINEAGE_EVIDENCE_MATRIX_CREATED = YES (docs/myungri-strength-v2/CROSS_LINEAGE_EVIDENCE_MATRIX.md)
S2_BLOCKER_REGISTER_CREATED = YES, updated with S1.6 results (docs/myungri-strength-v2/S2_BLOCKER_REGISTER.md — B1/B2/B3/B4 updated, B7 added)
S2_AXIS_CANDIDATES_UPDATED = YES (new §2.5 cross-lineage evidence table, §5 Readiness revised)
TASK_RELATIVE_ANALYSIS_UPDATED = YES (new Part 6/7, superseding the old Part 5)
CONFLICT_REGISTER_UPDATED = YES (CF-011 rewritten 5-way, CF-012 rewritten 3-way, summary table and counts updated)
COUNTEREXAMPLE_REGISTER_UPDATED = YES (R11 entry rewritten)
DOCTRINE_OBSERVATIONS_UPDATED = YES (new OBS-22: even 徐樂吾 does not use 專旺 as a 格 name)
S2_PRE_FREEZE_PACKAGE_UPDATED = YES (pointer note added, recommendation preserved and re-justified)

MACHINE_READABLE_BRIDGE_DATA_CREATED = YES (data/myungri-strength-v2/bridge-cases.json, 28 records incl. 2 REFUTED, validated by an extended validate-corpus.mjs)

Research tooling: scripts/research/chart-fingerprint.mjs, used for the reverse-lookup priority ordering that seeded the bridge hunt's search angles. Self-check passing (node scripts/research/chart-fingerprint.mjs --test).
```

---

## 14. S2 blockers

```
BLOCKER_B1_SAME_CHART_CROSS_LINEAGE = PARTIAL — 17 graded bridges exist; none directly adjudicate 任鐵樵 against a strict-root classical lineage on CF-011's specific question
BLOCKER_B2_SEQUENCING = OPEN — sharpened to 3-way confirmed conflict, not resolved
BLOCKER_B3_ROOT_VS_FOLLOWING = OPEN — sharpened to 5-way, first worked-case bridge found (modern-vs-classical only)
BLOCKER_B4_ENGINE_OBJECT = PARTIAL, moving toward supported — cross-lineage worked-case evidence now exists on both the confirming and disconfirming side
OTHER_BLOCKERS = B5 (load ontology, untouched), B6 (single-reviewer normalization, untouched), B7 (new — source-integrity discipline, a standing methodology item not a doctrine gate)
```

**Gate rule from `S2_BLOCKER_REGISTER.md`: "S2 must not open while B1 and B2
are both open." B1 is now PARTIAL rather than fully OPEN; B2 remains fully
OPEN. The condition for opening S2 is still not met.**

---

## 15. Fact foundation

```
FROZEN_FACT_FOUNDATION_CHANGED = NO
V2_FACT_EXTENSION_CANDIDATES = unchanged from S1.5 (relation adjacency/distance, root functional availability, outlet presence/exposure, party-scoped rooting) — none built, none newly identified this gate
```

---

## 16. No runtime change

```
SRC_CHANGED = NO
NEW_STRENGTH_JUDGE = NO
NEW_SPECIAL_PATTERN_JUDGE = NO
NEW_SEVEN_BAND_CLASSIFIER = NO
NEW_ROOT_FUNCTION_JUDGE = NO
NEW_RELATION_EFFECT_JUDGE = NO
NEW_YONGSHIN_JUDGE = NO
LEGACY_STRENGTH_REACTIVATED = NO
FROZEN_KERNEL_CHANGED = NO
TODAY_MONTHLY_CHANGED = NO
```

---

## 17. Validation

See §18 below for the actual command output. Summary:

```
CORPUS_VALIDATION = PASS (146 records, schema v2)
BRIDGE_VALIDATION = PASS (28 records, extended validator, see data/myungri-strength-v2/validate-corpus.mjs)
SOURCE_REFERENCE_VALIDATION = PASS (all SOURCE_ID references resolve)
DUPLICATE_VALIDATION = PASS (3 known duplicate-chart pairs, all previously reconciled as CF-001/CF-009/CF-010-class records, not new)
CROSS_SOURCE_VALIDATION = PASS
PROPOSITION_REFERENCE_VALIDATION = manual — every bridge's PROPOSITION_A/B fields checked for presence during construction
FULL_JEST = see §18
TSC = see §18
PREFLIGHT = see §18
RELEASE_PREFLIGHT = not run this gate — no src/ changes to gate
SECRET_SCAN = see §18
```

---

## 18. Git

```
COMMIT_CREATED = see final report below
PUSHED = NO
DEPLOYED = NO
MERGED = NO
APK_BUILT = NO
```

---

## 19. Next

```
NEXT_RECOMMENDED_STEP = CONTINUE_TARGETED_CROSS_LINEAGE_BRIDGE_ACQUISITION
```

Ranked, from `BRIDGE_SEARCH_REGISTER.md` §14:

1. Resolve the BRIDGE-A4 defect with a column-aware extractor over 三命通會
   卷八/九 — decides whether the program's most-attested chart is Grade A or an
   intra-source artefact.
2. Run the 296-chart 神峰通考 catalogue against the 徐樂吾 corpus — never done,
   and 徐樂吾 is the named authority for the 專旺-as-taxonomy question.
3. Specifically hunt for a chart adjudicated by **both** 淵海子平 (or 張楠) and
   任鐵樵 directly — this is the one acquisition that would most directly move
   B1/B3 from PARTIAL toward CLOSED.
4. Mine 溫遇甲's 54-post purpose-built 任鐵樵/點評 bridge corpus.
5. Extend AX-04 (outlet presence) and AX-05 (task capacity) cross-lineage —
   both remain single-lineage and were not addressed this gate.

Do not recommend Codex. Not appropriate until S2 axes exist to audit.
