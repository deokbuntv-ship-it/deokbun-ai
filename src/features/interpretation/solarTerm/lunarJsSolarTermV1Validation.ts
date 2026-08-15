import { gregorianToCivilDayOrdinal } from '../calendar/civilDay';
import type { LocalDate } from '../domain/time';
import { INDEPENDENT_SOLAR_TERM_FIXTURES } from './fixtures/independentSolarTermFixtures';
import {
  createLunarJsSolarTermAdapter,
  DEOKBUNAI_SOLAR_TERM_V1_POLICY,
  type LunarJsPublicApi,
} from './lunarJsSolarTermAdapter';
import type { SolarTermId } from './contracts';

const SECONDS_PER_DAY = 86_400;
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

export type IndependentSolarTermValidationResult = {
  fixtureId: string;
  authority: 'NAOJ' | 'KASI';
  termId?: SolarTermId;
  deltaMinutes?: number;
  match: boolean;
};

export type LunarJsSolarTermV1ValidationReport = {
  ok: boolean;
  failures: readonly string[];
  independentMatches: number;
  independentResults: readonly IndependentSolarTermValidationResult[];
  supportedRangeCases: number;
  deterministicRangeRepeatabilityCases: number;
  supportedBirthRange: typeof DEOKBUNAI_SOLAR_TERM_V1_POLICY.supportedBirthRange;
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

export function validateLunarJsSolarTermV1(
  publicApi: LunarJsPublicApi,
): LunarJsSolarTermV1ValidationReport {
  const failures: string[] = [];
  const adapter = createLunarJsSolarTermAdapter(publicApi);
  const independentResults: IndependentSolarTermValidationResult[] = [];

  for (const fixture of INDEPENDENT_SOLAR_TERM_FIXTURES) {
    const birthEpochSeconds = civilToEpochSeconds(
      fixture.birthKst.date,
      fixture.birthKst.hour,
      fixture.birthKst.minute,
      fixture.birthKst.second,
      32_400,
    );
    const result = adapter.resolve({
      birthInstant: { kind: 'UTC_INSTANT', epochSeconds: birthEpochSeconds },
      direction: fixture.direction,
    });
    if (!result.ok) {
      failures.push(`${fixture.id} failed: ${result.error.code}.`);
      independentResults.push({
        fixtureId: fixture.id,
        authority: fixture.authority.name,
        match: false,
      });
      continue;
    }
    const referenceEpochMinute = Math.floor(
      civilToEpochSeconds(
        fixture.expected.referenceKst.date,
        fixture.expected.referenceKst.hour,
        fixture.expected.referenceKst.minute,
        0,
        32_400,
      ) / 60,
    );
    const actualEpochMinute = Math.floor(
      result.value.normalizedUtcInstant.epochSeconds / 60,
    );
    const deltaMinutes = Math.abs(actualEpochMinute - referenceEpochMinute);
    const match =
      result.value.termId === fixture.expected.termId &&
      deltaMinutes <= fixture.expected.toleranceMinutes;
    if (!match) failures.push(`${fixture.id} exceeded the practical minute tolerance.`);
    independentResults.push({
      fixtureId: fixture.id,
      authority: fixture.authority.name,
      termId: result.value.termId,
      deltaMinutes,
      match,
    });
  }

  const supportedRangeDates = [
    { year: 1970, month: 1, day: 1 },
    { year: 1970, month: 12, day: 31 },
    { year: 2050, month: 1, day: 1 },
    { year: 2050, month: 12, day: 31 },
  ] as const;
  let supportedRangeCases = 0;
  let deterministicRangeRepeatabilityCases = 0;
  for (const date of supportedRangeDates) {
    const input = {
      birthInstant: {
        kind: 'UTC_INSTANT' as const,
        epochSeconds: civilToEpochSeconds(date, 12, 0, 0, 32_400),
      },
      direction: 'FORWARD' as const,
    };
    const first = adapter.resolve(input);
    const second = adapter.resolve(input);
    if (first.ok) supportedRangeCases += 1;
    else failures.push(`Supported range failed at ${date.year}-${date.month}-${date.day}.`);
    if (JSON.stringify(first) === JSON.stringify(second)) {
      deterministicRangeRepeatabilityCases += 1;
    } else {
      failures.push(`Supported range was not deterministic at ${date.year}-${date.month}-${date.day}.`);
    }
  }

  const independentMatches = independentResults.filter((result) => result.match).length;
  if (independentMatches !== INDEPENDENT_SOLAR_TERM_FIXTURES.length) {
    failures.push('Independent Solar-Term validation was incomplete.');
  }
  if (supportedRangeCases !== supportedRangeDates.length) {
    failures.push('Supported date range coverage was incomplete.');
  }
  if (deterministicRangeRepeatabilityCases !== supportedRangeDates.length) {
    failures.push('Supported date range repeatability was incomplete.');
  }

  return {
    ok: failures.length === 0,
    failures,
    independentMatches,
    independentResults,
    supportedRangeCases,
    deterministicRangeRepeatabilityCases,
    supportedBirthRange: DEOKBUNAI_SOLAR_TERM_V1_POLICY.supportedBirthRange,
  };
}
