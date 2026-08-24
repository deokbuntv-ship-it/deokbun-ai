// 원국 신강/신약 (natal day-master strength) — V1 deterministic HIERARCHICAL classifier.
//
// NOT a numeric-weight model. There is NO score, NO 40/30/15, NO 0.7/0.5/0.3, NO threshold 1.2 (§7).
// The verdict comes from an explicit ordered RULE TABLE over factor STATES, priority month > rooting >
// composition (§9-11,§18). Every factor STATE is read from an existing FROZEN deterministic result — the
// LLM never computes strength (§8,§20). Fail-closed: missing/invalid inputs → REVIEW_REQUIRED (§20). This
// is the ORIGINAL 원국 baseline and is IMMUTABLE w.r.t. 대운/세운 — luck influence is a separate layer (§5,§6).
import type { FiveElement, HeavenlyStem } from '../../interpretation';
import type { NatalPillarContext } from '../domain/contracts';
import { calculateDayMasterStrengthInputs } from './dayMasterStrengthInputs';
import { calculateMonthCommand, type SeasonalPhase } from './monthCommand';

export const DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_STRENGTH_V1',
  ruleVersion: 'deokbunai.myungri-strength.v1',
} as const;

// 7단계 label (§14). Internal enum; the plain-language mapping lives in the consumer layer (§37).
export type StrengthLabel =
  | 'EXTREMELY_WEAK' //  극신약
  | 'WEAK' //           신약
  | 'BALANCED_WEAK' //  중화신약
  | 'BALANCED' //       중화
  | 'BALANCED_STRONG' //중화신강
  | 'STRONG' //         신강
  | 'EXTREMELY_STRONG';//극신강

export const STRENGTH_LABEL_KO: Record<StrengthLabel, string> = {
  EXTREMELY_WEAK: '극신약',
  WEAK: '신약',
  BALANCED_WEAK: '중화신약',
  BALANCED: '중화',
  BALANCED_STRONG: '중화신강',
  STRONG: '신강',
  EXTREMELY_STRONG: '극신강',
};

export type StrengthDirection = 'SUPPORT' | 'DRAIN' | 'NEUTRAL';
export type StrengthConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type RootingState = 'NONE' | 'SINGLE' | 'MULTIPLE';
export type CompositionState = 'SUPPORT_DOMINANT' | 'MIXED' | 'DRAIN_DOMINANT';
export type MonthState = 'SUPPORT' | 'DRAIN';

export type StrengthFactorKind =
  | 'MONTH_COMMAND'
  | 'ROOTING'
  | 'SUPPORT_DRAIN_COMPOSITION'
  | 'HIDDEN_COMPOSITION';

export type StrengthFactor = {
  kind: StrengthFactorKind;
  direction: StrengthDirection;
  state: string;
  evidence: string;
};

export type NatalStrengthProfile =
  | {
      status: 'CLASSIFIED';
      label: StrengthLabel;
      labelKo: string;
      confidence: StrengthConfidence;
      dayMaster: { stem: HeavenlyStem; element: FiveElement };
      month: { state: MonthState; phase: SeasonalPhase; direction: StrengthDirection };
      rooting: { state: RootingState; count: number; direction: StrengthDirection };
      composition: { state: CompositionState; support: number; drain: number; direction: StrengthDirection };
      supportingFactors: StrengthFactor[];
      weakeningFactors: StrengthFactor[];
      conflicts: string[];
      warnings: string[];
      specialPatternPolicy: 'NORMAL_CLASSIFIER_V1';
      algorithmVersion: typeof DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE.ruleVersion;
    }
  | {
      status: 'REVIEW_REQUIRED';
      reason: 'INVALID_NATAL_CONTEXT' | 'PRIMITIVE_UNAVAILABLE';
      warnings: string[];
      algorithmVersion: typeof DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE.ruleVersion;
    };

