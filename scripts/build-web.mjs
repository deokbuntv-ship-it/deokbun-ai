// DeokbunAI — web build entry point. **Run this, not `expo export` directly.**
//
// WHY THIS EXISTS. The web build has an ORDER that is not obvious and that nothing enforced:
//
//   1. generate-static-routes.mjs → src/generated/famousStatic.ts
//        Without it every famous page collapses into one empty `[slug].html` shell. Measured
//        2026-09-06: 91 characters of chrome and "불러오는 중…", no description, no canonical.
//   2. generate-sitemap.mjs → public/sitemap.xml + public/robots.txt
//        Must run BEFORE the export so `public/` is copied into `dist/`.
//   3. expo export -p web
//
// Getting 1 or 2 after 3 silently produces a site that looks fine to a human and is invisible to a
// crawler. That failure is impossible to notice by looking at the app, which is exactly why the
// order belongs in a file instead of in someone's memory.
//
// ⚠ WHY vercel.json POINTS HERE. `vercel.json` sets `buildCommand` to this file rather than to
// `expo export`. That reason used to live in vercel.json as a `_buildCommand_why` key — Vercel
// rejects the whole file for any key outside its schema ("should NOT have additional property"),
// so the note moved here, next to the thing it explains. **vercel.json takes no comments and no
// extra keys.** Anything worth saying about the build goes in this header.
//
// ⚠ `package.json` is a PROTECTED file in this repo, so this is a script rather than an npm script.
// The `npm run build:web` diff for the owner to apply is in `docs/OWNER_TODO.md`.
//
// Vercel: set the Build Command to `node scripts/build-web.mjs` and the Output Directory to `dist`.
//
//   node scripts/build-web.mjs            # full web build
//   node scripts/build-web.mjs --no-export  # data steps only (fast check)
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skipExport = process.argv.includes('--no-export');

function step(label, cmd, args) {
  console.log(`\n[build-web] ${label}`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`[build-web] FAILED at: ${label}`);
    process.exit(r.status ?? 1);
  }
}

// 1 + 2 both fail OPEN by design (empty module / skip) — a brief database outage must not break a
// release. They exit 0 even when they produce nothing, so a green build can still mean "no famous
// pages"; the counts they print are the thing to read.
step('1/3 static route data', 'node', ['scripts/generate-static-routes.mjs']);
step('2/3 sitemap + robots', 'node', ['scripts/generate-sitemap.mjs']);

if (skipExport) {
  console.log('\n[build-web] --no-export — stopped after the data steps.');
  process.exit(0);
}

step('3/3 expo export', 'npx', ['expo', 'export', '-p', 'web', '--output-dir', 'dist']);

// 4. 검색엔진 소유확인 메타 — 값이 있을 때만. 규칙과 회귀는 `src/config/siteVerificationMeta.ts`.
//
// ⚠ 왜 export 뒤인가: 소유확인은 **사이트 루트**(`/`)를 가져가 확인한다. 루트를 그리는
//   `(tabs)/index` 는 `SeoHead` 를 쓰지 않고, 거기에 넣으면 모든 탭 페이지에 같은 태그가
//   복제된다. 루트 HTML 한 장에 넣는 것이 정확하고 작다.
{
  const { VERIFICATION_ENV, withVerificationMeta } = await import('../src/config/siteVerificationMeta.ts');
  const rootHtml = join(root, 'dist', 'index.html');
  const set = Object.keys(VERIFICATION_ENV).filter((k) => (process.env[k] ?? '').trim() !== '');
  if (set.length === 0) {
    console.log('\n[build-web] 4/4 소유확인 메타: 건너뜀 — ' + Object.keys(VERIFICATION_ENV).join(' · ') + ' 없음');
  } else if (!existsSync(rootHtml)) {
    console.log('\n[build-web] 4/4 소유확인 메타: dist/index.html 없음 — 건너뜀');
  } else {
    writeFileSync(rootHtml, withVerificationMeta(readFileSync(rootHtml, 'utf8'), process.env), 'utf8');
    console.log(`\n[build-web] 4/4 소유확인 메타 넣음 → dist/index.html (${set.join(' · ')})`);
  }
}

console.log('\n[build-web] done → dist/');
