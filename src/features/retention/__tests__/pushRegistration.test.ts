// Sprint J3 §7 — client push-registration orchestration (provider-independent, DI). Verifies registration only
// persists a device when permission is granted AND a token exists; degrades cleanly otherwise; and logout
// disables devices. The native token acquirer is injected (real one is EXTERNAL_BLOCKED).
import { registerForPush, unregisterOnLogout, unavailableTokenAcquirer } from '@/features/retention/push/pushRegistration';
import { pushDeviceService } from '@/features/retention/services/pushDeviceService';

jest.mock('@/features/retention/services/pushDeviceService', () => ({
  pushDeviceService: {
    register: jest.fn(async () => {}),
    disableAllForCurrentUser: jest.fn(async () => {}),
  },
}));

const mocked = pushDeviceService as jest.Mocked<typeof pushDeviceService>;

beforeEach(() => jest.clearAllMocks());

describe('registerForPush', () => {
  it('registers the device when permission granted + token present', async () => {
    const acquire = async () => ({ available: true, granted: true, token: 'ExponentPushToken[abc]', platform: 'ios' as const, provider: 'expo' as const });
    const r = await registerForPush('device-1', acquire);
    expect(r.status).toBe('registered');
    expect(mocked.register).toHaveBeenCalledWith({
      deviceId: 'device-1', platform: 'ios', provider: 'expo', pushToken: 'ExponentPushToken[abc]',
    });
  });
  it('permission denied → does not register', async () => {
    const acquire = async () => ({ available: true, granted: false, token: null, platform: 'ios' as const, provider: 'expo' as const });
    expect((await registerForPush('device-1', acquire)).status).toBe('permission_denied');
    expect(mocked.register).not.toHaveBeenCalled();
  });
  it('granted but no token → no_token, does not register', async () => {
    const acquire = async () => ({ available: true, granted: true, token: null, platform: 'android' as const, provider: 'fcm' as const });
    expect((await registerForPush('device-1', acquire)).status).toBe('no_token');
    expect(mocked.register).not.toHaveBeenCalled();
  });
  it('acquirer throws → unavailable, never throws', async () => {
    const acquire = async () => { throw new Error('native crash'); };
    expect((await registerForPush('device-1', acquire)).status).toBe('unavailable');
  });
  it('default acquirer (no native provider) → unavailable (EXTERNAL_BLOCKED)', async () => {
    expect((await registerForPush('device-1', unavailableTokenAcquirer)).status).toBe('unavailable');
    expect(mocked.register).not.toHaveBeenCalled();
  });
  it('empty deviceId → unavailable', async () => {
    expect((await registerForPush('')).status).toBe('unavailable');
  });
});

describe('unregisterOnLogout', () => {
  it('disables all devices for the current user', async () => {
    await unregisterOnLogout();
    expect(mocked.disableAllForCurrentUser).toHaveBeenCalledTimes(1);
  });
});
