// Sprint G §AV — Duk economy invariant + concurrency simulations. These lock the CONTRACT the server SQL RPCs
// (spend_duk / grant_duk / candle / reserve, migrations 20260831/20260832) must satisfy. They run against the
// pure runtime-neutral core; the ACTUAL Postgres transaction/locking is LIVE_DB_UNVERIFIED (no local DB) — the
// simulations model the invariants, not the DB engine.
import { allocateSpend, applyPurchaseWithDebt, combinedSpendable } from '@/features/duk/walletCore';
import { newSession, applyTurn, commitReserve, reconcileExpired } from '@/features/duk/sessionBilling';
import { attemptLightCandle, candleAvailability } from '@/features/duk/candle';

describe('§P allocateSpend — fixed PLUS→REWARD→PAID priority, non-negative, never over-spends', () => {
  it('spends PLUS first, then REWARD, then PAID', () => {
    const r = allocateSpend({ PLUS: 3, REWARD: 4, PAID: 10 }, 5);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.allocation).toEqual([{ bucket: 'PLUS', amount: 3 }, { bucket: 'REWARD', amount: 2 }]);
    if (r.ok) expect(r.remainingByBucket).toEqual({ PLUS: 0, REWARD: 2, PAID: 10 });
  });
  it('preserves PAID when cheaper buckets cover the cost', () => {
    const r = allocateSpend({ PLUS: 0, REWARD: 12, PAID: 40 }, 12);
    if (r.ok) expect(r.allocation).toEqual([{ bucket: 'REWARD', amount: 12 }]);
    if (r.ok) expect(r.remainingByBucket.PAID).toBe(40);
  });
  it('insufficient balance → INSUFFICIENT_DUK with the exact shortfall, no negative bucket', () => {
    const r = allocateSpend({ PLUS: 1, REWARD: 1, PAID: 1 }, 12);
    expect(r).toEqual({ ok: false, reason: 'INSUFFICIENT_DUK', shortfall: 9 });
  });
  it('rejects non-positive / non-integer amounts', () => {
    expect(allocateSpend({ PLUS: 10, REWARD: 0, PAID: 0 }, 0).ok).toBe(false);
    expect(allocateSpend({ PLUS: 10, REWARD: 0, PAID: 0 }, 2.5).ok).toBe(false);
  });
});

describe('§P two simultaneous spends serialize (only one succeeds when balance covers one)', () => {
  it('the second spend sees the post-first balance and fails when it no longer fits', () => {
    // Model the DB advisory-lock: spends apply sequentially against the shared balance.
    let balances = { PLUS: 0, REWARD: 0, PAID: 12 };
    const first = allocateSpend(balances, 12);
    expect(first.ok).toBe(true);
    if (first.ok) balances = first.remainingByBucket; // committed
    const second = allocateSpend(balances, 12); // concurrent 12-Duk spend now has 0
    expect(second.ok).toBe(false); // no double-spend
  });
});

describe('§AA purchase applies to debt first', () => {
  it('debt 10 + grant 50 → debt 0, spendable PAID 40', () => {
    expect(applyPurchaseWithDebt(10, 50)).toEqual({ debtCleared: 10, newDebt: 0, spendablePaid: 40 });
  });
  it('grant smaller than debt → still in debt, 0 spendable', () => {
    expect(applyPurchaseWithDebt(30, 20)).toEqual({ debtCleared: 20, newDebt: 10, spendablePaid: 0 });
  });
  it('combinedSpendable sums buckets', () => {
    expect(combinedSpendable({ PLUS: 1, REWARD: 2, PAID: 3 })).toBe(6);
  });
});

