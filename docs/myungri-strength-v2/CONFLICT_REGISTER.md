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

**RESOLUTION (S1.6): CLOSED — `COPY_ERROR` in the 任氏曰 list. Example 10
preserves the correct reading.**

A second transcription was obtained — zh.wikisource's 滴天髓阐微, independent of
guwendao. It reads **the same** as guwendao: 土旺極者而似水. So the two editions do
not disagree, and edition-variance is eliminated as the explanation.

The case is instead settled by **internal evidence**, and decisively.

**① The五-element pattern.** The 旺極 series maps each element to **what it
generates** (its 洩神):

| | printed | 所生 | fits? |
|---|---|---|---|
| 木旺極 | 似火 | 木生火 | ✅ |
| 火旺極 | 似土 | 火生土 | ✅ |
| **土旺極** | **似水** | 土生**金** | ❌ |
| 金旺極 | 似水 | 金生水 | ✅ |
| 水旺極 | 似木 | 水生木 | ✅ |

Four of five follow the rule. 土 is the sole exception — and it **duplicates**
金旺極's value, which is itself a corruption signature.

**② The treatment clause in the same sentence refutes 似水.** As printed:

> 土旺極者而似水也，**宜火以練之**

**火 refines metal** — 火煉金 is the standard idiom. You do not refine *water*
with fire. Compare the neighbouring line, which is internally coherent:

> 金旺極者而似水也，**宜土以止之**  ← earth dams water ✅

So the printed sentence pairs a 水 resemblance with a 金 treatment. Substituting
似金 makes it coherent: 土旺極者而似**金**也，宜火以練之.

**③ Example 10 preserves exactly that reading** — 土旺极者，似金也.

**Conclusion:** the 任氏曰 list carries a copying error that both surviving online
transcriptions inherit (they very likely share an ancestor, so their agreement is
not independent corroboration). The worked example transmits the correct text.

**What is still not proved:** whether the error is 任鐵樵's own slip or a later
copyist's. That would need a print or manuscript witness. The *reading* is
settled; its *origin* is not.

⚠️ **Method note:** the retrieval layer returned **two different treatment clauses
for this same line across two calls** (宜金以生之, then 宜火以練之). The 火練 reading
is corroborated by an independently-recorded S1 note from guwendao (喜火之練也) and
is the one used above. This is a further instance of the fabrication hazard
recorded in the S1.5 gate report.

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

## CF-011 — Root and following: a five-position dispute, now with worked-case evidence (S1.5 → S1.6)

**Type:** `ONTOLOGY_CONFLICT` + `VERDICT_CONFLICT`

**S1.6 update: this is no longer a two-lineage conflict. It is at least
five-way, and every position is independently quotable. Full detail and full
citations in `docs/myungri-strength-v2/CROSS_LINEAGE_BRIDGE_CASES.md`;
summarized here.**

### Position 1 — ROOT IS FATAL, binary (淵海子平)

Four independent statements, all raw-verified:
> 命逢根氣，命殞無猜。(棄命從殺論 — root-qi means **death**, not merely a broken 格)
> 丙火申提，無根從殺；有根南旺，**脫根壽促**。(棄命從殺論)
> 忌日主有根及比肩之地。(外十八格 棄命從殺格)
> 或天干有甲己字，**或有根者不吉**。(從象)

The rule is a **two-state switch**: root present ⇒ following void ⇒ poverty or
death. Root absent ⇒ following holds ⇒ wealth. No gradient, no weighing of a
root's quality, position, or function.

### Position 2 — ROOT IS FATAL, WITH A YIN/YANG ASYMMETRY (張楠, signed 楠曰)

The richest single statement in the corpus (神峰通考 卷一 偏官格附棄命從殺格):
> 棄命從殺格，緣日主全無一點生氣，四柱純然有官殺，則不得已而只得從殺也…**畏見
> 八字有根處**，及制殺運猶如從盜，又思歸父母兄弟之鄉，則盜必惡汝…**但六陰日干
> 有從之之理**，如婦人屬陰，亦有從人之道。**若六陽日干，見殺多，只或作殺重身輕
> 看**，若日主全無氣，亦作棄命看，亦畏見根死。

