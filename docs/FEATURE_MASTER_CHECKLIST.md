# 기능 마스터 체크리스트

작성: 2026-09-02 · **9개 축 고정.** 이 목록은 줄어들지 않는다.

---

## 사용 규칙

> **인수인계서·인벤토리를 만들 때 이 목록 전체를 대조한다.**
> 목록에 없는 기능이 발견되면 **먼저 이 문서에 항목을 추가한 뒤** 인수인계서에 반영한다. 역순으로 하지 않는다.
>
> **이 문서가 존재하는 이유**: 2026-09-02 인벤토리에서 유명인 사주가 통째로 누락되고
> UTM/Acquisition 이 한 줄로 뭉개졌다. 상담엔진 중심으로 목록을 잡았기 때문이다.
>
> **한 번 등재된 항목은 삭제하지 않는다.** V1.1 로 미루거나 취소할 때도 사유와 함께 남긴다.
>
> ⚠ **이 문서는 "무엇이 있는가"(구현 상태)만 소유한다.** "무엇이 출시에 필요한가"(BLOCKER / SHIP /
> V1.1 / DROP)는 **`docs/V1_CUTLINE.md` 가 소유**한다. 여기에 컷라인 등급을 적지 말 것 —
> 두 곳에 적으면 반드시 어긋난다. 새 항목을 추가하면 컷라인 문서에서 **분류를 받아야 한다.**

## 판정 기준 (2026-09-04 확정)

판정은 **세 가지를 모두** 통과해야 한다. 하나라도 빠지면 아래 등급이 내려간다.

1. **실제 호출 경로가 있는가.** 문서·주석·타입 선언은 근거가 아니다.
2. **스키마가 배포돼 있는가.** 화면·서비스·RLS·트리거가 완비여도 테이블이 없으면 런타임은 404 다.
3. **어느 환경인가.** `staging` 과 `production` 의 스키마·배포가 서로 다르다.

| 판정 | 뜻 |
|---|---|
| `DONE` | 호출 경로 + 스키마 + 화면이 전부 있고 **실제로 동작을 확인**했다 |
| `FUNCTIONAL` | 동작하나 **일부가 미검증**이다. 무엇이 미검증인지 명시 |
| `PARTIAL` | 일부만 있다. **무엇이 없는지 반드시 명시** |
| `NOT_STARTED` | 호출 경로가 없다 |
| ⛔ | 코드는 완비인데 **그 환경에 스키마가 없다** (§0) |

### 환경을 붙여 적는 규칙 — 이걸 안 지켜서 두 번 틀렸다

**환경을 붙이지 않은 판정은 틀린다.** 실제로 두 번 틀렸다:
- staging 만 보고 유명인·콘텐츠를 "죽었다"고 판정 → **production 에서는 살아 있었다**
- 관리자 축 2-1 을 `DONE` 으로 판정 → **staging 에서는 RPC 6종이 없어 죽어 있었다**

그래서 두 환경이 다르면 **`prod DONE / staging ⛔`** 처럼 **둘 다** 적는다. 같으면 그냥 적는다.

### 표 구조 규칙 — 기계 집계가 되도록

- **항목 행의 1열은 `축번호.항목번호`** 로 시작한다 (`3.1` `3.8b`, 축 2 는 `2-1 …`).
- **분석·설명 표**(퍼널 단계, 지표 목록 등)의 1열은 그 형식을 쓰지 **않는다**. 그래야 집계에서 빠진다.
- **판정은 굵게** 쓰고 위 4값 중 하나로 시작한다. `**DONE** (staging 2026-09-04)` 처럼 뒤에
  덧붙이는 것은 괜찮다. `있음`·`부분` 같은 임의 어휘는 쓰지 않는다.
- 고친 뒤에는 **`node scripts/checklist-tally.mjs --check`** 로 확인한다.

---

## §0 이번 조사의 최대 발견 — 스키마 이원화 (2026-09-03 **실측 갱신**)

**두 개의 스키마 시스템이 있었고, 한쪽이 배포되지 않았다. 2026-09-04 에 staging 에서 해소했다**(방안 C·묶음 5개). production 은 아직 이원화 상태다 — 오너 승인 대기(`PROJECT_STATE.md` §7.10.1 11단계).

| 경로 | 적용 방법 | 상태 |
|---|---|---|
| `supabase/migrations/*.sql` (**60개**) | `supabase db push` | staging **59/60** · **production 59/60 — 2026-09-06 승격 완료** (테이블 57/57 · 함수 93/93) |

> ✅ **2026-09-06 production 승격 완료.** 이력이 `20260827000000` 에서 멈춰 있던 것을 38개 push 로 따라잡았다. 가장 큰 위험은 재실행이 아니라 **손으로 만들어진 13개 테이블**이었고(`create table if not exists` 가 고치지 않는 컬럼 151개), 승격 앞에 `docs/PRODUCTION_COLUMN_RECONCILE.sql` 로 막았다. Edge **13/18 ACTIVE** — 남은 5개는 IAP·미디어 시크릿 대기(`PRODUCTION_SCHEMA_PROMOTION_PLAN.md` §10). ⚠ **미적용 1개**: `20260914000000`(옛 정책 이름 오류 정정, §9-1). ⚠ **실동작 검증은 아직 없다**(§9-3·9-5·9-6).

> ⚠⚠ **정정 (2026-09-05).** 이 표는 오랫동안 staging 숫자만 담고 있었고, 2026-09-04 의 승격
> 사전점검마저 **staging 에서 돌아갔다.** 그 결과 "production 도 거의 다 되어 있다" 고 믿었다.
> **진짜 production 은 마이그레이션 이력이 `20260827000000` 에서 멈춰 있다** — 열흘치 작업이
> 통째로 안 올라가 있고, 테이블 24개·함수 55개가 없다.
> 그리고 production 에 **있는** 테이블 33개 중 **13개는 마이그레이션이 아니라 손으로 만들어졌다**
> (`create table if not exists` 가 그것을 고치지 않으므로 승격 중 실패 지점이 된다).
> 승격 절차는 `docs/PRODUCTION_SCHEMA_PROMOTION_PLAN.md` 로 전면 재작성했고,
> 컬럼 보정 SQL(`docs/PRODUCTION_COLUMN_RECONCILE.sql`)과 옛 정책 제거 마이그레이션
> (`20260913000000`)을 새로 만들었다. **환경 표기를 진단 SQL 첫 줄에 넣었다** (`PROJECT_STATE` §7.34).
| `docs/*.sql` + `docs/admin/*.sql` (25개) | ~~오너가 대시보드에 붙여넣기~~ | **2026-09-04 승격 완료 — 19/25 가 이제 마이그레이션이다.** 남은 2개는 의도적 보류, 4개는 객체 없음 |

> **정정 (2026-09-03).** 이 절의 최초 판(2026-09-02)은 **파일 수를 24개로, 미적용 테이블을 6개로**
> 적었고 **`content_posts`** 라는 **존재하지 않는 테이블 이름**을 실었다. 실제 이름은
> **`content_items`**(`docs/admin/CONTENT_01_SETUP.sql`)다. 아래는 추론이 아니라
> **staging 라이브 실측**이다 — 스크립트 `.runtime/sql_bifurcation_probe.mjs`
> (`GET /rest/v1/<t>?limit=0` 404/200 · `POST /rest/v1/rpc/<f>` PGRST202).

