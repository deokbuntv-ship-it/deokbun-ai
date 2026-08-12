// Consultation Intelligence — OUTCOME REGISTRY (directive §29–§31). Links a real
// later result ("사업 확장했는데 매출이 늘었어요") back to the past consultation case.
// SAFEGUARDS: a user report is NEVER treated as verified truth (§30), and an
// outcome NEVER mutates any deterministic engine rule (§31 — enforced by there
// being no rule-mutation code anywhere). Outcomes are future OFFLINE analysis data.
// PURE contract + provenance-safe builder + validator.
import { OUTCOME_SCHEMA_VERSION } from './versions';

export type OutcomeType =
  | 'confirmed_positive'
  | 'confirmed_negative'
  | 'partial'
  | 'no_change'
  | 'other';

export type OutcomeSource =
  | 'user_report'
  | 'admin_observed'
  | 'system_observed'
  | 'external_verified';

export type OutcomeVerificationStatus =
  | 'unverified'
  | 'partially_verified'
  | 'verified'
  | 'disputed';

export type OutcomeConfidence = 'high' | 'medium' | 'low' | 'insufficient';

export type ConsultationOutcome = {
  outcomeId: string;
  relatedConsultationCaseId: string;
  relatedAssessmentRef: string | null; // which assessment this outcome bears on
  outcomeType: OutcomeType;
  occurredAtPeriod: string | null; // when the result happened (label/period, optional)
  source: OutcomeSource;
  verificationStatus: OutcomeVerificationStatus;
  confidence: OutcomeConfidence;
  notesRef: string | null; // pointer to notes, not raw PII text
  schemaVersion: string;
  createdAt: string;
};

// A user-reported outcome ALWAYS starts source=user_report + verificationStatus=
// unverified (§30). It is never auto-promoted to 'verified'.
export function fromUserReport(params: {
  outcomeId: string;
  relatedConsultationCaseId: string;
  relatedAssessmentRef?: string | null;
  outcomeType: OutcomeType;
  occurredAtPeriod?: string | null;
  notesRef?: string | null;
  createdAt: string;
}): ConsultationOutcome {
  return {
    outcomeId: params.outcomeId,
    relatedConsultationCaseId: params.relatedConsultationCaseId,
    relatedAssessmentRef: params.relatedAssessmentRef ?? null,
    outcomeType: params.outcomeType,
    occurredAtPeriod: params.occurredAtPeriod ?? null,
    source: 'user_report',
    verificationStatus: 'unverified',
    confidence: 'insufficient',
    notesRef: params.notesRef ?? null,
    schemaVersion: OUTCOME_SCHEMA_VERSION,
    createdAt: params.createdAt,
  };
}

// Provenance INVARIANT (§30): a 'user_report' can never carry 'verified' — only a
// higher-provenance source (admin/system/external) may be 'verified'.
export function isValidOutcome(o: ConsultationOutcome): boolean {
  if (o.outcomeId.length === 0 || o.relatedConsultationCaseId.length === 0) return false;
  if (o.source === 'user_report' && o.verificationStatus === 'verified') return false;
  return o.createdAt.length > 0;
}
