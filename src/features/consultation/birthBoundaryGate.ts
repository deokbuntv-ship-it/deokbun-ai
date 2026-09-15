// 절기 경계일 게이트 — the ONE place that decides "this birth date needs an exact time".
//
// WHY THIS FILE EXISTS SEPARATELY: `birthProfileValidation.ts` is deliberately free of engine calendar
// math ("No engine calendar math here"), and this judgment needs both the lunisolar calendar and the
// solar-term runtime. Keeping it here preserves that principle while giving every surface — the two
// registration forms, the Edge, and the 오늘/월별 notices — ONE definition instead of four.
//
// REUSE-ONLY. No astronomy, no calendar math, no doctrine. It calls the frozen engine's own
// `resolveSajuYearAndMonth` with `timeIsKnown: false` and reports whether the engine itself would fail
// with AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE. If the engine's rule ever changes, this follows it.
//
// The judgment is ADVISORY: it drives a warning and a typed reason code, never a save block.
import {
  LUNAR_JS_SOLAR_TERM_ADAPTER,
  gregorianToCivilDayOrdinal,
  resolveSajuYearAndMonth,
  resolveWithKasiCalendar,
  type BirthCalendarDate,
} from '@/features/interpretation';
import {
  isValidDayString,
  isValidMonthString,
  isValidYearString,
} from '@/features/consultation/birthProfileValidation';

/**
 * The typed reason a consultation / 오늘 / 월별 could not run for this birth. Distinct from the generic
 * GROUNDING_UNAVAILABLE so the client can say WHICH input fixes it instead of offering a retry.
 */
export const AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED = 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED';

export const BOUNDARY_NOTICE_TITLE = '이 날짜는 태어난 시각이 꼭 필요해요';

/** Registration form copy — approved wording, used verbatim. */
export const BOUNDARY_NOTICE_BODY_FORM =
  '선택하신 날은 사주의 달이 바뀌는 절기 경계일이라, 시각을 모르면 사주가 두 가지로 갈려 풀이를 드릴 수 없어요. '
  + '상담·오늘의 운세·월별 운세가 모두 이용되지 않습니다. '
  + '가족에게 태어난 시각을 확인해 보시고, 지금은 이대로 저장하셨다가 나중에 수정하셔도 됩니다.';

/**
 * 궁합 — the SAME judgment, but the consequence is categorically different, so the copy is too.
 *
 * A solo reading DEGRADES on a boundary birth (명리 fails, 기문 can still answer); 궁합 cannot. The pairwise
 * evidence needs BOTH frozen charts, so one ambiguous birth means there is nothing to compare and the answer
 * carries no chart at all. Measured 2026-09-06: the server does NOT fail in that case — it returns
 * `ok:true` with `grounded:false` and **12덕 is charged**. That is why the compatibility surfaces BLOCK
 * instead of warning. See `PROJECT_STATE.md` §7.29 and `KNOWN_RISKS.md` H6.
 */
export const BOUNDARY_NOTICE_TITLE_COMPATIBILITY = '태어난 시각을 알아야 궁합을 볼 수 있어요';

/**
 * Names the people whose time is missing, because the reader can only fix it if they know who. `names` comes
 * from the caller's already-loaded subjects, so nothing new is read and no birth date is shown.
 */
export function boundaryNoticeCompatibilityBody(names: readonly string[]): string {
  const who = names.length > 0 ? `${names.join(' 님과 ')} 님의` : '두 분 중 한 분의';
  return (
    `${who} 생일이 사주의 달이 바뀌는 절기 경계일이에요. `
    + '태어난 시각을 모르면 사주가 두 가지로 갈려서 어느 쪽으로 봐야 할지 정할 수 없어요. '
    + '궁합은 두 분의 사주가 모두 있어야 볼 수 있어서, 지금은 결과를 드릴 수 없어요. '
    + '태어난 시각을 확인해서 넣어 주시면 바로 이어서 봐드릴게요.'
  );
}

/**
 * Registration form copy when the person being registered is a 궁합 상대. The generic form copy lists
 * 상담·오늘의 운세·월별 운세 — none of which apply to someone else's profile — and its closing line
 * ("나중에 수정하셔도 됩니다") reads as "this is fine for now", which for a 궁합 target it is not.
 * Saving is still worth doing, so the choice stays; only the consequence is told truthfully.
 */
