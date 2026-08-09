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
// The temporalContext defers ALL time-basis resolution to the ENGINE:
// - timezone = EXPLICIT Asia/Seoul  ← V1 KOREA-ONLY TIMEZONE POLICY.
//   DeokbunAI V1 serves Korean births, so the integration layer injects an explicit
//   IANA zoneId. The APP does NOT parse the birthPlace string, and does NOT compute
//   any offset/DST/transition — the ENGINE's ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER
//   (injected in manseService) owns all of that. Overseas births need a future
//   location→zone resolver; this is not place-string parsing disguised as a lookup.
// - dst = UNRESOLVED  → the ENGINE's resolver produces the authoritative DST.
// - trueSolarTime = DO_NOT_APPLY → mirrors the DeokbunAI product hour rule
//   (SajuHourPillarRuleDescriptor.trueSolarTime = 'DO_NOT_APPLY'); a policy flag,
//   NOT a solar-time calculation. Any other value trips PRODUCT_RULE_VIOLATION.

// V1 Korea-only timezone policy constant (see block comment above).
const V1_SUPPORTED_ZONE_ID = 'Asia/Seoul';

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
      // HH:MM wall-clock, represented as HH:MM:00 (local civil time). With the
      // Asia/Seoul resolver injected, EXACT + supported date + UNIQUE resolution
      // yields an AVAILABLE hour pillar; DST overlap/gap or unsupported dates stay
      // PARTIAL (ENGINE-decided). The APP never computes the offset.
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
      // V1 Korea-only policy: explicit IANA zoneId; ENGINE resolver owns offset/DST.
      timezone: {
        status: 'EXPLICIT',
        ianaZone: V1_SUPPORTED_ZONE_ID,
        source: 'APP',
      },
      dst: { status: 'UNRESOLVED' },
      trueSolarTime: { mode: 'DO_NOT_APPLY' },
    },
    gender: birthInfo.gender !== null ? GENDER_MAP[birthInfo.gender] : 'UNSPECIFIED',
  };
}

export function toSajuEngineInput(birthInfo: BirthInfoDraft): SajuEngineInput {
  return { engine: 'SAJU', birth: toCanonicalBirthInput(birthInfo) };
}
