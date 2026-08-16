// The client→server consultation transport seam (Server-Trust §7/§18). The client posts an inputs-only
// request and receives the SERVER-validated result. Abstracted so the production Supabase adapter and the
// test doubles share one contract.
import type { ServerConsultationRequest, ServerGroundingMeta } from '@/features/chat/server';
import type { StructuredConsultationViewModel } from '@/features/intelligence/components/StructuredConsultationResult';

export type ConsultationTransportResult =
  | {
      ok: true;
      text: string;
      structuredResult?: StructuredConsultationViewModel;
      groundingMeta?: ServerGroundingMeta;
    }
  | { ok: false; error: 'INVALID_INPUT' | 'REQUEST_FAILED' | 'AUTH_REQUIRED' };

export type ConsultationTransport = {
  requestConsultation(request: ServerConsultationRequest): Promise<ConsultationTransportResult>;
};
