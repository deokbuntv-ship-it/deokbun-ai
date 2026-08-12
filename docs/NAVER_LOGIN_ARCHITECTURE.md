# DeokbunAI — Naver Login Architecture (V1.0)

> Naver Login Authentication Sprint (directive §4). How 네이버 아이디로 로그인 plugs
> into the EXISTING Supabase auth stack. Verified against official docs
> (supabase.com/docs, developers.naver.com, docs.expo.dev/versions/v57.0.0).
> DeokbunAI user id stays `auth.users.id` for every provider. No engine/UI change.

## 0. Official capability verdict (§3)

| Question | Finding (official) |
|---|---|
| Built-in Supabase `naver` provider? | **No.** Kakao/Google are built-in; Naver is absent from the provider set. |
| `signInWithIdToken` supports Naver? | **No** (accepts google/apple/azure/facebook/kakao — Naver is not among them). |
| Naver OIDC-compliant? | **No — plain OAuth 2.0 only.** No `id_token`, no discovery/issuer, no request-time `scope`; identity comes from a separate profile API (`/v1/nid/me`), nested under `response.id`. |
| ⇒ Supabase **generic OIDC** custom provider? | **Cannot consume Naver** (needs a standard `id_token`/issuer). |
| ⇒ Supabase **custom OAuth2** provider (path B)? | Officially available; supply Naver authorize/token/userinfo URLs. **RISK (config-time, UNVERIFIED):** whether Supabase's OAuth2 mode can map Naver's non-standard nested `/v1/nid/me` (`response.id`, not `sub`). |
| ⇒ Trusted edge bridge (path C)? | **Guaranteed.** Edge exchanges code→token→profile, then Supabase Admin API + `generateLink`+`verifyOtp` to mint a real session. |

## 1. Decision — B first, C as the ready fallback

**Attempt B (Supabase Custom OAuth2 provider) first**, because it costs zero code/secret-handling/deploy and reuses the exact kakao/google flow:
- Naver is configured in the **Supabase Dashboard** as a custom OAuth2 provider named `naver` (invoked as `custom:naver`).
- Naver's `client_id`/`client_secret` live **only in the Supabase Dashboard** — Supabase performs the code exchange server-side. **Our app never touches a Naver secret** (identical trust model to kakao/google today).
- Client code is already implemented (see §3) and calls `signInWithOAuth({ provider: 'custom:naver' })`.

**If B fails the userinfo mapping at config time** (a real possibility given Naver's nested response), **fall back to C** — a trusted `service_role` edge bridge (designed in §5, not yet built per directive §17 "only if required"). The Owner determines B-vs-C by configuring and smoke-testing the custom provider (see OWNER_ACTIONS §Naver).

## 2. User-identity model (unchanged)

```
Naver → OAuth2 → (Supabase custom provider OR edge bridge) → Supabase Auth session
      → auth.users.id  ← THE DeokbunAI user id (RLS, profiles, subjects, consultations)
```
- The **DeokbunAI user id is always `auth.users.id`.** Naver's `response.id` (a per-app stable unique identifier, returned as a string — the correct account key) is stored ONLY as identity/`app_metadata` — never used as the app user id, never in a separate user table.
- Profile creation reuses `profileService.ensureProfile` (idempotent upsert keyed by `auth.users.id`, stores only `{id, display_name}` — never email/tokens). No provider-specific profile table.

## 3. Client code (path B — implemented, committed)

All additive, isolated to `src/features/auth/**`; kakao/google behaviour unchanged:

| File | Role |
|---|---|
| `services/authProviders.ts` | PURE `resolveSupabaseProvider(id)` — kakao/google→built-in, naver→`custom:naver` (slug overridable, `custom:` prefix enforced). |
| `services/authService.ts` | `signInWithProvider` routes ALL providers through the SAME flow: `signInWithOAuth` → `WebBrowser.openAuthSessionAsync` → parse tokens → `setSession`. Only the resolved provider id differs. |
| `errors/authErrors.ts` | Auth outcome vocabulary + Korean messages, normalized INTO the app Error Contract (reuses NETWORK_ERROR/FORBIDDEN/AUTH_REQUIRED). |
| `services/authIdentity.ts` | `resolveIdentityCollision` — never auto-merge by email (§10). |
| `context/AuthContext.tsx` | **Unchanged** — provider-neutral; reacts to `onAuthStateChange`/`setSession`. |

## 4. Callback + state/CSRF (§15/§16) — path B

- **CSRF/state + PKCE** are handled by **Supabase's OAuth pipeline** (PKCE is default for custom providers). We do NOT hand-roll weak state validation.
- **Callback parsing** reuses the existing `authService` code (`QueryParams.getQueryParams` → `access_token`/`refresh_token` → `setSession`). No new callback code for path B.
- **Redirect URIs** (Expo SDK 57, confirmed): web = `window.location`-based; native = `deokbunai://login-callback`. Values to allow-list are in OWNER_ACTIONS.
- **Naver Callback URL** registered in the Naver console = **Supabase's callback** `https://olvkpaldrwvtexxpoaag.supabase.co/auth/v1/callback` (Supabase, not the app, is Naver's redirect target in path B).

