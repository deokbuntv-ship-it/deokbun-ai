import type {
  EarthlyBranch,
  ExactLocalCivilTime,
  HeavenlyStem,
} from '../contracts';

type ExpectedPillar = {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
};

export type FourPillarsGoldenFixture = {
  id: string;
  gregorianDate: { year: number; month: number; day: number };
  time:
    | { accuracy: 'EXACT'; localTime: ExactLocalCivilTime }
    | { accuracy: 'APPROXIMATE'; period: 'MORNING' }
    | { accuracy: 'UNKNOWN' };
  expectedStatus: 'COMPLETE' | 'PARTIAL';
  expected: {
    year: ExpectedPillar;
    month: ExpectedPillar;
    day: ExpectedPillar;
    hour?: ExpectedPillar;
  };
  provenance: 'KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES';
};

const ANCHOR_EXPECTED = {
  year: { stem: 'JI', branch: 'MAO' },
  month: { stem: 'DING', branch: 'CHOU' },
  day: { stem: 'JIA', branch: 'ZI' },
} as const;

export const FOUR_PILLARS_GOLDEN_FIXTURES: readonly FourPillarsGoldenFixture[] = [
  { id: 'EXACT_STANDARD', gregorianDate: { year: 2000, month: 1, day: 7 }, time: { accuracy: 'EXACT', localTime: { hour: 1, minute: 30, second: 0 } }, expectedStatus: 'COMPLETE', expected: { ...ANCHOR_EXPECTED, hour: { stem: 'YI', branch: 'CHOU' } }, provenance: 'KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES' },
  { id: 'EXACT_23_CURRENT_CIVIL_DATE', gregorianDate: { year: 2000, month: 1, day: 7 }, time: { accuracy: 'EXACT', localTime: { hour: 23, minute: 30, second: 0 } }, expectedStatus: 'COMPLETE', expected: { ...ANCHOR_EXPECTED, hour: { stem: 'JIA', branch: 'ZI' } }, provenance: 'KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES' },
  { id: 'EXACT_00_INPUT_CIVIL_DATE', gregorianDate: { year: 2000, month: 1, day: 7 }, time: { accuracy: 'EXACT', localTime: { hour: 0, minute: 30, second: 0 } }, expectedStatus: 'COMPLETE', expected: { ...ANCHOR_EXPECTED, hour: { stem: 'JIA', branch: 'ZI' } }, provenance: 'KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES' },
  { id: 'KASI_LEAP_MONTH', gregorianDate: { year: 2023, month: 3, day: 22 }, time: { accuracy: 'EXACT', localTime: { hour: 12, minute: 30, second: 0 } }, expectedStatus: 'COMPLETE', expected: { year: { stem: 'GUI', branch: 'MAO' }, month: { stem: 'YI', branch: 'MAO' }, day: { stem: 'JI', branch: 'MAO' }, hour: { stem: 'GENG', branch: 'WU' } }, provenance: 'KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES' },
  { id: 'UNKNOWN_TIME', gregorianDate: { year: 2000, month: 1, day: 7 }, time: { accuracy: 'UNKNOWN' }, expectedStatus: 'PARTIAL', expected: ANCHOR_EXPECTED, provenance: 'KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES' },
  { id: 'APPROXIMATE_TIME', gregorianDate: { year: 2000, month: 1, day: 7 }, time: { accuracy: 'APPROXIMATE', period: 'MORNING' }, expectedStatus: 'PARTIAL', expected: ANCHOR_EXPECTED, provenance: 'KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES' },
];
