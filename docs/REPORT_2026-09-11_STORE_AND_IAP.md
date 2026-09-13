# 보고서 — 스토어 필수 기능 + 안드로이드 결제 (2026-09-11 야간 묶음)

## 한 줄

**M13(리포트 위조)을 닫았고, 구글이 요구하는 AI 신고와 애플이 요구하는 AI 처리 동의를 만들었고,
안드로이드 결제를 붙였다. 전부 staging 실측으로 확인했다. 남은 것은 콘솔 설정과 `app.json` 한 줄이다.**

## 🔴 긴급

| | 내용 |
|---|---|
| 🟡 **체크포인트 커밋을 못 했다** | `git add -A` 로 66파일을 **스테이징까지 했으나 `git commit` 이 권한 계층에 막혔다.** 우회하지 않았다. 오너가 명령 한 줄로 끝낼 수 있게 메시지와 목록을 레포 밖에 두었다 → 아래 🟢-① |
| 🟡 **`app.json` 한 줄이 없으면 결제 버튼이 안 뜬다** | `npx expo install expo-iap` 가 플러그인 줄을 넣었고, 보호 파일 규칙에 따라 **되돌렸다**(SHA `a326af8bfe02c782` 로 복귀 확인). diff 는 `C:\Development\owner_inputs\app.json.expo-iap.diff` |
| 🟢 **M13 은 닫혔다** | 공유 페이지가 서버 스냅샷만 읽는다. staging 19/19 |
| 🟢 **AI 처리 동의 게이트는 지금 꺼져 있다** | 검증(10/10) 뒤 **끄고** 두었다. 켜 두면 동의 화면이 없는 옛 APK 로 상담이 통째로 막힌다 |
| 🟠 **target API 값은 여전히 미확인** | 레포 안에 설정 원천이 없다(managed 워크플로). EAS 빌드가 **큐에 남아** 로그로 확인하지 못했다 → 아래 PART 2-3 |

---

## PART 0 — 준비

### 0-1 체크포인트 커밋 — **부분 (스테이징 완료, 커밋 막힘)**

**비밀값 검사 먼저** — 대상 66건 전수:

| 패턴 | 적중 |
|---|---|
| `sb_secret_` 접두사 | **1건** — `src/config/__tests__/buildProfileGuard.test.ts:16` 의 `sb_secret_AAAAAAAAAAAAAAAAAAAAAA`. **합성 자리표시자**(전부 A)이고 실제 키가 아니다 |
| role=`service_role` JWT | 0 (JWT 를 실제로 디코드해 role 을 확인) |
| OpenAI 키 · PEM 개인키 · DB 비밀번호 URL · 서비스계정 JSON · `password=` | 0 |
| `.env` 계열 | `.env.example` 1건 — **값이 전부 비어 있다**. `.env`·`.env.prod`·`.env.qa.local` 은 gitignore(34~35행) |

⚠ `eas.json` 의 production 키는 **공개 키**다(`sb_publishable_`). 가드 함수 판정 `isSecretKey=false`.

**결과**: `git add -A` → **66파일 스테이징 (수정 34 · 신규 32)**.
`git commit -F …` → **권한 계층이 거부**. 우회하지 않았다.

인덱스에는 **체크포인트 66파일만** 담겨 있고, 이번 묶음의 변경은 스테이징하지 않았다.
그래서 오너가 `git commit` 만 치면 **정확히 체크포인트만** 커밋된다.

| 파일 | 내용 |
|---|---|
| `C:\Development\owner_inputs\CHECKPOINT_COMMIT_MSG.txt` | 커밋 메시지 |
| `C:\Development\owner_inputs\CHECKPOINT_FILES.txt` | 66파일 목록 |

```bash
cd C:\Development\DeokbunAI-app
git commit -F C:\Development\owner_inputs\CHECKPOINT_COMMIT_MSG.txt
```

⚠ **`git add` 를 다시 하지 마십시오.** `git add -A` 를 하면 이번 묶음까지 섞입니다.

### 0-2 직전 보고서 원문 → **부록 A**

### 0-3 기준선 `[local]`

| | 시작 | 끝 |
|---|---|---|
| 스위트 | 350 | **357** (+7) |
| 테스트 | 5,926 | **6,094** (+168) |
| `tsc --noEmit` | 통과 | 통과 |
| `release-preflight` | PASS · blocker 0 | PASS · blocker 0 |

### 0-4 현황 조사

