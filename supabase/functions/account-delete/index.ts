// DeokbunAI — account-delete Edge Function (회원 탈퇴)
//
// WHY THIS EXISTS: deleting an account requires the auth admin API, which requires the
// SERVICE ROLE key. That key may only ever live server-side, so the deletion cannot happen
// in the client no matter how the UI is written.
//
// SECURITY
// - verify_jwt = true. On top of that the function VERIFIES the bearer itself and uses the
//   TOKEN'S user id. A body-supplied user id is never read — deleting somebody else's
//   account must be impossible even if the JWT check were ever relaxed (mirrors ad-track's
//   attribution branch, §51).
// - SUPABASE_SERVICE_ROLE_KEY is read only here (Deno env), never in the client bundle.
//
// ORDER OF OPERATIONS — this order is the whole design, do not reorder:
//   1. purge_account_data(user)  — snapshots 거래기록 + balances, releases holds, clears the
//      FK-less tables. MUST run first: step 3 destroys the rows it reads.
//   2. Apple revoke (best-effort) — before the auth row is gone, while identities are still
//      readable. A failure is logged and ignored (fail-open by contract).
//   3. auth.admin.deleteUser(user) — the actual deletion. Cascades to 36 tables.
//
// CRASH WINDOW: if 3 fails after 1 succeeded, the user still has a live account whose holds
// were released and whose snapshot row exists. Retrying is safe — purge_account_data returns
// ALREADY_RECORDED and writes nothing, and we proceed to 3 again. That is why the RPC is
// idempotent and why we do NOT treat ALREADY_RECORDED as an error.

import { createClient } from 'npm:@supabase/supabase-js';

import { revokeAppleGrant, type AppleRevokeOutcome } from './appleRevoke.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' });

  const bearer = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!bearer) return json(401, { ok: false, code: 'UNAUTHENTICATED' });

  const admin = serviceClient();

  // The ONLY source of the user id. Never the body.
  const { data: authData, error: authError } = await admin.auth.getUser(bearer);
  const user = authData?.user;
  if (authError || !user?.id) return json(401, { ok: false, code: 'UNAUTHENTICATED' });

  let body: { appleAuthorizationCode?: unknown; platform?: unknown } = {};
  try {
    body = (await req.json()) ?? {};
  } catch {
    body = {}; // an empty/broken body is fine — everything in it is optional
  }
  const appleCode = typeof body.appleAuthorizationCode === 'string' ? body.appleAuthorizationCode : null;
  const platform = body.platform === 'ios' ? 'ios' : 'web';

  // ── 1. snapshot + release + clean the FK-less tables ──────────────────────────────────
  const { data: purge, error: purgeError } = await admin.rpc('purge_account_data', {
    p_user_id: user.id,
  });
  if (purgeError) {
    console.error('[account-delete] purge failed', { code: purgeError.code });
    return json(500, { ok: false, code: 'PURGE_FAILED' });
  }

  // ── 2. provider grant revocation (best-effort; never blocks deletion) ─────────────────
  const usedApple = (user.identities ?? []).some((i) => i.provider === 'apple');
  let appleRevoke: AppleRevokeOutcome = 'SKIPPED_NO_CODE';
  if (usedApple) {
    appleRevoke = await revokeAppleGrant(appleCode, platform);
    if (appleRevoke !== 'REVOKED') {
      // Logged, not returned as a failure: a lingering Apple grant is a smaller harm than
      // refusing to delete an account the user asked to delete.
      console.warn('[account-delete] apple revoke not completed', { outcome: appleRevoke });
    }
  }

  // ── 3. the actual deletion — cascades to every `on delete cascade` table ──────────────
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('[account-delete] auth delete failed', { message: deleteError.message });
    // The snapshot row already exists; a retry is safe and idempotent (see CRASH WINDOW).
    return json(500, { ok: false, code: 'DELETE_FAILED', retryable: true });
  }

  console.info('[account-delete] deleted', {
    // user_ref is sha256(user_id) — safe to log, not reversible, not PII.
    userRef: (purge as { user_ref?: string } | null)?.user_ref ?? null,
    kind: (purge as { kind?: string } | null)?.kind ?? null,
    appleRevoke: usedApple ? appleRevoke : 'NOT_APPLE',
  });

  return json(200, { ok: true, code: 'DELETED', appleRevoke: usedApple ? appleRevoke : null });
});
