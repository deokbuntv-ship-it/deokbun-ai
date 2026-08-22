// Duk wallet CORE — the pure, runtime-neutral invariant model (Sprint G §P/§Q/§AA). This is the CONTRACT the
// server-side `spend_duk` / `grant_duk` SQL RPCs (migration 20260831000000) must satisfy. Production spend runs
// in a single DB transaction (locking + append-only ledger); this module locks the SAME semantics so they are
// unit-testable in Node and can never silently drift. It is NOT the client spend path — the client never
// computes or writes a deduction.
//
// Integer Duk only. No floating point. No negative bucket balances — ever.

export type DukBucket = 'PLUS' | 'REWARD' | 'PAID';

// Fixed spend priority: burn the most-perishable / least-cash-backed bucket first, preserve PAID last.
export const SPEND_PRIORITY: readonly DukBucket[] = ['PLUS', 'REWARD', 'PAID'] as const;

export type DukBalances = { PLUS: number; REWARD: number; PAID: number };

export type SpendAllocation =
  | { ok: true; allocation: { bucket: DukBucket; amount: number }[]; remainingByBucket: DukBalances }
  | { ok: false; reason: 'INSUFFICIENT_DUK'; shortfall: number };

export function combinedSpendable(b: DukBalances): number {
  return (b.PLUS ?? 0) + (b.REWARD ?? 0) + (b.PAID ?? 0);
}

/**
 * Allocate a spend across buckets in the fixed PLUS→REWARD→PAID order. Pure. Returns the per-bucket debits (the
 * SQL RPC writes one immutable ledger row per non-zero entry) or INSUFFICIENT_DUK with the shortfall. Never
 * produces a negative balance.
 */
export function allocateSpend(balances: DukBalances, amount: number): SpendAllocation {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, reason: 'INSUFFICIENT_DUK', shortfall: 0 };
  }
  const total = combinedSpendable(balances);
  if (total < amount) return { ok: false, reason: 'INSUFFICIENT_DUK', shortfall: amount - total };

  const allocation: { bucket: DukBucket; amount: number }[] = [];
  const remaining: DukBalances = { ...balances };
  let need = amount;
  for (const bucket of SPEND_PRIORITY) {
    if (need <= 0) break;
    const avail = Math.max(0, remaining[bucket] ?? 0);
    const take = Math.min(need, avail);
    if (take > 0) {
      allocation.push({ bucket, amount: take });
      remaining[bucket] = avail - take;
      need -= take;
    }
  }
  // total >= amount guaranteed the loop drains `need`; assert defensively.
  if (need !== 0) return { ok: false, reason: 'INSUFFICIENT_DUK', shortfall: need };
  return { ok: true, allocation, remainingByBucket: remaining };
}

/**
 * Apply a new PAID_DUK grant against outstanding debt FIRST (Sprint G §AA). Debt never touches REWARD/PLUS and
 * never makes a bucket negative. Returns how much of the grant clears debt vs becomes spendable PAID Duk.
 */
export function applyPurchaseWithDebt(
  outstandingDebt: number,
  grantAmount: number,
): { debtCleared: number; newDebt: number; spendablePaid: number } {
  const debt = Math.max(0, Math.floor(outstandingDebt || 0));
  const grant = Math.max(0, Math.floor(grantAmount || 0));
  const debtCleared = Math.min(debt, grant);
  return { debtCleared, newDebt: debt - debtCleared, spendablePaid: grant - debtCleared };
}
