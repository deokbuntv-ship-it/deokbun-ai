// retry-email-deliveries Edge worker (Sprint J6 §6.4) — FAIL-CLOSED SEAM.
// Bounded-cadence re-attempt of PENDING email deliveries. Same send loop as run-email-campaigns minus the
// campaign-execution step. CRON_SECRET-authenticated (fail closed); provider NOT_CONFIGURED by default → never
// marks SENT. EDGE_RUNTIME_NOT_EXECUTED here.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
function authorized(req: Request): boolean {
  const secret = Deno.env.get('CRON_SECRET');
  return Boolean(secret) && req.headers.get('x-cron-secret') === secret;
}
async function sendEmail(to: string, subject: string, content: string) {
  const provider = Deno.env.get('EMAIL_PROVIDER');
  if (provider !== 'resend') return { ok: false, status: 'not_configured' as const };
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM');
  if (!key || !from) return { ok: false, status: 'not_configured' as const }; // fail closed without credentials
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text: content }),
    });
    if (res.ok) return { ok: true, status: 'sent' as const };
    if (res.status === 422 || res.status === 400) return { ok: false, status: 'invalid_email' as const };
    return { ok: false, status: 'error' as const };
  } catch { return { ok: false, status: 'error' as const }; }
}
function renderContent(subject: string, r: Record<string, unknown> | null): string {
  const j = r ?? {};
  return [String(j.headline ?? subject), String(j.overallSummary ?? ''), '앱에서 더 자세한 해석을 확인하세요.',
    '※ 덕분이는 AI를 활용해 해석과 상담을 제공합니다. AI가 생성한 내용은 실제와 다를 수 있어요.'].filter(Boolean).join('\n\n');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!authorized(req)) return json({ error: 'UNAUTHORIZED' }, 401);
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !serviceKey) return json({ error: 'NOT_CONFIGURED' }, 503);
  const db = createClient(url, serviceKey);
  const { data: claim } = await db.rpc('claim_pending_email_deliveries', { p_limit: 500 });
  const pending = Array.isArray(claim) ? claim : [];
  let sent = 0, failed = 0, retriable = 0, notConfigured = 0;
  for (const d of pending) {
    let resultJson: Record<string, unknown> | null = null;
    if (d.monthly_fortune_id) {
      const { data: mf } = await db.from('monthly_fortunes').select('result_json').eq('id', d.monthly_fortune_id).maybeSingle();
      resultJson = (mf?.result_json as Record<string, unknown>) ?? null;
    }
    const r = await sendEmail(d.email, d.subject, renderContent(d.subject, resultJson));
    const outcome = r.ok && r.status === 'sent' ? 'ok' : r.status === 'invalid_email' ? 'invalid_email' : r.status === 'not_configured' ? 'not_configured' : 'retryable';
    if (outcome === 'not_configured') { notConfigured++; continue; }
    const attempt = Number(d.attempt_count ?? 0) + 1;
    const status = outcome === 'ok' ? 'SENT' : outcome === 'invalid_email' ? 'SKIPPED_INVALID_EMAIL' : attempt < 3 ? 'PENDING' : 'FAILED';
    await db.rpc('record_email_delivery_result', { p_delivery_id: d.delivery_id, p_status: status, p_error_category: outcome === 'ok' ? null : outcome });
    if (status === 'SENT') sent++; else if (status === 'PENDING') retriable++; else failed++;
  }
  return json({ email: { processed: pending.length, sent, failed, retriable, notConfigured } });
});
