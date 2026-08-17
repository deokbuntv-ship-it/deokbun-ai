-- ============================================================================
-- DeokbunAI — ai_usage_logs cost telemetry columns (Commercial Quality Sprint §13)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Additive + idempotent + non-destructive
-- (all nullable; existing rows unaffected). SAFE TO DEPLOY IN EITHER ORDER: the edge's
-- logAiUsage() uses a progressive fallback (same policy as request_id) — it inserts WITH
-- these columns and, if they don't exist yet, retries WITHOUT them, so usage telemetry is
-- never lost. Apply whenever convenient to start persisting the cost breakdown.
--
-- WHY: cost was only ESTIMABLE — the edge logged input/output/total tokens but not the
-- reasoning-token share (which dominates gpt-5-mini output cost) or cache hits, and not the
-- per-question routing decision. These columns make the ACTUAL per-Q&A cost computable via
-- the existing computeCost calculator. No PII — only token counts + the routing scalars.
-- ============================================================================

alter table public.ai_usage_logs
  add column if not exists cached_input_tokens int,   -- usage.input_tokens_details.cached_tokens
  add column if not exists reasoning_tokens    int,   -- usage.output_tokens_details.reasoning_tokens
  add column if not exists max_output_tokens   int,   -- the per-question output ceiling chosen
  add column if not exists complexity          text,  -- SIMPLE | STANDARD | DEEP
  add column if not exists reasoning_effort    text;  -- low | medium | …
-- ============================================================================
