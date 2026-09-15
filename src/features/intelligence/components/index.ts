// Consultation Intelligence — CONSUMER components (Sprint 3A/3A-B). React-native UI that
// renders the fail-closed presentation ViewModels. Imported by PATH from screens (never
// via the pure `intelligence/index.ts` barrel, which must stay react-native-free for the
// node jest suites — §20).
export { AssessmentSummary, AssessmentTile } from './AssessmentSummary';
export { AssessmentDetailSheet } from './AssessmentDetailSheet';
export { ConfidenceIndicator } from './ConfidenceIndicator';
export { ConsultationLoading } from './ConsultationLoading';
export { ConsultationStateNotice } from './ConsultationStateNotice';
export type { ConsultationState } from './ConsultationStateNotice';
export { FollowUpSuggestions } from './FollowUpSuggestions';
export { InterpretationEvidenceSheet } from './InterpretationEvidenceSheet';
export { MemoryConfirmation } from './MemoryConfirmation';
export { UserFeedbackControl } from './UserFeedbackControl';
export {
  StructuredConsultationResult,
  type StructuredConsultationViewModel,
} from './StructuredConsultationResult';
export { toneColor, TONE_TO_BADGE } from './tone';
