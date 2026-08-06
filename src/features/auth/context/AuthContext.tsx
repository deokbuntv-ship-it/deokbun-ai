import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { mapSupabaseUser } from '@/features/auth/mappers/mapSupabaseUser';
import { authService } from '@/features/auth/services/authService';
import type { AuthProviderId, AuthState } from '@/features/auth/types/auth';
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
