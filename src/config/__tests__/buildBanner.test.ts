// 빌드 배너 — ⚠ **합성 반례.** 스토어 빌드에 새면 안 되는 것이라 양방향으로 잠근다.
//
// 이 프로젝트의 규율: 검사·판정 로직을 만들면 "보여야 하는 것" 과 "숨어야 하는 것" 을
// 같은 무게로 박는다. 여기서 숨김이 깨지면 스토어 심사에 내부 정보가 실려 나간다.
import { buildBannerInfo, buildBannerLine } from '../buildBanner';

const STAGING = 'https://aephpsiurgkvqcswyeie.supabase.co';
const PROD = 'https://olvkpaldrwvtexxpoaag.supabase.co';

describe('빌드 배너 — 보여야 하는 것', () => {
  it('내부 프로필이면 프로필 이름과 host 를 준다', () => {
    expect(buildBannerInfo({ profile: 'internal', url: STAGING, declared: 'staging' }))
      .toEqual({ profile: 'internal', host: 'aephpsiurgkvqcswyeie.supabase.co' });
  });

  it('development·staging 프로필도 내부 빌드다 — 보여 준다', () => {
    for (const p of ['development', 'staging', 'preview', 'qa']) {
      expect(buildBannerInfo({ profile: p, url: STAGING, declared: 'staging' })?.profile).toBe(p);
    }
  });

  // ⚠ 내부 빌드가 production 을 보는 조합은 **가장 위험한 조합**이다. 숨기면 안 된다 —
  //   그것을 알리는 것이 이 배너의 존재 이유다(H5: "조용히 production 을 봤다").
  it('내부 프로필이 production 을 보면 오히려 반드시 보여 준다', () => {
    expect(buildBannerInfo({ profile: 'internal', url: PROD, declared: 'production' }))
      .toEqual({ profile: 'internal', host: 'olvkpaldrwvtexxpoaag.supabase.co' });
  });

  it('한 줄 문구가 프로필과 host 를 둘 다 담는다', () => {
    const line = buildBannerLine(buildBannerInfo({ profile: 'internal', url: STAGING, declared: 'staging' }));
    expect(line).toContain('internal');
    expect(line).toContain('aephpsiurgkvqcswyeie.supabase.co');
  });
});

describe('⚠ 빌드 배너 — 숨어야 하는 것 (스토어 빌드)', () => {
  it('production 프로필이면 숨긴다', () => {
    expect(buildBannerInfo({ profile: 'production', url: PROD, declared: 'production' })).toBeNull();
  });

  it('대소문자가 달라도 production 은 숨긴다', () => {
    for (const p of ['Production', 'PRODUCTION', ' production ']) {
      expect(buildBannerInfo({ profile: p, url: PROD, declared: 'production' })).toBeNull();
    }
  });

  it('프로필 값이 없으면 숨긴다 — 프로필을 안 넘긴 옛 빌드', () => {
    expect(buildBannerInfo({ profile: undefined, url: STAGING, declared: 'staging' })).toBeNull();
    expect(buildBannerInfo({ profile: null, url: STAGING, declared: 'staging' })).toBeNull();
    expect(buildBannerInfo({ profile: '', url: STAGING, declared: 'staging' })).toBeNull();
    expect(buildBannerInfo({ profile: '   ', url: STAGING, declared: 'staging' })).toBeNull();
  });

  it('Supabase URL 이 없으면 숨긴다 — 보여 줄 host 가 없다', () => {
    expect(buildBannerInfo({ profile: 'internal', url: '', declared: 'staging' })).toBeNull();
  });

  it('null 을 넘기면 한 줄도 null 이다', () => {
    expect(buildBannerLine(null)).toBeNull();
  });
});
