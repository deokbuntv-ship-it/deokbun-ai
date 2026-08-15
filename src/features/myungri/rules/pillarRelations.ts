// DeokbunAI Myungri — canonical pillar RELATION rules (합/충/형/파/해 · 삼합 · 방합).
//
// SCOPE (V1): the UNIVERSAL, non-school-dependent sexagenary relations between two (or more)
// pillars. These are the classical 명리 relation tables taught consistently across schools for
// the common set. They are FACTS ONLY — no strength weighting, no 성립 조건(합화 성사 여부),
// no interpretation. Whether a 합 actually 化, or a 충 is "resolved", is INTERPRETIVE and lives
// in a later layer, never here (constitution: no fake precision).
//
// This module is engine-EXTERNAL and Claude-owned. It reuses only the frozen canonical enums
// (HEAVENLY_STEMS / EARTHLY_BRANCHES) — it does not touch the frozen SAJU engine.
//
// Index basis (frozen order): stems JIA(0)..GUI(9); branches ZI(0)..HAI(11).
import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  type EarthlyBranch,
  type HeavenlyStem,
} from '../../interpretation';
import type { FiveElement } from '../../interpretation';

export const DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_RELATIONS_V1',
  ruleVersion: 'deokbunai.myungri-pillar-relations.v1',
  authority: 'CLASSICAL_MYUNGRI_STANDARD_RELATION_TABLES',
} as const;

export type StemRelationKind = 'STEM_COMBINATION' | 'STEM_CLASH';

export type BranchPairRelationKind =
  | 'BRANCH_SIX_COMBINATION' // 육합
  | 'BRANCH_CLASH' // 충
  | 'BRANCH_HALF_THREE_HARMONY' // 반합 (삼합 중 2지)
  | 'BRANCH_PUNISHMENT' // 형 (상형)
  | 'BRANCH_SELF_PUNISHMENT' // 자형 (같은 지지)
  | 'BRANCH_DESTRUCTION' // 파
  | 'BRANCH_HARM'; // 해

export type BranchSetRelationKind =
  | 'BRANCH_THREE_HARMONY' // 삼합 (완전 3지)
  | 'BRANCH_DIRECTIONAL_UNION' // 방합 (완전 3지)
  | 'BRANCH_THREE_PUNISHMENT'; // 삼형 (寅巳申 / 丑戌未 완전 3지)

export type StemRelationFact = {
  kind: StemRelationKind;
  stems: readonly [HeavenlyStem, HeavenlyStem];
  /** Classical nominal 化 element (STEM_COMBINATION only). NOMINAL — actual 化 is interpretive. */
  nominalTransformElement?: FiveElement;
  ruleVersion: typeof DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion;
};

export type BranchPairRelationFact = {
  kind: BranchPairRelationKind;
  branches: readonly [EarthlyBranch, EarthlyBranch];
  /** Harmony element for BRANCH_HALF_THREE_HARMONY (the trio's 局 element). */
  harmonyElement?: FiveElement;
  ruleVersion: typeof DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion;
};

export type BranchSetRelationFact = {
  kind: BranchSetRelationKind;
  branches: readonly EarthlyBranch[];
  /** 局 element for 삼합/방합. Absent for 삼형. */
  element?: FiveElement;
  ruleVersion: typeof DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion;
};

const si = (stem: HeavenlyStem): number => HEAVENLY_STEMS.indexOf(stem);
const bi = (branch: EarthlyBranch): number => EARTHLY_BRANCHES.indexOf(branch);
const key = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

// ── 천간 (stems) ────────────────────────────────────────────────────────────
// 천간합 (甲己→土, 乙庚→金, 丙辛→水, 丁壬→木, 戊癸→火). Offset +5, canonical 化 element.
const STEM_COMBINATION: ReadonlyArray<readonly [number, number, FiveElement]> = [
  [0, 5, 'EARTH'],
  [1, 6, 'METAL'],
  [2, 7, 'WATER'],
  [3, 8, 'WOOD'],
  [4, 9, 'FIRE'],
];
// 천간충 (甲庚 乙辛 丙壬 丁癸). 戊己(중앙 土) 무충.
const STEM_CLASH: ReadonlyArray<readonly [number, number]> = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
];

