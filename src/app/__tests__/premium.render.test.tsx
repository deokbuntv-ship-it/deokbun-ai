// 프리미엄 리포트 화면 — 40초짜리 기다림이 실제로 무엇을 보여주는가.
//
// The loading UX is the whole reason this screen has a design: the source test can only assert the
// stage strings exist in an array. Whether the reader actually SEES them advance — and sees the
// elapsed seconds — needs a render and a clock.
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

const generate = jest.fn();
const save = jest.fn();
jest.mock('@/features/premium/services/premiumReportService', () => ({
  __esModule: true,
  premiumReportService: { generate: (...a: unknown[]) => generate(...a), save: (...a: unknown[]) => save(...a) },
}));

let authStatus: 'authenticated' | 'unauthenticated' = 'authenticated';
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ authState: { status: authStatus, user: { id: 'u1' } } }),
}));

import PremiumReportScreen from '../premium';
import { PREMIUM_PAYLOAD, PREMIUM_MONTH_LINES } from './premiumFixture';


beforeEach(() => {
  authStatus = 'authenticated';
  generate.mockReset();
  save.mockReset();
});

describe('구매 확인 (confirm)', () => {
  it('시작 상태에서 가격과 실패 시 무과금 약속이 함께 보인다', () => {
    render(<PremiumReportScreen />);
    expect(screen.getByText('타고난 결과 앞으로 열두 달을 한 번에 봅니다')).toBeInTheDocument();
    expect(screen.getByText(/근거를 세울 수 없으면 덕은 차감되지 않아요/)).toBeInTheDocument();
    // 40초는 미리 말한다 — 기다림은 예고돼야 기다릴 수 있다.
    expect(screen.getByText(/40초쯤 걸리고/)).toBeInTheDocument();
  });

  it('비로그인은 화면이 아니라 로그인으로 간다', () => {
    authStatus = 'unauthenticated';
    render(<PremiumReportScreen />);
    expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', '/login');
    expect(screen.queryByText('타고난 결과 앞으로 열두 달을 한 번에 봅니다')).toBeNull();
  });
});

describe('로딩 UX — 진행 단계와 경과 시간', () => {
  beforeEach(() => jest.useFakeTimers());
  // 남은 인터벌 틱도 setElapsed 를 부른다 — act 밖에서 돌면 React 가 경고한다.
  afterEach(() => { act(() => { jest.runOnlyPendingTimers(); }); jest.useRealTimers(); });

  const startWorking = () => {
    generate.mockReturnValue(new Promise(() => { /* never settles — the wait itself is the subject */ }));
    render(<PremiumReportScreen />);
    act(() => { fireEvent.click(screen.getByText(/으로 리포트 받기$/)); });
  };

  it('네 단계가 전부 보이고, 무엇을 만드는 중인지 말한다', () => {
    startWorking();
    expect(screen.getByText('리포트를 만들고 있어요')).toBeInTheDocument();
    for (const s of ['원국을 세우는 중이에요', '지금 지나는 흐름을 확인하고 있어요', '앞으로 열두 달을 한 달씩 계산하고 있어요', '읽기 좋은 글로 정리하고 있어요']) {
      expect(screen.getByText(s)).toBeInTheDocument();
    }
  });

  it('경과 초가 실제로 올라간다', () => {
    startWorking();
    expect(screen.getByText('0초 지났어요 · 보통 40초쯤 걸려요')).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(7000); });
    expect(screen.getByText('7초 지났어요 · 보통 40초쯤 걸려요')).toBeInTheDocument();
  });

  it('퍼센트도 진행바도 없다 — 서버가 진행률을 주지 않으므로', () => {
    startWorking();
    act(() => { jest.advanceTimersByTime(15000); });
    expect(document.body.textContent).not.toMatch(/\d+\s*%/);
  });

  it('100초를 넘으면 말이 바뀌고, 닫아도 된다고 알려준다', () => {
    startWorking();
    act(() => { jest.advanceTimersByTime(101000); });
    expect(screen.getByText('101초째 기다리는 중이에요. 평소보다 오래 걸리고 있어요.')).toBeInTheDocument();
    expect(screen.getByText(/화면을 닫아도 괜찮아요/)).toBeInTheDocument();
  });
});

describe('결과와 실패 분기', () => {
  it('성공하면 리포트가 그려지고, 저장 실패해도 리포트는 남는다', async () => {
    generate.mockResolvedValue({ status: 'ok', payload: PREMIUM_PAYLOAD });
    save.mockResolvedValue(null); // 라이브러리 저장만 실패
    render(<PremiumReportScreen />);
    fireEvent.click(screen.getByText(/으로 리포트 받기$/));
    await waitFor(() => expect(screen.getByText(/우편함에 저장하지 못했어요/)).toBeInTheDocument());
    // 핵심: 저장이 실패해도 과금과 리포트 유효성은 별개라고 말한다.
    expect(screen.getByText(/덕도 정상 처리됐어요/)).toBeInTheDocument();
    expect(screen.getByText(PREMIUM_PAYLOAD.result.headline)).toBeInTheDocument();
    // 저장은 화면을 보여준 뒤에 일어난다(의도된 순서). 그 뒤처리까지 act 안에서 흘려보낸다.
    await act(async () => {});
  });

  it('근거 부족: 무과금을 명시하고 출생정보로 보낸다', async () => {
    generate.mockResolvedValue({ status: 'grounding_unavailable', message: '태어난 시각을 확인해 주세요.' });
    render(<PremiumReportScreen />);
    fireEvent.click(screen.getByText(/으로 리포트 받기$/));
    await waitFor(() => expect(screen.getByText('이 출생정보로는 리포트를 만들 수 없어요')).toBeInTheDocument());
    expect(screen.getByText(/차감되지 않았어요/)).toBeInTheDocument();
    expect(screen.getByText('출생정보 수정하기')).toBeInTheDocument();
  });

  it('덕 부족: 부족분을 숫자로 말한다', async () => {
    generate.mockResolvedValue({ status: 'insufficient_duk', shortfall: 12 });
    render(<PremiumReportScreen />);
    fireEvent.click(screen.getByText(/으로 리포트 받기$/));
    await waitFor(() => expect(screen.getByText('덕이 조금 부족해요')).toBeInTheDocument());
    expect(screen.getByText(/12덕만 더 있으면 돼요/)).toBeInTheDocument();
  });

  it('실패: 무과금을 말하고 재시도를 준다', async () => {
    generate.mockResolvedValue({ status: 'error' });
    render(<PremiumReportScreen />);
    fireEvent.click(screen.getByText(/으로 리포트 받기$/));
    await waitFor(() => expect(screen.getByText('리포트를 만들지 못했어요')).toBeInTheDocument());
    expect(screen.getByText(/덕은 차감되지 않았어요/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('다시 시도'));
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('혼잡: 실패와 다른 말을 한다', async () => {
    generate.mockResolvedValue({ status: 'busy' });
    render(<PremiumReportScreen />);
    fireEvent.click(screen.getByText(/으로 리포트 받기$/));
    await waitFor(() => expect(screen.getByText('조금 뒤에 다시 시도해 주세요')).toBeInTheDocument());
    expect(screen.queryByText(/문제가 생겼어요/)).toBeNull();
  });
});
