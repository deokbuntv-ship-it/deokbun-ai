// expo-iap 어댑터 — 설계서(`STORE_READINESS_2026-09-10.md` §5-4-2)의 결론대로.
//
// 왜 `react-native-iap` 이 아닌가 (실측 2026-09-10): `react-native-iap@16` 은
// `react-native-nitro-modules` 라는 추가 네이티브 의존을 요구해 New Architecture 브리지 계층이
// 하나 더 얹힌다. `expo-iap` 는 Expo 자체를 peer 로 두어 SDK 57 정렬에 얹힌다.
// 어차피 우리 코드는 `NativeStoreAdapter` 뒤에 있어 바꿔 끼우는 비용이 작다.
//
// ⚠ LAZY-LOADED. 모듈이 없으면(Expo Go, config plugin 미반영 빌드) `isAvailable()` 이 false 고
//   흐름은 NOT_AVAILABLE 로 곱게 내려앉는다 — 크래시도, 가짜 지급도 없다.
//
// ⚠ **이 파일은 덕을 지급하지 않는다.** 클라이언트가 하는 일은 불투명한 토큰을 받아
//   서버(`verify-purchase`)에 넘기는 것뿐이다 (결제 안전 원칙 1).
//
// ⚠ app.json 의 `plugins` 에 `"expo-iap"` 가 필요하다. 이 레포에서 app.json 은 보호 파일이라
//   diff 로만 남겼다: `C:\Development\owner_inputs\app.json.expo-iap.diff`.
//   그것이 반영되지 않은 빌드에서는 `isAvailable()` 이 false 다.
import { Platform } from 'react-native';

import { resolveInternalProduct } from './catalog';
import type { IapProvider, NativePurchase, NativeStoreAdapter, PurchaseOutcome, StoreProduct } from './nativeStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Iap = any;
let cached: Iap | null | undefined;
function loadIap(): Iap | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    cached = require('expo-iap');
  } catch {
    cached = null;
  }
  return cached;
}

/** 테스트가 모듈 캐시를 비울 수 있게. 프로덕션 경로에서는 부르지 않는다. */
export function __resetIapCache(): void {
  cached = undefined;
}

