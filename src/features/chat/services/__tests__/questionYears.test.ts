// Question target-year resolver (Commercial Quality Sprint §2 — TIMING_CLAIM_MISMATCH fix).
// Pure + deterministic. Resolves the SPECIFIC years a question references so buildMyungriEvidence
// can ground each one's 세운 from the frozen engine (and thereby anchor it for the timing validator).
import {
  resolveQuestionYears,
  epochForSajuYear,
  SUPPORTED_YEAR_MIN,
  SUPPORTED_YEAR_MAX,
  MAX_TARGET_YEARS,
} from '../questionYears';

const CUR = 2026; // pretend current 사주 year

describe('resolveQuestionYears', () => {
  it('extracts an explicit future year ("2027년") — the exact TIMING_CLAIM_MISMATCH case', () => {
    expect(resolveQuestionYears('2027년 사업운은 어때?', CUR)).toEqual([2027]);
  });
  it('resolves relative-definite years against the current 사주 year', () => {
    expect(resolveQuestionYears('내년 재물운', CUR)).toEqual([2027]);
    expect(resolveQuestionYears('내후년은 어떨까요', CUR)).toEqual([2028]);
    expect(resolveQuestionYears('올해 직업운', CUR)).toEqual([]); // current year already grounded → excluded
  });
  it('resolves numeric relative offsets ("3년 뒤")', () => {
    expect(resolveQuestionYears('3년 뒤 사업 흐름', CUR)).toEqual([2029]);
  });
  it('excludes the current year and dedupes/sorts multiple references', () => {
    expect(resolveQuestionYears('2026년, 2028년, 그리고 2027년', CUR)).toEqual([2027, 2028]);
  });
  it('caps at MAX_TARGET_YEARS to bound cost', () => {
    const years = resolveQuestionYears('2027년 2028년 2029년 2030년 2031년', CUR);
    expect(years.length).toBe(MAX_TARGET_YEARS);
    expect(years).toEqual([2027, 2028, 2029]);
  });
  it('drops years outside the engine-supported range (fail-closed — never a fabricated anchor)', () => {
    expect(resolveQuestionYears(`${SUPPORTED_YEAR_MAX + 5}년 사업운`, CUR)).toEqual([]);
    expect(resolveQuestionYears(`${SUPPORTED_YEAR_MIN - 5}년`, CUR)).toEqual([]);
    expect(resolveQuestionYears(`${SUPPORTED_YEAR_MAX}년`, CUR)).toEqual([SUPPORTED_YEAR_MAX]);
  });
  it('returns nothing for a non-timing question (no years to ground)', () => {
    expect(resolveQuestionYears('내 성격은 어때?', CUR)).toEqual([]);
  });
  it('handles a null reference year (relative terms unresolved, explicit years still work)', () => {
    expect(resolveQuestionYears('내년 사업운', null)).toEqual([]); // no reference → cannot resolve 내년
    expect(resolveQuestionYears('2030년 사업운', null)).toEqual([2030]); // explicit still resolves
  });
});

describe('epochForSajuYear', () => {
  it('maps a year to a mid-year instant that falls inside that Gregorian year (past 立春)', () => {
    const epoch = epochForSajuYear(2027);
    const d = new Date(epoch * 1000);
    expect(d.getUTCFullYear()).toBe(2027);
    expect(d.getUTCMonth()).toBe(6); // July (0-indexed) — safely between 立春 and year-end
  });
  it('is deterministic (no Date.now()/new Date() — Date.UTC only)', () => {
    expect(epochForSajuYear(2030)).toBe(epochForSajuYear(2030));
  });
});
