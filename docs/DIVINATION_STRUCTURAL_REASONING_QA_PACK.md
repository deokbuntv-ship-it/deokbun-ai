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
| 총 합성추론(SYNTHETIC_INFERENCE) 수 | 113 |
| 답을 내면서 추론이 0이던 케이스 | 0 (0이어야 함 — §7) |
| 방향을 내지 못한 케이스 | 14 / 36 |

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
| MOVEMENT | MYUNGRI, ZIWEI |
| OPPORTUNITY | MYUNGRI, ZIWEI |
| RELATION_BOND | ZIWEI |
| RELATION_STABILITY | MYUNGRI, ZIWEI |

- **SYNTHETIC_INFERENCES = n / m** — m개 명제 중 n개가 실제 추론입니다. 단일사실 재진술은 추론으로 세지 않습니다.
- **ANSWERED_ON_ASKED_AXIS** — 물어본 축으로 답했는지. 다른 축으로 대신 답하는 것은 금지입니다(§9).
- **DOCTRINE_BLOCKERS** — 근거 학파가 없어 판정을 보류한 항목. 비어 있지 않은 것이 정상이며, 숨기지 않습니다(§13).
- **반사실 대조** — 입력 하나만 바꿨을 때 판단이 실제로 움직이는지. 움직이지 않으면 그 입력은 쓰이지 않은 것입니다.

---

## [A 같은 질문·다른 원국] A · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MONEY_INFLOW)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = AGAINST)
- 결론: 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 내 다중사실 종합] (MYUNGRI) 들어온 것을 지키는 구조는 크게 새지 않습니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 2자리 / 원국 통근 튼튼
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다. / INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR(경합)
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=AGAINST · QIMEN=미적용

---

## [A 같은 질문·다른 원국] B · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MONEY_INFLOW)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.
- SYNTHETIC_INFERENCES = 2 / 2
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 4자리 / 지금의 큰 흐름에 겁재
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [A 같은 질문·다른 원국] C · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MONEY_INFLOW)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.
- SYNTHETIC_INFERENCES = 2 / 2
- PROPOSITIONS:
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 지킬 바탕은 있지만 지금은 몫을 나눠 갖는 흐름이 겹쳐, 버는 것과 남기는 것을 나눠 보셔야 합니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 4자리 / 원국 통근 튼튼
    - [학문 내 다중사실 종합] (MYUNGRI) 반합으로 흐름이 맞물려 열리는 편입니다.
        ← 이 시기 흐름 → 원국 월주 반합 / 원국 바탕(CAREER)
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_AGAINST(경합) · CAREER:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [A 같은 질문·다른 원국] D · 돈

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MONEY_INFLOW)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/ADJACENT) — 들어온 것을 지키는 구조는 크게 새지 않습니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/GENERAL) — 천간충·반합·천간합으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 천간충 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = CONDITIONAL_FOR)
- 결론: 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다. 다만 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 천기 화록 / 복덕(대궁)에 천량 화권 / 재백 무주성 · 대궁 복덕의 천기·천량을 빌려 봄
    - [학문 내 다중사실 종합] (MYUNGRI) 들어온 것을 지키는 구조는 크게 새지 않습니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 2자리 / 원국 통근 튼튼
    - [학문 내 다중사실 종합] (ZIWEI) 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄 / 부처(대궁)에 태음 화기
- CONTRADICTION_RESOLUTIONS = DIFFERENT_DOMAIN: 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = MONEY_INFLOW:CONDITIONAL_FOR · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [B 같은 원국·다른 축] A · 버는 쪽

**QUESTION** = 올해 돈을 벌 수 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MONEY_INFLOW)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_INFLOW = AGAINST)
- 결론: 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 내 다중사실 종합] (MYUNGRI) 들어온 것을 지키는 구조는 크게 새지 않습니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 2자리 / 원국 통근 튼튼
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다. / INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = MONEY_INFLOW:AGAINST · MONEY_RETENTION:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR(경합)
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=AGAINST · QIMEN=미적용

---

## [B 같은 원국·다른 축] A · 남는 쪽

**QUESTION** = 저축이 남을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 들어온 것을 지키는 구조는 크게 새지 않습니다.
- 결정 요인(구조): 원국 바탕(MONEY_RETENTION)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = CONDITIONAL_FOR)
- 결론: 들어온 것을 지키는 구조는 크게 새지 않습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 들어온 것을 지키는 구조는 크게 새지 않습니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 2자리 / 원국 통근 튼튼
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다. / INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합)
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [B 같은 원국·다른 축] A · 자리

**QUESTION** = 이직해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MOVEMENT)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (MOVEMENT = CONDITIONAL_FOR)
- 결론: 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
- SYNTHETIC_INFERENCES = 4 / 5
- PROPOSITIONS:
    - [단일사실 재진술(추론 아님)] (ZIWEI) 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 부처(삼합궁)에 태양 화록
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [학문 내 다중사실 종합] (MYUNGRI) 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 이 시기 흐름 → 원국 시주 반합
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. 그래서 명리 쪽을 따릅니다.
- WHY_OTHER_DID_NOT_DOMINATE = 자미두수가 본 관록(본궁)에 태음 화과도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다.
- AXIS_VERDICTS = MOVEMENT:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST(경합) · OUTCOME:FOR · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 같은 원국·다른 축] A · 관계

