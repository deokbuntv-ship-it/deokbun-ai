# DEOKBUNI — V4A REASONING KERNEL QA PACK

> 자동 생성 문서입니다. 손으로 고치지 마세요.
> 생성기: `src/features/divination/__tests__/generateV4aKernelQaPack.test.ts`
> 모든 케이스는 실제 운영 경로(`buildConsultationGrounding`)를 그대로 통과시켜 얻은 결과이고,
> 변형 실험(D/E/F)은 그 경로가 만든 실제 전제를 지우거나 뒤집어 **다시 추론을 돌린** 결과입니다.

## 이 팩이 증명하려는 것

이전 세대는 "결론에 근거가 붙어 있다"까지만 보여 줄 수 있었습니다. 그것은 추론이 아니라 장식일 수 있습니다.
여기서 묻는 것은 하나뿐입니다 — **그 전제를 빼면 결론이 달라지는가?**

| 항목 | 값 |
| --- | --- |
| 시나리오 | 12 |
| 실행된 변형 실험 | 57 |
| MATERIAL (전제가 결론을 직접 움직임) | 47 / 57 |
| REDUNDANT (대체 근거 존재 — 그룹 제거 시 움직임) | 10 / 57 |
| ⚠ INERT (장식적 전제) | 0 (0이어야 함) |
| REAL_SYNTHETIC_INFERENCE | 117 |
| MULTI_FACT_SUMMARY | 2 |
| STATIC_RULE_OUTPUT | 124 |
| UNSUPPORTED_INFERENCE | 0 (0이어야 함) |

- **STATIC_RULE_OUTPUT이 많은 것은 정상이자 의도된 것입니다.** 자미두수·기문둔갑은 이번 스프린트에서
  전제 그래프로 이관하지 않았으므로(§19), 그 두 학문의 출력은 전부 단일 전제 재진술로 분류됩니다.
  이것을 "학문 간 종합"이라고 부르지 않는 것이 이 숫자를 의미 있게 만듭니다.
- **UNSUPPORTED_INFERENCE = 0** 은 근거 없는 주장이 하나도 없다는 뜻입니다.

---

## [재물] A · 유입

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW · **VERDICT** = AGAINST
**결론** = 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.

### A. PREMISE GRAPH
- `mp_1` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · DIRECT
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_2` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_3` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_4` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_5` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_6` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_7` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_8` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_9` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_10` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_11` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_12` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 재물 · DAEWOON · DIRECT
    - 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 재물  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_13` [MYUNGRI] **CONNECTS** 원국 일주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 일주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_14` [MYUNGRI] **CONSTRAINS** 원국 월주 해 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - ← 지금의 큰 흐름 → 원국 월주 해  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 16개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 같이 사는 난도은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: CONNECTS·원국 일주 천간합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 년주↔월주가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/UNFAVORABLE
    - 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·지금의 큰 흐름의 재물
    - 상위 명제로부터: p:zp_26, p:mp_12
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/FAVORABLE
    - 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: CONSTRAINS·원국 월주 해, SUPPORTS·자녀(대궁)에 무곡 화권
    - 상위 명제로부터: p:mp_14, p:zp_28
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/FAVORABLE
    - 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: SUPPORTS·관록(본궁)에 태음 화과, CONSTRAINS·원국 월주 해
    - 상위 명제로부터: p:zp_29, p:mp_14
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·올해 흐름의 재물
    - 상위 명제로부터: p:zp_26, p:mp_16
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/UNFAVORABLE
    - 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, SUPPORTS·자녀(대궁)에 무곡 화권
    - 상위 명제로부터: p:zp_26, p:zp_28

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- DIRECTION_VS_EXECUTION ← 반대 전제: DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: OPPOSES·재백(삼합궁)에 천동 화기
- CROSS_TIMING_SPLIT ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_AXIS_COMPOUND ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `ACTIVATES · 이 시기 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 11
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 9 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE

---

## [재물] A · 보유

**QUESTION** = 저축이 남을까요?
**INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION · **VERDICT** = FOR
**결론** = 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.

### A. PREMISE GRAPH
- `mp_31` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_32` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_33` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_34` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_35` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_36` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_37` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_38` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_39` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_40` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_41` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_42` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 재물 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 재물  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_43` [MYUNGRI] **CONNECTS** 원국 일주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 일주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_44` [MYUNGRI] **CONSTRAINS** 원국 월주 해 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - ← 지금의 큰 흐름 → 원국 월주 해  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 16개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 같이 사는 난도은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: CONNECTS·원국 일주 천간합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 년주↔월주가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/UNFAVORABLE
    - 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·지금의 큰 흐름의 재물
    - 상위 명제로부터: p:zp_57, p:mp_42
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/FAVORABLE
    - 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: CONSTRAINS·원국 월주 해, SUPPORTS·자녀(대궁)에 무곡 화권
    - 상위 명제로부터: p:mp_44, p:zp_56
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/FAVORABLE
    - 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: SUPPORTS·관록(본궁)에 태음 화과, CONSTRAINS·원국 월주 해
    - 상위 명제로부터: p:zp_59, p:mp_44
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·올해 흐름의 재물
    - 상위 명제로부터: p:zp_57, p:mp_46
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/FAVORABLE
    - 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: SUPPORTS·자녀(대궁)에 무곡 화권, OPPOSES·재백(본궁)에 천동 화기
    - 상위 명제로부터: p:zp_56, p:zp_57

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- DIRECTION_VS_EXECUTION ← 반대 전제: DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: OPPOSES·재백(삼합궁)에 천동 화기
- CROSS_TIMING_SPLIT ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_AXIS_COMPOUND ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `ACTIVATES · 이 시기 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 11
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 9 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE

