import type { CanonicalBirthInput } from '../domain/birth';

// Ziwei-specific options are intentionally deferred until its calculation rules
// are verified.
export type ZiweiEngineInput = {
  engine: 'ZIWEI';
  birth: CanonicalBirthInput;
};