**QUESTION** = 결혼해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 천간충·충·형·천간합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
- 결정 요인(구조): 올해 흐름 → 원국 일주 천간충
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = FOR_BUT_LATER** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = FOR_BUT_LATER, 경합 해소됨)
- 결론: 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- SYNTHETIC_INFERENCES = 3 / 4
- PROPOSITIONS:
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 방향은 맞습니다. 다만 지금 시점은 아닙니다.
        ← 부처(본궁)에 태양 화록 / 관록(대궁)에 태음 화과
    - [단일사실 재진술(추론 아님)] (ZIWEI) 형제은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 형제 무주성 · 대궁 노복의 염정·탐랑을 빌려 봄
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = DIFFERENT_TIMESCALE: 가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리는 지금 시점의 신호라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.
- AXIS_VERDICTS = RELATION_STABILITY:FOR_BUT_LATER(경합) · CONFLICT:CONDITIONAL_FOR · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=AGAINST · ZIWEI=CONDITIONAL_FOR · QIMEN=FOR

---

## [B 같은 원국·다른 축] A · 몸

**QUESTION** = 요즘 몸이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = HEALTH_ENERGY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 MEDIUM · 직접성 GENERAL · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 결정 요인(구조): 올해 흐름 → 원국 년주 자형
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 몸·기운에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (MYUNGRI) 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [학문 내 다중사실 종합] (MYUNGRI) 천간충·충·형·천간합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_AGAINST · RELATION_STABILITY:AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [C 질문 의도] A · 서술형

**QUESTION** = 제 타고난 성격이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = GENERAL
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 결정 요인(구조): 올해 흐름 → 원국 년주 자형
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 구조는 이렇게 봅니다. 전반: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다. 자리·직업: 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 같이 사는 난도: 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 올해 흐름 → 원국 년주 자형 / 이 시기 흐름 → 원국 년주 파
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 방향은 맞습니다. 다만 지금 시점은 아닙니다.
        ← 부처(본궁)에 태양 화록 / 관록(대궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다. / DIFFERENT_TIMESCALE: 가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 명리는 지금 시점의 신호라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합)
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [C 질문 의도] A · 원인형

**QUESTION** = 왜 자꾸 부딪힐까요?
**QUESTION_INTENT** = CAUSE_WHY · **ASKED_AXIS** = GENERAL
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 결정 요인(구조): 올해 흐름 → 원국 년주 자형
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 부딪히는 지점은 이렇게 봅니다. 전반: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다. 자리·직업: 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 같이 사는 난도: 방향은 맞습니다. 다만 지금 시점은 아닙니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 올해 흐름 → 원국 년주 자형 / 이 시기 흐름 → 원국 년주 파
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 방향은 맞습니다. 다만 지금 시점은 아닙니다.
        ← 부처(본궁)에 태양 화록 / 관록(대궁)에 태음 화과
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다. / DIFFERENT_TIMESCALE: 가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 명리는 지금 시점의 신호라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합)
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [C 질문 의도] A · 결정형

**QUESTION** = 사업을 더 키워도 될까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = FOR (WOLWOON/ADJACENT) — 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 다만 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 6 / 6
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (MYUNGRI) 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 이 시기 흐름 → 원국 시주 반합
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. 그래서 명리 쪽을 따릅니다. / OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 자미두수가 본 관록(본궁)에 태음 화과도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = OPPORTUNITY:CONDITIONAL_AGAINST · OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_AGAINST(경합) · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [C 질문 의도] A · 시기형

**QUESTION** = 언제 움직이는 게 나을까요?
**QUESTION_INTENT** = TIMING · **ASKED_AXIS** = GENERAL
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 결정 요인(구조): 올해 흐름 → 원국 년주 자형
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- SYNTHETIC_INFERENCES = 4 / 4
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 올해 흐름 → 원국 년주 자형 / 이 시기 흐름 → 원국 년주 파
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 방향은 맞습니다. 다만 지금 시점은 아닙니다.
        ← 부처(본궁)에 태양 화록 / 관록(대궁)에 태음 화과
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다. / DIFFERENT_TIMESCALE: 가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. / 명리는 지금 시점의 신호라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR(경합) · RELATION_STABILITY:FOR_BUT_LATER(경합) · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [C 질문 의도] C · 원인형

**QUESTION** = 왜 자꾸 부딪힐까요?
**QUESTION_INTENT** = CAUSE_WHY · **ASKED_AXIS** = GENERAL
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 반합·천간합으로 흐름이 맞물려 열리는 편입니다.
- 결정 요인(구조): 지금의 큰 흐름 → 원국 년주 반합
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_FOR)
- 결론: 부딪히는 지점은 이렇게 봅니다. 전반: 반합·천간합으로 흐름이 맞물려 열리는 편입니다. 자리·직업: 반합으로 흐름이 맞물려 열리는 편입니다. 같이 사는 난도: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 반합·천간합으로 흐름이 맞물려 열리는 편입니다.
        ← 지금의 큰 흐름 → 원국 년주 반합 / 올해 흐름 → 원국 년주 천간합
    - [학문 내 다중사실 종합] (MYUNGRI) 반합으로 흐름이 맞물려 열리는 편입니다.
        ← 이 시기 흐름 → 원국 월주 반합 / 원국 바탕(CAREER)
    - [학문 내 다중사실 종합] (MYUNGRI) 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 올해 흐름 → 원국 일주 자형 / 이 시기 흐름 → 원국 일주 파
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = GENERAL:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [D 반사실 · 시주] A · 시주 14시

