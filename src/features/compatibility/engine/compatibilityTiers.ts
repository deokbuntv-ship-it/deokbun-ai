// Deterministic COMPATIBILITY TIER model (owner §19/§20/§21). Turns the discrete pairwise
// facts into a transparent per-dimension + overall TIER. Fully deterministic, bounded,
// reproducible, versioned, ZERO LLM. There is NO 0–100 score: the underlying facts are named
// relations + integer element counts, so a percentage would imply precision the engines never
// computed. Instead we expose the honest tally that produced each tier.
//
// ── MODEL (documented, testable — no magic constants without rationale) ──────────────────────
// Three axes, each a small integer tally over the facts:
//
//   BOND (정서·유대) — the couple axis. 명리 reads 궁합 primarily from the 일주 (day pillar). So a
//     일간합 / 일지 육합·반합 are the strongest positive signals; a 일간충 / 일지충 the strongest
//     negatives. Other cross 육합/삼합 add smaller positives.
//       bondScore = 2·(일간합) + 2·(일지 육합) + 1·(일지 반합) + 1·(기타 교차 육합, ≤2)
//                   + 1·(union 삼합/방합, ≤1) − 2·(일간충) − 2·(일지충) − 1·(일지 형/파/해, ≤2)
//
//   FRICTION (갈등·마찰) — the total clash LOAD across both charts (a simple count, more = worse):
//       frictionCount = #(천간충) + #(지지 충/형/자형/파/해) + #(union 삼형)   [across all cross pairs]
//
//   ELEMENT (오행 보완) — does each supply what the other lacks?
//       complementCount = |selfSuppliesTarget| + |targetSuppliesSelf|;  sharedMissing = shared gaps
//
// OVERALL = summed AXIS points (bond/friction weighted ±2 as the primary classical signals,
// element ±1 as supporting context), mapped by documented thresholds. A single relation (e.g. a
// 일지충) legitimately affects BOTH bond and friction — that is doctrinally correct (a day-branch
// clash matters emotionally AND as conflict), not a within-axis double count; it is the reason the
// couple axis is deliberately weighted. Thresholds are chosen so a clean 합 with no clashes reads
// VERY_GOOD and a chart dominated by clashes reads CHALLENGING.
import { FIVE_ELEMENT_LABELS, type FiveElement } from '@/features/interpretation';

import {
  COMPATIBILITY_TIER_MODEL_VERSION,
  type CompatibilityAssessment,
  type CompatibilityDimension,
  type DimensionSignal,
  type OverallTier,
  type PairwiseRelationFacts,
} from './types';

const el = (e: FiveElement): string => FIVE_ELEMENT_LABELS[e].hangul;
const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

const OVERALL_LABEL: Record<OverallTier, string> = {
  VERY_GOOD: '매우 잘 맞는 편',
  GOOD: '잘 맞는 편',
  NEEDS_CARE: '보완이 필요한 편',
  CHALLENGING: '갈등 관리가 중요한 편',
};

// ── BOND ─────────────────────────────────────────────────────────────────────
function bondDimension(facts: PairwiseRelationFacts): {
  dimension: CompatibilityDimension;
  points: number;
} {
  const dayStemCombo = facts.dayStemRelation?.kind === 'STEM_COMBINATION' ? 1 : 0;
  const dayStemClash = facts.dayStemRelation?.kind === 'STEM_CLASH' ? 1 : 0;
  const daySixCombo = facts.dayBranchRelations.some((r) => r.kind === 'BRANCH_SIX_COMBINATION') ? 1 : 0;
  const dayHalfHarmony = facts.dayBranchRelations.some((r) => r.kind === 'BRANCH_HALF_THREE_HARMONY') ? 1 : 0;
  const dayBranchClash = facts.dayBranchRelations.some((r) => r.kind === 'BRANCH_CLASH') ? 1 : 0;
  const dayBranchStrain = facts.dayBranchRelations.filter((r) =>
    r.kind === 'BRANCH_PUNISHMENT' || r.kind === 'BRANCH_DESTRUCTION' || r.kind === 'BRANCH_HARM',
  ).length;

  // other cross 육합 (excluding the day↔day one, already counted)
  const otherSixCombo = clamp(
    facts.crossBranchRelations.filter(
      (r) => r.relation.kind === 'BRANCH_SIX_COMBINATION' && !(r.self === 'DAY' && r.target === 'DAY'),
    ).length,
    0,
    2,
  );
  const unionHarmony = facts.unionSetRelations.some(
    (r) => r.kind === 'BRANCH_THREE_HARMONY' || r.kind === 'BRANCH_DIRECTIONAL_UNION',
  ) ? 1 : 0;

  const bondScore =
    2 * dayStemCombo +
    2 * daySixCombo +
    1 * dayHalfHarmony +
    1 * otherSixCombo +
    1 * unionHarmony -
    2 * dayStemClash -
    2 * dayBranchClash -
    1 * clamp(dayBranchStrain, 0, 2);

  let signal: DimensionSignal;
  let verdict: string;
  if (bondScore >= 3) {
    signal = 'POSITIVE';
    verdict = '정서적으로 잘 통하는 편이에요.';
  } else if (bondScore >= 1) {
    signal = 'MODERATE';
    verdict = '기본적인 교감은 무난한 편이에요.';
  } else {
    signal = 'WATCH';
    verdict = '서로의 속마음을 확인하는 시간이 필요한 편이에요.';
  }

  const tally: string[] = [];
  if (dayStemCombo) tally.push('일간 천간합(끌림)');
  if (daySixCombo) tally.push('일지 육합(잘 맞는 결)');
  if (dayHalfHarmony) tally.push('일지 반합');
  if (otherSixCombo) tally.push(`교차 육합 ${otherSixCombo}`);
  if (unionHarmony) tally.push('두 사람 지지 삼합/방합');
  if (dayStemClash) tally.push('일간 천간충(부딪힘)');
  if (dayBranchClash) tally.push('일지 충(자리 다툼)');
  if (dayBranchStrain) tally.push(`일지 형·파·해 ${dayBranchStrain}`);
  if (tally.length === 0) tally.push('일주 사이 두드러진 합·충 없음');

  return {
    points: bondScore >= 3 ? 2 : bondScore >= 1 ? 1 : -1,
    dimension: { key: 'BOND', title: '정서·유대', signal, verdict, tally },
  };
}

