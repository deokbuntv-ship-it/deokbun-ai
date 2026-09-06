// DeokbunAI — build-time static route data (run BEFORE `expo export -p web`).
//
// WHY. `web.output: "static"` renders every route ONCE at build time; `useEffect` never runs there.
// Measured 2026-09-06: `dist/famous/[slug].html` was 91 characters of chrome plus "불러오는 중…" —
// crawlers saw nothing. This script writes `src/generated/famousStatic.ts` so the data exists at
// render time, and so `generateStaticParams` can emit one HTML file per person instead of a single
// `[slug].html` shell.
//
// SAFETY. It reads the PUBLIC RPCs only (`public_list_famous`, `public_get_famous`), which are
// SECURITY DEFINER and filter `status='published' AND is_public=true` inside the function. A draft
// cannot leak into the build even if this script is pointed at the wrong environment.
//
// FAIL-OPEN. Any failure writes the EMPTY module and exits 0. A build must not break because the
// database was briefly unreachable — it should produce a site with no famous pages, which is the
// same thing that happens when nobody has published yet.
//
// ⚠ BUT FAIL-OPEN MUST STILL SAY WHY. Measured 2026-09-06: a Vercel Preview logged
//   `wrote src/generated/famousStatic.ts (0 famous pages)` — the SUCCESS line, not SKIP and not
//   FAILED. So the env was set, nothing threw, and the RPC simply returned nothing. The log could
//   not distinguish "pointed at a database with no published people" from "published people exist
//   but something dropped them", because it never said WHICH DATABASE it had reached.
//   Staging at that moment returned 5 rows to the same publishable key.
//
//   Every line below therefore stamps the Supabase host. **Never the key** — the host is what
//   identifies the environment, and it is not a secret. This is the same lesson as
//   `PROJECT_STATE` §7.34: a measurement without its source is a rumour.
//
// Usage (before a web export):
//   node scripts/generate-static-routes.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'src', 'generated', 'famousStatic.ts');

// Minimal .env loader — same approach as generate-sitemap.mjs (no dotenv dependency).
function loadEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const HEADER = readFileSync(OUT, 'utf8').split('/** Published famous profiles')[0];

function emit(entries, stamp) {
  const body =
    `${HEADER}/** Published famous profiles captured at build time. Empty when the generator has not run. */\n`
    + `export const FAMOUS_STATIC: FamousStaticEntry[] = ${JSON.stringify(entries, null, 2)};\n\n`
    + `/** Build stamp — null when this is the committed fallback. */\n`
    + `export const FAMOUS_STATIC_GENERATED_AT: string | null = ${stamp ? JSON.stringify(stamp) : 'null'};\n\n`
    + `export function famousStaticBySlug(slug: string): FamousStaticEntry | null {\n`
    + `  return FAMOUS_STATIC.find((e) => e.slug === slug) ?? null;\n`
    + `}\n`;
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, body, 'utf8');
}

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseKey = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

// 호스트만 뽑는다. 키는 어떤 형태로도 찍지 않는다.
const hostOf = (u) => { try { return new URL(u).host; } catch { return '(unparsable)'; } };
const where = supabaseUrl ? hostOf(supabaseUrl) : '(unset)';

if (!supabaseUrl || !supabaseKey) {
  console.log(
    `[static-routes] SKIP — Supabase env not set (url=${supabaseUrl ? where : 'unset'}, `
    + `key=${supabaseKey ? 'set' : 'unset'}). Wrote the empty module (0 famous pages).`,
  );
  emit([], null);
  process.exit(0);
}

console.log(`[static-routes] source ${where}`);

const supabase = createClient(supabaseUrl, supabaseKey);

const str = (v) => (typeof v === 'string' && v.length > 0 ? v : null);

try {
  // 1) Enumerate published slugs (paged, same shape as the sitemap generator).
  const slugs = [];
  const pageSize = 100;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.rpc('public_list_famous', {
      p_limit: pageSize,
      p_offset: offset,
    });
    if (error) throw error;
    const rows = data ?? [];
    slugs.push(...rows.map((r) => r.slug).filter(Boolean));
    if (rows.length < pageSize) break;
  }
  console.log(`[static-routes] public_list_famous → ${slugs.length} published slug(s) from ${where}`);
  if (slugs.length === 0) {
    // 여기서 멈추면 원인이 하나로 좁혀진다 — 붙긴 붙었는데 그 DB 에 발행된 사람이 없다.
    console.warn(
      `[static-routes] ⚠ ${where} has no rows matching status='published' AND is_public=true `
      + 'AND slug is not null. The connection and the key are fine — this database simply has '
      + 'nobody published. Check that EXPO_PUBLIC_SUPABASE_URL points at the environment that '
      + 'holds the famous profiles.',
    );
  }

  // 2) Full detail per slug — the list RPC does not carry `bio`, and the body is the whole point.
  const entries = [];
  for (const slug of slugs) {
    const { data, error } = await supabase.rpc('public_get_famous', { p_slug: slug });
    if (error) throw error;
    if (!data) { console.warn(`[static-routes] ⚠ public_get_famous returned nothing for "${slug}" — skipped`); continue; }
    entries.push({
      slug: str(data.slug) ?? slug,
      name: str(data.name) ?? slug,
      category: str(data.category),
      occupation: str(data.occupation),
      shortDescription: str(data.short_description),
      bio: str(data.bio),
      birthSource: str(data.birth_source),
      birthSourceNote: str(data.birth_source_note),
      // 명식 스냅샷 — 이것이 정적 HTML 안의 표가 된다.
      chart: data.chart ?? null,
      seoTitle: str(data.seo_title),
      seoDescription: str(data.seo_description),
      canonicalUrl: str(data.canonical_url),
      indexPolicy: data.index_policy === 'noindex' ? 'noindex' : 'index',
      publishedAt: str(data.published_at),
      related: Array.isArray(data.related)
        ? data.related
            .map((r) => ({ slug: str(r.slug), name: str(r.name), category: str(r.category) }))
            .filter((r) => r.slug && r.name)
        : [],
    });
  }

  emit(entries, new Date().toISOString());
  console.log(
    `[static-routes] wrote src/generated/famousStatic.ts (${entries.length} famous pages`
    + `${entries.length === slugs.length ? '' : ` — ${slugs.length - entries.length} slug(s) dropped at detail`}`
    + `, source ${where}).`,
  );
} catch (err) {
  // ⚠ Never break the build. An unreachable database must not stop a release.
  console.error(`[static-routes] FAILED against ${where} — wrote the empty module instead: ${String(err).slice(0, 200)}`);
  emit([], null);
  process.exit(0);
}
