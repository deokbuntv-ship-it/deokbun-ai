import { KASI_LUNISOLAR_CALENDAR_RESOLVER } from '../calendar/kasiCalendarResolver';
import type {
  HistoricalTimezoneResolver,
  LunisolarCalendarResolver,
  TimezoneResolution,
} from '../contracts/normalization';
import type { SajuEngineInput } from '../contracts/saju';
import type { DigestProvider } from '../normalization/fingerprint';
import {
  BIRTH_FINGERPRINT_SCHEMA_VERSION,
} from '../normalization/canonicalSerialization';
import { executeSajuFromBirthInput } from './birthExecutionBridge';

export type BirthExecutionBridgeValidationReport = {
  ok: boolean;
  failures: string[];
  exactSuccessCases: number;
  partialCapabilityCases: number;
  normalizationFailureCases: number;
  fingerprintFailureCases: number;
  singleCalendarResolutionCases: number;
  singleFingerprintCases: number;
  noInventedTimeCases: number;
  provenanceCases: number;
};

function exactInput(): SajuEngineInput {
  return {
    engine: 'SAJU',
    birth: {
      date: { calendar: 'GREGORIAN', year: 1984, month: 2, day: 2 },
      time: {
        accuracy: 'EXACT',
        localTime: { hour: 10, minute: 30, second: 0 },
      },
      place: {
        countryCode: 'KR',
        coordinates: { latitude: 37.5665, longitude: 126.978 },
      },
      temporalContext: {
        timezone: {
          status: 'EXPLICIT',
          ianaZone: 'Asia/Seoul',
          source: 'APP',
        },
        dst: { status: 'NOT_OBSERVED', source: 'APP' },
        trueSolarTime: { mode: 'DO_NOT_APPLY' },
      },
      gender: 'UNSPECIFIED',
    },
  };
}

function resolvedTimezone(): TimezoneResolution {
  const provenance = {
    resolverId: 'ENGINE_10B_VALIDATION_TIMEZONE_PORT',
    resolverVersion: '1',
    dataVersion: 'validation-timezone-data',
    ruleSetVersion: 'validation-timezone-rules',
    source: 'ENGINE' as const,
  };
  return {
    status: 'RESOLVED',
    ianaZone: 'Asia/Seoul',
    resolvedOffsetSeconds: 32_400,
    resolvedOffsetMinutes: 540,
    timezoneDataVersion: 'validation-timezone-data',
    resolutionSource: 'APP',
    dst: {
      status: 'NOT_OBSERVED',
      dstOffsetSeconds: 0,
      provenance,
    },
    localTimeResolution: {
      kind: 'UNIQUE',
      candidate: {
        utcEpochSeconds: 444_490_200,
        totalOffsetSeconds: 32_400,
        dstOffsetSeconds: 0,
        isDst: false,
      },
    },
    historicalProvenance: {
      authorityStatus: 'OFFICIAL_SOURCE_VERIFIED',
      tzdbZone: 'Asia/Seoul',
      officialSources: [],
      ruleSetVersion: 'validation-timezone-rules',
      comparison: 'MATCH',
      jurisdiction: 'KR',
      applicableRegion: 'KR',
    },
    provenance,
  };
}

