# S3 — OPERATIONAL JUDGMENT GRAPH (P0 REMEDIATION, v3.0.0)

Machine-readable graph: [`../../data/myungri-strength-v2/judgment-graph-v2.json`](../../data/myungri-strength-v2/judgment-graph-v2.json).
**Research artifact. Not imported into `src/`. No production code references this file.**

**Rebuilt smaller for the P0 remediation batch** (Codex audit 2026-08-28, `C. NOT_READY_FOR_IMPLEMENTATION`,
7 P0s). 12 nodes, down from 23 in the prior version. 6 node types used (`FACT_CHECK`, `INFERENCE`,
`SPECIAL_SCREEN`, `STRUCTURAL_SYNTHESIS`, `STRENGTH_VIEW`, `UNCERTAINTY_EXIT`) — `BRANCH` and
`TASK_CAPACITY` are gone because nothing in this version needs a gate to branch on, or a capacity verdict
to compute. This is a deliberate reduction, not an oversight: see `S2_S3_FREEZE_GATE_REPORT.md` for the
full P0-by-P0 accounting of what was removed and why.

## 1. Shape

```
FACT-01 (chart completeness, missing-hour-tolerant)
  → FACT-02 (day master identity)
    → FACT-03 (AX-01 root existence)      ┐
    → FACT-04 (AX-02 season role)         ├→ SPECIAL-01 (evidence-only screen: NONE_DETECTED/CANDIDATE/INSUFFICIENT)
    → FACT-05 (AX-03 relation existence)  │     ↓ (never gates anything downstream)
    → FACT-06 (AX-09 numerousness) ───────┘   UNC-FINAL
                                           TRANSFORM-01 (transformation EVIDENCE, not a verdict)
FACT-03 + FACT-04 ─────────────────────→ SYNTH-01 (root × season lookup: ANCHORED/UNANCHORED/MIXED_STRUCTURE/UNRESOLVED)
                                             ↓
                                          SV-01 (1:1 map to WEAK_LEANING/STRONG_LEANING/MIXED_EVIDENCE/UNRESOLVED)
                                             ↓
                                          UNC-FINAL (aggregates BOTH branches — special status AND strength — together)

Any node's UNCERTAINTY_EXIT.condition → UNC-EXIT-INSUFFICIENT
```

`LLM_VERDICT_NODES = 0`. No node is an LLM call.

## 2. What changed from v2.0.1, node by node

| Removed | Why | P0 |
|---|---|---|
| `SPECIAL-02` (root/protector counterevidence test) | Its own general rule (root absence required for `HIGH_CONFIDENCE`) contradicted the case it was built to explain (`DTS-CONGXIANG-01` has a surviving root) — the audit's core P0-01 finding | P0-01 |
| `SPECIAL-04` (special-structure aggregation, `HIGH_CONFIDENCE`/`DISPUTED` outputs) | Replaced by `SPECIAL-01`, a single node with a CANDIDATE ceiling only | P0-01, P0-06 |
| `ORD-01`/`ORD-02`/`ORD-03` (rooting/seasonal/relation INFERENCE nodes) | Rooting and season are now FACT-only (existence/raw role); relation "activation" is not claimed at all except narrowly in `TRANSFORM-01` | P0-03 |
| `SV-01` (the old BRANCH gate: "may a strength view be computed at all?") | Nothing produces `HIGH_CONFIDENCE` anymore, so there is nothing to gate against — the gate is structurally unnecessary, not merely simplified | P0-02 |
| `CAP-01`/`CAP-02`/`CAP-03`/`CAP-04` (task-capacity BRANCH + 3× TASK_CAPACITY nodes) | Moved out of Strength V2 entirely — `taskCapacities` is now a reserved `'NOT_EVALUATED'` field, not computed here | P0-04 |
| `UNC-EXIT-DISPUTED` | `DISPUTED` does not exist as a reachable state | P0-06 |
| The undefined `"CANDIDATE-ruled-out"` pseudo-state (was never a real enum value, only prose) | Deleted along with the gate it used to feed | P0-02 |

