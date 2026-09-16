// 공개 문서 7개 — 게이트 목록 · 사이트맵 · 실제 라우트 파일이 서로 맞는가 (2026-09-17).
//
// 2026-09-15 실사이트 실측에서 두 곳이 어긋나 있었다: 게이트 목록에는 문서 경로가 없어 전부 `/login` 으로
// 튕겼고(스토어 제출 URL 이 열리지 않음), 사이트맵에는 문서 주소가 하나도 없었다. 둘 다 "한 곳만 고치면
// 다른 곳이 조용히 어긋나는" 모양이라, 세 곳을 한 테스트가 대조한다.
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const DOC_PATHS = [
  '/account-deletion',
  '/terms-of-service',
  '/privacy-policy',
  '/ai-notice',
  '/duk-policy',
  '/refund-policy',
  '/minor-policy',
];

const GATE = read('src/features/onboarding/entryRouting.ts');
const SITEMAP = read('scripts/generate-sitemap.mjs');

describe('공개 문서 7개 — 세 곳이 같은 목록을 본다', () => {
  it.each(DOC_PATHS)('%s — 게이트의 공개 목록에 있다', (p) => {
    expect(GATE).toContain(`'${p}',`);
  });

  it.each(DOC_PATHS)('%s — 사이트맵 생성기에 있다', (p) => {
    expect(SITEMAP).toContain(`'${p}',`);
  });

  it.each(DOC_PATHS)('%s — 라우트 파일이 실제로 있다', (p) => {
    expect(fs.existsSync(path.join(ROOT, 'src/app', `${p.slice(1)}.tsx`))).toBe(true);
  });

  it('⚠ 반례 — 로그인해서 실행하는 `/account-delete` 는 공개 목록에 없다', () => {
    expect(GATE).not.toContain("'/account-delete',");
    expect(fs.existsSync(path.join(ROOT, 'src/app/account-delete.tsx'))).toBe(true);
  });

  it('사이트맵은 콘텐츠·인물 주소를 DB 에서 읽는다 (문서만 상수)', () => {
    expect(SITEMAP).toContain('public_list_content');
    expect(SITEMAP).toContain('public_list_famous');
  });
});
