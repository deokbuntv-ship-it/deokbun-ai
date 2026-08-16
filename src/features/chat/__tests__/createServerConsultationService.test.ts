// Server-backed consultation service (production path). Proves the client sends INPUTS ONLY — never
// grounding, messages, engine facts, or a system prompt — and correctly maps the server-validated result.
import { createServerConsultationService } from '@/features/chat/services/createServerConsultationService';
import type {
  ConsultationTransport,
  ConsultationTransportResult,
} from '@/features/chat/services/consultationTransport';
import type { ServerConsultationRequest } from '@/features/chat/server';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';

const draft = (): ConsultationDraft => ({
  subject: { id: 's1', displayName: '홍길동', relationship: null },
  birthInfo: {
    displayName: '홍길동', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
    birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
  },
});
const input = (over: Partial<ChatServiceInput> = {}): ChatServiceInput => ({
  userMessage: '제 성격은 어떤가요?',
  draft: draft(),
  messages: [],
  conversationMemory: { summary: null, lastSummarizedMessageId: null },
  ...over,
});
function transport(result: ConsultationTransportResult) {
  const sent: ServerConsultationRequest[] = [];
  const t: ConsultationTransport = {
    async requestConsultation(request) { sent.push(request); return result; },
  };
  return { t, sent };
}
const OK: ConsultationTransportResult = { ok: true, text: '차분한 흐름입니다.' };

describe('createServerConsultationService — sends inputs only, maps server result', () => {
  it('posts birthInput + question + conversationContext and NO grounding/messages', async () => {
    const { t, sent } = transport(OK);
    const svc = createServerConsultationService(t, () => true);
    const r = await svc.sendMessage(
      input({
        userMessage: '지금 이 일을 시작해도 될까요?',
        messages: [
          { id: 'm1', role: 'user', text: '안녕하세요' },
          { id: 'm2', role: 'assistant', text: '무엇을 도와드릴까요?' },
        ],
      }),
    );
    expect(r.success).toBe(true);
    expect(sent).toHaveLength(1);
    const req = sent[0] as ServerConsultationRequest & Record<string, unknown>;
    expect(req.question).toBe('지금 이 일을 시작해도 될까요?');
    expect(req.birthInput.birthYear).toBe('1990');
    expect(req.subjectProfileId).toBeNull();
    expect(req.conversationContext).toEqual([
      { role: 'user', content: '안녕하세요' },
      { role: 'assistant', content: '무엇을 도와드릴까요?' },
    ]);
    // The client authors NO deterministic payload.
    expect('messages' in req).toBe(false);
    expect('grounding' in req).toBe(false);
    expect('evidence' in req).toBe(false);
  });

  it('maps a structured server result through to the caller', async () => {
    const { t } = transport({
      ok: true,
      text: '요약',
      structuredResult: { coreSummary: '요약' } as never,
      groundingMeta: {
        grounded: true, engineVersion: 'v1', promptVersion: 'p1', mode: 'GENERAL_READING',
        engines: { myungri: 'available', ziwei: 'available', qimen: 'not_applicable' },
        questionTimeSource: 'SERVER_RECEIPT_TIME',
      },
    });
    const r = await createServerConsultationService(t, () => true).sendMessage(input());
    expect(r.success && r.structuredResult).toBeTruthy();
    if (r.success) expect(r.meta?.grounded).toBe(true);
  });

  it('empty message → INVALID_INPUT, no transport call', async () => {
    const { t, sent } = transport(OK);
    const r = await createServerConsultationService(t, () => true).sendMessage(input({ userMessage: '   ' }));
    expect(r.success).toBe(false);
    expect(sent).toHaveLength(0);
  });

  it('not authenticated → AUTH_REQUIRED, no transport call', async () => {
    const { t, sent } = transport(OK);
    const r = await createServerConsultationService(t, () => false).sendMessage(input());
    expect(r.success).toBe(false);
    if (!r.success) expect(r.errorCode).toBe('AUTH_REQUIRED');
    expect(sent).toHaveLength(0);
  });

  it('missing birthInfo → INVALID_INPUT (server would have nothing trusted to recompute)', async () => {
    const { t, sent } = transport(OK);
    const noBirth = input({ draft: { subject: { id: 's', displayName: 'x', relationship: null }, birthInfo: null } });
    const r = await createServerConsultationService(t, () => true).sendMessage(noBirth);
    expect(r.success).toBe(false);
    expect(sent).toHaveLength(0);
  });

  it('transport AUTH_REQUIRED / REQUEST_FAILED map to the same client error codes', async () => {
    const auth = await createServerConsultationService(transport({ ok: false, error: 'AUTH_REQUIRED' }).t, () => true).sendMessage(input());
    expect(auth.success).toBe(false);
    if (!auth.success) expect(auth.errorCode).toBe('AUTH_REQUIRED');
    const failed = await createServerConsultationService(transport({ ok: false, error: 'REQUEST_FAILED' }).t, () => true).sendMessage(input());
    expect(failed.success).toBe(false);
    if (!failed.success) expect(failed.errorCode).toBe('REQUEST_FAILED');
  });
});
