// Pure birth-profile validation (extracted from birth-info.tsx so the form, the onboarding step, and the
// onboarding-completeness check all agree on ONE definition of "a complete SELF birth profile"). No engine
// calendar math here — it only checks that the required APP fields are present and in range. The frozen
// calendar/立春/lunar rules stay downstream (unchanged).
import type { BirthInfoDraft } from '@/features/consultation/types/consultation';

export const isValidYearString = (v: string): boolean => /^\d{4}$/.test(v);
export const isValidMonthString = (v: string): boolean => /^\d{1,2}$/.test(v) && Number(v) >= 1 && Number(v) <= 12;
export const isValidDayString = (v: string): boolean => /^\d{1,2}$/.test(v) && Number(v) >= 1 && Number(v) <= 31;
export const isValidHourString = (v: string): boolean => /^\d{1,2}$/.test(v) && Number(v) >= 0 && Number(v) <= 23;
export const isValidMinuteString = (v: string): boolean => /^\d{1,2}$/.test(v) && Number(v) >= 0 && Number(v) <= 59;

function isBirthTimeComplete(b: BirthInfoDraft): boolean {
  if (b.birthTimeAccuracy === 'exact') return isValidHourString(b.birthHour) && isValidMinuteString(b.birthMinute);
  if (b.birthTimeAccuracy === 'approximate') return b.approximateTimePeriod !== null;
  if (b.birthTimeAccuracy === 'unknown') return true; // "모름" is a VALID, complete answer — never invent a time
  return false;
}

// The single source of truth for "is this birth profile complete enough to be the canonical SELF profile".
// Mirrors birth-info.tsx's isFormValid exactly; a legacy/partial record fails closed (→ user completes it).
export function isCompleteBirthInfo(b: BirthInfoDraft | null | undefined): boolean {
  if (!b || typeof b !== 'object') return false;
  if (b.gender !== 'male' && b.gender !== 'female') return false;
  if (b.calendarType !== 'solar' && b.calendarType !== 'lunar') return false;
  if (b.calendarType === 'lunar' && b.lunarMonthType !== 'regular' && b.lunarMonthType !== 'leap') return false;
  if (!isValidYearString(b.birthYear) || !isValidMonthString(b.birthMonth) || !isValidDayString(b.birthDay)) return false;
  if (b.birthTimeAccuracy === null || b.birthTimeAccuracy === undefined) return false;
  if (!isBirthTimeComplete(b)) return false;
  if (typeof b.birthPlace !== 'string' || b.birthPlace.trim().length === 0) return false;
  return true;
}
