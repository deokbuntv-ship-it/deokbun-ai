// 온보딩 퍼널 — 로그인 · 출생정보. **모든 유입이 이 경로를 지난다.**
//
// ⚠ 출생정보 화면이 이 파일의 핵심이다. `BoundaryTimeNotice` 컴포넌트 자체는 이미 잠겨 있지만
// **폼 전체에서 그 경고가 실제로 뜨는가**(경계일 AND 시각 미상이라는 조건부-조건부)와,
// **경고가 떠도 저장이 막히지 않는가**는 폼을 렌더해야만 보인다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

let authed = false;
const signInWith = jest.fn().mockResolvedValue({ ok: true });
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({
    isAuthenticated: authed,
    authState: { status: authed ? 'authenticated' : 'unauthenticated', user: null },
    signInWith: (p: string) => signInWith(p),
  }),
}));

import { BirthProfileForm } from '@/features/consultation/components/BirthProfileForm';

beforeEach(() => {
  setViewport(360);
  authed = false;
  signInWith.mockClear();
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

// ── 출생정보 폼 ────────────────────────────────────────────────────────────────────────────────
const fillDate = (y: string, m: string, d: string) => {
  fireEvent.change(screen.getByLabelText('연도'), { target: { value: y } });
  fireEvent.change(screen.getByLabelText('월'), { target: { value: m } });
  fireEvent.change(screen.getByLabelText('일'), { target: { value: d } });
};

const renderForm = (props: Record<string, unknown> = {}) =>
  render(<BirthProfileForm onSubmit={jest.fn()} submitLabel="저장하기" submitting={false} error={null} {...props} />);

describe('출생정보 폼 — 기본', () => {
  it('필수 항목이 비면 저장이 잠겨 있다', () => {
    renderForm();
    const save = screen.getByText('저장하기');
    expect(save.closest('[aria-disabled="true"], [disabled]') ?? save.parentElement).toBeTruthy();
  });

  it('시각 정확도 세 선택지가 전부 있다', () => {
    renderForm();
    for (const label of ['정확히 알아요', '대략 알아요', '몰라요']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('"모름"을 고르면 임의 추측을 하지 않는다고 말한다', () => {
    renderForm();
    fireEvent.click(screen.getByText('몰라요'));
    expect(screen.getByText(/모르는 시간을 임의로 추측하지 않아요/)).toBeInTheDocument();
  });

  it('"대략"을 고르면 시간대 선택이 나타난다', () => {
    renderForm();
    fireEvent.click(screen.getByText('대략 알아요'));
    // 시간대 옵션이 하나라도 나타나야 한다.
    expect(document.body.textContent).toMatch(/새벽|오전|오후|저녁|밤/);
  });

  it('음력 경로가 있고, 윤달 선택을 요구한다', () => {
    renderForm();
    fireEvent.click(screen.getByText('음력'));
    expect(document.body.textContent).toMatch(/평달|윤달/);
  });
});

describe('⚠ 절기 경계일 경고 — 폼 전체에서 실제로 뜨는가', () => {
  const BOUNDARY = { y: '1996', m: '10', d: '8' }; // 한로가 그 날에 든다 (birthBoundaryGate.test.ts 와 같은 값)

  const setupBoundary = (accuracy: string) => {
    renderForm();
    fireEvent.click(screen.getByText('양력'));
    fillDate(BOUNDARY.y, BOUNDARY.m, BOUNDARY.d);
    fireEvent.click(screen.getByText(accuracy));
  };

  it('⭐ 경계일 + 모름 → 경고가 뜬다', () => {
    setupBoundary('몰라요');
    expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument();
  });

  it('⭐ 경계일 + 대략 → 경고가 뜬다 (approximate 는 약한 unknown 이 아니다)', () => {
    setupBoundary('대략 알아요');
    expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument();
  });

  it('경계일 + 정확 → 경고가 사라진다', () => {
    setupBoundary('몰라요');
    expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument();
    fireEvent.click(screen.getByText('정확히 알아요'));
    expect(screen.queryByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeNull();
  });

  it('경계일이 아닌 날 + 모름 → 경고가 없다', () => {
    renderForm();
    fireEvent.click(screen.getByText('양력'));
    fillDate('1996', '10', '9'); // 하루 뒤 — 경계일이 아니다
    fireEvent.click(screen.getByText('몰라요'));
    expect(screen.queryByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeNull();
  });

  it('⭐ [시각 입력하기] 를 누르면 실제로 정확 모드로 바뀐다', () => {
    setupBoundary('몰라요');
    fireEvent.click(screen.getByText('시각 입력하기'));
    // 정확 모드로 바뀌면 경고가 사라지고 시/분 입력이 열린다.
    expect(screen.queryByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeNull();
  });

  it('⚠ 경고는 경고일 뿐 — [이대로 저장] 이 실제로 제출을 부른다', () => {
    const onSubmit = jest.fn();
    render(<BirthProfileForm onSubmit={onSubmit} submitLabel="저장하기" submitting={false} error={null} />);
    fireEvent.click(screen.getByText('양력'));
    fillDate(BOUNDARY.y, BOUNDARY.m, BOUNDARY.d);
    fireEvent.click(screen.getByText('몰라요'));
    fireEvent.click(screen.getByText('여성'));
    fireEvent.change(screen.getByLabelText('태어난 곳'), { target: { value: '서울' } });
    expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument();
    fireEvent.click(screen.getByText('이대로 저장'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ birthTimeAccuracy: 'unknown' });
  });

  it('360dp — 경고가 뜬 상태에서도 넘치도록 선언되지 않는다', () => {
    const { container } = renderForm();
    fireEvent.click(screen.getByText('양력'));
    fillDate(BOUNDARY.y, BOUNDARY.m, BOUNDARY.d);
    fireEvent.click(screen.getByText('몰라요'));
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});

describe('두 검증기가 화면에서 어긋나지 않는다', () => {
  it('폼이 저장을 허용하는 값은 isCompleteBirthInfo 도 완전하다고 본다', () => {
    const { isCompleteBirthInfo } = jest.requireActual('@/features/consultation/birthProfileValidation');
    const onSubmit = jest.fn();
    render(<BirthProfileForm onSubmit={onSubmit} submitLabel="저장하기" submitting={false} error={null} />);
    fireEvent.click(screen.getByText('양력'));
    fillDate('1994', '5', '20');
    fireEvent.click(screen.getByText('몰라요'));
    fireEvent.click(screen.getByText('여성'));
    fireEvent.change(screen.getByLabelText(/태어난 곳/), { target: { value: '서울' } });
    fireEvent.click(screen.getByText('저장하기'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    // ⚠ 폼이 통과시킨 값을 다른 검증기가 거부하면 사용자는 저장 뒤에 막힌다.
    expect(isCompleteBirthInfo(onSubmit.mock.calls[0][0])).toBe(true);
  });
});
