# 오너 런북 — 웹 공개(병합) 2026-09-10

> 목표: `www.deokbunai.com` 을 새 코드로 바꿉니다. 계정삭제 안내와 개인정보 처리방침이
> **실사이트에 떠야** 구글 제출에 쓸 수 있습니다.
>
> ⚠ **유명인은 이번에 올리지 않습니다.** 가상 인물 발행은 보류 판정입니다(CTO).

---

## 0. 지금 상태 (실측 2026-09-10)

| | |
|---|---|
| 작업 브랜치 | `admin/master-operations-content` |
| `main` 에만 있는 커밋 | **0건** → 충돌 없이 병합됩니다 |
| 작업 브랜치에만 있는 커밋 | **307건** |
| 공통 조상 | `28c406a4` |

⚠ **지금 실사이트는 307커밋 전의 코드입니다.** 계정삭제 안내(`/account-deletion`)도,
약관 §6 탈퇴 조항도 아직 실사이트에 없습니다.

---

## ① 커밋 · 푸시 → Vercel Preview

지난 묶음과 이번 묶음의 변경이 전부 커밋되지 않은 채 있습니다. 한 번에 커밋하십시오.
커밋 메시지 초안은 이번 보고서 맨 끝에 있습니다.

```bash
cd C:\Development\DeokbunAI-app
git add -A
git commit -F <메시지파일>
git push origin admin/master-operations-content
```

푸시하면 Vercel 이 **Preview** 빌드를 만듭니다. 빌드 로그에서 두 줄을 확인하십시오:

- `[build-web] 1/3 static route data` 뒤의 Supabase host
- `[build-web] 4/4 소유확인 메타: 건너뜀 …` (환경변수를 아직 안 넣었으면 이것이 정상입니다)

## ② Preview 확인 목록

> ⚠⚠ **Preview 도 production DB 를 봅니다.** 웹 빌드는 Preview·Production 모두 production 을
> 읽습니다. 그래서 Preview 에서 **가입·결제·발행 같은 쓰기 행동을 하지 마십시오.**
> 읽기만 하십시오.

| # | 확인할 것 | 어떻게 |
|---|---|---|
| 1 | `/account-deletion` 이 **로그인 없이** 열린다 | 시크릿 창으로 연다 |
| 2 | 그 페이지에 삭제 절차·삭제 범위·보존 항목이 있다 | 읽어 본다 |
| 3 | `/terms-of-service` 에 **§6 회원 탈퇴(계정 삭제)** 가 있다 | 스크롤 |
| 4 | `/privacy-policy` 가 열리고 §6 에 탈퇴 경로가 있다 | 스크롤 |
| 5 | `/ai-notice` · `/duk-policy` · `/refund-policy` · `/minor-policy` 가 열린다 | 주소 직접 입력 |
| 6 | `/sitemap.xml` 이 200 이고 위 주소들이 들어 있다 | 주소 직접 입력 |
| 7 | 홈이 흰 화면이 아니다 | 열어 본다 |

⚠ 1·3·4 중 하나라도 안 되면 **병합하지 마십시오.** 구글 제출에 그 주소를 써야 합니다.

## ③ production Edge 배포 — **이번에는 필요 없습니다**

이번 묶음에서 익명(로그인 없이) 경로에 새 제한을 만들지 않았습니다. 이유는 측정 결과입니다:

`[staging]` 공개 키만 들고 Edge 18개를 전부 두드려 봤습니다.

| 결과 | 함수 |
|---|---|
| **401 (로그인 필요)** | `chat` · `famous-compose` · `famous-suggest` · `content-generate` · `media-generate` · `site-deploy` · `account-delete` · `verify-purchase` · 크론 4종 |
| 200 (익명 허용) | `ad-track` — **LLM 을 부르지 않습니다.** 이미 방문자당 횟수 제한이 걸려 있습니다 |
| 400 (입력 검증) | `naver-auth` · `apple-notifications-v2` · `google-rtdn` — LLM 없음 |
| 404 (배포 안 됨) | `video-generate` · `video-status` |

**LLM 을 부르는 경로 중 로그인 없이 열린 것은 하나도 없습니다.** `main`(= 지금 실사이트)의
`chat` 도 같은 가드(`withSupabase({ auth: 'user' })` + `verify_jwt = true`)를 갖고 있습니다.
**지금도 열려 있는 구멍은 없습니다.**

⚠ 단, **production 의 Edge 설정은 확인하지 못했습니다**(이번 지시서가 production 접속을
금지했습니다). 위는 staging 실측 + `main` 소스 대조입니다.

## ④ GitHub 에서 main 으로 병합

1. GitHub → 저장소 → **Pull requests** → **New pull request**
2. base: `main` ← compare: `admin/master-operations-content`
3. "Able to merge" 가 보이는지 확인 (main 에만 있는 커밋이 0건이라 충돌이 없어야 합니다)
4. **Create pull request** → 제목은 커밋 메시지 첫 줄 그대로
5. **Merge pull request** → **Confirm merge**
6. Vercel 이 **Production** 빌드를 시작합니다 (2~4분)

