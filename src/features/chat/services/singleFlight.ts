// Single-flight (Sprint F.1 §K): memoize an IN-FLIGHT async so concurrent callers share ONE execution.
// Used for conversation creation, where two simultaneous sends must never both create a conversation. The
// in-flight promise is cleared on FAILURE (so a later attempt can retry) and kept on success (the caller caches
// the created id and short-circuits before calling again). PURE, dependency-free, unit-testable.
export type SingleFlight<T> = (factory: () => Promise<T>) => Promise<T>;

export function createSingleFlight<T>(): SingleFlight<T> {
  let inFlight: Promise<T> | null = null;
  return (factory: () => Promise<T>): Promise<T> => {
    if (inFlight !== null) return inFlight;
    const p = factory().catch((error) => {
      inFlight = null; // allow a later retry after a failed attempt
      throw error;
    });
    inFlight = p;
    return p;
  };
}
