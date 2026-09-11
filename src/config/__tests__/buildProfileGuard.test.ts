// 스토어 빌드 설정 가드 — ⚠ **합성 반례만 쓴다.**
//
// 실제 `eas.json` 은 여기서 읽지 않는다. production 키가 아직 없어서, 읽으면 이 스위트가
// **키를 기다리는 내내 빨갛게 남는다.** 실제 파일 판정은 `scripts/release-preflight.mjs` 가
// 스토어 빌드 직전에 한다 — 거기서 실패하는 것이 정상이고, 그것이 이 가드의 목적이다.
import {
  checkBuildProfile,
  checkEasBuildProfiles,
  isPublishableKey,
  isSecretKey,
} from '../buildProfileGuard';

const PROD_URL = 'https://olvkpaldrwvtexxpoaag.supabase.co';
const STAGING_URL = 'https://aephpsiurgkvqcswyeie.supabase.co';
const PUBLISHABLE = 'sb_publishable_-Ti1LWxshsLR2uuwjYwyVA_FP77uHkI';
const SECRET = 'sb_secret_AAAAAAAAAAAAAAAAAAAAAA';

// role 만 담은 최소 JWT. 서명은 검사하지 않는다 — 형식과 role 만 본다.
const jwt = (role: string) => {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=+$/, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ role, ref: 'x' })}.sig`;
};
const ANON_JWT = jwt('anon');
const SERVICE_JWT = jwt('service_role');

describe('키 형식 판별', () => {
  it.each([
    ['sb_secret_ 접두사', SECRET, true],
    ['role=service_role JWT', SERVICE_JWT, true],
    ['대문자 섞인 sb_SECRET_', 'sb_SECRET_xyz', true],
  ])('⚠ 비밀 키로 본다 — %s', (_l, key, want) => {
    expect(isSecretKey(key)).toBe(want);
  });

  it.each([
    ['정상 publishable', PUBLISHABLE, true],
    ['role=anon JWT', ANON_JWT, true],
    ['비밀 키는 공개 키가 아니다', SECRET, false],
    ['service_role JWT 는 공개 키가 아니다', SERVICE_JWT, false],
    ['빈 문자열', '', false],
    ['공백만', '   ', false],
    ['형식 불명 문자열', 'hello', false],
  ])('공개 키 판별 — %s', (_l, key, want) => {
    expect(isPublishableKey(key)).toBe(want);
  });
});

describe('⚠ 걸려야 하는 것', () => {
  it.each([
    ['production · 키 없음', 'production', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL }, /키.*없음|PUBLISHABLE_KEY 없음/],
    ['production · 빈 문자열 키', 'production', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '' }, /없음/],
    ['production · 공백만', 'production', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '   ' }, /없음/],
    ['production · 비밀 키', 'production', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: SECRET }, /비밀 키/],
    ['production · service_role JWT', 'production', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: SERVICE_JWT }, /비밀 키/],
    ['⚠ production 프로필에 staging URL', 'production', { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }, /staging 를 가리킴/],
    ['staging 프로필에 production URL', 'staging', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }, /production 를 가리킴/],
    ['development 프로필에 production URL', 'development', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }, /production 를 가리킴/],
    ['URL 없음', 'staging', { EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }, /URL 없음/],
    ['URL 형식 아님', 'staging', { EXPO_PUBLIC_SUPABASE_URL: 'not-a-url', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }, /형식이 아님/],
    // ⚠ internal 은 ref 를 안 가리지만 **비밀 키는 거부**한다.
    ['internal 프로필의 비밀 키', 'internal', { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: SECRET }, /비밀 키/],
    ['development 프로필의 비밀 키', 'development', { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: SECRET }, /비밀 키/],
  ])('%s', (_label, profile, env, re) => {
    const v = checkBuildProfile(profile, env);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reasons.join(' | ')).toMatch(re);
  });
});

describe('통과해야 하는 것', () => {
  it.each([
    ['production · publishable', 'production', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }],
    ['production · anon JWT', 'production', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ANON_JWT }],
    ['staging', 'staging', { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }],
    ['development', 'development', { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }],
    // ⚠ internal 은 **두 ref 모두** 허용한다. 배너가 화면에서 host 를 말하기 때문이다.
    ['internal → staging', 'internal', { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }],
    ['internal → production (배너가 알린다)', 'internal', { EXPO_PUBLIC_SUPABASE_URL: PROD_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE }],
    // staging/development 는 키가 없어도 막지 않는다 — 규칙이 ref 만 요구한다.
    ['staging · 키 없음 (규칙이 요구하지 않음)', 'staging', { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL }],
  ])('%s', (_label, profile, env) => {
    const v = checkBuildProfile(profile, env);
    if (!v.ok) throw new Error(`거절됨: ${v.reasons.join(' | ')}`);
    expect(v.ok).toBe(true);
  });
});

describe('eas.json 전체 훑기', () => {
  it('프로필마다 판정을 하나씩 낸다', () => {
    const r = checkEasBuildProfiles({
      build: {
        staging: { env: { EXPO_PUBLIC_SUPABASE_URL: STAGING_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE } },
        production: { env: { EXPO_PUBLIC_SUPABASE_URL: PROD_URL } },
      },
    });
    expect(Object.keys(r).sort()).toEqual(['production', 'staging']);
    expect(r.staging.ok).toBe(true);
    expect(r.production.ok).toBe(false);
  });

  it('build 가 비어 있으면 빈 판정', () => {
    expect(checkEasBuildProfiles({})).toEqual({});
  });
});
