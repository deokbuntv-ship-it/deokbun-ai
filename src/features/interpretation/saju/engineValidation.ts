import { resolveWithKasiCalendar } from '../calendar/kasiCalendarResolver';
import type { NormalizedBirthInput, TimezoneResolution } from '../contracts/normalization';
import type { SajuEngineExecutionInput, SajuEngineResult } from '../contracts/saju';
import { DEOKBUNAI_SAJU_V1_RULE_PROFILE } from '../contracts/sajuRules';
import type { NormalizationWarning } from '../domain/validation';
import {
  DEOKBUNAI_SAJU_ENGINE_VERSION,
  DEOKBUNAI_SAJU_RULE_SET_VERSION,
  NORMALIZATION_WARNING_SEVERITY,
  SAJU_HOUR_WARNING_SEVERITY,
  executeSaju,
  executeSajuWithCalculatorsForValidation,
} from './engineAdapter';
import { calculateFourPillars } from './fourPillars';
import { FOUR_PILLARS_GOLDEN_FIXTURES } from './fixtures/fourPillarsGoldenFixtures';
import { calculateSajuDerivedFacts } from './derived/calculateDerivedFacts';
import { DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS } from './derived/rules';
import { calculateFiveElementDistribution } from './distribution/calculateFiveElementDistribution';
import { DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_V1_RULE_VERSIONS } from './distribution/calculateFiveElementDistribution';
import type { SajuDirectFiveElementSlot } from './distribution/contracts';

export type SajuEngineValidationReport = {
  ok: boolean;
  failures: string[];
  goldenFixtures: number;
  aggregateCrossValidations: number;
  aggregateCrossValidationMismatches: number;
  successMappings: number;
  partialMappings: number;
  unavailableMappings: number;
  completeFactCases: number;
  partialWithoutHourFactCases: number;
  unavailableEmptyFactCases: number;
  historicalPartialCases: number;
  zeroSignalCases: number;
  fingerprintIdentityCases: number;
  provenanceCases: number;
  evidenceIntegrityCases: number;
  warningMappingCases: number;
  derivedFactViolations: number;
  derivedCompleteCases: number;
  derivedPartialCases: number;
  derivedRuleVersionCases: number;
  derivedDayMasterPeerCases: number;
  derivedEvidenceCases: number;
  productionCallCountCases: number;
  maxDerivedCallsObserved: number;
  unavailableDerivedZeroCallCases: number;
  distributionCompleteCases: number;
  distributionPartialCases: number;
  distributionCrossValidationCases: number;
  distributionCrossValidationMismatches: number;
  distributionRuleVersionCases: number;
  distributionEvidenceCases: number;
  distributionCapabilityCases: number;
  distributionCapabilityMismatches: number;
  maxDistributionCallsObserved: number;
  unavailableDistributionZeroCallCases: number;
};

function uniqueTimezone(): TimezoneResolution {
  return {
    status: 'RESOLVED',
    ianaZone: 'Asia/Seoul',
    resolvedOffsetSeconds: 32_400,
    resolvedOffsetMinutes: 540,
    timezoneDataVersion: 'engine-10a-validation',
    resolutionSource: 'EXTERNAL_LOOKUP',
    dst: {
      status: 'NOT_OBSERVED',
      dstOffsetSeconds: 0,
      provenance: {
        resolverId: 'ENGINE_10A_VALIDATION',
        resolverVersion: '1',
        source: 'ENGINE',
      },
    },
    localTimeResolution: {
      kind: 'UNIQUE',
      candidate: {
        utcEpochSeconds: 0,
        totalOffsetSeconds: 32_400,
        dstOffsetSeconds: 0,
        isDst: false,
      },
    },
    historicalProvenance: {
      authorityStatus: 'OFFICIAL_SOURCE_VERIFIED',
      officialSources: [],
      ruleSetVersion: 'engine-10a-validation',
      comparison: 'MATCH',
      jurisdiction: 'KR',
      applicableRegion: 'KR',
    },
    provenance: {
      resolverId: 'ENGINE_10A_VALIDATION',
      resolverVersion: '1',
      source: 'ENGINE',
    },
  };
}

