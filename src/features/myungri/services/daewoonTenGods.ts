// 대운십신 (Daewoon ten-gods). ENGINE-12 already computed the Daewoon cycles (direction, start age,
// 10-year progression, 간지) — this NEVER recomputes any of that. It only CONNECTS each cycle's 간지
// to the natal 일간 via the frozen ten-god + hidden-stem rules, producing deterministic facts.
import type { DaewoonCycle, HeavenlyStem } from '../../interpretation';
import {
  DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1_RULE,
  type MyungriProvenance,
  type PillarTenGodProfile,
} from '../domain/contracts';
import { buildTenGodProfile, isHeavenlyStem, myungriProvenance } from './pillarFacts';

export type DaewoonCycleTenGods = {
  /** Cycle identifier carried over from ENGINE-12 — NOT recomputed. */
  ordinal: number;
  startAgeInclusive: number;
  endAgeInclusive: number;
  /** 대운 천간 십신 + 대운 지지 지장간 각각의 십신 (relative to the natal 일간). */
  tenGods: PillarTenGodProfile;
};

export type DaewoonTenGodsUnavailableReason =
  | 'INVALID_DAY_MASTER'
  | 'NO_CYCLES'
  | 'TEN_GOD_CALCULATION_FAILED';

type Base = { provenance: MyungriProvenance; assumptions: readonly string[]; limitations: readonly string[] };

export type DaewoonTenGodsResult =
  | (Base & {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1_RULE.ruleVersion;
      dayMaster: HeavenlyStem;
      cycles: readonly DaewoonCycleTenGods[];
    })
  | (Base & {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1_RULE.ruleVersion;
      reason: DaewoonTenGodsUnavailableReason;
    });

const ASSUMPTIONS = [
  'DAEWOON_CYCLES_ARE_CONSUMED_FROM_ENGINE12_NOT_RECOMPUTED',
  'TEN_GODS_ARE_RELATIVE_TO_THE_NATAL_DAY_MASTER',
  'HIDDEN_STEM_TEN_GODS_USE_THE_FROZEN_SAJU_RULES',
] as const;

const LIMITATIONS = [
  'DIRECTION_START_AGE_PROGRESSION_ARE_OWNED_BY_ENGINE12_DAEWOON_V1',
  'NO_STRENGTH_NO_INTERPRETATION_FACTS_ONLY',
] as const;

function unavailable(reason: DaewoonTenGodsUnavailableReason): DaewoonTenGodsResult {
  return {
    capability: 'UNAVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

export type DaewoonTenGodsInput = {
  dayMaster: HeavenlyStem;
  /** The AVAILABLE ENGINE-12 Daewoon cycles (read-only). */
  cycles: readonly DaewoonCycle[];
};

export function calculateDaewoonTenGods(input: DaewoonTenGodsInput): DaewoonTenGodsResult {
  if (!isHeavenlyStem(input?.dayMaster)) return unavailable('INVALID_DAY_MASTER');
  if (!Array.isArray(input.cycles) || input.cycles.length === 0) return unavailable('NO_CYCLES');

  const cycles: DaewoonCycleTenGods[] = [];
  for (const cycle of input.cycles) {
    const tenGods = buildTenGodProfile(input.dayMaster, cycle.pillar);
    if (!tenGods) return unavailable('TEN_GOD_CALCULATION_FAILED');
    cycles.push({
      ordinal: cycle.ordinal,
      startAgeInclusive: cycle.startAgeInclusive,
      endAgeInclusive: cycle.endAgeInclusive,
      tenGods,
    });
  }

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1_RULE.ruleVersion,
    dayMaster: input.dayMaster,
    cycles,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}
