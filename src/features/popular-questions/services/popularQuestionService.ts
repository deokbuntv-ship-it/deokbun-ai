// Popular consultation questions — data access. Two audiences share one table under RLS:
//   • CONSUMER read (Home): anyone may read ACTIVE rows (RLS: `using (is_active = true)`). listActive() THROWS
//     on error on purpose, so Home can fall back to the curated DEFAULT set (pre-migration / DB unreachable)
//     instead of silently rendering an empty section.
//   • ADMIN write (console): create / edit / activate / reorder are gated by `public.is_admin()` in RLS — the
//     client never uses the service_role key. Metrics come from a SECURITY DEFINER aggregate RPC, not a client
//     scan of product_events (which is write-only to users).
import { getSupabaseClient } from '@/services/supabase';

import {
  isPopularQuestionCategory,
  type AdminPopularQuestion,
  type PopularQuestion,
  type PopularQuestionCategory,
  type PopularQuestionCounts,
  type PopularQuestionInput,
} from '../types';

const TABLE = 'popular_consultation_questions';
const COLUMNS = 'id, question_text, analytics_key, category, is_active, display_order, created_at, updated_at';

type Row = {
  id: string;
  question_text: string;
  analytics_key: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

function toCategory(value: string): PopularQuestionCategory {
  return isPopularQuestionCategory(value) ? value : 'GENERAL';
}

function mapConsumer(r: Row): PopularQuestion {
  return {
    id: r.id,
    questionText: r.question_text,
    analyticsKey: r.analytics_key,
    category: toCategory(r.category),
    displayOrder: r.display_order,
  };
}

function mapAdmin(r: Row): AdminPopularQuestion {
  return {
    ...mapConsumer(r),
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** CONSUMER — active questions in owner-defined order. THROWS on query error (Home catches → curated defaults).
 * A successful query with zero active rows resolves to [] (the owner intentionally deactivated all). */
async function listActive(): Promise<PopularQuestion[]> {
  const { data, error } = await getSupabaseClient()
    .from(TABLE)
    .select(COLUMNS)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(mapConsumer);
}

/** ADMIN — every question (active + inactive) in display order. Returns [] on error (screen shows empty). */
async function listAll(): Promise<AdminPopularQuestion[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from(TABLE)
      .select(COLUMNS)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) return [];
    return ((data as Row[] | null) ?? []).map(mapAdmin);
  } catch {
    return [];
  }
}

async function create(input: PopularQuestionInput): Promise<AdminPopularQuestion | null> {
  const questionText = input.questionText.trim();
  const analyticsKey = input.analyticsKey.trim();
  if (questionText.length === 0 || analyticsKey.length === 0) return null;
  try {
    const { data, error } = await getSupabaseClient()
      .from(TABLE)
      .insert({
        question_text: questionText.slice(0, 200),
        analytics_key: analyticsKey.slice(0, 64),
        category: input.category,
        display_order: input.displayOrder,
        is_active: input.isActive,
      })
      .select(COLUMNS)
      .maybeSingle();
    if (error) return null;
    return data ? mapAdmin(data as Row) : null;
  } catch {
    return null;
  }
}

// analytics_key is intentionally NOT updatable — changing it would fork a question's metrics history.
async function update(
  id: string,
  patch: Partial<Pick<PopularQuestionInput, 'questionText' | 'category' | 'displayOrder' | 'isActive'>>,
): Promise<AdminPopularQuestion | null> {
  const set: Record<string, unknown> = {};
  if (typeof patch.questionText === 'string') {
    const t = patch.questionText.trim();
    if (t.length === 0) return null;
    set.question_text = t.slice(0, 200);
  }
  if (patch.category) set.category = patch.category;
  if (typeof patch.displayOrder === 'number' && Number.isFinite(patch.displayOrder)) {
    set.display_order = Math.trunc(patch.displayOrder);
  }
  if (typeof patch.isActive === 'boolean') set.is_active = patch.isActive;
  if (Object.keys(set).length === 0) return null;
  try {
    const { data, error } = await getSupabaseClient()
      .from(TABLE)
      .update(set)
      .eq('id', id)
      .select(COLUMNS)
      .maybeSingle();
    if (error) return null;
    return data ? mapAdmin(data as Row) : null;
  } catch {
    return null;
  }
}

async function setActive(id: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient().from(TABLE).update({ is_active: isActive }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// Reorder without drag-drop: the screen swaps a row with its neighbor by writing both display_order values.
// No unique constraint on display_order, so a transient tie is harmless (order falls back to created_at).
async function setDisplayOrder(id: string, displayOrder: number): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from(TABLE)
      .update({ display_order: Math.trunc(displayOrder) })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

async function swapDisplayOrder(a: AdminPopularQuestion, b: AdminPopularQuestion): Promise<boolean> {
  const first = await setDisplayOrder(a.id, b.displayOrder);
  const second = await setDisplayOrder(b.id, a.displayOrder);
  return first && second;
}

// Deactivate over hard-delete (§ sprint) — preserve the question's analytics history. There is intentionally
// no delete() method on this service.

type MetricsRow = {
  analytics_key: string;
  impressions: number | string | null;
  clicks: number | string | null;
  starts: number | string | null;
  successes: number | string | null;
};

function toCount(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

/** ADMIN — server-aggregated funnel counts per analytics_key. `windowDays` null → all-time. */
async function loadMetrics(windowDays: number | null = null): Promise<PopularQuestionCounts[]> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_popular_question_metrics', {
      window_days: windowDays,
    });
    if (error) return [];
    return ((data as MetricsRow[] | null) ?? []).map((r) => ({
      analyticsKey: r.analytics_key,
      impressions: toCount(r.impressions),
      clicks: toCount(r.clicks),
      starts: toCount(r.starts),
      successes: toCount(r.successes),
    }));
  } catch {
    return [];
  }
}

export const popularQuestionService = {
  listActive,
  listAll,
  create,
  update,
  setActive,
  setDisplayOrder,
  swapDisplayOrder,
  loadMetrics,
};

// Display POLICY for the consumer surface (Home). The DB is the single authoritative source of truth for
// this owner-managed conversion list: on ANY load failure we return an EMPTY list so Home OMITS the section
// entirely — we never substitute stale/curated questions in production (that would show config that the owner
// did not authorise, and would fabricate impressions). A safe, PII-free operational warning is logged; nothing
// sensitive is ever emitted. A successful query with zero active rows is likewise an empty list (owner intent).
export async function resolveActivePopularQuestions(limit = 5): Promise<PopularQuestion[]> {
  try {
    const rows = await listActive();
    return rows.slice(0, Math.max(0, limit));
  } catch {
    // eslint-disable-next-line no-console
    console.warn('[popular-questions] active configuration unavailable — omitting Home section');
    return [];
  }
}
