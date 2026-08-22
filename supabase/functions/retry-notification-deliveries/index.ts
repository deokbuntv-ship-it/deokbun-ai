// retry-notification-deliveries Edge worker (Sprint J6 §6.4) — FAIL-CLOSED SEAM.
// Bounded-cadence re-attempt of PENDING push deliveries (retriable rows left by earlier runs / admin retries).
// Same send loop as run-scheduled-notifications minus the job step. CRON_SECRET-authenticated (fail closed);
// provider NOT_CONFIGURED by default → never marks SENT. EDGE_RUNTIME_NOT_EXECUTED here.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
function authorized(req: Request): boolean {
  const secret = Deno.env.get('CRON_SECRET');
  return Boolean(secret) && req.headers.get('x-cron-secret') === secret;
}
async function sendPush(token: string, title: string, body: string, data: Record<string, unknown>) {
  if (Deno.env.get('PUSH_PROVIDER') !== 'expo') return { ok: false, status: 'not_configured' as const };
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to: token, title, body, data }) });
    if (!res.ok) return { ok: false, status: 'error' as const };
    const out = await res.json();
    const status = out?.data?.status ?? out?.data?.[0]?.status;
    if (status === 'ok') return { ok: true, status: 'sent' as const };
    const detail = out?.data?.details?.error ?? out?.data?.[0]?.details?.error;
    return detail === 'DeviceNotRegistered' ? { ok: false, status: 'invalid_token' as const } : { ok: false, status: 'error' as const };
  } catch { return { ok: false, status: 'error' as const }; }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!authorized(req)) return json({ error: 'UNAUTHORIZED' }, 401);
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !serviceKey) return json({ error: 'NOT_CONFIGURED' }, 503);
  const db = createClient(url, serviceKey);
  const { data: claim } = await db.rpc('claim_pending_push_deliveries', { p_limit: 500 });
  const pending = Array.isArray(claim) ? claim : [];
  let sent = 0, failed = 0, retriable = 0, skipped = 0, notConfigured = 0;
  for (const d of pending) {
    if (!d.token) { await db.rpc('record_notification_delivery_result', { p_delivery_id: d.delivery_id, p_status: 'SKIPPED_NO_TOKEN' }); skipped++; continue; }
    const r = await sendPush(d.token, d.title ?? '덕분이', d.body ?? '', { target: d.deep_link_target, id: d.deep_link_id });
    const outcome = r.ok && r.status === 'sent' ? 'ok' : r.status === 'invalid_token' ? 'invalid_token' : r.status === 'not_configured' ? 'not_configured' : 'retryable';
    if (outcome === 'not_configured') { notConfigured++; continue; }
    const attempt = Number(d.attempt_count ?? 0) + 1;
    const status = outcome === 'ok' ? 'SENT' : outcome === 'invalid_token' ? 'FAILED' : attempt < 3 ? 'PENDING' : 'FAILED';
    await db.rpc('record_notification_delivery_result', { p_delivery_id: d.delivery_id, p_status: status, p_error_category: outcome === 'ok' ? null : outcome, p_disable_device_id: outcome === 'invalid_token' ? d.device_id : null });
    if (status === 'SENT') sent++; else if (status === 'PENDING') retriable++; else failed++;
  }
  return json({ push: { processed: pending.length, sent, failed, retriable, skipped, notConfigured } });
});
