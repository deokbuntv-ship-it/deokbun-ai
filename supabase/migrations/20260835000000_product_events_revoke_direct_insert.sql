-- ============================================================================
-- DeokbunAI — Analytics FINAL permission state (Sprint H §41) — STEP 2 of the F.1 §T rollout.
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply ONLY AFTER the record_product_event RPC (migration
-- 20260830000000) is live AND the RPC-first client is deployed to all users. This is the concrete "final
-- intended permission state": it REVOKES the client's direct-INSERT path so record_product_event becomes the
-- ONLY writer. After this, a modified client can no longer INSERT arbitrary properties (incl. PII) — the
-- server-side allowlist/type/length validation is authoritative.
--
-- The client's transition fallback (direct insert) becomes RLS-denied → fail-open drop (inert) once this lands.
-- RELEASE-GATED: G7 stays RELEASE_BLOCKED until this migration is applied in production.
-- ============================================================================

drop policy if exists product_events_insert_own on public.product_events;

-- No client write policy remains: with RLS enabled and no insert policy, every anon/authenticated INSERT is
-- denied. record_product_event (SECURITY DEFINER, granted to authenticated) is the only write path.
