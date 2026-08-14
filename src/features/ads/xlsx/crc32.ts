// CRC-32 (IEEE 802.3) for the ZIP local/central headers of the .xlsx writer. Pure, table-
// based, operates on byte arrays. No dependencies.

let TABLE: Uint32Array | null = null;

function table(): Uint32Array {
  if (TABLE) return TABLE;
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  TABLE = t;
  return t;
}

export function crc32(bytes: readonly number[] | Uint8Array): number {
  const t = table();
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = t[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
