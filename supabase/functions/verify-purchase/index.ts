// verify-purchase Edge — 서버 권위 IAP 검증. **구글 경로 구현 (2026-09-11). 애플은 계정 승인 후.**
//
// 클라이언트는 불투명한 제출물 { provider, storeProductId, transactionToken } 만 보낸다.
// 가격·덕·자격·성공 여부를 **절대 보내지 않는다.** 서버가 인증하고, 스토어에 물어보고,
// `product_catalog` 를 보고, 멱등 RPC 로 지급한다.
//
// ⚠ 결제 안전 원칙 (지시서, 설계서보다 우선)
//   1. 지급은 서버만. 클라이언트 신호로는 지급하지 않는다.
//   2. **검증 → 지급(토큰 멱등) → 승인.** 같은 토큰으로 두 번 지급될 수 없다
//      (`verified_purchases.external_transaction_id` 유니크 + 이 함수의 순서).
//   3. 검증할 수 없으면 지급하지 않는다. 서비스 계정 키가 없으면 **NOT_CONFIGURED 로 실패**한다.
//   4. 지급 후 소비가 실패해도 되돌아가지 않게 **서버가 먼저 승인**한다 — 3일 자동 환불 방지.
//   7. 테스트 구매(라이선스 테스터·프로모)를 실구매와 구분해 기록한다.
//   9. 첫 구매 상품 자격은 서버가 판정한다 (`record_verified_purchase` + 부분 유니크 인덱스).
//
// ⚠ 판정 규칙 자체는 `src/features/duk/iap/googlePlayPurchase.ts` 에 있고 합성 반례로 검사된다.
//   여기서는 그 규칙을 **그대로** 적용한다 — 소스 계약 테스트가 둘이 어긋나지 않는지 본다.
//
// 필요한 시크릿 (이름만): GOOGLE_PLAY_PACKAGE_NAME · GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
//                        APPLE_IAP_* (애플, 아직 미구현)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { accessToken, acknowledgeProduct, getProductPurchase, readPlayConfig } from '../_shared/googlePlay.ts';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS } });

// ── 판정 규칙 (googlePlayPurchase.ts 와 같은 규칙. 둘이 어긋나면 계약 테스트가 깨진다) ──
const PURCHASE_STATE = { PURCHASED: 0, CANCELED: 1, PENDING: 2 };
const CONSUMPTION_STATE = { NOT_CONSUMED: 0, CONSUMED: 1 };
const ACK_STATE = { ACKNOWLEDGED: 1 };
const STATUS: Record<string, number> = {
  NOT_CONFIGURED: 503, PENDING: 202, VERIFY_FAILED: 402, PRODUCT_MISMATCH: 400,
  UNKNOWN_PRODUCT: 404, INACTIVE_PRODUCT: 409, CANCELED: 409, ALREADY_CONSUMED: 409, BAD_CATALOG: 500,
};
const deny = (reason: string) => json({ error: 'PURCHASE_VERIFICATION_FAILED', reason }, STATUS[reason] ?? 400);

