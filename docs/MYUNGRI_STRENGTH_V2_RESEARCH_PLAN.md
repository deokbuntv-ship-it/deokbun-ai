# MYUNGRI_STRENGTH_V2 — RESEARCH PLAN

> **Status: RESEARCH PROGRAM. No runtime implementation is authorized by this document.**
> Prerequisites: `MYUNGRI_STRENGTH_FACT_FOUNDATION_V1_FREEZE.md` (what V2 consumes) and
> `MYUNGRI_STRENGTH_V1_CLOSURE.md` (why V1 was closed and what must not be repeated).

---

## 1. The core principle

V1 failed by attempting:

```
CLASSICAL TEXT  →  one exhaustive deterministic lookup table
```

That bridge cannot be built by exegesis alone. Classical strength doctrine is stated qualitatively by
practitioners who assumed a reader with case experience; converting it directly to software-complete
predicates always requires inventing the missing quantifier.

V2 adds the missing evidence source:

```
CLASSICAL / HISTORICAL DOCTRINE
  + NAMED SCHOOL / LINEAGE
  + FROZEN DETERMINISTIC FACTS
  + REAL WORKED CASES
  + EXPERT-LABELED STRUCTURAL JUDGMENTS
  + ADVERSARIAL COUNTEREXAMPLES
  + EXPLICIT UNCERTAINTY
        ↓
  CANONICAL V2 JUDGMENT GRAPH
```

**Worked cases are how a qualitative rule acquires an operational boundary** — not by us deciding what
重重 means, but by observing where practitioners actually drew the line, across many charts, and finding
the structural predicate that matches their behaviour. Where no such predicate exists, that is a genuine
finding and the rule stays uncertain.

### What V2 is NOT

- **Not machine learning.** No trained model, no statistical classifier, no learned weights.
- **Not an LLM verdict.** An LLM may assist research (transcription, retrieval, candidate hypotheses). It
  is never the Strength authority, and never appears in the verdict path.
- **Not a black box.** Every V2 verdict must be **replayable · inspectable · evidence-linked ·
  source-linked · case-calibrated**. A user or auditor must be able to ask "why?" and receive the actual
  decision path with its facts, its rule ids, and its supporting cases.
- **Not score fitting.** See §9.

---

## 2. Source evidence tiers

| Tier | Meaning | Examples |
|---|---|---|
| **LEVEL A** | Primary / base classical text | 滴天髓 verse · 子平真詮 · 淵海子平 · 三命通會 · 窮通寶鑑 |
| **LEVEL B** | Named historical commentary | 任鐵樵《滴天髓闡微》· 徐樂吾 · 沈孝瞻's own commentary |
| **LEVEL C** | Named lineage / school operational doctrine | 格局派 · 억부派 · 調候派, where a *named* transmission states an operational rule |
| **LEVEL D** | Modern professional teaching **with identifiable provenance** | A named modern author/teacher with a citable published work |
| **LEVEL E** | Deokbuni case-calibrated operationalization | Our own boundary, adopted because the case corpus supports it |

**Rules.** D and E are never labelled classical. E is legitimate — it is how a qualitative rule becomes
operational — but it must be labelled E, must cite the case ids that justify it, and must be revisitable
when the corpus grows. A rule with **no** tier is not a rule.

**Anonymous internet content has no tier and is not admissible** (see §5.3).

---

## 3. Selected-lineage policy

V1 tried to satisfy every school simultaneously and produced contracts satisfying none. V2 chooses.

For every disputed topic, the research must produce:

1. the major interpretations, each with its source lineage named;
2. worked examples showing how each lineage actually decides;
3. a decision, exactly one of:

| Decision | When |
|---|---|
| **A. SELECT** one canonical lineage | its worked examples are internally consistent and reproducible |
| **B. BRANCH** — support multiple named readings as explicit alternatives | both are well-attested and the difference is material to users |
| **C. CONFLICT** — return `DOCTRINE_CONFLICT` at runtime, naming both poles | genuinely irreconcilable and the chart cannot be read without resolving it |
| **D. DEFER** | insufficient evidence to do any of the above |

**Averaging schools is prohibited.** So is silently picking one — a selection must be stated as a
selection, with the rejected alternatives named.

**Working hypothesis (to be validated, not assumed):** 任鐵樵's 滴天髓闡微 lineage as the primary operational
selection for strength, since V1's verification work already established the most reliable coverage there.
This is a starting point for §4's research, not a settled decision.

---

## 4. Structural axes — to be discovered, not assumed

