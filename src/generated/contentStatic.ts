// GENERATED — do not edit by hand. Written by `node scripts/generate-static-routes.mjs`.
//
// WHY THIS FILE EXISTS (2026-09-21). 인물(`famousStatic.ts`)과 **같은 이유**이고, 콘텐츠에서는 그것이
// 빠져 있어서 실제로 404 가 났다.
//
//   `app.json` 의 `web.output: "static"` 은 모든 경로를 빌드 때 **한 번** 그린다. 화면이 `useEffect` 에서
//   불러오면 내보내기 결과에는 빈 껍데기만 남는다. 게다가 `generateStaticParams` 가 없으면 동적 경로가
//   **`dist/content/[slug].html` 한 장**으로 접히고, 호스팅(Vercel)에는 `/content/<슬러그>` 에 해당하는
//   파일이 없어 **앱이 뜨기도 전에 404** 가 된다.
//
//   실측 2026-09-18: production 사이트맵에 있던 `/content/jo-seyoung2026` 이 404(Vercel NOT_FOUND).
//   같은 날 `/famous/<슬러그>` 는 정상이었다 — 인물만 이 장치를 갖고 있었기 때문이다.
//
// 드래프트는 샐 수 없다: 생성기는 사이트가 쓰는 **공개 RPC**(`public_list_content` / `public_get_content`)만
// 부르고, 그 함수가 서버에서 발행 상태를 거른다.
//
// 커밋된 판이 비어 있는 것은 **의도**다. 생성기를 건너뛴 빌드는 콘텐츠 페이지 0개를 만든다(틀린 페이지보다
// 없는 페이지가 낫다). `tsc` 와 jest 는 언제나 진짜 모듈을 import 한다.

export type ContentStaticEntry = {
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  channel: string;
  category: string | null;
  tags: string[];
  heroImageUrl: string | null;
  heroAlt: string | null;
  videoUrl: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  famous: { slug: string; name: string; occupation: string | null } | null;
  related: { slug: string; title: string; summary: string | null; category: string | null }[];
};

/** Published content captured at build time. Empty when the generator has not run. */
export const CONTENT_STATIC: ContentStaticEntry[] = [];

/** Build stamp — null when this is the committed fallback. */
export const CONTENT_STATIC_GENERATED_AT: string | null = null;

export function contentStaticBySlug(slug: string): ContentStaticEntry | null {
  return CONTENT_STATIC.find((e) => e.slug === slug) ?? null;
}
