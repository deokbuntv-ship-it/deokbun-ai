# HANDOVER.md

> DeokbunAI 프로젝트 인수인계 문서
>
> 이 문서는 새로운 개발자 또는 새로운 Claude Code / ChatGPT 세션이
> 프로젝트를 인수했을 때 현재 상태를 빠르게 파악하기 위한 문서다.
>
> 읽는 순서: PROJECT_HISTORY.md → ARCHITECTURE.md → **HANDOVER.md(이 문서)**
>
> **작성 기준**: 이 문서는 추측이 아니라 실제 Repository 코드와 Git 상태를
> 직접 검사하여 작성되었다. 계획과 구현 완료를 반드시 구분한다.
> "코드가 존재한다"와 "실제로 동작/검증되었다"를 구분한다.
>
> 작성일: 2026-08-07
> 기준 커밋: `8e05622 feat(auth): add OAuth authentication foundation`
> 브랜치: `main` (origin/main과 동기화됨, working tree clean)

------------------------------------------------------------

## 0. 최신 상태 — ADMIN / CONTENT / PUBLIC MASTER TRACK (2026-08-10)

> ⚠️ 아래 1~20절은 2026-08-07 `main` 기준(관리자/실 LLM 이전)이며 일부는
> 이 0절로 **대체**되었다. 최신 사실은 이 0절을 우선한다.

> 📌 **전체 V1.0 상태의 단일 기준선(SSOT):**
> [`docs/DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md`](docs/DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md)
> — 이 §0의 여러 갱신을 하나로 통합한 최신 문서. 상태 판단은 SSOT를 우선한다.

### 최신 (2026-08-14) — Sprint 3A: Consultation Intelligence 프레젠테이션 시맨 (Golden Flow v3)
- 확정 디자인(`design-handoff/golden-flow-v3` — 시블링 클론)을 코드로 옮기는 첫 단계:
  **fail-closed 프레젠테이션 시맨**을 구축(§70). Claude 소유 라벨 맵 + 어댑터,
  역학/품질 의미론은 UI가 계산하지 않음(Codex 소유).
- 신규: `src/features/intelligence/presentation/{labels,assessmentView}.ts` (한국어 라벨 +
  fail-closed 어댑터: 평가 레벨만 타일, `insufficient`≠낮음, ▲근거/▼반대근거 미합산, 숫자 점수
  없음), `components/AssessmentSummary.tsx`(Consumer), `admin/components/AssessmentMatrix.tsx`.
  테스트 +12 (fail-closed 불변식 잠금). 게이트: `tsc` 0 · `jest` **259** · `expo export` 0.
- **엔티티 5-상태 감사** + Codex 핸드오프: [`docs/CONSULTATION_INTELLIGENCE_UI.md`](docs/CONSULTATION_INTELLIGENCE_UI.md).
  핵심: 계약은 대부분 존재(SCHEMA), **live write 전무**(엔진/룰셋 = Codex), admin read =
  connected:false 시맨. UI는 Assessment 프레젠테이션 기반만 구현.
- 발견한 계약 갭: `AssessmentItem`에 사용자 노출 `summary` 필드 없음(타일 의미 문장 소스 부재) →
  Codex/계약 결정 필요(UI 임의 생성 금지, §8). CODEX_HANDOFF §24.
- **남은 UI(연속작업)**: Golden Flow v3 화면 리스킨 + Consumer 상세/근거/피드백 + Admin
  Inspector 라우트/패널 전체 — 동일 시맨 위에서 mechanical.

### 최신 (2026-08-14) — Sprint 2B: 운영·관리자·프로덕션 하드닝 (Codex 입장 정리)
- **관리자 write 무결성**: content/famous/publication 서비스가 DB 실패를 삼키지 않고 **throw** →
  기존 화면 `.catch`가 실제 오류 표시(false-success/null-crash 제거, 16곳). 참조 패턴 `e67254e`.
- **세션 만료 정규화**: edge 401 → `LLMRequestError{authError}` → chatService **AUTH_REQUIRED**
  → 질문 보존·로그인·재개(§14–16). (401만; 403/5xx/네트워크는 과분류 안 함.)
- **프로덕션 준비 인벤토리**: [`docs/BETA_PRODUCTION_READINESS.md`](docs/BETA_PRODUCTION_READINESS.md)
  — env 33개·edge 7개·DB/RLS(전 테이블 RLS 아티팩트 OK, apply=OWNER_VERIFY)·observability
  (paid path 강함: latency/token/error-code/model/requestId)·failure matrix·smoke runbook·
  **Codex 1B 입장 계약**. 게이트: `tsc` 0 · `jest` **247** · `expo export` 0. 미push.
- **Codex 1B 대기 지점(유일)**: engine grounding — `chatService`의 `GROUNDING_UNAVAILABLE`을 실제
  `ConsultationGrounding`로 교체(`CODEX_HANDOFF §23`). 그 외 주변 인프라는 READY.
- Bounded 잔여: S2A-F1(temp-subject 검색성), OBS-SEAM(prompt-version/conversation_id/원격 error sink),
  retry 서버 idempotency(edge dedup on requestId) — 모두 follow-up로 기록.

### 최신 (2026-08-14) — Sprint 1A: 상담 Prompt Foundation (Claude Code)
- 독립 리뷰 #1 지적(system prompt = 1줄 placeholder) 해결: `src/features/chat/prompts/**`에
  실제 **Consultation Prompt Architecture** 구축 — 헌장(계산기≠해석자·불확실성·시기경계·안전·
  주입저항) + 모드별 응답정책 + **fail-closed grounding seam**(엔진 미연결 시 계산 조작 금지) +
  prompt versioning + 응답 메타(traceability). 기존 UI/adapter **무변경**(backward-compatible).
- **엔진 의미론/실배선은 만들지 않음** — Codex Sprint 1B(`CODEX_HANDOFF §23`). 정확 상태:
  `CONSULTATION_PROMPT_READY` · `ENGINE_INTEGRATION_SEAM_READY` ·
  `ENGINE_GROUNDED_LIVE_CONSULTATION_NOT_YET`.
