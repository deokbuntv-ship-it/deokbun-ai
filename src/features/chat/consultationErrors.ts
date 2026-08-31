// User-facing consultation error mapping (Sprint 2A §32–§35). Turns the chat service's
// internal error codes into an actionable view: a friendly Korean message + whether the
// user can retry the SAME question. Distinguishes recoverable (retry), auth (log in),
// blocked (config/preparing — don't invite endless retry), and input errors — instead of
// collapsing everything into one "상담 중 오류가 발생했습니다".

export type ConsultationErrorCode =
  | 'AUTH_REQUIRED'
  | 'NOT_CONFIGURED'
  | 'INVALID_INPUT'
  | 'REQUEST_FAILED'
  | 'INSUFFICIENT_DUK'
  | 'GROUNDING_UNAVAILABLE';

export type ConsultationErrorKind = 'auth' | 'recoverable' | 'blocked' | 'input' | 'insufficient';

export type ConsultationErrorView = {
  kind: ConsultationErrorKind;
  message: string;
  canRetry: boolean;
};

export function mapConsultationError(
  code: ConsultationErrorCode,
  // V6 — the SERVER's own consumer-safe explanation, when it supplied one. Only GROUNDING_UNAVAILABLE
  // carries it, and only the server can know which input is missing, so it is preferred over the fixed
  // string below rather than appended to it.
  detail?: string,
): ConsultationErrorView {
  switch (code) {
    case 'AUTH_REQUIRED':
      return {
        kind: 'auth',
        message:
          'AI 상담을 이용하려면 로그인이 필요해요.\n로그인하면 방금 입력한 질문을 이어서 물어볼 수 있어요.',
        canRetry: false,
      };
    case 'REQUEST_FAILED':
      return {
        kind: 'recoverable',
        message:
          '지금 답변을 가져오지 못했어요.\n연결 상태를 확인하고 다시 시도해 주세요.',
        canRetry: true,
      };
    case 'NOT_CONFIGURED':
      return {
        kind: 'blocked',
        message: 'AI 상담 기능을 준비하고 있어요.\n잠시 후 다시 시도해 주세요.',
        canRetry: false,
      };
    case 'INVALID_INPUT':
      return {
        kind: 'input',
        message: '메시지를 다시 확인해 주세요.',
        canRetry: false,
      };
    case 'GROUNDING_UNAVAILABLE':
      // The reading could not be performed at all, so nothing was charged. Retrying the SAME question with
      // the SAME birth information must fail identically — the user has to correct the input first, which is
      // what the server's message tells them.
      return {
        kind: 'input',
        message: detail
          ?? '지금 등록된 출생 정보로는 사주를 세울 수 없어 상담을 진행하지 못했어요.\n덕은 차감되지 않았습니다. 태어난 시각(또는 대략적인 시간대)을 입력한 뒤 다시 물어봐 주세요.',
        canRetry: false,
      };
    case 'INSUFFICIENT_DUK':
      // Retrying the same request will not help until the wallet is topped up; a future top-up/paywall UX
      // uses the authoritative server balance on the service result (never a client-calculated amount).
      return {
        kind: 'insufficient',
        message: '덕이 부족해서 상담을 진행할 수 없어요.\n덕을 충전한 뒤 다시 시도해 주세요.',
        canRetry: false,
      };
  }
}
