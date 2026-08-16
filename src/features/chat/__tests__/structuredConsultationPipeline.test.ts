// FULL production pipeline E2E (sprint §19/§20/§21): chatService → grounding (frozen engine) →
// prompt → LLM boundary (mocked) → structured parse/validate → ChatMessage.structuredResult.
// Only the LLM network call is mocked (§10); grounding/prompt/parse are the real production path.
import { createHash } from 'crypto';

import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import { createChatService } from '@/features/chat/services/chatService';
import { createSajuGroundingBuilder } from '@/features/chat/services/consultationGrounding';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000);
const groundingBuilder = createSajuGroundingBuilder({ digestProvider, nowEpochSeconds: NOW });
const allow = () => true;

// A long-form structured answer (coreInterpretation is substantial — passes the substance gate).
const LONG_CORE =
  '당신의 일간을 중심으로 보면 전반적으로 차분하면서도 필요한 순간에는 추진력을 내는 균형형입니다. ' +
  '월지의 기운과 십신 배치를 함께 보면, 꾸준히 쌓아 올리는 방식이 잘 맞고 조급하게 결과를 좇을 때 ' +
  '오히려 흐름이 흐트러지기 쉽습니다. 관계에서는 신뢰를 바탕으로 오래가는 인연을 만드는 편입니다.';
const structuredJson = (over: Record<string, unknown> = {}): string =>
  JSON.stringify({
    coreSummary: '차분하지만 추진력 있는 흐름입니다.',
    disposition: '내면은 신중하고 계획적입니다.',
    coreInterpretation: LONG_CORE,
    strengths: ['끈기', '분석력'],
    cautions: ['과로에 주의'],
    domainInterpretation: [
      { title: '일·직업·사업', body: '직업적으로는 전문성을 축적하는 흐름이 강합니다.' },
      { title: '재물', body: '재물은 급등보다 꾸준한 축적형입니다.' },
    ],
    followUps: ['언제 사업 확장이 유리한가요?', '올해와 내년 중 어느 쪽이 더 중요한가요?'],
    ...over,
  });
const STRUCTURED = structuredJson();

const adapterReturning = (text: string): LLMAdapter => ({
  async generateResponse() {
    return { text };
  },
});

const draft = (over: Record<string, unknown> = {}): ConsultationDraft =>
  ({
    subject: { id: 's1', displayName: '테스트', relationship: null },
    birthInfo: {
      displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
      birthYear: '2024', birthMonth: '1', birthDay: '3',
      birthTimeAccuracy: 'exact', birthHour: '12', birthMinute: '0',
      approximateTimePeriod: null, birthPlace: '서울', ...over,
    },
  }) as unknown as ConsultationDraft;

const input = (userMessage: string, d: ConsultationDraft): ChatServiceInput => ({
  userMessage, draft: d, messages: [], conversationMemory: { summary: null, lastSummarizedMessageId: null },
});

