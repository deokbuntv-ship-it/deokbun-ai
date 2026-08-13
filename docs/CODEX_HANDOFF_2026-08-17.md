# CODEX HANDOFF — 2026-08-17

> Claude가 2026-08-11 ~ 08-16 자율 스프린트에서 남긴 인수인계 문서.
> Codex가 이 문서 + Repository만 읽고 8/17부터 즉시 병렬 작업을 시작할 수 있도록 작성.
> 브랜치: `admin/master-operations-content`. 원격 동기 HEAD = `390f8a8`.
> **원격 미push 로컬 커밋**: `383ea14`(스키마/handover) → `f45a675`(analysis 계약) →
> (이 문서 커밋). 사용자 검수 전 push 금지.
>
> 📌 **갱신 (2026-08-14):** 위 "원격 HEAD `390f8a8`"·미push 체인 서술은 낡음 — 현재
> HEAD = `cf2fe7e`. 테스트 러너 "없음"(§13)도 낡음 — jest 200 테스트 존재. Codex 작업의
> 현재 우선순위/상태는 [`DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md`](DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md)
> §23 참조. 본 문서의 §21(엔진→프롬프트)·§22(Intelligence) 기술 내용 자체는 유효하다.

---

## 1. Claude가 이번 스프린트에서 완료한 작업
- `docs/CONSUMER_CORE_SCHEMA.sql` — repo에 없던 소비자 코어 테이블(profiles /
  consultation_subjects / conversations / conversation_messages) DDL+RLS를 서비스
  코드에서 정확히 복구. 멱등·비파괴. **검증 결과: `NEEDS_OWNER_DB_COMPARISON`**
  (컬럼명은 서비스+admin RPC와 100% 일치, 단 라이브 DB와 타입/제약/RLS 파리티는
  오너가 대조 후 확정). live 적용 안 함.
- `src/features/analysis/**` — **엔진 외부(Engine-external) 계약/오케스트레이션
  레이어** 신규(Claude 소유). frozen 엔진 미import·미수정.
  - `errors.ts` 표준 에러 계약 + `toAppErrorCode()` 매핑(+친절 메시지).
  - `requestId.ts` 상관관계 ID(PII 없음).
  - `aiOutput.ts` `StructuredAiResponse` 계약 + `parseStructuredAiResponse()`
    (비구조 응답 → null, Markdown fallback; 엔진 내용 조작 없음).
  - `engineOrchestration.ts` 제품수준 엔진 eligibility + connection flag +
    `buildInterpretationContext()` seam(현재 전부 `engine_not_connected`).
  - `__tests__/analysis.spec.ts` tsc 검증 spec(러너 미설치 → `runAnalysisSpecs()`).
- HANDOVER.md §0에 2026-08-11 최신 현황/gap 기록.

## 2. 절대 수정하지 않은 Codex FROZEN 파일
- **`src/features/interpretation/**` 전체 — 이번 스프린트 변경 0.**
  (명리 계산/규칙/golden fixtures/contracts 모두 미변경. `git log -- src/features/interpretation`
  로 확인 가능.)

## 3. 현재 명리(SAJU) 엔진 상태
- **구현·검증됨(~10K LOC).** `executeSaju`/`executeSajuFromBirthInput`, 사주 4주,
  60갑자, 파생사실(오행/십신/지장간/음양), KASI 음양력 데이터셋+resolver, Asia/Seoul
  역사적 timezone, birth 정규화 + golden fixtures 19종 + `validate*` invariant.
- **단, LLM 파이프라인에 미연결.** `src/features/chat/selectors/contextSelector.ts`는
  원시 생년월일 문자열만 전달하고 `executeSaju`를 호출하지 않음 → 헌법 제17조(출생정보
  →계산엔진→구조화→Prompt→LLM)는 아직 미구현. **최고가치 통합 지점.**
- 노출: `/subject-manse`(`manse/services/manseAdapter.ts`)만. `fortuneCycleAvailable`
  는 항상 false(대운/세운 미구현).

## 4. 명리 엔진 외부 Adapter seam (Codex가 채울 지점)
- `src/features/analysis/engineOrchestration.ts`:
  - `ENGINE_CONNECTED.saju = false` → Codex가 SAJU 연결 시 `true`로.
  - `buildInterpretationContext()`의 `engines.saju.fact`가 비어 있음 → Codex가 여기(또는
    하위 `runEngine(kind,input)` seam)에서 frozen `executeSaju` 결과를 매핑해 채움.
  - `FROZEN_ENGINE_ID`가 app `EngineKind`(saju/ziwei/qimen) ↔ frozen `EngineId`
    (SAJU/ZIWEI/QIMEN) 매핑을 제공.
- **경계 원칙**: Claude는 오케스트레이션/컨텍스트 shaping/LLM 담당, Codex는 seam 뒤
  실제 엔진 실행/정확성 담당. 이 파일(`engineOrchestration.ts`)이 공유 경계.

## 5. 자미두수(ZIWEI) contract 상태
- frozen `src/features/interpretation/contracts/ziwei.ts`에 `ZiweiEngineInput` 타입만
  존재. **계산기 미구현(MISSING).** app 측 `ENGINE_CONNECTED.ziwei=false`,
  eligibility는 출생시간 필요(`missing_birth_time`).

## 6. 기문둔갑(QIMEN) contract 상태
- frozen `contracts/qimen.ts`에 `QimenEngineInput` 타입만. **계산기 미구현(MISSING).**
  제품 규칙: 시점/선택 질문일 때만 applicable(`resolveEngineEligibility('qimen')`).

## 7. Normalized Engine Contract
- frozen `contracts/result.ts`(`EngineResult`), `contracts/normalization.ts`
  (`EngineCapabilityStatus/Assessment`)가 엔진 내부 표준결과를 이미 정의(FROZEN, 재사용).
- app 외부 소비용 `NormalizedInterpretationContext`(subject presence flags/question/
  timing/engines[availability,fact?]/warnings)는 `analysis/engineOrchestration.ts`에 신규.
  Codex는 frozen `EngineResult` → 이 envelope의 `fact`로 매핑하는 adapter를 seam 뒤에 구현.

