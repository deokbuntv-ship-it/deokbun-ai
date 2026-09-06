-- 거절 관측 가능성 — 스크러버·게이트가 발화한 사실을 SQL 로 셀 수 있게 만든다.
--
-- WHY THIS COLUMN EXISTS
--
-- 상담 답변이 스크러버에 폐기됐는지가 **어떤 곳에도 남지 않았다.** 진단값(`outputClassification`,
-- `groundedFallback`, `groundedViolations`, `safetyRoute`)은 이미 계산돼 Edge 까지 올라오지만 그 뒤
-- 두 번 버려진다: ① Edge 가 `outputClassification !== 'ACCEPTED'` 일 때만 로그를 남기는데, 문장 단위
-- 폐기는 답변이 그대로 배달되므로 ACCEPTED 다 — 즉 **가장 흔한 경우가 한 줄도 안 남는다.** ② 남더라도
-- `redactDiag` 의 allowlist 에 해당 키가 없어 통째로 지워진다. 그래서 감사 때 "발생 0건" 이 나왔는데,
-- 그것은 "안 일어났다" 가 아니라 "볼 수 없다" 였다.
--
-- WHY A COLUMN AND NOT A LOG LINE / NOT A NEW TABLE
--
--   · Edge 로그(`console.error`)는 보존이 짧고 집계가 안 된다. 우리가 답해야 하는 질문은 "지금 터졌나"
--     가 아니라 **"지난달에 몇 번, 늘고 있나"** 이고 그건 SQL 질문이다.
--   · `ai_usage_logs` 에는 이미 요청당 한 행이 있다 → **새 쓰기 경로가 없다 = 새 실패 지점이 없다.**
--   · Edge 의 `logAiUsage` 는 이미 **점진적 폴백**으로 삽입한다: `extra` 컬럼이 아직 적용되지 않은
--     환경에서는 그 컬럼만 떨구고 행은 남긴다. 즉 **fail-open 이 코드가 아니라 구조로 보장된다.**
--   · 별도 테이블이면 RLS·grant·두 번째 쓰기(독립적으로 실패 가능)를 새로 만들어야 한다.
--
-- ⚠ 개인정보 — 폐기된 원문도, 매칭된 토큰도 저장하지 않는다.
-- 저장하는 것은 **규칙 식별자(닫힌 집합) + 개수 + 폐기 단위 + 대체 여부** 뿐이다. 규칙 식별자는 우리
-- 코드가 정의한 카테고리(`UNSUPPORTED_TECHNICAL_ENTITY` 등)이므로 사용자·모델이 만든 문자열이 아니다.
--
-- 모양 (v1):
--   {"v":1,
--    "classification":"ACCEPTED",              -- outcome.kind
--    "substituted":"GROUNDED_COMPOSITION",     -- null | GROUNDED_COMPOSITION | SEMANTIC_REJECTION_MESSAGE
--    "unit":"section",                         -- answer | section | null
--    "count":3,                                -- 발화 건수 (문장/섹션 수)
--    "rules":["UNSUPPORTED_TECHNICAL_ENTITY"], -- 닫힌 집합
--    "safetyRoute":"SELF_HARM"}                -- 선택
--
-- 조회 예시는 `docs/RENDER_HARNESS.md` 가 아니라 `PROJECT_STATE.md` §7.23 에 있다.

alter table if exists public.ai_usage_logs
  add column if not exists gate_firings jsonb;

comment on column public.ai_usage_logs.gate_firings is
  '스크러버/게이트 발화 요약 (v1). 규칙 식별자·개수·폐기 단위·대체 여부만. 폐기된 본문이나 매칭 토큰은 저장하지 않는다.';

-- 발화한 행만 훑는 부분 인덱스. 전체 행 대비 발화 행은 소수이므로 부분 인덱스가 맞다.
create index if not exists ai_usage_logs_gate_firings_idx
  on public.ai_usage_logs using gin (gate_firings)
  where gate_firings is not null;
