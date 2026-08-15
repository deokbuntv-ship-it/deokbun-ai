import type { LocalDate, LocalClockTime } from '../../domain/time';
import type {
  SolarTermBoundaryDirection,
  SolarTermCivilSecond,
} from '../lunarJsSolarTermAdapter';
import type { SolarTermId } from '../contracts';

/** Provider characterization only; independent minute checks live separately. */
export type LunarJsSolarTermGoldenFixture = {
  id: `GOLDEN_${number}`;
  birthCivil: {
    date: LocalDate;
    time: Required<LocalClockTime>;
    offsetSeconds: 32_400;
  };
  direction: SolarTermBoundaryDirection;
  expected: {
    termId: SolarTermId;
    sourceCivil: SolarTermCivilSecond;
    /** Legacy provider-characterization value; Daewoon V1 validates rounding separately. */
    nearestStartAge: number;
  };
};

export const LUNAR_JS_SOLAR_TERM_GOLDEN_FIXTURES = [
  {
    id: 'GOLDEN_1',
    birthCivil: { date: { year: 1991, month: 7, day: 16 }, time: { hour: 0, minute: 30, second: 0 }, offsetSeconds: 32_400 },
    direction: 'REVERSE',
    expected: {
      termId: 'MINOR_HEAT',
      sourceCivil: { date: { year: 1991, month: 7, day: 7 }, hour: 22, minute: 52, second: 59 },
      nearestStartAge: 3,
    },
  },
  {
    id: 'GOLDEN_2',
    birthCivil: { date: { year: 1994, month: 6, day: 26 }, time: { hour: 14, minute: 50, second: 0 }, offsetSeconds: 32_400 },
    direction: 'REVERSE',
    expected: {
      termId: 'GRAIN_IN_EAR',
      sourceCivil: { date: { year: 1994, month: 6, day: 6 }, hour: 6, minute: 4, second: 52 },
      nearestStartAge: 7,
    },
  },
  {
    id: 'GOLDEN_3',
    birthCivil: { date: { year: 1991, month: 9, day: 28 }, time: { hour: 9, minute: 15, second: 0 }, offsetSeconds: 32_400 },
    direction: 'REVERSE',
    expected: {
      termId: 'WHITE_DEW',
      sourceCivil: { date: { year: 1991, month: 9, day: 8 }, hour: 11, minute: 27, second: 21 },
      nearestStartAge: 7,
    },
  },
  {
    id: 'GOLDEN_4',
    birthCivil: { date: { year: 2024, month: 4, day: 15 }, time: { hour: 9, minute: 44, second: 0 }, offsetSeconds: 32_400 },
    direction: 'FORWARD',
    expected: {
      termId: 'START_OF_SUMMER',
      sourceCivil: { date: { year: 2024, month: 5, day: 5 }, hour: 8, minute: 10, second: 5 },
      nearestStartAge: 7,
    },
  },
  {
    id: 'GOLDEN_5',
    birthCivil: { date: { year: 1963, month: 1, day: 15 }, time: { hour: 10, minute: 30, second: 0 }, offsetSeconds: 32_400 },
    direction: 'REVERSE',
    expected: {
      termId: 'MINOR_COLD',
      sourceCivil: { date: { year: 1963, month: 1, day: 6 }, hour: 9, minute: 26, second: 26 },
      nearestStartAge: 3,
    },
  },
  {
    id: 'GOLDEN_6',
    birthCivil: { date: { year: 1993, month: 12, day: 23 }, time: { hour: 11, minute: 45, second: 0 }, offsetSeconds: 32_400 },
    direction: 'FORWARD',
    expected: {
      termId: 'MINOR_COLD',
      sourceCivil: { date: { year: 1994, month: 1, day: 5 }, hour: 21, minute: 48, second: 7 },
      nearestStartAge: 4,
    },
  },
  {
    id: 'GOLDEN_7',
    birthCivil: { date: { year: 2024, month: 1, day: 3 }, time: { hour: 10, minute: 22, second: 0 }, offsetSeconds: 32_400 },
    direction: 'REVERSE',
    expected: {
      termId: 'MAJOR_SNOW',
      sourceCivil: { date: { year: 2023, month: 12, day: 7 }, hour: 17, minute: 32, second: 55 },
      nearestStartAge: 9,
    },
  },
  {
    id: 'GOLDEN_8',
    birthCivil: { date: { year: 2024, month: 4, day: 25 }, time: { hour: 11, minute: 34, second: 0 }, offsetSeconds: 32_400 },
    direction: 'FORWARD',
    expected: {
      termId: 'START_OF_SUMMER',
      sourceCivil: { date: { year: 2024, month: 5, day: 5 }, hour: 8, minute: 10, second: 5 },
      nearestStartAge: 3,
    },
  },
  {
    id: 'GOLDEN_9',
    birthCivil: { date: { year: 2024, month: 4, day: 26 }, time: { hour: 9, minute: 10, second: 0 }, offsetSeconds: 32_400 },
    direction: 'FORWARD',
    expected: {
      termId: 'START_OF_SUMMER',
      sourceCivil: { date: { year: 2024, month: 5, day: 5 }, hour: 8, minute: 10, second: 5 },
      nearestStartAge: 3,
    },
  },
] as const satisfies readonly LunarJsSolarTermGoldenFixture[];
