# DEOKBUNI — DIVINATION DEPTH QA PACK

독립 심층 감사(DIVINATION_ENGINE_V1_TOO_SHALLOW)의 지적에 대응해 재구축한 판정 엔진의 결과입니다.
모든 사례는 **실제 엔진**을 실제 production grounding 경로로 통과시켜 생성했습니다.

이전 pack과 달라진 점:
- 원국 4개(A/B/C/시주미상)로 개인화 충돌을 직접 비교할 수 있습니다.
- 기문이 실제로 계산되는 시점을 사용해 **기문 적용 사례가 실제로 포함**됩니다.
- 학문별 **SUBJUDGMENTS(축별 판정)** 와 교차판정의 **충돌 해소 근거**를 그대로 노출합니다.

> 알려진 엔진 결함(숨기지 않고 보고): 2026-06-15 KST 시점에서는 기문 provider가 `QIMEN_CORE_FAILED`로
> 실패합니다(芒種 경계 문자열 문제). 이전 QA pack이 그 시점을 고정으로 써서 기문이 12건 전부 미적용이었습니다.
> 아래 "기문 계산 실패 시점" 사례가 그 상태에서의 정직한 저하를 보여 줍니다.

> FINAL_KOREAN_ANSWER는 Edge의 LLM이 생성하므로 로컬에서 만들 수 없습니다. 이 문서는 그 LLM이 반드시
> 지켜야 하는 **판정 구조**까지를 결정론적으로 보여 줍니다.

---

## [A 동일질문·다른원국] A · 돈을 벌 수 있나

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 들어온 것을 지키는 구조는 크게 새지 않습니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/GENERAL) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
- COUNTER_EVIDENCE:
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 자리·직업을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR(경합)
- DOMINANT_EVIDENCE = 자미두수 · 관록(삼합궁)에 태음 화과
- LOSING_EVIDENCE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = AGAINST** (확신 HIGH)
- NEW_INFERENCE = 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 원국 바탕(MONEY_RETENTION) / 원국 재성 2자리 / 원국 통근 튼튼
- COUNTER_EVIDENCE_REF = 재백(본궁)에 천동 화기 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=AGAINST · QIMEN=미적용

---

## [A 동일질문·다른원국] B · 돈을 벌 수 있나

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_FOR (SEWOON/GENERAL) — 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름에 겁재 — 가진 몫을 두고 나눠 갖는 기운이 함께 들어옵니다.
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 거문 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 적용은 됐지만 방향을 정할 신호가 약합니다.
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [A 동일질문·다른원국] C · 돈을 벌 수 있나

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 지킬 바탕은 있지만 지금은 몫을 나눠 갖는 흐름이 겹쳐, 버는 것과 남기는 것을 나눠 보셔야 합니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/GENERAL) — 반합으로 흐름이 맞물려 열리는 편입니다.
- COUNTER_EVIDENCE:
    - 이 시기 흐름에 겁재 — 가진 몫을 두고 나눠 갖는 기운이 함께 들어옵니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 전택에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 문창 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_AGAINST(경합) · CAREER:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 적용은 됐지만 방향을 정할 신호가 약합니다.
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [B 동일원국·다른질문] A · 돈이 남는가(보유)

**QUESTION** = 돈이 모일까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 들어온 것을 지키는 구조는 크게 새지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/DIRECT) — 들어온 것을 지키는 구조는 크게 새지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/GENERAL) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/DIRECT) — 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - MONEY_INFLOW = AGAINST (NATAL/ADJACENT) — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
- COUNTER_EVIDENCE:
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 자리·직업을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합)
- DOMINANT_EVIDENCE = 명리 · 원국 바탕(MONEY_RETENTION)
- LOSING_EVIDENCE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 HIGH)
- NEW_INFERENCE = 들어온 것을 지키는 구조는 크게 새지 않습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 원국 바탕(MONEY_RETENTION) / 원국 재성 2자리 / 원국 통근 튼튼
- COUNTER_EVIDENCE_REF = 재백(본궁)에 천동 화기 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 들어온 것을 지키는 구조는 크게 새지 않습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [B 동일원국·다른질문] A · 결혼

