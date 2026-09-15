// Account deletion (회원 탈퇴) — the wiring half. Talks to Supabase; all rules live in
// `accountDeletionContract.ts`.
//
// The client CANNOT delete an account: that needs the auth admin API and therefore the service
// role. This module only (a) reads a preview through an RLS-scoped invoker RPC, (b) optionally
// obtains a fresh Apple authorization code, and (c) invokes the `account-delete` Edge Function,
// which does the real work using the TOKEN'S user id — never one we send.
import { Platform } from 'react-native';

import { getSupabaseClient } from '@/services/supabase';

import {
  shouldRevokeApple,
  toDeletionOutcome,
  type AccountDeletionOutcome,
  type AccountDeletionPreview,
} from './accountDeletionContract';

const FUNCTION = 'account-delete';

const EMPTY_PREVIEW: AccountDeletionPreview = {
  dukBalance: 0,
  subjectCount: 0,
  consultationCount: 0,
  reportCount: 0,
};

function toCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/**
 * What the user is about to lose, read as the user (SECURITY INVOKER + RLS), so it can only
 * ever describe their own account.
 *
 * A failure returns zeros rather than throwing: the counts are context, not a gate. Blocking
 * deletion because a count query failed would turn a nice-to-have into a reason the user cannot
 * leave — exactly the dark pattern this screen must not have.
 */
export async function fetchDeletionPreview(): Promise<AccountDeletionPreview> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('account_deletion_preview');
    if (error || !data) return EMPTY_PREVIEW;
    const row = data as Record<string, unknown>;
    return {
      dukBalance: toCount(row.duk_balance),
      subjectCount: toCount(row.subject_count),
      consultationCount: toCount(row.consultation_count),
      reportCount: toCount(row.report_count),
    };
  } catch {
    return EMPTY_PREVIEW;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppleModule = any;
let cachedApple: AppleModule | null | undefined;

function loadApple(): AppleModule | null {
  if (cachedApple !== undefined) return cachedApple;
  try {
    // Lazy require — the same technique as auth/apple/appleAuthService.ts and duk/iap.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    cachedApple = require('expo-apple-authentication');
  } catch {
    cachedApple = null;
  }
  return cachedApple;
}

/**
 * A fresh Apple authorization code, minted by the system sheet, for server-side revocation.
 *
 * Returns 'cancelled' distinctly from null: dismissing Apple's sheet is the user changing their
 * mind about deleting, and must abort the whole flow rather than silently delete without
 * revoking. Any OTHER failure returns null — deletion continues without revocation, because a
 * lingering Apple grant is a smaller harm than an account the user cannot delete.
 */
async function acquireAppleCode(): Promise<{ code: string | null } | 'cancelled'> {
  const A = loadApple();
  if (!A?.signInAsync) return { code: null };
  try {
    const credential = await A.signInAsync({ requestedScopes: [] });
    const code = (credential as { authorizationCode?: unknown })?.authorizationCode;
    return { code: typeof code === 'string' && code ? code : null };
  } catch (e) {
    const code = (e as { code?: unknown })?.code;
    if (code === 'ERR_REQUEST_CANCELED' || code === 'ERR_CANCELED') return 'cancelled';
    return { code: null };
  }
}

/** Providers on the current session's identities (e.g. ['apple'], ['kakao']). */
async function currentProviders(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    const identities = data?.user?.identities ?? [];
    return identities.map((i) => String(i.provider));
  } catch {
    return [];
  }
}

/**
 * Delete this account. Irreversible.
 *
 * On success the local session is signed out here rather than by the caller, so there is no
 * window in which the app holds a token for an account that no longer exists.
 */
export async function deleteAccount(): Promise<AccountDeletionOutcome> {
  let appleAuthorizationCode: string | null = null;

  const providers = await currentProviders();
  if (shouldRevokeApple({ providers, platform: Platform.OS })) {
    const acquired = await acquireAppleCode();
    if (acquired === 'cancelled') return 'CANCELLED';
    appleAuthorizationCode = acquired.code;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke(FUNCTION, {
      body: { appleAuthorizationCode, platform: Platform.OS === 'ios' ? 'ios' : 'web' },
    });

    if (error) {
      const status = (error as { context?: { status?: number } })?.context?.status ?? null;
      return toDeletionOutcome({ status, code: null, threw: false });
    }

    const outcome = toDeletionOutcome({
      status: 200,
      code: (data as { code?: string } | null)?.code ?? null,
      threw: false,
    });
    if (outcome !== 'DELETED') return outcome;

    // The account is gone; drop the local session so nothing retries with a dead token.
    try {
      await supabase.auth.signOut();
    } catch {
      /* the account is already deleted — a failed local sign-out must not read as a failure */
    }
    return 'DELETED';
  } catch {
    return toDeletionOutcome({ threw: true });
  }
}
