// Batch3 §2.2 — the concrete Expo push acquirer is FAIL-CLOSED: with expo-notifications absent (the case until a
// dev/EAS build installs it — and the case in this jest env), it reports unavailable and never throws. This is
// the PUSH_PROVIDER_LIVE = EXTERNAL_BLOCKED guarantee: no token, no fabricated grant.
// The node jest env can't load the RN native module; a minimal Platform mock lets us test the pure fail-closed
// orchestration (expo-notifications remains genuinely absent → the acquirer degrades to unavailable).
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: {} } } }));
jest.mock('@/features/retention/services/pushDeviceService', () => ({
  pushDeviceService: { register: jest.fn(async () => {}), disableAllForCurrentUser: jest.fn(async () => {}) },
}));

import { expoTokenAcquirer } from '@/features/retention/push/expoTokenAcquirer';
import { registerForPush } from '@/features/retention/push/pushRegistration';

describe('expoTokenAcquirer (fail-closed until native install)', () => {
  it('reports unavailable when expo-notifications is not installed, without throwing', async () => {
    const acquired = await expoTokenAcquirer();
    expect(acquired.available).toBe(false);
    expect(acquired.token).toBeNull();
    expect(acquired.granted).toBe(false);
  });

  it('registerForPush with the Expo acquirer degrades to unavailable (no device registered)', async () => {
    const { pushDeviceService } = require('@/features/retention/services/pushDeviceService');
    const r = await registerForPush('device-1', expoTokenAcquirer);
    expect(r.status).toBe('unavailable');
    expect(pushDeviceService.register).not.toHaveBeenCalled();
  });
});
