// Sprint 3B rev 3 — acquisition SIGNUP-eligibility semantic (§9). A pre-existing user must
// NEVER be counted as a new signup just because their ad attribution row was created.
import { captureAcquisition, clearAcquisition, peekAcquisition } from '../acquisition/acquisitionContext';
import { encodeTrackingCode } from '../trackingCode';
import { isNewAccountSignup, SIGNUP_FALLBACK_WINDOW_MS } from '../signupEligibility';

const iso = (ms: number) => new Date(ms).toISOString();
const T0 = Date.parse('2026-06-01T00:00:00Z'); // long-ago account creation
const CLICK = Date.parse('2026-08-14T09:00:00Z');
const FLUSH = Date.parse('2026-08-14T09:00:20Z'); // attribution ~20s after click

describe('signup eligibility — pre-existing user is NEVER a signup (§1/§2/§5)', () => {
  it('EXISTING user (created 2026-06-01) clicks ad 2026-08-14 → NO signup', () => {
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(T0), adClickAt: iso(CLICK), attributionAt: iso(FLUSH) }),
    ).toBe(false);
  });

  it('NEW user: account created DURING the ad session (after the click) → signup YES (§6)', () => {
    const accountCreated = CLICK + 12_000; // account born 12s after the ad click (OAuth completes)
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(accountCreated), adClickAt: iso(CLICK), attributionAt: iso(FLUSH) }),
    ).toBe(true);
  });

  it('boundary: account created exactly AT the click → signup YES (inclusive)', () => {
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(CLICK), adClickAt: iso(CLICK), attributionAt: iso(FLUSH) }),
    ).toBe(true);
  });

  it('boundary: account created 1ms BEFORE the click → NO signup (pre-existing)', () => {
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(CLICK - 1), adClickAt: iso(CLICK), attributionAt: iso(FLUSH) }),
    ).toBe(false);
  });

  it('EXISTING user later clicks ANOTHER ad → still NO signup (created_at predates the new click)', () => {
    const laterClick = Date.parse('2026-09-01T00:00:00Z');
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(T0), adClickAt: iso(laterClick), attributionAt: iso(laterClick + 5000) }),
    ).toBe(false);
  });
});

describe('signup eligibility — fallback when NO ad_click was recorded (§4, documented window)', () => {
  it('brand-new account within the fallback window → signup YES', () => {
    const created = FLUSH - 60_000; // created 1min before flush
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(created), adClickAt: null, attributionAt: iso(FLUSH) }),
    ).toBe(true);
  });
  it('long-standing account (created months ago) → NO signup even in fallback', () => {
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(T0), adClickAt: null, attributionAt: iso(FLUSH) }),
    ).toBe(false);
  });
  it('account created just OUTSIDE the fallback window → NO signup', () => {
    const created = FLUSH - (SIGNUP_FALLBACK_WINDOW_MS + 1000);
    expect(
      isNewAccountSignup({ accountCreatedAt: iso(created), adClickAt: null, attributionAt: iso(FLUSH) }),
    ).toBe(false);
  });
  it('unknown account age → conservative NO signup (never fabricate)', () => {
    expect(isNewAccountSignup({ accountCreatedAt: null, adClickAt: iso(CLICK), attributionAt: iso(FLUSH) })).toBe(false);
  });
});

// The remaining §9 scenarios (repeated login → no duplicate signup; repeated ad click →
// first-touch preserved; existing user later click → no first-touch overwrite) are enforced by
// the DB (unique index on signup event) + the client first-touch store. The store half:
describe('first-touch store — repeated ad click preserves the first touch (§9)', () => {
  const CODE_A = encodeTrackingCode(Uint8Array.from([1, 1, 1, 1, 1, 1, 1, 1]));
  const CODE_B = encodeTrackingCode(Uint8Array.from([2, 2, 2, 2, 2, 2, 2, 2]));
  beforeEach(() => clearAcquisition());
  it('a later ad click never overwrites the first captured code/visitor', () => {
    captureAcquisition(CODE_A, 'v-1', 1000);
    captureAcquisition(CODE_B, 'v-2', 2000);
    const ctx = peekAcquisition(2000);
    expect(ctx?.code).toBe(CODE_A);
    expect(ctx?.visitorId).toBe('v-1');
  });
});
