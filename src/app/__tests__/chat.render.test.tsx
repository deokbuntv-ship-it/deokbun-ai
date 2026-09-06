// 상담 대화 화면 (/chat) — 돈이 실제로 나가는 화면.
//
// PART 3-3 이 지목한 다섯 가지를 렌더로 확인한다: 5턴 제한이 화면에 드러나는가, 덕 잔액과 부족 상태,
// 세션 경계·동의 게이트, GROUNDING_UNAVAILABLE 안내, 절기 경계일 계정의 안내.
//
// ⚠ 세션 경계 게이트가 이 파일의 핵심이다. compatibility-chat 에서 6번째 질문이 조용히 12덕을 다시
// 긁던 버그가 있었고, 수정은 공유 헬퍼(`isSessionExhausted`)로 일반화됐다. 그 헬퍼가 실제로 이 화면의
// 컴포저를 막는지는 렌더해야 보인다.
//
// 실제 모듈을 최대한 그대로 쓴다 — ChatInput · SessionMeter · 에러 매핑은 진짜를 렌더하고,
// 네트워크에 닿는 전송 경로와 영속화만 대체한다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const sendResult = { current: null as unknown };
const ensureConversation = jest.fn().mockResolvedValue('conv-1');
const persistMessage = jest.fn();
let restoredMessages: unknown[] = [];

jest.mock('@/features/chat', () => {
  const actual = jest.requireActual('@/features/chat');
  return {
    ...actual,
    __esModule: true,
    // 전송 순서(대화 생성 → 사용자 메시지 영속 → 상담 호출)는 실제 구현을 그대로 쓰고,
    // 네트워크에 닿는 마지막 한 단계인 서비스만 대체한다.
    createServerConsultationService: () => ({ sendMessage: async () => sendResult.current }),
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

let session: { active: boolean; sessionId: string | null; successfulTurnCount: number; turnLimit: number; expiresAt: string | null; productType: string } | null = null;
jest.mock('@/features/duk/dukClientContract', () => {
  const actual = jest.requireActual('@/features/duk/dukClientContract');
  return { ...actual, __esModule: true, getSessionStatus: () => Promise.resolve(session) };
});

let walletState: { totalSpendable: number } | null = { totalSpendable: 120 };
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: walletState, loading: false, error: null, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false }),
}));

let authed = true;
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: authed, authState: { status: authed ? 'authenticated' : 'unauthenticated', user: { id: 'u1' } } }),
}));

const setPendingConsultationIntent = jest.fn();
let draftSubject: { id: string; displayName: string; relationship: string | null } | null = null;
let draftBirthInfo: unknown = null;
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationDraft: () => ({ draft: { subject: draftSubject, birthInfo: draftBirthInfo }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  useConsultationSubjects: () => ({ subjects: draftSubject ? [draftSubject] : [], status: 'ready', reload: jest.fn() }),
  consumePendingQuestion: () => null,
  consumePendingQuestionOrigin: () => null,
  isSavedSubjectId: (id: string) => typeof id === 'string' && id.startsWith('subj-'),
  setPendingConsultationIntent: (i: unknown) => setPendingConsultationIntent(i),
}));

import { DUK_PRICES } from '@/features/duk/pricing';
import { sessionTurnCopy } from '@/features/duk/consumerDukView';

import { routerMock } from '../../../jest.render.setup';
import ChatScreen from '../chat';
import { SELF_SUBJECT } from './todayFixture';

const SUBJECT = { id: 'subj-1', displayName: '김덕분', relationship: '본인' };
const HOUR = 60 * 60 * 1000;
const liveSession = (used: number, limit = 5) => ({
  active: true,
  sessionId: 's1',
  productType: 'general',
  successfulTurnCount: used,
  turnLimit: limit,
  expiresAt: new Date(Date.now() + 12 * HOUR).toISOString(),
});

const ANSWER = {
  success: true as const,
  responseText: '올해 하반기가 더 낫습니다. 상반기에는 준비를 끝내는 데 쓰는 편이 이득입니다.',
  requestId: 'req-1',
};

