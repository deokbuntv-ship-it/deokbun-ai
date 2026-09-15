# STORE BILLING — OWNER SETUP (§50/§51/§38)

> Exact owner inputs + the controlled staging activation sequence. **Nothing here was executed.** No store
> products, keys, service accounts, secrets, or IDs were created (none are fabricated). Provider verification is
> BLOCKED_EXTERNAL until the owner supplies the config below.

## 1. Apple (App Store Server API + Notifications V2)
Owner provides:
- App Store Connect access; the app + bundle id (`APPLE_IAP_BUNDLE_ID`), and `APPLE_ENVIRONMENT` (`Sandbox`/`Production`).
- In-app purchase products (consumables): map to internal keys `DUK_FIRST_20` / `DUK_BASE_50` / `DUK_LARGE_120`.
- App Store Server API key: `APPLE_IAP_ISSUER_ID`, `APPLE_IAP_KEY_ID`, `APPLE_IAP_PRIVATE_KEY` (.p8, secret).
- App Store Server Notifications **V2** URL → point to the `apple-notifications-v2` Edge.
- A sandbox tester account.
Code seam: `src/features/duk/iap/apple.ts` (decode + validate; inject the x5c→Apple-root signature verifier) +
Edge `supabase/functions/apple-notifications-v2`.

## 2. Google (Play Developer API + RTDN)
Owner provides:
- Play Console access; the package name (`GOOGLE_PLAY_PACKAGE_NAME`).
- One-time products mapped to the same internal keys.
- Play Developer API access via a service account (`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`, JSON secret) with the right grants.
- Cloud Pub/Sub topic + RTDN configured to push to the `google-rtdn` Edge; the OIDC audience (`GOOGLE_PLAY_PUBSUB_AUDIENCE`).
- A license tester account.
Code seam: `src/features/duk/iap/google.ts` (state mapping + RTDN decode; inject the Developer-API client) + Edge
`supabase/functions/google-rtdn`. **RTDN is a change signal only** — the server refetches authoritative state.

## 3. Server product mapping
Populate `product_catalog` (migration 20260834): `(provider, store_product_id) → internal_product_key, grant_type,
grant_amount, lifetime_once`. The store product id NEVER authorizes a grant by itself; an unknown id fails closed.
Grant amount is the SERVER value, never the store-reported price.

## 4. Supabase migration sequence (apply in staging, verify, then production — timestamp order)
Run the read-only preflight first: `node scripts/staging/migration-preflight.mjs`.
Apply: 20260829 → 20260830 → 20260831 → 20260832 → 20260833 → 20260834 → 20260836 → (later) 20260835.
- 20260833 depends on 20260829/20260831/20260832. 20260834 depends on 20260831 (grant_duk/debt).
- 20260835 (analytics direct-insert revoke) is applied LAST, only after the RPC-first client is fully deployed.
- After apply, run `scripts/staging/economy_diagnostics.sql` (every query should return ZERO rows).

## 5. Edge functions to deploy
`chat` (regenerated bundle), `verify-purchase`, `apple-notifications-v2`, `google-rtdn`. Secrets/env:
`OPENAI_API_KEY`, `LLM_MODEL_TERRA` (+ optional `LLM_MODEL_MINI`), the APPLE_*/GOOGLE_PLAY_* config above.

## 6. Feature flags (server env; NOT client authority)
- `DUK_BILLING_ENABLED` — OFF until migrations verified; then ON (or TEST-ONLY cohort, §39) to activate session billing.
- `GLOBAL_REQ_IDEMPOTENCY_ENABLED` — ON only after 20260836 is applied.

## 7. Controlled staging activation sequence (§38 — do NOT execute in this sprint)
1. `node scripts/staging/migration-preflight.mjs` (read-only).
2. Apply migrations §4 in staging; verify RLS/grants.
3. Run `economy_diagnostics.sql` → all zero.
4. Deploy the Edge functions (§5); keep `DUK_BILLING_ENABLED` OFF.
5. Smoke test (consultation still works, unchanged, flag OFF).
6. Set `DUK_BILLING_ENABLED=true` (test cohort if used).
7. Run `node scripts/staging/economy-e2e.mjs --live` with staging env.
8. Configure Apple/Google products + credentials; sandbox/license purchase + restore + refund E2E.
9. Apply 20260835 (analytics revoke) after the RPC client is live everywhere.
10. Re-run `economy_diagnostics.sql` → all zero. Then plan production.

## 8. Minor-purchase policy (RELEASE BLOCKER)
Verify minor use/payment against Korean requirements + current Apple/Google rules before enabling public IAP.
The billing adapter is compatible with a future age/guardian-consent gate; no rule is invented in code.
