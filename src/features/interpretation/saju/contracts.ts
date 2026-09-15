import type {
  LunarMonthOrdinal,
  SajuCalculationIdentity,
  SajuPillarRuleProfile,
} from '../contracts/sajuRules';
import type { LocalClockTime, LocalDate } from '../domain/time';
import type {
  CivilLocalBirthTime,
  CalendarResolution,
  TimezoneResolution,
  TrueSolarTimeResolution,
} from '../contracts/normalization';

export const HEAVENLY_STEMS = [
  'JIA',
  'YI',
  'BING',
  'DING',
  'WU',
  'JI',
  'GENG',
  'XIN',
  'REN',
  'GUI',
] as const;

export const EARTHLY_BRANCHES = [
  'ZI',
  'CHOU',
  'YIN',
  'MAO',
  'CHEN',
  'SI',
  'WU',
  'WEI',
  'SHEN',
  'YOU',
  'XU',
  'HAI',
] as const;

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

declare const sexagenaryIndexBrand: unique symbol;

/** Canonical zero-based index in the inclusive range 0..59. */
export type SexagenaryIndex = number & {
  readonly [sexagenaryIndexBrand]: 'SexagenaryIndex';
};

export type SexagenaryPillar = {
  index: SexagenaryIndex;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
};

export type SexagenaryValidationErrorCode =
  | 'NON_FINITE_INTEGER'
  | 'INVALID_STEM'
  | 'INVALID_BRANCH'
  | 'INVALID_SEXAGENARY_PAIR'
  | 'INVALID_GREGORIAN_DATE'
  | 'INVALID_LOCAL_TIME'
  | 'UNSUPPORTED_DATE_RANGE'
  | 'INVALID_LUNAR_YEAR'
  | 'INVALID_LUNAR_MONTH'
  | 'INVALID_LUNAR_MONTH_KIND'
  | 'UNSUPPORTED_RULE_PROFILE';

export type SexagenaryValidationError = {
  code: SexagenaryValidationErrorCode;
  field: string;
  message: string;
  receivedValue?: unknown;
};

export type SexagenaryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: SexagenaryValidationError };

export type SajuYearMonthPillars = {
  year: SexagenaryPillar;
  month: SexagenaryPillar;
  lunarYear: number;
  lunarMonth: LunarMonthOrdinal;
  lunarMonthKind: 'REGULAR' | 'LEAP';
  ruleProfile: SajuPillarRuleProfile;
};

export type SajuDayPillarRuleDescriptor = {
  readonly ruleId: 'DEOKBUNAI_SAJU_DAY_V1';
  readonly ruleVersion: 'deokbunai.saju-day-pillar-rules.v1';
  readonly calendarBasis: 'GREGORIAN_CIVIL_DATE';
  readonly dayBoundary: 'CIVIL_MIDNIGHT';
  readonly anchorDate: Readonly<LocalDate>;
  readonly anchorPillar: 'JIA-ZI';
  readonly anchorIndex: 0;
  readonly authority: 'KASI_LUN_ILJIN';
  readonly supportedRange: {
    readonly start: Readonly<LocalDate>;
    readonly end: Readonly<LocalDate>;
  };
};

export type ExactLocalCivilTime = Required<LocalClockTime>;

export type SajuHourPillarInput = {
  dayStem: HeavenlyStem;
  localTime: ExactLocalCivilTime;
};

export type SajuHourPillarRuleDescriptor = {
  readonly ruleId: 'DEOKBUNAI_SAJU_HOUR_V1';
  readonly ruleVersion: 'deokbunai.saju-hour-pillar-rules.v1';
  readonly timeBasis: 'LOCAL_CIVIL_TIME';
  readonly dayBoundary: 'CIVIL_MIDNIGHT';
  readonly ziHourRange: '23:00:00..00:59:59';
  readonly trueSolarTime: 'DO_NOT_APPLY';
  readonly authority: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE';
};

export type SajuFourPillarsCalculationInput = {
  normalizedBirthFingerprint: string;
  normalized: {
    calendar: CalendarResolution;
    civilLocal: CivilLocalBirthTime;
    timezone: TimezoneResolution;
    trueSolarTime: TrueSolarTimeResolution;
  };
  ruleProfile: SajuPillarRuleProfile;
  engineRuleSetVersion: string;
};

