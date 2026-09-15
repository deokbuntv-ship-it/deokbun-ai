# 오너 런북 — 안드로이드 결제 (2026-09-11)

> 코드는 다 붙었습니다. **남은 것은 전부 콘솔 설정과 시크릿입니다.**
>
> ⚠ 지금 상태에서 결제를 시도하면 서버가 **`NOT_CONFIGURED` 로 거절**합니다 (staging 실측 11/11).
> 키가 없으면 지급하지 않는 것이 설계입니다 — 고장이 아닙니다.

---

## 0. 지금 무엇이 되어 있나

| | 상태 |
|---|---|
| 클라이언트 구매 흐름 (구매 → 서버 검증 → 결과) | **완료** — `duk-topup` 화면 |
| 미처리 구매 복구 (앱 재시작 시) | **완료** — 화면 진입 시 자동 |
| 서버 검증 `verify-purchase` (구글) | **완료** — Play Developer API |
| 환불·취소 `google-rtdn` | **완료** — Pub/Sub 인증 + 권위 조회 + `record_revocation` |
| 승인 재시도 · 3일 감시 `iap-reconcile` | **완료** — 크론 워커 |
| 첫 구매 평생 1회 | **이미 있었음** — DB 부분 유니크 인덱스 |
| 중복 지급 차단 | **이미 있었음** — `external_transaction_id` 유니크 |
| **Play Console 설정** | **오너 할 일** — 아래 |
| **시크릿** | **오너 할 일** — 아래 |
| **`app.json` 플러그인 한 줄** | **오너 할 일** — 아래 ⓪ |

---

## ⓪ 먼저 — `app.json` 한 줄 (보호 파일이라 대신 못 넣었습니다)

`expo-iap` 는 config plugin 이 필요합니다. `npx expo install expo-iap` 가 자동으로 넣은
그 한 줄을, 보호 파일 규칙에 따라 **되돌려 두었습니다.**

diff: `C:\Development\owner_inputs\app.json.expo-iap.diff`

```json
"plugins": [
  "expo-router",
  [
    "expo-splash-screen",
    { "backgroundColor": "#208AEF", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }
  ],
  [
    "expo-notifications",
    { "color": "#208AEF" }
  ],
  "expo-iap"
]
```

⚠ **이 줄이 없는 빌드에서는 구매 버튼이 뜨지 않습니다.** 화면은 "준비 중" 그대로입니다 —
없는 기능을 있는 척하지 않도록 만들어 두었습니다. 넣은 뒤 다시 빌드해야 합니다.

---

## ① Play Console — 판매자 계정 (가장 오래 걸립니다. 먼저)

`docs/OWNER_RUNBOOK_PLAY_CONSOLE_2026-09-10.md` §A-2 를 그대로 따르십시오.
주소 반려 가능성(사업자등록증 vs 등기부등본)도 거기 적어 두었습니다.

## ② 결제 권한이 들어간 빌드 업로드

⚠ **인앱 상품을 만들려면 결제 권한이 들어간 빌드가 먼저 올라가 있어야 합니다.**

```bash
cd C:\Development\DeokbunAI-app
npx eas-cli@latest build --platform android --profile production
```

Play Console → 테스트 → **내부 테스트** → 새 버전 만들기 → AAB 업로드.

## ③ 인앱 상품 3종 만들기

Play Console → 수익 창출 → 제품 → **인앱 상품**

| 상품 ID | 이름 | 가격 | 내부 키 (서버) |
|---|---|---|---|
| `duk_first_20` | 첫 충전 20덕 | ₩2,900 | `DUK_FIRST_20` |
| `duk_base_50` | 기본 50덕 | ₩9,900 | `DUK_BASE_50` |
| `duk_large_120` | 넉넉 120덕 | ₩19,900 | `DUK_LARGE_120` |

> ⚠ **상품 ID 는 한 번 만들면 바꾸거나 다시 쓸 수 없습니다.** 위 표의 왼쪽 칸을
> **글자 그대로** 넣으십시오. 앱이 이 id 로 요청합니다
> (`src/features/duk/iap/purchaseUiText.ts`).
>
> ⚠ 소문자·숫자·밑줄·마침표만 됩니다. 그래서 경제 계약의 대문자 키(`DUK_BASE_50`)를
> 그대로 쓸 수 없고, **매핑**으로 풀었습니다 — 경제 계약 테스트는 한 글자도 안 건드렸습니다.

## ④ 서버 카탈로그 채우기 (staging 먼저)

상품을 만든 뒤, Supabase **staging** SQL Editor 에서:

