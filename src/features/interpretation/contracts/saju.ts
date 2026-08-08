import type { CanonicalBirthInput } from '../domain/birth';

// Saju-specific options are intentionally not invented in ENGINE-01. They will
// be introduced with verified calculation rules in the Saju engine sprints.
export type SajuEngineInput = {
  engine: 'SAJU';
  birth: CanonicalBirthInput;
};
