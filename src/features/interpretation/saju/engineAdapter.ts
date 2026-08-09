import type { EngineDescriptor, EngineUnavailableReason } from '../contracts/engine';
import type {
  SajuEngineExecutionInput,
  SajuEngineOutput,
  SajuEngineResult,
  SajuEngineWarning,
  SajuPillarFact,
  SajuPillarFactKey,
} from '../contracts/saju';
import { DEOKBUNAI_SAJU_V1_RULE_PROFILE } from '../contracts/sajuRules';
import type { SajuFourPillarsUnavailableReason } from './contracts';
import type { EvidenceNode } from '../domain/evidence';
import type { MissingDataItem, WarningSeverity } from '../domain/issues';
import { calculateFourPillars } from './fourPillars';
import { calculateSajuDerivedFacts } from './derived/calculateDerivedFacts';

export const DEOKBUNAI_SAJU_ENGINE_VERSION =
  'deokbunai.saju-engine.v1' as const;
export const DEOKBUNAI_SAJU_RULE_SET_VERSION =
  'deokbunai.saju-rules.v1' as const;

export const NORMALIZATION_WARNING_SEVERITY: WarningSeverity = 'INFO';

export const SAJU_HOUR_WARNING_SEVERITY = {
  BIRTH_TIME_UNKNOWN: 'INFO',
  BIRTH_TIME_APPROXIMATE_AMBIGUOUS: 'CAUTION',
  EXACT_LOCAL_TIME_INCOMPLETE: 'CAUTION',
  INVALID_LOCAL_TIME: 'CAUTION',
  LOCAL_TIME_AMBIGUOUS: 'CAUTION',
  LOCAL_TIME_NONEXISTENT: 'CAUTION',
  HISTORICAL_TIME_UNRESOLVED: 'CAUTION',
  HISTORICAL_SOURCE_CONFLICT: 'CAUTION',
} as const satisfies Record<
  import('./contracts').SajuFourPillarsHourUnavailableReason,
  WarningSeverity
>;

const FACT_IDS: Record<SajuPillarFactKey, string> = {
  YEAR_PILLAR: 'SAJU.FACT.YEAR_PILLAR',
  MONTH_PILLAR: 'SAJU.FACT.MONTH_PILLAR',
  DAY_PILLAR: 'SAJU.FACT.DAY_PILLAR',
  HOUR_PILLAR: 'SAJU.FACT.HOUR_PILLAR',
};

const EVIDENCE_IDS = {
  input: 'SAJU.EVIDENCE.NORMALIZED_BIRTH',
  calendar: 'SAJU.EVIDENCE.CALENDAR',
  productRule: 'SAJU.EVIDENCE.PRODUCT_RULE',
  dayRule: 'SAJU.EVIDENCE.DAY_RULE',
  hourRule: 'SAJU.EVIDENCE.HOUR_RULE',
  year: 'SAJU.EVIDENCE.YEAR_PILLAR',
  month: 'SAJU.EVIDENCE.MONTH_PILLAR',
  day: 'SAJU.EVIDENCE.DAY_PILLAR',
  hour: 'SAJU.EVIDENCE.HOUR_PILLAR',
  derivedFacts: 'SAJU.EVIDENCE.DERIVED_FACTS_RULES',
} as const;

function createDescriptor(input: SajuEngineExecutionInput): EngineDescriptor {
  const calendar = input.normalizedBirth.calendar;
  return {
    id: 'SAJU',
    engineVersion: DEOKBUNAI_SAJU_ENGINE_VERSION,
    ruleSetVersion: DEOKBUNAI_SAJU_RULE_SET_VERSION,
    ...(calendar.status === 'RESOLVED'
      ? { dataVersion: calendar.calendarDatasetVersion }
      : {}),
  };
}

function mapNormalizationWarnings(
  input: SajuEngineExecutionInput,
): SajuEngineWarning[] {
  return input.normalizedBirth.warnings.map((warning) => ({
    code: `NORMALIZATION.${warning.code}`,
    severity: NORMALIZATION_WARNING_SEVERITY,
    scope: `NORMALIZATION.${warning.stage}`,
    messageKey: warning.messageKey,
    ...(warning.path ? { relatedInputPaths: [warning.path] } : {}),
    source: 'NORMALIZATION',
    normalizationWarning: warning,
  }));
}

function mapHourMissingData(
  reason: import('./contracts').SajuFourPillarsHourUnavailableReason,
): MissingDataItem {
  const birthTimeReasons = new Set([
    'BIRTH_TIME_UNKNOWN',
    'BIRTH_TIME_APPROXIMATE_AMBIGUOUS',
    'EXACT_LOCAL_TIME_INCOMPLETE',
    'INVALID_LOCAL_TIME',
  ]);
  const missingReason: MissingDataItem['reason'] =
    reason === 'BIRTH_TIME_UNKNOWN'
      ? 'NOT_PROVIDED'
      : reason === 'BIRTH_TIME_APPROXIMATE_AMBIGUOUS' ||
          reason === 'EXACT_LOCAL_TIME_INCOMPLETE' ||
          reason === 'INVALID_LOCAL_TIME'
        ? 'INSUFFICIENT_ACCURACY'
        : 'UNRESOLVED';
  return {
    field: birthTimeReasons.has(reason)
      ? 'normalizedBirth.civilLocal'
      : 'normalizedBirth.timezone',
    reason: missingReason,
    requiredFor: ['HOUR_PILLAR'],
  };
}