## 8. Cross Analysis Skeleton
- frozen `contracts/cross.ts`에 `NormalizedEngineResult`/cross 입력 타입 존재(FROZEN).
- app 측 오케스트레이션 skeleton: `buildInterpretationContext()`가 available 엔진 수집 +
  unavailable 사유 보존 + bounded 컨텍스트 생성까지 담당. **학문적 교차판단 규칙은
  코드로 만들지 않음**(§11/§23) — Codex/후속 확정 대상.

## 9. Structured AI Output Contract
- `analysis/aiOutput.ts` `StructuredAiResponse` = { conclusion, overallAssessment,
  evidence{myungri,ziwei,qimen: {availability, summary?, detail?}}, timing?,
  limitations?, followUpQuestions[] }. availability enum: available/not_applicable/
  missing_birth_time/engine_not_connected/calculation_failed.
- `parseStructuredAiResponse(text)`는 LLM이 이 스키마(JSON)를 낼 때만 파싱, 아니면 null.
  현재 프롬프트는 이 스키마를 요청하지 않으므로 실사용에선 null → UI가 Markdown fallback.

## 10. Codex가 8/17부터 맡아야 할 정확한 작업 (우선순위)
1. **SAJU→파이프라인 연결**: `contextSelector`에서 `executeSaju` 실행 →
   `engineOrchestration`의 `runEngine`/`fact` 채우기 + `ENGINE_CONNECTED.saju=true`.
   출생시간 모름 시 시주 조작 금지(§13). 헌법 제17조 충족.
2. **프롬프트에 엔진 evidence 주입**: `promptBuilder`가 `NormalizedInterpretationContext`를
   받아 bounded engine evidence를 포함(제10조 파이프라인 순서 유지, UI가 LLM 직접호출 금지).
3. **자미두수 계산기 구현**(frozen 내부, `contracts/ziwei.ts` 기반) + connection.
4. **기문둔갑 계산기 구현**(시점질문 조건) + connection.
5. **Cross-analysis 실제 판정 로직**(학파 규칙 확정 후) — `contracts/cross.ts` 구현.

## 11. 파일 소유권 제안
- **CODEX 소유**: `src/features/interpretation/**`(명리 정확성/자미두수/기문둔갑/golden
  fixtures/engine 전용 테스트), 엔진 결과 → `fact` 매핑 adapter.
- **CLAUDE 소유**: `src/features/auth|chat(파이프라인)|analysis|fortune|admin`, DB/Edge,
  UI 통합, monitoring, release.
- **공유 경계(동시수정 금지)**: `src/features/analysis/engineOrchestration.ts`(seam),
  `src/features/chat/selectors/contextSelector.ts`, `.../prompts/promptBuilder.ts`.

## 12. 병렬 작업 시 충돌 금지 파일
동시에 수정하지 말 것: `analysis/engineOrchestration.ts`, `chat/selectors/contextSelector.ts`,
`chat/prompts/promptBuilder.ts`, `chat/services/chatService.ts`(파이프라인 순서 잠금).
사전에 담당 배정 후 순차 편집 권장.

## 13. 실행할 테스트
- 현재 **테스트 러너 없음**(jest-expo/vitest 미설치; eslint 설정도 없음 = 기술부채).
  `src/features/analysis/__tests__/analysis.spec.ts`는 tsc로 타입검증되며
  `runAnalysisSpecs()`로 호출 가능. 러너 도입 후 최우선 대상: error mapping,
  engine eligibility/availability, structured-output parser, (이후) ownership/rate-limit/
  fortune idempotency, admin authorization.
- 엔진 golden fixtures는 **FROZEN** — Codex 담당, 이 스프린트 미변경.

## 14. 알려진 Blocker
- **Manual(오너)**: `CONSUMER_CORE_SCHEMA.sql` + 대기 마이그레이션 적용, edge 재배포
  (content-generate/media/video), `OPENAI_API_KEY` quota, `GEMINI_API_KEY`, OAuth 콘솔
  (Kakao KOE205/Google/Naver/Apple), 인증 관리자 육안 QA. → `docs/OWNER_ACTIONS_AND_DECISIONS.md`.
- **Code(Claude 계속)**: chat rate-limit(§6), fortune-mail 도메인 인프라/idempotency(§14~16),
  admin 운영 데이터 계약(ModelPricingConfig/EngineTelemetry/AdminAudit, §17~20), 앱 오류
  로깅, 표준 에러 계약의 서비스 적용, 보안 감사(IDOR/RLS 재확인).
- **엔진(Codex)**: SAJU 파이프라인 연결, 자미두수/기문둔갑 계산기, cross-analysis 규칙.

---

## 15. Claude PRE-CODEX SPRINT 2 (2026-08-11) — 결과 + CONTINUE FROM HERE

**추가된 엔진 외부 모듈(전부 순수/계약, frozen·UI·live-DB 무변경, tsc 0):**
- `src/features/analysis/rateLimit.ts` — 순수 `checkRateLimit`(burst/duplicate/
  concurrent + retryAfter → LLM_RATE_LIMIT/DUPLICATE_REQUEST) + `boundRecentByChars`
  (토크나이저 의존 없는 컨텍스트 바운딩). chat Edge에서 상태 주입식으로 사용 가능
  (배포 대기). **미배선**(chatService/edge 미수정).
- `src/features/analysis/logging.ts` — PII-safe `AppErrorEvent`+`AppErrorLogger`+
  console adapter (Sentry adapter만 추가하면 연결).
- `src/features/fortune/domain/fortuneDomain.ts` — FortuneMailType/Status +
  전이 머신 + deterministic `fortuneIdempotencyKey` + `evaluateFortunePipeline`
  (엔진 미연결 시 ENGINE_NOT_CONNECTED에서 정지, 가짜 운세 없음) + 구조 검증.
- `src/features/admin/operational/operationalContracts.ts` — `ModelPricingConfig`
  + 순수 `computeCost`(가격 없으면 null, 가짜 ₩0 없음) + `EngineTelemetryRepository`
  seam + `AdminAuditEvent`/`AdminAuditService`(+noop, 가짜 audit 없음).
- specs: `src/features/analysis/__tests__/analysis.spec.ts`(러너 미설치 → tsc 검증
  + `runAnalysisSpecs()`).

