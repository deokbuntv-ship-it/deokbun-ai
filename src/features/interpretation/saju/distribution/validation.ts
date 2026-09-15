import type { SajuFourPillars, SexagenaryPillar } from '../contracts';
import { pillarToSexagenaryIndex } from '../sexagenary';
import { calculateSajuDerivedFacts } from '../derived/calculateDerivedFacts';
import type { SajuDerivedFacts } from '../derived/contracts';
import { FOUR_PILLARS_GOLDEN_FIXTURES } from '../fixtures/fourPillarsGoldenFixtures';
import { FIVE_ELEMENT_DISTRIBUTION_GOLDEN_FIXTURES } from '../fixtures/fiveElementDistributionGoldenFixtures';
import { calculateFiveElementDistribution } from './calculateFiveElementDistribution';
import {
  SAJU_DIRECT_FIVE_ELEMENT_SLOTS,
  SAJU_FIVE_ELEMENT_KEYS,
  type SajuDirectFiveElementObservation,
  type SajuFiveElementDistribution,
} from './contracts';

export type SajuFiveElementDistributionValidationReport = {
  ok: boolean;
  failures: string[];
  goldenFixtures: number;
  goldenMatches: number;
  completeEightSlotCases: number;
  partialSixSlotCases: number;
  fiveElementKeyCoverageCases: number;
  countSumInvariantCases: number;
  slotUniquenessCases: number;
  unexpectedSlotViolations: number;
  missingSlotCases: number;
  derivedFactsCrossValidationCases: number;
  derivedFactsCrossValidationMismatches: number;
  structuredFailureCases: number;
  hiddenStemContributionViolations: number;
  forbiddenMetricViolations: number;
};

function createPillar(stem: SexagenaryPillar['stem'], branch: SexagenaryPillar['branch']): SexagenaryPillar {
  const index = pillarToSexagenaryIndex(stem, branch);
  if (!index.ok) throw new Error(`Invalid golden pillar ${stem}-${branch}.`);
  return { index: index.value, stem, branch };
}

function createFourPillars(fixtureId: 'EXACT_STANDARD' | 'UNKNOWN_TIME'): SajuFourPillars {
  const fixture = FOUR_PILLARS_GOLDEN_FIXTURES.find(
    (candidate) => candidate.id === fixtureId,
  );
  if (!fixture) throw new Error(`Missing Four Pillars fixture ${fixtureId}.`);
  return {
    year: createPillar(fixture.expected.year.stem, fixture.expected.year.branch),
    month: createPillar(fixture.expected.month.stem, fixture.expected.month.branch),
    day: createPillar(fixture.expected.day.stem, fixture.expected.day.branch),
    hour: fixture.expected.hour
      ? {
          status: 'AVAILABLE',
          pillar: createPillar(
            fixture.expected.hour.stem,
            fixture.expected.hour.branch,
          ),
        }
      : { status: 'UNAVAILABLE', reason: 'BIRTH_TIME_UNKNOWN' },
  };
}

function sourceElementBySlot(
  derivedFacts: SajuDerivedFacts,
  slot: SajuDirectFiveElementObservation['slot'],
): SajuDirectFiveElementObservation['element'] | undefined {
  switch (slot) {
    case 'YEAR_STEM':
      return derivedFacts.pillars.year.stem.element;
    case 'YEAR_BRANCH':
      return derivedFacts.pillars.year.branch.element;
    case 'MONTH_STEM':
      return derivedFacts.pillars.month.stem.element;
    case 'MONTH_BRANCH':
      return derivedFacts.pillars.month.branch.element;
    case 'DAY_STEM':
      return derivedFacts.pillars.day.stem.element;
    case 'DAY_BRANCH':
      return derivedFacts.pillars.day.branch.element;
    case 'HOUR_STEM':
      return derivedFacts.pillars.hour?.stem.element;
    case 'HOUR_BRANCH':
      return derivedFacts.pillars.hour?.branch.element;
  }
}

