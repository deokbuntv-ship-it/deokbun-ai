import {
  addGregorianDays,
  compareGregorianDates,
  getGregorianMonthLength,
  isValidGregorianDate,
} from '../../calendar/civilDay';
import { DEOKBUNAI_SOLAR_TERM_V1_POLICY } from '../../solarTerm/lunarJsSolarTermAdapter';
import type {
  LunarJsSolarTermAdapter,
  LunarJsSolarTermAdapterResult,
  SolarTermBoundaryDirection,
} from '../../solarTerm/lunarJsSolarTermAdapter';
import { HEAVENLY_STEMS, type SexagenaryPillar } from '../contracts';
import {
  advanceSexagenaryIndex,
  pillarToSexagenaryIndex,
  sexagenaryIndexToPillar,
} from '../sexagenary';
import {
  DEOKBUNAI_DAEWOON_V1_RULE,
  type DaewoonCycle,
  type DaewoonDirection,
  type DaewoonProvenance,
  type DaewoonStartOffset,
  type DaewoonStartTiming,
  type SajuDaewoonCalculationInput,
  type SajuDaewoonResult,
} from './contracts';

const MINUTES_PER_YEAR = 4_320;
const MINUTES_PER_MONTH = 360;
const MINUTES_PER_DAY = 12;
const SECONDS_PER_MINUTE = 60;

const ASSUMPTIONS = [
  'YEAR_STEM_YIN_YANG_WITH_BINARY_GENDER',
  'MONTH_PILLAR_COMES_FROM_CANONICAL_SAJU_RESULT',
  'DIRECTIONAL_NEAREST_JIE_ONLY',
  'NORMALIZED_UTC_IS_CONVERTED_TO_PROVIDER_FIXED_UTC_PLUS_08',
  'THREE_DAYS_OF_SOLAR_TERM_INTERVAL_EQUALS_ONE_SYMBOLIC_YEAR',
] as const;

const BASE_LIMITATIONS = [
  'V1_SUPPORTS_ASIA_SEOUL_ONLY',
  'V1_SUPPORTED_BIRTH_RANGE_1970_01_01_THROUGH_2050_12_31',
  'SAME_UTC_MINUTE_AS_A_JIE_BOUNDARY_IS_AMBIGUOUS',
  'ROUNDED_START_AGE_IS_PRESENTATION_GRADE_NOT_ASTRONOMICAL_PRECISION',
] as const;

function provenance(input: SajuDaewoonCalculationInput): DaewoonProvenance {
  const timezone = input.normalizedBirth.timezone;
  return {
    ruleId: DEOKBUNAI_DAEWOON_V1_RULE.ruleId,
    ruleVersion: DEOKBUNAI_DAEWOON_V1_RULE.ruleVersion,
    directionRule: DEOKBUNAI_DAEWOON_V1_RULE.directionRule,
    progressionRule: DEOKBUNAI_DAEWOON_V1_RULE.progressionRule,
    intervalRule: DEOKBUNAI_DAEWOON_V1_RULE.intervalRule,
    startOffsetRule: DEOKBUNAI_DAEWOON_V1_RULE.startOffsetRule,
    roundingRule: DEOKBUNAI_DAEWOON_V1_RULE.roundingRule,
    solarTerm: {
      provider: 'lunar-javascript',
      providerVersion: '1.7.7',
      adapterRuleVersion: 'deokbunai.solar-term-lunarjs-adapter.v1',
      solarTermRuleVersion: DEOKBUNAI_SOLAR_TERM_V1_POLICY.ruleVersion,
      sourceTimeBasis: 'FIXED_UTC_PLUS_08',
      canonicalBoundaryPrecision: 'MINUTE',
    },
    ...(timezone.status === 'RESOLVED'
      ? { timezoneDataVersion: timezone.timezoneDataVersion }
      : {}),
  };
}

function unavailable(
  input: SajuDaewoonCalculationInput,
  reason: Extract<SajuDaewoonResult, { capability: 'UNAVAILABLE' }>['reason'],
): SajuDaewoonResult {
  return {
    capability: 'UNAVAILABLE',
    reason,
    ruleVersion: DEOKBUNAI_DAEWOON_V1_RULE.ruleVersion,
    provenance: provenance(input),
    assumptions: ASSUMPTIONS,
    limitations: BASE_LIMITATIONS,
  };
}

function ambiguous(
  input: SajuDaewoonCalculationInput,
  reason: Extract<SajuDaewoonResult, { capability: 'AMBIGUOUS' }>['reason'],
): SajuDaewoonResult {
  return {
    capability: 'AMBIGUOUS',
    reason,
    ruleVersion: DEOKBUNAI_DAEWOON_V1_RULE.ruleVersion,
    provenance: provenance(input),
    assumptions: ASSUMPTIONS,
    limitations: BASE_LIMITATIONS,
  };
}

function pillarIsCanonical(pillar: SexagenaryPillar): boolean {
  const result = pillarToSexagenaryIndex(pillar.stem, pillar.branch);
  return result.ok && result.value === pillar.index;
}