---

## [재물] B · 유입

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.

### A. PREMISE GRAPH
- `mp_61` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · DIRECT
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 4자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_62` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_63` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_64` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_65` [MYUNGRI] **SUPPORTS** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽 자리가 원국에 하나 있다.
    - ← 원국 지원·배움 1자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_66` [MYUNGRI] **CONSTRAINS** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 얻지 못해, 좋은 흐름이 와도 혼자 밀어붙이면 힘에 부친다.
    - ← 원국 실령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_67` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 일부만 있어, 받쳐 주는 자리에서만 오래 간다.
    - ← 원국 통근 PARTLY_ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_68` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_69` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_70` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_PUNISHMENT  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_71` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_DESTRUCTION  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_72` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 활동·표현 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 활동·표현  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_73` [MYUNGRI] **OPPOSES** 지금의 큰 흐름의 겁재 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - ← 지금의 큰 흐름 겁재  · 근거학설: 겁재(ROB_WEALTH) = 같은 몫을 두고 겨루는 십신
- `mp_74` [MYUNGRI] **CONNECTS** 원국 월주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 월주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 14개

### B. DERIVED PROPOSITIONS
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 자리·직업은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 자리·책임, CONNECTS·원국 월주 천간합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 년주↔월주가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **CONVERGENT_SEAT_PRESSURE** (MYUNGRI) · CAUSAL/UNFAVORABLE
    - 원국 월주 해에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - 지지 전제: (없음)
    - 상위 명제로부터: (없음)
- **INFLOW_VS_RETENTION** (MYUNGRI) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
    - 지지 전제: ENABLES·원국 재물, ACTIVATES·이 시기 흐름의 재물
    - 상위 명제로부터: d:CONTESTED_SHARE:MONEY_RETENTION:mp_61+mp_73+mp_78
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료 쪽에 자리가 겹쳐 무게가 실려 있고, 지원·배움 쪽은 얇거나 비어 있다. 잘 쓰는 자리와 빌려 써야 하는 자리가 뚜렷하게 갈리는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료
    - 상위 명제로부터: (없음)
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/UNFAVORABLE
    - 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 잡았을 때 남는 쪽은 막힙니다, 기회가 오는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: ACTIVATES·지금의 큰 흐름의 활동·표현
    - 상위 명제로부터: p:mp_72, d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_76+mp_81
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 서로 미치는 영향은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: OPPOSES·지금의 큰 흐름의 겁재, ACTIVATES·올해 흐름의 경쟁·동료
    - 상위 명제로부터: p:mp_73, p:mp_77
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 같이 사는 난도은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: STABILIZES·일간의 뿌리, CONNECTS·원국 일주 천간합
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY:mp_67+mp_68, p:mp_83
- **CROSS_REINFORCEMENT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 남는 쪽에 대해 서로 다른 학문이 각각의 근거로 같은 자리를 가리킵니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
    - 지지 전제: ENABLES·원국 재물, CONSTRAINS·형제(삼합궁)에 거문 화기
    - 상위 명제로부터: d:CONTESTED_SHARE:MONEY_RETENTION:mp_61+mp_73+mp_78, p:zp_86

### C. COUNTER-PREMISES
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 월주 해
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 년주↔일주
- CONVERGENT_SEAT_PRESSURE ← 반대 전제: CONSTRAINS·원국 월주 해, CONSTRAINS·원국 월주 해
- STRUCTURAL_PROFILE ← 반대 전제: SUPPORTS·원국 지원·배움
- CROSS_AXIS_COMPOUND ← 반대 전제: CONSTRAINS·원국 시주 파, CONSTRAINS·원국 시주 파
- CROSS_TIMING_SPLIT ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리)
- CROSS_REINFORCEMENT ← 반대 전제: OPPOSES·지금의 큰 흐름의 겁재, OPPOSES·올해 흐름의 겁재, SUPPORTS·자녀(대궁)에 태음 화록

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: CONTESTED_SHARE:MONEY_RETENTION, INFLOW_VS_RETENTION:MONEY_INFLOW, STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 자리·책임`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `STABILIZES · 일간의 뿌리`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY / 바뀜·생김: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `CONSTRAINS · 원국 월주 해`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: CONVERGENT_SEAT_PRESSURE:CAREER / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(1개: 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 12
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 9 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - CONVERGENT_SEAT_PRESSURE → REAL_SYNTHETIC_INFERENCE
    - INFLOW_VS_RETENTION → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_REINFORCEMENT → REAL_SYNTHETIC_INFERENCE

---

## [사업·기회] A · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

### A. PREMISE GRAPH
- `mp_89` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_90` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_91` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · DIRECT
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_92` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_93` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_94` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_95` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_96` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_97` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_98` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_99` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_100` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 재물 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 재물  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_101` [MYUNGRI] **CONNECTS** 원국 일주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 일주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_102` [MYUNGRI] **CONSTRAINS** 원국 월주 해 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - ← 지금의 큰 흐름 → 원국 월주 해  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 20개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 같이 사는 난도은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: CONNECTS·원국 일주 천간합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/UNFAVORABLE
    - 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·지금의 큰 흐름의 재물
    - 상위 명제로부터: p:zp_118, p:mp_100
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/FAVORABLE
    - 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: SUPPORTS·관록(본궁)에 태음 화과, CONSTRAINS·원국 월주 해
    - 상위 명제로부터: p:zp_116, p:mp_102
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: CONNECTS·원국 시주 반합, CONSTRAINS·재백(삼합궁)에 천동 화기, CONNECTS·원국 시주 육합, CONNECTS·원국 시주 반합
    - 상위 명제로부터: p:mp_103, p:zp_114, p:mp_108, p:mp_112
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·올해 흐름의 재물
    - 상위 명제로부터: p:zp_118, p:mp_104
