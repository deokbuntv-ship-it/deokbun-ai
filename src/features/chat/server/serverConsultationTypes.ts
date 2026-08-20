// Server trust boundary — request/response contract (Server-Trust sprint §7/§8/§17).
//
// THE CORE INVARIANT: the client is authoritative for NOTHING deterministic. Normal consumer SELF comes
// from the authenticated user's canonical stored subject; the client says only WHAT it is asking. It sends NO
// grounding, NO engine evidence, NO availability flags, NO provenance, NO system prompt, NO "verified
// facts". Everything trusted is (re)built by the server from the birth INPUT it recomputes. See
// `buildServerConsultation`.
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider, HistoricalTimezoneResolver } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import type { PolarityTier } from '@/features/polarity/polarityKernel';
import type { ConsultationDomain } from './consultationDomain';

// An untrusted prior conversation turn. The type constrains role to user/assistant; the server ALSO
// drops any other role (incl. injected `system`) at runtime — history is never authoritative (§20).
export type UntrustedTurn = { role: 'user' | 'assistant'; content: string };

export type ServerConsultationRequest = {
  // Legacy/preview fields remain optional in the shared shape, but the paid consumer Edge ignores them and
  // always resolves canonical SELF from consultation_subjects.is_self.
  subjectProfileId?: string | null;
  birthInput?: BirthInfoDraft;
  subjectLabel?: string | null;
  // 궁합(compatibility) mode (additive; absent/'solo' → the existing single-subject path is unchanged).
  // When 'compatibility', the server ALSO recomputes the partner's chart from `partnerBirthInput` and
  // builds the deterministic PAIRWISE evidence — the partner birth is untrusted INPUT, never trusted FACTS.
  consultationMode?: 'solo' | 'compatibility';
  partnerBirthInput?: BirthInfoDraft | null;
  partnerLabel?: string | null;
  // Owned TARGET subject, or explicit RAW_UNSAVED target input when targetSource says so.
  partnerProfileId?: string | null;
  partnerSubjectId?: string | null;
  targetSource?: 'OWNED_SUBJECT' | 'RAW_UNSAVED';
  question: string;
  // Sprint E — the CURRENT conversation id, used by the Edge ONLY to server-load the previous decision
  // (ownership-verified server-side). An identifier, not authoritative data; never a trusted decision value.
  conversationId?: string | null;
  conversationContext?: UntrustedTurn[];
  // UNTRUSTED compressed prior-conversation context (§B). Like conversationContext, it is NEVER a system
  // instruction, NEVER grounding/evidence: the server renders it as a bounded, sanitized USER-role
  // message. Enables long-conversation memory without re-sending the whole history each turn (§26).
  conversationSummary?: string | null;
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
  // The ACTUAL runtime model id (Sprint E §10), server-supplied — stamped into decisionMeta. Never client.
  modelId?: string | null;
  // Server-authoritative previous-decision loader (Sprint E §2). The Edge queries the persisted decisionMeta
  // for the CURRENT conversation (ownership-verified) and injects this. Absent → no live follow-up. The
  // client's own copy of a previous polarity/version/target is NEVER trusted — only this server load is.
  loadPreviousDecision?: () => Promise<ConsultationDecisionMeta | null>;
};

// Bounded, safe metadata (§17). No raw DB row, no provider object, no internal prompt, no secret.
// Carries the decision/audit version bundle (Sprint A §11): `engineVersion` = frozen engine ruleset
// (decision-affecting), `answerPlanVersion` + `decisionPolicyVersion` (decision-affecting), `promptVersion`
// (verbalization-affecting). The model id is stamped at the Edge layer (it owns the provider), not here.
export type ServerGroundingMeta = {
  grounded: boolean;
  engineVersion: string | null;
  engines: { myungri: string; ziwei: string; qimen: string }; // availability states only
  promptVersion: string;
  answerPlanVersion: string;
  decisionPolicyVersion: string;
  mode: string;
  questionTimeSource: 'SERVER_RECEIPT_TIME';
};

