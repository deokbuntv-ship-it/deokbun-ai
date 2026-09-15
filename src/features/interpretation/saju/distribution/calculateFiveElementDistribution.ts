import type { FiveElement, SajuDerivedFacts } from '../derived/contracts';
import {
  DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION,
  DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION,
} from '../derived/rules';
import {
  DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION,
  SAJU_FIVE_ELEMENT_KEYS,
  type SajuDirectFiveElementObservation,
  type SajuDirectFiveElementSlot,
  type SajuFiveElementCounts,
  type SajuFiveElementDistribution,
  type SajuFiveElementDistributionError,
  type SajuFiveElementDistributionInput,
  type SajuFiveElementDistributionResult,
  type SajuFiveElementDistributionRuleVersions,
} from './contracts';

const HOUR_SLOTS = ['HOUR_STEM', 'HOUR_BRANCH'] as const satisfies readonly SajuDirectFiveElementSlot[];

export const DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_V1_RULE_VERSIONS = {
  distribution: DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION,
  derivedFacts: DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION,
  fiveElements: DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION,
} as const satisfies SajuFiveElementDistributionRuleVersions;

function failure(
  error: SajuFiveElementDistributionError,
): SajuFiveElementDistributionResult {
  return { ok: false, error };
}

function isFiveElement(value: unknown): value is FiveElement {
  return SAJU_FIVE_ELEMENT_KEYS.some((element) => element === value);
}

function validateSourceRuleVersions(
  derivedFacts: SajuDerivedFacts,
): SajuFiveElementDistributionResult | null {
  if (
    derivedFacts.ruleVersions.derivedFacts !==
    DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION
  ) {
    return failure({
      code: 'INVALID_SOURCE_RULE_VERSION',
      field: 'derivedFacts.ruleVersions.derivedFacts',
      receivedValue: derivedFacts.ruleVersions.derivedFacts,
    });
  }
  if (
    derivedFacts.ruleVersions.fiveElements !==
    DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION
  ) {
    return failure({
      code: 'INVALID_SOURCE_RULE_VERSION',
      field: 'derivedFacts.ruleVersions.fiveElements',
      receivedValue: derivedFacts.ruleVersions.fiveElements,
    });
  }
  return null;
}

function createZeroCounts(): Record<FiveElement, number> {
  return { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 };
}

function appendSlot(
  slots: SajuDirectFiveElementObservation[],
  counts: Record<FiveElement, number>,
  slot: SajuDirectFiveElementSlot,
  element: unknown,
): SajuFiveElementDistributionError | null {
  if (!isFiveElement(element)) {
    return {
      code: 'INVALID_FIVE_ELEMENT',
      field: `derivedFacts.direct.${slot}`,
      receivedValue: element,
    };
  }
  slots.push({ slot, element });
  counts[element] += 1;
  return null;
}

export function calculateFiveElementDistribution(
  input: SajuFiveElementDistributionInput,
): SajuFiveElementDistributionResult {
  const versionError = validateSourceRuleVersions(input.derivedFacts);
  if (versionError) return versionError;

  const pillars = input.derivedFacts.pillars;
  const slots: SajuDirectFiveElementObservation[] = [];
  const counts = createZeroCounts();
  const directSources: readonly (readonly [
    SajuDirectFiveElementSlot,
    FiveElement,
  ])[] = [
    ['YEAR_STEM', pillars.year.stem.element],
    ['YEAR_BRANCH', pillars.year.branch.element],
    ['MONTH_STEM', pillars.month.stem.element],
    ['MONTH_BRANCH', pillars.month.branch.element],
    ['DAY_STEM', pillars.day.stem.element],
    ['DAY_BRANCH', pillars.day.branch.element],
    ...(pillars.hour
      ? ([
          ['HOUR_STEM', pillars.hour.stem.element],
          ['HOUR_BRANCH', pillars.hour.branch.element],
        ] as const)
      : []),
  ];

  for (const [slot, element] of directSources) {
    const error = appendSlot(slots, counts, slot, element);
    if (error) return failure(error);
  }

  const hasHour = pillars.hour !== undefined;
  const distribution: SajuFiveElementDistribution = {
    ruleVersion: DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION,
    sourceRuleVersions: {
      derivedFacts: input.derivedFacts.ruleVersions.derivedFacts,
      fiveElements: input.derivedFacts.ruleVersions.fiveElements,
    },
    direct: {
      slots,
      counts: counts satisfies SajuFiveElementCounts,
      observedSlots: hasHour ? 8 : 6,
      expectedSlots: 8,
      completeness: hasHour ? 'COMPLETE' : 'PARTIAL',
      missingSlots: hasHour ? [] : HOUR_SLOTS,
    },
  };
  return { ok: true, value: distribution };
}