function appleConfigured(): boolean {
  return Boolean(Deno.env.get('APPLE_IAP_ISSUER_ID') && Deno.env.get('APPLE_IAP_KEY_ID')
    && Deno.env.get('APPLE_IAP_PRIVATE_KEY') && Deno.env.get('APPLE_IAP_BUNDLE_ID'));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader || !supabaseUrl || !anonKey) return json({ error: 'AUTH_REQUIRED' }, 401);
  const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await authed.auth.getUser();
  const userId = userData?.user?.id ?? null;
  if (!userId) return json({ error: 'AUTH_REQUIRED' }, 401);

  let body: { provider?: unknown; storeProductId?: unknown; transactionToken?: unknown };
  try { body = await req.json(); } catch { return json({ error: 'INVALID_INPUT' }, 400); }
  const provider = body.provider === 'APPLE' || body.provider === 'GOOGLE' ? body.provider : null;
  const storeProductId = typeof body.storeProductId === 'string' ? body.storeProductId.trim() : '';
  const transactionToken = typeof body.transactionToken === 'string' ? body.transactionToken.trim() : '';
  if (!provider || storeProductId.length === 0 || transactionToken.length === 0) {
    return json({ error: 'INVALID_INPUT' }, 400);
  }

  // 애플은 계정 승인 후. 공통 구조는 같지만 검증기가 다르다 — 없는 것을 있는 척하지 않는다.
  if (provider === 'APPLE') {
    return deny(appleConfigured() ? 'VERIFY_FAILED' : 'NOT_CONFIGURED');
  }

  // ⚠ 원칙 3 — 키가 없으면 여기서 끝난다. 지급 없음.
  const cfg = readPlayConfig();
  if (!cfg) return deny('NOT_CONFIGURED');
  if (!serviceKey) return json({ error: 'SERVICE_UNAVAILABLE' }, 503);

  const token = await accessToken(cfg);
  if (!token) return deny('NOT_CONFIGURED');

  // ── 1. 스토어에 물어본다 (권위 있는 상태) ─────────────────────────────────
  const fetched = await getProductPurchase(cfg, token, storeProductId, transactionToken);
  if (!fetched.ok) {
    // NOT_FOUND = 위조 토큰이거나 다른 패키지의 토큰. AUTH_FAILED = 서비스 계정 권한 문제.
    return deny(fetched.reason === 'AUTH_FAILED' ? 'NOT_CONFIGURED' : 'VERIFY_FAILED');
  }
  const p = fetched.purchase;

  // ⚠ 스토어가 말한 상품과 클라이언트가 말한 상품이 다르면 거절한다.
  if ((p.productId ?? storeProductId) !== storeProductId) return deny('PRODUCT_MISMATCH');
  if (p.purchaseState === PURCHASE_STATE.PENDING) return deny('PENDING');
  if (p.purchaseState !== PURCHASE_STATE.PURCHASED) return deny('CANCELED');
  if (p.consumptionState === CONSUMPTION_STATE.CONSUMED) return deny('ALREADY_CONSUMED');

  // ── 2. 서버 카탈로그가 지급 수량을 정한다 ─────────────────────────────────
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: rows, error: catErr } = await admin.from('product_catalog')
    .select('internal_product_key,grant_amount,active')
    .eq('provider', 'GOOGLE').eq('store_product_id', storeProductId).limit(1);
  if (catErr) return json({ error: 'SERVICE_UNAVAILABLE' }, 503);
  const cat = (rows ?? [])[0] as { internal_product_key?: string; grant_amount?: number; active?: boolean } | undefined;
  if (!cat) return deny('UNKNOWN_PRODUCT');
  if (cat.active !== true) return deny('INACTIVE_PRODUCT');
  const amount = Number(cat.grant_amount);
  if (!Number.isFinite(amount) || amount <= 0) return deny('BAD_CATALOG');

  // orderId 가 거래의 정체성이다. 없을 수 있는 경우(테스트 구매)만 토큰으로 대신한다.
  const externalTransactionId = p.orderId && p.orderId.length > 0 ? p.orderId : transactionToken;
  const isTest = p.purchaseType !== null;

  // ── 3. 지급 (구매 토큰 기준 멱등) ─────────────────────────────────────────
  const { data: granted, error: grantErr } = await admin.rpc('record_verified_purchase', {
    p_user_id: userId,
    p_provider: 'GOOGLE',
    p_external_transaction_id: externalTransactionId,
    p_internal_key: cat.internal_product_key,
    p_grant_duk: Math.floor(amount),
  });
  if (grantErr) {
    // P0001 = 첫 팩 평생 1회 위반. 사용자가 두 번 산 것이므로 환불 안내가 필요하다.
    const code = (grantErr as { code?: string }).code ?? '';
    if (code === 'P0001') return deny('ALREADY_CONSUMED');
    return json({ error: 'SERVICE_UNAVAILABLE' }, 503);
  }

  // ── 4. 승인 (3일 자동 환불 방지). ⚠ 지급 **뒤에** 한다 ────────────────────
  //    승인이 실패해도 지급은 유효하다 — 재시도 크론(`iap-reconcile`)이 다시 승인한다.
  let acknowledged: string;
  if (p.acknowledgementState !== ACK_STATE.ACKNOWLEDGED) {
    acknowledged = await acknowledgeProduct(cfg, token, storeProductId, transactionToken);
  } else {
    acknowledged = 'already';
  }

  // ── 5. 런타임 사실 기록 (원칙 4·7) ────────────────────────────────────────
  //    구매 토큰·상품 id 가 있어야 크론이 승인을 재시도할 수 있고,
  //    테스트 구매 표시가 있어야 매출 집계에서 걸러진다.
  //    ⚠ 실패해도 지급을 되돌리지 않는다 — 기록이 늦는 것이 돈을 되돌리는 것보다 낫다.
  await admin.rpc('record_purchase_runtime', {
    p_external_transaction_id: externalTransactionId,
    p_purchase_token: transactionToken,
    p_store_product_id: storeProductId,
    p_is_test: isTest,
    p_acknowledged: acknowledged === 'ok' || acknowledged === 'already',
  }).then(() => undefined, () => undefined);

  const g = (granted ?? {}) as { granted?: number; already?: boolean; debt_offset?: number };
  return json({
    ok: true,
    granted: Number(g.granted ?? 0),
    already: g.already === true,
    debtOffset: Number(g.debt_offset ?? 0),
    acknowledged,
    isTest,
    // 클라이언트는 이 값을 받고 **소비(consume)** 한다. 실패해도 승인이 끝나 있어 환불되지 않는다.
    shouldConsume: true,
  });
});
