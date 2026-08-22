// Sprint G §R/§AO — client wallet service: READ-only over server state + candle light RPC. The client never
// grants/spends/reserves; those verbs are not even exposed here.
const from = jest.fn();
const rpc = jest.fn();
jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => ({ from, rpc }) }));

import { getWalletState, lightCandle } from '@/features/duk/dukWalletService';

beforeEach(() => { from.mockReset(); rpc.mockReset(); });

describe('§R getWalletState — combines bucket balances + open debt (read only)', () => {
  it('sums PLUS/REWARD/PAID and open debt into spendable', async () => {
    from.mockImplementation((table: string) => {
      if (table === 'duk_balance') return { select: () => Promise.resolve({ data: [
        { bucket: 'PLUS', balance: 2 }, { bucket: 'REWARD', balance: 3 }, { bucket: 'PAID', balance: 40 },
      ] }) };
      if (table === 'duk_debt') return { select: () => ({ eq: () => Promise.resolve({ data: [{ amount: 5 }] }) }) };
      return { select: () => Promise.resolve({ data: [] }) };
    });
    const w = await getWalletState();
    expect(w).toEqual({ plus: 2, reward: 3, paid: 40, debt: 5, totalSpendable: 45 });
  });

  it('a read failure yields a safe empty wallet (non-blocking)', async () => {
    from.mockImplementation(() => { throw new Error('db down'); });
    expect(await getWalletState()).toEqual({ plus: 0, reward: 0, paid: 0, debt: 0, totalSpendable: 0 });
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
  it('granted result is surfaced', async () => {
    rpc.mockResolvedValue({ data: { granted: true, next_available_at: '2026-08-23T00:00:00Z', reward_amount: 1 }, error: null });
    const r = await lightCandle();
    expect(rpc).toHaveBeenCalledWith('light_candle');
    expect(r).toEqual({ granted: true, nextAvailableAt: '2026-08-23T00:00:00Z', rewardAmount: 1 });
  });
  it('an error yields granted:false (non-blocking)', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'cooldown' } });
    expect((await lightCandle()).granted).toBe(false);
  });
});
