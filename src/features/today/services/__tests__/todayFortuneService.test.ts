// Load-or-create behavior for 오늘의 운세 (§25/§54/§57/§74). Supabase mocked. Asserts the cost guard: a
// same-day cache hit makes ZERO edge/LLM calls; a miss makes exactly ONE generation then persists.
type Row = Record<string, unknown> | null;
const store: { byDate: Record<string, Row>; invoke: { data: unknown; error: unknown }; invokeCalls: number; upserts: Record<string, unknown>[] } = {
  byDate: {},
  invoke: { data: null, error: null },
  invokeCalls: 0,
  upserts: [],
};

jest.mock('@/services/supabase', () => ({
  getSupabaseClient: () => ({
    from: (table: string) => {
      // fortune_generation_claims: model a WON claim (single first-load) so the happy path is unchanged; the
      // concurrent loser/stale paths are covered by generationClaim.test.ts.
      if (table === 'fortune_generation_claims') {
        const cq: Record<string, unknown> = {};
        Object.assign(cq, {
          upsert: () => cq,
          select: () => cq,
          eq: () => cq,
          delete: () => cq,
          maybeSingle: () => Promise.resolve({ data: { claim_key: 'k' }, error: null }), // 'won'
        });
        return cq;
      }
      const q: Record<string, unknown> = {};
      let eqDate: string | null = null;
      Object.assign(q, {
        select: () => q,
        order: () => q,
        limit: () => q,
        eq: (_col: string, val: string) => {
          eqDate = val;
          return q;
        },
        maybeSingle: () => Promise.resolve({ data: eqDate ? store.byDate[eqDate] ?? null : null, error: null }),
        upsert: (body: Record<string, unknown>) => {
          store.upserts.push(body);
          const fd = body.fortune_date as string;
          // Simulate the DB writing the canonical row (unless a concurrent winner already exists).
          store.byDate[fd] = store.byDate[fd] ?? {
            id: 'row-' + fd,
            fortune_date: fd,
            timezone: 'Asia/Seoul',
            overall_tone: body.overall_tone,
            result_json: body.result_json,
            evidence_version: body.evidence_version ?? null,
            policy_version: body.policy_version ?? null,
            model: body.model ?? null,
            created_at: '2026-08-19T00:00:00Z',
            updated_at: '2026-08-19T00:00:00Z',
          };
          return Promise.resolve({ error: null });
        },
      });
      return q;
    },
    functions: {
      invoke: () => {
        store.invokeCalls += 1;
        return Promise.resolve(store.invoke);
      },
    },
  }),
}));

import { todayFortuneService } from '@/features/today/services/todayFortuneService';
import { clientTodayFortuneDateGuess } from '@/features/today';
import type { BirthInfoDraft } from '@/features/consultation';

const SELF: BirthInfoDraft = {
  displayName: '나', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '6', birthDay: '15', birthTimeAccuracy: 'exact',
  birthHour: '9', birthMinute: '30', approximateTimePeriod: null, birthPlace: '서울',
};
// Resolve "today" the SAME KST way the service does (§29). Using new Date().toISOString() (UTC) would
// disagree with the service between UTC 15:00–24:00 (= KST 00:00–09:00) and flake the cache-hit assertions.
const today = clientTodayFortuneDateGuess(Date.now());

const genOk = {
  ok: true, fortuneDate: today, overallTone: '좋은 흐름',
  result: { headline: 'h', overallSummary: 's', overallTone: '좋은 흐름', highlights: [], cautions: [], actionTip: 'a', consultationPrompts: [] },
  policyVersion: 'today@1.0.0', evidenceVersion: 'today-evidence@1.0.0', model: 'gpt-5-mini',
};

beforeEach(() => {
  store.byDate = {};
  store.invoke = { data: null, error: null };
  store.invokeCalls = 0;
  store.upserts = [];
});

describe('todayFortuneService.ensureToday — cost guard + persist', () => {
  it('CACHE HIT → returns the row with ZERO edge/LLM calls (§54/§74)', async () => {
    store.byDate[today] = { id: 'x', fortune_date: today, timezone: 'Asia/Seoul', overall_tone: '무난한 흐름', result_json: genOk.result, evidence_version: null, policy_version: null, model: null, created_at: 't', updated_at: 't' };
    const out = await todayFortuneService.ensureToday({ birthInput: SELF });
    expect(out.status).toBe('ok');
    if (out.status !== 'ok') throw new Error('unreachable');
    expect(out.cacheHit).toBe(true);
    expect(store.invokeCalls).toBe(0);
  });

  it('CACHE MISS → exactly ONE edge generation, then persists + returns the record', async () => {
    store.invoke = { data: genOk, error: null };
    const out = await todayFortuneService.ensureToday({ birthInput: SELF });
    expect(store.invokeCalls).toBe(1);
    expect(out.status).toBe('ok');
    if (out.status !== 'ok') throw new Error('unreachable');
    expect(out.cacheHit).toBe(false);
    expect(out.record.fortuneDate).toBe(today);
    expect(store.upserts).toHaveLength(1);
    // The write key is the SERVER's authoritative fortune_date (§29).
    expect(store.upserts[0].fortune_date).toBe(today);
  });

  it('EVIDENCE_UNAVAILABLE from the edge → unavailable (retry will not help)', async () => {
    store.invoke = { data: { ok: false, reason: 'EVIDENCE_UNAVAILABLE', fortuneDate: today }, error: null };
    expect((await todayFortuneService.ensureToday({ birthInput: SELF })).status).toBe('unavailable');
  });

  it('a 401 transport error surfaces as auth', async () => {
    store.invoke = { data: null, error: { message: 'x', context: { status: 401 } } };
    expect((await todayFortuneService.ensureToday({ birthInput: SELF })).status).toBe('auth');
  });
});
