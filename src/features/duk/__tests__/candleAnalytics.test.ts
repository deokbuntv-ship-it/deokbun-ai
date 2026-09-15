// Activation 04E — candle_lit analytics wiring. Emits ONLY on an authoritative grant; never on cooldown/failure;
// non-blocking (an analytics failure never changes the candle outcome).
const track = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/productEvents', () => ({ trackProductEvent: (...a: unknown[]) => track(...a) }));
const from = jest.fn();
const rpc = jest.fn();
jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => ({ from, rpc }) }));

import { lightCandle } from '@/features/duk/dukWalletService';

beforeEach(() => { track.mockReset(); track.mockResolvedValue(undefined); rpc.mockReset(); });

describe('candle_lit analytics (CLIENT_OBSERVED_SERVER_OUTCOME)', () => {
  it('emits candle_lit only when the server RPC granted', async () => {
    rpc.mockResolvedValue({ data: { granted: true, next_available_at: null, reward_amount: 1 }, error: null });
    const r = await lightCandle();
    expect(r.granted).toBe(true);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('candle_lit', expect.objectContaining({
      surface: 'candle',
      properties: expect.objectContaining({ amount: 1, bucket: 'REWARD', reason: 'CANDLE' }),
    }));
  });

  it('does NOT emit on cooldown (granted:false)', async () => {
    rpc.mockResolvedValue({ data: { granted: false, next_available_at: 'x', reward_amount: 1 }, error: null });
    await lightCandle();
    expect(track).not.toHaveBeenCalled();
  });

  it('does NOT emit on RPC error (and stays non-blocking)', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'cooldown' } });
    expect((await lightCandle()).granted).toBe(false);
    expect(track).not.toHaveBeenCalled();
  });

  it('an analytics transport rejection does not change the candle outcome', async () => {
    rpc.mockResolvedValue({ data: { granted: true, next_available_at: null, reward_amount: 1 }, error: null });
    track.mockRejectedValue(new Error('analytics down'));
    const r = await lightCandle();
    expect(r.granted).toBe(true); // grant is authoritative; analytics failure is swallowed
  });

  it('candle_lit properties carry no PII keys', async () => {
    rpc.mockResolvedValue({ data: { granted: true, next_available_at: null, reward_amount: 1 }, error: null });
    await lightCandle();
    const props = track.mock.calls[0][1].properties as Record<string, unknown>;
    for (const forbidden of ['name', 'email', 'phone', 'question', 'answer', 'birth', 'prompt', 'text']) {
      expect(Object.keys(props)).not.toContain(forbidden);
    }
  });
});
