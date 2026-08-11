# 기문둔갑 — SCHOOL / METHOD DIFFERENCES (qimen-dunjia reuse)

> Directive §19/§36. DeokbunAI's 기문둔갑 Core is **qimen-dunjia@2.1.0** (MIT),
> consumed only through `src/features/qimen/adapters/qimenCoreAdapter.ts`. The
> library implements **時家 기문 (hour-based)** with **拆補法** 정국. DeokbunAI pins
> that method as its baseline; `ruleSetVersion = "qimen-dunjia-chaibu@2.1.0"` is
> stamped on every `QimenBoard`.
>
> **LIBRARY ≠ TRUTH (§24):** the library producing a value is NOT proof of
> correctness. Items marked UNVERIFIED / DECISION_REQUIRED must be cross-checked
> against an independent reference and a chosen lineage before being treated as
> authoritative. No value here was hand-derived by Claude as ground truth.

## Method register

| Rule | qimen-dunjia behavior | Alternative | DeokbunAI | Status |
|---|---|---|---|---|
| 정국 방법 (定局) | **拆補法** (Chai Bu) | 置閏法 (초신접기/超神接氣) | 拆補法 (library baseline) | **DECISION_REQUIRED** — confirm 拆補 is DeokbunAI's canonical vs 置閏 |
| 기문 scale (時家/日家/月家/年家) | **時家 (hour-based)** | 日家 등 | 時家 (matches 시점 질문 model) | **CONFIRMED (product fit)** |
| 음양둔 전환 (陰陽遁) | by 節氣 (동지~하지 陽, 하지~동지 陰) via `JIEQI_JUSHU` | (standard) | library | **CONFIRMED (structure)** / values UNVERIFIED |
| 국수 (局數) | 節氣 + 三元(상·중·하원) from 節後天數 (<5 上元, <10 中元, else 下元) | boundary conventions vary | library | **UNVERIFIED** (拆補 boundary) |
| 三奇六儀 地盤 布局 | 陽遁 순포 / 陰遁 역포, 局數 기준 | (standard) | library | **CONFIRMED (structure)** |
| 天盤 회전 | 時干/符首 기준 회전 | (variants) | library | **UNVERIFIED** |
| 八門/九星/八神 배치 | library 飛/轉 방식 | 학파별 배치·順逆 상이 | library | **SCHOOL_DEPENDENT** |
| 天禽寄宮 | library 규칙(中5宮 처리) | 학파별 상이 | library | **SCHOOL_DEPENDENT** |
| 자시(子時) 경계 | 時柱 from lunar time | 야자시/조자시 | library default | **UNVERIFIED** |
| 진태양시(LMT/균시차) | NOT applied (질문 wall-clock 그대로) | 경도 보정 적용 | not applied | **DECISION_REQUIRED** — align with 사주/자미 |
| Timezone | 질문 local wall-clock (caller supplies structured time) | — | caller-owned | **CONFIRMED (contract)** — no TZ guessing in engine |

## Point-in-time contract (§22)

- 기문은 **timing/decision 질문 + 명시적 질문시각**일 때만 계산. 현재시각 임의 대입
  없음(`generateChartNow` 미사용); birth data 미사용.
- eligibility: `not_applicable`(비-시점질문) / `missing_question_time`(시각없음) /
  `unsupported_case`(잘못된시각) / `calculation_failed`(Core 실패). 가짜 board 없음.

## What must be done before treating boards as authoritative (Owner/Codex)

1. Confirm the canonical 정국 방법 (拆補法 vs 置閏法) — DECISION_REQUIRED.
2. Provide independent reference boards (verified 排盤 tool/text stating its method)
   → **verified golden fixtures** (§24). Current tests are structural + a
   characterization lock, NOT independent-correctness.
3. Confirm LMT + 자시 midnight policy consistent with 사주/자미.
4. If the chosen lineage differs from the library baseline, replace/patch via the
   adapter (never node_modules) and bump `QIMEN_RULESET_VERSION`.
