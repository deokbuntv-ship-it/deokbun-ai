import { getSupabaseClient } from '@/services/supabase';

import type { AdminResolvedStatus } from '../types';

// The ONLY authority for admin authorization is the Supabase DB function
// public.is_admin() — a SECURITY DEFINER boolean over the caller's auth.uid()
// (see docs/admin/ADMIN_SETUP.sql). The client never reads an allowlist, never
// hardcodes emails, and never uses the service_role key.
//
// FAIL CLOSED: if the function is missing (not yet applied), errors, or returns
// anything other than an explicit `true`, this resolves to 'unavailable' /
// 'not_admin' — it NEVER resolves to 'admin' on failure.
// Pure fail-closed interpretation of the is_admin() RPC result (unit-testable,
// no client mock). Only an explicit boolean `true` is 'admin'; any error →
// 'unavailable'; anything else (false/null/non-true) → 'not_admin'.
export function resolveAdminStatus(result: {
  data: unknown;
  error: unknown;
}): AdminResolvedStatus {
  if (result.error) return 'unavailable';
  return result.data === true ? 'admin' : 'not_admin';
}

async function checkAdminAuthority(): Promise<AdminResolvedStatus> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.rpc('is_admin');
    return resolveAdminStatus({ data, error });
  } catch {
    // Missing function / permission / transport / thrown error → cannot confirm.
    return 'unavailable';
  }
}

export const adminAuthorizationService = {
  checkAdminAuthority,
};
