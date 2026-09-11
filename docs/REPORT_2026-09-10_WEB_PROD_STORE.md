# 보고서 — 웹 공개 준비 · production 안전 · 출시 요건 선점 (2026-09-10 #2)

## 한 줄

**웹 병합 준비 끝 · production 적용 대기는 14·15 두 건이고 둘 다 "변화 없음/새 객체만" 으로
판정됨 · 스토어 제출에는 코드 작업 두 가지가 남았다.**

## 🔴 긴급 (보고서 맨 위에 두라고 지시받은 것)

| | 내용 |
|---|---|
| 🟢 **익명 경로: 지금도 열려 있지 않다** | staging Edge 18개를 공개 키로 전수 두드려 LLM 경로가 **전부 401** 임을 확인했다. `main`(= 지금 실사이트)의 `chat` 도 같은 가드다. **PART 3-1 은 (1) 기록만** 이다. LLM 0콜 사용 |
| 🔴 **구글: AI 콘텐츠 신고 기능이 없다** | 구글 AI 생성 콘텐츠 정책이 **앱 내 신고·플래그**를 요구한다(원문 확인 2026-09-10). 지금은 "도움됨/도움 안 됨" 투표만 있다 → **제출 전 필수 코드 작업** |
| 🟠 **구글: target API 36 시한이 이미 지났다** | 2026-08-31 부터 신규 제출은 API 36 이상. **현재 값 미확인** (managed 워크플로라 레포에서 안 보인다) |
| 🟡 **운영 키는 비밀 키가 아니었다** | 받은 값은 `sb_publishable_` 로 시작한다. 가드 함수로 판정했다 — `isSecretKey=false · isPublishableKey=true`. **`eas.json` 에 넣었다** |
| 🟡 **리포트 본문을 사용자가 다시 쓸 수 있다** | 공유 링크가 그것을 그대로 보여 준다. RLS 로는 못 막는다(클라이언트가 합성하는 설계). 피해 범위는 좁다 → `KNOWN_RISKS` **M13**, **[CTO 판정]** |

---

## PART 0 — 현황 조사

**상태: 완료** · 환경 `[local]` `[staging]` `[production · 오너 제공 스냅샷]`

### 0-1 환경

| | |
|---|---|
| 브랜치 | `admin/master-operations-content` · HEAD `455a249` |
| 미커밋 | **65건** (수정 34 · 신규 31) |
| 테스트 | **350 스위트 / 5,926건 전부 통과** (기준선 345 / 5,832 → **+5 / +94**) |
| `tsc --noEmit` | 통과 |
| `release-preflight` | **PASS · 0 blocker** (21 ok · 2 warn) |

### 0-2 환경변수 매트릭스

| 변수 | development | staging | internal | production | Vercel |
|---|---|---|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | ✅ | ✅ | ✅ staging | ✅ | 필요 |
| `EXPO_PUBLIC_BUILD_PROFILE` | ✅ | ✅ | ✅ | ✅ | — |
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ staging | ✅ staging | ✅ staging | ✅ production | ✅ production |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | ✅ | ✅ | ✅ **이번에 넣음** | ✅ |
| `EXPO_PUBLIC_PUBLIC_BASE_URL` | — | — | — | — | ✅ 필요 |
| `EXPO_PUBLIC_NAVER_CLIENT_ID` | — | — | — | — | ✅ 필요 |
| `EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION` | — | — | — | — | 선택 (**신설**) |
| `EXPO_PUBLIC_NAVER_SITE_VERIFICATION` | — | — | — | — | 선택 (**신설**) |
| ~~`EXPO_PUBLIC_SUPABASE_ANON_KEY`~~ | — | — | — | — | ⚠ **죽은 값. 코드가 안 읽는다** → 삭제 |

**빠지면 깨지는 것**: `SUPABASE_URL`/`PUBLISHABLE_KEY` 없으면 **앱이 부팅에서 throw**.
`PUBLIC_BASE_URL` 없으면 canonical·OG·sitemap·**네이버 로그인 리디렉트**가 origin 추측으로
떨어져 `localhost` 로 되돌아간다. `NAVER_CLIENT_ID` 없으면 네이버 버튼이 authorize URL 을
못 만든다. 소유확인 두 개는 없으면 **태그를 안 넣는다**(의도된 동작).

### 0-3 main 대 작업 브랜치 `[local]`

**main 에만 있는 커밋 0건 · 작업 브랜치에만 307건 · merge-base `28c406a4`.**
→ 충돌 없이 병합 가능. **지금 실사이트는 307커밋 전 코드다.**

### 0-4 로그인 없이 부를 수 있는 경로 `[staging]`

공개 키(`sb_publishable_-Ti…`)만 들고 Edge 18개에 POST 했다.

