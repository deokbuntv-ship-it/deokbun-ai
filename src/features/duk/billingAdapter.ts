// IAP Billing Adapter interface (Sprint G §AC/§AB). Contract ONLY — no real store products, no live billing.
// The invariant: the CLIENT is untrusted. The client may hand the server an opaque purchase token / transaction
// reference; the SERVER verifies it with the store and grants Duk. Duk is NEVER granted from a client boolean
// like `purchaseSucceeded=true`. Grants/revocations are idempotent by external id (§AB): one purchase → one
// grant, one revocation → one reversal. Implementations (Apple/Google server verification) land with the IAP
// build; this defines the seam so nothing is wired to a client claim.

export type PurchaseToken = {
  platform: 'ios' | 'android';
  productKey: string;      // internal stable product key (see PRODUCT_CATALOG_SPEC), NOT a client price/amount
  transactionRef: string;  // opaque store transaction id / receipt token — UNTRUSTED until server-verified
};

export type VerifiedPurchase = {
  externalPurchaseId: string; // canonical store transaction id (server-derived) — the idempotency key
  productKey: string;
  dukAmount: number;          // resolved SERVER-side from the catalog, never from the client
  isSubscription: boolean;
};

export type VerifyResult =
  | { ok: true; purchase: VerifiedPurchase }
  | { ok: false; reason: 'INVALID' | 'ALREADY_PROCESSED' | 'PROVIDER_UNAVAILABLE' };

export type GrantResult =
  | { ok: true; granted: number; debtCleared: number; alreadyGranted: boolean }
  | { ok: false; reason: string };

export type RevokeResult =
  | { ok: true; reversed: number; debtCreated: number; alreadyReversed: boolean }
  | { ok: false; reason: string };

export type SubscriptionState = { isPlus: boolean; expiresAtEpoch: number | null; source: string | null };

/**
 * The server-side billing authority. Every method verifies with the STORE; none trusts a client success flag.
 * Grants/revocations dedupe on the external id (idempotent replay). Implemented by an Edge/server module against
 * Apple/Google server APIs — NOT the client. Defined here so the client + wallet code compile against a stable,
 * server-authoritative seam.
 */
export interface BillingAdapter {
  // Verify a client-supplied token with the store. UNTRUSTED input in, server-derived truth out.
  verifyPurchase(token: PurchaseToken): Promise<VerifyResult>;
  // Re-verify + re-grant any owned purchases (restore flow). Idempotent.
  restorePurchases(userId: string): Promise<VerifiedPurchase[]>;
  // Handle a store server-to-server notification (the authoritative purchase/refund signal). Idempotent.
  processServerNotification(rawNotification: unknown): Promise<{ handled: boolean }>;
  // Grant PAID_DUK for a verified purchase (idempotent by externalPurchaseId; applies debt first, §AA).
  grantPurchasedDuk(purchase: VerifiedPurchase, userId: string): Promise<GrantResult>;
  // Revoke on refund/chargeback (idempotent by externalRevocationId; creates duk_debt if Duk already spent).
  revokePurchasedDuk(externalRevocationId: string, userId: string, amount: number): Promise<RevokeResult>;
  // Resolve current subscription (PLUS) state from the store, server-side.
  resolveSubscription(userId: string): Promise<SubscriptionState>;
}

// A client boolean can NEVER stand in for verification. This guard documents + enforces the boundary at the
// seam: a would-be "trust the client" call is a type error, and this returns the safe refusal at runtime.
export function rejectClientAssertedPurchase(): VerifyResult {
  return { ok: false, reason: 'INVALID' };
}
