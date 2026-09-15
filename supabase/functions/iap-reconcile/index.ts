// iap-reconcile — 승인 재시도와 3일 감시 (결제 안전 원칙 4).
//
// 왜 필요한가
//   "지급 후 소비가 실패하면 재시도한다. **3일 안에 승인·소비되지 않으면 구글이 자동
//    환불하므로**, 재시도와 감시 경로가 있어야 한다."
//
//   `verify-purchase` 는 지급 직후 승인을 시도한다. 그 한 번이 실패하는 경우가 있다 —
//   네트워크, 구글 일시 오류, 워커 종료. 그때 아무도 다시 시도하지 않으면 **3일 뒤에
//   사용자 돈이 환불되고 우리는 이미 덕을 준 상태**가 된다(= duk_debt 로 남는다).
//   그 창을 이 워커가 지킨다.
//
// ⚠ 기존 `retry-*` 워커와 **같은 패턴**이다: `CRON_SECRET` 헤더 인증, fail-closed,
//   설정이 없으면 아무 것도 하지 않고 그렇게 말한다. 새 패턴을 만들지 않았다.
//
// ⚠ 소비(consume)는 클라이언트(Play Billing)가 한다. 서버는 소비할 수 없다.
//   그래서 서버가 지키는 것은 **승인**이고, 승인이 끝나면 자동 환불은 일어나지 않는다.
//   소비 실패는 앱이 다시 열릴 때 복구 스캔이 처리한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { accessToken, acknowledgeProduct, readPlayConfig } from '../_shared/googlePlay.ts';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

function authorized(req: Request): boolean {
  const secret = Deno.env.get('CRON_SECRET');
  return Boolean(secret) && req.headers.get('x-cron-secret') === secret;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!authorized(req)) return json({ error: 'UNAUTHORIZED' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceKey) return json({ error: 'SERVICE_UNAVAILABLE' }, 503);
  const admin = createClient(supabaseUrl, serviceKey);

  const cfg = readPlayConfig();
  if (!cfg) {
    // ⚠ 설정이 없으면 **없다고 말한다.** 0건 처리를 "할 일이 없었다" 로 보이게 하지 않는다.
    return json({ ok: true, status: 'NOT_CONFIGURED', scanned: 0, acknowledged: 0 });
  }
  const token = await accessToken(cfg);
  if (!token) return json({ ok: true, status: 'NOT_CONFIGURED', scanned: 0, acknowledged: 0 });

  const { data, error } = await admin.rpc('iap_pending_acknowledgements', { p_limit: 50 });
  if (error) return json({ error: 'SERVICE_UNAVAILABLE' }, 503);

  const rows = (data ?? []) as {
    external_transaction_id: string; purchase_token: string; store_product_id: string;
    created_at: string; retry_count: number;
  }[];

  let ok = 0;
  let failed = 0;
  for (const r of rows) {
    if (!r.purchase_token || !r.store_product_id) { failed++; continue; }
    const result = await acknowledgeProduct(cfg, token, r.store_product_id, r.purchase_token);
    const succeeded = result === 'ok' || result === 'already';
    if (succeeded) ok++; else failed++;
    await admin.rpc('record_acknowledge_attempt', {
      p_external_transaction_id: r.external_transaction_id,
      p_succeeded: succeeded,
    }).then(() => undefined, () => undefined);
  }

  return json({ ok: true, status: 'RAN', scanned: rows.length, acknowledged: ok, failed });
});
