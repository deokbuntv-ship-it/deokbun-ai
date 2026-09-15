// Candle reward CORE — pure invariant model (Sprint G §AF). Server-authoritative: a new user may light once
// immediately after signup, then a 24h cooldown; no passive accrual; repeated/concurrent clicks grant once.
// SERVER TIME ONLY (no client clock). Production enforces idempotency + atomicity in the DB; this pure model
// is the contract + unit-testable. Amount is the REWARD_DUK grant (a POLICY value read from economy_policy).

export const DEFAULT_CANDLE_COOLDOWN_SECONDS = 24 * 60 * 60;
export const DEFAULT_CANDLE_REWARD = 1;

export type CandleState = {
  // epoch seconds of the last granted candle, or null if never lit (signup-day first light allowed immediately).
  lastLitAtEpoch: number | null;
};

export type CandleAvailability = {
  canLight: boolean;
  nextAvailableAtEpoch: number | null; // null when it can be lit now
  rewardAmount: number;
};

export function candleAvailability(
  state: CandleState,
  nowEpoch: number,
  opts?: { cooldownSeconds?: number; rewardAmount?: number },
): CandleAvailability {
  const cooldown = opts?.cooldownSeconds ?? DEFAULT_CANDLE_COOLDOWN_SECONDS;
  const rewardAmount = opts?.rewardAmount ?? DEFAULT_CANDLE_REWARD;
  if (state.lastLitAtEpoch === null) {
    return { canLight: true, nextAvailableAtEpoch: null, rewardAmount }; // signup-day first light
  }
  const nextAt = state.lastLitAtEpoch + cooldown;
  return nowEpoch >= nextAt
    ? { canLight: true, nextAvailableAtEpoch: null, rewardAmount }
    : { canLight: false, nextAvailableAtEpoch: nextAt, rewardAmount };
}

/**
 * Decide a light attempt. Pure. The DB layer performs this atomically (a conditional UPDATE on last_lit_at
 * guarded by the cooldown), so a retry / concurrent double-click that arrives before the cooldown grants
 * NOTHING. Returns whether to grant + the new state to persist.
 */
export function attemptLightCandle(
  state: CandleState,
  nowEpoch: number,
  opts?: { cooldownSeconds?: number; rewardAmount?: number },
): { granted: boolean; rewardAmount: number; newState: CandleState } {
  const a = candleAvailability(state, nowEpoch, opts);
  if (!a.canLight) return { granted: false, rewardAmount: 0, newState: state };
  return { granted: true, rewardAmount: a.rewardAmount, newState: { lastLitAtEpoch: nowEpoch } };
}
