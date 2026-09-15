// Client push-registration SEAM (Sprint J3 §7). Provider-independent orchestration: acquire an OS permission +
// token via an injected acquirer, then persist the device via pushDeviceService. Kept dependency-injected so the
// orchestration is fully unit-tested WITHOUT the native module. The real acquirer (expo-notifications + FCM/APNs
// credentials) is an OWNER/native step → PUSH_PROVIDER_LIVE = EXTERNAL_BLOCKED; the default acquirer reports
// 'unavailable' so the app degrades cleanly. Do NOT call this at cold startup — invoke lazily (post-onboarding
// or from notification settings) so we never spam the OS permission prompt.
import { pushDeviceService } from '@/features/retention/services/pushDeviceService';
import type { PushDevicePlatform, PushProviderName } from '@/features/retention/types';

export type AcquiredToken = {
  available: boolean;             // is a push subsystem available at all (false = no native/provider = EXTERNAL_BLOCKED)
  granted: boolean;               // OS permission granted
  token: string | null;           // provider push token (null when unavailable/denied)
  platform: PushDevicePlatform;
  provider: PushProviderName;
};

export type TokenAcquirer = () => Promise<AcquiredToken>;

export type PushRegistrationStatus = 'registered' | 'permission_denied' | 'no_token' | 'unavailable';
export type PushRegistrationResult = { status: PushRegistrationStatus };

/** Default acquirer: no native provider wired yet (EXTERNAL_BLOCKED). Reports unavailable, never throws. */
export const unavailableTokenAcquirer: TokenAcquirer = async () => ({
  available: false,
  granted: false,
  token: null,
  platform: 'unknown',
  provider: 'none',
});

/**
 * Request permission + register this device for push. Idempotent at the DB layer (upsert on user+device_id).
 * Never throws; returns a status the caller can surface in settings.
 */
export async function registerForPush(deviceId: string, acquire: TokenAcquirer = unavailableTokenAcquirer): Promise<PushRegistrationResult> {
  if (!deviceId || deviceId.trim().length === 0) return { status: 'unavailable' };
  let acquired: AcquiredToken;
  try {
    acquired = await acquire();
  } catch {
    return { status: 'unavailable' };
  }
  if (!acquired.available) return { status: 'unavailable' };
  if (!acquired.granted) return { status: 'permission_denied' };
  if (!acquired.token) return { status: 'no_token' };
  await pushDeviceService.register({
    deviceId,
    platform: acquired.platform,
    provider: acquired.provider,
    pushToken: acquired.token,
  });
  return { status: 'registered' };
}

/** On logout (§10.5): stop targeting this user's devices without deleting history. Never throws. */
export async function unregisterOnLogout(): Promise<void> {
  await pushDeviceService.disableAllForCurrentUser();
}
