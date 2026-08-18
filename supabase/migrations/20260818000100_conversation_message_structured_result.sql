-- ============================================================================
-- DeokbunAI — persist the structured consultation answer + follow-ups (Commercial UX V4 §15/§17)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Additive + idempotent + non-destructive (nullable
-- columns; existing rows unaffected). No RLS change — conversation_messages ownership is already
-- enforced via the parent conversation.
--
-- WHY: assistant answers are persisted as TEXT only, so on reload the rich structured card +
-- follow-up chips downgrade to a plain text bubble, and there is no stored structured answer to
-- build a consultation report from. These nullable JSONB columns hold the VALIDATED structured
-- result + follow-ups (never raw prompt/grounding/engine payload — data minimization). The app
-- restores them fail-closed (malformed JSON → plain text). Safe to apply anytime.
-- ============================================================================

alter table public.conversation_messages
  add column if not exists structured_result jsonb,  -- validated StructuredConsultationViewModel-shaped
  add column if not exists follow_ups        jsonb;  -- validated string[] (exactly-3 contract)
-- ============================================================================
