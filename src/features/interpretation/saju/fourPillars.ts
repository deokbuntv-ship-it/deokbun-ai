import { compareGregorianDates } from '../calendar/civilDay';
import type { TimezoneResolution } from '../contracts/normalization';
import { DEOKBUNAI_SAJU_DAY_V1_RULE, calculateDayPillar } from './dayPillar';
import { DEOKBUNAI_SAJU_HOUR_V1_RULE, calculateHourPillar } from './hourPillar';
import { calculateYearMonthPillars } from './pillars';
import type {
  ExactLocalCivilTime,
  SajuFourPillarsCalculationIdentity,
  SajuFourPillarsCalculationInput,
  SajuFourPillarsHour,
  SajuFourPillarsProvenance,
  SajuFourPillarsResult,
  SexagenaryPillar,
} from './contracts';

function unavailable(
  input: SajuFourPillarsCalculationInput,
  reason: Extract<SajuFourPillarsResult, { status: 'UNAVAILABLE' }>['reason'],
): SajuFourPillarsResult {
  return {
    status: 'UNAVAILABLE',
    normalizedBirthFingerprint: input.normalizedBirthFingerprint,
    reason,
  };
}

function unresolvedTimezoneReason(
  timezone: Extract<TimezoneResolution, { status: 'UNRESOLVED' }>,
): Extract<SajuFourPillarsHour, { status: 'UNAVAILABLE' }>['reason'] {
  return timezone.reason === 'HISTORICAL_SOURCE_CONFLICT'
    ? 'HISTORICAL_SOURCE_CONFLICT'
    : 'HISTORICAL_TIME_UNRESOLVED';
}

function resolveHour(
  input: SajuFourPillarsCalculationInput,
  dayPillar: SexagenaryPillar,
): SajuFourPillarsHour {
  const civilLocal = input.normalized.civilLocal;
  if (civilLocal.accuracy === 'UNKNOWN') {
    return { status: 'UNAVAILABLE', reason: 'BIRTH_TIME_UNKNOWN' };
  }
  if (civilLocal.accuracy === 'APPROXIMATE') {
    return {
      status: 'AMBIGUOUS',
      reason: 'BIRTH_TIME_APPROXIMATE_AMBIGUOUS',
    };
  }
  if (civilLocal.accuracy === 'UNRESOLVED') {
    return { status: 'UNAVAILABLE', reason: 'HISTORICAL_TIME_UNRESOLVED' };
  }
  if (civilLocal.time.second === undefined) {
    return { status: 'UNAVAILABLE', reason: 'EXACT_LOCAL_TIME_INCOMPLETE' };
  }

  const timezone = input.normalized.timezone;
  if (timezone.status === 'UNRESOLVED') {
    return { status: 'UNAVAILABLE', reason: unresolvedTimezoneReason(timezone) };
  }
  if (timezone.historicalProvenance.authorityStatus === 'SOURCE_CONFLICT') {
    return { status: 'UNAVAILABLE', reason: 'HISTORICAL_SOURCE_CONFLICT' };
  }
  if (timezone.historicalProvenance.comparison === 'CONFLICT') {
    return { status: 'UNAVAILABLE', reason: 'HISTORICAL_SOURCE_CONFLICT' };
  }
  if (timezone.historicalProvenance.authorityStatus === 'UNRESOLVED') {
    return { status: 'UNAVAILABLE', reason: 'HISTORICAL_TIME_UNRESOLVED' };
  }
  if (timezone.dst.status === 'UNRESOLVED') {
    return { status: 'UNAVAILABLE', reason: 'HISTORICAL_TIME_UNRESOLVED' };
  }

  const localResolution = timezone.localTimeResolution;
  if (localResolution.kind === 'AMBIGUOUS') {
    return { status: 'AMBIGUOUS', reason: 'LOCAL_TIME_AMBIGUOUS' };
  }
  if (localResolution.kind === 'NONEXISTENT') {
    return { status: 'UNAVAILABLE', reason: 'LOCAL_TIME_NONEXISTENT' };
  }
  if (localResolution.kind === 'UNRESOLVED') {
    return { status: 'UNAVAILABLE', reason: 'HISTORICAL_TIME_UNRESOLVED' };
  }

  const hour = calculateHourPillar({
    dayStem: dayPillar.stem,
    localTime: civilLocal.time as ExactLocalCivilTime,
  });
  return hour.ok
    ? { status: 'AVAILABLE', pillar: hour.value }
    : { status: 'UNAVAILABLE', reason: 'INVALID_LOCAL_TIME' };
}

