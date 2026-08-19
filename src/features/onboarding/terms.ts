// Required-consent contract for signup-first onboarding. Versioned so a future policy change can require
// re-acceptance WITHOUT a legal CMS (§21): bump TERMS_VERSION and users whose stored version differs are
// routed back through the terms step once. Wording here is product copy — the authoritative legal text
// lives in the linked policy documents (owner-owned); this file never invents legal claims.

// Bump this string when the REQUIRED terms materially change → forces re-acceptance (deriveOnboardingState
// compares the user's accepted version against it).
export const TERMS_VERSION = '2026-08-v1';

export type ConsentItem = {
  id: string;
  label: string;
  required: boolean;
};

// Required rows are bundled under one acceptance (TERMS_VERSION). Optional rows are stored separately and
// NEVER block onboarding (§19 — genuinely optional, never pre-checked).
export const REQUIRED_CONSENTS: readonly ConsentItem[] = [
  { id: 'service', label: '[필수] 서비스 이용약관 동의', required: true },
  { id: 'privacy', label: '[필수] 개인정보 수집·이용 동의', required: true },
  { id: 'age14', label: '[필수] 만 14세 이상입니다', required: true },
];

export const OPTIONAL_CONSENTS: readonly ConsentItem[] = [
  { id: 'marketing', label: '[선택] 마케팅 정보 수신 동의', required: false },
];

// A user's stored consent facts (from the profiles row). `termsVersion` is the version they last accepted.
export type ConsentFacts = {
  termsVersion: string | null;
  marketingOptIn: boolean;
};

// Required terms are satisfied only when the user's accepted version equals the CURRENT required version.
export function isTermsAccepted(facts: ConsentFacts | null | undefined): boolean {
  return !!facts && facts.termsVersion === TERMS_VERSION;
}
