// 세운 (Sewoon / yearly luck) — the sexagenary YEAR pillar governing a target 사주 year, its 십신
// vs the natal day master, and its 합/충/형/파/해 relations to the natal chart.
//
// CONNECTED-BY-CONSTRUCTION: the yearly pillar is produced by the FROZEN `calculateYearPillar`
// (`deokbunai.saju-year-pillar` inside the SAJU V1 rule) — the exact function that produces the
// natal YEAR pillar — so 원국 and 세운 sit on one rule family. 십신 use the frozen ten-god rule.
import { calculateYearPillar } from '../../interpretation';
import {
  DEOKBUNAI_MYUNGRI_SEWOON_V1_RULE,
  type NatalPillarContext,
  type SewoonResult,
} from '../domain/contracts';
import {
  buildRelationsToNatal,
  buildTenGodProfile,
  isHeavenlyStem,
  isValidNatalContext,
  myungriProvenance,
} from './pillarFacts';

const ASSUMPTIONS = [
  'SEWOON_PILLAR_USES_FROZEN_DEOKBUNAI_SAJU_YEAR_PILLAR_RULE',
  'TARGET_YEAR_IS_THE_SAJU_YEAR_LABEL_GREGORIAN_APPROXIMATELY_EQUALS_SAJU_YEAR',
  'TEN_GODS_ARE_RELATIVE_TO_THE_NATAL_DAY_MASTER',
  'RELATIONS_USE_CANONICAL_PAIRWISE_TABLES',
] as const;

const LIMITATIONS = [
  'YEAR_LABEL_GRANULARITY_ONLY_SUB_YEAR_IPCHUN_BOUNDARY_ATTRIBUTION_OUT_OF_V1_SCOPE',
  'RELATION_FACTS_ARE_UNWEIGHTED_NO_HAPHWA_SEONGRIP_OR_STRENGTH',
  'HYUNG_PA_HAE_USE_STANDARD_TABLES_MINOR_SCHOOL_VARIANTS_EXIST',
] as const;

function unavailable(
  reason: Extract<SewoonResult, { capability: 'UNAVAILABLE' }>['reason'],
): SewoonResult {
  return {
    capability: 'UNAVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_SEWOON_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

export type SewoonCalculationInput = {
  targetYear: number;
  natal: NatalPillarContext;
};

export function calculateSewoon(input: SewoonCalculationInput): SewoonResult {
  const { targetYear, natal } = input;

  if (!isHeavenlyStem(natal?.dayMaster)) return unavailable('INVALID_DAY_MASTER');
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_PILLAR');
  if (!Number.isInteger(targetYear)) return unavailable('INVALID_TARGET_YEAR');

  const pillar = calculateYearPillar(targetYear);
  if (!pillar.ok) return unavailable('PILLAR_CALCULATION_FAILED');

  const tenGods = buildTenGodProfile(natal.dayMaster, pillar.value);
  if (!tenGods) return unavailable('TEN_GOD_CALCULATION_FAILED');

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_SEWOON_V1_RULE.ruleVersion,
    targetYear,
    dayMaster: natal.dayMaster,
    pillar: pillar.value,
    tenGods,
    relationsToNatal: buildRelationsToNatal(pillar.value, natal),
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}
