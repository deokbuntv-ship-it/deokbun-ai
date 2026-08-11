# CODEX HANDOFF — 2026-08-17

> Claude가 2026-08-11 ~ 08-16 자율 스프린트에서 남긴 인수인계 문서.
> Codex가 이 문서 + Repository만 읽고 8/17부터 즉시 병렬 작업을 시작할 수 있도록 작성.
> 브랜치: `admin/master-operations-content`. 원격 동기 HEAD = `390f8a8`.
> **원격 미push 로컬 커밋**: `383ea14`(스키마/handover) → `f45a675`(analysis 계약) →
> (이 문서 커밋). 사용자 검수 전 push 금지.

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
