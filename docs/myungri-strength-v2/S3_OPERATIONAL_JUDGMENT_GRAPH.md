# S3 — OPERATIONAL JUDGMENT GRAPH

Machine-readable graph: [`../../data/myungri-strength-v2/judgment-graph-v2.json`](../../data/myungri-strength-v2/judgment-graph-v2.json).
**Research artifact. Not imported into `src/`. No production code references this file.**

23 nodes, all 8 required `NODE_TYPE`s represented, one entry node (`FACT-01`), three terminal
`UNCERTAINTY_EXIT` nodes. Every node carries the full field set the brief requires
(`NODE_ID`/`NODE_TYPE`/`QUESTION`/`INPUT_FACTS`/`REQUIRED_INFERENCES`/`POSITIVE_CONDITIONS`/
`COUNTEREVIDENCE`/`SCHOOL_SCOPE`/`SUPPORTING_SOURCE_PROPOSITIONS`/`SUPPORTING_CASE_IDS`/
`COUNTEREXAMPLE_CASE_IDS`/`OUTPUT`/`UNCERTAINTY_EXIT`/`NEXT_NODES`/`DOES_NOT_IMPLY`) — this document
explains the shape; the JSON is the authority for exact field values.

## 1. Shape

```
FACT-01..06 (FACT_CHECK ×6)
        ↓
SPECIAL-01,02,03 (INFERENCE ×3) → SPECIAL-04 (SPECIAL_SCREEN)
        ↓ (only if not DISPUTED/INSUFFICIENT)
   ┌─── HIGH_CONFIDENCE ──────────────────→ UNC-FINAL (strength view gated off, special result stands alone)
   │
   └─── NONE_DETECTED/CANDIDATE-ruled-out
        ↓
ORD-01,02,03 (INFERENCE ×3)
        ↓
SYNTH-01 (STRUCTURAL_SYNTHESIS)
        ↓
   ┌─────────────────┬──────────────────┐
CAP-01 (BRANCH)   SV-01 (BRANCH)
   ↓                  ↓
CAP-02/03/04       SV-02 (STRENGTH_VIEW)
(TASK_CAPACITY ×3)     ↓
   └──────────────────┴──────────────→ UNC-FINAL (UNCERTAINTY_EXIT)

Any node's UNCERTAINTY_EXIT.condition → UNC-EXIT-INSUFFICIENT (UNCERTAINTY_EXIT)
SPECIAL-04 = DISPUTED → UNC-EXIT-DISPUTED (UNCERTAINTY_EXIT)
```

`LLM_VERDICT_NODES = 0`. No node in the graph is an LLM call or references one — every node is a
deterministic lookup/aggregation over frozen-engine facts and the compound tests defined in
`DEOKBUNI_CANONICAL_OPERATION_POLICY.md`. An LLM downstream of this graph may only explain a
`finalReport`/`strengthClassification`/`specialStructureStatus`/`taskCapacities` it already received —
per the existing kernel's own rule (`contracts.ts`: "PROSE layer may explain but never reverse/weaken the
verdict").

## 2. Real multi-premise inference, not paraphrase

The brief requires genuine Premise-A + Premise-B + Premise-C → Inference structure, not fact restatement.
The clearest example is `SPECIAL-04` (the special-structure screen), which is a compound test over three
independently-computed prior inferences, none of which alone determines the output:

```
Premise 1 (SPECIAL-01): extreme seasonal opposition AND extreme numerousness imbalance — TRUE
Premise 2 (SPECIAL-02): outnumbered party's governing-position root survives clash — FALSE (no surviving root)
Premise 3 (SPECIAL-03): a transformation glyph is present and genuinely activates — N/A (not a transformation case)
        ↓ compound rule (policy P2), not a weighted sum, not a vote
SPECIAL_PATTERN_STATUS = HIGH_CONFIDENCE
```

Changing any ONE premise changes the output through a different named path, not a different number:
DTS-CONGXIANG-01 has Premise 1 = TRUE and Premise 2 = TRUE (root survives at 월지) yet still resolves to a
following pattern, because SPECIAL-02's own counterevidence note is that root survival alone is not
sufficient — the compound rule additionally requires an outlet/protector for that root to actually oppose
the surrounding party, and none exists in that chart. This is the R11 refutation encoded structurally,
not as a `ROOT_PRESENT ⇒ NOT_FOLLOWING` shortcut (forbidden, required-zero gate item).

