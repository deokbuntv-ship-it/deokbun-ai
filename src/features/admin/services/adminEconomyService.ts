import { getSupabaseClient } from '@/services/supabase';

// Admin Duk-economy operations service — a thin client over the is_admin()-gated, SECURITY DEFINER RPCs added in
// migration 20260842000000_admin_economy_ops.sql. Reads come from the append-only ledger / business tables (never
// analytics); the ONE write path (adjustDuk) appends an immutable ADMIN_ADJUSTMENT ledger row + an audit entry
// server-side — the client can neither edit nor delete history. Every read fails CLOSED to null / [] so the
// screen shows an honest error / empty state rather than a misleading zero (§86). No secrets or tokens are ever
// returned by these RPCs.
export type EconomyOverview = {
  grantsByReason: Record<string, number>;
  spendsByReason: Record<string, number>;
  bucketBalances: Record<string, number>;
  totalGranted: number;
  totalSpent: number;
  debt: { openCount: number; openAmount: number; resolvedCount: number };
  purchases: { count: number; grantedDuk: number };
  revocations: number;
};

function n(v: unknown): number {
  const x = typeof v === 'string' ? Number(v) : v;
  return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}

// Coerce a jsonb "{ key: amount }" object into a plain Record<string, number>.
function numRecord(v: unknown): Record<string, number> {
  if (v === null || typeof v !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    out[k] = n(val);
  }
  return out;
}

function asObject(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

async function getOverview(fromIso?: string, toIso?: string): Promise<EconomyOverview | null> {
  try {
    const args: Record<string, string> = {};
    if (fromIso) args.p_from = fromIso;
    if (toIso) args.p_to = toIso;
    const { data, error } = await getSupabaseClient().rpc('admin_economy_overview', args);
    if (error || data === null || typeof data !== 'object') return null;
    const row = data as Record<string, unknown>;
    const debt = asObject(row.debt);
    const purchases = asObject(row.purchases);
    return {
      grantsByReason: numRecord(row.grants_by_reason),
      spendsByReason: numRecord(row.spends_by_reason),
      bucketBalances: numRecord(row.bucket_balances),
      totalGranted: n(row.total_granted),
      totalSpent: n(row.total_spent),
      debt: {
        openCount: n(debt.open_count),
        openAmount: n(debt.open_amount),
        resolvedCount: n(debt.resolved_count),
      },
      purchases: {
        count: n(purchases.count),
        grantedDuk: n(purchases.granted_duk),
      },
      revocations: n(row.revocations),
    };
  } catch {
    return null;
  }
}

async function getUserWallet(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_user_wallet', { p_user_id: userId });
    if (error || data === null || typeof data !== 'object') return null;
    return data as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function listLedger(params: {
  userId?: string;
  reason?: string;
  limit?: number;
}): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_list_duk_ledger', {
      p_user_id: params.userId ?? null,
      p_reason: params.reason ?? null,
      p_limit: params.limit ?? 100,
    });
    if (error || !Array.isArray(data)) return [];
    return data as Record<string, unknown>[];
  } catch {
    return [];
  }
}

async function adjustDuk(params: {
  userId: string;
  amount: number;
  bucket: 'PLUS' | 'REWARD' | 'PAID';
  note: string;
}): Promise<string | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_adjust_duk', {
      p_user_id: params.userId,
      p_amount: params.amount,
      p_bucket: params.bucket,
      p_reason_note: params.note,
    });
    if (error) return null;
    return typeof data === 'string' ? data : null;
  } catch {
    return null;
  }
}

async function listAuditLog(limit?: number): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_list_audit_log', { p_limit: limit ?? 100 });
    if (error || !Array.isArray(data)) return [];
    return data as Record<string, unknown>[];
  } catch {
    return [];
  }
}

export const adminEconomyService = {
  getOverview,
  getUserWallet,
  listLedger,
  adjustDuk,
  listAuditLog,
};
