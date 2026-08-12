// Naver login — pure-logic coverage (directive §22). No live Naver/Supabase calls;
// only deterministic units are tested (provider resolution, error normalization,
// identity-collision policy) plus a static secret-exposure scan of the
// client-facing auth source. Matches the repo convention of testing pure logic.
import fs from 'fs';
import path from 'path';

import type { AppErrorCode } from '@/features/analysis';

import {
  authOutcomeMessage,
  authOutcomeToAppErrorCode,
  authReasonToOutcome,
  isSilentOutcome,
  type AuthFailureReason,
  type AuthOutcomeCode,
} from '../errors/authErrors';
import { resolveSupabaseProvider } from '../services/authProviders';
import { resolveIdentityCollision } from '../services/authIdentity';
import { resolveOAuthReturn } from '../services/oauthReturn';
import {
  buildNaverAuthorizeUrl,
  parseNaverCallback,
  statesMatch,
} from '../naver/naverOAuth';
import { normalizeNaverProfile } from '../naver/naverProfile';
import { decideNaverLink } from '../naver/naverIdentity';

describe('resolveSupabaseProvider (directive §6 — provider abstraction)', () => {
  it('keeps kakao/google on their built-in Supabase providers (unchanged)', () => {
    expect(resolveSupabaseProvider('kakao')).toEqual({
      supported: true,
      supabaseProvider: 'kakao',
    });
    expect(resolveSupabaseProvider('google')).toEqual({
      supported: true,
      supabaseProvider: 'google',
    });
  });

  it('does NOT treat naver as a Supabase provider (it uses the edge bridge)', () => {
    // PATH A is dead — Supabase custom OAuth2 cannot map Naver's nested userinfo.
    expect(resolveSupabaseProvider('naver')).toEqual({ supported: false });
  });

  it('reports apple (declared but not enabled) as unsupported', () => {
    expect(resolveSupabaseProvider('apple')).toEqual({ supported: false });
  });
});

describe('buildNaverAuthorizeUrl (PATH B — public client_id, no secret)', () => {
  const url = buildNaverAuthorizeUrl({
    clientId: 'CID',
    redirectUri: 'https://www.deokbunai.com/login-callback',
    state: 'st8/te+value',
  });
  it('targets Naver authorize with response_type=code + client_id', () => {
    expect(url.startsWith('https://nid.naver.com/oauth2.0/authorize?')).toBe(true);
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=CID');
  });
  it('percent-encodes redirect_uri and state (no raw special chars)', () => {
    expect(url).toContain(
      'redirect_uri=https%3A%2F%2Fwww.deokbunai.com%2Flogin-callback',
    );
    expect(url).toContain('state=st8%2Fte%2Bvalue');
  });
  it('never contains a secret field', () => {
    expect(url).not.toMatch(/client_secret/i);
  });
});

describe('parseNaverCallback (code/state/deny extraction, runtime-safe)', () => {
  it('extracts code + state on success', () => {
    expect(
      parseNaverCallback('https://x/login-callback?code=abc&state=xyz'),
    ).toEqual({ ok: true, code: 'abc', state: 'xyz' });
  });
  it('reports DENIED when the user declines', () => {
    const r = parseNaverCallback('https://x/login-callback?error=access_denied&state=xyz');
    expect(r).toMatchObject({ ok: false, reason: 'DENIED', error: 'access_denied' });
  });
  it('reports MISSING_CODE when code is absent', () => {
    expect(parseNaverCallback('https://x/login-callback?state=xyz')).toEqual({
      ok: false,
      reason: 'MISSING_CODE',
    });
  });
  it('reports MISSING_STATE when state is absent', () => {
    expect(parseNaverCallback('https://x/login-callback?code=abc')).toEqual({
      ok: false,
      reason: 'MISSING_STATE',
    });
  });
});

describe('statesMatch (CSRF state round-trip)', () => {
  it('matches identical non-empty states', () => {
    expect(statesMatch('a1b2c3', 'a1b2c3')).toBe(true);
  });
  it('rejects mismatches, length diffs, and empty/absent', () => {
    expect(statesMatch('a1b2c3', 'a1b2c4')).toBe(false);
    expect(statesMatch('abc', 'abcd')).toBe(false);
    expect(statesMatch('', '')).toBe(false);
    expect(statesMatch(null, 'x')).toBe(false);
    expect(statesMatch('x', undefined)).toBe(false);
  });
});