### staging 실측 — 파일 25개 (**2026-09-04 승격 후**)

| 판정 | 수 | 내용 |
|---|---:|---|
| **적용됨** | **19** | 소비자 코어 2 · 관리자 기반 5 · 콘텐츠/유명인 10 · 스토리지 1 · 대시보드 1 · 광고 1 |
| **미적용** | **2** | `CONSULTATION_INTELLIGENCE_DB` · `FORTUNE_MAIL_SETUP` — **의도적 제외.** 쓰는 코드가 아직 없어 승격하면 모든 신규 환경에 빈 테이블이 생긴다. 파이프라인이 나올 때 함께 승격한다 |
| 테이블·함수를 만들지 않음 | 4 | `ADVERTISEMENTS_DIAGNOSTIC`(읽기전용 진단) · `AI_USAGE_LOGS_REQUEST_ID`(**죽은 파일** — mig `20260902000000` 이 대체) · `FORTUNE_DELIVERY_SETUP`(컬럼, fortune 과 함께 보류) · `IMAGE_STORAGE_SETUP`(버킷 — 승격 완료) |

**객체 단위: 테이블 18/24, 함수 14/17.** 빠진 6테이블·3함수는 전부 위의 의도적 제외분이다.

> **승격 전(2026-09-03)에는 파일 5/25, 테이블 7/24, 함수 3/17 이었다.** 차이는 새 마이그레이션
> 5개(`20260904000000`~`20260904000400`)다 — 상세는 `PROJECT_STATE.md` §7.10.2.

| 있음 (18 테이블) | `profiles` `consultation_subjects` `conversations` `conversation_messages` `consultation_drafts` `admin_users` `ai_usage_logs` · `famous_profiles` `famous_snapshots` `famous_ai_suggestions` · **`content_items`** `content_versions` `content_assets` `content_publications` `provider_connections` · `advertisements` `ad_tracking_events` `user_acquisition_attribution` |
|---|---|
| 없음 (6, 전부 의도적) | `consultation_intelligence_runs` `assessment_items` `consultation_quality_reviews` `user_feedback` `consultation_outcomes` · `fortune_mail` |
| 있음 (14 함수) | `is_admin` `admin_dashboard_overview` `admin_list_ai_usage`(3인자) `admin_list_users` `admin_get_user` `admin_list_consultations` `admin_get_consultation` `admin_daily_activity` `admin_list_scheduled_publications` `admin_ad_performance` `public_list_content`(4인자) `public_get_content` `public_list_famous` `public_get_famous` |
| 없음 (3, 전부 의도적) | `admin_list_intelligence_runs` `admin_get_intelligence_run` `ci_owns_run` |

부수 실측: `ai_usage_logs.request_id` 있음 · storage 버킷 `content-media` **있음** ·
`content_items` 가 `slug/category/published_at/hero_image_url/hero_alt/video_url` 전부 보유 ·
`fortune_mail.delivery_channel` 은 기반 테이블 보류로 없음.

**트리거·RLS 는 카탈로그로 직접 측정할 수 없다** — PostgREST 는 `public` 스키마만 노출한다.
대신 **기능 테스트로 관측했다**(2026-09-04, staging, 27건 전건 통과): 유명인 발행 시
`published_at` 이 트리거로 찍히고, 관리자 해제 즉시 `famous_profiles` 쓰기가 `42501` 로 거부되며(RLS),
attribution INSERT 가 `first_touch_at` 을 서버 클릭시각으로 정정한다(트리거).

> ⚠ **측정 함정 2건 기록.** ① `returns trigger` 함수는 PostgREST 가 노출하지 않아 존재해도
> PGRST202 가 난다 → 트리거 함수 13개를 UNMEASURABLE 로 분리했다. ② **기본값 없는 인자를 가진
> 함수**도 빈 `{}` 호출에 PGRST202 를 돌려주는데, **없는 함수와 문구가 글자 그대로 동일하다**
> (2026-09-04 대조 실측). 파라미터 이름을 SQL 에서 파싱해 null 로 넘기도록 고쳐
> `admin_get_user` · `admin_get_consultation` · `public_get_content` · `public_get_famous`
> 4건의 오탐을 제거했다. **PGRST202 를 "없음"으로 곧장 읽으면 안 된다.**

### ⚠ production 은 staging 과 다르다 — 이 구분이 판정을 바꾼다

production 조회는 금지라 **간접 근거만** 정리한다. `docs/DATABASE_RUNBOOK.md` §D 가
*"Per your report"* 로 기록한 오너 구두 보고에 따르면 production 에는
`ADMIN_SETUP` · `ADMIN_02..05` · `CONTENT_01` · `PUBLIC_SETUP` · `PUBLICATION_SETUP` ·
`CONTENT_ASSETS_SETUP` · `CONTENT_05_07_SETUP` · `FAMOUS_AI_SETUP` **9개가 적용돼 있다.**

| 기능 | staging | production (간접 근거) |
|---|---|---|
| 유명인 사주 · 콘텐츠 CMS · 사용자/상담 관리 | **죽음** | **살아 있음** (RUNBOOK §D) |
| 광고 / Acquisition | **죽음** | **죽음** — RUNBOOK §C 가 HOLD, *"2026-08-14 1차 적용이 `set_updated_at()` 의존성에서 실패하고 아무것도 남기지 않았다"* |
| Consultation Intelligence · fortune_mail | 죽음 | 죽음 — **의도적 HOLD**(쓰는 코드가 아직 없다) |

**따라서 "테이블이 없으니 기능이 죽었다"는 문장은 환경을 붙이지 않으면 틀린다.**
유명인·콘텐츠는 production 에서 살아 있고 staging 에서만 죽어 있다.

> **오너 액션**: 승격 방안 A/B/C/D 중 선택 — `PROJECT_STATE.md` §7.10 · §8 A1. 권고는 **C**.

---

## 축 1 — 소비자 기능 (18항목)

