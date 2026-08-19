// The onboarding STATE MACHINE — the single deterministic answer to "how far is this user through signup?".
// Pure: it takes auth status + the loaded completeness facts and returns exactly one state. Both the gate
// (deep-link protection) and the resolver route read this, so there is ONE definition (§5/§7). Fail-closed:
// any unresolved/errored input yields a non-COMPLETE state, so protected product surfaces are never shown
// before onboarding is provably finished.
import type { AuthStatus } from '@/features/auth/types/auth';

export type OnboardingState =
  | 'ANONYMOUS' // not authenticated → login-first
  | 'AUTHENTICATED_LOADING' // authenticated, completeness facts not yet resolved → fail-closed loading
  | 'NEEDS_TERMS' // required consent missing or a newer version required
  | 'NEEDS_BIRTH_PROFILE' // consent done, canonical SELF birth profile missing/incomplete
  | 'COMPLETE' // authenticated + consent + SELF birth profile
  | 'ERROR'; // facts failed to load → fail-closed (retry), never treated as COMPLETE

export type OnboardingFactsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type OnboardingFacts = {
  authStatus: AuthStatus; // 'loading' | 'authenticated' | 'unauthenticated'
  factsStatus: OnboardingFactsStatus; // load status of the DB-derived completeness facts
  termsComplete: boolean; // required consent accepted at the current version
  birthProfileComplete: boolean; // a valid canonical SELF birth profile exists
};

export function deriveOnboardingState(facts: OnboardingFacts): OnboardingState {
  if (facts.authStatus === 'loading') return 'AUTHENTICATED_LOADING';
  if (facts.authStatus === 'unauthenticated') return 'ANONYMOUS';

  // authenticated — gate on the completeness facts.
  if (facts.factsStatus === 'idle' || facts.factsStatus === 'loading') return 'AUTHENTICATED_LOADING';
  if (facts.factsStatus === 'error') return 'ERROR';

  // facts ready.
  if (!facts.termsComplete) return 'NEEDS_TERMS';
  if (!facts.birthProfileComplete) return 'NEEDS_BIRTH_PROFILE';
  return 'COMPLETE';
}

// Convenience predicate: a fully onboarded user may enter personalized product surfaces.
export function isOnboarded(state: OnboardingState): boolean {
  return state === 'COMPLETE';
}
