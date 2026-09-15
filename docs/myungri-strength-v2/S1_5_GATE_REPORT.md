# MYUNGRI_STRENGTH_V2 — S1.5 GATE REPORT

Status: **S1.5 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**
Gate: **S1.5 — SOURCE DIVERSIFICATION + CROSS-LINEAGE COMPARATIVE CORPUS**
Base commit: `e9cb7f354c60af0856074f44cfb066b2098b749b`

---

## 1. Gate decision

```
S1_5_GATE_STATUS = PARTIAL_SOURCE_DIVERSITY_SHORTFALL
S2_PRE_FREEZE_READY = NO
STRUCTURAL_AXES_FROZEN = NO
CODEX_AUDIT_REQUIRED_NOW = NO
```

**PARTIAL, and the reason is a finding rather than a failure.** The record-count
target (≥100 new non-滴天髓) was not met — 15 were added. But the four new lineages
were **materially examined**, and the reason they yielded few records is the
substantive result of this gate: **they are doctrine-dense and case-thin, and
three of them do not treat Day-Master strength as a first-class question at all.**

Forcing 100 records out of them would have required treating rule-restatements and
unanalysed specimens as worked cases — which §6 explicitly warns against, and
which would have misrepresented every one of them.

Against the §71 quality gates:

| | Criterion | Result |
|---|---|---|
| A | Significant non-DTS corpus added | ⚠️ **15 records, not 100** — honest shortfall |
| B | ≥2 additional source families materially examined | ✅ **4** examined in depth |
| C | Source reasoning frames distinguished | ✅ 5 frames, measured |
| D | CF-009 analysed deeply | ✅ **RESOLVED** |
| E | Task-relative hypothesis tested | ✅ SUPPORTED |
| F | Cross-source terminology register built | ✅ |
| G | Special-pattern lineage comparison built | ✅ |
| H | Draft axis candidates grounded in cases | ✅ 10 candidates |
| I | No runtime code | ✅ `src/` EMPTY |
| J | No canonical S2 axes frozen | ✅ |

**9 of 10 met. A is the shortfall.**

---

## 2. Corpus

```
TOTAL_INTERPRETATION_RECORDS = 146   (was 131)
TOTAL_UNIQUE_CHARTS          = 139
NEW_NON_DTS_RECORDS          = 15
NEW_UNIQUE_CHARTS            = 10
DTS_RECORDS                  = 131
NON_DTS_RECORDS              = 15
FABRICATED_CASES             = 0
SYNTHETIC_COUNTED_AS_REAL    = 0
ANONYMOUS_CALCULATOR_GOLD    = 0
```

By source family:

| Family | Records | Charts located | Extracted | Why the gap |
|---|---|---|---|---|
| 滴天髓闡微 | 131 | 226 | 131 | deliberate selection (S1) |
| 三命通會 | 5 | 60+ narrated, 100s tabulated | 5 | median judgment is 15–40 chars; 卷八–九 excluded as later interpolation |
| 淵海子平 | 3 | 13 | 3 | analyses are 1–3 sentence rule-restatements |
| 子平真詮 (沈) | 3 | 82 | 3 | charts are **one-line citations**: pillars + a 4-char 格局 tag, no luck cycle, no narrative |
| 窮通寶鑑 | 2 | 183 | 2 | labels are 2–6 chars; **most charts carry none** |
| 徐樂吾 | 2 | ~14 sampled | 2 | modern layer — recorded as `NEGATIVE_REFERENCE`, never gold |

Quality: Grade A 104 · B 36 · C 6.
Gold: `GOLD_ELIGIBLE` 119 · `RESEARCH_ONLY` 18 · `CONFLICT_CASE` 7 · `NEGATIVE_REFERENCE` 2.

---

## 3. Source diversity — the honest metric

```
UNIQUE_SOURCES        = 8 registered (6 primary + 2 negative-reference)
UNIQUE_SOURCE_FAMILIES = 6
UNIQUE_AUTHORS        = 7
TOP_SOURCE_SHARE      = 89.7%
TOP_AUTHOR_SHARE      = 89.7%  (任鐵樵, 131/146)
SOURCE_MONOCULTURE_RISK = HIGH  (unchanged)
```

**Record-level monoculture is not reduced.** 任鐵樵 still supplies 90% of the
corpus.

**Doctrinal monoculture is substantially reduced.** Four additional lineages were
read, measured, and are now documented well enough that a single-lineage
assumption can be caught — and it immediately was: **R11 flipped from "REFUTED"
to `SCHOOL_DEPENDENT`** on first contact with a second source.