**QUESTION** = 사업 방향이 맞을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = FOR (WOLWOON/ADJACENT) — 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (OPPORTUNITY = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 다만 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 5 / 5
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (MYUNGRI) 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 이 시기 흐름 → 원국 시주 반합
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. 그래서 명리 쪽을 따릅니다. / OPPORTUNITY_VS_OUTCOME: 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 자미두수가 본 관록(본궁)에 태음 화과도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = OPPORTUNITY:CONDITIONAL_AGAINST · OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_AGAINST(경합) · GENERAL:CONDITIONAL_AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [D 반사실 · 시주] A″ · 시주 02시

**QUESTION** = 사업 방향이 맞을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A″(시주만 다름) · 1990-8-15 2시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = CONDITIONAL_FOR (SEWOON/ADJACENT) — 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (DAEWOON/ADJACENT) — 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 시주 해 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.
- SYNTHETIC_INFERENCES = 2 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 올해 흐름 → 원국 시주 천간합 / 원국 바탕(OUTCOME) / 올해 흐름 → 원국 시주 해
    - [단일사실 재진술(추론 아님)] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 무곡 화권
    - [학문 내 다중사실 종합] (MYUNGRI) 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = OUTCOME:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [D 반사실 · 시주] A′ · 시주 미상

**QUESTION** = 사업 방향이 맞을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = A′(시주미상) · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 REDUCED)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 세운, 월운, 원국×운 관계(종류·위치)
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

### REASONING
- **FINAL_VERDICT = INSUFFICIENT_EVIDENCE** (확신 LOW)
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 이 질문에 대해서는 방향을 정할 만한 신호가 명식에서 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다.
- SYNTHETIC_INFERENCES = 0 / 0
- PROPOSITIONS:
    - (없음 — 방향을 정하지 않은 판정)
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = (없음)
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=미적용 · QIMEN=미적용

---

## [D 반사실 · 시점] A · 길문 시점

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (DECISION = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- SYNTHETIC_INFERENCES = 6 / 6
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 이 시기 흐름 → 원국 시주 반합
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다.
- AXIS_VERDICTS = OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합) · DECISION:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [D 반사실 · 시점] A · 흉문 시점

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (DECISION = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- SYNTHETIC_INFERENCES = 6 / 6
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 원국 바탕(OUTCOME)
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 당장의 시점은 아닙니다.
        ← 값사 驚門 (乾궁) / 값부 天柱
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다.
- AXIS_VERDICTS = OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합) · DECISION:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:AGAINST_FOR_NOW
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 당장의 시점은 아닙니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=AGAINST_FOR_NOW

---

## [D 반사실 · 시점] A · 구 결번 구간(芒種)

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1781492400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (DECISION = CONDITIONAL_AGAINST)
- 결론: 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- SYNTHETIC_INFERENCES = 6 / 6
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 원국에 자리·책임 자리가 3곳 있어 바탕이 받쳐 줍니다. 반합·육합으로 흐름도 맞물려 열리는 자리입니다.
        ← 지금의 큰 흐름 → 원국 시주 반합 / 올해 흐름 → 원국 시주 육합 / 이 시기 흐름 → 원국 시주 육합
    - [학문 내 다중사실 종합] (ZIWEI) 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(본궁)에 천동 화기
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.
        ← 관록(본궁)에 태음 화과 / 부처(대궁)에 태양 화록 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 杜門 (震궁) / 값부 天輔
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다. 그래서 자미두수 쪽을 따릅니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 원국 바탕(CAREER)도 사실이지만, 한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다.
- AXIS_VERDICTS = OUTCOME:FOR · MONEY_INFLOW:AGAINST · CAREER:CONDITIONAL_FOR(경합) · DECISION:CONDITIONAL_AGAINST · GENERAL:CONDITIONAL_AGAINST · TIMING:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=CONDITIONAL_FOR

---

## [E 물어본 축] A · 건강

**QUESTION** = 요즘 몸이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = HEALTH_ENERGY
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 MEDIUM · 직접성 GENERAL · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 결정 요인(구조): 올해 흐름 → 원국 년주 자형
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 몸·기운에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록(삼합궁)에 태음 화과 / 재백(삼합궁)에 천동 화기
    - [학문 내 다중사실 종합] (MYUNGRI) 해으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [학문 내 다중사실 종합] (MYUNGRI) 천간충·충·형·천간합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
        ← 지금의 큰 흐름 → 원국 일주 천간합 / 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_AGAINST · RELATION_STABILITY:AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [E 물어본 축] B · 건강

**QUESTION** = 요즘 몸이 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = HEALTH_ENERGY
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 GENERAL · 자료 EXACT)
- 결론: 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
- 결정 요인(구조): 지금의 큰 흐름 → 원국 월주 해
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - CAREER = CONDITIONAL_FOR (SEWOON/GENERAL) — 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
    - RELATION_STABILITY = CONDITIONAL_FOR (WOLWOON/GENERAL) — 천간합으로 흐름이 맞물려 열리는 편입니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 월주 해 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (HEALTH_ENERGY = CONDITIONAL_FOR)