const providerForPlatform = (): IapProvider => (Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE');

/**
 * ⚠ **웹에는 스토어가 없다.**
 *
 * 이 검사가 없으면 `require('expo-iap')` 가 웹 번들에서도 **성공**해서 `isAvailable()` 이
 * true 가 되고, 충전 화면에 살 수 없는 "구매" 버튼이 뜬다. 렌더 테스트가 이것을 잡았다
 * (2026-09-11: jsdom 에서 모듈이 실제로 로드됐다). 모듈 존재는 스토어 존재가 아니다.
 */
const platformHasStore = (): boolean => Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * 플랫폼별 불투명 토큰. iOS 는 서명된 JWS, 안드로이드는 purchaseToken.
 *
 * ⚠ 이름이 버전마다 흔들린다. 하나만 보면 조용히 빈 문자열이 되고, 그러면 서버가
 *   INVALID_INPUT 을 돌려준다 — 사용자는 결제했는데 덕이 안 들어온다. 알려진 이름을 다 본다.
 */
export function tokenOf(p: Record<string, unknown>): string {
  return String(
    p.purchaseToken
    ?? p.purchaseTokenAndroid
    ?? p.jwsRepresentationIos
    ?? p.jwsRepresentation
    ?? p.transactionReceipt
    ?? '',
  ).trim();
}

export function productIdOf(p: Record<string, unknown>): string {
  return String(p.productId ?? p.id ?? p.sku ?? '').trim();
}

export function toNativePurchase(p: Record<string, unknown>): NativePurchase {
  return {
    provider: providerForPlatform(),
    storeProductId: productIdOf(p),
    transactionToken: tokenOf(p),
  };
}

/** 사용자가 취소한 것인가. 취소는 **오류가 아니다** — 오류로 그리면 겁을 준다. */
export function isUserCancelled(err: unknown): boolean {
  const code = String((err as { code?: unknown })?.code ?? '').toUpperCase();
  const msg = String((err as { message?: unknown })?.message ?? '').toLowerCase();
  return code.includes('CANCEL') || msg.includes('cancel') || msg.includes('user canceled') || msg.includes('취소');
}

/** 보류(계좌이체·부모 승인)인가. 실패가 아니고 지급도 아니다. */
export function isDeferred(p: Record<string, unknown>): boolean {
  const state = p.purchaseState ?? p.purchaseStateAndroid;
  return state === 2 || String(state).toUpperCase() === 'PENDING' || p.isPending === true;
}

/**
 * 구매를 얼마나 기다리는가. 결제창이 열려 있는 동안에는 아무 이벤트도 오지 않는다 — 계좌이체·부모 승인처럼
 * 오래 걸리는 결제가 있어 넉넉히 둔다. 여기서 끝나도 **구매가 취소되는 것이 아니다**: 다음 복구 스캔
 * (`restore`)이 남은 구매를 주워 서버에 검증을 다시 넣는다.
 */
export const PURCHASE_EVENT_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * 스토어가 준 **원본 구매 행**을 토큰으로 기억한다.
 *
 * ⚠ 왜 필요한가: 설치본의 `finishTransaction` 은 구매 객체를 **통째로** 네이티브에 넘긴다.
 *   안드로이드는 `purchaseToken` 만 읽지만 iOS 는 `id`/`transactionId` 를 요구한다
 *   (`expo-iap/build/types.d.ts` · `ios/ExpoIapModule.swift`). 우리 `NativePurchase` 는 서버로 보낼
 *   최소 정보만 담으므로, 마무리할 때 원본이 있으면 원본을 넘긴다.
 */
const rawByToken = new Map<string, Record<string, unknown>>();
const RAW_CACHE_LIMIT = 20;
function rememberRaw(token: string, row: Record<string, unknown>): void {
  if (token.length === 0) return;
  if (rawByToken.size >= RAW_CACHE_LIMIT) {
    const oldest = rawByToken.keys().next();
    if (!oldest.done) rawByToken.delete(oldest.value);
  }
  rawByToken.set(token, row);
}

/** 테스트용 — 기억해 둔 원본 구매 행을 비운다. */
export function __resetRawPurchaseCache(): void {
  rawByToken.clear();
}

export function createExpoIapAdapter(): NativeStoreAdapter {
  return {
    isAvailable: () => platformHasStore() && loadIap() !== null,
    provider: providerForPlatform,

    async fetchProducts(ids: string[]): Promise<StoreProduct[]> {
      const iap = loadIap();
      if (!iap) return [];
      try {
        await iap.initConnection?.();
        const products = (await (iap.fetchProducts ?? iap.getProducts)?.({ skus: ids, type: 'in-app' })) ?? [];
        return (products as Record<string, unknown>[]).map((p) => {
          const sid = productIdOf(p);
          return {
            storeProductId: sid,
            localizedPrice: (p.displayPrice as string) ?? (p.localizedPrice as string) ?? null,
            internalKey: resolveInternalProduct(sid)?.key ?? null,
          };
        }).filter((p) => p.storeProductId.length > 0);
      } catch {
        return [];
      }
    },

    /**
     * 구매. ⚠ **결과는 반환값이 아니라 이벤트로 온다.**
     *
     * 설치본이 그렇게 못박고 있다 — "The result is delivered through `purchaseUpdatedListener` — NOT the
     * return value. … **Do not rely on it** for the actual outcome" (`expo-iap/build/index.js:677-684`).
     * 2026-09-18 전수 조사에서 이 계약을 어기고 반환값만 읽고 있었다. 리스너를 **요청 전에** 걸고,
     * 성공 · 취소 · 보류를 이벤트로 판정한다. 리스너가 없는 설치본(옛 버전)에서는 반환값으로 내려앉는다.
     */
    async purchase(storeProductId: string): Promise<PurchaseOutcome> {
      const iap = loadIap();
      if (!iap) return { kind: 'ERROR', message: 'NOT_AVAILABLE' };
      try {
        await iap.initConnection?.();
      } catch (err) {
        return { kind: 'ERROR', message: String((err as { message?: unknown })?.message ?? 'PURCHASE_FAILED') };
      }

      // ⚠ 구매 전에 상품을 한 번 조회한다. 네이티브 결제 SDK 는 **미리 조회해 둔 상품 정보**를 요구해서,
      //   조회 없이 구매하면 `sku-not-found` 로 떨어질 수 있다(`ExpoIapHelper.kt`). 조회 실패는 삼킨다 —
      //   구매 자체를 막을 이유는 없고, 진짜 원인은 아래 오류 이벤트가 말해 준다.
      try {
        await (iap.fetchProducts ?? iap.getProducts)?.({ skus: [storeProductId], type: 'in-app' });
      } catch { /* 조회 실패는 구매를 막지 않는다 */ }

      return await new Promise<PurchaseOutcome>((resolve) => {
        let settled = false;
        const subscriptions: { remove: () => void }[] = [];
        let timer: ReturnType<typeof setTimeout> | null = null;

        const finish = (outcome: PurchaseOutcome): void => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          for (const sub of subscriptions) { try { sub.remove(); } catch { /* 이미 정리됨 */ } }
          resolve(outcome);
        };

        const onPurchase = (event: unknown): void => {
          const row = (event ?? {}) as Record<string, unknown>;
          // 다른 상품의 이벤트(복구 중 흘러든 것 등)는 무시한다. id 를 모르면 우리 것으로 본다.
          const id = productIdOf(row);
          if (id.length > 0 && id !== storeProductId) return;
          if (isDeferred(row)) { finish({ kind: 'PENDING' }); return; }
          const purchase = toNativePurchase(row);
          // ⚠ 토큰이 비면 서버가 검증할 수 없다. 성공으로 그리지 않는다.
          if (purchase.transactionToken.length === 0) { finish({ kind: 'ERROR', message: 'NO_TOKEN' }); return; }
          rememberRaw(purchase.transactionToken, row);
          finish({ kind: 'SUCCESS', purchase });
        };

        const onError = (err: unknown): void => {
          finish(isUserCancelled(err)
            ? { kind: 'CANCELLED' }
            : { kind: 'ERROR', message: String((err as { message?: unknown })?.message ?? 'PURCHASE_FAILED') });
        };

        try {
          const updated = iap.purchaseUpdatedListener?.(onPurchase);
          const failed = iap.purchaseErrorListener?.(onError);
          if (updated) subscriptions.push(updated);
          if (failed) subscriptions.push(failed);
        } catch { /* 리스너를 못 걸면 아래 반환값 경로로 내려앉는다 */ }

        const listening = subscriptions.length > 0;
        if (listening) timer = setTimeout(() => finish({ kind: 'ERROR', message: 'NO_RESULT' }), PURCHASE_EVENT_TIMEOUT_MS);

        void (async () => {
          try {
            const dispatched = await (iap.requestPurchase ?? iap.purchase)?.({
              // ⚠ 설치본이 읽는 이름은 `google` · `apple` 이다(`expo-iap/build/index.js:652-657`).
              //   옛 이름(`android` · `ios`)으로 보내면 결제창을 열기도 전에 EmptySkuList 로 끝난다.
              request: { google: { skus: [storeProductId] }, apple: { sku: storeProductId } },
              type: 'in-app',
            });
            if (listening) return; // 결과는 이벤트로 온다
            const row = (Array.isArray(dispatched) ? dispatched[0] : dispatched) as Record<string, unknown> | undefined;
            if (!row) { finish({ kind: 'ERROR', message: 'NO_RESULT' }); return; }
            onPurchase(row);
            finish({ kind: 'ERROR', message: 'NO_RESULT' }); // onPurchase 가 우리 상품이 아니라고 흘려보낸 경우
          } catch (err) {
            onError(err);
          }
        })();
      });
    },

    /** 앱이 꺼졌다 켜졌을 때 남아 있는 구매. **미처리 구매 복구**의 입구다. */
    async restore(): Promise<NativePurchase[]> {
      const iap = loadIap();
      if (!iap) return [];
      try {
        await iap.initConnection?.();
        const rows = (await (iap.getAvailablePurchases ?? iap.getPurchaseHistories)?.()) ?? [];
        return (rows as Record<string, unknown>[])
          .map((row) => {
            const purchase = toNativePurchase(row);
            rememberRaw(purchase.transactionToken, row); // 마무리할 때 원본을 넘기기 위해
            return purchase;
          })
          .filter((p) => p.transactionToken.length > 0 && p.storeProductId.length > 0);
      } catch {
        return [];
      }
    },

    /**
     * 소비(Android) / 종료(iOS). ⚠ **서버가 검증하고 지급한 뒤에만** 부른다.
     * 검증 안 된 구매를 소비하면 큐에서 사라져 다시 복구할 수 없다.
     */
    async finishTransaction(purchase: NativePurchase): Promise<void> {
      const iap = loadIap();
      if (!iap) return;
      // 스토어가 준 원본이 있으면 원본을 넘긴다 — iOS 는 `id`/`transactionId` 까지 요구한다.
      const raw = rawByToken.get(purchase.transactionToken);
      try {
        await iap.finishTransaction?.({
          purchase: raw ?? { productId: purchase.storeProductId, purchaseToken: purchase.transactionToken },
          isConsumable: true,
        });
        rawByToken.delete(purchase.transactionToken);
      } catch {
        // ⚠ 삼키는 것이 맞다. 소비 실패는 다음 실행의 복구 스캔이 처리하고,
        //   서버가 이미 **승인**해 두어 3일 자동 환불로 되돌아가지 않는다.
      }
    },
  };
}
