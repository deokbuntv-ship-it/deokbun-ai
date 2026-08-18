// Client → server 궁합 consultation service (Compatibility V1 §73). The PRODUCTION pair-chat path.
// Same trust posture as the solo `createServerConsultationService`: the client provides only the two
// people's birth INPUT + the question; the SERVER recomputes both charts, builds the pairwise evidence,
// and returns a validated structured answer + a deterministic tier. Reuses the same transport, gateway,
// memory, and auth guard — it just sends consultationMode='compatibility' + the partner input.
import {
  appErrorEvent,
  boundRecentByChars,
  consoleErrorLogger,
  newRequestId,
  toAppErrorCode,
} from '@/features/analysis';
import { evaluateMessage } from '@/features/chat/gateway/AIGateway';
import { computeConversationMemory } from '@/features/chat/memory/conversationMemory';
import type { AuthGuard } from '@/features/chat/services/chatService';
import type { ConsultationTransport } from '@/features/chat/services/consultationTransport';
import type { CompatibilityResultMeta, UntrustedTurn } from '@/features/chat/server';
import type { ChatMessage } from '@/features/chat/types/chat';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import type { BirthInfoDraft } from '@/features/consultation';

export type CompatibilityChatInput = {
  self: { birthInfo: BirthInfoDraft; label: string };
  target: { birthInfo: BirthInfoDraft; label: string; relationship?: string | null };
  userMessage: string;
  messages: ChatMessage[];
  conversationMemory: { summary: string | null; lastSummarizedMessageId: string | null };
};

export type CompatibilityChatResult =
  | {
      success: true;
      responseText: string;
      structuredResult?: StructuredConsultationViewModel;
      compatibility?: CompatibilityResultMeta;
      requestId: string;
    }
  | {
      success: false;
      errorCode: 'INVALID_INPUT' | 'REQUEST_FAILED' | 'AUTH_REQUIRED';
      requestId: string;
    };

function hasBirth(b: BirthInfoDraft | null | undefined): b is BirthInfoDraft {
  return (
    !!b &&
    typeof b.birthYear === 'string' && b.birthYear.trim().length > 0 &&
    typeof b.birthMonth === 'string' && b.birthMonth.trim().length > 0 &&
    typeof b.birthDay === 'string' && b.birthDay.trim().length > 0
  );
}

export function createCompatibilityConsultationService(
  transport: ConsultationTransport,
  authGuard: AuthGuard,
) {
  async function sendMessage(input: CompatibilityChatInput): Promise<CompatibilityChatResult> {
    const requestId = newRequestId();
    const logFailure = (
      errorCode: 'INVALID_INPUT' | 'REQUEST_FAILED' | 'AUTH_REQUIRED',
      severity: 'warning' | 'error',
    ) =>
      consoleErrorLogger.log(appErrorEvent(toAppErrorCode(errorCode), 'chat', { requestId, severity }));

    const trimmed = input.userMessage.trim();
    if (trimmed.length === 0) return { success: false, errorCode: 'INVALID_INPUT', requestId };

    const gate = evaluateMessage(trimmed);
    if (gate.type === 'INVALID_INPUT') return { success: false, errorCode: 'INVALID_INPUT', requestId };
    if (gate.type === 'LOCAL_RESPONSE') return { success: true, responseText: gate.text, requestId };

    if (!authGuard()) {
      logFailure('AUTH_REQUIRED', 'warning');
      return { success: false, errorCode: 'AUTH_REQUIRED', requestId };
    }

    if (!hasBirth(input.self.birthInfo) || !hasBirth(input.target.birthInfo)) {
      return { success: false, errorCode: 'INVALID_INPUT', requestId };
    }

    const memoryResult = computeConversationMemory(input.messages, input.conversationMemory);
    const boundedRecent = boundRecentByChars(memoryResult.recentMessages, (m) => m.text);
    const conversationContext: UntrustedTurn[] = boundedRecent.map((m) => ({ role: m.role, content: m.text }));

    try {
      const result = await transport.requestConsultation({
        consultationMode: 'compatibility',
        birthInput: input.self.birthInfo,
        subjectLabel: input.self.label,
        partnerBirthInput: input.target.birthInfo,
        partnerLabel: input.target.relationship
          ? `${input.target.label} (${input.target.relationship})`
          : input.target.label,
        question: trimmed,
        conversationContext,
        conversationSummary: memoryResult.existingSummary,
        requestMetadata: { requestId },
      });

      if (!result.ok) {
        if (result.error === 'AUTH_REQUIRED') {
          logFailure('AUTH_REQUIRED', 'warning');
          return { success: false, errorCode: 'AUTH_REQUIRED', requestId };
        }
        if (result.error === 'INVALID_INPUT') return { success: false, errorCode: 'INVALID_INPUT', requestId };
        logFailure('REQUEST_FAILED', 'error');
        return { success: false, errorCode: 'REQUEST_FAILED', requestId };
      }

      return {
        success: true,
        responseText: result.text,
        ...(result.structuredResult ? { structuredResult: result.structuredResult } : {}),
        ...(result.compatibility ? { compatibility: result.compatibility } : {}),
        requestId,
      };
    } catch {
      logFailure('REQUEST_FAILED', 'error');
      return { success: false, errorCode: 'REQUEST_FAILED', requestId };
    }
  }

  return { sendMessage };
}
