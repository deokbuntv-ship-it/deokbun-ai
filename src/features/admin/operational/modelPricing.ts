// Admin LLM pricing repository (Sprint J5 §5.6). Connects the EXISTING honest cost calculator to a repository of
// ONLY verified prices. gpt-5.6-terra (the compatibility model) is intentionally ABSENT because its pricing is
// unverified → computeCost/aggregateUsageCost return null for it → the UI shows "가격 미확인", NEVER a fabricated
// cost. Prices are USD (from the verified OpenAI pricing constants); no KRW is derived (no explicit FX source).
import { GPT_5_MINI_PRICING, GPT_5_NANO_PRICING } from '@/features/chat/cost/llmCostModel';
import { staticPricingRepository, type PricingRepository } from './operationalContracts';

/** Verified, priced models only. Add a model here ONLY when its pricing is confirmed. */
export const VERIFIED_MODEL_PRICING = [GPT_5_MINI_PRICING, GPT_5_NANO_PRICING];

export const adminPricingRepository: PricingRepository = staticPricingRepository(VERIFIED_MODEL_PRICING);

/** Shown when a model has no verified pricing (e.g. gpt-5.6-terra). */
export const UNPRICED_LABEL = '가격 미확인';

/** True when we can show a real monetary cost for this model. */
export function isModelPriced(model: string): boolean {
  return adminPricingRepository.getPricing(model) !== null;
}
