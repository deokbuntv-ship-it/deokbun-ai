// The MONTHLY PLAN (§12-§17, v1.1) — the smallest deterministic decision layer for 이번 달 운세. It now reads
// the FULL civil-month coverage (1 or 2 節-based 월운 segments, each weighted by its share of the month) rather
// than a single midpoint regime. It derives a per-segment signal, lets the DOMINANT (largest-weight) segment
// set the month's headline tier/mode/domains, and — when the segments materially differ — exposes a
// transition (초반/중반 이후). The tier comes from a TRANSPARENT harmony/friction tally, never a fabricated
// numeric score (§14). All from evidence that already exists; no new engine semantics. Pure + tested. The LLM
// verbalizes this plan; it NEVER chooses the tier / mode / domain status / transition.
import { derivePolarity, type PolarityTier } from '@/features/polarity/polarityKernel';
import { synthesizeBackground, type BackgroundSynthesisState } from '@/features/fortune-shared/temporalSynthesis';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import type { MonthlyDomain, MonthlyFortuneEvidence, MonthlySegmentEvidence } from '@/features/monthly/engine/monthlyEvidence';

export const MONTHLY_PLAN_VERSION = 'monthly-plan@1.4.0';

// Neutral BACKGROUND-flow wording for the larger 세운/대운 context (§12). Same shared kernel tier, background
// wording — this NEVER changes the month tier; it is context the prose may lean on.
export type BackgroundFlowLabel = '지원적인 흐름' | '무난한 흐름' | '변동이 있는 흐름' | '조심스러운 흐름';
const BACKGROUND_FLOW_BY_TIER: Record<PolarityTier, BackgroundFlowLabel> = {
  FAVORABLE: '지원적인 흐름',
  STEADY: '무난한 흐름',
  DYNAMIC: '변동이 있는 흐름',
  CAUTION: '조심스러운 흐름',
};

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
  /** P1 (§2.6): the SECONDARY supported domains (distinct from primary + caution) the prose should also
   * cover, derived from the month's other 십신 facts. Empty when only one domain is genuinely supported
   * (§2.7 — no fabricated breadth). */
  secondaryDomains: MonthlyDomain[];
  /** The deterministic domain coverage priority (primary → secondary → caution), distinct. */
  coverageOrder: MonthlyDomain[];
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
  /** BACKGROUND (larger flow) — 세운(year) + 대운 neutral flow, from the shared temporal core. SEPARATE from
   *  the month tier (never folded into overallTier); null when the core is unavailable. */
  backgroundFlow?: { year: BackgroundFlowLabel | null; daewoon: BackgroundFlowLabel | null } | null;
  /** How the larger flow relates to this month's base tier (§9/§11) — categorical, month tier UNCHANGED. */
  backgroundState?: BackgroundSynthesisState;
  /** Plain-language background note (empty/absent for NEUTRAL) — the prose leans on this, never recomputes it. */
  backgroundSummary?: string | null;
  /** Deterministic "왜 이렇게 보나요?" evidence lines (server-owned; no 간지/십신/강약 terms). */
  evidence?: string[];
  /** 원국 오행 구성 — RAW counts (evidence/context only; not an eval signal). */
  elementComposition?: Record<string, number> | null;
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

// P1 domain coverage (§2.1-§2.7): the distinct domains the month's 십신 facts genuinely support, so the prose
// can broaden beyond the primary WITHOUT fabricating breadth. Candidates come from every segment's stem AND
// branch 십신; secondary = distinct candidates minus the primary + caution domain (≤2). Empty when only one
// domain is supported.
function deriveCoverage(
  segments: MonthlySegmentEvidence[],
  primaryDomain: MonthlyDomain,
  cautionDomain: MonthlyDomain | null,
): { secondaryDomains: MonthlyDomain[]; coverageOrder: MonthlyDomain[] } {
  const candidates: MonthlyDomain[] = [];
  for (const seg of segments) {
    candidates.push(tenGodDomain(seg.stemTenGod));
    candidates.push(tenGodDomain(seg.branchTenGod));
  }
  const distinct = [...new Set(candidates)];
  const secondaryDomains = distinct.filter((d) => d !== primaryDomain && d !== cautionDomain).slice(0, 2);
  const coverageOrder = [
    primaryDomain,
    ...secondaryDomains,
    ...(cautionDomain && cautionDomain !== primaryDomain && !secondaryDomains.includes(cautionDomain) ? [cautionDomain] : []),
  ];
  return { secondaryDomains, coverageOrder };
}

