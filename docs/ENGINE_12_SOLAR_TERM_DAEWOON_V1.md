# ENGINE-12 — Solar-Term and Daewoon V1 decision record

Status: accepted for the commercial V1 engine scope recorded in this branch.

## Dirty-work reconciliation

| Existing dirty file | Classification | Decision |
|---|---|---|
| `package.json`, `package-lock.json` | KEEP | Keep the exact `lunar-javascript@1.7.7` pin and lockfile integrity. |
| `src/features/interpretation/index.ts` | REVISE | Export the accepted lunar runtime and Daewoon contracts; do not expose KASI as a competing runtime. |
| `solarTerm/contracts.ts` | REFERENCE ONLY / partial KEEP | Keep shared term ids/definitions. KASI dataset-specific types remain internal reference material. |
| `solarTerm/termDefinitions.ts` | KEEP | Canonical 24-term identity; Daewoon consumes only the 12 `JIE` entries. |
| `solarTerm/solarTermResolver.ts`, `solarTerm/validation.ts` | REFERENCE ONLY | KASI immutable-artifact experiment; not exported by the V1 runtime. |
| `solarTerm/acquisition/*` | REFERENCE ONLY | Preserve the audited probe/build path for future comparison; not a runtime dependency. |
| `solarTerm/lunarJsSolarTermAdapter.ts` | REVISE | Accepted replaceable V1 adapter; add explicit product policy and boundary diagnostics. |
| `solarTerm/lunarJsSolarTermProvider.ts` | KEEP | The only production file allowed to import `lunar-javascript`. |
| `solarTerm/lunar-javascript.d.ts` | KEEP | Narrow local declaration for the one public API used by the adapter. |
| `solarTerm/fixtures/lunarJsSolarTermGoldenFixtures.ts` | REVISE | Retain as pinned-provider characterization, not independent truth. |
| `solarTerm/lunarJsSolarTermAdapterValidation.ts` | REVISE | Retain provider regression, ordering, conversion, and determinism checks. Independent V1 checks are separate. |

No dirty file was reset or silently overwritten. KASI material remains available for future validation.

## KASI decision

**Decision: reject KASI as the V1 primary runtime authority; retain as reference-only.**

The local `OPENAPI_GUIDE_V1.4` probe returned 24 records for 2023 and 2024 but zero records for 1969, 1991, 1994, and 2051. There is no complete 1969–2051 acquisition or approved artifact. This makes the endpoint unsuitable for the required historical runtime range without further acquisition research, which is explicitly out of scope for commercial V1.

The available KASI 2023/2024 records remain useful independent minute-level comparisons. For example, KASI 2023 Lixia is 03:19 KST; the pinned library resolves 03:18:46 KST, a one-minute label difference with no product outcome change.

## Lunar runtime acceptance

**Decision: accept `lunar-javascript@1.7.7` as the canonical Solar-Term V1 runtime.**

- Exact dependency: `lunar-javascript@1.7.7`.
- License: MIT, Copyright (c) 2018 6tail; commercial use is permitted subject to preservation of the notice.
- Repository: <https://github.com/6tail/lunar-javascript>.
- Package lock: exact tarball plus npm SHA-512 integrity is committed.
- Runtime: local, deterministic, no network or paid API.
- Isolation: only `lunarJsSolarTermProvider.ts` imports the package; downstream code receives DeokbunAI contracts.
- Provider time basis: fixed UTC+8 civil timestamps. The adapter converts normalized UTC instants to/from that basis exactly once.
- V1 rule version: `deokbunai.solar-term.v1`.
- Adapter rule version: `deokbunai.solar-term-lunarjs-adapter.v1`.

## Practical independent validation

Independent minute fixtures are recorded in `independentSolarTermFixtures.ts`:

- NAOJ 1991 Shousho and Hakuro, long-term ephemeris: <https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy_en.cgi?year=1991>
- NAOJ 2024 Shoukan and Rikka: <https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy_en.cgi?year=2024>
- NAOJ official 2024 calendar requirements: <https://eco.mtk.nao.ac.jp/koyomi/yoko/2024/rekiyou242.html>
- Local KASI 2023 acquisition from `get24DivisionsInfo`, guide V1.4.

The acceptance tolerance is one minute. It is intended to detect the wrong day/hour, timezone errors, wrong ordering, and materially different boundaries—not sub-minute astronomy differences.

## Canonical Solar-Term policy

- Supported birth range: **1970-01-01 through 2050-12-31**, matching the pinned Asia/Seoul timezone authority used by the deterministic engine.
- V1 timezone: **Asia/Seoul only**. Other zones fail closed until their historical timezone policy is validated.
- Daewoon boundary: nearest directional **Jie** (`getNextJie` for forward, `getPrevJie` for reverse). Zhongqi is rejected.
- Internal timestamp: preserve provider seconds and normalize to UTC epoch seconds.
- Product comparison precision: UTC minute.
- A birth in the same UTC minute as a Jie boundary is `AMBIGUOUS`; no exact start age is emitted.
- Seconds outside that boundary minute are retained but are not presented as astronomical certainty.

## Canonical Daewoon policy

- Rule version: `deokbunai.saju-daewoon.v1`.
- Direction: yang-year male and yin-year female are forward; yang-year female and yin-year male are reverse. Yin/yang is derived from the canonical Saju year stem.
- Progression: start one sexagenary step from the canonical Saju month pillar in the selected direction; each cycle spans ten displayed ages.
- Interval: normalized birth UTC instant to the nearest directional Jie.
- Start offset: mature implementation's minute-based `sect=2` convention—4320 minutes = 1 symbolic year, 360 = 1 symbolic month, 12 = 1 symbolic day, remaining minute = 2 symbolic hours.
- Start timing: add that symbolic offset to the normalized Asia/Seoul birth civil time.
- Display start age: positive raw interval years rounded to the nearest whole year, half upward (`floor(raw + 0.5)`). Raw age, source minutes, detailed symbolic offset, and derived timing remain in the contract.
- Cycle count: ten cycles, generated from DeokbunAI sexagenary primitives rather than third-party DaYun objects.

Alternatives recorded but not selected: the provider's time-branch `sect=1` start convention and pure floor/ceiling whole-age presentation. V1 selects minute decomposition plus nearest whole-year display because it is deterministic, preserves detailed timing, matches the recovered helper behavior, and is supported by the mature pinned implementation.

## Capability and known limitations

- Exact, uniquely resolved Asia/Seoul time in range: `AVAILABLE`.
- Approximate birth time or ambiguous local time: `AMBIGUOUS`.
- Unknown time, nonexistent/unresolved local time, unsupported timezone/range, unspecified gender, invalid pillars, or provider failure: `UNAVAILABLE`.
- The Saju month pillar remains the existing DeokbunAI canonical month pillar. ENGINE-12 does not change frozen Saju pillar semantics.
- The symbolic start date is a rule-derived timing label, not an astronomical or legal-time prediction.
- Dates outside V1 range and overseas historical timezone behavior intentionally fail closed.
