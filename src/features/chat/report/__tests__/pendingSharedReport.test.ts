// Pending shared-report token store (Commercial UX V4 §24). In the jest (node) runner there is no
// sessionStorage, so this exercises the in-memory branch deterministically. Verifies one-shot consume,
// rejection of malformed tokens, and TTL expiry — the guarantees that keep the token out of `returnTo`
// while never resurfacing a stale continuation.
import {
  clearPendingShareToken,
  consumePendingShareToken,
  setPendingShareToken,
} from '@/features/chat/report/pendingSharedReport';

const TOKEN = 'a'.repeat(48);
const T0 = 1_000_000;

beforeEach(() => clearPendingShareToken());

describe('pendingSharedReport', () => {
  it('stores a valid token and returns it once (one-shot consume)', () => {
    setPendingShareToken(TOKEN, T0);
    expect(consumePendingShareToken(T0 + 1000)).toBe(TOKEN);
    expect(consumePendingShareToken(T0 + 2000)).toBeNull(); // already consumed
  });

  it('never stores a malformed token', () => {
    setPendingShareToken('../evil', T0);
    expect(consumePendingShareToken(T0)).toBeNull();
    setPendingShareToken('A'.repeat(48), T0); // uppercase → invalid
    expect(consumePendingShareToken(T0)).toBeNull();
  });

  it('expires past the TTL (abandoned continuation never resurfaces)', () => {
    setPendingShareToken(TOKEN, T0);
    expect(consumePendingShareToken(T0 + 31 * 60 * 1000)).toBeNull(); // > 30 min
  });

  it('clear() removes a pending token', () => {
    setPendingShareToken(TOKEN, T0);
    clearPendingShareToken();
    expect(consumePendingShareToken(T0)).toBeNull();
  });
});
