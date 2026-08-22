// Shared CONSUMER error copy (Sprint J2 §10). ONE Korean-copy source for the whole consumer app, so no screen
// invents its own wording and no raw backend term (code, RPC, Edge, Supabase, LLM, service role, SQLSTATE, stack)
// can ever reach a user. Backend failures are already collapsed to a small code set at the transport boundary;
// this module turns those codes into a consumer message + a UI "kind" + whether a plain retry is safe.
//
// INSUFFICIENT_DUK intentionally has only a FALLBACK line here — the rich, actionable paywall (현재/필요/부족 +
// earn/top-up actions) lives in features/duk/consumerDukView.insufficientView and is preferred whenever the
// server balance snapshot is present. Everything here is pure + deterministic (unit-tested).

export type ConsumerErrorKind =
  | 'auth'        // needs login
  | 'profile'     // needs birth/profile info
  | 'consent'     // needs terms/consent
  | 'insufficient'// not enough 덕
  | 'recoverable' // transient; a plain retry is safe
  | 'network'     // connectivity; retry is safe
  | 'expired'     // session/time window ended; restart, not retry
  | 'blocked'     // feature not available right now; no retry
  | 'input'       // user input problem
  | 'safety';     // safety-handled response (not a failure)

export type ConsumerErrorCode =
  | 'AUTH_REQUIRED'
  | 'PROFILE_REQUIRED'
  | 'CONSENT_REQUIRED'
  | 'INSUFFICIENT_DUK'
  | 'REQUEST_FAILED'
  | 'NETWORK'
  | 'SESSION_EXPIRED'
  | 'NOT_CONFIGURED'
  | 'INVALID_INPUT'
  | 'SAFETY_HANDLED'
  | 'SERVICE_UNAVAILABLE';

export type ConsumerErrorView = {
  code: ConsumerErrorCode;
  kind: ConsumerErrorKind;
  message: string;   // consumer Korean — never a raw backend term
  canRetry: boolean; // true only when re-sending the SAME request is safe (idempotency owns dedup server-side)
};

const TABLE: Record<ConsumerErrorCode, Omit<ConsumerErrorView, 'code'>> = {
  AUTH_REQUIRED: {
    kind: 'auth',
    message: '로그인이 필요해요.\n로그인하면 이어서 진행할 수 있어요.',
    canRetry: false,
  },
  PROFILE_REQUIRED: {
    kind: 'profile',
    message: '상담을 위해 생년월일 등 기본 정보가 필요해요.\n정보를 입력하면 바로 시작할 수 있어요.',
    canRetry: false,
  },
  CONSENT_REQUIRED: {
    kind: 'consent',
    message: '서비스 이용을 위해 약관 동의가 필요해요.',
    canRetry: false,
  },
  INSUFFICIENT_DUK: {
    kind: 'insufficient',
    message: '덕이 부족해요.\n덕을 모으거나 충전한 뒤 다시 시도해 주세요.',
    canRetry: false,
  },
  REQUEST_FAILED: {
    kind: 'recoverable',
    message: '지금 처리하지 못했어요.\n잠시 후 다시 시도해 주세요.',
    canRetry: true,
  },
  NETWORK: {
    kind: 'network',
    message: '네트워크 연결이 불안정해요.\n연결 상태를 확인하고 다시 시도해 주세요.',
    canRetry: true,
  },
  SESSION_EXPIRED: {
    kind: 'expired',
    message: '상담 이용 시간이 만료됐어요.\n새로 시작해 주세요.',
    canRetry: false,
  },
  NOT_CONFIGURED: {
    kind: 'blocked',
    message: '이 기능을 준비하고 있어요.\n조금만 기다려 주세요.',
    canRetry: false,
  },
  INVALID_INPUT: {
    kind: 'input',
    message: '입력한 내용을 다시 확인해 주세요.',
    canRetry: false,
  },
  SAFETY_HANDLED: {
    kind: 'safety',
    message: '안내를 확인해 주세요.',
    canRetry: false,
  },
  SERVICE_UNAVAILABLE: {
    kind: 'blocked',
    message: '지금 서비스에 연결할 수 없어요.\n잠시 후 다시 시도해 주세요.',
    canRetry: true,
  },
};

/** Map any consumer error code to consumer copy. An unknown/one-off code degrades to a safe, retryable message. */
export function mapConsumerError(code: string): ConsumerErrorView {
  const entry = (TABLE as Record<string, Omit<ConsumerErrorView, 'code'>>)[code];
  if (entry) return { code: code as ConsumerErrorCode, ...entry };
  return { code: 'REQUEST_FAILED', ...TABLE.REQUEST_FAILED };
}

/** All codes — for tests/guards. */
export const CONSUMER_ERROR_CODES = Object.keys(TABLE) as ConsumerErrorCode[];