Three implementable sub-positions in one passage: (i) entry bar is **zero**
生氣, not merely weak; (ii) root is fatal, argued by a bandit metaphor (a root
is the thought of going home, which makes the bandit turn on you); (iii)
**only the six yin day stems** genuinely follow — yang stems with heavy 殺 are
read as 殺重身輕, not as following at all. The asymmetry is **格-specific**:
從財 is explicitly NOT yin-only (此則不論陰陽日主皆從也), 從化 is stricter still
(六陽日干，不能從化也), and 張楠 elsewhere states the root doctrine generally,
outside any 從 context (根在苗先).

### Position 3 — ROOT IS ONE CONJUNCT OF AN ADVERSE CONDITION, NOT AN ENTRY BAR (陳素庵)

**The direct answer neither pole usually states** (命理約言 卷一 看從局法):
> 凡看日主無根，滿柱皆官則當從官…滿柱皆印綬，則無從理，蓋皆生助日主，旺甚無依
> 決矣。**凡從何神，只要此神生旺則吉。若從神受剋，日主逢根則凶。**

Read literally: root is **not** an entry bar and **not** automatically fatal.
It is one conjunct — 從神受剋 **AND** 日主逢根 *together* produce 凶. The entry
test (日主無根) and the outcome test (逢根則凶) are two **separate** clauses.
He also expands 從 well beyond the tradition and rejects the word 棄命 itself:
「至於從局動云棄命，豈有命而可棄者乎？」, and states a supporting axis neither
pole of the dispute usually invokes: 「陰易於他從，陽難於他從」.

### Position 4 — STRENGTH IS THE WRONG AXIS ENTIRELY (任鐵樵)

Six charts naming a root, 餘氣, 祿 or 比劫 where the following pattern *still
holds* (`CF-008`), with two explicit refusals of the weak-body reading:

> 從兒不論身強弱，**非身弱論也** (`DTS-SHUNJU-05` — DM has 祿 and 比肩)
> 格取從官，**非身衰論也** (`DTS-JIACONG-03` — DM sits on its own element)

This is not silence about roots — it is a **pre-emptive refusal of the
objection**. 任 concedes the support exists and rules the strength axis
inapplicable to 從兒.

### Position 5 (Qing 格局 orthodoxy) — DISQUALIFIERS ARE 傷食 AND 印, NOT ROOT PER SE

沈孝瞻, 論雜格:
> 四柱皆煞，而日主無根，捨而從之，格成大貴。**若有傷食，則煞受制而不從，有印
> 則印以化煞而不從。**

徐樂吾's 徐注 on the same passage:
> 從財從煞，其理一也。氣勢偏旺，日主無根，不得不從其旺勢也…從煞格喜行財生煞
> 之運，**印則洩煞之氣為不美**，比劫非宜，而食傷制煞為最忌。

### What this does to R11

S1 recorded R11 as **REFUTED** on six 滴天髓 charts, lineage-scoped without
saying so. S1.5 corrected it to `SCHOOL_DEPENDENT` on a two-way split. **S1.6
supersedes both**:

| Position | Holder | Root rule |
|---|---|---|
| 1 | 淵海子平 | root present ⇒ following void, binary |
| 2 | 張楠 (神峰通考) | root fatal, but **only for yang day stems**; yin stems may follow despite root |
| 3 | 陳素庵 (命理約言) | root is one conjunct of a compound adverse condition, not an entry bar |
| 4 | 任鐵樵 (滴天髓) | strength/rootedness is the wrong axis for 從兒 specifically |
| 5 | 沈孝瞻/徐樂吾 (子平真詮) | disqualifiers are 傷食 and 印, not root itself |

`R11_STATUS = SCHOOL_DEPENDENT`, and more precisely: **at least five
non-equivalent formal rules circulate under one name**, no two of which are the
same proposition even when they agree on a verdict. A single boolean
"root disqualifies" flag cannot represent positions 2 and 3 at all, let alone
reconcile them with 4 and 5.

### Worked-case evidence, not only doctrine (S1.6 addition)

