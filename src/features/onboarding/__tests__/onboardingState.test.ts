import { deriveOnboardingState, isOnboarded, type OnboardingFacts } from '@/features/onboarding/onboardingState';

const facts = (over: Partial<OnboardingFacts> = {}): OnboardingFacts => ({
  authStatus: 'authenticated',
  factsStatus: 'ready',
  termsComplete: true,
  birthProfileComplete: true,
  ...over,
});

describe('deriveOnboardingState — the single completeness truth', () => {
  it('auth still loading → AUTHENTICATED_LOADING (fail-closed, never renders product)', () => {
    expect(deriveOnboardingState(facts({ authStatus: 'loading' }))).toBe('AUTHENTICATED_LOADING');
  });

  it('unauthenticated → ANONYMOUS', () => {
    expect(deriveOnboardingState(facts({ authStatus: 'unauthenticated' }))).toBe('ANONYMOUS');
  });

  it('authenticated but facts not yet loaded → AUTHENTICATED_LOADING (no Home flash)', () => {
    expect(deriveOnboardingState(facts({ factsStatus: 'idle' }))).toBe('AUTHENTICATED_LOADING');
    expect(deriveOnboardingState(facts({ factsStatus: 'loading' }))).toBe('AUTHENTICATED_LOADING');
  });

  it('facts errored → ERROR (never silently treated as COMPLETE)', () => {
    expect(deriveOnboardingState(facts({ factsStatus: 'error' }))).toBe('ERROR');
  });

  it('terms missing → NEEDS_TERMS (takes priority over birth)', () => {
    expect(deriveOnboardingState(facts({ termsComplete: false, birthProfileComplete: false }))).toBe('NEEDS_TERMS');
    expect(deriveOnboardingState(facts({ termsComplete: false, birthProfileComplete: true }))).toBe('NEEDS_TERMS');
  });

  it('terms done, birth missing → NEEDS_BIRTH_PROFILE', () => {
    expect(deriveOnboardingState(facts({ termsComplete: true, birthProfileComplete: false }))).toBe('NEEDS_BIRTH_PROFILE');
  });

  it('all facts present → COMPLETE', () => {
    const s = deriveOnboardingState(facts());
    expect(s).toBe('COMPLETE');
    expect(isOnboarded(s)).toBe(true);
  });

  it('incomplete states are never "onboarded"', () => {
    for (const s of ['ANONYMOUS', 'AUTHENTICATED_LOADING', 'NEEDS_TERMS', 'NEEDS_BIRTH_PROFILE', 'ERROR'] as const) {
      expect(isOnboarded(s)).toBe(false);
    }
  });
});
