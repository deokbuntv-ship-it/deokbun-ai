# PRD_MASTER.md

> DeokbunAI 최상위 제품 요구사항 문서 (Master Product Requirements Document)
>
> 이 문서는 DeokbunAI의 장기 기준 명세서다. 현재 구현 정리 문서가 아니라
> "무엇을 만들 것인가"를 정의하고, 그것이 지금 어디까지 왔는지를 구분한다.
>
> **상태 표기 규칙**
> - `[완료]` 실제 구현 + 검증 완료
> - `[진행중]` 코드 또는 외부 설정 작업 진행 중 (검증 미완)
> - `[계획]` 제품 요구사항으로 확정됐으나 아직 미구현
>
> 추측으로 완료 처리하지 않는다. 코드가 문서와 다르면 코드를 우선하고 차이를 기록한다.

------------------------------------------------------------

## 1. Document Metadata

| 항목 | 값 |
|------|-----|
| 문서명 | PRD_MASTER.md |
| 작성일 | 2026-08-07 |
| 기준 커밋 | `87ec6e8 docs: add project handover documentation` |
| 브랜치 | `main` (origin/main 동기화, working tree clean) |
| 원격 | `git@github.com:deokbuntv-ship-it/deokbun-ai.git` |
| 작성 근거 | Repository 실제 코드 + 사용자 제공 문서(PROJECT_HISTORY / ARCHITECTURE / HANDOVER) |
| 참고 문서 상태 | `HANDOVER.md`만 Repo에 존재. **`PROJECT_HISTORY.md`, `ARCHITECTURE.md`는 Repo에 미존재**(채팅 제공분). `AI_CONSTITUTION.md` 없음. → §35, §37 Drift 참조 |

------------------------------------------------------------

## 2. Product Vision

DeokbunAI는 단순한 "AI 사주 답변기"가 아니다. 서로 다른 해석 체계(명리·자미두수·기문둔갑)의
**계산 결과를 구조화**하고, 이를 하나의 상담 Context로 통합하여 **일관되고 깊은 AI 상담**을 제공한다.

사용자에게는 "어떤 학문을 썼는가"가 아니라 "좋은 상담 결과를 얻는가"가 중요하다.
따라서 학문명은 UI 전면에 내세우지 않는다.

------------------------------------------------------------

## 3. Product Goals

1. 출생정보 등록 후 **일반 메신저처럼 자유롭게 대화**하는 상담 경험.
2. 여러 해석 체계를 **공통 포맷으로 정규화**해 Cross-View 상담으로 발전.
3. **모델 교체 가능**(LLM Adapter) + **계산과 LLM 분리** 아키텍처 유지.
4. 안정성 우선: 로그인·세션·접속 신뢰성이 비용 절감보다 앞선다.
5. 1인 운영 가능한 서버리스(Supabase Edge) 중심 구조.

------------------------------------------------------------

## 4. Non-Goals (현 단계에서 하지 않는 것)

- 상담 주제 선택 / 질문 입력 폼 / 추천 질문 선행 UI (제거된 방향 — §35 Decision Log)
- 이메일 OTP 로그인 (MVP 제외)
- 결제 / 고급 관리자 / 고급 Analytics (1.0 제외 후보 — §33)
- LLM에게 원본 역학 계산을 맡기는 방식
- 미래 대비용 과설계(미사용 Interface/Service/Table 선제작)

------------------------------------------------------------

## 5. Target Users

- 자기이해·의사결정에 참고가 필요한 일반 사용자(초기 한국어권).
- 플랫폼: Android / iOS / Web (§29).
- 로그인 기반 개인화 상담(비로그인은 인사 등 로컬 응답만).

------------------------------------------------------------

## 6. Core User Journey

```
홈(/) → 상담 시작(/consult) → 출생정보(/birth-info) → AI 채팅(/chat)
   → [NEED_LLM 질문 시] Auth Guard → (미인증) 로그인 → 상담 복귀
   → [향후] 상담 기록 → 리포트/부가기능
```

