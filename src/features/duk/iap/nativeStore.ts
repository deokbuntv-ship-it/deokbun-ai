// Native store SEAM (Owner Activation 05A). SDK-agnostic interface between the app's purchase UX and the
// server-authoritative IAP verification. The concrete implementation (react-native-iap / expo-iap, in a dev
// build) plugs in here; all flow logic + tests use this interface + doubles. NOTHING here grants Duk — the
// client only obtains an OPAQUE transaction token and hands it to the server (verify-purchase Edge).
export type IapProvider = 'APPLE' | 'GOOGLE';

// A store product as the native SDK reports it. `internalKey` is resolved from the SERVER product_catalog
// mapping (never trusted from the store); price is display-only.
export type StoreProduct = {
  storeProductId: string;
  localizedPrice: string | null;
  internalKey: string | null;
};

// The opaque result of a native purchase — the ONLY thing the client may forward to the server.
export type NativePurchase = {
  provider: IapProvider;
  storeProductId: string;
  transactionToken: string; // iOS: signed transaction/receipt; Android: purchaseToken. Opaque to the client.
};

export type PurchaseOutcome =
  | { kind: 'SUCCESS'; purchase: NativePurchase }
  | { kind: 'CANCELLED' } // user dismissed the store sheet
  | { kind: 'PENDING' }   // deferred (Ask-to-Buy / parental approval / SCA) — not an error, not granted
  | { kind: 'ERROR'; message: string };

// The concrete SDK adapter implements this. `isAvailable()` is false in Expo Go / before a dev build /
// before store setup → the flow degrades to NOT_AVAILABLE (no crash, no fake grant).
export type NativeStoreAdapter = {
  isAvailable(): boolean;
  provider(): IapProvider;
  fetchProducts(storeProductIds: string[]): Promise<StoreProduct[]>;
  purchase(storeProductId: string): Promise<PurchaseOutcome>;
  restore(): Promise<NativePurchase[]>;
  // Consume (Android) / finish (iOS) a transaction — called ONLY AFTER the server has verified + granted, so an
  // unverified purchase is never finished (it stays in the queue for retry/restore → server dedups → grant-once).
  finishTransaction(purchase: NativePurchase): Promise<void>;
};
