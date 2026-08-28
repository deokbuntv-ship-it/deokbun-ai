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

**RESOLUTION (S1.5): CLOSED — `TASK_RELATIVE_COMPATIBLE`.**

Full analysis: [`TASK_RELATIVE_JUDGMENT_ANALYSIS.md`](TASK_RELATIVE_JUDGMENT_ANALYSIS.md) Part 1.

The S1 entry above was written before either chapter's *framing question* was
retrieved. With that framing in hand the case resolves, and the resolution
partly reverses the S1 reading.

衰旺 asks 「能知衰旺之真機」 with 原注 「旺則宜洩宜傷，衰則喜幫喜助」 — a
**treatment-selection** question. 形象 verse 3 asks 「獨象喜行化地，而化神要昌」 —
a **form-identification and luck-direction** question. Different questions.

And the two readings **agree on every operative point**: dominant force (extreme
Metal), element needed (Water — 旺極者*似水* vs 惜*無水*, 局*無食傷*之故耳), and
danger (寅運 in both; 戊子運 favourable in A, absence of Water the stated cause of
ruin in B). They prescribe the same thing in different vocabularies.

**So the S1 claim that "a chart has no single classification" was too strong.**
The accurate statement is that a chart has no single classification *vocabulary*,
while the underlying structural situation is stable across vocabularies. That is
a materially less alarming finding, and it is the one the evidence supports.

**Corpus handling:** the 形象 record stays `COMMENTARY_VARIANT` so the chart counts
once. Both records remain tagged for cross-reference but are no longer conflict
cases on structural grounds.

**Carved out as CF-010:** the two chapters' *biographical narratives* remain
irreconcilable. That is a separate defect and stays open.

---

## CF-010 — Irreconcilable biographies for one chart (carved out of CF-009)

**Chart:** 庚申 乙酉 庚戌 庚辰
**Type:** `SCOPE_CONFLICT` (transmission/record integrity, not doctrine)

衰旺第十八 records: 納房, 名利皆遂, 犯事落職, 至卯不祿.
形象第十一 records: 行伍出身, 官至參將, 一交寅運陣亡.

These do not describe one life. Either the eight characters were recorded for two
different people, or one narrative is a transmission error.

**Why it is separated from CF-009:** the *structural* readings agree completely
(see CF-009). Only the biography diverges. Keeping them merged made a
record-integrity defect look like a doctrinal one.

**Why it matters anyway:** the source validates its structural readings *by
outcome*. If outcomes attached to a chart are unreliable, then outcome-based
corroboration is weaker than it appears — which bears on how much any single
case can certify.

**RESOLUTION: OPEN.** Blocked on a second independently typeset edition, the same
dependency as CF-002.

---

## CF-011 — Root and following: two lineages take opposite positions (S1.5)

**Type:** `ONTOLOGY_CONFLICT` + `VERDICT_CONFLICT`
**This is the first genuine cross-lineage conflict in the corpus.**

**淵海子平 (SRC-003), 卷二 外十八格 棄命從財格 眉批** — verified verbatim by direct
retrieval:

> 日主有根則不可棄，主貧。無根棄之則富。

And 棄命從殺格:

> 忌日主有根及比肩之地。

And 神趣八法·從象 (卷三):

> 或天干有甲乙字者不吉，**或有根者不吉**。

Three independent statements in one book. The rule is a **two-state switch**:
root present ⇒ following is void ⇒ poverty. Root absent ⇒ following ⇒ wealth. No
gradient, no weighing of the root's quality, position or function.

**滴天髓闡微 (SRC-001)** — six charts where a root, 餘氣, 祿 or 比劫 is *named* and
the following pattern *still holds* (`CF-008`), plus two explicit refusals of the
weak-body reading:

> 從兒不論身強弱，**非身弱論也** (`DTS-SHUNJU-05` — DM has 祿 and 比肩)
> 格取從官，**非身衰論也** (`DTS-JIACONG-03` — DM sits on its own element)

### What this does to R11

S1 recorded **R11 (any root breaks 從格) as REFUTED**, on six charts.

That verdict was **lineage-scoped and did not say so**. Corrected status:

| Lineage | R11 | Basis |
|---|---|---|
| 滴天髓 / 任鐵樵 | **REFUTED** | 6 worked charts + 2 explicit doctrinal refusals |
| 淵海子平 | **ASSERTED AS DOCTRINE** | 3 independent statements, binary form |

`R11_STATUS = SCHOOL_DEPENDENT`. It is neither universally true nor universally
false, and any V2 rule touching it must declare which lineage it follows.

**This is the correction S1.5 was created to catch.** With one source, a
lineage-specific doctrine is indistinguishable from a universal one.

### Is it a real disagreement or a terminology difference?

Real, on the evidence available — but with an unresolved component.

The two books are not describing the same object with different words. 淵海子平's
following patterns (棄命從財, 棄命從殺, 從象) are **admission-gated categories**
with binary entry tests. 滴天髓's are **whole-chart 氣勢 readings** where a root's
significance depends on whether it functions. Those are different machines, and
they genuinely disagree about the same charts.

What is **not** resolved: whether 任鐵樵 would accept 淵海子平's cases as 從格 at
all, or would reclassify them. Testing that needs a chart adjudicated by both,
and no such chart is yet in the corpus.

**RESOLUTION: OPEN — school-dependent, load-bearing for any special-pattern axis.**

---

## CF-012 — Sequencing: which question is asked first? (S1.5)

**Type:** `SEQUENCING_CONFLICT` — the category S1 predicted would appear once a
second lineage was examined.

**淵海子平, 神趣八法 總釋 眉批** — verified verbatim:

