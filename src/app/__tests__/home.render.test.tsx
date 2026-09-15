// 홈 (/(tabs)/index) — 트래픽이 가장 몰리는 화면.
//
// 홈은 여덟 개 소스(지갑 · 오늘 · 이번 달 · 인기질문 · 우편함 · 최근상담 · 촛불 · 웰컴덕)를 한 화면에
// 모은다. 소스 계약이 못 보던 것: **하나가 실패해도 나머지가 그려지는가**. 홈의 진짜 실패 모드는
// 개별 카드의 오류가 아니라 화면 전체가 안 뜨는 것이다.
//
// ⚠ 절기 경계일 경고가 홈에도 있다 — 등록 화면·오늘 화면과 같은 판정 모듈을 쓰는 세 번째 자리다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const getLatest = jest.fn();
jest.mock('@/features/today', () => {
  const actual = jest.requireActual('@/features/today');
  return { ...actual, __esModule: true, todayFortuneService: { loadLatest: () => getLatest() } };
});
const getLatestMonthly = jest.fn();
jest.mock('@/features/monthly', () => {
  const actual = jest.requireActual('@/features/monthly');
  return { ...actual, __esModule: true, monthlyFortuneService: { loadLatest: () => getLatestMonthly() } };
});
const listPopularQuestions = jest.fn();
jest.mock('@/features/popular-questions', () => ({
  __esModule: true,
  resolveActivePopularQuestions: () => listPopularQuestions(),
  trackPopularQuestionImpression: jest.fn(),
  trackPopularQuestionClick: jest.fn(),
}));
const listConversationsForSubject = jest.fn();
jest.mock('@/features/chat', () => ({
  __esModule: true,
  conversationService: { listConversationsForSubject: (id: string) => listConversationsForSubject(id) },
}));
const listFortuneMail = jest.fn();
jest.mock('@/features/fortune', () => {
  const actual = jest.requireActual('@/features/fortune');
  return { ...actual, __esModule: true, fortuneMailService: { listMail: () => listFortuneMail() } };
});
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false }),
}));
jest.mock('@/features/duk/welcomeSignal', () => ({ __esModule: true, consumeWelcomePending: () => false }));
jest.mock('@/features/retention', () => {
  // 배럴에서 알림 훅만 대체한다 — 나머지(birthMonthDay 등 순수 함수)는 진짜를 그대로 쓴다.
  const actual = jest.requireActual('@/features/retention');
  return { ...actual, __esModule: true, useNotificationUnread: () => ({ unreadCount: 0, refresh: jest.fn() }) };
});

let walletState: { totalSpendable: number } | null = { totalSpendable: 120 };
let walletLoading = false;
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: walletState, loading: walletLoading, error: null, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));

let draftSubject: { id: string; displayName: string; relationship: string | null; birthInfo?: unknown } | null = null;
let selfSubjects: unknown[] = [];
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationDraft: () => ({ draft: { subject: draftSubject }, updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  useConsultationSubjects: () => ({ subjects: selfSubjects, status: 'ready', reload: jest.fn() }),
  isSavedSubjectId: (id: string) => typeof id === 'string' && id.startsWith('subj-'),
  setPendingConsultationIntent: jest.fn(),
}));

import { routerMock } from '../../../jest.render.setup';
import HomeScreen from '../(tabs)/index';
import { SELF_SUBJECT } from './todayFixture';

const SUBJECT = { id: 'subj-1', displayName: '김덕분', relationship: '본인', birthInfo: SELF_SUBJECT.birthInfo };
const BOUNDARY = {
  ...SUBJECT,
  birthInfo: { ...SELF_SUBJECT.birthInfo, birthYear: '1996', birthMonth: '10', birthDay: '8', birthTimeAccuracy: 'unknown', birthHour: '', birthMinute: '' },
};

beforeEach(() => {
  setViewport(360);
  draftSubject = SUBJECT;
  selfSubjects = [{ ...SUBJECT, isSelf: true }];
  walletState = { totalSpendable: 120 };
  walletLoading = false;
  getLatest.mockReset().mockResolvedValue(null);
  getLatestMonthly.mockReset().mockResolvedValue(null);
  listPopularQuestions.mockReset().mockResolvedValue([]);
  listConversationsForSubject.mockReset().mockResolvedValue([]);
  listFortuneMail.mockReset().mockResolvedValue([]);
  routerMock.push.mockClear();
});

