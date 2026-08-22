# OWNER ACTIVATION 05A — TECHNICAL IAP INTEGRATION REPORT

> Client IAP integration WITHOUT store/business provisioning. **No production. No fake store ids. No business
> registration. No Codex.** Client TS + tests + template only — no DB/secret/deploy → staging & production mutations = 0.

## Client Native IAP SDK
Chosen: **`react-native-iap`** (mature, config-plugin based, EAS/dev-build compatible; `expo-in-app-purchases` is
deprecated and unavailable on SDK 57). Integrated behind an **SDK-agnostic seam** so all flow logic + tests are
native-module-free:
- `src/features/duk/iap/nativeStore.ts` — `NativeStoreAdapter` interface + types (`StoreProduct`, `NativePurchase`,
  `PurchaseOutcome` = SUCCESS/CANCELLED/PENDING/ERROR).
- `src/features/duk/iap/reactNativeIapAdapter.ts` — concrete adapter that **lazy-loads** `react-native-iap`; if the
  module is absent (Expo Go / before a dev build) `isAvailable()` is false → the flow degrades to `NOT_AVAILABLE`
  (no crash, no fake grant). Maps init/getProducts/requestPurchase/getAvailablePurchases/finishTransaction + a
  per-platform opaque token (iOS JWS/receipt, Android purchaseToken).
- **Finalization (dev build, ties to deferred 05B):** `npx expo install react-native-iap` + config plugin + EAS/dev
  build + confirm the installed version's exact API + on-device verification. IAP cannot run in Expo Go.

## Purchase Initiation
`src/features/duk/iap/purchaseFlow.ts` `runPurchase(adapter, verify, storeProductId)` — pure orchestrator:
fetch/initiate → on native SUCCESS forward the OPAQUE token to the server → on server grant, finish the
transaction. CANCELLED/PENDING/ERROR handled distinctly. Product ids come from config/catalog mapping (no final
Apple/Google ids invented).

## Server Verification Submission
Uses the existing `requestPurchaseVerification({provider, storeProductId, transactionToken})` → `verify-purchase`
Edge. The client sends only the opaque submission; the server verifies with the store + grants via the idempotent
`record_verified_purchase`. **The client transaction is finished ONLY after an authoritative server grant.**

## Cancel / Pending / Failure
- CANCELLED → no verify, no finish.
- Native PENDING (Ask-to-Buy/deferred) or server `PURCHASE_PENDING` → `PENDING`, not finished (store settles later).
- Native error / `adapter.purchase` throw (network) → `ERROR`, not finished.
- Server verification failure / `NOT_CONFIGURED` → `VERIFICATION_FAILED`, **transaction left unfinished** so it can
  be retried/restored — and **never** granted client-side.

## Restore
`runRestore(adapter, verify)` re-submits each owned transaction → server dedups (external-id unique) + enforces the
first-pack lifetime rule → grants once; finishes only server-confirmed ones. Response-loss recovery proven: a lost
verification (not finished) is recovered by a later restore → server grants exactly once.

## Duplicate Transaction Handling
Idempotent by external transaction id server-side; a duplicate/replay returns ok (already processed) → the client
finishes without a second grant. Tested.

## Client Authority Audit (§7)
Whole-repo scan: the ONLY client-callable Duk RPC is `light_candle` (by design — free reward, auth.uid, atomic
cooldown). **No** `grant_duk`/`spend_duk`/`reserve_session`/`commit_session`/`record_verified_purchase` client calls;
**no** direct client writes to `duk_ledger`/`duk_balance`/`duk_reserve`/`verified_purchases`/`duk_debt`; no
grant/credit/addBalance verb. `CLIENT_CAN_GRANT_DUK_DIRECTLY = NO`.

## Product Catalog Template
`scripts/staging/product_catalog_seed.TEMPLATE.sql` — placeholder store ids (`REPLACE_WITH_*`), locked server grant
amounts (First 20 lifetime-once / Base 50 / Large 120). **Not applied**; no fake/production-like ids seeded.

## Apple Future Setup Requirements (05B, deferred)
bundle `com.deokbun.app` · 3 consumable product ids · `APPLE_ENVIRONMENT` · App Store Server API key
(`APPLE_IAP_ISSUER_ID/KEY_ID/PRIVATE_KEY`) · ASSN V2 URL → `apple-notifications-v2`. All values UNSET.

## Google Future Setup Requirements (05B, deferred)
package `com.deokbun.app` · 3 one-time product ids · `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` · RTDN Pub/Sub +
`GOOGLE_PLAY_PUBSUB_AUDIENCE` → `google-rtdn`. All values UNSET.

## Tests
`src/features/duk/iap/__tests__/purchaseFlow.test.ts` — **13 tests** with store doubles: success, cancelled, pending
(native + server), invalid token/NOT_CONFIGURED, duplicate, verification retry, response-loss→restore→grant-once,
restore partial, NOT_AVAILABLE, network failure, and a no-grant-verb authority assertion. Duk suites overall
**9 suites / 88 tests pass**.

## Build
`tsc --noEmit` = 0. (Expo dev-build not run — IAP native module requires an EAS/dev build tied to 05B store setup;
the JS layer is fully type-checked + unit-tested.)

## Frozen Core
Frozen engine diff **ZERO** (myungri/saju/ziwei/qimen). Consultation semantic diff ZERO — this activation adds only
new IAP modules; no consultation/engine/decision/routing/price change.

## Economy Safety
Economy diagnostics **0 anomalies**. Prices (5/12/50), First Pack (20 Duk / ₩2900 hypothesis / lifetime-once),
spend order, welcome/candle — all unchanged.

## Production Mutations
**0.** No DB/secret/deploy this activation. Client TS + tests + template are uncommitted in main (HEAD `baa1a96`).

## Deferred 05B Items — DEFERRED_FOR_BUSINESS_ELIGIBILITY_DECISION
Apple paid seller setup · Google merchant setup · real store product creation · business/e-commerce registration ·
Apple paid agreements/tax · Google payments profile · real Apple Sandbox purchase · real Google License Test
purchase. (Preserving the intended applicant's pre-창업 / 예비창업자 eligibility for the 2027 program.)

## Owner Action Required
**None now.** 05A is autonomous-complete. 05B (store/business provisioning) is deferred by owner decision; do not
begin it. When the owner later decides eligibility timing, resume 05B → provide store ids + set staging secrets → I
seed the catalog + finalize the dev build + run the sandbox/license E2E.

---

### Exact verdicts
```
CLIENT_NATIVE_IAP_INTEGRATED   = PASS (integration layer + adapter + doubles; on-device dev-build finalization pending 05B)
CLIENT_CAN_GRANT_DUK_DIRECTLY  = NO
SERVER_VERIFICATION_REQUIRED   = YES
RESTORE_CLIENT_FLOW            = PASS
PURCHASE_FAILURE_SAFE          = PASS
PRODUCT_CATALOG_TEMPLATE_READY = YES
FROZEN_CONSULTATION_CORE       = YES
PRODUCTION_MUTATIONS           = 0
```

**READY_FOR_STORE_OWNER_PROVISIONING_LATER** — the client purchase flow (initiate → opaque token → server verify →
grant-once → finish; restore; all failure/pending/cancel paths) is integrated behind an SDK-agnostic seam, fully
unit-tested with doubles, and enforces hard server authority (no client grant). Store/business provisioning + the
on-device dev-build verification are deferred (05B) to preserve applicant eligibility. No production touched.

OWNER_ACTIVATION_05A_COMPLETE
