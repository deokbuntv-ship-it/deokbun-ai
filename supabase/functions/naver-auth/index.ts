// DeokbunAI — naver-auth Edge Function (PATH B: trusted Naver→Supabase bridge)
//
// WHY THIS EXISTS: Naver is not a Supabase provider and its /v1/nid/me userinfo
// nests identity under `response.id`, which Supabase's custom OAuth2 cannot map
// (verified). So this server-trusted function performs the Naver code exchange
// itself and establishes a real Supabase session via the ONLY officially-supported
// server path (there is NO admin.createSession):
//   Naver code → token (client_secret) → /v1/nid/me → normalize → find-or-create
//   user (admin) → generateLink(magiclink) → verifyOtp → { access_token, refresh_token }.
//
// SECURITY (directive §2/§10):
// - NAVER_CLIENT_SECRET + SUPABASE_SERVICE_ROLE_KEY are read ONLY here (Deno env),
//   never in the client bundle. The client only ever receives Supabase tokens.
// - verify_jwt = false (pre-session endpoint; see supabase/config.toml). Trust comes
//   from the successful Naver code exchange + state, NOT from a Supabase JWT.
// - CSRF: `state` is passed to Naver's token endpoint, which rejects a mismatch
//   (the client also validates the state round-trip before calling this).
// - NEVER auto-merge by email (account-takeover guard): an email that already
//   belongs to a different account is a CONFLICT (403), never a silent login.
// - Email is REQUIRED (GoTrue rejects email-less createUser; magiclink needs email).
//   A Naver user who declined email fails closed (422) — NO fabricated email.
// - Logging: only failure STAGE markers via console.error. NEVER the Naver code,
//   the Naver token, hashed_token, the Supabase tokens, email, or the raw profile.
//
// This file is self-contained (Supabase deploys the function folder); the inline
// `normalizeNaverProfile` / `decideNaverLink` MIRROR the tested contracts in
// src/features/auth/naver/{naverProfile,naverIdentity}.ts. Owner must deploy this
// and set NAVER_CLIENT_ID / NAVER_CLIENT_SECRET as Edge secrets.

import { createClient } from 'npm:@supabase/supabase-js';

const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';
const NAVER_PROFILE_URL = 'https://openapi.naver.com/v1/nid/me';

const corsHeaders: Record<string, string> = {
  // Public endpoint; trust is the Naver code exchange, not CORS. functions.invoke
  // sends the anon apikey header (no cookies), so '*' is safe here.
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

// ---- Mirror of src/features/auth/naver/naverProfile.ts (tested there) ----------
function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}
type NaverProfile = { naverId: string; email: string | null; name: string | null };
function normalizeNaverProfile(
  raw: unknown,
): { ok: true; profile: NaverProfile } | { ok: false } {
  if (!raw || typeof raw !== 'object') return { ok: false };
  const root = raw as { resultcode?: unknown; response?: unknown };
  if (readString(root.resultcode) !== '00') return { ok: false };
  if (!root.response || typeof root.response !== 'object') return { ok: false };
  const response = root.response as Record<string, unknown>;
  const naverId = readString(response.id);
  if (!naverId) return { ok: false };
  return {
    ok: true,
    profile: {
      naverId,
      email: readString(response.email),
      name: readString(response.name),
    },
  };
}

// ---- Mirror of src/features/auth/naver/naverIdentity.ts (tested there) ---------
type LinkDecision =
  | { action: 'create' }
  | { action: 'proceed'; userId: string }
  | { action: 'conflict' };
function decideNaverLink(
  existing: { id: string; appMetadataNaverId: string | null } | null,
  naverId: string,
): LinkDecision {
  if (!existing) return { action: 'create' };
  if (existing.appMetadataNaverId && existing.appMetadataNaverId === naverId) {
    return { action: 'proceed', userId: existing.id };
  }
  return { action: 'conflict' };
}

function readConfig() {
  return {
    naverClientId: Deno.env.get('NAVER_CLIENT_ID')?.trim() ?? '',
    naverClientSecret: Deno.env.get('NAVER_CLIENT_SECRET')?.trim() ?? '',
    supabaseUrl: Deno.env.get('SUPABASE_URL')?.trim() ?? '',
    serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '',
  };
}

// GoTrue admin has no getUserByEmail; listUsers is paginated. Bounded scan (V1
// user counts). Returns the matching user or null.
async function findUserByEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<{ id: string; appMetadataNaverId: string | null } | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 30; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users ?? [];
    const match = users.find((u) => (u.email ?? '').toLowerCase() === target);
    if (match) {
      const meta = (match.app_metadata ?? {}) as { naver_id?: unknown };
      return {
        id: match.id,
        appMetadataNaverId: typeof meta.naver_id === 'string' ? meta.naver_id : null,
      };
    }
    if (users.length < 200) break; // last page reached
  }
  return null;
}

