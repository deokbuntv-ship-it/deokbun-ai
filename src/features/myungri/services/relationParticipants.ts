// Relation PARTICIPANT LINKAGE — deterministic FACT ONLY, detection-adjacent, never effect.
//
// pillarRelations.ts / natalRelations.ts already DETECT every relation type (합/충/형/파/해/삼합/
// 방합). This module adds, for each DETECTED relation, exactly which pillar positions/stems/
// branches participate, and — where mechanically derivable — which same-element root facts
// (sameElementRooting.ts) sit inside a participating branch.
//
// HARD INVARIANT (docs/MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md §8's DETECTION vs FORMATION/
// VALIDITY vs TRANSFORMATION vs FUNCTIONAL EFFECT vs STRENGTH EFFECT five-question layering):
// this module answers ONLY "who participates" and "which root sits inside a participating
// branch." It NEVER answers whether a clash destroys that root, whether a 三合/方合 becomes a
// transformed bureau, or whether a 合 actually 化s. `candidateAffectedRootFactIds` means exactly
// "this root fact's branch is a member of this detected relation's branch set" — nothing more.
// A future doctrine-confirmed reasoner performs that judgment; this module only hands it the
// citable facts to judge over.
import type { EarthlyBranch, HeavenlyStem, SajuPillarPosition } from '../../interpretation';
import type {
  BranchPairRelationFact, BranchSetRelationFact, StemRelationFact,
} from '../rules/pillarRelations';
import type { NatalPillarContext } from '../domain/contracts';
import { calculateNatalRelations } from './natalRelations';
import { calculateSameElementRooting, type HiddenStemFact } from './sameElementRooting';

export const DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1',
  ruleVersion: 'deokbunai.myungri-relation-participants.v1',
} as const;

export type StemRelationParticipants = {
  factId: string;
  factKind: 'STEM_RELATION_PARTICIPANTS';
  relation: StemRelationFact;
  participantPillars: readonly [SajuPillarPosition, SajuPillarPosition];
  participantStems: readonly [HeavenlyStem, HeavenlyStem];
};

export type BranchPairRelationParticipants = {
  factId: string;
  factKind: 'BRANCH_PAIR_RELATION_PARTICIPANTS';
  relation: BranchPairRelationFact;
  participantPillars: readonly [SajuPillarPosition, SajuPillarPosition];
  participantBranches: readonly [EarthlyBranch, EarthlyBranch];
  /** Hidden-stem root fact IDs (sameElementRooting.ts) located in EITHER participating branch.
   *  Existence-of-co-occurrence only — see module header. */
  candidateAffectedRootFactIds: readonly string[];
};

export type BranchSetRelationParticipants = {
  factId: string;
  factKind: 'BRANCH_SET_RELATION_PARTICIPANTS';
  relation: BranchSetRelationFact;
  /** Every natal position whose branch value is a member of this set. A duplicated branch value
   *  across positions (e.g. 년지=시지) yields every matching position, not just one. */
  participantPillars: readonly SajuPillarPosition[];
  participantBranches: readonly EarthlyBranch[];
  candidateAffectedRootFactIds: readonly string[];
};

export type RelationParticipantsResult =
  | {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1_RULE.ruleVersion;
      stem: readonly StemRelationParticipants[];
      branchPair: readonly BranchPairRelationParticipants[];
      branchSet: readonly BranchSetRelationParticipants[];
      limitations: readonly string[];
    }
  | {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1_RULE.ruleVersion;
      reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE';
    };

const LIMITATIONS = [
  'PARTICIPANT_LINKAGE_ONLY_NO_CLASH_DAMAGE_NO_COMBINATION_TRANSFORMATION_NO_BUREAU_FORMATION_JUDGMENT',
  'CANDIDATE_AFFECTED_ROOT_FACT_IDS_MEANS_CO_OCCURRENCE_IN_A_PARTICIPATING_BRANCH_ONLY',
] as const;

