// DeokbunAI Myungri — connected time-axis (세운 · 월운 · 원국↔대운↔세운↔월운 관계).
//
// Claude-owned, engine-EXTERNAL. Consumes the frozen SAJU engine (ENGINE-12 + derived facts)
// read-only; never mutates `interpretation/**`. Pure logic — RN-free, node-test friendly.
export {
  DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE,
  branchRelations,
  branchSetRelations,
  stemRelation,
} from './rules/pillarRelations';
export type {
  BranchPairRelationFact,
  BranchPairRelationKind,
  BranchSetRelationFact,
  BranchSetRelationKind,
  StemRelationFact,
  StemRelationKind,
} from './rules/pillarRelations';

export {
  DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1_RULE,
  DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE,
  DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE,
  DEOKBUNAI_MYUNGRI_SEWOON_V1_RULE,
  DEOKBUNAI_MYUNGRI_TIME_AXIS_V1_RULE,
  DEOKBUNAI_MYUNGRI_WOLWOON_V1_RULE,
} from './domain/contracts';
export type {
  CrossLayerBranchRelation,
  CrossLayerStemRelation,
  HiddenStemTenGod,
  MyungriProvenance,
  MyungriStemAndBranch,
  MyungriTimeAxisResult,
  MyungriTimeAxisUnavailableReason,
  NatalPillarContext,
  PillarTenGodProfile,
  PositionedBranchRelation,
  PositionedStemRelation,
  RelationsToNatal,
  SewoonResult,
  SewoonUnavailableReason,
  TimeAxisLayer,
  WolwoonResult,
  WolwoonUnavailableReason,
} from './domain/contracts';

export { calculateSewoon, type SewoonCalculationInput } from './services/calculateSewoon';
export { calculateWolwoon, type WolwoonCalculationInput } from './services/calculateWolwoon';
export {
  calculateMyungriTimeAxis,
  type MyungriTimeAxisInput,
} from './services/calculateTimeAxis';
export { natalContextFromFourPillars } from './services/natalContext';
export { toSajuEvidence, type SajuEvidenceBundle } from './adapters/sajuEvidenceAdapter';
export {
  calculateNatalRelations,
  type NatalRelationsResult,
} from './services/natalRelations';
export {
  calculateSewoonForInstant,
  calculateWolwoonForInstant,
  resolveSajuTemporalForInstant,
  type SajuTemporalForInstant,
  type SewoonForInstantInput,
  type WolwoonForInstantInput,
} from './services/luckForInstant';
export {
  calculateDaewoonTenGods,
  type DaewoonCycleTenGods,
  type DaewoonTenGodsInput,
  type DaewoonTenGodsResult,
  type DaewoonTenGodsUnavailableReason,
} from './services/daewoonTenGods';
export {
  calculateRootingTransparency,
  type HiddenStemTransparency,
  type RootingMatch,
  type RootingTransparencyResult,
  type RootingTransparencyUnavailableReason,
  type StemRooting,
} from './services/rootingTransparency';
export {
  calculateMonthCommand,
  type MonthCommandResult,
  type MonthCommandStatus,
  type MonthCommandUnavailableReason,
  type Season,
  type SeasonalPhase,
} from './services/monthCommand';
export {
  buildRelationsToNatal,
  buildTenGodProfile,
  isEarthlyBranch,
  isHeavenlyStem,
  isValidNatalContext,
  myungriProvenance,
} from './services/pillarFacts';
export {
  DEOKBUNAI_MYUNGRI_STRENGTH_INPUTS_V1_RULE,
  calculateDayMasterStrengthInputs,
  tenGodSide,
  type DayMasterStrengthInputsResult,
  type StrengthHiddenEntry,
  type StrengthRole,
  type StrengthSide,
  type StrengthTenGodEntry,
} from './services/dayMasterStrengthInputs';
// natalStrength.ts / currentStrength.ts are intentionally NOT exported here (P0-07, Codex audit
// 2026-08-28: the seven-band classifier must not remain a public callable verdict authority once
// V2 is in development). NON_AUTHORITY / REFERENCE_ONLY — see their own file headers. Import
// directly from './services/natalStrength' / './services/currentStrength' only for the
// consistency tests that still exercise the candidate rule table; do not add a new caller.
// See src/features/myungri/__tests__/publicSurfaceQuarantine.test.ts for the enforcing guard.
export {
  buildMyungriTemporalContext,
  resolveActiveDaewoonAtInstant,
  type ActiveDaewoon,
  type ActiveDaewoonContext,
  type MyungriTemporalContext,
} from './services/temporalContext';

// ── MYUNGRI_STRENGTH_V1 deterministic FACT foundation (doctrine-neutral; see
//    docs/MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md) — FACTS ONLY, no strength/special-pattern/
//    transformation/Yongshin judgment anywhere below. ──────────────────────────────────────
export {
  DEOKBUNAI_MYUNGRI_SAME_ELEMENT_ROOTING_V1_RULE,
  calculateSameElementRooting,
  type BranchHiddenStemFacts,
  type DayMasterIdentityFact,
  type HiddenStemFact,
  type SameElementRootingResult,
} from './services/sameElementRooting';
export {
  DEOKBUNAI_MYUNGRI_TEN_GOD_FACTS_V1_RULE,
  calculateTenGodFacts,
  type HiddenStemTenGodFact,
  type TenGodFactsResult,
  type VisibleStemTenGodFact,
} from './services/tenGodFacts';
export {
  DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1_RULE,
  calculateRelationParticipants,
  type BranchPairRelationParticipants,
  type BranchSetRelationParticipants,
  type RelationParticipantsResult,
  type StemRelationParticipants,
} from './services/relationParticipants';
export {
  DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1_RULE,
  generalSeasonalPhase,
  generalSeasonalPhaseForMonthBranch,
  type GeneralSeasonalPhaseResult,
} from './services/generalSeasonalPhase';
export {
  DEOKBUNAI_MYUNGRI_SPECIAL_PATTERN_PREREQUISITES_V1_RULE,
  calculateSpecialPatternPrerequisites,
  type ElementCounts,
  type RoleCategory,
  type RoleCategoryPresenceFact,
  type SameElementRootPosition,
  type SpecialPatternPrerequisitesResult,
} from './services/specialPatternPrerequisites';
export {
  DEOKBUNAI_MYUNGRI_STRENGTH_FACT_BUNDLE_V1_RULE,
  buildMyungriStrengthFactBundle,
  type MyungriStrengthFactBundle,
  type StrengthFactBundleResult,
} from './services/strengthFactBundle';
