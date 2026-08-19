// Thin retention funnel wrapper over the shared product-events foundation (§21). PII-free by construction —
// values pass the productEvents ALLOWLIST, so birth date/event free-text/token/email can never be recorded
// (§14.2/§21.1). Non-blocking.
import { trackProductEvent, type ProductEventName } from '@/services/productEvents';

type RetentionEventName = Extract<
  ProductEventName,
  | 'notification_created'
  | 'notification_opened'
  | 'birthday_message_opened'
  | 'life_event_created'
  | 'life_event_reminder_opened'
  | 'notification_pref_updated'
>;

type RetentionEventProps = {
  category?: string; // NotificationCategory / life-event TYPE code — categorical, non-PII
  deep_link_target?: string;
};

export function trackRetentionEvent(name: RetentionEventName, props: RetentionEventProps = {}): void {
  void trackProductEvent(name, { surface: 'retention', properties: props });
}
