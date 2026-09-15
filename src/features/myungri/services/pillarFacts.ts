// Shared, pure helpers for the Myungri time-axis services. Every derived value here is produced
// by a FROZEN rule (calculateTenGod / getHiddenStems) so 세운·월운 십신 are identical-by-rule to
// the natal chart's. No interpretation, no strength weighting — facts only.
import {
  calculateTenGod,
  DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION,
  DEOKBUNAI_SAJU_TEN_GODS_VERSION,
  DEOKBUNAI_SAJU_V1_RULE_VERSION,
  EARTHLY_BRANCHES,
  getHiddenStems,
  HEAVENLY_STEMS,
  type EarthlyBranch,
  type HeavenlyStem,
  type SajuPillarPosition,
  type SexagenaryPillar,
} from '../../interpretation';
import { DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE, branchRelations, stemRelation } from '../rules/pillarRelations';
import type {
  HiddenStemTenGod,
  MyungriProvenance,
  MyungriStemAndBranch,
  NatalPillarContext,
  PillarTenGodProfile,
  RelationsToNatal,
} from '../domain/contracts';

export function isHeavenlyStem(value: unknown): value is HeavenlyStem {
  return typeof value === 'string' && (HEAVENLY_STEMS as readonly string[]).includes(value);
}

export function isEarthlyBranch(value: unknown): value is EarthlyBranch {
  return typeof value === 'string' && (EARTHLY_BRANCHES as readonly string[]).includes(value);
}

export function myungriProvenance(): MyungriProvenance {
  return {
    yearMonthPillarRuleVersion: DEOKBUNAI_SAJU_V1_RULE_VERSION,
    tenGodRuleVersion: DEOKBUNAI_SAJU_TEN_GODS_VERSION,
    hiddenStemRuleVersion: DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION,
    relationRuleVersion: DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion,
  };
}

/** True only when a natal context carries a fully-valid day master + year/month/day (hour optional). */
export function isValidNatalContext(natal: NatalPillarContext): boolean {
  if (!isHeavenlyStem(natal.dayMaster)) return false;
  const required: MyungriStemAndBranch[] = [
    natal.pillars.year,
    natal.pillars.month,
    natal.pillars.day,
  ];
  for (const p of required) {
    if (!p || !isHeavenlyStem(p.stem) || !isEarthlyBranch(p.branch)) return false;
  }
  const hour = natal.pillars.hour;
  if (hour && (!isHeavenlyStem(hour.stem) || !isEarthlyBranch(hour.branch))) return false;
  return true;
}

/**
 * 십신 profile of a luck pillar vs the natal day master, entirely via frozen rules.
 * Returns null on any frozen-rule failure (fail-closed — caller maps to UNAVAILABLE).
 */
export function buildTenGodProfile(
  dayMaster: HeavenlyStem,
  pillar: SexagenaryPillar,
): PillarTenGodProfile | null {
  const stemTenGod = calculateTenGod(dayMaster, pillar.stem);
  if (!stemTenGod.ok) return null;

  const hidden = getHiddenStems(pillar.branch);
  if (!hidden.ok) return null;

  const hiddenStemTenGods: HiddenStemTenGod[] = [];
  let branchMainTenGod: HiddenStemTenGod | null = null;
  for (const hs of hidden.value) {
    const tg = calculateTenGod(dayMaster, hs.stem);
    if (!tg.ok) return null;
    const entry: HiddenStemTenGod = { stem: hs.stem, role: hs.role, tenGod: tg.value };
    hiddenStemTenGods.push(entry);
    if (hs.role === 'MAIN') branchMainTenGod = entry;
  }
  if (!branchMainTenGod) return null;

  return {
    stem: pillar.stem,
    branch: pillar.branch,
    stemTenGod: stemTenGod.value,
    branchMainTenGod: branchMainTenGod.tenGod,
    hiddenStemTenGods,
  };
}

const NATAL_POSITIONS: readonly SajuPillarPosition[] = ['YEAR', 'MONTH', 'DAY', 'HOUR'];

function natalPillarAt(
  natal: NatalPillarContext,
  position: SajuPillarPosition,
): MyungriStemAndBranch | undefined {
  switch (position) {
    case 'YEAR':
      return natal.pillars.year;
    case 'MONTH':
      return natal.pillars.month;
    case 'DAY':
      return natal.pillars.day;
    case 'HOUR':
      return natal.pillars.hour;
  }
}

/** Stem + branch relations of a luck pillar against EACH natal position present. */
export function buildRelationsToNatal(
  pillar: SexagenaryPillar,
  natal: NatalPillarContext,
): RelationsToNatal {
  const stemAcc: Array<{ position: SajuPillarPosition; relation: ReturnType<typeof stemRelation> }> = [];
  const branchAcc: Array<{ position: SajuPillarPosition; relations: ReturnType<typeof branchRelations> }> = [];

  for (const position of NATAL_POSITIONS) {
    const natalPillar = natalPillarAt(natal, position);
    if (!natalPillar) continue;
    const sr = stemRelation(pillar.stem, natalPillar.stem);
    if (sr) stemAcc.push({ position, relation: sr });
    const br = branchRelations(pillar.branch, natalPillar.branch);
    if (br.length > 0) branchAcc.push({ position, relations: br });
  }

  const stemOut = stemAcc
    .filter((x) => x.relation !== null)
    .map((x) => ({ position: x.position, relation: x.relation! }));
  const branchOut = branchAcc.flatMap((x) =>
    x.relations.map((relation) => ({ position: x.position, relation })),
  );
  return { stem: stemOut, branch: branchOut };
}