export type SajuFourPillarsHourUnavailableReason =
  | 'BIRTH_TIME_UNKNOWN'
  | 'BIRTH_TIME_APPROXIMATE_AMBIGUOUS'
  | 'EXACT_LOCAL_TIME_INCOMPLETE'
  | 'INVALID_LOCAL_TIME'
  | 'LOCAL_TIME_AMBIGUOUS'
  | 'LOCAL_TIME_NONEXISTENT'
  | 'HISTORICAL_TIME_UNRESOLVED'
  | 'HISTORICAL_SOURCE_CONFLICT';

export type SajuFourPillarsHour =
  | {
      status: 'AVAILABLE';
      pillar: SexagenaryPillar;
    }
  | {
      status: 'AMBIGUOUS';
      reason:
        | 'BIRTH_TIME_APPROXIMATE_AMBIGUOUS'
        | 'LOCAL_TIME_AMBIGUOUS';
    }
  | {
      status: 'UNAVAILABLE';
      reason: Exclude<
        SajuFourPillarsHourUnavailableReason,
        'BIRTH_TIME_APPROXIMATE_AMBIGUOUS' | 'LOCAL_TIME_AMBIGUOUS'
      >;
    };

export type SajuFourPillars = {
  year: SexagenaryPillar;
  month: SexagenaryPillar;
  day: SexagenaryPillar;
  hour: SajuFourPillarsHour;
};

export type SajuFourPillarsCalculationIdentity = SajuCalculationIdentity & {
  dayRuleVersion: SajuDayPillarRuleDescriptor['ruleVersion'];
  hourRuleVersion: SajuHourPillarRuleDescriptor['ruleVersion'];
};

/**
 * Explicit Saju year/month BOUNDARY attribution (立春 year, 12 Jie month). Distinct from
 * `productRule`, which describes the sexagenary + Five-Tiger STEM/BRANCH arithmetic (that math
 * needs no solar longitude); this records how the birth instant is MAPPED to a Saju year/month.
 */
export type SajuYearMonthAttributionProvenance = {
  ruleId: string;
  ruleVersion: string;
  yearBoundary: 'START_OF_SPRING_IPCHUN';
  monthBoundary: 'TWELVE_JIE_JIEQI';
  solarTerm: {
    provider: 'lunar-javascript';
    providerVersion: string;
    adapterRuleVersion: string;
    solarTermRuleVersion: string;
    boundaryPrecision: 'MINUTE';
  };
};

export type SajuFourPillarsProvenance = {
  normalizedBirthFingerprint: string;
  productRule: SajuPillarRuleProfile;
  yearMonthAttributionRule: SajuYearMonthAttributionProvenance;
  dayRule: SajuDayPillarRuleDescriptor;
  hourRule: SajuHourPillarRuleDescriptor;
  calendarDatasetVersion: string;
  calendarConversionRuleVersion: string;
  engineRuleSetVersion: string;
};

export type SajuFourPillarsUnavailableReason =
  | {
      code: 'CALENDAR_UNRESOLVED';
      calendarReason: Extract<CalendarResolution, { status: 'UNRESOLVED' }>['reason'];
    }
  | { code: 'NORMALIZED_DATE_MISMATCH' }
  | { code: 'NORMALIZED_INPUT_INCONSISTENT' }
  | { code: 'PRODUCT_RULE_VIOLATION' }
  | { code: 'INVALID_CALCULATION_IDENTITY' }
  | { code: 'YEAR_MONTH_ATTRIBUTION_FAILED'; attributionReason: string }
  | { code: 'CORE_CALCULATION_FAILED'; coreErrorCode: SexagenaryValidationErrorCode };

type SajuFourPillarsAvailableResult = {
  pillars: SajuFourPillars;
  identity: SajuFourPillarsCalculationIdentity;
  provenance: SajuFourPillarsProvenance;
};

export type SajuFourPillarsResult =
  | (SajuFourPillarsAvailableResult & { status: 'COMPLETE' })
  | (SajuFourPillarsAvailableResult & { status: 'PARTIAL' })
  | {
      status: 'UNAVAILABLE';
      normalizedBirthFingerprint: string;
      reason: SajuFourPillarsUnavailableReason;
    };
