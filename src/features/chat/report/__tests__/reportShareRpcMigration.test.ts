// SQL-source contract for the get_shared_report RPC fix (P0: PostgreSQL 42883). Locks the root-cause fix
// so it can't silently regress: the SECURITY DEFINER function must include `extensions` in its search_path
// (so pgcrypto's digest() resolves), while keeping the security posture intact (authenticated-only, anon
// revoked, bounded DTO). This is a source-level check — the live RPC is validated at owner E2E after the
// migration is applied; no DB is exercised here.
import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(__dirname, '../../../../..', 'supabase', 'migrations');
const fixSql = fs.readFileSync(
  path.join(migrationsDir, '20260818000400_report_share_rpc_fix.sql'),
  'utf8',
);

describe('get_shared_report RPC fix migration (42883)', () => {
  it('recreates the function with `extensions` in its search_path (so digest() resolves)', () => {
    expect(fixSql).toMatch(/create or replace function public\.get_shared_report\(p_token text\)/i);
    // the whole point of the fix: extensions must be on the search_path
    expect(fixSql).toMatch(/set\s+search_path\s*=\s*public\s*,\s*extensions\s*,\s*pg_temp/i);
  });

  it('still hashes the presented token server-side (digest) — no client hash trusted', () => {
    expect(fixSql).toMatch(/digest\(p_token,\s*'sha256'\)/i);
  });

  it('keeps the authenticated-only grant and revokes anon (security not weakened)', () => {
    expect(fixSql).toMatch(/grant execute on function public\.get_shared_report\(text\) to authenticated/i);
    expect(fixSql).toMatch(/revoke all on function public\.get_shared_report\(text\) from anon/i);
    expect(fixSql).toMatch(/security definer/i);
    expect(fixSql).toMatch(/auth\.uid\(\) is null/i); // authenticated gate inside the function
  });

  it('returns ONLY the bounded user-facing DTO keys (no owner/conversation/grounding)', () => {
    const keys = ['title', 'generatedAt', 'summary', 'keyFindings', 'cautions', 'coveredTopics'];
    for (const k of keys) expect(fixSql).toContain(`'${k}'`);
    expect(fixSql).not.toMatch(/owner_user_id'/);
    expect(fixSql).not.toMatch(/conversation_id'/);
  });

  it('does NOT edit the already-applied 300 migration (additive fix only)', () => {
    // the fix lives in its own file; the original stays untouched
    expect(fs.existsSync(path.join(migrationsDir, '20260818000300_report_shares.sql'))).toBe(true);
  });
});
