# DeokbunAI — ENVIRONMENT VARIABLE CONTRACT (V1.0)

> Directive §15. Every environment variable the app/edge reads, so the repo alone
> documents what must be configured. **No real secret VALUES are recorded here** —
> only names/purpose. `.env` files with real values must NEVER be committed.
>
> Two scopes: **CLIENT** (bundled into the app — anything here is PUBLIC, so it
> must be non-secret) and **EDGE** (Supabase Edge Function server runtime — secrets
> live here only). Client vars are prefixed `EXPO_PUBLIC_` (Expo inlines them).

## CLIENT (app bundle — PUBLIC, non-secret only)

| Variable | Req? | Purpose | Safe to expose |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | required | Supabase project URL | yes (public) |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | required | Supabase anon/publishable key (RLS-guarded) | yes (designed public) |
| `EXPO_PUBLIC_PUBLIC_BASE_URL` | optional | canonical base URL for public web (OG/sitemap) | yes |
| `EXPO_OS` | auto | Expo-provided platform tag | yes |

> ⚠️ NEVER put `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or any secret under
> `EXPO_PUBLIC_*` — it would ship to every client. The service role key is edge-only.

## EDGE (Supabase Edge Functions — SERVER SECRETS)

### Secrets (never client, never logged)
| Variable | Req? | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | required (chat/content/image) | OpenAI Responses/Images API auth |
| `SUPABASE_SERVICE_ROLE_KEY` | required | edge-only privileged DB writes (usage logs, admin ops) |
| `SUPABASE_URL` | required | Supabase URL for the edge admin client |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | optional | Gemini/Veo (premium content/video) — only if that path is enabled |

### Non-secret config (tuning; safe defaults in code)
| Variable | Default (code) | Purpose |
|---|---|---|
| `LLM_MODEL` | `gpt-5-mini` | chat model (server-decided; client cannot override) |
| `LLM_MAX_OUTPUT_TOKENS` | `800` | chat output cap |
| `CHAT_RATE_WINDOW_MS` | `60000` | rate-limit window |
| `CHAT_RATE_MAX_REQUESTS` | `20` | rate-limit burst cap |
| `CONTENT_LLM_MODEL`, `PREMIUM_CONTENT_LLM_MODEL`, `PREMIUM_CONTENT_MAX_OUTPUT_TOKENS` | code defaults | content-generation models |
| `IMAGE_STANDARD_*` / `IMAGE_PREMIUM_*` (provider/model/quality) | code defaults | image generation |
| `VIDEO_STANDARD_*` / `VIDEO_PREMIUM_*` (provider/model/resolution/audio) | code defaults | video generation |
| `GEMINI_API_BASE` | code default | Gemini endpoint override |

## Rules
- CLIENT scope = public. If a value must stay secret, it belongs in EDGE only.
- Missing required EDGE secret → the edge returns `SERVER_NOT_CONFIGURED` (it does
  NOT fall back to a fake response). See `supabase/functions/chat/index.ts`.
- Pricing is NOT an env var — it is a pricing repository/config (see
  `operationalContracts.PricingRepository`); with none configured, cost = null.
- Setting EDGE secrets is an **Owner action** (`supabase secrets set …`) — see
  OWNER_ACTIONS_AND_DECISIONS.md.
