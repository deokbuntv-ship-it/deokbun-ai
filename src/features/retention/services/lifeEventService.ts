// Life events — owner-scoped RLS CRUD. CRITICAL (§8.1): `create` REFUSES to persist an event unless
// `confirmed === true`, so a date mentioned in chat can never be silently saved — the caller must have shown
// the user a confirmation first. Minimal free text (title only, §8.5).
import { getSupabaseClient } from '@/services/supabase';
import type { LifeEvent, LifeEventInput, LifeEventStatus, LifeEventType } from '@/features/retention/types';

const TABLE = 'life_events';
const COLUMNS = 'id, subject_id, title, event_type, event_date, event_time, timezone, status, source, reminder_enabled, created_at, updated_at';

type Row = {
  id: string; subject_id: string | null; title: string; event_type: string; event_date: string;
  event_time: string | null; timezone: string; status: string; source: string; reminder_enabled: boolean;
  created_at: string; updated_at: string;
};

function mapRow(r: Row): LifeEvent {
  return {
    id: r.id,
    subjectId: r.subject_id,
    title: r.title,
    eventType: r.event_type as LifeEventType,
    eventDate: r.event_date,
    eventTime: r.event_time,
    timezone: r.timezone,
    status: r.status as LifeEventStatus,
    source: r.source === 'chat_confirmed' ? 'chat_confirmed' : 'manual',
    reminderEnabled: r.reminder_enabled,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function list(): Promise<LifeEvent[]> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS).order('event_date', { ascending: true });
    return ((data as Row[] | null) ?? []).map(mapRow);
  } catch {
    return [];
  }
}

async function create(input: LifeEventInput): Promise<LifeEvent | null> {
  // §8.1/§8.2 — a life event is persisted ONLY after explicit user confirmation.
  if (input.confirmed !== true) return null;
  const title = input.title.trim();
  if (title.length === 0) return null;
  try {
    const { data } = await getSupabaseClient()
      .from(TABLE)
      .insert({
        title: title.slice(0, 80),
        event_type: input.eventType,
        event_date: input.eventDate,
        event_time: input.eventTime ?? null,
        reminder_enabled: input.reminderEnabled ?? true,
        source: input.source ?? 'manual',
        ...(input.subjectId ? { subject_id: input.subjectId } : {}),
      })
      .select(COLUMNS)
      .maybeSingle();
    return data ? mapRow(data as Row) : null;
  } catch {
    return null;
  }
}

async function setStatus(id: string, status: LifeEventStatus): Promise<void> {
  try {
    await getSupabaseClient().from(TABLE).update({ status }).eq('id', id);
  } catch {
    /* non-blocking */
  }
}

async function setReminder(id: string, reminderEnabled: boolean): Promise<void> {
  try {
    await getSupabaseClient().from(TABLE).update({ reminder_enabled: reminderEnabled }).eq('id', id);
  } catch {
    /* non-blocking */
  }
}

// Hard delete (user explicitly removes their own row; RLS scopes it). No orphaned sensitive rows (§19.3).
async function remove(id: string): Promise<void> {
  try {
    await getSupabaseClient().from(TABLE).delete().eq('id', id);
  } catch {
    /* non-blocking */
  }
}

export const lifeEventService = { list, create, setStatus, setReminder, remove };
