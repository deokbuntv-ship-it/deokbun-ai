type Row = Record<string, unknown> | null;
const store: {
  byMonth: Record<string, Row>;
  invoke: { data: unknown; error: unknown };
  invokeBodies: unknown[];
} = { byMonth: {}, invoke: { data: null, error: null }, invokeBodies: [] };

jest.mock('@/services/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => {
      const query: Record<string, unknown> = {};
      let year: number | null = null;
      let month: number | null = null;
      Object.assign(query, {
        select: () => query,
        order: () => query,
        limit: () => query,
        eq: (column: string, value: unknown) => {
          if (column === 'fortune_year') year = value as number;
          if (column === 'fortune_month') month = value as number;
          return query;
        },
        maybeSingle: () => Promise.resolve({
          data: year !== null && month !== null ? store.byMonth[`${year}-${month}`] ?? null : null,
          error: null,
        }),
      });
      return query;
    },
    functions: {
      invoke: (_name: string, options: { body: unknown }) => {
        store.invokeBodies.push(options.body);
        const generated = store.invoke.data as typeof generatedOk | null;
        if (generated?.ok) {
          store.byMonth[`${generated.year}-${generated.month}`] = {
            id: `row-${generated.year}-${generated.month}`,
            fortune_year: generated.year,
            fortune_month: generated.month,
            timezone: 'Asia/Seoul',
            overall_tier: generated.overallTier,
            result_json: generated.result,
            evidence_version: null,
            plan_version: null,
            policy_version: null,
            model: null,
            created_at: '2026-08-20T00:00:00Z',
            updated_at: '2026-08-20T00:00:00Z',
          };
        }
        return Promise.resolve(store.invoke);
      },
    },
  }),
}));

import { clientCurrentMonthGuess } from '@/features/monthly/engine/monthDate';
import { monthlyFortuneService } from '../monthlyFortuneService';
import type { BirthInfoDraft } from '@/features/consultation';

const SELF = {
  displayName: '나', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '6', birthDay: '15', birthTimeAccuracy: 'unknown',
  birthHour: '', birthMinute: '', approximateTimePeriod: null, birthPlace: '서울',
} as BirthInfoDraft;
const current = clientCurrentMonthGuess(Date.now());
const generatedOk = {
  ok: true,
  year: current.year,
  month: current.month,
  overallTier: 'GOOD',
  result: {
    headline: '월간 흐름', verdict: '좋은 흐름', overall: '차분히 진행하세요.',
    overallTier: 'GOOD', opportunities: [], cautions: [], actions: [], followUps: [],
  },
};

beforeEach(() => {
  store.byMonth = {};
  store.invoke = { data: null, error: null };
  store.invokeBodies = [];
});

describe('monthlyFortuneService server-owned canonical lifecycle', () => {
  it('canonical cache hit uses zero Edge calls', async () => {
    store.byMonth[`${current.year}-${current.month}`] = {
      id: 'cached', fortune_year: current.year, fortune_month: current.month, timezone: 'Asia/Seoul',
      overall_tier: 'GOOD', result_json: generatedOk.result, evidence_version: null,
      plan_version: null, policy_version: null, model: null, created_at: 't', updated_at: 't',
    };
    const result = await monthlyFortuneService.ensureCurrentMonth({ birthInput: SELF });
    expect(result.status).toBe('ok');
    expect(store.invokeBodies).toHaveLength(0);
  });

  it('cache miss sends no SELF authority and reads the Edge-persisted canonical row', async () => {
    store.invoke = { data: generatedOk, error: null };
    const result = await monthlyFortuneService.ensureCurrentMonth({ birthInput: SELF });
    expect(result.status).toBe('ok');
    expect(store.invokeBodies).toEqual([{ kind: 'monthly_fortune' }]);
  });
});
