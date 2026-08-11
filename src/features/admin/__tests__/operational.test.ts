// Coverage for the admin operational cost logic (directive §10/§13): computeCost
// and the honest usage aggregator (never fabricates a total for unpriced models).
import {
  aggregateUsageCost,
  computeCost,
  type ModelPricingConfig,
  type UsageRow,
} from '@/features/admin/operational/operationalContracts';

const price = (model: string, input: number, output: number, cached: number | null = null): ModelPricingConfig => ({
  provider: 'openai',
  model,
  effectiveFrom: '2026-01-01',
  currency: 'KRW',
  unit: 'per_1k_tokens',
  inputUnitPrice: input,
  cachedInputUnitPrice: cached,
  outputUnitPrice: output,
});

describe('computeCost', () => {
  it('returns null when there is no pricing or the model mismatches (never fake 0)', () => {
    expect(computeCost({ model: 'x', inputTokens: 1000, outputTokens: 1000 }, null)).toBeNull();
    expect(computeCost({ model: 'x', inputTokens: 1000, outputTokens: 1000 }, price('y', 2, 4))).toBeNull();
  });

  it('prices per-1k input + output', () => {
    const c = computeCost({ model: 'x', inputTokens: 1000, outputTokens: 1000 }, price('x', 2, 4));
    expect(c).not.toBeNull();
    expect(c!.total).toBe(6);
  });

  it('separates cached input tokens from normal input when a cached price exists', () => {
    // 1000 input of which 400 cached; cached@1, normal(600)@2, output(1000)@4
    const c = computeCost(
      { model: 'x', inputTokens: 1000, cachedInputTokens: 400, outputTokens: 1000 },
      price('x', 2, 4, 1),
    );
    expect(c!.input).toBeCloseTo(1.2); // 600/1000 * 2
    expect(c!.cachedInput).toBeCloseTo(0.4); // 400/1000 * 1
    expect(c!.output).toBe(4);
    expect(c!.total).toBeCloseTo(5.6);
  });
});

describe('aggregateUsageCost', () => {
  const rows = (m: string, n: number): UsageRow[] =>
    Array.from({ length: n }, () => ({ model: m, inputTokens: 1000, outputTokens: 1000 }));

  it('handles an empty set', () => {
    const a = aggregateUsageCost([], {});
    expect(a.byModel).toHaveLength(0);
    expect(a.totalRequests).toBe(0);
    expect(a.cost).toBeNull();
  });

  it('groups rows by model and sums requests + tokens', () => {
    const a = aggregateUsageCost([...rows('gpt-a', 3), ...rows('gpt-b', 2)], { 'gpt-a': price('gpt-a', 2, 4) });
    const ga = a.byModel.find((m) => m.model === 'gpt-a')!;
    expect(ga.requests).toBe(3);
    expect(ga.inputTokens).toBe(3000);
    expect(a.totalRequests).toBe(5);
    expect(a.totalInputTokens).toBe(5000);
  });

  it('marks the total INCOMPLETE when any model is unpriced (no fabricated omission)', () => {
    const a = aggregateUsageCost([...rows('gpt-a', 1), ...rows('gpt-b', 1)], { 'gpt-a': price('gpt-a', 2, 4) });
    // gpt-a: (1000/1000*2)+(1000/1000*4)=6 ; gpt-b: unpriced -> cost null
    expect(a.cost).not.toBeNull();
    expect(a.cost!.total).toBe(6);
    expect(a.cost!.complete).toBe(false);
    expect(a.byModel.find((m) => m.model === 'gpt-b')!.cost).toBeNull();
  });

  it('reports a complete total when every model is priced in one currency', () => {
    const a = aggregateUsageCost([...rows('gpt-a', 1), ...rows('gpt-b', 1)], {
      'gpt-a': price('gpt-a', 2, 4),
      'gpt-b': price('gpt-b', 1, 1),
    });
    expect(a.cost!.total).toBe(6 + 2);
    expect(a.cost!.complete).toBe(true);
    expect(a.cost!.currency).toBe('KRW');
  });

  it('returns null cost when nothing is priced (cost unknown, not zero)', () => {
    const a = aggregateUsageCost(rows('gpt-a', 2), {});
    expect(a.cost).toBeNull();
    expect(a.totalRequests).toBe(2);
  });
});
