// Sprint 3B rev 4 — acquisition SIGNUP eligibility (FAIL-CLOSED, evidence-backed, §16).
// SIGNUP requires trusted server evidence: a genuinely-new account AND a server-recorded
// ad_click AND created_at >= click. Missing evidence → NO signup (prefer undercount over
// contaminated CAC). No time window, no client timestamps, no client isNewUser.
import { captureAcquisition, clearAcquisition, peekAcquisition } from '../acquisition/acquisitionContext';
import { encodeTrackingCode } from '../trackingCode';
import { isNewAccountSignup } from '../signupEligibility';

const iso = (ms: number) => new Date(ms).toISOString();
const T0 = Date.parse('2026-06-01T00:00:00Z'); // long-ago account creation
const CLICK = Date.parse('2026-08-14T09:00:00Z');

describe('signup eligibility — fail-closed, evidence-backed (§16)', () => {
  it('new account + trusted click (created AFTER click) => signup TRUE', () => {
    expect(isNewAccountSignup({ accountCreatedAt: iso(CLICK + 12_000), adClickAt: iso(CLICK) })).toBe(true);
  });

  it('existing account + trusted click (created BEFORE click) => FALSE', () => {
    expect(isNewAccountSignup({ accountCreatedAt: iso(T0), adClickAt: iso(CLICK) })).toBe(false);
  });

  it('MISSING click => FALSE (no inference — fail-closed)', () => {
    expect(isNewAccountSignup({ accountCreatedAt: iso(CLICK + 12_000), adClickAt: null })).toBe(false);
  });

  it('MISSING account created_at => FALSE', () => {
    expect(isNewAccountSignup({ accountCreatedAt: null, adClickAt: iso(CLICK) })).toBe(false);
  });

  it('exact boundary created_at == click_at => TRUE (inclusive)', () => {
    expect(isNewAccountSignup({ accountCreatedAt: iso(CLICK), adClickAt: iso(CLICK) })).toBe(true);
  });

  it('created_at 1ms BEFORE click => FALSE', () => {
    expect(isNewAccountSignup({ accountCreatedAt: iso(CLICK - 1), adClickAt: iso(CLICK) })).toBe(false);
  });

  it('existing user later clicks ANOTHER ad => FALSE (created_at predates the new click)', () => {
    const laterClick = Date.parse('2026-09-01T00:00:00Z');
    expect(isNewAccountSignup({ accountCreatedAt: iso(T0), adClickAt: iso(laterClick) })).toBe(false);
  });

  it('never accepts a client timestamp path — only (accountCreatedAt, adClickAt) exist', () => {
    // The function signature carries no attributionAt / window / isNewUser — enforced by types.
    const anyFn = isNewAccountSignup as unknown as (p: Record<string, unknown>) => boolean;
    expect(anyFn({ accountCreatedAt: null, adClickAt: null })).toBe(false);
  });
});

// §16: repeated login → no duplicate signup, and later ad → no first-touch overwrite. The
// DB enforces signup dedup via a unique index; the client store enforces first-touch:
describe('first-touch store — repeated ad click preserves the first touch (§16)', () => {
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
