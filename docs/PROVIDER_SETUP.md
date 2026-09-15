# Provider & Environment Setup Contract (Batch 3 §2.4)

Env variable **names** and where to set them. **No secret values here** — the owner sets real values in the Supabase dashboard / EAS, never in the repo. All providers are FAIL-CLOSED: absent config → NOT_CONFIGURED, never a fabricated SENT.

## Client (per EAS build profile — set as EAS env / build-time `EXPO_PUBLIC_*`)
| Name | Purpose | Notes |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | staging vs prod URL per profile; the env contract fails fast on a mismatch with `EXPO_PUBLIC_APP_ENV` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | anon/publishable key | client-safe by design (never the service role) |
| `EXPO_PUBLIC_APP_ENV` | `development`/`staging`/`production` | pinned per `eas.json` profile |
| `EXPO_PUBLIC_PUBLIC_BASE_URL` | web OAuth redirect base | web login-callback |
| `EXPO_PUBLIC_NAVER_CLIENT_ID` | Naver OAuth client id (public) | login |

## Push (Supabase Edge secrets + native build)
| Name | Where | Purpose |
|---|---|---|
| `CRON_SECRET` | Edge secret | required to enable the worker endpoints (fail-closed 401 without it) |
| `PUSH_PROVIDER=expo` | Edge secret | activates the Expo push send adapter in `run-scheduled-notifications`/`retry-notification-deliveries` |
| FCM `google-services.json` | native (Android) | required for real Android delivery (dev/EAS build) |
| APNs key (`.p8`) + key id + team id | native (iOS, EAS credentials) | required for real iOS delivery |
| (client) `expo-notifications` | package + app.json plugin (added) | acquires the Expo push token on device |

Client token acquisition: `expoTokenAcquirer` (added) — call `registerForPush(deviceId, expoTokenAcquirer)` contextually (post-onboarding / notification settings), NOT at cold start. Fail-closed until the native module + a dev build exist.

## Email (Supabase Edge secrets)
| Name | Where | Purpose |
|---|---|---|
| `EMAIL_PROVIDER=resend` | Edge secret | selects the Resend adapter (one optional impl; domain stays provider-independent) |
| `RESEND_API_KEY` | Edge secret | Resend API key (fail-closed without it) |
| `EMAIL_FROM` | Edge secret | verified sender address |

To use a different vendor, add its adapter behind `EMAIL_PROVIDER=<vendor>` in `run-email-campaigns`/`retry-email-deliveries` `sendEmail` (the domain interface is unchanged).

## OAuth (provider consoles + Edge secrets)
| Provider | Names | Where |
|---|---|---|
| Naver | `EXPO_PUBLIC_NAVER_CLIENT_ID` (client) + `NAVER_CLIENT_SECRET` (Edge `naver-auth`) | Naver dev console + Edge secret |
| Kakao / Google | provider client id/secret | provider console + Supabase Auth provider config |
| Redirect | `deokbunai://login-callback` (native) + `${EXPO_PUBLIC_PUBLIC_BASE_URL}/login-callback` (web) | provider allowed-redirects |

## Scheduling
Enable cron only after `CRON_SECRET` is set — see `docs/RETENTION_WORKERS_RUNBOOK.md` (pg_cron or scheduled functions). Not activated by this batch.

**Live status:** PUSH_PROVIDER_LIVE / EMAIL_PROVIDER_LIVE / STAGING_OAUTH_LIVE = EXTERNAL_BLOCKED (need the accounts/credentials + a dev build). All the CODE + config seams are in place and fail-closed.
