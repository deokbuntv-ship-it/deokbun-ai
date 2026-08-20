import type { BirthInfoDraft } from '@/features/consultation';
import { isAuthTransportError } from '@/features/chat/adapters/llmError';
import { clientTodayFortuneDateGuess } from '@/features/today/engine/fortuneDate';
import {
  TODAY_CANONICAL_VERSION,
  type DailyFortuneRecord,
  type DailyFortuneResult,
  type DailyOverallTone,
} from '@/features/today/types';
import { getSupabaseClient } from '@/services/supabase';

// Reads are owner-RLS cache hits. On a miss the authenticated Edge owns canonical SELF/date, the DB-clock
// lease, paid reservation and persistence. The client never writes or claims a fortune.
const TABLE = 'daily_fortunes';
const COLUMNS = 'id, fortune_date, timezone, overall_tone, result_json, evidence_version, policy_version, model, created_at, updated_at';
type Row = { id: string; fortune_date: string; timezone: string; overall_tone: string; result_json: DailyFortuneResult;
  evidence_version: string | null; policy_version: string | null; model: string | null; created_at: string; updated_at: string };

function mapRow(row: Row): DailyFortuneRecord {
  return { id: row.id, fortuneDate: row.fortune_date, timezone: row.timezone,
    overallTone: row.overall_tone as DailyOverallTone, result: row.result_json,
    evidenceVersion: row.evidence_version, policyVersion: row.policy_version, model: row.model,
    createdAt: row.created_at, updatedAt: row.updated_at };
}

async function getByDate(fortuneDate: string, subjectId?: string | null): Promise<DailyFortuneRecord | null> {
  try {
    let query = getSupabaseClient().from(TABLE).select(COLUMNS).eq('fortune_date', fortuneDate)
      .eq('tier', 'FREE').eq('semantic_version', TODAY_CANONICAL_VERSION);
    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data } = await query.maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function loadLatest(): Promise<DailyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').eq('semantic_version', TODAY_CANONICAL_VERSION)
      .order('fortune_date', { ascending: false }).limit(1).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function listAll(limit = 60): Promise<DailyFortuneRecord[]> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').eq('semantic_version', TODAY_CANONICAL_VERSION)
      .order('fortune_date', { ascending: false }).limit(limit);
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch { return []; }
}

type EdgeGenResult =
  | { ok: true; fortuneDate: string; overallTone: DailyOverallTone; result: DailyFortuneResult }
  | { ok: false; reason: string; fortuneDate?: string };
async function generateViaEdge(): Promise<{ status: 'ok'; gen: Extract<EdgeGenResult, { ok: true }> }
  | { status: 'auth' | 'unavailable' | 'error' }> {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('chat', { body: { kind: 'today_fortune' } });
    if (error) return { status: isAuthTransportError(error) ? 'auth' : 'error' };
    const gen = data as EdgeGenResult | null;
    if (gen?.ok === false && gen.reason === 'EVIDENCE_UNAVAILABLE') return { status: 'unavailable' };
    return gen?.ok === true && typeof gen.fortuneDate === 'string' && !!gen.result
      ? { status: 'ok', gen } : { status: 'error' };
  } catch { return { status: 'error' }; }
}

export type EnsureTodayOutcome =
  | { status: 'ok'; record: DailyFortuneRecord; cacheHit: boolean }
  | { status: 'auth' | 'unavailable' | 'error' };

async function ensureToday(input: { birthInput: BirthInfoDraft; subjectId?: string | null }): Promise<EnsureTodayOutcome> {
  const guess = clientTodayFortuneDateGuess(Date.now());
  const cached = await getByDate(guess, input.subjectId);
  if (cached) return { status: 'ok', record: cached, cacheHit: true };
  const generated = await generateViaEdge();
  if (generated.status !== 'ok') return generated;
  const record = await getByDate(generated.gen.fortuneDate, input.subjectId);
  return record ? { status: 'ok', record, cacheHit: false } : { status: 'error' };
}

export const todayFortuneService = { getByDate, loadLatest, listAll, ensureToday };
