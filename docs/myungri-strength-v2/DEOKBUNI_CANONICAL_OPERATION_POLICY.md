# DEOKBUNI CANONICAL OPERATION POLICY — MYUNGRI STRUCTURAL JUDGMENT V2

> Governs how Deokbuni resolves school disagreement operationally. This is a **product policy**, not a
> historical-scholarship verdict.

**Rewritten for the P0 remediation batch (Codex audit 2026-08-28, `C. NOT_READY_FOR_IMPLEMENTATION`, 7
P0s).** The prior version of this policy described a graph that claimed more certainty than the frozen fact
layer and the corpus evidence actually support (`HIGH_CONFIDENCE` special structure, `DISPUTED` as a runtime
state, extreme strength bands, task-capacity verdicts). Every one of those claims is removed or narrowed
below. See `S2_S3_FREEZE_GATE_REPORT.md` for the full P0-by-P0 closure accounting.

## 0. What this document is not

Not a claim that a removed reading is historically wrong, and not a claim the reduced graph is "the smart
version." `CONFLICT_REGISTER.md` and `COUNTEREXAMPLE_REGISTER.md` remain the honest scholarly record. This
document governs what the RUNTIME GRAPH may assert with full confidence — which is now deliberately less
than what the scholarship supports, because full confidence requires a fully executable rule, and several
rules this program previously relied on turned out not to be one.

## 1. Architecture — strength is a derived view, reported independently of special-structure evidence

```
DETERMINISTIC FACTS (frozen src/features/myungri services)
        ↓
FACT LAYER (AX-01 rooting existence, AX-02 seasonal role, AX-03 relation existence + context, AX-09 count)
        ↓                                              ↓
SPECIAL-STRUCTURE SCREEN (AX-06)               STRUCTURAL SYNTHESIS (root × season lookup)
   → NONE_DETECTED / CANDIDATE / INSUFFICIENT           ↓
   (never gates or blocks the other branch)      STRENGTH VIEW (WEAK_LEANING / STRONG_LEANING /
        ↓                                          MIXED_EVIDENCE / UNRESOLVED)
        └──────────────────┬───────────────────────────┘
                            ↓
              UNCERTAINTY + PROVENANCE (both fields reported together, independently)
```

**This is a structural change from the prior version.** Previously, a `HIGH_CONFIDENCE` special-structure
verdict GATED the strength view off, producing `NOT_APPLICABLE_SPECIAL_STRUCTURE`. That gate is gone because
`HIGH_CONFIDENCE` is gone (P0-01) — there is nothing left to gate. `specialStructureStatus` and
`strengthClassification` are now two INDEPENDENT fields on every result, always both present, never one
implying the other. A reader who sees `specialStructureStatus: CANDIDATE` alongside
`strengthClassification: STRONG_LEANING` is seeing an honest report of two separately-computed, possibly
tension-holding facts about the chart — not a contradiction the graph failed to resolve. Resolving that
tension (is this really an ordinary strong chart, or does the following-pattern evidence dominate?) is
explicitly left to a human reader or a future module, per §8 P1's instruction not to force a verdict a
current fact provider cannot support.

## 2. School-conflict resolution table (updated)

| # | Conflict | Deokbuni selects | Why (updated) |
|---|---|---|---|
| P1 | CF-012 sequencing | Fact validation → special screen (evidence-only, non-gating) → structural synthesis, in parallel/independent branches, both reported | The screen no longer needs to run "before" synthesis in a gating sense, since neither blocks the other now — both are computed from the same fact layer and reported side by side |
| P2 | CF-011 root vs following | Root existence is ONE of two disjuncts in the CANDIDATE test (§3) — never a universal gate in either direction. `ROOT_PRESENT ⇒ NOT_FOLLOWING` does not exist anywhere in the graph (required-zero item, P0-09) | A chart with a surviving root (e.g. `DTS-CONGXIANG-01`) simply does not satisfy the CANDIDATE disjunct — it is NOT asserted "not following"; it is only NOT asserted "CANDIDATE for following" by this graph. The difference matters: this graph makes no claim either way for that chart beyond what its own two facts support |
| P3 | CF-013 strength ≠ climate ≠ yongshin | Unchanged — three separate modules forever | `OBS-18/19` |
| P4 | 통근 vs 득지 | Unchanged — kept structurally distinct within AX-01's existence check | Matches the frozen kernel's F2/F3 split |
| P5 | 眾/寡 vs 強/弱 | Unchanged, now graph-topology-enforced (§S2_STRUCTURAL_AXES_FREEZE.md AX-09) — no edge from the numerousness fact node reaches any decision-bearing node | `CONFLICT_REGISTER.md` CF-005 |
| P6 | AX-04 outlet presence | Still folded, but now only as one of `TRANSFORM-01`'s two conjuncts (transparent root check), not as a special-screen counterevidence conjunct (that whole compound test was removed with `HIGH_CONFIDENCE`) | P0-01 |
| P7 | 格局 (GEJU) | Deferred entirely, unchanged | `S2_AXIS_CANDIDATES.md` AX-08 |
| P8 | R11 encoding | R11 stays `SCHOOL_DEPENDENT`; **the entire compound-test apparatus that used to let R11-adjacent evidence reach `HIGH_CONFIDENCE` is removed**, not just the binary-gate shortcut | P0-01, required-zero item `ROOT_PRESENT_ALWAYS_BREAKS_FOLLOWING = 0` |
| P9 | CF-002 (DTS-SHUAIWANG-10) | Unchanged — known source-internal print inconsistency, not re-researched | `CONFLICT_REGISTER.md` CF-002 |
| P10 | AX-05 CAPACITY scope | **Removed from Strength V2.** `CAPACITY(party, load, ground, time)` remains a documented architectural principle for a FUTURE domain-level judge; this graph never computes a capacity verdict | P0-04 |
| P11 | BR-015 / DISPUTED | **Removed from runtime.** BR-015 (沈孝瞻 從煞 vs 萬民英 胞胎格, same chart, no scope split) is preserved as `KNOWN_SCHOOL_CONFLICT` in research documentation only. This graph cannot independently generate the second (GEJU) candidate reading, so it cannot detect the dispute at runtime — claiming `DISPUTED` would require case-ID recognition, which is forbidden (P0-06, `CASE_MEMORIZATION_RULES = 0`) | P0-06 |

