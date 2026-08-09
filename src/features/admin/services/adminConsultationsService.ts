import { getSupabaseClient } from '@/services/supabase';

import type {
  AdminConsultationDetail,
  AdminConsultationListItem,
  AdminConsultationListParams,
  AdminMessageMeta,
} from '../types';

// Read-only consultation monitoring. Backed by SECURITY DEFINER RPCs
// (admin_list_consultations / admin_get_consultation) gated by public.is_admin().
// PII-minimal: message CONTENT and summary TEXT are never returned — only
// metadata (role, length, order, counts). No service_role key, no direct
// cross-user table reads. Fail-closed until docs/admin/ADMIN_03_SETUP.sql applied.

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function toListItem(row: Record<string, unknown>): AdminConsultationListItem {
  return {
    conversationId: String(row.conversation_id ?? ''),
    userDisplayName: asString(row.user_display_name),
    subjectLabel: asString(row.subject_label),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
    messageCount: asCount(row.message_count),
  };
}

function toMessageMeta(row: Record<string, unknown>): AdminMessageMeta {
  return {
    seq: asCount(row.seq),
    role: asString(row.role) ?? '',
    length: asCount(row.length),
  };
}

function toDetail(obj: Record<string, unknown>): AdminConsultationDetail {
  const rawMessages = Array.isArray(obj.messages) ? obj.messages : [];
  return {
    conversationId: String(obj.conversation_id ?? ''),
    userId: asString(obj.user_id),
    userDisplayName: asString(obj.user_display_name),
    subjectLabel: asString(obj.subject_label),
    createdAt: asString(obj.created_at),
    updatedAt: asString(obj.updated_at),
    hasSummary: obj.has_summary === true,
    messageCount: asCount(obj.message_count),
    messages: rawMessages.map((m) => toMessageMeta(m as Record<string, unknown>)),
  };
}

async function listConsultations(
  params: AdminConsultationListParams,
): Promise<AdminConsultationListItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_list_consultations', {
    p_search: params.search?.trim() ? params.search.trim() : null,
    p_limit: params.limit,
    p_offset: params.offset,
  });
  if (error) {
    throw error;
  }
  return ((data as Record<string, unknown>[] | null) ?? []).map(toListItem);
}

async function getConsultation(
  conversationId: string,
): Promise<AdminConsultationDetail | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_get_consultation', {
    p_conversation_id: conversationId,
  });
  if (error) {
    throw error;
  }
  if (data === null || typeof data !== 'object') {
    return null;
  }
  return toDetail(data as Record<string, unknown>);
}

export const adminConsultationsService = {
  listConsultations,
  getConsultation,
};
