// DeokbunAI Myungri — connected time-axis contracts (세운 · 월운 · 원국↔대운↔세운↔월운 관계).
//
// These modules are engine-EXTERNAL and Claude-owned. They CONSUME the frozen SAJU engine
// read-only (calculateYearPillar / calculateMonthPillar / calculateTenGod / getHiddenStems) so
// the whole time-axis is ONE canonical rule family — 세운/월운 pillars are produced by the exact
// functions that produce the natal year/month pillars, and 십신 by the exact frozen ten-god rule.
// Results are fail-closed discriminated unions (AVAILABLE | UNAVAILABLE) mirroring Daewoon V1.
import type {
  EarthlyBranch,
  HeavenlyStem,
  HiddenStemRole,
  LunarMonthOrdinal,
  SajuPillarPosition,
  SexagenaryPillar,
  TenGod,
} from '../../interpretation';
import type {
  BranchPairRelationFact,
  BranchSetRelationFact,
  StemRelationFact,
} from '../rules/pillarRelations';

export const DEOKBUNAI_MYUNGRI_SEWOON_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_SEWOON_V1',
  ruleVersion: 'deokbunai.myungri-sewoon.v1',
} as const;

export const DEOKBUNAI_MYUNGRI_WOLWOON_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_WOLWOON_V1',
  ruleVersion: 'deokbunai.myungri-wolwoon.v1',
} as const;

export const DEOKBUNAI_MYUNGRI_TIME_AXIS_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_TIME_AXIS_V1',
  ruleVersion: 'deokbunai.myungri-time-axis.v1',
} as const;

export const DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_DAEWOON_TEN_GODS_V1',
  ruleVersion: 'deokbunai.myungri-daewoon-ten-gods.v1',
} as const;

export const DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1',
  ruleVersion: 'deokbunai.myungri-rooting-transparency.v1',
} as const;

export const DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1',
  ruleVersion: 'deokbunai.myungri-month-command.v1',
} as const;

/** Provenance carried by every Myungri time-axis fact — records every reused frozen ruleVersion. */
export type MyungriProvenance = {
  /** The frozen SAJU V1 rule whose year/month pillar functions 세운/월운 reuse verbatim. */
  yearMonthPillarRuleVersion: string;
  tenGodRuleVersion: 'deokbunai.saju-ten-gods.v1';
  hiddenStemRuleVersion: 'deokbunai.saju-hidden-stems.v1';
  relationRuleVersion: 'deokbunai.myungri-pillar-relations.v1';
};

export type MyungriStemAndBranch = {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
};

/** Natal chart facts the time-axis consumes read-only (adaptable from frozen SajuFourPillars). */
export type NatalPillarContext = {
  /** 일간 (day master) — the reference for every 십신. */
  dayMaster: HeavenlyStem;
  pillars: {
    year: MyungriStemAndBranch;
    month: MyungriStemAndBranch;
    day: MyungriStemAndBranch;
    /** Absent when 시주 (hour pillar) is unknown/ambiguous. */
    hour?: MyungriStemAndBranch;
  };
};

export type HiddenStemTenGod = {
  stem: HeavenlyStem;
  role: HiddenStemRole;
  tenGod: TenGod;
};

/** 십신 profile of a single luck pillar relative to the natal day master. */
export type PillarTenGodProfile = {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  /** 천간 십신 (year/month stem vs day master). */
  stemTenGod: TenGod;
  /** 지지 정기(main hidden stem) 십신. */
  branchMainTenGod: TenGod;
  /** 지장간 전체 십신 (여기/중기/정기). */
  hiddenStemTenGods: readonly HiddenStemTenGod[];
};

export type PositionedStemRelation = {
  position: SajuPillarPosition;
  relation: StemRelationFact;
};

export type PositionedBranchRelation = {
  position: SajuPillarPosition;
  relation: BranchPairRelationFact;
};

/** Relations of one luck pillar against each of the natal pillars. */
export type RelationsToNatal = {
  stem: readonly PositionedStemRelation[];
  branch: readonly PositionedBranchRelation[];
};

type MyungriResultBase = {
  provenance: MyungriProvenance;
  assumptions: readonly string[];
  limitations: readonly string[];
};

