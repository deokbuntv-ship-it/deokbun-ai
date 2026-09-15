import { getSupabaseClient } from '@/services/supabase';

// Admin monthly-fortune email campaign operations (Sprint J4). Every method is a thin, fail-clean wrapper over an
// is_admin()-gated RPC (migration 20260841). Reads return null/[] on error (screen shows honest empty/error, never
// fabricated rows). Writes go ONLY through the server RPCs — no direct table mutation, no client-side send.
export type EmailCampaignStatus = 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'PARTIAL' | 'FAILED' | 'CANCELLED';

export type EmailCampaignSummary = {
  id: string;
  campaignType: string;
  targetYear: number;
  targetMonth: number;
  subject: string;
  templateVersion: string;
  status: EmailCampaignStatus;
  scheduledAt: string | null;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: string;
  completedAt: string | null;
};

export type EmailCampaignDetail = {
  campaign: EmailCampaignSummary;
  deliveryStatusBreakdown: Record<string, number>;
};

function n(v: unknown): number {
  const x = typeof v === 'string' ? Number(v) : (v as number);
  return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}

function mapSummary(row: Record<string, unknown>): EmailCampaignSummary {
  return {
    id: String(row.id),
    campaignType: String(row.campaign_type ?? 'MONTHLY_FORTUNE'),
    targetYear: n(row.target_year),
    targetMonth: n(row.target_month),
    subject: String(row.subject ?? ''),
    templateVersion: String(row.template_version ?? ''),
    status: (row.status as EmailCampaignStatus) ?? 'DRAFT',
    scheduledAt: (row.scheduled_at as string) ?? null,
    totalCount: n(row.total_count),
    sentCount: n(row.sent_count),
    failedCount: n(row.failed_count),
    skippedCount: n(row.skipped_count),
    createdAt: String(row.created_at ?? ''),
    completedAt: (row.completed_at as string) ?? null,
  };
}

async function list(): Promise<EmailCampaignSummary[]> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_list_email_campaigns');
    if (error || !Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).map(mapSummary);
  } catch {
    return [];
  }
}

async function get(id: string): Promise<EmailCampaignDetail | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_get_email_campaign', { p_campaign_id: id });
    if (error || !data) return null;
    const obj = data as { campaign?: Record<string, unknown>; delivery_status_breakdown?: Record<string, number> };
    if (!obj.campaign) return null;
    return {
      campaign: mapSummary(obj.campaign),
      deliveryStatusBreakdown: obj.delivery_status_breakdown ?? {},
    };
  } catch {
    return null;
  }
}

async function create(input: { year: number; month: number; subject: string; templateVersion?: string }): Promise<string | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_create_email_campaign', {
      p_year: input.year, p_month: input.month, p_subject: input.subject,
      p_template_version: input.templateVersion ?? 'monthly-email@1.0.0',
    });
    if (error || !data) return null;
    return String(data);
  } catch {
    return null;
  }
}

async function buildRecipients(id: string): Promise<{ pending: number; skippedNoConsent: number; skippedInvalidEmail: number } | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_build_email_recipients', { p_campaign_id: id });
    if (error || !data) return null;
    const d = data as Record<string, unknown>;
    return { pending: n(d.pending), skippedNoConsent: n(d.skipped_no_consent), skippedInvalidEmail: n(d.skipped_invalid_email) };
  } catch {
    return null;
  }
}

async function schedule(id: string, scheduledAtIso: string): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_schedule_email_campaign', { p_campaign_id: id, p_scheduled_at: scheduledAtIso });
    return !error && data === true;
  } catch {
    return false;
  }
}

async function sendNow(id: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient().rpc('run_email_campaign', { p_campaign_id: id });
    return !error;
  } catch {
    return false;
  }
}

async function cancel(id: string): Promise<number | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_cancel_email_campaign', { p_campaign_id: id });
    if (error) return null;
    return n(data);
  } catch {
    return null;
  }
}

async function retryFailed(id: string): Promise<number | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_retry_failed_email_deliveries', { p_campaign_id: id });
    if (error) return null;
    return n(data);
  } catch {
    return null;
  }
}

export const adminEmailCampaignService = {
  list, get, create, buildRecipients, schedule, sendNow, cancel, retryFailed,
};
