// requestId format/safety coverage (directive §8). Confirms the correlation id
// is opaque, safe-charset, bounded — so it never carries PII and always passes the
// edge sanitizer (/^[A-Za-z0-9_-]+$/, <=64).
import { newRequestId } from '../index';

describe('newRequestId', () => {
  it('matches the opaque req_<base36>_<base36> shape', () => {
    expect(newRequestId()).toMatch(/^req_[0-9a-z]+_[0-9a-z]+$/);
  });

  it('uses only the edge-sanitizer charset and stays well under 64 chars', () => {
    for (let i = 0; i < 100; i += 1) {
      const id = newRequestId();
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(id.length).toBeLessThanOrEqual(64);
      expect(id.length).toBeGreaterThan(5);
    }
  });

  it('is (practically) unique across calls — random suffix differs', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newRequestId()));
    // Allow a vanishingly small collision chance; require near-total uniqueness.
    expect(ids.size).toBeGreaterThan(490);
  });

  it('carries no obvious PII markers (opaque id only)', () => {
    const id = newRequestId();
    expect(id).not.toMatch(/@/); // no email
    expect(id.startsWith('req_')).toBe(true);
  });
});
