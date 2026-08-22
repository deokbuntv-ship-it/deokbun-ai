// Purchase state machine + reconciliation planner (Sprint I §23/§25/§34/§35). Pure + dry-run-safe. Standardizes
// the internal purchase status and decides recovery actions for split-brain states (provider verified → DB
// timeout, or DB committed → HTTP response lost). No I/O, no provider call — a planner the owner runs read-only.

export type PurchaseStatus =
  | 'RECEIVED'              // opaque submission accepted, not yet verified
  | 'VERIFIED'             // provider signature/state verified
  | 'GRANT_PENDING'        // verified, grant transaction in flight
  | 'GRANTED'             // Duk granted (terminal happy path)
  | 'REVOKED'             // refund/chargeback reversed
  | 'FAILED'              // verification failed (terminal)
  | 'RECONCILIATION_REQUIRED'; // provider says one thing, DB another → needs reconcile

const ALLOWED: Record<PurchaseStatus, PurchaseStatus[]> = {
  RECEIVED: ['VERIFIED', 'FAILED'],
  VERIFIED: ['GRANT_PENDING', 'FAILED', 'RECONCILIATION_REQUIRED'],
  GRANT_PENDING: ['GRANTED', 'RECONCILIATION_REQUIRED'],
  GRANTED: ['REVOKED'],
  REVOKED: [],
  FAILED: [],
  RECONCILIATION_REQUIRED: ['GRANTED', 'REVOKED', 'FAILED'],
};

export function canTransition(from: PurchaseStatus, to: PurchaseStatus): boolean {
  return (ALLOWED[from] ?? []).includes(to);
}

// §25 response-loss: a retry of an already-GRANTED external id must replay the result, never re-grant.
export function planRetry(existingStatus: PurchaseStatus | null): 'REPLAY_GRANTED' | 'REPLAY_REVOKED' | 'PROCESS_NEW' | 'IN_FLIGHT' {
  if (existingStatus === 'GRANTED') return 'REPLAY_GRANTED';
  if (existingStatus === 'REVOKED') return 'REPLAY_REVOKED';
  if (existingStatus === 'GRANT_PENDING') return 'IN_FLIGHT';
  return 'PROCESS_NEW';
}

// ── reconciliation planner (§34/§35) — dry-run by default: DECIDE actions, never execute ────────────────────
export type ReserveRow = { reservationId: string; status: 'RESERVED' | 'COMMITTED' | 'RELEASED' | 'EXPIRED'; version: number; expiresAtEpoch: number };
export type ReserveAction = { reservationId: string; action: 'EXPIRE' | 'NONE'; reason: string };

/** Stale RESERVED holds past TTL → propose EXPIRE (fenced by version). A COMMITTED row is NEVER released (§34). */
export function planReserveReconciliation(rows: ReserveRow[], nowEpoch: number): ReserveAction[] {
  return rows.map((r) => {
    if (r.status !== 'RESERVED') return { reservationId: r.reservationId, action: 'NONE', reason: `terminal:${r.status}` };
    if (nowEpoch < r.expiresAtEpoch) return { reservationId: r.reservationId, action: 'NONE', reason: 'not-yet-expired' };
    return { reservationId: r.reservationId, action: 'EXPIRE', reason: 'stale-reserved-past-ttl' };
  });
}

export type PurchaseRow = { externalTransactionId: string; localStatus: PurchaseStatus | null; providerState: 'PURCHASED' | 'REFUNDED' | 'PENDING' | 'UNKNOWN' };
export type PurchaseReconcileAction = { externalTransactionId: string; action: 'GRANT' | 'REVOKE' | 'NONE' | 'INVESTIGATE'; reason: string };

/** Compare provider truth vs local status → propose the reconciling action (dry-run). */
export function planPurchaseReconciliation(rows: PurchaseRow[]): PurchaseReconcileAction[] {
  return rows.map((r) => {
    if (r.providerState === 'PURCHASED' && r.localStatus !== 'GRANTED' && r.localStatus !== 'REVOKED') {
      return { externalTransactionId: r.externalTransactionId, action: 'GRANT', reason: 'provider-purchased-local-ungranted' };
    }
    if (r.providerState === 'REFUNDED' && r.localStatus === 'GRANTED') {
      return { externalTransactionId: r.externalTransactionId, action: 'REVOKE', reason: 'provider-refunded-local-granted' };
    }
    if (r.providerState === 'UNKNOWN') {
      return { externalTransactionId: r.externalTransactionId, action: 'INVESTIGATE', reason: 'provider-state-unknown' };
    }
    return { externalTransactionId: r.externalTransactionId, action: 'NONE', reason: 'consistent' };
  });
}
