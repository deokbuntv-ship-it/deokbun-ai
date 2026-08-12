// Consultation Intelligence — RESPONSE QUALITY (directive §25/§26/§28). Layer D:
// the quality of the LLM ANSWER, kept SEPARATE from astrology correctness (an
// engine/assessment problem) — this is used to tell "the engine was wrong" apart
// from "the assessment mapping was wrong" apart from "the GPT wording was wrong".
// PURE contract + fail-closed default + validator. Categorical, no fake score (§26).
import { QUALITY_EVALUATOR_NOT_CONNECTED, QUALITY_REVIEW_SCHEMA_VERSION } from './versions';

export type QualityDimension =
  | 'evidence_fidelity' // did the answer stick to the evidence/assessment?
  | 'question_relevance'
  | 'internal_consistency'
  | 'cross_engine_handling'
  | 'unsupported_claims'
  | 'exaggeration'
  | 'timing_structure'
  | 'followup_continuity'
  | 'clarity'
  | 'overall_quality';

export const QUALITY_DIMENSIONS: readonly QualityDimension[] = [
  'evidence_fidelity', 'question_relevance', 'internal_consistency',
  'cross_engine_handling', 'unsupported_claims', 'exaggeration',
  'timing_structure', 'followup_continuity', 'clarity', 'overall_quality',
] as const;

export type QualityStatus =
  | 'excellent' | 'good' | 'acceptable' | 'needs_review' | 'poor' | 'not_evaluated';

export type QualityReviewSource = 'auto_evaluator' | 'admin_review';
export type QualityReviewStatus = 'pending' | 'in_review' | 'reviewed';

export type QualityReview = {
  qualityReviewId: string;
  consultationCaseId: string;
  source: QualityReviewSource;
  // Per-dimension status; anything not set is treated as not_evaluated.
  dimensions: Partial<Record<QualityDimension, QualityStatus>>;
  overall: QualityStatus;
  reviewStatus: QualityReviewStatus;
  reviewer: string | null; // admin id for admin_review; null for auto
  notesRef: string | null;
  evaluatorVersion: string; // QUALITY_EVALUATOR_NOT_CONNECTED for V1.0 auto reviews
  schemaVersion: string;
  reviewedAt: string | null;
  createdAt: string;
};

// Fail-closed default (§44): nothing evaluated yet. No auto evaluator is connected
// in V1.0, so a machine review starts fully `not_evaluated` and pending.
export function emptyQualityReview(params: {
  qualityReviewId: string;
  consultationCaseId: string;
  source: QualityReviewSource;
  reviewer?: string | null;
  createdAt: string;
}): QualityReview {
  return {
    qualityReviewId: params.qualityReviewId,
    consultationCaseId: params.consultationCaseId,
    source: params.source,
    dimensions: {},
    overall: 'not_evaluated',
    reviewStatus: 'pending',
    reviewer: params.reviewer ?? null,
    notesRef: null,
    evaluatorVersion:
      params.source === 'auto_evaluator' ? QUALITY_EVALUATOR_NOT_CONNECTED : 'manual',
    schemaVersion: QUALITY_REVIEW_SCHEMA_VERSION,
    reviewedAt: null,
    createdAt: params.createdAt,
  };
}

export function isValidQualityReview(r: QualityReview): boolean {
  if (r.qualityReviewId.length === 0 || r.consultationCaseId.length === 0) return false;
  // A 'reviewed' status must name who/when; not_evaluated must not.
  if (r.reviewStatus === 'reviewed' && (r.reviewer === null || r.reviewedAt === null)) {
    return false;
  }
  const keys = Object.keys(r.dimensions) as QualityDimension[];
  return keys.every((k) => QUALITY_DIMENSIONS.includes(k));
}
