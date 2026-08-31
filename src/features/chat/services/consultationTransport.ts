// The client→server consultation transport seam (Server-Trust §7/§18). The client posts an inputs-only
// request and receives the SERVER-validated result. Abstracted so the production Supabase adapter and the
// test doubles share one contract.
import type {
  CompatibilityResultMeta,
  ServerConsultationRequest,
  ServerGroundingMeta,
} from '@/features/chat/server';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

export type ConsultationTransportResult =
  | {
      ok: true;
      text: string;
      structuredResult?: StructuredConsultationViewModel;
      groundingMeta?: ServerGroundingMeta;
      // Present only for a compatibility (궁합) request — the deterministic tier meta.
      compatibility?: CompatibilityResultMeta;
    }
  | { ok: false; error: 'INVALID_INPUT' | 'REQUEST_FAILED' | 'AUTH_REQUIRED' }
  // Authoritative HTTP 402 from the Edge — the server's balance/required/shortfall (never client-calculated).
  | { ok: false; error: 'INSUFFICIENT_DUK'; balance: number; required: number; shortfall: number }
  // V6 — authoritative HTTP 422: no chart could be built from the birth information on file, so nothing was
  // charged and retrying the same question cannot help. `message` is the server's own explanation of which
  // input to correct; the client must not substitute a generic failure string for it.
  | { ok: false; error: 'GROUNDING_UNAVAILABLE'; message: string | null };

export type ConsultationTransport = {
  requestConsultation(request: ServerConsultationRequest): Promise<ConsultationTransportResult>;
};
