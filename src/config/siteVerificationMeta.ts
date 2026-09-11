// 검색엔진 소유확인 메타 태그 — **값이 있을 때만** 넣는다.
//
// WHY THIS EXISTS. Google Search Console 과 네이버 서치어드바이저는 소유확인 방법으로
// `<meta name="…-site-verification" content="…">` 를 받는다. 그 값은 **사이트마다 다르고
// 오너가 콘솔에서 받아 오는 것**이라 레포에 박을 수 없다. 그래서 빌드 시각 환경변수로 받는다.
//
// ⚠ 값이 없으면 **태그를 아예 넣지 않는다.** 빈 content 를 넣으면 콘솔이 "태그는 있는데 값이
//   다르다" 로 읽어 확인이 실패하고, 원인이 눈에 안 보인다. 없는 편이 낫다.
//
// ⚠ 왜 컴포넌트(`SeoHead`)가 아니라 빌드 후처리인가: 소유확인은 **사이트 루트**(`/`)를 가져가
//   확인한다. 루트는 `(tabs)/index` 인데 그 화면은 `SeoHead` 를 쓰지 않고, 넣으면 모든 탭
//   페이지에 같은 태그가 복제된다. 루트 HTML 한 장에만 넣는 것이 정확하고 작다.

export const VERIFICATION_ENV = {
  EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: 'google-site-verification',
  EXPO_PUBLIC_NAVER_SITE_VERIFICATION: 'naver-site-verification',
} as const;

/** 넣을 메타 태그 문자열. 값이 없으면 빈 문자열. */
export function verificationMetaTags(env: Readonly<Record<string, string | undefined>>): string {
  return Object.entries(VERIFICATION_ENV)
    .map(([key, name]) => [name, (env[key] ?? '').trim()] as const)
    .filter(([, value]) => value !== '')
    // ⚠ content 를 그대로 넣지 않는다. 따옴표가 섞이면 head 가 깨진다.
    .map(([name, value]) => `<meta name="${name}" content="${escapeAttr(value)}">`)
    .join('');
}

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * HTML 의 `<head>` 안에 태그를 넣는다.
 *
 * ⚠ 두 번 돌려도 하나만 남는다 — 같은 `name` 의 기존 태그를 먼저 지운다. 빌드를 두 번 하면
 *   태그가 두 장 되는 것이 이런 후처리의 흔한 결함이다.
 */
export function withVerificationMeta(html: string, env: Readonly<Record<string, string | undefined>>): string {
  const names = Object.values(VERIFICATION_ENV);
  const stripped = names.reduce(
    // ⚠ 역슬래시를 쓰지 않는다(`\s`). 이 파일을 스크립트로 생성하면 이스케이프가 한 겹 먹혀
    //   `\s` 가 `s` 가 되고, 정규식은 조용히 아무것도 안 지운다 — 실제로 한 번 당했다.
    (acc, name) => acc.replace(new RegExp(`<meta[^>]*name="${name}"[^>]*>`, 'gi'), ''),
    html,
  );
  const tags = verificationMetaTags(env);
  if (tags === '') return stripped;
  const at = stripped.search(/<head[^>]*>/i);
  if (at < 0) return stripped; // head 가 없으면 손대지 않는다 — 짐작해서 넣지 않는다.
  const end = stripped.indexOf('>', at) + 1;
  return stripped.slice(0, end) + tags + stripped.slice(end);
}
