import { addGregorianDays } from '../calendar/civilDay';
import { resolveWithKasiCalendar } from '../calendar/kasiCalendarResolver';
import { DEOKBUNAI_SAJU_V1_RULE_PROFILE } from '../contracts/sajuRules';
import type {
  CivilLocalBirthTime,
  TimezoneResolution,
} from '../contracts/normalization';
import { calculateDayPillar } from './dayPillar';
import { calculateFourPillars } from './fourPillars';
import { calculateHourPillar } from './hourPillar';
import type {
  SajuFourPillarsCalculationInput,
  SajuFourPillarsResult,
  SexagenaryPillar,
} from './contracts';
import { FOUR_PILLARS_GOLDEN_FIXTURES } from './fixtures/fourPillarsGoldenFixtures';

export type FourPillarsValidationReport = {
  ok: boolean;
  failures: string[];
  goldenFixtures: number;
  completeFixtures: number;
  partialFixtures: number;
  exactCrossValidations: number;
  exactCrossValidationMismatches: number;
  leapSameOrdinalComparisons: number;
  historicalCapabilityCases: number;
  timeAccuracyReasonCases: number;
  calendarUnavailableCases: number;
  productRuleRegressions: number;
  identityProvenanceCases: number;
};

function uniqueTimezone(): TimezoneResolution {
  return {
    status: 'RESOLVED',
    ianaZone: 'Asia/Seoul',
    resolvedOffsetSeconds: 32_400,
    resolvedOffsetMinutes: 540,
    timezoneDataVersion: 'validation-fixture',
    resolutionSource: 'EXTERNAL_LOOKUP',
    dst: {
      status: 'NOT_OBSERVED',
      dstOffsetSeconds: 0,
      provenance: {
        resolverId: 'VALIDATION_FIXTURE',
        resolverVersion: '1',
        source: 'ENGINE',
      },
    },
    localTimeResolution: {
      kind: 'UNIQUE',
      candidate: {
        utcEpochSeconds: 0,
        totalOffsetSeconds: 32_400,
        dstOffsetSeconds: 0,
        isDst: false,
      },
    },
    historicalProvenance: {
      authorityStatus: 'OFFICIAL_SOURCE_VERIFIED',
      officialSources: [],
      ruleSetVersion: 'validation-fixture',
      comparison: 'MATCH',
      jurisdiction: 'KR',
      applicableRegion: 'KR',
    },
    provenance: {
      resolverId: 'VALIDATION_FIXTURE',
      resolverVersion: '1',
      source: 'ENGINE',
    },
  };
}

function unresolvedTimezone(
  reason:
    | 'TIME_UNRESOLVED'
    | 'HISTORICAL_SOURCE_CONFLICT'
    | 'HISTORICAL_DATA_UNAVAILABLE',
): TimezoneResolution {
  const conflict = reason === 'HISTORICAL_SOURCE_CONFLICT';
  const provenance = {
    resolverId: 'VALIDATION_FIXTURE',
    resolverVersion: '1',
    source: 'ENGINE' as const,
  };
  return {
    status: 'UNRESOLVED',
    reason,
    historicalProvenance: {
      authorityStatus: conflict ? 'SOURCE_CONFLICT' : 'UNRESOLVED',
      officialSources: [],
      ruleSetVersion: 'validation-fixture',
      comparison: conflict ? 'CONFLICT' : 'NOT_VERIFIED',
      jurisdiction: 'KR',
      applicableRegion: 'KR',
      unresolvedReason: conflict
        ? 'SOURCE_CONFLICT_REQUIRES_RULE'
        : 'TIME_UNRESOLVED',
    },
    provenance,
  };
}

function createInput(
  fixture: (typeof FOUR_PILLARS_GOLDEN_FIXTURES)[number],
): SajuFourPillarsCalculationInput {
  const calendar = resolveWithKasiCalendar({
    ...fixture.gregorianDate,
    calendar: 'GREGORIAN',
  });
  let civilLocal: CivilLocalBirthTime;
  if (fixture.time.accuracy === 'EXACT') {
    civilLocal = {
      accuracy: 'EXACT',
      date: fixture.gregorianDate,
      time: fixture.time.localTime,
    };
  } else if (fixture.time.accuracy === 'APPROXIMATE') {
    civilLocal = {
      accuracy: 'APPROXIMATE',
      date: fixture.gregorianDate,
      period: fixture.time.period,
      resolvedRange: null,
    };
  } else {
    civilLocal = { accuracy: 'UNKNOWN', date: fixture.gregorianDate };
  }
  return {
    normalizedBirthFingerprint: `validation.${fixture.id}`,
    normalized: {
      calendar,
      civilLocal,
      timezone: fixture.time.accuracy === 'EXACT'
        ? uniqueTimezone()
        : unresolvedTimezone('TIME_UNRESOLVED'),
      trueSolarTime: { status: 'NOT_APPLIED' },
    },
    ruleProfile: DEOKBUNAI_SAJU_V1_RULE_PROFILE,
    engineRuleSetVersion: 'deokbunai.saju-engine.validation',
  };
}

