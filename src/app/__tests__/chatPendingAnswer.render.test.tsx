// 끊긴 상담이 끝까지 가는가 (2026-09-17) — 화면에서 본다.
//
// 2026-09-15 production 실측이 드러낸 세 구멍을 그대로 재현한다:
//   ① 서버가 "아직 만드는 중"(409)이라고 답했는데 화면은 **빨간 실패 카드**를 띄웠다 → 사용자는 새 질문을
//      보냈고 LLM 이 한 번 더 돌았다(요청 `req_mu2m…` → `req_mu2o…`).
//   ② 답을 받지 못한 요청 번호가 화면 메모리에만 있어서, 대화를 다시 열면 서버에 저장된 답을 꺼낼 수 없었다.
//   ③ 동의 화면에서 동의해도 질문이 자동으로 다시 가지 않아, 동의만 저장되고 답은 오지 않았다(2026-09-16).
//
// 반례는 양방향이다: 진짜 실패는 **여전히** 실패 카드와 "다시 시도" 버튼으로 보여야 한다.
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';

import { setViewport } from '@/test-support/renderAudit';
import { AI_CONSENT_CHECKBOX_LABEL } from '@/features/legal/aiProcessingConsent';

type SendInput = { userMessage: string; requestId?: string; conversationId?: string };
const sendCalls: SendInput[] = [];
const queue: unknown[] = [];
const ensureConversation = jest.fn().mockResolvedValue('conv-1');
const persistMessage = jest.fn();
let restoredMessages: unknown[] = [];

jest.mock('@/features/chat', () => {
  const actual = jest.requireActual('@/features/chat');
  return {
    ...actual,
    __esModule: true,
    createServerConsultationService: () => ({
      sendMessage: async (input: SendInput) => {
        sendCalls.push(input);
        return queue.length > 1 ? queue.shift() : queue[0];
      },
    }),
    useConversationPersistence: () => ({
      hydrationStatus: 'ready',
      restoredMessages,
      resetToken: 0,
      conversationMemory: null,
      restoredSubjectSnapshot: null,
      activeConversationId: 'conv-1',
      ensureConversation,
      persistMessage,
    }),
  };
});

jest.mock('@/features/duk/dukClientContract', () => {
  const actual = jest.requireActual('@/features/duk/dukClientContract');
  return { ...actual, __esModule: true, getSessionStatus: () => Promise.resolve(null) };
});
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: { totalSpendable: 120 }, loading: false, error: null, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false }),
}));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));

const SUBJECT = { id: 'subj-1', displayName: '김덕분', relationship: '본인' };
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationDraft: () => ({
    draft: { subject: { id: 'subj-1', displayName: '김덕분', relationship: '본인' }, birthInfo: { birthYear: '1990', birthMonth: '03', birthDay: '15', birthHour: '09', birthMinute: '30', calendar: 'solar', gender: 'female', displayName: '김덕분' } },
    hydrationStatus: 'ready',
    updateSubject: jest.fn(),
    updateBirthInfo: jest.fn(),
  }),
  useConsultationSubjects: () => ({ subjects: [SUBJECT], status: 'ready', reload: jest.fn() }),
  consumePendingQuestion: () => null,
  consumePendingQuestionOrigin: () => null,
  isSavedSubjectId: (id: string) => typeof id === 'string' && id.startsWith('subj-'),
  setPendingConsultationIntent: jest.fn(),
}));

const grant = jest.fn(async () => true);
jest.mock('@/features/legal/services/aiConsentService', () => ({
  __esModule: true,
  aiConsentService: { grant: () => grant(), state: async () => ({ granted: false }), revoke: async () => ({ revoked: 0 }) },
}));

import { clearPendingAnswer, rememberPendingAnswer } from '@/features/chat/services/pendingAnswerStore';
import ChatScreen from '../chat';

const ANSWER = { success: true as const, responseText: '하반기가 낫습니다. 상반기에는 준비를 끝내는 편이 이득입니다.', requestId: 'req-1' };
const IN_PROGRESS = { success: false as const, errorCode: 'REQUEST_IN_PROGRESS' as const, requestId: 'req-1' };
const FAILED = { success: false as const, errorCode: 'REQUEST_FAILED' as const, requestId: 'req-1' };
const CONSENT_REQUIRED = { success: false as const, errorCode: 'AI_CONSENT_REQUIRED' as const, requestId: 'req-1' };

const byLabel = (l: string) => document.querySelector(`[aria-label="${l}"]`) as HTMLElement | null;

const typeAndSend = async (text: string) => {
  const input = screen.getByLabelText('메시지 입력창');
  fireEvent.change(input, { target: { value: text } });
  fireEvent.click(screen.getByLabelText('메시지 전송'));
  await act(async () => {});
};

beforeEach(() => {
  setViewport(360);
  sendCalls.length = 0;
  queue.length = 0;
  restoredMessages = [];
  grant.mockClear();
  ensureConversation.mockClear();
  persistMessage.mockClear();
  clearPendingAnswer('conv-1');
  (globalThis as Record<string, unknown>).__routeParams = { conversationId: 'conv-1' };
});
afterEach(() => {
  cleanup();
  jest.useRealTimers();
  clearPendingAnswer('conv-1');
});

