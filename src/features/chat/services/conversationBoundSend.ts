// First-chat authority coordinator (E.2) + the auth-precedes-conversation boundary (Sprint F §B).
//
// The very first paid consultation must already carry an OWNED conversation id, and that conversation must
// never be created for an unauthenticated caller. Ordering is: AUTHENTICATION → conversation creation →
// consultation execution. An unauthenticated first turn therefore surfaces as AUTH_REQUIRED (not the generic
// REQUEST_FAILED that a bare RLS-denied INSERT would produce), and it creates NO conversation row, reserves NO
// paid work, calls NO LLM, and persists NO decision — because `ensureConversation` fails closed BEFORE any of
// those steps run.

/** Minimal auth snapshot the conversation-creation precondition reads (never the whole AuthContext). */
export type ConversationAuthSnapshot = { status: string; userId: string | null };

/** Typed signal that a conversation-bound send stopped because the caller was not authenticated. */
export class ConversationAuthRequiredError extends Error {
  readonly code = 'AUTH_REQUIRED' as const;
  constructor() {
    super('AUTH_REQUIRED');
    this.name = 'ConversationAuthRequiredError';
  }
}

/** True for the typed auth-required signal (instanceof, with a structural fallback across bundle boundaries). */
export function isConversationAuthRequiredError(error: unknown): error is ConversationAuthRequiredError {
  return (
    error instanceof ConversationAuthRequiredError ||
    (typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'AUTH_REQUIRED')
  );
}

/**
 * PURE precondition (Sprint F §B): a conversation may be created only for an authenticated user. Throws the
 * typed AUTH_REQUIRED signal otherwise, so the single conversation-creation chokepoint can fail closed before
 * it ever attempts an INSERT.
 */
export function assertAuthenticatedForConversation(auth: ConversationAuthSnapshot): void {
  if (auth.status !== 'authenticated' || auth.userId === null || auth.userId.length === 0) {
    throw new ConversationAuthRequiredError();
  }
}

export type ConversationBoundSendDeps<T> = {
  ensureConversation: () => Promise<string>;
  persistUserMessage: () => void;
  sendConsultation: (conversationId: string) => Promise<T>;
};

/**
 * Actual first-chat authority coordinator used by ChatScreen. `ensureConversation` runs FIRST and fails closed
 * for an unauthenticated caller (§B), so neither the user-message persistence nor the consultation send — and
 * therefore no reserve / LLM / decision write — runs when authentication is missing.
 */
export async function executeConversationBoundSend<T>(deps: ConversationBoundSendDeps<T>): Promise<T> {
  const conversationId = await deps.ensureConversation();
  deps.persistUserMessage();
  return deps.sendConsultation(conversationId);
}