## 5. Path C fallback design (edge bridge) — NOT built yet (§17)

Only if B's userinfo mapping fails. Sketch (all server-side secrets; `verify_jwt=false` since the user has no Supabase JWT yet at login):
1. Client opens Naver `authorize` (client_id, redirect_uri=edge/app callback, crypto-safe `state`) via WebBrowser.
2. Naver redirects with `code`+`state`; client posts them to a `naver-auth` edge function.
3. Edge verifies `state`, exchanges `code`→token at `/oauth2.0/token` using `NAVER_CLIENT_SECRET` (server-only), fetches `/v1/nid/me`.
4. Edge keys on `response.id`: `admin.listUsers`/lookup → `admin.createUser({ email?, email_confirm:true, app_metadata:{ provider:'naver', naver_id } })` or `admin.updateUserById` to link; applies `resolveIdentityCollision` (no auto-merge).
5. Edge `admin.generateLink({ type:'magiclink', email })` → `auth.verifyOtp({ token_hash, type:'email' })` → returns `access_token`+`refresh_token`; client `setSession`.

Constraints: **NO arbitrary JWT minting** (only the official generateLink+verifyOtp path); **service_role never reaches the client**; email may be absent (key on `response.id`, `proceed_no_email`).

## 6. Readiness / gates

- **Web:** works today with `ios.bundleIdentifier`/`android.package` unset (web redirect uses `window.location`). Production domain confirmed: **https://www.deokbunai.com**. The static-web callback gap is **now CLOSED** — a provider-neutral `src/app/login-callback.tsx` route is implemented (generates `dist/login-callback.html`) so the OAuth popup completes + closes; it is token-free (the opener still does `setSession`). Shared by google/kakao/naver.
- **Native:** blocked until `ios.bundleIdentifier`/`android.package` are decided (needed to build a binary that registers `deokbunai://`). OWNER_DECISION_REQUIRED (see RELEASE_READINESS §Native).
- **Scopes (§9):** request ONLY the unique identifier (+ email as an optional item). Do NOT request birthday/gender/age/mobile. Birth info stays in the Subjects/BirthInfo flow (user-entered), never from Naver.

## 7. Status

**CODE_READY_OWNER_CONFIG_REQUIRED.** Client path B is implemented + tested; real Naver login requires Owner console config (Naver app + Supabase custom provider) and cannot be E2E-verified without it. Path C is designed and ready to build if B's config test fails.

## 8. E2E test plan (§26) — run AFTER Owner config (Step 1–3 in OWNER_ACTIONS §6)

All of these are **BLOCKED_OWNER** until the Naver app + Supabase custom provider
are configured; they cannot be executed by Claude (no live Naver credentials).

| # | Scenario | Expected |
|---|---|---|
| A | New Naver user signs in (web) | Supabase session created; `auth.users.id` set; profile row upserted; lands on `/` |
| B | Logout → sign in again with Naver | Same `auth.users.id`; no duplicate profile |
| C | Browser refresh / app relaunch | Session restored via `getSession`; stays authenticated |
| D | Naver user who DECLINED email | Login still succeeds; keyed on Naver `response.id`; email null tolerated |
| E | Naver email == existing google/kakao/email account | NOT auto-merged — `link_required` / distinct account per Supabase linking-off setting |
| F | User cancels the Naver OAuth popup | `AUTH_CANCELLED` (soft notice, no error banner); no session |
| G | Naver/provider returns an error | `AUTH_PROVIDER_ERROR` friendly message; no raw error surfaced; no session |
| H | Callback mismatch / missing tokens | `AUTH_SESSION_FAILED`; no partial/fake session |
| I | Authenticated Naver user opens Subjects | RLS allows own rows (`auth.uid() = owner`); works like kakao/google |
| J | Authenticated Naver user opens a Consultation | Chat/consultation works (edge `verify_jwt` accepts the session) |
| K | Logout → open a protected resource | Blocked (unauthenticated); auth guard redirects to login |

**B-vs-C gate:** if scenario A fails because Supabase cannot map Naver's
`/v1/nid/me` (`response.id`) profile, switch to path C (build the `naver-auth` edge
bridge per §5). Native scenarios additionally require the `deokbunai://` build
(identifiers decided).