- 적대적 2차 검토(red-team)로 HIGH 2건(프로필 필드 system 주입, 근거 없을 때 해석 조작) 등
  수정·테스트 잠금. 게이트: `tsc` 0 · `jest` **227/227** · `expo export` 0. 상세:
  [`docs/CONSULTATION_PROMPT_ARCHITECTURE.md`](docs/CONSULTATION_PROMPT_ARCHITECTURE.md). 미push.

### 최신 (2026-08-14) — SSOT 통합 + Consultation Intelligence 기반
- **Repository-wide 통합 감사** 후 `docs/DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md` 신설
  (12개 도메인 인벤토리 · production 검증 매트릭스 · readiness %). ARCHITECTURE/
  PROJECT_HISTORY/PRD_MASTER에 SUPERSEDED 배너 부착.
- **Consultation Intelligence 기반**(`src/features/intelligence/**`, `1da8083`+`cf2fe7e`)
  — 순수 계약+검증 22 테스트, **live 미배선**(Codex), SQL은 HOLD(owner-apply).
- **게이트 갱신:** `jest` **200/200 (21 suites)** (이전 §0의 178/178은 낡음) · `tsc` 0 ·
  `expo export` 0. HEAD `cf2fe7e`.
- **최상위 미해결(SSOT §27):** 엔진→프롬프트 live 배선(Codex #1) · LLM/DB 프로덕션 검증(Owner)
  · 첫 상담 auth-friction(Design).

### 최신 (2026-08-12) — 네이버 로그인 **PRODUCTION E2E VERIFIED** ✅

- **네이버 아이디로 로그인 = 운영 검증 완료** (`https://www.deokbunai.com`, 2026-08-12).
  실제 E2E 성공: 네이버 버튼 노출 → 네이버 인증/동의 → OAuth callback 복귀 →
  `/login-callback` 처리 → `naver-auth` Edge Function 정상 → **Supabase 세션 생성 → 로그인 성공**.
- **아키텍처 = 트러스티드 Edge 브리지** (Naver는 Supabase provider가 아님 — nested
  `/v1/nid/me` `response.id`를 Supabase custom OAuth2가 매핑 불가, 검증됨). 흐름:
  App → Naver authorize(공개 client_id + CSRF state) → `/login-callback` → `naver-auth`
  edge(코드 교환[client_secret 서버 전용] → `/v1/nid/me` → 이메일 필수 fail-closed →
  takeover guard → `generateLink(magiclink)`→`verifyOtp`) → `setSession`.
  상세: `docs/NAVER_LOGIN_ARCHITECTURE.md`.
- **Google/Kakao 무변경**(동일 built-in flow). 로그인 화면 3-provider 운영 반영.
- **운영 배포 이슈 2건 해결(`vercel.json`)**: 루트 `/` 404 → `outputDirectory=dist` 고정
  (`753af6d`); `/login-callback?code=…` 404 → `cleanUrls:true`(`0693e07`).
- **Owner 시크릿 완료**: `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET`를 Edge secret으로 등록
  (`SERVER_NOT_CONFIGURED` 해소). `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`는 자동 주입.
- **네이버 인증 코드/Edge는 완료·동결** — 불필요한 수정 금지.
- 남은 선택사항: 네이티브(iOS/Android) 로그인은 `ios.bundleIdentifier`/`android.package`
  결정 후 가능(현재 **web-only**), 네이버 버튼 공식 그린 브랜딩은 선택(`docs/NAVER_LOGIN_UI_HANDOFF.md`).

### 최신 (2026-08-12) — V1.0 AUTO_SAFE HARDENING PASS (autonomous · LOCAL_VERIFIED)

Owner-away 자율 세션. 9-dimension 코드 인벤토리(24 findings / 18 AUTO_SAFE / P0 0)
후 **안전한 항목만** 구현. 엔진(SAJU/ZIWEI/QIMEN)·Naver·시각 디자인 **무변경**.
게이트 all green: `tsc` 0 · `jest` **178/178 (20 suites)** · `npm ls` clean · `expo export` 0.
로컬 commit만(미push).

- **테스트 추가(순수/통합, 보안경계 잠금)**: `chatService` 로그인-전-LLM 게이트(제12조 —
  미인증 실제질문 시 유료 adapter 호출 0)·`buildPrompt` 조립순서(제10조/제15조)·
  `mapSupabaseUser`·`requireAuthenticatedUser`·`resolveAdminStatus`(admin fail-closed).
- **버그 수정**: 채팅 in-chat auth-gate **stale-closure**(로그인 후에도 게이트가 안 풀릴 수
  있던 문제) → 매 렌더 갱신 ref. (`chat.tsx`, 기능 wiring, 시각 무변경)
- **신뢰성**: admin list/activity 서비스가 RPC 오류를 **빈 배열로 삼켜** 장애가 "데이터 없음"
  으로 보이던 것 → `re-throw`(화면의 기존 error+retry 상태 노출). detail 함수는 무변경.
- **정리**: 스타터 잔여 `/explore` 라우트 제거 · `subject-history`/`subject-manse` 루트 Stack
  등록 · `robots.txt`의 `Sitemap:` 디렉티브를 sitemap 생성기에서 방출.
- **상태**: **LOCAL_VERIFIED**(프로덕션 미검증). commit은 origin 대비 로컬 ahead.
- **DEFER(오너/배포 검증 필요, 임의 미적용)**: ① 공개 동적 라우트 `generateStaticParams`
  (SEO — `expo export` 빌드동작 변경이라 배포 검증 필요) ② 채팅 edge 에러코드 세분화
  (`RATE_LIMITED`/`SERVER_NOT_CONFIGURED` — Supabase 에러형상 라이브 검증 필요) ③ `chatConfig`
  미사용 `requestTimeoutMs`/`retryCount`(의도 확인 필요).
- **CODEX**: 정규화 컨텍스트의 `warnings`/per-engine `availability`를 live 프롬프트에 배선
  (엔진 연결) — `docs/CODEX_HANDOFF_2026-08-17.md` 범위.

### 최신 (2026-08-13) — PRE-CODEX INTEGRATION READINESS (autonomous · docs+1 fix)

핵심 사용자 흐름을 코드 기준으로 끝까지 추적: **LOGIN→HOME→CONSULT→PERSON→BIRTH→CHAT→
persistence→HISTORY = 완전 연결됨(코드 수정 불필요)**. 새 안전 코드 여지는 거의 소진 —
남은 실질 가치는 Codex/Owner 통합 인수인계 문서로 산출.
- **코드 1건**: `docs/CONSUMER_CORE_SCHEMA.sql`에 누락된 `seq` 정렬 컬럼 추가(재현성 drift;
  라이브 무변경, from-scratch 재빌드용). commit `5300c3f`.
- **신규 문서**: `docs/DATABASE_RUNBOOK.md`(오너용 SQL 적용 순서/검증/UNKNOWN 파리티 — 특히
  **DRAFT_RLS 보안 검증 우선**) · `docs/CHAT_EDGE_FAILURE_CONTRACT.md`(에러코드 세분화 =
  OWNER_PREVIEW_VALIDATE) · `CODEX_HANDOFF_2026-08-17.md §21`(엔진→프롬프트 배선 정밀 지도).
- **DEFER(라이브/배포 검증 필요)**: 채팅 edge 에러코드 세분화, 공개 `[slug]` generateStaticParams.
- **CODEX**: 엔진 결과를 live 프롬프트에 배선(§21) — 공유경계 4파일; 엔진 규칙/학파 무관.
- gates all green(tsc 0 · jest 178 · expo export 0). LOCAL commit만.

- **브랜치**: `admin/master-operations-content` (origin 동기화, working tree clean).
  `main` 미변경. Codex ENGINE(`src/features/interpretation/**`)은 **FROZEN — 이 트랙에서 변경 0**.
- **실 LLM 연결됨**: `supabase/functions/chat`(OpenAI Responses) 배포·검증 완료.
  (구 5절 "실제 LLM 호출 미구현", "Edge Function 없음"은 더 이상 사실 아님.)

### 최신 (2026-08-11) — UI FINAL + ADMIN FINAL + V1.0 Gap Analysis

- **사용자 앱 FINAL UI**: 4-tab Stitch(홈/상담/운세우편함/MY), 7화면. 커밋 `bbbf026`
  (origin push 완료). 이후 이 구조를 재디자인하지 않는다.
- **관리자 콘솔 FINAL UI**: 10화면 Stitch. 커밋 `f4d5106 → 01ea59f → 390f8a8`
  (origin push 완료, HEAD). 관리자 전용 토큰은 `src/features/admin/adminTheme.ts`.
- **V1.0 Gap 요약 (실제 코드 기준)**: Auth(kakao+google, guard, admin fail-closed)
  **DONE** · chat Edge(OpenAI Responses, 서버 키, usage 로깅) **DONE** ·
  대화/상담 persistence **DONE** · 명리(SAJU) 엔진(~10K LOC, golden fixtures)
  **DONE(단, FROZEN)**. 자미두수/기문둔갑/Cross-analysis = **contract 타입만
  (MISSING)** · fortune-mail 생성 파이프라인 **MISSING(seam만)** · rate-limit /
  streaming / 앱 오류 로깅 / 테스트 프레임워크 **MISSING** · lint(eslint 설정 없음)
  **깨짐(기술부채)**.
- **⚠️ 소비자 코어 스키마가 repo에 없었음 → 저장**: `profiles`,
  `consultation_subjects`, `conversations`, `conversation_messages`의 DDL/RLS가
  out-of-band 적용되어 repo에 없었음(재현성/보안검증 리스크). 코드에서 정확히
  도출해 `docs/CONSUMER_CORE_SCHEMA.sql`로 저장(멱등·비파괴, **오너가 라이브 DB와
  대조 후 적용**). 자동 실행되지 않음.
- **⚠️ Codex ENGINE 경계**: `src/features/interpretation/**`는 FROZEN. 자미두수/
  기문둔갑/Cross는 규칙 창작·엔진 수정 금지(§18/§55/§65). 이 트랙에서 만들지 않는다.
- **다음 코드 우선순위(오너 블로커 없이 가능)**: ① SAJU 엔진 결과를
  `contextSelector`/프롬프트에 주입(제17조; chat 파이프라인은 현재 원시 생년월일
  문자열만 전달 — 엔진 미연결). ② chat Edge rate-limit(§39). ③ 표준 에러코드 정리.
  ④ 앱 오류 로깅 seam. (자미두수/기문둔갑/fortune 파이프라인은 엔진/백엔드 그린필드.)
- **오너 수동 블로커**: `OPENAI_API_KEY`(설정됨)/quota, Supabase 마이그레이션 적용
  (`CONSUMER_CORE_SCHEMA.sql` + `OWNER_ACTIONS_AND_DECISIONS.md`의 대기 항목),
  edge 재배포(content-generate/media/video), `GEMINI_API_KEY`, OAuth 콘솔
  (Kakao KOE205/Google/Naver/Apple), 인증 관리자 육안 QA.
- **Pre-Codex 스프린트(2026-08-11) 산출물**: 엔진 외부 계약 레이어
  `src/features/analysis/**`(에러 계약·request id·structured AI output·엔진
  오케스트레이션 seam; frozen 엔진 미수정) + `docs/CODEX_HANDOFF_2026-08-17.md`.
  **원격 미push 로컬 커밋 체인**: `383ea14`(스키마/handover) → `f45a675`(analysis) →
  (docs 커밋). 사용자 검수 전 push 금지. Codex는 8/17에 `CODEX_HANDOFF` + repo만 읽고
  `engineOrchestration.ts` seam 뒤에서 SAJU 연결부터 시작.

### 완료(코드+검증) / 완료(코드, USER ACTION 대기)

| 영역 | 상태 |
|------|------|
| ADMIN-01 권한 seam (`admin_users`,`is_admin()`) | ✅ 적용·검증 |
| ADMIN-02 사용자/대상 | ✅ 적용·검증 |
| ADMIN-03 상담 모니터링 | ✅ 적용·검증 |
| ADMIN-04 AI 사용량/대시보드 (`ai_usage_logs`) | ✅ 적용·검증 |
| ADMIN-05 유명인/SEO (`famous_profiles`,`famous_snapshots`) | ✅ 적용·검증 |
| CONTENT-01 콘텐츠 스튜디오 (`content_items`,`content_versions`) | ✅ 적용·검증 |
| CONTENT-02 AI 텍스트 생성 (`content-generate` edge) | 🟡 코드 완료 · **edge 배포 대기** |
| PUBLIC-01 공개 웹(`/content`,`/famous`,SEO,카테고리) | 🟡 코드 완료 · **PUBLIC_SETUP.sql 대기** |
| CONTENT-04/07 발행추적 + 네이버 수동발행 | 🟡 코드 완료 · **PUBLICATION_SETUP.sql 대기** |
| P0-3 안전 Markdown 렌더러(공개 본문/약력) | ✅ 코드 완료 (의존성 0) |
| P0-7 AI 워크로드 아키텍처(STANDARD/PREMIUM) | 🟡 코드 완료 · **content-generate 재배포 필요** |
| P0-6 유명인 AI 프로필/SEO 자동화 | 🟡 코드 완료 · **famous-suggest 배포 + (선택)FAMOUS_AI_SETUP.sql** |
| P0-8 유명인→콘텐츠 워크플로(소스 프리셀렉트) | ✅ 코드 완료 |
| CONTENT-03/06 미디어 자산 + 대표이미지 | 🟡 코드 완료 · **CONTENT_ASSETS_SETUP.sql 대기** (수동첨부 동작, AI생성=PROVIDER_NOT_CONFIGURED) |
| CONTENT-05 인스타 채널 seam + CONTENT-07 예약 | 🟡 코드 완료 · **CONTENT_05_07_SETUP.sql 대기** (실발행=OAUTH_REQUIRED, 실행=DEPLOY_REQUIRED) |
| SEO: robots.txt + 페이지 메타 | ✅ 코드 완료 (사이트맵/동적 슬러그 프리렌더는 향후) |
| 보안 감사(신규 표면) | ✅ 통과 (service_role/시크릿/HTML/토큰/공개누출 0) |
| R3-1 Canonical URL(결정론적)+OG | ✅ 코드 완료 (PUBLIC_BASE_URL 미설정 시 omit) |
| R3-2 AI 사용량 유형 필터 + 버전 토큰 | 🟡 코드 완료 · **ADMIN_04_UPDATE_usage_filter.sql 대기** |
| R3-3 sitemap 생성기 + SEO 한계 문서 | ✅ 코드 완료 (base-url gated, 가짜도메인 0) |
| R3-4 Admin content/famous 필터 + 삭제 확인 | ✅ 코드 완료 |
| R3-5 provider decision pack + 오너 문서 | ✅ 문서 완료 (OWNER_ACTIONS_AND_DECISIONS.md) |
| IMG IMAGE_STANDARD 이미지 생성(OpenAI/LOW) | 🟡 코드 완료 · **IMAGE_STORAGE_SETUP.sql + media-generate 배포 대기** (provider/model/quality 서버 결정, Storage 저장, provenance, IMAGE_PREMIUM=NOT_CONFIGURED). owner smoke PASS |
| R4-A 이미지 alt + 공개검색 + JSON-LD | 🟡 코드 완료 · **PUBLIC_UPDATE_search_alt.sql 대기** (hero_alt, /content?q=, Article/Person 구조화데이터-검증필드만) |
| R4-B Admin 채널/소스 + 공개여부/계산상태 필터 | ✅ 코드 완료 |
| VIDEO_STANDARD 영상 생성(Google Veo, async) | 🟡 코드 완료 · **VIDEO_SETUP.sql + video-generate/status 배포 + GEMINI_API_KEY 대기** (veo-3.1-fast, 720p/8s/audio off, 서버 결정, Storage 저장, bounded polling, VIDEO_PREMIUM=NOT_CONFIGURED) |
| R5-B 채널 발행 적격성(Instagram/Naver, fail-closed) | ✅ 코드 완료 (READY는 실제 전제조건 충족 시에만) |
| R5-C 발행 현황 뷰(/admin/publications, 읽기전용) | 🟡 코드 완료 · **SCHEDULER_SETUP.sql 대기** (자동 실행 없음) |
| 릴리스 점검: Expo web export | ✅ PASS (전 라우트 static export, EXIT 0) |
| UX-1/2 StatusBadge + Button variants + admin 뱃지 | ✅ 코드 완료 (색+텍스트, tap target 44px) |
| UX-3 공개 웹 헤더/푸터(콘텐츠 포털 내비) | ✅ 코드 완료 |
| UX-QA Markdown 렌더러 line-based 수정 | ✅ 실브라우저 QA로 발견·수정·재검증 (헤딩+리스트 raw 마커 제거) |

### UI/UX 원칙/시스템 (요약)
- 포지셔닝: PREMIUM AI LIFE INSIGHT (촌스러운 점술앱 지양, 절제된 현대 동양). 가짜 계산 수치(재물운 87점 등) 절대 생성 안 함 — ENGINE 미연동은 준비중/미계산으로 표기.
- 디자인 시스템 재사용(재작성 아님): `src/theme`(colors 시맨틱+오행, typography, spacing, radius, shadows) + primitives(`Button/Card/Input/Screen/Stack/Text/AdminSelect`). 추가: `StatusBadge`(색+텍스트, §88), Button `tertiary/danger`.
- 공개 웹: `PublicScreen`이 브랜드 헤더+푸터로 콘텐츠 포털화. 본문은 안전 Markdown 렌더러(line-based, raw HTML 미허용, http(s) 링크만).
- 실 브라우저 Visual QA(정적 export 서빙): /content·상세·/famous·/login·/home @375·1440 렌더/오버플로우 확인. 인증 필요한 내부 화면(chat/subject/records/my/admin)은 export 빌드 성공 + tsc + 코드리뷰로 검증(정적 QA는 로그인 필요로 제외).
- Recharts 미도입(RN/웹 유니버설 앱; DOM 전용 → 네이티브 번들 파손 위험, §95 네이티브빌드 증명 부담). 대신 **의존성 0 유니버설 TrendChart**(View 기반 막대, 접근성, 빈상태)로 대시보드 최근 30일 추이 구현 — 실데이터(`admin_daily_activity` RPC, DASHBOARD_TRENDS_SETUP.sql 대기).
- **Phase 2 미완료(인증 필요)**: 로그인 세션이 없어 인증 데이터 화면(채팅-메시지/기록/저장대상/마이/전체 /admin)은 실브라우저 Visual QA 불가. 무인증 렌더 화면(공개 콘텐츠·상세·유명인·홈·로그인·birth-info·consult)은 @375 QA 완료(오버플로우 0). birth-info는 이미 우수(progressive disclosure) — 출생지 helper만 보강. **인증 화면 QA는 소유자 로그인 필요(USER ACTION).**

### DB 스크립트 (docs/) — 적용 순서 아래 참조
- 적용됨: `admin/ADMIN_SETUP.sql`, `ADMIN_02~05_SETUP.sql`, `CONTENT_01_SETUP.sql`, `PUBLIC_SETUP.sql`, `content-generate` 배포.
- **미적용(USER ACTION)**: `docs/admin/PUBLICATION_SETUP.sql`, `docs/admin/CONTENT_ASSETS_SETUP.sql`, `docs/admin/CONTENT_05_07_SETUP.sql`, `docs/admin/FAMOUS_AI_SETUP.sql`(선택).
  - ⚠️ `CONTENT_ASSETS_SETUP.sql`은 이미 적용된 `public_list_content`/`public_get_content`를 drop+recreate 하여 `hero_image_url`을 추가함(재실행 안전).

### Edge Functions (supabase/functions/)
- `chat` — 배포됨.
- `content-generate` — 배포됨(초기). **P0-7 워크로드 변경으로 재배포 필요**. `docs/admin/CONTENT_02_SETUP.md` 참조.
- `famous-suggest` — 코드 완료, **배포 필요**(`OPENAI_API_KEY` 재사용, PREMIUM_CONTENT).

### 라우트
- 관리자: `/admin` · `/admin/users` · `/admin/consultations` · `/admin/ai-usage` · `/admin/famous` · `/admin/content` (fail-closed, `admin/_layout` 가드).
- 공개: `/content` · `/content/[slug]` · `/content/category/[slug]` · `/famous` · `/famous/[slug]` (published-only, 무인증, `expo-router/head` SEO, web.output=static).

### 통합 USER ACTION / OWNER DECISION
> **전체 상세는 [docs/OWNER_ACTIONS_AND_DECISIONS.md](docs/OWNER_ACTIONS_AND_DECISIONS.md) 참조** (단일 운영 문서).

이미 적용 완료(사용자 보고): 모든 ADMIN/CONTENT/PUBLIC/PUBLICATION/ASSETS/05_07/FAMOUS_AI SQL + `content-generate`·`famous-suggest` 배포.

**현재 남은 USER ACTION(소규모):**
1. SQL: `docs/admin/ADMIN_04_UPDATE_usage_filter.sql` (AI 사용량 유형 필터; 미적용해도 전체 목록 동작).
2. CMD: `npx supabase functions deploy content-generate --project-ref olvkpaldrwvtexxpoaag` (P0-7 워크로드 반영 재배포).
3. (선택) env `EXPO_PUBLIC_PUBLIC_BASE_URL` (canonical/sitemap 활성화) + `node scripts/generate-sitemap.mjs`.

**OWNER DECISION**(비용/락인): 이미지 provider(추천 OpenAI GPT Image) · 영상 provider(defer/Kling) · 인스타 실발행 go/no-go(App Review) · 예약 자동실행 승인 · 프로덕션 도메인 · 동적 슬러그 프리렌더 범위. 상세/후보 비교는 위 문서 §2.

### 보안 원칙 (이 트랙 전반 준수)
- 모든 관리자 DB 접근은 `is_admin()` 게이트(RLS/SECURITY DEFINER, `search_path=public,pg_temp`, revoke/grant).
- 공개 읽기는 curated SECURITY DEFINER RPC(published-only, 초안/관리메타/provenance/원시 birth 미노출).
- `service_role`은 edge 전용(클라이언트 0). 시크릿 하드코딩 0. fake/mock 0.

### 남은 작업 (provider/인프라/승인 대기)
- **AI 이미지/영상 실제 생성**: provider 선택(OWNER DECISION) 후 생성 Edge + 어댑터 연동. 현재 seam+수동첨부만.
- **인스타그램 실제 API 발행**: Meta 앱/전문계정/App Review 완료 후 OAuth 토큰 서버 저장 + 2단계 publish Edge. 현재 OAUTH_REQUIRED + 수동기록.
- **예약 자동실행**: pg_cron→Edge 실행부(DEPLOY_REQUIRED) + 자동 외부발행 소유자 승인. 현재 예약 저장만.
- **SEO 강화**: 동적 슬러그 사이트맵/프리렌더(build-time enumeration). 현재 static export + <Head> 메타 + robots.txt.
- **런타임 스모크/RLS 네거티브 테스트**: 위 SQL 적용·edge 배포 후 수행.

------------------------------------------------------------

## 1. 프로젝트 개요

- **프로젝트명**: DeokbunAI (덕분AI)
- **서비스 유형**: LLM 기반 AI 상담 서비스
- **장기 목표**: 명리 / 자미두수 / 기문둔갑 등 복수 해석 체계를 결합한
  Multi-View 종합 상담 제공
- **현재 실제 상태**: UI 골격 + AI 파이프라인 "구조"는 존재하나,
  **실제 LLM 호출은 미구현**. 즉 아직 진짜 AI 상담은 불가능하다.
  현재는 아키텍처 검증 단계다.

------------------------------------------------------------

## 2. 현재 개발 단계

- 전체 진행률: **약 20%** (PROJECT_HISTORY 자체 평가와 일치)
- 구조 설계: 약 70%
- **핵심 아키텍처 파이프라인(UI→ChatService→Gateway→Auth→Context→Memory→Prompt→Adapter)은
  코드로 실재하며 TypeScript 컴파일 통과.**
- 하지만 파이프라인의 종착점(LLM Adapter / Edge Function / OpenAI)은 미연결.
- Git 이력상 Sprint 2-16 (OAuth foundation)까지 커밋 완료.

------------------------------------------------------------

## 3. 완료된 기능

각 항목은 실제 코드 확인 기준이다.

- **[완료]** 디자인 토큰 / 테마 시스템 (`src/theme/`, `src/constants/theme.ts`)
- **[완료]** 재사용 UI 컴포넌트 (`src/components/` — Button, Card, Input, Screen, Stack, Text 등)
- **[완료]** 탭/스택 라우팅 (expo-router, `src/app/_layout.tsx`, `src/app/(tabs)/`)
- **[완료]** 상담 Draft 상태 관리 (`ConsultationDraftContext`) — 대상/출생정보 저장
- **[완료]** 출생정보 입력 화면 (`src/app/birth-info.tsx`)
- **[완료]** AIGateway — Exact Match 방식 로컬 응답 (`src/features/chat/gateway/AIGateway.ts`)
- **[완료]** Conversation Memory 계산 로직 (`computeConversationMemory`) — 재요약 방지 구조
- **[완료]** Context Selector (`selectConsultationContext`) — Draft에서 상담 컨텍스트 선택
- **[완료]** PromptBuilder (`buildPrompt`) — 순수 문자열/메시지 배열 생성, 네트워크 호출 없음
- **[완료]** ChatService 조립 (`createChatService`) — 전체 파이프라인 순서 결선
- **[완료]** Chat 화면 (`src/app/chat.tsx`) — isSending 중복 방지, previousMessages/currentMessage 분리
- **[완료]** Supabase Client (`src/services/supabase/`) — AsyncStorage 세션 저장, 단일 client.ts
- **[완료]** AuthContext / AuthProvider — getSession() 복구 + onAuthStateChange 구독
- **[완료]** Auth Guard 위치 — Gateway(LOCAL_RESPONSE) 이후에만 인증 검사 (정책 준수)
- **[완료]** OAuth 구조 골격 — `authService.signInWithProvider(providerId)` 캡슐화

------------------------------------------------------------

## 4. 진행 중인 기능

- **[진행중]** Social Login
  - Kakao 로그인 흐름 코드는 존재 (`signInWithKakao`, expo-auth-session + WebBrowser)
  - 로그인 화면(`src/app/login.tsx`)에 "카카오로 시작하기" 버튼 존재
  - **단, 실제 로그인 성공 검증은 완료되지 않음** (아래 11·13 참조)
- **[진행중]** Conversation Memory
  - 요약 "계산"(어떤 메시지를 요약해야 하는지 판단)은 구현됨
  - **실제 요약 "생성"(LLM으로 summary 만들기)은 미구현** — `shouldUpdateSummary`/`messagesToSummarize`는
    계산되지만 이를 소비해 summary를 갱신하는 코드가 없음

------------------------------------------------------------

## 5. 미구현 기능 (핵심)

- **[미구현]** 실제 LLM 호출 — 현재 `unconfiguredLLMAdapter`가 호출 시 무조건 throw
- **[미구현]** Supabase Edge Function — `supabase/functions` 디렉터리 자체가 없음
- **[미구현]** OpenAI 연결 — `chatConfig.defaultModel = 'gpt-mini-placeholder'` (플레이스홀더)
- **[미구현]** 요약 생성 엔진 (Summarizer)
- **[미구현]** Google / Naver / Apple 로그인 — `signInWithProvider`에서 kakao 외 전부 `NOT_SUPPORTED` 반환
- **[미구현]** 해석 엔진 (명리/자미두수/기문둔갑 계산·구조화)
- **[미구현]** 관리자, 사용량/요금제, 결제, Rate Limit, 로깅

------------------------------------------------------------

## 6. 현재 Architecture (실제 코드 기준)

`chatService.ts`에 구현된 실제 실행 순서:

```
userMessage.trim()
  ↓ (빈 값이면 INVALID_INPUT)
AIGateway.evaluateMessage()
  ├─ INVALID_INPUT → 종료
  ├─ LOCAL_RESPONSE → 즉시 응답 반환 (로그인 불필요)  ✅ 정책 준수
  └─ NEED_LLM ↓
authGuard()  ← Gateway 이후 위치  ✅ 정책 준수
  └─ 실패 시 AUTH_REQUIRED
selectConsultationContext(draft)
  └─ null이면 INVALID_INPUT
computeConversationMemory(messages, memory)
buildPrompt(...)
adapter.generateResponse(...)   ← 현재 unconfigured → 항상 throw → REQUEST_FAILED
```

**ARCHITECTURE.md의 규정 순서와 실제 코드가 일치한다.**
(UI는 GPT를 모르고, PromptBuilder는 네트워크를 모르며, Adapter만 Provider를 안다.)

------------------------------------------------------------

## 7. 주요 파일 위치

새 개발자가 가장 먼저 볼 파일:

| 영역 | 경로 |
|------|------|
| 파이프라인 조립 | `src/features/chat/services/chatService.ts` ← **가장 먼저** |
| Gateway 정책 | `src/features/chat/gateway/AIGateway.ts` |
| LLM 교체 지점 | `src/features/chat/adapters/llmAdapter.ts` |
| Memory 계산 | `src/features/chat/memory/conversationMemory.ts` |
| Prompt 생성 | `src/features/chat/prompts/promptBuilder.ts` |
| Context 선택 | `src/features/chat/selectors/contextSelector.ts` |
| Chat 설정값 | `src/features/chat/config/chatConfig.ts` |
| 타입 정의(핵심) | `src/features/chat/types/chatArchitecture.ts` |
| 인증 컨텍스트 | `src/features/auth/context/AuthContext.tsx` |
| 인증 서비스 | `src/features/auth/services/authService.ts` |
| Supabase Client | `src/services/supabase/client.ts`, `config.ts` |
| Chat 화면 | `src/app/chat.tsx` |
| Login 화면 | `src/app/login.tsx` |
| 루트 Provider 결선 | `src/app/_layout.tsx` |
| 설정 | `package.json`, `app.json`, `tsconfig.json`, `.env` / `.env.example` |

------------------------------------------------------------

## 8. 인증 상태

- **[완료]** Auth State 모델: `loading | authenticated | unauthenticated` (`types/auth.ts`)
- **[완료]** AuthContext — 앱 전체 인증 상태 단일 제공, getSession + onAuthStateChange
- **[완료]** 세션 저장: `@react-native-async-storage/async-storage` (단일 client.ts)
- **[완료]** 중복 로그인 방지: `isSigningInRef`
- **[진행중]** Kakao Provider 코드
- **[보류]** Kakao 실제 로그인 성공 검증 (KOE205 이슈, 아래 11 참조)
- **[미구현]** Google / Naver / Apple

------------------------------------------------------------

## 9. AI 상태

- **[미구현]** 실제 AI 응답. 현재 `unconfiguredLLMAdapter.generateResponse()`는
  `throw new Error('LLM adapter is not configured.')`.
- 따라서 로그인된 사용자가 일반 질문(NEED_LLM)을 보내면:
  Gateway 통과 → authGuard 통과 → adapter throw → `REQUEST_FAILED` →
  화면에 "현재 AI 상담 기능을 준비하고 있습니다" 안내 메시지 표시.
- **[완료]** LLM Adapter 인터페이스(`LLMAdapter`)는 존재 → 향후 OpenAI/Claude/Gemini 교체 가능 구조 유지.
- **[완료]** 사용자용 에러 변환 — 내부 에러코드/스택을 노출하지 않고 안내 메시지로 변환.

------------------------------------------------------------

## 10. Supabase 상태

- **[완료]** Client 생성 로직 및 환경변수 로딩 (`config.ts`, 미설정 시 명확히 throw)
- `.env` 에 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **값이 채워져 있음**
  (`.gitignore`로 `.env` 제외 처리됨 — 값이 Git에 커밋되지 않음)
- **[미구현]** Edge Function (서버 측 인증/OpenAI 호출 지점) — 디렉터리 없음
- DB 스키마/테이블 관련 코드 없음 (아직 DB 사용 안 함)

------------------------------------------------------------

## 11. 발견된 문제 (미해결)

- **[문제/미해결] Login 화면 도달 불가 (Dead Route)**
  `src/app/login.tsx`는 `_layout.tsx`에 라우트로 등록되어 있으나,
  앱 어디에서도 `/login`으로 이동(push/replace/href)하는 코드가 없다.
  Chat 화면의 AUTH_REQUIRED 분기도 "로그인 기능은 현재 준비 중입니다"라는
  안내 텍스트만 보여줄 뿐 로그인 화면으로 보내지 않는다.
  → 현재 UI 흐름만으로는 사용자가 로그인할 방법이 없다.

- **[문제/미해결] Kakao account_email 권한 (KOE205)**
  Supabase + Kakao OAuth 연동 시 account_email 권한 문제로
  정상 로그인 완료가 검증되지 않았다. (개인 개발자 권한 제약 — 프로젝트 코드 문제 아님)

- **[문제/미해결] Conversation Memory 미완결**
  요약 대상 계산만 존재하고 요약 생성·저장 루프가 없어, 긴 대화에서 실제 토큰 절감 효과는 아직 없음.
  또한 `chat.tsx`의 `conversationMemory` state는 setter 없이 초기값으로 고정되어 진행되지 않는다.

------------------------------------------------------------

## 12. 해결된 문제 (과거 결정으로 종료됨)

- **[해결]** Web WASM 번들링 오류 (`Unable to resolve module wa-sqlite.wasm`)
  → expo-sqlite 세션 저장 방식 **철회**, AsyncStorage로 전환. (되돌리지 말 것)
- **[해결]** platform 분기(client.native.ts / client.web.ts) 복잡성
  → 단일 `client.ts` 구조로 통일.
- **[해결]** 모든 메시지가 GPT를 호출하던 비용 문제
  → AIGateway(Exact Match) 도입으로 인사/감사/작별/확인은 로컬 처리.
- **[해결]** 요약 중복 문제 → `lastSummarizedMessageId` 체크포인트 도입(계산 로직 한정).

------------------------------------------------------------

## 13. 해결되지 않은 문제 (요약)

1. Login 화면 도달 경로 부재 (Dead Route)
2. Kakao 실제 로그인 검증 미완 (KOE205)
3. LLM 실제 호출 전무 (Edge Function + Adapter 미구현)
4. Conversation Memory 요약 생성 루프 부재

------------------------------------------------------------

## 14. 중요한 기술 결정

- 세션 저장은 **AsyncStorage**. expo-sqlite로 되돌리지 않는다.
- Supabase Client는 **단일 client.ts**. 플랫폼 분기 금지.
- Gateway는 **Exact Match**. `String.prototype.includes()`(부분 문자열 매칭) 금지.
  - ⚠️ 코드의 `rule.phrases.includes(normalized)`는 배열 멤버십(정확 일치) 검사이므로
    정책 위반이 아니다. 금지 대상은 "문장 안에 단어가 들어있으면 로컬 처리"하는 부분 매칭이다.
    이 줄을 "includes 금지"로 오해하여 수정하지 말 것.
- 이메일 OTP 로그인은 제품 방향에서 **제외**됨.
- 목표 로그인: 카카오 / 네이버 / Google / Apple.
- OpenAI API Key는 절대 Client에 두지 않는다. 실제 보안 경계는 **서버(Edge Function)**.
- 모델 비종속 유지 — 초기 저비용 모델 → 향후 Adapter 교체로 고성능 모델 적용.

------------------------------------------------------------

## 15. 금지된 변경

- UI에서 OpenAI를 직접 호출하지 말 것.
- Gateway를 거치지 않고 LLM을 호출하지 말 것.
- Auth Guard를 Gateway **앞**으로 옮기지 말 것 (인사까지 로그인 강제 금지).
- Client에 OpenAI API Key 저장 금지.
- Mock 데이터로 미구현 기능을 "구현된 것처럼" 만들지 말 것.
- 파이프라인 순서(UI→ChatService→Gateway→Auth→Context→Memory→Prompt→Adapter→Edge→OpenAI) 변경 금지.
- 사용하지 않을 Interface/Service/Table을 미리 만들지 말 것 (과설계 금지).
  단, LLM Provider / OAuth Provider / 해석 엔진의 확장 가능성은 유지.

------------------------------------------------------------

## 16. 다음 Sprint 추천

**Sprint 2-17 후보 (우선순위 순)**

1. **Login 흐름 연결 (최우선, 저비용)** — Chat의 AUTH_REQUIRED 분기 또는 진입점에서
   `/login`으로 실제 라우팅. 현재 Dead Route를 살리는 것이 선행되어야 인증 전체가 테스트 가능.
2. **Edge Function + 실제 LLM 연결** — `supabase/functions` 신설, JWT 검증 후 OpenAI 호출,
   `unconfiguredLLMAdapter`를 실제 Adapter로 교체. (프로젝트 최대 미구현 축)
3. **Social Login 정상화** — Kakao 검증 재시도 또는 Google 우선 구현 중 택1.
4. 이후: Prompt Engine 강화 → 해석 Engine → 관리자 → 사용량/요금제 → 결제 → 배포 안정화.

> 최종 우선순위는 사용자 승인 후 확정한다. (분석 → 승인 → 구현 → 검증 순서 유지)

------------------------------------------------------------

## 17. 테스트 방법

```bash
npx tsc --noEmit     # 타입 검사 (현재 통과: exit 0)
npm run web          # Web 실행 육안 확인
git status --short   # 변경 확인
```

- 현재 `tsc --noEmit` **통과(에러 0)** 확인됨.
- LLM은 미구현이므로, NEED_LLM 경로는 "준비 중" 안내로 끝나는 것이 정상 동작이다.

------------------------------------------------------------

## 18. Git 상태

- 브랜치: `main` (origin/main과 동기화, up to date)
- Working tree: **clean**
- 원격: `git@github.com:deokbuntv-ship-it/deokbun-ai.git`
- 최근 커밋 흐름 (Sprint 대응):
  - `8e05622` OAuth foundation ····· Sprint 2-16
  - `938b42c` Supabase session ····· Sprint 2-15
  - `2d6a04e` auth guard ··········· Sprint 2-14
  - `cfae705` chat service + gateway  Sprint 2-13
  - `2f82246` conversation memory ··· Sprint 2-12
  - `bbc540d` AI gateway ··········· Sprint 2-11

------------------------------------------------------------

## 19. 새로운 개발자가 해야 할 첫 행동

1. PROJECT_HISTORY.md → ARCHITECTURE.md → 이 문서 순서로 읽는다.
2. `chatService.ts`를 열어 파이프라인 전체 순서를 눈으로 확인한다.
3. `npm install` 후 `npx tsc --noEmit`로 빌드가 깨지지 않았는지 확인한다.
4. `.env`에 Supabase 값이 필요하다 (`.env.example` 참고). 없으면 Client가 throw한다.
5. 코드를 바꾸기 전에 "이 변경이 15번(금지된 변경)에 걸리는가"를 먼저 확인한다.
6. 분석 → 승인 → 구현 → 검증 → commit → push 순서를 지킨다.

------------------------------------------------------------

## 20. 문서와 실제 코드의 차이 (Architecture Drift)

실제 코드를 우선하여 기록한다. 코드를 임의 수정하지 않았다.

| # | 문서 서술 | 실제 코드 | 판정 |
|---|-----------|-----------|------|
| 1 | ARCHITECTURE.md "Auth Guard 완료", "ChatService 연결 완료" | 코드 존재·컴파일 통과. 단 LLM 종단은 미연결 | 구조는 일치, 기능은 미완 |
| 2 | ARCHITECTURE.md/HISTORY "Login 구조 진행중" | login.tsx 존재하나 **도달 경로 없음(Dead Route)** | 문서에 없던 추가 문제 발견 |
| 3 | 문서상 Provider "카카오/네이버/Google/Apple 지원 예정" | 코드는 **Kakao만** 구현, 나머지 `NOT_SUPPORTED` | 계획 vs 구현 차이 (정상 범위) |
| 4 | ARCHITECTURE.md "Conversation Memory 완료" | 요약 **계산**만 구현, 요약 **생성** 없음 | 문서가 다소 과대 표기 |
| 5 | "Exact Match, includes() 금지" | `Array.includes`(정확 일치) 사용 — 부분매칭 아님 | 정책 준수 (오해 주의, 14번 참조) |
| 6 | ARCHITECTURE.md "Edge Function 예정" | `supabase/functions` 없음 | 일치 (미구현 확인) |
| 7 | "GPT-5.5 Mini / gpt-mini" | `chatConfig.defaultModel='gpt-mini-placeholder'` | 플레이스홀더, 실모델 미결정 |
| 8 | Context Selector는 HISTORY "완료 목록"에 없었음 | 실제로 `contextSelector.ts` 구현·연결됨 | 문서보다 코드가 앞섬 |
| 9 | `requireAuthenticatedUser` 가드 | export만 되고 **어디서도 소비 안 됨**. chat.tsx는 `() => isAuthenticated` 클로저 사용 | 미사용 export (기능엔 영향 없음) |

------------------------------------------------------------

*이 문서는 Repository 실제 상태(기준 커밋 `8e05622`)를 검사하여 작성되었다.*
*새 Layer 추가나 책임 변경 시, 그리고 위 Drift 항목이 해소될 때마다 이 문서를 갱신한다.*