- **CROSS_REINFORCEMENT** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 전반에 대해 서로 다른 학문이 각각의 근거로 같은 자리를 가리킵니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONSTRAINS·재백(삼합궁)에 천동 화기
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:GENERAL:mp_94+mp_95+mp_97+mp_98+mp_99, p:zp_120

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- DIRECTION_VS_EXECUTION ← 반대 전제: DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: OPPOSES·재백(삼합궁)에 천동 화기
- CROSS_AXIS_COMPOUND ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_TIMING_SPLIT ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_REINFORCEMENT ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주, SUPPORTS·관록(삼합궁)에 태음 화과

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `ACTIVATES · 이 시기 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 11
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 11 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_REINFORCEMENT → REAL_SYNTHETIC_INFERENCE

---

## [사업·기회] C · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY · **VERDICT** = FOR
**결론** = 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 열립니다, 잡았을 때 남는 쪽은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.

### A. PREMISE GRAPH
- `mp_123` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 4자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_124` [MYUNGRI] **SUPPORTS** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽 자리가 원국에 하나 있다.
    - ← 원국 자리·책임 1자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_125` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · DIRECT
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_126` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_127` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_128` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_129` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_130` [MYUNGRI] **DESTABILIZES** 원국 년주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔시주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_131` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_132` [MYUNGRI] **DESTABILIZES** 원국 년주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔시주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_133` [MYUNGRI] **DESTABILIZES** 원국 월주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 월주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 월주↔시주 BRANCH_SELF_PUNISHMENT  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_134` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 활동·표현 · DAEWOON · DIRECT
    - 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 활동·표현  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_135` [MYUNGRI] **CONNECTS** 원국 년주 반합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 년주 반합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_136` [MYUNGRI] **ACTIVATES** 올해 흐름의 활동·표현 · SEWOON · DIRECT
    - 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 올해 흐름 활동·표현  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- … 외 14개

### B. DERIVED PROPOSITIONS
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 시주 천간충가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **INFLOW_VS_RETENTION** (MYUNGRI) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
    - 지지 전제: ENABLES·원국 재물
    - 상위 명제로부터: d:CONTESTED_SHARE:MONEY_RETENTION:mp_123+mp_140
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 활동·표현, 경쟁·동료, 지원·배움 쪽에 자리가 겹쳐 무게가 실려 있고, 자리·책임 쪽은 얇거나 비어 있다. 잘 쓰는 자리와 빌려 써야 하는 자리가 뚜렷하게 갈리는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/FAVORABLE
    - 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 열립니다, 잡았을 때 남는 쪽은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: ACTIVATES·지금의 큰 흐름의 활동·표현, ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, ACTIVATES·올해 흐름의 활동·표현
    - 상위 명제로부터: p:mp_134, d:PRESSURE_AGAINST_CAPACITY:OUTCOME:mp_128+mp_129+mp_141, p:mp_136
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 전반은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONNECTS·원국 년주 천간합
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:GENERAL:mp_128+mp_129+mp_130+mp_131+mp_132+mp_133, p:mp_137
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 자리·책임, ENABLES·원국 재물, CONNECTS·원국 월주 반합
    - 상위 명제로부터: p:mp_139, d:CONTESTED_SHARE:MONEY_RETENTION:mp_123+mp_140, p:mp_142

### C. COUNTER-PREMISES
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 시주 천간충
- STRUCTURAL_PROFILE ← 반대 전제: SUPPORTS·원국 자리·책임
- CROSS_AXIS_COMPOUND ← 반대 전제: DESTABILIZES·원국 시주 천간충
- CROSS_TIMING_SPLIT ← 반대 전제: DESTABILIZES·원국 년주↔시주, DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔시주, DESTABILIZES·원국 월주↔시주
- CROSS_AXIS_COMPOUND ← 반대 전제: OPPOSES·이 시기 흐름의 겁재

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: CONTESTED_SHARE:MONEY_RETENTION, INFLOW_VS_RETENTION:MONEY_INFLOW, STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 5개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:OUTCOME
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 7
- MULTI_FACT_SUMMARY = 1
- STATIC_RULE_OUTPUT = 15 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - INFLOW_VS_RETENTION → MULTI_FACT_SUMMARY
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE

---

## [자리·이동] A · 이직

**QUESTION** = 이직해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT · **VERDICT** = FOR
**결론** = 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다.

