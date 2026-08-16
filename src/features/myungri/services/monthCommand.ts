// 월령 (month command) + 득령 (obtaining the command) — deterministic INPUT facts for a FUTURE
// strength (강약) layer. This computes NO 신강/신약, NO strength score, NO verdict.
//
// 월령: consumes the CANONICAL Saju month (the natal MONTH branch, already 立春/節-attributed by
//   commit 8ce42b0 — never the lunar month number). Provides the month branch, its 오행, the fixed
//   月建 ordinal (寅월=1…丑월=12), and the season.
// 득령: the objective 旺相休囚死 phase of the day-master element within the month element — derived
//   by REUSING the frozen `calculateTenGod` on each element's 陽干 (so NO new 상생상극 table is made).
import { calculateTenGod, getBranchElement, getStemElement } from '../../interpretation';
import type { EarthlyBranch, FiveElement, HeavenlyStem } from '../../interpretation';
import {
  DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE,
  type MyungriProvenance,
  type NatalPillarContext,
} from '../domain/contracts';
import { isValidNatalContext, myungriProvenance } from './pillarFacts';

/** 旺相休囚死 — the day-master element's objective phase within the month element. */
export type SeasonalPhase = 'WANG' | 'XIANG' | 'XIU' | 'QIU' | 'SI';
/** 득령/실령 — single-factor month-command status (NOT overall 신강/신약). */
export type MonthCommandStatus = 'IN_COMMAND' | 'OUT_OF_COMMAND';
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';

// Fixed 月建: 寅월=正月=1 … 丑월=12. Not a calendar computation — the branch's month identity.
const BRANCH_TO_SAJU_MONTH_ORDINAL: Readonly<Record<EarthlyBranch, number>> = {
  YIN: 1, MAO: 2, CHEN: 3, SI: 4, WU: 5, WEI: 6, SHEN: 7, YOU: 8, XU: 9, HAI: 10, ZI: 11, CHOU: 12,
};
// 방합 seasonal grouping: 寅卯辰 봄, 巳午未 여름, 申酉戌 가을, 亥子丑 겨울.
const BRANCH_TO_SEASON: Readonly<Record<EarthlyBranch, Season>> = {
  YIN: 'SPRING', MAO: 'SPRING', CHEN: 'SPRING',
  SI: 'SUMMER', WU: 'SUMMER', WEI: 'SUMMER',
  SHEN: 'AUTUMN', YOU: 'AUTUMN', XU: 'AUTUMN',
  HAI: 'WINTER', ZI: 'WINTER', CHOU: 'WINTER',
};
const ELEMENT_YANG_STEM: Readonly<Record<FiveElement, HeavenlyStem>> = {
  WOOD: 'JIA', FIRE: 'BING', EARTH: 'WU', METAL: 'GENG', WATER: 'REN',
};
// same-polarity ten-god (both 陽干) → element phase of DM within month.
const TEN_GOD_TO_PHASE: Readonly<Record<string, SeasonalPhase>> = {
  PEER: 'WANG', // 同 → 旺
  INDIRECT_RESOURCE: 'XIANG', // 月生我 (인성) → 相
  EATING_GOD: 'XIU', // 我生月 (식상) → 休
  INDIRECT_WEALTH: 'QIU', // 我剋月 (재) → 囚
  SEVEN_KILLINGS: 'SI', // 月剋我 (관살) → 死
};
const IN_COMMAND_PHASES: ReadonlySet<SeasonalPhase> = new Set(['WANG', 'XIANG']);

export type MonthCommandUnavailableReason =
  | 'INVALID_NATAL_CONTEXT'
  | 'ELEMENT_UNAVAILABLE'
  | 'RELATION_UNAVAILABLE';

type Base = { provenance: MyungriProvenance; assumptions: readonly string[]; limitations: readonly string[] };

export type MonthCommandResult =
  | (Base & {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE.ruleVersion;
      dayMaster: HeavenlyStem;
      dayMasterElement: FiveElement;
      /** 月建 ordinal derived from the canonical month branch (寅월=1). */
      sajuMonthOrdinal: number;
      monthBranch: EarthlyBranch;
      monthElement: FiveElement; // 월령 오행 (month branch primary element)
      season: Season;
      /** 得令 input: raw 旺相休囚死 phase (deterministic, school-invariant). */
      dayMasterSeasonalPhase: SeasonalPhase;
      /** Widely-agreed 득령/실령 mapping (旺相 = 득령). Single factor — NOT overall strength. */
      commandStatus: MonthCommandStatus;
    })
  | (Base & {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE.ruleVersion;
      reason: MonthCommandUnavailableReason;
    });

const ASSUMPTIONS = [
  'MONTH_BRANCH_IS_THE_CANONICAL_IPCHUN_JIE_ATTRIBUTED_SAJU_MONTH_FROM_8CE42B0',
  'SEASONAL_PHASE_USES_MONTH_BRANCH_PRIMARY_ELEMENT_WANG_XIANG_XIU_QIU_SI',
  'DEUKRYEONG_MAPS_WANG_AND_XIANG_TO_IN_COMMAND',
] as const;

const LIMITATIONS = [
  'INPUT_FACT_ONLY_NO_SHINYAK_SHINGANG_NO_STRENGTH_SCORE_NO_VERDICT',
  'EARTH_MONTH_YEOGI_RESIDUAL_QI_WEIGHTING_IS_A_DEFERRED_POLICY',
  'LUNAR_MONTH_NUMBER_IS_NEVER_USED_FOR_MONTH_COMMAND',
] as const;

function unavailable(reason: MonthCommandUnavailableReason): MonthCommandResult {
  return {
    capability: 'UNAVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

export function calculateMonthCommand(natal: NatalPillarContext): MonthCommandResult {
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_CONTEXT');

  const monthBranch = natal.pillars.month.branch;
  const dmElementR = getStemElement(natal.dayMaster);
  const monthElementR = getBranchElement(monthBranch);
  if (!dmElementR.ok || !monthElementR.ok) return unavailable('ELEMENT_UNAVAILABLE');
  const dayMasterElement = dmElementR.value;
  const monthElement = monthElementR.value;

  const tenGod = calculateTenGod(
    ELEMENT_YANG_STEM[dayMasterElement],
    ELEMENT_YANG_STEM[monthElement],
  );
  if (!tenGod.ok) return unavailable('RELATION_UNAVAILABLE');
  const dayMasterSeasonalPhase = TEN_GOD_TO_PHASE[tenGod.value];
  if (!dayMasterSeasonalPhase) return unavailable('RELATION_UNAVAILABLE');

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE.ruleVersion,
    dayMaster: natal.dayMaster,
    dayMasterElement,
    sajuMonthOrdinal: BRANCH_TO_SAJU_MONTH_ORDINAL[monthBranch],
    monthBranch,
    monthElement,
    season: BRANCH_TO_SEASON[monthBranch],
    dayMasterSeasonalPhase,
    commandStatus: IN_COMMAND_PHASES.has(dayMasterSeasonalPhase) ? 'IN_COMMAND' : 'OUT_OF_COMMAND',
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}
