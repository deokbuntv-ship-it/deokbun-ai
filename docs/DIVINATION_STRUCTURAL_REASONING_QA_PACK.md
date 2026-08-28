# DEOKBUNI — DIVINATION STRUCTURAL REASONING QA PACK (V3)

> 자동 생성 문서입니다. 손으로 고치지 마세요.
> 생성기: `src/features/divination/__tests__/generateStructuralReasoningQaPack.test.ts`
> 모든 케이스는 실제 운영 경로(`buildConsultationGrounding`)를 그대로 통과시켜 얻은 결과입니다.

## 이 팩이 증명하려는 것

| 항목 | 값 |
| --- | --- |
| 단독 상담 케이스 | 36 |
| 반사실 대조쌍 | 5 |
| 궁합 케이스 | 6 |
| 총 합성추론(SYNTHETIC_INFERENCE) 수 | 159 |
| 답을 내면서 추론이 0이던 케이스 | 0 (0이어야 함 — §7) |
| 방향을 내지 못한 케이스 | 17 / 36 |

## ⚠ 미해결 블로커 — 축 커버리지 공백 (§13)

아래 표는 "물어본 축"별로, 그 축을 **직접 보는 자리를 가진 학문**을 나열한 것입니다.
비어 있는 축은 사주가 침묵해서가 아니라 **엔진에 그 축을 보는 경로가 정의되어 있지 않아서** 답이 나오지
않습니다. 명리 축은 현재 년/월/일/시 궁위와 십신 오행에서만 유도되므로, 몸·이동·기회 같은 축은 원국이
아무리 많은 구조를 담고 있어도 그 축으로 집계되지 않습니다.

이 공백은 학파 채택 문제가 아니라 매핑 문제이므로 다음 스프린트에서 근거를 명시해 메워야 합니다.
지금은 추측으로 메우지 않고, 답하지 못한 이유를 사용자에게 그대로 말합니다.

| 물어본 축 | 이 축을 직접 보는 학문 |
| --- | --- |
| DECISION | ZIWEI |
| GENERAL | MYUNGRI, ZIWEI |
| HEALTH_ENERGY | ZIWEI |
| MONEY_INFLOW | MYUNGRI, ZIWEI |
| MONEY_RETENTION | MYUNGRI, ZIWEI |
| MOVEMENT | ZIWEI |
| OPPORTUNITY | MYUNGRI, ZIWEI |
| RELATION_BOND | ZIWEI |
| RELATION_STABILITY | MYUNGRI, ZIWEI |

- **CANDIDATE_SYNTHESIS = n / m** — 런타임이 "추론일 수 있다"고 지목한 후보 수입니다. 실제 추론인지는
  전제를 지우거나 뒤집어 결론이 움직이는지 확인해야 하며, 그 검증은 V4B 커널 팩에서 수행합니다.
- **ANSWERED_ON_ASKED_AXIS** — 물어본 축으로 답했는지. 다른 축으로 대신 답하는 것은 금지입니다(§9).
- **DOCTRINE_BLOCKERS** — 근거 학파가 없어 판정을 보류한 항목. 비어 있지 않은 것이 정상이며, 숨기지 않습니다(§13).
- **반사실 대조** — 입력 하나만 바꿨을 때 판단이 실제로 움직이는지. 움직이지 않으면 그 입력은 쓰이지 않은 것입니다.

---

## [A 같은 질문·다른 원국] A · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(본궁)에 천동 화기
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

### REASONING
- **FINAL_VERDICT = AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = STRUCTURAL_ANSWER)
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- SYNTHETIC_INFERENCES = 4 / 21
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 자녀(대궁)에 무곡 화권
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [CROSS_AXIS_COMPOUND] (CROSS) 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 재백(본궁)에 천동 화기 / 자녀(대궁)에 무곡 화권 / 관록(삼합궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=AGAINST · QIMEN=미적용

---

## [A 같은 질문·다른 원국] B · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- 결정 요인(구조): INFLOW_VS_RETENTION · 유입과 보유
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백의 무곡·천부
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 거문 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = STRUCTURAL_ANSWER)
- 결론: 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- SYNTHETIC_INFERENCES = 6 / 22
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 지금의 큰 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 경쟁·동료
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 올해 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 일주 천간합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 지금의 큰 흐름 겁재 / 올해 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 월주 해 / 지금의 큰 흐름 → 원국 월주 해
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 시주 파 / 지금의 큰 흐름 → 원국 시주 파
    - [INFLOW_VS_RETENTION] (MYUNGRI) 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (ZIWEI) 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 재백의 무곡·천부
    - [PRIMITIVE] (ZIWEI) 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 형제(삼합궁)에 거문 화기 / 자녀(대궁)에 태음 화록
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 염정
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 지금의 큰 흐름 → 원국 월주 해
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 올해 흐름 → 원국 시주 천간합 / 올해 흐름 → 원국 시주 파
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [A 같은 질문·다른 원국] C · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백의 파군
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 전택에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 문창 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = STRUCTURAL_ANSWER)
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 3 / 17
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 년주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 이 시기 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 일주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 이 시기 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 파 / 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (ZIWEI) 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 재백의 파군
    - [PRIMITIVE] (ZIWEI) 전택에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
        ← 전택(본궁)에 태양 화권 / 형제(삼합궁)에 문창 화기
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 칠살
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 시주 천간충 / 이 시기 흐름 → 원국 시주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [A 같은 질문·다른 원국] D · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - CAREER = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- 결정 요인(구조): 복덕(대궁)에 천기 화록
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_INFLOW = CONDITIONAL_FOR (NATAL/DIRECT) — 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - CAREER = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 부처(대궁)에 태음 화기 — 대궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = FOR** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = FOR)
- 결론: 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- SYNTHETIC_INFERENCES = 2 / 16
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
        ← 지금의 큰 흐름 → 원국 월주 천간충
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 년주 천간충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 천간충 / 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 천기 화록
    - [PRIMITIVE] (ZIWEI) 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 전택(본궁)에 자미 화과
    - [PRIMITIVE] (ZIWEI) 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 부처(대궁)에 태음 화기 / 관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간충 / 지금의 큰 흐름 → 원국 월주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · MONEY_INFLOW:FOR · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [B 같은 원국·다른 축] A · 버는 쪽

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(본궁)에 천동 화기
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

### REASONING
- **FINAL_VERDICT = AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = STRUCTURAL_ANSWER)
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- SYNTHETIC_INFERENCES = 4 / 21
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 자녀(대궁)에 무곡 화권
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [CROSS_AXIS_COMPOUND] (CROSS) 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 재백(본궁)에 천동 화기 / 자녀(대궁)에 무곡 화권 / 관록(삼합궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=AGAINST · QIMEN=미적용

---

## [B 같은 원국·다른 축] A · 남는 쪽

**QUESTION** = 저축이 남을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 자녀(대궁)에 무곡 화권
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

### REASONING
- **FINAL_VERDICT = FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = FOR)
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- SYNTHETIC_INFERENCES = 4 / 21
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 자녀(대궁)에 무곡 화권
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [CROSS_AXIS_COMPOUND] (CROSS) 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 자녀(대궁)에 무곡 화권 / 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_RETENTION:FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_RETENTION:FOR(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [B 같은 원국·다른 축] A · 자리

**QUESTION** = 이직해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 부처(삼합궁)에 태양 화록
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
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MOVEMENT = FOR)
- 결론: 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- SYNTHETIC_INFERENCES = 4 / 22
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 부처(삼합궁)에 태양 화록
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_AXIS_COMPOUND] (CROSS) 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 지금의 큰 흐름 → 원국 월주 해 / 부처(삼합궁)에 태양 화록
- CONTRADICTION_RESOLUTIONS = DIFFERENT_DOMAIN: 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · MOVEMENT:FOR · CAREER:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR · MOVEMENT:FOR(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 같은 원국·다른 축] A · 관계

