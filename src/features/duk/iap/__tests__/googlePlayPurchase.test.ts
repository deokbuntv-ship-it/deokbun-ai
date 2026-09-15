// 안드로이드 결제 판정 — ⚠ **합성 반례.** 돈이 걸린 규칙이라 전수로 잰다.
//
// 지시서 6-7 이 지정한 반례: 중복 토큰 · 위조 토큰 · 다른 패키지의 토큰 · 환불 후 재사용 ·
// 동시 요청 · 지급 후 소비 실패 · 위조 RTDN · 키 미설정 · 첫 구매 두 번.
//
// ⚠ 어떤 것은 이 순수 함수가 답할 수 없다(동시 요청·중복 토큰은 DB 유니크가 답한다).
//   그 경우 **어디가 답하는지**를 SQL 계약으로 잠근다 — "여기서 못 막는다" 를 그냥 두지 않는다.
import * as fs from 'fs';
import * as path from 'path';

import {
  ACK_STATE,
  CONSUMPTION_STATE,
  PURCHASE_ERROR_TEXT,
  PURCHASE_STATE,
  decideGrant,
  statusFor,
  type CatalogRow,
  type PlayPurchaseFacts,
} from '../googlePlayPurchase';

const ROOT = path.resolve(__dirname, '../../../../..');
const IAP_SQL = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260834000000_iap.sql'), 'utf8');
const RUNTIME_SQL = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260919000000_iap_google_runtime.sql'), 'utf8');
const VERIFY_EDGE = fs.readFileSync(path.join(ROOT, 'supabase/functions/verify-purchase/index.ts'), 'utf8');
const RTDN_EDGE = fs.readFileSync(path.join(ROOT, 'supabase/functions/google-rtdn/index.ts'), 'utf8');
const SHARED = fs.readFileSync(path.join(ROOT, 'supabase/functions/_shared/googlePlay.ts'), 'utf8');

const facts = (over: Partial<PlayPurchaseFacts> = {}): PlayPurchaseFacts => ({
  purchaseState: PURCHASE_STATE.PURCHASED,
  consumptionState: CONSUMPTION_STATE.NOT_CONSUMED,
  acknowledgementState: ACK_STATE.NOT_ACKNOWLEDGED,
  orderId: 'GPA.1234-5678-9012-34567',
  purchaseType: null,
  productId: 'duk_base_50',
  ...over,
});
const cat = (over: Partial<CatalogRow> = {}): CatalogRow => ({
  storeProductId: 'duk_base_50',
  internalProductKey: 'DUK_BASE_50',
  grantAmount: 50,
  active: true,
  ...over,
});

describe('지급해야 하는 것', () => {
  it('정상 구매', () => {
    const d = decideGrant(facts(), cat(), 'duk_base_50', 'tok');
    expect(d.grant).toBe(true);
    if (d.grant) {
      expect(d.amount).toBe(50);
      expect(d.internalKey).toBe('DUK_BASE_50');
      expect(d.externalTransactionId).toBe('GPA.1234-5678-9012-34567');
      expect(d.isTest).toBe(false);
      expect(d.needsAcknowledge).toBe(true);
    }
  });

  it('⚠ orderId 가 없으면 구매 토큰이 거래 id 가 된다 (테스트 구매)', () => {
    const d = decideGrant(facts({ orderId: null, purchaseType: 0 }), cat(), 'duk_base_50', 'tok-abc');
    expect(d.grant).toBe(true);
    if (d.grant) {
      expect(d.externalTransactionId).toBe('tok-abc');
      expect(d.isTest).toBe(true);
    }
  });

  it.each([[0, '테스트'], [1, '프로모'], [2, '리워드']])('purchaseType %s (%s) 은 테스트로 기록된다', (t) => {
    const d = decideGrant(facts({ purchaseType: t }), cat(), 'duk_base_50', 'tok');
    expect(d.grant).toBe(true);
    if (d.grant) expect(d.isTest).toBe(true);
  });

  it('이미 승인된 구매는 다시 승인하지 않는다', () => {
    const d = decideGrant(facts({ acknowledgementState: ACK_STATE.ACKNOWLEDGED }), cat(), 'duk_base_50', 'tok');
    expect(d.grant).toBe(true);
    if (d.grant) expect(d.needsAcknowledge).toBe(false);
  });
});

