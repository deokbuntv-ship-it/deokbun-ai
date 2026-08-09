import type { LocalDate } from '../domain/time';

export type LunarMonthKind = 'REGULAR' | 'LEAP';

export type LunarMonthLengthDays = 29 | 30;

export type LunarMonthKey = {
  lunarYear: number;
  lunarMonth: number;
  lunarMonthKind: LunarMonthKind;
};

export type LunarMonthRecord = LunarMonthKey & {
  gregorianStartDate: LocalDate;
  lengthDays: LunarMonthLengthDays;
};

export type CalendarDateRange = {
  start: LocalDate;
  end: LocalDate;
};

export type LunarDateRange = {
  start: LunarMonthKey & { lunarDay: number };
  end: LunarMonthKey & { lunarDay: number };
};

export type CalendarDatasetSource = {
  identity: string;
  revision: string;
  acquisitionDate: string;
};

export type CalendarArtifactChecksum = {
  algorithm: string;
  value: string;
};

export type CalendarDatasetManifest = {
  schemaVersion: string;
  datasetVersion: string;
  source: CalendarDatasetSource;
  artifactChecksum: CalendarArtifactChecksum;
  supportedGregorianRange: CalendarDateRange;
  supportedLunarRange: LunarDateRange;
  artifactCoverageRange: CalendarDateRange;
  recordCount: number;
  conversionRuleVersion: string;
};

export type CalendarDataset = {
  manifest: CalendarDatasetManifest;
  /** Ordered by gregorianStartDate ascending. */
  records: readonly LunarMonthRecord[];
};

export type CalendarResolutionErrorCode =
  | 'INVALID_GREGORIAN_DATE'
  | 'INVALID_LUNAR_DATE'
  | 'INVALID_LUNAR_MONTH_KIND'
  | 'LEAP_MONTH_NOT_PRESENT'
  | 'DAY_EXCEEDS_MONTH_LENGTH'
  | 'UNSUPPORTED_GREGORIAN_RANGE'
  | 'UNSUPPORTED_LUNAR_RANGE'
  | 'DATASET_HOLE'
  | 'DUPLICATE_MAPPING'
  | 'DATASET_CORRUPTION'
  | 'ROUND_TRIP_MISMATCH';

export type CalendarResolutionError = {
  code: CalendarResolutionErrorCode;
  path: string;
  details?: Record<string, string | number | boolean>;
};

export type CalendarOperationResult<T> =
  | { success: true; value: T }
  | { success: false; errors: readonly CalendarResolutionError[] };

export type ResolvedGregorianToLunar = {
  gregorianDate: LocalDate;
  lunarDate: LocalDate & { lunarMonthKind: LunarMonthKind };
  datasetVersion: string;
  conversionRuleVersion: string;
};

export type ResolvedLunarToGregorian = {
  lunarDate: LocalDate & { lunarMonthKind: LunarMonthKind };
  gregorianDate: LocalDate;
  datasetVersion: string;
  conversionRuleVersion: string;
};

export type CalendarIntegrityReport = {
  valid: boolean;
  errors: readonly CalendarResolutionError[];
};
