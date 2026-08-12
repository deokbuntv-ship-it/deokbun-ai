import { NAVER_AUTHORIZE_URL } from './naverConfig';

// PURE Naver OAuth2 helpers (PATH B). Runtime-safe: no URL/URLSearchParams (those
// are unreliable in React Native Hermes) — plain string building + a manual query
// parser, so the same code works on web + native and is fully unit-testable.

export type NaverAuthorizeParams = {
  clientId: string;
  redirectUri: string;
  state: string;
};

// Naver authorization-code-grant URL (response_type=code). No secret is ever placed
// in a URL — only the public client_id, the registered redirect_uri, and a CSRF state.
export function buildNaverAuthorizeUrl(params: NaverAuthorizeParams): string {
  const query = [
    'response_type=code',
    `client_id=${encodeURIComponent(params.clientId)}`,
    `redirect_uri=${encodeURIComponent(params.redirectUri)}`,
    `state=${encodeURIComponent(params.state)}`,
  ].join('&');
  return `${NAVER_AUTHORIZE_URL}?${query}`;
}

export type NaverCallback =
  | { ok: true; code: string; state: string }
  | { ok: false; reason: 'DENIED' | 'MISSING_CODE' | 'MISSING_STATE'; error?: string };

function parseQuery(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of raw.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = eq >= 0 ? pair.slice(0, eq) : pair;
    const value = eq >= 0 ? pair.slice(eq + 1) : '';
    try {
      out[decodeURIComponent(key)] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

// Parse code+state (or an error/deny) from the Naver redirect URL. Naver returns
// `?code=&state=` on success or `?error=&error_description=&state=` on failure/deny.
export function parseNaverCallback(url: string): NaverCallback {
  const qIndex = url.indexOf('?');
  const hIndex = url.indexOf('#');
  const raw =
    qIndex >= 0 ? url.slice(qIndex + 1) : hIndex >= 0 ? url.slice(hIndex + 1) : '';
  const params = parseQuery(raw);

  if (params.error) {
    return { ok: false, reason: 'DENIED', error: params.error };
  }
  if (!params.code) return { ok: false, reason: 'MISSING_CODE' };
  if (!params.state) return { ok: false, reason: 'MISSING_STATE' };
  return { ok: true, code: params.code, state: params.state };
}

// CSRF check for the state round-trip. Length-checked, constant-time-ish compare.
// Both must be present and equal; empty/absent never matches.
export function statesMatch(
  returned: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!returned || !expected) return false;
  if (returned.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < returned.length; i += 1) {
    diff |= returned.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
