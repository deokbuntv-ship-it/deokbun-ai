// Retention window definition (§27/§28/§29). ONE unambiguous definition, documented here
// and in docs/ADVERTISEMENT_ACQUISITION_TRACKING.md. Pure.
//
// DEFINITION (rolling-return survival):
//   A user acquired by an ad is "retained at DN" if they performed at least one
//   MEANINGFUL ACTIVITY whose timestamp is >= signup_at + N days. "Meaningful activity"
//   = a successful consultation event (§28 — NOT a page refresh, NOT screen entry).
//   This makes D1 >= D7 >= D30 monotonic and reads as "N일 뒤에도 다시 돌아와 상담한 사용자".
// Denominator for a retention RATE = users the ad acquired who SIGNED UP (§27).

export const DAY_MS = 24 * 60 * 60 * 1000;
export const RETENTION_DAYS = { d1: 1, d7: 7, d30: 30 } as const;

function toMs(iso: string | null | undefined): number | null {
  if (typeof iso !== 'string' || iso.length === 0) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

/**
 * Retained at day N iff any activity timestamp is >= signupAt + N*DAY. Returns false when
 * signup is unknown (cannot anchor the window) — never a fabricated true.
 */
export function isRetainedAtDay(
  signupAt: string | null | undefined,
  activityTimestamps: readonly (string | null | undefined)[],
  dayN: number,
): boolean {
  const signupMs = toMs(signupAt);
  if (signupMs === null) return false;
  const threshold = signupMs + dayN * DAY_MS;
  for (const a of activityTimestamps) {
    const ms = toMs(a);
    if (ms !== null && ms >= threshold) return true;
  }
  return false;
}