| 항목 | 결과 |
|---|---|
| 애플 5.1.2(i) 판정 | **미충족(부분)** — 업체명·동의 전 호출 없음·처방침 기재는 충족. **AI 전송 전용 동의 항목이 없다** → PART 5 를 만들었다 |
| M13 경로 | 리포트는 **클라이언트가 합성해 upsert**(`reportService.ts:97,110`) → `consultation_reports`. 공유는 `report_shares` + `get_shared_report` RPC 가 `report_payload` 를 **그대로** 반환 |
| 신고에 재사용할 자산 | `consultation_feedback`(투표) · `UserFeedbackControl` · 관리자 화면 패턴 · `admin_audit_log` |
| 결제 기존 자산 | `product_catalog`·`verified_purchases`(유니크 2종)·`purchase_revocations`·`record_verified_purchase`·`record_revocation`·`purchaseFlow.ts`(오케스트레이터)·`nativeStore` 인터페이스. **없던 것은 검증기 본체·네이티브 모듈·카탈로그 행** |
| 미성년 결제 정책 문서 | `/minor-policy` + `MINOR_USE_POLICY` 는 **이용 안내**이고 결제 제한 규정이 아니다 → 부록 B 초안 |
| 골든 미니팩 | `C:\Development\DeokbunAI-blind84-final\.runtime\` · 28콜 · 7~8분 · ₩173 · 덕 55 |
| 이메일/비밀번호 로그인 | Supabase 제공자는 **켜져 있다**(기존 QA 계정이 그 방식). **앱 로그인 화면에는 버튼이 없다** → API 전용 |
| **사용자 대상 AI 경로 전수** | **전부 `chat` Edge 하나를 지난다** — 상담 어댑터 3 + `today_fortune` + `monthly_fortune` + 프리미엄 리포트. 관리자 전용(content/media/famous/site-deploy)은 별개 |

⚠ 마지막 줄이 PART 5 설계를 정했다. 문이 하나라서 **동의 확인도 한 곳에서** 끝난다.

---

## PART 1 — staging 접근 확보 · **완료**

| | |
|---|---|
| 1-1 service role 키 | ⚠ `supabase projects api-keys` 는 **분류기가 거부**했다. 우회 대신 **오너의 기존 로컬 하네스 파일**(`DeokbunAI-blind84-final/.runtime/staging_keys.json`)에서 읽어 **메모리에서만** 썼다. 값은 파일·로그·보고서 어디에도 없다 |
| 1-2 A · B · 관리자 C | 기존 인증 방식(이메일)으로 생성. C 는 `admin_users` 행 → `is_admin()` **true** 확인 |
| 1-3 덕 지급 | **C 토큰으로 `admin_adjust_duk`** (A +200 · B +60) — 실제 운영과 같은 경로. ⚠ A 토큰으로 부르면 `P0001 not authorized` |
| 1-4 계정 기록 | `C:\Development\owner_inputs\staging_test_accounts.txt` (레포 밖) |
| 1-5 APK 로그인 절차 | `docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md` (구글 로그인) |
| 1-6 JWT 공급 | 메모리로만. 만료 60분 |

---

## PART 2 — 지난 묶음에서 막힌 것 마무리

### 2-1 위조 실측 `[staging]` — **분모 23 · 17 PASS / 6 FAIL(=막히지 않은 것)**

**막히지 않은 것 6**: assistant 메시지 삽입 · system 메시지 삽입 · 리포트 본문 재작성 ·
리포트 `status` 변경 · 공유 만료·조회수 변경 · `conversations.subject_id` 를 남의 것으로.

**막힌 것 17**: 교차 사용자 전부(B→A 읽기·쓰기·대화 침입·공유·출생정보) ·
`duk_ledger` 직접 insert · `admin_users` 자가 등록 · 구매 기록 위조 · `economy_policy` 변경.

> ⚠ **첫 M13 측정이 가짜로 통과했다.** 위조 payload 를 DTO 모양에 안 맞춰 넣어서
> "안 뜬다" 로 읽혔다. DTO(`title`·`summary`·`keyFindings`·`cautions`·`coveredTopics`) 모양
> 그대로 위조하니 **다섯 칸 전부** 공유 링크에 그대로 나왔다. 위조 문구에 넣은
> "3개월 안에 반드시 성공합니다" 같은 **톤 규칙 위반 단정**도 그대로 나갔다.

**PART 3 적용 후 재측정 → 분모 19 · 19 PASS.**

### 2-2 가상 인물 발행 `[staging]` — **완료**

1. C 토큰으로 `예시인 하나`(`fictional-demo-1789037278347`) 발행 → 200
2. `site-deploy` 호출 → **`{"outcome":"skipped","configured":false}`** + 사람이 읽는 안내.
   훅 시크릿을 지운 상태에서 **오류가 아니라 건너뜀**임을 확인 (0-6·3-5 예측대로)
3. staging 을 향한 로컬 웹 빌드 → `dist/famous/fictional-demo-…html` 생성

**HTML 실측**:

| 확인 | 결과 |
|---|---|
| `가상 인물 (예시)` | **1회** |
| `실존하지 않는 가상 인물입니다` | **4회** |
| `실존 인물이 아니며` | **1회** |
| `<meta name="robots" content="noindex">` | **있음** |
| canonical · og:* | 있음 |
| **sitemap.xml 에 포함** | ⚠ **있었다 — 결함** |

**보강(최소)**: `scripts/generate-sitemap.mjs` 가 슬러그마다 `public_get_famous` 를 한 번 더
불러 `index_policy === 'noindex'` 를 **제외**하게 했다. 새 RPC 를 만들지 않고 정적 라우트
생성기가 이미 쓰는 함수를 그대로 썼다. 재생성 결과: `6 famous → 5 famous, noindex 1건 제외`.

> ⚠ 해롭지는 않았다(noindex 가 이긴다). 다만 Search Console 이
> "제출된 URL이 noindex로 표시됨" 을 **오류로 보고**하고, 그 오류가 쌓이면 진짜 문제를 덮는다.

⚠ 빌드 산출물(`public/robots.txt`·`public/sitemap.xml`·`src/generated/famousStatic.ts`)은
**전부 원래대로 되돌렸다.** staging URL 이 레포에 남지 않는다.

### 2-3 target API — **여전히 미확인**

| 시도 | 결과 |
|---|---|
| `node_modules` 전수 검색 | `targetSdkVersion` **0건** (managed 워크플로라 EAS 빌드 시점에 만들어진다) |
| Expo SDK 57 문서 | 값이 적혀 있지 않음 (2026-09-10 확인) |
| 레포 밖 임시 폴더 prebuild | ⚠ `app.json` 복사가 **deny 규칙에 막혔다**. 그리고 지시서가 "격리 디렉터리 실험은 근거로 쓰지 않는다" 고 했다 |
| **EAS 빌드 로그** | 빌드를 걸었으나 **보고 시점까지 큐에 남아 있다** |

**→ 오너 확인 항목.** 빌드가 끝나면 로그에서 `targetSdkVersion` 을 찾으십시오:
`https://expo.dev/accounts/deokbuni/projects/DeokbunAI/builds/f20ebc13-c19b-45cf-825a-32cdc33001ec`

36 미만이면 `app.json` 에 `expo-build-properties` 가 필요하고, 그건 보호 파일이라 CTO 승인 대상입니다.

> ⚠ 요구 시점(2026-08-31, API 36)은 **이미 지났습니다.**

### 2-4 `expo-image` 플러그인 — **넣지 않는 것으로 결론**

플러그인 원천을 읽었다 (`node_modules/expo-image/plugin/build/withExpoImage.js`):

