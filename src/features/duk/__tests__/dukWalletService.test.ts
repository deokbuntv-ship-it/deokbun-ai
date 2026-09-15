// Sprint G §R/§AO — client wallet service: READ-only over server state + candle light RPC. The client never
// grants/spends/reserves; those verbs are not even exposed here.
const from = jest.fn();
const rpc = jest.fn();
const getSession = jest.fn(async () => ({ data: { session: { user: { id: 'u1' } } } }));
jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => ({ from, rpc, auth: { getSession } }) }));

import { getWalletState, lightCandle } from '@/features/duk/dukWalletService';

// duk_balance is read user-scoped: .select(...).eq('user_id', uid). Capture the eq arg so tests can assert scoping.
const balanceEq = jest.fn();
function mockBalance(rows: unknown, error: unknown = null) {
  return { select: () => ({ eq: (col: string, val: string) => { balanceEq(col, val); return Promise.resolve({ data: rows, error }); } }) };
}
function mockDebt(rows: unknown, error: unknown = null) {
  // .eq('user_id', uid).eq('resolved', false)
  return { select: () => ({ eq: () => ({ eq: () => Promise.resolve({ data: rows, error }) }) }) };
}

beforeEach(() => {
  from.mockReset(); rpc.mockReset(); balanceEq.mockReset();
  getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
});

describe('§R getWalletState — combines bucket balances + open debt (read only)', () => {
  it('sums PLUS/REWARD/PAID and open debt into spendable, scoped to the authed user', async () => {
    from.mockImplementation((table: string) => {
      if (table === 'duk_balance') return mockBalance([{ bucket: 'PLUS', balance: 2 }, { bucket: 'REWARD', balance: 3 }, { bucket: 'PAID', balance: 40 }]);
      if (table === 'duk_debt') return mockDebt([{ amount: 5 }]);
      return { select: () => Promise.resolve({ data: [] }) };
    });
    const w = await getWalletState();
    expect(w).toEqual({ plus: 2, reward: 3, paid: 40, debt: 5, totalSpendable: 45 });
    // device-QA guard: the balance read is filtered by the current user's id, never an unscoped view read.
    expect(balanceEq).toHaveBeenCalledWith('user_id', 'u1');
  });

  it('no active session THROWS (so an unauth read never shows a false "0덕")', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await expect(getWalletState()).rejects.toThrow();
  });

  it('a read failure THROWS (so the caller shows an error, not a false "0덕") — §J9 fix', async () => {
    from.mockImplementation(() => { throw new Error('db down'); });
    await expect(getWalletState()).rejects.toThrow();
  });

  it('a query-level error THROWS instead of returning a false empty wallet — §J9 fix', async () => {
    from.mockImplementation((table: string) => {
      if (table === 'duk_balance') return mockBalance(null, { message: 'RLS' });
      return mockDebt([]);
    });
    await expect(getWalletState()).rejects.toBeTruthy();
  });

  it('exposes no client spend/grant/reserve verb', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@/features/duk/dukWalletService');
    for (const forbidden of ['spend', 'grant', 'reserve', 'commit', 'release', 'reverse', 'setBalance']) {
      expect(mod[forbidden]).toBeUndefined();
    }
  });
});

describe('§AF lightCandle — calls the server RPC, maps the grant result', () => {
  it('granted result is surfaced (status granted)', async () => {
    rpc.mockResolvedValue({ data: { granted: true, next_available_at: '2026-08-23T00:00:00Z', reward_amount: 1 }, error: null });
    const r = await lightCandle();
    expect(rpc).toHaveBeenCalledWith('light_candle');
    expect(r).toEqual({ granted: true, status: 'granted', nextAvailableAt: '2026-08-23T00:00:00Z', rewardAmount: 1 });
  });
  it('a non-grant (cooldown) → status cooldown, not error (§J9)', async () => {
    rpc.mockResolvedValue({ data: { granted: false, next_available_at: '2026-08-24T00:00:00Z', reward_amount: 1 }, error: null });
    const r = await lightCandle();
    expect(r.granted).toBe(false);
    expect(r.status).toBe('cooldown');
  });
  it('a transient RPC error → status error (retryable), NOT cooldown (§J9)', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const r = await lightCandle();
    expect(r.granted).toBe(false);
    expect(r.status).toBe('error');
  });
});
