// Cache seam tests (directive §24). Memoization must return results identical to
// the pure function and must be deterministic (no staleness for the same input).
import { clearZiweiCache, computeZiweiChartMemoized } from '../services/ziweiCache';
import { computeZiweiChart } from '../services/ziweiService';
import type { ZiweiBirthInput } from '../adapters/ziweiInputAdapter';

const birth = (over: Partial<ZiweiBirthInput> = {}): ZiweiBirthInput => ({
  gender: 'male',
  birthYear: '1988',
  birthMonth: '12',
  birthDay: '1',
  birthHour: '9',
  birthMinute: '0',
  birthTimeAccuracy: 'exact',
  ...over,
});

beforeEach(() => clearZiweiCache());

describe('computeZiweiChartMemoized', () => {
  it('returns a result identical to the pure computeZiweiChart', () => {
    const pure = computeZiweiChart(birth());
    const memo = computeZiweiChartMemoized(birth());
    expect(JSON.stringify(memo)).toBe(JSON.stringify(pure));
  });

  it('returns the SAME cached reference on repeated identical input', () => {
    const a = computeZiweiChartMemoized(birth());
    const b = computeZiweiChartMemoized(birth());
    expect(a).toBe(b); // same object → served from cache
  });

  it('distinguishes different inputs', () => {
    const a = computeZiweiChartMemoized(birth({ birthHour: '9' }));
    const b = computeZiweiChartMemoized(birth({ birthHour: '21' }));
    expect(a).not.toBe(b);
  });

  it('caches missing_birth_time inputs without recomputing per hour value', () => {
    const a = computeZiweiChartMemoized(birth({ birthTimeAccuracy: 'unknown', birthHour: '3' }));
    const b = computeZiweiChartMemoized(birth({ birthTimeAccuracy: 'unknown', birthHour: '20' }));
    expect(a.availability).toBe('missing_birth_time');
    expect(a).toBe(b); // both collapse to the same acc-keyed entry
  });
});
