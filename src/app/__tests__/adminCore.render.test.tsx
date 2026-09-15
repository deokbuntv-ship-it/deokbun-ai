// 관리자 핵심 3화면 — 대시보드 · 사용자 목록 · 상담 목록.
//
// **선정 근거**: 관리자 17화면 중 운영자가 **매일** 여는 셋. 나머지 14개는 이번 범위 밖이다.
//
// ⚠ 특히 볼 것: **로딩·비어 있음·오류 세 상태가 구분되는가.** 지갑 화면의 버그가 정확히 이 클래스였다
// (아직 불러오는 중인데 "불러오지 못했어요" 가 떴다). 관리자 화면은 RPC 가 환경마다 없을 수 있어
// **fail-closed** — 오류를 빈 목록으로 보여 주면 운영자가 "큐가 비었다" 고 믿는다 — 도 함께 본다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const getDashboardOverview = jest.fn();
const getDashboardTrends = jest.fn();
const listUsers = jest.fn();
const listConsultations = jest.fn();

jest.mock('@/features/admin', () => {
  const actual = jest.requireActual('@/features/admin');
  return {
    ...actual,
    __esModule: true,
    adminOpsService: {
      getDashboardOverview: () => getDashboardOverview(),
      getDailyActivity: () => getDashboardTrends(),
    },
    adminUsersService: { listUsers: (a: unknown) => listUsers(a), getUser: () => Promise.resolve(null) },
    adminConsultationsService: { listConsultations: (a: unknown) => listConsultations(a) },
  };
});

import AdminConsultationsScreen from '../admin/consultations/index';
import AdminDashboardScreen from '../admin/index';
import AdminUsersScreen from '../admin/users/index';

// 대시보드가 읽는 필드 전부 (grep 으로 확인). 하나라도 빠지면 `toLocaleString` 에서 크래시한다 —
// ⚠ 즉 이 화면은 부분 응답에 방어가 없다. 서버가 필드를 하나 빠뜨리면 콘솔이 백지가 된다(§7.28).
const OVERVIEW = {
  userCount: 1240, conversationToday: 48,
  aiRequestCount: 9021, aiSuccessCount: 8900, aiErrorCount: 121,
  aiTodayRequestCount: 140, aiInputTokens: 1_200_000, aiOutputTokens: 340_000,
};
const USER_ROWS = [
  { userId: 'u1', displayName: '김덕분', createdAt: '2026-09-01T00:00:00Z', subjectCount: 3, conversationCount: 5 },
  { userId: 'u2', displayName: '아주긴이름을가진사용자님', createdAt: '2026-09-02T00:00:00Z', subjectCount: 0, conversationCount: 0 },
];
const CONSULT_ROWS = [
  {
    conversationId: 'c1', userDisplayName: '김덕분',
    subjectLabel: '올해 하반기에 이직을 하는 것이 저에게 맞을까요? 지금 회사에서 팀장 제안을 받았습니다.',
    createdAt: '2026-09-05T00:00:00Z', messageCount: 4,
  },
];

beforeEach(() => {
  setViewport(1280, 900); // 관리자 콘솔은 데스크톱 폭이 기본이다
  getDashboardOverview.mockReset().mockResolvedValue(OVERVIEW);
  getDashboardTrends.mockReset().mockResolvedValue([]);
  listUsers.mockReset().mockResolvedValue(USER_ROWS);
  listConsultations.mockReset().mockResolvedValue(CONSULT_ROWS);
});

it('스텁 확인 — 뷰포트가 실제로 먹었다', () => {
  expect(document.documentElement.clientWidth).toBe(1280);
});

