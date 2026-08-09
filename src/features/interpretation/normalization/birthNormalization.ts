import { KASI_LUNISOLAR_CALENDAR_RESOLVER } from '../calendar/kasiCalendarResolver';
import { isValidGregorianDate } from '../calendar/civilDay';
import type {
  BirthNormalizationResult,
  CivilLocalBirthTime,
  HistoricalTimezoneResolver,
  LunisolarCalendarResolver,
  NormalizedBirthInput,
  ResolutionProvenance,
  TimezoneResolution,
  TrueSolarTimeResolution,
  TrueSolarTimeResolver,
} from '../contracts/normalization';
import type { CanonicalBirthInput, GeographicCoordinates } from '../domain/birth';
import type { LocalClockTime, LocalClockTimeRange } from '../domain/time';
import type {
  NormalizationError,
  NormalizationWarning,
} from '../domain/validation';

export type BirthNormalizationDependencies = {
  calendarResolver?: LunisolarCalendarResolver;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  trueSolarTimeResolver?: TrueSolarTimeResolver;
};

function error(
  value: Omit<NormalizationError, 'messageKey'> & { messageKey?: string },
): NormalizationError {
  return {
    ...value,
    messageKey:
      value.messageKey ?? `interpretation.normalization.${value.code}`,
  };
}

function warning(
  value: Omit<NormalizationWarning, 'messageKey'> & { messageKey?: string },
): NormalizationWarning {
  return {
    ...value,
    messageKey:
      value.messageKey ?? `interpretation.normalization.${value.code}`,
  };
}

function isValidClockTime(time: LocalClockTime): boolean {
  return (
    Number.isInteger(time.hour) &&
    time.hour >= 0 &&
    time.hour <= 23 &&
    Number.isInteger(time.minute) &&
    time.minute >= 0 &&
    time.minute <= 59 &&
    (time.second === undefined ||
      (Number.isInteger(time.second) && time.second >= 0 && time.second <= 59))
  );
}

function clockSecond(time: LocalClockTime): number {
  return time.hour * 3_600 + time.minute * 60 + (time.second ?? 0);
}

function isValidClockRange(range: LocalClockTimeRange): boolean {
  return (
    isValidClockTime(range.start) &&
    isValidClockTime(range.end) &&
    clockSecond(range.start) <= clockSecond(range.end)
  );
}