### A. PREMISE GRAPH
- `mp_151` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_152` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_153` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_154` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_155` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_156` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_157` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_158` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_159` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_160` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_161` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_162` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 재물 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 재물  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_163` [MYUNGRI] **CONNECTS** 원국 일주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 일주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_164` [MYUNGRI] **CONSTRAINS** 원국 월주 해 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - ← 지금의 큰 흐름 → 원국 월주 해  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 17개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 같이 사는 난도은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: CONNECTS·원국 일주 천간합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/FAVORABLE
    - 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: SUPPORTS·관록(본궁)에 태음 화과, CONSTRAINS·원국 월주 해
    - 상위 명제로부터: p:zp_177, p:mp_164
- **CROSS_REINFORCEMENT** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 전반에 대해 서로 다른 학문이 각각의 근거로 같은 자리를 가리킵니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONSTRAINS·재백(삼합궁)에 천동 화기
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:GENERAL:mp_156+mp_157+mp_159+mp_160+mp_161, p:zp_179

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- DIRECTION_VS_EXECUTION ← 반대 전제: DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: OPPOSES·재백(삼합궁)에 천동 화기
- CROSS_REINFORCEMENT ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주, SUPPORTS·관록(삼합궁)에 태음 화과

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `ACTIVATES · 이 시기 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 8
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 10 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_REINFORCEMENT → REAL_SYNTHETIC_INFERENCE

---

## [자리·이동] D · 이사

**QUESTION** = 이사해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 천이 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.

### A. PREMISE GRAPH
- `mp_182` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_183` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_184` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_185` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 4자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_186` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_187` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_188` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_189` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_190` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_191` [MYUNGRI] **DESTABILIZES** 원국 월주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 월주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 월주↔일주 BRANCH_PUNISHMENT  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_192` [MYUNGRI] **DESTABILIZES** 원국 월주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 월주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 월주↔일주 BRANCH_DESTRUCTION  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_193` [MYUNGRI] **DESTABILIZES** 원국 월주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 월주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 월주↔시주 BRANCH_PUNISHMENT  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_194` [MYUNGRI] **DESTABILIZES** 원국 월주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 월주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 월주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_195` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- … 외 18개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 올해 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·올해 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반, CONNECTS·원국 년주 반합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 년주↔월주가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 관록 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: CONSTRAINS·부처(대궁)에 태음 화기, ACTIVATES·지금의 큰 흐름의 자리·책임, CONNECTS·원국 월주 반합
    - 상위 명제로부터: p:zp_210, p:mp_197, p:mp_200
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 자리·직업은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONNECTS·원국 월주 천간합, CONSTRAINS·부처(대궁)에 태음 화기
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:CAREER:mp_187+mp_188+mp_198, p:mp_202, p:zp_210

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 해, DESTABILIZES·원국 년주 천간충
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리)
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 월주↔일주, DESTABILIZES·원국 월주↔일주, DESTABILIZES·원국 월주↔시주, DESTABILIZES·원국 월주↔시주, DESTABILIZES·원국 일주↔시주, DESTABILIZES·원국 일주↔시주, DESTABILIZES·원국 년주 천간충
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: SUPPORTS·관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄
- CROSS_TIMING_SPLIT ← 반대 전제: DESTABILIZES·원국 월주 천간충, SUPPORTS·관록 무주성 · 대궁 부처의 천동·태음을 빌려 봄

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `ACTIVATES · 올해 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:CAREER, PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 9
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 9 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE

---

## [관계] A · 결혼

**QUESTION** = 결혼해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY · **VERDICT** = FOR_BUT_LATER
**결론** = 같이 사는 난도은 큰 흐름에서 방향이 열려 있는데 가까운 시기가 같은 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.

### A. PREMISE GRAPH
- `mp_214` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_215` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_216` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_217` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_218` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_219` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_220` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_221` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · DIRECT
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_222` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_223` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_224` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_225` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 재물 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 재물  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_226` [MYUNGRI] **CONNECTS** 원국 일주 천간합 · DAEWOON · DIRECT
    - 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 일주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_227` [MYUNGRI] **CONSTRAINS** 원국 월주 해 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - ← 지금의 큰 흐름 → 원국 월주 해  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 16개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(TIMING)
    - 같이 사는 난도은 큰 흐름에서 방향이 열려 있는데 가까운 시기가 같은 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
    - 지지 전제: SUPPORTS·부처(본궁)에 태양 화록, CONNECTS·원국 일주 천간합
    - 상위 명제로부터: p:zp_239, d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_226+mp_230+mp_232+mp_236
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, SUPPORTS·부처(본궁)에 태양 화록
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY:mp_219+mp_220+mp_221+mp_230+mp_232+mp_236, p:zp_239
- **CROSS_REINFORCEMENT** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 전반에 대해 서로 다른 학문이 각각의 근거로 같은 자리를 가리킵니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONSTRAINS·재백(삼합궁)에 천동 화기
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:GENERAL:mp_219+mp_220+mp_222+mp_223+mp_224, p:zp_240

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- CROSS_TIMING_SPLIT ← 반대 전제: DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- CROSS_REINFORCEMENT ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주, SUPPORTS·관록(삼합궁)에 태음 화과

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `ACTIVATES · 이 시기 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 9
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 10 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_REINFORCEMENT → REAL_SYNTHETIC_INFERENCE

---

## [관계] B · 재회

**QUESTION** = 재회 가능성이 있을까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = GENERAL · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 원국 년주↔월주가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.

