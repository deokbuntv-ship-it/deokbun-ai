# ARCHITECTURE.md

> DeokbunAI 시스템 아키텍처 문서
>
> 이 문서는 현재 프로젝트의 시스템 구조를 설명한다. PROJECT_HISTORY.md를 먼저 읽고 이 문서를 읽는다.
>
> **표기:** `[완료]` 구현됨 · `[계획]` 미구현(요구사항 확정). 실제 코드가 기준이며, 문서와 다르면 코드를 우선한다.
>
> 기준 커밋: `87ec6e8` · 작성일: 2026-08-07

------------------------------------------------------------

## 시스템 전체 구조

```
사용자
  ↓
UI (React Native / Expo Router)            [완료]
  ↓
ChatService                                [완료]
  ↓
AIGateway                                  [완료]
  ├─ LOCAL_RESPONSE → 종료 (Auth 없이)      [완료]
  └─ NEED_LLM ↓
Auth Guard                                 [완료]
  ↓
Context Selector                           [완료]
  ↓
Conversation Memory (계산)                  [완료] / Summary 생성 [계획]
  ↓
Prompt Builder                             [완료]
  ↓
LLM Adapter (인터페이스)                     [완료] / 실제 Adapter [계획]
  ↓
Supabase Edge Function                     [계획]
  ↓
LLM Provider (OpenAI 등)                    [계획]
  ↓
응답 → UI
```

------------------------------------------------------------

## 전체 철학

- **UI는 절대로 LLM을 직접 호출하지 않는다.** LLM을 아는 것은 ChatService 하나뿐이다.
- **Client에 OpenAI API Key를 두지 않는다.** 실제 LLM 호출은 서버(Edge Function)에서만 수행한다(향후).
- **계산엔진과 LLM 해석을 분리한다.** LLM에 원본 역학 계산을 맡기지 않는다.
- 모든 Layer는 자기 책임만 가진다.

------------------------------------------------------------

## Layer 구조

```
src/app/          (화면)         → src/features/  (도메인 로직)  → src/services/  (외부 연동)
                                                                  → (향후) Edge Function → LLM Provider
```

실제 디렉터리:
- `src/app/` — 화면/라우트 (expo-router)
- `src/features/chat/` — AI 파이프라인 전체
- `src/features/auth/` — 인증
- `src/features/consultation/` — 상담 대상/출생정보 Draft
- `src/services/supabase/` — Supabase Client
- `src/components/`, `src/theme/`, `src/hooks/`, `src/constants/` — 공통 UI/테마

------------------------------------------------------------

## app (화면 계층) — [완료]

- 역할: 화면만 담당. 비즈니스 로직을 작성하지 않는다.
- 실제 라우트: `/`(홈), `/consult`, `/records`, `/my` (탭), `/birth-info`, `/chat`, `/login`.
- 화면은 ChatService / Context Hook만 호출한다.

> **Drift 기록:** `/login`은 라우트로 등록됐으나 앱에서 도달 경로가 없는 **Dead Route**다.
> (Sprint 2-17에서 해소 예정. 코드 임의 수정 금지.)

------------------------------------------------------------

## ChatService — [완료]

파일: `src/features/chat/services/chatService.ts`

프로젝트의 핵심. 모든 AI 요청은 반드시 ChatService를 통과한다.

책임: Gateway 호출 → Auth 확인 → Context 선택 → Memory 계산 → Prompt 생성 → Adapter 호출.
UI는 이 내부를 전혀 모른다.

실제 실행 순서:
```
trim(userMessage) → 빈 값이면 INVALID_INPUT
evaluateMessage()
  ├─ INVALID_INPUT → 종료
  ├─ LOCAL_RESPONSE → 즉시 응답 반환
  └─ NEED_LLM ↓
authGuard() → 실패 시 AUTH_REQUIRED
selectConsultationContext(draft) → null이면 INVALID_INPUT
computeConversationMemory(messages, memory)
buildPrompt(...)
adapter.generateResponse(...) → 실패 시 REQUEST_FAILED
```

------------------------------------------------------------

## AIGateway — [완료]

파일: `src/features/chat/gateway/AIGateway.ts`

- 목적: 불필요한 LLM 호출 제거.
- 현재 LOCAL_RESPONSE 대상: 인사 / 감사 / 작별 / 짧은 확인(규칙 배열).
- 처리 방식: 정규화(소문자·공백 축약·말미 문장부호 제거) 후 **Exact Match**.
- **절대 부분 문자열 매칭(`String.includes`) 금지.**
  코드의 `rule.phrases.includes(normalized)`는 **배열 정확일치**이므로 정책 준수(오해 금지).
- 매칭되지 않으면 기본 `NEED_LLM`. Gateway는 상담 질문을 적극 분류하는 AI Router가 아니다.

