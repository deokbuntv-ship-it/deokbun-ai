// General-consultation ANSWER-QUALITY evaluation (deterministic, ZERO LLM). The Answer Plan is the
// server-owned decision contract; this module evaluates a plan against a Golden-Set behavioral
// expectation and reports typed failures. It is the offline/regression harness — production runtime is
// unchanged (still one LLM call). No prose is judged here; only the DECISION contract.
import type {
  AnswerPlan,
  Assertiveness,
  DecisionIntent,
  Granularity,
  SupportLevel,
} from './answerPlan';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { EngineEvidence } from '@/features/analysis';

// ── failure taxonomy (§8) ────────────────────────────────────────────────────
export type QualityFailureCode =
  | 'WRONG_INTENT' // the plan missed a required decision intent (the question is not understood)
  | 'TEMPORAL_MISMATCH' // requested/resolved granularity is wrong (e.g. month asked, month claimed w/o grounding)
  | 'WRONG_SCOPE' // resolved granularity/support does not match the available evidence scope
  | 'UNDERASSERTIVE' // evidence supports a firmer conclusion than the plan permits (overhedged)
  | 'OVERASSERTIVE' // the plan permits more certainty than the evidence supports
  | 'MISSING_ALTERNATIVE' // an unsupported exact request did not fall back to a nearby supported scope
  | 'INVALID_COMPARISON' // comparison permitted without BOTH candidates grounded (§29)
  | 'INVALID_RANKING' // ranking permitted without a grounded candidate set (§30)
  | 'EVENT_DECISION_CONFUSION'; // an event/guarantee question did not forbid event certainty (§28)

export type GoldenExpect = {
  intents?: DecisionIntent[]; // plan.intents MUST include each of these
  requestedGranularity?: Granularity;
  resolvedGranularity?: Granularity;
  supportLevel?: SupportLevel;
  assertivenessIn?: Assertiveness[]; // plan.assertiveness MUST be one of these
  comparisonSupported?: boolean;
  rankingSupported?: boolean;
  forbidEventCertainty?: boolean;
};

export type QualityFailure = {
  code: QualityFailureCode;
  field: string;
  expected: unknown;
  actual: unknown;
};

// Build a deterministic grounding for a golden scenario (no engine run). `months` are year*100+month.
export type GoldenGroundingScenario =
  | { available: false }
  | { available: true; years: number[]; months?: number[]; referenceYear?: number };

export function buildGoldenGrounding(scenario: GoldenGroundingScenario): ConsultationGrounding {
  if (!scenario.available) return { status: 'unavailable', reason: 'calculation_failed' };
  const myungri: EngineEvidence = {
    availability: 'available',
    summary: '사주 명식 요약',
    sections: [{ label: '명식', lines: ['년 癸卯 · 일 丙寅'] }],
    hasTimingEvidence: true,
    timingAnchors: {
      years: scenario.years,
      referenceYear: scenario.referenceYear ?? scenario.years[0] ?? null,
      ...(scenario.months && scenario.months.length ? { months: scenario.months } : {}),
    },
  };
  return {
    status: 'available',
    evidence: {
      myungri,
      ziwei: { availability: 'engine_not_connected' },
      qimen: { availability: 'engine_not_connected' },
    },
  };
}

// Map an expectation mismatch to the taxonomy. Only checks the fields the expectation specifies.
export function evaluateAnswerPlan(plan: AnswerPlan, expect: GoldenExpect): QualityFailure[] {
  const out: QualityFailure[] = [];

  if (expect.intents) {
    for (const need of expect.intents) {
      if (!plan.intents.includes(need)) {
        out.push({ code: 'WRONG_INTENT', field: `intents⊇${need}`, expected: need, actual: plan.intents });
      }
    }
  }
  if (expect.requestedGranularity !== undefined && plan.requestedGranularity !== expect.requestedGranularity) {
    out.push({ code: 'TEMPORAL_MISMATCH', field: 'requestedGranularity', expected: expect.requestedGranularity, actual: plan.requestedGranularity });
  }
  if (expect.resolvedGranularity !== undefined && plan.resolvedGranularity !== expect.resolvedGranularity) {
    out.push({ code: 'WRONG_SCOPE', field: 'resolvedGranularity', expected: expect.resolvedGranularity, actual: plan.resolvedGranularity });
  }
  if (expect.supportLevel !== undefined && plan.supportLevel !== expect.supportLevel) {
    // A too-weak support when evidence exists is the "overhedged / missing alternative" family.
    const weaker = supportRank(plan.supportLevel) < supportRank(expect.supportLevel);
    out.push({
      code: expect.supportLevel === 'ALTERNATIVE' && plan.supportLevel === 'NONE' ? 'MISSING_ALTERNATIVE' : weaker ? 'UNDERASSERTIVE' : 'WRONG_SCOPE',
      field: 'supportLevel',
      expected: expect.supportLevel,
      actual: plan.supportLevel,
    });
  }
  if (expect.assertivenessIn && !expect.assertivenessIn.includes(plan.assertiveness)) {
    const weaker = assertRank(plan.assertiveness) < Math.min(...expect.assertivenessIn.map(assertRank));
    out.push({ code: weaker ? 'UNDERASSERTIVE' : 'OVERASSERTIVE', field: 'assertiveness', expected: expect.assertivenessIn, actual: plan.assertiveness });
  }
  if (expect.comparisonSupported !== undefined && plan.comparisonSupported !== expect.comparisonSupported) {
    out.push({ code: 'INVALID_COMPARISON', field: 'comparisonSupported', expected: expect.comparisonSupported, actual: plan.comparisonSupported });
  }
  if (expect.rankingSupported !== undefined && plan.rankingSupported !== expect.rankingSupported) {
    out.push({ code: 'INVALID_RANKING', field: 'rankingSupported', expected: expect.rankingSupported, actual: plan.rankingSupported });
  }
  if (expect.forbidEventCertainty !== undefined && plan.forbidEventCertainty !== expect.forbidEventCertainty) {
    out.push({ code: 'EVENT_DECISION_CONFUSION', field: 'forbidEventCertainty', expected: expect.forbidEventCertainty, actual: plan.forbidEventCertainty });
  }
  return out;
}

const supportRank = (s: SupportLevel): number => ({ NONE: 0, ALTERNATIVE: 1, PARTIAL: 2, DIRECT: 3 })[s];
const assertRank = (a: Assertiveness): number => ({ LIMITED: 0, MODERATE: 1, STRONG: 2, VERY_STRONG: 3 })[a];

// Aggregate counts by taxonomy code (§60 eval output; no PII).
export function summarizeFailures(all: QualityFailure[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const f of all) counts[f.code] = (counts[f.code] ?? 0) + 1;
  return counts;
}