### A. PREMISE GRAPH
- `mp_244` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 4자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_245` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_246` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_247` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_248` [MYUNGRI] **SUPPORTS** 원국 지원·배움 · NATAL · DIRECT
    - 지원·배움 쪽 자리가 원국에 하나 있다.
    - ← 원국 지원·배움 1자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_249` [MYUNGRI] **CONSTRAINS** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 얻지 못해, 좋은 흐름이 와도 혼자 밀어붙이면 힘에 부친다.
    - ← 원국 실령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_250` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 일부만 있어, 받쳐 주는 자리에서만 오래 간다.
    - ← 원국 통근 PARTLY_ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_251` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_252` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_253` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_PUNISHMENT  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_254` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_DESTRUCTION  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_255` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 활동·표현 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 활동·표현  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_256` [MYUNGRI] **OPPOSES** 지금의 큰 흐름의 겁재 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 같은 몫을 두고 겨루는 기운이 들어온다.
    - ← 지금의 큰 흐름 겁재  · 근거학설: 겁재(ROB_WEALTH) = 같은 몫을 두고 겨루는 십신
- `mp_257` [MYUNGRI] **CONNECTS** 원국 월주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 월주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 13개

### B. DERIVED PROPOSITIONS
- **CONTESTED_SHARE** (MYUNGRI) · COMPOUND/RESTRICTED(SCOPE)
    - 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
    - 지지 전제: ENABLES·원국 재물
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 자리·직업은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 자리·책임, CONNECTS·원국 월주 천간합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 년주↔월주가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **CONVERGENT_SEAT_PRESSURE** (MYUNGRI) · CAUSAL/UNFAVORABLE
    - 원국 월주 해에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
    - 지지 전제: (없음)
    - 상위 명제로부터: (없음)
- **INFLOW_VS_RETENTION** (MYUNGRI) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
    - 지지 전제: ENABLES·원국 재물, ACTIVATES·이 시기 흐름의 재물
    - 상위 명제로부터: d:CONTESTED_SHARE:MONEY_RETENTION:mp_244+mp_256+mp_261
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료 쪽에 자리가 겹쳐 무게가 실려 있고, 지원·배움 쪽은 얇거나 비어 있다. 잘 쓰는 자리와 빌려 써야 하는 자리가 뚜렷하게 갈리는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료
    - 상위 명제로부터: (없음)
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/UNFAVORABLE
    - 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 잡았을 때 남는 쪽은 막힙니다, 기회가 오는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: ACTIVATES·지금의 큰 흐름의 활동·표현
    - 상위 명제로부터: p:mp_255, d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_259+mp_264
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 서로 미치는 영향은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: OPPOSES·지금의 큰 흐름의 겁재, ACTIVATES·올해 흐름의 경쟁·동료
    - 상위 명제로부터: p:mp_256, p:mp_260
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 같이 사는 난도은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: STABILIZES·일간의 뿌리, CONNECTS·원국 일주 천간합
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY:mp_250+mp_251, p:mp_266

### C. COUNTER-PREMISES
- CONTESTED_SHARE ← 반대 전제: OPPOSES·지금의 큰 흐름의 겁재, OPPOSES·올해 흐름의 겁재
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 월주 해
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 년주↔일주
- CONVERGENT_SEAT_PRESSURE ← 반대 전제: CONSTRAINS·원국 월주 해, CONSTRAINS·원국 월주 해
- STRUCTURAL_PROFILE ← 반대 전제: SUPPORTS·원국 지원·배움
- CROSS_AXIS_COMPOUND ← 반대 전제: CONSTRAINS·원국 시주 파, CONSTRAINS·원국 시주 파
- CROSS_TIMING_SPLIT ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리)

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: CONTESTED_SHARE:MONEY_RETENTION, INFLOW_VS_RETENTION:MONEY_INFLOW, STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 자리·책임`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `STABILIZES · 일간의 뿌리`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY / 바뀜·생김: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `CONSTRAINS · 원국 월주 해`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: CONVERGENT_SEAT_PRESSURE:CAREER / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(1개: 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 11
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 9 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CONTESTED_SHARE → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - CONVERGENT_SEAT_PRESSURE → REAL_SYNTHETIC_INFERENCE
    - INFLOW_VS_RETENTION → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE

---

## [시점] A · 지금 계약

**QUESTION** = 지금 계약해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = DECISION · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.

### A. PREMISE GRAPH
- `mp_271` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_272` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_273` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_274` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_275` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · CONTEXTUAL
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_276` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_277` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_278` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_279` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_280` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_281` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_282` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 재물 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 재물  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_283` [MYUNGRI] **CONNECTS** 원국 일주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 일주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_284` [MYUNGRI] **CONSTRAINS** 원국 월주 해 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - ← 지금의 큰 흐름 → 원국 월주 해  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 21개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 같이 사는 난도은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: CONNECTS·원국 일주 천간합
    - 상위 명제로부터: (없음)
- **PRESSURE_AGAINST_CAPACITY** (MYUNGRI) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/UNFAVORABLE
    - 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·지금의 큰 흐름의 재물
    - 상위 명제로부터: p:zp_301, p:mp_282
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/FAVORABLE
    - 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: SUPPORTS·관록(본궁)에 태음 화과, CONSTRAINS·원국 월주 해
    - 상위 명제로부터: p:zp_299, p:mp_284
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: OPPOSES·재백(본궁)에 천동 화기, ACTIVATES·올해 흐름의 재물
    - 상위 명제로부터: p:zp_301, p:mp_286
