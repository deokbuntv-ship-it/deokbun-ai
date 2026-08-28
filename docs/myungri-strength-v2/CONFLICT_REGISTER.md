# MYUNGRI_STRENGTH_V2 — CONFLICT REGISTER (S1)

Status: **S1 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**
Scope: contradictions found in the source material during S1 discovery.

This register exists because V1 failed by *resolving* conflicts it had no
authority to resolve. S1 records conflicts and leaves them **open**. A conflict
entry is closed only by a later gate with explicit named-source authority or an
owner ruling — never by a plausibility argument made here.

Rules for this file:

1. A conflict is recorded with both sides quoted verbatim, each with its own
   source location.
2. `RESOLUTION` is `OPEN` unless a source itself resolves it.
3. `OPEN` is a *result*, not a failure. It is the honest state.
4. No conflict here may be used to justify a runtime rule.
5. Where a conflict touches a case, that case carries
   `GOLD_LABEL_STATUS = CONFLICT_CASE` and is excluded from any future gold set
   until the conflict closes.

---

## CF-001 — One chart, two readings, one commentator

**Chart:** 癸卯 乙卯 甲寅 乙亥 (`CH-癸卯乙卯甲寅乙亥`)
**Cases:** `DTS-SHUAIWANG-02` (衰旺第十八) and `DTS-CONGXIANG-06` (从象第四十七)

Reading A — 衰旺 chapter, presented as an illustration of extreme prosperity
without a following-pattern label.

Reading B — 从象 chapter, same eight characters:

> 甲木生于仲春，支逢两卯之旺、寅之禄，亥之生，干有乙之助，癸之印旺之极矣，从其旺神。

**The conflict:** the same commentator, in the same book, places the same chart
in two chapters serving two different doctrinal purposes. Whether 從其旺神 is a
*pattern name* (a 格) or a *treatment strategy* (how to handle an already-extreme
chart) is not settled by the text.

**Why this matters:** V1 assumed 從旺 was a pattern with entry conditions. This
chart shows the source may be using it as a handling instruction instead. Those
are different objects and a classifier that conflates them will mislabel.

**RESOLUTION: OPEN.** Both records retained; the 从象 record is marked
`RECORD_ROLE = COMMENTARY_VARIANT` so the chart is counted once, and both carry
`CONFLICT_CASE`.

---

## CF-002 — The 衰旺 chapter contradicts itself on 土旺極

In the 任氏曰 discussion the printed text gives:

> 土旺极者而似水

In Example 10 of the same chapter the printed text gives:

> 土旺极者，似金也

**The conflict:** the general rule and its own worked example disagree on what
extreme Earth resembles.

**Assessment:** this is most likely OCR/typesetting corruption in the retrieved
edition rather than a genuine doctrinal split — the surrounding pattern
(旺極者似其洩神, the element it produces) supports 似金. **But S1 does not correct
source text.** Both readings are transcribed as printed and the case carries a
`SOURCE_AMBIGUITY` note.

**RESOLUTION: OPEN — requires a second edition.** Closing this needs a print or
independently-typeset edition of 滴天髓闡微, not a plausibility argument. Recorded
in `SOURCE_REGISTER.md` as a known reliability limit of SRC-001's transcription.

---

## CF-003 — 專旺 is not the source's word

V1 doctrine treated 專旺 as a named classical pattern with entry conditions.

**Finding:** across 形象, 方局 and 八格 — the three chapters where a mono-element
pattern would be defined — the term 專旺 **does not appear**. The source uses
獨象 and 從強.

**The conflict:** between V1's inherited vocabulary (and the broader modern
Korean/Chinese systematization that uses 專旺) and the primary text, which does
not use it.

**Consequence for V2:** 專旺 may not be treated as an `ORIGINAL_TEXT` or
`NAMED_COMMENTARY` term for SRC-001. If it is used at all it is
`MODERN_SYSTEMATIZATION` and must be labelled as such. Cases are recorded under
the term the source actually prints.

