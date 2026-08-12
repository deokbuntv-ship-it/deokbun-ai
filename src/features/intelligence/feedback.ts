// Consultation Intelligence — USER FEEDBACK (directive §27). A user signal on a
// consultation answer. IMPORTANT: feedback is a SIGNAL, never ground truth (§27) —
// it is captured for future offline analysis and never mutates any engine rule or
// assessment (§7/§31). PURE contract + validator.
import { CONSULTATION_INTELLIGENCE_SCHEMA_VERSION } from './versions';

export type FeedbackVerdict = 'helpful' | 'not_helpful';

export type FeedbackReason =
  | 'too_vague'
  | 'too_long'
  | 'too_short'
  | 'felt_inaccurate'
  | 'hard_to_understand'
  | 'not_relevant'
  | 'other';

export type UserFeedback = {
  feedbackId: string;
  consultationCaseId: string;
  verdict: FeedbackVerdict;
  reason: FeedbackReason | null; // optional
  schemaVersion: string;
  createdAt: string;
};

export function buildUserFeedback(params: {
  feedbackId: string;
  consultationCaseId: string;
  verdict: FeedbackVerdict;
  reason?: FeedbackReason | null;
  createdAt: string;
}): UserFeedback {
  return {
    feedbackId: params.feedbackId,
    consultationCaseId: params.consultationCaseId,
    verdict: params.verdict,
    reason: params.reason ?? null,
    schemaVersion: CONSULTATION_INTELLIGENCE_SCHEMA_VERSION,
    createdAt: params.createdAt,
  };
}

export function isValidUserFeedback(f: UserFeedback): boolean {
  return (
    f.feedbackId.length > 0 &&
    f.consultationCaseId.length > 0 &&
    (f.verdict === 'helpful' || f.verdict === 'not_helpful') &&
    f.createdAt.length > 0
  );
}
