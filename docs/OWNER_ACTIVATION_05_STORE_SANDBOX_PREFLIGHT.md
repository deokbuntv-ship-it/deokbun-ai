# OWNER ACTIVATION 05 — STORE SANDBOX PRE-FLIGHT

> Autonomous read-only audit. **No production contact. No secrets created/exposed. No Codex.** Production
> mutations = 0. Store-sandbox readiness gate: OPEN (client-analytics live is a deferred monitoring gate per Option B).

## 1. Current IAP Architecture
Server-authoritative, client sends only opaque submissions.
- **Client seam:** `src/features/duk/iap/` — `catalog` (internal keys), `apple`/`google` (decode + verifier interfaces),
  `purchaseVerification.verifyAndGrantPurchase` (provider-verify → catalog resolve → external-id dedup → first-pack
  limit → atomic record+grant), `purchaseStateMachine` (status transitions + reserve reconciliation), `adapters`
  (verifier factories). Client submission = `requestPurchaseVerification({provider, storeProductId, transactionToken})`.
- **Edge:** `verify-purchase` (verify_jwt=true), `apple-notifications-v2` (jwt=false), `google-rtdn` (jwt=false) — all
  **deployed + ACTIVE on staging** (03A), all return **NOT_CONFIGURED (503)** until provider secrets are set (never fake-accept).
- **DB:** `product_catalog`, `verified_purchases`, `purchase_revocations`, `duk_debt` + RPCs `record_verified_purchase`,
  `record_revocation` (+ `grant_duk`/`spend_duk`) — all present on staging.

## 2. Apple Readiness
Code READY: `apple.ts` decodes JWS + `decodeJws`/`base64ToJson`; verifier injects an x5c→Apple-root signature check;
`apple-notifications-v2` verifies the signed envelope BEFORE any effect. Config it reads (names only):
`APPLE_IAP_ISSUER_ID`, `APPLE_IAP_KEY_ID`, `APPLE_IAP_PRIVATE_KEY` (.p8), `APPLE_IAP_BUNDLE_ID`, `APPLE_ENVIRONMENT`.
**Absent on staging** → NOT_CONFIGURED. Bundle id = `com.deokbun.app`.

