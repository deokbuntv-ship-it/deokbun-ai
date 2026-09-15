// Sprint J2 §10/§18 — the shared consumer error copy must (1) cover every code, (2) never leak a raw backend
// term to the user, and (3) degrade unknown codes to a safe, retryable message. This is the machine guard behind
// the NO_RAW_BACKEND_ERRORS verdict for mapped copy.
import {
  mapConsumerError, CONSUMER_ERROR_CODES, type ConsumerErrorCode,
} from '@/features/errors/consumerErrorCopy';

// Terms a consumer must never see. Case-insensitive; matched against the rendered message.
const FORBIDDEN = [
  'NOT_CONFIGURED', 'RPC', 'Edge Function', 'edge function', 'Supabase', 'supabase',
  'service role', 'service_role', 'LLM', 'adapter', 'PGRST', 'SQLSTATE', '23514', '23505',
  'undefined', 'null', 'Error:', 'stack', 'requestId', 'request_id',
];

// The 8 codes the J2 spec requires consumer copy for.
const REQUIRED: ConsumerErrorCode[] = [
  'AUTH_REQUIRED', 'PROFILE_REQUIRED', 'CONSENT_REQUIRED', 'INSUFFICIENT_DUK',
  'REQUEST_FAILED', 'NETWORK', 'SESSION_EXPIRED', 'NOT_CONFIGURED',
];

describe('consumer error copy', () => {
  it('covers all 8 required J2 codes', () => {
    for (const c of REQUIRED) expect(CONSUMER_ERROR_CODES).toContain(c);
  });

  it.each(CONSUMER_ERROR_CODES)('%s → non-empty consumer message with no raw backend term', (code) => {
    const v = mapConsumerError(code);
    expect(v.message.trim().length).toBeGreaterThan(0);
    for (const term of FORBIDDEN) {
      expect(v.message.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });

  it('retry is allowed ONLY for transient kinds', () => {
    for (const code of CONSUMER_ERROR_CODES) {
      const v = mapConsumerError(code);
      if (v.canRetry) expect(['recoverable', 'network', 'blocked']).toContain(v.kind);
    }
  });

  it('auth/insufficient/expired never offer a plain retry', () => {
    expect(mapConsumerError('AUTH_REQUIRED').canRetry).toBe(false);
    expect(mapConsumerError('INSUFFICIENT_DUK').canRetry).toBe(false);
    expect(mapConsumerError('SESSION_EXPIRED').canRetry).toBe(false);
  });

  it('unknown / one-off code degrades to a safe retryable REQUEST_FAILED', () => {
    const v = mapConsumerError('SOME_INTERNAL_THING_23514');
    expect(v.code).toBe('REQUEST_FAILED');
    expect(v.canRetry).toBe(true);
    expect(v.message).not.toContain('23514');
  });
});
