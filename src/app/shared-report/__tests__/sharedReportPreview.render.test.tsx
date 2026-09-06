// 공유 미리보기 (/shared-report/[token], 익명 분기) — 2026-09-06 에 새로 연 화면.
//
// ⚠ 이 화면의 핵심 계약은 "무엇이 화면에 없는가" 다. 서버가 이름을 보내지 않는다는 것은 E2E 가
// 증명했다. 여기서 보는 것은 그 다음 질문 — 화면이 로그인 상태에 따라 어느 쪽을 부르는가, 그리고
// 익명 화면에 유료 본문이나 이름이 끼어들 자리가 있는가.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const loadSharedReport = jest.fn();
const loadSharePreview = jest.fn();
jest.mock('@/features/chat/report/shareService', () => ({
  __esModule: true,
  shareService: { loadSharedReport: (t: string) => loadSharedReport(t), loadSharePreview: (t: string) => loadSharePreview(t) },
}));
const setPendingShareToken = jest.fn();
jest.mock('@/features/chat/report/pendingSharedReport', () => ({
  __esModule: true,
  setPendingShareToken: (t: string) => setPendingShareToken(t),
  isValidShareToken: (t: string) => /^[0-9a-f]{32,64}$/i.test(t),
}));

let authStatus: 'authenticated' | 'unauthenticated' | 'loading' = 'unauthenticated';
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ authState: { status: authStatus, user: { id: 'u1' } } }),
}));
let onboarding = 'ONBOARDED';
jest.mock('@/features/onboarding', () => ({
  __esModule: true,
  useOnboarding: () => ({ state: onboarding }),
  isOnboarded: (s: string) => s === 'ONBOARDED',
}));

import { routerMock } from '../../../../jest.render.setup';
import SharedReportScreen from '../[token]';

const TOKEN = 'a'.repeat(48);
const SELF = '김민서';
const OTHER = '박준영';
const PREVIEW = {
  conclusion: '두 분은 전체적으로 잘 맞는 편이에요. 상대님이 속도를 조금 늦추면 더 편해져요.',
  reportKind: 'compatibility' as const,
  lockedCounts: { findings: 5, cautions: 2, topics: 3 },
};

beforeEach(() => {
  authStatus = 'unauthenticated';
  onboarding = 'ONBOARDED';
  (globalThis as Record<string, unknown>).__routeParams = { token: TOKEN };
  loadSharedReport.mockReset();
  loadSharePreview.mockReset().mockResolvedValue({ status: 'ok', preview: PREVIEW });
  setPendingShareToken.mockReset();
  routerMock.push.mockReset();
});

