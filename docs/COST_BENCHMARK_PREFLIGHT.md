# LLM 원가 벤치마크 — 실행 전 견적 (PREFLIGHT)

Status: **승인 대기. staging 호출 0건 실행함.**
Scope 준수: 상담 로직·프롬프트·엔진·절기 게이트 미수정, 덕 정책값 미변경, production 호출 0건, commit 0건.
이 문서는 코드 읽기 + 기존 아티팩트 분석 + 공개 단가표 조회만으로 작성했다.

---

## 0. 요약 — 승인 전에 결정이 필요한 3가지

| # | 사안 | 영향 |
|---|---|---|
| **B1** | **Premium Report 생성 경로가 존재하지 않는다** | 측정항목 3(심층/Premium ×3) **실행 불가** |
| **B2** | **staging 자격증명 접근이 차단되어 있다** | 측정항목 1·2 포함 **전부 실행 불가** |
| **B3** | **Spend Guard 는 존재하고 상담·궁합·요약에 이미 적용된다** | 지시서의 전제("Spend Guard 가 없으므로")가 사실과 다름. 80콜 버스트가 시간당 한도에 걸릴 수 있음 |

예상 총비용은 **$0.96 ~ $2.17 (₩1,300 ~ ₩2,900)**, 총 **80콜** (Premium 제외).
비용 자체는 무시할 수준이므로, 승인 판단의 실질 쟁점은 위 3가지다.

---

## 1. 단가 — 출처 명시

**출처: `https://developers.openai.com/api/docs/pricing`, 2026-09-02 조회, Standard tier.**
(구 `platform.openai.com/docs/pricing` 은 301 리다이렉트됨.)

| 모델 | input / 1M | cached input / 1M | output / 1M |
|---|---:|---:|---:|
| `gpt-5-mini` | $0.25 | $0.025 | $2.00 |
| `gpt-5-nano` | $0.05 | $0.005 | $0.40 |
| **`gpt-5.6-terra`** | **$2.00** | **$0.20** | **$12.00** |

- `gpt-5-mini` / `gpt-5-nano` 는 [`llmCostModel.ts:19-41`](src/features/chat/cost/llmCostModel.ts:19) 의 기존 상수와 **일치**한다.
- **`gpt-5.6-terra` 는 레포에 단가가 없다.** [`modelPricing.ts:2-3`](src/features/admin/operational/modelPricing.ts:2) 이
  "pricing is unverified → 가격 미확인" 으로 명시적으로 비워 둔 상태다. 위 값은 이번에 공개 단가표에서
  가져온 것이며, **아직 레포에 반영하지 않았다**(측정만 하라는 scope). 승인 시 반영 여부를 지시해 주십시오.
- Terra 는 mini 대비 **input 8배 / output 6배**. 궁합·Premium 원가를 지배한다.
- 환율은 분석 전용 가정 `DEFAULT_USD_KRW = 1350` ([`llmCostModel.ts:44`](src/features/chat/cost/llmCostModel.ts:44)). 정산 환율 아님.

---

## 2. 실행 계획과 예상 비용

토큰 가정 — LOW 밴드는 레포의 `AFTER_PROFILES`([`llmCostModel.ts:80`](src/features/chat/cost/llmCostModel.ts:80)),
HIGH 밴드는 프로덕션에서 관측된 출력 상한 근접값. 턴당 input +900 (대화 컨텍스트 누적).
궁합은 차트 2개라 base input 을 5,000 으로 잡았다. cached = 0 (레포가 캐싱 미측정이라 명시).

| 항목 | 콜 수 | 예상 비용 (LOW ~ HIGH) | 원화 |
|---|---:|---|---|
| 일반상담 1턴 ×5 | 5 | $0.016 ~ $0.049 | ₩21 ~ ₩66 |
| 일반상담 3턴 ×5 | 15 | $0.051 ~ $0.150 | ₩68 ~ ₩202 |
| 일반상담 5턴 ×5 | **30** | $0.099 ~ $0.270 | ₩134 ~ ₩365 |
| 궁합 5턴 ×5 | **30** | $0.799 ~ $1.705 | ₩1,079 ~ ₩2,302 |
| **소계** | **80** | **$0.96 ~ $2.17** | **₩1,302 ~ ₩2,934** |
| ~~Premium ×3~~ | ~~3~~ | ~~$0.144 ~ $0.252~~ | **실행 경로 없음 → B1** |

