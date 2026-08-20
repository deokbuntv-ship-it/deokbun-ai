// Admin client for the GLOBAL generation guard (Sprint D §D8). Reads/toggles the backend truth exposed by
// Codex's service-role/`is_admin()`-guarded RPCs (`get_global_generation_guard` / `set_global_generation_guard`,
// migration 20260828000000). This client CHANGES no economic SQL semantics — it only reads state and flips
// the kill switch, preserving the existing rolling-unit limits (100/hour · 1000/day are technical defaults
// pending owner approval — never changed here as a product decision). Fail-clean: any error → null/false.
import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

export type GenerationWarningLevel = 'NORMAL' | 'WATCH_50' | 'WARNING_80' | 'CRITICAL_95';

export type GlobalGenerationGuard = {
  generationEnabled: boolean;
  hourlyLimit: number;
  dailyLimit: number;
  hourlyUsed: number;
  dailyUsed: number;
  utilizationPercent: number;
  warningLevel: GenerationWarningLevel;
};

const WARNING_LEVELS: readonly GenerationWarningLevel[] = ['NORMAL', 'WATCH_50', 'WARNING_80', 'CRITICAL_95'];
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

export function mapGuardRow(row: Record<string, unknown> | null | undefined): GlobalGenerationGuard | null {
  if (!row || typeof row !== 'object') return null;
  const warning = row.warning_level;
  return {
    generationEnabled: row.generation_enabled !== false, // default-on if malformed
    hourlyLimit: num(row.hourly_limit),
    dailyLimit: num(row.daily_limit),
    hourlyUsed: num(row.hourly_used),
    dailyUsed: num(row.daily_used),
    utilizationPercent: num(row.utilization_percent),
    warningLevel: (WARNING_LEVELS as readonly string[]).includes(warning as string) ? (warning as GenerationWarningLevel) : 'NORMAL',
  };
}

/** Read the current global generation guard state (admin-only RPC). Returns null on error / no access. */
export async function fetchGlobalGenerationGuard(): Promise<GlobalGenerationGuard | null> {
  const supabase = getSupabaseClient();
  // The RPC is untyped (client has no generated Database type); calling by name is fine.
  const { data, error } = await supabase.rpc('get_global_generation_guard');
  if (error) {
    logDbError(error, 'admin', 'spend_guard_read');
    return null;
  }
  const row = Array.isArray(data) ? (data[0] as Record<string, unknown> | undefined) : (data as Record<string, unknown> | null);
  return mapGuardRow(row);
}

/**
 * Toggle the global generation kill switch. Preserves the current limits (pass the values just read) — this
 * client never changes the limit defaults. Returns true on success, false on error.
 */
export async function setGlobalGenerationEnabled(
  enabled: boolean,
  hourlyLimit: number,
  dailyLimit: number,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('set_global_generation_guard', {
    p_generation_enabled: enabled,
    p_hourly_limit: hourlyLimit,
    p_daily_limit: dailyLimit,
  });
  if (error) {
    logDbError(error, 'admin', 'spend_guard_write');
    return false;
  }
  return true;
}