describe('익명 분기', () => {
  it('결론이 보이고, 잠긴 것은 개수로만 보인다', async () => {
    render(<SharedReportScreen />);
    await waitFor(() => expect(screen.getByText(PREVIEW.conclusion)).toBeInTheDocument());
    expect(screen.getByText('궁합 결과가 도착했어요')).toBeInTheDocument();
    expect(screen.getByText(/분야별 해석 5가지/)).toBeInTheDocument();
    expect(screen.getByText(/주의할 점 2가지/)).toBeInTheDocument();
  });

  it('⚠ 이름이 화면 어디에도 없다', async () => {
    // 서버가 보내지 않는 것과 별개로, 화면이 어디서도 이름을 끌어오지 않는지 본다.
    render(<SharedReportScreen />);
    await waitFor(() => expect(screen.getByText(PREVIEW.conclusion)).toBeInTheDocument());
    const body = document.body.textContent ?? '';
    expect(body).not.toContain(SELF);
    expect(body).not.toContain(OTHER);
    expect(body).not.toContain('님과');
  });

  it('⚠ 전체 읽기 RPC 는 아예 불리지 않는다', async () => {
    render(<SharedReportScreen />);
    await waitFor(() => expect(loadSharePreview).toHaveBeenCalledWith(TOKEN));
    expect(loadSharedReport).not.toHaveBeenCalled();
  });

  it('[전체 보기] 는 토큰을 남기고 로그인으로 보낸다', async () => {
    render(<SharedReportScreen />);
    await waitFor(() => expect(screen.getByText('전체 보기')).toBeInTheDocument());
    expect(screen.getByText(/간편가입 후 보시던 결과로 바로 돌아와요/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('전체 보기'));
    expect(setPendingShareToken).toHaveBeenCalledWith(TOKEN);
    expect(routerMock.push).toHaveBeenCalledWith('/login');
  });

  it('AI 생성 고지가 익명 화면에도 붙는다', async () => {
    render(<SharedReportScreen />);
    await waitFor(() => expect(screen.getByText(/AI가 생성하며 참고용이에요/)).toBeInTheDocument());
  });

  it('잠긴 것이 하나도 없으면 자물쇠 블록 자체를 그리지 않는다 — 없는 것을 약속하지 않는다', async () => {
    loadSharePreview.mockResolvedValue({ status: 'ok', preview: { ...PREVIEW, lockedCounts: { findings: 0, cautions: 0, topics: 0 } } });
    render(<SharedReportScreen />);
    await waitFor(() => expect(screen.getByText(PREVIEW.conclusion)).toBeInTheDocument());
    expect(screen.queryByText(/🔒/)).toBeNull();
    // 그래도 전환 경로는 남는다.
    expect(screen.getByText('전체 보기')).toBeInTheDocument();
  });

  it('만료·revoke 는 로그인 벽이 아니라 같은 "볼 수 없음" 화면', async () => {
    loadSharePreview.mockResolvedValue({ status: 'unavailable' });
    render(<SharedReportScreen />);
    await waitFor(() => expect(screen.getByText('지금은 볼 수 없는 링크예요.')).toBeInTheDocument());
    expect(screen.queryByText('전체 보기')).toBeNull();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('토큰 모양이 아니면 서버를 부르지도 않는다', async () => {
    (globalThis as Record<string, unknown>).__routeParams = { token: 'nope' };
    render(<SharedReportScreen />);
    await waitFor(() => expect(screen.getByText('지금은 볼 수 없는 링크예요.')).toBeInTheDocument());
    expect(loadSharePreview).not.toHaveBeenCalled();
    expect(setPendingShareToken).not.toHaveBeenCalled();
  });
});

describe('로그인 분기 — 미리보기는 여기서 뜨지 않는다', () => {
  it('인증되면 전체 읽기를 부르고 미리보기는 부르지 않는다', async () => {
    authStatus = 'authenticated';
    loadSharedReport.mockResolvedValue({ status: 'unavailable' });
    render(<SharedReportScreen />);
    await waitFor(() => expect(loadSharedReport).toHaveBeenCalledWith(TOKEN));
    expect(loadSharePreview).not.toHaveBeenCalled();
    expect(screen.queryByText('전체 보기')).toBeNull();
  });

  it('온보딩이 안 끝난 회원은 리포트도 미리보기도 못 보고, 토큰만 보존된다', async () => {
    authStatus = 'authenticated';
    onboarding = 'NEEDS_BIRTH_INFO';
    render(<SharedReportScreen />);
    await waitFor(() => expect(setPendingShareToken).toHaveBeenCalledWith(TOKEN));
    expect(loadSharedReport).not.toHaveBeenCalled();
    expect(loadSharePreview).not.toHaveBeenCalled();
  });

  it('인증 상태를 확인하는 동안에는 아무 분기도 그리지 않는다', () => {
    authStatus = 'loading';
    render(<SharedReportScreen />);
    expect(screen.getByText('불러오는 중입니다...')).toBeInTheDocument();
    expect(loadSharePreview).not.toHaveBeenCalled();
    expect(loadSharedReport).not.toHaveBeenCalled();
  });
});
