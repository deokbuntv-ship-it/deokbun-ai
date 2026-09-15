"""Build a pending immutable KASI solar-term artifact from audited raw acquisition.

This script performs no network I/O. It refuses to infer source time semantics:
the caller must explicitly confirm the fixed KST basis and minute precision after
an actual probe. The generated candidate remains PENDING_CTO_APPROVAL and is not
exported by the runtime entrypoint until independent NAOJ comparison is complete.
"""

import argparse
import hashlib
import json
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path


EXPECTED_START_YEAR = 1969
EXPECTED_END_YEAR = 2051
EXPECTED_RECORDS = (EXPECTED_END_YEAR - EXPECTED_START_YEAR + 1) * 24
KASI_OFFSET_SECONDS = 32_400
TZDB_ARTIFACT_VERSION = "iana.tzdb.2026c.asia-seoul.1970-2050.v1"
ENDPOINT = (
    "https://apis.data.go.kr/B090041/openapi/service/"
    "SpcdeInfoService/get24DivisionsInfo"
)

TERM_DEFINITIONS = (
    ("MINOR_COLD", "소한", 285),
    ("MAJOR_COLD", "대한", 300),
    ("START_OF_SPRING", "입춘", 315),
    ("RAIN_WATER", "우수", 330),
    ("AWAKENING_OF_INSECTS", "경칩", 345),
    ("SPRING_EQUINOX", "춘분", 0),
    ("PURE_BRIGHTNESS", "청명", 15),
    ("GRAIN_RAIN", "곡우", 30),
    ("START_OF_SUMMER", "입하", 45),
    ("GRAIN_FULL", "소만", 60),
    ("GRAIN_IN_EAR", "망종", 75),
    ("SUMMER_SOLSTICE", "하지", 90),
    ("MINOR_HEAT", "소서", 105),
    ("MAJOR_HEAT", "대서", 120),
    ("START_OF_AUTUMN", "입추", 135),
    ("END_OF_HEAT", "처서", 150),
    ("WHITE_DEW", "백로", 165),
    ("AUTUMN_EQUINOX", "추분", 180),
    ("COLD_DEW", "한로", 195),
    ("FROST_DESCENT", "상강", 210),
    ("START_OF_WINTER", "입동", 225),
    ("MINOR_SNOW", "소설", 240),
    ("MAJOR_SNOW", "대설", 255),
    ("WINTER_SOLSTICE", "동지", 270),
)
TERM_BY_NAME = {
    korean_name: (term_id, longitude, order)
    for order, (term_id, korean_name, longitude) in enumerate(TERM_DEFINITIONS)
}

# Exact compact transitions from the pinned, separately validated tzdb 2026c artifact.
TZDB_TRANSITIONS = (
    (547_578_000, 36_000, 3_600),
    (560_883_600, 32_400, 0),
    (579_027_600, 36_000, 3_600),
    (592_333_200, 32_400, 0),
)


