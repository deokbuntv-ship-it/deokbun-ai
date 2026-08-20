import { ensureClaimedGeneration, waitForCanonical, type ClaimResult } from '../generationClaim';

// Cost-invariant tests (§A15): the injected generateAndPersist stands in for the ONE paid LLM call, so its
// call count IS the LLM-call count. These lock the economic invariant, not just status. (Live Postgres claim
// atomicity is OWNER E2E — jest cannot prove it.)
type Rec = { id: string };
const REC: Rec = { id: 'canonical' };

function deps(over: Partial<Parameters<typeof ensureClaimedGeneration<Rec>>[0]>) {
  return {
    readCanonical: jest.fn(async () => null as Rec | null),
    claim: jest.fn(async (): Promise<ClaimResult> => 'won'),
    release: jest.fn(async () => {}),
    waitForWinner: jest.fn(async () => null as Rec | null),
    generateAndPersist: jest.fn(async () => ({ status: 'ok', record: REC, cacheHit: false }) as const),
    ...over,
  };
}

describe('ensureClaimedGeneration — LLM-call invariant', () => {
  it('cache hit → 0 generations, 0 claim', async () => {
    const d = deps({ readCanonical: jest.fn(async () => REC) });
    const out = await ensureClaimedGeneration<Rec>(d);
    expect(out).toEqual({ status: 'ok', record: REC, cacheHit: true });
    expect(d.claim).not.toHaveBeenCalled();
    expect(d.generateAndPersist).not.toHaveBeenCalled();
  });

  it('claim won → exactly ONE generation', async () => {
    const d = deps({ claim: jest.fn(async () => 'won') });
    const out = await ensureClaimedGeneration<Rec>(d);
    expect(out.status).toBe('ok');
    expect(d.generateAndPersist).toHaveBeenCalledTimes(1);
    expect(d.release).not.toHaveBeenCalled(); // success → keep claim
  });

  it('claim LOST + winner produces the result → ZERO generations (loser does not spend)', async () => {
    const d = deps({ claim: jest.fn(async () => 'lost'), waitForWinner: jest.fn(async () => REC) });
    const out = await ensureClaimedGeneration<Rec>(d);
    expect(out).toEqual({ status: 'ok', record: REC, cacheHit: true });
    expect(d.generateAndPersist).not.toHaveBeenCalled();
    expect(d.release).not.toHaveBeenCalled();
  });

  it('claim LOST + winner never finishes → reclaim + generate once', async () => {
    const d = deps({ claim: jest.fn(async () => 'lost'), waitForWinner: jest.fn(async () => null) });
    const out = await ensureClaimedGeneration<Rec>(d);
    expect(out.status).toBe('ok');
    expect(d.release).toHaveBeenCalledTimes(1); // stale claim cleaned up
    expect(d.generateAndPersist).toHaveBeenCalledTimes(1);
  });

  it('claim won + generation fails → release so a retry can win', async () => {
    const d = deps({ generateAndPersist: jest.fn(async () => ({ status: 'error' }) as const) });
    const out = await ensureClaimedGeneration<Rec>(d);
    expect(out.status).toBe('error');
    expect(d.release).toHaveBeenCalledTimes(1);
  });

  it('fail-open: claim errors surface as "won" upstream → still exactly one generation', async () => {
    // (claimFortuneGeneration returns "won" on error; here we simulate that already-mapped value.)
    const d = deps({ claim: jest.fn(async () => 'won') });
    await ensureClaimedGeneration<Rec>(d);
    expect(d.generateAndPersist).toHaveBeenCalledTimes(1);
  });
});

describe('waitForCanonical', () => {
  const noSleep = async () => {};
  it('returns the first non-null read', async () => {
    let n = 0;
    const read = jest.fn(async () => (++n >= 2 ? REC : null));
    const r = await waitForCanonical(read, { attempts: 5, delayMs: 10, sleep: noSleep });
    expect(r).toBe(REC);
    expect(read).toHaveBeenCalledTimes(2);
  });
  it('returns null after exhausting attempts', async () => {
    const read = jest.fn(async () => null);
    const r = await waitForCanonical(read, { attempts: 3, delayMs: 10, sleep: noSleep });
    expect(r).toBeNull();
    expect(read).toHaveBeenCalledTimes(3);
  });
});
