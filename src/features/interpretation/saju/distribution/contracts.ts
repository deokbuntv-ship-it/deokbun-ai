import type {
  FiveElement,
  SajuDerivedFacts,
  SajuDerivedFactsRuleVersions,
} from '../derived/contracts';

export const DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION =
  'deokbunai.saju-five-element-distribution.v1' as const;

export const SAJU_DIRECT_FIVE_ELEMENT_SLOTS = [
  'YEAR_STEM',
  'YEAR_BRANCH',
  'MONTH_STEM',
  'MONTH_BRANCH',
  'DAY_STEM',
  'DAY_BRANCH',
  'HOUR_STEM',
  'HOUR_BRANCH',
] as const;

export const SAJU_FIVE_ELEMENT_KEYS = [
  'WOOD',
  'FIRE',
  'EARTH',
  'METAL',
  'WATER',
] as const satisfies readonly FiveElement[];

export type SajuDirectFiveElementSlot =
  (typeof SAJU_DIRECT_FIVE_ELEMENT_SLOTS)[number];

export type SajuFiveElementCounts = Readonly<Record<FiveElement, number>>;

export type SajuDirectFiveElementObservation = {
  slot: SajuDirectFiveElementSlot;
  element: FiveElement;
};

export type SajuFiveElementDistributionSourceRuleVersions = {
  derivedFacts: SajuDerivedFactsRuleVersions['derivedFacts'];
  fiveElements: SajuDerivedFactsRuleVersions['fiveElements'];
};

export type SajuFiveElementDistributionRuleVersions = {
  distribution: typeof DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION;
  derivedFacts: SajuDerivedFactsRuleVersions['derivedFacts'];
  fiveElements: SajuDerivedFactsRuleVersions['fiveElements'];
};

export type SajuFiveElementDistribution = {
  ruleVersion: typeof DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION;
  sourceRuleVersions: SajuFiveElementDistributionSourceRuleVersions;
  direct: {
    slots: readonly SajuDirectFiveElementObservation[];
    counts: SajuFiveElementCounts;
    observedSlots: 6 | 8;
    expectedSlots: 8;
    completeness: 'COMPLETE' | 'PARTIAL';
    missingSlots: readonly SajuDirectFiveElementSlot[];
  };
};

export type SajuFiveElementDistributionInput = {
  derivedFacts: SajuDerivedFacts;
};

export type SajuFiveElementDistributionError = {
  code: 'INVALID_SOURCE_RULE_VERSION' | 'INVALID_FIVE_ELEMENT';
  field: string;
  receivedValue?: unknown;
};

export type SajuFiveElementDistributionResult =
  | { ok: true; value: SajuFiveElementDistribution }
  | { ok: false; error: SajuFiveElementDistributionError };