def compact_json(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def parse_source_minute(locdate, kst):
    date_text = str(locdate).strip()
    time_text = str(kst).strip()
    if not re.fullmatch(r"\d{8}", date_text):
        raise RuntimeError("KASI locdate must be exactly eight digits.")
    if not re.fullmatch(r"\d{4}", time_text):
        raise RuntimeError("KASI kst must be exactly four digits.")
    value = datetime.strptime(date_text + time_text, "%Y%m%d%H%M")
    return value


def civil_minute(value):
    return {
        "date": {"year": value.year, "month": value.month, "day": value.day},
        "hour": value.hour,
        "minute": value.minute,
    }


def epoch_minute(value):
    utc_value = value.replace(tzinfo=timezone(timedelta(seconds=KASI_OFFSET_SECONDS))).astimezone(
        timezone.utc
    )
    return int(utc_value.timestamp() // 60)


def timezone_state(utc_epoch_minute):
    total_offset = 32_400
    dst_offset = 0
    for transition_epoch_seconds, after_total, after_dst in TZDB_TRANSITIONS:
        if utc_epoch_minute * 60 < transition_epoch_seconds:
            break
        total_offset = after_total
        dst_offset = after_dst
    return total_offset, dst_offset


def legal_civil_resolution(year, utc_epoch_minute):
    if year < 1970 or year > 2050:
        return {
            "status": "UNRESOLVED",
            "zoneId": "Asia/Seoul",
            "reason": "OUTSIDE_PINNED_TIMEZONE_RANGE",
            "timezoneDataVersion": TZDB_ARTIFACT_VERSION,
        }
    total_offset, dst_offset = timezone_state(utc_epoch_minute)
    legal = datetime(1970, 1, 1) + timedelta(
        minutes=utc_epoch_minute + total_offset // 60
    )
    return {
        "status": "RESOLVED",
        "zoneId": "Asia/Seoul",
        "civilMinute": civil_minute(legal),
        "totalOffsetSeconds": total_offset,
        "dstOffsetSeconds": dst_offset,
        "timezoneDataVersion": TZDB_ARTIFACT_VERSION,
    }


def normalize_record(year_result, raw_record, acquired_at):
    fields = raw_record.get("fields")
    if not isinstance(fields, dict):
        raise RuntimeError("KASI acquisition record fields are unavailable.")
    missing = {"dateName", "locdate", "kst"} - fields.keys()
    if missing:
        raise RuntimeError("KASI acquisition record is missing required fields.")

    name = str(fields["dateName"]).strip()
    definition = TERM_BY_NAME.get(name)
    if definition is None:
        raise RuntimeError(f"Unknown KASI solar-term name in year {year_result['requestedYear']}.")
    term_id, longitude, order = definition
    source_minute = parse_source_minute(fields["locdate"], fields["kst"])
    year = int(year_result["requestedYear"])
    if source_minute.year != year:
        raise RuntimeError("KASI locdate year does not match the requested year.")
    utc_epoch_minute = epoch_minute(source_minute)
    record_hash = sha256(compact_json(fields))
    return order, {
        "termId": term_id,
        "year": year,
        "solarLongitudeDegrees": longitude,
        "sourceTimestamp": {
            "civilMinute": civil_minute(source_minute),
            "timeBasis": "KASI_FIXED_KST_UTC_PLUS_09",
            "offsetSeconds": KASI_OFFSET_SECONDS,
            "precision": "MINUTE",
            "sourceRounding": "UNSPECIFIED",
        },
        "utcResolution": {
            "kind": "UTC_MINUTE_LABEL",
            "epochMinute": utc_epoch_minute,
            "precision": "MINUTE",
            "sourceRounding": "UNSPECIFIED",
        },
        "legalCivilResolution": legal_civil_resolution(year, utc_epoch_minute),
        "provenance": {
            "provider": "KASI",
            "operation": "get24DivisionsInfo",
            "endpoint": ENDPOINT,
            "sourceRevision": "OPENAPI_GUIDE_V1.4",
            "acquiredAtUtc": acquired_at,
            "sourceRecordHash": {"algorithm": "SHA-256", "value": record_hash},
        },
    }


def build(raw):
    if raw.get("acquisitionSchemaVersion") != "deokbunai.kasi-solar-term-acquisition.v1":
        raise RuntimeError("Unsupported KASI acquisition schema.")
    if raw.get("mode") != "ACQUIRE":
        raise RuntimeError("A PROBE response cannot be promoted to an artifact.")
    if raw.get("source", {}).get("endpoint") != ENDPOINT:
        raise RuntimeError("Unexpected KASI endpoint in acquisition provenance.")
    results = raw.get("results")
    if not isinstance(results, list) or len(results) != EXPECTED_END_YEAR - EXPECTED_START_YEAR + 1:
        raise RuntimeError("KASI acquisition year coverage mismatch.")

    acquired_at = raw.get("acquiredAtUtc")
    if not isinstance(acquired_at, str) or not acquired_at:
        raise RuntimeError("KASI acquisition timestamp is unavailable.")
    records = []
    seen = set()
    for year_result in results:
        year = int(year_result.get("requestedYear"))
        expected_year = EXPECTED_START_YEAR + len(records) // 24
        if year != expected_year or year_result.get("resultCode") != "00":
            raise RuntimeError("KASI acquisition year ordering or status mismatch.")
        raw_records = year_result.get("records")
        if not isinstance(raw_records, list) or len(raw_records) != 24:
            raise RuntimeError(f"KASI year {year} does not contain 24 records.")
        normalized = [normalize_record(year_result, item, acquired_at) for item in raw_records]
        normalized.sort(key=lambda item: item[0])
        if [item[0] for item in normalized] != list(range(24)):
            raise RuntimeError(f"KASI year {year} has duplicate or missing solar terms.")
        for _, record in normalized:
            key = (record["year"], record["termId"])
            if key in seen:
                raise RuntimeError("Duplicate normalized solar-term key.")
            seen.add(key)
            records.append(record)

    if len(records) != EXPECTED_RECORDS:
        raise RuntimeError("Normalized KASI artifact record count mismatch.")
    checksum = sha256(compact_json(records))
    acquisition_day = acquired_at[:10].replace("-", "")
    dataset_version = (
        f"kasi.solar-terms.1969-2051.acquired-{acquisition_day}.sha256-{checksum[:12]}"
    )
    manifest = {
        "schemaVersion": "deokbunai.solar-term-dataset.v1",
        "datasetVersion": dataset_version,
        "supportedBirthRange": {
            "start": {"year": 1970, "month": 1, "day": 1},
            "end": {"year": 2050, "month": 12, "day": 31},
        },
        "artifactCoverageRange": {
            "start": {"year": 1969, "month": 1, "day": 1},
            "end": {"year": 2051, "month": 12, "day": 31},
        },
        "recordCount": len(records),
        "source": {
            "provider": "KASI",
            "operation": "get24DivisionsInfo",
            "endpoint": ENDPOINT,
            "apiGuideVersion": "OPENAPI_GUIDE_V1.4",
            "publicDataPortalRevisionDate": "2023-03-29",
        },
        "acquiredAtUtc": acquired_at,
        "canonicalSerializationVersion": "deokbunai.solar-term-canonical-json.v1",
        "artifactChecksum": {"algorithm": "SHA-256", "value": checksum},
        "timezoneAuthority": {
            "zoneId": "Asia/Seoul",
            "dataVersion": TZDB_ARTIFACT_VERSION,
        },
        "crossValidation": {
            "status": "NOT_RUN",
            "comparedRecordCount": 0,
            "mismatchCount": 0,
            "verificationSource": "NAOJ",
            "verificationRevision": "UNVERIFIED",
        },
        "approvalStatus": "PENDING_CTO_APPROVAL",
    }
    return manifest, records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("raw_acquisition", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--confirmed-time-basis",
        required=True,
        choices=("KASI_FIXED_KST_UTC_PLUS_09",),
    )
    parser.add_argument(
        "--confirmed-precision",
        required=True,
        choices=("MINUTE",),
    )
    args = parser.parse_args()

    raw = json.loads(args.raw_acquisition.read_text(encoding="utf-8"))
    manifest, records = build(raw)
    artifact = {"manifest": manifest, "records": records}
    source = (
        "import type { SolarTermDataset } from '../contracts';\n\n"
        "// Generated from audited KASI acquisition. Raw responses and ServiceKey are excluded.\n"
        "// This candidate is fail-closed until NAOJ comparison and CTO approval are complete.\n"
        f"export const KASI_SOLAR_TERM_DATASET = {json.dumps(artifact, ensure_ascii=False, indent=2)} "
        "as const satisfies SolarTermDataset;\n"
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(source, encoding="utf-8", newline="\n")
    print(f"RECORD_COUNT={len(records)}")
    print(f"DATASET_VERSION={manifest['datasetVersion']}")
    print(f"ARTIFACT_SHA256={manifest['artifactChecksum']['value']}")
    print("APPROVAL_STATUS=PENDING_CTO_APPROVAL")


if __name__ == "__main__":
    main()
