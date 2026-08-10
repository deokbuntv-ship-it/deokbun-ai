import { getSupabaseClient } from '@/services/supabase';

import type {
  ContentInput,
  ContentItem,
  ContentListItem,
  ContentListParams,
  ContentVersion,
} from '../types';

// Admin-managed Content CRUD via admin-gated RLS on public.content_items (all
// commands require public.is_admin()) — see docs/admin/CONTENT_01_SETUP.sql.
// Normal client, RLS enforced, no service_role. Fail-closed until applied.

const TABLE = 'content_items';
const VERSIONS_TABLE = 'content_versions';
const VERSION_COLUMNS =
  'id, version, title, body, summary, source, provider, model, prompt_version, token_usage, created_at';

const LIST_COLUMNS =
  'id, title, channel, status, source_type, famous_id, updated_at';
const FULL_COLUMNS =
  'id, title, channel, source_type, famous_id, status, slug, category, hero_image_url, body, summary, tags, published_at, created_at, updated_at';

type Row = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function toListItem(row: Row): ContentListItem {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    channel: (str(row.channel) as ContentListItem['channel']) ?? 'generic',
    status: (str(row.status) as ContentListItem['status']) ?? 'draft',
    sourceType:
      (str(row.source_type) as ContentListItem['sourceType']) ?? 'operator',
    famousId: str(row.famous_id),
    updatedAt: str(row.updated_at),
  };
}

function toItem(row: Row): ContentItem {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    channel: (str(row.channel) as ContentItem['channel']) ?? 'generic',
    sourceType:
      (str(row.source_type) as ContentItem['sourceType']) ?? 'operator',
    famousId: str(row.famous_id),
    status: (str(row.status) as ContentItem['status']) ?? 'draft',
    slug: str(row.slug),
    category: str(row.category),
    heroImageUrl: str(row.hero_image_url),
    body: str(row.body),
    summary: str(row.summary),
    tags: toStringArray(row.tags),
    publishedAt: str(row.published_at),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

function toRow(input: ContentInput): Row {
  return {
    title: input.title,
    channel: input.channel,
    source_type: input.sourceType,
    famous_id: input.sourceType === 'famous' ? input.famousId : null,
    status: input.status,
    slug: input.slug,
    category: input.category,
    hero_image_url: input.heroImageUrl,
    body: input.body,
    summary: input.summary,
    tags: input.tags,
  };
}

async function listContent(
  params: ContentListParams,
): Promise<ContentListItem[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from(TABLE).select(LIST_COLUMNS);

  const search = params.search?.trim();
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (params.channel) {
    query = query.eq('channel', params.channel);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.category) {
    query = query.eq('category', params.category);
  }

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .range(params.offset, params.offset + params.limit - 1);

  if (error) {
    throw error;
  }
  return ((data as Row[] | null) ?? []).map(toListItem);
}

async function getContent(id: string): Promise<ContentItem | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select(FULL_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data === null ? null : toItem(data as Row);
}

async function createContent(input: ContentInput): Promise<ContentItem> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(input))
    .select(FULL_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toItem(data as Row);
}

async function updateContent(id: string, input: ContentInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).update(toRow(input)).eq('id', id);
  if (error) {
    throw error;
  }
}

async function cancelContent(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) {
    throw error;
  }
}

function toVersion(row: Row): ContentVersion {
  const source = str(row.source) === 'ai' ? 'ai' : 'manual';
  const usage = (row.token_usage ?? null) as Record<string, unknown> | null;
  const total =
    usage && typeof usage.total_tokens === 'number' ? usage.total_tokens : null;
  return {
    id: String(row.id ?? ''),
    version: typeof row.version === 'number' ? row.version : 0,
    title: str(row.title),
    body: str(row.body),
    summary: str(row.summary),
    source,
    provider: str(row.provider),
    model: str(row.model),
    promptVersion: str(row.prompt_version),
    totalTokens: total,
    createdAt: str(row.created_at),
  };
}

async function listVersions(
  contentId: string,
  limit = 20,
): Promise<ContentVersion[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(VERSIONS_TABLE)
    .select(VERSION_COLUMNS)
    .eq('content_id', contentId)
    .order('version', { ascending: false })
    .limit(limit);
  if (error) {
    throw error;
  }
  return ((data as Row[] | null) ?? []).map(toVersion);
}

export const contentService = {
  listContent,
  getContent,
  createContent,
  updateContent,
  cancelContent,
  listVersions,
};
