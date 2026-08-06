import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AuthState } from '@/features/auth/types/auth';

export const initialAuthState: AuthState = {
  status: 'unauthenticated',
  user: null,
};

type AuthContextValue = {
  authState: AuthState;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = initialAuthState;

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