**QUESTION** = 결혼해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 7건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 부처(본궁)에 태양 화록
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
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = AGAINST)
- 결론: 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- SYNTHETIC_INFERENCES = 19 / 37
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
        ← 부처(본궁)에 태양 화록
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 형제은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 형제 무주성 · 대궁 노복의 염정·탐랑을 빌려 봄
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_STANDOFF] (CROSS) 원국 일지(배우자·자기 자리)·부처궁에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 원국 일지 충·형·파·해 / 부처(본궁)에 태양 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 원국 일지 충·형·파·해 / 형제 무주성 · 대궁 노복의 염정·탐랑을 빌려 봄
    - [CROSS_TIMING_SPLIT] (CROSS) 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CROSS_TIMING_SPLIT] (CROSS) 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 이 시기 흐름 → 원국 일주 형
    - [CROSS_TIMING_SPLIT] (CROSS) 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CROSS_TIMING_SPLIT] (CROSS) 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 이 시기 흐름 → 원국 일주 형
    - [CROSS_CONTRADICTION_RESOLVED] (CROSS) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.
        ← 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충 / 부처(본궁)에 태양 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충 / 형제 무주성 · 대궁 노복의 염정·탐랑을 빌려 봄
    - [CROSS_CONTRADICTION_RESOLVED] (CROSS) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.
        ← 이 시기 흐름 → 원국 일주 형 / 부처(본궁)에 태양 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 이 시기 흐름 → 원국 일주 형 / 형제 무주성 · 대궁 노복의 염정·탐랑을 빌려 봄
    - [CROSS_CONTRADICTION_RESOLVED] (CROSS) 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CROSS_CONTRADICTION_RESOLVED] (CROSS) 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 이 시기 흐름 → 원국 일주 형 / 부처(본궁)에 태양 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 이 시기 흐름 → 원국 일주 형 / 형제 무주성 · 대궁 노복의 염정·탐랑을 빌려 봄
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 일지(배우자·자기 자리)·부처궁에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_TIMESCALE: 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. / DIFFERENT_TIMESCALE: 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. / DIFFERENT_TIMESCALE: 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. / DIFFERENT_TIMESCALE: 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. / DIRECTNESS: 올해 흐름이 원국 일주 천간충를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. / DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIRECTNESS: 이 시기 흐름이 원국 일주 형를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. / DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIRECTNESS: 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. / DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIRECTNESS: 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. / DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다 (밀려난 쪽: 자미두수) / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_STABILITY:FOR · GENERAL:CONDITIONAL_AGAINST · CONFLICT:CONDITIONAL_FOR · TIMING:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다. 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 같은 원국·다른 축] A · 몸

**QUESTION** = 요즘 몸이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = HEALTH_ENERGY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 몸·기운에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 3건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 질액의 천상
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - HEALTH_ENERGY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 질액에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (HEALTH_ENERGY = STRUCTURAL_ANSWER)
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- SYNTHETIC_INFERENCES = 3 / 19
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 질액에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 질액의 천상
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · HEALTH_ENERGY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [C 질문 의도] A · 서술형

**QUESTION** = 제 타고난 성격이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = GENERAL
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 전반에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 3건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
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

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- SYNTHETIC_INFERENCES = 3 / 20
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
        ← 부처(본궁)에 태양 화록
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [C 질문 의도] A · 원인형

**QUESTION** = 왜 자꾸 부딪힐까요?
**QUESTION_INTENT** = CAUSE_WHY · **ASKED_AXIS** = GENERAL
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 전반에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 6건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
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

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 전반에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- SYNTHETIC_INFERENCES = 3 / 20
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
        ← 부처(본궁)에 태양 화록
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [C 질문 의도] A · 결정형

**QUESTION** = 사업을 더 키워도 될까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - OPPORTUNITY = CONDITIONAL_AGAINST (NATAL/DIRECT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
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
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = CONDITIONAL_AGAINST)
- 결론: 기회가 오는 쪽에 대해서는 서로 다른 근거 5가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- SYNTHETIC_INFERENCES = 7 / 26
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 올해 흐름 → 원국 시주 육합 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 이 시기 흐름 → 원국 시주 반합 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 쪽과 자리·직업은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(본궁)에 태음 화과 / 관록(삼합궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 기회가 오는 쪽과 자리·직업은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · OPPORTUNITY:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR · OPPORTUNITY:CONDITIONAL_AGAINST(경합) · OPPORTUNITY:CONDITIONAL_AGAINST(경합) · OPPORTUNITY:CONDITIONAL_AGAINST(경합) · OPPORTUNITY:CONDITIONAL_AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [C 질문 의도] A · 시기형

**QUESTION** = 언제 움직이는 게 나을까요?
**QUESTION_INTENT** = TIMING · **ASKED_AXIS** = GENERAL
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 NONE · 확신 MEDIUM · 직접성 GENERAL · 자료 EXACT)
- 결론: 전반에 대해서는 서로 다른 근거 2가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- 결정 요인(구조): 같은 방향으로 함께 서는 근거 2건
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - GENERAL = CONDITIONAL_AGAINST (NATAL/DIRECT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - RELATION_STABILITY = CONDITIONAL_FOR (NATAL/ADJACENT) — 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 전반에 대해서는 서로 다른 근거 3가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- SYNTHETIC_INFERENCES = 3 / 21
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다.
        ← 부처(본궁)에 태양 화록
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · TIMING:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [C 질문 의도] C · 원인형

**QUESTION** = 왜 자꾸 부딪힐까요?
**QUESTION_INTENT** = CAUSE_WHY · **ASKED_AXIS** = GENERAL
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 전반에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 4건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 명궁의 탐랑
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = STRUCTURAL_ANSWER** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = FOR)
- 결론: 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- SYNTHETIC_INFERENCES = 3 / 17
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 년주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 이 시기 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 일주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 이 시기 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 파 / 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 탐랑
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 칠살
    - [PRIMITIVE] (ZIWEI) 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 부처의 염정·천부
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 시주 천간충 / 이 시기 흐름 → 원국 시주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [D 반사실 · 시주] A · 시주 14시