- **CROSS_REINFORCEMENT** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 전반에 대해 서로 다른 학문이 각각의 근거로 같은 자리를 가리킵니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONSTRAINS·재백(삼합궁)에 천동 화기
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:GENERAL:mp_276+mp_277+mp_279+mp_280+mp_281, p:zp_303

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- DIRECTION_VS_EXECUTION ← 반대 전제: DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- PRESSURE_AGAINST_CAPACITY ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: OPPOSES·재백(삼합궁)에 천동 화기
- CROSS_TIMING_SPLIT ← 반대 전제: SUPPORTS·관록(삼합궁)에 태음 화과
- CROSS_REINFORCEMENT ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주, SUPPORTS·관록(삼합궁)에 태음 화과

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `ACTIVATES · 이 시기 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 10
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 11 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - PRESSURE_AGAINST_CAPACITY → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_REINFORCEMENT → REAL_SYNTHETIC_INFERENCE

---

## [서술형(§12)] A · 성격

**QUESTION** = 제 타고난 성격이 어떤가요?
**INTENT** = DESCRIPTIVE · **ASKED_AXIS** = GENERAL · **VERDICT** = STRUCTURAL_ANSWER
**결론** = 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.

### A. PREMISE GRAPH
- `mp_306` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_307` [MYUNGRI] **ENABLES** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 자리·책임 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_308` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_309` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_310` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · DIRECT
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_311` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_312` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_313` [MYUNGRI] **DESTABILIZES** 원국 일지(배우자·자기 자리) · NATAL · CONTEXTUAL
    - 타고난 배우자 자리 자체가 흔들리는 구조다.
    - ← 원국 일지 충·형·파·해  · 근거학설: 궁위: 일지=배우자·자기 자리
- `mp_314` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_315` [MYUNGRI] **DESTABILIZES** 원국 년주↔일주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔일주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔일주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_316` [MYUNGRI] **DESTABILIZES** 원국 일주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 일주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 일주↔시주 BRANCH_HARM  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_317` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 재물 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 재물 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 재물  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_318` [MYUNGRI] **CONNECTS** 원국 일주 천간합 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 일주 천간합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_319` [MYUNGRI] **CONSTRAINS** 원국 월주 해 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름이 원국 월주 해에 마찰을 일으킨다.
    - ← 지금의 큰 흐름 → 원국 월주 해  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- … 외 16개

### B. DERIVED PROPOSITIONS
- **UNRECEIVED_OPPORTUNITY** (MYUNGRI) · COMPOUND/RESTRICTED(CAPACITY)
    - 이 시기 흐름에 지원·배움 쪽 기운이 들어와 이 축이 실제로 움직인다 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 지원·배움
    - 상위 명제로부터: (없음)
- **DIRECTION_VS_EXECUTION** (MYUNGRI) · COMPOUND/RESTRICTED(TIMING)
    - 전반은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.
    - 지지 전제: ENABLES·원국 지원·배움, ENABLES·일간의 계절 기반
    - 상위 명제로부터: (없음)
- **RECURRING_FRICTION_CAUSE** (MYUNGRI) · CAUSAL/NONE
    - 반복해서 부딪히는 자리는 우연이 아니다. 원국 년주↔월주가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 같은 성격의 자리를 다시 건드리고 있어 같은 일이 되풀이된다.
    - 지지 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주
    - 상위 명제로부터: (없음)
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 자리·책임, 활동·표현, 경쟁·동료, 지원·배움 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 자리·책임, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/FAVORABLE
    - 관록에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: SUPPORTS·관록(본궁)에 태음 화과, CONSTRAINS·원국 월주 해
    - 상위 명제로부터: p:zp_333, p:mp_319
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(TIMING)
    - 같이 사는 난도은 큰 흐름에서 방향이 열려 있는데 가까운 시기가 같은 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
    - 지지 전제: SUPPORTS·부처(본궁)에 태양 화록, CONNECTS·원국 일주 천간합
    - 상위 명제로부터: p:zp_335, d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_318+mp_322+mp_324+mp_328
- **CROSS_CONTRADICTION_RESOLVED** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 원국 일지(배우자·자기 자리)가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, SUPPORTS·부처(본궁)에 태양 화록
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY:mp_311+mp_312+mp_313+mp_322+mp_324+mp_328, p:zp_335
- **CROSS_REINFORCEMENT** (CROSS) · DIRECTIONAL/RESTRICTED(SCOPE)
    - 전반에 대해 서로 다른 학문이 각각의 근거로 같은 자리를 가리킵니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONSTRAINS·재백(삼합궁)에 천동 화기
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:GENERAL:mp_311+mp_312+mp_314+mp_315+mp_316, p:zp_331

### C. COUNTER-PREMISES
- UNRECEIVED_OPPORTUNITY ← 반대 전제: ABSENT·일간 강약 · 억부용신
- DIRECTION_VS_EXECUTION ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- RECURRING_FRICTION_CAUSE ← 반대 전제: CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: OPPOSES·재백(삼합궁)에 천동 화기
- CROSS_TIMING_SPLIT ← 반대 전제: DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- CROSS_CONTRADICTION_RESOLVED ← 반대 전제: DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- CROSS_REINFORCEMENT ← 반대 전제: DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔일주, DESTABILIZES·원국 일주↔시주, SUPPORTS·관록(삼합궁)에 태음 화과

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 원국 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 6개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REMOVE** `DESTABILIZES · 원국 년주↔월주`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: PRESSURE_AGAINST_CAPACITY:GENERAL, RECURRING_FRICTION_CAUSE:GENERAL / 바뀜·생김: PRESSURE_AGAINST_CAPACITY:GENERAL, RECURRING_FRICTION_CAUSE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ACTIVATES · 이 시기 흐름의 지원·배움`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: UNRECEIVED_OPPORTUNITY:GENERAL / 바뀜·생김: 없음
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:RELATION_STABILITY
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 11
- MULTI_FACT_SUMMARY = 0
- STATIC_RULE_OUTPUT = 9 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - UNRECEIVED_OPPORTUNITY → REAL_SYNTHETIC_INFERENCE
    - DIRECTION_VS_EXECUTION → REAL_SYNTHETIC_INFERENCE
    - RECURRING_FRICTION_CAUSE → REAL_SYNTHETIC_INFERENCE
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_CONTRADICTION_RESOLVED → REAL_SYNTHETIC_INFERENCE
    - CROSS_REINFORCEMENT → REAL_SYNTHETIC_INFERENCE