이유: "안녕하세요 올해 사업운 알려주세요"에 "안녕하세요"가 포함됐다고 인사로 처리하면 안 되기 때문.

------------------------------------------------------------

## Auth Guard — [완료]

파일: `src/features/auth/guards/requireAuthenticatedUser.ts` (가드 함수),
실제 주입: `src/app/chat.tsx` → `createChatService(adapter, () => isAuthenticated)`

- 위치: **Gateway 이후.** LOCAL_RESPONSE는 로그인 없이 종료, NEED_LLM만 로그인 확인.
- 이 순서를 절대 바꾸지 않는다(인사까지 로그인 강제 금지).

> **Drift 기록:** `requireAuthenticatedUser`는 export되어 있으나 아직 소비되지 않는다.
> 현재 인증 판정은 `chat.tsx`의 `() => isAuthenticated` 클로저가 담당(기능 영향 없음).

------------------------------------------------------------

## Context Selector — [완료]

파일: `src/features/chat/selectors/contextSelector.ts`

- 역할: 현재 상담에 필요한 데이터만 선택(대상명/성별/생년월일/출생시간요약/출생지).
- **Prompt를 만들지 않는다. 데이터만 선택한다.**
- 목적: 비용 감소, Context Noise 감소, 개인정보 최소 전송.

------------------------------------------------------------

## Conversation Memory — [완료: 계산] / [계획: 생성]

파일: `src/features/chat/memory/conversationMemory.ts`

- 구조: `Summary + Recent Messages`.
- `ConversationMemoryState = { summary: string | null, lastSummarizedMessageId: string | null }`.
- **[완료]** 요약 대상 계산, 중복 요약 방지 체크포인트, 최근 N개(8)·Threshold(20) 계산.
- **[계획]** 실제 LLM Summary **생성**은 미구현. `shouldUpdateSummary`/`messagesToSummarize`는 아직 미소비.
- PromptBuilder는 Conversation Memory 결과(summary + recent)만 받는다.

------------------------------------------------------------

## Prompt Builder — [완료]

파일: `src/features/chat/prompts/promptBuilder.ts`

- 역할: LLM에게 보낼 메시지 배열 생성.
- 순서: `System Instruction → 상담 Context → Summary(있으면) → 최근 메시지 → 현재 사용자 질문`. 순서를 반대로 넣지 않는다.
- **절대 Network/OpenAI 호출하지 않는다.** 순수 문자열 구성만 담당.
- **[계획]** 고정/변동 Prompt 분리 기반 Prompt Caching(구조적 여지 확보).

------------------------------------------------------------

## LLM Adapter — [완료: 인터페이스] / [계획: 실제 구현]

파일: `src/features/chat/adapters/llmAdapter.ts`

- 역할: LLM Provider 교체 가능 구조. ChatService는 OpenAI/Claude/Gemini 어느 것인지 모른다. Adapter만 안다.
- **현재:** `unconfiguredLLMAdapter` — 호출 시 `throw new Error('LLM adapter is not configured.')`.
  따라서 NEED_LLM 경로는 현재 `REQUEST_FAILED`로 종료된다(정상 — LLM 미연결 상태).
- **[계획]** OpenAI/Anthropic/Gemini 등 실제 Adapter.
- 실제 모델명은 `chatConfig.defaultModel = 'gpt-mini-placeholder'` (플레이스홀더 — Core Architecture를 특정 모델에 종속시키지 않는다).

------------------------------------------------------------

## Supabase Edge Function — [계획]

- **현재 미구현.** `supabase/functions` 디렉터리 자체가 없다.
- 향후 **유일한 LLM 호출 지점.** 예상 책임:
  JWT/Session 검증 → User 식별 → Rate Limit → Usage/요금제 검증 → Request 검증 →
  LLM 호출 → 안전한 Error 반환 → Usage Logging.
- **앱에서 OpenAI API Key 사용 금지.** 실질 보안 경계는 서버다(Client Guard는 UX·불필요 요청 방지용).

------------------------------------------------------------

## LLM Provider (OpenAI 등) — [계획]

- 역할: LLM. 초기에는 비용 효율적인 GPT Mini 계열을 사용할 수 있으며, 향후 고성능/Premium 모델로 Adapter 교체 가능.

------------------------------------------------------------

## 인증 구조 — [완료]

```
User → Login → Supabase Auth → Session → AuthContext → ChatService AuthGuard → (향후) Edge Function JWT 재검증
```

파일: `src/features/auth/context/AuthContext.tsx`, `src/features/auth/services/authService.ts`

- Auth State: `loading | authenticated | unauthenticated`.
- `AuthProvider` 시작 시 `getSession()`으로 세션 복구 + `onAuthStateChange` 구독.
- Supabase Auth가 **Single Source of Truth.** UI가 여기저기서 직접 Session을 조회하지 않는다.