## ⑤ 병합 후 5분 확인

| # | 확인할 것 | 주소 |
|---|---|---|
| 1 | 계정삭제 안내 (로그인 없이) | `https://www.deokbunai.com/account-deletion` |
| 2 | 이용약관 §6 | `https://www.deokbunai.com/terms-of-service` |
| 3 | 개인정보 처리방침 | `https://www.deokbunai.com/privacy-policy` |
| 4 | 사이트맵 | `https://www.deokbunai.com/sitemap.xml` |
| 5 | 빌드 로그의 Supabase host | Vercel → Deployments → 최신 → Build Logs |
| 6 | 관리자 원가 화면의 안내 문구 | 관리자 → AI 사용량 → "최근 24시간 AI 비용" |

⚠ **6번의 기대값**: production 에 마이그레이션 15를 아직 안 올렸다면
**"이 환경에는 아직 원가 기능이 설치되지 않았습니다."** 가 보여야 합니다.
"불러오지 못했습니다" 가 보이면 알려 주십시오 — 그건 다른 뜻입니다(일시 오류).

⚠ 1~3 은 **구글 플레이 제출에 그대로 넣을 주소**입니다. 열리는 것을 확인한 뒤에 넣으십시오.

## ⑥ 확인이 끝나면

### 6-1. Vercel 의 죽은 환경변수 삭제

Vercel → 프로젝트 → Settings → Environment Variables →
**`EXPO_PUBLIC_SUPABASE_ANON_KEY`** 삭제.

⚠ 코드가 이 이름을 **읽지 않습니다**(`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 만 읽습니다).
남겨 두면 "키가 두 개인가" 하는 혼동만 남습니다.

### 6-2. Google Search Console 등록 (가비아 DNS TXT)

1. [Search Console](https://search.google.com/search-console) → 속성 추가 → **도메인**
2. `deokbunai.com` 입력 → TXT 레코드 값이 나옵니다
3. 가비아 → 도메인 관리 → DNS 설정 → TXT 레코드 추가 (호스트 `@`)
4. 몇 분 뒤 Search Console 에서 **확인** 클릭
5. 확인되면 → 색인 생성 → sitemap 제출: `https://www.deokbunai.com/sitemap.xml`

### 6-3. 네이버 서치어드바이저 등록 (메타 태그)

네이버는 DNS 방식이 없어 **HTML 메타 태그**를 씁니다. 그래서 환경변수로 넣도록 만들어 두었습니다.

1. [서치어드바이저](https://searchadvisor.naver.com) → 웹마스터도구 → 사이트 등록
2. `https://www.deokbunai.com` 입력 → **HTML 태그** 방식 선택 → `content` 값을 복사
3. Vercel → Settings → Environment Variables → **Production** 에 추가:

   | 이름 | 값 |
   |---|---|
   | `EXPO_PUBLIC_NAVER_SITE_VERIFICATION` | 복사한 content 값 (태그 전체가 아니라 **값만**) |

4. Vercel → Deployments → 최신 → **Redeploy** (환경변수는 재빌드해야 반영됩니다)
5. 빌드 로그에 `[build-web] 4/4 소유확인 메타 넣음 → dist/index.html` 이 보이는지 확인
6. 서치어드바이저에서 **소유확인** 클릭

> 구글도 메타 태그 방식을 쓰고 싶으면 같은 자리에 `EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION`
> 을 넣으면 됩니다. 값이 없으면 **태그를 아예 넣지 않습니다** — 빈 값을 넣으면 콘솔이
> "값이 다르다" 로 읽어 확인이 실패합니다.

---

## ⑦ 네이버 로그인 — 콜백 주소 확인 (오너 할 일)

코드가 쓰는 콜백 주소는 두 개입니다:

| 환경 | 주소 | 근거 |
|---|---|---|
| 웹 | `https://www.deokbunai.com/login-callback` | `src/features/auth/services/authRedirect.ts:27` — `EXPO_PUBLIC_PUBLIC_BASE_URL` + `/login-callback` 로 **고정**합니다 |
| 앱(네이티브) | `deokbunai://login-callback` | 같은 파일 25행 — 웹이 아니면 expo `makeRedirectUri` 로 앱 스킴 |

**네이버 개발자센터 → 내 애플리케이션 → API 설정 → 서비스 URL / Callback URL** 에
위 두 개가 등록돼 있는지 확인하십시오. 웹 주소가 apex(`deokbunai.com`)로만 등록돼 있으면
`www` 가 붙은 위 주소와 **정확히 일치하지 않아** 로그인이 실패합니다.

⚠ 같은 이유로 **Supabase → Authentication → URL Configuration → Redirect URLs** 에도
위 두 주소가 있어야 합니다(구글·카카오는 Supabase 를 거칩니다). 없으면 Supabase 가
Site URL 로 되돌려 보내고, 그 기본값은 `http://localhost` 입니다.
