# LLM Cost Optimization — Analysis, Delivered Changes, Remaining Levers

Overnight Sprint (2026-08-17/18). Model: **gpt-5-mini** via the chat Edge (OpenAI
Responses API, Structured Outputs). All figures are **estimates** pending live
telemetry; the arithmetic + pricing are unit-tested (`llmCostModel.test.ts`).

Priority guard (constitution §25): 서비스 안정성 > 상담 품질 > 보안 > **비용 효율**. Every
change below is architecture-level; none weakens grounding, semantic validation, the
trust boundary, RLS, or engine integrity (§26).

---

## 1. Baseline (PHASE 3)

**Verified pricing** (developers.openai.com, per 1M tokens): gpt-5-mini **$0.25 in /
$0.025 cached / $2.00 out**; gpt-5-nano $0.05 / $0.005 / $0.40; gpt-5 $1.25 / $10.
FX assumption **₩1350/USD** (configurable; analysis only).

**Root cost driver — reasoning tokens.** gpt-5-mini bills reasoning as output. The
edge sent **no `reasoning.effort`**, so it ran at the provider default (medium);
production hit `outputTokens 2800/2800` incomplete (reasoning ate the budget), forcing
the 5000 cap. Output ($2/1M) is **8× the input rate**, so reasoning dominated cost.

**Baseline per-Q&A ≈ ₩10.5** (≈3000 input + ≈3500 output tokens, one OpenAI call).

**Measurement gaps found:** `ai_usage_logs` captures input/output/total tokens but NOT
`cached_input_tokens` or `reasoning_tokens`, so the reasoning share + cache hits are
invisible. `computeCost` (admin/operational) already exists and handles cached tokens
but had no gpt-5-mini price. Both are addressed (price config added; telemetry columns
are an owner-apply recommendation, §Remaining).

---

## 2. Delivered this sprint (PHASE 4 + 8) — the dominant lever

**Deterministic question-complexity router** (`questionComplexity.ts`, no LLM call) →
**per-question `reasoning.effort` + output-token ceiling** (`resolveConsultationProfile`):

| Class | Examples | effort | output ceiling |
|---|---|---|---|
| SIMPLE | 내 성격은? · 배우자 성향은? | low | 3500 |
| STANDARD | 2027년 사업운? · 이번 달 재물운? | low | 4500 |
| DEEP | 앞으로 10년 흐름 · 대운별 종합 | medium | 6000 |

The ceiling stays **truncation-safe** (billed on actual tokens; an unused high ceiling
is free) — lower effort leaves *more* budget for the answer, so this **reduces**
truncation risk while cutting cost. Grounding/validation untouched; a misclassification
only shifts effort/ceiling, never evidence.

### Cost impact (estimated)

| | Cost/Q&A | Band (§16) |
|---|---:|---|
| BEFORE (medium, no routing) | ₩10.46 | — |
| AFTER SIMPLE (low) | ₩2.77 | TARGET_B |
| AFTER STANDARD (low) | ₩4.25 | WARNING |
| AFTER DEEP (medium) | ₩7.29 | UNSUSTAINABLE |
| **Weighted avg (50/35/15)** | **₩3.97** | WARNING |

→ **~62% reduction** (₩10.5 → ₩4.0) with **zero quality/grounding change**. SIMPLE
already meets the ≤3 target; the weighted average is close but not yet ≤3 — the
remaining gap is answer-length + (optional) model routing, both owner/quality-gated.

### Monthly API cost at scale (weighted avg, gpt-5-mini)

| Q&A / month | Monthly cost |
|---:|---:|
| 30,000 | ≈ ₩119,000 |
| 150,000 | ≈ ₩595,000 |
| 300,000 | ≈ ₩1,190,000 |
| 900,000 | ≈ ₩3,570,000 |

---

## 3. Remaining levers (measured findings + recommendations)

Ranked by impact × safety. Items marked **owner-gated** touch answer length or model
choice (constitution §25: 품질 > 비용) and are deliberately NOT auto-applied.

1. **Response-length guidance (PHASE 9) — owner/UX-gated, ~₩1 further.** Answers are
   currently report-length. A per-complexity conciseness instruction (kept ABOVE the
   substance gate: coreInterpretation ≥120 chars) would cut visible-answer output
   ~25–35% → weighted avg ≈ **₩2.8 (TARGET_B)**. Deferred to the CONSULTATION UX sprint
   the directive already scopes (it is a quality/UX decision, not a mechanical one).

