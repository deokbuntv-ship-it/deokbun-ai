# S3 — OPERATIONAL JUDGMENT GRAPH (P0 REMEDIATION, v3.1.0)

Machine-readable graph: [`../../data/myungri-strength-v2/judgment-graph-v2.json`](../../data/myungri-strength-v2/judgment-graph-v2.json).
**Research artifact. Not imported into `src/`. No production code references this file.**

**v3.1.0 — final single-P0 closure patch, same audit round as the P0 remediation batch.** A second-pass
Codex re-audit found ONE new defect (`NEW-P0-01`) in the v3.0.0 graph: `TRANSFORM-01` declared
Day-Master-scoped `INPUT_FACTS` (`AX01_fact`/`AX02_fact`) but its `REQUIRED_INFERENCES` actually needed
result-element-scoped values (`transparentRootForResultElement`, `resultElementMonthRole`) that those
inputs do not produce — making `transformationEvidencePresent` nondeterministic. Fixed by REMOVING
`TRANSFORM-01` and the transformation disjunct from `SPECIAL-01` entirely, not by rebinding it to a
correctly-scoped input. **11 nodes, down from 12 (23 in the original freeze).** 6 node types used
(`FACT_CHECK`, `INFERENCE`, `SPECIAL_SCREEN`, `STRUCTURAL_SYNTHESIS`, `STRENGTH_VIEW`,
`UNCERTAINTY_EXIT`).

## 1. Shape

```
FACT-01 (chart completeness, missing-hour-tolerant)
  → FACT-02 (day master identity)
    → FACT-03 (AX-01 root existence)      ┐
    → FACT-04 (AX-02 season role)         ├→ SPECIAL-01 (evidence-only screen: NONE_DETECTED/CANDIDATE/INSUFFICIENT)
    → FACT-05 (AX-03 relation existence) ─┘     ↓ (never gates anything downstream)
    → FACT-06 (AX-09 numerousness) ────────────→ UNC-FINAL

FACT-03 + FACT-04 ─────────────────────→ SYNTH-01 (root × season lookup: ANCHORED/UNANCHORED/MIXED_STRUCTURE/UNRESOLVED)
                                             ↓
                                          SV-01 (1:1 map to WEAK_LEANING/STRONG_LEANING/MIXED_EVIDENCE/UNRESOLVED)
                                             ↓
                                          UNC-FINAL (aggregates BOTH branches — special status AND strength — together)

Any node's UNCERTAINTY_EXIT.condition → UNC-EXIT-INSUFFICIENT
```

`LLM_VERDICT_NODES = 0`. No node is an LLM call.

## 2. Transformation judgment deferred (NEW-P0-01)

**`TRANSFORMATION_JUDGMENT_V2 = DEFERRED`.** There is no transformation-based special-structure route in
this graph. This is a deliberate scope decision, not a missing Fact Foundation defect.

