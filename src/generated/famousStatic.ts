// GENERATED — do not edit by hand. Written by `node scripts/generate-static-routes.mjs`.
//
// WHY THIS FILE EXISTS. `app.json` sets `web.output: "static"`, so every route is rendered ONCE at
// build time. A screen that fetches in `useEffect` therefore ships an empty shell: measured
// 2026-09-06, `dist/famous/[slug].html` contained 91 characters of chrome and the words
// "불러오는 중…" — no name, no description, no canonical, no JSON-LD. Crawlers see only that.
//
// So the data has to exist BEFORE the render. This module is that data. The generator queries the
// SAME public RPCs the site uses (`public_list_famous` / `public_get_famous`), so drafts can never
// leak — the RPC itself filters `status='published' AND is_public=true`.
//
// THE COMMITTED VERSION IS EMPTY ON PURPOSE. A build that skips the generator produces zero famous
// pages rather than a broken build or stale people. `tsc` and jest always have a real module to
// import. Running the generator overwrites this file.
//
// Pattern borrowed from `scripts/generate-sitemap.mjs`, which already queries Supabase at build
// time. Separate script because the skip conditions differ: the sitemap SKIPS without
// EXPO_PUBLIC_PUBLIC_BASE_URL (it must not invent a domain), while static routes must still be
// generated — a page with no canonical is fine, a missing page is not.

export type FamousStaticEntry = {
  slug: string;
  name: string;
  category: string | null;
  occupation: string | null;
  shortDescription: string | null;
  bio: string | null;
  birthSource: string | null;
  birthSourceNote: string | null;
  chart: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  indexPolicy: 'index' | 'noindex';
  publishedAt: string | null;
  related: { slug: string; name: string; category: string | null }[];
};

/** Published famous profiles captured at build time. Empty when the generator has not run. */
export const FAMOUS_STATIC: FamousStaticEntry[] = [];

/** Build stamp — null when this is the committed fallback. */
export const FAMOUS_STATIC_GENERATED_AT: string | null = null;

export function famousStaticBySlug(slug: string): FamousStaticEntry | null {
  return FAMOUS_STATIC.find((e) => e.slug === slug) ?? null;
}
