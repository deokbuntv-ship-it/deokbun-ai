// Canonical active-대운 resolver — DATE-based (만나이 from the engine's own birth date), day-level precision,
// fail-closed. The prior year-subtraction (evalYear − birthYear) was ±1 near a decade boundary; these prove
// the boundary is now correct. Synthetic daewoon results keep the boundary math exact + engine-independent.
import { resolveActiveDaewoonOrdinal } from '../index';

type Daewoon = Parameters<typeof resolveActiveDaewoonOrdinal>[0];
const cycles = [
  { ordinal: 1, startAgeInclusive: 3, endAgeInclusive: 12 },
  { ordinal: 2, startAgeInclusive: 13, endAgeInclusive: 22 },
  { ordinal: 3, startAgeInclusive: 23, endAgeInclusive: 32 },
  { ordinal: 4, startAgeInclusive: 33, endAgeInclusive: 42 },
];
// born 1990-10-20 (KST). Turns 33 (→ cycle 4) on 2023-10-20.
const daewoon = (cap: 'AVAILABLE' | 'UNAVAILABLE' = 'AVAILABLE'): Daewoon =>
  ({
    capability: cap,
    start: { timing: { birthLocalDateTime: { date: { year: 1990, month: 10, day: 20 } } } },
    cycles,
  }) as unknown as Daewoon;

// epoch for a KST civil date at local noon (KST = UTC+9 → UTC 03:00).
const kstNoonEpoch = (y: number, m: number, d: number) => Math.floor(Date.UTC(y, m - 1, d, 3, 0, 0) / 1000);

describe('resolveActiveDaewoonOrdinal — date-based boundary', () => {
  it('the day BEFORE the decade birthday → previous cycle (year-subtraction would wrongly advance)', () => {
    // 2023-10-19: 만나이 32 → cycle 3. (evalYear−birthYear = 2023−1990 = 33 would wrongly give cycle 4.)
    expect(resolveActiveDaewoonOrdinal(daewoon(), kstNoonEpoch(2023, 10, 19))).toBe(3);
  });
  it('ON and AFTER the decade birthday → new cycle', () => {
    expect(resolveActiveDaewoonOrdinal(daewoon(), kstNoonEpoch(2023, 10, 20))).toBe(4); // exact birthday
    expect(resolveActiveDaewoonOrdinal(daewoon(), kstNoonEpoch(2024, 3, 1))).toBe(4); // well after
  });
  it('mid-cycle resolves the containing cycle', () => {
    expect(resolveActiveDaewoonOrdinal(daewoon(), kstNoonEpoch(2010, 1, 1))).toBe(2); // age ~19
    expect(resolveActiveDaewoonOrdinal(daewoon(), kstNoonEpoch(2000, 1, 1))).toBe(1); // age ~9
  });
  it('fail-closed: 대운 unavailable (e.g. 시주 미상) → null, never a fabricated cycle', () => {
    expect(resolveActiveDaewoonOrdinal(daewoon('UNAVAILABLE'), kstNoonEpoch(2024, 1, 1))).toBeNull();
  });
  it('deterministic for the same (daewoon, instant)', () => {
    const e = kstNoonEpoch(2026, 8, 25);
    expect(resolveActiveDaewoonOrdinal(daewoon(), e)).toBe(resolveActiveDaewoonOrdinal(daewoon(), e));
  });
});
