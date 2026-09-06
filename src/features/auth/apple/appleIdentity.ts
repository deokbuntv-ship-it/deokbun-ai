// APPLE SIGN-IN — pure identity/normalisation helpers. NO react-native / expo / supabase imports, so the
// node test suite can lock the production behaviour without the native module (same split as
// `naver/naverIdentity.ts`, and the same reason: the interesting rules are decisions, not I/O).
//
// TWO APPLE-SPECIFIC FACTS THIS MODULE EXISTS FOR:
//
//  1. NAME AND EMAIL ARRIVE ONLY ONCE. Apple returns `fullName`/`email` on the FIRST authorization for an
//     app and never again — every later sign-in returns them as null. (The ID TOKEN still carries the
//     `email` claim each time, which is what actually creates/matches the Supabase user, so only the NAME
//     is genuinely first-time-only.) Anything we want from the name must be captured on that first pass.
//  2. THE EMAIL MAY BE A RELAY. When the user picks "Hide My Email", Apple issues
//     `<opaque>@privaterelay.appleid.com`. That is a REAL, deliverable address, not a missing one — it must
//     be treated as a normal email and never rejected. (`naver-auth`'s `EMAIL_REQUIRED` fail-closed does not
//     apply here at all: that guard lives inside the Naver edge bridge, and Apple goes through Supabase's
//     own provider, which creates the user from the ID token itself.)
import type { AuthFailureReason } from '@/features/auth/errors/authErrors';

/** The shape `expo-apple-authentication` returns. Declared here so this module needs no native import. */
export type AppleFullName = {
  givenName?: string | null;
  familyName?: string | null;
  middleName?: string | null;
  namePrefix?: string | null;
  nameSuffix?: string | null;
  nickname?: string | null;
} | null;

export type AppleCredentialLike = {
  identityToken?: string | null;
  email?: string | null;
  fullName?: AppleFullName;
  user?: string | null;
};

const clean = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
};

/**
 * Apple's name parts → one display name, or null when Apple gave nothing usable.
 *
 * Korean order (성 + 이름, no space) when a family name is present, because the roster and every other
 * name surface in this app is Korean-ordered. A user who authorised with a Latin-script name still reads
 * correctly this way ("SmithJohn" would not, so those are joined with a space — the discriminator is
 * whether the parts are Hangul).
 */
export function formatAppleFullName(fullName: AppleFullName): string | null {
  const given = clean(fullName?.givenName);
  const family = clean(fullName?.familyName);
  const nickname = clean(fullName?.nickname);
  if (!given && !family) return nickname;
  if (!family) return given;
  if (!given) return family;
  const hangul = /^[가-힣]+$/;
  return hangul.test(family) && hangul.test(given) ? `${family}${given}` : `${given} ${family}`;
}

/** Apple's relay address for "Hide My Email". A real address — never a reason to fail. */
export function isApplePrivateRelayEmail(email: string | null | undefined): boolean {
  return typeof email === 'string' && /@privaterelay\.appleid\.com$/i.test(email.trim());
}

/**
 * `expo-apple-authentication` error code → this app's auth vocabulary.
 *
 * `ERR_REQUEST_CANCELED` is the documented cancel code and MUST map to CANCELLED — `login.tsx` treats that
 * outcome as silent, so a mis-map would show an error banner every time someone dismisses the sheet.
 * Anything unrecognised is a provider error, never a silent success.
 */
export function mapAppleErrorToReason(code: unknown): AuthFailureReason {
  const c = typeof code === 'string' ? code : '';
  if (c === 'ERR_REQUEST_CANCELED' || c === 'ERR_CANCELED') return 'CANCELLED';
  if (c === 'ERR_REQUEST_NOT_HANDLED' || c === 'ERR_REQUEST_NOT_INTERACTIVE') return 'NOT_SUPPORTED';
  if (c === 'ERR_REQUEST_UNKNOWN' || c === 'ERR_INVALID_RESPONSE' || c === 'ERR_REQUEST_FAILED') return 'REQUEST_FAILED';
  return 'REQUEST_FAILED';
}

/**
 * Whether the first-authorization name is worth writing to `user_metadata.full_name`.
 *
 * WHY THIS IS A DECISION AND NOT AN `if`: Apple hands the name back exactly once, so writing it is a
 * one-shot chance — but overwriting a name the user already has would let a stale Apple value clobber
 * something they set themselves. Write only when we have a name AND the account has none.
 */
export function shouldPersistAppleName(existing: string | null | undefined, appleName: string | null): boolean {
  return appleName !== null && clean(existing) === null;
}

/** The identity token, or null when Apple returned a credential we cannot exchange for a session. */
export function readIdentityToken(credential: AppleCredentialLike | null | undefined): string | null {
  return clean(credential?.identityToken);
}
