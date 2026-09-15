// Thin 이번 달 운세 funnel wrapper over the shared product-events foundation (§74 — reuse, don't rebuild).
// PII-free by construction: values pass through the productEvents ALLOWLIST, so birth data / prompt / raw
// fortune text can never be recorded (§75). Non-blocking.
import { trackProductEvent, type ProductEventName } from '@/services/productEvents';

type MonthlyEventName = Extract<
  ProductEventName,
  | 'monthly_fortune_card_viewed'
  | 'monthly_fortune_opened'
  | 'monthly_fortune_generated'
  | 'monthly_fortune_cache_hit'
  | 'monthly_fortune_detail_opened'
  | 'monthly_fortune_consultation_clicked'
  | 'monthly_fortune_mailbox_opened'
>;

type MonthlyEventProps = {
  fortune_month?: string; // "YYYY-MM" — coarse, non-PII
  cache_status?: 'hit' | 'miss';
  overall_tier?: string;
};

export function trackMonthlyEvent(name: MonthlyEventName, props: MonthlyEventProps = {}): void {
  void trackProductEvent(name, { surface: 'monthly_fortune', properties: props });
}
