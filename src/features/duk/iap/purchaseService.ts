import { requestPurchaseVerification } from '@/features/duk/dukClientContract';

import { createExpoIapAdapter } from './expoIapAdapter';
import type { NativeStoreAdapter } from './nativeStore';
import { runPurchase, runRestore, type PurchaseFlowResult, type RestoreResult } from './purchaseFlow';

// 결제 실행 — 화면과 **이미 있던 오케스트레이터**(`purchaseFlow`) 를 잇는다.
//
// ⚠ 새 흐름을 만들지 않았다. `runPurchase`/`runRestore` 는 05A 에 이미 있었고 규칙도 맞다:
//   네이티브 "성공" 은 자격이 아니고, 서버가 지급한 뒤에만 거래를 종료한다.
//   여기서 더한 것은 **실제 어댑터 연결**과 **앱 시작 시 미처리 구매 복구** 둘뿐이다.
//
// ⚠ 결제 안전 원칙 1 — 이 파일은 덕을 지급하지 않는다. `verify-purchase` 만 지급한다.

let adapter: NativeStoreAdapter | null = null;

/** 어댑터 하나만 만든다. 네이티브 연결을 화면마다 새로 여는 것을 막는다. */
export function nativeStore(): NativeStoreAdapter {
  if (!adapter) adapter = createExpoIapAdapter();
  return adapter;
}

/** 테스트용 주입. 프로덕션 경로에서는 부르지 않는다. */
export function __setNativeStore(a: NativeStoreAdapter | null): void {
  adapter = a;
}

export async function buy(storeProductId: string): Promise<PurchaseFlowResult> {
  return runPurchase(nativeStore(), requestPurchaseVerification, storeProductId);
}

/**
 * 앱이 켜질 때 남아 있는 구매를 처리한다.
 *
 * ⚠ 왜 필요한가 (결제 안전 원칙 4): 결제 도중 앱이 꺼지면 구매는 스토어 큐에 **남는다**.
 *   아무도 다시 제출하지 않으면 사용자는 돈을 냈는데 덕이 없고, 3일 뒤 구글이 환불한다.
 *   서버가 `external_transaction_id` 로 멱등 처리하므로 **중복 지급은 일어나지 않는다.**
 *
 * ⚠ 조용히 돈다. 결과를 화면에 띄우지 않는다 — 사용자가 아무 것도 안 했는데 결제 메시지가
 *   뜨면 그것이 더 혼란스럽다. 지급되면 잔액이 바뀌는 것으로 충분하다.
 */
export async function recoverPendingPurchases(): Promise<RestoreResult> {
  const store = nativeStore();
  if (!store.isAvailable()) return { total: 0, granted: 0, failures: 0 };
  try {
    return await runRestore(store, requestPurchaseVerification);
  } catch {
    return { total: 0, granted: 0, failures: 0 };
  }
}

export const purchaseService = { buy, recoverPendingPurchases, nativeStore };
