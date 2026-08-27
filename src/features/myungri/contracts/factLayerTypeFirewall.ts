// MYUNGRI_STRENGTH_V1 FACT LAYER — REAL COMPILE-TIME FIREWALL.
//
// WHY THIS IS A `.ts` SOURCE FILE AND NOT A `.test.ts` FILE (audit finding F3):
// the previous firewall lived in `__tests__/detectionEffectFirewall.test.ts` and was NOT a
// compile-time proof at all, for two independent reasons:
//   1. `tsconfig.json` EXCLUDES `**/*.test.ts`, so `tsc --noEmit` never type-checked it, and Jest
//      transpiles tests without semantic type checking — nothing in the validation pipeline ever
//      evaluated those assertions.
//   2. Its assertion shape (`declare const x: Assert<T> & true`) reduced to `never` on violation,
//      and `declare const x: never` is perfectly legal TypeScript — so it could not have failed
//      even if it HAD been checked.
//
// This file fixes both. It is ordinary source, so `npx tsc --noEmit` (already run by `npm run
// preflight` AND `npm run release-preflight`) type-checks it on every validation run, and the
// assertion below genuinely fails compilation on violation:
//
//   type AssertNever<T extends never> = T
//
// If `Extract<keyof SomeFactType, ForbiddenFactKey>` is anything other than `never`, the constraint
// `T extends never` is violated and tsc emits TS2344 ("Type '"transformed"' does not satisfy the
// constraint 'never'"). Verified empirically, not assumed.
//
// It emits ONE runtime value group (the canonical relation-kind arrays at the bottom), which exist
// so tests can assert coverage against a compile-time-exhaustive list instead of a hard-coded count.
// It contains NO judgment, NO inference, and NO verdict of any kind.
import type {
  BranchPairRelationKind, BranchSetRelationKind, StemRelationKind,
} from '../rules/pillarRelations';
import type {
  BranchHiddenStemFacts, DayMasterIdentityFact, HiddenStemFact, SameElementRootingResult,
} from '../services/sameElementRooting';
import type {
  HiddenStemTenGodFact, TenGodFactsResult, VisibleStemTenGodFact,
} from '../services/tenGodFacts';
import type {
  BranchPairRelationParticipants, BranchSetRelationParticipants, RelationParticipantsResult,
  StemRelationParticipants,
} from '../services/relationParticipants';
import type { GeneralSeasonalPhaseResult } from '../services/generalSeasonalPhase';
import type {
  ElementCounts, RoleCategoryPresenceFact, SameElementRootPosition,
  SpecialPatternPrerequisitesResult,
} from '../services/specialPatternPrerequisites';
import type { MyungriStrengthFactBundle, StrengthFactBundleResult } from '../services/strengthFactBundle';

/**
 * Compile-time assertion primitive. Instantiating it with anything other than `never` violates the
 * `T extends never` constraint and FAILS THE BUILD with TS2344.
 */
type AssertNever<T extends never> = T;

/**
 * Every key name that would represent an INFERENCE or VERDICT rather than a deterministic FACT.
 * Adding a field with any of these names to any fact type below breaks compilation — by design.
 * See docs/MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md §9.2 for the governing contract.
 */
export type ForbiddenFactKey =
  // relation effect / transformation
  | 'transformed' | 'transformationSucceeded' | 'transformationSuccessful' | 'transformationStatus'
  | 'huaCheng' | 'huaChengLi' | 'bureauFormed' | 'structuralElement' | 'combinationSuccessful'
  | 'effect' | 'functionalEffect' | 'strengthEffect' | 'relationEffect'
  // root function / survival
  | 'rootDestroyed' | 'rootWeakened' | 'rootSurvived' | 'rootStrength' | 'rootRank'
  | 'rootSurvivability' | 'rootIntegrity' | 'rootFunction' | 'functionalForce' | 'structuralDominance'
  // strength verdict / seven band
  | 'weak' | 'strong' | 'balanced' | 'strength' | 'strengthBand' | 'confidence'
  // special pattern verdict
  | 'specialPatternStatus' | 'specialPatternConfirmed' | 'specialPatternScore' | 'specialPatternVerdict'
  | 'congCaiCandidate' | 'congGuanShaCandidate' | 'congErCandidate'
  // climate / Yongshin
  | 'climate' | 'yongshin' | 'heesin' | 'gisin';

/** Extracts the forbidden keys actually present on T — `never` when T is clean. */
type ForbiddenKeysOf<T> = Extract<keyof T, ForbiddenFactKey>;

// ── One assertion per exported fact type. Each MUST resolve to `never`. ────────────────────────
// These are exported so `noUnusedLocals`-style checks can never silently drop them.
export type _FirewallHiddenStemFact = AssertNever<ForbiddenKeysOf<HiddenStemFact>>;
export type _FirewallBranchHiddenStemFacts = AssertNever<ForbiddenKeysOf<BranchHiddenStemFacts>>;
export type _FirewallDayMasterIdentityFact = AssertNever<ForbiddenKeysOf<DayMasterIdentityFact>>;
export type _FirewallSameElementRooting =
  AssertNever<ForbiddenKeysOf<Extract<SameElementRootingResult, { capability: 'AVAILABLE' }>>>;

