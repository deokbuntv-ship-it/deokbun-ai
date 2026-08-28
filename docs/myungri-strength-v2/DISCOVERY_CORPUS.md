# MYUNGRI_STRENGTH_V2 — DISCOVERY CORPUS (S1)

Status: **S1 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**
Machine-readable form: [`discovery-cases.json`](../../data/myungri-strength-v2/discovery-cases.json) · flat index: [`CASE_INDEX.md`](CASE_INDEX.md)

**131 records · 129 unique charts · 19 chapters · 1 source · 0 fabricated.**

---

## 1. What this corpus is

Real worked natal cases from 滴天髓闡微, each carrying the four pillars, the luck
cycle, and 任鐵樵's complete analysis **verbatim as printed**, paired with a
separate, conservative normalization field of our own.

What it is not: a training set, a labelled benchmark, a scoring corpus, or
evidence that any rule is correct. S1 collects; it does not conclude.

## 2. Where it came from

One source carried the entire corpus:

| | |
|---|---|
| **SRC-001** | 滴天髓闡微 — verse attributed 京圖 (Song), 原注 traditionally 劉基 (contested), commentary 任鐵樵 c. 1848 |
| Tier | verse **A**, commentary **B** |
| Access | `www.guwendao.net` / `m.guwendao.net`, per-chapter `bookv_*.aspx` |
| Copyright | public domain |

SRC-002 (子平真詮), SRC-003 (淵海子平) and SRC-004 (三命通會) are registered but
contributed **zero cases**. That is the corpus's largest structural weakness and
is stated plainly in the gate report rather than buried.

**Two corrections to the record established during retrieval:**

- The chapter numbering used throughout V1 was wrong for this edition. Verified
  against the served index: 形象第十一, 方局第十二, 八格第十三, 官杀第二十二,
  伤官第二十三, 刚柔第二十八, 顺逆第二十九 (上篇); 反局第五十二 (下篇). The
  第四十四/第四十五 slots are 奮鬱 and 恩怨, not 形象/方局.
- `guwendao.net` and `gushiwen.cn` serve the **same backend text**. A cross-fetch
  proves a page was not truncated; it is **not** an independent edition witness.
  Every OCR corruption below therefore remains uncorroborated.

## 3. Coverage

19 chapters, weighted toward those where strength and capacity language actually
lives:

| Chapter | Records | Why it was targeted |
|---|---|---|
| 衰旺第十八 | 20 | the 旺/衰 axis itself |
| 官杀第二十二 | 16 | the only chapter with 足以敵官 / 足以制殺 |
| 从象第四十七 | 10 | following patterns |
| 形象第十一 | 10 | 獨象, and the 損/補 remedy split |
| 顺局第五十一 | 9 | 從兒, including the rooted cases |
| 八格第十三 | 9 | ordinary structures as a control group |
| 反局第五十二 | 9 | inverted relationships |
| 伤官第二十三 | 8 | 未足幫身, 日元強 |
| 方局第十二 | 6 | 從強, 強眾而敵寡 |
| 假从第四十九 | 5 | 真/假 boundary |
| 化象第四十八 | 5 | transformation |
| 假化第五十 | 5 | failed transformation |
| 刚柔第二十八 | 4 | 剛/柔 as a rival axis |
| 精神第十五 | 3 | 精/神 as a rival axis |
| 众寡第三十三 | 3 | 眾/寡 as a rival axis |
| 顺逆第二十九 | 3 | 權在一人, 二人同心 |
| 体用第十四 | 2 | 旺極/弱極 handling inversion |
| 月令第十六 | 2 | month command |
| 中和第十九 | 2 | 中和 |

226 worked charts were located across these chapters; 131 were extracted.
The shortfall is **deliberate selection**, not retrieval failure — see §7.

## 4. The separation rule, in practice

Every record keeps the source's words and our reading in different fields:

```
ORIGINAL_JUDGMENT_TEXT          此造以俗论之，丙火生于巳月，建禄必要用财，无如庚辛
                                重叠根深，独印受伤，弱可知矣… 此财多身弱，所谓帮之
                                则有功也。
ORIGINAL_STRENGTH_TERMS         建禄 / 重叠根深 / 弱可知矣 / 财多身弱 / 帮之则有功
V2_NORMALIZED_STRUCTURAL_LABEL  SOURCE_WEAK
V2_UNCERTAINTY                  Day Master holds 建祿 in its own month and is still
                                弱; 根深 belongs to the OPPOSITION, not the DM
NORMALIZATION_PROVENANCE        MAIN_SESSION_REVIEWED
```

The normalization vocabulary is deliberately impoverished — nine values, none of
them a seven-band label, and `SOURCE_NOT_EXPLICIT` available whenever the source
declines to say. It is used **36 times out of 131**. A corpus in which every
chart got a strength label would be a corpus of our opinions.

## 5. Verification

28 of 131 records (**21.4%**) were re-fetched independently and compared without
reference to the extraction notes:

- **14 byte-exact** comparisons of `ORIGINAL_JUDGMENT_TEXT` — all identical,
  including preserved corruption (读书过目成育, 荫疪, 财炡有余, 生肓, 待郎)