**QUESTION** = 결혼해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 천간충·충·형·천간합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - RELATION_STABILITY = AGAINST (WOLWOON/DIRECT) — 천간충·충·형·천간합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
    - CONFLICT = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - INFLUENCE = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 일주 천간충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 일주 충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 일주 형 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_FOR (NATAL/DIRECT) — 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CONFLICT = CONDITIONAL_FOR (NATAL/ADJACENT) — 형제은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.
- AXIS_VERDICTS = RELATION_STABILITY:FOR_BUT_LATER(경합) · CONFLICT:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- DOMINANT_EVIDENCE = 자미두수 · 부처(본궁)에 태양 화록
- LOSING_EVIDENCE = 명리는 지금 시점의 신호라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = FOR_BUT_LATER** (확신 HIGH)
- NEW_INFERENCE = 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 부처(본궁)에 태양 화록 / 관록(대궁)에 태음 화과 / 형제 무주성 · 대궁 노복의 염정·탐랑을 빌려 봄
- COUNTER_EVIDENCE_REF = 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = WOLWOON/NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=AGAINST · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 동일원국·다른질문] A · 이직

**QUESTION** = 이직해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - MOVEMENT = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - OUTCOME = FOR (WOLWOON/GENERAL) — 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MOVEMENT = CONDITIONAL_FOR (NATAL/DIRECT) — 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 자리·직업을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = MOVEMENT:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST(경합) · OUTCOME:FOR · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- DOMINANT_EVIDENCE = 자미두수 · 부처(삼합궁)에 태양 화록
- LOSING_EVIDENCE = 자미두수가 본 관록(본궁)에 태음 화과도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 MEDIUM)
- NEW_INFERENCE = 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 부처(삼합궁)에 태양 화록 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 지금의 큰 흐름 → 원국 월주 해 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 동일원국·다른질문] A · 건강

**QUESTION** = 요즘 몸이 어떤가요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 MEDIUM · 직접성 GENERAL · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/GENERAL) — 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/GENERAL) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - RELATION_STABILITY = AGAINST (WOLWOON/GENERAL) — 천간충·충·형·천간합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 년주 자형 — 뿌리·집안 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 년주 파 — 뿌리·집안 자리가 이 흐름에 직접 흔들립니다.
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 일주 천간충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 질액에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - HEALTH_ENERGY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 질액에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_AGAINST · RELATION_STABILITY:AGAINST
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 몸·기운에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = WOLWOON/NATAL
- TRACEABLE = YES
- 결론: 몸·기운에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [C 시점형(기문 적용)] A · 지금 계약(길문)

**QUESTION** = 지금 계약해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = FOR (WOLWOON/ADJACENT) — 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/GENERAL) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - DECISION = CONDITIONAL_AGAINST (NATAL/DIRECT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - MONEY_INFLOW = AGAINST (NATAL/ADJACENT) — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 자리·직업을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합) · DECISION:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- DOMINANT_EVIDENCE = 자미두수 · 관록(삼합궁)에 태음 화과
- LOSING_EVIDENCE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- NEW_INFERENCE = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 이 시기 흐름 → 원국 시주 반합
- COUNTER_EVIDENCE_REF = 재백(본궁)에 천동 화기 / 재백(삼합궁)에 천동 화기 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [C 시점형(기문 적용)] A · 지금 계약(흉문)

**QUESTION** = 지금 계약해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = FOR (SEWOON/ADJACENT) — 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/GENERAL) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - DECISION = CONDITIONAL_AGAINST (NATAL/DIRECT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - MONEY_INFLOW = AGAINST (NATAL/ADJACENT) — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **AGAINST_FOR_NOW** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 일을 이끄는 문도 막혀 있고 판의 기운도 같은 방향이라, 지금 시점은 아닙니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = AGAINST_FOR_NOW (PRESENT_MOMENT/DIRECT) — 지금 당장의 시점은 아닙니다.
- COUNTER_EVIDENCE:
    - 값사 驚門 (乾궁) — 지금 이 일을 이끄는 자리는 놀라고 시끄러워지는 문입니다.
    - 값부 天柱 — 판을 이끄는 기운이 껄끄럽습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 자리·직업을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합) · DECISION:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:AGAINST_FOR_NOW
