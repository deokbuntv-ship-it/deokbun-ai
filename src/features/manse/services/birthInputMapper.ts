import type { BirthInfoDraft } from '@/features/consultation';
import type {
  ApproximateTimePeriod,
  BirthCalendarDate,
  BirthTimeInput,
  CanonicalBirthInput,
  SajuEngineInput,
} from '@/features/interpretation';

// APP-owned mapper: BirthInfoDraft (raw user input) -> ENGINE CanonicalBirthInput.
//
// ALLOWED: field naming / enum conversion, empty/null handling, raw string -> number.
// FORBIDDEN (all owned by the ENGINE): calendar/lunar conversion, timezone/DST,
// true-solar-time, date arithmetic, fingerprint, any saju calculation.
//
// The temporalContext deliberately defers all time-basis resolution to the ENGINE:
// - timezone/dst = UNRESOLVED  → the APP does not resolve time zones (no resolver
//   supplied in V1 → the ENGINE reports the hour pillar as PARTIAL/unavailable).
// - trueSolarTime = DO_NOT_APPLY → mirrors the DeokbunAI product hour rule
//   (SajuHourPillarRuleDescriptor.trueSolarTime = 'DO_NOT_APPLY'); it is a policy
//   flag, NOT a solar-time calculation. Any other value would trip the ENGINE's
//   PRODUCT_RULE_VIOLATION guard.

const GENDER_MAP: Record<
  NonNullable<BirthInfoDraft['gender']>,
  CanonicalBirthInput['gender']
> = {
  male: 'MALE',
  female: 'FEMALE',
};

const APPROXIMATE_PERIOD_MAP: Record<
  NonNullable<BirthInfoDraft['approximateTimePeriod']>,
  ApproximateTimePeriod
> = {
  dawn: 'DAWN',
  morning: 'MORNING',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
  night: 'NIGHT',
};

function toBirthCalendarDate(birthInfo: BirthInfoDraft): BirthCalendarDate {
  const year = Number(birthInfo.birthYear);
  const month = Number(birthInfo.birthMonth);
  const day = Number(birthInfo.birthDay);

  if (birthInfo.calendarType === 'lunar') {
    return {
      year,
      month,
      day,
      calendar: 'LUNAR',
      // The form guarantees lunarMonthType when lunar; default REGULAR defensively.
      lunarMonthKind: birthInfo.lunarMonthType === 'leap' ? 'LEAP' : 'REGULAR',
    };
  }

  return { year, month, day, calendar: 'GREGORIAN' };
}

function toBirthTimeInput(birthInfo: BirthInfoDraft): BirthTimeInput {
  if (birthInfo.birthTimeAccuracy === 'exact') {
    return {
      accuracy: 'EXACT',
      // HH:MM wall-clock, represented as HH:MM:00. The hour pillar still requires
      // a timezone resolver (V1: not supplied) so this remains PARTIAL for now.
      localTime: {
        hour: Number(birthInfo.birthHour),
        minute: Number(birthInfo.birthMinute),
        second: 0,
      },
    };
  }

  if (
    birthInfo.birthTimeAccuracy === 'approximate' &&
    birthInfo.approximateTimePeriod !== null
  ) {
    return {
      accuracy: 'APPROXIMATE',
      period: APPROXIMATE_PERIOD_MAP[birthInfo.approximateTimePeriod],
    };
  }

  // 'unknown', or approximate without a period → UNKNOWN (no invented time).
  return { accuracy: 'UNKNOWN' };
}

function toCanonicalBirthInput(birthInfo: BirthInfoDraft): CanonicalBirthInput {
  const label = birthInfo.birthPlace.trim();

  return {
    date: toBirthCalendarDate(birthInfo),
    time: toBirthTimeInput(birthInfo),
    // Raw place label only. No geocoding/coordinates (not the APP's concern).
    place: label.length > 0 ? { label } : {},
    temporalContext: {
      timezone: { status: 'UNRESOLVED' },
      dst: { status: 'UNRESOLVED' },
      trueSolarTime: { mode: 'DO_NOT_APPLY' },
    },
    gender: birthInfo.gender !== null ? GENDER_MAP[birthInfo.gender] : 'UNSPECIFIED',
  };
}

export function toSajuEngineInput(birthInfo: BirthInfoDraft): SajuEngineInput {
  return { engine: 'SAJU', birth: toCanonicalBirthInput(birthInfo) };
}
