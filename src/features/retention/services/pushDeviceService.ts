// Push device registry — owner-scoped RLS. Multi-device (§10.4): one row per (user, device_id). The push_token
// is SENSITIVE (§10.3) — it is written but NEVER logged and never read back into analytics. Logout can disable
// the association (§10.5) without deleting history.
import { getSupabaseClient } from '@/services/supabase';
import type { PushDevicePlatform, PushProviderName } from '@/features/retention/types';

const TABLE = 'push_devices';

export type RegisterDeviceInput = {
  deviceId: string;
  platform: PushDevicePlatform;
  provider: PushProviderName;
  pushToken?: string | null;
};

async function register(input: RegisterDeviceInput): Promise<void> {
  if (!input.deviceId || input.deviceId.trim().length === 0) return;
  try {
    await getSupabaseClient()
      .from(TABLE)
      .upsert(
        {
          device_id: input.deviceId,
          platform: input.platform,
          provider: input.provider,
          push_token: input.pushToken ?? null,
          enabled: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,device_id' },
      );
  } catch {
    /* non-blocking — never surface, never log the token */
  }
}

async function setEnabled(deviceId: string, enabled: boolean): Promise<void> {
  try {
    await getSupabaseClient().from(TABLE).update({ enabled }).eq('device_id', deviceId);
  } catch {
    /* non-blocking */
  }
}

// On logout (§10.5): disable this user's device associations so personalized delivery stops. Owner RLS scopes
// the update to the current user only.
async function disableAllForCurrentUser(): Promise<void> {
  try {
    await getSupabaseClient().from(TABLE).update({ enabled: false }).eq('enabled', true);
  } catch {
    /* non-blocking */
  }
}

export const pushDeviceService = { register, setEnabled, disableAllForCurrentUser };
