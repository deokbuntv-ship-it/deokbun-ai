// Sprint 3B — tracking code / URL + acquisition context (first-touch survival). Pure.
import {
  captureAcquisition,
  clearAcquisition,
  consumeAcquisition,
  peekAcquisition,
  ACQUISITION_TTL_MS,
} from '../acquisition/acquisitionContext';
import {
  buildTrackingUrl,
  isUsableOrigin,
  parseTrackingCodeFromQuery,
} from '../trackingUrl';
import { encodeTrackingCode, generateTrackingCode, isValidTrackingCode } from '../trackingCode';

const bytes = (arr: number[]) => Uint8Array.from(arr);

describe('tracking code (§9)', () => {
  it('encodes deterministically from bytes and is non-sequential/ad_-prefixed', () => {
    const code = encodeTrackingCode(bytes([0, 1, 2, 3, 4, 5, 6, 7]));
    expect(code.startsWith('ad_')).toBe(true);
    expect(code).toHaveLength(3 + 8);
    // same bytes → same code (stable), different bytes → different code
    expect(encodeTrackingCode(bytes([0, 1, 2, 3, 4, 5, 6, 7]))).toBe(code);
    expect(encodeTrackingCode(bytes([9, 9, 9, 9, 9, 9, 9, 9]))).not.toBe(code);
  });
  it('generateTrackingCode uses the injected RNG (no global crypto dependency)', () => {
    const code = generateTrackingCode((n) => Uint8Array.from(Array.from({ length: n }, (_, i) => i * 7)));
    expect(isValidTrackingCode(code)).toBe(true);
  });
  it('rejects malformed codes (§51)', () => {
    expect(isValidTrackingCode('ad_')).toBe(false);
    expect(isValidTrackingCode('7Jk29Qab')).toBe(false); // no prefix
    expect(isValidTrackingCode('ad_UPPER123')).toBe(false); // out-of-alphabet
    expect(isValidTrackingCode('ad_../etc')).toBe(false);
    expect(isValidTrackingCode(42)).toBe(false);
    expect(isValidTrackingCode(null)).toBe(false);
  });
  it('excludes ambiguous glyphs 0/1/i/l/o from the alphabet', () => {
    const code = encodeTrackingCode(bytes([255, 254, 253, 252, 251, 250, 249, 248]));
    expect(code.slice(3)).not.toMatch(/[01ilo]/);
  });
});

describe('tracking URL (§8/§59) — derived, localhost-safe', () => {
  const CODE = encodeTrackingCode(bytes([1, 2, 3, 4, 5, 6, 7, 8]));
  it('builds /?ad=CODE from a real origin', () => {
    expect(buildTrackingUrl(CODE, 'https://deokbun.example')).toBe(`https://deokbun.example/?ad=${CODE}`);
    expect(buildTrackingUrl(CODE, 'https://deokbun.example/')).toBe(`https://deokbun.example/?ad=${CODE}`);
  });
  it('NEVER produces a localhost tracking URL (§59)', () => {
    expect(buildTrackingUrl(CODE, 'http://localhost:8081')).toBeNull();
    expect(buildTrackingUrl(CODE, 'http://127.0.0.1:3000')).toBeNull();
    expect(isUsableOrigin('http://localhost')).toBe(false);
  });
  it('returns null when origin is unset (dev) or code invalid — never a fake domain', () => {
    expect(buildTrackingUrl(CODE, null)).toBeNull();
    expect(buildTrackingUrl('bogus', 'https://deokbun.example')).toBeNull();
  });
  it('parses a valid ?ad= code and ignores malformed ones', () => {
    expect(parseTrackingCodeFromQuery(`?ad=${CODE}`)).toBe(CODE);
    expect(parseTrackingCodeFromQuery(`?foo=1&ad=${CODE}&bar=2`)).toBe(CODE);
    expect(parseTrackingCodeFromQuery('?ad=INVALID!!')).toBeNull();
    expect(parseTrackingCodeFromQuery('')).toBeNull();
  });
});

describe('acquisition context (§19/§20/§21) — first-touch survival', () => {
  const CODE_A = encodeTrackingCode(bytes([1, 1, 1, 1, 1, 1, 1, 1]));
  const CODE_B = encodeTrackingCode(bytes([2, 2, 2, 2, 2, 2, 2, 2]));
  beforeEach(() => clearAcquisition());

  it('captures a valid code with a visitor id', () => {
    captureAcquisition(CODE_A, 'v-123', 1000);
    const ctx = peekAcquisition(1000);
    expect(ctx?.code).toBe(CODE_A);
    expect(ctx?.visitorId).toBe('v-123');
  });
  it('FIRST TOUCH: a later ad click does NOT overwrite the first (§20)', () => {
    captureAcquisition(CODE_A, 'v-1', 1000);
    captureAcquisition(CODE_B, 'v-2', 2000); // later click, still within TTL
    expect(peekAcquisition(2000)?.code).toBe(CODE_A);
  });
  it('ignores an invalid inbound code (§51)', () => {
    captureAcquisition('INVALID', null, 1000);
    expect(peekAcquisition(1000)).toBeNull();
  });
  it('expires past the TTL (never misattributes a much-later signup)', () => {
    captureAcquisition(CODE_A, null, 1000);
    expect(peekAcquisition(1000 + ACQUISITION_TTL_MS + 1)).toBeNull();
  });
  it('consume is one-shot (read then clear)', () => {
    captureAcquisition(CODE_A, 'v-1', 1000);
    expect(consumeAcquisition(1000)?.code).toBe(CODE_A);
    expect(peekAcquisition(1000)).toBeNull();
  });
});
