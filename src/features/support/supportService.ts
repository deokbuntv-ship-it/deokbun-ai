// 고객문의 — the wiring half. All rules live in supportContract.ts.
//
// The user side talks to `support_inquiries` directly under RLS (select/insert own only); the
// admin side goes through is_admin()-gated RPCs because it needs auth.users for the display
// name and must not be able to rewrite the user's original message.
import { Platform } from 'react-native';

import { getSupabaseClient } from '@/services/supabase';

import {
  validateInquiry,
  type InquiryCategory,
  type InquiryDraft,
  type InquiryStatus,
  type SubmitOutcome,
  type SupportInquiry,
} from './supportContract';

const TABLE = 'support_inquiries';

type Row = {
  id: string;
  category: string;
  message: string;
  status: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
};

const toInquiry = (r: Row): SupportInquiry => ({
  id: r.id,
  category: r.category as InquiryCategory,
  message: r.message,
  status: r.status as InquiryStatus,
  answer: r.answer,
  answeredAt: r.answered_at,
  createdAt: r.created_at,
});

/**
 * App version for the diagnostic context. Read from the Expo config rather than a native
 * module so this works on web and in tests; unknown is fine — it is context, not a gate.
 */
function appVersion(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const Constants = require('expo-constants').default;
    const v = Constants?.expoConfig?.version;
    return typeof v === 'string' && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

function platform(): 'ios' | 'android' | 'web' | null {
  return Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web' ? Platform.OS : null;
}

/** Submit an inquiry. `user_id` comes from the DB default `auth.uid()` — never from the client. */
export async function submitInquiry(draft: InquiryDraft): Promise<SubmitOutcome> {
  const valid = validateInquiry(draft);
  if (!valid.ok) return 'INVALID';

  try {
    const supabase = getSupabaseClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user?.id) return 'UNAUTHENTICATED';

    const email = draft.contactEmail.trim();
    const { error } = await supabase.from(TABLE).insert({
      category: draft.category,
      message: draft.message.trim(),
      contact_email: email.length > 0 ? email : null,
      app_version: appVersion(),
      platform: platform(),
    });
    if (error) return error.code === '42501' ? 'UNAUTHENTICATED' : 'FAILED';
    return 'SUBMITTED';
  } catch {
    return 'NETWORK';
  }
}

/** The caller's own inquiries, newest first. RLS restricts this to their rows. */
export async function listMyInquiries(): Promise<SupportInquiry[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, category, message, status, answer, answered_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return (data as Row[]).map(toInquiry);
  } catch {
    return [];
  }
}

// ── admin ────────────────────────────────────────────────────────────────────────────────────
export type AdminInquiry = SupportInquiry & {
  userId: string;
  userDisplayName: string | null;
  userEmail: string | null;
  contactEmail: string | null;
  appVersion: string | null;
  platform: string | null;
};

export type AdminInquiryResult =
  | { kind: 'ok'; rows: AdminInquiry[] }
  | { kind: 'unavailable'; reason: string };

/**
 * Admin queue. Fail-closed and TRUTHFUL: if the RPC is missing (schema not promoted in this
 * environment) the screen says so rather than rendering an empty list that looks like
 * "no inquiries".
 */
export async function adminListInquiries(status: InquiryStatus | null, limit = 50): Promise<AdminInquiryResult> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('admin_list_inquiries', {
      p_status: status,
      p_limit: limit,
      p_offset: 0,
    });
    if (error) return { kind: 'unavailable', reason: error.message };
    const rows = (data ?? []) as (Row & {
      user_id: string;
      user_display_name: string | null;
      user_email: string | null;
      contact_email: string | null;
      app_version: string | null;
      platform: string | null;
    })[];
    return {
      kind: 'ok',
      rows: rows.map((r) => ({
        ...toInquiry(r),
        userId: r.user_id,
        userDisplayName: r.user_display_name,
        userEmail: r.user_email,
        contactEmail: r.contact_email,
        appVersion: r.app_version,
        platform: r.platform,
      })),
    };
  } catch (e) {
    return { kind: 'unavailable', reason: String(e) };
  }
}

/**
 * Answer or re-status an inquiry. The RPC is the only write path — an admin cannot touch the
 * user's original message, by construction.
 */
export async function adminAnswerInquiry(
  id: string,
  answer: string | null,
  status: InquiryStatus | null,
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('admin_answer_inquiry', {
      p_id: id,
      p_answer: answer,
      p_status: status,
    });
    return error ? { ok: false, reason: error.message } : { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

export const supportService = { submitInquiry, listMyInquiries, adminListInquiries, adminAnswerInquiry };
