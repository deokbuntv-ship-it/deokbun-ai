import type { AppErrorCode } from '@/features/analysis';

// Auth-flow outcome vocabulary + normalization (directive §20).
//
// authService produces low-level REASONS; this module normalizes them into richer
// user-facing OUTCOME codes with friendly Korean messages, and maps them INTO the
// existing app Error Contract (@/features/analysis) for logs/admin — REUSING
// existing AppErrorCode values (FORBIDDEN / NETWORK_ERROR / AUTH_REQUIRED /
// UNKNOWN) rather than duplicating vocabulary. Raw provider errors are NEVER
// surfaced to the user. PURE + deterministic (unit-testable).

// Low-level reasons produced by authService. Single source of truth — authService
// imports this type (so the two can never drift).
export type AuthFailureReason =
  | 'CANCELLED'
  | 'NOT_SUPPORTED'
  | 'OAUTH_URL_MISSING'
  | 'SESSION_MISSING'
  | 'REQUEST_FAILED';

// Normalized, user-facing auth outcomes. AUTH_CANCELLED is a benign user-initiated
// abort (soft notice, not an error banner — see isSilentOutcome). AUTH_ACCOUNT_
// CONFLICT is emitted by the identity-collision policy (see authIdentity.ts).
export type AuthOutcomeCode =
  | 'AUTH_CANCELLED'
  | 'AUTH_CONFIG_REQUIRED'
  | 'AUTH_PROVIDER_ERROR'
  | 'AUTH_SESSION_FAILED'
  | 'AUTH_ACCOUNT_CONFLICT'
  | 'AUTH_UNSUPPORTED';

const REASON_TO_OUTCOME: Record<AuthFailureReason, AuthOutcomeCode> = {
  CANCELLED: 'AUTH_CANCELLED',
  NOT_SUPPORTED: 'AUTH_UNSUPPORTED',
  OAUTH_URL_MISSING: 'AUTH_CONFIG_REQUIRED', // provider not configured / URL missing
  SESSION_MISSING: 'AUTH_SESSION_FAILED',
  REQUEST_FAILED: 'AUTH_PROVIDER_ERROR', // provider error or transport failure
};

export function authReasonToOutcome(reason: AuthFailureReason): AuthOutcomeCode {
  return REASON_TO_OUTCOME[reason];
}

// Friendly, non-technical Korean messages. Never a raw provider error/stack.
const OUTCOME_MESSAGE: Record<AuthOutcomeCode, string> = {
  AUTH_CANCELLED: '로그인을 취소했습니다.',
  AUTH_CONFIG_REQUIRED: '아직 로그인 설정이 완료되지 않았어요. 잠시 후 다시 시도해 주세요.',
  AUTH_PROVIDER_ERROR: '로그인 인증 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
  AUTH_SESSION_FAILED: '로그인 세션을 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
  AUTH_ACCOUNT_CONFLICT: '이미 다른 방법으로 가입된 계정이에요. 기존 로그인 방법으로 로그인해 주세요.',
  AUTH_UNSUPPORTED: '지원하지 않는 로그인 방식이에요.',
};

export function authOutcomeMessage(code: AuthOutcomeCode): string {
  return OUTCOME_MESSAGE[code];
}

// Map an auth outcome to the shared app Error Contract code (logs/admin). REUSES
// existing AppErrorCode values — no duplicate vocabulary. The rich auth semantics
// live in AuthOutcomeCode; this is the lossy projection for the shared taxonomy.
const OUTCOME_TO_APP: Record<AuthOutcomeCode, AppErrorCode> = {
  AUTH_CANCELLED: 'UNKNOWN', // benign; callers treat as soft notice (isSilentOutcome)
  AUTH_CONFIG_REQUIRED: 'FORBIDDEN',
  AUTH_PROVIDER_ERROR: 'UNKNOWN',
  AUTH_SESSION_FAILED: 'AUTH_REQUIRED',
  AUTH_ACCOUNT_CONFLICT: 'FORBIDDEN',
  AUTH_UNSUPPORTED: 'FORBIDDEN',
};

export function authOutcomeToAppErrorCode(code: AuthOutcomeCode): AppErrorCode {
  return OUTCOME_TO_APP[code];
}

// A cancelled login is user-initiated, not a failure to alarm the user about.
export function isSilentOutcome(code: AuthOutcomeCode): boolean {
  return code === 'AUTH_CANCELLED';
}
