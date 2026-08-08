import type { LocalDate } from '../domain/time';
import {
  addGregorianDays,
  compareGregorianDates,
  gregorianToCivilDayOrdinal,
  isValidGregorianDate,
} from './civilDay';
import type {
  CalendarDataset,
  CalendarOperationResult,
  CalendarResolutionError,
  LunarMonthKind,
  LunarMonthRecord,
  ResolvedGregorianToLunar,
  ResolvedLunarToGregorian,
} from './contracts';

function failure<T>(error: CalendarResolutionError): CalendarOperationResult<T> {
  return { success: false, errors: [error] };
}

function isInGregorianRange(
  date: LocalDate,
  range: { start: LocalDate; end: LocalDate },
): boolean {
  return compareGregorianDates(date, range.start) >= 0 && compareGregorianDates(date, range.end) <= 0;
}

function findMonthAtGregorianDate(
  records: readonly LunarMonthRecord[],
  dateOrdinal: number,
): LunarMonthRecord | undefined {
  let low = 0;
  let high = records.length - 1;
  let candidate: LunarMonthRecord | undefined;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const record = records[middle];
    const start = gregorianToCivilDayOrdinal(record.gregorianStartDate);
    if (start <= dateOrdinal) {
      candidate = record;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  if (!candidate) {
    return undefined;
  }
  const start = gregorianToCivilDayOrdinal(candidate.gregorianStartDate);
  return dateOrdinal < start + candidate.lengthDays ? candidate : undefined;
}

export function resolveGregorianToLunar(
  date: LocalDate,
  dataset: CalendarDataset,
): CalendarOperationResult<ResolvedGregorianToLunar> {
  if (!isValidGregorianDate(date)) {
    return failure({ code: 'INVALID_GREGORIAN_DATE', path: 'gregorianDate' });
  }
  if (!isInGregorianRange(date, dataset.manifest.supportedGregorianRange)) {
    return failure({ code: 'UNSUPPORTED_GREGORIAN_RANGE', path: 'gregorianDate' });
  }

  const dateOrdinal = gregorianToCivilDayOrdinal(date);
  const record = findMonthAtGregorianDate(dataset.records, dateOrdinal);
  if (!record) {
    return failure({ code: 'DATASET_HOLE', path: 'dataset.records' });
  }

  const lunarDay =
    dateOrdinal - gregorianToCivilDayOrdinal(record.gregorianStartDate) + 1;
  return {
    success: true,
    value: {
      gregorianDate: date,
      lunarDate: {
        year: record.lunarYear,
        month: record.lunarMonth,
        day: lunarDay,
        lunarMonthKind: record.lunarMonthKind,
      },
      datasetVersion: dataset.manifest.datasetVersion,
      conversionRuleVersion: dataset.manifest.conversionRuleVersion,
    },
  };
}

function findLunarMonth(
  records: readonly LunarMonthRecord[],
  year: number,
  month: number,
  kind: LunarMonthKind,
): LunarMonthRecord | undefined {
  return records.find(
    (record) =>
      record.lunarYear === year &&
      record.lunarMonth === month &&
      record.lunarMonthKind === kind,
  );
}

function findLunarMonthIndex(
  records: readonly LunarMonthRecord[],
  year: number,
  month: number,
  kind: LunarMonthKind,
): number {
  return records.findIndex(
    (record) =>
      record.lunarYear === year &&
      record.lunarMonth === month &&
      record.lunarMonthKind === kind,
  );
}

export function resolveLunarToGregorian(
  date: LocalDate & { lunarMonthKind: LunarMonthKind },
  dataset: CalendarDataset,
): CalendarOperationResult<ResolvedLunarToGregorian> {
  if (
    !Number.isInteger(date.year) ||
    !Number.isInteger(date.month) ||
    !Number.isInteger(date.day) ||
    date.month < 1 ||
    date.month > 12 ||
    date.day < 1
  ) {
    return failure({ code: 'INVALID_LUNAR_DATE', path: 'lunarDate' });
  }
  if (date.lunarMonthKind !== 'REGULAR' && date.lunarMonthKind !== 'LEAP') {
    return failure({ code: 'INVALID_LUNAR_MONTH_KIND', path: 'lunarDate.lunarMonthKind' });
  }

  const record = findLunarMonth(dataset.records, date.year, date.month, date.lunarMonthKind);
  if (!record) {
    const code = date.lunarMonthKind === 'LEAP' ? 'LEAP_MONTH_NOT_PRESENT' : 'DATASET_HOLE';
    return failure({ code, path: 'dataset.records' });
  }
  if (date.day > record.lengthDays) {
    return failure({
      code: 'DAY_EXCEEDS_MONTH_LENGTH',
      path: 'lunarDate.day',
      details: { lengthDays: record.lengthDays },
    });
  }

  const lunarRange = dataset.manifest.supportedLunarRange;
  const inputIndex = findLunarMonthIndex(
    dataset.records,
    date.year,
    date.month,
    date.lunarMonthKind,
  );
  const startIndex = findLunarMonthIndex(
    dataset.records,
    lunarRange.start.lunarYear,
    lunarRange.start.lunarMonth,
    lunarRange.start.lunarMonthKind,
  );
  const endIndex = findLunarMonthIndex(
    dataset.records,
    lunarRange.end.lunarYear,
    lunarRange.end.lunarMonth,
    lunarRange.end.lunarMonthKind,
  );
  if (startIndex < 0 || endIndex < 0) {
    return failure({ code: 'DATASET_CORRUPTION', path: 'manifest.supportedLunarRange' });
  }
  if (
    inputIndex < startIndex ||
    inputIndex > endIndex ||
    (inputIndex === startIndex && date.day < lunarRange.start.lunarDay) ||
    (inputIndex === endIndex && date.day > lunarRange.end.lunarDay)
  ) {
    return failure({ code: 'UNSUPPORTED_LUNAR_RANGE', path: 'lunarDate' });
  }

  const gregorianDate = addGregorianDays(record.gregorianStartDate, date.day - 1);
  if (!isInGregorianRange(gregorianDate, dataset.manifest.supportedGregorianRange)) {
    return failure({ code: 'UNSUPPORTED_GREGORIAN_RANGE', path: 'gregorianDate' });
  }
  return {
    success: true,
    value: {
      lunarDate: date,
      gregorianDate,
      datasetVersion: dataset.manifest.datasetVersion,
      conversionRuleVersion: dataset.manifest.conversionRuleVersion,
    },
  };
}
