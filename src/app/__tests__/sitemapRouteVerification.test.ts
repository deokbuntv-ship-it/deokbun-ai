// 사이트맵 ↔ 결과물 대조 장치 — **양방향 합성 반례** (2026-09-21).
//
// 이 장치는 "구글에 알려 놓고 실제로는 404" 를 빌드에서 막는다. 그래서 두 방향을 다 본다:
//   ① 빠진 주소가 있으면 **빌드를 실패**시키는가 (exit 1)
//   ② 다 있으면 통과시키는가 (exit 0)
// ①의 재료는 **2026-09-18 production 실측 그대로**다 — 사이트맵에 `/content/jo-seyoung2026` 이 있고,
// 결과물에는 `content/[slug].html` 껍데기만 있고 그 슬러그 파일이 없는 상태. 이 장치가 그때 있었다면
// 그 빌드는 나가지 못했다.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(process.cwd(), 'scripts', 'verify-sitemap-routes.mjs');
const BASE = 'https://www.deokbunai.com';

function sitemap(paths: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    paths.map((p) => `  <url>\n    <loc>${BASE}${p}</loc>\n  </url>`).join('\n')
  }\n</urlset>\n`;
}

function makeDist(files: string[], paths: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'sitemap-verify-'));
  writeFileSync(join(dir, 'sitemap.xml'), sitemap(paths), 'utf8');
  for (const rel of files) {
    const full = join(dir, rel);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, '<html></html>', 'utf8');
  }
  return dir;
}

function run(dir: string): { code: number; out: string } {
  try {
    const out = execFileSync(process.execPath, [SCRIPT, dir], { encoding: 'utf8', stdio: 'pipe' });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('사이트맵 주소 대조 — 빠진 주소는 빌드를 멈춘다', () => {
  const dirs: string[] = [];
  afterAll(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

  it('① 2026-09-18 production 상태를 그대로 재현하면 **실패**한다 (이 장치가 그 404 를 잡았다)', () => {
    const dir = makeDist(
      ['privacy-policy.html', 'content/index.html', join('content', '[slug].html')],
      ['/privacy-policy', '/content', '/content/jo-seyoung2026'],
    );
    dirs.push(dir);
    const { code, out } = run(dir);
    expect(code).toBe(1);
    expect(out).toContain('/content/jo-seyoung2026');
    expect(out).toContain('빌드를 멈춘다');
  });

  it('② 슬러그 파일이 생기면 통과한다 (이번 수정 뒤의 상태)', () => {
    const dir = makeDist(
      ['privacy-policy.html', 'content/index.html', join('content', '[slug].html'), 'content/jo-seyoung2026.html'],
      ['/privacy-policy', '/content', '/content/jo-seyoung2026'],
    );
    dirs.push(dir);
    const { code, out } = run(dir);
    expect(code).toBe(0);
    expect(out).toContain('빠진 것 0개');
  });

  it('폴더형(`a/b/index.html`)도 있는 것으로 본다', () => {
    const dir = makeDist(['famous/hong/index.html'], ['/famous/hong']);
    dirs.push(dir);
    expect(run(dir).code).toBe(0);
  });

  it('사이트맵이 없는 빌드는 대조할 것이 없어 통과한다 (도메인 미설정)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sitemap-verify-none-'));
    dirs.push(dir);
    const { code, out } = run(dir);
    expect(code).toBe(0);
    expect(out).toContain('SKIP');
  });

  it('빌드 스크립트가 이 대조를 마지막 단계로 부른다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const buildWeb = require('node:fs').readFileSync(join(process.cwd(), 'scripts', 'build-web.mjs'), 'utf8') as string;
    expect(buildWeb).toContain('verify-sitemap-routes.mjs');
    expect(buildWeb.indexOf('verify-sitemap-routes.mjs')).toBeGreaterThan(buildWeb.indexOf('expo export'));
  });
});

describe('동적 주소는 호스팅 설정으로 받는다', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const vercel = JSON.parse(require('node:fs').readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
    rewrites?: { source: string; destination: string }[];
  };

  // ⚠ 2026-09-21 production 실측: 목적지에 **`.html` 을 붙이면 404 가 난다.**
  //   `cleanUrls: true` 라 `shared-report/[token].html` 은 **주소가 아니라 리다이렉트**가 된다
  //   (`/shared-report/%5Btoken%5D.html` 요청 → 308 → `/shared-report/%5Btoken%5D` 200 을 실제로 확인).
  //   rewrite 는 리다이렉트를 따라가지 않으므로 목적지를 찾지 못하고 404 로 떨어졌다.
  //   그래서 목적지는 **확장자 없는 깨끗한 주소**여야 한다. 실제 파일(`[token].html`)은 그대로 있다.
  it.each([
    ['/shared-report/:token', '/shared-report/[token]'],
    ['/report/:id', '/report/[id]'],
    ['/content/:slug', '/content/[slug]'],
    ['/famous/:slug', '/famous/[slug]'],
  ])('%s → %s', (source, destination) => {
    expect(vercel.rewrites).toEqual(expect.arrayContaining([{ source, destination }]));
  });

  it('목적지에 `.html` 이 없다 — cleanUrls 와 함께 쓰면 404 가 된다', () => {
    for (const r of vercel.rewrites ?? []) expect(r.destination.endsWith('.html')).toBe(false);
  });

  it('공개로 열려야 하는 주소는 앱 게이트 목록에도 있다 (PUBLIC_PREFIXES 와 대조)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const routing = require('node:fs').readFileSync(
      join(process.cwd(), 'src', 'features', 'onboarding', 'entryRouting.ts'), 'utf8',
    ) as string;
    for (const prefix of ["'/content'", "'/famous'", "'/shared-report'"]) {
      expect(routing).toContain(prefix);
    }
  });
});
