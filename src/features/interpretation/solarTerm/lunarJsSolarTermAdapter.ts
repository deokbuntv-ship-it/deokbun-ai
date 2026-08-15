import {
  civilDayOrdinalToGregorian,
  gregorianToCivilDayOrdinal,
  isValidGregorianDate,
} from '../calendar/civilDay';
import type { LocalDate } from '../domain/time';
import type { SolarTermId } from './contracts';
import { getSolarTermDefinition } from './termDefinitions';

const SECONDS_PER_DAY = 86_400;
const FIXED_UTC_PLUS_08_SECONDS = 28_800;
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({
  year: 1970,
  month: 1,
  day: 1,
});

export const LUNAR_JS_SOLAR_TERM_PROVIDER_PIN = {
  provider: 'lunar-javascript',
  providerVersion: '1.7.7',
  packageTarballChecksum: {
    algorithm: 'SHA-256',
    value: 'd1359ab9ca4913d1db3978a42ddfc290eb8ea9de54ce043f5b1f718ff71eea36',
  },
  license: 'MIT',
  attribution: 'Copyright (c) 2018 6tail',
  sourceTimeBasis: 'FIXED_UTC_PLUS_08',
  adapterRuleVersion: 'deokbunai.solar-term-lunarjs-adapter.v1',
  conversionRuleVersion: 'deokbunai.solar-term-lunarjs-conversion.v1',
} as const;

export const DEOKBUNAI_SOLAR_TERM_V1_POLICY = {
  ruleId: 'DEOKBUNAI_SOLAR_TERM_V1',
  ruleVersion: 'deokbunai.solar-term.v1',
  runtimeAuthority: 'lunar-javascript@1.7.7',
  supportedBirthRange: {
    start: { year: 1970, month: 1, day: 1 },
    end: { year: 2050, month: 12, day: 31 },
  },
  providerTimeBasis: 'FIXED_UTC_PLUS_08',
  normalizedTimeBasis: 'UTC_INSTANT',
  preservedProviderPrecision: 'SECOND',
  canonicalBoundaryPrecision: 'MINUTE',
  boundaryRule: 'SAME_UTC_MINUTE_IS_AMBIGUOUS',
  intervalBoundary: 'DIRECTIONAL_NEAREST_JIE',
  primaryRuntimeRequiresNetwork: false,
} as const;

export type SolarTermBoundaryDirection = 'FORWARD' | 'REVERSE';

export type SolarTermCivilSecond = {
  date: LocalDate;
  hour: number;
  minute: number;
  second: number;
};

export type CanonicalSolarTermInstant = {
  termId: SolarTermId;
  kind: 'JIE';
  sourceName: string;
  sourceCivil: SolarTermCivilSecond;
  sourceTimeBasis: 'FIXED_UTC_PLUS_08';
  normalizedUtcInstant: {
    kind: 'UTC_INSTANT';
    epochSeconds: number;
  };
  provenance: {
    provider: 'lunar-javascript';
    providerVersion: '1.7.7';
    packageTarballChecksum: {
      algorithm: 'SHA-256';
      value: string;
    };
    license: 'MIT';
    attribution: 'Copyright (c) 2018 6tail';
    publicApiPath:
      | 'Solar.fromYmdHms.getLunar.getNextJie'
      | 'Solar.fromYmdHms.getLunar.getPrevJie';
    adapterRuleVersion: 'deokbunai.solar-term-lunarjs-adapter.v1';
    conversionRuleVersion: 'deokbunai.solar-term-lunarjs-conversion.v1';
  };
};

export type LunarJsSolarTermAdapterInput = {
  birthInstant: {
    kind: 'UTC_INSTANT';
    epochSeconds: number;
  };
  direction: SolarTermBoundaryDirection;
};

