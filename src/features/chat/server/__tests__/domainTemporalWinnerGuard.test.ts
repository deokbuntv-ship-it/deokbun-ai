// DOMAIN_TEMPORAL_WINNER_GUARD — the QA-confirmed defect: IMPLICIT_WINNER's soft comparative language
// ("~쪽이 유리합니다", "~하는 편이 낫습니다") was unconditionally forbidden for EVERY comparison, whether
// TEMPORAL (month/year — where V1 genuinely has zero winner authority, protected by the existing 42-case
// implicitWinnerCorpus.test.ts) or DOMAIN (career/business/money — where real Cross-verdict evidence can
// exist). Proves: (1) `deriveAnswerPlan` classifies comparisonKind server-side, from the question's own
// resolved month/year requests only, never LLM prose; (2) `classifyWithGuards` only relaxes for a DOMAIN
// comparison AND an explicit `domainComparisonAllowed:true` (the caller's own responsibility to derive from
// a REAL, already-computed Cross verdict — never inferred here); (3) the harder WINNER_CLAIM declarations
// and all non-winner guards (certainty/consensus/timing) stay completely unconditional either way.
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
const LONG = '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const card = (summary: string) => JSON.stringify({ coreSummary: summary, coreInterpretation: `${summary} ${LONG}`, strengths: ['끈기'] });

describe('deriveAnswerPlan.comparisonKind — server-owned, from the question only', () => {
  it('a domain comparison ("보다", no named month/year) → DOMAIN', () => {
    expect(deriveAnswerPlan('투자보다 본업 확대가 나아?', g()).comparisonKind).toBe('DOMAIN');
    expect(deriveAnswerPlan('회사원보다 독립이 더 맞아?', g()).comparisonKind).toBe('DOMAIN');
    expect(deriveAnswerPlan('직장 vs 사업 뭐가 더 좋아?', g()).comparisonKind).toBe('DOMAIN');
  });

  it('a month comparison → TEMPORAL', () => {
    expect(deriveAnswerPlan('2027년 2월이 좋아 5월이 좋아?', g([2027])).comparisonKind).toBe('TEMPORAL');
  });

  it('a year comparison → TEMPORAL', () => {
    expect(deriveAnswerPlan('2027년이 나아 2028년이 나아?', g([2027, 2028])).comparisonKind).toBe('TEMPORAL');
  });

  it('a non-comparison question → NONE', () => {
    expect(deriveAnswerPlan('내 성격이 어때?', g()).comparisonKind).toBe('NONE');
  });
});

describe('classifyWithGuards — domainComparisonAllowed gates ONLY the soft IMPLICIT_WINNER language', () => {
  const SOFT_DOMAIN_LEAN = [
    '지금은 확장보다 안정화 쪽이 낫습니다.',
    '회사에 남는 것보다 독립 쪽에 조금 더 무게가 실립니다.',
    '투자보다 본업 확대 쪽이 유리합니다.',
    '먼저 연락하기보다 상황을 지켜보는 쪽이 낫습니다.',
    '현재는 독립보다 기존 직장을 유지하는 편이 낫습니다.',
  ];
  it.each(SOFT_DOMAIN_LEAN)('DOMAIN + supported (FAVORABLE-equivalent): "%s" → ACCEPT', async (claim) => {
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: true,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });

  it('DOMAIN + supported CAUTION direction (same soft lean, requireMitigation on) → ACCEPT', async () => {
    const claim = '지금은 확장보다 안정화 쪽이 낫습니다. 무리하게 벌이면 손해로 이어지기 쉬우니 주의하세요.';
    const out = await classifyWithGuards({
      raw: JSON.stringify({ coreSummary: claim, coreInterpretation: `${claim} ${LONG}`, cautions: ['무리한 확장은 피하세요.'] }),
      grounding: GROUNDING_UNAVAILABLE, requireMitigation: true, forbidWinner: true, domainComparisonAllowed: true,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });

  it('DOMAIN + MIXED qualified direction (decisive-with-qualification, evidence preserved) → ACCEPT', async () => {
    const claim = '확장 가능성은 있지만 지금은 크게 키우기보다 작게 실행하는 쪽에 무게가 실립니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: true,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });

  it.each(SOFT_DOMAIN_LEAN)('DOMAIN + UNRESOLVED (domainComparisonAllowed:false) → REJECT: "%s"', async (claim) => {
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: false,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('DOMAIN + UNRESOLVED — a manufactured winner is rejected even with "확실히" framing', async () => {
    const claim = '독립하는 편이 확실히 낫습니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: false,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  const ABSOLUTE_GUARANTEE = [
    '무조건 독립해서 성공합니다.',
    '반드시 사업을 확장해서 잘 됩니다.',
    '100% 이직하면 성공합니다.',
  ];
  it.each(ABSOLUTE_GUARANTEE)('DOMAIN + absolute guarantee (even with domainComparisonAllowed:true) → REJECT: "%s"', async (claim) => {
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: true,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('DOMAIN + supported — an explicit WINNER_CLAIM-shaped declaration is STILL rejected (only the soft tier relaxes)', async () => {
    const claim = '독립이 회사원보다 낫습니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: true,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('TEMPORAL comparison — domainComparisonAllowed is never set true by the real call site, and even if it were, an unsupported month winner stays rejected only when NOT gated — regression: strict-by-default still rejects', async () => {
    const claim = '2월보다 5월이 더 좋습니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: false,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('TEMPORAL — unsupported year winner ("올해보다 내년이 유리합니다") stays rejected under the default/unknown gate', async () => {
    const claim = '올해보다 내년이 유리합니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: false,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('UNKNOWN comparison context (domainComparisonAllowed omitted entirely) → fail-closed strict, matches default', async () => {
    const claim = '지금은 확장보다 안정화 쪽이 낫습니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: true,
      // domainComparisonAllowed intentionally omitted
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });

  it('non-winner guards stay fully active regardless of domainComparisonAllowed (no raw-keyword-only bypass)', async () => {
    const claim = '무조건 성사됩니다.'; // general certainty guarantee, unrelated to winner claims
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: true,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });
});