## 3. Three worked traces

**DTS-JINGSHEN-01 (ordinary, `ANCHORED_WITH_SEASONAL_SUPPORT`)** — 甲 day master, 坐戌通根 (root),
寅戌拱之 (seasonal support), 官生印印生身 (an active, non-broken support chain). FACT-01→06 resolve
cleanly. SPECIAL-01: numerousness/seasonal imbalance not extreme (roles are supportive, not one-sided) →
`oneSidednessDetected = false` → SPECIAL-04 = `NONE_DETECTED` → SV-01 gate passes. ORD-01 = `ROOTED`
(戌, a 월/일지-class position). ORD-02 = `LOAD_BEARING` (no override found). SYNTH-01 =
`ANCHORED_WITH_SEASONAL_SUPPORT`. SV-02 = `STRONG_LEANING`. Matches source's own `官來能挡` capacity
language via CAP-03 (`CONTROL_LOAD = SUPPORTED`, the 官生印 chain is live) rather than folding that
capacity-adjacent phrase into the global strength read (policy discipline: capacity language stays scoped
to CAP nodes, never smuggled into SV-02).

**DTS-CONGXIANG-01 (special-structure, gated)** — 乙木 with 蟠根在未 (root) and 四柱皆財 (extreme
numerousness against it). SPECIAL-01 = `true` (extreme imbalance). SPECIAL-02: root exists at 월지-class
未, survives (no clash) — BUT the compound rule at SPECIAL-04 also asks whether an outlet/protector exists
for that root to actually resist 財; none does (no 比劫 reinforcement, no 印 to convert). SPECIAL-04 =
`HIGH_CONFIDENCE` (following). SV-01 gate: `strengthViewApplicable = false`. SV-02 is **not reached** — the
chart's strength-view field reports `NOT_APPLICABLE_SPECIAL_STRUCTURE`, not `EXTREME_WEAK_LEANING`. This is
the direct enforcement of the hard rule and the reason DTS-CONGXIANG-01 is the flagship counterexample cited
at SPECIAL-02.

**BR-015 (cross-lineage, `DISPUTED`)** — 乙酉乙酉乙酉甲申. SPECIAL-01 = `true` (all-metal officer-star
field against a rootless 乙). SPECIAL-02: no surviving root for 乙 anywhere (all four branches are 酉/申
metal) → root counterevidence absent. Under 沈孝瞻's reading this is exactly `HIGH_CONFIDENCE` 棄命從煞.
But 萬民英's 三命通會 entry for the identical chart classifies it under a structurally different construct
(胞胎格, a self-seated-絶地 "fetal origin" pattern treated like an 印格 analogue) with no documented scope
split from 沈孝瞻's reading — same chart, same apparent premises, two named `CANONICAL`-tier authorities,
incompatible structural classification. Per policy §6, SPECIAL-04 = `DISPUTED`, routing to
`UNC-EXIT-DISPUTED` with both candidate readings reported by name rather than the graph silently picking
沈孝瞻 (the numerically "more following-like" reading) over 萬民英.

## 4. What each `NODE_TYPE` is for in this graph

| NODE_TYPE | Count | Nodes |
|---|---|---|
| FACT_CHECK | 6 | FACT-01..06 |
| INFERENCE | 6 | SPECIAL-01, SPECIAL-02, SPECIAL-03, ORD-01, ORD-02, ORD-03 |
| BRANCH | 2 | CAP-01, SV-01 |
| SPECIAL_SCREEN | 1 | SPECIAL-04 |
| TASK_CAPACITY | 3 | CAP-02, CAP-03, CAP-04 |
| STRUCTURAL_SYNTHESIS | 1 | SYNTH-01 |
| STRENGTH_VIEW | 1 | SV-02 |
| UNCERTAINTY_EXIT | 3 | UNC-EXIT-INSUFFICIENT, UNC-EXIT-DISPUTED, UNC-FINAL |
| **Total** | **23** | |

## 5. No arbitrary defaults

Every branch point has an explicit named output for every input combination it can receive — there is no
"if ambiguous, default to BALANCED" anywhere in the JSON. Contradictory structural evidence at `SYNTH-01`
routes to the named state `MIXED_STRUCTURE`, which `SV-02` maps to the named classification `UNRESOLVED` —
never silently to `BALANCED_OR_MIXED` (a different state: `BALANCED_OR_MIXED` means the axes genuinely
point to a middle reading, e.g. `ANCHORED_WITHOUT_SEASONAL_SUPPORT`; `UNRESOLVED` means the axes
*contradict* each other). This distinction is why `MIXED_STRUCTURE` and `BALANCED_OR_MIXED` are kept as two
different named states rather than merged — contradiction ≠ neutral (preserved kernel doctrine, §2 of
`contracts.ts`: "`MIXED` is deliberately NOT a stance").

