// Stable per-install device id for push registration (Sprint J8). Persisted in AsyncStorage so push_devices'
// unique(user_id, device_id) stays stable across launches (multi-device model). Not a hardware identifier — a
// random UUID scoped to this install; cleared on app data reset. Never logged.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const KEY = 'deokbun.deviceId.v1';

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing && existing.length > 0) return existing;
    const id = Crypto.randomUUID();
    await AsyncStorage.setItem(KEY, id);
    return id;
  } catch {
    // Storage unavailable → an ephemeral id (registration still works this session; re-registers next launch).
    return Crypto.randomUUID();
  }
}
