import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

import type {
  AdminSubjectSummary,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserListParams,
} from '../types';

// Read-only admin operations over users + their saved subjects. Backed entirely
// by SECURITY DEFINER RPCs (admin_list_users / admin_get_user) that self-check
// public.is_admin() — no direct cross-user table reads, no service_role key.
// Until the RPCs are applied (docs/admin/ADMIN_02_SETUP.sql) these calls error,
// and callers surface an error state (fail-closed).

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function toListItem(row: Record<string, unknown>): AdminUserListItem {
  return {
    userId: String(row.user_id ?? ''),
    displayName: asString(row.display_name),
    createdAt: asString(row.created_at),
    subjectCount: asCount(row.subject_count),
    conversationCount: asCount(row.conversation_count),
  };
}

// Maps a subject row to a presentation-safe summary. The RPC already returns a
// curated birth projection (only the fields below) — the raw birth_info object is
// never sent to the client. This reads that curated object defensively.
function toSubjectSummary(row: Record<string, unknown>): AdminSubjectSummary {
  const birth = (row.birth_info ?? {}) as Record<string, unknown>;

  const year = asString(birth.birthYear);
  const month = asString(birth.birthMonth);
  const day = asString(birth.birthDay);
  const birthDate = year || month || day ? `${year ?? ''}. ${month ?? ''}. ${day ?? ''}` : '–';

  const calendarType =
    birth.calendarType === 'solar' || birth.calendarType === 'lunar'
      ? birth.calendarType
      : null;
  const lunarMonthType =
    birth.lunarMonthType === 'regular' || birth.lunarMonthType === 'leap'
      ? birth.lunarMonthType
      : null;
  const birthTimeAccuracy =
    birth.birthTimeAccuracy === 'exact' ||
    birth.birthTimeAccuracy === 'approximate' ||
    birth.birthTimeAccuracy === 'unknown'
      ? birth.birthTimeAccuracy
      : null;

  return {
    id: String(row.id ?? ''),
    displayName: asString(row.display_name),
    relationship: asString(row.relationship),
    isSelf: row.is_self === true,
    calendarType,
    lunarMonthType,
    birthDate,
    birthTimeAccuracy,
    birthPlace: asString(birth.birthPlace),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

function toUserDetail(obj: Record<string, unknown>): AdminUserDetail {
  const rawSubjects = Array.isArray(obj.subjects) ? obj.subjects : [];
  return {
    userId: String(obj.user_id ?? ''),
    email: asString(obj.email),
    displayName: asString(obj.display_name),
    createdAt: asString(obj.created_at),
    lastSignInAt: asString(obj.last_sign_in_at),
    conversationCount: asCount(obj.conversation_count),
    subjects: rawSubjects.map((s) =>
      toSubjectSummary(s as Record<string, unknown>),
    ),
  };
}

async function listUsers(
  params: AdminUserListParams,
): Promise<AdminUserListItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_list_users', {
    p_search: params.search?.trim() ? params.search.trim() : null,
    p_limit: params.limit,
    p_offset: params.offset,
  });
  if (error) {
    logDbError(error, 'admin', 'db');
  }
  return ((data as Record<string, unknown>[] | null) ?? []).map(toListItem);
}

async function getUser(userId: string): Promise<AdminUserDetail | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_get_user', {
    p_user_id: userId,
  });
  if (error) {
    logDbError(error, 'admin', 'db');
  }
  if (data === null || typeof data !== 'object') {
    return null;
  }
  return toUserDetail(data as Record<string, unknown>);
}

export const adminUsersService = {
  listUsers,
  getUser,
};
