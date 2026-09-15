import type { LocalDate } from '../domain/time';

export type SolarTermId =
  | 'MINOR_COLD'
  | 'MAJOR_COLD'
  | 'START_OF_SPRING'
  | 'RAIN_WATER'
  | 'AWAKENING_OF_INSECTS'
  | 'SPRING_EQUINOX'
  | 'PURE_BRIGHTNESS'
  | 'GRAIN_RAIN'
  | 'START_OF_SUMMER'
  | 'GRAIN_FULL'
  | 'GRAIN_IN_EAR'
  | 'SUMMER_SOLSTICE'
  | 'MINOR_HEAT'
  | 'MAJOR_HEAT'
  | 'START_OF_AUTUMN'
  | 'END_OF_HEAT'
  | 'WHITE_DEW'
  | 'AUTUMN_EQUINOX'
  | 'COLD_DEW'
  | 'FROST_DESCENT'
  | 'START_OF_WINTER'
  | 'MINOR_SNOW'
  | 'MAJOR_SNOW'
  | 'WINTER_SOLSTICE';

export type SolarTermKind = 'JIE' | 'ZHONGQI';

export type SolarTermDefinition = {
  termId: SolarTermId;
  koreanName: string;
  solarLongitudeDegrees: number;
  kind: SolarTermKind;
  gregorianOrder: number;
};

export type SolarTermCivilMinute = {
  date: LocalDate;
  hour: number;
  minute: number;
};

export type SolarTermTimestampPrecision = 'MINUTE';
export type SolarTermSourceRounding = 'UNSPECIFIED';
export type SolarTermSourceTimeBasis = 'KASI_FIXED_KST_UTC_PLUS_09';

export type SolarTermSourceTimestamp = {
  civilMinute: SolarTermCivilMinute;
  timeBasis: SolarTermSourceTimeBasis;
  offsetSeconds: 32_400;
  precision: SolarTermTimestampPrecision;
  sourceRounding: SolarTermSourceRounding;
};

/**
 * A minute label is intentionally not promoted to an exact second instant.
 * `epochMinute` identifies the UTC minute obtained from the source minute label.
 */
export type SolarTermUtcMinuteResolution = {
  kind: 'UTC_MINUTE_LABEL';
  epochMinute: number;
  precision: SolarTermTimestampPrecision;
  sourceRounding: SolarTermSourceRounding;
};

export type SolarTermLegalCivilResolution =
  | {
      status: 'RESOLVED';
      zoneId: 'Asia/Seoul';
      civilMinute: SolarTermCivilMinute;
      totalOffsetSeconds: number;
      dstOffsetSeconds: number;
      timezoneDataVersion: string;
    }
  | {
      status: 'UNRESOLVED';
      zoneId: 'Asia/Seoul';
      reason: 'OUTSIDE_PINNED_TIMEZONE_RANGE' | 'TIMEZONE_DATA_UNAVAILABLE';
      timezoneDataVersion: string;
    };

export type SolarTermSourceProvenance = {
  provider: 'KASI';
  operation: 'get24DivisionsInfo';
  endpoint: string;
  sourceRevision: string;
  acquiredAtUtc: string;
  sourceRecordHash: {
    algorithm: 'SHA-256';
    value: string;
  };
};

export type SolarTermRecord = {
  termId: SolarTermId;
  year: number;
  solarLongitudeDegrees: number;
  sourceTimestamp: SolarTermSourceTimestamp;
  utcResolution: SolarTermUtcMinuteResolution;
  legalCivilResolution: SolarTermLegalCivilResolution;
  provenance: SolarTermSourceProvenance;
};

export type SolarTermArtifactApprovalStatus =
  | 'PENDING_CTO_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export type SolarTermCrossValidationStatus =
  | 'NOT_RUN'
  | 'MATCH'
  | 'SOURCE_CONFLICT';

export type SolarTermCrossValidationSummary = {
  status: SolarTermCrossValidationStatus;
  comparedRecordCount: number;
  mismatchCount: number;
  verificationSource: 'NAOJ';
  verificationRevision: string;
};

export type SolarTermDatasetManifest = {
  schemaVersion: string;
  datasetVersion: string;
  supportedBirthRange: { start: LocalDate; end: LocalDate };
  artifactCoverageRange: { start: LocalDate; end: LocalDate };
  recordCount: number;
  source: {
    provider: 'KASI';
    operation: 'get24DivisionsInfo';
    endpoint: string;
    apiGuideVersion: string;
    publicDataPortalRevisionDate: string;
  };
  acquiredAtUtc: string;
  canonicalSerializationVersion: string;
  artifactChecksum: { algorithm: 'SHA-256'; value: string };
  timezoneAuthority: {
    zoneId: 'Asia/Seoul';
    dataVersion: string;
  };
  crossValidation: SolarTermCrossValidationSummary;
  approvalStatus: SolarTermArtifactApprovalStatus;
};

export type SolarTermDataset = {
  manifest: SolarTermDatasetManifest;
  /** Gregorian-year order, then the canonical 24-term order. */
  records: readonly SolarTermRecord[];
};

export type SolarTermResolutionErrorCode =
  | 'DATASET_NOT_APPROVED'
  | 'UNSUPPORTED_YEAR'
  | 'TERM_NOT_FOUND'
  | 'DUPLICATE_TERM'
  | 'DATASET_CORRUPTION';

export type SolarTermResolutionError = {
  code: SolarTermResolutionErrorCode;
  path: string;
  details?: Record<string, string | number | boolean>;
};

export type SolarTermResolutionResult =
  | { success: true; value: SolarTermRecord }
  | { success: false; errors: readonly SolarTermResolutionError[] };

export type SolarTermIntegrityReport = {
  valid: boolean;
  errors: readonly SolarTermResolutionError[];
};
