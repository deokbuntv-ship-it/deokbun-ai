import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  type EarthlyBranch,
  type ExactLocalCivilTime,
  type HeavenlyStem,
} from './contracts';
import {
  HOUR_BRANCH_BOUNDARY_FIXTURES,
  HOUR_PILLAR_GOLDEN_FIXTURES,
} from './fixtures/hourPillarGoldenFixtures';
import { calculateHourPillar, resolveHourBranch } from './hourPillar';
import { floorMod, isValidSexagenaryPair } from './sexagenary';

export type HourPillarValidationReport = {
  ok: boolean;
  failures: string[];
  goldenFixtures: number;
  boundaryFixtures: number;
  minuteCoverage: number;
  branchMinuteCounts: Record<EarthlyBranch, number>;
  dayStemHourBranchCombinations: number;
  validPillarCombinations: number;
  fiveDayStemGroups: number;
  structuredErrorCases: number;
};

const BRANCH_REPRESENTATIVE_HOURS = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21] as const;

function expectedHourStem(
  dayStem: HeavenlyStem,
  branch: EarthlyBranch,
): HeavenlyStem {
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  return HEAVENLY_STEMS[floorMod((dayStemIndex % 5) * 2 + branchIndex, 10)];
}

export function validateHourPillarInvariants(): HourPillarValidationReport {
  const failures: string[] = [];

  for (const fixture of HOUR_PILLAR_GOLDEN_FIXTURES) {
    const result = calculateHourPillar({
      dayStem: fixture.dayStem,
      localTime: fixture.localTime,
    });
    if (
      !result.ok ||
      result.value.stem !== fixture.expectedStem ||
      result.value.branch !== fixture.expectedBranch
    ) {
      failures.push(`Golden fixture failed for ${fixture.dayStem} at ${fixture.localTime.hour}.`);
    }
  }

  for (const fixture of HOUR_BRANCH_BOUNDARY_FIXTURES) {
    const result = resolveHourBranch(fixture.localTime);
    if (!result.ok || result.value !== fixture.expectedBranch) {
      failures.push(
        `Boundary fixture failed at ${fixture.localTime.hour}:${fixture.localTime.minute}:${fixture.localTime.second}.`,
      );
    }
  }

  const branchMinuteCounts = Object.fromEntries(
    EARTHLY_BRANCHES.map((branch) => [branch, 0]),
  ) as Record<EarthlyBranch, number>;
  let minuteCoverage = 0;
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 1) {
      const result = resolveHourBranch({ hour, minute, second: 0 });
      if (!result.ok) failures.push(`Minute coverage failed at ${hour}:${minute}.`);
      else {
        branchMinuteCounts[result.value] += 1;
        minuteCoverage += 1;
      }
    }
  }
  for (const branch of EARTHLY_BRANCHES) {
    if (branchMinuteCounts[branch] !== 120) {
      failures.push(`${branch} covers ${branchMinuteCounts[branch]} minutes instead of 120.`);
    }
  }

  let dayStemHourBranchCombinations = 0;
  let validPillarCombinations = 0;
  for (const dayStem of HEAVENLY_STEMS) {
    for (let branchIndex = 0; branchIndex < EARTHLY_BRANCHES.length; branchIndex += 1) {
      const branch = EARTHLY_BRANCHES[branchIndex];
      const localTime: ExactLocalCivilTime = {
        hour: BRANCH_REPRESENTATIVE_HOURS[branchIndex],
        minute: 30,
        second: 0,
      };
      const result = calculateHourPillar({ dayStem, localTime });
      dayStemHourBranchCombinations += 1;
      if (
        !result.ok ||
        result.value.branch !== branch ||
        result.value.stem !== expectedHourStem(dayStem, branch) ||
        !isValidSexagenaryPair(result.value.stem, result.value.branch)
      ) {
        failures.push(`${dayStem}-${branch} combination failed.`);
      } else validPillarCombinations += 1;
    }
  }

  const fiveGroups: readonly (readonly [HeavenlyStem, HeavenlyStem, HeavenlyStem])[] = [
    ['JIA', 'JI', 'JIA'],
    ['YI', 'GENG', 'BING'],
    ['BING', 'XIN', 'WU'],
    ['DING', 'REN', 'GENG'],
    ['WU', 'GUI', 'REN'],
  ];
  for (const [firstDayStem, secondDayStem, expectedZiStem] of fiveGroups) {
    for (const dayStem of [firstDayStem, secondDayStem]) {
      const result = calculateHourPillar({
        dayStem,
        localTime: { hour: 23, minute: 0, second: 0 },
      });
      if (!result.ok || result.value.stem !== expectedZiStem || result.value.branch !== 'ZI') {
        failures.push(`${dayStem} ZI-hour group failed.`);
      }
    }
  }

  const invalidTimes = [
    { hour: -1, minute: 0, second: 0 },
    { hour: 24, minute: 0, second: 0 },
    { hour: 1, minute: 60, second: 0 },
    { hour: 1, minute: 0, second: 60 },
    { hour: 1.5, minute: 0, second: 0 },
  ];
  const invalidTimeResults = [
    ...invalidTimes.map((localTime) => resolveHourBranch(localTime)),
    resolveHourBranch({ hour: 12, minute: 0 } as ExactLocalCivilTime),
    resolveHourBranch(null as unknown as ExactLocalCivilTime),
  ];
  invalidTimeResults.forEach((result, index) => {
    if (result.ok || result.error.code !== 'INVALID_LOCAL_TIME') {
      failures.push(`Structured error case ${index} failed.`);
    }
  });
  const invalidStemResult = calculateHourPillar({
    dayStem: 'INVALID' as HeavenlyStem,
    localTime: { hour: 12, minute: 0, second: 0 },
  });
  if (invalidStemResult.ok || invalidStemResult.error.code !== 'INVALID_STEM') {
    failures.push('Invalid Day Stem error case failed.');
  }

  return {
    ok: failures.length === 0,
    failures,
    goldenFixtures: HOUR_PILLAR_GOLDEN_FIXTURES.length,
    boundaryFixtures: HOUR_BRANCH_BOUNDARY_FIXTURES.length,
    minuteCoverage,
    branchMinuteCounts,
    dayStemHourBranchCombinations,
    validPillarCombinations,
    fiveDayStemGroups: fiveGroups.length,
    structuredErrorCases: invalidTimeResults.length + 1,
  };
}