```sql
insert into public.product_catalog (provider, store_product_id, internal_product_key, grant_type, grant_amount, lifetime_once, active) values
  ('GOOGLE', 'duk_first_20',  'DUK_FIRST_20',  'DUK', 20,  true,  true),
  ('GOOGLE', 'duk_base_50',   'DUK_BASE_50',   'DUK', 50,  false, true),
  ('GOOGLE', 'duk_large_120', 'DUK_LARGE_120', 'DUK', 120, false, true)
on conflict (provider, store_product_id) do nothing;

-- 확인: 세 줄이 나오고 수량이 20/50/120 이어야 합니다.
select store_product_id, internal_product_key, grant_amount, lifetime_once, active
  from public.product_catalog where provider = 'GOOGLE' order by grant_amount;
```

⚠ **지급 수량은 이 표가 정합니다.** 앱이 보낸 값이 아닙니다. 여기가 틀리면 잘못된 수량이
나갑니다 — 넣은 뒤 위 확인 조회를 꼭 보십시오.

## ⑤ 서비스 계정 만들기 (서버 검증용)

1. Play Console → 설정 → **API 액세스** → Google Cloud 프로젝트 연결
2. **서비스 계정 만들기** → Google Cloud 콘솔에서 만들고 **JSON 키** 다운로드
3. Play Console 로 돌아와 그 서비스 계정에 권한 부여:
   - **재무 데이터 보기**
   - **주문 및 구독 관리**
4. ⚠ **JSON 키를 레포에 넣지 마십시오.** 아래 ⑥ 에서 Edge 시크릿으로만 넣습니다.

## ⑥ 시크릿 넣기

```bash
cd C:\Development\DeokbunAI-app

# staging 먼저
npx supabase secrets set GOOGLE_PLAY_PACKAGE_NAME=com.deokbun.app --project-ref aephpsiurgkvqcswyeie
npx supabase secrets set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON="$(cat /경로/service-account.json)" --project-ref aephpsiurgkvqcswyeie
```

> ⚠ JSON 을 통째로 넣습니다. 따옴표 안에 그대로 들어가야 합니다.
> ⚠ CLI 는 넣은 값을 **해시로만** 보여 줍니다 — 원문을 확인할 방법이 없으니 한 번에 정확히.

RTDN 인증용 (⑧ 에서 만든 값):

```bash
npx supabase secrets set GOOGLE_RTDN_AUDIENCE="<Pub/Sub 구독에 설정한 audience>" --project-ref aephpsiurgkvqcswyeie
npx supabase secrets set GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL="<Pub/Sub 서비스 계정 이메일>" --project-ref aephpsiurgkvqcswyeie
```

⚠ `GOOGLE_RTDN_AUDIENCE` 가 없으면 `google-rtdn` 은 **아무 통지도 처리하지 않습니다**(503).
검증할 수 없는 요청으로 덕을 회수하지 않기 위해서입니다. 설정 전까지 환불 처리는 수동입니다.

## ⑦ 라이선스 테스터 등록

Play Console → 설정 → **라이선스 테스트** → 테스터 계정(구글 이메일) 추가.

⚠ 라이선스 테스터의 구매는 **실제로 청구되지 않습니다.** 서버는 그것을
`verified_purchases.is_test = true` 로 기록하므로 매출 집계에서 걸러집니다.

## ⑧ RTDN (실시간 개발자 알림) 연결

1. Google Cloud 콘솔 → Pub/Sub → **주제 만들기** (예: `deokbun-rtdn`)
2. 그 주제에 Play 의 서비스 계정(`google-play-developer-notifications@system.gserviceaccount.com`)에
   **게시자** 권한 부여
3. Play Console → 수익 창출 설정 → **실시간 개발자 알림** → 주제 이름 입력 → **테스트 알림 보내기**
4. Pub/Sub → 주제 → **푸시 구독 만들기**
   - 엔드포인트: `https://aephpsiurgkvqcswyeie.supabase.co/functions/v1/google-rtdn`
   - **인증 사용** 체크 → 서비스 계정 선택 → **대상(audience)** 에 임의의 문자열 지정
     (그 값을 ⑥ 의 `GOOGLE_RTDN_AUDIENCE` 에 넣습니다)

## ⑨ 승인 재시도 크론 걸기

⚠ **3일 안에 승인되지 않으면 구글이 자동 환불합니다.** `verify-purchase` 가 지급 직후
승인을 시도하지만, 그 한 번이 실패할 수 있습니다. 이 크론이 그 창을 지킵니다.

Supabase → Database → **Cron Jobs** (또는 외부 스케줄러)에서 **1시간마다**:

```
POST https://aephpsiurgkvqcswyeie.supabase.co/functions/v1/iap-reconcile
헤더: x-cron-secret: <CRON_SECRET 값>
```

기대 응답: `{"ok":true,"status":"RAN","scanned":N,"acknowledged":M,"failed":0}`
키가 없으면 `{"ok":true,"status":"NOT_CONFIGURED","scanned":0}` — 0건을 "할 일 없음" 으로
보이지 않게 상태를 함께 줍니다.

