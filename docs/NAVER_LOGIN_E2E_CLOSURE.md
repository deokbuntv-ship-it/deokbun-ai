# Naver Web Login E2E — Failure Analysis & Closure (Overnight Sprint §1)

**Symptom (production web):** Naver login → return to app → `/login` shows
"로그인에 실패했습니다. 다시 시도해 주세요." (generic).

**HEAD:** this analysis + the code fixes below are committed locally on
`admin/master-operations-content`. No deploy performed.

---

## 1. Root-cause classification

The full client→edge→Supabase chain was traced statically (no live secrets). The
failure is **most likely category B/D (environment / Naver-console config)**, not a
logic bug in the flow itself — the pure flow units (authorize URL, callback parse,
CSRF state, identity policy) are all unit-tested and correct.

Two compounding **application-level defects** were found and fixed in code:

| # | Defect | Fix (this commit) |
|---|---|---|
| D1 | `AuthContext.signInWithProvider` collapsed the rich `AuthActionResult.reason` to a bare boolean, so **every** failure showed one generic message — undiagnosable, and the specific messages in `authErrors.ts` were dead code. | Return the full `AuthActionResult`; `login.tsx` now maps `reason → outcome → specific Korean message` (config-required / account-conflict / session-failed / provider-error), silent on cancel. |
| D2 | The Naver **web** `redirect_uri` used a bare `makeRedirectUri()` = the serving origin (apex vs www vs preview), unlike google/kakao which **pin** to the canonical origin. If the serving origin ≠ the Naver-console-registered callback, authorize fails. | Naver now uses the same `resolveConfiguredWebRedirect(getPublicBaseUrl(), isWeb)` pinning as google/kakao → deterministic `${EXPO_PUBLIC_PUBLIC_BASE_URL}/login-callback`. |
| D3 | Client logged **nothing** — no way to see which stage failed in production. | Added a safe `[auth.diag]` breadcrumb (`provider/stage/code/requestId`, **never** tokens/codes/URLs/PII — constitution §20) at every Naver failure stage + the surfaced outcome. |

These fixes make the failure **diagnosable and truthful**, but the *underlying*
production trigger is almost certainly one of the OWNER-only items below (the code
cannot set external secrets or register console callbacks).

---

## 2. OWNER_ACTION_REQUIRED (external config — in priority order)

The client and edge use **separate** Naver client-id env vars that **must be the
same Naver application**:
- Client build: `EXPO_PUBLIC_NAVER_CLIENT_ID`
- Edge secret: `NAVER_CLIENT_ID` (+ `NAVER_CLIENT_SECRET`)

### A. Supabase Edge secrets (most likely cause) — `naver-auth` function
Verify these are set for the project (Supabase Dashboard → Edge Functions → Secrets,
or CLI). Missing → edge returns `500 SERVER_NOT_CONFIGURED`; wrong client → `401
NAVER_TOKEN_EXCHANGE_FAILED`. Both surface as the generic message.
- `NAVER_CLIENT_ID` — must equal the client's `EXPO_PUBLIC_NAVER_CLIENT_ID`.
- `NAVER_CLIENT_SECRET` — the matching secret from the Naver console.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — normally auto-injected.

Verify (does not print secret values):
```bash
npx supabase secrets list
```
Expected: `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET` present.

### B. Naver Developers console — Callback URL
Naver Developers → your application → API 설정 → 서비스 URL / Callback URL.
Register **exactly** (must match the now-pinned client value, byte-for-byte):
- Web: `https://www.deokbunai.com/login-callback`
- (If a native build uses the app scheme: `deokbunai://login-callback`.)

### C. Build-time client env (Vercel / EAS)
- `EXPO_PUBLIC_NAVER_CLIENT_ID` — set (currently NOT in local `.env`; expected in
  the deploy env).
- `EXPO_PUBLIC_PUBLIC_BASE_URL` — must be `https://www.deokbunai.com` so the pinned
  redirect resolves to the registered callback. If unset on web, the redirect falls
  back to the serving origin (the pre-fix behavior).

### D. Naver app review / email scope
If the Naver app has not been granted the **email** scope (or the user declines it),
the edge returns `422 EMAIL_REQUIRED` (it never fabricates an email). Ensure the
Naver app requests and is approved for the email field.

---

## 3. How to confirm the exact stage after deploy

After redeploying the client + `naver-auth` edge:
1. **Client:** browser devtools console will show `[auth.diag] provider=naver
   stage=<...> code=<...> req=<...>` at the failing step (no sensitive data).
2. **Edge:** `npx supabase functions logs naver-auth` shows the stage `console.error`
   markers (`token exchange rejected`, `profile invalid`, etc.).
Map: `stage=authorize` → console/redirect; `stage=edge_invoke` → edge secrets or
Naver token/profile; `stage=session_set` → Supabase session mint.

---

## 4. First-login vs repeat-login vs session persistence

- **First login:** edge `createUser` with `app_metadata.provider='naver'` + `naver_id`.
- **Repeat login:** same Naver identity → `decideNaverLink` → `proceed` (unit-tested).
- **Account conflict:** email owned by a google/kakao account → `403 ACCOUNT_CONFLICT`
  → now shows the specific "이미 다른 방법으로 가입된 계정" message (was generic).
- **Session persistence:** unchanged — AsyncStorage single client (`persistSession:true`,
  `autoRefreshToken:true`, `detectSessionInUrl:false`); the bridge sets the session
  via `supabase.auth.setSession`, `onAuthStateChange` flips state.

No `git push` / no deploy / no secret change performed by this sprint.
