import { compareGregorianDates, gregorianToCivilDayOrdinal } from '../calendar/civilDay';
import type {
  CalendarResolution,
  CivilLocalBirthTime,
  TimezoneResolution,
} from '../contracts/normalization';
import { DEOKBUNAI_SAJU_DAY_V1_RULE, calculateDayPillar } from './dayPillar';
import { DEOKBUNAI_SAJU_HOUR_V1_RULE, calculateHourPillar } from './hourPillar';
import { calculateMonthPillar, calculateYearPillar } from './pillars';
import { LUNAR_JS_SOLAR_TERM_ADAPTER } from '../solarTerm/lunarJsSolarTermProvider';
import type { LunarJsSolarTermAdapter } from '../solarTerm/lunarJsSolarTermAdapter';
import {
  DEOKBUNAI_SAJU_YEAR_MONTH_ATTRIBUTION_V1_RULE,
  resolveSajuYearAndMonth,
} from './sajuTemporalAttribution';
import type {
  ExactLocalCivilTime,
  SajuFourPillarsCalculationIdentity,
  SajuFourPillarsCalculationInput,
  SajuFourPillarsHour,
  SajuFourPillarsProvenance,
  SajuFourPillarsResult,
  SexagenaryPillar,
} from './contracts';

const SECONDS_PER_DAY = 86_400;
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });
/** Asia/Seoul standard offset (KST = UTC+9), the V1-only zone; used only when no resolved offset. */
const ASIA_SEOUL_STANDARD_OFFSET_SECONDS = 32_400;

/**
 * Reference UTC instant for the 立春/Jie attribution, derived from the CIVIL date + time (the
 * source of truth) and the resolved offset — NOT from timezone.candidate.utcEpochSeconds (which is
 * not always populated). Exact birth time is used when available; otherwise a canonical local noon
 * is used so the year/month remain resolvable for time-unknown births (correct except on a Jie
 * boundary DATE, which is genuinely ambiguous without a time — see docs).
 */
function birthReferenceEpochSeconds(
  calendar: Extract<CalendarResolution, { status: 'RESOLVED' }>,
  civilLocal: CivilLocalBirthTime,
  timezone: TimezoneResolution,
): number {
  const date = calendar.gregorianDate;
  let hour = 12;
  let minute = 0;
  let second = 0;
  if (civilLocal.accuracy === 'EXACT') {
    hour = civilLocal.time.hour;
    minute = civilLocal.time.minute;
    second = civilLocal.time.second ?? 0;
  }
  const offsetSeconds =
    timezone.status === 'RESOLVED' && 'resolvedOffsetSeconds' in timezone
      ? timezone.resolvedOffsetSeconds
      : ASIA_SEOUL_STANDARD_OFFSET_SECONDS;
  const dayCount = gregorianToCivilDayOrdinal(date) - UNIX_EPOCH_DAY;
  return dayCount * SECONDS_PER_DAY + hour * 3_600 + minute * 60 + second - offsetSeconds;
}

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
  return timezone.reason === 'HISTORICAL_SOURCE_CONFLICT' ||
    timezone.historicalProvenance.authorityStatus === 'SOURCE_CONFLICT'
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

  const localResolution = timezone.localTimeResolution;
  if (localResolution.kind === 'AMBIGUOUS') {
    return { status: 'AMBIGUOUS', reason: 'LOCAL_TIME_AMBIGUOUS' };
  }
  if (localResolution.kind === 'NONEXISTENT') {
    return { status: 'UNAVAILABLE', reason: 'LOCAL_TIME_NONEXISTENT' };
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
  solarTermAdapter: LunarJsSolarTermAdapter = LUNAR_JS_SOLAR_TERM_ADAPTER,
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

  // CORRECTED ATTRIBUTION: Saju YEAR by 立春, Saju MONTH by the twelve 節 (Jie) — NOT the lunar
  // calendar year/month. The sexagenary + Five-Tiger STEM/BRANCH arithmetic below is unchanged.
  const referenceEpochSeconds = birthReferenceEpochSeconds(
    calendar,
    civilLocal,
    input.normalized.timezone,
  );
  const attribution = resolveSajuYearAndMonth(referenceEpochSeconds, solarTermAdapter);
  if (!attribution.ok) {
    return unavailable(input, {
      code: 'YEAR_MONTH_ATTRIBUTION_FAILED',
      attributionReason: attribution.error.code,
    });
  }
  const yearPillar = calculateYearPillar(attribution.value.sajuYear);
  if (!yearPillar.ok) {
    return unavailable(input, {
      code: 'CORE_CALCULATION_FAILED',
      coreErrorCode: yearPillar.error.code,
    });
  }
  const monthPillar = calculateMonthPillar(
    yearPillar.value,
    attribution.value.jieMonthOrdinal as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
  );
  if (!monthPillar.ok) {
    return unavailable(input, {
      code: 'CORE_CALCULATION_FAILED',
      coreErrorCode: monthPillar.error.code,
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
    yearMonthAttributionRule: DEOKBUNAI_SAJU_YEAR_MONTH_ATTRIBUTION_V1_RULE,
    dayRule: DEOKBUNAI_SAJU_DAY_V1_RULE,
    hourRule: DEOKBUNAI_SAJU_HOUR_V1_RULE,
    calendarDatasetVersion: calendar.calendarDatasetVersion,
    calendarConversionRuleVersion: calendar.calendarConversionRuleVersion,
    engineRuleSetVersion: input.engineRuleSetVersion,
  };
  const pillars = {
    year: yearPillar.value,
    month: monthPillar.value,
    day: day.value,
    hour,
  };

  return hour.status === 'AVAILABLE'
    ? { status: 'COMPLETE', pillars, identity, provenance }
    : { status: 'PARTIAL', pillars, identity, provenance };
}
