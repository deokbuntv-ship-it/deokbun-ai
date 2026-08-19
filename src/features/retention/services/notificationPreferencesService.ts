// Notification preferences — owner-scoped RLS CRUD (like the fortune services, no edge needed). A missing row
// returns conservative DEFAULTS (§4.4). Non-blocking: a failure never surfaces an error to the UX.
import { DEFAULT_NOTIFICATION_PREFERENCES, type NotificationPreferences } from '@/features/retention/types';
import { getSupabaseClient } from '@/services/supabase';

const TABLE = 'notification_preferences';
const COLUMNS = 'monthly_fortune, birthday, important_schedule, service_notice, marketing';

type Row = { monthly_fortune: boolean; birthday: boolean; important_schedule: boolean; service_notice: boolean; marketing: boolean };

function mapRow(r: Row): NotificationPreferences {
  return {
    monthlyFortune: r.monthly_fortune,
    birthday: r.birthday,
    importantSchedule: r.important_schedule,
    serviceNotice: r.service_notice,
    marketing: r.marketing,
  };
}

async function get(): Promise<NotificationPreferences> {
  try {
    const { data } = await getSupabaseClient().from(TABLE).select(COLUMNS).maybeSingle();
    return data ? mapRow(data as Row) : { ...DEFAULT_NOTIFICATION_PREFERENCES };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

async function update(patch: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  const next = { ...(await get()), ...patch };
  try {
    // user_id is filled by the DB default auth.uid(); RLS with-check enforces ownership.
    await getSupabaseClient()
      .from(TABLE)
      .upsert(
        {
          monthly_fortune: next.monthlyFortune,
          birthday: next.birthday,
          important_schedule: next.importantSchedule,
          service_notice: next.serviceNotice,
          marketing: next.marketing,
        },
        { onConflict: 'user_id' },
      );
  } catch {
    /* non-blocking */
  }
  return next;
}

export const notificationPreferencesService = { get, update };
