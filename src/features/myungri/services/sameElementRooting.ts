// Day-Master SAME-ELEMENT rooting — deterministic FACT ONLY.
//
// Distinct from rootingTransparency.ts, which computes SAME-STEM identity matches only, per that
// file's own stated LIMITATION: 'SAME_ELEMENT_ROOTING_IS_A_SEPARATE_DEFERRED_POLICY_NOT_COMPUTED_
// HERE'. This module fills that gap as its own standalone, non-tainted fact provider (closes
// docs/MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md's P0-6/P0-3), deliberately NOT reusing the
// rejected natalStrength.ts's inline computation (`inputs.hiddenStems.filter(h => h.role ===
// 'PARALLEL')`), which lived only inside that disabled file, not as a standalone fact.
//
// FACT ONLY. For every natal branch, every hidden stem is catalogued with its element/폴yin-yang/
// qi-tier role and its RELATIONSHIP to the Day Master (same element? same stem? same polarity?) as
// plain booleans. No root strength, no root rank, no survivability, no functional-effectiveness
// judgment is computed anywhere in this file — those are INFERENCE, reserved for a future strength
// reasoner once doctrine is confirmed. See docs/MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md §5.1's
// ROOT_EXISTS vs ROOT_FUNCTIONALLY_EFFECTIVE distinction and docs/MYUNGRI_STRENGTH_V1_FACT_
// FOUNDATION.md for the FACT/INFERENCE/VERDICT boundary this module sits on.
import {
  getHiddenStems, getStemElement, getStemYinYang,
  type EarthlyBranch, type FiveElement, type HeavenlyStem, type HiddenStemRole, type SajuPillarPosition,
  type YinYang,
} from '../../interpretation';
import type { NatalPillarContext } from '../domain/contracts';
import { isValidNatalContext } from './pillarFacts';

export const DEOKBUNAI_MYUNGRI_SAME_ELEMENT_ROOTING_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_SAME_ELEMENT_ROOTING_V1',
  ruleVersion: 'deokbunai.myungri-same-element-rooting.v1',
} as const;

export type DayMasterIdentityFact = {
  stem: HeavenlyStem;
  element: FiveElement;
  yinYang: YinYang;
};

/** One hidden stem inside one natal branch, annotated ONLY with its relationship to the Day Master. */
export type HiddenStemFact = {
  /** Stable id for downstream citation — a future reasoner cites this, never reconstructs it from prose. */
  factId: string;
  factKind: 'HIDDEN_STEM';
  position: SajuPillarPosition;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  element: FiveElement;
  yinYang: YinYang;
  hiddenRole: HiddenStemRole;
  /** Same five-element category as the Day Master (regardless of polarity). Existence only. */
  sameElementAsDayMaster: boolean;
  /** Identical stem to the Day Master (same element AND same polarity). Existence only. */
  sameStemAsDayMaster: boolean;
  /** Same yin/yang polarity as the Day Master, independent of element. */
  samePolarityAsDayMaster: boolean;
};

export type BranchHiddenStemFacts = {
  position: SajuPillarPosition;
  branch: EarthlyBranch;
  hiddenStems: readonly HiddenStemFact[];
};

export type SameElementRootingResult =
  | {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_SAME_ELEMENT_ROOTING_V1_RULE.ruleVersion;
      dayMaster: DayMasterIdentityFact;
      /** EVERY hidden stem in EVERY natal branch — the complete catalog, not pre-filtered. */
      branches: readonly BranchHiddenStemFacts[];
      /** Convenience subset of the same facts where sameElementAsDayMaster is true. Not a new
       *  judgment — literally `branches[].hiddenStems.filter(h => h.sameElementAsDayMaster)`,
       *  exposed directly so a caller does not have to re-derive it. */
      sameElementRoots: readonly HiddenStemFact[];
      limitations: readonly string[];
    }
  | {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_SAME_ELEMENT_ROOTING_V1_RULE.ruleVersion;
      reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE';
    };

const LIMITATIONS = [
  'EXISTENCE_FACT_ONLY_NO_ROOT_STRENGTH_NO_ROOT_RANK_NO_SURVIVABILITY_NO_FUNCTIONAL_EFFECTIVENESS',
  'DOES_NOT_APPLY_ANY_CLASH_OR_COMBINATION_OUTCOME_SEE_RELATION_PARTICIPANTS_FOR_LINKAGE_ONLY',
] as const;

const unavailable = (reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE'): SameElementRootingResult => ({
  capability: 'UNAVAILABLE',
  ruleVersion: DEOKBUNAI_MYUNGRI_SAME_ELEMENT_ROOTING_V1_RULE.ruleVersion,
  reason,
});

/**
 * Every hidden stem, across all natal branches, catalogued with its relationship to the Day
 * Master — deterministic FACT only. See module header: this is existence, not strength.
 */
export function calculateSameElementRooting(natal: NatalPillarContext): SameElementRootingResult {
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_CONTEXT');

  const dmElement = getStemElement(natal.dayMaster);
  const dmYinYang = getStemYinYang(natal.dayMaster);
  if (!dmElement.ok || !dmYinYang.ok) return unavailable('FROZEN_RULE_FAILURE');
  const dayMaster: DayMasterIdentityFact = {
    stem: natal.dayMaster, element: dmElement.value, yinYang: dmYinYang.value,
  };

  const positions: Array<{ position: SajuPillarPosition; branch: EarthlyBranch }> = [
    { position: 'YEAR', branch: natal.pillars.year.branch },
    { position: 'MONTH', branch: natal.pillars.month.branch },
    { position: 'DAY', branch: natal.pillars.day.branch },
    ...(natal.pillars.hour ? [{ position: 'HOUR' as const, branch: natal.pillars.hour.branch }] : []),
  ];

  const branches: BranchHiddenStemFacts[] = [];
  for (const { position, branch } of positions) {
    const hidden = getHiddenStems(branch);
    if (!hidden.ok) return unavailable('FROZEN_RULE_FAILURE');
    const hiddenStems: HiddenStemFact[] = [];
    for (const hs of hidden.value) {
      const element = getStemElement(hs.stem);
      const yinYang = getStemYinYang(hs.stem);
      if (!element.ok || !yinYang.ok) return unavailable('FROZEN_RULE_FAILURE');
      hiddenStems.push({
        factId: `hidden-stem:${position}:${branch}:${hs.role}:${hs.stem}`,
        factKind: 'HIDDEN_STEM',
        position, branch,
        stem: hs.stem, element: element.value, yinYang: yinYang.value, hiddenRole: hs.role,
        sameElementAsDayMaster: element.value === dayMaster.element,
        sameStemAsDayMaster: hs.stem === dayMaster.stem,
        samePolarityAsDayMaster: yinYang.value === dayMaster.yinYang,
      });
    }
    branches.push({ position, branch, hiddenStems });
  }

  const sameElementRoots = branches.flatMap((b) => b.hiddenStems.filter((h) => h.sameElementAsDayMaster));

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_SAME_ELEMENT_ROOTING_V1_RULE.ruleVersion,
    dayMaster, branches, sameElementRoots, limitations: LIMITATIONS,
  };
}
