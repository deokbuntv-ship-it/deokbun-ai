// 다크모드 — 여섯 화면이 어두운 배경에서 실제로 어두운 색을 쓰는가.
//
// 이것이 소스 계약으로 절대 볼 수 없는 종류다. 소스에는 `scheme === 'dark' ? colors.dark : colors.light`
// 라는 삼항식이 있을 뿐이고, 그 분기가 실제로 타는지 · 그 화면이 useColorScheme 을 아예 부르긴 하는지는
// 렌더해야 안다. jsdom 에는 matchMedia 가 없어서 스텁을 넣지 않으면 **모든 렌더가 조용히 light 로만
// 돈다** — 다크 분기가 한 줄도 실행되지 않는 채로 초록불이 뜬다.
//
// ⚠ 못 하는 것: 실제 대비비(WCAG)를 색상 토큰 쌍으로 검증하는 것은 `brandTokens.test.ts` 의 일이다.
// 여기서는 "화면이 다크 팔레트를 집어 왔는가"까지만 본다.
import { setColorScheme } from '@/test-support/renderAudit';

// react-native-web 의 Appearance 는 모듈 로드 시 미디어쿼리를 캐시한다 — import 보다 먼저 켜야 한다.
setColorScheme('dark');

import { render, screen, waitFor } from '@testing-library/react';

import { colors } from '@/theme';

jest.mock('@/features/premium/services/premiumReportService', () => ({
  __esModule: true,
  premiumReportService: { generate: jest.fn(), save: jest.fn() },
}));
jest.mock('@/features/support/supportService', () => ({
  __esModule: true,
  listMyInquiries: () => Promise.resolve([]),
  submitInquiry: jest.fn(),
  adminListInquiries: () => Promise.resolve({ kind: 'ok', rows: [] }),
  adminAnswerInquiry: jest.fn(),
}));
jest.mock('@/features/account/accountDeletionService', () => ({
  __esModule: true,
  fetchDeletionPreview: () => Promise.resolve({ dukBalance: 10, subjectCount: 1, consultationCount: 1, reportCount: 1 }),
  deleteAccount: jest.fn(),
}));
jest.mock('@/features/retention', () => ({ __esModule: true, unregisterOnLogout: () => Promise.resolve() }));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1', email: 'a@b.com' } } }),
}));

import { BoundaryTimeNotice } from '@/features/consultation/components/BoundaryTimeNotice';
import { SharedReportPreview } from '@/features/chat/report/SharedReportPreview';

import AccountDeleteScreen from '../account-delete';
import PremiumReportScreen from '../premium';
import SupportScreen from '../support';

/** 이 하위 트리가 밝은 팔레트의 배경색을 하나라도 칠했는가. */
const usesLightSurfaces = (root: HTMLElement): string[] => {
  const light = new Set([colors.light.surface, colors.light.background, colors.light.backgroundElevated, colors.light.backgroundSelected]
    .map((h) => String(h).toUpperCase()));
  const hits: string[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    const bg = el.style.backgroundColor;
    if (!bg) continue;
    const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(bg);
    if (!m) continue;
    const hex = `#${m.slice(1, 4).map((v) => Number(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    if (light.has(hex)) hits.push(hex);
  }
  return hits;
};

it('스텁이 실제로 먹었다 — 이 확인이 없으면 아래 전부가 거짓 통과다', () => {
  expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  expect(colors.dark.surface).not.toBe(colors.light.surface);
});

it('절기 경고 — 다크에서 라이트 표면을 칠하지 않는다', () => {
  const { container } = render(<BoundaryTimeNotice context="form" onEnterTime={jest.fn()} onSaveAnyway={jest.fn()} />);
  expect(screen.getByText('시각 입력하기')).toBeInTheDocument();
  expect(usesLightSurfaces(container)).toEqual([]);
});

it('Premium — 다크에서도 구매 확인 카드가 그려진다', () => {
  const { container } = render(<PremiumReportScreen />);
  expect(screen.getByText('타고난 결과 앞으로 열두 달을 한 번에 봅니다')).toBeInTheDocument();
  expect(usesLightSurfaces(container)).toEqual([]);
});

it('계정 탈퇴 — 다크에서도 위험 버튼과 안내가 보인다', async () => {
  const { container } = render(<AccountDeleteScreen />);
  await waitFor(() => expect(screen.getByText('탈퇴하기')).toBeInTheDocument());
  expect(screen.getByText('그동안 함께해 주셔서 고마웠어요.')).toBeInTheDocument();
  expect(usesLightSurfaces(container)).toEqual([]);
});

it('CS 문의 — 다크에서도 입력칸과 칩이 보인다', async () => {
  const { container } = render(<SupportScreen />);
  await waitFor(() => expect(screen.getByLabelText('문의 내용')).toBeInTheDocument());
  expect(screen.getByText('오류 신고')).toBeInTheDocument();
  expect(usesLightSurfaces(container)).toEqual([]);
});

it('공유 미리보기 — 잠긴 블록이 다크 팔레트를 쓴다', () => {
  const { container } = render(
    <SharedReportPreview
      preview={{ conclusion: '두 분은 전체적으로 잘 맞는 편이에요.', reportKind: 'compatibility', lockedCounts: { findings: 3, cautions: 1, topics: 2 } }}
      onOpenFull={jest.fn()}
    />,
  );
  expect(screen.getByText(/분야별 해석 3가지/)).toBeInTheDocument();
  // 잠긴 블록은 backgroundSelected 를 쓴다 — 다크 판이 라이트 판과 달라야 한다.
  const locked = Array.from(container.querySelectorAll<HTMLElement>('*'))
    .map((el) => el.style.backgroundColor)
    .filter(Boolean);
  expect(locked.length).toBeGreaterThan(0);
  expect(usesLightSurfaces(container)).toEqual([]);
});
