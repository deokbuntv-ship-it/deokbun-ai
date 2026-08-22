// Sprint J7 §7.6/§7.7/§7.12 — the required policy surfaces exist as DRAFT, and the Duk policy's stated values
// stay consistent with the display constants (which mirror economy_policy). Catches policy/code drift.
import {
  DUK_USE_POLICY, REFUND_POLICY, MINOR_USE_POLICY, LEGAL_DOCUMENTS,
} from '@/features/legal/legalContent';
import { DUK_PRICES, WELCOME_DUK, CANDLE_DUK } from '@/features/duk/pricing';

describe('policy surfaces (§7.6)', () => {
  it('the three new surfaces are registered DRAFT documents', () => {
    for (const doc of [DUK_USE_POLICY, REFUND_POLICY, MINOR_USE_POLICY]) {
      expect(doc.status).toBe('DRAFT');
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.sections.length).toBeGreaterThan(0);
    }
    expect(Object.keys(LEGAL_DOCUMENTS).sort()).toEqual(['duk', 'minor', 'privacy', 'refund', 'terms']);
  });

  it('the Duk policy states the actual prices/grants (no policy↔code drift)', () => {
    const text = JSON.stringify(DUK_USE_POLICY);
    expect(text).toContain(`${WELCOME_DUK}덕`);            // 10덕
    expect(text).toContain(`${CANDLE_DUK}덕`);             // 1덕
    expect(text).toContain(`${DUK_PRICES.general}덕`);     // 5덕
    expect(text).toContain(`${DUK_PRICES.compatibility}덕`); // 12덕
    expect(text).toContain(`${DUK_PRICES.premium_report}덕`); // 50덕
  });

  it('the Duk policy is honest about birthday reward NOT being granted yet', () => {
    // contradiction #1 guard: never claim birthday Duk is granted while the code does not grant it
    expect(JSON.stringify(DUK_USE_POLICY)).toMatch(/생일.*비활성|비활성.*생일|지급이 활성화되어 있지 않/);
  });

  it('privacy now names the third-party processors', () => {
    const { PRIVACY_POLICY } = require('@/features/legal/legalContent');
    const text = JSON.stringify(PRIVACY_POLICY);
    expect(text).toContain('Supabase');
    expect(text).toContain('OpenAI');
  });
});