// Surface-specific wording for the shared categorical polarity tier. The tier DECISION is the kernel's
// (identical to the previously inline tally); Monthly only maps it to its own label set.
const MONTHLY_TIER_BY_POLARITY: Record<PolarityTier, MonthlyOverallTier> = {
  FAVORABLE: '기회를 살리기 좋은 달',
  STEADY: '안정적으로 운영할 달',
  DYNAMIC: '변화가 많은 달',
  CAUTION: '속도를 조절할 달',
};

type SegmentSignal = {
  weight: number;
  tier: MonthlyOverallTier;
  /** Raw kernel tier (for the background synthesis; the labeled `tier` above is unchanged). */
  polarityTier: PolarityTier;
  primaryMode: MonthlyPrimaryMode;
  primaryModeLabel: string;
  strongestDomain: MonthlyDomain;
  cautionDomain: MonthlyDomain | null;
  harmonyCount: number;
  frictionCount: number;
};

function deriveSegmentSignal(seg: MonthlySegmentEvidence): SegmentSignal {
  // SHARED KERNEL: the segment's polarity tier + its harmony/friction evidence (was an inline tally here).
  const polarity = derivePolarity(seg.relationsToNatal);
  const harmonyCount = polarity.evidence.harmony;
  const frictionCount = polarity.evidence.friction;
  const tier = MONTHLY_TIER_BY_POLARITY[polarity.tier];
  const strongestDomain = tenGodDomain(seg.stemTenGod);
  const cautionDomain = frictionCount > 0 ? tenGodDomain(seg.branchTenGod) : null;
  const primaryMode = derivePrimaryMode(tier, strongestDomain);
  return {
    weight: seg.weight,
    tier,
    polarityTier: polarity.tier,
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
      secondaryDomains: [],
      coverageOrder: [],
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
  const coverage = deriveCoverage(evidence.segments, strongestDomain, cautionDomain);

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

  // BACKGROUND flow (§12): the larger 세운/대운 context, via the SAME kernel — kept SEPARATE from the month tier.
  const t = evidence.temporal;
  const sewoonTier = t?.sewoon ? derivePolarity(t.sewoon.relationsToNatal).tier : null;
  const daewoonTier = t?.activeDaewoon ? derivePolarity(t.activeDaewoon.relationsToNatal).tier : null;
  const yearFlow = sewoonTier ? BACKGROUND_FLOW_BY_TIER[sewoonTier] : null;
  const daewoonFlow = daewoonTier ? BACKGROUND_FLOW_BY_TIER[daewoonTier] : null;
  // Categorical synthesis (§9/§11): the month (dominant segment) is PRIMARY; the larger flow only FRAMES it.
  const synthesis = t ? synthesizeBackground(dominant.polarityTier, [daewoonTier, sewoonTier]) : { state: 'NEUTRAL' as const, summary: '' };

  // Deterministic "왜 이렇게 보나요?" evidence — plain language, traceable to the month + background facts (§21).
  const evidenceLines: string[] = [`이번 달 자체의 흐름은 '${overallTier}' 쪽으로 보입니다.`];
  if (daewoonFlow || yearFlow) {
    const bg = [daewoonFlow ? `큰 흐름은 ${daewoonFlow}` : '', yearFlow ? `올해 전반은 ${yearFlow}` : ''].filter(Boolean).join(', ');
    evidenceLines.push(`지금의 ${bg}입니다.`);
  }
  if (synthesis.summary) evidenceLines.push(synthesis.summary);

  return {
    ...base,
    available: true,
    overallTier,
    primaryMode,
    primaryModeLabel: MONTHLY_MODE_LABEL[primaryMode],
    strongestDomain,
    cautionDomain,
    domainSignals: deriveDomainSignals(overallTier, strongestDomain, cautionDomain),
    secondaryDomains: coverage.secondaryDomains,
    coverageOrder: coverage.coverageOrder,
    supportedDomains: evidence.supportedDomains,
    harmonyCount: dominant.harmonyCount,
    frictionCount: dominant.frictionCount,
    segmentCount: signals.length,
    hasMeaningfulTransition,
    transition,
    backgroundFlow: t ? { year: yearFlow, daewoon: daewoonFlow } : null,
    backgroundState: synthesis.state,
    backgroundSummary: synthesis.summary || null,
    evidence: evidenceLines,
    elementComposition: t?.elementCounts ?? null,
  };
}
