// Activation 04E — consultation analytics wiring. consultation_started on a legitimate request begin;
// consultation_completed ONLY on a successful accepted server response; neither on empty/invalid input;
// non-blocking; no prompt/answer text in properties.
const track = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/productEvents', () => ({ trackProductEvent: (...a: unknown[]) => track(...a) }));

import { createServerConsultationService } from '@/features/chat/services/createServerConsultationService';
import type { ConsultationTransport, ConsultationTransportResult } from '@/features/chat/services/consultationTransport';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';

const input = (over: Partial<ChatServiceInput> = {}): ChatServiceInput => ({
  userMessage: '올해 저의 흐름은 어떤가요?',
  draft: { subject: { id: 's1', displayName: '나', relationship: null }, birthInfo: {
    displayName: '나', gender: 'female', calendarType: 'solar', lunarMonthType: null, birthYear: '1990',
    birthMonth: '5', birthDay: '12', birthTimeAccuracy: 'exact', birthHour: '10', birthMinute: '30',
    approximateTimePeriod: null, birthPlace: '서울' } },
  messages: [],
  conversationMemory: { summary: null, lastSummarizedMessageId: null },
  ...over,
});
function transport(result: ConsultationTransportResult): ConsultationTransport {
  return { async requestConsultation() { return result; } };
}
const names = () => track.mock.calls.map((c) => c[0]);

beforeEach(() => { track.mockReset(); track.mockResolvedValue(undefined); });

describe('consultation analytics wiring', () => {
  it('emits consultation_started then consultation_completed on success', async () => {
    const svc = createServerConsultationService(transport({ ok: true, text: '차분한 흐름입니다.', groundingMeta: { grounded: true, engineVersion: 'deokbunai.saju-rules.v1' } as never }), () => true);
    const r = await svc.sendMessage(input());
    expect(r.success).toBe(true);
    expect(names()).toEqual(['consultation_started', 'consultation_completed']);
    const completed = track.mock.calls.find((c) => c[0] === 'consultation_completed')![1];
    expect(completed).toMatchObject({ surface: 'consultation', consultationMode: 'solo', properties: expect.objectContaining({ product: 'general', outcome: 'success', engine_version: 'deokbunai.saju-rules.v1' }) });
  });

  it('emits started but NOT completed on a failed server response', async () => {
    const svc = createServerConsultationService(transport({ ok: false, error: 'REQUEST_FAILED' } as never), () => true);
    const r = await svc.sendMessage(input());
    expect(r.success).toBe(false);
    expect(names()).toContain('consultation_started');
    expect(names()).not.toContain('consultation_completed');
  });

  it('emits NOTHING on empty/invalid input (no request begins)', async () => {
    const svc = createServerConsultationService(transport({ ok: true, text: 'x' }), () => true);
    await svc.sendMessage(input({ userMessage: '   ' }));
    expect(track).not.toHaveBeenCalled();
  });

  it('does not emit completed on AUTH_REQUIRED', async () => {
    const svc = createServerConsultationService(transport({ ok: true, text: 'x' }), () => false);
    await svc.sendMessage(input());
    expect(names()).not.toContain('consultation_completed');
  });

  it('analytics rejection does not break a successful consultation', async () => {
    track.mockRejectedValue(new Error('analytics down'));
    const svc = createServerConsultationService(transport({ ok: true, text: '결과' }), () => true);
    const r = await svc.sendMessage(input());
    expect(r.success).toBe(true);
  });

  it('completed properties carry no prompt/answer/PII keys', async () => {
    const svc = createServerConsultationService(transport({ ok: true, text: '민감한 답변 텍스트' }), () => true);
    await svc.sendMessage(input({ userMessage: '민감한 질문 텍스트' }));
    for (const call of track.mock.calls) {
      const props = (call[1]?.properties ?? {}) as Record<string, unknown>;
      const blob = JSON.stringify(props);
      expect(blob).not.toContain('질문');
      expect(blob).not.toContain('답변');
      for (const forbidden of ['question', 'answer', 'prompt', 'text', 'name', 'email']) {
        expect(Object.keys(props)).not.toContain(forbidden);
      }
    }
  });
});