- 결론: 구조는 이렇게 봅니다. 자리·직업: 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다. 같이 사는 난도: 천간합으로 흐름이 맞물려 열리는 편입니다. 몸·기운: 질액에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
- SYNTHETIC_INFERENCES = 2 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 천간합으로 흐름이 맞물려 열리는 편입니다.
        ← 이 시기 흐름 → 원국 일주 천간합
    - [학문 내 다중사실 종합] (ZIWEI) 질액에 화권이 들어와 있어, 저절로 굴러오지는 않지만 직접 미시면 열리는 쪽입니다.
        ← 질액(본궁)에 천동 화권 / 형제(삼합궁)에 천기 화과 / 형제(삼합궁)에 거문 화기
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR · HEALTH_ENERGY:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [E 물어본 축] C · 이동

**QUESTION** = 이사해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MOVEMENT)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 이동에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 반합으로 흐름이 맞물려 열리는 편입니다.
        ← 이 시기 흐름 → 원국 월주 반합 / 원국 바탕(CAREER)
    - [학문 내 다중사실 종합] (MYUNGRI) 천간충·반합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
        ← 이 시기 흐름 → 원국 시주 반합 / 원국 바탕(OUTCOME) / 이 시기 흐름 → 원국 시주 천간충
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = CAREER:CONDITIONAL_FOR · OUTCOME:AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [E 물어본 축] D · 이동

**QUESTION** = 이사해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MOVEMENT)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - MOVEMENT = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/ADJACENT) — 천간충·반합·천간합으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.
    - OUTCOME = FOR (SEWOON/GENERAL) — 원국에 자리·책임 자리가 2곳 있어 바탕이 받쳐 줍니다. 반합으로 흐름도 맞물려 열리는 자리입니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 천간충 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (MOVEMENT = CONDITIONAL_AGAINST)
- 결론: 천이 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
- SYNTHETIC_INFERENCES = 4 / 4
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (ZIWEI) 천이 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 복덕(삼합궁)에 천기 화록 / 복덕(삼합궁)에 천량 화권 / 천이 무주성 · 대궁 명궁의 태양·거문을 빌려 봄
    - [학문 내 다중사실 종합] (MYUNGRI) 천간충·반합·천간합으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.
        ← 지금의 큰 흐름 → 원국 월주 반합 / 올해 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER)
    - [학문 내 다중사실 종합] (MYUNGRI) 원국에 자리·책임 자리가 2곳 있어 바탕이 받쳐 줍니다. 반합으로 흐름도 맞물려 열리는 자리입니다.
        ← 올해 흐름 → 원국 시주 반합 / 원국 바탕(OUTCOME)
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = MOVEMENT:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_AGAINST · OUTCOME:FOR · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=CONDITIONAL_AGAINST · QIMEN=FOR

---

## [F 시점형] B · 지금 창업

**QUESTION** = 지금 창업해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 파으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 올해 흐름 → 원국 시주 천간합 / 이 시기 흐름 → 원국 시주 천간합 / 원국 바탕(OUTCOME)
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [학문 내 다중사실 종합] (QIMEN) 지금 당장의 시점은 아닙니다.
        ← 값사 驚門 (乾궁) / 값부 天柱
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · TIMING:AGAINST_FOR_NOW
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=AGAINST_FOR_NOW

---

## [F 시점형] C · 지금 투자

**QUESTION** = 지금 투자해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = MONEY_INFLOW
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(MONEY_INFLOW)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 지킬 바탕은 있지만 지금은 몫을 나눠 갖는 흐름이 겹쳐, 버는 것과 남기는 것을 나눠 보셔야 합니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 4자리 / 원국 통근 튼튼
    - [학문 내 다중사실 종합] (MYUNGRI) 반합으로 흐름이 맞물려 열리는 편입니다.
        ← 이 시기 흐름 → 원국 월주 반합 / 원국 바탕(CAREER)
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_AGAINST(경합) · CAREER:CONDITIONAL_FOR · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [F 시점형] D · 지금 계약

**QUESTION** = 지금 계약해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = DECISION
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1787634000

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OUTCOME = CONDITIONAL_AGAINST (WOLWOON/ADJACENT) — 충·형·반합으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (WOLWOON/GENERAL) — 천간충·형·파·반합·천간합·육합으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.
- COUNTER_EVIDENCE:
    - 이 시기 흐름 → 원국 시주 충 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 시주 형 — 말년·결과 자리가 이 흐름에 직접 흔들립니다.
    - 지금의 큰 흐름 → 원국 월주 천간충 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 월주 형 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 결정에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 4 / 4
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 충·형·반합으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.
        ← 올해 흐름 → 원국 시주 반합 / 원국 바탕(OUTCOME) / 이 시기 흐름 → 원국 시주 충
    - [학문 내 다중사실 종합] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 천기 화록 / 복덕(대궁)에 천량 화권 / 재백 무주성 · 대궁 복덕의 천기·천량을 빌려 봄
    - [학문 내 다중사실 종합] (ZIWEI) 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄 / 부처(대궁)에 태음 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 당장의 시점은 아닙니다.
        ← 값사 驚門 (乾궁) / 값부 天柱
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = OUTCOME:CONDITIONAL_AGAINST · MONEY_INFLOW:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST · TIMING:AGAINST_FOR_NOW
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=AGAINST_FOR_NOW

---

## [G 정직한 저하] A′ · 시주미상 · 결혼