export function calculateFourPillars(
  input: SajuFourPillarsCalculationInput,
): SajuFourPillarsResult {
  if (
    input.normalizedBirthFingerprint.trim().length === 0 ||
    input.engineRuleSetVersion.trim().length === 0
  ) {
    return unavailable(input, { code: 'INVALID_CALCULATION_IDENTITY' });
  }
  if (input.normalized.trueSolarTime.status !== 'NOT_APPLIED') {
    return unavailable(input, { code: 'PRODUCT_RULE_VIOLATION' });
  }

  const calendar = input.normalized.calendar;
  if (calendar.status === 'UNRESOLVED') {
    return unavailable(input, {
      code: 'CALENDAR_UNRESOLVED',
      calendarReason: calendar.reason,
    });
  }

  const civilLocal = input.normalized.civilLocal;
  if (civilLocal.accuracy === 'UNRESOLVED') {
    return unavailable(input, { code: 'NORMALIZED_INPUT_INCONSISTENT' });
  }
  if (compareGregorianDates(civilLocal.date, calendar.gregorianDate) !== 0) {
    return unavailable(input, { code: 'NORMALIZED_DATE_MISMATCH' });
  }

  const yearMonth = calculateYearMonthPillars({
    lunarYear: calendar.lunarDate.year,
    lunarMonth: calendar.lunarDate.month as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    lunarMonthKind: calendar.lunarDate.lunarMonthKind,
    ruleProfile: input.ruleProfile,
  });
  if (!yearMonth.ok) {
    return unavailable(input, {
      code: 'CORE_CALCULATION_FAILED',
      coreErrorCode: yearMonth.error.code,
    });
  }

  const day = calculateDayPillar(calendar.gregorianDate);
  if (!day.ok) {
    return unavailable(input, {
      code: 'CORE_CALCULATION_FAILED',
      coreErrorCode: day.error.code,
    });
  }

  const hour = resolveHour(input, day.value);
  const identity: SajuFourPillarsCalculationIdentity = {
    normalizedBirthFingerprint: input.normalizedBirthFingerprint,
    ruleId: input.ruleProfile.ruleId,
    ruleVersion: input.ruleProfile.ruleVersion,
    engineRuleSetVersion: input.engineRuleSetVersion,
    dayRuleVersion: DEOKBUNAI_SAJU_DAY_V1_RULE.ruleVersion,
    hourRuleVersion: DEOKBUNAI_SAJU_HOUR_V1_RULE.ruleVersion,
  };
  const provenance: SajuFourPillarsProvenance = {
    normalizedBirthFingerprint: input.normalizedBirthFingerprint,
    productRule: input.ruleProfile,
    dayRule: DEOKBUNAI_SAJU_DAY_V1_RULE,
    hourRule: DEOKBUNAI_SAJU_HOUR_V1_RULE,
    calendarDatasetVersion: calendar.calendarDatasetVersion,
    calendarConversionRuleVersion: calendar.calendarConversionRuleVersion,
    engineRuleSetVersion: input.engineRuleSetVersion,
  };
  const pillars = {
    year: yearMonth.value.year,
    month: yearMonth.value.month,
    day: day.value,
    hour,
  };

  return hour.status === 'AVAILABLE'
    ? { status: 'COMPLETE', pillars, identity, provenance }
    : { status: 'PARTIAL', pillars, identity, provenance };
}
