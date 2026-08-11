// Standard app-level Error Contract (constitution §privacy; directive §4/§37).
//
// A single source of truth for the ERROR CODES surfaced at the app/service
// boundary — so the UI shows a friendly Korean message while admin/logs keep the
// technical code + requestId. This does NOT replace the domain-internal codes
// (the frozen engine's INVALID_* normalization codes, the chat edge's transport
// codes); those are mapped INTO these standard codes at the boundary via
// `toAppErrorCode`. Nothing here imports or edits the frozen engine.
export const APP_ERROR_CODES = [
  'AUTH_REQUIRED',
  'FORBIDDEN',
  'INVALID_INPUT',
  'INVALID_SUBJECT',
  'SUBJECT_NOT_FOUND',
  'BIRTH_INFO_REQUIRED',
  'BIRTH_TIME_UNKNOWN',
  'ENGINE_UNAVAILABLE',
  'ENGINE_FAILURE',
  'LLM_TIMEOUT',
  'LLM_RATE_LIMIT',
  'LLM_FAILURE',
  'DB_ERROR',
  'NETWORK_ERROR',
  'DUPLICATE_REQUEST',
  'FORTUNE_GENERATION_FAILED',
  'UNKNOWN',
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export type AppError = {
  code: AppErrorCode;
  // Correlation id to trace one request UI→gateway→engine→LLM→DB. Never PII.
  requestId?: string;
  // Technical detail for admin/logs only — never rendered to end users.
  cause?: unknown;
};

// Friendly, non-technical Korean messages for end users. Never a raw error/stack.
export const USER_MESSAGE: Record<AppErrorCode, string> = {
  AUTH_REQUIRED: '로그인이 필요합니다. 로그인 후 다시 시도해 주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  INVALID_INPUT: '입력을 다시 확인해 주세요.',
  INVALID_SUBJECT: '분석 대상자 정보가 올바르지 않습니다.',
  SUBJECT_NOT_FOUND: '분석 대상자를 찾을 수 없습니다.',
  BIRTH_INFO_REQUIRED: '상담을 위해 출생정보가 필요합니다.',
  BIRTH_TIME_UNKNOWN: '출생 시간을 모르는 경우 일부 분석은 제공되지 않을 수 있어요.',
  ENGINE_UNAVAILABLE: '해당 분석은 현재 제공할 수 없습니다.',
  ENGINE_FAILURE: '분석 계산 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  LLM_TIMEOUT: '응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',
  LLM_RATE_LIMIT: '요청이 많아 잠시 후 다시 시도해 주세요.',
  LLM_FAILURE: 'AI 응답 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  DB_ERROR: '데이터를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해 주세요.',
  DUPLICATE_REQUEST: '이미 처리 중인 요청입니다.',
  FORTUNE_GENERATION_FAILED: '운세 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

// Raw domain/transport codes (chat service, chat edge, frozen engine
// normalization) → standard AppErrorCode. Unmapped engine INVALID_* collapse to
// ENGINE_FAILURE; unknown strings → UNKNOWN.
const RAW_MAP: Record<string, AppErrorCode> = {
  // chat service / gateway
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUEST_FAILED: 'LLM_FAILURE',
  // chat edge (OpenAI transport)
  OPENAI_FETCH_FAILED: 'NETWORK_ERROR',
  EMPTY_RESPONSE: 'LLM_FAILURE',
  PROVIDER_ERROR: 'LLM_FAILURE',
  RATE_LIMITED: 'LLM_RATE_LIMIT',
  TIMEOUT: 'LLM_TIMEOUT',
  // auth provider
  NOT_SUPPORTED: 'FORBIDDEN',
};

export function toAppErrorCode(raw: string | null | undefined): AppErrorCode {
  if (!raw) return 'UNKNOWN';
  if ((APP_ERROR_CODES as readonly string[]).includes(raw)) {
    return raw as AppErrorCode;
  }
  if (raw in RAW_MAP) return RAW_MAP[raw];
  // Frozen-engine normalization codes are INVALID_* → treat as engine failure.
  if (raw.startsWith('INVALID_')) return 'ENGINE_FAILURE';
  return 'UNKNOWN';
}

export function appError(
  code: AppErrorCode,
  opts?: { requestId?: string; cause?: unknown },
): AppError {
  return { code, requestId: opts?.requestId, cause: opts?.cause };
}

// UI helper: always safe to show, never technical.
export function userMessage(code: AppErrorCode): string {
  return USER_MESSAGE[code];
}
