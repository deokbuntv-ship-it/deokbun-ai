// DESIGN_FREEZE_FINAL — acceptance guards.
//
// The freeze's own acceptance list, expressed as source contracts so the frozen consumer design cannot
// silently drift back. These are structural scans (the jest runner is node-only, no RN render), chosen
// over snapshots so they assert the RULES rather than pinning markup.
//
// Device visual QA (the human "does it feel warm and 아기자기하지만 저렴하지 않게" pass, and the 360dp
// no-horizontal-scroll sweep on real hardware) is NOT covered here and is owner-required.
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../..'); // .../src
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

// Comments explain the rules (and legitimately quote the values the rules are about), so every scan
// below runs against CODE only.
const JSX_COMMENT = /\{\/\*[\s\S]*?\*\/\}/g;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const LINE_COMMENT = /^\s*\/\/.*$/gm;
const TRAILING_COMMENT = /([^:])\/\/.*$/gm;

const code = (rel: string) =>
  read(rel)
    .replace(JSX_COMMENT, '')
    .replace(BLOCK_COMMENT, '')
    .replace(LINE_COMMENT, '')
    .replace(TRAILING_COMMENT, '$1');

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(path.join(SRC, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) {
      if (e.name === '__tests__') continue;
      walk(rel, out);
    } else if (/\.tsx?$/.test(e.name)) {
      out.push(rel);
    }
  }
  return out;
}

// The consumer surface: the router tree minus the admin console, plus the shared components.
const CONSUMER_FILES = [...walk('app'), ...walk('components')].filter((f) => !f.startsWith('app/admin'));

describe('the retired Signature Orange is gone from the consumer tree', () => {
  const RETIRED = /#F28C33|#DE7A24|#FCEBDA|#FFB781/i;
  it.each(CONSUMER_FILES)('%s has no retired orange literal', (rel) => {
    const src = read(rel)
      .split('\n')
      // the token file names the retired hex in a comment so the retirement is documented
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join('\n');
    expect(src).not.toMatch(RETIRED);
  });
});

