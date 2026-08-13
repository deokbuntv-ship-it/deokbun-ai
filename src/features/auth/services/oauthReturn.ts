import type { AuthStatus } from '@/features/auth/types/auth';

// Where the shared OAuth return route (`/login-callback`, used by google / kakao /
// naver) sends the user once auth state resolves. PURE + deterministic so the
// callback route's navigation is unit-testable and provider-neutral.
//
// - authenticated   → the (safe) returnTo if the user was mid-consultation, else '/'
// - unauthenticated → back to '/login' (cancel / provider error / failed session)
// - loading         → null (stay; in the web popup flow the window closes first)
//
// `returnTo` is a defence-in-depth internal-path check (no external / protocol-relative
// / scheme URL). The strict route allowlist lives in the consultation intent store
// (isSafeReturnTo); callers pass an already-validated value, and this re-checks so a
// bad value can never become an open redirect (§15/§52).
export type OAuthReturnDestination = string | null;

// Mirror of the consultation intent allowlist (kept local to avoid an auth→consultation
// import cycle). A real re-check: only these routes are honoured, so even a corrupted or
// future non-allowlisted internal path can never be navigated to unchecked.
const ALLOWED_RETURN_TO: readonly string[] = ['/chat', '/consult', '/inbox', '/today', '/'];

function isInternalPath(value: string | null | undefined): value is string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes(':') ||
    value.includes('\\')
  ) {
    return false;
  }
  const path = value.split('?')[0].split('#')[0];
  return ALLOWED_RETURN_TO.includes(path);
}

export function resolveOAuthReturn(
  status: AuthStatus,
  returnTo?: string | null,
): OAuthReturnDestination {
  if (status === 'authenticated') return isInternalPath(returnTo) ? returnTo : '/';
  if (status === 'unauthenticated') return '/login';
  return null;
}
