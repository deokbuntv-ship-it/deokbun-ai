// Client Duk wallet service (Sprint G §R/§AO). READ-ONLY over server-authoritative state + the ONE mutation a
// client may trigger: lighting its own candle (a free reward, via an auth RPC keyed by auth.uid()). The client
// NEVER grants/spends/reserves/commits/releases/reverses Duk or modifies debt — those are service-role RPCs
// invoked by the Edge after the LLM. Non-blocking reads (a failure yields a safe empty/locked state).
import { getSupabaseClient } from '@/services/supabase';
import { trackProductEvent } from '@/services/productEvents';
import { candleAvailability, type CandleAvailability } from './candle';

export type WalletState = {
  plus: number;
  reward: number;
  paid: number;
  debt: number;
  totalSpendable: number; // plus + reward + paid (UI may show this single number)
};

const EMPTY: WalletState = { plus: 0, reward: 0, paid: 0, debt: 0, totalSpendable: 0 };

/**
 * Read the server-authoritative wallet (duk_balance view + duk_debt). READ only; never mutates.
 * THROWS on a query error (network / RLS / outage) so the caller (walletStore) can surface an error state — a
 * read failure must NOT be shown to a paying user as "0덕". Only a genuinely empty wallet returns zeros.
 */
export async function getWalletState(): Promise<WalletState> {
  const supabase = getSupabaseClient();
  // Scope the read to the authenticated user EXPLICITLY. duk_balance is a plain (non-security_invoker) view, so
  // the client must not rely on the view to apply the caller's RLS — filtering by uid guarantees we only ever
  // sum THIS user's balance (never another user's, never all users'). No session → throw, so the caller shows
  // an error state, never a false "0덕". (device-QA: the wallet must reflect the authoritative per-user balance.)
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) throw new Error('WALLET_NO_SESSION');
  const [balRes, debtRes] = await Promise.all([
    supabase.from('duk_balance').select('bucket,balance').eq('user_id', uid),
    supabase.from('duk_debt').select('amount').eq('user_id', uid).eq('resolved', false),
  ]);
  if (balRes.error || debtRes.error) {
    // Propagate: the store maps this to `error:true` → the wallet/Home show an error + retry, never a false 0.
    throw balRes.error ?? debtRes.error;
  }
  const state: WalletState = { ...EMPTY };
  for (const row of (balRes.data ?? []) as { bucket?: string; balance?: number }[]) {
    const v = Number(row.balance ?? 0);
    if (row.bucket === 'PLUS') state.plus = v;
    else if (row.bucket === 'REWARD') state.reward = v;
    else if (row.bucket === 'PAID') state.paid = v;
  }
  state.debt = ((debtRes.data ?? []) as { amount?: number }[]).reduce((n, d) => n + Number(d.amount ?? 0), 0);
  state.totalSpendable = Math.max(0, state.plus) + Math.max(0, state.reward) + Math.max(0, state.paid);
  return state;
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

export type LightCandleStatus = 'granted' | 'cooldown' | 'error';
export type LightCandleResult = { granted: boolean; status: LightCandleStatus; nextAvailableAt: string | null; rewardAmount: number };

/** Trigger the server-authoritative candle light (auth RPC; atomic cooldown; idempotent under concurrency). */
export async function lightCandle(): Promise<LightCandleResult> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('light_candle');
    // A transient RPC error is NOT a cooldown — surface it distinctly so the UI offers retry, not "내일 다시".
    if (error || !data || typeof data !== 'object') return { granted: false, status: 'error', nextAvailableAt: null, rewardAmount: 0 };
    const d = data as { granted?: boolean; next_available_at?: string | null; reward_amount?: number };
    const granted = d.granted === true;
    const result: LightCandleResult = {
      granted,
      status: granted ? 'granted' : 'cooldown',
      nextAvailableAt: d.next_available_at ?? null,
      rewardAmount: Number(d.reward_amount ?? 0),
    };
    // Analytics (CLIENT_OBSERVED_SERVER_OUTCOME) — emit ONLY on an authoritative grant, never on cooldown/failure.
    // Non-blocking + privacy-safe (allowlisted props); a failure here never affects the candle outcome.
    if (result.granted) {
      void trackProductEvent('candle_lit', {
        surface: 'candle',
        properties: { amount: result.rewardAmount, bucket: 'REWARD', reason: 'CANDLE' },
      }).catch(() => {}); // never let analytics affect the candle outcome
    }
    return result;
  } catch {
    return { granted: false, status: 'error', nextAvailableAt: null, rewardAmount: 0 };
  }
}
