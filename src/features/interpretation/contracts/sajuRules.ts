import type { EngineDescriptor } from './engine';

export const DEOKBUNAI_SAJU_V1_RULE_ID = 'DEOKBUNAI_SAJU_V1' as const;
export const DEOKBUNAI_SAJU_V1_RULE_VERSION =
  'deokbunai.saju-pillar-rules.v1' as const;

export type SajuYearPillarRule = 'LUNAR_YEAR';
export type SajuMonthPillarRule = 'LUNAR_MONTH';
export type SajuLeapMonthRule = 'LEAP_MONTH_SAME_ORDINAL';
export type SajuDayBoundaryRule = 'CIVIL_MIDNIGHT';
export type SajuTrueSolarTimeRule = 'DO_NOT_APPLY';
export type SajuSolarTermRole =
  'NOT_USED_FOR_YEAR_OR_MONTH_PILLARS';

export type SajuPillarRuleProfile = {
  ruleId: typeof DEOKBUNAI_SAJU_V1_RULE_ID;
  ruleVersion: typeof DEOKBUNAI_SAJU_V1_RULE_VERSION;
  yearPillarRule: SajuYearPillarRule;
  monthPillarRule: SajuMonthPillarRule;
  leapMonthRule: SajuLeapMonthRule;
  dayBoundaryRule: SajuDayBoundaryRule;
  trueSolarTimeRule: SajuTrueSolarTimeRule;
  solarTermRole: SajuSolarTermRole;
};

export const DEOKBUNAI_SAJU_V1_RULE_PROFILE: SajuPillarRuleProfile = {
  ruleId: DEOKBUNAI_SAJU_V1_RULE_ID,
  ruleVersion: DEOKBUNAI_SAJU_V1_RULE_VERSION,
  yearPillarRule: 'LUNAR_YEAR',
  monthPillarRule: 'LUNAR_MONTH',
  leapMonthRule: 'LEAP_MONTH_SAME_ORDINAL',
  dayBoundaryRule: 'CIVIL_MIDNIGHT',
  trueSolarTimeRule: 'DO_NOT_APPLY',
  solarTermRole: 'NOT_USED_FOR_YEAR_OR_MONTH_PILLARS',
};

export type SajuMonthEarthlyBranch =
  | 'YIN'
  | 'MAO'
  | 'CHEN'
  | 'SI'
  | 'WU'
  | 'WEI'
  | 'SHEN'
  | 'YOU'
  | 'XU'
  | 'HAI'
  | 'ZI'
  | 'CHOU';

export type LunarMonthOrdinal =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

/**
 * The future Sexagenary Core consumes normalized lunar values only. It must
 * not perform calendar conversion or consult solar terms.
 */
export type SajuYearMonthPillarCalculationInput = {
  lunarYear: number;
  lunarMonth: LunarMonthOrdinal;
  lunarMonthKind: 'REGULAR' | 'LEAP';
  ruleProfile: SajuPillarRuleProfile;
};

/** Lunar month ordinal 1..12 maps to YIN..CHOU in this exact order. */
export const SAJU_LUNAR_MONTH_BRANCHES: readonly SajuMonthEarthlyBranch[] = [
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
  'ZI',
  'CHOU',
];

export type SajuCalculationIdentity = {
  normalizedBirthFingerprint: string;
  ruleId: SajuPillarRuleProfile['ruleId'];
  ruleVersion: SajuPillarRuleProfile['ruleVersion'];
  /** Must equal EngineDescriptor.ruleSetVersion for a produced result. */
  engineRuleSetVersion: EngineDescriptor['ruleSetVersion'];
};

export type SajuProductRuleGoldenCaseKind =
  | 'GREGORIAN_JANUARY_TO_PREVIOUS_LUNAR_NOVEMBER'
  | 'GREGORIAN_JANUARY_TO_PREVIOUS_LUNAR_DECEMBER'
  | 'LUNAR_NEW_YEAR_BOUNDARY'
  | 'LUNAR_YEAR_END_TO_NEW_YEAR'
  | 'GREGORIAN_LUNAR_SAME_CIVIL_DATE'
  | 'REGULAR_LUNAR_MONTH'
  | 'LEAP_LUNAR_MONTH'
  | 'LUNAR_MONTH_BOUNDARY'
  | 'LICHUN_DOES_NOT_CHANGE_LUNAR_YEAR_PILLAR'
  | 'SOLAR_TERM_DOES_NOT_CHANGE_LUNAR_MONTH_PILLAR'
  | 'INTENTIONAL_LIBRARY_DEFAULT_DIFFERENCE'
  | 'CIVIL_TIME_2300_BOUNDARY'
  | 'CIVIL_MIDNIGHT_BOUNDARY';

/**
 * With CIVIL_MIDNIGHT, Zi spans 23:00..01:00 while the day stem changes at
 * 00:00: 23:00..23:59:59 uses the current civil date and 00:00..00:59:59
 * uses the next civil date. EARLY_ZI_23 is not a DeokbunAI V1 rule.
 */
export type SajuCivilMidnightPolicy = {
  ziHourStartsAt: '23:00:00';
  civilDayChangesAt: '00:00:00';
  ziHourEndsAt: '01:00:00';
};
