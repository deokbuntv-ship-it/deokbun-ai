import { logDbError } from '@/features/analysis';
import type { Profile } from '@/features/profile/types/profile';
import { TERMS_VERSION, type ConsentFacts } from '@/features/onboarding/terms';
import { getSupabaseClient } from '@/services/supabase';

// App-owned user profile persistence (APP-23 foundation).
//
// Stores only { id, display_name }. Never stores email, avatar, JWT/tokens, or
// raw auth metadata. RLS restricts every row to its owner (auth.uid() = id).

const TABLE = 'profiles';

type ProfileRow = {
  id: string;
  display_name: string | null;
};

function toProfile(row: ProfileRow): Profile {
  return { id: row.id, displayName: row.display_name };
}

// Ensures a profile row exists for the authenticated user.
// - New user: INSERT { id, display_name }.
// - Existing user: NO-OP (ignoreDuplicates) — a display name the user edited is
//   never overwritten.
// Only the id and initial display name are sent; email is never duplicated here.
async function ensureProfile(
  userId: string,
  initialDisplayName: string | null,
): Promise<void> {
  // Fail-closed assertion (PGRST303 closure §4): ensureProfile is NOT an auth authority — the caller
  // guarantees a valid authenticated session. A missing/blank id means the auth state is not ready;
  // do nothing rather than fire an unauthenticated write.
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    // eslint-disable-next-line no-console
    console.warn('[auth.profile] stage=ensure_profile_skipped reason=missing_user_id');
    return;
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).upsert(
    { id: userId, display_name: initialDisplayName },
    { onConflict: 'id', ignoreDuplicates: true },
  );

  if (error) {
    logDbError(error, 'profile', 'db');
  }
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    logDbError(error, 'profile', 'db');
  }

  if (data === null) {
    return null;
  }

  return toProfile(data as ProfileRow);
}

// Updates the editable display name. updated_at is managed by the DB trigger, so
// the client does not send it.
async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(TABLE)
    .update({ display_name: displayName })
    .eq('id', userId);

  if (error) {
    logDbError(error, 'profile', 'db');
  }
}

// ── Onboarding consent (§17/§20/§21) ────────────────────────────────────────
// RESILIENT read: consent lives in additive profiles columns (migration 20260820000000). Until the owner
// applies it, the SELECT errors — we degrade to "no consent recorded" (→ user routed to the terms step)
// rather than throwing, so a missing migration never crashes onboarding. Never uses logDbError here (it
// throws); a safe, PII-free warn is emitted instead.
type ConsentRow = { terms_version: string | null; marketing_opt_in: boolean | null };

async function loadConsent(userId: string): Promise<ConsentFacts> {
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return { termsVersion: null, marketingOptIn: false };
  }
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('terms_version, marketing_opt_in')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.warn(`[onboarding.consent] stage=load_degraded code=${error.code ?? 'unknown'}`);
      return { termsVersion: null, marketingOptIn: false };
    }
    const row = (data as ConsentRow | null) ?? null;
    return { termsVersion: row?.terms_version ?? null, marketingOptIn: row?.marketing_opt_in === true };
  } catch {
    return { termsVersion: null, marketingOptIn: false };
  }
}

// Persists the accepted required-terms version + the optional marketing choice. THROWS on failure so the
// terms screen can surface a retry (consent MUST be durably recorded before onboarding advances). Upserts
// only the consent columns → never clobbers display_name; timestamps are stamped server-side-safe here.
async function saveConsent(
  userId: string,
  input: { termsVersion: string; marketingOptIn: boolean },
): Promise<void> {
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('saveConsent: missing user id');
  }
  const supabase = getSupabaseClient();
  const nowIso = new Date().toISOString();
  const { error } = await supabase.from(TABLE).upsert(
    {
      id: userId,
      terms_version: input.termsVersion,
      terms_accepted_at: nowIso,
      marketing_opt_in: input.marketingOptIn,
      marketing_opt_in_at: input.marketingOptIn ? nowIso : null,
    },
    { onConflict: 'id' },
  );
  if (error) {
    // Surface (throw) so the UI can retry; log a PII-free breadcrumb. TERMS_VERSION referenced to keep the
    // import meaningful even if a future refactor stops stamping it inline.
    // eslint-disable-next-line no-console
    console.warn(`[onboarding.consent] stage=save_failed version=${TERMS_VERSION} code=${(error as { code?: string }).code ?? 'unknown'}`);
    throw error;
  }
}

export const profileService = {
  ensureProfile,
  loadProfile,
  updateDisplayName,
  loadConsent,
  saveConsent,
};
