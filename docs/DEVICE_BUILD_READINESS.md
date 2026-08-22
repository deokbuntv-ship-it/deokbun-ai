# Development / Internal Device Build Readiness (Batch 3 §3)

Goal: prepare an EAS **development / internal (staging)** build WITHOUT any Store seller setup, business registration, or production deploy. Store IAP stays deferred (05B); push/email stay NOT_CONFIGURED-safe.

## §3.1 EAS / native audit
- `eas.json` (added J7): `development` (dev client, internal dist, `EXPO_PUBLIC_APP_ENV=development`), `staging` (internal dist, `=staging`), `production` (store dist, `=production`).
- `app.json`: scheme `deokbunai`; iOS `com.deokbun.app` / Android `com.deokbun.app`; plugins now include `expo-notifications`. **Still needed (owner):** `runtimeVersion` + EAS `projectId`/`updates`; reconcile `com.deokbun.app` vs the IAP test's `com.deokbuni.app`.
- Native modules forcing a dev/EAS build (Expo Go insufficient): reanimated 4 / worklets, gesture-handler, screens, `@expo/ui`, expo-glass-effect, expo-device, and now **expo-notifications** (added) + **react-native-iap** (05A seam, still to `expo install`).

## §3.2 Development build profile → STAGING only
- Build with `eas build --profile development` after setting the profile's EAS env: `EXPO_PUBLIC_SUPABASE_URL`/`_PUBLISHABLE_KEY` = STAGING (`aephpsiurgkvqcswyeie`), `EXPO_PUBLIC_APP_ENV=development` (already pinned).
- The **env cross-target guard** (`assertEnvironmentConsistency`) stays active — a staging/dev build pointing at the prod ref throws at startup. Admin bar shows the real env (`개발`/`스테이징`).

## §3.3 Internal build profile
- `eas build --profile staging` → `EXPO_PUBLIC_APP_ENV=staging`, STAGING backend, internal distribution. Non-production identity visible (admin bar + fail-fast). No silent production fallback. IAP real store disabled; push/email NOT_CONFIGURED-safe.

## §3.4 Native IAP preservation
- `react-native-iap` remains a **lazy guarded require** (`reactNativeIapAdapter`), so the current bundle builds without it. To include it in a dev build: `npx expo install react-native-iap` + its config plugin. **No product ids, no seller setup, no transactions** — server `verify-purchase` Edge remains the only grant authority; the client cannot grant. Purchase flow stays inert until 05B.

## §3.5 OAuth readiness
- **CODE_COMPLETE:** `expo-auth-session`/`expo-web-browser`/`expo-linking` present; redirect wiring (`authRedirect`, `login-callback`) done; native scheme `deokbunai://login-callback`.
- **EXTERNAL_ACCOUNT_CONFIG_REQUIRED (owner):** provider client ids/secrets (Naver/Kakao/Google) + Supabase Auth provider config + allowed redirect URIs for the staging build. `STAGING_OAUTH_LIVE = EXTERNAL_BLOCKED` until then. No production credentials configured here.

## §3.6 Device smoke sequence (run on the staging dev/internal build)
Concise happy-path order (full matrix: `docs/DEVICE_QA_MATRIX.md`):
1. launch → onboarding gate (no blank) 2. OAuth login (staging) 3. terms consent 4. birth info → SELF 5. Welcome **+10덕** 6. Home 덕 chip 7. wallet → candle **+1덕** 8. general consultation **−5덕** (answer + AI disclosure) 9. follow-up (remaining turns) 10. compatibility insufficient at 11덕 (paywall) 11. Today 12. Monthly 13. mailbox 14. MY (profile/policies/logout) 15. birthday card (if applicable) 16. notifications bell 17. logout → devices disabled → re-login.
Birthday **+5덕** and push delivery are validated server-side (staging) / require the push provider respectively; do NOT claim real-device PASS without a device run.

**Verdict:** `STAGING_DEV_BUILD_READY = PASS` (config + native deps declared + env guard active). Remaining to actually build/login on a device = owner (EAS env + credentials + `eas build`); `DEVICE_QA = NOT_RUN`.
