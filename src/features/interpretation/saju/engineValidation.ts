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
} from './engineAdapter';
import { calculateFourPillars } from './fourPillars';
import { FOUR_PILLARS_GOLDEN_FIXTURES } from './fixtures/fourPillarsGoldenFixtures';

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
        : { status: 'UNRESOLVED', reason: 'TIME_UNRESOLVED' },
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
    }
    if (evidenceIsComplete(result)) evidenceIntegrityCases += 1;
    else failures.push(`${fixture.id} evidence references are incomplete.`);
    const invalidFacts = result.facts.filter(
      (fact) => !allowedFactKeys.has(fact.key),
    );
    derivedFactViolations += invalidFacts.length;
  }

  const exactInput = createExecutionInput(FOUR_PILLARS_GOLDEN_FIXTURES[0]);
  const exactTimezone = exactInput.normalizedBirth.timezone;
  let historicalPartialCases = 0;
  if (
    exactTimezone.status === 'RESOLVED' &&
    exactTimezone.localTimeResolution.kind === 'UNIQUE'
  ) {
    const candidate = exactTimezone.localTimeResolution.candidate;
    const ambiguousInput: SajuEngineExecutionInput = {
      ...exactInput,
      normalizedBirth: {
        ...exactInput.normalizedBirth,
        timezone: {
          ...exactTimezone,
          localTimeResolution: {
            kind: 'AMBIGUOUS',
            candidates: [
              candidate,
              { ...candidate, utcEpochSeconds: candidate.utcEpochSeconds + 1 },
            ],
          },
        },
      },
    };
    const ambiguousResult = executeSaju(ambiguousInput);
    if (
      ambiguousResult.status === 'PARTIAL' &&
      ambiguousResult.output.fourPillars.hour.status === 'AMBIGUOUS' &&
      !ambiguousResult.facts.some((fact) => fact.key === 'HOUR_PILLAR')
    ) {
      historicalPartialCases = 1;
    } else {
      failures.push('Historical ambiguity did not remain PARTIAL.');
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
  };
}
