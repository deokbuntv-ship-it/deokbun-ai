# MYUNGRI_STRENGTH_V2 — S1 GATE REPORT

Status: **S1 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**
Gate: **S1 — SOURCE + REAL CASE CORPUS BUILD**
Base commit: `a843885b673ca646aa63f67154ef7c7ed655f388`

---

## 1. Result

| Gate criterion | Target | Actual | Verdict |
|---|---|---|---|
| Real source-provenanced cases | ≥ 100 | **131 records / 129 unique charts** | **MET** |
| Preferred band | 120–150 | 131 | **within band** |
| Fabricated cases | 0 | **0** | **MET** |
| Schema validation | pass | `VALIDATION = PASS` | **MET** |
| Independent spot-check | ≥ 20% | **28 / 131 = 21.4%** | **MET** |
| Spot-check discrepancies | — | **0** | — |
| Source judgment kept separate from our normalization | required | enforced by validator | **MET** |
| Runtime classifier built | **must be 0** | **0** | **MET** |
| Canonical V2 rules declared | **must be 0** | **0** | **MET** |

**S1 collection objective: MET.**
**S1 does not certify any doctrine, axis, or rule. None was produced, and none was permitted to be.**

## 2. Corpus composition

```
records            : 131
PRIMARY_CASE       : 129
unique charts      : 129
sources registered : 6  (4 primary, 2 negative-reference)
sources CONTRIBUTING: 1  ← the principal weakness
chapters covered   : 19
grade              : A 104 · B 25 · C 2
gold status        : GOLD_ELIGIBLE 119 · RESEARCH_ONLY 7 · CONFLICT_CASE 5
source tier        : B 131 (named commentary)
```

Normalized label distribution:

| Label | Count | Note |
|---|---|---|
| `SOURCE_NOT_EXPLICIT` | 36 | the source gave **no** strength label |
| `SOURCE_FOLLOWING_PATTERN` | 22 | |
| `SOURCE_EXTREME_STRONG` | 16 | 旺極/剛極 |
| `SOURCE_WEAK` | 14 | |
| `SOURCE_STRONG` | 14 | |
| `SOURCE_SPECIAL_STRUCTURE` | 14 | 化/獨象 |
| `SOURCE_EXTREME_WEAK` | 8 | 弱極/虛脫極 |
| `SOURCE_BALANCED` | 7 | 中和/兩停/均敵 |

**36 of 131 charts carry no source strength label at all.** That is a finding, not
a gap. A corpus where every chart had one would be recording our opinions.

## 3. Provenance

Single source: **SRC-001 滴天髓闡微** (verse tier A, 任鐵樵 commentary tier B,
public domain). All 131 records are tier B.

Every one of the 19 chapter URLs was independently confirmed — six against the
served book index, thirteen by direct successful retrieval.

**Correction to the record.** The chapter numbering used throughout V1 was wrong
for this edition: 形象 is 第十一 (not 第四十四), 方局 第十二, 八格 第十三,
官杀 第二十二, 伤官 第二十三, 刚柔 第二十八, 顺逆 第二十九, 反局 第五十二.
The 第四十四/第四十五 slots hold 奮鬱 and 恩怨. Corrected in `sources.json`.

## 4. Verification log

Method: re-fetch the chapter independently, compare **without** consulting the
extraction notes. Two levels — **EXACT** (byte-for-byte equality of
`ORIGINAL_JUDGMENT_TEXT`) and **PHRASE** (load-bearing citations present).

| Round | Cases | Level | Result |
|---|---|---|---|
| 1 | SHUNJU-05, SHUNJU-03, JIACONG-03, CONGXIANG-01, CONGXIANG-08 | PHRASE | 5/5 pass |
| 1 | SHUAIWANG-03, SHUAIWANG-04, SHUAIWANG-06 | EXACT | 3/3 byte-identical |
| 2 | GUANSHA-11, GUANSHA-13, GUANSHA-21, FANJU-08, GANGROU-03, GANGROU-04 | PHRASE | 6/6 pass |
| 2 | XINGXIANG-19, XINGXIANG-20, FANGJU-09, FANGJU-04, FANJU-13 | EXACT | 5/5 byte-identical |
| 3 | BAGE-05, BAGE-07, BAGE-08 | PHRASE | 3/3 pass |
| 3 | SHANGGUAN-12, SHANGGUAN-13, SHANGGUAN-16, SHUNNI-01, SHUNNI-02, SHUNNI-03 | EXACT | 6/6 byte-identical |

**28 cases · 14 EXACT · 14 PHRASE · 0 discrepancies · 21.4% coverage.**

**One fidelity gap found and corrected:** `DTS-CONGXIANG-01` had been transcribed
without its final clause 志有为也. Class: completeness, not accuracy — no
doctrinal phrase was affected. This is the error mode to keep watching: dropping
a trailing clause, not altering a quoted one.

The EXACT results confirm the corpus preserves source corruption rather than
silently normalising it (读书过目成育, 荫疪, 财炡有余, 生肓, 待郎 all reproduced).

## 5. Honest weaknesses

Stated in order of severity. None of these is fixed by more extraction from the
same place.

**① SOURCE MONOCULTURE — the dominant risk.** All 131 records come from one
lineage, one commentator, one edition. 滴天髓's 氣勢 reading is *one school*;
子平真詮's 格局 approach and 淵海子平's presence-based disqualifiers are different
schools that may classify the same chart differently. Anything that looks like
universal doctrine in this corpus may be one author's habit. **SRC-002/003/004
contributed zero cases.**

