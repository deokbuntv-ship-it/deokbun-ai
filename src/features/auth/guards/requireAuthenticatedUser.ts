import type { AuthState } from '@/features/auth/types/auth';

export function requireAuthenticatedUser(authState: AuthState): boolean {
  return authState.status === 'authenticated' && authState.user !== null;
}
