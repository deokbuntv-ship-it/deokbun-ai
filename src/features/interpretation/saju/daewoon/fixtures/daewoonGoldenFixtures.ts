import type { LocalDate } from '../../../domain/time';
import type { DaewoonDirection } from '../contracts';
import type { SolarTermId } from '../../../solarTerm/contracts';

export type DaewoonGoldenFixture = {
  id: string;
  birth: {
    date: LocalDate;
    time: { hour: number; minute: number; second: number };
    lunarDate: LocalDate & { lunarMonthKind: 'REGULAR' };
    gender: 'MALE' | 'FEMALE';
  };
  yearPillarIndex: number;
  monthPillarIndex: number;
  expected: {
    direction: DaewoonDirection;
    selectedTermId: SolarTermId;
    symbolicOffset: { years: number; months: number; days: number; hours: number };
    roundedStartAgeYears: number;
    symbolicStart: {
      date: LocalDate;
      time: { hour: number; minute: number; second: number };
    };
    firstCyclePillarIndex: number;
  };
  reference: {
    implementation: 'lunar-javascript@1.7.7 EightChar.getYun(gender,2)';
    note: string;
  };
};

export const DAEWOON_GOLDEN_FIXTURES = [
  {
    id: 'MATURE_REFERENCE_2024_YANG_MALE_FORWARD',
    birth: {
      date: { year: 2024, month: 4, day: 15 },
      time: { hour: 9, minute: 44, second: 0 },
      lunarDate: { year: 2024, month: 3, day: 7, lunarMonthKind: 'REGULAR' },
      gender: 'MALE',
    },
    yearPillarIndex: 40,
    monthPillarIndex: 4,
    expected: {
      direction: 'FORWARD',
      selectedTermId: 'START_OF_SUMMER',
      symbolicOffset: { years: 6, months: 7, days: 27, hours: 4 },
      roundedStartAgeYears: 7,
      symbolicStart: {
        date: { year: 2030, month: 12, day: 12 },
        time: { hour: 13, minute: 44, second: 0 },
      },
      firstCyclePillarIndex: 5,
    },
    reference: {
      implementation: 'lunar-javascript@1.7.7 EightChar.getYun(gender,2)',
      note: 'Provider fixed UTC+8 birth 08:44 maps to normalized Korea birth 09:44; NAOJ independently confirms the 2024 Lixia minute.',
    },
  },
  {
    id: 'MATURE_REFERENCE_2018_YANG_FEMALE_REVERSE',
    birth: {
      date: { year: 2018, month: 6, day: 11 },
      time: { hour: 9, minute: 30, second: 0 },
      lunarDate: { year: 2018, month: 4, day: 28, lunarMonthKind: 'REGULAR' },
      gender: 'FEMALE',
    },
    yearPillarIndex: 34,
    monthPillarIndex: 54,
    expected: {
      direction: 'REVERSE',
      selectedTermId: 'GRAIN_IN_EAR',
      symbolicOffset: { years: 1, months: 9, days: 5, hours: 2 },
      roundedStartAgeYears: 2,
      symbolicStart: {
        date: { year: 2020, month: 3, day: 16 },
        time: { hour: 11, minute: 30, second: 0 },
      },
      firstCyclePillarIndex: 53,
    },
    reference: {
      implementation: 'lunar-javascript@1.7.7 EightChar.getYun(gender,2)',
      note: 'Provider fixed UTC+8 birth 08:30 maps to normalized Korea birth 09:30.',
    },
  },
] as const satisfies readonly DaewoonGoldenFixture[];
