import type { LocalClockTime, LocalDate } from '../domain/time';

type HistoricalCivilLocalDateTime = {
  date: LocalDate;
  time: LocalClockTime;
};

export type HistoricalAuthorityStatus =
  | 'OFFICIAL_SOURCE_VERIFIED'
  | 'TZDB_HISTORICAL_UNCERTAIN'
  | 'SOURCE_CONFLICT'
  | 'UNRESOLVED';

export type HistoricalSourceReference = {
  authority: string;
  documentId: string;
  sourceUrl?: string;
  publicationDate?: string;
  effectiveLocalTime?: string;
  sourceChecksum?: string;
};

export type HistoricalSourceComparison =
  | 'MATCH'
  | 'CONFLICT'
  | 'NOT_VERIFIED';

export type HistoricalTimeUnresolvedReason =
  | 'ZONE_NOT_FOUND'
  | 'UNSUPPORTED_ZONE'
  | 'OUTSIDE_SUPPORTED_RANGE'
  | 'HISTORICAL_DATA_UNAVAILABLE'
  | 'OFFICIAL_SOURCE_REQUIRED'
  | 'LMT_NOT_AUTHORIZED'
  | 'SOURCE_CONFLICT_REQUIRES_RULE'
  | 'TIME_UNRESOLVED';

export type HistoricalTimeProvenance = {
  authorityStatus: HistoricalAuthorityStatus;
  tzdbVersion?: string;
  tzdbZone?: string;
  /** Ordered by authority, then documentId, for deterministic serialization. */
  officialSources: readonly HistoricalSourceReference[];
  ruleSetVersion: string;
  comparison: HistoricalSourceComparison;
  jurisdiction: string;
  applicableRegion: string;
  sourceIdentity?: string;
  sourceRevision?: string;
  supportedRange?: {
    startLocalDate: string;
    endLocalDate: string;
  };
  unresolvedReason?: HistoricalTimeUnresolvedReason;
};

export type HistoricalUtcCandidate = {
  utcEpochSeconds: number;
  totalOffsetSeconds: number;
  dstOffsetSeconds: number;
  isDst: boolean;
  designation?: string;
};

export type HistoricalLocalTimeResolution =
  | {
      kind: 'UNIQUE';
      candidate: HistoricalUtcCandidate;
    }
  | {
      kind: 'AMBIGUOUS';
      /** Candidates must be ordered by utcEpochSeconds ascending. */
      candidates: readonly [
        HistoricalUtcCandidate,
        HistoricalUtcCandidate,
        ...HistoricalUtcCandidate[],
      ];
    }
  | {
      kind: 'NONEXISTENT';
      gap: {
        startLocalDateTime: HistoricalCivilLocalDateTime;
        endLocalDateTime: HistoricalCivilLocalDateTime;
        transitionUtcEpochSeconds: number;
        offsetBeforeSeconds: number;
        offsetAfterSeconds: number;
        dstOffsetBeforeSeconds: number;
        dstOffsetAfterSeconds: number;
        designationBefore?: string;
        designationAfter?: string;
      };
    }
  | {
      kind: 'UNRESOLVED';
      reason: HistoricalTimeUnresolvedReason;
    };

export type KoreaHistoricalTimePolicyDecision =
  | {
      period: 'BEFORE_STANDARD_TIME';
      beforeLocalDate: '1908-04-01';
      lmtPolicy: 'DO_NOT_APPLY_AUTOMATICALLY';
      unresolvedReason: 'LMT_NOT_AUTHORIZED';
    }
  | {
      period: 'HISTORICAL_CONDITIONAL';
      fromLocalDate: '1908-04-01';
      throughLocalDate: '1969-12-31';
      authorityStatus: HistoricalAuthorityStatus;
    }
  | {
      period: 'TZDB_AUTHORITY';
      fromLocalDate: '1970-01-01';
      authority: 'PINNED_TZDB';
    };
