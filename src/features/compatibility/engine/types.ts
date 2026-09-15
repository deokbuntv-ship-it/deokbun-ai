// DeokbunAI Compatibility (궁합) — deterministic pairwise engine CONTRACTS.
//
// This whole engine layer is Claude-owned and engine-EXTERNAL: it CONSUMES the frozen
// SAJU outputs + the frozen-consuming Myungri relation rules (합/충/형/파/해 · 삼합/방합 ·
// 십신 · 오행) read-only and NEVER recomputes calendar/pillar/element semantics. It mirrors
// the within-chart `calculateNatalRelations` loop, but with cells drawn from TWO charts.
//
// HONESTY FLOOR (owner §3/§13/§19): every fact here is a DISCRETE named relation or an
// INTEGER element count that the frozen engine actually produced. There is NO invented
// doctrine, NO mystic 0–100 score, and NO LLM contribution. The user-facing verdict is a
// transparent TALLY → TIER, not a fabricated percentage (a fake 87 is worse than an honest
// grounded tier). Ziwei is individual-only (no synastry) and Qimen is question-time-only, so
// neither contributes to the pairwise verdict — only Myungri natal relations do.
import type {
  EarthlyBranch,
  FiveElement,
  HeavenlyStem,
  SajuFiveElementCounts,
  SajuPillarPosition,
  TenGod,
} from '@/features/interpretation';
import type {
  BranchPairRelationFact,
  BranchSetRelationFact,
  NatalPillarContext,
  StemRelationFact,
} from '@/features/myungri';

// ── versions (owner §74 — lightweight, not over-versioned) ───────────────────
export const COMPATIBILITY_ENGINE_VERSION = 'compatibility-engine@1.0.0';
export const COMPATIBILITY_TIER_MODEL_VERSION = 'compatibility-tier@1.0.0';

export type CompatibilityMode = 'solo' | 'compatibility';

// One person's frozen-derived natal facts the pairwise layer consumes read-only.
export type PersonPairwiseInput = {
  natal: NatalPillarContext;
  /** 오행 분포 counts (frozen `fiveElementDistribution.direct.counts`). */
  elementCounts: SajuFiveElementCounts;
  /** true only when the frozen engine marked 시주 AVAILABLE (partner 시주 is often unknown). */
  hourKnown: boolean;
};

// A cross-chart relation, tagged with which pillar of each person it holds between.
export type CrossStemRelation = {
  self: SajuPillarPosition;
  target: SajuPillarPosition;
  relation: StemRelationFact;
};
export type CrossBranchRelation = {
  self: SajuPillarPosition;
  target: SajuPillarPosition;
  relation: BranchPairRelationFact;
};

export type PersonNatalSummary = {
  dayMaster: HeavenlyStem;
  /** 일지 (day branch) — the classical spouse-seat 지지. */
  dayBranch: EarthlyBranch;
  elementCounts: SajuFiveElementCounts;
  hourKnown: boolean;
};

// The complete deterministic pairwise FACT SET (facts only — no interpretation).
export type PairwiseRelationFacts = {
  self: PersonNatalSummary;
  target: PersonNatalSummary;
  /** 일간↔일간 (day-master to day-master) — the couple-axis stem relation, or null. */
  dayStemRelation: StemRelationFact | null;
  /** 일지↔일지 (day-branch to day-branch) — the couple-seat relations (can be several). */
  dayBranchRelations: BranchPairRelationFact[];
  /** Every cross-chart stem relation (incl. the day one). */
  crossStemRelations: CrossStemRelation[];
  /** Every cross-chart branch relation (incl. the day one). */
  crossBranchRelations: CrossBranchRelation[];
  /** 삼합/방합/삼형 formed across the UNION of both people's branches. */
  unionSetRelations: BranchSetRelationFact[];
  /** 십신 of the target's day-master viewed FROM self's day-master (what B is to A). */
  tenGodTargetToSelf: TenGod | null;
  /** 십신 of self's day-master viewed FROM target's day-master (what A is to B). */
  tenGodSelfToTarget: TenGod | null;
  /** Element gaps one person fills for the other (오행 보완). */
  elementComplement: {
    /** self supplies an element the target lacks entirely. */
    selfSuppliesTarget: FiveElement[];
    /** target supplies an element self lacks entirely. */
    targetSuppliesSelf: FiveElement[];
    /** elements NEITHER person has (a shared blind spot). */
    sharedMissing: FiveElement[];
  };
};

// ── user-facing verdict (transparent tier, never a fabricated %) ─────────────
export type DimensionKey = 'BOND' | 'FRICTION' | 'ELEMENT';
export type DimensionSignal = 'POSITIVE' | 'MODERATE' | 'WATCH';

export type CompatibilityDimension = {
  key: DimensionKey;
  /** Korean dimension name (정서·유대 / 갈등·마찰 / 오행 보완). */
  title: string;
  signal: DimensionSignal;
  /** short consumer-safe verdict phrase for this dimension. */
  verdict: string;
  /** the transparent tally lines that produced the verdict (facts, not prose). */
  tally: string[];
};

export type OverallTier = 'VERY_GOOD' | 'GOOD' | 'NEEDS_CARE' | 'CHALLENGING';

export type CompatibilityAssessment = {
  overall: OverallTier;
  /** Korean overall-tier label (매우 잘 맞는 편 / 잘 맞는 편 / 보완이 필요한 편 / 갈등 관리가 중요한 편). */
  overallLabel: string;
  dimensions: CompatibilityDimension[];
  /** true when either 시주 is unknown → pairwise precision is reduced (support level ↓). */
  reducedPrecision: boolean;
  tierModelVersion: typeof COMPATIBILITY_TIER_MODEL_VERSION;
};