These are different metrics and only the first is bad. The count says the case
corpus is still one author's; the substance says we now know which of his habits
are his.

---

## 4. Verification

```
NEW_RECORD_SPOTCHECK_N = 3 of 15 = 20.0%   (at the §68 floor)
SPOTCHECK_PASS         = 2 fully, 1 partially
SPOTCHECK_FAIL         = 0
CORRECTIONS_MADE       = 1 (verification status downgraded, see below)
```

Independently verified by the main session, against source, this batch:

| Claim | Result |
|---|---|
| 旺衰強弱四字 in 沈孝瞻's collated ch.6 | **ABSENT** ✅ |
| 黨眾為強 in 沈孝瞻's collated ch.6 | **ABSENT** ✅ |
| 只要四柱有根，便能受財官食神，而當傷官七煞 | **PRESENT** ✅ |
| 八字用神，專求月令 (ch.8) | **PRESENT** ✅ |
| 扶抑 / 調候 / 專旺 in 沈孝瞻's ch.8 論用神 | **ABSENT ×3** ✅ |
| 故取用神，於扶抑之外，必須參合氣候，即調候之法也 — layer = **徐注** | **PRESENT** ✅ |
| 日主有根則不可棄，主貧。無根棄之則富 | **PRESENT** ✅ |
| 類屬要身旺，而從化要衰也 | **PRESENT** ✅ |
| 看八字先明從化爲本 | **PRESENT** ✅ |
| 調候 anywhere in 窮通寶鑑 | **ABSENT** ✅ |
| 五月庚金…庚金敗地，專用壬水 | **PRESENT** ✅ |
| 十一月丙火，冬至一陽生，弱中復強，壬水為最 | **PRESENT** ✅ |
| 切忌戊己透干制水 | ⚠️ **NOT CONFIRMED** — the retrieval layer returned unrelated 五月甲木 text instead of an absence answer |

**The correction:** `QTBJ-GENG-05`'s ban clause is agent-reported only, and
`CF-013` was amended to lean on the verified prescription rather than the
unverified ban.

**A methodological warning that recurred independently in all four researcher
runs:** WebFetch's summarizing layer **fabricates matches** — it returns
plausible-looking "containing sentences" that do not contain the searched term.
Every count in this gate that matters was therefore derived by deterministic
string matching over raw DOM text, not by asking the summarizer. Anyone repeating
this work should assume the same.

---

## 5. Cross-lineage evidence

```
CROSS_LINEAGE_SAME_CHART_COUNT = 1 chart / 2 interpretations   (vs 滴天髓: 0)
SAME_AUTHOR_MULTI_FRAME_COUNT  = 2   (CF-001, CF-009)
RULE_REVERSAL_CASE_COUNT       = 16
ANTI_CALCULATOR_PAIR_COUNT     = 16  (all single-lineage)
```

**Zero shared charts with 滴天髓**, from 62 non-滴天髓 charts fingerprinted against
all 129. This is the gate's most consequential limitation: **where lineages
disagree, they disagree as doctrines, and no chart exists that both have ruled
on.** CF-011 is exactly the kind of question that needs one.

The one cross-lineage shared chart is **CS-001** — 壬申 壬子 戊午 乙卯, in both
子平真詮 (葛參政命) and 三命通會 卷五. Same verdict family (貴), different diagnosis
(財露 vs 陽刃), and **neither analysis assesses Day-Master strength**.

Conflicts:

```
OPEN = 10 · PARTIAL = 1 · RESOLVED = 2
by type — ONTOLOGY 4 · VERDICT 3 · TERMINOLOGY 2 · SCOPE 2 · QUANTIFIER 1 · SEQUENCING 1
```

New this gate: **CF-011** (root vs following — school-dependent), **CF-012**
(sequencing), **CF-013** (climate vs 扶抑), CF-010 (biographies).
Closed: **CF-009**.

---

## 6. CF-009 — resolved

```
CF009_CLASSIFICATION     = TASK_RELATIVE_COMPATIBLE (with a HIERARCHICAL component)
CF009_TRUE_CONTRADICTION = NO
CF009_TASK_RELATIVE      = YES
```

`CF009_PROPOSITION_A` (衰旺): this chart's Metal is prosperous to the extreme; an
extreme is drained rather than opposed, and the drain of extreme Metal is Water.

`CF009_PROPOSITION_B` (形象): this chart is a 獨象 of the 從革 type; a 獨象 requires
its 化神 to flourish, and the 化神 of Metal is Water.