`CROSS_LINEAGE_BRIDGE_CASES.md` BRIDGE-B2/B3 — the chart 甲午 丁丑 甲午 丙寅
(`DTS-SHUNJU-05`), where 任鐵樵 pre-emptively rules root irrelevant (非身弱論也)
— is independently contested by **two** modern practitioners, each rejecting a
different part of his reasoning: one accepts the root objection 任 forecloses
and downgrades the 格 to 假從兒; the other rejects following outright, reads
**身也不弱**, and treats the very luck period 任's own chapter calls worst-case
(官殺) as favourable. **This is now the best-attested single case for CF-011**
in the whole program — a worked chart, not only doctrine on both sides.

### Is it a real disagreement, or terminology?

Real. 淵海子平's following patterns are **admission-gated categories** with
binary entry tests. 陳素庵's is a **compound-condition audit**. 任鐵樵's is a
**whole-chart 氣勢 reading** where a root's significance depends on function,
not presence. These are three different kinds of machine, genuinely disagreeing
about overlapping objects.

**Zero charts are adjudicated by both a strict-root lineage and 任鐵樵.**
BRIDGE-B2/B3 comes closest — modern authors disputing 任 — but does not settle
whether 淵海子平, 張楠, or 陳素庵 would rule the same way on 任's own charts.

**RESOLUTION: OPEN — five-way, school-dependent, load-bearing for any
special-pattern axis. Worked-case evidence now exists (BRIDGE-B2/B3) but does
not yet adjudicate the classical lineages against each other directly.**

---

## CF-012 — Sequencing: which question is asked first? (S1.5 → S1.6, sharpened to three-way)

**Type:** `SEQUENCING_CONFLICT`

**S1.6 update: a systematic literal sweep found five distinct step-1 claims
across the tradition, one classical author (三命通會 卷十) holding four of them
in one unreconciled section, and — critically — a correction to this
program's own prior claim that 滴天髓 states no order.** Full detail in
`docs/myungri-strength-v2/SEQUENCING_COMPARISON.md`, which now supersedes the
two-lineage account below in every particular except the headline conflict,
which survives sharpened.

**淵海子平, 神趣八法 總釋 眉批** — verified verbatim:
> 看八字**先明從化爲本**，化不成方論財官，財官無取方論格局

Special structure screened **first**; 格局 **last**.

**沈孝瞻, 子平真詮 論用神** — verified verbatim:
> 八字用神，專求月令，以日干配月令地支，而生尅不同，格局分焉

月令/格局 **first**; special structure (外格) explicitly **last** — 月令，本
也；外格，末也.

**任鐵樵, 滴天髓闡微 八格 — CORRECTION to the prior S1.6 draft**, which claimed
no comparable order exists. It does:
> 先觀月令 → 次看天干透出 → 再究司令以定真假 → 然後取用

月令 first, but the special-pattern authenticity check (真假) sits at **step
three**, neither first (淵海子平) nor last (沈孝瞻) — a third position.

**Three named/lineage-identified authorities, three different answers to the
same question, verified verbatim on all three.**

`CF012_CLASSIFICATION` = **SAME_PROPOSITION_DIFFERENT_ANSWER — a confirmed
three-way sequencing conflict.**

A fourth apparent data point (三命通會 卷十's 「凡命先論化氣」, read as agreeing
with 淵海子平) was tested adversarially and **REFUTED**: it is one of four
unreconciled 「凡…先…」 openers in the same section, the first of which states
the *opposite* thesis, and in context it is a 本體/化 classification mechanism
(day/night birth), not an ordering rule at all. See `SEQUENCING_COMPARISON.md`
§4 for the full refutation — it is retained here as a documented negative,
because surface-matching a phrase without reading its context is exactly the
failure mode this whole program exists to catch.

**Bearing on the pipeline hypotheses (§38), rescored:**