// ── 지지 (branches) — pairwise tables ────────────────────────────────────────
// 육합: 子丑 寅亥 卯戌 辰酉 巳申 午未.
const BRANCH_SIX_COMBINATION: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7],
];
// 육충: 子午 丑未 寅申 卯酉 辰戌 巳亥.
const BRANCH_CLASH: ReadonlyArray<readonly [number, number]> = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11],
];
// 육파: 子酉 午卯 巳申 寅亥 辰丑 戌未.
const BRANCH_DESTRUCTION: ReadonlyArray<readonly [number, number]> = [
  [0, 9],
  [6, 3],
  [5, 8],
  [2, 11],
  [4, 1],
  [10, 7],
];
// 육해: 子未 丑午 寅巳 卯辰 申亥 酉戌.
const BRANCH_HARM: ReadonlyArray<readonly [number, number]> = [
  [0, 7],
  [1, 6],
  [2, 5],
  [3, 4],
  [8, 11],
  [9, 10],
];

// 삼합 국 (완전 3지 → 局 element): 申子辰水 亥卯未木 寅午戌火 巳酉丑金.
const THREE_HARMONY: ReadonlyArray<readonly [readonly [number, number, number], FiveElement]> = [
  [[8, 0, 4], 'WATER'],
  [[11, 3, 7], 'WOOD'],
  [[2, 6, 10], 'FIRE'],
  [[5, 9, 1], 'METAL'],
];
// 방합 (완전 3지 → 局 element): 寅卯辰木 巳午未火 申酉戌金 亥子丑水.
const DIRECTIONAL_UNION: ReadonlyArray<readonly [readonly [number, number, number], FiveElement]> = [
  [[2, 3, 4], 'WOOD'],
  [[5, 6, 7], 'FIRE'],
  [[8, 9, 10], 'METAL'],
  [[11, 0, 1], 'WATER'],
];
// 삼형 (완전 3지): 寅巳申 (무은지형), 丑戌未 (지세지형).
const THREE_PUNISHMENT_TRIOS: ReadonlyArray<readonly [number, number, number]> = [
  [2, 5, 8],
  [1, 10, 7],
];
// 상형 그룹 (그룹 내 2지 = 형): 寅巳申, 丑戌未.
const MUTUAL_PUNISHMENT_GROUPS: ReadonlyArray<ReadonlyArray<number>> = [
  [2, 5, 8],
  [1, 10, 7],
];
// 子卯 무례지형 (상호).
const ZI_MAO_PUNISHMENT: readonly [number, number] = [0, 3];
// 자형 (같은 지지끼리): 辰辰 午午 酉酉 亥亥.
const SELF_PUNISHMENT: ReadonlySet<number> = new Set([4, 6, 9, 11]);

const stemCombinationElement = new Map<string, FiveElement>(
  STEM_COMBINATION.map(([a, b, el]) => [key(a, b), el]),
);
const stemCombinationSet = new Set(STEM_COMBINATION.map(([a, b]) => key(a, b)));
const stemClashSet = new Set(STEM_CLASH.map(([a, b]) => key(a, b)));
const sixCombinationSet = new Set(BRANCH_SIX_COMBINATION.map(([a, b]) => key(a, b)));
const branchClashSet = new Set(BRANCH_CLASH.map(([a, b]) => key(a, b)));
const destructionSet = new Set(BRANCH_DESTRUCTION.map(([a, b]) => key(a, b)));
const harmSet = new Set(BRANCH_HARM.map(([a, b]) => key(a, b)));
const halfHarmonyElement = new Map<string, FiveElement>();
for (const [[x, y, z], el] of THREE_HARMONY) {
  halfHarmonyElement.set(key(x, y), el);
  halfHarmonyElement.set(key(y, z), el);
  halfHarmonyElement.set(key(x, z), el);
}

const rv = DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion;

