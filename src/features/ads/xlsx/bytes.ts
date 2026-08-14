// Pure byte helpers for the dependency-free .xlsx writer (§42). No TextEncoder / Buffer /
// crypto globals — works identically in node (jest), web, and RN/Hermes, and needs no DOM
// lib for `npx tsc --noEmit`.

/** Encode a JS string to UTF-8 bytes without TextEncoder (surrogate-pair aware). */
export function utf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    // Combine a surrogate pair into a single code point.
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return out;
}

/** XML-escape text for inlineStr cell content / attributes. */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Little-endian writers used by the ZIP structure. */
export function u16(n: number): number[] {
  return [n & 0xff, (n >> 8) & 0xff];
}
export function u32(n: number): number[] {
  // >>> keeps it unsigned for values up to 2^32-1.
  return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
}