- **[완료]** 홈→상담→출생정보→채팅 동선 (`index.tsx` → `consult.tsx` → `birth-info.tsx` → `chat.tsx`)
- **[진행중]** 채팅 내 인증 필요 시 로그인 진입 (현재 **Dead Route**: `/login` 도달 경로 없음 — §37 Known Issues)
- **[계획]** 상담 기록 / 리포트

------------------------------------------------------------

## 7. Home (`src/app/(tabs)/index.tsx`)

- **[완료]** AI 상담 진입 카드 → `/consult` 이동
- **[완료]** "운세 리포트" 카드 (플레이스홀더: "상세 기능은 추후 확정됩니다")
- **[완료]** "오늘의 운세" 카드 (플레이스홀더)
- **[완료]** "최근 상담" Empty State ("아직 저장된 상담이 없습니다")
- **[완료]** 면책 문구(의료·법률·투자 단독근거 금지) 노출
- **[계획]** 운세 리포트 / 오늘의 운세 실제 기능 (§22, §23)

------------------------------------------------------------

## 8. Authentication

목표 Architecture (유지): `Provider → AuthService → AuthContext → ChatService AuthGuard → (향후) Edge Function 재검증`.
Client Guard만으로 보안 완료로 간주하지 않는다.

- **[완료]** Auth State: `loading | authenticated | unauthenticated` (`features/auth/types/auth.ts`)
- **[완료]** `AuthContext`/`AuthProvider` — `getSession()` 복구 + `onAuthStateChange` 구독 (`features/auth/context/AuthContext.tsx`)
- **[완료]** 세션 저장: Supabase + AsyncStorage (`services/supabase/client.ts`)
- **[완료]** 중복 로그인 방지 `isSigningInRef`
- **[완료]** Provider 캡슐화 API `signInWithProvider(providerId)` (`features/auth/services/authService.ts`)
- **[진행중]** Kakao Provider — 코드 존재, 실제 로그인 성공 **미검증**(KOE205, §11·§37)
- **[계획]** Google Provider — 타입에는 존재하나 `authService`에서 `NOT_SUPPORTED` 반환 (Sprint 2-17 대상)
- **[계획]** Naver / Apple Provider

**로그인 방식 요구사항(§32):** 카카오 / 네이버 / Google / Apple. 이메일 OTP 제외.
**Source of Truth:** Supabase Auth (§39).

------------------------------------------------------------

## 9. Consultation Subjects

- **[완료]** 초기 기본 대상 "본인" (`consult.tsx`: `{ id: 'self', displayName: '본인' }`)
- **[완료]** Draft 상태 관리 `ConsultationDraftContext` (reducer)
- **[계획]** 다중 대상 저장(배우자/자녀/가족/지인). 상담은 1회 1대상 기준.
- **[계획]** 대상자 데이터와 로그인 계정 분리(DB Sprint에서 확정 — §17)

------------------------------------------------------------

## 10. Birth Information

실제 필드 (`features/consultation/types/consultation.ts` — `BirthInfoDraft`):

| 필드 | 타입 | 상태 |
|------|------|------|
| displayName | string | [완료] |
| gender | 'male' \| 'female' \| null | [완료] |
| calendarType | 'solar' \| 'lunar' \| null | [완료] |
| lunarMonthType | 'regular' \| 'leap' \| null | [완료] |
| birthYear / birthMonth / birthDay | string | [완료] |
| birthTimeAccuracy | 'exact' \| 'approximate' \| 'unknown' \| null | [완료] |
| birthHour / birthMinute | string | [완료] |
| approximateTimePeriod | 'dawn'\|'morning'\|'afternoon'\|'evening'\|'night' \| null | [완료] |
| birthPlace | string | [완료] |

- **[완료]** 입력 화면 유효성 검증(연 4자리, 월 1–12, 일 1–31, 시 0–23, 분 0–59)·조건부 필드 (`birth-info.tsx`)
- **[완료]** 출생시간 3상태 지원 + "모름" 시 "임의로 추측하지 않습니다" 안내

### 9·10 원칙
- **[완료]** 출생시간 모름이어도 상담 차단하지 않음(UI 통과 허용).
- **[계획]** 정확도 상태를 계산엔진에 명시적으로 전달(계산엔진 미구현).

