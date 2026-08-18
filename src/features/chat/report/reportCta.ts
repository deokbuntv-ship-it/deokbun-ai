// Consultation report CTA logic (Commercial UX V4 §5/§6/§7/§8/§9). Pure + deterministic so the
// conversation-level "상담 보고서" action can be unit-tested without a render harness. The screen owns
// the async generate() call + the double-tap lock; this module decides ONLY (a) whether a conversation
// is eligible for a report and (b) which single CTA state to show. There is exactly one action per
// conversation (§7) — never one per message.

import type { ChatMessage } from '@/features/chat/types/chat';

// A conversation is report-eligible once it holds at least one real consultation answer — a persisted
// assistant message with a validated structured result. This mirrors reportService's own eligibility
// (answers derived from structuredResult), so the CTA only appears when generation would actually
// produce a report (the welcome message + plain-text fallbacks carry no structuredResult → excluded).
export function isReportEligible(messages: readonly ChatMessage[]): boolean {
  return messages.some((m) => m.role === 'assistant' && !!m.structuredResult);
}

export type ReportCtaState = {
  eligible: boolean;
  conversationId: string | null;
  reportId: string | null; // an existing/just-created report for this conversation, else null
  justCreated: boolean; // created in THIS session (show the success copy), vs. loaded on entry
  generating: boolean;
};

// The single CTA state to render. `hidden` means render nothing (not eligible / no conversation yet).
export type ReportCtaView =
  | { mode: 'hidden' }
  | { mode: 'generating' } // in-flight; the button is disabled (§8)
  | { mode: 'created'; reportId: string } // success copy + "보고서 확인하기" (§9)
  | { mode: 'view'; reportId: string } // an existing report → "보고서 보기" (§29)
  | { mode: 'create' }; // eligible, no report yet → "상담 보고서 만들기" (§6)

export function resolveReportCtaView(state: ReportCtaState): ReportCtaView {
  if (!state.eligible || !state.conversationId) return { mode: 'hidden' };
  if (state.generating) return { mode: 'generating' };
  if (state.reportId && state.justCreated) return { mode: 'created', reportId: state.reportId };
  if (state.reportId) return { mode: 'view', reportId: state.reportId };
  return { mode: 'create' };
}
