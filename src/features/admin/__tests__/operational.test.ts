let rpcRow: Record<string, unknown> = {};
jest.mock('@/services/supabase', () => ({
  __esModule: true,
  getSupabaseClient: () => ({ rpc: async () => ({ data: rpcRow, error: null }) }),
}));

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

// ── ⚠ 정정 (2026-09-06) — "대시보드는 부분 응답 방어가 없다" 는 **틀린 보고였다** ────────────────
//
// §7.28 에 그렇게 적었다. 근거는 렌더 테스트에서 지표 필드를 빠뜨린 mock 이 `toLocaleString` 에서
// 크래시한 것이었는데, 그 mock 은 **서비스를 우회**했다. 실제 경로에서는 `toOverview` 가 모든 필드를
// `num()` 으로 강제 변환하므로(누락·null·문자열 → 0) 화면이 undefined 를 볼 일이 없다.
//
// 같은 종류의 오판이 이번이 두 번째다(지갑의 `+NaN덕` 도 mock 이 `rewardAmount` 를 빠뜨린 것이었다).
// **mock 이 서비스를 건너뛰면 화면 결함이 아니라 mock 결함을 보게 된다.** 그래서 화면이 기대는
// 서비스 계약을 여기서 잠근다 — 이쪽이 진짜 방어선이다.
// 실제 경로로 검사한다 — `toOverview` 를 테스트용으로 export 하면 프로덕션에 테스트 전용 구멍이 생긴다.
describe('⚠ 대시보드 개요 — 부분 응답을 서비스가 정규화한다 (화면이 기대는 계약)', () => {
  const FIELDS = [
    'userCount', 'subjectCount', 'conversationCount', 'conversationToday',
    'aiRequestCount', 'aiSuccessCount', 'aiErrorCount',
    'aiInputTokens', 'aiOutputTokens', 'aiTodayRequestCount',
  ] as const;

  const overviewFrom = async (row: Record<string, unknown>) => {
    rpcRow = row;
    const { adminOpsService } = await import('@/features/admin/services/adminOpsService');
    return adminOpsService.getDashboardOverview();
  };

  it('빈 응답이어도 열 필드가 모두 숫자다 — undefined 가 화면에 도달하지 않는다', async () => {
    const out = await overviewFrom({});
    for (const f of FIELDS) {
      expect(typeof out[f]).toBe('number');
      expect(Number.isFinite(out[f])).toBe(true);
    }
  });

  it('null·문자열·NaN 도 0 으로 접힌다', async () => {
    const out = await overviewFrom({ user_count: null, ai_request_count: 'abc', ai_error_count: '17' });
    expect(out.userCount).toBe(0);
    expect(out.aiRequestCount).toBe(0);
    expect(out.aiErrorCount).toBe(17); // 숫자 문자열은 살린다
  });
});
