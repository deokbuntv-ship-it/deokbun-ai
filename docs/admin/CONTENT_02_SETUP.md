# CONTENT-02 — AI Text Generation (setup)

Admin-gated AI text generation for the Content Studio. The client never calls a
provider directly; it invokes the **`content-generate`** Edge Function (server
trust boundary), which:

- requires the caller to be an authenticated **admin** (JWT `sub` must be in
  `public.admin_users` — the same allowlist `public.is_admin()` uses; checked
  server-side with the service_role key),
- reuses the existing **`OPENAI_API_KEY`** secret and the OpenAI Responses API,
- writes an immutable **`public.content_versions`** row (source=`ai`, provider,
  model, `prompt_version`, `input_ref`, `token_usage`) — provenance,
- logs raw usage to **`public.ai_usage_logs`** with
  `request_type = 'content_generate'` (visible on `/admin/ai-usage`),
- **never auto-publishes** — the draft is returned for operator review/apply.

## No new SQL

CONTENT-02 reuses tables already applied:

- `public.content_versions` (from `CONTENT_01_SETUP.sql`, applied ✅)
- `public.ai_usage_logs` (from `ADMIN_04_SETUP.sql`, applied ✅)
- `public.admin_users` / `public.is_admin()` (from `ADMIN_SETUP.sql`, applied ✅)

There is **nothing to run in the SQL Editor** for CONTENT-02.

## USER ACTION — deploy the Edge Function (CMD / terminal)

The OpenAI key is already configured (used by `chat`). Deploy the new function:

```bash
npx supabase functions deploy content-generate --project-ref olvkpaldrwvtexxpoaag
```

(If prompted, log in first with `npx supabase login`.)

Optional server config (only if you want a different model/limit than chat):

```bash
npx supabase secrets set CONTENT_LLM_MODEL=gpt-5-mini --project-ref olvkpaldrwvtexxpoaag
npx supabase secrets set CONTENT_LLM_MAX_OUTPUT_TOKENS=2000 --project-ref olvkpaldrwvtexxpoaag
```

If unset, it falls back to `LLM_MODEL` (chat's model) then `gpt-5-mini`, and a
2000-token output cap.

### AI workloads (P0-7) — server-side model per logical workload

The function resolves the concrete model from a logical **workload** so the UI
never contains model strings and Famous can use a stronger model than ordinary
content (see `supabase/functions/content-generate/workloads.ts`):

- `CONTENT_STANDARD` (default) → `CONTENT_LLM_MODEL` → `LLM_MODEL` → `gpt-5-mini`,
  cap `CONTENT_LLM_MAX_OUTPUT_TOKENS` (2000).
- `PREMIUM_CONTENT` (Famous premium generation) → `PREMIUM_CONTENT_LLM_MODEL`
  (falls back to the standard model when unset — never a missing/invented model),
  cap `PREMIUM_CONTENT_MAX_OUTPUT_TOKENS` (4000).

Optional premium config:

```bash
npx supabase secrets set PREMIUM_CONTENT_LLM_MODEL=gpt-5 --project-ref olvkpaldrwvtexxpoaag
npx supabase secrets set PREMIUM_CONTENT_MAX_OUTPUT_TOKENS=4000 --project-ref olvkpaldrwvtexxpoaag
```

> After this P0-7 change, **redeploy** `content-generate` (same command as above)
> so the workload resolution takes effect. Provenance now records the workload.

## Smoke test (after deploy)

1. `/admin/content` → open or create a content item → detail page.
2. In **AI 생성**: pick a template, enter a topic, press **AI로 초안 생성**.
   - Success → draft (title/summary/body/tags) + provenance (provider/model/
     prompt version/tokens) + a new version in **생성/편집 이력**.
   - Non-admin caller → 403 (nothing generated). No key → `SERVER_NOT_CONFIGURED`.
3. Press **이 초안을 본문에 적용** → the item body updates (status unchanged; no
   publish).
4. `/admin/ai-usage` → a `콘텐츠 생성` (content_generate) row with token counts.

## Guardrails

- The model is instructed to **never compute** myeongri results (사주팔자/오행/
  대운/절기/자미두수/기문둔갑 수치). Calculated facts come only from the canonical
  ENGINE via `engineContext` (not wired yet → explanatory/general content only).
- Prompt bodies live server-side only; the client ships template **labels** only.
- Errors are fail-closed and never leak provider internals to the client.
