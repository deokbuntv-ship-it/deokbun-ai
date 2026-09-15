# 애플 로그인 — 오너 설정 안내

> **📍 문서 권위 (2026-09-04 확정)** — **애플 로그인 설정의 단계별 화면 안내**를 소유한다. 언제 해야 하는지·다른 작업과의 순서는 `OWNER_TODO.md` A4.
> 전체 서열: `OWNER_TODO.md`(오너 액션) · `PROJECT_STATE.md`(운영 상태) · `FEATURE_MASTER_CHECKLIST.md`(기능 판정) · `KNOWN_RISKS.md`(위험) · `BACKLOG_V1_1.md`(V1.1) · `DATABASE_RUNBOOK.md`(DB 적용 절차).
> 충돌 시 판정 순서: **코드 → 테스트/빌드 → 라이브 스키마·배포 실측 → git 이력 → 프로덕션 E2E → 문서.**


작성: 2026-09-02 · **코드는 전부 끝났습니다.** 이 문서는 Apple Developer 계정이 생긴 뒤 오너가 밟을 단계입니다.

지금 앱을 실행하면 애플 버튼이 보이고, 누르면 "아직 로그인 설정이 완료되지 않았어요"가 뜹니다.
아래를 마치면 그대로 동작합니다. **코드를 다시 건드릴 일은 없습니다** — `app.json` 한 곳만 예외이고,
그 diff 는 §4 에 그대로 붙여 넣을 수 있게 적어 뒀습니다.

---

## 0. 먼저 알아야 할 것

| | |
|---|---|
| **비용** | Apple Developer Program **연 $99**. 이것 없이는 어떤 단계도 진행 불가 |
| **시뮬레이터로 되나** | ❌ **안 됩니다.** Sign in with Apple 은 실기기 + 로그인된 Apple ID 가 필요합니다 |
| **Expo Go 로 되나** | iOS Expo Go 에서 네이티브 시트는 동작하지만, **번들 ID 가 Expo Go 의 것**이라 우리 앱 계정으로 붙지 않습니다. 실제 검증은 **개발 빌드 또는 EAS 빌드** 필요 |
| **웹은 지금도 되나** | Apple Developer 설정(§1·§2)만 끝나면 **빌드 없이** 웹에서 바로 됩니다 — 웹은 Supabase provider 흐름을 타기 때문입니다 |
| **소요** | Apple 콘솔 ~40분 + Supabase ~10분 + EAS 빌드 대기 |

**순서가 중요합니다.** §1 → §2 → §3 → §4 → §5. 앞 단계의 산출물이 다음 단계의 입력입니다.

---

## 1. Apple Developer 콘솔 (약 40분)

<https://developer.apple.com/account>

### 1-1. App ID 에 Sign in with Apple 켜기

**Certificates, Identifiers & Profiles → Identifiers → App IDs**

1. `com.deokbun.app` 을 찾습니다. 없으면 **＋** → App IDs → App → Bundle ID 에 `com.deokbun.app` 입력
2. Capabilities 목록에서 **Sign in with Apple** 체크
3. **Edit** → "Enable as a primary App ID" 선택 → Save

> 이 번들 ID 는 `app.json` 의 `ios.bundleIdentifier` 와 **정확히 같아야** 합니다. 현재 값은 `com.deokbun.app`.

### 1-2. Service ID 만들기 (웹·Supabase 용)

네이티브 iOS 는 App ID 로 동작하지만, **Supabase 를 통한 웹 로그인은 Service ID 가 따로 필요**합니다.

**Identifiers → ＋ → Services IDs**

| 항목 | 값 |
|---|---|
| Description | `DeokbunAI Web Sign In` (자유) |
| Identifier | **`com.deokbun.app.web`** ← 이 값을 적어 두세요. Supabase 의 **Client ID** 가 됩니다 |

만든 뒤 그 Service ID 를 **Edit** → **Sign in with Apple** 체크 → **Configure**:

| 항목 | 값 |
|---|---|
| Primary App ID | `com.deokbun.app` |
| Domains and Subdomains | `<프로젝트ref>.supabase.co` |
| Return URLs | `https://<프로젝트ref>.supabase.co/auth/v1/callback` |

> `<프로젝트ref>` 는 staging 이 **`aephpsiurgkvqcswyeie`**, 프로덕션은 **`olvkpaldrwvtexxpoaag`** 입니다.
> **두 환경을 다 쓰려면 Return URL 을 둘 다 등록**하거나 Service ID 를 환경별로 하나씩 만드세요.
> (권장: staging 으로 먼저 검증하고, 프로덕션 승격 때 URL 추가)

