// The EVALUATOR is itself tested (an eval harness you don't trust is worthless). Locks the taxonomy
// mapping + the grounding builder + the aggregator. Pure; ZERO LLM.
import {
  buildGoldenGrounding,
  evaluateAnswerPlan,
  summarizeFailures,
  type QualityFailure,
} from '@/features/chat/server/consultationQuality';
import type { AnswerPlan } from '@/features/chat/server/answerPlan';

const plan = (over: Partial<AnswerPlan> = {}): AnswerPlan => ({
  mode: 'solo',
  intents: ['DESCRIPTIVE'],
  requestedGranularity: 'NONE',
  resolvedGranularity: 'NONE',
  supportLevel: 'DIRECT',
  assertiveness: 'STRONG',
  comparisonSupported: false,
  rankingSupported: false,
  forbidEventCertainty: false,
  ...over,
});

describe('buildGoldenGrounding', () => {
  it('unavailable scenario → unavailable grounding', () => {
    expect(buildGoldenGrounding({ available: false })).toEqual({ status: 'unavailable', reason: 'calculation_failed' });
  });

  it('available scenario carries the year/month anchors on 명리, engines-off for the rest', () => {
    const g = buildGoldenGrounding({ available: true, years: [2027], months: [202702], referenceYear: 2026 });
    expect(g.status).toBe('available');
    if (g.status !== 'available') throw new Error('unreachable');
    expect(g.evidence.myungri.timingAnchors).toEqual({ years: [2027], referenceYear: 2026, months: [202702] });
    expect(g.evidence.ziwei.availability).toBe('engine_not_connected');
    expect(g.evidence.qimen.availability).toBe('engine_not_connected');
  });

  it('referenceYear defaults to the first year when omitted', () => {
    const g = buildGoldenGrounding({ available: true, years: [2030, 2031] });
    if (g.status !== 'available') throw new Error('unreachable');
    expect(g.evidence.myungri.timingAnchors?.referenceYear).toBe(2030);
  });
});

describe('evaluateAnswerPlan — taxonomy mapping', () => {
  it('a fully-matching expectation → no failures', () => {
    expect(evaluateAnswerPlan(plan(), { intents: ['DESCRIPTIVE'], supportLevel: 'DIRECT' })).toEqual([]);
  });

  it('a missing required intent → WRONG_INTENT', () => {
    const f = evaluateAnswerPlan(plan({ intents: ['SUITABILITY'] }), { intents: ['COMPARISON'] });
    expect(f.map((x) => x.code)).toContain('WRONG_INTENT');
  });

  it('a wrong requestedGranularity → TEMPORAL_MISMATCH', () => {
    const f = evaluateAnswerPlan(plan({ requestedGranularity: 'NONE' }), { requestedGranularity: 'MONTH' });
    expect(f.map((x) => x.code)).toContain('TEMPORAL_MISMATCH');
  });

  it('NONE where ALTERNATIVE was required → MISSING_ALTERNATIVE', () => {
    const f = evaluateAnswerPlan(plan({ supportLevel: 'NONE' }), { supportLevel: 'ALTERNATIVE' });
    expect(f.map((x) => x.code)).toContain('MISSING_ALTERNATIVE');
  });

  it('a weaker-than-required support → UNDERASSERTIVE', () => {
    const f = evaluateAnswerPlan(plan({ supportLevel: 'PARTIAL' }), { supportLevel: 'DIRECT' });
    expect(f.map((x) => x.code)).toContain('UNDERASSERTIVE');
  });

  it('assertiveness below the allowed floor → UNDERASSERTIVE; above → OVERASSERTIVE', () => {
    expect(evaluateAnswerPlan(plan({ assertiveness: 'LIMITED' }), { assertivenessIn: ['STRONG', 'VERY_STRONG'] }).map((x) => x.code)).toContain('UNDERASSERTIVE');
    expect(evaluateAnswerPlan(plan({ assertiveness: 'VERY_STRONG' }), { assertivenessIn: ['LIMITED'] }).map((x) => x.code)).toContain('OVERASSERTIVE');
  });

  it('comparison/ranking permission mismatch → INVALID_COMPARISON / INVALID_RANKING', () => {
    expect(evaluateAnswerPlan(plan({ comparisonSupported: true }), { comparisonSupported: false }).map((x) => x.code)).toContain('INVALID_COMPARISON');
    expect(evaluateAnswerPlan(plan({ rankingSupported: true }), { rankingSupported: false }).map((x) => x.code)).toContain('INVALID_RANKING');
  });

  it('event-certainty mismatch → EVENT_DECISION_CONFUSION', () => {
    const f = evaluateAnswerPlan(plan({ forbidEventCertainty: false }), { forbidEventCertainty: true });
    expect(f.map((x) => x.code)).toContain('EVENT_DECISION_CONFUSION');
  });
});

describe('summarizeFailures', () => {
  it('counts by code', () => {
    const all: QualityFailure[] = [
      { code: 'WRONG_INTENT', field: 'a', expected: 1, actual: 2 },
      { code: 'WRONG_INTENT', field: 'b', expected: 1, actual: 2 },
      { code: 'MISSING_ALTERNATIVE', field: 'c', expected: 1, actual: 2 },
    ];
    expect(summarizeFailures(all)).toEqual({ WRONG_INTENT: 2, MISSING_ALTERNATIVE: 1 });
  });
});
