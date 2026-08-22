// run-scheduled-notifications Edge worker (Sprint J6 §6.4/§6.7) — FAIL-CLOSED SEAM.
//
// Cron-triggered (NOT a consumer action): authenticated by the CRON_SECRET header; without CRON_SECRET set it
// returns 401 and does nothing (fail closed). Flow: run the birthday job (business truth) → claim PENDING push
// deliveries → send via the configured push provider → record each outcome. The provider defaults to
// NOT_CONFIGURED (no PUSH_PROVIDER env) and NEVER marks a delivery SENT without a real send. Notification TRUTH
// is created by the DB job independent of push success. Mirrors the unit-tested pure worker
// (src/features/retention/push/pushWorker.ts). EDGE_RUNTIME_NOT_EXECUTED here (no local Deno / no deploy).
//
// Owner config (names only; set via `supabase secrets set`): CRON_SECRET (required to enable); PUSH_PROVIDER=expo
// to activate the Expo adapter. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided by the platform.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

function authorized(req: Request): boolean {
  const secret = Deno.env.get('CRON_SECRET');
  return Boolean(secret) && req.headers.get('x-cron-secret') === secret; // no secret set → false (fail closed)
}

type PushSend = { ok: boolean; status: 'sent' | 'not_configured' | 'invalid_token' | 'error' };

// Expo push adapter, behind PUSH_PROVIDER=expo. The ExponentPushToken is itself the target credential; we still
// gate on the flag so the worker is NOT_CONFIGURED by default. Never throws to the loop.
async function sendPush(token: string, title: string, body: string, data: Record<string, unknown>): Promise<PushSend> {
  if (Deno.env.get('PUSH_PROVIDER') !== 'expo') return { ok: false, status: 'not_configured' };
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to: token, title, body, data }),
    });
    if (!res.ok) return { ok: false, status: 'error' };
    const out = await res.json();
    const status = out?.data?.status ?? out?.data?.[0]?.status;
    if (status === 'ok') return { ok: true, status: 'sent' };
    const detail = out?.data?.details?.error ?? out?.data?.[0]?.details?.error;
    if (detail === 'DeviceNotRegistered') return { ok: false, status: 'invalid_token' };
    return { ok: false, status: 'error' };
  } catch { return { ok: false, status: 'error' }; }
}

function classify(r: PushSend): 'ok' | 'invalid_token' | 'not_configured' | 'retryable' {
  if (r.ok && r.status === 'sent') return 'ok';
  if (r.status === 'invalid_token') return 'invalid_token';
  if (r.status === 'not_configured') return 'not_configured';
  return 'retryable';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!authorized(req)) return json({ error: 'UNAUTHORIZED' }, 401); // fail closed

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !serviceKey) return json({ error: 'NOT_CONFIGURED' }, 503);
  const db = createClient(url, serviceKey);

  // 1. business truth: create today's birthday notifications (idempotent).
  const { data: jobResult, error: jobErr } = await db.rpc('run_birthday_notifications');
  if (jobErr) return json({ error: 'JOB_FAILED' }, 500);

  // 2. send PENDING push deliveries (truth already persisted; provider failure is isolated).
  const { data: claim } = await db.rpc('claim_pending_push_deliveries', { p_limit: 500 });
  const pending = Array.isArray(claim) ? claim : [];
  let sent = 0, failed = 0, retriable = 0, skipped = 0, notConfigured = 0;
  for (const d of pending) {
    if (!d.token) { await db.rpc('record_notification_delivery_result', { p_delivery_id: d.delivery_id, p_status: 'SKIPPED_NO_TOKEN' }); skipped++; continue; }
    const outcome = classify(await sendPush(d.token, d.title ?? '덕분이', d.body ?? '', { target: d.deep_link_target, id: d.deep_link_id }));
    if (outcome === 'not_configured') { notConfigured++; continue; } // leave PENDING; never SENT
    const attempt = Number(d.attempt_count ?? 0) + 1;
    const status = outcome === 'ok' ? 'SENT' : outcome === 'invalid_token' ? 'FAILED' : attempt < 3 ? 'PENDING' : 'FAILED';
    await db.rpc('record_notification_delivery_result', {
      p_delivery_id: d.delivery_id, p_status: status,
      p_error_category: outcome === 'ok' ? null : outcome,
      p_disable_device_id: outcome === 'invalid_token' ? d.device_id : null,
    });
    if (status === 'SENT') sent++; else if (status === 'PENDING') retriable++; else failed++;
  }
  return json({ job: jobResult, push: { processed: pending.length, sent, failed, retriable, skipped, notConfigured } });
});