| # | 항목 | 판정 | 근거 | 없는 것 |
|---|---|---|---|---|
| 1.1 | 일반 상담 | **DONE** | Edge `chat` · `(tabs)/consult.tsx` · `chat.tsx`. **렌더 검증 완료 (2026-09-06)** — 진입점 17건(가격 라벨·대상자 게이트·지갑 미상≠부족) + 대화 15건(5턴 표시·세션경계 컴포저 차단·만료≠소진·GROUNDING/INSUFFICIENT/AUTH) (§7.22) | — |
| 1.2 | 궁합 상담 | **DONE** | `buildCompatibilityConsultation` · `(tabs)/compatibility.tsx` · `compatibility-chat.tsx` . **렌더 검증 완료 (2026-09-06)** — 진입점 8건: 가격 라벨·본인/상대 게이트·지갑 미상 구분 (§7.24) + **대화 본문 16건**: 5턴 소진 시 컴포저 제거·동의 카드에 가격·만료≠소진·덕 부족·다크 (§7.28) + **2026-09-06 절기 경계일 게이트 전진 배치**: 판정을 결제 앞으로 당겨 궁합 탭 CTA 비활성 + 대화 화면 `send()` 백스톱(딥링크) + 등록 폼 문안. 렌더 34건(게이트 13 · 컴포넌트 11 · 백스톱 4 · 다크 1 + 기존) + **2026-09-06 H6 해소**: 빌더 조기 종료 → 무근거는 422·덕 0·LLM 0콜, 정상은 12덕 1회. staging 13/13 · 미니팩 PASS 58.48 (§7.30) | ⚠⚠ **H7 은 궁합만의 문제가 아니다** — 가격이 두 버킷에 걸치면 원장 커밋이 롤백돼 **503**(세 유료 상품 전부, 실측 6/6). IAP 개통 전 인덱스 수정 필요(`OWNER_TODO` A0) |
| 1.3 | Premium 리포트 | **DONE** | `features/premium/**` · `app/premium.tsx` · V3 품질 완료. **렌더 검증 완료 (2026-09-06)** — 로딩 4단계·경과초 증가·퍼센트 부재·다섯 실패 분기 (11건, `PROJECT_STATE.md` §7.20) | — |
| 1.4 | 오늘의 운세 | **DONE** | `kind:'today_fortune'` · `app/today.tsx`. **렌더 검증 완료 (2026-09-06)** — 13건: 여섯 상태 분기 · **절기 경계일 전용 안내** · 과거일 미재생성 · 후속질문에 본문 미탑재 (§7.22) | — |
| 1.5 | 월별 운세 | **DONE** | `kind:'monthly_fortune'` · `app/monthly.tsx`. **렌더 검증 완료 (2026-09-06)** — **절기 경계일 전용 안내가 여기에도 있다**(등록·오늘·홈에 이은 네 번째 자리) (§7.26) | — |
| 1.6 | **연간 운세** | **NOT_STARTED** | 전용 화면·경로 없음 | Premium 이 12개월을 덮으므로 **별도 상품인지 오너 판단 필요**. 현재는 없음 |
| 1.7 | 운세 우편함 | **DONE** | `(tabs)/inbox.tsx` · `consultation_reports`. **렌더 검증 완료 (2026-09-06)** — 4건: 전부 비어도 오류로 보이지 않고, 한 소스가 죽어도 화면이 남는다 (§7.26) | — |
| 1.8 | 상담 이력·재열람 | **DONE** | `records.tsx` · `report/[id].tsx` · `subject-history.tsx`. **렌더 검증 완료 (2026-09-06)** — 없는 id·남의 리포트·조회 실패가 **전부 같은 화면으로 수렴**(존재 여부 미노출) (§7.26) | — |
| 1.9 | 공유 (링크 + 카드 + **익명 미리보기**) | **DONE** | `shareService` · `ShareReportSheet` · `shared-report/[token]` · mig `20260818000300`. **2026-09-06: 익명 미리보기**(`get_shared_report_preview`) — 로그인 없이 결론 문단 + 잠긴 개수까지, 이름·유료본문은 서버가 애초에 안 보낸다. 전체 읽기 권한 불변. E2E 19/19 (`PROJECT_STATE.md` §7.19). **렌더 검증 완료 (2026-09-06)** — 익명 분기에 이름 0·전체읽기 RPC 미호출·전환 경로 (11건) | — |
| 1.10 | 후속질문 | **DONE** | `today.tsx`/`monthly.tsx`/`FortuneReading.tsx` · 세션 5턴 | — |
| 1.11 | "왜 이렇게 보나요" | **DONE** | `groundedNarrative.SYNTHESIS_SECTION_TITLE` | — |
| 1.12 | 피드백 | **DONE** | `feedbackService.ts` · mig `20260819000200` | — |
| 1.13 | **유명인 사주 열람** | **FUNCTIONAL** | `famous/index.tsx` · `famous/[slug].tsx` · `famousService.ts`. ⚠ **2026-09-06 정정** — `famous_profiles` 는 staging 에 **있다**(조회 200, mig `20260904000100`). ⛔ 는 문서 지연이었다 + ⚠ **2026-09-08 SEO 골격 완료** — `generateStaticParams` 로 인물별 정적 HTML, 빌드 타임 데이터 주입, description·canonical·JSON-LD(Article)·sitemap 전부 생성(dist 실측: 본문 **91자 → 519자**). 발행 시 Deploy Hook 자동 재배포까지 배선 (§2-5) ✅ **2026-09-04** — 엔진 연결(S1) · 시각 미상 정책(S2) · 본문 생성(S3/S4) · 명식 표(F3 = C 수준) 완료. **본문 품질 V2→V3**: 근거량 1,253 → **4,678** 토큰, 근거 인용 0 → **65개**, 표 되뇌기 69% → 14%, 개념 설명 0 → **7종**. ⚠ **V3 에서 글자 관계(합·충·형·파·해·삼합·방합)를 열었다** — 그 전제였던 "엔진이 판정하지 않는다" 가 사실이 아니었다(§7.33). 검사기를 단어 차단 → **화이트리스트 대조**로. **V4 에서 투간·통근·기둥 간지·십성/오행 개수까지 대조**로 확장 — 실측 투간 4/4 · 통근 14/14 · 관계 7/7 · 수치 위반 0(`FAMOUS_SAMPLE_OUTPUT_V4.md`). **V5 에서 프롬프트가 자리+글자를 강제** — 관계가 혼자 성공한 이유를 투간·통근에 옮겼다. 판정된 통근 주장 **14 → 33건(2.4배)**, 전부 일치. **사람 전수 대조 사실 오류 3건 → 0건**(`FAMOUS_SAMPLE_OUTPUT_V5.md`). ⚠ 남은 것은 종류가 다르다 — 자리·글자는 맞는데 **자료에 없는 등급 판단**(여기를 "주된 십성" 이라 함). dist 실측: 본문·표·고지 전부 정적 HTML 안에 있고 **대운 0회** | ⚠ **실존 인물 법률 검토 미완**(`OWNER_TODO` Z11 · `KNOWN_RISKS` M-FAMOUS) — 검증은 전부 가상 명식. 그리고 오너 Vercel 설정 2가지(`OWNER_TODO` Z10) |
| 1.14 | 홈 | **DONE** | `(tabs)/index.tsx`. **렌더 검증 완료 (2026-09-06)** — 12건: **소스 5개 동시 실패에도 화면 생존** · 절기 경고 세 번째 자리 · 지갑 로딩 중 0덕 미단정 (§7.22) | — |
| 1.15 | MY / 프로필 | **DONE** | `(tabs)/my.tsx` · `profiles` | — |
| 1.16 | 출생정보 수정 | **DONE** | `birth-info.tsx` · `subject-manse.tsx` · 절기 게이트 포함. **렌더 검증 완료 (2026-09-06)** — 컴포넌트 5건 + **폼 전체 14건**: 경계일×(모름/대략/정확) 분기 · [시각 입력하기]/[이대로 저장] 실동작 · 두 검증기 일치 (§7.26) | — |
| 1.17 | 다중 대상(가족·지인) | **DONE** | `subjects.tsx` · `consultation_subjects` | — |
| 1.18 | **안전 라우팅 (위기·수명·의료 하드스톱)** | **DONE** | 2026-09-06 등재 — **기능인데 목록에 없었다**(사용 규칙대로 먼저 여기에 추가). `consultationSafety.ts` 순수 분류기 4종을 Edge `index.ts` 가 **과금 전에** 시험한다 → **덕 0 · 세션 0 · LLM 0콜**. 발동은 `ai_usage_logs` 0토큰 행으로 집계(원문·user_id 미기록). 렌더 10건 + 잠금 51건. 오검출 축소 3종 후 **미발화 0건 · B84 0/84 · 미니팩 PASS** (§7.25 · §7.28, `docs/SAFETY_ROUTING_AUDIT.md`) | ⚠ 상담전화 번호가 하드코딩 · 전화 걸기 링크 없음(오너 판단). ~~`진단해` MEDICAL 오검출~~ → **2026-09-06 해소**(의료 단서 요구로 축소, 미니팩 PASS 58.48) |

