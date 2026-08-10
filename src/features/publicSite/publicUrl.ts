// Deterministic public URL construction. Canonical URLs are NEVER AI-generated —
// they are PUBLIC_BASE_URL + route + slug. When the production base URL is not yet
// configured (owner decision), canonical is null → pages omit canonical rather
// than hallucinating/hardcoding a fake domain.
//
// EXPO_PUBLIC_PUBLIC_BASE_URL is a CLIENT-SAFE, non-secret config (e.g.
// "https://deokbun.example"). Leave unset in dev → canonical unavailable/preview.

export function getPublicBaseUrl(): string | null {
  const raw = (process.env.EXPO_PUBLIC_PUBLIC_BASE_URL ?? '').trim();
  if (raw.length === 0) return null;
  // Only accept http(s); strip trailing slashes.
  if (!/^https?:\/\//.test(raw)) return null;
  return raw.replace(/\/+$/, '');
}

export function buildCanonical(path: string): string | null {
  const base = getPublicBaseUrl();
  if (!base) return null;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function canonicalForFamous(slug: string): string | null {
  return slug ? buildCanonical(`/famous/${slug}`) : null;
}

export function canonicalForContent(slug: string): string | null {
  return slug ? buildCanonical(`/content/${slug}`) : null;
}
