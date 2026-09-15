// DeokbunAI — Site rebuild trigger (S8).
//
// Publishing a 유명인 changes the database instantly, but the public site is PRE-RENDERED HTML
// (`web.output: "static"`). Until a new build runs, a crawler downloads the old file — so a page
// that a human can see is still invisible to search. The owner's requirement is "press publish and
// nothing else", so publishing has to start the rebuild itself.
//
// WHY AN EDGE FUNCTION AND NOT THE CLIENT: the Vercel Deploy Hook URL is a SECRET — anyone holding
// it can start unlimited builds. It lives as an Edge secret (`VERCEL_DEPLOY_HOOK_URL`) and never
// reaches the browser. Admin membership is checked here, server-side, before the call.
//
// FAIL-OPEN, NEVER SILENT. A rebuild failure must not fail the publish — the content is already
// saved and correct. But it must not disappear either: every outcome is written to
// `site_deploy_requests` and returned to the caller so the admin screen can say what happened.
//
// COOLDOWN. A Vercel build takes minutes. Publishing several people in a row must not queue several
// builds; a build that starts later picks up everything committed before it. Inside the cooldown we
// return `skipped` — that is a correct outcome, not an error.
//
// Security mirrors famous-suggest: verify_jwt + admin_users membership, server-side secret.
// Runtime: Deno (excluded from app tsc).

import { withSupabase } from 'npm:@supabase/server@1.4.1';
import { createClient } from 'npm:@supabase/supabase-js';

// Long enough that a burst of edits collapses into one build, short enough that a single publish
// feels immediate. A build takes 2-5 minutes, so anything below that just queues work.
const COOLDOWN_SECONDS = 180;

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';
  if (url.length === 0 || key.length === 0) return null;
  return createClient(url, key);
}

function userIdFromRequest(req: Request): string | null {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { sub?: unknown };
    return typeof decoded.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
}

async function isAdminUser(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const admin = serviceClient();
  if (!admin) return false;
  try {
    const { data, error } = await admin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    return !error && data !== null;
  } catch {
    return false;
  }
}

type Outcome = 'requested' | 'skipped' | 'failed';

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req: Request, _ctx: unknown): Promise<Response> => {
      const userId = userIdFromRequest(req);

      // The log write must never change the answer the caller gets.
      const record = async (
        status: Outcome,
        reason: string,
        providerStatus: number | null,
        detail: string | null,
      ) => {
        try {
          const admin = serviceClient();
          if (!admin) return;
          await admin.from('site_deploy_requests').insert({
            reason,
            status,
            provider_status: providerStatus,
            detail,
            requested_by: userId,
          });
        } catch {
          /* logging never affects the response */
        }
      };

      if (req.method !== 'POST') {
        return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
      }
      if (!(await isAdminUser(userId))) {
        return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
      }

      let reason = 'manual';
      try {
        const body = (await req.json()) as { reason?: unknown } | null;
        if (typeof body?.reason === 'string' && body.reason.trim().length > 0) {
          reason = body.reason.trim().slice(0, 120);
        }
      } catch {
        /* body is optional */
      }

      const admin = serviceClient();
      if (!admin) {
        return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
      }

      // ── Cooldown ────────────────────────────────────────────────────────────────────────────
      // A build already on its way will pick up this change too. Saying so is the honest answer.
      const since = new Date(Date.now() - COOLDOWN_SECONDS * 1000).toISOString();
      try {
        const { data: recent } = await admin
          .from('site_deploy_requests')
          .select('created_at')
          .eq('status', 'requested')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (recent) {
          await record('skipped', reason, null, 'cooldown — a build requested moments ago covers this change');
          return Response.json({
            outcome: 'skipped',
            cooldownSeconds: COOLDOWN_SECONDS,
            message: '이미 사이트 재생성이 요청되어 있어요. 방금 저장한 내용도 그 빌드에 함께 반영됩니다.',
          });
        }
      } catch {
        // A cooldown read failure should not block a rebuild — fall through and trigger.
      }

      // ── Deploy hook ─────────────────────────────────────────────────────────────────────────
      const hookUrl = Deno.env.get('VERCEL_DEPLOY_HOOK_URL')?.trim() ?? '';
      if (hookUrl.length === 0) {
        // ⚠ NOT an error, and NOT silent. The content is published and correct; only the public
        // static page will lag until someone builds. The caller shows this verbatim.
        await record('skipped', reason, null, 'VERCEL_DEPLOY_HOOK_URL not configured');
        return Response.json({
          outcome: 'skipped',
          configured: false,
          message: '발행은 저장됐지만 사이트 재생성이 설정되지 않았습니다 (배포 훅 미설정). 검색 노출은 다음 배포 후에 반영됩니다.',
        });
      }
      if (!/^https:\/\//.test(hookUrl)) {
        await record('failed', reason, null, 'hook URL is not https');
        return Response.json({ outcome: 'failed', message: '배포 훅 주소가 올바르지 않습니다 (https 아님).' }, { status: 500 });
      }

      let providerStatus: number | null = null;
      try {
        const res = await fetch(hookUrl, { method: 'POST' });
        providerStatus = res.status;
        if (!res.ok) {
          await record('failed', reason, providerStatus, `hook returned ${res.status}`);
          return Response.json({
            outcome: 'failed',
            providerStatus,
            message: `사이트 재생성 요청이 실패했습니다 (${res.status}). 발행 자체는 저장됐습니다.`,
          }, { status: 502 });
        }
      } catch (err) {
        await record('failed', reason, null, String(err).slice(0, 200));
        return Response.json({
          outcome: 'failed',
          message: '사이트 재생성 요청이 실패했습니다 (네트워크). 발행 자체는 저장됐습니다.',
        }, { status: 502 });
      }

      await record('requested', reason, providerStatus, null);
      return Response.json({
        outcome: 'requested',
        providerStatus,
        message: '사이트 재생성을 요청했습니다. 보통 2~5분 뒤 검색용 페이지에 반영됩니다.',
      });
    },
  ),
};
