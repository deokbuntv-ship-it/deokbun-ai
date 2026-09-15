// Sprint D §D8 — admin global generation guard client (reads/toggles backend truth; fail-clean).
jest.mock('@/services/supabase', () => ({ getSupabaseClient: jest.fn() }));
jest.mock('@/features/analysis', () => ({ logDbError: jest.fn() }));

import { getSupabaseClient } from '@/services/supabase';
import {
  fetchGlobalGenerationGuard,
  mapGuardRow,
  setGlobalGenerationEnabled,
} from '@/features/admin/services/globalGenerationGuardService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withRpc = (rpc: any) => (getSupabaseClient as jest.Mock).mockReturnValue({ rpc });

describe('mapGuardRow', () => {
  it('maps snake_case → camelCase and validates the warning level', () => {
    expect(
      mapGuardRow({ generation_enabled: true, hourly_limit: 100, daily_limit: 1000, hourly_used: 40, daily_used: 200, utilization_percent: 40, warning_level: 'WATCH_50' }),
    ).toEqual({ generationEnabled: true, hourlyLimit: 100, dailyLimit: 1000, hourlyUsed: 40, dailyUsed: 200, utilizationPercent: 40, warningLevel: 'WATCH_50' });
    expect(mapGuardRow(null)).toBeNull();
    expect(mapGuardRow({ warning_level: 'BOGUS' })?.warningLevel).toBe('NORMAL'); // fail-safe
  });
});

describe('fetchGlobalGenerationGuard', () => {
  it('returns the mapped guard (table result → first row)', async () => {
    withRpc(jest.fn().mockResolvedValue({ data: [{ generation_enabled: false, hourly_limit: 100, daily_limit: 1000, hourly_used: 95, daily_used: 500, utilization_percent: 95, warning_level: 'CRITICAL_95' }], error: null }));
    const g = await fetchGlobalGenerationGuard();
    expect(g?.generationEnabled).toBe(false);
    expect(g?.utilizationPercent).toBe(95);
    expect(g?.warningLevel).toBe('CRITICAL_95');
  });
  it('fails clean → null on RPC error (e.g. non-admin)', async () => {
    withRpc(jest.fn().mockResolvedValue({ data: null, error: { message: 'admin required' } }));
    expect(await fetchGlobalGenerationGuard()).toBeNull();
  });
});

describe('setGlobalGenerationEnabled', () => {
  it('toggles via the RPC, PRESERVING the current limits (never changes defaults)', async () => {
    const rpc = jest.fn().mockResolvedValue({ error: null });
    withRpc(rpc);
    expect(await setGlobalGenerationEnabled(false, 100, 1000)).toBe(true);
    expect(rpc).toHaveBeenCalledWith('set_global_generation_guard', { p_generation_enabled: false, p_hourly_limit: 100, p_daily_limit: 1000 });
  });
  it('returns false on error', async () => {
    withRpc(jest.fn().mockResolvedValue({ error: { message: 'x' } }));
    expect(await setGlobalGenerationEnabled(true, 100, 1000)).toBe(false);
  });
});
