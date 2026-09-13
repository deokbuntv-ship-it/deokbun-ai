# 스토어 문구 — 붙여 넣기용 (2026-09-13)

> **원본은 `src/features/legal/storeListingCopy.ts` 이고 이 문서는 거기서 생성했다.** 계약 테스트
> (`src/features/legal/__tests__/storeListingCopy.test.ts`)가 ① 칸 길이 ② 사실이 아닌 주장 ③ 가격·덕 수량이 코드와
> 같은지 ④ 이 문서와 원본이 글자까지 같은지를 잡는다. 문구를 바꿀 때는 **원본을 고치고 이 문서를 다시 생성**하십시오.
>
> 모든 문장은 `docs/PRODUCT_TRUTH_GUARD.md` 를 지나야 한다 — 코드로 확인되지 않는 주장은 쓰지 않는다(§5 표).

## 0. 칸 한도 (공식 문서 확인 2026-09-13)

| 곳 | 칸 | 한도 | 출처 |
|---|---|---|---|
| Google Play | 앱 이름 · 간단한 설명 · 자세한 설명 | 30 · 80 · 4000자 | [Play Console 도움말](https://support.google.com/googleplay/android-developer/answer/9859152) |
| Google Play | 출시 노트 | 500자 | Play Console 출시 화면 |
| Google Play | 인앱 상품 제목 · 설명 | 55(권장 25) · 200자 | [인앱 상품 만들기](https://support.google.com/googleplay/android-developer/answer/1153481) |
| App Store | 이름 · 부제 | 30 · 30자 | [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) |
| App Store | 프로모션 텍스트 · 설명 · 새로운 기능 | 170 · 4000 · 4000자 | [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information) |
| App Store | **키워드** | **100바이트** — 한글은 한 글자에 3바이트. 낱말은 두 글자 초과 · 앱 이름·다른 회사 이름 금지 | 같은 페이지 |
| App Store | 인앱 상품 표시 이름 · 설명 | 2~30 · 45자 | [In-App Purchase information](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information) |

⚠ 구글 메타데이터 정책: 제목·아이콘에 순위·가격·홍보 표현(최고, 1위, 무료, 할인 등)과 이모지를 쓰지 않는다.
이 문서는 본문에서도 "무료" 대신 "덕 없이" 로 쓴다.

---

## 1. Google Play — 기본 스토어 등록정보

Play Console → 앱 → **성장** → **기본 스토어 등록정보** · 출시 노트는 **출시** 화면.

### 앱 이름 — 3/30자

```text
덕분이
```

### 간단한 설명 — 44/80자

```text
생년월일시로 명식을 먼저 계산하고, 그 결과를 근거로 풀어 주는 AI 명리 상담
```

### 자세한 설명 — 932/4000자

```text
덕분이는 생년월일시로 명식을 먼저 계산하고, 그 계산 결과를 근거로 AI가 풀어서 설명해 드리는 명리 상담 앱이에요.

■ 계산이 먼저, 풀이는 그다음
· 사주(명리)를 중심으로, 태어난 시각과 질문에 따라 자미두수·기문둔갑 계산도 함께 참고해요.
· AI는 명식을 계산하지 않아요. 이미 계산된 결과를 받아 읽기 쉬운 말로 풀어 드릴 뿐이에요.
· 등록한 사람마다 만세력(사주 여덟 글자와 대운)을 직접 볼 수 있어요.

■ 할 수 있는 것
· 1:1 명리 상담 — 한 번 시작하면 24시간 동안 질문 5번까지 이어서 물어볼 수 있어요. (5덕)
· 궁합 — 두 사람의 명식을 나란히 놓고 정서·갈등·오행 보완을 살펴봐요. (12덕)
· 프리미엄 리포트 — 타고난 명식과 앞으로 열두 달의 흐름을 한 번에 정리해요. (50덕)
· 오늘의 운세 · 이번 달 운세 — 덕 없이 받아 보실 수 있어요.
· 운세우편함 — 받은 운세와 보고서를 모아 두고 다시 볼 수 있어요.

■ 덕 (앱 안에서 쓰는 단위)
· 처음 가입하시면 10덕을 드려요. 하루 한 번 촛불을 켜면 1덕이 쌓여요.
· 덕을 쓰기 전에, 필요한 덕과 쓰고 나서 남는 덕을 먼저 보여 드려요.
· 충전은 첫 충전 20덕(한 번만) · 기본 50덕 · 넉넉 120덕 세 가지예요.

■ 안심하고 쓰실 수 있게
· AI가 만든 해석이라는 것을 해석 화면마다 표시해요.
· 생년월일시와 상담 내용을 AI로 처리하기 전에 따로 동의를 받아요. 동의는 언제든 철회할 수 있어요.
· 부적절한 AI 답변은 답변마다 바로 신고할 수 있어요.
· 상담 기록과 보고서는 하나씩 직접 지울 수 있고, 계정 탈퇴도 앱 안에서 바로 할 수 있어요.

■ 참고해 주세요
· 덕분이의 해석은 참고용 정보예요. 의료·법률·투자 같은 전문적인 판단을 대신하지 않아요.
· 건강·수명처럼 명리로 답하지 않는 질문에는 답하지 않아요.
```

### 출시 노트 — 102/500자

```text
첫 출시 버전이에요.
· 명식 계산을 근거로 풀어 주는 1:1 상담 · 궁합 · 프리미엄 리포트
· 오늘의 운세 · 이번 달 운세
· 상담 기록과 보고서를 하나씩 직접 지울 수 있어요
```

---

## 2. App Store — 제품 페이지

App Store Connect → 앱 → **앱 정보**(이름·부제) · 버전 페이지(프로모션 텍스트·설명·키워드·새로운 기능).

### 이름 — 3/30자

```text
덕분이
```

### 부제 — 22/30자

```text
명식 계산을 근거로 풀어 주는 AI 상담
```

### 프로모션 텍스트 — 94/170자

```text
생년월일시로 명식을 먼저 계산하고, 그 결과를 근거로 AI가 풀어 드려요. 쓰기 전에 필요한 덕을 먼저 보여 드리고, 상담 기록과 보고서는 언제든 직접 지울 수 있어요.
```

### 설명 — 932/4000자

```text
덕분이는 생년월일시로 명식을 먼저 계산하고, 그 계산 결과를 근거로 AI가 풀어서 설명해 드리는 명리 상담 앱이에요.

■ 계산이 먼저, 풀이는 그다음
· 사주(명리)를 중심으로, 태어난 시각과 질문에 따라 자미두수·기문둔갑 계산도 함께 참고해요.
· AI는 명식을 계산하지 않아요. 이미 계산된 결과를 받아 읽기 쉬운 말로 풀어 드릴 뿐이에요.
· 등록한 사람마다 만세력(사주 여덟 글자와 대운)을 직접 볼 수 있어요.

■ 할 수 있는 것
· 1:1 명리 상담 — 한 번 시작하면 24시간 동안 질문 5번까지 이어서 물어볼 수 있어요. (5덕)
· 궁합 — 두 사람의 명식을 나란히 놓고 정서·갈등·오행 보완을 살펴봐요. (12덕)
· 프리미엄 리포트 — 타고난 명식과 앞으로 열두 달의 흐름을 한 번에 정리해요. (50덕)
· 오늘의 운세 · 이번 달 운세 — 덕 없이 받아 보실 수 있어요.
· 운세우편함 — 받은 운세와 보고서를 모아 두고 다시 볼 수 있어요.

■ 덕 (앱 안에서 쓰는 단위)
· 처음 가입하시면 10덕을 드려요. 하루 한 번 촛불을 켜면 1덕이 쌓여요.
· 덕을 쓰기 전에, 필요한 덕과 쓰고 나서 남는 덕을 먼저 보여 드려요.
· 충전은 첫 충전 20덕(한 번만) · 기본 50덕 · 넉넉 120덕 세 가지예요.

■ 안심하고 쓰실 수 있게
· AI가 만든 해석이라는 것을 해석 화면마다 표시해요.
· 생년월일시와 상담 내용을 AI로 처리하기 전에 따로 동의를 받아요. 동의는 언제든 철회할 수 있어요.
· 부적절한 AI 답변은 답변마다 바로 신고할 수 있어요.
· 상담 기록과 보고서는 하나씩 직접 지울 수 있고, 계정 탈퇴도 앱 안에서 바로 할 수 있어요.

■ 참고해 주세요
· 덕분이의 해석은 참고용 정보예요. 의료·법률·투자 같은 전문적인 판단을 대신하지 않아요.
· 건강·수명처럼 명리로 답하지 않는 질문에는 답하지 않아요.
```

### 키워드 — 100/100 바이트

```text
사주풀이,자미두수,기문둔갑,궁합보기,오늘의운세,월간운세,명리학,만세력
```

### 이번 버전의 새로운 기능 — 102/4000자

```text
첫 출시 버전이에요.
· 명식 계산을 근거로 풀어 주는 1:1 상담 · 궁합 · 프리미엄 리포트
· 오늘의 운세 · 이번 달 운세
· 상담 기록과 보고서를 하나씩 직접 지울 수 있어요
```

⚠ 첫 버전(1.0)에는 "새로운 기능" 칸이 없을 수 있다 — 업데이트부터 쓴다.

---

## 3. 인앱 상품 — 3개 (키는 앱 `TOPUP_PACKS` · 서버 `product_catalog` 와 같다)

가격은 콘솔에서 고른다 — 앱이 표시에 쓰는 참고가는 ₩2,900 · ₩9,900 · ₩19,900 (`src/features/duk/pricing.ts`).

### `DUK_FIRST_20` — 20덕

| 곳 | 칸 | 문구 | 길이 |
|---|---|---|---|
| Google Play | 제목 | 첫 충전 20덕 | 8/55 |
| Google Play | 설명 | 처음 한 번만 살 수 있는 20덕 묶음이에요. 상담·궁합·프리미엄 리포트에 쓸 수 있어요. | 50/200 |
| App Store | 표시 이름 | 첫 충전 20덕 | 8/30 |
| App Store | 설명 | 처음 한 번만 살 수 있는 20덕 묶음 | 21/45 |

### `DUK_BASE_50` — 50덕

| 곳 | 칸 | 문구 | 길이 |
|---|---|---|---|
| Google Play | 제목 | 기본 50덕 | 6/55 |
| Google Play | 설명 | 상담·궁합·프리미엄 리포트에 쓸 수 있는 50덕 묶음이에요. | 33/200 |
| App Store | 표시 이름 | 기본 50덕 | 6/30 |
| App Store | 설명 | 상담·궁합·리포트에 쓰는 50덕 묶음 | 20/45 |

### `DUK_LARGE_120` — 120덕

| 곳 | 칸 | 문구 | 길이 |
|---|---|---|---|
| Google Play | 제목 | 넉넉 120덕 | 7/55 |
| Google Play | 설명 | 상담·궁합·프리미엄 리포트에 쓸 수 있는 120덕 묶음이에요. | 34/200 |
| App Store | 표시 이름 | 넉넉 120덕 | 7/30 |
| App Store | 설명 | 상담·궁합·리포트에 쓰는 120덕 묶음 | 21/45 |


---

## 4. 앱 심사 노트 (App Store Connect → 앱 심사 정보 → 메모) — 1223/4000자

4.3(점술 앱은 포화 카테고리) 대응. 심사관이 읽으므로 영어다.

```text
Deokbuni is not a fortune-text generator. Every interpretation starts from a deterministic calculation.

1. Calculation first. Saju (Four Pillars) charts are computed deterministically from the birth date and time; Zi Wei Dou Shu and Qi Men Dun Jia charts are also computed when the birth time or the question calls for them. The language model never computes a chart. It only puts into words a plan the server has already decided from those calculations.
2. For supported year and month questions the server, not the model, decides the conclusion for that period. Output guards reject answers that contradict it, that make definitive or guaranteed claims, or that rank a "best time". A rejected answer is regenerated or declined, never shown as-is.
3. Questions about illness, lifespan or death are declined by a deterministic safety router.
4. Every interpretation screen is labelled as AI-generated. Users give separate consent before their birth data and consultation text are sent to our AI provider (OpenAI), and they can report any AI answer in the app.
5. The price in the in-app unit (Duk) is shown before anything is spent. Users can delete individual conversations and reports, and their account, inside the app.
```

**한국어 요약** — ① 명식은 엔진이 결정론적으로 계산하고 언어모델은 계산하지 않는다 ② 지원되는 올해·이번 달 질문은
서버가 결론을 정하고, 그와 어긋나거나 단정·보장·최적 시기를 말하는 답은 다시 만들거나 내보내지 않는다 ③ 질병·수명·죽음
질문은 안전 라우터가 거절한다 ④ 해석 화면마다 AI 표시 · AI 처리 전 별도 동의 · 답변 신고 ⑤ 덕을 쓰기 전 가격 표시 ·
상담·보고서·계정 삭제를 앱 안에서.

⚠ **제출 전 오너 확인 두 가지**
1. **로그인**: 심사관이 로그인할 길이 있어야 한다(가이드라인 2.1). Sign in with Apple 이 실제로 동작하면 그것으로 되고,
   아니면 **데모 계정**을 "앱 심사 정보 → 로그인 필요" 에 적는다. (staging 은 애플 제공자가 꺼져 있다 — 2026-09-10 실측)
2. **4번 문장의 "separate consent"** 는 production 동의 게이트가 켜진 뒤에만, **5번 문장의 상담·보고서 삭제**는 production 에
   마이그레이션 22 가 올라간 뒤에만 참이다 — 통합 적용 패키지 ⑧ 까지 끝난 다음에 제출(22 는 ②, 게이트는 ⑧).

---

## 5. 문장별 근거 — 코드로 확인한 것만 썼다

| 문구 | 근거 |
|---|---|
| 명식을 먼저 계산하고 AI 가 풀어 준다 · AI 는 계산하지 않는다 | `docs/PRODUCT_TRUTH_GUARD.md` §2 "계산은 결정론적 엔진, 해석은 AI" = SAFE |
| 사주 중심, 시각·질문에 따라 자미두수·기문둔갑도 참고 | `buildServerConsultation.ts` — 근거에 myungri · ziwei · qimen 가용성이 따로 있다(자미는 시각, 기문은 시기 질문 `qimenActivation`) |
| 만세력(여덟 글자와 대운)을 직접 본다 | `src/app/subject-manse.tsx` — `MansePillarsGrid` · `FortuneCycleSection` |
| 상담 5덕 · 궁합 12덕 · 프리미엄 50덕 | `src/features/duk/pricing.ts` `DUK_PRICES` (테스트가 대조) |
| 24시간 동안 질문 5번 | `consultation_sessions.turn_limit default 5` · 약관 §5 "최대 5회 질문·24시간" (테스트가 대조) |
| 프리미엄 = 타고난 명식 + 앞으로 열두 달 | `src/app/premium.tsx` "타고난 결과 앞으로 열두 달을 한 번에 봅니다" |
| 오늘의 운세·이번 달 운세는 덕 없이 | `DukProduct` 에 없다 · 원장 사유에 운세 차감 없음 |
| 가입 10덕 · 촛불 1덕 | `WELCOME_DUK` · `CANDLE_DUK` (테스트가 대조) |
| 첫 충전 20덕(한 번만) · 기본 50덕 · 넉넉 120덕 | `TOPUP_PACKS` (테스트가 대조) |
| 쓰기 전에 필요한 덕과 남는 덕을 보여 준다 | `PriceConfirmSheet` — "시작하면 N덕이 남아요" |
| 해석 화면마다 AI 표시 | `<AiDisclosure>` — 상담 · 궁합 · 오늘 · 이번 달 · 리포트(`PremiumReportView`) |
| AI 처리 전 별도 동의 · 철회 | 마이그레이션 18 · `AiConsentSheet` · MY → AI 처리 동의 (production 은 패키지 ⑧ 뒤) |
| 답변마다 신고 | 마이그레이션 17 · `UserFeedbackControl` 신고 입구 |
| 상담 기록·보고서 하나씩 삭제 · 앱 안 탈퇴 | 마이그레이션 22 · `subject-history` · `report/[id]` · `account-delete` |
| 참고용 정보, 전문 판단 대체 아님 | 약관 §1 |
| 건강·수명 질문에 답하지 않는다 | 안전 라우터(`consultationSafety`) — PRODUCT_TRUTH_GUARD §2 |
| (심사 노트 2) 서버가 결론을 정하고 가드가 어긋난 답을 다시 만들거나 거절 | `certaintyGuard.ts` (`containsForbiddenCertainty` · `containsWinnerClaim` · `contradictsPolarity`) · 거절 시 SEMANTIC_REJECTED |

## 6. 쓰지 않은 것 — 그리고 이유

| 쓰지 않은 주장 | 이유 |
|---|---|
| "답변에 근거(천간·지지·십성)를 표로 보여 준다" | **사실이 아니다.** 소비자 답변에는 근거 표가 없다(`StructuredConsultationResult` 주석 — 근거 시트는 내부·관리자 화면). ⚠ `docs/STORE_READINESS_2026-09-10.md` §5-1 B-2 의 2번이 이 오류를 담고 있다 — 그 초안을 쓰지 말 것 |
| "대조 검사기 13종" | 그 수는 **유명인 명식 페이지 본문 검사기**(`famousBodyPrompt.ts`)의 것이다 — 상담 경로가 아니다 |
| 세 계산의 일치·교차검증 | PRODUCT_TRUTH_GUARD 금지 — 합의 알고리즘이 없다 |
| "가장 좋은 시기를 알려 드려요" | 금지 — V1 은 순위·최적 시기를 정하지 않는다 |
| 정확도 · 1위 · 무료 · 단정 표현 | 스토어 정책 · 앱 톤 규칙 |
