// 결제 화면 문구·매핑 — ⚠ 돈 이야기는 **정확해야** 한다.
//
// 여기서 지키는 것 하나: "결제되지 않았다" 와 "결제는 됐는데 처리가 남았다" 를 뭉개지 않는다.
// 둘을 같은 말로 그리면 사용자가 **두 번 결제한다.**
import {
  APPLE_STORE_PRODUCT_ID,
  GOOGLE_STORE_PRODUCT_ID,
  PURCHASE_UI_TEXT,
  canRetry,
  isValidGoogleProductId,
  shouldRefreshWallet,
  storeProductIdFor,
} from '../purchaseUiText';
import { CATALOG } from '../catalog';
import { TOPUP_PACKS } from '../../pricing';

describe('상품 ID 매핑 — 경제 계약을 건드리지 않는다 (원칙 8)', () => {
  it('⚠ 구글 상품 ID 가 구글 규칙(소문자·숫자·밑줄·마침표)을 지킨다', () => {
    for (const id of Object.values(GOOGLE_STORE_PRODUCT_ID)) {
      expect(isValidGoogleProductId(id)).toBe(true);
    }
  });

  it.each([
    ['대문자', 'DUK_BASE_50', false],
    ['하이픈', 'duk-base-50', false],
    ['숫자로 시작', '50_duk', false],
    ['공백', 'duk base', false],
    ['정상', 'duk_base_50', true],
    ['마침표 허용', 'com.x.duk_base_50', true],
  ])('규칙 검사 — %s', (_l, id, want) => {
    expect(isValidGoogleProductId(id)).toBe(want);
  });

  it('⚠ 충전 화면의 팩 셋이 전부 매핑돼 있다', () => {
    for (const p of TOPUP_PACKS) {
      expect(storeProductIdFor(p.internalKey, 'GOOGLE')).not.toBeNull();
      expect(storeProductIdFor(p.internalKey, 'APPLE')).not.toBeNull();
    }
  });

  it('내부 키는 경제 계약의 것 그대로다 (대문자)', () => {
    for (const key of Object.keys(GOOGLE_STORE_PRODUCT_ID)) {
      expect(key).toMatch(/^[A-Z][A-Z0-9_]*$/);
      expect(CATALOG[key as keyof typeof CATALOG]).toBeDefined();
    }
  });

  it('애플은 역DNS 관례를 쓴다', () => {
    for (const id of Object.values(APPLE_STORE_PRODUCT_ID)) {
      expect(id).toMatch(/^com\.deokbun\.app\./);
    }
  });

  it('모르는 키는 null — 짐작해서 만들지 않는다', () => {
    expect(storeProductIdFor('DUK_MADE_UP')).toBeNull();
    expect(storeProductIdFor('')).toBeNull();
  });
});

describe('문구 — 청구 여부를 뭉개지 않는다', () => {
  it('취소는 "청구되지 않았습니다" 라고 분명히 말한다', () => {
    expect(PURCHASE_UI_TEXT.CANCELLED).toMatch(/청구되지 않았습니다/);
  });

  it('⚠ 보류는 "다시 결제하지 마세요" 를 말한다', () => {
    expect(PURCHASE_UI_TEXT.PENDING).toMatch(/다시 결제하지/);
    expect(PURCHASE_UI_TEXT.PENDING).not.toMatch(/실패|오류/);
  });

  it('⚠ 검증 실패는 결제가 됐을 수 있음을 말한다', () => {
    expect(PURCHASE_UI_TEXT.VERIFICATION_FAILED).toMatch(/중복 결제하지/);
    expect(PURCHASE_UI_TEXT.VERIFICATION_FAILED).toMatch(/환불/);
    // "결제되지 않았습니다" 라고 단정하면 안 된다 — 됐을 수 있다.
    expect(PURCHASE_UI_TEXT.VERIFICATION_FAILED).not.toMatch(/청구되지 않았습니다/);
  });

  it('성공은 덕이 들어왔다고 말한다', () => {
    expect(PURCHASE_UI_TEXT.GRANTED).toMatch(/덕이 들어왔/);
  });

  it('⚠ 톤 규칙 — 겁주거나 단정하지 않는다', () => {
    const all = Object.values(PURCHASE_UI_TEXT).join(' ');
    expect(all).not.toMatch(/반드시|절대|위험|큰일|경고|즉시 문의/);
  });

  it('모든 결과에 문구가 있다', () => {
    for (const s of ['GRANTED', 'CANCELLED', 'PENDING', 'NOT_AVAILABLE', 'VERIFICATION_FAILED', 'ERROR'] as const) {
      expect(PURCHASE_UI_TEXT[s].length).toBeGreaterThan(0);
    }
  });
});

describe('⚠ 다시 눌러도 되는가 — 두 번 결제를 막는다', () => {
  it.each([
    ['취소 — 다시 사도 된다', 'CANCELLED', true],
    ['오류 — 다시 사도 된다', 'ERROR', true],
    ['스토어 없음', 'NOT_AVAILABLE', true],
    ['⚠ 보류 — 다시 사면 두 번 결제된다', 'PENDING', false],
    ['⚠ 검증 실패 — 다시 사면 두 번 결제된다', 'VERIFICATION_FAILED', false],
    ['이미 지급됨', 'GRANTED', false],
  ] as const)('%s', (_l, status, want) => {
    expect(canRetry(status)).toBe(want);
  });

  it('잔액을 다시 읽는 것은 지급됐을 때뿐이다', () => {
    expect(shouldRefreshWallet('GRANTED')).toBe(true);
    for (const s of ['CANCELLED', 'PENDING', 'NOT_AVAILABLE', 'VERIFICATION_FAILED', 'ERROR'] as const) {
      expect(shouldRefreshWallet(s)).toBe(false);
    }
  });
});
