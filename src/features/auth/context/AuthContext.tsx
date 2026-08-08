import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { mapSupabaseUser } from '@/features/auth/mappers/mapSupabaseUser';
import { authService } from '@/features/auth/services/authService';
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
  signInWithProvider: (providerId: AuthProviderId) => Promise<boolean>;
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

  useEffect(() => {
    let isMounted = true;

    const supabase = getSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error || data.session === null || data.session.user === null) {
          setAuthState({ status: 'unauthenticated', user: null });
          return;
        }

        setAuthState({
          status: 'authenticated',
          user: mapSupabaseUser(data.session.user),
        });
      })
      .catch(() => {
        if (isMounted) {
          setAuthState({ status: 'unauthenticated', user: null });
        }
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        if (session === null || session.user === null) {
          setAuthState({ status: 'unauthenticated', user: null });
          return;
        }

        setAuthState({
          status: 'authenticated',
          user: mapSupabaseUser(session.user),
        });
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
  }, [authState.status, authState.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      isAuthenticated:
        authState.status === 'authenticated' && authState.user !== null,
      isSigningIn,
      signInWithProvider: async (providerId: AuthProviderId) => {
        if (isSigningInRef.current) {
          return false;
        }

        isSigningInRef.current = true;
        setIsSigningIn(true);

        try {
          const result = await authService.signInWithProvider(providerId);
          return result.success;
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
