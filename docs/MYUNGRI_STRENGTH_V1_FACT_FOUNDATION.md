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

## 9. FACT FOUNDATION FREEZE CONTRACT

Added by the HARDENING sprint (base `e365f847d06bda741274fd49ff1f1970e68946a0`), **corrected by the
REMEDIATION batch** (base `4d98ec1bd938d16be5295cd708981d40b9a251be`) after an independent audit found
three overclaims in the first version — see §9.9 for the exact corrections. This section is the
authoritative, load-bearing contract for everything downstream of §1–§8 — a future Strength Reasoner,
and any future edit to this fact layer, must satisfy it.

Enforced by `contracts/factLayerTypeFirewall.ts` (**compile-time**, type-checked by `tsc --noEmit`),
plus `sameElementRooting.test.ts`, `tenGodFacts.test.ts`, `generalSeasonalPhase.test.ts`,
`relationParticipants.test.ts`, `specialPatternPrerequisites.test.ts`, `strengthFactBundle.test.ts`,
`detectionEffectFirewall.test.ts` (**runtime only** — see §9.5), and
`factFoundationFixtureCorpus.test.ts` (600 deterministic chart fixtures).

### 9.1 FACT LAYER MAY PRODUCE

- Raw stem/branch/hidden-stem identity: element, yin-yang polarity, hidden-stem qi-tier role
  (RESIDUAL/MIDDLE/MAIN), pillar position, chart-relative Day Master identity.
- Existence booleans relating a hidden stem to the Day Master: same element / same stem / same
  polarity — never a rank, score, or weighting over them.
- Raw `TenGod` identity (all 10 values) for any visible or hidden stem — never a role-group
  (비겁/인성/식상/재성/관성) aggregation with a support/drain side tag attached.
- Raw element/role-category COUNTS and POSITIONS (visible, hidden, same-element-root) — never a
  ratio, percentage, or dominance threshold over them.
- 旺相休囚死 phase for ANY element against ANY reference element — never a WEAK/STRONG conclusion
  derived from that phase.
- Relation DETECTION (already existed) plus PARTICIPANT LINKAGE: exact pillar positions, stems,
  branches, and candidate co-located **Day-Master same-element ROOT** fact ids for every relation
  `pillarRelations.ts`/`natalRelations.ts` detects — never whether the relation succeeds, transforms,
  or damages anything it touches. See §9.10 for the root-only restriction.
- A stable `factId`/`ruleVersion` per citable fact (or, where a provider emits pure aggregates with
  no natural per-record identity — `specialPatternPrerequisites.ts` — the fixed `role` enum or
  `position`+`branch` pair serves as that stable identity instead; see §9.4).
- Composition of all of the above into one `MyungriStrengthFactBundle`, fail-closed as a whole.

### 9.2 FACT LAYER MUST NEVER PRODUCE

Zero code path in `services/sameElementRooting.ts`, `tenGodFacts.ts`, `relationParticipants.ts`,
`generalSeasonalPhase.ts`, `specialPatternPrerequisites.ts`, or `strengthFactBundle.ts` may ever
assign a real (non-`undefined`) value to any of the following classes, now or after any future edit:

- **Root function/survival** — `rootFunction`, `rootDestroyed`, `rootWeakened`, `rootSurvived`,
  `rootStrength`, `rootRank`, `rootSurvivability`, `functionalForce`, `structuralDominance`.
- **Relation effect/transformation** — `relationEffect`, `transformed`, `transformationSucceeded`,
  `huaCheng`, `bureauFormed`, `structuralElement`, `combinationSuccessful`, `functionalEffect`,
  `effect`.
- **Special-pattern verdict** — `specialPatternVerdict`, `specialPatternStatus`,
  `specialPatternConfirmed`, `congCaiCandidate`, `congGuanShaCandidate`, `congErCandidate`,
  `specialPatternScore`, or any 從强/從財/從官殺/從兒/專旺/眞從/假從 status value.
- **Strength verdict** — `strength`, `confidence`, `weak`/`strong`/`balanced` booleans or labels, any
  of the seven bands (극신약/신약/중화신약/중화/중화신강/신강/극신강).
- **Climate/Yongshin** — `climate`, `yongshin`, or any 억부/조후/통관/병약용신 selection.

`strengthFactBundle.ts`'s `future` object is the ONE deliberate, documented exception to "these key
names never appear": its six keys are named exactly after these forbidden concepts, but every value
is permanently `undefined` and no code path ever assigns a real one — `JSON.stringify` drops them
entirely, so they contribute nothing to any actual serialized bundle. This is verified at both the
type level and the runtime/JSON level (§9.5).

### 9.3 Fact ID stability