### 로그인 Provider 확장 구조
```
OAuth Provider → authService → AuthContext → ChatService → (향후) Edge Function
```
- Provider가 추가되어도 `AuthContext` / `ChatService`는 바꾸지 않는다. **`authService`만 수정한다.**
- API: `signInWithProvider(providerId)`. `AuthProviderId = 'kakao' | 'google' | 'naver' | 'apple'`.
- **현재:** kakao만 구현(실제 성공 검증 미완). google/naver/apple은 `NOT_SUPPORTED` 반환 [계획].

------------------------------------------------------------

## 세션 저장 구조 — [완료]

파일: `src/services/supabase/client.ts`

- `@react-native-async-storage/async-storage` 기반. `persistSession`, `autoRefreshToken`, `detectSessionInUrl: false`.
- **단일 `client.ts`.** 플랫폼 분기(native/web) 금지. Android/iOS/Web 동일 구조 유지.
- 과거 expo-sqlite는 Web WASM 문제로 폐기 — 특별한 검증 없이 되돌리지 않는다.

------------------------------------------------------------

## Memory 구조

```
Messages → Conversation Memory → (Summary + Recent Messages) → PromptBuilder
```
긴 대화일수록 Summary가 커지고 Recent는 항상 최근 N개(8) 유지. (단, Summary 생성 자체는 [계획])

------------------------------------------------------------

## Prompt 구조

```
System Prompt → 상담 Context → Summary → Recent Messages → Current Question
```
절대로 순서를 반대로 넣지 않는다.

------------------------------------------------------------

## 관리자 구조 — [계획]

```
Admin → Supabase DB → (Prompt 관리 / 공지 / FAQ / 사용량 / 회원 / 결제)
```
관리자는 Edge Function을 직접 호출하지 않는다. (전체 미구현)

------------------------------------------------------------

## 비용 절감 구조

1. Gateway → 불필요 LLM 제거 **[완료]**
2. Conversation Summary → 토큰 감소 **[계획: 생성]**
3. Prompt Caching → 중복 Prompt 제거 **[계획]**
4. Context Selector → 최소 Context 전송 **[완료]**
5. Output Token 제한(`maxOutputTokens = 800`) **[완료]**
6. Edge Function → Usage/Rate 관리 **[계획]**
7. GPT Mini 계열 → 초기 비용 절감 **[계획]**

> 우선순위: **안정성 > 상담 품질 > 보안 > 비용 효율 > 부가기능.** 비용 절감 때문에 로그인/접속 안정성을 희생하지 않는다.

------------------------------------------------------------

## 절대 변경하면 안 되는 구조 (순서 잠금)

```
UI → ChatService → AIGateway → Auth Guard → ContextSelector → ConversationMemory
   → PromptBuilder → LLM Adapter → (향후) Edge Function → (향후) LLM Provider
```
- LOCAL_RESPONSE: `AIGateway → LOCAL_RESPONSE → 종료`.
- NEED_LLM: `AIGateway → Auth Guard → 나머지 AI Pipeline`.

이 순서를 변경하지 않는다.

------------------------------------------------------------

## 프로젝트 원칙 (책임 분리)

- UI는 AI를 모른다.
- PromptBuilder는 LLM을 모른다(Network 없음).
- Adapter는 상담을 모른다.
- Gateway는 Context를 모른다.
- Memory는 Prompt를 모른다.
- Edge Function은 UI를 모른다(향후).

모든 Layer는 자기 책임만 가진다.

------------------------------------------------------------

## 현재 아키텍처 완성도 요약

| 구성요소 | 상태 |
|----------|------|
| AIGateway | [완료] |
| Auth Guard | [완료] |
| Context Selector | [완료] |
| Conversation Memory (계산) | [완료] |
| Conversation Memory (Summary 생성) | [계획] |
| Supabase Client / AuthContext | [완료] |
| ChatService 연결 | [완료] |
| PromptBuilder | [완료] |
| LLM Adapter (인터페이스) | [완료] |
| LLM Adapter (실제 구현) | [계획] |
| Login 흐름 연결 | [진행중] (Dead Route) |
| Edge Function | [계획] |
| LLM Provider 연결 | [계획] |
| Database | [계획] |

------------------------------------------------------------

## 다음 목표

```
인증 흐름 완성(현재) → Edge Function + 실제 LLM → Database persistence
→ Interpretation Engine → 운세 리포트/오늘의 운세 → Admin/Operations → QA/Release
```

새로운 Layer를 추가하거나 책임을 변경하면 반드시 이 문서를 수정한다.
이 문서는 현재 시스템 구조를 설명하는 프로젝트의 기준 문서다.
