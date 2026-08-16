// Natal-internal pillar relations (원국 합/충/형/파/해 · 삼합/방합) among the four natal pillars.
// Reuses the frozen-consuming relation rules (deokbunai.myungri-pillar-relations.v1). Facts only.
// (calculateMyungriTimeAxis deliberately covers only luck-layer cross relations; this covers the
// static natal-internal set that Codex FIX #1 requires in the evidence.)
import {
  branchRelations,
  branchSetRelations,
  stemRelation,
  type BranchPairRelationFact,
  type BranchSetRelationFact,
  type StemRelationFact,
} from '../rules/pillarRelations';
import type { SajuPillarPosition } from '../../interpretation';
import type { NatalPillarContext } from '../domain/contracts';
import { isValidNatalContext } from './pillarFacts';

export type PositionedNatalStemRelation = {
  positions: [SajuPillarPosition, SajuPillarPosition];
  relation: StemRelationFact;
};
export type PositionedNatalBranchRelation = {
  positions: [SajuPillarPosition, SajuPillarPosition];
  relation: BranchPairRelationFact;
};

export type NatalRelationsResult = {
  stem: PositionedNatalStemRelation[];
  branch: PositionedNatalBranchRelation[];
  sets: BranchSetRelationFact[];
};

export function calculateNatalRelations(natal: NatalPillarContext): NatalRelationsResult | null {
  if (!isValidNatalContext(natal)) return null;
  const cells: { position: SajuPillarPosition; stem: string; branch: string }[] = [
    { position: 'YEAR', ...natal.pillars.year },
    { position: 'MONTH', ...natal.pillars.month },
    { position: 'DAY', ...natal.pillars.day },
  ];
  if (natal.pillars.hour) cells.push({ position: 'HOUR', ...natal.pillars.hour });

  const stem: PositionedNatalStemRelation[] = [];
  const branch: PositionedNatalBranchRelation[] = [];
  for (let i = 0; i < cells.length; i += 1) {
    for (let j = i + 1; j < cells.length; j += 1) {
      const a = cells[i];
      const b = cells[j];
      const sr = stemRelation(a.stem as never, b.stem as never);
      if (sr) stem.push({ positions: [a.position, b.position], relation: sr });
      for (const relation of branchRelations(a.branch as never, b.branch as never)) {
        branch.push({ positions: [a.position, b.position], relation });
      }
    }
  }
  const sets = branchSetRelations(cells.map((c) => c.branch as never));
  return { stem, branch, sets };
}
