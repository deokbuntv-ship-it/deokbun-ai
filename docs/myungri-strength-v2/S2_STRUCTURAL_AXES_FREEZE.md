# S2 — STRUCTURAL AXES FREEZE (P0 REMEDIATION, v2)

**Superseded by the P0 remediation batch (Codex audit 2026-08-28, `C. NOT_READY_FOR_IMPLEMENTATION`,
7 P0s).** This version is deliberately SMALLER than the prior freeze. Nothing here was removed because it
was uninteresting — every reduction below closes a specific, named audit finding. See
`S2_S3_FREEZE_GATE_REPORT.md` for the full P0 closure accounting and `S3_CASE_REPLAY_REPORT.md` for what the
reduction cost in coverage (accepted, per the remediation brief's own standard: "70% meaningful deterministic
outcomes + 30% honest unresolved... over 95% forced outcomes with unsupported rules").

`STRUCTURAL_AXES_READY_TO_FREEZE = YES` at the reduced scope below.

## What changed from the prior freeze

| Axis | Prior status | This version | Why |
|---|---|---|---|
| AX-01 ROOTING | FACT+INFERENCE (functional survival claimed) | **FACT ONLY** — existence/topology; "functional root survival" removed | P0-03/§11/§12 — the frozen `sameElementRooting.ts` service's own `LIMITATIONS` array explicitly disclaims this: `EXISTENCE_FACT_ONLY_NO_ROOT_STRENGTH_NO_ROOT_RANK_NO_SURVIVABILITY_NO_FUNCTIONAL_EFFECTIVENESS`. The prior graph was claiming more than the fact layer promises |
| AX-02 SEASONAL STATE | FACT+INFERENCE (seasonal-load-bearing override) | **FACT ONLY** — raw role enum; cannot autonomously produce STRONG/WEAK | P0-03/§13 — the "override" inference was an invented combination rule not backed by an executable predicate |
| AX-03 RELATION ACTIVATION | FACT+INFERENCE (true/false activation, clash-removes-root) | **FACT + CONTEXT ANNOTATION ONLY** — existence + whether a relation touches a root/season-relevant position; no claimed functional effect | P0-03/§14/§15 — no general relation-precedence/effect rule exists; inventing one risks exactly the false-certainty pattern the audit flagged (confirmed by DTS-GUANSHA-12, where the transparent-root+season test alone would wrongly predict transformation) |
| AX-05 CAPACITY | FROZEN, QUESTION_RELATIVE_AXIS | **DEFERRED_TO_DOMAIN_JUDGES** — removed from Strength V2 entirely | P0-04/§18/§19 — the capacity truth tables were incomplete and several proposed "facts" were undisclosed doctrine inferences (`WEALTH_OUTLET_CHAIN_FACT`, `OFFICER_RESOURCE_CHAIN_FACT`). The architectural insight (STRENGTH != TASK CAPACITY) is preserved; the implementation moves to a future domain-level judge, not this graph |
| AX-06 SPECIAL-STRUCTURE STATUS | FACT+INFERENCE, HIGH_CONFIDENCE + DISPUTED reachable | **CANDIDATE-ceiling only** — `NONE_DETECTED / CANDIDATE / INSUFFICIENT`, no `HIGH_CONFIDENCE`, no `DISPUTED` | P0-01/P0-06/§6/§7/§8 — every positive-predicate set tried during remediation had a real corpus counterexample under close scrutiny (DTS-CONGXIANG-01 has a surviving root yet still follows; DTS-GUANSHA-12 satisfies the transformation test yet does not transform); `DISPUTED` requires two independent EXECUTABLE candidate generators, which do not exist — BR-015's dispute stays documented research evidence only, never runtime-detectable |
| AX-09 NUMEROUSNESS | FACT ONLY, evidence-only by design | **Unchanged** — still fact-only, now with a HARD structural guarantee: no edge in the graph reads its counts to decide anything | P0-05/§4 — confirms the prior design was already correct here; strengthened by making the non-consumption a graph-topology fact (checkable), not just a stated intent |
| AX-10 UNCERTAINTY | ORCHESTRATION_AXIS, qualitative confidence | **Redefined confidence semantics** — `HIGH`/`MODERATE` apply only to `STRONG_LEANING`/`WEAK_LEANING` results and are keyed to two checkable conditions (missing fact, relation-context caveat); `LOW` is implied by `MIXED_EVIDENCE`/`UNRESOLVED`, never separately computed | P1-03/§29 |

## No new axes

Per §38, AX-05's removal was NOT compensated with a replacement axis. The reduced core is 5 axes:
AX-01, AX-02, AX-03, AX-06, AX-09, plus AX-10 as the orchestration layer (6 total, down from 7).

## AX-01 — ROOTING (narrowed)

- **TYPE**: `FACT_DERIVED_AXIS` (demoted from `STRUCTURAL_INFERENCE_AXIS` — no inference layer survives this batch)
- **FACT**: `ROOT_EXISTS ∈ {TRUE, FALSE, UNKNOWN}` — does the party have ANY same-stem root or
  same-element hidden peer at ANY position the birth data actually supplies. `UNKNOWN` (not `FALSE`) when
  the determination depends on an unknown hour pillar (P1-01).
- **Removed**: `ROOT_FUNCTIONALLY_MEANINGFUL` (position-significance weighting, clash-survival claim). No
  root is ever described as "destroyed" or "surviving" a relation in this version.
- **DOWNSTREAM_USE**: `SPECIAL-01` (CANDIDATE precondition), `SYNTH-01` (structural-state lookup).

## AX-02 — SEASONAL STATE (narrowed)

- **TYPE**: `FACT_DERIVED_AXIS` (demoted — no override inference survives)
- **FACT**: `MONTH_COMMAND_ROLE ∈ {IN_COMMAND, SUPPORTED, NEUTRAL, DRAINED, OPPOSED}` — unchanged raw role.
- **Removed**: `SEASONAL_STATE_LOAD_BEARING` (the override mechanism that let a relation flip season's
  contribution). Season is purely descriptive; only `SYNTH-01`'s lookup combines it with rooting.
- **DOWNSTREAM_USE**: `SPECIAL-01`, `SYNTH-01`.

## AX-03 — RELATION CONTEXT (renamed and narrowed from "RELATION ACTIVATION")

- **TYPE**: `FACT_DERIVED_AXIS`
- **FACT**: `RELATION_EXISTS(positions, kind)`, plus two derived booleans: `touchesRootPosition` (does a
  stated relation involve a position already counted for AX-01 — existence overlap only) and
  `transformationGlyphPresent` (is a stated combination one of the five stem-pair transformation glyphs).
- **Removed**: any claim about what a relation DOES (activates, destroys, removes) beyond its bare
  existence and position overlap. An earlier attempt (`TRANSFORM-01`) tried to compute transformation
  EVIDENCE from a transparent-root + seasonal-support test, but was itself removed this batch
  (`NEW-P0-01`): it declared Day-Master-scoped inputs while actually needing result-element-scoped facts
  those inputs do not produce. `transformationGlyphPresent` (does a combination glyph exist at all) is kept
  as a FACT, but is now purely descriptive metadata — no node consumes it for a decision.
  `TRANSFORMATION_JUDGMENT_V2 = DEFERRED`.
- **DOWNSTREAM_USE**: `SYNTH-01` (annotation only — never changes which lookup cell is selected, per
  Option B of §16 of the operation policy).

## AX-05 — CAPACITY: DEFERRED_TO_DOMAIN_JUDGES

Not part of Strength V2. The `CAPACITY(party, loadDomain, ground, time)` concept and the
`WEALTH_LOAD/CONTROL_LOAD/OUTPUT_LOAD` domain split remain a documented architectural insight
(`STRENGTH != TASK CAPACITY`) for a FUTURE domain-level judge (money/career/relationship interpretation) to
build against — this graph exposes `taskCapacities = 'NOT_EVALUATED'` in its output, never a fake verdict.

## AX-06 — SPECIAL-STRUCTURE STATUS (shrunk aggressively)

- **TYPE**: `STRUCTURAL_INFERENCE_AXIS` (kept — this is still a real inference, just a much more modest one)
- **STATES**: `NONE_DETECTED / CANDIDATE / INSUFFICIENT` — **`HIGH_CONFIDENCE` and `DISPUTED` removed**.
- **Rule**: `CANDIDATE` if season is `OPPOSED` AND root is absent (Day-Master-scoped, single disjunct —
  the transformation disjunct that used to exist alongside this was removed this batch, `NEW-P0-01`; see
  `S3_OPERATIONAL_JUDGMENT_GRAPH.md` §2); else `NONE_DETECTED`.
- **What this means in practice**: the graph can flag "this chart shows non-ordinary-structure-suggestive
  facts" but never asserts a following/transformation/dominance VERDICT. A chart the classical corpus
  confidently calls 從財 (e.g. `DTS-CONGXIANG-01`) may correctly resolve to `NONE_DETECTED` here (root
  exists, so the CANDIDATE disjunct doesn't fire) — that is accepted, not a defect: per §8, "accept that
  those cases remain CANDIDATE/INSUFFICIENT in V2. This is preferable to false HIGH_CONFIDENCE."
- **CANDIDATE never gates the strength view.** There is no `SV-01`-style branch node anymore (removed along
  with `HIGH_CONFIDENCE`, since there is nothing left to gate against) — `specialStructureStatus` and
  `strengthClassification` are reported as two independent fields, never merged, never one implying the
  other (P0-02).

## AX-09 — NUMEROUSNESS (unchanged, hardened)

- **TYPE**: `FACT_DERIVED_AXIS`, fact-only by design.
- **Hard contract, now graph-topology-enforced**: no node in `judgment-graph-v2.json` has an edge from
  `FACT-06` (the numerousness fact node) into any decision-bearing node — `FACT-06`'s only `NEXT_NODES`
  entry is the terminal report. This is checkable by inspecting the JSON, not merely asserted in prose.

## AX-10 — UNCERTAINTY (confidence semantics redefined)

- `confidenceClass = HIGH` when the result is `STRONG_LEANING`/`WEAK_LEANING` AND no relation-context
  caveat was recorded.
- `confidenceClass = MODERATE` when the result is `STRONG_LEANING`/`WEAK_LEANING` BUT a relation-context
  caveat exists (a relation touches a position AX-01 already counted, unresolved in its effect).
- `confidenceClass = LOW` is implied by `MIXED_EVIDENCE`/`UNRESOLVED` — never separately computed.
- No numeric confidence anywhere (P1-03).

`S2_AXES = FROZEN_FOR_AUDIT` (at this reduced scope — a future batch may re-expand AX-01/02/03/06 or
reintroduce AX-05 ONLY when a new fact provider makes the missing inference genuinely executable, per
`V2_FACT_EXTENSION_CANDIDATES.md`).
