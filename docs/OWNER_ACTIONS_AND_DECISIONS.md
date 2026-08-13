# Owner Actions & Decisions — DeokbunAI (Claude app track)

Single operational reference for the non-developer owner. Split into: (1) USER
ACTIONS you run now, (2) OWNER DECISIONS (cost/lock-in — no default chosen),
(3) inventories, (4) a manual smoke script. Nothing here contains secret values.

---

> 📌 전체 V1.0 상태 + Owner Action 요약의 단일 기준선:
> [`DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md`](DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md) §22.

## 1. USER ACTION QUEUE (run now)

### A. Supabase SQL Editor (paste file contents, run)
Already applied per your report: `ADMIN_SETUP`, `ADMIN_02..05`, `CONTENT_01`,
`PUBLIC_SETUP`, `PUBLICATION_SETUP`, `CONTENT_ASSETS_SETUP`, `CONTENT_05_07_SETUP`,
`FAMOUS_AI_SETUP`. **Do not re-run those.**

**New / pending:**
1. `docs/admin/ADMIN_04_UPDATE_usage_filter.sql` — AI-usage 유형 필터 (backward
   compatible; the unfiltered list already works without it).
2. `docs/admin/IMAGE_STORAGE_SETUP.sql` — creates the public `content-media`
   Storage bucket (+ admin-write / public-read policies) for AI-generated images.
3. `docs/admin/PUBLIC_UPDATE_search_alt.sql` — adds `content_items.hero_alt`
   (image alt text) + `/content` search (`public_list_content` p_search;
   backward compatible — the search-less list already works without it).
4. `docs/admin/VIDEO_SETUP.sql` — adds `content_items.video_url` (applied video)
   + exposes it via `public_get_content` (public video seam).
5. `docs/admin/SCHEDULER_SETUP.sql` — `admin_list_scheduled_publications` RPC
   (read-only pipeline view for `/admin/publications`; no execution).
6. `docs/admin/DASHBOARD_TRENDS_SETUP.sql` — `admin_daily_activity` RPC
   (real 30-day trend charts on `/admin`; charts show unavailable until applied).
7. `docs/CONSULTATION_INTELLIGENCE_DB.sql` — **HOLD / do NOT apply yet.** Creates the
   Consultation Intelligence tables (runs / assessment_items / quality_reviews /
   user_feedback / outcomes) + RLS + admin Inspector RPCs. No application code writes
   these until the engine→assessment pipeline (Codex) ships — applying now just makes
   empty tables. Apply together with that pipeline. Idempotent/additive; safe to
   re-read. See `docs/CONSULTATION_INTELLIGENCE_V1.md`.

### B. Edge deploy (CMD / terminal)
```bash
npx supabase functions deploy content-generate --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy media-generate --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy video-generate --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy video-status --project-ref olvkpaldrwvtexxpoaag
```
`content-generate` redeploy is needed for the AI-workload layer (P0-7).
`media-generate` is the image generation function (reuses `OPENAI_API_KEY`).
`video-generate`/`video-status` are the NEW async video functions (need
`GEMINI_API_KEY` — see §2B).
`famous-suggest` is already deployed; redeploy only if you change its code.

### C. Environment variables (enables canonical URLs + sitemap + OG)
Client-safe (not secret). Production domain is now confirmed: **https://www.deokbunai.com**.
- **Vercel** → Project → Settings → Environment Variables → add
  `EXPO_PUBLIC_PUBLIC_BASE_URL` = `https://www.deokbunai.com` (Production; also
  Preview if desired) → **redeploy** (EXPO_PUBLIC_* is inlined at build time).
- Until set: canonical URLs are omitted and the sitemap generator skips (no fake
  domain — intended). This does NOT affect OAuth (OAuth uses `window.location`).
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are already
  set in Vercel (confirmed).

### D. Sitemap (before a production web export, after C)
```bash
node scripts/generate-sitemap.mjs
```

---

## 2. OWNER DECISION QUEUE (cost / lock-in — you choose)

### A. Image generation provider (CONTENT-03) — ✅ DECIDED & IMPLEMENTED
**Approved:** `IMAGE_STANDARD` = **OpenAI, quality LOW** (reuses `OPENAI_API_KEY`).
Implemented via the `media-generate` Edge Function (server resolves provider/model/
quality — never hardcoded in UI/DB) → persists to Supabase Storage → records
`content_assets` provenance. Admin generates from `/admin/content/[id]` → preview →
apply as hero (no auto-apply). Provider is swappable later via server config only
(`IMAGE_STANDARD_PROVIDER` / `IMAGE_STANDARD_MODEL` / `IMAGE_STANDARD_QUALITY`).
`IMAGE_PREMIUM` remains `NOT_CONFIGURED` (future seam). Run §1.A(2) SQL + §1.B
`media-generate` deploy to activate.

