import type { ChatMessage } from '@/features/chat/types/chat';
import { newRequestId } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

// Conversation-summary transport (Server-Trust §8/§20). Memory compression is a generic LLM call that
// carries NO deterministic facts — but to keep the "no client-authored system prompt" invariant, the
// client sends only the raw turns + prior summary and the SERVER builds the summary prompt. Returns the
// summary text, or null on any failure (the caller keeps the existing summary/checkpoint).
export type SummaryTransport = {
  summarize(existingSummary: string | null, turns: ChatMessage[]): Promise<string | null>;
};

export const supabaseEdgeSummaryAdapter: SummaryTransport = {
  async summarize(existingSummary, turns): Promise<string | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          mode: 'summary',
          existingSummary: existingSummary ?? null,
          turns: turns.map((m) => ({ role: m.role, content: m.text })),
          requestMetadata: { requestId: newRequestId() },
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
