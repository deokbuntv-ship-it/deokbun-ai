// 다크모드 — 홈 · 오늘 · 상담 (2026-09-06 추가).
//
// 여섯 화면분은 `darkMode.render.test.tsx` 에 있다. 이 셋은 mock 표면이 완전히 달라서(지갑 · 오늘 ·
// 이번 달 · 인기질문 · 우편함 · 대화) 파일을 나눴다.
//
// ⚠ jsdom 에는 matchMedia 가 없어 스텁 없이는 **모든 렌더가 조용히 light 로 돈다**. 그리고
// react-native-web 의 Appearance 는 모듈 로드 시 쿼리를 캐시하므로 화면 import 보다 먼저 켜야 한다.
import { setColorScheme } from '@/test-support/renderAudit';

setColorScheme('dark');

import { render, screen, waitFor, act } from '@testing-library/react';

import { colors } from '@/theme';

jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));
jest.mock('@/features/today', () => {
  const actual = jest.requireActual('@/features/today');
  return {
    ...actual,
    __esModule: true,
    todayFortuneService: {
      ensureToday: () => Promise.resolve({ status: 'ok', record: require('./todayFixture').TODAY_RECORD, cacheHit: true }),
      getByDate: () => Promise.resolve(null),
      loadLatest: () => Promise.resolve(null),
    },
    trackTodayEvent: jest.fn(),
  };
});
jest.mock('@/features/monthly', () => {
  const actual = jest.requireActual('@/features/monthly');
  return { ...actual, __esModule: true, monthlyFortuneService: { loadLatest: () => Promise.resolve(null) } };
});
jest.mock('@/features/popular-questions', () => ({
  __esModule: true,
  resolveActivePopularQuestions: () => Promise.resolve([]),
  trackPopularQuestionImpression: jest.fn(),
  trackPopularQuestionClick: jest.fn(),
}));
jest.mock('@/features/fortune', () => {
  const actual = jest.requireActual('@/features/fortune');
  return { ...actual, __esModule: true, fortuneMailService: { listMail: () => Promise.resolve([]) } };
});
jest.mock('@/features/chat', () => ({
  __esModule: true,
  conversationService: { listConversationsForSubject: () => Promise.resolve([]) },
}));
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: { totalSpendable: 120 }, loading: false, error: null, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false }),
}));
jest.mock('@/features/duk/welcomeSignal', () => ({ __esModule: true, consumeWelcomePending: () => false }));
jest.mock('@/features/retention', () => {
  const actual = jest.requireActual('@/features/retention');
  return { ...actual, __esModule: true, useNotificationUnread: () => ({ unreadCount: 0, refresh: jest.fn() }) };
});
jest.mock('@/features/consultation', () => {
  const subject = {
    id: 'subj-1', displayName: '김덕분', relationship: '본인', isSelf: true,
    birthInfo: require('./todayFixture').SELF_SUBJECT.birthInfo,
  };
  return {
    __esModule: true,
    useConsultationDraft: () => ({ draft: { subject }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
    useConsultationSubjects: () => ({ subjects: [subject], status: 'ready', reload: jest.fn() }),
    isSavedSubjectId: () => true,
    setPendingConsultationIntent: jest.fn(),
  };
});

import ConsultationListScreen from '../(tabs)/consult';
import HomeScreen from '../(tabs)/index';
import TodayScreen from '../today';

/** 이 하위 트리가 밝은 팔레트의 배경색을 하나라도 칠했는가. */
const usesLightSurfaces = (root: HTMLElement): string[] => {
  const light = new Set([colors.light.surface, colors.light.background, colors.light.backgroundElevated, colors.light.backgroundSelected]
    .map((h) => String(h).toUpperCase()));
  const hits: string[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(el.style.backgroundColor);
    if (!m) continue;
    const hex = `#${m.slice(1, 4).map((v) => Number(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    if (light.has(hex)) hits.push(hex);
  }
  return hits;
};

it('스텁이 실제로 먹었다 — 이 확인이 없으면 아래 셋 전부가 거짓 통과다', () => {
  expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  expect(colors.dark.surface).not.toBe(colors.light.surface);
});

it('오늘의 운세 — 다크에서도 결과가 그려진다', async () => {
  const { container } = render(<TodayScreen />);
  await waitFor(() => expect(screen.getByText(/벌이기보다 매듭을 짓는/)).toBeInTheDocument());
  // ⚠ 실측: `use-color-scheme.web` 은 첫 렌더에서 무조건 'light' 를 돌려주고 hydration 효과 뒤에
  // 뒤집는다(정적 렌더 대응). 오늘의 결과는 **비동기 로드 뒤에 마운트**되므로 그 한 프레임 동안
  // 라이트 표면이 실제로 칠해진다 — 실기기에도 존재하는 현상이고 `KNOWN_RISKS.md` L7 로 등재했다.
  // 여기서 잠그는 것은 '정착 후' 다.
  await waitFor(() => expect(usesLightSurfaces(container)).toEqual([]));
});

it('상담 탭 — 다크에서도 가격이 붙은 버튼이 보인다', async () => {
  const { container } = render(<ConsultationListScreen />);
  await waitFor(() => expect(screen.getByText(/새 상담 시작/)).toBeInTheDocument());
  expect(usesLightSurfaces(container)).toEqual([]);
});

it('홈 — 다크에서도 여러 카드가 함께 그려진다', async () => {
  let container!: HTMLElement;
  await act(async () => { ({ container } = render(<HomeScreen />)); });
  await waitFor(() => expect(screen.getByText('운세우편함')).toBeInTheDocument());
  expect(usesLightSurfaces(container)).toEqual([]);
});