## 3. Special-pattern state policy (shrunk)

States: `NONE_DETECTED / CANDIDATE / INSUFFICIENT`. **No `HIGH_CONFIDENCE`. No `DISPUTED`.**

`CANDIDATE` fires when (season role is `OPPOSED` AND root is absent) OR (transformation evidence is
present per `TRANSFORM-01`). Both disjuncts are fully executable from the current fact layer — no count, no
threshold, no case-ID branch. `CANDIDATE` is evidence, not a verdict: it never blocks, gates, or modifies
the strength view (§1). `INSUFFICIENT` is reserved for the case where the CANDIDATE test itself cannot be
completed (a needed root fact is unresolvable from the available pillars).

Every route to `HIGH_CONFIDENCE` this program tried during S2/S3 and during this remediation had a real
corpus counterexample under close scrutiny:

- **Root-absence alone** over-triggered on ordinary extreme charts (`DTS-SHUAIWANG-04` etc. — extreme,
  rootless, yet tagged `ORDINARY_STRENGTH`, never `SPECIAL_PATTERN`).
- **A compound test adding "no outlet"** still asserted `HIGH_CONFIDENCE` for `DTS-CONGXIANG-01` despite a
  SURVIVING root — the general rule and the case-level narrative had drifted apart (exactly what P0-01
  flagged).
