// BirthInfoDraft (app) → ZiweiBirthInput (SOLAR-normalized) for the Ziwei engine.
//
// Lunar births are converted to their canonical SOLAR date via `lunar-javascript` —
// the SAME calendar authority the frozen 사주 engine trusts (deokbunai.solar-term.v1)
// and the Ziwei golden oracle — so 사주 and 자미 agree on the underlying solar instant.
// This is a calendar READ of a verified library, NOT a new calendar / lunar / 절기
// implementation (directive §1/§8). A LEAP lunar month uses lunar-javascript's negative-
// month convention (verified: Lunar.fromYmd(2020,-4,15) → solar 2020-06-06). Solar births
// pass through unchanged. On any non-numeric / failed conversion the raw values pass
// through and the engine fail-closes (never a fabricated date).
import { Lunar } from 'lunar-javascript';

import type { ZiweiBirthInput } from './ziweiInputAdapter';

// Structural subset of BirthInfoDraft — keeps the Ziwei feature decoupled from the full
// app draft (a real BirthInfoDraft satisfies it; tests can construct it directly).
export type ZiweiBirthSource = {
  gender: 'male' | 'female' | null;
  calendarType: 'solar' | 'lunar' | null;
  lunarMonthType: 'regular' | 'leap' | null;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  birthTimeAccuracy: 'exact' | 'approximate' | 'unknown' | null;
};

function resolveSolarYmd(b: ZiweiBirthSource): { year: string; month: string; day: string } {
  const raw = { year: b.birthYear, month: b.birthMonth, day: b.birthDay };
  if (b.calendarType !== 'lunar') return raw;

  const y = Number(b.birthYear);
  const m = Number(b.birthMonth);
  const d = Number(b.birthDay);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m === 0 || !Number.isInteger(d)) return raw;

  // lunar-javascript encodes a LEAP month as a negative month number.
  const signedMonth = b.lunarMonthType === 'leap' ? -Math.abs(m) : Math.abs(m);
  try {
    const solar = Lunar.fromYmd(y, signedMonth, d).getSolar();
    return { year: String(solar.getYear()), month: String(solar.getMonth()), day: String(solar.getDay()) };
  } catch {
    return raw; // conversion failed → engine fail-closes on the raw values
  }
}

export function toZiweiBirthInput(birth: ZiweiBirthSource): ZiweiBirthInput {
  const solar = resolveSolarYmd(birth);
  return {
    gender: birth.gender,
    birthYear: solar.year,
    birthMonth: solar.month,
    birthDay: solar.day,
    birthHour: birth.birthHour,
    birthMinute: birth.birthMinute,
    birthTimeAccuracy: birth.birthTimeAccuracy,
  };
}