---

## [원인형(§12)] C · 왜 부딪히나

**QUESTION** = 왜 자꾸 부딪힐까요?
**INTENT** = CAUSE_WHY · **ASKED_AXIS** = GENERAL · **VERDICT** = STRUCTURAL_ANSWER
**결론** = 이 명식은 재물, 활동·표현, 경쟁·동료, 지원·배움 쪽에 자리가 겹쳐 무게가 실려 있고, 자리·책임 쪽은 얇거나 비어 있다. 잘 쓰는 자리와 빌려 써야 하는 자리가 뚜렷하게 갈리는 구조다.

### A. PREMISE GRAPH
- `mp_336` [MYUNGRI] **ENABLES** 원국 재물 · NATAL · CONTEXTUAL
    - 재물 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 재물 4자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_337` [MYUNGRI] **SUPPORTS** 원국 자리·책임 · NATAL · CONTEXTUAL
    - 자리·책임 쪽 자리가 원국에 하나 있다.
    - ← 원국 자리·책임 1자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_338` [MYUNGRI] **ENABLES** 원국 활동·표현 · NATAL · CONTEXTUAL
    - 활동·표현 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 활동·표현 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_339` [MYUNGRI] **ENABLES** 원국 경쟁·동료 · NATAL · CONTEXTUAL
    - 경쟁·동료 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 경쟁·동료 3자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_340` [MYUNGRI] **ENABLES** 원국 지원·배움 · NATAL · DIRECT
    - 지원·배움 쪽이 여러 자리에 걸쳐 있어, 이 축을 감당할 바탕이 원국에 있다.
    - ← 원국 지원·배움 2자리  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_341` [MYUNGRI] **ENABLES** 일간의 계절 기반 · NATAL · CONTEXTUAL
    - 계절의 기운을 등에 업고 있어, 흐름이 올 때 밀고 나갈 힘이 있다.
    - ← 원국 득령  · 근거학설: 월령 득령/실령 (frozen month-command)
- `mp_342` [MYUNGRI] **STABILIZES** 일간의 뿌리 · NATAL · CONTEXTUAL
    - 뿌리가 실리는 자리(월지·일지)에 박혀 있어, 흔들려도 되돌아오는 바탕이 있다.
    - ← 원국 통근 ROOTED  · 근거학설: 통근(同干) (frozen rooting)
- `mp_343` [MYUNGRI] **DESTABILIZES** 원국 년주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔시주 STEM_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_344` [MYUNGRI] **DESTABILIZES** 원국 년주↔월주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔월주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔월주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_345` [MYUNGRI] **DESTABILIZES** 원국 년주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 년주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 년주↔시주 BRANCH_CLASH  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_346` [MYUNGRI] **DESTABILIZES** 원국 월주↔시주 · NATAL · BACKGROUND
    - 원국 안에서 월주↔시주 사이가 이미 부딪히는 구조다.
    - ← 원국 월주↔시주 BRANCH_SELF_PUNISHMENT  · 근거학설: 원국 합충형파해 (frozen natal relations)
- `mp_347` [MYUNGRI] **ACTIVATES** 지금의 큰 흐름의 활동·표현 · DAEWOON · CONTEXTUAL
    - 지금의 큰 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 지금의 큰 흐름 활동·표현  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- `mp_348` [MYUNGRI] **CONNECTS** 원국 년주 반합 · DAEWOON · DIRECT
    - 지금의 큰 흐름이 원국 년주 반합와 맞물려 풀린다.
    - ← 지금의 큰 흐름 → 원국 년주 반합  · 근거학설: 궁위 + 합충형파해 (frozen relations to natal)
- `mp_349` [MYUNGRI] **ACTIVATES** 올해 흐름의 활동·표현 · SEWOON · CONTEXTUAL
    - 올해 흐름에 활동·표현 쪽 기운이 들어와 이 축이 실제로 움직인다.
    - ← 올해 흐름 활동·표현  · 근거학설: 십신 배치 → 축 (frozen 십신 분포)
- … 외 12개

### B. DERIVED PROPOSITIONS
- **INFLOW_VS_RETENTION** (MYUNGRI) · COMPOUND/RESTRICTED(SCOPE)
    - 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
    - 지지 전제: ENABLES·원국 재물
    - 상위 명제로부터: d:CONTESTED_SHARE:MONEY_RETENTION:mp_336+mp_353
