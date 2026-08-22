// Internal product catalog (Sprint H §32/§33). SERVER-owned amounts — the client never sends price/Duk. A
// store product id is resolved to an internal key + grant on the SERVER; a client store id does not itself
// authorize a grant (§33). Store product ids are NOT finalized here (placeholders); the owner sets them in the
// server product-mapping table (migration 20260834). Prices are V1 hypotheses (unchanged this sprint).
export type InternalProductKey = 'DUK_FIRST_20' | 'DUK_BASE_50' | 'DUK_LARGE_120' | 'PLUS_MONTHLY';

export type CatalogEntry = {
  key: InternalProductKey;
  grantType: 'DUK' | 'SUBSCRIPTION';
  dukAmount: number | null; // Duk granted (consumables); null for subscription (grant TBD)
  priceKrw: number | null;  // display hypothesis; null = TBD
  lifetimeOnce: boolean;    // §37 — DUK_FIRST_20 is once per account lifetime
};

export const CATALOG: Record<InternalProductKey, CatalogEntry> = {
  DUK_FIRST_20: { key: 'DUK_FIRST_20', grantType: 'DUK', dukAmount: 20, priceKrw: 2900, lifetimeOnce: true },
  DUK_BASE_50: { key: 'DUK_BASE_50', grantType: 'DUK', dukAmount: 50, priceKrw: 9900, lifetimeOnce: false },
  DUK_LARGE_120: { key: 'DUK_LARGE_120', grantType: 'DUK', dukAmount: 120, priceKrw: 19900, lifetimeOnce: false },
  // PLUS is NOT priced/granted this sprint (§40) — foundation only.
  PLUS_MONTHLY: { key: 'PLUS_MONTHLY', grantType: 'SUBSCRIPTION', dukAmount: null, priceKrw: null, lifetimeOnce: false },
};

export function resolveInternalProduct(key: string): CatalogEntry | null {
  return (CATALOG as Record<string, CatalogEntry>)[key] ?? null;
}
