import type {
  BirthCalendarDate,
  CanonicalBirthInput,
  GeographicCoordinates,
} from '../domain/birth';
import type {
  ApproximateTimePeriod,
  LocalClockTime,
  LocalClockTimeRange,
  LocalDate,
  TemporalDataSource,
} from '../domain/time';
import type {
  NormalizationError,
  NormalizationWarning,
} from '../domain/validation';
import type { EngineId } from './engine';
import type {
  HistoricalLocalTimeResolution,
  HistoricalTimeProvenance,
} from './historicalTime';

export type ResolutionProvenance = {
  resolverId: string;
  resolverVersion: string;
  dataVersion?: string;
  ruleSetVersion?: string;
  source: TemporalDataSource | 'ENGINE';
};

export type CalendarResolution =
  | {
      status: 'RESOLVED';
      sourceDate: BirthCalendarDate;
      gregorianDate: LocalDate;
      provenance: ResolutionProvenance;
    }
  | {
      status: 'UNRESOLVED';
      sourceDate: BirthCalendarDate;
      reason:
        | 'RESOLVER_NOT_PROVIDED'
        | 'UNSUPPORTED_CALENDAR_RANGE'
        | 'INVALID_LUNAR_MONTH_KIND';
    };

export type CivilLocalBirthTime =
  | {
      accuracy: 'EXACT';
      date: LocalDate;
      time: LocalClockTime;
    }
  | {
      accuracy: 'APPROXIMATE';
      date: LocalDate;
      period: ApproximateTimePeriod;
      resolvedRange: LocalClockTimeRange | null;
      rangeProvenance?: ResolutionProvenance;
    }
  | {
      accuracy: 'UNKNOWN';
      date: LocalDate;
    }
  | {
      accuracy: 'UNRESOLVED';
      reason: 'CALENDAR_UNRESOLVED';
    };

export type DstResolution =
  | {
      status: 'OBSERVED';
      /** Calculation authority. Do not derive this value from minutes. */
      dstOffsetSeconds: number;
      /** Compatibility/display value derived exactly as dstOffsetSeconds / 60. */
      offsetMinutes: number;
      provenance: ResolutionProvenance;
    }
  | {
      status: 'NOT_OBSERVED';
      /** Calculation authority; always zero for this state. */
      dstOffsetSeconds: 0;
      provenance: ResolutionProvenance;
    }
  | {
      status: 'UNRESOLVED';
      reason: 'RESOLVER_NOT_PROVIDED' | 'DATA_UNAVAILABLE' | 'TIME_UNRESOLVED';
    };

export type TimezoneResolution =
  | {
      status: 'RESOLVED';
      ianaZone: string;
      /** Calculation authority. Do not derive this value from minutes. */
      resolvedOffsetSeconds: number;
      /** Compatibility/display value derived exactly as seconds / 60. */
      resolvedOffsetMinutes: number;
      timezoneDataVersion: string;
      resolutionSource: TemporalDataSource;
      dst: DstResolution;
      localTimeResolution: HistoricalLocalTimeResolution;
      historicalProvenance: HistoricalTimeProvenance;
      provenance: ResolutionProvenance;
    }
  | {
      status: 'UNRESOLVED';
      ianaZone?: string;
      reason:
        | 'TIMEZONE_NOT_PROVIDED'
        | 'COORDINATES_REQUIRED'
        | 'RESOLVER_NOT_PROVIDED'
        | 'HISTORICAL_DATA_UNAVAILABLE'
        | 'HISTORICAL_SOURCE_CONFLICT'
        | 'LMT_NOT_AUTHORIZED'
        | 'TIME_UNRESOLVED';
    };

export type CivilLocalDateTime = {
  date: LocalDate;
  time: LocalClockTime;
};

export type TrueSolarTimeResolution =
  | {
      status: 'APPLIED';
      civilDateTime: CivilLocalDateTime;
      adjustmentMinutes: number;
      solarDateTime: CivilLocalDateTime;
      dateShiftDays: number;
      provenance: ResolutionProvenance;
    }
  | {
      status: 'NOT_APPLIED';
      civilDateTime?: CivilLocalDateTime;
    }
  | {
      status: 'UNRESOLVED';
      civilDateTime?: CivilLocalDateTime;
      reason:
        | 'LONGITUDE_REQUIRED'
        | 'RULE_UNAVAILABLE'
        | 'TIME_UNRESOLVED'
        | 'POLICY_UNDECIDED';
    };

export type NormalizedBirthInput = {
  source: CanonicalBirthInput;
  calendar: CalendarResolution;
  civilLocal: CivilLocalBirthTime;
  timezone: TimezoneResolution;
  trueSolarTime: TrueSolarTimeResolution;
  provenance: ResolutionProvenance[];
  warnings: NormalizationWarning[];
};

export type BirthNormalizationResult =
  | {
      success: true;
      value: NormalizedBirthInput;
      warnings: NormalizationWarning[];
    }
  | {
      success: false;
      errors: NormalizationError[];
      warnings: NormalizationWarning[];
    };

export type CalendarResolver = {
  resolveToGregorian(
    date: BirthCalendarDate,
  ): Promise<CalendarResolution>;
};

export type HistoricalTimezoneResolutionRequest = {
  ianaZone: string;
  coordinates?: GeographicCoordinates;
  civilLocal: CivilLocalBirthTime;
};

export type HistoricalTimezoneResolver = {
  resolve(
    request: HistoricalTimezoneResolutionRequest,
  ): Promise<TimezoneResolution>;
};

export type TrueSolarTimeResolutionRequest = {
  civilDateTime: CivilLocalDateTime;
  longitude: number;
};

export type TrueSolarTimeResolver = {
  resolve(
    request: TrueSolarTimeResolutionRequest,
  ): Promise<TrueSolarTimeResolution>;
};

export type EngineCapabilityStatus =
  | 'SUPPORTED'
  | 'LIMITED'
  | 'UNAVAILABLE'
  | 'NOT_EVALUATED';

export type EngineCapabilityAssessment = {
  engine: EngineId;
  status: EngineCapabilityStatus;
  limitationCodes: string[];
  requiredDataPaths: string[];
};