function resolveDirection(
  yearPillar: SexagenaryPillar,
  gender: 'MALE' | 'FEMALE',
): DaewoonDirection {
  const stemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
  const isYangYear = stemIndex % 2 === 0;
  return (isYangYear && gender === 'MALE') || (!isYangYear && gender === 'FEMALE')
    ? 'FORWARD'
    : 'REVERSE';
}

function boundaryEpoch(result: LunarJsSolarTermAdapterResult): number | null {
  if (result.ok) return result.value.normalizedUtcInstant.epochSeconds;
  const value = result.error.details?.boundaryEpochSeconds;
  return typeof value === 'number' ? value : null;
}

function touchesCanonicalBoundaryMinute(
  birthEpochSeconds: number,
  results: readonly LunarJsSolarTermAdapterResult[],
): boolean {
  const birthMinute = Math.floor(birthEpochSeconds / SECONDS_PER_MINUTE);
  return results.some((result) => {
    const epoch = boundaryEpoch(result);
    return epoch !== null && Math.floor(epoch / SECONDS_PER_MINUTE) === birthMinute;
  });
}

function decomposeStartOffset(intervalMinutes: number): DaewoonStartOffset {
  let remainder = intervalMinutes;
  const years = Math.floor(remainder / MINUTES_PER_YEAR);
  remainder -= years * MINUTES_PER_YEAR;
  const months = Math.floor(remainder / MINUTES_PER_MONTH);
  remainder -= months * MINUTES_PER_MONTH;
  const days = Math.floor(remainder / MINUTES_PER_DAY);
  remainder -= days * MINUTES_PER_DAY;
  const hours = remainder * 2;
  const rawStartAgeYears = intervalMinutes / MINUTES_PER_YEAR;
  return {
    sourceIntervalMinutes: intervalMinutes,
    rawStartAgeYears,
    roundedStartAgeYears: Math.floor(rawStartAgeYears + 0.5),
    symbolicOffset: { years, months, days, hours },
  };
}

function addSymbolicOffset(
  birth: DaewoonStartTiming['birthLocalDateTime'],
  offset: DaewoonStartOffset['symbolicOffset'],
): DaewoonStartTiming['symbolicLocalDateTime'] {
  const totalMonth =
    birth.date.year * 12 +
    birth.date.month -
    1 +
    offset.years * 12 +
    offset.months;
  const year = Math.floor(totalMonth / 12);
  const month = (totalMonth % 12) + 1;
  const day = Math.min(birth.date.day, getGregorianMonthLength(year, month));
  let date = addGregorianDays({ year, month, day }, offset.days);
  const totalHour = birth.time.hour + offset.hours;
  date = addGregorianDays(date, Math.floor(totalHour / 24));
  return {
    date,
    time: {
      hour: totalHour % 24,
      minute: birth.time.minute,
      second: birth.time.second,
    },
    zoneId: 'Asia/Seoul',
  };
}

function buildCycles(
  monthPillar: SexagenaryPillar,
  direction: DaewoonDirection,
  roundedStartAgeYears: number,
): DaewoonCycle[] | null {
  const cycles: DaewoonCycle[] = [];
  for (let index = 0; index < DEOKBUNAI_DAEWOON_V1_RULE.cycleCount; index += 1) {
    const distance = direction === 'FORWARD' ? index + 1 : -(index + 1);
    const advanced = advanceSexagenaryIndex(monthPillar.index, distance);
    if (!advanced.ok) return null;
    const pillar = sexagenaryIndexToPillar(advanced.value);
    if (!pillar.ok) return null;
    const startAgeInclusive = roundedStartAgeYears + index * 10;
    cycles.push({
      ordinal: index + 1,
      pillar: pillar.value,
      startAgeInclusive,
      endAgeInclusive: startAgeInclusive + 9,
    });
  }
  return cycles;
}