async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });

  const cfg = readConfig();
  if (!cfg.naverClientId || !cfg.naverClientSecret || !cfg.supabaseUrl || !cfg.serviceRoleKey) {
    console.error('naver-auth: SERVER_NOT_CONFIGURED');
    return json(500, { error: 'SERVER_NOT_CONFIGURED' });
  }

  let body: { code?: unknown; state?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'BAD_REQUEST' });
  }
  const code = typeof body.code === 'string' ? body.code : '';
  const state = typeof body.state === 'string' ? body.state : '';
  if (!code || !state) return json(400, { error: 'MISSING_CODE_OR_STATE' });

  // 1) Naver code → access token (client_secret server-only; state forwarded for CSRF).
  let naverAccessToken = '';
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: cfg.naverClientId,
      client_secret: cfg.naverClientSecret,
      code,
      state,
    });
    const res = await fetch(`${NAVER_TOKEN_URL}?${params.toString()}`, { method: 'GET' });
    if (!res.ok) {
      console.error('naver-auth: token exchange HTTP', res.status);
      return json(401, { error: 'NAVER_TOKEN_EXCHANGE_FAILED' });
    }
    const tokenJson = (await res.json()) as { access_token?: unknown; error?: unknown };
    naverAccessToken = typeof tokenJson.access_token === 'string' ? tokenJson.access_token : '';
    if (!naverAccessToken || tokenJson.error) {
      console.error('naver-auth: token exchange rejected');
      return json(401, { error: 'NAVER_TOKEN_EXCHANGE_FAILED' });
    }
  } catch {
    return json(502, { error: 'NAVER_TOKEN_EXCHANGE_FAILED' });
  }

  // 2) Naver profile.
  let profileRaw: unknown;
  try {
    const res = await fetch(NAVER_PROFILE_URL, {
      headers: { Authorization: `Bearer ${naverAccessToken}` },
    });
    if (!res.ok) {
      console.error('naver-auth: profile HTTP', res.status);
      return json(502, { error: 'NAVER_PROFILE_FAILED' });
    }
    profileRaw = await res.json();
  } catch {
    return json(502, { error: 'NAVER_PROFILE_FAILED' });
  }

  const normalized = normalizeNaverProfile(profileRaw);
  if (!normalized.ok) {
    console.error('naver-auth: profile invalid');
    return json(502, { error: 'NAVER_PROFILE_INVALID' });
  }
  const { naverId, email, name } = normalized.profile;

  // 3) Email required — no fabricated email (§4). Fail closed.
  if (!email) return json(422, { error: 'EMAIL_REQUIRED' });

  const admin = createClient(cfg.supabaseUrl, cfg.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 4) Find-or-create with the takeover guard.
  let existing: { id: string; appMetadataNaverId: string | null } | null;
  try {
    existing = await findUserByEmail(admin, email);
  } catch {
    console.error('naver-auth: user lookup failed');
    return json(500, { error: 'USER_LOOKUP_FAILED' });
  }

  const decision = decideNaverLink(existing, naverId);
  if (decision.action === 'conflict') {
    // Email belongs to a different account → never auto-merge (§10).
    return json(403, { error: 'ACCOUNT_CONFLICT' });
  }

  let userId = '';
  if (decision.action === 'proceed') {
    userId = decision.userId;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { provider: 'naver', naver_id: naverId },
      user_metadata: name ? { full_name: name } : {},
    });
    if (createErr || !created?.user) {
      console.error('naver-auth: create user failed');
      return json(500, { error: 'USER_CREATE_FAILED' });
    }
    userId = created.user.id;
  }
  void userId; // (kept for future audit/telemetry; session is email-scoped below)

  // 5) Mint a Supabase session (generateLink magiclink → verifyOtp). No token logs.
  let hashedToken = '';
  try {
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    const props = link?.properties as { hashed_token?: unknown } | undefined;
    hashedToken = typeof props?.hashed_token === 'string' ? props.hashed_token : '';
    if (linkErr || !hashedToken) {
      console.error('naver-auth: generateLink failed');
      return json(500, { error: 'LINK_FAILED' });
    }
  } catch {
    return json(500, { error: 'LINK_FAILED' });
  }

  try {
    const { data: verified, error: verifyErr } = await admin.auth.verifyOtp({
      token_hash: hashedToken,
      type: 'magiclink',
    });
    const session = verified?.session;
    if (verifyErr || !session?.access_token || !session?.refresh_token) {
      console.error('naver-auth: verifyOtp failed');
      return json(500, { error: 'SESSION_FAILED' });
    }
    return json(200, {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } catch {
    return json(500, { error: 'SESSION_FAILED' });
  }
}

export default {
  fetch: (req: Request) =>
    handle(req).catch(() => json(500, { error: 'INTERNAL' })),
};
