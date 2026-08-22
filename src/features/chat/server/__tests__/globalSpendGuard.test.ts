import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  GLOBAL_PAID_GENERATION_WORKLOADS,
  globalSpendGuardFailure,
  reserveGlobalPaidGeneration,
} from '../../../../../supabase/functions/_shared/globalSpendGuard';

const MIGRATION = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260828000000_global_paid_generation_guard.sql'),
  'utf8',
);
const EDGE_SOURCES = [
  ['content', 'supabase/functions/content-generate/index.ts'],
  ['famous', 'supabase/functions/famous-suggest/index.ts'],
  ['image', 'supabase/functions/media-generate/index.ts'],
  ['video', 'supabase/functions/video-generate/index.ts'],
] as const;

const row = (over: Record<string, unknown> = {}) => ({
  allowed: true,
  reason: 'ALLOWED',
  retry_after_ms: 0,
  reservation_id: '00000000-0000-0000-0000-000000000001',
  hourly_used: 1,
  daily_used: 1,
  hourly_limit: 100,
  daily_limit: 1000,
  utilization_percent: 1,
  warning_level: 'NORMAL',
  ...over,
});

const rpc = (value: unknown, error: unknown = null) => ({
  rpc: jest.fn(async () => ({ data: value, error })),
});

describe('global paid-generation shared adapter', () => {
  it('below both ceilings is allowed and exposes warning state', async () => {
    const admin = rpc([row({ hourly_used: 50, utilization_percent: 50, warning_level: 'WATCH_50' })]);
    await expect(reserveGlobalPaidGeneration(admin, 'user-a', 'chat')).resolves.toMatchObject({
      status: 'allowed', hourlyUsed: 50, warningLevel: 'WATCH_50', utilizationPercent: 50,
    });
  });

  it.each([
    ['HOURLY_LIMIT_REACHED', 'hourly'],
    ['DAILY_LIMIT_REACHED', 'daily'],
  ] as const)('%s is a controlled exhausted verdict', async (reason, period) => {
    const admin = rpc([row({ allowed: false, reason, reservation_id: null, retry_after_ms: 5000 })]);
    const verdict = await reserveGlobalPaidGeneration(admin, 'user-a', 'chat');
    expect(verdict).toMatchObject({ status: 'exhausted', period, retryAfterMs: 5000 });
    if (verdict.status === 'allowed') throw new Error('unreachable');
    expect(globalSpendGuardFailure(verdict)).toMatchObject({
      status: 429, body: { error: 'GLOBAL_GENERATION_LIMIT_REACHED', period },
    });
  });

  it('kill switch on blocks; kill switch off is represented by the allowed row', async () => {
    const disabled = rpc([row({ allowed: false, reason: 'GENERATION_DISABLED', reservation_id: null })]);
    await expect(reserveGlobalPaidGeneration(disabled, 'user-a', 'summary')).resolves.toMatchObject({ status: 'disabled' });
    const enabled = rpc([row()]);
    await expect(reserveGlobalPaidGeneration(enabled, 'user-a', 'summary')).resolves.toMatchObject({ status: 'allowed' });
  });

  it('RPC errors, malformed results, and throws fail closed', async () => {
    await expect(reserveGlobalPaidGeneration(rpc(null, { message: 'db down' }), 'user-a', 'chat'))
      .resolves.toEqual({ status: 'unavailable' });
    await expect(reserveGlobalPaidGeneration(rpc([{ allowed: true }]), 'user-a', 'chat'))
      .resolves.toEqual({ status: 'unavailable' });
    const throwing = { rpc: jest.fn(async () => { throw new Error('db down'); }) };
    await expect(reserveGlobalPaidGeneration(throwing, 'user-a', 'chat'))
      .resolves.toEqual({ status: 'unavailable' });
  });

  it('includes every paid-generation workload wired in V1', () => {
    expect(GLOBAL_PAID_GENERATION_WORKLOADS).toEqual([
      'chat', 'today_fortune', 'monthly_fortune', 'compatibility', 'summary',
      'content_generation', 'famous_suggestion', 'image_generation', 'video_generation',
    ]);
  });
});

