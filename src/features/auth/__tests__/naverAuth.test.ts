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
import {
  NAVER_CUSTOM_PROVIDER_DEFAULT,
  naverCustomProvider,
  resolveSupabaseProvider,
} from '../services/authProviders';
import { resolveIdentityCollision } from '../services/authIdentity';
import { resolveOAuthReturn } from '../services/oauthReturn';

const ENV_KEY = 'EXPO_PUBLIC_NAVER_SUPABASE_PROVIDER';

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

  it('routes naver through the Supabase Custom OAuth provider (custom:naver)', () => {
    expect(resolveSupabaseProvider('naver')).toEqual({
      supported: true,
      supabaseProvider: 'custom:naver',
    });
  });

  it('reports apple (declared but not enabled) as unsupported', () => {
    expect(resolveSupabaseProvider('apple')).toEqual({ supported: false });
  });
});

describe('naverCustomProvider (env override, custom: prefix enforced)', () => {
  const original = process.env[ENV_KEY];
  afterEach(() => {
    if (original === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = original;
  });

  it('defaults to custom:naver when unset', () => {
    delete process.env[ENV_KEY];
    expect(naverCustomProvider()).toBe(NAVER_CUSTOM_PROVIDER_DEFAULT);
    expect(naverCustomProvider()).toBe('custom:naver');
  });

  it('honours a valid custom: override', () => {
    process.env[ENV_KEY] = 'custom:naver_kr';
    expect(naverCustomProvider()).toBe('custom:naver_kr');
  });

  it('forces the custom: prefix so it can never point at a built-in provider', () => {
    process.env[ENV_KEY] = 'kakao'; // an attacker-ish value w/o the prefix
    expect(naverCustomProvider()).toBe('custom:kakao');
    expect(naverCustomProvider().startsWith('custom:')).toBe(true);
  });

  it('falls back to the default on blank/whitespace override', () => {
    process.env[ENV_KEY] = '   ';
    expect(naverCustomProvider()).toBe('custom:naver');
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

describe('secret-exposure scan (directive §21 — no client-side secrets)', () => {
  const clientFacing = [
    '../services/authProviders.ts',
    '../services/authService.ts',
    '../services/authIdentity.ts',
    '../errors/authErrors.ts',
  ];

  it('never references a client secret / service_role in client auth source', () => {
    clientFacing.forEach((rel) => {
      const src = fs.readFileSync(path.join(__dirname, rel), 'utf8');
      expect(src).not.toMatch(/CLIENT_SECRET/);
      expect(src).not.toMatch(/client_secret/);
      expect(src).not.toMatch(/service_role/i);
      expect(src).not.toMatch(/SERVICE_ROLE/);
    });
  });
});
