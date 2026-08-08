export type LocalDate = {
  year: number;
  month: number;
  day: number;
};

export type LocalClockTime = {
  hour: number;
  minute: number;
  second?: number;
};

export type LocalClockTimeRange = {
  start: LocalClockTime;
  end: LocalClockTime;
};

export type ApproximateTimePeriod =
  | 'DAWN'
  | 'MORNING'
  | 'AFTERNOON'
  | 'EVENING'
  | 'NIGHT';

export type BirthTimeInput =
  | {
      accuracy: 'EXACT';
      localTime: LocalClockTime;
    }
  | {
      accuracy: 'APPROXIMATE';
      period: ApproximateTimePeriod;
      localTimeHint?: LocalClockTimeRange;
    }
  | {
      accuracy: 'UNKNOWN';
    };

export type TimezoneInput =
  | {
      status: 'EXPLICIT';
      ianaZone: string;
      source: TemporalDataSource;
    }
  | {
      status: 'OFFSET_ONLY';
      offsetMinutes: number;
      source: TemporalDataSource;
    }
  | {
      status: 'UNRESOLVED';
    };

export type DstInput =
  | {
      status: 'OBSERVED';
      offsetMinutes: number;
      source: TemporalDataSource;
    }
  | {
      status: 'NOT_OBSERVED';
      source: TemporalDataSource;
    }
  | {
      status: 'UNRESOLVED';
    };

export type TrueSolarTimeOption =
  | { mode: 'APPLY'; longitude?: number }
  | { mode: 'DO_NOT_APPLY' }
  | { mode: 'UNDECIDED' };

export type TemporalDataSource = 'USER' | 'APP' | 'EXTERNAL_LOOKUP';

export type TemporalContext = {
  timezone: TimezoneInput;
  dst: DstInput;
  trueSolarTime: TrueSolarTimeOption;
};
