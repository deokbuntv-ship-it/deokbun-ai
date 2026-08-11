// Analysis feature — the ENGINE-EXTERNAL layer (Claude-owned). Error contract,
// request tracing, structured AI output contract, and the engine orchestration
// seam. Never imports or edits the frozen engine (src/features/interpretation/**).
export {
  APP_ERROR_CODES,
  USER_MESSAGE,
  appError,
  toAppErrorCode,
  userMessage,
} from './errors';
export type { AppError, AppErrorCode } from './errors';

export { newRequestId } from './requestId';

export { parseStructuredAiResponse } from './aiOutput';
export type {
  EngineEvidence,
  EngineEvidenceAvailability,
  StructuredAiResponse,
} from './aiOutput';

export {
  ENGINE_CONNECTED,
  ENGINE_KINDS,
  FROZEN_ENGINE_ID,
  buildInterpretationContext,
  resolveEngineAvailability,
  resolveEngineEligibility,
} from './engineOrchestration';
export type {
  AnalysisQuestionContext,
  BuildContextInput,
  EngineEnvelope,
  EngineKind,
  NormalizedInterpretationContext,
} from './engineOrchestration';
