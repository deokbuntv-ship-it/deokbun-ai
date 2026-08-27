// Ten-god (십신) FACT coverage for visible AND hidden stems — deterministic FACT ONLY.
//
// Every one of the 10 frozen TenGod values (PEER/ROB_WEALTH/EATING_GOD/HURTING_OFFICER/
// INDIRECT_WEALTH/DIRECT_WEALTH/SEVEN_KILLINGS/DIRECT_OFFICER/INDIRECT_RESOURCE/DIRECT_RESOURCE)
// is reachable via the frozen calculateTenGod() rule; this module catalogues them per stem,
// visible and hidden, with pillar-position/branch linkage. Deliberately NOT the 비겁/인성/식상/
// 재성/관성 role grouping or the SUPPORT/DRAIN side tag dayMasterStrengthInputs.ts uses — that
// grouping is a real, fixed classical taxonomy (not itself a weighting choice), but this module
// stays one layer more primitive than even that, exposing only the raw TenGod identity per stem,
// so nothing in the pure fact layer carries any directional (SUPPORT/DRAIN) framing at all. A
// future doctrine-confirmed reasoner may apply its own role/side categorization on top of these
// facts; this module does not pre-decide it.
//
// FACT ONLY. No strength contribution, no role grouping, no side (support/drain) tag.
import {
  calculateTenGod, getHiddenStems, getStemElement, getStemYinYang,
  type EarthlyBranch, type FiveElement, type HeavenlyStem, type HiddenStemRole, type SajuPillarPosition,
  type TenGod, type YinYang,
} from '../../interpretation';
import type { NatalPillarContext } from '../domain/contracts';
import { isValidNatalContext } from './pillarFacts';

export const DEOKBUNAI_MYUNGRI_TEN_GOD_FACTS_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_TEN_GOD_FACTS_V1',
  ruleVersion: 'deokbunai.myungri-ten-god-facts.v1',
} as const;

export type VisibleStemTenGodFact = {
  factId: string;
  factKind: 'VISIBLE_STEM_TEN_GOD';
  position: SajuPillarPosition;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  element: FiveElement;
  yinYang: YinYang;
  /** The Day Master's own stem position (DAY) is excluded — a stem has no ten-god relation to itself. */
  tenGod: TenGod;
};

export type HiddenStemTenGodFact = {
  factId: string;
  factKind: 'HIDDEN_STEM_TEN_GOD';
  position: SajuPillarPosition;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  element: FiveElement;
  yinYang: YinYang;
  hiddenRole: HiddenStemRole;
  tenGod: TenGod;
};

export type TenGodFactsResult =
  | {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_TEN_GOD_FACTS_V1_RULE.ruleVersion;
      dayMaster: HeavenlyStem;
      /** 년간/월간/시간 only — 일간(DAY) is the Day Master itself, excluded per 억부 convention
       *  (a stem is not counted as its own ten-god). */
      visibleStems: readonly VisibleStemTenGodFact[];
      /** All hidden stems across all four natal branches (including 일지). */
      hiddenStems: readonly HiddenStemTenGodFact[];
      limitations: readonly string[];
    }
  | {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_TEN_GOD_FACTS_V1_RULE.ruleVersion;
      reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE';
    };

const LIMITATIONS = [
  'RAW_TEN_GOD_IDENTITY_ONLY_NO_ROLE_GROUPING_NO_SUPPORT_DRAIN_SIDE_NO_STRENGTH_CONTRIBUTION',
] as const;

const unavailable = (reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE'): TenGodFactsResult => ({
  capability: 'UNAVAILABLE',
  ruleVersion: DEOKBUNAI_MYUNGRI_TEN_GOD_FACTS_V1_RULE.ruleVersion,
  reason,
});

/** Every visible (non-DAY) and hidden stem's raw ten-god relation to the Day Master. FACT only. */
export function calculateTenGodFacts(natal: NatalPillarContext): TenGodFactsResult {
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_CONTEXT');

  const positions: Array<{ position: SajuPillarPosition; stem: HeavenlyStem; branch: EarthlyBranch }> = [
    { position: 'YEAR', stem: natal.pillars.year.stem, branch: natal.pillars.year.branch },
    { position: 'MONTH', stem: natal.pillars.month.stem, branch: natal.pillars.month.branch },
    { position: 'DAY', stem: natal.pillars.day.stem, branch: natal.pillars.day.branch },
    ...(natal.pillars.hour
      ? [{ position: 'HOUR' as const, stem: natal.pillars.hour.stem, branch: natal.pillars.hour.branch }]
      : []),
  ];

  const visibleStems: VisibleStemTenGodFact[] = [];
  for (const { position, stem, branch } of positions) {
    // 일간(DAY) 자신은 십신 대상에서 제외 — 자기 자신에 대한 십신은 없다 (억부 관례).
    if (position === 'DAY') continue;
    const element = getStemElement(stem);
    const yinYang = getStemYinYang(stem);
    const tenGod = calculateTenGod(natal.dayMaster, stem);
    if (!element.ok || !yinYang.ok || !tenGod.ok) return unavailable('FROZEN_RULE_FAILURE');
    visibleStems.push({
      factId: `visible-stem-ten-god:${position}:${stem}`,
      factKind: 'VISIBLE_STEM_TEN_GOD',
      position, branch, stem, element: element.value, yinYang: yinYang.value, tenGod: tenGod.value,
    });
  }

  const hiddenStems: HiddenStemTenGodFact[] = [];
  for (const { position, branch } of positions) {
    const hidden = getHiddenStems(branch);
    if (!hidden.ok) return unavailable('FROZEN_RULE_FAILURE');
    for (const hs of hidden.value) {
      const element = getStemElement(hs.stem);
      const yinYang = getStemYinYang(hs.stem);
      const tenGod = calculateTenGod(natal.dayMaster, hs.stem);
      if (!element.ok || !yinYang.ok || !tenGod.ok) return unavailable('FROZEN_RULE_FAILURE');
      hiddenStems.push({
        factId: `hidden-stem-ten-god:${position}:${branch}:${hs.role}:${hs.stem}`,
        factKind: 'HIDDEN_STEM_TEN_GOD',
        position, branch, stem: hs.stem, element: element.value, yinYang: yinYang.value,
        hiddenRole: hs.role, tenGod: tenGod.value,
      });
    }
  }

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_TEN_GOD_FACTS_V1_RULE.ruleVersion,
    dayMaster: natal.dayMaster, visibleStems, hiddenStems, limitations: LIMITATIONS,
  };
}
