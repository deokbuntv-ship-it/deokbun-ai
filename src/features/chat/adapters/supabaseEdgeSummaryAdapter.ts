import type { ChatMessage } from '@/features/chat/types/chat';
import { newRequestId } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

// Conversation-summary transport (Server-Trust §8/§20). Memory compression is a generic LLM call that
// carries NO deterministic facts — but to keep the "no client-authored system prompt" invariant, the
// client sends only the raw turns + prior summary and the SERVER builds the summary prompt. Returns the
// summary text, or null on any failure (the caller keeps the existing summary/checkpoint).
// `conversationId` names the conversation being summarized so the server can expire this summary's text the
// moment that conversation is deleted (migration 20260922000000). The server links it only after verifying
// ownership; the summary itself is built from `turns`, never from the conversation row.
export type SummaryTransport = {
  summarize(existingSummary: string | null, turns: ChatMessage[], conversationId?: string | null): Promise<string | null>;
};

export const supabaseEdgeSummaryAdapter: SummaryTransport = {
  async summarize(existingSummary, turns, conversationId): Promise<string | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          mode: 'summary',
          existingSummary: existingSummary ?? null,
          turns: turns.map((m) => ({ role: m.role, content: m.text })),
          requestMetadata: { requestId: newRequestId() },
          ...(conversationId ? { conversationId } : {}),
        },
      });
      if (error) return null;
      const text = (data as { text?: unknown } | null)?.text;
      return typeof text === 'string' && text.trim().length > 0 ? text : null;
    } catch {
      return null;
    }
  },
};