- DOMINANT_EVIDENCE = 자미두수 · 관록(삼합궁)에 태음 화과
- LOSING_EVIDENCE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- NEW_INFERENCE = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 원국 바탕(OUTCOME)
- COUNTER_EVIDENCE_REF = 재백(본궁)에 천동 화기 / 재백(삼합궁)에 천동 화기 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- 시기: 지금 당장의 시점은 아닙니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=AGAINST_FOR_NOW

---

## [C 시점형(기문 적용)] B · 지금 창업

**QUESTION** = 지금 창업해도 될까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 천간합으로 열리면서 파으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_FOR (SEWOON/ADJACENT) — 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 시주 파 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 시주 파 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **AGAINST_FOR_NOW** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 일을 이끄는 문도 막혀 있고 판의 기운도 같은 방향이라, 지금 시점은 아닙니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = AGAINST_FOR_NOW (PRESENT_MOMENT/DIRECT) — 지금 당장의 시점은 아닙니다.
- COUNTER_EVIDENCE:
    - 값사 驚門 (乾궁) — 지금 이 일을 이끄는 자리는 놀라고 시끄러워지는 문입니다.
    - 값부 天柱 — 판을 이끄는 기운이 껄끄럽습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · TIMING:AGAINST_FOR_NOW
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=AGAINST_FOR_NOW

---

## [D 정직한 저하] D · 출생시간 미상

**QUESTION** = 사업 방향이 맞을까요?
**INPUT_FACT_SUMMARY** = D · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 REDUCED)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- APPLIED = NO — 출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = (없음)
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 적용은 됐지만 방향을 정할 신호가 약합니다.
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 이 질문에 대해서는 방향을 정할 만한 신호가 명식에서 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 이 질문에 대해서는 방향을 정할 만한 신호가 명식에서 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=미적용 · QIMEN=미적용

---

## [D 정직한 저하] A · 기문 계산 실패 시점

**QUESTION** = 지금 계약해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1781492400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = FOR (WOLWOON/ADJACENT) — 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/GENERAL) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - DECISION = CONDITIONAL_AGAINST (NATAL/DIRECT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - MONEY_INFLOW = AGAINST (NATAL/ADJACENT) — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **CONDITIONAL_FOR** (근거강도 MODERATE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 일 자체는 중립이지만 판이 도와주어, 조용히 진행할 만합니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = CONDITIONAL_FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 자리·직업을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합) · DECISION:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 자미두수 · 관록(삼합궁)에 태음 화과
- LOSING_EVIDENCE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- NEW_INFERENCE = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 이 시기 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 재백(본궁)에 천동 화기 / 재백(삼합궁)에 천동 화기 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=CONDITIONAL_FOR

---

## [D 정직한 저하] A · 성격(방향형 아님)

**QUESTION** = 제 타고난 성격이 어떤가요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/DIRECT) — 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/GENERAL) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - RELATION_STABILITY = AGAINST (WOLWOON/GENERAL) — 천간충·충·형·천간합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 년주 자형 — 뿌리·집안 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 년주 파 — 뿌리·집안 자리가 이 흐름에 직접 흔들립니다.
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 일주 천간충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - GENERAL = CONDITIONAL_AGAINST (NATAL/DIRECT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - RELATION_STABILITY = CONDITIONAL_FOR (NATAL/ADJACENT) — 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 자리·직업을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합)
- DOMINANT_EVIDENCE = 명리 · 올해 흐름 → 원국 년주 자형
- LOSING_EVIDENCE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 명리는 지금 시점의 신호라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- NEW_INFERENCE = 구조는 이렇게 봅니다. 전반: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다. 자리·직업: 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 같이 사는 난도: 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 부처(본궁)에 태양 화록
- COUNTER_EVIDENCE_REF = 올해 흐름 → 원국 년주 자형 / 이 시기 흐름 → 원국 년주 파 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = WOLWOON/NATAL
- TRACEABLE = YES
- 결론: 구조는 이렇게 봅니다. 전반: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다. 자리·직업: 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 같이 사는 난도: 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [E 관계] B · 재회

