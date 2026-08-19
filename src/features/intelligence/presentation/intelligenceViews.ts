// Consultation Intelligence — EVALUATION / FEEDBACK / OUTCOME presentation adapters
// (Sprint 3A-B, §20/§31/§32/§34). Maps the quality/feedback/outcome CONTRACTS →
// fail-closed ViewModels for the admin panels and the consumer feedback control.
//
// HARD boundaries preserved:
//   • Assessment ≠ Evaluation (§30) — this file only touches ANSWER-QUALITY + outcome,
//     never the reading;
//   • a user-reported outcome stays `unverified`; it is NEVER promoted or AI-inferred
//     (§34) — the adapter surfaces verificationStatus verbatim;
//   • feedback persistence is NOT live (§32) — `feedbackControlState()` reports the seam
//     honestly so the UI never shows a fake "저장됨".
import {
  QUALITY_EVALUATOR_NOT_CONNECTED,
  type ConsultationOutcome,
  type QualityDimension,
  type QualityReview,
  type UserFeedback,
} from '@/features/intelligence';

import {
  FEEDBACK_REASON_LABELS,
  FEEDBACK_VERDICT_LABELS,
  OUTCOME_CONFIDENCE_LABELS,
  OUTCOME_SOURCE_LABELS,
  OUTCOME_TYPE_LABELS,
  OUTCOME_VERIFICATION_LABELS,
  OUTCOME_VERIFICATION_TONES,
  QUALITY_DIMENSION_LABELS,
  QUALITY_STATUS_LABELS,
  QUALITY_STATUS_TONES,
  REVIEW_STATUS_LABELS,
  type LabelTone,
} from './labels';

// ── Evaluation / response quality (admin, §31) ───────────────────────────────────────
export type EvaluationDimensionRow = {
  dimensionKey: QualityDimension;
  dimensionLabel: string;
  statusLabel: string;
  tone: LabelTone;
  evaluated: boolean; // false → status is 'not_evaluated' (rendered muted)
};

export type EvaluationView =
  | { status: 'not_evaluated'; reason: 'evaluator_not_connected' | 'pending' }
  | {
      status: 'evaluated';
      overallLabel: string;
      overallTone: LabelTone;
      reviewStatusLabel: string;
      dimensions: EvaluationDimensionRow[];
      reviewer: string | null;
      reviewedAt: string | null;
      isAdminReview: boolean;
    };

/**
 * Fail-closed: if the auto-evaluator isn't connected (V1.0 default) OR nothing has been
 * evaluated yet, render the honest "not yet evaluated" state instead of inventing scores.
 * `overall === 'not_evaluated'` with no per-dimension entries ⇒ unevaluated.
 */
export function toEvaluationView(review: QualityReview): EvaluationView {
  const evaluatorConnected = review.evaluatorVersion !== QUALITY_EVALUATOR_NOT_CONNECTED;
  const dimEntries = Object.entries(review.dimensions) as [QualityDimension, QualityReview['dimensions'][QualityDimension]][];
  const anyEvaluated = review.overall !== 'not_evaluated' || dimEntries.length > 0;
  if (!evaluatorConnected && !anyEvaluated) {
    return { status: 'not_evaluated', reason: 'evaluator_not_connected' };
  }
  if (!anyEvaluated) {
    return { status: 'not_evaluated', reason: 'pending' };
  }
  const dimensions: EvaluationDimensionRow[] = dimEntries.map(([key, value]) => {
    const status = value ?? 'not_evaluated';
    return {
      dimensionKey: key,
      dimensionLabel: QUALITY_DIMENSION_LABELS[key],
      statusLabel: QUALITY_STATUS_LABELS[status],
      tone: QUALITY_STATUS_TONES[status],
      evaluated: status !== 'not_evaluated',
    };
  });
  return {
    status: 'evaluated',
    overallLabel: QUALITY_STATUS_LABELS[review.overall],
    overallTone: QUALITY_STATUS_TONES[review.overall],
    reviewStatusLabel: REVIEW_STATUS_LABELS[review.reviewStatus],
    dimensions,
    reviewer: review.reviewer,
    reviewedAt: review.reviewedAt,
    isAdminReview: review.source === 'admin_review',
  };
}

