import hashlib
import json
import re
from collections import Counter
from datetime import date, timedelta
from pathlib import Path


WORKTREE = Path(r"C:\Development\DeokbunAI-engine")
ACQUISITION = Path(
    r"C:\Development\DeokbunAI-engine-acquisition\kasi-calendar-daily.json"
)
REFERENCE = WORKTREE / ".reference" / "engine08-calendar"
OUTPUT = WORKTREE / "src" / "features" / "interpretation" / "calendar"


def compact_json(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def iso_date(value):
    return date(value["year"], value["month"], value["day"])


def ts_date(value):
    return f"{{ year: {value['year']}, month: {value['month']}, day: {value['day']} }}"


def lunar_key(value):
    return (value["year"], value["month"], value["lunarMonthKind"])


def classified_counts(counter):
    return {
        name: counter.get(name, 0)
        for name in (
            "MATCH",
            "LEGACY_DIFF",
            "LEGACY_CORRUPT",
            "OUT_OF_LEGACY_RANGE",
            "AUTHORITATIVE_UNRESOLVED",
        )
    }


data = json.loads(ACQUISITION.read_text(encoding="utf-8"))
rows = data["rows"]
if data["rowCount"] != len(rows):
    raise RuntimeError("Acquisition rowCount mismatch.")

expected_start = date(1900, 1, 1)
expected_end = date(2050, 12, 31)
if len(rows) != (expected_end - expected_start).days + 1:
    raise RuntimeError("Acquisition coverage count mismatch.")

seen_gregorian = set()
previous = None
month_rows = {}
for index, row in enumerate(rows):
    gregorian = iso_date(row["gregorianDate"])
    lunar = row["lunarDate"]
    length = row["lunarMonthLengthDays"]
    if gregorian in seen_gregorian:
        raise RuntimeError(f"Duplicate Gregorian date at row {index}.")
    if previous is not None and gregorian != previous + timedelta(days=1):
        raise RuntimeError(f"Gregorian continuity failure at row {index}.")
    if lunar["lunarMonthKind"] not in ("REGULAR", "LEAP"):
        raise RuntimeError(f"Unexpected lunar month kind at row {index}.")
    if length not in (29, 30) or not 1 <= lunar["day"] <= length:
        raise RuntimeError(f"Invalid lunar date at row {index}.")
    seen_gregorian.add(gregorian)
    previous = gregorian
    key = lunar_key(lunar)
    occurrence = month_rows.setdefault(key, [])
    occurrence.append(row)

if min(seen_gregorian) != expected_start or max(seen_gregorian) != expected_end:
    raise RuntimeError("Acquisition boundary mismatch.")

records = []
for key, occurrence in month_rows.items():
    first = occurrence[0]
    lunar = first["lunarDate"]
    declared_lengths = {item["lunarMonthLengthDays"] for item in occurrence}
    if len(declared_lengths) != 1:
        raise RuntimeError(f"Inconsistent month length for {key}.")
    if lunar["day"] != 1:
        raise RuntimeError(f"Acquisition does not contain month start for {key}.")
    records.append(
        {
            "lunarYear": lunar["year"],
            "lunarMonth": lunar["month"],
            "lunarMonthKind": lunar["lunarMonthKind"],
            "gregorianStartDate": first["gregorianDate"],
            "lengthDays": first["lunarMonthLengthDays"],
        }
    )

records.sort(key=lambda item: iso_date(item["gregorianStartDate"]))
for left, right in zip(records, records[1:]):
    expected = iso_date(left["gregorianStartDate"]) + timedelta(days=left["lengthDays"])
    if iso_date(right["gregorianStartDate"]) != expected:
        raise RuntimeError("Compact month starts are not contiguous.")

artifact_start = iso_date(records[0]["gregorianStartDate"])
artifact_end = iso_date(records[-1]["gregorianStartDate"]) + timedelta(
    days=records[-1]["lengthDays"] - 1
)
canonical_records = compact_json(records)
checksum = hashlib.sha256(canonical_records.encode("utf-8")).hexdigest()
acquisition_stamp = data["acquiredAtUtc"].replace("-", "").replace(":", "")[:15]
dataset_version = (
    f"kasi.lunisolar.1900-2050.acquired-{acquisition_stamp.lower()}.sha256-{checksum[:12]}"
)

manifest = {
    "schemaVersion": "deokbunai.lunisolar-month-dataset.v1",
    "datasetVersion": dataset_version,
    "source": {
        "identity": "KASI_LRSR_CLD_INFO_SERVICE_GET_LUN_CAL_INFO",
        "revision": "OPENAPI_GUIDE_V1.1",
        "acquisitionDate": data["acquiredAtUtc"],
    },
    "artifactChecksum": {"algorithm": "SHA-256", "value": checksum},
    "supportedGregorianRange": {
        "start": {"year": 1900, "month": 1, "day": 1},
        "end": {"year": 2050, "month": 12, "day": 31},
    },
    "supportedLunarRange": {
        "start": {
            "lunarYear": rows[0]["lunarDate"]["year"],
            "lunarMonth": rows[0]["lunarDate"]["month"],
            "lunarMonthKind": rows[0]["lunarDate"]["lunarMonthKind"],
            "lunarDay": rows[0]["lunarDate"]["day"],
        },
        "end": {
            "lunarYear": rows[-1]["lunarDate"]["year"],
            "lunarMonth": rows[-1]["lunarDate"]["month"],
            "lunarMonthKind": rows[-1]["lunarDate"]["lunarMonthKind"],
            "lunarDay": rows[-1]["lunarDate"]["day"],
        },
    },
    "artifactCoverageRange": {
        "start": {"year": artifact_start.year, "month": artifact_start.month, "day": artifact_start.day},
        "end": {"year": artifact_end.year, "month": artifact_end.month, "day": artifact_end.day},
    },
    "recordCount": len(records),
    "conversionRuleVersion": "deokbunai.gregorian-lunar-table.v1",
}


def parse_legacy_sql():
    pattern = re.compile(
        r'VALUES\("\d+","(\d{4})(\d{2})(\d{2})","(\d{4})(\d{2})(\d{2})","([01])",'
    )
    parsed = {}
    for line in (REFERENCE / "_db2" / "LunarToSolar.sql").read_text(
        encoding="utf-8", errors="replace"
    ).splitlines():
        match = pattern.search(line)
        if not match:
            continue
        ly, lm, ld, gy, gm, gd, leap = map(int, match.groups())
        gregorian = date(gy, gm, gd)
        parsed[gregorian] = (ly, lm, ld, "LEAP" if leap else "REGULAR")
    return parsed


kasi_daily = {
    iso_date(row["gregorianDate"]): (
        row["lunarDate"]["year"],
        row["lunarDate"]["month"],
        row["lunarDate"]["day"],
        row["lunarDate"]["lunarMonthKind"],
    )
    for row in rows
}
legacy_daily = parse_legacy_sql()
sql_counts = Counter()
sql_samples = []
sql_diff_dates = []
for gregorian, authoritative in kasi_daily.items():
    legacy = legacy_daily.get(gregorian)
    if legacy is None:
        sql_counts["OUT_OF_LEGACY_RANGE"] += 1
    elif legacy == authoritative:
        sql_counts["MATCH"] += 1
    else:
        sql_counts["LEGACY_DIFF"] += 1
        sql_diff_dates.append(gregorian)
        if len(sql_samples) < 20:
            sql_samples.append(
                {"gregorianDate": gregorian.isoformat(), "kasi": authoritative, "legacy": legacy}
            )

sql_diff_ranges = []
if sql_diff_dates:
    range_start = previous_date = sql_diff_dates[0]
    for current_date in sql_diff_dates[1:]:
        if current_date != previous_date + timedelta(days=1):
            sql_diff_ranges.append(
                {
                    "start": range_start.isoformat(),
                    "end": previous_date.isoformat(),
                    "dayCount": (previous_date - range_start).days + 1,
                }
            )
            range_start = current_date
        previous_date = current_date
    sql_diff_ranges.append(
        {
            "start": range_start.isoformat(),
            "end": previous_date.isoformat(),
            "dayCount": (previous_date - range_start).days + 1,
        }
    )

legacy_month_occurrences = {}
for gregorian, lunar in legacy_daily.items():
    key = (lunar[0], lunar[1], lunar[3])
    occurrence = legacy_month_occurrences.setdefault(key, {"dates": [], "days": []})
    occurrence["dates"].append(gregorian)
    occurrence["days"].append(lunar[2])
legacy_month_metadata = {
    key: (min(value["dates"]), max(value["days"]))
    for key, value in legacy_month_occurrences.items()
}
kasi_month_metadata = {
    (r["lunarYear"], r["lunarMonth"], r["lunarMonthKind"]):
        (iso_date(r["gregorianStartDate"]), r["lengthDays"])
    for r in records
}
sql_month_counts = Counter()
sql_month_samples = []
for key in sorted(kasi_month_metadata):
    authoritative = kasi_month_metadata.get(key)
    legacy = legacy_month_metadata.get(key)
    if authoritative is None or legacy is None:
        sql_month_counts["OUT_OF_LEGACY_RANGE"] += 1
    elif authoritative == legacy:
        sql_month_counts["MATCH"] += 1
    else:
        sql_month_counts["LEGACY_DIFF"] += 1
        if len(sql_month_samples) < 20:
            sql_month_samples.append(
                {
                    "key": key,
                    "kasi": {"start": authoritative[0].isoformat(), "lengthDays": authoritative[1]},
                    "legacy": {"start": legacy[0].isoformat(), "lengthDays": legacy[1]},
                }
            )


def parse_suntolun():
    parsed = {}
    for line in (REFERENCE / "UNSE_DATA" / "data" / "suntolun.dat").read_text(
        encoding="utf-8"
    ).splitlines():
        year_text, digits = line.split("=", 1)
        year = int(year_text)
        month = 0
        for digit in digits:
            value = int(digit)
            if value == 0:
                continue
            if value <= 2:
                month += 1
                kind = "REGULAR"
                length = 28 + value
            else:
                kind = "LEAP"
                length = 26 + value
            parsed[(year, month, kind)] = length
    return parsed


kasi_months = {
    (r["lunarYear"], r["lunarMonth"], r["lunarMonthKind"]): r["lengthDays"]
    for r in records
}
legacy_months = parse_suntolun()
suntolun_counts = Counter()
suntolun_samples = []
all_month_keys = sorted(kasi_months)
for key in all_month_keys:
    authoritative = kasi_months.get(key)
    legacy = legacy_months.get(key)
    if authoritative is None or legacy is None:
        suntolun_counts["OUT_OF_LEGACY_RANGE"] += 1
    elif authoritative == legacy:
        suntolun_counts["MATCH"] += 1
    else:
        suntolun_counts["LEGACY_DIFF"] += 1
        if len(suntolun_samples) < 20:
            suntolun_samples.append({"key": key, "kasi": authoritative, "legacy": legacy})


yun_pattern = re.compile(r"^(\d{4})/(\d{1,2})/(\d{1,2})\|(\d{4})/(\d{1,2})/(\d{1,2})$")
yun_counts = Counter()
yun_samples = []
for line_number, line in enumerate(
    (REFERENCE / "UNSE_DATA" / "data" / "YunDat.dat").read_text(encoding="utf-8").splitlines(),
    start=1,
):
    match = yun_pattern.match(line.strip())
    if not match:
        yun_counts["LEGACY_CORRUPT"] += 1
        continue
    ly, lm, ld, gy, gm, gd = map(int, match.groups())
    gregorian = date(gy, gm, gd)
    authoritative = kasi_daily.get(gregorian)
    if authoritative is None:
        yun_counts["AUTHORITATIVE_UNRESOLVED"] += 1
    elif authoritative == (ly, lm, ld, "LEAP"):
        yun_counts["MATCH"] += 1
    else:
        yun_counts["LEGACY_DIFF"] += 1
        if len(yun_samples) < 20:
            yun_samples.append(
                {
                    "line": line_number,
                    "gregorianDate": gregorian.isoformat(),
                    "kasi": authoritative,
                    "legacy": (ly, lm, ld, "LEAP"),
                }
            )


def row_for_gregorian(year, month, day):
    target = date(year, month, day)
    index = (target - expected_start).days
    return rows[index]


def fixture(identifier, kind, row):
    return {
        "id": identifier,
        "kind": kind,
        "gregorianDate": row["gregorianDate"],
        "lunarDate": row["lunarDate"],
    }


new_year = next(
    row for row in rows if row["gregorianDate"]["year"] == 2024 and row["lunarDate"]["month"] == 1 and row["lunarDate"]["day"] == 1
)
new_year_date = iso_date(new_year["gregorianDate"])
new_year_index = (new_year_date - expected_start).days
leap_start_index = next(
    index
    for index, row in enumerate(rows)
    if row["gregorianDate"] == {"year": 2023, "month": 3, "day": 22}
)
leap_length = rows[leap_start_index]["lunarMonthLengthDays"]
month_29 = next(r for r in records if r["lengthDays"] == 29 and r["lunarYear"] >= 2020)
month_30 = next(r for r in records if r["lengthDays"] == 30 and r["lunarYear"] >= 2020)

fixtures = [
    fixture("gregorian-january-to-previous-lunar-november", "JANUARY_PREVIOUS_LUNAR_NOVEMBER", next(r for r in rows if r["gregorianDate"]["month"] == 1 and r["lunarDate"]["month"] == 11 and r["lunarDate"]["year"] == r["gregorianDate"]["year"] - 1)),
    fixture("gregorian-january-to-previous-lunar-december", "JANUARY_PREVIOUS_LUNAR_DECEMBER", next(r for r in rows if r["gregorianDate"]["month"] == 1 and r["lunarDate"]["month"] == 12 and r["lunarDate"]["year"] == r["gregorianDate"]["year"] - 1)),
    fixture("lunar-new-year-before", "LUNAR_NEW_YEAR_BEFORE", rows[new_year_index - 1]),
    fixture("lunar-new-year-day", "LUNAR_NEW_YEAR_DAY", rows[new_year_index]),
    fixture("lunar-new-year-after", "LUNAR_NEW_YEAR_AFTER", rows[new_year_index + 1]),
    fixture("lunar-year-boundary", "LUNAR_YEAR_BOUNDARY", rows[new_year_index]),
    fixture("regular-month", "REGULAR_MONTH", row_for_gregorian(2023, 3, 1)),
    fixture("leap-month-first-day", "LEAP_MONTH_FIRST_DAY", rows[leap_start_index]),
    fixture("leap-month-last-day", "LEAP_MONTH_LAST_DAY", rows[leap_start_index + leap_length - 1]),
    fixture("29-day-month-last-day", "MONTH_29_LAST_DAY", row_for_gregorian(*(iso_date(month_29["gregorianStartDate"]) + timedelta(days=28)).timetuple()[:3])),
    fixture("30-day-month-last-day", "MONTH_30_LAST_DAY", row_for_gregorian(*(iso_date(month_30["gregorianStartDate"]) + timedelta(days=29)).timetuple()[:3])),
    fixture("gregorian-leap-day", "GREGORIAN_LEAP_DAY", row_for_gregorian(2024, 2, 29)),
    fixture("v1-first-supported-day", "SUPPORTED_RANGE_START", rows[0]),
    fixture("v1-last-supported-day", "SUPPORTED_RANGE_END", rows[-1]),
    fixture("same-real-date-bidirectional", "BIDIRECTIONAL_SAME_REAL_DATE", rows[leap_start_index]),
]

report = {
    "schemaVersion": "deokbunai.legacy-calendar-diff.v1",
    "authority": manifest["source"],
    "datasetVersion": dataset_version,
    "lunarToSolarSql": {
        "dailyCounts": classified_counts(sql_counts),
        "dailyDiffRanges": sql_diff_ranges,
        "dailySamples": sql_samples,
        "monthMetadataCounts": classified_counts(sql_month_counts),
        "monthMetadataSamples": sql_month_samples,
    },
    "suntolunDat": {"counts": classified_counts(suntolun_counts), "samples": suntolun_samples},
    "yunDat": {"counts": classified_counts(yun_counts), "samples": yun_samples},
}

data_dir = OUTPUT / "data"
fixture_dir = OUTPUT / "fixtures"
report_dir = OUTPUT / "reports"
data_dir.mkdir(parents=True, exist_ok=True)
fixture_dir.mkdir(parents=True, exist_ok=True)
report_dir.mkdir(parents=True, exist_ok=True)

record_lines = []
for record in records:
    record_lines.append(
        "  { lunarYear: %d, lunarMonth: %d, lunarMonthKind: '%s', gregorianStartDate: %s, lengthDays: %d },"
        % (
            record["lunarYear"],
            record["lunarMonth"],
            record["lunarMonthKind"],
            ts_date(record["gregorianStartDate"]),
            record["lengthDays"],
        )
    )

manifest_json = json.dumps(manifest, ensure_ascii=False, indent=2)
artifact_ts = f"""import type {{ CalendarDataset }} from '../contracts';

// Generated from the KASI audit acquisition identified in the manifest.
// The raw daily acquisition and service key are intentionally not embedded.
export const KASI_CALENDAR_MANIFEST = {manifest_json} as const;

export const KASI_LUNAR_MONTH_RECORDS = [
{chr(10).join(record_lines)}
] as const;

export const KASI_CALENDAR_DATASET = {{
  manifest: KASI_CALENDAR_MANIFEST,
  records: KASI_LUNAR_MONTH_RECORDS,
}} satisfies CalendarDataset;
"""
(data_dir / "kasiCalendarV1.ts").write_text(artifact_ts, encoding="utf-8", newline="\n")

fixture_lines = []
for item in fixtures:
    fixture_lines.append(
        "  { id: '%s', kind: '%s', gregorianDate: %s, lunarDate: { year: %d, month: %d, day: %d, lunarMonthKind: '%s' } },"
        % (
            item["id"],
            item["kind"],
            ts_date(item["gregorianDate"]),
            item["lunarDate"]["year"],
            item["lunarDate"]["month"],
            item["lunarDate"]["day"],
            item["lunarDate"]["lunarMonthKind"],
        )
    )
fixtures_ts = f"""import type {{ LocalDate }} from '../../domain/time';
import type {{ LunarMonthKind }} from '../contracts';

export type KasiCalendarGoldenFixture = {{
  id: string;
  kind: string;
  gregorianDate: LocalDate;
  lunarDate: LocalDate & {{ lunarMonthKind: LunarMonthKind }};
}};

// Authoritative fixtures selected from the KASI acquisition, not legacy data.
export const KASI_CALENDAR_GOLDEN_FIXTURES: readonly KasiCalendarGoldenFixture[] = [
{chr(10).join(fixture_lines)}
];
"""
(fixture_dir / "kasiCalendarGoldenFixtures.ts").write_text(
    fixtures_ts, encoding="utf-8", newline="\n"
)
(report_dir / "engine08bLegacyDiff.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8", newline="\n"
)

print(f"KASI_DAILY_ROWS={len(rows)}")
print(f"MONTH_RECORDS={len(records)}")
print(f"REGULAR_MONTHS={sum(1 for r in records if r['lunarMonthKind']=='REGULAR')}")
print(f"LEAP_MONTHS={sum(1 for r in records if r['lunarMonthKind']=='LEAP')}")
print(f"ARTIFACT_START={artifact_start.isoformat()}")
print(f"ARTIFACT_END={artifact_end.isoformat()}")
print(f"SUPPORTED_LUNAR_START={manifest['supportedLunarRange']['start']}")
print(f"SUPPORTED_LUNAR_END={manifest['supportedLunarRange']['end']}")
print(f"SHA256={checksum}")
print(f"DATASET_VERSION={dataset_version}")
print(f"SQL_DIFF={dict(sql_counts)}")
print(f"SQL_MONTH_DIFF={dict(sql_month_counts)}")
print(f"SQL_DIFF_RANGES={len(sql_diff_ranges)}")
print(f"SUNTOLUN_DIFF={dict(suntolun_counts)}")
print(f"YUNDAT_DIFF={dict(yun_counts)}")
print(f"GOLDEN_FIXTURES={len(fixtures)}")
