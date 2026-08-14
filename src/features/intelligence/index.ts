// Consultation Intelligence — public surface (V1.0 foundation). Pure, engine-external
// contracts that let DeokbunAI trace WHY a consultation happened and accumulate
// quality/outcome data over time. Fail-closed (no fabricated assessment), no fake
// scores, provenance + versioning preserved. Evidence→assessment RULES are CODEX.
// See docs/CONSULTATION_INTELLIGENCE_V1.md.

export {
  CONSULTATION_INTELLIGENCE_SCHEMA_VERSION,
  EVIDENCE_LEDGER_SCHEMA_VERSION,
  ASSESSMENT_SCHEMA_VERSION,
  CONSULTATION_CASE_SCHEMA_VERSION,
  QUALITY_REVIEW_SCHEMA_VERSION,
  OUTCOME_SCHEMA_VERSION,
  ASSESSMENT_RULESET_NOT_CONNECTED,
  QUALITY_EVALUATOR_NOT_CONNECTED,
} from './versions';

// A — Evidence ledger
export { toEvidenceRecord, isValidEvidenceRecord } from './evidenceLedger';
export type {
  EvidenceProvenance,
  EvidenceType,
  EvidenceRecord,
  EvidenceRecordInput,
} from './evidenceLedger';

// B — Assessment
export {
  ASSESSMENT_AXES,
  AXIS_TO_LIFE_DOMAIN,
  assembleFailClosed,
  isValidAssessmentItem,
} from './assessment';
export type {
  AssessmentAxis,
  AssessmentLevel,
  AssessmentDirection,
  AssessmentConfidence,
  AssessmentAgreement,
  AssessmentApplicability,
  EngineContribution,
  AssessmentTiming,
  AssessmentItem,
} from './assessment';

// Question scope
export { SCOPE_AXES, axesForScope } from './questionScope';
export type { QuestionScope } from './questionScope';

// C — Consultation case / trace
export { buildConsultationCase, isValidConsultationCase } from './consultationCase';
export type {
  EngineUsage,
  ConsultationVersions,
  ConsultationCase,
  ConsultationCaseInput,
} from './consultationCase';

// D — Quality
export {
  QUALITY_DIMENSIONS,
  emptyQualityReview,
  isValidQualityReview,
} from './quality';
export type {
  QualityDimension,
  QualityStatus,
  QualityReviewSource,
  QualityReviewStatus,
  QualityReview,
} from './quality';

// User feedback
export { buildUserFeedback, isValidUserFeedback } from './feedback';
export type { FeedbackVerdict, FeedbackReason, UserFeedback } from './feedback';

// Outcome registry
export { fromUserReport, isValidOutcome } from './outcome';
export type {
  OutcomeType,
  OutcomeSource,
  OutcomeVerificationStatus,
  OutcomeConfidence,
  ConsultationOutcome,
} from './outcome';

// Presentation (Sprint 3A) — label maps + fail-closed view adapters (Claude-owned UI;
// no semantics computed). The seam that renders Codex's data without a UI rewrite.
export {
  AXIS_LABELS,
  LEVEL_LABELS,
  LEVEL_TONES,
  EVALUATIVE_LEVELS,
  DIRECTION_LABELS,
  DIRECTION_ARROWS,
  CONFIDENCE_LABELS,
  AGREEMENT_LABELS,
  APPLICABILITY_LABELS,
  AVAILABILITY_LABELS,
  AVAILABILITY_TONES,
  ENGINE_LABELS,
  GROUNDING_REASON_LABELS,
  CROSS_AGREEMENT_LABELS,
  CROSS_AGREEMENT_TONES,
  POLARITY_LABELS,
  POLARITY_TONES,
  QUALITY_STATUS_LABELS,
  QUALITY_STATUS_TONES,
  QUALITY_DIMENSION_LABELS,
  REVIEW_STATUS_LABELS,
  OUTCOME_TYPE_LABELS,
  OUTCOME_SOURCE_LABELS,
  OUTCOME_VERIFICATION_LABELS,
  OUTCOME_VERIFICATION_TONES,
  OUTCOME_CONFIDENCE_LABELS,
  FEEDBACK_VERDICT_LABELS,
  FEEDBACK_REASON_LABELS,
} from './presentation/labels';
export type { LabelTone } from './presentation/labels';
export {
  toConsumerAssessmentView,
  toAdminAssessmentRow,
} from './presentation/assessmentView';
export type {
  ConsumerAssessmentTile,
  ConsumerAssessmentView,
  AdminAssessmentRow,
} from './presentation/assessmentView';
export {
  toConsumerAssessmentDetail,
  toAdminAssessmentDetail,
} from './presentation/assessmentDetailView';
export type {
  ConsumerAssessmentDetail,
  AdminAssessmentDetail,
  EngineContributionView,
} from './presentation/assessmentDetailView';
export {
  toEngineEvidenceView,
  toGroundingView,
  toExplainabilityView,
} from './presentation/evidenceView';
export type {
  EngineKey,
  EngineEvidenceView,
  GroundingView,
  ExplainabilityView,
} from './presentation/evidenceView';
export { toCrossAnalysisView } from './presentation/crossAnalysisView';
export type {
  CrossSignalView,
  CrossDomainView,
  CrossAnalysisView,
} from './presentation/crossAnalysisView';
export {
  toEvaluationView,
  toHumanReviewView,
  toFeedbackView,
  feedbackControlState,
  toOutcomeView,
  toOutcomeListView,
} from './presentation/intelligenceViews';
export type {
  EvaluationDimensionRow,
  EvaluationView,
  HumanReviewView,
  FeedbackView,
  FeedbackControlState,
  OutcomeRowView,
} from './presentation/intelligenceViews';
// NOTE: React components (AssessmentSummary/AssessmentTile) are intentionally NOT
// re-exported here — this barrel is imported by the pure (node) jest suites, so it must
// stay free of react-native imports. Import components directly from
// '@/features/intelligence/components/AssessmentSummary'.
