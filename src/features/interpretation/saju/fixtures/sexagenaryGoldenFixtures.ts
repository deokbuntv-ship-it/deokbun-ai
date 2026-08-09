import type { EarthlyBranch, HeavenlyStem } from '../contracts';

export type SexagenaryYearGoldenFixture = {
  lunarYear: number;
  expectedStem: HeavenlyStem;
  expectedBranch: EarthlyBranch;
  provenance:
    | 'PRODUCT_ANCHOR'
    | 'KASI_OFFICIAL_OPEN_API_EXAMPLE'
    | 'KASI_OFFICIAL_CALENDAR'
    | 'LEGACY_COMPARISON_ONLY';
};

export const SEXAGENARY_YEAR_GOLDEN_FIXTURES: readonly SexagenaryYearGoldenFixture[] = [
  { lunarYear: 1900, expectedStem: 'GENG', expectedBranch: 'ZI', provenance: 'LEGACY_COMPARISON_ONLY' },
  { lunarYear: 1984, expectedStem: 'JIA', expectedBranch: 'ZI', provenance: 'PRODUCT_ANCHOR' },
  { lunarYear: 2015, expectedStem: 'YI', expectedBranch: 'WEI', provenance: 'KASI_OFFICIAL_OPEN_API_EXAMPLE' },
  { lunarYear: 2026, expectedStem: 'BING', expectedBranch: 'WU', provenance: 'KASI_OFFICIAL_CALENDAR' },
];
