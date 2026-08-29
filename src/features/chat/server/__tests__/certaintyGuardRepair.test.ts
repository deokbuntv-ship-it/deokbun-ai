// CERTAINTY_GUARD_REPAIR — 100-case live QA (commit 4925813) found the certainty/Option-B guard rejecting
// legitimate, grounded, decisive single-option answers because `deriveAnswerPlan`'s comparison classifier
// (`COMPARE_CUE`) fired on a bare, single "나아"/"낫" with no second named candidate ("지금 직장에서 버티는
// 게 나아?"), forcing `forbidWinner: true` onto a question that was never an A-vs-B comparison. Proves the
// fix end to end (plan → guard) and that the guard's REAL protections — unsupported certainty, fabricated
// exact dates, genuine winner declarations for actual comparisons — are all still intact.
import { deriveAnswerPlan } from '@/features/chat/server/answerPlan';
import { classifyWithGuards } from '@/features/chat/server/certaintyGuard';
import { GROUNDING_UNAVAILABLE, type ConsultationGrounding } from '@/features/chat/prompts/grounding';

const g = (years: number[] = [2026]): ConsultationGrounding => ({
  status: 'available',
  evidence: {
    myungri: { availability: 'available', summary: '사주', sections: [{ label: '명식', lines: ['년 癸卯'] }], hasTimingEvidence: true, timingAnchors: { years, referenceYear: 2026 } },
    ziwei: { availability: 'engine_not_connected' as never },
    qimen: { availability: 'engine_not_connected' as never },
  },
});

// >120 chars so the card passes the substance gate (matches the established pattern in optionBGuard.test.ts).
const LONG = '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const card = (summary: string) => JSON.stringify({ coreSummary: summary, coreInterpretation: `${summary} ${LONG}`, strengths: ['끈기'] });

describe('the exact reproduced bug: single-option question no longer forces forbidWinner', () => {
  it('"지금 직장에서 버티는 게 나아?" — the plan no longer forbids a winner', () => {
    const plan = deriveAnswerPlan('지금 직장에서 버티는 게 나아?', g());
    expect(plan.intents.includes('COMPARISON') || plan.intents.includes('RANKING')).toBe(false);
  });

  it('...so a grounded single-course directional judgment for that question is ACCEPTED (was SEMANTIC_REJECTED before the fix)', async () => {
    const claim = '지금은 버티며 범위를 줄이는 쪽이 유리합니다.';
    const plan = deriveAnswerPlan('지금 직장에서 버티는 게 나아?', g());
    const forbidWinner = plan.intents.includes('COMPARISON') || plan.intents.includes('RANKING');
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });

  it('REGRESSION — a genuine comparison ("A보다 B가 나아?") still forbids a winner', () => {
    const plan = deriveAnswerPlan('회사원보다 독립이 더 맞아?', g());
    expect(plan.intents).toContain('COMPARISON');
  });

  it('...and an actual winner declaration for that genuine comparison is still rejected', async () => {
    const out = await classifyWithGuards({
      raw: card('독립이 회사원보다 더 낫습니다.'), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: true,
      regenerate: async () => card('독립이 회사원보다 더 낫습니다.'),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });
});

describe('§6 required negative tests — unsupported certainty is still rejected (guard untouched)', () => {
  const UNSUPPORTED = [
    '반드시 성공합니다.',
    '무조건 성사됩니다.',
    '100% 벌게 됩니다.',
    '틀림없이 합격합니다.',
    '9월 17일에 반드시 계약됩니다.',
  ];
  it.each(UNSUPPORTED)('"%s" → rejected even for a plain (non-comparison) question', async (claim) => {
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: false,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('Cross = MIXED but prose reads as an unconditional guarantee → still rejected (verdict-strength guard untouched)', async () => {
    const out = await classifyWithGuards({
      raw: card('결론적으로 무조건 잘 됩니다.'), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: false,
      regenerate: async () => card('결론적으로 무조건 잘 됩니다.'),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('an UNRESOLVED-style question still rejects an absolute-certainty claim', async () => {
    const out = await classifyWithGuards({
      raw: card('확실히 성공합니다.'), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: false,
      regenerate: async () => card('확실히 성공합니다.'),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });
});

describe('§7 required positive tests — grounded decisive/compound phrasing is accepted', () => {
  const SUPPORTED = [
    '현재는 진행하는 쪽이 더 유리합니다.',
    '지금은 확장보다 보수적으로 운영하는 쪽이 낫습니다.',
    '기회는 있지만 지금 바로 크게 확장하기에는 부담도 큽니다.',
    '연락 가능성은 있지만 안정적인 재결합은 별개로 봐야 합니다.',
    '수입을 만드는 힘은 있으나 남기는 구조에는 주의가 필요합니다.',
  ];
  it.each(SUPPORTED)('"%s" → accepted for a non-comparison question (not rejected merely for being decisive)', async (claim) => {
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: false,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });
});
