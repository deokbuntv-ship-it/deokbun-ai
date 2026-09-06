// 로그인 — 퍼널의 첫 화면. **모든 유입이 여기를 지난다.**
//
// 소스 계약이 못 보던 것: 네 개 provider 버튼이 실제로 그려지는가, 각 버튼이 자기 provider 로
// 핸들러를 부르는가, 그리고 **실패 사유가 한국어 문구까지 실제로 도달하는가**
// (reason → outcome → 문구, 세 단계 매핑이라 중간에서 끊겨도 소스만 보면 안 보인다).
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Platform } from 'react-native';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const signInWithProvider = jest.fn();
let isSigningIn = false;
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ signInWithProvider: (p: string) => signInWithProvider(p), isSigningIn }),
}));
jest.mock('@/features/onboarding/onboardingAnalytics', () => ({ __esModule: true, trackOnboardingEvent: jest.fn() }));
jest.mock('@/features/auth/authDiag', () => ({ __esModule: true, authDiag: jest.fn() }));

import { authOutcomeMessage, authReasonToOutcome, type AuthFailureReason } from '@/features/auth/errors/authErrors';

import { routerMock } from '../../../jest.render.setup';
import LoginScreen from '../login';

beforeEach(() => {
  setViewport(360);
  isSigningIn = false;
  signInWithProvider.mockReset().mockResolvedValue({ success: true });
  routerMock.replace.mockReset();
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('소셜 버튼', () => {
  it('네 provider 가 전부 그려진다 — 애플도 전 플랫폼 노출이다', () => {
    render(<LoginScreen />);
    for (const label of ['카카오로 계속하기', '네이버로 계속하기', 'Google로 계속하기', 'Apple로 계속하기']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('⚠ 애플은 "iOS 에서만"이 아니라 "iOS 에서 첫 번째" 다 — 순서 규칙을 잠근다', () => {
    // 하네스는 react-native-web 이므로 Platform.OS === 'web' → 애플은 **마지막**.
    // (iOS 네이티브 시트 + 웹/안드로이드 Supabase provider 이중 경로라 전 플랫폼에 노출된다.)
    expect(Platform.OS).toBe('web');
    render(<LoginScreen />);
    const order = Array.from(document.querySelectorAll('[role="button"]'))
      .map((el) => el.getAttribute('aria-label'))
      .filter((l): l is string => Boolean(l) && /계속하기$/.test(l ?? ''));
    expect(order).toEqual(['카카오로 계속하기', '네이버로 계속하기', 'Google로 계속하기', 'Apple로 계속하기']);
  });

  it('각 버튼이 자기 provider 로 핸들러를 부른다', async () => {
    render(<LoginScreen />);
    for (const [label, provider] of [
      ['카카오로 계속하기', 'kakao'],
      ['네이버로 계속하기', 'naver'],
      ['Google로 계속하기', 'google'],
    ] as const) {
      signInWithProvider.mockClear();
      await act(async () => { fireEvent.click(screen.getByLabelText(label)); });
      expect(signInWithProvider).toHaveBeenCalledWith(provider);
    }
  });

  it('성공하면 온보딩 리졸버로 간다 — 목적지를 여기서 정하지 않는다', async () => {
    render(<LoginScreen />);
    await act(async () => { fireEvent.click(screen.getByLabelText('카카오로 계속하기')); });
    expect(routerMock.replace).toHaveBeenCalledWith('/onboarding');
  });

  it('로그인 중에는 버튼이 잠긴다 — 중복 탭 방지', () => {
    isSigningIn = true;
    render(<LoginScreen />);
    const btn = screen.getByLabelText('카카오로 계속하기');
    expect(btn.getAttribute('aria-disabled') ?? btn.getAttribute('disabled')).toBeTruthy();
  });
});

describe('⚠ 실패 메시지가 화면까지 도달하는가 (reason → outcome → 문구)', () => {
  const REASONS: AuthFailureReason[] = ['NOT_SUPPORTED', 'OAUTH_URL_MISSING', 'SESSION_MISSING', 'REQUEST_FAILED'];

  it.each(REASONS)('%s → 매핑된 한국어 문구가 실제로 뜬다', async (reason) => {
    signInWithProvider.mockResolvedValue({ success: false, reason });
    render(<LoginScreen />);
    await act(async () => { fireEvent.click(screen.getByLabelText('네이버로 계속하기')); });
    // 테스트에 문구를 복사하지 않는다 — 매핑 테이블에서 가져온다.
    const expected = authOutcomeMessage(authReasonToOutcome(reason));
    await waitFor(() => expect(screen.getByText(expected)).toBeInTheDocument());
  });

  it('⚠ 취소는 조용하다 — 사용자가 스스로 닫은 것을 오류로 띄우지 않는다', async () => {
    signInWithProvider.mockResolvedValue({ success: false, reason: 'CANCELLED' });
    render(<LoginScreen />);
    await act(async () => { fireEvent.click(screen.getByLabelText('카카오로 계속하기')); });
    expect(screen.queryByText('로그인을 취소했습니다.')).toBeNull();
    expect(document.body.textContent).not.toMatch(/문제가 발생|만들지 못했|설정이 완료되지/);
  });

  it('원시 provider 오류가 화면에 새지 않는다', async () => {
    signInWithProvider.mockResolvedValue({ success: false, reason: 'REQUEST_FAILED', raw: 'invalid_grant: PKCE verifier mismatch' });
    render(<LoginScreen />);
    await act(async () => { fireEvent.click(screen.getByLabelText('네이버로 계속하기')); });
    await waitFor(() => expect(screen.getByText(/로그인 인증 중 문제가 발생했어요/)).toBeInTheDocument());
    expect(document.body.textContent).not.toContain('invalid_grant');
    expect(document.body.textContent).not.toContain('PKCE');
  });

  it('재시도하면 이전 오류 문구가 남지 않는다', async () => {
    signInWithProvider.mockResolvedValue({ success: false, reason: 'REQUEST_FAILED' });
    render(<LoginScreen />);
    await act(async () => { fireEvent.click(screen.getByLabelText('네이버로 계속하기')); });
    await waitFor(() => expect(screen.getByText(/문제가 발생했어요/)).toBeInTheDocument());
    signInWithProvider.mockResolvedValue({ success: true });
    await act(async () => { fireEvent.click(screen.getByLabelText('카카오로 계속하기')); });
    expect(screen.queryByText(/문제가 발생했어요/)).toBeNull();
  });
});

it('360dp — 네 버튼과 값 제안이 넘치도록 선언되지 않는다', () => {
  const { container } = render(<LoginScreen />);
  expect(fixedWidthsOver(container, 360)).toEqual([]);
  expect(nowrapLongText(container)).toEqual([]);
});