// ── FRICTION ───────────────────────────────────────────────────────────────
function frictionDimension(facts: PairwiseRelationFacts): {
  dimension: CompatibilityDimension;
  points: number;
} {
  const stemClashes = facts.crossStemRelations.filter((r) => r.relation.kind === 'STEM_CLASH').length;
  const branchClashKinds = new Set([
    'BRANCH_CLASH',
    'BRANCH_PUNISHMENT',
    'BRANCH_SELF_PUNISHMENT',
    'BRANCH_DESTRUCTION',
    'BRANCH_HARM',
  ]);
  const branchClashes = facts.crossBranchRelations.filter((r) => branchClashKinds.has(r.relation.kind)).length;
  const threePunishment = facts.unionSetRelations.filter((r) => r.kind === 'BRANCH_THREE_PUNISHMENT').length;
  const frictionCount = stemClashes + branchClashes + threePunishment;

  let signal: DimensionSignal;
  let verdict: string;
  let points: number;
  if (frictionCount === 0) {
    signal = 'POSITIVE';
    verdict = '부딪히는 지점이 적은 편이에요.';
    points = 2;
  } else if (frictionCount <= 2) {
    signal = 'MODERATE';
    verdict = '가끔 부딪힐 수 있지만 조율할 수 있는 수준이에요.';
    points = 0;
  } else {
    signal = 'WATCH';
    verdict = '갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.';
    points = -2;
  }

  const tally: string[] = [];
  if (stemClashes) tally.push(`천간충 ${stemClashes}`);
  if (branchClashes) tally.push(`지지 충·형·파·해 ${branchClashes}`);
  if (threePunishment) tally.push('삼형');
  if (tally.length === 0) tally.push('두 사람 사이 충·형·파·해 없음');

  return { points, dimension: { key: 'FRICTION', title: '갈등·마찰', signal, verdict, tally } };
}

// ── ELEMENT ──────────────────────────────────────────────────────────────────
function elementDimension(facts: PairwiseRelationFacts): {
  dimension: CompatibilityDimension;
  points: number;
} {
  const { selfSuppliesTarget, targetSuppliesSelf, sharedMissing } = facts.elementComplement;
  const complementCount = selfSuppliesTarget.length + targetSuppliesSelf.length;

  let signal: DimensionSignal;
  let verdict: string;
  let points: number;
  if (complementCount >= 2) {
    signal = 'POSITIVE';
    verdict = '서로 부족한 기운을 자연스럽게 채워주는 편이에요.';
    points = 1;
  } else if (complementCount === 1) {
    signal = 'MODERATE';
    verdict = '한쪽이 상대의 부족한 부분을 채워주는 편이에요.';
    points = 1;
  } else if (sharedMissing.length >= 2) {
    signal = 'WATCH';
    verdict = '두 사람 모두 약한 기운이 있어 그 부분은 함께 신경 쓰면 좋아요.';
    points = -1;
  } else {
    signal = 'MODERATE';
    verdict = '기운의 구성이 비슷해 편안한 편이에요.';
    points = 0;
  }

  const tally: string[] = [];
  if (selfSuppliesTarget.length) tally.push(`내가 채워줌: ${selfSuppliesTarget.map(el).join('·')}`);
  if (targetSuppliesSelf.length) tally.push(`상대가 채워줌: ${targetSuppliesSelf.map(el).join('·')}`);
  if (sharedMissing.length) tally.push(`공통으로 약함: ${sharedMissing.map(el).join('·')}`);
  if (tally.length === 0) tally.push('오행 구성이 서로 비슷함');

  return { points, dimension: { key: 'ELEMENT', title: '오행 보완', signal, verdict, tally } };
}

/**
 * Derive the transparent per-dimension + overall compatibility tier from the pairwise facts.
 * Pure, deterministic, versioned. `reducedPrecision` is true when either 시주 is unknown.
 */
export function deriveCompatibilityAssessment(facts: PairwiseRelationFacts): CompatibilityAssessment {
  const bond = bondDimension(facts);
  const friction = frictionDimension(facts);
  const element = elementDimension(facts);

  const overallPoints = bond.points + friction.points + element.points; // range -4 .. +5
  let overall: OverallTier;
  if (overallPoints >= 4) overall = 'VERY_GOOD';
  else if (overallPoints >= 2) overall = 'GOOD';
  else if (overallPoints >= 0) overall = 'NEEDS_CARE';
  else overall = 'CHALLENGING';

  return {
    overall,
    overallLabel: OVERALL_LABEL[overall],
    dimensions: [bond.dimension, friction.dimension, element.dimension],
    reducedPrecision: !facts.self.hourKnown || !facts.target.hourKnown,
    tierModelVersion: COMPATIBILITY_TIER_MODEL_VERSION,
  };
}
