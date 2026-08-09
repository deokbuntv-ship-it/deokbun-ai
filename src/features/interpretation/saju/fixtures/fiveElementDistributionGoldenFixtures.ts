import type {
  SajuDirectFiveElementObservation,
  SajuFiveElementCounts,
} from '../distribution/contracts';

export type FiveElementDistributionGoldenFixture = {
  id: 'EXACT_STANDARD' | 'UNKNOWN_TIME';
  expected: {
    slots: readonly SajuDirectFiveElementObservation[];
    counts: SajuFiveElementCounts;
    observedSlots: 6 | 8;
    completeness: 'COMPLETE' | 'PARTIAL';
    missingSlots: readonly ('HOUR_STEM' | 'HOUR_BRANCH')[];
  };
};

const SIX_DIRECT_SLOTS = [
  { slot: 'YEAR_STEM', element: 'EARTH' },
  { slot: 'YEAR_BRANCH', element: 'WOOD' },
  { slot: 'MONTH_STEM', element: 'FIRE' },
  { slot: 'MONTH_BRANCH', element: 'EARTH' },
  { slot: 'DAY_STEM', element: 'WOOD' },
  { slot: 'DAY_BRANCH', element: 'WATER' },
] as const satisfies readonly SajuDirectFiveElementObservation[];

export const FIVE_ELEMENT_DISTRIBUTION_GOLDEN_FIXTURES: readonly FiveElementDistributionGoldenFixture[] = [
  {
    id: 'EXACT_STANDARD',
    expected: {
      slots: [
        ...SIX_DIRECT_SLOTS,
        { slot: 'HOUR_STEM', element: 'WOOD' },
        { slot: 'HOUR_BRANCH', element: 'EARTH' },
      ],
      counts: { WOOD: 3, FIRE: 1, EARTH: 3, METAL: 0, WATER: 1 },
      observedSlots: 8,
      completeness: 'COMPLETE',
      missingSlots: [],
    },
  },
  {
    id: 'UNKNOWN_TIME',
    expected: {
      slots: SIX_DIRECT_SLOTS,
      counts: { WOOD: 2, FIRE: 1, EARTH: 2, METAL: 0, WATER: 1 },
      observedSlots: 6,
      completeness: 'PARTIAL',
      missingSlots: ['HOUR_STEM', 'HOUR_BRANCH'],
    },
  },
] as const;

