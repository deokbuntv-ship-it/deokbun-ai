import { gregorianToCivilDayOrdinal } from '../../calendar/civilDay';
import type { NormalizedBirthInput } from '../../contracts/normalization';
import type { LocalDate } from '../../domain/time';
import type { LunarJsPublicApi } from '../../solarTerm/lunarJsSolarTermAdapter';
import { createLunarJsSolarTermAdapter } from '../../solarTerm/lunarJsSolarTermAdapter';
import type { SexagenaryPillar } from '../contracts';
import { sexagenaryIndexToPillar } from '../sexagenary';
import { calculateSajuDaewoon } from './calculateDaewoon';
import { DAEWOON_GOLDEN_FIXTURES } from './fixtures/daewoonGoldenFixtures';

const SECONDS_PER_DAY = 86_400;
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

export type SajuDaewoonValidationReport = {
  ok: boolean;
  failures: readonly string[];
  goldenMatches: number;
  directionRuleCases: number;
  progressionCases: number;
  boundaryPolicyCases: number;
  capabilityCases: number;
  deterministicRepeatabilityCases: number;
};

function civilToEpochSeconds(
  date: LocalDate,
  hour: number,
  minute: number,
  second: number,
  offsetSeconds = 32_400,
): number {
  return (
    (gregorianToCivilDayOrdinal(date) - UNIX_EPOCH_DAY) * SECONDS_PER_DAY +
    hour * 3_600 +
    minute * 60 +
    second -
    offsetSeconds
  );
}

function pillar(index: number): SexagenaryPillar {
  const result = sexagenaryIndexToPillar(index);
  if (!result.ok) throw new Error(`Invalid validation pillar index: ${index}`);
  return result.value;
}

