import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useAuth } from '@/features/auth';
import { isCompleteBirthInfo } from '@/features/consultation/birthProfileValidation';
import { consultationSubjectService } from '@/features/consultation/services/consultationSubjectService';
import { deriveOnboardingState, type OnboardingFactsStatus, type OnboardingState } from '@/features/onboarding/onboardingState';
import { isTermsAccepted } from '@/features/onboarding/terms';
import { profileService } from '@/features/profile';

// The SINGLE live source of onboarding truth (§7). Loads the two completeness facts — required consent +
// canonical SELF birth profile — for the authenticated user, derives the OnboardingState, and shares it so
// the gate (deep-link protection) and the resolver route never disagree. User-switch safe: on logout / user
// change the facts clear immediately and stale in-flight loads are discarded via a token.
type OnboardingContextValue = {
  state: OnboardingState;
  factsStatus: OnboardingFactsStatus;
  marketingOptIn: boolean; // for prefilling the terms/MY marketing toggle
  selfSubjectId: string | null; // canonical SELF subject id (null until birth profile created)
  reload: () => void; // re-fetch after completing a step, or to retry an ERROR
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { authState } = useAuth();

  const [factsStatus, setFactsStatus] = useState<OnboardingFactsStatus>('idle');
  const [termsComplete, setTermsComplete] = useState(false);
  const [birthProfileComplete, setBirthProfileComplete] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [selfSubjectId, setSelfSubjectId] = useState<string | null>(null);

  const tokenRef = useRef(0);
  const loadedUserIdRef = useRef<string | null>(null);
  const [reloadSignal, setReloadSignal] = useState(0);

  const reload = useCallback(() => {
    loadedUserIdRef.current = null; // force the effect to re-fetch for the current user
    setReloadSignal((s) => s + 1);
  }, []);

  useEffect(() => {
    const status = authState.status;
    const userId = authState.user?.id ?? null;

    if (status === 'loading') {
      setFactsStatus('idle');
      return;
    }

    if (status === 'unauthenticated' || userId === null) {
      // Clear the previous user's facts immediately and discard any in-flight load (no cross-user flash).
      tokenRef.current += 1;
      loadedUserIdRef.current = null;
      setFactsStatus('idle');
      setTermsComplete(false);
      setBirthProfileComplete(false);
      setMarketingOptIn(false);
      setSelfSubjectId(null);
      return;
    }

    if (loadedUserIdRef.current === userId) {
      return; // already loaded/loading for this user (reload() nulls the ref to force a refetch)
    }

    const previousUserId = loadedUserIdRef.current;
    const token = ++tokenRef.current;
    loadedUserIdRef.current = userId;
    if (previousUserId !== null && previousUserId !== userId) {
      // Direct user switch (A→B without an unauthenticated gap): clear A's facts immediately so B never
      // sees A's onboarding state (§45/§71). factsStatus=loading also fails the derivation closed meanwhile.
      setTermsComplete(false);
      setBirthProfileComplete(false);
      setMarketingOptIn(false);
      setSelfSubjectId(null);
    }
    setFactsStatus('loading');

    Promise.all([profileService.loadConsent(userId), consultationSubjectService.getSelfSubject()])
      .then(([consent, self]) => {
        if (token !== tokenRef.current) return;
        setTermsComplete(isTermsAccepted(consent));
        setMarketingOptIn(consent.marketingOptIn);
        setBirthProfileComplete(self !== null && isCompleteBirthInfo(self.birthInfo));
        setSelfSubjectId(self?.id ?? null);
        setFactsStatus('ready');
      })
      .catch(() => {
        if (token !== tokenRef.current) return;
        // Fail-closed: a real load error becomes ERROR (retryable), never silently COMPLETE.
        loadedUserIdRef.current = null; // allow a later retry for the same user
        setFactsStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, authState.user?.id, reloadSignal]);

  const state = deriveOnboardingState({
    authStatus: authState.status,
    factsStatus,
    termsComplete,
    birthProfileComplete,
  });

  const value = useMemo<OnboardingContextValue>(
    () => ({ state, factsStatus, marketingOptIn, selfSubjectId, reload }),
    [state, factsStatus, marketingOptIn, selfSubjectId, reload],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (ctx === null) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
