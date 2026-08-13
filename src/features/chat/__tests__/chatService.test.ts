// createChatService orchestration coverage (AI_CONSTITUTION 제12조: no paid LLM call
// before login; 제10조 pipeline order). Pure/integration — the adapter and authGuard
// are injected (no network, no mocks), and a spy adapter lets us assert whether the
// paid path was reached.
import { unconfiguredLLMAdapter, type LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import { LLMRequestError } from '@/features/chat/adapters/llmError';
import { createChatService, type AuthGuard } from '@/features/chat/services/chatService';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';

function makeAdapter(opts?: { throws?: boolean; text?: string }) {
  const calls: unknown[] = [];
  const adapter: LLMAdapter = {
    async generateResponse(req) {
      calls.push(req);
      if (opts?.throws) throw new Error('boom');
      return { text: opts?.text ?? 'LLM reply' };
    },
  };
  return { adapter, calls };
}

const draft = {
  subject: { id: 's1', displayName: '홍길동', relationship: null },
  birthInfo: {
    displayName: '홍길동',
    gender: 'male',
    calendarType: 'solar',
    lunarMonthType: null,
    birthYear: '1990',
    birthMonth: '5',
    birthDay: '3',
    birthTimeAccuracy: 'exact',
    birthHour: '10',
    birthMinute: '30',
    approximateTimePeriod: null,
    birthPlace: '서울',
  },
} as never;

const input = (userMessage: string): ChatServiceInput => ({
  userMessage,
  draft,
  messages: [],
  conversationMemory: { summary: null, lastSummarizedMessageId: null },
});

const allow: AuthGuard = () => true;
const deny: AuthGuard = () => false;

describe('createChatService — login-before-LLM gate + boundaries', () => {
  it('greeting returns LOCAL_RESPONSE without invoking the paid adapter, even unauthenticated', async () => {
    const { adapter, calls } = makeAdapter();
    const r = await createChatService(adapter, deny).sendMessage(input('안녕'));
    expect(r).toMatchObject({ success: true, responseText: '안녕하세요 😊' });
    expect(calls).toHaveLength(0);
  });

  it('a real question while UNAUTHENTICATED returns AUTH_REQUIRED and NEVER calls the adapter (제12조)', async () => {
    const { adapter, calls } = makeAdapter();
    const r = await createChatService(adapter, deny).sendMessage(input('올해 재물운은 어때?'));
    expect(r).toMatchObject({ success: false, errorCode: 'AUTH_REQUIRED' });
    expect(calls).toHaveLength(0);
  });

  it('empty / whitespace input is INVALID_INPUT with no adapter call', async () => {
    const { adapter, calls } = makeAdapter();
    const r = await createChatService(adapter, allow).sendMessage(input('   '));
    expect(r).toMatchObject({ success: false, errorCode: 'INVALID_INPUT' });
    expect(calls).toHaveLength(0);
  });

  it('an authenticated real question invokes the adapter once and returns its text', async () => {
    const { adapter, calls } = makeAdapter({ text: '올해는 무난합니다.' });
    const r = await createChatService(adapter, allow).sendMessage(input('올해 재물운은 어때?'));
    expect(r).toMatchObject({ success: true, responseText: '올해는 무난합니다.' });
    expect(calls).toHaveLength(1);
  });

  it('null context (missing subject/birthInfo) is INVALID_INPUT before any adapter call', async () => {
    const { adapter, calls } = makeAdapter();
    const bad: ChatServiceInput = {
      ...input('올해 재물운은 어때?'),
      draft: { subject: null, birthInfo: null } as never,
    };
    const r = await createChatService(adapter, allow).sendMessage(bad);
    expect(r).toMatchObject({ success: false, errorCode: 'INVALID_INPUT' });
    expect(calls).toHaveLength(0);
  });

  it('an adapter failure maps to REQUEST_FAILED and never throws to the caller', async () => {
    const r = await createChatService(unconfiguredLLMAdapter, allow).sendMessage(
      input('올해 재물운은 어때?'),
    );
    expect(r).toMatchObject({ success: false, errorCode: 'REQUEST_FAILED' });
  });

  it('an authed request whose session expired (edge 401) normalises to AUTH_REQUIRED (§14/§15)', async () => {
    const authExpiredAdapter: LLMAdapter = {
      async generateResponse() {
        throw new LLMRequestError('LLM request failed.', { authError: true });
      },
    };
    // allow() = the client still believes it is authenticated; the SERVER rejected it.
    const r = await createChatService(authExpiredAdapter, allow).sendMessage(
      input('올해 재물운은 어때?'),
    );
    expect(r).toMatchObject({ success: false, errorCode: 'AUTH_REQUIRED' });
  });

  it('a non-auth LLMRequestError stays REQUEST_FAILED (do not over-classify, §16)', async () => {
    const genericAdapter: LLMAdapter = {
      async generateResponse() {
        throw new LLMRequestError('LLM response was empty.');
      },
    };
    const r = await createChatService(genericAdapter, allow).sendMessage(
      input('올해 재물운은 어때?'),
    );
    expect(r).toMatchObject({ success: false, errorCode: 'REQUEST_FAILED' });
  });

  it('every result carries a non-empty requestId', async () => {
    const { adapter } = makeAdapter();
    const r = await createChatService(adapter, allow).sendMessage(input('안녕'));
    expect(typeof r.requestId).toBe('string');
    expect((r.requestId ?? '').length).toBeGreaterThan(0);
  });
});