⚠ **콜 수가 지시서의 73콜이 아니라 80콜이다.** 5턴 세션은 메시지 10개로
`chatConfig.maxRecentMessages = 8` 을 넘겨 **요약 호출(mini)이 세션당 1건 추가**된다
([`chatConfig.ts:5`](src/features/chat/config/chatConfig.ts:5)). 5턴 일반 5세션 + 5턴 궁합 5세션 = **요약 10콜**.
요약도 과금 대상이므로 견적과 실행 상한에 포함했다.

**자체 상한(스스로 지킬 값): 총 90콜.** 80콜 계획 + 실패 재시도 여유 10콜. 초과 시 중단하고 보고.

---

## 3. 상품별 예상 원가와 마진 (9,900원 / 50덕 = **198원/덕**)

**이 표는 예측이지 실측이 아니다.** 승인 후 실측으로 대체한다.

| 상품 | 판매가 | 예상 원가 | 예상 마진 | 가정 |
|---|---:|---|---|---|
| 일반상담 5덕 | ₩990 | ₩27 ~ ₩73 | **92.6% ~ 97.3%** | 5턴 소진 + 요약 |
| 일반상담 5덕 | ₩990 | ₩14 ~ ₩40 | 95.9% ~ 98.6% | 3턴 실사용 |
| **궁합 12덕** | ₩2,376 | **₩216 ~ ₩460** | **80.6% ~ 90.9%** | FULL_TERRA 5턴 + 요약 |
| Premium 50덕 | ₩9,900 | ₩65 ~ ₩113 | 98.9% ~ 99.3% | **경로 없음 — 순수 가설** |

판독:

- **일반상담은 원가 걱정이 사실상 없다.** 최악값에서도 마진 92%.
- **궁합이 유일하게 실제 압력을 받는 상품이다.** Terra 단가 때문에 최악 마진 80.6%.
  5턴을 넘기거나 output 이 상한(4,500)에 자주 닿으면 더 내려간다. **실측이 가장 필요한 지점.**
- Premium 50덕은 지금 숫자만 보면 과대 가격으로 보이지만, **생성 경로가 없어 실제 토큰 규모를 모른다.**
  이 칸을 근거로 가격을 정하면 안 된다.

---

## 4. 궁합 — FULL_TERRA vs Mini 혼합

HIGH 밴드, 5턴 기준:

| 구성 | 비용 | 원화 |
|---|---:|---:|
| FULL_TERRA (현행) | $0.3380 | ₩456 |
| HYBRID (1턴 Terra + 4턴 Mini) | $0.1072 | ₩145 |
| **절감** | | **68.3%** |