Every per-record `factId` is built from structural components ONLY — chart layer, pillar position,
stem/branch identity, hidden-stem role, relation kind, and relation participants — and is proven
(not merely asserted) to be:

- **Repeatable**: identical across two independent computations of the same chart.
- **Independent of object-literal key order**: the `pillars: {year, month, day, hour}` object may be
  written in any key order with no change to any factId (every provider iterates a hardcoded
  position order internally, never `Object.keys(natal.pillars)`).
- **Free of display text**: no factId contains Korean characters or any localized wording.
- **Free of ANY detector array-index dependence** (`relationParticipants.ts` specifically —
  CORRECTED, see §9.9/F2). Relation fact ids previously embedded the detector's own output index
  (`stem-relation-participants:${i}:...`), which made a relation's identity depend on the order
  `natalRelations.ts` happened to emit it in — a genuine violation of order-independent identity, not
  a cosmetic one. Relation fact ids are now **purely semantic**:

  ```
  stem-relation-participants:<KIND>:<POS>=<STEM>+<POS>=<STEM>
  branch-pair-relation-participants:<KIND>:<POS>=<BRANCH>+<POS>=<BRANCH>
  branch-set-relation-participants:<KIND>:<BRANCH>+<BRANCH>+<BRANCH>:<POS>+<POS>+<POS>
  ```

  Participants are canonically ordered (pillar positions by fixed YEAR→MONTH→DAY→HOUR rank; branch
  sets by fixed 지지 order), and each participant's value is looked up **by position from the chart**
  rather than zipped against the detector's own arrays, so the pairing cannot silently invert. The
  governing property — *the same semantic relation keeps the same factId even when the detector emits
  it at a different array index* — is proven by a regression test that constructs two charts in which
  the identical 寅申沖 lands at genuinely different array indices and asserts the ids match.

### 9.4 Provenance completeness

Every fact traces to an exact pillar position, stem/branch value, and (where applicable) hidden-stem
role, plus its provider's own `ruleVersion` constant — never opaque prose-only evidence.
`specialPatternPrerequisites.ts` is the one provider whose facts are aggregates (counts, position
lists) rather than one-record-per-occurrence: it has no synthesized `factId`, and its
`sameElementRootPositions` field is a direct, order-preserving REDUCTION of
`sameElementRooting.ts`'s own `sameElementRoots` (not a second independent derivation) — proven by a
dedicated cross-check test, not merely documented.

### 9.5 Detection/effect firewall

Proven at two independent levels, **in two different files** (CORRECTED — see §9.9/F3):

1. **Compile-time — `src/features/myungri/contracts/factLayerTypeFirewall.ts`.** This is ordinary
   `.ts` source, NOT a test file, specifically so `tsc --noEmit` actually type-checks it (both
   `npm run preflight` and `npm run release-preflight` already run it). It asserts, for every
   exported fact type:

   ```ts
   type AssertNever<T extends never> = T
   export type _FirewallHiddenStemFact = AssertNever<Extract<keyof HiddenStemFact, ForbiddenFactKey>>
   ```

   If a forbidden key is ever added to a fact type, `Extract<...>` stops being `never`, the
   `T extends never` constraint is violated, and the **build fails** with TS2344. Verified
   empirically by injecting `rootDestroyed: boolean` into `HiddenStemFact` and observing
   `error TS2344: Type '"rootDestroyed"' does not satisfy the constraint 'never'.` — not assumed.

   The same file additionally asserts (a) that every member of `strengthFactBundle.ts`'s `future`
   placeholder block is typed exactly `undefined`, and (b) that
   `ALL_SUPPORTED_RELATION_KINDS` is **exhaustive** over the frozen relation-kind unions, so a newly
   added relation kind cannot be omitted from coverage without failing compilation.

2. **Runtime — `__tests__/detectionEffectFirewall.test.ts`.** A JSON sweep across varied fact bundles
   (plus all 600 fixtures in `factFoundationFixtureCorpus.test.ts`) confirming no forbidden key or
   forbidden verdict string appears anywhere in actual serialized output. This catches what a *value*
   could smuggle in even when the declared shape is clean.

Both halves are required. Neither alone is sufficient.

### 9.6 Rejected old-strength dependency firewall

`services/natalStrength.ts` and `services/currentStrength.ts` (the rejected 18-cell `RULE_TABLE`,
root-count bucketing, support/drain dominance comparison, seven-band threshold, special-pattern/
transformation/root-damage/Yongshin assumptions) are **not imported, called, or transitively
depended upon** by any file in this fact layer. Verified by tracing the full import graph of all six
new providers down to their frozen primitives (`pillarFacts.ts`, `natalRelations.ts`,
`monthCommand.ts`, `pillarRelations.ts`, and the `interpretation` barrel) and grepping that entire
transitive closure for `natalStrength|currentStrength|dayMasterStrengthInputs` — zero matches outside
of comments explaining why they were deliberately not reused.
`TRANSITIVE_OLD_STRENGTH_DEPENDENCY = NO`.

