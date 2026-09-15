// Sprint C §9-§11, §14 — RANKING/COMPARISON Option B: the LLM is NEVER authorized to manufacture a
// winner / 1순위 / best / order, because V1 has no server-decided temporal result. Red-team of the plan +
// directive: prove no authority-to-choose leaks through.
import { deriveAnswerPlan, renderAnswerPlanDirective } from '@/features/chat/server/answerPlan';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';

const g = (years: number[], months: number[] = [], referenceYear = 2027): ConsultationGrounding => ({
  status: 'available',
  evidence: {
    myungri: {
      availability: 'available', summary: '사주 명식 요약',
      sections: [{ label: '명식', lines: ['년 癸卯 · 일 丙寅'] }],
      hasTimingEvidence: true,
      timingAnchors: { years, referenceYear, ...(months.length ? { months } : {}) },
    },
    ziwei: { availability: 'engine_not_connected' as never },
    qimen: { availability: 'engine_not_connected' as never },
  },
});
const year12 = (y: number) => Array.from({ length: 12 }, (_, i) => y * 100 + (i + 1));

// The winner-authorizing phrasings that must NEVER appear in any directive.
const WINNER_AUTHORITY = ['더 나은 쪽을 고르십시오', '1순위 또는 상위 그룹을 제시', '1순위로 추천', '1순위를 제시', '더 나은 쪽을 골라'];

describe('Option B — comparison question cannot authorize a winner', () => {
  const cases = [
    ['month-vs-month (both grounded)', '2027년 2월이 좋아 5월이 좋아?', g([2027], [202702, 202705])],
    ['year-vs-year (both grounded)', '2027년이 나아 2028년이 나아?', g([2027, 2028], [], 2027)],
  ] as const;

  it.each(cases)('%s → comparisonSupported (capability) but directive picks NO winner', (_label, q, grounding) => {
    const plan = deriveAnswerPlan(q, grounding);
    expect(plan.comparisonSupported).toBe(true); // candidates grounded → discuss each
    const d = renderAnswerPlanDirective(plan);
    for (const banned of WINNER_AUTHORITY) expect(d).not.toContain(banned);
    expect(d).toMatch(/나란히 설명|각 후보/); // discuss each candidate
    expect(d).toMatch(/단정하지 마십시오/); // explicit no-winner
  });
});

describe('Option B — ranking question cannot authorize a top/1순위/order', () => {
  it('best-month over all 12 grounded → rankingSupported but directive forbids 1순위/score/order', () => {
    const plan = deriveAnswerPlan('2027년에 이사 언제가 제일 좋아?', g([2027], year12(2027)));
    expect(plan.rankingSupported).toBe(true);
    const d = renderAnswerPlanDirective(plan);
    for (const banned of WINNER_AUTHORITY) expect(d).not.toContain(banned);
    expect(d).toMatch(/순위·점수·등급을 만들지 마십시오/); // §14 no invented ranking score
    expect(d).toMatch(/하나로 단정하지 마십시오/);
  });
});

describe('Option B — domain comparison has no temporal winner', () => {
  it('"직장과 사업 중 뭐가 나아?" → recognized COMPARISON, NOT temporally supported, no winner directive', () => {
    const plan = deriveAnswerPlan('직장과 사업 중 뭐가 나아?', g([2026]));
    expect(plan.intents).toContain('COMPARISON');
    expect(plan.comparisonSupported).toBe(false); // no ≥2 grounded temporal candidates
    const d = renderAnswerPlanDirective(plan);
    for (const banned of WINNER_AUTHORITY) expect(d).not.toContain(banned);
    expect(d).toMatch(/승자로 단정하지 말고/);
  });
});

describe('Option B — structural guarantees', () => {
  it('assertiveness is NEVER VERY_STRONG (ranking/comparison permission no longer escalates certainty)', () => {
    const questions = [
      '2027년 2월이 좋아 5월이 좋아?',
      '2027년에 이사 언제가 제일 좋아?',
      '2027년이 나아 2028년이 나아?',
      '앞으로 3년 중 재물운이 가장 좋은 해는?',
    ];
    for (const q of questions) {
      expect(deriveAnswerPlan(q, g([2026, 2027, 2028], year12(2027), 2026)).assertiveness).not.toBe('VERY_STRONG');
    }
  });

  it('the AnswerPlan carries NO winner / rank / order / best-period / score field', () => {
    const plan = deriveAnswerPlan('2027년 2월이 좋아 5월이 좋아?', g([2027], [202702, 202705]));
    for (const k of ['winner', 'loser', 'rank', 'ranking', 'orderedCandidates', 'bestPeriod', 'worstPeriod', 'score', 'comparisonResult']) {
      expect(plan).not.toHaveProperty(k);
    }
    // The comparison/ranking outputs are booleans (permission), never a result value.
    expect(typeof plan.comparisonSupported).toBe('boolean');
    expect(typeof plan.rankingSupported).toBe('boolean');
  });
});
