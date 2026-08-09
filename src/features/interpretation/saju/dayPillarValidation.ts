import {
  addGregorianDays,
  compareGregorianDates,
} from '../calendar/civilDay';
import type { LocalDate } from '../domain/time';
import { calculateDayPillar, DEOKBUNAI_SAJU_DAY_V1_RULE } from './dayPillar';
import { DAY_PILLAR_GOLDEN_FIXTURES } from './fixtures/dayPillarGoldenFixtures';
import { floorMod } from './sexagenary';

export type DayPillarValidationReport = {
  ok: boolean;
  failures: string[];
  goldenFixtures: number;
  rangeDays: number;
  continuityComparisons: number;
  continuityMismatches: number;
  leapBoundaryComparisons: number;
  yearBoundaryComparisons: number;
  sixtyDayComparisons: number;
  sixtyDayMismatches: number;
  jdnOracleComparisons: number;
  jdnOracleMismatches: number;
  structuredErrorCases: number;
};

function prolepticGregorianJdn(date: LocalDate): number {
  const a = Math.floor((14 - date.month) / 12);
  const year = date.year + 4800 - a;
  const month = date.month + 12 * a - 3;
  return (
    date.day +
    Math.floor((153 * month + 2) / 5) +
    365 * year +
    Math.floor(year / 4) -
    Math.floor(year / 100) +
    Math.floor(year / 400) -
    32045
  );
}

function validateAdjacentDates(
  dates: readonly LocalDate[],
  label: string,
  failures: string[],
): number {
  let comparisons = 0;
  for (let index = 1; index < dates.length; index += 1) {
    const previous = calculateDayPillar(dates[index - 1]);
    const current = calculateDayPillar(dates[index]);
    comparisons += 1;
    if (
      !previous.ok ||
      !current.ok ||
      current.value.index !== floorMod(previous.value.index + 1, 60)
    ) {
      failures.push(`${label} failed at comparison ${index}.`);
    }
  }
  return comparisons;
}

export function validateDayPillarInvariants(): DayPillarValidationReport {
  const failures: string[] = [];

  for (const fixture of DAY_PILLAR_GOLDEN_FIXTURES) {
    const result = calculateDayPillar(fixture.gregorianCivilDate);
    if (
      !result.ok ||
      result.value.index !== fixture.expectedIndex ||
      result.value.stem !== fixture.expectedStem ||
      result.value.branch !== fixture.expectedBranch
    ) {
      failures.push(
        `Golden fixture failed at ${fixture.gregorianCivilDate.year}-${fixture.gregorianCivilDate.month}-${fixture.gregorianCivilDate.day}.`,
      );
    }
  }

  let date = DEOKBUNAI_SAJU_DAY_V1_RULE.supportedRange.start;
  let previousIndex: number | undefined;
  let rangeDays = 0;
  let continuityComparisons = 0;
  let continuityMismatches = 0;
  let sixtyDayComparisons = 0;
  let sixtyDayMismatches = 0;
  let jdnOracleComparisons = 0;
  let jdnOracleMismatches = 0;

  while (
    compareGregorianDates(date, DEOKBUNAI_SAJU_DAY_V1_RULE.supportedRange.end) <= 0
  ) {
    const result = calculateDayPillar(date);
    if (!result.ok) {
      failures.push(`Range date did not resolve at ordinal day ${rangeDays}.`);
      break;
    }

    if (previousIndex !== undefined) {
      continuityComparisons += 1;
      if (result.value.index !== floorMod(previousIndex + 1, 60)) {
        continuityMismatches += 1;
      }
    }

    const oracleIndex = floorMod(prolepticGregorianJdn(date) + 49, 60);
    jdnOracleComparisons += 1;
    if (result.value.index !== oracleIndex) jdnOracleMismatches += 1;

    const plusSixty = addGregorianDays(date, 60);
    if (
      compareGregorianDates(
        plusSixty,
        DEOKBUNAI_SAJU_DAY_V1_RULE.supportedRange.end,
      ) <= 0
    ) {
      const cycleResult = calculateDayPillar(plusSixty);
      sixtyDayComparisons += 1;
      if (!cycleResult.ok || cycleResult.value.index !== result.value.index) {
        sixtyDayMismatches += 1;
      }
    }

    previousIndex = result.value.index;
    rangeDays += 1;
    date = addGregorianDays(date, 1);
  }

  if (rangeDays !== 55_152) failures.push(`Expected 55152 range days, received ${rangeDays}.`);
  if (continuityMismatches > 0) failures.push(`${continuityMismatches} continuity mismatches.`);
  if (sixtyDayMismatches > 0) failures.push(`${sixtyDayMismatches} sixty-day cycle mismatches.`);
  if (jdnOracleMismatches > 0) failures.push(`${jdnOracleMismatches} JDN oracle mismatches.`);

  const leapBoundaryComparisons =
    validateAdjacentDates(
      [
        { year: 2000, month: 2, day: 28 },
        { year: 2000, month: 2, day: 29 },
        { year: 2000, month: 3, day: 1 },
      ],
      '2000 leap boundary',
      failures,
    ) +
    validateAdjacentDates(
      [
        { year: 2024, month: 2, day: 28 },
        { year: 2024, month: 2, day: 29 },
        { year: 2024, month: 3, day: 1 },
      ],
      '2024 leap boundary',
      failures,
    );

  const yearBoundaryComparisons =
    validateAdjacentDates(
      [
        { year: 1999, month: 12, day: 31 },
        { year: 2000, month: 1, day: 1 },
      ],
      '2000 year boundary',
      failures,
    ) +
    validateAdjacentDates(
      [
        { year: 2049, month: 12, day: 31 },
        { year: 2050, month: 1, day: 1 },
      ],
      '2050 year boundary',
      failures,
    );

  const errorCases = [
    calculateDayPillar({ year: 2024, month: 2, day: 30 }),
    calculateDayPillar({ year: 2024, month: 13, day: 1 }),
    calculateDayPillar({ year: 1899, month: 12, day: 31 }),
    calculateDayPillar({ year: 2051, month: 1, day: 1 }),
  ];
  const expectedErrorCodes = [
    'INVALID_GREGORIAN_DATE',
    'INVALID_GREGORIAN_DATE',
    'UNSUPPORTED_DATE_RANGE',
    'UNSUPPORTED_DATE_RANGE',
  ];
  errorCases.forEach((result, index) => {
    if (result.ok || result.error.code !== expectedErrorCodes[index]) {
      failures.push(`Structured error case ${index} failed.`);
    }
  });

  return {
    ok: failures.length === 0,
    failures,
    goldenFixtures: DAY_PILLAR_GOLDEN_FIXTURES.length,
    rangeDays,
    continuityComparisons,
    continuityMismatches,
    leapBoundaryComparisons,
    yearBoundaryComparisons,
    sixtyDayComparisons,
    sixtyDayMismatches,
    jdnOracleComparisons,
    jdnOracleMismatches,
    structuredErrorCases: errorCases.length,
  };
}
