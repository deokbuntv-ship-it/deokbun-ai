// CIVIL-MONTH → 節-BASED SAJU-MONTH SEGMENTS (§2). A Korea civil calendar month usually spans ONE 節 (jie)
// boundary, so it overlaps TWO deterministic 월운 regimes (e.g. civil August = 未월 until 立秋 ~Aug 7, then
// 申월). The prior V1 read only the saju month at the civil midpoint (the 15th) — silently treating the whole
// civil month as one regime and dropping the early portion. This resolver instead splits the civil month at
// the ACTUAL 節 instant, so the monthly plan can cover the full month, weighted by real overlap duration.
//
// FROZEN-SAFE: it uses ONLY the existing solar-term attribution (resolveSajuTemporalForInstant). No engine
// semantics are modified. The 節 are ~30.4 days apart and civil months are ≤31 days, so a civil month contains
// AT MOST ONE 節 → this returns 1 or 2 segments. This module imports the frozen engine, so it is SERVER-ONLY
// (never pulled into the client bundle — monthDate.ts stays pure/client-safe).
import { resolveSajuTemporalForInstant } from '@/features/myungri';
import { civilMonthStartEpoch, kstDateString, nextCivilMonth, type TargetMonth } from '@/features/monthly/engine/monthDate';

export type CivilMonthSajuSegment = {
  /** Inclusive UTC epoch (seconds) the segment starts. */
  startEpoch: number;
  /** Exclusive UTC epoch (seconds) the segment ends. */
  endEpoch: number;
  durationSeconds: number;
  sajuYear: number;
  /** 節-based saju month ordinal (寅월=1 … 丑월=12). */
  sajuMonthOrdinal: number;
  /** Korea civil date (YYYY-MM-DD) the segment starts — for the later segment this is the 節 transition date. */
  startCivilDate: string;
};

export function resolveCivilMonthSajuSegments(target: TargetMonth): CivilMonthSajuSegment[] | null {
  const start = civilMonthStartEpoch(target);
  const end = civilMonthStartEpoch(nextCivilMonth(target)); // exclusive: 00:00 KST of the next month's 1st
  const a = resolveSajuTemporalForInstant(start);
  const b = resolveSajuTemporalForInstant(end - 1);
  if (!a || !b) return null; // out of the resolver's supported range → caller fails closed

  const seg = (s: number, e: number, sajuYear: number, ord: number): CivilMonthSajuSegment => ({
    startEpoch: s,
    endEpoch: e,
    durationSeconds: e - s,
    sajuYear,
    sajuMonthOrdinal: ord,
    startCivilDate: kstDateString(s),
  });

  // Same (sajuYear, ordinal) at both ends → the civil month sits entirely in one 節 regime (no boundary).
  if (a.sajuYear === b.sajuYear && a.jieMonthOrdinal === b.jieMonthOrdinal) {
    return [seg(start, end, a.sajuYear, a.jieMonthOrdinal)];
  }

  // Two regimes — binary-search the FIRST instant attributed to the later (b) regime (the 節 boundary). The
  // attribution is a monotonic step within the month (exactly one 節), so this converges to the exact instant.
  let lo = start;
  let hi = end;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    const m = resolveSajuTemporalForInstant(mid);
    if (m && m.sajuYear === b.sajuYear && m.jieMonthOrdinal === b.jieMonthOrdinal) hi = mid;
    else lo = mid;
  }
  const t = hi;
  return [seg(start, t, a.sajuYear, a.jieMonthOrdinal), seg(t, end, b.sajuYear, b.jieMonthOrdinal)];
}
