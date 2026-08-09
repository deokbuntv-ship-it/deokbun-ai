import * as Crypto from 'expo-crypto';

import type { DigestProvider } from '@/features/interpretation';

// Runtime crypto for the ENGINE fingerprint. The ENGINE core intentionally does
// NOT import any crypto runtime (see interpretation/normalization/fingerprint.ts);
// it declares a DigestProvider port and the APP integration layer supplies it.
//
// This ONLY provides the sha256Utf8 runtime function. It does not define or alter
// the fingerprint framing/algorithm — the ENGINE owns that. Uses the existing
// expo-crypto dependency (no new package).
export const expoCryptoDigestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input, {
      encoding: Crypto.CryptoEncoding.HEX,
    });
  },
};
