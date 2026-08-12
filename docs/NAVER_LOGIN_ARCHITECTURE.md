# DeokbunAI — Naver Login Architecture (V1.0)

> How 네이버 아이디로 로그인 integrates with the existing Supabase auth stack.
> Verified against official docs (supabase.com/docs + auth-js/auth source,
> developers.naver.com, docs.expo.dev/versions/v57.0.0). DeokbunAI user id stays
> `auth.users.id` for every provider. No engine/UI-design change; google/kakao
> untouched.

## 0. Capability verdict (verified) — Supabase CANNOT consume Naver directly

| Question | Finding (official / source-verified) |
|---|---|
| Built-in Supabase `naver` provider? | **No** (kakao/google are built-in; naver absent). |
| `signInWithIdToken` supports Naver? | **No** (google/apple/azure/facebook/kakao only). |
| Naver OIDC-compliant? | **No — plain OAuth 2.0** (no `id_token`/issuer/discovery; identity via `/v1/nid/me`, nested under `response.id`). So Supabase generic-**OIDC** custom provider can't consume it. |
| Supabase **custom OAuth2** provider (issuer-less)? | The mode EXISTS, but it reads identity from the **TOP LEVEL** of the userinfo JSON (`sub`/`email`). Naver nests everything under `response.*`; Supabase's `applyAttributeMapping` does **flat single-key lookups only** (no nested paths), and the top-level `id→sub` remap is itself unmerged (open issue #2519). Result: **`missing provider id` error → NOT VIABLE.** |
| ⇒ Decision | **Trusted edge bridge** (`naver-auth` Edge Function). This is the officially-supported fallback for a provider Supabase can't natively integrate. |

> ⚠️ Correction of earlier drafts: a previous version of this doc proposed wiring
> Naver as a Supabase **custom OAuth2 provider** (`custom:naver`). That approach is
> **abandoned** — verified non-viable because of the nested-userinfo blocker above.
> The Owner's "Dashboard forces an Issuer URL" observation is a red herring; the
> real blocker is the userinfo shape, not the issuer.

## 1. Architecture — App → Naver → naver-auth Edge → Supabase session

```
App (signInWithNaverBridge)
  → open Naver authorize (public client_id + CSRF state) via WebBrowser
  → Naver redirects to /login-callback with ?code&state
  → client validates state, POSTs {code,state} to the naver-auth Edge Function
      Edge (verify_jwt=false; service_role + client_secret edge-only):
        validate → code→token (client_secret) → GET /v1/nid/me
        → normalize (response.id / email) → EMAIL REQUIRED (else fail closed)
        → find-or-create user (takeover guard) → naver_id in app_metadata
        → admin.generateLink(magiclink) → auth.verifyOtp → session
      returns { access_token, refresh_token }
  → client supabase.auth.setSession(...)  → normal Supabase session
      → auth.users.id  ← THE DeokbunAI user id (RLS, profiles, subjects, chat)
```

Session mint uses the ONLY officially-supported server path — there is **no
`admin.createSession`**; `generateLink(magiclink) → verifyOtp` returns a real,
refreshable session. **No hand-minted JWTs.**

## 2. Identity + email policy (§4/§10)

- **DeokbunAI user id = `auth.users.id`** always. Naver `response.id` (per-app
  unique string) is stored ONLY in `app_metadata.naver_id` — never the app user id.
- **No auto-merge by email (takeover guard):** `decideNaverLink` →
  `create` (new email) / `proceed` (same naver_id returning) / **`conflict` → 403**
  (email belongs to a different account). A colliding email is BLOCKED, never
  silently logged in.
- **Email REQUIRED:** GoTrue rejects email-less `createUser`, and `generateLink`
  magiclink needs an email. A Naver user who declined email **fails closed (422
  EMAIL_REQUIRED)** — NO fabricated `naver_x@…` email. The Owner should request the
  email item in the Naver console so this path succeeds.
- Profile reuses idempotent `profileService.ensureProfile` (`{id, display_name}`
  only; never email/tokens).

## 3. Code map