**보안 감사(코드 기준)**: CRITICAL/HIGH 0. MEDIUM 1건(M1: `consultationDraftService`가
클라이언트 제공 `user_id`를 draft에 insert — 해당 테이블 RLS `WITH CHECK
(user_id=auth.uid())` 확인 필요; 없으면 default auth.uid()로 전환 권장. draft
DDL/RLS가 repo에 없어 미검증). service_role/OpenAI 키 클라 노출 0, XSS 싱크 0,
PII 로그 0. RLS parity는 계속 NEEDS_OWNER_DB_COMPARISON.

**API drift(경미)**: `chatConfig.defaultModel='gpt-mini-placeholder'`는 전송되나
서버가 `LLM_MODEL`로 결정 → 사실상 dead config(위험 아님). 정리는 후속.

**CONTINUE FROM HERE (다음 Claude 세션이 바로 이어받을 것):**
1. rate-limit을 chat Edge에 배선(요청 시작 시 `checkRateLimit`, 종료 시
   `releaseInFlight`; 상태 저장은 Postgres row 또는 함수 메모리). edge 배포는 오너.
2. 표준 Error Contract를 chatService/consultation/subject/admin 서비스 경계에 적용
   (raw→`toAppErrorCode`, UI엔 `userMessage`, 로그엔 requestId). backward-compatible,
   UI 파일 무변경 원칙.
3. `newRequestId`를 chatService→persistence 경로에 실제 전파.
4. M1 보안: draft 테이블 RLS 확인/보정(SQL artifact만).
5. fortune 도메인의 idempotency DB unique constraint를 SQL artifact로 작성(live 미적용).
6. 테스트 러너(jest-expo/vitest) 도입 결정(현재 기술부채) 후 specs 실행.
(엔진 계산 연결·자미두수/기문둔갑·cross는 Codex 8/17.)

---

## 16. Claude INTEGRATION SPRINT (2026-08-11) — A~G 실제 배선 완료

SPRINT 2의 "CONTINUE FROM HERE" 1~6 + 테스트 러너를 **실제 경로에 배선**했다.
전부 로컬 커밋(remote push 없음). frozen engine(`src/features/interpretation/**`)
및 UI 스크린 무변경. 게이트: `npx tsc --noEmit` 0 errors, `expo export --platform web`
EXIT 0, `npx jest` 12/12.

**커밋 체인(로컬):**
- `690a192` chore(db): fortune idempotency + draft ownership RLS artifacts (E, F)
- `1e79c7c` feat(core): error contract + requestId + context bound → chatService (B, C, D)
- `1ea0174` feat(edge): per-user burst rate limit before LLM call (A)
- `f0bfd04` feat(core): error contract → subject/consultation DB services (B)
- `b020351` test(core): minimal jest + ts-jest runner (G)
- `ea259f9` feat(core): requestId end-to-end client→edge→logs→persistence (C 완결)

**A. Rate limit 배선(chat Edge):** `supabase/functions/chat/index.ts`에
`checkBurstRateLimit` 추가 — 유료 LLM 호출 전 기존 `ai_usage_logs`(신규 인프라 없음)
에서 사용자별 최근 창(window) 요청수를 세어 초과 시 429 `RATE_LIMITED`+`Retry-After`.
정책은 순수 모듈 `rateLimit.ts`(DEFAULT_RATE_LIMIT) 반영. **FAIL-OPEN**(인프라 오류 시
통과), 거부는 콘솔 로깅만(피드백 루프 방지). `CHAT_RATE_WINDOW_MS`/`CHAT_RATE_MAX_REQUESTS`
env로 조정. Deno라 tsc 제외 → **오너 `supabase functions deploy chat` 필요**(배포 전 무영향).

**B. Error Contract 배선:** chatService(실패 시 표준 AppErrorEvent 로깅, `errorCode`
문자열 값은 UI 호환 위해 유지) + subject/consultation DB 서비스(모든 `throw error` →
`logDbError(raw, source, op)`: 매핑된 AppErrorCode+기술 pg SQLSTATE+requestId를 PII-safe
로깅 후 **원본 에러 재-throw** → `birth-info.tsx`의 `error.code==='23505'` 분기 등 raw
소비자 무손상). 신규: `pgErrorToAppCode`/`pgCodeOf`(errors.ts), `logDbError`(logging.ts).

**C. requestId 전파(end-to-end):** client(chatService `newRequestId`) → 결과 반환 +
실패 로깅 → adapter가 invoke body로 전달 → edge가 sanitize(≤64, `[A-Za-z0-9_-]`, non-PII)
후 모든 실패 로그 + `ai_usage_logs.request_id`에 저장. 저장은 **telemetry-safe**: 컬럼
없으면 request_id 없이 재삽입(텔레메트리 무손실). 아티팩트 `docs/AI_USAGE_LOGS_REQUEST_ID.sql`
(additive/idempotent, 오너 적용, 순서 무관).

**D. Context bounding 배선:** chatService에서 buildPrompt 이전 `boundRecentByChars`로
recent 대화를 문자수 기준 추가 바운드(기존 message-count 캡 위 defense-in-depth). 시스템/
컨텍스트/summary 프롬프트는 buildPrompt가 조립하므로 무영향. `boundRecentByChars`는 getText
셀렉터로 일반화(ChatMessage `.text` / LLM `.content` 모두 지원).

**E/F. DB 아티팩트(live 미적용):** `docs/FORTUNE_MAIL_SETUP.sql`(UNIQUE(idempotency_key)),
`docs/DRAFT_RLS_SETUP.sql`(M1: WITH CHECK RLS 권장안+대안). 둘 다 owner-apply.

**G. 테스트 러너(이전 BLOCKED → 해제):** jest@29 + ts-jest@29 + @types/jest 설치(레지스트리
도달 가능, clean install). `jest.config.js`+`tsconfig.jest.json`(Expo base 미상속 →
ts-jest에서 TS5011/node10-deprecation 회피). `analysis.test.ts` 12 tests(runAnalysisSpecs
구동 + 이번 스프린트 신규 primitive 네이티브 검증). `**/*.test.ts`는 앱 tsc 게이트에서 제외
(러너 글로벌은 ts-jest가 타입 인지; 정식 게이트는 `tsc --noEmit` 유지). `npm test` 동작.

