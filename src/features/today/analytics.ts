// Thin 오늘의 운세 funnel wrapper over the shared product-events foundation (§50 — reuse, don't rebuild).
// PII-free by construction: values pass through the productEvents ALLOWLIST, so birth data / prompt / raw
// fortune text can never be recorded (§65). Non-blocking (§52).
import { trackProductEvent, type ProductEventName } from '@/services/productEvents';

type TodayEventName = Extract<
  ProductEventName,
  | 'today_fortune_card_viewed'
  | 'today_fortune_opened'
  | 'today_fortune_generated'
  | 'today_fortune_cache_hit'
  | 'today_fortune_detail_opened'
  | 'today_fortune_consultation_clicked'
  | 'today_fortune_mailbox_opened'
>;

type TodayEventProps = {
  fortune_date?: string;
  cache_status?: 'hit' | 'miss';
  overall_tier?: string;
  source?: string;
};

export function trackTodayEvent(name: TodayEventName, props: TodayEventProps = {}): void {
  void trackProductEvent(name, { surface: 'today_fortune', properties: props });
}
