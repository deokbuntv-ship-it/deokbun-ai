export { AuthProvider, useAuth } from './context';
export { requireAuthenticatedUser } from './guards/requireAuthenticatedUser';
export type { AuthProviderId, AuthState, AuthStatus, AuthUser } from './types/auth';

// Provider resolution (kakao/google built-in; naver via Supabase Custom OAuth).
export {
  NAVER_CUSTOM_PROVIDER_DEFAULT,
  naverCustomProvider,
  resolveSupabaseProvider,
} from './services/authProviders';
export type { SupabaseProviderResolution } from './services/authProviders';

// Auth error normalization (directive §20 — normalizes into the app Error Contract).
export {
  authOutcomeMessage,
  authOutcomeToAppErrorCode,
  authReasonToOutcome,
  isSilentOutcome,
} from './errors/authErrors';
export type { AuthFailureReason, AuthOutcomeCode } from './errors/authErrors';

// Identity / account-collision policy (directive §10 — never auto-merge by email).
export { resolveIdentityCollision } from './services/authIdentity';
export type {
  IdentityCollisionDecision,
  IdentityCollisionInput,
} from './services/authIdentity';

