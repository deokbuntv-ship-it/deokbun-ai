// Server trust boundary — public surface. The Edge Function imports `buildServerConsultation` /
// `buildServerSummary`; the client imports the request/response types to shape its inputs-only request.
export { buildServerConsultation } from './buildServerConsultation';
export {
  buildServerSummary,
  sanitizeSummarySource,
  MAX_SUMMARY_TURNS,
  MAX_SUMMARY_TURN_CHARS,
  MAX_EXISTING_SUMMARY_CHARS,
  MAX_SUMMARY_SOURCE_CHARS,
} from './buildServerSummary';
export type {
  ServerSummaryRequest,
  ServerSummaryResult,
  ServerSummaryDeps,
  ServerSummaryTurn,
} from './buildServerSummary';
export {
  extractResponsesText,
  openAiFailureCode,
  redactDiag,
  SAFE_DIAG_KEYS,
} from './edgeDiagnostics';
export type { OpenAiOutcome, SafeDiagKey } from './edgeDiagnostics';
export {
  resolveLlmBudgets,
  DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS,
  DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS,
  MIN_MAX_OUTPUT_TOKENS,
  HARD_MAX_OUTPUT_TOKENS,
} from './llmBudget';
export type {
  ServerConsultationRequest,
  ServerConsultationResult,
  ServerConsultationDeps,
  ServerGroundingMeta,
  TrustedBirthResolution,
  UntrustedTurn,
} from './serverConsultationTypes';
