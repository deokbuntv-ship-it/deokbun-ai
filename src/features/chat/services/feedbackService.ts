import { logDbError } from '@/features/analysis';
import type { FeedbackVerdict } from '@/features/intelligence';
import { getSupabaseClient } from '@/services/supabase';

// Consultation feedback persistence (solo + 궁합). Writes to `consultation_feedback` (migration
// 20260819000200). A SIGNAL for offline analysis — never mutates an engine rule/assessment. RLS is
// owner-only (INSERT also requires the referenced conversation to belong to the caller). Idempotent per
// (user, message): re-voting 👍→👎 UPDATES the row. NON-BLOCKING: a failure never breaks the answer UX.
//
// PRIVACY (§28): stores only which assistant MESSAGE, the verdict, an optional reason code, and version
// tags — NEVER the raw question/answer, name, birth data, email, or phone.

const TABLE = 'consultation_feedback';

export type SaveFeedbackInput = {
  conversationId: string | null;
  messageId: string;
  verdict: FeedbackVerdict;
  consultationMode?: 'solo' | 'compatibility' | null;
  reasonCode?: string | null;
  policyVersion?: string | null;
  engineVersion?: string | null;
};

async function saveFeedback(input: SaveFeedbackInput): Promise<boolean> {
  // NON-BLOCKING (§40 analogue): feedback is never critical, so any failure logs and returns false —
  // it must never surface to the user or break the answer UX. logDbError logs then throws, so it is
  // wrapped here to swallow it.
  try {
    const supabase = getSupabaseClient();
    // user_id is filled by the DB default auth.uid(); upsert on (user_id, message_id) makes a re-vote
    // an UPDATE (§30). updated_at is maintained by the set_updated_at trigger.
    const { error } = await supabase.from(TABLE).upsert(
      {
        conversation_id: input.conversationId,
        message_id: input.messageId,
        verdict: input.verdict,
        consultation_mode: input.consultationMode ?? null,
        reason_code: input.reasonCode ?? null,
        policy_version: input.policyVersion ?? null,
        engine_version: input.engineVersion ?? null,
      },
      { onConflict: 'user_id,message_id' },
    );
    if (error) logDbError(error, 'feedback', 'persist');
    return true;
  } catch {
    return false;
  }
}

// Restores the verdict per assistant message for a conversation, so a reload keeps the 👍/👎 selected
// (§31). Owner-scoped by RLS. Returns {} on any failure (fail-open — feedback is never critical).
async function loadFeedbackForConversation(
  conversationId: string,
): Promise<Record<string, FeedbackVerdict>> {
  const map: Record<string, FeedbackVerdict> = {};
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('message_id, verdict')
      .eq('conversation_id', conversationId);
    if (error) logDbError(error, 'feedback', 'persist');
    for (const row of (data as { message_id: string; verdict: FeedbackVerdict }[] | null) ?? []) {
      if (row.verdict === 'helpful' || row.verdict === 'not_helpful') map[row.message_id] = row.verdict;
    }
  } catch {
    // fail-open — feedback is never critical.
  }
  return map;
}

export const feedbackService = { saveFeedback, loadFeedbackForConversation };