부수 화면(정책 6종·알림 2종·충전·지갑·생애사건·콘텐츠)은 축 6~9 에 배치.

---

## 축 2 — 관리자 CMS (8축 / 25화면 매핑)

| 축 | 화면 | 판정 | 없는 것 |
|---|---|---|---|
| 2-1 사용자/상담 관리 | `users/index` `users/[userId]` `consultations/index` `consultations/[conversationId]` `consultation-intelligence/index` | **DONE** (staging 2026-09-04 해소) | **정정 (2026-09-03 실측).** 화면·서비스는 완비이나 이 축이 쓰는 RPC 6종(`admin_list_users` `admin_get_user` `admin_list_consultations` `admin_get_consultation` `admin_list_intelligence_runs` `admin_get_intelligence_run`)이 이제 staging 에 **전부 있다**(mig `20260904000000`, 기능 테스트로 /admin/users·/admin/consultations 동작 확인). CI 5테이블만 양쪽 다 **의도적 HOLD** → consultation-intelligence 화면은 계속 준비 중. **렌더 검증 완료 (2026-09-06)** — 사용자·상담 목록 + 대시보드 23건: 로딩/비어있음/오류 세 상태가 구분되고 RPC 부재 시 **fail-closed**(빈 목록으로 위장하지 않는다). 검색창 접근 이름 부재 1건 수정. ⚠ **대시보드는 부분 응답 방어가 없다** — 지표 필드 하나가 없으면 콘솔이 백지가 된다(보고만, §7.28) |
| 2-2 **유명인 사주** | `famous/index` `famous/new` `famous/[id]` | **DONE** (staging 2026-09-04) | 테이블 3종 + 트리거 + RLS 적용(mig `20260904000100`). 등록→발행→공개조회 기능 테스트 통과. 남은 것은 **동일 인물 중복 방지**뿐(축 6) |
| 2-3 월별운세 이메일 | `fortune-mail/index` | **PARTIAL** | `run-email-campaigns` **staging 배포 완료(2026-09-04)** 하고 Resend 어댑터도 이미 코드에 있다. **남은 것은 시크릿 3개뿐** — `EMAIL_PROVIDER=resend` · `RESEND_API_KEY` · `EMAIL_FROM`. 그 전까지 `not_configured` 로 fail-closed(가짜 SENT 없음) |
| 2-4 **Acquisition/UTM** | `ads/index` `ads/new` `ads/[id]` `ads/performance` | **DONE (웹+UTM) / 네이티브는 오너 설정 대기** | 스키마(mig `20260904000400`) + `ad-track` Edge v1 + **B1 utm_content 폴백**(2026-09-04). E2E 26/26 + UTM 13/13. CAC/CPA `cost_krw` 로 계산. 관리자 카드가 Google/Meta URL 을 만들어 준다. **남은 것: 앱 딥링크 개통(코드 완료, 오너 4단계 §8 B3b) · 설치 유입(A3, 별개 문제)** |
| 2-5 주문/결제/DUK | `economy/index` | **FUNCTIONAL** | 원장·조정은 동작. **IAP 미개통이라 주문 데이터가 없음** |
| 2-6 **CS** | `support/index` | **DONE** (2026-09-04) | 앱 내 문의 폼(`/support`) + 내 문의 내역 + 관리자 큐·답변. 사용자는 자기 것만(RLS), 관리자는 `admin_answer_inquiry` RPC 로만 쓰기 → **원문 불변**. staging E2E 20/20. **없는 것: 답변 이메일 발송**(이메일 provider 대기) · 스레드 · 첨부 (의도적 제외) **렌더 검증 완료 (2026-09-06)** — 사용자 화면 10건(응답시간 약속 부재 확인) + 관리자 큐 9건(RPC 부재 시 빈 목록 아님·원문 편집 불가). |
| 2-7 콘텐츠/공지 | `content/index` `content/new` `content/[id]` `publications/index` `popular-questions/index` | **DONE** (staging 2026-09-04) | **`content_items`**(`content_posts` 아님) 외 4테이블 + `admin_list_scheduled_publications` + 검색(`p_search`)·`hero_alt`·`video_url` 까지 staging 에 전부 적용됨(mig `20260904000100`). 등록→발행→검색→상세 기능 테스트 통과. **production 에는 검색·비디오·스케줄러 3건이 여전히 PENDING** |
| 2-8 운영지표 대시보드 | `index`(대시보드) `ai-usage/index` `engine-status/index` `retention/index` `system-settings/index` | **DONE** (staging 2026-09-04) | `admin_daily_activity` 적용(mig `20260904000300`) → 추이 차트 동작(7일치 반환 확인). AI 사용량 유형 필터(3인자)도 동작. **production 은 아직 미적용** → 그쪽 차트는 계속 unavailable |

**비어 있는 축: 없다 (2026-09-04, CS 신설로 9축 전부 채워짐).** 2026-09-04 승격 + `ad-track` 배포 후 staging 에서 막혀 있는 것은 **2-3(이메일 provider 미설정) 하나**다. 2-4 는 웹 기준 동작하고 네이티브·UTM 만 남았다. **production 은 여전히 6개 SQL 이 PENDING 이고 `ad-track` 도 배포 여부가 문서에 없다** — 어느 환경을 말하는지 붙이지 않은 판정은 계속 틀린다.

---

## 축 3 — Growth / Acquisition (10항목)

### 3-A 관리자 기능

| # | 항목 | 판정 | 근거 |
|---|---|---|---|
| 3.1 | 캠페인 생성 | **DONE** (staging 2026-09-04) | `ads/new.tsx` · `advertisements` 적용·E2E 등록 확인 |
| 3.2 | 전용 추적 링크 | **DONE** | `trackingCode.ts` (`ad_`+8, 30^8 공간) · `?ad=CODE` · Edge 가 코드→광고 해석 확인 |
| 3.3 | QR 생성 | **PARTIAL** | 추적 URL 을 그대로 QR 페이로드로 쓰라는 안내만 있고 인코더는 없음 |
| 3.8b | `utm_source/medium/campaign/term` 저장 (**B2**) | **NOT_STARTED** | 의도적 보류. 오늘 아무도 읽지 않고 광고별 숫자는 내부 코드로 나온다. 채널이 2개를 넘고 플랫폼 리포트와 대사가 필요할 때 착수 — `PROJECT_STATE.md` §7.12-B |
| 3.4 | 활성/중지 | **DONE** | `advertisements.status` (draft/active/ended/disabled). Edge 는 active·ended 만 클릭 수용 |
| 3.5 | 캠페인명·메모·**광고비** | **DONE** | `publisher_nickname` `notes` **`cost_krw`** — CAC 계산의 입력(3-E 정정 참조) |
| 3.6 | 유입 채널 구분 | **DONE** | `ad_type`(shorts/video/reels/post/other) · `contract_type` |
| 3.7 | 랜딩 위치 지정 | **NOT_STARTED** | `?ad=` 는 어느 페이지에나 붙지만 관리자에서 랜딩을 **지정**하는 필드 없음 |

