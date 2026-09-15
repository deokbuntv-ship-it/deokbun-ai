import {
  DEOKBUNAI_SAJU_V1_RULE_PROFILE,
  type LunarMonthOrdinal,
  type SajuPillarRuleProfile,
  type SajuYearMonthPillarCalculationInput,
} from '../contracts/sajuRules';
import {
  HEAVENLY_STEMS,
  type SexagenaryPillar,
  type SexagenaryResult,
  type SajuYearMonthPillars,
} from './contracts';
import {
  floorMod,
  pillarToSexagenaryIndex,
  sexagenaryIndexToPillar,
} from './sexagenary';

function isSupportedRuleProfile(profile: SajuPillarRuleProfile): boolean {
  return (
    profile.ruleId === DEOKBUNAI_SAJU_V1_RULE_PROFILE.ruleId &&
    profile.ruleVersion === DEOKBUNAI_SAJU_V1_RULE_PROFILE.ruleVersion &&
    profile.yearPillarRule === 'SOLAR_TERM_START_OF_SPRING' &&
    profile.monthPillarRule === 'SOLAR_TERM_TWELVE_JIE' &&
    profile.leapMonthRule === 'LEAP_MONTH_SAME_ORDINAL' &&
    profile.dayBoundaryRule === 'CIVIL_MIDNIGHT' &&
    profile.trueSolarTimeRule === 'DO_NOT_APPLY' &&
    profile.solarTermRole === 'USED_FOR_YEAR_AND_MONTH_PILLARS'
  );
}

export function calculateYearPillar(
  lunarYear: number,
): SexagenaryResult<SexagenaryPillar> {
  if (!Number.isFinite(lunarYear) || !Number.isInteger(lunarYear)) {
    return {
      ok: false,
      error: {
        code: 'INVALID_LUNAR_YEAR',
        field: 'lunarYear',
        message: 'Lunar year must be a finite integer.',
        receivedValue: lunarYear,
      },
    };
  }
  return sexagenaryIndexToPillar(floorMod(lunarYear - 4, 60));
}

export function calculateMonthPillar(
  yearPillar: SexagenaryPillar,
  lunarMonth: LunarMonthOrdinal,
): SexagenaryResult<SexagenaryPillar> {
  const validatedYearIndex = pillarToSexagenaryIndex(
    yearPillar.stem,
    yearPillar.branch,
  );
  if (!validatedYearIndex.ok) return validatedYearIndex;
  if (validatedYearIndex.value !== yearPillar.index) {
    return {
      ok: false,
      error: {
        code: 'INVALID_SEXAGENARY_PAIR',
        field: 'yearPillar',
        message: 'Year pillar index does not match its stem and branch.',
        receivedValue: yearPillar,
      },
    };
  }

  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    return {
      ok: false,
      error: {
        code: 'INVALID_LUNAR_MONTH',
        field: 'lunarMonth',
        message: 'Lunar month ordinal must be an integer from 1 through 12.',
        receivedValue: lunarMonth,
      },
    };
  }

  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
  const firstMonthStemIndex = (yearStemIndex % 5) * 2 + 2;
  const monthStemIndex = floorMod(firstMonthStemIndex + lunarMonth - 1, 10);
  const monthBranchIndex = (lunarMonth + 1) % 12;

  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === monthStemIndex && index % 12 === monthBranchIndex) {
      return sexagenaryIndexToPillar(index);
    }
  }

  throw new Error('Month pillar invariant failed.');
}

export function calculateYearMonthPillars(
  input: SajuYearMonthPillarCalculationInput,
): SexagenaryResult<SajuYearMonthPillars> {
  if (!isSupportedRuleProfile(input.ruleProfile)) {
    return {
      ok: false,
      error: {
        code: 'UNSUPPORTED_RULE_PROFILE',
        field: 'ruleProfile',
        message: 'Only the complete DeokbunAI Saju V1 rule profile is supported.',
        receivedValue: input.ruleProfile,
      },
    };
  }
  if (input.lunarMonthKind !== 'REGULAR' && input.lunarMonthKind !== 'LEAP') {
    return {
      ok: false,
      error: {
        code: 'INVALID_LUNAR_MONTH_KIND',
        field: 'lunarMonthKind',
        message: 'Lunar month kind must be REGULAR or LEAP.',
        receivedValue: input.lunarMonthKind,
      },
    };
  }

  const year = calculateYearPillar(input.lunarYear);
  if (!year.ok) return year;
  const month = calculateMonthPillar(year.value, input.lunarMonth);
  if (!month.ok) return month;

  return {
    ok: true,
    value: {
      year: year.value,
      month: month.value,
      lunarYear: input.lunarYear,
      lunarMonth: input.lunarMonth,
      lunarMonthKind: input.lunarMonthKind,
      ruleProfile: input.ruleProfile,
    },
  };
}
