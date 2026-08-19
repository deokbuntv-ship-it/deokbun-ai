import { isCompleteBirthInfo } from '@/features/consultation/birthProfileValidation';
import type { BirthInfoDraft } from '@/features/consultation/types/consultation';

const base = (over: Partial<BirthInfoDraft> = {}): BirthInfoDraft => ({
  displayName: '나',
  gender: 'female',
  calendarType: 'solar',
  lunarMonthType: null,
  birthYear: '1994',
  birthMonth: '5',
  birthDay: '20',
  birthTimeAccuracy: 'exact',
  birthHour: '9',
  birthMinute: '30',
  approximateTimePeriod: null,
  birthPlace: '서울',
  ...over,
});

describe('isCompleteBirthInfo', () => {
  it('a fully-filled exact-time profile is complete', () => {
    expect(isCompleteBirthInfo(base())).toBe(true);
  });

  it('"모름" birth time is a COMPLETE answer (never invent a time)', () => {
    expect(isCompleteBirthInfo(base({ birthTimeAccuracy: 'unknown', birthHour: '', birthMinute: '' }))).toBe(true);
  });

  it('approximate time needs a chosen period', () => {
    expect(isCompleteBirthInfo(base({ birthTimeAccuracy: 'approximate', approximateTimePeriod: null, birthHour: '', birthMinute: '' }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthTimeAccuracy: 'approximate', approximateTimePeriod: 'morning', birthHour: '', birthMinute: '' }))).toBe(true);
  });

  it('lunar requires a lunar-month type', () => {
    expect(isCompleteBirthInfo(base({ calendarType: 'lunar', lunarMonthType: null }))).toBe(false);
    expect(isCompleteBirthInfo(base({ calendarType: 'lunar', lunarMonthType: 'regular' }))).toBe(true);
  });

  it('rejects missing/invalid required fields', () => {
    expect(isCompleteBirthInfo(null)).toBe(false);
    expect(isCompleteBirthInfo(base({ gender: null }))).toBe(false);
    expect(isCompleteBirthInfo(base({ calendarType: null }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthYear: '94' }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthMonth: '13' }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthDay: '0' }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthTimeAccuracy: null }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthTimeAccuracy: 'exact', birthHour: '', birthMinute: '' }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthTimeAccuracy: 'exact', birthHour: '25', birthMinute: '30' }))).toBe(false);
    expect(isCompleteBirthInfo(base({ birthPlace: '   ' }))).toBe(false);
  });
});
