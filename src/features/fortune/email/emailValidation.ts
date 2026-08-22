// Pure email-syntax validity (Sprint J4 §4.5). Mirrors the SQL check in migration 20260841 so client + server
// agree on what counts as a syntactically valid address. Not an existence/deliverability check.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 320) return false;
  return EMAIL_RE.test(trimmed);
}
