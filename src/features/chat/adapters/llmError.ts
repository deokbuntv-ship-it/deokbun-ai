// Typed LLM transport error (Sprint 2B §14/§15). Lets the client distinguish a genuine
// auth/session failure (HTTP 401 from the verify_jwt edge — an expired/invalid session)
// from a generic transport failure, so chatService can normalise it to AUTH_REQUIRED
// (→ preserve the question, prompt login, resume) instead of a misleading "다시 시도"
// loop. Kept in its own module so the shared chatService diff stays tiny (§21).
export class LLMRequestError extends Error {
  readonly authError: boolean;
  constructor(message: string, options?: { authError?: boolean }) {
    super(message);
    this.name = 'LLMRequestError';
    this.authError = options?.authError ?? false;
  }
}

// A supabase functions.invoke failure carries the HTTP Response on `.context`. 401 (and
// 403 with an auth/JWT signal) means the session is no longer valid — NOT a server/RLS
// ownership 403, not a 5xx, not a network drop (§16 — do not over-classify).
export function isAuthTransportError(error: unknown): boolean {
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  return status === 401;
}

export function isAuthLLMError(error: unknown): boolean {
  return error instanceof LLMRequestError && error.authError;
}
