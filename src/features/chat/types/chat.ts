import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  // V4 fail-closed seam (docs/GOLDEN_FLOW_V4_UX.md P0-1). When the backend chat edge returns
  // a structured consultation result, it is attached here and the chat renders
  // <StructuredConsultationResult>. Absent → the plain-text `text` is rendered (today's
  // behavior, unbroken). The client NEVER fabricates this — it is only ever populated by the
  // backend. `import type` keeps this a compile-time reference only (no runtime coupling).
  structuredResult?: StructuredConsultationViewModel;
};
