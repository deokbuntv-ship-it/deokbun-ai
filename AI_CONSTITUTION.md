# AI_CONSTITUTION.md

> DeokbunAI 개발 헌법 (Development Constitution)
>
> 이 문서는 DeokbunAI 개발에서 Claude Code와 모든 개발자(사람/AI)가 따라야 할 **최상위 개발 규범**이다.
> 개별 Sprint 지시, 코드 스타일, 편의보다 우선한다.
>
> Source of Truth 우선순위에서 이 문서는 **실제 Repository 코드 다음, 다른 모든 설계 문서보다 위**에 있다.
> (1. 사용자 최신 결정 → 2. 실제 코드 → **3. AI_CONSTITUTION.md** → 4. ARCHITECTURE → 5. PROJECT_HISTORY → 6. HANDOVER → 7. PRD_MASTER 확정분 → 8. 과거 아이디어)
>
> 작성일: 2026-08-07 · 기준 커밋: `87ec6e8`

------------------------------------------------------------

## 제0조 — 이 헌법의 지위

1. 이 헌법과 개별 지시가 충돌하면, 안전·무결성 관련 조항(승인·Mock 금지·Secret·순서 잠금)은 헌법이 우선한다.
2. 헌법을 바꿔야 한다고 판단되면 임의로 바꾸지 말고 먼저 사용자에게 보고하고 승인받는다.
3. 실제 코드가 헌법·설계 원칙을 위반한 것으로 보이면 코드를 정답으로 정당화하지 말고 **Architecture Drift로 보고**한다(제29조).

------------------------------------------------------------

## 제1장 — 작업 프로세스

**제1조 (진행 순서).** 모든 작업은 `분석 → 승인 → 구현 → 검증 → Commit → Push` 순서를 따른다. 반대로 하지 않는다.

**제2조 (승인 전 수정 금지).** 사용자 승인 전에는 Application Code를 수정하지 않는다. 분석/문서 작업만 수행한다.

**제24조와 연계 — 선(先)수행 원칙.** Claude가 수행 가능한 작업(코드에서 할 수 있는 부분)은 최대한 먼저 수행하고, 사용자만 할 수 있는 지점에서 멈춘다(제23조).

**제30조 (추측 완료 보고 금지).** Repository 실제 상태를 확인하지 않고 추측으로 "완료"를 보고하지 않는다. 상태 표기는 `[완료]`(구현+검증) / `[진행중]` / `[계획]`로 구분한다.

**제22조 (검증 필수).** 변경 후 반드시 검증한다. 최소 `npx tsc --noEmit`, UI 변경 시 `npm run web` + 육안, Native 영향 시 Native 테스트.

**제21조 (TypeScript 오류 0).** 커밋 시점에 TypeScript 오류 0을 유지한다.

------------------------------------------------------------

## 제2장 — 구현 무결성

**제3조 (Mock/Fake 금지).** Mock 데이터·Fake Session·Fake User·가짜 응답으로 기능을 구현하지 않는다. 없는 기능은 없는 상태 그대로 둔다.

**제4조 (위장 금지).** 구현되지 않은 기능을 구현된 것처럼 문서/보고/코드에서 위장하지 않는다.

**제5조 (과도한 리팩토링 금지).** Sprint 목표와 무관한 리팩토링을 하지 않는다. "가장 작은 변경"을 우선한다. 억지 추상화로 복잡도를 높이지 않는다.

**제6조 (기존 동작 파괴 금지).** 현재 정상 동작하는 기능을 깨뜨리지 않는다. 회귀가 의심되면 멈추고 보고한다.

**제27조 (임의 제품 구현 금지).** 사용자가 확정하지 않은 Product 요구사항을 임의로 구현하지 않는다.

**제28조 (Open Decision 보존).** 확정되지 않은 사항은 임의 결정하지 않고 문서의 Open Decisions에 남긴다.

------------------------------------------------------------

## 제3장 — AI 파이프라인 아키텍처 (순서 잠금)

**제10조 (파이프라인 순서).** 다음 순서를 변경하지 않는다.
```
UI → ChatService → AIGateway → Auth Guard → ContextSelector → ConversationMemory
   → PromptBuilder → LLMAdapter → (향후) Edge Function → (향후) LLM Provider
```
`AIGateway → LOCAL_RESPONSE → 종료`, `AIGateway → NEED_LLM → Auth Guard → 이후 파이프라인`.

**제7조 (UI의 LLM 직접 호출 금지).** UI는 LLM을 직접 호출하지 않는다. LLM을 아는 것은 ChatService/Adapter 계층뿐이다.

**제11조 (Gateway Exact Match).** AIGateway는 정규화 후 Exact Match를 유지한다. 부분 문자열 매칭(`String.includes`)으로 상담 질문을 LOCAL 처리하지 않는다.
- 참고: 현재 코드의 `rule.phrases.includes(normalized)`는 **배열 정확일치**로 본 조를 준수한다. 이를 위반으로 오해해 수정하지 않는다.

**제10-1조 (Auth 이후 순서).** AIGateway → Auth Guard 순서를 유지한다. Auth Guard를 Gateway 앞으로 옮기지 않는다.

**제13조 (ContextSelector 최소 선택).** ContextSelector는 필요한 Context만 선택한다. 가용 데이터 전량을 전송하지 않는다(비용·노이즈·개인정보 최소화).

**제14조 (중복 요약 금지).** Conversation Memory는 이미 요약에 반영된 메시지를 다시 요약 대상에 넣지 않는다(`lastSummarizedMessageId` 체크포인트). Summary 생성은 Threshold 기반으로만 수행한다.

