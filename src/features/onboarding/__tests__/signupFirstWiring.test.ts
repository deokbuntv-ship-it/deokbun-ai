// Source-level regression lock for the signup-first wiring (this repo has no RN render harness, so critical
// route wiring is locked at the source, mirroring naverAuth.test). Guards the invariants that make the flow
// safe: the gate is mounted, auth entry always routes through the resolver, and the shared-report recipient
// enforces onboarding before showing a report.
import fs from 'fs';
import path from 'path';

const read = (rel: string) => fs.readFileSync(path.join(__dirname, rel), 'utf8');

describe('root layout mounts the centralized gate', () => {
  const layout = read('../../../app/_layout.tsx');
  it('wraps the navigator in OnboardingProvider + OnboardingGate', () => {
    expect(layout).toMatch(/<OnboardingProvider>/);
    expect(layout).toMatch(/<OnboardingGate>/);
  });
  it('registers the onboarding step routes', () => {
    expect(layout).toContain('onboarding/index');
    expect(layout).toContain('onboarding/terms');
    expect(layout).toContain('onboarding/birth');
  });
});

describe('auth entry always routes through the resolver (never straight to Home/report)', () => {
  const login = read('../../../app/login.tsx');
  const callback = read('../../../app/login-callback.tsx');

  it('login success replaces to /onboarding', () => {
    expect(login).toMatch(/result\.success/);
    expect(login).toMatch(/router\.replace\('\/onboarding'\)/);
    // It must NOT consume the share token itself anymore (the resolver is the single consumer).
    expect(login).not.toContain('consumePendingShareToken');
  });

  it('callback forwards authenticated landings to /onboarding, else /login', () => {
    expect(callback).toMatch(/router\.replace\('\/onboarding'\)/);
    expect(callback).toMatch(/router\.replace\('\/login'\)/);
  });
});

describe('shared-report recipient enforces onboarding (FINAL OVERRIDE §47)', () => {
  const shared = read('../../../app/shared-report/[token].tsx');
  it('redirects an authenticated-but-not-onboarded viewer to /onboarding', () => {
    expect(shared).toMatch(/isOnboarded/);
    expect(shared).toMatch(/href="\/onboarding"/);
  });
  it('only fetches the report once fully onboarded', () => {
    expect(shared).toMatch(/!isOnboarded\(onboardingState\)\)\s*return/);
  });
});
