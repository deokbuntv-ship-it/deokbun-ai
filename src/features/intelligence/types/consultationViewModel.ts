// Runtime-neutral consultation view-model contract (Server-Trust summary closure §2).
//
// These TYPES previously lived inside React-Native component files
// (`components/StructuredConsultationResult.tsx`, `components/ConsultationStateNotice.tsx`). The server /
// Edge consultation contract needs them, so importing them from a UI component module created a
// UI → server dependency direction. They are moved here (a neutral `.ts`) and re-exported from those
// components for backward compatibility. Type-only move: no runtime/JSON/behavior change.
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ConsumerAssessmentView } from '@/features/intelligence/presentation/assessmentView';
import type { PolarityTier } from '@/features/polarity/polarityKernel';
import type { ConsultationDecisionMeta } from '@/features/chat/server/serverConsultationTypes';

// Whole-result truthful state (overrides the body when set). Fail-closed UX states.
export type ConsultationState =
  | 'engine_conflict'
  | 'partial_analysis'
  | 'analysis_failure'
  | 'network_error'
  | 'birth_time_unknown'
  | 'confidence_unavailable'
  | 'engine_disconnected';

// The approved answer-first structured consultation view model. Every prose section is a caller-provided
// string sourced from the LLM response (never fabricated); a section with no source is omitted.
export type StructuredConsultationViewModel = {
  // 1 — one-line core conclusion (orientation, from the LLM). '' → omitted.
  coreSummary?: string;
  // 2 — 기본 성향 / current context
  disposition?: string;
  // 3 — Assessment (fail-closed ConsumerAssessmentView)
  assessment: ConsumerAssessmentView;
  // 4 — current flow / 현재 흐름
  currentFlow?: string;
  // 5 — core interpretation (long-form; expanded)
  coreInterpretation?: string;
  // 5b — strengths (long-form; expanded)
  strengths?: string[];
  // 5c — cautions (long-form; expanded)
  cautions?: string[];
  // 5d — domain-specific interpretation (long-form; expanded)
  domainInterpretation?: { title: string; body: string }[];
  // 5e — future flow / 앞으로의 흐름 (long-form; expanded)
  futureFlow?: string;
  // 5f — AUDIT-DRIVEN REMEDIATION V1: the ACTUAL "전문근거" technical evidence, server-materialized from the
  // VerifiedEvidenceCatalog (never LLM-authored — buildServerConsultation attaches this directly from the
  // Content Plan). Distinct from domainInterpretation (still the LLM's own plain-language synthesis, kept
  // free): this is the deterministic technical citation list the LLM cannot alter or invent.
  verifiedEvidence?: { title: string; body: string }[];
  // 6 — Explainability source (evidence/methodology — the ONLY collapsible layer)
  grounding: ConsultationGrounding;
  // 7 — recommended follow-up questions (helpers only; arise from a rich answer)
  followUps?: string[];
  // Whole-result truthful state (conflict/partial/failure/…); overrides the body.
  state?: ConsultationState;
  // SERVER-owned conclusion polarity (Sprint C §8). Set from the Answer Plan (the shared kernel), NEVER by
  // the LLM — the model verbalizes the conclusion but does not decide this machine value.
  conclusionPolarity?: PolarityTier;
  // SERVER-owned decision/audit context (Sprint D §D1) — versions + resolved target/temporal context, for
  // version-mismatch handling + structured follow-up. Persisted in structured_result JSON; never LLM-authored.
  decisionMeta?: ConsultationDecisionMeta;
};
