export const GLOBAL_PAID_GENERATION_WORKLOADS = [
  'chat', 'today_fortune', 'monthly_fortune', 'compatibility', 'summary',
  'content_generation', 'famous_suggestion', 'image_generation', 'video_generation',
] as const;

export type GlobalPaidGenerationWorkload = typeof GLOBAL_PAID_GENERATION_WORKLOADS[number];

type RpcClient = {
  rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }>;
};

type GuardUsage = {
  hourlyUsed: number;
  dailyUsed: number;
  hourlyLimit: number;
  dailyLimit: number;
  utilizationPercent: number;
  warningLevel: 'NORMAL' | 'WATCH_50' | 'WARNING_80' | 'CRITICAL_95';
};

export type GlobalSpendGuardVerdict =
  | ({ status: 'allowed'; reservationId: string } & GuardUsage)
  | ({ status: 'disabled' } & GuardUsage)
  | ({ status: 'exhausted'; period: 'hourly' | 'daily'; retryAfterMs: number } & GuardUsage)
  | { status: 'unavailable' };

function finiteInt(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;
}

function usage(row: Record<string, unknown>): GuardUsage {
  const warning = row.warning_level;
  return {
    hourlyUsed: finiteInt(row.hourly_used),
    dailyUsed: finiteInt(row.daily_used),
    hourlyLimit: finiteInt(row.hourly_limit),
    dailyLimit: finiteInt(row.daily_limit),
    utilizationPercent: finiteInt(row.utilization_percent),
    warningLevel: warning === 'WATCH_50' || warning === 'WARNING_80' || warning === 'CRITICAL_95'
      ? warning
      : 'NORMAL',
  };
}

export async function reserveGlobalPaidGeneration(
  admin: RpcClient | null,
  userId: string | null,
  workload: GlobalPaidGenerationWorkload,
  // Sprint I §4 — when a requestId is supplied AND idempotent routing is enabled (owner has applied migration
  // 20260836), the request-scoped wrapper is used so one logical request consumes AT MOST one global slot
  // across retries. Ceilings/locking/kill-switch are unchanged. Absent → the legacy RPC (unchanged behavior).
  opts?: { requestId?: string | null; idempotent?: boolean },
): Promise<GlobalSpendGuardVerdict> {
  if (!admin || !userId) return { status: 'unavailable' };
  try {
    const useIdem = opts?.idempotent === true && typeof opts?.requestId === 'string' && opts.requestId.length > 0;
    const { data, error } = useIdem
      ? await admin.rpc('reserve_global_paid_generation_idem', {
          p_user_id: userId, p_workload: workload, p_request_id: opts!.requestId, p_units: 1,
        })
      : await admin.rpc('reserve_global_paid_generation', {
          p_user_id: userId, p_workload: workload, p_units: 1,
        });
    const raw = Array.isArray(data) ? data[0] : data;
    if (error || !raw || typeof raw !== 'object') return { status: 'unavailable' };
    const row = raw as Record<string, unknown>;
    const state = usage(row);
    if (row.allowed === true && typeof row.reservation_id === 'string') {
      return { status: 'allowed', reservationId: row.reservation_id, ...state };
    }
    if (row.reason === 'GENERATION_DISABLED') return { status: 'disabled', ...state };
    if (row.reason === 'HOURLY_LIMIT_REACHED' || row.reason === 'DAILY_LIMIT_REACHED') {
      return {
        status: 'exhausted',
        period: row.reason === 'HOURLY_LIMIT_REACHED' ? 'hourly' : 'daily',
        retryAfterMs: finiteInt(row.retry_after_ms),
        ...state,
      };
    }
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}

export function globalSpendGuardFailure(verdict: Exclude<GlobalSpendGuardVerdict, { status: 'allowed' }>) {
  if (verdict.status === 'disabled') {
    return { status: 503, body: { error: 'GENERATION_DISABLED' }, headers: {} };
  }
  if (verdict.status === 'exhausted') {
    return {
      status: 429,
      body: {
        error: 'GLOBAL_GENERATION_LIMIT_REACHED',
        period: verdict.period,
        retryAfterMs: verdict.retryAfterMs,
      },
      headers: { 'Retry-After': String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))) },
    };
  }
  return { status: 503, body: { error: 'ECONOMIC_GUARD_UNAVAILABLE' }, headers: {} };
}
