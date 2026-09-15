import type { NormalizedBirthInput } from '../../contracts/normalization';
import type { LocalClockTime, LocalDate } from '../../domain/time';
import type { CanonicalSolarTermInstant } from '../../solarTerm/lunarJsSolarTermAdapter';
import type { SexagenaryPillar } from '../contracts';

export const DEOKBUNAI_DAEWOON_V1_RULE = {
  ruleId: 'DEOKBUNAI_SAJU_DAEWOON_V1',
  ruleVersion: 'deokbunai.saju-daewoon.v1',
  directionRule: 'YANG_MALE_YIN_FEMALE_FORWARD',
  progressionRule: 'MONTH_PILLAR_ONE_STEP_PER_TEN_YEAR_CYCLE',
  intervalRule: 'DIRECTIONAL_NEAREST_JIE',
  startOffsetRule: 'THREE_DAYS_ONE_YEAR_MINUTE_DECOMPOSITION',
  roundingRule: 'NEAREST_WHOLE_YEAR_HALF_UP',
  boundaryPrecision: 'MINUTE',
  cycleCount: 10,
} as const;

export type DaewoonDirection = 'FORWARD' | 'REVERSE';

export type SajuDaewoonCalculationInput = {
  normalizedBirth: NormalizedBirthInput;
  yearPillar: SexagenaryPillar;
  monthPillar: SexagenaryPillar;
};

export type DaewoonStartOffset = {
  sourceIntervalMinutes: number;
  rawStartAgeYears: number;
  roundedStartAgeYears: number;
  symbolicOffset: {
    years: number;
    months: number;
    days: number;
    hours: number;
  };
};

export type DaewoonStartTiming = {
  birthLocalDateTime: {
    date: LocalDate;
    time: Required<LocalClockTime>;
    zoneId: 'Asia/Seoul';
  };
  symbolicLocalDateTime: {
    date: LocalDate;
    time: Required<LocalClockTime>;
    zoneId: 'Asia/Seoul';
  };
  rule: 'ADD_SYMBOLIC_START_OFFSET_TO_BIRTH_LOCAL_CIVIL_TIME';
};

export type DaewoonCycle = {
  ordinal: number;
  pillar: SexagenaryPillar;
  startAgeInclusive: number;
  endAgeInclusive: number;
};

export type DaewoonProvenance = {
  ruleId: typeof DEOKBUNAI_DAEWOON_V1_RULE.ruleId;
  ruleVersion: typeof DEOKBUNAI_DAEWOON_V1_RULE.ruleVersion;
  directionRule: typeof DEOKBUNAI_DAEWOON_V1_RULE.directionRule;
  progressionRule: typeof DEOKBUNAI_DAEWOON_V1_RULE.progressionRule;
  intervalRule: typeof DEOKBUNAI_DAEWOON_V1_RULE.intervalRule;
  startOffsetRule: typeof DEOKBUNAI_DAEWOON_V1_RULE.startOffsetRule;
  roundingRule: typeof DEOKBUNAI_DAEWOON_V1_RULE.roundingRule;
  solarTerm: {
    provider: 'lunar-javascript';
    providerVersion: '1.7.7';
    adapterRuleVersion: 'deokbunai.solar-term-lunarjs-adapter.v1';
    solarTermRuleVersion: 'deokbunai.solar-term.v1';
    sourceTimeBasis: 'FIXED_UTC_PLUS_08';
    canonicalBoundaryPrecision: 'MINUTE';
  };
  timezoneDataVersion?: string;
};

type SajuDaewoonResultBase = {
  ruleVersion: typeof DEOKBUNAI_DAEWOON_V1_RULE.ruleVersion;
  provenance: DaewoonProvenance;
  assumptions: readonly string[];
  limitations: readonly string[];
};

export type DaewoonAmbiguousReason =
  | 'BIRTH_TIME_APPROXIMATE'
  | 'LOCAL_TIME_AMBIGUOUS'
  | 'SOLAR_TERM_BOUNDARY_MINUTE';

export type DaewoonUnavailableReason =
  | 'BIRTH_TIME_UNKNOWN'
  | 'EXACT_LOCAL_TIME_INCOMPLETE'
  | 'LOCAL_TIME_NONEXISTENT'
  | 'TIMEZONE_UNRESOLVED'
  | 'UNSUPPORTED_TIMEZONE'
  | 'UNSUPPORTED_DATE_RANGE'
  | 'GENDER_UNSPECIFIED'
  | 'INVALID_YEAR_PILLAR'
  | 'INVALID_MONTH_PILLAR'
  | 'SOLAR_TERM_UNAVAILABLE'
  | 'CALCULATION_INVARIANT_FAILED';

export type SajuDaewoonResult =
  | (SajuDaewoonResultBase & {
      capability: 'AVAILABLE';
      direction: DaewoonDirection;
      selectedBoundary: CanonicalSolarTermInstant;
      start: DaewoonStartOffset & { timing: DaewoonStartTiming };
      cycles: readonly DaewoonCycle[];
    })
  | (SajuDaewoonResultBase & {
      capability: 'AMBIGUOUS';
      reason: DaewoonAmbiguousReason;
    })
  | (SajuDaewoonResultBase & {
      capability: 'UNAVAILABLE';
      reason: DaewoonUnavailableReason;
    });
