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

// V6 ROOT CAUSE 5 — a functions.invoke 422 carries the authoritative GROUNDING_UNAVAILABLE payload: the
// reading could not be built from the birth information on file (every engine fail-closed), so retrying the
// same question can never succeed. Same shape as the 402 reader below: status first, body only for that
// status, and the server's own consumer-safe explanation is carried through verbatim rather than replaced by
// a generic client string — it is the one thing that tells the user WHAT to fix.
export async function parseGroundingUnavailable(error: unknown): Promise<{ message: string | null } | null> {
  const ctx = (error as { context?: { status?: number; json?: () => Promise<unknown> } } | null)?.context;
  if (!ctx || ctx.status !== 422 || typeof ctx.json !== 'function') return null;
  try {
    const body = (await ctx.json()) as { error?: unknown; message?: unknown };
    if (!body || body.error !== 'GROUNDING_UNAVAILABLE') return null;
    return { message: typeof body.message === 'string' && body.message.length > 0 ? body.message : null };
  } catch {
    return null;
  }
}

// A functions.invoke 402 carries the authoritative INSUFFICIENT_DUK payload on the Response body
// (`error.context`). Returns the server's {balance,required,shortfall} — NEVER client-calculated — or null
// when the error is not an insufficient-Duk 402. Reads the body only for a 402 (status is checked first).
export async function parseInsufficientDuk(
  error: unknown,
): Promise<{ balance: number; required: number; shortfall: number } | null> {
  const ctx = (error as { context?: { status?: number; json?: () => Promise<unknown> } } | null)?.context;
  if (!ctx || ctx.status !== 402 || typeof ctx.json !== 'function') return null;
  try {
    const body = (await ctx.json()) as { error?: unknown; balance?: unknown; required?: unknown; shortfall?: unknown };
    if (!body || body.error !== 'INSUFFICIENT_DUK') return null;
    return {
      balance: Number(body.balance ?? 0),
      required: Number(body.required ?? 0),
      shortfall: Number(body.shortfall ?? 0),
    };
  } catch {
    return null;
  }
}
