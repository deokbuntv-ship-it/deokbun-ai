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
// Summary: short VISIBLE text, but reasoning is billed against the same ceiling — which is the whole
// lesson of the 800 → 5000 consultation fix above, and summary was left behind by it. Raised 1000 → 3000
// on 2026-09-02 after measuring the staging cost benchmark: 8 of 10 summaries died on
// OPENAI_INCOMPLETE_max_output_tokens, and the 2 that survived came in at 880 and 976 — i.e. the old
// ceiling cut straight through the middle of the real distribution. A ceiling is truncation insurance,
// not a spend cap (you are billed on ACTUAL tokens), so the unused headroom costs nothing while a
// too-low ceiling costs the FULL budget and returns nothing at all.
export const DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS = 3000;
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

// ---- Per-complexity consultation profile (Overnight Sprint §4/§8) -------------------------------------
// gpt-5-mini bills REASONING tokens as output and, with no `reasoning.effort` set, runs at the provider
// default (medium) — the true cost driver (production: outputTokens 2800/2800 incomplete = reasoning ate
// the budget). The dominant, SAFE cost lever is therefore lowering reasoning effort for simpler questions;
// max_output_tokens stays a generous truncation-safe CEILING (you are billed on ACTUAL tokens, so a high
// ceiling that goes unused costs nothing — it only prevents OPENAI_INCOMPLETE). Effort + a per-complexity
// ceiling together tune each question to what it needs, without ever risking a truncated answer (§26).
import type { QuestionComplexity } from './questionComplexity';

// Only the four low-risk efforts are permitted here. 'none'/'minimal' are intentionally excluded as
// defaults — a grounded structured consultation still needs light reasoning to compose a coherent,
// schema-conforming answer; 'low' is the safe floor. Owner can force any value via env after live validation.
export type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
const VALID_EFFORTS: readonly ReasoningEffort[] = ['minimal', 'low', 'medium', 'high'];

export type ConsultationProfile = {
  maxOutputTokens: number; // truncation-safe CEILING (billed on actual)
  reasoningEffort: ReasoningEffort;
};

// Defaults: effort rises with complexity (the real cost lever); the ceiling also rises so a longer
// legitimate answer never truncates. All ceilings are within [MIN, HARD_MAX] and were chosen to stay ABOVE
// the production-observed completion point (a full structured answer completed at 5000 under medium effort;
// low effort needs less, so SIMPLE/STANDARD ceilings are safe).
const PROFILE_DEFAULTS: Record<QuestionComplexity, ConsultationProfile> = {
  SIMPLE: { maxOutputTokens: 3500, reasoningEffort: 'low' },
  STANDARD: { maxOutputTokens: 4500, reasoningEffort: 'low' },
  DEEP: { maxOutputTokens: 6000, reasoningEffort: 'medium' },
};

function coerceEffort(raw: string | null | undefined, fallback: ReasoningEffort): ReasoningEffort {
  const v = (raw ?? '').trim().toLowerCase();
  return (VALID_EFFORTS as readonly string[]).includes(v) ? (v as ReasoningEffort) : fallback;
}

// Resolve the consultation profile for one question's complexity. Optional GLOBAL env overrides (applied to
// EVERY complexity, for backward-compat + emergency tuning): the legacy `LLM_CONSULTATION_MAX_OUTPUT_TOKENS`
// still pins the ceiling, and `LLM_CONSULTATION_REASONING_EFFORT` pins the effort. When unset, the
// per-complexity defaults above apply. The ceiling is clamped to [MIN, HARD_MAX] exactly like resolveLlmBudgets.
export function resolveConsultationProfile(
  complexity: QuestionComplexity,
  overrides?: { maxOutputTokens?: string | null; reasoningEffort?: string | null },
): ConsultationProfile {
  const base = PROFILE_DEFAULTS[complexity];
  return {
    maxOutputTokens: clampBudget(overrides?.maxOutputTokens, base.maxOutputTokens),
    reasoningEffort: coerceEffort(overrides?.reasoningEffort, base.reasoningEffort),
  };
}
