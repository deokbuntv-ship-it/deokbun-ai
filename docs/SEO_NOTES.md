# SEO — current state, honest limitations, next steps

## What works today
- **Static web export** (`app.json` → `web.output: "static"`), so each route emits
  real HTML.
- **Per-page `<head>`** via `expo-router/head` (`SeoHead`): title, description,
  canonical, `og:title/description/type/url/image`, `noindex` (famous
  `index_policy`).
- **Deterministic canonical URLs** = `EXPO_PUBLIC_PUBLIC_BASE_URL` + route + slug
  (never AI-generated). Null when the base URL is unset → canonical omitted (no
  fake domain).
- **robots.txt** — crawl public, disallow `/admin`.
- **OG image** — content hero image only when a real image exists (no fake OG).

## Honest limitation — dynamic slug prerender
Static export pre-renders the **routes that exist at build time**. Dynamic detail
routes (`/content/[slug]`, `/famous/[slug]`) are **not enumerated** by default, so
their pre-rendered HTML is an app shell that hydrates + fetches on the client.
Crawlers that execute JS will still index them (metadata is set via `<Head>` at
runtime), but first-byte HTML is not fully pre-rendered.

Two options to close this (owner decision — see OWNER DECISION QUEUE):
1. **`generateStaticParams`** exported from the `[slug]` routes to enumerate
   published slugs at export time. This makes `expo export -p web` fetch published
   slugs from Supabase **during the build** — build then requires network + the
   public env vars. Not wired in yet because a failed build-time fetch would break
   the whole web build; enable once the production build pipeline + base URL are
   fixed.
2. **Separate SSR/SSG public web surface** for the marketing/SEO pages. Larger
   architecture change — do NOT undertake without explicit approval.

Recommendation: start with option 1 (smallest change) once `PUBLIC_BASE_URL` and
the deploy pipeline are set; revisit option 2 only if crawl coverage is insufficient.

## Sitemap
`scripts/generate-sitemap.mjs` writes `public/sitemap.xml` from published
content/famous via the public RPCs. It is **base-URL gated** (skips with no output
when `EXPO_PUBLIC_PUBLIC_BASE_URL` is unset — never writes a fake domain).

Run before a production web export:
```bash
node scripts/generate-sitemap.mjs
```
After the base URL is fixed, add a `Sitemap: <base>/sitemap.xml` line to
`public/robots.txt` (left out now to avoid hardcoding an unknown domain).

## Structured data (future, optional)
`Article` / `Person` JSON-LD could be added to detail pages using only verified
factual fields (no fake rating/review/award). Deferred until factual coverage and
the base URL are settled.
