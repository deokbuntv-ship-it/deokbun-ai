# S2/S3 FREEZE GATE REPORT (P0 REMEDIATION)

Base HEAD: `8ba674ae9ddb8aa7b6ba600f4502d56608e87728`. Batch: P0 remediation of the independent Codex audit's
7 P0 findings against the prior S2/S3 freeze (`C. NOT_READY_FOR_IMPLEMENTATION`). No new research, no new
cases, no corpus expansion, no bridge hunt — productization/executable-spec repair only.

## 1. P0 closure accounting

| P0 | Finding | Fix applied | Status |
|---|---|---|---|
| P0-01 | `SPECIAL-04` high-confidence rule contradicts flagship cases (`DTS-CONGXIANG-01`, `DTS-TIYONG-01/02`, `DTS-CONGXIANG-06`) | Removed `HIGH_CONFIDENCE` entirely from the special-structure enum. `SPECIAL-01` (replacing the whole `SPECIAL-01..04` chain) has a `CANDIDATE` ceiling only, with two disjuncts (root-absence+season-opposed; transformation evidence) that were checked against all 4 flagged cases plus `DTS-GUANSHA-12` and found to have NO surviving false-certainty claim, because there is no certainty claim above `CANDIDATE` left to be false | **CLOSED** |
| P0-02 | Undefined `CANDIDATE-ruled-out` state; missing actual `NOT_APPLICABLE_SPECIAL_STRUCTURE` output | Deleted the pseudo-state. `specialStructureStatus` and `strengthClassification` are now two independent, always-both-present fields — there is no gate, so there is nothing to rule anything out of, and `NOT_APPLICABLE_SPECIAL_STRUCTURE` is removed as a strength-view value (nothing produces `HIGH_CONFIDENCE` to gate against) | **CLOSED** |
| P0-03 | Ordinary structural predicates underdefined (root survival, seasonal override, relation activation/ordering, contradiction handling) | Root and season narrowed to FACT-only (existence / raw role); "functional root survival" and "seasonal override" removed entirely; relation effect claims removed except the narrowly-scoped `TRANSFORM-01` evidence check; contradiction (`MIXED_STRUCTURE`) is now a real, reachable, non-default `SYNTH-01` output | **CLOSED** |
| P0-04 | Capacity state tables incomplete; some proposed facts were doctrine inferences | `CAP-01..04` removed entirely from Strength V2. `taskCapacities` is a reserved `'NOT_EVALUATED'` field. `WEALTH_OUTLET_CHAIN_FACT`/`OFFICER_RESOURCE_CHAIN_FACT` reclassified NOT-A-FACT, moved to future domain-level inference (`V2_FACT_EXTENSION_CANDIDATES.md`) | **CLOSED** |
| P0-05 | Hidden numeric authority (3+ vs 0, threshold semantics, all-three-axis extreme inference) | `EXTREME_*` strength states removed (the "all three axes one-sided" rule was the flagged AND-vote). `AX09_fact` (numerousness) is now graph-topology-enforced fact-only — no edge from `FACT-06` reaches any decision-bearing node, checkable directly in `judgment-graph-v2.json`. Validator's deny-list scans every decision-bearing field for `3+`/`threshold`/`majority`/`vote` language | **CLOSED** |
| P0-06 | `DISPUTED` cannot be produced deterministically (GEJU alternative recognition deferred) | `DISPUTED` removed from the runtime graph entirely. `BR-015` preserved as `KNOWN_SCHOOL_CONFLICT` in research documentation only — no node checks a chart's identity against it or any other case ID (validator's case-ID-in-condition pattern check enforces this) | **CLOSED** |
| P0-07 | `natalStrength.ts` remains an exported callable seven-band verdict authority | Removed `natalStrength.ts`/`currentStrength.ts` exports from `src/features/myungri/index.ts` (the public barrel). Both service files marked `NON_AUTHORITY / REFERENCE_ONLY` in their headers. Their own consistency tests (`natalStrength.test.ts`, `currentStrength.test.ts`) updated to import directly from the service files instead of the barrel — kept alive, not deleted. New enforcing guard test: `src/features/myungri/__tests__/publicSurfaceQuarantine.test.ts`, asserting the barrel does not export `evaluateNatalStrength`/`DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE`/`STRENGTH_LABEL_KO`/`buildCurrentStrengthContext`/`luckInfluence`. Investigated actual consumers first (`currentStrength.ts` was the only internal consumer; it and everything downstream of it has zero real product consumers — confirmed by grepping every barrel import site in `chat`/`compatibility`/`monthly`/`today`/`divination`) | **CLOSED** |

