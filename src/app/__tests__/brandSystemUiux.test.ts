// FINAL UI/UX + brand system — structural guards (§8/§10/§12/§15/§27/§35/§45). Source-scans the real tree so a
// regression (social provider recolored orange, admin CTA turned orange, top-up made to look purchasable,
// marketing consent conflated with a Kakao channel) fails CI.
import * as fs from 'fs';
import * as path from 'path';

import { REQUIRED_CONSENTS, OPTIONAL_CONSENTS, isTermsAccepted, TERMS_VERSION } from '@/features/onboarding/terms';

const SRC = path.resolve(__dirname, '../..'); // .../src
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

describe('Button — signature-orange brand is the default; navy primary preserved for admin (§8)', () => {
  const btn = read('components/Button/Button.tsx');
  it('default variant is brand (consumer CTAs get orange with no prop)', () => {
    expect(btn).toMatch(/variant\s*=\s*'brand'/);
  });
  it('brand fills with brandPrimary, primary still fills with navy primary', () => {
    expect(btn).toMatch(/brand:\s*theme\.brandPrimary/);
    expect(btn).toMatch(/primary:\s*theme\.primary/);
  });
  it('brand CTA uses the accessible dark brand text token', () => {
    expect(btn).toMatch(/brandPrimaryText/);
  });
  it('has a layout-preserving loading state', () => {
    expect(btn).toMatch(/loading/);
    expect(btn).toMatch(/ActivityIndicator/);
  });
});

describe('admin CTAs stay navy — every admin <Button> is explicit (guards the default flip)', () => {
  const files = (dir: string): string[] =>
    fs.readdirSync(path.join(SRC, dir), { withFileTypes: true }).flatMap((e) => {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) return files(rel);
      return /\.tsx$/.test(e.name) ? [rel] : [];
    });
  const adminFiles = [...files('app/admin'), ...files('features/admin')];
  it('no admin <Button> relies on the (now-orange) default variant', () => {
    // Line-window scan: a Button's `variant=` sits within a few lines of its `<Button` opener. This avoids the
    // regex pitfall where a `>` inside a JSX expression (e.g. `count > 0`) truncates a whole-element match.
    const offenders: string[] = [];
    for (const rel of adminFiles) {
      const lines = read(rel).split('\n');
      lines.forEach((ln, i) => {
        if (!/<Button\b/.test(ln)) return;
        // Admin buttons are self-closing; scan the real element (opener → first `/>`) so a multiline label or a
        // `>` inside an expression can't split the element or truncate the variant check.
        let end = i;
        while (end < lines.length && !/\/>/.test(lines[end])) end++;
        const block = lines.slice(i, end + 1).join('\n');
        if (!/variant=/.test(block)) offenders.push(`${rel}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe('social login keeps each provider signature; never orange (§10/§37)', () => {
  const sb = read('components/SocialButton/SocialButton.tsx');
  it('uses the official provider brand colors', () => {
    expect(sb).toMatch(/#FEE500/); // Kakao yellow
    expect(sb).toMatch(/#03C75A/); // Naver green
    expect(sb).toMatch(/#FFFFFF/); // Google white surface
  });
  it('does NOT map any provider to the app brand orange (code, not comments)', () => {
    expect(sb).not.toMatch(/theme\.brandPrimary/);
    expect(sb).not.toMatch(/bg:\s*'#F28C33'/i);
  });
  it('provider background colors are all distinct', () => {
    const bgs = [...sb.matchAll(/bg:\s*'(#[0-9A-Fa-f]{6})'/g)].map((m) => m[1].toUpperCase());
    expect(new Set(bgs).size).toBe(bgs.length);
    expect(bgs.length).toBeGreaterThanOrEqual(3);
  });
});

describe('login screen renders provider-distinct social buttons, not the orange Button (§11)', () => {
  const login = read('app/login.tsx');
  it('uses SocialButton for each enabled provider', () => {
    expect(login).toMatch(/SocialButton/);
    expect(login).toMatch(/provider="kakao"/);
    expect(login).toMatch(/provider="naver"/);
    expect(login).toMatch(/provider="google"/);
  });
  it('does not render generic <Button> as a provider CTA', () => {
    expect(login).not.toMatch(/<Button\b/);
  });
});

describe('nav selected state uses signature orange (§15)', () => {
  it('web tab focused color is brandPrimary', () => {
    expect(read('components/app-tabs.web.tsx')).toMatch(/isFocused\s*\?\s*theme\.brandPrimary/);
  });
  it('native selected label is brandPrimary', () => {
    expect(read('components/app-tabs.tsx')).toMatch(/brand\.brandPrimary/);
  });
});

describe('top-up is honestly unavailable — no purchasable control (§27)', () => {
  const topup = read('app/duk-topup.tsx');
  it('communicates 준비 중', () => {
    expect(topup).toMatch(/준비 중/);
  });
  it('renders no purchase Button and invokes no IAP purchase machinery', () => {
    expect(topup).not.toMatch(/<Button\b/);
    // The real risk is an actual purchase call, not the word "purchase" in a comment.
    expect(topup).not.toMatch(/requestPurchase|purchaseFlow\s*\(|nativeStore|react-native-iap/);
  });
});

describe('consent — required vs optional is honest; marketing is NOT a Kakao channel (§12/§35)', () => {
  it('required consents are the three required rows', () => {
    expect(REQUIRED_CONSENTS.map((c) => c.id).sort()).toEqual(['age14', 'privacy', 'service']);
    expect(REQUIRED_CONSENTS.every((c) => c.required)).toBe(true);
  });
  it('marketing is genuinely optional', () => {
    expect(OPTIONAL_CONSENTS).toHaveLength(1);
    expect(OPTIONAL_CONSENTS[0].id).toBe('marketing');
    expect(OPTIONAL_CONSENTS[0].required).toBe(false);
  });
  it('no consent row conflates marketing with adding a Kakao channel', () => {
    const all = [...REQUIRED_CONSENTS, ...OPTIONAL_CONSENTS].map((c) => c.label).join(' ');
    expect(all).not.toMatch(/채널|플러스친구|channel/i);
  });
  it('the terms screen never pre-checks the optional marketing row', () => {
    const terms = read('app/onboarding/terms.tsx');
    // marketing state seeds from the persisted opt-in (initialMarketing), never a hardcoded true.
    expect(terms).toMatch(/useState<boolean>\(initialMarketing\)/);
  });
  it('isTermsAccepted requires the current version', () => {
    expect(isTermsAccepted({ termsVersion: TERMS_VERSION, marketingOptIn: false })).toBe(true);
    expect(isTermsAccepted({ termsVersion: 'old', marketingOptIn: true })).toBe(false);
  });
});
