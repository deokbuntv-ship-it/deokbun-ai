// Thin onboarding-funnel wrapper over the shared product-events foundation (§62 — reuse, don't rebuild).
// Non-blocking and PII-free by construction: property values pass through the productEvents ALLOWLIST, so a
// name / birth field / email / OAuth token / share token / raw URL can never be recorded here (§65).
import { trackProductEvent, type ProductEventName } from '@/services/productEvents';

type OnboardingEventName = Extract<
  ProductEventName,
  | 'login_entry_viewed'
  | 'oauth_started'
  | 'oauth_succeeded'
  | 'oauth_failed'
  | 'onboarding_terms_viewed'
  | 'onboarding_terms_completed'
  | 'onboarding_birth_viewed'
  | 'onboarding_birth_completed'
  | 'onboarding_completed'
>;

type OnboardingEventProps = {
  provider?: 'kakao' | 'google' | 'naver' | 'apple';
  completion_step?: 'terms' | 'birth' | 'complete';
  is_existing_user?: boolean;
  continuation_type?: 'shared_report' | 'return_to' | 'home';
  source?: string;
};

export function trackOnboardingEvent(name: OnboardingEventName, props: OnboardingEventProps = {}): void {
  void trackProductEvent(name, { surface: 'onboarding', properties: props });
}