describe('§Q/§U/§V session billing — charge once on first success, no refund on later fail', () => {
  const NOW = 1_800_000_000;
  it('first success commits the price exactly once; turns 2-5 do not re-charge', () => {
    let s = newSession(5, NOW);
    let r = applyTurn(s, 'SUCCESS', NOW + 1); // turn 1
    expect(r.commitCharge).toBe(true);
    expect(r.turnConsumed).toBe(true);
    s = r.session;
    r = applyTurn(s, 'SUCCESS', NOW + 2); // turn 2
    expect(r.commitCharge).toBe(false); // no second charge
    expect(r.session.successfulTurnCount).toBe(2);
  });
  it('first-turn failure releases the reserve and charges 0', () => {
    const s = newSession(12, NOW);
    const r = applyTurn(s, 'FAILURE', NOW + 1);
    expect(r.commitCharge).toBe(false);
    expect(r.releaseReserve).toBe(true);
    expect(r.session.charged).toBe(false);
  });
  it('a later failure does not refund and does not consume a turn', () => {
    let s = newSession(5, NOW);
    s = applyTurn(s, 'SUCCESS', NOW + 1).session; // charged
    const r = applyTurn(s, 'FAILURE', NOW + 2);
    expect(r.releaseReserve).toBe(false); // no refund
    expect(r.turnConsumed).toBe(false);
    expect(r.session.successfulTurnCount).toBe(1);
  });
  it('a safety hard-stop never burns a paid turn or charges', () => {
    const s = newSession(5, NOW);
    const r = applyTurn(s, 'SAFETY_HARDSTOP', NOW + 1);
    expect(r.commitCharge).toBe(false);
    expect(r.turnConsumed).toBe(false);
    expect(r.session.successfulTurnCount).toBe(0);
  });
  it('TTL expiry rejects with no charge; turn limit rejects', () => {
    const s = newSession(5, NOW, { ttlSeconds: 10 });
    expect(applyTurn(s, 'SUCCESS', NOW + 20).rejected).toBe('EXPIRED');
    let full = newSession(5, NOW, { turnLimit: 1 });
    full = applyTurn(full, 'SUCCESS', NOW + 1).session;
    expect(applyTurn(full, 'SUCCESS', NOW + 2).rejected).toBe('TURN_LIMIT');
  });
  it('retry of the same first turn cannot double-charge (commit is once)', () => {
    let s = newSession(5, NOW);
    const a = applyTurn(s, 'SUCCESS', NOW + 1);
    s = a.session;
    const b = applyTurn(s, 'SUCCESS', NOW + 1); // a duplicate success (retry semantics at the state level)
    expect(a.commitCharge).toBe(true);
    expect(b.commitCharge).toBe(false); // never twice
  });
});

describe('§X reserve TTL + fencing — expired old worker cannot commit after reuse', () => {
  const NOW = 1_800_000_000;
  it('commit succeeds only with the matching version, before expiry', () => {
    const reserve = { status: 'RESERVED' as const, version: 3, expiresAtEpoch: NOW + 300 };
    expect(commitReserve(reserve, 2, NOW + 1).ok).toBe(false); // stale version fenced out
    expect(commitReserve(reserve, 3, NOW + 400).ok).toBe(false); // expired
    expect(commitReserve(reserve, 3, NOW + 1).ok).toBe(true);
  });
  it('a committed reserve is terminal (never TTL-released, never re-committed)', () => {
    const committed = { status: 'COMMITTED' as const, version: 3, expiresAtEpoch: NOW + 300 };
    expect(reconcileExpired(committed, 3, NOW + 400).ok).toBe(false);
    expect(commitReserve(committed, 3, NOW + 1).ok).toBe(false);
  });
  it('reconciler expires only a stale RESERVED row with the matching version', () => {
    const reserve = { status: 'RESERVED' as const, version: 5, expiresAtEpoch: NOW };
    expect(reconcileExpired(reserve, 5, NOW + 1).ok).toBe(true);
  });
});

describe('§AF candle — first light immediate, then 24h cooldown, concurrent clicks grant once', () => {
  const NOW = 1_800_000_000;
  it('a new user can light immediately; then is on cooldown', () => {
    const first = attemptLightCandle({ lastLitAtEpoch: null }, NOW);
    expect(first.granted).toBe(true);
    expect(first.rewardAmount).toBe(1);
    const again = attemptLightCandle(first.newState, NOW + 60);
    expect(again.granted).toBe(false); // cooldown
  });
  it('two concurrent clicks (same pre-state) → the DB conditional update grants once', () => {
    const state = { lastLitAtEpoch: null };
    const clickA = attemptLightCandle(state, NOW);
    const clickB = attemptLightCandle(state, NOW); // both read the same null pre-state
    // Both compute granted=true, but the DB applies a conditional update on last_lit_at: only the FIRST commit
    // wins. Model that: after A commits, B re-evaluated against A's state must not grant.
    expect(clickA.granted).toBe(true);
    const bAfterA = attemptLightCandle(clickA.newState, NOW);
    expect(bAfterA.granted).toBe(false);
    // (clickB in isolation appears granted; the atomicity is the DB's job — LIVE_DB_UNVERIFIED.)
    expect(clickB.granted).toBe(true);
  });
  it('cooldown elapses → can light again', () => {
    const state = { lastLitAtEpoch: NOW };
    expect(candleAvailability(state, NOW + 24 * 3600).canLight).toBe(true);
    expect(candleAvailability(state, NOW + 24 * 3600 - 1).canLight).toBe(false);
  });
});
