// Consultation Intelligence — ASSESSMENT (directive §10–§17). Layer B = user-facing
// evaluation axes derived from calculation FACTS by a VERIFIED ruleset. PURE
// contracts + a FAIL-CLOSED assembler + validator. This file contains NO astrology
// mapping ("this 십성 → wealth +2") — that verified ruleset is CODEX-owned (§5).
// Until it ships, assessments are honestly `rules_not_connected` (§44); never a
// fabricated level and never a fake numeric score (§45).
import type { Agreement, EngineKind, LifeDomain } from '@/features/analysis';

import { ASSESSMENT_RULESET_NOT_CONNECTED, ASSESSMENT_SCHEMA_VERSION } from './versions';

// ---- Taxonomy (§10) — stable V1.0 axes. Not dozens; product-level. ------------
export type AssessmentAxis =
  | 'overall'
  | 'personality'
  | 'wealth'
  | 'business'
  | 'career'
  | 'relationship'
  | 'romance_partner'
  | 'family'
  | 'health_lifestyle' // NOT medical diagnosis
  | 'learning_growth'
  | 'movement_change'
  | 'achievement_reputation'
  | 'risk_caution'
  | 'current_cycle'
  | 'future_timing';

export const ASSESSMENT_AXES: readonly AssessmentAxis[] = [
  'overall', 'personality', 'wealth', 'business', 'career', 'relationship',
  'romance_partner', 'family', 'health_lifestyle', 'learning_growth',
  'movement_change', 'achievement_reputation', 'risk_caution', 'current_cycle',
  'future_timing',
] as const;

// Structural bridge to the cross-analysis LifeDomain (8) so the two layers interop
// without re-inventing a taxonomy. Many axes map to one domain; some (personality,
// overall, current_cycle) have no direct cross-analysis domain → null.
export const AXIS_TO_LIFE_DOMAIN: Readonly<Record<AssessmentAxis, LifeDomain | null>> = {
  overall: null,
  personality: null,
  wealth: 'wealth',
  business: 'wealth',
  career: 'career',
  relationship: 'relationship',
  romance_partner: 'relationship',
  family: 'relationship',
  health_lifestyle: 'health',
  learning_growth: 'career',
  movement_change: 'movement',
  achievement_reputation: 'career',
  risk_caution: 'risk',
  current_cycle: 'timing',
  future_timing: 'timing',
};

// ---- Value contract (§11–§17) — level/direction/confidence kept SEPARATE (§13). -
// `rules_not_connected` is the honest V1.0 state; `mixed`/`insufficient` are real
// outcomes a wired ruleset can return. No numeric precision (§14/§45).
export type AssessmentLevel =
  | 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak'
  | 'mixed' | 'not_applicable' | 'insufficient' | 'rules_not_connected';

export type AssessmentDirection =
  | 'rising' | 'stable' | 'declining' | 'volatile' | 'mixed' | 'unknown';

export type AssessmentConfidence = 'high' | 'medium' | 'low' | 'insufficient';

// Reuse cross-analysis Agreement (§15/§18) + two explicit extra states.
export type AssessmentAgreement = Agreement | 'single_engine' | 'not_applicable';

// Whether the axis CAN be assessed from the available data (separate from the
// result `level`). Availability, not evaluation.
export type AssessmentApplicability =
  | 'applicable' | 'missing_birth_time' | 'not_applicable' | 'insufficient';

// Per-engine contribution kept INDEPENDENT (§17) — never flattened into one score.
export type EngineContribution = {
  engine: EngineKind;
  applicability: AssessmentApplicability;
  evidenceRefs: string[]; // EvidenceRecord ids this engine contributed for the axis
};

export type AssessmentTiming = {
  // Structural only (period label / reference) — NO astrology timing rule here.
  label: string | null;
  periodRef: string | null;
};