| Hypothesis | 淵海子平 | 子平真詮 | 任鐵樵 | 陳素庵 |
|---|---|---|---|---|
| A: 旺衰 → 格局 → 用神 | contradicted (格局 last, not after 旺衰) | contradicted | not this shape | **explicitly supported** (看命第一要訣) |
| B: 月令/格局 first, 旺衰 subordinate | contradicted (格局 last) | **explicitly supported** | **explicitly supported** (corrected) | not this shape |
| C: special screen first, ordinary only if ordinary | **explicitly supported** | contradicted (外格，末也) | partially (真假 check is step 3, not step 1) | not addressed |

**RESOLUTION: OPEN, and load-bearing.** Pipeline B is now the best-attested (3
lineages including a corrected 任鐵樵). Pipeline A is not a purely modern
artefact — it has a forceful Qing adherent in 陳素庵. This must be settled, or
explicitly parameterised by lineage, before any V2 pipeline order is frozen,
because the three positions produce different answers on exactly the
borderline charts that matter (`CF-011`'s six 滴天髓 rooted-following cases
among them).

**Hypothesis on record, strengthened but not proven by S1.6**: CF-011 may be
partly downstream of CF-012 — under a special-screen-first order the root test
pre-empts any whole-chart 氣勢 reading, so the question CF-011 asks may not
arise the same way in every pipeline. See `SEQUENCING_COMPARISON.md` §6.

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
| CF-002 | 土旺極 internal contradiction | **CLOSED — COPY_ERROR** (S1.6) |
| CF-003 | 專旺 absent from primary text | PARTIALLY CLOSED |
| CF-004 | 從兒 vs body-strength | OPEN |
| CF-005 | 眾寡 vs 強弱 | CLOSED — independent axes |
| CF-006 | 絕無一毫 scope | OPEN |
| CF-007 | root identity is contextual | OPEN |
| CF-008 | root present, still follows | R11 REFUTED; replacement OPEN |
| CF-009 | classification depends on the question asked | **CLOSED — TASK_RELATIVE_COMPATIBLE** (S1.5) |
| CF-010 | irreconcilable biographies for one chart | OPEN — needs 2nd edition |
| CF-011 | root vs following — now a FIVE-position dispute | **OPEN — school-dependent; first worked-case bridge found (S1.6)** |
| CF-012 | sequencing — THREE named authorities give three answers | **OPEN — blocks pipeline order; 滴天髓's own position corrected (S1.6)** |
| CF-013 | climate prescribes what 扶抑 forbids | **OPEN — forces module separation** |

**9 open, 1 partially closed, 3 closed.**

Closed so far: **CF-005** (眾/寡 and 強/弱 are independent axes), **CF-009**
(`TASK_RELATIVE_COMPATIBLE`), **CF-002** (`COPY_ERROR`, closed in S1.6 on internal
evidence). Partially closed: **CF-003** (專旺 absent).

Conflict types present: `ONTOLOGY` (CF-001, CF-007, CF-011, CF-013), `VERDICT`
(CF-004, CF-008, CF-011), `TERMINOLOGY` (CF-003, CF-005), `QUANTIFIER` (CF-006),
`SCOPE` (CF-002, CF-010), `SEQUENCING` (CF-012).

**CF-011 and CF-012 are the first cross-lineage conflicts.** Both were invisible
while the corpus had one source, and both change conclusions S1 had recorded as
settled. That is the S1.5 diversification working as intended.

**S1.6 update.** A systematic bridge-case hunt (`CROSS_LINEAGE_BRIDGE_CASES.md`,
`BRIDGE_SEARCH_REGISTER.md`) sharpened both further rather than resolving
either: CF-011 decomposes into five non-equivalent formal positions (淵海子平
binary / 張楠 yin-yang-asymmetric / 陳素庵 compound-conjunct / 任鐵樵 axis-inapplicable
/ 沈孝瞻-徐樂吾 傷食+印-only), and now has its first worked-case bridge
(`CROSS_LINEAGE_BRIDGE_CASES.md` BRIDGE-B2/B3). CF-012 gained a third named
position and a correction to this program's own prior claim that 滴天髓 states no
order — it does (先觀月令 → 次看天干透出 → 再究司令以定真假 → 然後取用). Neither
conflict is closed. Both are better specified, which is the honest and useful
outcome of the additional evidence.

An open conflict blocks any V2 rule that would depend on it. That is the point
of the register.
