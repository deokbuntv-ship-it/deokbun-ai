import { compareGregorianDates, addGregorianDays, isValidGregorianDate } from './civilDay';
import { resolveGregorianToLunar, resolveLunarToGregorian } from './resolver';
import type {
  CalendarDataset,
  CalendarIntegrityReport,
  CalendarResolutionError,
  LunarMonthRecord,
} from './contracts';

function lunarKey(record: LunarMonthRecord): string {
  return `${record.lunarYear}:${record.lunarMonth}:${record.lunarMonthKind}`;
}

export function validateCalendarDataset(dataset: CalendarDataset): CalendarIntegrityReport {
  const errors: CalendarResolutionError[] = [];
  const lunarKeys = new Set<string>();
  const gregorianStarts = new Set<string>();
  const regularMonthsByYear = new Map<number, Set<number>>();
  const leapMonthsByYear = new Map<number, number[]>();

  if (dataset.manifest.recordCount !== dataset.records.length) {
    errors.push({
      code: 'DATASET_CORRUPTION',
      path: 'manifest.recordCount',
      details: {
        declared: dataset.manifest.recordCount,
        actual: dataset.records.length,
      },
    });
  }

  const manifestStrings = [
    dataset.manifest.schemaVersion,
    dataset.manifest.datasetVersion,
    dataset.manifest.source.identity,
    dataset.manifest.source.revision,
    dataset.manifest.source.acquisitionDate,
    dataset.manifest.artifactChecksum.algorithm,
    dataset.manifest.artifactChecksum.value,
    dataset.manifest.conversionRuleVersion,
  ];
  if (manifestStrings.some((value) => value.trim().length === 0)) {
    errors.push({ code: 'DATASET_CORRUPTION', path: 'manifest' });
  }

  dataset.records.forEach((record, index) => {
    const key = lunarKey(record);
    if (lunarKeys.has(key)) {
      errors.push({ code: 'DUPLICATE_MAPPING', path: `records[${index}]` });
    }
    lunarKeys.add(key);

    const gregorianKey = `${record.gregorianStartDate.year}-${record.gregorianStartDate.month}-${record.gregorianStartDate.day}`;
    if (gregorianStarts.has(gregorianKey)) {
      errors.push({ code: 'DUPLICATE_MAPPING', path: `records[${index}].gregorianStartDate` });
    }
    gregorianStarts.add(gregorianKey);

    if (
      !Number.isInteger(record.lunarYear) ||
      !Number.isInteger(record.lunarMonth) ||
      record.lunarMonth < 1 ||
      record.lunarMonth > 12 ||
      !isValidGregorianDate(record.gregorianStartDate) ||
      (record.lengthDays !== 29 && record.lengthDays !== 30)
    ) {
      errors.push({ code: 'DATASET_CORRUPTION', path: `records[${index}]` });
    }

    if (record.lunarMonthKind === 'REGULAR') {
      const months = regularMonthsByYear.get(record.lunarYear) ?? new Set<number>();
      months.add(record.lunarMonth);
      regularMonthsByYear.set(record.lunarYear, months);
    } else {
      const months = leapMonthsByYear.get(record.lunarYear) ?? [];
      months.push(record.lunarMonth);
      leapMonthsByYear.set(record.lunarYear, months);
    }

    if (index > 0) {
      const previous = dataset.records[index - 1];
      const expectedStart = addGregorianDays(previous.gregorianStartDate, previous.lengthDays);
      const comparison = compareGregorianDates(record.gregorianStartDate, previous.gregorianStartDate);
      if (comparison <= 0) {
        errors.push({ code: 'DATASET_CORRUPTION', path: `records[${index}].gregorianStartDate` });
      } else if (compareGregorianDates(record.gregorianStartDate, expectedStart) !== 0) {
        errors.push({ code: 'DATASET_HOLE', path: `records[${index}].gregorianStartDate` });
      }

      const followsWithLeapOccurrence =
        previous.lunarMonthKind === 'REGULAR' &&
        record.lunarMonthKind === 'LEAP' &&
        record.lunarYear === previous.lunarYear &&
        record.lunarMonth === previous.lunarMonth;
      const expectedNextMonth = previous.lunarMonth === 12 ? 1 : previous.lunarMonth + 1;
      const expectedNextYear =
        previous.lunarMonth === 12 ? previous.lunarYear + 1 : previous.lunarYear;
      const followsWithNextRegularMonth =
        record.lunarMonthKind === 'REGULAR' &&
        record.lunarYear === expectedNextYear &&
        record.lunarMonth === expectedNextMonth;
      if (!followsWithLeapOccurrence && !followsWithNextRegularMonth) {
        errors.push({ code: 'DATASET_CORRUPTION', path: `records[${index}]` });
      }
    }
  });

  const lunarYears = [...regularMonthsByYear.keys()].sort((left, right) => left - right);
  const firstLunarYear = lunarYears[0];
  const lastLunarYear = lunarYears[lunarYears.length - 1];
  regularMonthsByYear.forEach((months, year) => {
    const orderedMonths = [...months].sort((left, right) => left - right);
    const isCompleteYear = orderedMonths.length === 12 &&
      orderedMonths.every((month, index) => month === index + 1);
    const isLeadingBoundary =
      year === firstLunarYear &&
      orderedMonths.every((month, index) => month === 12 - orderedMonths.length + index + 1);
    const isTrailingBoundary =
      year === lastLunarYear &&
      orderedMonths.every((month, index) => month === index + 1);
    if (!isCompleteYear && !isLeadingBoundary && !isTrailingBoundary) {
      errors.push({
        code: 'DATASET_CORRUPTION',
        path: 'records',
        details: { lunarYear: year, regularMonthCount: months.size },
      });
    }
  });
  leapMonthsByYear.forEach((months, year) => {
    if (months.length > 1 || !regularMonthsByYear.get(year)?.has(months[0])) {
      errors.push({
        code: 'DATASET_CORRUPTION',
        path: 'records',
        details: { lunarYear: year, leapMonthCount: months.length },
      });
    }
  });

  dataset.records.forEach((record, index) => {
    if (record.lunarMonthKind !== 'LEAP') {
      return;
    }
    const previous = dataset.records[index - 1];
    if (
      !previous ||
      previous.lunarYear !== record.lunarYear ||
      previous.lunarMonth !== record.lunarMonth ||
      previous.lunarMonthKind !== 'REGULAR'
    ) {
      errors.push({ code: 'DATASET_CORRUPTION', path: `records[${index}].lunarMonthKind` });
    }
  });

  const firstRecord = dataset.records[0];
  const lastRecord = dataset.records[dataset.records.length - 1];
  if (!firstRecord || !lastRecord) {
    errors.push({ code: 'DATASET_CORRUPTION', path: 'records' });
  } else {
    const artifactEnd = addGregorianDays(lastRecord.gregorianStartDate, lastRecord.lengthDays - 1);
    if (
      compareGregorianDates(firstRecord.gregorianStartDate, dataset.manifest.artifactCoverageRange.start) !== 0 ||
      compareGregorianDates(artifactEnd, dataset.manifest.artifactCoverageRange.end) !== 0 ||
      compareGregorianDates(dataset.manifest.supportedGregorianRange.start, dataset.manifest.artifactCoverageRange.start) < 0 ||
      compareGregorianDates(dataset.manifest.supportedGregorianRange.end, dataset.manifest.artifactCoverageRange.end) > 0
    ) {
      errors.push({ code: 'DATASET_CORRUPTION', path: 'manifest.artifactCoverageRange' });
    }
  }

  for (const record of dataset.records) {
    for (let lunarDay = 1; lunarDay <= record.lengthDays; lunarDay += 1) {
      const lunar = {
        year: record.lunarYear,
        month: record.lunarMonth,
        day: lunarDay,
        lunarMonthKind: record.lunarMonthKind,
      } as const;
      const gregorianDate = addGregorianDays(record.gregorianStartDate, lunarDay - 1);
      if (
        compareGregorianDates(gregorianDate, dataset.manifest.supportedGregorianRange.start) < 0 ||
        compareGregorianDates(gregorianDate, dataset.manifest.supportedGregorianRange.end) > 0
      ) {
        continue;
      }
      const toGregorian = resolveLunarToGregorian(lunar, dataset);
      if (!toGregorian.success) {
        errors.push({ code: 'ROUND_TRIP_MISMATCH', path: 'records' });
        continue;
      }
      const backToLunar = resolveGregorianToLunar(toGregorian.value.gregorianDate, dataset);
      if (
        !backToLunar.success ||
        backToLunar.value.lunarDate.year !== lunar.year ||
        backToLunar.value.lunarDate.month !== lunar.month ||
        backToLunar.value.lunarDate.day !== lunar.day ||
        backToLunar.value.lunarDate.lunarMonthKind !== lunar.lunarMonthKind
      ) {
        errors.push({ code: 'ROUND_TRIP_MISMATCH', path: 'records' });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
