import type { LocalDate } from '../../domain/time';
import type { LunarMonthKind } from '../contracts';

export type KasiCalendarGoldenFixture = {
  id: string;
  kind: string;
  gregorianDate: LocalDate;
  lunarDate: LocalDate & { lunarMonthKind: LunarMonthKind };
};

// Authoritative fixtures selected from the KASI acquisition, not legacy data.
export const KASI_CALENDAR_GOLDEN_FIXTURES: readonly KasiCalendarGoldenFixture[] = [
  { id: 'gregorian-january-to-previous-lunar-november', kind: 'JANUARY_PREVIOUS_LUNAR_NOVEMBER', gregorianDate: { year: 1901, month: 1, day: 1 }, lunarDate: { year: 1900, month: 11, day: 11, lunarMonthKind: 'REGULAR' } },
  { id: 'gregorian-january-to-previous-lunar-december', kind: 'JANUARY_PREVIOUS_LUNAR_DECEMBER', gregorianDate: { year: 1900, month: 1, day: 1 }, lunarDate: { year: 1899, month: 12, day: 1, lunarMonthKind: 'REGULAR' } },
  { id: 'lunar-new-year-before', kind: 'LUNAR_NEW_YEAR_BEFORE', gregorianDate: { year: 2024, month: 2, day: 9 }, lunarDate: { year: 2023, month: 12, day: 30, lunarMonthKind: 'REGULAR' } },
  { id: 'lunar-new-year-day', kind: 'LUNAR_NEW_YEAR_DAY', gregorianDate: { year: 2024, month: 2, day: 10 }, lunarDate: { year: 2024, month: 1, day: 1, lunarMonthKind: 'REGULAR' } },
  { id: 'lunar-new-year-after', kind: 'LUNAR_NEW_YEAR_AFTER', gregorianDate: { year: 2024, month: 2, day: 11 }, lunarDate: { year: 2024, month: 1, day: 2, lunarMonthKind: 'REGULAR' } },
  { id: 'lunar-year-boundary', kind: 'LUNAR_YEAR_BOUNDARY', gregorianDate: { year: 2024, month: 2, day: 10 }, lunarDate: { year: 2024, month: 1, day: 1, lunarMonthKind: 'REGULAR' } },
  { id: 'regular-month', kind: 'REGULAR_MONTH', gregorianDate: { year: 2023, month: 3, day: 1 }, lunarDate: { year: 2023, month: 2, day: 10, lunarMonthKind: 'REGULAR' } },
  { id: 'leap-month-first-day', kind: 'LEAP_MONTH_FIRST_DAY', gregorianDate: { year: 2023, month: 3, day: 22 }, lunarDate: { year: 2023, month: 2, day: 1, lunarMonthKind: 'LEAP' } },
  { id: 'leap-month-last-day', kind: 'LEAP_MONTH_LAST_DAY', gregorianDate: { year: 2023, month: 4, day: 19 }, lunarDate: { year: 2023, month: 2, day: 29, lunarMonthKind: 'LEAP' } },
  { id: '29-day-month-last-day', kind: 'MONTH_29_LAST_DAY', gregorianDate: { year: 2020, month: 3, day: 23 }, lunarDate: { year: 2020, month: 2, day: 29, lunarMonthKind: 'REGULAR' } },
  { id: '30-day-month-last-day', kind: 'MONTH_30_LAST_DAY', gregorianDate: { year: 2020, month: 2, day: 23 }, lunarDate: { year: 2020, month: 1, day: 30, lunarMonthKind: 'REGULAR' } },
  { id: 'gregorian-leap-day', kind: 'GREGORIAN_LEAP_DAY', gregorianDate: { year: 2024, month: 2, day: 29 }, lunarDate: { year: 2024, month: 1, day: 20, lunarMonthKind: 'REGULAR' } },
  { id: 'v1-first-supported-day', kind: 'SUPPORTED_RANGE_START', gregorianDate: { year: 1900, month: 1, day: 1 }, lunarDate: { year: 1899, month: 12, day: 1, lunarMonthKind: 'REGULAR' } },
  { id: 'v1-last-supported-day', kind: 'SUPPORTED_RANGE_END', gregorianDate: { year: 2050, month: 12, day: 31 }, lunarDate: { year: 2050, month: 11, day: 18, lunarMonthKind: 'REGULAR' } },
  { id: 'same-real-date-bidirectional', kind: 'BIDIRECTIONAL_SAME_REAL_DATE', gregorianDate: { year: 2023, month: 3, day: 22 }, lunarDate: { year: 2023, month: 2, day: 1, lunarMonthKind: 'LEAP' } },
];