**QUESTION** = 재회 가능성이 있을까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 GENERAL · 자료 EXACT)
- 결론: 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - CAREER = CONDITIONAL_FOR (SEWOON/GENERAL) — 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
    - RELATION_STABILITY = CONDITIONAL_FOR (WOLWOON/GENERAL) — 천간합으로 흐름이 맞물려 열리는 편입니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = SEWOON/NATAL
- TRACEABLE = YES
- 결론: 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [E 관계] C · 갈등

**QUESTION** = 왜 자꾸 부딪힐까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 반합·천간합으로 흐름이 맞물려 열리는 편입니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - GENERAL = CONDITIONAL_FOR (SEWOON/DIRECT) — 반합·천간합으로 흐름이 맞물려 열리는 편입니다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/GENERAL) — 반합으로 흐름이 맞물려 열리는 편입니다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/GENERAL) — 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 일주 자형 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 일주 파 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = GENERAL:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST
- DOMINANT_EVIDENCE = 명리 · 지금의 큰 흐름 → 원국 년주 반합
- LOSING_EVIDENCE = 없음
- RESOLUTION = 여러 축의 신호가 같은 방향으로 모입니다.
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 HIGH)
- NEW_INFERENCE = 부딪히는 지점은 이렇게 봅니다. 전반: 반합·천간합으로 흐름이 맞물려 열리는 편입니다. 자리·직업: 반합으로 흐름이 맞물려 열리는 편입니다. 같이 사는 난도: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 년주 반합 / 올해 흐름 → 원국 년주 천간합 / 이 시기 흐름 → 원국 월주 반합
- COUNTER_EVIDENCE_REF = 올해 흐름 → 원국 일주 자형 / 이 시기 흐름 → 원국 일주 파
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = SEWOON/NATAL
- TRACEABLE = YES
- 결론: 부딪히는 지점은 이렇게 봅니다. 전반: 반합·천간합으로 흐름이 맞물려 열리는 편입니다. 자리·직업: 반합으로 흐름이 맞물려 열리는 편입니다. 같이 사는 난도: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [E 관계] C · 연애

**QUESTION** = 연애운은 어떤가요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 MEDIUM · 직접성 ADJACENT · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - CONFLICT = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - INFLUENCE = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 일주 자형 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 일주 파 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CONFLICT = AGAINST (NATAL/ADJACENT) — 형제에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
- COUNTER_EVIDENCE:
    - 형제(본궁)에 문창 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CONFLICT:AGAINST
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 끌리는 힘에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = WOLWOON/NATAL
- TRACEABLE = YES
- 결론: 끌리는 힘에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [F 사업·재물] B · 사업 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 천간합으로 열리면서 파으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_FOR (SEWOON/ADJACENT) — 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 시주 파 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 시주 파 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · TIMING:FOR
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [F 사업·재물] C · 사업 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = AGAINST (WOLWOON/ADJACENT) — 천간충·반합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 반합으로 흐름이 맞물려 열리는 편입니다.
- COUNTER_EVIDENCE:
    - 이 시기 흐름 → 원국 시주 천간충 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OUTCOME:AGAINST · CAREER:CONDITIONAL_FOR · TIMING:FOR
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [F 사업·재물] B · 저축이 남는가

**QUESTION** = 저축이 남을까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/DIRECT) — 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_FOR (SEWOON/GENERAL) — 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름에 겁재 — 가진 몫을 두고 나눠 갖는 기운이 함께 들어옵니다.
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/DIRECT) — 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 거문 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 명리 · 원국 바탕(MONEY_RETENTION)
- LOSING_EVIDENCE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- NEW_INFERENCE = 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다. 다만 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER)
- COUNTER_EVIDENCE_REF = 지금의 큰 흐름에 겁재 / 지금의 큰 흐름 → 원국 월주 해 / 올해 흐름 → 원국 월주 해
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다. 다만 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [F 사업·재물] C · 이사

