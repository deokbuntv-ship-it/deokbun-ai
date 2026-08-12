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
