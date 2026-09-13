// 결제 화면 문구 + 상품 id 매핑 — 순수.
//
// ⚠ 결제 안전 원칙 8: **경제 계약은 불변이다.** 상품 ID 가 스토어 규칙과 다르면 매핑으로 푼다.
//   경제 계약의 내부 키는 대문자(`DUK_FIRST_20`)이고, 구글은 상품 ID 에 **소문자·숫자·밑줄·
//   마침표**만 허용한다. 그래서 두 이름을 여기서 잇는다 — `economyContractV1.test.ts` 는
//   한 글자도 건드리지 않는다.
//
// ⚠ 이 매핑은 **표시·요청용**이다. 실제 지급 수량은 서버 `product_catalog` 가 정한다.
//   여기 값이 틀려도 돈이 잘못 나가지 않는다 — 서버가 모르는 상품이면 UNKNOWN_PRODUCT 로 거절한다.
import type { PurchaseFlowResult } from './purchaseFlow';

/** 내부 키 → 구글 상품 ID. 대문자를 소문자로 눕힌 것뿐이라 사람이 대조하기 쉽다. */
export const GOOGLE_STORE_PRODUCT_ID: Readonly<Record<string, string>> = {
  DUK_FIRST_20: 'duk_first_20',
  DUK_BASE_50: 'duk_base_50',
  DUK_LARGE_120: 'duk_large_120',
};

/** 내부 키 → 애플 Product ID. 애플은 역DNS 관례를 쓴다. 계정 승인 후 확정한다. */
export const APPLE_STORE_PRODUCT_ID: Readonly<Record<string, string>> = {
  DUK_FIRST_20: 'com.deokbun.app.duk_first_20',
  DUK_BASE_50: 'com.deokbun.app.duk_base_50',
  DUK_LARGE_120: 'com.deokbun.app.duk_large_120',
};

export function storeProductIdFor(internalKey: string, provider: 'GOOGLE' | 'APPLE' = 'GOOGLE'): string | null {
  const table = provider === 'APPLE' ? APPLE_STORE_PRODUCT_ID : GOOGLE_STORE_PRODUCT_ID;
  return table[internalKey] ?? null;
}

/** ⚠ 구글 상품 ID 규칙: 소문자·숫자·밑줄·마침표. 첫 글자는 숫자가 아니어야 한다. */
export function isValidGoogleProductId(id: string): boolean {
  return /^[a-z][a-z0-9_.]*$/.test(id);
}

/**
 * 결과 → 사용자 문구.
 *
 * ⚠ 톤 규칙 + **돈 이야기를 정확하게**. 특히 실패했을 때 "결제되지 않았습니다" 인지
 *   "결제는 됐는데 처리가 남았습니다" 인지 구분한다 — 둘을 뭉개면 사용자가 두 번 결제한다.
 */
export const PURCHASE_UI_TEXT: Readonly<Record<PurchaseFlowResult['status'], string>> = {
  GRANTED: '충전이 완료됐어요. 덕이 들어왔습니다.',
  CANCELLED: '결제를 취소했어요. 아무것도 청구되지 않았습니다.',
  // ⚠ 보류는 실패가 아니다. 계좌이체·부모 승인처럼 나중에 끝나는 결제가 있다.
  PENDING: '결제가 진행 중이에요. 완료되면 덕이 자동으로 들어옵니다. 다시 결제하지 마세요.',
  NOT_AVAILABLE: '이 기기에서는 아직 결제를 열 수 없어요. 스토어에서 받은 앱에서 이용해 주세요.',
  // ⚠ 여기가 가장 조심스러운 자리다. 결제는 됐을 수 있다.
  VERIFICATION_FAILED: '결제 확인이 끝나지 않았어요. 앱을 다시 열면 이어서 처리됩니다. 중복 결제하지 마시고, 처리되지 않으면 자동으로 환불됩니다.',
  ERROR: '결제를 마치지 못했어요. 청구된 금액이 있다면 자동으로 환불됩니다.',
};

/** 결과가 잔액을 바꿨는가 — 화면이 지갑을 다시 읽어야 하는지 정한다. */
export function shouldRefreshWallet(status: PurchaseFlowResult['status']): boolean {
  return status === 'GRANTED';
}

/** 다시 눌러도 되는가. ⚠ 보류·검증 실패에서 다시 사게 두면 **두 번 결제**한다. */
export function canRetry(status: PurchaseFlowResult['status']): boolean {
  return status === 'CANCELLED' || status === 'ERROR' || status === 'NOT_AVAILABLE';
}