**QUESTION** = 이사해도 될까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- 일간 강약: 강약 판정 보류(학파 미확정)
- SUBJUDGMENTS:
    - MOVEMENT = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 반합으로 흐름이 맞물려 열리는 편입니다.
    - OUTCOME = AGAINST (WOLWOON/GENERAL) — 천간충·반합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 이 시기 흐름 → 원국 시주 천간충 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 천이에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MOVEMENT = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 천이에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = CAREER:CONDITIONAL_FOR · OUTCOME:AGAINST · TIMING:FOR
- DOMINANT_EVIDENCE = 방향을 정할 만한 신호 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 이동에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 이동에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [궁합] 궁합 · 잘 맞나요

**QUESTION** = 둘이 잘 맞나요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 기본적인 교감은 무난한 편이에요.
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = CONDITIONAL_AGAINST (NATAL/DIRECT) — 기본적인 교감은 무난한 편이에요.
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 같이 사는 자리는 맞물립니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 돈·살림은 서로 굴러가는 편입니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일간 천간충 — 생각을 정하는 방식에서 정면으로 부딪힙니다.
    - 두 사람 사이 충·형·파·해 다수 — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.

### ZIWEI
- PRIMARY = **FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 관계를 끌고 갈 동력이 있습니다.
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 모아 두는 쪽에 두드러진 신호는 없습니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다. / 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:FOR · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
- DOMINANT_EVIDENCE = 명리 · 일지 육합/반합
- LOSING_EVIDENCE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- NEW_INFERENCE = 기본적인 교감은 무난한 편이에요. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = A 부처궁에 태양 화록 / 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS) / 상대→A: INDIRECT_WEALTH
- COUNTER_EVIDENCE_REF = 일간 천간충 / 두 사람 사이 충·형·파·해 다수 / A 재백궁에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 기본적인 교감은 무난한 편이에요. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=FOR

---

## [궁합] 궁합 · 결혼하면

**QUESTION** = 결혼하면 어떨까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 같이 사는 자리는 맞물립니다.
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = CONDITIONAL_AGAINST (NATAL/DIRECT) — 기본적인 교감은 무난한 편이에요.
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 같이 사는 자리는 맞물립니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 돈·살림은 서로 굴러가는 편입니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일간 천간충 — 생각을 정하는 방식에서 정면으로 부딪힙니다.
    - 두 사람 사이 충·형·파·해 다수 — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.

### ZIWEI
- PRIMARY = **FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 관계를 끌고 갈 동력이 있습니다.
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 모아 두는 쪽에 두드러진 신호는 없습니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다. / 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:FOR · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
- DOMINANT_EVIDENCE = 자미두수 · A 부처궁에 태양 화록
- LOSING_EVIDENCE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = FOR** (확신 HIGH)
- NEW_INFERENCE = 관계를 끌고 갈 동력이 있습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = A 부처궁에 태양 화록 / 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS) / 상대→A: INDIRECT_WEALTH
- COUNTER_EVIDENCE_REF = 일간 천간충 / 두 사람 사이 충·형·파·해 다수 / A 재백궁에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 관계를 끌고 갈 동력이 있습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=FOR · ZIWEI=FOR

---

## [궁합] 궁합 · 갈등

**QUESTION** = 왜 자꾸 싸울까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 서로의 속마음을 확인하는 시간이 필요한 편이에요.
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 같이 사는 과정의 난도는 높게 봅니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 편하게 표현하는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일지 충·형·해(배우자 자리) — 같이 사는 자리에서 반복해 부딪히기 쉽습니다.
    - 두 사람 사이 충·형·파·해 다수 — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.

### ZIWEI
- PRIMARY = **FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 관계를 끌고 갈 동력이 있습니다.
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 모아 두는 쪽은 무난합니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 같이 사는 난도을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:FOR(경합) · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
- DOMINANT_EVIDENCE = 명리 · 두 사람 사이 충·형·파·해 다수
- LOSING_EVIDENCE = 명리가 본 일지 충·형·해(배우자 자리)도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = AGAINST** (확신 MEDIUM)
- NEW_INFERENCE = 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = A 부처궁에 태양 화록 / C 전택궁에 태양 화권 / C 전택궁에 문곡 화과
- COUNTER_EVIDENCE_REF = 두 사람 사이 충·형·파·해 다수 / A 재백궁에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=AGAINST · ZIWEI=FOR