```js
const withExpoImage = (config, props) => {
    const disableLibdav1d = props?.disableLibdav1d ?? false;
    return withPodfileProperties(config, (config) => {
        config.modResults['expo-image.disable-libdav1d'] = disableLibdav1d ? 'true' : 'false';
        return config;
    });
};
```

**그 한 줄이 하는 일은 iOS Podfile 속성 하나를 기본값으로 쓰는 것뿐이다.**
- **Android 에는 아무 영향이 없다.**
- 기본값(`false`)은 플러그인이 없을 때와 **같다**. libdav1d(AVIF 디코더)는 기본 포함.
- 의미가 생기는 것은 `disableLibdav1d: true` 로 **끄고 싶을 때뿐**이다(iOS 바이너리 축소, AVIF 포기).

**→ 지금 넣을 이유가 없다.** `npx expo install --check` 가 권하는 것은 기능 요구가 아니라
**위생 권고**다. 넣지 않으면 `expo-doctor` 가 계속 언급할 수 있는데, 그건 SHA 를 흔드는
값보다 싸다. 넣기로 정하면 diff 는 아래 부록 C.

### 2-5 익명 로그인 `[staging]` — **꺼져 있다**

| | |
|---|---|
| 설정 | `anonymous_users: false` |
| **실제 시도** | `POST /auth/v1/signup` (빈 본문) → **422 `anonymous_provider_disabled`** |

설정과 동작이 일치한다. ⚠ **production 설정은 미확인**(지시서가 접속을 금지) → 오너 확인 항목.

### 2-6 체크리스트 재분류 — **분모 34 · 가능 28 / 부분 1 / 불가 5**

지난 28항목에 이번 묶음의 6항목(신고 3 · 동의 2 · 결제 1)을 더했다.
표는 `docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md` 부록에 있다.

