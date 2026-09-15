// 일간 기준 십신 역할 구성 — the day-master ten-god ROLE COMPOSITION (아군/타군 구성비).
//
// The ONE missing deterministic aggregate for a future 강약(세력) layer. The natal chart's 십신 are already
// computed per pillar (frozen `buildTenGodProfile` → `calculateTenGod`), but nothing tallies them by their
// FIXED classical role relative to the 일간. This does exactly that — COMPOSITION only (§6: 구성 ≠ 세력),
// entirely via frozen rules, inventing NO theory.
//
// DELIBERATELY ABSENT (§10/§32 — Owner Review): the 세력 weighting, any 강약 score, and the 신강/신약 verdict
// + threshold. This module emits INPUTS, never a judgment. The 여기/중기/정기 weighting question is likewise
// left open — 지장간 are tallied SEPARATELY from visible stems, imposing no equivalence.
//
// The other strength INPUTS already exist as their own fact modules and are NOT re-bundled here (§21):
//   · 오행 분포(counts)         → interpretation `calculateFiveElementDistribution`
//   · 월령·득령(왕상휴수사)      → `calculateMonthCommand`
//   · 통근·투간                  → `calculateRootingTransparency`
//
// Claude-owned, engine-EXTERNAL, RN-free, node-test friendly.
import {
  calculateTenGod,
  getHiddenStems,
  getStemElement,
  type FiveElement,
  type HeavenlyStem,
  type HiddenStemRole,
  type SajuPillarPosition,
  type TenGod,
} from '../../interpretation';
import type { MyungriStemAndBranch, NatalPillarContext } from '../domain/contracts';
import { isValidNatalContext } from './pillarFacts';

export const DEOKBUNAI_MYUNGRI_STRENGTH_INPUTS_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_STRENGTH_INPUTS_V1',
  ruleVersion: 'deokbunai.myungri-strength-inputs.v1',
} as const;

/** 십신 5-role grouping relative to the 일간. `role` = 비겁/인성/식상/재성/관성; `side` = 아군/타군. */
export type StrengthRole = 'PARALLEL' | 'RESOURCE' | 'OUTPUT' | 'WEALTH' | 'OFFICER';
export type StrengthSide = 'SUPPORT' | 'DRAIN';

// FIXED classical DEFINITION of the ten gods (not a weighting choice, not contested):
//   PARALLEL 비겁(비견·겁재) = 동기 · RESOURCE 인성(정인·편인) = 생조   → SUPPORT(아군)
//   OUTPUT 식상(식신·상관) = 설기 · WEALTH 재성(정재·편재) · OFFICER 관성(정관·편관) = 극 → DRAIN(타군)
const TEN_GOD_ROLE: Record<TenGod, { role: StrengthRole; side: StrengthSide }> = {
  PEER: { role: 'PARALLEL', side: 'SUPPORT' },
  ROB_WEALTH: { role: 'PARALLEL', side: 'SUPPORT' },
  DIRECT_RESOURCE: { role: 'RESOURCE', side: 'SUPPORT' },
  INDIRECT_RESOURCE: { role: 'RESOURCE', side: 'SUPPORT' },
  EATING_GOD: { role: 'OUTPUT', side: 'DRAIN' },
  HURTING_OFFICER: { role: 'OUTPUT', side: 'DRAIN' },
  DIRECT_WEALTH: { role: 'WEALTH', side: 'DRAIN' },
  INDIRECT_WEALTH: { role: 'WEALTH', side: 'DRAIN' },
  DIRECT_OFFICER: { role: 'OFFICER', side: 'DRAIN' },
  SEVEN_KILLINGS: { role: 'OFFICER', side: 'DRAIN' },
};

/** The fixed classical side of a single 십신 relative to the 일간. Shared with the strength/luck layers. */
export function tenGodSide(tenGod: TenGod): StrengthSide {
  return TEN_GOD_ROLE[tenGod].side;
}

export type StrengthTenGodEntry = {
  position: SajuPillarPosition;
  stem: HeavenlyStem;
  tenGod: TenGod;
  role: StrengthRole;
  side: StrengthSide;
};
export type StrengthHiddenEntry = StrengthTenGodEntry & { hiddenRole: HiddenStemRole };