export async function validateBirthExecutionBridge(): Promise<BirthExecutionBridgeValidationReport> {
  const failures: string[] = [];
  let exactSuccessCases = 0;
  let partialCapabilityCases = 0;
  let normalizationFailureCases = 0;
  let fingerprintFailureCases = 0;
  let singleCalendarResolutionCases = 0;
  let singleFingerprintCases = 0;
  let noInventedTimeCases = 0;
  let provenanceCases = 0;

  let calendarCalls = 0;
  const calendarResolver: LunisolarCalendarResolver = {
    async resolve(date) {
      calendarCalls += 1;
      return KASI_LUNISOLAR_CALENDAR_RESOLVER.resolve(date);
    },
  };
  let timezoneCalls = 0;
  const historicalTimezoneResolver: HistoricalTimezoneResolver = {
    async resolve() {
      timezoneCalls += 1;
      return resolvedTimezone();
    },
  };
  let digestCalls = 0;
  let digestFrame = '';
  const digestProvider: DigestProvider = {
    async sha256Utf8(frame) {
      digestCalls += 1;
      digestFrame = frame;
      return 'a'.repeat(64);
    },
  };

  const exact = await executeSajuFromBirthInput(exactInput(), {
    calendarResolver,
    historicalTimezoneResolver,
    digestProvider,
  });
  if (
    exact.success &&
    exact.engineResult.status === 'SUCCESS' &&
    exact.engineResult.output.fourPillars.hour.status === 'AVAILABLE'
  ) {
    exactSuccessCases += 1;
  } else {
    failures.push('EXACT input did not produce a complete Saju result.');
  }
  if (calendarCalls === 1) singleCalendarResolutionCases += 1;
  else failures.push(`Calendar resolver call count was ${calendarCalls}, expected 1.`);
  if (
    digestCalls === 1 &&
    digestFrame.startsWith(`${BIRTH_FINGERPRINT_SCHEMA_VERSION}\n`)
  ) {
    singleFingerprintCases += 1;
  } else {
    failures.push('Fingerprint framing or digest call count was not deterministic.');
  }
  if (
    exact.success &&
    exact.normalizedBirth.provenance.some(
      (item) => item.resolverId === 'DEOKBUNAI_KASI_LUNISOLAR_CALENDAR_RESOLVER',
    ) &&
    exact.normalizedBirth.provenance.some(
      (item) => item.resolverId === 'ENGINE_10B_VALIDATION_TIMEZONE_PORT',
    )
  ) {
    provenanceCases += 1;
  } else {
    failures.push('Calendar or historical-time provenance was not preserved.');
  }

  const unknownInput = exactInput();
  unknownInput.birth.time = { accuracy: 'UNKNOWN' };
  const callsBeforeUnknown = timezoneCalls;
  const unknown = await executeSajuFromBirthInput(unknownInput, {
    historicalTimezoneResolver,
    digestProvider,
  });
  if (
    unknown.success &&
    unknown.engineResult.status === 'PARTIAL' &&
    unknown.normalizedBirth.civilLocal.accuracy === 'UNKNOWN' &&
    unknown.engineResult.output.fourPillars.hour.status === 'UNAVAILABLE'
  ) {
    partialCapabilityCases += 1;
    noInventedTimeCases += 1;
  } else {
    failures.push('UNKNOWN time was not preserved as a partial result.');
  }
  if (timezoneCalls !== callsBeforeUnknown) {
    failures.push('Historical timezone resolver ran for UNKNOWN time.');
  }

  const approximateInput = exactInput();
  approximateInput.birth.time = {
    accuracy: 'APPROXIMATE',
    period: 'MORNING',
    localTimeHint: {
      start: { hour: 8, minute: 0 },
      end: { hour: 11, minute: 59 },
    },
  };
  const approximate = await executeSajuFromBirthInput(approximateInput, {
    historicalTimezoneResolver,
    digestProvider,
  });
  if (
    approximate.success &&
    approximate.engineResult.status === 'PARTIAL' &&
    approximate.normalizedBirth.civilLocal.accuracy === 'APPROXIMATE' &&
    approximate.normalizedBirth.civilLocal.resolvedRange?.start.hour === 8 &&
    approximate.engineResult.output.fourPillars.hour.status === 'AMBIGUOUS'
  ) {
    partialCapabilityCases += 1;
    noInventedTimeCases += 1;
  } else {
    failures.push('APPROXIMATE range was not preserved as an ambiguous Hour.');
  }

  const noTimezoneResolver = await executeSajuFromBirthInput(exactInput(), {
    digestProvider,
  });
  if (
    noTimezoneResolver.success &&
    noTimezoneResolver.engineResult.status === 'PARTIAL' &&
    noTimezoneResolver.normalizedBirth.timezone.status === 'UNRESOLVED' &&
    noTimezoneResolver.warnings.some(
      (item) => item.code === 'TIMEZONE_RESOLVER_NOT_PROVIDED',
    )
  ) {
    partialCapabilityCases += 1;
  } else {
    failures.push('Missing timezone resolver did not remain an explicit partial capability.');
  }

  const invalidDateInput = exactInput();
  invalidDateInput.birth.date = {
    calendar: 'GREGORIAN',
    year: 2023,
    month: 2,
    day: 30,
  };
  const invalidDate = await executeSajuFromBirthInput(invalidDateInput, {
    digestProvider,
  });
  if (
    !invalidDate.success &&
    invalidDate.failedStage === 'NORMALIZATION' &&
    invalidDate.errors.some((item) => item.code === 'INVALID_GREGORIAN_DATE')
  ) {
    normalizationFailureCases += 1;
  } else {
    failures.push('Invalid Gregorian date did not produce structured normalization failure.');
  }

  const invalidRangeInput = exactInput();
  invalidRangeInput.birth.time = {
    accuracy: 'APPROXIMATE',
    period: 'MORNING',
    localTimeHint: {
      start: { hour: 12, minute: 0 },
      end: { hour: 8, minute: 0 },
    },
  };
  const invalidRange = await executeSajuFromBirthInput(invalidRangeInput, {
    digestProvider,
  });
  if (
    !invalidRange.success &&
    invalidRange.errors.some((item) => item.code === 'INVALID_APPROXIMATE_RANGE')
  ) {
    normalizationFailureCases += 1;
  } else {
    failures.push('Invalid approximate range did not produce structured failure.');
  }

  const digestFailure = await executeSajuFromBirthInput(exactInput(), {
    historicalTimezoneResolver,
    digestProvider: {
      async sha256Utf8() {
        throw new Error('validation digest failure');
      },
    },
  });
  if (
    !digestFailure.success &&
    digestFailure.failedStage === 'FINGERPRINT' &&
    digestFailure.errors.some((item) => item.code === 'FINGERPRINT_DIGEST_FAILED')
  ) {
    fingerprintFailureCases += 1;
  } else {
    failures.push('Digest provider failure was not mapped structurally.');
  }

  return {
    ok: failures.length === 0,
    failures,
    exactSuccessCases,
    partialCapabilityCases,
    normalizationFailureCases,
    fingerprintFailureCases,
    singleCalendarResolutionCases,
    singleFingerprintCases,
    noInventedTimeCases,
    provenanceCases,
  };
}