------------------------------------------------------------

## 11. (시간 계산 정책) — Time Policy

- **[계획]** Timezone / DST / 표준시 / 진태양시 옵션. 현재 계산엔진 자체가 없음.
- 기본 방향: 표준시 우선. MVP 실제 적용은 Interpretation Engine Sprint에서 확정(§16).

------------------------------------------------------------

## 12. Chat (`src/app/chat.tsx`, `features/chat/components/`)

- **[완료]** 사용자/Assistant 메시지, ScrollView 스크롤, multiline 입력(`ChatInput`)
- **[완료]** 중복 전송 방지(`isSending`) + 전송 중 비활성화
- **[완료]** 오류 안내(사용자용 문구 변환)
- **[완료]** 첫 인사(로컬 고정, LLM 호출 없음)
- **[계획]** Streaming 응답
- **[참고]** 렌더링은 `ScrollView`(FlatList 가상화 아님) — 최적화는 이번 범위 아님(§28)

### 4. AI 첫 인사 — 실제 문구 (코드 기준, `chat.tsx` `WELCOME_MESSAGE_TEXT`)
```
안녕하세요. 덕분AI입니다. 😊

출생정보 등록이 완료되었습니다.
상담을 시작할 준비가 되었습니다.

궁금한 점이나 고민이 있으시면 편하게 말씀해 주세요.
```
> ⚠️ PRD 요청서 §4의 예시 문구("이제 말하기도 전에 상담을 진행하겠습니다")와 **실제 코드가 다름**.
> 위 실제 문구가 현재 값이다. 문구 변경이 필요하면 별도 승인 후 반영(이번 작업은 문서만).

### 12. ChatMessage 타입 (`features/chat/types/chat.ts`)
| 필드 | 상태 |
|------|------|
| id | [완료] |
| role ('assistant' \| 'user') | [완료] |
| text | [완료] |
| status | [계획] (미존재) |
| createdAt | [계획] (미존재) |

------------------------------------------------------------

## 13. AI Architecture

기준 파이프라인 (실제 `features/chat/services/chatService.ts`와 일치):

```
UI → ChatService → AIGateway
     ├─ LOCAL_RESPONSE → 즉시 응답(이후 AI 계층 미호출)  [완료]
     └─ NEED_LLM → Auth Guard → Context Selector → Conversation Memory
                    → Prompt Builder → LLM Adapter → (향후) Edge Function → LLM Provider
```

- **[완료]** ChatService 조립 및 순서, Layer 책임 분리
- **[완료]** LLM Adapter 인터페이스(`LLMAdapter`) — 모델 교체 가능 구조
- **[진행중/계획]** 실제 LLM Adapter — 현재 `unconfiguredLLMAdapter`가 호출 시 throw → NEED_LLM은 `REQUEST_FAILED`로 종료 (`features/chat/adapters/llmAdapter.ts`)
- **[계획]** Edge Function, LLM Provider 연결

------------------------------------------------------------

## 14. Gateway (`features/chat/gateway/AIGateway.ts`)

목적: 불필요한 API 호출 제거. 상담 질문을 적극 분류하는 AI Router가 아니며, 미매칭은 기본 `NEED_LLM`.

- **[완료]** LOCAL_RESPONSE 대상: 인사 / 감사 / 작별 / 짧은 확인 (규칙 배열 `LOCAL_RULES`)
- **[완료]** 정규화(소문자·공백 축약·말미 문장부호 제거) 후 **Exact Match**
- **[완료 · 안전원칙]** 부분 문자열 매칭 금지. 코드의 `rule.phrases.includes(normalized)`는
  **배열 정확일치 검사**로 정책 준수. (금지 대상은 `String.includes` 부분매칭 — 오해 금지)

예: `"네"` → LOCAL 가능 / `"네 알겠습니다. 그런데 올해 사업은…"` → NEED_LLM.

------------------------------------------------------------

## 15. Conversation Memory (`features/chat/memory/conversationMemory.ts`)

구조: `기존 Summary + 최근 N개 메시지 + 현재 질문`.

