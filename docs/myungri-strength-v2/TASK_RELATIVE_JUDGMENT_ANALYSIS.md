# TASK-RELATIVE JUDGMENT ANALYSIS — S1.5

Status: **S1.5 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**
Scope: CF-009 formal resolution, and the general question of whether Myungri
"strength" is one object or several.

---

## Part 1 — CF-009: formal resolution

### 1.1 The case

One chart, 庚申 乙酉 庚戌 庚辰, analysed by 任鐵樵 in two chapters of one book.

**Reading A — 衰旺第十八** (`DTS-SHUAIWANG-14`)

> 此造支类西方，又逢厚土，金旺极者，似水也。初运火，祖业无恒；至戊子运获厚利，
> 纳房出仁已丑庚运，名利皆遂；一交寅运，犯事落职，大破财利；至卯不禄。

**Reading B — 形象第十一** (`DTS-XINGXIANG-13`)

> 此造天干乙庚化合，地支申酉戌全，格成从革，惜无水，肃杀之气太锐，不但书香不利，
> 而且不能善终。行伍出身，官至参将，一交寅运，阵亡。盖局无食伤之故耳；
> 又寅戌暗拱，触其旺神也。

### 1.2 What question is each chapter asking?

This is the step that resolves the case, and it was missing from the S1 record.

**衰旺第十八** — 原文:

> 能知衰旺之真机，其于三命之奥，思过半矣。

原注:

> 旺则宜泄宜伤，衰则喜帮喜助，子平之理也。然旺中有衰者存，不可损也；
> 衰中有旺者存，不可益也。

The chapter's question is **"how extreme is this, and therefore do we 損 or 益?"**
It is a **treatment-selection** chapter. Its whole apparatus — 太旺/旺極/太衰/衰極
plus the 「似X」 reversal idiom — exists to route a chart to a remedy.

**形象第十一, verse 3** — 原文:

> 独象喜行化地，而化神要昌。

任氏曰:

> 权在一人，曲直炎上之类是也。化者，食伤也，局中化神昌旺，岁运行化神之地，
> 名利皆遂也。

The chapter's question is **"what form is this, and what luck does the form
want?"** It is a **form-identification + luck-direction** chapter.

Two different questions. Neither chapter is asking "what is this chart's
strength band?"

### 1.3 Formal propositions

> **CF009_PROPOSITION_A** (衰旺): This chart's Metal is prosperous to the extreme;
> an extreme is not to be opposed but drained, and the drain of extreme Metal is
> Water. *(An extremity claim with a treatment vector.)*

> **CF009_PROPOSITION_B** (形象): This chart is a 獨象 of the 從革 type; a 獨象
> requires its 化神 to flourish, and the 化神 of Metal is Water. *(A form-membership
> claim with a luck-direction requirement.)*

These are **different predicates about different properties**. A is about
*degree*; B is about *form*. Nothing in either denies the other.

### 1.4 Do they agree on substance?

They agree on all three operative points:

| | Reading A (衰旺) | Reading B (形象) | Agree? |
|---|---|---|---|
| Dominant force | 支類西方 + 厚土 → Metal, extreme | 支全申酉戌 + 乙庚化合 → Metal, 從革 | **YES** |
| Element needed | Water (旺極者**似水**) | Water (惜**無水**; 局無**食傷**之故耳) | **YES** |
| Danger | 一交**寅**運，犯事落職；至**卯**不祿 | 一交**寅**運，陣亡；**觸其旺神**也 | **YES** |

Both name Water as what the chart wants. Both name 寅 as the catastrophe. Reading
A's favourable period is 戊**子**運 — Water. Reading B's stated cause of ruin is
局無食傷 — the absence of Water.

**The two readings prescribe the same thing in different vocabularies.**

### 1.5 The one genuine discrepancy

The **biographical narratives differ**. Reading A: 納房, 名利皆遂, 犯事落職, 至卯
不祿. Reading B: 行伍出身, 官至參將, 陣亡.

These are not reconcilable as one life. Either the same eight characters were
recorded for two different people, or one narrative is a transmission error.
**This is a separate defect from CF-009 and is not resolved here.** It is logged
below as **CF-010** and does not affect the structural conclusion, since the
structural analysis agrees in both readings regardless of whose life it describes.

