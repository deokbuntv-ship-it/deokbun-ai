// 상담 탭 (/(tabs)/consult) — 상담의 진입점.
//
// 여기가 결제 직전 화면이다. 소스 계약이 못 보던 것: 가격이 **버튼 라벨 위에** 실제로 찍히는가,
// 잔액을 모를 때 "부족"으로 잘못 읽히지 않는가, 대상자 없이 상담이 시작되지 않는가.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const listConversationsForSubject = jest.fn();
jest.mock('@/features/chat', () => ({
  __esModule: true,
  conversationService: { listConversationsForSubject: (id: string) => listConversationsForSubject(id) },
}));

let draftSubject: { id: string; displayName: string; relationship: string | null } | null = null;
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationDraft: () => ({ draft: { subject: draftSubject }, updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  // PersonSelectorSheet (rendered by this screen) reads the subject list from the same barrel.
  useConsultationSubjects: () => ({ subjects: draftSubject ? [draftSubject] : [], status: 'ready', reload: jest.fn() }),
  isSavedSubjectId: (id: string) => typeof id === 'string' && id.startsWith('subj-'),
}));

let authed = true;
jest.mock('@/features/auth', () => ({ __esModule: true, useAuth: () => ({ isAuthenticated: authed }) }));

let walletState: { totalSpendable: number } | null = { totalSpendable: 120 };
let walletLoading = false;
let walletError: string | null = null;
const walletRefresh = jest.fn().mockResolvedValue(undefined);
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: walletState, loading: walletLoading, error: walletError, refresh: walletRefresh }),
}));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false }),
}));

import { DUK_PRICES } from '@/features/duk/pricing';

import { routerMock } from '../../../jest.render.setup';
import ConsultationListScreen from '../(tabs)/consult';

const SUBJECT = { id: 'subj-1', displayName: '김덕분', relationship: '본인' };

beforeEach(() => {
  setViewport(360);
  draftSubject = SUBJECT;
  authed = true;
  walletState = { totalSpendable: 120 };
  walletLoading = false;
  walletError = null;
  listConversationsForSubject.mockReset().mockResolvedValue([]);
  routerMock.push.mockReset();
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('가격은 각주가 아니라 버튼 위에 있다', () => {
  it('두 상품 모두 라벨에 가격이 찍힌다', async () => {
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작/)).toBeInTheDocument());
    expect(screen.getByText(new RegExp(`새 상담 시작.*${DUK_PRICES.general}덕`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`프리미엄 리포트.*${DUK_PRICES.premium_report}덕`))).toBeInTheDocument();
  });

  it('가격 숫자가 하드코딩이 아니라 정책값과 같다', async () => {
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작/)).toBeInTheDocument());
    const body = document.body.textContent ?? '';
    expect(body).toContain(`${DUK_PRICES.general}덕`);
    expect(body).toContain(`${DUK_PRICES.premium_report}덕`);
  });
});

describe('시작 전 게이트', () => {
  it('대상자가 없으면 상담이 시작되지 않고 선택을 먼저 요구한다', async () => {
    draftSubject = null;
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText('먼저 상담할 사람을 골라주세요')).toBeInTheDocument());
    fireEvent.click(screen.getByText(/새 상담 시작/));
    // 가격 시트가 아니라 대상자 시트가 열린다 — 채팅으로 넘어가지 않는다.
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(screen.queryByText('결제 확인')).toBeNull();
  });

  it('대상자가 있으면 누가 상담 대상인지 시작 전에 이미 답이 되어 있다', async () => {
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText('김덕분 사주 보는 중')).toBeInTheDocument());
    expect(screen.getByText('선택됨')).toBeInTheDocument();
  });

  it('새 상담은 바로 열리지 않고 가격 확인을 거친다', async () => {
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/새 상담 시작/));
    // 확인 시트가 뜨는 동안에는 아직 채팅으로 이동하지 않는다.
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});