### B. Video generation provider (CONTENT-06) — ✅ DECIDED & IMPLEMENTED
**Approved:** `VIDEO_STANDARD` = **Google Veo** (short-form, 720p, native audio
OFF). Verified against current Google docs → default model
**`veo-3.1-fast-generate-001`** (the cost-efficient production variant; there is no
official "Lite" id), 8-second clips, aspect 9:16/16:9, async
`:predictLongRunning` + operation polling. Implemented via `video-generate`
(start) + `video-status` (poll → Supabase Storage). Provider/model/resolution/
duration are server config only (`VIDEO_STANDARD_MODEL` etc.) — swappable without
UI/DB changes. `VIDEO_PREMIUM` stays `NOT_CONFIGURED`.

**Google setup (USER ACTION — Gemini API, chosen for simple API-key auth):**
1. Open **Google AI Studio** (aistudio.google.com) with your Google account →
   **Get API key** (creates/links a Google Cloud project).
2. **Enable billing** on that Cloud project — Veo is a paid model.
3. Confirm the **Generative Language API** is enabled on the project.
4. Set the key as a Supabase secret (value never shown/committed):
   ```bash
   npx supabase secrets set GEMINI_API_KEY=YOUR_KEY --project-ref olvkpaldrwvtexxpoaag
   ```
5. Deploy `video-generate` + `video-status` (§1.B) and apply `VIDEO_SETUP.sql`
   (§1.A-4).
6. Smoke: `/admin/content/[id]` → **AI 영상 생성** → wait (processing, minutes) →
   preview → apply → `/content/{slug}` shows ▶ 영상 보기.
> Do NOT commit the key. If billing/model access is region-gated, the function
> fails closed with a clear error (no fake success).

### C. Instagram automatic publishing — go / no-go (CONTENT-05)
Requires Meta app + IG Professional account + FB Page + App Review (2–4 wks). See
the checklist in §3E. Until done, app shows `OAUTH_REQUIRED` + manual caption/record.

### D. Scheduler auto-publish authorization (CONTENT-07)
Schedule *persistence* works. Automatic external publishing (pg_cron→Edge) is
`DEPLOY_REQUIRED` and intentionally NOT enabled without your explicit approval.

### E. Production public domain — needed for canonical URLs + sitemap + OG.

### F. Dynamic-slug SEO prerender scope — see `docs/SEO_NOTES.md` (generateStaticParams).

### G. Fortune delivery provider (오늘의 운세 우편함) — ⛔ NOT DECIDED (V1 default = in-app only)
The fortune generation + delivery contracts exist and are truthful
(`src/features/fortune/domain/fortuneJobs.ts`), but **no push/email provider is
connected**. Until you choose one, delivery stays `not_configured` and the app
NEVER writes a fake `sent`. Options → tradeoffs:
- **In-app mailbox only (no external send)** — zero setup, no provider cost. The
  user sees new fortune mail when they open the app. **Recommended for V1.**
- **Push (Expo push / FCM+APNs)** — needs native build + device tokens + (iOS)
  Apple Developer account. Requires §H native identifiers first.
- **Email (transactional provider)** — needs a provider account + verified sender
  domain + `*_API_KEY` server secret.
To activate any external channel later: apply `docs/FORTUNE_DELIVERY_SETUP.sql`
(additive, owner-apply) and connect a provider behind `resolveDeliveryReadiness`.

### H. Native app identifiers (iOS/Android) — ⛔ DECISION_REQUIRED before any store/native build
`app.json` currently has **no `ios.bundleIdentifier` and no `android.package`**.
These are your permanent store identity (reverse-DNS, e.g. `com.yourcompany.deokbunai`)
and generally cannot be changed after first publish. Claude has intentionally NOT
set them — this is an owner branding/ownership decision. Web export works without
them; a native (EAS) build or store submission will fail until they are set. See
`docs/RELEASE_READINESS.md` §Native.

### I. AI cost pricing table — NOT_CONFIGURED (V1 shows cost = unknown, not ₩0)
The admin AI-cost view computes cost only from a verified pricing table
(`PricingRepository`). None is connected, so cost is reported as unknown/partial —
never a fake ₩0. To show real ₩ costs, supply an official price table
(provider/model/unit/prices) into `staticPricingRepository`. Token counts are always
shown; only the ₩ conversion waits on this.

---

## 3. Inventories