### 3-B 파라미터

| # | 항목 | 판정 | 비고 |
|---|---|---|---|
| 3.8 | `utm_content` 로 내부 코드 수신 (**B1**) | **DONE** (2026-09-04) | `parseTrackingCodeFromQuery` 가 `?ad=` → `utm_content` 순으로 읽는다. 스키마·Edge 변경 0. staging E2E 13/13. 관리자 카드에 Google/Meta URL 복사 버튼 |
| 3.9 | 내부 campaign_id 분리 | **DONE** | `advertisements.id`(uuid)와 `tracking_code`(문자열)가 분리돼 있어 **코드가 바뀌어도 캠페인 식별은 유지**된다. 설계는 옳다 |

> **판정 (2026-09-04 갱신)**: **해소됐다.** 구글·메타 랜딩에 `utm_content=<내부코드>` 를 넣으면
> 추적된다. 관리자 카드가 그 URL 을 만들어 주므로 손으로 조립할 일이 없다.
> `utm_content` 가 내부 코드 형식이 아니면(마케터 소재명 등) **무시**한다 — 오탐 방어.

### 3-C 가입 전 attribution 보존 — **DONE (staging, 2026-09-04 E2E 실측)**

**체인 전체가 실재한다.** 상세는 보고서 §3.

| 단계 | 위치 |
|---|---|
| ① 랜딩 `?ad=` 파싱 | `AcquisitionBridge.tsx` effect(1) |
| ② 익명 보존 | `acquisitionContext.ts` — 웹 `sessionStorage`, 네이티브 in-memory, **first-touch 고정**(덮어쓰지 않음), **TTL 6시간**(`ACQUISITION_TTL_MS`). TTL·first-touch 는 브라우저 저장소라 E2E 대상이 아니고 `trackingAndAcquisition.test.ts` 가 단위로 잠근다 |
| ③ 익명 클릭 기록 | `recordAdClick` → `ad-track` Edge (service role) |
| ④ URL 에서 `?ad=` 제거 | `history.replaceState` — 라우터 파라미터로 전파 안 함 |
| ⑤ 인증 시 연결 | `AcquisitionBridge.tsx` effect(2) → `recordAcquisitionAttribution(userId)` |
| ⑥ 서버 검증 | Edge 가 **JWT 를 검증하고 토큰의 user id 를 쓴다** — 클라이언트가 보낸 userId 는 신뢰하지 않음 |
| ⑦ 앵커 생성 | `user_acquisition_attribution` INSERT |
| ⑧ 가입 판정 | 트리거 `ad_reconcile_attribution` — JWT 계정 + **서버 기록 클릭** + `auth.users.created_at >= click.created_at` 3조건 전부 충족해야 signup. 추론 금지 |
| ⑨ 마운트 | `app/_layout.tsx:67` |

**해소됨**: ~~스키마 미적용~~ → 2026-09-04 승격 + `ad-track` Edge v1 배포로 ①~⑨ 전 구간 실측 통과(3-D).

**남은 끊김 1개 (코드 결함 아님)**
- **네이티브 유입 미추적** — effect(1)이 `window.location` 없으면 조기 반환한다. 앱 설치 경유 유입은 `?ad=` 를 볼 수 없다. **웹 전용이다.** §7.12

### 3-D 퍼널 — **2026-09-04 E2E 실측** (`.runtime/funnel_e2e.mjs`, 26/26 PASS)

`ad-track` Edge 를 staging 에 배포(v1)한 뒤, 익명 클릭 → 계정 생성 → attribution → signup →
출생정보 → 첫 상담 → 성과집계까지 **실제로 이어지는 것을 확인했다.** 어제 실패했던 것은 테스트가
계정을 클릭보다 먼저 만들었기 때문이고, 순서를 바로잡으니 전 구간이 통과했다.

| 단계 | 기록 위치 | 판정 | 실측 |
|---|---|---|---|
| 광고 노출 | **없음** | **NOT_STARTED** | 유튜브·인스타 쪽 노출/클릭은 이 시스템이 볼 수 없다. 아래 "클릭"은 **랜딩 도착**이다 |
| 클릭 = 랜딩 | `ad_tracking_events(event_type='ad_click')` | **DONE** | Edge 200, `code → ad_id` 해석, `visitor_id` 기록 |
| ↳ 미등록 코드 | — | **DONE** | 조용히 무시(`ignored:'ad'`) — 열거 오라클 없음 |
| ↳ 크롤러 | — | **DONE** | `Googlebot` UA 는 클릭으로 세지 않음(`ignored:'bot'`) |
| 출생정보 입력 | 트리거 `ad_on_birth_info` on `consultation_subjects` | **DONE** | `birth_info_completed` 1건 |
| 가입 | 트리거 `ad_reconcile_attribution` on `user_acquisition_attribution` | **DONE** | `signup_at` + `signup` 이벤트 1건. **`first_touch_at` 이 서버 클릭시각으로 정정됨**(밀리초까지 일치) |
| 첫 상담 | 트리거 `ad_on_chat_success` on `ai_usage_logs` | **DONE** | 1건. **두 번째 상담은 유니크 인덱스가 막음** |
| D1 / D7 / D30 | `admin_ad_performance` 가 **읽기 시점에 계산** | **DONE (광고별)** | 가입 직후라 0/0/0 — 정상. `signup_at + N일` 이후 성공 상담 존재 여부(rolling survival) |

**거절 조건도 조건이다** — 하나씩 깨뜨려 확인:

| 깨뜨린 조건 | 결과 |
|---|---|
| N1 계정이 클릭보다 **먼저** 생성 | signup 거절(`signup_at=null`), attribution 은 유지. 하위 마일스톤도 오염 안 됨 |
| N2 **서버 기록 클릭 없음** | signup 거절. 시간창으로 추론하지 않음 |
| N3 **JWT 없음** | `ignored:'auth'` — 앵커 자체가 생기지 않음. 클라이언트가 보낸 `userId` 는 무시 |
| N4 두 번째 광고 attribution | `first_ad_id` **불변**(first-touch), `latest_ad_id` 만 갱신 |

### 3-E 지표 — 2026-09-04 실측

| 지표 | 계산 가능? |
|---|---|
| 클릭 수 · 고유 방문자 | **DONE** — `clicks 2 / unique_visitors 2` 확인. 신뢰할 `visitor_id` 가 하나도 없으면 **null**(조작된 0 아님) |
| 출생정보/가입/첫상담 전환율 | **DONE** — `birth_info 1 / signups 1 / first_consultations 1` 확인 |
| D1·D7·D30 리텐션 | **DONE (광고별)** — `admin_ad_performance` 가 계산. **없는 것은 광고와 무관한 전체 코호트 리텐션**이다 |
| 채널별·캠페인별 사용자 수 | **DONE** — `first_ad_id` 기준 집계 |
| **CAC / CPA** | **DONE** — ⚠ **아래 정정 참조** |

> **정정 (2026-09-04).** 이 표의 이전 판은 *"CAC — NOT_STARTED — 광고비 입력 필드가 어디에도 없다"*
> 라고 적었다. **틀렸다.** `advertisements.cost_krw` 컬럼이 존재하고(E2E 에서 300,000 입력 성공),
> `adAdvertisementService.ts` 가 생성·수정 시 쓰며, `adMetrics.ts` 가 CAC(광고비/가입자)와
> CPA(광고비/첫상담자)를 **서로 다른 지표로** 계산하고, `/admin/ads/performance` 가 KPI 카드와
> 열로 표시한다. `cost_krw` 가 null 이면 **`—`** 로 나오고 **절대 0원으로 조작하지 않는다.**
> 이전 판정은 스키마 미적용 상태에서 화면만 보고 내린 오판이었다.

