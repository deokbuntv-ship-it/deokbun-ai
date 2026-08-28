# MYUNGRI_STRENGTH_V2 — ADVERSARIAL SYNTHETIC CASES (S1)

Status: **S1 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**

## What these are, and what they are categorically not

Every chart in this file is **constructed by Deokbuni**. None comes from a
classical source. None has a classical judgment. None may ever be:

- counted toward the real-case corpus total,
- used as a gold label,
- used to calibrate, fit, threshold, or validate a classifier's accuracy,
- cited as evidence that any doctrine is correct.

They are stored **outside** `data/myungri-strength-v2/discovery-cases.json`, and
the corpus validator hard-fails on any record carrying `IS_SYNTHETIC: true`
appearing in that file. That guard is the enforcement; this paragraph is only
the reason for it.

## What they are for

A single purpose: **to make a future classifier fail loudly in the right place.**

Each case below is a chart whose *facts* sit exactly on a boundary the source
material leaves undetermined. The expected result for every one of them is not a
strength label. It is:

> `DECLINE_TO_JUDGE` — with a named reason pointing at an open conflict.

If a future V2 reasoner emits a confident verdict on any of these, that reasoner
has invented authority it does not have. These cases exist to catch exactly that
regression. They are a **negative test suite**, not training data.

The distinction that killed V1 is the one being defended here: *the absence of
affirmative evidence is not evidence of the negative.* A classifier that answers
"weak" because it found no support has committed the V1 error. On these charts
the correct answer is that the question is not decidable from what is known.

---

## SYN-001 — Root present, following-pattern facts otherwise complete

**Chart:** 丙戌 庚寅 乙未 己卯
**Boundary probed:** `CF-008` / `R11`

Day Master 乙 has a genuine root (未 hidden 乙) and a peer-adjacent 卯, while the
rest of the chart leans heavily to 財/官. `DTS-CONGXIANG-01` shows the source
concludes 從 on facts of this shape; nothing in the source says when it would
not.

**Expected V2 output:** `DECLINE_TO_JUDGE (CF-008 open — no source threshold for
root-present following)`
**Failure to catch:** any confident 從 or any confident 身弱.

---

## SYN-002 — Peers numerous in the stems, rooting denied in the branches

**Chart:** 辛酉 辛卯 辛巳 辛卯
**Boundary probed:** `CF-004`, the `DTS-SHUNJU-05` / `DTS-SHUNJU-09` contrast

Three peer stems, no branch rooting for the Day Master's own element beyond the
year. The source distinguishes stem-presence from branch-rooting in exactly this
configuration — and states no rule for which wins.

**Expected V2 output:** `DECLINE_TO_JUDGE (CF-004 open)`
**Failure to catch:** any classifier that tallies stems, or one that tallies
branches, reaching opposite confident answers on the same chart.

---

## SYN-003 — The tally trap

**Chart:** 戊子 甲寅 丙午 壬辰
**Boundary probed:** `CF-005` / `R10`

Constructed so that an equal-weight occurrence count of supporting versus
draining elements comes out near-even, while the structural picture (month
command, rooting quality, positional adjacency) does not.

**Expected V2 output:** `DECLINE_TO_JUDGE` — and, critically, **no number**.
**Failure to catch:** any emitted score, ratio, percentage, or threshold
comparison. 眾 and 強 are independent axes (`OBS-02`); a count is not a verdict.

---

## SYN-004 — Root uprooted by clash

**Chart:** 庚申 己卯 乙酉 乙酉
**Boundary probed:** `CF-007`, root identity under relation pressure

The Day Master's rooting branch is clashed. `DTS-JIACONG-02` (根拔盡) and
`DTS-CONGXIANG-05` (root *restored* by luck, pattern breaks) show the source
treats root destruction and root restoration asymmetrically, and explains
neither.

**Expected V2 output:** `DECLINE_TO_JUDGE (CF-007, CF-008 open)`
**Failure to catch:** a reasoner that computes "root, therefore can bear" or
"root destroyed, therefore cannot bear". The second is the V1-fatal invalid
converse.

---

## SYN-005 — Resource over-abundant

**Chart:** 壬子 壬子 甲子 癸酉
**Boundary probed:** `虛極不受水生` (`DTS-JIAHUA-02`)

Overwhelming resource. The naive rule "resource supports the Day Master,
therefore strong" runs directly into the source's own observation that a Day
Master can be too depleted to *receive* support.

**Expected V2 output:** `DECLINE_TO_JUDGE (R6 contested — support presence is
not support received)`
**Failure to catch:** any monotonic "more resource ⟹ stronger" behaviour.

---

## SYN-006 — Capacity asked without a load

**Chart:** 丁巳 壬子 戊申 乙卯
**Boundary probed:** `OBS-09`

The source's capacity vocabulary is task-relative — 足以敵官, 足以制殺, 足以用財 —
never a global property of the Day Master. This chart is offered to a reasoner
with no specified load.

**Expected V2 output:** `DECLINE_TO_JUDGE (capacity is relative to a named load;
none supplied)`
**Failure to catch:** any global `CAN_BEAR` / `CANNOT_BEAR` verdict. Those
predicates were withdrawn in the V1 closure and must not return through a side
door.

---

## SYN-007 — Facts sufficient, doctrine silent

**Chart:** 癸亥 乙丑 丁酉 庚子
**Boundary probed:** the honest-abstention case

Nothing about this chart is ambiguous at the fact layer. Every fact provider
returns a complete, confident answer. What is missing is *doctrine* — no
retrieved source passage adjudicates this configuration.

**Expected V2 output:** `DECLINE_TO_JUDGE (no source coverage)`
**Failure to catch:** the most dangerous regression of all — a reasoner that
mistakes complete *facts* for sufficient *authority*. Fact completeness and
doctrinal coverage are different properties. V1 conflated them.

---

## Usage rule

These seven cases become an executable negative test **only at S6**, once a V2
reasoner exists to run them against. They are not tests today; there is nothing
to test.

Adding a case here is cheap and encouraged whenever a new open conflict is
registered. Removing one requires the conflict it probes to be **closed by a
named source** — not by a decision that the chart is now obvious.

**7 synthetic cases. 0 counted toward the corpus. 0 gold labels.**
