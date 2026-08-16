import {
  appErrorEvent,
  boundRecentByChars,
  consoleErrorLogger,
  newRequestId,
  toAppErrorCode,
} from '@/features/analysis';
import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import { isAuthLLMError } from '@/features/chat/adapters/llmError';
import { chatConfig } from '@/features/chat/config/chatConfig';
import { evaluateMessage } from '@/features/chat/gateway/AIGateway';
import { computeConversationMemory } from '@/features/chat/memory/conversationMemory';
import { classifyConsultationMode } from '@/features/chat/prompts/consultationMode';
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import {
  GROUNDING_UNAVAILABLE,
  toSafeGrounding,
  type ConsultationGrounding,
} from '@/features/chat/prompts/grounding';
import { buildPrompt } from '@/features/chat/prompts/promptBuilder';
import {
  classifyConsultationOutput,
  composeConsultationText,
  SEMANTIC_REJECTION_MESSAGE,
} from '@/features/chat/prompts/structuredConsultation';
import { buildStructuredConsultationResult } from '@/features/chat/services/structuredConsultationResult';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import type {
    ChatServiceInput,
    ChatServiceResult,
} from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';

export type AuthGuard = () => boolean;

/** Produces deterministic engine grounding for a draft. Injected in production (SAJU wired);
 *  omitted → grounding stays fail-closed UNAVAILABLE (backward-compatible default). */
export type GroundingBuilder = (draft: ConsultationDraft) => Promise<ConsultationGrounding>;