// The ordered RULE TABLE (§18). Keyed `${month}/${rooting}/${composition}`. Priority is lexicographic —
// 월령(month) is the top factor, then 통근(rooting), then 구성(composition) (§9-11). Two structural caps
// encode a classical principle: a ROOTLESS day master can never be (극)신강, and a MULTI-ROOTED one can
// never be (극)신약 — so r=NONE tops out at 중화신강 and r=MULTIPLE bottoms out at 중화신약. Symmetric.
const RULE_TABLE: Record<string, StrengthLabel> = {
  // month=SUPPORT (득령) — strong-half base
  'SUPPORT/MULTIPLE/SUPPORT_DOMINANT': 'EXTREMELY_STRONG',
  'SUPPORT/MULTIPLE/MIXED': 'STRONG',
  'SUPPORT/MULTIPLE/DRAIN_DOMINANT': 'STRONG',
  'SUPPORT/SINGLE/SUPPORT_DOMINANT': 'STRONG',
  'SUPPORT/SINGLE/MIXED': 'BALANCED_STRONG',
  'SUPPORT/SINGLE/DRAIN_DOMINANT': 'BALANCED_STRONG',
  'SUPPORT/NONE/SUPPORT_DOMINANT': 'BALANCED_STRONG', // rootless cap
  'SUPPORT/NONE/MIXED': 'BALANCED',
  'SUPPORT/NONE/DRAIN_DOMINANT': 'BALANCED_WEAK',
  // month=DRAIN (실령) — weak-half base
  'DRAIN/NONE/DRAIN_DOMINANT': 'EXTREMELY_WEAK',
  'DRAIN/NONE/MIXED': 'WEAK',
  'DRAIN/NONE/SUPPORT_DOMINANT': 'WEAK',
  'DRAIN/SINGLE/DRAIN_DOMINANT': 'WEAK',
  'DRAIN/SINGLE/MIXED': 'BALANCED_WEAK',
  'DRAIN/SINGLE/SUPPORT_DOMINANT': 'BALANCED_WEAK',
  'DRAIN/MULTIPLE/DRAIN_DOMINANT': 'BALANCED_WEAK', // multi-root cap
  'DRAIN/MULTIPLE/MIXED': 'BALANCED',
  'DRAIN/MULTIPLE/SUPPORT_DOMINANT': 'BALANCED_STRONG',
};

const STRONG_HALF: ReadonlySet<StrengthLabel> = new Set(['EXTREMELY_STRONG', 'STRONG', 'BALANCED_STRONG']);
const WEAK_HALF: ReadonlySet<StrengthLabel> = new Set(['EXTREMELY_WEAK', 'WEAK', 'BALANCED_WEAK']);

const rootingState = (count: number): RootingState => (count >= 2 ? 'MULTIPLE' : count === 1 ? 'SINGLE' : 'NONE');
const dir = (support: boolean): StrengthDirection => (support ? 'SUPPORT' : 'DRAIN');

function review(reason: 'INVALID_NATAL_CONTEXT' | 'PRIMITIVE_UNAVAILABLE', warnings: string[]): NatalStrengthProfile {
  return { status: 'REVIEW_REQUIRED', reason, warnings, algorithmVersion: DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE.ruleVersion };
}

/**
 * Classify the 원국(natal) day-master strength into 7 levels via the hierarchical rule table.
 * Pure + deterministic; consumes only frozen results (monthCommand + M-18). No LLM, no numeric score.
 * The result is the IMMUTABLE natal baseline — see `currentStrength.ts` for 대운/세운 influence (§6).
 */
