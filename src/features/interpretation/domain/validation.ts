export type NormalizationStage =
  | 'STRUCTURE'
  | 'CALENDAR'
  | 'PLACE'
  | 'TIMEZONE'
  | 'DST'
  | 'TRUE_SOLAR_TIME'
  | 'SERIALIZATION';

export type NormalizationErrorCode =
  | 'INVALID_DATE_COMPONENT'
  | 'INVALID_GREGORIAN_DATE'
  | 'INVALID_LUNAR_DATE'
  | 'INVALID_LUNAR_MONTH_KIND'
  | 'UNSUPPORTED_CALENDAR_RANGE'
  | 'CALENDAR_RESOLUTION_FAILED'
  | 'INVALID_TIME'
  | 'INVALID_APPROXIMATE_RANGE'
  | 'INVALID_PLACE_COORDINATES'
  | 'PLACE_COORDINATES_REQUIRED'
  | 'TIMEZONE_UNRESOLVED'
  | 'TIMEZONE_AMBIGUOUS'
  | 'TIMEZONE_NONEXISTENT'
  | 'HISTORICAL_SOURCE_CONFLICT'
  | 'HISTORICAL_TIME_UNRESOLVED'
  | 'LMT_NOT_AUTHORIZED'
  | 'HISTORICAL_OFFSET_UNAVAILABLE'
  | 'DST_UNRESOLVED'
  | 'TRUE_SOLAR_LONGITUDE_REQUIRED'
  | 'TRUE_SOLAR_RULE_UNAVAILABLE'
  | 'CANONICAL_SERIALIZATION_FAILED'
  | 'FINGERPRINT_DIGEST_FAILED';

export type NormalizationError = {
  code: NormalizationErrorCode;
  path: string;
  stage: NormalizationStage;
  messageKey: string;
  details?: Record<string, string | number | boolean>;
};

export type NormalizationWarning = {
  code: string;
  path?: string;
  stage: NormalizationStage;
  messageKey: string;
  details?: Record<string, string | number | boolean>;
};