// ── 세운 (Sewoon / yearly luck) ──────────────────────────────────────────────
export type SewoonUnavailableReason =
  | 'INVALID_DAY_MASTER'
  | 'INVALID_NATAL_PILLAR'
  | 'INVALID_TARGET_YEAR'
  | 'PILLAR_CALCULATION_FAILED'
  | 'TEN_GOD_CALCULATION_FAILED';

export type SewoonResult =
  | (MyungriResultBase & {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_SEWOON_V1_RULE.ruleVersion;
      targetYear: number;
      dayMaster: HeavenlyStem;
      pillar: SexagenaryPillar;
      tenGods: PillarTenGodProfile;
      relationsToNatal: RelationsToNatal;
    })
  | (MyungriResultBase & {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_SEWOON_V1_RULE.ruleVersion;
      reason: SewoonUnavailableReason;
    });

// ── 월운 (Wolwoon / monthly luck) ────────────────────────────────────────────
export type WolwoonUnavailableReason =
  | 'INVALID_DAY_MASTER'
  | 'INVALID_NATAL_PILLAR'
  | 'INVALID_TARGET_YEAR'
  | 'INVALID_MONTH_ORDINAL'
  | 'PILLAR_CALCULATION_FAILED'
  | 'TEN_GOD_CALCULATION_FAILED';

export type WolwoonResult =
  | (MyungriResultBase & {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_WOLWOON_V1_RULE.ruleVersion;
      targetYear: number;
      /** 사주 월(月) ordinal 1..12 (寅월=1 … 丑월=12), matching the frozen month-pillar rule. */
      lunarMonth: LunarMonthOrdinal;
      dayMaster: HeavenlyStem;
      yearPillar: SexagenaryPillar;
      pillar: SexagenaryPillar;
      tenGods: PillarTenGodProfile;
      relationsToNatal: RelationsToNatal;
      /** Relation of the 월운 pillar against its containing 세운 pillar. */
      relationToSewoon: {
        stem: StemRelationFact | null;
        branch: readonly BranchPairRelationFact[];
      };
    })
  | (MyungriResultBase & {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_WOLWOON_V1_RULE.ruleVersion;
      reason: WolwoonUnavailableReason;
    });

// ── 원국 ↔ 대운 ↔ 세운 ↔ 월운 connected time-axis ────────────────────────────
export type TimeAxisLayer = 'NATAL_YEAR' | 'NATAL_MONTH' | 'NATAL_DAY' | 'NATAL_HOUR' | 'DAEWOON' | 'SEWOON' | 'WOLWOON';

export type CrossLayerStemRelation = {
  from: TimeAxisLayer;
  to: TimeAxisLayer;
  relation: StemRelationFact;
};

export type CrossLayerBranchRelation = {
  from: TimeAxisLayer;
  to: TimeAxisLayer;
  relation: BranchPairRelationFact;
};

export type MyungriTimeAxisUnavailableReason =
  | 'INVALID_NATAL_CONTEXT'
  | 'SEWOON_UNAVAILABLE'
  | 'WOLWOON_UNAVAILABLE';

export type MyungriTimeAxisResult =
  | (MyungriResultBase & {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_TIME_AXIS_V1_RULE.ruleVersion;
      dayMaster: HeavenlyStem;
      natal: NatalPillarContext;
      /** Active 대운 pillar for the queried age, when the caller supplies it. */
      daewoon: MyungriStemAndBranch | null;
      sewoon: Extract<SewoonResult, { capability: 'AVAILABLE' }>;
      /** Present only when a target month was queried. */
      wolwoon: Extract<WolwoonResult, { capability: 'AVAILABLE' }> | null;
      /** Pairwise relations among ALL layers present (natal 4 + 대운 + 세운 + 월운). */
      crossLayerStemRelations: readonly CrossLayerStemRelation[];
      crossLayerBranchRelations: readonly CrossLayerBranchRelation[];
      /** Set-level 삼합/방합/삼형 across the union of every branch present on the axis. */
      branchSetRelations: readonly BranchSetRelationFact[];
    })
  | (MyungriResultBase & {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_TIME_AXIS_V1_RULE.ruleVersion;
      reason: MyungriTimeAxisUnavailableReason;
    });
