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
// "this DAY-MASTER SAME-ELEMENT ROOT fact's branch is a member of this detected relation's branch
// set" — nothing more. A future doctrine-confirmed reasoner performs that judgment; this module
// only hands it the citable facts to judge over.
//
// FACT ID CONTRACT (remediation batch, audit finding F2): a relation fact's identity is derived
// from SEMANTIC content only — relation kind plus its participants, each participant canonically
// keyed by its pillar position and paired with the value that position actually contributes to the
// chart. It deliberately contains NO detector array index: the order in which `natalRelations.ts`
// happens to emit relations is an implementation detail of its scan loop, not part of what a
// relation IS, so the same semantic relation must keep the same fact id under any detector output
// ordering. See `__tests__/relationParticipants.test.ts`'s "factId semantic identity" block.
import { EARTHLY_BRANCHES, type EarthlyBranch, type HeavenlyStem, type SajuPillarPosition } from '../../interpretation';
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
  /** Day-Master SAME-ELEMENT root fact IDs (sameElementRooting.ts) located in EITHER participating
   *  branch. Genuine roots only — a co-located hidden stem of some other element is NOT listed.
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
  /** Day-Master SAME-ELEMENT root fact IDs only — see `BranchPairRelationParticipants` above. */
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
  'CANDIDATE_AFFECTED_ROOT_FACT_IDS_ARE_DAY_MASTER_SAME_ELEMENT_ROOTS_ONLY_NOT_ALL_CO_LOCATED_HIDDEN_STEMS',
  'FACT_IDS_ARE_SEMANTIC_ONLY_NO_DETECTOR_ARRAY_INDEX_SO_IDENTITY_SURVIVES_DETECTOR_REORDERING',
] as const;

const unavailable = (reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE'): RelationParticipantsResult => ({
  capability: 'UNAVAILABLE',
  ruleVersion: DEOKBUNAI_MYUNGRI_RELATION_PARTICIPANTS_V1_RULE.ruleVersion,
  reason,
});

/** Fixed chart-position order — the canonical sort key for participant identity. */
const POSITION_ORDER: readonly SajuPillarPosition[] = ['YEAR', 'MONTH', 'DAY', 'HOUR'];
const positionRank = (position: SajuPillarPosition): number => POSITION_ORDER.indexOf(position);
const branchRank = (branch: EarthlyBranch): number => EARTHLY_BRANCHES.indexOf(branch);

/**
 * Canonical participant token for a relation fact id: each participating pillar position paired
 * with the value THAT POSITION actually contributes, sorted by fixed chart-position order.
 *
 * The value is looked up from the chart by position rather than zipped against the detector's own
 * `stems`/`branches` array, so the pairing is correct by construction and cannot silently invert if
 * a detector ever emits its participant arrays in a different order than its position array.
 */
function canonicalParticipantToken(
  positions: readonly SajuPillarPosition[],
  valueByPosition: ReadonlyMap<SajuPillarPosition, string>,
): string {
  return [...positions]
    .sort((a, b) => positionRank(a) - positionRank(b))
    .map((position) => `${position}=${valueByPosition.get(position) ?? 'UNKNOWN'}`)
    .join('+');
}

/**
 * Day-Master same-element ROOT fact ids (sameElementRooting.ts) whose branch is among `positions`.
 *
 * Co-occurrence only — never an effect judgment. Restricted to GENUINE roots (audit finding F1):
 * `sameElementRooting.ts`'s `branches[].hiddenStems` is the COMPLETE hidden-stem catalog, so a
 * non-Day-Master-element hidden stem that merely happens to share a branch with a relation must
 * never be reported here — it is not a root at all, and labelling it a "candidate affected ROOT"
 * would hand a future reasoner a false premise about what the relation could possibly be touching.
 */
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
  // ONLY genuine Day-Master same-element roots (audit finding F1) — `branch.hiddenStems` is the
  // complete catalog, so it must be filtered before it can be called a root index.
  const rootsByPosition = new Map<SajuPillarPosition, HiddenStemFact[]>();
  const branchByPosition = new Map<SajuPillarPosition, EarthlyBranch>();
  for (const branch of rooting.branches) {
    rootsByPosition.set(branch.position, branch.hiddenStems.filter((h) => h.sameElementAsDayMaster));
    branchByPosition.set(branch.position, branch.branch);
  }

  // Position→value indexes used ONLY to build canonical, order-independent fact ids.
  const branchValueByPosition: ReadonlyMap<SajuPillarPosition, string> = branchByPosition;
  const stemValueByPosition = new Map<SajuPillarPosition, string>([
    ['YEAR', natal.pillars.year.stem],
    ['MONTH', natal.pillars.month.stem],
    ['DAY', natal.pillars.day.stem],
    ...(natal.pillars.hour ? ([['HOUR', natal.pillars.hour.stem]] as const) : []),
  ]);

  const stem: StemRelationParticipants[] = natalRelations.stem.map((r) => ({
    factId: `stem-relation-participants:${r.relation.kind}:${canonicalParticipantToken(r.positions, stemValueByPosition)}`,
    factKind: 'STEM_RELATION_PARTICIPANTS',
    relation: r.relation,
    participantPillars: r.positions,
    participantStems: r.relation.stems,
  }));

  const branchPair: BranchPairRelationParticipants[] = natalRelations.branch.map((r) => ({
    factId: `branch-pair-relation-participants:${r.relation.kind}:${canonicalParticipantToken(r.positions, branchValueByPosition)}`,
    factKind: 'BRANCH_PAIR_RELATION_PARTICIPANTS',
    relation: r.relation,
    participantPillars: r.positions,
    participantBranches: r.relation.branches,
    candidateAffectedRootFactIds: rootFactIdsAt(rootsByPosition, r.positions),
  }));

  // Set relations (삼합/방합/삼형) are reported by natalRelations.ts as branch VALUES only, with no
  // position tracking — a set relation is about which branch VALUES form the pattern, so every
  // natal position sharing a member value is a genuine participant, including duplicates.
  const branchSet: BranchSetRelationParticipants[] = natalRelations.sets.map((relation) => {
    const memberBranches = new Set(relation.branches);
    const participantPillars: SajuPillarPosition[] = [];
    for (const [position, branchAtPosition] of branchByPosition) {
      if (memberBranches.has(branchAtPosition)) participantPillars.push(position);
    }
    // A set relation's semantic identity is its kind plus the BRANCH SET that forms it (canonically
    // ordered), qualified by which chart positions supply that set — never the detector's scan
    // index. Branch values are sorted by fixed 지지 order so identity survives any table/scan
    // reordering; positions are appended because the same trio supplied from different pillars is
    // genuinely different provenance.
    const canonicalBranches = [...relation.branches].sort((a, b) => branchRank(a) - branchRank(b)).join('+');
    const canonicalPositions = [...participantPillars]
      .sort((a, b) => positionRank(a) - positionRank(b))
      .join('+');
    return {
      factId: `branch-set-relation-participants:${relation.kind}:${canonicalBranches}:${canonicalPositions}`,
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