`ConversationMemoryState` (실제): `summary: string | null`, `lastSummarizedMessageId: string | null`.

- **[완료]** 요약 대상 계산 로직 + 체크포인트(`lastSummarizedMessageId`) 기반 **중복 요약 방지**
- **[완료]** Threshold(`chatConfig.summaryThreshold = 20`), 최근 메시지 상한(`maxRecentMessages = 8`)
- **[계획]** 실제 LLM **Summary 생성** — 미구현(계산만 존재). `shouldUpdateSummary`/`messagesToSummarize` 결과 미소비
- **[참고]** `chat.tsx`의 `conversationMemory` state는 setter 없이 초기값 고정 → 실행 중 진행 안 됨(§37)

------------------------------------------------------------

## 16. Prompt Architecture

### 23. Prompt Builder (`features/chat/prompts/promptBuilder.ts`)
- **[완료]** 순수 구성 계층: System Instruction → 상담 Context → Summary(있으면) → 최근 메시지 → 현재 질문
- **[완료]** Network/OpenAI 호출 없음
- 현재 System Instruction: `"You are the consultation assistant for DeokbunAI."` (최소값 — 향후 강화 [계획])

### 24. Prompt Caching
- **[계획]** 고정/변동 Prompt 분리 기반 Provider 캐싱 활용(구조적 여지만 확보)

### 25. Context Selector (`features/chat/selectors/contextSelector.ts`)
- **[완료]** Draft에서 상담 Context만 선별(대상명/성별/생년월일/출생시간요약/출생지). 전량 전송 안 함
- 목적: 비용·노이즈 감소, 개인정보 최소 전송

------------------------------------------------------------

## 17. Interpretation Engine

- **[계획 — 전체]** 계산엔진, 해석 계층, 공통 포맷 정규화, Multi-View/Cross Logic, 기문둔갑 조건부 실행.
- 핵심 원칙: **LLM에 원본 계산을 맡기지 않음.** `출생정보 → 계산엔진 → 구조화 결과 → Context Selector → Prompt → LLM 해석`.
- 세부 규칙은 별도 Interpretation Engine 명세에서 확정(§38 Open Decisions).

------------------------------------------------------------

## 18. Database

- **[계획 — 전체]** 현재 DB 테이블·스키마 코드 없음. `supabase/` 디렉터리 자체가 없음.
- Entity **후보**(확정 아님, DB Sprint에서 결정): profiles, consultation_subjects, birth_profiles,
  consultation_sessions, messages, conversation_memories, reports, usage_logs, subscription.
- **[계획]** RLS: 사용자 데이터 테이블 기본 적용(본인 데이터만 접근). 관리자 별도 권한.

------------------------------------------------------------

## 19. Backend / Edge Function

- **[계획 — 전체]** `supabase/functions` 미존재. 향후 GPT 요청 백엔드 = Supabase Edge Function.
- 예상 책임: Authorization Token 검증 → User 식별 → Rate Limit → Usage/요금제 검증 →
  Request 검증 → LLM 호출 → 안전한 Error 반환 → Usage Logging.
- 이유: Supabase Auth 연동, 서버 운영 부담↓(1인 운영), API Key 보호, DB/Usage 연동.

------------------------------------------------------------

## 20. Security

- **[완료]** OpenAI Key가 코드/클라이언트에 없음. `.env`는 gitignore(§34), 담긴 값은 Supabase URL + **publishable(공개 가능) 키**.
- **[완료]** 사용자용 Error 변환(내부 코드/스택 미노출)
- **[원칙/계획]** Client Secret 하드코딩 금지 · Access/Refresh Token·OAuth Secret·API Key·Service Role Key **로그 금지** · Open Redirect 방지 · 실질 보안 경계는 **서버(Edge)**
- **[계획]** Edge Function JWT 재검증(현재 서버 경계 부재 — LLM 미연결로 노출면 0)

------------------------------------------------------------

## 21. Privacy

