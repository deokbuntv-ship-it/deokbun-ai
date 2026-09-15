// Concrete Expo push TokenAcquirer (Batch3 §2.1/§2.2). Real implementation behind a guarded lazy require, so it
// is CODE-complete but degrades FAIL-CLOSED until the native module + a dev/EAS build exist (PUSH_PROVIDER_LIVE
// = EXTERNAL_BLOCKED). Never throws; returns { available:false } when expo-notifications is absent (Expo Go /
// before the dev build) or on web, and { granted:false } when permission is denied or on a simulator. It does
// NOT request permission on its own schedule — the caller invokes it contextually (post-onboarding / settings).
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { PushDevicePlatform } from '@/features/retention/types';
import type { AcquiredToken, TokenAcquirer } from './pushRegistration';

type PermissionResponse = { status?: string };
type ExpoNotificationsModule = {
  getPermissionsAsync: () => Promise<PermissionResponse>;
  requestPermissionsAsync: () => Promise<PermissionResponse>;
  getExpoPushTokenAsync: (opts?: { projectId?: string }) => Promise<{ data?: string }>;
};

// EAS projectId (from app.json extra.eas.projectId) — required by getExpoPushTokenAsync on a real build. Absent
// until the owner runs `eas init`, in which case token acquisition fails closed (caught below).
function easProjectId(): string | undefined {
  const extra = (Constants.expoConfig?.extra ?? {}) as { eas?: { projectId?: string } };
  return extra.eas?.projectId;
}
type ExpoDeviceModule = { isDevice?: boolean };

let cachedNotifications: ExpoNotificationsModule | null | undefined;
function loadNotifications(): ExpoNotificationsModule | null {
  if (cachedNotifications !== undefined) return cachedNotifications;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    cachedNotifications = require('expo-notifications') as ExpoNotificationsModule;
  } catch {
    cachedNotifications = null;
  }
  return cachedNotifications;
}
function loadDevice(): ExpoDeviceModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    return require('expo-device') as ExpoDeviceModule;
  } catch {
    return null;
  }
}

function currentPlatform(): PushDevicePlatform {
  switch (Platform.OS) {
    case 'ios': return 'ios';
    case 'android': return 'android';
    case 'web': return 'web';
    default: return 'unknown';
  }
}

export const expoTokenAcquirer: TokenAcquirer = async (): Promise<AcquiredToken> => {
  const plat = currentPlatform();
  const Notifications = loadNotifications();
  if (!Notifications || plat === 'web') {
    // Native module not installed yet (or web) → EXTERNAL_BLOCKED, degrade cleanly.
    return { available: false, granted: false, token: null, platform: plat, provider: 'none' };
  }
  try {
    const Device = loadDevice();
    if (Device && Device.isDevice === false) {
      // Simulators/emulators can't obtain a real token; available but no token.
      return { available: true, granted: false, token: null, platform: plat, provider: 'expo' };
    }
    let status = (await Notifications.getPermissionsAsync())?.status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync())?.status;
    }
    if (status !== 'granted') {
      return { available: true, granted: false, token: null, platform: plat, provider: 'expo' };
    }
    const projectId = easProjectId();
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined))?.data ?? null;
    return { available: true, granted: Boolean(token), token, platform: plat, provider: 'expo' };
  } catch {
    return { available: false, granted: false, token: null, platform: plat, provider: 'expo' };
  }
};
