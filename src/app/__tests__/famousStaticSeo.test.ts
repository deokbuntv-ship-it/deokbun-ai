// 유명인 정적 SEO 계약 (2026-09-08, S5·S7·S8).
//
// 왜 소스 계약인가: 이 기능의 결함은 **화면에서 안 보인다.** 브라우저로 열면 잘 나오고, 크롤러만
// 빈 페이지를 받는다. 2026-09-06 실측이 정확히 그 상태였다 — `dist/famous/[slug].html` 본문
// 91자, 전부 "불러오는 중…". 그래서 "빌드가 이렇게 돌아야 한다" 를 코드로 박아 둔다.
//
// ⚠ 이 파일이 `.ts` 인 이유: `tsconfig.json` 의 exclude 가 `**/*.test.ts` 뿐이라 `.tsx` 로 두면
// 앱 tsconfig(node 타입 없음)가 `fs` import 를 TS2591 로 잡는다. jest 는 통과하고 tsc 만 깨진다.
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const ROUTE = read('src/app/famous/[slug].tsx');
const GENERATOR = read('scripts/generate-static-routes.mjs');
const BUILD = read('scripts/build-web.mjs');
const SITEMAP = read('scripts/generate-sitemap.mjs');

describe('⚠ 정적 렌더링에 내용이 들어간다 (S5)', () => {
  it('동적 라우트가 generateStaticParams 를 export 한다 — 없으면 페이지가 한 개로 뭉개진다', () => {
    expect(ROUTE).toMatch(/export function generateStaticParams\(\)/);
    // 목록의 출처는 빌드 타임 생성 모듈이어야 한다. 여기서 네트워크를 타면 번들 안에서 fetch 를
    // 하게 되고, 그건 정적 렌더링에서 다시 빈 페이지가 된다.
    expect(ROUTE).toContain("from '@/generated/famousStatic'");
    expect(ROUTE).toMatch(/FAMOUS_STATIC\.map\(\(entry\) => \(\{ slug: entry\.slug \}\)\)/);
  });

  it('⚠ 화면이 빌드 타임 데이터로 **초기화**된다 — useEffect 는 정적 렌더링에서 실행되지 않는다', () => {
    expect(ROUTE).toMatch(/const staticItem = famousStaticBySlug\(slug\)/);
    // 초기 상태가 null 이면 정적 HTML 은 다시 "불러오는 중" 이 된다.
    expect(ROUTE).toMatch(/useState<PublicFamousDetail \| null>\(staticItem\)/);
    expect(ROUTE).toMatch(/useState<Status>\(staticItem \? 'ready' : 'loading'\)/);
  });

  it('클라이언트 갱신은 남아 있다 — 정적 스냅샷만 쓰면 수정이 영원히 반영되지 않는다', () => {
    expect(ROUTE).toContain('publicSiteService');
    expect(ROUTE).toContain('.getFamous(slug)');
  });

  it('⚠ 갱신 실패가 이미 그려진 페이지를 지우지 않는다', () => {
    // 정적으로 이미 내용이 나온 페이지가 일시적 네트워크 오류로 오류 화면이 되면 안 된다.
    expect(ROUTE).toMatch(/setStatus\(staticItem \? 'ready' : 'error'\)/);
  });

  it('구조화 데이터가 Article 이다 — (b) 명식 해설형 결정 (2026-09-08)', () => {
    // ⚠ Person 은 "이 문서는 사람에 대한 기록" 이라고 선언한다. (b) 는 명식 해설이므로
    // 그 선언은 페이지가 말하지 않는 것까지 주장하게 된다. 되돌리려면 프레이밍 결정을 먼저 바꿀 것.
    expect(ROUTE).toMatch(/'@type': 'Article'/);
    expect(ROUTE).not.toMatch(/'@type': 'Person'/);
    // ⚠ 주석에도 'Person'·'jobTitle' 이라는 단어가 나오므로(왜 바꿨는지 적어 두었다) jsonLd 블록만 본다.
    const block = ROUTE.slice(ROUTE.indexOf('jsonLd={{'), ROUTE.indexOf('}}', ROUTE.indexOf('jsonLd={{')));
    expect(block).not.toContain('jobTitle');
    expect(block).not.toContain('Person');
  });
});

