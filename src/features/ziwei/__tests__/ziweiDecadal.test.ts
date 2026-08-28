// 大限 (decadal period) selection — real chart, real iztro-computed decadal ranges (see
// `services/ziweiDecadal.ts` header for why no new library call was needed).
import { computeZiweiChart } from '../services/ziweiService';
import { currentAgeAt, activeDecadalPalace } from '../services/ziweiDecadal';

// Real, already-verified chart (locked in v1Conformance.test.ts): 1990-08-15 11:00 male.
// 명궁 range [6,15], 전택 range [36,45], 재백 range [86,95] — read directly from the real computed chart.
function chart() {
  const r = computeZiweiChart({
    gender: 'male', birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthHour: '11', birthMinute: '0', birthTimeAccuracy: 'exact',
  });
  if (r.availability !== 'available') throw new Error('fixture chart unavailable');
  return r.chart;
}

describe('currentAgeAt', () => {
  it('computes whole-year age from the KST civil year of the reference instant', () => {
    // 2026-08-27 12:00 KST == 2026-08-27 03:00 UTC
    const ref = Math.floor(Date.UTC(2026, 7, 27, 3, 0, 0) / 1000);
    expect(currentAgeAt(chart(), ref)).toBe(2026 - 1990);
  });

  it('a reference instant just after KST midnight still reads the correct KST civil year', () => {
    // 2001-01-01 00:30 KST == 2000-12-31 15:30 UTC
    const ref = Math.floor(Date.UTC(2000, 11, 31, 15, 30, 0) / 1000);
    expect(currentAgeAt(chart(), ref)).toBe(2001 - 1990);
  });
});

describe('activeDecadalPalace', () => {
  it('picks the palace whose real decadal range contains the age (young end)', () => {
    const p = activeDecadalPalace(chart(), 10);
    expect(p?.name).toBe('명궁');
    expect(p?.decadal).toEqual({ range: [6, 15], heavenlyStem: '기', earthlyBranch: '축' });
  });

  it('picks a different real palace for a different age bucket', () => {
    expect(activeDecadalPalace(chart(), 40)?.name).toBe('전택');
    expect(activeDecadalPalace(chart(), 90)?.name).toBe('재백');
  });

  it('range boundaries are inclusive on both ends', () => {
    expect(activeDecadalPalace(chart(), 6)?.name).toBe('명궁');
    expect(activeDecadalPalace(chart(), 15)?.name).toBe('명궁');
    expect(activeDecadalPalace(chart(), 16)?.name).not.toBe('명궁');
  });

  it('an age outside every real range (e.g. 0-5, before any palace starts) returns null, never a guess', () => {
    expect(activeDecadalPalace(chart(), 3)).toBeNull();
  });

  it('is pure and deterministic — same chart+age always returns the same palace', () => {
    const c = chart();
    expect(activeDecadalPalace(c, 40)).toEqual(activeDecadalPalace(c, 40));
  });
});
