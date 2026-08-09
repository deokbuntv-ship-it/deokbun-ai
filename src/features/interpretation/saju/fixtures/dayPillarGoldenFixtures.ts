import type { LocalDate } from '../../domain/time';
import type { EarthlyBranch, HeavenlyStem } from '../contracts';

export type DayPillarGoldenFixture = {
  gregorianCivilDate: LocalDate;
  expectedIndex: number;
  expectedStem: HeavenlyStem;
  expectedBranch: EarthlyBranch;
  provenance: {
    authority: 'KASI_LUN_ILJIN';
    source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' | 'KASI_OFFICIAL_OPEN_API_SAMPLE';
  };
};

export const DAY_PILLAR_GOLDEN_FIXTURES: readonly DayPillarGoldenFixture[] = [
  { gregorianCivilDate: { year: 1900, month: 1, day: 1 }, expectedIndex: 10, expectedStem: 'JIA', expectedBranch: 'XU', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
  { gregorianCivilDate: { year: 2000, month: 1, day: 7 }, expectedIndex: 0, expectedStem: 'JIA', expectedBranch: 'ZI', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
  { gregorianCivilDate: { year: 2015, month: 9, day: 22 }, expectedIndex: 37, expectedStem: 'XIN', expectedBranch: 'CHOU', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_OPEN_API_SAMPLE' } },
  { gregorianCivilDate: { year: 2024, month: 2, day: 28 }, expectedIndex: 58, expectedStem: 'REN', expectedBranch: 'XU', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
  { gregorianCivilDate: { year: 2024, month: 2, day: 29 }, expectedIndex: 59, expectedStem: 'GUI', expectedBranch: 'HAI', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
  { gregorianCivilDate: { year: 2024, month: 3, day: 1 }, expectedIndex: 0, expectedStem: 'JIA', expectedBranch: 'ZI', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
  { gregorianCivilDate: { year: 2026, month: 8, day: 18 }, expectedIndex: 0, expectedStem: 'JIA', expectedBranch: 'ZI', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
  { gregorianCivilDate: { year: 2050, month: 12, day: 30 }, expectedIndex: 20, expectedStem: 'JIA', expectedBranch: 'SHEN', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
  { gregorianCivilDate: { year: 2050, month: 12, day: 31 }, expectedIndex: 21, expectedStem: 'YI', expectedBranch: 'YOU', provenance: { authority: 'KASI_LUN_ILJIN', source: 'KASI_OFFICIAL_MONTHLY_CALENDAR' } },
];