**QUESTION** = 사업 방향이 맞을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - OPPORTUNITY = CONDITIONAL_AGAINST (NATAL/DIRECT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = CONDITIONAL_FOR (NATAL/ADJACENT) — 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - MONEY_INFLOW = AGAINST (NATAL/ADJACENT) — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(본궁)에 천동 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = CONDITIONAL_AGAINST)
- 결론: 기회가 오는 쪽에 대해서는 서로 다른 근거 5가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- SYNTHETIC_INFERENCES = 7 / 25
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 올해 흐름 → 원국 시주 육합 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 이 시기 흐름 → 원국 시주 반합 / 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [CROSS_AXIS_COMPOUND] (CROSS) 기회가 오는 쪽과 자리·직업은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(본궁)에 태음 화과 / 관록(삼합궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 기회가 오는 쪽과 자리·직업은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · OPPORTUNITY:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · OPPORTUNITY:CONDITIONAL_AGAINST(경합) · OPPORTUNITY:CONDITIONAL_AGAINST(경합) · OPPORTUNITY:CONDITIONAL_AGAINST(경합) · OPPORTUNITY:CONDITIONAL_AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [D 반사실 · 시주] A″ · 시주 02시

**QUESTION** = 사업 방향이 맞을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A″(시주만 다름) · 1990-8-15 2시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 해에 마찰을 일으킨다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- 결정 요인(구조): 명궁의 탐랑
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_INFLOW = CONDITIONAL_FOR (NATAL/ADJACENT) — 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = STRUCTURAL_ANSWER)
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 4 / 21
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 시주 해
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 탐랑
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 칠살
    - [PRIMITIVE] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 무곡 화권
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 탐랑
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 올해 흐름 → 원국 시주 천간합 / 올해 흐름 → 원국 시주 해
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · OPPORTUNITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [D 반사실 · 시주] A′ · 시주 미상

**QUESTION** = 사업 방향이 맞을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A′(시주미상) · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 REDUCED)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 3 / 11
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=미적용 · QIMEN=미적용

---

## [D 반사실 · 시점] A · 길문 시점

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
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
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (DECISION = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- SYNTHETIC_INFERENCES = 3 / 22
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · DECISION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [D 반사실 · 시점] A · 흉문 시점

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
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
- 결정 요인(구조): 값사 驚門 · 값부 天柱
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = AGAINST_FOR_NOW (PRESENT_MOMENT/DIRECT) — 지금 당장의 시점은 아닙니다.
- COUNTER_EVIDENCE:
    - 값사 驚門 (乾궁) — 지금 이 일을 이끄는 자리는 놀라고 시끄러워지는 문입니다.
    - 값부 天柱 — 판을 이끄는 기운이 껄끄럽습니다.

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (DECISION = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- SYNTHETIC_INFERENCES = 3 / 21
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 일주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (QIMEN) 지금 당장의 시점은 아닙니다.
        ← 값사 驚門 (乾궁)
    - [CROSS_STANDOFF] (CROSS) 원국 일주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 일주 천간충 / 이 시기 흐름 → 원국 일주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 일주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · DECISION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR_BUT_LATER · RELATION_STABILITY:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: 지금 당장의 시점은 아닙니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=AGAINST_FOR_NOW

---

## [D 반사실 · 시점] A · 구 결번 구간(芒種)

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1781492400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백(삼합궁)에 천동 화기
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
- 결정 요인(구조): 값사 杜門 · 값부 天輔
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = CONDITIONAL_FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (DECISION = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- SYNTHETIC_INFERENCES = 3 / 23
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 년주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 육합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 충 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 천간충 / 이 시기 흐름 → 원국 년주 자형 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [PRIMITIVE] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 재백(본궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 杜門 (震궁)
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · DECISION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=CONDITIONAL_FOR

---

## [E 물어본 축] A · 건강

**QUESTION** = 요즘 몸이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = HEALTH_ENERGY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 몸·기운에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 3건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 질액의 천상
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - HEALTH_ENERGY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 질액에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 재백(삼합궁)에 천동 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (HEALTH_ENERGY = STRUCTURAL_ANSWER)
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- SYNTHETIC_INFERENCES = 3 / 19
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 일주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 육합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (ZIWEI) 질액에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 질액의 천상
    - [PRIMITIVE] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 재백(삼합궁)에 천동 화기 / 관록(삼합궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · HEALTH_ENERGY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [E 물어본 축] B · 건강

**QUESTION** = 요즘 몸이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = HEALTH_ENERGY
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 몸·기운에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 3건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 질액에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
- 결정 요인(구조): 형제(삼합궁)에 거문 화기
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - HEALTH_ENERGY = CONDITIONAL_FOR (NATAL/DIRECT) — 질액에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 거문 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (HEALTH_ENERGY = FOR)
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- SYNTHETIC_INFERENCES = 6 / 21
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 지금의 큰 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 경쟁·동료
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 올해 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 일주 천간합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 지금의 큰 흐름 겁재 / 올해 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 월주 해 / 지금의 큰 흐름 → 원국 월주 해
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 시주 파 / 지금의 큰 흐름 → 원국 시주 파
    - [INFLOW_VS_RETENTION] (MYUNGRI) 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (ZIWEI) 질액에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
        ← 질액(본궁)에 천동 화권 / 형제(삼합궁)에 거문 화기
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 자미·천상
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 지금의 큰 흐름 → 원국 월주 해
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 올해 흐름 → 원국 시주 천간합 / 올해 흐름 → 원국 시주 파
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · HEALTH_ENERGY:FOR · GENERAL:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [E 물어본 축] C · 이동

**QUESTION** = 이사해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 천이의 자미
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MOVEMENT = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 천이에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MOVEMENT = STRUCTURAL_ANSWER)
- 결론: 이동에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 3 / 18
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 년주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 이 시기 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 일주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 이 시기 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 파 / 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (ZIWEI) 천이에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 천이의 자미
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 칠살
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 탐랑
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 시주 천간충 / 이 시기 흐름 → 원국 시주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · MOVEMENT:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [E 물어본 축] D · 이동

**QUESTION** = 이사해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - CAREER = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 천이 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- 결정 요인(구조): 부처(삼합궁)에 태음 화기
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MOVEMENT = CONDITIONAL_AGAINST (NATAL/DIRECT) — 천이 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - CAREER = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 부처(삼합궁)에 태음 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.
    - 부처(대궁)에 태음 화기 — 대궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MOVEMENT = CONDITIONAL_AGAINST)
- 결론: 이동에 대해서는 서로 다른 근거 4가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- SYNTHETIC_INFERENCES = 5 / 20
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
        ← 지금의 큰 흐름 → 원국 월주 천간충
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 년주 천간충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 천간충 / 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (ZIWEI) 천이 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 부처(삼합궁)에 태음 화기 / 복덕(삼합궁)에 천기 화록
    - [PRIMITIVE] (ZIWEI) 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 부처(대궁)에 태음 화기 / 관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 태양·거문
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간충 / 지금의 큰 흐름 → 원국 월주 반합
    - [CROSS_AXIS_COMPOUND] (CROSS) 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 지금의 큰 흐름 → 원국 월주 반합 / 부처(삼합궁)에 태음 화기 / 복덕(삼합궁)에 천기 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 올해 흐름 → 원국 월주 천간합 / 부처(삼합궁)에 태음 화기 / 복덕(삼합궁)에 천기 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 잡았을 때 남는 쪽과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 올해 흐름 → 원국 시주 반합 / 부처(삼합궁)에 태음 화기 / 복덕(삼합궁)에 천기 화록
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIFFERENT_DOMAIN: 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 잡았을 때 남는 쪽과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · MOVEMENT:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · CAREER:STRUCTURAL_ANSWER(경합) · MOVEMENT:CONDITIONAL_AGAINST(경합) · MOVEMENT:CONDITIONAL_AGAINST(경합) · MOVEMENT:CONDITIONAL_AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [F 시점형] B · 지금 창업

**QUESTION** = 지금 창업해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 명궁의 자미·천상
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
- 결정 요인(구조): 값사 驚門 · 값부 天柱
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = AGAINST_FOR_NOW (PRESENT_MOMENT/DIRECT) — 지금 당장의 시점은 아닙니다.
- COUNTER_EVIDENCE:
    - 값사 驚門 (乾궁) — 지금 이 일을 이끄는 자리는 놀라고 시끄러워지는 문입니다.
    - 값부 天柱 — 판을 이끄는 기운이 껄끄럽습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = STRUCTURAL_ANSWER)
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 7 / 28
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 지금의 큰 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 경쟁·동료
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 올해 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 경쟁·동료
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 육합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 년주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 년주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 지금의 큰 흐름 겁재 / 올해 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 월주 해 / 지금의 큰 흐름 → 원국 월주 해
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 시주 파 / 지금의 큰 흐름 → 원국 시주 파
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 자미·천상
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 염정
    - [PRIMITIVE] (ZIWEI) 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 재백의 무곡·천부
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 자미·천상
    - [PRIMITIVE] (QIMEN) 지금 당장의 시점은 아닙니다.
        ← 값사 驚門 (乾궁)
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 지금의 큰 흐름 → 원국 월주 해
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 올해 흐름 → 원국 시주 천간합 / 올해 흐름 → 원국 시주 파
    - [CROSS_STANDOFF] (CROSS) 원국 년주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 년주 육합 / 이 시기 흐름 → 원국 년주 형
    - [CROSS_STANDOFF] (CROSS) 원국 년주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 년주 육합 / 이 시기 흐름 → 원국 년주 파
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 년주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 년주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · OUTCOME:CONDITIONAL_FOR · GENERAL:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · OPPORTUNITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:FOR_BUT_LATER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합) · GENERAL:STRUCTURAL_ANSWER(경합) · GENERAL:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: 지금 당장의 시점은 아닙니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=AGAINST_FOR_NOW

---

## [F 시점형] C · 지금 투자

**QUESTION** = 지금 투자해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 재백의 파군
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 전택에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 문창 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = STRUCTURAL_ANSWER)
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 3 / 18
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 년주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 이 시기 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 일주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 이 시기 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 파 / 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (ZIWEI) 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 재백의 파군
    - [PRIMITIVE] (ZIWEI) 전택에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
        ← 전택(본궁)에 태양 화권 / 형제(삼합궁)에 문창 화기
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 칠살
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 시주 천간충 / 이 시기 흐름 → 원국 시주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [F 시점형] D · 지금 계약

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - CAREER = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_FOR (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 육합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 형를 정면으로 흔든다.
    - CAREER = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 월주 파에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 충를 정면으로 흔든다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 시주 형를 정면으로 흔든다.
    - CAREER = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- 결정 요인(구조): 명궁의 태양·거문
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - DECISION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - MONEY_INFLOW = CONDITIONAL_FOR (NATAL/ADJACENT) — 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 부처(대궁)에 태음 화기 — 대궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **AGAINST_FOR_NOW** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 일을 이끄는 문도 막혀 있고 판의 기운도 같은 방향이라, 지금 시점은 아닙니다.
- 결정 요인(구조): 값사 驚門 · 값부 天柱
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = AGAINST_FOR_NOW (PRESENT_MOMENT/DIRECT) — 지금 당장의 시점은 아닙니다.
- COUNTER_EVIDENCE:
    - 값사 驚門 (乾궁) — 지금 이 일을 이끄는 자리는 놀라고 시끄러워지는 문입니다.
    - 값부 天柱 — 판을 이끄는 기운이 껄끄럽습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (DECISION = STRUCTURAL_ANSWER)
- 결론: 결정에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 4 / 25
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
        ← 지금의 큰 흐름 → 원국 월주 천간충
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 육합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 육합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 월주 형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 월주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 형
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 월주 형 / 이 시기 흐름 → 원국 월주 파 / 지금의 큰 흐름 → 원국 월주 천간충
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 태양·거문
    - [PRIMITIVE] (ZIWEI) 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 부처(대궁)에 태음 화기 / 관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄
    - [PRIMITIVE] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 천기 화록
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 태양·거문
    - [PRIMITIVE] (QIMEN) 지금 당장의 시점은 아닙니다.
        ← 값사 驚門 (乾궁)
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간충 / 지금의 큰 흐름 → 원국 월주 반합
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 월주 천간합 / 이 시기 흐름 → 원국 월주 육합 / 이 시기 흐름 → 원국 월주 형
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 월주 천간합 / 이 시기 흐름 → 원국 월주 육합 / 이 시기 흐름 → 원국 월주 파
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · DECISION:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_AGAINST · MONEY_INFLOW:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · TIMING:FOR_BUT_LATER · CAREER:STRUCTURAL_ANSWER(경합) · CAREER:STRUCTURAL_ANSWER(경합) · CAREER:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: 지금 당장의 시점은 아닙니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=AGAINST_FOR_NOW

---

## [G 정직한 저하] A′ · 시주미상 · 결혼

**QUESTION** = 결혼해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY
**INPUT** = A′(시주미상) · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 NONE · 확신 MEDIUM · 직접성 GENERAL · 자료 REDUCED)
- 결론: 같이 사는 난도에 대해서는 서로 다른 근거 4가지가 모두 같은 쪽을 가리킵니다. 지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.
- 결정 요인(구조): 같은 방향으로 함께 서는 근거 4건
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/DIRECT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/DIRECT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/DIRECT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/DIRECT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- APPLIED = NO — 출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = CONDITIONAL_AGAINST)
- 결론: 같이 사는 난도에 대해서는 서로 다른 근거 4가지가 모두 같은 쪽을 가리킵니다. 지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.
- SYNTHETIC_INFERENCES = 3 / 12
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=미적용 · QIMEN=FOR