⚠ **지금은 측정할 수 없다.** [`modelRouter.ts:79-83`](src/features/chat/server/modelRouter.ts:79) 에서
`SMART_HYBRID` 는 **예약 seam 일 뿐 V1 에서 두 모드 모두 Terra 로 귀결**한다("the downgrade path is not
implemented"). 위 숫자는 단가 산술이지 실측이 아니다. 실측하려면 하이브리드 라우팅 구현이 선행되어야 하고,
그것은 이번 scope 밖이다. 또한 같은 파일 주석이 *"it must never be chosen unless a benchmark proves it
materially necessary"* 라고 못 박고 있으므로, **이 벤치마크의 결론이 그 판단 근거**가 된다.

---

## 5. Reserve TTL — 실측 latency 분포 (**이미 확보. 추가 호출 0건**)

기존 B84 런 아티팩트의 `started_at`/`completed_at` 에서 산출. 전부 concurrency=1, 1턴 상담.

| 런 | n | mean | p50 | p90 | **p95** | p99 | max |
|---|---:|---:|---:|---:|---:|---:|---:|
| V8 | 77 | 24.5s | 18.7s | 38.1s | **71.0s** | 91.3s | 91.3s |
| V7.1 | 77 | 20.3s | 14.4s | 27.9s | 68.3s | 91.3s | 91.3s |
| V6.1 | 78 | 18.5s | 14.9s | 25.2s | 52.9s | 78.5s | 78.5s |
| Original | 82 | 38.2s | 18.8s | 98.9s | 128.4s | 148.9s | 148.9s |

판독:

- **91.3s 가 V6.1/V7.1/V8 세 런에서 공통 max 인 것은 자연 분포가 아니라 LLM 데드라인 클램프다**
  (`effective_llm_deadline_ms: 90000`, `open_regression_v8_manifest.json`). 즉 상한이 걸려 있는 값이다.
- Original 의 128~149s 는 데드라인 도입 전 값이며, 그중 2건이 `REQUEST_IN_PROGRESS` 로 끝났다
  (B84-036 / B84-080) — TTL 설계에서 이 실패 모드가 실제 사례다.
- **15분(900s) TTL 가설은 실측 p95(71s)의 약 12.7배, 데드라인 클램프(90s)의 10배다. 매우 넉넉하다.**
  다만 위 값은 **1턴 단발** 기준이다. 5턴 세션의 예약이 세션 전체를 덮어야 한다면
  5×71s ≈ 355s + 사용자 사고 시간이 실제 지배 변수이며, 그것은 이 데이터에 없다.
  → **승인해 주시면 이번 측정에서 세션 단위 wall-clock 을 함께 기록하겠다.** TTL 판단에는 그 값이 맞다.

---

## 6. 블로커 상세

### B1 — Premium Report 생성 경로 없음

Edge 가 디스패치하는 요청은 `today_fortune` / `monthly_fortune` / `mode:'summary'` / 상담(solo·compatibility)
뿐이다. `premium_report` 는 [`chat/index.ts:623`](supabase/functions/chat/index.ts:623) 의 덕 상품 타입
문자열로만 존재하고, `resolveModelRoute` 호출부([`:1226`](supabase/functions/chat/index.ts:1226))는
solo/compatibility 만 매핑한다. `modelRouter` 에 `premium_report → Terra` 정책은 정의돼 있으나
**호출하는 곳이 없다.**

→ 측정항목 3 은 실행 불가. 선택지: (a) 이번 측정에서 제외, (b) Premium 경로 구현 후 별도 측정,
(c) `deep` 프로파일로 Terra 단발 호출을 흉내 내어 **대리 측정**(실제 상품 프롬프트가 아니므로 참고치).

### B2 — staging 자격증명 접근 차단

`C:\Development\DeokbunAI-blind84-final\.runtime\staging_keys.json` / `qa_credentials.json` 읽기가
auto-mode classifier 에 의해 차단됐습니다(Phase A 때와 동일). 우회하지 않았습니다.
실행 하네스 자체는 이미 존재합니다 — `.runtime/reg4_provision.mjs` + `reg4_run84.mjs` 를 재사용하면
새 질문팩 없이 B84 대표 케이스로 돌릴 수 있습니다.

→ 승인 시 자격증명 접근을 허용해 주시거나, 제가 만든 스크립트를 직접 실행해 주시면 결과를 분석하겠습니다.

### B3 — Spend Guard 는 존재한다

지시서는 "측정 중 Spend Guard 가 없으므로"라고 하셨지만, `reserveGlobalPaidGeneration` 이
[`chat/index.ts:500`](supabase/functions/chat/index.ts:500) 의 `acquirePaidRequest` 안에서 **모든 유료 워크로드**
(`chat`, `compatibility`, `summary`, today, monthly …)에 적용됩니다. 시간당/일일 한도와
`WATCH_50 / WARNING_80 / CRITICAL_95` 경고 레벨이 있습니다.

→ 80콜을 짧게 몰아치면 `GLOBAL_GENERATION_LIMIT_REACHED` 로 튕길 수 있습니다.
staging 의 현재 `hourly_limit` / `daily_limit` 값을 모르므로(B2), **concurrency 1 + 콜 간 간격**으로
천천히 돌리는 것을 권합니다. 그러면 80콜에 실행 시간 약 40~60분이 걸립니다.

---

## 7. 승인해 주시면 실행할 내용

1. `.runtime/` 에 측정 하네스 추가 (기존 `reg4_*` 재사용, 앱/엔진 코드 미수정)
2. B84 대표 케이스로 80콜 실행, concurrency 1, 자체 상한 90콜
3. 콜마다 기록: input / cached / output / reasoning tokens, latency, http status, 재시도, 모델 id
   — `logAiUsage` 가 이미 `ai_usage_logs` 에 쓰므로 그 행을 회수하는 방식이 1차, 응답 usage 캡처가 2차
4. 세션 단위 wall-clock 기록 (§5 의 TTL 판단용)
5. 산출물: 상품별 평균/p95 원가, 마진표, Terra vs 혼합 실측 차이, timeout 분포
   → `C:\Development\DeokbunAI-blind84-final\` 에 저장 + SHA256 기록

**가격·덕 수량·턴 상한은 건드리지 않습니다.**

---

## 8. 무결성

보호 파일 6개 SHA256 개시=현재 동일. HEAD `d5e51743d146e3d29cb9b77f0d250f586e006aed`. 커밋 0건.
staging/production 호출 0건.

**STOP — 승인 대기.**
