import {
  civilDayOrdinalToGregorian,
  compareGregorianDates,
  gregorianToCivilDayOrdinal,
  isValidGregorianDate,
} from '../calendar/civilDay';
import { ASIA_SEOUL_TZDB_2026C_ARTIFACT } from '../timezone/data/asiaSeoulTzdb2026c';
import type { HistoricalTimezoneState } from '../timezone/contracts';
import type {
  SolarTermCivilMinute,
  SolarTermDataset,
  SolarTermIntegrityReport,
  SolarTermResolutionError,
} from './contracts';
import { SOLAR_TERM_DEFINITIONS } from './termDefinitions';

const MINUTES_PER_DAY = 1_440;
const UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });
const EXPECTED_START_YEAR = 1969;
const EXPECTED_END_YEAR = 2051;
const EXPECTED_RECORD_COUNT =
  (EXPECTED_END_YEAR - EXPECTED_START_YEAR + 1) * SOLAR_TERM_DEFINITIONS.length;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

function civilMinuteToEpochMinute(value: SolarTermCivilMinute): number {
  return (
    (gregorianToCivilDayOrdinal(value.date) - UNIX_EPOCH_DAY) * MINUTES_PER_DAY +
    value.hour * 60 +
    value.minute
  );
}

function epochMinuteToCivilMinute(value: number): SolarTermCivilMinute {
  const day = Math.floor(value / MINUTES_PER_DAY);
  const minuteOfDay = value - day * MINUTES_PER_DAY;
  return {
    date: civilDayOrdinalToGregorian(UNIX_EPOCH_DAY + day),
    hour: Math.floor(minuteOfDay / 60),
    minute: minuteOfDay % 60,
  };
}

function sameCivilMinute(
  left: SolarTermCivilMinute,
  right: SolarTermCivilMinute,
): boolean {
  return (
    compareGregorianDates(left.date, right.date) === 0 &&
    left.hour === right.hour &&
    left.minute === right.minute
  );
}

function timezoneStateAtUtcMinute(epochMinute: number) {
  const epochSeconds = epochMinute * 60;
  let state: HistoricalTimezoneState =
    ASIA_SEOUL_TZDB_2026C_ARTIFACT.manifest.initialState;
  for (const transition of ASIA_SEOUL_TZDB_2026C_ARTIFACT.transitions) {
    if (epochSeconds < transition.utcEpochSeconds) break;
    state = transition.after;
  }
  return state;
}

function invalidCivilMinute(value: SolarTermCivilMinute): boolean {
  return (
    !isValidGregorianDate(value.date) ||
    !Number.isInteger(value.hour) ||
    !Number.isInteger(value.minute) ||
    value.hour < 0 ||
    value.hour > 23 ||
    value.minute < 0 ||
    value.minute > 59
  );
}

function error(
  errors: SolarTermResolutionError[],
  path: string,
  reason: string,
  details: Record<string, string | number | boolean> = {},
): void {
  errors.push({
    code: 'DATASET_CORRUPTION',
    path,
    details: { reason, ...details },
  });
}

