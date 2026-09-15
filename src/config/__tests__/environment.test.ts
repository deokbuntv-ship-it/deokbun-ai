// Sprint J7 §7.2 — environment separation: infer env from the project ref, and FAIL FAST when a declared
// APP_ENV contradicts the URL's ref (a staging build pointing at production, or vice-versa).
import {
  resolveEnvironment, assertEnvironmentConsistency, projectRefFromUrl, environmentLabel,
} from '@/config/environment';

const PROD = 'https://olvkpaldrwvtexxpoaag.supabase.co';
const STAGING = 'https://aephpsiurgkvqcswyeie.supabase.co';

describe('projectRefFromUrl', () => {
  it('extracts the ref', () => {
    expect(projectRefFromUrl(PROD)).toBe('olvkpaldrwvtexxpoaag');
    expect(projectRefFromUrl(STAGING)).toBe('aephpsiurgkvqcswyeie');
    expect(projectRefFromUrl('not-a-url')).toBeNull();
    expect(projectRefFromUrl(null)).toBeNull();
  });
});

describe('resolveEnvironment', () => {
  it('infers production/staging from the ref when APP_ENV is unset', () => {
    expect(resolveEnvironment({ url: PROD }).env).toBe('production');
    expect(resolveEnvironment({ url: STAGING }).env).toBe('staging');
  });
  it('an unknown ref infers development', () => {
    expect(resolveEnvironment({ url: 'https://xyz123.supabase.co' }).env).toBe('development');
  });
  it('a declared APP_ENV that agrees with the ref is honored', () => {
    const r = resolveEnvironment({ url: STAGING, declared: 'staging' });
    expect(r.env).toBe('staging');
    expect(r.isProduction).toBe(false);
  });
});

describe('assertEnvironmentConsistency (fail-fast)', () => {
  it('throws when a staging build targets the production ref', () => {
    expect(() => assertEnvironmentConsistency(resolveEnvironment({ url: PROD, declared: 'staging' }))).toThrow(/mismatch/i);
  });
  it('throws when a production build targets the staging ref', () => {
    expect(() => assertEnvironmentConsistency(resolveEnvironment({ url: STAGING, declared: 'production' }))).toThrow(/mismatch/i);
  });
  it('does not throw when declared matches the ref', () => {
    expect(() => assertEnvironmentConsistency(resolveEnvironment({ url: PROD, declared: 'production' }))).not.toThrow();
  });
  it('allows a DEVELOPMENT build on the staging backend (dev + staging share it)', () => {
    expect(() => assertEnvironmentConsistency(resolveEnvironment({ url: STAGING, declared: 'development' }))).not.toThrow();
  });
  it('throws when a development build targets the production ref (crosses the prod boundary)', () => {
    expect(() => assertEnvironmentConsistency(resolveEnvironment({ url: PROD, declared: 'development' }))).toThrow(/boundary|mismatch/i);
  });
  it('does not throw when APP_ENV is unset (inference only)', () => {
    expect(() => assertEnvironmentConsistency(resolveEnvironment({ url: PROD }))).not.toThrow();
  });
  it('does not throw on an empty URL (left to the supabase config)', () => {
    expect(() => assertEnvironmentConsistency(resolveEnvironment({ url: '' }))).not.toThrow();
  });
});

describe('environmentLabel', () => {
  it('maps to operator labels', () => {
    expect(environmentLabel('production')).toBe('운영');
    expect(environmentLabel('staging')).toBe('스테이징');
    expect(environmentLabel('development')).toBe('개발');
  });
});
