// Session billing CORE — pure invariant model (Sprint G §Q/§U/§V/§W/§X). The contract the server session +
// reserve RPCs must satisfy: charge exactly once on the FIRST successful turn, no charge on turns 2–5, no
// refund on later-fail/TTL/quit, and a reserve that reaches exactly one terminal state with version fencing.
// Runtime-neutral + unit-testable; production state lives in the DB (consultation_sessions + duk_reserve).

export type ReserveStatus = 'RESERVED' | 'COMMITTED' | 'RELEASED' | 'EXPIRED';

export type SessionState = {
  status: 'OPEN' | 'ACTIVE' | 'COMPLETE' | 'EXPIRED' | 'ABANDONED';
  successfulTurnCount: number;
  turnLimit: number;
  priceDuk: number;
  charged: boolean; // the session price was committed exactly once
  expiresAtEpoch: number;
};

export const DEFAULT_TURN_LIMIT = 5;
export const DEFAULT_SESSION_TTL_SECONDS = 24 * 60 * 60;

export function newSession(priceDuk: number, nowEpoch: number, opts?: { turnLimit?: number; ttlSeconds?: number }): SessionState {
  return {
    status: 'OPEN',
    successfulTurnCount: 0,
    turnLimit: opts?.turnLimit ?? DEFAULT_TURN_LIMIT,
    priceDuk,
    charged: false,
    expiresAtEpoch: nowEpoch + (opts?.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS),
  };
}

export type TurnOutcome = 'SUCCESS' | 'FAILURE' | 'SAFETY_HARDSTOP';

export type TurnBillingResult = {
  session: SessionState;
  commitCharge: boolean; // commit the session price now (first success only)
  releaseReserve: boolean; // release the reserve (first-turn failure) — 0 charged
  turnConsumed: boolean; // did this count toward the turn limit
  rejected?: 'EXPIRED' | 'TURN_LIMIT' | 'NOT_ENTITLED';
};

/**
 * Apply one turn's outcome to the session. Pure. Enforces:
 *  - first SUCCESS → commit the price exactly once; turns 2–5 → no new charge.
 *  - any FAILURE / SAFETY_HARDSTOP → no charge, no refund; a failure/safety turn does NOT consume the quota.
 *  - first-turn failure (before any commit) → release the reserve, 0 charged.
 *  - TTL expiry / turn-limit → rejected, no charge.
 */
export function applyTurn(session: SessionState, outcome: TurnOutcome, nowEpoch: number): TurnBillingResult {
  if (nowEpoch >= session.expiresAtEpoch) {
    return { session: { ...session, status: 'EXPIRED' }, commitCharge: false, releaseReserve: false, turnConsumed: false, rejected: 'EXPIRED' };
  }
  if (session.successfulTurnCount >= session.turnLimit) {
    return { session, commitCharge: false, releaseReserve: false, turnConsumed: false, rejected: 'TURN_LIMIT' };
  }

  // A safety hard-stop never burns a paid turn and never charges (§V).
  if (outcome === 'SAFETY_HARDSTOP') {
    return { session, commitCharge: false, releaseReserve: false, turnConsumed: false };
  }

  if (outcome === 'FAILURE') {
    // First-turn failure (nothing committed yet) → release the reserve; 0 charged. Later failure → no refund.
    const firstTurn = !session.charged && session.successfulTurnCount === 0;
    return { session, commitCharge: false, releaseReserve: firstTurn, turnConsumed: false };
  }

  // SUCCESS
  const commitCharge = !session.charged; // exactly once, on the first success
  const successfulTurnCount = session.successfulTurnCount + 1;
  const charged = session.charged || commitCharge;
  const status: SessionState['status'] = successfulTurnCount >= session.turnLimit ? 'COMPLETE' : 'ACTIVE';
  return {
    session: { ...session, status, successfulTurnCount, charged },
    commitCharge,
    releaseReserve: false,
    turnConsumed: true,
  };
}

// ── reserve state machine with version fencing (§X) ─────────────────────────────────────────────────────────
export type Reserve = { status: ReserveStatus; version: number; expiresAtEpoch: number };

/** A transition is allowed only from a live RESERVED state whose fencing version still matches (CAS). */
export function canTransition(reserve: Reserve, expectedVersion: number, to: ReserveStatus, nowEpoch: number): boolean {
  if (reserve.status !== 'RESERVED') return false; // terminal states never transition again
  if (reserve.version !== expectedVersion) return false; // fencing: a stale worker cannot act
  if (to === 'COMMITTED') return nowEpoch < reserve.expiresAtEpoch; // cannot commit an expired reserve
  return to === 'RELEASED' || to === 'EXPIRED';
}

/** Commit a reserve iff the fencing version matches and it has not expired. COMMITTED is terminal. */
export function commitReserve(reserve: Reserve, expectedVersion: number, nowEpoch: number): { ok: boolean; reserve: Reserve } {
  if (!canTransition(reserve, expectedVersion, 'COMMITTED', nowEpoch)) return { ok: false, reserve };
  return { ok: true, reserve: { ...reserve, status: 'COMMITTED' } };
}

/** The reconciler may expire a stale RESERVED row only if it has not been committed/released (fencing). */
export function reconcileExpired(reserve: Reserve, expectedVersion: number, nowEpoch: number): { ok: boolean; reserve: Reserve } {
  if (reserve.status !== 'RESERVED' || reserve.version !== expectedVersion || nowEpoch < reserve.expiresAtEpoch) {
    return { ok: false, reserve };
  }
  return { ok: true, reserve: { ...reserve, status: 'EXPIRED' } };
}