export type DayMasterStrengthInputsResult =
  | {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_STRENGTH_INPUTS_V1_RULE.ruleVersion;
      dayMaster: { stem: HeavenlyStem; element: FiveElement };
      /** 천간 십신 (일간 자신은 제외 — 억부 관례), role-tagged. */
      visibleStems: readonly StrengthTenGodEntry[];
      /** 지장간 십신 (네 지지 전체, 일지 포함), 여기/중기/정기 role 보존. Tallied SEPARATELY. */
      hiddenStems: readonly StrengthHiddenEntry[];
      /** COMPOSITION tallies over the visible stems. NOT 세력 — no weighting applied. */
      visibleRoleCounts: Record<StrengthRole, number>;
      /** 아군(SUPPORT)/타군(DRAIN) 구성비 over the visible stems. */
      visibleSideCounts: Record<StrengthSide, number>;
      /** 지장간 tallies, kept apart (여기/중기/정기 equivalence is a 세력 decision, not made here). */
      hiddenRoleCounts: Record<StrengthRole, number>;
      /** The contested SYNTHESIS is DELIBERATELY ABSENT (§10/§32 — Owner Review). */
      strengthVerdict: 'OWNER_REVIEW_REQUIRED';
      seryeokScore: null;
      disclaimer: string;
    }
  | { capability: 'UNAVAILABLE'; reason: 'INVALID_NATAL_CONTEXT' | 'FROZEN_RULE_FAILURE' };

const zeroRoles = (): Record<StrengthRole, number> => ({
  PARALLEL: 0,
  RESOURCE: 0,
  OUTPUT: 0,
  WEALTH: 0,
  OFFICER: 0,
});

/**
 * Tally the natal chart's 십신 by their fixed role relative to the 일간 — COMPOSITION facts only.
 * Fail-closed: any invalid context or frozen-rule failure → UNAVAILABLE (never a partial guess).
 * Graceful on 시주 미상: the hour pillar is simply absent from the tallies (§27).
 */
export function calculateDayMasterStrengthInputs(
  natal: NatalPillarContext,
): DayMasterStrengthInputsResult {
  if (!isValidNatalContext(natal)) return { capability: 'UNAVAILABLE', reason: 'INVALID_NATAL_CONTEXT' };

  const dmElement = getStemElement(natal.dayMaster);
  if (!dmElement.ok) return { capability: 'UNAVAILABLE', reason: 'FROZEN_RULE_FAILURE' };

  const positions: Array<{ position: SajuPillarPosition; pillar: MyungriStemAndBranch }> = [
    { position: 'YEAR', pillar: natal.pillars.year },
    { position: 'MONTH', pillar: natal.pillars.month },
    { position: 'DAY', pillar: natal.pillars.day },
    ...(natal.pillars.hour ? [{ position: 'HOUR' as const, pillar: natal.pillars.hour }] : []),
  ];

  const visibleStems: StrengthTenGodEntry[] = [];
  const hiddenStems: StrengthHiddenEntry[] = [];
  for (const { position, pillar } of positions) {
    // 일간 자신(일주 천간)은 십신 구성에서 제외 — 자기 자신은 비견과 동일하므로 억부 관례상 세지 않는다.
    // 일지(日支)의 지장간은 일간이 아니므로 포함한다. 십신·지장간은 모두 frozen 규칙(calculateTenGod/
    // getHiddenStems)으로만 도출 — 자연 계산 없음(§3).
    if (position !== 'DAY') {
      const tg = calculateTenGod(natal.dayMaster, pillar.stem);
      if (!tg.ok) return { capability: 'UNAVAILABLE', reason: 'FROZEN_RULE_FAILURE' };
      const m = TEN_GOD_ROLE[tg.value];
      visibleStems.push({ position, stem: pillar.stem, tenGod: tg.value, role: m.role, side: m.side });
    }
    const hidden = getHiddenStems(pillar.branch);
    if (!hidden.ok) return { capability: 'UNAVAILABLE', reason: 'FROZEN_RULE_FAILURE' };
    for (const hs of hidden.value) {
      const tg = calculateTenGod(natal.dayMaster, hs.stem);
      if (!tg.ok) return { capability: 'UNAVAILABLE', reason: 'FROZEN_RULE_FAILURE' };
      const m = TEN_GOD_ROLE[tg.value];
      hiddenStems.push({ position, stem: hs.stem, tenGod: tg.value, hiddenRole: hs.role, role: m.role, side: m.side });
    }
  }

  const visibleRoleCounts = zeroRoles();
  const visibleSideCounts: Record<StrengthSide, number> = { SUPPORT: 0, DRAIN: 0 };
  for (const e of visibleStems) {
    visibleRoleCounts[e.role] += 1;
    visibleSideCounts[e.side] += 1;
  }
  const hiddenRoleCounts = zeroRoles();
  for (const e of hiddenStems) hiddenRoleCounts[e.role] += 1;

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_STRENGTH_INPUTS_V1_RULE.ruleVersion,
    dayMaster: { stem: natal.dayMaster, element: dmElement.value },
    visibleStems,
    hiddenStems,
    visibleRoleCounts,
    visibleSideCounts,
    hiddenRoleCounts,
    strengthVerdict: 'OWNER_REVIEW_REQUIRED',
    seryeokScore: null,
    disclaimer:
      '구성(십신 역할 구성비)만 집계 — 세력(강약) 가중·점수·신강/신약 판정은 미산정(Owner Review). ' +
      '오행 분포·월령(왕상휴수사/득령)·통근/투간은 별도 fact 모듈에서 제공.',
  };
}