// Server-owned temporal context (Sprint A §12). The reproducibility substrate: the question instant is the
// server receipt time, never the client clock. `resolvedTargets` are the referenced periods (years and
// year*100+month month-keys); `referenceYear` prefers the grounded 세운 reference (立春-based).
export type ResolvedTemporalContext = {
  anchorEpochSeconds: number;
  timezone: 'Asia/Seoul';
  referenceYear: number | null;
  referenceMonth: number | null;
  resolvedTargets: number[];
  qimenActive: boolean;
};

// Persisted decision/audit context (Sprint D §D1) — server-produced, stored INSIDE the structured_result
// JSON (no migration). Enables version-mismatch handling (§D4) + structured follow-up (§D2/§D3).
// Backward-compatible: legacy rows lack it → undefined (never assume they used the current versions).
export type ConsultationDecisionMeta = {
  answerPlanVersion: string; // decision-affecting
  decisionPolicyVersion: string; // decision-affecting
  promptVersion: string; // verbalization-affecting
  engineVersion?: string | null; // decision-affecting (frozen ruleset)
  modelId?: string | null; // verbalization-affecting (Edge-stamped when available)
  resolvedGranularity: 'NONE' | 'YEAR' | 'MONTH';
  resolvedTargets: number[]; // years and/or year*100+month keys the question resolved (non-ranked identities)
  polarity?: PolarityTier; // the target-scoped conclusion polarity (when one resolved)
  domain?: ConsultationDomain; // Sprint E §8 — the turn's topic, so a follow-up can preserve it server-side
  resolvedTemporalContext: ResolvedTemporalContext;
};

// Safe output diagnostics (no content) — how the LLM output was classified + the exact reason it was not
// rendered as a card. For Edge [chat.diag] logs only; the Edge does NOT return this to the client.
export type ServerConsultationDiagnostics = {
  outputClassification: string; // ACCEPTED | STRUCTURAL_FALLBACK | SEMANTIC_REJECTED | SAFETY_ROUTED
  rejectionReason?: string; // FORBIDDEN_THEORY | CROSS_ENGINE_CONSENSUS | GUARD_CERTAINTY_MITIGATION | …
  // Set when a pre-LLM safety route fired (Sprint A §2) — hard-stop routes never reached grounding/LLM.
  safetyRoute?: string; // SELF_HARM | DEATH_LIFESPAN | MEDICAL | FINANCIAL_GUARANTEE
  // True when the certainty/mitigation guard forced exactly one constrained regeneration (§9).
  regenerated?: boolean;
  // Live follow-up (Sprint E): the classified follow-up intent + whether the stored decision was under a
  // different decision version than current (so a "왜?" explained the OLD decision without recomputing).
  followUp?: string; // WHY | NEXT_YEAR | BETWEEN_CANDIDATES | WHEN
  versionMismatch?: boolean;
};

// Deterministic 궁합 verdict (SERVER-owned tier — never an LLM/ fabricated score). Carried alongside the
// structured answer so the client can render the tier chip, the mailbox summary, and the report without
// any extra LLM call. Flat data only (no engine object) so the client contract stays decoupled.
export type CompatibilityResultMeta = {
  overall: 'VERY_GOOD' | 'GOOD' | 'NEEDS_CARE' | 'CHALLENGING';
  overallLabel: string;
  dimensions: { key: string; title: string; signal: string; verdict: string }[];
  reducedPrecision: boolean;
  selfLabel: string;
  targetLabel: string;
  engineVersion: string;
  tierModelVersion: string;
};

export type ServerConsultationResult =
  | {
      ok: true;
      text: string;
      structuredResult?: StructuredConsultationViewModel;
      groundingMeta: ServerGroundingMeta;
      diagnostics?: ServerConsultationDiagnostics;
      // Server-owned reproducibility/audit substrate (Sprint A §12). Always present on success.
      resolvedTemporalContext: ResolvedTemporalContext;
      // Present only for consultationMode === 'compatibility'. Deterministic; no extra LLM call.
      compatibility?: CompatibilityResultMeta;
    }
  | {
      ok: false;
      reason:
        | 'INVALID_INPUT'
        | 'SUBJECT_FORBIDDEN'
        | 'SUBJECT_NOT_FOUND'
        | 'LLM_FAILED';
    };
