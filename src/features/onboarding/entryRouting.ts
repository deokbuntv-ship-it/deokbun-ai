// Centralized ENTRY ROUTING (§7). One pure place that answers "where is this user allowed to be right now?"
// for every path, given the onboarding state. The gate (deep-link protection) and the resolver route both
// consume this, so screens never re-derive routing rules ad hoc. Fail-closed by DEFAULT: any path not on the
// explicit public/onboarding lists is treated as a gated product surface.
import { isSafeReturnTo } from '@/features/consultation/pendingConsultationIntent';
import type { OnboardingState } from '@/features/onboarding/onboardingState';

export const LOGIN_PATH = '/login';
export const ONBOARDING_RESOLVER_PATH = '/onboarding';
export const ONBOARDING_TERMS_PATH = '/onboarding/terms';
export const ONBOARDING_BIRTH_PATH = '/onboarding/birth';
export const HOME_PATH = '/';

// Public prefixes the consumer onboarding gate must NEVER block: auth screens (self-managed), the public
// content/famous surface (no auth), admin (own authorization), and the shared-report recipient screen
// (self-manages auth + onboarding + token stash so it can preserve the token BEFORE any redirect).
const PUBLIC_PREFIXES: readonly string[] = [
  '/login',
  '/login-callback',
  '/content',
  '/famous',
  '/admin',
  '/shared-report',
  '/_sitemap', // expo-router internal
];

export type PathClass = 'public' | 'onboarding' | 'gated';

// Normalize to a bare pathname (strip query/hash/trailing slash) so classification is stable.
export function normalizePath(path: string | null | undefined): string {
  if (typeof path !== 'string' || path.length === 0) return '/';
  let p = path.split('?')[0].split('#')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p.length === 0 ? '/' : p;
}

export function classifyConsumerPath(rawPath: string | null | undefined): PathClass {
  const path = normalizePath(rawPath);
  if (path === ONBOARDING_RESOLVER_PATH || path === ONBOARDING_TERMS_PATH || path === ONBOARDING_BIRTH_PATH) {
    return 'onboarding';
  }
  for (const prefix of PUBLIC_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return 'public';
  }
  return 'gated'; // fail-closed default — an unknown route is protected
}

// The onboarding step a given state must be on (null when nothing specific is required).
function neededStepPath(state: OnboardingState): string | null {
  if (state === 'NEEDS_TERMS') return ONBOARDING_TERMS_PATH;
  if (state === 'NEEDS_BIRTH_PROFILE') return ONBOARDING_BIRTH_PATH;
  return null;
}

export type GateDecision =
  | { kind: 'render' } // allow the screen
  | { kind: 'loading' } // fail-closed hold while state resolves
  | { kind: 'redirect'; to: string };

const render: GateDecision = { kind: 'render' };
const loading: GateDecision = { kind: 'loading' };
const redirect = (to: string): GateDecision => ({ kind: 'redirect', to });

// The single gate rule. Deterministic in (state, path); no side effects (the component stashes returnTo).
export function resolveGateDecision(state: OnboardingState, rawPath: string | null | undefined): GateDecision {
  const path = normalizePath(rawPath);
  const cls = classifyConsumerPath(path);

  if (cls === 'public') return render;

  if (cls === 'onboarding') {
    if (state === 'ANONYMOUS') return redirect(LOGIN_PATH);
    if (state === 'AUTHENTICATED_LOADING' || state === 'ERROR') return loading;
    // The resolver route is always allowed to render — it decides/forwards (and consumes continuation).
    if (path === ONBOARDING_RESOLVER_PATH) return render;
    // A specific step renders only when it is the step the state requires; otherwise bounce to the resolver
    // so the user can never skip ahead or linger on a finished step.
    const needed = neededStepPath(state);
    if (needed && path === needed) return render;
    return redirect(ONBOARDING_RESOLVER_PATH);
  }

  // cls === 'gated' — a personalized product surface.
  switch (state) {
    case 'ANONYMOUS':
      return redirect(LOGIN_PATH);
    case 'AUTHENTICATED_LOADING':
    case 'ERROR':
      return loading;
    case 'NEEDS_TERMS':
      return redirect(ONBOARDING_TERMS_PATH);
    case 'NEEDS_BIRTH_PROFILE':
      return redirect(ONBOARDING_BIRTH_PATH);
    case 'COMPLETE':
      return render;
  }
}

// Where a freshly-onboarded user goes. Continuation priority (§49): a pending shared report wins, then a
// validated internal returnTo, then Home. PURE given the (already one-shot-read) continuation inputs, so the
// priority order is unit-testable without touching storage.
export type PostOnboardingDestination =
  | { kind: 'shared-report'; token: string }
  | { kind: 'path'; to: string };

export function pickPostOnboardingDestination(input: {
  shareToken: string | null;
  returnTo: string | null;
}): PostOnboardingDestination {
  if (input.shareToken) return { kind: 'shared-report', token: input.shareToken };
  if (isSafeReturnTo(input.returnTo)) return { kind: 'path', to: input.returnTo };
  return { kind: 'path', to: HOME_PATH };
}

// The gate's IMPERATIVE contract, made pure + IDEMPOTENT (§5/§18). Combines the gate decision with an
// already-at-target check: a redirect is emitted ONLY when the current path differs from the target, so the
// gate never re-issues a navigation to the route it is already on (the classic navigation update-loop).
// `showOverlay` covers the (always-mounted) navigator while loading or while a redirect is in flight — the
// navigator is NEVER unmounted (that unmount/remount during navigation is what caused the ContextNavigator
// "Maximum update depth"). A stable resolved state at its correct route yields { null, false } → zero work.
export type GateNavigation = { redirectTo: string | null; showOverlay: boolean };

export function resolveGateNavigation(state: OnboardingState, rawPath: string | null | undefined): GateNavigation {
  const decision = resolveGateDecision(state, rawPath);
  if (decision.kind === 'render') return { redirectTo: null, showOverlay: false };
  if (decision.kind === 'loading') return { redirectTo: null, showOverlay: true };
  const target = normalizePath(rawPath) === decision.to ? null : decision.to;
  return { redirectTo: target, showOverlay: target !== null };
}
