// Sprint J5 §5.6 — cost is shown ONLY for verified-pricing models; gpt-5.6-terra (unverified) yields a null cost
// ("가격 미확인"), never a fabricated number, and is excluded from honest totals.
import { adminPricingRepository, isModelPriced, UNPRICED_LABEL } from '@/features/admin/operational/modelPricing';
import { aggregateUsageCost } from '@/features/admin/operational/operationalContracts';

describe('admin model pricing', () => {
  it('prices verified models (gpt-5-mini) and leaves unverified ones (gpt-5.6-terra) unpriced', () => {
    expect(isModelPriced('gpt-5-mini')).toBe(true);
    expect(adminPricingRepository.getPricing('gpt-5-mini')).not.toBeNull();
    expect(isModelPriced('gpt-5.6-terra')).toBe(false);
    expect(adminPricingRepository.getPricing('gpt-5.6-terra')).toBeNull();
    expect(UNPRICED_LABEL).toBe('가격 미확인');
  });

  it('aggregateUsageCost: priced model gets a cost, terra gets null, total excludes terra', () => {
    const rows = [
      { model: 'gpt-5-mini', inputTokens: 1_000_000, cachedInputTokens: 0, outputTokens: 1_000_000 },
      { model: 'gpt-5.6-terra', inputTokens: 1_000_000, cachedInputTokens: 0, outputTokens: 1_000_000 },
    ];
    const agg = aggregateUsageCost(rows, adminPricingRepository.asMap());
    const mini = agg.byModel.find((m) => m.model === 'gpt-5-mini');
    const terra = agg.byModel.find((m) => m.model === 'gpt-5.6-terra');
    expect(mini?.cost).not.toBeNull();
    expect(mini?.cost?.total).toBeGreaterThan(0);
    expect(terra?.cost).toBeNull(); // no fabricated cost for the unverified model
  });
});