**QUESTION** = 결혼해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY
**INPUT** = A′(시주미상) · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **AGAINST** (근거강도 MODERATE · 확신 LOW · 직접성 DIRECT · 자료 REDUCED)
- 결론: 천간충·충·형으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
- 결정 요인(구조): 올해 흐름 → 원국 일주 천간충
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - RELATION_STABILITY = AGAINST (WOLWOON/DIRECT) — 천간충·충·형으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
    - CONFLICT = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - INFLUENCE = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 일주 천간충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 일주 충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 일주 형 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = AGAINST)
- 결론: 천간충·충·형으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
- SYNTHETIC_INFERENCES = 2 / 2
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 천간충·충·형으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
        ← 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충 / 이 시기 흐름 → 원국 일주 형
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=AGAINST · ZIWEI=미적용 · QIMEN=FOR

---

## [G 정직한 저하] A′ · 시주미상 · 시기

**QUESTION** = 언제가 좋을까요?
**QUESTION_INTENT** = TIMING · **ASKED_AXIS** = GENERAL
**INPUT** = A′(시주미상) · 1990-8-15 시주 미상 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 LOW · 직접성 DIRECT · 자료 REDUCED)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 결정 요인(구조): 올해 흐름 → 원국 년주 자형
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - GENERAL = CONDITIONAL_AGAINST (WOLWOON/DIRECT) — 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
    - CAREER = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - RELATION_STABILITY = AGAINST (WOLWOON/GENERAL) — 천간충·충·형으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- COUNTER_EVIDENCE:
    - 올해 흐름 → 원국 년주 자형 — 뿌리·집안 자리가 이 흐름에 직접 흔들립니다.
    - 이 시기 흐름 → 원국 년주 파 — 뿌리·집안 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 일주 천간충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.
    - 올해 흐름 → 원국 일주 충 — 배우자·자기 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (GENERAL = CONDITIONAL_AGAINST)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 올해 흐름 → 원국 년주 자형 / 이 시기 흐름 → 원국 년주 파
    - [학문 내 다중사실 종합] (MYUNGRI) 천간충·충·형으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
        ← 올해 흐름 → 원국 일주 천간충 / 올해 흐름 → 원국 일주 충 / 이 시기 흐름 → 원국 일주 형
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = GENERAL:CONDITIONAL_AGAINST · RELATION_STABILITY:AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=미적용 · QIMEN=FOR

---

## [H 사업·재물] B · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 파으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 올해 흐름 → 원국 시주 천간합 / 원국 바탕(OUTCOME) / 지금의 큰 흐름 → 원국 시주 파
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = OUTCOME:CONDITIONAL_FOR · CAREER:CONDITIONAL_FOR · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [H 사업·재물] C · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 DIRECT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(OPPORTUNITY)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 천간충·반합으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.
        ← 이 시기 흐름 → 원국 시주 반합 / 원국 바탕(OUTCOME) / 이 시기 흐름 → 원국 시주 천간충
    - [학문 내 다중사실 종합] (MYUNGRI) 반합으로 흐름이 맞물려 열리는 편입니다.
        ← 이 시기 흐름 → 원국 월주 반합 / 원국 바탕(CAREER)
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = OUTCOME:AGAINST · CAREER:CONDITIONAL_FOR · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=FOR

---

## [H 사업·재물] D · 저축

**QUESTION** = 저축이 남을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 들어온 것을 지키는 구조는 크게 새지 않습니다.
- 결정 요인(구조): 원국 바탕(MONEY_RETENTION)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - MONEY_RETENTION = CONDITIONAL_FOR (NATAL/DIRECT) — 들어온 것을 지키는 구조는 크게 새지 않습니다.
    - MONEY_INFLOW = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - OPPORTUNITY = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - CAREER = CONDITIONAL_AGAINST (SEWOON/GENERAL) — 천간충·반합·천간합으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.
- COUNTER_EVIDENCE:
    - 지금의 큰 흐름 → 원국 월주 천간충 — 사회·직업 자리가 이 흐름에 직접 흔들립니다.

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
- **FINAL_VERDICT = CONDITIONAL_FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = CONDITIONAL_FOR)
- 결론: 들어온 것을 지키는 구조는 크게 새지 않습니다. 다만 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 3 / 3
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 들어온 것을 지키는 구조는 크게 새지 않습니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 2자리 / 원국 통근 튼튼
    - [학문 내 다중사실 종합] (ZIWEI) 재백은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 복덕(대궁)에 천기 화록 / 복덕(대궁)에 천량 화권 / 재백 무주성 · 대궁 복덕의 천기·천량을 빌려 봄
    - [학문 내 다중사실 종합] (ZIWEI) 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.
        ← 관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄 / 부처(대궁)에 태음 화기
- CONTRADICTION_RESOLUTIONS = DIFFERENT_DOMAIN: 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_FOR · MONEY_INFLOW:CONDITIONAL_FOR · CAREER:CONDITIONAL_AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=CONDITIONAL_FOR · QIMEN=미적용

---

## [H 사업·재물] B · 저축

**QUESTION** = 저축이 남을까요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 HIGH · 직접성 DIRECT · 자료 EXACT)
- 결론: 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다.
- 결정 요인(구조): 지금의 큰 흐름에 겁재
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = CONDITIONAL_AGAINST)
- 결론: 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다. 다만 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 2 / 2
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다.
        ← 원국 바탕(MONEY_RETENTION) / 원국 재성 4자리 / 지금의 큰 흐름에 겁재
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
- CONTRADICTION_RESOLUTIONS = DIFFERENT_DOMAIN: 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = MONEY_RETENTION:CONDITIONAL_AGAINST · CAREER:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=CONDITIONAL_AGAINST · QIMEN=미적용

