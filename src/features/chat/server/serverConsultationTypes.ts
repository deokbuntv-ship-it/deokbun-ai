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
import type { CrossDivinationVerdict, JudgmentDomain } from '@/features/divination';
import type { PolarityTier } from '@/features/polarity/polarityKernel';
import type { TargetPolarityDerivation } from '@/features/chat/prompts/grounding';
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
  //
  // G6 PATCH 2 §6/§8 — FOUR OUTCOMES, EXPLICITLY NAMED, NEVER COLLAPSED.
  //
  // V4F's two-outcome sentinel (a row exists-but-invalid vs no row) missed a THIRD failure mode: the query
  // itself throwing (a DB/network/timeout error) is not the same fact as "no row was ever written," and both
  // are not the same fact as "a row exists but decisionMeta.ts's parser rejected it." Collapsing any pair of
  // these to the same value lets a caller treat an infrastructure hiccup, or a genuinely malformed row, as an
  // ordinary first turn — silently recasting a dependent follow-up ("돈은?") as an unrelated fresh reading.
  //   NONE          — NO_PRIOR_HISTORY: no row exists (first turn, or no conversation to look up).
  //   VALID         — VALID_PRIOR_HISTORY: a row was found and parsed successfully, and does not itself carry
  //                   a `priorHistoryUnavailable` taint from an earlier turn's own decline (see
  //                   ConsultationDecisionMeta.priorHistoryUnavailable below — §7's durability mechanism).
  //   MALFORMED     — PRIOR_HISTORY_MALFORMED_OR_UNRESTORABLE: a row was found but either failed
  //                   decisionMeta.ts's fail-closed parser, or parsed fine but is ITSELF a prior decline over
  //                   malformed history (the taint propagates forward through re-loads).
  //   LOAD_FAILED   — PRIOR_HISTORY_LOAD_FAILED: the query/loader itself threw. Distinct from MALFORMED only
  //                   for diagnostics; a dependent follow-up fails closed identically for both.
  loadPreviousDecision?: () => Promise<PriorHistoryLoad>;
};