---

## [G 정직한 저하] A′ · 시주미상 · 시기

**QUESTION** = 언제가 좋을까요?
**QUESTION_INTENT** = TIMING · **ASKED_AXIS** = GENERAL
**INPUT** = A′(시주미상) · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 NONE · 확신 MEDIUM · 직접성 GENERAL · 자료 REDUCED)
- 결론: 전반에 대해서는 서로 다른 근거 2가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- 결정 요인(구조): 같은 방향으로 함께 서는 근거 2건
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - MONEY_INFLOW = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/DIRECT) — 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 일주 충를 정면으로 흔든다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/DIRECT) — 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
    - RELATION_STABILITY = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/DIRECT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - RELATION_STABILITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- APPLIED = NO — 출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 전반에 대해서는 서로 다른 근거 2가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- SYNTHETIC_INFERENCES = 3 / 12
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 천간충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 천간충
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 자형
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 충를 정면으로 흔든다.
        ← 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 년주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 형를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 일주 형
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 형 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 파 / 올해 흐름 → 원국 년주 자형
    - [RECURRING_FRICTION_CAUSE] (MYUNGRI) 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
        ← 원국 일지 충·형·파·해 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=미적용 · QIMEN=FOR

---

## [H 사업·재물] B · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 명궁의 자미·천상
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
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = STRUCTURAL_ANSWER)
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 6 / 24
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 지금의 큰 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 경쟁·동료
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 올해 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 일주 천간합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 지금의 큰 흐름 겁재 / 올해 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 월주 해 / 지금의 큰 흐름 → 원국 월주 해
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 시주 파 / 지금의 큰 흐름 → 원국 시주 파
    - [INFLOW_VS_RETENTION] (MYUNGRI) 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 자미·천상
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 염정
    - [PRIMITIVE] (ZIWEI) 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 재백의 무곡·천부
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 자미·천상
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 지금의 큰 흐름 → 원국 월주 해
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 올해 흐름 → 원국 시주 천간합 / 올해 흐름 → 원국 시주 파
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [H 사업·재물] C · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 명궁의 탐랑
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
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = STRUCTURAL_ANSWER)
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 3 / 19
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 년주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 이 시기 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 일주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 이 시기 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 파 / 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 탐랑
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 칠살
    - [PRIMITIVE] (ZIWEI) 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 재백의 파군
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 탐랑
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 시주 천간충 / 이 시기 흐름 → 원국 시주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · OPPORTUNITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · MONEY_INFLOW:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · TIMING:CONDITIONAL_FOR · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [H 사업·재물] D · 저축

