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
  | 'INSUFFICIENT_DUK';

export type ConsultationErrorKind = 'auth' | 'recoverable' | 'blocked' | 'input' | 'insufficient';

export type ConsultationErrorView = {
  kind: ConsultationErrorKind;
  message: string;
  canRetry: boolean;
};

export function mapConsultationError(code: ConsultationErrorCode): ConsultationErrorView {
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