export type AssessmentItem = {
  axisKey: AssessmentAxis;
  level: AssessmentLevel;
  direction: AssessmentDirection;
  confidence: AssessmentConfidence;
  agreement: AssessmentAgreement;
  applicability: AssessmentApplicability;
  timing: AssessmentTiming | null;
  warnings: string[];
  // WHY (support) and the opposing signals (counter) tracked separately (§16).
  supportingEvidenceRefs: string[];
  counterEvidenceRefs: string[];
  engineContributions: EngineContribution[];
  schemaVersion: string;
  rulesetVersion: string; // ASSESSMENT_RULESET_NOT_CONNECTED until Codex wires it
};

function deriveApplicability(contributions: EngineContribution[]): AssessmentApplicability {
  if (contributions.length === 0) return 'not_applicable';
  if (contributions.some((c) => c.applicability === 'applicable')) return 'applicable';
  if (contributions.some((c) => c.applicability === 'missing_birth_time')) return 'missing_birth_time';
  if (contributions.every((c) => c.applicability === 'not_applicable')) return 'not_applicable';
  return 'insufficient';
}

// FAIL-CLOSED assembler (§44). With NO verified ruleset connected, we cannot say
// strong/weak or classify support vs counter (that needs engine-provided polarity,
// Codex). This returns an HONEST item: level `rules_not_connected`, empty
// support/counter refs, a warning — while preserving each engine's availability so
// the trace still records which engines had data.
export function assembleFailClosed(
  axisKey: AssessmentAxis,
  engineContributions: EngineContribution[],
): AssessmentItem {
  const applicability = deriveApplicability(engineContributions);
  return {
    axisKey,
    level: 'rules_not_connected',
    direction: 'unknown',
    confidence: 'insufficient',
    agreement: 'insufficient_evidence',
    applicability,
    timing: null,
    warnings: [
      'assessment_ruleset_not_connected: evidence→assessment mapping is not yet verified (Codex)',
    ],
    supportingEvidenceRefs: [],
    counterEvidenceRefs: [],
    engineContributions,
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    rulesetVersion: ASSESSMENT_RULESET_NOT_CONNECTED,
  };
}

// Committal evaluative levels — each asserts a graded or CONFLICTING conclusion that
// only a wired ruleset (Codex polarity/strength classification) can produce. `mixed`
// is included: it means conflicting support-vs-counter signals, which presupposes the
// classification step ran. The non-committal levels (`not_applicable`, `insufficient`,
// `rules_not_connected`) assert ABSENCE of an evaluation and may arise structurally
// with no ruleset — they are intentionally NOT gated.
const EVALUATIVE_LEVELS: readonly AssessmentLevel[] = [
  'very_strong', 'strong', 'moderate', 'weak', 'very_weak', 'mixed',
];

// A ruleset counts as "connected" ONLY if it names a real, non-sentinel version.
// Positive allow-list (not a deny-list against one string): an empty / blank /
// sentinel / non-string (undefined at runtime from a DB row) version is NOT
// connected, so it can never carry an evaluative level.
function isConnectedRuleset(rulesetVersion: string): boolean {
  const v = typeof rulesetVersion === 'string' ? rulesetVersion.trim() : '';
  return v.length > 0 && v !== ASSESSMENT_RULESET_NOT_CONNECTED;
}

// Fail-closed INVARIANT (§44): an item that claims a committal evaluative level MUST
// carry a CONNECTED ruleset version. Any evaluative level without one — including a
// `mixed` verdict or a blank/placeholder rulesetVersion — is a fabricated assessment
// and is rejected.
export function isValidAssessmentItem(item: AssessmentItem): boolean {
  if (!ASSESSMENT_AXES.includes(item.axisKey)) return false;
  if (EVALUATIVE_LEVELS.includes(item.level) && !isConnectedRuleset(item.rulesetVersion)) {
    return false; // fabricated: an evaluative conclusion with no connected ruleset
  }
  // support/counter refs must be disjoint (an evidence can't be both).
  const support = new Set(item.supportingEvidenceRefs);
  if (item.counterEvidenceRefs.some((r) => support.has(r))) return false;
  return true;
}
