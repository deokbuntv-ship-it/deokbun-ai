# MYUNGRI_STRENGTH_V1 — CLOSURE

> **V1 is closed as FOUNDATION ONLY.** The deterministic fact foundation passed independent audit and is
> frozen. Every *judgment* contract V1 produced is withdrawn. No V1 reasoner will be implemented.
>
> Closed at `7f660da5ad0e62d5683b9624ad1b6963ebffd1bf`. Binding audit result:
> doctrine `C. NARROWED_DOCTRINE_NOT_READY` · alignment `C. NOT_READY` ·
> product scope `C. NOT_PROFESSIONALLY_MEANINGFUL` · fact foundation `A. FROZEN`.

---

## A. WHY V1 WAS CLOSED

V1 went through four doctrine revisions (V1.1 → V1.4) and failed audit each time. The revisions were not
careless — each one genuinely fixed what the previous audit named. It failed anyway, and the reason is
structural rather than a list of bugs.

### The methodological failure, stated once and plainly

> **Classical qualitative language was repeatedly being converted into software-complete predicates
> without sufficient evidence.**

Every V1 revision took an expression the sources state qualitatively — 重重, 疊疊, 絕無一毫, 四柱皆比劫,
滿局, 黨眾, 不雜 — and asked "what would this have to mean for code to decide it?" That question always has
an answer, and the answer is always an invention. Disclosing the invention (which V1.3 and V1.4 did,
carefully, in the open) made it auditable. It did not make it doctrine.

The tell was visible in the pattern of the fixes: each revision **narrowed** rather than resolved. V1.2
corrected 從兒. V1.3 built an 18-cell table. V1.4 deleted the table, withdrew every `CONFIRMED`, and
reduced the canonical output to a single binary. A method that converges toward emitting nothing is not
converging on the truth — it is running out of things it can honestly say.

### The six specific findings

**1. An invalid logical converse — the most serious error, and it was mine.**

The source (任鐵樵) says:

> 「日干不論月令休囚，只要四柱有根，便能受財官食神而當傷官七殺」

This establishes **ROOT → CAN_BEAR**. 只要 ("one need only") states a **sufficient** condition.

V1.4 defined `CANNOT_BEAR` as entered by `NO_ROOT`, justifying it as "the same clause read for its evident
force: root is what confers 能受." That is **denying the antecedent** — inferring ¬ROOT → ¬CAN_BEAR from
ROOT → CAN_BEAR. It is invalid, and no located source states that a rootless Day Master cannot bear.
A chart could plausibly derive bearing capacity from another configuration entirely (abundant 印綬, for
instance) without a root.

This mattered more than a normal doctrinal slip, because `BEARING_CAPACITY` was V1.4's **only** canonical
output. Half of its state space rested on a logic error.

**2. Special-pattern contracts still required private interpretation.** Even reduced to candidate-only,
每 pattern needed an unsourced reading to be evaluated at all: the 지장간 scope of 四柱皆比劫 and 絕無一毫
and 不雜, the multiplicity of 重重/疊疊 and 食傷多也, the meaning of 滿局財 / 滿局官殺. Candidacy is a weaker
claim than confirmation, but it is still a claim, and it still rested on inventions.

**3. Raw occurrence counting did not model 黨眾 / 助寡.** V1.3 compared equal-weight counts of supporting
vs opposing occurrences. Factional abundance in the sources involves rooting, functional backing, and
structural context — not a headcount. V1.4 removed it as authority, correctly, but that removal left the
ordinary axis with nothing behind it.

**4. The 18-cell table had underdetermined and arbitrary middle cells** — and cell #6 embedded an absolute
single-factor cap (`NO_ROOT` ⇒ never STRONG) that no source states. Notably, that is **the same invalid
converse as finding 1**, in a different costume. It appeared twice, in two revisions, without being
recognized as one error.

**5. Seven-band precision depended on unsupported Stage-2 boundaries** — the `CLEAR` / `EXTREME` split
rested on "limiting evidence", which was never defined, and Stage 2 was not total.

**6. The deterministic facts survived every audit.** This is the finding that determines the strategy: the
problem was never the facts. It was the attempt to bridge from facts to judgment by textual exegesis alone.

---

## B. WHAT WAS PROVEN

Genuinely established by V1, and carried forward:

1. **A complete, correct, frozen deterministic fact foundation** — see
   `MYUNGRI_STRENGTH_FACT_FOUNDATION_V1_FREEZE.md`. Independently graded `A`.