**공유 경계(do-not-co-edit) 갱신:** engineOrchestration.ts / contextSelector.ts /
promptBuilder.ts / chatService.ts에 더해 이제 chat Edge(`supabase/functions/chat/index.ts`),
supabaseEdgeLLMAdapter.ts, analysis 배럴/errors/logging/rateLimit도 Claude 활성 편집 영역.

**오너 매뉴얼(코드 아님, 배포/DB만):**
- `supabase functions deploy chat` — A(rate limit) + C(edge requestId 로깅/저장) 활성화.
- (선택) `docs/AI_USAGE_LOGS_REQUEST_ID.sql` 적용 — request_id 영속화 시작(순서 무관, 안전).
- (선택) `docs/FORTUNE_MAIL_SETUP.sql` / `docs/DRAFT_RLS_SETUP.sql` — 운세메일/draft RLS.
- RLS parity는 여전히 NEEDS_OWNER_DB_COMPARISON(CONSUMER_CORE_SCHEMA.sql 대조).
(엔진 계산 연결·자미두수/기문둔갑·cross normalize는 Codex 소관 — frozen 유지.)

---

## 17. Claude PRE-CODEX NON-UI SPRINT (2026-08-11) — 결과 + GAP + Codex 시작점

UI 작업 종료 후 비UI V1.0 작업을 계속 진행(§directive). 전부 로컬 커밋, remote push
없음. **사용자/관리자 UI 파일 0 변경, frozen `interpretation/**` 0 변경.**

**이 스프린트 로컬 커밋:**
- `2d55ebd` test(core): 비UI 회귀 커버리지 12→53 (chatLogic/fortuneDomain/analysisExtra)
- `e677dfd` feat(core): conversationService 8개 경계에 error contract(logDbError) 배선
- `32f1a8a` docs+feat: ZIWEI/QIMEN 엔진 SPEC + cross-analysis 구조 계약(+tests) → 59 tests

### V1.0 GAP (코드 기준, 2026-08-11)
| 영역 | 상태 |
|---|---|
| Auth (kakao/google, is_admin RPC) | DONE |
| User/Profile · Subjects · Draft persistence | DONE |
| Consultation / Conversation persistence / Memory | DONE (memory windowing 테스트됨) |
| LLM 호출 (chat Edge, OpenAI Responses) | DONE (배포는 Owner) |
| Prompt pipeline (gateway/context/memory/promptBuilder/adapter) | DONE |
| Rate limit / requestId / Error contract / Logging | DONE (edge+services 배선) |
| Context bounding | DONE (boundRecentByChars 배선+테스트) |
| **SAJU 엔진** | 엔진 DONE(Codex, frozen; manse/services가 소비) / **prompt 배선 MISSING(CODEX_OWNED)** |
| SAJU→context→prompt 배선 | **CODEX_REVIEW** (공유경계·제10조 pipeline lock) |
| 자미두수 / 기문둔갑 엔진 | MISSING → **SPEC 작성됨**(계산규칙 미창작), 구현 CODEX_OWNED |
| Cross-analysis | 구조 계약 DONE(crossAnalysis.ts) / 실제 대조 규칙 CODEX |
| Fortune Mail (domain/status/idempotency) | DONE(+테스트) / 생성은 엔진 필요(정지) / 테이블 artifact |
| Structured AI response 계약 | DONE (parseStructuredAiResponse, fallback 포함, 테스트됨) |
| Admin backend (pricing/cost/telemetry/audit 계약) | DONE (operationalContracts) |
| Security | CRITICAL/HIGH/MEDIUM 0 (재확인) |
| DB/RLS | 코드-도출 artifact 존재 / live parity NEEDS_OWNER_DB_COMPARISON |
| Testing | Jest 59 tests, 5 suites, green |
| Native build / Release | 미착수 (Owner/Codex) |

