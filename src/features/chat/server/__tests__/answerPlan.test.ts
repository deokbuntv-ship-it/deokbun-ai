// Deterministic Decision Engine (Answer-Seeking V1.4 §5-§15). Pure. The SERVER decides intent / support /
// assertiveness / comparison-ranking-claim permissions from the question + the grounding's evidence
// inventory; the LLM only verbalizes. Locks the owner's live examples + the safety boundaries.
import { deriveAnswerPlan, renderAnswerPlanDirective } from '@/features/chat/server/answerPlan';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';

// Minimal available grounding with the given year/month anchors (year*100+month).
const g = (years: number[], months: number[] = [], referenceYear = 2026): ConsultationGrounding => ({
  status: 'available',
  evidence: {
    myungri: {
      availability: 'available',
      summary: '사주 …',
      sections: [{ label: '명식', lines: ['년 癸卯'] }],
      hasTimingEvidence: true,
      timingAnchors: { years, referenceYear, ...(months.length ? { months } : {}) },
    },
    ziwei: { availability: 'engine_not_connected' as never },
    qimen: { availability: 'engine_not_connected' as never },
  },
});
const UNAVAILABLE: ConsultationGrounding = { status: 'unavailable', reason: 'calculation_failed' };

describe('deriveAnswerPlan — the server owns the decision', () => {
  it('EXACT month grounded → SUITABILITY, DIRECT month, STRONG', () => {
    const p = deriveAnswerPlan('2027년 2월에 이사하면 어때?', g([2026, 2027], [202702]));
    expect(p.intents).toEqual(expect.arrayContaining(['SUITABILITY', 'TIMING']));
    expect(p.requestedGranularity).toBe('MONTH');
    expect(p.resolvedGranularity).toBe('MONTH');
    expect(p.supportLevel).toBe('DIRECT');
    expect(p.assertiveness).toBe('STRONG');
    expect(p.comparisonSupported).toBe(false);
  });

  it('month-vs-month with BOTH grounded → comparisonSupported (candidate capability), but STRONG not VERY_STRONG (Option B — no winner)', () => {
    const p = deriveAnswerPlan('2027년 2월이 좋아 5월이 좋아?', g([2026, 2027], [202702, 202705]));
    expect(p.intents).toContain('COMPARISON');
    expect(p.comparisonSupported).toBe(true); // candidates ARE grounded (discuss each) …
    expect(p.supportLevel).toBe('DIRECT');
    expect(p.assertiveness).toBe('STRONG'); // … but permission never escalates certainty to VERY_STRONG
  });

  it('BEST month over 12 grounded → rankingSupported (candidate capability), STRONG not VERY_STRONG (Option B — no 1순위)', () => {
    const months = Array.from({ length: 12 }, (_, i) => 202701 + i);
    const p = deriveAnswerPlan('2027년에 이사 언제 하는 게 제일 좋아?', g([2027], months));
    expect(p.intents).toContain('RANKING');
    expect(p.rankingSupported).toBe(true);
    expect(p.assertiveness).toBe('STRONG');
  });

  it('month requested but NOT grounded, year IS → ALTERNATIVE, LIMITED (best-supported-alternative)', () => {
    const p = deriveAnswerPlan('2027년 2월에 이사하면 어때?', g([2026, 2027], [])); // year 2027 grounded, no months
    expect(p.requestedGranularity).toBe('MONTH');
    expect(p.resolvedGranularity).toBe('YEAR');
    expect(p.supportLevel).toBe('ALTERNATIVE');
    expect(p.assertiveness).toBe('LIMITED');
  });

  it('EVENT_PREDICTION → forbidEventCertainty, but still a usable timing/suitability plan', () => {
    const p = deriveAnswerPlan('2027년에 이사하게 돼?', g([2026, 2027]));
    expect(p.intents).toContain('EVENT_PREDICTION');
    expect(p.forbidEventCertainty).toBe(true);
  });

  it('a comparison with only ONE side grounded is NOT comparisonSupported (§12)', () => {
    const p = deriveAnswerPlan('2027년 2월이 좋아 5월이 좋아?', g([2027], [202702])); // only Feb grounded
    expect(p.intents).toContain('COMPARISON');
    expect(p.comparisonSupported).toBe(false); // cannot pick a winner without both
  });

  it('a non-temporal descriptive question with grounding → DESCRIPTIVE, DIRECT, STRONG', () => {
    const p = deriveAnswerPlan('내 사업운 어때?', g([2026]));
    expect(p.requestedGranularity).toBe('NONE');
    expect(p.supportLevel).toBe('DIRECT');
    expect(['STRONG', 'VERY_STRONG']).toContain(p.assertiveness);
  });

  it('no grounding at all → NONE support, LIMITED (never fabricate confidence)', () => {
    const p = deriveAnswerPlan('2027년 2월에 이사하면 어때?', UNAVAILABLE);
    expect(p.supportLevel).toBe('NONE');
    expect(p.assertiveness).toBe('LIMITED');
    expect(p.comparisonSupported).toBe(false);
    expect(p.rankingSupported).toBe(false);
  });
});

describe('renderAnswerPlanDirective — server decision → prompt (no field names leak to the user)', () => {
  it('supported comparison → tells the model to DISCUSS each candidate, NOT pick a winner (Option B)', () => {
    const d = renderAnswerPlanDirective(deriveAnswerPlan('2027년 2월이 좋아 5월이 좋아?', g([2027], [202702, 202705])));
    expect(d).toContain('결론을 맨 먼저');
    expect(d).toMatch(/나란히 설명|각 후보/); // discuss each
    expect(d).toMatch(/단정하지/); // no winner
    // The winner-authorizing phrasings from the old VERY_STRONG/comparison directive are GONE.
    expect(d).not.toContain('더 나은 쪽을 고르십시오');
    expect(d).not.toContain('1순위 또는 상위 그룹을 제시');
    expect(d).not.toContain('1순위로 추천');
  });

  it('EVENT_PREDICTION → tells the model NOT to guarantee the event, answer suitability instead', () => {
    const d = renderAnswerPlanDirective(deriveAnswerPlan('2027년에 이사하게 돼?', g([2027])));
    expect(d).toMatch(/사건.*확정하지|반드시 이사/); // "사건의 발생 자체를 확정하지 마십시오"
    expect(d).toMatch(/적합도/); // "시기 적합도로 답하십시오"
  });

  it('does not leak internal enum names to what would be the user text', () => {
    const d = renderAnswerPlanDirective(deriveAnswerPlan('2027년 2월에 이사하면 어때?', g([2027], [202702])));
    for (const t of ['DIRECT', 'VERY_STRONG', 'supportLevel', 'assertiveness', 'ALTERNATIVE'])
      expect(d).not.toContain(t);
  });
});
