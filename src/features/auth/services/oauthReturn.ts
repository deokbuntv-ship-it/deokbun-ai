import type { AuthStatus } from '@/features/auth/types/auth';

// Where the shared OAuth return route (`/login-callback`, used by google / kakao /
// naver) sends the user once auth state resolves. PURE + deterministic so the
// callback route's navigation is unit-testable and provider-neutral.
//
// - authenticated   → home ('/')  (session established by the opener's setSession)
// - unauthenticated → back to '/login' (cancel / provider error / failed session)
// - loading         → null (stay; in the web popup flow the window closes first)
export type OAuthReturnDestination = '/' | '/login' | null;

export function resolveOAuthReturn(status: AuthStatus): OAuthReturnDestination {
  if (status === 'authenticated') return '/';
  if (status === 'unauthenticated') return '/login';
  return null;
}
