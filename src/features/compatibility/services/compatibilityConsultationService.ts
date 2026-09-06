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
import { trackProductEvent } from '@/services/productEvents';
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
      errorCode: 'INVALID_INPUT' | 'REQUEST_FAILED' | 'AUTH_REQUIRED' | 'INSUFFICIENT_DUK' | 'GROUNDING_UNAVAILABLE';
      requestId: string;
      // Authoritative server balance — present ONLY for 'INSUFFICIENT_DUK' (drives the top-up/paywall UX).
      insufficientDuk?: { balance: number; required: number; shortfall: number };
      // The SERVER's own consumer-safe explanation — present ONLY for 'GROUNDING_UNAVAILABLE'. Only the
      // server knows which input is missing, so it is preferred over the client's fixed copy.
      message?: string | null;
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
        if (result.error === 'INSUFFICIENT_DUK') {
          // Analytics from AUTHORITATIVE server values only (never client-calculated); non-blocking.
          void trackProductEvent('compatibility_insufficient_duk', {
            surface: 'compatibility_chat',
            consultationMode: 'compatibility',
            properties: { product: 'compatibility', amount: result.required, duk_balance: result.balance, duk_shortfall: result.shortfall },
          }).catch(() => {});
          return {
            success: false,
            errorCode: 'INSUFFICIENT_DUK',
            insufficientDuk: { balance: result.balance, required: result.required, shortfall: result.shortfall },
            requestId,
          };
        }
        // ⚠ 2026-09-06 — 여기서 GROUNDING_UNAVAILABLE 이 REQUEST_FAILED 로 뭉개지고 있었다. 그 결과
        // 화면에는 "잠시 후 다시 시도해 주세요" 가 떴는데, 같은 출생정보로 재시도하면 똑같이 실패하므로
        // **사실이 아닌 안내**였다. 값도 치르지 않았고 재시도로도 풀리지 않는다 — 고쳐야 할 것은 입력이다.
        if (result.error === 'GROUNDING_UNAVAILABLE') {
          return { success: false, errorCode: 'GROUNDING_UNAVAILABLE', message: result.message, requestId };
        }
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
