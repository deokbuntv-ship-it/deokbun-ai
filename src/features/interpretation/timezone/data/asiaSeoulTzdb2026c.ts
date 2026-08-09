import type { HistoricalTimezoneArtifact } from '../contracts';

export const ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256 =
  'f1e0e984cf35814e0f0ab9b1f0d4d39d9e037a61751135ba1deae0b060e56842' as const;

/**
 * Compact, immutable production subset derived from IANA tzdb 2026c.
 * Runtime code depends only on this artifact, never on OS tzdata or network I/O.
 * The checksum covers the canonical JSON of the computational payload generated
 * by acquisition/buildAsiaSeoulTzdb2026cArtifact.py.
 */
export const ASIA_SEOUL_TZDB_2026C_ARTIFACT = {
  manifest: {
    schemaVersion: 'deokbunai.historical-timezone-artifact.v1',
    artifactVersion: 'iana.tzdb.2026c.asia-seoul.1970-2050.v1',
    tzdbVersion: '2026c',
    zoneId: 'Asia/Seoul',
    supportedRange: {
      start: { year: 1970, month: 1, day: 1 },
      end: { year: 2050, month: 12, day: 31 },
    },
    source: {
      identity: 'IANA_TIME_ZONE_DATABASE',
      revision: 'tzdb-2026c',
      url: 'https://data.iana.org/time-zones/releases/tzdata2026c.tar.gz',
    },
    acquisitionBuildDate: '2026-08-09',
    artifactChecksum: {
      algorithm: 'SHA-256',
      value: ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256,
    },
    resolverRuleVersion: 'deokbunai.historical-timezone-resolver.v1',
    initialState: {
      totalOffsetSeconds: 32_400,
      dstOffsetSeconds: 0,
      designation: 'KST',
    },
    officialCrossChecks: [
      {
        id: 'ROK_DST_1987_START',
        transitionUtcEpochSeconds: 547_578_000,
        legalLocalDateTime: '1987-05-10T02:00:00',
        sourceAuthority: '대한민국 국가법령정보센터',
        sourceDocumentId: '대통령령 제12136호',
        sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990',
        comparison: 'MATCH',
      },
      {
        id: 'ROK_DST_1987_END',
        transitionUtcEpochSeconds: 560_883_600,
        legalLocalDateTime: '1987-10-11T03:00:00',
        sourceAuthority: '대한민국 국가법령정보센터',
        sourceDocumentId: '대통령령 제12136호',
        sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990',
        comparison: 'MATCH',
      },
      {
        id: 'ROK_DST_1988_START',
        transitionUtcEpochSeconds: 579_027_600,
        legalLocalDateTime: '1988-05-08T02:00:00',
        sourceAuthority: '대한민국 국가법령정보센터',
        sourceDocumentId: '대통령령 제12136호',
        sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990',
        comparison: 'MATCH',
      },
      {
        id: 'ROK_DST_1988_END',
        transitionUtcEpochSeconds: 592_333_200,
        legalLocalDateTime: '1988-10-09T03:00:00',
        sourceAuthority: '대한민국 국가법령정보센터',
        sourceDocumentId: '대통령령 제12136호',
        sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990',
        comparison: 'MATCH',
      },
    ],
  },
  transitions: [
    {
      utcEpochSeconds: 547_578_000,
      before: { totalOffsetSeconds: 32_400, dstOffsetSeconds: 0, designation: 'KST' },
      after: { totalOffsetSeconds: 36_000, dstOffsetSeconds: 3_600, designation: 'KDT' },
    },
    {
      utcEpochSeconds: 560_883_600,
      before: { totalOffsetSeconds: 36_000, dstOffsetSeconds: 3_600, designation: 'KDT' },
      after: { totalOffsetSeconds: 32_400, dstOffsetSeconds: 0, designation: 'KST' },
    },
    {
      utcEpochSeconds: 579_027_600,
      before: { totalOffsetSeconds: 32_400, dstOffsetSeconds: 0, designation: 'KST' },
      after: { totalOffsetSeconds: 36_000, dstOffsetSeconds: 3_600, designation: 'KDT' },
    },
    {
      utcEpochSeconds: 592_333_200,
      before: { totalOffsetSeconds: 36_000, dstOffsetSeconds: 3_600, designation: 'KDT' },
      after: { totalOffsetSeconds: 32_400, dstOffsetSeconds: 0, designation: 'KST' },
    },
  ],
} as const satisfies HistoricalTimezoneArtifact;
