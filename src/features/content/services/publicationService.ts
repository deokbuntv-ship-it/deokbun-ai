import { getSupabaseClient } from '@/services/supabase';

import type {
  ContentPublication,
  ManualPublicationInput,
  PublicationChannel,
  PublicationStatus,
} from '../types';

// Publication tracking via admin-gated RLS on public.content_publications (all
// commands require public.is_admin()) — see docs/admin/PUBLICATION_SETUP.sql.
// Normal client, RLS enforced, no service_role. Fail-closed until applied.
//
// Manual publishing (Naver Blog etc.) records a published row here; the operator
// performs the actual external publish by hand (no scraping/automation). Automated
// channels (Instagram, scheduled) reuse this table with provider + idempotency.

const TABLE = 'content_publications';
const COLUMNS =
  'id, content_id, channel, status, scheduled_at, published_at, external_id, external_url, attempt_count, last_error, provider, created_at, updated_at';

type Row = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function toPublication(row: Row): ContentPublication {
  return {
    id: String(row.id ?? ''),
    contentId: String(row.content_id ?? ''),
    channel: (str(row.channel) as PublicationChannel) ?? 'web',
    status: (str(row.status) as PublicationStatus) ?? 'draft',
    scheduledAt: str(row.scheduled_at),
    publishedAt: str(row.published_at),
    externalId: str(row.external_id),
    externalUrl: str(row.external_url),
    attemptCount: typeof row.attempt_count === 'number' ? row.attempt_count : 0,
    lastError: str(row.last_error),
    provider: str(row.provider),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

async function listByContent(contentId: string): Promise<ContentPublication[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('content_id', contentId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(toPublication);
}

// Record an already-completed manual external publish (published_at set by trigger).
async function recordManualPublish(
  input: ManualPublicationInput,
): Promise<ContentPublication> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      content_id: input.contentId,
      channel: input.channel,
      status: 'published',
      provider: input.provider,
      external_url: input.externalUrl,
    })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toPublication(data as Row);
}

async function cancelPublication(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}

export const publicationService = {
  listByContent,
  recordManualPublish,
  cancelPublication,
};