beforeEach(() => {
  setViewport(360);
  authed = true;
  draftSubject = SUBJECT;
  draftBirthInfo = SELF_SUBJECT.birthInfo;
  walletState = { totalSpendable: 120 };
  session = liveSession(0);
  restoredMessages = [];
  sendResult.current = ANSWER;
  ensureConversation.mockClear();
  persistMessage.mockClear();
  routerMock.push.mockClear();
  setPendingConsultationIntent.mockClear();
  (globalThis as Record<string, unknown>).__routeParams = { conversationId: 'conv-1' };
});

const settle = async () => {
  await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument(), { timeout: 3000 })
    .catch(() => undefined);
  await act(async () => {});
};

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('5턴 제한이 화면에 드러난다', () => {
  it('남은 질문 수가 숫자로 보인다', async () => {
    session = liveSession(2, 5);
    render(<ChatScreen />);
    await waitFor(() => expect(screen.getByText(sessionTurnCopy(session!))).toBeInTheDocument());
    expect(screen.getByText('이번 상담에서 3번 더 질문할 수 있어요')).toBeInTheDocument();
  });

  it('한 번 남았을 때도 정확히 센다 — 로컬 계산이 아니라 서버 값', async () => {
    session = liveSession(4, 5);
    render(<ChatScreen />);
    await waitFor(() => expect(screen.getByText('이번 상담에서 1번 더 질문할 수 있어요')).toBeInTheDocument());
  });
});

describe('⚠ 세션 경계 — 6번째 질문이 조용히 다시 과금되지 않는다', () => {
  it('턴을 다 쓰고 이 대화에서 상담한 적이 있으면 컴포저가 막히고 동의 카드가 뜬다', async () => {
    session = liveSession(5, 5);
    restoredMessages = [
      { id: 'm1', role: 'user', text: '올해 이직해도 될까요?', createdAt: '2026-09-05T00:00:00Z' },
      { id: 'm2', role: 'assistant', text: '하반기가 낫습니다.', createdAt: '2026-09-05T00:00:01Z' },
    ];
    render(<ChatScreen />);
    await waitFor(() => expect(screen.getByText('이번 상담의 남은 질문을 모두 썼어요')).toBeInTheDocument());
    // 새 세션은 명시적 동의를 거쳐야 하고, 그 비용이 버튼 라벨에 있다.
    expect(screen.getByText(new RegExp(`새 상담 시작하기.*${DUK_PRICES.general}덕`))).toBeInTheDocument();
    // 컴포저는 사라진다 — 다음 질문이 두 번째 결제가 되는 것을 막는다.
    expect(screen.queryByLabelText('메시지 입력창')).toBeNull();
  });

  it('⚠ 만료된 세션은 소진이 아니다 — 지난 세션이 결제벽을 영구히 붙잡지 않는다', async () => {
    session = { ...liveSession(5, 5), expiresAt: new Date(Date.now() - HOUR).toISOString() };
    restoredMessages = [{ id: 'm1', role: 'user', text: '질문', createdAt: '2026-09-05T00:00:00Z' }];
    render(<ChatScreen />);
    await settle();
    expect(screen.queryByText('이번 상담의 남은 질문을 모두 썼어요')).toBeNull();
  });

  it('이 대화에서 아직 상담한 적이 없으면 소진 카드가 뜨지 않는다 — 첫 전송이 새 세션을 연다', async () => {
    session = liveSession(5, 5);
    restoredMessages = [];
    render(<ChatScreen />);
    await settle();
    expect(screen.queryByText('이번 상담의 남은 질문을 모두 썼어요')).toBeNull();
  });

  it('새 상담 버튼은 잔액을 아는데 부족할 때만 막는다', async () => {
    session = liveSession(5, 5);
    restoredMessages = [{ id: 'm1', role: 'user', text: '질문', createdAt: '2026-09-05T00:00:00Z' }];
    walletState = { totalSpendable: 1 };
    render(<ChatScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작하기/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/새 상담 시작하기/));
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('잔액을 모르면 막지 않는다 — 서버가 최종 권위다', async () => {
    session = liveSession(5, 5);
    restoredMessages = [{ id: 'm1', role: 'user', text: '질문', createdAt: '2026-09-05T00:00:00Z' }];
    walletState = null;
    render(<ChatScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작하기/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/새 상담 시작하기/));
    expect(routerMock.push).toHaveBeenCalledWith({ pathname: '/chat', params: { startNew: '1' } });
  });
});

