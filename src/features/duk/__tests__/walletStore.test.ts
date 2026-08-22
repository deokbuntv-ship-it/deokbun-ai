// Sprint J1 — wallet refresh seam (pure factory; server read is authority; single-flight; non-crashing on error).
import { createWalletStore } from '@/features/duk/walletStore';

const WALLET = { plus: 0, reward: 11, paid: 0, debt: 0, totalSpendable: 11 };

describe('createWalletStore', () => {
  it('starts empty', () => {
    const s = createWalletStore(async () => WALLET);
    expect(s.get()).toEqual({ state: null, loading: false, error: false });
  });

  it('refresh loads the server wallet and notifies subscribers', async () => {
    const s = createWalletStore(async () => WALLET);
    const seen: boolean[] = [];
    s.subscribe(() => seen.push(s.get().loading));
    await s.refresh();
    expect(s.get()).toEqual({ state: WALLET, loading: false, error: false });
    expect(seen[0]).toBe(true);          // loading emitted first
    expect(seen[seen.length - 1]).toBe(false); // then settled
  });

  it('a fetch failure sets error and preserves the prior state (no crash)', async () => {
    let ok = true;
    const s = createWalletStore(async () => { if (!ok) throw new Error('down'); return WALLET; });
    await s.refresh();
    ok = false;
    await s.refresh();
    expect(s.get().error).toBe(true);
    expect(s.get().state).toEqual(WALLET); // prior server value retained
  });

  it('single-flights concurrent refreshes into one server read', async () => {
    let calls = 0;
    const s = createWalletStore(async () => { calls += 1; return WALLET; });
    await Promise.all([s.refresh(), s.refresh(), s.refresh()]);
    expect(calls).toBe(1);
  });

  it('unsubscribe stops notifications', async () => {
    const s = createWalletStore(async () => WALLET);
    let n = 0;
    const off = s.subscribe(() => { n += 1; });
    off();
    await s.refresh();
    expect(n).toBe(0);
  });
});
