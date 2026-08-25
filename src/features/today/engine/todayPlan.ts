// The DAILY PLAN — the smallest deterministic decision layer for 오늘의 운세 (§6/§7/§12/§13). It does NOT copy
// the full consultation Answer Plan; it reads today's 일운 relations and produces a READABLE overall tier +
// the day's ACTION MODE + which domain the day emphasizes + where to pace, plus the answer-shape limits the
// prose must obey. The tier + mode + domain statuses come from a TRANSPARENT harmony/friction tally crossed
// with the day-stem 십신 (like the compatibility tier) — never a fabricated numeric score (§11/§14). All of
// this is derived from evidence that ALREADY exists; no new engine semantics are introduced. Pure + tested.
import { derivePolarity, type PolarityTier } from '@/features/polarity/polarityKernel';
import { synthesizeBackground, type BackgroundSynthesisState } from '@/features/fortune-shared/temporalSynthesis';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import type { TodayDomain, TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';

export const TODAY_PLAN_VERSION = 'today-plan@1.3.0';

// Neutral BACKGROUND-flow phrase for the larger 세운/대운 context (§11). Same shared kernel tier as the day,
// but a background wording — this NEVER changes the day's tier; it is context the prose may lean on.
export type BackgroundFlowLabel = '지원적인 흐름' | '무난한 흐름' | '변동이 있는 흐름' | '조심스러운 흐름';
const BACKGROUND_FLOW_BY_TIER: Record<PolarityTier, BackgroundFlowLabel> = {
  FAVORABLE: '지원적인 흐름',
  STEADY: '무난한 흐름',
  DYNAMIC: '변동이 있는 흐름',
  CAUTION: '조심스러운 흐름',
};

export type DailyOverallTone = '좋은 흐름' | '무난한 흐름' | '변화가 많은 날' | '조심해서 움직일 날';

// The day's PRIMARY ACTION MODE (§6/§7) — a deterministic "what today favors doing", derived from the tempo
// (harmony/friction tier) crossed with the day's emphasis (십신 domain). It is a suitability read, never an
// event forecast. Kept to a small, useful set (§12: not 12 vague categories).
export type PrimaryMode = 'EXECUTE' | 'MANAGE' | 'CONNECT' | 'ADJUST' | 'STABILIZE';

export const PRIMARY_MODE_LABEL: Record<PrimaryMode, string> = {
  EXECUTE: '실행·추진',
  MANAGE: '점검·관리',
  CONNECT: '관계·조율',
  ADJUST: '조정·조율',
  STABILIZE: '속도 조절·정리',
};

// Non-numeric domain status (§13/§14) — only ever produced for the two domains the evidence robustly knows:
// where the day's energy sits (emphasis) and, on a friction day, where to pace (caution). Never a fabricated
// full 5-domain matrix.
export type DomainStatus = '좋음' | '무난' | '주의';
export type DailyDomainSignal = { domain: TodayDomain; status: DomainStatus };

export type DailyPlan = {
  fortuneDate: string;
  available: boolean;
  overallTone: DailyOverallTone;
  /** The day's action mode (server-owned; the LLM verbalizes it, never chooses it). */
  primaryMode: PrimaryMode;
  primaryModeLabel: string;
  /** The domain the day's energy (일간 십신) emphasizes. */
  strongestDomain: TodayDomain;
  /** Where to pace when there is friction; null on a clean day. */
  cautionDomain: TodayDomain | null;
  /** ≤2 deterministic domain statuses (emphasis + caution) — the "오늘의 핵심" glance row. */
  domainSignals: DailyDomainSignal[];
  supportedDomains: TodayDomain[];
  /** Transparent tally — the evidence behind the tier (NOT a score). */
  harmonyCount: number;
  frictionCount: number;
  maxHighlights: number;
  maxCautions: number;
  /** The day is a suitability read, never an event guarantee (§21/§54). */
  forbidEventCertainty: boolean;
  /** BACKGROUND (larger flow) context — 세운(year) + 대운 neutral flow, from the shared temporal core.
   *  SEPARATE from the day tier (never folded into overallTone); null when the core is unavailable. */
  backgroundFlow?: { year: BackgroundFlowLabel | null; daewoon: BackgroundFlowLabel | null } | null;
  /** How the larger flow relates to today's base tier (§9/§10) — categorical, base tier UNCHANGED. */
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

// Tempo (tier) × emphasis (십신 domain) → action mode. Friction sets the tempo first: a friction-dominant day
// is always "속도 조절·정리"; a mixed day is "조정·조율". On a friction-free day the emphasis domain chooses.
function derivePrimaryMode(tone: DailyOverallTone, strongestDomain: TodayDomain): PrimaryMode {
  if (tone === '조심해서 움직일 날') return 'STABILIZE';
  if (tone === '변화가 많은 날') return 'ADJUST';
  switch (strongestDomain) {
    case 'work':
    case 'action':
      return 'EXECUTE';
    case 'wealth':
    case 'overall':
      return 'MANAGE';
    case 'relationship':
      return 'CONNECT';
  }
}

// ≤2 truthful domain statuses. The emphasized domain is '좋음' only on a clearly good day, else '무난' — never
// '주의' (the caution row carries 주의). The caution domain (friction days only, when distinct) is '주의'.
function deriveDomainSignals(
  tone: DailyOverallTone,
  strongestDomain: TodayDomain,
  cautionDomain: TodayDomain | null,
): DailyDomainSignal[] {
  const emphasisStatus: DomainStatus = tone === '좋은 흐름' ? '좋음' : '무난';
  const signals: DailyDomainSignal[] = [{ domain: strongestDomain, status: emphasisStatus }];
  if (cautionDomain !== null && cautionDomain !== strongestDomain) {
    signals.push({ domain: cautionDomain, status: '주의' });
  }
  return signals;
}

// Surface-specific wording for the shared categorical polarity tier. The tier DECISION is the kernel's
// (identical to the previously inline tally); Today only maps it to its own label set.
const TODAY_TONE_BY_TIER: Record<PolarityTier, DailyOverallTone> = {
  FAVORABLE: '좋은 흐름',
  STEADY: '무난한 흐름',
  DYNAMIC: '변화가 많은 날',
  CAUTION: '조심해서 움직일 날',
};

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
    return {
      ...base,
      available: false,
      overallTone: '무난한 흐름',
      primaryMode: 'MANAGE',
      primaryModeLabel: PRIMARY_MODE_LABEL.MANAGE,
      strongestDomain: 'overall',
      cautionDomain: null,
      domainSignals: [],
      supportedDomains: [],
      harmonyCount: 0,
      frictionCount: 0,
    };
  }

  // SHARED KERNEL: the day's polarity tier + its harmony/friction evidence (was an inline tally here).
  const polarity = derivePolarity(evidence.dayLuck.relationsToNatal);
  const harmonyCount = polarity.evidence.harmony;
  const frictionCount = polarity.evidence.friction;
  const overallTone = TODAY_TONE_BY_TIER[polarity.tier];

  const strongestDomain = tenGodDomain(evidence.dayStemTenGod);
  const cautionDomain = frictionCount > 0 ? tenGodDomain(evidence.dayBranchTenGod) : null;
  const primaryMode = derivePrimaryMode(overallTone, strongestDomain);

  // BACKGROUND flow (§11): the larger 세운/대운 context, via the SAME kernel — kept SEPARATE from the day tier.
  const t = evidence.temporal;
  const sewoonTier = t?.sewoon ? derivePolarity(t.sewoon.relationsToNatal).tier : null;
  const daewoonTier = t?.activeDaewoon ? derivePolarity(t.activeDaewoon.relationsToNatal).tier : null;
  const yearFlow = sewoonTier ? BACKGROUND_FLOW_BY_TIER[sewoonTier] : null;
  const daewoonFlow = daewoonTier ? BACKGROUND_FLOW_BY_TIER[daewoonTier] : null;
  // Categorical synthesis (§9/§10): how the larger flow FRAMES today's base tier. Base tier is NEVER changed.
  const synthesis = t ? synthesizeBackground(polarity.tier, [daewoonTier, sewoonTier]) : { state: 'NEUTRAL' as const, summary: '' };

  // Deterministic "왜 이렇게 보나요?" evidence — plain language, traceable to the day + background facts (§20).
  const evidenceLines: string[] = [`오늘 하루의 흐름은 '${overallTone}' 쪽으로 보입니다.`];
  if (daewoonFlow || yearFlow) {
    const bg = [daewoonFlow ? `큰 흐름은 ${daewoonFlow}` : '', yearFlow ? `올해 전반은 ${yearFlow}` : ''].filter(Boolean).join(', ');
    evidenceLines.push(`지금의 ${bg}입니다.`);
  }
  if (synthesis.summary) evidenceLines.push(synthesis.summary);

  return {
    ...base,
    available: true,
    overallTone,
    primaryMode,
    primaryModeLabel: PRIMARY_MODE_LABEL[primaryMode],
    strongestDomain,
    cautionDomain,
    domainSignals: deriveDomainSignals(overallTone, strongestDomain, cautionDomain),
    supportedDomains: evidence.supportedDomains,
    harmonyCount,
    frictionCount,
    backgroundFlow: t ? { year: yearFlow, daewoon: daewoonFlow } : null,
    backgroundState: synthesis.state,
    backgroundSummary: synthesis.summary || null,
    evidence: evidenceLines,
    elementComposition: t?.elementCounts ?? null,
  };
}
