// 사이트맵에 넣은 주소가 **실제로 있는 파일인지** 빌드가 스스로 대조한다 (2026-09-21).
//
// WHY. 2026-09-18 실측: production 사이트맵에 `/content/jo-seyoung2026` 이 들어 있었는데 실제로 열면
// Vercel 404 였다. 콘텐츠 상세는 `generateStaticParams` 가 없어 `dist/content/[slug].html` 한 장으로
// 접혔고, 그 주소에 해당하는 파일이 없었기 때문이다. 사이트맵은 DB 를 보고 만들고, 페이지는 빌드가
// 만든다 — **둘이 어긋나도 아무도 몰랐다.** 구글에는 있다고 알려 놓고 사람에게는 없는 주소가 된다.
//
// WHAT. 내보내기가 끝난 뒤 `dist/sitemap.xml` 의 모든 `<loc>` 을 `dist/` 의 파일과 대조한다.
// 하나라도 없으면 **빌드를 실패시킨다**(exit 1). "코드에는 있는데 실제로는 없는" 문제를 여기서 막는다.
//
// 규칙 (Vercel `cleanUrls: true` 기준)
//   `/`            → `index.html`
//   `/a/b`         → `a/b.html` 또는 `a/b/index.html`
//   rewrites 로 받는 동적 주소는 사이트맵에 넣지 않으므로 여기서 볼 일이 없다.
//
// Usage: node scripts/verify-sitemap-routes.mjs [distDir]
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// `resolve` 를 쓴다 — 절대 경로 인자(테스트의 임시 폴더)도 그대로 받는다.
const distDir = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(root, 'dist');

/** `<loc>` 값들을 뽑는다. 파서를 들이지 않는다 — 우리가 만든 파일이고 모양이 고정이다. */
export function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter(Boolean);
}

/** 주소 하나가 어떤 파일들 중 하나로 채워지면 되는가. */
export function candidatesFor(loc) {
  let path;
  try {
    path = new URL(loc).pathname;
  } catch {
    path = loc.startsWith('/') ? loc : `/${loc}`;
  }
  path = path.replace(/\/+$/, '');
  if (path === '') return ['index.html'];
  const rel = path.replace(/^\//, '');
  return [`${rel}.html`, join(rel, 'index.html'), rel];
}

/** 빠진 주소 목록. `hasFile` 을 주입받아 테스트가 파일 없이도 양방향을 확인할 수 있다. */
export function missingLocs(locs, hasFile) {
  return locs.filter((loc) => !candidatesFor(loc).some((c) => hasFile(c)));
}

function main() {
  const sitemapPath = join(distDir, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    // 사이트맵이 없는 빌드(도메인 미설정)는 대조할 것이 없다 — 통과시킨다.
    console.log('[sitemap-verify] SKIP — dist/sitemap.xml 없음 (EXPO_PUBLIC_PUBLIC_BASE_URL 미설정 빌드).');
    return 0;
  }
  const locs = extractLocs(readFileSync(sitemapPath, 'utf8'));
  const missing = missingLocs(locs, (rel) => existsSync(join(distDir, rel)));
  console.log(`[sitemap-verify] ${locs.length}개 주소 대조 → 빠진 것 ${missing.length}개 (${distDir})`);
  if (missing.length > 0) {
    console.error('[sitemap-verify] ❌ 사이트맵에 있는데 만들어지지 않은 주소:');
    for (const loc of missing) {
      console.error(`  - ${loc}   (찾은 이름: ${candidatesFor(loc).join(' · ')})`);
    }
    console.error(
      '[sitemap-verify] 빌드를 멈춘다. 구글에 알려 놓고 실제로는 404 인 주소를 내보내지 않는다.\n'
      + '  고치는 길: ① 그 경로에 `generateStaticParams` 가 있는지 ② 생성기가 그 슬러그를 담았는지 ③ 사이트맵에서 빼야 할 주소인지.',
    );
    return 1;
  }
  console.log('[sitemap-verify] ✅ 사이트맵의 모든 주소가 실제 파일로 있다.');
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(main());
}
