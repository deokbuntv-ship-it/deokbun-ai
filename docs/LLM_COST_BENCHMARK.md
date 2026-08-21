# LLM COST BENCHMARK (§K / §L / §M)

> **Status:** `BENCHMARK_HARNESS_READY` · `LIVE_BENCHMARK_NOT_EXECUTED`.
> No OpenAI key is present locally (it is a server-only Edge secret), and a live run spends real money + calls an
> external service — an owner-authorized operation. The harness + PII-free fixtures are ready; the owner runs it.

## 1. Why not executed here

- No local API key (`.env` and shell env checked — none; the key lives only as a deployed Edge secret).
- A live benchmark **spends real LLM money** and calls an external provider → requires explicit owner
  authorization (not an autonomous-session action).
- Per the standing rules: no secret creation, no irreversible external operation without authorization.

## 2. Measurement method (no guessing, no hardcoded prices)

The Edge **already records real token usage** for every paid request in `ai_usage_logs` (input / output /
total / `cached_input_tokens` / `reasoning_tokens` / model / latency / `request_id`). The harness therefore does
**not** call OpenAI directly and does **not** reconstruct the server prompt — it drives the **deployed Edge**
with synthetic fixtures and reads back the real usage rows, joined by `request_id`. This measures true
production cost.

- **Tokens / model / latency:** `ai_usage_logs` (join key `request_id`).
- **Versions** (`prompt_version` / `engine_version` / `model_id`): `consultation_decisions` (also `request_id`-
  keyed, from the E.2 store). Recorded as null if unavailable.
- **estimated_cost:** computed **only** if the owner supplies a price table (`BENCHMARK_PRICES=path.json`,
  `model → {input, cached_input, output}` per 1M tokens, plus `_currency`). No price is ever hardcoded — the
  repo has no verified price table.

## 3. Fields collected (per row)

`workload, model, turn_number, input_tokens, cached_tokens, output_tokens, total_tokens, latency_ms,
estimated_cost, currency, timestamp, prompt_version, engine_version` (+ `http_status`).

## 4. Matrix (fixtures × turns)

`scripts/benchmark/fixtures.json` (synthetic, PII-free — fabricated birth data, no real user):

| Workload | Fixtures | Turns | Model target (§J) |
|---|---|---|---|
| 일반 상담 (general) | 5 | 1 / 3 / 5 | Mini |
| 특정 시기 / 심층 (specificTiming) | 3 | 1 / 3 / 5 | Terra |
| 궁합 (compatibility) | 5 | 1 / 3 / 5 | Terra |
| WHY 후속 (whyFollowUp) | 3 | 1 / 3 / 5 | — |

Premium Report is excluded from the live matrix: it has **no LLM path** today (deterministic composer). When the
Terra narrative report seam is built, add a `premiumReport` workload here.

## 5. How the owner runs it

```bash
# dry run (plan only — safe, no network, no spend)
node scripts/benchmark/run-benchmark.mjs

# live run (spends real money; needs a deployed Edge + a test user token + service-role read)
BENCHMARK_EDGE_URL=https://<ref>.functions.supabase.co/chat \
BENCHMARK_SUPABASE_URL=https://<ref>.supabase.co \
BENCHMARK_JWT=<test-user-access-token> \
BENCHMARK_SERVICE_KEY=<service-role-key> \
BENCHMARK_PRICES=scripts/benchmark/prices.example.json \
node scripts/benchmark/run-benchmark.mjs --live
```

Outputs `scripts/benchmark/benchmark-results.{json,csv}`. The harness never prints a secret.

## 6. What the results feed

- **Product prices** (§DUK_ECONOMY_SPEC_V1) — set 5/12/50 Duk against real per-workload cost + margin.
- **Model routing** (§J) — confirm Mini vs Terra cost delta justifies the split.
- **Global spend guard** (§S) — set daily/monthly limits + per-model attribution from real unit costs.
- **PLUS pricing** (§PRODUCT_CATALOG_SPEC) — size the monthly Duk grant against heavy-user token cost.

## 7. Status markers (for the release gate)

- `BENCHMARK_HARNESS_READY` — fixtures + runner committed and dry-run verified.
- `LIVE_BENCHMARK_NOT_EXECUTED` — no live call made this sprint (no key; owner-gated).
