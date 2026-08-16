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

const STRUCTURED = JSON.stringify({
  coreSummary: '차분하지만 추진력 있는 흐름입니다.',
  disposition: '내면은 신중하고 계획적입니다.',
  coreInterpretation: '당신의 일간을 중심으로 보면 … (충분히 긴 개인화된 본문)',
  strengths: ['끈기', '분석력'],
  cautions: ['과로에 주의'],
  domainInterpretation: [
    { title: '일·직업·사업', body: '직업적으로는 …' },
    { title: '재물', body: '재물의 흐름은 …' },
  ],
  futureFlow: '대운 흐름상 …',
  followUps: ['언제 사업 확장이 유리한가요?', '올해와 내년 중 어느 쪽이 더 중요한가요?'],
});

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
      expect(vm.grounding.evidence.ziwei.availability).toBe('engine_not_connected');
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

  it('fail-closed: unsupported birth (2051) → structuredResult grounding UNAVAILABLE (no fabricated facts) (§21)', async () => {
    const svc = createChatService(adapterReturning(STRUCTURED), allow, groundingBuilder);
    const r = await svc.sendMessage(input('풀이', draft({ birthYear: '2051' })));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult?.grounding.status).toBe('unavailable');
  });

  it('five real consultation scenarios all populate structuredResult (§20)', async () => {
    const svc = createChatService(adapterReturning(STRUCTURED), allow, groundingBuilder);
    const questions = [
      '제 성격과 타고난 강점은 무엇인가요?',
      '직업과 사업운을 자세히 봐주세요.',
      '재물운과 돈이 들어오는 흐름을 알려주세요.',
      '앞으로의 흐름은 어떤가요?',
      '그럼 언제가 가장 중요한 시기인가요?',
    ];
    for (const q of questions) {
      const r = await svc.sendMessage(input(q, draft()));
      if (!r.success) throw new Error(`failed: ${q}`);
      expect(r.structuredResult).toBeDefined();
      expect(r.meta?.grounded).toBe(true);
    }
  });
});
