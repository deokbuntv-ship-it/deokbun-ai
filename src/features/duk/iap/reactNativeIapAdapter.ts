// Concrete native store adapter (Owner Activation 05A). Binds the SDK-agnostic NativeStoreAdapter to
// `react-native-iap`. LAZY-LOADED so the JS build/tests never depend on the native module: if the module is
// absent (Expo Go, before `npx expo install react-native-iap` + a dev/EAS build), isAvailable() is false and the
// flow degrades to NOT_AVAILABLE — never a crash, never a fake grant.
//
// FINALIZATION (dev build, ties to deferred 05B store setup — do NOT run in Expo Go):
//   1) npx expo install react-native-iap
//   2) add its config plugin to app.json and run an EAS/dev build (IAP cannot run in Expo Go)
//   3) confirm the exact API of the installed version and the per-platform token below against react-native-iap docs
//   4) on-device sandbox/license verification (05B)
// Until then this adapter reports NOT available; nothing here grants Duk (the server verify-purchase Edge does).
import { Platform } from 'react-native';
import type { IapProvider, NativePurchase, NativeStoreAdapter, PurchaseOutcome, StoreProduct } from './nativeStore';
import { resolveInternalProduct } from './catalog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Iap = any;
let cached: Iap | null | undefined;
function loadIap(): Iap | null {
  if (cached !== undefined) return cached;
  try {
    // Lazy require — absent in Expo Go / before the dev build. Not a static import (keeps tsc/jest independent).
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    cached = require('react-native-iap');
  } catch {
    cached = null;
  }
  return cached;
}

const providerForPlatform = (): IapProvider => (Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE');

// Per-platform opaque token: iOS → the signed JWS transaction (StoreKit 2) or receipt; Android → purchaseToken.
// Confirm the exact field names against the installed react-native-iap version during finalization.
function tokenOf(p: Record<string, unknown>): string {
  return String(
    p.jwsRepresentationIos ?? p.transactionReceipt ?? p.purchaseToken ?? p.purchaseTokenAndroid ?? '',
  );
}
function toNativePurchase(p: Record<string, unknown>): NativePurchase {
  return {
    provider: providerForPlatform(),
    storeProductId: String(p.productId ?? p.sku ?? ''),
    transactionToken: tokenOf(p),
  };
}

export function createReactNativeIapAdapter(): NativeStoreAdapter {
  return {
    isAvailable: () => loadIap() !== null,
    provider: providerForPlatform,
    async fetchProducts(ids: string[]): Promise<StoreProduct[]> {
      const iap = loadIap();
      if (!iap) return [];
      try {
        await iap.initConnection?.();
        const products = (await iap.getProducts?.({ skus: ids })) ?? [];
        return (products as Record<string, unknown>[]).map((p) => {
          const sid = String(p.productId ?? p.sku ?? '');
          return { storeProductId: sid, localizedPrice: (p.localizedPrice as string) ?? null, internalKey: resolveInternalProduct(sid)?.key ?? null };
        });
      } catch {
        return [];
      }
    },
    async purchase(storeProductId: string): Promise<PurchaseOutcome> {
      const iap = loadIap();
      if (!iap) return { kind: 'ERROR', message: 'store_unavailable' };
      try {
        const res = await iap.requestPurchase?.({ sku: storeProductId, skus: [storeProductId] });
        const p = (Array.isArray(res) ? res[0] : res) as Record<string, unknown> | undefined;
        if (!p) return { kind: 'PENDING' }; // deferred / awaiting settlement
        return { kind: 'SUCCESS', purchase: toNativePurchase(p) };
      } catch (e) {
        const code = String((e as { code?: string })?.code ?? '');
        if (/USER_CANCEL|E_USER_CANCELLED|cancel/i.test(code)) return { kind: 'CANCELLED' };
        if (/DEFERRED|PENDING/i.test(code)) return { kind: 'PENDING' };
        return { kind: 'ERROR', message: code || String((e as { message?: string })?.message ?? e) };
      }
    },
    async restore(): Promise<NativePurchase[]> {
      const iap = loadIap();
      if (!iap) return [];
      try {
        const owned = (await iap.getAvailablePurchases?.()) ?? [];
        return (owned as Record<string, unknown>[]).map(toNativePurchase).filter((p) => p.transactionToken.length > 0);
      } catch {
        return [];
      }
    },
    async finishTransaction(purchase: NativePurchase): Promise<void> {
      const iap = loadIap();
      if (!iap) return;
      try { await iap.finishTransaction?.({ purchase: { productId: purchase.storeProductId }, isConsumable: true }); } catch { /* best-effort */ }
    },
  };
}
