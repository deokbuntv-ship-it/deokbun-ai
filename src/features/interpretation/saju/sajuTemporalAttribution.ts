// Saju TEMPORAL ATTRIBUTION — resolve which Saju YEAR (立春 boundary) and MONTH (12 Jie boundary)
// a birth instant belongs to. This is the corrected attribution layer: the canonical Four-Pillars
// year/month boundaries are the Sun's position (立春 for the year, the twelve 節 for the month),
// NOT the lunar-calendar year/month. Solar↔Lunar conversion is a SEPARATE concern and is untouched.
//
// REUSE-ONLY: this consumes the already-accepted ENGINE-12 Solar-Term V1 runtime (the
// lunar-javascript getPrevJie/getNextJie adapter) and its MINUTE-level boundary policy + supported
// range. It performs NO astronomy, NO new calendar math — it maps the adapter's Jie results to a
// Saju year label and a 寅=1..丑=12 month ordinal, then hands those to the existing sexagenary +
// Five-Tiger pillar arithmetic (elsewhere). Boundary ties and unknown-time boundary dates fail
// closed (AMBIGUOUS) rather than being arbitrarily forced to one side.
import { civilDayOrdinalToGregorian, compareGregorianDates, gregorianToCivilDayOrdinal } from '../calendar/civilDay';
import type { LocalDate } from '../domain/time';
import type {
  CanonicalSolarTermInstant,
  LunarJsSolarTermAdapter,
} from '../solarTerm/lunarJsSolarTermAdapter';
import { DEOKBUNAI_SOLAR_TERM_V1_POLICY } from '../solarTerm/lunarJsSolarTermAdapter';
import type { SolarTermId } from '../solarTerm/contracts';

export const DEOKBUNAI_SAJU_YEAR_MONTH_ATTRIBUTION_V1_RULE = {
  ruleId: 'DEOKBUNAI_SAJU_YEAR_MONTH_ATTRIBUTION_V1',
  ruleVersion: 'deokbunai.saju-year-month-attribution.v1',
  /** Saju YEAR rolls over at 立春 (start of 寅월), never at Lunar New Year or Jan 1. */
  yearBoundary: 'START_OF_SPRING_IPCHUN',
  /** Saju MONTH rolls over at the twelve monthly 節 (Jie), never at lunar day-1 or Gregorian month-1. */
  monthBoundary: 'TWELVE_JIE_JIEQI',
  solarTerm: {
    provider: 'lunar-javascript',
    providerVersion: '1.7.7',
    adapterRuleVersion: 'deokbunai.solar-term-lunarjs-adapter.v1',
    solarTermRuleVersion: DEOKBUNAI_SOLAR_TERM_V1_POLICY.ruleVersion, // deokbunai.solar-term.v1
    boundaryPrecision: 'MINUTE',
    boundaryTiePolicy: 'SAME_UTC_MINUTE_IS_AMBIGUOUS', // reused from ENGINE-12
    supportedRange: 'FIXED_1970_01_01_THROUGH_2050_12_31', // reused from ENGINE-12
  },
} as const;

/**
 * The twelve 節 (Jie) → Saju month ordinal (寅월=1 … 丑월=12). This is the canonical monthly
 * boundary sequence: 立春→寅, 驚蟄→卯, 清明→辰, 立夏→巳, 芒種→午, 小暑→未, 立秋→申, 白露→酉,
 * 寒露→戌, 立冬→亥, 大雪→子, 小寒→丑.
 */
export const JIE_TERM_TO_SAJU_MONTH_ORDINAL: Readonly<
  Partial<Record<SolarTermId, number>>
> = {
  START_OF_SPRING: 1, // 立春 寅
  AWAKENING_OF_INSECTS: 2, // 驚蟄 卯
  PURE_BRIGHTNESS: 3, // 清明 辰
  START_OF_SUMMER: 4, // 立夏 巳
  GRAIN_IN_EAR: 5, // 芒種 午
  MINOR_HEAT: 6, // 小暑 未
  START_OF_AUTUMN: 7, // 立秋 申
  WHITE_DEW: 8, // 白露 酉
  COLD_DEW: 9, // 寒露 戌
  START_OF_WINTER: 10, // 立冬 亥
  MAJOR_SNOW: 11, // 大雪 子
  MINOR_COLD: 12, // 小寒 丑
} as const;

export type SajuYearMonthAttribution = {
  /** Saju year label (立春-based). Feed to the existing calculateYearPillar arithmetic. */
  sajuYear: number;
  /** 寅월=1 … 丑월=12. Feed to the existing calculateMonthPillar (Five-Tiger) arithmetic. */
  jieMonthOrdinal: number;
  /** The governing 節 (the most-recent Jie at/before the instant). */
  governingJie: CanonicalSolarTermInstant;
};

export type SajuYearMonthAttributionErrorCode =
  | 'INVALID_REFERENCE_INSTANT'
  | 'UNSUPPORTED_DATE_RANGE'
  | 'SOLAR_TERM_UNAVAILABLE'
  | 'UNSUPPORTED_JIE_TERM'
  | 'AMBIGUOUS_BOUNDARY_MINUTE'
  | 'AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE';

export type SajuYearMonthAttributionResult =
  | { ok: true; value: SajuYearMonthAttribution }
  | { ok: false; error: { code: SajuYearMonthAttributionErrorCode; details?: Record<string, string | number> } };