Before any band, V2 needs the structural vocabulary practitioners actually reason in. Candidate axes for
**research**:

| Axis | Question it answers |
|---|---|
| `SEASONAL_COMMAND` | What does the month grant or deny the Day Master? |
| `ROOTING_STRUCTURE` | What roots exist, of what tier, in what position? |
| `SUPPORTING_FACTION_FUNCTION` | Do 비겁/인성 actually function, or are they nominal? |
| `OUTPUT_FUNCTION` | Does 식상 drain, redirect, or protect? |
| `WEALTH_FUNCTION` | Does 재성 burden, or is it an outlet? |
| `CONTROL_FUNCTION` | Does 관살 pressure, or is it mediated? |
| `RELATION_MODIFICATION` | Do detected relations change any of the above? |
| `SPECIAL_STRUCTURE_CANDIDACY` | Is the ordinary axis even the right frame? |
| `ORDINARY_BEARING` | Can the Day Master take load? |
| `UNCERTAINTY` | What is unresolved, and why? |

> **These are candidates, not a frozen list.** They are written down so research has somewhere to start.
> The corpus determines the final axes — including collapsing several, or discovering one nobody listed.
> Freezing this table now would repeat V1's mistake of deciding structure before evidence.

---

## 5. The worked-case corpus

### 5.1 Targets

| Phase | Target | Purpose |
|---|---|---|
| **Discovery** | **100 cases** | find the real axes and the shape of the decision graph |
| **Calibration** | **300 cases** (cumulative) | establish operational boundaries for qualitative terms |
| **Holdout / Founder QA** | **100 cases**, untouched during rule design | honest generalization measurement |

Preferred long-term: **500+** annotated charts. **Do not wait for thousands before making progress** —
100 well-annotated cases with real provenance beat 1,000 scraped labels.

### 5.2 Composition