**RESOLUTION: PARTIALLY CLOSED** — closed as to SRC-001 (the term is absent).
Open as to whether another A-tier source uses it; SRC-003 and SRC-004 are
unretrieved.

---

## CF-004 — 從兒 and body-strength

The verse cited by 任鐵樵 in 順局:

> 从儿不论身强弱

Applied by him to 甲午 丁丑 甲午 丙寅 (`DTS-SHUNJU-05`), a chart whose Day Master he
describes in the same breath as:

> 木虽进气，又逢禄比帮身 … 非身弱论也

**The conflict:** against the widespread modern requirement that a following
pattern needs an unrooted / unsupported Day Master. Here the Day Master has both
祿 and 比肩, the commentator names them, and the pattern still holds — and he
explicitly refuses the weak-body reading.

The same chapter supplies the contrast case `DTS-SHUNJU-09` (壬子 辛亥 辛卯 辛卯),
where peers are present in *quantity* (三透辛金) but rooting is expressly denied
(地支臨絕). The source therefore distinguishes stem-presence from branch-rooting —
but does **not** state a rule for when rooting defeats the pattern.

**RESOLUTION: OPEN.** The source refutes the strong form of the modern rule
without supplying a replacement. This is exactly the shape of gap that V1 filled
by invention. V2 must not.

Related: `DTS-JIACONG-03` — 格取从官，非身衰论也 — the same refusal for 從官.

---

## CF-005 — 眾/寡 and 強/弱 are independent, against the tally model

眾寡 Example 3 uses **強寡** — "strong though few". The chapter states:

> 官星虽寡，得财星扶则强

**The conflict:** with any model in which numerousness *is* strength. If a thing
can be few and strong, then counting occurrences cannot by itself yield a
strength judgment.

**RESOLUTION: CLOSED IN FAVOUR OF INDEPENDENCE.** This is one of the few
conflicts S1 can close, because the source states both sides explicitly in one
sentence. Recorded as `OBS-02`.

**Consequence:** the equal-weight tally model (`R10`) is refuted by primary text,
not merely by preference. Raw occurrence inventories remain admissible as
transparent evidence; a tally may not be a verdict.

---

## CF-006 — 絕無一毫 changes scope by context

In the 從強 definition the phrase governs 財官殺. In `DTS-CONGXIANG-04` the same
phrase governs support:

> 绝无一毫生扶之意

**The conflict:** a phrase that reads as a fixed quantifier in a definition is
used with a different complement in the worked cases. A parser that binds
絕無一毫 to a single fixed target will mis-read one of the two.

**RESOLUTION: OPEN.** Recorded in `QUANTIFIER_REGISTER.md`; the quantifier stays
`IMPLEMENTATION_READY = NO`.

---

## CF-007 — A root's identity is not fixed by the branch

`DTS-JIAHUA-05` (甲辰 丁卯 壬辰 辛亥). 亥 is the 祿 of 壬. The commentator writes:

> 亥水非壬之禄旺，乃甲之长生

**The conflict:** with the assumption that a branch's rooting relation to the Day
Master is a property of the pair (stem, branch) alone. Here the same branch is
re-assigned to another stem because of what else is in the chart.

**Consequence:** the frozen fact layer reports rooting relations correctly and
must not change. But *interpretation* of those facts is context-dependent in a
way no per-pair table captures. Any V2 reasoner that treats a rooting fact as a
context-free strength input will reproduce this error.

**RESOLUTION: OPEN.** This is a genuine doctrinal finding, not a defect.

---

## CF-008 — Root present, pattern still follows

Charts where the source names a root, a 餘氣, a 祿, or a 比劫 for the Day Master
and *still* concludes a following pattern:

