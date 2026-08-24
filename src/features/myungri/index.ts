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
  type DayMasterStrengthInputsResult,
  type StrengthHiddenEntry,
  type StrengthRole,
  type StrengthSide,
  type StrengthTenGodEntry,
} from './services/dayMasterStrengthInputs';
