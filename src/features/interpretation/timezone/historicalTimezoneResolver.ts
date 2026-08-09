import {
  civilDayOrdinalToGregorian,
  compareGregorianDates,
  gregorianToCivilDayOrdinal,
} from '../calendar/civilDay';
import type {
  HistoricalTimeProvenance,
  HistoricalUtcCandidate,
} from '../contracts/historicalTime';
import type {
  HistoricalTimezoneResolutionRequest,
  HistoricalTimezoneResolver,
  ResolutionProvenance,
  TimezoneResolution,
  TimezoneUnresolvedReason,
} from '../contracts/normalization';
import type { CivilLocalDateTime } from '../contracts/normalization';
import type { HistoricalTimezoneArtifact, HistoricalTimezoneState } from './contracts';
import {
  ASIA_SEOUL_TZDB_2026C_ARTIFACT,
  ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256,
} from './data/asiaSeoulTzdb2026c';

export const ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_ID =
  'deokbunai.historical-timezone-resolver.asia-seoul' as const;
export const ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_VERSION =
  'deokbunai.historical-timezone-resolver.v1' as const;

const SECONDS_PER_DAY = 86_400;
const UNIX_EPOCH_ORDINAL = gregorianToCivilDayOrdinal({
  year: 1970,
  month: 1,
  day: 1,
});

function resolutionProvenance(
  artifact: HistoricalTimezoneArtifact,
): ResolutionProvenance {
  return {
    resolverId: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_ID,
    resolverVersion: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_VERSION,
    dataVersion: artifact.manifest.artifactVersion,
    ruleSetVersion: artifact.manifest.resolverRuleVersion,
    source: 'ENGINE',
  };
}

function historicalProvenance(
  artifact: HistoricalTimezoneArtifact,
  authorityStatus: HistoricalTimeProvenance['authorityStatus'],
  comparison: HistoricalTimeProvenance['comparison'],
  unresolvedReason?: HistoricalTimeProvenance['unresolvedReason'],
): HistoricalTimeProvenance {
  const officialSources = [
    {
      authority: '대한민국 국가법령정보센터',
      documentId: '법률 제676호',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=54666',
      publicationDate: '1961-08-07',
      effectiveLocalTime: '1961-08-10T00:00:00',
    },
    {
      authority: '대한민국 국가법령정보센터',
      documentId: '대통령령 제12136호',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990',
      publicationDate: '1987-04-07',
    },
    {
      authority: '대한민국 국가법령정보센터',
      documentId: '대통령령 제12703호',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23991',
      publicationDate: '1989-05-08',
    },
  ] as const;
  return {
    authorityStatus,
    tzdbVersion: artifact.manifest.tzdbVersion,
    tzdbZone: artifact.manifest.zoneId,
    officialSources,
    ruleSetVersion: artifact.manifest.resolverRuleVersion,
    comparison,
    jurisdiction: 'KR',
    applicableRegion: 'Republic of Korea / Asia/Seoul',
    sourceIdentity: artifact.manifest.source.identity,
    sourceRevision: artifact.manifest.source.revision,
    supportedRange: {
      startLocalDate: '1970-01-01',
      endLocalDate: '2050-12-31',
    },
    ...(unresolvedReason ? { unresolvedReason } : {}),
  };
}

function unresolved(
  artifact: HistoricalTimezoneArtifact,
  ianaZone: string,
  reason: TimezoneUnresolvedReason,
): TimezoneResolution {
  const conflict = reason === 'HISTORICAL_SOURCE_CONFLICT';
  const unresolvedReason =
    reason === 'UNSUPPORTED_ZONE'
      ? 'UNSUPPORTED_ZONE'
      : reason === 'OUTSIDE_SUPPORTED_RANGE'
        ? 'OUTSIDE_SUPPORTED_RANGE'
        : conflict
          ? 'SOURCE_CONFLICT_REQUIRES_RULE'
          : 'TIME_UNRESOLVED';
  return {
    status: 'UNRESOLVED',
    ianaZone,
    reason,
    timezoneDataVersion: artifact.manifest.artifactVersion,
    historicalProvenance: historicalProvenance(
      artifact,
      conflict ? 'SOURCE_CONFLICT' : 'UNRESOLVED',
      conflict ? 'CONFLICT' : 'NOT_VERIFIED',
      unresolvedReason,
    ),
    provenance: resolutionProvenance(artifact),
  };
}

function localEpochSeconds(value: CivilLocalDateTime): number {
  const day = gregorianToCivilDayOrdinal(value.date) - UNIX_EPOCH_ORDINAL;
  return (
    day * SECONDS_PER_DAY +
    value.time.hour * 3_600 +
    value.time.minute * 60 +
    (value.time.second ?? 0)
  );
}

