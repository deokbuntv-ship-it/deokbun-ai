// PGRST303 closure — is a Supabase session usable for an authenticated DB request NOW? Pure + tested.
import fs from 'fs';
import path from 'path';

import type { Session } from '@supabase/supabase-js';

import { isSessionUsable, SESSION_EXPIRY_SKEW_MS } from '../sessionValidity';

const NOW = 1_760_000_000_000; // fixed epoch ms
const session = (over: Partial<Session> = {}): Session =>
  ({
    access_token: 'valid.jwt.token',
    refresh_token: 'r',
    expires_in: 3600,
    expires_at: Math.floor(NOW / 1000) + 3600, // 1h in the future
    token_type: 'bearer',
    user: { id: 'u1' },
    ...over,
  }) as unknown as Session;

describe('isSessionUsable', () => {
  it('true for a present, non-expired session with a user + access token', () => {
    expect(isSessionUsable(session(), NOW)).toBe(true);
  });

  it('false when the session/user/token is absent', () => {
    expect(isSessionUsable(null, NOW)).toBe(false);
    expect(isSessionUsable(undefined, NOW)).toBe(false);
    expect(isSessionUsable(session({ user: null as unknown as Session['user'] }), NOW)).toBe(false);
    expect(isSessionUsable(session({ access_token: '' }), NOW)).toBe(false);
  });

  it('false when the access token is expired (the PGRST303 race)', () => {
    expect(isSessionUsable(session({ expires_at: Math.floor(NOW / 1000) - 10 }), NOW)).toBe(false);
  });

  it('false within the expiry skew window (avoids expire-in-flight)', () => {
    const almost = Math.floor((NOW + SESSION_EXPIRY_SKEW_MS - 1000) / 1000);
    expect(isSessionUsable(session({ expires_at: almost }), NOW)).toBe(false);
  });

  it('false when expires_at is missing / non-finite (fail-closed — cannot verify freshness)', () => {
    expect(isSessionUsable(session({ expires_at: undefined }), NOW)).toBe(false);
    expect(isSessionUsable(session({ expires_at: NaN }), NOW)).toBe(false);
  });

  it('true again once the token is refreshed comfortably into the future', () => {
    expect(isSessionUsable(session({ expires_at: Math.floor(NOW / 1000) + 600 }), NOW)).toBe(true);
  });
});

describe('AuthContext profile bootstrap — PGRST303 race closure (source-level lock)', () => {
  const src = fs.readFileSync(path.join(__dirname, '../context/AuthContext.tsx'), 'utf8');

  it('gates the profile bootstrap on a usable session (isSessionUsable) — no doomed request', () => {
    expect(src).toContain('isSessionUsable');
    expect(src).toContain('bootstrap_deferred'); // defers instead of firing on a stale token
  });
  it('re-runs the bootstrap on a fresh auth event (sessionSignal in the effect deps)', () => {
    expect(src).toContain('sessionSignal');
    // the bootstrap effect must depend on sessionSignal so TOKEN_REFRESHED re-attempts
    expect(src).toMatch(/authState\.user\?\.id,\s*sessionSignal\s*\]/);
  });
  it('does NOT resort to setTimeout / arbitrary retry to work around the race', () => {
    expect(src).not.toMatch(/setTimeout\s*\(/);
  });
});
