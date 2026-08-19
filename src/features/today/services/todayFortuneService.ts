import type { BirthInfoDraft } from '@/features/consultation';
import { isAuthTransportError } from '@/features/chat/adapters/llmError';
import { clientTodayFortuneDateGuess } from '@/features/today/engine/fortuneDate';
import type { DailyFortuneRecord, DailyFortuneResult, DailyOverallTone } from '@/features/today/types';
import { getSupabaseClient } from '@/services/supabase';

// Client persistence + load-or-create for 오늘의 운세. READS (Home preview, detail, 운세우편함) hit
// daily_fortunes directly under owner RLS — zero LLM, zero edge. GENERATION goes through the stateless Edge
// generator, which owns the authoritative fortune_date (server time); the client writes THAT date as the key
// (its own guess is only a cache-read hint, §29). The unique(user_id, fortune_date) index guarantees ONE row
// per day even under a race (§23/§25).

const TABLE = 'daily_fortunes';
const COLUMNS = 'id, fortune_date, timezone, overall_tone, result_json, evidence_version, policy_version, model, created_at, updated_at';

type Row = {
  id: string;
  fortune_date: string;
  timezone: string;
  overall_tone: string;
  result_json: DailyFortuneResult;
  evidence_version: string | null;
  policy_version: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): DailyFortuneRecord {
  return {
    id: row.id,
    fortuneDate: row.fortune_date,
    timezone: row.timezone,
    overallTone: row.overall_tone as DailyOverallTone,
    result: row.result_json,
    evidenceVersion: row.evidence_version,
    policyVersion: row.policy_version,
    model: row.model,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── reads (0 LLM) ────────────────────────────────────────────────────────────
async function getByDate(fortuneDate: string): Promise<DailyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS).eq('fortune_date', fortuneDate).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch {
    return null;
  }
}

async function loadLatest(): Promise<DailyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS).order('fortune_date', { ascending: false }).limit(1).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch {
    return null;
  }
}

async function listAll(limit = 60): Promise<DailyFortuneRecord[]> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS).order('fortune_date', { ascending: false }).limit(limit);
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch {
    return [];
  }
}

// ── generation (edge) + persist ──────────────────────────────────────────────
type EdgeGenResult =
  | { ok: true; fortuneDate: string; overallTone: DailyOverallTone; result: DailyFortuneResult; policyVersion?: string; evidenceVersion?: string; model?: string }
  | { ok: false; reason: string; fortuneDate?: string };

async function generateViaEdge(
  birthInput: BirthInfoDraft,
): Promise<{ status: 'ok'; gen: Extract<EdgeGenResult, { ok: true }> } | { status: 'auth' } | { status: 'unavailable' } | { status: 'error' }> {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('chat', { body: { kind: 'today_fortune', birthInput } });
    if (error) return { status: isAuthTransportError(error) ? 'auth' : 'error' };
    const gen = data as EdgeGenResult | null;
    if (gen && gen.ok === false && gen.reason === 'EVIDENCE_UNAVAILABLE') return { status: 'unavailable' };
    if (!gen || gen.ok !== true || typeof gen.fortuneDate !== 'string' || !gen.result) return { status: 'error' };
    return { status: 'ok', gen };
  } catch {
    return { status: 'error' };
  }
}

async function persist(
  gen: Extract<EdgeGenResult, { ok: true }>,
  subjectId: string | null,
): Promise<DailyFortuneRecord | null> {
  try {
    // Upsert on the authoritative (user, fortune_date). ignoreDuplicates so a concurrent winner is not
    // overwritten; then read back the canonical row (whoever won).
    await getSupabaseClient()
      .from(TABLE)
      .upsert(
        {
          fortune_date: gen.fortuneDate,
          timezone: 'Asia/Seoul',
          overall_tone: gen.overallTone,
          result_json: gen.result,
          evidence_version: gen.evidenceVersion ?? null,
          policy_version: gen.policyVersion ?? null,
          model: gen.model ?? null,
          ...(subjectId ? { subject_id: subjectId } : {}),
        },
        { onConflict: 'user_id,fortune_date', ignoreDuplicates: true },
      );
  } catch {
    /* fall through to a read — the row may already exist from a concurrent write */
  }
  return getByDate(gen.fortuneDate);
}

export type EnsureTodayOutcome =
  | { status: 'ok'; record: DailyFortuneRecord; cacheHit: boolean }
  | { status: 'auth' }
  | { status: 'unavailable' } // chart could not ground a daily fortune
  | { status: 'error' };

// Load-or-create for today: cache hit → 0 LLM; miss → ONE edge generation → persist → return.
async function ensureToday(input: { birthInput: BirthInfoDraft; subjectId?: string | null }): Promise<EnsureTodayOutcome> {
  const guess = clientTodayFortuneDateGuess(Date.now());
  const cached = await getByDate(guess);
  if (cached) return { status: 'ok', record: cached, cacheHit: true };

  const gen = await generateViaEdge(input.birthInput);
  if (gen.status === 'auth') return { status: 'auth' };
  if (gen.status === 'unavailable') return { status: 'unavailable' };
  if (gen.status === 'error') return { status: 'error' };

  const record = await persist(gen.gen, input.subjectId ?? null);
  if (!record) return { status: 'error' };
  return { status: 'ok', record, cacheHit: false };
}

export const todayFortuneService = {
  getByDate,
  loadLatest,
  listAll,
  ensureToday,
};
