# DeokbunAI — Staging Device & Live-Provider Activation Guide (Sprint J8)

Owner-runnable playbook to take the staging build LIVE on a device + validate push/email with controlled single targets. No Store, no business, no production. All secret values are set in consoles/CLI — never in the repo or chat.

## 0. Minimum viable live set (smallest safe path)
- **OAuth:** **Google alone** is enough to validate the full authenticated staging flow (built-in Supabase provider, no client secret, no edge). Add Kakao only for KR testers. Naver is web-verified (native scheme non-standard → defer). Apple not required for internal distribution.
- **Push:** EAS dev/internal build + `eas init` (projectId) + `PUSH_PROVIDER=expo` + `CRON_SECRET` + FCM/APNs credentials.
- **Email:** just Edge secrets (`EMAIL_PROVIDER=resend` + `RESEND_API_KEY` + `EMAIL_FROM`) + one campaign — no app build needed.

## 1. OAuth (Google) — callback contract
Register in the Google Cloud OAuth client **Authorized redirect URI** = Supabase's callback:
`https://aephpsiurgkvqcswyeie.supabase.co/auth/v1/callback` (staging).
In Supabase Auth → Providers: enable Google + paste client id/secret (server-side). In Supabase Auth → URL Configuration → **Redirect URLs allowlist** add: `deokbunai://login-callback`, `https://www.deokbunai.com/login-callback`, and the local dev origin. (If a redirect isn't allowlisted, Supabase silently falls back to Site URL — a known trap.)
The app builds the redirect via `resolveConfiguredWebRedirect(...) ?? makeRedirectUri({ path: 'login-callback' })`; native → `deokbunai://login-callback`.

## 2. Push — controlled single-device live proof (§J8.8/§15)
Client is now wired: MY → 알림 설정 → **기기 알림 켜기** calls `registerForPush(deviceId, expoTokenAcquirer)` (contextual, not cold-start); logout disables the device.
Owner steps:
1. `eas init` → set `extra.eas.projectId` in app.json (Blocker: token needs it). Add FCM `google-services.json` (Android) + APNs `.p8`/key-id/team-id (iOS) in EAS credentials.
2. `eas build --profile staging` (targets staging ref, pinned in eas.json). Install on ONE device.
3. Edge secrets (staging): `CRON_SECRET`, `PUSH_PROVIDER=expo`. Deploy `run-scheduled-notifications`.
4. On the device: log in → MY → 알림 설정 → 기기 알림 켜기 → grant permission → a token registers in `push_devices` for that ONE user. Ensure it is the only enabled token-bearing device in staging.
5. Set that user's SELF birthday = today (or invoke `run_birthday_notifications('<their-birthday>')` with the cron secret). Exactly one PENDING push is claimed + sent to that token; others without a token → SKIPPED_NO_TOKEN.
6. Proof: device receives → tap → deep-links to /monthly → `notification_deliveries` row for that user shows `channel='push', status='SENT'`.
**Do NOT bulk-send.** The lone enabled token is the deterministic single-target selector.

## 3. Email — controlled single-recipient live proof (§J8.8/§16)
Owner steps:
1. Edge secrets (staging): `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` (a verified sender; Resend's onboarding sender can only deliver to the account owner's own address — a convenient natural single-target guard). Deploy `run-email-campaigns`.
2. Make the audience size 1: pick a `(year, month)` for which **exactly one** staging user has a `monthly_fortunes` digest (seed/generate one test fortune in an otherwise-empty month).
3. Admin console (운세우편 관리): create campaign → build recipients → **verify `pending == 1`** → run. Invoke `run-email-campaigns` with the `x-cron-secret` header (no cron needed for a one-shot).
4. Proof: the one designated inbox receives → `email_deliveries` shows `status='SENT'`; re-run → no double-send (PENDING-guard).
**Never target a production or bulk audience.**

## 4. Device QA runner (§J8.12) — ordered, evidence per step
Run on the staging build; for each: ACTION → EXPECTED → PASS evidence / FAIL evidence.
| # | Action | Expected | Pass evidence | Fail evidence |
|---|---|---|---|---|
| A | Install + launch | Onboarding gate, no blank | screenshot of first screen | blank/crash |
| B | Check env identity | Admin bar shows 스테이징 (if admin) / non-prod | screenshot | shows 운영 |
| C | Google login | Returns authenticated | lands on onboarding | dead callback |
| D | Onboarding terms | Consent saved | proceeds to birth | stuck |
| E | Birth info | SELF created | proceeds to Home | validation loop |
| F | Welcome | "+10덕" card | screenshot of card | no card |
| G | Home 덕 chip | Balance shown | chip visible | error/0 wrongly |
| H | Candle | +1덕, then cooldown | balance +1 | no change |
| I | General consultation | −5덕, answer + AI disclosure | balance −5, disclosure text | over/under charge |
| J | Follow-up | Answered, turn hint | remaining-turns copy | re-charged |
| K | Turn limit | "모두 사용" at limit | copy shown | over-charge |
| L | Compatibility entry | "12덕 필요" before start | price copy | missing |
| M | Insufficient at 11 | Actionable paywall → /wallet | paywall (not generic error) | dead-end |
| N | Today | Loads + disclosure | screenshot | blank/raw error |
| O | Monthly | Loads + disclosure | screenshot | blank |
| P | Mailbox | Records list / empty | list or honest empty | crash |
| Q | MY | Profile/policies/logout | rows visible | dead link |
| R | AI notice | /ai-notice renders | screenshot | missing |
| S | Notifications bell | Unread/read/open | deep-links correctly | dead link |
| T | Birthday (set today) | Card + +5덕 + notification | balance +5, card, notif | no grant |
| U | Background/resume | State preserved | resumes | reset/crash |
| V | Offline mid-request | Recoverable error + retry | retry works, no raw error | raw error/crash |
| W | Logout → login | Devices disabled, re-auth clean | push_devices disabled | session leak |
| X | Deep links | Each opens the right screen | correct route | dead end |

## 5. Analytics live gate (§J8.13/§17) — verify post-device (no PII)
After the device flow, confirm these appear in `product_events` (categorical only, no PII): `candle_lit`, `consultation_started`, `consultation_completed`, `compatibility_insufficient_duk`. Do NOT mark `CLIENT_ANALYTICS_LIVE = PASS` until an actual staging-device/OAuth run produces them → until then it stays `DEFERRED_MONITORING_GATE`.

## 6. What NOT to share
Never paste into chat: `RESEND_API_KEY`, `NAVER_CLIENT_SECRET`, Google/Kakao client secrets, APNs `.p8`, `google-services.json`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`. Set them only in the provider console / Supabase dashboard / EAS. Return only PASS/FAIL evidence (screenshots, delivery-status rows).