- **14 phrase-level** confirmations of load-bearing citations — all present
- **0 discrepancies**
- **1 fidelity gap** found and fixed: `DTS-CONGXIANG-01` had been truncated
  before its final clause 志有为也. Completeness, not accuracy; no doctrinal
  phrase affected.

The full log is reproduced in [`S1_GATE_REPORT.md`](S1_GATE_REPORT.md) §4.

## 6. Source reliability

This edition is faithful in substance and corrupt in detail. Observed and
preserved rather than corrected:

- **已/己/巳 confusion** — the class that silently changes a stem or branch:
  戊**已**逢丁, 丙火生于**已**月, 干丙丁而支**己**午, 微根**巳**气, 合**已**化土,
  一交**已**未, **已**土生于孟夏, 巳酉 vs 己酉
- **仕/仁 confusion** — 仁路蹭蹬, 仁版连登, 仁至黄堂
- **Broken luck cycles** — 形象 Ex.12 prints 乙亥 where 己亥 is required;
  傷官 Ex.5 prints 乙亥 for 己亥; 反局 Ex.15 prints 乙卯 for 己卯
- **Dropped characters** — 谓财来就 [gap]，; 壬子辛[?]水旺之地; 究竟[西]方金地
- **Substantive corruption** — 土重金**坦** for 土重金埋; 丁火**不中**以泄之,
  which probably destroyed a 不足以 token; 非金之**在地**也, probably 得地
- **Mixed scripts** — 陰/陽/殺 in traditional form inside otherwise simplified
  text, indicating a merge of at least two source files

Every one of these is recorded in the affected record's `SOURCE_AMBIGUITY` field.
**77 of 131 records (59%) carry at least one such note.** That is a high rate and
it should be read as a property of the *edition*, not of the extraction: most
notes concern punctuation, stray whitespace, or a corrupt character in a passage
whose reasoning is unaffected. Records whose *reasoning* is affected are graded
down — 2 are Grade C, 25 are Grade B.

The honest summary: this corpus is reliable at the level of **which chart, which
verdict, which doctrinal phrase**, and unreliable at the level of individual
characters in narrative passages. A single-edition corpus cannot be better than
that. Resolving it requires a second, independently typeset edition — which is
S1's top-priority carry-forward.

## 7. What was left out, and why

95 of the 226 located charts were not extracted. This was a selection under §5's
*"quality beats count"*, applied in this priority order:

1. every chart with explicit strength or capacity vocabulary
2. every matched pair (the source's own controlled comparisons)
3. every counterexample to a seed rule
4. every 從 / 假從 / 從兒 / 化 case
5. remainder, as budget allowed

The unextracted charts are **not lost**. Their chapter URLs are recorded in
`sources.json` and they can be added in S2 without re-doing discovery. The
largest untouched blocks are 官杀 (13 remaining) and 伤官 (20 remaining), both
of which are ordinary-structure charts whose vocabulary is already represented.

## 8. What the corpus turned out to contain

Stated as observations with case ids, not as rules. Full detail in
[`DOCTRINE_OBSERVATIONS.md`](DOCTRINE_OBSERVATIONS.md) and
[`COUNTEREXAMPLE_REGISTER.md`](COUNTEREXAMPLE_REGISTER.md).

**The source is adversarial toward formulaic strength reading.** It is not
neutral material that V1 misread. 任鐵樵 repeatedly constructs a chart a
mechanical rule gets wrong and then says so: 似乎…然 · 俗論…不知 · 以俗論之…不知 ·
故特書兩造為後證 · 非身弱論也 · 非身衰論也 · 可知墓庫逢沖必發者，謬也. **17 of 131
records** carry an explicit rejection of a conventional reading, and **16** are
tagged as members of a matched pair the author built to make such a point.

**Capacity is task-relative in every single occurrence.** 足以 appears 18 times
across 17 records and is *never* a global property of the Day Master. It always
takes a named load (足以敵官, 足以制殺, 足以用財, 足以止水托根, 足以砥定汪洋,
足以任其財官) and rests on a named structure. Twice it is predicated of an
adversary (財星足以破印). Once it is scoped to a luck period, not the natal chart.

**眾/寡 and 強/弱 are independent axes.** 眾寡 Ex.3 uses 強寡; 方局 Ex.9 uses
強眾. Both modifiers attach to one party simultaneously. Numerousness cannot be
strength.

**Following is not weakness.** 非身弱論也 (`DTS-SHUNJU-05`), 非身衰論也
(`DTS-JIACONG-03`). Six charts show a named root, 餘氣, 祿 or 比劫 and still
conclude a following pattern.

**One chart can carry two incompatible classifications.** Two instances
(`CF-001`, `CF-009`) where the same eight characters are read differently in
different chapters by the same commentator, depending on the question the
chapter is asking.

## 9. Status

S1's collection objective is met: **131 real, source-provenanced, independently
spot-checked cases**, against a target of ≥100 and a preferred band of 120–150.

No rule was adopted. No axis was selected. No classifier exists.
That is the correct state at the end of S1.