### 1-3. 키(.p8) 발급

**Keys → ＋**

1. Key Name: `DeokbunAI Sign in with Apple`
2. **Sign in with Apple** 체크 → **Configure** → Primary App ID = `com.deokbun.app` → Save
3. **Continue → Register → Download**

⚠ **.p8 파일은 단 한 번만 내려받을 수 있습니다.** 잃어버리면 키를 폐기하고 새로 만들어야 합니다.
안전한 곳(비밀번호 관리자)에 보관하세요. **레포에 넣지 마세요.**

내려받은 뒤 **적어 둘 값 3개**:

| 값 | 어디서 보나 |
|---|---|
| **Key ID** | 키 상세 화면 (10자, 예 `ABC123DEFG`) |
| **Team ID** | 우측 상단 계정 이름 옆 / Membership 페이지 (10자) |
| **.p8 파일 내용** | 내려받은 `AuthKey_XXXXXXXXXX.p8` 를 텍스트 편집기로 연 전체 (`-----BEGIN PRIVATE KEY-----` 포함) |

---

## 2. Supabase 대시보드 (약 10분)

**Authentication → Providers → Apple** (staging 프로젝트 `aephpsiurgkvqcswyeie` 부터)

1. **Enable Sign in with Apple** 켜기
2. 입력:

| 필드 | 넣을 값 |
|---|---|
| **Client IDs** | **`com.deokbun.app.web`** 과 **`com.deokbun.app`** 을 **둘 다**, 쉼표로 구분 |
| **Secret Key (for OAuth)** | .p8 파일 내용 전체 |
| **Team ID** | §1-3 의 Team ID |
| **Key ID** | §1-3 의 Key ID |

> **Client IDs 에 둘 다 넣는 이유**: 웹 흐름의 토큰은 `aud = com.deokbun.app.web`(Service ID)로,
> iOS 네이티브 시트의 토큰은 `aud = com.deokbun.app`(App ID)로 옵니다. 하나만 넣으면 **다른 한쪽이
> "Unacceptable audience" 로 거부**됩니다. 이 앱은 두 경로를 다 쓰므로 둘 다 필요합니다.

3. **Save**
4. **Authentication → URL Configuration** 이 이미 되어 있는지 확인 (구글·카카오와 공유):
   - Site URL = `https://www.deokbunai.com`
   - Redirect URLs 에 `https://www.deokbunai.com/login-callback` 과 `https://www.deokbunai.com/**`

**여기까지 하면 웹 애플 로그인이 즉시 동작합니다.** 빌드 불필요.

---

## 3. 빌드 (EAS 필요)

iOS **네이티브 시트**는 entitlement 이 들어간 빌드가 있어야 합니다.

```bash
npx expo prebuild --clean      # app.json 의 플러그인이 네이티브 프로젝트에 반영됨
eas build --profile development --platform ios
```

- `expo-apple-authentication` 의 config 플러그인이 `com.apple.developer.applesignin` entitlement 을
  자동으로 넣습니다. **entitlements 파일을 손으로 만들 필요 없습니다.**
- 빌드 전에 **§4 의 `app.json` diff 를 반드시 반영**하세요. 안 하면 entitlement 이 빠져 네이티브 시트가
  실패하고, 코드가 조용히 웹 흐름으로 떨어집니다(실패는 아니지만 심사에서 지적될 수 있습니다).

---

## 4. `app.json` diff — 오너가 직접 반영

`app.json` 은 보호 파일이라 **제가 수정하지 않았습니다.** 아래를 그대로 적용하세요.

```diff
     "ios": {
       "icon": "./assets/expo.icon",
       "bundleIdentifier": "com.deokbun.app",
-      "supportsTablet": false
+      "supportsTablet": false,
+      "usesAppleSignIn": true
     },
@@
     "plugins": [
       "expo-router",
+      "expo-apple-authentication",
       [
         "expo-splash-screen",
```

전체 두 곳뿐입니다. 다른 변경은 없습니다.

- `ios.usesAppleSignIn: true` — Xcode 프로젝트에 Sign in with Apple capability 를 켭니다
- `"expo-apple-authentication"` 플러그인 — `com.apple.developer.applesignin` entitlement 을 주입합니다

> `package.json` 에는 이미 `expo-apple-authentication: ~57.0.1` 이 추가돼 있습니다(설치 완료).
> Expo SDK 57.0.9 에 맞춰 `npx expo install` 이 고른 버전입니다.

