import type { LocalClockTime, LocalDate } from '../../domain/time';
import type { TimezoneUnresolvedReason } from '../../contracts/normalization';

export type AsiaSeoulGoldenFixture = {
  id: string;
  ianaZone: string;
  date: LocalDate;
  time: Required<LocalClockTime>;
  expected:
    | { status: 'RESOLVED'; kind: 'UNIQUE'; totalOffsetSeconds: number; dstOffsetSeconds: number }
    | { status: 'RESOLVED'; kind: 'AMBIGUOUS'; candidateCount: 2 }
    | { status: 'RESOLVED'; kind: 'NONEXISTENT' }
    | { status: 'UNRESOLVED'; reason: TimezoneUnresolvedReason };
};

export const ASIA_SEOUL_GOLDEN_FIXTURES = [
  {
    id: 'MODERN_UNIQUE',
    ianaZone: 'Asia/Seoul',
    date: { year: 2025, month: 1, day: 15 },
    time: { hour: 12, minute: 0, second: 0 },
    expected: { status: 'RESOLVED', kind: 'UNIQUE', totalOffsetSeconds: 32_400, dstOffsetSeconds: 0 },
  },
  {
    id: 'DST_1987_START_GAP',
    ianaZone: 'Asia/Seoul',
    date: { year: 1987, month: 5, day: 10 },
    time: { hour: 2, minute: 30, second: 0 },
    expected: { status: 'RESOLVED', kind: 'NONEXISTENT' },
  },
  {
    id: 'DST_1987_END_OVERLAP',
    ianaZone: 'Asia/Seoul',
    date: { year: 1987, month: 10, day: 11 },
    time: { hour: 2, minute: 30, second: 0 },
    expected: { status: 'RESOLVED', kind: 'AMBIGUOUS', candidateCount: 2 },
  },
  {
    id: 'DST_1987_UNIQUE',
    ianaZone: 'Asia/Seoul',
    date: { year: 1987, month: 7, day: 1 },
    time: { hour: 12, minute: 0, second: 0 },
    expected: { status: 'RESOLVED', kind: 'UNIQUE', totalOffsetSeconds: 36_000, dstOffsetSeconds: 3_600 },
  },
  {
    id: 'DST_1988_START_GAP',
    ianaZone: 'Asia/Seoul',
    date: { year: 1988, month: 5, day: 8 },
    time: { hour: 2, minute: 30, second: 0 },
    expected: { status: 'RESOLVED', kind: 'NONEXISTENT' },
  },
  {
    id: 'DST_1988_END_OVERLAP',
    ianaZone: 'Asia/Seoul',
    date: { year: 1988, month: 10, day: 9 },
    time: { hour: 2, minute: 30, second: 0 },
    expected: { status: 'RESOLVED', kind: 'AMBIGUOUS', candidateCount: 2 },
  },
  {
    id: 'NO_DST_1989',
    ianaZone: 'Asia/Seoul',
    date: { year: 1989, month: 5, day: 14 },
    time: { hour: 2, minute: 30, second: 0 },
    expected: { status: 'RESOLVED', kind: 'UNIQUE', totalOffsetSeconds: 32_400, dstOffsetSeconds: 0 },
  },
  {
    id: 'SUPPORTED_START',
    ianaZone: 'Asia/Seoul',
    date: { year: 1970, month: 1, day: 1 },
    time: { hour: 0, minute: 0, second: 0 },
    expected: { status: 'RESOLVED', kind: 'UNIQUE', totalOffsetSeconds: 32_400, dstOffsetSeconds: 0 },
  },
  {
    id: 'SUPPORTED_END',
    ianaZone: 'Asia/Seoul',
    date: { year: 2050, month: 12, day: 31 },
    time: { hour: 23, minute: 59, second: 59 },
    expected: { status: 'RESOLVED', kind: 'UNIQUE', totalOffsetSeconds: 32_400, dstOffsetSeconds: 0 },
  },
  {
    id: 'PRE_1970_REJECTED',
    ianaZone: 'Asia/Seoul',
    date: { year: 1969, month: 12, day: 31 },
    time: { hour: 23, minute: 59, second: 59 },
    expected: { status: 'UNRESOLVED', reason: 'OUTSIDE_SUPPORTED_RANGE' },
  },
  {
    id: 'UNSUPPORTED_ZONE',
    ianaZone: 'Asia/Pyongyang',
    date: { year: 2025, month: 1, day: 15 },
    time: { hour: 12, minute: 0, second: 0 },
    expected: { status: 'UNRESOLVED', reason: 'UNSUPPORTED_ZONE' },
  },
] as const satisfies readonly AsiaSeoulGoldenFixture[];