**QUESTION** = 저축이 남을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - CAREER = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
- 결정 요인(구조): 전택(본궁)에 자미 화과
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/DIRECT) — 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
    - MONEY_INFLOW = CONDITIONAL_FOR (NATAL/ADJACENT) — 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
    - CAREER = CONDITIONAL_AGAINST (NATAL/ADJACENT) — 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- COUNTER_EVIDENCE:
    - 부처(대궁)에 태음 화기 — 대궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = FOR** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = FOR)
- 결론: 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
- SYNTHETIC_INFERENCES = 2 / 16
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
        ← 지금의 큰 흐름 → 원국 월주 천간충
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 년주 천간충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 천간충 / 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (ZIWEI) 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 전택(본궁)에 자미 화과
    - [PRIMITIVE] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 천기 화록
    - [PRIMITIVE] (ZIWEI) 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 부처(대궁)에 태음 화기 / 관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간충 / 지금의 큰 흐름 → 원국 월주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · MONEY_RETENTION:FOR · MONEY_INFLOW:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [H 사업·재물] B · 저축

**QUESTION** = 저축이 남을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 WEAK · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
- 결정 요인(구조): CONTESTED_SHARE · 벌이는 몫과 남는 몫
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 형제(삼합궁)에 거문 화기
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_AGAINST (NATAL/DIRECT) — 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE:
    - 형제(삼합궁)에 거문 화기 — 삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = CONDITIONAL_AGAINST)
- 결론: 돈이 남는 쪽에 대해서는 서로 다른 근거 2가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- SYNTHETIC_INFERENCES = 6 / 22
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 지금의 큰 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 경쟁·동료
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 올해 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 일주 천간합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 지금의 큰 흐름 겁재 / 올해 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 월주 해 / 지금의 큰 흐름 → 원국 월주 해
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 시주 파 / 지금의 큰 흐름 → 원국 시주 파
    - [INFLOW_VS_RETENTION] (MYUNGRI) 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (ZIWEI) 전택 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 형제(삼합궁)에 거문 화기 / 자녀(대궁)에 태음 화록
    - [PRIMITIVE] (ZIWEI) 재백에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 재백의 무곡·천부
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 염정
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 지금의 큰 흐름 → 원국 월주 해
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 올해 흐름 → 원국 시주 천간합 / 올해 흐름 → 원국 시주 파
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [I 관계] B · 재회

**QUESTION** = 재회 가능성이 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = GENERAL
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.
- 결정 요인(구조): 해당 축 근거 없음
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결론: 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
- 결정 요인(구조): 명궁의 자미·천상
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
- COUNTER_EVIDENCE: (없음)

### QIMEN
- APPLIED = NO — 지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = STRUCTURAL_ANSWER)
- 결론: 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- SYNTHETIC_INFERENCES = 6 / 22
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 지금의 큰 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 지금의 큰 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 경쟁·동료 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 경쟁·동료
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 올해 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 월주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 파에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 시주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 천간합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 일주 천간합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 지금의 큰 흐름 겁재 / 올해 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 월주 해 / 지금의 큰 흐름 → 원국 월주 해
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 올해 흐름 → 원국 시주 파 / 지금의 큰 흐름 → 원국 시주 파
    - [INFLOW_VS_RETENTION] (MYUNGRI) 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
        ← 이 시기 흐름 재물
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 자미·천상
    - [PRIMITIVE] (ZIWEI) 관록에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 관록의 염정
    - [PRIMITIVE] (ZIWEI) 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 부처의 탐랑
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 지금의 큰 흐름 → 원국 월주 해
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 올해 흐름 → 원국 시주 천간합 / 올해 흐름 → 원국 시주 파
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · OPPORTUNITY:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · INFLUENCE:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:STRUCTURAL_ANSWER · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · OUTCOME:STRUCTURAL_ANSWER · MONEY_INFLOW:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · CAREER:STRUCTURAL_ANSWER(경합) · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [I 관계] C · 연애

**QUESTION** = 연애운은 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = RELATION_BOND
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 GENERAL · 자료 EXACT)
- 결론: 끌리는 힘에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- 결정 요인(구조): 서로 다른 방향으로 함께 서는 결론 3건 (미확정)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
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
- 결정 요인(구조): 부처의 염정·천부
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

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_BOND = STRUCTURAL_ANSWER)
- 결론: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- SYNTHETIC_INFERENCES = 3 / 18
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 년주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 일주 자형에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
        ← 이 시기 흐름 겁재
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 시주 천간충
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 일주 파에 마찰을 일으킨다.
        ← 이 시기 흐름 → 원국 일주 파
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 이 시기 흐름 → 원국 시주 반합
    - [CONTESTED_SHARE] (MYUNGRI) 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
        ← 원국 재물 4자리 / 이 시기 흐름 겁재
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 일주 파 / 올해 흐름 → 원국 일주 자형
    - [PRIMITIVE] (ZIWEI) 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 부처의 염정·천부
    - [PRIMITIVE] (ZIWEI) 부처에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 부처의 염정·천부
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 탐랑
    - [PRIMITIVE] (ZIWEI) 형제에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 형제(본궁)에 문창 화기 / 전택(삼합궁)에 태양 화권
    - [CROSS_STANDOFF] (CROSS) 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 이 시기 흐름 → 원국 시주 천간충 / 이 시기 흐름 → 원국 시주 반합
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- WHY_OTHER_DID_NOT_DOMINATE = 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.
- AXIS_VERDICTS = OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · CAREER:STRUCTURAL_ANSWER · INFLUENCE:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_AGAINST · RELATION_STABILITY:STRUCTURAL_ANSWER · RELATION_BOND:STRUCTURAL_ANSWER · RELATION_STABILITY:STRUCTURAL_ANSWER · GENERAL:STRUCTURAL_ANSWER · CONFLICT:CONDITIONAL_AGAINST · OUTCOME:STRUCTURAL_ANSWER(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [I 관계] D · 결혼

**QUESTION** = 결혼해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 타고난 배우자 자리 자체가 흔들리는 구조다.
- 결정 요인(구조): 단일 근거 · 원국 일지(배우자·자기 자리)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 대운, 세운, 월운, 원국×운 관계(종류·위치), 일간 강약(구조), 억부용신(구조)
- SUBJUDGMENTS:
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 타고난 배우자 자리 자체가 흔들리는 구조다.
    - CAREER = STRUCTURAL_ANSWER (DAEWOON/ADJACENT) — 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
    - GENERAL = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - CAREER = CONDITIONAL_FOR (DAEWOON/ADJACENT) — 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
    - GENERAL = STRUCTURAL_ANSWER (SEWOON/ADJACENT) — 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - CAREER = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - GENERAL = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
    - OPPORTUNITY = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
    - GENERAL = STRUCTURAL_ANSWER (WOLWOON/ADJACENT) — 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- COUNTER_EVIDENCE: (없음)

### ZIWEI
- PRIMARY = **AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 부처에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
- 결정 요인(구조): 부처(본궁)에 태음 화기
- MAJOR_FACTS_USED: 12궁 궁위, 사화(四化), 삼방사정(대궁·삼합궁), 주성 배치, 신궁, 오행국·명주
- SUBJUDGMENTS:
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 부처에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
    - GENERAL = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
    - CONFLICT = CONDITIONAL_FOR (NATAL/ADJACENT) — 형제은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- COUNTER_EVIDENCE:
    - 부처(본궁)에 태음 화기 — 이 자리에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.

### QIMEN
- PRIMARY = **FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 DIRECT · 자료 EXACT)
- 결론: 이끄는 문이 열려 있고 판의 기운도 같이 밀어 줍니다. 지금 움직여도 됩니다.
- 결정 요인(구조): 값사 開門 · 값부 天心
- MAJOR_FACTS_USED: 값사문, 값부 구성, 팔신, 값사·값부 착궁, 천반·지반
- SUBJUDGMENTS:
    - TIMING = FOR (PRESENT_MOMENT/DIRECT) — 지금 움직이는 것 자체는 무리가 없습니다.
