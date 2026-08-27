# MYUNGRI_STRENGTH_V1 — Deterministic Fact Foundation

> **STATUS: FACT LAYER ONLY.** Doctrine (`docs/MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md`) is not yet
> frozen and awaits independent re-audit. This document describes deterministic fact infrastructure
> only. **No strength judgment, no special-pattern judgment, no relation-effect/transformation
> judgment, and no Yongshin logic exists anywhere in the code this document describes.**

Base commit: `e1e13aa0695aac31b0619c065f1755d23bb54939`.

## 1. What is deterministic FACT (this sprint's scope)

A FACT is a value read directly from the frozen calculation primitives (`calculateTenGod`,
`getHiddenStems`, `getStemElement`, `getBranchElement`, `getStemYinYang`) or from a prior sprint's
already-audited-clean deterministic provider, with **zero** school-dependent judgment applied. Facts
this sprint provides:

| Provider | File | Facts |
|---|---|---|
| Same-element rooting | `services/sameElementRooting.ts` | Every hidden stem in every natal branch, tagged `sameElementAsDayMaster` / `sameStemAsDayMaster` / `samePolarityAsDayMaster` (existence booleans only) |
| Ten-god facts | `services/tenGodFacts.ts` | Raw `TenGod` identity for every visible (non-DAY) and hidden stem — no role grouping, no support/drain side |
| Relation participants | `services/relationParticipants.ts` | For every relation `pillarRelations.ts`/`natalRelations.ts` detects: exact participant pillars/stems/branches, plus candidate co-located root fact ids (co-occurrence only) |
| General seasonal phase | `services/generalSeasonalPhase.ts` | 旺相休囚死 for ANY element vs. ANY reference element (not Day-Master-specific) — a general-purpose re-derivation of the same five-cell table `monthCommand.ts` already encodes |
| Special-pattern prerequisites | `services/specialPatternPrerequisites.ts` | Raw element/role counts, same-element-root positions — no dominance ratio, no threshold |
| Fact bundle | `services/strengthFactBundle.ts` | Composes all of the above (plus the pre-existing `monthCommand`/`natalRelations`) into one citable `MyungriStrengthFactBundle` |

Pre-existing facts this sprint reused unchanged (already audited clean in
`MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`): `calculateMonthCommand` (월령/왕상휴수사, primary-
element phase only — 사령 day-count remains P1, not built), `calculateNatalRelations` (raw 합/충/
형/파/해/삼합/방합 detection).

## 2. What remains INFERENCE (not built this sprint)

An INFERENCE is a judgment that requires interpreting facts against doctrine — necessarily
school-aware, necessarily contestable, and explicitly out of this sprint's scope:

- **Root functional-effectiveness** — is a same-element root seasonally vital? Does it survive a
  detected clash/combination? (canonical doctrine §5, §8.4)
- **Relation formation/transformation** — does a detected 合 actually 化? Does a detected 삼合/방합
  become a structurally transformed bureau? (canonical doctrine §8.1–8.3)
- **Special-pattern judgment** — is this chart 從强/從財/從官殺/從兒/專旺? (canonical doctrine §10)
- **Functional-force grading** — is a support/opposition candidate's presence actually WEAK/
  MODERATE/STRONG? (canonical doctrine §7.3)
- **Climate functionality** — does 調候 constrain a specific element's effective manifestation?
  (canonical doctrine §9 — deliberately not started, see §11 below)

None of these are implemented, even partially, even as a placeholder that returns a real value.
Where a future field for one of these would eventually live, `strengthFactBundle.ts`'s `future`
object declares it as a `undefined`-typed documentation placeholder ONLY — no code path ever
assigns it a real value.

## 3. What remains VERDICT (not built this sprint)

A VERDICT is the final output of a fully-run inference chain — a seven-band label (극신약…극신강), a
Stage-1 structural class (WEAK/BALANCED/STRONG), a confirmed special-structure category, or a
Yongshin selection. **Zero code path in this sprint can produce any of these.** See §7's negative
proof.

## 4. New fact providers (this sprint)

All six files listed in §1's table, plus their re-exports from `src/features/myungri/index.ts`. Each
follows the established `AVAILABLE | UNAVAILABLE` fail-closed discriminated-union pattern already
used throughout `src/features/myungri/services/`, carries its own `ruleId`/`ruleVersion` constant,
and (where applicable) a stable, citable `factId` per fact so a future reasoner can reference exact
facts without reconstructing them from prose (canonical doctrine's own evidence-contract discipline,
`DOCTRINE_SOURCE`, extended down to the fact layer here).

## 5. Old contaminated paths — confirmed NOT used

`services/natalStrength.ts` (the rejected 18-cell `RULE_TABLE`, root-count bucketing, support/drain
dominance comparison, agreement-count confidence) and `services/currentStrength.ts`
(`buildCurrentStrengthContext()`, which internally calls the rejected `evaluateNatalStrength()`) are
**not imported, not called, not depended on** by any file added this sprint. Confirmed by direct
grep across every new service file — the only occurrences of their names are in comments explaining
why they were deliberately not reused. Neither file was modified or deleted this sprint, per the
brief's explicit instruction to leave them in place.

