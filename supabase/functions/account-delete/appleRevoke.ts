// Apple token revocation for account deletion.
//
// WHY: Apple requires that deleting an account created with Sign in with Apple ALSO revokes
// the app's tokens (REST /auth/revoke). Leaving the grant alive means the user still sees
// 덕분이 under Settings → Apple ID → Sign in with Apple after they deleted their account.
//
// HOW WE GET A TOKEN — and why we do NOT store one.
//   Revocation needs a refresh_token (or access_token) for THIS user. Supabase does not
//   expose the Apple refresh token through the admin API, so a service could only have one by
//   persisting provider tokens at sign-in. We deliberately do not: a table of live Apple
//   refresh tokens is a standing credential store whose only purpose is one call at deletion.
//   Instead the CLIENT re-authorizes with Apple at deletion time (a system sheet the user
//   already expects before an irreversible action) and hands us a fresh `authorizationCode`,
//   which we exchange here for a refresh_token and immediately revoke. Nothing is stored.
//
// FAIL-OPEN BY CONTRACT. Every failure returns a reason string; the caller logs it and
// continues deleting. A revoke failure must never strand a user in an account they asked to
// delete — that is a worse outcome than a lingering Apple grant.
//
// CONFIG (Edge secrets; all four required, else SKIPPED_NOT_CONFIGURED):
//   APPLE_SERVICE_ID   — the Service ID used as `aud` for the web flow (e.g. com.deokbun.app.web)
//   APPLE_TEAM_ID      — 10-char Apple Developer team id
//   APPLE_KEY_ID       — the .p8 key's Key ID
//   APPLE_PRIVATE_KEY  — the .p8 contents (PEM, newlines may be literal "\n")
// Optional:
//   APPLE_BUNDLE_ID    — the native App ID; native codes carry this as `aud`, not the Service ID.

export type AppleRevokeOutcome =
  | 'REVOKED'
  | 'SKIPPED_NO_CODE'
  | 'SKIPPED_NOT_CONFIGURED'
  | 'EXCHANGE_FAILED'
  | 'REVOKE_FAILED'
  | 'SIGNING_FAILED';

const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
const APPLE_REVOKE_URL = 'https://appleid.apple.com/auth/revoke';

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToPkcs8(pem: string): Uint8Array {
  // Accept both real newlines and the "\n"-escaped form secrets managers often produce.
  const body = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const raw = atob(body);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Apple's client_secret is an ES256 JWT signed with the .p8 key. Max lifetime is 6 months;
 * we mint a 5-minute one per call because it is used exactly twice and then thrown away.
 */
async function makeClientSecret(cfg: AppleConfig, audienceClientId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: cfg.keyId };
  const payload = {
    iss: cfg.teamId,
    iat: now,
    exp: now + 300,
    aud: 'https://appleid.apple.com',
    sub: audienceClientId,
  };
  const enc = new TextEncoder();
  const signingInput = `${b64url(enc.encode(JSON.stringify(header)))}.${b64url(enc.encode(JSON.stringify(payload)))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(cfg.privateKey),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    enc.encode(signingInput),
  );
  return `${signingInput}.${b64url(new Uint8Array(sig))}`;
}

type AppleConfig = { serviceId: string; bundleId: string | null; teamId: string; keyId: string; privateKey: string };

function readConfig(): AppleConfig | null {
  const serviceId = Deno.env.get('APPLE_SERVICE_ID') ?? '';
  const teamId = Deno.env.get('APPLE_TEAM_ID') ?? '';
  const keyId = Deno.env.get('APPLE_KEY_ID') ?? '';
  const privateKey = Deno.env.get('APPLE_PRIVATE_KEY') ?? '';
  if (!serviceId || !teamId || !keyId || !privateKey) return null;
  return { serviceId, bundleId: Deno.env.get('APPLE_BUNDLE_ID') || null, teamId, keyId, privateKey };
}

/**
 * Exchange the one-time authorization code for a refresh token, then revoke it.
 * `platform` picks the audience: a code minted by the iOS system sheet is issued to the App ID,
 * a code from the web flow to the Service ID. Sending the wrong one yields invalid_client.
 */
export async function revokeAppleGrant(
  authorizationCode: string | null | undefined,
  platform: 'ios' | 'web',
): Promise<AppleRevokeOutcome> {
  if (!authorizationCode) return 'SKIPPED_NO_CODE';
  const cfg = readConfig();
  if (!cfg) return 'SKIPPED_NOT_CONFIGURED';

  const clientId = platform === 'ios' ? (cfg.bundleId ?? cfg.serviceId) : cfg.serviceId;

  let clientSecret: string;
  try {
    clientSecret = await makeClientSecret(cfg, clientId);
  } catch {
    return 'SIGNING_FAILED'; // malformed .p8 — an owner-config problem, not a user problem
  }

  let refreshToken: string;
  try {
    const res = await fetch(APPLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authorizationCode,
        grant_type: 'authorization_code',
      }),
    });
    if (!res.ok) return 'EXCHANGE_FAILED';
    const body = (await res.json()) as { refresh_token?: string; access_token?: string };
    const token = body.refresh_token ?? body.access_token;
    if (!token) return 'EXCHANGE_FAILED';
    refreshToken = token;
  } catch {
    return 'EXCHANGE_FAILED';
  }

  try {
    const res = await fetch(APPLE_REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token: refreshToken,
        token_type_hint: 'refresh_token',
      }),
    });
    return res.ok ? 'REVOKED' : 'REVOKE_FAILED';
  } catch {
    return 'REVOKE_FAILED';
  }
}
