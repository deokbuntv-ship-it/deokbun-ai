import { gregorianToCivilDayOrdinal } from '../calendar/civilDay';
import type { LocalDate } from '../domain/time';
import { LUNAR_JS_SOLAR_TERM_GOLDEN_FIXTURES } from './fixtures/lunarJsSolarTermGoldenFixtures';
import {
  createLunarJsSolarTermAdapter,
  LUNAR_JS_SOLAR_TERM_PROVIDER_PIN,
  type LunarJsPublicApi,
  type SolarTermBoundaryDirection,
  type SolarTermCivilSecond,
} from './lunarJsSolarTermAdapter';
import type { SolarTermId } from './contracts';

const SECONDS_PER_DAY = 86_400;
const THREE_DAYS_IN_SECONDS = 259_200;
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

export type LunarJsSolarTermGoldenResult = {
  fixtureId: string;
  direction: SolarTermBoundaryDirection;
  termId?: SolarTermId;
  sourceCivil?: SolarTermCivilSecond;
  normalizedUtcEpochSeconds?: number;
  birthUtcEpochSeconds: number;
  intervalSeconds?: number;
  rawStartAge?: number;
  nearestStartAge?: number;
  referenceStartAge: number;
  match: boolean;
};

export type LunarJsSolarTermAdapterValidationReport = {
  ok: boolean;
  failures: string[];
  goldenResults: readonly LunarJsSolarTermGoldenResult[];
  goldenMatches: number;
  jieCoverage: number;
  qiRejectionCases: number;
  utcPlusEightConversionCases: number;
  goldenSixDoubleConversionGuards: number;
  deterministicRepeatabilityCases: number;
  providerVersion: '1.7.7';
  sourceTimeBasis: 'FIXED_UTC_PLUS_08';
};

function civilToEpochSeconds(
  date: LocalDate,
  hour: number,
  minute: number,
  second: number,
  offsetSeconds: number,
): number {
  return (
    (gregorianToCivilDayOrdinal(date) - UNIX_EPOCH_DAY) * SECONDS_PER_DAY +
    hour * 3_600 +
    minute * 60 +
    second -
    offsetSeconds
  );
}

function sameCivilSecond(
  left: SolarTermCivilSecond,
  right: SolarTermCivilSecond,
): boolean {
  return (
    left.date.year === right.date.year &&
    left.date.month === right.date.month &&
    left.date.day === right.date.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.second === right.second
  );
}

function createQiContractDouble(): LunarJsPublicApi {
  const boundarySolar = {
    getYear: () => 2024,
    getMonth: () => 1,
    getDay: () => 20,
    getHour: () => 22,
    getMinute: () => 7,
    getSecond: () => 8,
  };
  const qi = {
    getName: () => '大寒',
    getSolar: () => boundarySolar,
    isJie: () => false,
    isQi: () => true,
  };
  return {
    Solar: {
      fromYmdHms: () => ({
        ...boundarySolar,
        getLunar: () => ({
          getPrevJie: () => qi,
          getNextJie: () => qi,
        }),
      }),
    },
  };
}

const JIE_COVERAGE_FIXTURES = [
  ['MINOR_COLD', 1],
  ['START_OF_SPRING', 2],
  ['AWAKENING_OF_INSECTS', 3],
  ['PURE_BRIGHTNESS', 4],
  ['START_OF_SUMMER', 5],
  ['GRAIN_IN_EAR', 6],
  ['MINOR_HEAT', 7],
  ['START_OF_AUTUMN', 8],
  ['WHITE_DEW', 9],
  ['COLD_DEW', 10],
  ['START_OF_WINTER', 11],
  ['MAJOR_SNOW', 12],
] as const satisfies readonly (readonly [SolarTermId, number])[];