### 1.6 Classification

```
CF009_CLASSIFICATION = TASK_RELATIVE_COMPATIBLE
                       (with a HIERARCHICAL_COMPATIBLE component)
CF009_TRUE_CONTRADICTION = NO
```

Task-relative because the differing descriptions answer different questions.
Hierarchical in part because 從革 (form) is the more specific claim and 旺極
(degree) the more general one; the specific does not contradict the general.

**This revises the S1 gate report**, which recorded CF-009 as open and flagged it
as possibly showing that a chart "has no single classification". The sharper and
better-supported statement is:

> A chart has no single **classification vocabulary**. It does appear to have a
> stable underlying **structural situation** that multiple vocabularies describe
> compatibly.

That is a materially different — and less alarming — finding than the S1 wording,
and it is the correct one on the evidence.

### 1.7 Implication for V2

`CF009_V2_IMPLICATION`:

1. **A single output band is the wrong output shape**, but not because the
   underlying facts are unstable. It is wrong because a band discards the
   question. Both readings here are correct *and* neither is "極旺" as a bare
   label — each carries its treatment vector with it.
2. **The judgment object should be `(question, chart) → conclusion + vector`**,
   not `chart → band`.
3. **A V2 engine may legitimately produce more than one description of one
   chart**, provided each is bound to the question it answers. Emitting both
   「金旺極，宜洩以水」 and 「從革獨象，喜化神水」 is not a contradiction to be
   resolved — it is two correct answers to two questions.
4. It does **not** follow that facts are relative. The facts (支全申酉戌,
   乙庚化合, 無水) are identical in both readings. Only the framing differs. The
   frozen fact foundation is unaffected.

---

## Part 2 — Is capacity global or load-specific?

### 2.1 The strongest available general statement

衰旺第十八's 任氏曰 contains the most general capacity claim in the corpus:

> 是故日干不论月令休囚，只要四柱有根，便能**受财官食神**而**当伤官七杀**。
> 长生禄旺，根之重者也；墓库余气，根之轻者也。

Verified verbatim from two hosts.

This is the passage V1 compressed into `ROOT → CAN_BEAR`. Read as printed, it
does not say that. It says:

- **two distinct verbs** — 受 (receive) and 當 (withstand)
- applied to **two distinct load classes** — 財官食神 and 傷官七殺
- with roots explicitly **graded by quality** — 長生祿旺 heavy, 墓庫餘氣 light

So even the corpus's most general capacity statement **enumerates its loads and
grades its ground**. It is not a global scalar claim; it is a conjunction of
load-specific claims sharing a common precondition.

### 2.2 Every other occurrence

S1 established that 足以 appears 18 times across 17 records and never as a global
Day-Master property. The loads observed:

| Load | Phrase | Case |
|---|---|---|
| 官 | 足以敵官 | `DTS-GUANSHA-21`, `DTS-GUANSHA-24` |
| 殺 | 足以制殺 | `DTS-GUANSHA-11` |
| 殺 (via agent) | 足以用辛金制殺 | `DTS-FANJU-08` |
| 殺 (via root) | 足以盤根制殺 | `DTS-GANGROU-03` |
| 財 | 足以用財 | `DTS-SHANGGUAN-06`, `DTS-GUANSHA-19` |
| 官 | 足以用官 | `DTS-SHANGGUAN-19` |
| 財官 (both) | 足以任其財官 | `DTS-FANJU-13` |
| 水 (flood) | 足以止水托根 / 足以砥定汪洋 / 足以砥定中流 | `DTS-FANJU-01`, `DTS-GUANSHA-10`, `DTS-SHANGGUAN-03` |
| 火 (heat) | 足以晦火養金 | `DTS-GUANSHA-12` |
| 日主 (repair) | 足以補日主之虛 | `DTS-FANJU-02` |
| 印 (destroy) | 財星足以破印 | `DTS-FANJU-17` |
| negated | 未足幫身 / 本不足疏土 / 不足畏也 | `DTS-SHANGGUAN-13`, `DTS-GUANSHA-25`, `DTS-GUANSHA-21` |