export const BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY =
  '이 날은 사주의 달이 바뀌는 절기 경계일이라, 태어난 시각을 모르면 사주가 두 가지로 갈려요. '
  + '이대로 저장하셔도 이 분과의 궁합은 볼 수 없어요. '
  + '가족이나 본인에게 태어난 시각을 확인해 보시고, 지금은 저장만 해두셨다가 나중에 넣으셔도 괜찮아요.';

/** Same message on a surface where there is nothing to save — the last sentence would be wrong there. */
export const BOUNDARY_NOTICE_BODY_SURFACE =
  '등록하신 생일은 사주의 달이 바뀌는 절기 경계일이라, 시각을 모르면 사주가 두 가지로 갈려 풀이를 드릴 수 없어요. '
  + '상담·오늘의 운세·월별 운세가 모두 이용되지 않습니다. '
  + '가족에게 태어난 시각을 확인하신 뒤 출생정보를 수정해 주세요.';

/** Structural subset of BirthInfoDraft — the app draft and the Edge's copy both satisfy it. */
export type BirthBoundaryInput = {
  calendarType: 'solar' | 'lunar' | null;
  lunarMonthType: 'regular' | 'leap' | null;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTimeAccuracy: 'exact' | 'approximate' | 'unknown' | null;
};

const SECONDS_PER_DAY = 86_400;
const KST_OFFSET_SECONDS = 32_400;
const LOCAL_NOON_SECONDS = 12 * 3_600;
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

/**
 * 'approximate' is NOT a weaker 'unknown' — the engine treats them identically. `birthReferenceEpochSeconds`
 * only reads a clock time when accuracy is EXACT, so an 오전/저녁 period never moves the reference instant
 * and never disambiguates a boundary. Both must warn.
 */
function needsBoundaryCheck(accuracy: BirthBoundaryInput['birthTimeAccuracy']): boolean {
  return accuracy === 'unknown' || accuracy === 'approximate';
}

function toBirthCalendarDate(b: BirthBoundaryInput): BirthCalendarDate {
  const year = Number(b.birthYear);
  const month = Number(b.birthMonth);
  const day = Number(b.birthDay);
  return b.calendarType === 'lunar'
    ? { year, month, day, calendar: 'LUNAR', lunarMonthKind: b.lunarMonthType === 'leap' ? 'LEAP' : 'REGULAR' }
    : { year, month, day, calendar: 'GREGORIAN' };
}

/**
 * True when this birth would fail as AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE: the time is not exact AND
 * one of the twelve 節 falls on the SOLAR birth date. A lunar input is converted first — the engine's
 * boundary test runs on `calendar.gregorianDate`, never on the entered lunar date.
 *
 * The ambiguity covers the WHOLE calendar day, not a window around the 절입 minute: with no exact time the
 * engine anchors at local noon and compares DATES, so a 00:05 절입 and a 23:55 절입 are equally ambiguous.
 *
 * Fails OPEN (returns false) on anything that is not this specific condition — an unsupported range, an
 * impossible date, or a thrown provider. Those surface through their own engine errors; inventing a
 * boundary warning for them would be wrong.
 */
export function isSolarTermBoundaryTimeRequired(b: BirthBoundaryInput | null | undefined): boolean {
  if (!b || !needsBoundaryCheck(b.birthTimeAccuracy)) return false;
  if (!isValidYearString(b.birthYear) || !isValidMonthString(b.birthMonth) || !isValidDayString(b.birthDay)) {
    return false;
  }
  try {
    const calendar = resolveWithKasiCalendar(toBirthCalendarDate(b));
    if (calendar.status !== 'RESOLVED') return false;
    const dayCount = gregorianToCivilDayOrdinal(calendar.gregorianDate) - UNIX_EPOCH_DAY;
    // Same anchor the engine uses for a time-unknown birth (fourPillars.birthReferenceEpochSeconds):
    // canonical local noon. The attribution resolver derives its comparison DATE with the same fixed
    // KST offset, so this round-trips to the intended calendar day.
    const noonEpochSeconds = dayCount * SECONDS_PER_DAY + LOCAL_NOON_SECONDS - KST_OFFSET_SECONDS;
    const attribution = resolveSajuYearAndMonth(noonEpochSeconds, LUNAR_JS_SOLAR_TERM_ADAPTER, {
      timeIsKnown: false,
    });
    return !attribution.ok && attribution.error.code === 'AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE';
  } catch {
    return false;
  }
}
