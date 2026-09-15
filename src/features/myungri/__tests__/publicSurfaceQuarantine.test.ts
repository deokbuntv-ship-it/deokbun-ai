// P0-07 (Codex audit 2026-08-28) — the previously-rejected seven-band `natalStrength.ts` classifier and
// its `currentStrength.ts` composer must never again be reachable through the public barrel. This is the
// enforcing guard for the quarantine note in `index.ts`, `services/natalStrength.ts`, and
// `services/currentStrength.ts` — it fails loudly if anyone re-adds the export instead of silently
// reactivating a rejected verdict authority.
import * as barrel from '../index';

const QUARANTINED_SYMBOLS = [
  'evaluateNatalStrength',
  'DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE',
  'STRENGTH_LABEL_KO',
  'buildCurrentStrengthContext',
  'luckInfluence',
];

describe('myungri public barrel — natalStrength/currentStrength quarantine (P0-07)', () => {
  it.each(QUARANTINED_SYMBOLS)('does not export %s', (symbol) => {
    expect(Object.prototype.hasOwnProperty.call(barrel, symbol)).toBe(false);
  });
});
