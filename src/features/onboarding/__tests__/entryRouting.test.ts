import {
  classifyConsumerPath,
  normalizePath,
  pickPostOnboardingDestination,
  resolveGateDecision,
  type GateDecision,
} from '@/features/onboarding/entryRouting';
import type { OnboardingState } from '@/features/onboarding/onboardingState';

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
    for (const p of ['/onboarding', '/onboarding/terms', '/onboarding/birth'])
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
  it('COMPLETE lingering on a step → resolver (which sends them onward)', () => {
    expect(resolveGateDecision('COMPLETE', '/onboarding/terms')).toEqual(redirect('/onboarding'));
    expect(resolveGateDecision('COMPLETE', '/onboarding/birth')).toEqual(redirect('/onboarding'));
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
