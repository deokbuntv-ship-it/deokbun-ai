// 궁합 진입점 (/(tabs)/compatibility) 과 MY (/(tabs)/my).
//
// 두 화면을 한 파일에 둔 이유: mock 표면이 거의 같고(지갑 · 대상자 · 인증), 각각이 짧다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

let subjects: { id: string; displayName: string; relationship: string | null; isSelf: boolean }[] = [];
let subjectsStatus: 'loading' | 'ready' | 'error' = 'ready';
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationSubjects: () => ({ subjects, status: subjectsStatus, reload: jest.fn() }),
  useConsultationDraft: () => ({ draft: { subject: subjects[0] ?? null }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  isSavedSubjectId: () => true,
  setPendingConsultationIntent: jest.fn(),
}));

let walletState: { totalSpendable: number } | null = { totalSpendable: 120 };
let walletLoading = false;
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: walletState, loading: walletLoading, error: null, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false, nextAvailableAtEpoch: null, rewardAmount: 1 }),
  lightCandle: jest.fn(),
}));
let authed = true;
const signOut = jest.fn().mockResolvedValue(undefined);
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({
    isAuthenticated: authed,
    authState: { status: authed ? 'authenticated' : 'unauthenticated', user: { id: 'u1', email: 'me@ex.com' } },
    signOut,
  }),
}));
jest.mock('@/features/retention', () => {
  const actual = jest.requireActual('@/features/retention');
  return { ...actual, __esModule: true, useNotificationUnread: () => ({ unreadCount: 0, refresh: jest.fn() }) };
});
jest.mock('@/services/productEvents', () => ({ __esModule: true, trackProductEvent: jest.fn() }));

import { DUK_PRICES } from '@/features/duk/pricing';

import { routerMock } from '../../../jest.render.setup';
import CompatibilityScreen from '../(tabs)/compatibility';
import MyScreen from '../(tabs)/my';

const SELF = { id: 'subj-self', displayName: '김덕분', relationship: '본인', isSelf: true };
const OTHER = { id: 'subj-2', displayName: '박상대', relationship: '친구', isSelf: false };

beforeEach(() => {
  setViewport(360);
  subjects = [SELF, OTHER];
  subjectsStatus = 'ready';
  walletState = { totalSpendable: 120 };
  walletLoading = false;
  authed = true;
  routerMock.push.mockClear();
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('궁합 진입점', () => {
  it('두 사람이 있으면 가격이 붙은 시작 버튼이 나온다', async () => {
    await act(async () => { render(<CompatibilityScreen />); });
    await waitFor(() => expect(screen.getByText(new RegExp(`${DUK_PRICES.compatibility}덕으로 궁합 보기`))).toBeInTheDocument());
    expect(screen.getByText('김덕분')).toBeInTheDocument();
    expect(screen.getByText('박상대')).toBeInTheDocument();
  });

  it('본인 정보가 없으면 궁합을 시작할 수 없고 등록을 먼저 요구한다', async () => {
    subjects = [];
    await act(async () => { render(<CompatibilityScreen />); });
    await waitFor(() => expect(screen.getByText('먼저 본인의 생년월일을 등록해 주세요')).toBeInTheDocument());
    expect(screen.queryByText(new RegExp(`${DUK_PRICES.compatibility}덕으로 궁합 보기`))).toBeNull();
  });

  it('상대가 없으면 추가를 권하고, 누르면 등록으로 간다', async () => {
    subjects = [SELF];
    await act(async () => { render(<CompatibilityScreen />); });
    await waitFor(() => expect(screen.getByText('아직 저장된 상대방이 없어요')).toBeInTheDocument());
    fireEvent.click(screen.getByText('＋ 대상자 추가'));
    expect(routerMock.push).toHaveBeenCalledWith({ pathname: '/birth-info', params: { origin: 'compatibility' } });
  });

  it('로딩·오류 상태가 실제로 갈린다', async () => {
    subjectsStatus = 'loading';
    const { unmount } = render(<CompatibilityScreen />);
    expect(screen.queryByText('먼저 본인의 생년월일을 등록해 주세요')).toBeNull();
    unmount();
    subjectsStatus = 'error';
    await act(async () => { render(<CompatibilityScreen />); });
    await waitFor(() => expect(screen.getByText(/대상을 불러오지 못했어요/)).toBeInTheDocument());
  });

  it('⚠ 잔액을 모를 때 "확인 중…" 이라고 말하지 0으로 단정하지 않는다', async () => {
    walletState = null;
    walletLoading = true;
    await act(async () => { render(<CompatibilityScreen />); });
    await waitFor(() => expect(screen.getByText('확인 중…')).toBeInTheDocument());
    expect(document.body.textContent).not.toMatch(/덕이 부족/);
  });

  it('잔액이 부족하면 충전 경로가 뜬다', async () => {
    walletState = { totalSpendable: 1 };
    await act(async () => { render(<CompatibilityScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/부족|충전/));
  });

  it('360dp', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<CompatibilityScreen />)); });
    await waitFor(() => expect(screen.getByText('상대방')).toBeInTheDocument());
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});

describe('MY', () => {
  it('로그아웃과 계정 탈퇴가 둘 다 보이고, 탈퇴가 숨겨져 있지 않다', async () => {
    await act(async () => { render(<MyScreen />); });
    await waitFor(() => expect(screen.getByText('로그아웃')).toBeInTheDocument());
    // Apple 요구사항: 인앱 삭제 경로가 있어야 하고, 묻어 두면 안 된다.
    expect(screen.getByLabelText('계정 탈퇴')).toBeInTheDocument();
  });

  it('계정 탈퇴를 누르면 탈퇴 화면으로 간다 — 여기서 바로 지우지 않는다', async () => {
    await act(async () => { render(<MyScreen />); });
    await waitFor(() => expect(screen.getByLabelText('계정 탈퇴')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('계정 탈퇴'));
    expect(routerMock.push).toHaveBeenCalledWith('/account-delete');
  });

  it('비로그인은 계정 메뉴 대신 로그인을 권한다', async () => {
    authed = false;
    await act(async () => { render(<MyScreen />); });
    await waitFor(() => expect(screen.getByText('로그인하기')).toBeInTheDocument());
    expect(screen.queryByText('로그아웃')).toBeNull();
    expect(screen.queryByLabelText('계정 탈퇴')).toBeNull();
  });

  it('나의 기록과 서비스 안내가 그려진다', async () => {
    await act(async () => { render(<MyScreen />); });
    await waitFor(() => expect(screen.getByText('나의 기록')).toBeInTheDocument());
    expect(screen.getByText('서비스 안내')).toBeInTheDocument();
  });

  it('360dp', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<MyScreen />)); });
    await waitFor(() => expect(screen.getByText('나의 기록')).toBeInTheDocument());
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});