- COUNTER_EVIDENCE: (없음)

### REASONING
- **FINAL_VERDICT = AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = AGAINST)
- 결론: 같이 사는 난도에 대해서는 서로 다른 근거 5가지가 모두 같은 쪽을 가리킵니다. 지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.
- SYNTHETIC_INFERENCES = 5 / 20
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 타고난 배우자 자리 자체가 흔들리는 구조다.
        ← 원국 일지 충·형·파·해
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름에 자리·책임 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 지금의 큰 흐름 자리·책임
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.
        ← 지금의 큰 흐름 → 원국 월주 천간충
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 년주 반합
    - [PRIMITIVE] (MYUNGRI) 지금의 큰 흐름이 원국 월주 반합와 맞물려 풀린다.
        ← 지금의 큰 흐름 → 원국 월주 반합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 올해 흐름 지원·배움
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 월주 천간합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 월주 천간합
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 년주 해에 마찰을 일으킨다.
        ← 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (MYUNGRI) 올해 흐름이 원국 시주 반합와 맞물려 풀린다.
        ← 올해 흐름 → 원국 시주 반합
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
        ← 이 시기 흐름 활동·표현
    - [PRIMITIVE] (MYUNGRI) 이 시기 흐름이 원국 년주 천간충를 정면으로 흔든다.
        ← 이 시기 흐름 → 원국 년주 천간충
    - [CONVERGENT_SEAT_PRESSURE] (MYUNGRI) 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
        ← 이 시기 흐름 → 원국 년주 천간충 / 올해 흐름 → 원국 년주 해
    - [PRIMITIVE] (ZIWEI) 부처에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 부처(본궁)에 태음 화기 / 복덕(삼합궁)에 천기 화록
    - [PRIMITIVE] (ZIWEI) 명궁에는 방향을 정할 만한 신호가 들어오지 않습니다.
        ← 명궁의 태양·거문
    - [PRIMITIVE] (ZIWEI) 형제은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 전택(삼합궁)에 자미 화과
    - [PRIMITIVE] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁)
    - [CROSS_REINFORCEMENT] (CROSS) 서로 다른 자리(원국 일지(배우자·자기 자리) / 부처궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 막혀 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
        ← 원국 일지 충·형·파·해 / 부처(본궁)에 태음 화기 / 복덕(삼합궁)에 천기 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 원국 일지 충·형·파·해 / 전택(삼합궁)에 자미 화과
    - [CROSS_STANDOFF] (CROSS) 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
        ← 지금의 큰 흐름 → 원국 월주 천간충 / 지금의 큰 흐름 → 원국 월주 반합
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 부처(본궁)에 태음 화기 / 전택(삼합궁)에 자미 화과 / 복덕(삼합궁)에 천기 화록
- CONTRADICTION_RESOLUTIONS = DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIRECTNESS: 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. / DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:AGAINST · CAREER:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · GENERAL:STRUCTURAL_ANSWER · CAREER:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · OUTCOME:CONDITIONAL_FOR · OPPORTUNITY:STRUCTURAL_ANSWER · GENERAL:CONDITIONAL_AGAINST · GENERAL:STRUCTURAL_ANSWER · RELATION_STABILITY:AGAINST · GENERAL:STRUCTURAL_ANSWER · CONFLICT:CONDITIONAL_FOR · TIMING:CONDITIONAL_FOR · RELATION_STABILITY:AGAINST(경합) · RELATION_STABILITY:AGAINST(경합) · CAREER:STRUCTURAL_ANSWER(경합) · RELATION_STABILITY:AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=AGAINST · ZIWEI=AGAINST · QIMEN=FOR

---

# 반사실 대조(§41)

## [반사실 대조] 시주만 바뀌면 판단이 움직이는가

- A = A · 시주 14시 → **CONDITIONAL_AGAINST**
- B = A″ · 시주 02시 → **INSUFFICIENT_EVIDENCE**
- DIRECTION_MOVED = YES
- AXES_MOVED = MONEY_INFLOW: CONDITIONAL_AGAINST → CONDITIONAL_FOR · CAREER: CONDITIONAL_FOR → STRUCTURAL_ANSWER · OUTCOME: CONDITIONAL_FOR → STRUCTURAL_ANSWER · GENERAL: CONDITIONAL_AGAINST → STRUCTURAL_ANSWER · OPPORTUNITY: CONDITIONAL_AGAINST → STRUCTURAL_ANSWER
- 근거 차이: 같은 방향으로 함께 서는 결론 5건  ⟷  해당 축 근거 없음

---

## [반사실 대조] 시주를 모르면 정직하게 낮아지는가

- A = A · 시주 14시 → **CONDITIONAL_AGAINST**
- B = A′ · 시주 미상 → **INSUFFICIENT_EVIDENCE**
- DIRECTION_MOVED = YES
- AXES_MOVED = MONEY_INFLOW: CONDITIONAL_AGAINST → STRUCTURAL_ANSWER · CAREER: CONDITIONAL_FOR → (없음) · OUTCOME: CONDITIONAL_FOR → (없음) · GENERAL: CONDITIONAL_AGAINST → STRUCTURAL_ANSWER · OPPORTUNITY: CONDITIONAL_AGAINST → (없음)
- 근거 차이: 같은 방향으로 함께 서는 결론 5건  ⟷  해당 축 근거 없음

---

## [반사실 대조] 시점(길문/흉문)이 판단을 바꾸는가

- A = A · 길문 시점 → **CONDITIONAL_AGAINST**
- B = A · 흉문 시점 → **CONDITIONAL_AGAINST**
- DIRECTION_MOVED = NO
- AXES_MOVED = TIMING: CONDITIONAL_FOR → FOR_BUT_LATER
- 근거 차이: 단일 근거 · 명궁  ⟷  단일 근거 · 명궁

---

## [반사실 대조] 같은 원국에서 버는 축과 남는 축이 갈리는가

- A = A · 버는 쪽 → **AGAINST**
- B = A · 남는 쪽 → **FOR**
- DIRECTION_MOVED = YES
- AXES_MOVED = MONEY_INFLOW: AGAINST → CONDITIONAL_AGAINST · MONEY_RETENTION: CONDITIONAL_FOR → FOR
- 근거 차이: CROSS_AXIS_COMPOUND · 돈이 들어오는 것과 남는 것  ⟷  CROSS_AXIS_COMPOUND · 돈이 들어오는 것과 남는 것

---

## [반사실 대조] 같은 질문에서 원국이 다르면 갈리는가

- A = A · 돈 → **AGAINST**
- B = C · 돈 → **INSUFFICIENT_EVIDENCE**
- DIRECTION_MOVED = YES
- AXES_MOVED = MONEY_INFLOW: AGAINST → STRUCTURAL_ANSWER · CAREER: CONDITIONAL_FOR → STRUCTURAL_ANSWER · OUTCOME: CONDITIONAL_FOR → STRUCTURAL_ANSWER · GENERAL: STRUCTURAL_ANSWER → CONDITIONAL_FOR · OPPORTUNITY: (없음) → STRUCTURAL_ANSWER · INFLUENCE: (없음) → CONDITIONAL_AGAINST
- 근거 차이: CROSS_AXIS_COMPOUND · 돈이 들어오는 것과 남는 것  ⟷  해당 축 근거 없음

---

# 궁합(§31–§33)

## [궁합] 궁합 · 잘 맞나요(A×B)

**QUESTION** = 둘이 잘 맞나요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = RELATION_BOND
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 생각을 정하는 층에서 정면으로 부딪힙니다.
- 결정 요인(구조): 일간 천간충
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
- 결정 요인(구조): A 부처궁에 태양 화록
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 모아 두는 쪽에 두드러진 신호는 없습니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_BOND = CONDITIONAL_AGAINST)
- 결론: 끌리는 힘에 대해서는 서로 다른 근거 4가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.
- SYNTHETIC_INFERENCES = 3 / 10
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 생각을 정하는 층에서 정면으로 부딪힙니다.
        ← 일간 천간충 / 일지 육합/반합
    - [PRIMITIVE] (MYUNGRI) 같이 사는 자리는 맞물립니다.
        ← 일지 육합/반합
    - [PRIMITIVE] (MYUNGRI) 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
        ← 두 사람 사이 BRANCH_HARM
    - [PRIMITIVE] (MYUNGRI) 돈·살림은 서로 굴러가는 편입니다.
        ← 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS)
    - [PRIMITIVE] (MYUNGRI) 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
        ← 상대→A: INDIRECT_WEALTH
    - [PRIMITIVE] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [PRIMITIVE] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
    - [CROSS_AXIS_COMPOUND] (CROSS) 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 일간 천간충 / 일지 육합/반합 / 일지 육합/반합
    - [CROSS_AXIS_COMPOUND] (CROSS) 끌리는 힘과 서로 미치는 영향은 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 서로 미치는 영향은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 일간 천간충 / 상대→A: INDIRECT_WEALTH / 일지 육합/반합
    - [CROSS_AXIS_COMPOUND] (CROSS) 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 일간 천간충 / A 부처궁에 태양 화록 / 일지 육합/반합
