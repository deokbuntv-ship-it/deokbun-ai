// Google Play server billing adapter (Sprint I §14-§19). CURRENT architecture — Play Developer API
// (products / subscriptions v2) + Real-Time Developer Notifications (RTDN). An RTDN is only a CHANGE SIGNAL: the
// server MUST query the Developer API for the authoritative purchase state; it never grants/revokes from RTDN
// contents. Duk is never granted from a client claim. The Developer-API call is INJECTED (service-account auth
// = owner secret) → live calls are BLOCKED_EXTERNAL until configured. The decode + state-mapping + grant/ack
// decision logic below is pure + unit-testable.
import type { ProviderVerification } from './purchaseVerification';
import { base64ToJson } from './apple';

export type GoogleConfig = { packageName?: string; serviceAccountJson?: string; pubsubAudience?: string };

// Normalized authoritative purchase state (mapped from the Developer API response).
export type GooglePurchaseState = 'PURCHASED' | 'PENDING' | 'CANCELED' | 'UNKNOWN';

// The authoritative purchase, as returned by an injected Developer-API client.
export type GoogleAuthoritativePurchase = {
  state: GooglePurchaseState;
  productId: string;
  purchaseToken: string;
  orderId?: string;        // the external transaction id for dedup
  acknowledged?: boolean;
  isSubscription?: boolean;
};

/** Map a raw Developer-API purchaseState/consumptionState into the normalized state (pure). productsv2/legacy. */
export function resolvePurchaseState(raw: { purchaseState?: number | string | null }): GooglePurchaseState {
  const s = raw.purchaseState;
  // Legacy one-time: 0=Purchased, 1=Canceled, 2=Pending. v2 uses string enums; normalize both.
  if (s === 0 || s === 'PURCHASED' || s === 'PURCHASE_STATE_PURCHASED') return 'PURCHASED';
  if (s === 2 || s === 'PENDING' || s === 'PURCHASE_STATE_PENDING') return 'PENDING';
  if (s === 1 || s === 'CANCELED' || s === 'CANCELLED' || s === 'PURCHASE_STATE_CANCELED') return 'CANCELED';
  return 'UNKNOWN';
}

/** Grant only when authoritative state is PURCHASED (§16). PENDING/CANCELED/UNKNOWN → no grant. */
export function shouldGrant(state: GooglePurchaseState): boolean {
  return state === 'PURCHASED';
}

/** Acknowledge only when PURCHASED and not yet acknowledged (§17). Never acknowledge a pending purchase. */
export function shouldAcknowledge(p: GoogleAuthoritativePurchase): boolean {
  return p.state === 'PURCHASED' && p.acknowledged !== true;
}

/** Map an authoritative PURCHASED purchase into the provider-neutral verification (server catalog resolves Duk). */
export function toProviderVerification(p: GoogleAuthoritativePurchase): ProviderVerification {
  if (p.state !== 'PURCHASED') return { ok: false, reason: 'INVALID' };
  const externalTransactionId = p.orderId ?? p.purchaseToken;
  if (!externalTransactionId) return { ok: false, reason: 'INVALID' };
  return { ok: true, externalTransactionId, storeProductId: p.productId, isSubscription: p.isSubscription === true };
}

// ── RTDN (§18) ───────────────────────────────────────────────────────────────────────────────────────────────
export type RtdnEnvelope = {
  ok: boolean;
  packageName?: string;
  purchaseToken?: string;
  productId?: string;
  kind?: 'ONE_TIME' | 'SUBSCRIPTION' | 'VOIDED' | 'TEST' | 'UNKNOWN';
  requiresAuthoritativeFetch: boolean; // ALWAYS true for a real notification — the RTDN is a change signal only
  reason?: 'MALFORMED' | 'PACKAGE_MISMATCH';
};

/** Decode a Pub/Sub RTDN message envelope (pure). The `data` is base64 JSON. Never authoritative on its own. */
export function decodeRtdn(pubsubData: string, config: GoogleConfig): RtdnEnvelope {
  const json = base64ToJson(pubsubData);
  if (!json || typeof json !== 'object') return { ok: false, requiresAuthoritativeFetch: false, reason: 'MALFORMED' };
  const packageName = typeof json.packageName === 'string' ? json.packageName : undefined;
  if (config.packageName && packageName && packageName !== config.packageName) {
    return { ok: false, requiresAuthoritativeFetch: false, reason: 'PACKAGE_MISMATCH' };
  }
  const oneTime = json.oneTimeProductNotification as Record<string, unknown> | undefined;
  const sub = json.subscriptionNotification as Record<string, unknown> | undefined;
  const voided = json.voidedPurchaseNotification as Record<string, unknown> | undefined;
  const test = json.testNotification as Record<string, unknown> | undefined;
  const n = oneTime ?? sub ?? voided;
  return {
    ok: true,
    packageName,
    purchaseToken: n && typeof n.purchaseToken === 'string' ? n.purchaseToken : undefined,
    productId: (oneTime && typeof oneTime.sku === 'string' ? oneTime.sku : undefined)
      ?? (sub && typeof sub.subscriptionId === 'string' ? sub.subscriptionId : undefined),
    kind: oneTime ? 'ONE_TIME' : sub ? 'SUBSCRIPTION' : voided ? 'VOIDED' : test ? 'TEST' : 'UNKNOWN',
    requiresAuthoritativeFetch: Boolean(n), // a test notification needs no fetch; a real one always does
  };
}
