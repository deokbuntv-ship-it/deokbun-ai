# Commercial Consultation Answer — Quality V5 (baseline + cost)

Overnight autonomous sprint. Goal: the answer reads like a polished consultation — conclusion in the
first 3–5s, concise, non-repetitive, natural Korean — **without** weakening grounding, the semantic
validator, or the frozen engines. This sprint changes only the **answer contract** (prompt) and the
**presentation projection** (VM). No schema change, no validator change, no engine change.

Prompt version: `consultation@1.0.0` → **`consultation@1.1.0`**.

---

## 1. Quality rubric (§7) — how an answer is judged

| # | Dimension | What "good" means |
|---|-----------|-------------------|
| A | Directness | First 1–2 sentences answer 좋은가/주의할가 **and** the direction (what to do) |
| B | Readability | Scannable on ~390px mobile; hierarchy, not walls |
| C | Specificity | Personalized from grounded evidence, not generic |
| D | Actionability | User knows what to do / watch |
| E | Non-repetition | Idea not restated across headline/summary/points/detail |
| F | Language | Natural modern Korean, no machine filler |
| G | Hygiene | No engine/debug/system vocabulary |
| H | Grounding | No unsupported year/month/timing/theory claims |
| I | Depth fit | SIMPLE not over-explained; DEEP not under-explained |
| J | Cost efficiency | Output space spent on useful info |

Mechanically-verifiable parts (E/G/H/depth-caps, contract rules) are covered by tests
(`commercialInstruction.test.ts`, `consultationPresentationVM.test.ts`, `structuredConsultationHygiene`,
`structuredConsultation` validator suites). Subjective F is guided by the prompt, not unit-tested.

---

## 2. Answer architecture — BEFORE vs AFTER (contract, not fabricated model text)

Schema is unchanged (`coreSummary / disposition / coreInterpretation / strengths / cautions /
domainInterpretation[] / futureFlow / followUps`). The VM projects it to
`headline → summary → keyPoints → cautions → collapsed detail → followUps`.

### A. "내 사업운 어때?" (STANDARD)
- **BEFORE (observed problems):** conclusion arrives late; core + domain restate the same idea; cautions
  vague ("신중해야 합니다"); detail = low-value prose.
- **AFTER (V5 contract):**
  - headline: conclusion **+ direction** — e.g. "사업운은 좋은 편입니다. 지금은 규모 확장보다 수익
    구조를 다지는 쪽이 유리합니다."
  - summary: 2–4 sentences, 결론→이유, no restatement of the headline.
  - keyPoints: 2–3, one idea each, near-duplicates removed (dedup V2).
  - cautions: specific, grounded, or omitted.
  - detail (collapsed): domain rationale that adds NEW value; capped so it never becomes a wall.
  - followUps: exactly 3 (2 short + 1 deeper).

### B. "2027년 사업운은 어때?" (STANDARD, single-year)
- **AFTER:** grounds 2027 only; direct conclusion; **no unsupported months** (validator enforces); no
  unrelated 10-year dump; relevant follow-ups. Timing claims still gated by `TIMING_CLAIM_MISMATCH`.

### C. "앞으로 10년 사업 흐름 알려줘" (DEEP, multi-year)
- **BEFORE:** wall of ~10 equal yearly paragraphs.
- **AFTER:** overview → good/caution windows → turning points (prompt), and the VM **caps detail
  sections (≤5 + timing flow)** so it can't render as 10 essays. Year-by-year only on explicit request.

---

## 3. What changed (safe, reversible)

- **Prompt V5** (`structuredConsultation.ts`): headline = conclusion + direction; self-scaling length
  (simple short / complex fuller, no padding); anti-filler Korean (no "종합적으로 볼 때"/"이를 바탕으로"
  spam, no uniform sentence endings, one calibration not per-sentence hedging); detail must add NEW
  value; cautions specific. All existing safety/hygiene/timing rules kept verbatim.
- **Presentation VM dedup V2** (`consultationPresentationVM.ts`): conservative near-duplicate removal
  (exact + containment + ≥0.8 Jaccard over ≥3 eojeol) against headline/summary and earlier items;
  detail-section cap; redundant detail bodies dropped. Distinct advice on the same topic is kept.