| Case | Chart | What the source names | Verdict |
|---|---|---|---|
| `DTS-CONGXIANG-01` | 戊戌 丙辰 乙未 丙戌 | 蟠根在未，余气在辰 | 其势必从 |
| `DTS-CONGXIANG-08` | 癸酉 癸亥 庚申 丁亥 | 金逢禄旺 | 从金水而论 |
| `DTS-JIACONG-03` | 乙卯 己卯 戊辰 癸亥 | 坐下辰土 | 格取从官，非身衰论也 |
| `DTS-SHUNJU-03` | 己未 丁丑 丙戌 戊戌 | 丁火盖头，通根未戌 | 格成火土从儿 |
| `DTS-SHUNJU-05` | 甲午 丁丑 甲午 丙寅 | 逢禄比帮身 | 从儿不论身强弱 |
| `DTS-JIAHUA-03` | 甲寅 丁丑 甲戌 己巳 | 年之禄比 | 虽是假化 |

Six charts, four chapters, one commentator.

**The conflict:** with `R11` (no root ⟹ following pattern; root ⟹ no following
pattern). The contrapositive form is refuted by worked cases, not by argument.

**RESOLUTION: R11 REFUTED AS STATED.** What replaces it is **OPEN** — the source
gives no threshold, and S1 will not manufacture one. Note `DTS-CONGXIANG-05`
shows the reverse direction has force: when luck *restores* a root
(木得蟠根), an established pattern breaks (不禄). Restoration and initial presence
are treated differently, and the difference is unexplained in the text.

---

## CF-009 — The classification depends on the question, not only on the chart

**Chart:** 庚申 乙酉 庚戌 庚辰 (`CH-庚申乙酉庚戌庚辰`)
**Cases:** `DTS-SHUAIWANG-14` (衰旺第十八) and `DTS-XINGXIANG-13` (形象第十一)

Reading A — 衰旺, answering *"how extreme is this?"*:

> 此造支类西方，又逢厚土，金旺极者，似水也。

No pattern is named. The chart is placed on an extremity scale.

Reading B — 形象, answering *"what form is this?"*:

> 此造天干乙庚化合，地支申酉戌全，格成从革

A named special pattern (獨象/從革). No extremity language.

**Why this is worse than CF-001.** In CF-001 the two readings at least shared a
vocabulary. Here they do not overlap at all: one chart yields either an
extremity classification *or* a pattern name depending on which chapter it
appears in — and 任鐵樵 never reconciles them. The narratives also diverge (獲厚利…
名利皆遂 vs 不能善終…陣亡), though both name 寅運 as the turning point.

**The finding.** A chart does not have *one* classification. It has an answer to
whichever question is being asked of it. Two instances (CF-001, CF-009) of the
same phenomenon in one book by one author is a pattern, not an accident.

**Consequence for V2.** This is the deepest structural objection to the V1
design that S1 has produced. V1 asked "what is this chart's strength?" as though
that were a well-formed question with one answer. The source's own practice
suggests it is not: 強弱, 眾寡, 旺極, 剛柔, 實虛, 健, 權在一人, 從其強勢 are
*different questions* with *different answers*, and the commentator selects among
them by what he is trying to decide. A classifier emitting one band per chart is
answering a question the source does not ask.

**RESOLUTION: OPEN — and this one is load-bearing.** It should be resolved before
S2 selects axes, because it determines whether "the strength axis" is even the
right object to look for.

**Corpus handling:** the 形象 record is `COMMENTARY_VARIANT` so the chart counts
once; both records carry `CONFLICT_CASE`.

---

## Open-conflict summary

| ID | Subject | Resolution |
|---|---|---|
| CF-001 | one chart, two chapter readings | OPEN |
| CF-002 | 土旺極 internal contradiction | OPEN — needs 2nd edition |
| CF-003 | 專旺 absent from primary text | PARTIALLY CLOSED |
| CF-004 | 從兒 vs body-strength | OPEN |
| CF-005 | 眾寡 vs 強弱 | CLOSED — independent axes |
| CF-006 | 絕無一毫 scope | OPEN |
| CF-007 | root identity is contextual | OPEN |
| CF-008 | root present, still follows | R11 REFUTED; replacement OPEN |
| CF-009 | classification depends on the question asked | **OPEN — load-bearing for S2** |

**7 open, 1 partially closed, 1 closed.**

An open conflict blocks any V2 rule that would depend on it. That is the point
of the register.