---

## ⑩ 실구매 테스트 절차 (staging)

> ⚠ 이번 묶음에서 **실구매 E2E 는 하지 않았습니다**(지시서 제외 항목). 아래는 오너가 할 순서입니다.

1. ⓪ 의 `app.json` 줄을 넣고 `--profile internal` 로 APK 를 다시 빌드
2. 라이선스 테스터로 등록된 구글 계정으로 폰에 로그인
3. APK 설치 → 로그인 → **덕 충전** 화면
4. "준비 중" 대신 **구매** 버튼이 보이는지 확인
   - 안 보이면 ⓪ 이 빌드에 안 들어간 것입니다
5. `기본 50덕` 구매 → 결제창 → 완료
6. **확인할 것**

   | # | 확인 | 어디서 |
   |---|---|---|
   | 1 | 화면에 "충전이 완료됐어요" | 앱 |
   | 2 | 덕이 50 늘었다 | 앱 지갑 |
   | 3 | 구매가 1건만 기록됐다 | SQL 아래 |
   | 4 | 테스트 구매로 표시됐다 | SQL 아래 |
   | 5 | 승인이 끝났다 | SQL 아래 |

   ```sql
   select external_transaction_id, internal_product_key, granted_duk,
          is_test, acknowledged, retry_count, created_at
     from public.verified_purchases order by created_at desc limit 5;
   ```

   기대: 1행 · `granted_duk = 50` · `is_test = true` · `acknowledged = true`

7. **⚠ 같은 상품을 한 번 더 구매**해 보십시오 → 새 거래 id 로 정상 지급돼야 합니다
   (중복 방지는 **같은 거래 id** 에 대한 것이지 같은 상품에 대한 것이 아닙니다)
8. **⚠ 첫 충전(20덕)을 두 번** 사 보십시오 → 두 번째는 거절돼야 합니다
   (앱 문구: "이미 처리된 결제예요")
9. **환불 테스트**: Play Console → 주문 관리 → 그 주문 환불 →
   몇 분 뒤 `duk_ledger` 에 `REVERSAL` 행 또는 `duk_debt` 행이 생기는지 확인

   ```sql
   select bucket, delta, reason, created_at from public.duk_ledger
    where user_id = '<테스터 user_id>' order by created_at desc limit 10;
   select * from public.duk_debt where user_id = '<테스터 user_id>';
   ```

---

## ⑪ production 으로 옮길 때

⚠ **CTO 판정 후.** 순서가 중요합니다.

1. DB 마이그레이션 (`docs/OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md`)
2. Edge 배포: `verify-purchase` · `google-rtdn` · `iap-reconcile`
3. production 시크릿 (⑥ 과 같은 값, `--project-ref olvkpaldrwvtexxpoaag`)
4. production `product_catalog` 채우기 (④ 와 같은 SQL)
5. RTDN 구독 엔드포인트를 production URL 로
6. 크론을 production 으로

⚠ **순서를 바꾸면 기능이 깨집니다.** 새 코드가 새 DB 객체를 씁니다.

---

## 부록 — 이 흐름이 지키는 것 (검토용)

| 원칙 | 어디서 지키나 |
|---|---|
| 1. 지급은 서버만 | `verify-purchase` 만 `record_verified_purchase` 를 부른다. 클라이언트는 불투명 토큰만 보낸다 |
| 2. 검증 → 지급 → 승인 | Edge 의 실행 순서. 계약 테스트가 `record_verified_purchase` 가 `acknowledgeProduct` 보다 앞인지 본다 |
| 2. 같은 토큰 두 번 지급 불가 | `verified_purchases_external_uniq` (DB) |
| 3. 검증 못 하면 지급 없음 | `readPlayConfig()` 가 null 이면 `NOT_CONFIGURED` 로 끝 (staging 실측) |
| 4. 소비 실패 재시도·3일 감시 | `iap-reconcile` + `iap_pending_acknowledgements` (3일 창) |
| 5. 환불 → `record_revocation` | `google-rtdn`. 잔액만큼 회수, 나머지는 `duk_debt` |
| 6. RTDN 인증 | `verifyPubSubPush` (OIDC audience). 실패한 요청은 `admin_audit_log` 에 기록 |
| 7. 테스트/실구매 구분 | `verified_purchases.is_test` |
| 8. 경제 계약 불변 | 상품 ID 매핑 (`purchaseUiText.ts`). `economyContractV1.test.ts` 미수정 |
| 9. 첫 구매 자격은 서버 | `verified_purchases_first_pack_once` 부분 유니크 인덱스 |
| 10. 미성년 결제 제한 UI 없음 | 만들지 않았습니다. 정책 초안은 보고서 부록 B |
