import type { SajuEngineInput } from '../contracts/saju';
import {
  BIRTH_FINGERPRINT_SCHEMA_VERSION,
  BIRTH_FINGERPRINT_SCHEMA_VERSION_V3,
  createBirthFingerprintFrame,
  createBirthFingerprintFrameV3,
  createBirthFingerprintPayload,
  createBirthFingerprintPayloadV3,
  serializeBirthFingerprintPayload,
} from '../normalization/canonicalSerialization';
import { executeSajuFromBirthInput } from '../saju/birthExecutionBridge';
import { ASIA_SEOUL_TZDB_2026C_ARTIFACT } from './data/asiaSeoulTzdb2026c';
import type { HistoricalTimezoneArtifact } from './contracts';
import { ASIA_SEOUL_GOLDEN_FIXTURES } from './fixtures/asiaSeoulGoldenFixtures';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  createAsiaSeoulHistoricalTimezoneResolver,
} from './historicalTimezoneResolver';

export type HistoricalTimezoneValidationReport = {
  ok: boolean;
  failures: string[];
  goldenFixtures: number;
  uniqueFixtures: number;
  ambiguousFixtures: number;
  nonexistentFixtures: number;
  unresolvedFixtures: number;
  orderedAmbiguousCandidates: number;
  noSingleOffsetOnAmbiguousOrNonexistent: number;
  officialCrossCheckFixtures: number;
  sourceConflictCases: number;
  exactCompleteCases: number;
  historicalPartialCases: number;
  approximateResolverCallCases: number;
  unknownResolverCallCases: number;
  normalizationV3RegressionCases: number;
  normalizationV4Cases: number;
  deterministicFingerprintCases: number;
  provenanceFingerprintCases: number;
  runtimeForbiddenDependencyCount: number;
};

function birthInput(
  date: { year: number; month: number; day: number },
  time:
    | { accuracy: 'EXACT'; localTime: { hour: number; minute: number; second: number } }
    | { accuracy: 'APPROXIMATE'; period: 'MORNING' }
    | { accuracy: 'UNKNOWN' },
  ianaZone = 'Asia/Seoul',
): SajuEngineInput {
  return {
    engine: 'SAJU',
    birth: {
      date: { calendar: 'GREGORIAN', ...date },
      time,
      place: { countryCode: 'KR' },
      temporalContext: {
        timezone: { status: 'EXPLICIT', ianaZone, source: 'APP' },
        dst: { status: 'UNRESOLVED' },
        trueSolarTime: { mode: 'DO_NOT_APPLY' },
      },
      gender: 'UNSPECIFIED',
    },
  };
}