> **D1/D7/D30 정정.** 이전 판은 "코호트 계산 경로 없음"이라고 했으나, `admin_ad_performance` 가
> `signup_at + N일` 이후의 성공 상담 존재 여부로 **광고별 리텐션을 읽기 시점에 계산**한다.
> 저장된 이벤트가 아니라 파생 지표라 이벤트 테이블만 봐서는 보이지 않았다.

### 3-F 남은 진짜 공백 2가지

| # | 공백 | 왜 |
|---|---|---|
| 1 | **네이티브 유입 — 코드 완료 / 오너 설정 대기** | 2026-09-04: `AcquisitionBridge` effect(1b) 가 `getInitialURL()` + `addEventListener(url)` 로 딥링크를 받는다. `.well-known` 파일 2개 + `vercel.json` Content-Type 헤더도 준비됐다. **남은 것은 오너뿐** — Team ID · SHA256 지문 · `app.json` diff · EAS 재빌드(§8 B3b). 그 전까지는 폰에서 링크가 브라우저로 열린다. **설치 유입(A3)은 여전히 별개 문제** |
| ~~2~~ | ~~표준 `utm_*` 미지원~~ | **해소 (2026-09-04, B1)**. B2(utm 5종 1급 컬럼)는 의도적 보류 |

### 3-G `event_campaigns` / `event_claims`

**Acquisition 과 무관하다.** 이름이 비슷해 혼동하기 쉬운데 전혀 다른 것이다:
`20260832000000_duk_economy_runtime.sql` 의 **덕 지급 이벤트**(가입 축하 덕 살포 등)용이고,
`reward_amount`·`per_user_limit`·`is_active(기본 false)` 컬럼을 가진다. 읽는 코드도 claim RPC 도 없어
§9.7 의 죽은 테이블 판정 그대로다. **광고 캠페인은 `advertisements` 쪽이다.**

---

## 축 4 — 결제 (6항목)

| # | 항목 | 판정 | 없는 것 |
|---|---|---|---|
| 4.1 | 덕 원장 3버킷 | **DONE** (staging 2026-09-06) | ~~두 버킷에 걸친 가격이 커밋되지 않는다(H7)~~ → **해소**: 유니크 키에 `bucket` 추가(mig `20260908000000`). 상품 3 × 버킷 조합 6 전수 **102/102**, 두 버킷 Edge 실패 경로 **10/10**, 멱등성 버킷 단위 유지 — 전부 **LLM 0콜**. **남은 것**: production 반영(A1 묶음) · PLUS(V1.1) 가 들어오면 버킷 3개 조합은 **미측정**(`docs/PAID_PATH_MATRIX.md` §3) |
| 4.2 | 덕 구매 3티어 | **PARTIAL** | 카탈로그·원장·멱등성 완비. **없는 것 3가지**: ① `verify-purchase` Edge 의 검증기 본체(`VERIFIER_NOT_IMPLEMENTED`) ② `react-native-iap` 미설치 + 호출부 0건 ③ `product_catalog` 행 0개 — 플레이스홀더는 코드가 아니라 `scripts/staging/product_catalog_seed.TEMPLATE.sql` 에 6개(플랫폼×3). 작업 순서는 `PROJECT_STATE.md` §7.17 |
| 4.3 | IAP 영수증 검증 | **PARTIAL** | `verify-purchase` Edge + Apple/Google 웹훅 존재. **클라이언트 구매 호출부 없음**(`createReactNativeIapAdapter` 미호출) |
| 4.4 | 환불 | **PARTIAL** | reason·상태머신·`duk_debt` 오프셋 있음. **실행 경로가 IAP 미완으로 닫힘** |
| 4.5 | 구독(PLUS) | **NOT_STARTED — V1.1** | 오너 결정 2026-09-02. 자산(`plus_entitlements` 등)은 남겨 둠 |
| 4.6 | 가격 정책 | **DONE** | `economy_policy` · 3티어 단가 §6.7 |

---

## 축 5 — 알림 (7항목)

| # | 항목 | 판정 | 없는 것 |
|---|---|---|---|
| 5.1 | 푸시 등록 | **PARTIAL** | 오케스트레이션 완비. `expoTokenAcquirer` fail-closed — **FCM/APNs 자격증명 + 빌드 필요** |
| 5.2 | 알림센터·벨 | **DONE** | `notifications.tsx` |
| 5.3 | 수신 동의 | **DONE** | `notification-settings.tsx` · `sync_marketing_consent` 트리거 |
| 5.4 | 이메일 발송 | **PARTIAL** | `run-email-campaigns` + Noop provider. **실제 provider 미설정** |
| 5.5 | 생일 알림 | **FUNCTIONAL** | mig `20260845000000_birthday_reward_runtime` |
| 5.6 | 월초 알림 | **FUNCTIONAL** | `run-scheduled-notifications` + `retention_scheduler` |
| 5.7 | **변곡점 알림** | **NOT_STARTED** | 대운/세운 전환점 감지 후 알리는 경로 없음 |

---

## 축 6 — 콘텐츠 / 유명인 (18항목)

### 6-A 유명인 사주 — 상세 판정

`src/features/famous/types.ts` 기준. **설계 품질은 높다.**

