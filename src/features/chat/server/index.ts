// Server trust boundary — public surface. The Edge Function imports `buildServerConsultation`; the
// client imports the request/response types to shape its inputs-only request.
export { buildServerConsultation } from './buildServerConsultation';
export type {
  ServerConsultationRequest,
  ServerConsultationResult,
  ServerConsultationDeps,
  ServerGroundingMeta,
  TrustedBirthResolution,
  UntrustedTurn,
} from './serverConsultationTypes';