## 3. Google Readiness
Code READY: `google.ts` maps purchase state + `shouldGrant`/`shouldAcknowledge`; `google-rtdn` treats RTDN as a
CHANGE SIGNAL → authoritative Developer-API refetch (never grants from the notification). Config (names only):
`GOOGLE_PLAY_PACKAGE_NAME`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`, `GOOGLE_PLAY_PUBSUB_AUDIENCE`. **Absent** → NOT_CONFIGURED.
Package = `com.deokbun.app`.

## 4. Product Catalog
Schema present: `(id, provider, store_product_id, internal_product_key, grant_type, grant_amount, lifetime_once,
active, created_at)`. **0 rows** — must be seeded with `(provider, store_product_id) → internal_product_key` AFTER the
owner creates the store products (the store product id NEVER authorizes a grant by itself; unknown id fails closed;
grant_amount is the SERVER value). Internal keys + server hypotheses: `DUK_FIRST_20` (20 Duk, ₩2900, lifetime-once),
`DUK_BASE_50` (50, ₩9900), `DUK_LARGE_120` (120, ₩19900), `PLUS_MONTHLY` (subscription — **not enabled this sprint**).

## 5. First Pack 20-Duk Flow
`DUK_FIRST_20` is lifetime-once, enforced server-side by the partial unique index **`verified_purchases_first_pack_once`**
+ `verifyAndGrantPurchase`'s first-pack check. Restore/replay never grants a second 20 Duk.

## 6. Purchase Idempotency
`verified_purchases_external_uniq` (unique external_transaction_id) → the same receipt grants once;
`record_verified_purchase` is idempotent by external id (replay → grantedDuk 0, alreadyProcessed true). Server derives
the authoritative externalTransactionId/storeProductId from the provider — never trusts the client.

## 7. Restore
Restore = re-submitting prior transactions → external-id dedup → grants once (no double-grant), first-pack still once.
Covered by the same idempotency path; no separate restore table needed.

## 8. Refund / Revocation
`record_revocation(user, external_revocation_id, external_transaction_id, amount)`: idempotent (dedup by
external_revocation_id); reverses what the PAID balance can cover; the remainder becomes `duk_debt` (origin REFUND,
linked to the revocation). Fires from `apple-notifications-v2` (REFUND) / `google-rtdn` (voided/refunded) after
authoritative re-verification.

## 9. Duk Debt
`duk_debt (user_id, amount, origin, revocation_id, resolved, …)`. Created by `record_revocation` when a refund exceeds
recoverable PAID balance. Future grants offset debt first (economy substrate). 0 rows on staging.

## 10. Webhook Security
`apple-notifications-v2` (jwt=false): verifies the Apple JWS signature BEFORE any state change; dedupes; 503 until
configured. `google-rtdn` (jwt=false): RTDN is a change-signal only → server refetches authoritative state via the
Developer API (OIDC audience check); 503 until configured. Neither grants from the raw notification payload.

## 11. Missing Credentials / Account Setup (all OWNER-only)
| Provider | Needed |
|---|---|
| Apple | App Store Connect app (bundle `com.deokbun.app`) · 3 **consumable** IAP products → map to DUK_FIRST_20/DUK_BASE_50/DUK_LARGE_120 · App Store Server API key (issuer id, key id, .p8 private key) · App Store Server Notifications **V2** URL → the staging `apple-notifications-v2` function URL · a Sandbox tester account · `APPLE_ENVIRONMENT=Sandbox` |
| Google | Play Console app (package `com.deokbun.app`) · 3 **one-time** products → same internal keys · Play Developer API **service account JSON** with grants · Cloud Pub/Sub topic + RTDN → the staging `google-rtdn` function URL · OIDC audience · a License tester account |
| Staging secrets | `APPLE_IAP_ISSUER_ID/KEY_ID/PRIVATE_KEY/BUNDLE_ID`, `APPLE_ENVIRONMENT`; `GOOGLE_PLAY_PACKAGE_NAME/SERVICE_ACCOUNT_JSON/PUBSUB_AUDIENCE` — entered locally, never pasted into chat |

## 12. Local Autonomous Work Remaining
- **Client native IAP SDK is NOT integrated** (HIGH, §15) — only the *submission* seam exists; there is no
  `expo-in-app-purchases`/`react-native-iap` to open the store sheet and obtain the transaction token. Needed for an
  in-app sandbox purchase E2E (requires a dev/EAS build, not Expo Go).
- **product_catalog seed** — I can generate the seed migration/script the moment the owner supplies the real store
  product ids (I will not invent ids). Everything else server-side is already in place.

## 13. Owner Action Required
Provision Apple + Google per §11 (products, credentials, notification/RTDN URLs, testers), then hand back the store
product ids + set the staging secrets locally. That unblocks catalog seeding + sandbox verification.

## 14. BLOCKER
None (server/DB/Edge substrate is complete + deployed; readiness is OPEN).

## 15. HIGH
- **Client native purchase initiation not wired** — integrate `expo-in-app-purchases` (or `react-native-iap`) + a
  buy→token→`requestPurchaseVerification` flow, in a dev build, before the sandbox E2E. Server side is ready to receive it.

## 16. MEDIUM
- product_catalog empty (expected — awaits real store ids).
- `duk_exhausted` analytics NOT_IMPLEMENTED (overlaps INSUFFICIENT_DUK; deferred-safe, non-blocking).
- Terra unpriced in the cost model (carried).
- `CLIENT_ANALYTICS_PRODUCTION_LIKE_LIVE_CHECK` is a deferred pre-public-release gate (Option B).

## 17. Next Exact Step
Owner: create the Apple + Google apps/products/credentials (§11). In parallel I integrate the client native IAP SDK +
prepare the catalog seed. Then set staging secrets → I seed `product_catalog` with the real ids → run the sandbox
(Apple) / license (Google) purchase → verify grant + idempotency + refund→debt, all on staging.

---

READY_FOR_OWNER_STORE_SETUP — the server-authoritative IAP stack (verify → catalog → idempotent grant → refund→debt),
its Edge seams (deployed, fail-closed NOT_CONFIGURED), and its DB substrate are complete and verified on staging. The
only remaining items are the unavoidable owner store-account provisioning (§11) and the client native IAP SDK
integration (§15) — no production was touched.

OWNER_ACTIVATION_05_PREFLIGHT_COMPLETE