function mapHourWarning(
  reason: import('./contracts').SajuFourPillarsHourUnavailableReason,
): SajuEngineWarning {
  return {
    code: `SAJU.HOUR.${reason}`,
    severity: SAJU_HOUR_WARNING_SEVERITY[reason],
    scope: 'SAJU.HOUR_PILLAR',
    messageKey: `interpretation.saju.hour.${reason}`,
    relatedInputPaths: [mapHourMissingData(reason).field],
    affectedFactKeys: ['HOUR_PILLAR'],
    source: 'HOUR_CAPABILITY',
    hourReason: reason,
  };
}

function mapUnavailableReason(
  reason: SajuFourPillarsUnavailableReason,
): EngineUnavailableReason {
  if (reason.code === 'CALENDAR_UNRESOLVED') {
    switch (reason.calendarReason) {
      case 'RESOLVER_NOT_PROVIDED':
      case 'CALENDAR_DATA_UNAVAILABLE':
        return 'MISSING_DATA';
      case 'UNSUPPORTED_CALENDAR_RANGE':
        return 'UNSUPPORTED_INPUT';
      case 'INVALID_LUNAR_DATE':
      case 'INVALID_LUNAR_MONTH_KIND':
      case 'CALENDAR_CONVERSION_FAILED':
        return 'VALIDATION_FAILED';
    }
  }
  return reason.code === 'PRODUCT_RULE_VIOLATION'
    ? 'UNSUPPORTED_INPUT'
    : 'VALIDATION_FAILED';
}

function unavailableMissingData(
  reason: SajuFourPillarsUnavailableReason,
): MissingDataItem[] {
  if (reason.code !== 'CALENDAR_UNRESOLVED') return [];
  return [
    {
      field: 'normalizedBirth.calendar',
      reason:
        reason.calendarReason === 'UNSUPPORTED_CALENDAR_RANGE'
          ? 'UNSUPPORTED'
          : 'UNRESOLVED',
      requiredFor: ['YEAR_PILLAR', 'MONTH_PILLAR', 'DAY_PILLAR'],
    },
  ];
}

function createFacts(output: SajuEngineOutput): SajuPillarFact[] {
  const facts: SajuPillarFact[] = [
    {
      id: FACT_IDS.YEAR_PILLAR,
      key: 'YEAR_PILLAR',
      value: output.fourPillars.year,
      scope: 'SAJU.FOUR_PILLARS',
      confidence: 'DETERMINISTIC',
      evidenceIds: [EVIDENCE_IDS.year],
    },
    {
      id: FACT_IDS.MONTH_PILLAR,
      key: 'MONTH_PILLAR',
      value: output.fourPillars.month,
      scope: 'SAJU.FOUR_PILLARS',
      confidence: 'DETERMINISTIC',
      evidenceIds: [EVIDENCE_IDS.month],
    },
    {
      id: FACT_IDS.DAY_PILLAR,
      key: 'DAY_PILLAR',
      value: output.fourPillars.day,
      scope: 'SAJU.FOUR_PILLARS',
      confidence: 'DETERMINISTIC',
      evidenceIds: [EVIDENCE_IDS.day],
    },
  ];
  if (output.fourPillars.hour.status === 'AVAILABLE') {
    facts.push({
      id: FACT_IDS.HOUR_PILLAR,
      key: 'HOUR_PILLAR',
      value: output.fourPillars.hour.pillar,
      scope: 'SAJU.FOUR_PILLARS',
      confidence: 'DETERMINISTIC',
      evidenceIds: [EVIDENCE_IDS.hour],
    });
  }
  return facts;
}

