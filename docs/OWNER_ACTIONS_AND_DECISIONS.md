# Owner Actions & Decisions — DeokbunAI (Claude app track)

Single operational reference for the non-developer owner. Split into: (1) USER
ACTIONS you run now, (2) OWNER DECISIONS (cost/lock-in — no default chosen),
(3) inventories, (4) a manual smoke script. Nothing here contains secret values.

---

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

### B. Edge deploy (CMD / terminal)
```bash
npx supabase functions deploy content-generate --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy media-generate --project-ref olvkpaldrwvtexxpoaag
```
`content-generate` redeploy is needed for the AI-workload layer (P0-7).
`media-generate` is the NEW image generation function (reuses `OPENAI_API_KEY`).
`famous-suggest` is already deployed; redeploy only if you change its code.

### C. Environment variables (optional, enables canonical URLs + sitemap)
Client-safe (not secret). Set in your env / `.env`:
- `EXPO_PUBLIC_PUBLIC_BASE_URL` = your production site origin (e.g. `https://…`).
  Until set: canonical URLs are omitted and the sitemap generator skips (no fake
  domain — intended).

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

### B. Video generation provider (CONTENT-06) — lower priority
| Provider | ~Price/sec | Notes |
|---|---|---|
| **Kling 3.0** (value) | ~$0.04 | Cheapest, self-serve |
| Runway Gen-4.5 | ~$0.15 | Best creative control (enterprise waitlist) |
| Google Veo 3.1 | ~$0.75 | 4K + native audio (Vertex, region-gated) |
| OpenAI Sora 2 | ~$0.10 (std) | ⚠️ Videos API deprecation scheduled 2026-09-24 — avoid as primary |
**Recommendation:** defer video; if pursued, Kling (cost) or Veo (quality). Not
Sora as primary due to deprecation risk.

### C. Instagram automatic publishing — go / no-go (CONTENT-05)
Requires Meta app + IG Professional account + FB Page + App Review (2–4 wks). See
the checklist in §3E. Until done, app shows `OAUTH_REQUIRED` + manual caption/record.

### D. Scheduler auto-publish authorization (CONTENT-07)
Schedule *persistence* works. Automatic external publishing (pg_cron→Edge) is
`DEPLOY_REQUIRED` and intentionally NOT enabled without your explicit approval.

### E. Production public domain — needed for canonical URLs + sitemap + OG.

### F. Dynamic-slug SEO prerender scope — see `docs/SEO_NOTES.md` (generateStaticParams).

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
  (image defaults: openai / gpt-image-1 / low).
- Future provider-specific (only after you choose): image/video provider keys,
  Meta app id/secret + IG token — **edge/server-side only, never `EXPO_PUBLIC_*`.**

### 3B. Edge Functions
- `chat` — deployed.
- `content-generate` — deployed; **redeploy pending** (P0-7).
- `famous-suggest` — deployed.
- `media-generate` — **new; deploy pending** (image generation, OpenAI/LOW).

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