- **[완료 · 원칙]** 출생정보는 민감 데이터로 취급. **URL Query에 출생정보 전달 금지**(현재 Draft는 Context로만 전달).
- **[완료]** 개인정보 최소화: 주소/전화/불필요 실명 미요구(표시 이름은 실명 불필요 안내).
- **[계획]** 영속 저장 시 저장·전송 보호 정책(DB Sprint).

------------------------------------------------------------

## 22. Cost Strategy

우선순위(§17 원칙): **1) 안정성 2) 상담 품질 3) 보안 4) 비용 효율 5) 추가 기능.**
비용 절감은 UX 훼손이 아니라 Architecture로 해결.

- **[완료]** AIGateway 로컬 처리, 최근 메시지 상한(8), 중복 Summary 방지 계산, Context Selector, Output Token 제한(`maxOutputTokens = 800`)
- **[계획]** Prompt Caching, Server Usage Limit, Rate Limit, Summary 실제 동작
- **[계획]** 모델 전략: 초기 GPT Mini 계열 → 유료 전환 시 단계적 고성능 모델(구조 불변, Adapter 교체)
- **현재 실제 모델**: `chatConfig.defaultModel = 'gpt-mini-placeholder'` (플레이스홀더 — 실모델 미확정)

------------------------------------------------------------

## 23. Reports (운세 리포트)

- **[계획]** 홈 핵심 기능. 세부 구성 미확정 → 임의 구현 금지. 현재 홈 카드 플레이스홀더만 존재. (§38 Open Decisions)

------------------------------------------------------------

## 24. Today's Fortune (오늘의 운세)

- **[계획]** 산식/콘텐츠/발송 방식 미확정 → 추측 개발 금지. 현재 홈 카드 플레이스홀더만 존재. (§38 Open Decisions)

------------------------------------------------------------

## 25. Consultation History

- **[계획]** 로그인 사용자 Session/Message History 저장, 상담 목록/제목/최근/이어서/검색.
- 현재: 메시지는 `chat.tsx` 로컬 state에만 존재(휘발성), `records`·`my` 탭은 빈 화면. 영속화 없음.

------------------------------------------------------------

## 26. Admin

- **[계획 — 전체]** 별도 관리자 Web. 후보: 사용자/상담 Session/Usage/Prompt 설정/AI 오류/리포트/공지/통계.
- MVP 최소 범위 미확정(§38). 관리자는 Edge Function을 직접 호출하지 않는다.

------------------------------------------------------------

## 27. Payments / Subscription

- **[계획]** 무료 베타 단계에선 결제 비우선. 장기: 무료 베타 → 월 구독. 가격·정책은 출시 시점 결정(§38).

------------------------------------------------------------

## 28. Notifications

- **[계획]** 오늘의 운세 알림 / 리포트 완료 / 서비스 공지. MVP 우선순위는 Roadmap에서 결정.

------------------------------------------------------------

## 29. Analytics / Monitoring (Observability)

- **[계획]** Crash/Error tracking, Edge Function errors, LLM 실패, Auth 실패, Usage/cost 모니터링.
- 현재 **에러 관측 부재**(`chatService` catch가 예외 삼킴 — §37). 도구는 구현 시점 결정.

------------------------------------------------------------

## 30. Platform Requirements

- 목표: Android / iOS / Web. 플랫폼 공통 Architecture 우선, 분기는 실제 API 차이 시에만.
- **[완료]** 단일 `client.ts`(플랫폼 분기 없음), expo-router 기반 공통 라우팅
- `app.json`: scheme `deokbunai`, web output `static`

------------------------------------------------------------

## 31. UX / UI Principles

- **[완료 · 핵심 UX]** 자유 Chat 중심. 상담 주제 선택/질문 폼/추천 질문 선행 UI **제거**. 출생정보 후 바로 Chat.
- **[완료]** 학문명(명리/자미두수/기문둔갑) 기본 UI 노출 최소화(현재 사용자 화면에 학문명 없음)
- **[완료]** 공통 컴포넌트(`src/components/`): Screen, Stack, Text, Card, Button, Input (+ ChatBubble, ChatInput 등)
- **[완료]** Theme: Light/Dark, Semantic Token(`src/theme/`)
- **[계획]** Accessibility 최종 점검(터치영역/명암/폰트/Screen Reader/키보드/Dynamic Type) — 부분 label만 존재, 과장 금지

