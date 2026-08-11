-- =============================================================================
-- DeokbunAI — ai_usage_logs.request_id correlation column  (ARTIFACT — owner-apply)
-- =============================================================================
-- Completes end-to-end request tracing (directive §2-C): the client mints a
-- non-PII requestId (src/features/analysis/requestId.ts → `req_<base36>_<rand>`),
-- chatService returns + logs it, the edge adapter forwards it, and the chat Edge
-- Function logs it and persists it here.
--
-- ⚠️ ARTIFACT ONLY — not applied automatically. Additive + idempotent + non-
-- destructive (nullable column; existing rows unaffected).
--
-- SAFE TO DEPLOY IN EITHER ORDER: the edge's logAiUsage() inserts WITH request_id
-- and, if this column does not exist yet, FALLS BACK to inserting without it — so
-- usage telemetry is never lost. Apply this whenever convenient to start
-- persisting the correlation id; no coordinated deploy required.
-- =============================================================================

alter table public.ai_usage_logs
  add column if not exists request_id text;

-- Optional: speeds up "show me everything for this requestId" lookups. The column
-- is low-cardinality-per-value (one id ≈ one request), so a plain btree is fine.
create index if not exists ai_usage_logs_request_id_idx
  on public.ai_usage_logs (request_id);
-- =============================================================================