## 6. Fact-foundation gap classification

| Graph input | Class | Notes |
|---|---|---|
| AX01_fact (rooting), AX02_fact (seasonal role), AX03_fact (relations), AX09_fact (numerousness) | `FACT_READY` | Direct frozen-service outputs (`sameElementRooting.ts`, `generalSeasonalPhase.ts`, `relationParticipants.ts`/`natalRelations.ts`, `tenGodFacts.ts`) |
| ORD-01 clash-survival check, ORD-02 override check, SPECIAL-03 transformation-activation check | `DERIVABLE_INFERENCE` | Computable from existing frozen facts with no new fact provider; this is exactly what a future reasoner does with the existing `future.rootFunction`/`relationEffect` seam in `strengthFactBundle.ts` |
| CAP-02/03/04 outlet-chain / 관인상생-chain facts | `V2_FACT_EXTENSION_REQUIRED` | No existing frozen service directly names "is there a live conversion chain from X to Y" — see `V2_FACT_EXTENSION_CANDIDATES.md` |
| A full load-domain taxonomy beyond WEALTH/CONTROL/OUTPUT | `NOT_CURRENTLY_EXECUTABLE` | No corpus evidence supports a 4th load family this batch; left out rather than guessed |

## 7. Kernel-integration contract (§54, draft only)

See `DEOKBUNI_CANONICAL_OPERATION_POLICY.md` §7–§8 for the full conceptual result shape and the alignment
table against `src/features/divination/myungriStrength.ts`'s F1–F4 factors. This graph's `finalReport` at
`UNC-FINAL` is the direct analogue of that kernel's `ambiguities[]`/`confidence`/`classificationBlocker`
triple — the graph fills in exactly the gap that module's own comment names as missing ("월령-vs-통근
priority weighting... band boundaries").

## 8. Repair history

**Repair Pass 1** (`v2.0.0` → `v2.0.1`, applied during case replay): the original `SPECIAL-04` compound
test used only "extreme one-sidedness + root absence" to grant `HIGH_CONFIDENCE`. Replaying the ordinary
`SHUAIWANG` chapter cases (DTS-SHUAIWANG-04/06/08/09/10/12/13/14) and the `GANGROU` cases (旺之極矣, no
stated capitulation) showed this over-triggers: those charts are rootless AND extreme by season+numerousness,
yet the corpus tags them `ORDINARY_STRENGTH`, not `SPECIAL_PATTERN` — none states a surrender/following
relation, they are managed via ordinary 用神 selection instead. The compound test now additionally requires
either a genuinely complete branch alliance leaving zero elemental presence for the outnumbered party
(including hidden stems), or a confirmed `TRUE_TRANSFORMATION` from `SPECIAL-03` — extreme season+numerousness
alone resolves to `CANDIDATE`, which `SV-01` rules out (ordinary strength computation proceeds) absent that
further conjunct. Full before/after case accounting: `S3_CASE_REPLAY_REPORT.md` §Repair Pass 1. This was the
only structural repair applied; no second pass was needed (cap was 2).

## 9. Validator

`scripts/research/validate-judgment-graph.mjs` (research-tooling-only, not imported by production code)
checks: unique `NODE_ID`s, every `NEXT_NODES` entry resolves to a real node ID or a documented external
label, no orphan nodes (every non-entry node reachable from `FACT-01`), every `UNCERTAINTY_EXIT.routeTo`
(when non-null) resolves to an `UNCERTAINTY_EXIT`-type node, every node has all 14 required fields
non-missing, `NODE_TYPE` is one of the 8 allowed values, and the JSON contains none of the `PROHIBITED_FIELDS`
named at the top of the graph file (`numericScore`, `weight`, `confidenceScore`, `strengthScore`,
`voteCount`, `supportTally`) anywhere in the tree. Exits non-zero on any violation. Run: `node
scripts/research/validate-judgment-graph.mjs`.

`S3_GRAPH = FROZEN_FOR_AUDIT` (see `S2_S3_FREEZE_GATE_REPORT.md` for the full gate accounting).
