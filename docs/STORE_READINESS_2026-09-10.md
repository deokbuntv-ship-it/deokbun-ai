# 출시 요건 점검 — 스토어 심사 · 데이터 공개 · 연령등급 (2026-09-10)

> ⚠ 이 문서는 **조사·설계·초안**입니다. 앱 기능은 하나도 구현하지 않았습니다(지시서 PART 5).
> 근거는 `파일:줄` 로 답니다. 정책 인용은 **확인한 출처와 확인 날짜**를 답니다.
> 확인하지 못한 것은 **미확인**이라고 적었습니다.

---

## 5-1. 스토어 심사 요건 점검표

### ⚠ 먼저 — 지금 당장 걸리는 것 둘

| | 항목 | 상태 |
|---|---|---|
| 🔴 1 | **구글: AI 콘텐츠 신고 기능이 없다** | **미충족** — 아래 A-5 |
| 🟠 2 | **구글: target API 36 요구 시점이 이미 지났다** (2026-08-31) | **미확인** — 아래 A-6 |

---

### A. 구글 플레이

#### A-1. 개인정보 처리방침 URL · 계정삭제 URL

| | |
|---|---|
| 상태 | **코드는 충족 · 실사이트 미반영** |
| 근거 | `src/app/privacy-policy.tsx` · `src/app/account-deletion.tsx` (로그인 없이 열림, 11건 렌더 테스트) |
| 남은 것 | **병합해야 실사이트에 뜹니다** → `docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md` |
| 제출할 주소 | `https://www.deokbunai.com/privacy-policy` · `https://www.deokbunai.com/account-deletion` |

#### A-2. 앱 안에서의 계정 삭제

| | |
|---|---|
| 상태 | **충족** |
| 근거 | MY → 계정 탈퇴 → 확인 타이핑 → Edge `account-delete`. 마이그레이션 `20260903000000`, 계약 테스트 36건 (`docs/PROJECT_STATE.md:183`) |

#### A-3. 데이터 보안 양식

→ **5-2** 초안 참조.

#### A-4. 콘텐츠 등급 설문

→ **5-3** 자료 참조.

#### A-5. 🔴 AI 생성 콘텐츠 정책 — **신고·플래그 기능이 없습니다**

