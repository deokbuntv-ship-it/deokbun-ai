// In-app retention inbox — owner-scoped RLS. DISTINCT from 운세우편함 (§5.1/§5.5): these are "새 콘텐츠/일정이
// 있음" pointers, not the canonical content archive. Creation is IDEMPOTENT via dedup_key (§3.5) so a trigger
// (e.g. "9월 운세 도착") can never create duplicates. Deep links are allowlisted targets only (§17).
import { getSupabaseClient } from '@/services/supabase';
import { isDeepLinkTarget, type DeepLinkTarget } from '@/features/retention/deepLinks';
import type { InAppNotification, NotificationCategory } from '@/features/retention/types';

const TABLE = 'in_app_notifications';
const COLUMNS = 'id, category, title, body, deep_link_target, deep_link_id, read_at, created_at';

type Row = {
  id: string; category: string; title: string; body: string | null;
  deep_link_target: string; deep_link_id: string | null; read_at: string | null; created_at: string;
};

function mapRow(r: Row): InAppNotification {
  return {
    id: r.id,
    category: r.category as NotificationCategory,
    title: r.title,
    body: r.body,
    deepLinkTarget: isDeepLinkTarget(r.deep_link_target) ? r.deep_link_target : 'HOME',
    deepLinkId: r.deep_link_id,
    readAt: r.read_at,
    createdAt: r.created_at,
  };
}

async function list(limit = 30): Promise<InAppNotification[]> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS).order('created_at', { ascending: false }).limit(limit);
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch {
    return [];
  }
}

async function unreadCount(): Promise<number> {
  try {
    const { count } = await getSupabaseClient().from(TABLE).select('id', { count: 'exact', head: true }).is('read_at', null);
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function markRead(id: string): Promise<void> {
  try {
    await getSupabaseClient().from(TABLE).update({ read_at: new Date().toISOString() }).eq('id', id).is('read_at', null);
  } catch {
    /* non-blocking */
  }
}

async function markAllRead(): Promise<void> {
  try {
    await getSupabaseClient().from(TABLE).update({ read_at: new Date().toISOString() }).is('read_at', null);
  } catch {
    /* non-blocking */
  }
}

export type InAppNotificationDraft = {
  category: NotificationCategory;
  title: string;
  body?: string | null;
  deepLinkTarget: DeepLinkTarget;
  deepLinkId?: string | null;
  dedupKey: string;
};

// Idempotent create (§3.5) — a duplicate (user, dedup_key) is ignored, never re-inserted.
async function createIfAbsent(n: InAppNotificationDraft): Promise<void> {
  try {
    await getSupabaseClient()
      .from(TABLE)
      .upsert(
        {
          category: n.category,
          title: n.title,
          body: n.body ?? null,
          deep_link_target: n.deepLinkTarget,
          deep_link_id: n.deepLinkId ?? null,
          dedup_key: n.dedupKey,
        },
        { onConflict: 'user_id,dedup_key', ignoreDuplicates: true },
      );
  } catch {
    /* non-blocking */
  }
}

export const inAppNotificationService = { list, unreadCount, markRead, markAllRead, createIfAbsent };