/** Pairwise stem relation (합/충), or null. Same stem → null (no pairwise stem relation). */
export function stemRelation(
  a: HeavenlyStem,
  b: HeavenlyStem,
): StemRelationFact | null {
  const ia = si(a);
  const ib = si(b);
  if (ia < 0 || ib < 0 || ia === ib) return null;
  const k = key(ia, ib);
  if (stemCombinationSet.has(k)) {
    return {
      kind: 'STEM_COMBINATION',
      stems: [a, b],
      nominalTransformElement: stemCombinationElement.get(k),
      ruleVersion: rv,
    };
  }
  if (stemClashSet.has(k)) {
    return { kind: 'STEM_CLASH', stems: [a, b], ruleVersion: rv };
  }
  return null;
}

/**
 * ALL pairwise branch relations between two positions. A single pair can carry several
 * (e.g. 巳申 = 육합 + 파 + 형). If a === b, only 자형 is possible.
 */
export function branchRelations(
  a: EarthlyBranch,
  b: EarthlyBranch,
): BranchPairRelationFact[] {
  const ia = bi(a);
  const ib = bi(b);
  if (ia < 0 || ib < 0) return [];
  const facts: BranchPairRelationFact[] = [];

  if (ia === ib) {
    if (SELF_PUNISHMENT.has(ia)) {
      facts.push({ kind: 'BRANCH_SELF_PUNISHMENT', branches: [a, b], ruleVersion: rv });
    }
    return facts;
  }

  const k = key(ia, ib);
  if (sixCombinationSet.has(k)) {
    facts.push({ kind: 'BRANCH_SIX_COMBINATION', branches: [a, b], ruleVersion: rv });
  }
  if (halfHarmonyElement.has(k)) {
    facts.push({
      kind: 'BRANCH_HALF_THREE_HARMONY',
      branches: [a, b],
      harmonyElement: halfHarmonyElement.get(k),
      ruleVersion: rv,
    });
  }
  if (branchClashSet.has(k)) {
    facts.push({ kind: 'BRANCH_CLASH', branches: [a, b], ruleVersion: rv });
  }
  const pair = [ia, ib];
  const inGroup = (g: ReadonlyArray<number>): boolean => pair.every((x) => g.includes(x));
  if (
    MUTUAL_PUNISHMENT_GROUPS.some(inGroup) ||
    (pair.includes(ZI_MAO_PUNISHMENT[0]) && pair.includes(ZI_MAO_PUNISHMENT[1]))
  ) {
    facts.push({ kind: 'BRANCH_PUNISHMENT', branches: [a, b], ruleVersion: rv });
  }
  if (destructionSet.has(k)) {
    facts.push({ kind: 'BRANCH_DESTRUCTION', branches: [a, b], ruleVersion: rv });
  }
  if (harmSet.has(k)) {
    facts.push({ kind: 'BRANCH_HARM', branches: [a, b], ruleVersion: rv });
  }
  return facts;
}

/**
 * Multi-branch (set) relations present among a collection of branches: full 삼합, 방합, 삼형.
 * Duplicates in the input are de-duplicated for presence checks (a full 局 needs 3 DISTINCT 지).
 */
export function branchSetRelations(
  branches: readonly EarthlyBranch[],
): BranchSetRelationFact[] {
  const present = new Set(branches.map(bi).filter((x) => x >= 0));
  const facts: BranchSetRelationFact[] = [];
  const idxToBranch = (i: number): EarthlyBranch => EARTHLY_BRANCHES[i];

  for (const [trio, el] of THREE_HARMONY) {
    if (trio.every((x) => present.has(x))) {
      facts.push({
        kind: 'BRANCH_THREE_HARMONY',
        branches: trio.map(idxToBranch),
        element: el,
        ruleVersion: rv,
      });
    }
  }
  for (const [trio, el] of DIRECTIONAL_UNION) {
    if (trio.every((x) => present.has(x))) {
      facts.push({
        kind: 'BRANCH_DIRECTIONAL_UNION',
        branches: trio.map(idxToBranch),
        element: el,
        ruleVersion: rv,
      });
    }
  }
  for (const trio of THREE_PUNISHMENT_TRIOS) {
    if (trio.every((x) => present.has(x))) {
      facts.push({
        kind: 'BRANCH_THREE_PUNISHMENT',
        branches: trio.map(idxToBranch),
        ruleVersion: rv,
      });
    }
  }
  return facts;
}
