// The DAILY PLAN — the smallest deterministic decision layer for 오늘의 운세 (§12/§13). It does NOT copy the
// full consultation Answer Plan; it reads today's 일운 relations and produces a READABLE overall tier + which
// domain the day emphasizes + where to pace, plus the answer-shape limits the prose must obey. The tier comes
// from a TRANSPARENT harmony/friction tally (like the compatibility tier) — never a fabricated numeric score
// (§14). Pure + unit-testable.
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import type { TodayDomain, TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';

export const TODAY_PLAN_VERSION = 'today-plan@1.0.0';

export type DailyOverallTone = '좋은 흐름' | '무난한 흐름' | '변화가 많은 날' | '조심해서 움직일 날';

export type DailyPlan = {
  fortuneDate: string;
  available: boolean;
  overallTone: DailyOverallTone;
  /** The domain the day's energy (일간 십신) emphasizes. */
  strongestDomain: TodayDomain;
  /** Where to pace when there is friction; null on a clean day. */
  cautionDomain: TodayDomain | null;
  supportedDomains: TodayDomain[];
  /** Transparent tally — the evidence behind the tier (NOT a score). */
  harmonyCount: number;
  frictionCount: number;
  maxHighlights: number;
  maxCautions: number;
  /** The day is a suitability read, never an event guarantee (§21). */
  forbidEventCertainty: boolean;
  evidenceVersion: string;
  planVersion: string;
};

// 십신 → the day's emphasized domain (a soft "where the energy is today" signal, not a guarantee).
function tenGodDomain(tg: TenGod): TodayDomain {
  switch (tg) {
    case 'DIRECT_WEALTH':
    case 'INDIRECT_WEALTH':
      return 'wealth';
    case 'DIRECT_OFFICER':
    case 'SEVEN_KILLINGS':
      return 'work';
    case 'EATING_GOD':
    case 'HURTING_OFFICER':
      return 'action';
    case 'PEER':
    case 'ROB_WEALTH':
      return 'relationship';
    case 'DIRECT_RESOURCE':
    case 'INDIRECT_RESOURCE':
      return 'overall';
  }
}

const HARMONY_BRANCH = new Set(['BRANCH_SIX_COMBINATION', 'BRANCH_HALF_THREE_HARMONY']);
const FRICTION_BRANCH = new Set(['BRANCH_CLASH', 'BRANCH_PUNISHMENT', 'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM']);

export function deriveDailyPlan(evidence: TodayFortuneEvidence): DailyPlan {
  const base = {
    fortuneDate: evidence.fortuneDate,
    maxHighlights: 3,
    maxCautions: 2,
    forbidEventCertainty: true,
    evidenceVersion: evidence.evidenceVersion,
    planVersion: TODAY_PLAN_VERSION,
  };

  if (!evidence.available) {
    return { ...base, available: false, overallTone: '무난한 흐름', strongestDomain: 'overall', cautionDomain: null, supportedDomains: [], harmonyCount: 0, frictionCount: 0 };
  }

  const rel = evidence.dayLuck.relationsToNatal;
  let harmonyCount = 0;
  let frictionCount = 0;
  for (const s of rel.stem) {
    if (s.relation.kind === 'STEM_COMBINATION') harmonyCount += 1;
    else if (s.relation.kind === 'STEM_CLASH') frictionCount += 1;
  }
  for (const b of rel.branch) {
    if (HARMONY_BRANCH.has(b.relation.kind)) harmonyCount += 1;
    else if (FRICTION_BRANCH.has(b.relation.kind)) frictionCount += 1;
  }

  const overallTone: DailyOverallTone =
    frictionCount === 0 && harmonyCount >= 1
      ? '좋은 흐름'
      : frictionCount === 0
        ? '무난한 흐름'
        : harmonyCount >= frictionCount
          ? '변화가 많은 날'
          : '조심해서 움직일 날';

  return {
    ...base,
    available: true,
    overallTone,
    strongestDomain: tenGodDomain(evidence.dayStemTenGod),
    cautionDomain: frictionCount > 0 ? tenGodDomain(evidence.dayBranchTenGod) : null,
    supportedDomains: evidence.supportedDomains,
    harmonyCount,
    frictionCount,
  };
}