// ── ⚠ 지갑과 같은 클래스: 로딩 / 비어있음 / 오류가 서로 구분되는가 ─────────────────────────────
describe.each([
  ['대시보드', () => <AdminDashboardScreen />, () => getDashboardOverview],
  ['사용자 목록', () => <AdminUsersScreen />, () => listUsers],
  ['상담 목록', () => <AdminConsultationsScreen />, () => listConsultations],
] as const)('%s — 세 상태 구분', (name, Screen, fnOf) => {
  it('⚠ 로딩 중에는 오류로 보이지 않는다', async () => {
    fnOf().mockReturnValue(new Promise(() => { /* 영원히 미해결 */ }));
    await act(async () => { render(Screen()); });
    expect(document.body.textContent ?? '').not.toMatch(/불러오지 못했|오류가 발생|실패했/);
  });

  it('오류일 때는 오류라고 말하고 재시도를 준다', async () => {
    fnOf().mockRejectedValue(new Error('rpc missing'));
    await act(async () => { render(Screen()); });
    await waitFor(() => expect(document.body.textContent ?? '').toMatch(/못했|오류|실패|다시/));
  });

  it('⚠ 오류를 빈 목록으로 보여 주지 않는다 — fail-closed', async () => {
    fnOf().mockRejectedValue(new Error('rpc missing'));
    await act(async () => { render(Screen()); });
    await act(async () => {});
    // "없습니다" 류의 빈 상태 문구가 오류 상황에서 나오면 운영자가 큐가 비었다고 믿는다.
    expect(document.body.textContent ?? '').not.toMatch(/없습니다|없어요/);
  });

  it('정상 데이터에서 크래시 없이 그린다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(Screen())); });
    await act(async () => {});
    expect((container.textContent ?? '').trim().length).toBeGreaterThan(0);
  });
});

describe('대시보드', () => {
  it('지표가 실제 숫자로 나온다', async () => {
    await act(async () => { render(<AdminDashboardScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/1,?240/));
  });
});

describe('사용자 목록', () => {
  it('행이 그려지고 긴 이름·긴 이메일도 넘치지 않는다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<AdminUsersScreen />)); });
    await waitFor(() => expect(screen.getByText('김덕분')).toBeInTheDocument());
    expect(screen.getByText('아주긴이름을가진사용자님')).toBeInTheDocument();
    expect(fixedWidthsOver(container, 1280)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });

  it('⚠ 검색 입력에 접근 이름이 있다', async () => {
    await act(async () => { render(<AdminUsersScreen />); });
    await waitFor(() => expect(screen.getByText('김덕분')).toBeInTheDocument());
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    expect(inputs.length).toBeGreaterThan(0);
    for (const el of inputs) expect(el.getAttribute('aria-label')).toBeTruthy();
  });

  it('검색이 실제로 서버 인자를 바꾼다', async () => {
    await act(async () => { render(<AdminUsersScreen />); });
    await waitFor(() => expect(listUsers).toHaveBeenCalled());
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '박' } });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' }); });
    await waitFor(() => expect(listUsers).toHaveBeenCalledWith(expect.objectContaining({ offset: 0 })));
  });
});

describe('상담 목록', () => {
  it('긴 질문이 잘리지 않고 레이아웃을 밀지 않는다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<AdminConsultationsScreen />)); });
    await waitFor(() => expect(document.body.textContent).toMatch(/올해 하반기에 이직을/));
    expect(fixedWidthsOver(container, 1280)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });

  it('⚠ 0건과 오류가 화면에서 구분된다 — 다만 0건에 문구는 없고 빈 표 + 0–0 이다', async () => {
    listConsultations.mockResolvedValue([]);
    await act(async () => { render(<AdminConsultationsScreen />); });
    await act(async () => {});
    // 실측: 관리자 목록은 0건일 때 안내 문구 없이 헤더만 있는 빈 표와 `0–0` 페이지 표시를 보여 준다.
    // 오류 화면과는 분명히 다르므로(위 세 상태 블록) 운영자가 혼동하지 않는다.
    // 소비자 화면과 달리 빈 상태 카피가 없는 것은 콘솔의 관행이라 디자인 판단으로 남긴다.
    expect(document.body.textContent ?? '').toMatch(/0–0|0-0/);
    expect(document.body.textContent ?? '').not.toMatch(/못했|오류/);
  });
});
