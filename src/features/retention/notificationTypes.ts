// Normalized notification TYPES (Sprint J3 §8). A single vocabulary every notification producer uses, mapped to
// the stored DB `category` (in_app_notifications.category) + a deep-link target. Marketing is intentionally a
// SEPARATE type from the service types — a service notification must never be sent under marketing consent and
// vice-versa. This is the type layer; the DB category vocabulary is unchanged (purely additive sprint).
import type { NotificationCategory } from './types';
import type { DeepLinkTarget } from './deepLinks';

export type NotificationType =
  | 'BIRTHDAY'
  | 'MONTHLY_FORTUNE_READY'
  | 'LIFE_EVENT'
  | 'TURNING_POINT'
  | 'SYSTEM'
  | 'MARKETING'; // separate — requires marketing consent, never service preference

export type NotificationTypeSpec = {
  category: NotificationCategory; // stored vocabulary
  deepLinkTarget: DeepLinkTarget;
  /** which consent gates the send: a service preference key, or 'marketing'. */
  consent: 'monthly_fortune' | 'birthday' | 'important_schedule' | 'service_notice' | 'marketing';
  isMarketing: boolean;
};

export const NOTIFICATION_TYPES: Record<NotificationType, NotificationTypeSpec> = {
  BIRTHDAY: { category: 'birthday', deepLinkTarget: 'MONTHLY', consent: 'birthday', isMarketing: false },
  MONTHLY_FORTUNE_READY: { category: 'monthly_fortune', deepLinkTarget: 'MONTHLY', consent: 'monthly_fortune', isMarketing: false },
  LIFE_EVENT: { category: 'important_schedule', deepLinkTarget: 'LIFE_EVENT', consent: 'important_schedule', isMarketing: false },
  TURNING_POINT: { category: 'important_schedule', deepLinkTarget: 'MONTHLY', consent: 'important_schedule', isMarketing: false },
  SYSTEM: { category: 'service_notice', deepLinkTarget: 'HOME', consent: 'service_notice', isMarketing: false },
  MARKETING: { category: 'marketing', deepLinkTarget: 'HOME', consent: 'marketing', isMarketing: true },
};

export function notificationTypeSpec(type: NotificationType): NotificationTypeSpec {
  return NOTIFICATION_TYPES[type];
}
