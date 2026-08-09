import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  type EarthlyBranch,
  type HeavenlyStem,
  type SajuFourPillars,
} from '../contracts';
import { calculateSajuDerivedFacts } from './calculateDerivedFacts';
import type { HiddenStemDefinition, TenGod } from './contracts';
import {
  calculateTenGod,
  getBranchElement,
  getBranchYinYang,
  getHiddenStems,
  getStemElement,
  getStemYinYang,
} from './rules';

export type SajuDerivedFactsValidationReport = {
  ok: boolean;
  failures: string[];
  stemYinYangCoverage: number;
  branchYinYangCoverage: number;
  stemElementCoverage: number;
  branchElementCoverage: number;
  hiddenStemBranchMatches: number;
  hiddenStemEntryMatches: number;
  tenGodCombinations: number;
  tenGodRowsWithAllKinds: number;
  tenGodKindsWithExpectedGlobalCount: number;
  selfPeerCases: number;
  jiaGoldenMatches: number;
  structuredInvalidLookupCases: number;
  partialWithoutHourAnnotationCases: number;
  dayMasterPeerCases: number;
  branchRepresentativeTenGodViolations: number;
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

const HIDDEN_STEM_GOLDEN: Record<
  EarthlyBranch,
  readonly HiddenStemDefinition[]
> = {
  ZI: [
    { stem: 'REN', role: 'RESIDUAL' },
    { stem: 'GUI', role: 'MAIN' },
  ],
  CHOU: [
    { stem: 'GUI', role: 'RESIDUAL' },
    { stem: 'XIN', role: 'MIDDLE' },
    { stem: 'JI', role: 'MAIN' },
  ],
  YIN: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'BING', role: 'MIDDLE' },
    { stem: 'JIA', role: 'MAIN' },
  ],
  MAO: [
    { stem: 'JIA', role: 'RESIDUAL' },
    { stem: 'YI', role: 'MAIN' },
  ],
  CHEN: [
    { stem: 'YI', role: 'RESIDUAL' },
    { stem: 'GUI', role: 'MIDDLE' },
    { stem: 'WU', role: 'MAIN' },
  ],
  SI: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'GENG', role: 'MIDDLE' },
    { stem: 'BING', role: 'MAIN' },
  ],
  WU: [
    { stem: 'BING', role: 'RESIDUAL' },
    { stem: 'JI', role: 'MIDDLE' },
    { stem: 'DING', role: 'MAIN' },
  ],
  WEI: [
    { stem: 'DING', role: 'RESIDUAL' },
    { stem: 'YI', role: 'MIDDLE' },
    { stem: 'JI', role: 'MAIN' },
  ],
  SHEN: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'REN', role: 'MIDDLE' },
    { stem: 'GENG', role: 'MAIN' },
  ],
  YOU: [
    { stem: 'GENG', role: 'RESIDUAL' },
    { stem: 'XIN', role: 'MAIN' },
  ],
  XU: [
    { stem: 'XIN', role: 'RESIDUAL' },
    { stem: 'DING', role: 'MIDDLE' },
    { stem: 'WU', role: 'MAIN' },
  ],
  HAI: [
    { stem: 'WU', role: 'RESIDUAL' },
    { stem: 'JIA', role: 'MIDDLE' },
    { stem: 'REN', role: 'MAIN' },
  ],
};

const JIA_GOLDEN: Record<HeavenlyStem, TenGod> = {
  JIA: 'PEER',
  YI: 'ROB_WEALTH',
  BING: 'EATING_GOD',
  DING: 'HURTING_OFFICER',
  WU: 'INDIRECT_WEALTH',
  JI: 'DIRECT_WEALTH',
  GENG: 'SEVEN_KILLINGS',
  XIN: 'DIRECT_OFFICER',
  REN: 'INDIRECT_RESOURCE',
  GUI: 'DIRECT_RESOURCE',
};

function partialFourPillars(): SajuFourPillars {
  return {
    year: { index: 0 as SajuFourPillars['year']['index'], stem: 'JIA', branch: 'ZI' },
    month: { index: 1 as SajuFourPillars['month']['index'], stem: 'YI', branch: 'CHOU' },
    day: { index: 2 as SajuFourPillars['day']['index'], stem: 'BING', branch: 'YIN' },
    hour: { status: 'UNAVAILABLE', reason: 'BIRTH_TIME_UNKNOWN' },
  };
}

