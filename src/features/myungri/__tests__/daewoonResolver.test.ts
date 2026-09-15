// Canonical active-대운 resolver — SYMBOLIC-boundary, MINUTE precision (ENGINE-12). The boundary is the
// minute-derived `symbolicLocalDateTime` + 10-civil-year cycles, compared through the historical Asia/Seoul
// resolver — NOT the rounded start age (display-only) and NOT a fixed UTC+9. The symbolic starts below ARE the
// frozen ENGINE-12 golden-fixture outputs (daewoonGoldenFixtures: fixture 1 → 2030-12-12 13:44; fixture 2 →
// 2020-03-16 11:30), so this validates the resolver against the golden truth. Eval epochs are computed
// INDEPENDENTLY (KST civil → UTC, baking −9h into the hour) so a conversion sign-error in the resolver cannot
// self-cancel. Synthetic daewoon results keep the boundary math exact + engine-independent.
import { ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER } from '@/features/interpretation';

import { resolveActiveDaewoonAtInstant } from '../index';

type Daewoon = Parameters<typeof resolveActiveDaewoonAtInstant>[0];
const TZ = ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER;

type Symbolic = { date: { year: number; month: number; day: number }; time: { hour: number; minute: number; second: number } };
// DISPLAY ages are deliberately set so fixture 1's subject is only ~6 at the symbolic start (birth 2024-04-15) —
// younger than cycle 1's startAgeInclusive=7 — proving selection is by the SYMBOLIC boundary, never the label.
const mk = (symbolic: Symbolic, cap: 'AVAILABLE' | 'UNAVAILABLE' = 'AVAILABLE'): Daewoon =>
  ({
    capability: cap,
    start: { timing: { symbolicLocalDateTime: symbolic } },
    cycles: [
      { ordinal: 1, startAgeInclusive: 7, endAgeInclusive: 16 },
      { ordinal: 2, startAgeInclusive: 17, endAgeInclusive: 26 },
      { ordinal: 3, startAgeInclusive: 27, endAgeInclusive: 36 },
    ],
  }) as unknown as Daewoon;

const F1: Symbolic = { date: { year: 2030, month: 12, day: 12 }, time: { hour: 13, minute: 44, second: 0 } };
const F2: Symbolic = { date: { year: 2020, month: 3, day: 16 }, time: { hour: 11, minute: 30, second: 0 } };

// KST civil datetime → UTC epoch seconds, computed INDEPENDENTLY of the resolver (post-1988 KST = UTC+9).
const kst = (y: number, mo: number, d: number, h: number, mi: number) =>
  Math.floor(Date.UTC(y, mo - 1, d, h - 9, mi, 0) / 1000);

describe('resolveActiveDaewoonAtInstant — symbolic minute boundary (golden fixture 1: 2030-12-12 13:44)', () => {
  it('one minute BEFORE the first symbolic start → no active 대운 (null), never a fabricated cycle', async () => {
    expect(await resolveActiveDaewoonAtInstant(mk(F1), kst(2030, 12, 12, 13, 43), TZ)).toBeNull();
  });
  it('EXACTLY at the first symbolic start → cycle 1 (inclusive lower bound)', async () => {
    expect((await resolveActiveDaewoonAtInstant(mk(F1), kst(2030, 12, 12, 13, 44), TZ))?.ordinal).toBe(1);
  });
  it('one minute AFTER the first symbolic start → still cycle 1', async () => {
    expect((await resolveActiveDaewoonAtInstant(mk(F1), kst(2030, 12, 12, 13, 45), TZ))?.ordinal).toBe(1);
  });
  it('the internal 10-year boundary is [start, next): 2040-12-12 13:43 → cycle 1, 13:44 → cycle 2', async () => {
    expect((await resolveActiveDaewoonAtInstant(mk(F1), kst(2040, 12, 12, 13, 43), TZ))?.ordinal).toBe(1);
    expect((await resolveActiveDaewoonAtInstant(mk(F1), kst(2040, 12, 12, 13, 44), TZ))?.ordinal).toBe(2);
  });
  it('DISPLAY age does NOT control selection: at the symbolic start the subject is age ~6 (< startAgeInclusive 7) yet cycle 1 is active', async () => {
    // An integer-age model (age 6 < 7) would wrongly return null here — the symbolic boundary governs.
    expect((await resolveActiveDaewoonAtInstant(mk(F1), kst(2030, 12, 12, 13, 44), TZ))?.ordinal).toBe(1);
  });
  it('AFTER the last generated cycle → null (no fabricated 11th cycle)', async () => {
    // 3 cycles → last ends at symbolic + 30y = 2060-12-12 13:44 (exclusive); at/after that → null.
    expect(await resolveActiveDaewoonAtInstant(mk(F1), kst(2060, 12, 12, 13, 44), TZ)).toBeNull();
  });
  it('exposes the resolved epoch boundaries of the active cycle', async () => {
    const a = await resolveActiveDaewoonAtInstant(mk(F1), kst(2035, 6, 1, 0, 0), TZ);
    expect(a?.ordinal).toBe(1);
    expect(a?.startBoundaryEpochSeconds).toBe(kst(2030, 12, 12, 13, 44));
    expect(a?.endBoundaryEpochSeconds).toBe(kst(2040, 12, 12, 13, 44));
  });
  it('fail-closed: 대운 unavailable (e.g. 시주 미상) → null', async () => {
    expect(await resolveActiveDaewoonAtInstant(mk(F1, 'UNAVAILABLE'), kst(2035, 1, 1, 0, 0), TZ)).toBeNull();
  });
  it('deterministic for the same (daewoon, instant)', async () => {
    const e = kst(2035, 6, 1, 12, 0);
    expect(await resolveActiveDaewoonAtInstant(mk(F1), e, TZ)).toEqual(await resolveActiveDaewoonAtInstant(mk(F1), e, TZ));
  });
});

describe('resolveActiveDaewoonAtInstant — golden fixture 2 (2020-03-16 11:30)', () => {
  it('11:29 → null, 11:30 → cycle 1, internal 2030-03-16 11:30 → cycle 2', async () => {
    expect(await resolveActiveDaewoonAtInstant(mk(F2), kst(2020, 3, 16, 11, 29), TZ)).toBeNull();
    expect((await resolveActiveDaewoonAtInstant(mk(F2), kst(2020, 3, 16, 11, 30), TZ))?.ordinal).toBe(1);
    expect((await resolveActiveDaewoonAtInstant(mk(F2), kst(2030, 3, 16, 11, 30), TZ))?.ordinal).toBe(2);
  });
});
