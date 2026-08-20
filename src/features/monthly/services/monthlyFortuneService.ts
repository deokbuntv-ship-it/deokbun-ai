import type { BirthInfoDraft } from '@/features/consultation';
import { isAuthTransportError } from '@/features/chat/adapters/llmError';
import { clientCurrentMonthGuess } from '@/features/monthly/engine/monthDate';
import {
  MONTHLY_CANONICAL_VERSION,
  type MonthlyFortuneRecord,
  type MonthlyFortuneResult,
  type MonthlyOverallTier,
} from '@/features/monthly/types';
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

async function getByMonth(year: number, month: number, subjectId?: string | null): Promise<MonthlyFortuneRecord | null> {
  try {
    let query = getSupabaseClient().from(TABLE).select(COLUMNS).eq('fortune_year', year).eq('fortune_month', month)
      .eq('tier', 'FREE').eq('semantic_version', MONTHLY_CANONICAL_VERSION);
    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data } = await query.maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function loadLatest(): Promise<MonthlyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').eq('semantic_version', MONTHLY_CANONICAL_VERSION)
      .order('fortune_year', { ascending: false }).order('fortune_month', { ascending: false })
      .limit(1).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function listAll(limit = 36): Promise<MonthlyFortuneRecord[]> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').eq('semantic_version', MONTHLY_CANONICAL_VERSION)
      .order('fortune_year', { ascending: false }).order('fortune_month', { ascending: false }).limit(limit);
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch { return []; }
}

type EdgeGenResult =
  | { ok: true; year: number; month: number; overallTier: MonthlyOverallTier; result: MonthlyFortuneResult }
  | { ok: false; reason: string; year?: number; month?: number };
async function generateViaEdge(): Promise<{ status: 'ok'; gen: Extract<EdgeGenResult, { ok: true }> }
  | { status: 'auth' | 'unavailable' | 'error' }> {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('chat', { body: { kind: 'monthly_fortune' } });
    if (error) return { status: isAuthTransportError(error) ? 'auth' : 'error' };
    const gen = data as EdgeGenResult | null;
    if (gen?.ok === false && gen.reason === 'EVIDENCE_UNAVAILABLE') return { status: 'unavailable' };
    return gen?.ok === true && typeof gen.year === 'number' && typeof gen.month === 'number' && !!gen.result
      ? { status: 'ok', gen } : { status: 'error' };
  } catch { return { status: 'error' }; }
}

export type EnsureMonthOutcome =
  | { status: 'ok'; record: MonthlyFortuneRecord; cacheHit: boolean }
  | { status: 'auth' | 'unavailable' | 'error' };

async function ensureCurrentMonth(input: { birthInput: BirthInfoDraft; subjectId?: string | null }): Promise<EnsureMonthOutcome> {
  const guess = clientCurrentMonthGuess(Date.now());
  const cached = await getByMonth(guess.year, guess.month, input.subjectId);
  if (cached) return { status: 'ok', record: cached, cacheHit: true };
  const generated = await generateViaEdge();
  if (generated.status !== 'ok') return generated;
  const record = await getByMonth(generated.gen.year, generated.gen.month, input.subjectId);
  return record ? { status: 'ok', record, cacheHit: false } : { status: 'error' };
}

export const monthlyFortuneService = { getByMonth, loadLatest, listAll, ensureCurrentMonth };