> 看八字**先明從化爲本**，化不成方論財官，財官無取方論格局

An explicit three-stage order: **從化 → 財官 → 格局**. Special structure is
screened *first*; ordinary analysis runs only if the screen fails.

Strength does not appear in that order at all. It enters as a **gate condition on
admission** (main body, same chapter):

> 類屬要身旺，而**從化要衰也**

**滴天髓闡微** places no comparable ordering statement. Its 衰旺 chapter reasons
about degree without a prior structural screen, and `DTS-BAGE-06` shows an
extreme composition being *refused* special-pattern status on structural grounds
discovered during ordinary analysis — the opposite order.

**Bearing on the §38 hypotheses:**

| Hypothesis | 淵海子平 | 滴天髓 |
|---|---|---|
| H1 facts → ordinary strength → special pattern | contradicted | partially supported |
| H2 facts → special screen → ordinary only if ordinary | **supported** | not stated |
| H4 facts → 格局 structure → strength as secondary | partially (格局 is *last* here) | not stated |

**RESOLUTION: OPEN.** Two lineages appear to sequence differently. This must be
settled before any V2 pipeline order is frozen, because H1 and H2 produce
different answers on exactly the borderline charts that matter.

---

## CF-013 — Climate prescribes what 扶抑 forbids (S1.5)

**Type:** `ONTOLOGY_CONFLICT` — two systems select the favourable element by
incompatible criteria and reach opposite answers on the same charts.

**窮通寶鑑, 五月庚金** (base text, verbatim):

> 五月庚金，丁火旺烈，**庚金敗地**，專用壬水，癸又次之。壬透癸藏，支見庚辛，必然科甲，
> **切忌戊己透干制水、則否。**

⚠️ **Partial verification.** I confirmed 五月庚金，丁火旺烈，庚金敗地，專用壬水
verbatim against Wikisource myself. The clause **切忌戊己透干制水 is agent-reported
only** — when I queried it directly the retrieval layer returned unrelated 五月甲木
text instead of an absence answer, so it is not independently confirmed. The
argument below leans on the *prescription* (壬水 to a Day Master in its 敗地), which
is verified; the *explicit ban* on the resource strengthens it but is not yet
load-bearing.

The text itself says the Day Master is in its 敗地. A 扶抑 reading prescribes 印
(戊己) and 比劫 (庚辛). The book instead prescribes 壬水 — the **食傷 that drains
an already-weak 庚** — and then **explicitly bans the resource**: 切忌戊己透干制水.
The stated reason is thermal: Earth would dam the Water that cools 丁火旺烈.

**窮通寶鑑, 十一月丙火** (base text, verbatim):

> 十一月丙火，**冬至一陽生，弱中復強**，壬水為最，戊土佐之。

丙火 in 子月 is the canonical weakest Fire. 扶抑 demands 木火. The book demands
**壬水 — the 七殺 that directly attacks 丙** — as first choice. And the stated
justification is **calendrical-astronomical**, not a chart tally: *at winter
solstice the single yang is born, so within weakness strength returns*.

**十月丙火** gives the book's own selection rule, and it is a counter-the-excess
rule in which the Day Master's strength plays no part:

> 總之十月丙火，**木旺宜庚，水旺宜戊，火旺用壬**，隨宜酌用可也。

### Is this a real conflict or two compatible layers?

**Real at the level of prescription; possibly complementary at the level of
practice.** The two systems disagree about *which element to favour on specific
charts* — that is not a terminology difference. But the base text also shows the
frame is not absolute: 五月庚金 readmits 戊己 as a fallback when the climatic agent
is absent (「無壬癸制火者，又宜戊己出干補金洩火」), and 「補金洩火」 is the one place a
quasi-strength rationale surfaces.

So the honest reading is: **窮通寶鑑 has a climatic primary criterion with a
strength-flavoured fallback**, not a pure system with no strength content
whatsoever. That is still incompatible with a design in which strength is primary
and climate is a modifier — which is exactly 徐樂吾's 於扶抑之外 framing (`OBS-18`).

**RESOLUTION: OPEN.** Two lineages select the favourable element by different
primary criteria and disagree on real charts.

**Direct consequence for V2:** `STRENGTH != CLIMATE != YONGSHIN`. These must
remain separate modules. A V2 Strength engine that emits a favourable element is
silently answering 窮通寶鑑's question with 滴天髓's method — and `CF-013` shows
those give different answers.

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
| CF-009 | classification depends on the question asked | **CLOSED — TASK_RELATIVE_COMPATIBLE** (S1.5) |
| CF-010 | irreconcilable biographies for one chart | OPEN — needs 2nd edition |
| CF-011 | root vs following — lineages take opposite positions | **OPEN — school-dependent** |
| CF-012 | sequencing: special screen first, or ordinary first? | **OPEN — blocks pipeline order** |
| CF-013 | climate prescribes what 扶抑 forbids | **OPEN — forces module separation** |

**10 open, 1 partially closed, 2 closed.**

Conflict types present: `ONTOLOGY` (CF-001, CF-007, CF-011, CF-013), `VERDICT`
(CF-004, CF-008, CF-011), `TERMINOLOGY` (CF-003, CF-005), `QUANTIFIER` (CF-006),
`SCOPE` (CF-002, CF-010), `SEQUENCING` (CF-012).

**CF-011 and CF-012 are the first cross-lineage conflicts.** Both were invisible
while the corpus had one source, and both change conclusions S1 had recorded as
settled. That is the S1.5 diversification working as intended.

An open conflict blocks any V2 rule that would depend on it. That is the point
of the register.