function createEvidence(output: SajuEngineOutput): EvidenceNode[] {
  const factIds = {
    year: FACT_IDS.YEAR_PILLAR,
    month: FACT_IDS.MONTH_PILLAR,
    day: FACT_IDS.DAY_PILLAR,
    hour:
      output.fourPillars.hour.status === 'AVAILABLE'
        ? FACT_IDS.HOUR_PILLAR
        : null,
  };
  const evidence: EvidenceNode[] = [
    {
      id: EVIDENCE_IDS.input,
      kind: 'INPUT',
      inputPaths: [
        'normalizedBirthFingerprint',
        'normalizedBirth.calendar',
        'normalizedBirth.civilLocal',
        'normalizedBirth.timezone',
      ],
    },
    {
      id: EVIDENCE_IDS.calendar,
      kind: 'LOOKUP',
      ruleId: output.provenance.calendarDatasetVersion,
      ruleVersion: output.provenance.calendarConversionRuleVersion,
      factIds: [factIds.year, factIds.month, factIds.day],
      parentEvidenceIds: [EVIDENCE_IDS.input],
    },
    {
      id: EVIDENCE_IDS.productRule,
      kind: 'RULE',
      ruleId: output.provenance.productRule.ruleId,
      ruleVersion: output.provenance.productRule.ruleVersion,
      factIds: [factIds.year, factIds.month],
    },
    {
      id: EVIDENCE_IDS.dayRule,
      kind: 'RULE',
      ruleId: output.provenance.dayRule.ruleId,
      ruleVersion: output.provenance.dayRule.ruleVersion,
      factIds: [factIds.day],
    },
    {
      id: EVIDENCE_IDS.hourRule,
      kind: 'RULE',
      ruleId: output.provenance.hourRule.ruleId,
      ruleVersion: output.provenance.hourRule.ruleVersion,
      ...(factIds.hour ? { factIds: [factIds.hour] } : {}),
    },
    {
      id: EVIDENCE_IDS.year,
      kind: 'DERIVATION',
      factIds: [factIds.year],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.calendar,
        EVIDENCE_IDS.productRule,
      ],
    },
    {
      id: EVIDENCE_IDS.month,
      kind: 'DERIVATION',
      factIds: [factIds.month],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.calendar,
        EVIDENCE_IDS.productRule,
      ],
    },
    {
      id: EVIDENCE_IDS.day,
      kind: 'DERIVATION',
      factIds: [factIds.day],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.calendar,
        EVIDENCE_IDS.dayRule,
      ],
    },
  ];
  if (factIds.hour) {
    evidence.push({
      id: EVIDENCE_IDS.hour,
      kind: 'DERIVATION',
      factIds: [factIds.hour],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.day,
        EVIDENCE_IDS.hourRule,
      ],
    });
  }
  evidence.push({
    id: EVIDENCE_IDS.derivedFacts,
    kind: 'RULE',
    ruleId: 'DEOKBUNAI_SAJU_DERIVED_FACTS',
    ruleVersion: output.derivedFacts.ruleVersions.derivedFacts,
    parentEvidenceIds: [
      EVIDENCE_IDS.year,
      EVIDENCE_IDS.month,
      EVIDENCE_IDS.day,
      ...(factIds.hour ? [EVIDENCE_IDS.hour] : []),
    ],
  });
  return evidence;
}

type SajuExecutionCalculators = {
  calculateFourPillars: typeof calculateFourPillars;
  calculateDerivedFacts: typeof calculateSajuDerivedFacts;
};

const PRODUCTION_CALCULATORS: SajuExecutionCalculators = {
  calculateFourPillars,
  calculateDerivedFacts: calculateSajuDerivedFacts,
};

/** @internal Validation seam. Not exported from the interpretation package. */
export function executeSajuWithCalculatorsForValidation(
  input: SajuEngineExecutionInput,
  calculators: SajuExecutionCalculators,
): SajuEngineResult {
  const engine = createDescriptor(input);
  const normalizationWarnings = mapNormalizationWarnings(input);
  const aggregate = calculators.calculateFourPillars({
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

  if (aggregate.status === 'UNAVAILABLE') {
    return {
      status: 'UNAVAILABLE',
      engine,
      inputFingerprint: input.normalizedBirthFingerprint.value,
      facts: [],
      signals: [],
      evidence: [],
      warnings: normalizationWarnings,
      missingData: unavailableMissingData(aggregate.reason),
      unavailableReason: mapUnavailableReason(aggregate.reason),
      failure: { aggregateReason: aggregate.reason },
    };
  }

  const derived = calculators.calculateDerivedFacts({
    fourPillars: aggregate.pillars,
  });
  if (!derived.ok) {
    throw new Error(
      `Saju Derived Facts invariant failed: ${derived.error.code} at ${derived.error.field}.`,
    );
  }

  const output: SajuEngineOutput = {
    fourPillars: aggregate.pillars,
    derivedFacts: derived.value,
    identity: aggregate.identity,
    provenance: {
      ...aggregate.provenance,
      derivedFactsRuleVersions: derived.value.ruleVersions,
    },
  };
  const hour = output.fourPillars.hour;
  const hourWarnings =
    hour.status === 'AVAILABLE' ? [] : [mapHourWarning(hour.reason)];
  const missingData =
    hour.status === 'AVAILABLE' ? [] : [mapHourMissingData(hour.reason)];

  return {
    status: aggregate.status === 'COMPLETE' ? 'SUCCESS' : 'PARTIAL',
    engine,
    inputFingerprint: input.normalizedBirthFingerprint.value,
    facts: createFacts(output),
    signals: [],
    evidence: createEvidence(output),
    warnings: [...normalizationWarnings, ...hourWarnings],
    missingData,
    output,
  };
}

/** The only public Saju execution entrypoint. */
export function executeSaju(input: SajuEngineExecutionInput): SajuEngineResult {
  return executeSajuWithCalculatorsForValidation(input, PRODUCTION_CALCULATORS);
}
