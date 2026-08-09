import type {
  LunarMonthOrdinal,
  SajuPillarRuleProfile,
} from '../contracts/sajuRules';
import type { LocalDate } from '../domain/time';

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
