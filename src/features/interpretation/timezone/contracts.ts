import type { LocalDate } from '../domain/time';

export type TimezoneArtifactChecksum = {
  algorithm: 'SHA-256';
  value: string;
};

export type HistoricalTimezoneState = {
  totalOffsetSeconds: number;
  dstOffsetSeconds: number;
  designation: string;
};

export type HistoricalTimezoneTransition = {
  utcEpochSeconds: number;
  before: HistoricalTimezoneState;
  after: HistoricalTimezoneState;
};

export type HistoricalTimezoneOfficialCrossCheck = {
  id: string;
  transitionUtcEpochSeconds: number;
  legalLocalDateTime: string;
  sourceAuthority: string;
  sourceDocumentId: string;
  sourceUrl: string;
  comparison: 'MATCH';
};

export type HistoricalTimezoneArtifactManifest = {
  schemaVersion: string;
  artifactVersion: string;
  tzdbVersion: string;
  zoneId: 'Asia/Seoul';
  supportedRange: {
    start: LocalDate;
    end: LocalDate;
  };
  source: {
    identity: string;
    revision: string;
    url: string;
  };
  acquisitionBuildDate: string;
  artifactChecksum: TimezoneArtifactChecksum;
  resolverRuleVersion: string;
  initialState: HistoricalTimezoneState;
  officialCrossChecks: readonly HistoricalTimezoneOfficialCrossCheck[];
};

export type HistoricalTimezoneArtifact = {
  manifest: HistoricalTimezoneArtifactManifest;
  transitions: readonly HistoricalTimezoneTransition[];
};
