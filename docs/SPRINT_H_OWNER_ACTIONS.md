# SPRINT H — OWNER ACTION BUNDLE (§56)

> Ordered checklist. **Nothing here was executed** (no push / deploy / remote migration / remote DB mutation /
> store products / secrets). All items are owner-performed. Derived from the actual repo state at Sprint H end.
> Do the migrations in staging first; every migration is additive + OWNER_APPLY + LIVE_DB_UNVERIFIED.

## A. Database (apply in staging, verify, then production — in this order)
1. Inspect the current Supabase migration history vs `supabase/migrations/` (reconcile any already-applied).
2. Apply, in timestamp order:
   - `20260829000000_consultation_decisions.sql` (E.1) — server decision store.
   - `20260830000000_product_events_server_validation.sql` (F.1) — analytics RPC.
   - `20260831000000_duk_economy_foundation.sql` (F.1) — ledger/debt/reserve/spend_duk/grant_duk.
   - `20260832000000_duk_economy_runtime.sql` (G) — economy_policy/sessions/candle/events/plus + light_candle.
   - `20260833000000_duk_session_runtime.sql` (H) — reserve/commit/release + complete_consultation_with_billing.
   - `20260834000000_iap.sql` (H) — product_catalog/verified_purchases/revocations + record RPCs.
   - `20260836000000_global_reservation_request_id.sql` (H) — global request-id dedup wrapper.
3. Verify RLS (read-own, NO client write) + RPC grants (service-role only; `light_candle`/`record_product_event`
   = authenticated) on every new table/function.
4. Seed/adjust `economy_policy` if needed (V1 locked values are seeded as `economy@1.0.0`).
5. Populate `product_catalog` with the real store product ids → internal keys (when store products exist).

## B. Analytics closure (after the RPC client is fully deployed)
6. Apply `20260835000000_product_events_revoke_direct_insert.sql` (STEP 2) — revokes the direct-insert policy so
   `record_product_event` is the only writer. This closes G7 (until applied, G7 is RELEASE_BLOCKED).

## C. Edge deploy
7. Deploy the `chat` Edge (regenerated bundle already carries model routing + summary safety + implicit-winner).
8. Set env: `LLM_MODEL_TERRA` = the real Terra model id; optionally `LLM_MODEL_MINI`.
9. **After** migrations A2 are applied + verified: set `DUK_BILLING_ENABLED=true` to activate session billing
   (until then the consultation path is byte-identical to today — inert).
10. (Optional, §44) Switch the Edge global-reserve call to `reserve_global_paid_generation_idem` + pass
    `request_id` — only after `20260836` is applied.
11. Deploy the `verify-purchase` Edge (returns NOT_CONFIGURED until D14 credentials are set).

## D. Benchmark + IAP (external)
12. Run the live Mini/Terra benchmark: `node scripts/benchmark/run-benchmark.mjs --live` with
    `BENCHMARK_EDGE_URL/JWT/SERVICE_KEY/SUPABASE_URL` (+ optional `BENCHMARK_FX_KRW_PER_USD`, `BENCHMARK_PRICES`).
    Review the economy recommendation; adjust POLICY VALUES if warranted (owner decision).
13. Test the billing runtime with two real Supabase users (first-turn charge, follow-up no-recharge, insufficient,
    candle, session expiry, cross-product isolation).
14. Create/configure Apple products + set `APPLE_IAP_ISSUER_ID/KEY_ID/PRIVATE_KEY/BUNDLE_ID`.
15. Create/configure Google products + set `GOOGLE_PLAY_PACKAGE_NAME/SERVICE_ACCOUNT_JSON`.
16. Implement the provider verifiers (adapters.ts TODOs) + wire `verify-purchase` → `record_verified_purchase`.
17. Sandbox purchase / restore / refund E2E (first-pack lifetime, dedup, revocation → debt).
18. Verify the minor-purchase policy (Korean + Apple/Google) before enabling public IAP (RELEASE BLOCKER).

## Notes
- Frozen consultation semantics are untouched; billing is admission + commit only.
- Do the analytics revoke (B6) and `DUK_BILLING_ENABLED` (C9) only after their prerequisites, in the given order.