export function validateSajuDerivedFactsFoundation(): SajuDerivedFactsValidationReport {
  const failures: string[] = [];
  let stemYinYangCoverage = 0;
  let branchYinYangCoverage = 0;
  let stemElementCoverage = 0;
  let branchElementCoverage = 0;
  let hiddenStemBranchMatches = 0;
  let hiddenStemEntryMatches = 0;
  let tenGodCombinations = 0;
  let tenGodRowsWithAllKinds = 0;
  let selfPeerCases = 0;
  let jiaGoldenMatches = 0;

  for (const stem of HEAVENLY_STEMS) {
    if (getStemYinYang(stem).ok) stemYinYangCoverage += 1;
    if (getStemElement(stem).ok) stemElementCoverage += 1;
  }
  for (const branch of EARTHLY_BRANCHES) {
    if (getBranchYinYang(branch).ok) branchYinYangCoverage += 1;
    if (getBranchElement(branch).ok) branchElementCoverage += 1;
    const actual = getHiddenStems(branch);
    const expected = HIDDEN_STEM_GOLDEN[branch];
    if (actual.ok && JSON.stringify(actual.value) === JSON.stringify(expected)) {
      hiddenStemBranchMatches += 1;
      hiddenStemEntryMatches += expected.length;
    } else {
      failures.push(`Hidden Stems mismatch for ${branch}.`);
    }
  }

  const globalCounts = new Map<TenGod, number>(
    TEN_GODS.map((tenGod) => [tenGod, 0]),
  );
  for (const dayMaster of HEAVENLY_STEMS) {
    const row = new Set<TenGod>();
    for (const target of HEAVENLY_STEMS) {
      const result = calculateTenGod(dayMaster, target);
      if (!result.ok) {
        failures.push(`Ten God failed for ${dayMaster}/${target}.`);
        continue;
      }
      tenGodCombinations += 1;
      row.add(result.value);
      globalCounts.set(result.value, (globalCounts.get(result.value) ?? 0) + 1);
      if (dayMaster === target && result.value === 'PEER') selfPeerCases += 1;
      if (dayMaster === 'JIA' && result.value === JIA_GOLDEN[target]) {
        jiaGoldenMatches += 1;
      }
    }
    if (row.size === TEN_GODS.length) tenGodRowsWithAllKinds += 1;
    else failures.push(`Ten God row for ${dayMaster} did not contain all 10 kinds.`);
  }
  const tenGodKindsWithExpectedGlobalCount = TEN_GODS.filter(
    (tenGod) => globalCounts.get(tenGod) === 10,
  ).length;

  const invalidStem = 'INVALID' as HeavenlyStem;
  const invalidBranch = 'INVALID' as EarthlyBranch;
  const invalidResults = [
    getStemYinYang(invalidStem),
    getStemElement(invalidStem),
    getBranchYinYang(invalidBranch),
    getBranchElement(invalidBranch),
    getHiddenStems(invalidBranch),
    calculateTenGod(invalidStem, 'JIA'),
    calculateTenGod('JIA', invalidStem),
    getStemYinYang('toString' as HeavenlyStem),
  ];
  const structuredInvalidLookupCases = invalidResults.filter(
    (result) => !result.ok,
  ).length;

  let partialWithoutHourAnnotationCases = 0;
  let dayMasterPeerCases = 0;
  let branchRepresentativeTenGodViolations = 0;
  const derived = calculateSajuDerivedFacts({
    fourPillars: partialFourPillars(),
  });
  if (derived.ok) {
    if (!Object.prototype.hasOwnProperty.call(derived.value.pillars, 'hour')) {
      partialWithoutHourAnnotationCases += 1;
    } else {
      failures.push('PARTIAL Four Pillars generated an Hour annotation.');
    }
    if (derived.value.pillars.day.stem.tenGod === 'PEER') {
      dayMasterPeerCases += 1;
    } else {
      failures.push('Day Master raw Ten God was not PEER.');
    }
    for (const pillar of [
      derived.value.pillars.year,
      derived.value.pillars.month,
      derived.value.pillars.day,
    ]) {
      if ('tenGod' in pillar.branch) branchRepresentativeTenGodViolations += 1;
    }
  } else {
    failures.push(`PARTIAL derived calculation failed: ${derived.error.code}.`);
  }

  const expectations: Array<[boolean, string]> = [
    [stemYinYangCoverage === 10, 'Stem Yin/Yang coverage was not 10/10.'],
    [branchYinYangCoverage === 12, 'Branch Yin/Yang coverage was not 12/12.'],
    [stemElementCoverage === 10, 'Stem element coverage was not 10/10.'],
    [branchElementCoverage === 12, 'Branch element coverage was not 12/12.'],
    [hiddenStemBranchMatches === 12, 'Hidden Stem branch matches were not 12/12.'],
    [hiddenStemEntryMatches === 33, 'Hidden Stem entry matches were not 33/33.'],
    [tenGodCombinations === 100, 'Ten God combinations were not 100/100.'],
    [tenGodRowsWithAllKinds === 10, 'Not every Ten God row contained all kinds.'],
    [tenGodKindsWithExpectedGlobalCount === 10, 'Global Ten God counts were not 10 each.'],
    [selfPeerCases === 10, 'Self-target PEER cases were not 10/10.'],
    [jiaGoldenMatches === 10, 'JIA golden row did not match 10/10.'],
    [structuredInvalidLookupCases === 8, 'Invalid lookup failures were not structured.'],
    [partialWithoutHourAnnotationCases === 1, 'PARTIAL Hour omission failed.'],
    [dayMasterPeerCases === 1, 'Day Master PEER validation failed.'],
    [branchRepresentativeTenGodViolations === 0, 'Branch representative Ten God was emitted.'],
  ];
  for (const [condition, message] of expectations) {
    if (!condition) failures.push(message);
  }

  return {
    ok: failures.length === 0,
    failures,
    stemYinYangCoverage,
    branchYinYangCoverage,
    stemElementCoverage,
    branchElementCoverage,
    hiddenStemBranchMatches,
    hiddenStemEntryMatches,
    tenGodCombinations,
    tenGodRowsWithAllKinds,
    tenGodKindsWithExpectedGlobalCount,
    selfPeerCases,
    jiaGoldenMatches,
    structuredInvalidLookupCases,
    partialWithoutHourAnnotationCases,
    dayMasterPeerCases,
    branchRepresentativeTenGodViolations,
  };
}
