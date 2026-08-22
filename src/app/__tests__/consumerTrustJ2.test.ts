// Sprint J2 §18 — structural guards for the consumer trust layer. Source-scans the real app tree so a future
// edit that drops the AI disclosure, resurrects the mail-detail orphan, or removes a double-submit lock fails CI.
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../..'); // .../src
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(SRC, rel));

describe('AI disclosure renders on every AI-output surface (§2)', () => {
  const SURFACES = [
    'app/chat.tsx',
    'app/compatibility-chat.tsx',
    'app/today.tsx',
    'app/monthly.tsx',
    'features/chat/report/PremiumReportView.tsx',
  ];
  it.each(SURFACES)('%s imports and renders <AiDisclosure/>', (rel) => {
    const src = read(rel);
    expect(src).toMatch(/from '@\/components\/AiDisclosure'/);
    expect(src).toMatch(/<AiDisclosure/);
  });
});

describe('mail-detail orphan is gone (§8)', () => {
  it('the route file no longer exists', () => {
    expect(exists('app/mail-detail.tsx')).toBe(false);
  });
  it('is not registered in the root layout', () => {
    expect(read('app/_layout.tsx')).not.toMatch(/mail-detail/);
  });
  it('nothing navigates to /mail-detail', () => {
    // scan the app router tree for any push/href to the removed route
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) { if (e.name !== '__tests__') walk(full, out); }
        else if (/\.tsx?$/.test(e.name)) out.push(full);
      }
      return out;
    };
    const offenders = walk(path.join(SRC, 'app'))
      .filter((f) => /['"`]\/mail-detail['"`]/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('AI notice surface is reachable (§16)', () => {
  it('the route exists and MY links to it', () => {
    expect(exists('app/ai-notice.tsx')).toBe(true);
    expect(read('app/(tabs)/my.tsx')).toMatch(/\/ai-notice/);
  });
});

describe('duplicate-submit locks exist (§15)', () => {
  it('chat has a synchronous send re-entrancy lock', () => {
    expect(read('app/chat.tsx')).toMatch(/isSendingRef/);
  });
  it('compatibility-chat has a synchronous send re-entrancy lock', () => {
    expect(read('app/compatibility-chat.tsx')).toMatch(/sendingRef/);
  });
  it('candle button is disabled unless eligible (or error, to allow retry — §J9)', () => {
    // Fix #2: a transient candle error is retryable, so the button is enabled for 'eligible' OR 'error' only.
    expect(read('app/wallet.tsx')).toMatch(/disabled=\{candle !== 'eligible' && candle !== 'error'\}/);
  });
});

describe('wallet & top-up have a visible back control (§12 dead-end fix)', () => {
  it.each(['app/wallet.tsx', 'app/duk-topup.tsx'])('%s passes showBack to AppHeader', (rel) => {
    expect(read(rel)).toMatch(/showBack/);
  });
});
