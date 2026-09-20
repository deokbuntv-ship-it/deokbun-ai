import type { BirthInfoDraft } from '@/features/consultation';
import { isAuthTransportError, parseAiConsentRequired } from '@/features/chat/adapters/llmError';
import { clientCurrentMonthGuess } from '@/features/monthly/engine/monthDate';
import {
  MONTHLY_CANONICAL_VERSION,
  type MonthlyFortuneRecord,
  type MonthlyFortuneResult,
  type MonthlyOverallTier,
} from '@/features/monthly/types';
import { canonicalFortuneVersion, canonicalFortuneVersionLike } from '@/features/fortune/birthFingerprint';
import { getSupabaseClient } from '@/services/supabase';

const TABLE = 'monthly_fortunes';
const COLUMNS = 'id, fortune_year, fortune_month, timezone, overall_tier, result_json, evidence_version, plan_version, policy_version, model, created_at, updated_at';
type Row = { id: string; fortune_year: number; fortune_month: number; timezone: string; overall_tier: string;
  result_json: MonthlyFortuneResult; evidence_version: string | null; plan_version: string | null;
  policy_version: string | null; model: string | null; created_at: string; updated_at: string };

function mapRow(row: Row): MonthlyFortuneRecord {
  return { id: row.id, year: row.fortune_year, month: row.fortune_month, timezone: row.timezone,
    overallTier: row.overall_tier as MonthlyOverallTier, result: row.result_json,
    evidenceVersion: row.evidence_version, planVersion: row.plan_version,
    policyVersion: row.policy_version, model: row.model, createdAt: row.created_at, updatedAt: row.updated_at };
}

/**
 * 저장본 찾기. 출생정보를 주면 **그 출생정보로 만든 것만** 찾는다 (GAP-04 — 오늘 운세와 같은 규칙).
 */
async function getByMonth(
  year: number,
  month: number,
  subjectId?: string | null,
  birth?: Parameters<typeof canonicalFortuneVersion>[1],
): Promise<MonthlyFortuneRecord | null> {
  try {
    let query = getSupabaseClient().from(TABLE).select(COLUMNS).eq('fortune_year', year).eq('fortune_month', month)
      .eq('tier', 'FREE');
    query = birth
      ? query.eq('semantic_version', canonicalFortuneVersion(MONTHLY_CANONICAL_VERSION, birth))
      : query.like('semantic_version', canonicalFortuneVersionLike(MONTHLY_CANONICAL_VERSION));
    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function loadLatest(): Promise<MonthlyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').like('semantic_version', canonicalFortuneVersionLike(MONTHLY_CANONICAL_VERSION))
      .order('fortune_year', { ascending: false }).order('fortune_month', { ascending: false })
      .limit(1).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function listAll(limit = 36): Promise<MonthlyFortuneRecord[]> {
  try {
    // 우편함은 역사다 — 옛 출생정보로 만든 지난 달 운세도 그대로 보인다.
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').like('semantic_version', canonicalFortuneVersionLike(MONTHLY_CANONICAL_VERSION))
      .order('fortune_year', { ascending: false }).order('fortune_month', { ascending: false }).limit(limit);
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch { return []; }
}

type EdgeGenResult =
  | { ok: true; year: number; month: number; overallTier: MonthlyOverallTier; result: MonthlyFortuneResult }
  | { ok: false; reason: string; year?: number; month?: number };
async function generateViaEdge(): Promise<{ status: 'ok'; gen: Extract<EdgeGenResult, { ok: true }> }
  | { status: 'auth' | 'unavailable' | 'error' | 'consent' }> {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('chat', { body: { kind: 'monthly_fortune' } });
    // ⚠ 2026-09-21 (7-4): 403 AI 처리 동의 없음을 **따로** 읽는다. 로그인 문제도 아니고 재시도로도
    //   풀리지 않는다 — 화면이 동의 시트를 열어야 한다. production 은 2026-09-15 부터 이 문을 쓰고 있어
    //   동의 전 사용자는 여기서 막힌다.
    if (error) {
      if (await parseAiConsentRequired(error)) return { status: 'consent' };
      return { status: isAuthTransportError(error) ? 'auth' : 'error' };
    }
    const gen = data as EdgeGenResult | null;
    if (gen?.ok === false && gen.reason === 'EVIDENCE_UNAVAILABLE') return { status: 'unavailable' };
    return gen?.ok === true && typeof gen.year === 'number' && typeof gen.month === 'number' && !!gen.result
      ? { status: 'ok', gen } : { status: 'error' };
  } catch { return { status: 'error' }; }
}

export type EnsureMonthOutcome =
  | { status: 'ok'; record: MonthlyFortuneRecord; cacheHit: boolean }
  | { status: 'auth' | 'unavailable' | 'error' | 'consent' };

async function ensureCurrentMonth(input: { birthInput: BirthInfoDraft; subjectId?: string | null }): Promise<EnsureMonthOutcome> {
  const guess = clientCurrentMonthGuess(Date.now());
  // 지금 출생정보로 만든 저장본만 캐시로 인정한다 (GAP-04).
  const cached = await getByMonth(guess.year, guess.month, input.subjectId, input.birthInput);
  if (cached) return { status: 'ok', record: cached, cacheHit: true };
  const generated = await generateViaEdge();
  if (generated.status !== 'ok') return generated;
  const record = await getByMonth(generated.gen.year, generated.gen.month, input.subjectId, input.birthInput);
  return record ? { status: 'ok', record, cacheHit: false } : { status: 'error' };
}

export const monthlyFortuneService = { getByMonth, loadLatest, listAll, ensureCurrentMonth };
