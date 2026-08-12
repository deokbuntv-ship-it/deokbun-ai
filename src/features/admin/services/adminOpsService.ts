import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

import type {
  AdminAiUsageItem,
  AdminAiUsageParams,
  AdminDashboardOverview,
} from '../types';

// Operations dashboard + AI usage, via SECURITY DEFINER RPCs gated by
// public.is_admin() (admin_dashboard_overview / admin_list_ai_usage). Raw usage
// only — no cost/price hardcoding. Fail-closed until docs/admin/ADMIN_04_SETUP.sql
// is applied (RPC error → callers show an unavailable state, never fake zeros).

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function numOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function toOverview(obj: Record<string, unknown>): AdminDashboardOverview {
  return {
    userCount: num(obj.user_count),
    subjectCount: num(obj.subject_count),
    conversationCount: num(obj.conversation_count),
    conversationToday: num(obj.conversation_today),
    aiRequestCount: num(obj.ai_request_count),
    aiSuccessCount: num(obj.ai_success_count),
    aiErrorCount: num(obj.ai_error_count),
    aiInputTokens: num(obj.ai_input_tokens),
    aiOutputTokens: num(obj.ai_output_tokens),
    aiTodayRequestCount: num(obj.ai_today_request_count),
  };
}

function toUsageItem(row: Record<string, unknown>): AdminAiUsageItem {
  return {
    id: String(row.id ?? ''),
    createdAt: str(row.created_at),
    userId: str(row.user_id),
    model: str(row.model),
    requestType: str(row.request_type),
    status: str(row.status),
    errorCode: str(row.error_code),
    inputTokens: numOrNull(row.input_tokens),
    outputTokens: numOrNull(row.output_tokens),
    totalTokens: numOrNull(row.total_tokens),
    latencyMs: numOrNull(row.latency_ms),
  };
}

async function getDashboardOverview(): Promise<AdminDashboardOverview> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_dashboard_overview');
  if (error) {
    logDbError(error, 'admin', 'db');
  }
  if (data === null || typeof data !== 'object') {
    throw new Error('invalid_overview');
  }
  return toOverview(data as Record<string, unknown>);
}

async function listAiUsage(
  params: AdminAiUsageParams,
): Promise<AdminAiUsageItem[]> {
  const supabase = getSupabaseClient();
  // p_request_type is only sent when a filter is active; the RPC's 3rd arg has a
  // default so the unfiltered (2-arg) call remains valid before/after migration.
  const args: Record<string, unknown> = {
    p_limit: params.limit,
    p_offset: params.offset,
  };
  if (params.requestType) {
    args.p_request_type = params.requestType;
  }
  const { data, error } = await supabase.rpc('admin_list_ai_usage', args);
  if (error) {
    logDbError(error, 'admin', 'db');
    throw error; // surface the outage so the screen's error+retry state renders
  }
  return ((data as Record<string, unknown>[] | null) ?? []).map(toUsageItem);
}

async function getDailyActivity(
  days = 30,
): Promise<import('../types').AdminDailyActivityPoint[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_daily_activity', {
    p_days: days,
  });
  if (error) {
    logDbError(error, 'admin', 'db');
    throw error; // dashboard catches this → honest "trends unavailable" (not empty chart)
  }
  const toNum = (v: unknown) =>
    typeof v === 'number' ? v : Number(v) || 0;
  return ((data as Record<string, unknown>[] | null) ?? []).map((r) => ({
    day: String(r.day ?? ''),
    newUsers: toNum(r.new_users),
    consultations: toNum(r.consultations),
    aiRequests: toNum(r.ai_requests),
  }));
}

export const adminOpsService = {
  getDashboardOverview,
  listAiUsage,
  getDailyActivity,
};
