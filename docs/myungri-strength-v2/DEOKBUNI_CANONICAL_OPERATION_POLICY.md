# DEOKBUNI CANONICAL OPERATION POLICY — MYUNGRI STRUCTURAL JUDGMENT V2

> Governs how Deokbuni resolves school disagreement operationally. This is a **product policy**, not a
> historical-scholarship verdict. It selects ONE interpretation per contested point so the judgment graph
> (`S3_OPERATIONAL_JUDGMENT_GRAPH.md`) can be deterministic, and states explicitly where it declines to
> select and flags `SCHOOL_SENSITIVE` / `UNRESOLVED_STRUCTURE` instead.

## 0. What this document is not

It is not a claim that the selected reading is the historically "correct" one, and not a claim that the
excluded readings are wrong. `CONFLICT_REGISTER.md` and `COUNTEREXAMPLE_REGISTER.md` remain the honest
scholarly record. This document exists because a product cannot present a user with five schools and ask
them to choose — it must compute one deterministic structural read per chart, or say plainly that it
cannot.

## 1. Architecture — strength is a derived view, not the engine

```
DETERMINISTIC FACTS (frozen src/features/myungri services)
        ↓
STRUCTURAL INFERENCES  (AX-01 rooting, AX-02 seasonal state, AX-03 relation activation)
        ↓
SPECIAL-STRUCTURE SCREEN (AX-06)  ──→ if CANDIDATE/HIGH_CONFIDENCE, strength view is SUBORDINATED, not computed as usual
        ↓
STRUCTURAL SYNTHESIS  (qualitative structural state — never a score)
        ↓
QUESTION-SPECIFIC CAPACITY (AX-05, only for the load domains actually asked about)
        ↓
STRENGTH VIEW  (WEAK_LEANING / BALANCED_OR_MIXED / STRONG_LEANING / UNRESOLVED, evidence-carrying)
        ↓
(future, NOT this batch) Yongshin ← kernel evidence/inference/verdict system (src/features/divination)
```

Strength is read off the structural synthesis after the special-structure screen has run — it is never the
first thing computed and never the thing special-structure candidacy is measured against. A chart is not
"actually EXTREME_WEAK, but we call it FOLLOWING for style" — following and strength are answers to two
different structural questions.

## 2. School-conflict resolution table

Every row: what Deokbuni operationally selects, what stays `SCHOOL_SENSITIVE`, and why. This table is the
single place the graph's `SCHOOL_SCOPE` fields point back to.