// ── Human review (§33) — a projection of the SAME QualityReview, no separate contract ──
// The audit found human-review has no standalone schema; it lives in QualityReview's
// reviewStatus/reviewer/reviewedAt. We surface exactly that and flag when the seam is
// absent (never fabricate a reviewer).
export type HumanReviewView = {
  reviewStatusLabel: string;
  reviewed: boolean;
  reviewer: string | null;
  reviewedAt: string | null;
  // No dedicated human-review persistence path exists (§33). UI shows the action as
  // not-connected rather than pretending it can write.
  writePathConnected: false;
};

export function toHumanReviewView(review: QualityReview): HumanReviewView {
  return {
    reviewStatusLabel: REVIEW_STATUS_LABELS[review.reviewStatus],
    reviewed: review.reviewStatus === 'reviewed',
    reviewer: review.reviewer,
    reviewedAt: review.reviewedAt,
    writePathConnected: false,
  };
}

// ── User feedback (§20/§32) ───────────────────────────────────────────────────────────
export type FeedbackView =
  | { status: 'none' }
  | { status: 'present'; verdictLabel: string; helpful: boolean; reasonLabel: string };

export function toFeedbackView(feedback: UserFeedback | null): FeedbackView {
  if (!feedback) return { status: 'none' };
  return {
    status: 'present',
    verdictLabel: FEEDBACK_VERDICT_LABELS[feedback.verdict],
    helpful: feedback.verdict === 'helpful',
    reasonLabel: feedback.reason ? FEEDBACK_REASON_LABELS[feedback.reason] : '',
  };
}

// Consumer feedback control (👍/👎). The write path is NOT wired (§32), so the control is
// presented as a seam that never claims false persistence. `canPersist` gates whether the
// UI may show a "감사합니다 · 저장됨" confirmation vs. an honest unavailable note.
export type FeedbackControlState = {
  canPersist: boolean; // false in V1.0 — no client write service wired
  unavailableNote: string;
};

export function feedbackControlState(): FeedbackControlState {
  // The client write path is wired (feedbackService → consultation_feedback). The control still
  // ANDs this with a provided onSubmit, so a screen that does not pass one falls back to the honest
  // note rather than claiming persistence.
  return {
    canPersist: true,
    unavailableNote: '피드백 저장 기능은 준비 중이에요.',
  };
}

// ── Outcome (§34) ─────────────────────────────────────────────────────────────────────
export type OutcomeRowView = {
  outcomeId: string;
  typeLabel: string;
  sourceLabel: string;
  verificationLabel: string;
  verificationTone: LabelTone;
  isVerified: boolean; // strictly verificationStatus === 'verified' — never inferred
  confidenceLabel: string;
  occurredAtPeriod: string; // '' when null
};

export function toOutcomeView(outcome: ConsultationOutcome): OutcomeRowView {
  return {
    outcomeId: outcome.outcomeId,
    typeLabel: OUTCOME_TYPE_LABELS[outcome.outcomeType],
    sourceLabel: OUTCOME_SOURCE_LABELS[outcome.source],
    verificationLabel: OUTCOME_VERIFICATION_LABELS[outcome.verificationStatus],
    verificationTone: OUTCOME_VERIFICATION_TONES[outcome.verificationStatus],
    isVerified: outcome.verificationStatus === 'verified',
    confidenceLabel: OUTCOME_CONFIDENCE_LABELS[outcome.confidence],
    occurredAtPeriod: outcome.occurredAtPeriod ?? '',
  };
}

export function toOutcomeListView(outcomes: ConsultationOutcome[]): {
  status: 'empty' | 'present';
  rows: OutcomeRowView[];
} {
  if (outcomes.length === 0) return { status: 'empty', rows: [] };
  return { status: 'present', rows: outcomes.map(toOutcomeView) };
}
