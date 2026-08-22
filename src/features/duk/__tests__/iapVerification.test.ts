// Sprint H §31/§34/§37/§38/§39/§54 — IAP server-authority: never trust client claims; idempotent by external
// id; first-pack lifetime; NOT_CONFIGURED without credentials. UNIT tests of the runtime-neutral orchestration.
import { verifyAndGrantPurchase, type PurchaseDeps, type PurchaseSubmission } from '@/features/duk/iap/purchaseVerification';
import { createAppleVerifier, createGoogleVerifier } from '@/features/duk/iap/adapters';
import { resolveInternalProduct } from '@/features/duk/iap/catalog';

const SUB: PurchaseSubmission = { provider: 'APPLE', storeProductId: 'com.deokbuni.duk.first20', transactionToken: 'opaque-token' };

function deps(over: Partial<PurchaseDeps> = {}): PurchaseDeps {
  return {
    verifyWithProvider: async () => ({ ok: true, externalTransactionId: 'tx-1', storeProductId: 'com.deokbuni.duk.first20', isSubscription: false }),
    resolveProductKey: async () => 'DUK_FIRST_20',
    alreadyProcessed: async () => false,
    firstPackAlreadyGranted: async () => false,
    recordAndGrant: async ({ entry }) => ({ granted: entry.dukAmount ?? 0 }),
    ...over,
  };
}

describe('§34 verifyAndGrantPurchase — server-authority', () => {
  it('grants the SERVER catalog amount (never a client amount)', async () => {
    const r = await verifyAndGrantPurchase('user-a', SUB, deps());
    expect(r).toEqual({ ok: true, internalKey: 'DUK_FIRST_20', grantedDuk: 20, alreadyProcessed: false });
    // 20 comes from the server catalog, not the submission (which carries no amount).
    expect(resolveInternalProduct('DUK_FIRST_20')?.dukAmount).toBe(20);
  });

  it('a failed provider verification never grants', async () => {
    const notConfigured = await verifyAndGrantPurchase('u', SUB, deps({ verifyWithProvider: async () => ({ ok: false, reason: 'NOT_CONFIGURED' }) }));
    expect(notConfigured).toEqual({ ok: false, code: 'NOT_CONFIGURED' });
    const invalid = await verifyAndGrantPurchase('u', SUB, deps({ verifyWithProvider: async () => ({ ok: false, reason: 'INVALID' }) }));
    expect(invalid).toEqual({ ok: false, code: 'INVALID' });
  });

  it('§38 duplicate external transaction id grants ONCE', async () => {
    const grant = jest.fn(async () => ({ granted: 20 }));
    const r = await verifyAndGrantPurchase('u', SUB, deps({ alreadyProcessed: async () => true, recordAndGrant: grant }));
    expect(r).toEqual({ ok: true, internalKey: 'DUK_FIRST_20', grantedDuk: 0, alreadyProcessed: true });
    expect(grant).not.toHaveBeenCalled();
  });

  it('§37 first-pack lifetime — a second DUK_FIRST_20 is refused', async () => {
    const r = await verifyAndGrantPurchase('u', SUB, deps({ firstPackAlreadyGranted: async () => true }));
    expect(r).toEqual({ ok: false, code: 'FIRST_PACK_LIMIT' });
  });

  it('an unmapped store product is refused (client store id does not authorize a grant)', async () => {
    const r = await verifyAndGrantPurchase('u', SUB, deps({ resolveProductKey: async () => null }));
    expect(r).toEqual({ ok: false, code: 'UNKNOWN_PRODUCT' });
  });
});

describe('§35/§36 provider adapters — NOT_CONFIGURED without credentials', () => {
  it('Apple/Google verifiers are NOT_CONFIGURED with empty config (never fake success)', async () => {
    expect((await createAppleVerifier({})(SUB)).ok).toBe(false);
    expect((await createAppleVerifier({})(SUB))).toEqual({ ok: false, reason: 'NOT_CONFIGURED' });
    expect((await createGoogleVerifier({})({ ...SUB, provider: 'GOOGLE' }))).toEqual({ ok: false, reason: 'NOT_CONFIGURED' });
  });
});