const unavailable = (reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE'): RelationParticipantsResult => ({
  capability: 'UNAVAILABLE',
  ruleVersion: DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1_RULE.ruleVersion,
  reason,
});

const relationKindTag = (relation: BranchPairRelationFact | BranchSetRelationFact): string => relation.kind;

/** Root fact ids (sameElementRooting.ts) whose branch is among `positions`. Co-occurrence only. */
function rootFactIdsAt(
  rootsByPosition: ReadonlyMap<SajuPillarPosition, readonly HiddenStemFact[]>,
  positions: readonly SajuPillarPosition[],
): string[] {
  const ids: string[] = [];
  for (const position of positions) {
    for (const root of rootsByPosition.get(position) ?? []) ids.push(root.factId);
  }
  return ids;
}

/**
 * Participant linkage for every relation natalRelations.ts / pillarRelations.ts already detects.
 * FACT ONLY — see module header for the hard DETECTION-vs-EFFECT invariant.
 */
export function calculateRelationParticipants(natal: NatalPillarContext): RelationParticipantsResult {
  const natalRelations = calculateNatalRelations(natal);
  if (!natalRelations) return unavailable('INVALID_NATAL_CONTEXT');

  const rooting = calculateSameElementRooting(natal);
  if (rooting.capability !== 'AVAILABLE') {
    return unavailable(rooting.reason === 'INVALID_NATAL_CONTEXT' ? 'INVALID_NATAL_CONTEXT' : 'FROZEN_RULE_FAILURE');
  }
  const rootsByPosition = new Map<SajuPillarPosition, HiddenStemFact[]>();
  const branchByPosition = new Map<SajuPillarPosition, EarthlyBranch>();
  for (const branch of rooting.branches) {
    rootsByPosition.set(branch.position, [...branch.hiddenStems]);
    branchByPosition.set(branch.position, branch.branch);
  }

  const stem: StemRelationParticipants[] = natalRelations.stem.map((r, i) => ({
    factId: `stem-relation-participants:${i}:${r.positions.join('-')}:${r.relation.kind}`,
    factKind: 'STEM_RELATION_PARTICIPANTS',
    relation: r.relation,
    participantPillars: r.positions,
    participantStems: r.relation.stems,
  }));

  const branchPair: BranchPairRelationParticipants[] = natalRelations.branch.map((r, i) => ({
    factId: `branch-pair-relation-participants:${i}:${r.positions.join('-')}:${relationKindTag(r.relation)}`,
    factKind: 'BRANCH_PAIR_RELATION_PARTICIPANTS',
    relation: r.relation,
    participantPillars: r.positions,
    participantBranches: r.relation.branches,
    candidateAffectedRootFactIds: rootFactIdsAt(rootsByPosition, r.positions),
  }));

  // Set relations (삼합/방합/삼형) are reported by natalRelations.ts as branch VALUES only, with no
  // position tracking — a set relation is about which branch VALUES form the pattern, so every
  // natal position sharing a member value is a genuine participant, including duplicates.
  const branchSet: BranchSetRelationParticipants[] = natalRelations.sets.map((relation, i) => {
    const memberBranches = new Set(relation.branches);
    const participantPillars: SajuPillarPosition[] = [];
    for (const [position, branchAtPosition] of branchByPosition) {
      if (memberBranches.has(branchAtPosition)) participantPillars.push(position);
    }
    return {
      factId: `branch-set-relation-participants:${i}:${relation.kind}:${relation.branches.join('-')}`,
      factKind: 'BRANCH_SET_RELATION_PARTICIPANTS',
      relation,
      participantPillars,
      participantBranches: relation.branches,
      candidateAffectedRootFactIds: rootFactIdsAt(rootsByPosition, participantPillars),
    };
  });

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1_RULE.ruleVersion,
    stem, branchPair, branchSet, limitations: LIMITATIONS,
  };
}