export async function validateHistoricalTimezoneResolver(): Promise<HistoricalTimezoneValidationReport> {
  const failures: string[] = [];
  let uniqueFixtures = 0;
  let ambiguousFixtures = 0;
  let nonexistentFixtures = 0;
  let unresolvedFixtures = 0;
  let orderedAmbiguousCandidates = 0;
  let noSingleOffsetOnAmbiguousOrNonexistent = 0;

  for (const fixture of ASIA_SEOUL_GOLDEN_FIXTURES) {
    const result = await ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER.resolve({
      ianaZone: fixture.ianaZone,
      civilLocal: {
        accuracy: 'EXACT',
        date: fixture.date,
        time: fixture.time,
      },
    });
    if (fixture.expected.status === 'UNRESOLVED') {
      if (
        result.status === 'UNRESOLVED' &&
        result.reason === fixture.expected.reason &&
        result.historicalProvenance.unresolvedReason !== undefined
      ) {
        unresolvedFixtures += 1;
      } else failures.push(`${fixture.id}: unresolved contract mismatch.`);
      continue;
    }
    if (
      result.status !== 'RESOLVED' ||
      result.localTimeResolution.kind !== fixture.expected.kind
    ) {
      failures.push(`${fixture.id}: local-time resolution mismatch.`);
      continue;
    }
    if (result.localTimeResolution.kind === 'UNIQUE') {
      if (
        fixture.expected.kind === 'UNIQUE' &&
        'resolvedOffsetSeconds' in result &&
        result.resolvedOffsetSeconds === fixture.expected.totalOffsetSeconds &&
        result.localTimeResolution.candidate.dstOffsetSeconds ===
          fixture.expected.dstOffsetSeconds
      ) uniqueFixtures += 1;
      else failures.push(`${fixture.id}: UNIQUE offset mismatch.`);
    } else if (result.localTimeResolution.kind === 'AMBIGUOUS') {
      ambiguousFixtures += 1;
      if (
        result.localTimeResolution.candidates[0].utcEpochSeconds <
        result.localTimeResolution.candidates[1].utcEpochSeconds
      ) orderedAmbiguousCandidates += 1;
      else failures.push(`${fixture.id}: candidates were not UTC ordered.`);
      if (!('resolvedOffsetSeconds' in result) && !('dst' in result)) {
        noSingleOffsetOnAmbiguousOrNonexistent += 1;
      } else failures.push(`${fixture.id}: selected a forbidden top-level offset.`);
    } else {
      nonexistentFixtures += 1;
      if (!('resolvedOffsetSeconds' in result) && !('dst' in result)) {
        noSingleOffsetOnAmbiguousOrNonexistent += 1;
      } else failures.push(`${fixture.id}: selected a forbidden gap offset.`);
    }
  }

  const digestFrames: string[] = [];
  const digestProvider = {
    async sha256Utf8(frame: string) {
      digestFrames.push(frame);
      return 'f'.repeat(64);
    },
  };
  let resolverCalls = 0;
  const countingResolver = {
    async resolve(request: Parameters<typeof ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER.resolve>[0]) {
      resolverCalls += 1;
      return ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER.resolve(request);
    },
  };

  const exact = await executeSajuFromBirthInput(
    birthInput(
      { year: 2025, month: 1, day: 15 },
      { accuracy: 'EXACT', localTime: { hour: 12, minute: 0, second: 0 } },
    ),
    { historicalTimezoneResolver: countingResolver, digestProvider },
  );
  const exactCompleteCases =
    exact.success &&
    exact.engineResult.status === 'SUCCESS' &&
    exact.engineResult.output.fourPillars.hour.status === 'AVAILABLE'
      ? 1
      : 0;
  if (!exactCompleteCases) failures.push('EXACT + UNIQUE did not produce COMPLETE.');

  let historicalPartialCases = 0;
  for (const [date, time] of [
    [{ year: 1987, month: 10, day: 11 }, { hour: 2, minute: 30, second: 0 }],
    [{ year: 1987, month: 5, day: 10 }, { hour: 2, minute: 30, second: 0 }],
  ] as const) {
    const result = await executeSajuFromBirthInput(
      birthInput(date, { accuracy: 'EXACT', localTime: time }),
      { historicalTimezoneResolver: countingResolver, digestProvider },
    );
    if (result.success && result.engineResult.status === 'PARTIAL') {
      historicalPartialCases += 1;
    } else failures.push('Ambiguous/nonexistent input did not remain PARTIAL.');
  }

  const beforeApproximate = resolverCalls;
  const approximate = await executeSajuFromBirthInput(
    birthInput(
      { year: 2025, month: 1, day: 15 },
      { accuracy: 'APPROXIMATE', period: 'MORNING' },
    ),
    { historicalTimezoneResolver: countingResolver, digestProvider },
  );
  const approximateResolverCallCases =
    approximate.success &&
    approximate.engineResult.status === 'PARTIAL' &&
    resolverCalls === beforeApproximate
      ? 1
      : 0;
  if (!approximateResolverCallCases) failures.push('APPROXIMATE resolver-call regression.');

  const beforeUnknown = resolverCalls;
  const unknown = await executeSajuFromBirthInput(
    birthInput({ year: 2025, month: 1, day: 15 }, { accuracy: 'UNKNOWN' }),
    { historicalTimezoneResolver: countingResolver, digestProvider },
  );
  const unknownResolverCallCases =
    unknown.success &&
    unknown.engineResult.status === 'PARTIAL' &&
    resolverCalls === beforeUnknown
      ? 1
      : 0;
  if (!unknownResolverCallCases) failures.push('UNKNOWN resolver-call regression.');

  let normalizationV3RegressionCases = 0;
  let normalizationV4Cases = 0;
  let deterministicFingerprintCases = 0;
  let provenanceFingerprintCases = 0;
  if (exact.success) {
    const v3Payload = createBirthFingerprintPayloadV3(exact.normalizedBirth);
    const v3Serialized = serializeBirthFingerprintPayload(v3Payload);
    const v3Frame = createBirthFingerprintFrameV3(v3Serialized);
    if (
      v3Frame.startsWith(`${BIRTH_FINGERPRINT_SCHEMA_VERSION_V3}\n`) &&
      v3Frame === createBirthFingerprintFrameV3(v3Serialized)
    ) normalizationV3RegressionCases = 1;
    else failures.push('Normalization V3 regression framing changed.');

    const v4Payload = createBirthFingerprintPayload(exact.normalizedBirth);
    const v4Serialized = serializeBirthFingerprintPayload(v4Payload);
    const v4Frame = createBirthFingerprintFrame(v4Serialized);
    if (v4Frame.startsWith(`${BIRTH_FINGERPRINT_SCHEMA_VERSION}\n`)) {
      normalizationV4Cases = 1;
    } else failures.push('Normalization V4 framing failed.');
    if (v4Frame === createBirthFingerprintFrame(serializeBirthFingerprintPayload(v4Payload))) {
      deterministicFingerprintCases = 1;
    } else failures.push('V4 canonical framing was not deterministic.');

    if (exact.normalizedBirth.timezone.status === 'RESOLVED') {
      const changed = {
        ...exact.normalizedBirth,
        timezone: {
          ...exact.normalizedBirth.timezone,
          historicalProvenance: {
            ...exact.normalizedBirth.timezone.historicalProvenance,
            sourceRevision: 'tzdb-2026c-provenance-change',
          },
        },
      };
      const changedFrame = createBirthFingerprintFrame(
        serializeBirthFingerprintPayload(createBirthFingerprintPayload(changed)),
      );
      if (changedFrame !== v4Frame) provenanceFingerprintCases = 1;
      else failures.push('Timezone provenance change did not affect V4 fingerprint frame.');
    }
  }

  const source = `${createAsiaSeoulHistoricalTimezoneResolver.toString()}${ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER.resolve.toString()}`;
  const runtimeForbiddenDependencyCount = [
    'new Date(',
    'Intl.',
    'fetch(',
    'XMLHttpRequest',
    'https://',
    'http://',
  ].filter((token) => source.includes(token)).length;
  if (runtimeForbiddenDependencyCount !== 0) {
    failures.push('Resolver runtime contains a forbidden dependency token.');
  }

  const officialCrossCheckFixtures =
    ASIA_SEOUL_TZDB_2026C_ARTIFACT.manifest.officialCrossChecks.filter(
      (fixture) => fixture.comparison === 'MATCH',
    ).length;
  if (officialCrossCheckFixtures !== 4) failures.push('Official cross-check count was not 4/4.');

  const conflictingArtifact: HistoricalTimezoneArtifact = {
    ...ASIA_SEOUL_TZDB_2026C_ARTIFACT,
    manifest: {
      ...ASIA_SEOUL_TZDB_2026C_ARTIFACT.manifest,
      officialCrossChecks: ASIA_SEOUL_TZDB_2026C_ARTIFACT.manifest.officialCrossChecks.map(
        (fixture, index) =>
          index === 0
            ? { ...fixture, transitionUtcEpochSeconds: fixture.transitionUtcEpochSeconds + 1 }
            : fixture,
      ),
    },
  };
  const conflict = await createAsiaSeoulHistoricalTimezoneResolver(
    conflictingArtifact,
  ).resolve({
    ianaZone: 'Asia/Seoul',
    civilLocal: {
      accuracy: 'EXACT',
      date: { year: 2025, month: 1, day: 15 },
      time: { hour: 12, minute: 0, second: 0 },
    },
  });
  const sourceConflictCases =
    conflict.status === 'UNRESOLVED' &&
    conflict.reason === 'HISTORICAL_SOURCE_CONFLICT' &&
    conflict.historicalProvenance.authorityStatus === 'SOURCE_CONFLICT' &&
    conflict.historicalProvenance.comparison === 'CONFLICT'
      ? 1
      : 0;
  if (!sourceConflictCases) failures.push('SOURCE_CONFLICT fail-closed behavior failed.');

  return {
    ok: failures.length === 0,
    failures,
    goldenFixtures: ASIA_SEOUL_GOLDEN_FIXTURES.length,
    uniqueFixtures,
    ambiguousFixtures,
    nonexistentFixtures,
    unresolvedFixtures,
    orderedAmbiguousCandidates,
    noSingleOffsetOnAmbiguousOrNonexistent,
    officialCrossCheckFixtures,
    sourceConflictCases,
    exactCompleteCases,
    historicalPartialCases,
    approximateResolverCallCases,
    unknownResolverCallCases,
    normalizationV3RegressionCases,
    normalizationV4Cases,
    deterministicFingerprintCases,
    provenanceFingerprintCases,
    runtimeForbiddenDependencyCount,
  };
}
