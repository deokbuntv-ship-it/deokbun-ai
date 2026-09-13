// 구글 구매 판정 — **순수 함수.** 무엇을 지급할지 정하는 규칙만 담는다.
//
// WHY THIS EXISTS. Edge 는 Deno 에서 돌아 jest 가 직접 실행하지 못한다. 그런데 이 규칙은
// **돈이 걸린 판단**이라 합성 반례로 반드시 검사해야 한다. 그래서 규칙을 여기 두고,
// Edge 가 같은 규칙을 쓰는지는 소스 계약 테스트가 대조한다
// (`shareServerSnapshot.test.ts` 와 같은 방식).
//
// ⚠ 결제 안전 원칙 (지시서, 설계서보다 우선)
//   1. 지급은 서버만. 클라이언트의 "성공" 신호로는 지급하지 않는다.
//   2. 검증 → 지급(토큰 멱등) → 소비·승인. 같은 토큰으로 두 번 지급될 수 없다.
//   3. 검증할 수 없으면 지급하지 않는다 (fail-closed).
//   7. 테스트 구매와 실구매를 구분해 기록한다.
//   8. 경제 계약은 불변. 상품 ID 가 스토어 규칙과 다르면 **매핑**으로 푼다.
//   9. 첫 구매 상품 자격은 서버가 판정한다.

/** Play 의 `purchaseState`. 숫자를 코드 곳곳에 흩뿌리지 않는다. */
export const PURCHASE_STATE = { PURCHASED: 0, CANCELED: 1, PENDING: 2 } as const;
export const CONSUMPTION_STATE = { NOT_CONSUMED: 0, CONSUMED: 1 } as const;
export const ACK_STATE = { NOT_ACKNOWLEDGED: 0, ACKNOWLEDGED: 1 } as const;

/** `purchaseType`: 0 테스트 · 1 프로모 · 2 리워드. **없으면 실구매.** */
export const PURCHASE_TYPE = { TEST: 0, PROMO: 1, REWARDED: 2 } as const;

export type PlayPurchaseFacts = {
  purchaseState: number;
  consumptionState: number;
  acknowledgementState: number;
  orderId: string | null;
  purchaseType: number | null;
  /** Play 가 말하는 상품 id. 클라이언트가 보낸 것과 다를 수 있다 — 그때가 문제다. */
  productId: string;
};

export type CatalogRow = {
  storeProductId: string;
  internalProductKey: string;
  grantAmount: number | null;
  active: boolean;
};

export type GrantDecision =
  | {
      grant: true;
      internalKey: string;
      amount: number;
      /** 원장에 남길 거래 id. **orderId 가 있으면 그것**, 없으면 구매 토큰. */
      externalTransactionId: string;
      /** 라이선스 테스터·프로모 구매인가. 실구매와 구분해 기록한다 (원칙 7). */
      isTest: boolean;
      /** 승인이 필요한가 (3일 자동 환불 방지). */
      needsAcknowledge: boolean;
    }
  | {
      grant: false;
      reason:
        | 'NOT_CONFIGURED'      // 서비스 계정 키가 없다 → 검증 불가 → 지급 없음
        | 'VERIFY_FAILED'       // 스토어가 이 토큰을 모른다 (위조·다른 패키지)
        | 'PRODUCT_MISMATCH'    // 스토어가 말한 상품과 클라이언트가 말한 상품이 다르다
        | 'UNKNOWN_PRODUCT'     // product_catalog 에 없다
        | 'INACTIVE_PRODUCT'
        | 'PENDING'             // 결제 보류 (계좌이체 등) — 나중에 RTDN 이 온다
        | 'CANCELED'
        | 'ALREADY_CONSUMED'    // 이미 소비됐다 → 재사용 시도
        | 'BAD_CATALOG';        // 지급 수량이 없다 (운영 데이터 오류)
    };

/**
 * 지급할 것인가.
 *
 * @param claimedProductId 클라이언트가 말한 상품 id. **믿지 않는다** — facts 와 대조만 한다.
 */
