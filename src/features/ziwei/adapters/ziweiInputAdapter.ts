// BirthInfo → normalized ZiweiInput (directive §7).
//
// CALENDAR OWNERSHIP (§8): DeokbunAI feeds the RAW solar birth date to the Core,
// which performs its OWN lunar/干支 conversion (Option B). We do NOT run the
// birth through the 사주 calendar first and hand a normalized value to iztro —
// that would be double-normalization. Each engine normalizes the same RAW input
// independently and consistently. The frozen 사주 calendar engine is untouched.
// (Cross-engine 干支 agreement at boundary times is a documented Codex follow-up.)
//
// MISSING TIME (§7/§20): 자미두수 命宮 depends on the exact 시진. If the birth time
// is not `exact`, we DO NOT invent a 시진 — we return `missing_birth_time` and let
// the caller surface a truthful state.
import { timeIndexFromHour, type ZiweiInput } from '../domain/ziweiTypes';

// Minimal structural birth input (a subset of the app BirthInfoDraft — a real
// BirthInfoDraft satisfies it, and tests can construct it directly).
export type ZiweiBirthInput = {
  gender: 'male' | 'female' | null;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  birthTimeAccuracy: 'exact' | 'approximate' | 'unknown' | null;
};

export type ZiweiInputResolution =
  | { ok: true; input: ZiweiInput }
  | {
      ok: false;
      availability: 'missing_birth_time' | 'unsupported_case';
      reason: string;
    };

function isIntString(s: string): boolean {
  return /^\d+$/.test(s.trim());
}

// Days in a Gregorian month. Pure + deterministic (no Date object): proleptic Gregorian leap rule.
// NOT a calendar engine — a minimal validity guard so an impossible civil date (2024-02-30, month 13,
// day 0, …) can never become a trusted Ziwei chart (Codex PART A).
function daysInGregorianMonth(year: number, month: number): number {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const lengths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}
function isValidGregorianDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  return day <= daysInGregorianMonth(year, month);
}

export function resolveZiweiInput(birth: ZiweiBirthInput): ZiweiInputResolution {
  // Gender is required (drives 大限 direction and more).
  if (birth.gender !== 'male' && birth.gender !== 'female') {
    return { ok: false, availability: 'unsupported_case', reason: 'GENDER_REQUIRED' };
  }
  // Complete, numeric solar birth date required.
  if (![birth.birthYear, birth.birthMonth, birth.birthDay].every((v) => v && isIntString(v))) {
    return { ok: false, availability: 'unsupported_case', reason: 'BIRTH_DATE_REQUIRED' };
  }
  // The solar date must be a REAL Gregorian civil date — fail closed, never silently roll over
  // (2024-02-30 must NOT become 2024-03-01) (Codex PART A).
  if (!isValidGregorianDate(Number(birth.birthYear), Number(birth.birthMonth), Number(birth.birthDay))) {
    return { ok: false, availability: 'unsupported_case', reason: 'BIRTH_DATE_INVALID' };
  }
  // Exact birth time required — no fabricated 시진 for approximate/unknown.
  if (birth.birthTimeAccuracy !== 'exact' || !isIntString(birth.birthHour)) {
    return { ok: false, availability: 'missing_birth_time', reason: 'BIRTH_TIME_REQUIRED' };
  }

  const hour = Number(birth.birthHour);
  if (hour < 0 || hour > 23) {
    return { ok: false, availability: 'unsupported_case', reason: 'BIRTH_HOUR_OUT_OF_RANGE' };
  }

  return {
    ok: true,
    input: {
      solarDate: `${Number(birth.birthYear)}-${Number(birth.birthMonth)}-${Number(birth.birthDay)}`,
      timeIndex: timeIndexFromHour(hour),
      gender: birth.gender === 'male' ? '男' : '女',
    },
  };
}