- **Transformation-transparency + seasonal-support** looked cleanly executable until `DTS-GUANSHA-12`: both
  conjuncts are satisfied, yet the source states the combination explicitly does NOT transform, because of a
  branch-specific buffering fact (`丑`'s own nature) this graph has no provider for.

No fourth attempt was made. Per §7/§8 of the remediation brief, the honest conclusion is that
`HIGH_CONFIDENCE` special-structure detection is not currently executable, and the graph says so by not
having the state at all rather than keeping a dead enum value.

## 4. Strength-view policy (shrunk)

- States: `WEAK_LEANING / STRONG_LEANING / MIXED_EVIDENCE / UNRESOLVED`. **No `EXTREME_*` states. No
  `BALANCED`. No `NOT_APPLICABLE_SPECIAL_STRUCTURE`.**
- Computed purely from `SYNTH-01`'s root × season lookup (`S3_OPERATIONAL_JUDGMENT_GRAPH.md` §2) —
  independent of `specialStructureStatus` (§1).
- `MIXED_EVIDENCE` fires when root and season genuinely disagree (root says one lean, season says the
  other) — a real, executable, reachable state, not a leftover. `UNRESOLVED` fires when a fact the
  classification materially depends on could not be resolved (typically an hour-dependent root fact).
- `MIXED_EVIDENCE != UNRESOLVED` (contradiction ≠ missing data — kept structurally distinct, preserved from
  the original kernel doctrine: "`MIXED` is deliberately NOT a stance").
- `BALANCED` was considered and rejected: no currently-executable rule distinguishes genuine harmonious/中和
  structure from `MIXED_EVIDENCE`'s contradictory-evidence state. Cases that read as harmonious in the
  source (`DTS-JINGSHEN-01`, `DTS-BAGE-04`) are NOT given a bespoke exception — they resolve to whatever
  cell the root × season lookup actually produces (§P1-05 of the remediation brief).
- The seven-band consumer vocabulary remains **not built**.
- Confidence: `HIGH`/`MODERATE` apply only to `STRONG_LEANING`/`WEAK_LEANING`, keyed to whether an
  unresolved relation-context caveat exists; `MIXED_EVIDENCE`/`UNRESOLVED` imply `LOW` by construction. No
  numeric confidence anywhere.

## 5. Sequencing (updated — no gate)

1. **FACT LAYER** — AX-01/02/03/09 facts, gracefully degrading around a missing hour pillar rather than
   discarding the chart (§6).
2. **SPECIAL-STRUCTURE SCREEN** and **STRUCTURAL SYNTHESIS** run from the SAME fact layer, independently —
   neither blocks the other (§1). This replaces the prior "screen must run before synthesis" gate, which
   only made sense when a screen result could change synthesis's applicability. It no longer can.
3. **STRENGTH VIEW** — derived from synthesis alone.
4. **UNCERTAINTY + PROVENANCE** — always present, reports both branches together.

There is no `TASK CAPACITY` stage in Strength V2 (§4 of the remediation brief) and no gate BRANCH node
(there is nothing left to branch on).

## 6. BR-015 — research evidence only, not a runtime state

See P11 in §2. `BR-015` remains fully documented in `CROSS_LINEAGE_BRIDGE_CASES.md` as a genuine, verified
cross-lineage conflict (沈孝瞻 vs 萬民英, same chart, incompatible non-ordinary readings). It is **not**
wired into `judgment-graph-v2.json` in any form — no node checks a chart's identity against BR-015 or any
other case ID. A future GEJU module that can independently generate a second candidate structural reading
(not by chart-ID lookup, but by actually computing an alternative classification from its own rules) is the
only thing that could make a `DISPUTED`-shaped runtime output honest, and that module does not exist yet.

## 7. Missing-hour policy (P1-01, newly explicit)

One consistent contract, applied everywhere: **use every fact derivable from year/month/day; only the
specific position-dependent facts that need the hour pillar become unavailable.** Concretely:

- `AX01_fact` (root existence) is `TRUE` if a root is found in ANY available position, `FALSE` only if
  checked against ALL available positions including a known hour, and `UNKNOWN` if a root would only be
  confirmed or excluded by an unknown hour branch.
- `SYNTH-01` treats `ROOT_EXISTS_UNKNOWN` as routing to `UNRESOLVED` — because the classification
  materially depends on it — rather than blocking the whole chart.
- The chart is never discarded outright for a missing hour; only the specific downstream conclusion that
  needed the missing fact is downgraded to `UNRESOLVED`/`INSUFFICIENT`.

This matches `NatalPillarContext`'s own type contract (`hour` is optional) and
`calculateSameElementRooting`'s existing graceful 3-branch degrade — no new behavior was invented, the
graph's OWN handling was simply made consistent with what the frozen fact layer already does.

## 8. Kernel alignment note (unchanged)

`src/features/divination/myungriStrength.ts` already implements a live, frozen "structural evidence,
verdict withheld" pattern for exactly this domain. Its F1–F4 factors map onto AX-02/AX-01/AX-01/AX-09. This
V2 program's reduced axis and graph design remains composable with, not a replacement for, that kernel
contract.

## 9. Conceptual kernel-integration shape (draft only, no runtime code — updated)

```
MYUNGRI_FACT_BUNDLE (existing, frozen: src/features/myungri/services/strengthFactBundle.ts)
        ↓
MYUNGRI_STRUCTURAL_JUDGE_RESULT {
  structuralState: 'ANCHORED'|'UNANCHORED'|'MIXED_STRUCTURE'|'UNRESOLVED'
  strengthView: {
    classification: 'WEAK_LEANING'|'STRONG_LEANING'|'MIXED_EVIDENCE'|'UNRESOLVED'
    confidenceClass: 'HIGH'|'MODERATE'|'LOW'
    evidence: JudgmentEvidence[]
    doesNotImply: string[]
  }
  specialStructureStatus: {
    status: 'NONE_DETECTED'|'CANDIDATE'|'INSUFFICIENT'
    evidence: JudgmentEvidence[]
  }
  taskCapacities: 'NOT_EVALUATED'   // reserved field, populated by a FUTURE domain-level judge, never here
  numerousnessEvidence: { supportCount: number; drainCount: number; incompleteCount: boolean }  // descriptive only
  confidenceClass: 'HIGH'|'MODERATE'|'LOW'
  sourceProvenance: { nodeId: string; caseIds: string[]; sourceIds: string[] }[]
}
        ↓ (future work, not this batch)
kernel evidence/inference/verdict system (src/features/divination) — StrengthInput / DayMasterStrengthJudgment
```

`JudgmentEvidence` still reuses the existing kernel shape from `src/features/divination/contracts.ts`.

## 10. Freeze status

Frozen for the P0 re-audit alongside the axis freeze and judgment graph. This is a **product selection**
at a deliberately reduced scope — narrower than the prior version, and explicitly not claiming to have
solved the historical questions that made the wider version unexecutable.