------------------------------------------------------------

## 32. Testing

- 기본 검증: `npx tsc --noEmit` (현재 **통과, exit 0**) → 필요 시 `npm run web` + 육안. Native 영향 시 Native 테스트.
- **[계획]** 유닛테스트 / CI (현재 부재 — §37)

------------------------------------------------------------

## 33. Deployment

- **[계획]** Store Release(Android/iOS) + Web 배포. QA/Release는 Roadmap Phase G.
- **[완료 · 정책]** 환경변수: 공개 가능한 것만 `EXPO_PUBLIC_*`(URL, PUBLISHABLE_KEY). Server Secret 분리. `.env` gitignore, `.env.example`은 변수명만 커밋.

------------------------------------------------------------

## 34. Version 1.0 Scope (MVP)

> 아래는 현재 결정 기준 **후보 범위**. 사용자와 미확정한 것을 임의로 "필수" 처리하지 않는다.

| MVP 후보 | 상태 |
|----------|------|
| Social Login (최소 1개 Provider 정상) | [진행중] (Sprint 2-17 Google) |
| Session Restore | [완료] 구조 / [진행중] 실검증 |
| 상담 대상 · 출생정보 | [완료] (본인 기준) |
| AI Chat UI | [완료] |
| 실제 Server LLM 호출 | [계획] |
| 상담 기록 저장 | [계획] |
| 최소 해석엔진 | [계획] |
| 기본 비용 보호(Rate/Usage) | [계획] |
| 사용자 데이터 보안(Edge/RLS) | [계획] |
| Android/iOS/Web 안정성 | [진행중] |
| 최소 운영 기능 | [계획] |

### 1.0 제외 후보(§33 요청서): 결제 / 고급 관리자 / 고급 Analytics / 복잡한 account linking / 해석 고도화 / 불필요 추천 UI.

------------------------------------------------------------

## 35. Future Roadmap

| Phase | 내용 | 상태 |
|-------|------|------|
| **A. 인증 완성** | Login 라우트 연결 + Provider 1개 실검증 | ◀ **현재 위치 (Sprint 2-17)** |
| B. Edge Function + 실제 LLM | 서버 검증 후 OpenAI 호출, Adapter 교체 | [계획] |
| C. Database persistence | profiles/subjects/sessions/messages + RLS | [계획] |
| D. Interpretation Engine | 계산·해석·정규화·Multi-View | [계획] |
| E. 운세 리포트 / 오늘의 운세 | 요구사항 확정 후 | [계획] |
| F. Admin / Operations | 관리자·모니터링·Usage | [계획] |
| G. QA / Store Release | Android/iOS/Web 출시 | [계획] |

------------------------------------------------------------

## 36. Product Decision Log

| 결정 | 이유 |
|------|------|
| 상담 주제 선택 **제거** | 자유 Chat 중심 UX |
| 질문 입력 화면 **제거** | 메신저형 자연스러운 대화 |
| 출생정보 후 **바로 Chat** | 진입 마찰 최소화 |
| 학문명 UI 노출 **최소화** | "결과 품질"이 사용자 관심사 |
| 이메일 OTP **제외** | Social Login 중심 |
| **AsyncStorage** 세션 저장 | expo-sqlite Web WASM 문제(폐기) |
| 단일 `client.ts` | 플랫폼 분기 유지보수성 |
| AIGateway **Exact Match** | 상담 질문 오분류 방지 |
| Auth Guard = Gateway **이후** | 인사까지 로그인 강제 안 함 |
| **안정성 > 비용 절감** | 로그인/세션/접속 신뢰 우선 |
| Kakao 보류 → **Google 우선** | KOE205/account_email 외부 제약 |

------------------------------------------------------------

## 37. Current Implementation Status & Known Issues

