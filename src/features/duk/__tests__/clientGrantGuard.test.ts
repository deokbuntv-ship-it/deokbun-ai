// Sprint J1 §13/§20 — STRUCTURAL guard: the client can never grant/spend/commit/reserve Duk. These are
// server-only verbs (Edge + SECURITY DEFINER RPCs). The only balance-changing call the client may make is the
// authenticated, atomic, self-scoped `light_candle`. This test scans the real client source tree so a future
// edit that smuggles in a privileged RPC (or a live purchase in the deferred top-up shell) fails CI.
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../../..'); // .../src

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const CLIENT_FILES = walk(SRC);

// Privileged, server-only economy verbs. If any of these is invoked from client code, the money authority has
// leaked to the device. `light_candle` is intentionally excluded — it is the one authenticated earn call.
const FORBIDDEN_RPC = [
  'grant_duk',
  'spend_duk',
  'commit_session_reservation',
  'reserve_session_duk',
  'release_session_reservation',
  'complete_consultation_with_billing',
  'record_verified_purchase',
  'record_revocation',
  'grant_welcome_on_consent',
];

describe('client cannot grant/spend Duk directly (§13)', () => {
  it.each(FORBIDDEN_RPC)('no client file calls the privileged RPC %s', (verb) => {
    const re = new RegExp(`rpc\\(\\s*['"\`]${verb}['"\`]`);
    const offenders = CLIENT_FILES.filter((f) => re.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('the only balance-changing client RPC is light_candle, and only in dukWalletService', () => {
    const re = /rpc\(\s*['"`]light_candle['"`]/;
    const callers = CLIENT_FILES.filter((f) => re.test(fs.readFileSync(f, 'utf8')));
    expect(callers.map((f) => path.basename(f)).sort()).toEqual(['dukWalletService.ts']);
  });
});

describe('top-up shell cannot purchase (§12)', () => {
  const topup = fs.readFileSync(path.join(SRC, 'app', 'duk-topup.tsx'), 'utf8');
  it('invokes no store / purchase / verification path', () => {
    expect(topup).not.toMatch(/functions\.invoke/);
    expect(topup).not.toMatch(/requestPurchaseVerification/);
    expect(topup).not.toMatch(/runPurchase|runRestore/);
    expect(topup).not.toMatch(/react-native-iap/);
  });
  it('renders no active buy control (purchase deferred to 05B)', () => {
    // No <Button> at all in the shell → nothing tappable can start a purchase.
    expect(topup).not.toMatch(/<Button/);
  });
});