Not changed (deliberately): the JSON schema, the semantic validator (timing/engine/consensus/theory),
reasoning-effort routing, engine context routing, the frozen engines.

---

## 4. Cost (§37/§38/§65) — ESTIMATED, verified pricing

Pricing is repo-approved in `src/features/chat/cost/llmCostModel.ts` (gpt-5-mini):
**input $0.25 / cached-input $0.025 / output $2.00 per 1M tokens.** Reasoning tokens bill as **output**.
Assumption: 1 USD ≈ 1,350 KRW.

Reasoning routing (`llmBudget.ts`, unchanged this sprint): SIMPLE→`low`, STANDARD→`low`, DEEP→`medium`;
`max_output` is a truncation-safe ceiling (3500/4500/6000), billed on ACTUAL tokens.

Per-Q&A estimate (ESTIMATED — reasoning-token counts are the dominant uncertainty; validate with live
telemetry). Input ≈ 3,500–4,000 tokens (system constitution + schema + grounding + question), a stable
prefix is cache-eligible; output = visible answer + reasoning.

| Class | visible out (est) | reasoning out (est) | ≈ USD/Q&A | ≈ KRW/Q&A |
|-------|-------------------|---------------------|-----------|-----------|
| SIMPLE (low) | ~250 | ~600 | ~$0.0026 | **~₩3.5** |
| STANDARD (low) | ~500 | ~1,200 | ~$0.0040 | **~₩5.4** |
| DEEP (medium) | ~900 | ~2,600 | ~$0.0080 | **~₩10.8** |

Weighted average (mix 50/35/15): **≈ ₩5.4/Q&A (ESTIMATED)**. This is roughly **cost-neutral vs. the prior
~₩4 estimate** — V5 slightly reduces *visible* output but does not change reasoning effort (the dominant
driver), so it does not by itself reach TARGET_A (1–2원) or TARGET_B (≤3원). Those need the deferred cost
levers below, each requiring a live A/B the owner must run.

DAU scenarios (1,000 DAU × 30 days, weighted ≈ ₩5.4/Q&A, ESTIMATED):

| Q&A/user/day | Q&A/month | ≈ monthly KRW |
|--------------|-----------|---------------|
| 1 | 30,000 | ~₩162,000 |
| 5 | 150,000 | ~₩810,000 |
| 10 | 300,000 | ~₩1,620,000 |
| 30 | 900,000 | ~₩4,860,000 |

All figures **ESTIMATED**. No live API calls were made this sprint (owner asleep; §6/§56 — don't burn).

### Deferred cost levers (need live A/B — OWNER)
1. **SIMPLE → `minimal` reasoning effort.** Biggest lever, but `minimal` is deliberately excluded today
   because gpt-5-mini can under-reason and skip the structured schema. A/B on structured-output
   reliability before adopting (§33/§39).
2. **SIMPLE → gpt-5-nano** ($0.05/$0.40 per 1M). Isolated config seam only; compare quality + structured
   reliability; owner has final say on the quality tradeoff (§34).
3. **Prompt caching** — order the stable system prefix first (already the case) and confirm
   `cached_input_tokens` in live telemetry (§35).

---

## 5. Telemetry (§36) — captured, privacy-safe

`ai_usage_logs` records per consultation (no birth data / question / answer / token / PII): request id,
model, complexity, reasoning effort, input/cached-input/output/reasoning tokens, status, latency, and now
the prompt version (`consultation@1.1.0`) for V4-vs-V5 comparison. Cost is computed by the existing
`computeCost`/`aggregateUsageCost` (no second calculator).

---

## 6. Owner actions
- **Edge redeploy** of the `chat` function (serverBundle regenerated with the V5 prompt) — required for V5
  to take effect in production. No new migration, no secret change.
- Client redeploy for the VM dedup V2 (client-side presentation).
- Optional, later: run the two cost-lever A/Bs above with live telemetry before chasing ≤3원.