function normalizedBirth(input: {
  date: LocalDate;
  time: { hour: number; minute: number; second: number };
  lunarDate?: LocalDate & { lunarMonthKind: 'REGULAR' };
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  zoneId?: string;
}): NormalizedBirthInput {
  const sourceDate = { ...input.date, calendar: 'GREGORIAN' as const };
  const utcEpochSeconds = civilToEpochSeconds(
    input.date,
    input.time.hour,
    input.time.minute,
    input.time.second,
  );
  const provenance = {
    resolverId: 'DAEWOON_VALIDATION',
    resolverVersion: 'v1',
    source: 'ENGINE' as const,
  };
  const historicalProvenance = {
    authorityStatus: 'OFFICIAL_SOURCE_VERIFIED' as const,
    tzdbVersion: '2026c',
    tzdbZone: input.zoneId ?? 'Asia/Seoul',
    officialSources: [],
    ruleSetVersion: 'validation.timezone.v1',
    comparison: 'MATCH' as const,
    jurisdiction: 'KR',
    applicableRegion: 'KR',
  };
  return {
    source: {
      date: sourceDate,
      time: { accuracy: 'EXACT', localTime: input.time },
      place: { countryCode: 'KR' },
      temporalContext: {
        timezone: {
          status: 'EXPLICIT',
          ianaZone: input.zoneId ?? 'Asia/Seoul',
          source: 'USER',
        },
        dst: { status: 'NOT_OBSERVED', source: 'APP' },
        trueSolarTime: { mode: 'DO_NOT_APPLY' },
      },
      gender: input.gender,
    },
    calendar: {
      status: 'RESOLVED',
      sourceDate,
      gregorianDate: input.date,
      lunarDate: input.lunarDate ?? {
        ...input.date,
        lunarMonthKind: 'REGULAR',
      },
      calendarDatasetVersion: 'validation.calendar.v1',
      calendarConversionRuleVersion: 'validation.calendar-rule.v1',
      provenance,
    },
    civilLocal: {
      accuracy: 'EXACT',
      date: input.date,
      time: input.time,
    },
    timezone: {
      status: 'RESOLVED',
      ianaZone: input.zoneId ?? 'Asia/Seoul',
      timezoneDataVersion: 'iana.tzdb.2026c.asia-seoul.1970-2050.v1',
      resolutionSource: 'ENGINE',
      historicalProvenance,
      provenance,
      resolvedOffsetSeconds: 32_400,
      resolvedOffsetMinutes: 540,
      dst: {
        status: 'NOT_OBSERVED',
        dstOffsetSeconds: 0,
        provenance,
      },
      localTimeResolution: {
        kind: 'UNIQUE',
        candidate: {
          utcEpochSeconds,
          totalOffsetSeconds: 32_400,
          dstOffsetSeconds: 0,
          isDst: false,
          designation: 'KST',
        },
      },
    },
    trueSolarTime: { status: 'NOT_APPLIED', civilDateTime: { date: input.date, time: input.time } },
    provenance: [provenance],
    warnings: [],
  };
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateSajuDaewoon(
  publicApi: LunarJsPublicApi,
): SajuDaewoonValidationReport {
  const failures: string[] = [];
  const adapter = createLunarJsSolarTermAdapter(publicApi);
  let goldenMatches = 0;
  let deterministicRepeatabilityCases = 0;

  for (const fixture of DAEWOON_GOLDEN_FIXTURES) {
    const input = {
      normalizedBirth: normalizedBirth(fixture.birth),
      yearPillar: pillar(fixture.yearPillarIndex),
      monthPillar: pillar(fixture.monthPillarIndex),
    };
    const first = calculateSajuDaewoon(input, adapter);
    const second = calculateSajuDaewoon(input, adapter);
    if (sameJson(first, second)) deterministicRepeatabilityCases += 1;
    else failures.push(`${fixture.id} was not deterministic.`);
    if (
      first.capability === 'AVAILABLE' &&
      first.direction === fixture.expected.direction &&
      first.selectedBoundary.termId === fixture.expected.selectedTermId &&
      sameJson(first.start.symbolicOffset, fixture.expected.symbolicOffset) &&
      first.start.roundedStartAgeYears === fixture.expected.roundedStartAgeYears &&
      sameJson(first.start.timing.symbolicLocalDateTime.date, fixture.expected.symbolicStart.date) &&
      sameJson(first.start.timing.symbolicLocalDateTime.time, fixture.expected.symbolicStart.time) &&
      first.cycles[0]?.pillar.index === fixture.expected.firstCyclePillarIndex
    ) {
      goldenMatches += 1;
    } else {
      failures.push(`${fixture.id} did not match its mature-reference Golden.`);
    }
  }

  const directionCases = [
    { yearIndex: 0, gender: 'MALE' as const, expected: 'FORWARD' },
    { yearIndex: 0, gender: 'FEMALE' as const, expected: 'REVERSE' },
    { yearIndex: 1, gender: 'MALE' as const, expected: 'REVERSE' },
    { yearIndex: 1, gender: 'FEMALE' as const, expected: 'FORWARD' },
  ] as const;
  let directionRuleCases = 0;
  for (const item of directionCases) {
    const result = calculateSajuDaewoon(
      {
        normalizedBirth: normalizedBirth({
          date: { year: 2024, month: 4, day: 15 },
          time: { hour: 9, minute: 44, second: 0 },
          gender: item.gender,
        }),
        yearPillar: pillar(item.yearIndex),
        monthPillar: pillar(4),
      },
      adapter,
    );
    if (result.capability === 'AVAILABLE' && result.direction === item.expected) {
      directionRuleCases += 1;
    } else failures.push(`Direction rule failed for year index ${item.yearIndex} ${item.gender}.`);
  }

  let progressionCases = 0;
  const forwardWrap = calculateSajuDaewoon(
    {
      normalizedBirth: normalizedBirth({
        date: { year: 2024, month: 4, day: 15 },
        time: { hour: 9, minute: 44, second: 0 },
        gender: 'MALE',
      }),
      yearPillar: pillar(0),
      monthPillar: pillar(59),
    },
    adapter,
  );
  if (forwardWrap.capability === 'AVAILABLE' && forwardWrap.cycles[0]?.pillar.index === 0) {
    progressionCases += 1;
  } else failures.push('Forward sexagenary wrap failed.');
  const reverseWrap = calculateSajuDaewoon(
    {
      normalizedBirth: normalizedBirth({
        date: { year: 2024, month: 4, day: 15 },
        time: { hour: 9, minute: 44, second: 0 },
        gender: 'FEMALE',
      }),
      yearPillar: pillar(0),
      monthPillar: pillar(0),
    },
    adapter,
  );
  if (reverseWrap.capability === 'AVAILABLE' && reverseWrap.cycles[0]?.pillar.index === 59) {
    progressionCases += 1;
  } else failures.push('Reverse sexagenary wrap failed.');

  const boundaryTimes = [
    { time: { hour: 9, minute: 9, second: 59 }, expected: 'AVAILABLE' },
    { time: { hour: 9, minute: 10, second: 4 }, expected: 'AMBIGUOUS' },
    { time: { hour: 9, minute: 10, second: 5 }, expected: 'AMBIGUOUS' },
    { time: { hour: 9, minute: 10, second: 6 }, expected: 'AMBIGUOUS' },
    { time: { hour: 9, minute: 11, second: 0 }, expected: 'AVAILABLE' },
  ] as const;
  let boundaryPolicyCases = 0;
  for (const item of boundaryTimes) {
    const result = calculateSajuDaewoon(
      {
        normalizedBirth: normalizedBirth({
          date: { year: 2024, month: 5, day: 5 },
          time: item.time,
          gender: 'MALE',
        }),
        yearPillar: pillar(40),
        monthPillar: pillar(4),
      },
      adapter,
    );
    if (
      result.capability === item.expected &&
      (item.expected !== 'AMBIGUOUS' ||
        (result.capability === 'AMBIGUOUS' && result.reason === 'SOLAR_TERM_BOUNDARY_MINUTE'))
    ) {
      boundaryPolicyCases += 1;
    } else failures.push(`Boundary policy failed at ${JSON.stringify(item.time)}.`);
  }

  const base = normalizedBirth({
    date: { year: 2024, month: 4, day: 15 },
    time: { hour: 9, minute: 44, second: 0 },
    gender: 'MALE',
  });
  if (base.calendar.status !== 'RESOLVED') {
    throw new Error('Daewoon validation fixture calendar did not resolve.');
  }
  const resolvedBaseCalendar = base.calendar;
  const capabilityInputs: readonly [NormalizedBirthInput, string, string][] = [
    [
      { ...base, civilLocal: { accuracy: 'UNKNOWN', date: { year: 2024, month: 4, day: 15 } } },
      'UNAVAILABLE',
      'BIRTH_TIME_UNKNOWN',
    ],
    [
      {
        ...base,
        civilLocal: {
          accuracy: 'APPROXIMATE',
          date: { year: 2024, month: 4, day: 15 },
          period: 'MORNING',
          resolvedRange: null,
        },
      },
      'AMBIGUOUS',
      'BIRTH_TIME_APPROXIMATE',
    ],
    [normalizedBirth({ date: { year: 1969, month: 12, day: 31 }, time: { hour: 12, minute: 0, second: 0 }, gender: 'MALE' }), 'UNAVAILABLE', 'UNSUPPORTED_DATE_RANGE'],
    [normalizedBirth({ date: { year: 2024, month: 4, day: 15 }, time: { hour: 9, minute: 44, second: 0 }, gender: 'UNSPECIFIED' }), 'UNAVAILABLE', 'GENDER_UNSPECIFIED'],
    [normalizedBirth({ date: { year: 2024, month: 4, day: 15 }, time: { hour: 9, minute: 44, second: 0 }, gender: 'MALE', zoneId: 'Asia/Tokyo' }), 'UNAVAILABLE', 'UNSUPPORTED_TIMEZONE'],
    [
      {
        ...base,
        civilLocal: {
          accuracy: 'EXACT',
          date: { year: 2024, month: 4, day: 15 },
          time: { hour: 24, minute: 0, second: 0 },
        },
      },
      'UNAVAILABLE',
      'EXACT_LOCAL_TIME_INCOMPLETE',
    ],
    [
      {
        ...base,
        calendar: {
          ...resolvedBaseCalendar,
          gregorianDate: { year: 2024, month: 4, day: 16 },
        },
      },
      'UNAVAILABLE',
      'CALCULATION_INVARIANT_FAILED',
    ],
  ];
  let capabilityCases = 0;
  for (const [birth, expectedCapability, expectedReason] of capabilityInputs) {
    const result = calculateSajuDaewoon(
      { normalizedBirth: birth, yearPillar: pillar(40), monthPillar: pillar(4) },
      adapter,
    );
    if (
      result.capability === expectedCapability &&
      'reason' in result &&
      result.reason === expectedReason
    ) capabilityCases += 1;
    else failures.push(`Capability policy failed for ${expectedReason}.`);
  }

  const expectations: readonly [boolean, string][] = [
    [goldenMatches === DAEWOON_GOLDEN_FIXTURES.length, 'Daewoon Golden coverage incomplete.'],
    [directionRuleCases === directionCases.length, 'Direction rule coverage incomplete.'],
    [progressionCases === 2, 'Progression coverage incomplete.'],
    [boundaryPolicyCases === boundaryTimes.length, 'Boundary coverage incomplete.'],
    [capabilityCases === capabilityInputs.length, 'Capability coverage incomplete.'],
    [deterministicRepeatabilityCases === DAEWOON_GOLDEN_FIXTURES.length, 'Repeatability coverage incomplete.'],
  ];
  for (const [condition, message] of expectations) if (!condition) failures.push(message);

  return {
    ok: failures.length === 0,
    failures,
    goldenMatches,
    directionRuleCases,
    progressionCases,
    boundaryPolicyCases,
    capabilityCases,
    deterministicRepeatabilityCases,
  };
}
