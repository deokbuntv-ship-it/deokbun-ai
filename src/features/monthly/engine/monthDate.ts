// The canonical FORTUNE MONTH — the product-record identity for 이번 달 운세. PURE + deterministic given a
// server epoch, so it is unit-testable and the SERVER (never the client clock) owns which month is canonical.
//
// CALENDAR LABEL vs 명리 CALCULATION (§7/§37/§38): the product identity + label are the CIVIL Korea
// (Asia/Seoul) year+month ("2026년 8월"). The deterministic 월운 pillar, however, is 節-based (solar-term
// boundaries, not civil month starts). We resolve it by handing the civil month's MIDPOINT (the 15th, 12:00
// KST) to the frozen solar-term resolver: that instant always lands in the 節-month that covers the MAJORITY
// of the civil month, so "8월 운세" reads the saju month that dominates civil August. Korea has no DST (+9h).
export const KST_OFFSET_SECONDS = 32_400; // Asia/Seoul = UTC+9 (fixed; no DST)
export const FORTUNE_TIMEZONE = 'Asia/Seoul';

export type TargetMonth = { year: number; month: number }; // civil; month is 1..12

const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

// The civil Korea (year, month) for a server epoch (seconds).
export function currentTargetMonth(epochSeconds: number): TargetMonth {
  const shifted = new Date((epochSeconds + KST_OFFSET_SECONDS) * 1000);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

// A representative UTC instant for the civil month: the 15th at 12:00 KST (= 03:00 UTC). Its 節-based saju
// month covers the majority of the civil month, so the frozen resolver attributes the DOMINANT 월운 pillar.
export function monthMidpointEpochSeconds(m: TargetMonth): number {
  return Math.floor(Date.UTC(m.year, m.month - 1, 15, 3, 0, 0) / 1000);
}

// "YYYY-MM" — the canonical month key (mailbox sort, cache read, DB identity pair mirror).
export function monthKey(m: TargetMonth): string {
  return `${m.year}-${pad2(m.month)}`;
}

// Parse a "YYYY-MM" back to a TargetMonth (the read-only ?ym= param); null when malformed.
export function parseMonthKey(key: string): TargetMonth | null {
  const mm = /^(\d{4})-(\d{2})$/.exec(key);
  if (!mm) return null;
  const year = Number(mm[1]);
  const month = Number(mm[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

// Consumer label — "2026년 8월".
export function formatMonthLabel(m: TargetMonth): string {
  return `${m.year}년 ${m.month}월`;
}

// A best-effort CLIENT guess of the current fortune month, used ONLY as a cache-read hint (never the write
// key — the server supplies the authoritative month on generation). A near-boundary guess only causes a
// self-healing cache miss.
export function clientCurrentMonthGuess(nowMs: number): TargetMonth {
  return currentTargetMonth(Math.floor(nowMs / 1000));
}
