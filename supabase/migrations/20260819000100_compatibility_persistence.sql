-- ============================================================================
-- DeokbunAI — Compatibility (궁합) persistence: conversations.compatibility_meta
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply via the Supabase migration flow.
-- This sprint does not deploy or apply it (NO db push). Additive + idempotent.
--
-- PURPOSE — a 궁합 conversation reuses the existing `conversations` +
-- `conversation_messages` tables (no compatibility_conversations table): it is marked
-- by `conversations.consultation_mode = 'compatibility'` (added in 20260819000000) with
-- `subject_id` = the target subject. On reload the messages restore via the existing
-- `structured_result`/`follow_ups` columns, but the DETERMINISTIC tier chip (server-owned,
-- not recomputable client-side) needs to survive too. This adds ONE additive nullable
-- column to store that bounded tier meta so a refresh restores the tier without any LLM call:
--
--   conversations.compatibility_meta jsonb
--     — the CompatibilityResultMeta { overall, overallLabel, dimensions[], reducedPrecision,
--       selfLabel, targetLabel, engineVersion, tierModelVersion }. NO birth date/time/place,
--       NO raw engine payload — only the user-facing tier + labels.
--
-- RLS is UNCHANGED (owner-only, inherited from the conversations policies). Existing rows
-- keep compatibility_meta = null (solo conversations never set it).
-- ============================================================================

alter table public.conversations
  add column if not exists compatibility_meta jsonb;
