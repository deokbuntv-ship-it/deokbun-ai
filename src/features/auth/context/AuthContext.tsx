import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { mapSupabaseUser } from '@/features/auth/mappers/mapSupabaseUser';
import type { AuthState } from '@/features/auth/types/auth';
import { getSupabaseClient } from '@/services/supabase';

export const initialAuthState: AuthState = {
  status: 'loading',
  user: null,
};

type AuthContextValue = {
  authState: AuthState;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

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
    }),
    [authState],
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