describe('⚠ 잔액을 모르는 것과 부족한 것은 다르다', () => {
  it('잔액 부족이면 충전 경로가 뜬다', async () => {
    walletState = { totalSpendable: 1 };
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/새 상담 시작/));
    await waitFor(() => expect(document.body.textContent).toMatch(/덕이 부족|충전/));
  });

  it('지갑이 아직 안 실렸을 때 "부족"으로 읽히지 않는다', async () => {
    walletState = null;
    walletLoading = true;
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/새 상담 시작/));
    expect(document.body.textContent).not.toMatch(/덕이 부족/);
  });

  it('지갑 조회가 실패했을 때도 "부족"으로 읽히지 않는다 — 서버가 최종 권위다', async () => {
    walletState = null;
    walletError = 'network';
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/새 상담 시작/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/새 상담 시작/));
    expect(document.body.textContent).not.toMatch(/덕이 부족/);
  });
});

describe('최근 상담 목록', () => {
  it('대상자가 없으면 목록 대신 안내', async () => {
    draftSubject = null;
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText('아직 상담 기록이 없어요')).toBeInTheDocument());
    expect(listConversationsForSubject).not.toHaveBeenCalled();
  });

  it('비어 있으면 빈 목록이 아니라 첫 상담을 권한다', async () => {
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText('아직 상담 내역이 없어요')).toBeInTheDocument());
  });

  it('실패하면 재시도를 준다', async () => {
    listConversationsForSubject.mockRejectedValue(new Error('net'));
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/상담 내역을 불러오지 못했어요/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('다시 시도'));
    await waitFor(() => expect(listConversationsForSubject).toHaveBeenCalledTimes(2));
  });

  it('항목을 누르면 그 대화로 들어간다', async () => {
    listConversationsForSubject.mockResolvedValue([
      { id: 'c1', summary: '올해 이직을 해도 괜찮을지 물었고, 하반기가 낫다는 답을 받았습니다.', updatedAt: '2026-09-05T00:00:00Z', subjectSnapshot: null },
    ]);
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/올해 이직을 해도/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/올해 이직을 해도/));
    expect(routerMock.push).toHaveBeenCalledWith({ pathname: '/chat', params: { conversationId: 'c1' } });
  });

  it('요약이 없어도 빈 줄이 아니라 이어가기를 권한다', async () => {
    listConversationsForSubject.mockResolvedValue([
      { id: 'c2', summary: null, updatedAt: '2026-09-05T00:00:00Z', subjectSnapshot: null },
    ]);
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText('상담을 이어가 보세요.')).toBeInTheDocument());
  });
});

describe('보조 동선', () => {
  it('대상자가 저장되지 않았으면 만세력·전체기록은 잠겨 있다', async () => {
    draftSubject = { id: 'draft-x', displayName: '임시', relationship: null };
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText('만세력')).toBeInTheDocument());
    fireEvent.click(screen.getByText('만세력'));
    fireEvent.click(screen.getByText('전체 기록'));
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('프리미엄 리포트는 별도 상품으로 자기 경로를 간다', async () => {
    render(<ConsultationListScreen />);
    await waitFor(() => expect(screen.getByText(/프리미엄 리포트/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/프리미엄 리포트/));
    expect(routerMock.push).toHaveBeenCalledWith('/premium');
  });
});

it('360dp — 긴 요약이 있는 목록에서도 넘치도록 선언된 폭이 없다', async () => {
  listConversationsForSubject.mockResolvedValue([
    { id: 'c1', summary: '올해 하반기에 이직을 고민하고 있는데 지금 회사에 남는 것과 옮기는 것 중 어느 쪽이 나은지, 그리고 옮긴다면 언제가 좋을지 물었습니다.', updatedAt: '2026-09-05T00:00:00Z', subjectSnapshot: null },
  ]);
  const { container } = render(<ConsultationListScreen />);
  await waitFor(() => expect(screen.getByText(/올해 하반기에 이직을/)).toBeInTheDocument());
  expect(fixedWidthsOver(container, 360)).toEqual([]);
  expect(nowrapLongText(container)).toEqual([]);
});