function epochSecondsToCivilLocal(value: number): CivilLocalDateTime {
  const day = Math.floor(value / SECONDS_PER_DAY);
  const secondOfDay = value - day * SECONDS_PER_DAY;
  return {
    date: civilDayOrdinalToGregorian(UNIX_EPOCH_ORDINAL + day),
    time: {
      hour: Math.floor(secondOfDay / 3_600),
      minute: Math.floor((secondOfDay % 3_600) / 60),
      second: secondOfDay % 60,
    },
  };
}

function candidate(
  localSeconds: number,
  state: HistoricalTimezoneState,
): HistoricalUtcCandidate {
  return {
    utcEpochSeconds: localSeconds - state.totalOffsetSeconds,
    totalOffsetSeconds: state.totalOffsetSeconds,
    dstOffsetSeconds: state.dstOffsetSeconds,
    isDst: state.dstOffsetSeconds !== 0,
    designation: state.designation,
  };
}

function candidatesForLocal(
  artifact: HistoricalTimezoneArtifact,
  localSeconds: number,
): HistoricalUtcCandidate[] {
  const values: HistoricalUtcCandidate[] = [];
  let state = artifact.manifest.initialState;
  let utcStart = Number.NEGATIVE_INFINITY;
  for (const transition of artifact.transitions) {
    const value = candidate(localSeconds, state);
    if (
      value.utcEpochSeconds >= utcStart &&
      value.utcEpochSeconds < transition.utcEpochSeconds
    ) {
      values.push(value);
    }
    state = transition.after;
    utcStart = transition.utcEpochSeconds;
  }
  const value = candidate(localSeconds, state);
  if (value.utcEpochSeconds >= utcStart) values.push(value);
  return values.sort((left, right) => left.utcEpochSeconds - right.utcEpochSeconds);
}

function findGap(
  artifact: HistoricalTimezoneArtifact,
  localSeconds: number,
) {
  return artifact.transitions.find((transition) => {
    const before = transition.utcEpochSeconds + transition.before.totalOffsetSeconds;
    const after = transition.utcEpochSeconds + transition.after.totalOffsetSeconds;
    return after > before && localSeconds >= before && localSeconds < after;
  });
}

function officialCrossChecksMatch(artifact: HistoricalTimezoneArtifact): boolean {
  if (artifact.manifest.officialCrossChecks.length !== 4) return false;
  return artifact.manifest.officialCrossChecks.every((fixture) => {
    const transition = artifact.transitions.find(
      (item) => item.utcEpochSeconds === fixture.transitionUtcEpochSeconds,
    );
    if (!transition || fixture.comparison !== 'MATCH') return false;
    const isStart = fixture.id.endsWith('_START');
    const offsetDelta =
      transition.after.totalOffsetSeconds - transition.before.totalOffsetSeconds;
    const dstDelta =
      transition.after.dstOffsetSeconds - transition.before.dstOffsetSeconds;
    if (
      (isStart && (offsetDelta !== 3_600 || dstDelta !== 3_600)) ||
      (!isStart && (offsetDelta !== -3_600 || dstDelta !== -3_600))
    ) return false;
    const legalLocal =
      transition.utcEpochSeconds + transition.before.totalOffsetSeconds;
    const parsed = fixture.legalLocalDateTime.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
    );
    if (!parsed) return false;
    return (
      localEpochSeconds({
        date: { year: Number(parsed[1]), month: Number(parsed[2]), day: Number(parsed[3]) },
        time: { hour: Number(parsed[4]), minute: Number(parsed[5]), second: Number(parsed[6]) },
      }) === legalLocal
    );
  });
}

function artifactStructureIsValid(artifact: HistoricalTimezoneArtifact): boolean {
  if (
    artifact.manifest.schemaVersion !==
      'deokbunai.historical-timezone-artifact.v1' ||
    artifact.manifest.artifactVersion !==
      'iana.tzdb.2026c.asia-seoul.1970-2050.v1' ||
    artifact.manifest.tzdbVersion !== '2026c' ||
    artifact.manifest.zoneId !== 'Asia/Seoul' ||
    artifact.manifest.artifactChecksum.algorithm !== 'SHA-256' ||
    artifact.manifest.artifactChecksum.value !==
      ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256 ||
    artifact.transitions.length !== 4
  ) return false;
  let previous = artifact.manifest.initialState;
  let previousEpoch = Number.NEGATIVE_INFINITY;
  for (const transition of artifact.transitions) {
    if (
      transition.utcEpochSeconds <= previousEpoch ||
      transition.before.totalOffsetSeconds !== previous.totalOffsetSeconds ||
      transition.before.dstOffsetSeconds !== previous.dstOffsetSeconds ||
      transition.before.designation !== previous.designation
    ) return false;
    previous = transition.after;
    previousEpoch = transition.utcEpochSeconds;
  }
  return true;
}

