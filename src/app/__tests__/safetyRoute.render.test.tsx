// ⚠ 안전 라우팅 — 사용자가 실제로 무엇을 보는가.
//
// 이 앱에서 이해관계가 가장 큰 경로다. 자해·위기 상황에서 잘못되면 사업 문제가 아니라 사람 문제다.
// `consultationSafety.test.ts` 가 분류기와 문구 자체를 이미 잠근다. **여기서 보는 것은 다른 질문이다:
// 그 문구가 실제로 화면에 도달하는가, 번호가 끊기지 않는가, 좁은 화면과 다크모드에서 읽히는가.**
//
// 전송 계층만 대체하고 **문구는 진짜 안전 모듈에서 가져온다** — 문구를 테스트에 복사하면 모듈이
// 바뀌어도 테스트가 초록불로 남는다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const sendResult = { current: null as unknown };
// ⚠ mock 이 돌려주는 객체·배열은 **모듈 상수여야 한다.** 매 렌더마다 새 리터럴을 돌려주면 참조가
// 바뀌어 의존성 배열이 매번 갱신되고 화면이 무한 리렌더에 빠진다 — 이 파일에서 두 번 걸렸다
// (`restoredMessages: []` 와 세션 객체). 테스트가 실패가 아니라 **멈춘다.**
const NO_MESSAGES: unknown[] = [];
const ensureConversation = jest.fn().mockResolvedValue('conv-1');
const persistMessage = jest.fn();
jest.mock('@/features/chat', () => {
  const actual = jest.requireActual('@/features/chat');
  return {
    ...actual,
    __esModule: true,
    createServerConsultationService: () => ({ sendMessage: async () => sendResult.current }),
    useConversationPersistence: () => ({
      hydrationStatus: 'ready',
      restoredMessages: NO_MESSAGES,
      resetToken: 0,
      conversationMemory: null,
      restoredSubjectSnapshot: null,
      activeConversationId: 'conv-1',
      ensureConversation,
      persistMessage,
    }),
  };
});
// ⚠ 세션 객체는 **한 번만** 만든다. 매 호출마다 새 객체를 돌려주면 참조가 계속 바뀌어 화면이
// 무한 리렌더에 빠진다(이 파일에서 실제로 걸렸다 — 테스트가 300초 넘게 멈췄다).
const SESSION = {
  active: true, sessionId: 's1', productType: 'general',
  successfulTurnCount: 0, turnLimit: 5,
  expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
};
jest.mock('@/features/duk/dukClientContract', () => {
  const actual = jest.requireActual('@/features/duk/dukClientContract');
  return { ...actual, __esModule: true, getSessionStatus: () => Promise.resolve(SESSION) };
});
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: { totalSpendable: 120 }, loading: false, error: null, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false, nextAvailableAtEpoch: null, rewardAmount: 1 }),
}));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));
jest.mock('@/features/consultation', () => {
  const subject = { id: 'subj-1', displayName: '김덕분', relationship: '본인' };
  return {
    __esModule: true,
    useConsultationDraft: () => ({ draft: { subject, birthInfo: {} }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
    useConsultationSubjects: () => ({ subjects: [subject], status: 'ready', reload: jest.fn() }),
    consumePendingQuestion: () => null,
    consumePendingQuestionOrigin: () => null,
    isSavedSubjectId: () => true,
    setPendingConsultationIntent: jest.fn(),
  };
});

import { classifyConsultationSafetyRoute, isHardStopRoute, safeResponseForRoute } from '@/features/chat/server/consultationSafety';

import ChatScreen from '../chat';

/** 실제 위기 응답 문구 — 테스트에 복사하지 않고 모듈에서 가져온다. */
const SELF_HARM_TEXT = safeResponseForRoute('SELF_HARM')!;
const MEDICAL_TEXT = safeResponseForRoute('MEDICAL')!;

const ask = async (question: string, text: string) => {
  sendResult.current = { success: true, responseText: text, requestId: 'r1' };
  render(<ChatScreen />);
  await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('메시지 입력창'), { target: { value: question } });
  await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
};

beforeEach(() => {
  setViewport(360);
  (globalThis as Record<string, unknown>).__routeParams = { conversationId: 'conv-1' };
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('⚠ 위기 응답이 화면에 도달한다', () => {
  const CRISIS_Q = '요즘 너무 힘들어서 죽고 싶어요';

  it('전제 확인 — 이 질문이 실제로 hard stop 으로 분류된다', () => {
    expect(classifyConsultationSafetyRoute(CRISIS_Q)).toBe('SELF_HARM');
    expect(isHardStopRoute('SELF_HARM')).toBe(true);
  });

  it('⭐ 위기 안내가 통째로 화면에 나온다', async () => {
    await ask(CRISIS_Q, SELF_HARM_TEXT);
    await waitFor(() => expect(screen.getByText(/지금 많이 힘드셨겠어요/)).toBeInTheDocument());
    expect(document.body.textContent).toContain('혼자 감당하지 마시고');
    expect(document.body.textContent).toContain('덕분이는 이런 순간에 사주 풀이를 드리지 않아요');
  });

  it('⭐ 전화번호 세 줄이 끊기지 않고 그대로 보인다', async () => {
    await ask(CRISIS_Q, SELF_HARM_TEXT);
    await waitFor(() => expect(screen.getByText(/지금 많이 힘드셨겠어요/)).toBeInTheDocument());
    const body = document.body.textContent ?? '';
    // 번호가 줄바꿈이나 요소 분리로 쪼개지면 이 단언이 깨진다.
    expect(body).toContain('자살예방 상담전화 109 (24시간)');
    expect(body).toContain('정신건강 상담전화 1577-0199');
    expect(body).toContain('급하면 112 / 119');
  });

  it('⚠ 위기 응답에는 사주 해석이 섞이지 않는다', async () => {
    await ask(CRISIS_Q, SELF_HARM_TEXT);
    await waitFor(() => expect(screen.getByText(/지금 많이 힘드셨겠어요/)).toBeInTheDocument());
    const body = document.body.textContent ?? '';
    for (const jargon of ['일간', '대운', '세운', '원국', '오행', '십신']) {
      expect(body).not.toContain(jargon);
    }
    // '왜 이렇게 보나요' 근거 섹션도 붙지 않는다 — 근거로 삼을 사주가 애초에 없다.
    expect(body).not.toContain('왜 이렇게 보나요');
  });

  it('발동 후에도 계속 물어볼 수 있다 — 세션이 닫히지 않는다', async () => {
    await ask(CRISIS_Q, SELF_HARM_TEXT);
    await waitFor(() => expect(screen.getByText(/지금 많이 힘드셨겠어요/)).toBeInTheDocument());
    // 컴포저가 살아 있고 남은 질문 수도 줄지 않았다(서버가 턴을 소비하지 않았으므로).
    expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument();
    expect(screen.getByText('이번 상담에서 5번 더 질문할 수 있어요')).toBeInTheDocument();
  });

  it('의료 라우트도 같은 경로로 화면에 도달한다', async () => {
    await ask('제 사주에 암이 있나요?', MEDICAL_TEXT);
    await waitFor(() => expect(screen.getByText(/사주로 질병을 진단하거나/)).toBeInTheDocument());
    expect(document.body.textContent).toContain('의료 전문가와 상담해 주세요');
  });

  it('360dp — 위기 안내가 넘치도록 선언되지 않는다', async () => {
    const { container } = render(<ChatScreen />);
    sendResult.current = { success: true, responseText: SELF_HARM_TEXT, requestId: 'r1' };
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('메시지 입력창'), { target: { value: CRISIS_Q } });
    await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
    await waitFor(() => expect(screen.getByText(/지금 많이 힘드셨겠어요/)).toBeInTheDocument());
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    // ⚠ 번호가 nowrap 으로 잘리면 안 된다.
    expect(nowrapLongText(container)).toEqual([]);
  });
});

describe('오검출 방지 — 이미 한 번 틀렸던 자리', () => {
  it('투자 질문이 위기로 오라우팅되지 않는다', () => {
    // '투자해' 안의 '자해' 부분일치로 위기 응답이 나갔던 실제 사고. 룩비하인드로 막혀 있다.
    for (const q of ['지금 대출을 받아서 투자해도 될까?', '가상자산에 투자해도 괜찮을까요?', '부동산에 출자해도 되나요?']) {
      expect(classifyConsultationSafetyRoute(q)).not.toBe('SELF_HARM');
    }
  });

  it('일반적인 힘듦은 위기로 잡지 않는다 — 정신건강 대화 시스템이 아니다', () => {
    for (const q of ['요즘 너무 힘들어요', '일이 잘 안 풀려서 지쳐요']) {
      expect(classifyConsultationSafetyRoute(q)).toBe('NORMAL');
    }
  });
});
