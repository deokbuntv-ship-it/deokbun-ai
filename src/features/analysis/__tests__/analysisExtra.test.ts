// Extra non-UI coverage for the error contract + structured AI-output parser
// (directive §6/§13/§15). Complements analysis.test.ts.
import {
  parseStructuredAiResponse,
  pgErrorToAppCode,
  toAppErrorCode,
} from '../index';

describe('toAppErrorCode — full boundary mapping', () => {
  it('passes standard AppErrorCodes through unchanged', () => {
    expect(toAppErrorCode('AUTH_REQUIRED')).toBe('AUTH_REQUIRED');
    expect(toAppErrorCode('LLM_RATE_LIMIT')).toBe('LLM_RATE_LIMIT');
    expect(toAppErrorCode('DB_ERROR')).toBe('DB_ERROR');
  });

  it('maps chat/edge transport codes to standard codes', () => {
    expect(toAppErrorCode('REQUEST_FAILED')).toBe('LLM_FAILURE');
    expect(toAppErrorCode('OPENAI_FETCH_FAILED')).toBe('NETWORK_ERROR');
    expect(toAppErrorCode('EMPTY_RESPONSE')).toBe('LLM_FAILURE');
    expect(toAppErrorCode('PROVIDER_ERROR')).toBe('LLM_FAILURE');
    expect(toAppErrorCode('RATE_LIMITED')).toBe('LLM_RATE_LIMIT');
    expect(toAppErrorCode('TIMEOUT')).toBe('LLM_TIMEOUT');
    expect(toAppErrorCode('NOT_SUPPORTED')).toBe('FORBIDDEN');
  });

  it('collapses frozen-engine INVALID_* normalization codes to ENGINE_FAILURE', () => {
    expect(toAppErrorCode('INVALID_HEAVENLY_STEM')).toBe('ENGINE_FAILURE');
    expect(toAppErrorCode('INVALID_EARTHLY_BRANCH')).toBe('ENGINE_FAILURE');
  });

  it('defaults unknown / empty to UNKNOWN', () => {
    expect(toAppErrorCode('something_random')).toBe('UNKNOWN');
    expect(toAppErrorCode(null)).toBe('UNKNOWN');
    expect(toAppErrorCode(undefined)).toBe('UNKNOWN');
    expect(toAppErrorCode('')).toBe('UNKNOWN');
  });
});

describe('pgErrorToAppCode — SQLSTATE / PostgREST mapping', () => {
  it('maps common SQLSTATEs', () => {
    expect(pgErrorToAppCode({ code: '23505' })).toBe('DUPLICATE_REQUEST');
    expect(pgErrorToAppCode({ code: '42501' })).toBe('FORBIDDEN');
    expect(pgErrorToAppCode({ code: '23503' })).toBe('INVALID_INPUT');
  });

  it('maps PostgREST JWT failure to AUTH_REQUIRED', () => {
    expect(pgErrorToAppCode({ code: 'PGRST301' })).toBe('AUTH_REQUIRED');
  });

  it('maps class-08 connection errors and network-ish messages to NETWORK_ERROR', () => {
    expect(pgErrorToAppCode({ code: '08006' })).toBe('NETWORK_ERROR');
    expect(pgErrorToAppCode({ message: 'TypeError: Failed to fetch' })).toBe('NETWORK_ERROR');
    expect(pgErrorToAppCode({ message: 'network request timeout' })).toBe('NETWORK_ERROR');
  });

  it('defaults to DB_ERROR', () => {
    expect(pgErrorToAppCode({ code: 'ZZZZZ' })).toBe('DB_ERROR');
    expect(pgErrorToAppCode(null)).toBe('DB_ERROR');
    expect(pgErrorToAppCode({})).toBe('DB_ERROR');
  });
});

describe('parseStructuredAiResponse (§15 — structured output with safe fallback)', () => {
  it('returns null for plain Markdown/text (Markdown fallback path)', () => {
    expect(parseStructuredAiResponse('그냥 평범한 답변입니다.')).toBeNull();
    expect(parseStructuredAiResponse('## 제목\n본문')).toBeNull();
  });

  it('returns null for malformed JSON or missing required fields', () => {
    expect(parseStructuredAiResponse('{ not valid json')).toBeNull();
    expect(parseStructuredAiResponse('{"conclusion":"c"}')).toBeNull(); // no evidence
  });

  it('parses a valid fenced structured response, preserving engine availability', () => {
    const raw =
      '```json\n' +
      JSON.stringify({
        conclusion: 'c',
        overallAssessment: 'o',
        evidence: {
          myungri: { availability: 'available', summary: 's' },
          ziwei: { availability: 'engine_not_connected' },
          qimen: { availability: 'not_applicable' },
        },
        followUpQuestions: ['q1', 'q2'],
      }) +
      '\n```';
    const parsed = parseStructuredAiResponse(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.evidence.myungri.availability).toBe('available');
    expect(parsed?.evidence.ziwei.availability).toBe('engine_not_connected');
    expect(parsed?.followUpQuestions).toHaveLength(2);
  });
});