function unresolvedTimezone(): TimezoneResolution {
  const provenance = {
    resolverId: 'ENGINE_10A_VALIDATION',
    resolverVersion: '1',
    source: 'ENGINE' as const,
  };
  return {
    status: 'UNRESOLVED',
    reason: 'TIME_UNRESOLVED',
    historicalProvenance: {
      authorityStatus: 'UNRESOLVED',
      officialSources: [],
      ruleSetVersion: 'engine-10a-validation',
      comparison: 'NOT_VERIFIED',
      jurisdiction: 'KR',
      applicableRegion: 'KR',
      unresolvedReason: 'TIME_UNRESOLVED',
    },
    provenance,
  };
}

function createExecutionInput(
  fixture: (typeof FOUR_PILLARS_GOLDEN_FIXTURES)[number],
): SajuEngineExecutionInput {
  const sourceTime =
    fixture.time.accuracy === 'EXACT'
      ? { accuracy: 'EXACT' as const, localTime: fixture.time.localTime }
      : fixture.time.accuracy === 'APPROXIMATE'
        ? { accuracy: 'APPROXIMATE' as const, period: fixture.time.period }
        : { accuracy: 'UNKNOWN' as const };
  const civilLocal =
    fixture.time.accuracy === 'EXACT'
      ? {
          accuracy: 'EXACT' as const,
          date: fixture.gregorianDate,
          time: fixture.time.localTime,
        }
      : fixture.time.accuracy === 'APPROXIMATE'
        ? {
            accuracy: 'APPROXIMATE' as const,
            date: fixture.gregorianDate,
            period: fixture.time.period,
            resolvedRange: null,
          }
        : {
            accuracy: 'UNKNOWN' as const,
            date: fixture.gregorianDate,
          };
  const calendar = resolveWithKasiCalendar({
    ...fixture.gregorianDate,
    calendar: 'GREGORIAN',
  });
  const normalizedBirth: NormalizedBirthInput = {
    source: {
      date: { ...fixture.gregorianDate, calendar: 'GREGORIAN' },
      time: sourceTime,
      place: { countryCode: 'KR' },
      temporalContext: {
        timezone: {
          status: 'EXPLICIT',
          ianaZone: 'Asia/Seoul',
          source: 'EXTERNAL_LOOKUP',
        },
        dst: { status: 'NOT_OBSERVED', source: 'EXTERNAL_LOOKUP' },
        trueSolarTime: { mode: 'DO_NOT_APPLY' },
      },
      gender: 'UNSPECIFIED',
    },
    calendar,
    civilLocal,
    timezone:
      fixture.time.accuracy === 'EXACT'
        ? uniqueTimezone()
        : unresolvedTimezone(),
    trueSolarTime: { status: 'NOT_APPLIED' },
    provenance: calendar.status === 'RESOLVED' ? [calendar.provenance] : [],
    warnings: [],
  };
  return {
    engine: 'SAJU',
    normalizedBirth,
    normalizedBirthFingerprint: {
      algorithm: 'SHA-256',
      encoding: 'UTF-8',
      value: `engine-10a.validation.${fixture.id}`,
    },
  };
}

function aggregateFor(input: SajuEngineExecutionInput) {
  return calculateFourPillars({
    normalizedBirthFingerprint: input.normalizedBirthFingerprint.value,
    normalized: {
      calendar: input.normalizedBirth.calendar,
      civilLocal: input.normalizedBirth.civilLocal,
      timezone: input.normalizedBirth.timezone,
      trueSolarTime: input.normalizedBirth.trueSolarTime,
    },
    ruleProfile: DEOKBUNAI_SAJU_V1_RULE_PROFILE,
    engineRuleSetVersion: DEOKBUNAI_SAJU_RULE_SET_VERSION,
  });
}

