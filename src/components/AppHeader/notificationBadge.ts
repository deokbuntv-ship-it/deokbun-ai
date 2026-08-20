// Bounded notification badge (retention §13). A header badge must never blow out with a huge count: 0 (or a
// non-positive / non-finite value) → hidden, 1..9 → the number, anything larger → "9+". Pure + testable.
export function notificationBadgeText(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  return count > 9 ? '9+' : String(Math.floor(count));
}
