// Acquisition SIGNUP-eligibility rule (Sprint 3B rev 4 — FAIL-CLOSED, evidence-backed).
// Decides whether an ad-attributed authentication is a genuinely NEW account (→ SIGNUP
// conversion) or must NOT be counted. A pre-existing user must NEVER inflate signup/CAC, and
// a signup must be backed by TRUSTED SERVER EVIDENCE — we prefer an undercount from missing
// telemetry over contaminating CAC/conversion with an inferred acquisition (owner directive).
//
// CANONICAL RULE:
//   SIGNUP = the JWT-verified account is genuinely new
//            AND a server-recorded ad_click exists for the attribution
//            AND auth.users.created_at >= that server ad_click.created_at
//   Missing account created_at  → FALSE.
//   Missing server-recorded click → FALSE (no inference from attribution time / any window /
//     client timestamps / a client isNewUser flag).
//
// This pure function is the CANONICAL rule; the SQL `ad_reconcile_attribution` trigger in
// docs/ADVERTISEMENTS_SETUP.sql mirrors it exactly. Both inputs are SERVER timestamps.

export function isNewAccountSignup(params: {
  accountCreatedAt: string | null; // auth.users.created_at (server, immutable). Missing → false.
  adClickAt: string | null; // server-recorded first ad_click time for this visitor. Missing → false.
}): boolean {
  const created = Date.parse(params.accountCreatedAt ?? '');
  if (Number.isNaN(created)) return false; // no trusted account age → NO signup

  const click = Date.parse(params.adClickAt ?? '');
  if (Number.isNaN(click)) return false; // no trusted click evidence → NO signup (fail-closed)

  // Account created AT/AFTER the ad click → born from this ad-driven session → NEW signup.
  // Created BEFORE the click → pre-existing user → attribution only, NO signup.
  return created >= click;
}