function validateCoordinates(
  coordinates: GeographicCoordinates | undefined,
): NormalizationError[] {
  if (!coordinates) return [];
  if (
    Number.isFinite(coordinates.latitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  ) {
    return [];
  }
  return [
    error({
      code: 'INVALID_PLACE_COORDINATES',
      path: 'place.coordinates',
      stage: 'PLACE',
    }),
  ];
}

function validateStructure(source: CanonicalBirthInput): NormalizationError[] {
  const errors: NormalizationError[] = [];
  const hasInvalidDateComponents =
    !Number.isInteger(source.date.year) ||
    !Number.isInteger(source.date.month) ||
    !Number.isInteger(source.date.day) ||
    source.date.month < 1 ||
    source.date.month > 12 ||
    source.date.day < 1;
  if (hasInvalidDateComponents) {
    errors.push(
      error({
        code: 'INVALID_DATE_COMPONENT',
        path: 'date',
        stage: 'STRUCTURE',
      }),
    );
  }
  if (
    source.date.calendar === 'GREGORIAN' &&
    !hasInvalidDateComponents &&
    !isValidGregorianDate(source.date)
  ) {
    errors.push(
      error({
        code: 'INVALID_GREGORIAN_DATE',
        path: 'date',
        stage: 'CALENDAR',
      }),
    );
  }
  if (
    source.date.calendar === 'LUNAR' &&
    source.date.lunarMonthKind !== 'REGULAR' &&
    source.date.lunarMonthKind !== 'LEAP'
  ) {
    errors.push(
      error({
        code: 'INVALID_LUNAR_MONTH_KIND',
        path: 'date.lunarMonthKind',
        stage: 'CALENDAR',
      }),
    );
  }
  if (source.time.accuracy === 'EXACT' && !isValidClockTime(source.time.localTime)) {
    errors.push(
      error({
        code: 'INVALID_TIME',
        path: 'time.localTime',
        stage: 'STRUCTURE',
      }),
    );
  }
  if (
    source.time.accuracy === 'APPROXIMATE' &&
    source.time.localTimeHint &&
    !isValidClockRange(source.time.localTimeHint)
  ) {
    errors.push(
      error({
        code: 'INVALID_APPROXIMATE_RANGE',
        path: 'time.localTimeHint',
        stage: 'STRUCTURE',
      }),
    );
  }
  const timezone = source.temporalContext.timezone;
  if (
    (timezone.status === 'EXPLICIT' && timezone.ianaZone.trim().length === 0) ||
    (timezone.status === 'OFFSET_ONLY' &&
      !Number.isInteger(timezone.offsetMinutes))
  ) {
    errors.push(
      error({
        code: 'TIMEZONE_UNRESOLVED',
        path: 'temporalContext.timezone',
        stage: 'TIMEZONE',
      }),
    );
  }
  const dst = source.temporalContext.dst;
  if (dst.status === 'OBSERVED' && !Number.isInteger(dst.offsetMinutes)) {
    errors.push(
      error({
        code: 'DST_UNRESOLVED',
        path: 'temporalContext.dst.offsetMinutes',
        stage: 'DST',
      }),
    );
  }
  const trueSolarTime = source.temporalContext.trueSolarTime;
  if (
    trueSolarTime.mode === 'APPLY' &&
    trueSolarTime.longitude !== undefined &&
    (!Number.isFinite(trueSolarTime.longitude) ||
      trueSolarTime.longitude < -180 ||
      trueSolarTime.longitude > 180)
  ) {
    errors.push(
      error({
        code: 'INVALID_PLACE_COORDINATES',
        path: 'temporalContext.trueSolarTime.longitude',
        stage: 'TRUE_SOLAR_TIME',
      }),
    );
  }
  return [...errors, ...validateCoordinates(source.place.coordinates)];
}

function calendarError(
  reason: Extract<
    Awaited<ReturnType<LunisolarCalendarResolver['resolve']>>,
    { status: 'UNRESOLVED' }
  >['reason'],
): NormalizationError {
  const code: NormalizationError['code'] =
    reason === 'UNSUPPORTED_CALENDAR_RANGE'
      ? 'UNSUPPORTED_CALENDAR_RANGE'
      : reason === 'INVALID_LUNAR_DATE'
        ? 'INVALID_LUNAR_DATE'
        : reason === 'INVALID_LUNAR_MONTH_KIND'
          ? 'INVALID_LUNAR_MONTH_KIND'
          : 'CALENDAR_RESOLUTION_FAILED';
  return error({
    code,
    path: 'date',
    stage: 'CALENDAR',
    details: { reason },
  });
}

function createCivilLocal(
  source: CanonicalBirthInput,
  gregorianDate: Extract<
    Awaited<ReturnType<LunisolarCalendarResolver['resolve']>>,
    { status: 'RESOLVED' }
  >['gregorianDate'],
): CivilLocalBirthTime {
  if (source.time.accuracy === 'EXACT') {
    return {
      accuracy: 'EXACT',
      date: gregorianDate,
      time: source.time.localTime,
    };
  }
  if (source.time.accuracy === 'APPROXIMATE') {
    return {
      accuracy: 'APPROXIMATE',
      date: gregorianDate,
      period: source.time.period,
      resolvedRange: source.time.localTimeHint ?? null,
    };
  }
  return { accuracy: 'UNKNOWN', date: gregorianDate };
}

async function resolveTimezone(
  source: CanonicalBirthInput,
  civilLocal: CivilLocalBirthTime,
  resolver: HistoricalTimezoneResolver | undefined,
  warnings: NormalizationWarning[],
): Promise<TimezoneResolution> {
  if (civilLocal.accuracy !== 'EXACT') {
    return { status: 'UNRESOLVED', reason: 'TIME_UNRESOLVED' };
  }
  const timezone = source.temporalContext.timezone;
  if (timezone.status !== 'EXPLICIT') {
    warnings.push(
      warning({
        code:
          timezone.status === 'OFFSET_ONLY'
            ? 'TIMEZONE_OFFSET_ONLY_NOT_EXECUTABLE'
            : 'TIMEZONE_NOT_PROVIDED',
        path: 'temporalContext.timezone',
        stage: 'TIMEZONE',
      }),
    );
    return { status: 'UNRESOLVED', reason: 'TIMEZONE_NOT_PROVIDED' };
  }
  if (!resolver) {
    warnings.push(
      warning({
        code: 'TIMEZONE_RESOLVER_NOT_PROVIDED',
        path: 'temporalContext.timezone',
        stage: 'TIMEZONE',
      }),
    );
    return {
      status: 'UNRESOLVED',
      ianaZone: timezone.ianaZone,
      reason: 'RESOLVER_NOT_PROVIDED',
    };
  }
  try {
    return await resolver.resolve({
      ianaZone: timezone.ianaZone,
      coordinates: source.place.coordinates,
      civilLocal,
    });
  } catch {
    warnings.push(
      warning({
        code: 'HISTORICAL_TIMEZONE_RESOLUTION_FAILED',
        path: 'temporalContext.timezone',
        stage: 'TIMEZONE',
      }),
    );
    return {
      status: 'UNRESOLVED',
      ianaZone: timezone.ianaZone,
      reason: 'HISTORICAL_DATA_UNAVAILABLE',
    };
  }
}

function exactCivilDateTime(civilLocal: CivilLocalBirthTime) {
  return civilLocal.accuracy === 'EXACT'
    ? { date: civilLocal.date, time: civilLocal.time }
    : undefined;
}

async function resolveTrueSolarTime(
  source: CanonicalBirthInput,
  civilLocal: CivilLocalBirthTime,
  resolver: TrueSolarTimeResolver | undefined,
  errors: NormalizationError[],
  warnings: NormalizationWarning[],
): Promise<TrueSolarTimeResolution> {
  const civilDateTime = exactCivilDateTime(civilLocal);
  const option = source.temporalContext.trueSolarTime;
  if (option.mode === 'DO_NOT_APPLY') {
    return {
      status: 'NOT_APPLIED',
      ...(civilDateTime ? { civilDateTime } : {}),
    };
  }
  if (option.mode === 'UNDECIDED') {
    warnings.push(
      warning({
        code: 'TRUE_SOLAR_POLICY_UNDECIDED',
        path: 'temporalContext.trueSolarTime',
        stage: 'TRUE_SOLAR_TIME',
      }),
    );
    return {
      status: 'UNRESOLVED',
      ...(civilDateTime ? { civilDateTime } : {}),
      reason: 'POLICY_UNDECIDED',
    };
  }
  if (!civilDateTime) {
    return { status: 'UNRESOLVED', reason: 'TIME_UNRESOLVED' };
  }
  const longitude = option.longitude ?? source.place.coordinates?.longitude;
  if (longitude === undefined) {
    errors.push(
      error({
        code: 'TRUE_SOLAR_LONGITUDE_REQUIRED',
        path: 'temporalContext.trueSolarTime.longitude',
        stage: 'TRUE_SOLAR_TIME',
      }),
    );
    return {
      status: 'UNRESOLVED',
      civilDateTime,
      reason: 'LONGITUDE_REQUIRED',
    };
  }
  if (!resolver) {
    warnings.push(
      warning({
        code: 'TRUE_SOLAR_RESOLVER_NOT_PROVIDED',
        path: 'temporalContext.trueSolarTime',
        stage: 'TRUE_SOLAR_TIME',
      }),
    );
    return {
      status: 'UNRESOLVED',
      civilDateTime,
      reason: 'RULE_UNAVAILABLE',
    };
  }
  try {
    return await resolver.resolve({ civilDateTime, longitude });
  } catch {
    warnings.push(
      warning({
        code: 'TRUE_SOLAR_RESOLUTION_FAILED',
        path: 'temporalContext.trueSolarTime',
        stage: 'TRUE_SOLAR_TIME',
      }),
    );
    return {
      status: 'UNRESOLVED',
      civilDateTime,
      reason: 'RULE_UNAVAILABLE',
    };
  }
}

function collectProvenance(
  normalized: Pick<
    NormalizedBirthInput,
    'calendar' | 'timezone' | 'trueSolarTime'
  >,
): ResolutionProvenance[] {
  const values: ResolutionProvenance[] = [];
  if (normalized.calendar.status === 'RESOLVED') {
    values.push(normalized.calendar.provenance);
  }
  if (normalized.timezone.status === 'RESOLVED') {
    values.push(normalized.timezone.provenance);
    if (normalized.timezone.dst.status !== 'UNRESOLVED') {
      values.push(normalized.timezone.dst.provenance);
    }
  }
  if (normalized.trueSolarTime.status === 'APPLIED') {
    values.push(normalized.trueSolarTime.provenance);
  }
  return values;
}

/**
 * Executes deterministic birth normalization without network or runtime crypto.
 * Resolver ports are the only authority for historical time and solar time.
 */
export async function normalizeBirthInput(
  source: CanonicalBirthInput,
  dependencies: BirthNormalizationDependencies = {},
): Promise<BirthNormalizationResult> {
  const errors = validateStructure(source);
  const warnings: NormalizationWarning[] = [];
  if (errors.length > 0) return { success: false, errors, warnings };

  const calendarResolver =
    dependencies.calendarResolver ?? KASI_LUNISOLAR_CALENDAR_RESOLVER;
  let calendar: Awaited<ReturnType<LunisolarCalendarResolver['resolve']>>;
  try {
    calendar = await calendarResolver.resolve(source.date);
  } catch {
    return {
      success: false,
      errors: [
        error({
          code: 'CALENDAR_RESOLUTION_FAILED',
          path: 'date',
          stage: 'CALENDAR',
        }),
      ],
      warnings,
    };
  }
  if (calendar.status === 'UNRESOLVED') {
    return {
      success: false,
      errors: [calendarError(calendar.reason)],
      warnings,
    };
  }

  const civilLocal = createCivilLocal(source, calendar.gregorianDate);
  const timezone = await resolveTimezone(
    source,
    civilLocal,
    dependencies.historicalTimezoneResolver,
    warnings,
  );
  const trueSolarTime = await resolveTrueSolarTime(
    source,
    civilLocal,
    dependencies.trueSolarTimeResolver,
    errors,
    warnings,
  );
  if (errors.length > 0) return { success: false, errors, warnings };

  const value: NormalizedBirthInput = {
    source,
    calendar,
    civilLocal,
    timezone,
    trueSolarTime,
    provenance: collectProvenance({ calendar, timezone, trueSolarTime }),
    warnings,
  };
  return { success: true, value, warnings };
}