function outputMatchesAggregate(
  result: SajuEngineResult,
  aggregate: ReturnType<typeof aggregateFor>,
): boolean {
  if (aggregate.status === 'UNAVAILABLE') {
    return (
      result.status === 'UNAVAILABLE' &&
      result.failure.aggregateReason.code === aggregate.reason.code
    );
  }
  if (result.status === 'UNAVAILABLE') return false;
  return (
    result.output.fourPillars.year.index === aggregate.pillars.year.index &&
    result.output.fourPillars.month.index === aggregate.pillars.month.index &&
    result.output.fourPillars.day.index === aggregate.pillars.day.index &&
    result.output.fourPillars.hour.status === aggregate.pillars.hour.status &&
    result.output.identity.normalizedBirthFingerprint ===
      aggregate.identity.normalizedBirthFingerprint &&
    result.output.provenance.engineRuleSetVersion ===
      aggregate.provenance.engineRuleSetVersion
  );
}

function evidenceIsComplete(result: SajuEngineResult): boolean {
  if (result.status === 'UNAVAILABLE') return result.evidence.length === 0;
  const evidenceIds = new Set(result.evidence.map((node) => node.id));
  const factIds = new Set(result.facts.map((fact) => fact.id));
  return (
    result.facts.every((fact) =>
      fact.evidenceIds.every((evidenceId) => evidenceIds.has(evidenceId)),
    ) &&
    result.evidence.every((node) =>
      (node.factIds ?? []).every((factId) => factIds.has(factId)),
    ) &&
    result.evidence.every((node) =>
      (node.parentEvidenceIds ?? []).every((id) => evidenceIds.has(id)),
    )
  );
}

function derivedElementForSlot(
  result: Exclude<SajuEngineResult, { status: 'UNAVAILABLE' }>,
  slot: SajuDirectFiveElementSlot,
) {
  const pillars = result.output.derivedFacts.pillars;
  switch (slot) {
    case 'YEAR_STEM': return pillars.year.stem.element;
    case 'YEAR_BRANCH': return pillars.year.branch.element;
    case 'MONTH_STEM': return pillars.month.stem.element;
    case 'MONTH_BRANCH': return pillars.month.branch.element;
    case 'DAY_STEM': return pillars.day.stem.element;
    case 'DAY_BRANCH': return pillars.day.branch.element;
    case 'HOUR_STEM': return pillars.hour?.stem.element;
    case 'HOUR_BRANCH': return pillars.hour?.branch.element;
  }
}

function distributionIsPartial(
  result: SajuEngineResult,
): result is Extract<SajuEngineResult, { status: 'PARTIAL' }> {
  if (result.status !== 'PARTIAL') return false;
  const direct = result.output.fiveElementDistribution.direct;
  return (
    direct.completeness === 'PARTIAL' &&
    direct.observedSlots === 6 &&
    direct.expectedSlots === 8 &&
    direct.slots.length === 6 &&
    JSON.stringify(direct.missingSlots) ===
      JSON.stringify(['HOUR_STEM', 'HOUR_BRANCH'])
  );
}

function distributionIsComplete(result: SajuEngineResult): boolean {
  if (result.status !== 'SUCCESS') return false;
  const direct = result.output.fiveElementDistribution.direct;
  return (
    direct.completeness === 'COMPLETE' &&
    direct.observedSlots === 8 &&
    direct.expectedSlots === 8 &&
    direct.slots.length === 8 &&
    direct.missingSlots.length === 0
  );
}

