// Sprint J5 §5.6 — cost is shown ONLY for verified-pricing models; an unverified model yields a null cost
// ("가격 미확인"), never a fabricated number, and is excluded from honest totals.
//
// 2026-09-02: gpt-5.6-terra moved from unverified → verified (developers.openai.com/api/docs/pricing,
// Standard tier) for the cost benchmark, so it now carries a real cost. The null-not-zero property is what
// these tests actually protect, so it is asserted against a model that is still genuinely unpriced.
import { adminPricingRepository, isModelPriced, UNPRICED_LABEL } from '@/features/admin/operational/modelPricing';
import { aggregateUsageCost } from '@/features/admin/operational/operationalContracts';

const UNVERIFIED_MODEL = 'some-unverified-model';

describe('admin model pricing', () => {
  it('prices verified models and leaves unlisted ones unpriced', () => {
    expect(isModelPriced('gpt-5-mini')).toBe(true);
    expect(adminPricingRepository.getPricing('gpt-5-mini')).not.toBeNull();
    expect(isModelPriced(UNVERIFIED_MODEL)).toBe(false);
    expect(adminPricingRepository.getPricing(UNVERIFIED_MODEL)).toBeNull();
    expect(UNPRICED_LABEL).toBe('가격 미확인');
  });

  it('gpt-5.6-terra is verified at the retrieved 2026-09-02 Standard-tier prices', () => {
    const terra = adminPricingRepository.getPricing('gpt-5.6-terra');
    expect(terra).not.toBeNull();
    expect(terra?.inputUnitPrice).toBe(2.0);
    expect(terra?.cachedInputUnitPrice).toBe(0.2);
    expect(terra?.outputUnitPrice).toBe(12.0);
    expect(terra?.unit).toBe('per_1m_tokens');
    expect(terra?.currency).toBe('USD');
  });

  it('aggregateUsageCost: priced models get a cost, an unlisted model gets null', () => {
    const rows = [
      { model: 'gpt-5-mini', inputTokens: 1_000_000, cachedInputTokens: 0, outputTokens: 1_000_000 },
      { model: 'gpt-5.6-terra', inputTokens: 1_000_000, cachedInputTokens: 0, outputTokens: 1_000_000 },
      { model: UNVERIFIED_MODEL, inputTokens: 1_000_000, cachedInputTokens: 0, outputTokens: 1_000_000 },
    ];
    const agg = aggregateUsageCost(rows, adminPricingRepository.asMap());
    const mini = agg.byModel.find((m) => m.model === 'gpt-5-mini');
    const terra = agg.byModel.find((m) => m.model === 'gpt-5.6-terra');
    const unknown = agg.byModel.find((m) => m.model === UNVERIFIED_MODEL);
    expect(mini?.cost?.total).toBeGreaterThan(0);
    // 1M input + 1M output at $2 / $12 → $14.00. Terra is 7× mini's $2.25 for the same tokens.
    expect(terra?.cost?.total).toBeCloseTo(14.0, 6);
    expect(unknown?.cost).toBeNull(); // no fabricated cost for a model with no verified price
  });
});