---

## [I 관계] B · 재회

**QUESTION** = 재회 가능성이 있을까요?
**QUESTION_INTENT** = PROBABILITY · **ASKED_AXIS** = GENERAL
**INPUT** = B · 1978-2-3 5시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_FOR** (근거강도 STRONG · 확신 MEDIUM · 직접성 GENERAL · 자료 EXACT)
- 결론: 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
- 결정 요인(구조): 지금의 큰 흐름 → 원국 월주 해
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 1 / 2
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 천간합으로 열리면서 해으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.
        ← 지금의 큰 흐름 → 원국 월주 천간합 / 원국 바탕(CAREER) / 지금의 큰 흐름 → 원국 월주 해
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 천간합으로 흐름이 맞물려 열리는 편입니다.
        ← 이 시기 흐름 → 원국 일주 천간합
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = CAREER:CONDITIONAL_FOR · RELATION_STABILITY:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_FOR · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [I 관계] C · 연애

**QUESTION** = 연애운은 어떤가요?
**QUESTION_INTENT** = DESCRIPTIVE · **ASKED_AXIS** = RELATION_BOND
**INPUT** = C · 2001-11-27 21시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 STRONG · 확신 MEDIUM · 직접성 ADJACENT · 자료 EXACT)
- 결론: 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
- 결정 요인(구조): 올해 흐름 → 원국 일주 자형
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
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
- ANSWERED_ON_ASKED_AXIS = NO — 물어본 축으로 답하지 않음
- 결론: 끌리는 힘에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)
- SYNTHETIC_INFERENCES = 2 / 2
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 자형·파으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.
        ← 올해 흐름 → 원국 일주 자형 / 이 시기 흐름 → 원국 일주 파
    - [학문 내 다중사실 종합] (ZIWEI) 형제에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 전택(삼합궁)에 태양 화권 / 전택(삼합궁)에 문곡 화과 / 형제(본궁)에 문창 화기
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:CONDITIONAL_AGAINST · CONFLICT:AGAINST
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=CONDITIONAL_AGAINST · ZIWEI=INSUFFICIENT_EVIDENCE · QIMEN=미적용

---

## [I 관계] D · 결혼

**QUESTION** = 결혼해도 될까요?
**QUESTION_INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY
**INPUT** = D · 1985-5-9 3시 · 평가시점 epoch 1773104400

### MYUNGRI
- PRIMARY = **INSUFFICIENT_EVIDENCE** (근거강도 NONE · 확신 LOW · 직접성 ADJACENT · 자료 EXACT)
- 결론: 지금 이 부분을 흔드는 흐름은 따로 없습니다.
- 결정 요인(구조): 원국 바탕(CONFLICT)
- MAJOR_FACTS_USED: 원국 십신 배치, 원국 합충형파해, 월령, 통근·투간, 일간 강약(억부), 용신(억부), 대운, 세운, 월운, 원국×운 관계(종류·위치)
- SUBJUDGMENTS:
    - CONFLICT = INSUFFICIENT_EVIDENCE (NATAL/ADJACENT) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
    - INFLUENCE = INSUFFICIENT_EVIDENCE (NATAL/GENERAL) — 지금 이 부분을 흔드는 흐름은 따로 없습니다.
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
- **FINAL_VERDICT = AGAINST** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = AGAINST)
- 결론: 부처에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
- SYNTHETIC_INFERENCES = 2 / 3
- PROPOSITIONS:
    - [단일사실 재진술(추론 아님)] (ZIWEI) 형제은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.
        ← 전택(삼합궁)에 자미 화과
    - [학문 내 다중사실 종합] (ZIWEI) 부처에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다.
        ← 복덕(삼합궁)에 천기 화록 / 복덕(삼합궁)에 천량 화권 / 부처(본궁)에 태음 화기
    - [학문 내 다중사실 종합] (QIMEN) 지금 움직이는 것 자체는 무리가 없습니다.
        ← 값사 開門 (離궁) / 값부 天心
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = CONFLICT:CONDITIONAL_FOR · RELATION_STABILITY:AGAINST · TIMING:FOR
- DOCTRINE_BLOCKERS = MYUNGRI: 일간 강약: 강약 판정 보류(학파 미확정)
- 시기: 지금 움직이는 것 자체는 무리가 없습니다.
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=AGAINST · QIMEN=FOR

---

# 반사실 대조(§41)

## [반사실 대조] 시주만 바뀌면 판단이 움직이는가

- A = A · 시주 14시 → **CONDITIONAL_AGAINST**
- B = A″ · 시주 02시 → **INSUFFICIENT_EVIDENCE**
- DIRECTION_MOVED = YES
- AXES_MOVED = OPPORTUNITY: CONDITIONAL_AGAINST → (없음) · OUTCOME: FOR → CONDITIONAL_FOR · MONEY_INFLOW: AGAINST → CONDITIONAL_FOR · GENERAL: CONDITIONAL_AGAINST → (없음)
- 근거 차이: 자미두수 · 관록(삼합궁)에 태음 화과  ⟷  방향을 정할 만한 신호 없음

---

