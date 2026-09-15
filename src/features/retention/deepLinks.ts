// NOTIFICATION DEEP-LINK ALLOWLIST (§17). A notification may only point at one of these INTERNAL product
// destinations — never an arbitrary URL from an untrusted client (no open redirect). The target is a small
// closed enum (also CHECK-constrained in the DB); an optional id parameterizes the few id-bearing routes. The
// resolved value is always a relative in-app route, so auth/onboarding continuation still applies (§17.1).
export const DEEP_LINK_TARGETS = [
  'HOME',
  'TODAY',
  'MONTHLY',
  'MAILBOX',
  'CONSULT',
  'COMPATIBILITY',
  'REPORT',
  'LIFE_EVENT',
] as const;

export type DeepLinkTarget = (typeof DEEP_LINK_TARGETS)[number];

export function isDeepLinkTarget(v: unknown): v is DeepLinkTarget {
  return typeof v === 'string' && (DEEP_LINK_TARGETS as readonly string[]).includes(v);
}

// Resolve an allowlisted target (+ optional id) to a SAFE internal route. Unknown targets fall back to HOME;
// the id is URL-encoded and used only by the id-bearing REPORT route.
export function resolveDeepLinkPath(target: DeepLinkTarget, id?: string | null): string {
  switch (target) {
    case 'TODAY':
      return '/today';
    case 'MONTHLY':
      return '/monthly';
    case 'MAILBOX':
      return '/inbox';
    case 'CONSULT':
      return '/chat';
    case 'COMPATIBILITY':
      return '/compatibility';
    case 'REPORT':
      return id ? `/report/${encodeURIComponent(id)}` : '/inbox';
    case 'LIFE_EVENT':
      return '/life-events';
    case 'HOME':
    default:
      return '/';
  }
}
