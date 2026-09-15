// Sprint J7 §7.10 — every notification deep-link target must resolve to a REAL current route file (no dead
// links). Runtime-checks resolveDeepLinkPath for all targets + verifies the key consumer routes exist on disk.
import * as fs from 'fs';
import * as path from 'path';
import { DEEP_LINK_TARGETS, resolveDeepLinkPath } from '@/features/retention/deepLinks';

const APP = path.resolve(__dirname, '../../../app'); // .../src/app

// Map a resolved route path to candidate Expo Router files; true if any exists.
function routeExists(p: string): boolean {
  const clean = p.split('?')[0].replace(/^\//, '');
  if (clean === '') return fs.existsSync(path.join(APP, '(tabs)/index.tsx'));
  const parts = clean.split('/');
  const candidates = [
    `${clean}.tsx`,
    `(tabs)/${clean}.tsx`,
  ];
  if (parts.length === 2) {
    candidates.push(`${parts[0]}/[id].tsx`, `${parts[0]}/[${parts[0]}Id].tsx`, `${parts[0]}/[token].tsx`);
  }
  return candidates.some((c) => fs.existsSync(path.join(APP, c)));
}

describe('deep-link targets resolve to real routes (§7.10)', () => {
  it.each(DEEP_LINK_TARGETS as readonly string[])('target %s → an existing route', (target) => {
    const p = resolveDeepLinkPath(target as never, 'sample-id');
    expect(p.startsWith('/')).toBe(true);
    expect(routeExists(p)).toBe(true);
  });

  it('an unknown target falls back to a safe existing route (never a dead link)', () => {
    const p = resolveDeepLinkPath('NOT_A_TARGET' as never);
    expect(routeExists(p)).toBe(true);
  });
});

describe('key consumer + policy routes exist (§7.10)', () => {
  const ROUTES = [
    '(tabs)/index.tsx', '(tabs)/compatibility.tsx', '(tabs)/inbox.tsx', '(tabs)/my.tsx',
    'chat.tsx', 'compatibility-chat.tsx', 'today.tsx', 'monthly.tsx',
    'wallet.tsx', 'duk-topup.tsx', 'notifications.tsx', 'life-events.tsx',
    'privacy-policy.tsx', 'terms-of-service.tsx', 'ai-notice.tsx',
    'login.tsx', 'login-callback.tsx', 'report/[id].tsx', 'shared-report/[token].tsx',
  ];
  it.each(ROUTES)('%s exists', (rel) => {
    expect(fs.existsSync(path.join(APP, rel))).toBe(true);
  });

  it('the removed mail-detail orphan stays removed', () => {
    expect(fs.existsSync(path.join(APP, 'mail-detail.tsx'))).toBe(false);
  });
});
