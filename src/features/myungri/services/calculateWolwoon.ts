// 월운 (Wolwoon / monthly luck) — the sexagenary MONTH pillar for a (사주 year, 月 ordinal), its
// 십신 vs the natal day master, its relations to the natal chart, and its relation to the
// containing 세운 pillar.
//
// CONNECTED-BY-CONSTRUCTION: the month pillar is produced by the FROZEN `calculateMonthPillar`
// (五虎遁 년상기월법 — 월간 derived from the year stem) applied to the SAME year pillar 세운 uses.
// So 세운 → 월운 is one continuous rule chain, and the natal month pillar shares the exact rule.
//
// MONTH BASIS: `lunarMonth` is the 사주 月 ordinal 1..12 (寅월=1 … 丑월=12), matching the frozen
// natal month-pillar rule EXACTLY. Mapping a civil (Gregorian) month to this ordinal is a
// product-layer concern (the frozen calendar resolver), intentionally out of this engine.
import { calculateMonthPillar, calculateYearPillar, type LunarMonthOrdinal } from '../../interpretation';
import { branchRelations, stemRelation } from '../rules/pillarRelations';
import {
  DEOKBUNAI_MYUNGRI_WOLWOON_V1_RULE,
  type NatalPillarContext,
  type WolwoonResult,
} from '../domain/contracts';
import {
  buildRelationsToNatal,
  buildTenGodProfile,
  isHeavenlyStem,
  isValidNatalContext,
  myungriProvenance,
} from './pillarFacts';

const ASSUMPTIONS = [
  'WOLWOON_PILLAR_USES_FROZEN_DEOKBUNAI_SAJU_MONTH_PILLAR_RULE_FIVE_TIGER_DUN',
  'MONTH_STEM_DERIVED_FROM_THE_SEWOON_YEAR_STEM',
  'LUNAR_MONTH_IS_THE_SAJU_MONTH_ORDINAL_1_THROUGH_12_YIN_MONTH_IS_ONE',
  'TEN_GODS_ARE_RELATIVE_TO_THE_NATAL_DAY_MASTER',
] as const;

const LIMITATIONS = [
  'CIVIL_GREGORIAN_MONTH_TO_SAJU_MONTH_ORDINAL_MAPPING_IS_A_PRODUCT_LAYER_CONCERN',
  'MONTH_BOUNDARY_JEOLGI_INSTANT_ATTRIBUTION_OUT_OF_V1_SCOPE',
  'RELATION_FACTS_ARE_UNWEIGHTED_NO_HAPHWA_SEONGRIP_OR_STRENGTH',
] as const;

function unavailable(
  reason: Extract<WolwoonResult, { capability: 'UNAVAILABLE' }>['reason'],
): WolwoonResult {
  return {
    capability: 'UNAVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_WOLWOON_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

export type WolwoonCalculationInput = {
  targetYear: number;
  /** 사주 月 ordinal 1..12 (寅월=1 … 丑월=12). */
  lunarMonth: number;
  natal: NatalPillarContext;
};

export function calculateWolwoon(input: WolwoonCalculationInput): WolwoonResult {
  const { targetYear, lunarMonth, natal } = input;

  if (!isHeavenlyStem(natal?.dayMaster)) return unavailable('INVALID_DAY_MASTER');
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_PILLAR');
  if (!Number.isInteger(targetYear)) return unavailable('INVALID_TARGET_YEAR');
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    return unavailable('INVALID_MONTH_ORDINAL');
  }

  const yearPillar = calculateYearPillar(targetYear);
  if (!yearPillar.ok) return unavailable('PILLAR_CALCULATION_FAILED');

  const pillar = calculateMonthPillar(yearPillar.value, lunarMonth as LunarMonthOrdinal);
  if (!pillar.ok) return unavailable('PILLAR_CALCULATION_FAILED');

  const tenGods = buildTenGodProfile(natal.dayMaster, pillar.value);
  if (!tenGods) return unavailable('TEN_GOD_CALCULATION_FAILED');

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_WOLWOON_V1_RULE.ruleVersion,
    targetYear,
    lunarMonth: lunarMonth as LunarMonthOrdinal,
    dayMaster: natal.dayMaster,
    yearPillar: yearPillar.value,
    pillar: pillar.value,
    tenGods,
    relationsToNatal: buildRelationsToNatal(pillar.value, natal),
    relationToSewoon: {
      stem: stemRelation(pillar.value.stem, yearPillar.value.stem),
      branch: branchRelations(pillar.value.branch, yearPillar.value.branch),
    },
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}
