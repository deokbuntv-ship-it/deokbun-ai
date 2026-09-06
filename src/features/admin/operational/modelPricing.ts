// Admin LLM pricing repository (Sprint J5 §5.6). Connects the EXISTING honest cost calculator to a repository of
// ONLY verified prices. A model absent from this list yields null from computeCost/aggregateUsageCost → the UI
// shows "가격 미확인", NEVER a fabricated cost. Prices are USD (from the verified OpenAI pricing constants); no
// KRW is derived here (no explicit FX source).
//
// gpt-5.6-terra was ABSENT until 2026-09-02 (pricing unverified). It is now verified against
// https://developers.openai.com/api/docs/pricing (retrieved 2026-09-02, Standard tier) and registered, so 궁합
// and deep/premium costs stop reading as unknown. Definition lives with the other verified constants in
// llmCostModel.ts — this file only decides what counts as verified.
import { GPT_5_MINI_PRICING, GPT_5_NANO_PRICING, GPT_5_6_TERRA_PRICING } from '@/features/chat/cost/llmCostModel';
import { staticPricingRepository, type PricingRepository } from './operationalContracts';

/** Verified, priced models only. Add a model here ONLY when its pricing is confirmed against the source. */
export const VERIFIED_MODEL_PRICING = [GPT_5_MINI_PRICING, GPT_5_NANO_PRICING, GPT_5_6_TERRA_PRICING];

export const adminPricingRepository: PricingRepository = staticPricingRepository(VERIFIED_MODEL_PRICING);

/** Shown when a model has no verified pricing (any model not in VERIFIED_MODEL_PRICING). */
export const UNPRICED_LABEL = '가격 미확인';

/** True when we can show a real monetary cost for this model. */
export function isModelPriced(model: string): boolean {
  return adminPricingRepository.getPricing(model) !== null;
}
