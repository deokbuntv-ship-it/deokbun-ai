# PROJECT_HISTORY.md

> DeokbunAI 프로젝트 개발 역사 문서
>
> 이 문서는 단순한 변경 이력이 아니다. **"왜 현재 구조가 만들어졌는가"**를 기록한다.
>
> 새로운 개발자나 AI(Claude Code, ChatGPT)가 프로젝트에 참여하면 가장 먼저 읽는 문서다.
>
> 목적:
> - 동일한 실수를 반복하지 않는다.
> - 이미 끝난 논쟁을 다시 하지 않는다.
> - 설계 의도를 잃지 않는다.
> - 구조 변경 시 기존 철학을 유지한다.
>
> **작성 원칙:** 계획과 구현 완료를 구분한다. 완료되지 않은 것을 완료로 쓰지 않는다.
> 코드가 문서와 다르면 실제 코드를 우선한다.
>
> 기준 커밋: `87ec6e8` · 작성일: 2026-08-07

------------------------------------------------------------

## 프로젝트 기본 목표

- **프로젝트명:** DeokbunAI (덕분AI)
- **목표:** LLM 기반으로 명리 · 자미두수 · 기문둔갑 3개 학문을 하나의 AI 상담 시스템으로 통합한다.
- **지향:** "사람보다 더 일관되고, 더 깊은 상담을 제공하는 AI".

------------------------------------------------------------

## 개발 철학

"빨리 만드는 것"보다 **"평생 유지보수 가능한 구조"**를 우선한다.
조금 느리더라도 항상 **구조 → 설계 → 구현** 순서로 진행한다. 절대 반대로 하지 않는다.

------------------------------------------------------------

## AI 개발 방식 (역할 분리)

- **ChatGPT** — CTO / 시스템·구조 설계 / 코드 리뷰 / 장기 방향 / Claude 작업 지시문 작성
- **Claude Code** — 실제 코드 작성 / 파일 생성·수정 / 리팩토링 / 오류 수정 / 테스트 / Git
- **사용자** — 기능 결정 / 최종 승인 / 테스트 / 외부 서비스 설정 / 사업 방향

------------------------------------------------------------

## Sprint 진행 규칙 (Sprint 2 이후)

Sprint 2부터 "좋은 코드"보다 **"좋은 구조"**를 우선한다. 모든 Sprint는 다음 순서를 반드시 따른다.

```
1. 분석  →  2. 승인  →  3. 구현  →  4. 검증  →  5. Git Commit  →  6. Git Push
```

------------------------------------------------------------

## 초기 기반 (Sprint 2-11 이전, Git 이력 기준)

실제 커밋 이력에 근거한 기반 작업:

- `19e70b6` Initial commit
- `3b98acd` 디자인 토큰(foundation design tokens)
- `980dd58` 재사용 기본 컴포넌트(Screen/Stack/Text/Card/Button/Input 등)
- `adacacd` 테마 감지 / 상태바 정렬
- `b6197da` 탭 내비게이션
- `a51f3b3` 홈 화면
- `7387d31` 상담 주제 선택(초기 버전 — 이후 방향 전환으로 제거됨, 아래 참조)
- `673da3d` Stack + `(tabs)` 내비게이션 구조로 이전
- `d198382` ConsultationDraft Context (상태 관리)
- `3289503` 상담 플로우 단순화 + Chat 경험 도입
- `4a7bc97`, `8e247da` Chat UI 컴포넌트 분리

> **방향 전환 기록:** 초기에는 "상담 주제 선택 / 별도 질문 입력"을 검토했으나,
> 카카오톡 같은 **자유 Chat 중심 UX**로 전환하며 핵심 상담 흐름에서 제거했다.
> 사용자는 출생정보 입력이 끝나면 바로 Chat으로 이동한다.

------------------------------------------------------------

## Sprint 2-11 — AIGateway 도입 (`bbc540d`)

### 문제
모든 메시지가 GPT를 호출했다. "안녕", "고마워", "네", "잘가" 같은 메시지도 GPT 비용이 발생했다.

### 후보안
- **A. 모든 메시지 GPT 호출** — 폐기 (비용 증가, 응답속도 저하)
- **B. Keyword 포함 검사** (`message.includes("안녕")`) — 폐기
  → "안녕하세요 올해 운세" 같은 문장이 잘못 Gateway 처리될 위험
