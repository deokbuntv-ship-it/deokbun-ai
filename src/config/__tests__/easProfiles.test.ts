// Sprint J8 §8.2 — staging build HARD GUARD: the eas.json dev/staging profiles must pin the STAGING Supabase URL
// (never production), production pins the production URL, and each profile declares a consistent APP_ENV. Combined
// with assertEnvironmentConsistency (runtime), this makes a cross-targeted build impossible to ship silently.
import * as fs from 'fs';
import * as path from 'path';

const eas = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../eas.json'), 'utf8'));
const STAGING_REF = 'aephpsiurgkvqcswyeie';
const PROD_REF = 'olvkpaldrwvtexxpoaag';

describe('eas.json build profiles (hard guard)', () => {
  it('development targets the STAGING backend (never production)', () => {
    const env = eas.build.development.env;
    expect(env.EXPO_PUBLIC_SUPABASE_URL).toContain(STAGING_REF);
    expect(env.EXPO_PUBLIC_SUPABASE_URL).not.toContain(PROD_REF);
    expect(env.EXPO_PUBLIC_APP_ENV).toBe('development');
  });
  it('staging targets the STAGING backend (never production)', () => {
    const env = eas.build.staging.env;
    expect(env.EXPO_PUBLIC_SUPABASE_URL).toContain(STAGING_REF);
    expect(env.EXPO_PUBLIC_SUPABASE_URL).not.toContain(PROD_REF);
    expect(env.EXPO_PUBLIC_APP_ENV).toBe('staging');
  });
  it('production targets the PRODUCTION backend', () => {
    const env = eas.build.production.env;
    expect(env.EXPO_PUBLIC_SUPABASE_URL).toContain(PROD_REF);
    expect(env.EXPO_PUBLIC_APP_ENV).toBe('production');
  });
  it('only the production profile uses store distribution', () => {
    expect(eas.build.development.distribution).toBe('internal');
    expect(eas.build.staging.distribution).toBe('internal');
    expect(eas.build.production.distribution).toBe('store');
  });
});