| # | 항목 | 판정 | 근거 |
|---|---|---|---|
| 6.1 | 관리자 등록 화면 | **DONE** (staging 2026-09-04) | `admin/famous/new.tsx` · `[id].tsx`. 스키마 승격으로 실제 등록·발행 동작 확인 |
| 6.2 | 이름 / 분류 / 직업 | **DONE** | `name` `category` `occupation` |
| 6.3 | 출생정보 | **DONE** | `birthInfo: BirthInfoDraft` — **앱의 정규 타입 그대로 재사용** |
| 6.4 | 출생시간 정확도 | **DONE** | `BirthInfoDraft.birthTimeAccuracy` = exact/approximate/unknown. **개인 상담과 동일 규칙** |
| 6.5 | **엔진 재사용 / 변형 없음** | **DONE** | 타입 헤더: *"ENGINE FIREWALL: this module NEVER calculates Four Pillars / lunar / solar terms / Daewoon / five elements"*. 계산은 스냅샷으로만 참조. **별도 엔진·변형 규칙 없음 — 결함 없음** |
| 6.6 | 유명인 전용 단순화 UX | **DONE** (2026-09-04) | `famous/[slug].tsx` + 공개 RPC + **렌더 테스트 14건** — 명식 표(320/360/393/480dp 넘침 0) · 다크(라이트 표면 0) · 스크린리더(시주 부재를 이름으로 말한다) · 고지 2회 배치 · ⚠ 대운 0회. `famousDetail.render.test.tsx` · `famousDetailDark.render.test.tsx` |
| 6.7 | 해석 결과 미리보기 | **DONE** (2026-09-04) | `FamousBodyPanel` 이 [명식 계산 + 본문 생성] / [명식만 다시 계산] 두 버튼과 함께 **명식 표와 본문 초안을 그 자리에서 보여 준다**. 계산 상태·거절 사유·풀이 없는 용어·토큰 수까지 함께. ⚠ 초안은 [본문에 적용] 을 눌러야 소개란에 들어간다 — 재생성이 운영자의 손질을 덮어쓰지 않는다 |
| 6.8 | 운영자 수정 콘텐츠 | **DONE** | `shortDescription` `bio` `seoTitle` `seoDescription` |
| 6.9 | **엔진 결과 ↔ 사람 수정 분리** | **DONE** | 엔진 = `famous_snapshots`(immutable, `birthFingerprint`/`engineVersion`/`ruleSetVersion`), 사람 = `famous_profiles` 의 텍스트 필드. **구조적으로 분리** |
| 6.10 | 공개/비공개 | **DONE** | `status`(draft/published/archived) + `isPublic` + `indexPolicy`(index/noindex) |
| 6.11 | 고유 상세 라우트 | **DONE** | `app/famous/[slug].tsx`. ⚠ **2026-09-08** — 정적 export 에서 **인물별 HTML** 이 생성되도록 `generateStaticParams` + 빌드 타임 데이터를 추가했다. 그 전에는 동적 라우트 전체가 `[slug].html` 한 장으로 뭉개져 검색에 안 잡혔다 |
| 6.12 | 중복 생성 방지 | **DONE** (2026-09-04) | 이름 정규화 + 생년월일로 확신도 3단계, **경고하되 차단하지 않는다**(동명이인이 실재하므로). 관리자 편집기에 실시간 경고. staging 기존 중복 0건, E2E 12/12 (`PROJECT_STATE.md` §7.16-C) |
| 6.13 | 출처·신뢰도 | **DONE** | `birthSource`(confirmed/reported/estimated/unknown) + `birthSourceNote`. **설계가 정직함** |
| 6.14 | 자동 생성 → 게시 | **DONE** (2026-09-04) | `famous-suggest` Edge + `FamousSuggestion`(`basis: fact/interpretation/unknown` 으로 **날조 방지**) → 초안 → 게시. 파이프라인 존재 | ⚠ **2026-09-06 실태 조사**: LLM 이 만드는 것은 **한 줄 소개 · 3~5문장 소개 · SEO 제목/설명 · slug · 주제 아이디어**뿐이다. **본문(사주 해설)은 생성하지 않고, 프롬프트가 사주 계산을 명시적으로 금지**한다. 해석엔진도 연결돼 있지 않다(`famous_snapshots` insert 코드 0줄 · staging 0행). `docs/FAMOUS_SEO_SURVEY.md` §1-2·§1-3. ✅ **2026-09-04 해소** — `famous-compose` Edge 가 프로즌 엔진을 돌려 스냅샷을 저장하고(S1) 그 스냅샷만 근거로 **본문 5섹션**을 만든다(S3/S4). 금지 5종 + 반복 문두 + **근거 표기·자료 인용 누수·명식 모순**(v2) + **관계 대조·생극 방향·문장 결함**(v3) + **투간·통근·기둥·수치 대조·자기모순**(v4)을 **서버에서** 검사해 위반한 글은 초안으로도 내보내지 않는다. 세미콜론은 결정론적 clamp. staging 실측 3건 기계 위반 0 · 인물 1명 ≈ **7,123 토큰** |

> **⚠ 지시서가 우려한 "유명인 때문에 개인 상담 엔진이 변형된 곳" — 없다.**
> 오히려 반대로, 모듈 헤더가 명시적 방화벽을 선언하고 출생정보 타입까지 앱 정규 타입을 그대로 쓴다.

### 6-B 일반 콘텐츠

| # | 항목 | 판정 | 없는 것 |
|---|---|---|---|
| 6.15 | 콘텐츠 CMS | **FUNCTIONAL** | `admin/content/*` · `content/[slug].tsx`. ⚠ **2026-09-06 정정** — 이전 판은 **`content_posts` 미적용**이라 적었으나 **그 테이블 이름 자체가 틀렸다.** §0 이 이미 정정한 대로 실제 이름은 **`content_items`** 이고 staging 조회 결과 **200 있음**(mig `20260904000100`). ⛔ 는 문서 지연이었다 | 공개 페이지가 정적 HTML 에 내용을 싣지 못한다 — 유명인과 **같은 원인**(`docs/FAMOUS_SEO_SURVEY.md` §2) |
| 6.16 | 발행 스케줄러 | **FUNCTIONAL** | `admin/publications`. ⚠ **2026-09-06 정정** — `content_publications` **200 있음**, `admin_list_scheduled_publications` 존재(빈 인자 호출이 400=인자 불일치이지 404 아님). ⛔ 는 문서 지연이었다 |
| 6.17 | 인기 질문 | **DONE** | mig `20260824000000` 적용됨 |
| 6.18 | 이미지/영상 생성 | **PARTIAL** | `media-generate`/`video-generate` Edge. **`GEMINI_API_KEY` 미설정** |

---

## 축 7 — 인증 (7항목)

| # | 항목 | 판정 | 없는 것 |
|---|---|---|---|
| 7.1 | 카카오 로그인 | **PARTIAL** | 코드 완료. **Supabase provider 설정 미확인**. **렌더 검증 완료 (2026-09-06)** — 로그인 14건: 소셜 4종 노출·순서 규칙·**실패 사유 4종의 한국어 매핑이 화면까지 도달**·취소 무음·원시 오류 미노출 (§7.27) |
| 7.2 | 구글 로그인 | **PARTIAL** | 〃 |
| 7.3 | 네이버 로그인 | **PARTIAL** | **production 은 2026-08-12 E2E 완료.** staging 은 2026-09-04 Edge 배포됐고 시크릿 2종 미설정 → `500 SERVER_NOT_CONFIGURED`(실측) |
| 7.4 | **애플 로그인** | **PARTIAL** (코드 완료 / 외부 설정 대기) | 2026-09-02 구현. iOS 네이티브 시트 + 웹 provider 이중 경로 |
| 7.5 | 약관 동의 | **DONE** | `onboarding/terms.tsx` → `profiles.terms_version` → 웰컴 10덕 트리거 |
| 7.6 | **계정 탈퇴** | **DONE** (2026-09-03) | MY → 계정 탈퇴 → `/account-delete` (타이핑 확인 `탈퇴`) → Edge `account-delete`(JWT 재검증, 토큰의 user id만 사용) → `purge_account_data` RPC(스냅샷·홀드 해제·FK 없는 3테이블 정리) → `auth.admin.deleteUser` 로 36테이블 CASCADE. staging e2e **15/15 PASS**. 애플 grant revoke 는 iOS 네이티브 경로에서만 시도하고 실패해도 탈퇴를 막지 않음 **렌더 검증 완료 (2026-09-06)** — 10건. 만류 문구 0·0건 항목 미표시·IME 뒤공백 허용. |
| 7.7 | 계정 병합 | **DONE** (의도적 미지원) | `ACCOUNT_CONFLICT` 로 fail-closed. **자동 병합 금지가 설계**이고 그대로 동작한다 |

---

## 축 8 — 데이터 / 프라이버시 (5항목)

