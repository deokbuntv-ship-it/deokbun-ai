import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import type {
    LLMRequest,
    LLMResponse,
} from '@/features/chat/types/chatArchitecture';
import { getSupabaseClient } from '@/services/supabase';

// Real LLM adapter. It does NOT call any LLM provider directly — it forwards the
// prompt messages to the Supabase Edge Function (the server trust boundary),
// which holds the OpenAI key and decides the model / output-token limit.
//
// Only `messages` is sent. `model` / `maxOutputTokens` / `temperature` from the
// client are intentionally not forwarded, so the client cannot influence cost;
// the server has the final say. `functions.invoke` automatically attaches the
// current user's Supabase access token as the Authorization bearer.
export const supabaseEdgeLLMAdapter: LLMAdapter = {
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.functions.invoke('chat', {
      body: { messages: request.messages },
    });

    if (error) {
      throw new Error('LLM request failed.');
    }

    const text = (data as { text?: unknown } | null)?.text;

    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('LLM response was empty.');
    }

    return { text };
  },
};
