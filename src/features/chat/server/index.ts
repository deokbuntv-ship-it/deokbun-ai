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
export type {
  ServerConsultationRequest,
  ServerConsultationResult,
  ServerConsultationDeps,
  ServerGroundingMeta,
  TrustedBirthResolution,
  UntrustedTurn,
} from './serverConsultationTypes';
