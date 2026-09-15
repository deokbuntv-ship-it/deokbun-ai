import { inAppNotificationService, type InAppNotificationDraft } from './services/inAppNotificationService';

// ADMIN/DEV-ONLY test-notification seed (global-bell §10-12). This exists so an ADMIN can verify the real
// in-app notification pipeline (create → unread badge → list → read → allowlisted deep-link) against their OWN
// account — createIfAbsent inserts under RLS with user_id = auth.uid(), so it only ever creates rows for the
// caller. It is NOT wired to any consumer surface, creates nothing automatically for production users, and uses
// IN-APP delivery only (no external push). Deep-link targets are the real allowlisted constants; dedup keys
// make re-running idempotent (no duplicates).
//
// Copy is 덕분이-brand and points to the CANONICAL destination — it never embeds fortune/report content (the
// notification center is the event inbox, not the content archive, §15).
export const TEST_NOTIFICATION_DRAFTS: readonly InAppNotificationDraft[] = [
  {
    category: 'service_notice',
    title: '오늘의 운세가 도착했어요',
    body: '오늘 하루의 흐름을 확인해보세요.',
    deepLinkTarget: 'TODAY',
    dedupKey: 'test:today',
  },
  {
    category: 'monthly_fortune',
    title: '이번 달 운세가 도착했어요',
    body: '이번 달의 큰 흐름을 확인해보세요.',
    deepLinkTarget: 'MONTHLY',
    dedupKey: 'test:monthly',
  },
  {
    category: 'service_notice',
    title: '새로운 운세우편이 있어요',
    body: '운세우편함에서 확인해보세요.',
    deepLinkTarget: 'MAILBOX',
    dedupKey: 'test:mailbox',
  },
];

/** Create the canonical test notifications for the CURRENT (admin) user. Idempotent via dedup keys. */
export async function seedTestNotifications(): Promise<void> {
  for (const draft of TEST_NOTIFICATION_DRAFTS) {
    await inAppNotificationService.createIfAbsent(draft);
  }
}
