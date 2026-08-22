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
  | 'onboarding_completed'
  // 오늘의 운세 (Today Fortune V1, §50) — daily retention funnel. Bounded, no PII.
  | 'today_fortune_card_viewed'
  | 'today_fortune_opened'
  | 'today_fortune_generated'
  | 'today_fortune_cache_hit'
  | 'today_fortune_detail_opened'
  | 'today_fortune_consultation_clicked'
  | 'today_fortune_mailbox_opened'
  // 이번 달 운세 (Monthly Fortune V1, §74) — monthly retention funnel. Bounded, no PII.
  | 'monthly_fortune_card_viewed'
  | 'monthly_fortune_opened'
  | 'monthly_fortune_generated'
  | 'monthly_fortune_cache_hit'
  | 'monthly_fortune_detail_opened'
  | 'monthly_fortune_consultation_clicked'
  | 'monthly_fortune_mailbox_opened'
  // Retention foundation (§14/§21) — notification / birthday / life-event funnel. Bounded, no PII.
  | 'notification_created'
  | 'notification_opened'
  | 'birthday_message_opened'
  | 'life_event_created'
  | 'life_event_reminder_opened'
  | 'notification_pref_updated'
  // Popular-question consultation-conversion funnel (Home IA sprint). The FULL conversion path for the
  // admin-managed "지금 많이 물어보는 질문" list: impression (deduped per Home view) → click (one tap) →
  // consultation_start (enters the send lifecycle, ≠ click) → first_answer_success (first successful answer
  // only). Correlated by a STABLE analytics key (a slug), never the raw question text. Bounded, no PII.
  | 'popular_question_impression'
  | 'popular_question_click'
  | 'popular_question_consultation_start'
  | 'popular_question_first_answer_success'
  // Duk economy / monetization funnel (Sprint G §AL/§AM). All categorical/numeric, non-PII.
  | 'home_compatibility_impression'
  | 'first_action_after_onboarding'
  | 'welcome_duk_granted'
  | 'candle_lit'
  | 'birthday_duk_granted'
  | 'duk_reserved'
  | 'duk_committed'
  | 'duk_released'
  | 'duk_spent'
  | 'duk_exhausted'
  | 'compatibility_insufficient_duk'
  | 'consultation_started'
  | 'consultation_completed'
  | 'paywall_viewed'
  | 'first_pack_purchased'
  | 'repeat_purchase'
  | 'session_started'
  | 'session_turn_completed'
  | 'session_expired'
  | 'plus_viewed'
  | 'plus_subscribed'
  | 'refund_processed'
  | 'duk_debt_created'
  | 'duk_debt_offset';

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
  // Today-fortune funnel props (§51) — a calendar date + cache status + readable tier. No PII.
  'fortune_date',
  'cache_status',
  'overall_tier',
  // Monthly-fortune funnel prop (§74) — a "YYYY-MM" month key (coarse, non-PII).
  'fortune_month',
  // Retention props (§14.2) — a categorical category/type code + an allowlisted deep-link target. No PII.
  'category',
  'deep_link_target',
  // Popular-question funnel props (Home IA sprint) — a STABLE analytics slug + its category + where it was
  // shown + its rank in the list. All categorical/numeric; the raw question text is NEVER an event property.
  'question_key',
  'question_category',
  'placement',
  'position',
  // Duk economy / acquisition funnel (Sprint F §T/§U) — all categorical/numeric/boolean, non-PII. Kept in sync
  // with the server allowlist in migration 20260830000000_product_events_server_validation.sql.
  'amount',
  'reason',
  'bucket',
  'duk_balance',
  'duk_balance_at_entry',
  'duk_shortfall',
  'reward_duk_balance',
  'paid_duk_balance',
  'plus_duk_balance',
  'prior_consultation_count',
  'days_since_signup',
  'day_index',
  'accelerated',
  'pack_type',
  'duk_granted',
  'price_krw',
  'monthly_duk',
  'trigger',
  'turn_count',
  'outcome',
  'product',
  'session_id',
  'action',
  'entry',
  'turns_used',
  'origin',
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

// Sprint F.1 §T — prefer the SERVER-VALIDATED RPC (record_product_event), which re-applies the allowlist +
// type/length checks server-side so a modified client cannot smuggle PII. The direct insert remains only as a
// TRANSITION fallback for the window before the RPC migration is deployed; once STEP 2 revokes the insert
// policy it is inert (RLS-denied → dropped). Cached per session so we don't retry a missing RPC every event.
let rpcUnavailable = false;
function isFunctionMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === 'PGRST202') return true; // PostgREST: function not found in schema cache
  const m = (error.message ?? '').toLowerCase();
  return m.includes('does not exist') || m.includes('could not find the function') || m.includes('not find');
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
    const surface = opts?.surface ?? null;
    const consultationMode = opts?.consultationMode ?? null;
    const properties = sanitizeEventProperties(opts?.properties); // client-side defense-in-depth
    if (!rpcUnavailable) {
      const { error } = await supabase.rpc('record_product_event', {
        p_event_name: eventName,
        p_surface: surface,
        p_consultation_mode: consultationMode,
        p_properties: properties,
      });
      if (!error) return;
      // Only fall back when the RPC is not deployed yet; any other error → drop (fail-open, no bypass).
      if (isFunctionMissing(error)) rpcUnavailable = true;
      else return;
    }
    // Transition fallback (pre-migration only): direct insert, still client-sanitized.
    await supabase.from('product_events').insert({
      event_name: eventName,
      surface,
      consultation_mode: consultationMode,
      properties,
    });
  } catch {
    // non-blocking (§40) — analytics must never surface an error or block the experience.
  }
}
