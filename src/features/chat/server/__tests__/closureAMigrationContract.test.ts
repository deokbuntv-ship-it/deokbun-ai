import { readFileSync } from 'fs';
import { resolve } from 'path';

const SQL = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260827000000_fortune_generation_claims.sql'), 'utf8');

describe('Closure A DB contract (static; live concurrency remains OWNER E2E)', () => {
  it('serializes paid reservations before inserting', () => {
    expect(SQL).toContain('pg_advisory_xact_lock');
    expect(SQL).toContain('reserve_paid_work');
    expect(SQL).toMatch(/insert into public\.paid_work_reservations/);
  });
  it('uses DB-clock leases and token-qualified release/completion', () => {
    expect(SQL).toContain('clock_timestamp()');
    expect(SQL).toContain('expires_at');
    expect(SQL).toContain('l.lease_token = p_lease_token');
    expect(SQL).toContain("l.expires_at > clock_timestamp()");
  });
  it('keeps economic tables/RPCs away from authenticated clients', () => {
    expect(SQL).toMatch(/revoke all on table public\.fortune_generation_leases from public, anon, authenticated/);
    expect(SQL).toMatch(/grant execute on function public\.reserve_paid_work[\s\S]*to service_role/);
    expect(SQL).not.toMatch(/grant execute on function public\.reserve_paid_work[^;]*to authenticated/);
  });
  it('persists canonical records inside token-checked completion transactions', () => {
    expect(SQL).toContain('complete_today_fortune_generation');
    expect(SQL).toContain('complete_monthly_fortune_generation');
    expect(SQL).toMatch(/perform 1 from public\.fortune_generation_leases[\s\S]*for update/);
  });
  it('refuses a fresh lease when the canonical row already exists', () => {
    expect(SQL).toMatch(/if p_kind = 'today' and exists[\s\S]*'COMPLETED'/);
    expect(SQL).toMatch(/elsif p_kind = 'monthly' and exists[\s\S]*'COMPLETED'/);
  });
});