export function validateSolarTermDataset(
  dataset: SolarTermDataset,
): SolarTermIntegrityReport {
  const errors: SolarTermResolutionError[] = [];
  const manifest = dataset.manifest;

  if (manifest.recordCount !== dataset.records.length) {
    error(errors, 'manifest.recordCount', 'RECORD_COUNT_MISMATCH', {
      declared: manifest.recordCount,
      actual: dataset.records.length,
    });
  }
  if (manifest.recordCount !== EXPECTED_RECORD_COUNT) {
    error(errors, 'manifest.recordCount', 'EXPECTED_1969_2051_COVERAGE', {
      expected: EXPECTED_RECORD_COUNT,
      actual: manifest.recordCount,
    });
  }
  if (
    manifest.artifactCoverageRange.start.year !== EXPECTED_START_YEAR ||
    manifest.artifactCoverageRange.start.month !== 1 ||
    manifest.artifactCoverageRange.start.day !== 1 ||
    manifest.artifactCoverageRange.end.year !== EXPECTED_END_YEAR ||
    manifest.artifactCoverageRange.end.month !== 12 ||
    manifest.artifactCoverageRange.end.day !== 31
  ) {
    error(errors, 'manifest.artifactCoverageRange', 'UNEXPECTED_ARTIFACT_RANGE');
  }
  if (
    manifest.supportedBirthRange.start.year !== 1970 ||
    manifest.supportedBirthRange.start.month !== 1 ||
    manifest.supportedBirthRange.start.day !== 1 ||
    manifest.supportedBirthRange.end.year !== 2050 ||
    manifest.supportedBirthRange.end.month !== 12 ||
    manifest.supportedBirthRange.end.day !== 31
  ) {
    error(errors, 'manifest.supportedBirthRange', 'UNEXPECTED_BIRTH_RANGE');
  }
  if (
    manifest.artifactChecksum.algorithm !== 'SHA-256' ||
    !SHA256_PATTERN.test(manifest.artifactChecksum.value)
  ) {
    error(errors, 'manifest.artifactChecksum', 'INVALID_SHA256');
  }
  if (
    manifest.timezoneAuthority.zoneId !== 'Asia/Seoul' ||
    manifest.timezoneAuthority.dataVersion !==
      ASIA_SEOUL_TZDB_2026C_ARTIFACT.manifest.artifactVersion
  ) {
    error(errors, 'manifest.timezoneAuthority', 'TIMEZONE_AUTHORITY_MISMATCH');
  }
  if (
    manifest.approvalStatus === 'APPROVED' &&
    manifest.crossValidation.status !== 'MATCH'
  ) {
    error(errors, 'manifest.crossValidation', 'APPROVED_WITHOUT_SOURCE_MATCH');
  }

  const keys = new Set<string>();
  dataset.records.forEach((record, index) => {
    const path = `records[${index}]`;
    const definition = SOLAR_TERM_DEFINITIONS.find(
      (item) => item.termId === record.termId,
    );
    if (!definition) {
      error(errors, `${path}.termId`, 'UNKNOWN_TERM_ID');
      return;
    }
    const key = `${record.year}:${record.termId}`;
    if (keys.has(key)) {
      errors.push({ code: 'DUPLICATE_TERM', path, details: { year: record.year, termId: record.termId } });
    }
    keys.add(key);
    if (
      record.year < EXPECTED_START_YEAR ||
      record.year > EXPECTED_END_YEAR ||
      record.solarLongitudeDegrees !== definition.solarLongitudeDegrees
    ) {
      error(errors, path, 'TERM_IDENTITY_MISMATCH');
    }

    const source = record.sourceTimestamp;
    if (
      invalidCivilMinute(source.civilMinute) ||
      source.civilMinute.date.year !== record.year ||
      source.timeBasis !== 'KASI_FIXED_KST_UTC_PLUS_09' ||
      source.offsetSeconds !== 32_400 ||
      source.precision !== 'MINUTE' ||
      source.sourceRounding !== 'UNSPECIFIED'
    ) {
      error(errors, `${path}.sourceTimestamp`, 'INVALID_SOURCE_TIMESTAMP');
    } else {
      const expectedUtcMinute = civilMinuteToEpochMinute(source.civilMinute) - 540;
      if (
        record.utcResolution.kind !== 'UTC_MINUTE_LABEL' ||
        record.utcResolution.epochMinute !== expectedUtcMinute ||
        record.utcResolution.precision !== 'MINUTE' ||
        record.utcResolution.sourceRounding !== 'UNSPECIFIED'
      ) {
        error(errors, `${path}.utcResolution`, 'UTC_CONVERSION_MISMATCH');
      }

      const inTimezoneRange = record.year >= 1970 && record.year <= 2050;
      const legal = record.legalCivilResolution;
      if (!inTimezoneRange) {
        if (
          legal.status !== 'UNRESOLVED' ||
          legal.reason !== 'OUTSIDE_PINNED_TIMEZONE_RANGE'
        ) {
          error(errors, `${path}.legalCivilResolution`, 'BOUNDARY_YEAR_MUST_BE_UNRESOLVED');
        }
      } else if (legal.status !== 'RESOLVED') {
        error(errors, `${path}.legalCivilResolution`, 'LEGAL_CIVIL_MUST_RESOLVE');
      } else {
        const state = timezoneStateAtUtcMinute(expectedUtcMinute);
        const expectedLegal = epochMinuteToCivilMinute(
          expectedUtcMinute + state.totalOffsetSeconds / 60,
        );
        if (
          legal.zoneId !== 'Asia/Seoul' ||
          legal.timezoneDataVersion !==
            ASIA_SEOUL_TZDB_2026C_ARTIFACT.manifest.artifactVersion ||
          legal.totalOffsetSeconds !== state.totalOffsetSeconds ||
          legal.dstOffsetSeconds !== state.dstOffsetSeconds ||
          !sameCivilMinute(legal.civilMinute, expectedLegal)
        ) {
          error(errors, `${path}.legalCivilResolution`, 'LEGAL_CIVIL_CONVERSION_MISMATCH');
        }
      }
    }

    if (
      record.provenance.provider !== 'KASI' ||
      record.provenance.operation !== 'get24DivisionsInfo' ||
      record.provenance.endpoint !== manifest.source.endpoint ||
      record.provenance.sourceRevision !== manifest.source.apiGuideVersion ||
      record.provenance.acquiredAtUtc !== manifest.acquiredAtUtc ||
      record.provenance.sourceRecordHash.algorithm !== 'SHA-256' ||
      !SHA256_PATTERN.test(record.provenance.sourceRecordHash.value)
    ) {
      error(errors, `${path}.provenance`, 'INVALID_SOURCE_PROVENANCE');
    }

    const expectedIndex =
      (record.year - EXPECTED_START_YEAR) * SOLAR_TERM_DEFINITIONS.length +
      definition.gregorianOrder;
    if (expectedIndex !== index) {
      error(errors, path, 'NON_DETERMINISTIC_ORDER', { expectedIndex, actualIndex: index });
    }
  });

  for (let year = EXPECTED_START_YEAR; year <= EXPECTED_END_YEAR; year += 1) {
    for (const definition of SOLAR_TERM_DEFINITIONS) {
      if (!keys.has(`${year}:${definition.termId}`)) {
        error(errors, 'records', 'MISSING_TERM', { year, termId: definition.termId });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
