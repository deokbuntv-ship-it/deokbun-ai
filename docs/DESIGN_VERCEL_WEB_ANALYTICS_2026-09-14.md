# 설계 ③ — Vercel Web Analytics 적용 (2026-09-14 · 구현 금지 · production 세션 뒤 다음 패키지)

> 목적: 웹사이트(`www.deokbunai.com`) 방문을 페이지 · 유입 경로별로 센다(쿠키 없음). 앱(네이티브)은 대상이 아니다.
> ⚠ Vercel 대시보드 · 환경변수는 **오너가** 켠다 — 이 설계는 코드 자리와 순서만 정한다.

## 1. 지금 상태 (레포 근거)

| 무엇 | 사실 | 근거 |
|---|---|---|
| 웹 빌드 | `node scripts/build-web.mjs` → 정적 경로 데이터 → 사이트맵 → `expo export -p web` → `dist/` | `vercel.json` `buildCommand` · `scripts/build-web.mjs` |
| HTML 틀 | `src/app/+html.tsx` **없음**(Expo 기본 틀). `app.json` `web.output = "static"` | — |
| 빌드 뒤 HTML 손대기 | 이미 한 번 한다 — 4단계가 `dist/index.html` 에 검색엔진 소유확인 메타를 넣는다(값이 있을 때만) | `build-web.mjs` 4/4 · `src/config/siteVerificationMeta.ts` |
| CSP | `vercel.json` 에 없음 — 같은 도메인 스크립트를 막지 않는다 | `vercel.json` |
| 의존성 | `package.json` 은 **보호 파일** — `@vercel/analytics` 패키지를 넣으려면 오너 승인이 필요하다 | `build-web.mjs` 머리 주석 |
| ⚠ 민감한 주소 | `/shared-report/<token>`(**받은 사람 누구나 여는 열쇠**) · `/report/<id>` · `/login-callback?code=…`(**OAuth 코드**) · `/admin/...` | `src/app` 경로 |

## 2. 설계

### 2-1 방식 — 패키지 없이, 빌드 뒤 HTML 에 스크립트 태그

Vercel 이 프로젝트에 붙여 주는 `/_vercel/insights/script.js` 를 **정적 HTML 에 넣는다**(패키지 추가 없음 · `package.json` 불변).
넣는 자리는 소유확인 메타와 같은 **`build-web.mjs` 의 export 뒤 단계** — 단, 이번에는 `dist/**/*.html` **전부**의 `</head>` 앞.
환경변수 **`WEB_ANALYTICS=vercel`** 일 때만 넣는다(로컬 · 대시보드 미설정 배포에서는 태그가 없다 → 404 소음 없음).

넣을 조각(초안):