export type _FirewallVisibleStemTenGodFact = AssertNever<ForbiddenKeysOf<VisibleStemTenGodFact>>;
export type _FirewallHiddenStemTenGodFact = AssertNever<ForbiddenKeysOf<HiddenStemTenGodFact>>;
export type _FirewallTenGodFacts =
  AssertNever<ForbiddenKeysOf<Extract<TenGodFactsResult, { capability: 'AVAILABLE' }>>>;

export type _FirewallStemRelationParticipants = AssertNever<ForbiddenKeysOf<StemRelationParticipants>>;
export type _FirewallBranchPairRelationParticipants =
  AssertNever<ForbiddenKeysOf<BranchPairRelationParticipants>>;
export type _FirewallBranchSetRelationParticipants =
  AssertNever<ForbiddenKeysOf<BranchSetRelationParticipants>>;
export type _FirewallRelationParticipants =
  AssertNever<ForbiddenKeysOf<Extract<RelationParticipantsResult, { capability: 'AVAILABLE' }>>>;

export type _FirewallGeneralSeasonalPhase =
  AssertNever<ForbiddenKeysOf<Extract<GeneralSeasonalPhaseResult, { capability: 'AVAILABLE' }>>>;

export type _FirewallElementCounts = AssertNever<ForbiddenKeysOf<ElementCounts>>;
export type _FirewallRoleCategoryPresenceFact = AssertNever<ForbiddenKeysOf<RoleCategoryPresenceFact>>;
export type _FirewallSameElementRootPosition = AssertNever<ForbiddenKeysOf<SameElementRootPosition>>;
export type _FirewallSpecialPatternPrerequisites =
  AssertNever<ForbiddenKeysOf<Extract<SpecialPatternPrerequisitesResult, { capability: 'AVAILABLE' }>>>;

// `future` is EXCLUDED from this one assertion because its key names are deliberately named after
// the forbidden concepts — it is a permanently-`undefined` documentation placeholder, never a
// value. That every one of its members is `undefined`-typed is asserted separately, below.
export type _FirewallStrengthFactBundle =
  AssertNever<ForbiddenKeysOf<Omit<MyungriStrengthFactBundle, 'future'>>>;
export type _FirewallStrengthFactBundleResult =
  AssertNever<ForbiddenKeysOf<Extract<StrengthFactBundleResult, { capability: 'AVAILABLE' }>>>;

/**
 * The `future` placeholder block must stay VALUE-LESS. This asserts every one of its members is
 * typed exactly `undefined` — if a future edit ever gives one a real type, `Exclude<..., undefined>`
 * stops being `never` and the build fails.
 */
export type _FirewallFuturePlaceholdersAreAllUndefined =
  AssertNever<Exclude<MyungriStrengthFactBundle['future'][keyof MyungriStrengthFactBundle['future']], undefined>>;

// ── Canonical relation-kind sets (runtime values) ──────────────────────────────────────────────
// Exported so coverage tests assert against a compile-time-exhaustive list rather than a magic
// number. `satisfies` pins each entry to a real union member; the `AssertNever<Exclude<...>>` lines
// below fail the build if a NEW kind is ever added to the union without being listed here.

export const ALL_STEM_RELATION_KINDS = [
  'STEM_COMBINATION', 'STEM_CLASH',
] as const satisfies readonly StemRelationKind[];

export const ALL_BRANCH_PAIR_RELATION_KINDS = [
  'BRANCH_SIX_COMBINATION', 'BRANCH_CLASH', 'BRANCH_HALF_THREE_HARMONY', 'BRANCH_PUNISHMENT',
  'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM',
] as const satisfies readonly BranchPairRelationKind[];

export const ALL_BRANCH_SET_RELATION_KINDS = [
  'BRANCH_THREE_HARMONY', 'BRANCH_DIRECTIONAL_UNION', 'BRANCH_THREE_PUNISHMENT',
] as const satisfies readonly BranchSetRelationKind[];

export type _ExhaustiveStemRelationKinds =
  AssertNever<Exclude<StemRelationKind, (typeof ALL_STEM_RELATION_KINDS)[number]>>;
export type _ExhaustiveBranchPairRelationKinds =
  AssertNever<Exclude<BranchPairRelationKind, (typeof ALL_BRANCH_PAIR_RELATION_KINDS)[number]>>;
export type _ExhaustiveBranchSetRelationKinds =
  AssertNever<Exclude<BranchSetRelationKind, (typeof ALL_BRANCH_SET_RELATION_KINDS)[number]>>;

/** Every relation kind the fact layer supports — the canonical coverage target. */
export const ALL_SUPPORTED_RELATION_KINDS = [
  ...ALL_STEM_RELATION_KINDS,
  ...ALL_BRANCH_PAIR_RELATION_KINDS,
  ...ALL_BRANCH_SET_RELATION_KINDS,
] as const;
