// Sprint H §49/§54 — the client Duk surface exposes NO mutation verb; a client can never grant/spend/commit.
const from = jest.fn();
const invoke = jest.fn();
jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => ({ from, functions: { invoke } }) }));

import * as duk from '@/features/duk';
import { getSessionStatus, requestPurchaseVerification } from '@/features/duk/dukClientContract';

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
