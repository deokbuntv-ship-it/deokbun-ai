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
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import { buildPrompt } from '@/features/chat/prompts/promptBuilder';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import type {
    ChatServiceInput,
    ChatServiceResult,
} from '@/features/chat/types/chatArchitecture';

export type AuthGuard = () => boolean;

export function createChatService(adapter: LLMAdapter, authGuard: AuthGuard) {
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
    const grounding = GROUNDING_UNAVAILABLE;

    const promptMessages = buildPrompt({
      selectedContext,
      conversationSummary: memoryResult.existingSummary,
      recentMessages: boundedRecentMessages,
      currentUserMessage: trimmedUserMessage,
      grounding,
      mode,
    });

    try {
      const response = await adapter.generateResponse({
        model: chatConfig.defaultModel,
        messages: promptMessages,
        maxOutputTokens: chatConfig.maxOutputTokens,
        temperature: chatConfig.temperature,
        requestId, // forwarded to the edge for end-to-end correlation
      });

      return {
        success: true,
        responseText: response.text,
        requestId,
        meta: {
          promptVersion: CONSULTATION_PROMPT_VERSION,
          mode,
          grounded: grounding.status === 'available',
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