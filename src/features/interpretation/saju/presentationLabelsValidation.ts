import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './contracts';
import type {
  FiveElement,
  HiddenStemRole,
  TenGod,
  YinYang,
} from './derived/contracts';
import {
  EARTHLY_BRANCH_LABELS,
  FIVE_ELEMENT_LABELS,
  HEAVENLY_STEM_LABELS,
  HIDDEN_STEM_ROLE_LABELS,
  TEN_GOD_LABELS,
  YIN_YANG_LABELS,
} from './presentationLabels';

export type SajuPresentationLabelsValidationReport = {
  ok: boolean;
  failures: string[];
  stemCoverage: number;
  branchCoverage: number;
  tenGodCoverage: number;
  hiddenStemRoleCoverage: number;
  yinYangCoverage: number;
  fiveElementCoverage: number;
  emptyLabelCount: number;
  duplicateLabelCount: number;
};

const TEN_GODS: readonly TenGod[] = [
  'PEER',
  'ROB_WEALTH',
  'EATING_GOD',
  'HURTING_OFFICER',
  'INDIRECT_WEALTH',
  'DIRECT_WEALTH',
  'SEVEN_KILLINGS',
  'DIRECT_OFFICER',
  'INDIRECT_RESOURCE',
  'DIRECT_RESOURCE',
];
const HIDDEN_STEM_ROLES: readonly HiddenStemRole[] = [
  'MAIN',
  'MIDDLE',
  'RESIDUAL',
];
const YIN_YANG: readonly YinYang[] = ['YANG', 'YIN'];
const FIVE_ELEMENTS: readonly FiveElement[] = [
  'WOOD',
  'FIRE',
  'EARTH',
  'METAL',
  'WATER',
];

function duplicateCount(values: readonly string[]): number {
  return values.length - new Set(values).size;
}

export function validateSajuPresentationLabels(): SajuPresentationLabelsValidationReport {
  const failures: string[] = [];
  const stemCoverage = HEAVENLY_STEMS.filter(
    (stem) => HEAVENLY_STEM_LABELS[stem] !== undefined,
  ).length;
  const branchCoverage = EARTHLY_BRANCHES.filter(
    (branch) => EARTHLY_BRANCH_LABELS[branch] !== undefined,
  ).length;
  const tenGodCoverage = TEN_GODS.filter(
    (tenGod) => TEN_GOD_LABELS[tenGod] !== undefined,
  ).length;
  const hiddenStemRoleCoverage = HIDDEN_STEM_ROLES.filter(
    (role) => HIDDEN_STEM_ROLE_LABELS[role] !== undefined,
  ).length;
  const yinYangCoverage = YIN_YANG.filter(
    (value) => YIN_YANG_LABELS[value] !== undefined,
  ).length;
  const fiveElementCoverage = FIVE_ELEMENTS.filter(
    (element) => FIVE_ELEMENT_LABELS[element] !== undefined,
  ).length;

  const labelGroups = [
    HEAVENLY_STEMS.map((stem) => HEAVENLY_STEM_LABELS[stem].hanja),
    HEAVENLY_STEMS.map((stem) => HEAVENLY_STEM_LABELS[stem].hangul),
    EARTHLY_BRANCHES.map((branch) => EARTHLY_BRANCH_LABELS[branch].hanja),
    EARTHLY_BRANCHES.map((branch) => EARTHLY_BRANCH_LABELS[branch].hangul),
    TEN_GODS.map((tenGod) => TEN_GOD_LABELS[tenGod].hangul),
    HIDDEN_STEM_ROLES.map((role) => HIDDEN_STEM_ROLE_LABELS[role].hangul),
    YIN_YANG.map((value) => YIN_YANG_LABELS[value].hangul),
    FIVE_ELEMENTS.map((element) => FIVE_ELEMENT_LABELS[element].hangul),
  ];
  const allLabels = labelGroups.flat();
  const emptyLabelCount = allLabels.filter((label) => label.trim().length === 0).length;
  const duplicateLabelCount = labelGroups.reduce(
    (total, labels) => total + duplicateCount(labels),
    0,
  );

  const expectations: readonly [boolean, string][] = [
    [stemCoverage === 10, 'Stem label coverage was not 10/10.'],
    [branchCoverage === 12, 'Branch label coverage was not 12/12.'],
    [tenGodCoverage === 10, 'Ten God label coverage was not 10/10.'],
    [hiddenStemRoleCoverage === 3, 'Hidden Stem Role coverage was not 3/3.'],
    [yinYangCoverage === 2, 'Yin/Yang label coverage was not 2/2.'],
    [fiveElementCoverage === 5, 'Five Element label coverage was not 5/5.'],
    [emptyLabelCount === 0, 'Empty presentation labels were found.'],
    [duplicateLabelCount === 0, 'Duplicate labels were found within a semantic group.'],
  ];
  for (const [condition, message] of expectations) {
    if (!condition) failures.push(message);
  }

  return {
    ok: failures.length === 0,
    failures,
    stemCoverage,
    branchCoverage,
    tenGodCoverage,
    hiddenStemRoleCoverage,
    yinYangCoverage,
    fiveElementCoverage,
    emptyLabelCount,
    duplicateLabelCount,
  };
}