**② SINGLE EDITION, UNCOLLATED.** `guwendao.net` and `gushiwen.cn` serve the same
backend text, so the cross-fetch performed proves non-truncation but is **not** an
independent witness. 77 of 131 records (59%) carry a `SOURCE_AMBIGUITY` note.
Most concern punctuation or a corrupt character in a narrative passage, but some
are substantive — 丁火**不中**以泄之 probably destroyed a 不足以 token, and
非金之**在地**也 probably destroyed a 得地. **CF-002 cannot be closed without a
second edition.**

**③ 95 LOCATED CHARTS NOT EXTRACTED.** 226 worked charts were found; 131 were
taken. This was deliberate selection under "quality beats count" — priority to
explicit strength vocabulary, matched pairs, counterexamples, and every 從 case.
The remainder is recorded and recoverable, not lost. But the corpus is
**consequently biased toward charts that use strength language**, which is
precisely the population OBS-09 warns is a minority of the source.

**④ OUTCOME/STRENGTH ENTANGLEMENT.** The source validates a reading by life
outcome across luck cycles. Extracting a natal strength claim separates it from
the reasoning that justified it. Necessary, but a real limit on what this
evidence can certify.

**⑤ SEX UNRECORDED THROUGHOUT.** 乾造/坤造 appear nowhere in any surveyed
chapter. All 131 are `NOT_STATED` and none was inferred — including
`DTS-GUANSHA-13`, which is 任鐵樵's own autobiographical chart, and three charts
identified only by office title.

**⑥ NORMALIZATION IS SINGLE-REVIEWER.** All 131 carry
`NORMALIZATION_PROVENANCE = MAIN_SESSION_REVIEWED`. Zero are
`FOUNDER_REVIEWED`. No record has independent human confirmation of the
normalized label. `DOUBLE_REVIEWED` count: **0**.

## 6. What S1 found

Four findings that constrain S2. Detail in `DOCTRINE_OBSERVATIONS.md` and
`COUNTEREXAMPLE_REGISTER.md`.

1. **Capacity is task-relative without exception.** 足以 appears 18 times across
   17 records and is never a global Day-Master property — it always names a load
   and a structural ground, is twice predicated of an *adversary*, once scoped to
   a *luck period*, and once coexists with 虛脫極矣. Global `CAN_BEAR` /
   `CANNOT_BEAR` predicates have **no support anywhere in the corpus**. (OBS-11)

2. **The classification depends on the question asked.** Two charts appear in two
   chapters each and are read incompatibly both times by the same author —
   in one case with no shared vocabulary at all. (OBS-12, CF-001, CF-009)

3. **The same label licenses opposite remedies.** Two weak charts, opposite
   correct treatments (幫之則有功 vs 幫之反害), stated as doctrine in 形象's 任氏曰
   and demonstrated on charts. A strength band does not determine treatment.
   (OBS-13)

4. **Following is not weakness.** 非身弱論也, 非身衰論也. Six charts name a root,
   餘氣, 祿 or 比劫 and still conclude a following pattern. (CF-008, CE-006–008)

Seed-rule status after S1: **R1, R2, R3, R4, R6, R8, R9, R10, R11 refuted;
R5, R7, R12 contested; 0 supported.**

## 7. Conflicts left open

**7 open, 1 partially closed, 1 closed** — see `CONFLICT_REGISTER.md`.

`CF-009` is flagged **load-bearing**: it should be resolved before S2 selects
axes, because it bears on whether a single "strength axis" is the right object to
look for at all.

An open conflict blocks any V2 rule depending on it. That is the register's
purpose, and 7 open is the honest state — not a failure.

## 8. Scope compliance

| Constraint | Status |
|---|---|
| No runtime classifier built | **0** — `git status --porcelain -- src/` is EMPTY |
| Frozen fact foundation untouched | **0 changes** under `src/features/myungri` |
| Legacy `evaluateNatalStrength` used as gold labels | **NO** — registered as `NEG-002`, `MAY_BE_USED_AS_GOLD: false` |
| Legacy scores/thresholds reused or calibrated against | **NO** |
| Research data reachable from production | **NO** — grep for `myungri-strength-v2` under `src/` returns 0 matches |
| Canonical V2 rules declared | **0** |
| Synthetic cases counted as real | **0** — validator hard-fails on `IS_SYNTHETIC` in the corpus; the 7 adversarial charts live in a separate document |
| Subagents wrote repository files | **NO** — all six researchers were read-only; every canonical file in this directory was written by the main session after reviewing the cited source |

Suite at commit time: `tsc --noEmit` exit 0 · Jest **257 suites / 3840 tests
passed**.

## 9. Carry-forward into S2

Ordered by what most limits the work:

1. **Break the monoculture.** Retrieve 子平真詮 and 淵海子平 worked cases. Until a
   second lineage exists, no observation here can be distinguished from one
   author's habit.
2. **Obtain a second edition of 滴天髓闡微.** Required to close CF-002 and to
   resolve the substantive corruptions in §5②.
3. **Resolve CF-009 before selecting axes.** Decide whether V2 is looking for one
   strength axis or a set of question-specific classifications.
4. **Get founder review of normalized labels.** 0 of 131 are independently
   confirmed today.
5. **Extract the remaining 95 located charts** — cheap, URLs recorded, and it
   corrects the §5③ selection bias.

## 10. Gate decision

```
S1_COLLECTION            = COMPLETE (131 real cases, 0 fabricated)
S1_VERIFICATION          = PASS (21.4% spot-checked, 0 discrepancies)
S1_DOCTRINE_CONCLUSIONS  = NONE DECLARED (correct — S1 collects, S2 decides)
SOURCE_MONOCULTURE_RISK  = HIGH (1 contributing source)
READY_FOR_S2             = NO — resolve CF-009 and add a second lineage first
```

S1 is complete as scoped. S2 should not open until carry-forward items 1 and 3
are addressed, because both change what S2 would be looking for.
