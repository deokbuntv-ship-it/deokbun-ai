// Purchase verification ORCHESTRATION (Sprint H §31/§34/§37/§38/§39). Server-authority: the client hands ONLY
// an opaque provider token; the server verifies with the store, resolves the SERVER catalog, dedupes by the
// external transaction id, enforces the first-pack lifetime limit, and grants Duk. Never trusts a client
// price/amount/entitlement/success flag. Runtime-neutral (injected verifier + store); the Deno Edge injects the
// real provider verifier (NOT_CONFIGURED without credentials) + the service-role DB ops.
import { resolveInternalProduct, type CatalogEntry } from './catalog';

export type Provider = 'APPLE' | 'GOOGLE';

// The opaque, UNTRUSTED client input. No price / Duk / entitlement flags — only what the store issued.
export type PurchaseSubmission = {
  provider: Provider;
  storeProductId: string; // resolved to an internal key via the SERVER product mapping (never trusted directly)
  transactionToken: string; // opaque receipt / purchase token — verified server-side
};

// The server-verified truth from the provider (the ONLY source of externalTransactionId + productId).
export type ProviderVerification =
  | { ok: true; externalTransactionId: string; storeProductId: string; isSubscription: boolean }
  | { ok: false; reason: 'INVALID' | 'PROVIDER_UNAVAILABLE' | 'NOT_CONFIGURED' };

// Injected server dependencies (the Edge provides real DB ops; tests provide mocks).
export type PurchaseDeps = {
  verifyWithProvider: (s: PurchaseSubmission) => Promise<ProviderVerification>;
  resolveProductKey: (provider: Provider, storeProductId: string) => Promise<string | null>; // server product map
  alreadyProcessed: (externalTransactionId: string) => Promise<boolean>; // external-id uniqueness (§38)
  firstPackAlreadyGranted: (userId: string) => Promise<boolean>; // §37 lifetime-once
  recordAndGrant: (input: { userId: string; externalTransactionId: string; entry: CatalogEntry }) => Promise<{ granted: number }>;
};

export type PurchaseResult =
  | { ok: true; internalKey: string; grantedDuk: number; alreadyProcessed: boolean }
  | { ok: false; code: 'PROVIDER_UNAVAILABLE' | 'NOT_CONFIGURED' | 'INVALID' | 'UNKNOWN_PRODUCT' | 'FIRST_PACK_LIMIT' };

/**
 * Verify + grant. Order: provider-verify → resolve server catalog → external-id dedup → first-pack limit →
 * record+grant (atomic in the DB). A replay of the same externalTransactionId grants ONCE (§38).
 */
export async function verifyAndGrantPurchase(userId: string, submission: PurchaseSubmission, deps: PurchaseDeps): Promise<PurchaseResult> {
  const verification = await deps.verifyWithProvider(submission);
  if (!verification.ok) return { ok: false, code: verification.reason };

  const key = await deps.resolveProductKey(submission.provider, verification.storeProductId);
  const entry = key ? resolveInternalProduct(key) : null;
  if (!entry) return { ok: false, code: 'UNKNOWN_PRODUCT' };

  // Idempotent by external transaction id: a duplicate receipt grants once.
  if (await deps.alreadyProcessed(verification.externalTransactionId)) {
    return { ok: true, internalKey: entry.key, grantedDuk: 0, alreadyProcessed: true };
  }

  // §37 first-pack lifetime limit — server-enforced; restore/replay never grants a second 20 Duk.
  if (entry.lifetimeOnce && (await deps.firstPackAlreadyGranted(userId))) {
    return { ok: false, code: 'FIRST_PACK_LIMIT' };
  }

  const { granted } = await deps.recordAndGrant({ userId, externalTransactionId: verification.externalTransactionId, entry });
  return { ok: true, internalKey: entry.key, grantedDuk: granted, alreadyProcessed: false };
}
