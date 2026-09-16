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

// ⚠ 2026-09-17 — 서버 오류를 **버리지 않는다**.
//
// 2026-09-15 실측: 오너가 사용자 ID 칸에 이메일을 넣었고 서버는 `22P02 invalid input syntax for type uuid`
// 를 돌려줬다. 그런데 이 파일이 `if (error) return null` 로 오류를 버려서, 화면에는 "지갑을 불러오지
// 못했습니다 · 사용자 ID와 권한을 확인해 주세요" 만 떴다. 권한 · 함수 · 표를 전부 조회해 보고 나서야
// (production 조회 8회) 원인이 입력값이라는 것을 알 수 있었다. 이유가 화면에 있었다면 5초면 끝났다.
export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string };

function failure(error: { message?: string; code?: string; details?: string; hint?: string } | null, fallback: string): { ok: false; message: string; code?: string } {
  const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(' · ');
  return {
    ok: false,
    message: message.length > 0 ? message : fallback,
    ...(error?.code ? { code: error.code } : {}),
  };
}

// 운영 중에 오너가 아는 것은 이메일이지 UUID 가 아니다(2026-09-15 실측의 진짜 원인). 화면이 서버를 부르기
// 전에 무엇이 들어왔는지 스스로 알 수 있게, 판정은 순수 함수로 둔다.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AdminUserLookupKind = 'uuid' | 'email' | 'unknown';

export function classifyUserLookup(raw: string): AdminUserLookupKind {
  const value = raw.trim();
  if (UUID_RE.test(value)) return 'uuid';
  if (EMAIL_RE.test(value)) return 'email';
  return 'unknown';
}

export type AdminUserMatch = { userId: string; displayName: string | null; createdAt: string | null };

// 이메일 → 사용자. 관리자 전용 RPC(`admin_list_users`, `is_admin()` 게이트)를 그대로 쓴다 — 새 권한도,
// 새 마이그레이션도 만들지 않는다. 그 RPC 는 이메일을 **부분 일치**로 찾으므로, 둘 이상이면 고르지 않고
// 사람에게 되묻는다. 덕 조정은 되돌릴 수 없어서 "아마 이 사람" 으로 진행하면 안 된다.
async function findUserByEmail(email: string): Promise<AdminResult<AdminUserMatch>> {
  const value = email.trim();
  if (classifyUserLookup(value) !== 'email') {
    return { ok: false, message: '이메일 형식이 아니에요. 예: name@example.com' };
  }
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_list_users', { p_search: value, p_limit: 5, p_offset: 0 });
    if (error) return failure(error, '사용자를 찾지 못했어요.');
    const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    if (rows.length === 0) return { ok: false, message: `그 이메일로 가입한 사용자가 없어요: ${value}` };
    if (rows.length > 1) {
      return { ok: false, message: `이 이메일로 ${rows.length}명이 찾아졌어요. 정확한 이메일을 넣거나 사용자 ID(UUID)를 넣어 주세요.` };
    }
    const row = rows[0];
    const userId = typeof row.user_id === 'string' ? row.user_id : '';
    if (!UUID_RE.test(userId)) return { ok: false, message: '사용자 ID 를 읽지 못했어요.' };
    return {
      ok: true,
      data: {
        userId,
        displayName: typeof row.display_name === 'string' ? row.display_name : null,
        createdAt: typeof row.created_at === 'string' ? row.created_at : null,
      },
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '사용자를 찾지 못했어요.' };
  }
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

async function getUserWallet(userId: string): Promise<AdminResult<Record<string, unknown>>> {
  // 서버를 부르기 전에 잡는다 — 이메일을 넣으면 서버는 `22P02` 를 돌려주는데, 그 이유가 화면에 보이지
  // 않으면 "권한 문제" 로 오해하게 된다(2026-09-15 실측).
  if (classifyUserLookup(userId) !== 'uuid') {
    return { ok: false, message: '사용자 ID(UUID)를 넣어 주세요. 이메일이라면 아래 "이메일로 찾기" 를 쓰시면 됩니다.' };
  }
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_user_wallet', { p_user_id: userId });
    if (error) return failure(error, '지갑을 불러오지 못했어요.');
    if (data === null || typeof data !== 'object') return { ok: false, message: '지갑 응답이 비어 있어요.' };
    return { ok: true, data: data as Record<string, unknown> };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '지갑을 불러오지 못했어요.' };
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
}): Promise<AdminResult<string>> {
  if (classifyUserLookup(params.userId) !== 'uuid') {
    return { ok: false, message: '사용자 ID(UUID)를 넣어 주세요. 이메일이라면 먼저 "이메일로 찾기" 로 ID 를 확인하세요.' };
  }
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_adjust_duk', {
      p_user_id: params.userId,
      p_amount: params.amount,
      p_bucket: params.bucket,
      p_reason_note: params.note,
    });
    // ⚠ 이유를 그대로 올린다. 'not authorized'(관리자 아님) · '22P02'(ID 모양) · 'insufficient … balance'
    // (차감이 잔액을 넘음)는 사람이 할 일이 서로 다른데, 예전에는 셋 다 같은 한 줄로 보였다.
    if (error) return failure(error, '조정하지 못했어요.');
    if (typeof data !== 'string' || data.length === 0) return { ok: false, message: '조정 결과(원장 id)를 받지 못했어요.' };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '조정하지 못했어요.' };
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
  // 2026-09-17 — 이메일로 사용자 찾기(관리자 전용 RPC 재사용). 운영 중에 아는 것은 이메일이다.
  findUserByEmail,
};