- classical worked examples (滴天髓闡微's own case discussions are the densest source)
- named historical commentary examples
- modern professional published cases with identifiable authorship
- founder-reviewed cases
- **adversarial synthetic boundary cases — tracked separately and never mixed into the real-case counts**

Coverage must include, at minimum: ordinary weak · ordinary balanced · ordinary strong · extreme ordinary ·
candidate special structures · source-backed confirmed special structures · rootless · multi-root ·
season-supportive · season-opposing · mixed faction · relation-heavy · disputed/uncertain.

**Do not artificially balance labels** if the historical distribution is unknown — record the sampling
method instead, so later work can correct for it.

### 5.3 Excluded sources — explicit

Generic online 신강/신약 calculators, 점수 calculators, and 오행 percentage tools are **not gold labels** and
must never be treated as such. They may be studied **only as negative/comparison examples**.

> **We have direct evidence for this exclusion inside this project.** The legacy 219-product Korean
> fortune system analysed in `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` contains `solve/sinyaksingang.php`,
> a strength module using author-specific weights (0.7 / 0.5 / 0.3, 왕지 1.2, 土월 0.84, 천간 0.2) and a
> hard threshold `身强 if > 1.2`. **Its own author left a comment saying the method still needed research.**
> The owner's independent analysis reached the same verdict this plan does: adopt its deterministic inputs,
> never its verdict (`판정값 無 / 입력만`). A calculator whose author did not trust its output is not a
> label source.

### 5.4 Case provenance schema

Every real case records:

```
CASE_ID
SOURCE                     (text / author / edition / locator)
SOURCE_LAYER               (A | B | C | D)
AUTHOR_OR_COMMENTATOR
CHART                      (four pillars, as given)
SEX                        (if the source treats it as relevant)
CALENDAR_ASSUMPTION        (solar/lunar, 節氣 handling, timezone if stated)
ORIGINAL_JUDGMENT          (verbatim)
ORIGINAL_STRENGTH_LANGUAGE (the exact term used — 身强 / 身弱 / 從 / etc.)
SPECIAL_PATTERN            (as claimed by the source)
ROOT_DISCUSSION
SEASON_DISCUSSION
SUPPORT_DISCUSSION
OPPOSITION_DISCUSSION
RELATION_DISCUSSION
WHY                        (the source's stated reasoning)
AMBIGUITY                  (what the source leaves open)
V2_NORMALIZED_LABEL        (our normalization — separate field, never overwriting the original)
PROVENANCE                 (how we obtained and verified it)
```

**The original judgment and our normalization are separate fields.** Conflating them is how a corpus
quietly becomes a record of our own opinions.

---

## 6. Calibration workflow

For each case:

```
source/expert judgment
  → normalized structural explanation
  → deterministic fact bundle (frozen layer)
  → candidate decision graph output
  → compare
```

Mismatches are **classified, not patched**:

| Class | Meaning | Correct response |
|---|---|---|
| `FACT_GAP` | a fact the graph needed does not exist | evaluate adding it — but the fact layer is frozen, so this is a new audited sprint |
| `DOCTRINE_GAP` | no rule covers this configuration | research, do not invent |
| `SCHOOL_DIFFERENCE` | our lineage genuinely differs from this source's | correct; record it, do not "fix" it |
| `GRAPH_ERROR` | our rule is wrong | fix the rule |
| `AMBIGUOUS_CASE` | the source itself is unclear | exclude from calibration, keep as an uncertainty example |
| `LABEL_ERROR` | our normalization was wrong | fix the label |

> **Do not resolve mismatches by adding exceptions.** A graph with per-case exceptions has memorized the
> corpus rather than learned the doctrine, and will fail the holdout. If a rule needs more than a small
> number of exceptions, the rule is wrong.

---

## 7. Counterexample-driven rule adoption

A proposed rule becomes canonical only after surviving:

- **positive cases** — it explains them
- **negative cases** — it correctly declines them
- **near-boundary cases** — it behaves sanely where it is hardest
- **counterexamples** — deliberate attempts to break it
- **metamorphic tests** — invariants under controlled chart perturbation

> **A rule may not become canonical because it explains one famous case.** Every V1 rule that failed audit
> was plausible on the example that motivated it.

---

## 8. Rule provenance contract

Every V2 decision node carries:

```
RULE_ID
RULE_LAYER                 (A | B | C | D | E)
SOURCE
SELECTED_LINEAGE
INPUT_FACTS                (exact frozen providers consumed)
REQUIRED_INFERENCES        (upstream V2 nodes)
POSITIVE_CONDITIONS
COUNTEREVIDENCE
UNCERTAINTY_EXIT
SUPPORTED_CASE_IDS
COUNTEREXAMPLE_CASE_IDS
V2_AUTHORITY               (CANONICAL | BRANCH | RESEARCH | DEFERRED)
```

**Implementation-readiness test:** two independent implementers, given only the node, reconstruct
materially the same condition. If not → `DOCTRINE_RESEARCH_REQUIRED` or an uncertainty exit. This is the
test V1 kept failing quietly; V2 makes it a field.

---

## 9. Calibration is NOT score fitting

**Prohibited:** grid search · weight fitting · logistic regression · any numeric tuning against labels ·
hidden score thresholds · "N of M factors" rules.

**The purpose of cases is to discover:** missing predicates · incorrect scope (which 지장간 tiers a rule
actually ranges over) · invalid universal rules · unrecognized school branches · genuine uncertainty
boundaries.

The output of calibration is a **better structural rule**, never a tuned coefficient. If a proposal can
only be expressed as a number chosen to fit labels, it is rejected regardless of accuracy.

---

## 10. Special patterns — separate research track

從兒 · 從旺 · 從强 · 從財 · 從官殺 · 專旺 · 從勢 · 從氣 (and 化氣 etc. only if later admitted).

Per pattern, collect: source definitions · commentator differences · worked examples · counterexamples ·
quantifier interpretation (重重 / 疊疊 / 滿局 / 皆) · **hidden-stem scope** · season requirements · root
requirements · disqualifiers.

**No pattern enters production — not even candidate detection — until its own contract passes its evidence
gate.** V1's mistake was treating candidacy as a weaker claim that needed less evidence; it needs the same
kind of evidence, for a narrower conclusion.

Start from the preserved material in `MYUNGRI_STRENGTH_V1_CLOSURE.md` §D, which is verified and already
corrects several V1 errors.

---

## 11. Root function — separate research track

The distinction V1 never resolved:

```
ROOT EXISTS          (frozen fact — settled)
ROOT FUNCTIONALLY SUPPORTS   (inference — unresolved)
```

**Functionality may not be inferred from existence alone.** Corpus must include: rooted-but-weak-function
cases · unrooted-but-otherwise-supported cases (these are the ones that disprove the invalid converse) ·
relation-involved roots · month-branch roots vs non-month roots · multiple roots.

**Do not invent universal position weights.** V1 rejected the 월>일>시>년 hierarchy for lack of sourcing;
that rejection stands until cases say otherwise.

---

## 12. Relation effect — separate research track

Detection stays a frozen fact. V2 must decide, as four separate questions:

```
FORMATION  →  TRANSFORMATION  →  FUNCTIONAL EFFECT  →  STRENGTH EFFECT
```

**No detection→effect shortcut.** V1's conservative policy (unresolved effect never silently alters
strength) is the correct default and carries forward until cases support something stronger.