### 9.7 Day Master representation

The Day Master's own stem is deliberately excluded from `tenGodFacts.ts`'s `visibleStems` (a stem has
no ten-god relation to itself) — this is an intentional exclusion, not an "does not exist" gap: the
Day Master identity is still exposed unambiguously exactly once, at `dayMaster` (top-level) and inside
`sameElementRooting.ts`'s `dayMaster: DayMasterIdentityFact`. The Day branch's own hidden stems
(일지 지장간) remain fully catalogued in both `hiddenStems` arrays — only the visible DAY-position
ten-god slot is (correctly) absent.

### 9.8 Order invariance and duplicate-fact policy

Every provider's output is proven independent of the `pillars` object literal's key order. The same
underlying hidden stem legitimately appears as MULTIPLE distinct fact records across DIFFERENT
providers (e.g. once in `sameElementRooting`'s `hidden-stem:` namespace, once in `tenGodFacts`'s
`hidden-stem-ten-god:` namespace) — this is intentional multi-lens citation, never merged. Within any
single provider's own output for one chart, no two facts ever share a `factId`.

### 9.9 Corrections applied by the REMEDIATION batch

The first version of this contract (commit `4d98ec1`) contained three claims an independent audit
found to be **overclaims**. They are recorded here rather than quietly edited, because a freeze
contract that has silently changed its meaning is worse than one that shows its history.

| # | Overclaim as originally written | What was actually true | Fix |
|---|---|---|---|
| F1 | "candidate co-located **root** fact ids" | `rootsByPosition` was populated from `branch.hiddenStems`, the COMPLETE hidden-stem catalog — so a hidden stem of any *other* element was reported as an affected "root" it never was. A future reasoner would have received a false premise about what a clash could possibly be damaging. | `relationParticipants.ts` now filters to `sameElementAsDayMaster`. Four dedicated regression tests, incl. a cross-check that every reported id is a member of `sameElementRooting`'s own `sameElementRoots`. |
| F2 | "`factId` … free of incidental array-index dependence" | Relation fact ids embedded the detector's output index. Identity therefore changed whenever detector output order changed — the exact property the contract claimed to guarantee. | Ids rebuilt from semantic content only (§9.3). Regression test proves identity survives a genuine index shift. |
| F3 | "**Compile-time**: … the codebase fails to type-check" | Provably false twice over: `tsconfig.json` **excludes `**/*.test.ts`**, so `tsc --noEmit` never read the assertions; and Jest runs `tsconfig.jest.json` with `isolatedModules: true` (transpile-only, no semantic checking). Even had it been checked, the assertion shape reduced to `never` on violation, and `declare const x: never` is legal TS. | Real assertions moved to type-checked source, `contracts/factLayerTypeFirewall.ts`, using `AssertNever<T extends never>` (§9.5). Mutation-verified. |

Two further audit findings were test-coverage gaps rather than contract overclaims, and are also
closed: **F4** — the dedicated ten-god provider test covered only 90/100 (dayMaster, target) pairs,
skipping the diagonal; it now covers 100/100, since the provider excludes the DAY *position*, not the
Day Master's stem *value* appearing at another pillar (甲 년간 under a 甲 일간 is an ordinary chart
and must map to 比肩/PEER). **F5** — the fixture corpus permitted `seen.size >= 6`, so half the
supported relation kinds could vanish silently; it now requires every member of
`ALL_SUPPORTED_RELATION_KINDS`, which is itself compile-time-exhaustive over the frozen unions.

### 9.10 Root-only relation linkage (the F1 contract)

`candidateAffectedRootFactIds` — on both `BranchPairRelationParticipants` and
`BranchSetRelationParticipants` — contains **only genuine Day-Master same-element root fact ids**.

- **It means exactly**: "this root's branch is one of the branches participating in this detected
  relation." Co-occurrence. Nothing more.
- **It does NOT mean**: that the relation damages, weakens, destroys, protects, or transforms that
  root. Those are INFERENCE (§2) and remain unbuilt.
- **A non-Day-Master-element hidden stem sharing the branch is NEVER listed.** It is not a root, and
  labelling it a "candidate affected root" would hand a future reasoner a premise that is simply
  false. A relation touching branches that hold no DM root yields an **empty list**, and an empty
  list is a real, meaningful fact — not a computation failure.
- The complete hidden-stem catalog remains available, unfiltered, at
  `sameElementRooting.branches[].hiddenStems`, for any consumer that genuinely needs non-root stems.