Why the removed node was wrong: `TRANSFORM-01` asked "does the transformed element have a transparent
root AND month-command support" — a legitimate question, but about the RESULT of a stem combination
(e.g. 丁+壬 → 木), not about the Day Master. Its `INPUT_FACTS` listed `AX01_fact`/`AX02_fact`, which this
graph defines strictly as Day-Master-scoped (`AX01_fact` = does the Day Master have a root;
`AX02_fact` = the Day Master's own month-command role). Nothing in the declared fact layer computes an
equivalent pair of facts for an arbitrary OTHER element (the transformation's result). The node's own
`REQUIRED_INFERENCES` therefore silently required two values — `transparentRootForResultElement`,
`resultElementMonthRole` — that its declared inputs never actually produce. That gap is exactly what made
`transformationEvidencePresent` nondeterministic: two different implementers, both honoring the DECLARED
input contract, could not agree on what to compute.

**Fix applied**: `TRANSFORM-01` removed. `SPECIAL-01`'s transformation disjunct removed — the special
screen now has exactly ONE disjunct (Day-Master root-absence + Day-Master season-opposed). No replacement
transformation rule was added, per explicit instruction. `AX03_fact.transformationGlyphPresent` (does a
stated combination glyph exist at all) is KEPT as a fact, but is now purely descriptive metadata carried to
`UNC-FINAL` — no node consumes it for any decision.

**What this costs**: charts like `DTS-HUAXIANG-03` (真化, a genuine transformation case) now resolve to
`specialStructureStatus: NONE_DETECTED` (the Day Master itself has a root, so even the surviving disjunct
doesn't fire) rather than `CANDIDATE`. This is a disclosed capability loss, consistent with the whole
remediation's standard: smaller and correct beats broader and nondeterministic.

**What would undefer this**: a genuinely result-element-scoped fact provider (computing root/season facts
for an arbitrary target element, not just the Day Master) would need to be built and declared as its own
input before a transformation disjunct could return. Not attempted this batch, per explicit instruction not
to add new facts.

## 3. What changed from v2.0.1 → v3.0.0 → v3.1.0, node by node

| Removed (v3.0.0, from v2.0.1) | Why | P0 |
|---|---|---|
| `SPECIAL-02` (root/protector counterevidence test) | Its own general rule (root absence required for `HIGH_CONFIDENCE`) contradicted the case it was built to explain (`DTS-CONGXIANG-01` has a surviving root) | P0-01 |
| `SPECIAL-04` (special-structure aggregation, `HIGH_CONFIDENCE`/`DISPUTED` outputs) | Replaced by `SPECIAL-01`, a single node with a CANDIDATE ceiling only | P0-01, P0-06 |
| `ORD-01`/`ORD-02`/`ORD-03` (rooting/seasonal/relation INFERENCE nodes) | Rooting and season are now FACT-only (existence/raw role) | P0-03 |
| the OLD `SV-01` (BRANCH gate: "may a strength view be computed at all?") | Nothing produces `HIGH_CONFIDENCE` anymore, so there is nothing to gate against | P0-02 |
| `CAP-01`/`CAP-02`/`CAP-03`/`CAP-04` | Moved out of Strength V2 entirely | P0-04 |
| `UNC-EXIT-DISPUTED`, the undefined `"CANDIDATE-ruled-out"` pseudo-state | `DISPUTED` removed; nothing left to rule out | P0-02, P0-06 |

| Removed (v3.1.0, from v3.0.0) | Why | P0 |
|---|---|---|
| `TRANSFORM-01` | Declared Day-Master-scoped inputs, needed result-element-scoped facts — nondeterministic as specified | NEW-P0-01 |
| The transformation disjunct in `SPECIAL-01` | Depended on `TRANSFORM-01`'s output | NEW-P0-01 |

| Kept (v3.1.0) | Why |
|---|---|
| `SPECIAL-01` (now single-disjunct) | Root-absence + season-opposed remains fully executable from Day-Master-scoped facts alone |
| `SYNTH-01` | Pure 2-input (root × season) lookup; relation-context is an ANNOTATION only |
| `SV-01` (thin 1:1 mapping node) | Preserves the architectural seam ("strength is a subordinate, separately-named view") |

## 4. Real inference, still present despite the reduction

`SYNTH-01` is still a genuine two-premise inference, not fact paraphrase:

```
Premise 1 (FACT-03): AX01_fact = ROOT_EXISTS_TRUE
Premise 2 (FACT-04): AX02_fact = OPPOSED
        ↓ named lookup, not a score
structuralState = MIXED_STRUCTURE   (root and season genuinely disagree; no rule in this graph resolves it)
```

Changing either premise changes the output through a different NAMED cell, never a different number.
`MIXED_STRUCTURE` is a real, reachable, non-default output.

## 5. Three worked traces (updated for v3.1.0)

**DTS-JINGSHEN-01** — Day Master 丙 has a root (self-seated at day branch 寅), season is `OPPOSED` (month
子, winter water directly conquers fire). `SPECIAL-01`: root exists, so the single surviving disjunct does
not fire → `NONE_DETECTED`. `SYNTH-01`: `ROOT_EXISTS_TRUE` + `OPPOSED` → `MIXED_STRUCTURE` → `SV-01` →
`MIXED_EVIDENCE`. (Corrected this batch from an earlier hand-computation error that misidentified the Day
Master — see `S3_CASE_REPLAY_REPORT.md` method note.)

**DTS-CONGXIANG-01** — root exists at 未 → `AX01_fact = ROOT_EXISTS_TRUE`. `SPECIAL-01`'s single disjunct
requires `ROOT_EXISTS_FALSE` — does NOT fire, regardless of the source's own 從財 conclusion →
`specialStructureStatus = NONE_DETECTED`. `SYNTH-01`, corrected this batch: season is `DRAINED` (not the
`SUPPORTED` originally claimed) → `ROOT_EXISTS_TRUE` + `DRAINED` → `MIXED_STRUCTURE` → `MIXED_EVIDENCE`.
This is now a BETTER match to the source's own complicated verdict than the prior batch's `STRONG_LEANING`
was — root and season genuinely pointing in different directions is closer to what a compound 從財 judgment
is actually weighing, even though this graph does not attempt that judgment itself.

**DTS-HUAXIANG-03** — combination glyph present (丁壬), but with `TRANSFORM-01` removed, this fact is now
purely descriptive metadata. `SPECIAL-01` evaluates only its single disjunct: Day Master 壬 has a root
(same-element peer 癸 hidden in hour branch 辰) → does NOT fire → `specialStructureStatus = NONE_DETECTED`.
This chart no longer receives any special-structure flag — the direct, disclosed cost of deferring
transformation judgment (§2).

## 6. No arbitrary defaults

Every enum value is asserted by at least one node's `REQUIRED_INFERENCES` — checked by the strengthened
validator's "dead output enum" check (§8). `MIXED_STRUCTURE` and `UNRESOLVED` remain two different,
deliberately-distinct default-free outputs.

## 7. Fact-foundation gap classification (updated)

| Graph input | Class | Notes |
|---|---|---|
| `AX01_fact`, `AX02_fact`, `AX03_fact` (existence + context only, including the now-purely-descriptive `transformationGlyphPresent`), `AX09_fact` | `FACT_READY` | Direct frozen-service outputs |
| Anything task-capacity related | **Out of scope entirely for Strength V2** (P0-04) | Moved to `FUTURE_DOMAIN_JUDGES` |
| Result-element-scoped root/season facts (what `TRANSFORM-01` needed) | `NOT_CURRENTLY_EXECUTABLE`, not built | Would be required before any transformation disjunct could return — deliberately not pursued this batch |
| A genuinely complete branch-alliance fact | `V2_FACT_EXTENSION_REQUIRED`, unbuilt | See `V2_FACT_EXTENSION_CANDIDATES.md` |

`NEW_FACT_PROVIDERS_REQUIRED = 0` this batch — the fix was removal, not a new provider.

## 8. Validator

`scripts/research/validate-judgment-graph.mjs`, strengthened again this batch with an "undeclared
variable reference" heuristic aimed specifically at the `NEW-P0-01` class of defect: for every node, every
camelCase identifier appearing in `REQUIRED_INFERENCES` must appear in that node's own `INPUT_FACTS` text,
some node's `OUTPUT.field`/`OUTPUT.shape`, or the graph's known enum vocabulary — otherwise it is flagged
as a possible nondeterministic reference. This check caught two false positives during development
(explanatory prose that named the just-removed bad identifiers, and a node computing its own sub-field);
both were resolved by moving explanatory text out of `REQUIRED_INFERENCES` into `DOES_NOT_IMPLY` and by
teaching the check to also recognize a node's own `OUTPUT.shape` — not by weakening the check. Also
retained from the prior batch: unique node IDs, edge resolution, orphan detection, dead-output-enum check,
a deny-list for threshold/vote/majority/"meaningful" language, an LLM-authority pattern check, a
case-ID-in-condition pattern check, a universal-root-gate pattern check, and cross-reference of every
`SOURCE_IDS`/`SUPPORTING_CASE_IDS`/`COUNTEREXAMPLE_CASE_IDS` entry against the real corpus files. Run:
`node scripts/research/validate-judgment-graph.mjs`.

`S3_GRAPH = FROZEN_FOR_AUDIT` at this further-reduced scope.