`CAPACITY_LOADS_OBSERVED` = 財 · 官 · 殺 · 財官(joint) · 印(as target of destruction)
· 水勢 · 火炎 · 日主之虛 · 身(幫)

Three structural facts about this set:

- **It is not always the Day Master's capacity.** 足以制殺 in `DTS-GUANSHA-11` is
  predicated of 壬水; 財星足以破印 of the 財. The construction measures
  *adequacy-to-task for any party*.
- **It can be time-scoped.** `DTS-FANJU-13`: 甲子癸亥，印旺逢生，日元足以任其財官 —
  the capacity holds *in those luck periods*, not natally.
- **It survives extreme weakness.** `DTS-FANJU-08`: 日元虛脫極矣 … 足以用辛金制殺,
  in one sentence.

### 2.3 Verdict on this sub-question

```
GLOBAL_CAPACITY_SUPPORTED       = NO
LOAD_SPECIFIC_CAPACITY_SUPPORTED = YES (single-lineage; cross-lineage test pending)
```

Formal shape supported by evidence: `CAPACITY(party, load, ground, time_scope)`.
Not `CAPACITY(chart)`.

**This is a single-lineage finding.** It must survive contact with 子平真詮 and
the other families before it can carry an S2 axis.

---

## Part 3 — Label does not determine treatment

Independent of CF-009, the corpus contains an explicit doctrinal statement that
the same coarse label licenses opposite remedies. 形象第十一, verse 5 任氏曰:

> 形全宜损，形缺宜补之说，即子平"旺则宜泄宜伤，衰则喜帮喜助"之谓也 … 庸俗只知
> 旺用泄伤，衰用帮助，以致吉凶颠倒 … 均是旺也，或泄之有害，而伤之有利；或泄之
> 有利，而伤之有害 … 均是衰也，帮之则凶，而助之则吉；或帮之则吉，而助之则凶。

均是旺也 / 均是衰也 — "both alike are prosperous" / "both alike are in decline" —
and the correct treatment still diverges. Demonstrated on charts:

| Pair | Both labelled | Treatment A | Treatment B |
|---|---|---|---|
| `DTS-XINGXIANG-19` / `-20` | weak | 幫之則有功 | 助之則吉，**幫之反害** |
| `DTS-XINGXIANG-17` / `-18` | prosperous | 傷之有功 | 洩之有益，**傷之有害** |
| `DTS-GANGROU-01` / `-02` | 旺之極矣 | 用壬水洩 | 用丙火制 |

The distinction the source draws is **幫 (比劫) vs 助 (印)** and **洩 (食傷) vs
傷 (官殺)** — four operations, not two, and the label selects none of them.

**Consequence:** a V2 strength verdict, even if perfectly sourced, could not by
itself drive advice. Treatment selection needs the structural configuration, not
the band. This is an argument against the V1 *product* design that is independent
of whether V1's doctrine was sourced.

---

## Part 4 — CF-010 (new, opened here)

**Subject:** biographical narratives for chart 庚申 乙酉 庚戌 庚辰 are irreconcilable
between 衰旺第十八 and 形象第十一 (納房/名利皆遂/犯事落職 vs 行伍出身/官至參將/陣亡).

**Assessment:** either two people share the eight characters, or one narrative is
a transmission error. **Not determinable from a single edition.**

**RESOLUTION: OPEN.** Blocked on the same second-edition requirement as CF-002.

**Does not affect CF-009** — the structural readings agree regardless of whose
life is described.

---

## Part 5 — Status

| | |
|---|---|
| CF-009 | **RESOLVED — TASK_RELATIVE_COMPATIBLE** |
| CF-010 | **OPEN** (new; narrative discrepancy, needs 2nd edition) |
| Global capacity | **NOT SUPPORTED** (single lineage) |
| Load-specific capacity | **SUPPORTED** (single lineage; cross-lineage test pending) |
| Label ⇒ treatment | **REFUTED**, by doctrine and by three chart pairs |

Everything in Parts 2 and 3 rests on SRC-001 alone. The cross-lineage test is the
whole point of S1.5 and is recorded in `CROSS_SOURCE_CASE_MATRIX.md`.
