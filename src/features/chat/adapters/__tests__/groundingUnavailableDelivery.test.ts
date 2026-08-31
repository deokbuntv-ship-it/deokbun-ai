// V6 ROOT CAUSE 5 — the typed no-grounding non-success, end to end on the CLIENT side.
//
// A reading the engines could not build must not reach the user as "지금 답변을 가져오지 못했어요. 다시 시도해
// 주세요": nothing was charged, and a retry of the same question with the same birth information is
// guaranteed to fail again. The server's own explanation is the only thing that names the input to correct,
// so it has to survive the whole client path rather than being replaced by a generic string.
import { parseGroundingUnavailable } from '@/features/chat/adapters/llmError';
import { supabaseEdgeConsultationAdapter } from '@/features/chat/adapters/supabaseEdgeConsultationAdapter';
import { mapConsultationError } from '@/features/chat/consultationErrors';
import { createServerConsultationService } from '@/features/chat/services/createServerConsultationService';
import type { ConsultationTransport } from '@/features/chat/services/consultationTransport';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';

const SERVER_MESSAGE = '태어난 시각이 비어 있어 사주를 세울 수 없었습니다. 태어난 시각을 입력해 주십시오.';
const invokeError = (status: number, body: unknown) => ({ context: { status, json: async () => body } });

jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => mockClient }));
let mockClient: { functions: { invoke: jest.Mock } };

describe('parseGroundingUnavailable — only a real 422 GROUNDING_UNAVAILABLE is recognised', () => {
  it('returns the server message for a 422 GROUNDING_UNAVAILABLE', async () => {
    const r = await parseGroundingUnavailable(invokeError(422, { error: 'GROUNDING_UNAVAILABLE', message: SERVER_MESSAGE }));
    expect(r).toEqual({ message: SERVER_MESSAGE });
  });
  it('tolerates a 422 with no message rather than failing the classification', async () => {
    expect(await parseGroundingUnavailable(invokeError(422, { error: 'GROUNDING_UNAVAILABLE' }))).toEqual({ message: null });
  });
  it('returns null for any other status or error code — a generic failure stays generic', async () => {
    expect(await parseGroundingUnavailable(invokeError(500, { error: 'GROUNDING_UNAVAILABLE' }))).toBeNull();
    expect(await parseGroundingUnavailable(invokeError(422, { error: 'SOMETHING_ELSE' }))).toBeNull();
    expect(await parseGroundingUnavailable(null)).toBeNull();
    expect(await parseGroundingUnavailable({})).toBeNull();
  });
});

describe('the Edge adapter classifies 422 apart from the retryable generic failure', () => {
  it('a 422 becomes GROUNDING_UNAVAILABLE carrying the server message', async () => {
    mockClient = { functions: { invoke: jest.fn(async () => ({ data: null, error: invokeError(422, { error: 'GROUNDING_UNAVAILABLE', message: SERVER_MESSAGE }) })) } };
    const r = await supabaseEdgeConsultationAdapter.requestConsultation({ question: '사업을 시작해도 될까요?' } as never);
    expect(r).toEqual({ ok: false, error: 'GROUNDING_UNAVAILABLE', message: SERVER_MESSAGE });
  });

  it('an ordinary 5xx is still the retryable generic failure', async () => {
    mockClient = { functions: { invoke: jest.fn(async () => ({ data: null, error: invokeError(500, { error: 'REQUEST_FAILED' }) })) } };
    const r = await supabaseEdgeConsultationAdapter.requestConsultation({ question: '사업을 시작해도 될까요?' } as never);
    expect(r).toEqual({ ok: false, error: 'REQUEST_FAILED' });
  });
});

describe('the consultation service and the error view keep it non-retryable and specific', () => {
  const input = (): ChatServiceInput => ({
    userMessage: '사업을 시작해도 될까요?',
    messages: [],
    conversationMemory: { summary: null, summarizedUpToMessageId: null },
  } as unknown as ChatServiceInput);

  it('the service surfaces the code and the server detail, not a generic failure', async () => {
    const transport: ConsultationTransport = {
      async requestConsultation() { return { ok: false, error: 'GROUNDING_UNAVAILABLE', message: SERVER_MESSAGE }; },
    };
    const service = createServerConsultationService(transport, () => true);
    const r = await service.sendMessage(input());
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.errorCode).toBe('GROUNDING_UNAVAILABLE');
    expect(r.errorDetail).toBe(SERVER_MESSAGE);
  });

  it('the error view is an INPUT problem the user can fix — never an invitation to retry', () => {
    const view = mapConsultationError('GROUNDING_UNAVAILABLE', SERVER_MESSAGE);
    expect(view.canRetry).toBe(false);
    expect(view.kind).toBe('input');
    expect(view.message).toBe(SERVER_MESSAGE);
  });

  it('with no server detail the fixed copy still says nothing was charged and what to fix', () => {
    const view = mapConsultationError('GROUNDING_UNAVAILABLE');
    expect(view.canRetry).toBe(false);
    expect(view.message).toContain('차감되지 않았습니다');
    expect(view.message).toContain('태어난 시각');
  });
});