export function validateLunarJsSolarTermAdapter(
  publicApi: LunarJsPublicApi,
): LunarJsSolarTermAdapterValidationReport {
  const failures: string[] = [];
  const goldenResults: LunarJsSolarTermGoldenResult[] = [];
  const adapter = createLunarJsSolarTermAdapter(publicApi);
  let goldenMatches = 0;
  let utcPlusEightConversionCases = 0;
  let deterministicRepeatabilityCases = 0;

  for (const fixture of LUNAR_JS_SOLAR_TERM_GOLDEN_FIXTURES) {
    const birthUtcEpochSeconds = civilToEpochSeconds(
      fixture.birthCivil.date,
      fixture.birthCivil.time.hour,
      fixture.birthCivil.time.minute,
      fixture.birthCivil.time.second,
      fixture.birthCivil.offsetSeconds,
    );
    const input = {
      birthInstant: {
        kind: 'UTC_INSTANT' as const,
        epochSeconds: birthUtcEpochSeconds,
      },
      direction: fixture.direction,
    };
    const first = adapter.resolve(input);
    const second = adapter.resolve(input);
    if (JSON.stringify(first) === JSON.stringify(second)) {
      deterministicRepeatabilityCases += 1;
    } else {
      failures.push(`${fixture.id} was not deterministic.`);
    }

    if (!first.ok) {
      failures.push(`${fixture.id} failed: ${first.error.code}.`);
      goldenResults.push({
        fixtureId: fixture.id,
        direction: fixture.direction,
        birthUtcEpochSeconds,
        referenceStartAge: fixture.expected.nearestStartAge,
        match: false,
      });
      continue;
    }

    const termEpochSeconds = first.value.normalizedUtcInstant.epochSeconds;
    const intervalSeconds =
      fixture.direction === 'FORWARD'
        ? termEpochSeconds - birthUtcEpochSeconds
        : birthUtcEpochSeconds - termEpochSeconds;
    const rawStartAge = intervalSeconds / THREE_DAYS_IN_SECONDS;
    const nearestStartAge = Math.round(rawStartAge);
    const expectedEpochSeconds = civilToEpochSeconds(
      fixture.expected.sourceCivil.date,
      fixture.expected.sourceCivil.hour,
      fixture.expected.sourceCivil.minute,
      fixture.expected.sourceCivil.second,
      28_800,
    );
    if (termEpochSeconds === expectedEpochSeconds) {
      utcPlusEightConversionCases += 1;
    }

    const match =
      first.value.termId === fixture.expected.termId &&
      first.value.kind === 'JIE' &&
      first.value.sourceTimeBasis === 'FIXED_UTC_PLUS_08' &&
      sameCivilSecond(first.value.sourceCivil, fixture.expected.sourceCivil) &&
      termEpochSeconds === expectedEpochSeconds &&
      nearestStartAge === fixture.expected.nearestStartAge;
    if (match) goldenMatches += 1;
    else failures.push(`${fixture.id} did not match its adapter Golden.`);

    goldenResults.push({
      fixtureId: fixture.id,
      direction: fixture.direction,
      termId: first.value.termId,
      sourceCivil: first.value.sourceCivil,
      normalizedUtcEpochSeconds: termEpochSeconds,
      birthUtcEpochSeconds,
      intervalSeconds,
      rawStartAge,
      nearestStartAge,
      referenceStartAge: fixture.expected.nearestStartAge,
      match,
    });
  }

  let jieCoverage = 0;
  for (const [termId, month] of JIE_COVERAGE_FIXTURES) {
    const birthUtcEpochSeconds = civilToEpochSeconds(
      { year: 2024, month, day: 1 },
      0,
      0,
      0,
      32_400,
    );
    const result = adapter.resolve({
      birthInstant: { kind: 'UTC_INSTANT', epochSeconds: birthUtcEpochSeconds },
      direction: 'FORWARD',
    });
    if (result.ok && result.value.kind === 'JIE' && result.value.termId === termId) {
      jieCoverage += 1;
    } else {
      failures.push(`Jie coverage failed for ${termId}.`);
    }
  }

  const qiResult = createLunarJsSolarTermAdapter(
    createQiContractDouble(),
  ).resolve({
    birthInstant: {
      kind: 'UTC_INSTANT',
      epochSeconds: civilToEpochSeconds(
        { year: 2024, month: 1, day: 1 },
        0,
        0,
        0,
        0,
      ),
    },
    direction: 'FORWARD',
  });
  const qiRejectionCases =
    !qiResult.ok && qiResult.error.code === 'NON_JIE_BOUNDARY' ? 1 : 0;
  if (qiRejectionCases !== 1) failures.push('Qi boundary was not rejected.');

  const goldenSix = goldenResults.find((result) => result.fixtureId === 'GOLDEN_6');
  const goldenSixDoubleConversionGuards =
    goldenSix?.normalizedUtcEpochSeconds !== undefined &&
    goldenSix.rawStartAge !== undefined &&
    Math.abs(goldenSix.rawStartAge - 4.486832561728395) < 1e-12 &&
    goldenSix.nearestStartAge === 4 &&
    goldenSix.normalizedUtcEpochSeconds !==
      civilToEpochSeconds(
        { year: 1994, month: 1, day: 5 },
        21,
        48,
        7,
        28_800,
      ) +
        32_400
      ? 1
      : 0;
  if (goldenSixDoubleConversionGuards !== 1) {
    failures.push('Golden #6 double-conversion guard failed.');
  }

  const expectations: readonly [boolean, string][] = [
    [goldenMatches === 9, 'Golden adapter coverage was incomplete.'],
    [jieCoverage === 12, '12 Jie coverage was incomplete.'],
    [utcPlusEightConversionCases === 9, 'UTC+8 conversion coverage was incomplete.'],
    [deterministicRepeatabilityCases === 9, 'Deterministic repeatability was incomplete.'],
    [
      LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.providerVersion === '1.7.7',
      'Provider version pin changed unexpectedly.',
    ],
  ];
  for (const [condition, message] of expectations) {
    if (!condition) failures.push(message);
  }

  return {
    ok: failures.length === 0,
    failures,
    goldenResults,
    goldenMatches,
    jieCoverage,
    qiRejectionCases,
    utcPlusEightConversionCases,
    goldenSixDoubleConversionGuards,
    deterministicRepeatabilityCases,
    providerVersion: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.providerVersion,
    sourceTimeBasis: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.sourceTimeBasis,
  };
}
