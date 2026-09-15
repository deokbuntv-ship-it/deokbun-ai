// DeokbunAI Compatibility (궁합) — deterministic pairwise ENGINE barrel.
//
// Runtime-neutral (RN-free, node-test friendly, Deno-bundle safe): this barrel is what the SERVER
// orchestrator imports. It must NEVER re-export React/UI code — client screens live elsewhere.
// Consumes the frozen SAJU engine + frozen-consuming Myungri relations read-only; zero LLM.
export {
  COMPATIBILITY_ENGINE_VERSION,
  COMPATIBILITY_TIER_MODEL_VERSION,
  type CompatibilityAssessment,
  type CompatibilityDimension,
  type CompatibilityMode,
  type CrossBranchRelation,
  type CrossStemRelation,
  type DimensionKey,
  type DimensionSignal,
  type OverallTier,
  type PairwiseRelationFacts,
  type PersonNatalSummary,
  type PersonPairwiseInput,
} from './types';
export { computePairwiseRelations } from './pairwiseRelations';
export { deriveCompatibilityAssessment } from './compatibilityTiers';
export {
  buildCompatibilityEvidence,
  type CompatibilityEvidenceResult,
  type CompatibilityPersonInput,
} from './compatibilityEvidence';
