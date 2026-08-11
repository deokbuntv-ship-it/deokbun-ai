# 자미두수 — SCHOOL / RULE-SET DIFFERENCES (iztro reuse)

> Directive §12. DeokbunAI's 자미두수 Core is **iztro@2.5.8** (MIT), consumed only
> through `src/features/ziwei/adapters/iztroAdapter.ts`. iztro exposes school/rule
> knobs via `astro.config({...})`. **DeokbunAI currently pins iztro's DEFAULT rule
> set** (we do NOT call `astro.config()`; the exact version pin fixes behavior).
> `ruleSetVersion = "iztro-default@2.5.8"` is stamped on every `ZiweiChart`.
>
> **LIBRARY ≠ TRUTH (§13):** iztro producing a value is NOT proof of correctness.
> Items below marked UNVERIFIED / DECISION_REQUIRED must be cross-checked against
> an independent reference and a chosen lineage before they are treated as
> authoritative. No value here was hand-derived by Claude as ground truth.

## iztro configurable knobs (v2.5.8)

`astro.config({ algorithm, yearDivide, ageDivide, horoscopeDivide, dayDivide, mutagens, brightness })`

| knob | values | meaning |
|---|---|---|
| `algorithm` | `'default'` \| `'zhongzhou'` | overall 排盤 algorithm / lineage (中州派 vs default) |
| `yearDivide` | `'exact'` \| `'normal'` | year boundary: 입춘(exact 절기) vs 정월(normal) for the year 干支 |
| `ageDivide` | `'normal'` \| `'birthday'` | how nominal age (虚岁) is counted |
| `horoscopeDivide` | `'exact'` \| `'normal'` | 운한 boundary basis |
| `dayDivide` | `'forward'` \| `'current'` | 晚子時 day rollover handling |
| `mutagens` | per-年干 overrides | 四化 table overrides |
| `brightness` | per-star overrides | 星耀 밝기 table overrides |

## Difference register

| Rule | iztro (default) behavior | Alternative school | Difference | DeokbunAI choice | Status |
|---|---|---|---|---|---|
| Overall 排盤 algorithm | `algorithm:'default'` | `'zhongzhou'` (中州派) | Some star/四化 placements differ between algorithms | **default (pinned)** | **DECISION_REQUIRED** — confirm canonical lineage w/ Owner |
| 年干 boundary (년주) | `yearDivide` default | 입춘 기준(exact) vs 정월 기준(normal) | Affects the year stem near 입춘 → 四化 by 年干 | iztro default | **DECISION_REQUIRED** |
| 四化 table (化祿權科忌) | iztro default 年干→星 map | lineage-specific (특히 化忌 differs) | Which star gets which 四化 per 年干 | iztro default | **SCHOOL_DEPENDENT** |
| 윤달(leap month) | `fixLeap:true` (前半→이전달, 後半→다음달) | fixLeap:false (leap month as-is) | Month index for a leap-month birth | **fixLeap:true** | **SCHOOL_DEPENDENT** |
| 晚子時 (23:00–24:00) | timeIndex 12; `dayDivide` default | day rollover conventions vary | Day pillar / 命宮 near midnight | iztro default + our `timeIndexFromHour` (h23→12) | **UNVERIFIED** — confirm midnight policy |
| 五行局 / 命宮 / 命主·身主 | iztro computed | — | (core placement) | iztro | **UNVERIFIED** until cross-checked vs independent reference |
| 12 palace order | 命·兄弟·夫妻·子女·財帛·疾厄·遷移·交友·官祿·田宅·福德·父母 | — | standard | iztro (matches) | **CONFIRMED (structure)** |
| True-solar-time (LMT/균시차) | iztro does NOT apply longitude correction | some practitioners apply it | Hour branch near boundary times | not applied (consistent w/ current 사주 unless it applies) | **DECISION_REQUIRED** — align with 사주 policy |

## Consistency with the 사주 engine

- 자미두수 (iztro) performs its **own** lunar/干支 conversion from the RAW solar
  birth date; DeokbunAI does **not** pre-normalize through the 사주 calendar
  (avoids double-normalization — see `ziweiInputAdapter.ts` §8). Both engines
  derive from the same raw input.
- **Follow-up (Codex):** verify 사주 and 자미 agree on the year/day 干支 at
  boundary times (입춘, 자시 split, LMT). If they diverge, decide a single
  product-wide time policy. Until then this is **UNVERIFIED**, not blocking.

## What must be done before treating charts as authoritative (Owner/Codex)

1. Pick the canonical lineage (`algorithm` + `yearDivide`) — DECISION_REQUIRED.
2. Provide independent reference charts (verified 排盤 tool / authoritative text
   stating its lineage) → build **verified golden fixtures** (§14). Current tests
   are structural + a characterization lock, NOT independent-correctness.
3. Confirm LMT + 자시 midnight policy consistent with 사주.
4. If the chosen lineage differs from iztro default, set `astro.config({...})` in
   `iztroAdapter.ts` and bump `ZIWEI_RULESET_VERSION`.