describe('① 서버가 아직 만드는 중(409) — 실패로 보이지 않는다', () => {
  it('기다림 안내를 띄우고, "다시 시도" 버튼은 주지 않는다', async () => {
    queue.push(IN_PROGRESS);
    render(<ChatScreen />);
    await act(async () => {});
    await typeAndSend('올해 이직해도 될까요?');

    await waitFor(() => expect(document.body.textContent).toMatch(/답을 만들고 있어요/));
    expect(document.body.textContent).not.toMatch(/지금 답변을 가져오지 못했어요/);
    expect(screen.queryByText('다시 시도')).toBeNull();
  });

  it('⚠ 잠시 뒤 **같은 요청 번호로** 다시 받아와서 답을 보여 준다 (새 번호를 만들지 않는다)', async () => {
    jest.useFakeTimers();
    queue.push(IN_PROGRESS, ANSWER);
    render(<ChatScreen />);
    await act(async () => {});
    await typeAndSend('올해 이직해도 될까요?');

    expect(sendCalls).toHaveLength(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3500);
    });
    expect(sendCalls).toHaveLength(2);
    expect(sendCalls[1]?.requestId).toBe(IN_PROGRESS.requestId); // 같은 번호 — LLM 재호출 없음
    expect(document.body.textContent).toContain(ANSWER.responseText);
    expect(document.body.textContent).not.toMatch(/답을 만들고 있어요/);
  });
});

describe('⚠ 반례 — 진짜 실패는 그대로 실패로 보인다', () => {
  it('REQUEST_FAILED 는 실패 문구와 "다시 시도" 버튼을 준다', async () => {
    queue.push(FAILED);
    render(<ChatScreen />);
    await act(async () => {});
    await typeAndSend('올해 이직해도 될까요?');

    await waitFor(() => expect(document.body.textContent).toMatch(/지금 답변을 가져오지 못했어요/));
    expect(screen.queryByText('다시 시도')).not.toBeNull();
    expect(document.body.textContent).not.toMatch(/답을 만들고 있어요/);
  });
});

describe('② 대화를 다시 열면 저장된 답을 꺼내 온다', () => {
  it('답 없는 질문이 마지막이고 요청 번호가 남아 있으면, 그 번호로 받아온다', async () => {
    rememberPendingAnswer({ conversationId: 'conv-1', requestId: 'req_saved' });
    restoredMessages = [{ id: 'm1', role: 'user', text: '올해 이직해도 될까요?', createdAt: '2026-09-17T00:00:00Z' }];
    queue.push(ANSWER);

    render(<ChatScreen />);
    await waitFor(() => expect(sendCalls).toHaveLength(1));
    expect(sendCalls[0]?.requestId).toBe('req_saved');
    await waitFor(() => expect(document.body.textContent).toContain(ANSWER.responseText));
  });

  it('⚠ 반례 — 답이 이미 있는 대화에서는 아무것도 부르지 않는다', async () => {
    rememberPendingAnswer({ conversationId: 'conv-1', requestId: 'req_saved' });
    restoredMessages = [
      { id: 'm1', role: 'user', text: '올해 이직해도 될까요?', createdAt: '2026-09-17T00:00:00Z' },
      { id: 'm2', role: 'assistant', text: '하반기가 낫습니다.', createdAt: '2026-09-17T00:00:01Z' },
    ];
    render(<ChatScreen />);
    await act(async () => {});
    expect(sendCalls).toHaveLength(0);
  });

  it('⚠ 반례 — 보관된 번호가 없으면 부르지 않는다', async () => {
    restoredMessages = [{ id: 'm1', role: 'user', text: '올해 이직해도 될까요?', createdAt: '2026-09-17T00:00:00Z' }];
    render(<ChatScreen />);
    await act(async () => {});
    expect(sendCalls).toHaveLength(0);
  });
});

describe('③ 동의 화면에서 동의하면 질문이 이어서 간다', () => {
  it('사용자가 질문을 다시 치지 않아도 같은 번호로 보내고 답이 뜬다', async () => {
    queue.push(CONSENT_REQUIRED, ANSWER);
    render(<ChatScreen />);
    await act(async () => {});
    await typeAndSend('올해 이직해도 될까요?');

    await waitFor(() => expect(byLabel(AI_CONSENT_CHECKBOX_LABEL)).not.toBeNull());
    fireEvent.click(byLabel(AI_CONSENT_CHECKBOX_LABEL) as HTMLElement);
    fireEvent.click(byLabel('동의하고 계속') as HTMLElement);

    await waitFor(() => expect(sendCalls).toHaveLength(2));
    expect(grant).toHaveBeenCalledTimes(1);
    expect(sendCalls[1]?.requestId).toBe(CONSENT_REQUIRED.requestId);
    expect(sendCalls[1]?.userMessage).toBe('올해 이직해도 될까요?');
    await waitFor(() => expect(document.body.textContent).toContain(ANSWER.responseText));
  });

  it('⚠ 반례 — 동의 저장이 실패하면 이어서 보내지 않는다', async () => {
    grant.mockResolvedValueOnce(false);
    queue.push(CONSENT_REQUIRED, ANSWER);
    render(<ChatScreen />);
    await act(async () => {});
    await typeAndSend('올해 이직해도 될까요?');

    await waitFor(() => expect(byLabel(AI_CONSENT_CHECKBOX_LABEL)).not.toBeNull());
    fireEvent.click(byLabel(AI_CONSENT_CHECKBOX_LABEL) as HTMLElement);
    fireEvent.click(byLabel('동의하고 계속') as HTMLElement);
    await act(async () => {});

    expect(sendCalls).toHaveLength(1);
  });
});
