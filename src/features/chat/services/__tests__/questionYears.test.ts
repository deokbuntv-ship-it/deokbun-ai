// Temporal resolution (Temporal Grounding Sprint §18). Pure + deterministic. Resolves the EXACT
// Gregorian years a question references — explicit, relative, RANGE, and forward DURATION — so
// buildMyungriEvidence can ground each year's 세운 from the frozen engine. The reference year is
// INCLUDED when referenced (contract change from the single-year sprint).
import {
  resolveQuestionYears,
  epochForSajuYear,
  SUPPORTED_YEAR_MIN,
  SUPPORTED_YEAR_MAX,
  MAX_TARGET_YEARS,
} from '../questionYears';

const CUR = 2026; // server-derived current 사주 year

describe('resolveQuestionYears — §18 temporal matrix', () => {
  it('1) 올해 → [ref]', () => expect(resolveQuestionYears('올해 사업운', CUR)).toEqual([2026]));
  it('2) 내년 → [ref+1]', () => expect(resolveQuestionYears('내년 사업운', CUR)).toEqual([2027]));
  it('3) 내후년 → [ref+2]', () => expect(resolveQuestionYears('내후년 사업운', CUR)).toEqual([2028]));
  it('4) 3년 뒤 → single point [ref+3]', () => expect(resolveQuestionYears('3년 뒤 사업운', CUR)).toEqual([2029]));

  it('5) 앞으로 3년 → exactly 3 annual years incl. ref', () => {
    expect(resolveQuestionYears('앞으로 3년 사업운', CUR)).toEqual([2026, 2027, 2028]);
  });
  it('6) 앞으로 10년 → exactly 10 supported years incl. ref (the live failure case)', () => {
    expect(resolveQuestionYears('앞으로 10년 사업 흐름 알려줘', CUR)).toEqual([
      2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035,
    ]);
  });
  it('6b) 향후 5년 / N년간 also parse as forward durations', () => {
    expect(resolveQuestionYears('향후 5년 재물운', CUR)).toEqual([2026, 2027, 2028, 2029, 2030]);
    expect(resolveQuestionYears('앞으로 3년간 사업 흐름', CUR)).toEqual([2026, 2027, 2028]);
  });

  it('7) 2027년부터 2030년까지 → inclusive [2027..2030]', () => {
    expect(resolveQuestionYears('2027년부터 2030년까지 사업운', CUR)).toEqual([2027, 2028, 2029, 2030]);
  });
  it('8) 2027~2030년 and 2027-2030년 → same inclusive range', () => {
    expect(resolveQuestionYears('2027~2030년 흐름', CUR)).toEqual([2027, 2028, 2029, 2030]);
    expect(resolveQuestionYears('2027-2030년 흐름', CUR)).toEqual([2027, 2028, 2029, 2030]);
  });

  it('single explicit year stays a single year (no multi-year evidence for single-year Qs — §16)', () => {
    expect(resolveQuestionYears('2027년 사업운은 어때?', CUR)).toEqual([2027]);
  });
  it('non-timing question → [] (no years to ground)', () => {
    expect(resolveQuestionYears('내 성격은 어때?', CUR)).toEqual([]);
  });

  it('15/16) respects the 1970 / 2050 product boundaries', () => {
    expect(resolveQuestionYears(`${SUPPORTED_YEAR_MIN}년 운세`, CUR)).toEqual([SUPPORTED_YEAR_MIN]);
    expect(resolveQuestionYears(`${SUPPORTED_YEAR_MAX}년 운세`, CUR)).toEqual([SUPPORTED_YEAR_MAX]);
    expect(resolveQuestionYears(`${SUPPORTED_YEAR_MAX + 3}년 운세`, CUR)).toEqual([]); // out of range dropped
  });
  it('17) a range crossing 2050 keeps only the supported portion (fail-closed)', () => {
    // ref 2045, "앞으로 10년" = 2045..2054 → clamp to ≤2050 → 2045..2050 (6 years); 2051-2054 dropped.
    expect(resolveQuestionYears('앞으로 10년 사업운', 2045)).toEqual([2045, 2046, 2047, 2048, 2049, 2050]);
  });
  it('18) malformed range (no end year) degrades to the single year it names', () => {
    expect(resolveQuestionYears('2030년부터 사업운', CUR)).toEqual([2030]);
  });
  it('caps very long ranges at MAX_TARGET_YEARS to bound cost', () => {
    const years = resolveQuestionYears('앞으로 30년 흐름', CUR);
    expect(years.length).toBe(MAX_TARGET_YEARS);
    expect(years[0]).toBe(2026);
  });
  it('null reference year: relative/duration unresolved, explicit still works', () => {
    expect(resolveQuestionYears('앞으로 10년', null)).toEqual([]);
    expect(resolveQuestionYears('2030년', null)).toEqual([2030]);
  });
});

describe('epochForSajuYear', () => {
  it('maps a year to a mid-year (July) instant inside that Gregorian year', () => {
    const d = new Date(epochForSajuYear(2030) * 1000);
    expect(d.getUTCFullYear()).toBe(2030);
    expect(d.getUTCMonth()).toBe(6);
  });
});
