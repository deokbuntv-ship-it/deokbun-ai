import {
  classifyConsumerPath,
  normalizePath,
  pickPostOnboardingDestination,
  resolveGateDecision,
  resolveGateNavigation,
  type GateDecision,
} from '@/features/onboarding/entryRouting';
import type { OnboardingState } from '@/features/onboarding/onboardingState';

const ALL_STATES: OnboardingState[] = ['ANONYMOUS', 'AUTHENTICATED_LOADING', 'NEEDS_TERMS', 'NEEDS_BIRTH_PROFILE', 'COMPLETE', 'ERROR'];

describe('normalizePath', () => {
  it('strips query/hash/trailing slash, defaults empty → /', () => {
    expect(normalizePath('/chat?startNew=1')).toBe('/chat');
    expect(normalizePath('/inbox#x')).toBe('/inbox');
    expect(normalizePath('/my/')).toBe('/my');
    expect(normalizePath('')).toBe('/');
    expect(normalizePath(undefined)).toBe('/');
  });
});

describe('classifyConsumerPath — fail-closed default', () => {
  it('auth + public surfaces are public', () => {
    for (const p of ['/login', '/login-callback', '/content', '/content/x', '/famous/y', '/admin', '/admin/z', '/shared-report/abc'])
      expect(classifyConsumerPath(p)).toBe('public');
  });
  it('onboarding routes are onboarding', () => {
    for (const p of ['/onboarding', '/onboarding/terms', '/onboarding/channel', '/onboarding/birth'])
      expect(classifyConsumerPath(p)).toBe('onboarding');
  });
  it('every product surface (incl. unknown) is gated by default', () => {
    for (const p of ['/', '/chat', '/compatibility', '/compatibility-chat', '/inbox', '/my', '/today', '/report/1', '/subjects', '/some-future-route'])
      expect(classifyConsumerPath(p)).toBe('gated');
  });
});

const redirect = (to: string): GateDecision => ({ kind: 'redirect', to });

describe('resolveGateDecision — gated product surfaces', () => {
  const GATED = '/chat';
  it('anonymous → login', () => expect(resolveGateDecision('ANONYMOUS', GATED)).toEqual(redirect('/login')));
  it('loading → hold (no flash)', () => expect(resolveGateDecision('AUTHENTICATED_LOADING', GATED)).toEqual({ kind: 'loading' }));
  it('error → hold (fail-closed)', () => expect(resolveGateDecision('ERROR', GATED)).toEqual({ kind: 'loading' }));
  it('needs terms → terms step', () => expect(resolveGateDecision('NEEDS_TERMS', GATED)).toEqual(redirect('/onboarding/terms')));
  it('needs birth → birth step', () => expect(resolveGateDecision('NEEDS_BIRTH_PROFILE', GATED)).toEqual(redirect('/onboarding/birth')));
  it('complete → render', () => expect(resolveGateDecision('COMPLETE', GATED)).toEqual({ kind: 'render' }));

  it('anonymous is blocked from EVERY gated deep link', () => {
    for (const p of ['/', '/chat', '/compatibility', '/inbox', '/my', '/report/9'])
      expect(resolveGateDecision('ANONYMOUS', p)).toEqual(redirect('/login'));
  });
});

describe('resolveGateDecision — public surfaces always render', () => {
  it.each(['/login', '/login-callback', '/content/x', '/shared-report/tok', '/admin'])('%s renders regardless of state', (p) => {
    for (const s of ['ANONYMOUS', 'AUTHENTICATED_LOADING', 'NEEDS_TERMS', 'NEEDS_BIRTH_PROFILE', 'COMPLETE', 'ERROR'] as OnboardingState[])
      expect(resolveGateDecision(s, p)).toEqual({ kind: 'render' });
  });
});