| Layer | File | Role |
|---|---|---|
| Client pure | `naver/naverConfig.ts` | public `client_id` reader (EXPO_PUBLIC), authorize/function names |
| Client pure | `naver/naverOAuth.ts` | `buildNaverAuthorizeUrl`, `parseNaverCallback`, `statesMatch` (runtime-safe, tested) |
| Client pure | `naver/naverProfile.ts` | `normalizeNaverProfile` contract (nested `response.id`, email-optional) — tested |
| Client pure | `naver/naverIdentity.ts` | `decideNaverLink` takeover guard — tested |
| Client I/O | `naver/naverAuthService.ts` | `signInWithNaverBridge`: crypto state → WebBrowser → parse+validate → invoke edge → `setSession` |
| Routing | `services/authService.ts` | naver → bridge; kakao/google → built-in `signInWithOAuth` (unchanged) |
| Edge | `supabase/functions/naver-auth/index.ts` | the trusted bridge (mirrors the two pure contracts inline; self-contained deploy) |
| Errors | `errors/authErrors.ts` | outcome vocabulary + Korean messages, normalized into the app Error Contract |

## 4. Callback + CSRF (§15/§16)

- **State/CSRF:** client generates a crypto-random `state` (`expo-crypto`), validates
  the returned state (`statesMatch`) before calling the edge; the edge forwards
  `state` to Naver's token endpoint, which rejects a mismatch. No weak hand-rolled
  check bypassing this.
- **Web callback:** reuses the provider-neutral `src/app/login-callback.tsx`
  (generates `login-callback.html`) — `WebBrowser` returns `code&state` to the
  opener; the route just completes/closes the popup. No token parsing in the route.
- **Redirect target:** the Naver Callback URL registered in the Naver console =
  `https://www.deokbunai.com/login-callback` (the app), NOT Supabase's callback
  (in the bridge model Naver redirects to the app, and the edge does the exchange).

## 5. Security (§10)

`client_secret` + `service_role` are edge-only (`Deno.env`), never in the client
bundle (enforced by a jest exposure scan). No logging of code/tokens/hashed_token/
email/raw profile (only failure stage markers). CORS `*` is not the trust boundary
(the Naver code exchange is). Fixed app-controlled redirect (no attacker redirect).

## 6. Readiness

- **Web:** works with identifiers unset (redirect uses `window.location`). Domain
  live: **https://www.deokbunai.com**. `/login-callback` route present.
- **Native:** blocked until `ios.bundleIdentifier`/`android.package` are decided
  (Naver web-OAuth to a `deokbunai://` scheme is also not a standard Naver web
  callback) — web-first. OWNER_DECISION_REQUIRED.
- **Scopes (§9):** request ONLY 이용자 고유 식별자 + email (optional item). NOT
  birthday/gender/age/mobile. Birth info stays in the Subjects flow.
- **Scaling note:** the edge finds users via paginated `listUsers` (bounded scan;
  no `getUserByEmail` in GoTrue) — fine for V1 user counts.

## 7. Status — ✅ PRODUCTION E2E VERIFIED (2026-08-12)

Naver login is **live and end-to-end verified in Production** (`https://www.deokbunai.com`,
2026-08-12): 네이버 버튼 → 인증/동의 → OAuth callback → `/login-callback` → `naver-auth`
edge → **Supabase 세션 생성 → 로그인 성공**. Owner setup complete: Naver app registered,
`naver-auth` deployed, `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET` Edge secrets set,
`EXPO_PUBLIC_NAVER_CLIENT_ID` in Vercel, app callback URL registered. Two Vercel
static-serving fixes were required and applied: `outputDirectory=dist` (`753af6d`) and
`cleanUrls:true` (`0693e07`). **The Naver client + edge code is complete and frozen —
do not modify it without cause.** Remaining optional: native (iOS/Android) login is
gated on `ios.bundleIdentifier`/`android.package` (currently web-only); official green
Naver button branding (see NAVER_LOGIN_UI_HANDOFF.md).

## 8. E2E test plan — run AFTER Owner deploy + config (BLOCKED_OWNER)

| # | Scenario | Expected |
|---|---|---|
| A | New Naver user (email provided) signs in on web | edge creates user; session; lands `/` |
| B | Logout → sign in again | same `auth.users.id` (proceed via naver_id); no dup |
| C | Browser refresh / relaunch | session restored (`getSession`) |
| D | Naver user who DECLINED email | **fails closed** (422 EMAIL_REQUIRED) — no fake email |
| E | Naver email == existing google/kakao account | **403 ACCOUNT_CONFLICT** — blocked, no takeover |
| F | Cancel the Naver popup | `AUTH_CANCELLED` soft notice; no session |
| G | Naver/provider error or bad state | friendly error; no raw error/token; no session |
| H | Missing code / CSRF state mismatch | rejected; no partial session |
| I | Authenticated Naver user opens Subjects | RLS allows own rows (like kakao/google) |
| J | Authenticated Naver user opens a Consultation | chat edge accepts the session |
| K | Logout → protected resource | blocked; guard redirects to login |

Native scenarios additionally require the `deokbunai://` build (identifiers decided).
