// run-email-campaigns Edge worker (Sprint J6 §6.4/§6.8) — FAIL-CLOSED SEAM.
//
// Cron-triggered; CRON_SECRET-authenticated (fail closed). Flow: execute due SCHEDULED campaigns (run_email_
// campaign builds recipients + PROCESSING) → claim PENDING email deliveries → render from the authoritative
// monthly_fortunes digest → send via the configured email provider → record each outcome. The provider defaults
// to NOT_CONFIGURED (no EMAIL_PROVIDER env) and NEVER marks SENT without a real send. Mirrors the unit-tested
// pure worker (src/features/fortune/email/emailWorker.ts). EDGE_RUNTIME_NOT_EXECUTED here.
//
// Owner config (names only): CRON_SECRET (required); EMAIL_PROVIDER + its credentials to activate real sends.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
function authorized(req: Request): boolean {
  const secret = Deno.env.get('CRON_SECRET');
  return Boolean(secret) && req.headers.get('x-cron-secret') === secret;
}

type EmailSend = { ok: boolean; status: 'sent' | 'not_configured' | 'invalid_email' | 'error' };
// No default vendor: without EMAIL_PROVIDER configured this is NOT_CONFIGURED and never marks SENT.
async function sendEmail(_to: string, _subject: string, _content: string): Promise<EmailSend> {
  if (!Deno.env.get('EMAIL_PROVIDER')) return { ok: false, status: 'not_configured' };
  // A concrete vendor adapter (e.g. Resend) attaches here behind its credential. Left unconfigured by design.
  return { ok: false, status: 'not_configured' };
}
function classify(r: EmailSend): 'ok' | 'invalid_email' | 'not_configured' | 'retryable' {
  if (r.ok && r.status === 'sent') return 'ok';
  if (r.status === 'invalid_email') return 'invalid_email';
  if (r.status === 'not_configured') return 'not_configured';
  return 'retryable';
}
function renderContent(subject: string, resultJson: Record<string, unknown> | null): string {
  const r = resultJson ?? {};
  const parts = [String(r.headline ?? subject), String(r.overallSummary ?? ''), '앱에서 더 자세한 해석을 확인하세요.',
    '※ 덕분이는 AI를 활용해 해석과 상담을 제공합니다. AI가 생성한 내용은 실제와 다를 수 있어요.'];
  return parts.filter(Boolean).join('\n\n');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!authorized(req)) return json({ error: 'UNAUTHORIZED' }, 401);
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !serviceKey) return json({ error: 'NOT_CONFIGURED' }, 503);
  const db = createClient(url, serviceKey);

  // 1. execute due SCHEDULED campaigns (idempotent; builds recipients + PROCESSING).
  const nowIso = new Date().toISOString();
  const { data: due } = await db.from('email_campaigns').select('id').eq('status', 'SCHEDULED').lte('scheduled_at', nowIso);
  for (const c of (due ?? [])) { await db.rpc('run_email_campaign', { p_campaign_id: c.id }); }

  // 2. send PENDING recipients (truth persisted; provider failure isolated).
  const { data: claim } = await db.rpc('claim_pending_email_deliveries', { p_limit: 500 });
  const pending = Array.isArray(claim) ? claim : [];
  let sent = 0, failed = 0, retriable = 0, notConfigured = 0;
  for (const d of pending) {
    let resultJson: Record<string, unknown> | null = null;
    if (d.monthly_fortune_id) {
      const { data: mf } = await db.from('monthly_fortunes').select('result_json').eq('id', d.monthly_fortune_id).maybeSingle();
      resultJson = (mf?.result_json as Record<string, unknown>) ?? null;
    }
    const outcome = classify(await sendEmail(d.email, d.subject, renderContent(d.subject, resultJson)));
    if (outcome === 'not_configured') { notConfigured++; continue; } // leave PENDING; never SENT
    const attempt = Number(d.attempt_count ?? 0) + 1;
    const status = outcome === 'ok' ? 'SENT' : outcome === 'invalid_email' ? 'SKIPPED_INVALID_EMAIL' : attempt < 3 ? 'PENDING' : 'FAILED';
    await db.rpc('record_email_delivery_result', { p_delivery_id: d.delivery_id, p_status: status, p_error_category: outcome === 'ok' ? null : outcome });
    if (status === 'SENT') sent++; else if (status === 'PENDING') retriable++; else failed++;
  }
  return json({ campaigns_run: (due ?? []).length, email: { processed: pending.length, sent, failed, retriable, notConfigured } });
});