export type PriorHistoryLoad =
  | { status: 'NONE' }
  | { status: 'VALID'; meta: ConsultationDecisionMeta }
  | { status: 'MALFORMED' }
  | { status: 'LOAD_FAILED' };

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
  // Sprint E.1 §16-17 — explicit comparison recognition. isComparison is true ONLY for a real grounded ≥2
  // candidate comparison; candidates are the comparable period identities (never ranked/scored). A single
  // year+month resolution is NOT a comparison, so a later "둘 중에는?" is not misled by resolvedTargets length.
  comparisonContext?: { isComparison: boolean; candidates: number[] };
  // Sprint E.1 §5-6 — the MINIMUM deterministic evidence snapshot behind THIS decision, so a later "왜?"
  // explains the stored decision/evidence instead of re-grounding under the follow-up turn's own context.
  /**
   * DEPTH REBUILD §17 — the FULL cross-discipline verdict behind THIS turn. Without it, a follow-up ("왜요?")
   * rebuilt a Myungri-only polarity snapshot and could explain a DIFFERENT conclusion than the one the user
   * was given (the audit's HIGH-severity continuity blocker). Persisting the verdict keeps the judging
   * subject, its evidence and its contradiction resolution stable across the whole paid session.
   */
  divinationVerdict?: CrossDivinationVerdict | null;
  /**
   * V4D §23 — GRAPH PROVENANCE IN THIS CONVERSATION.
   *
   * The verdict IS the graph; this says where that graph came from. A refinement EXTENDS the previous graph
   * (same evaluation instant, new conclusions appended), while an explicit "지금 다시 보면?" deliberately
   * starts a new evaluation — and V4C could not tell those apart after the fact, because both simply
   * overwrote the stored verdict.
   *
   * Recorded, never acted on: nothing branches on it. It rides inside the existing decision_meta JSONB, so
   * there is no migration.
   */
  graphRevision?: {
    schemaVersion: 'graph-revision@1.0.0';
    /** EXTENDED: this graph is the previous one plus new-axis derivations. REEVALUATED: a deliberate restart. */
    kind: 'EXTENDED' | 'REEVALUATED';
    /** The instant the PREVIOUS graph was evaluated at. */
    previousEvaluatedAtEpochSeconds: number;
    /** The instant THIS graph is evaluated at. Equal to the previous one for EXTENDED. */
    evaluationInstantEpochSeconds: number;
    /** The axis this revision was asked about. */
    axis: JudgmentDomain;
  };
  evidenceSnapshot?: {
    schemaVersion: 'decision-evidence@1.0.0';
    target: { granularity: 'YEAR' | 'MONTH'; key: number };
    polarity: PolarityTier;
    derivation: TargetPolarityDerivation;
    supportLevel: string;
    assertiveness: string;
    intents: string[];
    engineVersion: string;
  };
  resolvedTemporalContext: ResolvedTemporalContext;
  /**
   * G6 PATCH 2 §7 — DURABLE ACROSS THE LIFECYCLE, NOT JUST THE IMMEDIATE TURN.
   *
   * Set true ONLY on a turn whose own answer declined because ITS prior history was MALFORMED or LOAD_FAILED
   * (see PriorHistoryLoad above) and that turn was itself trying to depend on that history (a REFINE_EXISTING
   * continuation, or an authoritative WHY). Never set on a REEVALUATE_NOW turn — a deliberate restart produces
   * a genuinely fresh, trustworthy graph and must not poison it.
   *
   * The point of persisting this (rather than only tracking it in-memory for one turn) is durability: T1's row
   * is malformed → T2 ("돈은?") declines and persists THIS flag on its own row → T3 ("왜?") loads T2 as its
   * "previous" row. T2's row parses perfectly fine on its own (it is a well-formed decline, not a corrupted
   * row) — without this flag, the loader would report VALID_PRIOR_HISTORY for T3 and T3 would silently start a
   * fresh reading, dressed as a continuation of a judgment that never existed. The loader checks this flag
   * AFTER a successful parse and reports MALFORMED instead of VALID when it is true, so the taint survives
   * every re-load until an explicit REEVALUATE_NOW (or a genuinely NEW_QUESTION, which does not depend on the
   * prior history at all) breaks the chain.
   */
  priorHistoryUnavailable?: true;
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
  // GROUNDED_NARRATIVE_V2 §12 — true when the LLM's core prose introduced an ungrounded technical/temporal
  // fact and the deterministic grounded composition was delivered instead. Presentation only; billing
  // semantics are unchanged.
  groundedFallback?: boolean;
  /** V3 §2 — WHY the deterministic composition was delivered. Bounded categories, never answer content. */
  groundedViolations?: string[];
  // Live follow-up (Sprint E): the classified follow-up intent + whether the stored decision was under a
  // different decision version than current (so a "왜?" explained the OLD decision without recomputing).
  followUp?: string; // WHY | NEXT_YEAR | BETWEEN_CANDIDATES | WHEN
  versionMismatch?: boolean;
  /**
   * V6 ROOT CAUSE 6 — the optional language model produced nothing usable (timeout, transport fault, empty
   * output) and the deterministic grounded composition was delivered instead. NOT a failure of the
   * consultation: the authoritative material was already server-owned, so language realization is decoration
   * and its absence must never cost the reader the answer.
   */
  llmUnavailable?: boolean;
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
        | 'LLM_FAILED'
        // V6 ROOT CAUSE 5 — NO DIVINATION BASIS AT ALL. Every engine fail-closed for this birth (e.g. an
        // unknown birth time on a 절기 boundary date, where the 월주 is genuinely ambiguous and the engine
        // correctly refuses to invent one), so there is no chart, no judgment and no verdict to answer from.
        // The previous behaviour was to hand the question to the LLM under a "do not fabricate" prompt and
        // deliver the resulting general-purpose coaching as a completed, charged consultation — which is not
        // a divination product. This is a typed NON-SUCCESS: the caller releases the reservation, charges
        // nothing, and tells the reader what input would let the reading actually run.
        | 'GROUNDING_UNAVAILABLE';
      /** Present for GROUNDING_UNAVAILABLE — the consumer-safe explanation, server-authored and fact-free. */
      message?: string;
    };
