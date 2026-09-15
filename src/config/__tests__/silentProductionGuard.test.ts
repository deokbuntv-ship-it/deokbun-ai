// KNOWN_RISKS H5 — a local dev run must not silently attach to production.
//
// The pre-existing `assertEnvironmentConsistency` only fires when APP_ENV is DECLARED. A bare `.env`
// declares nothing, so the resolver inferred 'production' from the URL and everything worked quietly.
// These tests lock the new guard AND the file layout that makes the default safe.
import fs from 'node:fs';
import path from 'node:path';

import {
  assertNotSilentProduction,
  describeEnvironment,
  resolveEnvironment,
} from '@/config/environment';

const PROD = 'https://olvkpaldrwvtexxpoaag.supabase.co';
const STAGING = 'https://aephpsiurgkvqcswyeie.supabase.co';
const REPO = path.resolve(__dirname, '../../..');

describe('assertNotSilentProduction', () => {
  it('throws when a dev run resolves to production without declaring it', () => {
    expect(() => assertNotSilentProduction(resolveEnvironment({ url: PROD }), true)).toThrow(/PRODUCTION/);
  });

  it('names the escape hatch in the message — a guard you cannot get past is a wall', () => {
    let msg = '';
    try {
      assertNotSilentProduction(resolveEnvironment({ url: PROD }), true);
    } catch (e) {
      msg = (e as Error).message;
    }
    expect(msg).toContain('EXPO_PUBLIC_APP_ENV=production');
    expect(msg).toContain('.env.prod');
  });

  it('allows production when it is declared out loud', () => {
    expect(() =>
      assertNotSilentProduction(resolveEnvironment({ url: PROD, declared: 'production' }), true),
    ).not.toThrow();
  });

  it('never blocks a built artifact — Vercel/EAS deploys must not break', () => {
    expect(() => assertNotSilentProduction(resolveEnvironment({ url: PROD }), false)).not.toThrow();
  });

  it('is silent for staging and for an unknown ref', () => {
    expect(() => assertNotSilentProduction(resolveEnvironment({ url: STAGING }), true)).not.toThrow();
    expect(() => assertNotSilentProduction(resolveEnvironment({ url: 'https://whatever.supabase.co' }), true)).not.toThrow();
    expect(() => assertNotSilentProduction(resolveEnvironment({ url: '' }), true)).not.toThrow();
  });
});

describe('describeEnvironment', () => {
  it('says which backend and how it was decided', () => {
    expect(describeEnvironment(resolveEnvironment({ url: STAGING, declared: 'staging' })))
      .toBe('[env] 스테이징 (staging, declared) · ref=aephpsiurgkvqcswyeie');
    expect(describeEnvironment(resolveEnvironment({ url: PROD }))).toContain('inferred');
  });

  it('never leaks a key', () => {
    const line = describeEnvironment(resolveEnvironment({ url: STAGING }));
    expect(line).not.toMatch(/sb_publishable|eyJ|secret|key=/i);
  });
});

// ── the file layout is half the fix; lock it too ────────────────────────────────────────────
describe('env file layout', () => {
  const read = (f: string) => (fs.existsSync(path.join(REPO, f)) ? fs.readFileSync(path.join(REPO, f), 'utf8') : null);
  const PROD_REF = 'olvkpaldrwvtexxpoaag';

  it('.env defaults to staging and declares it', () => {
    const env = read('.env');
    expect(env).not.toBeNull();
    expect(env).toContain('EXPO_PUBLIC_APP_ENV=staging');
    expect(env).not.toContain(PROD_REF);
  });

  it('the production values are preserved, not deleted', () => {
    const prod = read('.env.prod');
    expect(prod).not.toBeNull();
    expect(prod).toContain(PROD_REF);
    expect(prod).toContain('EXPO_PUBLIC_APP_ENV=production');
  });

  // Expo auto-loads `.env.production` during `expo export` (NODE_ENV=production). Naming the
  // backup that would put a local web build straight back onto production — the exact trap
  // this whole change exists to remove.
  it('the production file is NOT named something Expo auto-loads', () => {
    for (const trap of ['.env.production', '.env.production.local']) {
      expect(fs.existsSync(path.join(REPO, trap))).toBe(false);
    }
  });

  it('both files stay gitignored', () => {
    const gi = read('.gitignore') ?? '';
    expect(gi).toMatch(/^\.env$/m);
    expect(gi).toMatch(/^\.env\.\*$/m);
    expect(gi).toMatch(/^!\.env\.example$/m);
  });
});

describe('the supabase config actually calls the guard', () => {
  const src = fs.readFileSync(path.join(REPO, 'src/services/supabase/config.ts'), 'utf8');
  it('runs both assertions before returning a config', () => {
    expect(src).toContain('assertEnvironmentConsistency');
    expect(src).toContain('assertNotSilentProduction(resolved)');
    expect(src.indexOf('assertNotSilentProduction(resolved)')).toBeLessThan(src.indexOf('return { url, publishableKey }'));
  });
  it('announces the target exactly once per process', () => {
    expect(src).toContain('let announced = false;');
    expect(src).toContain('describeEnvironment(resolved)');
  });
});
