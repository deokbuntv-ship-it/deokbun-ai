// Deterministic BIRTHDAY logic (§7). A birthday reminder is a KNOWN FACT from the user's stored birth date —
// NO LLM, no prediction (§7.1). Evaluated in the user's product timezone (Korea, §7.5), never the browser's.
// Feb 29 birthdays are OBSERVED on Feb 28 in non-leap years (§7.4 — defined behavior, not undefined).
const KST_OFFSET_SECONDS = 32_400; // Asia/Seoul = UTC+9 (fixed; no DST)

export type CivilDate = { year: number; month: number; day: number };

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// The Korea civil date for an epoch (ms).
export function kstCivilDate(nowMs: number): CivilDate {
  const shifted = new Date(Math.floor(nowMs / 1000) * 1000 + KST_OFFSET_SECONDS * 1000);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

// Whether `birth` (month/day) is celebrated on the civil date `on`. Feb 29 → Feb 28 in non-leap years.
export function isBirthdayOn(birth: { month: number; day: number }, on: CivilDate): boolean {
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(on.year)) {
    return on.month === 2 && on.day === 28;
  }
  return birth.month === on.month && birth.day === on.day;
}

export function isBirthdayTodayKst(birth: { month: number; day: number }, nowMs: number): boolean {
  return isBirthdayOn(birth, kstCivilDate(nowMs));
}

// Parse a BirthInfoDraft's birthMonth/birthDay strings into numbers; null when malformed.
export function birthMonthDay(birthInfo: { birthMonth?: string; birthDay?: string } | null | undefined): { month: number; day: number } | null {
  if (!birthInfo) return null;
  const month = Number(birthInfo.birthMonth);
  const day = Number(birthInfo.birthDay);
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { month, day };
}
