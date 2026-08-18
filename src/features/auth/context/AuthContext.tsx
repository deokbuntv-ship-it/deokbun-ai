import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { mapSupabaseUser } from '@/features/auth/mappers/mapSupabaseUser';
import { authService, type AuthActionResult } from '@/features/auth/services/authService';
import { isSessionUsable } from '@/features/auth/sessionValidity';
import type { AuthProviderId, AuthState } from '@/features/auth/types/auth';
import { profileService } from '@/features/profile';
import { getSupabaseClient } from '@/services/supabase';

export const initialAuthState: AuthState = {
  status: 'loading',
  user: null,
};

type AuthContextValue = {
  authState: AuthState;
  isAuthenticated: boolean;
  isSigningIn: boolean;
  // Returns the full AuthActionResult so the screen can surface the SPECIFIC
  // failure reason (config required / account conflict / provider error / …)
  // instead of one generic message. Previously collapsed to a boolean.
  signInWithProvider: (providerId: AuthProviderId) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isSigningInRef = useRef(false);

  // APP-23: which user's profile has been ensured (dedupe per user), plus a
  // token to discard stale results on user switch.
  const ensuredProfileUserIdRef = useRef<string | null>(null);
  const ensureProfileTokenRef = useRef(0);

  // PGRST303 closure: the latest Supabase session (read to check ACCESS-TOKEN freshness before any
  // authenticated DB bootstrap) + a signal that bumps on every auth event (initial + TOKEN_REFRESHED),
  // so the bootstrap re-runs once the token is actually valid.
  const latestSessionRef = useRef<Session | null>(null);
  const [sessionSignal, setSessionSignal] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const supabase = getSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        const session = error ? null : data.session;
        latestSessionRef.current = session;
        if (session === null || session.user === null) {
          setAuthState({ status: 'unauthenticated', user: null });
        } else {
          setAuthState({ status: 'authenticated', user: mapSupabaseUser(session.user) });
        }
        // Signal that a session state is known — the profile bootstrap gates on token freshness.
        setSessionSignal((s) => s + 1);
      })
      .catch(() => {
        if (isMounted) {
          latestSessionRef.current = null;
          setAuthState({ status: 'unauthenticated', user: null });
          setSessionSignal((s) => s + 1);
        }
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        // Capture the freshest session (incl. TOKEN_REFRESHED) so the bootstrap can re-attempt with a
        // valid access token — this is what closes the PGRST303 race (no setTimeout / no blind retry).
        latestSessionRef.current = session;
        if (session === null || session.user === null) {
          setAuthState({ status: 'unauthenticated', user: null });
        } else {
          setAuthState({ status: 'authenticated', user: mapSupabaseUser(session.user) });
        }
        setSessionSignal((s) => s + 1);
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // APP-23: ensure an app-owned profile row exists for the authenticated user.
  // Runs once per user id, is user-switch safe, and never blocks login (failures
  // are swallowed). Profile data is intentionally NOT stored in auth state.
  useEffect(() => {
    const user = authState.user;

    if (authState.status !== 'authenticated' || user === null) {
      // Reset on logout / unauthenticated so a later sign-in re-ensures.
      ensuredProfileUserIdRef.current = null;
      return;
    }

    const userId = user.id;
    if (ensuredProfileUserIdRef.current === userId) {
      return; // already ensured (or in-flight) for this user
    }

    // PGRST303 CLOSURE: bootstrap ONLY with a valid, non-expired access token. On restore the token
    // can be stale while the UI is already "authenticated" → a PostgREST write would fail JWT-claims
    // validation. If not usable, DEFER without marking done — the next auth event (TOKEN_REFRESHED
    // bumps sessionSignal) re-runs this effect with the fresh token. No setTimeout, no blind retry.
    if (!isSessionUsable(latestSessionRef.current)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[auth.profile] stage=bootstrap_deferred authInitialized=true hasSession=${!!latestSessionRef.current} hasUser=${!!latestSessionRef.current?.user} reason=session_not_usable`,
      );
      return;
    }

    ensuredProfileUserIdRef.current = userId;
    const token = ensureProfileTokenRef.current + 1;
    ensureProfileTokenRef.current = token;

    const initialDisplayName = user.displayName;

    profileService.ensureProfile(userId, initialDisplayName).catch(() => {
      // Never block login on profile creation. Allow a later retry only if the
      // active user context has not changed since this call started.
      if (token === ensureProfileTokenRef.current) {
        ensuredProfileUserIdRef.current = null;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, authState.user?.id, sessionSignal]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      isAuthenticated:
        authState.status === 'authenticated' && authState.user !== null,
      isSigningIn,
      signInWithProvider: async (providerId: AuthProviderId) => {
        if (isSigningInRef.current) {
          // A second tap while a sign-in is already in flight is a benign no-op.
          // 'CANCELLED' → AUTH_CANCELLED is a SILENT outcome (no error banner).
          return { success: false, reason: 'CANCELLED' };
        }

        isSigningInRef.current = true;
        setIsSigningIn(true);

        try {
          return await authService.signInWithProvider(providerId);
        } finally {
          isSigningInRef.current = false;
          setIsSigningIn(false);
        }
      },
      signOut: async () => {
        await authService.signOut();
      },
    }),
    [authState, isSigningIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
