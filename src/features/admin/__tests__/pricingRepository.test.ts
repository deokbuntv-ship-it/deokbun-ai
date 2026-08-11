// Pricing repository seam tests (directive §6). Central config; V1 default = no
// pricing → null cost (never fabricated).
import {
  aggregateUsageCost,
  emptyPricingRepository,
  staticPricingRepository,
  type ModelPricingConfig,
} from '@/features/admin/operational/operationalContracts';

const price = (model: string): ModelPricingConfig => ({
  provider: 'openai', model, effectiveFrom: '2026-01-01', currency: 'KRW',
  unit: 'per_1k_tokens', inputUnitPrice: 2, cachedInputUnitPrice: null, outputUnitPrice: 4,
});

describe('emptyPricingRepository (V1 default — NOT_CONFIGURED)', () => {
  it('returns null for any model', () => {
    expect(emptyPricingRepository.getPricing('gpt-x')).toBeNull();
    expect(emptyPricingRepository.list()).toHaveLength(0);
  });
  it('yields a null aggregate cost (never fake ₩0)', () => {
    const a = aggregateUsageCost(
      [{ model: 'gpt-x', inputTokens: 1000, outputTokens: 1000 }],
      emptyPricingRepository.asMap(),
    );
    expect(a.cost).toBeNull();
    expect(a.totalRequests).toBe(1);
  });
});

describe('staticPricingRepository', () => {
  const repo = staticPricingRepository([price('gpt-a'), price('gpt-b')]);
  it('looks up by model and returns null for unknown', () => {
    expect(repo.getPricing('gpt-a')?.model).toBe('gpt-a');
    expect(repo.getPricing('unknown')).toBeNull();
  });
  it('feeds aggregateUsageCost via asMap()', () => {
    const a = aggregateUsageCost(
      [{ model: 'gpt-a', inputTokens: 1000, outputTokens: 1000 }],
      repo.asMap(),
    );
    expect(a.cost!.total).toBe(6);
    expect(a.cost!.complete).toBe(true);
  });
});