2. **A two-level firewall** (compile-time + runtime) that makes fact/inference contamination a build
   failure rather than a review finding.
3. **Verified source corrections** that any future work inherits (§D below).
4. **A source-layer discipline** — `ORIGINAL_TEXT` / `原注` / `NAMED_COMMENTARY` / `NAMED_SCHOOL` /
   `MODERN_SYSTEMATIZATION` / `DEOKBUNI_OPERATIONALIZATION` / `SOURCE_NOT_VERIFIABLE` — which is what
   caught most of V1's own errors.
5. **A negative result worth having:** classical strength doctrine cannot be turned into an exhaustive
   deterministic predicate set by reading texts alone. That is why V2 changes method rather than effort.

---

## C. WHAT WAS **NOT** PROVEN — do not implement any of this from V1

| Withdrawn | Status |
|---|---|
| `BEARING_CAPACITY` as a three-state classifier | **WITHDRAWN** |
| `NO_ROOT ⇒ CANNOT_BEAR` | **WITHDRAWN — invalid converse.** Do not replace it with another unsupported negative |
| WEAK / BALANCED / STRONG | **NO V1 AUTHORITY** |
| Seven bands | **NO V1 AUTHORITY** |
| Special-pattern confirmation (all 8) | **NO V1 AUTHORITY** |
| Special-pattern *candidate evaluators* | **NO V1 AUTHORITY** — `SOURCE_RESEARCH_ONLY` / `DEFERRED_TO_V2` |
| Root-function, relation-effect, transformation judgments | **NO V1 AUTHORITY** |
| Yongshin / Heesin / Gisin | Never in scope |

### The one affirmative proposition that survives — and its exact limits

Preserved as **doctrinal evidence**, not as a classifier:

> **`ROOTED_DAY_MASTER_CAN_BEAR_CERTAIN_LOADS`** — NAMED_COMMENTARY (任鐵樵): a Day Master with a root
> among the four pillars can bear 財/官/食神 and withstand 傷官/七殺, and this holds regardless of whether
> the month leaves it 休 or 囚 (不論月令休囚).

Its three permitted readings, and the boundary that matters:

| Fact state | Permitted reading |
|---|---|
| `ROOT_PRESENT` | source-supported **affirmative** bearing evidence |
| `ROOT_EFFECT_UNRESOLVED` | the affirmative proposition **cannot yet be safely applied** |
| `NO_ROOT` | **`NO_AFFIRMATIVE_BEARING_EVIDENCE_FROM_THIS_RULE`** |

> **`NO_AFFIRMATIVE_EVIDENCE` ≠ `CANNOT_BEAR`.** The absence of evidence from *this* rule says nothing
> about the chart. Another rule, not yet established, may supply bearing capacity by another route.
> Collapsing these two is exactly the error that closed V1.

And its scope, stated as hard language:

```
BEARING_EVIDENCE  !=  身强/身弱 final verdict
BEARING_EVIDENCE  !=  WEAK / BALANCED / STRONG
BEARING_EVIDENCE  !=  seven-band strength
BEARING_EVIDENCE  !=  Yongshin
```

It is **one source-backed inference available to V2**, nothing more.

---

## D. VERIFIED SOURCE MATERIAL PRESERVED FOR V2

Research value, **not** executable predicates. Each was verified against retrievable primary text during
V1; several correct errors V1 itself had made.

