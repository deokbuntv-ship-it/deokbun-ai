import { getSupabaseClient } from '@/services/supabase';

// Admin retention overview — read-only aggregate via the admin-guarded RPC. Returns counts only (never any
// user's notification content). null result → the screen shows "데이터 없음"/"연결 확인 필요" rather than a
// misleading zero (§86). There is intentionally no admin write here: creating notifications for other users /
// audiences is not enabled yet (needs safe cross-user targeting design + a scheduler that does not exist).
export type AdminRetentionOverview = {
  inAppTotal: number;
  inAppUnread: number;
  inAppRead: number;
  lifeEventsActive: number;
  notifPrefUsers: number;
  notifPrefMonthlyOn: number;
  notifPrefBirthdayOn: number;
  notifPrefMarketingOn: number;
  notificationOpened30d: number;
  birthdayOpened30d: number;
};

type Row = {
  in_app_total: number | string | null;
  in_app_unread: number | string | null;
  in_app_read: number | string | null;
  life_events_active: number | string | null;
  notif_pref_users: number | string | null;
  notif_pref_monthly_on: number | string | null;
  notif_pref_birthday_on: number | string | null;
  notif_pref_marketing_on: number | string | null;
  notification_opened_30d: number | string | null;
  birthday_opened_30d: number | string | null;
};

function n(v: number | string | null | undefined): number {
  const x = typeof v === 'string' ? Number(v) : v;
  return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}

async function getOverview(): Promise<AdminRetentionOverview | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_retention_overview');
    if (error) return null;
    const row = (Array.isArray(data) ? data[0] : data) as Row | undefined;
    if (!row) return null;
    return {
      inAppTotal: n(row.in_app_total),
      inAppUnread: n(row.in_app_unread),
      inAppRead: n(row.in_app_read),
      lifeEventsActive: n(row.life_events_active),
      notifPrefUsers: n(row.notif_pref_users),
      notifPrefMonthlyOn: n(row.notif_pref_monthly_on),
      notifPrefBirthdayOn: n(row.notif_pref_birthday_on),
      notifPrefMarketingOn: n(row.notif_pref_marketing_on),
      notificationOpened30d: n(row.notification_opened_30d),
      birthdayOpened30d: n(row.birthday_opened_30d),
    };
  } catch {
    return null;
  }
}

export const adminRetentionService = { getOverview };