export type LunarJsSolarTermAdapterErrorCode =
  | 'INVALID_BIRTH_INSTANT'
  | 'PROVIDER_FAILURE'
  | 'INVALID_PROVIDER_TIMESTAMP'
  | 'NON_JIE_BOUNDARY'
  | 'UNSUPPORTED_JIE_NAME'
  | 'BOUNDARY_DIRECTION_MISMATCH';

export type LunarJsSolarTermAdapterResult =
  | { ok: true; value: CanonicalSolarTermInstant }
  | {
      ok: false;
      error: {
        code: LunarJsSolarTermAdapterErrorCode;
        path: string;
        details?: Readonly<Record<string, string | number | boolean>>;
      };
    };

type LunarJsPublicSolarFields = {
  getYear(): number;
  getMonth(): number;
  getDay(): number;
  getHour(): number;
  getMinute(): number;
  getSecond(): number;
};

type LunarJsPublicJie = {
  getName(): string;
  getSolar(): LunarJsPublicSolarFields;
  isJie(): boolean;
  isQi(): boolean;
};

type LunarJsPublicLunar = {
  getPrevJie(): LunarJsPublicJie;
  getNextJie(): LunarJsPublicJie;
};

type LunarJsPublicBirthSolar = LunarJsPublicSolarFields & {
  getLunar(): LunarJsPublicLunar;
};

export type LunarJsPublicApi = {
  Solar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): LunarJsPublicBirthSolar;
  };
};

export type LunarJsSolarTermAdapter = {
  resolve(input: LunarJsSolarTermAdapterInput): LunarJsSolarTermAdapterResult;
};

const LUNAR_JS_JIE_NAMES: Readonly<Record<string, SolarTermId>> = {
  小寒: 'MINOR_COLD',
  立春: 'START_OF_SPRING',
  惊蛰: 'AWAKENING_OF_INSECTS',
  驚蟄: 'AWAKENING_OF_INSECTS',
  清明: 'PURE_BRIGHTNESS',
  立夏: 'START_OF_SUMMER',
  芒种: 'GRAIN_IN_EAR',
  芒種: 'GRAIN_IN_EAR',
  小暑: 'MINOR_HEAT',
  立秋: 'START_OF_AUTUMN',
  白露: 'WHITE_DEW',
  寒露: 'COLD_DEW',
  立冬: 'START_OF_WINTER',
  大雪: 'MAJOR_SNOW',
};

function epochSecondsToFixedOffsetCivil(
  epochSeconds: number,
  offsetSeconds: number,
): SolarTermCivilSecond {
  const shiftedSeconds = epochSeconds + offsetSeconds;
  const dayOffset = Math.floor(shiftedSeconds / SECONDS_PER_DAY);
  const secondOfDay = shiftedSeconds - dayOffset * SECONDS_PER_DAY;
  return {
    date: civilDayOrdinalToGregorian(UNIX_EPOCH_DAY + dayOffset),
    hour: Math.floor(secondOfDay / 3_600),
    minute: Math.floor((secondOfDay % 3_600) / 60),
    second: secondOfDay % 60,
  };
}

function civilSecondToEpochSeconds(
  value: SolarTermCivilSecond,
  offsetSeconds: number,
): number {
  return (
    (gregorianToCivilDayOrdinal(value.date) - UNIX_EPOCH_DAY) * SECONDS_PER_DAY +
    value.hour * 3_600 +
    value.minute * 60 +
    value.second -
    offsetSeconds
  );
}

function isValidCivilSecond(value: SolarTermCivilSecond): boolean {
  return (
    isValidGregorianDate(value.date) &&
    Number.isInteger(value.hour) &&
    Number.isInteger(value.minute) &&
    Number.isInteger(value.second) &&
    value.hour >= 0 &&
    value.hour <= 23 &&
    value.minute >= 0 &&
    value.minute <= 59 &&
    value.second >= 0 &&
    value.second <= 59
  );
}

