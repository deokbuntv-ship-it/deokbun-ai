// 지갑 · 충전 (/wallet, /duk-topup) — 돈이 걸린 화면.
//
// ⚠ 출시 판단에 필요한 사실이 이 파일에 있다: **IAP 가 아직 열려 있지 않은 상태에서 충전 화면이
// 무엇을 보여 주는가.** 구매가 안 되는 채로 출시하면 안 되므로, 지금 무엇이 보이는지 정확히 잠근다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

let walletState: { totalSpendable: number; buckets?: Record<string, number> } | null = { totalSpendable: 137 };
let walletLoading = false;
let walletError: string | null = null;
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: walletState, loading: walletLoading, error: walletError, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
let canLight = true;
const lightCandle = jest.fn();
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  // 실제 계약과 같은 모양 — rewardAmount 를 빼면 화면이 '+NaN덕' 을 그린다(서비스는 항상 채워 준다).
  getCandleAvailability: () => Promise.resolve({ canLight, nextAvailableAtEpoch: null, rewardAmount: 1 }),
  lightCandle: () => lightCandle(),
}));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));
jest.mock('@/features/retention', () => {
  const actual = jest.requireActual('@/features/retention');
  return { ...actual, __esModule: true, useNotificationUnread: () => ({ unreadCount: 0, refresh: jest.fn() }) };
});

import { TOPUP_PACKS } from '@/features/duk/pricing';

import { routerMock } from '../../../jest.render.setup';
import DukTopupScreen from '../duk-topup';
import WalletScreen from '../wallet';

beforeEach(() => {
  setViewport(360);
  walletState = { totalSpendable: 137 };
  walletLoading = false;
  walletError = null;
  canLight = true;
  routerMock.push.mockClear();
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('지갑 — 잔액', () => {
  it('잔액이 실제로 화면에 보인다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<WalletScreen />)); });
    await waitFor(() => expect(document.body.textContent).toMatch(/137/));
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });

  it('⚠ 불러오는 중에는 0으로도, 실패로도 단정하지 않는다', async () => {
    walletState = null;
    walletLoading = true;
    await act(async () => { render(<WalletScreen />); });
    await waitFor(() => expect(screen.getByText('덕 충전하기')).toBeInTheDocument());
    // '0덕' 단독으로만 본다 — '+10덕'(웰컴덕 안내)은 정상 문구다.
    expect(document.body.textContent).not.toMatch(/(^|[^0-9])0덕/);
    // 2026-09-06 회귀 잠금: 아직 불러오는 중인데 "불러오지 못했어요" 가 뜨던 버그.
    expect(screen.queryByText('덕 정보를 불러오지 못했어요')).toBeNull();
  });

  it('진짜 실패일 때는 실패라고 말하고 재시도를 준다', async () => {
    walletState = null;
    walletError = 'network';
    await act(async () => { render(<WalletScreen />); });
    // ⚠ 같은 문장이 두 번 나온다 — 잔액 카드의 인라인 오류 + 아래 재시도 StateView. 중복 문구는
    // 디자인 판단이라 고치지 않고 보고만 했다(PROJECT_STATE §7.24).
    await waitFor(() => expect(screen.getAllByText('덕 정보를 불러오지 못했어요').length).toBeGreaterThanOrEqual(1));
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
    // 화면 자체는 남고 충전 경로도 살아 있다.
    expect(screen.getByText('덕 충전하기')).toBeInTheDocument();
  });

  it('충전하기는 충전 화면으로 간다', async () => {
    await act(async () => { render(<WalletScreen />); });
    await waitFor(() => expect(screen.getByText('덕 충전하기')).toBeInTheDocument());
    fireEvent.click(screen.getByText('덕 충전하기'));
    expect(routerMock.push).toHaveBeenCalledWith('/duk-topup');
  });
});

describe('⚠ 충전 화면 — IAP 가 아직 없다는 사실이 어떻게 보이는가 (출시 판단용)', () => {
  it('구매가 안 된다는 것을 화면이 먼저 말한다', async () => {
    await act(async () => { render(<DukTopupScreen />); });
    await waitFor(() => expect(screen.getByText('덕 충전은 준비 중이에요')).toBeInTheDocument());
    // 막다른 안내가 아니라 대안을 준다.
    expect(screen.getByText(/오늘의 초로 덕을 모을 수 있어요/)).toBeInTheDocument();
    expect(screen.getByText(/스토어 결제가 열리면 바로 알려드릴게요/)).toBeInTheDocument();
  });

  it('⚠ 모든 팩이 "준비 중" 이고 구매 버튼이 하나도 없다', async () => {
    await act(async () => { render(<DukTopupScreen />); });
    await waitFor(() => expect(screen.getByText('덕 충전은 준비 중이에요')).toBeInTheDocument());
    // 팩 수만큼 "준비 중" 필이 있다 = 살아 있는 구매 컨트롤이 하나도 없다.
    expect(screen.getAllByText('준비 중')).toHaveLength(TOPUP_PACKS.length);
    for (const label of ['구매', '결제하기', '지금 구매']) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });

  it('팩 정보(수량·라벨·가격)는 흐리지 않고 그대로 보인다', async () => {
    await act(async () => { render(<DukTopupScreen />); });
    await waitFor(() => expect(screen.getByText('덕 충전은 준비 중이에요')).toBeInTheDocument());
    for (const p of TOPUP_PACKS) {
      expect(screen.getByText(`${p.duk}덕`)).toBeInTheDocument();
      if (p.priceKrwHint != null) {
        expect(screen.getByText(`₩${p.priceKrwHint.toLocaleString()}`)).toBeInTheDocument();
      }
    }
  });

  it('환불·양도 불가 고지가 구매 전에 이미 보인다', async () => {
    await act(async () => { render(<DukTopupScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/환불 정책에 따라 처리됩니다/));
    expect(document.body.textContent).toMatch(/현금으로 교환하거나 다른 계정에 넘길 수 없어요/);
  });

  it('잔액이 충전 화면에도 보인다 — 얼마가 부족한지 여기서 판단한다', async () => {
    await act(async () => { render(<DukTopupScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/지금 137덕 있어요/));
  });

  it('360dp — 팩 목록이 넘치도록 선언되지 않는다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<DukTopupScreen />)); });
    await waitFor(() => expect(screen.getByText('덕 충전은 준비 중이에요')).toBeInTheDocument());
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});
