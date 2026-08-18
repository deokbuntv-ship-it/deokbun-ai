import type { Session } from '@supabase/supabase-js';

// PGRST303 closure — is a Supabase session usable for an authenticated DB request RIGHT NOW?
//
// The authenticated profile bootstrap (AuthContext → profileService.ensureProfile) must run ONLY with
// a valid, non-expired access token. getSession() returns the STORED session without refreshing, so on
// app restore the token can be expired while the UI is already "authenticated"; a PostgREST write then
// fails JWT-claims validation (PGRST303) even though the user is logged in. This predicate lets the
// caller SKIP the bootstrap until the token is fresh (autoRefreshToken fires TOKEN_REFRESHED shortly
// after), instead of firing a doomed request and logging a scary auth error.
//
// PURE + deterministic given `nowMs` (injected for tests). Fail-closed: anything it cannot positively
// verify as fresh → not usable.

// Treat a token expiring within this window as not-usable, to avoid an edge race where it expires
// in-flight between this check and the request reaching PostgREST.
export const SESSION_EXPIRY_SKEW_MS = 5_000;

export function isSessionUsable(
  session: Session | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!session || !session.user) return false;
  if (typeof session.access_token !== 'string' || session.access_token.length === 0) return false;
  // expires_at is unix SECONDS. Absent / non-finite → cannot verify freshness → fail-closed.
  const expiresAt = session.expires_at;
  if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) return false;
  return expiresAt * 1000 > nowMs + SESSION_EXPIRY_SKEW_MS;
}