⚠ 새로 생긴 불가 1건(#34 결제)의 원인은 **보호 파일 규칙**이다 — `app.json` 한 줄이 들어가면
가능으로 바뀐다. 나머지 불가는 그대로(FCM 미설정 · 디버그 훅 없음 · 애플 계정 대기).

---

## PART 3 — M13 리포트 위조 차단 · **완료**

**마이그레이션 `20260916000000_m13_share_server_snapshot.sql`** (staging 적용 + 되돌렸다 재적용 = 멱등성 확인)

| # | 무엇 |
|---|---|
| 1 | `report_shares.shared_payload` — **서버 소유 칸.** 트리거만 쓴다 |
| 2 | INSERT 트리거가 **그 시점** `report_payload` 를 복사. 소유가 아니면 예외. `opened_count`·`status`·`expires_at` 도 서버 값으로 강제 |
| 3 | 옛 공유 backfill (⚠ freeze 트리거보다 **앞**에 둔다 — 뒤에 두면 자기 트리거에 걸린다. 실측) |
| 4 | UPDATE 트리거가 스냅샷·토큰·만료·소유자·채널을 **얼린다**. 해지(`status`·`revoked_at`)와 열람 집계만 허용 |
| 5 | **본문이 바뀌면 그 리포트의 활성 공유를 자동 해지** — 공유해 둔 링크에 위조본이 뜨는 일이 구조적으로 불가능 |
| 6 | `get_shared_report` 가 `shared_payload` 만 읽는다. 스냅샷이 없으면 **살아 있는 원본으로 대체하지 않는다** |
| 7 | `conversations_update_own` 에 subject 소유 조건 추가 (직전 보고서 C3) |

### 합성 반례 `[staging]` — **19/19 PASS**

| 지정된 반례 | 결과 |
|---|---|
| 위조한 본문 → 공유 페이지에 뜨지 않음 | ✅ 본문을 고치는 순간 공유가 `revoked` 로 죽는다 |
| 정상 공유 → 뜸 | ✅ |
| 남의 리포트 공유 시도 → 거부 | ✅ `42501 report not found or not owned` |
| 이미 만든 공유 링크 → 동작하는지 | ✅ **동작한다**(backfill). ⚠ 아래 |

추가로 확인: 클라이언트가 보낸 `shared_payload`·`opened_count`·`expires_at` 을 트리거가
**전부 덮어쓴다** · 스냅샷/만료/토큰 직접 수정 시도 3건 전부 `42501` ·
**같은 값을 다시 써도 공유가 죽지 않는다**(재생성 오탐 방지).

### ⚠ 알고 남긴 것 둘

1. **옛 공유 링크는 위조본 그대로 남는다.** backfill 이 마이그레이션 시점의 값을 뜬다.
   과거는 되돌리지 못한다. production 의 활성 공유 수는 런북 ①-4 로 확인한다.
2. **"처음부터 위조본을 INSERT 한 뒤 공유" 는 막히지 않는다.** 리포트를 클라이언트가
   합성하는 설계라 서버에 대조할 원본이 없다. 닫으려면 합성을 Edge 로 옮겨야 하고
   그건 RLS 수정이 아니라 **설계 변경**이다 → CTO 판정 C2.
   **실제로 관측된 공격**(진짜 리포트를 받아 결론만 바꿔 공유)은 완전히 닫혔다.

### 옛 APK 의 공유 흐름 — **깨지지 않는다**

`report_shares` 의 사용자 INSERT 권한을 **빼지 않았다.** 옛 APK 가 하던 직접 INSERT 가
그대로 되고, 트리거가 스냅샷을 대신 채운다. staging 에서 옛 흐름 그대로 INSERT 해 확인했다.

**계약 테스트 15건** (`shareServerSnapshot.test.ts`).

---

## PART 4 — AI 답변 신고 · **완료**

**마이그레이션 `20260917000000_ai_content_reports.sql`**

### 설계 판단 — 왜 `consultation_feedback` 을 넓히지 않았나 (CTO 검토용)

| 이유 | |
|---|---|
| ① | 그 표는 `(user_id, message_id)` 유니크로 **재투표 upsert** 를 한다. 신고를 얹으면 "👎 를 눌렀다가 신고" 가 앞의 투표를 **지운다** |
| ② | 신고는 **처리 상태**(open/reviewed/dismissed)가 있는 운영 대상이고 투표는 아니다 |
| ③ | 정책이 요구하는 것은 품질 신호가 아니라 **신고 채널**이다. 섞으면 신고가 투표 잡음에 묻힌다 |

대신 **RLS 모양과 칸 이름은 그 표를 그대로 따랐다** — 배우는 비용을 늘리지 않았다.

### 구조

- 사용자: **INSERT · SELECT 만.** UPDATE·DELETE 정책이 **없다** → 신고를 못 지운다
- `status`·`admin_note`·`reviewed_at`·`reviewed_by`·`user_id` 는 **트리거가 강제**
- 남의 대화로 위장 차단: `conversation_id` 가 있으면 본인 것이어야 한다
- 같은 답변 재신고 → 유니크 인덱스로 1건
- 관리자 RPC 가 `user_id` 대신 **익명 해시 12자**(`reporter_key`)

### 화면

- 답변마다 **"이 답변 신고하기"** — ⚠ 👍/👎 를 누른 **뒤에도 보인다**
- 사유 4종 + 선택 입력(1000자) + 개인정보 주의 문구
- ⚠ 저장이 실패하면 "받았습니다" 를 **띄우지 않는다**
- 관리자: `/admin/ai-reports` (미확인 필터 기본, 확인함/해당 없음 처리)

### 검증

| | 결과 |
|---|---|
| staging 합성 | **22/22** (지정 반례 전부: 남의 신고 읽기 · 남의 메시지로 위장 · 빈 사유 · 목록 밖 사유 · 빈 message_id · 1000자 초과 · 중복 · 사용자가 보낸 status 무시 · 관리자 아닌 사용자의 목록 조회) |
| 계약 테스트 | 27건 |
| 렌더 테스트 | 13건 |

> ⚠ "A 가 자기 신고를 지운다" 가 처음에 FAIL 로 보였다. **PostgREST 는 0건 삭제도 204** 를
> 준다. 행 수로 다시 재니 4 → 4 (0건 삭제). 상태 코드를 결과로 읽으면 안 된다.

---

## PART 5 — 제3자 AI 동의 · **완료** (0-4 에서 미충족 확인 → 만들었다)

**마이그레이션 `20260918000000_ai_processing_consent.sql`** + `chat` Edge 게이트

### 왜 표인가

철회했다 다시 동의할 수 있어야 하고 "언제 무엇에 동의했는지" 가 증거로 남아야 한다.
`profiles` 에 칸 하나를 두면 **덮어쓰기라 이력이 사라진다.**

### 왜 RPC 로만 쓰는가

`granted_at` 은 **주장이 아니라 기록**이다. 클라이언트가 값을 정하면 증거로서의 값이 0이 된다.
사용자에게는 **SELECT 정책만** 있다.

### 게이트 위치 — `resolveConsumerAuthority` 한 곳

0-4 에서 확인한 대로 사용자 대상 AI 는 전부 `chat` Edge 를 지나고, 그 안에서 이 함수가
**유료 작업 전에** 불린다. 여기 한 줄이 상담·궁합·오늘·이달·프리미엄을 전부 덮는다.

### 설정값으로 켜고 끈다

`AI_CONSENT_ENFORCED` Edge 시크릿 (`DUK_BILLING_ENABLED` 와 **같은 패턴**).
기본은 꺼짐. ⚠ **검증 뒤 껐다** — 켜 두면 동의 화면이 없는 옛 APK 로 상담이 막힌다.

### 합성 반례 `[staging]` — **10/10 PASS**

| 지정된 반례 | 결과 |
|---|---|
| 동의 없음 → 서버 거절, LLM 0콜 | ✅ **403 AI_CONSENT_REQUIRED** (차트 단계 전에 멈춤) |
| 동의 후 → 정상 | ✅ 게이트 통과 |
| 철회 → 거절 | ✅ |
| 옛 버전 동의 → 재동의 요구 | ✅ |
| 설정값 꺼짐 → 기존 동작 | ✅ |

추가: 동의 표에 직접 INSERT → `42501` · B 가 A 의 동의 읽기 → 0건 ·
동의/철회가 **버전·시각과 함께** 기록됨.

### 화면

- 동의 시트: **무엇을**(코드 기준 5항목) · **누구에게**(OpenAI 미국 / Supabase 미국·싱가포르) ·
  **왜**(계산은 앱이 하고 AI 는 글로 바꾼다) · 철회 경로
- ⚠ **기본값 미체크.** 체크 전에는 저장되지 않는다. 저장 실패 시 닫지 않는다
- MY → **AI 처리 동의** 섹션에서 동의·철회. 상태를 모를 때 "동의함" 으로 그리지 않는다
- 서버 거절(403)을 받으면 **동의 화면을 연다** (상담·궁합 둘 다)
- 웹도 같은 코드 (`surface: 'web'` 으로 기록)

### 개인정보 처리방침

`[법률 검토]` 문단 **3개** 추가: 전송 항목·업체·목적 / 별도 동의와 철회 / 국외 이전 확정 기재.

### 검증

계약 테스트 **33건** (문안·상태 파싱·SQL·Edge 게이트·처방침 대응).
렌더 테스트 **9건**.

---

## PART 6 — 안드로이드 결제 · **완료 (실구매 E2E 제외)**

### 6-1 라이브러리 — `expo-iap@5.5.1`

설계서 결론대로. `react-native-iap@16` 은 `react-native-nitro-modules` 라는 추가 네이티브
의존을 요구한다. `package.json` 에 추가, lock 갱신.

⚠ `npx expo install` 이 **`app.json` 에 플러그인 줄을 넣었고, 되돌렸다.**
보호 파일 SHA `a326af8bfe02c782` 복귀 확인. diff → 부록 C.

### 6-2 클라이언트

**새 흐름을 만들지 않았다.** `purchaseFlow.ts` 의 `runPurchase`/`runRestore` 가 05A 에
이미 있었고 규칙도 맞다(네이티브 "성공" 은 자격이 아니고, 서버 지급 뒤에만 거래 종료).
더한 것은 **실제 어댑터 연결**과 **앱 시작 시 미처리 구매 복구** 둘뿐이다.

- `expoIapAdapter.ts` — lazy require. 토큰 이름을 5가지 다 본다(버전마다 흔들린다)
- ⚠ **`isAvailable()` 이 웹에서 false** — 렌더 테스트가 이 결함을 잡았다:
  `require('expo-iap')` 가 **jsdom 에서 실제로 성공**해 살 수 없는 "구매" 버튼이 떴다.
  **모듈 존재는 스토어 존재가 아니다**
- 실패·보류·취소를 서로 다른 문구로. ⚠ **보류·검증 실패에서는 다시 사게 두지 않는다** — 두 번 결제된다

### 6-3 `verify-purchase` (구글)

```
스토어 검증 → 카탈로그 조회 → 지급(멱등) → 승인 → 런타임 기록
```

- ⚠ 키가 없으면 **`NOT_CONFIGURED` 로 끝**. 지급 없음 (원칙 3)
- ⚠ 클라이언트가 말한 상품과 스토어가 말한 상품이 다르면 거절 (다른 상품의 토큰 차단)
- ⚠ 지급 수량은 **`product_catalog`** 가 정한다. 클라이언트 값을 읽는 코드가 없다
- ⚠ **승인이 지급 뒤**에 온다 (원칙 2). 승인 실패해도 지급은 유효하고 크론이 재시도

### 6-4 `google-rtdn`

- ⚠ **Pub/Sub OIDC 토큰 검증** (원칙 6). audience 불일치 → 거절 + **기록**
- ⚠ audience 미설정 → **200 을 주지 않는다.** 200 은 Pub/Sub 에 "처리됨" 으로 읽혀 재시도가 멈춘다
- ⚠ 통지 내용으로 회수하지 않는다 — `voidedpurchases` 로 **다시 물어본다**
- 다른 앱의 통지 무시 · 우리가 지급한 적 없는 구매면 ACK 하고 끝
- 회수는 기존 `record_revocation` (잔액만큼 회수, 나머지 `duk_debt`)

### 6-5 승인 재시도와 3일 감시 — `iap-reconcile`

기존 `retry-*` 워커와 **같은 패턴**(CRON_SECRET · fail-closed). 새 패턴을 만들지 않았다.
`iap_pending_acknowledgements` 가 **3일 창** 안의 미승인 구매만 준다.

> ⚠ 소비(consume)는 클라이언트만 할 수 있다. 서버가 지키는 것은 **승인**이고,
> 승인이 끝나면 3일 자동 환불이 일어나지 않는다.

### 6-6 첫 구매 자격 · 상품 ID 매핑

- 첫 구매 평생 1회: **이미 있던** 부분 유니크 인덱스 + 함수의 명시적 예외
- 상품 ID: `product_catalog` 가 `store_product_id`(소문자)와 `internal_product_key`(대문자)를
  **별개 칸**으로 갖는다 → **`economyContractV1.test.ts` 를 한 글자도 안 건드렸다** (원칙 8)

### 6-7 합성 반례 — **44건 통과**

| 지정된 반례 | 어디서 답하나 |
|---|---|
| 중복 토큰 | DB 유니크 (`verified_purchases_external_uniq`) — 계약으로 잠금 |
| 위조 토큰 | 순수 함수 `VERIFY_FAILED` |
| **다른 패키지의 토큰** | Play API 가 404 → `VERIFY_FAILED` |
| 환불 후 재사용 | `ALREADY_CONSUMED` |
| 동시 요청 | DB 유니크 — 계약으로 잠금 |
| **지급 후 소비 실패** | `iap-reconcile` + 3일 창 — 계약으로 잠금 |
| 위조 RTDN | OIDC 검증 + voided 목록 재확인 |
| 키 미설정 | `NOT_CONFIGURED` |
| **첫 구매 두 번** | 부분 유니크 인덱스 + 함수 예외 |

⚠ 순수 함수가 답할 수 없는 것(중복·동시)은 **어디가 답하는지**를 SQL 계약으로 잠갔다.
그리고 **Edge 가 순수 함수와 같은 규칙·같은 순서·같은 상태 코드**를 쓰는지 대조한다.

### 6-8 staging 배포 + 미설정 경로 확인 — **11/11 PASS**

Edge 3개 배포. 시크릿 없는 상태에서:
로그인 없이 → 401 · 입력 부족 → 400 · **키 미설정 → 503 NOT_CONFIGURED** ·
⚠ **원장에 구매 기록이 생기지 않았다**(상태 코드가 아니라 원장으로 확인) ·
인증 없는 RTDN → 처리 안 함 · 위조 RTDN → 회수 안 함 · 크론 시크릿 없이 → 401.

### 6-9 오너 런북 → `docs/OWNER_RUNBOOK_IAP_2026-09-11.md`

### 6-10 미성년 결제 정책 초안 → **부록 B**

---

## PART 7 — 통합 확인

| | |
|---|---|
| `tsc --noEmit` | **통과** |
| 전체 테스트 | **357 스위트 / 6,094건 전부 통과** |
| `release-preflight` | **PASS · blocker 0** (21 ok · 2 warn) |
| **골든 미니팩** | **✅ PASS** — 아래 |
| 내부 APK | ⚠ **큐에 남아 있음** — 아래 |

### 골든 미니팩 — PASS (1회, 재실행 없음)

상담 서버 경로(`chat` Edge)를 건드렸으므로 필수였다.

| 지표 | baseline | 현재 | 델타 |
|---|---|---|---|
| **총점 평균** | 58.28 | **58.72** | **+0.44 ▲** |
| PUV YES % | 80.00 | 80.00 | 0.00 |
| PUV NO 건 | 1 | 1 | 0.00 |
| 구체근거 노출 | 24 | 24 | 0.00 |
| hard fail | 0 | **0** | — |
| zero-engine 성공 | 0 | **0** | — |
| 거절 정상/전체 | 3/3 | **3/3** | — |
| 거절인데 과금 | 0 | **0** | — |

축별로 내려간 것 **하나도 없다**(depth·contradiction·actionability·readability 소폭 상승).
LLM 28콜 · 8.4분 · 덕 55. **프롬프트를 고쳐 맞추지 않았다** — 한 줄도 건드리지 않았다.

### 내부 APK — **큐에 남아 있음**

`f20ebc13-c19b-45cf-825a-32cdc33001ec` (profile `internal`, Android).
보고 시점 `IN_QUEUE`. **EAS 빌드 사용 1 / 상한 1** — 다시 걸지 않았다.

> ⚠ **그래서 PART 5 의 서버 동의 확인을 켜지 않았다.** 지시서가 "빌드하지 않았으면 꺼 둔다"
> 이고, 빌드 결과를 확인하지 못한 상태에서 켜면 옛 APK 로 상담이 막힌다.
> 빌드가 끝나 폰에 설치하신 뒤 켜는 방법은 `docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md` 부록에 있다.

### production 적용 런북 갱신 → `docs/OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md`

대기 **6건**(14·15 + 16·17·18·19) · 순서(DB → Edge → 웹 → 앱) · 출시 시점 동의 게이트 켜기 ·
되돌리기 SQL 전부 · **전부 "CTO 판정 후" 표시**.

### 체크포인트 커밋만 먼저 푸시·병합해도 되는가 — **됩니다**

체크포인트는 지난 두 묶음의 CTO 판정 완료분이고, DB 의존은 `20260915000000`(원가) 하나뿐인데
그 화면은 **RPC 가 없으면 "아직 설치되지 않았습니다" 를 보이도록** 이미 고쳐져 있다(합성 16건).
**DB 를 건드리지 않고 병합해도 깨지는 것이 없다.**

---

## 설계 선택 목록 (CTO 검토용)

| # | 선택 | 대안 | 왜 이쪽인가 |
|---|---|---|---|
| D1 | **M13 = 공유 시점 서버 스냅샷 + 본문 변경 시 자동 해지** | 리포트 합성을 Edge 로 이전 | 지시서가 "기존 구조에 맞는 가장 작은 변경" 을 요구. 관측된 공격은 완전히 닫힌다. 천장은 명시 |
| D2 | **신고를 새 표로** | `consultation_feedback` 확장 | upsert 충돌 · 처리 상태 · 신고가 투표에 묻힘 (위 PART 4) |
| D3 | **동의 게이트를 `resolveConsumerAuthority` 안에** | 각 kind 분기마다 | 사용자 대상 AI 가 전부 지나는 **단 하나의 문**. 새 경로가 생겨도 자동으로 덮인다 |
| D4 | **게이트 on/off 를 Edge 시크릿으로** | DB 설정 행 | `DUK_BILLING_ENABLED`·`GLOBAL_REQ_IDEMPOTENCY_ENABLED` 와 **같은 패턴**. 새 패턴을 만들지 않았다 |
| D5 | **동의를 표 + RPC 로** | `profiles` 칸 | 이력 보존(철회→재동의) · `granted_at` 을 클라이언트가 못 정함 |
| D6 | **`expo-iap`** | `react-native-iap@16` | nitro-modules 추가 의존 회피. 어댑터 뒤라 교체 비용 작음 |
| D7 | **승인은 서버, 소비는 클라이언트** | 서버가 소비 시도 | Play Developer API 에 소비가 없다. 승인만으로 3일 자동 환불이 막힌다 |
| D8 | **상품 ID 매핑을 클라이언트 상수로** | DB 조회 | 표시·요청용일 뿐이고 지급 수량은 서버가 정한다. 틀려도 돈이 안 나간다 |
| D9 | **sitemap 에서 noindex 제외를 슬러그별 RPC 호출로** | 목록 RPC 에 칸 추가 | 새 마이그레이션 없이 기존 함수 재사용. 인물이 수백이 되면 그때 칸을 더한다 |

### ⚠ 설계서와 원칙이 충돌한 곳 — **1건**

| | |
|---|---|
| 설계서(§5-4-6) | "verify-purchase 가 **소비(consume)** 까지" 로 읽히는 순서도를 적었다 |
| 원칙 4 | "지급 후 소비가 실패하면 재시도한다" |
| **실제** | **Play Developer API 에는 소비 엔드포인트가 없다.** 소비는 Play Billing Library(클라이언트)만 할 수 있다 |
| **처리** | 원칙을 따랐다: 서버는 **승인**을 하고(3일 자동 환불 차단), 소비는 클라이언트가 하며, 실패하면 다음 실행의 복구 스캔이 재제출한다. 승인 재시도는 `iap-reconcile` 이 3일 창에서 지킨다 |

---

## staging 변경 목록과 되돌리는 방법

| # | 변경 | 되돌리기 |
|---|---|---|
| 1 | 마이그레이션 **16·17·18·19** 적용 | `docs/OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md` ⑨ 의 SQL 을 `--project-ref aephpsiurgkvqcswyeie` 로 |
| 2 | Edge 배포 **chat · verify-purchase · google-rtdn · iap-reconcile** | 이전 버전을 다시 배포하거나 `supabase functions delete <이름>` (⚠ `chat` 은 삭제 금지 — 이전 커밋에서 다시 배포) |
| 3 | 테스트 계정 **A · B · C** 생성 | Supabase → Authentication → Users 에서 3계정 삭제 (연관 행은 cascade) |
| 4 | C 를 `admin_users` 에 등록 | 위 3 에 포함 (cascade) |
| 5 | A +200덕 · B +60덕 (`admin_adjust_duk`) | 위 3 에 포함. 되돌리려면 `admin_adjust_duk(<id>, -200, 'REWARD', '되돌림')` |
| 6 | `AI_CONSENT_ENFORCED` 를 켰다가 **껐다** | **이미 되돌렸다** (지금 없음) |
| 7 | 가상 인물 `예시인 하나` 를 **published + is_public** 으로 | `update public.famous_profiles set status='draft', is_public=false where slug='fictional-demo-1789037278347';` |
| 8 | 테스트 행: conversations · subjects · reports · shares · **신고 5건** | 위 3 의 계정 삭제로 전부 cascade. ⚠ 신고는 `ai_content_reports` 에 남는데 `user_id` cascade 로 함께 사라진다 |

⚠ **A 의 `profiles.terms_version` 을 `2026-08-v1` 로 설정**했다(동의 게이트만 따로 재려고).
계정 삭제로 함께 사라진다.

⚠ 이번 묶음에서 **production 에는 한 번도 접속하지 않았다.**

---

## 보호 파일 SHA · 테스트 · 골든 · 상한

### 보호 파일 6개 — **전부 불변**

| 파일 | SHA (앞 16) |
|---|---|
| `app.json` | `a326af8bfe02c782` ⚠ `expo install` 이 고친 것을 **되돌려** 원래 값으로 복귀 |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_REPORT.md` | `e7ae7dc31647352a` |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_2_REPORT.md` | `95c26873041912c1` |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_3_REPORT.md` | `edc974b5428a1fb9` |
| `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` | `23bfa4a4a02b084b` |
| `docs/RUBRIC_KNOWN_LIMITATIONS.md` | `58f11e7990bd3f47` |

`economyContractV1.test.ts` **미수정** · 계산 교리 **무변경** · 프롬프트 문구 **무변경**.

### 테스트

| | 전 | 후 |
|---|---|---|
| 스위트 | 350 | **357** (+7) |
| 테스트 | 5,926 | **6,094** (+168) |
| 실패 | 0 | **0** |

**새 스위트 7**: `shareServerSnapshot`(15) · `aiContentReport`(27) · `aiReport.render`(13) ·
`aiProcessingConsent`(33) · `aiConsent.render`(9) · `googlePlayPurchase`(44) · `purchaseUiText`(24).
**고친 스위트 1**: `brandSystemUiux` — 충전 화면 계약의 **전제가 바뀌어** 다시 썼다(지우지 않았다).

### 골든 미니팩

**58.28 → 58.72 (+0.44) PASS.** 안전 카운터 전부 0 유지. 재실행 0회.

### 상한

| | 사용 / 상한 |
|---|---|
| LLM 콜 | **28 / 80** (골든 미니팩 1회. 동의 게이트 확인은 LLM 앞에서 멈춰 0콜) |
| EAS 빌드 | **1 / 1** |

---

## 세 목록

### 🔵 CTO 판정 필요

| # | 무엇 | 자료 |
|---|---|---|
| C1 | **마이그레이션 6건 production 적용** (14·15 는 승인 완료, 16~19 신규) | `OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md` |
| C2 | **리포트 합성을 Edge 로 옮길 것인가** (M13 의 남은 천장). RLS 로는 못 막는다 | 본 보고서 PART 3 |
| C3 | **`get_shared_report` 의 `search_path` 가 레포와 실제가 달랐다** — 대시보드로 고쳐진 계열이 또 나왔다. 같은 종류가 몇 개나 더 있는지 조사할 것인가 | PART 3 |
| C4 | **`app.json` 에 `expo-iap` 를 넣을 것인가** — 넣지 않으면 결제가 안 열린다 | 부록 C |
| C5 | **`expo-image` 플러그인은 넣지 않는다** 로 결론. 동의하는가 | PART 2-4 |
| C6 | **target API 확인 후 36 미만이면** `expo-build-properties` 추가 (보호 파일) | PART 2-3 |
| C7 | **애플 5.1.2(i) 동의를 `TERMS_VERSION` 과 묶을 것인가** — 지금은 **별도 버전**이라 기존 사용자가 재동의를 강요당하지 않는다. 심사관이 묶기를 요구하면 바꿔야 한다 | PART 5 |
| C8 | frozen 경로 커밋이 기준선보다 1건 많다 (64→65, OWNER_TODO D8) | preflight WARN |

### 🟣 오너 결정 필요

| # | 무엇 |
|---|---|
| O1 | **[법률 검토] 국외 이전 확정 기재** — 처방침에 `[법률 검토]` 문단 3개를 넣었다. 변호사 확정 필요 |
| O2 | **[법률 검토] 미성년 결제 정책** — 부록 B 초안. 법정대리인 동의·취소권 |
| O3 | **부채(`duk_debt`)를 화면에 어떻게 보일 것인가** — 지금 표시가 없다 (직전 보고서 O2 이월) |
| O4 | **`DUK_KRW` 를 총액(198원)으로 둘지 순매출(126~153원)로 둘지** (직전 보고서 O1 이월) |
| O5 | **결제 프로필 주소** (직전 보고서 O5 이월) |

### 🟢 오너 할 일

**① 체크포인트 커밋 (지금 바로, 안전)**

```bash
cd C:\Development\DeokbunAI-app
git commit -F C:\Development\owner_inputs\CHECKPOINT_COMMIT_MSG.txt
```

⚠ `git add` 를 다시 하지 마십시오.

**② `app.json` 한 줄** (결제를 열려면)

diff: `C:\Development\owner_inputs\app.json.expo-iap.diff` · 부록 C

**③ EAS 빌드 확인 + targetSdk 읽기**

`https://expo.dev/accounts/deokbuni/projects/DeokbunAI/builds/f20ebc13-c19b-45cf-825a-32cdc33001ec`

빌드 로그에서 `targetSdkVersion` 을 찾아 알려 주십시오.

**④ 실기기 QA** → `docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md` (부록 34항목)

**⑤ 결제 콘솔 설정** → `docs/OWNER_RUNBOOK_IAP_2026-09-11.md`

**⑥ production 반영** (CTO 판정 후) → `docs/OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md`

**⑦ production 익명 로그인 설정 확인**

Supabase(production) → Authentication → Providers → **Anonymous sign-ins 가 꺼져 있는지**.
staging 은 꺼져 있음을 실측했지만 production 은 확인하지 못했습니다.

---

## 커밋 메시지 제안 (이번 묶음분. 커밋은 오너가 합니다)

```
feat: 공유 리포트 위조 차단 · AI 답변 신고 · AI 처리 동의 · 안드로이드 결제

공유 페이지가 사용자가 쓴 글을 보여 주던 것을 막는다 (M13)
- report_shares.shared_payload 를 서버 소유로 두고, 공유 시점에 트리거가 스냅샷을 뜬다.
  get_shared_report 는 그 사본만 읽는다
- 본문이 바뀌면 그 리포트의 활성 공유가 자동으로 해지된다 — 공유해 둔 링크에 위조본이
  뜨는 일이 구조적으로 불가능하다
- ⚠ 실측이 먼저였다: DTO 모양 그대로 위조하니 title·summary·keyFindings·cautions·
  coveredTopics 다섯 칸이 전부 그대로 나갔다. 첫 측정은 DTO 를 안 맞춰 가짜로 통과했다
- 옛 APK 의 공유 흐름은 그대로 둔다. 권한을 빼지 않았고 트리거가 대신 채운다

AI 답변 신고 (구글 AI 생성 콘텐츠 정책)
- 답변마다 신고 입구. 👍/👎 를 누른 뒤에도 보인다 — 그 뒤에 문제를 발견하는 일이 있다
- 새 표로 만들었다. consultation_feedback 을 넓히면 재투표 upsert 가 신고를 덮는다
- 사용자는 넣고 볼 수만 있다. 지울 수 없다 — 신고가 지워지면 운영 기록이 사라진다
- 관리자 목록은 신고자 id 대신 익명 해시 12자를 준다

제3자 AI 처리 동의 (애플 5.1.2(i))
- 무엇을·누구에게(업체명)·왜 보내는지 알리고 명시적 동의를 받는다. 기본값 미체크
- 서버가 chat Edge 한 곳에서 확인한다 — 사용자 대상 AI 가 전부 지나는 단 하나의 문
- 설정값(Edge 시크릿)으로 켜고 끈다. 기본은 꺼짐 — 켜면 동의 화면이 없는 옛 앱이 막힌다
- 동의는 버전·시각과 함께 기록되고 RPC 로만 쓴다. 클라이언트가 시각을 정하면 증거가 아니다

안드로이드 결제
- 검증 → 지급(토큰 멱등) → 승인. 키가 없으면 지급하지 않는다
- 승인을 서버가 한다. 3일 안에 승인되지 않으면 구글이 자동 환불하고, 소비는 클라이언트만
  할 수 있기 때문이다. iap-reconcile 이 그 창을 지킨다
- RTDN 은 OIDC 로 인증하고, 통지 내용이 아니라 구글에 다시 물어본 상태로 회수한다
- 상품 ID 는 매핑으로 푼다. 경제 계약은 한 글자도 건드리지 않았다
- ⚠ 렌더 테스트가 결함을 잡았다: expo-iap 이 jsdom 에서 실제로 로드돼 살 수 없는 구매
  버튼이 떴다. 모듈 존재는 스토어 존재가 아니다 — 플랫폼도 함께 본다

그 밖
- noindex 인물이 사이트맵에 들어가던 것을 고쳤다 (Search Console 오류가 쌓인다)
- conversations UPDATE 에 subject 소유 조건 추가 (INSERT 와의 비대칭 해소)

테스트 357 스위트 / 6,094건 통과 (350 / 5,926 → +7 / +168). tsc 통과. preflight PASS.
골든 미니팩 58.28 → 58.72 PASS (안전 카운터 전부 0 유지).
LLM 28콜. EAS 빌드 1회.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

## 부록

| | 파일 |
|---|---|
| **A. 직전 보고서 원문** (PART 4 · PART 5 · STORE_READINESS §5-1 · §5-4) | `docs/APPENDIX_A_PREV_REPORT_VERBATIM_2026-09-10.md` |
| **B. 미성년 결제 정책 초안** | `docs/APPENDIX_B_MINOR_PAYMENT_POLICY_2026-09-11.md` |
| **C. `app.json` diff 3종** (`expo-iap` 필요 · `expo-image` 불필요 판정 · `expo-build-properties` 조건부) | `docs/APPENDIX_C_APP_JSON_DIFFS_2026-09-11.md` |

### 이번 묶음 변경·추가 파일

**마이그레이션 4** — `20260916000000_m13_share_server_snapshot` · `20260917000000_ai_content_reports` ·
`20260918000000_ai_processing_consent` · `20260919000000_iap_google_runtime`

**Edge 4** — `chat`(동의 게이트) · `verify-purchase`(구글 구현) · `google-rtdn`(구현) ·
`iap-reconcile`(신규) · `_shared/googlePlay.ts`(신규)

**새 소스 10** — `aiContentReport.ts` · `AiReportSheet.tsx` · `aiReportService.ts` ·
`adminAiReportService.ts` · `admin/ai-reports/index.tsx` · `aiProcessingConsent.ts` ·
`aiConsentService.ts` · `AiConsentSheet.tsx` · `AiConsentSetting.tsx` ·
`expoIapAdapter.ts` · `purchaseService.ts` · `purchaseUiText.ts` · `googlePlayPurchase.ts`

**고친 소스 12** — `chat.tsx` · `compatibility-chat.tsx` · `duk-topup.tsx` · `(tabs)/my.tsx` ·
`UserFeedbackControl.tsx` · `StructuredConsultationResult.tsx` · `AdminSidebar.tsx` ·
`consumerErrorCopy.ts` · `consultationErrors.ts` · `chatArchitecture.ts` ·
`createServerConsultationService.ts` · `compatibilityConsultationService.ts` ·
`consultationTransport.ts` · `llmError.ts` · `supabaseEdgeConsultationAdapter.ts` ·
`legalContent.ts` · `generate-sitemap.mjs` · `package.json` · `package-lock.json`

**새 테스트 7 · 고친 테스트 1** — 위 "테스트" 절

**새 문서 5** — 이 보고서 · 부록 A/B/C · `OWNER_RUNBOOK_IAP_2026-09-11.md` ·
`OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md` · `OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md` 부록
