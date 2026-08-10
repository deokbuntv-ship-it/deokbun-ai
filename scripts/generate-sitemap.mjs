// DeokbunAI — sitemap generator (run before a production web export).
//
// Writes public/sitemap.xml from PUBLISHED content/famous only, using the public
// SECURITY DEFINER RPCs (no draft/admin data). Deterministic URLs = PUBLIC base +
// route + slug. If the base URL is not configured it SKIPS (no fake domain).
//
// Usage (owner, before `expo export -p web`):
//   set env EXPO_PUBLIC_PUBLIC_BASE_URL, EXPO_PUBLIC_SUPABASE_URL,
//   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (this script also reads a local .env), then:
//     node scripts/generate-sitemap.mjs
//
// No new dependency: reuses @supabase/supabase-js (already installed).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env loader (no dotenv dependency).
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

const baseRaw = (process.env.EXPO_PUBLIC_PUBLIC_BASE_URL ?? '').trim();
const base = /^https?:\/\//.test(baseRaw) ? baseRaw.replace(/\/+$/, '') : null;
const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseKey = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

if (!base) {
  console.log(
    '[sitemap] SKIP — EXPO_PUBLIC_PUBLIC_BASE_URL not set (no fake domain written).',
  );
  process.exit(0);
}
if (!supabaseUrl || !supabaseKey) {
  console.error('[sitemap] Supabase env not set; cannot enumerate slugs.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function collect(rpc, args) {
  const out = [];
  const pageSize = 100;
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase.rpc(rpc, {
      ...args,
      p_limit: pageSize,
      p_offset: offset,
    });
    if (error) throw error;
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

function urlEntry(loc, lastmod) {
  const lm = lastmod ? `\n    <lastmod>${String(lastmod).slice(0, 10)}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${lm}\n  </url>`;
}

const content = await collect('public_list_content', { p_category: null });
const famous = await collect('public_list_famous', {});

const entries = [
  urlEntry(`${base}/content`),
  urlEntry(`${base}/famous`),
  ...content
    .filter((c) => c.slug)
    .map((c) => urlEntry(`${base}/content/${c.slug}`, c.published_at)),
  ...famous
    .filter((f) => f.slug)
    .map((f) => urlEntry(`${base}/famous/${f.slug}`, f.published_at)),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

const outDir = join(root, 'public');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'sitemap.xml'), xml, 'utf8');
console.log(
  `[sitemap] wrote public/sitemap.xml (${content.length} content + ${famous.length} famous).`,
);
