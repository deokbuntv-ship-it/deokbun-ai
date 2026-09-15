// Sprint H §49/§54 — the client Duk surface exposes NO mutation verb; a client can never grant/spend/commit.
const from = jest.fn();
const invoke = jest.fn();
jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => ({ from, functions: { invoke } }) }));

import * as duk from '@/features/duk';
import { getSessionStatus, isSessionExhausted, requestPurchaseVerification, type SessionStatus } from '@/features/duk/dukClientContract';

describe('§49 client surface has no economic mutation verbs', () => {
  it('duk barrel exposes no spend/grant/commit/reserve/setDebt', () => {
    for (const forbidden of ['spendDuk', 'grantDuk', 'commitDuk', 'reserveDuk', 'setDebt', 'releaseDuk', 'commitSessionReservation']) {
      expect((duk as Record<string, unknown>)[forbidden]).toBeUndefined();
    }
  });
});

describe('§49 getSessionStatus — read only, safe empty on failure', () => {
  it('maps an active session; usable only within TTL + under the turn limit', async () => {
    from.mockReturnValue({ select: () => ({ eq: () => ({ in: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({
      data: { session_id: 's1', product_type: 'compatibility', successful_turn_count: 2, turn_limit: 5, expires_at: new Date(Date.now() + 3600e3).toISOString(), status: 'ACTIVE' },
    }) }) }) }) }) }) });
    const s = await getSessionStatus('compatibility');
    expect(s).toMatchObject({ active: true, sessionId: 's1', productType: 'compatibility', successfulTurnCount: 2, turnLimit: 5 });
  });
  it('a read failure → safe inactive status', async () => {
    from.mockImplementation(() => { throw new Error('down'); });
    expect(await getSessionStatus('general')).toMatchObject({ active: false, sessionId: null });
  });
});

describe('§34/§54 requestPurchaseVerification — opaque server call, never trusts a client success', () => {
  it('surfaces the server error code (NOT_CONFIGURED path → PURCHASE_VERIFICATION_FAILED)', async () => {
    invoke.mockResolvedValue({ data: { error: 'PURCHASE_VERIFICATION_FAILED' }, error: null });
    const r = await requestPurchaseVerification({ provider: 'APPLE', storeProductId: 'x', transactionToken: 't' });
    expect(r).toEqual({ ok: false, code: 'PURCHASE_VERIFICATION_FAILED' });
    // Only the opaque submission is sent — no price/duk/entitlement.
    expect(invoke).toHaveBeenCalledWith('verify-purchase', { body: { provider: 'APPLE', storeProductId: 'x', transactionToken: 't' } });
  });
});

describe('isSessionExhausted — TTL-bounded exhaustion (a stale exhausted session must not pin the paywall)', () => {
  const NOW = Date.UTC(2026, 7, 25, 6, 0, 0); // fixed for determinism (isSessionExhausted takes nowMs)
  const mk = (over: Partial<SessionStatus> = {}): SessionStatus => ({
    active: true, sessionId: 's1', productType: 'general', successfulTurnCount: 0, turnLimit: 5,
    expiresAt: new Date(NOW + 3600e3).toISOString(), ...over,
  });

  it('a brand-new / new paid session (0/5, within TTL) is NOT exhausted → 5 remaining', () => {
    expect(isSessionExhausted(mk({ successfulTurnCount: 0 }), NOW)).toBe(false);
  });
  it('mid-session (3/5, within TTL) is NOT exhausted', () => {
    expect(isSessionExhausted(mk({ successfulTurnCount: 3 }), NOW)).toBe(false);
  });
  it('after 5 successful turns, within TTL → exhausted', () => {
    expect(isSessionExhausted(mk({ successfulTurnCount: 5 }), NOW)).toBe(true);
  });
  it('an EXPIRED exhausted session is NOT exhausted (the bug: past-TTL must not pin the paywall forever)', () => {
    expect(isSessionExhausted(mk({ successfulTurnCount: 5, expiresAt: new Date(NOW - 1000).toISOString() }), NOW)).toBe(false);
  });
  it('a previous exhausted session must not contaminate a genuinely NEW session (fresh 0/5 → not exhausted)', () => {
    // old exhausted session was s1 (5/5); the new one is a different session with 0 turns.
    expect(isSessionExhausted(mk({ sessionId: 's2', successfulTurnCount: 0 }), NOW)).toBe(false);
  });
  it('no live session (null / no id / turnLimit 0) → not exhausted (greeting alone consumes nothing)', () => {
    expect(isSessionExhausted(null, NOW)).toBe(false);
    expect(isSessionExhausted(mk({ sessionId: null }), NOW)).toBe(false);
    expect(isSessionExhausted(mk({ turnLimit: 0, successfulTurnCount: 0 }), NOW)).toBe(false);
  });
});
