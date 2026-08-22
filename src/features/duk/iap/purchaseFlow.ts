// Purchase-flow ORCHESTRATOR (Owner Activation 05A). PURE + deterministic given its injected deps → fully
// testable with store doubles, no native module. HARD AUTHORITY: the client NEVER grants Duk; only the SERVER
// verification result (verify-purchase Edge, via `verify`) can grant. A native "success" is NOT entitlement.
import type { IapProvider, NativePurchase, NativeStoreAdapter } from './nativeStore';

// Mirror of dukClientContract.requestPurchaseVerification — injected so the flow is testable in isolation.
export type VerifyPurchaseFn = (req: {
  provider: IapProvider;
  storeProductId: string;
  transactionToken: string;
}) => Promise<{ ok: boolean; code?: string }>;

export type PurchaseFlowResult =
  | { status: 'GRANTED' }                    // server verified + granted (or idempotent already-granted)
  | { status: 'CANCELLED' }                  // user dismissed the sheet
  | { status: 'PENDING' }                    // deferred approval OR server said PURCHASE_PENDING — retry later
  | { status: 'NOT_AVAILABLE' }              // no native store (Expo Go / not configured / not a dev build)
  | { status: 'VERIFICATION_FAILED'; code?: string } // server rejected; transaction left unfinished for retry
  | { status: 'ERROR'; message: string };

/**
 * Buy one product: native purchase → forward the OPAQUE token to the server → the server verifies + grants.
 * The transaction is finished ONLY after a server grant, so a lost/failed verification can be safely retried
 * or restored (the server dedups by external transaction id → grants exactly once). Never grants client-side.
 */
export async function runPurchase(
  adapter: NativeStoreAdapter,
  verify: VerifyPurchaseFn,
  storeProductId: string,
): Promise<PurchaseFlowResult> {
  if (!adapter.isAvailable()) return { status: 'NOT_AVAILABLE' };
  let outcome;
  try {
    outcome = await adapter.purchase(storeProductId);
  } catch (e) {
    return { status: 'ERROR', message: String((e as { message?: string })?.message ?? e) };
  }
  if (outcome.kind === 'CANCELLED') return { status: 'CANCELLED' };
  if (outcome.kind === 'PENDING') return { status: 'PENDING' };
  if (outcome.kind === 'ERROR') return { status: 'ERROR', message: outcome.message };

  // SUCCESS → the server is the ONLY authority for a grant.
  const v = await verify({
    provider: outcome.purchase.provider,
    storeProductId: outcome.purchase.storeProductId,
    transactionToken: outcome.purchase.transactionToken,
  });
  if (v.ok) {
    // Finish only after an authoritative grant (idempotent replay also returns ok → safe to finish).
    try { await adapter.finishTransaction(outcome.purchase); } catch { /* best-effort; server already granted */ }
    return { status: 'GRANTED' };
  }
  if (v.code === 'PURCHASE_PENDING') return { status: 'PENDING' }; // do NOT finish; the store will settle later
  // Verification failed (invalid token / network / service down): DO NOT finish → the transaction stays in the
  // queue for a later retry/restore. Never grant client-side.
  return { status: 'VERIFICATION_FAILED', code: v.code };
}

export type RestoreResult = { total: number; granted: number; failures: number };

/**
 * Restore: re-submit each owned transaction to the server, which dedups (external-id unique) and enforces the
 * first-pack lifetime rule → restore can never double-grant. Finishes only the server-confirmed ones.
 */
export async function runRestore(adapter: NativeStoreAdapter, verify: VerifyPurchaseFn): Promise<RestoreResult> {
  if (!adapter.isAvailable()) return { total: 0, granted: 0, failures: 0 };
  let purchases: NativePurchase[] = [];
  try { purchases = await adapter.restore(); } catch { return { total: 0, granted: 0, failures: 0 }; }
  let granted = 0;
  let failures = 0;
  for (const p of purchases) {
    const v = await verify({ provider: p.provider, storeProductId: p.storeProductId, transactionToken: p.transactionToken });
    if (v.ok) { try { await adapter.finishTransaction(p); } catch { /* best-effort */ } granted += 1; }
    else failures += 1;
  }
  return { total: purchases.length, granted, failures };
}