// 우편함 헤더는 상태와 무관하게 늘 그려지므로 '홈이 떴다' 의 기준으로 쓴다.
const settle = async () => {
  await waitFor(() => expect(screen.getByText('운세우편함')).toBeInTheDocument());
  await act(async () => {});
};

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('마운트', () => {
  it('여덟 소스가 전부 비어 있어도 홈은 그려진다', async () => {
    await act(async () => { render(<HomeScreen />); });
    await settle();
    expect(screen.getByText('운세우편함')).toBeInTheDocument();
    expect(screen.getByText('아직 도착한 운세가 없어요')).toBeInTheDocument();
    // 최근 상담 섹션은 기록이 있을 때만 그려진다 — 없으면 빈 헤더를 남기지 않는다.
    expect(screen.queryByText('최근 상담')).toBeNull();
  });

  it('⚠ 한 소스가 실패해도 나머지 화면이 살아 있다', async () => {
    getLatest.mockRejectedValue(new Error('today down'));
    getLatestMonthly.mockRejectedValue(new Error('monthly down'));
    listPopularQuestions.mockRejectedValue(new Error('popular down'));
    listFortuneMail.mockRejectedValue(new Error('mail down'));
    listConversationsForSubject.mockRejectedValue(new Error('chat down'));
    await act(async () => { render(<HomeScreen />); });
    await settle();
    // 카드 하나가 죽어도 홈 자체는 남는다 — 홈의 진짜 실패 모드는 전면 백지다.
    expect(screen.getByText('운세우편함')).toBeInTheDocument();
    // 질문 작성기와 우편함 헤더는 데이터 소스와 무관한 자리다 — 이 둘이 남아 있으면 홈은 살아 있다.
    expect(screen.getByText('아직 도착한 운세가 없어요')).toBeInTheDocument();
    expect(document.body.textContent).toMatch(/덕/);
  });
});

describe('⚠ 절기 경계일 경고 — 홈이 세 번째 자리', () => {
  it('경계일 계정이면 홈에도 경고가 뜬다', async () => {
    draftSubject = BOUNDARY;
    selfSubjects = [{ ...BOUNDARY, isSelf: true }];
    await act(async () => { render(<HomeScreen />); });
    await waitFor(() => expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument());
    // 홈에서는 surface 판 — 저장 버튼이 아니라 수정/나중에.
    expect(screen.getByText('출생정보 수정')).toBeInTheDocument();
    expect(screen.queryByText('이대로 저장')).toBeNull();
  });

  it('경계일이 아니면 뜨지 않는다', async () => {
    await act(async () => { render(<HomeScreen />); });
    await settle();
    expect(screen.queryByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeNull();
  });

  it('닫으면 사라진다 — 배너이지 차단이 아니다', async () => {
    draftSubject = BOUNDARY;
    selfSubjects = [{ ...BOUNDARY, isSelf: true }];
    await act(async () => { render(<HomeScreen />); });
    await waitFor(() => expect(screen.getByText('나중에')).toBeInTheDocument());
    fireEvent.click(screen.getByText('나중에'));
    expect(screen.queryByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeNull();
  });
});

describe('인기 질문', () => {
  it('있으면 목록이 뜨고, 누르면 상담으로 간다', async () => {
    listPopularQuestions.mockResolvedValue([
      { analyticsKey: 'q1', questionText: '올해 이직해도 괜찮을까요?', category: 'CAREER', askedCount: 128 },
      { analyticsKey: 'q2', questionText: '지금 만나는 사람과 잘 될까요?', category: 'LOVE', askedCount: 96 },
    ]);
    await act(async () => { render(<HomeScreen />); });
    await waitFor(() => expect(screen.getByText('지금 많이 물어봐요')).toBeInTheDocument());
    expect(screen.getByText('올해 이직해도 괜찮을까요?')).toBeInTheDocument();
    expect(screen.getByText('지금 만나는 사람과 잘 될까요?')).toBeInTheDocument();
  });

  it('비어 있으면 섹션 자체를 그리지 않는다', async () => {
    await act(async () => { render(<HomeScreen />); });
    await settle();
    expect(screen.queryByText('지금 많이 물어봐요')).toBeNull();
  });
});

describe('덕 잔액', () => {
  it('잔액이 화면에 보인다', async () => {
    await act(async () => { render(<HomeScreen />); });
    await settle();
    expect(document.body.textContent).toMatch(/120/);
  });

  it('지갑을 아직 모를 때(로딩 중) 0으로 단정하지 않는다', async () => {
    walletState = null;
    walletLoading = true;
    await act(async () => { render(<HomeScreen />); });
    await settle();
    expect(document.body.textContent).not.toMatch(/0덕/);
  });
});

it('질문 작성기에 상담 비용이 붙어 있다', async () => {
  const { DUK_PRICES } = jest.requireActual('@/features/duk/pricing');
  await act(async () => { render(<HomeScreen />); });
  await settle();
  expect(document.body.textContent).toContain(`${DUK_PRICES.general}덕`);
});

it('360dp — 긴 인기질문과 긴 상담 요약이 함께 있어도 넘치도록 선언된 폭이 없다', async () => {
  listPopularQuestions.mockResolvedValue([
    { analyticsKey: 'q1', questionText: '올해 하반기에 이직을 고민 중인데 지금 회사에 남는 편이 나을지 옮기는 편이 나을지 궁금합니다', category: 'CAREER', askedCount: 128 },
  ]);
  listConversationsForSubject.mockResolvedValue([
    { id: 'c1', summary: '올해 하반기 이직 시기를 물었고 상반기에는 준비에 집중하라는 답을 받았습니다.', updatedAt: '2026-09-05T00:00:00Z', subjectSnapshot: null },
  ]);
  let container!: HTMLElement;
  await act(async () => { ({ container } = render(<HomeScreen />)); });
  await settle();
  expect(fixedWidthsOver(container, 360)).toEqual([]);
  expect(nowrapLongText(container)).toEqual([]);
});
