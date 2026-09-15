// Sprint J2 §6 — the welcome signal is a strict one-shot: it fires the welcome card exactly once per mark and
// never grants 덕 (display-only). Resetting via consume prevents the card from re-appearing on every Home mount.
import { markWelcomePending, consumeWelcomePending } from '@/features/duk/welcomeSignal';

describe('welcome signal (one-shot)', () => {
  beforeEach(() => { consumeWelcomePending(); }); // clear any leaked state between tests

  it('is not pending by default', () => {
    expect(consumeWelcomePending()).toBe(false);
  });
  it('mark → consume returns true exactly once', () => {
    markWelcomePending();
    expect(consumeWelcomePending()).toBe(true);
    expect(consumeWelcomePending()).toBe(false); // not again
  });
});