### SAJU integration readiness (§14) — 정확한 seam
- 엔진 계산 경로: `BirthInfo → src/features/manse/services/{birthInputMapper,manseAdapter,manseService} → interpretation(frozen) → chart`. **존재/동작.**
- 엔진-외부 컨텍스트 seam: `analysis/engineOrchestration.buildInterpretationContext()` — **존재하나 chat pipeline에서 미호출**, promptBuilder는 engine evidence 미소비.
- **누락 배선(=Codex 첫 작업 후보 #1):** manse/engine 결과 → `EngineEvidence`(saju) → `buildInterpretationContext` → `promptBuilder` 입력. 이 3파일(contextSelector/promptBuilder/chatService)은 **do-not-co-edit 공유경계**라 Claude가 이번에 건드리지 않음. `ENGINE_CONNECTED.saju`를 true로 바꾸는 것도 이 배선과 함께.

### 자미두수/기문둔갑 (§16–§21)
- `docs/ZIWEI_ENGINE_SPEC.md`, `docs/QIMEN_ENGINE_SPEC.md`: 입출력 계약 + 계산 STAGE + CONFIRMED/SCHOOL-DEPENDENT/UNVERIFIED 태그 + 학파/윤달/LMT 불확실성 레지스터 + fixture 구조. **계산 표/공식 미포함(창작 금지).**
- **Fixture(§17/§20) 미작성**: expected 차트/반은 **검증된 reference(Owner/Codex 입력)** 필요 → 구조만 정의. (창작 expected 금지)
- 구현(§18/§21)은 reference 확보 후 CODEX_OWNED. Claude 구현이 필요하면 `src/features/{ziwei,qimen}-engine-claude/` 분리 경로(frozen 미접촉).

### Codex 첫 작업(8/17, 우선순위)
1. **SAJU→prompt 배선** (위 seam) — 공유경계 편집 권한은 Codex. `buildInterpretationContext` 실제 호출 + evidence 직렬화 + promptBuilder 입력 + `ENGINE_CONNECTED.saju=true`.
2. 자미두수/기문둔갑 학파(ruleVersion) 확정 + reference 인용 + fixture 작성 → stage별 구현.
3. cross-analysis 실제 도메인 대조(엔진 polarity 산출) — 구조 계약(crossAnalysis.ts) 위에.

### Codex가 덮어쓰면 안 되는 것
- `src/features/analysis/**` (Claude engine-external 계층: errors/logging/rateLimit/requestId/aiOutput/engineOrchestration/crossAnalysis + barrel) — 확장은 협의.
- `src/features/fortune/domain/fortuneDomain.ts` (Claude domain + 테스트).
- 테스트: `**/__tests__/*.{spec,test}.ts`, `jest.config.js`, `tsconfig.jest.json`.
- 승인된 UI(사용자/관리자) — Claude Design/Owner 소관.

### Owner manual blockers (BLOCKED_OWNER, 코드 아님)
- `supabase functions deploy chat` (rate limit + edge requestId 활성화).
- SQL artifact 적용: CONSUMER_CORE_SCHEMA / FORTUNE_MAIL_SETUP / DRAFT_RLS_SETUP / AI_USAGE_LOGS_REQUEST_ID (live DB diff 후).
- 자미두수/기문둔갑 **canonical 학파** 결정 + 검증 reference 제공(엔진 구현 unblock).
- Native build / 스토어 계정.

---

## 18. Claude ZIWEI REUSE-FIRST IMPLEMENTATION (2026-08-12)

자미두수 계산 기능을 **REUSE-first**로 구축. Core = **iztro@2.5.8**(MIT), Claude-owned
`src/features/ziwei/**` 모듈로 통합. frozen `interpretation/**` 무변경, UI 무변경.

**BUILD vs REUSE 판정:** `REUSE_WITH_ADAPTER`
- iztro@2.5.8: MIT · transitive 전부 MIT(dayjs/i18next/lunar-lite/lunar-typescript) · 최근 유지(2026-03) · 순수 JS(Expo/web 번들 확인) · TS 타입 제공 · ko-KR 출력 · 命宮/身宮/12궁/五行局/14主星/四化/大限 커버 · deterministic.
- reject: 자체 전체 구현(불필요·정확성 검증 부담), 미검증 라이브러리.

**아키텍처(라이브러리 격리):**
- `adapters/iztroAdapter.ts` — **iztro를 import하는 유일한 파일**. 버전 pin(`IZTRO_VERSION='2.5.8'`, `ZIWEI_RULESET_VERSION='iztro-default@2.5.8'`), narrow raw 타입. 교체 시 이 파일만.
- `adapters/ziweiInputAdapter.ts` — BirthInfo→ZiweiInput. **RAW 양력 생일**을 Core에 전달(사주 캘린더로 이중정규화 안 함, §8). exact 시간만 계산, 아니면 `missing_birth_time`(가짜 시진 없음).
- `adapters/ziweiResultAdapter.ts` — iztro astrolabe→`ZiweiChart`(사실 1:1, 四化 flatten).
- `adapters/ziweiEvidenceAdapter.ts` — `ZiweiChart`→`EngineEvidence`(bounded, **사실만**, 해석 없음, availability 매핑). cross-analysis 계약과 연결 가능.
- `services/ziweiService.ts` — `computeZiweiChart(birth)` deterministic, availability/error(reason 코드).
- `validation/ziweiValidation.ts` — 구조 검증(12궁·身宮 1개·五行局 등).
- `domain/ziweiTypes.ts` — DeokbunAI 자체 타입 + `timeIndexFromHour`.

**커버리지:** 命宮/身宮/12궁/五行局/命主·身主/14主星(+四化)/大限 = iztro 결과를 normalize.

**테스트(17):** timeIndex 매핑, availability gating(가짜 chart 없음), 구조 정확성, **DETERMINISM(바이트 동일)**, 四化 landing, evidence 사실-only, + iztro@2.5.8 **CHARACTERIZATION LOCK**(독립 정확성 주장 아님). 전체 jest 84/84.

**정직성/미결(Owner/Codex):**
- `docs/ZIWEI_SCHOOL_DIFFERENCES.md`: iztro config 노브(algorithm default/zhongzhou, yearDivide, 四化 table, 윤달 fixLeap, 晚子時, LMT) + DeokbunAI 선택 + Status(CONFIRMED/SCHOOL_DEPENDENT/UNVERIFIED/DECISION_REQUIRED).
- **DECISION_REQUIRED:** canonical 학파(algorithm+yearDivide), LMT/자시 정책(사주와 일치), 필요 시 `astro.config()` 설정 + ruleSetVersion bump.
- **UNVERIFIED:** 실제 배성/五行局 정확성 — 독립 reference로 **verified golden fixture** 필요(현재는 구조+characterization만). Claude가 정답을 창작하지 않음.

**Codex 검증 항목:** ① 학파 확정 후 iztro config 반영 ② 독립 reference로 fixture 검증 ③ 사주↔자미 干支 boundary 일치 ④ SAJU→prompt 배선과 동일하게 ziwei evidence를 pipeline에 연결(공유경계 — Codex 소관).
**Codex가 덮어쓰면 안 되는 것(추가):** `src/features/ziwei/**` (Claude-owned).
**Owner blocker:** 자미 canonical 학파 결정 + 검증 reference 제공.

---

## 19. Claude QIMEN REUSE-FIRST IMPLEMENTATION (2026-08-12)

기문둔갑을 REUSE-first로 구축. Core = **qimen-dunjia@2.1.0**(MIT), Claude-owned
`src/features/qimen/**`. frozen/UI/ziwei 무변경.

**BUILD vs REUSE 판정:** `REUSE_WITH_ADAPTER`
- qimen-dunjia@2.1.0: MIT · dep lunar-javascript(MIT) · 전용 奇門 排盤 · **時家 기문 + 拆補法** · deterministic · 년월일시柱/음양둔/국수/구궁/천지반/팔문/구성/팔신/값부값사/節氣/三元 커버.
- reject: **kinqimen(GPL-3.0)**, paipan(ESM-only + qimen coverage 미확인), @qimen-lab/core(framework).

**아키텍처(라이브러리 격리):**
- `adapters/qimenCoreAdapter.ts` — **qimen-dunjia import 유일 파일**(CJS-safe dist subpath `qimen-dunjia/dist/qimen.min.js`). lib가 타입 미제공 → 로컬 ambient `qimen-dunjia.d.ts`. 버전 pin.
- `adapters/qimenInputAdapter.ts` — **시점 eligibility**: timing 질문 + 명시적 로컬 질문시각일 때만(현재시각 fallback 없음, birth data 없음) → not_applicable/missing_question_time/unsupported.
- `adapters/qimenResultAdapter.ts` — raw board → `QimenBoard`(레이어를 palace index로 zip, 위치 창작 없음).
- `adapters/qimenEvidenceAdapter.ts` — `QimenBoard`→`EngineEvidence`(bounded, 사실만, 해석 없음).
- `services/qimenService.ts`(+`qimenCache.ts` bounded memoize), `validation/`.

**jest ESM:** qimen-dunjia는 ESM → `transformIgnorePatterns`로 통과 + ts-jest `.js` 트랜스파일(+allowJs, rootDir). 기존 88 tests 영향 없음(전체 105 green).

**커버리지:** 음양둔·국수·구궁·地盤/天盤·地門/天門·九星·八神·값부(值符)/값사(值使)·旬首/符首·節氣/三元·질문 干支 = library 결과 normalize.

**테스트(17):** eligibility gating(가짜 board 없음), 구조 검증(9궁·국수 1–9·음양둔), DETERMINISM(바이트 동일), evidence 사실-only, cache, + qimen-dunjia@2.1.0 **CHARACTERIZATION LOCK**(小寒/中元/陽/8국/天輔/杜門 — 독립 정확성 주장 아님).

**정직성/미결(Owner/Codex):** `docs/QIMEN_SCHOOL_DIFFERENCES.md` — 拆補法(baseline)/음양둔/국수/팔문·구성·팔신/天禽寄宮/자시/LMT + Status. **DECISION_REQUIRED**: canonical 정국(拆補 vs 置閏), LMT/자시 정책(사주·자미 일치). **UNVERIFIED**: 실제 배치 정확성 → 독립 reference로 verified fixture 필요.

**Codex 검증:** ① 拆補/置閏 확정 후 adapter 반영 ② 독립 reference fixture ③ 사주↔기문 干支/절기 boundary ④ qimen evidence를 pipeline(eligibility=engineOrchestration.isTimingQuestion, 이미 존재)에 배선 — 공유경계 Codex 소관.
**Codex가 덮어쓰면 안 되는 것(추가):** `src/features/qimen/**` (Claude-owned).
**Owner blocker:** 기문 canonical 학파(拆補/置閏) 결정 + 검증 reference.

### 3-engine 상태 요약 (2026-08-12)
| 엔진 | Core | 상태 |
|---|---|---|
| 사주명리 | Codex frozen `interpretation/**` | DONE(계산) / prompt 배선 CODEX |
| 자미두수 | iztro@2.5.8 (Claude `ziwei/**`) | V1 natal DONE / 학파 DECISION_REQUIRED |
| 기문둔갑 | qimen-dunjia@2.1.0 (Claude `qimen/**`) | V1 board DONE / 정국 DECISION_REQUIRED |
| cross-analysis | `analysis/crossAnalysis.ts` | 구조 계약 DONE / polarity 매핑 CODEX |

---

## 20. Claude PRE-CODEX V1.0 NON-ENGINE SPRINT (2026-08-12) — 결과 + Codex/Owner 시작점

엔진(사주/자미/기문) + 모든 UI(consumer/admin) FROZEN. 비-엔진·비-UI backend
seam·계약·문서만. logDbError·error contract·RLS·auth·chat pipeline 무변경.

**추가/변경 파일 (Claude-owned, 신규 seam):**
- `src/features/fortune/domain/fortuneJobs.ts` (+`index.ts` re-export, +`__tests__/fortuneJobs.test.ts` 13) — provider-neutral **생성+배달** 오케스트레이션(§3/§4). `planFortuneGeneration`(evaluateFortunePipeline 재사용, ENGINE_NOT_CONNECTED에서 정지, model/token=null), `resolveDeliveryReadiness`(not_configured/provider_not_connected/ready), `planFortuneDelivery`(readiness≠ready→blocked, gen 미생성→pending, else scheduled — **절대 가짜 sent 없음**), `canTransitionDelivery`/`canSendDelivery`(sent/cancelled terminal, 중복 send 차단).
- `src/features/admin/operational/operationalContracts.ts` — `PricingRepository` seam(getPricing/list/asMap) + `staticPricingRepository` + `emptyPricingRepository`(V1 기본=가격 없음→cost null, **가짜 ₩0 없음**). 기존 computeCost/aggregateUsageCost 그대로. (+`__tests__/pricingRepository.test.ts` 4)
- `src/features/analysis/__tests__/requestId.test.ts` 4 — requestId 포맷/charset/유일성/PII-free 잠금.

**SQL 아티팩트(owner-apply, additive·idempotent·비파괴):**
- `docs/FORTUNE_DELIVERY_SETUP.sql` — `fortune_mail`에 delivery_channel(check push/email/in_app)·provider_message_id·delivery_retry_count·delivery_error_code·cached_input_tokens + index. **DROP/TRUNCATE/DELETE 없음.** provider 미선택이라 컬럼은 null 유지.

**문서(신규/갱신):**
- `docs/ENV_CONTRACT.md` (신규) — 전체 환경변수 계약(CLIENT public vs EDGE secret, required/optional, secret 분류). 실제 값 없음.
- `docs/RELEASE_READINESS.md` (신규) — 게이트·기능 준비도·Owner 게이트·**native readiness(§17)**.
- `docs/OWNER_ACTIONS_AND_DECISIONS.md` — 결정 §G(배달 provider, V1=in-app only 권장)·§H(native identifiers)·§I(pricing table) 추가.

**Codex/Owner 미결(이 스프린트가 만든 seam):**
- **Owner DECISION_REQUIRED**: `ios.bundleIdentifier`/`android.package` 미설정(의도적, 영구 store 정체성 — Claude가 추측 금지). native/EAS 빌드 전 필수. web export는 불필요.
- **Owner DECISION**: 운세 배달 채널(§G, V1 기본 in-app mailbox), AI 원가 pricing table(§I, 없으면 cost=unknown/token만 표시).
- **Codex 배선 지점**: fortuneJobs(생성/배달)를 실제 fortune persistence·provider·telemetry에 연결; PricingRepository에 공식 가격표 주입; AdminAuditService/EngineTelemetryRepository 실제 store 연결(현재 no-op/seam).
**Codex가 덮어쓰면 안 되는 것(추가):** `src/features/fortune/domain/fortuneJobs.ts`, operationalContracts의 PricingRepository seam (Claude-owned).

**게이트:** tsc 0 real errors, jest green(신규 +21), expo export web exit 0, protected zones diff=0. **로컬 커밋만 — remote push 없음.**

---

## 21. ENGINE → LIVE PROMPT WIRING (2026-08-13) — precise Codex handoff

> Scope: how SAJU / 자미두수 / 기문둔갑 outputs reach the live LLM prompt — the seam
> that already exists, the exact missing wire, what stays frozen. **No engine-rule,
> calendar, or cross-analysis polarity logic here** — only the plumbing between
> existing engine outputs and the prompt (AI_CONSTITUTION 제17조).

### 21.1 Current pipeline (what runs) — engine NOT invoked
`chatService.sendMessage`: `selectConsultationContext(draft)` (raw strings) →
memory/bounding → `buildPrompt(...)` → adapter. **No engine is called.**
`buildInterpretationContext` is invoked only by `analysis/__tests__/analysis.spec.ts`;
`contextSelector.ts` imports zero engine modules.

### 21.2 The seam that already exists (reuse — don't recreate)
- `analysis/engineOrchestration.ts`: `AnalysisQuestionContext`, `resolveEngineAvailability(ctx,kind)` (downgrades to `engine_not_connected` while `ENGINE_CONNECTED[kind]===false`), `buildInterpretationContext(input)` → `NormalizedInterpretationContext` (`engines: Record<kind, EngineEnvelope{kind, availability, fact?}>` + `warnings[]`), `ENGINE_CONNECTED = {saju:false,ziwei:false,qimen:false}`.
- `analysis/aiOutput.ts`: `EngineEvidence = {availability, summary?, detail?}`.
- `ziwei/adapters/ziweiEvidenceAdapter.ts` `toZiweiEvidence`, `qimen/adapters/qimenEvidenceAdapter.ts` `toQimenEvidence` (facts-only). Ziwei/Qimen `computeZiweiChart`/`computeQimenBoard` are pure + availability-carrying.
- SAJU consumer entry: `manse/services/manseService.ts` `getManseView(record)` (wraps the frozen `executeSajuFromBirthInput`).

### 21.3 The exact missing wire (Codex — all in the shared-boundary files)
- **A. contextSelector / a new chatService step:** build `AnalysisQuestionContext` from the draft (`hasSubject`, `birthDateKnown`, `birthTimeKnown = birthInfo.birthTimeAccuracy==='exact'`, `isTimingQuestion` = a **product-level, non-engine** classification of the user message). Then actually run the engines (`getManseView`, `computeZiweiChart`, `computeQimenBoard`) → each to `EngineEvidence`.
- **B. SAJU → `EngineEvidence` adapter (missing):** ziwei/qimen have theirs; add the symmetric SAJU adapter (facts-only 4주/오행·십신; honor `missing_birth_time` — no fabricated 시주, §13). Place engine-side.
- **C. engineOrchestration:** populate `EngineEnvelope.fact` (or add `evidence?: EngineEvidence`) from the adapters (values come from engines, nothing invented); reconcile `resolveEngineAvailability` with the *real* engine-result availability; flip `ENGINE_CONNECTED` per engine only together with the wiring.
- **D. promptBuilder:** extend `PromptBuildInput` to carry the `NormalizedInterpretationContext`; `buildContextMessage` renders bounded evidence **truthfully** (미연결/시간 정보 없음/해당 없음 for non-`available` engines). Keep message order (system→context→summary?→recent→user); the `promptBuilder.test.ts` role-sequence + `analysis.spec.ts` invariants (no fabricated fact, warnings surface) must be updated **deliberately**.
- **E. chatService:** insert the engine-run + `buildInterpretationContext` step between `selectConsultationContext` and `buildPrompt`; keep auth-guard/gateway/memory/bounding order intact (제10조).

### 21.4 Open design decisions for Codex
- `EngineEnvelope.fact:unknown` vs the prompt/UI `EngineEvidence{availability,summary?,detail?}` — decide storage (`fact` vs explicit field) + the availability reconciliation.
- `isTimingQuestion` classifier — product-level message classification (non-engine) needed to build the context.
- Ziwei/Qimen ACCURACY still gated on Owner canonical 학파/정국 + verified fixtures (docs/ZIWEI_SCHOOL_DIFFERENCES.md, QIMEN_SCHOOL_DIFFERENCES.md) — that gates correctness, NOT the wiring above.

### 21.5 Frozen / out of scope
`interpretation/**` (SAJU calc/calendar/fixtures) — consume only via `getManseView`/public exports; engine rules, 학파/정국, LMT/자시, cross-analysis polarity — Owner/Codex decisions; `ziwei/**`,`qimen/**` internals — reuse public `compute*`/`to*Evidence`; Naver/Google/Kakao auth + visual design — untouched. **Shared do-not-co-edit files: `engineOrchestration.ts`, `contextSelector.ts`, `promptBuilder.ts`, `chatService.ts`** (this wiring is Codex-owned).

---

## 22. CONSULTATION INTELLIGENCE V1.0 (2026-08-13) — Codex handoff

> Claude built the pure data/contract foundation (`src/features/intelligence/**`,
> 19 tests, tsc 0). It defines WHAT a consultation trace / assessment / quality /
> outcome record looks like. It deliberately contains **no evidence→assessment
> rules** — that mapping is 역학 domain logic and is **Codex-owned**. Full picture:
> `docs/CONSULTATION_INTELLIGENCE_V1.md`.

### 22.1 What Claude delivered (reuse — don't recreate)
- Contracts: EvidenceRecord (provenance), AssessmentItem (15 axes; level/direction/
  confidence separate; supporting vs counter refs; per-engine contributions),
  ConsultationCase (references-only trace), QualityReview, UserFeedback,
  ConsultationOutcome. Barrel: `@/features/intelligence`.
- Fail-closed helpers: `assembleFailClosed(axis, contributions)` → `rules_not_connected`;
  `isValidAssessmentItem` REJECTS a real level (strong/weak/…) while `rulesetVersion
  === ASSESSMENT_RULESET_NOT_CONNECTED`. **This guard is the safety net — keep it.**
- Reuses `@/features/analysis` (`EngineEvidence`, `LifeDomain`, `Agreement`,
  `EngineKind`) — the same facts-only evidence the §21 wiring produces.
- Storage artifact `docs/CONSULTATION_INTELLIGENCE_DB.sql` (OWNER_APPLY / HOLD) +
  admin read seam `adminIntelligenceService` (`connected:false` until wired).

### 22.2 The exact missing logic (Codex)
1. **Evidence → Assessment mapping** — the real ruleset: which engine evidence
   maps to which axis, at what `level`/`direction`/`confidence`, and whether a piece
   of evidence is **supporting** or **counter**. Produce a real `rulesetVersion`
   (e.g. `saju-wealth@1.0`) — the moment a real version is set, `isValidAssessmentItem`
   permits a real level. This is 역학 polarity/strength → **CODEX_OWNER, not Claude.**
2. **Timing** — populate `AssessmentTiming` from engine timing facts (기문/대운/세운);
   no astrology timing rules live in `intelligence/**`.
3. **Cross-engine reconciliation** — map the existing `crossAnalysis` agreement
   (aligned/complementary/conflicting/insufficient) onto `AssessmentAgreement`; decide
   how conflicting engines resolve a level (or stay `mixed`).
4. **Wiring** — after the §21 engine→prompt wire lands, emit an `EvidenceRecord`
   per engine and a `ConsultationCase` per answered message (references only, no PII).
   `buildConsultationCase` is the assembly point.
5. **Golden fixtures** — assessment fixtures for representative charts (as with the
   engine fixtures). Owner canonical 학파/정국 still gates ACCURACY, not the contract.

### 22.3 Frozen / out of scope (unchanged from §21 + additions)
- `src/features/intelligence/**` **contracts + fail-closed validators** are Claude-owned;
  Codex adds the ruleset/wiring that FEEDS them, does not weaken the guards.
- No fake numeric score anywhere (§45). No auto-learning / engine-rule mutation from
  feedback or outcomes (§7/§31). Historical immutability: re-evaluation = NEW run.
- `docs/CONSULTATION_INTELLIGENCE_DB.sql` is **owner-apply** — never auto-apply.

---

## 23. SPRINT 1A → 1B: consultation prompt seam (2026-08-14) — precise Codex handoff

> Claude Code (Sprint 1A) replaced the placeholder consultation prompt with a real
> Consultation Prompt Architecture and a **fail-closed grounding seam**. The prompt now
> ENFORCES "interpret, don't calculate." Your job (Sprint 1B) is to compute engine facts
> and hand them to that seam — **not** to touch the prompt/policy text or invent a
> contract. Full context: `docs/CONSULTATION_PROMPT_ARCHITECTURE.md`. This refines §21.

### 23.1 The seam you fill (single integration point)
- **Type:** `ConsultationGrounding` (`src/features/chat/prompts/grounding.ts`). Hand:
  `{ status: 'available', evidence: { myungri, ziwei, qimen }, assessmentSummary?, engineVersion?, assessmentVersion? }`.
- **`evidence` reuses `EngineEvidence`** (`@/features/analysis`): `{ availability, summary?, detail? }`
  per engine. Facts-only; `summary` is what the model relays. Honor `missing_birth_time`
  / `not_applicable` / `engine_not_connected` truthfully — the renderer already surfaces them.
- **Where to inject:** `chatService.sendMessage` currently sets `const grounding = GROUNDING_UNAVAILABLE;`
  (grounded:false). Replace that with a real grounding built from the engines, keeping the
  pipeline order (gateway→auth→context→memory→**grounding**→prompt→adapter, §76). `buildPrompt`
  already accepts `grounding` and renders it — do not change `promptBuilder.ts`.

### 23.2 Expected input → output you must produce
- **Input:** the consultation draft's subject birth info (`getManseView`, `computeZiweiChart`,
  `computeQimenBoard`) + an `AnalysisQuestionContext` (see §21.3) + `birthTimeAccuracy`.
