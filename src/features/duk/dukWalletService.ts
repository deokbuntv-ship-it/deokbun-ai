// Client Duk wallet service (Sprint G §R/§AO). READ-ONLY over server-authoritative state + the ONE mutation a
// client may trigger: lighting its own candle (a free reward, via an auth RPC keyed by auth.uid()). The client
// NEVER grants/spends/reserves/commits/releases/reverses Duk or modifies debt — those are service-role RPCs
// invoked by the Edge after the LLM. Non-blocking reads (a failure yields a safe empty/locked state).
import { getSupabaseClient } from '@/services/supabase';
import { candleAvailability, type CandleAvailability } from './candle';

export type WalletState = {
  plus: number;
  reward: number;
  paid: number;
  debt: number;
  totalSpendable: number; // plus + reward + paid (UI may show this single number)
};

const EMPTY: WalletState = { plus: 0, reward: 0, paid: 0, debt: 0, totalSpendable: 0 };

/** Read the server-authoritative wallet (duk_balance view + duk_debt). READ only; never mutates. */
export async function getWalletState(): Promise<WalletState> {
  try {
    const supabase = getSupabaseClient();
    const [{ data: balances }, { data: debts }] = await Promise.all([
      supabase.from('duk_balance').select('bucket,balance'),
      supabase.from('duk_debt').select('amount').eq('resolved', false),
    ]);
    const state: WalletState = { ...EMPTY };
    for (const row of (balances ?? []) as { bucket?: string; balance?: number }[]) {
      const v = Number(row.balance ?? 0);
      if (row.bucket === 'PLUS') state.plus = v;
      else if (row.bucket === 'REWARD') state.reward = v;
      else if (row.bucket === 'PAID') state.paid = v;
    }
    state.debt = ((debts ?? []) as { amount?: number }[]).reduce((n, d) => n + Number(d.amount ?? 0), 0);
    state.totalSpendable = Math.max(0, state.plus) + Math.max(0, state.reward) + Math.max(0, state.paid);
    return state;
  } catch {
    return { ...EMPTY };
  }
}

/** Read candle availability from candle_state + the active economy policy (server time via `now`). */
export async function getCandleAvailability(nowEpochSeconds: number): Promise<CandleAvailability> {
  try {
    const supabase = getSupabaseClient();
    const [{ data: candle }, { data: policy }] = await Promise.all([
      supabase.from('candle_state').select('last_lit_at').maybeSingle(),
      supabase.from('economy_policy').select('candle_reward,candle_cooldown_seconds').eq('is_active', true).maybeSingle(),
    ]);
    const lastLit = (candle as { last_lit_at?: string | null } | null)?.last_lit_at ?? null;
    const p = policy as { candle_reward?: number; candle_cooldown_seconds?: number } | null;
    return candleAvailability(
      { lastLitAtEpoch: lastLit ? Math.floor(new Date(lastLit).getTime() / 1000) : null },
      nowEpochSeconds,
      { cooldownSeconds: p?.candle_cooldown_seconds, rewardAmount: p?.candle_reward },
    );
  } catch {
    return { canLight: false, nextAvailableAtEpoch: null, rewardAmount: 0 };
  }
}

export type LightCandleResult = { granted: boolean; nextAvailableAt: string | null; rewardAmount: number };

/** Trigger the server-authoritative candle light (auth RPC; atomic cooldown; idempotent under concurrency). */
export async function lightCandle(): Promise<LightCandleResult> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('light_candle');
    if (error || !data || typeof data !== 'object') return { granted: false, nextAvailableAt: null, rewardAmount: 0 };
    const d = data as { granted?: boolean; next_available_at?: string | null; reward_amount?: number };
    return { granted: d.granted === true, nextAvailableAt: d.next_available_at ?? null, rewardAmount: Number(d.reward_amount ?? 0) };
  } catch {
    return { granted: false, nextAvailableAt: null, rewardAmount: 0 };
  }
}