describe('no Duk amount is hardcoded in a component (freeze ACCEPTANCE ①)', () => {
  // "앱 어디에도 5·12·50·10·1 이 컴포넌트에 하드코딩되어 있지 않다" — every amount must resolve through
  // the canonical economy source, so a policy change never leaves a stale number on a screen.
  const LITERAL_DUK = /['"`][^'"`]*\b\d+덕/;
  it.each(CONSUMER_FILES)('%s renders 덕 amounts through the economy source, not a literal', (rel) => {
    expect(code(rel)).not.toMatch(LITERAL_DUK);
  });

  it('the canonical prices still live in exactly one place', () => {
    const pricing = read('features/duk/pricing.ts');
    expect(pricing).toMatch(/general:\s*5/);
    expect(pricing).toMatch(/compatibility:\s*12/);
    expect(pricing).toMatch(/premium_report:\s*50/);
  });

  it('no consumer screen redefines a price locally', () => {
    const offenders = CONSUMER_FILES.filter((rel) => /const\s+(DUK_|PRICE|COST)[A-Z_]*\s*[:=]/.test(read(rel)));
    expect(offenders).toEqual([]);
  });
});

describe('pastel surfaces never carry text.muted (freeze §01)', () => {
  // muted measures 4.30–4.46:1 on the cream family — below AA. Any file that paints a pastel must also
  // reach for that pastel's on* token; and no file may pair a pastel with textMuted in the same style.
  const PASTELS = ['surfaceButter', 'surfaceSage', 'surfaceBlush', 'surfaceLavender'] as const;
  const ON = { surfaceButter: 'onButter', surfaceSage: 'onSage', surfaceBlush: 'onBlush', surfaceLavender: 'onLavender' } as const;

  const SURFACE_PRIMITIVES = ['components/Card/Card.tsx', 'components/Button/Button.tsx', 'components/Chip/Chip.tsx'];
  const pastelFiles = CONSUMER_FILES.filter(
    (rel) => !SURFACE_PRIMITIVES.includes(rel) && PASTELS.some((t) => code(rel).includes(`theme.${t}`)),
  );

  it('there are pastel surfaces to check', () => {
    expect(pastelFiles.length).toBeGreaterThan(0);
  });

  it.each(pastelFiles)('%s pairs each pastel it paints with that pastel on* text token', (rel) => {
    const src = code(rel);
    PASTELS.forEach((t) => {
      if (!src.includes(`theme.${t}`)) return;
      expect(src).toMatch(new RegExp(`theme\\.${ON[t]}|colorToken="${ON[t]}"`));
    });
  });

  it('no style object sets a pastel background and a muted foreground together', () => {
    const offenders = CONSUMER_FILES.filter((rel) => {
      const src = code(rel);
      return PASTELS.some((t) =>
        new RegExp(`backgroundColor:\\s*theme\\.${t}[^}]{0,120}colorToken="textMuted"`, 's').test(src),
      );
    });
    expect(offenders).toEqual([]);
  });
});

describe('the remaining-question count is derived from the SERVER, never counted client-side', () => {
  const meter = code('components/SessionMeter/SessionMeter.tsx');
  const chat = code('app/chat.tsx');

  it('SessionMeter derives its copy from sessionTurnCopy over the server session', () => {
    expect(meter).toMatch(/sessionTurnCopy\(/);
    // No arithmetic of its own — the only remaining-count maths lives in the shared pure presenter.
    expect(meter).not.toMatch(/successfulTurnCount\s*[+\-]/);
  });

  it('chat holds the raw server SessionStatus and re-reads it, rather than decrementing', () => {
    expect(chat).toMatch(/useState<SessionStatus \| null>\(null\)/);
    expect(chat).toMatch(/setSession\(await getSessionStatus\('general'\)\)/);
    expect(chat).not.toMatch(/setSession\((?:\(s\)|prev)\s*=>/); // no local mutation of the count
  });

  it('exhaustion is a server fact (count reached the limit) AND TTL-bounded, not a send tally', () => {
    // Derived via the shared TTL-honoring helper (chat no longer tallies locally). The count>=limit rule
    // lives in isSessionExhausted, which also requires the session to be non-expired (honors the 24h TTL).
    expect(chat).toMatch(/isSessionExhausted\(session, Date\.now\(\)\)/);
    expect(read('features/duk/dukClientContract.ts')).toMatch(/successfulTurnCount >= session\.turnLimit/);
  });

  it('a failed turn is explicitly reported as not consuming a question', () => {
    expect(chat).toMatch(/질문 횟수는 그대로예요/);
  });
});

describe('an exhausted session cannot be resumed for a silent new charge (session-boundary consent gate)', () => {
  // A follow-up chip (onSelectFollowUp) shares the exact same send path as the composer, but — unlike
  // the composer — is not unmounted by the exhausted card. Without an explicit guard early in that shared
  // path, tapping a chip on the final turn's answer would silently reserve + charge a new session with no
  // confirmation. The guard must appear BEFORE the network/service call, not merely exist somewhere.
  const chat = code('app/chat.tsx');
  const compat = code('app/compatibility-chat.tsx');

  it('chat: submitQuestion (composer + follow-up chips) bails out on showExhausted before sending', () => {
    const fn = chat.slice(chat.indexOf('const submitQuestion ='), chat.indexOf('const handleSend ='));
    expect(fn).toMatch(/if \(showExhausted\)\s*\{\s*return;/);
    expect(fn.indexOf('if (showExhausted)')).toBeLessThan(fn.indexOf('executeConversationBoundSend'));
  });

  it('chat: the follow-up chip handler has no separate send path around the guard', () => {
    const fn = chat.slice(chat.indexOf('const handleSelectFollowUp ='), chat.indexOf('const handleRetry ='));
    expect(fn).toMatch(/submitQuestion\(question\)/);
  });

  it('compatibility-chat: send (composer + follow-up chips) bails out on compatExhausted before sending', () => {
    const body = compat.slice(compat.indexOf('const send = async'));
    expect(body).toMatch(/if \(compatExhausted\) return;/);
    expect(body.indexOf('if (compatExhausted) return;')).toBeLessThan(body.indexOf('serviceRef.current.sendMessage'));
  });

  it('compatibility-chat: the follow-up chip handler has no separate send path around the guard', () => {
    expect(compat).toMatch(/onSelectFollowUp=\{\(q\) => \{[\s\S]{0,400}void send\(q\);/);
  });

  it('both exhausted cards show the exact Duk cost before any confirmation tap', () => {
    expect(chat).toMatch(/새 상담 시작하기\s+🍀 \$\{dukLabel\(DUK_PRICES\.general\)\}/);
    expect(compat).toMatch(/새 궁합 상담 시작하기\s+🍀 \$\{dukLabel\(DUK_PRICES\.compatibility\)\}/);
  });
});

describe('덕 부족 is an in-flow block, never an Alert (freeze C07)', () => {
  it.each(['app/chat.tsx', 'app/compatibility-chat.tsx', 'app/(tabs)/consult.tsx', 'app/(tabs)/compatibility.tsx'])(
    '%s renders <InsufficientDuk/> and calls no Alert',
    (rel) => {
      const src = read(rel);
      expect(src).toMatch(/<InsufficientDuk/);
      expect(src).not.toMatch(/Alert\.alert/);
    },
  );

  it('the block always offers BOTH next steps (candle and top-up)', () => {
    const c07 = read('components/InsufficientDuk/InsufficientDuk.tsx');
    expect(c07).toMatch(/오늘의 초 확인하기/);
    expect(c07).toMatch(/덕 충전하기/);
    // The primary action is the view's decision, not a second opinion computed here.
    expect(c07).toMatch(/view\.primaryAction === 'CANDLE'/);
  });
});

describe('the bottom bar is hidden in exactly three places', () => {
  // Owner decision (DESIGN_FREEZE_FINAL C02 amendment): 몰입형 상담 채팅 · 온보딩 · 미완료 출생정보 입력.
  // Everything else — including the 궁합 결과 and 덕 충전 — keeps the bar so a long read is never a dead end.
  it.each([
    'app/wallet.tsx',
    'app/duk-topup.tsx',
    'app/subjects.tsx',
    'app/compatibility-chat.tsx',
    'app/notifications.tsx',
    'app/notification-settings.tsx',
    'app/life-events.tsx',
    'app/subject-history.tsx',
    'app/subject-manse.tsx',
  ])('%s keeps the bottom bar', (rel) => {
    expect(read(rel)).toMatch(/<DetailBottomNav/);
  });

  it.each([
    'app/chat.tsx',
    'app/login.tsx',
    'app/onboarding/terms.tsx',
    'app/onboarding/channel.tsx',
    'app/onboarding/birth.tsx',
    // 3rd exception: a critical form. DetailBottomNav navigates with router.replace, which would
    // silently discard unsaved birth input — so the form keeps the user's attention instead.
    'app/birth-info.tsx',
  ])('%s hides the bottom bar', (rel) => {
    expect(read(rel)).not.toMatch(/<DetailBottomNav/);
  });

  it('the canonical rule is documented where the bar itself is defined', () => {
    const nav = read('components/DetailBottomNav.tsx');
    expect(nav).toMatch(/Exactly THREE exceptions/);
    expect(nav).toMatch(/birth-info/);
  });

  it('the bell follows the same exceptions (login / onboarding / chat / the notification centre itself)', () => {
    ['app/login.tsx', 'app/onboarding/terms.tsx', 'app/onboarding/channel.tsx', 'app/onboarding/birth.tsx', 'app/chat.tsx'].forEach(
      (rel) => expect(read(rel)).not.toMatch(/showBell/),
    );
  });
});

describe('the 5-tab bar cannot wrap or reorder (freeze C02)', () => {
  it.each(['components/DetailBottomNav.tsx', 'components/app-tabs.web.tsx'])('%s keeps every label on one line', (rel) => {
    const src = read(rel);
    expect(src).toMatch(/numberOfLines=\{1\}/);
    expect(src).toMatch(/CONSUMER_NAV_ITEMS/); // order/labels come from the single source
    expect(src).toMatch(/letterSpacing: -0\.24/); // the sanctioned way to fit 운세우편함 at 360dp
  });

  it('the inactive label uses the nav token, which is held at muted strength on purpose', () => {
    expect(read('components/DetailBottomNav.tsx')).toMatch(/theme\.textNavInactive/);
    expect(read('components/app-tabs.web.tsx')).toMatch(/theme\.textNavInactive/);
  });

  it('tab labels are capped against OS font scaling so they cannot be clipped', () => {
    expect(read('components/DetailBottomNav.tsx')).toMatch(/maxFontSizeMultiplier=\{1\.2\}/);
    expect(read('components/app-tabs.web.tsx')).toMatch(/maxFontSizeMultiplier=\{1\.2\}/);
  });
});

describe('inactive states never use opacity over information (freeze §Acceptance)', () => {
  it('the top-up packs keep full contrast; only the control reads as inactive', () => {
    const topup = code('app/duk-topup.tsx');
    expect(topup).not.toMatch(/opacity:/);
    expect(topup).toMatch(/준비 중/);
  });
  it('Button expresses disabled with the disabled tokens, not opacity', () => {
    const btn = code('components/Button/Button.tsx');
    expect(btn).toMatch(/theme\.actionDisabledBg/);
    expect(btn).toMatch(/theme\.actionDisabledText/);
    // the only opacity left is the loading label swap, which hides a label the spinner replaces
    expect(btn.match(/opacity:/g) ?? []).toHaveLength(1);
  });
});

describe('reduce-motion stops the candle and lands on the final state', () => {
  const candle = read('components/Candle/Candle.tsx');
  it('reads the OS reduce-motion preference', () => {
    expect(candle).toMatch(/AccessibilityInfo\.isReduceMotionEnabled/);
    expect(candle).toMatch(/reduceMotionChanged/);
  });
  it('the flicker loop does not start when motion is reduced', () => {
    expect(candle).toMatch(/if \(!lit \|\| !animate\)/);
  });
  it('the +덕 chip jumps straight to its final state when motion is reduced', () => {
    expect(candle).toMatch(/rise\.setValue\(1\); \/\/ final state only/);
  });
});

describe('the consumer reading measure is 480, and the 800 admin measure is untouched', () => {
  it('both constants exist and are distinct', () => {
    const t = read('constants/theme.ts');
    expect(t).toMatch(/export const MaxContentWidth = 800;/);
    expect(t).toMatch(/export const ConsumerMaxContentWidth = 480;/);
  });
  it('the shared layout hook widens margins instead of shrinking type', () => {
    const hook = read('hooks/useConsumerLayout.ts');
    expect(hook).toMatch(/width < 360 \? 16 : width >= 393 \? 24 : 20/);
    expect(hook).toMatch(/ConsumerMaxContentWidth/);
  });
});
