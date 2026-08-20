import { readFileSync } from 'fs';
import { resolve } from 'path';

import { isDeepLinkTarget } from '@/features/retention/deepLinks';
import { TEST_NOTIFICATION_DRAFTS } from '@/features/retention/devTestNotifications';

// Global notification bell (global-bell addendum). Source-contract checks (node-only runner) that lock: the
// bell is exposed via the ONE shared AppHeader flag on eligible authenticated consumer screens, is absent from
// focused/auth-flow screens, and reads a SINGLE shared unread state (no per-screen fetch). Plus the
// admin/dev test-notification drafts used for pipeline verification.
const SRC = resolve(__dirname, '..', '..');
const read = (rel: string) => readFileSync(resolve(SRC, rel), 'utf8');

describe('AppHeader is the single reusable bell implementation', () => {
  const header = read('components/AppHeader/AppHeader.tsx');
  it('renders the bell only when showBell is set, and routes it to /notifications', () => {
    expect(header).toMatch(/showBell \?/); // bell gated on the flag
    expect(header).toMatch(/router\.push\('\/notifications'\)/);
  });
  it('reads the shared unread count (no local count prop)', () => {
    expect(header).toMatch(/useNotificationUnread\(\)/);
    expect(header).not.toMatch(/bellCount/); // the old per-screen count prop is gone
  });
});

describe('eligible authenticated consumer screens expose the bell', () => {
  const ELIGIBLE = [
    'app/(tabs)/index.tsx', // Home
    'app/(tabs)/consult.tsx', // 상담
    'app/(tabs)/compatibility.tsx', // 궁합
    'app/(tabs)/inbox.tsx', // 운세우편함
    'app/(tabs)/my.tsx', // MY
    'app/today.tsx', // 오늘의 운세
    'app/monthly.tsx', // 이번 달 운세
    'app/report/[id].tsx', // 리포트 상세
  ];
  it.each(ELIGIBLE)('%s sets showBell', (rel) => {
    expect(read(rel)).toMatch(/showBell/);
  });
  it('Home no longer fetches its own unread count (shared state only)', () => {
    expect(read('app/(tabs)/index.tsx')).not.toMatch(/inAppNotificationService/);
  });
});

describe('excluded focused / auth-flow screens do NOT expose the bell', () => {
  const EXCLUDED = [
    'app/onboarding/terms.tsx',
    'app/onboarding/birth.tsx',
    'app/chat.tsx', // active consultation — focused
    'app/notifications.tsx', // the notification screen itself
    'app/notification-settings.tsx',
    'app/shared-report/[token].tsx', // public
    'app/mail-detail.tsx', // focused reading
  ];
  it.each(EXCLUDED)('%s does not set showBell', (rel) => {
    expect(read(rel)).not.toMatch(/showBell/);
  });
});

describe('admin/dev test-notification drafts (pipeline verification)', () => {
  it('has the three canonical drafts pointing at allowlisted destinations', () => {
    expect(TEST_NOTIFICATION_DRAFTS).toHaveLength(3);
    const byTarget = Object.fromEntries(TEST_NOTIFICATION_DRAFTS.map((d) => [d.deepLinkTarget, d]));
    expect(byTarget.TODAY?.title).toBe('오늘의 운세가 도착했어요');
    expect(byTarget.MONTHLY?.title).toBe('이번 달 운세가 도착했어요');
    expect(byTarget.MAILBOX?.title).toBe('새로운 운세우편이 있어요');
    TEST_NOTIFICATION_DRAFTS.forEach((d) => expect(isDeepLinkTarget(d.deepLinkTarget)).toBe(true));
  });
  it('uses unique dedup keys (idempotent) and never embeds legacy brand', () => {
    const keys = TEST_NOTIFICATION_DRAFTS.map((d) => d.dedupKey);
    expect(new Set(keys).size).toBe(keys.length);
    TEST_NOTIFICATION_DRAFTS.forEach((d) => {
      expect(`${d.title} ${d.body ?? ''}`).not.toMatch(/덕분AI/);
    });
  });
});