### 3A. Environment variable names (NAMES ONLY — never commit values)
- Client-safe: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `EXPO_PUBLIC_PUBLIC_BASE_URL` (optional).
- Edge-only (Supabase secrets): `OPENAI_API_KEY`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (auto-injected); optional
  `LLM_MODEL`, `CONTENT_LLM_MODEL`, `CONTENT_LLM_MAX_OUTPUT_TOKENS`,
  `PREMIUM_CONTENT_LLM_MODEL`, `PREMIUM_CONTENT_MAX_OUTPUT_TOKENS`,
  `IMAGE_STANDARD_PROVIDER`, `IMAGE_STANDARD_MODEL`, `IMAGE_STANDARD_QUALITY`
  (image defaults: openai / gpt-image-1 / low),
  **`GEMINI_API_KEY`** (video — required), optional `VIDEO_STANDARD_MODEL`,
  `VIDEO_STANDARD_RESOLUTION`, `VIDEO_STANDARD_DURATION`, `VIDEO_STANDARD_AUDIO`
  (video defaults: google-veo / veo-3.1-fast-generate-001 / 720p / 8 / off).
- Future provider-specific (only after you choose): image/video provider keys,
  Meta app id/secret + IG token — **edge/server-side only, never `EXPO_PUBLIC_*`.**

### 3B. Edge Functions
- `chat` — deployed.
- `content-generate` — deployed; **redeploy pending** (P0-7).
- `famous-suggest` — deployed.
- `media-generate` — **new; deploy pending** (image generation, OpenAI/LOW).
- `video-generate` / `video-status` — **new; deploy pending** (async video, Google Veo; needs `GEMINI_API_KEY`).

### 3C. SQL setup order (full)
Applied: `admin/ADMIN_SETUP` → `ADMIN_02..05` → `CONTENT_01` → `PUBLIC_SETUP` →
`PUBLICATION_SETUP` → `CONTENT_ASSETS_SETUP` → `CONTENT_05_07_SETUP` →
`FAMOUS_AI_SETUP`. Pending: `ADMIN_04_UPDATE_usage_filter`.

---

## 3E. Instagram official setup checklist (for §2C, when you decide go)
1. Meta developer account → create a **Business**-type Meta App.
2. Convert the Instagram account to **Professional (Business/Creator)**.
3. Create/att­ach a **Facebook Page** and link the IG account to it.
4. Add products: Instagram Graph API; request permissions **instagram_basic** +
   **instagram_content_publish** (and instagram_business_basic).
5. Configure OAuth redirect (server-side callback).
6. Submit **App Review** with a screencast per permission using a real IG
   Business/Creator account (2–4 weeks).
7. Store the App secret + long-lived access token as **server secrets only**
   (Supabase Function secrets) — never in the client / never `EXPO_PUBLIC_*`.
8. Publishing is 2-step: create media container → media_publish (200 calls/hr/app).

---

## 4. Manual smoke test script (non-developer, ~15 min)
1. **Auth/Admin:** log in as an admin → `/admin` loads with real metrics; a
   non-admin sees fail-closed.
2. **Famous + AI:** `/admin/famous` → 새 유명인 (name/slug) → **AI 제안 생성** →
   apply 한줄소개/소개/SEO/slug → note canonical preview → 저장.
3. **Content + AI + media:** `/admin/content` → 새 콘텐츠 (from Famous via
   "이 인물로 콘텐츠 만들기" or new) → **AI로 초안 생성** → 적용 → 미디어에 이미지
   URL 첨부 → **대표 이미지로 설정** → category + slug → 상태=발행 → 저장.
4. **Public:** open `/content/{slug}` → hero image + Markdown render + canonical;
   `/content` card shows hero; `/famous/{slug}` renders.
5. **Channels:** in content detail Publication panel → copy 네이버/인스타 캡션,
   record a manual publish URL, save a 예약; check 발행/예약 이력.
6. **Usage:** `/admin/ai-usage` → filter 콘텐츠 / Famous → rows with tokens.
7. **Filters/safety:** `/admin/content` status+category filter; archive/cancel
   shows a confirm.

Known limitations & remaining blockers: see `HANDOVER.md` §0 and `docs/SEO_NOTES.md`.

## 5. Authenticated visual QA — one enabler needed (UI/UX Phase 3)
The authenticated consumer-data screens (chat-with-messages, records, subject list,
my) and all `/admin/*` screens can only be visually inspected with a live logged-in
session. Automated tooling here has **no** connected browser session (the
Claude-for-Chrome extension is not connected to this account, and the in-app browser
has no session for `localhost:8081`). I will not extract cookies/tokens or log in
with your OAuth credentials.

**Minimal enabler (pick one):**
- **(A) Let me inspect it:** install/sign into the **Claude for Chrome** extension in
  the same Chrome where DeokbunAI is logged in, and connect it to this account. Then I
  can attach to your authenticated `/admin` tab (read-only structure/overflow checks;
  no credential handling) and complete the authenticated visual QA + polish.
- **(B) You inspect it:** run the manual QA in `HANDOVER.md` §0 note / prior report:
  logged-in @375 — chat/records/subject/my; admin @1440 — dashboard (KPI + 최근 30일
  추이 charts), users/detail, consultations, ai-usage, famous(+editor), content(+editor:
  AI/media/publication), publications — and report any issue.

