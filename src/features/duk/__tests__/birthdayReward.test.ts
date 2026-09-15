// Batch3 Phase 0 §0.6 — birthday reward is granted server-side, idempotently, from the policy value, and never
// by the client. Source-scans the migration (behavioral scenarios are proven live on staging, BEGIN/ROLLBACK).
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const MIG = 'supabase/migrations/20260845000000_birthday_reward_runtime.sql';

describe('birthday +5 reward runtime', () => {
  const sql = read(MIG);

  it('grants a REWARD/BIRTHDAY ledger row', () => {
    expect(sql).toMatch(/into public\.duk_ledger/);
    expect(sql).toMatch(/'REWARD'/);
    expect(sql).toMatch(/'BIRTHDAY'/);
  });

  it('reads the amount from economy_policy (does not hardcode / change the reward)', () => {
    expect(sql).toMatch(/birthday_reward\b[\s\S]*from public\.economy_policy/);
    expect(sql).toMatch(/delta[\s\S]*v_birthday_reward|v_birthday_reward/); // delta comes from policy value
  });

  it('is idempotent per user per year (partial unique index + ON CONFLICT DO NOTHING)', () => {
    expect(sql).toMatch(/create unique index[\s\S]*duk_ledger_birthday_uniq[\s\S]*where reason = 'BIRTHDAY'/);
    expect(sql).toMatch(/on conflict \(user_id, request_id\) where reason = 'BIRTHDAY' do nothing/);
    expect(sql).toMatch(/request_id[\s\S]*'birthday:'|v_dedup/); // year-scoped key
  });

  it('runs server-side (SECURITY DEFINER) and reuses the existing Feb-29 occurrence rule', () => {
    expect(sql).toMatch(/security definer/);
    expect(sql).toMatch(/not v_is_leap and v_month = 2 and v_day = 28/); // same rule as the notification path
  });

  it('the client never inserts a BIRTHDAY ledger row (server authority)', () => {
    // scan the client tree for any duk_ledger insert / BIRTHDAY grant
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) { if (e.name !== '__tests__' && e.name !== 'node_modules') walk(full, out); }
        else if (/\.(ts|tsx)$/.test(e.name)) out.push(full);
      }
      return out;
    };
    const offenders = walk(path.join(ROOT, 'src'))
      .filter((f) => /from\(['"`]duk_ledger['"`]\)[\s\S]{0,80}insert|rpc\(\s*['"`]grant_duk['"`]/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
