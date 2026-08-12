// Identity / account-collision policy (directive §10). PURE + deterministic.
//
// SECURITY: accounts are NEVER auto-merged by email — that would enable account
// takeover (a Naver login whose email equals an existing Google/Kakao/email
// account must not silently inherit that account). Genuine same-user linking is an
// explicit, user-authenticated action (`link_required`), never an implicit merge.
//
// PATH B NOTE (Supabase Custom OAuth): when Naver is wired via Supabase's built-in
// OAuth pipeline, Supabase itself decides identity linking per the project's
// "account linking" setting — the Owner MUST keep automatic linking OFF so
// Supabase does not merge by email (see docs/NAVER_LOGIN_ARCHITECTURE.md). This
// function is the app-level contract encoding the SAME rule deterministically, and
// is what the path-C bridge (or any post-login check) uses directly.

// Provider identifiers that represent "this person's Naver login".
const NAVER_PROVIDERS = ['naver', 'custom:naver'];

export type IdentityCollisionInput = {
  // Email Naver returned for this login (Naver users may DECLINE email → null).
  naverEmail: string | null;
  // Providers already linked to an existing Supabase user that owns `naverEmail`
  // (empty when no existing user has that email). e.g. ['google'], ['email'].
  existingProvidersForEmail: readonly string[];
  // Whether this exact Naver identity is already linked to a user.
  naverAlreadyLinked: boolean;
};

export type IdentityCollisionDecision =
  // Returning Naver user, or a brand-new user with no email collision → proceed.
  | { action: 'proceed'; reason: 'ALREADY_LINKED' | 'NEW_USER' }
  // Naver gave no email → cannot email-match; key strictly on the Naver id.
  | { action: 'proceed_no_email' }
  // Email matches a DIFFERENT existing account → require explicit linking; never
  // auto-merge. conflictingProviders lists how that email currently signs in.
  | { action: 'link_required'; conflictingProviders: string[] };

function isNaverProvider(provider: string): boolean {
  return NAVER_PROVIDERS.includes(provider);
}

export function resolveIdentityCollision(
  input: IdentityCollisionInput,
): IdentityCollisionDecision {
  // 1) This Naver identity is already linked → returning user, always safe.
  if (input.naverAlreadyLinked) {
    return { action: 'proceed', reason: 'ALREADY_LINKED' };
  }

  // 2) No email from Naver → cannot collide by email; proceed keyed on the Naver
  // id (a stable unique identifier), never on a guessed email.
  if (input.naverEmail === null || input.naverEmail.trim().length === 0) {
    return { action: 'proceed_no_email' };
  }

  // 3) No existing user owns this email → brand-new user.
  const existing = input.existingProvidersForEmail;
  if (existing.length === 0) {
    return { action: 'proceed', reason: 'NEW_USER' };
  }

  // 4) An existing user owns this email. If it is ALREADY a Naver identity it is
  // the same person → proceed; otherwise require explicit linking (no auto-merge).
  const nonNaver = existing.filter((provider) => !isNaverProvider(provider));
  if (nonNaver.length === 0) {
    return { action: 'proceed', reason: 'ALREADY_LINKED' };
  }
  return { action: 'link_required', conflictingProviders: [...nonNaver] };
}