describe('resolveGateDecision — onboarding routes (no skipping, no lingering)', () => {
  it('anonymous on any onboarding route → login', () => {
    for (const p of ['/onboarding', '/onboarding/terms', '/onboarding/birth'])
      expect(resolveGateDecision('ANONYMOUS', p)).toEqual(redirect('/login'));
  });
  it('the resolver route always renders (it forwards/consumes continuation)', () => {
    for (const s of ['NEEDS_TERMS', 'NEEDS_BIRTH_PROFILE', 'COMPLETE'] as OnboardingState[])
      expect(resolveGateDecision(s, '/onboarding')).toEqual({ kind: 'render' });
  });
  it('NEEDS_TERMS renders the terms step but bounces the birth step to the resolver', () => {
    expect(resolveGateDecision('NEEDS_TERMS', '/onboarding/terms')).toEqual({ kind: 'render' });
    expect(resolveGateDecision('NEEDS_TERMS', '/onboarding/birth')).toEqual(redirect('/onboarding'));
  });
  it('NEEDS_BIRTH renders the birth step but bounces a finished terms step to the resolver', () => {
    expect(resolveGateDecision('NEEDS_BIRTH_PROFILE', '/onboarding/birth')).toEqual({ kind: 'render' });
    expect(resolveGateDecision('NEEDS_BIRTH_PROFILE', '/onboarding/terms')).toEqual(redirect('/onboarding'));
  });

  it('the optional channel step renders post-consent, but never before terms; still skippable (not a needed step)', () => {
    // Before consent → sent to the required terms step (can't see the optional step early).
    expect(resolveGateDecision('NEEDS_TERMS', '/onboarding/channel')).toEqual(redirect('/onboarding/terms'));
    // After consent (and even when COMPLETE, e.g. re-entering) → renders; it never gates progression.
    expect(resolveGateDecision('NEEDS_BIRTH_PROFILE', '/onboarding/channel')).toEqual({ kind: 'render' });
    expect(resolveGateDecision('COMPLETE', '/onboarding/channel')).toEqual({ kind: 'render' });
    // Anonymous still bounced to login.
    expect(resolveGateDecision('ANONYMOUS', '/onboarding/channel')).toEqual(redirect('/login'));
  });
  it('COMPLETE lingering on a step → resolver (which sends them onward)', () => {
    expect(resolveGateDecision('COMPLETE', '/onboarding/terms')).toEqual(redirect('/onboarding'));
    expect(resolveGateDecision('COMPLETE', '/onboarding/birth')).toEqual(redirect('/onboarding'));
  });
});

describe('resolveGateNavigation — idempotent, navigator never unmounted (loop fix §5/§18)', () => {
  it('a settled COMPLETE user at Home does zero work (no redirect, no overlay)', () => {
    expect(resolveGateNavigation('COMPLETE', '/')).toEqual({ redirectTo: null, showOverlay: false });
  });
  it('a settled user at each correct onboarding step does zero work', () => {
    expect(resolveGateNavigation('NEEDS_TERMS', '/onboarding/terms')).toEqual({ redirectTo: null, showOverlay: false });
    expect(resolveGateNavigation('NEEDS_BIRTH_PROFILE', '/onboarding/birth')).toEqual({ redirectTo: null, showOverlay: false });
    expect(resolveGateNavigation('ANONYMOUS', '/login')).toEqual({ redirectTo: null, showOverlay: false });
  });
  it('loading → overlay only (no navigation), so the navigator stays mounted', () => {
    expect(resolveGateNavigation('AUTHENTICATED_LOADING', '/chat')).toEqual({ redirectTo: null, showOverlay: true });
    expect(resolveGateNavigation('ERROR', '/')).toEqual({ redirectTo: null, showOverlay: true });
  });
  it('a needed redirect emits the target + overlay', () => {
    expect(resolveGateNavigation('ANONYMOUS', '/chat')).toEqual({ redirectTo: '/login', showOverlay: true });
    expect(resolveGateNavigation('NEEDS_TERMS', '/chat')).toEqual({ redirectTo: '/onboarding/terms', showOverlay: true });
  });

  // The core loop-prevention invariant: for EVERY state × path, a redirect target is NEVER the current
  // route — the gate can never re-issue a navigation to the page it is already on.
  it('never redirects to the current route (idempotent for all states × paths)', () => {
    const paths = ['/', '/chat', '/compatibility', '/inbox', '/my', '/login', '/login-callback', '/content/x', '/shared-report/t', '/onboarding', '/onboarding/terms', '/onboarding/birth', '/report/1'];
    for (const s of ALL_STATES) {
      for (const p of paths) {
        const nav = resolveGateNavigation(s, p);
        if (nav.redirectTo !== null) expect(normalizePath(nav.redirectTo)).not.toBe(normalizePath(p));
      }
    }
  });
});

