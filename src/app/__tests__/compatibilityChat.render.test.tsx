// 궁합 대화 본문 (/compatibility-chat) — 소비자 핵심 화면 중 마지막 렌더 미검증 구간.
//
// 세션 경계 가드는 소스 계약으로 이미 잠겨 있다(`paidConsent.render.test.tsx`). 여기서 보는 것은
// **대화가 실제로 그려지는가** 와 **경계·부족·오류가 화면에 도달하는가** 다.
//
// ⚠ 원래 버그의 자리: 컴포저는 소진 시 언마운트되는데 follow-up chip 은 같은 `send()` 를 부르면서
// 언마운트되지 않아 6번째 질문이 조용히 두 번째 12덕 세션을 열었다. 여기서는 **화면 쪽 결과**를 본다 —
// 소진 시 컴포저가 사라지고 동의 카드가 가격과 함께 뜨는가.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

// ⚠ mock 이 돌려주는 객체·함수는 **모듈 상수**여야 한다. 매 렌더마다 새로 만들면 의존성 배열이
// 계속 바뀌어 화면이 무한 리렌더에 빠지고, 테스트는 실패가 아니라 **멈춘다**.
const sendResult = { current: null as unknown };
const sendCalls = jest.fn();
const SERVICE = { sendMessage: async (...a: unknown[]) => { sendCalls(...a); return sendResult.current; } };
jest.mock('@/features/compatibility/services/compatibilityConsultationService', () => ({
  __esModule: true,
  createCompatibilityConsultationService: () => SERVICE,
}));

let session: Record<string, unknown> | null = null;
jest.mock('@/features/duk/dukClientContract', () => {
  const actual = jest.requireActual('@/features/duk/dukClientContract');
  return { ...actual, __esModule: true, getSessionStatus: () => Promise.resolve(session) };
});
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false, nextAvailableAtEpoch: null, rewardAmount: 1 }),
}));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));

