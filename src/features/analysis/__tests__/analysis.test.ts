// Executable spec (directive §2-G). Drives the existing type-checked
// `runAnalysisSpecs()` harness under a real runner, and adds native jest cases
// for the primitives added this sprint (pg error mapping, char bounding, the
// log-and-rethrow DB combinator).
import {
  boundRecentByChars,
  logDbError,
  pgCodeOf,
  pgErrorToAppCode,
} from '../index';
import { runAnalysisSpecs } from './analysis.spec';

describe('analysis layer — runAnalysisSpecs harness', () => {
  it('passes every type-checked assertion without throwing', () => {
    const { passed } = runAnalysisSpecs();
    expect(passed).toBeGreaterThanOrEqual(20);
  });
});

describe('pgErrorToAppCode / pgCodeOf', () => {
  it('maps unique_violation (23505) → DUPLICATE_REQUEST', () => {
    expect(pgErrorToAppCode({ code: '23505' })).toBe('DUPLICATE_REQUEST');
  });
  it('maps RLS denial (42501) → FORBIDDEN', () => {
    expect(pgErrorToAppCode({ code: '42501' })).toBe('FORBIDDEN');
  });
  it('maps FK / not-null / check violations → INVALID_INPUT', () => {
    expect(pgErrorToAppCode({ code: '23503' })).toBe('INVALID_INPUT');
    expect(pgErrorToAppCode({ code: '23502' })).toBe('INVALID_INPUT');
    expect(pgErrorToAppCode({ code: '23514' })).toBe('INVALID_INPUT');
  });
  it('maps class-08 connection errors → NETWORK_ERROR', () => {
    expect(pgErrorToAppCode({ code: '08006' })).toBe('NETWORK_ERROR');
  });
  it('maps fetch/network messages → NETWORK_ERROR', () => {
    expect(pgErrorToAppCode({ message: 'Failed to fetch' })).toBe('NETWORK_ERROR');
  });
  it('defaults unknown/absent DB errors → DB_ERROR', () => {
    expect(pgErrorToAppCode({ code: 'ZZZ' })).toBe('DB_ERROR');
    expect(pgErrorToAppCode(null)).toBe('DB_ERROR');
  });
  it('reads the raw technical code, or null', () => {
    expect(pgCodeOf({ code: '23505' })).toBe('23505');
    expect(pgCodeOf({})).toBeNull();
    expect(pgCodeOf(null)).toBeNull();
  });
});

describe('boundRecentByChars', () => {
  const msg = (id: string, text: string) => ({ id, text });

  it('keeps the most-recent messages within the char budget', () => {
    const msgs = [msg('a', '1234'), msg('b', '5678'), msg('c', '90')];
    // budget 7: c(2)+b(4)=6 fits; adding a(4)→10 > 7 stops.
    const kept = boundRecentByChars(msgs, (m) => m.text, 7);
    expect(kept.map((m) => m.id)).toEqual(['b', 'c']);
  });

  it('always keeps at least the newest even if it alone exceeds the budget', () => {
    const kept = boundRecentByChars([msg('a', 'xxxxxxxxxx')], (m) => m.text, 3);
    expect(kept.map((m) => m.id)).toEqual(['a']);
  });

  it('respects maxCount independent of the char budget', () => {
    const msgs = Array.from({ length: 5 }, (_, i) => msg(String(i), 'x'));
    const kept = boundRecentByChars(msgs, (m) => m.text, 1000, 2);
    expect(kept.map((m) => m.id)).toEqual(['3', '4']);
  });
});

describe('logDbError', () => {
  it('re-throws the ORIGINAL error object (identity preserved) after logging', () => {
    const original = { code: '23505', message: 'dup' };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      let caught: unknown;
      try {
        logDbError(original, 'subject', 'createSubject');
      } catch (e) {
        caught = e;
      }
      // Same reference → callers keying off raw error.code keep working.
      expect(caught).toBe(original);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });
});
