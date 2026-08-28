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
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(재물 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/DIRECT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/DIRECT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(MONEY)
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
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST(경합)
- DOMINANT_EVIDENCE = CROSS_AXIS_COMPOUND · 돈이 들어오는 것과 남는 것
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = CROSS_AXIS_COMPOUND 규칙으로 여러 근거가 맞물려 도출되었습니다.
- **FINAL_VERDICT = AGAINST** (확신 HIGH)
- NEW_INFERENCE = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=AGAINST · QIMEN=미적용

---

## [A 동일질문·다른원국] B · 돈을 벌 수 있나

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(재물 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
    - INFLUENCE = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - CAREER = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - OUTCOME = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - MONEY_INFLOW = CONDITIONAL_AGAINST (WOLWOON/DIRECT) — 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(MONEY)
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 거문 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자리·직업에서 서로 다른 신호가 함께 잡힙니다. / 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = INFLOW_VS_RETENTION · 유입과 보유
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = INFLOW_VS_RETENTION 규칙으로 여러 근거가 맞물려 도출되었습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- NEW_INFERENCE = 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 월주 천간합 / 올해 흐름 → 원국 시주 천간합 / 이 시기 흐름 → 원국 일주 천간합
- COUNTER_EVIDENCE_REF = 자녀(대궁)에 태음 화록
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = WOLWOON/NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [A 동일질문·다른원국] C · 돈을 벌 수 있나

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(재물 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
    - CAREER = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(MONEY)
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 전택에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 문창 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 년주 반합 / 올해 흐름 → 원국 년주 천간합 / 이 시기 흐름 → 원국 월주 반합
- COUNTER_EVIDENCE_REF = 형제(삼합궁)에 문창 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [B 동일원국·다른질문] A · 돈이 남는가(보유)

**QUESTION** = 돈이 모일까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(재물 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(MONEY)
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
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_RETENTION:FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_RETENTION:FOR(경합)
- DOMINANT_EVIDENCE = CROSS_AXIS_COMPOUND · 돈이 들어오는 것과 남는 것
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = CROSS_AXIS_COMPOUND 규칙으로 여러 근거가 맞물려 도출되었습니다.
- **FINAL_VERDICT = FOR** (확신 HIGH)
- NEW_INFERENCE = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [B 동일원국·다른질문] A · 결혼

**QUESTION** = 결혼해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(연애 판정), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = FOR (DAEWOON/DIRECT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = AGAINST (SEWOON/DIRECT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = AGAINST (SEWOON/DIRECT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = AGAINST (WOLWOON/DIRECT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = FOR_BUT_LATER (SEWOON/DIRECT) — 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.
    - RELATION_STABILITY = FOR_BUT_LATER (WOLWOON/DIRECT) — 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(LOVE)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_FOR (NATAL/DIRECT) — 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CONFLICT = CONDITIONAL_FOR (NATAL/ADJACENT) — 형제은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(LOVE)
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 같이 사는 난도에서 서로 다른 신호가 함께 잡힙니다. / 명리는 "올해 흐름이 원국 일주 천간충를 정면으로 흔든다.", 자미두수는 "부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다." / 명리는 "이 시기 흐름이 원국 일주 형를 정면으로 흔든다.", 자미두수는 "부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다." / 명리는 "원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.", 자미두수는 "부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다." / 명리는 "원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.", 자미두수는 "부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다."
- DOMAIN_DECOMPOSITION = 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. / 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. / 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. / 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
- AXIS_VERDICTS = RELATION_STABILITY:AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_STABILITY:FOR · GENERAL:CONDITIONAL_AGAINST · CONFLICT:CONDITIONAL_FOR · TIMING:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합)
- DOMINANT_EVIDENCE = 서로 다른 방향으로 함께 서는 결론 16건 (미확정)
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과 / 부처(본궁)에 태양 화록 / 부처(본궁)에 태양 화록
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 시기: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 동일원국·다른질문] A · 이직

**QUESTION** = 이직해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(직업 판정), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(CAREER)
- SUBJUDGMENTS:
    - MOVEMENT = CONDITIONAL_FOR (NATAL/DIRECT) — 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(CAREER)
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MOVEMENT:FOR · CAREER:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR · MOVEMENT:FOR(경합)
- DOMINANT_EVIDENCE = CROSS_AXIS_COMPOUND · 자리·직업과 이동
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = CROSS_AXIS_COMPOUND 규칙으로 여러 근거가 맞물려 도출되었습니다.
- **FINAL_VERDICT = FOR** (확신 HIGH)
- NEW_INFERENCE = 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 동일원국·다른질문] A · 건강

**QUESTION** = 요즘 몸이 어떤가요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 몸·기운에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

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
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · HEALTH_ENERGY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [C 시점형(기문 적용)] A · 지금 계약(길문)

**QUESTION** = 지금 계약해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

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
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(EVENT_SUCCESS)
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · DECISION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 단일 근거 · 명궁
- LOSING_EVIDENCE = 없음
- RESOLUTION = 단일 근거에 기대고 있어 확신을 높게 두지 않습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- NEW_INFERENCE = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [C 시점형(기문 적용)] A · 지금 계약(흉문)

**QUESTION** = 지금 계약해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - RELATION_STABILITY = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

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
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **AGAINST_FOR_NOW** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 일을 이끄는 문도 막혀 있고 판의 기운도 같은 방향이라, 지금 시점은 아닙니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(EVENT_SUCCESS)
- SUBJUDGMENTS:
    - TIMING = AGAINST_FOR_NOW (PRESENT_MOMENT/DIRECT) — 지금 당장의 시점은 아닙니다.
- COUNTER_EVIDENCE:
    - 값사 驚門 (乾궁) — 지금 이 일을 이끄는 자리는 놀라고 시끄러워지는 문입니다.
    - 값부 天柱 (坤궁) — 판을 이끄는 기운이 껄끄럽습니다.
    - 값사문(驚門) — 이 일을 이끄는 자리가 막혀 있습니다.
    - 값부 天柱 — 판을 이끄는 기운이 껄끄럽습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 같이 사는 난도에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · DECISION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR_BUT_LATER · RELATION_STABILITY:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 단일 근거 · 명궁
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 단일 근거에 기대고 있어 확신을 높게 두지 않습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- NEW_INFERENCE = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
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
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(사업 판정), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/DIRECT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
    - INFLUENCE = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
    - INFLUENCE = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 천간합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 육합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 형를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - CAREER = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - OUTCOME = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(BUSINESS)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **AGAINST_FOR_NOW** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 일을 이끄는 문도 막혀 있고 판의 기운도 같은 방향이라, 지금 시점은 아닙니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(BUSINESS)
- SUBJUDGMENTS:
    - TIMING = AGAINST_FOR_NOW (PRESENT_MOMENT/DIRECT) — 지금 당장의 시점은 아닙니다.
- COUNTER_EVIDENCE:
    - 값사 驚門 (乾궁) — 지금 이 일을 이끄는 자리는 놀라고 시끄러워지는 문입니다.
    - 값부 天柱 (坤궁) — 판을 이끄는 기운이 껄끄럽습니다.
    - 값사문(驚門) — 사안을 이끄는 자리가 막혀 있습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자리·직업에서 서로 다른 신호가 함께 잡힙니다. / 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다. / 전반에서 서로 다른 신호가 함께 잡힙니다. / 전반에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · OUTCOME:CONDITIONAL_FOR · GENERAL:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · OPPORTUNITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:FOR_BUT_LATER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합) · GENERAL:STRUCTURAL_ANSWER(경합) · GENERAL:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 월주 천간합 / 올해 흐름 → 원국 시주 천간합 / 이 시기 흐름 → 원국 시주 천간합
- COUNTER_EVIDENCE_REF = 乾궁 九地
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- 시기: 지금 당장의 시점은 아닙니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=AGAINST_FOR_NOW

---

## [D 정직한 저하] D · 출생시간 미상

**QUESTION** = 사업 방향이 맞을까요?
**INPUT_FACT_SUMMARY** = D · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 REDUCED)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(사업 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- APPLIED = NO — 출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = (없음)
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=미적용 · QIMEN=미적용

---

## [D 정직한 저하] A · 기문 계산 실패 시점

**QUESTION** = 지금 계약해도 될까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1781492400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 육합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

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
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **CONDITIONAL_FOR** (근거강도 MODERATE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 일 자체는 중립이지만 판이 도와주어, 조용히 진행할 만합니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(EVENT_SUCCESS)
- SUBJUDGMENTS:
    - TIMING = CONDITIONAL_FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · DECISION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 단일 근거 · 명궁
- LOSING_EVIDENCE = 없음
- RESOLUTION = 단일 근거에 기대고 있어 확신을 높게 두지 않습니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- NEW_INFERENCE = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=CONDITIONAL_FOR

---

## [D 정직한 저하] A · 성격(방향형 아님)

**QUESTION** = 제 타고난 성격이 어떤가요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 전반에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/DIRECT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/DIRECT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

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

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 없음
- RESOLUTION = 적용은 됐지만 방향을 정할 신호가 약합니다.
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 일주 천간합 / 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합
- COUNTER_EVIDENCE_REF = 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [E 관계] B · 재회

**QUESTION** = 재회 가능성이 있을까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(재회 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
    - INFLUENCE = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - CAREER = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - OUTCOME = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - MONEY_INFLOW = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(REUNION)
- SUBJUDGMENTS:
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CONFLICT = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 형제은 힘도 실리지만 화기로 걸리는 지점이 함께 있어, 조건을 정리하지 않으면 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(본궁)에 거문 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자리·직업에서 서로 다른 신호가 함께 잡힙니다. / 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · RELATION_BOND:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · CONFLICT:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 끌리는 힘에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 월주 천간합 / 올해 흐름 → 원국 시주 천간합 / 이 시기 흐름 → 원국 일주 천간합
- COUNTER_EVIDENCE_REF = 형제(본궁)에 천기 화과
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 끌리는 힘에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [E 관계] C · 갈등

**QUESTION** = 왜 자꾸 부딪힐까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 전반에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = FOR (DAEWOON/DIRECT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = FOR (SEWOON/DIRECT) — 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
    - CAREER = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

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
- SAME_PROPOSITION_CONFLICT = 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = CONVERGENT_SEAT_PRESSURE · 원국 일주
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = CONVERGENT_SEAT_PRESSURE 규칙으로 여러 근거가 맞물려 도출되었습니다.
- **FINAL_VERDICT = STRUCTURAL_ANSWER** (확신 MEDIUM)
- NEW_INFERENCE = 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 년주 반합 / 올해 흐름 → 원국 년주 천간합 / 이 시기 흐름 → 원국 월주 반합
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [E 관계] C · 연애

**QUESTION** = 연애운은 어떤가요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 끌리는 힘에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(연애 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
    - CAREER = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(LOVE)
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
- SAME_PROPOSITION_CONFLICT = 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_BOND:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · CONFLICT:CONDITIONAL_AGAINST · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 명리에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 년주 반합 / 올해 흐름 → 원국 년주 천간합 / 이 시기 흐름 → 원국 월주 반합
- COUNTER_EVIDENCE_REF = 전택(삼합궁)에 태양 화권
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [F 사업·재물] B · 사업 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(사업 판정), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/DIRECT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
    - INFLUENCE = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - CAREER = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - OUTCOME = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - MONEY_INFLOW = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(BUSINESS)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(BUSINESS)
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 자리·직업에서 서로 다른 신호가 함께 잡힙니다. / 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 월주 천간합 / 올해 흐름 → 원국 시주 천간합 / 이 시기 흐름 → 원국 일주 천간합
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [F 사업·재물] C · 사업 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(사업 판정), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/DIRECT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (SEWOON/DIRECT) — 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
    - CAREER = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(BUSINESS)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(BUSINESS)
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · OPPORTUNITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 년주 반합 / 올해 흐름 → 원국 년주 천간합 / 이 시기 흐름 → 원국 월주 반합
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [F 사업·재물] B · 저축이 남는가

**QUESTION** = 저축이 남을까요?
**INPUT_FACT_SUMMARY** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 WEAK · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(재물 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
    - INFLUENCE = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (SEWOON/DIRECT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - CAREER = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - OUTCOME = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - MONEY_INFLOW = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(MONEY)
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/DIRECT) — 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 거문 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### CROSS
- SAME_PROPOSITION_CONFLICT = 자리·직업에서 서로 다른 신호가 함께 잡힙니다. / 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 같은 방향으로 함께 서는 결론 2건
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 적용은 됐지만 방향을 정할 신호가 약합니다.
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- NEW_INFERENCE = 돈이 남는 쪽에 대해서는 서로 다른 근거 2가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 월주 천간합 / 올해 흐름 → 원국 시주 천간합 / 이 시기 흐름 → 원국 일주 천간합
- COUNTER_EVIDENCE_REF = 자녀(대궁)에 태음 화록
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = SEWOON/NATAL
- TRACEABLE = YES
- 결론: 돈이 남는 쪽에 대해서는 서로 다른 근거 2가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [F 사업·재물] C · 이사

**QUESTION** = 이사해도 될까요?
**INPUT_FACT_SUMMARY** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조), 상담판정(변화 판정), 상담판정(시기 판정)
- 일간 강약: STRONG_LEANING (Myungri Structural V2)
- SUBJUDGMENTS:
    - OPPORTUNITY = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
    - CAREER = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - INFLUENCE = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 천이에는 방향을 정할 만한 신호가 들어오지 않습니다.
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주, 상담판정(CHANGE)
- SUBJUDGMENTS:
    - MOVEMENT = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 천이에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반, 상담판정(CHANGE)
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### CROSS
- SAME_PROPOSITION_CONFLICT = 잡았을 때 남는 쪽에서 서로 다른 신호가 함께 잡힙니다.
- DOMAIN_DECOMPOSITION = 없음
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · MOVEMENT:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOMINANT_EVIDENCE = 해당 축 근거 없음
- LOSING_EVIDENCE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- RESOLUTION = 명리·기문둔갑에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- NEW_INFERENCE = 이동에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 지금의 큰 흐름 → 원국 년주 반합 / 올해 흐름 → 원국 년주 천간합 / 이 시기 흐름 → 원국 월주 반합
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI+QIMEN
- TEMPORAL_SCOPE = NATAL/PRESENT_MOMENT
- TRACEABLE = YES
- 결론: 이동에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [궁합] 궁합 · 잘 맞나요

**QUESTION** = 둘이 잘 맞나요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 생각을 정하는 층에서 정면으로 부딪힙니다.
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = CONDITIONAL_AGAINST (NATAL/DIRECT) — 생각을 정하는 층에서 정면으로 부딪힙니다.
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 같이 사는 자리는 맞물립니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 돈·살림은 서로 굴러가는 편입니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일간 천간충 — 생각을 정하는 방식에서 정면으로 부딪힙니다.
    - 두 사람 사이 BRANCH_HARM — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_PUNISHMENT — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_DESTRUCTION — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.

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
- DOMAIN_DECOMPOSITION = 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 끌리는 힘과 서로 미치는 영향은 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 서로 미치는 영향은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · RELATION_BOND:CONDITIONAL_AGAINST(경합) · RELATION_BOND:CONDITIONAL_AGAINST(경합) · RELATION_BOND:CONDITIONAL_AGAINST(경합)
- DOMINANT_EVIDENCE = 같은 방향으로 함께 서는 결론 4건
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 자미두수에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- NEW_INFERENCE = 끌리는 힘에 대해서는 서로 다른 근거 4가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 일지 육합/반합 / 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS) / 상대→A: INDIRECT_WEALTH
- COUNTER_EVIDENCE_REF = 일지 육합/반합 / 일지 육합/반합 / 일지 육합/반합
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 끌리는 힘에 대해서는 서로 다른 근거 4가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
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
    - RELATION_BOND = CONDITIONAL_AGAINST (NATAL/DIRECT) — 생각을 정하는 층에서 정면으로 부딪힙니다.
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 같이 사는 자리는 맞물립니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 돈·살림은 서로 굴러가는 편입니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일간 천간충 — 생각을 정하는 방식에서 정면으로 부딪힙니다.
    - 두 사람 사이 BRANCH_HARM — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_PUNISHMENT — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_DESTRUCTION — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.

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
- DOMAIN_DECOMPOSITION = 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 끌리는 힘은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 끌리는 힘은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 열립니다, 부딪힘은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다. / 부딪힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 부딪힘은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR(경합) · RELATION_STABILITY:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR(경합) · RELATION_STABILITY:FOR(경합)
- DOMINANT_EVIDENCE = 같은 방향으로 함께 서는 결론 7건
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 적용은 됐지만 방향을 정할 신호가 약합니다.
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 LOW)
- NEW_INFERENCE = 같이 사는 난도에 대해서는 서로 다른 근거 7가지가 모두 같은 쪽을 가리킵니다. 열려 있는 자리로 보셔도 됩니다. 다만 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 서 있는 상태입니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 일지 육합/반합 / 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS) / 상대→A: INDIRECT_WEALTH
- COUNTER_EVIDENCE_REF = 일지 육합/반합 / 일지 육합/반합 / 일지 육합/반합
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 같이 사는 난도에 대해서는 서로 다른 근거 7가지가 모두 같은 쪽을 가리킵니다. 열려 있는 자리로 보셔도 됩니다. 다만 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 서 있는 상태입니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=FOR · ZIWEI=FOR

---

## [궁합] 궁합 · 갈등

**QUESTION** = 왜 자꾸 싸울까요?
**INPUT_FACT_SUMMARY** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 끌리는 힘 쪽으로 두드러진 관계가 잡히지 않습니다.
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 같이 사는 과정의 난도는 높게 봅니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 편하게 표현하는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일지 충·형·해(배우자 자리) — 같이 사는 자리에서 반복해 부딪히기 쉽습니다.
    - 두 사람 사이 BRANCH_SELF_PUNISHMENT — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_PUNISHMENT — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_DESTRUCTION — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.

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
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 부딪힘과 서로 미치는 영향은 다르게 봅니다. 부딪힘은 막힙니다, 서로 미치는 영향은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 부딪힘과 같이 사는 난도는 다르게 봅니다. 부딪힘은 막힙니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CONFLICT:CONDITIONAL_AGAINST · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST(경합) · CONFLICT:CONDITIONAL_AGAINST(경합)
- DOMINANT_EVIDENCE = 같은 방향으로 함께 서는 결론 3건
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = 자미두수에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- NEW_INFERENCE = 부딪힘에 대해서는 서로 다른 근거 3가지가 모두 같은 쪽을 가리킵니다. 지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 상대→A: EATING_GOD / A 부처궁에 태양 화록 / C 전택궁에 태양 화권
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 부딪힘에 대해서는 서로 다른 근거 3가지가 모두 같은 쪽을 가리킵니다. 지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.
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
    - RELATION_BOND = CONDITIONAL_AGAINST (NATAL/DIRECT) — 생각을 정하는 층에서 정면으로 부딪힙니다.
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 같이 사는 자리는 맞물립니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 돈·살림은 서로 굴러가는 편입니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일간 천간충 — 생각을 정하는 방식에서 정면으로 부딪힙니다.
    - 두 사람 사이 BRANCH_HARM — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_PUNISHMENT — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_DESTRUCTION — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.

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
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR(경합)
- DOMINANT_EVIDENCE = CROSS_AXIS_COMPOUND · 돈이 들어오는 것과 남는 것
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = CROSS_AXIS_COMPOUND 규칙으로 여러 근거가 맞물려 도출되었습니다.
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 MEDIUM)
- NEW_INFERENCE = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 일지 육합/반합 / 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS) / 상대→A: INDIRECT_WEALTH
- COUNTER_EVIDENCE_REF = 일지 육합/반합
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
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
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 끌리는 힘 쪽으로 두드러진 관계가 잡히지 않습니다.
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 같이 사는 과정의 난도는 높게 봅니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 편하게 표현하는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 일지 충·형·해(배우자 자리) — 같이 사는 자리에서 반복해 부딪히기 쉽습니다.
    - 두 사람 사이 BRANCH_SELF_PUNISHMENT — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_PUNISHMENT — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.
    - 두 사람 사이 BRANCH_DESTRUCTION — 두 사람이 마주 앉는 자리에서 직접 부딪힙니다.

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
- SAME_PROPOSITION_CONFLICT = 없음
- DOMAIN_DECOMPOSITION = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- TEMPORAL_DECOMPOSITION = 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CONFLICT:CONDITIONAL_AGAINST · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:FOR · MONEY_RETENTION:FOR(경합)
- DOMINANT_EVIDENCE = CROSS_AXIS_COMPOUND · 돈이 들어오는 것과 남는 것
- LOSING_EVIDENCE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- RESOLUTION = CROSS_AXIS_COMPOUND 규칙으로 여러 근거가 맞물려 도출되었습니다.
- **FINAL_VERDICT = FOR** (확신 MEDIUM)
- NEW_INFERENCE = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- INFERENCE_IS_PRIMITIVE_FACT = NO (축별 판정 + 교차 추론으로 새로 도출)
- SUPPORTED_BY = 상대→A: EATING_GOD / A 부처궁에 태양 화록 / C 전택궁에 태양 화권
- COUNTER_EVIDENCE_REF = (없음)
- DISCIPLINES_CONTRIBUTING = MYUNGRI+ZIWEI
- TEMPORAL_SCOPE = NATAL
- TRACEABLE = YES
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=FOR

---

## [후속 대화] 사업을 더 키워도 될까요? → 돈 문제는요?

- Q1 verdict = **CONDITIONAL_AGAINST** — 기회가 오는 쪽에 대해서는 서로 다른 근거 5가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- Q1 axes = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · OPPORTUNITY:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR · OPPORTUNITY:CONDITIONAL_AGAINST · OPPORTUNITY:CONDITIONAL_AGAINST · OPPORTUNITY:CONDITIONAL_AGAINST · OPPORTUNITY:CONDITIONAL_AGAINST
- Q2 verdict = **AGAINST** — 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- Q2 axes = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
- 후속 턴은 저장된 교차판정(divinationVerdict)을 decisionMeta로 이어받아 "왜요?"에서 같은 판정을 설명합니다.

---

## [후속 대화] 결혼해도 될까요? → 그럼 언제가 나을까요?

- Q1 verdict = **INSUFFICIENT_EVIDENCE** — 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- Q1 axes = RELATION_STABILITY:AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_STABILITY:FOR · GENERAL:CONDITIONAL_AGAINST · CONFLICT:CONDITIONAL_FOR · TIMING:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_STABILITY:AGAINST · RELATION_STABILITY:FOR_BUT_LATER · RELATION_STABILITY:FOR_BUT_LATER · RELATION_STABILITY:FOR_BUT_LATER · RELATION_STABILITY:FOR_BUT_LATER · RELATION_STABILITY:AGAINST · RELATION_STABILITY:AGAINST · RELATION_STABILITY:AGAINST · RELATION_STABILITY:AGAINST · RELATION_STABILITY:FOR_BUT_LATER · RELATION_STABILITY:FOR_BUT_LATER · RELATION_STABILITY:FOR_BUT_LATER · RELATION_STABILITY:FOR_BUT_LATER
- Q2 verdict = **CONDITIONAL_AGAINST** — 전반에 대해서는 서로 다른 근거 3가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- Q2 axes = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · TIMING:CONDITIONAL_FOR
- 후속 턴은 저장된 교차판정(divinationVerdict)을 decisionMeta로 이어받아 "왜요?"에서 같은 판정을 설명합니다.

---
