// Popular-question CONSUMER load policy (Home IA fallback-policy addendum). The DB is the single source of
// truth; on failure the consumer must get an EMPTY list (Home omits the section) — never stale/curated
// questions. Supabase is mocked; these lock cases A/B/C/E from the addendum.
type QueryResult = { data: unknown; error: unknown };
const state: { result: QueryResult; eqCalls: [string, unknown][]; orderCols: string[] } = {
  result: { data: [], error: null },
  eqCalls: [],
  orderCols: [],
};

jest.mock('@/services/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {};
      Object.assign(q, {
        select: () => q,
        eq: (col: string, val: unknown) => {
          state.eqCalls.push([col, val]);
          return q;
        },
        order: (col: string) => {
          state.orderCols.push(col);
          return q;
        },
        then: (resolve: (r: QueryResult) => void) => resolve(state.result),
      });
      return q;
    },
  }),
}));

import { popularQuestionService, resolveActivePopularQuestions } from '../popularQuestionService';

const row = (over: Partial<Record<string, unknown>> = {}) => ({
  id: 'id-1',
  question_text: '올해 재물운?',
  analytics_key: 'money_flow_year',
  category: 'MONEY',
  is_active: true,
  display_order: 10,
  created_at: 't',
  updated_at: 't',
  ...over,
});

beforeEach(() => {
  state.result = { data: [], error: null };
  state.eqCalls = [];
  state.orderCols = [];
});

describe('listActive — DB contract', () => {
  it('A. success + active rows → mapped questions in the returned (owner) order', async () => {
    state.result = {
      data: [
        row({ id: 'a', analytics_key: 'k_a', display_order: 10 }),
        row({ id: 'b', analytics_key: 'k_b', display_order: 20, category: 'CAREER' }),
      ],
      error: null,
    };
    const out = await popularQuestionService.listActive();
    expect(out.map((q) => q.analyticsKey)).toEqual(['k_a', 'k_b']);
    expect(out[0]).toEqual({
      id: 'a',
      questionText: '올해 재물운?',
      analyticsKey: 'k_a',
      category: 'MONEY',
      displayOrder: 10,
    });
    // filters is_active=true and orders by display_order (owner-authoritative, no auto-ranking).
    expect(state.eqCalls).toContainEqual(['is_active', true]);
    expect(state.orderCols[0]).toBe('display_order');
  });

  it('B. success + 0 active rows → empty list', async () => {
    state.result = { data: [], error: null };
    expect(await popularQuestionService.listActive()).toEqual([]);
  });

  it('C. DB error → THROWS (so the consumer policy can omit the section)', async () => {
    state.result = { data: null, error: { message: 'relation does not exist' } };
    await expect(popularQuestionService.listActive()).rejects.toBeTruthy();
  });
});

describe('resolveActivePopularQuestions — consumer display policy', () => {
  it('A. returns active questions (capped to the limit) on success', async () => {
    state.result = {
      data: [
        row({ id: '1', analytics_key: 'k1', display_order: 10 }),
        row({ id: '2', analytics_key: 'k2', display_order: 20 }),
        row({ id: '3', analytics_key: 'k3', display_order: 30 }),
      ],
      error: null,
    };
    const out = await resolveActivePopularQuestions(2);
    expect(out.map((q) => q.analyticsKey)).toEqual(['k1', 'k2']); // capped, order preserved
  });

  it('B. returns [] when there are 0 active rows (section omitted)', async () => {
    state.result = { data: [], error: null };
    expect(await resolveActivePopularQuestions(5)).toEqual([]);
  });

  it('C+E. returns [] on DB failure (never stale/curated fallback) and logs a safe, PII-free warning', async () => {
    state.result = { data: null, error: { message: 'boom' } };
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const out = await resolveActivePopularQuestions(5);
    expect(out).toEqual([]); // empty → nothing to display → zero impression events (E)
    expect(warn).toHaveBeenCalledTimes(1);
    const msg = String(warn.mock.calls[0]?.[0] ?? '');
    // safe operational log only — no question text / birth / email / token.
    expect(msg).not.toMatch(/재물운|@|birth|token/i);
    warn.mockRestore();
  });

  it('never rejects — failure resolves to [] rather than throwing into render', async () => {
    state.result = { data: null, error: { message: 'boom' } };
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(resolveActivePopularQuestions()).resolves.toEqual([]);
    warn.mockRestore();
  });
});