describe('⚠ 지급하면 안 되는 것', () => {
  it.each([
    ['위조 토큰 — 스토어가 모른다', null, cat(), 'duk_base_50', 'VERIFY_FAILED'],
    ['⚠ 다른 상품의 토큰', facts({ productId: 'duk_first_20' }), cat(), 'duk_base_50', 'PRODUCT_MISMATCH'],
    ['보류 결제 (계좌이체·부모 승인)', facts({ purchaseState: PURCHASE_STATE.PENDING }), cat(), 'duk_base_50', 'PENDING'],
    ['취소된 결제', facts({ purchaseState: PURCHASE_STATE.CANCELED }), cat(), 'duk_base_50', 'CANCELED'],
    ['⚠ 환불 후 재사용 — 이미 소비된 토큰', facts({ consumptionState: CONSUMPTION_STATE.CONSUMED }), cat(), 'duk_base_50', 'ALREADY_CONSUMED'],
    ['카탈로그에 없는 상품', facts(), null, 'duk_base_50', 'UNKNOWN_PRODUCT'],
    ['판매 중지된 상품', facts(), cat({ active: false }), 'duk_base_50', 'INACTIVE_PRODUCT'],
    ['지급 수량이 없다 (운영 데이터 오류)', facts(), cat({ grantAmount: null }), 'duk_base_50', 'BAD_CATALOG'],
    ['지급 수량이 0', facts(), cat({ grantAmount: 0 }), 'duk_base_50', 'BAD_CATALOG'],
    ['지급 수량이 음수', facts(), cat({ grantAmount: -50 }), 'duk_base_50', 'BAD_CATALOG'],
  ])('%s', (_l, f, c, claimed, want) => {
    const d = decideGrant(f as PlayPurchaseFacts | null, c, claimed, 'tok');
    expect(d.grant).toBe(false);
    if (!d.grant) expect(d.reason).toBe(want);
  });

  it('⚠ 순서가 중요하다 — 상품 불일치를 상태보다 먼저 본다', () => {
    // 다른 상품의 **취소된** 토큰. 둘 다 문제지만, 알아야 할 것은 "상품이 다르다" 다.
    const d = decideGrant(
      facts({ productId: 'duk_large_120', purchaseState: PURCHASE_STATE.CANCELED }), cat(), 'duk_base_50', 'tok',
    );
    expect(d.grant).toBe(false);
    if (!d.grant) expect(d.reason).toBe('PRODUCT_MISMATCH');
  });
});