Different predicates about different properties — degree vs form. The chapters ask
different questions (衰旺 原注: 旺則宜洩宜傷，衰則喜幫喜助 — treatment selection;
形象 verse 3: 獨象喜行化地，而化神要昌 — form identification). And both readings
agree on **every operative point**: dominant force, element needed, danger period.

`CF009_V2_IMPLICATION`: a chart has no single classification **vocabulary**, while
its underlying structural situation is stable across vocabularies. The output
shape should be `(question, chart) → conclusion + vector`, not `chart → band`.
**This revises the S1 gate report**, which recorded the stronger and less accurate
claim that a chart has no single classification at all.

---

## 7. Task-relative judgment

```
TASK_RELATIVE_CASE_COUNT         = 20 records tagged MULTI_DOMAIN
GLOBAL_CAPACITY_SUPPORTED        = NO
LOAD_SPECIFIC_CAPACITY_SUPPORTED = YES (single-lineage token evidence)
SAME_LABEL_DIFFERENT_TREATMENT_COUNT = 3 pairs (AC-07, AC-08, AC-09)
DIFFERENT_LABEL_SIMILAR_TREATMENT_COUNT = 0 found
```

`CAPACITY_LOADS_OBSERVED` = 財 · 官 · 殺 · 財官(joint) · 印(as destruction target)
· 水勢 · 火炎 · 日主之虛 · 身(幫)

Three facts kill the global reading: 足以 is twice predicated of an **adversary**;
once scoped to a **luck period**; and once coexists with 虛脫極矣 in one sentence.

Cross-lineage caveat: the *shape* recurs (子平真詮's 便能**受**財官食神而**當**傷官七煞
enumerates two load classes with two verbs), but the **token** 足以 occurs 0 times
in 子平真詮.

---

## 8. Strength model verdicts

```
GLOBAL_SCALAR_MODEL            = UNSUPPORTED
GLOBAL_STRUCTURAL_FAMILY_MODEL = PARTIAL
MULTI_AXIS_CAPACITY_MODEL      = SUPPORTED
TASK_RELATIVE_MODEL            = SUPPORTED

PROVISIONAL_ENGINE_OBJECT = STRENGTH_AS_SUBSYSTEM_OF_MYUNGRI_STRUCTURAL_ENGINE
                            (with a strong TASK_CAPACITY component)
```

Basis: four of five lineages do not ask the strength question first; one has no
strength axis at all; global strength scores **zero DIRECT cells** in the
downstream matrix; and the unifying strength-first doctrine is dated to 徐樂吾,
1936.

---

## 9. Terminology equivalence

```
WANG_EQUALS_QIANG_SUPPORTED           = NO
SHUAI_EQUALS_RUO_SUPPORTED            = NO
ROOT_EQUALS_STRENGTH_SUPPORTED        = NO
FOLLOWING_EQUALS_EXTREME_WEAK_SUPPORTED = NO
```

**Zero of eleven proposed equivalences supported; four refuted.** Measured
absences that matter: 有根 **0** and 得令 **0** in 滴天髓; 得地/得勢/財多身弱/任財 all
**0** in 沈孝瞻; 身強/扶抑/旺衰/調候 all **0** in 窮通寶鑑.

---

## 10. Special patterns

```
CONGER 9 · CONGCAI 3 · CONGGUANSHA 5 · CONGSHI 2 · CONGQI 1 · CONGWANG 1 · CONGQIANG 2
ZHUANWANG_OR_FIVE_SPECIAL 17
SPECIAL_PATTERN_CROSS_LINEAGE_READY = PARTIAL (2 of 5 lineages compared in depth)
```

**專旺格 is 20th-century systematization** — the provenance chain is now complete
across four classical sources: absent from 滴天髓 (uses 獨象/從強), absent from
淵海子平 (uses 類象/屬象), adjectival-only with no 格 in 三命通會, absent from
沈孝瞻's 論用神 — and present as a named category in 徐樂吾 1936.

And the lineages use **structurally different kinds of test**: 淵海子平 binary
glyph-presence (見庚辛即官殺，非此格也) · 三命通會 十神 relation (帶印為入格) ·
滴天髓 functional weighing. There is no single classical rule to implement.

---

## 11. Axis candidates

```
AXIS_CANDIDATE_COUNT = 10
AX-02 SEASON (role, not score)          READY
AX-03 RELATION ACTIVATION               READY
AX-09 NUMEROUSNESS (evidence only)      READY
AX-10 UNCERTAINTY                       READY
AX-01 ROOTING (party-scoped)            CANDIDATE
AX-04 OUTLET PRESENCE                   CANDIDATE
AX-05 CAPACITY(party,load,ground,time)  CANDIDATE — no load ontology
AX-06 SPECIAL STRUCTURE                 BLOCKED (CF-011, CF-012)
AX-07 CLIMATE                           EXCLUDE — separate module
AX-08 格局                               EXCLUDE — separate module

STRUCTURAL_AXES_READY_TO_FREEZE = PARTIAL
```

