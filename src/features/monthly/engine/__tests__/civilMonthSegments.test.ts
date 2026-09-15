// Exercises the REAL frozen solar-term resolver (lunar-javascript) — like the evidence test — to prove the
// civil-month → 節-segment coverage (§9). Deterministic: solar-term instants are fixed astronomy.
import { resolveCivilMonthSajuSegments } from '@/features/monthly/engine/civilMonthSegments';
import { civilMonthStartEpoch, nextCivilMonth } from '@/features/monthly/engine/monthDate';

describe('resolveCivilMonthSajuSegments — full civil-month coverage across the 節 boundary', () => {
  it('A/B/E: civil August 2026 splits into 未월→申월 with the later (dominant) segment larger, contiguous, exact', () => {
    const segs = resolveCivilMonthSajuSegments({ year: 2026, month: 8 });
    expect(segs).not.toBeNull();
    expect(segs!.length).toBe(2);
    const [early, later] = segs!;
    // consecutive saju month ordinals (未=6 → 申=7)
    expect(early.sajuMonthOrdinal).toBe(6);
    expect(later.sajuMonthOrdinal).toBe(7);
    // the 節 (立秋) falls in early August → the later segment dominates (§B: boundary near the start).
    expect(later.durationSeconds).toBeGreaterThan(early.durationSeconds);
    // transition civil date is the later segment's start, in early August (立秋 ≈ Aug 7-8).
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(later.startCivilDate)!;
    expect(Number(m[2])).toBe(8);
    expect(Number(m[3])).toBeGreaterThanOrEqual(6);
    expect(Number(m[3])).toBeLessThanOrEqual(9);
    // §E: contiguous + covers exactly the whole civil month (no gaps/overlap).
    const start = civilMonthStartEpoch({ year: 2026, month: 8 });
    const end = civilMonthStartEpoch(nextCivilMonth({ year: 2026, month: 8 }));
    expect(early.startEpoch).toBe(start);
    expect(early.endEpoch).toBe(later.startEpoch);
    expect(later.endEpoch).toBe(end);
    expect(early.durationSeconds + later.durationSeconds).toBe(end - start);
  });

  it('F/G/H: leap-February 2028 crosses the 立春 YEAR boundary (丑월/prev-year → 寅월/this-year)', () => {
    const segs = resolveCivilMonthSajuSegments({ year: 2028, month: 2 });
    expect(segs).not.toBeNull();
    expect(segs!.length).toBe(2);
    const [early, later] = segs!;
    // 丑월 = ordinal 12 (previous saju year) → 寅월 = ordinal 1 (this saju year), rolling at 立春.
    expect(early.sajuMonthOrdinal).toBe(12);
    expect(later.sajuMonthOrdinal).toBe(1);
    expect(early.sajuYear).toBe(later.sajuYear - 1);
    // 立春 ≈ Feb 4; transition civil date in early February.
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(later.startCivilDate)!;
    expect(Number(m[2])).toBe(2);
    expect(Number(m[3])).toBeGreaterThanOrEqual(3);
    expect(Number(m[3])).toBeLessThanOrEqual(5);
    // §G: leap Feb 2028 has 29 days — the segments cover the full 29-day civil month.
    const start = civilMonthStartEpoch({ year: 2028, month: 2 });
    const end = civilMonthStartEpoch({ year: 2028, month: 3 });
    expect(end - start).toBe(29 * 24 * 60 * 60);
    expect(early.durationSeconds + later.durationSeconds).toBe(end - start);
  });
});
