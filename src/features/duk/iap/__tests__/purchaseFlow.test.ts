// Activation 05A — purchase-flow orchestrator with STORE DOUBLES (no native module). Proves: server is the only
// grant authority; a native success without server verification never grants; failures/pending/cancel/restore are safe.
import { runPurchase, runRestore, type VerifyPurchaseFn } from '@/features/duk/iap/purchaseFlow';
import type { NativePurchase, NativeStoreAdapter, PurchaseOutcome } from '@/features/duk/iap/nativeStore';

const P = (over: Partial<NativePurchase> = {}): NativePurchase => ({ provider: 'APPLE', storeProductId: 'p.first20', transactionToken: 'tok-1', ...over });

function fakeAdapter(over: Partial<NativeStoreAdapter> & { purchaseOutcome?: PurchaseOutcome; restorePurchases?: NativePurchase[] } = {}): NativeStoreAdapter & { finished: NativePurchase[] } {
  const finished: NativePurchase[] = [];
  return {
    finished,
    isAvailable: over.isAvailable ?? (() => true),
    provider: over.provider ?? (() => 'APPLE'),
    fetchProducts: over.fetchProducts ?? (async () => []),
    purchase: over.purchase ?? (async () => over.purchaseOutcome ?? { kind: 'SUCCESS', purchase: P() }),
    restore: over.restore ?? (async () => over.restorePurchases ?? []),
    finishTransaction: over.finishTransaction ?? (async (p) => { finished.push(p); }),
  };
}
const verifyOk: VerifyPurchaseFn = async () => ({ ok: true });
const verifyFail = (code?: string): VerifyPurchaseFn => async () => ({ ok: false, code });

describe('runPurchase — server is the only grant authority', () => {
  it('SUCCESS + server ok → GRANTED and the transaction is finished', async () => {
    const a = fakeAdapter({ purchaseOutcome: { kind: 'SUCCESS', purchase: P() } });
    expect(await runPurchase(a, verifyOk, 'p.first20')).toEqual({ status: 'GRANTED' });
    expect(a.finished).toHaveLength(1);
  });

  it('SUCCESS but server verification FAILS → VERIFICATION_FAILED and NOT finished (retryable, no client grant)', async () => {
    const a = fakeAdapter({ purchaseOutcome: { kind: 'SUCCESS', purchase: P() } });
    const r = await runPurchase(a, verifyFail('PURCHASE_VERIFICATION_FAILED'), 'p.first20');
    expect(r).toEqual({ status: 'VERIFICATION_FAILED', code: 'PURCHASE_VERIFICATION_FAILED' });
    expect(a.finished).toHaveLength(0);
  });

  it('server NOT_CONFIGURED → VERIFICATION_FAILED, not finished', async () => {
    const a = fakeAdapter();
    const r = await runPurchase(a, verifyFail('NOT_CONFIGURED'), 'p.first20');
    expect(r.status).toBe('VERIFICATION_FAILED');
    expect(a.finished).toHaveLength(0);
  });

  it('server PURCHASE_PENDING → PENDING and NOT finished (store settles later)', async () => {
    const a = fakeAdapter();
    const r = await runPurchase(a, verifyFail('PURCHASE_PENDING'), 'p.first20');
    expect(r.status).toBe('PENDING');
    expect(a.finished).toHaveLength(0);
  });

  it('user CANCELLED → CANCELLED, no verification, no finish', async () => {
    const verify = jest.fn(verifyOk);
    const a = fakeAdapter({ purchaseOutcome: { kind: 'CANCELLED' } });
    expect((await runPurchase(a, verify, 'p.first20')).status).toBe('CANCELLED');
    expect(verify).not.toHaveBeenCalled();
    expect(a.finished).toHaveLength(0);
  });

  it('native PENDING (deferred/Ask-to-Buy) → PENDING, no verify', async () => {
    const verify = jest.fn(verifyOk);
    const a = fakeAdapter({ purchaseOutcome: { kind: 'PENDING' } });
    expect((await runPurchase(a, verify, 'p.first20')).status).toBe('PENDING');
    expect(verify).not.toHaveBeenCalled();
  });

  it('native ERROR / network failure → ERROR, not finished', async () => {
    const a = fakeAdapter({ purchase: async () => { throw new Error('network'); } });
    const r = await runPurchase(a, verifyOk, 'p.first20');
    expect(r.status).toBe('ERROR');
    expect(a.finished).toHaveLength(0);
  });

  it('store NOT available (Expo Go / not configured) → NOT_AVAILABLE, no purchase attempted', async () => {
    const purchase = jest.fn(async (): Promise<PurchaseOutcome> => ({ kind: 'SUCCESS', purchase: P() }));
    const a = fakeAdapter({ isAvailable: () => false, purchase });
    expect((await runPurchase(a, verifyOk, 'p.first20')).status).toBe('NOT_AVAILABLE');
    expect(purchase).not.toHaveBeenCalled();
  });

  it('duplicate transaction (server already processed → ok) → GRANTED, finished (server dedups)', async () => {
    const a = fakeAdapter();
    expect((await runPurchase(a, verifyOk, 'p.first20')).status).toBe('GRANTED');
  });

  it('response loss then restore: first verify fails (not finished) → restore re-submits → granted once', async () => {
    const a = fakeAdapter({ purchaseOutcome: { kind: 'SUCCESS', purchase: P({ transactionToken: 'tok-x' }) }, restorePurchases: [P({ transactionToken: 'tok-x' })] });
    const lost = await runPurchase(a, verifyFail('SERVICE_UNAVAILABLE'), 'p.first20');
    expect(lost.status).toBe('VERIFICATION_FAILED');
    expect(a.finished).toHaveLength(0);
    const restored = await runRestore(a, verifyOk); // server dedups → grants once
    expect(restored).toEqual({ total: 1, granted: 1, failures: 0 });
    expect(a.finished).toHaveLength(1);
  });
});

describe('runRestore', () => {
  it('re-submits each owned purchase; finishes only the server-confirmed ones', async () => {
    let n = 0;
    const verify: VerifyPurchaseFn = async () => (++n === 2 ? { ok: false, code: 'PURCHASE_VERIFICATION_FAILED' } : { ok: true });
    const a = fakeAdapter({ restorePurchases: [P({ transactionToken: 'a' }), P({ transactionToken: 'b' }), P({ transactionToken: 'c' })] });
    const r = await runRestore(a, verify);
    expect(r).toEqual({ total: 3, granted: 2, failures: 1 });
    expect(a.finished).toHaveLength(2);
  });

  it('NOT available → no-op', async () => {
    const a = fakeAdapter({ isAvailable: () => false });
    expect(await runRestore(a, verifyOk)).toEqual({ total: 0, granted: 0, failures: 0 });
  });
});

describe('client authority', () => {
  it('the flow module exposes NO grant/spend verb (grant is server-only)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@/features/duk/iap/purchaseFlow');
    for (const forbidden of ['grantDuk', 'grant', 'spend', 'addBalance', 'setBalance', 'credit']) {
      expect(mod[forbidden]).toBeUndefined();
    }
  });
});
