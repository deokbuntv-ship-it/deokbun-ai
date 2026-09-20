import type { BirthInfoDraft } from '@/features/consultation';
import { isAuthTransportError, parseAiConsentRequired } from '@/features/chat/adapters/llmError';
import { clientTodayFortuneDateGuess } from '@/features/today/engine/fortuneDate';
import {
  TODAY_CANONICAL_VERSION,
  type DailyFortuneRecord,
  type DailyFortuneResult,
  type DailyOverallTone,
} from '@/features/today/types';
import { canonicalFortuneVersion, canonicalFortuneVersionLike } from '@/features/fortune/birthFingerprint';
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

/**
 * 저장본 찾기.
 *
 * ⚠ 출생정보(`birth`)를 주면 **그 출생정보로 만든 저장본만** 찾는다(GAP-04). 출생정보를 고치면 열쇠가
 *   달라져 캐시가 빗나가고 새로 만든다 — 옛 명식으로 만든 운세가 계속 보이던 문제를 여기서 막는다.
 *   출생정보를 모르는 호출(옛 경로)은 판 번호로 시작하는 것 중 **가장 최근 것**을 준다.
 */
async function getByDate(
  fortuneDate: string,
  subjectId?: string | null,
  birth?: Parameters<typeof canonicalFortuneVersion>[1],
): Promise<DailyFortuneRecord | null> {
  try {
    let query = getSupabaseClient().from(TABLE).select(COLUMNS).eq('fortune_date', fortuneDate)
      .eq('tier', 'FREE');
    query = birth
      ? query.eq('semantic_version', canonicalFortuneVersion(TODAY_CANONICAL_VERSION, birth))
      : query.like('semantic_version', canonicalFortuneVersionLike(TODAY_CANONICAL_VERSION));
    if (subjectId) query = query.eq('subject_id', subjectId);
    // ⚠ `maybeSingle` 이 아니라 최근 1건이다 — 옛 열쇠 행과 새 열쇠 행이 함께 있을 수 있다.
    const { data } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function loadLatest(): Promise<DailyFortuneRecord | null> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').like('semantic_version', canonicalFortuneVersionLike(TODAY_CANONICAL_VERSION))
      .order('fortune_date', { ascending: false }).limit(1).maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch { return null; }
}

async function listAll(limit = 60): Promise<DailyFortuneRecord[]> {
  try {
    // 우편함은 **역사**다 — 옛 출생정보로 만든 지난 운세도 그대로 보인다(판 번호로 시작하는 것 전부).
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS)
      .eq('tier', 'FREE').like('semantic_version', canonicalFortuneVersionLike(TODAY_CANONICAL_VERSION))
      .order('fortune_date', { ascending: false }).limit(limit);
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch { return []; }
}

type EdgeGenResult =
  | { ok: true; fortuneDate: string; overallTone: DailyOverallTone; result: DailyFortuneResult }
  | { ok: false; reason: string; fortuneDate?: string };
async function generateViaEdge(): Promise<{ status: 'ok'; gen: Extract<EdgeGenResult, { ok: true }> }
  | { status: 'auth' | 'unavailable' | 'error' | 'consent' }> {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('chat', { body: { kind: 'today_fortune' } });
    // ⚠ 2026-09-21 (7-4): 403 AI 처리 동의 없음을 **따로** 읽는다. 로그인 문제도 아니고 재시도로도
    //   풀리지 않는다 — 화면이 동의 시트를 열어야 한다. production 은 2026-09-15 부터 이 문을 쓰고 있어
    //   동의 전 사용자는 여기서 막힌다.
    if (error) {
      if (await parseAiConsentRequired(error)) return { status: 'consent' };
      return { status: isAuthTransportError(error) ? 'auth' : 'error' };
    }
    const gen = data as EdgeGenResult | null;
    if (gen?.ok === false && gen.reason === 'EVIDENCE_UNAVAILABLE') return { status: 'unavailable' };
    return gen?.ok === true && typeof gen.fortuneDate === 'string' && !!gen.result
      ? { status: 'ok', gen } : { status: 'error' };
  } catch { return { status: 'error' }; }
}

export type EnsureTodayOutcome =
  | { status: 'ok'; record: DailyFortuneRecord; cacheHit: boolean }
  | { status: 'auth' | 'unavailable' | 'error' | 'consent' };

async function ensureToday(input: { birthInput: BirthInfoDraft; subjectId?: string | null }): Promise<EnsureTodayOutcome> {
  const guess = clientTodayFortuneDateGuess(Date.now());
  // 지금 출생정보로 만든 저장본만 캐시로 인정한다 (GAP-04).
  const cached = await getByDate(guess, input.subjectId, input.birthInput);
  if (cached) return { status: 'ok', record: cached, cacheHit: true };
  const generated = await generateViaEdge();
  if (generated.status !== 'ok') return generated;
  const record = await getByDate(generated.gen.fortuneDate, input.subjectId, input.birthInput);
  return record ? { status: 'ok', record, cacheHit: false } : { status: 'error' };
}

export const todayFortuneService = { getByDate, loadLatest, listAll, ensureToday };