describe('global paid-generation migration contract (static; live DB concurrency remains OWNER E2E)', () => {
  it('uses one global advisory lock before rolling-window counts and insertion', () => {
    const lock = MIGRATION.indexOf("pg_advisory_xact_lock(hashtextextended('deokbunai:global-paid-generation'");
    const hourly = MIGRATION.indexOf("interval '1 hour'", lock);
    const insert = MIGRATION.indexOf('insert into public.global_paid_generation_reservations', hourly);
    expect(lock).toBeGreaterThan(0);
    expect(hourly).toBeGreaterThan(lock);
    expect(insert).toBeGreaterThan(hourly);
  });

  it('shares the same ceiling across users and uses the DB clock', () => {
    const reserveBody = MIGRATION.slice(
      MIGRATION.indexOf('create or replace function public.reserve_global_paid_generation'),
      MIGRATION.indexOf('create or replace function public.get_global_generation_guard'),
    );
    expect(reserveBody).toContain('clock_timestamp()');
    expect(reserveBody).toContain('sum(r.units)');
    expect(reserveBody).not.toMatch(/where r\.user_id\s*=/);
  });

  it('defines hourly/daily ceilings, kill switch, warning bands, and service-role reservation authority', () => {
    expect(MIGRATION).toContain('generation_enabled boolean not null');
    expect(MIGRATION).toContain('hourly_limit integer not null');
    expect(MIGRATION).toContain('daily_limit integer not null');
    for (const threshold of ['WATCH_50', 'WARNING_80', 'CRITICAL_95']) expect(MIGRATION).toContain(threshold);
    expect(MIGRATION).toMatch(/revoke all on function public\.reserve_global_paid_generation[\s\S]*from public, anon, authenticated/);
    expect(MIGRATION).toMatch(/grant execute on function public\.reserve_global_paid_generation[\s\S]*to service_role/);
  });

  it('keeps mutation behind server-side admin authority and records audit identity/time', () => {
    expect(MIGRATION).toContain("auth.role() <> 'service_role' and not public.is_admin()");
    expect(MIGRATION).toContain('updated_at = clock_timestamp()');
    expect(MIGRATION).toContain('updated_by = auth.uid()');
  });
});

describe('paid provider wiring contract', () => {
  it.each(EDGE_SOURCES)('%s reserves globally before starting a provider fetch', (_name, path) => {
    const source = readFileSync(resolve(process.cwd(), path), 'utf8');
    const guard = source.indexOf('await reserveGlobalPaidGeneration');
    const provider = source.indexOf('await fetch(', guard);
    expect(guard).toBeGreaterThan(0);
    expect(provider).toBeGreaterThan(guard);
    expect(source).toContain('globalSpendGuardFailure');
  });

  it('chat covers canonical Today/Monthly plus idempotent chat/compatibility/summary', () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/chat/index.ts'), 'utf8');
    expect(source.match(/const global = await reserveGlobalPaidGeneration/g)).toHaveLength(3);
    // Sprint I §4 — the chat path now uses the request-scoped (idempotent-capable) call; today/monthly keep the
    // 3-arg form. All three still route through reserveGlobalPaidGeneration.
    expect(source).toMatch(/reserveGlobalPaidGeneration\(admin, userId, workload, \{[\s\S]*requestId,[\s\S]*idempotent:/);
    expect(source).toContain("reserveGlobalPaidGeneration(admin, userId, 'today_fortune')");
    expect(source).toContain("reserveGlobalPaidGeneration(admin, userId, 'monthly_fortune')");
    expect(source).toContain("{ error: 'GENERATION_DISABLED' }");
    expect(source).toContain("error: 'GLOBAL_GENERATION_LIMIT_REACHED'");
  });
});
