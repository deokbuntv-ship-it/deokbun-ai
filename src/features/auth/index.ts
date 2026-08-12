export { AuthProvider, useAuth } from './context';
export { requireAuthenticatedUser } from './guards/requireAuthenticatedUser';
export type { AuthProviderId, AuthState, AuthStatus, AuthUser } from './types/auth';

// Provider resolution (kakao/google built-in). Naver is NOT a Supabase provider —
// it goes through the trusted edge bridge below.
export { resolveSupabaseProvider } from './services/authProviders';
export type { SupabaseProviderResolution } from './services/authProviders';

// Naver login (PATH B — trusted edge bridge). See docs/NAVER_LOGIN_ARCHITECTURE.md.
export { isNaverLoginConfigured } from './naver/naverConfig';
export {
  buildNaverAuthorizeUrl,
  parseNaverCallback,
  statesMatch,
} from './naver/naverOAuth';
export { normalizeNaverProfile } from './naver/naverProfile';
export type { NaverProfile, NaverProfileResult } from './naver/naverProfile';

// Auth error normalization (directive §20 — normalizes into the app Error Contract).
export {
  authOutcomeMessage,
  authOutcomeToAppErrorCode,
  authReasonToOutcome,
  isSilentOutcome,
} from './errors/authErrors';
export type { AuthFailureReason, AuthOutcomeCode } from './errors/authErrors';

// Shared OAuth return-route navigation (provider-neutral; used by /login-callback).
export { resolveOAuthReturn } from './services/oauthReturn';
export type { OAuthReturnDestination } from './services/oauthReturn';

// Identity / account-collision policy (directive §10 — never auto-merge by email).
export { resolveIdentityCollision } from './services/authIdentity';
export type {
  IdentityCollisionDecision,
  IdentityCollisionInput,
} from './services/authIdentity';

