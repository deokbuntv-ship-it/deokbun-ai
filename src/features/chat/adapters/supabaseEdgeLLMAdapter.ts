import { LLMRequestError, isAuthTransportError } from '@/features/chat/adapters/llmError';
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
// Only `messages` (and an optional non-PII `requestId` for tracing) is sent.
// `model` / `maxOutputTokens` / `temperature` from the client are intentionally
// not forwarded, so the client cannot influence cost; the server has the final
// say. `functions.invoke` automatically attaches the current user's Supabase
// access token as the Authorization bearer.
export const supabaseEdgeLLMAdapter: LLMAdapter = {
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const supabase = getSupabaseClient();

    const body = request.requestId
      ? { messages: request.messages, requestId: request.requestId }
      : { messages: request.messages };

    const { data, error } = await supabase.functions.invoke('chat', {
      body,
    });

    if (error) {
      // A 401 means the session expired/invalid → surface as an auth error so the client
      // routes to login+resume rather than an endless "다시 시도" (§14–§16).
      throw new LLMRequestError('LLM request failed.', {
        authError: isAuthTransportError(error),
      });
    }

    const text = (data as { text?: unknown } | null)?.text;

    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new LLMRequestError('LLM response was empty.');
    }

    return { text };
  },
};
