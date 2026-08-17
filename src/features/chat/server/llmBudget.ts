// Per-path OpenAI output-token budgets (Server-Trust — chat max_output_tokens fix). Pure, bundled, and
// Jest-tested. The OpenAI Responses API counts REASONING tokens against `max_output_tokens`; a shared 800
// budget let gpt-5-mini spend it on reasoning and return `status: incomplete` with no visible text — PROVEN
// in production via `[chat.diag] OPENAI_INCOMPLETE_max_output_tokens` (outputTokens 768/800, totalTokens
// 2798). The structured long-form consultation contract needs a larger budget; summary stays small.
// Bounded on both ends — env can tune but never make it unbounded (§7).

// Consultation: the strict structured schema (core summary + long-form interpretation + strengths +
// cautions + domain sections + future flow + follow-ups) PLUS gpt-5-mini reasoning headroom. Raised to
// 5000 after production still hit the cap under Structured Outputs (outputTokens 2800/2800, responseStatus
// incomplete, totalTokens ~8079) — reasoning + a full schema-conforming answer needs more room. Still
// within HARD_MAX (8000) and the model context.
export const DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS = 5000;
// Summary: short compression only.
export const DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS = 1000;
// Hard bounds so a bad env value can neither starve nor blow up cost.
export const MIN_MAX_OUTPUT_TOKENS = 256;
export const HARD_MAX_OUTPUT_TOKENS = 8000;

function clampBudget(raw: string | null | undefined, fallback: number): number {
  const n = Number((raw ?? '').trim());
  if (!Number.isFinite(n) || n <= 0) return fallback; // missing / non-numeric / non-positive → default
  return Math.min(Math.max(Math.floor(n), MIN_MAX_OUTPUT_TOKENS), HARD_MAX_OUTPUT_TOKENS);
}

// Resolve the two budgets from raw env strings (the Edge passes Deno.env values). Consultation is
// deliberately NOT derived from the legacy single `LLM_MAX_OUTPUT_TOKENS` — that env may still be pinned
// at 800, which is the very cause; a dedicated var + higher default is used instead.
export function resolveLlmBudgets(env: { consultation?: string | null; summary?: string | null }): {
  consultation: number;
  summary: number;
} {
  return {
    consultation: clampBudget(env.consultation, DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS),
    summary: clampBudget(env.summary, DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS),
  };
}
