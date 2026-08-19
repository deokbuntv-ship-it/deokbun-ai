// The MONTHLY PLAN — the smallest deterministic decision layer for 이번 달 운세 (§12-§17). It reads the target
// month's 월운 relations to the natal chart and produces a READABLE overall tier + the month's ACTION MODE +
// which domain the month emphasizes + where to pace, plus the answer-shape limits the prose must obey. The
// tier comes from a TRANSPARENT harmony/friction tally (like Today + compatibility) — never a fabricated
// numeric score (§14). All of this is derived from evidence that ALREADY exists; no new engine semantics.
// Pure + tested. The LLM verbalizes this plan; it NEVER chooses the tier / mode / domain status.
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import type { MonthlyDomain, MonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';

export const MONTHLY_PLAN_VERSION = 'monthly-plan@1.0.0';

export type MonthlyOverallTier = '기회를 살리기 좋은 달' | '안정적으로 운영할 달' | '변화가 많은 달' | '속도를 조절할 달';

// A small, defensible action-mode set (§12) — tempo (tier) x emphasis (월운 십신 domain). A suitability read,
// never an event forecast.
export type MonthlyPrimaryMode = 'EXPAND' | 'MANAGE' | 'CONNECT' | 'ADJUST' | 'STABILIZE';

export const MONTHLY_MODE_LABEL: Record<MonthlyPrimaryMode, string> = {
  EXPAND: '확장·추진',
  MANAGE: '점검·관리',
  CONNECT: '관계·조율',
  ADJUST: '조정·조율',
  STABILIZE: '정비·속도조절',
};

export type MonthlyDomainStatus = '좋음' | '무난' | '주의';
export type MonthlyDomainSignal = { domain: MonthlyDomain; status: MonthlyDomainStatus };

export type MonthlyPlan = {
  year: number;
  month: number;
  available: boolean;
  overallTier: MonthlyOverallTier;
  primaryMode: MonthlyPrimaryMode;
  primaryModeLabel: string;
  strongestDomain: MonthlyDomain;
  cautionDomain: MonthlyDomain | null;
  domainSignals: MonthlyDomainSignal[];
  supportedDomains: MonthlyDomain[];
  harmonyCount: number;
  frictionCount: number;
  maxOpportunities: number;
  maxCautions: number;
  maxActions: number;
  /** The month is a suitability read, never an event guarantee (§32) or an exact-date claim (§24). */
  forbidEventCertainty: boolean;
  forbidExactDates: boolean;
  evidenceVersion: string;
  planVersion: string;
};

// 십신 → the month's emphasized domain (a soft "where the energy is this month" signal, not a guarantee).
function tenGodDomain(tg: TenGod): MonthlyDomain {
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

function derivePrimaryMode(tier: MonthlyOverallTier, strongestDomain: MonthlyDomain): MonthlyPrimaryMode {
  if (tier === '속도를 조절할 달') return 'STABILIZE';
  if (tier === '변화가 많은 달') return 'ADJUST';
  switch (strongestDomain) {
    case 'work':
    case 'action':
      return 'EXPAND';
    case 'wealth':
    case 'overall':
      return 'MANAGE';
    case 'relationship':
      return 'CONNECT';
  }
}

function deriveDomainSignals(
  tier: MonthlyOverallTier,
  strongestDomain: MonthlyDomain,
  cautionDomain: MonthlyDomain | null,
): MonthlyDomainSignal[] {
  const emphasisStatus: MonthlyDomainStatus = tier === '기회를 살리기 좋은 달' ? '좋음' : '무난';
  const signals: MonthlyDomainSignal[] = [{ domain: strongestDomain, status: emphasisStatus }];
  if (cautionDomain !== null && cautionDomain !== strongestDomain) {
    signals.push({ domain: cautionDomain, status: '주의' });
  }
  return signals;
}

const HARMONY_BRANCH = new Set(['BRANCH_SIX_COMBINATION', 'BRANCH_HALF_THREE_HARMONY']);
const FRICTION_BRANCH = new Set(['BRANCH_CLASH', 'BRANCH_PUNISHMENT', 'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM']);

export function deriveMonthlyPlan(evidence: MonthlyFortuneEvidence): MonthlyPlan {
  const base = {
    year: evidence.year,
    month: evidence.month,
    maxOpportunities: 3,
    maxCautions: 2,
    maxActions: 3,
    forbidEventCertainty: true,
    forbidExactDates: true,
    evidenceVersion: evidence.evidenceVersion,
    planVersion: MONTHLY_PLAN_VERSION,
  };

  if (!evidence.available) {
    return {
      ...base,
      available: false,
      overallTier: '안정적으로 운영할 달',
      primaryMode: 'MANAGE',
      primaryModeLabel: MONTHLY_MODE_LABEL.MANAGE,
      strongestDomain: 'overall',
      cautionDomain: null,
      domainSignals: [],
      supportedDomains: [],
      harmonyCount: 0,
      frictionCount: 0,
    };
  }

  const rel = evidence.monthRelationsToNatal;
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

  const overallTier: MonthlyOverallTier =
    frictionCount === 0 && harmonyCount >= 1
      ? '기회를 살리기 좋은 달'
      : frictionCount === 0
        ? '안정적으로 운영할 달'
        : harmonyCount >= frictionCount
          ? '변화가 많은 달'
          : '속도를 조절할 달';

  const strongestDomain = tenGodDomain(evidence.monthStemTenGod);
  const cautionDomain = frictionCount > 0 ? tenGodDomain(evidence.monthBranchTenGod) : null;
  const primaryMode = derivePrimaryMode(overallTier, strongestDomain);

  return {
    ...base,
    available: true,
    overallTier,
    primaryMode,
    primaryModeLabel: MONTHLY_MODE_LABEL[primaryMode],
    strongestDomain,
    cautionDomain,
    domainSignals: deriveDomainSignals(overallTier, strongestDomain, cautionDomain),
    supportedDomains: evidence.supportedDomains,
    harmonyCount,
    frictionCount,
  };
}