---

## 13. 司令 / month command

Exact 司令 sub-period precision remains **P1 research**. Do **not** block V2 foundation work on it. Revisit
only if the case corpus demonstrates it is essential to classifier convergence — i.e. if a material number
of mismatches trace to sub-period ambiguity.

---

## 14. Seven bands — the product target, sequenced honestly

```
PHASE 1   expert structural state          ← start here
PHASE 2   WEAK / BALANCED / STRONG family, if supported
PHASE 3   adjacent intensity distinctions, if supported
PHASE 4   seven-band product rendering
```

Each band ultimately requires: a structural definition · supporting examples · counterexamples · a defined
neighbour boundary · uncertainty behaviour.

> **No band may exist solely because the product UI expects seven.** If calibration supports three stable
> distinctions, the product ships three and the UI adapts. This is not negotiable, and it is the single
> most likely place for pressure to reintroduce fabricated precision.

---

## 15. Dataset discipline

| Corpus | Use | Rule |
|---|---|---|
| **A. Development** | designing doctrine and rules | rules may be written against it |
| **B. Holdout audit** | generalization measurement | **not looked at while rules are being created** |
| **C. Founder blind QA** | user-facing consultation quality | founder judges output without seeing the reasoning first |

**No case leakage between B and rule design.** If a holdout case is inspected during rule authoring, it is
retired from the holdout permanently.

---

## 16. Founder quality gate

The gate that decides whether V2 is professionally meaningful — the dimension V1 was graded `C` on:

> **"Could this judgment have been written without seeing this chart?"**
> If **YES** → **FAIL.**

Strength reasoning must reference actual structural facts of the specific chart. Generic prose that would
fit any chart is a failure regardless of how well-sourced the underlying rules are. V1's outputs would have
failed this gate even had its doctrine been sound, because at the end it produced almost nothing
chart-specific.

---

## 17. Scope within the wider system

V2 Strength is **one subsystem**. It must eventually support Yongshin · career/business judgment · money
capacity · relationship interpretation · timing · cross-divination synthesis.

**But it must be independently valid first.** Do not design Strength around what Yongshin will need — that
is how V1 acquired seven bands before it could justify three.

---

## 18. Gates

| Gate | Meaning | Status |
|---|---|---|
| **S0** | Fact foundation frozen | **DONE** — independently audited `A` |
| **S1** | Source + case corpus ready (100 discovery cases, provenance complete) | **NEXT** |
| **S2** | Structural axes frozen (§4 resolved from evidence) | pending S1 |
| **S3** | Ordinary strength graph drafted, every node carrying §8's contract | pending S2 |
| **S4** | Special-pattern contracts, per pattern, each past its own evidence gate | pending S2 |
| **S5** | Holdout audit against corpus B | pending S3/S4 |
| **S6** | Runtime implementation | pending S5 |
| **S7** | Founder blind QA | pending S6 |

**No runtime code before S6.** No exceptions for "just a prototype".

---

## 19. Audit cadence

V1 consumed four full doctrine revisions in a per-commit audit loop. Each revision was internally
consistent; none was professionally meaningful. The loop itself was part of the failure — it rewarded
local coherence over evidential grounding.

**V2 cadence:**

- **No independent audit after every task.**
- Independent audit at **S2/S3–S4 freeze** (doctrine + case graph) and at **S6** (runtime implementation).
- **Founder QA at S7**, after runtime.

Between gates, the work is research, and research is allowed to be provisional.

---

## 20. Next action

**`MYUNGRI_STRENGTH_V2_SOURCE_AND_CASE_CORPUS_BUILD`** — Gate S1.

Scope for that sprint:

1. Fix the corpus schema (§5.4) as a machine-readable file format and validate it on ~5 hand-entered cases.
2. Identify and list retrievable case sources, primarily 滴天髓闡微's own worked discussions, with locators.
3. Enter **100 discovery cases** with full provenance. Original judgment and V2 normalization as separate
   fields.
4. Record, per case, which frozen facts the source's reasoning actually invokes — this is the raw material
   for §4's axis discovery.
5. Produce a **coverage report** against §5.2's categories, naming the gaps rather than filling them.
6. **Explicitly out of scope:** any rule, any graph node, any runtime code, any label schema freeze.

**The next task is not runtime coding.** It is not doctrine writing either. It is building the evidence
base whose absence closed V1.