export function calculateSajuDaewoon(
  input: SajuDaewoonCalculationInput,
  solarTermAdapter: LunarJsSolarTermAdapter,
): SajuDaewoonResult {
  const birth = input.normalizedBirth;
  if (!pillarIsCanonical(input.yearPillar)) return unavailable(input, 'INVALID_YEAR_PILLAR');
  if (!pillarIsCanonical(input.monthPillar)) return unavailable(input, 'INVALID_MONTH_PILLAR');
  if (birth.source.gender === 'UNSPECIFIED') return unavailable(input, 'GENDER_UNSPECIFIED');

  if (birth.civilLocal.accuracy === 'APPROXIMATE') {
    return ambiguous(input, 'BIRTH_TIME_APPROXIMATE');
  }
  if (birth.civilLocal.accuracy === 'UNKNOWN') {
    return unavailable(input, 'BIRTH_TIME_UNKNOWN');
  }
  if (birth.civilLocal.accuracy === 'UNRESOLVED') {
    return unavailable(input, 'TIMEZONE_UNRESOLVED');
  }
  const localTime = birth.civilLocal.time;
  if (
    !isValidGregorianDate(birth.civilLocal.date) ||
    !Number.isInteger(localTime.hour) ||
    localTime.hour < 0 ||
    localTime.hour > 23 ||
    !Number.isInteger(localTime.minute) ||
    localTime.minute < 0 ||
    localTime.minute > 59 ||
    (localTime.second !== undefined &&
      (!Number.isInteger(localTime.second) ||
        localTime.second < 0 ||
        localTime.second > 59))
  ) {
    return unavailable(input, 'EXACT_LOCAL_TIME_INCOMPLETE');
  }

  const timezone = birth.timezone;
  if (timezone.status !== 'RESOLVED') return unavailable(input, 'TIMEZONE_UNRESOLVED');
  if (timezone.ianaZone !== 'Asia/Seoul') return unavailable(input, 'UNSUPPORTED_TIMEZONE');
  if (timezone.localTimeResolution.kind === 'AMBIGUOUS') {
    return ambiguous(input, 'LOCAL_TIME_AMBIGUOUS');
  }
  if (timezone.localTimeResolution.kind === 'NONEXISTENT') {
    return unavailable(input, 'LOCAL_TIME_NONEXISTENT');
  }
  if (timezone.localTimeResolution.kind !== 'UNIQUE') {
    return unavailable(input, 'TIMEZONE_UNRESOLVED');
  }

  if (birth.calendar.status !== 'RESOLVED') return unavailable(input, 'UNSUPPORTED_DATE_RANGE');
  const gregorianDate = birth.calendar.gregorianDate;
  if (!isValidGregorianDate(gregorianDate)) {
    return unavailable(input, 'CALCULATION_INVARIANT_FAILED');
  }
  if (compareGregorianDates(gregorianDate, birth.civilLocal.date) !== 0) {
    return unavailable(input, 'CALCULATION_INVARIANT_FAILED');
  }
  if (
    compareGregorianDates(
      gregorianDate,
      DEOKBUNAI_SOLAR_TERM_V1_POLICY.supportedBirthRange.start,
    ) < 0 ||
    compareGregorianDates(
      gregorianDate,
      DEOKBUNAI_SOLAR_TERM_V1_POLICY.supportedBirthRange.end,
    ) > 0
  ) {
    return unavailable(input, 'UNSUPPORTED_DATE_RANGE');
  }

  const direction = resolveDirection(input.yearPillar, birth.source.gender);
  const birthEpochSeconds =
    timezone.localTimeResolution.candidate.utcEpochSeconds;
  const selected = solarTermAdapter.resolve({
    birthInstant: { kind: 'UTC_INSTANT', epochSeconds: birthEpochSeconds },
    direction,
  });
  const oppositeDirection: SolarTermBoundaryDirection =
    direction === 'FORWARD' ? 'REVERSE' : 'FORWARD';
  const opposite = solarTermAdapter.resolve({
    birthInstant: { kind: 'UTC_INSTANT', epochSeconds: birthEpochSeconds },
    direction: oppositeDirection,
  });

  if (touchesCanonicalBoundaryMinute(birthEpochSeconds, [selected, opposite])) {
    return ambiguous(input, 'SOLAR_TERM_BOUNDARY_MINUTE');
  }
  if (!selected.ok) return unavailable(input, 'SOLAR_TERM_UNAVAILABLE');

  const boundaryEpochSeconds = selected.value.normalizedUtcInstant.epochSeconds;
  const intervalSeconds =
    direction === 'FORWARD'
      ? boundaryEpochSeconds - birthEpochSeconds
      : birthEpochSeconds - boundaryEpochSeconds;
  if (intervalSeconds <= 0) return unavailable(input, 'CALCULATION_INVARIANT_FAILED');
  const intervalMinutes = Math.abs(
    Math.floor(boundaryEpochSeconds / SECONDS_PER_MINUTE) -
      Math.floor(birthEpochSeconds / SECONDS_PER_MINUTE),
  );
  const startOffset = decomposeStartOffset(intervalMinutes);
  const cycles = buildCycles(
    input.monthPillar,
    direction,
    startOffset.roundedStartAgeYears,
  );
  if (!cycles) return unavailable(input, 'CALCULATION_INVARIANT_FAILED');

  const birthLocalDateTime: DaewoonStartTiming['birthLocalDateTime'] = {
    date: birth.civilLocal.date,
    time: {
      hour: birth.civilLocal.time.hour,
      minute: birth.civilLocal.time.minute,
      second: birth.civilLocal.time.second ?? 0,
    },
    zoneId: 'Asia/Seoul',
  };
  const timing: DaewoonStartTiming = {
    birthLocalDateTime,
    symbolicLocalDateTime: addSymbolicOffset(
      birthLocalDateTime,
      startOffset.symbolicOffset,
    ),
    rule: 'ADD_SYMBOLIC_START_OFFSET_TO_BIRTH_LOCAL_CIVIL_TIME',
  };

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_DAEWOON_V1_RULE.ruleVersion,
    provenance: provenance(input),
    assumptions: ASSUMPTIONS,
    limitations: BASE_LIMITATIONS,
    direction,
    selectedBoundary: selected.value,
    start: { ...startOffset, timing },
    cycles,
  };
}
