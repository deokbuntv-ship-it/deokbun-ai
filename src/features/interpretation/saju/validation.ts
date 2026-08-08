import { DEOKBUNAI_SAJU_V1_RULE_PROFILE } from '../contracts/sajuRules';
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './contracts';
import { SEXAGENARY_YEAR_GOLDEN_FIXTURES } from './fixtures/sexagenaryGoldenFixtures';
import { calculateYearMonthPillars, calculateYearPillar } from './pillars';
import {
  advanceSexagenaryIndex,
  isValidSexagenaryPair,
  pillarToSexagenaryIndex,
  sexagenaryIndexToPillar,
} from './sexagenary';

export type SexagenaryInvariantReport = {
  ok: boolean;
  failures: string[];
  uniqueCyclePillars: number;
  validPairs: number;
  invalidPairs: number;
  roundTrips: number;
  yearGoldenFixtures: number;
  monthMatrixCases: number;
  leapSameOrdinalCases: number;
};

export function validateSexagenaryInvariants(): SexagenaryInvariantReport {
  const failures: string[] = [];
  const keys = new Set<string>();
  let roundTrips = 0;

  for (let index = 0; index < 60; index += 1) {
    const pillar = sexagenaryIndexToPillar(index);
    if (!pillar.ok) {
      failures.push(`index ${index} did not resolve`);
      continue;
    }
    keys.add(`${pillar.value.stem}-${pillar.value.branch}`);
    const reverse = pillarToSexagenaryIndex(pillar.value.stem, pillar.value.branch);
    if (!reverse.ok || reverse.value !== index) failures.push(`round-trip failed at ${index}`);
    else roundTrips += 1;
  }

  const zero = sexagenaryIndexToPillar(0);
  const last = sexagenaryIndexToPillar(59);
  const wrap = sexagenaryIndexToPillar(60);
  const negativeWrap = sexagenaryIndexToPillar(-1);
  if (!zero.ok || zero.value.stem !== 'JIA' || zero.value.branch !== 'ZI') failures.push('0 must be JIA-ZI');
  if (!last.ok || last.value.stem !== 'GUI' || last.value.branch !== 'HAI') failures.push('59 must be GUI-HAI');
  if (!wrap.ok || wrap.value.index !== 0) failures.push('60 must wrap to 0');
  if (!negativeWrap.ok || negativeWrap.value.index !== 59) failures.push('-1 must wrap to 59');
  if (keys.size !== 60) failures.push('cycle must contain 60 unique pillars');

  if (zero.ok) {
    const largePositive = advanceSexagenaryIndex(zero.value.index, 6_000_001);
    const largeNegative = advanceSexagenaryIndex(zero.value.index, -6_000_001);
    if (!largePositive.ok || largePositive.value !== 1) failures.push('large positive advance failed');
    if (!largeNegative.ok || largeNegative.value !== 59) failures.push('large negative advance failed');
  }

  let validPairs = 0;
  let invalidPairs = 0;
  for (const stem of HEAVENLY_STEMS) {
    for (const branch of EARTHLY_BRANCHES) {
      if (isValidSexagenaryPair(stem, branch)) validPairs += 1;
      else invalidPairs += 1;
    }
  }
  if (validPairs !== 60 || invalidPairs !== 60) failures.push('pair parity must produce exactly 60 valid and 60 invalid pairs');
  const invalidPair = pillarToSexagenaryIndex('JIA', 'CHOU');
  if (invalidPair.ok || invalidPair.error.code !== 'INVALID_SEXAGENARY_PAIR') failures.push('invalid parity pair was not rejected');

  for (const fixture of SEXAGENARY_YEAR_GOLDEN_FIXTURES) {
    const pillar = calculateYearPillar(fixture.lunarYear);
    if (!pillar.ok || pillar.value.stem !== fixture.expectedStem || pillar.value.branch !== fixture.expectedBranch) {
      failures.push(`year fixture failed at ${fixture.lunarYear}`);
    }
  }

  let monthMatrixCases = 0;
  let leapSameOrdinalCases = 0;
  const fiveTigerGroups = [
    { lunarYear: 1984, firstMonthStem: 'BING' },
    { lunarYear: 1985, firstMonthStem: 'WU' },
    { lunarYear: 1986, firstMonthStem: 'GENG' },
    { lunarYear: 1987, firstMonthStem: 'REN' },
    { lunarYear: 1988, firstMonthStem: 'JIA' },
  ] as const;
  for (const { lunarYear, firstMonthStem } of fiveTigerGroups) {
    const firstMonthStemIndex = HEAVENLY_STEMS.indexOf(firstMonthStem);
    for (let lunarMonth = 1; lunarMonth <= 12; lunarMonth += 1) {
      const common = {
        lunarYear,
        lunarMonth: lunarMonth as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
        ruleProfile: DEOKBUNAI_SAJU_V1_RULE_PROFILE,
      };
      const regular = calculateYearMonthPillars({ ...common, lunarMonthKind: 'REGULAR' });
      const leap = calculateYearMonthPillars({ ...common, lunarMonthKind: 'LEAP' });
      monthMatrixCases += 1;
      if (!regular.ok || !leap.ok) {
        failures.push(`month matrix failed at ${lunarYear}-${lunarMonth}`);
      } else {
        const expectedStem = HEAVENLY_STEMS[(firstMonthStemIndex + lunarMonth - 1) % 10];
        const expectedBranch = EARTHLY_BRANCHES[(lunarMonth + 1) % 12];
        if (
          regular.value.month.stem !== expectedStem ||
          regular.value.month.branch !== expectedBranch
        ) {
          failures.push(`five-tigers expectation failed at ${lunarYear}-${lunarMonth}`);
        }
      }
      if (regular.ok && leap.ok && (
        regular.value.month.index !== leap.value.month.index ||
        regular.value.month.stem !== leap.value.month.stem ||
        regular.value.month.branch !== leap.value.month.branch
      )) {
        failures.push(`leap ordinal mismatch at ${lunarYear}-${lunarMonth}`);
      } else if (regular.ok && leap.ok) {
        leapSameOrdinalCases += 1;
      }
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    uniqueCyclePillars: keys.size,
    validPairs,
    invalidPairs,
    roundTrips,
    yearGoldenFixtures: SEXAGENARY_YEAR_GOLDEN_FIXTURES.length,
    monthMatrixCases,
    leapSameOrdinalCases,
  };
}
