// Google Real-Time Developer Notifications (RTDN) — 환불·취소 처리. **구현 2026-09-11.**
//
// Pub/Sub 가 `{ message: { data: base64 } }` 를 POST 한다.
//
// ⚠ 결제 안전 원칙 (지시서, 설계서보다 우선)
//   5. 환불·취소는 RTDN 과 취소된 구매 조회로 받아, 기존 `record_revocation` 으로 처리한다
//      (잔액만큼 회수하고 나머지는 `duk_debt`).
//   6. **RTDN 요청이 구글이 보낸 것인지 검증한다** (Pub/Sub push OIDC 토큰).
//      검증에 실패한 요청은 **무시하고 기록한다.**
//
// ⚠ 통지 내용을 믿지 않는다. 통지는 **변화 신호**일 뿐이고, 권위 있는 상태는
//   Play Developer API 로 다시 물어본다. 그러지 않으면 위조 통지로 덕을 회수할 수 있다.
//
// ⚠ Pub/Sub 는 non-2xx 에 재시도한다. 그래서 멱등성이 필수다 —
//   `record_revocation` 이 `external_revocation_id` 유니크로 한 번만 처리한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { accessToken, listVoidedPurchases, readPlayConfig, verifyPubSubPush } from '../_shared/googlePlay.ts';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

/** RTDN 봉투. `voidedPurchaseNotification` 이 환불·취소다. */
type Rtdn = {
  packageName?: string;
  eventTimeMillis?: string;
  voidedPurchaseNotification?: { purchaseToken?: string; orderId?: string; productType?: number; refundType?: number };
  oneTimeProductNotification?: { purchaseToken?: string; sku?: string; notificationType?: number };
  testNotification?: { version?: string };
};

function decode(dataB64: string): Rtdn | null {
  try {
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0)))) as Rtdn;
  } catch {
    return null;
  }
}

/** 위조·미인증 요청을 기록한다. 조용히 버리면 공격을 관측할 수 없다. */
async function logRejected(admin: ReturnType<typeof createClient> | null, reason: string, detail: string) {
  if (!admin) return;
  await admin.from('admin_audit_log')
    .insert({ action: 'rtdn_rejected', target_type: 'iap', detail: `${reason}: ${detail}`.slice(0, 500) })
    .then(() => undefined, () => undefined);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const admin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

  // ── 원칙 6 — 구글이 보낸 것인가 ───────────────────────────────────────────
  const auth = await verifyPubSubPush(req);
  if (auth === 'not_configured') {
    // ⚠ 검증할 수 없으면 **처리하지 않는다.** 200 을 주면 Pub/Sub 가 "처리됨" 으로 알고
    //   재시도를 멈춘다 — 설정이 끝난 뒤에도 그 통지는 영영 오지 않는다. 503 으로 남긴다.
    await logRejected(admin, 'NOT_CONFIGURED', 'GOOGLE_RTDN_AUDIENCE 미설정');
    return json({ error: 'NOT_CONFIGURED' }, 503);
  }
  if (auth === 'rejected') {
    await logRejected(admin, 'AUTH_REJECTED', (req.headers.get('Authorization') ?? '').slice(0, 24));
    // 위조 요청에는 재시도를 유도하지 않는다. 403 이면 Pub/Sub 도 포기한다.
    return json({ error: 'FORBIDDEN' }, 403);
  }

  let body: { message?: { data?: unknown; messageId?: unknown } };
  try { body = await req.json(); } catch { return json({ error: 'INVALID_INPUT' }, 400); }
  if (!body.message || typeof body.message.data !== 'string') return json({ error: 'INVALID_INPUT' }, 400);

  const rtdn = decode(body.message.data);
  if (!rtdn) return json({ error: 'INVALID_INPUT' }, 400);

  // 구글이 보내는 연결 확인 통지. 처리할 것이 없고 ACK 해야 한다.
  if (rtdn.testNotification) return json({ ok: true, kind: 'test' });

  const cfg = readPlayConfig();
  if (!cfg || !admin) {
    await logRejected(admin, 'NOT_CONFIGURED', 'GOOGLE_PLAY_* 미설정');
    return json({ error: 'NOT_CONFIGURED' }, 503);
  }
  // ⚠ 다른 앱의 통지가 우리 엔드포인트로 오면 무시한다.
  if (rtdn.packageName && rtdn.packageName !== cfg.packageName) {
    await logRejected(admin, 'PACKAGE_MISMATCH', String(rtdn.packageName));
    return json({ ok: true, kind: 'ignored' });
  }

  const voided = rtdn.voidedPurchaseNotification;
  if (!voided || typeof voided.purchaseToken !== 'string') {
    // 환불이 아닌 통지(구매·보류 해제 등)는 여기서 아무 것도 하지 않는다.
    // 지급은 `verify-purchase` 가 클라이언트 흐름에서 하고, 보류 해제는 다음 실행이 잡는다.
    return json({ ok: true, kind: 'noop' });
  }

  // ── 권위 있는 상태를 다시 확인한다 (통지 내용을 믿지 않는다) ───────────────
  const token = await accessToken(cfg);
  if (!token) return json({ error: 'NOT_CONFIGURED' }, 503);
  const since = Number(rtdn.eventTimeMillis ?? 0);
  const list = await listVoidedPurchases(cfg, token, since > 0 ? since - 86_400_000 : undefined);
  if (list === null) return json({ error: 'UPSTREAM_UNAVAILABLE' }, 503); // Pub/Sub 재시도 유도
  const confirmed = list.some((v) => v.purchaseToken === voided.purchaseToken);
  if (!confirmed) {
    // 통지는 왔는데 구글의 취소 목록에 없다 → 위조이거나 아직 반영 전.
    // ⚠ 회수하지 않는다. 재시도되게 둔다.
    await logRejected(admin, 'NOT_IN_VOIDED_LIST', voided.purchaseToken.slice(0, 16));
    return json({ error: 'NOT_CONFIRMED' }, 503);
  }

  // ── 우리 원장에서 그 구매를 찾는다 ────────────────────────────────────────
  const { data: found, error: findErr } = await admin.rpc('find_purchase_by_token', {
    p_purchase_token: voided.purchaseToken,
  });
  if (findErr) return json({ error: 'SERVICE_UNAVAILABLE' }, 503);
  const row = ((found ?? []) as { external_transaction_id?: string; user_id?: string; granted_duk?: number }[])[0];
  if (!row?.user_id) {
    // 우리가 지급한 적 없는 구매다. 회수할 것이 없다 — ACK 하고 끝낸다.
    return json({ ok: true, kind: 'unknown_purchase' });
  }

  // ── 회수 (원칙 5). 잔액만큼 회수하고 나머지는 duk_debt ────────────────────
  //    ⚠ 멱등: 같은 external_revocation_id 는 한 번만 처리된다.
  const revocationId = `google:${voided.orderId ?? voided.purchaseToken}`;
  const { data: rev, error: revErr } = await admin.rpc('record_revocation', {
    p_user_id: row.user_id,
    p_external_revocation_id: revocationId,
    p_external_transaction_id: row.external_transaction_id ?? voided.purchaseToken,
    p_amount: Math.max(1, Number(row.granted_duk ?? 0)),
  });
  if (revErr) return json({ error: 'SERVICE_UNAVAILABLE' }, 503);

  const r = (rev ?? {}) as { already?: boolean; reversed?: number; debt?: number };
  return json({
    ok: true,
    kind: 'voided',
    already: r.already === true,
    reversed: Number(r.reversed ?? 0),
    debt: Number(r.debt ?? 0),
  });
});