> **확인한 원문** (2026-09-10 확인, [Understanding Google Play's AI-Generated Content policy](https://support.google.com/googleplay/android-developer/answer/14094294)
> + [Best Practices to Safeguard AI-Generated Content](https://support.google.com/googleplay/android-developer/answer/16353813)):
> AI 로 콘텐츠를 만드는 앱은 **앱을 벗어나지 않고** 불쾌한 콘텐츠를 개발자에게 **신고·플래그할 수 있는
> 앱 내 기능**을 갖춰야 합니다. 개발자는 그 신고를 필터링·모더레이션에 반영해야 합니다.
> ⚠ 정책 페이지에 "마지막 수정일" 표기가 없어 **개정일은 미확인**입니다.

**지금 있는 것**: 답변마다 **도움됨 / 도움 안 됨** 투표 + 선택적 사유 코드.

- `supabase/migrations/20260819000200_consultation_feedback.sql:28` — `verdict check (verdict in ('helpful','not_helpful'))`
- `src/features/chat/services/feedbackService.ts:15-20` — `verdict` + `reasonCode`
- 화면 연결: `src/app/chat.tsx:178` · `src/app/compatibility-chat.tsx:368`

**판정: 미충족(부분).** 이것은 **품질 투표**이지 **불쾌 콘텐츠 신고**가 아닙니다. 차이가 셋입니다:

1. `verdict` 가 두 값뿐이라 "신고" 를 담을 자리가 없습니다(CHECK 제약).
2. 화면에 **"신고"** 라는 말이 없습니다 — 사용자가 그 기능을 찾을 수 없습니다.
3. 신고가 도착했을 때 **보는 자리(관리자 화면)가 없습니다.**

**다음 지시서용 작업 목록** (구현은 이번에 하지 않았습니다):

| # | 파일 | 규모 |
|---|---|---|
| 1 | 새 마이그레이션 — `consultation_feedback.verdict` CHECK 에 `'report'` 추가 + `report_reason` 텍스트 칸 | ~20줄 |
| 2 | `src/features/chat/services/feedbackService.ts` — `report` 경로 | ~15줄 |
| 3 | 답변 하단에 **신고** 버튼 + 사유 선택 시트 | ~120줄 (새 컴포넌트 1) |
| 4 | 관리자 화면에 신고 목록 (`src/app/admin/` 새 라우트 1) | ~150줄 |
| 5 | 렌더 테스트 + 계약 테스트 | ~80줄 |

⚠ **1번은 `20260819000200` 을 고치는 것이 아니라 새 파일**입니다. 번호는
`node scripts/next-migration-name.mjs add_feedback_report` 로 뽑으십시오.

#### A-6. 🟠 target API level — **미확인, 그리고 시한이 지났습니다**

> **확인한 원문** (2026-09-10 확인,
> [Target API level requirements for Google Play apps](https://support.google.com/googleplay/android-developer/answer/11926878)
> · [Meet Google Play's target API level requirement](https://developer.android.com/google/play/requirements/target-sdk)):
> **2026-08-31 부터 신규 앱과 앱 업데이트는 Android 16(API 36) 이상**을 target 해야 제출됩니다.
> 기존 앱은 같은 날짜까지 API 35 이상. 연장을 신청하면 2026-11-01 까지 배포를 이어갈 수 있습니다.

**오늘은 2026-09-10 입니다. 시한이 이미 지났습니다.**

현재 앱의 targetSdk: **미확인**.

- `app.json` 에 `expo-build-properties` 플러그인이 **없습니다** → Expo SDK 57 의 기본값을 씁니다
- 그 기본값은 **레포에서 확인할 수 없습니다** — managed 워크플로라 gradle 값이 EAS 빌드
  시점(prebuild)에 만들어집니다. `node_modules` 를 전수로 뒤졌지만 `targetSdkVersion` 이
  없습니다
- Expo SDK 57 문서에도 이 값이 적혀 있지 않았습니다(2026-09-10 확인)

**확인 방법 (오너)**: EAS 빌드 로그에서 `targetSdkVersion` 을 찾거나,

```bash
npx expo prebuild --platform android --no-install
# 그 뒤 android/build.gradle 의 targetSdkVersion 확인 후 android/ 폴더를 지운다
```

⚠ `expo prebuild` 는 `android/` 폴더를 만듭니다. **확인만 하고 지우십시오** — 이 레포는
managed 워크플로를 유지합니다.

**36 이 아니면** `app.json` 에 `expo-build-properties` 를 넣어 올려야 하는데,
그것은 **보호 파일 변경**이라 CTO 승인이 필요합니다.

#### A-7. 덕 소모 전 가격 고지

| | |
|---|---|
| 상태 | **충족** |
| 근거 | `src/components/PriceConfirmSheet.tsx` — 상담 시작 전 가격 시트. `src/features/duk/pricing.ts:7-11` 이 표시 단일 출처(5·12·50덕) |
| 후속질문 chip | **충족** — 후속 질문은 같은 세션이라 **추가 과금이 없습니다**. 체크리스트 #9 가 "no new charge" 를 확인합니다(`docs/DEVICE_QA_MATRIX.md` #9) |

---

### B. 애플 (계정 승인 대기 중이지만 요건은 지금 맞출 수 있습니다)

#### B-1. 🔴 5.1.2(i) — 제3자 AI 전송 전 **명시적 동의**

> **확인한 원문** (2026-09-10 확인, [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)):
> "You must clearly disclose where personal data will be shared with third parties,
> **including with third-party AI**, and obtain explicit permission before doing so."
> ⚠ 페이지에 "마지막 수정일" 표기가 없어 **개정일은 미확인**입니다(지시서는 2025-11 개정으로 적고 있습니다).

네 갈래로 나눠 봤습니다.

| 질문 | 판정 | 근거 |
|---|---|---|
| ① 무엇을, **누구에게**(업체명) 보내는지 알리는가 | **충족** | `src/features/legal/legalContent.ts:61` — "AI 해석 생성은 **OpenAI**(대규모 언어모델 API)를 통해 처리됩니다" · 저장·인증은 **Supabase**. 업체명이 명시돼 있습니다 |
| ② **명시적 동의**를 받는가 · 기본값이 미체크인가 | **부분** | `src/features/onboarding/terms.ts:19-23` — 필수 3항목(`service`·`privacy`·`age14`)을 **한 묶음**으로 받습니다. 기본 미체크는 지켜집니다(선택 항목은 `never pre-checked`, 같은 파일 17행). ⚠ **"제3자 AI 전송" 만을 위한 별도 항목이 없습니다** — `privacy` 안에 녹아 있습니다 |
| ③ 동의 **전에는** 네트워크 호출이 없는가 | **충족** | 회원가입 우선 온보딩이고, LLM 호출 전에 로그인 게이트가 있습니다. `src/features/chat/__tests__/chatService.test.ts:58` — "a real question while UNAUTHENTICATED returns AUTH_REQUIRED and **NEVER calls the adapter**" (헌법 제12조). 익명 Edge 실측에서도 LLM 경로는 전부 401 |
| ④ 개인정보 처리방침에 적혀 있는가 | **충족** | 위 ① 과 같은 줄 (처방침 §3 AI 처리 및 처리 위탁) |

**판정: ② 때문에 미충족 위험.** 애플 심사관이 "explicit permission" 을 **AI 전송 전용
동의 항목**으로 요구하면 지금 구조로는 설명이 어렵습니다.

**최소 보강안 (다음 지시서)**: `REQUIRED_CONSENTS` 에 항목 하나 추가.

```
{ id: 'ai_processing', label: '[필수] 출생정보·상담 내용의 AI(OpenAI) 처리 동의', required: true }
```

⚠ 그러면 `TERMS_VERSION` 을 올려야 하고(같은 파일 8행), **기존 사용자가 전원 재동의**
화면으로 돌아갑니다. 그 파급이 있으니 **[오너 결정]** 으로 올립니다.
규모: `terms.ts` 3줄 + 처방침 문단 1개 + 온보딩 렌더 테스트 갱신.

#### B-2. 4.3 — 점술 앱은 **포화 카테고리로 명시**돼 있습니다

> **확인한 원문** (2026-09-10 확인, 같은 페이지 4.3 Spam):
> "Certain kinds of apps, such as dating, flashlight, sound effects, wallpaper, simple timers,
> and **fortune telling**, are well established on the App Store and we will not accept new
> submissions **unless they offer a meaningfully different or improved experience**."

**심사 노트용 차별점 초안** (사실만 적었습니다 — 각 항목이 코드로 확인됩니다):

> 덕분이는 운세 문구를 생성하는 앱이 아니라, **결정론적 명리 계산 엔진의 출력을 근거로
> 해설을 구성하고, 그 해설이 계산 결과와 어긋나지 않는지 기계가 검사하는** 앱입니다.
>
> 1. **계산 엔진이 먼저입니다.** 사주(명리)·자미두수·기문둔갑 세 엔진이 생년월일시로
>    명식을 계산합니다. 언어모델은 그 계산 결과를 **받아서** 설명할 뿐, 명식을 지어내지
>    않습니다(엔진 경로는 동결돼 있고 변경이 가드로 막혀 있습니다).
> 2. **근거를 함께 보여 줍니다.** 답변에 쓰인 명식 요소(천간·지지·십성·통근 등)를
>    화면에 표로 제시합니다. 사용자는 결론만이 아니라 그 결론이 어디서 나왔는지 봅니다.
> 3. **기계 검사기가 답변을 검사합니다.** 대조 검사기 13종이 "본문이 명식에 없는 사실을
>    주장하는가" 를 자동으로 잡고, 걸린 문장은 발행되지 않습니다. 내용이 없는 문장
>    (자리만 되풀이하는 문장, 출처를 고백하는 문장)도 별도 검사기가 제거합니다.
> 4. **AI 임을 숨기지 않습니다.** 모든 해석 화면에 AI 생성 고지가 붙습니다.
>    (`src/features/legal/aiDisclosure.ts`)
> 5. **결과 단정·공포·과장·상담 강권을 금지하는 톤 규칙**이 코드에 있고 테스트로 강제됩니다.

⚠ 위 문장 중 "검사기 13종" 같은 수치는 이 레포의 현재값입니다. 제출 직전에 다시 세십시오.

#### B-3. 4.8 — 제3자 소셜 로그인을 쓸 때의 요건

> **확인한 원문** (2026-09-10 확인, 같은 페이지 4.8 Login Services):
> 제3자·소셜 로그인으로 기본 계정을 만들거나 인증하는 앱은 **동등한 선택지로 다른 로그인
> 서비스**를 제공해야 하며, 그 서비스는 ⓐ 수집을 이름·이메일로 제한하고 ⓑ 사용자가
> 이메일을 비공개로 유지할 수 있게 하고 ⓒ 동의 없이 광고 목적으로 앱 내 상호작용을
> 수집하지 않아야 합니다.

**판정: 충족 예정 — 단, 애플 로그인이 실제로 동작해야 합니다.**

- 앱은 카카오·네이버·구글·**애플** 네 가지를 제공합니다(`src/app/login.tsx:102-108`).
- **Sign in with Apple 이 ⓐⓑⓒ 를 모두 만족**하는 대표 사례입니다(Hide My Email 포함).
- 코드는 이미 애플을 **iOS 에서 첫 번째**로 배치합니다(`src/app/login.tsx:31` 주석 —
  애플 플랫폼 지침).
- ⚠ **지금 staging 에서는 애플 제공자가 꺼져 있습니다**(2026-09-10 실측). 애플 개발자
  계정이 나오면 Supabase 에서 켜고 실기기로 확인해야 합니다. **그 전에는 미검증**입니다.

#### B-4. 5.1.1(v) — 계정 삭제

앱 안에서는 **충족**(A-2 와 같은 근거). 웹 URL 은 병합 후.

---

## 5-2. 데이터 공개 양식 초안 (구글 "데이터 보안" · 애플 "개인정보 라벨")

⚠ **코드 근거로만 작성했습니다.** 값을 지어내지 않았습니다. `[법률 검토]` 는 처방침 기재와
어긋나거나 처방침이 아직 확정하지 않은 칸입니다.

| 수집 항목 | 목적 | 제3자 전송처 | 전송 암호화 | 삭제 요청 | 근거 |
|---|---|---|---|---|---|
| 이메일 · 소셜 계정 식별자 | 계정 인증 | **Supabase**(인증 인프라) | 예 (HTTPS) | 예 (앱 내 탈퇴) | `authService.ts` · `20260817000100_profiles.sql` |
| 표시 이름 | 계정 표시 | Supabase | 예 | 예 | `profiles.display_name` |
| **출생 연·월·일·시 · 성별 · 출생지** | 명식 계산 · AI 해석 | Supabase(저장) · **OpenAI**(해석 생성) | 예 | 예 | `consultation_subjects.birth_info` · `chat` Edge |
| 상담 질문·답변 본문 | 상담 기능 · 이어보기 | Supabase(저장) · **OpenAI**(생성) | 예 | 예 | `conversation_messages` |
| 상담 리포트 | 우편함 보관·공유 | Supabase | 예 | 예 | `consultation_reports` |
| 덕 잔액·거래 기록 | 결제·정산 | Supabase | 예 | ⚠ **[법률 검토]** — 전자상거래법 거래기록 보존 대상일 수 있음 | `duk_ledger` |
| 푸시 토큰 · 기기 정보 | 알림 발송 | Supabase · **FCM/APNs**(미설정) | 예 | 예 | `push_devices` |
| 알림 설정 | 알림 제어 | Supabase | 예 | 예 | `notification_preferences` |
| 앱 사용 이벤트(화면·전환) | 서비스 개선 | Supabase | 예 | 예 | `product_events` |
| 광고 노출·클릭 | 광고 운영 | Supabase | 예 | 예 (익명 집계) | `ad-track` Edge — **개인 식별자를 저장하지 않습니다** |
| 소셜 로그인 시 **네이버** 프로필 | 인증 | **네이버**(로그인 제공자) | 예 | 예 | `naver-auth` Edge |
| 결제 영수증 | 구매 검증 | **Apple / Google**(스토어) | 예 | ⚠ **[법률 검토]** | `verified_purchases` (아직 비활성) |

### ⚠ 처방침과 어긋나는 곳 — **[법률 검토] 2건**

1. **국외 이전 기재가 없습니다.** OpenAI 는 미국 기업이고 출생정보·상담 내용이 그리로
   갑니다. 처방침 §3 은 "처리 위탁" 으로만 적고 **국외 이전(개인정보보호법 제28조의8)을
   따로 적지 않습니다**. 그리고 같은 문단이 "위탁 범위·항목·보유에 관한 확정 사항은 최종
   법률 검토 시 명확히 안내됩니다" 라고 **스스로 미확정을 선언**하고 있습니다
   (`src/features/legal/legalContent.ts:61`). **[법률 검토]**
2. **보유 기간이 확정되지 않았습니다.** 탈퇴 시 보존 항목·기간이 `[법률 검토]` 로 남아
   있습니다(`docs/OWNER_TODO.md` D5). 데이터 보안 양식의 "삭제 요청 가능 여부" 칸이
   그것에 달려 있습니다. **[법률 검토]**

---

## 5-3. 연령등급 설문 입력 자료 (⑦ 오너 판단용)

⚠ **사실만 나열합니다.** 등급 판단은 오너가 합니다.

| 설문이 묻는 것 | 이 앱의 사실 |
|---|---|
| 폭력 | 없음 |
| 성적 콘텐츠 | 없음 |
| 욕설·거친 언어 | 없음. 톤 규칙이 코드로 강제됩니다 |
| 약물·주류·담배 | 없음 |
| 도박 · 도박 유사 | **없음.** 덕은 확률 요소가 없는 정액 소모 재화입니다(5·12·50덕 고정) |
| 공포·불안 유발 | ⚠ **운세·점술 콘텐츠**입니다. 다만 **결과 단정·공포·과장·상담 강권을 금지**하는 톤 규칙이 있고 테스트가 강제합니다 |
| 사용자 생성 콘텐츠 공유 | ⚠ **부분** — 리포트를 **링크로 공유**할 수 있습니다(`report_shares`). 받는 사람은 **로그인해야** 열립니다(`get_shared_report` 가 `auth.uid() is null` 이면 null 반환). 공개 게시판·댓글은 없습니다 |
| 사용자 간 상호작용 | **없음.** 채팅 상대는 AI 뿐입니다 |
| 위치 정보 수집 | **없음.** 출생지는 **사용자가 입력한 텍스트**이고 기기 위치를 읽지 않습니다 |
| 개인정보 공유 | **있음** — 위 5-2 표 |
| 디지털 구매 | **있음(예정)** — 덕 인앱 구매. 현재 빌드는 비활성 |
| 광고 | **있음** — 자체 광고 노출(`advertisements` · `ad-track`) |
| 최소 연령 제한 | **만 14세 이상** — 온보딩 필수 동의에 있습니다 (`src/features/onboarding/terms.ts:22`), 미성년자 정책 문서 있음(`/minor-policy`) |
| AI 생성 콘텐츠 | **있음** — 모든 해석이 AI 생성이고 화면마다 고지합니다 |

---

## 5-4. 결제(IAP) 설계서

### 5-4-1. 재사용 계획 — **DB 는 이미 다 있습니다**

⚠ **오늘 확인 [production · 오너 제공 스냅샷]**: production 에 결제 관련 표가 **이미
존재합니다** — `product_catalog` · `verified_purchases` · `purchase_revocations` ·
`duk_ledger` · `duk_reserve` · `duk_debt` · `plus_entitlements`.
`20260834000000_iap.sql` 이 production 이력에 들어 있습니다.

| 기존 자산 | 위치 | 재사용 |
|---|---|---|
| 상품 매핑 표 | `product_catalog` (`20260834000000_iap.sql:12`) | **그대로.** `(provider, store_product_id) → internal_product_key + grant_amount` |
| 구매 기록 · 멱등 | `verified_purchases` + `verified_purchases_external_uniq` | **그대로.** 같은 영수증은 한 번만 지급 |
| 첫 팩 평생 1회 | `verified_purchases_first_pack_once` 부분 유니크 인덱스 | **그대로** |
| 환불 기록 | `purchase_revocations` + `record_revocation` RPC (`:107`) | **그대로** |
| 지급 RPC | `record_verified_purchase` (`:67`) → `grant_duk` | **그대로** |
| 검증 Edge 골격 | `supabase/functions/verify-purchase/index.ts:59` → `VERIFIER_NOT_IMPLEMENTED` (503) | **본체만 채우면 됩니다** |
| 애플 알림 V2 골격 | `supabase/functions/apple-notifications-v2/index.ts:34` | 같음 |
| 구글 RTDN 골격 | `supabase/functions/google-rtdn/index.ts:27` | 같음 |
| 네이티브 어댑터 (lazy require) | `src/features/duk/iap/reactNativeIapAdapter.ts` · `nativeStore.ts` | **그대로.** 모듈이 없으면 `isAvailable() === false` |
| 상품 시드 템플릿 | `scripts/staging/product_catalog_seed.TEMPLATE.sql` (6행 = 플랫폼 × 3) | 실제 상품 ID 를 채워 넣습니다 |
| 05B 연기 문서 | `docs/FEATURE_MASTER_CHECKLIST.md:296` · `docs/PROJECT_STATE.md:1002` | 작업 순서 근거 |

**없는 것은 셋뿐입니다**: ① 검증기 본체 ② 네이티브 모듈 설치·호출부 ③ `product_catalog` 행.

### 5-4-2. 라이브러리 — `expo-iap` 를 권합니다

`npm view` 실측 (2026-09-10):

| | `react-native-iap` | `expo-iap` |
|---|---|---|
| 최신 | **16.5.1** | **5.5.1** |
| peer | `react-native-nitro-modules ^0.36.5` (최신 0.37.1) · react · react-native | `expo *` · react · react-native |
| 이 레포 | react-native **0.86.3** · react **19.2.3** · expo **57.0.21** | 같음 |

**판단: `expo-iap`.** 이유는 하나입니다 — `react-native-iap@16` 은
**`react-native-nitro-modules` 라는 추가 네이티브 의존을 요구**하고, 그것이 New
Architecture 브리지 계층을 하나 더 얹습니다. `expo-iap` 는 Expo 자체를 peer 로 두어
SDK 57 정렬에 얹힙니다. 어차피 우리 코드는 어댑터 뒤에 있습니다
(`nativeStore.ts` 인터페이스) — 바꿔 끼우는 비용이 작습니다.

⚠ **New Architecture 호환은 미확인**입니다. 두 라이브러리 모두 npm 메타데이터만 봤고
실제 빌드로 확인하지 않았습니다. 설치 후 **EAS 빌드 1회**로 확인해야 합니다.

⚠ **config plugin 필요 여부도 미확인**입니다. 필요하다면 `app.json` 의 `plugins` 변경이라
**다음 지시서에서 CTO 승인**을 받아야 합니다(보호 파일).

### 5-4-3. 상품 ID — **매핑이 이미 있어서 계약을 안 건드려도 됩니다**

> 구글은 상품 ID 에 **소문자·숫자·밑줄·마침표**만 허용하고, 한 번 만들면 **바꾸거나 다시
> 쓸 수 없습니다.** (⚠ 이 규칙은 **미확인** — Play Console 문서 원문을 확인하지 못했습니다.
> 콘솔 화면의 입력 도움말로 확인하십시오.)

경제 계약의 내부 키는 **대문자**입니다: `DUK_FIRST_20` · `DUK_BASE_50` · `DUK_LARGE_120`
(`20260834000000_iap.sql:17` 의 CHECK 제약 · `src/features/duk/pricing.ts:33-37`).

**하지만 매핑이 필요하지 않습니다 — 이미 두 칸으로 나뉘어 있습니다.**

```
product_catalog.store_product_id      ← 스토어가 정한 소문자 ID  (예: duk_first_20)
product_catalog.internal_product_key  ← 경제 계약의 대문자 키    (DUK_FIRST_20)
```

`economyContractV1.test.ts` 는 **내부 키**를 고정하고, 스토어 ID 는 별개 칸이라
**계약 테스트를 수정할 필요가 없습니다.** 권장 스토어 ID:

| 내부 키 | 구글 상품 ID | 애플 Product ID | 덕 | 표시가(가설) |
|---|---|---|---|---|
| `DUK_FIRST_20` | `duk_first_20` | `com.deokbun.app.duk_first_20` | 20 | ₩2,900 (평생 1회) |
| `DUK_BASE_50` | `duk_base_50` | `com.deokbun.app.duk_base_50` | 50 | ₩9,900 |
| `DUK_LARGE_120` | `duk_large_120` | `com.deokbun.app.duk_large_120` | 120 | ₩19,900 |

⚠ 표시가는 `src/features/duk/pricing.ts:34-36` 의 `priceKrwHint` 입니다 — 주석이
**"display hypothesis, not a charge"** 라고 적어 두었습니다. 최종가는 오너가 정합니다.

### 5-4-4. 가격

- **구글**: 원화를 직접 설정합니다. 세 가격 모두 가능합니다.
- **애플**: 2만 원까지는 100원 단위 가격 포인트가 있어 `₩2,900` · `₩9,900` · `₩19,900`
  모두 가능할 것입니다. ⚠ **미확인** — 애플 개발자 공지(2023) 원문을 확인하지 못했습니다.
  계정 승인 후 App Store Connect 의 가격표에서 확인하십시오.
- **애플 기준 국가를 대한민국으로** 두십시오. 그러지 않으면 환율에 따라 가격이 자동
  조정됩니다. ⚠ 이것도 계정 승인 후 화면에서 확인해야 합니다.

### 5-4-5. 첫 구매 상품 제한 — **서버가 판정합니다**

`verified_purchases_first_pack_once` 부분 유니크 인덱스가 DB 수준에서 강제합니다
(`20260834000000_iap.sql:37`). 클라이언트가 우겨도 두 번째 `DUK_FIRST_20` 은
**insert 가 실패**합니다. 화면의 `firstOnly` 플래그는 표시용입니다.

### 5-4-6. 구글 서버 검증 — 순서와 재시도

**Play Developer API(서비스 계정)** 로 `purchases.products.get` → 검증 → 지급 → 소비.

```
① 클라이언트가 구매 → purchaseToken 획득
② verify-purchase Edge 호출 (JWT 필요)
③ Edge: Play Developer API 로 토큰 검증  ─ 실패 → 402/400, 지급 없음
④ Edge: record_verified_purchase(...)     ─ external_transaction_id 유니크로 멱등
⑤ Edge: 지급 성공 응답
⑥ 클라이언트가 consume(purchaseToken)     ─ 실패해도 ④ 는 이미 끝남
```

⚠ **3일 안에 승인·소비하지 않으면 구글이 자동 환불합니다.** (미확인 — Play 문서
원문 미확인. 콘솔 도움말로 확인하십시오.)

| 단계 | 실패 시 |
|---|---|
| ③ 검증 | 지급하지 않습니다. 클라이언트가 재시도(지수 백오프 3회). 계속 실패하면 미소비 상태로 남고 구글이 환불합니다 |
| ④ 지급 | 같은 `purchaseToken` 으로 재호출 — 유니크 인덱스가 중복 지급을 막습니다. `{already:true}` 를 그대로 성공으로 봅니다 |
| ⑥ 소비 | ⚠ **가장 위험한 자리.** 지급은 됐는데 소비가 안 되면 3일 뒤 자동 환불 → RTDN 이 오고 `record_revocation` 이 회수합니다. 앱 시작 시 **미소비 구매를 다시 훑어** 소비를 재시도해야 합니다 |

### 5-4-7. 환불·취소 — **"이미 쓴 덕" 은 이미 설계돼 있습니다**

⚠ 지시서는 이것을 `[오너 결정]` 후보로 올렸지만, **코드를 읽어 보니 설계가 있습니다.**
`record_revocation` (`20260834000000_iap.sql:107-138`):

```
v_paid    := 현재 PAID 잔액
v_reverse := min(max(v_paid,0), 환불액)   -- 잔액으로 덮을 수 있는 만큼만 회수
v_debt    := 환불액 - v_reverse            -- 나머지는 duk_debt 행이 된다
```

- **잔액을 마이너스로 만들지 않습니다.** 부족분은 `duk_debt` 에 부채로 쌓입니다.
- 다음 PAID 지급이 그 부채를 먼저 상계합니다
  (`20260843000000_duk_ledger_debt_offset_reason.sql`).
- 같은 `external_revocation_id` 는 한 번만 처리됩니다(유니크 인덱스).

**→ [오너 결정] 아님. 설계 있음.** 남는 질문은 하나뿐입니다:
**부채가 있는 사용자에게 무엇을 보여 줄 것인가** — 지금 화면에 부채 표시가 없습니다.
그건 UX 결정이고 다음 지시서 항목입니다.

### 5-4-8. 첫 업로드 계획

⚠ **인앱 상품을 만들려면 결제 권한(`com.android.vending.BILLING`)이 들어간 빌드가 Play
Console 에 올라가 있어야 합니다.** (미확인 — 콘솔에서 확인하십시오. 과거에는 그랬습니다.)

순서:

1. `expo-iap` 설치 → (필요하면) config plugin → **EAS 빌드 1회** (AAB, production 프로필)
2. Play Console → 테스트 → **내부 테스트** 트랙에 업로드
3. **Play 앱 서명** 사용 (권장). **EAS 키스토어를 업로드 키**로 등록합니다
   - `eas credentials` 로 현재 키스토어를 내려받아 그 인증서를 업로드 키로 등록
   - ⚠ 키스토어를 잃어버리면 업데이트를 못 올립니다. EAS 가 보관하지만 **백업을 받아
     두십시오**
4. 업로드가 끝나야 **수익 창출 → 제품 → 인앱 상품**에서 상품을 만들 수 있습니다
5. 상품 3종 생성 → 실제 ID 를 `product_catalog_seed.TEMPLATE.sql` 에 채워 staging 적용
6. 라이선스 테스터 등록 → 실결제 없이 구매 흐름 확인

### 5-4-9. 애플 쪽 — 계정 승인 후

공통과 분리합니다.

| 공통 (지금 설계 가능) | 애플 전용 (계정 후) |
|---|---|
| `product_catalog` 매핑 · 멱등 지급 · 부채 상계 | StoreKit 2 구매 흐름 |
| `verify-purchase` 의 라우팅과 응답 형태 | App Store Server API 로 영수증 검증 |
| 미소비 구매 재훑기 | 알림 V2(`apple-notifications-v2`) 서명 검증 |
| 화면(팩 선택 · 결과 · 오류) | Sign in with Apple 실기기 확인 |

### 5-4-10. 합성 반례 테스트 계획

| 반례 | 기대 |
|---|---|
| 같은 `purchaseToken` 두 번 | 지급 1회. 2회차는 `{already:true}` |
| 위조 토큰 | 검증 실패 → 지급 0 |
| **다른 패키지**의 토큰 | 검증 실패 → 지급 0 (packageName 대조) |
| 환불 후 같은 토큰 재사용 | 지급 0 (`verified_purchases` 유니크) |
| 동시 요청 2건 (같은 토큰) | 지급 1회 (유니크 인덱스가 경합을 결정) |
| 지급 성공 + 소비 실패 | 잔액은 늘어 있고, 재시작 시 소비 재시도. 3일 뒤 환불되면 `record_revocation` 이 회수 |
| **첫 팩 두 번** | 2회차 실패 (부분 유니크 인덱스) |
| 부채 상태에서 새 구매 | 부채 먼저 상계, 나머지만 사용 가능 |

### 5-4-11. 순매출 기준 덕 가치

⚠ 부가세 10% 는 **판매가에 포함**돼 있다고 보고 역산했습니다(국내 앱마켓 관행).
수수료는 **부가세 제외 금액**에 붙는다고 가정했습니다. **이 두 가정 모두 미확인**입니다 —
스토어 정산서로 확인해야 합니다.

| 상품 | 판매가 | 부가세 제외 | 수수료 15% 시 순매출 | 덕당 | 수수료 30% 시 순매출 | 덕당 |
|---|---|---|---|---|---|---|
| 첫 충전 20덕 | ₩2,900 | ₩2,636 | **₩2,241** | **₩112** | **₩1,845** | **₩92** |
| 기본 50덕 | ₩9,900 | ₩9,000 | **₩7,650** | **₩153** | **₩6,300** | **₩126** |
| 넉넉 120덕 | ₩19,900 | ₩18,091 | **₩15,377** | **₩128** | **₩12,664** | **₩106** |

**현재 마진 표시는 총액 기준입니다.** 관리자 원가 화면의 마진은 오너가 넣는
`DUK_KRW` 환율 한 줄을 씁니다(`fx_rate` 의 `DUK_KRW` 행). 지금 제안값 **198원**은
`₩9,900 / 50덕` = 총액 기준입니다. **순매출로 보려면 위 표의 덕당 값을 넣어야 합니다.**

**→ [오너 결정]**: `DUK_KRW` 를 총액(198원)으로 둘지 순매출(126~153원)로 둘지.
⚠ 순매출로 두면 **마진이 지금 보이는 것보다 나빠 보입니다.** 그것이 실제입니다.

**수수료 15% 조건** (둘 다 **미확인** — 원문 확인 못 함):
- 애플 **Small Business Program** 은 신청해야 하고, 전년도 매출 100만 달러 이하 조건이
  있다고 알려져 있습니다. **신청 전에는 30% 입니다.**
- 구글은 연 100만 달러까지 15% 가 자동 적용된다고 알려져 있습니다.

⚠ 둘 다 콘솔에서 확인하십시오. **확인 전에는 30% 로 계산하는 것이 안전합니다.**

### 5-4-12. 다음 지시서(구현) 작업 목록

| # | 파일 | 규모 |
|---|---|---|
| 1 | `package.json` — `expo-iap` 추가 ⚠ 보호 파일, 오너가 적용 | 1줄 |
| 2 | `app.json` — config plugin (필요 시) ⚠ 보호 파일, CTO 승인 | 1줄 |
| 3 | `src/features/duk/iap/expoIapAdapter.ts` — 새 어댑터 | ~150줄 |
| 4 | `src/features/duk/iap/nativeStore.ts` — 어댑터 교체 | ~10줄 |
| 5 | `supabase/functions/verify-purchase/index.ts` — 구글 검증기 본체 | ~200줄 |
| 6 | `supabase/functions/google-rtdn/index.ts` — Pub/Sub 서명 검증 + `record_revocation` | ~150줄 |
| 7 | 미소비 구매 재훑기 (앱 시작 훅) | ~60줄 |
| 8 | 충전 화면 실구매 배선 (`src/app/duk-topup.tsx`) | ~100줄 |
| 9 | 합성 반례 테스트 8종 | ~250줄 |
| 10 | 부채 표시 UX ⚠ [오너 결정] 뒤 | ~60줄 |
| — | **애플 쪽 (계정 후)** | 5·6 과 같은 규모 |

**총 규모 추정: 구글까지 ~1,000줄 · EAS 빌드 2~3회.**
