// The MONTHLY PLAN (§12-§17, v1.1) — the smallest deterministic decision layer for 이번 달 운세. It now reads
// the FULL civil-month coverage (1 or 2 節-based 월운 segments, each weighted by its share of the month) rather
// than a single midpoint regime. It derives a per-segment signal, lets the DOMINANT (largest-weight) segment
// set the month's headline tier/mode/domains, and — when the segments materially differ — exposes a
// transition (초반/중반 이후). The tier comes from a TRANSPARENT harmony/friction tally, never a fabricated
// numeric score (§14). All from evidence that already exists; no new engine semantics. Pure + tested. The LLM
// verbalizes this plan; it NEVER chooses the tier / mode / domain status / transition.
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import type { MonthlyDomain, MonthlyFortuneEvidence, MonthlySegmentEvidence } from '@/features/monthly/engine/monthlyEvidence';

export const MONTHLY_PLAN_VERSION = 'monthly-plan@1.1.0';

export type MonthlyOverallTier = '기회를 살리기 좋은 달' | '안정적으로 운영할 달' | '변화가 많은 달' | '속도를 조절할 달';

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

// A deterministic within-month transition (§5): the 節 date the flow shifts + each side's tier/mode. Server-
// owned; exposed only when the two segments materially differ (§6 — identical direction ⇒ no transition).
export type MonthlyTransition = {
  transitionCivilDate: string; // YYYY-MM-DD (KST) — the 節 date, from the frozen resolver, never fabricated
  early: { tier: MonthlyOverallTier; modeLabel: string; strongestDomain: MonthlyDomain };
  later: { tier: MonthlyOverallTier; modeLabel: string; strongestDomain: MonthlyDomain };
};

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
  /** How many 節-based segments cover the civil month (1 or 2). */
  segmentCount: number;
  /** True when the two segments point in materially different practical directions (§5/§6). */
  hasMeaningfulTransition: boolean;
  transition: MonthlyTransition | null;
  maxOpportunities: number;
  maxCautions: number;
  maxActions: number;
  forbidEventCertainty: boolean;
  forbidExactDates: boolean;
  evidenceVersion: string;
  planVersion: string;
};

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

function tierFromTally(harmony: number, friction: number): MonthlyOverallTier {
  return friction === 0 && harmony >= 1
    ? '기회를 살리기 좋은 달'
    : friction === 0
      ? '안정적으로 운영할 달'
      : harmony >= friction
        ? '변화가 많은 달'
        : '속도를 조절할 달';
}

type SegmentSignal = {
  weight: number;
  tier: MonthlyOverallTier;
  primaryMode: MonthlyPrimaryMode;
  primaryModeLabel: string;
  strongestDomain: MonthlyDomain;
  cautionDomain: MonthlyDomain | null;
  harmonyCount: number;
  frictionCount: number;
};

function deriveSegmentSignal(seg: MonthlySegmentEvidence): SegmentSignal {
  let harmonyCount = 0;
  let frictionCount = 0;
  for (const s of seg.relationsToNatal.stem) {
    if (s.relation.kind === 'STEM_COMBINATION') harmonyCount += 1;
    else if (s.relation.kind === 'STEM_CLASH') frictionCount += 1;
  }
  for (const b of seg.relationsToNatal.branch) {
    if (HARMONY_BRANCH.has(b.relation.kind)) harmonyCount += 1;
    else if (FRICTION_BRANCH.has(b.relation.kind)) frictionCount += 1;
  }
  const tier = tierFromTally(harmonyCount, frictionCount);
  const strongestDomain = tenGodDomain(seg.stemTenGod);
  const cautionDomain = frictionCount > 0 ? tenGodDomain(seg.branchTenGod) : null;
  const primaryMode = derivePrimaryMode(tier, strongestDomain);
  return {
    weight: seg.weight,
    tier,
    primaryMode,
    primaryModeLabel: MONTHLY_MODE_LABEL[primaryMode],
    strongestDomain,
    cautionDomain,
    harmonyCount,
    frictionCount,
  };
}

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

  if (!evidence.available || evidence.segments.length === 0) {
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
      segmentCount: 0,
      hasMeaningfulTransition: false,
      transition: null,
    };
  }

  const signals = evidence.segments.map(deriveSegmentSignal);

  // The DOMINANT segment (largest share of the month) sets the headline judgment; ties favour the later
  // segment (>= keeps the last index on equal weight).
  let dominant = signals[0];
  for (const s of signals) if (s.weight >= dominant.weight) dominant = s;

  const overallTier = dominant.tier;
  const strongestDomain = dominant.strongestDomain;
  const cautionDomain = dominant.cautionDomain;
  const primaryMode = dominant.primaryMode;

  // Transition (§5/§6): only when there are two segments AND they differ in tier or action mode. Identical
  // practical direction ⇒ one clean judgment (no manufactured transition).
  let hasMeaningfulTransition = false;
  let transition: MonthlyTransition | null = null;
  if (signals.length === 2 && evidence.transitionCivilDate) {
    const [early, later] = signals;
    if (early.tier !== later.tier || early.primaryMode !== later.primaryMode) {
      hasMeaningfulTransition = true;
      transition = {
        transitionCivilDate: evidence.transitionCivilDate,
        early: { tier: early.tier, modeLabel: early.primaryModeLabel, strongestDomain: early.strongestDomain },
        later: { tier: later.tier, modeLabel: later.primaryModeLabel, strongestDomain: later.strongestDomain },
      };
    }
  }

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
    harmonyCount: dominant.harmonyCount,
    frictionCount: dominant.frictionCount,
    segmentCount: signals.length,
    hasMeaningfulTransition,
    transition,
  };
}
