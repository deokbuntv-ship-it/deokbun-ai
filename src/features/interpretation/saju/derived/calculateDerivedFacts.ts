import { pillarToSexagenaryIndex } from '../sexagenary';
import type {
  HeavenlyStem,
  SajuFourPillars,
  SexagenaryPillar,
} from '../contracts';
import type {
  SajuDerivedBranchAnnotation,
  SajuDerivedFacts,
  SajuDerivedFactsError,
  SajuDerivedFactsInput,
  SajuDerivedFactsResult,
  SajuDerivedHiddenStemAnnotation,
  SajuDerivedPillarAnnotation,
  SajuDerivedStemAnnotation,
  SajuPillarPosition,
} from './contracts';
import {
  calculateTenGod,
  DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS,
  getBranchRule,
  getStemRule,
} from './rules';

function failure<T>(error: SajuDerivedFactsError): SajuDerivedFactsResult<T> {
  return { ok: false, error };
}

function validatePillar(
  pillar: SexagenaryPillar,
  field: string,
): SajuDerivedFactsResult<true> {
  const canonicalIndex = pillarToSexagenaryIndex(pillar.stem, pillar.branch);
  if (!canonicalIndex.ok) {
    return failure({
      code: 'INVALID_SEXAGENARY_PILLAR',
      field,
      receivedValue: { stem: pillar.stem, branch: pillar.branch },
    });
  }
  if (canonicalIndex.value !== pillar.index) {
    return failure({
      code: 'INVALID_PILLAR_IDENTITY',
      field: `${field}.index`,
      receivedValue: pillar.index,
    });
  }
  return { ok: true, value: true };
}

function annotateStem(
  dayMaster: HeavenlyStem,
  target: HeavenlyStem,
): SajuDerivedFactsResult<SajuDerivedStemAnnotation> {
  const rule = getStemRule(target);
  if (!rule.ok) return rule;
  const tenGod = calculateTenGod(dayMaster, target);
  if (!tenGod.ok) return tenGod;
  return {
    ok: true,
    value: {
      yinYang: rule.value.yinYang,
      element: rule.value.element,
      tenGod: tenGod.value,
    },
  };
}

function annotateBranch(
  dayMaster: HeavenlyStem,
  pillar: SexagenaryPillar,
): SajuDerivedFactsResult<SajuDerivedBranchAnnotation> {
  const rule = getBranchRule(pillar.branch);
  if (!rule.ok) return rule;
  const hiddenStems: SajuDerivedHiddenStemAnnotation[] = [];
  for (const definition of rule.value.hiddenStems) {
    const annotation = annotateStem(dayMaster, definition.stem);
    if (!annotation.ok) return annotation;
    hiddenStems.push({ ...definition, ...annotation.value });
  }
  return {
    ok: true,
    value: {
      yinYang: rule.value.yinYang,
      element: rule.value.element,
      hiddenStems,
    },
  };
}

function annotatePillar(
  position: SajuPillarPosition,
  pillar: SexagenaryPillar,
  dayMaster: HeavenlyStem,
): SajuDerivedFactsResult<SajuDerivedPillarAnnotation> {
  const validity = validatePillar(pillar, position.toLowerCase());
  if (!validity.ok) return validity;
  const stem = annotateStem(dayMaster, pillar.stem);
  if (!stem.ok) return stem;
  const branch = annotateBranch(dayMaster, pillar);
  if (!branch.ok) return branch;
  return { ok: true, value: { position, stem: stem.value, branch: branch.value } };
}

export function calculateSajuDerivedFacts(
  input: SajuDerivedFactsInput,
): SajuDerivedFactsResult<SajuDerivedFacts> {
  const source: SajuFourPillars = input.fourPillars;
  const dayMaster = source.day.stem;
  const year = annotatePillar('YEAR', source.year, dayMaster);
  if (!year.ok) return year;
  const month = annotatePillar('MONTH', source.month, dayMaster);
  if (!month.ok) return month;
  const day = annotatePillar('DAY', source.day, dayMaster);
  if (!day.ok) return day;

  const pillars: SajuDerivedFacts['pillars'] = {
    year: year.value,
    month: month.value,
    day: day.value,
  };
  if (source.hour.status === 'AVAILABLE') {
    const hour = annotatePillar('HOUR', source.hour.pillar, dayMaster);
    if (!hour.ok) return hour;
    pillars.hour = hour.value;
  }

  return {
    ok: true,
    value: {
      ruleVersions: DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS,
      pillars,
    },
  };
}
