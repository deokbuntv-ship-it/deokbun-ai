// Sprint C.1 §7/§12/§13 — the FULL prompt contains no winner authorization; the deterministic output guard
// blocks adversarial winner prose; and the plan + ResolvedTemporalContext resolve the SAME month target.
import { buildPrompt } from '@/features/chat/prompts/promptBuilder';
import { classifyConsultationMode } from '@/features/chat/prompts/consultationMode';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import { deriveAnswerPlan, renderAnswerPlanDirective } from '@/features/chat/server/answerPlan';
import { classifyWithGuards } from '@/features/chat/server/certaintyGuard';
import { buildResolvedTemporalContext } from '@/features/chat/server/resolvedTemporalContext';
import { GROUNDING_UNAVAILABLE, type ConsultationGrounding, type TargetPolarity } from '@/features/chat/prompts/grounding';
import type { BirthInfoDraft } from '@/features/consultation';

const birth: BirthInfoDraft = { displayName: '본인', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
const draft = { subject: { id: 'self', displayName: '본인', relationship: null }, birthInfo: birth };

const g = (years: number[], months: number[] = [], referenceYear = 2027, referenceMonth?: number): ConsultationGrounding => ({
  status: 'available',
  ...(referenceMonth ? { referenceMonth } : {}),
  ...(months.length ? { targetPolarities: months.map((m): TargetPolarity => ({ granularity: 'MONTH', targetKey: m, polarity: 'STEADY' })) } : {}),
  evidence: {
    myungri: { availability: 'available', summary: '사주', sections: [{ label: '명식', lines: ['년 癸卯'] }], hasTimingEvidence: true, timingAnchors: { years, referenceYear, ...(months.length ? { months } : {}) } },
    ziwei: { availability: 'engine_not_connected' as never },
    qimen: { availability: 'engine_not_connected' as never },
  },
});

function fullPromptSystemText(question: string, grounding: ConsultationGrounding): string {
  const ctx = selectConsultationContext(draft);
  if (ctx === null) throw new Error('no context');
  const plan = deriveAnswerPlan(question, grounding);
  const messages = buildPrompt({
    selectedContext: ctx,
    conversationSummary: null,
    recentMessages: [],
    currentUserMessage: question,
    mode: classifyConsultationMode(question, false),
    grounding,
    answerPlanDirective: renderAnswerPlanDirective(plan),
  });
  return messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
}

describe('§12 FULL-prompt contract — no winner authorization anywhere in the stack', () => {
  const BANNED = [
    '더 나은 쪽을 고르십시오',
    '1순위 또는 상위 그룹을 제시',
    '먼저 추천합니다', // "…을 먼저 추천합니다" ranked-recommendation
    '5월보다 7월이 더 유리',
    '2월을 먼저 추천',
    '이 시기가 더 유리합니다',
  ];
  it('solo comparison question → complete prompt has NO winner-authorizing instruction', () => {
    const text = fullPromptSystemText('2027년 2월이 좋아 5월이 좋아?', g([2027], [202702, 202705]));
    for (const b of BANNED) expect(text).not.toContain(b);
    expect(text).toMatch(/승자로 단정하지 마/); // the shared prompt now forbids a winner
  });
  it('ranking question → complete prompt forbids 1순위/order', () => {
    const text = fullPromptSystemText('2027년에 언제가 제일 좋아?', g([2027], Array.from({ length: 12 }, (_, i) => 202701 + i)));
    for (const b of BANNED) expect(text).not.toContain(b);
    expect(text).toMatch(/1순위|순위/); // present only in the FORBIDDING sense
    expect(text).toMatch(/단정하지 마|만들지 마/);
  });
});

// >120 chars so the card passes the substance gate; NO year-timing so the timing validator does not preempt
// the winner guard (bare "N월" / domain words carry no groundable year).
const LONG = '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const card = (summary: string) => JSON.stringify({ coreSummary: summary, coreInterpretation: `${summary} ${LONG}`, strengths: ['끈기'] });

describe('§13 adversarial output guard — invented winner prose is blocked', () => {
  const WINNERS = [
    '5월이 2월보다 더 좋습니다.',
    '두 번째 후보가 1순위입니다.',
    '사업이 직장보다 더 낫습니다.',
    '이쪽이 저쪽보다 더 유리합니다.',
    '가장 좋은 시기는 5월입니다.',
    '가장 나쁜 시기는 8월입니다.',
  ];
  it.each(WINNERS)('"%s" → rejected; one regeneration; persistent → safe fallback', async (claim) => {
    const raw = card(claim);
    const out = await classifyWithGuards({ raw, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: true, regenerate: async () => raw });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
    expect(out.guardRejected).toBe(true);
  });

  it('safe non-winner phrasing is NOT rejected', async () => {
    for (const safe of ['어느 한쪽이 더 낫다고 단정하지 않습니다.', '1순위를 정할 근거는 없습니다.']) {
      const out = await classifyWithGuards({ raw: card(safe), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: true, regenerate: async () => card(safe) });
      expect(out.outcome.kind).toBe('ACCEPTED');
    }
  });

  it('a clean regeneration after a winner claim is accepted (exactly one retry)', async () => {
    let calls = 0;
    const out = await classifyWithGuards({
      raw: card('5월이 2월보다 더 좋습니다.'),
      grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: true,
      regenerate: async () => { calls += 1; return card('두 시기 모두 근거를 확인할 수 있습니다.'); },
    });
    expect(calls).toBe(1);
    expect(out.outcome.kind).toBe('ACCEPTED');
    expect(out.regenerated).toBe(true);
  });

  it('a non-comparison answer is accepted (forbidWinner=false) — the guard is scoped to comparison/ranking', async () => {
    const out = await classifyWithGuards({ raw: card('전반적으로 안정적인 흐름입니다.'), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false, forbidWinner: false, regenerate: async () => card('전반적으로 안정적인 흐름입니다.') });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });
});

describe('§7 plan target === ResolvedTemporalContext target (no referenceMonth=null mismatch)', () => {
  const NOW = Math.floor(Date.UTC(2026, 7, 15, 1, 0, 0) / 1000);
  it('이번 달 resolves to the same civil month in both', () => {
    const grounding = g([2026], [202608], 2026, 8);
    const plan = deriveAnswerPlan('이번 달 직업운 어때?', grounding);
    expect(plan.polarity).toBe('STEADY'); // 202608 grounded target
    const ctx = buildResolvedTemporalContext('이번 달 직업운 어때?', NOW, grounding);
    expect(ctx.referenceMonth).toBe(8);
    expect(ctx.resolvedTargets).toContain(202608);
  });
  it('다음 달 resolves to next civil month (rollover-safe) in both', () => {
    const grounding = g([2026], [202609], 2026, 8);
    const plan = deriveAnswerPlan('다음 달은 어때?', grounding);
    expect(plan.polarity).toBe('STEADY'); // 202609 grounded target
    const ctx = buildResolvedTemporalContext('다음 달은 어때?', NOW, grounding);
    expect(ctx.resolvedTargets).toContain(202609);
  });
});