**`P0_REMAINING = 0`.**

## 2. P1 closure accounting

| P1 | Fix | Status |
|---|---|---|
| P1-01 missing hour | One consistent contract: use every fact derivable from year/month/day; only hour-dependent facts become `UNKNOWN`/unavailable, routing the SPECIFIC downstream conclusion to `UNRESOLVED`/`INSUFFICIENT` rather than discarding the chart. Matches `NatalPillarContext`'s own optional `hour` field and `calculateSameElementRooting`'s existing graceful degrade | **CLOSED** |
| P1-02 rooting transparency input | Verified `rootingTransparency.ts`/`sameElementRooting.ts` exports are real (re-grepped this batch); no nonexistent bundle input is cited anywhere in the rewritten docs | **CLOSED** |
| P1-03 uncertainty/confidence | Numeric confidence removed; `HIGH`/`MODERATE`/`LOW` redefined via two checkable conditions (missing fact, relation-context caveat), `LOW` implied by `MIXED_EVIDENCE`/`UNRESOLVED` rather than separately computed | **CLOSED** |
| P1-04 traceability | `SUPPORTING_SOURCE_PROPOSITIONS` (composite `SRC-001:DTS-...` strings) replaced by separate `SOURCE_IDS`/`PROPOSITION_IDS`/`SUPPORTING_CASE_IDS`/`COUNTEREXAMPLE_CASE_IDS` fields; validator cross-references each against the real corpus and rejects the legacy composite field if it reappears | **CLOSED** |
| P1-05 balanced/harmonious cases | No case-specific exception added. `DTS-JINGSHEN-01`/`DTS-BAGE-04` route to whatever cell the root×season lookup honestly produces (`MIXED_EVIDENCE` and `STRONG_LEANING` respectively, re-derived this batch — see `S3_CASE_REPLAY_REPORT.md`'s method note for the DM-identity correction found while doing this) | **CLOSED** |

## 3. Reduction accounting

| Metric | Before (v2.0.1) | After (v3.0.0) |
|---|---|---|
| Graph nodes | 23 | **12** |
| Node types used | 8 | **6** (`BRANCH`, `TASK_CAPACITY` removed) |
| Special-structure states | 5 (incl. `HIGH_CONFIDENCE`, `DISPUTED`) | **3** (`NONE_DETECTED`/`CANDIDATE`/`INSUFFICIENT`) |
| Strength-view states | 7 (incl. 2× `EXTREME_*`, `NOT_APPLICABLE_SPECIAL_STRUCTURE`) | **4** (`WEAK_LEANING`/`STRONG_LEANING`/`MIXED_EVIDENCE`/`UNRESOLVED`) |
| Frozen axes | 7 | **6**, one (`AX-05`) deferred out of scope entirely |
| Task-capacity nodes | 4 (`CAP-01..04`) | **0** — moved to `FUTURE_DOMAIN_JUDGES` |

`EXTREME_STATES_REMOVED = YES`. `CAPACITY_RUNTIME_REMOVED = YES`. `RUNTIME_DISPUTED_REMOVED = YES`.
`RAW_COUNT_SPECIAL_RULE_REMOVED = YES`.

## 4. Required-zero gate (updated set, per remediation §51)

| Item | Status | Evidence |
|---|---|---|
| `UNDEFINED_DECISION_PREDICATES` | **0** | Every `POSITIVE_CONDITIONS`/`REQUIRED_INFERENCES` value is a named enum comparison; validator's deny-list scan finds zero occurrences of `meaningful`/`sufficient`/`strong enough`/`dominant`/`earlier relation`/`live chain` in decision-bearing fields |
| `BROKEN_SEMANTIC_EDGES` | **0** | Validator: 12/12 nodes reachable, all `NEXT_NODES`/`UNCERTAINTY_EXIT.routeTo` resolve to real nodes |
| `HIDDEN_NUMERIC_AUTHORITY` | **0** | Validator's `PROHIBITED_FIELDS` scan (numericScore/weight/confidenceScore/strengthScore/voteCount/supportTally) finds zero hits; deny-list scan for `3+`/`threshold`/`majority`/`vote` finds zero hits in decision-bearing fields |
| `RAW_VOTE_AUTHORITY` | **0** | `AX09_fact` has zero outgoing edges to any decision-bearing node (graph-topology fact, not just a claim) |
| `CASE_MEMORIZATION` | **0** | Validator's case-ID-in-condition pattern check finds zero hits; no node's `REQUIRED_INFERENCES`/`POSITIVE_CONDITIONS` references a specific chart's identity |
| `LLM_VERDICT_AUTHORITY` | **0** | Zero LLM calls in the 12-node graph; validator's LLM-authority pattern check finds zero hits |
| `SECOND_VERDICT_AUTHORITY` | **0** | `natalStrength.ts`/`currentStrength.ts` quarantined from the public barrel (P0-07); `publicSurfaceQuarantine.test.ts` enforces it; `src/features/divination/myungriStrength.ts` remains evidence-only (still returns `UNDETERMINED`) |
| `FOLLOWING_EQUALS_EXTREME_WEAK` | **0** | `EXTREME_*` states removed entirely — there is nothing left for FOLLOWING to be equated with |
| `ROOT_ALWAYS_BREAKS_FOLLOWING` | **0** | Root existence is one of two disjuncts in a `CANDIDATE` test, never a universal gate; validator's universal-gate pattern check finds zero hits |
| `DOC_GRAPH_MISMATCHES` | **0** | `S2_STRUCTURAL_AXES_FREEZE.md`, `DEOKBUNI_CANONICAL_OPERATION_POLICY.md`, and `S3_OPERATIONAL_JUDGMENT_GRAPH.md` were rewritten this batch to describe exactly `judgment-graph-v2.json` v3.0.0's actual node set — no node, state, or field described in prose does not exist in the JSON, and vice versa (spot-checked by re-reading all three against the JSON after every edit) |

**All ten required-zero items verified at 0.**

## 5. Legacy authority (P0-07 detail)

`NATAL_STRENGTH_PUBLIC_VERDICT_AUTHORITY = QUARANTINED` (not deleted — historical implementation and its
own consistency tests preserved, per instruction not to delete what tests/research still need).
`CURRENT_PRODUCTION_CONSUMERS_FOUND = 0` (verified by grepping every barrel-import site across
`chat`/`compatibility`/`monthly`/`today`/`divination` for the specific quarantined symbol names — none
found; `currentStrength.ts` was the only INTERNAL consumer, and it has zero consumers of its own beyond the
now-pruned barrel export). `SECOND_COMPETING_VERDICT_AUTHORITY = 0`.

## 6. No unauthorized change

`FROZEN_KERNEL_CHANGED = NO` (`src/features/divination/` untouched). `FROZEN_FACT_FOUNDATION_CHANGED = NO`
(`src/features/myungri/services/*.ts` fact-computation files untouched — only `index.ts`'s export list and
two file HEADER COMMENTS were edited, plus two existing test files' import paths and one new test file
added, all authorized narrowly by P0-07). `V2_RUNTIME_GRAPH_IMPLEMENTED = NO`. `YONGSHIN_IMPLEMENTED = NO`.
`TODAY_MONTHLY_CHANGED = NO`.

## 7. Validation

See final report §VALIDATION for actual command outputs (tsc, jest — including the P0-07-affected suites,
graph validator, corpus validator, preflight, release-preflight, secret scan).

## 8. Git

One remediation commit, covering: the 6 rewritten `docs/myungri-strength-v2/*.md` files, the rewritten
`data/myungri-strength-v2/judgment-graph-v2.json`, the strengthened `scripts/research/validate-judgment-graph.mjs`,
and the P0-07 code change (`src/features/myungri/index.ts`, two service-file header comments, two test-file
import-path fixes, one new guard test). Owner WIP untouched. No push, no deploy, no merge, no APK build.

## 9. Freeze declarations

`S2_AXES = FROZEN_FOR_AUDIT` (reduced scope). `S3_GRAPH = FROZEN_FOR_AUDIT` (reduced scope).
`MYUNGRI_STRUCTURAL_DOCTRINE_V2 = READY_FOR_ONE_SHORT_CODEX_P0_CLOSURE_REAUDIT`.

Still explicitly NOT production-readiness. If the re-audit passes, runtime implementation begins against
this reduced, smaller graph — not the prior wider one.