function samePillar(
  actual: SexagenaryPillar,
  expected: { stem: string; branch: string },
): boolean {
  return actual.stem === expected.stem && actual.branch === expected.branch;
}

function partialWithReason(
  result: SajuFourPillarsResult,
  status: 'AMBIGUOUS' | 'UNAVAILABLE',
  reason: string,
): boolean {
  return (
    result.status === 'PARTIAL' &&
    result.pillars.hour.status === status &&
    result.pillars.hour.reason === reason
  );
}

export function validateFourPillarsInvariants(): FourPillarsValidationReport {
  const failures: string[] = [];
  let completeFixtures = 0;
  let partialFixtures = 0;
  let exactCrossValidations = 0;
  let exactCrossValidationMismatches = 0;

  for (const fixture of FOUR_PILLARS_GOLDEN_FIXTURES) {
    const input = createInput(fixture);
    const result = calculateFourPillars(input);
    if (result.status === 'UNAVAILABLE') {
      failures.push(`${fixture.id} returned UNAVAILABLE.`);
      continue;
    }
    if (result.status !== fixture.expectedStatus) {
      failures.push(`${fixture.id} returned ${result.status}.`);
      continue;
    }
    if (result.status === 'COMPLETE') completeFixtures += 1;
    else partialFixtures += 1;
    if (
      !samePillar(result.pillars.year, fixture.expected.year) ||
      !samePillar(result.pillars.month, fixture.expected.month) ||
      !samePillar(result.pillars.day, fixture.expected.day)
    ) {
      failures.push(`${fixture.id} fixed Pillars mismatch.`);
    }
    if (fixture.expected.hour) {
      if (
        result.pillars.hour.status !== 'AVAILABLE' ||
        !samePillar(result.pillars.hour.pillar, fixture.expected.hour)
      ) {
        failures.push(`${fixture.id} Hour Pillar mismatch.`);
      }
    } else if (
      fixture.time.accuracy === 'UNKNOWN' &&
      !partialWithReason(result, 'UNAVAILABLE', 'BIRTH_TIME_UNKNOWN')
    ) {
      failures.push(`${fixture.id} UNKNOWN reason mismatch.`);
    } else if (
      fixture.time.accuracy === 'APPROXIMATE' &&
      !partialWithReason(
        result,
        'AMBIGUOUS',
        'BIRTH_TIME_APPROXIMATE_AMBIGUOUS',
      )
    ) {
      failures.push(`${fixture.id} APPROXIMATE reason mismatch.`);
    }

    if (fixture.time.accuracy === 'EXACT' && input.normalized.calendar.status === 'RESOLVED') {
      const calendar = input.normalized.calendar;
      const day = calculateDayPillar(calendar.gregorianDate);
      if (!day.ok || result.status !== 'COMPLETE') {
        exactCrossValidationMismatches += 1;
      } else {
        const hour = calculateHourPillar({
          dayStem: day.value.stem,
          localTime: fixture.time.localTime,
        });
        exactCrossValidations += 1;
        // Year/month are validated against the fixture's 立春/Jie golden expectation above; here we
        // independently re-derive only the unchanged DAY + HOUR cores (year/month attribution moved
        // to the solar-term layer and is no longer a lunar-calendar re-derivation).
        if (
          !hour.ok ||
          result.pillars.day.index !== day.value.index ||
          result.pillars.hour.status !== 'AVAILABLE' ||
          result.pillars.hour.pillar.index !== hour.value.index
        ) {
          exactCrossValidationMismatches += 1;
        }
      }
    }
  }

  const base = createInput(FOUR_PILLARS_GOLDEN_FIXTURES[0]);
  if (base.normalized.calendar.status !== 'RESOLVED') {
    failures.push('Base calendar fixture did not resolve.');
  }

  let leapSameOrdinalComparisons = 0;
  const leapInput = createInput(FOUR_PILLARS_GOLDEN_FIXTURES[3]);
  if (leapInput.normalized.calendar.status === 'RESOLVED') {
    const regularInput: SajuFourPillarsCalculationInput = {
      ...leapInput,
      normalized: {
        ...leapInput.normalized,
        calendar: {
          ...leapInput.normalized.calendar,
          lunarDate: {
            ...leapInput.normalized.calendar.lunarDate,
            lunarMonthKind: 'REGULAR',
          },
        },
      },
    };
    const leapResult = calculateFourPillars(leapInput);
    const regularResult = calculateFourPillars(regularInput);
    leapSameOrdinalComparisons = 1;
    if (
      leapResult.status === 'UNAVAILABLE' ||
      regularResult.status === 'UNAVAILABLE' ||
      leapResult.pillars.month.index !== regularResult.pillars.month.index
    ) {
      failures.push('LEAP_MONTH_SAME_ORDINAL aggregate regression failed.');
    }
  }

  let historicalCapabilityCases = 0;
  if (base.normalized.calendar.status === 'RESOLVED') {
    const historicalCases: readonly [TimezoneResolution, 'AMBIGUOUS' | 'UNAVAILABLE', string][] = [
      [unresolvedTimezone('HISTORICAL_SOURCE_CONFLICT'), 'UNAVAILABLE', 'HISTORICAL_SOURCE_CONFLICT'],
      [unresolvedTimezone('HISTORICAL_DATA_UNAVAILABLE'), 'UNAVAILABLE', 'HISTORICAL_TIME_UNRESOLVED'],
    ];
    for (const [timezone, status, reason] of historicalCases) {
      const result = calculateFourPillars({
        ...base,
        normalized: { ...base.normalized, timezone },
      });
      historicalCapabilityCases += 1;
      if (!partialWithReason(result, status, reason)) {
        failures.push(`Historical case ${reason} failed.`);
      }
    }

    const resolved = uniqueTimezone();
    if (
      resolved.status === 'RESOLVED' &&
      'resolvedOffsetSeconds' in resolved
    ) {
      const uniqueCandidate = resolved.localTimeResolution.kind === 'UNIQUE'
        ? resolved.localTimeResolution.candidate
        : {
            utcEpochSeconds: 0,
            totalOffsetSeconds: 0,
            dstOffsetSeconds: 0,
            isDst: false,
          };
      const {
        resolvedOffsetSeconds: _resolvedOffsetSeconds,
        resolvedOffsetMinutes: _resolvedOffsetMinutes,
        dst: _dst,
        ...resolvedBase
      } = resolved;
      const ambiguous: TimezoneResolution = {
        ...resolvedBase,
        localTimeResolution: {
          kind: 'AMBIGUOUS',
          candidates: [
            uniqueCandidate,
            { ...uniqueCandidate, utcEpochSeconds: uniqueCandidate.utcEpochSeconds + 1 },
          ],
        },
      };
      const nonexistent: TimezoneResolution = {
        ...resolvedBase,
        localTimeResolution: {
          kind: 'NONEXISTENT',
          gap: {
            startLocalDateTime: {
              date: { year: 2000, month: 1, day: 7 },
              time: { hour: 1, minute: 0, second: 0 },
            },
            endLocalDateTime: {
              date: { year: 2000, month: 1, day: 7 },
              time: { hour: 2, minute: 0, second: 0 },
            },
            transitionUtcEpochSeconds: 0,
            offsetBeforeSeconds: 32_400,
            offsetAfterSeconds: 36_000,
            dstOffsetBeforeSeconds: 0,
            dstOffsetAfterSeconds: 3_600,
          },
        },
      };
      const localUnresolved = unresolvedTimezone('TIME_UNRESOLVED');
      const sourceConflict = unresolvedTimezone('HISTORICAL_SOURCE_CONFLICT');
      const resolvedCases: readonly [TimezoneResolution, 'AMBIGUOUS' | 'UNAVAILABLE', string][] = [
        [ambiguous, 'AMBIGUOUS', 'LOCAL_TIME_AMBIGUOUS'],
        [nonexistent, 'UNAVAILABLE', 'LOCAL_TIME_NONEXISTENT'],
        [localUnresolved, 'UNAVAILABLE', 'HISTORICAL_TIME_UNRESOLVED'],
        [sourceConflict, 'UNAVAILABLE', 'HISTORICAL_SOURCE_CONFLICT'],
      ];
      for (const [timezone, status, reason] of resolvedCases) {
        const result = calculateFourPillars({
          ...base,
          normalized: { ...base.normalized, timezone },
        });
        historicalCapabilityCases += 1;
        if (!partialWithReason(result, status, reason)) {
          failures.push(`Historical resolved case ${reason} failed.`);
        }
      }
    }
  }

  let timeAccuracyReasonCases = 2;
  const unknownResult = calculateFourPillars(
    createInput(FOUR_PILLARS_GOLDEN_FIXTURES[4]),
  );
  const approximateResult = calculateFourPillars(
    createInput(FOUR_PILLARS_GOLDEN_FIXTURES[5]),
  );
  if (!partialWithReason(unknownResult, 'UNAVAILABLE', 'BIRTH_TIME_UNKNOWN')) {
    failures.push('UNKNOWN time capability failed.');
  }
  if (
    !partialWithReason(
      approximateResult,
      'AMBIGUOUS',
      'BIRTH_TIME_APPROXIMATE_AMBIGUOUS',
    )
  ) {
    failures.push('APPROXIMATE time capability failed.');
  }
  if (base.normalized.civilLocal.accuracy === 'EXACT') {
    const incompleteInput: SajuFourPillarsCalculationInput = {
      ...base,
      normalized: {
        ...base.normalized,
        civilLocal: {
          ...base.normalized.civilLocal,
          time: {
            hour: base.normalized.civilLocal.time.hour,
            minute: base.normalized.civilLocal.time.minute,
          },
        },
      },
    };
    const incompleteResult = calculateFourPillars(incompleteInput);
    timeAccuracyReasonCases += 1;
    if (
      !partialWithReason(
        incompleteResult,
        'UNAVAILABLE',
        'EXACT_LOCAL_TIME_INCOMPLETE',
      )
    ) {
      failures.push('Incomplete EXACT time capability failed.');
    }
  }

  const unresolvedCalendarInput: SajuFourPillarsCalculationInput = {
    ...base,
    normalized: {
      ...base.normalized,
      calendar: {
        status: 'UNRESOLVED',
        sourceDate: { year: 2051, month: 1, day: 1, calendar: 'GREGORIAN' },
        reason: 'UNSUPPORTED_CALENDAR_RANGE',
      },
      civilLocal: { accuracy: 'UNRESOLVED', reason: 'CALENDAR_UNRESOLVED' },
    },
  };
  const unavailableResult = calculateFourPillars(unresolvedCalendarInput);
  const calendarUnavailableCases = 1;
  if (
    unavailableResult.status !== 'UNAVAILABLE' ||
    unavailableResult.reason.code !== 'CALENDAR_UNRESOLVED'
  ) {
    failures.push('Calendar unresolved case failed.');
  }

  const productRuleRegressions = 9;
  let identityProvenanceCases = 0;
  if (base.normalized.calendar.status === 'RESOLVED') {
    const result = calculateFourPillars(base);
    if (
      result.status === 'UNAVAILABLE' ||
      result.provenance.productRule.yearPillarRule !== 'LUNAR_YEAR' ||
      result.provenance.productRule.monthPillarRule !== 'LUNAR_MONTH' ||
      result.provenance.productRule.leapMonthRule !== 'LEAP_MONTH_SAME_ORDINAL' ||
      result.provenance.dayRule.calendarBasis !== 'GREGORIAN_CIVIL_DATE' ||
      result.provenance.dayRule.dayBoundary !== 'CIVIL_MIDNIGHT' ||
      result.provenance.hourRule.timeBasis !== 'LOCAL_CIVIL_TIME' ||
      result.provenance.hourRule.dayBoundary !== 'CIVIL_MIDNIGHT' ||
      result.provenance.productRule.trueSolarTimeRule !== 'DO_NOT_APPLY' ||
      result.provenance.productRule.solarTermRole !== 'NOT_USED_FOR_YEAR_OR_MONTH_PILLARS' ||
      result.provenance.yearMonthAttributionRule.yearBoundary !== 'START_OF_SPRING_IPCHUN' ||
      result.provenance.yearMonthAttributionRule.monthBoundary !== 'TWELVE_JIE_JIEQI'
    ) {
      failures.push('Product Rule provenance regression failed.');
    }
    if (result.status !== 'UNAVAILABLE') {
      identityProvenanceCases = 1;
      if (
        result.identity.normalizedBirthFingerprint !== base.normalizedBirthFingerprint ||
        result.identity.dayRuleVersion !== result.provenance.dayRule.ruleVersion ||
        result.identity.hourRuleVersion !== result.provenance.hourRule.ruleVersion ||
        result.provenance.calendarDatasetVersion !==
          base.normalized.calendar.calendarDatasetVersion ||
        result.provenance.calendarConversionRuleVersion !==
          base.normalized.calendar.calendarConversionRuleVersion
      ) {
        failures.push('Aggregate identity/provenance linkage failed.');
      }
    }
  }

  if (exactCrossValidationMismatches > 0) {
    failures.push(`${exactCrossValidationMismatches} exact cross-validation mismatches.`);
  }

  return {
    ok: failures.length === 0,
    failures,
    goldenFixtures: FOUR_PILLARS_GOLDEN_FIXTURES.length,
    completeFixtures,
    partialFixtures,
    exactCrossValidations,
    exactCrossValidationMismatches,
    leapSameOrdinalComparisons,
    historicalCapabilityCases,
    timeAccuracyReasonCases,
    calendarUnavailableCases,
    productRuleRegressions,
    identityProvenanceCases,
  };
}