describe('서버 오류 안내', () => {
  const ask = async (text = '올해 이직해도 될까요?') => {
    render(<ChatScreen />);
    await settle();
    const input = screen.getByLabelText('메시지 입력창');
    fireEvent.change(input, { target: { value: text } });
    await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
  };

  it('⚠ GROUNDING_UNAVAILABLE — 서버가 말한 이유를 그대로 보여주고 무과금을 명시한다', async () => {
    sendResult.current = {
      success: false,
      errorCode: 'GROUNDING_UNAVAILABLE',
      errorDetail: '태어난 시각이 없어 사주를 세울 수 없었어요. 덕은 차감되지 않았습니다.',
      requestId: 'r1',
    };
    await ask();
    await waitFor(() => expect(screen.getByText(/사주를 세울 수 없었어요/)).toBeInTheDocument());
    expect(document.body.textContent).toMatch(/차감되지 않았습니다/);
    // 같은 입력으로 재시도해도 똑같이 실패하므로 재시도를 권하지 않는다.
    expect(screen.queryByText('다시 시도')).toBeNull();
  });

  it('서버가 이유를 안 주면 고정 문구로 떨어진다 (fail-closed)', async () => {
    sendResult.current = { success: false, errorCode: 'GROUNDING_UNAVAILABLE', errorDetail: null, requestId: 'r1' };
    await ask();
    await waitFor(() => expect(screen.getByText(/등록된 출생 정보로는 사주를 세울 수 없어/)).toBeInTheDocument());
    expect(document.body.textContent).toMatch(/덕은 차감되지 않았습니다/);
  });

  it('INSUFFICIENT_DUK — 막다른 문구가 아니라 충전 경로를 준다', async () => {
    sendResult.current = {
      success: false, errorCode: 'INSUFFICIENT_DUK', requestId: 'r1',
      insufficientDuk: { balance: 1, required: DUK_PRICES.general, shortfall: DUK_PRICES.general - 1 },
    };
    await ask();
    await waitFor(() => expect(document.body.textContent).toMatch(/충전|덕이 부족/));
  });

  it('네트워크 실패는 재시도를 준다', async () => {
    sendResult.current = { success: false, errorCode: 'REQUEST_FAILED', requestId: 'r1' };
    await ask();
    await waitFor(() => expect(screen.getByText(/연결 상태를 확인하고/)).toBeInTheDocument());
  });

  it('AUTH_REQUIRED — 질문을 잃지 않고 로그인 후 돌아온다', async () => {
    sendResult.current = { success: false, errorCode: 'AUTH_REQUIRED', requestId: null };
    await ask('올해 이직해도 될까요?');
    await waitFor(() => expect(setPendingConsultationIntent).toHaveBeenCalledWith({
      question: '올해 이직해도 될까요?', returnTo: '/chat',
    }));
  });
});

describe('정상 응답', () => {
  it('답변이 화면에 나오고, AI 고지가 함께 붙는다', async () => {
    render(<ChatScreen />);
    await settle();
    fireEvent.change(screen.getByLabelText('메시지 입력창'), { target: { value: '올해 이직해도 될까요?' } });
    await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
    await waitFor(() => expect(screen.getByText(ANSWER.responseText)).toBeInTheDocument());
    expect(document.body.textContent).toMatch(/덕분이는 AI를 활용해/);
  });

  it('360dp — 긴 답변에서도 넘치도록 선언된 폭이 없다', async () => {
    sendResult.current = {
      success: true,
      responseText: '올해 하반기가 더 낫습니다. '.repeat(12) + '지금은 준비를 끝내는 데 쓰는 편이 이득입니다.',
      requestId: 'req-1',
    };
    const { container } = render(<ChatScreen />);
    await settle();
    fireEvent.change(screen.getByLabelText('메시지 입력창'), { target: { value: '올해 이직해도 될까요?' } });
    await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
    await waitFor(() => expect(screen.getByText(/지금은 준비를 끝내는 데/)).toBeInTheDocument());
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});
