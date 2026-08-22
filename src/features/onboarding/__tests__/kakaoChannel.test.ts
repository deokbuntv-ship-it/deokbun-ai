// Kakao channel UX state contract (§3) — honest availability seam, no fabricated CONNECTED state.
describe('kakaoChannel — not configured (current reality)', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_KAKAO_CHANNEL_ID;
  });

  it('reports NOT configured when no channel id is set', () => {
    const { kakaoChannelConfigured } = require('@/features/onboarding/kakaoChannel');
    expect(kakaoChannelConfigured()).toBe(false);
  });

  it('initial state is CHANNEL_NOT_CONNECTED (never a faked connected/available)', () => {
    const { initialKakaoChannelState } = require('@/features/onboarding/kakaoChannel');
    expect(initialKakaoChannelState()).toBe('CHANNEL_NOT_CONNECTED');
  });

  it('add URL is null when not configured (add action is 준비 중, not a fake link)', () => {
    const { kakaoChannelAddUrl } = require('@/features/onboarding/kakaoChannel');
    expect(kakaoChannelAddUrl()).toBeNull();
  });
});

describe('kakaoChannel — the future seam (when configured)', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_KAKAO_CHANNEL_ID = '_deokbun_test';
  });
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_KAKAO_CHANNEL_ID;
  });

  it('becomes CHANNEL_CONNECTION_AVAILABLE and yields the public add URL', () => {
    const { kakaoChannelConfigured, initialKakaoChannelState, kakaoChannelAddUrl } = require('@/features/onboarding/kakaoChannel');
    expect(kakaoChannelConfigured()).toBe(true);
    expect(initialKakaoChannelState()).toBe('CHANNEL_CONNECTION_AVAILABLE');
    expect(kakaoChannelAddUrl()).toBe('https://pf.kakao.com/_deokbun_test');
  });

  it('availability alone never reaches CHANNEL_CONNECTED (that needs a verified persisted record)', () => {
    const { initialKakaoChannelState } = require('@/features/onboarding/kakaoChannel');
    expect(initialKakaoChannelState()).not.toBe('CHANNEL_CONNECTED');
  });
});
