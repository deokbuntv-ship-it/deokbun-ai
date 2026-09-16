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
  | 'GROUNDING_UNAVAILABLE'
  // 애플 5.1.2(i) — 제3자 AI 처리 동의가 없다.
  | 'AI_CONSENT_REQUIRED'
  // ⚠ 2026-09-17 — 서버가 같은 요청을 아직 만들고 있다(409). 실패가 아니라 "아직" 이다.
  | 'REQUEST_IN_PROGRESS';

export type ConsultationErrorKind =
  | 'auth' | 'recoverable' | 'blocked' | 'input' | 'insufficient'
  // 동의가 필요하다. auth 와 **다르다** — 로그인은 돼 있고, 할 일은 동의다.
  | 'consent'
  // 아직 만들어지는 중이다. 실패 카드가 아니라 기다림 표시로 그린다 — 사용자가 할 일은 없다.
  | 'pending';

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
    case 'REQUEST_IN_PROGRESS':
      // ⚠ 2026-09-17 — 실패가 아니라 "아직" 이다. **"다시 시도" 버튼을 주지 않는다**: 화면이 같은 요청
      // 번호로 알아서 다시 받아온다. 버튼을 주면 사용자가 새 질문을 보내 LLM 을 한 번 더 태우게 된다.
      return {
        kind: 'pending',
        message: '답을 만들고 있어요.\n조금만 기다려 주세요 — 다 되면 바로 보여 드릴게요.',
        canRetry: false,
      };
    case 'AI_CONSENT_REQUIRED':
      // 청구 0. 재시도로 풀리지 않는다. 겁주지 않고, 안 되는 것만 사실대로 말한다.
      return {
        kind: 'consent',
        message:
          'AI가 해석문을 만들려면 AI 처리 동의가 필요해요.\n무엇을 어디로 보내는지 확인하고 동의하시면 이어서 진행할 수 있어요.',
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