export type ResolveSajuYearMonthOptions = {
  /**
   * Whether the reference instant carries an EXACT birth time. When false (unknown/approximate),
   * a Jie/立春 boundary FALLING ON the reference date makes the pillar undeterminable without a
   * time → AMBIGUOUS (never noon-forced). A boundary-free date stays safe.
   */
  timeIsKnown?: boolean;
};

const SECONDS_PER_DAY = 86_400;
const SECONDS_PER_MINUTE = 60;
const KST_OFFSET_SECONDS = 32_400; // Asia/Seoul V1-only zone
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

function epochToKstDate(epochSeconds: number): LocalDate {
  const shifted = epochSeconds + KST_OFFSET_SECONDS;
  const dayOffset = Math.floor(shifted / SECONDS_PER_DAY);
  return civilDayOrdinalToGregorian(UNIX_EPOCH_DAY + dayOffset);
}

const utcMinute = (epochSeconds: number): number => Math.floor(epochSeconds / SECONDS_PER_MINUTE);

/**
 * Resolve the Saju (year, month-ordinal) for a birth/target UTC instant using the 立春/Jie rule.
 *
 * Method: the most-recent 節 (REVERSE / getPrevJie) that has passed determines the CURRENT Saju
 * month; the same term determines the Saju YEAR. Only 小寒/丑월 (month 12) falls in the January of
 * the NEXT Gregorian year relative to its Saju year, so that single case subtracts one; every other
 * 節 (立春 through 大雪) occurs in the same Gregorian year as the Saju year it opens/continues.
 *
 * Fail-closed guards (all reuse ENGINE-12 policy — NO new astronomy):
 *   • range: reference date must be within 1970-01-01 … 2050-12-31 → UNSUPPORTED_DATE_RANGE.
 *   • boundary minute: reference within the SAME UTC minute as the governing/next Jie → AMBIGUOUS.
 *   • unknown time on a boundary date → AMBIGUOUS (never noon-forced).
 */
export function resolveSajuYearAndMonth(
  referenceEpochSeconds: number,
  solarTermAdapter: LunarJsSolarTermAdapter,
  options: ResolveSajuYearMonthOptions = {},
): SajuYearMonthAttributionResult {
  if (!Number.isSafeInteger(referenceEpochSeconds)) {
    return { ok: false, error: { code: 'INVALID_REFERENCE_INSTANT' } };
  }

  // FIX 3 — explicit supported range (reused from ENGINE-12), enforced for every caller.
  const referenceDate = epochToKstDate(referenceEpochSeconds);
  const range = DEOKBUNAI_SOLAR_TERM_V1_POLICY.supportedBirthRange;
  if (
    compareGregorianDates(referenceDate, range.start) < 0 ||
    compareGregorianDates(referenceDate, range.end) > 0
  ) {
    return {
      ok: false,
      error: { code: 'UNSUPPORTED_DATE_RANGE', details: { ...referenceDate } },
    };
  }

  // FIX 1 — same-UTC-minute boundary tie (ENGINE-12 minute policy) → AMBIGUOUS, never forced.
  // Checked BEFORE the REVERSE resolve because a reference exactly AT a term makes getPrevJie fail.
  // getPrevJie/getNextJie only return NEIGHBOUR terms, so to detect a Jie sitting inside the
  // reference minute (incl. reference exactly AT a term) we resolve the first Jie strictly after
  // one minute earlier: if it lands in the reference minute, that minute contains a boundary.
  const refMinute = utcMinute(referenceEpochSeconds);
  const minuteProbe = solarTermAdapter.resolve({
    birthInstant: { kind: 'UTC_INSTANT', epochSeconds: referenceEpochSeconds - SECONDS_PER_MINUTE },
    direction: 'FORWARD',
  });
  if (minuteProbe.ok && utcMinute(minuteProbe.value.normalizedUtcInstant.epochSeconds) === refMinute) {
    return { ok: false, error: { code: 'AMBIGUOUS_BOUNDARY_MINUTE' } };
  }

  const governing = solarTermAdapter.resolve({
    birthInstant: { kind: 'UTC_INSTANT', epochSeconds: referenceEpochSeconds },
    direction: 'REVERSE',
  });
  if (!governing.ok) {
    return { ok: false, error: { code: 'SOLAR_TERM_UNAVAILABLE', details: { path: governing.error.path } } };
  }
  const next = solarTermAdapter.resolve({
    birthInstant: { kind: 'UTC_INSTANT', epochSeconds: referenceEpochSeconds },
    direction: 'FORWARD',
  });

  // FIX 2 — unknown/approximate time AND a boundary falls on the reference date → AMBIGUOUS.
  if (options.timeIsKnown === false) {
    const onGoverningDate =
      compareGregorianDates(epochToKstDate(governing.value.normalizedUtcInstant.epochSeconds), referenceDate) === 0;
    const onNextDate =
      next.ok &&
      compareGregorianDates(epochToKstDate(next.value.normalizedUtcInstant.epochSeconds), referenceDate) === 0;
    if (onGoverningDate || onNextDate) {
      return { ok: false, error: { code: 'AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE' } };
    }
  }

  const jieMonthOrdinal = JIE_TERM_TO_SAJU_MONTH_ORDINAL[governing.value.termId];
  if (jieMonthOrdinal === undefined) {
    return { ok: false, error: { code: 'UNSUPPORTED_JIE_TERM', details: { termId: governing.value.termId } } };
  }

  const jieGregorianYear = governing.value.sourceCivil.date.year;
  const sajuYear = jieMonthOrdinal === 12 ? jieGregorianYear - 1 : jieGregorianYear;

  return {
    ok: true,
    value: { sajuYear, jieMonthOrdinal, governingJie: governing.value },
  };
}
