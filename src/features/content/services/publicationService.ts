import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

import type {
  ContentPublication,
  ManualPublicationInput,
  PublicationChannel,
  PublicationStatus,
  ScheduledPublicationItem,
  SchedulePublicationInput,
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
  if (error) {
    logDbError(error, 'content', 'db');
    throw error; // surface the outage — never show a false success / empty on failure
  }
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
  if (error) {
    logDbError(error, 'content', 'db');
    throw error; // surface the outage — never show a false success / empty on failure
  }
  return toPublication(data as Row);
}

async function cancelPublication(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) {
    logDbError(error, 'content', 'db');
    throw error; // surface the outage — never show a false success / empty on failure
  }
}

// Persist a scheduled publication (status=scheduled). Execution (pg_cron → Edge)
// is a separate DEPLOY_REQUIRED action; scheduling here does NOT auto-publish.
async function schedulePublication(
  input: SchedulePublicationInput,
): Promise<ContentPublication> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      content_id: input.contentId,
      channel: input.channel,
      status: 'scheduled',
      scheduled_at: input.scheduledAt,
      provider: input.provider,
    })
    .select(COLUMNS)
    .single();
  if (error) {
    logDbError(error, 'content', 'db');
    throw error; // surface the outage — never show a false success / empty on failure
  }
  return toPublication(data as Row);
}

// Cross-content publication pipeline (admin visibility; read-only). Uses the
// is_admin()-gated RPC (docs/admin/SCHEDULER_SETUP.sql).
async function listScheduled(limit = 100): Promise<ScheduledPublicationItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc(
    'admin_list_scheduled_publications',
    { p_limit: limit },
  );
  if (error) {
    logDbError(error, 'content', 'db');
    throw error; // surface the outage — never show a false success / empty on failure
  }
  return ((data as Row[] | null) ?? []).map((row) => ({
    id: String(row.id ?? ''),
    contentId: str(row.content_id),
    contentTitle: str(row.content_title),
    channel: (str(row.channel) as PublicationChannel) ?? 'web',
    status: (str(row.status) as PublicationStatus) ?? 'draft',
    scheduledAt: str(row.scheduled_at),
    publishedAt: str(row.published_at),
    provider: str(row.provider),
    externalUrl: str(row.external_url),
    attemptCount: typeof row.attempt_count === 'number' ? row.attempt_count : 0,
    lastError: str(row.last_error),
  }));
}

export const publicationService = {
  listByContent,
  recordManualPublish,
  cancelPublication,
  schedulePublication,
  listScheduled,
};