Until (A) or (B): UI/UX MASTER SPRINT is **NOT COMPLETE** (authenticated screens
un-inspected). All no-auth screens are QA'd (public/home/login/birth-info/consult @375,
no overflow) and a real Markdown rendering bug was found + fixed.

---

## 6. NAVER LOGIN — OWNER SETUP (네이버 아이디로 로그인)

> ✅ **DONE — PRODUCTION E2E VERIFIED (2026-08-12).** All steps below were completed
> and Naver login works live on `https://www.deokbunai.com` (Naver app registered,
> `naver-auth` deployed, `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET` secrets set,
> `EXPO_PUBLIC_NAVER_CLIENT_ID` in Vercel). The steps are retained below as a
> reference/runbook. Nothing further required for web.

Client + Edge code are a **trusted edge bridge** (Naver cannot be a Supabase
provider, verified). Full design: `docs/NAVER_LOGIN_ARCHITECTURE.md`. Secret VALUES
are never shown to or handled by Claude.

### Step 1 — Register the app at Naver Developers
- **WHAT:** create a Naver Login application.
- **WHY:** to obtain a Client ID + Client Secret and register the callback.
- **WHERE:** https://developers.naver.com → 로그인 → **Application → 애플리케이션 등록**.
- **CLICK STEPS:**
  1. 애플리케이션 이름: e.g. `DeokbunAI`.
  2. 사용 API → select **네이버 로그인**.
  3. **제공 정보 선택 (권한):** check **이용자 고유 식별자** AND **이메일 주소**
     (email is **REQUIRED** — the bridge creates the Supabase user from the email;
     without it login fails closed). **Do NOT check 생일/성별/연령대/휴대전화번호**
     (data minimization — the app never needs them; birth info is entered in-app).
  4. **로그인 오픈 API 서비스 환경:** add **PC웹** (and 모바일웹 if used).
     - **네이버아이디로로그인 Callback URL** (up to 5): paste
       `https://www.deokbunai.com/login-callback`
       (the **app** — Naver redirects to the app; the edge does the code exchange).
     - **서비스 URL:** `https://www.deokbunai.com` (protocol/port are ignored; domain only).
- **WHAT VALUE IS SHOWN:** after 등록, the app's 개요 page shows **Client ID** and
  **Client Secret**.
- **WHAT TO COPY:** the Client ID and Client Secret.
- **EXPECTED RESULT:** an active Naver Login app with the app callback registered.

### Step 2 — Deploy the naver-auth Edge Function + set its secrets
- **WHAT:** deploy the trusted bridge and give it the Naver credentials (server-only).
- **WHY:** the edge does the Naver code exchange + Supabase session mint; the Naver
  Client Secret must live ONLY here (never in the client).
- **WHERE:** your terminal (Supabase CLI).
- **STEPS:**
  1. Set the Naver secrets (paste your Step-1 values in place of `…`; never committed):
     ```bash
     npx supabase secrets set NAVER_CLIENT_ID=… NAVER_CLIENT_SECRET=… --project-ref olvkpaldrwvtexxpoaag
     ```
  2. Deploy the function:
     ```bash
     npx supabase functions deploy naver-auth --project-ref olvkpaldrwvtexxpoaag
     ```
- **EXPECTED RESULT:** `naver-auth` is live (verify_jwt=false; visible under Functions).

### Step 3 — Set the client's PUBLIC Naver client_id in Vercel
- **WHAT:** the app builds the Naver authorize URL with the public client_id.
- **WHERE:** Vercel → Project → Settings → **Environment Variables**.
- **ADD:** `EXPO_PUBLIC_NAVER_CLIENT_ID` = your Naver **Client ID** → **redeploy**.
  (This is PUBLIC/non-secret — it appears in the authorize URL. Do **NOT** put the
  Naver Client **Secret** here; the secret lives only in the edge from Step 2.)
- **EXPECTED RESULT:** the “네이버로 시작하기” flow can open Naver’s login page.

### Step 4 — Smoke test
- Sign in with Naver on `https://www.deokbunai.com` using a **new** account (email
  consented).
  - ✅ Lands logged in → done.
  - ❌ Check the `naver-auth` logs (Supabase → Functions → Logs):
    - `EMAIL_REQUIRED` → the Naver app isn’t returning email → re-check Step 1.3 + user consent.
    - `ACCOUNT_CONFLICT` → that email already has a google/kakao/email account → use the original method (by design — no auto-merge).
    - `SERVER_NOT_CONFIGURED` → secrets not set (Step 2).

### DECISION — Native identifiers still gate NATIVE Naver login
Web Naver login works with identifiers unset. **Native** is blocked until
`ios.bundleIdentifier`/`android.package` are decided (§H above) + a `deokbunai://`
build.