| 상태 | 함수 | LLM? | 방어 |
|---|---|---|---|
| **401** | `chat` · `famous-compose` · `famous-suggest` · `content-generate` · `media-generate` · `site-deploy` · `account-delete` · `verify-purchase` · 크론 4종 | 예(앞 5개) | `withSupabase({auth:'user'})` + `verify_jwt` |
| **200** | `ad-track` | **아니오** | 방문자당 횟수 제한 (§53, 10회/창) |
| **400** | `naver-auth`(MISSING_CODE_OR_STATE) · `apple-notifications-v2` · `google-rtdn`(INVALID_INPUT) | 아니오 | 입력 검증 · 서명 |
| **404** | `video-generate` · `video-status` | — | 배포 안 됨 |

**1회 원가 추정: 익명 경로의 LLM 원가는 0원이다 — 부를 수 있는 것이 없다.**
`main` 의 `chat/index.ts` 도 같은 가드를 갖고 있다(소스 대조). **"지금도 열려 있음" 없음.**
⚠ **production Edge 설정은 미확인** (이번 지시서가 접속을 금지).

### 0-5 production 에 아직 없는 객체에 기대는 코드

`20260915000000` 이 만드는 `model_pricing` · `fx_rate` · `admin_ai_cost_window()`.
쓰는 곳은 관리자 화면 둘(`/admin/ai-usage`, `/admin` 대시보드 타일).
**PART 3-2 에서 네 갈래로 갈라 고쳤다** — 아래.
(13·14 는 정책만 지우므로 "없는 객체" 를 만들지 않는다.)

### 0-6 `site-deploy` 훅

시크릿이 없으면 **이미 건너뛴다** — `record('skipped', …)` 후
`{outcome:'skipped', configured:false}` 와 사람이 읽는 안내를 돌려준다
(`supabase/functions/site-deploy/index.ts:144-153`). **오류가 아니다.**
→ 3-5 의 "먼저 고쳐서 배포" 선행 단계 **불필요**.

### 0-7 로그인 수단 `[staging]`

`/auth/v1/settings` 직접 조회: **google `true` · kakao `false` · apple `false` · email `true`
(확인메일 필요) · anonymous `false`.** 네이버는 Supabase 제공자가 아니라 자체 Edge —
`NAVER_CLIENT_ID`/`SECRET` 시크릿은 **설정돼 있다**.
→ **staging APK 에서 되는 것은 구글.** 상세는 `docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md`.

### 0-8 결제(IAP) 기존 자산

전수 조사 결과는 `docs/STORE_READINESS_2026-09-10.md` §5-4-1 표(11항목).
요약: **DB·RPC·멱등성·부채 상계·어댑터 골격이 전부 있고, 없는 것은 셋** —
검증기 본체 · 네이티브 모듈 · `product_catalog` 행.

### 0-9 외부 AI 동의 · 신고

- **동의**: 업체명(OpenAI·Supabase)이 처방침에 있다(`legalContent.ts:61`).
  ⚠ 필수 동의는 3항목 묶음이고 **AI 전송 전용 항목이 없다** → 애플 5.1.2(i) 위험.
- **신고**: **없다.** `helpful`/`not_helpful` 투표만 있다 → 구글 정책 미충족.

### 0-10 약관 조 번호

약관 **§6 = 회원 탈퇴 · §7 = 약관의 변경**. 처방침 §6 이 약관 제6조를 가리킨다(정확).
전수 검색에서 **낡은 참조는 1건뿐**: `docs/PROJECT_STATE.md` L5 "§1~§6 에 탈퇴 조항이
아예 없다" → **고쳤다**. `POLICY_MATRIX` 의 §5 참조 2건은 지금도 정확하다.

### 0-11 미래 날짜 마이그레이션

61개 중 **6개**가 오늘(2026-09-10)보다 뒤: `20260910` ~ `20260915`.
⚠ 그리고 **`20260832`~`20260847` 은 아예 날짜가 아니다**(8월 32~47일) — 번호는 **순번**이다.

---

## PART 1 — 승인 사항 반영

**상태: 부분** (1-1 막힘 · 1-2 완료 · 1-3 완료)

### 1-1 `expo-image` 플러그인 — 🔴 **막혔다**

`app.json` 의 `plugins` 에 `"expo-image"` 를 넣으려 했으나 **권한 계층이 Edit 을 거부**했다:
> "File is in a directory that is denied by your permission settings"

지시서가 이 한 건을 승인했지만 **도구 수준에서 막혀 있고, 우회하지 않았다.**
→ **오너 할 일** 목록에 diff 로 넣었다.

**보호 파일 6개 SHA-256 (앞 16자, 2026-09-10 실측)** — **전부 불변**:

