// Advertisement admin CRUD service (Sprint 3B). Uses the normal RLS-guarded client (no
// service_role); writes assume admin-gated RLS on public.advertisements (public.is_admin())
// per docs/ADVERTISEMENTS_SETUP.sql. Fail-closed: services THROW on db error (after
// logDbError) so screens drive AdminStateView; getAd returns null (maybeSingle) for
// not-found; performance reads distinguish "not yet deployed" from a real error.
import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

import { generateTrackingCode, type RandomBytes } from '../trackingCode';
import type {
  Advertisement,
  AdInput,
  AdListItem,
  AdStatus,
} from '../types';

const TABLE = 'advertisements';
const LIST_COLUMNS =
  'id, public_tracking_code, ad_type, publisher_nickname, start_date, contract_type, cost_krw, status';
const FULL_COLUMNS =
  'id, public_tracking_code, ad_type, publisher_nickname, ad_check_url, start_date, contract_type, cost_krw, notes, status, published_at, created_at, updated_at';

type Row = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function toListItem(row: Row): AdListItem {
  return {
    id: String(row.id ?? ''),
    publicTrackingCode: str(row.public_tracking_code),
    adType: (str(row.ad_type) as AdListItem['adType']) ?? 'other',
    publisherNickname: String(row.publisher_nickname ?? ''),
    startDate: str(row.start_date),
    contractType: (str(row.contract_type) as AdListItem['contractType']) ?? 'other',
    costKrw: num(row.cost_krw),
    status: (str(row.status) as AdStatus) ?? 'draft',
  };
}

function toAdvertisement(row: Row): Advertisement {
  return {
    id: String(row.id ?? ''),
    publicTrackingCode: str(row.public_tracking_code),
    adType: (str(row.ad_type) as Advertisement['adType']) ?? 'other',
    publisherNickname: String(row.publisher_nickname ?? ''),
    adCheckUrl: str(row.ad_check_url),
    startDate: str(row.start_date),
    contractType: (str(row.contract_type) as Advertisement['contractType']) ?? 'other',
    costKrw: num(row.cost_krw),
    notes: str(row.notes),
    status: (str(row.status) as AdStatus) ?? 'draft',
    publishedAt: str(row.published_at),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

function toRow(input: AdInput): Row {
  return {
    ad_type: input.adType,
    publisher_nickname: input.publisherNickname,
    ad_check_url: input.adCheckUrl,
    start_date: input.startDate,
    contract_type: input.contractType,
    cost_krw: input.costKrw,
    notes: input.notes,
    status: input.status,
  };
}

export type AdListParams = { search?: string; status?: AdStatus | null; limit: number; offset: number };

async function listAds(params: AdListParams): Promise<AdListItem[]> {
  const supabase = getSupabaseClient();
  let q = supabase.from(TABLE).select(LIST_COLUMNS).order('created_at', { ascending: false });
  if (params.status) q = q.eq('status', params.status);
  if (params.search && params.search.trim().length > 0) {
    q = q.ilike('publisher_nickname', `%${params.search.trim()}%`);
  }
  q = q.range(params.offset, params.offset + params.limit - 1);
  const { data, error } = await q;
  if (error) logDbError(error, 'ads', 'db');
  return (data ?? []).map(toListItem);
}

async function getAd(id: string): Promise<Advertisement | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(TABLE).select(FULL_COLUMNS).eq('id', id).maybeSingle();
  if (error) logDbError(error, 'ads', 'db');
  return data ? toAdvertisement(data as Row) : null;
}

async function createAd(input: AdInput): Promise<Advertisement> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select(FULL_COLUMNS).single();
  if (error) logDbError(error, 'ads', 'db');
  return toAdvertisement(data as Row);
}

async function updateAd(id: string, input: AdInput): Promise<Advertisement> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(toRow(input))
    .eq('id', id)
    .select(FULL_COLUMNS)
    .single();
  if (error) logDbError(error, 'ads', 'db');
  return toAdvertisement(data as Row);
}

async function setStatus(id: string, status: AdStatus): Promise<Advertisement> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status })
    .eq('id', id)
    .select(FULL_COLUMNS)
    .single();
  if (error) logDbError(error, 'ads', 'db');
  return toAdvertisement(data as Row);
}

// Web-only admin → globalThis.crypto is available. Injectable for tests/native safety.
const webRandomBytes: RandomBytes = (n) => {
  const g = globalThis as unknown as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } };
  const out = new Uint8Array(n);
  if (g.crypto?.getRandomValues) return g.crypto.getRandomValues(out);
  // Fail-closed: without a CSPRNG we refuse to mint a weak/guessable code (§9).
  throw new Error('secure RNG unavailable — cannot mint tracking code');
};

/**
 * Publish (§7): assign a public tracking code (stable, permanent §10), set status=active
 * and published_at. The code is generated once and never regenerated on later edits (§10).
 * Throws on failure so the UI never shows a false "발행되었습니다" (§7/§57).
 */
async function publishAd(id: string, getRandomBytes: RandomBytes = webRandomBytes): Promise<Advertisement> {
  const existing = await getAd(id);
  if (!existing) throw new Error('광고를 찾을 수 없습니다.');
  const code = existing.publicTrackingCode ?? generateTrackingCode(getRandomBytes);
  const supabase = getSupabaseClient();
  const patch: Row = {
    public_tracking_code: code,
    status: 'active',
    published_at: existing.publishedAt ?? new Date().toISOString(),
  };
  const { data, error } = await supabase.from(TABLE).update(patch).eq('id', id).select(FULL_COLUMNS).single();
  if (error) logDbError(error, 'ads', 'db');
  return toAdvertisement(data as Row);
}

export const adAdvertisementService = {
  listAds,
  getAd,
  createAd,
  updateAd,
  setStatus,
  publishAd,
};
