// Canonical Naver profile normalization CONTRACT (pure + tested). The naver-auth
// Edge Function mirrors this exact extraction inline (it runs on Deno and cannot
// import the app module system) — this file is the single tested source of truth
// for the shape/rules, referenced by the edge.
//
// Naver `/v1/nid/me` returns:
//   { resultcode: "00", message: "success", response: { id, email?, name?, ... } }
// The stable account key is `response.id` (a per-app unique STRING). `email` is
// OPTIONAL — the user may decline it — so callers MUST handle null and fail closed
// (NEVER fabricate an email; §4).

export type NaverProfile = {
  naverId: string;
  email: string | null;
  name: string | null;
};

export type NaverProfileResult =
  | { ok: true; profile: NaverProfile }
  | { ok: false; reason: 'BAD_RESPONSE' | 'MISSING_ID' };

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeNaverProfile(raw: unknown): NaverProfileResult {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'BAD_RESPONSE' };
  const root = raw as { resultcode?: unknown; response?: unknown };
  if (readString(root.resultcode) !== '00') return { ok: false, reason: 'BAD_RESPONSE' };
  if (!root.response || typeof root.response !== 'object') {
    return { ok: false, reason: 'BAD_RESPONSE' };
  }
  const response = root.response as Record<string, unknown>;
  const naverId = readString(response.id);
  if (!naverId) return { ok: false, reason: 'MISSING_ID' };
  return {
    ok: true,
    profile: {
      naverId,
      email: readString(response.email),
      name: readString(response.name),
    },
  };
}
