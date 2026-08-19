import { getSupabaseClient } from './supabase';

// Generic, privacy-safe product-events client (migration 20260819000300). Foundation only — this is NOT
// dating/matching (§33). NON-BLOCKING: any failure is swallowed silently so analytics never affects the
// UX (§40). A PROPERTY ALLOWLIST is enforced HERE (§37/§38/§59) so `properties` can never carry PII even
// if a caller passes extra keys — the DB is written write-only under owner-scoped RLS.

export type ProductEventName =
  | 'compatibility_entry_viewed'
  | 'compatibility_subject_created'
  | 'compatibility_pair_selected'
  | 'compatibility_started'
  | 'compatibility_result_viewed'
  | 'compatibility_detail_opened'
  | 'compatibility_followup_clicked'
  | 'compatibility_feedback_positive'
  | 'compatibility_feedback_negative'
  | 'compatibility_report_created'
  | 'compatibility_report_viewed'
  | 'compatibility_report_shared'
  | 'compatibility_conversation_resumed'
  | 'compatibility_new_conversation_started'
  // Signup-first onboarding funnel (§63) — bounded, no PII (birth data/tokens/emails never appear here).
  | 'login_entry_viewed'
  | 'oauth_started'
  | 'oauth_succeeded'
  | 'oauth_failed'
  | 'onboarding_terms_viewed'
  | 'onboarding_terms_completed'
  | 'onboarding_birth_viewed'
  | 'onboarding_birth_completed'
  | 'onboarding_completed';

// The ONLY property keys that may be persisted. Everything else is dropped (§38). No name / birth /
// question / answer / email / phone can appear here — those keys are simply not on the allowlist.
const ALLOWED_PROPS = new Set<string>([
  'relationship_type',
  'question_domain',
  'compatibility_tier',
  'policy_version',
  'engine_version',
  'followup_category',
  'source',
  'channel',
  // Onboarding funnel props (§64) — the login method + which step + new-vs-existing + continuation kind.
  // These are categorical/boolean only; no name/birth/email/phone/token/URL can appear here.
  'provider',
  'completion_step',
  'is_existing_user',
  'continuation_type',
]);
const MAX_STR = 64;

export function sanitizeEventProperties(
  props: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!props) return out;
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(k)) continue; // allowlist — drop anything not explicitly permitted
    if (typeof v === 'string') {
      if (v.length > 0 && v.length <= MAX_STR) out[k] = v;
    } else if (typeof v === 'number' && Number.isFinite(v)) {
      out[k] = v;
    } else if (typeof v === 'boolean') {
      out[k] = v;
    }
  }
  return out;
}

export async function trackProductEvent(
  eventName: ProductEventName,
  opts?: {
    surface?: string;
    consultationMode?: 'solo' | 'compatibility' | null;
    properties?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.from('product_events').insert({
      event_name: eventName,
      surface: opts?.surface ?? null,
      consultation_mode: opts?.consultationMode ?? null,
      properties: sanitizeEventProperties(opts?.properties),
    });
  } catch {
    // non-blocking (§40) — analytics must never surface an error or block the experience.
  }
}
