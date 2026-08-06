import type { User } from '@supabase/supabase-js';

import type { AuthUser } from '@/features/auth/types/auth';

function readStringMetadataValue(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function mapSupabaseUser(user: User): AuthUser {
  const metadata = user.user_metadata ?? {};

  const displayName =
    readStringMetadataValue(metadata.full_name) ??
    readStringMetadataValue(metadata.name);

  return {
    id: user.id,
    email: user.email ?? null,
    displayName,
  };
}
