# V2 FACT EXTENSION CANDIDATES (P0 REMEDIATION, revised)

Not implemented. Revised per the Codex audit's §21 review — every prior candidate re-classified, most
removed. `NEW_FACT_PROVIDERS_REQUIRED = 0` for the reduced v3.0.0 graph: nothing in
`judgment-graph-v2.json` currently needs a fact provider that does not already exist.

## Disposition of the prior candidates

| Prior candidate | Disposition | Why |
|---|---|---|
| `WEALTH_OUTLET_CHAIN_FACT` | **NOT A FACT — moved to future domain-level inference.** No longer tracked as a Strength V2 candidate | It was never a deterministic FACT in the first place — "does an outlet chain connect position X to a specific 재성 position" is a doctrine judgment about chain sufficiency, which is exactly the kind of undisclosed inference §4/P0-04 flags. It belongs to a FUTURE money/wealth domain judge, not to this graph, which no longer computes task capacity at all |
| `OFFICER_RESOURCE_CHAIN_FACT` | **NOT A FACT — moved to future domain-level inference.** No longer tracked | Same reasoning as above, for the 관인상생 chain — a future career/control domain judge's concern, not Strength V2's |
| `DRAIN_THRESHOLD_FACT` | **DELETED.** No longer tracked in any form | It was explicitly a threshold ("is the party's own resource-family presence already below a level where...") — exactly the hidden-numeric-authority pattern P0-05 forbids. Not deferred, not renamed — removed outright |
| `COMPLETE_BRANCH_ALLIANCE_FACT` | **DEFERRED, not built.** Would be needed only if a future batch wants to re-attempt a `HIGH_CONFIDENCE` special-structure route; not required by anything in the current v3.1.0 graph | The current graph does not attempt to compute this — `SPECIAL-01`'s CANDIDATE test uses only root-existence and season-role, neither of which needs it. Composability note preserved for a future batch: `sameElementRooting.ts`/`rootingTransparency.ts` already enumerate hidden stems per position, so a full-branch "zero elemental trace anywhere" aggregation is likely composable from EXISTING exports without a new provider — but no current graph node calls for it, so it is not built now |
| `RESULT_ELEMENT_SCOPED_ROOT_AND_SEASON_FACT` (new entry, added this batch) | **DEFERRED, not built.** Would be required before any transformation-based special-structure disjunct could safely return (`NEW-P0-01`) | The removed `TRANSFORM-01` node assumed this was trivially composable from `sameElementRooting.ts`/`generalSeasonalPhase.ts` by "just checking a different element" — that assumption was never actually wired as a declared input, and turned out to be exactly the gap the second-pass audit caught. Recorded here explicitly so a future attempt starts from an honest requirement instead of repeating the same unverified assumption |

## Current V2 fact-extension requirement

**`NEW_FACT_PROVIDERS_REQUIRED = 0`.** Every input `judgment-graph-v2.json` v3.1.0 actually uses
(`AX01_fact`, `AX02_fact`, `AX03_fact`, `AX09_fact` — all Day-Master- or existence-scoped) is composable
from already-existing frozen exports:

- `sameElementRooting.ts` → `AX01_fact`
- `generalSeasonalPhase.ts` / `monthCommand.ts` → `AX02_fact`
- `relationParticipants.ts` / `natalRelations.ts` → `AX03_fact`
- `tenGodFacts.ts` / `myungriJudge.ts:tenGodFamily()` → `AX09_fact`

No fact in the current graph needs anything beyond these. The `TRANSFORM-01` node that used to need a
result-element-scoped variant of `sameElementRooting.ts`/`generalSeasonalPhase.ts` was removed this batch —
see `RESULT_ELEMENT_SCOPED_ROOT_AND_SEASON_FACT` above.

## Explicitly NOT candidates (unchanged from the prior version, still true)

- Any numeric "how much" for any fact — every candidate is boolean/enum, per the absolute prohibition on
  scoring.
- A climate (調候) fact provider — deferred, separate module forever.
- A 격局 (GEJU) naming provider — deferred.
- Anything a `DISPUTED` runtime state would need to resolve which of two lineages is "right" — `DISPUTED`
  itself is removed from the runtime graph (P0-06); this is not a missing-fact problem, it is a scope
  decision.
- Any task-capacity fact (`WEALTH_LOAD`/`CONTROL_LOAD`/`OUTPUT_LOAD` truth tables) — entirely out of Strength
  V2 scope now (P0-04); belongs to a future domain-level judge's own fact-extension list, not this one.

`V2_FACT_EXTENSION_CANDIDATES = 0 active, 1 deferred-and-unneeded (COMPLETE_BRANCH_ALLIANCE_FACT), 3
removed/relocated out of scope. Frozen V1 fact foundation untouched.`