export function validateSajuEngineAdapter(): SajuEngineValidationReport {
  const failures: string[] = [];
  let aggregateCrossValidations = 0;
  let aggregateCrossValidationMismatches = 0;
  let successMappings = 0;
  let partialMappings = 0;
  let completeFactCases = 0;
  let partialWithoutHourFactCases = 0;
  let zeroSignalCases = 0;
  let fingerprintIdentityCases = 0;
  let provenanceCases = 0;
  let evidenceIntegrityCases = 0;
  let derivedFactViolations = 0;
  let derivedCompleteCases = 0;
  let derivedPartialCases = 0;
  let derivedRuleVersionCases = 0;
  let derivedDayMasterPeerCases = 0;
  let derivedEvidenceCases = 0;
  let distributionCompleteCases = 0;
  let distributionPartialCases = 0;
  let distributionCrossValidationCases = 0;
  let distributionCrossValidationMismatches = 0;
  let distributionRuleVersionCases = 0;
  let distributionEvidenceCases = 0;
  const allowedFactKeys = new Set([
    'YEAR_PILLAR',
    'MONTH_PILLAR',
    'DAY_PILLAR',
    'HOUR_PILLAR',
  ]);

  for (const fixture of FOUR_PILLARS_GOLDEN_FIXTURES) {
    const input = createExecutionInput(fixture);
    const result = executeSaju(input);
    const aggregate = aggregateFor(input);
    aggregateCrossValidations += 1;
    if (!outputMatchesAggregate(result, aggregate)) {
      aggregateCrossValidationMismatches += 1;
      failures.push(`${fixture.id} aggregate cross-validation failed.`);
    }
    const expectedStatus =
      aggregate.status === 'COMPLETE'
        ? 'SUCCESS'
        : aggregate.status === 'PARTIAL'
          ? 'PARTIAL'
          : 'UNAVAILABLE';
    if (result.status !== expectedStatus) {
      failures.push(`${fixture.id} status mapping failed.`);
    }
    if (result.status === 'SUCCESS') {
      successMappings += 1;
      if (result.facts.length === 4) completeFactCases += 1;
      else failures.push(`${fixture.id} did not expose four facts.`);
      if (
        result.output.derivedFacts.pillars.year &&
        result.output.derivedFacts.pillars.month &&
        result.output.derivedFacts.pillars.day &&
        result.output.derivedFacts.pillars.hour
      ) derivedCompleteCases += 1;
      else failures.push(`${fixture.id} did not expose COMPLETE Derived Facts.`);
      const direct = result.output.fiveElementDistribution.direct;
      if (
        direct.completeness === 'COMPLETE' &&
        direct.observedSlots === 8 &&
        direct.expectedSlots === 8 &&
        direct.slots.length === 8 &&
        direct.missingSlots.length === 0
      ) distributionCompleteCases += 1;
      else failures.push(`${fixture.id} did not expose COMPLETE distribution.`);
    }
    if (result.status === 'PARTIAL') {
      partialMappings += 1;
      if (
        result.facts.length === 3 &&
        !result.facts.some((fact) => fact.key === 'HOUR_PILLAR')
      ) {
        partialWithoutHourFactCases += 1;
      } else {
        failures.push(`${fixture.id} exposed an unavailable Hour fact.`);
      }
      if (
        result.output.derivedFacts.pillars.year &&
        result.output.derivedFacts.pillars.month &&
        result.output.derivedFacts.pillars.day &&
        !Object.prototype.hasOwnProperty.call(
          result.output.derivedFacts.pillars,
          'hour',
        )
      ) derivedPartialCases += 1;
      else failures.push(`${fixture.id} exposed invalid PARTIAL Derived Facts.`);
      if (distributionIsPartial(result)) distributionPartialCases += 1;
      else failures.push(`${fixture.id} exposed invalid PARTIAL distribution.`);
    }
    if (result.signals.length === 0) zeroSignalCases += 1;
    else failures.push(`${fixture.id} generated signals.`);
    if (
      result.inputFingerprint === input.normalizedBirthFingerprint.value &&
      result.status !== 'UNAVAILABLE' &&
      result.output.identity.normalizedBirthFingerprint ===
        input.normalizedBirthFingerprint.value
    ) {
      fingerprintIdentityCases += 1;
    } else {
      failures.push(`${fixture.id} fingerprint identity was not preserved.`);
    }
    if (result.status !== 'UNAVAILABLE') {
      const provenance = result.output.provenance;
      if (
        result.engine.engineVersion === DEOKBUNAI_SAJU_ENGINE_VERSION &&
        result.engine.ruleSetVersion === DEOKBUNAI_SAJU_RULE_SET_VERSION &&
        result.engine.dataVersion === provenance.calendarDatasetVersion &&
        provenance.productRule.ruleVersion ===
          DEOKBUNAI_SAJU_V1_RULE_PROFILE.ruleVersion &&
        provenance.dayRule.ruleVersion === result.output.identity.dayRuleVersion &&
        provenance.hourRule.ruleVersion === result.output.identity.hourRuleVersion &&
        provenance.calendarConversionRuleVersion.length > 0
      ) {
        provenanceCases += 1;
      } else {
        failures.push(`${fixture.id} provenance was not preserved.`);
      }
      if (
        result.output.derivedFacts.ruleVersions ===
          DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS &&
        provenance.derivedFactsRuleVersions ===
          result.output.derivedFacts.ruleVersions
      ) derivedRuleVersionCases += 1;
      else failures.push(`${fixture.id} Derived Facts rule versions were not preserved.`);
      if (result.output.derivedFacts.pillars.day.stem.tenGod === 'PEER') {
        derivedDayMasterPeerCases += 1;
      } else failures.push(`${fixture.id} changed the raw Day Master Ten God.`);
      if (
        result.evidence.some(
          (node) =>
            node.id === 'SAJU.EVIDENCE.DERIVED_FACTS_RULES' &&
            node.ruleVersion ===
              result.output.derivedFacts.ruleVersions.derivedFacts,
        )
      ) derivedEvidenceCases += 1;
      else failures.push(`${fixture.id} Derived Facts evidence was missing.`);
      const distribution = result.output.fiveElementDistribution;
      if (
        distribution.ruleVersion ===
          DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_V1_RULE_VERSIONS.distribution &&
        distribution.sourceRuleVersions.derivedFacts ===
          DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_V1_RULE_VERSIONS.derivedFacts &&
        distribution.sourceRuleVersions.fiveElements ===
          DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_V1_RULE_VERSIONS.fiveElements &&
        provenance.fiveElementDistributionRuleVersions.distribution ===
          distribution.ruleVersion &&
        provenance.fiveElementDistributionRuleVersions.derivedFacts ===
          distribution.sourceRuleVersions.derivedFacts &&
        provenance.fiveElementDistributionRuleVersions.fiveElements ===
          distribution.sourceRuleVersions.fiveElements
      ) distributionRuleVersionCases += 1;
      else failures.push(`${fixture.id} distribution rule versions were not preserved.`);
      if (
        result.evidence.some(
          (node) =>
            node.id ===
              'SAJU.EVIDENCE.FIVE_ELEMENT_DISTRIBUTION_RULES' &&
            node.ruleVersion === distribution.ruleVersion &&
            node.parentEvidenceIds?.includes(
              'SAJU.EVIDENCE.DERIVED_FACTS_RULES',
            ),
        )
      ) distributionEvidenceCases += 1;
      else failures.push(`${fixture.id} distribution evidence was missing.`);
      for (const slot of distribution.direct.slots) {
        distributionCrossValidationCases += 1;
        if (derivedElementForSlot(result, slot.slot) !== slot.element) {
          distributionCrossValidationMismatches += 1;
        }
      }
    }
    if (evidenceIsComplete(result)) evidenceIntegrityCases += 1;
    else failures.push(`${fixture.id} evidence references are incomplete.`);
    const invalidFacts = result.facts.filter(
      (fact) => !allowedFactKeys.has(fact.key),
    );
    derivedFactViolations += invalidFacts.length;
  }

  const exactInput = createExecutionInput(FOUR_PILLARS_GOLDEN_FIXTURES[0]);
  let distributionCapabilityCases = 0;
  let distributionCapabilityMismatches = 0;
  const initialCapabilityCases: readonly [string, SajuEngineResult, 'COMPLETE' | 'PARTIAL'][] = [
    ['EXACT_UNIQUE', executeSaju(exactInput), 'COMPLETE'],
    [
      'UNKNOWN',
      executeSaju(createExecutionInput(FOUR_PILLARS_GOLDEN_FIXTURES[4])),
      'PARTIAL',
    ],
    [
      'APPROXIMATE',
      executeSaju(createExecutionInput(FOUR_PILLARS_GOLDEN_FIXTURES[5])),
      'PARTIAL',
    ],
  ];
  for (const [name, result, expected] of initialCapabilityCases) {
    distributionCapabilityCases += 1;
    if (
      (expected === 'COMPLETE' && distributionIsComplete(result)) ||
      (expected === 'PARTIAL' && distributionIsPartial(result))
    ) continue;
    distributionCapabilityMismatches += 1;
    failures.push(`${name} distribution capability mapping failed.`);
  }
  const exactTimezone = exactInput.normalizedBirth.timezone;
  let historicalPartialCases = 0;
  if (
    exactTimezone.status === 'RESOLVED' &&
    'resolvedOffsetSeconds' in exactTimezone
  ) {
    const candidate = exactTimezone.localTimeResolution.candidate;
    const {
      resolvedOffsetSeconds: _resolvedOffsetSeconds,
      resolvedOffsetMinutes: _resolvedOffsetMinutes,
      dst: _dst,
      ...resolvedBase
    } = exactTimezone;
    const historicalInputs: readonly [string, SajuEngineExecutionInput][] = [
      [
        'AMBIGUOUS',
        {
          ...exactInput,
          normalizedBirth: {
            ...exactInput.normalizedBirth,
            timezone: {
              ...resolvedBase,
              localTimeResolution: {
                kind: 'AMBIGUOUS',
                candidates: [
                  candidate,
                  {
                    ...candidate,
                    utcEpochSeconds: candidate.utcEpochSeconds + 1,
                  },
                ],
              },
            },
          },
        },
      ],
      [
        'NONEXISTENT',
        {
          ...exactInput,
          normalizedBirth: {
            ...exactInput.normalizedBirth,
            timezone: {
              ...resolvedBase,
              localTimeResolution: {
                kind: 'NONEXISTENT',
                gap: {
                  startLocalDateTime: {
                    date: { year: 2000, month: 1, day: 7 },
                    time: { hour: 1, minute: 0, second: 0 },
                  },
                  endLocalDateTime: {
                    date: { year: 2000, month: 1, day: 7 },
                    time: { hour: 2, minute: 0, second: 0 },
                  },
                  transitionUtcEpochSeconds: 0,
                  offsetBeforeSeconds: 32_400,
                  offsetAfterSeconds: 36_000,
                  dstOffsetBeforeSeconds: 0,
                  dstOffsetAfterSeconds: 3_600,
                },
              },
            },
          },
        },
      ],
      [
        'TIMEZONE_UNRESOLVED',
        {
          ...exactInput,
          normalizedBirth: {
            ...exactInput.normalizedBirth,
            timezone: unresolvedTimezone(),
          },
        },
      ],
    ];
    for (const [name, input] of historicalInputs) {
      const result = executeSaju(input);
      distributionCapabilityCases += 1;
      if (distributionIsPartial(result)) {
        historicalPartialCases += 1;
      } else {
        distributionCapabilityMismatches += 1;
        failures.push(`${name} did not preserve a 6-slot PARTIAL distribution.`);
      }
    }
  }

  const unsupportedInput: SajuEngineExecutionInput = {
    ...exactInput,
    normalizedBirth: {
      ...exactInput.normalizedBirth,
      source: {
        ...exactInput.normalizedBirth.source,
        date: { year: 2051, month: 1, day: 1, calendar: 'GREGORIAN' },
      },
      calendar: resolveWithKasiCalendar({
        year: 2051,
        month: 1,
        day: 1,
        calendar: 'GREGORIAN',
      }),
      civilLocal: {
        accuracy: 'EXACT',
        date: { year: 2051, month: 1, day: 1 },
        time: { hour: 1, minute: 30, second: 0 },
      },
    },
  };
  const missingCalendarInput: SajuEngineExecutionInput = {
    ...exactInput,
    normalizedBirth: {
      ...exactInput.normalizedBirth,
      calendar: {
        status: 'UNRESOLVED',
        sourceDate: exactInput.normalizedBirth.source.date,
        reason: 'CALENDAR_DATA_UNAVAILABLE',
      },
      civilLocal: { accuracy: 'UNRESOLVED', reason: 'CALENDAR_UNRESOLVED' },
    },
  };
  const unavailableResults = [
    [executeSaju(unsupportedInput), 'UNSUPPORTED_INPUT'],
    [executeSaju(missingCalendarInput), 'MISSING_DATA'],
  ] as const;
  let unavailableMappings = 0;
  let unavailableEmptyFactCases = 0;
  for (const [result, reason] of unavailableResults) {
    if (
      result.status === 'UNAVAILABLE' &&
      result.unavailableReason === reason
    ) {
      unavailableMappings += 1;
    } else {
      failures.push(`UNAVAILABLE ${reason} mapping failed.`);
    }
    if (result.facts.length === 0 && result.signals.length === 0) {
      unavailableEmptyFactCases += 1;
    } else {
      failures.push(`UNAVAILABLE ${reason} exposed facts or signals.`);
    }
  }

  let productionCallCountCases = 0;
  let maxDerivedCallsObserved = 0;
  let unavailableDerivedZeroCallCases = 0;
  let maxDistributionCallsObserved = 0;
  let unavailableDistributionZeroCallCases = 0;
  let fourPillarsCalls = 0;
  let derivedCalls = 0;
  let distributionCalls = 0;
  const countedCalculators = {
    calculateFourPillars(input: Parameters<typeof calculateFourPillars>[0]) {
      fourPillarsCalls += 1;
      return calculateFourPillars(input);
    },
    calculateDerivedFacts(
      input: Parameters<typeof calculateSajuDerivedFacts>[0],
    ) {
      derivedCalls += 1;
      maxDerivedCallsObserved = Math.max(maxDerivedCallsObserved, derivedCalls);
      return calculateSajuDerivedFacts(input);
    },
    calculateFiveElementDistribution(
      input: Parameters<typeof calculateFiveElementDistribution>[0],
    ) {
      distributionCalls += 1;
      maxDistributionCallsObserved = Math.max(
        maxDistributionCallsObserved,
        distributionCalls,
      );
      return calculateFiveElementDistribution(input);
    },
  };
  const countedComplete = executeSajuWithCalculatorsForValidation(
    exactInput,
    countedCalculators,
  );
  if (
    countedComplete.status === 'SUCCESS' &&
    fourPillarsCalls === 1 &&
    derivedCalls === 1 &&
    distributionCalls === 1
  ) productionCallCountCases += 1;
  else failures.push('COMPLETE production calculator call counts were not 1/1/1.');

  fourPillarsCalls = 0;
  derivedCalls = 0;
  distributionCalls = 0;
  const countedPartial = executeSajuWithCalculatorsForValidation(
    createExecutionInput(FOUR_PILLARS_GOLDEN_FIXTURES[5]),
    countedCalculators,
  );
  if (
    countedPartial.status === 'PARTIAL' &&
    fourPillarsCalls === 1 &&
    derivedCalls === 1 &&
    distributionCalls === 1
  ) productionCallCountCases += 1;
  else failures.push('PARTIAL production calculator call counts were not 1/1/1.');

  fourPillarsCalls = 0;
  derivedCalls = 0;
  distributionCalls = 0;
  const countedUnavailable = executeSajuWithCalculatorsForValidation(
    missingCalendarInput,
    countedCalculators,
  );
  if (
    countedUnavailable.status === 'UNAVAILABLE' &&
    fourPillarsCalls === 1 &&
    derivedCalls === 0 &&
    distributionCalls === 0
  ) {
    productionCallCountCases += 1;
    unavailableDerivedZeroCallCases += 1;
    unavailableDistributionZeroCallCases += 1;
  } else failures.push('UNAVAILABLE invoked a downstream calculator.');

  const sourceWarning: NormalizationWarning = {
    code: 'VALIDATION_WARNING',
    path: 'source.time',
    stage: 'TIMEZONE',
    messageKey: 'validation.warning',
    details: { retained: true },
  };
  const warningInput: SajuEngineExecutionInput = {
    ...exactInput,
    normalizedBirth: {
      ...exactInput.normalizedBirth,
      warnings: [sourceWarning],
    },
  };
  const warningResult = executeSaju(warningInput);
  let warningMappingCases = 0;
  const mappedNormalizationWarning = warningResult.warnings.find(
    (warning) => warning.source === 'NORMALIZATION',
  );
  if (
    mappedNormalizationWarning?.source === 'NORMALIZATION' &&
    mappedNormalizationWarning.severity === NORMALIZATION_WARNING_SEVERITY &&
    mappedNormalizationWarning.normalizationWarning === sourceWarning &&
    mappedNormalizationWarning.normalizationWarning.details?.retained === true
  ) {
    warningMappingCases += 1;
  } else {
    failures.push('Normalization warning mapping lost source information.');
  }
  const partialResult = executeSaju(
    createExecutionInput(FOUR_PILLARS_GOLDEN_FIXTURES[5]),
  );
  const hourWarning = partialResult.warnings.find(
    (warning) => warning.source === 'HOUR_CAPABILITY',
  );
  if (
    hourWarning?.source === 'HOUR_CAPABILITY' &&
    hourWarning.severity ===
      SAJU_HOUR_WARNING_SEVERITY[hourWarning.hourReason]
  ) {
    warningMappingCases += 1;
  } else {
    failures.push('Hour capability warning mapping failed.');
  }

  if (derivedFactViolations > 0) {
    failures.push(`${derivedFactViolations} Derived Facts were generated.`);
  }
  if (aggregateCrossValidationMismatches > 0) {
    failures.push(
      `${aggregateCrossValidationMismatches} aggregate cross-validations failed.`,
    );
  }
  if (distributionCrossValidationMismatches > 0) {
    failures.push(
      `${distributionCrossValidationMismatches} distribution cross-validations failed.`,
    );
  }
  if (distributionCapabilityMismatches > 0) {
    failures.push(
      `${distributionCapabilityMismatches} distribution capability validations failed.`,
    );
  }

  return {
    ok: failures.length === 0,
    failures,
    goldenFixtures: FOUR_PILLARS_GOLDEN_FIXTURES.length,
    aggregateCrossValidations,
    aggregateCrossValidationMismatches,
    successMappings,
    partialMappings,
    unavailableMappings,
    completeFactCases,
    partialWithoutHourFactCases,
    unavailableEmptyFactCases,
    historicalPartialCases,
    zeroSignalCases,
    fingerprintIdentityCases,
    provenanceCases,
    evidenceIntegrityCases,
    warningMappingCases,
    derivedFactViolations,
    derivedCompleteCases,
    derivedPartialCases,
    derivedRuleVersionCases,
    derivedDayMasterPeerCases,
    derivedEvidenceCases,
    productionCallCountCases,
    maxDerivedCallsObserved,
    unavailableDerivedZeroCallCases,
    distributionCompleteCases,
    distributionPartialCases,
    distributionCrossValidationCases,
    distributionCrossValidationMismatches,
    distributionRuleVersionCases,
    distributionEvidenceCases,
    distributionCapabilityCases,
    distributionCapabilityMismatches,
    maxDistributionCallsObserved,
    unavailableDistributionZeroCallCases,
  };
}