**제15조 (PromptBuilder 순수성).** PromptBuilder는 Network/LLM 호출을 하지 않는다. 순수 Prompt 구성만 담당한다.

**제16조 (Adapter 교체 가능성).** LLM Adapter를 통해 모델을 교체할 수 있는 구조를 유지한다. Core Architecture를 특정 모델명에 종속시키지 않는다.

------------------------------------------------------------

## 제4장 — 계산엔진과 해석 분리

**제17조 (분리 원칙).** 계산엔진과 LLM 해석을 분리한다.
```
출생정보 → 계산엔진 → 구조화 결과 → ContextSelector → Prompt → LLM 해석
```

**제18조 (임의 계산 생성 금지).** 특정 역학 계산(명리·자미두수·기문둔갑 등)의 원본 계산을 LLM이 임의로 만들어내게 하지 않는다. 계산은 계산엔진이, 해석만 LLM이 담당한다.

------------------------------------------------------------

## 제5장 — 인증 · 보안 · 서버 경계

**제9조 (Server Boundary).** 실제(유료) LLM 호출은 Supabase Edge Function을 Server Boundary로 삼아 서버에서만 수행한다(향후). Client Auth Guard만으로 보안이 완료됐다고 간주하지 않는다.

**제12조 (Auth 없는 유료 호출 금지).** 로그인 전에는 비용이 발생하는 LLM 호출을 허용하지 않는다. 단, AIGateway의 LOCAL_RESPONSE는 로그인 없이 허용한다.

**제8조 (API Key 보호).** OpenAI API Key를 Client Bundle·`EXPO_PUBLIC_*`·코드에 저장하지 않는다. Server 전용 Secret(Edge Function Secret 등)에서만 사용한다.

**제20조 (Secret/Token 로그 금지).** Access Token·Refresh Token·OAuth Client Secret·API Key·Supabase Service Role Key·OAuth Callback 전체 URL·사용자 민감정보 전체를 로그로 출력하지 않는다.

**제19조 (개인정보 최소 수집).** 기능적 필요가 없는 개인정보(주소·전화·불필요 실명 등)를 요구하지 않는다. 출생정보 등 민감정보를 URL Query Parameter로 전달하지 않는다. Open Redirect를 방지하고 내부 허용 Route만 사용한다.

------------------------------------------------------------

## 제6장 — 우선순위 · 안정성

**제25조 (우선순위).** 다음 순서를 지킨다.
```
1. 서비스 안정성  2. 상담 품질  3. 보안  4. 비용 효율  5. 부가기능
```

**제26조 (안정성 우선).** 비용 절감을 이유로 로그인 실패·세션 손실·접속 불가·잘못된 AI 답변을 만들지 않는다. 비용 절감은 UX 훼손이 아니라 Architecture에서 해결한다.

------------------------------------------------------------

## 제7장 — 세션 · 저장 구조 (확정 사항)

**제S-1조.** Supabase Auth를 인증의 Single Source of Truth로 유지한다. `getSession()` + `onAuthStateChange` 구조를 유지한다.

**제S-2조.** 세션 저장은 AsyncStorage 기반 단일 `client.ts` 구조를 유지한다. 특별한 기술적 검증 없이 expo-sqlite로 되돌리지 않는다(Web WASM 문제로 폐기된 방식).

------------------------------------------------------------

## 제8장 — 외부 설정 · 협업

**제23조 (외부 작업 중단·안내).** 외부 계정·인증·심사·콘솔 설정(Google Cloud, Supabase Dashboard, OAuth Consent, Store 심사 등)이 필요하면, 사용자가 직접 해야 할 시점에 **작업을 멈추고 한 단계씩 안내**한다. Claude가 대신 완료했다고 처리하지 않는다.

**제23-1조.** Client Secret 등 비밀값을 채팅으로 요구하지 않으며, 코드에 하드코딩하지 않는다.

**제NG조 (추측 금지).** 외부 연동 방식(예: Native SDK 필요 여부, SHA-1, Provider 지원 상태)은 추측하지 않고 구현 시점의 공식 문서를 확인한다.

------------------------------------------------------------

## 제9장 — Drift · 문서

**제29조 (Drift 보고).** Architecture Drift(문서-코드 불일치, 원칙 위반)를 발견하면 임의로 코드를 수정하지 말고 먼저 보고한다.

**제D조 (문서 동기화).** 구조/책임/제품 방향을 변경하면 관련 기준 문서(ARCHITECTURE / PROJECT_HISTORY / HANDOVER / PRD_MASTER)를 갱신한다. 5대 기준 문서:
[PROJECT_HISTORY.md](PROJECT_HISTORY.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [AI_CONSTITUTION.md](AI_CONSTITUTION.md) · [HANDOVER.md](HANDOVER.md) · [PRD_MASTER.md](PRD_MASTER.md).

------------------------------------------------------------

## 부칙 — 절대 임의로 바꾸지 않는 것

사용자의 명시적 승인 없이 다음을 변경하지 않는다.
- 자유 Chat 중심 UX / 출생정보 후 바로 Chat
- 학문명(명리·자미두수·기문둔갑) 기본 UI 노출 최소화
- 로그인 전 유료 API 호출 금지
- 모델 교체 가능한 AI 구조 / 계산엔진과 LLM 분리
- 질문 제한 없는 무료 베타 지향
- 파이프라인 순서 잠금 / Gateway Exact Match / AsyncStorage 단일 Client
- 안정성 > 비용 절감

------------------------------------------------------------

*이 헌법은 기준 커밋 `87ec6e8`의 Repository 상태를 근거로 작성되었다. 개정은 사용자 승인으로만 한다.*