| # | 항목 | 판정 | 없는 것 |
|---|---|---|---|
| 8.1 | RLS 전면 적용 | **DONE** | 전 테이블 owner-scoped |
| 8.2 | PII 최소 수집 | **DONE** | ad-track 이 IP·UA 미보관, 로그에 토큰·이메일 금지 |
| 8.3 | 개인정보 처리방침 | **DONE** | **렌더 검증 완료 (2026-09-06)** — 약관 동의 화면 13건(필수/선택 구분·필수 미동의 차단·**[보기] 가 여는 문서가 실제로 그려짐**·저장 실패 시 선택 유지) + 문서 본문 렌더 (§7.27). `privacy-policy.tsx` · **법률 검토는 미완**(오너 액션) |
| 8.4 | **보관기간 정책** | **PARTIAL** | 방침 문서에 기술. **자동 삭제·만료 잡 없음** |
| 8.5 | **삭제 요청 처리** | **PARTIAL** (2026-09-03) | 본인 셀프 삭제는 7.6 으로 열렸다. **없는 것: 본인이 아닌 경로** — 고객센터 대행 삭제·열람/정정 요청 접수 창구(2-6 CS 축이 비어 있음). `account_deletions.requested_via` 에 `support`/`admin` 값이 예약돼 있으나 호출부 없음 |

---

## 축 9 — 출시 (6항목)

| # | 항목 | 판정 | 없는 것 |
|---|---|---|---|
| 9.1 | 화면 구현 | **DONE** | 소비자·공통 40 + 관리자 25 = 65 |
| 9.2 | 이용약관 / 개인정보 / 환불 / 미성년 / 덕 / AI고지 | **DONE** | 6종 화면 존재 |
| 9.3 | 스토어 자산 | **PARTIAL** | EAS projectId 있음. **아이콘·스플래시가 기본 Expo 에셋** |
| 9.4 | 연령등급 | **NOT_STARTED** | 등급 산정·표기 근거 없음 |
| 9.5 | 릴리스 게이트 | **DONE** | `RELEASE_GATES.md` G1~G9. **2026-09-04: production 스키마 승격 계획 완료**(미실행) — `PRODUCTION_SCHEMA_PROMOTION_PLAN.md` 8단계 + 자동 추출 사전점검 SQL. `migration repair` 불채택(근거가 구두 보고뿐) → 57개 전량 push, 멱등성 실측 확인. ⚠ 실행은 오너(훅이 production 접근을 거부) |
| 9.6 | 품질 회귀 감시 | **DONE** | 골든 미니팩 (2026-09-02) |

---

## 축별 항목 수 — **기계 집계** (2026-09-04)

```bash
node scripts/checklist-tally.mjs          # 사람이 읽는 표
node scripts/checklist-tally.mjs --check  # 아래 표와 대조. 다르면 exit 1
```

| 축 | 항목 | DONE | FUNCTIONAL | PARTIAL | NOT_STARTED |
|---|---:|---:|---:|---:|---:|
| 1 소비자 | 18 | 16 | 1 | 0 | 1 |
| 2 관리자 | 8 | 6 | 1 | 1 | 0 |
| 3 Growth | 10 | 7 | 0 | 1 | 2 |
| 4 결제 | 6 | 2 | 0 | 3 | 1 |
| 5 알림 | 7 | 2 | 2 | 2 | 1 |
| 6 콘텐츠/유명인 | 18 | 15 | 2 | 1 | 0 |
| 7 인증 | 7 | 3 | 0 | 4 | 0 |
| 8 데이터 | 5 | 3 | 0 | 2 | 0 |
| 9 출시 | 6 | 4 | 0 | 1 | 1 |
| **합계** | **85** | **58** | **6** | **15** | **6** |

> **⚠ 총 항목이 92 → 84 로 바뀐 이유.** 92 는 손으로 센 값이고 **틀렸다.** 축 3 의 퍼널·지표
> 분석표(28행)를 항목으로 세고, 축 6 의 필드 판정 행은 빼먹었다. 위 숫자는
> `scripts/checklist-tally.mjs` 가 문서에서 직접 센 것이고, 스크립트에는 **분석 행을 세지
> 않는지 확인하는 자기 검증이 들어 있다**(실제로 개발 중 헤더 행 오집계를 잡아냈다).
>
> 같은 실행에서 **구조 문제 15건**도 나와 함께 고쳤다 — 축 6·7 의 판정 13개가 표준 4값이 아닌
> 임의 어휘(`있음` `✅ 확인` `불명` `부분` `의도적 미지원`)였고, 축 3·6 제목의 항목 수가
> 실제와 달랐다. 지금은 `--check` 가 통과한다.

---

## V1 필수인데 미완 — 규모순

| 순위 | 항목 | 축 | 규모 | 왜 V1 필수인가 |
|---|---|---|---|---|
| 1 | **`docs/*.sql` 스키마 적용/승격** | §0 | 小(적용) / 中(승격) | 유명인·광고·콘텐츠 3개 기능이 통째로 막혀 있다. **가장 싸고 효과가 큰 한 방** |
| ~~2~~ | ~~**계정 탈퇴**~~ | 7.6 | — | **완료 (2026-09-03)** — staging e2e 15/15 |
| 3 | IAP 클라이언트 구매 경로 | 4.3 | 大 | 매출 0 |
| 4 | 로그인 4종 외부 설정 | 7.1~7.4 | 小(오너) | 네이버는 지금 500 |
| 5 | CS 채널·화면 | 2-6 | 中 | 출시 후 문의를 받을 곳이 없다 |
| 6 | 푸시·이메일 개통 | 5.1/5.4 | 小(오너) | 리텐션 전부가 여기 걸림 |
| 7 | 스토어 자산 교체 | 9.3 | 小 | 기본 Expo 아이콘으로 심사 불가 |
| 8 | 삭제 요청 처리 (본인 외 경로) | 8.5 | 小 | 셀프 삭제는 완료. 남은 것은 CS 창구(2-6) 의존 |
| 9 | 연령등급 산정 | 9.4 | 小 | 스토어 등록 필수 입력 |
| 10 | UTM 파라미터 지원 | 3.8 | 中 | 외부 광고 집행 시 추적 불가. **광고를 안 돌리면 V1.1 가능** |
| 11 | D1/D7/D30 리텐션 · CAC | 3-E | 中 | 〃 |

---

## 이전 인벤토리에서 누락·축소됐던 항목

| 항목 | 이전 기록 | 실제 |
|---|---|---|
| **유명인 사주** | **목록에 없음** | 소비자 2화면 + 관리자 3화면 + 서비스 2개 + AI 제안 Edge + 14개 필드 설계. **⛔ 테이블 미적용** |
| **Acquisition/UTM** | "FUNCTIONAL, 대시보드 소비 미확인" 한 줄 | 관리자 4화면 + Edge + 3테이블 + 4트리거 + 가입 전 attribution 전 체인. **⛔ 테이블 미적용**, UTM 파라미터는 미지원 |
| **콘텐츠 CMS** | 관리자 화면 수에만 포함 | 3화면 + 소비자 2화면 + 발행 스케줄러. **⛔ 테이블 미적용** |
| **CS** | 언급 없음 | **축 자체가 비어 있음** |
| **계정 탈퇴** | 언급 없음 | **구현 완료 (2026-09-03)** — 이 표의 최초 지적이 해소된 첫 항목 |
| **연간 운세** | 언급 없음 | 없음(Premium 이 대체하는지 판단 필요) |
| **변곡점 알림** | 언급 없음 | 없음 |
| **연령등급** | 언급 없음 | 없음 |
| **스키마 이원화** | 언급 없음 | `docs/*.sql` 24개가 별도 적용 경로 |
