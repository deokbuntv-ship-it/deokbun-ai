// Apple server billing adapter (Sprint I §7-§13). CURRENT architecture only — App Store Server API + signed
// JWS transactions + App Store Server Notifications V2. NO legacy verifyReceipt. The client sends an opaque
// signed transaction; the SERVER verifies the JWS signature + validates the authoritative fields. Duk is never
// granted from a client claim.
//
// This module is the runtime-neutral DECODE + VALIDATE core (pure, unit-testable with synthetic payloads). The
// cryptographic JWS signature verification (x5c cert chain → Apple root) is an INJECTED step: production wires a
// real verifier (Deno SubtleCrypto / Apple's server library); it is NOT_CONFIGURED without the cert chain, so
// live verification is BLOCKED_EXTERNAL until the owner supplies config. No private key in the repo.
import type { ProviderVerification } from './purchaseVerification';

export type AppleEnvironment = 'Sandbox' | 'Production';
export type AppleConfig = {
  bundleId?: string;
  environment?: AppleEnvironment; // the server's expected environment
  issuerId?: string; keyId?: string; privateKey?: string; // App Store Server API auth (owner secrets)
};

// The decoded (NOT yet signature-verified) JWS payload, restricted to the fields we authorize on.
export type AppleTransactionPayload = {
  transactionId?: string;
  originalTransactionId?: string;
  bundleId?: string;
  productId?: string;
  environment?: string;        // 'Sandbox' | 'Production'
  type?: string;               // 'Consumable' | 'Auto-Renewable Subscription' | ...
  revocationDate?: number;     // present → revoked/refunded
  revocationReason?: number;
  purchaseDate?: number;
  quantity?: number;
};

/** base64(url) → utf8 JSON, cross-runtime (Deno / RN / Node18: atob + TextDecoder). Returns null on malformed. */
export function base64ToJson(seg: string): Record<string, unknown> | null {
  try {
    const b64 = seg.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const bin = atob(b64 + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    const v = JSON.parse(new TextDecoder('utf-8').decode(bytes));
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

/** Split + decode a JWS into { header, payload } WITHOUT verifying the signature (pure). */
export function decodeJws(jws: string): { header: Record<string, unknown>; payload: Record<string, unknown> } | null {
  if (typeof jws !== 'string') return null;
  const parts = jws.split('.');
  if (parts.length !== 3) return null;
  const header = base64ToJson(parts[0]);
  const payload = base64ToJson(parts[1]);
  return header && payload ? { header, payload } : null;
}

/** A crypto verifier: proves the JWS was signed by Apple (x5c → Apple root). Injected; async. */
export type JwsSignatureVerifier = (jws: string) => Promise<boolean>;
export const NOT_CONFIGURED_VERIFIER: JwsSignatureVerifier = async () => false; // no cert chain → never trust

export type AppleValidation =
  | { ok: true; environment: AppleEnvironment; payload: AppleTransactionPayload; revoked: boolean }
  | { ok: false; reason: 'MALFORMED' | 'BAD_SIGNATURE' | 'BUNDLE_MISMATCH' | 'ENV_MISMATCH' | 'NO_TRANSACTION_ID' };

/**
 * Verify + validate a signed transaction. Order: decode → signature-verify (injected) → field validation
 * (bundle, environment, transaction identity). PURE except the injected verifier. A revoked transaction is
 * returned ok:true with revoked:true (the caller reverses); an env/bundle mismatch fails closed.
 */
export async function verifySignedAppleTransaction(
  jws: string, config: AppleConfig, verifySignature: JwsSignatureVerifier = NOT_CONFIGURED_VERIFIER,
): Promise<AppleValidation> {
  const decoded = decodeJws(jws);
  if (!decoded) return { ok: false, reason: 'MALFORMED' };
  if (!(await verifySignature(jws))) return { ok: false, reason: 'BAD_SIGNATURE' };
  const p = decoded.payload as AppleTransactionPayload;
  if (config.bundleId && p.bundleId && p.bundleId !== config.bundleId) return { ok: false, reason: 'BUNDLE_MISMATCH' };
  if (config.environment && p.environment && p.environment !== config.environment) return { ok: false, reason: 'ENV_MISMATCH' };
  if (!p.transactionId) return { ok: false, reason: 'NO_TRANSACTION_ID' };
  return {
    ok: true,
    environment: (p.environment as AppleEnvironment) ?? config.environment ?? 'Production',
    payload: p,
    revoked: typeof p.revocationDate === 'number' && p.revocationDate > 0,
  };
}

/** Map an Apple-validated transaction into the provider-neutral ProviderVerification (server catalog resolves Duk). */
export function toProviderVerification(v: AppleValidation): ProviderVerification {
  if (!v.ok) return { ok: false, reason: v.reason === 'BAD_SIGNATURE' || v.reason === 'MALFORMED' ? 'INVALID' : 'INVALID' };
  return {
    ok: true,
    externalTransactionId: String(v.payload.transactionId),
    storeProductId: String(v.payload.productId ?? ''),
    isSubscription: (v.payload.type ?? '').includes('Subscription'),
  };
}

// ── App Store Server Notifications V2 (§11) ─────────────────────────────────────────────────────────────────
export type AppleNotification = {
  ok: boolean;
  notificationType?: string;      // 'REFUND' | 'DID_RENEW' | 'CONSUMPTION_REQUEST' | ...
  transaction?: AppleTransactionPayload;
  dedupeKey?: string;             // notificationUUID or transactionId — the idempotency key
  reason?: 'MALFORMED' | 'BAD_SIGNATURE';
};

/**
 * Decode + verify an App Store Server Notification V2 signedPayload (§11). The payload is UNTRUSTED until the
 * outer JWS AND the inner signedTransactionInfo verify. Returns the notification type + transaction + a dedupe
 * key so a repeated notification applies ONE accounting effect.
 */
export async function processAppleNotificationV2(
  signedPayload: string, config: AppleConfig, verifySignature: JwsSignatureVerifier = NOT_CONFIGURED_VERIFIER,
): Promise<AppleNotification> {
  const outer = decodeJws(signedPayload);
  if (!outer) return { ok: false, reason: 'MALFORMED' };
  if (!(await verifySignature(signedPayload))) return { ok: false, reason: 'BAD_SIGNATURE' };
  const data = (outer.payload.data ?? {}) as Record<string, unknown>;
  const notificationType = typeof outer.payload.notificationType === 'string' ? outer.payload.notificationType : undefined;
  const notificationUUID = typeof outer.payload.notificationUUID === 'string' ? outer.payload.notificationUUID : undefined;
  const signedTx = typeof data.signedTransactionInfo === 'string' ? data.signedTransactionInfo : null;
  let transaction: AppleTransactionPayload | undefined;
  if (signedTx) {
    const inner = await verifySignedAppleTransaction(signedTx, config, verifySignature);
    if (inner.ok) transaction = inner.payload;
  }
  return {
    ok: true,
    notificationType,
    transaction,
    dedupeKey: notificationUUID ?? transaction?.transactionId,
  };
}
