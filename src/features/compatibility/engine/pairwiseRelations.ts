// Deterministic CROSS-CHART pairwise relations. Mirrors the frozen-consuming within-chart
// loop `calculateNatalRelations`, but the two cells of each pair come from DIFFERENT people.
// FACTS ONLY — reuses `stemRelation` / `branchRelations` / `branchSetRelations` (합/충/형/파/해 ·
// 삼합/방합) and the frozen `calculateTenGod` (생/극+음양 → 십신). No new doctrine, no scoring here.
import {
  calculateTenGod,
  SAJU_FIVE_ELEMENT_KEYS,
  type EarthlyBranch,
  type FiveElement,
  type HeavenlyStem,
  type SajuFiveElementCounts,
  type SajuPillarPosition,
  type TenGod,
} from '@/features/interpretation';
import {
  branchRelations,
  branchSetRelations,
  isValidNatalContext,
  stemRelation,
  type NatalPillarContext,
} from '@/features/myungri';

import type {
  CrossBranchRelation,
  CrossStemRelation,
  PairwiseRelationFacts,
  PersonPairwiseInput,
} from './types';

type Cell = { position: SajuPillarPosition; stem: HeavenlyStem; branch: EarthlyBranch };

function pillarCells(natal: NatalPillarContext): Cell[] {
  const cells: Cell[] = [
    { position: 'YEAR', stem: natal.pillars.year.stem, branch: natal.pillars.year.branch },
    { position: 'MONTH', stem: natal.pillars.month.stem, branch: natal.pillars.month.branch },
    { position: 'DAY', stem: natal.pillars.day.stem, branch: natal.pillars.day.branch },
  ];
  if (natal.pillars.hour) {
    cells.push({ position: 'HOUR', stem: natal.pillars.hour.stem, branch: natal.pillars.hour.branch });
  }
  return cells;
}

// 오행 보완: an element one person has NONE of, that the other supplies with a real presence
// (>= 2 slots). `sharedMissing` = an element that appears in NEITHER chart (a shared blind spot).
function elementComplement(
  self: SajuFiveElementCounts,
  target: SajuFiveElementCounts,
): PairwiseRelationFacts['elementComplement'] {
  const selfSuppliesTarget: FiveElement[] = [];
  const targetSuppliesSelf: FiveElement[] = [];
  const sharedMissing: FiveElement[] = [];
  for (const e of SAJU_FIVE_ELEMENT_KEYS) {
    const s = self[e] ?? 0;
    const t = target[e] ?? 0;
    if (t === 0 && s >= 2) selfSuppliesTarget.push(e);
    if (s === 0 && t >= 2) targetSuppliesSelf.push(e);
    if (s === 0 && t === 0) sharedMissing.push(e);
  }
  return { selfSuppliesTarget, targetSuppliesSelf, sharedMissing };
}

function tenGodOrNull(dayMaster: HeavenlyStem, target: HeavenlyStem): TenGod | null {
  const r = calculateTenGod(dayMaster, target);
  return r.ok ? r.value : null;
}

/**
 * Compute the complete deterministic pairwise fact set between two people's charts.
 * Returns null if either natal context is invalid (fail-closed, never fabricates).
 */
export function computePairwiseRelations(
  self: PersonPairwiseInput,
  target: PersonPairwiseInput,
): PairwiseRelationFacts | null {
  if (!isValidNatalContext(self.natal) || !isValidNatalContext(target.natal)) return null;

  const selfCells = pillarCells(self.natal);
  const targetCells = pillarCells(target.natal);

  const crossStemRelations: CrossStemRelation[] = [];
  const crossBranchRelations: CrossBranchRelation[] = [];
  for (const a of selfCells) {
    for (const b of targetCells) {
      const sr = stemRelation(a.stem, b.stem);
      if (sr) crossStemRelations.push({ self: a.position, target: b.position, relation: sr });
      for (const rel of branchRelations(a.branch, b.branch)) {
        crossBranchRelations.push({ self: a.position, target: b.position, relation: rel });
      }
    }
  }

  // The couple axis: day-master ↔ day-master and day-branch ↔ day-branch.
  const dayStemRelation = stemRelation(self.natal.pillars.day.stem, target.natal.pillars.day.stem);
  const dayBranchRelations = branchRelations(
    self.natal.pillars.day.branch,
    target.natal.pillars.day.branch,
  );

  // Set relations over the UNION of every branch present on both charts (삼합/방합/삼형 that only
  // form when the two people's branches are combined).
  const unionSetRelations = branchSetRelations([
    ...selfCells.map((c) => c.branch),
    ...targetCells.map((c) => c.branch),
  ]);

  return {
    self: {
      dayMaster: self.natal.dayMaster,
      dayBranch: self.natal.pillars.day.branch,
      elementCounts: self.elementCounts,
      hourKnown: self.hourKnown,
    },
    target: {
      dayMaster: target.natal.dayMaster,
      dayBranch: target.natal.pillars.day.branch,
      elementCounts: target.elementCounts,
      hourKnown: target.hourKnown,
    },
    dayStemRelation,
    dayBranchRelations,
    crossStemRelations,
    crossBranchRelations,
    unionSetRelations,
    tenGodTargetToSelf: tenGodOrNull(self.natal.dayMaster, target.natal.dayMaster),
    tenGodSelfToTarget: tenGodOrNull(target.natal.dayMaster, self.natal.dayMaster),
    elementComplement: elementComplement(self.elementCounts, target.elementCounts),
  };
}