export function evaluateNatalStrength(natal: NatalPillarContext): NatalStrengthProfile {
  const month = calculateMonthCommand(natal);
  const inputs = calculateDayMasterStrengthInputs(natal);
  if (month.capability !== 'AVAILABLE') {
    return review(month.capability === 'UNAVAILABLE' && month.reason === 'INVALID_NATAL_CONTEXT' ? 'INVALID_NATAL_CONTEXT' : 'PRIMITIVE_UNAVAILABLE', []);
  }
  if (inputs.capability !== 'AVAILABLE') {
    return review(inputs.reason === 'INVALID_NATAL_CONTEXT' ? 'INVALID_NATAL_CONTEXT' : 'PRIMITIVE_UNAVAILABLE', []);
  }

  // 1) 월령/득령 (top factor) → SUPPORT/DRAIN.
  const monthState: MonthState = month.commandStatus === 'IN_COMMAND' ? 'SUPPORT' : 'DRAIN';
  const monthDir = dir(monthState === 'SUPPORT');

  // 2) 통근/득지 — same-ELEMENT roots (비겁) in the 지장간, from M-18's frozen ten-god categorization.
  //    (rootingTransparency is same-干 only, too narrow for 득지; M-18 PARALLEL hidden = same element.)
  //    Count DISTINCT root BRANCHES (positions), not raw 지장간 entries — a 왕지 like 卯 stores 甲+乙 both,
  //    but it is ONE root location (§12: no 여기/중기/정기 weighting, so a branch roots or it doesn't).
  const rootPositions = new Set(inputs.hiddenStems.filter((h) => h.role === 'PARALLEL').map((h) => h.position));
  const rootCount = rootPositions.size;
  const rState = rootingState(rootCount);
  const rootDir = dir(rState !== 'NONE');

  // 3) SUPPORT vs DRAIN 구성 — visible 천간 아군(비겁+인성) vs 타군(식상+재성+관성), from M-18.
  const support = inputs.visibleSideCounts.SUPPORT;
  const drain = inputs.visibleSideCounts.DRAIN;
  const cState: CompositionState = support > drain ? 'SUPPORT_DOMINANT' : support < drain ? 'DRAIN_DOMINANT' : 'MIXED';
  const compDir: StrengthDirection = cState === 'SUPPORT_DOMINANT' ? 'SUPPORT' : cState === 'DRAIN_DOMINANT' ? 'DRAIN' : 'NEUTRAL';

  const label = RULE_TABLE[`${monthState}/${rState}/${cState}`];

  // Factor trace (§18) — every factor carries its own deterministic evidence.
  const phaseKo: Record<SeasonalPhase, string> = { WANG: '旺', XIANG: '相', XIU: '休', QIU: '囚', SI: '死' };
  const factors: StrengthFactor[] = [
    {
      kind: 'MONTH_COMMAND',
      direction: monthDir,
      state: month.commandStatus,
      evidence: `월지 ${month.monthElement} · 일간 왕상휴수사=${phaseKo[month.dayMasterSeasonalPhase]}(${month.dayMasterSeasonalPhase}) → ${monthState === 'SUPPORT' ? '득령' : '실령'}`,
    },
    {
      kind: 'ROOTING',
      direction: rootDir,
      state: rState,
      evidence: `동기(비겁·같은 오행)가 뿌리내린 지지 ${rootCount}개 → ${rState === 'NONE' ? '무근(득지 실패)' : '득지'}`,
    },
    {
      kind: 'SUPPORT_DRAIN_COMPOSITION',
      direction: compDir,
      state: cState,
      evidence: `천간 아군(비겁+인성) ${support} vs 타군(식상+재성+관성) ${drain}`,
    },
    {
      kind: 'HIDDEN_COMPOSITION',
      direction:
        inputs.hiddenRoleCounts.PARALLEL + inputs.hiddenRoleCounts.RESOURCE >
        inputs.hiddenRoleCounts.OUTPUT + inputs.hiddenRoleCounts.WEALTH + inputs.hiddenRoleCounts.OFFICER
          ? 'SUPPORT'
          : 'DRAIN',
      state: 'HIDDEN',
      evidence: `지장간 아군 ${inputs.hiddenRoleCounts.PARALLEL + inputs.hiddenRoleCounts.RESOURCE} vs 타군 ${inputs.hiddenRoleCounts.OUTPUT + inputs.hiddenRoleCounts.WEALTH + inputs.hiddenRoleCounts.OFFICER} (보조 근거)`,
    },
  ];

  // Conflicts (§5-adjustment): where the three PRIMARY factors disagree in direction.
  const conflicts: string[] = [];
  if (monthDir !== rootDir) conflicts.push(`월령(${monthDir}) vs 통근(${rootDir}) 상충`);
  if (compDir !== 'NEUTRAL' && monthDir !== compDir) conflicts.push(`월령(${monthDir}) vs 구성(${compDir}) 상충`);
  if (compDir !== 'NEUTRAL' && rootDir !== compDir) conflicts.push(`통근(${rootDir}) vs 구성(${compDir}) 상충`);

  // Confidence (§19) — agreement of the three primary directions with the verdict side (not a probability).
  const side = STRONG_HALF.has(label) ? 'SUPPORT' : WEAK_HALF.has(label) ? 'DRAIN' : 'NEUTRAL';
  const primaryDirs = [monthDir, rootDir, compDir];
  const agree = side === 'NEUTRAL' ? 0 : primaryDirs.filter((d) => d === side).length;
  let confidence: StrengthConfidence = side === 'NEUTRAL' ? 'LOW' : agree >= 3 ? 'HIGH' : agree === 2 ? 'MEDIUM' : 'LOW';

  const warnings: string[] = [];
  // 시주 미상 (§19): no hour pillar → less evidence; cap confidence at MEDIUM but still classify.
  if (!natal.pillars.hour) {
    warnings.push('시주 미상: 시간주 근거 없음 — confidence 하향(자동 UNKNOWN 아님)');
    if (confidence === 'HIGH') confidence = 'MEDIUM';
  }
  // 특수격(종격) gate (§21): V1 does NOT detect special patterns. In the extreme-one-sided zone, surface
  // the possibility as a WARNING only — the normal classifier label stands (no detector, no verdict change).
  if (label === 'EXTREMELY_WEAK' || label === 'EXTREMELY_STRONG') {
    warnings.push('특수격(종격 등) 가능성은 V1 미판정 — 일반 classifier 기준 라벨. 필요 시 SPECIAL_PATTERN_REVIEW.');
  }

  return {
    status: 'CLASSIFIED',
    label,
    labelKo: STRENGTH_LABEL_KO[label],
    confidence,
    dayMaster: inputs.dayMaster,
    month: { state: monthState, phase: month.dayMasterSeasonalPhase, direction: monthDir },
    rooting: { state: rState, count: rootCount, direction: rootDir },
    composition: { state: cState, support, drain, direction: compDir },
    supportingFactors: factors.filter((f) => f.direction === 'SUPPORT'),
    weakeningFactors: factors.filter((f) => f.direction === 'DRAIN'),
    conflicts,
    warnings,
    specialPatternPolicy: 'NORMAL_CLASSIFIER_V1',
    algorithmVersion: DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE.ruleVersion,
  };
}