### 완료율 (코드 근거 추정치 — 단일 숫자로 과장하지 않음)
| 영역 | 추정 | 근거 |
|------|------|------|
| Product Architecture | ~70% | 파이프라인·Layer 경계 실재, tsc 통과 |
| UI | ~85% | 홈/상담/출생정보/채팅/컴포넌트/테마 |
| Auth | ~40% | 구조 완료, 실제 로그인 검증 0% |
| AI Infrastructure | 구조 ~70% / 기능 ~5% | Adapter throw, Summary 미생성 |
| Backend (Edge) | 0% | 디렉터리 부재 |
| Database | 0% | 테이블/스키마 없음 |
| Interpretation Engine | 0% | 코드 없음 |
| Operations | 0% | 모니터링/관리자 없음 |
| **Overall MVP** | **~20%** | HANDOVER 평가와 일치 |

### Known Issues
1. **Login Dead Route** — `/login` 등록됐으나 도달 경로 없음. NEED_LLM 미인증 시 안내 텍스트만 표시하고 이동 안 함.
2. **Kakao 실제 로그인 미검증** — KOE205/account_email(외부 Provider 제약).
3. **LLM 실제 호출 0** — `unconfiguredLLMAdapter` throw → `REQUEST_FAILED`.
4. **Conversation Memory 미완결** — 요약 생성 없음 + `chat.tsx` memory state 고정.
5. **기술부채(기록만, 이번 수정 대상 아님):** `retryCount`·`requestTimeoutMs`·`maxInputTokens` 미사용, `requireAuthenticatedUser` 미사용, Error logging 부재, 테스트/CI 부재.

------------------------------------------------------------

## 38. Open Decisions (Claude가 임의 결정하지 않음)

- 운세 리포트 상세 구성 (§23)
- 오늘의 운세 상세 알고리즘/발송 (§24)
- 최종 결제 가격·구독 정책 (§27)
- 관리자 MVP 범위 (§26)
- 알림 정책 (§28)
- 해석엔진 세부 규칙(체계별 계산·Cross Logic·기문둔갑 조건) (§17)
- 네이버 연동 방식(기본 Provider vs Custom OAuth/OIDC) (§8)
- Apple 로그인 네이티브 요구사항(출시 시점 공식 확인)
- DB 스키마 확정 (§18)
- 첫 인사 문구 최종본(코드 vs 요청서 예시 차이 — §12)
- 실제 LLM 모델명 확정 (§22)

------------------------------------------------------------

## Appendix. Source of Truth & Architecture Drift

**충돌 시 우선순위:** 1) 사용자 최신 결정 → 2) 실제 Repo 코드 → 3) AI_CONSTITUTION → 4) ARCHITECTURE → 5) PROJECT_HISTORY → 6) HANDOVER → 7) 과거 계획.
단, 코드가 설계 원칙을 실수로 위반한 경우 코드를 정당화하지 말고 **Drift**로 기록.

### 발견된 Drift / 문서-코드 차이
| # | 내용 | 판정 |
|---|------|------|
| D1 | **`PROJECT_HISTORY.md`·`ARCHITECTURE.md`가 Repo에 미커밋**(채팅 제공분만 존재). `AI_CONSTITUTION.md` 부재 | 문서 자산이 SoT 체계에 없음 → Repo 반영 권장 |
| D2 | 첫 인사 문구: 요청서 예시 ≠ 실제 코드(`chat.tsx`) | 실제 코드 우선, 문구 확정은 Open Decision |
| D3 | ARCHITECTURE "Conversation Memory 완료" ↔ 실제는 요약 **계산만** | 문서 과대 표기 |
| D4 | Login 화면이 라우트만 존재, 도달 불가 | 신규 결함(Sprint 2-17 해소 대상) |
| D5 | Provider 계획(카카오/네이버/Google/Apple) ↔ 코드는 kakao만 구현 | 계획 vs 구현(정상 범위) |
| D6 | `requireAuthenticatedUser` export만 되고 미소비 | 미사용(기능 영향 없음) |
| D7 | Gateway `Array.includes`(정확일치) | 정책 준수 — Drift 아님(오해 주의 기록) |

*이 문서는 기준 커밋 `87ec6e8`의 실제 Repository 상태를 근거로 작성되었다. 제품 방향/구현 상태 변경 시 갱신한다.*