`FACT_READY` = AX-01(presence), AX-02, AX-03(presence), AX-04(presence), AX-09
`INFERENCE_ONLY` = AX-01(quality), AX-03(activation), AX-05, AX-10
`SOURCE_RESEARCH_NEEDED` = AX-04(usability), AX-06

```
FROZEN_FACT_FOUNDATION_CHANGED = NO
V2_FACT_EXTENSION_CANDIDATES = 4 (relation adjacency · root functional
  availability · outlet exposure · party-scoped rooting) — IDENTIFIED, NOT BUILT
```

---

## 12. Counterexamples

```
UNIVERSAL_SIMPLE_RULES_SUPPORTED = 0
R1 R2 R3 R4 R6 R8 R9 R10 refuted (lineage-scoped) · R11 SCHOOL_DEPENDENT · R5 R7 R12 contested
```

**The S1.5 correction to S1:** every "REFUTED" in the S1 register was established
on one lineage and did not say so. A scope warning now heads the register, and
R11 has been reclassified. This is the single clearest demonstration that S1.5
was necessary.

---

## 13. Scope compliance

| Constraint | Status |
|---|---|
| `git status --porcelain -- src/` | **EMPTY** |
| Frozen fact foundation changed | **NO** |
| New strength / special-pattern / seven-band / Yongshin judge | **NO** ×4 |
| Legacy strength reactivated | **NO** |
| Today/Monthly changed | **NO** |
| Research data reachable from production | **NO** — 0 grep hits under `src/` |
| Canonical S2 axes frozen | **NO** |
| Synthetic counted as real | **0** — validator hard-fails on `IS_SYNTHETIC` |
| Subagents wrote repository files | **NO** — all five read-only; every canonical file written by the main session |
| Modern systematization used as gold | **NO** — validator rejects `MODERN_SYSTEMATIZATION` + `GOLD_ELIGIBLE` |

---

## 14. Weaknesses

1. **Record-count shortfall.** 15 new records vs a ≥100 target. Cause: the other
   lineages are case-thin. Real, and honestly a limit on what can be *measured*
   cross-lineage rather than merely *described*.
2. **Zero shared charts with 滴天髓.** No cross-lineage disagreement can be
   adjudicated on a chart.
3. **12 of 15 new records remain `EXTRACTED`.** Only 3 reached `SOURCE_VERIFIED`.
   The doctrine claims they support were verified; the record texts mostly were
   not. `donglishuzhai.net` began refusing connections partway through.
4. **徐樂吾's own 窮通寶鑑評註 unread** — image-only scan. `OBS-18` rests on his
   子平真詮評註 of one year earlier. Strong inference, not direct measurement.
5. **Normalization still single-reviewer.** 0 records are `FOUNDER_REVIEWED`.
6. **Online editions are contaminated in ways not signposted** — 8bei8's inverted
   layer tags, Wikisource's abridged 淵海子平. Both were caught only by
   cross-checking collated editions.

---

## 15. Carry-forward

1. **Acquire a chart adjudicated by two lineages** — ideally a 從格 borderline.
   One such chart does more for CF-011 than another hundred single-lineage records.
2. **Resolve CF-011 and CF-012** — both block S2 axis selection.
3. **OCR 徐樂吾's 窮通寶鑑評註** (NLC scan, freely licensed) — converts OBS-18 to a
   direct measurement.
4. **Extract the remaining 95 滴天髓 charts** — cheap, URLs recorded.
5. **三命通會 卷七's full 29 女命 charts** — the best-reasoned non-滴天髓 material
   found.
6. **Second edition of 滴天髓闡微** — closes CF-002 and CF-010.

---

## 16. Decision

```
S1_5_GATE_STATUS = PARTIAL_SOURCE_DIVERSITY_SHORTFALL
S2_PRE_FREEZE_READY = NO
NEXT_RECOMMENDED_STEP = CONTINUE_S1_5_SOURCE_DIVERSIFICATION
```

S1.5 achieved its **doctrinal** objective and missed its **volume** objective. It
found four things S1 could not have found, three of which correct S1 conclusions:
R11 is school-dependent, CF-009 is not a contradiction, and the "classical"
strength doctrine is substantially 徐樂吾, 1936.

S2 should not open until a cross-lineage adjudicated chart exists. Everything else
on the carry-forward list is improvement; that one is a precondition.
