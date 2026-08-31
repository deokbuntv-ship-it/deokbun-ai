// Server-backed consultation service (Server-Trust sprint §18/§19/§20) — the PRODUCTION chat path.
//
// This replaces the client-authoritative pipeline in production: the client does NOT build grounding, a
// system prompt, engine evidence, birth input, or subject authority. It sends only the question + untrusted
// recent turns. Canonical SELF and consent are resolved from server storage. The legacy `createChatService`
// is kept only as an offline/preview pipeline and test harness; it never reaches the real Edge in production.
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
import { trackProductEvent } from '@/services/productEvents';

export function createServerConsultationService(
  transport: ConsultationTransport,
  authGuard: AuthGuard,
) {
  async function sendMessage(input: ChatServiceInput): Promise<ChatServiceResult> {
    const requestId = input.requestId ?? newRequestId();
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

    // Untrusted recent turns (bounded). The server additionally drops any non user/assistant role.
    const memoryResult = computeConversationMemory(input.messages, input.conversationMemory);
    const boundedRecent = boundRecentByChars(memoryResult.recentMessages, (m) => m.text);
    const conversationContext: UntrustedTurn[] = boundedRecent.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    // Analytics (CLIENT_INTENT) — a legitimate solo consultation request is beginning (post validation + auth).
    // Non-blocking + privacy-safe; never carries prompt/answer text; a failure here never affects the request.
    void trackProductEvent('consultation_started', {
      surface: 'consultation',
      consultationMode: 'solo',
      properties: { product: 'general' },
    }).catch(() => {}); // never let analytics affect the consultation

    try {
      const result = await transport.requestConsultation({
        question: trimmedUserMessage,
        ...(input.conversationId ? { conversationId: input.conversationId } : {}),
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
        if (result.error === 'GROUNDING_UNAVAILABLE') {
          // Not a transport failure and not retryable: the engines could not build a chart from the birth
          // information on file, and the server already released the reservation. Surfaced distinctly so the
          // UI can ask for the missing input instead of inviting a retry that must fail again.
          return {
            success: false,
            errorCode: 'GROUNDING_UNAVAILABLE',
            ...(result.message ? { errorDetail: result.message } : {}),
            requestId,
          };
        }
        if (result.error === 'INSUFFICIENT_DUK') {
          // Authoritative server balance — surface distinctly (not a generic failure) for a top-up prompt.
          return {
            success: false,
            errorCode: 'INSUFFICIENT_DUK',
            insufficientDuk: { balance: result.balance, required: result.required, shortfall: result.shortfall },
            requestId,
          };
        }
        logFailure('REQUEST_FAILED', 'error');
        return { success: false, errorCode: 'REQUEST_FAILED', requestId };
      }

      // `mode` is a UI-shaping hint only (facts stay server-authoritative); classify it locally so meta
      // is a valid ConsultationResponseMetadata regardless of what the server echoes.
      const mode = classifyConsultationMode(trimmedUserMessage, boundedRecent.length > 0);
      // Analytics (CLIENT_OBSERVED_SERVER_OUTCOME) — emit ONLY after a successful accepted server response.
      // Categorical/boolean props only (no prompt/answer text); non-blocking.
      void trackProductEvent('consultation_completed', {
        surface: 'consultation',
        consultationMode: 'solo',
        properties: {
          product: 'general',
          outcome: 'success',
          ...(result.groundingMeta?.engineVersion ? { engine_version: result.groundingMeta.engineVersion } : {}),
        },
      }).catch(() => {}); // never let analytics affect the consultation
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