2. **Model routing to gpt-5-nano for SIMPLE (PHASE 5) — owner/quality-gated, large.**
   nano output is 5× cheaper: SIMPLE drops **₩2.77 → ≈₩0.55**. Weighted avg → ~₩3.0.
   The architecture already supports it (`LLM_MODEL`); routing per complexity is a
   one-line map. NOT done — a **quality decision** (nano may under-interpret 명리). Owner
   should A/B a sample before enabling.

3. **Prompt caching (PHASE 11) — small, safe.** The stable prefix (SYSTEM_CONSTITUTION
   + structured-output instruction) is cache-eligible (≥1024 identical prefix tokens →
   cached input at $0.025/1M, 10× cheaper). Input is cheap so the saving is ~₩0.3–0.5/Q&A,
   but free once the request orders all static content first. Needs the reasoning/cached
   token telemetry (below) to verify hit-rate before/after. Low priority, no quality risk.

4. **Engine/evidence routing (PHASE 5/6) — modest, medium risk.** Myungri + Ziwei full
   fact sections are sent on every grounded prompt (only Qimen is question-gated). A pure
   timing question may not need the full Ziwei natal block. Saves ~₩0.3–0.6 input, but
   risks the anti-consensus/forbidden-theory validator — do it *only* with the validator
   in the loop. Recommended as a follow-up with its own regression pass, not tonight.

5. **Conversation history / summary (PHASE 7/12) — architectural cleanup.** Exactly ONE
   OpenAI call per consultation (verified — no hidden duplicate). BUT the summary loop
   fires a SEPARATE occasional OpenAI call (~every 28 turns) whose output the production
   consultation prompt **never consumes** (`conversationSummary: null` hardcoded) — it
   spends tokens for no consultation benefit as currently wired. Options: (a) stop firing
   the summary loop until it's wired back in, or (b) wire the summary INTO the prompt to
   compress the re-sent recent-turns window (replacing raw history). (b) is the better
   §14 design but changes behavior — recommend for the next sprint. Recent history is
   re-sent each turn (≤8 turns, server-capped at 12) — acceptable, bounded.

6. **Structured-output instruction redundancy (PHASE 10) — small, safe.** With
   `strict` Structured Outputs (`text.format`) enforcing the schema, the ~20-line inline
   JSON exemplar in the prompt is partly redundant fixed input. Trimming it (keeping the
   field-semantics guidance) saves a small fixed input cost per call. Low risk; a good
   pairing with the response-length change.

7. **Telemetry columns (PHASE 3) — owner-apply, enables measurement.** Add nullable
   `cached_input_tokens`, `reasoning_tokens`, `complexity`, `reasoning_effort` to
   `ai_usage_logs` + read `usage.output_tokens_details.reasoning_tokens` /
   `usage.input_tokens_details.cached_tokens` in the edge (same fallback pattern as
   `request_id`). Then the estimates above become **measured**. Migration is a small
   additive artifact; the edge already logs a safe `[chat.route]` breadcrumb
   (complexity + effort + ceiling) so the router is observable immediately post-deploy.

---

## 4. Future consultation UX contract (PHASE 13/14) — DESIGN ONLY, not built

Preserved so the next sprint builds it without re-deciding:

- **Follow-up suggestions (3):** after each answer, 2 short natural + 1 deeper question,
  tappable to become the next question. **Generate them WITHIN the consultation response**
  (the schema already has `followUps[]`) — NO separate LLM call. The seam exists
  (`ChatMessage.structuredResult.followUps`); wiring is client-side.
- **Consultation report:** summarize a consultation as a report saved to 우편함 (보고서
  category); "보고서는 우편함에 넣어뒀습니다" + CTA. Shareable (Kakao/email/link) but
  **login-required to open — NO public anonymous share page** (share link → login → auth
  check → report view). Do NOT auto-generate a report per Q&A (cost) — generate on an
  explicit "상담 마치기"/report action, at most once per consultation. Acquisition events
  (`report_shared`/`share_opened`/`share_signup`) are a later analytics concern.

---

## 5. Business note (PHASE 16)

At 900,000 Q&A/month the weighted average (~₩3.57M/mo on gpt-5-mini) is material even
after this sprint. Free-beta is fine at low volume; at scale, plan a **usage
policy/monetization review** (not built this sprint — no payment code). Combining the
response-length change + nano-for-SIMPLE brings the average toward **₩2–3**, roughly
halving the scale cost, before any monetization.

**Bottom line:** the reasoning-effort router is the dominant, safe win (delivered). The
remaining path to a firm ≤3 (and toward ≤2) KRW is answer-length tuning + optional model
routing — both quality decisions reserved for the owner + the UX sprint.
