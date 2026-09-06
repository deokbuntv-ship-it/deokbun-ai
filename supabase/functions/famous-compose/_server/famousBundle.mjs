// GENERATED FILE — do not edit. Source: src/features/famous/server/index.ts
// Regenerate: node supabase/functions/famous-compose/_server/build.mjs

// src/features/interpretation/contracts/sajuRules.ts
var DEOKBUNAI_SAJU_V1_RULE_ID = "DEOKBUNAI_SAJU_V1";
var DEOKBUNAI_SAJU_V1_RULE_VERSION = "deokbunai.saju-pillar-rules.v2";
var DEOKBUNAI_SAJU_V1_RULE_PROFILE = {
  ruleId: DEOKBUNAI_SAJU_V1_RULE_ID,
  ruleVersion: DEOKBUNAI_SAJU_V1_RULE_VERSION,
  yearPillarRule: "SOLAR_TERM_START_OF_SPRING",
  monthPillarRule: "SOLAR_TERM_TWELVE_JIE",
  leapMonthRule: "LEAP_MONTH_SAME_ORDINAL",
  dayBoundaryRule: "CIVIL_MIDNIGHT",
  trueSolarTimeRule: "DO_NOT_APPLY",
  solarTermRole: "USED_FOR_YEAR_AND_MONTH_PILLARS"
};

// src/features/interpretation/normalization/canonicalSerialization.ts
var BIRTH_FINGERPRINT_SCHEMA_VERSION = (
  // V4 refines historical timezone ambiguity, gaps, unresolved provenance,
  // and seconds-authoritative candidate semantics. V3 remains available only
  // for deterministic regression of already-produced frames.
  "deokbunai.birth-normalization.v4"
);
var CanonicalSerializationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CanonicalSerializationError";
  }
};
function createBirthFingerprintPayload(input) {
  return {
    schemaVersion: BIRTH_FINGERPRINT_SCHEMA_VERSION,
    source: {
      date: input.source.date,
      time: input.source.time,
      coordinates: input.source.place.coordinates ?? null,
      temporalContext: input.source.temporalContext,
      gender: input.source.gender
    },
    normalized: {
      calendar: input.calendar,
      civilLocal: input.civilLocal,
      timezone: input.timezone,
      trueSolarTime: input.trueSolarTime,
      provenance: input.provenance
    }
  };
}
function serializeCanonicalValue(value, path) {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new CanonicalSerializationError(
        `Non-finite number at ${path}.`
      );
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item, index) => serializeCanonicalValue(item, `${path}[${index}]`)).join(",")}]`;
  }
  if (typeof value === "object") {
    const record = value;
    const keys = Object.keys(record).sort();
    const entries = keys.map((key2) => {
      const item = record[key2];
      if (item === void 0) {
        throw new CanonicalSerializationError(
          `Undefined value at ${path}.${key2}.`
        );
      }
      return `${JSON.stringify(key2)}:${serializeCanonicalValue(
        item,
        `${path}.${key2}`
      )}`;
    });
    return `{${entries.join(",")}}`;
  }
  throw new CanonicalSerializationError(
    `Unsupported value at ${path}: ${typeof value}.`
  );
}
function serializeBirthFingerprintPayload(payload) {
  return serializeCanonicalValue(payload, "$");
}
function createBirthFingerprintFrame(canonicalPayload) {
  return `${BIRTH_FINGERPRINT_SCHEMA_VERSION}
${canonicalPayload}`;
}

// src/features/interpretation/normalization/fingerprint.ts
async function digestBirthFingerprintFrame(frame, provider) {
  const value = await provider.sha256Utf8(frame);
  return {
    algorithm: "SHA-256",
    encoding: "UTF-8",
    value
  };
}

// src/features/interpretation/calendar/data/kasiCalendarV1.ts
var KASI_CALENDAR_MANIFEST = {
  "schemaVersion": "deokbunai.lunisolar-month-dataset.v1",
  "datasetVersion": "kasi.lunisolar.1900-2050.acquired-20260808t155307.sha256-410f6b887dff",
  "source": {
    "identity": "KASI_LRSR_CLD_INFO_SERVICE_GET_LUN_CAL_INFO",
    "revision": "OPENAPI_GUIDE_V1.1",
    "acquisitionDate": "2026-08-08T15:53:07Z"
  },
  "artifactChecksum": {
    "algorithm": "SHA-256",
    "value": "410f6b887dfff0689ffe7390580a9a2cf199c8004f2dd0076ad048675bad12b6"
  },
  "supportedGregorianRange": {
    "start": {
      "year": 1900,
      "month": 1,
      "day": 1
    },
    "end": {
      "year": 2050,
      "month": 12,
      "day": 31
    }
  },
  "supportedLunarRange": {
    "start": {
      "lunarYear": 1899,
      "lunarMonth": 12,
      "lunarMonthKind": "REGULAR",
      "lunarDay": 1
    },
    "end": {
      "lunarYear": 2050,
      "lunarMonth": 11,
      "lunarMonthKind": "REGULAR",
      "lunarDay": 18
    }
  },
  "artifactCoverageRange": {
    "start": {
      "year": 1900,
      "month": 1,
      "day": 1
    },
    "end": {
      "year": 2051,
      "month": 1,
      "day": 12
    }
  },
  "recordCount": 1868,
  "conversionRuleVersion": "deokbunai.gregorian-lunar-table.v1"
};
var KASI_LUNAR_MONTH_RECORDS = [
  { lunarYear: 1899, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 1, day: 1 }, lengthDays: 30 },
  { lunarYear: 1900, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 1, day: 31 }, lengthDays: 29 },
  { lunarYear: 1900, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 3, day: 1 }, lengthDays: 30 },
  { lunarYear: 1900, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 3, day: 31 }, lengthDays: 29 },
  { lunarYear: 1900, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 4, day: 29 }, lengthDays: 29 },
  { lunarYear: 1900, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 5, day: 28 }, lengthDays: 30 },
  { lunarYear: 1900, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 6, day: 27 }, lengthDays: 29 },
  { lunarYear: 1900, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 7, day: 26 }, lengthDays: 30 },
  { lunarYear: 1900, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 8, day: 25 }, lengthDays: 30 },
  { lunarYear: 1900, lunarMonth: 8, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1900, month: 9, day: 24 }, lengthDays: 29 },
  { lunarYear: 1900, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 10, day: 23 }, lengthDays: 30 },
  { lunarYear: 1900, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 11, day: 22 }, lengthDays: 30 },
  { lunarYear: 1900, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1900, month: 12, day: 22 }, lengthDays: 29 },
  { lunarYear: 1900, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 1, day: 20 }, lengthDays: 30 },
  { lunarYear: 1901, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 2, day: 19 }, lengthDays: 29 },
  { lunarYear: 1901, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 3, day: 20 }, lengthDays: 30 },
  { lunarYear: 1901, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 4, day: 19 }, lengthDays: 29 },
  { lunarYear: 1901, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 5, day: 18 }, lengthDays: 29 },
  { lunarYear: 1901, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 6, day: 16 }, lengthDays: 30 },
  { lunarYear: 1901, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 7, day: 16 }, lengthDays: 29 },
  { lunarYear: 1901, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 8, day: 14 }, lengthDays: 30 },
  { lunarYear: 1901, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 9, day: 13 }, lengthDays: 29 },
  { lunarYear: 1901, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 10, day: 12 }, lengthDays: 30 },
  { lunarYear: 1901, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 11, day: 11 }, lengthDays: 30 },
  { lunarYear: 1901, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1901, month: 12, day: 11 }, lengthDays: 30 },
  { lunarYear: 1901, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 1, day: 10 }, lengthDays: 29 },
  { lunarYear: 1902, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 2, day: 8 }, lengthDays: 30 },
  { lunarYear: 1902, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 3, day: 10 }, lengthDays: 29 },
  { lunarYear: 1902, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 4, day: 8 }, lengthDays: 30 },
  { lunarYear: 1902, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 5, day: 8 }, lengthDays: 29 },
  { lunarYear: 1902, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 6, day: 6 }, lengthDays: 29 },
  { lunarYear: 1902, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 7, day: 5 }, lengthDays: 30 },
  { lunarYear: 1902, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 8, day: 4 }, lengthDays: 29 },
  { lunarYear: 1902, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 9, day: 2 }, lengthDays: 30 },
  { lunarYear: 1902, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 10, day: 2 }, lengthDays: 29 },
  { lunarYear: 1902, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 10, day: 31 }, lengthDays: 30 },
  { lunarYear: 1902, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 11, day: 30 }, lengthDays: 30 },
  { lunarYear: 1902, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1902, month: 12, day: 30 }, lengthDays: 30 },
  { lunarYear: 1903, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 1, day: 29 }, lengthDays: 29 },
  { lunarYear: 1903, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 2, day: 27 }, lengthDays: 30 },
  { lunarYear: 1903, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 3, day: 29 }, lengthDays: 29 },
  { lunarYear: 1903, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 4, day: 27 }, lengthDays: 30 },
  { lunarYear: 1903, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 5, day: 27 }, lengthDays: 29 },
  { lunarYear: 1903, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1903, month: 6, day: 25 }, lengthDays: 29 },
  { lunarYear: 1903, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 7, day: 24 }, lengthDays: 30 },
  { lunarYear: 1903, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 8, day: 23 }, lengthDays: 29 },
  { lunarYear: 1903, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 9, day: 21 }, lengthDays: 29 },
  { lunarYear: 1903, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 10, day: 20 }, lengthDays: 30 },
  { lunarYear: 1903, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 11, day: 19 }, lengthDays: 30 },
  { lunarYear: 1903, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1903, month: 12, day: 19 }, lengthDays: 29 },
  { lunarYear: 1903, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 1, day: 17 }, lengthDays: 30 },
  { lunarYear: 1904, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 2, day: 16 }, lengthDays: 30 },
  { lunarYear: 1904, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 3, day: 17 }, lengthDays: 30 },
  { lunarYear: 1904, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 4, day: 16 }, lengthDays: 29 },
  { lunarYear: 1904, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 5, day: 15 }, lengthDays: 30 },
  { lunarYear: 1904, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 6, day: 14 }, lengthDays: 29 },
  { lunarYear: 1904, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 7, day: 13 }, lengthDays: 29 },
  { lunarYear: 1904, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 8, day: 11 }, lengthDays: 30 },
  { lunarYear: 1904, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 9, day: 10 }, lengthDays: 29 },
  { lunarYear: 1904, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 10, day: 9 }, lengthDays: 29 },
  { lunarYear: 1904, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 11, day: 7 }, lengthDays: 30 },
  { lunarYear: 1904, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1904, month: 12, day: 7 }, lengthDays: 30 },
  { lunarYear: 1904, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 1, day: 6 }, lengthDays: 29 },
  { lunarYear: 1905, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 2, day: 4 }, lengthDays: 30 },
  { lunarYear: 1905, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 3, day: 6 }, lengthDays: 30 },
  { lunarYear: 1905, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 4, day: 5 }, lengthDays: 29 },
  { lunarYear: 1905, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 5, day: 4 }, lengthDays: 30 },
  { lunarYear: 1905, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 6, day: 3 }, lengthDays: 30 },
  { lunarYear: 1905, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 7, day: 3 }, lengthDays: 29 },
  { lunarYear: 1905, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 8, day: 1 }, lengthDays: 29 },
  { lunarYear: 1905, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 8, day: 30 }, lengthDays: 30 },
  { lunarYear: 1905, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 9, day: 29 }, lengthDays: 29 },
  { lunarYear: 1905, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 10, day: 28 }, lengthDays: 30 },
  { lunarYear: 1905, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 11, day: 27 }, lengthDays: 29 },
  { lunarYear: 1905, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1905, month: 12, day: 26 }, lengthDays: 30 },
  { lunarYear: 1906, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 1, day: 25 }, lengthDays: 29 },
  { lunarYear: 1906, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 2, day: 23 }, lengthDays: 30 },
  { lunarYear: 1906, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 3, day: 25 }, lengthDays: 30 },
  { lunarYear: 1906, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 4, day: 24 }, lengthDays: 29 },
  { lunarYear: 1906, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1906, month: 5, day: 23 }, lengthDays: 30 },
  { lunarYear: 1906, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 6, day: 22 }, lengthDays: 29 },
  { lunarYear: 1906, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 7, day: 21 }, lengthDays: 30 },
  { lunarYear: 1906, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 8, day: 20 }, lengthDays: 29 },
  { lunarYear: 1906, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 9, day: 18 }, lengthDays: 30 },
  { lunarYear: 1906, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 10, day: 18 }, lengthDays: 29 },
  { lunarYear: 1906, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 11, day: 16 }, lengthDays: 30 },
  { lunarYear: 1906, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1906, month: 12, day: 16 }, lengthDays: 29 },
  { lunarYear: 1906, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 1, day: 14 }, lengthDays: 30 },
  { lunarYear: 1907, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 2, day: 13 }, lengthDays: 29 },
  { lunarYear: 1907, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 3, day: 14 }, lengthDays: 30 },
  { lunarYear: 1907, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 4, day: 13 }, lengthDays: 29 },
  { lunarYear: 1907, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 5, day: 12 }, lengthDays: 30 },
  { lunarYear: 1907, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 6, day: 11 }, lengthDays: 29 },
  { lunarYear: 1907, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 7, day: 10 }, lengthDays: 30 },
  { lunarYear: 1907, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 8, day: 9 }, lengthDays: 30 },
  { lunarYear: 1907, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 9, day: 8 }, lengthDays: 29 },
  { lunarYear: 1907, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 10, day: 7 }, lengthDays: 30 },
  { lunarYear: 1907, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 11, day: 6 }, lengthDays: 29 },
  { lunarYear: 1907, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1907, month: 12, day: 5 }, lengthDays: 30 },
  { lunarYear: 1907, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 1, day: 4 }, lengthDays: 29 },
  { lunarYear: 1908, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 2, day: 2 }, lengthDays: 30 },
  { lunarYear: 1908, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 3, day: 3 }, lengthDays: 29 },
  { lunarYear: 1908, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 4, day: 1 }, lengthDays: 29 },
  { lunarYear: 1908, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 4, day: 30 }, lengthDays: 30 },
  { lunarYear: 1908, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 5, day: 30 }, lengthDays: 30 },
  { lunarYear: 1908, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 6, day: 29 }, lengthDays: 29 },
  { lunarYear: 1908, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 7, day: 28 }, lengthDays: 30 },
  { lunarYear: 1908, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 8, day: 27 }, lengthDays: 29 },
  { lunarYear: 1908, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 9, day: 25 }, lengthDays: 30 },
  { lunarYear: 1908, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 10, day: 25 }, lengthDays: 30 },
  { lunarYear: 1908, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 11, day: 24 }, lengthDays: 29 },
  { lunarYear: 1908, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1908, month: 12, day: 23 }, lengthDays: 30 },
  { lunarYear: 1909, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 1, day: 22 }, lengthDays: 29 },
  { lunarYear: 1909, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 2, day: 20 }, lengthDays: 30 },
  { lunarYear: 1909, lunarMonth: 2, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1909, month: 3, day: 22 }, lengthDays: 29 },
  { lunarYear: 1909, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 4, day: 20 }, lengthDays: 29 },
  { lunarYear: 1909, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 5, day: 19 }, lengthDays: 30 },
  { lunarYear: 1909, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 6, day: 18 }, lengthDays: 29 },
  { lunarYear: 1909, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 7, day: 17 }, lengthDays: 30 },
  { lunarYear: 1909, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 8, day: 16 }, lengthDays: 29 },
  { lunarYear: 1909, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 9, day: 14 }, lengthDays: 30 },
  { lunarYear: 1909, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 10, day: 14 }, lengthDays: 30 },
  { lunarYear: 1909, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 11, day: 13 }, lengthDays: 30 },
  { lunarYear: 1909, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1909, month: 12, day: 13 }, lengthDays: 29 },
  { lunarYear: 1909, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 1, day: 11 }, lengthDays: 30 },
  { lunarYear: 1910, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 2, day: 10 }, lengthDays: 29 },
  { lunarYear: 1910, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 3, day: 11 }, lengthDays: 30 },
  { lunarYear: 1910, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 4, day: 10 }, lengthDays: 29 },
  { lunarYear: 1910, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 5, day: 9 }, lengthDays: 29 },
  { lunarYear: 1910, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 6, day: 7 }, lengthDays: 30 },
  { lunarYear: 1910, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 7, day: 7 }, lengthDays: 29 },
  { lunarYear: 1910, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 8, day: 5 }, lengthDays: 30 },
  { lunarYear: 1910, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 9, day: 4 }, lengthDays: 29 },
  { lunarYear: 1910, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 10, day: 3 }, lengthDays: 30 },
  { lunarYear: 1910, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 11, day: 2 }, lengthDays: 30 },
  { lunarYear: 1910, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1910, month: 12, day: 2 }, lengthDays: 30 },
  { lunarYear: 1910, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 1, day: 1 }, lengthDays: 29 },
  { lunarYear: 1911, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 1, day: 30 }, lengthDays: 30 },
  { lunarYear: 1911, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 3, day: 1 }, lengthDays: 29 },
  { lunarYear: 1911, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 3, day: 30 }, lengthDays: 30 },
  { lunarYear: 1911, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 4, day: 29 }, lengthDays: 29 },
  { lunarYear: 1911, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 5, day: 28 }, lengthDays: 29 },
  { lunarYear: 1911, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 6, day: 26 }, lengthDays: 30 },
  { lunarYear: 1911, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1911, month: 7, day: 26 }, lengthDays: 29 },
  { lunarYear: 1911, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 8, day: 24 }, lengthDays: 29 },
  { lunarYear: 1911, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 9, day: 22 }, lengthDays: 30 },
  { lunarYear: 1911, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 10, day: 22 }, lengthDays: 30 },
  { lunarYear: 1911, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 11, day: 21 }, lengthDays: 29 },
  { lunarYear: 1911, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1911, month: 12, day: 20 }, lengthDays: 30 },
  { lunarYear: 1911, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 1, day: 19 }, lengthDays: 30 },
  { lunarYear: 1912, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 2, day: 18 }, lengthDays: 30 },
  { lunarYear: 1912, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 3, day: 19 }, lengthDays: 29 },
  { lunarYear: 1912, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 4, day: 17 }, lengthDays: 30 },
  { lunarYear: 1912, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 5, day: 17 }, lengthDays: 29 },
  { lunarYear: 1912, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 6, day: 15 }, lengthDays: 29 },
  { lunarYear: 1912, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 7, day: 14 }, lengthDays: 30 },
  { lunarYear: 1912, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 8, day: 13 }, lengthDays: 29 },
  { lunarYear: 1912, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 9, day: 11 }, lengthDays: 29 },
  { lunarYear: 1912, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 10, day: 10 }, lengthDays: 30 },
  { lunarYear: 1912, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 11, day: 9 }, lengthDays: 30 },
  { lunarYear: 1912, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1912, month: 12, day: 9 }, lengthDays: 29 },
  { lunarYear: 1912, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 1, day: 7 }, lengthDays: 30 },
  { lunarYear: 1913, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 2, day: 6 }, lengthDays: 30 },
  { lunarYear: 1913, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 3, day: 8 }, lengthDays: 30 },
  { lunarYear: 1913, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 4, day: 7 }, lengthDays: 29 },
  { lunarYear: 1913, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 5, day: 6 }, lengthDays: 30 },
  { lunarYear: 1913, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 6, day: 5 }, lengthDays: 29 },
  { lunarYear: 1913, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 7, day: 4 }, lengthDays: 29 },
  { lunarYear: 1913, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 8, day: 2 }, lengthDays: 30 },
  { lunarYear: 1913, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 9, day: 1 }, lengthDays: 29 },
  { lunarYear: 1913, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 9, day: 30 }, lengthDays: 29 },
  { lunarYear: 1913, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 10, day: 29 }, lengthDays: 30 },
  { lunarYear: 1913, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 11, day: 28 }, lengthDays: 29 },
  { lunarYear: 1913, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1913, month: 12, day: 27 }, lengthDays: 30 },
  { lunarYear: 1914, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 1, day: 26 }, lengthDays: 30 },
  { lunarYear: 1914, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 2, day: 25 }, lengthDays: 30 },
  { lunarYear: 1914, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 3, day: 27 }, lengthDays: 29 },
  { lunarYear: 1914, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 4, day: 25 }, lengthDays: 30 },
  { lunarYear: 1914, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 5, day: 25 }, lengthDays: 30 },
  { lunarYear: 1914, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1914, month: 6, day: 24 }, lengthDays: 29 },
  { lunarYear: 1914, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 7, day: 23 }, lengthDays: 29 },
  { lunarYear: 1914, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 8, day: 21 }, lengthDays: 30 },
  { lunarYear: 1914, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 9, day: 20 }, lengthDays: 29 },
  { lunarYear: 1914, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 10, day: 19 }, lengthDays: 30 },
  { lunarYear: 1914, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 11, day: 18 }, lengthDays: 29 },
  { lunarYear: 1914, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1914, month: 12, day: 17 }, lengthDays: 29 },
  { lunarYear: 1914, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 1, day: 15 }, lengthDays: 30 },
  { lunarYear: 1915, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 2, day: 14 }, lengthDays: 30 },
  { lunarYear: 1915, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 3, day: 16 }, lengthDays: 29 },
  { lunarYear: 1915, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 4, day: 14 }, lengthDays: 30 },
  { lunarYear: 1915, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 5, day: 14 }, lengthDays: 30 },
  { lunarYear: 1915, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 6, day: 13 }, lengthDays: 29 },
  { lunarYear: 1915, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 7, day: 12 }, lengthDays: 30 },
  { lunarYear: 1915, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 8, day: 11 }, lengthDays: 29 },
  { lunarYear: 1915, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 9, day: 9 }, lengthDays: 30 },
  { lunarYear: 1915, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 10, day: 9 }, lengthDays: 29 },
  { lunarYear: 1915, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 11, day: 7 }, lengthDays: 30 },
  { lunarYear: 1915, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1915, month: 12, day: 7 }, lengthDays: 29 },
  { lunarYear: 1915, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 1, day: 5 }, lengthDays: 30 },
  { lunarYear: 1916, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 2, day: 4 }, lengthDays: 29 },
  { lunarYear: 1916, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 3, day: 4 }, lengthDays: 30 },
  { lunarYear: 1916, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 4, day: 3 }, lengthDays: 29 },
  { lunarYear: 1916, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 5, day: 2 }, lengthDays: 30 },
  { lunarYear: 1916, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 6, day: 1 }, lengthDays: 29 },
  { lunarYear: 1916, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 6, day: 30 }, lengthDays: 30 },
  { lunarYear: 1916, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 7, day: 30 }, lengthDays: 30 },
  { lunarYear: 1916, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 8, day: 29 }, lengthDays: 29 },
  { lunarYear: 1916, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 9, day: 27 }, lengthDays: 30 },
  { lunarYear: 1916, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 10, day: 27 }, lengthDays: 29 },
  { lunarYear: 1916, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 11, day: 25 }, lengthDays: 30 },
  { lunarYear: 1916, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1916, month: 12, day: 25 }, lengthDays: 29 },
  { lunarYear: 1917, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 1, day: 23 }, lengthDays: 30 },
  { lunarYear: 1917, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 2, day: 22 }, lengthDays: 29 },
  { lunarYear: 1917, lunarMonth: 2, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1917, month: 3, day: 23 }, lengthDays: 29 },
  { lunarYear: 1917, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 4, day: 21 }, lengthDays: 30 },
  { lunarYear: 1917, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 5, day: 21 }, lengthDays: 29 },
  { lunarYear: 1917, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 6, day: 19 }, lengthDays: 30 },
  { lunarYear: 1917, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 7, day: 19 }, lengthDays: 30 },
  { lunarYear: 1917, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 8, day: 18 }, lengthDays: 29 },
  { lunarYear: 1917, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 9, day: 16 }, lengthDays: 30 },
  { lunarYear: 1917, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 10, day: 16 }, lengthDays: 30 },
  { lunarYear: 1917, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 11, day: 15 }, lengthDays: 29 },
  { lunarYear: 1917, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1917, month: 12, day: 14 }, lengthDays: 30 },
  { lunarYear: 1917, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 1, day: 13 }, lengthDays: 29 },
  { lunarYear: 1918, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 2, day: 11 }, lengthDays: 30 },
  { lunarYear: 1918, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 3, day: 13 }, lengthDays: 29 },
  { lunarYear: 1918, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 4, day: 11 }, lengthDays: 29 },
  { lunarYear: 1918, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 5, day: 10 }, lengthDays: 30 },
  { lunarYear: 1918, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 6, day: 9 }, lengthDays: 29 },
  { lunarYear: 1918, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 7, day: 8 }, lengthDays: 30 },
  { lunarYear: 1918, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 8, day: 7 }, lengthDays: 29 },
  { lunarYear: 1918, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 9, day: 5 }, lengthDays: 30 },
  { lunarYear: 1918, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 10, day: 5 }, lengthDays: 30 },
  { lunarYear: 1918, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 11, day: 4 }, lengthDays: 30 },
  { lunarYear: 1918, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1918, month: 12, day: 4 }, lengthDays: 29 },
  { lunarYear: 1918, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 1, day: 2 }, lengthDays: 30 },
  { lunarYear: 1919, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 2, day: 1 }, lengthDays: 29 },
  { lunarYear: 1919, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 3, day: 2 }, lengthDays: 30 },
  { lunarYear: 1919, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 4, day: 1 }, lengthDays: 29 },
  { lunarYear: 1919, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 4, day: 30 }, lengthDays: 29 },
  { lunarYear: 1919, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 5, day: 29 }, lengthDays: 30 },
  { lunarYear: 1919, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 6, day: 28 }, lengthDays: 29 },
  { lunarYear: 1919, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 7, day: 27 }, lengthDays: 30 },
  { lunarYear: 1919, lunarMonth: 7, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1919, month: 8, day: 26 }, lengthDays: 29 },
  { lunarYear: 1919, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 9, day: 24 }, lengthDays: 30 },
  { lunarYear: 1919, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 10, day: 24 }, lengthDays: 30 },
  { lunarYear: 1919, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 11, day: 23 }, lengthDays: 29 },
  { lunarYear: 1919, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1919, month: 12, day: 22 }, lengthDays: 30 },
  { lunarYear: 1919, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 1, day: 21 }, lengthDays: 30 },
  { lunarYear: 1920, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 2, day: 20 }, lengthDays: 29 },
  { lunarYear: 1920, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 3, day: 20 }, lengthDays: 30 },
  { lunarYear: 1920, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 4, day: 19 }, lengthDays: 29 },
  { lunarYear: 1920, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 5, day: 18 }, lengthDays: 29 },
  { lunarYear: 1920, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 6, day: 16 }, lengthDays: 30 },
  { lunarYear: 1920, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 7, day: 16 }, lengthDays: 29 },
  { lunarYear: 1920, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 8, day: 14 }, lengthDays: 29 },
  { lunarYear: 1920, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 9, day: 12 }, lengthDays: 30 },
  { lunarYear: 1920, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 10, day: 12 }, lengthDays: 30 },
  { lunarYear: 1920, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 11, day: 11 }, lengthDays: 29 },
  { lunarYear: 1920, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1920, month: 12, day: 10 }, lengthDays: 30 },
  { lunarYear: 1920, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 1, day: 9 }, lengthDays: 30 },
  { lunarYear: 1921, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 2, day: 8 }, lengthDays: 30 },
  { lunarYear: 1921, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 3, day: 10 }, lengthDays: 29 },
  { lunarYear: 1921, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 4, day: 8 }, lengthDays: 30 },
  { lunarYear: 1921, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 5, day: 8 }, lengthDays: 29 },
  { lunarYear: 1921, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 6, day: 6 }, lengthDays: 29 },
  { lunarYear: 1921, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 7, day: 5 }, lengthDays: 30 },
  { lunarYear: 1921, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 8, day: 4 }, lengthDays: 29 },
  { lunarYear: 1921, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 9, day: 2 }, lengthDays: 29 },
  { lunarYear: 1921, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 10, day: 1 }, lengthDays: 30 },
  { lunarYear: 1921, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 10, day: 31 }, lengthDays: 29 },
  { lunarYear: 1921, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 11, day: 29 }, lengthDays: 30 },
  { lunarYear: 1921, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1921, month: 12, day: 29 }, lengthDays: 30 },
  { lunarYear: 1922, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 1, day: 28 }, lengthDays: 30 },
  { lunarYear: 1922, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 2, day: 27 }, lengthDays: 29 },
  { lunarYear: 1922, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 3, day: 28 }, lengthDays: 30 },
  { lunarYear: 1922, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 4, day: 27 }, lengthDays: 30 },
  { lunarYear: 1922, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 5, day: 27 }, lengthDays: 29 },
  { lunarYear: 1922, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1922, month: 6, day: 25 }, lengthDays: 29 },
  { lunarYear: 1922, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 7, day: 24 }, lengthDays: 30 },
  { lunarYear: 1922, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 8, day: 23 }, lengthDays: 29 },
  { lunarYear: 1922, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 9, day: 21 }, lengthDays: 29 },
  { lunarYear: 1922, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 10, day: 20 }, lengthDays: 30 },
  { lunarYear: 1922, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 11, day: 19 }, lengthDays: 29 },
  { lunarYear: 1922, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1922, month: 12, day: 18 }, lengthDays: 30 },
  { lunarYear: 1922, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 1, day: 17 }, lengthDays: 30 },
  { lunarYear: 1923, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 2, day: 16 }, lengthDays: 29 },
  { lunarYear: 1923, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 3, day: 17 }, lengthDays: 30 },
  { lunarYear: 1923, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 4, day: 16 }, lengthDays: 30 },
  { lunarYear: 1923, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 5, day: 16 }, lengthDays: 29 },
  { lunarYear: 1923, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 6, day: 14 }, lengthDays: 30 },
  { lunarYear: 1923, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 7, day: 14 }, lengthDays: 29 },
  { lunarYear: 1923, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 8, day: 12 }, lengthDays: 30 },
  { lunarYear: 1923, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 9, day: 11 }, lengthDays: 29 },
  { lunarYear: 1923, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 10, day: 10 }, lengthDays: 30 },
  { lunarYear: 1923, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 11, day: 9 }, lengthDays: 29 },
  { lunarYear: 1923, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1923, month: 12, day: 8 }, lengthDays: 29 },
  { lunarYear: 1923, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 1, day: 6 }, lengthDays: 30 },
  { lunarYear: 1924, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 2, day: 5 }, lengthDays: 30 },
  { lunarYear: 1924, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 3, day: 6 }, lengthDays: 29 },
  { lunarYear: 1924, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 4, day: 4 }, lengthDays: 30 },
  { lunarYear: 1924, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 5, day: 4 }, lengthDays: 29 },
  { lunarYear: 1924, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 6, day: 2 }, lengthDays: 30 },
  { lunarYear: 1924, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 7, day: 2 }, lengthDays: 30 },
  { lunarYear: 1924, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 8, day: 1 }, lengthDays: 29 },
  { lunarYear: 1924, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 8, day: 30 }, lengthDays: 30 },
  { lunarYear: 1924, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 9, day: 29 }, lengthDays: 29 },
  { lunarYear: 1924, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 10, day: 28 }, lengthDays: 30 },
  { lunarYear: 1924, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 11, day: 27 }, lengthDays: 29 },
  { lunarYear: 1924, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1924, month: 12, day: 26 }, lengthDays: 29 },
  { lunarYear: 1925, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 1, day: 24 }, lengthDays: 30 },
  { lunarYear: 1925, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 2, day: 23 }, lengthDays: 29 },
  { lunarYear: 1925, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 3, day: 24 }, lengthDays: 30 },
  { lunarYear: 1925, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 4, day: 23 }, lengthDays: 30 },
  { lunarYear: 1925, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1925, month: 5, day: 23 }, lengthDays: 29 },
  { lunarYear: 1925, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 6, day: 21 }, lengthDays: 30 },
  { lunarYear: 1925, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 7, day: 21 }, lengthDays: 29 },
  { lunarYear: 1925, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 8, day: 19 }, lengthDays: 30 },
  { lunarYear: 1925, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 9, day: 18 }, lengthDays: 30 },
  { lunarYear: 1925, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 10, day: 18 }, lengthDays: 29 },
  { lunarYear: 1925, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 11, day: 16 }, lengthDays: 30 },
  { lunarYear: 1925, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1925, month: 12, day: 16 }, lengthDays: 29 },
  { lunarYear: 1925, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 1, day: 14 }, lengthDays: 30 },
  { lunarYear: 1926, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 2, day: 13 }, lengthDays: 29 },
  { lunarYear: 1926, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 3, day: 14 }, lengthDays: 29 },
  { lunarYear: 1926, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 4, day: 12 }, lengthDays: 30 },
  { lunarYear: 1926, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 5, day: 12 }, lengthDays: 29 },
  { lunarYear: 1926, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 6, day: 10 }, lengthDays: 30 },
  { lunarYear: 1926, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 7, day: 10 }, lengthDays: 29 },
  { lunarYear: 1926, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 8, day: 8 }, lengthDays: 30 },
  { lunarYear: 1926, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 9, day: 7 }, lengthDays: 30 },
  { lunarYear: 1926, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 10, day: 7 }, lengthDays: 29 },
  { lunarYear: 1926, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 11, day: 5 }, lengthDays: 30 },
  { lunarYear: 1926, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1926, month: 12, day: 5 }, lengthDays: 30 },
  { lunarYear: 1926, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 1, day: 4 }, lengthDays: 29 },
  { lunarYear: 1927, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 2, day: 2 }, lengthDays: 30 },
  { lunarYear: 1927, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 3, day: 4 }, lengthDays: 29 },
  { lunarYear: 1927, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 4, day: 2 }, lengthDays: 29 },
  { lunarYear: 1927, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 5, day: 1 }, lengthDays: 30 },
  { lunarYear: 1927, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 5, day: 31 }, lengthDays: 29 },
  { lunarYear: 1927, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 6, day: 29 }, lengthDays: 30 },
  { lunarYear: 1927, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 7, day: 29 }, lengthDays: 29 },
  { lunarYear: 1927, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 8, day: 27 }, lengthDays: 30 },
  { lunarYear: 1927, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 9, day: 26 }, lengthDays: 30 },
  { lunarYear: 1927, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 10, day: 26 }, lengthDays: 29 },
  { lunarYear: 1927, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 11, day: 24 }, lengthDays: 30 },
  { lunarYear: 1927, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1927, month: 12, day: 24 }, lengthDays: 30 },
  { lunarYear: 1928, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 1, day: 23 }, lengthDays: 29 },
  { lunarYear: 1928, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 2, day: 21 }, lengthDays: 30 },
  { lunarYear: 1928, lunarMonth: 2, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1928, month: 3, day: 22 }, lengthDays: 29 },
  { lunarYear: 1928, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 4, day: 20 }, lengthDays: 29 },
  { lunarYear: 1928, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 5, day: 19 }, lengthDays: 30 },
  { lunarYear: 1928, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 6, day: 18 }, lengthDays: 29 },
  { lunarYear: 1928, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 7, day: 17 }, lengthDays: 29 },
  { lunarYear: 1928, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 8, day: 15 }, lengthDays: 30 },
  { lunarYear: 1928, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 9, day: 14 }, lengthDays: 30 },
  { lunarYear: 1928, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 10, day: 14 }, lengthDays: 29 },
  { lunarYear: 1928, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 11, day: 12 }, lengthDays: 30 },
  { lunarYear: 1928, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1928, month: 12, day: 12 }, lengthDays: 30 },
  { lunarYear: 1928, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 1, day: 11 }, lengthDays: 30 },
  { lunarYear: 1929, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 2, day: 10 }, lengthDays: 29 },
  { lunarYear: 1929, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 3, day: 11 }, lengthDays: 30 },
  { lunarYear: 1929, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 4, day: 10 }, lengthDays: 29 },
  { lunarYear: 1929, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 5, day: 9 }, lengthDays: 29 },
  { lunarYear: 1929, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 6, day: 7 }, lengthDays: 30 },
  { lunarYear: 1929, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 7, day: 7 }, lengthDays: 29 },
  { lunarYear: 1929, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 8, day: 5 }, lengthDays: 29 },
  { lunarYear: 1929, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 9, day: 3 }, lengthDays: 30 },
  { lunarYear: 1929, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 10, day: 3 }, lengthDays: 29 },
  { lunarYear: 1929, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 11, day: 1 }, lengthDays: 30 },
  { lunarYear: 1929, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 12, day: 1 }, lengthDays: 30 },
  { lunarYear: 1929, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1929, month: 12, day: 31 }, lengthDays: 30 },
  { lunarYear: 1930, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 1, day: 30 }, lengthDays: 29 },
  { lunarYear: 1930, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 2, day: 28 }, lengthDays: 30 },
  { lunarYear: 1930, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 3, day: 30 }, lengthDays: 30 },
  { lunarYear: 1930, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 4, day: 29 }, lengthDays: 29 },
  { lunarYear: 1930, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 5, day: 28 }, lengthDays: 29 },
  { lunarYear: 1930, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 6, day: 26 }, lengthDays: 30 },
  { lunarYear: 1930, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1930, month: 7, day: 26 }, lengthDays: 29 },
  { lunarYear: 1930, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 8, day: 24 }, lengthDays: 29 },
  { lunarYear: 1930, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 9, day: 22 }, lengthDays: 30 },
  { lunarYear: 1930, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 10, day: 22 }, lengthDays: 29 },
  { lunarYear: 1930, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 11, day: 20 }, lengthDays: 30 },
  { lunarYear: 1930, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1930, month: 12, day: 20 }, lengthDays: 30 },
  { lunarYear: 1930, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 1, day: 19 }, lengthDays: 29 },
  { lunarYear: 1931, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 2, day: 17 }, lengthDays: 30 },
  { lunarYear: 1931, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 3, day: 19 }, lengthDays: 30 },
  { lunarYear: 1931, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 4, day: 18 }, lengthDays: 30 },
  { lunarYear: 1931, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 5, day: 18 }, lengthDays: 29 },
  { lunarYear: 1931, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 6, day: 16 }, lengthDays: 29 },
  { lunarYear: 1931, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 7, day: 15 }, lengthDays: 30 },
  { lunarYear: 1931, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 8, day: 14 }, lengthDays: 29 },
  { lunarYear: 1931, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 9, day: 12 }, lengthDays: 29 },
  { lunarYear: 1931, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 10, day: 11 }, lengthDays: 30 },
  { lunarYear: 1931, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 11, day: 10 }, lengthDays: 29 },
  { lunarYear: 1931, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1931, month: 12, day: 9 }, lengthDays: 30 },
  { lunarYear: 1931, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 1, day: 8 }, lengthDays: 29 },
  { lunarYear: 1932, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 2, day: 6 }, lengthDays: 30 },
  { lunarYear: 1932, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 3, day: 7 }, lengthDays: 30 },
  { lunarYear: 1932, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 4, day: 6 }, lengthDays: 30 },
  { lunarYear: 1932, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 5, day: 6 }, lengthDays: 29 },
  { lunarYear: 1932, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 6, day: 4 }, lengthDays: 30 },
  { lunarYear: 1932, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 7, day: 4 }, lengthDays: 29 },
  { lunarYear: 1932, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 8, day: 2 }, lengthDays: 30 },
  { lunarYear: 1932, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 9, day: 1 }, lengthDays: 29 },
  { lunarYear: 1932, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 9, day: 30 }, lengthDays: 29 },
  { lunarYear: 1932, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 10, day: 29 }, lengthDays: 30 },
  { lunarYear: 1932, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 11, day: 28 }, lengthDays: 29 },
  { lunarYear: 1932, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1932, month: 12, day: 27 }, lengthDays: 30 },
  { lunarYear: 1933, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 1, day: 26 }, lengthDays: 29 },
  { lunarYear: 1933, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 2, day: 24 }, lengthDays: 30 },
  { lunarYear: 1933, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 3, day: 26 }, lengthDays: 30 },
  { lunarYear: 1933, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 4, day: 25 }, lengthDays: 29 },
  { lunarYear: 1933, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 5, day: 24 }, lengthDays: 30 },
  { lunarYear: 1933, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1933, month: 6, day: 23 }, lengthDays: 30 },
  { lunarYear: 1933, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 7, day: 23 }, lengthDays: 29 },
  { lunarYear: 1933, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 8, day: 21 }, lengthDays: 30 },
  { lunarYear: 1933, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 9, day: 20 }, lengthDays: 29 },
  { lunarYear: 1933, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 10, day: 19 }, lengthDays: 30 },
  { lunarYear: 1933, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 11, day: 18 }, lengthDays: 29 },
  { lunarYear: 1933, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1933, month: 12, day: 17 }, lengthDays: 29 },
  { lunarYear: 1933, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 1, day: 15 }, lengthDays: 30 },
  { lunarYear: 1934, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 2, day: 14 }, lengthDays: 29 },
  { lunarYear: 1934, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 3, day: 15 }, lengthDays: 30 },
  { lunarYear: 1934, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 4, day: 14 }, lengthDays: 29 },
  { lunarYear: 1934, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 5, day: 13 }, lengthDays: 30 },
  { lunarYear: 1934, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 6, day: 12 }, lengthDays: 30 },
  { lunarYear: 1934, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 7, day: 12 }, lengthDays: 29 },
  { lunarYear: 1934, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 8, day: 10 }, lengthDays: 30 },
  { lunarYear: 1934, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 9, day: 9 }, lengthDays: 30 },
  { lunarYear: 1934, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 10, day: 9 }, lengthDays: 29 },
  { lunarYear: 1934, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 11, day: 7 }, lengthDays: 30 },
  { lunarYear: 1934, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1934, month: 12, day: 7 }, lengthDays: 29 },
  { lunarYear: 1934, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 1, day: 5 }, lengthDays: 30 },
  { lunarYear: 1935, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 2, day: 4 }, lengthDays: 29 },
  { lunarYear: 1935, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 3, day: 5 }, lengthDays: 29 },
  { lunarYear: 1935, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 4, day: 3 }, lengthDays: 30 },
  { lunarYear: 1935, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 5, day: 3 }, lengthDays: 29 },
  { lunarYear: 1935, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 6, day: 1 }, lengthDays: 30 },
  { lunarYear: 1935, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 7, day: 1 }, lengthDays: 29 },
  { lunarYear: 1935, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 7, day: 30 }, lengthDays: 30 },
  { lunarYear: 1935, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 8, day: 29 }, lengthDays: 30 },
  { lunarYear: 1935, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 9, day: 28 }, lengthDays: 29 },
  { lunarYear: 1935, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 10, day: 27 }, lengthDays: 30 },
  { lunarYear: 1935, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 11, day: 26 }, lengthDays: 30 },
  { lunarYear: 1935, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1935, month: 12, day: 26 }, lengthDays: 29 },
  { lunarYear: 1936, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 1, day: 24 }, lengthDays: 30 },
  { lunarYear: 1936, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 2, day: 23 }, lengthDays: 29 },
  { lunarYear: 1936, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 3, day: 23 }, lengthDays: 29 },
  { lunarYear: 1936, lunarMonth: 3, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1936, month: 4, day: 21 }, lengthDays: 30 },
  { lunarYear: 1936, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 5, day: 21 }, lengthDays: 29 },
  { lunarYear: 1936, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 6, day: 19 }, lengthDays: 30 },
  { lunarYear: 1936, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 7, day: 19 }, lengthDays: 29 },
  { lunarYear: 1936, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 8, day: 17 }, lengthDays: 30 },
  { lunarYear: 1936, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 9, day: 16 }, lengthDays: 29 },
  { lunarYear: 1936, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 10, day: 15 }, lengthDays: 30 },
  { lunarYear: 1936, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 11, day: 14 }, lengthDays: 30 },
  { lunarYear: 1936, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1936, month: 12, day: 14 }, lengthDays: 30 },
  { lunarYear: 1936, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 1, day: 13 }, lengthDays: 29 },
  { lunarYear: 1937, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 2, day: 11 }, lengthDays: 30 },
  { lunarYear: 1937, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 3, day: 13 }, lengthDays: 29 },
  { lunarYear: 1937, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 4, day: 11 }, lengthDays: 29 },
  { lunarYear: 1937, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 5, day: 10 }, lengthDays: 30 },
  { lunarYear: 1937, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 6, day: 9 }, lengthDays: 29 },
  { lunarYear: 1937, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 7, day: 8 }, lengthDays: 29 },
  { lunarYear: 1937, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 8, day: 6 }, lengthDays: 30 },
  { lunarYear: 1937, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 9, day: 5 }, lengthDays: 29 },
  { lunarYear: 1937, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 10, day: 4 }, lengthDays: 30 },
  { lunarYear: 1937, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 11, day: 3 }, lengthDays: 30 },
  { lunarYear: 1937, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1937, month: 12, day: 3 }, lengthDays: 30 },
  { lunarYear: 1937, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 1, day: 2 }, lengthDays: 29 },
  { lunarYear: 1938, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 1, day: 31 }, lengthDays: 30 },
  { lunarYear: 1938, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 3, day: 2 }, lengthDays: 30 },
  { lunarYear: 1938, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 4, day: 1 }, lengthDays: 29 },
  { lunarYear: 1938, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 4, day: 30 }, lengthDays: 29 },
  { lunarYear: 1938, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 5, day: 29 }, lengthDays: 30 },
  { lunarYear: 1938, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 6, day: 28 }, lengthDays: 29 },
  { lunarYear: 1938, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 7, day: 27 }, lengthDays: 29 },
  { lunarYear: 1938, lunarMonth: 7, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1938, month: 8, day: 25 }, lengthDays: 30 },
  { lunarYear: 1938, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 9, day: 24 }, lengthDays: 29 },
  { lunarYear: 1938, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 10, day: 23 }, lengthDays: 30 },
  { lunarYear: 1938, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 11, day: 22 }, lengthDays: 30 },
  { lunarYear: 1938, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1938, month: 12, day: 22 }, lengthDays: 29 },
  { lunarYear: 1938, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 1, day: 20 }, lengthDays: 30 },
  { lunarYear: 1939, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 2, day: 19 }, lengthDays: 30 },
  { lunarYear: 1939, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 3, day: 21 }, lengthDays: 30 },
  { lunarYear: 1939, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 4, day: 20 }, lengthDays: 29 },
  { lunarYear: 1939, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 5, day: 19 }, lengthDays: 29 },
  { lunarYear: 1939, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 6, day: 17 }, lengthDays: 30 },
  { lunarYear: 1939, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 7, day: 17 }, lengthDays: 29 },
  { lunarYear: 1939, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 8, day: 15 }, lengthDays: 29 },
  { lunarYear: 1939, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 9, day: 13 }, lengthDays: 30 },
  { lunarYear: 1939, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 10, day: 13 }, lengthDays: 29 },
  { lunarYear: 1939, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 11, day: 11 }, lengthDays: 30 },
  { lunarYear: 1939, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1939, month: 12, day: 11 }, lengthDays: 29 },
  { lunarYear: 1939, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 1, day: 9 }, lengthDays: 30 },
  { lunarYear: 1940, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 2, day: 8 }, lengthDays: 30 },
  { lunarYear: 1940, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 3, day: 9 }, lengthDays: 30 },
  { lunarYear: 1940, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 4, day: 8 }, lengthDays: 29 },
  { lunarYear: 1940, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 5, day: 7 }, lengthDays: 30 },
  { lunarYear: 1940, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 6, day: 6 }, lengthDays: 29 },
  { lunarYear: 1940, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 7, day: 5 }, lengthDays: 30 },
  { lunarYear: 1940, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 8, day: 4 }, lengthDays: 29 },
  { lunarYear: 1940, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 9, day: 2 }, lengthDays: 29 },
  { lunarYear: 1940, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 10, day: 1 }, lengthDays: 30 },
  { lunarYear: 1940, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 10, day: 31 }, lengthDays: 29 },
  { lunarYear: 1940, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 11, day: 29 }, lengthDays: 30 },
  { lunarYear: 1940, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1940, month: 12, day: 29 }, lengthDays: 29 },
  { lunarYear: 1941, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 1, day: 27 }, lengthDays: 30 },
  { lunarYear: 1941, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 2, day: 26 }, lengthDays: 30 },
  { lunarYear: 1941, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 3, day: 28 }, lengthDays: 29 },
  { lunarYear: 1941, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 4, day: 26 }, lengthDays: 30 },
  { lunarYear: 1941, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 5, day: 26 }, lengthDays: 30 },
  { lunarYear: 1941, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 6, day: 25 }, lengthDays: 29 },
  { lunarYear: 1941, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1941, month: 7, day: 24 }, lengthDays: 30 },
  { lunarYear: 1941, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 8, day: 23 }, lengthDays: 29 },
  { lunarYear: 1941, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 9, day: 21 }, lengthDays: 29 },
  { lunarYear: 1941, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 10, day: 20 }, lengthDays: 30 },
  { lunarYear: 1941, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 11, day: 19 }, lengthDays: 29 },
  { lunarYear: 1941, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1941, month: 12, day: 18 }, lengthDays: 30 },
  { lunarYear: 1941, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 1, day: 17 }, lengthDays: 29 },
  { lunarYear: 1942, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 2, day: 15 }, lengthDays: 30 },
  { lunarYear: 1942, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 3, day: 17 }, lengthDays: 29 },
  { lunarYear: 1942, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 4, day: 15 }, lengthDays: 30 },
  { lunarYear: 1942, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 5, day: 15 }, lengthDays: 30 },
  { lunarYear: 1942, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 6, day: 14 }, lengthDays: 29 },
  { lunarYear: 1942, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 7, day: 13 }, lengthDays: 30 },
  { lunarYear: 1942, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 8, day: 12 }, lengthDays: 30 },
  { lunarYear: 1942, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 9, day: 11 }, lengthDays: 29 },
  { lunarYear: 1942, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 10, day: 10 }, lengthDays: 30 },
  { lunarYear: 1942, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 11, day: 9 }, lengthDays: 29 },
  { lunarYear: 1942, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1942, month: 12, day: 8 }, lengthDays: 29 },
  { lunarYear: 1942, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 1, day: 6 }, lengthDays: 30 },
  { lunarYear: 1943, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 2, day: 5 }, lengthDays: 29 },
  { lunarYear: 1943, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 3, day: 6 }, lengthDays: 30 },
  { lunarYear: 1943, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 4, day: 5 }, lengthDays: 29 },
  { lunarYear: 1943, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 5, day: 4 }, lengthDays: 30 },
  { lunarYear: 1943, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 6, day: 3 }, lengthDays: 29 },
  { lunarYear: 1943, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 7, day: 2 }, lengthDays: 30 },
  { lunarYear: 1943, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 8, day: 1 }, lengthDays: 30 },
  { lunarYear: 1943, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 8, day: 31 }, lengthDays: 29 },
  { lunarYear: 1943, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 9, day: 29 }, lengthDays: 30 },
  { lunarYear: 1943, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 10, day: 29 }, lengthDays: 30 },
  { lunarYear: 1943, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 11, day: 28 }, lengthDays: 29 },
  { lunarYear: 1943, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1943, month: 12, day: 27 }, lengthDays: 30 },
  { lunarYear: 1944, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 1, day: 26 }, lengthDays: 29 },
  { lunarYear: 1944, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 2, day: 24 }, lengthDays: 29 },
  { lunarYear: 1944, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 3, day: 24 }, lengthDays: 30 },
  { lunarYear: 1944, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 4, day: 23 }, lengthDays: 29 },
  { lunarYear: 1944, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1944, month: 5, day: 22 }, lengthDays: 30 },
  { lunarYear: 1944, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 6, day: 21 }, lengthDays: 29 },
  { lunarYear: 1944, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 7, day: 20 }, lengthDays: 30 },
  { lunarYear: 1944, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 8, day: 19 }, lengthDays: 29 },
  { lunarYear: 1944, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 9, day: 17 }, lengthDays: 30 },
  { lunarYear: 1944, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 10, day: 17 }, lengthDays: 30 },
  { lunarYear: 1944, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 11, day: 16 }, lengthDays: 29 },
  { lunarYear: 1944, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1944, month: 12, day: 15 }, lengthDays: 30 },
  { lunarYear: 1944, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 1, day: 14 }, lengthDays: 30 },
  { lunarYear: 1945, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 2, day: 13 }, lengthDays: 29 },
  { lunarYear: 1945, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 3, day: 14 }, lengthDays: 29 },
  { lunarYear: 1945, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 4, day: 12 }, lengthDays: 30 },
  { lunarYear: 1945, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 5, day: 12 }, lengthDays: 29 },
  { lunarYear: 1945, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 6, day: 10 }, lengthDays: 29 },
  { lunarYear: 1945, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 7, day: 9 }, lengthDays: 30 },
  { lunarYear: 1945, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 8, day: 8 }, lengthDays: 29 },
  { lunarYear: 1945, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 9, day: 6 }, lengthDays: 30 },
  { lunarYear: 1945, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 10, day: 6 }, lengthDays: 30 },
  { lunarYear: 1945, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 11, day: 5 }, lengthDays: 30 },
  { lunarYear: 1945, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1945, month: 12, day: 5 }, lengthDays: 29 },
  { lunarYear: 1945, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 1, day: 3 }, lengthDays: 30 },
  { lunarYear: 1946, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 2, day: 2 }, lengthDays: 30 },
  { lunarYear: 1946, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 3, day: 4 }, lengthDays: 29 },
  { lunarYear: 1946, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 4, day: 2 }, lengthDays: 29 },
  { lunarYear: 1946, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 5, day: 1 }, lengthDays: 30 },
  { lunarYear: 1946, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 5, day: 31 }, lengthDays: 29 },
  { lunarYear: 1946, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 6, day: 29 }, lengthDays: 29 },
  { lunarYear: 1946, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 7, day: 28 }, lengthDays: 30 },
  { lunarYear: 1946, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 8, day: 27 }, lengthDays: 29 },
  { lunarYear: 1946, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 9, day: 25 }, lengthDays: 30 },
  { lunarYear: 1946, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 10, day: 25 }, lengthDays: 30 },
  { lunarYear: 1946, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 11, day: 24 }, lengthDays: 29 },
  { lunarYear: 1946, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1946, month: 12, day: 23 }, lengthDays: 30 },
  { lunarYear: 1947, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 1, day: 22 }, lengthDays: 30 },
  { lunarYear: 1947, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 2, day: 21 }, lengthDays: 30 },
  { lunarYear: 1947, lunarMonth: 2, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1947, month: 3, day: 23 }, lengthDays: 29 },
  { lunarYear: 1947, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 4, day: 21 }, lengthDays: 29 },
  { lunarYear: 1947, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 5, day: 20 }, lengthDays: 30 },
  { lunarYear: 1947, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 6, day: 19 }, lengthDays: 29 },
  { lunarYear: 1947, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 7, day: 18 }, lengthDays: 29 },
  { lunarYear: 1947, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 8, day: 16 }, lengthDays: 30 },
  { lunarYear: 1947, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 9, day: 15 }, lengthDays: 29 },
  { lunarYear: 1947, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 10, day: 14 }, lengthDays: 30 },
  { lunarYear: 1947, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 11, day: 13 }, lengthDays: 29 },
  { lunarYear: 1947, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1947, month: 12, day: 12 }, lengthDays: 30 },
  { lunarYear: 1947, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 1, day: 11 }, lengthDays: 30 },
  { lunarYear: 1948, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 2, day: 10 }, lengthDays: 30 },
  { lunarYear: 1948, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 3, day: 11 }, lengthDays: 29 },
  { lunarYear: 1948, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 4, day: 9 }, lengthDays: 30 },
  { lunarYear: 1948, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 5, day: 9 }, lengthDays: 29 },
  { lunarYear: 1948, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 6, day: 7 }, lengthDays: 30 },
  { lunarYear: 1948, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 7, day: 7 }, lengthDays: 29 },
  { lunarYear: 1948, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 8, day: 5 }, lengthDays: 29 },
  { lunarYear: 1948, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 9, day: 3 }, lengthDays: 30 },
  { lunarYear: 1948, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 10, day: 3 }, lengthDays: 29 },
  { lunarYear: 1948, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 11, day: 1 }, lengthDays: 30 },
  { lunarYear: 1948, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 12, day: 1 }, lengthDays: 29 },
  { lunarYear: 1948, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1948, month: 12, day: 30 }, lengthDays: 30 },
  { lunarYear: 1949, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 1, day: 29 }, lengthDays: 30 },
  { lunarYear: 1949, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 2, day: 28 }, lengthDays: 30 },
  { lunarYear: 1949, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 3, day: 30 }, lengthDays: 29 },
  { lunarYear: 1949, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 4, day: 28 }, lengthDays: 30 },
  { lunarYear: 1949, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 5, day: 28 }, lengthDays: 29 },
  { lunarYear: 1949, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 6, day: 26 }, lengthDays: 30 },
  { lunarYear: 1949, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 7, day: 26 }, lengthDays: 29 },
  { lunarYear: 1949, lunarMonth: 7, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1949, month: 8, day: 24 }, lengthDays: 29 },
  { lunarYear: 1949, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 9, day: 22 }, lengthDays: 30 },
  { lunarYear: 1949, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 10, day: 22 }, lengthDays: 29 },
  { lunarYear: 1949, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 11, day: 20 }, lengthDays: 30 },
  { lunarYear: 1949, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1949, month: 12, day: 20 }, lengthDays: 29 },
  { lunarYear: 1949, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 1, day: 18 }, lengthDays: 30 },
  { lunarYear: 1950, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 2, day: 17 }, lengthDays: 30 },
  { lunarYear: 1950, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 3, day: 19 }, lengthDays: 29 },
  { lunarYear: 1950, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 4, day: 17 }, lengthDays: 30 },
  { lunarYear: 1950, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 5, day: 17 }, lengthDays: 30 },
  { lunarYear: 1950, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 6, day: 16 }, lengthDays: 29 },
  { lunarYear: 1950, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 7, day: 15 }, lengthDays: 30 },
  { lunarYear: 1950, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 8, day: 14 }, lengthDays: 29 },
  { lunarYear: 1950, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 9, day: 12 }, lengthDays: 29 },
  { lunarYear: 1950, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 10, day: 11 }, lengthDays: 30 },
  { lunarYear: 1950, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 11, day: 10 }, lengthDays: 29 },
  { lunarYear: 1950, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1950, month: 12, day: 9 }, lengthDays: 30 },
  { lunarYear: 1950, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 1, day: 8 }, lengthDays: 29 },
  { lunarYear: 1951, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 2, day: 6 }, lengthDays: 30 },
  { lunarYear: 1951, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 3, day: 8 }, lengthDays: 29 },
  { lunarYear: 1951, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 4, day: 6 }, lengthDays: 30 },
  { lunarYear: 1951, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 5, day: 6 }, lengthDays: 30 },
  { lunarYear: 1951, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 6, day: 5 }, lengthDays: 29 },
  { lunarYear: 1951, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 7, day: 4 }, lengthDays: 30 },
  { lunarYear: 1951, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 8, day: 3 }, lengthDays: 29 },
  { lunarYear: 1951, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 9, day: 1 }, lengthDays: 30 },
  { lunarYear: 1951, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 10, day: 1 }, lengthDays: 29 },
  { lunarYear: 1951, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 10, day: 30 }, lengthDays: 30 },
  { lunarYear: 1951, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 11, day: 29 }, lengthDays: 29 },
  { lunarYear: 1951, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1951, month: 12, day: 28 }, lengthDays: 30 },
  { lunarYear: 1952, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 1, day: 27 }, lengthDays: 29 },
  { lunarYear: 1952, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 2, day: 25 }, lengthDays: 30 },
  { lunarYear: 1952, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 3, day: 26 }, lengthDays: 29 },
  { lunarYear: 1952, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 4, day: 24 }, lengthDays: 30 },
  { lunarYear: 1952, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 5, day: 24 }, lengthDays: 29 },
  { lunarYear: 1952, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1952, month: 6, day: 22 }, lengthDays: 30 },
  { lunarYear: 1952, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 7, day: 22 }, lengthDays: 30 },
  { lunarYear: 1952, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 8, day: 21 }, lengthDays: 29 },
  { lunarYear: 1952, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 9, day: 19 }, lengthDays: 30 },
  { lunarYear: 1952, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 10, day: 19 }, lengthDays: 29 },
  { lunarYear: 1952, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 11, day: 17 }, lengthDays: 30 },
  { lunarYear: 1952, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1952, month: 12, day: 17 }, lengthDays: 29 },
  { lunarYear: 1952, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 1, day: 15 }, lengthDays: 30 },
  { lunarYear: 1953, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 2, day: 14 }, lengthDays: 29 },
  { lunarYear: 1953, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 3, day: 15 }, lengthDays: 30 },
  { lunarYear: 1953, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 4, day: 14 }, lengthDays: 29 },
  { lunarYear: 1953, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 5, day: 13 }, lengthDays: 29 },
  { lunarYear: 1953, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 6, day: 11 }, lengthDays: 30 },
  { lunarYear: 1953, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 7, day: 11 }, lengthDays: 30 },
  { lunarYear: 1953, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 8, day: 10 }, lengthDays: 29 },
  { lunarYear: 1953, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 9, day: 8 }, lengthDays: 30 },
  { lunarYear: 1953, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 10, day: 8 }, lengthDays: 30 },
  { lunarYear: 1953, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 11, day: 7 }, lengthDays: 29 },
  { lunarYear: 1953, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1953, month: 12, day: 6 }, lengthDays: 30 },
  { lunarYear: 1953, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 1, day: 5 }, lengthDays: 30 },
  { lunarYear: 1954, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 2, day: 4 }, lengthDays: 29 },
  { lunarYear: 1954, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 3, day: 5 }, lengthDays: 29 },
  { lunarYear: 1954, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 4, day: 3 }, lengthDays: 30 },
  { lunarYear: 1954, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 5, day: 3 }, lengthDays: 29 },
  { lunarYear: 1954, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 6, day: 1 }, lengthDays: 29 },
  { lunarYear: 1954, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 6, day: 30 }, lengthDays: 30 },
  { lunarYear: 1954, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 7, day: 30 }, lengthDays: 29 },
  { lunarYear: 1954, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 8, day: 28 }, lengthDays: 30 },
  { lunarYear: 1954, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 9, day: 27 }, lengthDays: 30 },
  { lunarYear: 1954, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 10, day: 27 }, lengthDays: 29 },
  { lunarYear: 1954, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 11, day: 25 }, lengthDays: 30 },
  { lunarYear: 1954, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1954, month: 12, day: 25 }, lengthDays: 30 },
  { lunarYear: 1955, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 1, day: 24 }, lengthDays: 30 },
  { lunarYear: 1955, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 2, day: 23 }, lengthDays: 29 },
  { lunarYear: 1955, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 3, day: 24 }, lengthDays: 29 },
  { lunarYear: 1955, lunarMonth: 3, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1955, month: 4, day: 22 }, lengthDays: 30 },
  { lunarYear: 1955, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 5, day: 22 }, lengthDays: 29 },
  { lunarYear: 1955, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 6, day: 20 }, lengthDays: 29 },
  { lunarYear: 1955, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 7, day: 19 }, lengthDays: 30 },
  { lunarYear: 1955, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 8, day: 18 }, lengthDays: 29 },
  { lunarYear: 1955, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 9, day: 16 }, lengthDays: 30 },
  { lunarYear: 1955, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 10, day: 16 }, lengthDays: 29 },
  { lunarYear: 1955, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 11, day: 14 }, lengthDays: 30 },
  { lunarYear: 1955, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1955, month: 12, day: 14 }, lengthDays: 30 },
  { lunarYear: 1955, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 1, day: 13 }, lengthDays: 30 },
  { lunarYear: 1956, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 2, day: 12 }, lengthDays: 29 },
  { lunarYear: 1956, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 3, day: 12 }, lengthDays: 30 },
  { lunarYear: 1956, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 4, day: 11 }, lengthDays: 29 },
  { lunarYear: 1956, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 5, day: 10 }, lengthDays: 30 },
  { lunarYear: 1956, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 6, day: 9 }, lengthDays: 29 },
  { lunarYear: 1956, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 7, day: 8 }, lengthDays: 29 },
  { lunarYear: 1956, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 8, day: 6 }, lengthDays: 30 },
  { lunarYear: 1956, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 9, day: 5 }, lengthDays: 29 },
  { lunarYear: 1956, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 10, day: 4 }, lengthDays: 30 },
  { lunarYear: 1956, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 11, day: 3 }, lengthDays: 29 },
  { lunarYear: 1956, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1956, month: 12, day: 2 }, lengthDays: 30 },
  { lunarYear: 1956, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 1, day: 1 }, lengthDays: 30 },
  { lunarYear: 1957, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 1, day: 31 }, lengthDays: 30 },
  { lunarYear: 1957, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 3, day: 2 }, lengthDays: 29 },
  { lunarYear: 1957, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 3, day: 31 }, lengthDays: 30 },
  { lunarYear: 1957, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 4, day: 30 }, lengthDays: 29 },
  { lunarYear: 1957, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 5, day: 29 }, lengthDays: 30 },
  { lunarYear: 1957, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 6, day: 28 }, lengthDays: 29 },
  { lunarYear: 1957, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 7, day: 27 }, lengthDays: 29 },
  { lunarYear: 1957, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 8, day: 25 }, lengthDays: 30 },
  { lunarYear: 1957, lunarMonth: 8, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1957, month: 9, day: 24 }, lengthDays: 29 },
  { lunarYear: 1957, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 10, day: 23 }, lengthDays: 30 },
  { lunarYear: 1957, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 11, day: 22 }, lengthDays: 29 },
  { lunarYear: 1957, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1957, month: 12, day: 21 }, lengthDays: 30 },
  { lunarYear: 1957, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 1, day: 20 }, lengthDays: 30 },
  { lunarYear: 1958, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 2, day: 19 }, lengthDays: 29 },
  { lunarYear: 1958, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 3, day: 20 }, lengthDays: 30 },
  { lunarYear: 1958, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 4, day: 19 }, lengthDays: 30 },
  { lunarYear: 1958, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 5, day: 19 }, lengthDays: 29 },
  { lunarYear: 1958, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 6, day: 17 }, lengthDays: 30 },
  { lunarYear: 1958, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 7, day: 17 }, lengthDays: 29 },
  { lunarYear: 1958, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 8, day: 15 }, lengthDays: 29 },
  { lunarYear: 1958, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 9, day: 13 }, lengthDays: 30 },
  { lunarYear: 1958, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 10, day: 13 }, lengthDays: 29 },
  { lunarYear: 1958, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 11, day: 11 }, lengthDays: 30 },
  { lunarYear: 1958, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1958, month: 12, day: 11 }, lengthDays: 29 },
  { lunarYear: 1958, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 1, day: 9 }, lengthDays: 30 },
  { lunarYear: 1959, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 2, day: 8 }, lengthDays: 29 },
  { lunarYear: 1959, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 3, day: 9 }, lengthDays: 30 },
  { lunarYear: 1959, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 4, day: 8 }, lengthDays: 30 },
  { lunarYear: 1959, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 5, day: 8 }, lengthDays: 29 },
  { lunarYear: 1959, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 6, day: 6 }, lengthDays: 30 },
  { lunarYear: 1959, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 7, day: 6 }, lengthDays: 29 },
  { lunarYear: 1959, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 8, day: 4 }, lengthDays: 30 },
  { lunarYear: 1959, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 9, day: 3 }, lengthDays: 29 },
  { lunarYear: 1959, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 10, day: 2 }, lengthDays: 30 },
  { lunarYear: 1959, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 11, day: 1 }, lengthDays: 29 },
  { lunarYear: 1959, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 11, day: 30 }, lengthDays: 30 },
  { lunarYear: 1959, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1959, month: 12, day: 30 }, lengthDays: 29 },
  { lunarYear: 1960, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 1, day: 28 }, lengthDays: 30 },
  { lunarYear: 1960, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 2, day: 27 }, lengthDays: 29 },
  { lunarYear: 1960, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 3, day: 27 }, lengthDays: 30 },
  { lunarYear: 1960, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 4, day: 26 }, lengthDays: 29 },
  { lunarYear: 1960, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 5, day: 25 }, lengthDays: 30 },
  { lunarYear: 1960, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 6, day: 24 }, lengthDays: 30 },
  { lunarYear: 1960, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1960, month: 7, day: 24 }, lengthDays: 29 },
  { lunarYear: 1960, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 8, day: 22 }, lengthDays: 30 },
  { lunarYear: 1960, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 9, day: 21 }, lengthDays: 29 },
  { lunarYear: 1960, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 10, day: 20 }, lengthDays: 30 },
  { lunarYear: 1960, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 11, day: 19 }, lengthDays: 29 },
  { lunarYear: 1960, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1960, month: 12, day: 18 }, lengthDays: 30 },
  { lunarYear: 1960, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 1, day: 17 }, lengthDays: 29 },
  { lunarYear: 1961, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 2, day: 15 }, lengthDays: 30 },
  { lunarYear: 1961, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 3, day: 17 }, lengthDays: 29 },
  { lunarYear: 1961, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 4, day: 15 }, lengthDays: 30 },
  { lunarYear: 1961, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 5, day: 15 }, lengthDays: 29 },
  { lunarYear: 1961, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 6, day: 13 }, lengthDays: 30 },
  { lunarYear: 1961, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 7, day: 13 }, lengthDays: 29 },
  { lunarYear: 1961, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 8, day: 11 }, lengthDays: 30 },
  { lunarYear: 1961, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 9, day: 10 }, lengthDays: 30 },
  { lunarYear: 1961, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 10, day: 10 }, lengthDays: 29 },
  { lunarYear: 1961, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 11, day: 8 }, lengthDays: 30 },
  { lunarYear: 1961, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1961, month: 12, day: 8 }, lengthDays: 29 },
  { lunarYear: 1961, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 1, day: 6 }, lengthDays: 30 },
  { lunarYear: 1962, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 2, day: 5 }, lengthDays: 29 },
  { lunarYear: 1962, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 3, day: 6 }, lengthDays: 30 },
  { lunarYear: 1962, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 4, day: 5 }, lengthDays: 29 },
  { lunarYear: 1962, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 5, day: 4 }, lengthDays: 29 },
  { lunarYear: 1962, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 6, day: 2 }, lengthDays: 30 },
  { lunarYear: 1962, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 7, day: 2 }, lengthDays: 29 },
  { lunarYear: 1962, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 7, day: 31 }, lengthDays: 30 },
  { lunarYear: 1962, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 8, day: 30 }, lengthDays: 30 },
  { lunarYear: 1962, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 9, day: 29 }, lengthDays: 29 },
  { lunarYear: 1962, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 10, day: 28 }, lengthDays: 30 },
  { lunarYear: 1962, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 11, day: 27 }, lengthDays: 30 },
  { lunarYear: 1962, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1962, month: 12, day: 27 }, lengthDays: 29 },
  { lunarYear: 1963, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 1, day: 25 }, lengthDays: 30 },
  { lunarYear: 1963, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 2, day: 24 }, lengthDays: 29 },
  { lunarYear: 1963, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 3, day: 25 }, lengthDays: 30 },
  { lunarYear: 1963, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 4, day: 24 }, lengthDays: 29 },
  { lunarYear: 1963, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1963, month: 5, day: 23 }, lengthDays: 29 },
  { lunarYear: 1963, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 6, day: 21 }, lengthDays: 30 },
  { lunarYear: 1963, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 7, day: 21 }, lengthDays: 29 },
  { lunarYear: 1963, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 8, day: 19 }, lengthDays: 30 },
  { lunarYear: 1963, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 9, day: 18 }, lengthDays: 29 },
  { lunarYear: 1963, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 10, day: 17 }, lengthDays: 30 },
  { lunarYear: 1963, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 11, day: 16 }, lengthDays: 30 },
  { lunarYear: 1963, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1963, month: 12, day: 16 }, lengthDays: 30 },
  { lunarYear: 1963, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 1, day: 15 }, lengthDays: 29 },
  { lunarYear: 1964, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 2, day: 13 }, lengthDays: 30 },
  { lunarYear: 1964, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 3, day: 14 }, lengthDays: 29 },
  { lunarYear: 1964, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 4, day: 12 }, lengthDays: 30 },
  { lunarYear: 1964, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 5, day: 12 }, lengthDays: 29 },
  { lunarYear: 1964, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 6, day: 10 }, lengthDays: 29 },
  { lunarYear: 1964, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 7, day: 9 }, lengthDays: 30 },
  { lunarYear: 1964, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 8, day: 8 }, lengthDays: 29 },
  { lunarYear: 1964, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 9, day: 6 }, lengthDays: 30 },
  { lunarYear: 1964, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 10, day: 6 }, lengthDays: 29 },
  { lunarYear: 1964, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 11, day: 4 }, lengthDays: 30 },
  { lunarYear: 1964, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1964, month: 12, day: 4 }, lengthDays: 30 },
  { lunarYear: 1964, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 1, day: 3 }, lengthDays: 30 },
  { lunarYear: 1965, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 2, day: 2 }, lengthDays: 29 },
  { lunarYear: 1965, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 3, day: 3 }, lengthDays: 30 },
  { lunarYear: 1965, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 4, day: 2 }, lengthDays: 29 },
  { lunarYear: 1965, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 5, day: 1 }, lengthDays: 30 },
  { lunarYear: 1965, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 5, day: 31 }, lengthDays: 29 },
  { lunarYear: 1965, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 6, day: 29 }, lengthDays: 29 },
  { lunarYear: 1965, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 7, day: 28 }, lengthDays: 30 },
  { lunarYear: 1965, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 8, day: 27 }, lengthDays: 29 },
  { lunarYear: 1965, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 9, day: 25 }, lengthDays: 29 },
  { lunarYear: 1965, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 10, day: 24 }, lengthDays: 30 },
  { lunarYear: 1965, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 11, day: 23 }, lengthDays: 30 },
  { lunarYear: 1965, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1965, month: 12, day: 23 }, lengthDays: 30 },
  { lunarYear: 1966, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 1, day: 22 }, lengthDays: 29 },
  { lunarYear: 1966, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 2, day: 20 }, lengthDays: 30 },
  { lunarYear: 1966, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 3, day: 22 }, lengthDays: 30 },
  { lunarYear: 1966, lunarMonth: 3, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1966, month: 4, day: 21 }, lengthDays: 29 },
  { lunarYear: 1966, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 5, day: 20 }, lengthDays: 30 },
  { lunarYear: 1966, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 6, day: 19 }, lengthDays: 29 },
  { lunarYear: 1966, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 7, day: 18 }, lengthDays: 29 },
  { lunarYear: 1966, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 8, day: 16 }, lengthDays: 30 },
  { lunarYear: 1966, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 9, day: 15 }, lengthDays: 29 },
  { lunarYear: 1966, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 10, day: 14 }, lengthDays: 29 },
  { lunarYear: 1966, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 11, day: 12 }, lengthDays: 30 },
  { lunarYear: 1966, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1966, month: 12, day: 12 }, lengthDays: 30 },
  { lunarYear: 1966, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 1, day: 11 }, lengthDays: 29 },
  { lunarYear: 1967, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 2, day: 9 }, lengthDays: 30 },
  { lunarYear: 1967, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 3, day: 11 }, lengthDays: 30 },
  { lunarYear: 1967, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 4, day: 10 }, lengthDays: 29 },
  { lunarYear: 1967, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 5, day: 9 }, lengthDays: 30 },
  { lunarYear: 1967, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 6, day: 8 }, lengthDays: 30 },
  { lunarYear: 1967, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 7, day: 8 }, lengthDays: 29 },
  { lunarYear: 1967, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 8, day: 6 }, lengthDays: 29 },
  { lunarYear: 1967, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 9, day: 4 }, lengthDays: 30 },
  { lunarYear: 1967, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 10, day: 4 }, lengthDays: 29 },
  { lunarYear: 1967, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 11, day: 2 }, lengthDays: 30 },
  { lunarYear: 1967, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 12, day: 2 }, lengthDays: 29 },
  { lunarYear: 1967, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1967, month: 12, day: 31 }, lengthDays: 30 },
  { lunarYear: 1968, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 1, day: 30 }, lengthDays: 29 },
  { lunarYear: 1968, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 2, day: 28 }, lengthDays: 30 },
  { lunarYear: 1968, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 3, day: 29 }, lengthDays: 30 },
  { lunarYear: 1968, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 4, day: 28 }, lengthDays: 29 },
  { lunarYear: 1968, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 5, day: 27 }, lengthDays: 30 },
  { lunarYear: 1968, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 6, day: 26 }, lengthDays: 29 },
  { lunarYear: 1968, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 7, day: 25 }, lengthDays: 30 },
  { lunarYear: 1968, lunarMonth: 7, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1968, month: 8, day: 24 }, lengthDays: 29 },
  { lunarYear: 1968, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 9, day: 22 }, lengthDays: 30 },
  { lunarYear: 1968, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 10, day: 22 }, lengthDays: 29 },
  { lunarYear: 1968, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 11, day: 20 }, lengthDays: 30 },
  { lunarYear: 1968, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1968, month: 12, day: 20 }, lengthDays: 29 },
  { lunarYear: 1968, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 1, day: 18 }, lengthDays: 30 },
  { lunarYear: 1969, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 2, day: 17 }, lengthDays: 29 },
  { lunarYear: 1969, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 3, day: 18 }, lengthDays: 30 },
  { lunarYear: 1969, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 4, day: 17 }, lengthDays: 29 },
  { lunarYear: 1969, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 5, day: 16 }, lengthDays: 30 },
  { lunarYear: 1969, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 6, day: 15 }, lengthDays: 29 },
  { lunarYear: 1969, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 7, day: 14 }, lengthDays: 30 },
  { lunarYear: 1969, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 8, day: 13 }, lengthDays: 30 },
  { lunarYear: 1969, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 9, day: 12 }, lengthDays: 29 },
  { lunarYear: 1969, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 10, day: 11 }, lengthDays: 30 },
  { lunarYear: 1969, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 11, day: 10 }, lengthDays: 29 },
  { lunarYear: 1969, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1969, month: 12, day: 9 }, lengthDays: 30 },
  { lunarYear: 1969, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 1, day: 8 }, lengthDays: 29 },
  { lunarYear: 1970, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 2, day: 6 }, lengthDays: 30 },
  { lunarYear: 1970, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 3, day: 8 }, lengthDays: 29 },
  { lunarYear: 1970, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 4, day: 6 }, lengthDays: 29 },
  { lunarYear: 1970, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 5, day: 5 }, lengthDays: 30 },
  { lunarYear: 1970, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 6, day: 4 }, lengthDays: 30 },
  { lunarYear: 1970, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 7, day: 4 }, lengthDays: 29 },
  { lunarYear: 1970, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 8, day: 2 }, lengthDays: 30 },
  { lunarYear: 1970, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 9, day: 1 }, lengthDays: 29 },
  { lunarYear: 1970, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 9, day: 30 }, lengthDays: 30 },
  { lunarYear: 1970, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 10, day: 30 }, lengthDays: 30 },
  { lunarYear: 1970, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 11, day: 29 }, lengthDays: 29 },
  { lunarYear: 1970, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1970, month: 12, day: 28 }, lengthDays: 30 },
  { lunarYear: 1971, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 1, day: 27 }, lengthDays: 29 },
  { lunarYear: 1971, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 2, day: 25 }, lengthDays: 30 },
  { lunarYear: 1971, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 3, day: 27 }, lengthDays: 29 },
  { lunarYear: 1971, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 4, day: 25 }, lengthDays: 29 },
  { lunarYear: 1971, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 5, day: 24 }, lengthDays: 30 },
  { lunarYear: 1971, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1971, month: 6, day: 23 }, lengthDays: 29 },
  { lunarYear: 1971, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 7, day: 22 }, lengthDays: 30 },
  { lunarYear: 1971, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 8, day: 21 }, lengthDays: 29 },
  { lunarYear: 1971, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 9, day: 19 }, lengthDays: 30 },
  { lunarYear: 1971, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 10, day: 19 }, lengthDays: 30 },
  { lunarYear: 1971, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 11, day: 18 }, lengthDays: 30 },
  { lunarYear: 1971, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1971, month: 12, day: 18 }, lengthDays: 29 },
  { lunarYear: 1971, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 1, day: 16 }, lengthDays: 30 },
  { lunarYear: 1972, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 2, day: 15 }, lengthDays: 29 },
  { lunarYear: 1972, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 3, day: 15 }, lengthDays: 30 },
  { lunarYear: 1972, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 4, day: 14 }, lengthDays: 29 },
  { lunarYear: 1972, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 5, day: 13 }, lengthDays: 29 },
  { lunarYear: 1972, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 6, day: 11 }, lengthDays: 30 },
  { lunarYear: 1972, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 7, day: 11 }, lengthDays: 29 },
  { lunarYear: 1972, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 8, day: 9 }, lengthDays: 30 },
  { lunarYear: 1972, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 9, day: 8 }, lengthDays: 29 },
  { lunarYear: 1972, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 10, day: 7 }, lengthDays: 30 },
  { lunarYear: 1972, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 11, day: 6 }, lengthDays: 30 },
  { lunarYear: 1972, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1972, month: 12, day: 6 }, lengthDays: 30 },
  { lunarYear: 1972, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 1, day: 5 }, lengthDays: 29 },
  { lunarYear: 1973, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 2, day: 3 }, lengthDays: 30 },
  { lunarYear: 1973, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 3, day: 5 }, lengthDays: 29 },
  { lunarYear: 1973, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 4, day: 3 }, lengthDays: 30 },
  { lunarYear: 1973, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 5, day: 3 }, lengthDays: 29 },
  { lunarYear: 1973, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 6, day: 1 }, lengthDays: 29 },
  { lunarYear: 1973, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 6, day: 30 }, lengthDays: 30 },
  { lunarYear: 1973, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 7, day: 30 }, lengthDays: 29 },
  { lunarYear: 1973, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 8, day: 28 }, lengthDays: 29 },
  { lunarYear: 1973, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 9, day: 26 }, lengthDays: 30 },
  { lunarYear: 1973, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 10, day: 26 }, lengthDays: 30 },
  { lunarYear: 1973, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 11, day: 25 }, lengthDays: 30 },
  { lunarYear: 1973, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1973, month: 12, day: 25 }, lengthDays: 29 },
  { lunarYear: 1974, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 1, day: 23 }, lengthDays: 30 },
  { lunarYear: 1974, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 2, day: 22 }, lengthDays: 30 },
  { lunarYear: 1974, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 3, day: 24 }, lengthDays: 29 },
  { lunarYear: 1974, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 4, day: 22 }, lengthDays: 30 },
  { lunarYear: 1974, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1974, month: 5, day: 22 }, lengthDays: 29 },
  { lunarYear: 1974, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 6, day: 20 }, lengthDays: 29 },
  { lunarYear: 1974, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 7, day: 19 }, lengthDays: 30 },
  { lunarYear: 1974, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 8, day: 18 }, lengthDays: 29 },
  { lunarYear: 1974, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 9, day: 16 }, lengthDays: 29 },
  { lunarYear: 1974, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 10, day: 15 }, lengthDays: 30 },
  { lunarYear: 1974, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 11, day: 14 }, lengthDays: 30 },
  { lunarYear: 1974, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1974, month: 12, day: 14 }, lengthDays: 29 },
  { lunarYear: 1974, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 1, day: 12 }, lengthDays: 30 },
  { lunarYear: 1975, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 2, day: 11 }, lengthDays: 30 },
  { lunarYear: 1975, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 3, day: 13 }, lengthDays: 30 },
  { lunarYear: 1975, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 4, day: 12 }, lengthDays: 29 },
  { lunarYear: 1975, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 5, day: 11 }, lengthDays: 30 },
  { lunarYear: 1975, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 6, day: 10 }, lengthDays: 29 },
  { lunarYear: 1975, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 7, day: 9 }, lengthDays: 29 },
  { lunarYear: 1975, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 8, day: 7 }, lengthDays: 30 },
  { lunarYear: 1975, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 9, day: 6 }, lengthDays: 29 },
  { lunarYear: 1975, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 10, day: 5 }, lengthDays: 29 },
  { lunarYear: 1975, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 11, day: 3 }, lengthDays: 30 },
  { lunarYear: 1975, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1975, month: 12, day: 3 }, lengthDays: 29 },
  { lunarYear: 1975, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 1, day: 1 }, lengthDays: 30 },
  { lunarYear: 1976, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 1, day: 31 }, lengthDays: 30 },
  { lunarYear: 1976, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 3, day: 1 }, lengthDays: 30 },
  { lunarYear: 1976, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 3, day: 31 }, lengthDays: 29 },
  { lunarYear: 1976, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 4, day: 29 }, lengthDays: 30 },
  { lunarYear: 1976, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 5, day: 29 }, lengthDays: 29 },
  { lunarYear: 1976, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 6, day: 27 }, lengthDays: 30 },
  { lunarYear: 1976, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 7, day: 27 }, lengthDays: 29 },
  { lunarYear: 1976, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 8, day: 25 }, lengthDays: 30 },
  { lunarYear: 1976, lunarMonth: 8, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1976, month: 9, day: 24 }, lengthDays: 29 },
  { lunarYear: 1976, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 10, day: 23 }, lengthDays: 30 },
  { lunarYear: 1976, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 11, day: 22 }, lengthDays: 29 },
  { lunarYear: 1976, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1976, month: 12, day: 21 }, lengthDays: 29 },
  { lunarYear: 1976, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 1, day: 19 }, lengthDays: 30 },
  { lunarYear: 1977, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 2, day: 18 }, lengthDays: 30 },
  { lunarYear: 1977, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 3, day: 20 }, lengthDays: 29 },
  { lunarYear: 1977, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 4, day: 18 }, lengthDays: 30 },
  { lunarYear: 1977, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 5, day: 18 }, lengthDays: 30 },
  { lunarYear: 1977, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 6, day: 17 }, lengthDays: 29 },
  { lunarYear: 1977, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 7, day: 16 }, lengthDays: 30 },
  { lunarYear: 1977, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 8, day: 15 }, lengthDays: 29 },
  { lunarYear: 1977, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 9, day: 13 }, lengthDays: 30 },
  { lunarYear: 1977, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 10, day: 13 }, lengthDays: 29 },
  { lunarYear: 1977, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 11, day: 11 }, lengthDays: 30 },
  { lunarYear: 1977, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1977, month: 12, day: 11 }, lengthDays: 29 },
  { lunarYear: 1977, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 1, day: 9 }, lengthDays: 29 },
  { lunarYear: 1978, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 2, day: 7 }, lengthDays: 30 },
  { lunarYear: 1978, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 3, day: 9 }, lengthDays: 30 },
  { lunarYear: 1978, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 4, day: 8 }, lengthDays: 29 },
  { lunarYear: 1978, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 5, day: 7 }, lengthDays: 30 },
  { lunarYear: 1978, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 6, day: 6 }, lengthDays: 29 },
  { lunarYear: 1978, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 7, day: 5 }, lengthDays: 30 },
  { lunarYear: 1978, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 8, day: 4 }, lengthDays: 30 },
  { lunarYear: 1978, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 9, day: 3 }, lengthDays: 29 },
  { lunarYear: 1978, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 10, day: 2 }, lengthDays: 30 },
  { lunarYear: 1978, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 11, day: 1 }, lengthDays: 29 },
  { lunarYear: 1978, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 11, day: 30 }, lengthDays: 30 },
  { lunarYear: 1978, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1978, month: 12, day: 30 }, lengthDays: 29 },
  { lunarYear: 1979, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 1, day: 28 }, lengthDays: 30 },
  { lunarYear: 1979, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 2, day: 27 }, lengthDays: 29 },
  { lunarYear: 1979, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 3, day: 28 }, lengthDays: 29 },
  { lunarYear: 1979, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 4, day: 26 }, lengthDays: 30 },
  { lunarYear: 1979, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 5, day: 26 }, lengthDays: 29 },
  { lunarYear: 1979, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 6, day: 24 }, lengthDays: 30 },
  { lunarYear: 1979, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1979, month: 7, day: 24 }, lengthDays: 30 },
  { lunarYear: 1979, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 8, day: 23 }, lengthDays: 29 },
  { lunarYear: 1979, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 9, day: 21 }, lengthDays: 30 },
  { lunarYear: 1979, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 10, day: 21 }, lengthDays: 30 },
  { lunarYear: 1979, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 11, day: 20 }, lengthDays: 29 },
  { lunarYear: 1979, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1979, month: 12, day: 19 }, lengthDays: 30 },
  { lunarYear: 1979, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 1, day: 18 }, lengthDays: 29 },
  { lunarYear: 1980, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 2, day: 16 }, lengthDays: 30 },
  { lunarYear: 1980, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 3, day: 17 }, lengthDays: 29 },
  { lunarYear: 1980, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 4, day: 15 }, lengthDays: 29 },
  { lunarYear: 1980, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 5, day: 14 }, lengthDays: 30 },
  { lunarYear: 1980, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 6, day: 13 }, lengthDays: 29 },
  { lunarYear: 1980, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 7, day: 12 }, lengthDays: 30 },
  { lunarYear: 1980, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 8, day: 11 }, lengthDays: 29 },
  { lunarYear: 1980, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 9, day: 9 }, lengthDays: 30 },
  { lunarYear: 1980, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 10, day: 9 }, lengthDays: 30 },
  { lunarYear: 1980, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 11, day: 8 }, lengthDays: 29 },
  { lunarYear: 1980, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1980, month: 12, day: 7 }, lengthDays: 30 },
  { lunarYear: 1980, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 1, day: 6 }, lengthDays: 30 },
  { lunarYear: 1981, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 2, day: 5 }, lengthDays: 29 },
  { lunarYear: 1981, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 3, day: 6 }, lengthDays: 30 },
  { lunarYear: 1981, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 4, day: 5 }, lengthDays: 29 },
  { lunarYear: 1981, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 5, day: 4 }, lengthDays: 29 },
  { lunarYear: 1981, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 6, day: 2 }, lengthDays: 30 },
  { lunarYear: 1981, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 7, day: 2 }, lengthDays: 29 },
  { lunarYear: 1981, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 7, day: 31 }, lengthDays: 29 },
  { lunarYear: 1981, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 8, day: 29 }, lengthDays: 30 },
  { lunarYear: 1981, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 9, day: 28 }, lengthDays: 30 },
  { lunarYear: 1981, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 10, day: 28 }, lengthDays: 29 },
  { lunarYear: 1981, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 11, day: 26 }, lengthDays: 30 },
  { lunarYear: 1981, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1981, month: 12, day: 26 }, lengthDays: 30 },
  { lunarYear: 1982, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 1, day: 25 }, lengthDays: 30 },
  { lunarYear: 1982, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 2, day: 24 }, lengthDays: 29 },
  { lunarYear: 1982, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 3, day: 25 }, lengthDays: 30 },
  { lunarYear: 1982, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 4, day: 24 }, lengthDays: 29 },
  { lunarYear: 1982, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1982, month: 5, day: 23 }, lengthDays: 29 },
  { lunarYear: 1982, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 6, day: 21 }, lengthDays: 30 },
  { lunarYear: 1982, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 7, day: 21 }, lengthDays: 29 },
  { lunarYear: 1982, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 8, day: 19 }, lengthDays: 29 },
  { lunarYear: 1982, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 9, day: 17 }, lengthDays: 30 },
  { lunarYear: 1982, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 10, day: 17 }, lengthDays: 30 },
  { lunarYear: 1982, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 11, day: 16 }, lengthDays: 29 },
  { lunarYear: 1982, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1982, month: 12, day: 15 }, lengthDays: 30 },
  { lunarYear: 1982, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 1, day: 14 }, lengthDays: 30 },
  { lunarYear: 1983, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 2, day: 13 }, lengthDays: 30 },
  { lunarYear: 1983, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 3, day: 15 }, lengthDays: 29 },
  { lunarYear: 1983, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 4, day: 13 }, lengthDays: 30 },
  { lunarYear: 1983, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 5, day: 13 }, lengthDays: 29 },
  { lunarYear: 1983, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 6, day: 11 }, lengthDays: 29 },
  { lunarYear: 1983, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 7, day: 10 }, lengthDays: 30 },
  { lunarYear: 1983, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 8, day: 9 }, lengthDays: 29 },
  { lunarYear: 1983, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 9, day: 7 }, lengthDays: 29 },
  { lunarYear: 1983, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 10, day: 6 }, lengthDays: 30 },
  { lunarYear: 1983, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 11, day: 5 }, lengthDays: 29 },
  { lunarYear: 1983, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1983, month: 12, day: 4 }, lengthDays: 30 },
  { lunarYear: 1983, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 1, day: 3 }, lengthDays: 30 },
  { lunarYear: 1984, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 2, day: 2 }, lengthDays: 30 },
  { lunarYear: 1984, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 3, day: 3 }, lengthDays: 29 },
  { lunarYear: 1984, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 4, day: 1 }, lengthDays: 30 },
  { lunarYear: 1984, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 5, day: 1 }, lengthDays: 30 },
  { lunarYear: 1984, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 5, day: 31 }, lengthDays: 29 },
  { lunarYear: 1984, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 6, day: 29 }, lengthDays: 29 },
  { lunarYear: 1984, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 7, day: 28 }, lengthDays: 30 },
  { lunarYear: 1984, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 8, day: 27 }, lengthDays: 29 },
  { lunarYear: 1984, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 9, day: 25 }, lengthDays: 29 },
  { lunarYear: 1984, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 10, day: 24 }, lengthDays: 30 },
  { lunarYear: 1984, lunarMonth: 10, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1984, month: 11, day: 23 }, lengthDays: 29 },
  { lunarYear: 1984, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1984, month: 12, day: 22 }, lengthDays: 30 },
  { lunarYear: 1984, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 1, day: 21 }, lengthDays: 30 },
  { lunarYear: 1985, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 2, day: 20 }, lengthDays: 29 },
  { lunarYear: 1985, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 3, day: 21 }, lengthDays: 30 },
  { lunarYear: 1985, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 4, day: 20 }, lengthDays: 30 },
  { lunarYear: 1985, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 5, day: 20 }, lengthDays: 29 },
  { lunarYear: 1985, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 6, day: 18 }, lengthDays: 30 },
  { lunarYear: 1985, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 7, day: 18 }, lengthDays: 29 },
  { lunarYear: 1985, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 8, day: 16 }, lengthDays: 30 },
  { lunarYear: 1985, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 9, day: 15 }, lengthDays: 29 },
  { lunarYear: 1985, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 10, day: 14 }, lengthDays: 29 },
  { lunarYear: 1985, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 11, day: 12 }, lengthDays: 30 },
  { lunarYear: 1985, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1985, month: 12, day: 12 }, lengthDays: 29 },
  { lunarYear: 1985, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 1, day: 10 }, lengthDays: 30 },
  { lunarYear: 1986, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 2, day: 9 }, lengthDays: 29 },
  { lunarYear: 1986, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 3, day: 10 }, lengthDays: 30 },
  { lunarYear: 1986, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 4, day: 9 }, lengthDays: 30 },
  { lunarYear: 1986, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 5, day: 9 }, lengthDays: 29 },
  { lunarYear: 1986, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 6, day: 7 }, lengthDays: 30 },
  { lunarYear: 1986, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 7, day: 7 }, lengthDays: 30 },
  { lunarYear: 1986, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 8, day: 6 }, lengthDays: 29 },
  { lunarYear: 1986, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 9, day: 4 }, lengthDays: 30 },
  { lunarYear: 1986, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 10, day: 4 }, lengthDays: 29 },
  { lunarYear: 1986, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 11, day: 2 }, lengthDays: 30 },
  { lunarYear: 1986, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 12, day: 2 }, lengthDays: 29 },
  { lunarYear: 1986, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1986, month: 12, day: 31 }, lengthDays: 29 },
  { lunarYear: 1987, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 1, day: 29 }, lengthDays: 30 },
  { lunarYear: 1987, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 2, day: 28 }, lengthDays: 29 },
  { lunarYear: 1987, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 3, day: 29 }, lengthDays: 30 },
  { lunarYear: 1987, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 4, day: 28 }, lengthDays: 30 },
  { lunarYear: 1987, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 5, day: 28 }, lengthDays: 29 },
  { lunarYear: 1987, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 6, day: 26 }, lengthDays: 30 },
  { lunarYear: 1987, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1987, month: 7, day: 26 }, lengthDays: 29 },
  { lunarYear: 1987, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 8, day: 24 }, lengthDays: 30 },
  { lunarYear: 1987, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 9, day: 23 }, lengthDays: 30 },
  { lunarYear: 1987, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 10, day: 23 }, lengthDays: 29 },
  { lunarYear: 1987, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 11, day: 21 }, lengthDays: 30 },
  { lunarYear: 1987, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1987, month: 12, day: 21 }, lengthDays: 29 },
  { lunarYear: 1987, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 1, day: 19 }, lengthDays: 30 },
  { lunarYear: 1988, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 2, day: 18 }, lengthDays: 29 },
  { lunarYear: 1988, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 3, day: 18 }, lengthDays: 29 },
  { lunarYear: 1988, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 4, day: 16 }, lengthDays: 30 },
  { lunarYear: 1988, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 5, day: 16 }, lengthDays: 29 },
  { lunarYear: 1988, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 6, day: 14 }, lengthDays: 30 },
  { lunarYear: 1988, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 7, day: 14 }, lengthDays: 29 },
  { lunarYear: 1988, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 8, day: 12 }, lengthDays: 30 },
  { lunarYear: 1988, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 9, day: 11 }, lengthDays: 30 },
  { lunarYear: 1988, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 10, day: 11 }, lengthDays: 29 },
  { lunarYear: 1988, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 11, day: 9 }, lengthDays: 30 },
  { lunarYear: 1988, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1988, month: 12, day: 9 }, lengthDays: 30 },
  { lunarYear: 1988, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 1, day: 8 }, lengthDays: 29 },
  { lunarYear: 1989, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 2, day: 6 }, lengthDays: 30 },
  { lunarYear: 1989, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 3, day: 8 }, lengthDays: 29 },
  { lunarYear: 1989, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 4, day: 6 }, lengthDays: 29 },
  { lunarYear: 1989, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 5, day: 5 }, lengthDays: 30 },
  { lunarYear: 1989, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 6, day: 4 }, lengthDays: 29 },
  { lunarYear: 1989, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 7, day: 3 }, lengthDays: 30 },
  { lunarYear: 1989, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 8, day: 2 }, lengthDays: 29 },
  { lunarYear: 1989, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 8, day: 31 }, lengthDays: 30 },
  { lunarYear: 1989, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 9, day: 30 }, lengthDays: 30 },
  { lunarYear: 1989, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 10, day: 30 }, lengthDays: 29 },
  { lunarYear: 1989, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 11, day: 28 }, lengthDays: 30 },
  { lunarYear: 1989, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1989, month: 12, day: 28 }, lengthDays: 30 },
  { lunarYear: 1990, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 1, day: 27 }, lengthDays: 29 },
  { lunarYear: 1990, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 2, day: 25 }, lengthDays: 30 },
  { lunarYear: 1990, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 3, day: 27 }, lengthDays: 29 },
  { lunarYear: 1990, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 4, day: 25 }, lengthDays: 29 },
  { lunarYear: 1990, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 5, day: 24 }, lengthDays: 30 },
  { lunarYear: 1990, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1990, month: 6, day: 23 }, lengthDays: 29 },
  { lunarYear: 1990, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 7, day: 22 }, lengthDays: 29 },
  { lunarYear: 1990, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 8, day: 20 }, lengthDays: 30 },
  { lunarYear: 1990, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 9, day: 19 }, lengthDays: 30 },
  { lunarYear: 1990, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 10, day: 19 }, lengthDays: 29 },
  { lunarYear: 1990, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 11, day: 17 }, lengthDays: 30 },
  { lunarYear: 1990, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1990, month: 12, day: 17 }, lengthDays: 30 },
  { lunarYear: 1990, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 1, day: 16 }, lengthDays: 30 },
  { lunarYear: 1991, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 2, day: 15 }, lengthDays: 29 },
  { lunarYear: 1991, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 3, day: 16 }, lengthDays: 30 },
  { lunarYear: 1991, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 4, day: 15 }, lengthDays: 29 },
  { lunarYear: 1991, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 5, day: 14 }, lengthDays: 29 },
  { lunarYear: 1991, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 6, day: 12 }, lengthDays: 30 },
  { lunarYear: 1991, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 7, day: 12 }, lengthDays: 29 },
  { lunarYear: 1991, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 8, day: 10 }, lengthDays: 29 },
  { lunarYear: 1991, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 9, day: 8 }, lengthDays: 30 },
  { lunarYear: 1991, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 10, day: 8 }, lengthDays: 29 },
  { lunarYear: 1991, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 11, day: 6 }, lengthDays: 30 },
  { lunarYear: 1991, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1991, month: 12, day: 6 }, lengthDays: 30 },
  { lunarYear: 1991, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 1, day: 5 }, lengthDays: 30 },
  { lunarYear: 1992, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 2, day: 4 }, lengthDays: 29 },
  { lunarYear: 1992, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 3, day: 4 }, lengthDays: 30 },
  { lunarYear: 1992, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 4, day: 3 }, lengthDays: 30 },
  { lunarYear: 1992, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 5, day: 3 }, lengthDays: 29 },
  { lunarYear: 1992, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 6, day: 1 }, lengthDays: 29 },
  { lunarYear: 1992, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 6, day: 30 }, lengthDays: 30 },
  { lunarYear: 1992, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 7, day: 30 }, lengthDays: 29 },
  { lunarYear: 1992, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 8, day: 28 }, lengthDays: 29 },
  { lunarYear: 1992, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 9, day: 26 }, lengthDays: 30 },
  { lunarYear: 1992, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 10, day: 26 }, lengthDays: 29 },
  { lunarYear: 1992, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 11, day: 24 }, lengthDays: 30 },
  { lunarYear: 1992, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1992, month: 12, day: 24 }, lengthDays: 30 },
  { lunarYear: 1993, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 1, day: 23 }, lengthDays: 29 },
  { lunarYear: 1993, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 2, day: 21 }, lengthDays: 30 },
  { lunarYear: 1993, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 3, day: 23 }, lengthDays: 30 },
  { lunarYear: 1993, lunarMonth: 3, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1993, month: 4, day: 22 }, lengthDays: 29 },
  { lunarYear: 1993, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 5, day: 21 }, lengthDays: 30 },
  { lunarYear: 1993, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 6, day: 20 }, lengthDays: 29 },
  { lunarYear: 1993, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 7, day: 19 }, lengthDays: 30 },
  { lunarYear: 1993, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 8, day: 18 }, lengthDays: 29 },
  { lunarYear: 1993, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 9, day: 16 }, lengthDays: 29 },
  { lunarYear: 1993, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 10, day: 15 }, lengthDays: 30 },
  { lunarYear: 1993, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 11, day: 14 }, lengthDays: 29 },
  { lunarYear: 1993, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1993, month: 12, day: 13 }, lengthDays: 30 },
  { lunarYear: 1993, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 1, day: 12 }, lengthDays: 29 },
  { lunarYear: 1994, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 2, day: 10 }, lengthDays: 30 },
  { lunarYear: 1994, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 3, day: 12 }, lengthDays: 30 },
  { lunarYear: 1994, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 4, day: 11 }, lengthDays: 30 },
  { lunarYear: 1994, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 5, day: 11 }, lengthDays: 29 },
  { lunarYear: 1994, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 6, day: 9 }, lengthDays: 30 },
  { lunarYear: 1994, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 7, day: 9 }, lengthDays: 29 },
  { lunarYear: 1994, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 8, day: 7 }, lengthDays: 30 },
  { lunarYear: 1994, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 9, day: 6 }, lengthDays: 29 },
  { lunarYear: 1994, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 10, day: 5 }, lengthDays: 29 },
  { lunarYear: 1994, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 11, day: 3 }, lengthDays: 30 },
  { lunarYear: 1994, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1994, month: 12, day: 3 }, lengthDays: 29 },
  { lunarYear: 1994, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 1, day: 1 }, lengthDays: 30 },
  { lunarYear: 1995, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 1, day: 31 }, lengthDays: 29 },
  { lunarYear: 1995, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 3, day: 1 }, lengthDays: 30 },
  { lunarYear: 1995, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 3, day: 31 }, lengthDays: 30 },
  { lunarYear: 1995, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 4, day: 30 }, lengthDays: 29 },
  { lunarYear: 1995, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 5, day: 29 }, lengthDays: 30 },
  { lunarYear: 1995, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 6, day: 28 }, lengthDays: 30 },
  { lunarYear: 1995, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 7, day: 28 }, lengthDays: 29 },
  { lunarYear: 1995, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 8, day: 26 }, lengthDays: 30 },
  { lunarYear: 1995, lunarMonth: 8, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1995, month: 9, day: 25 }, lengthDays: 29 },
  { lunarYear: 1995, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 10, day: 24 }, lengthDays: 30 },
  { lunarYear: 1995, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 11, day: 23 }, lengthDays: 29 },
  { lunarYear: 1995, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1995, month: 12, day: 22 }, lengthDays: 29 },
  { lunarYear: 1995, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 1, day: 20 }, lengthDays: 30 },
  { lunarYear: 1996, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 2, day: 19 }, lengthDays: 29 },
  { lunarYear: 1996, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 3, day: 19 }, lengthDays: 30 },
  { lunarYear: 1996, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 4, day: 18 }, lengthDays: 29 },
  { lunarYear: 1996, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 5, day: 17 }, lengthDays: 30 },
  { lunarYear: 1996, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 6, day: 16 }, lengthDays: 30 },
  { lunarYear: 1996, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 7, day: 16 }, lengthDays: 29 },
  { lunarYear: 1996, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 8, day: 14 }, lengthDays: 30 },
  { lunarYear: 1996, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 9, day: 13 }, lengthDays: 29 },
  { lunarYear: 1996, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 10, day: 12 }, lengthDays: 30 },
  { lunarYear: 1996, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 11, day: 11 }, lengthDays: 30 },
  { lunarYear: 1996, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1996, month: 12, day: 11 }, lengthDays: 29 },
  { lunarYear: 1996, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 1, day: 9 }, lengthDays: 30 },
  { lunarYear: 1997, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 2, day: 8 }, lengthDays: 29 },
  { lunarYear: 1997, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 3, day: 9 }, lengthDays: 29 },
  { lunarYear: 1997, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 4, day: 7 }, lengthDays: 30 },
  { lunarYear: 1997, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 5, day: 7 }, lengthDays: 29 },
  { lunarYear: 1997, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 6, day: 5 }, lengthDays: 30 },
  { lunarYear: 1997, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 7, day: 5 }, lengthDays: 29 },
  { lunarYear: 1997, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 8, day: 3 }, lengthDays: 30 },
  { lunarYear: 1997, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 9, day: 2 }, lengthDays: 30 },
  { lunarYear: 1997, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 10, day: 2 }, lengthDays: 29 },
  { lunarYear: 1997, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 10, day: 31 }, lengthDays: 30 },
  { lunarYear: 1997, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 11, day: 30 }, lengthDays: 30 },
  { lunarYear: 1997, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1997, month: 12, day: 30 }, lengthDays: 29 },
  { lunarYear: 1998, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 1, day: 28 }, lengthDays: 30 },
  { lunarYear: 1998, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 2, day: 27 }, lengthDays: 29 },
  { lunarYear: 1998, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 3, day: 28 }, lengthDays: 29 },
  { lunarYear: 1998, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 4, day: 26 }, lengthDays: 30 },
  { lunarYear: 1998, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 5, day: 26 }, lengthDays: 29 },
  { lunarYear: 1998, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 1998, month: 6, day: 24 }, lengthDays: 29 },
  { lunarYear: 1998, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 7, day: 23 }, lengthDays: 30 },
  { lunarYear: 1998, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 8, day: 22 }, lengthDays: 30 },
  { lunarYear: 1998, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 9, day: 21 }, lengthDays: 29 },
  { lunarYear: 1998, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 10, day: 20 }, lengthDays: 30 },
  { lunarYear: 1998, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 11, day: 19 }, lengthDays: 30 },
  { lunarYear: 1998, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1998, month: 12, day: 19 }, lengthDays: 30 },
  { lunarYear: 1998, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 1, day: 18 }, lengthDays: 29 },
  { lunarYear: 1999, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 2, day: 16 }, lengthDays: 30 },
  { lunarYear: 1999, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 3, day: 18 }, lengthDays: 29 },
  { lunarYear: 1999, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 4, day: 16 }, lengthDays: 29 },
  { lunarYear: 1999, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 5, day: 15 }, lengthDays: 30 },
  { lunarYear: 1999, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 6, day: 14 }, lengthDays: 29 },
  { lunarYear: 1999, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 7, day: 13 }, lengthDays: 29 },
  { lunarYear: 1999, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 8, day: 11 }, lengthDays: 30 },
  { lunarYear: 1999, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 9, day: 10 }, lengthDays: 29 },
  { lunarYear: 1999, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 10, day: 9 }, lengthDays: 30 },
  { lunarYear: 1999, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 11, day: 8 }, lengthDays: 30 },
  { lunarYear: 1999, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 1999, month: 12, day: 8 }, lengthDays: 30 },
  { lunarYear: 1999, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 1, day: 7 }, lengthDays: 29 },
  { lunarYear: 2e3, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 2, day: 5 }, lengthDays: 30 },
  { lunarYear: 2e3, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 3, day: 6 }, lengthDays: 30 },
  { lunarYear: 2e3, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 4, day: 5 }, lengthDays: 29 },
  { lunarYear: 2e3, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 5, day: 4 }, lengthDays: 29 },
  { lunarYear: 2e3, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 6, day: 2 }, lengthDays: 30 },
  { lunarYear: 2e3, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 7, day: 2 }, lengthDays: 29 },
  { lunarYear: 2e3, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 7, day: 31 }, lengthDays: 29 },
  { lunarYear: 2e3, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 8, day: 29 }, lengthDays: 30 },
  { lunarYear: 2e3, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 9, day: 28 }, lengthDays: 29 },
  { lunarYear: 2e3, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 10, day: 27 }, lengthDays: 30 },
  { lunarYear: 2e3, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 11, day: 26 }, lengthDays: 30 },
  { lunarYear: 2e3, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2e3, month: 12, day: 26 }, lengthDays: 29 },
  { lunarYear: 2001, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 1, day: 24 }, lengthDays: 30 },
  { lunarYear: 2001, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 2, day: 23 }, lengthDays: 30 },
  { lunarYear: 2001, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 3, day: 25 }, lengthDays: 30 },
  { lunarYear: 2001, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 4, day: 24 }, lengthDays: 29 },
  { lunarYear: 2001, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2001, month: 5, day: 23 }, lengthDays: 29 },
  { lunarYear: 2001, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 6, day: 21 }, lengthDays: 30 },
  { lunarYear: 2001, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 7, day: 21 }, lengthDays: 29 },
  { lunarYear: 2001, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 8, day: 19 }, lengthDays: 29 },
  { lunarYear: 2001, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 9, day: 17 }, lengthDays: 30 },
  { lunarYear: 2001, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 10, day: 17 }, lengthDays: 29 },
  { lunarYear: 2001, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 11, day: 15 }, lengthDays: 30 },
  { lunarYear: 2001, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2001, month: 12, day: 15 }, lengthDays: 29 },
  { lunarYear: 2001, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 1, day: 13 }, lengthDays: 30 },
  { lunarYear: 2002, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 2, day: 12 }, lengthDays: 30 },
  { lunarYear: 2002, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 3, day: 14 }, lengthDays: 30 },
  { lunarYear: 2002, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 4, day: 13 }, lengthDays: 29 },
  { lunarYear: 2002, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 5, day: 12 }, lengthDays: 30 },
  { lunarYear: 2002, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 6, day: 11 }, lengthDays: 29 },
  { lunarYear: 2002, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 7, day: 10 }, lengthDays: 30 },
  { lunarYear: 2002, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 8, day: 9 }, lengthDays: 29 },
  { lunarYear: 2002, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 9, day: 7 }, lengthDays: 29 },
  { lunarYear: 2002, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 10, day: 6 }, lengthDays: 30 },
  { lunarYear: 2002, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 11, day: 5 }, lengthDays: 29 },
  { lunarYear: 2002, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2002, month: 12, day: 4 }, lengthDays: 30 },
  { lunarYear: 2002, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 1, day: 3 }, lengthDays: 29 },
  { lunarYear: 2003, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 2, day: 1 }, lengthDays: 30 },
  { lunarYear: 2003, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 3, day: 3 }, lengthDays: 30 },
  { lunarYear: 2003, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 4, day: 2 }, lengthDays: 29 },
  { lunarYear: 2003, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 5, day: 1 }, lengthDays: 30 },
  { lunarYear: 2003, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 5, day: 31 }, lengthDays: 30 },
  { lunarYear: 2003, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 6, day: 30 }, lengthDays: 29 },
  { lunarYear: 2003, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 7, day: 29 }, lengthDays: 30 },
  { lunarYear: 2003, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 8, day: 28 }, lengthDays: 29 },
  { lunarYear: 2003, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 9, day: 26 }, lengthDays: 29 },
  { lunarYear: 2003, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 10, day: 25 }, lengthDays: 30 },
  { lunarYear: 2003, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 11, day: 24 }, lengthDays: 29 },
  { lunarYear: 2003, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2003, month: 12, day: 23 }, lengthDays: 30 },
  { lunarYear: 2004, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 1, day: 22 }, lengthDays: 29 },
  { lunarYear: 2004, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 2, day: 20 }, lengthDays: 30 },
  { lunarYear: 2004, lunarMonth: 2, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2004, month: 3, day: 21 }, lengthDays: 29 },
  { lunarYear: 2004, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 4, day: 19 }, lengthDays: 30 },
  { lunarYear: 2004, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 5, day: 19 }, lengthDays: 30 },
  { lunarYear: 2004, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 6, day: 18 }, lengthDays: 29 },
  { lunarYear: 2004, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 7, day: 17 }, lengthDays: 30 },
  { lunarYear: 2004, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 8, day: 16 }, lengthDays: 29 },
  { lunarYear: 2004, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 9, day: 14 }, lengthDays: 30 },
  { lunarYear: 2004, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 10, day: 14 }, lengthDays: 29 },
  { lunarYear: 2004, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 11, day: 12 }, lengthDays: 30 },
  { lunarYear: 2004, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2004, month: 12, day: 12 }, lengthDays: 29 },
  { lunarYear: 2004, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 1, day: 10 }, lengthDays: 30 },
  { lunarYear: 2005, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 2, day: 9 }, lengthDays: 29 },
  { lunarYear: 2005, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 3, day: 10 }, lengthDays: 30 },
  { lunarYear: 2005, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 4, day: 9 }, lengthDays: 29 },
  { lunarYear: 2005, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 5, day: 8 }, lengthDays: 30 },
  { lunarYear: 2005, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 6, day: 7 }, lengthDays: 29 },
  { lunarYear: 2005, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 7, day: 6 }, lengthDays: 30 },
  { lunarYear: 2005, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 8, day: 5 }, lengthDays: 30 },
  { lunarYear: 2005, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 9, day: 4 }, lengthDays: 29 },
  { lunarYear: 2005, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 10, day: 3 }, lengthDays: 30 },
  { lunarYear: 2005, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 11, day: 2 }, lengthDays: 30 },
  { lunarYear: 2005, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 12, day: 2 }, lengthDays: 29 },
  { lunarYear: 2005, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2005, month: 12, day: 31 }, lengthDays: 29 },
  { lunarYear: 2006, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 1, day: 29 }, lengthDays: 30 },
  { lunarYear: 2006, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 2, day: 28 }, lengthDays: 29 },
  { lunarYear: 2006, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 3, day: 29 }, lengthDays: 30 },
  { lunarYear: 2006, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 4, day: 28 }, lengthDays: 29 },
  { lunarYear: 2006, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 5, day: 27 }, lengthDays: 30 },
  { lunarYear: 2006, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 6, day: 26 }, lengthDays: 29 },
  { lunarYear: 2006, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 7, day: 25 }, lengthDays: 30 },
  { lunarYear: 2006, lunarMonth: 7, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2006, month: 8, day: 24 }, lengthDays: 29 },
  { lunarYear: 2006, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 9, day: 22 }, lengthDays: 30 },
  { lunarYear: 2006, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 10, day: 22 }, lengthDays: 30 },
  { lunarYear: 2006, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 11, day: 21 }, lengthDays: 29 },
  { lunarYear: 2006, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2006, month: 12, day: 20 }, lengthDays: 30 },
  { lunarYear: 2006, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 1, day: 19 }, lengthDays: 30 },
  { lunarYear: 2007, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 2, day: 18 }, lengthDays: 29 },
  { lunarYear: 2007, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 3, day: 19 }, lengthDays: 29 },
  { lunarYear: 2007, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 4, day: 17 }, lengthDays: 30 },
  { lunarYear: 2007, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 5, day: 17 }, lengthDays: 29 },
  { lunarYear: 2007, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 6, day: 15 }, lengthDays: 29 },
  { lunarYear: 2007, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 7, day: 14 }, lengthDays: 30 },
  { lunarYear: 2007, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 8, day: 13 }, lengthDays: 29 },
  { lunarYear: 2007, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 9, day: 11 }, lengthDays: 30 },
  { lunarYear: 2007, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 10, day: 11 }, lengthDays: 30 },
  { lunarYear: 2007, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 11, day: 10 }, lengthDays: 30 },
  { lunarYear: 2007, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2007, month: 12, day: 10 }, lengthDays: 29 },
  { lunarYear: 2007, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 1, day: 8 }, lengthDays: 30 },
  { lunarYear: 2008, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 2, day: 7 }, lengthDays: 30 },
  { lunarYear: 2008, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 3, day: 8 }, lengthDays: 29 },
  { lunarYear: 2008, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 4, day: 6 }, lengthDays: 29 },
  { lunarYear: 2008, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 5, day: 5 }, lengthDays: 30 },
  { lunarYear: 2008, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 6, day: 4 }, lengthDays: 29 },
  { lunarYear: 2008, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 7, day: 3 }, lengthDays: 29 },
  { lunarYear: 2008, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 8, day: 1 }, lengthDays: 30 },
  { lunarYear: 2008, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 8, day: 31 }, lengthDays: 29 },
  { lunarYear: 2008, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 9, day: 29 }, lengthDays: 30 },
  { lunarYear: 2008, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 10, day: 29 }, lengthDays: 30 },
  { lunarYear: 2008, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 11, day: 28 }, lengthDays: 29 },
  { lunarYear: 2008, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2008, month: 12, day: 27 }, lengthDays: 30 },
  { lunarYear: 2009, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 1, day: 26 }, lengthDays: 30 },
  { lunarYear: 2009, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 2, day: 25 }, lengthDays: 30 },
  { lunarYear: 2009, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 3, day: 27 }, lengthDays: 29 },
  { lunarYear: 2009, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 4, day: 25 }, lengthDays: 29 },
  { lunarYear: 2009, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 5, day: 24 }, lengthDays: 30 },
  { lunarYear: 2009, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2009, month: 6, day: 23 }, lengthDays: 29 },
  { lunarYear: 2009, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 7, day: 22 }, lengthDays: 29 },
  { lunarYear: 2009, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 8, day: 20 }, lengthDays: 30 },
  { lunarYear: 2009, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 9, day: 19 }, lengthDays: 29 },
  { lunarYear: 2009, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 10, day: 18 }, lengthDays: 30 },
  { lunarYear: 2009, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 11, day: 17 }, lengthDays: 29 },
  { lunarYear: 2009, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2009, month: 12, day: 16 }, lengthDays: 30 },
  { lunarYear: 2009, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 1, day: 15 }, lengthDays: 30 },
  { lunarYear: 2010, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 2, day: 14 }, lengthDays: 30 },
  { lunarYear: 2010, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 3, day: 16 }, lengthDays: 29 },
  { lunarYear: 2010, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 4, day: 14 }, lengthDays: 30 },
  { lunarYear: 2010, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 5, day: 14 }, lengthDays: 29 },
  { lunarYear: 2010, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 6, day: 12 }, lengthDays: 30 },
  { lunarYear: 2010, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 7, day: 12 }, lengthDays: 29 },
  { lunarYear: 2010, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 8, day: 10 }, lengthDays: 29 },
  { lunarYear: 2010, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 9, day: 8 }, lengthDays: 30 },
  { lunarYear: 2010, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 10, day: 8 }, lengthDays: 29 },
  { lunarYear: 2010, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 11, day: 6 }, lengthDays: 30 },
  { lunarYear: 2010, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2010, month: 12, day: 6 }, lengthDays: 29 },
  { lunarYear: 2010, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 1, day: 4 }, lengthDays: 30 },
  { lunarYear: 2011, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 2, day: 3 }, lengthDays: 30 },
  { lunarYear: 2011, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 3, day: 5 }, lengthDays: 29 },
  { lunarYear: 2011, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 4, day: 3 }, lengthDays: 30 },
  { lunarYear: 2011, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 5, day: 3 }, lengthDays: 30 },
  { lunarYear: 2011, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 6, day: 2 }, lengthDays: 29 },
  { lunarYear: 2011, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 7, day: 1 }, lengthDays: 30 },
  { lunarYear: 2011, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 7, day: 31 }, lengthDays: 29 },
  { lunarYear: 2011, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 8, day: 29 }, lengthDays: 29 },
  { lunarYear: 2011, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 9, day: 27 }, lengthDays: 30 },
  { lunarYear: 2011, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 10, day: 27 }, lengthDays: 29 },
  { lunarYear: 2011, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 11, day: 25 }, lengthDays: 30 },
  { lunarYear: 2011, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2011, month: 12, day: 25 }, lengthDays: 29 },
  { lunarYear: 2012, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 1, day: 23 }, lengthDays: 30 },
  { lunarYear: 2012, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 2, day: 22 }, lengthDays: 29 },
  { lunarYear: 2012, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 3, day: 22 }, lengthDays: 30 },
  { lunarYear: 2012, lunarMonth: 3, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2012, month: 4, day: 21 }, lengthDays: 30 },
  { lunarYear: 2012, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 5, day: 21 }, lengthDays: 30 },
  { lunarYear: 2012, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 6, day: 20 }, lengthDays: 29 },
  { lunarYear: 2012, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 7, day: 19 }, lengthDays: 30 },
  { lunarYear: 2012, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 8, day: 18 }, lengthDays: 29 },
  { lunarYear: 2012, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 9, day: 16 }, lengthDays: 29 },
  { lunarYear: 2012, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 10, day: 15 }, lengthDays: 30 },
  { lunarYear: 2012, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 11, day: 14 }, lengthDays: 29 },
  { lunarYear: 2012, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2012, month: 12, day: 13 }, lengthDays: 30 },
  { lunarYear: 2012, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 1, day: 12 }, lengthDays: 29 },
  { lunarYear: 2013, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 2, day: 10 }, lengthDays: 30 },
  { lunarYear: 2013, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 3, day: 12 }, lengthDays: 29 },
  { lunarYear: 2013, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 4, day: 10 }, lengthDays: 30 },
  { lunarYear: 2013, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 5, day: 10 }, lengthDays: 30 },
  { lunarYear: 2013, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 6, day: 9 }, lengthDays: 29 },
  { lunarYear: 2013, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 7, day: 8 }, lengthDays: 30 },
  { lunarYear: 2013, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 8, day: 7 }, lengthDays: 29 },
  { lunarYear: 2013, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 9, day: 5 }, lengthDays: 30 },
  { lunarYear: 2013, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 10, day: 5 }, lengthDays: 29 },
  { lunarYear: 2013, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 11, day: 3 }, lengthDays: 30 },
  { lunarYear: 2013, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2013, month: 12, day: 3 }, lengthDays: 29 },
  { lunarYear: 2013, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 1, day: 1 }, lengthDays: 30 },
  { lunarYear: 2014, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 1, day: 31 }, lengthDays: 29 },
  { lunarYear: 2014, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 3, day: 1 }, lengthDays: 30 },
  { lunarYear: 2014, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 3, day: 31 }, lengthDays: 29 },
  { lunarYear: 2014, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 4, day: 29 }, lengthDays: 30 },
  { lunarYear: 2014, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 5, day: 29 }, lengthDays: 29 },
  { lunarYear: 2014, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 6, day: 27 }, lengthDays: 30 },
  { lunarYear: 2014, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 7, day: 27 }, lengthDays: 29 },
  { lunarYear: 2014, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 8, day: 25 }, lengthDays: 30 },
  { lunarYear: 2014, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 9, day: 24 }, lengthDays: 30 },
  { lunarYear: 2014, lunarMonth: 9, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2014, month: 10, day: 24 }, lengthDays: 29 },
  { lunarYear: 2014, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 11, day: 22 }, lengthDays: 30 },
  { lunarYear: 2014, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2014, month: 12, day: 22 }, lengthDays: 29 },
  { lunarYear: 2014, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 1, day: 20 }, lengthDays: 30 },
  { lunarYear: 2015, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 2, day: 19 }, lengthDays: 29 },
  { lunarYear: 2015, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 3, day: 20 }, lengthDays: 30 },
  { lunarYear: 2015, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 4, day: 19 }, lengthDays: 29 },
  { lunarYear: 2015, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 5, day: 18 }, lengthDays: 29 },
  { lunarYear: 2015, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 6, day: 16 }, lengthDays: 30 },
  { lunarYear: 2015, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 7, day: 16 }, lengthDays: 29 },
  { lunarYear: 2015, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 8, day: 14 }, lengthDays: 30 },
  { lunarYear: 2015, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 9, day: 13 }, lengthDays: 30 },
  { lunarYear: 2015, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 10, day: 13 }, lengthDays: 30 },
  { lunarYear: 2015, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 11, day: 12 }, lengthDays: 29 },
  { lunarYear: 2015, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2015, month: 12, day: 11 }, lengthDays: 30 },
  { lunarYear: 2015, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 1, day: 10 }, lengthDays: 29 },
  { lunarYear: 2016, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 2, day: 8 }, lengthDays: 30 },
  { lunarYear: 2016, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 3, day: 9 }, lengthDays: 29 },
  { lunarYear: 2016, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 4, day: 7 }, lengthDays: 30 },
  { lunarYear: 2016, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 5, day: 7 }, lengthDays: 29 },
  { lunarYear: 2016, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 6, day: 5 }, lengthDays: 29 },
  { lunarYear: 2016, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 7, day: 4 }, lengthDays: 30 },
  { lunarYear: 2016, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 8, day: 3 }, lengthDays: 29 },
  { lunarYear: 2016, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 9, day: 1 }, lengthDays: 30 },
  { lunarYear: 2016, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 10, day: 1 }, lengthDays: 30 },
  { lunarYear: 2016, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 10, day: 31 }, lengthDays: 29 },
  { lunarYear: 2016, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 11, day: 29 }, lengthDays: 30 },
  { lunarYear: 2016, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2016, month: 12, day: 29 }, lengthDays: 30 },
  { lunarYear: 2017, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 1, day: 28 }, lengthDays: 29 },
  { lunarYear: 2017, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 2, day: 26 }, lengthDays: 30 },
  { lunarYear: 2017, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 3, day: 28 }, lengthDays: 29 },
  { lunarYear: 2017, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 4, day: 26 }, lengthDays: 30 },
  { lunarYear: 2017, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 5, day: 26 }, lengthDays: 29 },
  { lunarYear: 2017, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2017, month: 6, day: 24 }, lengthDays: 29 },
  { lunarYear: 2017, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 7, day: 23 }, lengthDays: 30 },
  { lunarYear: 2017, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 8, day: 22 }, lengthDays: 29 },
  { lunarYear: 2017, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 9, day: 20 }, lengthDays: 30 },
  { lunarYear: 2017, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 10, day: 20 }, lengthDays: 29 },
  { lunarYear: 2017, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 11, day: 18 }, lengthDays: 30 },
  { lunarYear: 2017, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2017, month: 12, day: 18 }, lengthDays: 30 },
  { lunarYear: 2017, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 1, day: 17 }, lengthDays: 30 },
  { lunarYear: 2018, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 2, day: 16 }, lengthDays: 29 },
  { lunarYear: 2018, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 3, day: 17 }, lengthDays: 30 },
  { lunarYear: 2018, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 4, day: 16 }, lengthDays: 29 },
  { lunarYear: 2018, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 5, day: 15 }, lengthDays: 30 },
  { lunarYear: 2018, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 6, day: 14 }, lengthDays: 29 },
  { lunarYear: 2018, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 7, day: 13 }, lengthDays: 29 },
  { lunarYear: 2018, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 8, day: 11 }, lengthDays: 30 },
  { lunarYear: 2018, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 9, day: 10 }, lengthDays: 29 },
  { lunarYear: 2018, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 10, day: 9 }, lengthDays: 30 },
  { lunarYear: 2018, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 11, day: 8 }, lengthDays: 29 },
  { lunarYear: 2018, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2018, month: 12, day: 7 }, lengthDays: 30 },
  { lunarYear: 2018, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 1, day: 6 }, lengthDays: 30 },
  { lunarYear: 2019, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 2, day: 5 }, lengthDays: 30 },
  { lunarYear: 2019, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 3, day: 7 }, lengthDays: 29 },
  { lunarYear: 2019, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 4, day: 5 }, lengthDays: 30 },
  { lunarYear: 2019, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 5, day: 5 }, lengthDays: 29 },
  { lunarYear: 2019, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 6, day: 3 }, lengthDays: 30 },
  { lunarYear: 2019, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 7, day: 3 }, lengthDays: 29 },
  { lunarYear: 2019, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 8, day: 1 }, lengthDays: 29 },
  { lunarYear: 2019, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 8, day: 30 }, lengthDays: 30 },
  { lunarYear: 2019, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 9, day: 29 }, lengthDays: 29 },
  { lunarYear: 2019, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 10, day: 28 }, lengthDays: 30 },
  { lunarYear: 2019, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 11, day: 27 }, lengthDays: 29 },
  { lunarYear: 2019, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2019, month: 12, day: 26 }, lengthDays: 30 },
  { lunarYear: 2020, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 1, day: 25 }, lengthDays: 30 },
  { lunarYear: 2020, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 2, day: 24 }, lengthDays: 29 },
  { lunarYear: 2020, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 3, day: 24 }, lengthDays: 30 },
  { lunarYear: 2020, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 4, day: 23 }, lengthDays: 30 },
  { lunarYear: 2020, lunarMonth: 4, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2020, month: 5, day: 23 }, lengthDays: 29 },
  { lunarYear: 2020, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 6, day: 21 }, lengthDays: 30 },
  { lunarYear: 2020, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 7, day: 21 }, lengthDays: 29 },
  { lunarYear: 2020, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 8, day: 19 }, lengthDays: 29 },
  { lunarYear: 2020, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 9, day: 17 }, lengthDays: 30 },
  { lunarYear: 2020, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 10, day: 17 }, lengthDays: 29 },
  { lunarYear: 2020, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 11, day: 15 }, lengthDays: 30 },
  { lunarYear: 2020, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2020, month: 12, day: 15 }, lengthDays: 29 },
  { lunarYear: 2020, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 1, day: 13 }, lengthDays: 30 },
  { lunarYear: 2021, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 2, day: 12 }, lengthDays: 29 },
  { lunarYear: 2021, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 3, day: 13 }, lengthDays: 30 },
  { lunarYear: 2021, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 4, day: 12 }, lengthDays: 30 },
  { lunarYear: 2021, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 5, day: 12 }, lengthDays: 29 },
  { lunarYear: 2021, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 6, day: 10 }, lengthDays: 30 },
  { lunarYear: 2021, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 7, day: 10 }, lengthDays: 29 },
  { lunarYear: 2021, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 8, day: 8 }, lengthDays: 30 },
  { lunarYear: 2021, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 9, day: 7 }, lengthDays: 29 },
  { lunarYear: 2021, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 10, day: 6 }, lengthDays: 30 },
  { lunarYear: 2021, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 11, day: 5 }, lengthDays: 29 },
  { lunarYear: 2021, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2021, month: 12, day: 4 }, lengthDays: 30 },
  { lunarYear: 2021, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 1, day: 3 }, lengthDays: 29 },
  { lunarYear: 2022, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 2, day: 1 }, lengthDays: 30 },
  { lunarYear: 2022, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 3, day: 3 }, lengthDays: 29 },
  { lunarYear: 2022, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 4, day: 1 }, lengthDays: 30 },
  { lunarYear: 2022, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 5, day: 1 }, lengthDays: 29 },
  { lunarYear: 2022, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 5, day: 30 }, lengthDays: 30 },
  { lunarYear: 2022, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 6, day: 29 }, lengthDays: 30 },
  { lunarYear: 2022, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 7, day: 29 }, lengthDays: 29 },
  { lunarYear: 2022, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 8, day: 27 }, lengthDays: 30 },
  { lunarYear: 2022, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 9, day: 26 }, lengthDays: 29 },
  { lunarYear: 2022, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 10, day: 25 }, lengthDays: 30 },
  { lunarYear: 2022, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 11, day: 24 }, lengthDays: 29 },
  { lunarYear: 2022, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2022, month: 12, day: 23 }, lengthDays: 30 },
  { lunarYear: 2023, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 1, day: 22 }, lengthDays: 29 },
  { lunarYear: 2023, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 2, day: 20 }, lengthDays: 30 },
  { lunarYear: 2023, lunarMonth: 2, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2023, month: 3, day: 22 }, lengthDays: 29 },
  { lunarYear: 2023, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 4, day: 20 }, lengthDays: 30 },
  { lunarYear: 2023, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 5, day: 20 }, lengthDays: 29 },
  { lunarYear: 2023, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 6, day: 18 }, lengthDays: 30 },
  { lunarYear: 2023, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 7, day: 18 }, lengthDays: 29 },
  { lunarYear: 2023, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 8, day: 16 }, lengthDays: 30 },
  { lunarYear: 2023, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 9, day: 15 }, lengthDays: 30 },
  { lunarYear: 2023, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 10, day: 15 }, lengthDays: 29 },
  { lunarYear: 2023, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 11, day: 13 }, lengthDays: 30 },
  { lunarYear: 2023, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2023, month: 12, day: 13 }, lengthDays: 29 },
  { lunarYear: 2023, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 1, day: 11 }, lengthDays: 30 },
  { lunarYear: 2024, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 2, day: 10 }, lengthDays: 29 },
  { lunarYear: 2024, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 3, day: 10 }, lengthDays: 30 },
  { lunarYear: 2024, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 4, day: 9 }, lengthDays: 29 },
  { lunarYear: 2024, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 5, day: 8 }, lengthDays: 29 },
  { lunarYear: 2024, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 6, day: 6 }, lengthDays: 30 },
  { lunarYear: 2024, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 7, day: 6 }, lengthDays: 29 },
  { lunarYear: 2024, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 8, day: 4 }, lengthDays: 30 },
  { lunarYear: 2024, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 9, day: 3 }, lengthDays: 30 },
  { lunarYear: 2024, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 10, day: 3 }, lengthDays: 29 },
  { lunarYear: 2024, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 11, day: 1 }, lengthDays: 30 },
  { lunarYear: 2024, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 12, day: 1 }, lengthDays: 30 },
  { lunarYear: 2024, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2024, month: 12, day: 31 }, lengthDays: 29 },
  { lunarYear: 2025, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 1, day: 29 }, lengthDays: 30 },
  { lunarYear: 2025, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 2, day: 28 }, lengthDays: 29 },
  { lunarYear: 2025, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 3, day: 29 }, lengthDays: 30 },
  { lunarYear: 2025, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 4, day: 28 }, lengthDays: 29 },
  { lunarYear: 2025, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 5, day: 27 }, lengthDays: 29 },
  { lunarYear: 2025, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 6, day: 25 }, lengthDays: 30 },
  { lunarYear: 2025, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2025, month: 7, day: 25 }, lengthDays: 29 },
  { lunarYear: 2025, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 8, day: 23 }, lengthDays: 30 },
  { lunarYear: 2025, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 9, day: 22 }, lengthDays: 29 },
  { lunarYear: 2025, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 10, day: 21 }, lengthDays: 30 },
  { lunarYear: 2025, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 11, day: 20 }, lengthDays: 30 },
  { lunarYear: 2025, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2025, month: 12, day: 20 }, lengthDays: 30 },
  { lunarYear: 2025, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 1, day: 19 }, lengthDays: 29 },
  { lunarYear: 2026, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 2, day: 17 }, lengthDays: 30 },
  { lunarYear: 2026, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 3, day: 19 }, lengthDays: 29 },
  { lunarYear: 2026, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 4, day: 17 }, lengthDays: 30 },
  { lunarYear: 2026, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 5, day: 17 }, lengthDays: 29 },
  { lunarYear: 2026, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 6, day: 15 }, lengthDays: 29 },
  { lunarYear: 2026, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 7, day: 14 }, lengthDays: 30 },
  { lunarYear: 2026, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 8, day: 13 }, lengthDays: 29 },
  { lunarYear: 2026, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 9, day: 11 }, lengthDays: 30 },
  { lunarYear: 2026, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 10, day: 11 }, lengthDays: 29 },
  { lunarYear: 2026, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 11, day: 9 }, lengthDays: 30 },
  { lunarYear: 2026, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2026, month: 12, day: 9 }, lengthDays: 30 },
  { lunarYear: 2026, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 1, day: 8 }, lengthDays: 30 },
  { lunarYear: 2027, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 2, day: 7 }, lengthDays: 29 },
  { lunarYear: 2027, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 3, day: 8 }, lengthDays: 30 },
  { lunarYear: 2027, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 4, day: 7 }, lengthDays: 29 },
  { lunarYear: 2027, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 5, day: 6 }, lengthDays: 30 },
  { lunarYear: 2027, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 6, day: 5 }, lengthDays: 29 },
  { lunarYear: 2027, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 7, day: 4 }, lengthDays: 29 },
  { lunarYear: 2027, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 8, day: 2 }, lengthDays: 30 },
  { lunarYear: 2027, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 9, day: 1 }, lengthDays: 29 },
  { lunarYear: 2027, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 9, day: 30 }, lengthDays: 29 },
  { lunarYear: 2027, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 10, day: 29 }, lengthDays: 30 },
  { lunarYear: 2027, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 11, day: 28 }, lengthDays: 30 },
  { lunarYear: 2027, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2027, month: 12, day: 28 }, lengthDays: 30 },
  { lunarYear: 2028, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 1, day: 27 }, lengthDays: 29 },
  { lunarYear: 2028, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 2, day: 25 }, lengthDays: 30 },
  { lunarYear: 2028, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 3, day: 26 }, lengthDays: 30 },
  { lunarYear: 2028, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 4, day: 25 }, lengthDays: 29 },
  { lunarYear: 2028, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 5, day: 24 }, lengthDays: 30 },
  { lunarYear: 2028, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2028, month: 6, day: 23 }, lengthDays: 29 },
  { lunarYear: 2028, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 7, day: 22 }, lengthDays: 29 },
  { lunarYear: 2028, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 8, day: 20 }, lengthDays: 30 },
  { lunarYear: 2028, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 9, day: 19 }, lengthDays: 29 },
  { lunarYear: 2028, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 10, day: 18 }, lengthDays: 29 },
  { lunarYear: 2028, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 11, day: 16 }, lengthDays: 30 },
  { lunarYear: 2028, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2028, month: 12, day: 16 }, lengthDays: 30 },
  { lunarYear: 2028, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 1, day: 15 }, lengthDays: 29 },
  { lunarYear: 2029, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 2, day: 13 }, lengthDays: 30 },
  { lunarYear: 2029, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 3, day: 15 }, lengthDays: 30 },
  { lunarYear: 2029, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 4, day: 14 }, lengthDays: 29 },
  { lunarYear: 2029, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 5, day: 13 }, lengthDays: 30 },
  { lunarYear: 2029, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 6, day: 12 }, lengthDays: 30 },
  { lunarYear: 2029, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 7, day: 12 }, lengthDays: 29 },
  { lunarYear: 2029, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 8, day: 10 }, lengthDays: 29 },
  { lunarYear: 2029, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 9, day: 8 }, lengthDays: 30 },
  { lunarYear: 2029, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 10, day: 8 }, lengthDays: 29 },
  { lunarYear: 2029, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 11, day: 6 }, lengthDays: 29 },
  { lunarYear: 2029, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2029, month: 12, day: 5 }, lengthDays: 30 },
  { lunarYear: 2029, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 1, day: 4 }, lengthDays: 30 },
  { lunarYear: 2030, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 2, day: 3 }, lengthDays: 29 },
  { lunarYear: 2030, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 3, day: 4 }, lengthDays: 30 },
  { lunarYear: 2030, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 4, day: 3 }, lengthDays: 29 },
  { lunarYear: 2030, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 5, day: 2 }, lengthDays: 30 },
  { lunarYear: 2030, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 6, day: 1 }, lengthDays: 30 },
  { lunarYear: 2030, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 7, day: 1 }, lengthDays: 29 },
  { lunarYear: 2030, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 7, day: 30 }, lengthDays: 30 },
  { lunarYear: 2030, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 8, day: 29 }, lengthDays: 29 },
  { lunarYear: 2030, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 9, day: 27 }, lengthDays: 30 },
  { lunarYear: 2030, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 10, day: 27 }, lengthDays: 29 },
  { lunarYear: 2030, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 11, day: 25 }, lengthDays: 30 },
  { lunarYear: 2030, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2030, month: 12, day: 25 }, lengthDays: 29 },
  { lunarYear: 2031, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 1, day: 23 }, lengthDays: 30 },
  { lunarYear: 2031, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 2, day: 22 }, lengthDays: 29 },
  { lunarYear: 2031, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 3, day: 23 }, lengthDays: 30 },
  { lunarYear: 2031, lunarMonth: 3, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2031, month: 4, day: 22 }, lengthDays: 29 },
  { lunarYear: 2031, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 5, day: 21 }, lengthDays: 30 },
  { lunarYear: 2031, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 6, day: 20 }, lengthDays: 29 },
  { lunarYear: 2031, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 7, day: 19 }, lengthDays: 30 },
  { lunarYear: 2031, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 8, day: 18 }, lengthDays: 30 },
  { lunarYear: 2031, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 9, day: 17 }, lengthDays: 29 },
  { lunarYear: 2031, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 10, day: 16 }, lengthDays: 30 },
  { lunarYear: 2031, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 11, day: 15 }, lengthDays: 29 },
  { lunarYear: 2031, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2031, month: 12, day: 14 }, lengthDays: 30 },
  { lunarYear: 2031, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 1, day: 13 }, lengthDays: 29 },
  { lunarYear: 2032, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 2, day: 11 }, lengthDays: 30 },
  { lunarYear: 2032, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 3, day: 12 }, lengthDays: 29 },
  { lunarYear: 2032, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 4, day: 10 }, lengthDays: 29 },
  { lunarYear: 2032, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 5, day: 9 }, lengthDays: 30 },
  { lunarYear: 2032, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 6, day: 8 }, lengthDays: 29 },
  { lunarYear: 2032, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 7, day: 7 }, lengthDays: 30 },
  { lunarYear: 2032, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 8, day: 6 }, lengthDays: 30 },
  { lunarYear: 2032, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 9, day: 5 }, lengthDays: 29 },
  { lunarYear: 2032, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 10, day: 4 }, lengthDays: 30 },
  { lunarYear: 2032, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 11, day: 3 }, lengthDays: 30 },
  { lunarYear: 2032, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2032, month: 12, day: 3 }, lengthDays: 29 },
  { lunarYear: 2032, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 1, day: 1 }, lengthDays: 30 },
  { lunarYear: 2033, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 1, day: 31 }, lengthDays: 29 },
  { lunarYear: 2033, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 3, day: 1 }, lengthDays: 30 },
  { lunarYear: 2033, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 3, day: 31 }, lengthDays: 29 },
  { lunarYear: 2033, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 4, day: 29 }, lengthDays: 29 },
  { lunarYear: 2033, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 5, day: 28 }, lengthDays: 30 },
  { lunarYear: 2033, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 6, day: 27 }, lengthDays: 29 },
  { lunarYear: 2033, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 7, day: 26 }, lengthDays: 30 },
  { lunarYear: 2033, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 8, day: 25 }, lengthDays: 29 },
  { lunarYear: 2033, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 9, day: 23 }, lengthDays: 30 },
  { lunarYear: 2033, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 10, day: 23 }, lengthDays: 30 },
  { lunarYear: 2033, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2033, month: 11, day: 22 }, lengthDays: 30 },
  { lunarYear: 2033, lunarMonth: 11, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2033, month: 12, day: 22 }, lengthDays: 29 },
  { lunarYear: 2033, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 1, day: 20 }, lengthDays: 30 },
  { lunarYear: 2034, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 2, day: 19 }, lengthDays: 29 },
  { lunarYear: 2034, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 3, day: 20 }, lengthDays: 30 },
  { lunarYear: 2034, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 4, day: 19 }, lengthDays: 29 },
  { lunarYear: 2034, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 5, day: 18 }, lengthDays: 29 },
  { lunarYear: 2034, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 6, day: 16 }, lengthDays: 30 },
  { lunarYear: 2034, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 7, day: 16 }, lengthDays: 29 },
  { lunarYear: 2034, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 8, day: 14 }, lengthDays: 30 },
  { lunarYear: 2034, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 9, day: 13 }, lengthDays: 29 },
  { lunarYear: 2034, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 10, day: 12 }, lengthDays: 30 },
  { lunarYear: 2034, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 11, day: 11 }, lengthDays: 30 },
  { lunarYear: 2034, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2034, month: 12, day: 11 }, lengthDays: 30 },
  { lunarYear: 2034, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 1, day: 10 }, lengthDays: 29 },
  { lunarYear: 2035, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 2, day: 8 }, lengthDays: 30 },
  { lunarYear: 2035, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 3, day: 10 }, lengthDays: 29 },
  { lunarYear: 2035, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 4, day: 8 }, lengthDays: 30 },
  { lunarYear: 2035, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 5, day: 8 }, lengthDays: 29 },
  { lunarYear: 2035, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 6, day: 6 }, lengthDays: 29 },
  { lunarYear: 2035, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 7, day: 5 }, lengthDays: 30 },
  { lunarYear: 2035, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 8, day: 4 }, lengthDays: 29 },
  { lunarYear: 2035, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 9, day: 2 }, lengthDays: 29 },
  { lunarYear: 2035, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 10, day: 1 }, lengthDays: 30 },
  { lunarYear: 2035, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 10, day: 31 }, lengthDays: 30 },
  { lunarYear: 2035, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 11, day: 30 }, lengthDays: 29 },
  { lunarYear: 2035, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2035, month: 12, day: 29 }, lengthDays: 30 },
  { lunarYear: 2036, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 1, day: 28 }, lengthDays: 30 },
  { lunarYear: 2036, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 2, day: 27 }, lengthDays: 30 },
  { lunarYear: 2036, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 3, day: 28 }, lengthDays: 29 },
  { lunarYear: 2036, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 4, day: 26 }, lengthDays: 30 },
  { lunarYear: 2036, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 5, day: 26 }, lengthDays: 29 },
  { lunarYear: 2036, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 6, day: 24 }, lengthDays: 29 },
  { lunarYear: 2036, lunarMonth: 6, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2036, month: 7, day: 23 }, lengthDays: 30 },
  { lunarYear: 2036, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 8, day: 22 }, lengthDays: 29 },
  { lunarYear: 2036, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 9, day: 20 }, lengthDays: 29 },
  { lunarYear: 2036, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 10, day: 19 }, lengthDays: 30 },
  { lunarYear: 2036, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 11, day: 18 }, lengthDays: 30 },
  { lunarYear: 2036, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2036, month: 12, day: 18 }, lengthDays: 29 },
  { lunarYear: 2036, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 1, day: 16 }, lengthDays: 30 },
  { lunarYear: 2037, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 2, day: 15 }, lengthDays: 30 },
  { lunarYear: 2037, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 3, day: 17 }, lengthDays: 30 },
  { lunarYear: 2037, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 4, day: 16 }, lengthDays: 29 },
  { lunarYear: 2037, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 5, day: 15 }, lengthDays: 30 },
  { lunarYear: 2037, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 6, day: 14 }, lengthDays: 29 },
  { lunarYear: 2037, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 7, day: 13 }, lengthDays: 29 },
  { lunarYear: 2037, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 8, day: 11 }, lengthDays: 30 },
  { lunarYear: 2037, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 9, day: 10 }, lengthDays: 29 },
  { lunarYear: 2037, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 10, day: 9 }, lengthDays: 29 },
  { lunarYear: 2037, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 11, day: 7 }, lengthDays: 30 },
  { lunarYear: 2037, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2037, month: 12, day: 7 }, lengthDays: 29 },
  { lunarYear: 2037, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 1, day: 5 }, lengthDays: 30 },
  { lunarYear: 2038, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 2, day: 4 }, lengthDays: 30 },
  { lunarYear: 2038, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 3, day: 6 }, lengthDays: 30 },
  { lunarYear: 2038, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 4, day: 5 }, lengthDays: 29 },
  { lunarYear: 2038, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 5, day: 4 }, lengthDays: 30 },
  { lunarYear: 2038, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 6, day: 3 }, lengthDays: 29 },
  { lunarYear: 2038, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 7, day: 2 }, lengthDays: 30 },
  { lunarYear: 2038, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 8, day: 1 }, lengthDays: 29 },
  { lunarYear: 2038, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 8, day: 30 }, lengthDays: 30 },
  { lunarYear: 2038, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 9, day: 29 }, lengthDays: 29 },
  { lunarYear: 2038, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 10, day: 28 }, lengthDays: 29 },
  { lunarYear: 2038, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 11, day: 26 }, lengthDays: 30 },
  { lunarYear: 2038, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2038, month: 12, day: 26 }, lengthDays: 29 },
  { lunarYear: 2039, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 1, day: 24 }, lengthDays: 30 },
  { lunarYear: 2039, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 2, day: 23 }, lengthDays: 30 },
  { lunarYear: 2039, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 3, day: 25 }, lengthDays: 29 },
  { lunarYear: 2039, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 4, day: 23 }, lengthDays: 30 },
  { lunarYear: 2039, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 5, day: 23 }, lengthDays: 30 },
  { lunarYear: 2039, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2039, month: 6, day: 22 }, lengthDays: 29 },
  { lunarYear: 2039, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 7, day: 21 }, lengthDays: 30 },
  { lunarYear: 2039, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 8, day: 20 }, lengthDays: 29 },
  { lunarYear: 2039, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 9, day: 18 }, lengthDays: 30 },
  { lunarYear: 2039, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 10, day: 18 }, lengthDays: 29 },
  { lunarYear: 2039, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 11, day: 16 }, lengthDays: 30 },
  { lunarYear: 2039, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2039, month: 12, day: 16 }, lengthDays: 29 },
  { lunarYear: 2039, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 1, day: 14 }, lengthDays: 29 },
  { lunarYear: 2040, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 2, day: 12 }, lengthDays: 30 },
  { lunarYear: 2040, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 3, day: 13 }, lengthDays: 29 },
  { lunarYear: 2040, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 4, day: 11 }, lengthDays: 30 },
  { lunarYear: 2040, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 5, day: 11 }, lengthDays: 30 },
  { lunarYear: 2040, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 6, day: 10 }, lengthDays: 29 },
  { lunarYear: 2040, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 7, day: 9 }, lengthDays: 30 },
  { lunarYear: 2040, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 8, day: 8 }, lengthDays: 30 },
  { lunarYear: 2040, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 9, day: 7 }, lengthDays: 29 },
  { lunarYear: 2040, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 10, day: 6 }, lengthDays: 30 },
  { lunarYear: 2040, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 11, day: 5 }, lengthDays: 29 },
  { lunarYear: 2040, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2040, month: 12, day: 4 }, lengthDays: 30 },
  { lunarYear: 2040, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 1, day: 3 }, lengthDays: 29 },
  { lunarYear: 2041, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 2, day: 1 }, lengthDays: 30 },
  { lunarYear: 2041, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 3, day: 3 }, lengthDays: 29 },
  { lunarYear: 2041, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 4, day: 1 }, lengthDays: 29 },
  { lunarYear: 2041, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 4, day: 30 }, lengthDays: 30 },
  { lunarYear: 2041, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 5, day: 30 }, lengthDays: 29 },
  { lunarYear: 2041, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 6, day: 28 }, lengthDays: 30 },
  { lunarYear: 2041, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 7, day: 28 }, lengthDays: 30 },
  { lunarYear: 2041, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 8, day: 27 }, lengthDays: 29 },
  { lunarYear: 2041, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 9, day: 25 }, lengthDays: 30 },
  { lunarYear: 2041, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 10, day: 25 }, lengthDays: 30 },
  { lunarYear: 2041, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 11, day: 24 }, lengthDays: 29 },
  { lunarYear: 2041, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2041, month: 12, day: 23 }, lengthDays: 30 },
  { lunarYear: 2042, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 1, day: 22 }, lengthDays: 29 },
  { lunarYear: 2042, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 2, day: 20 }, lengthDays: 30 },
  { lunarYear: 2042, lunarMonth: 2, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2042, month: 3, day: 22 }, lengthDays: 29 },
  { lunarYear: 2042, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 4, day: 20 }, lengthDays: 29 },
  { lunarYear: 2042, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 5, day: 19 }, lengthDays: 30 },
  { lunarYear: 2042, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 6, day: 18 }, lengthDays: 29 },
  { lunarYear: 2042, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 7, day: 17 }, lengthDays: 30 },
  { lunarYear: 2042, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 8, day: 16 }, lengthDays: 29 },
  { lunarYear: 2042, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 9, day: 14 }, lengthDays: 30 },
  { lunarYear: 2042, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 10, day: 14 }, lengthDays: 30 },
  { lunarYear: 2042, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 11, day: 13 }, lengthDays: 29 },
  { lunarYear: 2042, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2042, month: 12, day: 12 }, lengthDays: 30 },
  { lunarYear: 2042, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 1, day: 11 }, lengthDays: 30 },
  { lunarYear: 2043, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 2, day: 10 }, lengthDays: 29 },
  { lunarYear: 2043, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 3, day: 11 }, lengthDays: 30 },
  { lunarYear: 2043, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 4, day: 10 }, lengthDays: 29 },
  { lunarYear: 2043, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 5, day: 9 }, lengthDays: 29 },
  { lunarYear: 2043, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 6, day: 7 }, lengthDays: 30 },
  { lunarYear: 2043, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 7, day: 7 }, lengthDays: 29 },
  { lunarYear: 2043, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 8, day: 5 }, lengthDays: 29 },
  { lunarYear: 2043, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 9, day: 3 }, lengthDays: 30 },
  { lunarYear: 2043, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 10, day: 3 }, lengthDays: 30 },
  { lunarYear: 2043, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 11, day: 2 }, lengthDays: 29 },
  { lunarYear: 2043, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 12, day: 1 }, lengthDays: 30 },
  { lunarYear: 2043, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2043, month: 12, day: 31 }, lengthDays: 30 },
  { lunarYear: 2044, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 1, day: 30 }, lengthDays: 30 },
  { lunarYear: 2044, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 2, day: 29 }, lengthDays: 29 },
  { lunarYear: 2044, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 3, day: 29 }, lengthDays: 30 },
  { lunarYear: 2044, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 4, day: 28 }, lengthDays: 29 },
  { lunarYear: 2044, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 5, day: 27 }, lengthDays: 29 },
  { lunarYear: 2044, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 6, day: 25 }, lengthDays: 30 },
  { lunarYear: 2044, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 7, day: 25 }, lengthDays: 29 },
  { lunarYear: 2044, lunarMonth: 7, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2044, month: 8, day: 23 }, lengthDays: 29 },
  { lunarYear: 2044, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 9, day: 21 }, lengthDays: 30 },
  { lunarYear: 2044, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 10, day: 21 }, lengthDays: 29 },
  { lunarYear: 2044, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 11, day: 19 }, lengthDays: 30 },
  { lunarYear: 2044, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2044, month: 12, day: 19 }, lengthDays: 30 },
  { lunarYear: 2044, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 1, day: 18 }, lengthDays: 30 },
  { lunarYear: 2045, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 2, day: 17 }, lengthDays: 30 },
  { lunarYear: 2045, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 3, day: 19 }, lengthDays: 29 },
  { lunarYear: 2045, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 4, day: 17 }, lengthDays: 30 },
  { lunarYear: 2045, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 5, day: 17 }, lengthDays: 29 },
  { lunarYear: 2045, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 6, day: 15 }, lengthDays: 29 },
  { lunarYear: 2045, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 7, day: 14 }, lengthDays: 30 },
  { lunarYear: 2045, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 8, day: 13 }, lengthDays: 29 },
  { lunarYear: 2045, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 9, day: 11 }, lengthDays: 29 },
  { lunarYear: 2045, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 10, day: 10 }, lengthDays: 30 },
  { lunarYear: 2045, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 11, day: 9 }, lengthDays: 29 },
  { lunarYear: 2045, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2045, month: 12, day: 8 }, lengthDays: 30 },
  { lunarYear: 2045, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 1, day: 7 }, lengthDays: 30 },
  { lunarYear: 2046, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 2, day: 6 }, lengthDays: 30 },
  { lunarYear: 2046, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 3, day: 8 }, lengthDays: 29 },
  { lunarYear: 2046, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 4, day: 6 }, lengthDays: 30 },
  { lunarYear: 2046, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 5, day: 6 }, lengthDays: 30 },
  { lunarYear: 2046, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 6, day: 5 }, lengthDays: 29 },
  { lunarYear: 2046, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 7, day: 4 }, lengthDays: 29 },
  { lunarYear: 2046, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 8, day: 2 }, lengthDays: 30 },
  { lunarYear: 2046, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 9, day: 1 }, lengthDays: 29 },
  { lunarYear: 2046, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 9, day: 30 }, lengthDays: 29 },
  { lunarYear: 2046, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 10, day: 29 }, lengthDays: 30 },
  { lunarYear: 2046, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 11, day: 28 }, lengthDays: 29 },
  { lunarYear: 2046, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2046, month: 12, day: 27 }, lengthDays: 30 },
  { lunarYear: 2047, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 1, day: 26 }, lengthDays: 30 },
  { lunarYear: 2047, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 2, day: 25 }, lengthDays: 29 },
  { lunarYear: 2047, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 3, day: 26 }, lengthDays: 30 },
  { lunarYear: 2047, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 4, day: 25 }, lengthDays: 30 },
  { lunarYear: 2047, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 5, day: 25 }, lengthDays: 29 },
  { lunarYear: 2047, lunarMonth: 5, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2047, month: 6, day: 23 }, lengthDays: 30 },
  { lunarYear: 2047, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 7, day: 23 }, lengthDays: 29 },
  { lunarYear: 2047, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 8, day: 21 }, lengthDays: 30 },
  { lunarYear: 2047, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 9, day: 20 }, lengthDays: 29 },
  { lunarYear: 2047, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 10, day: 19 }, lengthDays: 29 },
  { lunarYear: 2047, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 11, day: 17 }, lengthDays: 30 },
  { lunarYear: 2047, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2047, month: 12, day: 17 }, lengthDays: 29 },
  { lunarYear: 2047, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 1, day: 15 }, lengthDays: 30 },
  { lunarYear: 2048, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 2, day: 14 }, lengthDays: 29 },
  { lunarYear: 2048, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 3, day: 14 }, lengthDays: 30 },
  { lunarYear: 2048, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 4, day: 13 }, lengthDays: 30 },
  { lunarYear: 2048, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 5, day: 13 }, lengthDays: 29 },
  { lunarYear: 2048, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 6, day: 11 }, lengthDays: 30 },
  { lunarYear: 2048, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 7, day: 11 }, lengthDays: 30 },
  { lunarYear: 2048, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 8, day: 10 }, lengthDays: 29 },
  { lunarYear: 2048, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 9, day: 8 }, lengthDays: 30 },
  { lunarYear: 2048, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 10, day: 8 }, lengthDays: 29 },
  { lunarYear: 2048, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 11, day: 6 }, lengthDays: 30 },
  { lunarYear: 2048, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2048, month: 12, day: 6 }, lengthDays: 29 },
  { lunarYear: 2048, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 1, day: 4 }, lengthDays: 29 },
  { lunarYear: 2049, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 2, day: 2 }, lengthDays: 30 },
  { lunarYear: 2049, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 3, day: 4 }, lengthDays: 29 },
  { lunarYear: 2049, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 4, day: 2 }, lengthDays: 30 },
  { lunarYear: 2049, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 5, day: 2 }, lengthDays: 29 },
  { lunarYear: 2049, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 5, day: 31 }, lengthDays: 30 },
  { lunarYear: 2049, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 6, day: 30 }, lengthDays: 30 },
  { lunarYear: 2049, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 7, day: 30 }, lengthDays: 29 },
  { lunarYear: 2049, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 8, day: 28 }, lengthDays: 30 },
  { lunarYear: 2049, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 9, day: 27 }, lengthDays: 30 },
  { lunarYear: 2049, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 10, day: 27 }, lengthDays: 29 },
  { lunarYear: 2049, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 11, day: 25 }, lengthDays: 30 },
  { lunarYear: 2049, lunarMonth: 12, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2049, month: 12, day: 25 }, lengthDays: 29 },
  { lunarYear: 2050, lunarMonth: 1, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 1, day: 23 }, lengthDays: 30 },
  { lunarYear: 2050, lunarMonth: 2, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 2, day: 22 }, lengthDays: 29 },
  { lunarYear: 2050, lunarMonth: 3, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 3, day: 23 }, lengthDays: 29 },
  { lunarYear: 2050, lunarMonth: 3, lunarMonthKind: "LEAP", gregorianStartDate: { year: 2050, month: 4, day: 21 }, lengthDays: 30 },
  { lunarYear: 2050, lunarMonth: 4, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 5, day: 21 }, lengthDays: 29 },
  { lunarYear: 2050, lunarMonth: 5, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 6, day: 19 }, lengthDays: 30 },
  { lunarYear: 2050, lunarMonth: 6, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 7, day: 19 }, lengthDays: 29 },
  { lunarYear: 2050, lunarMonth: 7, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 8, day: 17 }, lengthDays: 30 },
  { lunarYear: 2050, lunarMonth: 8, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 9, day: 16 }, lengthDays: 30 },
  { lunarYear: 2050, lunarMonth: 9, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 10, day: 16 }, lengthDays: 29 },
  { lunarYear: 2050, lunarMonth: 10, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 11, day: 14 }, lengthDays: 30 },
  { lunarYear: 2050, lunarMonth: 11, lunarMonthKind: "REGULAR", gregorianStartDate: { year: 2050, month: 12, day: 14 }, lengthDays: 30 }
];
var KASI_CALENDAR_DATASET = {
  manifest: KASI_CALENDAR_MANIFEST,
  records: KASI_LUNAR_MONTH_RECORDS
};

// src/features/interpretation/calendar/civilDay.ts
function isGregorianLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function getGregorianMonthLength(year, month) {
  if (month === 2) {
    return isGregorianLeapYear(year) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}
function isValidGregorianDate(date) {
  return Number.isInteger(date.year) && Number.isInteger(date.month) && Number.isInteger(date.day) && date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= getGregorianMonthLength(date.year, date.month);
}
function gregorianToCivilDayOrdinal(date) {
  let year = date.year;
  const month = date.month;
  year -= month <= 2 ? 1 : 0;
  const era = Math.floor(year / 400);
  const yearOfEra = year - era * 400;
  const shiftedMonth = month + (month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * shiftedMonth + 2) / 5) + date.day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra;
}
function civilDayOrdinalToGregorian(ordinal) {
  const era = Math.floor(ordinal / 146097);
  const dayOfEra = ordinal - era * 146097;
  const yearOfEra = Math.floor(
    (dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365
  );
  let year = yearOfEra + era * 400;
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const shiftedMonth = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * shiftedMonth + 2) / 5) + 1;
  const month = shiftedMonth + (shiftedMonth < 10 ? 3 : -9);
  year += month <= 2 ? 1 : 0;
  return { year, month, day };
}
function compareGregorianDates(left, right) {
  return gregorianToCivilDayOrdinal(left) - gregorianToCivilDayOrdinal(right);
}
function addGregorianDays(date, days) {
  return civilDayOrdinalToGregorian(gregorianToCivilDayOrdinal(date) + days);
}

// src/features/interpretation/calendar/resolver.ts
function failure(error2) {
  return { success: false, errors: [error2] };
}
function isInGregorianRange(date, range) {
  return compareGregorianDates(date, range.start) >= 0 && compareGregorianDates(date, range.end) <= 0;
}
function findMonthAtGregorianDate(records, dateOrdinal) {
  let low = 0;
  let high = records.length - 1;
  let candidate2;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const record = records[middle];
    const start2 = gregorianToCivilDayOrdinal(record.gregorianStartDate);
    if (start2 <= dateOrdinal) {
      candidate2 = record;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  if (!candidate2) {
    return void 0;
  }
  const start = gregorianToCivilDayOrdinal(candidate2.gregorianStartDate);
  return dateOrdinal < start + candidate2.lengthDays ? candidate2 : void 0;
}
function resolveGregorianToLunar(date, dataset) {
  if (!isValidGregorianDate(date)) {
    return failure({ code: "INVALID_GREGORIAN_DATE", path: "gregorianDate" });
  }
  if (!isInGregorianRange(date, dataset.manifest.supportedGregorianRange)) {
    return failure({ code: "UNSUPPORTED_GREGORIAN_RANGE", path: "gregorianDate" });
  }
  const dateOrdinal = gregorianToCivilDayOrdinal(date);
  const record = findMonthAtGregorianDate(dataset.records, dateOrdinal);
  if (!record) {
    return failure({ code: "DATASET_HOLE", path: "dataset.records" });
  }
  const lunarDay = dateOrdinal - gregorianToCivilDayOrdinal(record.gregorianStartDate) + 1;
  return {
    success: true,
    value: {
      gregorianDate: date,
      lunarDate: {
        year: record.lunarYear,
        month: record.lunarMonth,
        day: lunarDay,
        lunarMonthKind: record.lunarMonthKind
      },
      datasetVersion: dataset.manifest.datasetVersion,
      conversionRuleVersion: dataset.manifest.conversionRuleVersion
    }
  };
}
function findLunarMonth(records, year, month, kind) {
  return records.find(
    (record) => record.lunarYear === year && record.lunarMonth === month && record.lunarMonthKind === kind
  );
}
function findLunarMonthIndex(records, year, month, kind) {
  return records.findIndex(
    (record) => record.lunarYear === year && record.lunarMonth === month && record.lunarMonthKind === kind
  );
}
function resolveLunarToGregorian(date, dataset) {
  if (!Number.isInteger(date.year) || !Number.isInteger(date.month) || !Number.isInteger(date.day) || date.month < 1 || date.month > 12 || date.day < 1) {
    return failure({ code: "INVALID_LUNAR_DATE", path: "lunarDate" });
  }
  if (date.lunarMonthKind !== "REGULAR" && date.lunarMonthKind !== "LEAP") {
    return failure({ code: "INVALID_LUNAR_MONTH_KIND", path: "lunarDate.lunarMonthKind" });
  }
  const record = findLunarMonth(dataset.records, date.year, date.month, date.lunarMonthKind);
  if (!record) {
    const code = date.lunarMonthKind === "LEAP" ? "LEAP_MONTH_NOT_PRESENT" : "DATASET_HOLE";
    return failure({ code, path: "dataset.records" });
  }
  if (date.day > record.lengthDays) {
    return failure({
      code: "DAY_EXCEEDS_MONTH_LENGTH",
      path: "lunarDate.day",
      details: { lengthDays: record.lengthDays }
    });
  }
  const lunarRange = dataset.manifest.supportedLunarRange;
  const inputIndex = findLunarMonthIndex(
    dataset.records,
    date.year,
    date.month,
    date.lunarMonthKind
  );
  const startIndex = findLunarMonthIndex(
    dataset.records,
    lunarRange.start.lunarYear,
    lunarRange.start.lunarMonth,
    lunarRange.start.lunarMonthKind
  );
  const endIndex = findLunarMonthIndex(
    dataset.records,
    lunarRange.end.lunarYear,
    lunarRange.end.lunarMonth,
    lunarRange.end.lunarMonthKind
  );
  if (startIndex < 0 || endIndex < 0) {
    return failure({ code: "DATASET_CORRUPTION", path: "manifest.supportedLunarRange" });
  }
  if (inputIndex < startIndex || inputIndex > endIndex || inputIndex === startIndex && date.day < lunarRange.start.lunarDay || inputIndex === endIndex && date.day > lunarRange.end.lunarDay) {
    return failure({ code: "UNSUPPORTED_LUNAR_RANGE", path: "lunarDate" });
  }
  const gregorianDate = addGregorianDays(record.gregorianStartDate, date.day - 1);
  if (!isInGregorianRange(gregorianDate, dataset.manifest.supportedGregorianRange)) {
    return failure({ code: "UNSUPPORTED_GREGORIAN_RANGE", path: "gregorianDate" });
  }
  return {
    success: true,
    value: {
      lunarDate: date,
      gregorianDate,
      datasetVersion: dataset.manifest.datasetVersion,
      conversionRuleVersion: dataset.manifest.conversionRuleVersion
    }
  };
}

// src/features/interpretation/calendar/kasiCalendarResolver.ts
var KASI_CALENDAR_PROVENANCE = {
  resolverId: "DEOKBUNAI_KASI_LUNISOLAR_CALENDAR_RESOLVER",
  resolverVersion: "deokbunai.kasi-calendar-resolver.v1",
  dataVersion: KASI_CALENDAR_DATASET.manifest.datasetVersion,
  ruleSetVersion: KASI_CALENDAR_DATASET.manifest.conversionRuleVersion,
  source: "ENGINE"
};
function resolveWithKasiCalendar(sourceDate) {
  if (sourceDate.calendar === "GREGORIAN") {
    const result2 = resolveGregorianToLunar(sourceDate, KASI_CALENDAR_DATASET);
    if (!result2.success) {
      return {
        status: "UNRESOLVED",
        sourceDate,
        reason: result2.errors[0]?.code === "UNSUPPORTED_GREGORIAN_RANGE" ? "UNSUPPORTED_CALENDAR_RANGE" : "CALENDAR_CONVERSION_FAILED"
      };
    }
    return {
      status: "RESOLVED",
      sourceDate,
      gregorianDate: result2.value.gregorianDate,
      lunarDate: result2.value.lunarDate,
      calendarDatasetVersion: result2.value.datasetVersion,
      calendarConversionRuleVersion: result2.value.conversionRuleVersion,
      provenance: KASI_CALENDAR_PROVENANCE
    };
  }
  const result = resolveLunarToGregorian(sourceDate, KASI_CALENDAR_DATASET);
  if (!result.success) {
    const firstError = result.errors[0]?.code;
    return {
      status: "UNRESOLVED",
      sourceDate,
      reason: firstError === "UNSUPPORTED_GREGORIAN_RANGE" || firstError === "UNSUPPORTED_LUNAR_RANGE" ? "UNSUPPORTED_CALENDAR_RANGE" : firstError === "INVALID_LUNAR_MONTH_KIND" ? "INVALID_LUNAR_MONTH_KIND" : firstError === "INVALID_LUNAR_DATE" || firstError === "LEAP_MONTH_NOT_PRESENT" || firstError === "DAY_EXCEEDS_MONTH_LENGTH" ? "INVALID_LUNAR_DATE" : "CALENDAR_CONVERSION_FAILED"
    };
  }
  return {
    status: "RESOLVED",
    sourceDate,
    gregorianDate: result.value.gregorianDate,
    lunarDate: result.value.lunarDate,
    calendarDatasetVersion: result.value.datasetVersion,
    calendarConversionRuleVersion: result.value.conversionRuleVersion,
    provenance: KASI_CALENDAR_PROVENANCE
  };
}
var KASI_LUNISOLAR_CALENDAR_RESOLVER = {
  async resolve(date) {
    return resolveWithKasiCalendar(date);
  }
};

// src/features/interpretation/normalization/birthNormalization.ts
function error(value) {
  return {
    ...value,
    messageKey: value.messageKey ?? `interpretation.normalization.${value.code}`
  };
}
function warning(value) {
  return {
    ...value,
    messageKey: value.messageKey ?? `interpretation.normalization.${value.code}`
  };
}
function isValidClockTime(time) {
  return Number.isInteger(time.hour) && time.hour >= 0 && time.hour <= 23 && Number.isInteger(time.minute) && time.minute >= 0 && time.minute <= 59 && (time.second === void 0 || Number.isInteger(time.second) && time.second >= 0 && time.second <= 59);
}
function clockSecond(time) {
  return time.hour * 3600 + time.minute * 60 + (time.second ?? 0);
}
function isValidClockRange(range) {
  return isValidClockTime(range.start) && isValidClockTime(range.end) && clockSecond(range.start) <= clockSecond(range.end);
}
function validateCoordinates(coordinates) {
  if (!coordinates) return [];
  if (Number.isFinite(coordinates.latitude) && coordinates.latitude >= -90 && coordinates.latitude <= 90 && Number.isFinite(coordinates.longitude) && coordinates.longitude >= -180 && coordinates.longitude <= 180) {
    return [];
  }
  return [
    error({
      code: "INVALID_PLACE_COORDINATES",
      path: "place.coordinates",
      stage: "PLACE"
    })
  ];
}
function validateStructure(source) {
  const errors = [];
  const hasInvalidDateComponents = !Number.isInteger(source.date.year) || !Number.isInteger(source.date.month) || !Number.isInteger(source.date.day) || source.date.month < 1 || source.date.month > 12 || source.date.day < 1;
  if (hasInvalidDateComponents) {
    errors.push(
      error({
        code: "INVALID_DATE_COMPONENT",
        path: "date",
        stage: "STRUCTURE"
      })
    );
  }
  if (source.date.calendar === "GREGORIAN" && !hasInvalidDateComponents && !isValidGregorianDate(source.date)) {
    errors.push(
      error({
        code: "INVALID_GREGORIAN_DATE",
        path: "date",
        stage: "CALENDAR"
      })
    );
  }
  if (source.date.calendar === "LUNAR" && source.date.lunarMonthKind !== "REGULAR" && source.date.lunarMonthKind !== "LEAP") {
    errors.push(
      error({
        code: "INVALID_LUNAR_MONTH_KIND",
        path: "date.lunarMonthKind",
        stage: "CALENDAR"
      })
    );
  }
  if (source.time.accuracy === "EXACT" && !isValidClockTime(source.time.localTime)) {
    errors.push(
      error({
        code: "INVALID_TIME",
        path: "time.localTime",
        stage: "STRUCTURE"
      })
    );
  }
  if (source.time.accuracy === "APPROXIMATE" && source.time.localTimeHint && !isValidClockRange(source.time.localTimeHint)) {
    errors.push(
      error({
        code: "INVALID_APPROXIMATE_RANGE",
        path: "time.localTimeHint",
        stage: "STRUCTURE"
      })
    );
  }
  const timezone = source.temporalContext.timezone;
  if (timezone.status === "EXPLICIT" && timezone.ianaZone.trim().length === 0 || timezone.status === "OFFSET_ONLY" && !Number.isInteger(timezone.offsetMinutes)) {
    errors.push(
      error({
        code: "TIMEZONE_UNRESOLVED",
        path: "temporalContext.timezone",
        stage: "TIMEZONE"
      })
    );
  }
  const dst = source.temporalContext.dst;
  if (dst.status === "OBSERVED" && !Number.isInteger(dst.offsetMinutes)) {
    errors.push(
      error({
        code: "DST_UNRESOLVED",
        path: "temporalContext.dst.offsetMinutes",
        stage: "DST"
      })
    );
  }
  const trueSolarTime = source.temporalContext.trueSolarTime;
  if (trueSolarTime.mode === "APPLY" && trueSolarTime.longitude !== void 0 && (!Number.isFinite(trueSolarTime.longitude) || trueSolarTime.longitude < -180 || trueSolarTime.longitude > 180)) {
    errors.push(
      error({
        code: "INVALID_PLACE_COORDINATES",
        path: "temporalContext.trueSolarTime.longitude",
        stage: "TRUE_SOLAR_TIME"
      })
    );
  }
  return [...errors, ...validateCoordinates(source.place.coordinates)];
}
function calendarError(reason) {
  const code = reason === "UNSUPPORTED_CALENDAR_RANGE" ? "UNSUPPORTED_CALENDAR_RANGE" : reason === "INVALID_LUNAR_DATE" ? "INVALID_LUNAR_DATE" : reason === "INVALID_LUNAR_MONTH_KIND" ? "INVALID_LUNAR_MONTH_KIND" : "CALENDAR_RESOLUTION_FAILED";
  return error({
    code,
    path: "date",
    stage: "CALENDAR",
    details: { reason }
  });
}
function createCivilLocal(source, gregorianDate) {
  if (source.time.accuracy === "EXACT") {
    return {
      accuracy: "EXACT",
      date: gregorianDate,
      time: source.time.localTime
    };
  }
  if (source.time.accuracy === "APPROXIMATE") {
    return {
      accuracy: "APPROXIMATE",
      date: gregorianDate,
      period: source.time.period,
      resolvedRange: source.time.localTimeHint ?? null
    };
  }
  return { accuracy: "UNKNOWN", date: gregorianDate };
}
function unresolvedTimezone(reason, ianaZone) {
  const historicalReason = reason === "UNSUPPORTED_ZONE" ? "UNSUPPORTED_ZONE" : reason === "OUTSIDE_SUPPORTED_RANGE" ? "OUTSIDE_SUPPORTED_RANGE" : reason === "LMT_NOT_AUTHORIZED" ? "LMT_NOT_AUTHORIZED" : reason === "HISTORICAL_SOURCE_CONFLICT" ? "SOURCE_CONFLICT_REQUIRES_RULE" : "TIME_UNRESOLVED";
  const provenance = {
    resolverId: "deokbunai.normalization.timezone-unresolved",
    resolverVersion: "deokbunai.normalization.timezone-unresolved.v1",
    ruleSetVersion: "deokbunai.historical-timezone-policy.v1",
    source: "ENGINE"
  };
  return {
    status: "UNRESOLVED",
    ...ianaZone ? { ianaZone } : {},
    reason,
    historicalProvenance: {
      authorityStatus: reason === "HISTORICAL_SOURCE_CONFLICT" ? "SOURCE_CONFLICT" : "UNRESOLVED",
      ...ianaZone ? { tzdbZone: ianaZone } : {},
      officialSources: [],
      ruleSetVersion: "deokbunai.historical-timezone-policy.v1",
      comparison: reason === "HISTORICAL_SOURCE_CONFLICT" ? "CONFLICT" : "NOT_VERIFIED",
      jurisdiction: "UNRESOLVED",
      applicableRegion: "UNRESOLVED",
      supportedRange: {
        startLocalDate: "1970-01-01",
        endLocalDate: "2050-12-31"
      },
      unresolvedReason: historicalReason
    },
    provenance
  };
}
async function resolveTimezone(source, civilLocal, resolver, warnings) {
  if (civilLocal.accuracy !== "EXACT") {
    return unresolvedTimezone("TIME_UNRESOLVED");
  }
  const timezone = source.temporalContext.timezone;
  if (timezone.status !== "EXPLICIT") {
    warnings.push(
      warning({
        code: timezone.status === "OFFSET_ONLY" ? "TIMEZONE_OFFSET_ONLY_NOT_EXECUTABLE" : "TIMEZONE_NOT_PROVIDED",
        path: "temporalContext.timezone",
        stage: "TIMEZONE"
      })
    );
    return unresolvedTimezone("TIMEZONE_NOT_PROVIDED");
  }
  if (!resolver) {
    warnings.push(
      warning({
        code: "TIMEZONE_RESOLVER_NOT_PROVIDED",
        path: "temporalContext.timezone",
        stage: "TIMEZONE"
      })
    );
    return unresolvedTimezone("RESOLVER_NOT_PROVIDED", timezone.ianaZone);
  }
  try {
    return await resolver.resolve({
      ianaZone: timezone.ianaZone,
      coordinates: source.place.coordinates,
      civilLocal
    });
  } catch {
    warnings.push(
      warning({
        code: "HISTORICAL_TIMEZONE_RESOLUTION_FAILED",
        path: "temporalContext.timezone",
        stage: "TIMEZONE"
      })
    );
    return unresolvedTimezone("HISTORICAL_DATA_UNAVAILABLE", timezone.ianaZone);
  }
}
function exactCivilDateTime(civilLocal) {
  return civilLocal.accuracy === "EXACT" ? { date: civilLocal.date, time: civilLocal.time } : void 0;
}
async function resolveTrueSolarTime(source, civilLocal, resolver, errors, warnings) {
  const civilDateTime = exactCivilDateTime(civilLocal);
  const option = source.temporalContext.trueSolarTime;
  if (option.mode === "DO_NOT_APPLY") {
    return {
      status: "NOT_APPLIED",
      ...civilDateTime ? { civilDateTime } : {}
    };
  }
  if (option.mode === "UNDECIDED") {
    warnings.push(
      warning({
        code: "TRUE_SOLAR_POLICY_UNDECIDED",
        path: "temporalContext.trueSolarTime",
        stage: "TRUE_SOLAR_TIME"
      })
    );
    return {
      status: "UNRESOLVED",
      ...civilDateTime ? { civilDateTime } : {},
      reason: "POLICY_UNDECIDED"
    };
  }
  if (!civilDateTime) {
    return { status: "UNRESOLVED", reason: "TIME_UNRESOLVED" };
  }
  const longitude = option.longitude ?? source.place.coordinates?.longitude;
  if (longitude === void 0) {
    errors.push(
      error({
        code: "TRUE_SOLAR_LONGITUDE_REQUIRED",
        path: "temporalContext.trueSolarTime.longitude",
        stage: "TRUE_SOLAR_TIME"
      })
    );
    return {
      status: "UNRESOLVED",
      civilDateTime,
      reason: "LONGITUDE_REQUIRED"
    };
  }
  if (!resolver) {
    warnings.push(
      warning({
        code: "TRUE_SOLAR_RESOLVER_NOT_PROVIDED",
        path: "temporalContext.trueSolarTime",
        stage: "TRUE_SOLAR_TIME"
      })
    );
    return {
      status: "UNRESOLVED",
      civilDateTime,
      reason: "RULE_UNAVAILABLE"
    };
  }
  try {
    return await resolver.resolve({ civilDateTime, longitude });
  } catch {
    warnings.push(
      warning({
        code: "TRUE_SOLAR_RESOLUTION_FAILED",
        path: "temporalContext.trueSolarTime",
        stage: "TRUE_SOLAR_TIME"
      })
    );
    return {
      status: "UNRESOLVED",
      civilDateTime,
      reason: "RULE_UNAVAILABLE"
    };
  }
}
function collectProvenance(normalized) {
  const values = [];
  if (normalized.calendar.status === "RESOLVED") {
    values.push(normalized.calendar.provenance);
  }
  if (normalized.timezone.status === "RESOLVED") {
    values.push(normalized.timezone.provenance);
    if ("dst" in normalized.timezone) {
      values.push(normalized.timezone.dst.provenance);
    }
  } else {
    values.push(normalized.timezone.provenance);
  }
  if (normalized.trueSolarTime.status === "APPLIED") {
    values.push(normalized.trueSolarTime.provenance);
  }
  return values;
}
async function normalizeBirthInput(source, dependencies = {}) {
  const errors = validateStructure(source);
  const warnings = [];
  if (errors.length > 0) return { success: false, errors, warnings };
  const calendarResolver = dependencies.calendarResolver ?? KASI_LUNISOLAR_CALENDAR_RESOLVER;
  let calendar;
  try {
    calendar = await calendarResolver.resolve(source.date);
  } catch {
    return {
      success: false,
      errors: [
        error({
          code: "CALENDAR_RESOLUTION_FAILED",
          path: "date",
          stage: "CALENDAR"
        })
      ],
      warnings
    };
  }
  if (calendar.status === "UNRESOLVED") {
    return {
      success: false,
      errors: [calendarError(calendar.reason)],
      warnings
    };
  }
  const civilLocal = createCivilLocal(source, calendar.gregorianDate);
  const timezone = await resolveTimezone(
    source,
    civilLocal,
    dependencies.historicalTimezoneResolver,
    warnings
  );
  const trueSolarTime = await resolveTrueSolarTime(
    source,
    civilLocal,
    dependencies.trueSolarTimeResolver,
    errors,
    warnings
  );
  if (errors.length > 0) return { success: false, errors, warnings };
  const value = {
    source,
    calendar,
    civilLocal,
    timezone,
    trueSolarTime,
    provenance: collectProvenance({ calendar, timezone, trueSolarTime }),
    warnings
  };
  return { success: true, value, warnings };
}

// src/features/interpretation/saju/contracts.ts
var HEAVENLY_STEMS = [
  "JIA",
  "YI",
  "BING",
  "DING",
  "WU",
  "JI",
  "GENG",
  "XIN",
  "REN",
  "GUI"
];
var EARTHLY_BRANCHES = [
  "ZI",
  "CHOU",
  "YIN",
  "MAO",
  "CHEN",
  "SI",
  "WU",
  "WEI",
  "SHEN",
  "YOU",
  "XU",
  "HAI"
];

// src/features/interpretation/saju/sexagenary.ts
var SEXAGENARY_CYCLE_LENGTH = 60;
function floorMod(dividend, divisor) {
  if (!Number.isFinite(dividend) || !Number.isInteger(dividend)) {
    throw new RangeError("dividend must be a finite integer");
  }
  if (!Number.isFinite(divisor) || !Number.isInteger(divisor) || divisor <= 0) {
    throw new RangeError("divisor must be a positive finite integer");
  }
  return (dividend % divisor + divisor) % divisor;
}
function normalizedIndex(value) {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return {
      ok: false,
      error: {
        code: "NON_FINITE_INTEGER",
        field: "sexagenaryIndex",
        message: "Sexagenary index must be a finite integer.",
        receivedValue: value
      }
    };
  }
  return {
    ok: true,
    value: floorMod(value, SEXAGENARY_CYCLE_LENGTH)
  };
}
function sexagenaryIndexToPillar(index) {
  const normalized = normalizedIndex(index);
  if (!normalized.ok) return normalized;
  return {
    ok: true,
    value: {
      index: normalized.value,
      stem: HEAVENLY_STEMS[normalized.value % HEAVENLY_STEMS.length],
      branch: EARTHLY_BRANCHES[normalized.value % EARTHLY_BRANCHES.length]
    }
  };
}
function isValidSexagenaryPair(stem, branch) {
  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  return stemIndex >= 0 && branchIndex >= 0 && stemIndex % 2 === branchIndex % 2;
}
function pillarToSexagenaryIndex(stem, branch) {
  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  if (stemIndex < 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_STEM",
        field: "stem",
        message: "Unknown heavenly stem.",
        receivedValue: stem
      }
    };
  }
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  if (branchIndex < 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_BRANCH",
        field: "branch",
        message: "Unknown earthly branch.",
        receivedValue: branch
      }
    };
  }
  if (!isValidSexagenaryPair(stem, branch)) {
    return {
      ok: false,
      error: {
        code: "INVALID_SEXAGENARY_PAIR",
        field: "pillar",
        message: "Stem and branch yin-yang parity does not form a cycle pair.",
        receivedValue: { stem, branch }
      }
    };
  }
  for (let index = 0; index < SEXAGENARY_CYCLE_LENGTH; index += 1) {
    if (index % HEAVENLY_STEMS.length === stemIndex && index % EARTHLY_BRANCHES.length === branchIndex) {
      return { ok: true, value: index };
    }
  }
  return {
    ok: false,
    error: {
      code: "INVALID_SEXAGENARY_PAIR",
      field: "pillar",
      message: "Stem and branch pair is not present in the sexagenary cycle.",
      receivedValue: { stem, branch }
    }
  };
}

// src/features/interpretation/saju/pillars.ts
function calculateYearPillar(lunarYear) {
  if (!Number.isFinite(lunarYear) || !Number.isInteger(lunarYear)) {
    return {
      ok: false,
      error: {
        code: "INVALID_LUNAR_YEAR",
        field: "lunarYear",
        message: "Lunar year must be a finite integer.",
        receivedValue: lunarYear
      }
    };
  }
  return sexagenaryIndexToPillar(floorMod(lunarYear - 4, 60));
}
function calculateMonthPillar(yearPillar, lunarMonth) {
  const validatedYearIndex = pillarToSexagenaryIndex(
    yearPillar.stem,
    yearPillar.branch
  );
  if (!validatedYearIndex.ok) return validatedYearIndex;
  if (validatedYearIndex.value !== yearPillar.index) {
    return {
      ok: false,
      error: {
        code: "INVALID_SEXAGENARY_PAIR",
        field: "yearPillar",
        message: "Year pillar index does not match its stem and branch.",
        receivedValue: yearPillar
      }
    };
  }
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    return {
      ok: false,
      error: {
        code: "INVALID_LUNAR_MONTH",
        field: "lunarMonth",
        message: "Lunar month ordinal must be an integer from 1 through 12.",
        receivedValue: lunarMonth
      }
    };
  }
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
  const firstMonthStemIndex = yearStemIndex % 5 * 2 + 2;
  const monthStemIndex = floorMod(firstMonthStemIndex + lunarMonth - 1, 10);
  const monthBranchIndex = (lunarMonth + 1) % 12;
  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === monthStemIndex && index % 12 === monthBranchIndex) {
      return sexagenaryIndexToPillar(index);
    }
  }
  throw new Error("Month pillar invariant failed.");
}

// src/features/interpretation/saju/dayPillar.ts
var DEOKBUNAI_SAJU_DAY_V1_RULE = {
  ruleId: "DEOKBUNAI_SAJU_DAY_V1",
  ruleVersion: "deokbunai.saju-day-pillar-rules.v1",
  calendarBasis: "GREGORIAN_CIVIL_DATE",
  dayBoundary: "CIVIL_MIDNIGHT",
  anchorDate: { year: 2e3, month: 1, day: 7 },
  anchorPillar: "JIA-ZI",
  anchorIndex: 0,
  authority: "KASI_LUN_ILJIN",
  supportedRange: {
    start: { year: 1900, month: 1, day: 1 },
    end: { year: 2050, month: 12, day: 31 }
  }
};
function calculateDayPillar(gregorianCivilDate) {
  if (!isValidGregorianDate(gregorianCivilDate)) {
    return {
      ok: false,
      error: {
        code: "INVALID_GREGORIAN_DATE",
        field: "gregorianCivilDate",
        message: "Day Pillar requires a valid Gregorian civil date.",
        receivedValue: gregorianCivilDate
      }
    };
  }
  if (compareGregorianDates(
    gregorianCivilDate,
    DEOKBUNAI_SAJU_DAY_V1_RULE.supportedRange.start
  ) < 0 || compareGregorianDates(
    gregorianCivilDate,
    DEOKBUNAI_SAJU_DAY_V1_RULE.supportedRange.end
  ) > 0) {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_DATE_RANGE",
        field: "gregorianCivilDate",
        message: "Day Pillar supports Gregorian dates from 1900-01-01 through 2050-12-31.",
        receivedValue: gregorianCivilDate
      }
    };
  }
  const dayDistance = gregorianToCivilDayOrdinal(gregorianCivilDate) - gregorianToCivilDayOrdinal(DEOKBUNAI_SAJU_DAY_V1_RULE.anchorDate);
  const dayIndex = floorMod(
    DEOKBUNAI_SAJU_DAY_V1_RULE.anchorIndex + dayDistance,
    60
  );
  return sexagenaryIndexToPillar(dayIndex);
}

// src/features/interpretation/saju/hourPillar.ts
var DEOKBUNAI_SAJU_HOUR_V1_RULE = {
  ruleId: "DEOKBUNAI_SAJU_HOUR_V1",
  ruleVersion: "deokbunai.saju-hour-pillar-rules.v1",
  timeBasis: "LOCAL_CIVIL_TIME",
  dayBoundary: "CIVIL_MIDNIGHT",
  ziHourRange: "23:00:00..00:59:59",
  trueSolarTime: "DO_NOT_APPLY",
  authority: "DEOKBUNAI_SAJU_V1_PRODUCT_RULE"
};
function isFiniteInteger(value) {
  return Number.isFinite(value) && Number.isInteger(value);
}
function resolveHourBranch(localTime) {
  if (localTime == null || !isFiniteInteger(localTime.hour) || !isFiniteInteger(localTime.minute) || !isFiniteInteger(localTime.second) || localTime.hour < 0 || localTime.hour > 23 || localTime.minute < 0 || localTime.minute > 59 || localTime.second < 0 || localTime.second > 59) {
    return {
      ok: false,
      error: {
        code: "INVALID_LOCAL_TIME",
        field: "localTime",
        message: "Exact local civil time requires integer hour 0..23, minute 0..59, and second 0..59.",
        receivedValue: localTime
      }
    };
  }
  const branchIndex = floorMod(Math.floor((localTime.hour + 1) / 2), 12);
  return { ok: true, value: EARTHLY_BRANCHES[branchIndex] };
}
function calculateHourPillar(input) {
  const dayStemIndex = HEAVENLY_STEMS.indexOf(input.dayStem);
  if (dayStemIndex < 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_STEM",
        field: "dayStem",
        message: "Hour Pillar requires a valid verified Day Stem.",
        receivedValue: input.dayStem
      }
    };
  }
  const branch = resolveHourBranch(input.localTime);
  if (!branch.ok) return branch;
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch.value);
  const ziHourStemIndex = dayStemIndex % 5 * 2;
  const hourStem = HEAVENLY_STEMS[floorMod(ziHourStemIndex + branchIndex, HEAVENLY_STEMS.length)];
  const pillarIndex = pillarToSexagenaryIndex(hourStem, branch.value);
  if (!pillarIndex.ok) return pillarIndex;
  return sexagenaryIndexToPillar(pillarIndex.value);
}

// src/features/interpretation/solarTerm/lunarJsSolarTermProvider.ts
import { Solar } from "lunar-javascript";

// src/features/interpretation/solarTerm/termDefinitions.ts
var SOLAR_TERM_DEFINITIONS = [
  { termId: "MINOR_COLD", koreanName: "소한", solarLongitudeDegrees: 285, kind: "JIE", gregorianOrder: 0 },
  { termId: "MAJOR_COLD", koreanName: "대한", solarLongitudeDegrees: 300, kind: "ZHONGQI", gregorianOrder: 1 },
  { termId: "START_OF_SPRING", koreanName: "입춘", solarLongitudeDegrees: 315, kind: "JIE", gregorianOrder: 2 },
  { termId: "RAIN_WATER", koreanName: "우수", solarLongitudeDegrees: 330, kind: "ZHONGQI", gregorianOrder: 3 },
  { termId: "AWAKENING_OF_INSECTS", koreanName: "경칩", solarLongitudeDegrees: 345, kind: "JIE", gregorianOrder: 4 },
  { termId: "SPRING_EQUINOX", koreanName: "춘분", solarLongitudeDegrees: 0, kind: "ZHONGQI", gregorianOrder: 5 },
  { termId: "PURE_BRIGHTNESS", koreanName: "청명", solarLongitudeDegrees: 15, kind: "JIE", gregorianOrder: 6 },
  { termId: "GRAIN_RAIN", koreanName: "곡우", solarLongitudeDegrees: 30, kind: "ZHONGQI", gregorianOrder: 7 },
  { termId: "START_OF_SUMMER", koreanName: "입하", solarLongitudeDegrees: 45, kind: "JIE", gregorianOrder: 8 },
  { termId: "GRAIN_FULL", koreanName: "소만", solarLongitudeDegrees: 60, kind: "ZHONGQI", gregorianOrder: 9 },
  { termId: "GRAIN_IN_EAR", koreanName: "망종", solarLongitudeDegrees: 75, kind: "JIE", gregorianOrder: 10 },
  { termId: "SUMMER_SOLSTICE", koreanName: "하지", solarLongitudeDegrees: 90, kind: "ZHONGQI", gregorianOrder: 11 },
  { termId: "MINOR_HEAT", koreanName: "소서", solarLongitudeDegrees: 105, kind: "JIE", gregorianOrder: 12 },
  { termId: "MAJOR_HEAT", koreanName: "대서", solarLongitudeDegrees: 120, kind: "ZHONGQI", gregorianOrder: 13 },
  { termId: "START_OF_AUTUMN", koreanName: "입추", solarLongitudeDegrees: 135, kind: "JIE", gregorianOrder: 14 },
  { termId: "END_OF_HEAT", koreanName: "처서", solarLongitudeDegrees: 150, kind: "ZHONGQI", gregorianOrder: 15 },
  { termId: "WHITE_DEW", koreanName: "백로", solarLongitudeDegrees: 165, kind: "JIE", gregorianOrder: 16 },
  { termId: "AUTUMN_EQUINOX", koreanName: "추분", solarLongitudeDegrees: 180, kind: "ZHONGQI", gregorianOrder: 17 },
  { termId: "COLD_DEW", koreanName: "한로", solarLongitudeDegrees: 195, kind: "JIE", gregorianOrder: 18 },
  { termId: "FROST_DESCENT", koreanName: "상강", solarLongitudeDegrees: 210, kind: "ZHONGQI", gregorianOrder: 19 },
  { termId: "START_OF_WINTER", koreanName: "입동", solarLongitudeDegrees: 225, kind: "JIE", gregorianOrder: 20 },
  { termId: "MINOR_SNOW", koreanName: "소설", solarLongitudeDegrees: 240, kind: "ZHONGQI", gregorianOrder: 21 },
  { termId: "MAJOR_SNOW", koreanName: "대설", solarLongitudeDegrees: 255, kind: "JIE", gregorianOrder: 22 },
  { termId: "WINTER_SOLSTICE", koreanName: "동지", solarLongitudeDegrees: 270, kind: "ZHONGQI", gregorianOrder: 23 }
];
var SOLAR_TERM_IDS = SOLAR_TERM_DEFINITIONS.map(
  (definition) => definition.termId
);
var JIE_SOLAR_TERM_IDS = SOLAR_TERM_DEFINITIONS.filter(
  (definition) => definition.kind === "JIE"
).map((definition) => definition.termId);
function getSolarTermDefinition(termId) {
  const definition = SOLAR_TERM_DEFINITIONS.find((item) => item.termId === termId);
  if (!definition) {
    throw new Error(`Unknown solar term id: ${termId}`);
  }
  return definition;
}

// src/features/interpretation/solarTerm/lunarJsSolarTermAdapter.ts
var SECONDS_PER_DAY = 86400;
var FIXED_UTC_PLUS_08_SECONDS = 28800;
var UNIX_EPOCH_DAY = gregorianToCivilDayOrdinal({
  year: 1970,
  month: 1,
  day: 1
});
var LUNAR_JS_SOLAR_TERM_PROVIDER_PIN = {
  provider: "lunar-javascript",
  providerVersion: "1.7.7",
  packageTarballChecksum: {
    algorithm: "SHA-256",
    value: "d1359ab9ca4913d1db3978a42ddfc290eb8ea9de54ce043f5b1f718ff71eea36"
  },
  license: "MIT",
  attribution: "Copyright (c) 2018 6tail",
  sourceTimeBasis: "FIXED_UTC_PLUS_08",
  adapterRuleVersion: "deokbunai.solar-term-lunarjs-adapter.v1",
  conversionRuleVersion: "deokbunai.solar-term-lunarjs-conversion.v1"
};
var DEOKBUNAI_SOLAR_TERM_V1_POLICY = {
  ruleId: "DEOKBUNAI_SOLAR_TERM_V1",
  ruleVersion: "deokbunai.solar-term.v1",
  runtimeAuthority: "lunar-javascript@1.7.7",
  supportedBirthRange: {
    start: { year: 1970, month: 1, day: 1 },
    end: { year: 2050, month: 12, day: 31 }
  },
  providerTimeBasis: "FIXED_UTC_PLUS_08",
  normalizedTimeBasis: "UTC_INSTANT",
  preservedProviderPrecision: "SECOND",
  canonicalBoundaryPrecision: "MINUTE",
  boundaryRule: "SAME_UTC_MINUTE_IS_AMBIGUOUS",
  intervalBoundary: "DIRECTIONAL_NEAREST_JIE",
  primaryRuntimeRequiresNetwork: false
};
var LUNAR_JS_JIE_NAMES = {
  小寒: "MINOR_COLD",
  立春: "START_OF_SPRING",
  惊蛰: "AWAKENING_OF_INSECTS",
  驚蟄: "AWAKENING_OF_INSECTS",
  清明: "PURE_BRIGHTNESS",
  立夏: "START_OF_SUMMER",
  芒种: "GRAIN_IN_EAR",
  芒種: "GRAIN_IN_EAR",
  小暑: "MINOR_HEAT",
  立秋: "START_OF_AUTUMN",
  白露: "WHITE_DEW",
  寒露: "COLD_DEW",
  立冬: "START_OF_WINTER",
  大雪: "MAJOR_SNOW"
};
function epochSecondsToFixedOffsetCivil(epochSeconds, offsetSeconds) {
  const shiftedSeconds = epochSeconds + offsetSeconds;
  const dayOffset = Math.floor(shiftedSeconds / SECONDS_PER_DAY);
  const secondOfDay = shiftedSeconds - dayOffset * SECONDS_PER_DAY;
  return {
    date: civilDayOrdinalToGregorian(UNIX_EPOCH_DAY + dayOffset),
    hour: Math.floor(secondOfDay / 3600),
    minute: Math.floor(secondOfDay % 3600 / 60),
    second: secondOfDay % 60
  };
}
function civilSecondToEpochSeconds(value, offsetSeconds) {
  return (gregorianToCivilDayOrdinal(value.date) - UNIX_EPOCH_DAY) * SECONDS_PER_DAY + value.hour * 3600 + value.minute * 60 + value.second - offsetSeconds;
}
function isValidCivilSecond(value) {
  return isValidGregorianDate(value.date) && Number.isInteger(value.hour) && Number.isInteger(value.minute) && Number.isInteger(value.second) && value.hour >= 0 && value.hour <= 23 && value.minute >= 0 && value.minute <= 59 && value.second >= 0 && value.second <= 59;
}
function readProviderCivil(solar) {
  return {
    date: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay()
    },
    hour: solar.getHour(),
    minute: solar.getMinute(),
    second: solar.getSecond()
  };
}
function createLunarJsSolarTermAdapter(publicApi) {
  return {
    resolve(input) {
      if (!Number.isSafeInteger(input.birthInstant.epochSeconds)) {
        return {
          ok: false,
          error: {
            code: "INVALID_BIRTH_INSTANT",
            path: "birthInstant.epochSeconds"
          }
        };
      }
      const providerBirthCivil = epochSecondsToFixedOffsetCivil(
        input.birthInstant.epochSeconds,
        FIXED_UTC_PLUS_08_SECONDS
      );
      try {
        const providerBirth = publicApi.Solar.fromYmdHms(
          providerBirthCivil.date.year,
          providerBirthCivil.date.month,
          providerBirthCivil.date.day,
          providerBirthCivil.hour,
          providerBirthCivil.minute,
          providerBirthCivil.second
        );
        const lunar = providerBirth.getLunar();
        const boundary = input.direction === "FORWARD" ? lunar.getNextJie() : lunar.getPrevJie();
        if (!boundary.isJie() || boundary.isQi()) {
          return {
            ok: false,
            error: {
              code: "NON_JIE_BOUNDARY",
              path: "provider.boundary"
            }
          };
        }
        const sourceName = boundary.getName();
        const termId = LUNAR_JS_JIE_NAMES[sourceName];
        if (!termId || getSolarTermDefinition(termId).kind !== "JIE") {
          return {
            ok: false,
            error: {
              code: "UNSUPPORTED_JIE_NAME",
              path: "provider.boundary.name",
              details: { sourceName }
            }
          };
        }
        const sourceCivil = readProviderCivil(boundary.getSolar());
        if (!isValidCivilSecond(sourceCivil)) {
          return {
            ok: false,
            error: {
              code: "INVALID_PROVIDER_TIMESTAMP",
              path: "provider.boundary.solar"
            }
          };
        }
        const epochSeconds = civilSecondToEpochSeconds(
          sourceCivil,
          FIXED_UTC_PLUS_08_SECONDS
        );
        const directionMatches = input.direction === "FORWARD" ? epochSeconds > input.birthInstant.epochSeconds : epochSeconds < input.birthInstant.epochSeconds;
        if (!directionMatches) {
          return {
            ok: false,
            error: {
              code: "BOUNDARY_DIRECTION_MISMATCH",
              path: "provider.boundary.solar",
              details: {
                direction: input.direction,
                birthEpochSeconds: input.birthInstant.epochSeconds,
                boundaryEpochSeconds: epochSeconds
              }
            }
          };
        }
        return {
          ok: true,
          value: {
            termId,
            kind: "JIE",
            sourceName,
            sourceCivil,
            sourceTimeBasis: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.sourceTimeBasis,
            normalizedUtcInstant: {
              kind: "UTC_INSTANT",
              epochSeconds
            },
            provenance: {
              provider: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.provider,
              providerVersion: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.providerVersion,
              packageTarballChecksum: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.packageTarballChecksum,
              license: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.license,
              attribution: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.attribution,
              publicApiPath: input.direction === "FORWARD" ? "Solar.fromYmdHms.getLunar.getNextJie" : "Solar.fromYmdHms.getLunar.getPrevJie",
              adapterRuleVersion: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.adapterRuleVersion,
              conversionRuleVersion: LUNAR_JS_SOLAR_TERM_PROVIDER_PIN.conversionRuleVersion
            }
          }
        };
      } catch {
        return {
          ok: false,
          error: {
            code: "PROVIDER_FAILURE",
            path: "provider"
          }
        };
      }
    }
  };
}

// src/features/interpretation/solarTerm/lunarJsSolarTermProvider.ts
var LUNAR_JS_SOLAR_TERM_ADAPTER = createLunarJsSolarTermAdapter({
  Solar
});

// src/features/interpretation/saju/sajuTemporalAttribution.ts
var DEOKBUNAI_SAJU_YEAR_MONTH_ATTRIBUTION_V1_RULE = {
  ruleId: "DEOKBUNAI_SAJU_YEAR_MONTH_ATTRIBUTION_V1",
  ruleVersion: "deokbunai.saju-year-month-attribution.v1",
  /** Saju YEAR rolls over at 立春 (start of 寅월), never at Lunar New Year or Jan 1. */
  yearBoundary: "START_OF_SPRING_IPCHUN",
  /** Saju MONTH rolls over at the twelve monthly 節 (Jie), never at lunar day-1 or Gregorian month-1. */
  monthBoundary: "TWELVE_JIE_JIEQI",
  solarTerm: {
    provider: "lunar-javascript",
    providerVersion: "1.7.7",
    adapterRuleVersion: "deokbunai.solar-term-lunarjs-adapter.v1",
    solarTermRuleVersion: DEOKBUNAI_SOLAR_TERM_V1_POLICY.ruleVersion,
    // deokbunai.solar-term.v1
    boundaryPrecision: "MINUTE",
    boundaryTiePolicy: "SAME_UTC_MINUTE_IS_AMBIGUOUS",
    // reused from ENGINE-12
    supportedRange: "FIXED_1970_01_01_THROUGH_2050_12_31"
    // reused from ENGINE-12
  }
};
var JIE_TERM_TO_SAJU_MONTH_ORDINAL = {
  START_OF_SPRING: 1,
  // 立春 寅
  AWAKENING_OF_INSECTS: 2,
  // 驚蟄 卯
  PURE_BRIGHTNESS: 3,
  // 清明 辰
  START_OF_SUMMER: 4,
  // 立夏 巳
  GRAIN_IN_EAR: 5,
  // 芒種 午
  MINOR_HEAT: 6,
  // 小暑 未
  START_OF_AUTUMN: 7,
  // 立秋 申
  WHITE_DEW: 8,
  // 白露 酉
  COLD_DEW: 9,
  // 寒露 戌
  START_OF_WINTER: 10,
  // 立冬 亥
  MAJOR_SNOW: 11,
  // 大雪 子
  MINOR_COLD: 12
  // 小寒 丑
};
var SECONDS_PER_DAY2 = 86400;
var SECONDS_PER_MINUTE = 60;
var KST_OFFSET_SECONDS = 32400;
var UNIX_EPOCH_DAY2 = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });
function epochToKstDate(epochSeconds) {
  const shifted = epochSeconds + KST_OFFSET_SECONDS;
  const dayOffset = Math.floor(shifted / SECONDS_PER_DAY2);
  return civilDayOrdinalToGregorian(UNIX_EPOCH_DAY2 + dayOffset);
}
var utcMinute = (epochSeconds) => Math.floor(epochSeconds / SECONDS_PER_MINUTE);
function resolveSajuYearAndMonth(referenceEpochSeconds, solarTermAdapter, options = {}) {
  if (!Number.isSafeInteger(referenceEpochSeconds)) {
    return { ok: false, error: { code: "INVALID_REFERENCE_INSTANT" } };
  }
  const referenceDate = epochToKstDate(referenceEpochSeconds);
  const range = DEOKBUNAI_SOLAR_TERM_V1_POLICY.supportedBirthRange;
  if (compareGregorianDates(referenceDate, range.start) < 0 || compareGregorianDates(referenceDate, range.end) > 0) {
    return {
      ok: false,
      error: { code: "UNSUPPORTED_DATE_RANGE", details: { ...referenceDate } }
    };
  }
  const refMinute = utcMinute(referenceEpochSeconds);
  const minuteProbe = solarTermAdapter.resolve({
    birthInstant: { kind: "UTC_INSTANT", epochSeconds: referenceEpochSeconds - SECONDS_PER_MINUTE },
    direction: "FORWARD"
  });
  if (minuteProbe.ok && utcMinute(minuteProbe.value.normalizedUtcInstant.epochSeconds) === refMinute) {
    return { ok: false, error: { code: "AMBIGUOUS_BOUNDARY_MINUTE" } };
  }
  const governing = solarTermAdapter.resolve({
    birthInstant: { kind: "UTC_INSTANT", epochSeconds: referenceEpochSeconds },
    direction: "REVERSE"
  });
  if (!governing.ok) {
    return { ok: false, error: { code: "SOLAR_TERM_UNAVAILABLE", details: { path: governing.error.path } } };
  }
  const next = solarTermAdapter.resolve({
    birthInstant: { kind: "UTC_INSTANT", epochSeconds: referenceEpochSeconds },
    direction: "FORWARD"
  });
  if (options.timeIsKnown === false) {
    const onGoverningDate = compareGregorianDates(epochToKstDate(governing.value.normalizedUtcInstant.epochSeconds), referenceDate) === 0;
    const onNextDate = next.ok && compareGregorianDates(epochToKstDate(next.value.normalizedUtcInstant.epochSeconds), referenceDate) === 0;
    if (onGoverningDate || onNextDate) {
      return { ok: false, error: { code: "AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE" } };
    }
  }
  const jieMonthOrdinal = JIE_TERM_TO_SAJU_MONTH_ORDINAL[governing.value.termId];
  if (jieMonthOrdinal === void 0) {
    return { ok: false, error: { code: "UNSUPPORTED_JIE_TERM", details: { termId: governing.value.termId } } };
  }
  const jieGregorianYear = governing.value.sourceCivil.date.year;
  const sajuYear = jieMonthOrdinal === 12 ? jieGregorianYear - 1 : jieGregorianYear;
  return {
    ok: true,
    value: { sajuYear, jieMonthOrdinal, governingJie: governing.value }
  };
}

// src/features/interpretation/saju/fourPillars.ts
var SECONDS_PER_DAY3 = 86400;
var UNIX_EPOCH_DAY3 = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });
var ASIA_SEOUL_STANDARD_OFFSET_SECONDS = 32400;
function birthReferenceEpochSeconds(calendar, civilLocal, timezone) {
  const date = calendar.gregorianDate;
  let hour = 12;
  let minute = 0;
  let second = 0;
  if (civilLocal.accuracy === "EXACT") {
    hour = civilLocal.time.hour;
    minute = civilLocal.time.minute;
    second = civilLocal.time.second ?? 0;
  }
  const offsetSeconds = timezone.status === "RESOLVED" && "resolvedOffsetSeconds" in timezone ? timezone.resolvedOffsetSeconds : ASIA_SEOUL_STANDARD_OFFSET_SECONDS;
  const dayCount = gregorianToCivilDayOrdinal(date) - UNIX_EPOCH_DAY3;
  return dayCount * SECONDS_PER_DAY3 + hour * 3600 + minute * 60 + second - offsetSeconds;
}
function unavailable(input, reason) {
  return {
    status: "UNAVAILABLE",
    normalizedBirthFingerprint: input.normalizedBirthFingerprint,
    reason
  };
}
function unresolvedTimezoneReason(timezone) {
  return timezone.reason === "HISTORICAL_SOURCE_CONFLICT" || timezone.historicalProvenance.authorityStatus === "SOURCE_CONFLICT" ? "HISTORICAL_SOURCE_CONFLICT" : "HISTORICAL_TIME_UNRESOLVED";
}
function resolveHour(input, dayPillar) {
  const civilLocal = input.normalized.civilLocal;
  if (civilLocal.accuracy === "UNKNOWN") {
    return { status: "UNAVAILABLE", reason: "BIRTH_TIME_UNKNOWN" };
  }
  if (civilLocal.accuracy === "APPROXIMATE") {
    return {
      status: "AMBIGUOUS",
      reason: "BIRTH_TIME_APPROXIMATE_AMBIGUOUS"
    };
  }
  if (civilLocal.accuracy === "UNRESOLVED") {
    return { status: "UNAVAILABLE", reason: "HISTORICAL_TIME_UNRESOLVED" };
  }
  if (civilLocal.time.second === void 0) {
    return { status: "UNAVAILABLE", reason: "EXACT_LOCAL_TIME_INCOMPLETE" };
  }
  const timezone = input.normalized.timezone;
  if (timezone.status === "UNRESOLVED") {
    return { status: "UNAVAILABLE", reason: unresolvedTimezoneReason(timezone) };
  }
  if (timezone.historicalProvenance.authorityStatus === "SOURCE_CONFLICT") {
    return { status: "UNAVAILABLE", reason: "HISTORICAL_SOURCE_CONFLICT" };
  }
  if (timezone.historicalProvenance.comparison === "CONFLICT") {
    return { status: "UNAVAILABLE", reason: "HISTORICAL_SOURCE_CONFLICT" };
  }
  if (timezone.historicalProvenance.authorityStatus === "UNRESOLVED") {
    return { status: "UNAVAILABLE", reason: "HISTORICAL_TIME_UNRESOLVED" };
  }
  const localResolution = timezone.localTimeResolution;
  if (localResolution.kind === "AMBIGUOUS") {
    return { status: "AMBIGUOUS", reason: "LOCAL_TIME_AMBIGUOUS" };
  }
  if (localResolution.kind === "NONEXISTENT") {
    return { status: "UNAVAILABLE", reason: "LOCAL_TIME_NONEXISTENT" };
  }
  const hour = calculateHourPillar({
    dayStem: dayPillar.stem,
    localTime: civilLocal.time
  });
  return hour.ok ? { status: "AVAILABLE", pillar: hour.value } : { status: "UNAVAILABLE", reason: "INVALID_LOCAL_TIME" };
}
function calculateFourPillars(input, solarTermAdapter = LUNAR_JS_SOLAR_TERM_ADAPTER) {
  if (input.normalizedBirthFingerprint.trim().length === 0 || input.engineRuleSetVersion.trim().length === 0) {
    return unavailable(input, { code: "INVALID_CALCULATION_IDENTITY" });
  }
  if (input.normalized.trueSolarTime.status !== "NOT_APPLIED") {
    return unavailable(input, { code: "PRODUCT_RULE_VIOLATION" });
  }
  const calendar = input.normalized.calendar;
  if (calendar.status === "UNRESOLVED") {
    return unavailable(input, {
      code: "CALENDAR_UNRESOLVED",
      calendarReason: calendar.reason
    });
  }
  const civilLocal = input.normalized.civilLocal;
  if (civilLocal.accuracy === "UNRESOLVED") {
    return unavailable(input, { code: "NORMALIZED_INPUT_INCONSISTENT" });
  }
  if (compareGregorianDates(civilLocal.date, calendar.gregorianDate) !== 0) {
    return unavailable(input, { code: "NORMALIZED_DATE_MISMATCH" });
  }
  const referenceEpochSeconds = birthReferenceEpochSeconds(
    calendar,
    civilLocal,
    input.normalized.timezone
  );
  const attribution = resolveSajuYearAndMonth(referenceEpochSeconds, solarTermAdapter, {
    timeIsKnown: civilLocal.accuracy === "EXACT"
  });
  if (!attribution.ok) {
    return unavailable(input, {
      code: "YEAR_MONTH_ATTRIBUTION_FAILED",
      attributionReason: attribution.error.code
    });
  }
  const yearPillar = calculateYearPillar(attribution.value.sajuYear);
  if (!yearPillar.ok) {
    return unavailable(input, {
      code: "CORE_CALCULATION_FAILED",
      coreErrorCode: yearPillar.error.code
    });
  }
  const monthPillar = calculateMonthPillar(
    yearPillar.value,
    attribution.value.jieMonthOrdinal
  );
  if (!monthPillar.ok) {
    return unavailable(input, {
      code: "CORE_CALCULATION_FAILED",
      coreErrorCode: monthPillar.error.code
    });
  }
  const day = calculateDayPillar(calendar.gregorianDate);
  if (!day.ok) {
    return unavailable(input, {
      code: "CORE_CALCULATION_FAILED",
      coreErrorCode: day.error.code
    });
  }
  const hour = resolveHour(input, day.value);
  const identity = {
    normalizedBirthFingerprint: input.normalizedBirthFingerprint,
    ruleId: input.ruleProfile.ruleId,
    ruleVersion: input.ruleProfile.ruleVersion,
    engineRuleSetVersion: input.engineRuleSetVersion,
    dayRuleVersion: DEOKBUNAI_SAJU_DAY_V1_RULE.ruleVersion,
    hourRuleVersion: DEOKBUNAI_SAJU_HOUR_V1_RULE.ruleVersion
  };
  const provenance = {
    normalizedBirthFingerprint: input.normalizedBirthFingerprint,
    productRule: input.ruleProfile,
    yearMonthAttributionRule: DEOKBUNAI_SAJU_YEAR_MONTH_ATTRIBUTION_V1_RULE,
    dayRule: DEOKBUNAI_SAJU_DAY_V1_RULE,
    hourRule: DEOKBUNAI_SAJU_HOUR_V1_RULE,
    calendarDatasetVersion: calendar.calendarDatasetVersion,
    calendarConversionRuleVersion: calendar.calendarConversionRuleVersion,
    engineRuleSetVersion: input.engineRuleSetVersion
  };
  const pillars = {
    year: yearPillar.value,
    month: monthPillar.value,
    day: day.value,
    hour
  };
  return hour.status === "AVAILABLE" ? { status: "COMPLETE", pillars, identity, provenance } : { status: "PARTIAL", pillars, identity, provenance };
}

// src/features/interpretation/saju/fixtures/fourPillarsGoldenFixtures.ts
var ANCHOR_EXPECTED = {
  year: { stem: "JI", branch: "MAO" },
  month: { stem: "DING", branch: "CHOU" },
  day: { stem: "JIA", branch: "ZI" }
};
var FOUR_PILLARS_GOLDEN_FIXTURES = [
  { id: "EXACT_STANDARD", gregorianDate: { year: 2e3, month: 1, day: 7 }, time: { accuracy: "EXACT", localTime: { hour: 1, minute: 30, second: 0 } }, expectedStatus: "COMPLETE", expected: { ...ANCHOR_EXPECTED, hour: { stem: "YI", branch: "CHOU" } }, provenance: "KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES" },
  { id: "EXACT_23_CURRENT_CIVIL_DATE", gregorianDate: { year: 2e3, month: 1, day: 7 }, time: { accuracy: "EXACT", localTime: { hour: 23, minute: 30, second: 0 } }, expectedStatus: "COMPLETE", expected: { ...ANCHOR_EXPECTED, hour: { stem: "JIA", branch: "ZI" } }, provenance: "KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES" },
  { id: "EXACT_00_INPUT_CIVIL_DATE", gregorianDate: { year: 2e3, month: 1, day: 7 }, time: { accuracy: "EXACT", localTime: { hour: 0, minute: 30, second: 0 } }, expectedStatus: "COMPLETE", expected: { ...ANCHOR_EXPECTED, hour: { stem: "JIA", branch: "ZI" } }, provenance: "KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES" },
  { id: "KASI_LEAP_MONTH", gregorianDate: { year: 2023, month: 3, day: 22 }, time: { accuracy: "EXACT", localTime: { hour: 12, minute: 30, second: 0 } }, expectedStatus: "COMPLETE", expected: { year: { stem: "GUI", branch: "MAO" }, month: { stem: "YI", branch: "MAO" }, day: { stem: "JI", branch: "MAO" }, hour: { stem: "GENG", branch: "WU" } }, provenance: "KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES" },
  { id: "UNKNOWN_TIME", gregorianDate: { year: 2e3, month: 1, day: 7 }, time: { accuracy: "UNKNOWN" }, expectedStatus: "PARTIAL", expected: ANCHOR_EXPECTED, provenance: "KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES" },
  { id: "APPROXIMATE_TIME", gregorianDate: { year: 2e3, month: 1, day: 7 }, time: { accuracy: "APPROXIMATE", period: "MORNING" }, expectedStatus: "PARTIAL", expected: ANCHOR_EXPECTED, provenance: "KASI_CALENDAR_AND_VERIFIED_PILLAR_CORES" }
];

// src/features/interpretation/saju/derived/rules.ts
var DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION = "deokbunai.saju-derived-facts.v1";
var DEOKBUNAI_SAJU_YIN_YANG_VERSION = "deokbunai.saju-yin-yang.v1";
var DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION = "deokbunai.saju-five-elements.v1";
var DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION = "deokbunai.saju-hidden-stems.v1";
var DEOKBUNAI_SAJU_TEN_GODS_VERSION = "deokbunai.saju-ten-gods.v1";
var DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS = {
  derivedFacts: DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION,
  yinYang: DEOKBUNAI_SAJU_YIN_YANG_VERSION,
  fiveElements: DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION,
  hiddenStems: DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION,
  tenGods: DEOKBUNAI_SAJU_TEN_GODS_VERSION
};
var STEM_YIN_YANG = {
  JIA: "YANG",
  YI: "YIN",
  BING: "YANG",
  DING: "YIN",
  WU: "YANG",
  JI: "YIN",
  GENG: "YANG",
  XIN: "YIN",
  REN: "YANG",
  GUI: "YIN"
};
var BRANCH_YIN_YANG = {
  ZI: "YANG",
  CHOU: "YIN",
  YIN: "YANG",
  MAO: "YIN",
  CHEN: "YANG",
  SI: "YIN",
  WU: "YANG",
  WEI: "YIN",
  SHEN: "YANG",
  YOU: "YIN",
  XU: "YANG",
  HAI: "YIN"
};
var STEM_ELEMENTS = {
  JIA: "WOOD",
  YI: "WOOD",
  BING: "FIRE",
  DING: "FIRE",
  WU: "EARTH",
  JI: "EARTH",
  GENG: "METAL",
  XIN: "METAL",
  REN: "WATER",
  GUI: "WATER"
};
var BRANCH_ELEMENTS = {
  ZI: "WATER",
  CHOU: "EARTH",
  YIN: "WOOD",
  MAO: "WOOD",
  CHEN: "EARTH",
  SI: "FIRE",
  WU: "FIRE",
  WEI: "EARTH",
  SHEN: "METAL",
  YOU: "METAL",
  XU: "EARTH",
  HAI: "WATER"
};
var HIDDEN_STEMS = {
  ZI: [
    { stem: "REN", role: "RESIDUAL" },
    { stem: "GUI", role: "MAIN" }
  ],
  CHOU: [
    { stem: "GUI", role: "RESIDUAL" },
    { stem: "XIN", role: "MIDDLE" },
    { stem: "JI", role: "MAIN" }
  ],
  YIN: [
    { stem: "WU", role: "RESIDUAL" },
    { stem: "BING", role: "MIDDLE" },
    { stem: "JIA", role: "MAIN" }
  ],
  MAO: [
    { stem: "JIA", role: "RESIDUAL" },
    { stem: "YI", role: "MAIN" }
  ],
  CHEN: [
    { stem: "YI", role: "RESIDUAL" },
    { stem: "GUI", role: "MIDDLE" },
    { stem: "WU", role: "MAIN" }
  ],
  SI: [
    { stem: "WU", role: "RESIDUAL" },
    { stem: "GENG", role: "MIDDLE" },
    { stem: "BING", role: "MAIN" }
  ],
  WU: [
    { stem: "BING", role: "RESIDUAL" },
    { stem: "JI", role: "MIDDLE" },
    { stem: "DING", role: "MAIN" }
  ],
  WEI: [
    { stem: "DING", role: "RESIDUAL" },
    { stem: "YI", role: "MIDDLE" },
    { stem: "JI", role: "MAIN" }
  ],
  SHEN: [
    { stem: "WU", role: "RESIDUAL" },
    { stem: "REN", role: "MIDDLE" },
    { stem: "GENG", role: "MAIN" }
  ],
  YOU: [
    { stem: "GENG", role: "RESIDUAL" },
    { stem: "XIN", role: "MAIN" }
  ],
  XU: [
    { stem: "XIN", role: "RESIDUAL" },
    { stem: "DING", role: "MIDDLE" },
    { stem: "WU", role: "MAIN" }
  ],
  HAI: [
    { stem: "WU", role: "RESIDUAL" },
    { stem: "JIA", role: "MIDDLE" },
    { stem: "REN", role: "MAIN" }
  ]
};
var ELEMENT_GENERATES = {
  WOOD: "FIRE",
  FIRE: "EARTH",
  EARTH: "METAL",
  METAL: "WATER",
  WATER: "WOOD"
};
var ELEMENT_CONTROLS = {
  WOOD: "EARTH",
  FIRE: "METAL",
  EARTH: "WATER",
  METAL: "WOOD",
  WATER: "FIRE"
};
function failure2(error2) {
  return { ok: false, error: error2 };
}
function lookupValue(values, key2, code, field) {
  if (!Object.prototype.hasOwnProperty.call(values, key2)) {
    return failure2({ code, field, receivedValue: key2 });
  }
  return { ok: true, value: values[key2] };
}
function getStemYinYang(stem) {
  return lookupValue(
    STEM_YIN_YANG,
    stem,
    "INVALID_HEAVENLY_STEM",
    "stem"
  );
}
function getBranchYinYang(branch) {
  return lookupValue(
    BRANCH_YIN_YANG,
    branch,
    "INVALID_EARTHLY_BRANCH",
    "branch"
  );
}
function getStemElement(stem) {
  return lookupValue(
    STEM_ELEMENTS,
    stem,
    "INVALID_HEAVENLY_STEM",
    "stem"
  );
}
function getBranchElement(branch) {
  return lookupValue(
    BRANCH_ELEMENTS,
    branch,
    "INVALID_EARTHLY_BRANCH",
    "branch"
  );
}
function getHiddenStems(branch) {
  return lookupValue(
    HIDDEN_STEMS,
    branch,
    "HIDDEN_STEMS_NOT_DEFINED",
    "branch"
  );
}
function getStemRule(stem) {
  const yinYang = getStemYinYang(stem);
  if (!yinYang.ok) return yinYang;
  const element = getStemElement(stem);
  if (!element.ok) return element;
  return { ok: true, value: { stem, yinYang: yinYang.value, element: element.value } };
}
function getBranchRule(branch) {
  const yinYang = getBranchYinYang(branch);
  if (!yinYang.ok) return yinYang;
  const element = getBranchElement(branch);
  if (!element.ok) return element;
  const hiddenStems = getHiddenStems(branch);
  if (!hiddenStems.ok) return hiddenStems;
  return {
    ok: true,
    value: {
      branch,
      yinYang: yinYang.value,
      element: element.value,
      hiddenStems: hiddenStems.value
    }
  };
}
function calculateTenGod(dayMaster, target) {
  const dayMasterRule = getStemRule(dayMaster);
  if (!dayMasterRule.ok) return dayMasterRule;
  const targetRule = getStemRule(target);
  if (!targetRule.ok) return targetRule;
  const samePolarity = dayMasterRule.value.yinYang === targetRule.value.yinYang;
  const dayElement = dayMasterRule.value.element;
  const targetElement = targetRule.value.element;
  if (dayElement === targetElement) {
    return { ok: true, value: samePolarity ? "PEER" : "ROB_WEALTH" };
  }
  if (ELEMENT_GENERATES[dayElement] === targetElement) {
    return {
      ok: true,
      value: samePolarity ? "EATING_GOD" : "HURTING_OFFICER"
    };
  }
  if (ELEMENT_CONTROLS[dayElement] === targetElement) {
    return {
      ok: true,
      value: samePolarity ? "INDIRECT_WEALTH" : "DIRECT_WEALTH"
    };
  }
  if (ELEMENT_CONTROLS[targetElement] === dayElement) {
    return {
      ok: true,
      value: samePolarity ? "SEVEN_KILLINGS" : "DIRECT_OFFICER"
    };
  }
  if (ELEMENT_GENERATES[targetElement] === dayElement) {
    return {
      ok: true,
      value: samePolarity ? "INDIRECT_RESOURCE" : "DIRECT_RESOURCE"
    };
  }
  return failure2({
    code: "ELEMENT_RELATION_NOT_DEFINED",
    field: "dayMaster,target",
    receivedValue: `${dayMaster},${target}`
  });
}

// src/features/interpretation/saju/derived/calculateDerivedFacts.ts
function failure3(error2) {
  return { ok: false, error: error2 };
}
function validatePillar(pillar, field) {
  const canonicalIndex = pillarToSexagenaryIndex(pillar.stem, pillar.branch);
  if (!canonicalIndex.ok) {
    return failure3({
      code: "INVALID_SEXAGENARY_PILLAR",
      field,
      receivedValue: { stem: pillar.stem, branch: pillar.branch }
    });
  }
  if (canonicalIndex.value !== pillar.index) {
    return failure3({
      code: "INVALID_PILLAR_IDENTITY",
      field: `${field}.index`,
      receivedValue: pillar.index
    });
  }
  return { ok: true, value: true };
}
function annotateStem(dayMaster, target) {
  const rule = getStemRule(target);
  if (!rule.ok) return rule;
  const tenGod = calculateTenGod(dayMaster, target);
  if (!tenGod.ok) return tenGod;
  return {
    ok: true,
    value: {
      yinYang: rule.value.yinYang,
      element: rule.value.element,
      tenGod: tenGod.value
    }
  };
}
function annotateBranch(dayMaster, pillar) {
  const rule = getBranchRule(pillar.branch);
  if (!rule.ok) return rule;
  const hiddenStems = [];
  for (const definition of rule.value.hiddenStems) {
    const annotation = annotateStem(dayMaster, definition.stem);
    if (!annotation.ok) return annotation;
    hiddenStems.push({ ...definition, ...annotation.value });
  }
  return {
    ok: true,
    value: {
      yinYang: rule.value.yinYang,
      element: rule.value.element,
      hiddenStems
    }
  };
}
function annotatePillar(position, pillar, dayMaster) {
  const validity = validatePillar(pillar, position.toLowerCase());
  if (!validity.ok) return validity;
  const stem = annotateStem(dayMaster, pillar.stem);
  if (!stem.ok) return stem;
  const branch = annotateBranch(dayMaster, pillar);
  if (!branch.ok) return branch;
  return { ok: true, value: { position, stem: stem.value, branch: branch.value } };
}
function calculateSajuDerivedFacts(input) {
  const source = input.fourPillars;
  const dayMaster = source.day.stem;
  const year = annotatePillar("YEAR", source.year, dayMaster);
  if (!year.ok) return year;
  const month = annotatePillar("MONTH", source.month, dayMaster);
  if (!month.ok) return month;
  const day = annotatePillar("DAY", source.day, dayMaster);
  if (!day.ok) return day;
  const pillars = {
    year: year.value,
    month: month.value,
    day: day.value
  };
  if (source.hour.status === "AVAILABLE") {
    const hour = annotatePillar("HOUR", source.hour.pillar, dayMaster);
    if (!hour.ok) return hour;
    pillars.hour = hour.value;
  }
  return {
    ok: true,
    value: {
      ruleVersions: DEOKBUNAI_SAJU_DERIVED_FACTS_V1_RULE_VERSIONS,
      pillars
    }
  };
}

// src/features/interpretation/saju/distribution/contracts.ts
var DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION = "deokbunai.saju-five-element-distribution.v1";
var SAJU_FIVE_ELEMENT_KEYS = [
  "WOOD",
  "FIRE",
  "EARTH",
  "METAL",
  "WATER"
];

// src/features/interpretation/saju/distribution/calculateFiveElementDistribution.ts
var HOUR_SLOTS = ["HOUR_STEM", "HOUR_BRANCH"];
function failure4(error2) {
  return { ok: false, error: error2 };
}
function isFiveElement(value) {
  return SAJU_FIVE_ELEMENT_KEYS.some((element) => element === value);
}
function validateSourceRuleVersions(derivedFacts) {
  if (derivedFacts.ruleVersions.derivedFacts !== DEOKBUNAI_SAJU_DERIVED_FACTS_VERSION) {
    return failure4({
      code: "INVALID_SOURCE_RULE_VERSION",
      field: "derivedFacts.ruleVersions.derivedFacts",
      receivedValue: derivedFacts.ruleVersions.derivedFacts
    });
  }
  if (derivedFacts.ruleVersions.fiveElements !== DEOKBUNAI_SAJU_FIVE_ELEMENTS_VERSION) {
    return failure4({
      code: "INVALID_SOURCE_RULE_VERSION",
      field: "derivedFacts.ruleVersions.fiveElements",
      receivedValue: derivedFacts.ruleVersions.fiveElements
    });
  }
  return null;
}
function createZeroCounts() {
  return { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 };
}
function appendSlot(slots, counts, slot, element) {
  if (!isFiveElement(element)) {
    return {
      code: "INVALID_FIVE_ELEMENT",
      field: `derivedFacts.direct.${slot}`,
      receivedValue: element
    };
  }
  slots.push({ slot, element });
  counts[element] += 1;
  return null;
}
function calculateFiveElementDistribution(input) {
  const versionError = validateSourceRuleVersions(input.derivedFacts);
  if (versionError) return versionError;
  const pillars = input.derivedFacts.pillars;
  const slots = [];
  const counts = createZeroCounts();
  const directSources = [
    ["YEAR_STEM", pillars.year.stem.element],
    ["YEAR_BRANCH", pillars.year.branch.element],
    ["MONTH_STEM", pillars.month.stem.element],
    ["MONTH_BRANCH", pillars.month.branch.element],
    ["DAY_STEM", pillars.day.stem.element],
    ["DAY_BRANCH", pillars.day.branch.element],
    ...pillars.hour ? [
      ["HOUR_STEM", pillars.hour.stem.element],
      ["HOUR_BRANCH", pillars.hour.branch.element]
    ] : []
  ];
  for (const [slot, element] of directSources) {
    const error2 = appendSlot(slots, counts, slot, element);
    if (error2) return failure4(error2);
  }
  const hasHour = pillars.hour !== void 0;
  const distribution = {
    ruleVersion: DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION_VERSION,
    sourceRuleVersions: {
      derivedFacts: input.derivedFacts.ruleVersions.derivedFacts,
      fiveElements: input.derivedFacts.ruleVersions.fiveElements
    },
    direct: {
      slots,
      counts,
      observedSlots: hasHour ? 8 : 6,
      expectedSlots: 8,
      completeness: hasHour ? "COMPLETE" : "PARTIAL",
      missingSlots: hasHour ? [] : HOUR_SLOTS
    }
  };
  return { ok: true, value: distribution };
}

// src/features/interpretation/saju/engineAdapter.ts
var DEOKBUNAI_SAJU_ENGINE_VERSION = "deokbunai.saju-engine.v1";
var DEOKBUNAI_SAJU_RULE_SET_VERSION = "deokbunai.saju-rules.v1";
var NORMALIZATION_WARNING_SEVERITY = "INFO";
var SAJU_HOUR_WARNING_SEVERITY = {
  BIRTH_TIME_UNKNOWN: "INFO",
  BIRTH_TIME_APPROXIMATE_AMBIGUOUS: "CAUTION",
  EXACT_LOCAL_TIME_INCOMPLETE: "CAUTION",
  INVALID_LOCAL_TIME: "CAUTION",
  LOCAL_TIME_AMBIGUOUS: "CAUTION",
  LOCAL_TIME_NONEXISTENT: "CAUTION",
  HISTORICAL_TIME_UNRESOLVED: "CAUTION",
  HISTORICAL_SOURCE_CONFLICT: "CAUTION"
};
var FACT_IDS = {
  YEAR_PILLAR: "SAJU.FACT.YEAR_PILLAR",
  MONTH_PILLAR: "SAJU.FACT.MONTH_PILLAR",
  DAY_PILLAR: "SAJU.FACT.DAY_PILLAR",
  HOUR_PILLAR: "SAJU.FACT.HOUR_PILLAR"
};
var EVIDENCE_IDS = {
  input: "SAJU.EVIDENCE.NORMALIZED_BIRTH",
  calendar: "SAJU.EVIDENCE.CALENDAR",
  productRule: "SAJU.EVIDENCE.PRODUCT_RULE",
  yearMonthAttribution: "SAJU.EVIDENCE.YEAR_MONTH_ATTRIBUTION",
  dayRule: "SAJU.EVIDENCE.DAY_RULE",
  hourRule: "SAJU.EVIDENCE.HOUR_RULE",
  year: "SAJU.EVIDENCE.YEAR_PILLAR",
  month: "SAJU.EVIDENCE.MONTH_PILLAR",
  day: "SAJU.EVIDENCE.DAY_PILLAR",
  hour: "SAJU.EVIDENCE.HOUR_PILLAR",
  derivedFacts: "SAJU.EVIDENCE.DERIVED_FACTS_RULES",
  fiveElementDistribution: "SAJU.EVIDENCE.FIVE_ELEMENT_DISTRIBUTION_RULES"
};
function createDescriptor(input) {
  const calendar = input.normalizedBirth.calendar;
  return {
    id: "SAJU",
    engineVersion: DEOKBUNAI_SAJU_ENGINE_VERSION,
    ruleSetVersion: DEOKBUNAI_SAJU_RULE_SET_VERSION,
    ...calendar.status === "RESOLVED" ? { dataVersion: calendar.calendarDatasetVersion } : {}
  };
}
function mapNormalizationWarnings(input) {
  return input.normalizedBirth.warnings.map((warning2) => ({
    code: `NORMALIZATION.${warning2.code}`,
    severity: NORMALIZATION_WARNING_SEVERITY,
    scope: `NORMALIZATION.${warning2.stage}`,
    messageKey: warning2.messageKey,
    ...warning2.path ? { relatedInputPaths: [warning2.path] } : {},
    source: "NORMALIZATION",
    normalizationWarning: warning2
  }));
}
function mapHourMissingData(reason) {
  const birthTimeReasons = /* @__PURE__ */ new Set([
    "BIRTH_TIME_UNKNOWN",
    "BIRTH_TIME_APPROXIMATE_AMBIGUOUS",
    "EXACT_LOCAL_TIME_INCOMPLETE",
    "INVALID_LOCAL_TIME"
  ]);
  const missingReason = reason === "BIRTH_TIME_UNKNOWN" ? "NOT_PROVIDED" : reason === "BIRTH_TIME_APPROXIMATE_AMBIGUOUS" || reason === "EXACT_LOCAL_TIME_INCOMPLETE" || reason === "INVALID_LOCAL_TIME" ? "INSUFFICIENT_ACCURACY" : "UNRESOLVED";
  return {
    field: birthTimeReasons.has(reason) ? "normalizedBirth.civilLocal" : "normalizedBirth.timezone",
    reason: missingReason,
    requiredFor: ["HOUR_PILLAR"]
  };
}
function mapHourWarning(reason) {
  return {
    code: `SAJU.HOUR.${reason}`,
    severity: SAJU_HOUR_WARNING_SEVERITY[reason],
    scope: "SAJU.HOUR_PILLAR",
    messageKey: `interpretation.saju.hour.${reason}`,
    relatedInputPaths: [mapHourMissingData(reason).field],
    affectedFactKeys: ["HOUR_PILLAR"],
    source: "HOUR_CAPABILITY",
    hourReason: reason
  };
}
function mapUnavailableReason(reason) {
  if (reason.code === "CALENDAR_UNRESOLVED") {
    switch (reason.calendarReason) {
      case "RESOLVER_NOT_PROVIDED":
      case "CALENDAR_DATA_UNAVAILABLE":
        return "MISSING_DATA";
      case "UNSUPPORTED_CALENDAR_RANGE":
        return "UNSUPPORTED_INPUT";
      case "INVALID_LUNAR_DATE":
      case "INVALID_LUNAR_MONTH_KIND":
      case "CALENDAR_CONVERSION_FAILED":
        return "VALIDATION_FAILED";
    }
  }
  return reason.code === "PRODUCT_RULE_VIOLATION" ? "UNSUPPORTED_INPUT" : "VALIDATION_FAILED";
}
function unavailableMissingData(reason) {
  if (reason.code !== "CALENDAR_UNRESOLVED") return [];
  return [
    {
      field: "normalizedBirth.calendar",
      reason: reason.calendarReason === "UNSUPPORTED_CALENDAR_RANGE" ? "UNSUPPORTED" : "UNRESOLVED",
      requiredFor: ["YEAR_PILLAR", "MONTH_PILLAR", "DAY_PILLAR"]
    }
  ];
}
function createFacts(output) {
  const facts = [
    {
      id: FACT_IDS.YEAR_PILLAR,
      key: "YEAR_PILLAR",
      value: output.fourPillars.year,
      scope: "SAJU.FOUR_PILLARS",
      confidence: "DETERMINISTIC",
      evidenceIds: [EVIDENCE_IDS.year]
    },
    {
      id: FACT_IDS.MONTH_PILLAR,
      key: "MONTH_PILLAR",
      value: output.fourPillars.month,
      scope: "SAJU.FOUR_PILLARS",
      confidence: "DETERMINISTIC",
      evidenceIds: [EVIDENCE_IDS.month]
    },
    {
      id: FACT_IDS.DAY_PILLAR,
      key: "DAY_PILLAR",
      value: output.fourPillars.day,
      scope: "SAJU.FOUR_PILLARS",
      confidence: "DETERMINISTIC",
      evidenceIds: [EVIDENCE_IDS.day]
    }
  ];
  if (output.fourPillars.hour.status === "AVAILABLE") {
    facts.push({
      id: FACT_IDS.HOUR_PILLAR,
      key: "HOUR_PILLAR",
      value: output.fourPillars.hour.pillar,
      scope: "SAJU.FOUR_PILLARS",
      confidence: "DETERMINISTIC",
      evidenceIds: [EVIDENCE_IDS.hour]
    });
  }
  return facts;
}
function createEvidence(output) {
  const factIds = {
    year: FACT_IDS.YEAR_PILLAR,
    month: FACT_IDS.MONTH_PILLAR,
    day: FACT_IDS.DAY_PILLAR,
    hour: output.fourPillars.hour.status === "AVAILABLE" ? FACT_IDS.HOUR_PILLAR : null
  };
  const evidence = [
    {
      id: EVIDENCE_IDS.input,
      kind: "INPUT",
      inputPaths: [
        "normalizedBirthFingerprint",
        "normalizedBirth.calendar",
        "normalizedBirth.civilLocal",
        "normalizedBirth.timezone"
      ]
    },
    {
      id: EVIDENCE_IDS.calendar,
      kind: "LOOKUP",
      ruleId: output.provenance.calendarDatasetVersion,
      ruleVersion: output.provenance.calendarConversionRuleVersion,
      factIds: [factIds.year, factIds.month, factIds.day],
      parentEvidenceIds: [EVIDENCE_IDS.input]
    },
    {
      id: EVIDENCE_IDS.productRule,
      kind: "RULE",
      ruleId: output.provenance.productRule.ruleId,
      ruleVersion: output.provenance.productRule.ruleVersion,
      factIds: [factIds.year, factIds.month]
    },
    {
      // year/month pillars are attributed by 立春 / the twelve 節 — the authoritative boundary rule.
      id: EVIDENCE_IDS.yearMonthAttribution,
      kind: "RULE",
      ruleId: output.provenance.yearMonthAttributionRule.ruleId,
      ruleVersion: output.provenance.yearMonthAttributionRule.ruleVersion,
      factIds: [factIds.year, factIds.month]
    },
    {
      id: EVIDENCE_IDS.dayRule,
      kind: "RULE",
      ruleId: output.provenance.dayRule.ruleId,
      ruleVersion: output.provenance.dayRule.ruleVersion,
      factIds: [factIds.day]
    },
    {
      id: EVIDENCE_IDS.hourRule,
      kind: "RULE",
      ruleId: output.provenance.hourRule.ruleId,
      ruleVersion: output.provenance.hourRule.ruleVersion,
      ...factIds.hour ? { factIds: [factIds.hour] } : {}
    },
    {
      id: EVIDENCE_IDS.year,
      kind: "DERIVATION",
      factIds: [factIds.year],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.calendar,
        EVIDENCE_IDS.productRule,
        EVIDENCE_IDS.yearMonthAttribution
      ]
    },
    {
      id: EVIDENCE_IDS.month,
      kind: "DERIVATION",
      factIds: [factIds.month],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.calendar,
        EVIDENCE_IDS.productRule,
        EVIDENCE_IDS.yearMonthAttribution
      ]
    },
    {
      id: EVIDENCE_IDS.day,
      kind: "DERIVATION",
      factIds: [factIds.day],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.calendar,
        EVIDENCE_IDS.dayRule
      ]
    }
  ];
  if (factIds.hour) {
    evidence.push({
      id: EVIDENCE_IDS.hour,
      kind: "DERIVATION",
      factIds: [factIds.hour],
      parentEvidenceIds: [
        EVIDENCE_IDS.input,
        EVIDENCE_IDS.day,
        EVIDENCE_IDS.hourRule
      ]
    });
  }
  evidence.push({
    id: EVIDENCE_IDS.derivedFacts,
    kind: "RULE",
    ruleId: "DEOKBUNAI_SAJU_DERIVED_FACTS",
    ruleVersion: output.derivedFacts.ruleVersions.derivedFacts,
    parentEvidenceIds: [
      EVIDENCE_IDS.year,
      EVIDENCE_IDS.month,
      EVIDENCE_IDS.day,
      ...factIds.hour ? [EVIDENCE_IDS.hour] : []
    ]
  });
  evidence.push({
    id: EVIDENCE_IDS.fiveElementDistribution,
    kind: "RULE",
    ruleId: "DEOKBUNAI_SAJU_FIVE_ELEMENT_DISTRIBUTION",
    ruleVersion: output.fiveElementDistribution.ruleVersion,
    parentEvidenceIds: [EVIDENCE_IDS.derivedFacts]
  });
  return evidence;
}
var PRODUCTION_CALCULATORS = {
  calculateFourPillars,
  calculateDerivedFacts: calculateSajuDerivedFacts,
  calculateFiveElementDistribution
};
function executeSajuWithCalculatorsForValidation(input, calculators) {
  const engine = createDescriptor(input);
  const normalizationWarnings = mapNormalizationWarnings(input);
  const aggregate = calculators.calculateFourPillars({
    normalizedBirthFingerprint: input.normalizedBirthFingerprint.value,
    normalized: {
      calendar: input.normalizedBirth.calendar,
      civilLocal: input.normalizedBirth.civilLocal,
      timezone: input.normalizedBirth.timezone,
      trueSolarTime: input.normalizedBirth.trueSolarTime
    },
    ruleProfile: DEOKBUNAI_SAJU_V1_RULE_PROFILE,
    engineRuleSetVersion: DEOKBUNAI_SAJU_RULE_SET_VERSION
  });
  if (aggregate.status === "UNAVAILABLE") {
    return {
      status: "UNAVAILABLE",
      engine,
      inputFingerprint: input.normalizedBirthFingerprint.value,
      facts: [],
      signals: [],
      evidence: [],
      warnings: normalizationWarnings,
      missingData: unavailableMissingData(aggregate.reason),
      unavailableReason: mapUnavailableReason(aggregate.reason),
      failure: { aggregateReason: aggregate.reason }
    };
  }
  const derived = calculators.calculateDerivedFacts({
    fourPillars: aggregate.pillars
  });
  if (!derived.ok) {
    throw new Error(
      `Saju Derived Facts invariant failed: ${derived.error.code} at ${derived.error.field}.`
    );
  }
  const distribution = calculators.calculateFiveElementDistribution({
    derivedFacts: derived.value
  });
  if (!distribution.ok) {
    throw new Error(
      `Saju Five Element Distribution invariant failed: ${distribution.error.code} at ${distribution.error.field}.`
    );
  }
  const output = {
    fourPillars: aggregate.pillars,
    derivedFacts: derived.value,
    fiveElementDistribution: distribution.value,
    identity: aggregate.identity,
    provenance: {
      ...aggregate.provenance,
      derivedFactsRuleVersions: derived.value.ruleVersions,
      fiveElementDistributionRuleVersions: {
        distribution: distribution.value.ruleVersion,
        ...distribution.value.sourceRuleVersions
      }
    }
  };
  const hour = output.fourPillars.hour;
  const hourWarnings = hour.status === "AVAILABLE" ? [] : [mapHourWarning(hour.reason)];
  const missingData = hour.status === "AVAILABLE" ? [] : [mapHourMissingData(hour.reason)];
  return {
    status: aggregate.status === "COMPLETE" ? "SUCCESS" : "PARTIAL",
    engine,
    inputFingerprint: input.normalizedBirthFingerprint.value,
    facts: createFacts(output),
    signals: [],
    evidence: createEvidence(output),
    warnings: [...normalizationWarnings, ...hourWarnings],
    missingData,
    output
  };
}
function executeSaju(input) {
  return executeSajuWithCalculatorsForValidation(input, PRODUCTION_CALCULATORS);
}

// src/features/interpretation/saju/birthExecutionBridge.ts
function fingerprintError(code) {
  return {
    code,
    path: "normalizedBirthFingerprint",
    stage: "SERIALIZATION",
    messageKey: `interpretation.normalization.${code}`
  };
}
async function executeSajuFromBirthInput(input, dependencies) {
  const normalization = await normalizeBirthInput(input.birth, dependencies);
  if (!normalization.success) {
    return {
      success: false,
      failedStage: "NORMALIZATION",
      errors: normalization.errors,
      warnings: normalization.warnings
    };
  }
  let frame;
  try {
    const payload = createBirthFingerprintPayload(normalization.value);
    const serialized = serializeBirthFingerprintPayload(payload);
    frame = createBirthFingerprintFrame(serialized);
  } catch {
    return {
      success: false,
      failedStage: "FINGERPRINT",
      errors: [fingerprintError("CANONICAL_SERIALIZATION_FAILED")],
      warnings: normalization.warnings
    };
  }
  let normalizedBirthFingerprint;
  try {
    normalizedBirthFingerprint = await digestBirthFingerprintFrame(
      frame,
      dependencies.digestProvider
    );
  } catch {
    return {
      success: false,
      failedStage: "FINGERPRINT",
      errors: [fingerprintError("FINGERPRINT_DIGEST_FAILED")],
      warnings: normalization.warnings
    };
  }
  if (normalizedBirthFingerprint.value.trim().length === 0) {
    return {
      success: false,
      failedStage: "FINGERPRINT",
      errors: [fingerprintError("FINGERPRINT_DIGEST_FAILED")],
      warnings: normalization.warnings
    };
  }
  return {
    success: true,
    normalizedBirth: normalization.value,
    normalizedBirthFingerprint,
    engineResult: executeSaju({
      engine: "SAJU",
      normalizedBirth: normalization.value,
      normalizedBirthFingerprint
    }),
    warnings: normalization.warnings
  };
}

// src/features/interpretation/saju/fixtures/fiveElementDistributionGoldenFixtures.ts
var SIX_DIRECT_SLOTS = [
  { slot: "YEAR_STEM", element: "EARTH" },
  { slot: "YEAR_BRANCH", element: "WOOD" },
  { slot: "MONTH_STEM", element: "FIRE" },
  { slot: "MONTH_BRANCH", element: "EARTH" },
  { slot: "DAY_STEM", element: "WOOD" },
  { slot: "DAY_BRANCH", element: "WATER" }
];
var FIVE_ELEMENT_DISTRIBUTION_GOLDEN_FIXTURES = [
  {
    id: "EXACT_STANDARD",
    expected: {
      slots: [
        ...SIX_DIRECT_SLOTS,
        { slot: "HOUR_STEM", element: "WOOD" },
        { slot: "HOUR_BRANCH", element: "EARTH" }
      ],
      counts: { WOOD: 3, FIRE: 1, EARTH: 3, METAL: 0, WATER: 1 },
      observedSlots: 8,
      completeness: "COMPLETE",
      missingSlots: []
    }
  },
  {
    id: "UNKNOWN_TIME",
    expected: {
      slots: SIX_DIRECT_SLOTS,
      counts: { WOOD: 2, FIRE: 1, EARTH: 2, METAL: 0, WATER: 1 },
      observedSlots: 6,
      completeness: "PARTIAL",
      missingSlots: ["HOUR_STEM", "HOUR_BRANCH"]
    }
  }
];

// src/features/interpretation/saju/presentationLabels.ts
var HEAVENLY_STEM_LABELS = {
  JIA: { hanja: "甲", hangul: "갑" },
  YI: { hanja: "乙", hangul: "을" },
  BING: { hanja: "丙", hangul: "병" },
  DING: { hanja: "丁", hangul: "정" },
  WU: { hanja: "戊", hangul: "무" },
  JI: { hanja: "己", hangul: "기" },
  GENG: { hanja: "庚", hangul: "경" },
  XIN: { hanja: "辛", hangul: "신" },
  REN: { hanja: "壬", hangul: "임" },
  GUI: { hanja: "癸", hangul: "계" }
};
var EARTHLY_BRANCH_LABELS = {
  ZI: { hanja: "子", hangul: "자" },
  CHOU: { hanja: "丑", hangul: "축" },
  YIN: { hanja: "寅", hangul: "인" },
  MAO: { hanja: "卯", hangul: "묘" },
  CHEN: { hanja: "辰", hangul: "진" },
  SI: { hanja: "巳", hangul: "사" },
  WU: { hanja: "午", hangul: "오" },
  WEI: { hanja: "未", hangul: "미" },
  SHEN: { hanja: "申", hangul: "신" },
  YOU: { hanja: "酉", hangul: "유" },
  XU: { hanja: "戌", hangul: "술" },
  HAI: { hanja: "亥", hangul: "해" }
};
var TEN_GOD_LABELS = {
  PEER: { hangul: "비견" },
  ROB_WEALTH: { hangul: "겁재" },
  EATING_GOD: { hangul: "식신" },
  HURTING_OFFICER: { hangul: "상관" },
  INDIRECT_WEALTH: { hangul: "편재" },
  DIRECT_WEALTH: { hangul: "정재" },
  SEVEN_KILLINGS: { hangul: "편관" },
  DIRECT_OFFICER: { hangul: "정관" },
  INDIRECT_RESOURCE: { hangul: "편인" },
  DIRECT_RESOURCE: { hangul: "정인" }
};
var HIDDEN_STEM_ROLE_LABELS = {
  MAIN: { hangul: "정기" },
  MIDDLE: { hangul: "중기" },
  RESIDUAL: { hangul: "여기" }
};
var YIN_YANG_LABELS = {
  YANG: { hangul: "양" },
  YIN: { hangul: "음" }
};
var FIVE_ELEMENT_LABELS = {
  WOOD: { hangul: "목" },
  FIRE: { hangul: "화" },
  EARTH: { hangul: "토" },
  METAL: { hangul: "금" },
  WATER: { hangul: "수" }
};

// src/features/interpretation/timezone/data/asiaSeoulTzdb2026c.ts
var ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256 = "f1e0e984cf35814e0f0ab9b1f0d4d39d9e037a61751135ba1deae0b060e56842";
var ASIA_SEOUL_TZDB_2026C_ARTIFACT = {
  manifest: {
    schemaVersion: "deokbunai.historical-timezone-artifact.v1",
    artifactVersion: "iana.tzdb.2026c.asia-seoul.1970-2050.v1",
    tzdbVersion: "2026c",
    zoneId: "Asia/Seoul",
    supportedRange: {
      start: { year: 1970, month: 1, day: 1 },
      end: { year: 2050, month: 12, day: 31 }
    },
    source: {
      identity: "IANA_TIME_ZONE_DATABASE",
      revision: "tzdb-2026c",
      url: "https://data.iana.org/time-zones/releases/tzdata2026c.tar.gz"
    },
    acquisitionBuildDate: "2026-08-09",
    artifactChecksum: {
      algorithm: "SHA-256",
      value: ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256
    },
    resolverRuleVersion: "deokbunai.historical-timezone-resolver.v1",
    initialState: {
      totalOffsetSeconds: 32400,
      dstOffsetSeconds: 0,
      designation: "KST"
    },
    officialCrossChecks: [
      {
        id: "ROK_DST_1987_START",
        transitionUtcEpochSeconds: 547578e3,
        legalLocalDateTime: "1987-05-10T02:00:00",
        sourceAuthority: "대한민국 국가법령정보센터",
        sourceDocumentId: "대통령령 제12136호",
        sourceUrl: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990",
        comparison: "MATCH"
      },
      {
        id: "ROK_DST_1987_END",
        transitionUtcEpochSeconds: 560883600,
        legalLocalDateTime: "1987-10-11T03:00:00",
        sourceAuthority: "대한민국 국가법령정보센터",
        sourceDocumentId: "대통령령 제12136호",
        sourceUrl: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990",
        comparison: "MATCH"
      },
      {
        id: "ROK_DST_1988_START",
        transitionUtcEpochSeconds: 579027600,
        legalLocalDateTime: "1988-05-08T02:00:00",
        sourceAuthority: "대한민국 국가법령정보센터",
        sourceDocumentId: "대통령령 제12136호",
        sourceUrl: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990",
        comparison: "MATCH"
      },
      {
        id: "ROK_DST_1988_END",
        transitionUtcEpochSeconds: 592333200,
        legalLocalDateTime: "1988-10-09T03:00:00",
        sourceAuthority: "대한민국 국가법령정보센터",
        sourceDocumentId: "대통령령 제12136호",
        sourceUrl: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990",
        comparison: "MATCH"
      }
    ]
  },
  transitions: [
    {
      utcEpochSeconds: 547578e3,
      before: { totalOffsetSeconds: 32400, dstOffsetSeconds: 0, designation: "KST" },
      after: { totalOffsetSeconds: 36e3, dstOffsetSeconds: 3600, designation: "KDT" }
    },
    {
      utcEpochSeconds: 560883600,
      before: { totalOffsetSeconds: 36e3, dstOffsetSeconds: 3600, designation: "KDT" },
      after: { totalOffsetSeconds: 32400, dstOffsetSeconds: 0, designation: "KST" }
    },
    {
      utcEpochSeconds: 579027600,
      before: { totalOffsetSeconds: 32400, dstOffsetSeconds: 0, designation: "KST" },
      after: { totalOffsetSeconds: 36e3, dstOffsetSeconds: 3600, designation: "KDT" }
    },
    {
      utcEpochSeconds: 592333200,
      before: { totalOffsetSeconds: 36e3, dstOffsetSeconds: 3600, designation: "KDT" },
      after: { totalOffsetSeconds: 32400, dstOffsetSeconds: 0, designation: "KST" }
    }
  ]
};

// src/features/interpretation/timezone/historicalTimezoneResolver.ts
var ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_ID = "deokbunai.historical-timezone-resolver.asia-seoul";
var ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_VERSION = "deokbunai.historical-timezone-resolver.v1";
var SECONDS_PER_DAY4 = 86400;
var UNIX_EPOCH_ORDINAL = gregorianToCivilDayOrdinal({
  year: 1970,
  month: 1,
  day: 1
});
function resolutionProvenance(artifact) {
  return {
    resolverId: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_ID,
    resolverVersion: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER_VERSION,
    dataVersion: artifact.manifest.artifactVersion,
    ruleSetVersion: artifact.manifest.resolverRuleVersion,
    source: "ENGINE"
  };
}
function historicalProvenance(artifact, authorityStatus, comparison, unresolvedReason) {
  const officialSources = [
    {
      authority: "대한민국 국가법령정보센터",
      documentId: "법률 제676호",
      sourceUrl: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=54666",
      publicationDate: "1961-08-07",
      effectiveLocalTime: "1961-08-10T00:00:00"
    },
    {
      authority: "대한민국 국가법령정보센터",
      documentId: "대통령령 제12136호",
      sourceUrl: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23990",
      publicationDate: "1987-04-07"
    },
    {
      authority: "대한민국 국가법령정보센터",
      documentId: "대통령령 제12703호",
      sourceUrl: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=23991",
      publicationDate: "1989-05-08"
    }
  ];
  return {
    authorityStatus,
    tzdbVersion: artifact.manifest.tzdbVersion,
    tzdbZone: artifact.manifest.zoneId,
    officialSources,
    ruleSetVersion: artifact.manifest.resolverRuleVersion,
    comparison,
    jurisdiction: "KR",
    applicableRegion: "Republic of Korea / Asia/Seoul",
    sourceIdentity: artifact.manifest.source.identity,
    sourceRevision: artifact.manifest.source.revision,
    supportedRange: {
      startLocalDate: "1970-01-01",
      endLocalDate: "2050-12-31"
    },
    ...unresolvedReason ? { unresolvedReason } : {}
  };
}
function unresolved(artifact, ianaZone, reason) {
  const conflict = reason === "HISTORICAL_SOURCE_CONFLICT";
  const unresolvedReason = reason === "UNSUPPORTED_ZONE" ? "UNSUPPORTED_ZONE" : reason === "OUTSIDE_SUPPORTED_RANGE" ? "OUTSIDE_SUPPORTED_RANGE" : conflict ? "SOURCE_CONFLICT_REQUIRES_RULE" : "TIME_UNRESOLVED";
  return {
    status: "UNRESOLVED",
    ianaZone,
    reason,
    timezoneDataVersion: artifact.manifest.artifactVersion,
    historicalProvenance: historicalProvenance(
      artifact,
      conflict ? "SOURCE_CONFLICT" : "UNRESOLVED",
      conflict ? "CONFLICT" : "NOT_VERIFIED",
      unresolvedReason
    ),
    provenance: resolutionProvenance(artifact)
  };
}
function localEpochSeconds(value) {
  const day = gregorianToCivilDayOrdinal(value.date) - UNIX_EPOCH_ORDINAL;
  return day * SECONDS_PER_DAY4 + value.time.hour * 3600 + value.time.minute * 60 + (value.time.second ?? 0);
}
function epochSecondsToCivilLocal(value) {
  const day = Math.floor(value / SECONDS_PER_DAY4);
  const secondOfDay = value - day * SECONDS_PER_DAY4;
  return {
    date: civilDayOrdinalToGregorian(UNIX_EPOCH_ORDINAL + day),
    time: {
      hour: Math.floor(secondOfDay / 3600),
      minute: Math.floor(secondOfDay % 3600 / 60),
      second: secondOfDay % 60
    }
  };
}
function candidate(localSeconds, state) {
  return {
    utcEpochSeconds: localSeconds - state.totalOffsetSeconds,
    totalOffsetSeconds: state.totalOffsetSeconds,
    dstOffsetSeconds: state.dstOffsetSeconds,
    isDst: state.dstOffsetSeconds !== 0,
    designation: state.designation
  };
}
function candidatesForLocal(artifact, localSeconds) {
  const values = [];
  let state = artifact.manifest.initialState;
  let utcStart = Number.NEGATIVE_INFINITY;
  for (const transition of artifact.transitions) {
    const value2 = candidate(localSeconds, state);
    if (value2.utcEpochSeconds >= utcStart && value2.utcEpochSeconds < transition.utcEpochSeconds) {
      values.push(value2);
    }
    state = transition.after;
    utcStart = transition.utcEpochSeconds;
  }
  const value = candidate(localSeconds, state);
  if (value.utcEpochSeconds >= utcStart) values.push(value);
  return values.sort((left, right) => left.utcEpochSeconds - right.utcEpochSeconds);
}
function findGap(artifact, localSeconds) {
  return artifact.transitions.find((transition) => {
    const before = transition.utcEpochSeconds + transition.before.totalOffsetSeconds;
    const after = transition.utcEpochSeconds + transition.after.totalOffsetSeconds;
    return after > before && localSeconds >= before && localSeconds < after;
  });
}
function officialCrossChecksMatch(artifact) {
  if (artifact.manifest.officialCrossChecks.length !== 4) return false;
  return artifact.manifest.officialCrossChecks.every((fixture) => {
    const transition = artifact.transitions.find(
      (item) => item.utcEpochSeconds === fixture.transitionUtcEpochSeconds
    );
    if (!transition || fixture.comparison !== "MATCH") return false;
    const isStart = fixture.id.endsWith("_START");
    const offsetDelta = transition.after.totalOffsetSeconds - transition.before.totalOffsetSeconds;
    const dstDelta = transition.after.dstOffsetSeconds - transition.before.dstOffsetSeconds;
    if (isStart && (offsetDelta !== 3600 || dstDelta !== 3600) || !isStart && (offsetDelta !== -3600 || dstDelta !== -3600)) return false;
    const legalLocal = transition.utcEpochSeconds + transition.before.totalOffsetSeconds;
    const parsed = fixture.legalLocalDateTime.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/
    );
    if (!parsed) return false;
    return localEpochSeconds({
      date: { year: Number(parsed[1]), month: Number(parsed[2]), day: Number(parsed[3]) },
      time: { hour: Number(parsed[4]), minute: Number(parsed[5]), second: Number(parsed[6]) }
    }) === legalLocal;
  });
}
function artifactStructureIsValid(artifact) {
  if (artifact.manifest.schemaVersion !== "deokbunai.historical-timezone-artifact.v1" || artifact.manifest.artifactVersion !== "iana.tzdb.2026c.asia-seoul.1970-2050.v1" || artifact.manifest.tzdbVersion !== "2026c" || artifact.manifest.zoneId !== "Asia/Seoul" || artifact.manifest.artifactChecksum.algorithm !== "SHA-256" || artifact.manifest.artifactChecksum.value !== ASIA_SEOUL_TZDB_2026C_ARTIFACT_SHA256 || artifact.transitions.length !== 4) return false;
  let previous = artifact.manifest.initialState;
  let previousEpoch = Number.NEGATIVE_INFINITY;
  for (const transition of artifact.transitions) {
    if (transition.utcEpochSeconds <= previousEpoch || transition.before.totalOffsetSeconds !== previous.totalOffsetSeconds || transition.before.dstOffsetSeconds !== previous.dstOffsetSeconds || transition.before.designation !== previous.designation) return false;
    previous = transition.after;
    previousEpoch = transition.utcEpochSeconds;
  }
  return true;
}
function createAsiaSeoulHistoricalTimezoneResolver(artifact = ASIA_SEOUL_TZDB_2026C_ARTIFACT) {
  return {
    async resolve(request) {
      if (request.ianaZone !== artifact.manifest.zoneId) {
        return unresolved(artifact, request.ianaZone, "UNSUPPORTED_ZONE");
      }
      if (request.civilLocal.accuracy !== "EXACT" || compareGregorianDates(
        request.civilLocal.date,
        artifact.manifest.supportedRange.start
      ) < 0 || compareGregorianDates(
        request.civilLocal.date,
        artifact.manifest.supportedRange.end
      ) > 0) {
        return unresolved(artifact, request.ianaZone, "OUTSIDE_SUPPORTED_RANGE");
      }
      if (!artifactStructureIsValid(artifact)) {
        return unresolved(
          artifact,
          request.ianaZone,
          "HISTORICAL_DATA_UNAVAILABLE"
        );
      }
      if (!officialCrossChecksMatch(artifact)) {
        return unresolved(
          artifact,
          request.ianaZone,
          "HISTORICAL_SOURCE_CONFLICT"
        );
      }
      const local = {
        date: request.civilLocal.date,
        time: request.civilLocal.time
      };
      const localSeconds = localEpochSeconds(local);
      const candidates = candidatesForLocal(artifact, localSeconds);
      const shared = {
        status: "RESOLVED",
        ianaZone: artifact.manifest.zoneId,
        timezoneDataVersion: artifact.manifest.artifactVersion,
        resolutionSource: "ENGINE",
        historicalProvenance: historicalProvenance(
          artifact,
          "OFFICIAL_SOURCE_VERIFIED",
          "MATCH"
        ),
        provenance: resolutionProvenance(artifact)
      };
      if (candidates.length === 1) {
        const resolved = candidates[0];
        const dstProvenance = resolutionProvenance(artifact);
        return {
          ...shared,
          resolvedOffsetSeconds: resolved.totalOffsetSeconds,
          resolvedOffsetMinutes: resolved.totalOffsetSeconds / 60,
          dst: resolved.dstOffsetSeconds === 0 ? {
            status: "NOT_OBSERVED",
            dstOffsetSeconds: 0,
            provenance: dstProvenance
          } : {
            status: "OBSERVED",
            dstOffsetSeconds: resolved.dstOffsetSeconds,
            offsetMinutes: resolved.dstOffsetSeconds / 60,
            provenance: dstProvenance
          },
          localTimeResolution: { kind: "UNIQUE", candidate: resolved }
        };
      }
      if (candidates.length >= 2) {
        return {
          ...shared,
          localTimeResolution: {
            kind: "AMBIGUOUS",
            candidates
          }
        };
      }
      const gap = findGap(artifact, localSeconds);
      if (!gap) {
        return unresolved(artifact, request.ianaZone, "HISTORICAL_DATA_UNAVAILABLE");
      }
      return {
        ...shared,
        localTimeResolution: {
          kind: "NONEXISTENT",
          gap: {
            startLocalDateTime: epochSecondsToCivilLocal(
              gap.utcEpochSeconds + gap.before.totalOffsetSeconds
            ),
            endLocalDateTime: epochSecondsToCivilLocal(
              gap.utcEpochSeconds + gap.after.totalOffsetSeconds
            ),
            transitionUtcEpochSeconds: gap.utcEpochSeconds,
            offsetBeforeSeconds: gap.before.totalOffsetSeconds,
            offsetAfterSeconds: gap.after.totalOffsetSeconds,
            dstOffsetBeforeSeconds: gap.before.dstOffsetSeconds,
            dstOffsetAfterSeconds: gap.after.dstOffsetSeconds,
            designationBefore: gap.before.designation,
            designationAfter: gap.after.designation
          }
        }
      };
    }
  };
}
var ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER = createAsiaSeoulHistoricalTimezoneResolver();

// src/features/interpretation/solarTerm/lunarJsSolarTermAdapterValidation.ts
var UNIX_EPOCH_DAY4 = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

// src/features/interpretation/solarTerm/lunarJsSolarTermV1Validation.ts
var UNIX_EPOCH_DAY5 = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

// src/features/interpretation/saju/daewoon/validation.ts
var UNIX_EPOCH_DAY6 = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });

// src/features/manse/services/birthInputMapper.ts
var V1_SUPPORTED_ZONE_ID = "Asia/Seoul";
var GENDER_MAP = {
  male: "MALE",
  female: "FEMALE"
};
var APPROXIMATE_PERIOD_MAP = {
  dawn: "DAWN",
  morning: "MORNING",
  afternoon: "AFTERNOON",
  evening: "EVENING",
  night: "NIGHT"
};
function toBirthCalendarDate(birthInfo) {
  const year = Number(birthInfo.birthYear);
  const month = Number(birthInfo.birthMonth);
  const day = Number(birthInfo.birthDay);
  if (birthInfo.calendarType === "lunar") {
    return {
      year,
      month,
      day,
      calendar: "LUNAR",
      // The form guarantees lunarMonthType when lunar; default REGULAR defensively.
      lunarMonthKind: birthInfo.lunarMonthType === "leap" ? "LEAP" : "REGULAR"
    };
  }
  return { year, month, day, calendar: "GREGORIAN" };
}
function toBirthTimeInput(birthInfo) {
  if (birthInfo.birthTimeAccuracy === "exact") {
    return {
      accuracy: "EXACT",
      // HH:MM wall-clock, represented as HH:MM:00 (local civil time). With the
      // Asia/Seoul resolver injected, EXACT + supported date + UNIQUE resolution
      // yields an AVAILABLE hour pillar; DST overlap/gap or unsupported dates stay
      // PARTIAL (ENGINE-decided). The APP never computes the offset.
      localTime: {
        hour: Number(birthInfo.birthHour),
        minute: Number(birthInfo.birthMinute),
        second: 0
      }
    };
  }
  if (birthInfo.birthTimeAccuracy === "approximate" && birthInfo.approximateTimePeriod !== null) {
    return {
      accuracy: "APPROXIMATE",
      period: APPROXIMATE_PERIOD_MAP[birthInfo.approximateTimePeriod]
    };
  }
  return { accuracy: "UNKNOWN" };
}
function toCanonicalBirthInput(birthInfo) {
  const label2 = birthInfo.birthPlace.trim();
  return {
    date: toBirthCalendarDate(birthInfo),
    time: toBirthTimeInput(birthInfo),
    // Raw place label only. No geocoding/coordinates (not the APP's concern).
    place: label2.length > 0 ? { label: label2 } : {},
    temporalContext: {
      // V1 Korea-only policy: explicit IANA zoneId; ENGINE resolver owns offset/DST.
      timezone: {
        status: "EXPLICIT",
        ianaZone: V1_SUPPORTED_ZONE_ID,
        source: "APP"
      },
      dst: { status: "UNRESOLVED" },
      trueSolarTime: { mode: "DO_NOT_APPLY" }
    },
    gender: birthInfo.gender !== null ? GENDER_MAP[birthInfo.gender] : "UNSPECIFIED"
  };
}
function toSajuEngineInput(birthInfo) {
  return { engine: "SAJU", birth: toCanonicalBirthInput(birthInfo) };
}

// src/features/myungri/rules/pillarRelations.ts
var DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE = {
  ruleId: "DEOKBUNAI_MYUNGRI_RELATIONS_V1",
  ruleVersion: "deokbunai.myungri-pillar-relations.v1",
  authority: "CLASSICAL_MYUNGRI_STANDARD_RELATION_TABLES"
};
var si = (stem) => HEAVENLY_STEMS.indexOf(stem);
var bi = (branch) => EARTHLY_BRANCHES.indexOf(branch);
var key = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`;
var STEM_COMBINATION = [
  [0, 5, "EARTH"],
  [1, 6, "METAL"],
  [2, 7, "WATER"],
  [3, 8, "WOOD"],
  [4, 9, "FIRE"]
];
var STEM_CLASH = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9]
];
var BRANCH_SIX_COMBINATION = [
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7]
];
var BRANCH_CLASH = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11]
];
var BRANCH_DESTRUCTION = [
  [0, 9],
  [6, 3],
  [5, 8],
  [2, 11],
  [4, 1],
  [10, 7]
];
var BRANCH_HARM = [
  [0, 7],
  [1, 6],
  [2, 5],
  [3, 4],
  [8, 11],
  [9, 10]
];
var THREE_HARMONY = [
  [[8, 0, 4], "WATER"],
  [[11, 3, 7], "WOOD"],
  [[2, 6, 10], "FIRE"],
  [[5, 9, 1], "METAL"]
];
var DIRECTIONAL_UNION = [
  [[2, 3, 4], "WOOD"],
  [[5, 6, 7], "FIRE"],
  [[8, 9, 10], "METAL"],
  [[11, 0, 1], "WATER"]
];
var THREE_PUNISHMENT_TRIOS = [
  [2, 5, 8],
  [1, 10, 7]
];
var MUTUAL_PUNISHMENT_GROUPS = [
  [2, 5, 8],
  [1, 10, 7]
];
var ZI_MAO_PUNISHMENT = [0, 3];
var SELF_PUNISHMENT = /* @__PURE__ */ new Set([4, 6, 9, 11]);
var stemCombinationElement = new Map(
  STEM_COMBINATION.map(([a, b, el]) => [key(a, b), el])
);
var stemCombinationSet = new Set(STEM_COMBINATION.map(([a, b]) => key(a, b)));
var stemClashSet = new Set(STEM_CLASH.map(([a, b]) => key(a, b)));
var sixCombinationSet = new Set(BRANCH_SIX_COMBINATION.map(([a, b]) => key(a, b)));
var branchClashSet = new Set(BRANCH_CLASH.map(([a, b]) => key(a, b)));
var destructionSet = new Set(BRANCH_DESTRUCTION.map(([a, b]) => key(a, b)));
var harmSet = new Set(BRANCH_HARM.map(([a, b]) => key(a, b)));
var halfHarmonyElement = /* @__PURE__ */ new Map();
for (const [[x, y, z], el] of THREE_HARMONY) {
  halfHarmonyElement.set(key(x, y), el);
  halfHarmonyElement.set(key(y, z), el);
  halfHarmonyElement.set(key(x, z), el);
}
var rv = DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion;
function stemRelation(a, b) {
  const ia = si(a);
  const ib = si(b);
  if (ia < 0 || ib < 0 || ia === ib) return null;
  const k = key(ia, ib);
  if (stemCombinationSet.has(k)) {
    return {
      kind: "STEM_COMBINATION",
      stems: [a, b],
      nominalTransformElement: stemCombinationElement.get(k),
      ruleVersion: rv
    };
  }
  if (stemClashSet.has(k)) {
    return { kind: "STEM_CLASH", stems: [a, b], ruleVersion: rv };
  }
  return null;
}
function branchRelations(a, b) {
  const ia = bi(a);
  const ib = bi(b);
  if (ia < 0 || ib < 0) return [];
  const facts = [];
  if (ia === ib) {
    if (SELF_PUNISHMENT.has(ia)) {
      facts.push({ kind: "BRANCH_SELF_PUNISHMENT", branches: [a, b], ruleVersion: rv });
    }
    return facts;
  }
  const k = key(ia, ib);
  if (sixCombinationSet.has(k)) {
    facts.push({ kind: "BRANCH_SIX_COMBINATION", branches: [a, b], ruleVersion: rv });
  }
  if (halfHarmonyElement.has(k)) {
    facts.push({
      kind: "BRANCH_HALF_THREE_HARMONY",
      branches: [a, b],
      harmonyElement: halfHarmonyElement.get(k),
      ruleVersion: rv
    });
  }
  if (branchClashSet.has(k)) {
    facts.push({ kind: "BRANCH_CLASH", branches: [a, b], ruleVersion: rv });
  }
  const pair = [ia, ib];
  const inGroup = (g) => pair.every((x) => g.includes(x));
  if (MUTUAL_PUNISHMENT_GROUPS.some(inGroup) || pair.includes(ZI_MAO_PUNISHMENT[0]) && pair.includes(ZI_MAO_PUNISHMENT[1])) {
    facts.push({ kind: "BRANCH_PUNISHMENT", branches: [a, b], ruleVersion: rv });
  }
  if (destructionSet.has(k)) {
    facts.push({ kind: "BRANCH_DESTRUCTION", branches: [a, b], ruleVersion: rv });
  }
  if (harmSet.has(k)) {
    facts.push({ kind: "BRANCH_HARM", branches: [a, b], ruleVersion: rv });
  }
  return facts;
}
function branchSetRelations(branches) {
  const present = new Set(branches.map(bi).filter((x) => x >= 0));
  const facts = [];
  const idxToBranch = (i) => EARTHLY_BRANCHES[i];
  for (const [trio, el] of THREE_HARMONY) {
    if (trio.every((x) => present.has(x))) {
      facts.push({
        kind: "BRANCH_THREE_HARMONY",
        branches: trio.map(idxToBranch),
        element: el,
        ruleVersion: rv
      });
    }
  }
  for (const [trio, el] of DIRECTIONAL_UNION) {
    if (trio.every((x) => present.has(x))) {
      facts.push({
        kind: "BRANCH_DIRECTIONAL_UNION",
        branches: trio.map(idxToBranch),
        element: el,
        ruleVersion: rv
      });
    }
  }
  for (const trio of THREE_PUNISHMENT_TRIOS) {
    if (trio.every((x) => present.has(x))) {
      facts.push({
        kind: "BRANCH_THREE_PUNISHMENT",
        branches: trio.map(idxToBranch),
        ruleVersion: rv
      });
    }
  }
  return facts;
}

// src/features/myungri/domain/contracts.ts
var DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE = {
  ruleId: "DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1",
  ruleVersion: "deokbunai.myungri-rooting-transparency.v1"
};
var DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE = {
  ruleId: "DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1",
  ruleVersion: "deokbunai.myungri-month-command.v1"
};

// src/features/myungri/services/pillarFacts.ts
function isHeavenlyStem(value) {
  return typeof value === "string" && HEAVENLY_STEMS.includes(value);
}
function isEarthlyBranch(value) {
  return typeof value === "string" && EARTHLY_BRANCHES.includes(value);
}
function myungriProvenance() {
  return {
    yearMonthPillarRuleVersion: DEOKBUNAI_SAJU_V1_RULE_VERSION,
    tenGodRuleVersion: DEOKBUNAI_SAJU_TEN_GODS_VERSION,
    hiddenStemRuleVersion: DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION,
    relationRuleVersion: DEOKBUNAI_MYUNGRI_RELATIONS_V1_RULE.ruleVersion
  };
}
function isValidNatalContext(natal) {
  if (!isHeavenlyStem(natal.dayMaster)) return false;
  const required = [
    natal.pillars.year,
    natal.pillars.month,
    natal.pillars.day
  ];
  for (const p of required) {
    if (!p || !isHeavenlyStem(p.stem) || !isEarthlyBranch(p.branch)) return false;
  }
  const hour = natal.pillars.hour;
  if (hour && (!isHeavenlyStem(hour.stem) || !isEarthlyBranch(hour.branch))) return false;
  return true;
}

// src/features/myungri/services/natalContext.ts
function natalContextFromFourPillars(fourPillars) {
  const context = {
    dayMaster: fourPillars.day.stem,
    pillars: {
      year: { stem: fourPillars.year.stem, branch: fourPillars.year.branch },
      month: { stem: fourPillars.month.stem, branch: fourPillars.month.branch },
      day: { stem: fourPillars.day.stem, branch: fourPillars.day.branch }
    }
  };
  if (fourPillars.hour.status === "AVAILABLE") {
    context.pillars.hour = {
      stem: fourPillars.hour.pillar.stem,
      branch: fourPillars.hour.pillar.branch
    };
  }
  return context;
}

// src/features/myungri/services/natalRelations.ts
function calculateNatalRelations(natal) {
  if (!isValidNatalContext(natal)) return null;
  const cells2 = [
    { position: "YEAR", ...natal.pillars.year },
    { position: "MONTH", ...natal.pillars.month },
    { position: "DAY", ...natal.pillars.day }
  ];
  if (natal.pillars.hour) cells2.push({ position: "HOUR", ...natal.pillars.hour });
  const stem = [];
  const branch = [];
  for (let i = 0; i < cells2.length; i += 1) {
    for (let j = i + 1; j < cells2.length; j += 1) {
      const a = cells2[i];
      const b = cells2[j];
      const sr = stemRelation(a.stem, b.stem);
      if (sr) stem.push({ positions: [a.position, b.position], relation: sr });
      for (const relation of branchRelations(a.branch, b.branch)) {
        branch.push({ positions: [a.position, b.position], relation });
      }
    }
  }
  const sets = branchSetRelations(cells2.map((c) => c.branch));
  return { stem, branch, sets };
}

// src/features/myungri/services/rootingTransparency.ts
var ASSUMPTIONS = [
  "ROOTING_IS_SAME_STEM_IDENTITY_MATCH_NOT_SAME_ELEMENT",
  "HIDDEN_STEM_DATA_AND_ROLES_COME_FROM_THE_FROZEN_SAJU_RULES"
];
var LIMITATIONS = [
  "FACTS_ONLY_NO_STRENGTH_NO_SCORE_NO_WEIGHTING_NO_INTERPRETATION",
  "SAME_ELEMENT_ROOTING_IS_A_SEPARATE_DEFERRED_POLICY_NOT_COMPUTED_HERE"
];
function cells(natal) {
  const out = [
    { position: "YEAR", ...natal.pillars.year },
    { position: "MONTH", ...natal.pillars.month },
    { position: "DAY", ...natal.pillars.day }
  ];
  if (natal.pillars.hour) out.push({ position: "HOUR", ...natal.pillars.hour });
  return out;
}
function unavailable2(reason) {
  return {
    capability: "UNAVAILABLE",
    ruleVersion: DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS
  };
}
function calculateRootingTransparency(natal) {
  if (!isValidNatalContext(natal)) return unavailable2("INVALID_NATAL_CONTEXT");
  const grid = cells(natal);
  const hidden = [];
  for (const cell of grid) {
    const hs = getHiddenStems(cell.branch);
    if (!hs.ok) return unavailable2("HIDDEN_STEMS_UNAVAILABLE");
    hidden.push({ cell, stems: hs.value });
  }
  const rooting = grid.map((cell) => {
    const roots = [];
    for (const h of hidden) {
      for (const s of h.stems) {
        if (s.stem === cell.stem) {
          roots.push({ branchPosition: h.cell.position, branch: h.cell.branch, hiddenStemRole: s.role });
        }
      }
    }
    return { stemPosition: cell.position, stem: cell.stem, isRooted: roots.length > 0, roots };
  });
  const transparency = [];
  for (const h of hidden) {
    for (const s of h.stems) {
      const revealedAt = grid.filter((c) => c.stem === s.stem).map((c) => c.position);
      transparency.push({
        branchPosition: h.cell.position,
        branch: h.cell.branch,
        hiddenStem: s.stem,
        hiddenStemRole: s.role,
        isRevealed: revealedAt.length > 0,
        revealedAt
      });
    }
  }
  return {
    capability: "AVAILABLE",
    ruleVersion: DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE.ruleVersion,
    dayMaster: natal.dayMaster,
    rooting,
    transparency,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS
  };
}

// src/features/myungri/services/monthCommand.ts
var BRANCH_TO_SAJU_MONTH_ORDINAL = {
  YIN: 1,
  MAO: 2,
  CHEN: 3,
  SI: 4,
  WU: 5,
  WEI: 6,
  SHEN: 7,
  YOU: 8,
  XU: 9,
  HAI: 10,
  ZI: 11,
  CHOU: 12
};
var BRANCH_TO_SEASON = {
  YIN: "SPRING",
  MAO: "SPRING",
  CHEN: "SPRING",
  SI: "SUMMER",
  WU: "SUMMER",
  WEI: "SUMMER",
  SHEN: "AUTUMN",
  YOU: "AUTUMN",
  XU: "AUTUMN",
  HAI: "WINTER",
  ZI: "WINTER",
  CHOU: "WINTER"
};
var ELEMENT_YANG_STEM = {
  WOOD: "JIA",
  FIRE: "BING",
  EARTH: "WU",
  METAL: "GENG",
  WATER: "REN"
};
var TEN_GOD_TO_PHASE = {
  PEER: "WANG",
  // 同 → 旺
  INDIRECT_RESOURCE: "XIANG",
  // 月生我 (인성) → 相
  EATING_GOD: "XIU",
  // 我生月 (식상) → 休
  INDIRECT_WEALTH: "QIU",
  // 我剋月 (재) → 囚
  SEVEN_KILLINGS: "SI"
  // 月剋我 (관살) → 死
};
var IN_COMMAND_PHASES = /* @__PURE__ */ new Set(["WANG", "XIANG"]);
var ASSUMPTIONS2 = [
  "MONTH_BRANCH_IS_THE_CANONICAL_IPCHUN_JIE_ATTRIBUTED_SAJU_MONTH_FROM_8CE42B0",
  "SEASONAL_PHASE_USES_MONTH_BRANCH_PRIMARY_ELEMENT_WANG_XIANG_XIU_QIU_SI",
  "DEUKRYEONG_MAPS_WANG_AND_XIANG_TO_IN_COMMAND"
];
var LIMITATIONS2 = [
  "INPUT_FACT_ONLY_NO_SHINYAK_SHINGANG_NO_STRENGTH_SCORE_NO_VERDICT",
  "EARTH_MONTH_YEOGI_RESIDUAL_QI_WEIGHTING_IS_A_DEFERRED_POLICY",
  "LUNAR_MONTH_NUMBER_IS_NEVER_USED_FOR_MONTH_COMMAND"
];
function unavailable3(reason) {
  return {
    capability: "UNAVAILABLE",
    ruleVersion: DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS2,
    limitations: LIMITATIONS2
  };
}
function calculateMonthCommand(natal) {
  if (!isValidNatalContext(natal)) return unavailable3("INVALID_NATAL_CONTEXT");
  const monthBranch = natal.pillars.month.branch;
  const dmElementR = getStemElement(natal.dayMaster);
  const monthElementR = getBranchElement(monthBranch);
  if (!dmElementR.ok || !monthElementR.ok) return unavailable3("ELEMENT_UNAVAILABLE");
  const dayMasterElement = dmElementR.value;
  const monthElement = monthElementR.value;
  const tenGod = calculateTenGod(
    ELEMENT_YANG_STEM[dayMasterElement],
    ELEMENT_YANG_STEM[monthElement]
  );
  if (!tenGod.ok) return unavailable3("RELATION_UNAVAILABLE");
  const dayMasterSeasonalPhase = TEN_GOD_TO_PHASE[tenGod.value];
  if (!dayMasterSeasonalPhase) return unavailable3("RELATION_UNAVAILABLE");
  return {
    capability: "AVAILABLE",
    ruleVersion: DEOKBUNAI_MYUNGRI_MONTH_COMMAND_V1_RULE.ruleVersion,
    dayMaster: natal.dayMaster,
    dayMasterElement,
    sajuMonthOrdinal: BRANCH_TO_SAJU_MONTH_ORDINAL[monthBranch],
    monthBranch,
    monthElement,
    season: BRANCH_TO_SEASON[monthBranch],
    dayMasterSeasonalPhase,
    commandStatus: IN_COMMAND_PHASES.has(dayMasterSeasonalPhase) ? "IN_COMMAND" : "OUT_OF_COMMAND",
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS2,
    limitations: LIMITATIONS2
  };
}

// src/features/famous/server/famousChart.ts
var FAMOUS_CHART_VERSION = 3;
var label = (map, key2) => {
  const entry = map[key2];
  return { hanja: entry?.hanja ?? "", hangul: entry?.hangul ?? key2 };
};
var POSITION_HANGUL = { YEAR: "년", MONTH: "월", DAY: "일", HOUR: "시" };
var slotHangul = (slot) => {
  const [pos, kind] = slot.split("_");
  return `${POSITION_HANGUL[pos] ?? pos}${kind === "STEM" ? "간" : "지"}`;
};
var SEASON_HANGUL = {
  SPRING: "봄",
  SUMMER: "여름",
  AUTUMN: "가을",
  WINTER: "겨울"
};
var PHASE = {
  WANG: { name: "왕(旺)", meaning: "계절과 일간이 같은 오행 — 계절이 일간을 그대로 밀어 줍니다", direction: "SAME" },
  XIANG: { name: "상(相)", meaning: "계절이 일간을 생해 줌 — 뒤에서 받쳐 주는 자리입니다", direction: "SEASON_GENERATES_DAY" },
  XIU: { name: "휴(休)", meaning: "일간이 계절을 생함 — 내보내는 쪽이라 힘을 씁니다", direction: "DAY_GENERATES_SEASON" },
  QIU: { name: "수(囚)", meaning: "일간이 계절을 극함 — 밀어내느라 힘을 씁니다", direction: "DAY_CONTROLS_SEASON" },
  SI: { name: "사(死)", meaning: "계절이 일간을 극함 — 계절이 일간을 눌러 옵니다", direction: "SEASON_CONTROLS_DAY" }
};
var TEN_GOD_GROUP = {
  비견: "비겁",
  겁재: "비겁",
  식신: "식상",
  상관: "식상",
  편재: "재성",
  정재: "재성",
  편관: "관성",
  정관: "관성",
  편인: "인성",
  정인: "인성"
};
var GROUP_ORDER = ["비겁", "식상", "재성", "관성", "인성"];
var RELATION_LABEL = {
  STEM_COMBINATION: {
    name: "천간합(合)",
    meaning: "두 천간이 짝을 이루는 관계. 묶여서 안정되기도 하고, 묶여서 제 일을 못 하기도 합니다"
  },
  STEM_CLASH: {
    name: "천간충(沖)",
    meaning: "두 천간이 정면으로 맞서는 관계. 결정을 재촉하기도 하고 흔들림이 되기도 합니다"
  },
  BRANCH_SIX_COMBINATION: {
    name: "육합(六合)",
    meaning: "두 지지가 하나로 묶이는 관계. 결속이기도 하고 정체이기도 합니다"
  },
  BRANCH_CLASH: {
    name: "충(沖)",
    meaning: "두 지지가 정면으로 부딪히는 관계. 변화·이동의 계기가 되기도 하고 불안정의 원인이 되기도 합니다"
  },
  BRANCH_HALF_THREE_HARMONY: {
    name: "반합(半合)",
    meaning: "삼합 세 글자 중 둘만 모인 관계. 방향이 잡히기도 하고, 아직 완성되지 않은 상태이기도 합니다"
  },
  BRANCH_PUNISHMENT: {
    name: "형(刑)",
    meaning: "두 지지가 서로를 다듬는 관계. 마찰이기도 하고 조정이기도 합니다"
  },
  BRANCH_SELF_PUNISHMENT: {
    name: "자형(自刑)",
    meaning: "같은 지지가 겹친 관계. 같은 기운이 두터워지기도 하고, 같은 성질끼리 안에서 맞물리기도 합니다"
  },
  BRANCH_DESTRUCTION: {
    name: "파(破)",
    meaning: "두 지지가 서로의 짜임을 흩는 관계. 굳은 틀이 풀리기도 하고, 자리가 헐거워지기도 합니다"
  },
  BRANCH_HARM: {
    name: "해(害)",
    meaning: "두 지지가 서로의 합을 방해하는 관계. 끼어듦이기도 하고 견제이기도 합니다"
  },
  BRANCH_THREE_HARMONY: {
    name: "삼합(三合)",
    meaning: "세 지지가 하나의 오행 국을 이루는 관계. 힘이 한곳에 모이기도 하고, 그쪽으로만 쏠리기도 합니다"
  },
  BRANCH_DIRECTIONAL_UNION: {
    name: "방합(方合)",
    meaning: "한 계절의 세 지지가 모인 관계. 그 계절 기운이 두터워지기도 하고, 한 계절에 치우치기도 합니다"
  },
  BRANCH_THREE_PUNISHMENT: {
    name: "삼형(三刑)",
    meaning: "세 지지가 함께 형을 이루는 관계. 세 힘이 서로 맞물리기도 하고, 서로를 다듬기도 합니다"
  }
};
async function buildFamousChart(birth, deps) {
  let execution;
  try {
    execution = await executeSajuFromBirthInput(toSajuEngineInput(birth), {
      digestProvider: deps.digestProvider,
      historicalTimezoneResolver: deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER
    });
  } catch (err) {
    return { ok: false, reason: "CHART_UNAVAILABLE", detail: String(err).slice(0, 160) };
  }
  if (!execution.success) {
    return { ok: false, reason: "CHART_UNAVAILABLE", detail: execution.failedStage ?? null };
  }
  const result = execution.engineResult;
  if (result.status === "UNAVAILABLE" || !result.output) {
    return {
      ok: false,
      reason: "CHART_UNAVAILABLE",
      detail: result.status === "UNAVAILABLE" ? JSON.stringify(result.failure.aggregateReason).slice(0, 160) : null
    };
  }
  const { derivedFacts, fiveElementDistribution, identity, provenance } = result.output;
  const dayStemKey = result.output.fourPillars.day?.stem ?? null;
  const toPillar = (annotation, pillar, isDayPillar) => {
    const stemL = label(HEAVENLY_STEM_LABELS, pillar?.stem ?? "");
    const branchL = label(EARTHLY_BRANCH_LABELS, pillar?.branch ?? "");
    return {
      position: POSITION_HANGUL[annotation.position] ?? annotation.position,
      stem: {
        ...stemL,
        yinYang: label(YIN_YANG_LABELS, annotation.stem.yinYang).hangul,
        element: label(FIVE_ELEMENT_LABELS, annotation.stem.element).hangul,
        // 일간은 십성의 기준이므로 자기 자신에 대한 십성이 없다.
        tenGod: isDayPillar ? null : label(TEN_GOD_LABELS, annotation.stem.tenGod).hangul
      },
      branch: {
        ...branchL,
        yinYang: label(YIN_YANG_LABELS, annotation.branch.yinYang).hangul,
        element: label(FIVE_ELEMENT_LABELS, annotation.branch.element).hangul,
        hiddenStems: annotation.branch.hiddenStems.map((h) => ({
          ...label(HEAVENLY_STEM_LABELS, h.stem),
          role: label(HIDDEN_STEM_ROLE_LABELS, h.role).hangul,
          element: label(FIVE_ELEMENT_LABELS, h.element).hangul,
          tenGod: label(TEN_GOD_LABELS, h.tenGod).hangul
        }))
      }
    };
  };
  const fp = result.output.fourPillars;
  const hourAnnotation = derivedFacts.pillars.hour;
  const natal = natalContextFromFourPillars(fp);
  const rt = calculateRootingTransparency(natal);
  const mc = calculateMonthCommand(natal);
  const rooting = rt.capability === "AVAILABLE" ? rt.rooting.map((r) => ({
    position: POSITION_HANGUL[r.stemPosition] ?? r.stemPosition,
    stem: label(HEAVENLY_STEM_LABELS, r.stem).hangul,
    rooted: r.isRooted,
    roots: r.roots.map(
      (x) => `${POSITION_HANGUL[x.branchPosition] ?? x.branchPosition}지 ${label(EARTHLY_BRANCH_LABELS, x.branch).hangul}`
    )
  })) : [];
  const revealed = rt.capability === "AVAILABLE" ? rt.transparency.filter((t) => t.isRevealed).map((t) => ({
    branchPosition: POSITION_HANGUL[t.branchPosition] ?? t.branchPosition,
    hiddenStem: label(HEAVENLY_STEM_LABELS, t.hiddenStem).hangul,
    role: label(HIDDEN_STEM_ROLE_LABELS, t.hiddenStemRole).hangul,
    revealedAt: t.revealedAt.map((p) => `${POSITION_HANGUL[p] ?? p}간`)
  })) : [];
  const phase = mc.capability === "AVAILABLE" ? PHASE[mc.dayMasterSeasonalPhase] : void 0;
  const monthCommand = mc.capability === "AVAILABLE" && phase ? {
    season: SEASON_HANGUL[mc.season] ?? mc.season,
    phase: phase.name,
    phaseMeaning: phase.meaning,
    direction: phase.direction,
    inCommand: mc.commandStatus === "IN_COMMAND"
  } : null;
  const collectTenGods = () => {
    const out = [];
    for (const key2 of ["year", "month", "day", "hour"]) {
      const ann = derivedFacts.pillars[key2];
      if (!ann) continue;
      if (key2 !== "day") out.push(label(TEN_GOD_LABELS, ann.stem.tenGod).hangul);
      for (const h of ann.branch.hiddenStems) out.push(label(TEN_GOD_LABELS, h.tenGod).hangul);
    }
    return out;
  };
  const allTenGods = collectTenGods();
  const tenGodGroups = GROUP_ORDER.map((group) => {
    const members = allTenGods.filter((g) => TEN_GOD_GROUP[g] === group);
    return { group, count: members.length, members: [...new Set(members)].sort() };
  });
  const elementSlots = fiveElementDistribution.direct.slots.map((s) => ({
    slot: slotHangul(s.slot),
    element: label(FIVE_ELEMENT_LABELS, s.element).hangul
  }));
  const rel = calculateNatalRelations(natal);
  const relations = [];
  if (rel) {
    const push = (kind, membersRaw, map, positions, element) => {
      const meta = RELATION_LABEL[kind];
      if (!meta) return;
      relations.push({
        name: meta.name,
        members: membersRaw.map((m) => label(map, m).hangul),
        positions: positions.map((p) => POSITION_HANGUL[p] ?? p),
        meaning: meta.meaning,
        element: element ? label(FIVE_ELEMENT_LABELS, element).hangul : null
      });
    };
    for (const r of rel.stem) {
      push(r.relation.kind, r.relation.stems, HEAVENLY_STEM_LABELS, r.positions, r.relation.nominalTransformElement);
    }
    for (const r of rel.branch) {
      push(r.relation.kind, r.relation.branches, EARTHLY_BRANCH_LABELS, r.positions, r.relation.harmonyElement);
    }
    for (const r of rel.sets) {
      push(r.kind, r.branches, EARTHLY_BRANCH_LABELS, [], r.element);
    }
  }
  const hourPillar = fp.hour?.status === "AVAILABLE" ? fp.hour.pillar : void 0;
  const snapshot = {
    v: FAMOUS_CHART_VERSION,
    hourKnown: Boolean(hourAnnotation),
    pillars: {
      year: toPillar(derivedFacts.pillars.year, fp.year, false),
      month: toPillar(derivedFacts.pillars.month, fp.month, false),
      day: toPillar(derivedFacts.pillars.day, fp.day, true),
      hour: hourAnnotation ? toPillar(hourAnnotation, hourPillar, false) : null
    },
    dayMaster: {
      ...label(HEAVENLY_STEM_LABELS, dayStemKey ?? ""),
      element: label(FIVE_ELEMENT_LABELS, derivedFacts.pillars.day.stem.element).hangul,
      yinYang: label(YIN_YANG_LABELS, derivedFacts.pillars.day.stem.yinYang).hangul
    },
    monthBranch: {
      ...label(EARTHLY_BRANCH_LABELS, fp.month?.branch ?? ""),
      element: label(FIVE_ELEMENT_LABELS, derivedFacts.pillars.month.branch.element).hangul
    },
    elementCounts: Object.entries(fiveElementDistribution.direct.counts).map(([k, n]) => ({
      element: label(FIVE_ELEMENT_LABELS, k).hangul,
      count: Number(n) || 0
    })),
    tenGodGroups,
    elementSlots,
    rooting,
    revealed,
    monthCommand,
    relations,
    observedSlots: fiveElementDistribution.direct.observedSlots,
    engineVersion: identity?.engineVersion ?? null,
    ruleSetVersion: derivedFacts.ruleVersions.derivedFacts ?? null
  };
  const fingerprint = provenance?.normalizedBirthFingerprint ?? null;
  return { ok: true, snapshot, fingerprint };
}

// src/features/famous/server/famousBodyPrompt.ts
var FAMOUS_BODY_PROMPT_VERSION = "famous_body_v5";
var FAMOUS_BODY_SECTION_TITLES = {
  dayMaster: "일간은 무엇으로 서 있나 — 통근",
  monthCommand: "계절이 정하는 것 — 월령",
  tenGods: "무엇이 많고 무엇이 없나 — 십성 분포",
  hiddenStems: "속에 있는 것과 드러난 것 — 지장간과 투간",
  relations: "글자끼리 어떻게 맞물리나 — 합·충·형",
  howToRead: "이 명식을 읽는 법"
};
var FAMOUS_BODY_SYSTEM_PROMPT = [
  "당신은 사주 명리를 가르치는 글을 쓰는 사람입니다. 독자는 명리를 배우려는 일반인입니다.",
  "이 글의 목적은 **한 명식을 예제 삼아 명리 읽는 법을 가르치는 것**입니다. 인물 소개가 아닙니다.",
  "",
  "════ ① 근거 없는 문장은 쓰지 않습니다 ════",
  "",
  "주장을 하는 문장에는 **반드시 근거를 괄호로 붙입니다.** 형식은 이렇습니다:",
  "  쉬운 결론을 먼저 쓰고, 그 뒤에 (근거: 명식에서 실제로 관측된 것) 을 붙입니다.",
  "",
  "  좋은 예: 이 일간은 뜬 글자가 아니라 바닥에 발을 붙이고 있습니다. (근거: 정 일간이 년지 오·월지 오·시지 미 세 곳에 통근)",
  "  좋은 예: 밖으로 밀어내는 힘보다 스스로를 세우는 힘이 훨씬 큽니다. (근거: 비겁 7 대 식상 4)",
  "",
  "⚠ **근거란 아래 【명식】에 적힌 것뿐입니다.** 당신이 명리 일반론으로 알고 있는 것은 근거가 아닙니다.",
  "  나쁜 예: 수(水)는 정보·유통의 기운을 나타냅니다.  ← 이 명식에서 나온 말이 아닙니다",
  "  나쁜 예: 금 중심의 월주는 규범적 성향을 암시합니다. ← 어디에도 그런 판정이 없습니다",
  "  오행에 성격·직업·분야를 갖다 붙이지 마십시오. 그것은 이 자료에 없는 주장입니다.",
  "",
  "근거를 댈 수 없는 문장은 **쓰지 말고 넘어가십시오.** 분량을 채우려고 일반론을 넣지 마십시오.",
  "",
  "⚠ **괄호 안에는 관측된 값을 쓰십시오. 자료의 항목 이름을 쓰지 마십시오.**",
  "  독자는 아래 자료를 볼 수 없습니다. 항목 이름을 인용하면 독자에게는 아무 뜻도 없는 말이 됩니다.",
  "  나쁜 예: (근거: 【월령 — 계절】)            ← 무엇이 관측됐는지 안 적혀 있습니다",
  '  나쁜 예: (근거: 자료의 "무리의 뜻" 줄)      ← 자료를 가리키고 있습니다',
  "  나쁜 예: (근거: 투간 항목에 표기)           ← 무엇이 투간됐는지가 빠졌습니다",
  "  좋은 예: (근거: 월지 유·가을, 일간의 계절 단계 휴 — 실령)",
  "  좋은 예: (근거: 일지 축의 지장간 신이 월간으로 투간)",
  '  괄호 안에 대괄호【】·"자료"·"항목"·"목록" 같은 말이 들어가면 잘못 쓴 것입니다.',
  '  근거 괄호는 **마침표 앞**, 문장 안에 넣으십시오. "…입니다. (근거: …)" 처럼 따로 떼지 마십시오.',
  "",
  "════ ② 표를 되뇌지 말고 그것이 무슨 뜻인지 말합니다 ════",
  "",
  "표에 적힌 것을 문장으로 옮기는 것은 설명이 아닙니다. 독자는 표를 이미 보고 있습니다.",
  "",
  "  나쁜 예: 십성 표기를 기준으로 일간은 지장간과의 관계에서 표현과 자아의 문제를 중심으로 드러납니다.",
  "           → 무슨 말인지 알 수 없고, 표에 있는 단어를 이어 붙였을 뿐입니다.",
  "  나쁜 예: 일지 축(丑)은 토이고 지장간에 계·신·기가 있습니다.",
  "           → 표를 그대로 읽었습니다.",
  "  좋은 예: 일지에 숨은 세 글자 중 재성 하나만 천간으로 올라와 있습니다. 속에 있는 것과 겉으로",
  "           드러난 것이 다르다는 뜻입니다. (근거: 축 지장간 계·신·기 중 신만 년간에 투간)",
  "",
  '각 문장은 **"그래서 무엇인가"** 를 말해야 합니다. 관측 → 그래서 이런 뜻이다, 의 순서입니다.',
  "",
  "════ ③ 교육 콘텐츠로 씁니다 ════",
  "",
  "- 각 섹션은 **명리 개념 하나**를 다룹니다. 개념이 무엇인지도 알려 주고, 이 명식에서 그것이",
  "  어떻게 나타나는지도 보입니다.",
  '  ⚠ 이것은 **순서 지시가 아닙니다.** "OO는 ~하는 개념입니다 / 이 명식에서는 ~" 두 문장을 섹션마다',
  "  똑같이 되풀이하면 다섯 섹션이 한 틀로 찍힌 글이 됩니다. 개념 설명을 문장 중간에 끼워 넣어도 되고,",
  "  관측을 먼저 던지고 나서 그것이 무슨 개념인지 밝혀도 됩니다. 섹션마다 다르게 여십시오.",
  "- 가장 눈에 띄는 것을 짚고, 왜 눈에 띄는지 수치로 말합니다.",
  "- 마지막 섹션에서는 **같은 일간이라도 결론이 갈리는 지점**을 하나 이상 보여 줍니다.",
  "  (예: 같은 일간이어도 통근이 없으면 읽는 방향이 달라진다 — 이 명식은 어느 쪽인지)",
  "- 독자가 **다른 명식을 볼 때 그대로 쓸 수 있는 읽는 법**을 남깁니다.",
  "",
  "════ ③-2 글자 사이의 관계 — 톤을 조심하십시오 ════",
  "",
  "【글자 관계】에 적힌 것을 본문에 씁니다. 각 관계에는 **가치 중립인 뜻**이 함께 적혀 있습니다.",
  "",
  '⚠⚠ **형·파·해를 자동으로 "나쁨" 으로 옮기지 마십시오.** 이것이 이 지시에서 가장 중요합니다.',
  '  다른 상품에서 합을 "얽힘"·"복잡" 으로 자동 번역했다가 **열두 달이 전부 경고문**이 된 실패가',
  "  있었습니다. 관계는 사건이 아니라 **구조**입니다.",
  "",
  "  나쁜 예: 충(沖)이 있어 불안정하고 사고가 잦습니다.        ← 나쁜 일로 단정했습니다",
  "  나쁜 예: 형(刑)이 있어 다치기 쉬운 자리입니다.            ← 자료에 없는 예언입니다",
  "  나쁜 예: 삼합(三合)이 있어 운이 좋습니다.                 ← 합도 자동으로 좋은 것이 아닙니다",
  "  좋은 예: 두 지지가 정면으로 맞물려 있는 자리입니다. 움직임의 계기가 되기도 하고",
  "           흔들림이 되기도 합니다. (근거: 년지 오와 월지 자의 충(沖))",
  "  좋은 예: 세 글자가 한 방향으로 묶여 힘이 모입니다. 묶인다는 것은 안정이기도 하고",
  "           그쪽으로만 쏠린다는 뜻이기도 합니다. (근거: 신·자·진의 삼합(三合) 수 국)",
  "",
  "- **합도 자동으로 긍정이 아닙니다.** 묶임은 결속이면서 동시에 정체입니다.",
  '- 관계를 쓸 때는 **반드시 참여 글자를 함께 적습니다.** "충이 있습니다" 가 아니라',
  '  "년지 오와 월지 자의 충(沖)" 입니다. 어느 글자 사이인지가 관계의 절반입니다.',
  "- ⚠ **관계 이름은 자료에 적힌 형태 그대로** 씁니다: 충(沖) · 삼합(三合) · 육합(六合) ·",
  "  반합(半合) · 형(刑) · 자형(自刑) · 삼형(三刑) · 파(破) · 해(害) · 천간합(合) · 천간충(沖) ·",
  "  방합(方合). 한자를 빼지 마십시오.",
  '- 관계가 **하나도 없으면** 그것도 사실입니다. "글자끼리 부딪히거나 묶이는 자리가 없는,',
  '  조용한 배치입니다" 처럼 씁니다. 없는 관계를 만들지 마십시오.',
  "",
  "════ ③-3 투간과 통근 — **어느 자리의 어느 글자인지를 문장 안에서 말하십시오** ════",
  "",
  "관계를 쓸 때 참여 글자를 반드시 적게 한 것과 **같은 규칙**이 투간·통근에도 적용됩니다.",
  "어느 자리의 어느 글자인지가 주장의 전부입니다. 그것을 빼면 아무것도 말하지 않은 문장입니다.",
  "",
  "── 투간을 말할 때 ──",
  "",
  "문장 안에 **세 가지가 모두** 있어야 합니다. 하나라도 빠지면 쓰지 마십시오.",
  "  ① 어느 지지인지 — 년지 / 월지 / 일지 / 시지",
  "  ② 그 지지의 어느 지장간 글자인지 — 갑·을·병·정·무·기·경·신·임·계 중 하나",
  "  ③ 어느 천간 자리로 올라갔는지 — 년간 / 월간 / 일간 / 시간",
  "",
  '⚠ **"드러났다" 만으로는 투간을 말한 것이 아닙니다.** "투간되었습니다"(또는 투간된·투간돼) 를',
  '  쓰십시오. "드러나 있습니다" 는 덧붙이는 말이지 그 자체가 주장이 되지 못합니다.',
  "",
  "  나쁜 예: 일지 미에 드러난 십성은 편재(일지의 정이 드러남)로 …",
  "           ← 실제로 나왔던 문장입니다. 그 명식에서 일지 정은 투간된 적이 없습니다.",
  '             "드러남" 만 썼고 어느 천간 자리로 갔는지가 없습니다.',
  "  나쁜 예: 일지 바로 아래에는 상관이 드러나 있습니다.",
  "           ← 실제로 나왔던 문장입니다. 그 일지에서 올라간 것은 경(정재)이고 상관은 숨은 채였습니다.",
  "  나쁜 예: 여러 지장간이 투간되어 겉과 속이 섞여 있습니다.",
  "           ← 어느 지지의 어느 글자가 어디로 갔는지가 하나도 없습니다.",
  "",
  "  좋은 예: 일지 축에 숨은 신이 월간으로 투간되어, 속에 있던 것 하나가 겉으로 올라왔습니다.",
  "  좋은 예: 겉으로 올라온 것은 하나뿐입니다. 년지 자의 계가 일간으로 투간되었고, 나머지는",
  "           지지 안에 그대로 남아 있습니다.",
  "  좋은 예: 월지 오의 정이 일간과 시간 두 자리로 투간되었습니다. 같은 글자가 두 번 올라오면",
  "           그 기운은 숨은 것이 아니라 겉에서 읽히는 것이 됩니다.",
  "",
  '  투간이 **하나도 없으면** 그것도 사실입니다. "지장간 가운데 천간으로 올라온 글자가 없습니다"',
  "  처럼 쓰고, 없는 투간을 만들지 마십시오.",
  "",
  "── 통근을 말할 때 ──",
  "",
  "문장 안에 **천간 자리와 그 글자를 붙여서** 씁니다. 뿌리를 댈 때는 지지 자리도 함께 씁니다.",
  "  ① 어느 천간인지 — 년간 정 / 월간 임 / 일간 계 / 시간 무 (자리와 글자를 **띄어서 나란히**)",
  "  ② 뿌리가 있는지 없는지",
  "  ③ 있으면 어느 지지인지 — 년지 오 / 월지 자 …",
  "",
  "⚠ **자리만 나열하지 마십시오.** 어느 글자가 어디에 뿌리를 두는지를 말해야 합니다.",
  '⚠ **뿌리가 없다는 것도 주장입니다.** "뜬 글자입니다" 만 쓰지 말고 **"통근이 없다" 또는',
  '  "뿌리가 없다"** 를 함께 쓰십시오. "뜬 글자" 는 비유이지 판정 용어가 아닙니다.',
  '⚠ **천간은 반드시 "자리 + 띄어쓰기 + 글자" 순서로** 씁니다 — "일간 기" 이지 "기 일간" 이',
  "  아닙니다. 순서를 뒤집으면 어느 자리를 말하는지가 흐려집니다.",
  '⚠⚠ **자리를 묶어 쓰지 마십시오.** "년·월간의 임" · "일·시간의 정" 처럼 두 자리를 한 덩어리로',
  '  쓰면 **어느 자리인지가 틀립니다.** 실측 실패: 년간은 경인데 "년·월간의 임" 이라고 썼습니다.',
  '  자리마다 따로 씁니다 — "월간 임과 일간 정" · "월간 임과 시간 정".',
  '⚠ 지장간은 **속글자**입니다. "겉글자" 라고 부르지 마십시오 — 투간된 것만 겉입니다.',
  "⚠ 같은 말을 되풀이하는 문장을 쓰지 마십시오.",
  "  나쁜 예: 일간 기는 일간 기(己)로 표기됩니다.  ← 아무것도 말하지 않았습니다",
  "  나쁜 예: 일간 기는 일간 기가 년지 오에 뿌리를 두어  ← 주어를 두 번 썼습니다",
  "",
  "  나쁜 예: (근거: 통근 O가 년·월·시·일에 나타남)",
  "           ← 실제로 나왔던 문장입니다. 그 명식에서 통근 O는 셋이고 월간 임은 X 였습니다.",
  "             어느 글자를 말하는지가 없어서 맞는지 틀린지 확인할 수조차 없습니다.",
  "  나쁜 예: 천간 넷 중 셋이 뿌리를 가지고 있습니다.",
  "           ← 세어 놓기만 했습니다. 어느 글자가 뿌리를 못 가졌는지가 정작 중요한 정보입니다.",
  "",
  "  좋은 예: 일간 정은 년지 오·월지 오·시지 미 세 곳에 뿌리를 두고 있어, 뜬 글자가 아닙니다.",
  "  좋은 예: 넷 중 월간 임 하나만 통근하지 못했습니다. 같은 천간이라도 뿌리가 있는 것과 없는",
  "           것은 다르게 읽습니다.",
  "  좋은 예: 년간 갑도 월간 병도 지지에 뿌리가 없습니다. 이 명식에서 바닥에 발을 붙인 것은",
  "           일간 계 하나뿐입니다.",
  "",
  "── 두 규칙에 공통으로 ──",
  "",
  "- ⚠ **근거 괄호 안에만 자리와 글자를 적고 본문 문장은 뭉뚱그리는 것을 금지합니다.**",
  "  본문 문장이 스스로 자리와 글자를 말해야 합니다. 괄호는 덧붙이는 자리이지 주장을 숨기는",
  "  자리가 아닙니다. 위 좋은 예들은 괄호 없이도 무엇을 말하는지 알 수 있습니다.",
  "- 형식은 고정하되 **문장 모양은 바꾸십시오.** 자리+글자를 앞에 두어도 되고, 결론을 먼저 쓰고",
  "  뒤에서 밝혀도 되고, 없는 쪽을 주어로 삼아도 됩니다. 위 좋은 예 셋이 서로 다른 모양인 것을",
  "  보십시오. 같은 틀을 반복하면 글이 표처럼 됩니다.",
  "- 자리와 글자를 댈 수 없는 사실은 **쓰지 말고 넘어가십시오.** 뭉뚱그린 문장을 남기느니",
  "  문장 하나가 적은 편이 낫습니다.",
  "- ⚠⚠ **본문이 이미 자리와 글자를 말했으면 근거 괄호에 같은 말을 다시 쓰지 마십시오.**",
  '  실측 실패: "년지의 지장간 기가 일간으로 투간되었습니다 (근거: 투간 표에서 년지 지장간 기 →',
  '  일간 투간)." — 괄호가 문장을 그대로 되풀이했습니다. 읽는 사람에게 두 번 같은 말입니다.',
  "  본문이 자리와 글자를 말했다면 **괄호는 생략하거나**, 그 문장이 기대는 **다른** 관측을 적으십시오.",
  "  좋은 예: 년지 유의 신이 월간으로 투간되었습니다. 겉으로 드러난 금 기운이 월간 하나뿐이라,",
  "           이 명식에서 금은 보이는 것보다 속에 더 많습니다. (근거: 오행 금 2 중 천간 1)",
  '- ⚠ **"표에서"·"항목에"·"표기" 로 자료를 가리키지 마십시오.** 독자는 그 표를 볼 수 없습니다.',
  "  관측된 값만 적습니다.",
  '- ⚠ **근거 괄호 안에 또 괄호를 열지 마십시오.** "(근거: 년지 지장간 계(정기) → 일간)" 처럼',
  "  쓰면 괄호가 엉켜 문장이 엉뚱한 데서 끊깁니다. 지장간의 자리 이름(정기·중기·여기)이 꼭",
  "  필요하면 **본문 문장에** 쓰고, 괄호 안에는 글자만 적으십시오.",
  "- ⚠ **근거 괄호 안에 마침표·화살표를 넣지 마십시오.** 괄호는 한 호흡으로 끝냅니다.",
  "- ⚠⚠ **자리와 글자를 이미 말한 문장에는 근거 괄호를 붙이지 마십시오.** 그 문장이 곧 근거입니다.",
  '  실측 실패(고쳐도 반복됨): "년지의 지장간 기가 일간으로 투간되었습니다 (근거: 년지 지장간 기 →',
  '  일간 투간)." — 괄호가 문장을 그대로 옮겨 적었습니다. 독자는 같은 말을 두 번 읽습니다.',
  "  괄호를 붙이려면 그 문장이 **말하지 않은** 것을 적으십시오 — 개수, 다른 자리, 계절 단계 같은 것.",
  "  좋은 예: 년지 유의 신이 월간으로 투간되었습니다. 겉으로 드러난 금이 이 하나뿐입니다. (근거: 오행 금 2)",
  "  좋은 예: 일간 계는 년지 자와 월지 자에 뿌리를 둡니다. 넷 중 뿌리를 가진 것은 이것 하나입니다.",
  '- ⚠ **"투간되었습니다" 를 한 섹션에서 세 번 넘게 쓰지 마십시오.** 세 자리가 투간됐다면 한 문장에',
  '  묶으십시오 — "월지 유의 신과 일지 축의 신은 월간으로, 일지 축의 기는 일간으로 올라왔습니다".',
  "  같은 서술어를 줄줄이 세우면 표를 옮겨 적은 글이 됩니다.",
  "- ⚠ 통근을 말하는 문장도 마찬가지입니다. 천간 넷을 **네 문장으로 나누지 말고** 뿌리가 있는 쪽과",
  "  없는 쪽을 한 문장씩으로 묶으십시오.",
  '- ⚠ **같은 모양의 문장을 두 번 쓰지 마십시오.** "OO지의 지장간 X가 OO간으로 투간되었습니다" 를',
  "  세 번 이어 붙이면 표를 옮겨 적은 것과 같아집니다. 자리와 글자는 반드시 넣되, **넣는 위치를",
  "  바꾸십시오** — 앞에 두거나, 결론 뒤에 밝히거나, 없는 쪽을 주어로 삼거나, 두 사실을 한 문장에",
  "  묶거나. 형식이 고정되는 것은 자리+글자이지 문장 구조가 아닙니다.",
  "",
  "════ ④ 절대 하지 않는 것 ════",
  "",
  "- 인물의 경력·학력·성취·작품·소속·논란·사건을 언급하지 않습니다. 알고 있어도 쓰지 않습니다.",
  "- 명식과 그 사람의 인생 사건을 **인과로 연결하지 않습니다.**",
  "- 대운·세운·앞으로의 시기·나이대별 흐름을 말하지 않습니다. 이 글에는 시간 축이 없습니다.",
  '- 좋다/나쁘다로 단정하지 않습니다. 강한 구조는 "강하다" 이지 "좋다" 가 아닙니다.',
  "- 주어진 명식에 없는 글자·관계·신살을 지어내지 않습니다. 계산도 하지 않습니다.",
  "- ⚠ **【글자 관계】에 적힌 것만** 관계로 말합니다. 거기 없는 관계는 이 명식에 없는 것입니다.",
  "  귀인·신살·역마·도화·화개·원진·공망·12운성은 **판정된 적이 없습니다.** 쓰지 마십시오.",
  '  (1차 생성 실측 실패: 자료에 없는 "사와 오, 미의 삼합" 을 지어냈습니다.)',
  '- 문장의 주어는 **명식·글자·구조**입니다. "이 사람은 ~합니다" 처럼 인물을 단정하지 않습니다.',
  "",
  "════ ⑤ 문장 ════",
  "",
  '- 문체는 "~습니다" 로 통일합니다.',
  "- ⚠ **세미콜론(;) 을 쓰지 마십시오.** 서버가 자동으로 마침표로 바꿉니다 — 그러면 문장이",
  "  당신이 의도한 자리에서 끊깁니다. 처음부터 두 문장으로 쓰는 편이 낫습니다.",
  '  한국어 산문에 세미콜론이 들어갈 자리는 없습니다. 두 문장으로 나누거나 "—" 를 쓰십시오.',
  "  나쁜 예: 먼저 볼 곳은 통근입니다; 그다음이 월령입니다.",
  "  좋은 예: 먼저 볼 곳은 통근입니다. 그다음이 월령입니다.",
  "- ⚠⚠ **생극의 방향을 뒤집지 마십시오. 이 글에서 가장 무거운 오류입니다.**",
  '  자료의 【월령】에 "생극 방향" 이 한 줄로 적혀 있습니다. **그 문장을 그대로 따르십시오.**',
  '  실측 실패: 휴(休)를 "일간이 계절을 생함" 이라고 옳게 풀어 놓고, 바로 다음 절에서',
  '  "월령이 일간을 생해" 라고 **방향을 뒤집었습니다.** 한 문장 안에서 스스로 모순됩니다.',
  "  배우러 온 독자는 그 문장으로 생극을 거꾸로 익힙니다.",
  "- ⚠ **득령과 실령을 헷갈리지 마십시오.** 자료에 적힌 쪽만 쓰십시오. 반대말을 쓰고 옳은 뜻으로",
  "  풀어 놓으면 독자는 용어를 거꾸로 배웁니다. 계절 단계(왕·상·휴·수·사)도 자료에 적힌 것만 씁니다.",
  "- 한 섹션 안에서 **같은 말로 시작하는 문장을 두 번 쓰지 마십시오.** 주어를 바꿔 가며 씁니다:",
  '  "정화 일간은 …" "여름 오월에 난 불은 …" "지장간을 보면 …" "이 배치에서 갈리는 것은 …"',
  '  ⚠ **"이 명식에서는" 으로 시작하는 문장은 글 전체에서 두 번을 넘기지 마십시오.** 글자 이름·계절·',
  "  구조를 주어로 삼으면 같은 말을 반복할 이유가 없습니다.",
  "- 섹션 첫 문장을 다섯 섹션 모두 같은 형태로 열지 마십시오.",
  '- 같은 표현을 되풀이하지 마십시오. "~한 경향이 있습니다" 를 문단마다 붙이지 마십시오.',
  "- 전문용어는 **씁니다** — 배우러 온 독자에게 용어를 감추면 배울 것이 없습니다.",
  "  다만 **처음 나올 때 괄호로 짧게 풀어 줍니다.** 예: 통근(通根, 천간이 지지 속에 같은 오행의 뿌리를 두는 것)",
  "  ⚠ 아래 용어는 **하나도 빠짐없이** 글 안에서 처음 나올 때 괄호 풀이를 답니다. 자료에 적혀 있다고",
  "  해서 독자가 아는 것은 아닙니다 — 자료는 당신만 봅니다.",
  '    비겁 · 식상 · 재성 · 관성 · 인성 (뜻은 자료의 "무리의 뜻" 줄을 그대로 쓰십시오)',
  "    비견 · 겁재 · 식신 · 상관 · 편재 · 정재 · 편관 · 정관 · 편인 · 정인",
  "    통근 · 투간 · 지장간 · 월령 · 득령 · 실령",
  "  풀이는 짧게 한 번만 답니다. 같은 용어에 매번 괄호를 붙이지는 마십시오.",
  '- 어려운 점은 "약점" 이 아니라 **"신경 쓰면 좋은 자리"** 로 씁니다.',
  "- 각 섹션 4~6문장.",
  "",
  "⚠ 아래는 실제로 나왔던 문장 결함입니다. 같은 것을 만들지 마십시오.",
  "  나쁜 예: 지지의 지지(地支) 지지기반과 연결됩니다   ← 같은 말을 세 번 이어 붙였습니다",
  "  나쁜 예: (정의: 지장간과 투간 설명)                ← 괄호 안이 비었습니다. 풀이를 쓰거나 괄호를 지우십시오",
  "  나쁜 예: 뿌리를 두지 못해 외로움이 있어 보입니다    ← 자료에 없는 감정입니다",
  "  나쁜 예: 비견(같은 오행 임)와 겁재                 ← 조사와 어미가 어색합니다",
  "  나쁜 예: 먼저 볼 곳은 통근입니다; 그다음 …          ← 세미콜론을 쓰지 마십시오",
  '  나쁜 예: … 인성은 일간을 생하는 것으로 본다        ← "~습니다" 로 통일하십시오',
  "  괄호를 열었으면 **반드시 안에 뜻을 씁니다.** 쓸 말이 없으면 괄호를 열지 마십시오.",
  "",
  "════ ⑥ 시주가 없을 때 ════",
  "",
  "- 시주(태어난 시각) 정보가 없다고 표시되면 **시주를 추측하지 않습니다.**",
  "- 여덟 글자 중 두 글자가 비었으므로 통근·십성 개수도 그만큼 덜 세어진 값입니다. 그 사실을",
  '  해당 섹션에서 한 번 짚고, 마지막 섹션에서 "시각을 알면 어디가 달라지는지" 를 말합니다.',
  "",
  "⚠ **여섯 칸 명식에서 분량을 억지로 채우지 마십시오.** 실측에서 시각 미상 명식의 글이 가장",
  "  나빴습니다 — 근거가 적으니 모델이 빈칸을 메우려 하고, 그 과정에서 없는 사실이 들어갔습니다",
  "  (실측: 있지도 않은 투간을 지어냈습니다).",
  "  여섯 칸이면 **글이 짧아지는 것이 정상입니다.** 각 섹션 3~4문장이면 충분합니다.",
  '  근거가 적을 때 해야 할 일은 채우는 것이 아니라 **"여기까지만 말할 수 있다" 고 밝히는 것**입니다.',
  "  좋은 예: 시주가 없어 여덟 칸 중 여섯 칸만 보입니다. 통근과 십성 개수는 그 여섯 칸을 센 값이라,",
  "           시각을 알면 숫자가 달라질 수 있습니다. (근거: 관측 6칸)",
  "",
  "반드시 아래 JSON 하나만 출력하십시오 (코드블록·설명 금지). 각 값은 4~6문장:",
  "{",
  '  "dayMaster": "통근 개념 + 이 명식의 일간이 무엇으로 서 있는지. **천간은 자리+글자로**(일간 정), 뿌리는 지지 자리+글자로",',
  '  "monthCommand": "월령 개념 + 계절이 이 일간에게 하는 일",',
  '  "tenGods": "십성 분포 + 무엇이 많고 무엇이 없는지, 일간과 가장 가까운 일지의 십성",',
  `  "hiddenStems": "지장간과 투간 개념 + 속에 있는 것과 드러난 것의 차이. **투간은 반드시 (어느 지지 + 어느 글자 + 어느 천간 자리) 셋을 다 적고 '투간되었습니다' 로 쓸 것**",`,
  '  "relations": "【글자 관계】에 적힌 관계를 참여 글자와 함께. 관계가 없으면 없다고 쓸 것",',
  '  "howToRead": "이 명식에서 먼저 볼 곳 + 같은 일간이어도 갈리는 지점 + 다른 명식에 쓸 수 있는 읽는 법"',
  "}"
].join("\n");
var pillarLine = (p) => {
  const stemGod = p.stem.tenGod ? ` 십성:${p.stem.tenGod}` : " (일간 — 십성의 기준)";
  const hidden = p.branch.hiddenStems.map((h) => `${h.hangul}(${h.role}·${h.tenGod})`).join(" ");
  return [
    `- ${p.position}주:`,
    `천간 ${p.stem.hangul}(${p.stem.hanja}) ${p.stem.yinYang}${p.stem.element}${stemGod}`,
    `/ 지지 ${p.branch.hangul}(${p.branch.hanja}) ${p.branch.element}`,
    `/ 지장간 ${hidden}`
  ].join(" ");
};
function buildFamousBodyUserPrompt(chart) {
  const lines = [
    "【명식】",
    pillarLine(chart.pillars.year),
    pillarLine(chart.pillars.month),
    pillarLine(chart.pillars.day),
    chart.pillars.hour ? pillarLine(chart.pillars.hour) : "- 시주: **없음 (태어난 시각 정보가 없습니다). 추측하지 마십시오.**",
    "",
    `【일간】 ${chart.dayMaster.hangul}(${chart.dayMaster.hanja}) — ${chart.dayMaster.yinYang}${chart.dayMaster.element}. 십성은 모두 이 글자를 기준으로 매겨진 것입니다.`
  ];
  if (chart.monthCommand) {
    lines.push(
      "",
      "【월령 — 계절】",
      `- 월지 ${chart.monthBranch.hangul}(${chart.monthBranch.hanja}) ${chart.monthBranch.element} · 계절 ${chart.monthCommand.season}`,
      `- 일간의 계절 단계: ${chart.monthCommand.phase} — ${chart.monthCommand.phaseMeaning}`,
      // ⚠ 방향을 **한 줄로 따로** 준다. 뜻 문장 안에 섞여 있으면 모델이 앞뒤를 뒤집는다(실측).
      `- ⚠ 생극 방향: **${DIRECTION_KO[chart.monthCommand.direction]}**. 이 방향을 뒤집어 쓰지 마십시오.`,
      `- ${chart.monthCommand.inCommand ? "득령(得令) — 계절의 힘을 얻은 상태입니다." : "실령(失令) — 계절의 힘을 얻지 못한 상태입니다."}`
    );
  } else {
    lines.push("", "【월령】 판정 없음 — 계절 이야기를 하지 마십시오.");
  }
  if (chart.rooting.length > 0) {
    lines.push("", "【통근 — 천간이 지지에 뿌리를 두었는가】");
    for (const r of chart.rooting) {
      lines.push(
        r.rooted ? `- ${r.position}간 ${r.stem}: 통근 O — ${r.roots.join(", ")}` : `- ${r.position}간 ${r.stem}: 통근 X (뿌리 없음 — 뜬 글자입니다)`
      );
    }
  }
  lines.push("", "【투간 — 지장간이 천간으로 드러났는가】");
  if (chart.revealed.length > 0) {
    for (const t of chart.revealed) {
      lines.push(`- ${t.branchPosition}지 지장간 ${t.hiddenStem}(${t.role}) → ${t.revealedAt.join(", ")} 에 드러남`);
    }
  } else {
    lines.push("- 드러난 지장간이 하나도 없습니다. 속에 있는 것이 겉으로 나오지 않은 명식입니다.");
  }
  const revealedKeys = new Set(chart.revealed.map((t) => `${t.branchPosition}:${t.hiddenStem}`));
  const stillHidden = [];
  for (const p of [chart.pillars.year, chart.pillars.month, chart.pillars.day, chart.pillars.hour]) {
    if (!p) continue;
    for (const h of p.branch.hiddenStems) {
      if (!revealedKeys.has(`${p.position}:${h.hangul}`)) {
        stillHidden.push(`${p.position}지 ${h.hangul}(${h.role}·${h.tenGod})`);
      }
    }
  }
  lines.push(
    stillHidden.length > 0 ? `- 아직 숨은 채로 남은 지장간: ${stillHidden.join(" · ")}` : "- 지장간이 모두 천간으로 드러났습니다."
  );
  lines.push(
    "",
    `【십성 분포 — 천간과 지장간의 십성을 모두 센 값 (총 ${chart.tenGodGroups.reduce((a, g) => a + g.count, 0)}개)】`
  );
  for (const g of chart.tenGodGroups) {
    lines.push(`- ${g.group} ${g.count}${g.members.length ? ` (${g.members.join("·")})` : " — 하나도 없음"}`);
  }
  lines.push(
    "- 무리의 뜻(일간 기준): 비겁 = 일간과 같은 오행 / 식상 = 일간이 생하는 것 /",
    "  재성 = 일간이 극하는 것 / 관성 = 일간을 극하는 것 / 인성 = 일간을 생하는 것"
  );
  lines.push("", "【글자 관계 — 엔진이 판정한 것 전부】");
  if (chart.relations.length > 0) {
    for (const r of chart.relations) {
      const where = r.positions.length > 0 ? ` [${r.positions.join("·")}주 사이]` : "";
      const el = r.element ? ` · 국 오행 ${r.element}` : "";
      lines.push(`- ${r.name} : ${r.members.join(" · ")}${where}${el}`);
      lines.push(`    뜻 — ${r.meaning}`);
    }
    lines.push("- ⚠ 위에 없는 관계는 이 명식에 **없습니다.** 만들지 마십시오.");
  } else {
    lines.push("- 판정된 관계가 하나도 없습니다. 글자끼리 부딪히거나 묶이는 자리가 없는 배치입니다.");
    lines.push('- ⚠ 그러므로 이 글에는 어떤 관계도 쓰지 마십시오. "없다" 는 사실을 그대로 쓰면 됩니다.');
  }
  lines.push(
    "",
    `【오행 개수】 ${chart.elementCounts.map((c) => `${c.element} ${c.count}`).join(" · ")} (관측 ${chart.observedSlots}칸)`,
    // ⚠ 이 한 줄이 없으면 모델이 "목이 하나도 없다" 와 "지장간에 을(목)이 있다" 를 같은 글에서
    //   말하고 스스로 모순된다. 무엇을 센 값인지 먼저 못박는다.
    "  ⚠ 이 개수는 **겉으로 드러난 천간·지지 칸만** 센 것입니다. 지장간은 세지 않았습니다 —",
    '  따라서 "개수 0" 은 "그 오행이 지장간에도 없다" 는 뜻이 아닙니다.',
    `【오행이 앉은 자리】 ${chart.elementSlots.map((s) => `${s.slot}=${s.element}`).join(" · ")}`
  );
  lines.push(
    "",
    "위 자료만 보고 쓰십시오. 인물이 누구인지는 알려드리지 않았고, 알 필요도 없습니다.",
    "표기된 글자만 쓰고, 표에 없는 글자나 판정을 문장 안에서 새로 만들지 마십시오.",
    "⚠ 주장하는 문장마다 (근거: …) 를 붙이십시오. 근거는 위 자료에 적힌 것이어야 합니다."
  );
  return lines.join("\n");
}
function clampSemicolons(text) {
  return text.replace(/\s*;\s*/g, ". ");
}
function composeFamousBody(sections2) {
  return Object.keys(FAMOUS_BODY_SECTION_TITLES).map((k) => `## ${FAMOUS_BODY_SECTION_TITLES[k]}

${clampSemicolons(sections2[k].trim())}`).join("\n\n");
}
var FAMOUS_BODY_FORBIDDEN = [
  // ⚠ 시간 축. 이것이 들어가면 명식 해설이 아니라 인물 예측이다.
  // ⚠ `세운` 은 일상어 "세우다"의 관형형과 겹친다. 상담 스크러버가 같은 함정으로 배달된 답변
  //    314건 중 2건을 통째로 버렸고(§7.8), 앞 조사를 보는 방식으로 좁혀 해소했다.
  //    여기서도 **같은 좁힘을 그대로 쓴다** — 새 규칙을 만들지 않는다.
  //    실측 거짓 양성: "일간을 중심으로 세운 판단은 통근의 수와 …"
  //
  //    ⚠ 레포 가드는 **앞의 목적격 조사만** 본다("우선순위를 세운다면"). 이 경로의 실패는
  //    "중심으로 세운 판단" 이라 그 가드를 통과했다. 그래서 **뒤도 함께** 본다:
  //    기술어 세운은 조사가 붙는다("이 세운은/세운이/세운에"). 관형형은 뒤에 명사가 온다.
  //    앞뒤 둘 다 만족할 때만 기술어로 판정한다 — 좁히기만 하고 토큰을 빼지 않는다.
  { id: "FORTUNE_TIMELINE", re: /대운|(?<!(?:을|를|은|는|앞|미리|먼저|로|서)\s{0,2})세운(?=\s*(?:은|이|에|의|을|를|과|와))|월운|연운|앞으로\s*\d|향후|올해|내년|몇\s*년\s*뒤|\d+\s*대\s*운/, why: "대운·세운·미래 시점" },
  // ⚠ 인물 단정. (b) 는 명식을 말하지 사람을 말하지 않는다.
  { id: "PERSON_ASSERTION", re: /이\s*사람은|그는\s|그녀는\s|본인은\s|당신은\s/, why: "특정 인물 단정" },
  // ⚠ 경력·성취와의 인과.
  { id: "CAREER_LINK", re: /데뷔|소속사|학교에\s*갔|대학에\s*갔|수상|논란|사건|이혼|열애/, why: "경력·사건 언급" },
  // ⚠ v3 에서 **좁혔다.** 이전에는 합·충·형 단어를 통째로 막았는데, 그 근거였던 "엔진이 판정하지
  //    않는다" 가 사실이 아니었다 — `calculateNatalRelations` 가 12종을 실제로 판정한다.
  //    단어 차단은 이제 `checkRelationClaims` 의 **화이트리스트 대조**가 대신한다(더 강한 방어다:
  //    단어가 아니라 그 관계가 이 명식에 실제로 있는지를 본다).
  //    여기 남는 것은 **엔진이 끝내 판정하지 않는 것**뿐이다. 원진·귀인·신살·공망·12운성은
  //    `pillarRelations.ts` 의 어느 enum 에도 없다. 이름을 붙이는 순간 날조다.
  { id: "INVENTED_RELATION", re: /원진|귀인|신살|공망|역마|도화|화개|형살|육파/, why: "엔진이 판정하지 않는 관계·신살" },
  // ⚠ 가치 판단.
  { id: "VERDICT", re: /좋은\s*사주|나쁜\s*사주|훌륭한\s*명식|불행|재수\s*없|팔자가\s*세/, why: "좋다/나쁘다 단정" }
];
function checkFamousBody(markdown) {
  const out = [];
  for (const rule of FAMOUS_BODY_FORBIDDEN) {
    const m = rule.re.exec(markdown);
    if (m) out.push({ id: rule.id, why: rule.why, excerpt: markdown.slice(Math.max(0, m.index - 20), m.index + 30) });
  }
  return out;
}
var GLOSSED_TERMS = [
  "비견",
  "겁재",
  "식신",
  "상관",
  "편재",
  "정재",
  "편관",
  "정관",
  "편인",
  "정인",
  "지장간",
  "득령",
  "실령",
  "통근",
  "투간",
  "월령",
  "비겁",
  "식상",
  "재성",
  "관성",
  "인성"
];
function sections(markdown) {
  return markdown.split(/^## /m).slice(1).map((section) => {
    const [title, ...rest] = section.split("\n");
    const body = rest.join(" ");
    const normalized = body.replace(/([.!?])\s*([(（]근거:[^)）]*[)）])/g, " $2$1");
    const sentenceList = normalized.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => x.length > 12);
    return { title: title.trim(), sentences: sentenceList };
  });
}
function repeatedOpenings(markdown) {
  const out = [];
  for (const { sentences } of sections(markdown)) {
    if (sentences.length < 3) continue;
    const heads = /* @__PURE__ */ new Map();
    for (const sen of sentences) {
      const head = sen.slice(0, 6);
      heads.set(head, (heads.get(head) ?? 0) + 1);
    }
    for (const [opening, count] of heads) {
      if (count * 2 > sentences.length) out.push({ opening, count, total: sentences.length });
    }
  }
  return out;
}
function ungloassedTerms(markdown) {
  return GLOSSED_TERMS.filter((term) => {
    if (!markdown.includes(term)) return false;
    return !new RegExp(`${term}[^\\n]{0,12}[(（]`).test(markdown);
  });
}
function claimCoverage(markdown) {
  return sections(markdown).map(({ title, sentences }) => ({
    title,
    sentences: sentences.length,
    sourced: sentences.filter((s) => s.includes("(근거:") || s.includes("（근거:")).length
  }));
}
function contradictsChart(markdown, chart) {
  const mc = chart.monthCommand;
  if (!mc) return [];
  const out = [];
  const right = mc.inCommand ? "득령" : "실령";
  const wrong = mc.inCommand ? "실령" : "득령";
  const citationSpans = [...markdown.matchAll(/[(（]근거:[^)）]*[)）]/g)].map(
    (m) => [m.index ?? 0, (m.index ?? 0) + m[0].length]
  );
  for (const m of markdown.matchAll(new RegExp(`(.{0,6})${wrong}(.{0,12})`, "g"))) {
    const at = (m.index ?? 0) + m[1].length;
    const around = `${m[1]}${m[2]}`;
    if (/못|않|없|아니|아닙|아냐/.test(m[2])) continue;
    if (/(?:이|라|다)면|경우|가정|였다면|했다면/.test(m[2])) continue;
    if (around.includes(right) || /여부|인지|중\s*어느|판정/.test(around)) continue;
    if (/^\s*[(（]/.test(m[2])) continue;
    if (citationSpans.some(([s, e]) => at >= s && at < e)) continue;
    out.push(`명식은 ${right}인데 본문이 "${wrong}" 이라고 씀 — "${m[0].trim().slice(0, 28)}"`);
  }
  for (const season of ["봄", "여름", "가을", "겨울"]) {
    if (season === mc.season) continue;
    if (new RegExp(season + "(?![가-힣])").test(markdown)) {
      out.push(`계절은 ${mc.season} 인데 본문이 "${season}" 을 씀`);
    }
  }
  for (const name of ["왕(旺)", "상(相)", "휴(休)", "수(囚)", "사(死)"]) {
    const bare = name.slice(0, 1);
    if (name === mc.phase) continue;
    if (markdown.includes(name) || markdown.includes(`${bare} 단계`)) {
      out.push(`명식의 계절 단계는 ${mc.phase} 인데 본문이 "${name}" 을 씀`);
    }
  }
  return out;
}
var RELATION_ANCHORS = [
  { hanja: "三合", label: "삼합" },
  { hanja: "方合", label: "방합" },
  { hanja: "六合", label: "육합" },
  { hanja: "半合", label: "반합" },
  { hanja: "自刑", label: "자형" },
  { hanja: "三刑", label: "삼형" },
  { hanja: "沖", label: "충" },
  { hanja: "刑", label: "형" },
  { hanja: "破", label: "파" },
  { hanja: "害", label: "해" },
  { hanja: "合", label: "합" }
];
var GLYPHS = "갑을병정무기경신임계자축인묘진사오미신유술해";
function namedGlyphs(sentence) {
  const stripped = sentence.replace(
    /(?:천간합|천간충|삼합|방합|육합|반합|자형|삼형|충|형|파|해|합)[(（][一-鿿]{1,4}[)）]/g,
    " "
  );
  const re = new RegExp(
    // ⚠ 여는 괄호도 경계다 — `계(정기)` 처럼 글자 바로 뒤에 풀이가 붙는 형태가 흔하다.
    //   빼 두면 정상 투간 주장에서 글자를 못 찾아 미검증으로 잡힌다(실측 1건).
    // `만` 도 조사다 — 실측 문장이 "정만 천간으로" 였고, 빼 두면 그 글자를 못 본다.
    `(?<![가-힣])([${GLYPHS}])(?=[\\s,·)\\](（]|와|과|의|이|가|은|는|도|에|만|$)`,
    "g"
  );
  return [...new Set([...stripped.matchAll(re)].map((m) => m[1]))];
}
function checkRelationClaims(markdown, chart) {
  const out = [];
  const facts = chart.relations ?? [];
  for (const { sentences } of sections(markdown)) {
    for (const sentence of sentences) {
      if (/없|아니|아닙|않|없이/.test(sentence)) continue;
      const named = namedGlyphs(sentence);
      for (const anchor of RELATION_ANCHORS) {
        if (!sentence.includes(`(${anchor.hanja})`) && !sentence.includes(`（${anchor.hanja}）`)) continue;
        const kindExists = facts.some((f) => f.name.includes(anchor.label));
        if (named.length < 2 && kindExists) break;
        const hit = facts.find(
          (f) => f.name.includes(anchor.label) && f.members.every((m) => sentence.includes(m))
        );
        out.push({
          anchor: anchor.label,
          sentence: sentence.slice(0, 90),
          matched: hit ? `${hit.name} ${hit.members.join("·")}` : null
        });
        break;
      }
    }
  }
  return out;
}
function unverifiedRelationClaims(markdown, chart) {
  return checkRelationClaims(markdown, chart).filter((c) => c.matched === null);
}
var SEASON_WORDS = ["계절", "월령", "월지", "월주"];
var DAY_WORDS = ["일간", "일주의 천간"];
function phaseDirectionErrors(markdown, chart) {
  const mc = chart.monthCommand;
  if (!mc) return [];
  const out = [];
  const dir = mc.direction;
  const re = /([가-힣]{1,4})(?:이|가)\s+(?:[^.!?]{0,20}?)([가-힣]{1,4})(?:을|를)\s*(생|극)/g;
  for (const { sentences } of sections(markdown)) {
    for (const sentence of sentences) {
      for (const m of sentence.matchAll(re)) {
        const [, subj, obj, verb] = m;
        const subjSeason = SEASON_WORDS.some((w) => subj.includes(w));
        const subjDay = DAY_WORDS.some((w) => subj.includes(w));
        const objSeason = SEASON_WORDS.some((w) => obj.includes(w));
        const objDay = DAY_WORDS.some((w) => obj.includes(w));
        if (!(subjSeason && objDay || subjDay && objSeason)) continue;
        const asserted = verb === "생" ? subjSeason ? "SEASON_GENERATES_DAY" : "DAY_GENERATES_SEASON" : subjSeason ? "SEASON_CONTROLS_DAY" : "DAY_CONTROLS_SEASON";
        if (asserted !== dir) {
          out.push(
            `계절 단계 ${mc.phase} 의 방향은 "${DIRECTION_KO[dir]}" 인데 본문이 "${m[0].trim()}" 이라고 씀`
          );
        }
      }
    }
  }
  return [...new Set(out)];
}
var DIRECTION_KO = {
  SAME: "계절과 일간이 같은 오행 (생극 없음)",
  SEASON_GENERATES_DAY: "계절이 일간을 생함",
  DAY_GENERATES_SEASON: "일간이 계절을 생함",
  DAY_CONTROLS_SEASON: "일간이 계절을 극함",
  SEASON_CONTROLS_DAY: "계절이 일간을 극함"
};
function sentenceDefects(markdown) {
  const out = [];
  for (const m of markdown.matchAll(/[(（]\s*정의\s*:[^)）]*[)）]/g)) {
    out.push(`군더더기 괄호: "${m[0].slice(0, 40)}" — 뜻은 용어 바로 뒤 괄호에 씁니다`);
  }
  for (const m of markdown.matchAll(/[(（]\s*[)）]/g)) out.push(`빈 괄호: "${m[0]}"`);
  for (const m of markdown.matchAll(/([가-힣]{2,4}).{0,6}\1.{0,6}\1/g)) {
    if (/[·,、\/]/.test(m[0])) continue;
    out.push(`같은 말 3회 연속: "${m[0].slice(0, 30)}"`);
  }
  const semis = (markdown.match(/;/g) ?? []).length;
  if (semis > 0) out.push(`세미콜론 ${semis}개 (clamp 를 거치지 않은 경로가 있습니다)`);
  for (const m of markdown.matchAll(/(?:이다|한다|본다|된다)\./g)) {
    out.push(`문체 이탈: "${m[0]}"`);
  }
  return [...new Set(out)];
}
function definitionalOrConditional(sentence) {
  return /(?:이|라|다|으|니)면|거나|경우|가정|였다면|했다면/.test(sentence);
}
function checkRevealedClaims(markdown, chart) {
  const out = [];
  const facts = chart.revealed ?? [];
  for (const { sentences } of sections(markdown)) {
    for (const sentence of sentences) {
      if (!/투간(?:되|된|돼)/.test(sentence)) continue;
      if (/없|아니|아닙|않|못|숨/.test(sentence)) continue;
      if (definitionalOrConditional(sentence)) continue;
      if (!/[년월일시]지/.test(sentence)) continue;
      const glyphs = namedGlyphs(sentence);
      const hit = facts.find(
        (f) => sentence.includes(f.branchPosition + "지") && glyphs.includes(f.hiddenStem) && f.revealedAt.some((at) => sentence.includes(at))
      );
      out.push({
        kind: "투간",
        sentence: sentence.slice(0, 90),
        matched: hit ? hit.branchPosition + "지 " + hit.hiddenStem + " → " + hit.revealedAt.join(",") : null
      });
    }
  }
  return out;
}
function checkRootingClaims(markdown, chart) {
  const out = [];
  const facts = chart.rooting ?? [];
  if (facts.length === 0) return out;
  for (const { sentences } of sections(markdown)) {
    for (const sentence of sentences) {
      if (!/통근(?!\s*(?:시간|길|버스|열차|거리))/.test(sentence)) continue;
      if (definitionalOrConditional(sentence)) continue;
      const pairs = [
        ...sentence.matchAll(
          /([년월일시])간\s+([갑을병정무기경신임계])(?=[\s,·)\](]|은|는|이|가|을|를|의|도|과|와|에|만|$)/g
        )
      ];
      if (pairs.length === 0) continue;
      const DENY = /통근\s*(?:이|은|을)?\s*(?:X|없)|뿌리(?:가|는|를)?\s*(?:없|두지\s*못)|통근하지\s*못|통근되지\s*않|뜬\s*글자(?!\s*(?:가|는|이)?\s*아(?:니|닙))/;
      for (let i = 0; i < pairs.length; i += 1) {
        const pair = pairs[i];
        const pos = pair[1];
        const stem = pair[2];
        const from = pair.index ?? 0;
        let last = i;
        while (pairs[last + 1] && /^\s*(?:와|과|·|,|및|그리고)\s*$/.test(
          sentence.slice((pairs[last].index ?? 0) + pairs[last][0].length, pairs[last + 1].index ?? 0)
        )) last += 1;
        let to = Math.min(pairs[last + 1]?.index ?? sentence.length, (pairs[last].index ?? 0) + 40);
        const clause = sentence.slice(pairs[last].index ?? 0, to).match(/(?:있고|하고|되고|이고|으며|지만|으나|는데),?\s/);
        if (clause?.index !== void 0) {
          to = (pairs[last].index ?? 0) + clause.index + clause[0].length;
        }
        const before = sentence.slice(pairs[i - 1] ? (pairs[i - 1].index ?? 0) + pairs[i - 1][0].length : 0, from);
        const DENY_ADNOMINAL = /(?:통근\s*(?:이|은)?\s*없는|뿌리\s*(?:가|는)?\s*없는|통근하지\s*못한|뿌리를\s*두지\s*못한|통근되지\s*않은)\s*$/;
        const denies = DENY.test(sentence.slice(from, to).replace(DENY_ADNOMINAL, "")) || DENY_ADNOMINAL.test(before);
        const fact = facts.find((f) => f.position === pos && f.stem === stem);
        if (!fact) {
          out.push({ kind: "통근", sentence: sentence.slice(0, 90), matched: null });
          continue;
        }
        const agrees = denies ? !fact.rooted : fact.rooted;
        const namedBranchPositions = [...sentence.slice(from, to).matchAll(/([년월일시])지/g)].map((m) => m[1]);
        const rootPositions = fact.roots.map((r) => r.split(" ")[0].replace("지", ""));
        const rootsOk = !fact.rooted || namedBranchPositions.length === 0 || namedBranchPositions.some((p) => rootPositions.includes(p));
        out.push({
          kind: "통근",
          sentence: sentence.slice(0, 90),
          matched: agrees && rootsOk ? pos + "간 " + stem + " 통근 " + (fact.rooted ? "O" : "X") : null
        });
      }
    }
  }
  return out;
}
function unverifiedFactClaims(markdown, chart) {
  return [
    ...checkRevealedClaims(markdown, chart),
    ...checkRootingClaims(markdown, chart)
  ].filter((c) => c.matched === null);
}
var STEM_GLYPHS = "갑을병정무기경신임계";
var TEN_GOD_GROUPS = ["비겁", "식상", "재성", "관성", "인성"];
var ELEMENTS = ["목", "화", "토", "금", "수"];
function checkChartFacts(markdown, chart) {
  const out = [];
  const pillarOf = {
    년: chart.pillars.year,
    월: chart.pillars.month,
    일: chart.pillars.day,
    시: chart.pillars.hour
  };
  for (const { sentences } of sections(markdown)) {
    for (const sentence of sentences) {
      if (definitionalOrConditional(sentence)) continue;
      for (const m of sentence.matchAll(
        /([년월일시])([간지])\s+([갑을병정무기경신임계자축인묘진사오미신유술해])(?=[\s,·)\](（]|은|는|이|가|을|를|의|도|과|와|에|만|$)/g
      )) {
        const [, pos, kind, glyph] = m;
        const isStemGlyph = STEM_GLYPHS.includes(glyph);
        if (kind === "간" !== isStemGlyph) continue;
        const p = pillarOf[pos];
        if (!p) {
          out.push({ kind: "기둥", claim: m[0], actual: `${pos}주 없음(시각 미상)` });
          continue;
        }
        const actual = kind === "간" ? p.stem.hangul : p.branch.hangul;
        if (actual !== glyph) out.push({ kind: "기둥", claim: m[0], actual: `${pos}${kind} ${actual}` });
      }
      for (const g of TEN_GOD_GROUPS) {
        for (const m of sentence.matchAll(new RegExp(`${g}\\s*(?:이|은|가|는)?\\s*(\\d+)`, "g"))) {
          const said = Number(m[1]);
          const real = chart.tenGodGroups.find((x) => x.group === g)?.count;
          if (real !== void 0 && said !== real) {
            out.push({ kind: "십성 개수", claim: `${g} ${said}`, actual: `${g} ${real}` });
          }
        }
      }
      for (const e of ELEMENTS) {
        for (const m of sentence.matchAll(
          new RegExp(`(?<!개|글자\\s|의\\s|총\\s|는\\s|은\\s)(?<![가-힣])${e}\\s*(?:이|은|가|는)?\\s*(\\d+)`, "g")
        )) {
          const said = Number(m[1]);
          const real = chart.elementCounts.find((x) => x.element === e)?.count;
          if (real !== void 0 && said !== real) {
            out.push({ kind: "오행 개수", claim: `${e} ${said}`, actual: `${e} ${real}` });
          }
        }
      }
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return out.filter((e) => {
    const k = `${e.kind}|${e.claim}|${e.actual}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
function selfContradictions(markdown) {
  const VERBS = ["드러", "투간", "통근"];
  const out = [];
  for (const { sentences } of sections(markdown)) {
    for (const sentence of sentences) {
      for (const v of VERBS) {
        const negRe = new RegExp(`${v}[^.!?]{0,6}(?:지\\s*(?:않|못)|지\\s*아니)(?!\\s*(?:하|으)?(?:면|거나))`);
        const at = sentence.search(negRe);
        if (at < 0) continue;
        const before = sentence.slice(0, at + v.length);
        const after = sentence.slice(at + v.length + 6);
        if (!new RegExp(`${v}(?![^.!?]{0,6}(?:지\\s*(?:않|못)|지\\s*아니))`).test(after)) continue;
        const shared = namedGlyphs(before).filter((g) => namedGlyphs(after).includes(g));
        if (shared.length === 0) continue;
        out.push(
          `한 문장에서 "${shared.join("·")}" 를 두고 "${v}" 를 부정하고 다시 긍정함: "${sentence.slice(0, 70)}"`
        );
        break;
      }
    }
  }
  return [...new Set(out)];
}
function citationCount(markdown) {
  return [...markdown.matchAll(/[(（]근거:/g)].length;
}
function leakySources(markdown) {
  const out = [];
  for (const m of markdown.matchAll(/[(（]근거:([^)）]*)[)）]/g)) {
    if (/[【】]|자료|항목|목록|프롬프트/.test(m[1])) out.push(m[0].slice(0, 60));
  }
  return out;
}
function unsourcedSections(markdown) {
  return claimCoverage(markdown).filter((s) => s.sentences >= 2 && s.sourced === 0).map((s) => s.title);
}
export {
  FAMOUS_BODY_PROMPT_VERSION,
  FAMOUS_BODY_SECTION_TITLES,
  FAMOUS_BODY_SYSTEM_PROMPT,
  FAMOUS_CHART_VERSION,
  buildFamousBodyUserPrompt,
  buildFamousChart,
  checkChartFacts,
  checkFamousBody,
  checkRelationClaims,
  checkRevealedClaims,
  checkRootingClaims,
  citationCount,
  claimCoverage,
  clampSemicolons,
  composeFamousBody,
  contradictsChart,
  leakySources,
  phaseDirectionErrors,
  repeatedOpenings,
  selfContradictions,
  sentenceDefects,
  ungloassedTerms,
  unsourcedSections,
  unverifiedFactClaims,
  unverifiedRelationClaims
};
