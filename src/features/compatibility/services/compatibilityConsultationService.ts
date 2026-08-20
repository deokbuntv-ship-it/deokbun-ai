// Client → server 궁합 consultation service (Compatibility V1 §73). The PRODUCTION pair-chat path.
// Same trust posture as the solo `createServerConsultationService`: canonical SELF comes from server storage;
// the client supplies only an owned partner ID or an explicitly marked raw unsaved target. The server builds pairwise evidence,
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
  self: { id?: string; birthInfo: BirthInfoDraft; label: string };
  target: { id?: string; birthInfo: BirthInfoDraft; label: string; relationship?: string | null };
  userMessage: string;
  messages: ChatMessage[];
  conversationMemory: { summary: string | null; lastSummarizedMessageId: string | null };
  requestId?: string;
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
    const requestId = input.requestId ?? newRequestId();
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

    if (!hasBirth(input.target.birthInfo)) {
      return { success: false, errorCode: 'INVALID_INPUT', requestId };
    }

    const memoryResult = computeConversationMemory(input.messages, input.conversationMemory);
    const boundedRecent = boundRecentByChars(memoryResult.recentMessages, (m) => m.text);
    const conversationContext: UntrustedTurn[] = boundedRecent.map((m) => ({ role: m.role, content: m.text }));

    try {
      const result = await transport.requestConsultation({
        consultationMode: 'compatibility',
        partnerBirthInput: input.target.birthInfo,
        partnerSubjectId: input.target.id ?? null,
        targetSource: input.target.id ? 'OWNED_SUBJECT' : 'RAW_UNSAVED',
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
