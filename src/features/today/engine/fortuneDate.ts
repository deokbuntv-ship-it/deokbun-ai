// The canonical FORTUNE DATE — the product-record identity for 오늘의 운세. PURE + deterministic given a
// server epoch, so it is unit-testable and the SERVER (never the client clock) owns which day is canonical.
//
// DAY-BOUNDARY DECISION (§7): fortune_date is the CIVIL Korea (Asia/Seoul) calendar date. The day changes at
// 00:00 KST — matching the frozen day-pillar rule (DEOKBUNAI_SAJU_DAY_V1_RULE.dayBoundary = 'CIVIL_MIDNIGHT',
// authority KASI_LUN_ILJIN). So the fortune_date and the 일진 pillar computed for it always agree, and there
// is no 子시(23:00) ambiguity at the product layer. Korea has no DST, so the offset is a fixed +9h.
export const KST_OFFSET_SECONDS = 32_400; // Asia/Seoul = UTC+9 (fixed; no DST)
export const FORTUNE_TIMEZONE = 'Asia/Seoul';

export type LocalCivilDate = { year: number; month: number; day: number };

const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

// The Korea civil date for a server epoch (seconds). Shift into KST, then read the UTC Y/M/D of the shifted
// instant — which equals the KST wall-clock date.
export function epochToKstCivilDate(epochSeconds: number): LocalCivilDate {
  const shifted = new Date((epochSeconds + KST_OFFSET_SECONDS) * 1000);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

// The canonical fortune_date string (YYYY-MM-DD, Korea civil date) for a server epoch.
export function fortuneDateStringFromEpoch(epochSeconds: number): string {
  const d = epochToKstCivilDate(epochSeconds);
  return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`;
}

// A best-effort CLIENT-side guess of today's fortune_date, used ONLY as a cache-read hint (never as the
// write key — the server supplies the authoritative fortune_date on generation, §29). Near midnight the
// guess may differ from the server by one boundary; that only causes a cache miss that self-heals when the
// edge returns the authoritative date.
export function clientTodayFortuneDateGuess(nowMs: number): string {
  return fortuneDateStringFromEpoch(Math.floor(nowMs / 1000));
}

// A stable YYYY.MM.DD (dot) label + Korean weekday for display. Deterministic from the fortune_date string.
const KO_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
export function formatFortuneDateLabel(fortuneDate: string): { dot: string; weekday: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fortuneDate);
  if (!m) return { dot: fortuneDate, weekday: '' };
  const [, y, mo, d] = m;
  // Noon-UTC of the civil date → weekday is stable regardless of timezone rendering.
  const weekdayIndex = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12)).getUTCDay();
  return { dot: `${y}.${mo}.${d}`, weekday: KO_WEEKDAYS[weekdayIndex] ?? '' };
}
