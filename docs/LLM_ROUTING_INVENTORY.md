# LLM ROUTING INVENTORY (§J)

> **Status:** INVESTIGATION (Sprint F). Facts below are read from the actual code (no guessing). Current
> implementation and target policy are kept strictly separate. **No model swap is performed this sprint.**

## 1. Current model routing (as implemented)

The chat Edge resolves **one** model per request from env and uses it for **every** chat workload:

- `supabase/functions/chat/index.ts:87` — `const DEFAULT_MODEL = 'gpt-5-mini'`
- `:96` — `const model = Deno.env.get('LLM_MODEL')?.trim() || DEFAULT_MODEL`

| Workload | Model (current) | Tuning (reasoning effort / output ceiling) | LLM calls |
|---|---|---|---|
| 일반 상담 (consultation, solo) | `gpt-5-mini` (`LLM_MODEL`) | per-question: SIMPLE `low`/3500 · STANDARD `low`/4500 · DEEP `medium`/6000 (`llmBudget.ts`) | 1 / turn |
| 궁합 (compatibility) | `gpt-5-mini` (same var) | same complexity classifier; **tier itself is deterministic (no LLM)** | 1 / turn |
| 후속 (왜 / 그럼 내년 / 둘 중) | `gpt-5-mini` (same var) | rides the same consultation call | 1 / turn |
| 오늘의 운세 (today) | `gpt-5-mini` (same var) | today env effort/ceiling | 1 / user / day |
| 이번 달 운세 (monthly) | `gpt-5-mini` (same var) | monthly env effort/ceiling | 1 / user / month |
| 대화 요약 (summary/memory) | `gpt-5-mini` (same var) | summary ceiling | threshold-based |
| **프리미엄 리포트 (premium report)** | **none** | deterministic composer, **ZERO extra LLM** (`report/consultationReportComposer.ts`); LLM narrative report = **owner-gated seam, not built** | 0 |
| content-generate (admin) | `CONTENT_LLM_MODEL` / `LLM_MODEL` / `gpt-5-mini`; premium via `PREMIUM_CONTENT_LLM_MODEL` | env caps | admin |
| famous-suggest (admin) | `PREMIUM_CONTENT_LLM_MODEL` / `CONTENT_LLM_MODEL` / `LLM_MODEL` / `gpt-5-mini` | — | admin |

**Key fact:** there is **no per-workload model differentiation** in the consumer chat Edge today. Everything is
`gpt-5-mini`. Only the **reasoning effort + output ceiling** vary (by question complexity). Cost is currently
tuned via effort, not model.

## 2. Target policy (Sprint F direction)

| Workload | Target model | Rationale |
|---|---|---|
| 일반 상담 | **Mini** | high volume, cost-sensitive; effort tiers already tune it |
| 궁합 | **Terra** | pairwise synthesis, higher perceived value |
| 심층 / 특정 시기 (DEEP) | **Terra** | multi-period synthesis needs the stronger model |
| 프리미엄 리포트 | **Terra** | premium narrative artifact |

**Non-negotiable:** membership tier must **not** change interpretation accuracy — Mini vs Terra is a
per-**workload** routing decision, never a per-**user-grade** quality gate. A free and a paid user asking the
same general question get the same Mini answer; a compatibility request routes to Terra for *everyone*.

## 3. Gap (current → target)

- "Terra" is an **unmapped codename** in this repo — there is **no concrete model id** for it in code. Mapping
  Terra → a real provider/model id is an **owner decision** (cost + capability), out of scope for Sprint F.
- To reach the target, the Edge would resolve the model **per workload** (e.g. `LLM_MODEL_MINI`,
  `LLM_MODEL_TERRA`) and route consultation→Mini, compatibility/DEEP/report→Terra. This is a **small, additive**
  change (a routing function over the already-computed workload + complexity), but it is **not done this sprint**
  because (a) Terra has no id yet and (b) it must be benchmark- and owner-gated.
- Premium Report has **no LLM path** at all yet (deterministic only); the Terra narrative report is greenfield.

## 4. Recommended next step (after benchmark + owner id decision)

1. Owner maps Terra → concrete model id(s).
2. Add `resolveWorkloadModel(workload, complexity)` in the Edge returning Mini/Terra ids from env.
3. Record the resolved model on each generation (enables per-model spend attribution — see
   [GLOBAL_SPEND_GUARD_SPEC.md](GLOBAL_SPEND_GUARD_SPEC.md) §3.2).
4. Re-price products (§DUK_ECONOMY_SPEC_V1) against real Terra cost from the benchmark.
