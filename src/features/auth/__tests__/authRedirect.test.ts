// Production OAuth redirect regression (google/kakao localhost bug). Pure — locks the
// production redirect construction + the authService wiring so it can't silently regress to
// window.location.origin / localhost.
import fs from 'fs';
import path from 'path';

import { getPublicBaseUrl } from '@/features/publicSite/publicUrl';

import { LOGIN_CALLBACK_PATH, resolveConfiguredWebRedirect } from '../services/authRedirect';

const PROD = 'https://www.deokbunai.com';

describe('OAuth redirect — production origin pinning (google/kakao)', () => {
  it('production base URL (web) → redirect uses https://www.deokbunai.com/login-callback', () => {
    expect(resolveConfiguredWebRedirect(PROD, true)).toBe(`${PROD}/login-callback`);
  });

  it('google AND kakao share this resolver → both pin to www.deokbunai.com', () => {
    // Both providers go through signInWithSupabaseOAuth, which uses this single resolver.
    const redirect = resolveConfiguredWebRedirect(PROD, true);
    expect(redirect).toBe('https://www.deokbunai.com/login-callback');
    expect(redirect).not.toMatch(/localhost|127\.0\.0\.1/);
  });

  it('native (isWeb=false) → null so the app scheme (makeRedirectUri) is used, never the https origin', () => {
    expect(resolveConfiguredWebRedirect(PROD, false)).toBeNull();
  });

  it('missing production origin (web, base=null) → null (caller uses the ACTUAL origin via makeRedirectUri, NOT a hardcoded localhost)', () => {
    // base is null only when EXPO_PUBLIC_PUBLIC_BASE_URL is unset = local dev. The resolver
    // never fabricates localhost; localhost can only come from makeRedirectUri = real origin.
    expect(resolveConfiguredWebRedirect(null, true)).toBeNull();
  });

  it('the OAuth callback return path is preserved (/login-callback)', () => {
    expect(LOGIN_CALLBACK_PATH).toBe('login-callback');
    expect(resolveConfiguredWebRedirect(PROD, true)?.endsWith('/login-callback')).toBe(true);
  });

  it('a configured base is used verbatim (no localhost substitution)', () => {
    expect(resolveConfiguredWebRedirect('https://preview.deokbunai.com', true)).toBe(
      'https://preview.deokbunai.com/login-callback',
    );
  });
});

describe('authService wiring — google/kakao redirect is production-aware (not raw makeRedirectUri)', () => {
  const src = fs.readFileSync(path.join(__dirname, '../services/authService.ts'), 'utf8');

  it('signInWithSupabaseOAuth resolves redirect via the production-aware resolver + getPublicBaseUrl', () => {
    expect(src).toMatch(/resolveConfiguredWebRedirect\(\s*getPublicBaseUrl\(\)/);
    expect(src).toMatch(/getPublicBaseUrl/);
  });

  it('does not hardcode a localhost URL/literal as a redirect fallback (prose comments aside)', () => {
    // No `http://localhost`, `localhost:PORT`, or a bare 'localhost'/'127.0.0.1' string literal.
    expect(src).not.toMatch(/https?:\/\/localhost/);
    expect(src).not.toMatch(/localhost:\d/);
    expect(src).not.toMatch(/['"`]localhost['"`]/);
    expect(src).not.toMatch(/127\.0\.0\.1/);
  });

  it('EXPO_PUBLIC_PUBLIC_BASE_URL flows into the redirect resolver (via getPublicBaseUrl)', () => {
    // getPublicBaseUrl reads exactly EXPO_PUBLIC_PUBLIC_BASE_URL.
    const pub = fs.readFileSync(
      path.join(__dirname, '../../publicSite/publicUrl.ts'),
      'utf8',
    );
    expect(pub).toMatch(/EXPO_PUBLIC_PUBLIC_BASE_URL/);
    // Sanity: the resolver is the same one publicSite already validates (https, no trailing /).
    expect(getPublicBaseUrl).toBeDefined();
  });
});