describe('pickPostOnboardingDestination — continuation priority (§49)', () => {
  it('1) a pending shared report wins over everything', () => {
    expect(pickPostOnboardingDestination({ shareToken: 'a'.repeat(48), returnTo: '/chat' })).toEqual({ kind: 'shared-report', token: 'a'.repeat(48) });
  });
  it('2) then a validated internal returnTo', () => {
    expect(pickPostOnboardingDestination({ shareToken: null, returnTo: '/compatibility' })).toEqual({ kind: 'path', to: '/compatibility' });
  });
  it('3) else Home', () => {
    expect(pickPostOnboardingDestination({ shareToken: null, returnTo: null })).toEqual({ kind: 'path', to: '/' });
  });
  it('an unsafe returnTo is ignored → Home (no open redirect)', () => {
    for (const bad of ['https://evil.com', '//evil.com', '/../secret', 'javascript:alert(1)', '/not-allowlisted'])
      expect(pickPostOnboardingDestination({ shareToken: null, returnTo: bad })).toEqual({ kind: 'path', to: '/' });
  });
});

// ⚠ 2026-09-17 — 공개 문서 7개. 2026-09-15 실사이트 실측에서 전부 `/login` 으로 튕겼다: 목록에 없으면
// fail-closed 기본값이 `gated` 이기 때문이다(서버 HTML 에는 본문이 있었다). 반례는 양방향으로 건다 —
// 열려야 하는 것이 열리는가, 그리고 **막혀야 하는 것이 그대로 막히는가**.
const PUBLIC_DOCS = [
  '/account-deletion',
  '/terms-of-service',
  '/privacy-policy',
  '/ai-notice',
  '/duk-policy',
  '/refund-policy',
  '/minor-policy',
];

describe('공개 문서 7개 — 로그인 없이 열린다 (2026-09-17)', () => {
  it.each(PUBLIC_DOCS)('%s — public · 모든 상태에서 render', (p) => {
    expect(classifyConsumerPath(p)).toBe('public');
    for (const s of ALL_STATES) expect(resolveGateDecision(s, p)).toEqual({ kind: 'render' });
  });

  it('온보딩 약관 단계에서 전문을 열었다가 동의 화면으로 돌아올 수 있다', () => {
    for (const p of ['/terms-of-service', '/privacy-policy', '/minor-policy'])
      expect(resolveGateDecision('NEEDS_TERMS', p)).toEqual({ kind: 'render' });
    // 뒤로 가면 동의 화면이 그대로 렌더된다(다시 튕기지 않는다).
    expect(resolveGateNavigation('NEEDS_TERMS', '/onboarding/terms')).toEqual({ redirectTo: null, showOverlay: false });
    // 히스토리가 없어 `/my` 로 떨어지는 경우에도 동의 단계로 돌아온다.
    expect(resolveGateDecision('NEEDS_TERMS', '/my')).toEqual(redirect('/onboarding/terms'));
  });

  it('⚠ 반례 — 로그인이 필요한 화면은 그대로 막힌다 (접두사 오염 없음)', () => {
    // `/account-delete`(하이픈 없는 -delete)는 로그인해서 실행하는 화면이다. `/account-deletion` 접두사에
    // 걸려 열리면 안 된다.
    expect(classifyConsumerPath('/account-delete')).toBe('gated');
    expect(resolveGateDecision('ANONYMOUS', '/account-delete')).toEqual(redirect('/login'));
    for (const p of ['/chat', '/my', '/inbox', '/report/1', '/subject-history', '/premium'])
      expect(resolveGateDecision('ANONYMOUS', p)).toEqual(redirect('/login'));
  });

  it('⚠ 반례 — 목록에 없는 새 경로는 여전히 fail-closed', () => {
    for (const p of ['/some-future-route', '/terms', '/privacy', '/policy', '/account', '/legal'])
      expect(classifyConsumerPath(p)).toBe('gated');
  });

  it('정규화된 모양(슬래시·쿼리·해시)도 같은 판정', () => {
    expect(classifyConsumerPath('/terms-of-service/')).toBe('public');
    expect(classifyConsumerPath('/privacy-policy?from=onboarding')).toBe('public');
    expect(classifyConsumerPath('/duk-policy#s3')).toBe('public');
  });
});