## [반사실 대조] 시주를 모르면 정직하게 낮아지는가

- A = A · 시주 14시 → **CONDITIONAL_AGAINST**
- B = A′ · 시주 미상 → **INSUFFICIENT_EVIDENCE**
- DIRECTION_MOVED = YES
- AXES_MOVED = OPPORTUNITY: CONDITIONAL_AGAINST → (없음) · OUTCOME: FOR → (없음) · MONEY_INFLOW: AGAINST → (없음) · CAREER: CONDITIONAL_AGAINST → (없음) · GENERAL: CONDITIONAL_AGAINST → (없음)
- 근거 차이: 자미두수 · 관록(삼합궁)에 태음 화과  ⟷  방향을 정할 만한 신호 없음

---

## [반사실 대조] 시점(길문/흉문)이 판단을 바꾸는가

- A = A · 길문 시점 → **CONDITIONAL_AGAINST**
- B = A · 흉문 시점 → **CONDITIONAL_AGAINST**
- DIRECTION_MOVED = NO
- AXES_MOVED = TIMING: FOR → AGAINST_FOR_NOW
- 근거 차이: 자미두수 · 관록(삼합궁)에 태음 화과  ⟷  자미두수 · 관록(삼합궁)에 태음 화과

---

## [반사실 대조] 같은 원국에서 버는 축과 남는 축이 갈리는가

- A = A · 버는 쪽 → **AGAINST**
- B = A · 남는 쪽 → **CONDITIONAL_FOR**
- DIRECTION_MOVED = YES
- AXES_MOVED = 없음
- 근거 차이: 자미두수 · 관록(삼합궁)에 태음 화과  ⟷  명리 · 원국 바탕(MONEY_RETENTION)

---

## [반사실 대조] 같은 질문에서 원국이 다르면 갈리는가

- A = A · 돈 → **AGAINST**
- B = C · 돈 → **INSUFFICIENT_EVIDENCE**
- DIRECTION_MOVED = YES
- AXES_MOVED = MONEY_INFLOW: AGAINST → (없음) · MONEY_RETENTION: CONDITIONAL_FOR → CONDITIONAL_AGAINST
- 근거 차이: 자미두수 · 관록(삼합궁)에 태음 화과  ⟷  방향을 정할 만한 신호 없음

---

# 궁합(§31–§33)

## [궁합] 궁합 · 잘 맞나요(A×B)

**QUESTION** = 둘이 잘 맞나요?
**QUESTION_INTENT** = OUTCOME · **ASKED_AXIS** = RELATION_BOND
**INPUT** = A · 1990-8-15 14시 · 평가시점 epoch 0

### MYUNGRI
- PRIMARY = **CONDITIONAL_AGAINST** (근거강도 MODERATE · 확신 MEDIUM · 직접성 DIRECT · 자료 REDUCED)
- 결론: 기본적인 교감은 무난한 편이에요.
- 결정 요인(구조): 일간 천간충
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
- **FINAL_VERDICT = CONDITIONAL_AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_BOND = CONDITIONAL_AGAINST)
- 결론: 기본적인 교감은 무난한 편이에요. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 2 / 6
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 기본적인 교감은 무난한 편이에요.
        ← 일지 육합/반합 / 일간 천간충
    - [단일사실 재진술(추론 아님)] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
        ← 두 사람 사이 충·형·파·해 다수
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 돈·살림은 서로 굴러가는 편입니다.
        ← 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS)
    - [학문 내 다중사실 종합] (MYUNGRI) 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
        ← 상대→A: INDIRECT_WEALTH / A→상대: SEVEN_KILLINGS
    - [단일사실 재진술(추론 아님)] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다. / BOND_VS_STABILITY: 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:FOR · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
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
- **FINAL_VERDICT = FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (RELATION_STABILITY = FOR)
- 결론: 관계를 끌고 갈 동력이 있습니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 2 / 6
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 기본적인 교감은 무난한 편이에요.
        ← 일지 육합/반합 / 일간 천간충
    - [단일사실 재진술(추론 아님)] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
        ← 두 사람 사이 충·형·파·해 다수
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 돈·살림은 서로 굴러가는 편입니다.
        ← 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS)
    - [학문 내 다중사실 종합] (MYUNGRI) 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
        ← 상대→A: INDIRECT_WEALTH / A→상대: SEVEN_KILLINGS
    - [단일사실 재진술(추론 아님)] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다. / BOND_VS_STABILITY: 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:FOR · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
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
- **FINAL_VERDICT = FOR** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = FOR)
- 결론: 돈·살림은 서로 굴러가는 편입니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 2 / 6
- PROPOSITIONS:
    - [학문 내 다중사실 종합] (MYUNGRI) 기본적인 교감은 무난한 편이에요.
        ← 일지 육합/반합 / 일간 천간충
    - [단일사실 재진술(추론 아님)] (ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
        ← 두 사람 사이 충·형·파·해 다수
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 돈·살림은 서로 굴러가는 편입니다.
        ← 상호 십신에 재성 (INDIRECT_WEALTH/SEVEN_KILLINGS)
    - [학문 내 다중사실 종합] (MYUNGRI) 상대는 상대에게 크게 베풀고 벌이려는 결로 작용합니다.
        ← 상대→A: INDIRECT_WEALTH / A→상대: SEVEN_KILLINGS
    - [단일사실 재진술(추론 아님)] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
- CONTRADICTION_RESOLUTIONS = INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다. / BOND_VS_STABILITY: 끌리는 힘과 같이 사는 난도는 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_BOND:CONDITIONAL_AGAINST · RELATION_STABILITY:FOR · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
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
- **FINAL_VERDICT = FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = FOR)
- 결론: 모아 두는 쪽은 무난합니다. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 3 / 5
- PROPOSITIONS:
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
        ← 두 사람 사이 충·형·파·해 다수
    - [학문 내 다중사실 종합] (ZIWEI) 모아 두는 쪽은 무난합니다.
        ← C 전택궁에 태양 화권 / C 전택궁에 문곡 화과
    - [학문 내 다중사실 종합] (MYUNGRI) 상대는 상대에게 편하게 표현하는 결로 작용합니다.
        ← 상대→A: EATING_GOD / A→상대: INDIRECT_RESOURCE
    - [단일사실 재진술(추론 아님)] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. 그래서 자미두수 쪽을 따릅니다. / INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 일지 충·형·해(배우자 자리)도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:FOR(경합) · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
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
- 결론: 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
- 결정 요인(구조): 일지 충·형·해
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
- **FINAL_VERDICT = AGAINST** (확신 MEDIUM)
- ANSWERED_ON_ASKED_AXIS = YES (CONFLICT = AGAINST)
- 결론: 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요. 다만 돈이 들어오는 것과 남는 것은 다르게 봅니다.
- SYNTHETIC_INFERENCES = 3 / 5
- PROPOSITIONS:
    - [학문 간 충돌 해소] (MYUNGRI+ZIWEI) 관계를 끌고 갈 동력이 있습니다.
        ← A 부처궁에 태양 화록
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
        ← 두 사람 사이 충·형·파·해 다수
    - [학문 내 다중사실 종합] (ZIWEI) 모아 두는 쪽은 무난합니다.
        ← C 전택궁에 태양 화권 / C 전택궁에 문곡 화과
    - [학문 내 다중사실 종합] (MYUNGRI) 상대는 상대에게 편하게 표현하는 결로 작용합니다.
        ← 상대→A: EATING_GOD / A→상대: INDIRECT_RESOURCE
    - [단일사실 재진술(추론 아님)] (ZIWEI) 버는 쪽이 매끄럽지 않습니다.
        ← A 재백궁에 천동 화기