---

## 5. 테스트

| 대상 | 방법 | 필요한 것 |
|---|---|---|
| **웹** | `https://www.deokbunai.com/login` (또는 로컬 웹) → Apple 버튼 | §1·§2 만. **빌드 불필요** |
| **iOS 네이티브** | 개발 빌드를 **실기기**에 설치 → Apple 버튼 → 시스템 시트 | §1~§4 + 실기기 + 로그인된 Apple ID |
| **iOS 시뮬레이터** | ❌ 불가 | — |
| **Android** | Apple 버튼 → 브라우저 흐름 | §1·§2 만 |

**확인할 것 5가지**

1. 첫 로그인에서 **"이메일 가리기"를 선택**해 보세요 → `@privaterelay.appleid.com` 주소로 가입되고
   정상 진행돼야 합니다. (실패하면 안 됩니다 — 코드는 릴레이 주소를 정상 이메일로 취급합니다)
2. **같은 계정으로 재로그인** → 애플이 이름을 안 주지만 로그인은 되어야 합니다
3. **시트를 취소** → 에러 배너가 뜨지 않고 조용히 원위치여야 합니다
4. **iOS 로 가입한 계정으로 웹 로그인** → 같은 계정으로 들어가져야 합니다(별도 계정이 생기면 §2 의
   Client IDs 설정을 다시 보세요)
5. 브라우저 콘솔의 `[auth.diag] provider=apple stage=… code=…` 로 실패 단계를 볼 수 있습니다

**설정 전 증상**: Apple provider 가 꺼져 있으면 `OAUTH_URL_MISSING` → "아직 로그인 설정이 완료되지
않았어요". 이건 정상적인 미설정 상태이지 버그가 아닙니다.

---

## 6. 필요한 에셋 — 애플 로고

**지금은 없어도 동작합니다.** 버튼은 검정 배경 + `Apple로 계속하기` 로 렌더되고, 로고 슬롯은 비어 있습니다.

이건 애플만의 문제가 아닙니다 — `SocialButton` 은 **4종 전부** 마크 슬롯이 `null` 입니다
(`OFFICIAL_MARK_ASSET_PENDING`). 공식 로고를 임의로 그리거나 이모지로 흉내내지 않는다는 기존 방침이고,
저도 따랐습니다.

필요할 때 넣을 것:

| provider | 출처 |
|---|---|
| Apple |  마크. <https://developer.apple.com/design/resources/> 의 "Sign in with Apple" 자료. **검정 배경에는 흰색 마크** |
| Kakao / Naver / Google | 각 사 공식 브랜드 가이드 |

넣는 법: `SocialButton.tsx` 의 `PROVIDER` 표에서 `mark: null` → `mark: require('…/apple.png')`.
레이아웃은 이미 18×18 슬롯이 잡혀 있어 **다른 수정이 필요 없습니다.**

⚠ 애플 로고와 버튼 스타일은 Human Interface Guidelines 규정이 엄격합니다(색·여백·문구·최소 크기).
현재 검정 배경 + 흰 글씨 + "Apple로 계속하기" 는 규정에 맞는 조합이지만, **최종 확인은 오너가 HIG 를
보고 판단**해 주세요 — 이 레포에서 검증할 수 없는 항목입니다.

---

## 7. 코드에서 확인할 수 없어 오너가 확인해야 할 것

1. **버튼 배치 규정** — 현재 iOS 에서 애플을 **첫 번째**로 두었습니다. "다른 옵션과 동등하거나 그 이상으로
   눈에 띄게"라는 규정의 가장 안전한 해석입니다. 실제 심사 요구가 다르면 `login.tsx` 의
   `APPLE_FIRST_ON_IOS` 한 줄로 바뀝니다.
2. **iOS 외 플랫폼 노출** — 웹·안드로이드에도 애플 버튼을 넣었습니다. 이유는 **계정 이동성**입니다
   (iOS 로 가입한 사람이 웹에서 못 들어오면 안 됩니다). 숨기고 싶으면 말씀해 주세요.
3. **계정 삭제 요구** — 애플은 소셜 로그인을 제공하는 앱에 **앱 내 계정 삭제**를 요구합니다.
   이 앱에 계정 삭제 경로가 있는지 별도로 확인이 필요합니다(이번 트랙 범위 밖).
4. **Service ID 를 환경별로 나눌지** — staging 과 프로덕션이 Return URL 이 다릅니다. 하나에 둘 다
   등록할지, 두 개로 나눌지는 운영 취향입니다.