describe('structured consultation pipeline — end to end', () => {
  it('structured JSON → ChatMessage.structuredResult with parsed long-form + REAL grounding facts', async () => {
    const svc = createChatService(adapterReturning(STRUCTURED), allow, groundingBuilder);
    const r = await svc.sendMessage(input('제 성격과 타고난 강점은 무엇인가요?', draft()));
    expect(r.success).toBe(true);
    if (!r.success) return;
    const vm = r.structuredResult;
    expect(vm).toBeDefined();
    if (!vm) return;
    expect(vm.coreInterpretation).toContain('일간');
    expect(vm.strengths).toEqual(['끈기', '분석력']);
    expect(vm.followUps).toHaveLength(2);
    expect(vm.grounding.status).toBe('available');
    if (vm.grounding.status === 'available') {
      expect(vm.grounding.evidence.myungri.summary).toContain('癸卯');
      expect(vm.grounding.evidence.myungri.summary).toContain('甲子');
      expect(vm.grounding.evidence.myungri.summary).toContain('丙寅');
      expect(vm.grounding.evidence.ziwei.availability).toBe('available'); // Ziwei now wired (dual-engine)
      expect(vm.grounding.evidence.ziwei.summary).toContain('命宮');
      expect(vm.grounding.evidence.qimen.availability).toBe('engine_not_connected'); // Qimen stays unconnected
    }
    expect(vm.assessment.status).toBe('unavailable'); // fail-closed, no fabricated 15-axis score
    expect(r.responseText).toContain('일간'); // readable plain-text mirror for persistence
  });

  it('malformed / prose output → NO structuredResult, plain-text fallback (no crash) (§13)', async () => {
    const svc = createChatService(adapterReturning('그냥 평범한 문장 답변입니다.'), allow, groundingBuilder);
    const r = await svc.sendMessage(input('제 성격은?', draft()));
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.structuredResult).toBeUndefined();
    expect(r.responseText).toBe('그냥 평범한 문장 답변입니다.');
  });

  it('empty structured object → NO structuredResult (substance gate)', async () => {
    const svc = createChatService(adapterReturning('{"followUps":["a"]}'), allow, groundingBuilder);
    const r = await svc.sendMessage(input('제 성격은?', draft()));
    if (!r.success) return;
    expect(r.structuredResult).toBeUndefined();
  });

  it('solar vs lunar birth → IDENTICAL grounding evidence inside structuredResult', async () => {
    const svc = createChatService(adapterReturning(STRUCTURED), allow, groundingBuilder);
    const solar = await svc.sendMessage(input('풀이', draft()));
    const lunar = await svc.sendMessage(
      input('풀이', draft({ calendarType: 'lunar', birthYear: '2023', birthMonth: '11', birthDay: '22' })),
    );
    if (!solar.success || !lunar.success) throw new Error('unexpected');
    const gs = solar.structuredResult?.grounding;
    const gl = lunar.structuredResult?.grounding;
    if (gs?.status === 'available' && gl?.status === 'available') {
      expect(gl.evidence.myungri.summary).toBe(gs.evidence.myungri.summary);
    } else {
      throw new Error('expected available grounding');
    }
  });

  it('fail-closed: unsupported birth (2051) + unknown time → BOTH engines unavailable → grounding UNAVAILABLE (§21)', async () => {
    // 2051 is out of the frozen Saju range AND unknown time makes Ziwei missing_birth_time → neither
    // engine produces facts, so nothing is fabricated and the grounding is unavailable.
    const svc = createChatService(adapterReturning(STRUCTURED), allow, groundingBuilder);
    const r = await svc.sendMessage(input('풀이', draft({ birthYear: '2051', birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null })));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult?.grounding.status).toBe('unavailable');
  });

  it('five real consultation scenarios — DISTINCT grounded structuredResults (§12/§20)', async () => {
    const scenarios: { q: string; json: string; expectText?: string; expectFuture?: boolean }[] = [
      { q: '제 성격과 타고난 강점은 무엇인가요?', json: structuredJson({ strengths: ['공감력', '인내심'] }), expectText: '공감력' },
      { q: '직업과 사업운을 자세히 봐주세요.', json: structuredJson({ domainInterpretation: [{ title: '일·직업·사업', body: '리더십이 발휘되는 직군이 유리합니다.' }] }), expectText: '리더십' },
      { q: '재물운과 돈이 들어오는 흐름을 알려주세요.', json: structuredJson({ domainInterpretation: [{ title: '재물', body: '중년 이후 축적이 강해지는 흐름입니다.' }] }), expectText: '축적' },
      { q: '앞으로의 흐름은 어떤가요?', json: structuredJson({ futureFlow: '대운 흐름상 향후 몇 년은 안정적으로 상승하는 편입니다.' }), expectFuture: true },
      { q: '그럼 언제가 가장 중요한 시기인가요?', json: structuredJson({ futureFlow: '세운 기준 올해가 하나의 분기점으로 보입니다.' }), expectFuture: true },
    ];
    for (const s of scenarios) {
      const svc = createChatService(adapterReturning(s.json), allow, groundingBuilder);
      const r = await svc.sendMessage(input(s.q, draft()));
      if (!r.success) throw new Error(`failed: ${s.q}`);
      expect(r.structuredResult).toBeDefined();
      expect(r.meta?.grounded).toBe(true);
      if (s.expectText) expect(r.responseText).toContain(s.expectText);
      // futureFlow accepted because the grounding carries 대운/세운/월운 timing evidence (FIX #8).
      if (s.expectFuture) expect(r.structuredResult?.futureFlow).toBeTruthy();
    }
  });
});