- **Output per engine:** an `EngineEvidence` (facts-only 4주/오행·십신 for SAJU; 명궁/주요 성계 for
  ziwei; 국/용신 for qimen). The **SAJU→EngineEvidence adapter is still MISSING** (§21.3-B) —
  build it engine-side (ziwei/qimen already have `to*Evidence`).
- **`assessmentSummary` (optional):** a categorical natural-language line from your verified
  ruleset (§22). **Never a numeric score** — the constitution + tests forbid "재물운 83점".

### 23.3 Error behavior (fail-closed — do NOT regress)
- If an engine can't compute, set its `EngineEvidence.availability` accordingly and leave
  `summary` empty — the prompt flags it honestly. Do **not** fabricate a summary.
- If you introduce an engine-*grounded* mode and evidence is missing, surface a typed
  grounding-unavailable state to the user (§52/§53) — never silently fall back to
  `GROUNDING_UNAVAILABLE` and answer as a generic LLM under a "grounded" label.
- Flip `grounded:true` in `ChatServiceResult.meta` only when real evidence is attached.

### 23.4 Protected files (Claude-owned — do NOT co-edit; extend via the seam only)
`consultationPolicy.ts` (constitution/policy TEXT), `consultationMode.ts`,
`grounding.ts` (the CONTRACT + renderer — you may add engine-side producers, not change
the shape), `promptBuilder.ts`, `consultationPrompt.test.ts`. **Shared file you WILL edit:**
`chatService.ts` (the grounding-build step) and `chatArchitecture.ts` only if a new
optional field is genuinely needed (additive).

### 23.5 Tests that must stay green
`src/features/chat/prompts/__tests__/consultationPrompt.test.ts` (grounding fail-closed,
injection boundary, no fabricated calc/timing/score) and `promptBuilder.test.ts`
(assembly order). When you wire real evidence, ADD tests that `available` grounding
reaches the prompt — do not weaken the fail-closed assertions.

### 23.6 Out of scope for you here
Prompt wording, response structure, uncertainty phrasing, mode classification, versioning
— all Claude-owned. Semantic correctness / 학파·정국 / golden fixtures remain your zone (§21.5, §22).