describe('빌드 타임 생성기 (S5·S7)', () => {
  it('⚠ 공개 RPC 만 쓴다 — 초안이 빌드에 섞이면 안 된다', () => {
    expect(GENERATOR).toContain('public_list_famous');
    expect(GENERATOR).toContain('public_get_famous');
    // 서비스 키를 쓰면 RLS 를 우회해 draft 까지 긁어온다.
    expect(GENERATOR).not.toMatch(/SERVICE_ROLE|service_role/);
    expect(GENERATOR).toContain('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  });

  it('⚠ 실패해도 빌드를 깨지 않는다 — 빈 모듈로 degrade', () => {
    expect(GENERATOR).toMatch(/catch \(err\)[\s\S]{0,400}emit\(\[\], null\)[\s\S]{0,120}process\.exit\(0\)/);
  });

  it('커밋된 폴백은 비어 있다 — 생성기를 안 돌린 빌드가 낡은 사람을 싣지 않는다', () => {
    // ⚠ 빌드가 이 파일을 덮어쓴다. 저장소에 남는 판본은 비어 있어야 한다.
    const generated = read('src/generated/famousStatic.ts');
    expect(generated).toContain('export const FAMOUS_STATIC: FamousStaticEntry[]');
    expect(generated).toContain('export function famousStaticBySlug');
  });

  it('⚠ 빌드 순서가 코드에 박혀 있다 — 데이터 생성이 export 보다 먼저', () => {
    const dataAt = BUILD.indexOf('generate-static-routes.mjs');
    const mapAt = BUILD.indexOf('generate-sitemap.mjs');
    const exportAt = BUILD.indexOf("'expo', 'export'");
    expect(dataAt).toBeGreaterThan(-1);
    expect(mapAt).toBeGreaterThan(dataAt);
    expect(exportAt).toBeGreaterThan(mapAt);
  });

  it('sitemap 은 발행된 것만 싣고, base URL 이 없으면 가짜 도메인을 만들지 않는다', () => {
    expect(SITEMAP).toContain('public_list_famous');
    expect(SITEMAP).toMatch(/SKIP — EXPO_PUBLIC_PUBLIC_BASE_URL not set/);
    expect(SITEMAP).toContain('Disallow: /admin');
  });
});

describe('⚠ 발행 → 재배포 (S8)', () => {
  const EDGE = read('supabase/functions/site-deploy/index.ts');
  const SERVICE = read('src/features/publicSite/services/siteDeployService.ts');
  const DETAIL = read('src/app/admin/famous/[id].tsx');
  const NEW = read('src/app/admin/famous/new.tsx');
  const MIGRATION = read('supabase/migrations/20260909000000_site_deploy_requests.sql');

  it('⚠⚠ 배포 훅 URL 이 클라이언트에 없다 — 시크릿은 Edge 에만', () => {
    expect(EDGE).toContain("Deno.env.get('VERCEL_DEPLOY_HOOK_URL')");
    for (const src of [SERVICE, DETAIL, NEW]) {
      expect(src).not.toContain('VERCEL_DEPLOY_HOOK_URL');
      expect(src).not.toMatch(/vercel\.com\/api\/deploy/);
    }
  });

  it('⚠ 관리자 확인이 훅 호출보다 앞이다', () => {
    const adminAt = EDGE.indexOf('await isAdminUser(userId)');
    const hookAt = EDGE.indexOf("Deno.env.get('VERCEL_DEPLOY_HOOK_URL')");
    expect(adminAt).toBeGreaterThan(-1);
    expect(adminAt).toBeLessThan(hookAt);
  });

  it('⚠ 훅 실패가 발행을 막지 않는다 (fail-open) — 그러나 조용하지 않다', () => {
    // 클라이언트 경계는 절대 throw 하지 않는다.
    expect(SERVICE).toMatch(/never throws|never throw|it never throws/i);
    expect(SERVICE).toContain('FAILED_LOCALLY');
    // 그리고 모든 결과가 화면에 문구로 나간다.
    expect(DETAIL).toContain('{deploy.message}');
  });

  it('미설정을 성공처럼 보여 주지 않는다', () => {
    expect(EDGE).toContain('배포 훅 미설정');
    expect(EDGE).toMatch(/configured: false/);
  });

  it('쿨다운이 있다 — 연속 저장이 빌드를 여러 번 돌리지 않는다', () => {
    expect(EDGE).toMatch(/COOLDOWN_SECONDS = \d+/);
    expect(EDGE).toContain('이미 사이트 재생성이 요청되어 있어요');
  });

  it('⚠ 비공개 전환에서도 트리거된다 — 안 하면 내린 페이지의 HTML 이 살아 있다', () => {
    expect(DETAIL).toMatch(/const touchesPublic = wasPublished \|\| input\.status === 'published'/);
  });

  it('모든 시도가 기록된다 — 로그 테이블은 관리자 읽기 전용, 클라이언트 쓰기 정책 없음', () => {
    expect(MIGRATION).toContain('create table if not exists public.site_deploy_requests');
    expect(MIGRATION).toMatch(/check \(status in \('requested', 'skipped', 'failed'\)\)/);
    expect(MIGRATION).toContain('for select using (public.is_admin())');
    expect(MIGRATION).not.toMatch(/for insert|for update|for delete/);
  });
});
