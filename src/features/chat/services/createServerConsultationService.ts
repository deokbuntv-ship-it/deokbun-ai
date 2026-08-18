// Server-backed consultation service (Server-Trust sprint §18/§19/§20) — the PRODUCTION chat path.
//
// This replaces the client-authoritative pipeline in production: the client does NOT build grounding, a
// system prompt, or engine evidence. It collects the question + subject birth INPUT + untrusted recent
// turns, sends them to the Edge, and renders the SERVER-validated result. The legacy `createChatService`
// (which builds grounding/prompt/classify locally) is kept only as an offline/preview pipeline and as the
// harness that unit-tests that shared logic — it never reaches the real Edge in production.
import {
  appErrorEvent,
  boundRecentByChars,
  consoleErrorLogger,
  newRequestId,
  toAppErrorCode,
} from '@/features/analysis';
import { evaluateMessage } from '@/features/chat/gateway/AIGateway';
import { computeConversationMemory } from '@/features/chat/memory/conversationMemory';
import { classifyConsultationMode } from '@/features/chat/prompts/consultationMode';
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import type { ConsultationTransport } from '@/features/chat/services/consultationTransport';
import type { AuthGuard } from '@/features/chat/services/chatService';
import type { UntrustedTurn } from '@/features/chat/server';
import type {
  ChatServiceInput,
  ChatServiceResult,
} from '@/features/chat/types/chatArchitecture';

export function createServerConsultationService(
  transport: ConsultationTransport,
  authGuard: AuthGuard,
) {
  async function sendMessage(input: ChatServiceInput): Promise<ChatServiceResult> {
    const requestId = newRequestId();
    const logFailure = (
      errorCode: 'INVALID_INPUT' | 'REQUEST_FAILED' | 'AUTH_REQUIRED',
      severity: 'warning' | 'error',
    ) =>
      consoleErrorLogger.log(
        appErrorEvent(toAppErrorCode(errorCode), 'chat', { requestId, severity }),
      );

    const trimmedUserMessage = input.userMessage.trim();
    if (trimmedUserMessage.length === 0) {
      return { success: false, errorCode: 'INVALID_INPUT', requestId };
    }

    // Local gateway (abuse filter + canned local responses) stays client-side UX — it never reaches the
    // LLM anyway, so it is not a trust concern.
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

    // The subject birth INPUT is the only deterministic thing the client provides — and the server
    // RECOMPUTES every fact from it, so it is untrusted input, never trusted facts.
    if (input.draft.subject === null || input.draft.birthInfo === null) {
      return { success: false, errorCode: 'INVALID_INPUT', requestId };
    }

    // Untrusted recent turns (bounded). The server additionally drops any non user/assistant role.
    const memoryResult = computeConversationMemory(input.messages, input.conversationMemory);
    const boundedRecent = boundRecentByChars(memoryResult.recentMessages, (m) => m.text);
    const conversationContext: UntrustedTurn[] = boundedRecent.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    try {
      const result = await transport.requestConsultation({
        subjectProfileId: null, // V1: no persisted profile UI yet → server recomputes from birthInput
        birthInput: input.draft.birthInfo,
        subjectLabel: input.draft.subject.displayName,
        question: trimmedUserMessage,
        conversationContext,
        // Recent turns + the compressed summary of OLDER turns (§26) — so long conversations don't
        // re-send the whole history. UNTRUSTED: the server renders it as a bounded, sanitized user
        // message, never system/evidence. Threshold-based generation is unchanged (no per-question call).
        conversationSummary: memoryResult.existingSummary,
        requestMetadata: { requestId },
      });

      if (!result.ok) {
        if (result.error === 'AUTH_REQUIRED') {
          logFailure('AUTH_REQUIRED', 'warning');
          return { success: false, errorCode: 'AUTH_REQUIRED', requestId };
        }
        if (result.error === 'INVALID_INPUT') {
          return { success: false, errorCode: 'INVALID_INPUT', requestId };
        }
        logFailure('REQUEST_FAILED', 'error');
        return { success: false, errorCode: 'REQUEST_FAILED', requestId };
      }

      // `mode` is a UI-shaping hint only (facts stay server-authoritative); classify it locally so meta
      // is a valid ConsultationResponseMetadata regardless of what the server echoes.
      const mode = classifyConsultationMode(trimmedUserMessage, boundedRecent.length > 0);
      return {
        success: true,
        responseText: result.text,
        ...(result.structuredResult ? { structuredResult: result.structuredResult } : {}),
        requestId,
        meta: {
          promptVersion: result.groundingMeta?.promptVersion ?? CONSULTATION_PROMPT_VERSION,
          mode,
          grounded: result.groundingMeta?.grounded ?? false,
          ...(result.groundingMeta?.engineVersion
            ? { engineVersion: result.groundingMeta.engineVersion }
            : {}),
        },
      };
    } catch {
      logFailure('REQUEST_FAILED', 'error');
      return { success: false, errorCode: 'REQUEST_FAILED', requestId };
    }
  }

  return { sendMessage };
}