```html
<script>
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
window.va('beforeSend', function (event) {
  var u = new URL(event.url);
  if (/^\/(admin|login-callback)(\/|$)/.test(u.pathname)) return null;          // 관리자 · 로그인 콜백은 보내지 않는다
  u.pathname = u.pathname
    .replace(/^\/shared-report\/[^/]+/, '/shared-report/[token]')           // 공유 열쇠를 지운다
    .replace(/^\/report\/[^/]+/, '/report/[id]');
  u.search = ''; u.hash = '';                                               // 쿼리(OAuth code · ad · src …)는 통째로 뺀다
  event.url = u.toString();
  return event;
});
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

- ⚠ **`beforeSend` 가 이 설계의 핵심이다.** 없으면 공유 링크의 열쇠(`/shared-report/<token>`)와 OAuth `code` 가 방문 기록으로 Vercel 에 쌓인다.
- 공개 페이지(`/famous/<slug>` · `/content/<slug>`)는 그대로 둔다 — 어느 글이 읽히는지가 이 기능의 목적.
- 탭 이동(주소만 바뀌는 SPA 이동)도 페이지뷰로 잡히는지 — 켠 뒤 대시보드에서 확인할 항목(§4-5).
- 구현 때 `window.va('beforeSend', …)` 방식이 스크립트 태그에서도 동작하는지 **Vercel 문서로 다시 확인**한다(패키지는 같은 큐를 쓴다).

### 2-2 코드 자리

| 파일 | 무엇 |
|---|---|
| `src/config/webAnalytics.ts` (새) | 위 조각을 **문자열 상수 하나**로 · `withWebAnalytics(html, env)`(순수 — `</head>` 앞에 한 번만, 이미 있으면 그대로) |
| `scripts/build-web.mjs` | 5/5 단계 — `WEB_ANALYTICS=vercel` 일 때 `dist/**/*.html` 전부에 `withWebAnalytics` · 넣은 파일 수 출력 |
| `src/config/__tests__/webAnalytics.test.ts` (새) | ① 조각의 `beforeSend` 를 **그 문자열 그대로** node `vm` 에서 실행해 합성 주소 표로 검사 ② 주입이 한 번만 · 환경변수 없으면 원본 그대로 |

### 2-3 처리방침 한 줄 (§3 처리자 목록 + §1)

> "[법률 검토] 서비스는 웹사이트 방문 통계를 위해 Vercel Web Analytics(Vercel Inc., 미국)를 이용합니다. 쿠키를 쓰지 않으며,
> 방문한 페이지 주소(공유 링크의 열쇠 · 로그인 정보 등 식별 가능한 부분은 지운 형태), 유입 경로, 브라우저 · 기기 종류, 국가가
> 집계됩니다. 앱에는 적용되지 않습니다."

- 국외 이전(미국) 확정 기재는 §3 의 기존 `[법률 검토]` 와 같이 정한다. 처리방침 버전은 법률 검토 반영 때 한 번에(CTO 판정).
- 앱의 데이터 보안 · 개인정보 라벨은 **바뀌지 않는다**(웹만).

## 3. 켜는 순서 (오너)

1. 처리방침 문장 + 코드가 **병합돼 있다**(코드는 환경변수가 없으면 아무것도 안 넣는다 — 먼저 올려도 안전)
2. Vercel → 프로젝트 → **Analytics → Web Analytics → Enable**
3. Vercel → Settings → Environment Variables → **`WEB_ANALYTICS` = `vercel`** (Production. Preview 는 선택)
4. 재배포(Deployments → 최신 → Redeploy) — 빌드 로그에 `5/5 Web Analytics: N개 HTML` 이 보여야 한다
5. 확인 — 아래 §4

되돌리기: 3 의 환경변수를 지우고 재배포(태그가 빠진다) · 또는 2 에서 Disable.

## 4. 합성 반례 · 확인 계획

| # | 반례 · 확인 | 기대 |
|---|---|---|
| 1 | `https://…/shared-report/9f3a…?utm=x#y` | `https://…/shared-report/[token]` |
| 2 | `https://…/login-callback?code=abc&state=z` | 보내지 않음(`null`) |
| 3 | `https://…/admin/users/<id>` | 보내지 않음 |
| 4 | `https://…/report/<uuid>` | `/report/[id]` |
| 5 | `https://…/famous/iu?ad=ad_7k3m9p2q&src=src_xxxxxxxx` | `/famous/iu`(쿼리 제거 · slug 유지) |
| 6 | 환경변수 없이 빌드 | `dist` 의 HTML 이 **바이트까지 그대로** |
| 7 | 두 번 주입 | 조각이 **한 번**만 |
| 8 | 켠 뒤 실사이트 — 개발자도구 네트워크 | `/_vercel/insights/script.js` 200 · 공유 페이지에서 보낸 주소에 `[token]` |
| 9 | 켠 뒤 대시보드 | 몇 분 안에 방문이 보인다 · 탭 이동이 페이지뷰로 잡히는지 |

## 5. 변경 목록

| 종류 | 무엇 |
|---|---|
| **마이그레이션** | **없음** |
| **Edge** | **없음** |
| 웹 빌드 · 앱 | `src/config/webAnalytics.ts`(새) · `scripts/build-web.mjs` 한 단계 · 테스트 1 |
| 문서 | 처리방침 §1 · §3 한 줄 `[법률 검토]` |
| 오너 | Vercel 대시보드 Enable · 환경변수 `WEB_ANALYTICS=vercel` · 재배포 (요금제의 이벤트 한도는 대시보드에서 확인) |
| 비용 | LLM 0 |