- **C. Exact Match Gateway** — **채택**. 정확히 일치할 때만 LOCAL_RESPONSE, 그 외 전부 NEED_LLM

### 최종 구조
```
Message → AIGateway → LOCAL_RESPONSE  또는  NEED_LLM
```

### 결과
GPT 호출량 감소, 비용 절감, 응답속도 향상, 오분류 최소화.

> **실제 코드 확인(`features/chat/gateway/AIGateway.ts`):** 정규화(소문자·공백 축약·말미 문장부호 제거)
> 후 `rule.phrases.includes(normalized)`로 **배열 정확일치**를 검사한다. 이는 부분 문자열
> 매칭(`String.includes`)이 아니라 Exact Match 정책을 정확히 구현한 것이다.

------------------------------------------------------------

## Sprint 2-12 — Conversation Memory (`2f82246`)

### 문제
최근 메시지 일부만 유지하면 긴 상담에서 맥락이 계속 사라진다.

### 해결
`ConversationMemory` 도입. `ConversationMemoryState = { summary, lastSummarizedMessageId }`.
이미 요약한 내용을 다시 요약하지 않도록 체크포인트(`lastSummarizedMessageId`)를 둔다.

### 구조
```
Messages → ConversationMemory → (Summary + Recent Messages) → PromptBuilder
```

### 현재 상태 (실제 코드 기준 — 중요)
- **[완료]** 어떤 메시지를 요약해야 하는지 **계산**하는 로직(`computeConversationMemory`).
  중복 요약 방지 체크포인트, 최근 N개(8) 상한, Threshold(20) 계산.
- **[미구현]** 실제 LLM **Summary 생성**은 아직 없다. `shouldUpdateSummary` / `messagesToSummarize`가
  계산되지만 이를 소비해 요약을 만드는 코드가 없으며, `chat.tsx`의 memory state는 setter 없이 고정이다.
- 즉 "계산 구조는 있으나 실제 요약 생성은 미구현" 상태다. (과거 문서의 "완료" 표기를 코드 기준으로 보정)

------------------------------------------------------------

## Sprint 2-13 — ChatService 연결 (`cfae705`)

### 결정
UI에서 직접 GPT 호출하려던 초기안을 폐기. 모든 AI 요청은 ChatService를 통과한다.

### 구조
```
UI → ChatService → Gateway → (Auth) → Context → Memory → Prompt → Adapter
```

### 결과
UI는 AI 내부 구조를 전혀 모른다. GPT를 아는 것은 ChatService 하나뿐이다.

> **실제 코드 확인(`features/chat/services/chatService.ts`):** Gateway가 LOCAL_RESPONSE면 즉시 반환,
> NEED_LLM이면 authGuard → contextSelector → memory → promptBuilder → adapter 순으로 진행한다.
> 문서 규정 순서와 코드가 일치한다.

------------------------------------------------------------

## Sprint 2-14 — Auth Guard (`2d6a04e`)

### 문제
로그인 없이 GPT 호출이 가능하면 비용 폭탄 위험.

### 결정
Auth Guard를 **Gateway 이후**에 둔다. LOCAL_RESPONSE(인사 등)는 로그인 없이 종료, NEED_LLM만 로그인 확인.

```
Gateway → LOCAL_RESPONSE → (로그인 불필요) 종료
Gateway → NEED_LLM → Auth Guard → (로그인 확인) → 이후 파이프라인
```

### 결과
인사는 무료, GPT성 요청은 로그인 필요.

> **실제 코드 확인:** `chatService`는 `authGuard()` 콜백으로 인증을 확인한다. 현재 `chat.tsx`가
> `() => isAuthenticated` 클로저를 주입한다. 별도 `requireAuthenticatedUser` 가드 함수가 존재하지만
> 아직 소비되지 않는다(미사용 export — 기능 영향 없음).

------------------------------------------------------------

## Sprint 2-15 — Supabase Auth / Session 저장 (`938b42c`)

### 초기 계획 → 폐기
`expo-sqlite` 사용 예정이었으나 Web에서 WASM 번들링 오류 발생
(대표 오류: `Unable to resolve module wa-sqlite.wasm`). **expo-sqlite 폐기.**

### 최종 구조
`@react-native-async-storage/async-storage` + Supabase. 더 오래 검증되고 안정적이며 Expo 생태계 사용 사례가 많다.

