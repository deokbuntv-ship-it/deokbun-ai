# 덕분이 V1 — PRODUCT TRUTH GUARD

Purpose: keep every outward claim about 덕분이 **truthful to what the system actually does today**. This
applies to ALL surfaces: the app UI, onboarding, the website, ads, the App Store / Google Play listings,
investor/IR materials, partnership proposals, government startup-funding applications, and business plans.

This is a product-truth consistency requirement, **not** a legal analysis.

Rule of thumb: if the architecture cannot currently substantiate a claim with a deterministic mechanism or
measured evidence, the claim is **FORBIDDEN UNTIL SUPPORTED**.

---

## 1. What V1 actually does (state these accurately)

- **Deterministic calculation, AI interpretation.** The engines (사주·자미두수·기문둔갑) compute deterministic
  facts; the LLM only *verbalizes* a server-decided plan. Safe to say.
- **Server-owned conclusion polarity is TARGET-SCOPED.** For a supported YEAR or MONTH question ("올해 …",
  "내년 …", "2028년 …", "이번 달 …", "다음 달 …") the server decides a categorical tier
  (좋음/무난/변화/주의) for **that resolved period**. Safe to say — but scoped to those question types.
- **No deterministic temporal ranking or winner (Option B).** V1 does **not** decide "which month/year is
  best", a 1순위, or "A is better than B". It may **describe multiple grounded candidates without ranking
  them**. State this plainly; do not imply a best-time/winner feature.
- **No day-scope consultation polarity.** "오늘 …운" in the consultation does not currently produce a
  server polarity (the separate 오늘의 운세 product does). Do not claim per-day consultation verdicts.
- **Separate perspectives, not consensus.** When multiple engines are available they are presented
  **separately**. There is no cross-engine vote/average/consensus algorithm in V1.

---

## 2. Claims table

| Claim | Status | Note |
|---|---|---|
| "세 학문(사주·자미·기문)이 독립적으로 같은 결론을 확인했다" | **FORBIDDEN UNTIL SUPPORTED** | No cross-engine consensus algorithm exists. |
| "3-engine consensus / cross-validation / 교차검증" | **FORBIDDEN UNTIL SUPPORTED** | Same. |
| "세 시스템이 모두 일치" / "만장일치" | **FORBIDDEN UNTIL SUPPORTED** | Same. |
| "가장 좋은 시기를 알려드립니다" / best-time / 1순위 | **FORBIDDEN** (V1) | Option B: no deterministic winner/ranking. |
| "계산은 결정론적 엔진, 해석은 AI" | **SAFE** | Matches the architecture. |
| "여러 관점(사주/자미두수)을 각각 보여드립니다" | **SAFE** | Perspectives are presented separately. |
| "특정 해/달의 전반 흐름을 판단합니다" (target-scoped) | **CONDITIONAL** | True only for supported YEAR/MONTH questions. |
| "AI가 사주를 계산합니다" | **FORBIDDEN** | The AI does not calculate; the engine does. |
| "질병/수명/사망 시기를 예측합니다" | **FORBIDDEN** | Safety router refuses these. |
| "투자 수익/부를 보장합니다" | **FORBIDDEN** | Guarantee guard rejects it. |

---

## 3. Before any consensus/cross-validation claim can move to SUPPORTED

It must be backed by the engine-ablation evidence (see `docs/` ablation results) showing the engines
**materially and independently** change the structured decision — and by a defined, deterministic
cross-engine comparison mechanism (a V1.1+ item). Until then: separate perspectives only.

_Owner: review this file whenever marketing/IR/application copy is drafted._
