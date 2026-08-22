import { isAuthTransportError, parseInsufficientDuk } from '@/features/chat/adapters/llmError';
import type {
  ConsultationTransport,
  ConsultationTransportResult,
} from '@/features/chat/services/consultationTransport';
import type { CompatibilityResultMeta, ServerGroundingMeta } from '@/features/chat/server';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import { getSupabaseClient } from '@/services/supabase';

// Production consultation transport (Server-Trust §7/§18). Posts the INPUTS-ONLY request to the Edge
// `chat` function — NO grounding, NO system messages, NO engine facts. The Edge authenticates, resolves
// trusted birth, runs the engines, builds the grounding + prompt, calls OpenAI, validates, and returns a
// bounded { text, structuredResult?, groundingMeta }. `functions.invoke` attaches the user's access token.
export const supabaseEdgeConsultationAdapter: ConsultationTransport = {
  async requestConsultation(request): Promise<ConsultationTransportResult> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('chat', { body: request });

    if (error) {
      // 402 → authoritative INSUFFICIENT_DUK: surface the server's balance/required/shortfall so the client can
      // route to a top-up/paywall instead of a misleading generic failure (§13/§14).
      const insufficient = await parseInsufficientDuk(error);
      if (insufficient) {
        return { ok: false, error: 'INSUFFICIENT_DUK', balance: insufficient.balance, required: insufficient.required, shortfall: insufficient.shortfall };
      }
      // 401 → session expired/invalid: surface as auth so the client routes to login+resume (§15).
      return { ok: false, error: isAuthTransportError(error) ? 'AUTH_REQUIRED' : 'REQUEST_FAILED' };
    }

    const text = (data as { text?: unknown } | null)?.text;
    if (typeof text !== 'string' || text.trim().length === 0) {
      return { ok: false, error: 'REQUEST_FAILED' };
    }
    const structuredResult = (data as { structuredResult?: StructuredConsultationViewModel } | null)
      ?.structuredResult;
    const groundingMeta = (data as { groundingMeta?: ServerGroundingMeta } | null)?.groundingMeta;
    const compatibility = (data as { compatibility?: CompatibilityResultMeta } | null)?.compatibility;

    return {
      ok: true,
      text,
      ...(structuredResult ? { structuredResult } : {}),
      ...(groundingMeta ? { groundingMeta } : {}),
      ...(compatibility ? { compatibility } : {}),
    };
  },
};
