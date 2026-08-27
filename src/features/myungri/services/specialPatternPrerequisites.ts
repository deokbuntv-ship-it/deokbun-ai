// Special-pattern (從格/專旺 etc.) PREREQUISITE facts — raw counts/positions ONLY, deterministic.
//
// A future special-pattern gate (docs/MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md §10) needs raw
// element/role counts and positions to evaluate its own conditions against — this module supplies
// exactly that and nothing more. It does NOT decide 從强/從財/從官殺/從兒/專旺 or any other
// pattern, does NOT emit a confirmed/candidate/rejected status, and does NOT compute a
// "dominance ratio" or any other threshold. Counting is the fact; what a count MEANS is doctrine,
// reserved for the (not-yet-implemented) future gate.
//
// Branch/stem RELATION topology is already available from relationParticipants.ts (participant
// linkage) and natalRelations.ts (raw detection) — this module does not duplicate it.
//
// The 5-role classical grouping used here (PARALLEL/RESOURCE/OUTPUT/WEALTH/OFFICER, i.e.
// 비겁/인성/식상/재성/관성) is a fixed, undisputed classical Ten-God taxonomy — the SAME
// definition dayMasterStrengthInputs.ts uses — but is independently re-derived here rather than
// imported from that file, and deliberately DROPS its SUPPORT/DRAIN side tag entirely, so this
// module carries zero directional (support-vs-drain) framing, even a classically-fixed one. See
// docs/MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md for why this sprint avoids that framing everywhere.
//
// FACT ONLY. No CONGCAI/CONGGUANSHA/CONGER/SPECIAL_PATTERN_SCORE/SPECIAL_PATTERN_CONFIRMED —
// those remain out of scope.
import {
  getHiddenStems, getStemElement, calculateTenGod,
  type EarthlyBranch, type FiveElement, type HeavenlyStem, type SajuPillarPosition, type TenGod,
} from '../../interpretation';
import type { NatalPillarContext } from '../domain/contracts';
import { isValidNatalContext } from './pillarFacts';
import { calculateSameElementRooting } from './sameElementRooting';

export const DEOKBUNAI_MYUNGRI_SPECIAL_PATTERN_PREREQUISITES_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_SPECIAL_PATTERN_PREREQUISITES_V1',
  ruleVersion: 'deokbunai.myungri-special-pattern-prerequisites.v1',
} as const;

/** Fixed classical Ten-God role grouping (비겁/인성/식상/재성/관성). Not a weighting choice, not
 *  contested — the same definition dayMasterStrengthInputs.ts uses, independently re-derived here
 *  with the SUPPORT/DRAIN side tag deliberately omitted (see module header). */
export type RoleCategory = 'PARALLEL' | 'RESOURCE' | 'OUTPUT' | 'WEALTH' | 'OFFICER';

const TEN_GOD_ROLE_CATEGORY: Readonly<Record<TenGod, RoleCategory>> = {
  PEER: 'PARALLEL',
  ROB_WEALTH: 'PARALLEL',
  DIRECT_RESOURCE: 'RESOURCE',
  INDIRECT_RESOURCE: 'RESOURCE',
  EATING_GOD: 'OUTPUT',
  HURTING_OFFICER: 'OUTPUT',
  DIRECT_WEALTH: 'WEALTH',
  INDIRECT_WEALTH: 'WEALTH',
  DIRECT_OFFICER: 'OFFICER',
  SEVEN_KILLINGS: 'OFFICER',
} as const;

/** Raw count across the DIRECT (visible, non-DAY) stem slots. Never weighted, never a percentage. */
export type ElementCounts = Record<FiveElement, number>;

const zeroElementCounts = (): ElementCounts => ({ WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 });

export type RoleCategoryPresenceFact = {
  role: RoleCategory;
  visibleCount: number;
  hiddenCount: number;
  visiblePositions: readonly SajuPillarPosition[];
  /** May repeat a position when that branch's 지장간 holds more than one stem of this role. */
  hiddenPositions: readonly SajuPillarPosition[];
};

export type SameElementRootPosition = {
  position: SajuPillarPosition;
  branch: EarthlyBranch;
};

export type SpecialPatternPrerequisitesResult =
  | {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_SPECIAL_PATTERN_PREREQUISITES_V1_RULE.ruleVersion;
      dayMaster: HeavenlyStem;
      dayMasterElement: FiveElement;
      /** Raw counts across visible (non-DAY) stems only — mirrors calculateFiveElementDistribution's
       *  own discipline: RAW counts, never weighted/percent. */
      visibleElementCounts: ElementCounts;
      /** Raw counts across all hidden stems (all four branches, all qi tiers). */
      hiddenElementCounts: ElementCounts;
      /** Positions (branch identity only) where a same-element root exists — literally
       *  `calculateSameElementRooting(natal).sameElementRoots` reduced to position+branch, no
       *  re-derivation. Presence/position only, no judgment about strength or survival. */
      sameElementRootPositions: readonly SameElementRootPosition[];
      /** One entry per role category (5 total) — visible/hidden counts and positions, no side tag. */
      roleCategoryPresence: readonly RoleCategoryPresenceFact[];
      limitations: readonly string[];
    }
  | {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_SPECIAL_PATTERN_PREREQUISITES_V1_RULE.ruleVersion;
      reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE';
    };

