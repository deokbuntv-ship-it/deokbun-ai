// Share-token validation + bounded shared-report DTO parsing (Commercial UX V4 §18/§24/§27). PURE +
// deterministic. The token is a 24-byte random value rendered as 48 lowercase hex chars. Validating the
// shape BEFORE it is stored, used in a URL, or interpolated into a route prevents any path-traversal /
// open-redirect when returning a recipient to /shared-report/[token] after login (§24). The DTO parser is
// fail-closed: it accepts only the bounded, user-facing fields the RPC is allowed to return (§27).

import type { SharedReportContent } from '@/features/chat/report/reportPresentation';

const SHARE_TOKEN_RE = /^[a-f0-9]{48}$/;

// A safe share token: exactly 48 lowercase hex chars (24 random bytes). Nothing else may reach a route
// param or a URL — this is the guard that keeps the post-login continuation from becoming an open redirect.
export function isValidShareToken(value: unknown): value is string {
  return typeof value === 'string' && SHARE_TOKEN_RE.test(value);
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
}

// Parse the jsonb returned by get_shared_report() into the bounded content the renderer consumes. Returns
// null for an absent/invalid response (revoked / expired / not found → the RPC returns null). Never trusts
// or surfaces any field beyond the six user-facing ones (§27) — extra keys are ignored.
export function parseSharedReportDTO(raw: unknown): SharedReportContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === 'string' && o.title.trim() ? o.title.trim() : '상담 보고서';
  const generatedAt = typeof o.generatedAt === 'string' ? o.generatedAt : null;
  const summary = typeof o.summary === 'string' ? o.summary : '';
  return {
    title,
    generatedAt,
    summary,
    keyFindings: toStringArray(o.keyFindings),
    cautions: toStringArray(o.cautions),
    coveredTopics: toStringArray(o.coveredTopics),
  };
}