function hasForbiddenOutputField(distribution: SajuFiveElementDistribution): boolean {
  const forbidden = new Set([
    'hiddenStems',
    'percentage',
    'percentages',
    'strength',
    'score',
    'weight',
    'weights',
  ]);
  const visit = (value: unknown): boolean => {
    if (!value || typeof value !== 'object') return false;
    return Object.entries(value).some(
      ([key, nested]) => forbidden.has(key) || visit(nested),
    );
  };
  return visit(distribution);
}

export function validateFiveElementDistribution(): SajuFiveElementDistributionValidationReport {
  const failures: string[] = [];
  let goldenMatches = 0;
  let completeEightSlotCases = 0;
  let partialSixSlotCases = 0;
  let fiveElementKeyCoverageCases = 0;
  let countSumInvariantCases = 0;
  let slotUniquenessCases = 0;
  let unexpectedSlotViolations = 0;
  let missingSlotCases = 0;
  let derivedFactsCrossValidationCases = 0;
  let derivedFactsCrossValidationMismatches = 0;
  let hiddenStemContributionViolations = 0;
  let forbiddenMetricViolations = 0;

  for (const fixture of FIVE_ELEMENT_DISTRIBUTION_GOLDEN_FIXTURES) {
    const derived = calculateSajuDerivedFacts({
      fourPillars: createFourPillars(fixture.id),
    });
    if (!derived.ok) {
      failures.push(`${fixture.id} Derived Facts failed: ${derived.error.code}.`);
      continue;
    }
    const result = calculateFiveElementDistribution({ derivedFacts: derived.value });
    if (!result.ok) {
      failures.push(`${fixture.id} distribution failed: ${result.error.code}.`);
      continue;
    }
    const distribution = result.value;
    const expected = fixture.expected;
    if (
      JSON.stringify(distribution.direct.slots) === JSON.stringify(expected.slots) &&
      JSON.stringify(distribution.direct.counts) === JSON.stringify(expected.counts) &&
      distribution.direct.observedSlots === expected.observedSlots &&
      distribution.direct.completeness === expected.completeness &&
      JSON.stringify(distribution.direct.missingSlots) ===
        JSON.stringify(expected.missingSlots)
    ) {
      goldenMatches += 1;
    } else {
      failures.push(`${fixture.id} golden distribution mismatch.`);
    }

    if (
      distribution.direct.completeness === 'COMPLETE' &&
      distribution.direct.observedSlots === 8 &&
      distribution.direct.slots.length === 8 &&
      distribution.direct.missingSlots.length === 0
    ) {
      completeEightSlotCases += 1;
    }
    if (
      distribution.direct.completeness === 'PARTIAL' &&
      distribution.direct.observedSlots === 6 &&
      distribution.direct.slots.length === 6
    ) {
      partialSixSlotCases += 1;
    }

    const countKeys = Object.keys(distribution.direct.counts);
    if (
      countKeys.length === SAJU_FIVE_ELEMENT_KEYS.length &&
      SAJU_FIVE_ELEMENT_KEYS.every((element) => countKeys.includes(element))
    ) fiveElementKeyCoverageCases += 1;
    else failures.push(`${fixture.id} did not preserve all FiveElement count keys.`);

    const countSum = SAJU_FIVE_ELEMENT_KEYS.reduce(
      (sum, element) => sum + distribution.direct.counts[element],
      0,
    );
    if (countSum === distribution.direct.observedSlots) {
      countSumInvariantCases += 1;
    } else failures.push(`${fixture.id} count sum did not equal observed slots.`);

    const slotNames = distribution.direct.slots.map((slot) => slot.slot);
    if (new Set(slotNames).size === slotNames.length) slotUniquenessCases += 1;
    else failures.push(`${fixture.id} emitted duplicate slots.`);
    const unexpected = slotNames.filter(
      (slot) => !SAJU_DIRECT_FIVE_ELEMENT_SLOTS.includes(slot),
    ).length;
    unexpectedSlotViolations += unexpected;

    const expectedMissing =
      distribution.direct.completeness === 'COMPLETE'
        ? []
        : ['HOUR_STEM', 'HOUR_BRANCH'];
    if (
      JSON.stringify(distribution.direct.missingSlots) ===
      JSON.stringify(expectedMissing)
    ) missingSlotCases += 1;
    else failures.push(`${fixture.id} missingSlots were not canonical.`);

    for (const slot of distribution.direct.slots) {
      derivedFactsCrossValidationCases += 1;
      if (sourceElementBySlot(derived.value, slot.slot) !== slot.element) {
        derivedFactsCrossValidationMismatches += 1;
      }
    }

    const serialized = JSON.stringify(distribution);
    if (serialized.includes('hiddenStems')) hiddenStemContributionViolations += 1;
    if (hasForbiddenOutputField(distribution)) forbiddenMetricViolations += 1;
  }

  let structuredFailureCases = 0;
  const validDerived = calculateSajuDerivedFacts({
    fourPillars: createFourPillars('EXACT_STANDARD'),
  });
  if (validDerived.ok) {
    const invalidElement = {
      ...validDerived.value,
      pillars: {
        ...validDerived.value.pillars,
        year: {
          ...validDerived.value.pillars.year,
          stem: {
            ...validDerived.value.pillars.year.stem,
            element: 'INVALID',
          },
        },
      },
    } as unknown as SajuDerivedFacts;
    const invalidElementResult = calculateFiveElementDistribution({
      derivedFacts: invalidElement,
    });
    if (
      !invalidElementResult.ok &&
      invalidElementResult.error.code === 'INVALID_FIVE_ELEMENT'
    ) structuredFailureCases += 1;

    const invalidVersion = {
      ...validDerived.value,
      ruleVersions: {
        ...validDerived.value.ruleVersions,
        fiveElements: 'invalid-version',
      },
    } as unknown as SajuDerivedFacts;
    const invalidVersionResult = calculateFiveElementDistribution({
      derivedFacts: invalidVersion,
    });
    if (
      !invalidVersionResult.ok &&
      invalidVersionResult.error.code === 'INVALID_SOURCE_RULE_VERSION'
    ) structuredFailureCases += 1;
  }

  const expectedFixtureCount = FIVE_ELEMENT_DISTRIBUTION_GOLDEN_FIXTURES.length;
  const expectations: readonly [boolean, string][] = [
    [goldenMatches === expectedFixtureCount, 'Golden fixture coverage was incomplete.'],
    [completeEightSlotCases === 1, 'COMPLETE did not produce exactly one 8-slot case.'],
    [partialSixSlotCases === 1, 'PARTIAL did not produce exactly one 6-slot case.'],
    [fiveElementKeyCoverageCases === expectedFixtureCount, 'FiveElement key coverage failed.'],
    [countSumInvariantCases === expectedFixtureCount, 'Count sum invariants failed.'],
    [slotUniquenessCases === expectedFixtureCount, 'Slot uniqueness failed.'],
    [unexpectedSlotViolations === 0, 'Unexpected slots were emitted.'],
    [missingSlotCases === expectedFixtureCount, 'missingSlots invariants failed.'],
    [derivedFactsCrossValidationMismatches === 0, 'Derived Facts cross-validation mismatched.'],
    [structuredFailureCases === 2, 'Structured failure validation was incomplete.'],
    [hiddenStemContributionViolations === 0, 'Hidden Stems contributed to direct distribution.'],
    [forbiddenMetricViolations === 0, 'Forbidden distribution metrics were emitted.'],
  ];
  for (const [condition, message] of expectations) {
    if (!condition) failures.push(message);
  }

  return {
    ok: failures.length === 0,
    failures,
    goldenFixtures: expectedFixtureCount,
    goldenMatches,
    completeEightSlotCases,
    partialSixSlotCases,
    fiveElementKeyCoverageCases,
    countSumInvariantCases,
    slotUniquenessCases,
    unexpectedSlotViolations,
    missingSlotCases,
    derivedFactsCrossValidationCases,
    derivedFactsCrossValidationMismatches,
    structuredFailureCases,
    hiddenStemContributionViolations,
    forbiddenMetricViolations,
  };
}

