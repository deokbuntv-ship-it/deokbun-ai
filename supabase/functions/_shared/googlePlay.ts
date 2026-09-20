// Google Play Developer API 클라이언트 — **서버만 쓴다.** 서비스 계정 키는 Edge 시크릿에서만 온다.
//
// ⚠ 결제 안전 원칙 (지시서, 설계서보다 우선)
//   1. 덕 지급은 서버만 한다. 클라이언트의 "구매 성공" 신호만으로는 지급하지 않는다.
//   2. 순서는 **스토어 검증 → 지급(구매 토큰 기준 멱등) → 소비·승인**이다.
//   3. **검증할 수 없으면 지급하지 않는다.** 키가 없으면 "미설정" 으로 실패한다.
//
// ⚠ 이 파일은 값을 판단하지 않는다. 스토어가 말한 것을 그대로 돌려줄 뿐이고,
//   "지급할 것인가" 는 `verify-purchase` 가 `product_catalog` 를 보고 정한다.

export type PlayConfig = { packageName: string; serviceAccount: ServiceAccount };
type ServiceAccount = { client_email: string; private_key: string };

/** 설정이 갖춰졌는가. 아니면 null — 호출부는 이때 **지급하지 않고** 미설정으로 실패한다. */
export function readPlayConfig(): PlayConfig | null {
  const packageName = (Deno.env.get('GOOGLE_PLAY_PACKAGE_NAME') ?? '').trim();
  const raw = (Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON') ?? '').trim();
  if (packageName.length === 0 || raw.length === 0) return null;
  try {
    const sa = JSON.parse(raw) as Partial<ServiceAccount>;
    if (typeof sa.client_email !== 'string' || typeof sa.private_key !== 'string') return null;
    return { packageName, serviceAccount: { client_email: sa.client_email, private_key: sa.private_key } };
  } catch {
    return null;
  }
}

const b64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const enc = (s: string) => new TextEncoder().encode(s);

/** PEM → CryptoKey (RS256). 서비스 계정 키는 PKCS#8 PEM 이다. */
async function importKey(pem: string): Promise<CryptoKey> {
  const body = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}

// 액세스 토큰은 1시간 유효하다. 워커가 살아 있는 동안 재사용한다 —
// 요청마다 새로 받으면 결제 지연이 그만큼 늘고 구글 쿼터를 태운다.
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function accessToken(cfg: PlayConfig): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.token;
  try {
    const header = b64url(enc(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
    const claim = b64url(enc(JSON.stringify({
      iss: cfg.serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })));
    const key = await importKey(cfg.serviceAccount.private_key);
    const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc(`${header}.${claim}`)));
    const assertion = `${header}.${claim}.${b64url(sig)}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    });
    if (!res.ok) return null;
    const j = await res.json() as { access_token?: string; expires_in?: number };
    if (typeof j.access_token !== 'string') return null;
    cachedToken = { token: j.access_token, expiresAt: now + (Number(j.expires_in) || 3600) };
    return cachedToken.token;
  } catch {
    return null;
  }
}

/** Play 가 말하는 구매 상태. 값은 스토어의 것이고 우리가 해석하지 않는다. */
export type PlayProductPurchase = {
  purchaseState: number;        // 0 구매됨 · 1 취소됨 · 2 보류중
  consumptionState: number;     // 0 미소비 · 1 소비됨
  acknowledgementState: number; // 0 미승인 · 1 승인됨
  orderId: string | null;
  purchaseTimeMillis: string | null;
  purchaseType: number | null;  // 0 테스트 · 1 프로모 · 2 리워드. **없으면 실구매**
  productId?: string;
};

export type PlayFetch =
  | { ok: true; purchase: PlayProductPurchase }
  | { ok: false; reason: 'NOT_FOUND' | 'AUTH_FAILED' | 'UNAVAILABLE' };

/**
 * `purchases.products.get` — **권위 있는 상태**.
 *
 * ⚠ 클라이언트가 보낸 productId 를 그대로 믿지 않는다. 응답의 `productId` 를 함께 돌려주어
 *   호출부가 대조할 수 있게 한다 — 다른 상품의 토큰으로 비싼 상품을 받아 가는 것을 막는 자리다.
 */
export async function getProductPurchase(
  cfg: PlayConfig, token: string, productId: string, purchaseToken: string,
): Promise<PlayFetch> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/`
    + `${encodeURIComponent(cfg.packageName)}/purchases/products/`
    + `${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 404 || res.status === 400) return { ok: false, reason: 'NOT_FOUND' };
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'AUTH_FAILED' };
    if (!res.ok) return { ok: false, reason: 'UNAVAILABLE' };
    const j = await res.json() as Record<string, unknown>;
    return {
      ok: true,
      purchase: {
        purchaseState: Number(j.purchaseState ?? -1),
        consumptionState: Number(j.consumptionState ?? -1),
        acknowledgementState: Number(j.acknowledgementState ?? -1),
        orderId: typeof j.orderId === 'string' ? j.orderId : null,
        purchaseTimeMillis: typeof j.purchaseTimeMillis === 'string' ? j.purchaseTimeMillis : null,
        purchaseType: j.purchaseType === undefined ? null : Number(j.purchaseType),
        productId: typeof j.productId === 'string' ? j.productId : productId,
      },
    };
  } catch {
    return { ok: false, reason: 'UNAVAILABLE' };
  }
}

/**
 * 승인(acknowledge). ⚠ **3일 안에 승인되지 않으면 구글이 자동 환불한다.**
 * 소비는 클라이언트(Billing Library)가 하지만, 승인을 서버가 먼저 해 두면
 * 소비가 실패해도 환불로 되돌아가지 않는다.
 *
 * 이미 승인된 토큰에 다시 부르면 Play 가 400 을 준다 — 그것은 **실패가 아니다.**
 */
export async function acknowledgeProduct(
  cfg: PlayConfig, token: string, productId: string, purchaseToken: string,
): Promise<'ok' | 'already' | 'failed'> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/`
    + `${encodeURIComponent(cfg.packageName)}/purchases/products/`
    + `${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) return 'ok';
    // ⚠ 2026-09-21: 예전에는 **모든 400** 을 "이미 승인됨" 으로 봤다. 다른 까닭의 400(잘못된 상품 id 등)도
    //   승인 완료로 기록돼 재시도 크론이 다시 시도하지 않았고, 승인되지 않은 구매는 3일 뒤 자동 환불됐다.
    //   구글이 말한 까닭을 읽어 **이미 승인된 경우만** 'already' 로 본다.
    if (res.status === 400) {
      const body = await res.text().catch(() => '');
      return /already\s*been\s*acknowledged|alreadyAcknowledged/i.test(body) ? 'already' : 'failed';
    }
    return 'failed';
  } catch {
    return 'failed';
  }
}

/** 취소·환불된 구매 목록. RTDN 이 온 뒤 **권위 있는 상태**를 여기서 확인한다. */
export type VoidedPurchase = { purchaseToken: string; orderId: string | null; voidedTimeMillis: string | null };

export async function listVoidedPurchases(
  cfg: PlayConfig, token: string, startTimeMillis?: number,
): Promise<VoidedPurchase[] | null> {
  const qs = new URLSearchParams({ type: '1' }); // 1 = 상품(구독 아님)까지 포함
  if (startTimeMillis) qs.set('startTime', String(startTimeMillis));
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/`
    + `${encodeURIComponent(cfg.packageName)}/purchases/voidedpurchases?${qs.toString()}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const j = await res.json() as { voidedPurchases?: Record<string, unknown>[] };
    return (j.voidedPurchases ?? []).map((v) => ({
      purchaseToken: String(v.purchaseToken ?? ''),
      orderId: typeof v.orderId === 'string' ? v.orderId : null,
      voidedTimeMillis: typeof v.voidedTimeMillis === 'string' ? v.voidedTimeMillis : null,
    })).filter((v) => v.purchaseToken.length > 0);
  } catch {
    return null;
  }
}

/**
 * ⚠ Pub/Sub push 인증. 구글이 보낸 것인지 확인한다.
 *
 * push 구독에 OIDC 토큰을 붙이도록 설정하면 `Authorization: Bearer <id_token>` 이 온다.
 * 그 토큰을 구글의 tokeninfo 로 검증하고 **audience 가 우리가 정한 값**인지 본다.
 * `GOOGLE_RTDN_AUDIENCE` 가 설정돼 있지 않으면 **검증할 수 없으므로 처리하지 않는다.**
 */
export async function verifyPubSubPush(req: Request): Promise<'ok' | 'not_configured' | 'rejected'> {
  const audience = (Deno.env.get('GOOGLE_RTDN_AUDIENCE') ?? '').trim();
  const expectedEmail = (Deno.env.get('GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL') ?? '').trim();
  if (audience.length === 0) return 'not_configured';

  const auth = req.headers.get('Authorization') ?? '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return 'rejected';
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(m[1])}`);
    if (!res.ok) return 'rejected';
    const j = await res.json() as { aud?: string; email?: string; email_verified?: string | boolean };
    if (j.aud !== audience) return 'rejected';
    if (expectedEmail.length > 0 && j.email !== expectedEmail) return 'rejected';
    return 'ok';
  } catch {
    return 'rejected';
  }
}
