export type {
  BirthCalendarDate,
  CanonicalBirthInput,
  GeographicCoordinates,
  PlaceInput,
} from './domain/birth';
export type {
  EngineFact,
  EngineSignal,
  EvidenceId,
  EvidenceNode,
  FactConfidence,
  FactId,
  SignalDirection,
  SignalId,
} from './domain/evidence';
export type {
  EngineWarning,
  MissingDataItem,
  MissingDataReason,
  WarningSeverity,
} from './domain/issues';
export type {
  NormalizationError,
  NormalizationErrorCode,
  NormalizationStage,
  NormalizationWarning,
} from './domain/validation';
export type {
  ApproximateTimePeriod,
  BirthTimeInput,
  DstInput,
  LocalClockTime,
  LocalClockTimeRange,
  LocalDate,
  TemporalContext,
  TemporalDataSource,
  TimezoneInput,
  TrueSolarTimeOption,
} from './domain/time';
export type {
  EngineDescriptor,
  EngineId,
  EngineUnavailableReason,
} from './contracts/engine';
export type { EngineResult } from './contracts/result';
export type {
  HistoricalAuthorityStatus,
  HistoricalLocalTimeResolution,
  HistoricalSourceComparison,
  HistoricalSourceReference,
  HistoricalTimeProvenance,
  HistoricalTimeUnresolvedReason,
  HistoricalUtcCandidate,
  KoreaHistoricalTimePolicyDecision,
} from './contracts/historicalTime';
export type {
  BirthNormalizationResult,
  CalendarResolution,
  CalendarResolver,
  CivilLocalBirthTime,
  CivilLocalDateTime,
  DstResolution,
  EngineCapabilityAssessment,
  EngineCapabilityStatus,
  HistoricalTimezoneResolutionRequest,
  HistoricalTimezoneResolver,
  LunisolarCalendarResolver,
  NormalizedBirthInput,
  ResolvedLunarDate,
  ResolvedLunisolarCalendar,
  ResolutionProvenance,
  TimezoneResolution,
  TimezoneUnresolvedReason,
  UniqueTimezoneResolution,
  AmbiguousTimezoneResolution,
  NonexistentTimezoneResolution,
  UnresolvedTimezoneResolution,
  TrueSolarTimeResolution,
  TrueSolarTimeResolutionRequest,
  TrueSolarTimeResolver,
} from './contracts/normalization';
export type {
  SajuEngineExecutionInput,
  SajuEngineInput,
  SajuEngineOutput,
  SajuEngineResult,
  SajuEngineWarning,
  SajuPillarFact,
  SajuPillarFactKey,
} from './contracts/saju';
export {
  DEOKBUNAI_SAJU_V1_RULE_ID,
  DEOKBUNAI_SAJU_V1_RULE_PROFILE,
  DEOKBUNAI_SAJU_V1_RULE_VERSION,
  SAJU_LUNAR_MONTH_BRANCHES,
} from './contracts/sajuRules';
export type {
  LunarMonthOrdinal,
  SajuCalculationIdentity,
  SajuCivilMidnightPolicy,
  SajuDayBoundaryRule,
  SajuLeapMonthRule,
  SajuMonthEarthlyBranch,
  SajuMonthPillarRule,
  SajuPillarRuleProfile,
  SajuProductRuleGoldenCaseKind,
  SajuSolarTermRole,
  SajuTrueSolarTimeRule,
  SajuYearPillarRule,
  SajuYearMonthPillarCalculationInput,
} from './contracts/sajuRules';
export type { ZiweiEngineInput } from './contracts/ziwei';
export type {
  CanonicalEventInput,
  QimenEngineInput,
  QimenRequestBasis,
} from './contracts/qimen';
export type {
  CrossAgreement,
  CrossCoverage,
  CrossLogicInput,
  CrossLogicResult,
  CrossSignal,
  CrossSourceReference,
  CrossTension,
  NormalizedEngineResult,
} from './contracts/cross';
export {
  BIRTH_FINGERPRINT_SCHEMA_VERSION,
  BIRTH_FINGERPRINT_SCHEMA_VERSION_V3,
  CanonicalSerializationError,
  createBirthFingerprintFrame,
  createBirthFingerprintFrameV3,
  createBirthFingerprintPayload,
  createBirthFingerprintPayloadV3,
  serializeBirthFingerprintPayload,
} from './normalization/canonicalSerialization';
export type {
  BirthFingerprintPayload,
  BirthFingerprintPayloadV3,
} from './normalization/canonicalSerialization';
export { digestBirthFingerprintFrame } from './normalization/fingerprint';
export type {
  DigestProvider,
  Sha256Fingerprint,
} from './normalization/fingerprint';
export { normalizeBirthInput } from './normalization/birthNormalization';
export type {
  BirthNormalizationDependencies,
} from './normalization/birthNormalization';
export type {
  CalendarArtifactChecksum,
  CalendarDataset,
  CalendarDatasetManifest,
  CalendarDatasetSource,
  CalendarDateRange,
  CalendarIntegrityReport,
  CalendarOperationResult,
  CalendarResolutionError,
  CalendarResolutionErrorCode,
  LunarDateRange,
  LunarMonthKey,
  LunarMonthKind,
  LunarMonthLengthDays,
  LunarMonthRecord,
  ResolvedGregorianToLunar,
  ResolvedLunarToGregorian,
} from './calendar/contracts';
export {
  addGregorianDays,
  civilDayOrdinalToGregorian,
  compareGregorianDates,
  getGregorianMonthLength,
  gregorianToCivilDayOrdinal,
  isGregorianLeapYear,
  isValidGregorianDate,
} from './calendar/civilDay';
export {
  resolveGregorianToLunar,
  resolveLunarToGregorian,
} from './calendar/resolver';
export { validateCalendarDataset } from './calendar/integrity';
export {
  KASI_LUNISOLAR_CALENDAR_RESOLVER,
  resolveWithKasiCalendar,
} from './calendar/kasiCalendarResolver';
export {
  KASI_CALENDAR_DATASET,
  KASI_CALENDAR_MANIFEST,
  KASI_LUNAR_MONTH_RECORDS,
} from './calendar/data/kasiCalendarV1';
export {
  KASI_CALENDAR_GOLDEN_FIXTURES,
} from './calendar/fixtures/kasiCalendarGoldenFixtures';
export type {
  KasiCalendarGoldenFixture,
} from './calendar/fixtures/kasiCalendarGoldenFixtures';
export {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
} from './saju/contracts';
export type {
  EarthlyBranch,
  HeavenlyStem,
  SajuYearMonthPillars,
  SexagenaryIndex,
  SexagenaryPillar,
  SexagenaryResult,
  SexagenaryValidationError,
  SexagenaryValidationErrorCode,
} from './saju/contracts';
export {
  advanceSexagenaryIndex,
  floorMod,
  isValidSexagenaryPair,
  pillarToSexagenaryIndex,
  sexagenaryIndexToPillar,
} from './saju/sexagenary';
export {
  calculateMonthPillar,
  calculateYearMonthPillars,
  calculateYearPillar,
} from './saju/pillars';
export {
  SEXAGENARY_YEAR_GOLDEN_FIXTURES,
} from './saju/fixtures/sexagenaryGoldenFixtures';
export type {
  SexagenaryYearGoldenFixture,
} from './saju/fixtures/sexagenaryGoldenFixtures';
export { validateSexagenaryInvariants } from './saju/validation';
export type { SexagenaryInvariantReport } from './saju/validation';
export {
  calculateDayPillar,
  DEOKBUNAI_SAJU_DAY_V1_RULE,
} from './saju/dayPillar';
export type { SajuDayPillarRuleDescriptor } from './saju/contracts';
export {
  DAY_PILLAR_GOLDEN_FIXTURES,
} from './saju/fixtures/dayPillarGoldenFixtures';
export type {
  DayPillarGoldenFixture,
} from './saju/fixtures/dayPillarGoldenFixtures';
export {
  calculateHourPillar,
  DEOKBUNAI_SAJU_HOUR_V1_RULE,
  resolveHourBranch,
} from './saju/hourPillar';
export type {
  ExactLocalCivilTime,
  SajuHourPillarInput,
  SajuHourPillarRuleDescriptor,
} from './saju/contracts';
export {
  HOUR_BRANCH_BOUNDARY_FIXTURES,
  HOUR_PILLAR_GOLDEN_FIXTURES,
} from './saju/fixtures/hourPillarGoldenFixtures';
export type {
  HourBranchBoundaryFixture,
  HourPillarGoldenFixture,
} from './saju/fixtures/hourPillarGoldenFixtures';
export { calculateFourPillars } from './saju/fourPillars';
export type {
  SajuFourPillars,
  SajuFourPillarsCalculationIdentity,
  SajuFourPillarsCalculationInput,
  SajuFourPillarsHour,
  SajuFourPillarsHourUnavailableReason,
  SajuFourPillarsProvenance,
  SajuFourPillarsResult,
  SajuFourPillarsUnavailableReason,
} from './saju/contracts';
export { FOUR_PILLARS_GOLDEN_FIXTURES } from './saju/fixtures/fourPillarsGoldenFixtures';
export type { FourPillarsGoldenFixture } from './saju/fixtures/fourPillarsGoldenFixtures';
export {
  DEOKBUNAI_SAJU_ENGINE_VERSION,
  DEOKBUNAI_SAJU_RULE_SET_VERSION,
  NORMALIZATION_WARNING_SEVERITY,
  SAJU_HOUR_WARNING_SEVERITY,
  executeSaju,
} from './saju/engineAdapter';
export { executeSajuFromBirthInput } from './saju/birthExecutionBridge';
export type {
  SajuBirthExecutionDependencies,
  SajuBirthExecutionResult,
} from './saju/birthExecutionBridge';
export type {
  BranchRuleLookup,
  FiveElement,
  HiddenStemDefinition,
  HiddenStemRole,
  SajuDerivedBranchAnnotation,
  SajuDerivedFacts,
  SajuDerivedFactsError,
  SajuDerivedFactsErrorCode,
  SajuDerivedFactsInput,
  SajuDerivedFactsResult,
  SajuDerivedFactsRuleVersions,
  SajuDerivedHiddenStemAnnotation,
  SajuDerivedPillarAnnotation,
  SajuDerivedStemAnnotation,
  SajuPillarPosition,
  StemRuleLookup,
  TenGod,
  YinYang,
} from './saju/derived/contracts';
export {
  BRANCH_ELEMENTS,
  BRANCH_YIN_YANG,
  calculateTenGod,
  DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS,
  DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION,
  DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION,
  DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION,
  DEOKBUNAI_SAJU_TEN_GODS_VERSION,
  DEOKBUNAI_SAJU_YIN_YANG_VERSION,
  getBranchElement,
  getBranchRule,
  getBranchYinYang,
  getHiddenStems,
  getStemElement,
  getStemRule,
  getStemYinYang,
  HIDDEN_STEMS,
  STEM_ELEMENTS,
  STEM_YIN_YANG,
} from './saju/derived/rules';
export { calculateSajuDerivedFacts } from './saju/derived/calculateDerivedFacts';
export type {
  HistoricalTimezoneArtifact,
  HistoricalTimezoneArtifactManifest,
  HistoricalTimezoneOfficialCrossCheck,
  HistoricalTimezoneState,
  HistoricalTimezoneTransition,
  TimezoneArtifactChecksum,
} from './timezone/contracts';
export {
  ASIA_SEOUL_TZDB_2026C_ARTIFACT,
  ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256,
} from './timezone/data/asiaSeoulTzdb2026c';
export {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_ID,
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_VERSION,
  createAsiaSeoulHistoricalTimezoneResolver,
} from './timezone/historicalTimezoneResolver';
export { ASIA_SEOUL_GOLDEN_FIXTURES } from './timezone/fixtures/asiaSeoulGoldenFixtures';
export type { AsiaSeoulGoldenFixture } from './timezone/fixtures/asiaSeoulGoldenFixtures';
