// Analysis feature — the ENGINE-EXTERNAL layer (Claude-owned). Error contract,
// request tracing, structured AI output contract, and the engine orchestration
// seam. Never imports or edits the frozen engine (src/features/interpretation/**).
export {
  APP_ERROR_CODES,
  USER_MESSAGE,
  appError,
  pgCodeOf,
  pgErrorToAppCode,
  toAppErrorCode,
  userMessage,
} from './errors';
export type { AppError, AppErrorCode } from './errors';

export { newRequestId } from './requestId';

export {
  DEFAULT_RATE_LIMIT,
  OUTPUT_GUARD,
  boundRecentByChars,
  checkRateLimit,
  emptyRateState,
  releaseInFlight,
} from './rateLimit';
export type { RateDecision, RateLimitConfig, UserRateState } from './rateLimit';

export { appErrorEvent, consoleErrorLogger, logDbError } from './logging';
export type { AppErrorEvent, AppErrorLogger, ErrorSeverity } from './logging';

export { parseStructuredAiResponse } from './aiOutput';
export type {
  EngineEvidence,
  EngineEvidenceAvailability,
  EngineEvidenceSection,
  EngineEvidenceTimingAnchors,
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

export { LIFE_DOMAINS, crossAnalyze, crossAnalyzeDomain } from './crossAnalysis';
export type {
  Agreement,
  DomainCross,
  EngineSignal,
  LifeDomain,
  Polarity,
} from './crossAnalysis';
export type {
  AnalysisQuestionContext,
  BuildContextInput,
  EngineEnvelope,
  EngineKind,
  NormalizedInterpretationContext,
} from './engineOrchestration';
