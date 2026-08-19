import type { BirthInfoDraft } from '@/features/consultation';
import { isAuthTransportError } from '@/features/chat/adapters/llmError';
import { clientCurrentMonthGuess } from '@/features/monthly/engine/monthDate';
import type { MonthlyFortuneRecord, MonthlyFortuneResult, MonthlyOverallTier } from '@/features/monthly/types';
import { getSupabaseClient } from '@/services/supabase';

// Client persistence + load-or-create for 이번 달 운세. READS (Home preview, detail, 운세우편함) hit
// monthly_fortunes directly under owner RLS — zero LLM, zero edge. GENERATION goes through the stateless Edge
// generator, which owns the authoritative target month (server time); the client writes THAT (year, month) as
// the key (its own guess is only a cache-read hint). unique(user_id, fortune_year, fortune_month) guarantees
// ONE canonical row per month even under a race.

const TABLE = 'monthly_fortunes';
const COLUMNS = 'id, fortune_year, fortune_month, timezone, overall_tier, result_json, evidence_version, plan_version, policy_version, model, created_at, updated_at';

type Row = {
  id: string;
  fortune_year: number;
  fortune_month: number;
  timezone: string;
  overall_tier: string;
  result_json: MonthlyFortuneResult;
  evidence_version: string | null;
  plan_version: string | null;
  policy_version: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): MonthlyFortuneRecord {
  return {
    id: row.id,
    year: row.fortune_year,
    month: row.fortune_month,
    timezone: row.timezone,
    overallTier: row.overall_tier as MonthlyOverallTier,
    result: row.result_json,
    evidenceVersion: row.evidence_version,
    planVersion: row.plan_version,
    policyVersion: row.policy_version,
    model: row.model,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── reads (0 LLM) ────────────────────────────────────────────────────────────
async function getByMonth(year: number, month: number): Promise<MonthlyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient()
      .from(TABLE)
      .select(COLUMNS)
      .eq('fortune_year', year)
      .eq('fortune_month', month)
      .maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch {
    return null;
  }
}

async function loadLatest(): Promise<MonthlyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient()
      .from(TABLE)
      .select(COLUMNS)
      .order('fortune_year', { ascending: false })
      .order('fortune_month', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch {
    return null;
  }
}

async function listAll(limit = 36): Promise<MonthlyFortuneRecord[]> {
  try {
    const { data } = await getSupabaseClient()
      .from(TABLE)
      .select(COLUMNS)
      .order('fortune_year', { ascending: false })
      .order('fortune_month', { ascending: false })
      .limit(limit);
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch {
    return [];
  }
}

// ── generation (edge) + persist ──────────────────────────────────────────────
type EdgeGenResult =
  | { ok: true; year: number; month: number; overallTier: MonthlyOverallTier; result: MonthlyFortuneResult; policyVersion?: string; evidenceVersion?: string; planVersion?: string; model?: string }
  | { ok: false; reason: string; year?: number; month?: number };

async function generateViaEdge(
  birthInput: BirthInfoDraft,
): Promise<{ status: 'ok'; gen: Extract<EdgeGenResult, { ok: true }> } | { status: 'auth' } | { status: 'unavailable' } | { status: 'error' }> {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('chat', { body: { kind: 'monthly_fortune', birthInput } });
    if (error) return { status: isAuthTransportError(error) ? 'auth' : 'error' };
    const gen = data as EdgeGenResult | null;
    if (gen && gen.ok === false && gen.reason === 'EVIDENCE_UNAVAILABLE') return { status: 'unavailable' };
    if (!gen || gen.ok !== true || typeof gen.year !== 'number' || typeof gen.month !== 'number' || !gen.result) return { status: 'error' };
    return { status: 'ok', gen };
  } catch {
    return { status: 'error' };
  }
}

async function persist(gen: Extract<EdgeGenResult, { ok: true }>, subjectId: string | null): Promise<MonthlyFortuneRecord | null> {
  try {
    await getSupabaseClient()
      .from(TABLE)
      .upsert(
        {
          fortune_year: gen.year,
          fortune_month: gen.month,
          timezone: 'Asia/Seoul',
          overall_tier: gen.overallTier,
          result_json: gen.result,
          evidence_version: gen.evidenceVersion ?? null,
          plan_version: gen.planVersion ?? null,
          policy_version: gen.policyVersion ?? null,
          model: gen.model ?? null,
          ...(subjectId ? { subject_id: subjectId } : {}),
        },
        { onConflict: 'user_id,fortune_year,fortune_month', ignoreDuplicates: true },
      );
  } catch {
    /* fall through to a read — the row may already exist from a concurrent write */
  }
  return getByMonth(gen.year, gen.month);
}

export type EnsureMonthOutcome =
  | { status: 'ok'; record: MonthlyFortuneRecord; cacheHit: boolean }
  | { status: 'auth' }
  | { status: 'unavailable' }
  | { status: 'error' };

// Load-or-create for the current month: cache hit → 0 LLM; miss → ONE edge generation → persist → return.
async function ensureCurrentMonth(input: { birthInput: BirthInfoDraft; subjectId?: string | null }): Promise<EnsureMonthOutcome> {
  const guess = clientCurrentMonthGuess(Date.now());
  const cached = await getByMonth(guess.year, guess.month);
  if (cached) return { status: 'ok', record: cached, cacheHit: true };

  const gen = await generateViaEdge(input.birthInput);
  if (gen.status === 'auth') return { status: 'auth' };
  if (gen.status === 'unavailable') return { status: 'unavailable' };
  if (gen.status === 'error') return { status: 'error' };

  const record = await persist(gen.gen, input.subjectId ?? null);
  if (!record) return { status: 'error' };
  return { status: 'ok', record, cacheHit: false };
}

export const monthlyFortuneService = {
  getByMonth,
  loadLatest,
  listAll,
  ensureCurrentMonth,
};
