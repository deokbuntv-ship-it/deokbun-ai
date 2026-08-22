// Server trust boundary — public surface. The Edge Function imports `buildServerConsultation` /
// `buildServerSummary`; the client imports the request/response types to shape its inputs-only request.
export { buildServerConsultation, evaluateConsultationSafetyStop } from './buildServerConsultation';
export { buildCompatibilityConsultation } from './buildCompatibilityConsultation';
export {
  buildServerSummary,
  sanitizeSummarySource,
  summaryContainsHardStop,
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
  parseUsageDetails,
  redactDiag,
  SAFE_DIAG_KEYS,
} from './edgeDiagnostics';
export type { OpenAiOutcome, SafeDiagKey } from './edgeDiagnostics';
export {
  resolveLlmBudgets,
  resolveConsultationProfile,
  DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS,
  DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS,
  MIN_MAX_OUTPUT_TOKENS,
  HARD_MAX_OUTPUT_TOKENS,
} from './llmBudget';
export type { ConsultationProfile, ReasoningEffort } from './llmBudget';
export { classifyQuestionComplexity } from './questionComplexity';
export type { QuestionComplexity } from './questionComplexity';
export {
  validateConsultationInputBounds,
  LLM_RATE_LIMITED_REQUEST_TYPES,
  MAX_QUESTION_CHARS,
  MAX_CONTEXT_ITEMS,
  MAX_CONTEXT_ITEM_CHARS,
  MAX_LABEL_CHARS,
  MAX_BIRTH_FIELD_CHARS,
  MAX_REQUEST_BODY_CHARS,
  MAX_REQUEST_BODY_BYTES,
} from './inputBounds';
export { buildConsultationDecisionMeta, isDecisionVersionMismatch, parseDecisionMeta } from './decisionMeta';
export { runCanonicalGeneration, runIdempotentPaidRequest } from './economicGuards';
export type {
  CanonicalGenerationResult,
  CanonicalLease,
  IdempotentPaidResult,
  PaidReservation,
  RequestLease,
} from './economicGuards';
export { TODAY_CANONICAL_VERSION } from '@/features/today/types';
export { MONTHLY_CANONICAL_VERSION } from '@/features/monthly/types';
export { fortuneDateStringFromEpoch } from '@/features/today/engine/fortuneDate';
export { currentTargetMonth, monthKey } from '@/features/monthly/engine/monthDate';
export type { InputBoundsVerdict } from './inputBounds';
export { consultationResponseFormat, CONSULTATION_JSON_SCHEMA } from './consultationSchema';
// 오늘의 운세 (Today Fortune V1) — the daily generator is part of the SAME server graph so the Edge bundle
// includes it (no new external dependency). The Edge dispatches a `today_fortune` request to buildTodayFortune.
export {
  buildTodayFortune,
  parseDailyFortune,
  dailyFortuneResponseFormat,
  DAILY_FORTUNE_JSON_SCHEMA,
  type TodayFortuneRequest,
  type TodayFortuneDeps,
  type TodayFortuneServerResult,
} from '@/features/today/server';
// 이번 달 운세 (Monthly Fortune V1) — the monthly generator is part of the SAME server graph so the Edge
// bundle includes it (no new external dependency). The Edge dispatches a `monthly_fortune` request to
// buildMonthlyFortune. It is a SEPARATE temporal product (NOT Today×30) — one LLM call for the month.
export {
  buildMonthlyFortune,
  parseMonthlyFortune,
  monthlyFortuneResponseFormat,
  MONTHLY_FORTUNE_JSON_SCHEMA,
  type MonthlyFortuneRequest,
  type MonthlyFortuneDeps,
  type MonthlyFortuneServerResult,
} from '@/features/monthly/server';
export type {
  CompatibilityResultMeta,
  ServerConsultationRequest,
  ServerConsultationResult,
  ServerConsultationDeps,
  ServerGroundingMeta,
  TrustedBirthResolution,
  UntrustedTurn,
} from './serverConsultationTypes';