- CONTRADICTION_RESOLUTIONS = DIRECTNESS: 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. 그래서 자미두수 쪽을 따릅니다. / INFLOW_VS_RETENTION: 돈이 들어오는 것과 남는 것은 다르게 봅니다. 서로 다른 축이라 둘 다 사실입니다.
- WHY_OTHER_DID_NOT_DOMINATE = 명리가 본 일지 충·형·해(배우자 자리)도 사실이지만, 한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다. / 질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.
- AXIS_VERDICTS = RELATION_STABILITY:FOR(경합) · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR · MONEY_INFLOW:AGAINST
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
- 결정 요인(구조): 종합 갈등 관리가 중요한 편
- MAJOR_FACTS_USED: 일주 궁합(일간·일지), 교차 합충형파해, 상호 십신, 오행 보완
- SUBJUDGMENTS:
    - RELATION_BOND = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 기본적인 교감은 무난한 편이에요.
    - RELATION_STABILITY = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 배우자 자리에 두드러진 신호는 없습니다.
    - CONFLICT = AGAINST (NATAL/DIRECT) — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
    - MONEY_RETENTION = INSUFFICIENT_EVIDENCE (NATAL/DIRECT) — 돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.
    - INFLUENCE = CONDITIONAL_FOR (NATAL/DIRECT) — 상대는 상대에게 편하게 표현하는 결로 작용합니다.
- COUNTER_EVIDENCE:
    - 두 사람 사이 충·형·파·해 다수 — 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.

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
- **FINAL_VERDICT = FOR** (확신 HIGH)
- ANSWERED_ON_ASKED_AXIS = YES (MONEY_RETENTION = FOR)
- 결론: 모아 두는 쪽은 무난합니다.
- SYNTHETIC_INFERENCES = 1 / 4
- PROPOSITIONS:
    - [단일사실 재진술(추론 아님)] (ZIWEI) 결혼생활의 난도는 높게 봅니다.
        ← D 부처궁에 태음 화기
    - [단일사실 재진술(추론 아님)] (MYUNGRI) 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.
        ← 두 사람 사이 충·형·파·해 다수
    - [단일사실 재진술(추론 아님)] (ZIWEI) 모아 두는 쪽은 무난합니다.
        ← D 전택궁에 자미 화과
    - [학문 내 다중사실 종합] (MYUNGRI) 상대는 상대에게 편하게 표현하는 결로 작용합니다.
        ← 상대→B: EATING_GOD / B→상대: INDIRECT_RESOURCE
- CONTRADICTION_RESOLUTIONS = 없음
- WHY_OTHER_DID_NOT_DOMINATE = 해당 없음
- AXIS_VERDICTS = RELATION_STABILITY:AGAINST · CONFLICT:AGAINST · MONEY_RETENTION:FOR · INFLUENCE:CONDITIONAL_FOR
- DOCTRINE_BLOCKERS = 없음
- 시기: (근거 없음 — 시점 언급 금지)
- 학문별 기여: MYUNGRI=INSUFFICIENT_EVIDENCE · ZIWEI=FOR

---