| Pattern | Preserved material |
|---|---|
| **從兒** | ORIGINAL_TEXT 滴天髓 順局: 「一出門來只見兒，吾兒成氣構門閭；**從兒不管身強弱**，只要吾兒又得兒。」 — Day-Master strength is expressly **not** the governing question. 任鐵樵: 「不論身強弱者，四柱雖有比劫仍去生助食傷也」 (比劫 may remain, they feed 食傷); 「**必要食傷在提綱也**」 (月令 must carry 食傷 — a 必要 condition V1.1 omitted entirely); 「吾兒又得兒者，必要局中有財」 (the 財 outlet) |
| **專旺 / 獨象** | 任鐵樵 形象第十一, five-pattern list, then 「皆從一方之秀氣，不同六格之常情。**必要得時當令，遇旺逢生**。」 — **任鐵樵 is NOT silent on season.** V1.3 claimed he was and manufactured a conflict with 子平真詮 on that basis; the conflict never existed. Also: **稼穡 requires 四庫皆全** (辰戌丑未), which is neither a 三合 nor a 方合; disqualifier is the **controlling element only** |
| **從勢** | 任鐵樵 從象: 「日主無根，四柱財官食傷並旺，**不分強弱**，又無劫印生扶日主…視其財官食傷之中，**何其獨旺**，則從旺者之勢。**如三者均停，不分強弱**…」 — 不分強弱 **is** present (V1.3 called it unverifiable and dropped it) and appears **twice**; 從勢 covers **both** the uniquely-prosperous case and the balanced case |
| **何其獨旺 scope** | **It belongs to 從勢**, selecting which force an already-qualifying 從勢 chart follows. It is **not** 從財 / 從官殺 entry logic. V1.3 transplanted it into those patterns; withdrawn |
| **從旺 / 從强** | 任鐵樵 從象, verbatim: 「從旺者，四柱皆比劫，無官殺之制，**有印綬之生**，旺之極者，從其旺神也。」 / 「從強者，四柱印綬重重，比劫疊疊，**日主又當令**。絕無一毫財星官殺之氣…」 — the distinction is **source-level**, on three axes (印's weight · 當令 mandatory or not · composition). Note 有印綬之生 is a **positive requirement** for 從旺, which V1.1 carried not at all |
| **眞從 / 假從** | ORIGINAL_TEXT 滴天髓: 「真從之象有幾人，假從亦可發其身」, gloss 「日主弱矣，財官強矣，不能不從，中有所助者，便假」 — scopes to the **weak-DM** family; extending it to 從旺/從强/專旺 is unsourced |
| **得時不旺** | ORIGINAL_TEXT 子平真詮 ch.6 「論十干得時不旺失時不弱」 — no verdict may be projected from the seasonal axis alone, in either direction |
| **NOT retrieved** | 淵海子平's and 三命通會's own 從旺/從强 material. Recorded as `NOT RETRIEVED`, never inferred |

---

## E. WHAT V2 MUST DO DIFFERENTLY

1. **Stop deriving software predicates from text alone.** Add worked cases as a co-equal evidence source.
   A rule earns authority by explaining real judgments, not by being a plausible reading.
2. **Never infer a converse.** ROOT → CAN_BEAR does not license ¬ROOT → ¬CAN_BEAR. This error appeared
   twice in V1 (as `CANNOT_BEAR`, and as table cell #6) before being caught. V2 must test for it
   explicitly.
3. **Distinguish "no affirmative evidence" from "negative evidence"** everywhere, structurally.
4. **Select a lineage and say so.** V1 kept trying to satisfy every school at once and produced contracts
   satisfying none.
5. **Let uncertainty be an ordinary output**, not a failure — but do not let *everything* become uncertain,
   which is where V1.4 ended.
6. **Do not build the seven bands until calibration supports adjacent distinctions.** Product pressure for
   seven labels is not evidence for seven labels.
7. **Audit at gates, not per commit.** V1 consumed four full doctrine revisions in a per-commit audit loop,
   each one internally consistent and none professionally meaningful.

See `MYUNGRI_STRENGTH_V2_RESEARCH_PLAN.md`.

---

## F. DOCUMENT STATUS AFTER CLOSURE

| Document | Status |
|---|---|
| `MYUNGRI_STRENGTH_FACT_FOUNDATION_V1_FREEZE.md` | **AUTHORITATIVE** for what is frozen and implemented |
| `MYUNGRI_STRENGTH_V1_CLOSURE.md` (this) | **AUTHORITATIVE** for what is withdrawn and why |
| `MYUNGRI_STRENGTH_V2_RESEARCH_PLAN.md` | **AUTHORITATIVE** for what happens next |
| `MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md` | **SUPERSEDED_BY_V2_RESET** — historical record + preserved source research. **No implementation authority** |
| `MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md` | **SUPERSEDED_BY_V2_RESET** — source-layer attributions remain useful as V2 input |
| `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md` | **SUPERSEDED_BY_V2_RESET** — its `P0_DOCTRINE_GAPS = NONE` claim is void; it was true only of V1.4's narrowed scope, which is itself withdrawn |
| `MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md` | Still accurate for the fact layer; the freeze document above supersedes it on status |

The V1 documents are **kept, not rewritten.** They record how the errors were found, which is the part
worth having. They carry supersession banners so no reader mistakes them for live contracts.