const LIMITATIONS = [
  'RAW_COUNTS_AND_POSITIONS_ONLY_NO_DOMINANCE_RATIO_NO_THRESHOLD_NO_PATTERN_VERDICT',
  'NO_SPECIAL_PATTERN_GATE_LOGIC_HERE_SEE_CANONICAL_DOCTRINE_SECTION_10_FOR_THE_DEFERRED_RULE_SET',
] as const;

const unavailable = (
  reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE',
): SpecialPatternPrerequisitesResult => ({
  capability: 'UNAVAILABLE',
  ruleVersion: DEOKBUNAI_MYUNGRI_SPECIAL_PATTERN_PREREQUISITES_V1_RULE.ruleVersion,
  reason,
});

/** Raw element/role counts and same-element-root positions — deterministic FACT only. */
export function calculateSpecialPatternPrerequisites(
  natal: NatalPillarContext,
): SpecialPatternPrerequisitesResult {
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_CONTEXT');

  const dmElement = getStemElement(natal.dayMaster);
  if (!dmElement.ok) return unavailable('FROZEN_RULE_FAILURE');

  const positions: Array<{ position: SajuPillarPosition; stem: HeavenlyStem }> = [
    { position: 'YEAR', stem: natal.pillars.year.stem },
    { position: 'MONTH', stem: natal.pillars.month.stem },
    ...(natal.pillars.hour ? [{ position: 'HOUR' as const, stem: natal.pillars.hour.stem }] : []),
  ];
  // 일간(DAY) is the Day Master itself — excluded from visible counts/role presence (no ten-god
  // relation to itself), matching the same 억부 convention tenGodFacts.ts uses.

  const visibleElementCounts = zeroElementCounts();
  const roleVisible = new Map<RoleCategory, { count: number; positions: SajuPillarPosition[] }>();
  for (const { position, stem } of positions) {
    const element = getStemElement(stem);
    const tenGod = calculateTenGod(natal.dayMaster, stem);
    if (!element.ok || !tenGod.ok) return unavailable('FROZEN_RULE_FAILURE');
    visibleElementCounts[element.value] += 1;
    const role = TEN_GOD_ROLE_CATEGORY[tenGod.value];
    const entry = roleVisible.get(role) ?? { count: 0, positions: [] };
    entry.count += 1;
    entry.positions.push(position);
    roleVisible.set(role, entry);
  }

  const allPositions: Array<{ position: SajuPillarPosition; branch: EarthlyBranch }> = [
    { position: 'YEAR', branch: natal.pillars.year.branch },
    { position: 'MONTH', branch: natal.pillars.month.branch },
    { position: 'DAY', branch: natal.pillars.day.branch },
    ...(natal.pillars.hour ? [{ position: 'HOUR' as const, branch: natal.pillars.hour.branch }] : []),
  ];
  const hiddenElementCounts = zeroElementCounts();
  const roleHidden = new Map<RoleCategory, { count: number; positions: SajuPillarPosition[] }>();
  for (const { position, branch } of allPositions) {
    const hidden = getHiddenStems(branch);
    if (!hidden.ok) return unavailable('FROZEN_RULE_FAILURE');
    for (const hs of hidden.value) {
      const element = getStemElement(hs.stem);
      const tenGod = calculateTenGod(natal.dayMaster, hs.stem);
      if (!element.ok || !tenGod.ok) return unavailable('FROZEN_RULE_FAILURE');
      hiddenElementCounts[element.value] += 1;
      const role = TEN_GOD_ROLE_CATEGORY[tenGod.value];
      const entry = roleHidden.get(role) ?? { count: 0, positions: [] };
      entry.count += 1;
      entry.positions.push(position);
      roleHidden.set(role, entry);
    }
  }

  const rooting = calculateSameElementRooting(natal);
  if (rooting.capability !== 'AVAILABLE') {
    return unavailable(rooting.reason === 'INVALID_NATAL_CONTEXT' ? 'INVALID_NATAL_CONTEXT' : 'FROZEN_RULE_FAILURE');
  }
  const sameElementRootPositions: SameElementRootPosition[] = rooting.sameElementRoots.map((r) => ({
    position: r.position, branch: r.branch,
  }));

  const roles: RoleCategory[] = ['PARALLEL', 'RESOURCE', 'OUTPUT', 'WEALTH', 'OFFICER'];
  const roleCategoryPresence: RoleCategoryPresenceFact[] = roles.map((role) => ({
    role,
    visibleCount: roleVisible.get(role)?.count ?? 0,
    hiddenCount: roleHidden.get(role)?.count ?? 0,
    visiblePositions: roleVisible.get(role)?.positions ?? [],
    hiddenPositions: roleHidden.get(role)?.positions ?? [],
  }));

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_SPECIAL_PATTERN_PREREQUISITES_V1_RULE.ruleVersion,
    dayMaster: natal.dayMaster, dayMasterElement: dmElement.value,
    visibleElementCounts, hiddenElementCounts, sameElementRootPositions, roleCategoryPresence,
    limitations: LIMITATIONS,
  };
}