| 파일 | SHA (앞 16) |
|---|---|
| `app.json` | `a326af8bfe02c782` ⚠ **변경 못 함** |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_REPORT.md` | `e7ae7dc31647352a` |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_2_REPORT.md` | `95c26873041912c1` |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_3_REPORT.md` | `edc974b5428a1fb9` |
| `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` | `23bfa4a4a02b084b` |
| `docs/RUBRIC_KNOWN_LIMITATIONS.md` | `58f11e7990bd3f47` |

### 1-2 production 프로필 키 — ✅ **완료**

받은 값 `sb_publishable_zTRz17S…` 를 **가드 함수로 판정**했다:
`isSecretKey = false` · `isPublishableKey = true` → 안전. `eas.json` production `env` 에 넣었다.
`EXPO_PUBLIC_SUPABASE_URL` 은 production ref 로 이미 맞다.
production 프로필에 **빠진 다른 변수는 없다**(0-2 표).

### 1-3 스토어 빌드 설정 가드 — ✅ **완료**

`src/config/buildProfileGuard.ts` + 합성 반례 **31건** (`buildProfileGuard.test.ts`).
실제 `eas.json` 판정은 `scripts/release-preflight.mjs` §10 이 한다.

**현재 판정 — 네 프로필 전부 `정상`. blocker 0.**
(키를 넣기 전에는 production 이 BLOCK 이었다: "production 프로필에
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 없음 — 앱이 부팅에서 throw 한다".
**가드가 실제로 잡았고, 키가 그것을 풀었다.**)

**규칙과 설정이 충돌한 곳은 없다.** 규칙을 느슨하게 고친 곳도 없다.

---

## PART 2 — production 마이그레이션 판정 자료 (적용 안 함)

**상태: 완료** · 환경 `[staging]` + `[production · 오너 제공 스냅샷]`

### 2-1 `--include-all` 이 필요했던 이유 — **필요하지 않았다** `[staging]`

staging 이력 **61건 전부 `local == remote`**. 20260913000000 뒤 버전 중 **로컬 파일이 없는
것 0건**. 실측으로도 확인했다 — `20260915000000` 을 `reverted` 로 되돌린 뒤 `db push --dry-run`
을 돌리자 `--include-all` 요구 없이 그 한 줄만 나왔고, `applied` 로 복구한 뒤
`upToDate: true` 로 돌아왔다.

⚠ 지난 런북의 `--include-all` 언급은 **경고**였지 요구가 아니었다(`OWNER_RUNBOOK_2026-09-10.md:42`).

### 2-2 production 이력 대조 `[production · 오너 제공 스냅샷]`

파일: `C:\Development\owner_inputs\prod_snapshot.txt` (21:49 생성 — **처음 확인했을 때는
폴더 자체가 없었다**. CTO 정정 후 다시 읽었다). **레포로 복사하지 않았다.**

| | |
|---|---|
| `has_model_pricing` | **`false`** |
| `rls_off_tables` | **`null`** |
| 이력 | **59건** (`20260817000000` ~ `20260913000000`) |
| 정책 | **59개 / 42개 표** |
| **적용 대기** | **`20260914000000` · `20260915000000` — 정확히 2건** |
| 로컬 파일 없는 원격 버전 | **0건** |
| `--include-all` | **불필요** (대기 2건 모두 이력 최댓값보다 뒤) |

**환경 판독: production 이 맞다.** 원가 표 없음 · RLS 꺼진 표 없음 · 13 은 들어가 있음(9/7 반영분).
**CTO 예상(14·15 두 건)과 일치.**

### 2-3 13·14 가 지우는 정책 — **판정 대상은 14뿐. 결론: 변화 없음**

**14 — `conversation_messages` 옛 이름 2개.**
production 에 정책이 4개 있고 **조건이 글자까지 같은 두 쌍**이다:

| 명령 | 14가 지움 | 남음 | 조건 |
|---|---|---|---|
| INSERT | `insert messages into own conversation` | `messages_insert_via_conversation` | `EXISTS(conversations c WHERE c.id=conversation_id AND c.user_id=auth.uid())` |
| SELECT | `select messages of own conversation` | `messages_select_via_conversation` | 같은 식 |

- 레포에서 옛 이름을 **만드는 마이그레이션은 없다**(61파일 전수 검색 0건).
- 남는 둘은 `20260817000300_consumer_core_conversations.sql:131,139`.
- permissive OR 결합에서 조건이 같으므로 **한쪽을 지워도 결과가 같다.**

**→ 접근 변화 없음. 깨지는 기능 없음. 순수 중복 정리.**

**13 — 이미 적용됨. 무엇을 지웠는지만 기록** (지시받은 대로):

| 표 | 지워진 옛 정책 |
|---|---|
| `consultation_drafts` | `insert/select/update own draft` (3) |
| `consultation_subjects` | `delete/insert/select/update own subjects` (4) |
| `conversations` | `insert/select/update own conversations` (3) |

스냅샷에 이 10개가 **하나도 없다** → 실제로 지워졌다.
⚠ 그리고 **좋은 결과가 하나 확인됐다**: `conversations` 의 INSERT 정책이 이제
`conversations_insert_own` 하나뿐이고, 그것이 `subject_id` 소유까지 본다.
13 이 걱정했던 "옛 정책이 OR 로 붙어 제한을 무효화" 는 **해소됐다.**

### 2-4 H5 관련 여부 — **무관**

H5 는 `global_reservation_requests` 표의 **RLS enable + revoke/grant**(정책이 아님,
`20260912000000`). 13·14 가 건드리는 표 넷에 없다. 그리고 **`20260912000000` 은 production
에 이미 적용돼 있고**(이력 ≤ 20260913) `rls_off_tables = null` 이다.

### 2-5 오너용 런북

→ **`docs/OWNER_RUNBOOK_PROD_MIGRATION_14_15.md`** (①~⑤ 전부, 복사해 붙일 수 있게).
DB 비밀번호는 어디에도 적지 않았다.

### 2-6 새 마이그레이션 파일명 도구 — ✅ (CTO 정정 반영)

| | |
|---|---|
| 규칙 | **번호는 날짜가 아니라 순번.** 새 번호 = 앞 8자리 +1, 뒤는 0 → 지금은 `20260916000000` |
| 도구 | `scripts/next-migration-name.mjs` (`--create` 로 멱등 머리말과 함께 생성) |
| 판정 함수 | `src/config/nextMigrationVersion.ts` — **현재 시각을 보지 않는다** |
| 합성 반례 | `nextMigrationVersion.test.ts` **15건** — 더 큰 번호 있을 때/없을 때 · 연달아 두 번 · 날짜 아닌 번호가 최대일 때 · 뒤 6자리가 0이 아닐 때 · 목록 순서 무관 · 14자리 아닌 이름 무시 |
| 문서화 | `docs/PROJECT_STATE.md` **"작업 규칙"** 절 신설 |

### 2-7 사용자가 직접 쓸 수 있는 표 점검 (CTO 추가 과제)

**상태: 레포·스냅샷 분석 완료 · staging 실측 막힘**

⚠ **컬럼 단위 권한이 레포 전체에 한 줄도 없다.** 따라서 **행을 쓸 수 있으면 그 행의 모든 칸을
쓸 수 있다** — 표 단위 판단이 곧 칸 단위 판단이다. production 쓰기 정책 **32개를 전수**로 읽었다.

| 표 | 사용자 쓰기 | 서버만 써야 할 칸이 막혀 있나 |
|---|---|---|
| `duk_ledger` · `duk_reserve` · `duk_debt` · `paid_requests` · `consultation_decisions` · `verified_purchases` · `purchase_revocations` · `plus_entitlements` · `admin_users` · `economy_policy` · 전역 예약 2종 | **없음** | ✅ 정책 자체가 없다 |
| `profiles` UPDATE | `display_name` 뿐 | ✅ 관리자 승격 불가 |
| `conversation_messages` INSERT | 부모 대화 소유 확인 | ✅ **update·delete 정책 없음**(덧붙이기 전용). 서버가 이 표를 읽지 않는다 — `role='assistant'` 위조는 자기 화면에만 남는다 |
| `conversations` UPDATE | `user_id = auth.uid()` 만 | ⚠ INSERT 가 거는 **subject 소유 조건을 UPDATE 는 다시 걸지 않는다.** 남의 `subject_id` 를 붙일 수 있으나 그 사람 출생정보는 RLS 로 못 읽는다. **실피해 없음. 대칭 맞추려면 한 줄** |
| `report_shares` ALL | 자기 리포트의 공유만 | ⚠ `expires_at`·`opened_count` 를 스스로 바꿀 수 있다(사소) |
| **`consultation_reports` ALL** | **`report_payload` 포함 전부** | 🟡 **`get_shared_report` 가 그것을 그대로 공유 링크에 보여 준다** |

**🟡 유일한 실질 발견 = `consultation_reports`.** RLS 로 못 막는다 — 리포트를
**클라이언트가 합성해 upsert** 하는 설계이기 때문이다(`reportService.ts:97,110`).
정책을 좁히면 앱이 깨진다. → `KNOWN_RISKS` **M13** 신설, **[CTO 판정]**.
피해 범위: 자기 리포트만 · 받는 사람도 로그인 필요 · **과금은 Edge 가 하므로 돈이 안 걸린다**.
실질은 브랜드 귀속 문제다.

**회귀 고정**: `src/features/duk/__tests__/serverOwnedTablesRls.test.ts` — 20건.
⚠ **양성 대조 4건을 함께 넣었다.** 정규식이 조용히 깨지면 13개 표가 전부 초록으로 남기
때문이다(실제로 이 파일을 쓰다가 한 번 그렇게 만들었다).

⚠ **staging 실측(위조 시도)은 못 했다** — 일반 사용자 JWT 가 없다. 레포의 기존 e2e
하네스도 오너가 주는 `STAGING_JWT_A/B` 를 요구한다(`scripts/staging/economy-e2e.mjs:29`).
**테스트 행을 만들지 않았으므로 지울 것도 없다.**

---

## PART 3 — 웹 공개 준비

**상태: 3-6 부분 · 나머지 완료**

### 3-1 익명 경로 비용 방어 — **(1) 기록만** ✅

0-4 결과대로 **익명 경로가 LLM 을 부르지 않는다.** 새 제한을 만들지 않았다.
`main` 에도 같은 가드가 있어 "지금도 열려 있음" 항목은 **없다**. **LLM 0콜 / 상한 5.**

### 3-2 관리자 원가 화면 — RPC 없는 환경에서 안 깨진다 ✅

`costWindow` 의 반환을 `null | rows` 에서 **네 갈래**로 바꿨다:

```
ok (rows) · not_installed · forbidden · failed
```

- 분류는 **오류 코드**로 한다(문자열이 아니라): `PGRST202`·`42883` → 미설치,
  `P0001`·`42501`·`PGRST301` → 권한.
- 화면 문구: **"이 환경에는 아직 원가 기능이 설치되지 않았습니다."**
  (대시보드 타일은 `미설치`). "불러오지 못했습니다"(일시 오류)와 **섞지 않는다** —
  오너가 할 일이 재시도가 아니라 마이그레이션 적용이기 때문이다.
- **합성 검증**: 렌더 5건(RPC 없음 / 권한 없음 / 실패 / 0건 / 정상) + 분류기 10건 +
  화면 두 곳이 미설치를 다르게 그리는지 1건.

### 3-3 약관 조 번호 ✅

전수 검색 결과 **낡은 참조 1건** → 고쳤다(0-10).

### 3-4 검색 등록 준비 ✅

| | |
|---|---|
| 변수 | `EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION` · `EXPO_PUBLIC_NAVER_SITE_VERIFICATION` |
| 넣는 곳 | Vercel Production 환경변수 → 재빌드 |
| 들어가는 자리 | `dist/index.html` 의 `<head>` (**사이트 루트 한 장만**) |
| 판정 함수 | `src/config/siteVerificationMeta.ts` · 합성 11건 |
| 빌드 배선 | `scripts/build-web.mjs` 4/4 단계 |

**값이 없으면 태그를 아예 넣지 않는다.** 빈 값을 넣으면 콘솔이 "값이 다르다" 로 읽어
확인이 실패하기 때문이다. 두 번 돌려도 하나만 남고, 값이 바뀌면 옛 값이 사라진다.
`.env.example` 에 이름과 이유를 적었다. 런북 위치: 병합 런북 ⑥-2·⑥-3.

### 3-5 staging 배포 훅 제거 ✅ `[staging]`

0-6 에서 **이미 "건너뜀 + 기록"** 이었으므로 선행 수정 없이 바로 지웠다.
`npx supabase secrets unset VERCEL_DEPLOY_HOOK_URL --project-ref aephpsiurgkvqcswyeie`
→ 남은 시크릿 13개 확인.

### 3-6 가상 인물 표시 확인 — **부분 (발행 막힘)**

**발행하지 못했다**: staging 관리자 로그인 수단이 없고, 지시서가 테스트 전용 우회 로그인을
금지한다. 익명 조회로 `famous_profiles` 를 읽으면 `200 []` — 발행된 것이 없다(RLS 정상).

**대신 발행보다 강한 것을 했다.** 지난 런북 §5-3 이 *"공개 페이지에 그 표시가 실제로
노출되는지는 확인하지 않았습니다"* 로 남겨 둔 질문을, **런북과 글자까지 같은 값**으로
합성해 렌더로 잰다 — `src/app/__tests__/famousFictional.render.test.tsx` **6건**:

| 확인 | 결과 |
|---|---|
| `가상 인물 (예시)` · `실존하지 않는 가상 인물입니다` · `실존 인물이 아니며` 가 화면에 보인다 | ✅ |
| 고지가 **본문보다 위**에 있다 | ✅ |
| 출생정보가 지어낸 값이라는 출처 메모가 보인다 | ✅ |
| ⚠ 네 칸을 비우면 "가상" 이라는 말이 **사라진다** (표시 수단이 이것뿐이라는 증거) | ✅ 고정함 |
| `noindex` 정책이면 robots 메타가 붙는다 / `index` 면 안 붙는다 | ✅ |

**보강은 하지 않았다** — 네 칸을 채우면 표시가 실제로 보이기 때문이다.
⚠ 다만 **스키마에 가상 인물 플래그가 없다**는 사실은 그대로다. 칸을 비우면 단서가
사라진다. 그 취약함을 테스트로 박아 두었다(플래그가 생기면 이 테스트가 먼저 깨진다).

### 3-7 오너용 병합 런북 ✅

→ **`docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md`** (①~⑦, 네이버 콜백 주소 포함).

---

## PART 4 — 실기기 테스트 확대 `[staging]`

**상태: 완료 (오너 실행 대기)** → `docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md`

| | |
|---|---|
| 4-1 로그인 | **구글**. 카카오·애플은 staging 에서 꺼져 있고, 네이버는 콜백 등록 확인 필요. **새 수단 안 만듦** |
| 4-2 계정·덕 | 오너가 APK 에서 구글 로그인 → 웰컴 10덕 → **+40덕**. ㉮ 관리자 화면(`admin_adjust_duk`, 감사 기록 남음) 우선, 안 되면 ㉯ `grant_duk` |
| 4-3 재분류 | **28항목 · Android 기준 가능 22 / 부분 1 / 불가 2 · iOS 전 항목 불가** |
| 4-4 결과 양식 | 번호·OK/문제·스크린샷만 채우는 표 |
| 4-5 APK 재빌드 | **안 함.** 로그인은 서버 설정이라 빌드와 무관 |

**불가 사유 (환경이지 코드가 아니다)**:
- #19 푸시 권한 — **`google-services.json` 이 레포에 없다** → FCM 미설정
- #28 에러 바운더리 — 실기기에서 렌더 오류를 일부러 낼 방법이 없다
- #18 알림함 — 화면은 열리나 실제 푸시가 안 와 부분
- iOS 전 항목 — 애플 개발자 계정 대기

**📦 표시**: 지난 묶음에 올린 패키지 13종이 쓰이는 항목을 표에 찍었다.
`expo-router 57.0.9→57.0.20` · `expo-notifications 57.0.13→57.0.17` · `react-native 0.86.2→0.86.3`.
**jsdom 하네스는 네이티브를 안 쓴다** — 스플래시·OAuth 왕복·딥링크·세이프에어리어는
**이 APK 가 처음 확인하는 것**이다.

---

## PART 5 — 출시 요건 선점

**상태: 완료 (문서만. 앱 기능 구현 0)**
→ `docs/STORE_READINESS_2026-09-10.md` · `docs/OWNER_RUNBOOK_PLAY_CONSOLE_2026-09-10.md`

| 항목 | 판정 |
|---|---|
| 5-1 애플 5.1.2(i) | ①업체명 **충족** · ②명시적 동의 **부분** (AI 전용 항목 없음) · ③동의 전 호출 없음 **충족** · ④처방침 기재 **충족** |
| 5-1 애플 4.3 | 점술이 **포화 카테고리로 원문에 명시**. 심사 노트용 차별점 5개 초안 |
| 5-1 애플 4.8 | **충족 예정** — Sign in with Apple 이 요건을 만족. ⚠ staging 에서 꺼져 있어 **미검증** |
| 5-1 애플 5.1.1(v) | 앱 내 **충족** · 웹 URL 은 병합 후 |
| 5-1 구글 AI 정책 | 🔴 **미충족** — 신고·플래그 기능 없음 |
| 5-1 구글 target API | 🟠 **미확인** · 요구 시점 **이미 지남**(2026-08-31, API 36) |
| 5-1 가격 고지 | **충족** — `PriceConfirmSheet`. 후속질문은 추가 과금 없음 |
| 5-2 데이터 공개 | 13행 초안. **[법률 검토] 2건** — 국외 이전 · 보유 기간 |
| 5-3 연령등급 | 14칸 사실 나열 |
| 5-4 IAP 설계 | 11개 절. **라이브러리 `expo-iap` 권고**(`react-native-iap@16` 은 nitro-modules 추가 요구) |
| 5-5 Play Console | A(지금)·B(병합 후)·C(결제 후) 런북 |

**정책 인용은 전부 2026-09-10 확인**이고, 확인 못 한 것은 **미확인**으로 적었다
(애플·구글 정책 페이지의 **개정일 표기 없음** 포함).

### 5-4 핵심 셋

1. **상품 ID 매핑이 이미 있다** — `product_catalog.store_product_id`(소문자) 와
   `internal_product_key`(대문자)가 **별개 칸**이라 `economyContractV1.test.ts` 를
   **수정할 필요가 없다.**
2. **"이미 쓴 덕" 은 [오너 결정]이 아니다 — 설계가 있다.** `record_revocation` 이
   PAID 잔액으로 덮을 수 있는 만큼만 회수하고 나머지를 `duk_debt` 로 남긴다.
   **잔액은 마이너스가 되지 않고**, 다음 PAID 지급이 부채를 먼저 상계한다.
   남는 질문은 **"부채를 화면에 어떻게 보일 것인가"** 뿐이다.
3. **순매출 기준 덕 가치** (부가세 10% 포함가 역산 · 수수료는 부가세 제외분에 적용 — **둘 다 가정, 미확인**):

   | 상품 | 판매가 | 15% 시 덕당 | 30% 시 덕당 |
   |---|---|---|---|
   | 20덕 | ₩2,900 | ₩112 | ₩92 |
   | 50덕 | ₩9,900 | ₩153 | ₩126 |
   | 120덕 | ₩19,900 | ₩128 | ₩106 |

   현재 마진 표시 제안값 **198원은 총액 기준**(₩9,900/50덕)이다. → **[오너 결정]**

---

## staging 변경 목록과 되돌리는 방법

| # | 변경 | 되돌리기 |
|---|---|---|
| 1 | Edge 시크릿 **`VERCEL_DEPLOY_HOOK_URL` 삭제** | Vercel → Settings → Git → **Deploy Hooks** 에서 URL 을 복사한 뒤 `npx supabase secrets set VERCEL_DEPLOY_HOOK_URL="<URL>" --project-ref aephpsiurgkvqcswyeie`. ⚠ CLI 는 값을 **해시로만** 보여 주므로 원문은 Vercel 에서 가져와야 한다 |
| 2 | `migration repair --status reverted 20260915000000` → 측정 → `--status applied` | **이미 되돌렸다.** `db push --dry-run` 이 `upToDate: true` 를 돌려주는 것으로 확인 |

**그 외 staging 변경 없음.** 데이터 행을 만들거나 지우지 않았다. `예시인 하나` 는
draft 그대로다.

⚠ 13·14 를 `reverted` 로 만들어 production 모양을 재현하려던 측정은
**권한 계층이 거부**했다. 우회하지 않았다. (그 답은 오너 스냅샷으로 나왔다.)

---

## 테스트 전후

| | 전 | 후 |
|---|---|---|
| 스위트 | 345 | **350** (+5) |
| 테스트 | 5,832 | **5,926** (+94) |
| 실패 | 0 | **0** |
| `tsc --noEmit` | 통과 | 통과 |
| `release-preflight` | production BLOCK 1 | **PASS · blocker 0** |

**추가된 스위트 5개**: `buildProfileGuard`(31) · `nextMigrationVersion`(15) ·
`siteVerificationMeta`(11) · `famousFictional.render`(6) · `serverOwnedTablesRls`(20).
기존 스위트에 추가: `adminPricingContract` +10 · `adminWriteScreens.render` +2.

---

## 상한 사용

| | 사용 / 상한 |
|---|---|
| LLM 콜 | **0 / 5** |
| EAS 빌드 | **0 / 1** |

---

## 세 목록

### 🔵 CTO 판정 필요

| # | 무엇 | 자료 |
|---|---|---|
| C1 | **14·15 를 production 에 적용할 것인가** — 14 는 "변화 없음"(조건 동일한 중복 정책 제거), 15 는 새 객체만·시드 없음 | `OWNER_RUNBOOK_PROD_MIGRATION_14_15.md` |
| C2 | **리포트 본문 합성을 Edge 로 옮길 것인가** (M13). RLS 로는 못 막는다. 피해 범위는 좁다 | `KNOWN_RISKS` M13 |
| C3 | **`conversations_update_own` 에 subject 소유 조건을 추가할 것인가** — 실피해는 없고 대칭만 어긋나 있다. 한 줄 |  본 보고서 2-7 |
| C4 | **AI 전송 전용 동의 항목을 신설할 것인가** — 애플 5.1.2(i) 대비. 넣으면 `TERMS_VERSION` 이 올라가 **기존 사용자 전원 재동의** | `STORE_READINESS` B-1 |
| C5 | **`app.json` 에 `expo-build-properties` 를 넣어 targetSdk 를 36으로 올릴 것인가** — 보호 파일. **먼저 현재 값 확인 필요** | `STORE_READINESS` A-6 |
| C6 | **다음 지시서에서 AI 신고 기능을 구현할 것인가** — 구글 제출 전 필수. 약 5파일 / ~385줄 | `STORE_READINESS` A-5 |
| C7 | frozen 경로 커밋이 기준선보다 **1건 늘었다**(64→65). 승인된 재개방인지 (OWNER_TODO D8) | preflight WARN |

### 🟣 오너 결정 필요

| # | 무엇 |
|---|---|
| O1 | **`DUK_KRW` 를 총액(198원)으로 둘지 순매출(126~153원)으로 둘지.** 순매출로 두면 마진이 지금보다 나빠 **보인다** — 그것이 실제다 |
| O2 | **부채(`duk_debt`)가 있는 사용자에게 무엇을 보일 것인가.** 지금 화면에 부채 표시가 없다 |
| O3 | **[법률 검토] 국외 이전 기재** — OpenAI 는 미국. 처방침 §3 이 "처리 위탁" 으로만 적고 국외 이전을 따로 적지 않는다. 그 문단이 스스로 미확정을 선언하고 있다 |
| O4 | **[법률 검토] 탈퇴 시 보존 항목·기간** — 데이터 보안 양식의 "삭제 요청 가능 여부" 가 여기 달려 있다 |
| O5 | **결제 프로필 주소** — 사업자등록증(강석로) vs 등기부 본점(의장로 146, 1121호). 반려 시 등기부등본 대체 가능한지 구글에 문의 |

### 🟢 오너 할 일 (명령은 그대로 붙일 수 있게)

**⓪ `app.json` — 이것부터. 도구가 막혀 반영하지 못했다.**

`app.json` 의 `plugins` 배열 **첫 줄 뒤**에 `"expo-image"` 를 넣으십시오:

```json
"plugins": [
  "expo-router",
  "expo-image",
  ["expo-splash-screen", { "backgroundColor": "#208AEF", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],
  ["expo-notifications", { "color": "#208AEF" }]
]
```

그 뒤 확인:

```bash
npx expo install --check
npx expo-doctor
```

⚠ 이 변경이 들어간 뒤에 APK 를 한 번 다시 빌드하는 것이 맞습니다.

**① 웹 병합** → `docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md`
**② production 마이그레이션** (CTO 판정 후) → `docs/OWNER_RUNBOOK_PROD_MIGRATION_14_15.md`
**③ 실기기 QA** → `docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md`
**④ Play Console** → `docs/OWNER_RUNBOOK_PLAY_CONSOLE_2026-09-10.md`

**⑤ targetSdk 확인 (5분)**

```bash
npx expo prebuild --platform android --no-install
```

`android/build.gradle` 의 `targetSdkVersion` 을 확인한 뒤 **`android/` 폴더를 지우십시오**
(이 레포는 managed 워크플로를 유지합니다). 36 미만이면 C5 로 올라갑니다.

**⑥ Supabase(staging) Redirect URLs 확인**
Authentication → URL Configuration → Redirect URLs 에
`deokbunai://login-callback` 과 `https://www.deokbunai.com/login-callback` 이 있는지.

**⑦ 네이버 개발자센터 Callback URL 확인** — 같은 두 주소.

---

## 커밋 메시지 제안 (커밋은 오너가 합니다)

```
feat: 웹 공개 준비 · production 적용 판정 자료 · 출시 요건 선점

원가 화면이 마이그레이션 전에도 정직하게 말한다
- costWindow 를 ok/not_installed/forbidden/failed 네 갈래로 분리 (오류 코드로 판정,
  메시지 문자열이 아니라). "아직 설치되지 않았다" 와 "불러오지 못했다" 를 섞지 않는다 —
  오너가 할 일이 마이그레이션 적용과 재시도로 서로 다르기 때문이다.
- 합성 16건: RPC 없음 / 권한 없음 / 실패 / 0건 / 정상 + 분류기 10

production 적용 대기는 14·15 두 건이고 둘 다 안전하다
- 오너 스냅샷과 레포를 버전 문자열로 대조: 이력 59건, 대기 2건, 고아 0건,
  --include-all 불필요
- 14 가 지우는 두 정책은 production 에서 남는 정책과 조건이 글자까지 같다 → 변화 없음
- 13 은 이미 적용됐고, 그 결과 conversations INSERT 의 subject 소유 조건이 살아났다

서버 소유 표에 사용자 쓰기 정책이 없다는 것을 DB 쪽에서 잠갔다
- 컬럼 단위 권한이 레포에 한 줄도 없다 → 행을 쓸 수 있으면 모든 칸을 쓸 수 있다.
  그래서 표 단위로 검사한다. 13개 표 + 양성 대조 4건
- 발견 1건: consultation_reports.report_payload 를 사용자가 다시 쓸 수 있고 공유 링크가
  그것을 보여 준다. RLS 로는 못 막는다(클라이언트가 합성하는 설계) → KNOWN_RISKS M13

빌드와 배포의 자물쇠
- eas.json production 프로필에 공개 키를 넣었다. release-preflight 가 이제 blocker 0
- 검색엔진 소유확인 메타를 환경변수로 받는다. 값이 없으면 태그를 넣지 않는다
- 마이그레이션 번호 도구: 번호는 날짜가 아니라 순번이다 (이력에 8월 32~47일이 있다)

가상 인물 표시가 화면에 보이는지 재는 테스트
- 지난 런북이 "확인하지 않았다" 로 남긴 질문에 답한다. 네 칸을 비우면 "가상" 이라는
  말이 사라진다는 사실도 함께 고정했다

문서
- 오너 런북 4종 (병합 · production 마이그레이션 · 실기기 QA · Play Console)
- 출시 요건 점검 (애플 5.1.2(i)/4.3/4.8 · 구글 AI 정책/target API · 데이터 공개 ·
  연령등급 · IAP 설계)

테스트 350 스위트 / 5,926건 통과 (345 / 5,832 → +5 / +94). tsc 통과.
LLM 0콜. EAS 빌드 0회.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```
