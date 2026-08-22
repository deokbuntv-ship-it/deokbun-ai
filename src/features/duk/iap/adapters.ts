// Provider verifier FOUNDATION (Sprint H §35/§36). Apple + Google server-side verification interfaces. Without
// credentials/config they return NOT_CONFIGURED (never a fake success in production — §34). Real verification
// (App Store Server API / Google Play Developer API) is BLOCKED_EXTERNAL until the owner provides config; the
// interface + config-name documentation land now so the seam is stable. No private keys invented.
import type { PurchaseSubmission, ProviderVerification } from './purchaseVerification';
import type { AppleConfig } from './apple';
import type { GoogleConfig } from './google';

// Required server config (names only; values are owner-provided secrets, never in code):
//   APPLE:  APPLE_IAP_ISSUER_ID, APPLE_IAP_KEY_ID, APPLE_IAP_PRIVATE_KEY (P8), APPLE_BUNDLE_ID, APPLE_ENVIRONMENT
//   GOOGLE: GOOGLE_PLAY_PACKAGE_NAME, GOOGLE_PLAY_SERVICE_ACCOUNT (json)
export type Verifier = (s: PurchaseSubmission) => Promise<ProviderVerification>;

function appleConfigured(c: AppleConfig): boolean {
  return Boolean(c.issuerId && c.keyId && c.privateKey && c.bundleId);
}
function googleConfigured(c: GoogleConfig): boolean {
  return Boolean(c.packageName && c.serviceAccountJson);
}

/**
 * Apple verifier. Returns NOT_CONFIGURED until credentials are supplied. When configured, an implementation
 * validates the signed transaction with Apple's server API and returns the AUTHORITATIVE externalTransactionId +
 * productId (never the client's). Not implemented against live Apple here (BLOCKED_EXTERNAL).
 */
export function createAppleVerifier(config: AppleConfig): Verifier {
  return async (_s: PurchaseSubmission): Promise<ProviderVerification> => {
    if (!appleConfigured(config)) return { ok: false, reason: 'NOT_CONFIGURED' };
    // TODO(owner): call App Store Server API with the signed JWS transaction; derive externalTransactionId +
    // originalTransactionId + productId server-side. Until then, fail closed rather than fake a success.
    return { ok: false, reason: 'PROVIDER_UNAVAILABLE' };
  };
}

/**
 * Google Play verifier. Same contract: NOT_CONFIGURED without config; when configured, validate the purchase
 * token via the Play Developer API and return the authoritative order id + productId. Not live here.
 */
export function createGoogleVerifier(config: GoogleConfig): Verifier {
  return async (_s: PurchaseSubmission): Promise<ProviderVerification> => {
    if (!googleConfigured(config)) return { ok: false, reason: 'NOT_CONFIGURED' };
    return { ok: false, reason: 'PROVIDER_UNAVAILABLE' };
  };
}

/** Route a submission to the provider verifier. Client cannot bypass verification. */
export function verifierFor(provider: 'APPLE' | 'GOOGLE', apple: AppleConfig, google: GoogleConfig): Verifier {
  return provider === 'APPLE' ? createAppleVerifier(apple) : createGoogleVerifier(google);
}
