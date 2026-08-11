import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

import type {
  FamousBirthInfo,
  FamousInput,
  FamousListItem,
  FamousListParams,
  FamousProfile,
} from '../types';

// Admin-managed Famous CRUD. Access is enforced by admin-gated RLS on
// public.famous_profiles (all commands require public.is_admin()) — see
// docs/admin/ADMIN_05_SETUP.sql. Uses the normal client (RLS enforced); no
// service_role key. Fail-closed until the table/policies exist.

const TABLE = 'famous_profiles';

const LIST_COLUMNS =
  'id, slug, name, category, status, is_public, calculation_state, updated_at';
const FULL_COLUMNS =
  'id, slug, name, category, occupation, short_description, bio, birth_info, birth_source, birth_source_note, status, is_public, seo_title, seo_description, canonical_url, index_policy, calculation_state, current_snapshot_id, created_at, updated_at, published_at';

type Row = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function toListItem(row: Row): FamousListItem {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    category: str(row.category),
    status: (str(row.status) as FamousListItem['status']) ?? 'draft',
    isPublic: row.is_public === true,
    calculationState:
      (str(row.calculation_state) as FamousListItem['calculationState']) ??
      'not_calculated',
    updatedAt: str(row.updated_at),
  };
}

function toProfile(row: Row): FamousProfile {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    category: str(row.category),
    occupation: str(row.occupation),
    shortDescription: str(row.short_description),
    bio: str(row.bio),
    birthInfo: (row.birth_info as FamousBirthInfo | null) ?? null,
    birthSource:
      (str(row.birth_source) as FamousProfile['birthSource']) ?? 'unknown',
    birthSourceNote: str(row.birth_source_note),
    status: (str(row.status) as FamousProfile['status']) ?? 'draft',
    isPublic: row.is_public === true,
    seoTitle: str(row.seo_title),
    seoDescription: str(row.seo_description),
    canonicalUrl: str(row.canonical_url),
    indexPolicy:
      (str(row.index_policy) as FamousProfile['indexPolicy']) ?? 'noindex',
    calculationState:
      (str(row.calculation_state) as FamousProfile['calculationState']) ??
      'not_calculated',
    currentSnapshotId: str(row.current_snapshot_id),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
    publishedAt: str(row.published_at),
  };
}

// Maps editor input → DB row. Never writes calculation fields (ENGINE-owned) or
// timestamps (DB-managed via defaults/triggers).
function toRow(input: FamousInput): Row {
  return {
    name: input.name,
    slug: input.slug,
    category: input.category,
    occupation: input.occupation,
    short_description: input.shortDescription,
    bio: input.bio,
    birth_info: input.birthInfo,
    birth_source: input.birthSource,
    birth_source_note: input.birthSourceNote,
    status: input.status,
    is_public: input.isPublic,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    canonical_url: input.canonicalUrl,
    index_policy: input.indexPolicy,
  };
}

async function listFamous(params: FamousListParams): Promise<FamousListItem[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from(TABLE).select(LIST_COLUMNS);

  const search = params.search?.trim();
  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.isPublic != null) {
    query = query.eq('is_public', params.isPublic);
  }
  if (params.calculationState) {
    query = query.eq('calculation_state', params.calculationState);
  }

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .range(params.offset, params.offset + params.limit - 1);

  if (error) {
    logDbError(error, 'famous', 'db');
  }
  return ((data as Row[] | null) ?? []).map(toListItem);
}

async function getFamous(id: string): Promise<FamousProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select(FULL_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) {
    logDbError(error, 'famous', 'db');
  }
  return data === null ? null : toProfile(data as Row);
}

async function createFamous(input: FamousInput): Promise<FamousProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(input))
    .select(FULL_COLUMNS)
    .single();
  if (error) {
    logDbError(error, 'famous', 'db');
  }
  return toProfile(data as Row);
}

async function updateFamous(id: string, input: FamousInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).update(toRow(input)).eq('id', id);
  if (error) {
    logDbError(error, 'famous', 'db');
  }
}

// Archive (soft) is the default removal strategy; hard delete is intentionally
// not exposed in the UI to preserve provenance.
async function archiveFamous(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'archived', is_public: false })
    .eq('id', id);
  if (error) {
    logDbError(error, 'famous', 'db');
  }
}

export const famousService = {
  listFamous,
  getFamous,
  createFamous,
  updateFamous,
  archiveFamous,
};