| # | Conflict | Deokbuni selects | Excluded / deferred position | Why | Evidence |
|---|---|---|---|---|---|
| P1 | CF-012 sequencing (Fact→special-screen→ordinary vs 從化-first vs 月令-first-外格-last) | **Fact validation → special/non-ordinary screen → ordinary axes** (tested as the S3 pipeline, §5 of this doc) | 淵海子平's screen-only-first-then-nothing-else and 沈孝瞻's 外格-last are not adopted as stated | 2 of 3 named lineages (任鐵樵, and structurally 淵海子平's philosophical priority) put non-ordinary-structure detection ahead of ordinary axis work; running fact validation first is required by every lineage since the screen itself needs 통근/월령 facts | `SEQUENCING_COMPARISON.md` |
| P2 | CF-011 root vs following (5-way) | Root presence is **COUNTEREVIDENCE to a following/transformation candidacy, never an automatic disqualifier and never irrelevant** — a compound-conjunct test (root at a governing position + absence of an outlet/protector) is required to move a candidate to `HIGH_CONFIDENCE`; a bare root elsewhere downgrades to `CANDIDATE`, not to `NONE_DETECTED` | 淵海子平's binary "root ⇒ not following" and 任鐵樵's "strength axis inapplicable, root is a non-issue" are both rejected as stated | Binary root-voids-following is refuted by DTS-CONGXIANG-01 (蟠根在未 + 餘氣在辰, still 從財); "root never matters" is refuted by DTS-CONGXIANG-05 (從殺 breaks the moment luck restores 蟠根). A compound test is the only reading both cases survive | `COUNTEREXAMPLE_REGISTER.md` R11, `CONFLICT_REGISTER.md` CF-011 |
| P3 | CF-013 strength ≠ climate ≠ yongshin | Kept as three **separate modules forever** — climate (調候) is evidence a strength-view node MAY cite as context but never folds into the structural state; yongshin is out of scope this batch entirely | A unified 扶抑+調候 single verdict (徐樂吾-style) is not adopted as the primary engine shape | `OBS-18/19`: 扶抑+調候-as-one-doctrine traces to 徐樂吾 1936, not the classical corpus; keeping them separate is the more conservative, more falsifiable structure | `DOCTRINE_OBSERVATIONS.md` |
| P4 | 통근 vs 득지 conflation | Kept **structurally distinct** (same-stem rooting vs same-element hidden peer), matching the frozen kernel's own F2/F3 split | A single "has support" boolean is rejected | The already-frozen `myungriStrength.ts` header states this exact distinction was a defect in an earlier build ("the rejected build conflated them") | `src/features/divination/myungriStrength.ts` |
| P5 | 眾/寡 vs 強/弱 | Kept **independent axes**; 眾/寡 (AX-09) is FACT-only evidence, never promoted to a verdict by itself | Treating a numeric majority of supporting positions as sufficient for a strength verdict is rejected | DTS-FANGJU-09's decisive `強眾而敵寡…非煞旺宜制而推也`: the treatment follows the 眾/寡 relation, explicitly NOT from whether the opposing party is itself 旺; CF-005 closed this as two axes | `CONFLICT_REGISTER.md` CF-005, `S2_AXIS_CANDIDATES.md` |
| P6 | AX-04 outlet presence — standalone axis or folded? | **Folded into the special-structure screen** as a supporting counterevidence check for following/transformation candidates (an outlet/protector is one of the compound-test conjuncts in P2), not promoted to a top-level axis | A standalone OUTLET_PRESENCE axis with independent downstream use | Single-lineage evidentiary support and no case found where outlet presence changes a decision *outside* the special-screen context — minimality criterion (§S2, "omit anything that doesn't change a decision") | `S2_AXIS_CANDIDATES.md` AX-04 |
| P7 | 格局 (GEJU) taxonomy | **Deferred entirely.** GEJU-tagged corpus cases are replayed only through the axes that already exist (rooting, seasonal state, relation activation) — no 格 is named, no 格 taxonomy is built | A full 格局 classifier | Explicit brief instruction: 格局 is a separate/higher-level module, not built merely because research exists | `S2_AXIS_CANDIDATES.md` AX-08 |
| P8 | R11 encoding | R11 is encoded as `SCHOOL_DEPENDENT`, **never** as a universal `ROOT_PRESENT ⇒ NOT_FOLLOWING` rule anywhere in the graph | — | Direct instruction; also the required-zero gate item `ROOT_PRESENT_ALWAYS_BREAKS_FOLLOWING = 0` | `COUNTEREXAMPLE_REGISTER.md` R11 |
| P9 | CF-002 (滴天髓's internal 土旺極 contradiction, DTS-SHUAIWANG-10) | Treated as a **known source-internal printing inconsistency** (already closed `COPY_ERROR` in S1.6) — not a runtime blocker, not re-researched | — | Already resolved; brief explicitly forbids spending further time on it | `CONFLICT_REGISTER.md` CF-002 |

## 3. Special-pattern state policy

`NONE_DETECTED / CANDIDATE / HIGH_CONFIDENCE / DISPUTED / INSUFFICIENT` (naming aligned to the existing
kernel's `specialStructureStatus` contract, see §8). A chart never receives a bare "yes/no" on following or
transformation — every positive read carries the compound-test evidence, every negative read carries what
countervailing evidence was found.

`DISPUTED` is reserved for exactly the shape BR-015 demonstrates: two named authorities read the identical
chart into two different non-ordinary structures with no documented scope split (§6 below). `DISPUTED` is
not a defeat of the system — it is the honest output when the corpus itself disagrees at the chart level.

## 4. Strength-view policy

- Computed only from the structural synthesis, and **only when the special-structure screen returned
  `NONE_DETECTED`** or a `CANDIDATE` that a downstream node explicitly ruled out. If special status is
  `HIGH_CONFIDENCE` or `DISPUTED`, the strength view returns `NOT_APPLICABLE_SPECIAL_STRUCTURE` — it is not
  computed as if the chart were ordinary. This is the direct implementation of "FOLLOWING != EXTREME_WEAK".
- Classification vocabulary: `WEAK_LEANING / BALANCED_OR_MIXED / STRONG_LEANING / UNRESOLVED`, plus
  `EXTREME_WEAK_LEANING_CANDIDATE` / `EXTREME_STRONG_LEANING_CANDIDATE` only when the structural synthesis
  shows one-sided dominance across ALL THREE structural axes (rooting, seasonal state, relation activation)
  with zero counterevidence recorded anywhere in the graph for that chart — never from a single axis alone.
- The seven-band consumer vocabulary (극신약…극신강) is explicitly **not** built this batch. Any future
  mapping from this internal vocabulary to a seven-band consumer label is a separate, later decision.
- Every strength-view output carries `evidenceFor`, `evidenceAgainst`, and `doesNotImply` — never a bare
  label. `doesNotImply` exists specifically to prevent the invalid-converse error the V1 closure was built
  to stop (`NO_ROOT ⇒ CANNOT_BEAR` is exactly the shape being guarded against here too).

## 5. Sequencing decision (tested, not assumed)

The brief's suggested 7-stage shape was tested against the replay pool (`S3_CASE_REPLAY_REPORT.md`) rather
than adopted blindly. It holds with no case forcing a reorder:

1. **FACT_VALIDATION** — every axis needs 통근/월령/관계 facts; running this first costs nothing under any
   lineage's sequencing and is required before a special-screen can even be attempted.
2. **SPECIAL/NON-ORDINARY STRUCTURE SCREEN** — placed before ordinary axis synthesis because a positive
   `HIGH_CONFIDENCE` result changes what "structural state" even means for the chart (following/transformed
   charts are not scored on the ordinary rooting/seasonal axes the same way — see P1 above and DTS-CONGXIANG
   cases). This matches 淵海子平's and 任鐵樵's shared priority of resolving non-ordinary structure early,
   over 沈孝瞻's외격-last ordering.
3. **ORDINARY STRUCTURAL AXES** — only reached when the screen did not return `HIGH_CONFIDENCE`/`DISPUTED`.
4. **STRUCTURAL SYNTHESIS** — combine axis-level inferences into one of a small number of named qualitative
   states (§4 of `S2_STRUCTURAL_AXES_FREEZE.md`), never a score.
5. **QUESTION-SPECIFIC CAPACITY** — only the load domains the actual question touches.
6. **STRENGTH VIEW** — derived, subordinate, per §4 above.
7. **UNCERTAINTY + PROVENANCE** — always present; every node's authority level and source support is
   carried to the final output.

Confirmed by replay: no case in the pool required the special-screen to run *after* ordinary axis synthesis
to reach a coherent result, and several cases (DTS-CONGXIANG-01, BR-015) would have produced a materially
worse read if ordinary rooting/seasonal axes had been synthesized into a strength view before the special
screen ran (a rooted-and-in-command 從財 candidate would misread as `STRONG_LEANING` instead of being
correctly routed to `NOT_APPLICABLE_SPECIAL_STRUCTURE`).

## 6. Handling BR-015 as the reference `DISPUTED` case

Chart 乙酉乙酉乙酉甲申: 沈孝瞻 (子平真詮) reads it as 棄命從煞 (day master 乙 rootless against an all-metal
officer-star field — a following pattern); 萬民英 (三命通會) reads the identical chart as a 胞胎格
(self-seated-絶地 "fetal origin" construct, treated like an 印格 analogue, fearing 財 rather than needing an
officer-following release). No documented scope split (different question, different time layer) separates
these two readings — both describe the SAME chart's SAME structural situation. This is exactly the
`DISPUTED` case the special-structure screen must be able to output rather than silently picking a side.
Deokbuni's operational policy: when two `CANONICAL`-tier sources disagree on the *kind* of non-ordinary
structure with no scope justification, output `SPECIAL_PATTERN_DISPUTED` and both candidate readings as
named alternatives — never collapse to one silently, and never average into a third invented category.

## 7. Kernel alignment note

`src/features/divination/myungriStrength.ts` already implements a live, frozen "structural evidence,
verdict withheld" pattern for exactly this domain, under its own inline-versioned documentation (`CONSTITUTION
V2 §8`, `V3 §11–§13` — confirmed this batch to be versioned section labels inside `contracts.ts` /
`myungriNatal.ts` / `myungriStrength.ts` themselves, not a separate standalone document; consistent with the
V4A–V4D revision-wave convention already used across `src/features/divination`). Its F1–F4 factors
(월령/통근/득지/구성) map directly onto this policy's AX-02/AX-01/AX-01/AX-09. This V2 research program's
axis and graph design is deliberately built to be **composable with**, not a replacement for, that kernel
contract — see `S2_STRUCTURAL_AXES_FREEZE.md` §Kernel Alignment and `S3_OPERATIONAL_JUDGMENT_GRAPH.md` §54.

## 8. Conceptual kernel-integration shapes (draft only, no runtime code)

```
MYUNGRI_FACT_BUNDLE (existing, frozen: src/features/myungri/services/strengthFactBundle.ts)
        ↓
MYUNGRI_STRUCTURAL_JUDGE_RESULT {
  structuralState: StructuralSynthesisState        // §4 of S2_STRUCTURAL_AXES_FREEZE.md
  strengthView: {
    classification: 'WEAK_LEANING'|'BALANCED_OR_MIXED'|'STRONG_LEANING'|'UNRESOLVED'
                    |'EXTREME_WEAK_LEANING_CANDIDATE'|'EXTREME_STRONG_LEANING_CANDIDATE'
                    |'NOT_APPLICABLE_SPECIAL_STRUCTURE'
    confidenceClass: 'HIGH'|'MODERATE'|'LOW'|'SCHOOL_SENSITIVE'|'INSUFFICIENT'   // no numeric confidence, ever
    evidenceFor: JudgmentEvidence[]
    evidenceAgainst: JudgmentEvidence[]
    doesNotImply: string[]
    reasoningNodeIds: string[]
  }
  specialStructureStatus: {
    status: 'NONE_DETECTED'|'CANDIDATE'|'HIGH_CONFIDENCE'|'DISPUTED'|'INSUFFICIENT'
    candidateReadings: { label: string; sourceAuthority: string; supportingNodeIds: string[] }[]
  }
  taskCapacities: { domain: 'WEALTH_LOAD'|'CONTROL_LOAD'|'OUTPUT_LOAD'
                     state: 'SUPPORTED'|'NOT_SUPPORTED'|'MIXED'|'INSUFFICIENT'
                     evidence: JudgmentEvidence[] }[]
  evidence: JudgmentEvidence[]
  inferences: { nodeId: string; premises: string[]; conclusion: string }[]
  uncertainty: { class: string; reason: string }[]
  schoolSensitiveFlags: { pointId: string; reason: string }[]     // references §2 table rows
  sourceProvenance: { nodeId: string; caseIds: string[]; sourceIds: string[] }[]
}
        ↓ (future work, not this batch)
kernel evidence/inference/verdict system (src/features/divination) — StrengthInput / DayMasterStrengthJudgment
```

`JudgmentEvidence` reuses the EXISTING kernel shape (`src/features/divination/contracts.ts`:
`{fact, meaning, domain, temporalScope, directness}`) rather than inventing a parallel one, so a future
wiring pass has no type to reconcile.

## 9. Freeze status of this document

This policy is frozen for the S2/S3 audit alongside the axis freeze and judgment graph. It is a **product
selection**, revisable by a later owner decision — it is not a claim of historical settlement on any of the
CF-0xx conflicts, which remain open in the scholarly record.