// self 는 subjects 에서 isSelf 로, target 은 라우트 파라미터 targetId 로 찾는다.
const SELF = { id: 'subj-1', displayName: '김덕분', relationship: '본인', isSelf: true, birthInfo: {} };
const TARGET = { id: 'subj-2', displayName: '박상대', relationship: '친구', isSelf: false, birthInfo: {} };
const SUBJECTS = [SELF, TARGET];
// 1996-10-08 = 寒露 경계일. 딥링크로 이 화면에 바로 와도 12덕이 나가면 안 된다 — 백스톱 검증용.
const TARGET_BOUNDARY = {
  ...TARGET,
  birthInfo: { calendarType: 'solar', lunarMonthType: null, birthYear: '1996', birthMonth: '10', birthDay: '8', birthTimeAccuracy: 'unknown' },
};
const SUBJECTS_BOUNDARY = [SELF, TARGET_BOUNDARY];
let CURRENT_SUBJECTS: unknown[] = SUBJECTS;
const PENDING = { self: SELF, target: TARGET };
jest.mock('@/features/consultation', () => {
  const actual = jest.requireActual('@/features/consultation');
  return {
    ...actual,
    __esModule: true,
    useConsultationSubjects: () => ({ subjects: CURRENT_SUBJECTS, status: 'ready', reload: jest.fn() }),
    useConsultationDraft: () => ({ draft: { subject: SELF }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  };
});
jest.mock('@/features/compatibility/services/pendingCompatibilitySubject', () => ({
  __esModule: true,
  consumePendingCompatibilityPair: () => PENDING,
  getPendingCompatibilityPair: () => PENDING,
  setPendingCompatibilityPair: jest.fn(),
}));
const NO_ROWS: unknown[] = [];
jest.mock('@/features/chat/report/reportService', () => ({
  __esModule: true,
  reportService: { createCompatibilityReport: jest.fn(), listReportsByType: () => Promise.resolve(NO_ROWS) },
}));

import { DUK_PRICES } from '@/features/duk/pricing';

import CompatibilityChatScreen from '../compatibility-chat';

const HOUR = 3600 * 1000;
const liveSession = (used: number, limit = 5) => ({
  active: true, sessionId: 's1', productType: 'compatibility',
  successfulTurnCount: used, turnLimit: limit,
  expiresAt: new Date(Date.now() + 12 * HOUR).toISOString(),
});

// 실물 길이의 답변 — 짧은 더미로는 360dp 넘침도 줄바꿈도 볼 수 없다.
const LONG_ANSWER =
  '두 분은 전체적으로 잘 맞는 편이에요. 서로의 속도가 달라 한쪽이 앞서 나갈 때 다른 한쪽이 따라가느라 '
  + '지치기 쉬운데, 그 지점만 서로 알고 있으면 오래 갑니다. 금전 감각은 보완되는 쪽이라 큰 마찰은 적겠고, '
  + '대화의 결이 어긋나는 순간이 관계의 고비가 됩니다. 먼저 말을 꺼내는 쪽이 손해라고 느끼지 않게 하세요.';

const TIER = {
  overall: 'GOOD', overallLabel: '잘 맞는 편',
  dimensions: [{ key: 'bond', title: '유대', signal: '보통', verdict: '무난합니다' }],
  reducedPrecision: false, selfLabel: '김덕분', targetLabel: '박상대',
  engineVersion: 'v1', tierModelVersion: 'v1',
};

const ok = (text: string, extra: Record<string, unknown> = {}) => ({
  success: true, responseText: text, requestId: 'r1', ...extra,
});

beforeEach(() => {
  setViewport(360);
  CURRENT_SUBJECTS = SUBJECTS;
  sendCalls.mockClear();
  session = liveSession(0);
  sendResult.current = ok(LONG_ANSWER, { compatibility: TIER });
  (globalThis as Record<string, unknown>).__routeParams = { selfId: 'subj-1', targetId: 'subj-2' };
});

const ask = async (q = '저희 둘 잘 맞나요?') => {
  render(<CompatibilityChatScreen />);
  await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('메시지 입력창'), { target: { value: q } });
  await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
};

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('대화 본문', () => {
  it('사용자 질문과 답변이 둘 다 그려지고 서로 구분된다', async () => {
    await ask('저희 둘 잘 맞나요?');
    await waitFor(() => expect(document.body.textContent).toContain(LONG_ANSWER.slice(0, 30)));
    // 사용자 메시지도 남아 있다 — 보낸 뒤 사라지지 않는다.
    expect(screen.getByText('저희 둘 잘 맞나요?')).toBeInTheDocument();
  });

  it('궁합 등급 카드가 답변과 함께 나온다', async () => {
    await ask();
    await waitFor(() => expect(document.body.textContent).toMatch(/잘 맞는 편/));
  });

  it('⚠ 빈 입력으로 눌러도 서버를 부르지 않는다 — 다만 버튼은 잠기지 않는다 (일반 상담과 다름)', async () => {
    render(<CompatibilityChatScreen />);
    // ⚠ 이 화면은 도착하는 순간 **첫 질문을 자동 전송한다**(12덕을 이미 낸 궁합 결과이므로).
    // 그래서 '답변이 없다' 로는 확인할 수 없고 호출 횟수로 본다.
    await waitFor(() => expect(sendCalls).toHaveBeenCalledTimes(1));
    await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
    expect(sendCalls).toHaveBeenCalledTimes(1);
    // ⚠ 일반 상담(chat.tsx)은 입력이 비면 전송 버튼을 회색 처리하는데 궁합은 하지 않는다.
    // 어포던스 불일치이고 디자인 판단이라 고치지 않았다 (PROJECT_STATE §7.28).
    expect(screen.getByLabelText('메시지 전송').getAttribute('aria-disabled')).not.toBe('true');
  });

  it('360dp — 긴 답변에서도 넘치도록 선언된 폭이 없다', async () => {
    const { container } = render(<CompatibilityChatScreen />);
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('메시지 입력창'), { target: { value: '질문' } });
    await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
    await waitFor(() => expect(document.body.textContent).toContain(LONG_ANSWER.slice(0, 30)));
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});

describe('⚠ 세션 경계 — 소진 시 컴포저가 사라지고 동의 카드가 가격과 함께 뜬다', () => {
  it('5턴을 다 쓰면 동의 카드가 뜨고 컴포저가 사라진다', async () => {
    session = liveSession(5, 5);
    render(<CompatibilityChatScreen />);
    await waitFor(() => expect(screen.getByText('이번 궁합 상담의 질문을 모두 썼어요')).toBeInTheDocument());
    // 가격이 라벨에 있다 — 다음 질문이 조용히 두 번째 결제가 되지 않는다.
    expect(screen.getByText(new RegExp(`새 궁합 상담 시작하기.*${DUK_PRICES.compatibility}덕`))).toBeInTheDocument();
    expect(screen.queryByLabelText('메시지 입력창')).toBeNull();
  });

  it('⚠ 만료된 세션은 소진이 아니다 — 지난 세션이 결제벽을 영구히 붙잡지 않는다', async () => {
    session = { ...liveSession(5, 5), expiresAt: new Date(Date.now() - HOUR).toISOString() };
    render(<CompatibilityChatScreen />);
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    expect(screen.queryByText('이번 궁합 상담의 질문을 모두 썼어요')).toBeNull();
  });

  it('남은 질문 수가 서버 값으로 표시된다', async () => {
    session = liveSession(2, 5);
    await ask();
    await waitFor(() => expect(document.body.textContent).toMatch(/3번 더 질문할 수 있어요/));
  });
});

describe('오류·부족 안내가 화면에 도달한다', () => {
  it('덕 부족이면 충전 경로가 뜬다', async () => {
    sendResult.current = {
      success: false, errorCode: 'INSUFFICIENT_DUK',
      insufficientDuk: { balance: 1, required: DUK_PRICES.compatibility, shortfall: DUK_PRICES.compatibility - 1 },
    };
    await ask();
    await waitFor(() => expect(document.body.textContent).toMatch(/부족|충전/));
  });

  // 2026-09-06 갱신 — 이 자리는 원래 **결함을 잠그고 있었다**(문구가 없어 REQUEST_FAILED 로 폴백해
  // "잠시 후 다시 시도해 주세요" 가 떴다). 그 안내는 사실이 아니다: 같은 출생정보로 재시도하면 똑같이
  // 실패한다. 이제 세 가지를 반드시 말한다 — ① 왜 안 되는지 ② 무과금 ③ 다음에 할 행동.
  it('GROUNDING_UNAVAILABLE — 이유·무과금·다음 행동 세 가지가 모두 화면에 있다', async () => {
    sendResult.current = { success: false, errorCode: 'GROUNDING_UNAVAILABLE' };
    await ask();
    await waitFor(() => expect(document.body.textContent).toContain('사주를 세울 수 없어서'));
    const body = document.body.textContent ?? '';
    expect(body).toContain('차감되지 않');       // ② 무과금
    expect(body).toContain('태어난 시각');        // ③ 무엇을 고쳐야 하는지
    expect(body).not.toContain('잠시 후 다시');   // ⚠ 사실이 아닌 안내가 사라졌다
    // ③ 은 문구만이 아니라 **갈 곳**이어야 한다.
    expect(screen.getByText('출생 정보 확인하기')).toBeInTheDocument();
  });

  it('서버가 자기 설명을 실어 보내면 그쪽을 먼저 쓴다 — 어느 입력인지는 서버만 안다', async () => {
    const SERVER = '등록하신 생일이 절기 경계일이라 정확한 태어난 시각이 있어야 풀이를 드릴 수 있습니다.';
    sendResult.current = { success: false, errorCode: 'GROUNDING_UNAVAILABLE', message: SERVER };
    await ask();
    await waitFor(() => expect(document.body.textContent).toContain(SERVER));
    expect(document.body.textContent).not.toContain('잠시 후 다시');
  });

  it('네트워크 실패도 문구가 도달한다', async () => {
    sendResult.current = { success: false, errorCode: 'REQUEST_FAILED' };
    await ask();
    await waitFor(() => expect(document.body.textContent).toContain('지금 처리하지 못했어요'));
  });
});

describe('접근성 — 직전 트랙 기준 적용', () => {
  it('입력칸·전송 버튼에 접근 이름이 있다', async () => {
    render(<CompatibilityChatScreen />);
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    expect(screen.getByLabelText('메시지 전송')).toBeInTheDocument();
  });

  it('이름 없는 상호작용 요소가 없다', async () => {
    const { container } = render(<CompatibilityChatScreen />);
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    const nameless = Array.from(container.querySelectorAll('[role="button"], input, textarea'))
      .filter((el) => !el.getAttribute('aria-label') && !(el.textContent ?? '').trim())
      .map((el) => el.tagName.toLowerCase());
    expect(nameless).toEqual([]);
  });
});

// ── ⚠ 절기 경계일 백스톱 (2026-09-06) ────────────────────────────────────────────────────────────
//
// 정문(궁합 탭)에서 이미 막지만 이 화면은 라우트라 딥링크로 바로 올 수 있고, **도착 즉시 자동 전송**한다.
// 서버는 두 차트가 다 없어도 실패하지 않고 12덕을 받아 간다(측정됨) — 그래서 여기서도 막는다.
describe('⚠ 절기 경계일 — 딥링크로 와도 12덕이 나가지 않는다', () => {
  beforeEach(() => { CURRENT_SUBJECTS = SUBJECTS_BOUNDARY; });

  it('자동 전송이 일어나지 않는다 — 서버를 한 번도 부르지 않는다', async () => {
    await act(async () => { render(<CompatibilityChatScreen />); });
    await act(async () => {});
    expect(sendCalls).not.toHaveBeenCalled();
  });

  it('왜 막혔는지와 무엇을 하면 되는지가 화면에 있다', async () => {
    await act(async () => { render(<CompatibilityChatScreen />); });
    await waitFor(() => expect(screen.getByText(/태어난 시각을 알아야 궁합을 볼 수 있어요/)).toBeInTheDocument());
    expect(screen.getByText(/박상대 님의/)).toBeInTheDocument();
    expect(screen.getByText('태어난 시각 입력하기')).toBeInTheDocument();
  });

  it('컴포저가 남아 있어도 잠겨 있다 — 눌러도 서버를 부르지 않는다', async () => {
    await act(async () => { render(<CompatibilityChatScreen />); });
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('메시지 입력창'), { target: { value: '저희 둘 잘 맞나요?' } });
    await act(async () => { fireEvent.click(screen.getByLabelText('메시지 전송')); });
    expect(sendCalls).not.toHaveBeenCalled();
  });

  it('경계일이 아니면 예전처럼 자동 전송한다 — 게이트가 정상 경로를 막지 않는다', async () => {
    CURRENT_SUBJECTS = SUBJECTS;
    await act(async () => { render(<CompatibilityChatScreen />); });
    await waitFor(() => expect(sendCalls).toHaveBeenCalled());
  });
});
