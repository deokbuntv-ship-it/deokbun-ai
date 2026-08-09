"""Validate the pinned Asia/Seoul tzdb 2026c subset and print its SHA-256.

The script deliberately performs no network I/O. Supply the officially
downloaded tzdb 2026c `asia` source file. It validates the exact post-1970 ROK
rules used by the compact runtime artifact and hashes a canonical computational
payload. It never overwrites the production artifact.
"""

import argparse
import hashlib
import json
import re
from pathlib import Path


TRANSITIONS = [
    {
        "utcEpochSeconds": 547_578_000,
        "before": {"totalOffsetSeconds": 32_400, "dstOffsetSeconds": 0, "designation": "KST"},
        "after": {"totalOffsetSeconds": 36_000, "dstOffsetSeconds": 3_600, "designation": "KDT"},
    },
    {
        "utcEpochSeconds": 560_883_600,
        "before": {"totalOffsetSeconds": 36_000, "dstOffsetSeconds": 3_600, "designation": "KDT"},
        "after": {"totalOffsetSeconds": 32_400, "dstOffsetSeconds": 0, "designation": "KST"},
    },
    {
        "utcEpochSeconds": 579_027_600,
        "before": {"totalOffsetSeconds": 32_400, "dstOffsetSeconds": 0, "designation": "KST"},
        "after": {"totalOffsetSeconds": 36_000, "dstOffsetSeconds": 3_600, "designation": "KDT"},
    },
    {
        "utcEpochSeconds": 592_333_200,
        "before": {"totalOffsetSeconds": 36_000, "dstOffsetSeconds": 3_600, "designation": "KDT"},
        "after": {"totalOffsetSeconds": 32_400, "dstOffsetSeconds": 0, "designation": "KST"},
    },
]

REQUIRED_SOURCE_PATTERNS = (
    r"(?m)^Rule\s+ROK\s+1987\s+1988\s+-\s+May\s+Sun>=8\s+2:00\s+1:00\s+D$",
    r"(?m)^Rule\s+ROK\s+1987\s+1988\s+-\s+Oct\s+Sun>=8\s+3:00\s+0\s+S$",
    r"(?m)^Zone\s+Asia/Seoul\s+8:27:52\s+-\s+LMT\s+1908\s+Apr\s+1$",
    r"(?m)^\s+9:00\s+ROK\s+K%sT$",
)


def canonical_payload():
    return {
        "artifactVersion": "iana.tzdb.2026c.asia-seoul.1970-2050.v1",
        "initialState": {
            "totalOffsetSeconds": 32_400,
            "dstOffsetSeconds": 0,
            "designation": "KST",
        },
        "resolverRuleVersion": "deokbunai.historical-timezone-resolver.v1",
        "supportedEnd": "2050-12-31",
        "supportedStart": "1970-01-01",
        "transitions": TRANSITIONS,
        "tzdbVersion": "2026c",
        "zoneId": "Asia/Seoul",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("asia_source", type=Path)
    args = parser.parse_args()
    source = args.asia_source.read_text(encoding="utf-8")
    missing = [pattern for pattern in REQUIRED_SOURCE_PATTERNS if not re.search(pattern, source)]
    if missing:
        raise RuntimeError("Pinned tzdb 2026c Asia source validation failed.")
    encoded = json.dumps(
        canonical_payload(), ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    print(hashlib.sha256(encoded).hexdigest())


if __name__ == "__main__":
    main()
