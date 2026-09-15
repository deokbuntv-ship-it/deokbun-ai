import fs from 'node:fs';
import path from 'node:path';

import { SHARE_CARD } from '../shareCardCopy';

// 궁합 공유 카드 — the preview a messenger renders before anyone clicks.
// The link itself already worked; the card was what was missing. These tests lock the three
// decisions that make it safe to put in a group chat.
const REPO = path.resolve(__dirname, '../../../../..');
const CARD = fs.readFileSync(path.join(REPO, 'src/features/chat/report/ShareCardHead.tsx'), 'utf8')
  + fs.readFileSync(path.join(REPO, 'src/features/chat/report/shareCardCopy.ts'), 'utf8');
// Rules named in a comment ("appending ?ad= would pollute…") must not read as violations of
// themselves — strip comments before scanning for code.
const stripTs = (x: string) =>
  x
    .replace(new RegExp('/\\*[\\s\\S]*?\\*/', 'g'), '')
    .replace(new RegExp('//[^\\n]*', 'g'), '');
const SCREEN = fs.readFileSync(path.join(REPO, 'src/app/shared-report/[token].tsx'), 'utf8');
const RPC = fs.readFileSync(path.join(REPO, 'supabase/migrations/20260818000400_report_share_rpc_fix.sql'), 'utf8');
const SHARE_MIG = fs.readFileSync(path.join(REPO, 'supabase/migrations/20260818000300_report_shares.sql'), 'utf8');

describe('the card leaks nothing', () => {
  it('names the product but never the result', () => {
    const text = `${SHARE_CARD.title} ${SHARE_CARD.description}`;
    // 2026-09-06: the card now NAMES the product ("궁합 결과") and promises the conclusion is
    // readable — both true and both necessary to earn a tap. What must still never appear is the
    // RESULT ITSELF: a tier verdict, a score, or a judgment about the two people.
    for (const leak of ['잘 맞', '어울', '점수', '%', '상성']) {
      expect(text).not.toContain(leak);
    }
  });

  it('carries no personal information', () => {
    // A KakaoTalk card renders to the whole room, so a name or a date would be published to
    // everyone in the chat — including whoever is added later.
    expect(SHARE_CARD.description).not.toMatch(/\d{4}|님|씨|생년|이름/);
  });

  it('is identical for every share — nothing is interpolated', () => {
    expect(CARD).not.toMatch(/\$\{[^}]*(report|token|name|result|summary)/i);
    expect(typeof SHARE_CARD.title).toBe('string');
    expect(typeof SHARE_CARD.description).toBe('string');
  });

  it('is noindex — a share token is a capability URL, not a public page', () => {
    expect(CARD).toContain('noindex');
  });
});

describe('the card renders on every branch, including logged-out', () => {
  it('wraps the screen so it sits beside the <Redirect>', () => {
    // The crawler that builds a preview is never logged in, so a card emitted only after the
    // auth gate would never be seen.
    expect(SCREEN).toContain('<ShareCardHead />');
    expect(SCREEN).toContain('<SharedReportBody />');
    expect(SCREEN.indexOf('<ShareCardHead />')).toBeLessThan(SCREEN.indexOf('function SharedReportBody'));
  });
});

describe('the FULL report stays gated — §22 narrowed, not opened (2026-09-06)', () => {
  it('get_shared_report still refuses an anonymous reader, in the body AND at the grant', () => {
    expect(RPC).toContain('if auth.uid() is null then');
    expect(RPC).toMatch(/auth\.uid\(\) is null then\s*\n\s*return null;/);
    expect(RPC).toContain('revoke all on function public.get_shared_report(text) from anon');
    expect(RPC).toContain('grant execute on function public.get_shared_report(text) to authenticated');
  });

  it('the full read is never called while logged out — only the preview is', () => {
    // The behaviour that changed is WHICH function a logged-out visitor may call, not whether the
    // full report is protected. Two effects, two functions, two permissions.
    const fullEffect = SCREEN.slice(SCREEN.indexOf("if (authState.status !== 'authenticated'"));
    expect(fullEffect).toContain('loadSharedReport');
    expect(SCREEN).toContain("if (authState.status !== \"unauthenticated\") return;");
    expect(SCREEN).toContain('loadSharePreview');
  });

  it('the logged-out branch renders the preview instead of a login wall', () => {
    expect(SCREEN).toContain('<SharedReportPreview');
    expect(SCREEN).toContain("router.push('/login')");
  });

  it('the token survives the trip to login', () => {
    // Without this the visitor signs up and lands nowhere — the conversion the preview exists for
    // is exactly the one that breaks.
    expect(SCREEN).toContain('setPendingShareToken(token)');
  });

  it('the token is stored hashed, never raw', () => {
    expect(SHARE_MIG).toContain('token_hash');
    expect(SHARE_MIG).toContain('NEVER the raw token');
  });

  it('shares expire by default and can be revoked', () => {
    expect(SHARE_MIG).toContain("expires_at     timestamptz not null default (now() + interval '30 days')");
    expect(SHARE_MIG).toContain('revoked_at');
  });
});

describe('viral measurement uses the columns that already exist', () => {
  it('channel and open counters are on report_shares', () => {
    expect(SHARE_MIG).toContain('channel        text');
    expect(SHARE_MIG).toContain('opened_count');
    expect(SHARE_MIG).toContain('last_opened_at');
  });

  it('the card does not append an ad tracking code', () => {
    // `?ad=` is the advertising campaign space; organic share traffic in it would make CAC wrong.
    expect(stripTs(CARD)).not.toContain('?ad=');
    expect(stripTs(CARD)).not.toContain('utm_');
  });
});