`services/dayMasterStrengthInputs.ts` (the visible/hidden ten-god role-and-side tallying module) was
independently audited as clean FACT in the prior gap analysis — its `TEN_GOD_ROLE` mapping is a
fixed, undisputed classical definition, not a weighting choice. This sprint deliberately does **not**
import from it anyway: `tenGodFacts.ts` re-derives raw `TenGod` identity directly from the frozen
`calculateTenGod` primitive (dropping even the fixed role/side grouping), and
`specialPatternPrerequisites.ts` independently re-derives the 5-role classification (needed there
per the brief's own explicit "presence of 財/官殺/식傷/印/比劫" allowance) with the SUPPORT/DRAIN
side tag dropped entirely. This is a stricter-than-necessary choice, made so that no file in this
sprint's fact layer carries the word "Strength" in an import path or any directional (support/drain)
framing at all, even a classically fixed one — eliminating any ambiguity for a future auditor.

## 6. Current remaining P0 inference/doctrine gaps

Unchanged from `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md` (this sprint does not close any doctrine
or inference gap — it only adds facts those gaps' eventual implementations will consume):

- **P0 — root/support-integrity judgment layer.** This sprint's `relationParticipants.ts` supplies
  the missing FACT linkage (which root sits in which participating branch) that this judgment layer
  needs, but does not implement the judgment itself (INTACT/WEAKENED/DESTROYED/MEDIATED grading,
  canonical doctrine §8.4) — that remains unbuilt.
- **P0 — special-pattern rule set implementation.** Canonical doctrine §10 fully specifies the rules;
  `specialPatternPrerequisites.ts` supplies the raw counts/positions the rules would consume; the
  rules themselves are not implemented as runtime code.
- **P0 — relation outcome/transformation policy implementation.** Canonical doctrine §8 fully
  specifies the five-question layering (DETECTION/FORMATION/TRANSFORMATION/FUNCTIONAL/STRENGTH) for
  5 of 8 mechanisms; `relationParticipants.ts` supplies DETECTION-level linkage only.
- **P0 — seven-band boundary contract implementation.** Canonical doctrine §12.2 fully specifies the
  contracts; nothing in this sprint computes a band.
- **P0 — standalone same-element rooting fact.** **Closed this sprint** by `sameElementRooting.ts`.

## 7. Negative proof (required by this sprint's brief)

Searched every new/changed runtime file
(`sameElementRooting.ts`, `tenGodFacts.ts`, `relationParticipants.ts`, `generalSeasonalPhase.ts`,
`specialPatternPrerequisites.ts`, `strengthFactBundle.ts`, and the `index.ts` re-exports) for every
forbidden term the brief names. Every match found was inside a comment explaining what is
deliberately NOT computed, or the single explicitly-permitted `undefined`-typed `future.yongshin`
placeholder field (never assigned a real value by any code path). No forbidden field, status value,
or verdict is emitted, stored, returned, or internally relied upon by any function added this
sprint.

```
SPECIAL_PATTERN_JUDGE_ADDED = NO
SPECIAL_PATTERN_VERDICT_EMITTED = NO
WEAK_BALANCED_STRONG_JUDGE_ADDED = NO
SEVEN_BAND_CLASSIFIER_ADDED = NO
SEVEN_BAND_VERDICT_EMITTED = NO
ROOT_FUNCTION_JUDGMENT_ADDED = NO
RELATION_EFFECT_JUDGMENT_ADDED = NO
TRANSFORMATION_JUDGMENT_ADDED = NO
YONGSHIN_JUDGMENT_ADDED = NO
```

## 8. How a future Strength Reasoner should consume this bundle

1. Call `buildMyungriStrengthFactBundle(natal)`. Treat `UNAVAILABLE` as fail-closed — do not attempt
   a partial reasoning pass over a missing sub-provider's absence.
2. Read `bundle.sameElementRooting`/`bundle.relationParticipants` together to build the P0
   root/support-integrity judgment layer canonical doctrine §5/§8 describes — this bundle supplies
   the facts (existence + co-location), the reasoner supplies the judgment (survival grading).
3. Read `bundle.specialPatternPrerequisites` to implement canonical doctrine §10's gate — this
   bundle supplies counts/positions, the reasoner supplies the per-pattern conditions.
4. Read `bundle.tenGodFacts` for raw ten-god identity; apply the reasoner's OWN role/side/functional
   categorization on top (this bundle deliberately does not pre-decide it, §5 above).
5. Use `generalSeasonalPhase()`/`generalSeasonalPhaseForMonthBranch()` directly (not only through the
   bundle) for any element's seasonal vitality the reasoner needs mid-computation — e.g. an
   opposition candidate's own phase, or a root's own phase independent of the Day Master's.
6. **Never** read or assign `bundle.future.*` — those fields exist only so this bundle's TypeScript
   shape can be extended later without a breaking change; they are permanently `undefined` in every
   bundle this sprint's code can produce.
7. When the P0/P1 gaps above are eventually closed and doctrine survives re-audit, the reasoner's own
   output (a real strength/special-pattern verdict) should be a SEPARATE type/module downstream of
   this bundle — never added as a new field inside `sameElementRooting.ts` et al., which must stay
   pure fact providers indefinitely, independent of how many times the doctrine documents are
   revised.