describe('normalizeNaverProfile (nested response.id; email optional)', () => {
  it('extracts the nested id/email/name on a success response', () => {
    const r = normalizeNaverProfile({
      resultcode: '00',
      message: 'success',
      response: { id: '32742776', email: 'a@naver.com', name: '오픈' },
    });
    expect(r).toEqual({
      ok: true,
      profile: { naverId: '32742776', email: 'a@naver.com', name: '오픈' },
    });
  });
  it('tolerates a missing email (user declined) — email null, still ok', () => {
    const r = normalizeNaverProfile({ resultcode: '00', response: { id: '99' } });
    expect(r).toEqual({ ok: true, profile: { naverId: '99', email: null, name: null } });
  });
  it('fails on a non-success resultcode', () => {
    expect(
      normalizeNaverProfile({ resultcode: '024', message: 'auth fail', response: {} }),
    ).toEqual({ ok: false, reason: 'BAD_RESPONSE' });
  });
  it('fails when the nested id is missing', () => {
    expect(normalizeNaverProfile({ resultcode: '00', response: { email: 'a@b.c' } })).toEqual({
      ok: false,
      reason: 'MISSING_ID',
    });
  });
  it('fails on malformed / non-object input', () => {
    expect(normalizeNaverProfile(null)).toEqual({ ok: false, reason: 'BAD_RESPONSE' });
    expect(normalizeNaverProfile('nope')).toEqual({ ok: false, reason: 'BAD_RESPONSE' });
    expect(normalizeNaverProfile({ resultcode: '00' })).toEqual({
      ok: false,
      reason: 'BAD_RESPONSE',
    });
  });
});

describe('auth error normalization (directive §20 — reuse existing contract)', () => {
  const reasons: AuthFailureReason[] = [
    'CANCELLED',
    'NOT_SUPPORTED',
    'OAUTH_URL_MISSING',
    'SESSION_MISSING',
    'REQUEST_FAILED',
  ];
  const outcomes: AuthOutcomeCode[] = [
    'AUTH_CANCELLED',
    'AUTH_CONFIG_REQUIRED',
    'AUTH_PROVIDER_ERROR',
    'AUTH_SESSION_FAILED',
    'AUTH_ACCOUNT_CONFLICT',
    'AUTH_UNSUPPORTED',
  ];

  it('maps every low-level reason to a normalized outcome', () => {
    expect(authReasonToOutcome('CANCELLED')).toBe('AUTH_CANCELLED');
    expect(authReasonToOutcome('NOT_SUPPORTED')).toBe('AUTH_UNSUPPORTED');
    expect(authReasonToOutcome('OAUTH_URL_MISSING')).toBe('AUTH_CONFIG_REQUIRED');
    expect(authReasonToOutcome('SESSION_MISSING')).toBe('AUTH_SESSION_FAILED');
    expect(authReasonToOutcome('REQUEST_FAILED')).toBe('AUTH_PROVIDER_ERROR');
    // exhaustiveness: every reason resolves to a known outcome
    reasons.forEach((r) => expect(outcomes).toContain(authReasonToOutcome(r)));
  });

  it('gives a friendly Korean message with no raw/technical leakage', () => {
    outcomes.forEach((code) => {
      const msg = authOutcomeMessage(code);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
      expect(msg).not.toMatch(/undefined|null|Error|http|token|secret/i);
    });
  });

  it('projects outcomes onto existing AppErrorCode values (no new vocabulary)', () => {
    const allowed: AppErrorCode[] = ['FORBIDDEN', 'AUTH_REQUIRED', 'NETWORK_ERROR', 'UNKNOWN'];
    outcomes.forEach((code) => {
      expect(allowed).toContain(authOutcomeToAppErrorCode(code));
    });
    expect(authOutcomeToAppErrorCode('AUTH_UNSUPPORTED')).toBe('FORBIDDEN');
    expect(authOutcomeToAppErrorCode('AUTH_ACCOUNT_CONFLICT')).toBe('FORBIDDEN');
  });

  it('treats only a cancelled login as silent (soft notice, not an error)', () => {
    expect(isSilentOutcome('AUTH_CANCELLED')).toBe(true);
    outcomes
      .filter((c) => c !== 'AUTH_CANCELLED')
      .forEach((c) => expect(isSilentOutcome(c)).toBe(false));
  });
});

