import { getSupabaseClient } from '@/services/supabase';

import type {
  ContentInput,
  ContentItem,
  ContentListItem,
  ContentListParams,
} from '../types';

// Admin-managed Content CRUD via admin-gated RLS on public.content_items (all
// commands require public.is_admin()) — see docs/admin/CONTENT_01_SETUP.sql.
// Normal client, RLS enforced, no service_role. Fail-closed until applied.

const TABLE = 'content_items';

const LIST_COLUMNS =
  'id, title, channel, status, source_type, famous_id, updated_at';
const FULL_COLUMNS =
  'id, title, channel, source_type, famous_id, status, body, summary, tags, created_at, updated_at';

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
    body: str(row.body),
    summary: str(row.summary),
    tags: toStringArray(row.tags),
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

export const contentService = {
  listContent,
  getContent,
  createContent,
  updateContent,
  cancelContent,
};
