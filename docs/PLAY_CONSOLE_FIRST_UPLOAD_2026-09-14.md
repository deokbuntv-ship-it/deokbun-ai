# Play Console 첫 업로드 준비 — 한 장 (2026-09-14)

> production 세션(통합 적용 패키지 ①~⑧)이 **끝난 뒤**, 판매자 계정 준비가 된 다음에 합니다.
> 자세한 화면 경로는 `docs/OWNER_RUNBOOK_IAP_2026-09-11.md`(결제) · `docs/OWNER_RUNBOOK_PLAY_CONSOLE_2026-09-10.md`(앱 만들기)에 있고,
> 이 장은 **production 기준 값과 순서**만 적습니다. 순서가 중요합니다 — **결제 권한이 든 빌드가 먼저 올라가야 인앱 상품을 만들 수 있습니다.**

| 항목 | 값 |
|---|---|
| 패키지 이름 | `com.deokbun.app` (`app.json`) |
| 빌드 프로필 | `production` — store 배포 · **AAB** · `versionCode` 는 EAS 가 자동으로 올린다(`appVersionSource: remote` · `autoIncrement`) · production Supabase 를 본다 |
| 결제 권한 | `expo-iap` 플러그인이 넣는다(`app.json` plugins — 오너 적용 · 묶음 3·4 커밋) |

## 순서

**1. AAB 빌드 — ⚠ 커밋한 뒤에** (EAS 는 커밋 안 된 변경도 올리면서 기록엔 HEAD 만 남긴다 — 패키지 ⑨)

```bash
cd C:\Development\DeokbunAI-app
git status --short
npx eas-cli@latest build --platform android --profile production
```
기대: `git status --short` 가 아무것도 출력하지 않는다. 🛑 무엇이든 나오면 빌드하지 않는다.

**2. 내부 테스트 트랙 · Play 앱 서명** — Play Console → 테스트 → **내부 테스트** → 새 버전 → AAB 업로드
- 첫 업로드 때 **Play 앱 서명**(Google 이 앱 서명 키 관리 — 기본값)을 켠다. EAS 키스토어는 **업로드 키**가 된다.
- ⚠ 키스토어 백업: `npx eas-cli@latest credentials --platform android` → 내려받아 안전한 곳에. 잃으면 업데이트를 못 올린다.
- ⚠ **새 앱의 첫 AAB 는 콘솔에서 손으로 올린다**(API 제출은 그 뒤부터).
- ⚠ 테스트 폰: EAS 내부 APK(서명: EAS 키)와 Play 에서 받은 앱(서명: Google 앱 서명 키)은 **서명이 달라 덮어 설치가 안 된다** — 한쪽을 지우고 설치.
- 앱 링크를 켤 때(지금은 꺼져 있다 — `app.json` 에 `intentFilters` 없음) `public/.well-known/assetlinks.json` 의 자리표시자에는
  **Play 앱 서명 키**의 SHA-256 을 넣는다(업로드 키가 아니다).

**3. 인앱 상품 3개** — 수익 창출 → 제품 → 인앱 상품 (⚠ 상품 ID 는 만든 뒤 못 바꾸고 재사용도 안 된다 · 글자 그대로)

| 상품 ID | 이름 (구글 제목) | 설명 | 가격 | 서버 내부 키 · 지급 |
|---|---|---|---|---|
| `duk_first_20` | 첫 충전 20덕 | 처음 한 번만 살 수 있는 20덕 묶음이에요. 상담·궁합·프리미엄 리포트에 쓸 수 있어요. | ₩2,900 | `DUK_FIRST_20` · 20 · 한 번만 |
| `duk_base_50` | 기본 50덕 | 상담·궁합·프리미엄 리포트에 쓸 수 있는 50덕 묶음이에요. | ₩9,900 | `DUK_BASE_50` · 50 |
| `duk_large_120` | 넉넉 120덕 | 상담·궁합·프리미엄 리포트에 쓸 수 있는 120덕 묶음이에요. | ₩19,900 | `DUK_LARGE_120` · 120 |

근거: 상품 ID `src/features/duk/iap/purchaseUiText.ts` · 이름·설명 `docs/STORE_LISTING_COPY_2026-09-13.md` §3(계약 테스트) · 가격 `TOPUP_PACKS`.
그다음 **production** `product_catalog` 에 같은 세 줄 — `docs/OWNER_RUNBOOK_IAP_2026-09-11.md` ④ 의 SQL 을 production SQL 편집기에서
그대로(지급 수량은 이 표가 정한다 · 넣은 뒤 확인 조회로 20/50/120 확인).

**4. 라이선스 테스터** — 설정 → 라이선스 테스트 → 테스터 구글 계정 추가. 이 계정의 구매는 **청구되지 않고**
서버에 `is_test = true` 로 남는다(매출 집계에서 빠진다).

**5. 서비스 계정 → 시크릿 → RTDN** (이 순서)
1. 설정 → API 액세스 → Google Cloud 프로젝트 연결 → 서비스 계정 만들기 → JSON 키 → Play Console 에서 **재무 데이터 보기 · 주문 및 구독 관리** 권한
2. production 시크릿 — `GOOGLE_PLAY_PACKAGE_NAME=com.deokbun.app` · `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`(JSON 통째로) ·
   `CRON_SECRET`(이미 있음 — 확인만). ⚠ JSON 키는 레포 · 채팅에 넣지 않는다
3. Pub/Sub 주제 만들기 → `google-play-developer-notifications@system.gserviceaccount.com` 에 **게시자** 권한 →
   Play Console → 수익 창출 설정 → **실시간 개발자 알림** → 주제 이름 → 테스트 알림
4. 푸시 구독: 엔드포인트 = production `functions/v1/google-rtdn` · **인증 사용**(서비스 계정 · audience 지정) →
   그 두 값을 `GOOGLE_RTDN_AUDIENCE` · `GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL` 시크릿으로. ⚠ audience 가 없으면 `google-rtdn` 은
   아무 통지도 처리하지 않는다(503) — 그동안 환불 회수는 수동
5. 승인 재시도 크론 — 1시간마다 `iap-reconcile` (`x-cron-secret`) — ⚠ **3일 안에 승인되지 않은 구매는 구글이 자동 환불한다**

**6. 실구매 테스트** (내부 테스트 트랙 앱 · production)
1. 라이선스 테스터 계정으로 폰 로그인 → Play 에서 내부 테스트 앱 설치 → **덕 충전**에 "구매" 버튼이 보이는가
2. `기본 50덕` 구매 → "충전이 완료됐어요" · 지갑 +50 · `verified_purchases` 1행(`granted_duk = 50` · `is_test = true` · `acknowledged = true`)
3. 같은 상품 한 번 더 → 새 거래로 정상 지급 · `첫 충전 20덕` 두 번 → 두 번째는 거절("이미 처리된 결제예요")
4. **실제 결제 1건**(테스터가 아닌 오너 계정 · 가장 싼 `첫 충전 20덕`) → `is_test = false` · 승인 완료 확인
5. Play Console → 주문 관리 → 그 주문 **환불** → 몇 분 뒤 `duk_ledger` 에 `REVERSAL` 또는 `duk_debt` 행 (RTDN 이 동작한다는 증거)
6. 🛑 2 에서 덕이 안 들어오거나 5 에서 아무 행도 안 생기면 멈추고 CTO — 시크릿 · 카탈로그 · RTDN 중 하나가 빠진 것
