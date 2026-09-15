// 약관 동의 (/onboarding/terms) — 퍼널의 두 번째 관문.
//
// 여기서 잘못되면 법적 문제이면서 동시에 유입 손실이다. 소스 계약이 못 보던 것: 필수/선택 구분이
// **화면에** 드러나는가, 필수 미동의가 실제로 진행을 막는가, 전체 동의가 개별 항목에 반영되는가,
// 각 약관을 **열어볼 수 있는가**(열 수 없는 문서에 동의시키면 안 된다).
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const saveConsent = jest.fn();
jest.mock('@/features/profile', () => ({
  __esModule: true,
  profileService: { saveConsent: (...a: unknown[]) => saveConsent(...a) },
}));
jest.mock('@/features/onboarding/onboardingAnalytics', () => ({ __esModule: true, trackOnboardingEvent: jest.fn() }));
let initialMarketing = false;
const reload = jest.fn();
jest.mock('@/features/onboarding', () => {
  const actual = jest.requireActual('@/features/onboarding');
  return { ...actual, __esModule: true, useOnboarding: () => ({ reload, marketingOptIn: initialMarketing, state: 'NEEDS_TERMS' }) };
});
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));

import { REQUIRED_CONSENTS, OPTIONAL_CONSENTS, TERMS_VERSION } from '@/features/onboarding';

import { routerMock } from '../../../jest.render.setup';
import TermsScreen from '../onboarding/terms';

const REQUIRED_LABELS = REQUIRED_CONSENTS.map((c) => c.label);
const OPTIONAL_LABELS = OPTIONAL_CONSENTS.map((c) => c.label);

beforeEach(() => {
  setViewport(360);
  initialMarketing = false;
  saveConsent.mockReset().mockResolvedValue(undefined);
  reload.mockClear();
  routerMock.replace.mockReset();
  routerMock.push.mockReset();
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('필수·선택 구분', () => {
  it('⚠ 라벨 자체에 [필수]/[선택] 이 박혀 있어 화면에서 구분된다', () => {
    render(<TermsScreen />);
    for (const l of REQUIRED_LABELS) {
      expect(screen.getByLabelText(l)).toBeInTheDocument();
      expect(l.startsWith('[필수]')).toBe(true);
    }
    for (const l of OPTIONAL_LABELS) {
      expect(screen.getByLabelText(l)).toBeInTheDocument();
      expect(l.startsWith('[선택]')).toBe(true);
    }
  });

  it('선택 항목은 미리 체크돼 있지 않다 — 다크패턴 방지', () => {
    render(<TermsScreen />);
    for (const l of OPTIONAL_LABELS) {
      expect(screen.getByLabelText(l).getAttribute('aria-checked')).not.toBe('true');
    }
  });
});

describe('⚠ 필수 미동의는 진행을 막는다', () => {
  const proceed = () => screen.getByText('동의하고 계속하기');

  it('아무것도 체크하지 않으면 저장이 불리지 않는다', async () => {
    render(<TermsScreen />);
    await act(async () => { fireEvent.click(proceed()); });
    expect(saveConsent).not.toHaveBeenCalled();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('필수 중 하나만 빠져도 막힌다', async () => {
    render(<TermsScreen />);
    for (const l of REQUIRED_LABELS.slice(0, -1)) fireEvent.click(screen.getByLabelText(l));
    await act(async () => { fireEvent.click(proceed()); });
    expect(saveConsent).not.toHaveBeenCalled();
  });

  it('필수를 전부 체크하면 진행되고, 선택은 안 해도 된다', async () => {
    render(<TermsScreen />);
    for (const l of REQUIRED_LABELS) fireEvent.click(screen.getByLabelText(l));
    await act(async () => { fireEvent.click(proceed()); });
    expect(saveConsent).toHaveBeenCalledWith('u1', { termsVersion: TERMS_VERSION, marketingOptIn: false });
    expect(routerMock.replace).toHaveBeenCalledWith('/onboarding/channel');
  });

  it('선택까지 하면 marketingOptIn 이 true 로 저장된다', async () => {
    render(<TermsScreen />);
    for (const l of [...REQUIRED_LABELS, ...OPTIONAL_LABELS]) fireEvent.click(screen.getByLabelText(l));
    await act(async () => { fireEvent.click(proceed()); });
    expect(saveConsent).toHaveBeenCalledWith('u1', { termsVersion: TERMS_VERSION, marketingOptIn: true });
  });

  it('⚠ 저장이 실패하면 선택을 유지한 채 막는다 — 동의는 먼저 기록돼야 한다', async () => {
    saveConsent.mockRejectedValue(new Error('net'));
    render(<TermsScreen />);
    for (const l of REQUIRED_LABELS) fireEvent.click(screen.getByLabelText(l));
    await act(async () => { fireEvent.click(proceed()); });
    await waitFor(() => expect(screen.getByText(/약관 동의를 저장하지 못했어요/)).toBeInTheDocument());
    expect(routerMock.replace).not.toHaveBeenCalled();
    // 체크가 풀리지 않았다 — 처음부터 다시 하게 만들지 않는다.
    expect(screen.getByLabelText(REQUIRED_LABELS[0]).getAttribute('aria-checked')).toBe('true');
  });
});

describe('전체 동의', () => {
  it('전체 동의가 필수+선택 모두를 켠다', async () => {
    render(<TermsScreen />);
    fireEvent.click(screen.getByLabelText('전체 동의'));
    for (const l of [...REQUIRED_LABELS, ...OPTIONAL_LABELS]) {
      expect(screen.getByLabelText(l).getAttribute('aria-checked')).toBe('true');
    }
    await act(async () => { fireEvent.click(screen.getByText('동의하고 계속하기')); });
    expect(saveConsent).toHaveBeenCalledWith('u1', { termsVersion: TERMS_VERSION, marketingOptIn: true });
  });

  it('다시 누르면 전부 꺼진다', () => {
    render(<TermsScreen />);
    fireEvent.click(screen.getByLabelText('전체 동의'));
    fireEvent.click(screen.getByLabelText('전체 동의'));
    for (const l of REQUIRED_LABELS) {
      expect(screen.getByLabelText(l).getAttribute('aria-checked')).not.toBe('true');
    }
  });
});

describe('⚠ 열어볼 수 없는 문서에 동의시키지 않는다', () => {
  it('각 약관에 [보기] 가 붙어 있고, 누르면 그 문서로 간다', () => {
    render(<TermsScreen />);
    const views = screen.getAllByText('보기');
    expect(views.length).toBeGreaterThanOrEqual(REQUIRED_LABELS.length);
    fireEvent.click(views[0]);
    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(String(routerMock.push.mock.calls[0][0])).toMatch(/^\//);
  });

  it('보기 버튼에 어느 약관인지가 접근 이름으로 붙어 있다', () => {
    render(<TermsScreen />);
    for (const l of REQUIRED_LABELS) {
      expect(screen.getByLabelText(`${l} 보기`)).toBeInTheDocument();
    }
  });
});

it('360dp / 접근성 — 체크박스가 상태를 노출한다', () => {
  const { container } = render(<TermsScreen />);
  expect(fixedWidthsOver(container, 360)).toEqual([]);
  expect(nowrapLongText(container)).toEqual([]);
  // 모든 동의 행이 checked 상태를 프로그램적으로 노출해야 한다.
  for (const l of [...REQUIRED_LABELS, ...OPTIONAL_LABELS, '전체 동의']) {
    expect(screen.getByLabelText(l).hasAttribute('aria-checked')).toBe(true);
  }
});