- **STRUCTURAL_PROFILE** (MYUNGRI) · STRUCTURAL/NONE
    - 이 명식은 재물, 활동·표현, 경쟁·동료, 지원·배움 쪽에 자리가 겹쳐 무게가 실려 있고, 자리·책임 쪽은 얇거나 비어 있다. 잘 쓰는 자리와 빌려 써야 하는 자리가 뚜렷하게 갈리는 구조다.
    - 지지 전제: ENABLES·원국 재물, ENABLES·원국 활동·표현, ENABLES·원국 경쟁·동료, ENABLES·원국 지원·배움
    - 상위 명제로부터: (없음)
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 잡았을 때 남는 쪽은 범위를 좁혀야 합니다, 기회가 오는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: ACTIVATES·지금의 큰 흐름의 활동·표현, ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, ACTIVATES·올해 흐름의 활동·표현
    - 상위 명제로부터: p:mp_347, d:PRESSURE_AGAINST_CAPACITY:OUTCOME:mp_341+mp_342+mp_354, p:mp_349
- **CROSS_TIMING_SPLIT** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 전반은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.
    - 지지 전제: ENABLES·일간의 계절 기반, STABILIZES·일간의 뿌리, CONNECTS·원국 년주 천간합
    - 상위 명제로부터: d:PRESSURE_AGAINST_CAPACITY:GENERAL:mp_341+mp_342+mp_343+mp_344+mp_345+mp_346, p:mp_350
- **CROSS_AXIS_COMPOUND** (CROSS) · COMPOUND/RESTRICTED(SCOPE)
    - 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
    - 지지 전제: ACTIVATES·이 시기 흐름의 자리·책임, ENABLES·원국 재물, CONNECTS·원국 월주 반합
    - 상위 명제로부터: p:mp_352, d:CONTESTED_SHARE:MONEY_RETENTION:mp_336+mp_353, p:mp_355

### C. COUNTER-PREMISES
- STRUCTURAL_PROFILE ← 반대 전제: SUPPORTS·원국 자리·책임
- CROSS_AXIS_COMPOUND ← 반대 전제: DESTABILIZES·원국 시주 천간충
- CROSS_TIMING_SPLIT ← 반대 전제: DESTABILIZES·원국 년주↔시주, DESTABILIZES·원국 년주↔월주, DESTABILIZES·원국 년주↔시주, DESTABILIZES·원국 월주↔시주
- CROSS_AXIS_COMPOUND ← 반대 전제: OPPOSES·이 시기 흐름의 겁재

### D/E/F. METAMORPHIC VARIANTS · 기대 변화 · 실제 변화
- **REMOVE** `ENABLES · 원국 재물`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 사라짐: CONTESTED_SHARE:MONEY_RETENTION, INFLOW_VS_RETENTION:MONEY_INFLOW, STRUCTURAL_PROFILE:GENERAL / 바뀜·생김: STRUCTURAL_PROFILE:GENERAL
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**
- **REMOVE** `ENABLES · 일간의 계절 기반`
    - 기대: 이 전제를 인용한 결론이 사라지거나 진술이 바뀐다
    - 실제: 단독 제거로는 변화 없음. 같은 역할(ENABLES) 5개를 모두 제거하면 결론이 바뀜 → 대체 가능한 근거
    - **판정: REDUNDANT (대체 근거가 있어 단독으로는 결론을 바꾸지 않음 — 장식이 아님)**
- **REVERSE** `버틸 바탕 전체(2개: 일간의 계절 기반, 일간의 뿌리)`
    - 기대: 버티는 결론 ↔ 못 버티는 결론으로 방향 자체가 바뀐다
    - 실제: 바뀐 결론: PRESSURE_AGAINST_CAPACITY:GENERAL, PRESSURE_AGAINST_CAPACITY:OUTCOME
    - **판정: MATERIAL (전제가 결론을 실제로 움직임)**

### G. SYNTHESIS CLASSIFICATION
- REAL_SYNTHETIC_INFERENCE = 7
- MULTI_FACT_SUMMARY = 1
- STATIC_RULE_OUTPUT = 13 (단일 전제 재진술 — 추론으로 세지 않음)
- UNSUPPORTED_INFERENCE = 0 (0이어야 함)
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - INFLOW_VS_RETENTION → MULTI_FACT_SUMMARY
    - STRUCTURAL_PROFILE → REAL_SYNTHETIC_INFERENCE
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - PRIMITIVE → STATIC_RULE_OUTPUT
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE
    - CROSS_TIMING_SPLIT → REAL_SYNTHETIC_INFERENCE
    - CROSS_AXIS_COMPOUND → REAL_SYNTHETIC_INFERENCE

---

## [후속 대화 체인] 사업을 확장할까? → 왜? → 돈은?

- **Q1** `OPPORTUNITY` → **CONDITIONAL_AGAINST** — 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **Q2 (왜?)** 는 저장된 그래프를 복원해 같은 전제를 설명합니다.
    - 복원된 전제 수 = 34 (Q1과 동일: true)
    - 복원된 명제 수 = 22 · 파생 링크 유실 = 없음
    - 평가 시각 보존 = true
- **Q3 (돈은?)** `MONEY_INFLOW` → **AGAINST** — 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 반대 근거도 있으나, 한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다.
    - 다른 축으로 이동했는가 = true

---
