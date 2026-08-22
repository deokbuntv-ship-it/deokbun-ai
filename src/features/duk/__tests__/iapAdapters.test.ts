// Sprint I §42/§43/§53 — Apple + Google adapter contract tests (UNIT + SIMULATION; live crypto/API =
// BLOCKED_EXTERNAL). Synthetic JWS/RTDN payloads; the signature verifier is injected (a real Apple-signed
// payload is not available locally). The tests prove decode + field validation + state mapping + dedup, and the
// client-authority attack corpus (only provider/server state has authority).
import {
  decodeJws, verifySignedAppleTransaction, processAppleNotificationV2, appleToProviderVerification,
  resolvePurchaseState, shouldGrant, shouldAcknowledge, googleToProviderVerification, decodeRtdn,
  planRetry, planReserveReconciliation, planPurchaseReconciliation,
} from '@/features/duk/iap';

// Build a synthetic (unsigned) JWS: base64url(header).base64url(payload).sig
function b64url(obj: unknown): string {
  const json = JSON.stringify(obj);
  const b64 = typeof btoa === 'function'
    ? btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    : Buffer.from(json, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const jws = (payload: unknown, header: unknown = { alg: 'ES256' }) => `${b64url(header)}.${b64url(payload)}.sig`;
const VALID_SIG = async () => true;   // simulate a verified Apple signature
const APPLE = { bundleId: 'com.deokbuni.app', environment: 'Production' as const };
const TX = { transactionId: 't-1', bundleId: 'com.deokbuni.app', productId: 'com.deokbuni.duk.first20', environment: 'Production', type: 'Consumable' };

describe('§7-§10 Apple — decode + signature + field validation', () => {
  it('decodeJws splits + decodes header/payload (no signature trust)', () => {
    const d = decodeJws(jws(TX));
    expect(d?.payload).toMatchObject({ transactionId: 't-1', productId: 'com.deokbuni.duk.first20' });
    expect(decodeJws('not-a-jws')).toBeNull();
  });

  it('a valid signed transaction verifies and normalizes', async () => {
    const v = await verifySignedAppleTransaction(jws(TX), APPLE, VALID_SIG);
    expect(v.ok).toBe(true);
    if (v.ok) expect(appleToProviderVerification(v)).toEqual({ ok: true, externalTransactionId: 't-1', storeProductId: 'com.deokbuni.duk.first20', isSubscription: false });
  });

  it('a bad signature is rejected (default verifier is NOT_CONFIGURED → never trusts)', async () => {
    expect((await verifySignedAppleTransaction(jws(TX), APPLE)).ok).toBe(false); // default verifier = false
    expect(await verifySignedAppleTransaction(jws(TX), APPLE)).toMatchObject({ ok: false, reason: 'BAD_SIGNATURE' });
  });

  it('bundle / environment / missing-transaction mismatches fail closed', async () => {
    expect(await verifySignedAppleTransaction(jws({ ...TX, bundleId: 'com.evil' }), APPLE, VALID_SIG)).toMatchObject({ ok: false, reason: 'BUNDLE_MISMATCH' });
    expect(await verifySignedAppleTransaction(jws({ ...TX, environment: 'Sandbox' }), APPLE, VALID_SIG)).toMatchObject({ ok: false, reason: 'ENV_MISMATCH' });
    expect(await verifySignedAppleTransaction(jws({ ...TX, transactionId: undefined }), APPLE, VALID_SIG)).toMatchObject({ ok: false, reason: 'NO_TRANSACTION_ID' });
  });

  it('a revoked transaction verifies but is flagged revoked (caller reverses)', async () => {
    const v = await verifySignedAppleTransaction(jws({ ...TX, revocationDate: 123 }), APPLE, VALID_SIG);
    expect(v).toMatchObject({ ok: true, revoked: true });
  });
});

describe('§11 Apple Notifications V2 — verify + dedupe key', () => {
  it('decodes a signed notification, verifies the inner transaction, exposes a dedupe key', async () => {
    const payload = { notificationType: 'REFUND', notificationUUID: 'n-1', data: { signedTransactionInfo: jws({ ...TX, revocationDate: 9 }) } };
    const n = await processAppleNotificationV2(jws(payload), APPLE, VALID_SIG);
    expect(n).toMatchObject({ ok: true, notificationType: 'REFUND', dedupeKey: 'n-1' });
    expect(n.transaction?.transactionId).toBe('t-1');
  });
  it('an unverifiable notification is rejected', async () => {
    expect(await processAppleNotificationV2(jws({ notificationType: 'X' }), APPLE)).toMatchObject({ ok: false, reason: 'BAD_SIGNATURE' });
  });
});

describe('§14-§18 Google — state mapping, grant/ack decisions, RTDN change-signal', () => {
  it('maps purchase state (legacy int + v2 enum)', () => {
    expect(resolvePurchaseState({ purchaseState: 0 })).toBe('PURCHASED');
    expect(resolvePurchaseState({ purchaseState: 2 })).toBe('PENDING');
    expect(resolvePurchaseState({ purchaseState: 1 })).toBe('CANCELED');
    expect(resolvePurchaseState({ purchaseState: 'PURCHASE_STATE_PURCHASED' })).toBe('PURCHASED');
  });
  it('grants ONLY when PURCHASED; PENDING/CANCELED never grant', () => {
    expect(shouldGrant('PURCHASED')).toBe(true);
    expect(shouldGrant('PENDING')).toBe(false);
    expect(shouldGrant('CANCELED')).toBe(false);
  });
  it('acknowledges only a PURCHASED + not-yet-acknowledged purchase', () => {
    expect(shouldAcknowledge({ state: 'PURCHASED', acknowledged: false, productId: 'p', purchaseToken: 't' })).toBe(true);
    expect(shouldAcknowledge({ state: 'PURCHASED', acknowledged: true, productId: 'p', purchaseToken: 't' })).toBe(false);
    expect(shouldAcknowledge({ state: 'PENDING', acknowledged: false, productId: 'p', purchaseToken: 't' })).toBe(false);
  });
  it('toProviderVerification only for PURCHASED; uses orderId as external id', () => {
    expect(googleToProviderVerification({ state: 'PURCHASED', productId: 'p', purchaseToken: 'tok', orderId: 'ord-1' })).toEqual({ ok: true, externalTransactionId: 'ord-1', storeProductId: 'p', isSubscription: false });
    expect(googleToProviderVerification({ state: 'PENDING', productId: 'p', purchaseToken: 'tok' }).ok).toBe(false);
  });
  it('RTDN is a change signal → requiresAuthoritativeFetch; package mismatch fails closed', () => {
    const data = (o: unknown) => (typeof btoa === 'function' ? btoa(JSON.stringify(o)) : Buffer.from(JSON.stringify(o)).toString('base64'));
    const env = decodeRtdn(data({ packageName: 'com.deokbuni.app', oneTimeProductNotification: { sku: 'duk_base_50', purchaseToken: 'tok' } }), { packageName: 'com.deokbuni.app' });
    expect(env).toMatchObject({ ok: true, kind: 'ONE_TIME', purchaseToken: 'tok', requiresAuthoritativeFetch: true });
    expect(decodeRtdn(data({ packageName: 'com.evil' }), { packageName: 'com.deokbuni.app' })).toMatchObject({ ok: false, reason: 'PACKAGE_MISMATCH' });
  });
});

describe('§23/§25/§34/§35 purchase state machine + reconciliation', () => {
  it('§25 a retry of a GRANTED external id replays, never re-grants', () => {
    expect(planRetry('GRANTED')).toBe('REPLAY_GRANTED');
    expect(planRetry('GRANT_PENDING')).toBe('IN_FLIGHT');
    expect(planRetry(null)).toBe('PROCESS_NEW');
  });
  it('reserve reconciliation never releases COMMITTED; expires only stale RESERVED', () => {
    const now = 1000;
    const actions = planReserveReconciliation([
      { reservationId: 'a', status: 'COMMITTED', version: 1, expiresAtEpoch: 0 },
      { reservationId: 'b', status: 'RESERVED', version: 1, expiresAtEpoch: 500 }, // past ttl
      { reservationId: 'c', status: 'RESERVED', version: 1, expiresAtEpoch: 2000 }, // still valid
    ], now);
    expect(actions).toEqual([
      { reservationId: 'a', action: 'NONE', reason: 'terminal:COMMITTED' },
      { reservationId: 'b', action: 'EXPIRE', reason: 'stale-reserved-past-ttl' },
      { reservationId: 'c', action: 'NONE', reason: 'not-yet-expired' },
    ]);
  });
  it('purchase reconciliation proposes GRANT / REVOKE / INVESTIGATE from provider truth', () => {
    const actions = planPurchaseReconciliation([
      { externalTransactionId: '1', localStatus: 'VERIFIED', providerState: 'PURCHASED' },
      { externalTransactionId: '2', localStatus: 'GRANTED', providerState: 'REFUNDED' },
      { externalTransactionId: '3', localStatus: 'GRANTED', providerState: 'UNKNOWN' },
      { externalTransactionId: '4', localStatus: 'GRANTED', providerState: 'PURCHASED' },
    ]);
    expect(actions.map((a) => a.action)).toEqual(['GRANT', 'REVOKE', 'INVESTIGATE', 'NONE']);
  });
});

describe('§43 client-authority attack corpus — client claims carry NO authority', () => {
  it('a client-forged "success" JWS with a good product but NO real signature is rejected', async () => {
    // The attacker supplies a well-formed payload but cannot produce a valid signature → default verifier false.
    const forged = jws({ ...TX, productId: 'com.deokbuni.duk.large120' });
    expect((await verifySignedAppleTransaction(forged, APPLE)).ok).toBe(false);
  });
  it('the ProviderVerification never carries a client-supplied Duk amount (amount is server-catalog only)', async () => {
    const v = await verifySignedAppleTransaction(jws(TX), APPLE, VALID_SIG);
    if (v.ok) {
      const pv = appleToProviderVerification(v) as Record<string, unknown>;
      expect(pv.dukAmount).toBeUndefined();
      expect(pv.price).toBeUndefined();
      expect(pv.grantAmount).toBeUndefined();
    }
  });
});
