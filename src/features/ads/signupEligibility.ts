// Acquisition SIGNUP-eligibility rule (Sprint 3B rev 3). Decides whether an ad-attributed
// authentication is a genuinely NEW account (→ record a SIGNUP conversion) or a PRE-EXISTING
// user who merely clicked an ad (→ attribution only, NEVER a signup). A pre-existing user must
// NEVER inflate signup/CAC (owner directive §1/§2/§5).
//
// SERVER-TRUSTED + DETERMINISTIC: the inputs are the JWT-verified `auth.users.created_at`
// (immutable account-creation time) and the SERVER-recorded ad-click time — never a client
// "isNewUser" boolean (§3), never a client device clock.
//
// This pure function is the CANONICAL rule; the SQL `ad_reconcile_attribution` trigger in
// docs/ADVERTISEMENTS_SETUP.sql mirrors it exactly. Kept pure so the acquisition semantic is
// unit-tested (§9) even though enforcement lives in the DB trigger.

// Used ONLY when no ad_click was recorded server-side (rare: the fire-and-forget click failed
// to persist). A brand-new account is created within this window of the attribution flush; a
// long-standing account is not. Documented + test-covered (§4).
export const SIGNUP_FALLBACK_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export function isNewAccountSignup(params: {
  accountCreatedAt: string | null; // auth.users.created_at (server, immutable)
  adClickAt: string | null; // server-recorded first ad_click time for this visitor; null if none
  attributionAt: string; // when the attribution row was created (server ≈ now)
  fallbackWindowMs?: number;
}): boolean {
  const created = Date.parse(params.accountCreatedAt ?? '');
  if (Number.isNaN(created)) return false; // unknown account age → conservative: NO signup

  const click = Date.parse(params.adClickAt ?? '');
  if (!Number.isNaN(click)) {
    // DETERMINISTIC primary rule: the account was created AT or AFTER the ad click means the
    // account was born from this ad-driven session → NEW signup (§6). Created BEFORE the click
    // means the account predates the ad touch → PRE-EXISTING user → NO signup (§5).
    return created >= click;
  }

  // Fallback (no recorded click): distinguish a just-created account from a long-standing one.
  const at = Date.parse(params.attributionAt);
  if (Number.isNaN(at)) return false;
  const window = params.fallbackWindowMs ?? SIGNUP_FALLBACK_WINDOW_MS;
  return created >= at - window;
}
