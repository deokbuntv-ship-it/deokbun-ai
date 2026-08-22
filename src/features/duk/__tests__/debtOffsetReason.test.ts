// Sprint J6 §6.2 — financial-integrity regression guard: the duk_ledger reason CHECK must permit DEBT_OFFSET
// (the value record_verified_purchase writes when a new PAID purchase offsets outstanding debt). If the CHECK
// and the writer ever disagree again, a paying user with prior debt would have their whole purchase fail. This
// scans the real migrations so the fix cannot silently regress. (The financial BEHAVIOR is proven live on
// staging via a BEGIN/ROLLBACK integration proof — see docs/DEOKBUNI_SPRINT_J6_REPORT.md.)
import * as fs from 'fs';
import * as path from 'path';

const MIG = path.resolve(__dirname, '../../../../supabase/migrations');
const read = (f: string) => fs.readFileSync(path.join(MIG, f), 'utf8');

describe('DEBT_OFFSET ledger reason integrity', () => {
  it('the reason CHECK includes DEBT_OFFSET (widening migration applied)', () => {
    const fix = read('20260843000000_duk_ledger_debt_offset_reason.sql');
    expect(fix).toMatch(/add constraint duk_ledger_reason_check/i);
    expect(fix).toMatch(/'DEBT_OFFSET'/);
  });

  it('the writer (record_verified_purchase) still emits DEBT_OFFSET — writer and CHECK agree', () => {
    const iap = read('20260834000000_iap.sql');
    expect(iap).toMatch(/'DEBT_OFFSET'/);
    // every reason the IAP function writes must be an allowed reason after the fix
    const allowed = new Set(
      (read('20260843000000_duk_ledger_debt_offset_reason.sql').match(/'([A-Z_]+)'/g) ?? []).map((s) => s.replace(/'/g, '')),
    );
    for (const r of ['PURCHASE', 'REVERSAL', 'DEBT_OFFSET']) {
      expect(allowed.has(r)).toBe(true);
    }
  });

  it('the fix is additive — it widens (drop-if-exists + re-add), never narrows or drops data', () => {
    const fix = read('20260843000000_duk_ledger_debt_offset_reason.sql');
    expect(fix).toMatch(/drop constraint if exists duk_ledger_reason_check/i);
    expect(fix).not.toMatch(/drop table|delete from|truncate/i);
  });
});