describe('상태 코드 — 재시도해도 되는 것과 아닌 것', () => {
  it('⚠ 보류는 202 다 — 실패(4xx)로 그리면 사용자가 다시 결제한다', () => {
    expect(statusFor('PENDING')).toBe(202);
  });
  it('키 미설정은 503 (우리 문제)', () => {
    expect(statusFor('NOT_CONFIGURED')).toBe(503);
  });
  it('위조 토큰은 402 (결제 문제)', () => {
    expect(statusFor('VERIFY_FAILED')).toBe(402);
  });
  it('모든 사유에 문구가 있다', () => {
    for (const r of ['NOT_CONFIGURED', 'VERIFY_FAILED', 'PRODUCT_MISMATCH', 'UNKNOWN_PRODUCT',
      'INACTIVE_PRODUCT', 'PENDING', 'CANCELED', 'ALREADY_CONSUMED', 'BAD_CATALOG'] as const) {
      expect(PURCHASE_ERROR_TEXT[r].length).toBeGreaterThan(0);
    }
  });
  it('⚠ 문구가 청구 여부를 분명히 말한다', () => {
    // 결제되지 않은 경우와 "됐을 수 있는" 경우를 뭉개면 사용자가 두 번 결제한다.
    expect(PURCHASE_ERROR_TEXT.CANCELED).toMatch(/지급되지 않았습니다|결제되지 않았습니다/);
    expect(PURCHASE_ERROR_TEXT.NOT_CONFIGURED).toMatch(/결제되지 않았습니다/);
    expect(PURCHASE_ERROR_TEXT.PENDING).toMatch(/진행 중/);
    expect(PURCHASE_ERROR_TEXT.VERIFY_FAILED).toMatch(/환불/);
  });
  it('⚠ 톤 규칙 — 겁주지 않는다', () => {
    const all = Object.values(PURCHASE_ERROR_TEXT).join(' ');
    expect(all).not.toMatch(/반드시|절대|위험|큰일|경고/);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 순수 함수가 답할 수 없는 것 — **어디가 답하는지**를 잠근다
// ══════════════════════════════════════════════════════════════════════════════
describe('⚠ 중복 토큰·동시 요청은 DB 가 답한다', () => {
  it('external_transaction_id 유니크가 중복 지급을 막는다', () => {
    expect(IAP_SQL).toMatch(/create unique index if not exists verified_purchases_external_uniq/);
    expect(IAP_SQL).toMatch(/on public\.verified_purchases \(external_transaction_id\)/);
  });

  it('record_verified_purchase 가 중복을 조용히 통과시킨다 (already)', () => {
    expect(IAP_SQL).toMatch(/select \* into v_existing from public\.verified_purchases where external_transaction_id/);
    expect(IAP_SQL).toMatch(/return jsonb_build_object\('granted', 0, 'already', true\)/);
  });

  it('⚠ 첫 구매 두 번 — 부분 유니크 인덱스가 평생 1회를 강제한다', () => {
    expect(IAP_SQL).toMatch(/create unique index if not exists verified_purchases_first_pack_once/);
    expect(IAP_SQL).toMatch(/where internal_product_key = 'DUK_FIRST_20'/);
    // 인덱스만이 아니라 함수도 깨끗한 오류를 낸다.
    expect(IAP_SQL).toMatch(/raise exception 'first pack already granted'/);
  });

  it('지급 RPC 는 service_role 만 부를 수 있다', () => {
    expect(IAP_SQL).toMatch(/if auth\.role\(\) <> 'service_role' then raise exception 'service role required'/);
  });
});

describe('⚠ 지급 후 소비 실패 — 재시도 경로가 있다', () => {
  it('승인 안 된 구매를 찾는 목록이 있다', () => {
    expect(RUNTIME_SQL).toMatch(/create or replace function public\.iap_pending_acknowledgements/);
    expect(RUNTIME_SQL).toMatch(/where v\.acknowledged = false/);
  });

  it('⚠ 3일 창을 지킨다 — 그 뒤에는 구글이 이미 환불했다', () => {
    expect(RUNTIME_SQL).toMatch(/created_at > now\(\) - interval '3 days'/);
  });

  it('같은 행을 초당 여러 번 두드리지 않는다', () => {
    expect(RUNTIME_SQL).toMatch(/last_retry_at < now\(\) - interval '10 minutes'/);
  });

  it('재시도 워커가 CRON_SECRET 으로 잠겨 있다', () => {
    const cron = fs.readFileSync(path.join(ROOT, 'supabase/functions/iap-reconcile/index.ts'), 'utf8');
    expect(cron).toMatch(/x-cron-secret/);
    expect(cron).toMatch(/if \(!authorized\(req\)\) return json\(\{ error: 'UNAUTHORIZED' \}, 401\)/);
    // 설정이 없으면 0건 처리를 "할 일 없음" 으로 보이지 않게 한다.
    expect(cron).toMatch(/status: 'NOT_CONFIGURED'/);
  });

  it('런타임 기록 RPC 도 service_role 만', () => {
    for (const fn of ['record_purchase_runtime', 'iap_pending_acknowledgements', 'record_acknowledge_attempt', 'find_purchase_by_token']) {
      expect(RUNTIME_SQL).toMatch(new RegExp(`grant execute on function public\\.${fn}\\([^)]*\\) to service_role`));
      expect(RUNTIME_SQL).toMatch(new RegExp(`revoke all on function public\\.${fn}\\([^)]*\\) from public, anon, authenticated`));
    }
  });
});

describe('⚠ 위조 RTDN 과 키 미설정', () => {
  it('Pub/Sub push 를 OIDC 토큰으로 검증한다 (원칙 6)', () => {
    expect(SHARED).toMatch(/export async function verifyPubSubPush/);
    expect(SHARED).toMatch(/tokeninfo\?id_token=/);
    expect(SHARED).toMatch(/if \(j\.aud !== audience\) return 'rejected'/);
  });

  it('⚠ audience 가 설정 안 됐으면 처리하지 않는다 — 200 을 주지 않는다', () => {
    expect(RTDN_EDGE).toMatch(/if \(auth === 'not_configured'\)/);
    expect(RTDN_EDGE).toMatch(/return json\(\{ error: 'NOT_CONFIGURED' \}, 503\)/);
  });

  it('거절된 요청을 기록한다 — 조용히 버리면 공격이 안 보인다', () => {
    expect(RTDN_EDGE).toMatch(/logRejected\(admin, 'AUTH_REJECTED'/);
    expect(RTDN_EDGE).toMatch(/logRejected\(admin, 'NOT_IN_VOIDED_LIST'/);
  });

  it('⚠ 통지 내용으로 회수하지 않는다 — 구글에 다시 물어본다', () => {
    expect(RTDN_EDGE).toMatch(/listVoidedPurchases/);
    expect(RTDN_EDGE).toMatch(/if \(!confirmed\)/);
  });

  it('다른 앱의 통지는 무시한다', () => {
    expect(RTDN_EDGE).toMatch(/rtdn\.packageName !== cfg\.packageName/);
  });

  it('환불은 기존 record_revocation 으로 간다 (원칙 5)', () => {
    expect(RTDN_EDGE).toMatch(/admin\.rpc\('record_revocation'/);
  });

  it('⚠ 키가 없으면 지급하지 않는다 (원칙 3)', () => {
    expect(VERIFY_EDGE).toMatch(/const cfg = readPlayConfig\(\);\s*\n\s*if \(!cfg\) return deny\('NOT_CONFIGURED'\)/);
    expect(SHARED).toMatch(/export function readPlayConfig\(\): PlayConfig \| null/);
  });
});

describe('⚠ Edge 가 순수 함수와 같은 규칙을 쓴다', () => {
  it('같은 상수를 쓴다', () => {
    expect(VERIFY_EDGE).toMatch(/PURCHASED: 0, CANCELED: 1, PENDING: 2/);
    expect(VERIFY_EDGE).toMatch(/NOT_CONSUMED: 0, CONSUMED: 1/);
  });

  it('같은 순서로 거른다 (상품 불일치 → 보류 → 취소 → 소비됨)', () => {
    const i = (re: RegExp) => VERIFY_EDGE.search(re);
    expect(i(/PRODUCT_MISMATCH/)).toBeLessThan(i(/deny\('PENDING'\)/));
    expect(i(/deny\('PENDING'\)/)).toBeLessThan(i(/deny\('CANCELED'\)/));
    expect(i(/deny\('CANCELED'\)/)).toBeLessThan(i(/deny\('ALREADY_CONSUMED'\)/));
  });

  it('⚠ 지급이 승인보다 **먼저** 온다 (원칙 2)', () => {
    expect(VERIFY_EDGE.indexOf("record_verified_purchase")).toBeLessThan(VERIFY_EDGE.indexOf('acknowledgeProduct(cfg'));
  });

  it('클라이언트가 보낸 지급 수량을 쓰지 않는다', () => {
    expect(VERIFY_EDGE).toMatch(/from\('product_catalog'\)/);
    expect(VERIFY_EDGE).not.toMatch(/body\.(amount|dukAmount|grantAmount|price)/);
  });

  it('상태 코드가 순수 함수와 같다', () => {
    for (const [reason, code] of [['NOT_CONFIGURED', 503], ['PENDING', 202], ['VERIFY_FAILED', 402],
      ['UNKNOWN_PRODUCT', 404], ['BAD_CATALOG', 500]] as const) {
      expect(statusFor(reason)).toBe(code);
      expect(VERIFY_EDGE).toMatch(new RegExp(`${reason}: ${code}`));
    }
  });
});