| Kept / added | Why |
|---|---|
| `TRANSFORM-01` (new name for the old `SPECIAL-03`) | The transparent-root + seasonal-support test IS genuinely executable as a fact-check — it is its promotion to a `HIGH_CONFIDENCE` VERDICT that was the problem, not the fact-check itself. Demoted to an evidence boolean (`transformationEvidencePresent`), with `DTS-GUANSHA-12` recorded as the exact counterexample to treating it as sufficient |
| `SPECIAL-01` (new, replaces the whole `SPECIAL-01..04` chain) | A single node, two executable disjuncts, `CANDIDATE`-ceiling only |
| `SYNTH-01` | Narrowed to a pure 2-input (root × season) lookup; relation-context is now an ANNOTATION only (Option B of the remediation brief's §16 — "if not [executable]: remove relation-effect dependence from synthesis and treat relation as contextual evidence") |
| `SV-01` (new — a thin 1:1 mapping node, replaces the old gate node of the same name) | Kept as a distinct node from `SYNTH-01` only to preserve the architectural seam ("strength is a subordinate, separately-named view"), even though the mapping is currently trivial |

## 3. Real inference, still present despite the reduction

`SYNTH-01` is still a genuine two-premise inference, not fact paraphrase:

```
Premise 1 (FACT-03): AX01_fact = ROOT_EXISTS_TRUE
Premise 2 (FACT-04): AX02_fact = OPPOSED
        ↓ named lookup, not a score
structuralState = MIXED_STRUCTURE   (root and season genuinely disagree; no rule in this graph resolves it)
```

Changing either premise changes the output through a different NAMED cell, never a different number.
`MIXED_STRUCTURE` is a real, reachable, non-default output — not a leftover catch-all (P0-... "MIXED_EVIDENCE
must be reachable" was an explicit remediation requirement, §17).

## 4. Three worked traces (updated for v3.0.0)

**DTS-JINGSHEN-01** — root exists (坐戌通根), season is not `OPPOSED` (the text describes support, not
opposition). `SPECIAL-01`: neither disjunct fires → `NONE_DETECTED`. `SYNTH-01`: `ROOT_EXISTS_TRUE` +
season in `{IN_COMMAND, SUPPORTED}`-ish → `ANCHORED` → `SV-01` → `STRONG_LEANING`. The source's own
"harmonious flow" (氣貫流通) nuance is not separately captured — this graph does not claim more precision
than its two-input lookup actually has (§4 of the policy). Reported as-is, not force-fit to a bespoke
`BALANCED`.

**DTS-CONGXIANG-01** — root exists at 未 (a governing-ish position) → `AX01_fact = ROOT_EXISTS_TRUE`.
`SPECIAL-01`'s following-disjunct requires `ROOT_EXISTS_FALSE` — it does NOT fire, regardless of the
source's own 從財 conclusion → `specialStructureStatus = NONE_DETECTED`. This is the corrected behavior:
v2.0.1 asserted `HIGH_CONFIDENCE` for this exact chart via a rule that formally required root absence,
which was the specific contradiction P0-01 caught. v3.0.0 makes no following-pattern claim for this chart at
all — an honest absence of evidence, not a false verdict in either direction. `SYNTH-01` still runs
independently: root exists + season presumably supportive → `ANCHORED` → `STRONG_LEANING`, reported
alongside `specialStructureStatus: NONE_DETECTED` as two separate, non-contradictory fields.

**DTS-GUANSHA-12** — combination glyph present (戊癸), transparent root for the resulting fire (day stem
丙) present, month in-command for fire (午) — `TRANSFORM-01` computes `transformationEvidencePresent =
true`. `SPECIAL-01`'s transformation disjunct fires → `CANDIDATE`. The graph does NOT claim
`HIGH_CONFIDENCE`/`TRUE_TRANSFORMATION` — the source's own `不化反喜其合` (does not transform, and that is
actually beneficial) is exactly the reason this test was demoted to evidence-only. `CANDIDATE` here is the
textually honest ceiling.

## 5. No arbitrary defaults

Every enum value is asserted by at least one node's `REQUIRED_INFERENCES` — checked by the strengthened
validator (`node scripts/research/validate-judgment-graph.mjs`, "dead output enum" check, §7 below).
`MIXED_STRUCTURE` and `UNRESOLVED` are two different, deliberately-distinct default-free outputs
(contradiction ≠ missing data).

## 6. Fact-foundation gap classification (updated)

| Graph input | Class | Notes |
|---|---|---|
| `AX01_fact`, `AX02_fact`, `AX03_fact` (existence + context only), `AX09_fact` | `FACT_READY` | Direct frozen-service outputs |
| `TRANSFORM-01`'s transparent-root + seasonal-support check | `DERIVABLE_INFERENCE` | Composable from existing facts, kept as evidence-only |
| Anything task-capacity related | **Out of scope entirely for Strength V2** (P0-04) | Moved to `FUTURE_DOMAIN_JUDGES` — not tracked here as a fact-extension candidate any more, see `V2_FACT_EXTENSION_CANDIDATES.md` |
| A genuinely complete branch-alliance fact (that could someday unlock a real `HIGH_CONFIDENCE` special-structure route) | `V2_FACT_EXTENSION_REQUIRED`, unbuilt | See `V2_FACT_EXTENSION_CANDIDATES.md` — `NEW_FACT_PROVIDERS_REQUIRED` is reported honestly, not padded to look smaller |

## 7. Validator

`scripts/research/validate-judgment-graph.mjs`, strengthened this batch: unique node IDs, edge resolution,
orphan detection, dead-output-enum best-effort check, a deny-list for threshold/vote/majority/"meaningful"
language inside decision-bearing fields, an LLM-authority pattern check, a case-ID-in-condition pattern
check (case-memorization guard), a universal-root-gate pattern check, and cross-reference of every
`SOURCE_IDS`/`SUPPORTING_CASE_IDS`/`COUNTEREXAMPLE_CASE_IDS` entry against the real corpus files
(`discovery-cases.json`, `bridge-cases.json`, `sources.json`) so a stale or invented reference fails loudly.
`SUPPORTING_SOURCE_PROPOSITIONS` (the old composite `SRC-001:DTS-...` field) is now explicitly rejected if
present — replaced by separate `SOURCE_IDS`/`PROPOSITION_IDS` namespaces (P1-04). Run:
`node scripts/research/validate-judgment-graph.mjs`.

`S3_GRAPH = FROZEN_FOR_AUDIT` at this reduced scope.
