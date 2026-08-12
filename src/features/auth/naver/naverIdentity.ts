// Naver account-link DECISION (PATH B; directive §10 — account-takeover guard).
// PURE + tested. The naver-auth Edge Function MIRRORS this exact logic inline (the
// edge is a self-contained Deno deploy and cannot import the app module system;
// this file is the single tested source of truth for the rule).
//
// RULE: NEVER auto-merge by email. An email that already belongs to a DIFFERENT
// account (google/kakao/email, or any user not carrying THIS Naver id) must NOT
// silently log the Naver user into it — that would be account takeover. Only:
//   - a brand-new email                → create a fresh Naver user, or
//   - the SAME Naver identity returning → proceed,
// may establish a session. Everything else → conflict (block; explicit linking is a
// separate, user-authenticated action we do not perform automatically).

export type ExistingUserLike = {
  id: string;
  // The existing user's app_metadata.naver_id, if it already carries one.
  appMetadataNaverId: string | null;
} | null;

export type NaverLinkDecision =
  | { action: 'create' }
  | { action: 'proceed'; userId: string }
  | { action: 'conflict' };

export function decideNaverLink(
  existing: ExistingUserLike,
  naverId: string,
): NaverLinkDecision {
  if (!existing) return { action: 'create' };
  if (existing.appMetadataNaverId && existing.appMetadataNaverId === naverId) {
    return { action: 'proceed', userId: existing.id };
  }
  // Email matches an account that is NOT this Naver identity → do not auto-merge.
  return { action: 'conflict' };
}
