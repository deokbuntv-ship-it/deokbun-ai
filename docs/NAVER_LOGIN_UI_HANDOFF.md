# Naver Login — UI / Branding Handoff (for Claude Design)

> The consumer login screen (`src/app/login.tsx`) is frozen UI owned by Claude
> Design. Claude Code has made Naver login work end-to-end at the logic layer
> (`signInWithProvider('naver')`), but did NOT add a button or alter any styling.
> This doc lists ONLY the official requirements Design needs to place the button.

## 1. What is already wired (no logic work needed)

- `signInWithProvider('naver')` is fully implemented (path B via Supabase Custom
  OAuth). A button only needs to call the existing handler:
  ```tsx
  <Button label="네이버로 시작하기" onPress={() => handleLogin('naver')} disabled={isSigningIn} />
  ```
  `login.tsx` already has `handleLogin(providerId)` and imports `AuthProviderId`
  (which includes `'naver'`). This mirrors the existing kakao/google buttons.
- Optional: per-outcome error text is available via
  `authOutcomeMessage(code)` + `isSilentOutcome(code)` from `@/features/auth`
  (a cancelled login should show NO error banner). The screen currently shows one
  generic message; adopting these is a Design choice, not required.

## 2. Official Naver button branding (MUST follow — do not improvise)

Source of truth: **https://developers.naver.com/docs/login/bi/** ("로그인 버튼 사용 가이드").
Claude Code must NOT invent a Naver logo/color; use Naver's official assets.

- **Button types provided by Naver:** 완성형(full) / 축약형(abbreviated) / 아이콘형(icon)
  / 로그아웃형, each in **green** and **white**. Download the official AI/PNG assets.
- **Green button:** background **`#1EC800`** (RGB 30/200/0, CMYK 70/0/100/0,
  PANTONE 361); N-icon and label **`#FFFFFF`**.
- **White button:** background `#FFFFFF`; N-icon `#1EC800`; label `#999999`.
- **Font:** 나눔바른고딕 Bold (Nanum Barun Gothic Bold).
- **Label text:** may be adjusted in KO/EN as long as it means "네이버 아이디로 로그인 /
  Login with NAVER" (e.g. "네이버로 시작하기" is acceptable per the purpose rule).
- **Sizing:** width may flex to fit the label, **but the N-icon 유지 구간 (retention
  zone) aspect ratio must be preserved**; the Naver button should be similar in size
  and visual weight to the other providers' buttons on the screen.
- **Prohibited:** design changes that weaken Naver's identity (per guide §7).

## 3. Placement guidance

- Add the Naver button in the existing provider stack in `login.tsx`, consistent
  with the kakao/google buttons' spacing/order (Design's call on order).
- Keep the shared `Button` component's neutral styling OR use Naver's official
  branded button image — whichever the Design system prefers — but the Naver
  brand color/logo rules above take precedence for the Naver control specifically.

## 4. Related non-visual gap (route, not styling)

- **`src/app/login-callback.tsx` does not exist.** For **web (static export)** the
  OAuth redirect target `/login-callback` must resolve to a page that runs
  `WebBrowser.maybeCompleteAuthSession()` to close the popup. This affects
  kakao/google web equally (pre-existing), not just Naver. Because it is a route
  file under the frozen `src/app/**`, Claude Code did not create it — Design/owner
  should add a minimal `login-callback` route. Native does not require it
  (the auth session intercepts `deokbunai://login-callback`).