- CONTRADICTION_RESOLUTIONS = BOND_VS_STABILITY: 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 끌리는 힘과 서로 미치는 영향은 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 서로 미치는 영향은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / BOND_VS_STABILITY: 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 끌리는 힘은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · RELATION_BOND:CONDITIONAL_AGAINST(경합) · RELATION_BOND:CONDITIONAL_AGAINST(경합) · RELATION_BOND:CONDITIONAL_AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=FOR

---

## [궁합] 궁합 · 결혼하면(A×B)

**QUESTION** = 결혼하면 어떨까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = RELATION_STABILITY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 같이 사는 자리는 맞물립니다.
- 결정 요인(구조): 일간 천간충
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
- 결정 요인(구조): A 부처궁에 태양 화록
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 모아 두는 쪽에 두드러진 신호는 없습니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = CONDITIONAL_FOR)
- 결론: 같이 사는 난도에 대해서는 서로 다른 근거 7가지가 모두 같은 쪽을 가리킵니다. 열려 있는 자리로 보셔도 됩니다. 다만 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 서 있는 상태입니다.
- SYNTHETIC_INFERENCES = 5 / 12
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 생각을 정하는 층에서 정면으로 부딪힙니다.
        ← 일간 천간충 / 일지 육합/반합
    - [PRIMITIVE] (MYUNGRI) 같이 사는 자리는 맞물립니다.
        ← 일지 육합/반합
    - [PRIMITIVE] (MYUNGRI) 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
        ← 두 사람 사이 BRANCH_HARM
    - [PRIMITIVE] (MYUNGRI) 돈·살림은 서로 굴러가는 편입니다.
        ← 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS)
    - [PRIMITIVE] (MYUNGRI) 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
        ← 상대→A: INDIRECT_WEALTH
    - [PRIMITIVE] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [PRIMITIVE] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
    - [CROSS_AXIS_COMPOUND] (CROSS) 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 끌리는 힘은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 일간 천간충 / 일지 육합/반합 / 일지 육합/반합
    - [CROSS_AXIS_COMPOUND] (CROSS) 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 끌리는 힘은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 일간 천간충 / A 부처궁에 태양 화록 / 일지 육합/반합
    - [CROSS_AXIS_COMPOUND] (CROSS) 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 열립니다, 부딪힘은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 일지 육합/반합 / 두 사람 사이 BRANCH_HARM
    - [CROSS_REINFORCEMENT] (CROSS) 서로 다른 자리(명리 RELATION_STABILITY 판단 / 부처궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 열려 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
        ← 일지 육합/반합 / A 부처궁에 태양 화록
    - [CROSS_AXIS_COMPOUND] (CROSS) 부딪힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 부딪힘은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 두 사람 사이 BRANCH_HARM / A 부처궁에 태양 화록
- CONTRADICTION_RESOLUTIONS = BOND_VS_STABILITY: 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 끌리는 힘은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / BOND_VS_STABILITY: 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 끌리는 힘은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 열립니다, 부딪힘은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 부딪힘과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 부딪힘은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR(경합) · RELATION_STABILITY:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR(경합) · RELATION_STABILITY:FOR(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=FOR · ZIWEI=FOR

---

## [궁합] 궁합 · 돈 문제(A×B)

**QUESTION** = 돈 문제로 부딪힐까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **FOR** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 돈·살림은 서로 굴러가는 편입니다.
- 결정 요인(구조): 일간 천간충
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
- 결정 요인(구조): 해당 궁에 사화 없음
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 모아 두는 쪽에 두드러진 신호는 없습니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = CONDITIONAL_FOR)
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- SYNTHETIC_INFERENCES = 1 / 8
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 생각을 정하는 층에서 정면으로 부딪힙니다.
        ← 일간 천간충 / 일지 육합/반합
    - [PRIMITIVE] (MYUNGRI) 같이 사는 자리는 맞물립니다.
        ← 일지 육합/반합
    - [PRIMITIVE] (MYUNGRI) 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
        ← 두 사람 사이 BRANCH_HARM
    - [PRIMITIVE] (MYUNGRI) 돈·살림은 서로 굴러가는 편입니다.
        ← 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS)
    - [PRIMITIVE] (MYUNGRI) 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
        ← 상대→A: INDIRECT_WEALTH
    - [PRIMITIVE] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [PRIMITIVE] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
    - [CROSS_AXIS_COMPOUND] (CROSS) 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS) / A 재백궁에 천동 화기
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=FOR · ZIWEI=INSUFFICIENT_EVIDENCE