### 추가 결정
`client.native.ts` / `client.web.ts` 플랫폼 분기도 폐기 → **단일 `client.ts`** 사용
(TypeScript/Metro 동기화 문제, 유지보수성 저하 방지).

> **실제 코드 확인(`services/supabase/client.ts`):** AsyncStorage storage, `autoRefreshToken: true`,
> `persistSession: true`, `detectSessionInUrl: false`. 단일 client 캐싱 구조.
> `AuthContext`는 `getSession()`으로 세션 복구 + `onAuthStateChange` 구독.

------------------------------------------------------------

## Sprint 2-16 — OAuth / Social Login 기반 (`8e05622`)

### 초기 목표
카카오 로그인.

### 발생 문제
Supabase가 카카오 로그인 시 `account_email` 권한을 요청하는데, 카카오 개인 개발자에게는 해당 권한이 없어
**KOE205** 오류가 발생했다.

### 결론
프로젝트 코드 문제가 아니라 외부 Provider(카카오/Supabase)의 제약사항이다.

### 결정
- OAuth 구조·Provider 확장 구조는 유지.
- **카카오는 보류.** Google을 먼저 검토/구현하는 방향.

### 현재 상태 (실제 코드 기준 — 중요)
- **[진행중]** 카카오 OAuth 코드는 존재(`authService.signInWithKakao`, expo-auth-session + WebBrowser).
  로그인 화면(`login.tsx`)에 "카카오로 시작하기" 버튼 존재.
- **[미검증]** 카카오 **실제 로그인 성공은 검증되지 않았다.** 완료로 기록하지 않는다.
- **[계획]** Google / Naver / Apple — `AuthProviderId` 타입에는 존재하나 `authService`에서 kakao 외 전부
  `NOT_SUPPORTED` 반환.
- **[발견된 결함]** `login.tsx`는 라우트로 등록됐으나 앱 어디서도 `/login`으로 이동하지 않는 **Dead Route**다.
  (Sprint 2-17에서 해소 예정)

------------------------------------------------------------

## 현재까지 확정된 아키텍처

```
Chat → Gateway → Auth Guard → ContextSelector → ConversationMemory
     → PromptBuilder → LLM Adapter → (향후) Edge Function → (향후) OpenAI
```

- **구현됨:** Chat UI, Gateway, Auth Guard, ContextSelector, ConversationMemory(계산), PromptBuilder,
  LLM Adapter 인터페이스, Supabase Client/AuthContext.
- **미구현:** 실제 LLM Adapter(현재 `unconfiguredLLMAdapter`가 throw), Edge Function, OpenAI 호출,
  Summary 생성, DB.

------------------------------------------------------------

## 프로젝트에서 절대 바꾸지 않을 원칙

1. **Mock 금지** — 없는 기능은 없는 상태 그대로 둔다.
2. 분석 없이 코드 작성 금지.
3. 승인 없이 구조 변경 금지.
4. UI에서 GPT 직접 호출 금지.
5. Gateway 없이 GPT 호출 금지.
6. 로그인 없이(유료) GPT 호출 금지.
7. AI Model 교체 가능 구조 유지(LLM Adapter).
8. PromptBuilder와 GPT 호출 분리.
9. Context와 Memory 분리.
10. Edge Function을 유일한 GPT 호출 지점으로 유지(향후).

> 상세 개발 규칙은 [AI_CONSTITUTION.md](AI_CONSTITUTION.md), 구조 상세는 [ARCHITECTURE.md](ARCHITECTURE.md),
> 인수인계는 [HANDOVER.md](HANDOVER.md), 제품 요구사항은 [PRD_MASTER.md](PRD_MASTER.md) 참조.

------------------------------------------------------------

## 현재 프로젝트 진행률 (Sprint 2-16 완료 기준)

- 전체 프로젝트: 약 20%
- 구조 설계: 약 70%
- 핵심 아키텍처: 거의 완료(단, LLM 종단·Edge·DB 미구현)

이후부터는 실제 기능 구현 속도가 현재보다 빨라질 예정이다.

------------------------------------------------------------

## 문서 업데이트 원칙

Sprint 하나가 끝날 때마다 이 문서를 갱신한다. 새로운 구조를 추가하면
**왜 추가했는지 / 왜 다른 방식을 버렸는지 / 무엇을 얻었는지**를 기록한다.

이 문서는 DeokbunAI 프로젝트의 **"설계 역사"**다.
