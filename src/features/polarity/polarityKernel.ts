// The shared deterministic POLARITY kernel (Sprint C §3). Factors the harmony/friction valence rule that
// Today (todayPlan) and Monthly (monthlyPlan) shipped as DUPLICATED code, so Today, Monthly, and solo
// Consultation all read ONE implementation of the same categorical polarity.
//
// It is an APPLICATION (interpretation) rule over already-produced deterministic relation facts — NOT a
// frozen astronomical calculation — and it introduces NO new astrology semantics: the harmony/friction
// sets, the tally, and the 4-way threshold are byte-identical to the previously shipped Today/Monthly logic
// (frozen by polarityCharacterization.test.ts). It only READS the RelationsToNatal facts the frozen engine
// already produced (type-only import; no engine calculation here).
//
// CATEGORICAL ONLY. The four tiers are LABELS, never an ordering — there is deliberately NO
// FAVORABLE>STEADY>DYNAMIC>CAUTION rank, NO numeric score, and no sort/compare helper. `harmony`/`friction`
// are internal evidence for traceability, never a user-facing score and never a ranking key (§0.C / §14).
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';

export type PolarityTier = 'FAVORABLE' | 'STEADY' | 'DYNAMIC' | 'CAUTION';
export type PolarityEvidence = { harmony: number; friction: number };
export type PolarityResult = { tier: PolarityTier; evidence: PolarityEvidence };

// The classical relation kinds the shipped rule counts. Identical to the sets previously duplicated in
// todayPlan.ts:111-112 and monthlyPlan.ts:141-142.
const HARMONY_BRANCH = new Set(['BRANCH_SIX_COMBINATION', 'BRANCH_HALF_THREE_HARMONY']);
const FRICTION_BRANCH = new Set([
  'BRANCH_CLASH',
  'BRANCH_PUNISHMENT',
  'BRANCH_SELF_PUNISHMENT',
  'BRANCH_DESTRUCTION',
  'BRANCH_HARM',
]);

/** Tally harmony vs friction over a luck pillar's relations to the natal chart. Internal evidence only. */
export function valenceFromRelations(rel: RelationsToNatal): PolarityEvidence {
  let harmony = 0;
  let friction = 0;
  for (const s of rel.stem) {
    if (s.relation.kind === 'STEM_COMBINATION') harmony += 1;
    else if (s.relation.kind === 'STEM_CLASH') friction += 1;
  }
  for (const b of rel.branch) {
    if (HARMONY_BRANCH.has(b.relation.kind)) harmony += 1;
    else if (FRICTION_BRANCH.has(b.relation.kind)) friction += 1;
  }
  return { harmony, friction };
}

/**
 * The 4-way categorical tier. IDENTICAL threshold to the shipped Today/Monthly rule:
 *  - FAVORABLE: no friction, at least one harmony
 *  - STEADY:    no friction, no harmony (nothing pulling either way)
 *  - DYNAMIC:   friction present but harmony holds the line (harmony >= friction, ties included)
 *  - CAUTION:   friction present and dominant (harmony < friction)
 * DYNAMIC is NOT an ordinal rung between STEADY and CAUTION — it is a distinct "mixed/changeable" label.
 */
export function polarityTierFromValence(harmony: number, friction: number): PolarityTier {
  if (friction === 0) return harmony >= 1 ? 'FAVORABLE' : 'STEADY';
  return harmony >= friction ? 'DYNAMIC' : 'CAUTION';
}

/** Derive the categorical polarity + its internal evidence from a luck pillar's relations to natal. */
export function derivePolarity(rel: RelationsToNatal): PolarityResult {
  const evidence = valenceFromRelations(rel);
  return { tier: polarityTierFromValence(evidence.harmony, evidence.friction), evidence };
}
