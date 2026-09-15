// Sprint J3 §11/§12 — push delivery classification + bounded retry. Transient retries to a bound; invalid token
// never retries (disables device); not_configured stays PENDING without burning attempts; permanent fails.
import { classifyPushOutcome, decideDelivery, DEFAULT_MAX_PUSH_ATTEMPTS } from '@/features/retention/push/pushDelivery';

describe('classifyPushOutcome', () => {
  it('maps provider results to outcomes', () => {
    expect(classifyPushOutcome({ ok: true, status: 'sent' })).toBe('ok');
    expect(classifyPushOutcome({ ok: false, status: 'invalid_token' })).toBe('invalid_token');
    expect(classifyPushOutcome({ ok: false, status: 'not_configured' })).toBe('not_configured');
    expect(classifyPushOutcome({ ok: false, status: 'error' })).toBe('retryable');
  });
});

describe('decideDelivery', () => {
  it('ok → SENT, no retry', () => {
    expect(decideDelivery('ok', 0)).toEqual({ status: 'SENT', retry: false, disableToken: false });
  });
  it('invalid_token → FAILED, no retry, disable the device', () => {
    expect(decideDelivery('invalid_token', 0)).toEqual({ status: 'FAILED', retry: false, disableToken: true });
  });
  it('not_configured → stays PENDING, no attempt burned', () => {
    expect(decideDelivery('not_configured', 2)).toEqual({ status: 'PENDING', retry: false, disableToken: false });
  });
  it('retryable retries until the bound, then FAILED (no infinite retry)', () => {
    expect(decideDelivery('retryable', 0)).toEqual({ status: 'PENDING', retry: true, disableToken: false });
    expect(decideDelivery('retryable', 1)).toEqual({ status: 'PENDING', retry: true, disableToken: false });
    // 3rd attempt (attemptCount=2 → attemptsNow=3 = max) → no more retry
    expect(decideDelivery('retryable', DEFAULT_MAX_PUSH_ATTEMPTS - 1)).toEqual({ status: 'FAILED', retry: false, disableToken: false });
  });
  it('permanent → FAILED', () => {
    expect(decideDelivery('permanent', 0)).toEqual({ status: 'FAILED', retry: false, disableToken: false });
  });
});
