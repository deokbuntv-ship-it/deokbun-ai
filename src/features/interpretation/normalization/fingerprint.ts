export type Sha256Fingerprint = {
  algorithm: 'SHA-256';
  encoding: 'UTF-8';
  value: string;
};

// Runtime-specific implementations belong to an Integration layer. Core Domain
// does not import Expo Crypto, Node crypto, or Web Crypto.
export type DigestProvider = {
  sha256Utf8(input: string): Promise<string>;
};

export async function digestBirthFingerprintFrame(
  frame: string,
  provider: DigestProvider,
): Promise<Sha256Fingerprint> {
  const value = await provider.sha256Utf8(frame);
  return {
    algorithm: 'SHA-256',
    encoding: 'UTF-8',
    value,
  };
}