---

## [궁합] 궁합 · 돈 문제(MONEY)

**QUESTION** = 돈 문제로 부딪힐까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 돈·살림은 서로 굴러가는 편입니다.
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = CONDITIONAL_AGAINST (NATAL/DIRECT) — 기본적인 교감은 무난한 편이에요.
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 같이 사는 자리는 맞물립니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 돈·살림은 서로 굴러가는 편입니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일간 천간충 — 생각을 정하는 방식에서 정면으로 부딪힙니다.
    - 두 사람 사이 충·형·파·해 다수 — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 모아 두는 쪽에 두드러진 신호는 없습니다.
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 모아 두는 쪽에 두드러진 신호는 없습니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다. / 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:FOR · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
- DOMINANT_EVIDENCE = 명리 · 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS)
- LOSING_EVIDENCE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = FOR** (확신 MEDIUM)
- NEW_INFERENCE = 돈·살림은 서로 굴러가는 편입니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = A 부처궁에 태양 화록 / 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS) / 상대→A: INDIRECT_WEALTH
- COUNTER_EVIDENCE_REF = 일간 천간충 / 두 사람 사이 충·형·파·해 다수 / A 재백궁에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈·살림은 서로 굴러가는 편입니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=FOR · ZIWEI=INSUFFICIENT_EVIDENCE

---

## [궁합] 궁합 · 돈 문제(다른 상대)

**QUESTION** = 돈 문제로 부딪힐까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 서로의 속마음을 확인하는 시간이 필요한 편이에요.
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 같이 사는 과정의 난도는 높게 봅니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 편하게 표현하는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일지 충·형·해(배우자 자리) — 같이 사는 자리에서 반복해 부딪히기 쉽습니다.
    - 두 사람 사이 충·형·파·해 다수 — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.

### ZIWEI
- PRIMARY = **FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 모아 두는 쪽은 무난합니다.
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 모아 두는 쪽은 무난합니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 자미두수와 명리가 같이 사는 난도을 반대로 봅니다.
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:FOR(경합) · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
- DOMINANT_EVIDENCE = 자미두수 · C 전택궁에 태양 화권
- LOSING_EVIDENCE = 명리가 본 일지 충·형·해(배우자 자리)도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.
- **FINAL_VERDICT = FOR** (확신 HIGH)
- NEW_INFERENCE = 모아 두는 쪽은 무난합니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = A 부처궁에 태양 화록 / C 전택궁에 태양 화권 / C 전택궁에 문곡 화과
- COUNTER_EVIDENCE_REF = 두 사람 사이 충·형·파·해 다수 / A 재백궁에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 모아 두는 쪽은 무난합니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=FOR

---

## [후속 대화] 사업을 더 키워도 될까요? → 돈 문제는요?

- Q1 verdict = **CONDITIONAL_AGAINST** — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 다만 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다.
- Q1 axes = OPPORTUNITY:CONDITIONAL_AGAINST · OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- Q2 verdict = **AGAINST** — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- Q2 axes = MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR
- 후속 턴은 저장된 교차판정(divinationVerdict)을 decisionMeta로 이어받아 "왜요?"에서 같은 판정을 설명합니다.

---

## [후속 대화] 결혼해도 될까요? → 그럼 언제가 나을까요?

- Q1 verdict = **FOR_BUT_LATER** — 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- Q1 axes = RELATION_STABILITY:FOR_BUT_LATER · CONFLICT:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- Q2 verdict = **CONDITIONAL_AGAINST** — 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- Q2 axes = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:FOR_BUT_LATER · TIMING:FOR
- 후속 턴은 저장된 교차판정(divinationVerdict)을 decisionMeta로 이어받아 "왜요?"에서 같은 판정을 설명합니다.

---
