import type { Profile } from '@/features/profile/types/profile';
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
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).upsert(
    { id: userId, display_name: initialDisplayName },
    { onConflict: 'id', ignoreDuplicates: true },
  );

  if (error) {
    throw error;
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
    throw error;
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
    throw error;
  }
}

export const profileService = {
  ensureProfile,
  loadProfile,
  updateDisplayName,
};
