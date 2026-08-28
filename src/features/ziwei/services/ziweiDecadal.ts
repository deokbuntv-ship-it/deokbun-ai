// 大限 (decadal period) — WHICH of the 12 natal palaces is this person's CURRENT 10-year period.
//
// No new astrology and no new library call: `castAstrolabe` (iztroAdapter.ts) already asks iztro for
// each palace's own `decadal: { range: [startAge, endAge], heavenlyStem, earthlyBranch }`, and
// `ziweiResultAdapter.ts` already carries it through onto every `ZiweiPalace` — it was computed and
// then never read (see `ziweiEvidenceAdapter.ts`'s own comment: "intentionally excluded from V1
// grounding"). This module is the ONE missing step: given the person's current nominal age, pick which
// palace's range contains it.
//
// AGE CONVENTION (a deliberate, documented simplification — ponytail: this is the ceiling, not a bug):
// age = (KST civil year of "now") - (solar birth year), i.e. whole calendar years elapsed, ignoring the
// exact birth day-of-year. iztro's decadal ranges are 10-year buckets, so this can only ever be wrong
// within the single calendar year straddling a bucket boundary — a materially smaller error than the
// bucket width itself. A within-year birthday-precise age is a separate, non-essential refinement; if
// ever needed, add it here without touching the palace/range data above.
//
// 流년 (annual) is a SEPARATE, NOT-YET-IMPLEMENTED capability (would need `astrolabe.horoscope()`, a
// new iztro integration surface with its own open date/timezone questions — see
// docs/ZIWEI_SCHOOL_DIFFERENCES.md) — deliberately deferred, not attempted here.
import type { ZiweiChart, ZiweiPalace } from '../domain/ziweiTypes';

/** Whole calendar years elapsed between a solar birth year and a KST reference epoch. */
export function currentAgeAt(chart: ZiweiChart, referenceEpochSeconds: number): number {
  const birthYear = Number.parseInt(chart.input.solarDate.split('-')[0], 10);
  const kst = new Date((referenceEpochSeconds + 9 * 3600) * 1000); // Asia/Seoul civil date
  return kst.getUTCFullYear() - birthYear;
}

/**
 * The palace whose `decadal.range` contains `age`, or `null` when no palace's range covers it (e.g. an
 * age past 125, or a degraded chart with no decadal data at all — never guessed, never defaulted to
 * 명궁).
 */
export function activeDecadalPalace(chart: ZiweiChart, age: number): ZiweiPalace | null {
  return chart.palaces.find((p) => p.decadal && age >= p.decadal.range[0] && age <= p.decadal.range[1]) ?? null;
}
