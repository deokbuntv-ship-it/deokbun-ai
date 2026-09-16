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

// ⚠ 출처를 찍는다(키는 절대 안 찍는다). 개수만 보고 어느 DB 인지 모르면 0이 왜 0인지 알 수 없다.
console.log(`[sitemap] source ${(() => { try { return new URL(supabaseUrl).host; } catch { return '(unparsable)'; } })()} · base ${base}`);

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
const famousList = await collect('public_list_famous', {});

// ⚠ noindex 인 인물은 사이트맵에 넣지 않는다 (2026-09-11 실측에서 나온 결함).
//
//   가상 인물 `예시인 하나` 를 staging 에 발행하고 웹을 빌드했더니, 그 페이지는
//   `<meta name="robots" content="noindex">` 를 달고 나오면서 **사이트맵에도 들어갔다.**
//   해롭지는 않다(noindex 가 이긴다). 다만 Search Console 이 "제출된 URL이 noindex로
//   표시됨" 을 오류로 보고하고, 그 오류가 쌓이면 진짜 문제를 덮는다.
//
//   `public_list_famous` 는 `index_policy` 를 주지 않는다. 그래서 슬러그마다
//   `public_get_famous` 를 한 번씩 더 부른다 — 새 RPC 를 만들지 않고, 정적 라우트
//   생성기가 이미 쓰는 그 함수를 그대로 쓴다. 인물 수가 수백이 되면 그때 목록 RPC 에
//   칸을 더하는 것이 맞다.
const famous = [];
let skippedNoindex = 0;
for (const f of famousList) {
  if (!f.slug) continue;
  const { data, error } = await supabase.rpc('public_get_famous', { p_slug: f.slug });
  if (error || !data) {
    // ⚠ 확인하지 못하면 **넣지 않는다.** 모르는 채로 크롤러에게 제출하는 것보다 낫다.
    console.warn(`[sitemap] ⚠ public_get_famous 실패 — 사이트맵에서 제외: ${f.slug}`);
    skippedNoindex += 1;
    continue;
  }
  if (data.index_policy === 'noindex') { skippedNoindex += 1; continue; }
  famous.push(f);
}

// ⚠ 2026-09-17 — 법률·안내 문서 7개. **검색 노출이 목적이 아니라, 주소가 있다는 것을 구글에 알리는** 용도다
//   (구글 플레이 제출에 계정 삭제 안내 · 개인정보 처리방침 URL 을 적는다). 콘텐츠·인물과 달리 DB 가 아니라
//   앱 라우트라서 여기에 상수로 적는다. 앱이 로그인 없이 여는 목록(`src/features/onboarding/entryRouting.ts`
//   PUBLIC_PREFIXES)의 문서 7개와 같아야 한다 — `publicDocRoutes.test.ts` 가 둘을 대조한다.
const LEGAL_PATHS = [
  '/account-deletion',
  '/terms-of-service',
  '/privacy-policy',
  '/ai-notice',
  '/duk-policy',
  '/refund-policy',
  '/minor-policy',
];

const entries = [
  urlEntry(`${base}/content`),
  urlEntry(`${base}/famous`),
  ...LEGAL_PATHS.map((p) => urlEntry(`${base}${p}`)),
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
  `[sitemap] wrote public/sitemap.xml (${content.length} content + ${famous.length} famous`
  + `${skippedNoindex > 0 ? `, noindex/확인불가 ${skippedNoindex}건 제외` : ''}).`,
);

// Also emit robots.txt WITH the absolute Sitemap directive (base URL known here).
// Keeps the rules identical to the committed fallback + points crawlers at the map.
const robots = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`;
writeFileSync(join(outDir, 'robots.txt'), robots, 'utf8');
console.log(`[sitemap] wrote public/robots.txt (Sitemap: ${base}/sitemap.xml).`);
