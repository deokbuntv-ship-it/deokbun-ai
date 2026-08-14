// Public tracking code (§9). Generates a non-sequential, collision-resistant public code
// like `ad_7Jk29Qa` so a raw sequential DB id is NEVER exposed in the tracking URL.
// Pure: the caller injects randomness (a Uint8Array of bytes), so this is deterministic
// under test and never depends on the version-dependent global `crypto` (recon gotcha).

// Crockford base32 minus ambiguous glyphs — no I/L/O/U, no 0/1 confusion. Case-normalised
// to a mixed set is unnecessary; we keep it URL-safe and unambiguous.
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'; // 30 symbols, no 0/1/i/l/o
const CODE_BODY_LEN = 8;
export const TRACKING_CODE_PREFIX = 'ad_';
const CODE_RE = new RegExp(`^${TRACKING_CODE_PREFIX}[${ALPHABET}]{${CODE_BODY_LEN}}$`);

/**
 * Encode random bytes into an `ad_` code. Requires at least CODE_BODY_LEN bytes; each
 * byte maps to one alphabet symbol (byte % 30) — uniform enough for a non-secret,
 * guess-resistant identifier (30^8 ≈ 6.5e11 space). Not a security token (§9).
 */
export function encodeTrackingCode(bytes: Uint8Array): string {
  if (bytes.length < CODE_BODY_LEN) {
    throw new Error(`encodeTrackingCode needs >= ${CODE_BODY_LEN} bytes`);
  }
  let body = '';
  for (let i = 0; i < CODE_BODY_LEN; i++) {
    body += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return TRACKING_CODE_PREFIX + body;
}

export type RandomBytes = (n: number) => Uint8Array;

/**
 * Generate a tracking code using an injected byte source. Production wires a crypto RNG
 * (expo-crypto / node:crypto / getRandomValues); tests inject a deterministic stub.
 */
export function generateTrackingCode(getRandomBytes: RandomBytes): string {
  return encodeTrackingCode(getRandomBytes(CODE_BODY_LEN));
}

/** Validate an inbound `?ad=` value before trusting it (§51 — malformed code rejected). */
export function isValidTrackingCode(value: unknown): value is string {
  return typeof value === 'string' && CODE_RE.test(value);
}