export function decideGrant(
  facts: PlayPurchaseFacts | null,
  catalog: CatalogRow | null,
  claimedProductId: string,
  purchaseToken: string,
): GrantDecision {
  // 원칙 3 — 검증할 수 없으면 지급하지 않는다.
  if (facts === null) return { grant: false, reason: 'VERIFY_FAILED' };

  // ⚠ 다른 상품의 토큰으로 비싼 상품을 받아 가는 것을 막는 자리.
  if (facts.productId !== claimedProductId) return { grant: false, reason: 'PRODUCT_MISMATCH' };

  if (facts.purchaseState === PURCHASE_STATE.PENDING) return { grant: false, reason: 'PENDING' };
  if (facts.purchaseState !== PURCHASE_STATE.PURCHASED) return { grant: false, reason: 'CANCELED' };

  // ⚠ 이미 소비된 토큰은 재사용 시도다. DB 유니크가 한 번 더 막지만, 여기서 먼저 끊는다.
  if (facts.consumptionState === CONSUMPTION_STATE.CONSUMED) return { grant: false, reason: 'ALREADY_CONSUMED' };

  if (catalog === null) return { grant: false, reason: 'UNKNOWN_PRODUCT' };
  if (!catalog.active) return { grant: false, reason: 'INACTIVE_PRODUCT' };
  // ⚠ 지급 수량은 **서버 데이터**다. 클라이언트가 보낸 값이 아니고, 없으면 지급하지 않는다.
  if (typeof catalog.grantAmount !== 'number' || catalog.grantAmount <= 0) {
    return { grant: false, reason: 'BAD_CATALOG' };
  }

  return {
    grant: true,
    internalKey: catalog.internalProductKey,
    amount: catalog.grantAmount,
    // orderId 가 거래의 정체성이다. 없을 수 있는 경우(테스트 구매)만 토큰으로 대신한다.
    externalTransactionId: facts.orderId && facts.orderId.length > 0 ? facts.orderId : purchaseToken,
    isTest: facts.purchaseType !== null,
    needsAcknowledge: facts.acknowledgementState !== ACK_STATE.ACKNOWLEDGED,
  };
}

/** 거절 사유 → HTTP 상태. 재시도해도 되는 것과 아닌 것을 구분한다. */
export function statusFor(reason: Exclude<GrantDecision, { grant: true }>['reason']): number {
  switch (reason) {
    case 'NOT_CONFIGURED': return 503;
    case 'PENDING': return 202;        // 아직 끝나지 않았다. 실패가 아니다.
    case 'VERIFY_FAILED': return 402;
    case 'PRODUCT_MISMATCH': return 400;
    case 'UNKNOWN_PRODUCT': return 404;
    case 'INACTIVE_PRODUCT': return 409;
    case 'CANCELED': return 409;
    case 'ALREADY_CONSUMED': return 409;
    case 'BAD_CATALOG': return 500;
    default: return 400;
  }
}

/** 사용자에게 보일 문구. ⚠ 톤 규칙 — 겁주지 않고, 돈 이야기를 정확하게 한다. */
export const PURCHASE_ERROR_TEXT: Readonly<Record<Exclude<GrantDecision, { grant: true }>['reason'] | 'NETWORK', string>> = {
  NOT_CONFIGURED: '지금은 결제를 처리할 수 없어요. 결제되지 않았습니다.',
  VERIFY_FAILED: '결제를 확인하지 못했어요. 결제가 이루어졌다면 잠시 뒤 앱을 다시 열어 주세요. 금액이 빠져나갔다면 자동으로 환불됩니다.',
  PRODUCT_MISMATCH: '상품 정보가 맞지 않아요. 결제되지 않았습니다.',
  UNKNOWN_PRODUCT: '지금은 판매하지 않는 상품이에요. 결제되지 않았습니다.',
  INACTIVE_PRODUCT: '지금은 판매하지 않는 상품이에요. 결제되지 않았습니다.',
  PENDING: '결제가 아직 진행 중이에요. 완료되면 덕이 자동으로 들어옵니다.',
  CANCELED: '취소된 결제예요. 덕은 지급되지 않았습니다.',
  ALREADY_CONSUMED: '이미 처리된 결제예요. 덕이 들어와 있는지 확인해 주세요.',
  BAD_CATALOG: '상품 설정에 문제가 있어요. 결제되지 않았습니다.',
  NETWORK: '연결이 불안정해요. 결제가 이루어졌다면 앱을 다시 열면 이어서 처리됩니다.',
};
