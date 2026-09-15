// Runtime-neutral economic orchestration. DB operations are injected so tests can assert paid-call counts
// while the Edge supplies the service-role RPC implementations.

export type PaidReservation =
  | { status: 'allowed' }
  | { status: 'rate_limited'; retryAfterMs: number }
  | { status: 'unavailable' };

export type CanonicalLease =
  | { status: 'acquired'; token: string }
  | { status: 'busy' }
  | { status: 'completed' }
  | { status: 'unavailable' };

export type CanonicalRead<T> =
  | { status: 'found'; record: T }
  | { status: 'missing' }
  | { status: 'unavailable' };

export type CanonicalGenerationResult<T> =
  | { status: 'ok'; record: T; cacheHit: boolean }
  | { status: 'in_progress' }
  | { status: 'rate_limited'; retryAfterMs: number }
  | { status: 'temporarily_unavailable' }
  | { status: 'generation_failed' }
  | { status: 'persistence_failed' };

export type CanonicalGenerationDeps<T, G> = {
  readCanonical: () => Promise<CanonicalRead<T>>;
  acquireLease: () => Promise<CanonicalLease>;
  reservePaidWork: () => Promise<PaidReservation>;
  generate: () => Promise<{ ok: true; value: G } | { ok: false }>;
  complete: (token: string, value: G) => Promise<T | null>;
  release: (token: string) => Promise<void>;
};

// A loser rechecks once and returns IN_PROGRESS. It never deletes or generates without an acquired lease.
export async function runCanonicalGeneration<T, G>(
  deps: CanonicalGenerationDeps<T, G>,
): Promise<CanonicalGenerationResult<T>> {
  const cached = await deps.readCanonical();
  if (cached.status === 'found') return { status: 'ok', record: cached.record, cacheHit: true };
  if (cached.status === 'unavailable') return { status: 'temporarily_unavailable' };

  const lease = await deps.acquireLease();
  if (lease.status === 'unavailable') return { status: 'temporarily_unavailable' };
  if (lease.status === 'busy' || lease.status === 'completed') {
    const completed = await deps.readCanonical();
    if (completed.status === 'found') return { status: 'ok', record: completed.record, cacheHit: true };
    if (completed.status === 'unavailable' || lease.status === 'completed') {
      return { status: 'temporarily_unavailable' };
    }
    return { status: 'in_progress' };
  }

  const reservation = await deps.reservePaidWork();
  if (reservation.status !== 'allowed') {
    await deps.release(lease.token);
    return reservation.status === 'rate_limited'
      ? { status: 'rate_limited', retryAfterMs: reservation.retryAfterMs }
      : { status: 'temporarily_unavailable' };
  }

  const generated = await deps.generate();
  if (!generated.ok) {
    await deps.release(lease.token);
    return { status: 'generation_failed' };
  }
  const persisted = await deps.complete(lease.token, generated.value);
  if (persisted) return { status: 'ok', record: persisted, cacheHit: false };

  // The completion transaction may have committed while its response was lost.
  const recovered = await deps.readCanonical();
  if (recovered.status === 'found') return { status: 'ok', record: recovered.record, cacheHit: true };
  await deps.release(lease.token);
  return { status: 'persistence_failed' };
}

export type RequestLease<T> =
  | { status: 'acquired'; token: string }
  | { status: 'processing' }
  | { status: 'completed'; response: T }
  | { status: 'unavailable' };

export type IdempotentPaidResult<T> =
  | { status: 'ok'; response: T; cacheHit: boolean }
  | { status: 'in_progress' }
  | { status: 'rate_limited'; retryAfterMs: number }
  | { status: 'temporarily_unavailable' }
  | { status: 'generation_failed' }
  | { status: 'persistence_failed' };

export type IdempotentPaidDeps<T> = {
  acquireRequest: () => Promise<RequestLease<T>>;
  reservePaidWork: () => Promise<PaidReservation>;
  generate: () => Promise<{ ok: true; response: T } | { ok: false }>;
  complete: (token: string, response: T) => Promise<boolean>;
  readCompleted: () => Promise<T | null>;
  release: (token: string) => Promise<void>;
};

export async function runIdempotentPaidRequest<T>(
  deps: IdempotentPaidDeps<T>,
): Promise<IdempotentPaidResult<T>> {
  const claim = await deps.acquireRequest();
  if (claim.status === 'completed') return { status: 'ok', response: claim.response, cacheHit: true };
  if (claim.status === 'processing') return { status: 'in_progress' };
  if (claim.status === 'unavailable') return { status: 'temporarily_unavailable' };

  const reservation = await deps.reservePaidWork();
  if (reservation.status !== 'allowed') {
    await deps.release(claim.token);
    return reservation.status === 'rate_limited'
      ? { status: 'rate_limited', retryAfterMs: reservation.retryAfterMs }
      : { status: 'temporarily_unavailable' };
  }
  const generated = await deps.generate();
  if (!generated.ok) {
    await deps.release(claim.token);
    return { status: 'generation_failed' };
  }
  if (await deps.complete(claim.token, generated.response)) {
    return { status: 'ok', response: generated.response, cacheHit: false };
  }
  const recovered = await deps.readCompleted();
  if (recovered) return { status: 'ok', response: recovered, cacheHit: true };
  await deps.release(claim.token);
  return { status: 'persistence_failed' };
}
