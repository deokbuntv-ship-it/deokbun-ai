// LLM cost model (Overnight Sprint §3/§15/§16). Pure + deterministic. REUSES the
// existing honest cost calculator (admin/operational computeCost — returns null, never
// a fake ₩0) and adds: the verified gpt-5-mini/nano price configs (single source), a
// KRW assumption, and a per-complexity BEFORE/AFTER + monthly-scale simulation used by
// the benchmark test and the owner report.
//
// NOT in the edge bundle — the Edge only logs raw token counts; cost is computed
// downstream (admin/report), so pricing never ships to the client and the edge stays lean.
import {
  computeCost,
  type ModelPricingConfig,
  type TokenUsage,
} from '@/features/admin/operational/operationalContracts';
import type { QuestionComplexity } from '@/features/chat/server';

// ---- Verified pricing (developers.openai.com/api/docs/pricing, 2026-08). Prices per 1M
// tokens, USD. OWNER: re-verify against the live table; a single edit here updates ALL
// cost math (constitution: single pricing source, no hardcoding across files).
export const GPT_5_MINI_PRICING: ModelPricingConfig = {
  provider: 'openai',
  model: 'gpt-5-mini',
  effectiveFrom: '2026-08-01',
  currency: 'USD',
  unit: 'per_1m_tokens',
  inputUnitPrice: 0.25,
  cachedInputUnitPrice: 0.025,
  outputUnitPrice: 2.0,
};

// gpt-5-nano — 5× cheaper output. A candidate for SIMPLE questions ONLY if the owner
// judges quality acceptable (constitution §25: 상담 품질 > 비용). Not wired; recommendation only.
export const GPT_5_NANO_PRICING: ModelPricingConfig = {
  provider: 'openai',
  model: 'gpt-5-nano',
  effectiveFrom: '2026-08-01',
  currency: 'USD',
  unit: 'per_1m_tokens',
  inputUnitPrice: 0.05,
  cachedInputUnitPrice: 0.005,
  outputUnitPrice: 0.4,
};

// Analysis-only FX assumption (NOT billing). Configurable in one place.
export const DEFAULT_USD_KRW = 1350;

export function usdToKrw(usd: number, rate: number = DEFAULT_USD_KRW): number {
  return usd * rate;
}

// Per-Q&A cost in KRW for a measured/estimated token usage. null when the model has no
// price (never a fake 0 — inherited from computeCost).
export function estimateQaCostKrw(
  usage: TokenUsage,
  pricing: ModelPricingConfig = GPT_5_MINI_PRICING,
  rate: number = DEFAULT_USD_KRW,
): number | null {
  const c = computeCost(usage, pricing);
  return c ? usdToKrw(c.total, rate) : null;
}

// ---- Token assumptions per complexity (ESTIMATES pending live telemetry) --------------
// Basis: the production evidence (a full structured answer + medium-effort reasoning
// completed near 5000 output tokens; reasoning is the bulk) + the prompt-component map
// (system constitution + full myungri/ziwei grounding + schema instruction ≈ ~3000 input).
// AFTER = this sprint's reasoning-effort routing (SIMPLE/STANDARD 'low', DEEP 'medium'),
// which cuts the reasoning share that dominates output. Owner refines these with the real
// cached_input_tokens / reasoning_tokens once telemetry is live.
export type TokenProfile = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number; // reasoning + visible answer (gpt-5-mini bills reasoning as output)
};

// BEFORE: no routing, provider-default (medium) effort on EVERY question, 5000 cap.
export const BEFORE_PROFILE: TokenProfile = { inputTokens: 3000, cachedInputTokens: 0, outputTokens: 3500 };

// AFTER: per-complexity, low/low/medium effort. Input unchanged (grounding untouched);
// output falls because reasoning effort falls. cachedInputTokens stays 0 until prompt
// caching is measured (a further, smaller input saving — see the cost doc).
export const AFTER_PROFILES: Record<QuestionComplexity, TokenProfile> = {
  SIMPLE: { inputTokens: 2600, cachedInputTokens: 0, outputTokens: 700 },
  STANDARD: { inputTokens: 3000, cachedInputTokens: 0, outputTokens: 1200 },
  DEEP: { inputTokens: 3200, cachedInputTokens: 0, outputTokens: 2300 },
};

// Representative traffic mix (owner-tunable). Most consultation questions are simple/standard.
export const DEFAULT_MIX: Record<QuestionComplexity, number> = { SIMPLE: 0.5, STANDARD: 0.35, DEEP: 0.15 };

function profileToUsage(model: string, p: TokenProfile): TokenUsage {
  return { model, inputTokens: p.inputTokens, cachedInputTokens: p.cachedInputTokens, outputTokens: p.outputTokens };
}

export function costKrwForProfile(
  p: TokenProfile,
  pricing: ModelPricingConfig = GPT_5_MINI_PRICING,
  rate: number = DEFAULT_USD_KRW,
): number {
  return estimateQaCostKrw(profileToUsage(pricing.model, p), pricing, rate) ?? 0;
}

// Weighted average per-Q&A KRW across the complexity mix (AFTER routing).
export function weightedAverageKrw(
  profiles: Record<QuestionComplexity, TokenProfile> = AFTER_PROFILES,
  mix: Record<QuestionComplexity, number> = DEFAULT_MIX,
  pricing: ModelPricingConfig = GPT_5_MINI_PRICING,
  rate: number = DEFAULT_USD_KRW,
): number {
  return (['SIMPLE', 'STANDARD', 'DEEP'] as const).reduce(
    (sum, c) => sum + mix[c] * costKrwForProfile(profiles[c], pricing, rate),
    0,
  );
}

// Monthly API cost (KRW) for N Q&A/month at the weighted average.
export function monthlyKrw(
  qaPerMonth: number,
  profiles: Record<QuestionComplexity, TokenProfile> = AFTER_PROFILES,
  mix: Record<QuestionComplexity, number> = DEFAULT_MIX,
  pricing: ModelPricingConfig = GPT_5_MINI_PRICING,
  rate: number = DEFAULT_USD_KRW,
): number {
  return qaPerMonth * weightedAverageKrw(profiles, mix, pricing, rate);
}

export type CostTarget = 'TARGET_A' | 'TARGET_B' | 'WARNING' | 'UNSUSTAINABLE_FOR_FREE_BETA';

// Classify a per-Q&A KRW cost against the directive's bands (§16).
export function classifyCostTarget(krwPerQa: number): CostTarget {
  if (krwPerQa <= 2) return 'TARGET_A';
  if (krwPerQa <= 3) return 'TARGET_B';
  if (krwPerQa <= 5) return 'WARNING';
  return 'UNSUSTAINABLE_FOR_FREE_BETA';
}
