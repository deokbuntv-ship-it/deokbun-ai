// 궁합 대화 — 다크모드 (2026-09-06 추가).
//
// ⚠ 파일이 따로인 이유: react-native-web 의 `Appearance` 는 **모듈 로드 시점에** matchMedia 를
// 캐시한다. `compatibilityChat.render.test.tsx` 는 최상단에서 화면을 import 하므로 그 파일 안에서
// 나중에 다크로 바꿔도 이미 늦었다 — 조용히 라이트로 돈다. `darkModeCore.render.test.tsx` 가 별도
// 파일인 것도 같은 이유다.
import { setColorScheme } from '@/test-support/renderAudit';

setColorScheme('dark');

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { colors } from '@/theme';

const sendResult = { current: null as unknown };
const SERVICE = { sendMessage: async () => sendResult.current };
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

const SELF = { id: 'subj-1', displayName: '김덕분', relationship: '본인', isSelf: true, birthInfo: {} };
const TARGET = { id: 'subj-2', displayName: '박상대', relationship: '친구', isSelf: false, birthInfo: {} };
const SUBJECTS = [SELF, TARGET];
// 1996-10-08 = 寒露 경계일 — 차단 안내도 다크를 따라야 한다.
const SUBJECTS_BOUNDARY = [
  SELF,
  { ...TARGET, birthInfo: { calendarType: 'solar', lunarMonthType: null, birthYear: '1996', birthMonth: '10', birthDay: '8', birthTimeAccuracy: 'unknown' } },
];
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

import CompatibilityChatScreen from '../compatibility-chat';

const HOUR = 3600 * 1000;
const liveSession = (used: number) => ({
  active: true, sessionId: 's1', productType: 'compatibility',
  successfulTurnCount: used, turnLimit: 5,
  expiresAt: new Date(Date.now() + 12 * HOUR).toISOString(),
});

const ANSWER =
  '두 분은 전체적으로 잘 맞는 편이에요. 서로의 속도가 달라 한쪽이 앞서 나갈 때 다른 한쪽이 따라가느라 '
  + '지치기 쉬운데, 그 지점만 서로 알고 있으면 오래 갑니다.';

/** 이 하위 트리가 밝은 팔레트의 배경색을 하나라도 칠했는가 (`darkModeCore` 와 같은 판정). */
const usesLightSurfaces = (root: HTMLElement): string[] => {
  const light = new Set(
    [colors.light.surface, colors.light.background, colors.light.backgroundElevated, colors.light.backgroundSelected]
      .map((h) => String(h).toUpperCase()),
  );
  const hits: string[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(el.style.backgroundColor);
    if (!m) continue;
    const hex = `#${m.slice(1, 4).map((v) => Number(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    if (light.has(hex)) hits.push(hex);
  }
  return hits;
};

beforeEach(() => {
  CURRENT_SUBJECTS = SUBJECTS;
  session = liveSession(0);
  sendResult.current = { success: true, responseText: ANSWER, requestId: 'r1' };
  (globalThis as Record<string, unknown>).__routeParams = { selfId: 'subj-1', targetId: 'subj-2' };
});

it('스텁이 실제로 먹었다 — 이 확인이 없으면 아래 둘 다 거짓 통과다', () => {
  expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  expect(colors.dark.surface).not.toBe(colors.light.surface);
});

it('대화 본문이 다크에서도 라이트 표면을 칠하지 않는다', async () => {
  let container!: HTMLElement;
  await act(async () => { ({ container } = render(<CompatibilityChatScreen />)); });
  // 이 화면은 도착하는 순간 첫 질문을 자동 전송한다 — 답변을 기다리면 말풍선까지 다 그려진 상태다.
  await waitFor(() => expect(screen.getByText(/서로의 속도가 달라/)).toBeInTheDocument());
  expect(usesLightSurfaces(container)).toEqual([]);
});

it('소진 동의 카드도 다크를 따른다 — 결제 직전 화면이라 특히', async () => {
  session = liveSession(5);
  let container!: HTMLElement;
  await act(async () => { ({ container } = render(<CompatibilityChatScreen />)); });
  await waitFor(() => expect(screen.queryByLabelText('메시지 입력창')).not.toBeInTheDocument());
  expect(usesLightSurfaces(container)).toEqual([]);
});

it('절기 경계일 차단 안내도 다크를 따른다 — 결제를 막는 화면이라 특히', async () => {
  CURRENT_SUBJECTS = SUBJECTS_BOUNDARY;
  let container!: HTMLElement;
  await act(async () => { ({ container } = render(<CompatibilityChatScreen />)); });
  await waitFor(() => expect(screen.getByText(/태어난 시각을 알아야 궁합을 볼 수 있어요/)).toBeInTheDocument());
  expect(usesLightSurfaces(container)).toEqual([]);
});
