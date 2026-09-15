import { runCanonicalGeneration, runIdempotentPaidRequest } from '../economicGuards';

const RECORD = { id: 'canonical' };

describe.each(['Today', 'Monthly'])('%s runCanonicalGeneration paid-call invariants', () => {
  const deps = () => ({
    readCanonical: jest.fn(async () => ({ status: 'missing' as const })),
    acquireLease: jest.fn(async () => ({ status: 'acquired' as const, token: 'lease' })),
    reservePaidWork: jest.fn(async () => ({ status: 'allowed' as const })),
    generate: jest.fn(async () => ({ ok: true as const, value: { result: 'generated' } })),
    complete: jest.fn(async () => RECORD as typeof RECORD | null),
    release: jest.fn(async () => {}),
  });

  it('cache hit = 0 LLM, 0 lease, 0 reservation', async () => {
    const d = deps(); d.readCanonical.mockResolvedValue({ status: 'found', record: RECORD });
    expect((await runCanonicalGeneration(d)).status).toBe('ok');
    expect(d.acquireLease).not.toHaveBeenCalled();
    expect(d.reservePaidWork).not.toHaveBeenCalled();
    expect(d.generate).not.toHaveBeenCalled();
  });

  it('first winner = exactly 1 LLM and persistence before success', async () => {
    const d = deps();
    const out = await runCanonicalGeneration(d);
    expect(out).toEqual({ status: 'ok', record: RECORD, cacheHit: false });
    expect(d.generate).toHaveBeenCalledTimes(1);
    expect(d.complete).toHaveBeenCalledTimes(1);
    expect(d.release).not.toHaveBeenCalled();
  });

  it('live-lease loser = 0 LLM and never deletes the winner', async () => {
    const d = deps(); d.acquireLease.mockResolvedValue({ status: 'busy' });
    expect(await runCanonicalGeneration(d)).toEqual({ status: 'in_progress' });
    expect(d.reservePaidWork).not.toHaveBeenCalled();
    expect(d.generate).not.toHaveBeenCalled();
    expect(d.release).not.toHaveBeenCalled();
  });

  it('DB cache failure = fail closed with 0 lease and 0 LLM', async () => {
    const d = deps(); d.readCanonical.mockResolvedValue({ status: 'unavailable' });
    expect((await runCanonicalGeneration(d)).status).toBe('temporarily_unavailable');
    expect(d.acquireLease).not.toHaveBeenCalled();
    expect(d.generate).not.toHaveBeenCalled();
  });

  it('lease RPC canonical-completed verdict = re-read with 0 reservation and 0 LLM', async () => {
    const d = deps();
    d.acquireLease.mockResolvedValue({ status: 'completed' });
    d.readCanonical.mockResolvedValueOnce({ status: 'missing' }).mockResolvedValueOnce({ status: 'found', record: RECORD });
    expect((await runCanonicalGeneration(d)).status).toBe('ok');
    expect(d.reservePaidWork).not.toHaveBeenCalled();
    expect(d.generate).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: 'rate_limited' as const, retryAfterMs: 5000 }, 'rate_limited'],
    [{ status: 'unavailable' as const }, 'temporarily_unavailable'],
  ])('reservation rejection/failure = 0 LLM (%s)', async (reservation, expected) => {
    const d = deps(); d.reservePaidWork.mockResolvedValue(reservation);
    expect((await runCanonicalGeneration(d)).status).toBe(expected);
    expect(d.generate).not.toHaveBeenCalled();
    expect(d.release).toHaveBeenCalledWith('lease');
  });

  it('LLM failure releases only the winner token', async () => {
    const d = deps(); d.generate.mockResolvedValue({ ok: false });
    expect((await runCanonicalGeneration(d)).status).toBe('generation_failed');
    expect(d.generate).toHaveBeenCalledTimes(1);
    expect(d.release).toHaveBeenCalledWith('lease');
  });

  it('lost completion response re-reads persisted canonical and does not re-generate', async () => {
    const d = deps();
    d.complete.mockResolvedValue(null);
    d.readCanonical.mockResolvedValueOnce({ status: 'missing' }).mockResolvedValueOnce({ status: 'found', record: RECORD });
    expect(await runCanonicalGeneration(d)).toEqual({ status: 'ok', record: RECORD, cacheHit: true });
    expect(d.generate).toHaveBeenCalledTimes(1);
    expect(d.release).not.toHaveBeenCalled();
  });
});

describe('runIdempotentPaidRequest paid-call invariants', () => {
  const deps = () => ({
    acquireRequest: jest.fn(async () => ({ status: 'acquired' as const, token: 'request-lease' })),
    reservePaidWork: jest.fn(async () => ({ status: 'allowed' as const })),
    generate: jest.fn(async () => ({ ok: true as const, response: { text: 'same answer' } })),
    complete: jest.fn(async () => true),
    readCompleted: jest.fn(async () => null as { text: string } | null),
    release: jest.fn(async () => {}),
  });

  it('same completed requestId = 0 additional LLM', async () => {
    const d = deps(); d.acquireRequest.mockResolvedValue({ status: 'completed', response: { text: 'same answer' } });
    expect((await runIdempotentPaidRequest(d)).cacheHit).toBe(true);
    expect(d.reservePaidWork).not.toHaveBeenCalled();
    expect(d.generate).not.toHaveBeenCalled();
  });

  it('same processing requestId = 0 LLM', async () => {
    const d = deps(); d.acquireRequest.mockResolvedValue({ status: 'processing' });
    expect((await runIdempotentPaidRequest(d)).status).toBe('in_progress');
    expect(d.generate).not.toHaveBeenCalled();
  });

  it('new requestId = exactly 1 LLM then completed persistence', async () => {
    const d = deps();
    expect((await runIdempotentPaidRequest(d)).status).toBe('ok');
    expect(d.generate).toHaveBeenCalledTimes(1);
    expect(d.complete).toHaveBeenCalledWith('request-lease', { text: 'same answer' });
  });

  it('quota rejection = 0 LLM', async () => {
    const d = deps(); d.reservePaidWork.mockResolvedValue({ status: 'rate_limited', retryAfterMs: 10 });
    expect((await runIdempotentPaidRequest(d)).status).toBe('rate_limited');
    expect(d.generate).not.toHaveBeenCalled();
    expect(d.release).toHaveBeenCalledWith('request-lease');
  });

  it('response-loss completion recovery returns stored answer with one total LLM', async () => {
    const d = deps(); d.complete.mockResolvedValue(false); d.readCompleted.mockResolvedValue({ text: 'same answer' });
    expect(await runIdempotentPaidRequest(d)).toEqual({ status: 'ok', response: { text: 'same answer' }, cacheHit: true });
    expect(d.generate).toHaveBeenCalledTimes(1);
  });
});