export function createAsiaSeoulHistoricalTimezoneResolver(
  artifact: HistoricalTimezoneArtifact = ASIA_SEOUL_TZDB_2026C_ARTIFACT,
): HistoricalTimezoneResolver {
  return {
    async resolve(
      request: HistoricalTimezoneResolutionRequest,
    ): Promise<TimezoneResolution> {
      if (request.ianaZone !== artifact.manifest.zoneId) {
        return unresolved(artifact, request.ianaZone, 'UNSUPPORTED_ZONE');
      }
      if (
        request.civilLocal.accuracy !== 'EXACT' ||
        compareGregorianDates(
          request.civilLocal.date,
          artifact.manifest.supportedRange.start,
        ) < 0 ||
        compareGregorianDates(
          request.civilLocal.date,
          artifact.manifest.supportedRange.end,
        ) > 0
      ) {
        return unresolved(artifact, request.ianaZone, 'OUTSIDE_SUPPORTED_RANGE');
      }
      if (!artifactStructureIsValid(artifact)) {
        return unresolved(
          artifact,
          request.ianaZone,
          'HISTORICAL_DATA_UNAVAILABLE',
        );
      }
      if (!officialCrossChecksMatch(artifact)) {
        return unresolved(
          artifact,
          request.ianaZone,
          'HISTORICAL_SOURCE_CONFLICT',
        );
      }

      const local = {
        date: request.civilLocal.date,
        time: request.civilLocal.time,
      };
      const localSeconds = localEpochSeconds(local);
      const candidates = candidatesForLocal(artifact, localSeconds);
      const shared = {
        status: 'RESOLVED' as const,
        ianaZone: artifact.manifest.zoneId,
        timezoneDataVersion: artifact.manifest.artifactVersion,
        resolutionSource: 'ENGINE' as const,
        historicalProvenance: historicalProvenance(
          artifact,
          'OFFICIAL_SOURCE_VERIFIED',
          'MATCH',
        ),
        provenance: resolutionProvenance(artifact),
      };

      if (candidates.length === 1) {
        const resolved = candidates[0];
        const dstProvenance = resolutionProvenance(artifact);
        return {
          ...shared,
          resolvedOffsetSeconds: resolved.totalOffsetSeconds,
          resolvedOffsetMinutes: resolved.totalOffsetSeconds / 60,
          dst:
            resolved.dstOffsetSeconds === 0
              ? {
                  status: 'NOT_OBSERVED',
                  dstOffsetSeconds: 0,
                  provenance: dstProvenance,
                }
              : {
                  status: 'OBSERVED',
                  dstOffsetSeconds: resolved.dstOffsetSeconds,
                  offsetMinutes: resolved.dstOffsetSeconds / 60,
                  provenance: dstProvenance,
                },
          localTimeResolution: { kind: 'UNIQUE', candidate: resolved },
        };
      }
      if (candidates.length >= 2) {
        return {
          ...shared,
          localTimeResolution: {
            kind: 'AMBIGUOUS',
            candidates: candidates as [
              HistoricalUtcCandidate,
              HistoricalUtcCandidate,
              ...HistoricalUtcCandidate[],
            ],
          },
        };
      }

      const gap = findGap(artifact, localSeconds);
      if (!gap) {
        return unresolved(artifact, request.ianaZone, 'HISTORICAL_DATA_UNAVAILABLE');
      }
      return {
        ...shared,
        localTimeResolution: {
          kind: 'NONEXISTENT',
          gap: {
            startLocalDateTime: epochSecondsToCivilLocal(
              gap.utcEpochSeconds + gap.before.totalOffsetSeconds,
            ),
            endLocalDateTime: epochSecondsToCivilLocal(
              gap.utcEpochSeconds + gap.after.totalOffsetSeconds,
            ),
            transitionUtcEpochSeconds: gap.utcEpochSeconds,
            offsetBeforeSeconds: gap.before.totalOffsetSeconds,
            offsetAfterSeconds: gap.after.totalOffsetSeconds,
            dstOffsetBeforeSeconds: gap.before.dstOffsetSeconds,
            dstOffsetAfterSeconds: gap.after.dstOffsetSeconds,
            designationBefore: gap.before.designation,
            designationAfter: gap.after.designation,
          },
        },
      };
    },
  };
}

export const ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER =
  createAsiaSeoulHistoricalTimezoneResolver();