export function createChatService(
  adapter: LLMAdapter,
  authGuard: AuthGuard,
  buildGrounding?: GroundingBuilder,
) {
  async function sendMessage(
    input: ChatServiceInput,
  ): Promise<ChatServiceResult> {
    // One correlation id per request — flows into failure logs and back to the
    // caller. The existing public `errorCode` values are preserved (the UI keeps
    // working); logging maps them to the standard AppErrorCode.
    const requestId = newRequestId();
    const logFailure = (
      errorCode: 'NOT_CONFIGURED' | 'INVALID_INPUT' | 'REQUEST_FAILED' | 'AUTH_REQUIRED',
      severity: 'warning' | 'error',
    ) => {
      consoleErrorLogger.log(
        appErrorEvent(toAppErrorCode(errorCode), 'chat', { requestId, severity }),
      );
    };

    const trimmedUserMessage = input.userMessage.trim();

    if (trimmedUserMessage.length === 0) {
      return { success: false, errorCode: 'INVALID_INPUT', requestId };
    }

    const gatewayResult = evaluateMessage(trimmedUserMessage);

    if (gatewayResult.type === 'INVALID_INPUT') {
      return { success: false, errorCode: 'INVALID_INPUT', requestId };
    }

    if (gatewayResult.type === 'LOCAL_RESPONSE') {
      return { success: true, responseText: gatewayResult.text, requestId };
    }

    if (!authGuard()) {
      logFailure('AUTH_REQUIRED', 'warning');
      return { success: false, errorCode: 'AUTH_REQUIRED', requestId };
    }

    const selectedContext = selectConsultationContext(input.draft);

    if (selectedContext === null) {
      return { success: false, errorCode: 'INVALID_INPUT', requestId };
    }

    const memoryResult = computeConversationMemory(
      input.messages,
      input.conversationMemory,
    );

    // Defense-in-depth context bound: memory already caps by message COUNT; this
    // additionally caps by characters so one very long turn can't blow the prompt
    // budget. Keeps the most-recent turns (directive §2-D). Additive, backward-
    // compatible — no change to the frozen engine or prompt shape.
    const boundedRecentMessages = boundRecentByChars(
      memoryResult.recentMessages,
      (m) => m.text,
    );

    // Response-shaping mode + grounding. Grounding is fail-closed UNAVAILABLE until Codex
    // wires the deterministic engines (§12) — the prompt then forbids fabricated
    // calculation rather than silently answering as a generic LLM (§53).
    const mode = classifyConsultationMode(
      trimmedUserMessage,
      boundedRecentMessages.length > 0 || memoryResult.existingSummary !== null,
    );
    // Deterministic SAJU grounding when a builder is injected. Fail-closed: any producer error
    // falls back to UNAVAILABLE so the consultation never breaks and never fabricates (§6/§16).
    let grounding = GROUNDING_UNAVAILABLE;
    if (buildGrounding) {
      try {
        // toSafeGrounding (§6): a structurally malformed grounding degrades to UNAVAILABLE and
        // never reaches the prompt as trusted facts.
        grounding = toSafeGrounding(await buildGrounding(input.draft));
      } catch {
        grounding = GROUNDING_UNAVAILABLE;
      }
    }

    // FIX #5: buildPrompt runs OUTSIDE the network try — guard it so a malformed grounding (already
    // sanitized by toSafeGrounding; this is defense-in-depth) can never throw uncaught. On failure,
    // fall back to a fail-closed UNAVAILABLE-grounded prompt rather than crashing the whole request.
    const promptInput = {
      selectedContext,
      conversationSummary: memoryResult.existingSummary,
      recentMessages: boundedRecentMessages,
      currentUserMessage: trimmedUserMessage,
      mode,
    };
    let effectiveGrounding = grounding;
    let promptMessages: ReturnType<typeof buildPrompt>;
    try {
      promptMessages = buildPrompt({ ...promptInput, grounding });
    } catch {
      effectiveGrounding = GROUNDING_UNAVAILABLE;
      promptMessages = buildPrompt({ ...promptInput, grounding: GROUNDING_UNAVAILABLE });
    }

    try {
      const response = await adapter.generateResponse({
        model: chatConfig.defaultModel,
        messages: promptMessages,
        maxOutputTokens: chatConfig.maxOutputTokens,
        temperature: chatConfig.temperature,
        requestId, // forwarded to the edge for end-to-end correlation
      });

      // FIX #1: classify the output. ACCEPTED → structured view-model + readable mirror.
      // STRUCTURAL_FALLBACK → safe raw prose (no schema, but no semantic violation).
      // SEMANTIC_REJECTED → a false-engine/consensus/theory/timing violation: the raw text is
      // DISCARDED (never rendered) and a safe generic message is shown instead (fail-closed).
      const outcome = classifyConsultationOutput(response.text, effectiveGrounding);
      const structuredResult =
        outcome.kind === 'ACCEPTED'
          ? buildStructuredConsultationResult(outcome.result, effectiveGrounding)
          : undefined;
      const responseText =
        outcome.kind === 'ACCEPTED'
          ? composeConsultationText(outcome.result)
          : outcome.kind === 'STRUCTURAL_FALLBACK'
            ? outcome.text
            : SEMANTIC_REJECTION_MESSAGE;
      const engineVersion =
        effectiveGrounding.status === 'available' ? effectiveGrounding.engineVersion ?? null : null;

      return {
        success: true,
        responseText,
        ...(structuredResult ? { structuredResult } : {}),
        requestId,
        meta: {
          promptVersion: CONSULTATION_PROMPT_VERSION,
          mode,
          grounded: effectiveGrounding.status === 'available',
          ...(engineVersion ? { engineVersion } : {}),
        },
      };
    } catch (error) {
      // Normalise an expired/invalid session (edge 401) to AUTH_REQUIRED so the client
      // preserves the question and resumes after login, rather than looping on retry (§15).
      if (isAuthLLMError(error)) {
        logFailure('AUTH_REQUIRED', 'warning');
        return { success: false, errorCode: 'AUTH_REQUIRED', requestId };
      }
      logFailure('REQUEST_FAILED', 'error');
      return { success: false, errorCode: 'REQUEST_FAILED', requestId };
    }
  }

  return { sendMessage };
}