describe('resolveIdentityCollision (directive §10 — never auto-merge by email)', () => {
  it('proceeds for a returning (already-linked) Naver identity', () => {
    expect(
      resolveIdentityCollision({
        naverEmail: 'a@example.com',
        existingProvidersForEmail: ['google'],
        naverAlreadyLinked: true,
      }),
    ).toEqual({ action: 'proceed', reason: 'ALREADY_LINKED' });
  });

  it('proceeds keyed on the Naver id when Naver provides no email', () => {
    expect(
      resolveIdentityCollision({
        naverEmail: null,
        existingProvidersForEmail: [],
        naverAlreadyLinked: false,
      }),
    ).toEqual({ action: 'proceed_no_email' });
  });

  it('proceeds as a brand-new user when no account owns the email', () => {
    expect(
      resolveIdentityCollision({
        naverEmail: 'new@example.com',
        existingProvidersForEmail: [],
        naverAlreadyLinked: false,
      }),
    ).toEqual({ action: 'proceed', reason: 'NEW_USER' });
  });

  it('proceeds when the matching account is itself a Naver identity', () => {
    expect(
      resolveIdentityCollision({
        naverEmail: 'same@example.com',
        existingProvidersForEmail: ['custom:naver'],
        naverAlreadyLinked: false,
      }),
    ).toEqual({ action: 'proceed', reason: 'ALREADY_LINKED' });
  });

  it('requires explicit linking (no auto-merge) when email matches a google account', () => {
    expect(
      resolveIdentityCollision({
        naverEmail: 'dup@example.com',
        existingProvidersForEmail: ['google'],
        naverAlreadyLinked: false,
      }),
    ).toEqual({ action: 'link_required', conflictingProviders: ['google'] });
  });

  it('lists every conflicting non-naver provider for the collision', () => {
    const decision = resolveIdentityCollision({
      naverEmail: 'dup@example.com',
      existingProvidersForEmail: ['google', 'email', 'custom:naver'],
      naverAlreadyLinked: false,
    });
    expect(decision.action).toBe('link_required');
    if (decision.action === 'link_required') {
      expect(decision.conflictingProviders).toEqual(['google', 'email']);
    }
  });
});

describe('decideNaverLink (edge account-takeover guard, directive §10)', () => {
  it('creates a fresh user when no account owns the email', () => {
    expect(decideNaverLink(null, 'nav-1')).toEqual({ action: 'create' });
  });
  it('proceeds for the SAME returning Naver identity', () => {
    expect(
      decideNaverLink({ id: 'u1', appMetadataNaverId: 'nav-1' }, 'nav-1'),
    ).toEqual({ action: 'proceed', userId: 'u1' });
  });
  it('BLOCKS (conflict) when the email belongs to a non-naver account — no takeover', () => {
    expect(
      decideNaverLink({ id: 'u2', appMetadataNaverId: null }, 'nav-1'),
    ).toEqual({ action: 'conflict' });
  });
  it('BLOCKS (conflict) when the email is a different Naver identity', () => {
    expect(
      decideNaverLink({ id: 'u3', appMetadataNaverId: 'nav-OTHER' }, 'nav-1'),
    ).toEqual({ action: 'conflict' });
  });
});

describe('resolveOAuthReturn (shared web callback navigation, provider-neutral)', () => {
  it('sends an authenticated return to home', () => {
    expect(resolveOAuthReturn('authenticated')).toBe('/');
  });
  it('sends an unauthenticated return (cancel/error/failed session) back to login', () => {
    expect(resolveOAuthReturn('unauthenticated')).toBe('/login');
  });
  it('stays put while auth state is still loading (popup closes first)', () => {
    expect(resolveOAuthReturn('loading')).toBeNull();
  });
});

describe('secret-exposure scan (directive §10/§21 — no client-side secrets)', () => {
  // All client-bundle auth source (incl. the new Naver bridge client). These MAY
  // discuss secrets in comments, so the scan targets concrete EXPOSURE patterns
  // (env reads / edge-only APIs / hardcoded tokens), never prose.
  const clientFacing = [
    '../services/authProviders.ts',
    '../services/authService.ts',
    '../services/authIdentity.ts',
    '../services/oauthReturn.ts',
    '../errors/authErrors.ts',
    '../naver/naverConfig.ts',
    '../naver/naverOAuth.ts',
    '../naver/naverProfile.ts',
    '../naver/naverIdentity.ts',
    '../naver/naverAuthService.ts',
  ];

  it('never reads or embeds a secret / service_role in client auth source', () => {
    clientFacing.forEach((rel) => {
      const src = fs.readFileSync(path.join(__dirname, rel), 'utf8');
      // A secret must never live under the client-exposed EXPO_PUBLIC_ prefix.
      expect(src).not.toMatch(/EXPO_PUBLIC_[A-Z0-9_]*SECRET/);
      // The client must never READ a *_SECRET / *_SERVICE_ROLE env value,
      expect(src).not.toMatch(/process\.env\.[A-Z0-9_]*SECRET/);
      expect(src).not.toMatch(/process\.env\.[A-Z0-9_]*SERVICE_ROLE/);
      // use the edge-only Deno.env API or the service_role key,
      expect(src).not.toMatch(/Deno\.env/);
      expect(src).not.toMatch(/SERVICE_ROLE_KEY/);
      // or hardcode a secret-looking token.
      expect(src).not.toMatch(/sk-[A-Za-z0-9]{12,}/);
      expect(src).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/);
    });
  });
});