---

## [궁합] 궁합 · 돈 문제(A×C)

**QUESTION** = 돈 문제로 부딪힐까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
- 결정 요인(구조): 일지 충·형·해
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
- 결정 요인(구조): C 전택궁에 태양 화권
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 모아 두는 쪽은 무난합니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### REASONING
- **FINAL_VERDICT = FOR** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = FOR)
- 결론: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- SYNTHETIC_INFERENCES = 1 / 7
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 같이 사는 과정의 난도는 높게 봅니다.
        ← 일지 충·형·해(배우자 자리)
    - [PRIMITIVE] (MYUNGRI) 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
        ← 두 사람 사이 BRANCH_SELF_PUNISHMENT
    - [PRIMITIVE] (MYUNGRI) 상대는 상대에게 편하게 표현하는 결로 작용합니다.
        ← 상대→A: EATING_GOD
    - [PRIMITIVE] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [PRIMITIVE] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
    - [PRIMITIVE] (ZIWEI) 모아 두는 쪽은 무난합니다.
        ← C 전택궁에 태양 화권
    - [CROSS_AXIS_COMPOUND] (CROSS) 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← A 재백궁에 천동 화기 / C 전택궁에 태양 화권
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CONFLICT:CONDITIONAL_AGAINST · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:FOR · MONEY_RETENTION:FOR(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=FOR

---

## [궁합] 궁합 · 갈등(A×C)

**QUESTION** = 왜 자꾸 싸울까요?
**QUESTION_INTENT** = CAUSE_WHY · **ASKED_AXIS** = CONFLICT
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
- 결정 요인(구조): 일지 충·형·해
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
- 결정 요인(구조): A 부처궁에 태양 화록
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = FOR (NATAL/DIRECT) — 관계를 끌고 갈 동력이 있습니다.
    - MONEY_INFLOW = AGAINST (NATAL/DIRECT) — 버는 쪽이 매끄럽지 않습니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 모아 두는 쪽은 무난합니다.
- COUNTER_EVIDENCE:
    - A 재백궁에 천동 화기 — 버는 길목이 매끄럽지 않습니다.

### QIMEN
- (없음)

### REASONING
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (CONFLICT = CONDITIONAL_AGAINST)
- 결론: 부딪힘에 대해서는 서로 다른 근거 3가지가 모두 같은 쪽을 가리킵니다. 지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.
- SYNTHETIC_INFERENCES = 2 / 8
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 같이 사는 과정의 난도는 높게 봅니다.
        ← 일지 충·형·해(배우자 자리)
    - [PRIMITIVE] (MYUNGRI) 두 사람이 마주 앉는 자리에서 직접 부딪히는 구조입니다.
        ← 두 사람 사이 BRANCH_SELF_PUNISHMENT
    - [PRIMITIVE] (MYUNGRI) 상대는 상대에게 편하게 표현하는 결로 작용합니다.
        ← 상대→A: EATING_GOD
    - [PRIMITIVE] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [PRIMITIVE] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
    - [PRIMITIVE] (ZIWEI) 모아 두는 쪽은 무난합니다.
        ← C 전택궁에 태양 화권
    - [CROSS_AXIS_COMPOUND] (CROSS) 부딪힘과 서로 미치는 영향은 다르게 봅니다. 부딪힘은 막힙니다, 서로 미치는 영향은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 두 사람 사이 BRANCH_SELF_PUNISHMENT / 상대→A: EATING_GOD
    - [CROSS_AXIS_COMPOUND] (CROSS) 부딪힘과 같이 사는 난도는 다르게 봅니다. 부딪힘은 막힙니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
        ← 두 사람 사이 BRANCH_SELF_PUNISHMENT / A 부처궁에 태양 화록
- CONTRADICTION_RESOLUTIONS = DIFFERENT_DOMAIN: 부딪힘과 서로 미치는 영향은 다르게 봅니다. 부딪힘은 막힙니다, 서로 미치는 영향은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / DIFFERENT_DOMAIN: 부딪힘과 같이 사는 난도는 다르게 봅니다. 부딪힘은 막힙니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- WHY_OTHER_DID_NOT_DOMINATE = 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CONFLICT:CONDITIONAL_AGAINST · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CONFLICT:CONDITIONAL_AGAINST(경합) · CONFLICT:CONDITIONAL_AGAINST(경합)
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=AGAINST · ZIWEI=FOR

---

## [궁합] 궁합 · 돈 문제(B×D)

**QUESTION** = 돈 문제로 부딪힐까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
- 결정 요인(구조): 두 사람 사이 BRANCH_PUNISHMENT
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 끌리는 힘 쪽으로 두드러진 관계가 잡히지 않습니다.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 배우자 자리에 두드러진 신호는 없습니다.
    - CONFLICT = CONDITIONAL_AGAINST (NATAL/DIRECT) — 부딪히는 지점은 있으나 두 사람의 자리 자체는 아닙니다.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 편하게 표현하는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 두 사람 사이 BRANCH_PUNISHMENT — 부딪히는 지점이 있으나 두 사람의 자리 자체는 아닙니다.
    - 두 사람 사이 BRANCH_DESTRUCTION — 부딪히는 지점이 있으나 두 사람의 자리 자체는 아닙니다.
    - 두 사람 사이 BRANCH_PUNISHMENT — 부딪히는 지점이 있으나 두 사람의 자리 자체는 아닙니다.

### ZIWEI
- PRIMARY = **FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 모아 두는 쪽은 무난합니다.
- 결정 요인(구조): D 전택궁에 자미 화과
- MAJOR_FACTS_USED: 부처궁, 재백궁, 전택궁, 사화(두 명반)
- SUBJUDGMENTS:
    - RELATION_STABILITY = AGAINST (NATAL/DIRECT) — 결혼생활의 난도는 높게 봅니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 버는 쪽에 두드러진 신호는 없습니다.
    - MONEY_RETENTION = FOR (NATAL/DIRECT) — 모아 두는 쪽은 무난합니다.
- COUNTER_EVIDENCE:
    - D 부처궁에 태음 화기 — 배우자 자리가 얽혀, 같이 사는 과정의 난도가 올라갑니다.

### QIMEN
- (없음)

### REASONING
- **FINAL_VERDICT = FOR** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = FOR)
- 결론: 모아 두는 쪽은 무난합니다.
- SYNTHETIC_INFERENCES = 0 / 4
- PROPOSITIONS:
    - [PRIMITIVE] (MYUNGRI) 부딪히는 지점은 있으나 두 사람의 자리 자체는 아닙니다.
        ← 두 사람 사이 BRANCH_PUNISHMENT
    - [PRIMITIVE] (MYUNGRI) 상대는 상대에게 편하게 표현하는 결로 작용합니다.
        ← 상대→B: EATING_GOD
    - [PRIMITIVE] (ZIWEI) 결혼생활의 난도는 높게 봅니다.
        ← D 부처궁에 태음 화기
    - [PRIMITIVE] (ZIWEI) 모아 두는 쪽은 무난합니다.
        ← D 전택궁에 자미 화과
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = CONFLICT:CONDITIONAL_AGAINST · INFLUENCE:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST · MONEY_RETENTION:FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=FOR

---
