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
  | 'SERVICE_UNAVAILABLE'
  | 'GROUNDING_UNAVAILABLE';

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
  // 2026-09-06 신설. 이 코드가 없어서 궁합은 `REQUEST_FAILED` 로 폴백했고 화면에는
  // "잠시 후 다시 시도해 주세요" 가 떴다 — **사실이 아닌 안내**다. 같은 출생정보로 다시 보내면 똑같이
  // 실패한다. 그래서 `canRetry: false` 이고 문구는 세 가지를 반드시 말한다:
  //   ① 왜 안 되는지  ② 덕이 차감되지 않았다는 사실  ③ 다음에 할 행동(출생정보 확인)
  //
  // 누구의 출생정보인지는 **일부러 특정하지 않는다.** 서버가 자기 메시지를 실어 보낼 때는 그쪽이 더
  // 정확해서 화면이 그걸 먼저 쓰고, 이 고정 문구는 서버가 말이 없을 때만 쓰인다. 그 경우 우리가 한쪽을
  // 지목하면 틀릴 수 있다 — 두 분을 다 보여 주고 사용자가 보고 고르게 하는 편이 확실하다.
  GROUNDING_UNAVAILABLE: {
    kind: 'profile',
    message:
      '등록된 출생 정보로는 사주를 세울 수 없어서 풀이를 드리지 못했어요.\n'
      + '덕은 차감되지 않았어요.\n'
      + '두 분의 출생 정보에서 태어난 시각을 확인해 주시면 바로 이어서 봐드릴게요.',
    canRetry: false,
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
