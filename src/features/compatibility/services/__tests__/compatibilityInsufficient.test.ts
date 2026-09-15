// Activation 04F — compatibility INSUFFICIENT_DUK contract + analytics. The service surfaces the authoritative
// server balance distinctly (not a generic failure) and emits compatibility_insufficient_duk from server values.
const track = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/productEvents', () => ({ trackProductEvent: (...a: unknown[]) => track(...a) }));

import { createCompatibilityConsultationService } from '@/features/compatibility/services/compatibilityConsultationService';
import type { ConsultationTransport, ConsultationTransportResult } from '@/features/chat/services/consultationTransport';

const partner = { displayName: '상대', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1988', birthMonth: '11', birthDay: '3', birthTimeAccuracy: 'exact', birthHour: '6',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '부산' } as never;
const input = () => ({
  userMessage: '두 사람의 결이 어떤가요?',
  target: { id: null, label: '상대', relationship: null, birthInfo: partner },
  messages: [], conversationMemory: { summary: null, lastSummarizedMessageId: null },
}) as never;
const transport = (r: ConsultationTransportResult): ConsultationTransport => ({ async requestConsultation() { return r; } });

beforeEach(() => { track.mockReset(); track.mockResolvedValue(undefined); });

describe('compatibility INSUFFICIENT_DUK contract', () => {
  it('surfaces errorCode INSUFFICIENT_DUK with the authoritative server balance (11/12/1)', async () => {
    const svc = createCompatibilityConsultationService(transport({ ok: false, error: 'INSUFFICIENT_DUK', balance: 11, required: 12, shortfall: 1 }), () => true);
    const r = await svc.sendMessage(input());
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.errorCode).toBe('INSUFFICIENT_DUK');
    expect(r.insufficientDuk).toEqual({ balance: 11, required: 12, shortfall: 1 });
  });

  it('emits compatibility_insufficient_duk from AUTHORITATIVE server values', async () => {
    const svc = createCompatibilityConsultationService(transport({ ok: false, error: 'INSUFFICIENT_DUK', balance: 11, required: 12, shortfall: 1 }), () => true);
    await svc.sendMessage(input());
    expect(track).toHaveBeenCalledWith('compatibility_insufficient_duk', expect.objectContaining({
      surface: 'compatibility_chat',
      properties: expect.objectContaining({ product: 'compatibility', amount: 12, duk_balance: 11, duk_shortfall: 1 }),
    }));
  });

  it('a generic REQUEST_FAILED does NOT masquerade as insufficient (and emits nothing)', async () => {
    const svc = createCompatibilityConsultationService(transport({ ok: false, error: 'REQUEST_FAILED' }), () => true);
    const r = await svc.sendMessage(input());
    expect(r.success).toBe(false);
    if (!r.success) expect(r.errorCode).toBe('REQUEST_FAILED');
    expect(track).not.toHaveBeenCalled();
  });

  it('an auth failure does NOT masquerade as insufficient', async () => {
    const svc = createCompatibilityConsultationService(transport({ ok: false, error: 'AUTH_REQUIRED' }), () => true);
    const r = await svc.sendMessage(input());
    if (!r.success) expect(r.errorCode).toBe('AUTH_REQUIRED');
    expect(track).not.toHaveBeenCalled();
  });

  it('analytics rejection does not change the INSUFFICIENT_DUK result', async () => {
    track.mockRejectedValue(new Error('analytics down'));
    const svc = createCompatibilityConsultationService(transport({ ok: false, error: 'INSUFFICIENT_DUK', balance: 11, required: 12, shortfall: 1 }), () => true);
    const r = await svc.sendMessage(input());
    if (!r.success) expect(r.errorCode).toBe('INSUFFICIENT_DUK');
  });

  it('no PII keys in the emitted properties', async () => {
    const svc = createCompatibilityConsultationService(transport({ ok: false, error: 'INSUFFICIENT_DUK', balance: 11, required: 12, shortfall: 1 }), () => true);
    await svc.sendMessage(input());
    const props = track.mock.calls[0][1].properties as Record<string, unknown>;
    for (const k of ['name', 'email', 'phone', 'question', 'answer', 'birth', 'prompt', 'text']) {
      expect(Object.keys(props)).not.toContain(k);
    }
  });
});