function readProviderCivil(solar: LunarJsPublicSolarFields): SolarTermCivilSecond {
  return {
    date: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
    },
    hour: solar.getHour(),
    minute: solar.getMinute(),
    second: solar.getSecond(),
  };
}

export function createLunarJsSolarTermAdapter(
  publicApi: LunarJsPublicApi,
): LunarJsSolarTermAdapter {
  return {
    resolve(input): LunarJsSolarTermAdapterResult {
      if (!Number.isSafeInteger(input.birthInstant.epochSeconds)) {
        return {
          ok: false,
          error: {
            code: 'INVALID_BIRTH_INSTANT',
            path: 'birthInstant.epochSeconds',
          },
        };
      }

      const providerBirthCivil = epochSecondsToFixedOffsetCivil(
        input.birthInstant.epochSeconds,
        FIXED_UTC_PLUS_08_SECONDS,
      );

      try {
        const providerBirth = publicApi.Solar.fromYmdHms(
          providerBirthCivil.date.year,
          providerBirthCivil.date.month,
          providerBirthCivil.date.day,
          providerBirthCivil.hour,
          providerBirthCivil.minute,
          providerBirthCivil.second,
        );
        const lunar = providerBirth.getLunar();
        const boundary =
          input.direction === 'FORWARD'
            ? lunar.getNextJie()
            : lunar.getPrevJie();

        if (!boundary.isJie() || boundary.isQi()) {
          return {
            ok: false,
            error: {
              code: 'NON_JIE_BOUNDARY',
              path: 'provider.boundary',
            },
          };
        }

        const sourceName = boundary.getName();
        const termId = LUNAR_JS_JIE_NAMES[sourceName];
        if (!termId || getSolarTermDefinition(termId).kind !== 'JIE') {
          return {
            ok: false,
            error: {
              code: 'UNSUPPORTED_JIE_NAME',
              path: 'provider.boundary.name',
              details: { sourceName },
            },
          };
        }

        const sourceCivil = readProviderCivil(boundary.getSolar());
        if (!isValidCivilSecond(sourceCivil)) {
          return {
            ok: false,
            error: {
              code: 'INVALID_PROVIDER_TIMESTAMP',
              path: 'provider.boundary.solar',
            },
          };
        }

        const epochSeconds = civilSecondToEpochSeconds(
          sourceCivil,
          FIXED_UTC_PLUS_08_SECONDS,
        );
        const directionMatches =
          input.direction === 'FORWARD'
            ? epochSeconds > input.birthInstant.epochSeconds
            : epochSeconds < input.birthInstant.epochSeconds;
        if (!directionMatches) {
          return {
            ok: false,
            error: {
              code: 'BOUNDARY_DIRECTION_MISMATCH',
              path: 'provider.boundary.solar',
              details: {
                direction: input.direction,
                birthEpochSeconds: input.birthInstant.epochSeconds,
                boundaryEpochSeconds: epochSeconds,
              },
            },
          };
        }

        return {
          ok: true,
          value: {
            termId,
            kind: 'JIE',
            sourceName,
            sourceCivil,
            sourceTimeBasis: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.sourceTimeBasis,
            normalizedUtcInstant: {
              kind: 'UTC_INSTANT',
              epochSeconds,
            },
            provenance: {
              provider: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.provider,
              providerVersion: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.providerVersion,
              packageTarballChecksum:
                LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.packageTarballChecksum,
              license: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.license,
              attribution: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.attribution,
              publicApiPath:
                input.direction === 'FORWARD'
                  ? 'Solar.fromYmdHms.getLunar.getNextJie'
                  : 'Solar.fromYmdHms.getLunar.getPrevJie',
              adapterRuleVersion:
                LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.adapterRuleVersion,
              conversionRuleVersion:
                LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.conversionRuleVersion,
            },
          },
        };
      } catch {
        return {
          ok: false,
          error: {
            code: 'PROVIDER_FAILURE',
            path: 'provider',
          },
        };
      }
    },
  };
}
