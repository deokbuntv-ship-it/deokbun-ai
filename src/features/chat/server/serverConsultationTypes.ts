// Server trust boundary — request/response contract (Server-Trust sprint §7/§8/§17).
//
// THE CORE INVARIANT: the client is authoritative for NOTHING deterministic. It may say WHICH subject
// (its own birth input, or a server-owned profile id) and WHAT it is asking — nothing else. It sends NO
// grounding, NO engine evidence, NO availability flags, NO provenance, NO system prompt, NO "verified
// facts". Everything trusted is (re)built by the server from the birth INPUT it recomputes. See
// `buildServerConsultation`.
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider, HistoricalTimezoneResolver } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

// An untrusted prior conversation turn. The type constrains role to user/assistant; the server ALSO
// drops any other role (incl. injected `system`) at runtime — history is never authoritative (§20).
export type UntrustedTurn = { role: 'user' | 'assistant'; content: string };

export type ServerConsultationRequest = {
  // When present AND the server can resolve+own it (RLS), the server-owned profile is authoritative and
  // the client `birthInput` is ignored entirely (§9). When absent (V1 default, no profile persisted),
  // the server recomputes facts from `birthInput` — untrusted INPUT, never trusted FACTS.
  subjectProfileId?: string | null;
  birthInput: BirthInfoDraft;
  subjectLabel?: string | null;
  question: string;
  conversationContext?: UntrustedTurn[];
  // Diagnostics only — NEVER used to build grounding or the Qimen question time (§10). The server owns
  // the question instant (its own receipt time). Kept so a client clock skew can be observed, not trusted.
  requestMetadata?: { clientQuestionTimeEpoch?: number | null; requestId?: string | null };
};

// How the server resolves a server-owned profile id → trusted birth. Fail-closed by construction:
// a cross-user id resolves NOT_FOUND (RLS returns no row) or FORBIDDEN (explicit owner check).
export type TrustedBirthResolution =
  | { status: 'RESOLVED'; birthInfo: BirthInfoDraft; subjectLabel?: string | null }
  | { status: 'NOT_FOUND' }
  | { status: 'FORBIDDEN' };

export type ServerConsultationDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  // The authoritative question instant: the SERVER's receipt time (UTC epoch seconds). Drives the
  // current-year 세운/월운 facts and the Qimen question time (Asia/Seoul). NEVER the client clock.
  nowEpochSeconds: number;
  // The ONLY outbound trust exit — the server-built messages → the LLM. Injected so the orchestrator
  // is runtime-neutral (Deno: OpenAI; Node test: a mock). Returns the raw assistant text.
  callLLM: (messages: LLMMessage[]) => Promise<string>;
  // Optional server-owned profile resolver (Supabase + RLS). Absent → recompute from birthInput.
  resolveTrustedBirth?: (subjectProfileId: string) => Promise<TrustedBirthResolution>;
};

// Bounded, safe metadata (§17). No raw DB row, no provider object, no internal prompt, no secret.
export type ServerGroundingMeta = {
  grounded: boolean;
  engineVersion: string | null;
  engines: { myungri: string; ziwei: string; qimen: string }; // availability states only
  promptVersion: string;
  mode: string;
  questionTimeSource: 'SERVER_RECEIPT_TIME';
};

// Safe output diagnostics (no content) — how the LLM output was classified + the exact reason it was not
// rendered as a card. For Edge [chat.diag] logs only; the Edge does NOT return this to the client.
export type ServerConsultationDiagnostics = {
  outputClassification: string; // ACCEPTED | STRUCTURAL_FALLBACK | SEMANTIC_REJECTED
  rejectionReason?: string; // FORBIDDEN_THEORY | CROSS_ENGINE_CONSENSUS | UNGROUNDED_QIMEN_CLAIM | …
};

export type ServerConsultationResult =
  | {
      ok: true;
      text: string;
      structuredResult?: StructuredConsultationViewModel;
      groundingMeta: ServerGroundingMeta;
      diagnostics?: ServerConsultationDiagnostics;
    }
  | {
      ok: false;
      reason:
        | 'INVALID_INPUT'
        | 'SUBJECT_FORBIDDEN'
        | 'SUBJECT_NOT_FOUND'
        | 'LLM_FAILED';
    };
