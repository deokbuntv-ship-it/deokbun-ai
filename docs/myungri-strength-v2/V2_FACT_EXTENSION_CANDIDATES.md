# V2 FACT EXTENSION CANDIDATES

Not implemented. Each entry below is justified by a specific graph node (`S3_OPERATIONAL_JUDGMENT_GRAPH.md`)
that needs it — nothing here is speculative. The frozen V1 fact foundation (`src/features/myungri/services/`)
is **not modified** by this document; these are candidates for a FUTURE extension, gated on independent
review, not a to-do list this batch acts on.

| Candidate | Justifying node | What is missing today | Why it is not `DERIVABLE_INFERENCE` |
|---|---|---|---|
| `WEALTH_OUTLET_CHAIN_FACT` — is there a live 식상→재 conversion chain from the party to a specific load target | `CAP-02` (WEALTH_LOAD capacity) | No frozen service currently names "does an outlet chain connect position X to a specific 재성 position" — `tenGodFacts.ts` gives per-position 십신 identity but not chain-connectivity | Chain connectivity between two positions through an intermediate 십신 role is not implicit in any single existing service's output; it requires cross-referencing `relationParticipants.ts` activation state with `tenGodFacts.ts` identity, which no current function composes |
| `OFFICER_RESOURCE_CHAIN_FACT` — is there a live 관인상생 (관→인→일간) conversion chain, and is it intact or broken | `CAP-03` (CONTROL_LOAD capacity) | Same composition gap as above, specific to the 관/인 chain; DTS-YUELING-02 (丙火臨絶 breaks exactly this chain) is the direct case motivating this candidate | Requires the same cross-referencing composition the WEALTH case does |
| `DRAIN_THRESHOLD_FACT` — is the party's own resource-family presence already below a level where more 식상 output is depleting rather than expressive | `CAP-04` (OUTPUT_LOAD capacity) | `familyPresence` gives raw counts; nothing currently distinguishes "healthy outlet" from "already-drained party outputting further" — DTS-JINGSHEN-03 (泄盡) is the motivating case | This is a genuinely new qualitative judgment (not a recount) requiring the same structural-synthesis-style combination this V2 batch is defining for the first time, not a simple service composition |
| `COMPLETE_BRANCH_ALLIANCE_FACT` — does a stated 방합/삼합 leave literally zero elemental trace for the outnumbered party, checked against ALL hidden stems, not only visible ones | `SPECIAL-04` (special-structure compound test, post-Repair-Pass-1) | `sameElementRooting.ts`/`rootingTransparency.ts` already enumerate hidden stems per position; what is missing is an aggregation across the FULL branch set answering "is there truly zero trace of element E anywhere" as a single boolean, rather than per-position facts a caller must combine | Borderline `DERIVABLE_INFERENCE` — likely composable from existing services without a new fact provider; listed here rather than promoted to `DERIVABLE_INFERENCE` in `S3_OPERATIONAL_JUDGMENT_GRAPH.md` §6 only because no existing function currently performs the full-branch aggregation, so a future implementer needs to write (not merely call) this composition |

## Explicitly NOT candidates

- A numeric "how much" for any of the above — every candidate above is a boolean/enum fact, per the
  absolute prohibition on scoring.
- A climate (調候) fact provider — `AX-07` stays deferred as a separate module (policy P3/P7).
- A 격局 (GEJU) naming provider — `AX-08` stays deferred (policy P7).
- Anything the special-structure DISPUTED path (`BR-015`) needs to resolve which of two lineages is
  "right" — that is a doctrine question, not a missing fact, and this batch's policy is to report both
  readings, not to adjudicate.

`V2_FACT_EXTENSION_CANDIDATES = 4, all justified by a named S3 node, none implemented, frozen V1 untouched.`
