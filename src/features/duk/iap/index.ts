export { CATALOG, resolveInternalProduct, type InternalProductKey, type CatalogEntry } from './catalog';
export {
  verifyAndGrantPurchase,
  type Provider,
  type PurchaseSubmission,
  type ProviderVerification,
  type PurchaseDeps,
  type PurchaseResult,
} from './purchaseVerification';
export {
  createAppleVerifier,
  createGoogleVerifier,
  verifierFor,
  type AppleConfig,
  type GoogleConfig,
  type Verifier,
} from './adapters';
