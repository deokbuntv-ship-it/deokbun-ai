# DEOKBUNI — V4B KERNEL TARGETED-FIX QA PACK

> 자동 생성 문서입니다. 손으로 고치지 마세요.
> 생성기: `src/features/divination/__tests__/generateV4bKernelQaPack.test.ts`
> 모든 케이스는 실제 운영 경로(`buildConsultationGrounding`)를 그대로 통과시켜 얻은 결과입니다.

## 이 팩이 V4A와 다른 점

V4A 팩은 엔진에게 "무엇을 해냈나"를 묻고 그 대답을 옮겨 적었습니다. 독립 감사는 그렇게 집계된 117건 중
실제 추론이 2건이었다고 판정했습니다. **엔진이 스스로에게 준 라벨을 세는 것은 측정이 아닙니다.**

여기서 런타임이 할 수 있는 말은 "추론일 수 있다"(CANDIDATE)까지입니다. REAL 판정은 전적으로 검증
하네스가 내립니다 — 그 결론의 **자기 전제를** 하나씩 지우고 뒤집고, 교차 결론이면 그 결론이 딛고 선
명제의 **대상과 시점까지 바꿔** 다시 추론을 돌린 뒤, **그 결론이 실제로 움직였는지**만 봅니다.

| 항목 | 값 |
| --- | --- |
| 시나리오 | 13 |
| 런타임이 지목한 후보(CANDIDATE) | 108 |
| 하네스가 인증한 REAL_SYNTHETIC_INFERENCE | 82 |
| ├ 명리 | 36 (규칙 5종) |
| └ 교차 | 46 |
| MULTI_FACT_SUMMARY (과다결정·비인과) | 26 |
| STATIC_RULE_OUTPUT | 0 |
| ⚠ UNSUPPORTED_INFERENCE | 0 (0이어야 함) |

- **후보 수 > 인증 수는 정상입니다.** 그 차이가 곧 "스스로 붙인 라벨과 실제 인과성의 간격"이고,
  V4A에서는 그 간격이 보이지 않았습니다.
- **MULTI_FACT_SUMMARY**는 거짓말이라는 뜻이 아니라, 단일 전제를 지워도 결론이 그대로여서
  그 전제의 인과적 필연성이 증명되지 않았다는 뜻입니다(여러 경로가 같은 결론에 이르는 과다결정 포함).
- V4B에서 제거된 규칙(UNRECEIVED_OPPORTUNITY / PRESSURE_AGAINST_CAPACITY / STRUCTURAL_PROFILE) 때문에
  결론 수는 V4A보다 줄었습니다. §29가 명시한 대로 **정밀도가 커버리지에 우선합니다.**

---

## [재물] A · 유입

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW · **VERDICT** = AGAINST
**결론** = 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 그리고 같이 사는 난도과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 잡았을 때 남는 쪽과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 돈이 들어오는 쪽과 자리·직업은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 30 · **명제 수** = 25 · **후보(runtime)** = 8

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→결론 변함 / remove CONSTRAINS·원국 년주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 년주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 년주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### RECURRING_FRICTION_CAUSE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:WEALTH_PALACE`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 돈이 들어오는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:WEALTH_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/UNFAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, OPPOSES·재백궁
- **COUNTER_PREMISES** = SUPPORTS·재백궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove OPPOSES·재백궁→변화 없음 / remove SUPPORTS·재백궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse OPPOSES→SUPPORTS·재백궁→변화 없음 / reverse SUPPORTS→OPPOSES·재백궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:재백궁→변함 / retarget ZIWEI:재백궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:UNFAVORABLE→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:WEALTH_PALACE`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = A · **TARGET** = 잡았을 때 남는 쪽과 돈이 들어오는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:WEALTH_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/UNFAVORABLE
- **DERIVED_PROPOSITION** = 잡았을 때 남는 쪽과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 반합, OPPOSES·재백궁, CONNECTS·원국 시주 육합, CONNECTS·원국 시주 반합
- **COUNTER_PREMISES** = SUPPORTS·재백궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 반합→변화 없음 / remove OPPOSES·재백궁→변화 없음 / remove CONNECTS·원국 시주 육합→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음 / remove SUPPORTS·재백궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse OPPOSES→SUPPORTS·재백궁→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 육합→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse SUPPORTS→OPPOSES·재백궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove ZIWEI:재백궁→변함 / retarget ZIWEI:재백궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 시주 육합→없음 / retarget MYUNGRI:원국 시주 육합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 육합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 육합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = A · **TARGET** = 돈이 들어오는 것과 남는 것 (`COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/UNFAVORABLE
- **DERIVED_PROPOSITION** = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = OPPOSES·재백궁, SUPPORTS·전택궁
- **COUNTER_PREMISES** = SUPPORTS·재백궁
- **PREMISE_REMOVAL_TESTS** = remove OPPOSES·재백궁→변화 없음 / remove SUPPORTS·전택궁→변화 없음 / remove SUPPORTS·재백궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse OPPOSES→SUPPORTS·재백궁→변화 없음 / reverse SUPPORTS→OPPOSES·전택궁→변화 없음 / reverse SUPPORTS→OPPOSES·재백궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:재백궁→변함 / retarget ZIWEI:재백궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:UNFAVORABLE→FAVORABLE→변함 / remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:WEALTH_PALACE`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = A · **TARGET** = 돈이 들어오는 쪽과 자리·직업 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:WEALTH_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/UNFAVORABLE
- **DERIVED_PROPOSITION** = 돈이 들어오는 쪽과 자리·직업은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = OPPOSES·재백궁, SUPPORTS·관록궁
- **COUNTER_PREMISES** = SUPPORTS·재백궁, OPPOSES·관록궁
- **PREMISE_REMOVAL_TESTS** = remove OPPOSES·재백궁→변화 없음 / remove SUPPORTS·관록궁→변화 없음 / remove SUPPORTS·재백궁→변화 없음 / remove OPPOSES·관록궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse OPPOSES→SUPPORTS·재백궁→변화 없음 / reverse SUPPORTS→OPPOSES·관록궁→변화 없음 / reverse SUPPORTS→OPPOSES·재백궁→변화 없음 / reverse OPPOSES→SUPPORTS·관록궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:재백궁→변함 / retarget ZIWEI:재백궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:UNFAVORABLE→FAVORABLE→변함 / remove ZIWEI:관록궁→변함 / retarget ZIWEI:관록궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [재물] A · 보유

**QUESTION** = 저축이 남을까요?
**INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION · **VERDICT** = FOR
**결론** = 전택은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다. 그리고 같이 사는 난도과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 같이 사는 난도은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 전반과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 30 · **명제 수** = 25 · **후보(runtime)** = 8

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→결론 변함 / remove CONSTRAINS·원국 년주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 년주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 년주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### RECURRING_FRICTION_CAUSE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:PROPERTY_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 돈이 남는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:PROPERTY_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 같이 사는 난도은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), SUPPORTS·전택궁, DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove SUPPORTS·전택궁→변화 없음 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse SUPPORTS→OPPOSES·전택궁→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→없음 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→없음 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음 / remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 일주 천간충→없음 / retarget MYUNGRI:원국 일주 천간충→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음 / remove MYUNGRI:원국 일주 충→없음 / retarget MYUNGRI:원국 일주 충→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음 / remove MYUNGRI:원국 일주 형→없음 / retarget MYUNGRI:원국 일주 형→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일지(배우자·자기 자리)(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일지(배우자·자기 자리)(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 천간충(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 천간충(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 충(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 충(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 형(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 형(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:PROPERTY_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = A · **TARGET** = 자리가 열리는 것과 실속이 남는 것 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:PROPERTY_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 월주 해, SUPPORTS·전택궁
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 월주 해→변화 없음 / remove SUPPORTS·전택궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 월주 해→변화 없음 / reverse SUPPORTS→OPPOSES·전택궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 해→변함 / retarget MYUNGRI:원국 월주 해→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:PROPERTY_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = A · **TARGET** = 전반과 돈이 남는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:PROPERTY_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, SUPPORTS·전택궁, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→변화 없음 / remove SUPPORTS·전택궁→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse SUPPORTS→OPPOSES·전택궁→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = A · **TARGET** = 돈이 들어오는 것과 남는 것 (`COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = SUPPORTS·전택궁, OPPOSES·재백궁
- **COUNTER_PREMISES** = SUPPORTS·재백궁
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·전택궁→변화 없음 / remove OPPOSES·재백궁→변화 없음 / remove SUPPORTS·재백궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·전택궁→변화 없음 / reverse OPPOSES→SUPPORTS·재백궁→변화 없음 / reverse SUPPORTS→OPPOSES·재백궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:재백궁→변함 / retarget ZIWEI:재백궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:UNFAVORABLE→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [재물] B · 유입

**QUESTION** = 올해 돈을 벌 수 있을까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = MONEY_INFLOW · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다. 그리고 자리·직업과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 잡았을 때 남는 쪽과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 같이 사는 난도과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 28 · **명제 수** = 25 · **후보(runtime)** = 9

#### CONTESTED_SHARE — `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = B · **TARGET** = 벌이는 몫과 남는 몫 (`COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
- **INPUT_PREMISES** = SUPPORTS·원국 재물, OPPOSES·지금의 큰 흐름의 겁재, OPPOSES·올해 흐름의 겁재
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·원국 재물→결론 변함 / remove OPPOSES·지금의 큰 흐름의 겁재→결론 변함 / remove OPPOSES·올해 흐름의 겁재→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·원국 재물→결론 변함 / reverse OPPOSES→SUPPORTS·지금의 큰 흐름의 겁재→변화 없음 / reverse OPPOSES→SUPPORTS·올해 흐름의 겁재→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `SUPPORTS·원국 재물` → **MATERIAL**
    - `OPPOSES·지금의 큰 흐름의 겁재` → **MATERIAL**
    - `OPPOSES·올해 흐름의 겁재` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:MONTH`

- **AXIS** = CAREER · **SUBJECT** = B · **TARGET** = 원국 월주 해 (`NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 월주 해에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 월주 해, CONSTRAINS·원국 월주 해
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 월주 해→결론 변함 / remove CONSTRAINS·원국 월주 해→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 월주 해→결론 변함 / reverse CONSTRAINS→ENABLES·원국 월주 해→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 월주 해` → **MATERIAL**
    - `CONSTRAINS·원국 월주 해` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:HOUR`

- **AXIS** = OUTCOME · **SUBJECT** = B · **TARGET** = 원국 시주 파 (`NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 시주 파에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 시주 파, CONSTRAINS·원국 시주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 시주 파→결론 변함 / remove CONSTRAINS·원국 시주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 시주 파→결론 변함 / reverse CONSTRAINS→ENABLES·원국 시주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 시주 파` → **MATERIAL**
    - `CONSTRAINS·원국 시주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### INFLOW_VS_RETENTION — `COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = B · **TARGET** = 유입과 보유 (`COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- **INPUT_PREMISES** = ACTIVATES·이 시기 흐름의 재물
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove ACTIVATES·이 시기 흐름의 재물→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse ACTIVATES→ABSENT·이 시기 흐름의 재물→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `ACTIVATES·이 시기 흐름의 재물` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:MONTH`

- **AXIS** = CAREER · **SUBJECT** = B · **TARGET** = 원국 월주 천간합 (`NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 월주 천간합에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = CONNECTS·원국 월주 천간합, CONSTRAINS·원국 월주 해
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 월주 천간합→변화 없음 / remove CONSTRAINS·원국 월주 해→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 월주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 월주 해→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 천간합→변함 / retarget MYUNGRI:원국 월주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 월주 해→변함 / retarget MYUNGRI:원국 월주 해→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.|NATAL_SEAT:MONTH`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = B · **TARGET** = 자리·직업과 돈이 들어오는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.|NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 자리·직업과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 월주 천간합, ACTIVATES·이 시기 흐름의 재물
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 월주 천간합→변화 없음 / remove ACTIVATES·이 시기 흐름의 재물→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 월주 천간합→변화 없음 / reverse ACTIVATES→ABSENT·이 시기 흐름의 재물→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 천간합→변함 / retarget MYUNGRI:원국 월주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:유입과 보유→변함 / retarget MYUNGRI:유입과 보유→변함 / rescope MYUNGRI:WOLWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:HOUR`

- **AXIS** = OUTCOME · **SUBJECT** = B · **TARGET** = 원국 시주 천간합 (`NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 시주 천간합에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 천간합, CONSTRAINS·원국 시주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 천간합→변화 없음 / remove CONSTRAINS·원국 시주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 시주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 천간합→변함 / retarget MYUNGRI:원국 시주 천간합→변함 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 시주 파→변함 / retarget MYUNGRI:원국 시주 파→변함 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.|NATAL_SEAT:HOUR`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = B · **TARGET** = 잡았을 때 남는 쪽과 돈이 들어오는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.|NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 잡았을 때 남는 쪽과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 천간합, ACTIVATES·이 시기 흐름의 재물
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 천간합→변화 없음 / remove ACTIVATES·이 시기 흐름의 재물→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 천간합→변화 없음 / reverse ACTIVATES→ABSENT·이 시기 흐름의 재물→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 천간합→변함 / retarget MYUNGRI:원국 시주 천간합→변함 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:유입과 보유→변함 / retarget MYUNGRI:유입과 보유→변함 / rescope MYUNGRI:WOLWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.|NATAL_SEAT:DAY`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = B · **TARGET** = 같이 사는 난도과 돈이 들어오는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.|NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 같이 사는 난도과 돈이 들어오는 쪽은 다르게 봅니다. 돈이 들어오는 쪽은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, ACTIVATES·이 시기 흐름의 재물
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove ACTIVATES·이 시기 흐름의 재물→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse ACTIVATES→ABSENT·이 시기 흐름의 재물→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:유입과 보유→변함 / retarget MYUNGRI:유입과 보유→변함 / rescope MYUNGRI:WOLWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [재물] D · 보유

**QUESTION** = 저축이 남을까요?
**INTENT** = OUTCOME · **ASKED_AXIS** = MONEY_RETENTION · **VERDICT** = FOR
**결론** = 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다. 그리고 같이 사는 난도과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 같이 사는 난도은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 전반과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 30 · **명제 수** = 20 · **후보(runtime)** = 6

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = D · **TARGET** = 원국 년주 해 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 해에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 해, DESTABILIZES·원국 년주 천간충
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 해→결론 변함 / remove DESTABILIZES·원국 년주 천간충→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 해→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 년주 천간충→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 해` → **MATERIAL**
    - `DESTABILIZES·원국 년주 천간충` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:PROPERTY_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = D · **TARGET** = 같이 사는 난도과 돈이 남는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:PROPERTY_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 같이 사는 난도은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), SUPPORTS·전택궁
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove SUPPORTS·전택궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse SUPPORTS→OPPOSES·전택궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:MONTH`

- **AXIS** = CAREER · **SUBJECT** = D · **TARGET** = 원국 월주 천간충 (`NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 월주 천간충에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 월주 천간충, CONNECTS·원국 월주 반합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 월주 천간충→변화 없음 / remove CONNECTS·원국 월주 반합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 월주 천간충→변화 없음 / reverse CONNECTS→SEPARATES·원국 월주 반합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 천간충→변함 / retarget MYUNGRI:원국 월주 천간충→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 월주 반합→변함 / retarget MYUNGRI:원국 월주 반합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:PROPERTY_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = D · **TARGET** = 자리가 열리는 것과 실속이 남는 것 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:PROPERTY_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 월주 천간충, SUPPORTS·전택궁
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 월주 천간충→변화 없음 / remove SUPPORTS·전택궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 월주 천간충→변화 없음 / reverse SUPPORTS→OPPOSES·전택궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 천간충→변함 / retarget MYUNGRI:원국 월주 천간충→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:PROPERTY_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = D · **TARGET** = 전반과 돈이 남는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:PROPERTY_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 돈이 남는 쪽은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 해, SUPPORTS·전택궁, DESTABILIZES·원국 년주 천간충
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 해→변화 없음 / remove SUPPORTS·전택궁→변화 없음 / remove DESTABILIZES·원국 년주 천간충→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 해→변화 없음 / reverse SUPPORTS→OPPOSES·전택궁→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 년주 천간충→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 해→변함 / retarget MYUNGRI:원국 년주 해→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 천간충→없음 / retarget MYUNGRI:원국 년주 천간충→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 년주 해(기대 ABSENT, 실제 ASSERTION); remove MYUNGRI:원국 년주 천간충(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 천간충(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:PROPERTY_PALACE`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = D · **TARGET** = 자리가 열리는 것과 실속이 남는 것 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:PROPERTY_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 자리가 열리는 것과 실속이 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = SUPPORTS·전택궁, CONSTRAINS·관록궁
- **COUNTER_PREMISES** = SUPPORTS·관록궁
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·전택궁→변화 없음 / remove CONSTRAINS·관록궁→변화 없음 / remove SUPPORTS·관록궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·전택궁→변화 없음 / reverse CONSTRAINS→ENABLES·관록궁→변화 없음 / reverse SUPPORTS→OPPOSES·관록궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:전택궁→변함 / retarget ZIWEI:전택궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:관록궁→변함 / retarget ZIWEI:관록궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [사업·기회] A · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 그리고 같이 사는 난도과 기회가 오는 쪽은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 기회가 오는 쪽과 자리·직업은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 기회가 오는 쪽과 지금 시점은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 34 · **명제 수** = 27 · **후보(runtime)** = 8

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→결론 변함 / remove CONSTRAINS·원국 년주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 년주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 년주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### RECURRING_FRICTION_CAUSE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`

- **AXIS** = OPPORTUNITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 기회가 오는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 같이 사는 난도과 기회가 오는 쪽은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, CONSTRAINS·명궁
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE`

- **AXIS** = OPPORTUNITY · **SUBJECT** = A · **TARGET** = 기회가 오는 것과 그것을 잡아서 남는 것 (`COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 반합, CONSTRAINS·명궁, CONNECTS·원국 시주 육합, CONNECTS·원국 시주 반합
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 반합→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove CONNECTS·원국 시주 육합→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 육합→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 시주 육합→없음 / retarget MYUNGRI:원국 시주 육합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 육합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 육합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE`

- **AXIS** = OPPORTUNITY · **SUBJECT** = A · **TARGET** = 기회가 오는 쪽과 자리·직업 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 기회가 오는 쪽과 자리·직업은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·명궁, SUPPORTS·관록궁
- **COUNTER_PREMISES** = SUPPORTS·명궁, OPPOSES·관록궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·관록궁→변화 없음 / remove SUPPORTS·명궁→변화 없음 / remove OPPOSES·관록궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·관록궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음 / reverse OPPOSES→SUPPORTS·관록궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:관록궁→변함 / retarget ZIWEI:관록궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:SELF_PALACE`

- **AXIS** = OPPORTUNITY · **SUBJECT** = A · **TARGET** = 기회가 오는 쪽과 지금 시점 (`COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 기회가 오는 쪽과 지금 시점은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·명궁, ENABLES·기문 국
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·명궁→변화 없음 / remove ENABLES·기문 국→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse ENABLES→CONSTRAINS·기문 국→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove QIMEN:기문 국→변함 / retarget QIMEN:기문 국→변함 / rescope QIMEN:PRESENT_MOMENT→NATAL→없음 / redirect QIMEN:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [사업·기회] C · 확장

**QUESTION** = 사업을 더 키워도 될까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = OPPORTUNITY · **VERDICT** = INSUFFICIENT_EVIDENCE
**결론** = 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
**전제 수** = 28 · **명제 수** = 19 · **후보(runtime)** = 3

#### CONTESTED_SHARE — `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = C · **TARGET** = 벌이는 몫과 남는 몫 (`COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
- **INPUT_PREMISES** = SUPPORTS·원국 재물, OPPOSES·이 시기 흐름의 겁재
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·원국 재물→결론 변함 / remove OPPOSES·이 시기 흐름의 겁재→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·원국 재물→결론 변함 / reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `SUPPORTS·원국 재물` → **MATERIAL**
    - `OPPOSES·이 시기 흐름의 겁재` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = C · **TARGET** = 원국 일주 자형 (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 일주 자형, CONSTRAINS·원국 일주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 일주 자형→결론 변함 / remove CONSTRAINS·원국 일주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 일주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 일주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 일주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 일주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:HOUR`

- **AXIS** = OUTCOME · **SUBJECT** = C · **TARGET** = 원국 시주 천간충 (`NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 시주 천간충에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 시주 천간충, CONNECTS·원국 시주 반합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 시주 천간충→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 시주 천간충→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 천간충→변함 / retarget MYUNGRI:원국 시주 천간충→변함 / rescope MYUNGRI:WOLWOON→NATAL→변함 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 시주 반합→변함 / retarget MYUNGRI:원국 시주 반합→변함 / rescope MYUNGRI:WOLWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [자리·이동] A · 이직

**QUESTION** = 이직해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT · **VERDICT** = FOR
**결론** = 천이은 맞물린 자리에서 힘을 받는 편이라, 범위를 지키면 진행하실 만합니다. 그리고 같이 사는 난도과 이동은 다르게 봅니다. 이동은 열립니다, 같이 사는 난도은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 전반과 이동은 다르게 봅니다. 이동은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 이동과 전반은 다르게 봅니다. 이동은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 31 · **명제 수** = 26 · **후보(runtime)** = 8

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→결론 변함 / remove CONSTRAINS·원국 년주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 년주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 년주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### RECURRING_FRICTION_CAUSE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 이동 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 이동은 다르게 봅니다. 이동은 열립니다, 같이 사는 난도은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), SUPPORTS·천이궁, DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove SUPPORTS·천이궁→변화 없음 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse SUPPORTS→OPPOSES·천이궁→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→없음 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→없음 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음 / remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 일주 천간충→없음 / retarget MYUNGRI:원국 일주 천간충→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음 / remove MYUNGRI:원국 일주 충→없음 / retarget MYUNGRI:원국 일주 충→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음 / remove MYUNGRI:원국 일주 형→없음 / retarget MYUNGRI:원국 일주 형→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일지(배우자·자기 자리)(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일지(배우자·자기 자리)(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 천간충(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 천간충(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 충(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 충(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 형(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 형(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = A · **TARGET** = 자리·직업과 이동 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 월주 해, SUPPORTS·천이궁
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 월주 해→변화 없음 / remove SUPPORTS·천이궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 월주 해→변화 없음 / reverse SUPPORTS→OPPOSES·천이궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 해→변함 / retarget MYUNGRI:원국 월주 해→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = A · **TARGET** = 전반과 이동 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 이동은 다르게 봅니다. 이동은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, SUPPORTS·천이궁, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→변화 없음 / remove SUPPORTS·천이궁→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse SUPPORTS→OPPOSES·천이궁→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:SELF_PALACE|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = A · **TARGET** = 이동과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:SELF_PALACE|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 이동과 전반은 다르게 봅니다. 이동은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = SUPPORTS·천이궁, CONSTRAINS·명궁
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·천이궁→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·천이궁→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [자리·이동] D · 이사

**QUESTION** = 이사해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = MOVEMENT · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 천이 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 그리고 전반과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 전반은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 잡았을 때 남는 쪽과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 이동과 지금 시점은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 32 · **명제 수** = 21 · **후보(runtime)** = 6

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = D · **TARGET** = 원국 년주 해 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 해에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 해, DESTABILIZES·원국 년주 천간충
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 해→결론 변함 / remove DESTABILIZES·원국 년주 천간충→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 해→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 년주 천간충→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 해` → **MATERIAL**
    - `DESTABILIZES·원국 년주 천간충` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:MONTH`

- **AXIS** = CAREER · **SUBJECT** = D · **TARGET** = 원국 월주 천간충 (`NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 월주 천간충에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 월주 천간충, CONNECTS·원국 월주 반합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 월주 천간충→변화 없음 / remove CONNECTS·원국 월주 반합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 월주 천간충→변화 없음 / reverse CONNECTS→SEPARATES·원국 월주 반합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 천간충→변함 / retarget MYUNGRI:원국 월주 천간충→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 월주 반합→변함 / retarget MYUNGRI:원국 월주 반합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = D · **TARGET** = 전반과 이동 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 전반과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 전반은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 년주 반합, CONSTRAINS·천이궁
- **COUNTER_PREMISES** = SUPPORTS·천이궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 년주 반합→변화 없음 / remove CONSTRAINS·천이궁→변화 없음 / remove SUPPORTS·천이궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 년주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·천이궁→변화 없음 / reverse SUPPORTS→OPPOSES·천이궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 반합→변함 / retarget MYUNGRI:원국 년주 반합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = D · **TARGET** = 자리·직업과 이동 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 월주 반합, CONSTRAINS·천이궁, CONNECTS·원국 월주 천간합
- **COUNTER_PREMISES** = SUPPORTS·천이궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 월주 반합→변화 없음 / remove CONSTRAINS·천이궁→변화 없음 / remove CONNECTS·원국 월주 천간합→변화 없음 / remove SUPPORTS·천이궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 월주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·천이궁→변화 없음 / reverse CONNECTS→SEPARATES·원국 월주 천간합→변화 없음 / reverse SUPPORTS→OPPOSES·천이궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 반합→없음 / retarget MYUNGRI:원국 월주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 월주 천간합→없음 / retarget MYUNGRI:원국 월주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 월주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 월주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 월주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 월주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = D · **TARGET** = 잡았을 때 남는 쪽과 이동 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 잡았을 때 남는 쪽과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 반합, CONSTRAINS·천이궁
- **COUNTER_PREMISES** = SUPPORTS·천이궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 반합→변화 없음 / remove CONSTRAINS·천이궁→변화 없음 / remove SUPPORTS·천이궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·천이궁→변화 없음 / reverse SUPPORTS→OPPOSES·천이궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 반합→변함 / retarget MYUNGRI:원국 시주 반합→변함 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:TRAVEL_PALACE`

- **AXIS** = MOVEMENT · **SUBJECT** = D · **TARGET** = 이동과 지금 시점 (`COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:TRAVEL_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 이동과 지금 시점은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·천이궁, ENABLES·기문 국
- **COUNTER_PREMISES** = SUPPORTS·천이궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·천이궁→변화 없음 / remove ENABLES·기문 국→변화 없음 / remove SUPPORTS·천이궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·천이궁→변화 없음 / reverse ENABLES→CONSTRAINS·기문 국→변화 없음 / reverse SUPPORTS→OPPOSES·천이궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:천이궁→변함 / retarget ZIWEI:천이궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove QIMEN:기문 국→변함 / retarget QIMEN:기문 국→변함 / rescope QIMEN:PRESENT_MOMENT→NATAL→없음 / redirect QIMEN:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [관계] A · 결혼

**QUESTION** = 결혼해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = RELATION_STABILITY · **VERDICT** = INSUFFICIENT_EVIDENCE
**결론** = 같이 사는 난도에 대해서는 서로 다른 결론이 함께 서 있습니다: 타고난 배우자 자리 자체가 흔들리는 구조다. / 지금의 큰 흐름이 원국 일주 천간합와 맞물려 풀린다. / 부처에 화록이 들어와 있어 들어오는 몫은 있으나, 끌고 가는 힘까지는 아니라 크게 벌이기는 쉽지 않습니다. / 같이 사는 난도과 잡았을 때 남는 쪽은 다르게 봅니다. 같이 사는 난도은 막힙니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 지금 시점은 다르게 봅니다. 같이 사는 난도은 막힙니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 자리·직업은 다르게 봅니다. 같이 사는 난도은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / 같이 사는 난도과 전반은 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / 서로 다른 자리(원국 일주 천간합 / 부처궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 열려 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다. / 같이 사는 난도과 전반은 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / 자리·직업과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / 전반과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. / 원국 일주 천간합은(는) 큰 흐름에서 열려 있는 자리인데, 가까운 시기에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다. / 같이 사는 난도과 전반은 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다. 어느 한쪽으로 정하지 않겠습니다.
**전제 수** = 30 · **명제 수** = 36 · **후보(runtime)** = 18

#### DIRECTION_VS_EXECUTION — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일주 천간합 (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = COMPOUND/RESTRICTED(TIMING)
- **DERIVED_PROPOSITION** = 원국 일주 천간합은(는) 큰 흐름에서 열려 있는 자리인데, 가까운 시기에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONNECTS·원국 일주 천간합` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→결론 변함 / remove CONSTRAINS·원국 년주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 년주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 년주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### RECURRING_FRICTION_CAUSE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove CONNECTS·원국 일주 천간합→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:HOUR`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 잡았을 때 남는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/UNFAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 잡았을 때 남는 쪽은 다르게 봅니다. 같이 사는 난도은 막힙니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 시주 반합, CONNECTS·원국 시주 육합, CONNECTS·원국 시주 반합, CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음 / remove CONNECTS·원국 시주 육합→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 육합→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→없음 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 시주 육합→없음 / retarget MYUNGRI:원국 시주 육합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 일주 천간합→없음 / retarget MYUNGRI:원국 일주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일지(배우자·자기 자리)(기대 ABSENT, 실제 DIRECTION); remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 육합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 육합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_STANDOFF — `COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리)·부처궁 (`COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)·부처궁에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), SUPPORTS·부처궁
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove SUPPORTS·부처궁→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse SUPPORTS→OPPOSES·부처궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 부딪힘 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/UNFAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), SUPPORTS·형제궁, CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove SUPPORTS·형제궁→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse SUPPORTS→OPPOSES·형제궁→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→없음 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove ZIWEI:형제궁→변함 / retarget ZIWEI:형제궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→없음 / retarget MYUNGRI:원국 일주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일지(배우자·자기 자리)(기대 ABSENT, 실제 DIRECTION); remove MYUNGRI:원국 일주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 지금 시점 (`COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/UNFAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 지금 시점은 다르게 봅니다. 같이 사는 난도은 막힙니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), ENABLES·기문 국, CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove ENABLES·기문 국→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse ENABLES→CONSTRAINS·기문 국→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→없음 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove QIMEN:기문 국→변함 / retarget QIMEN:기문 국→변함 / rescope QIMEN:PRESENT_MOMENT→NATAL→없음 / redirect QIMEN:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→없음 / retarget MYUNGRI:원국 일주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일지(배우자·자기 자리)(기대 ABSENT, 실제 DIRECTION); remove MYUNGRI:원국 일주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:MONTH`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 자리·직업 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 자리·직업은 다르게 봅니다. 같이 사는 난도은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, CONSTRAINS·원국 월주 해
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove CONSTRAINS·원국 월주 해→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 월주 해→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 월주 해→변함 / retarget MYUNGRI:원국 월주 해→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:YEAR`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 전반은 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove CONSTRAINS·원국 년주 자형→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 NONE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_TIMING_SPLIT — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일주 천간합 (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = COMPOUND/RESTRICTED(TIMING)
- **DERIVED_PROPOSITION** = 원국 일주 천간합은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→없음 / retarget MYUNGRI:원국 일주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: rescope MYUNGRI:DAEWOON→NATAL(기대 ABSENT, 실제 NONE); remove MYUNGRI:원국 일주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 천간합(기대 ABSENT, 실제 NONE); rescope MYUNGRI:SEWOON→NATAL(기대 ABSENT, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_REINFORCEMENT — `COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일주 천간합·부처궁 (`COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = DIRECTIONAL/FAVORABLE
- **DERIVED_PROPOSITION** = 서로 다른 자리(원국 일주 천간합 / 부처궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 열려 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, SUPPORTS·부처궁
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove SUPPORTS·부처궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse SUPPORTS→OPPOSES·부처궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 전반은 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, CONSTRAINS·명궁
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:SPOUSE_PALACE`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 자리·직업과 같이 사는 난도 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:SPOUSE_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 자리·직업과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 월주 해, SUPPORTS·부처궁
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 월주 해→변화 없음 / remove SUPPORTS·부처궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 월주 해→변화 없음 / reverse SUPPORTS→OPPOSES·부처궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 해→변함 / retarget MYUNGRI:원국 월주 해→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:SPOUSE_PALACE`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 전반과 같이 사는 난도 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:SPOUSE_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 같이 사는 난도는 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, SUPPORTS·부처궁, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→변화 없음 / remove SUPPORTS·부처궁→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse SUPPORTS→OPPOSES·부처궁→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_CONTRADICTION_RESOLVED — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일주 천간합 (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = DIRECTIONAL/RESTRICTED(TIMING)
- **DERIVED_PROPOSITION** = 원국 일주 천간합은(는) 큰 흐름에서 열려 있는 자리인데, 가까운 시기에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형, SUPPORTS·부처궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음 / remove SUPPORTS·부처궁→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음 / reverse SUPPORTS→OPPOSES·부처궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→없음 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주 천간합(기대 ABSENT, 실제 DIRECTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:SELF_PALACE|PALACE:SPOUSE_PALACE`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:SELF_PALACE|PALACE:SPOUSE_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 같이 사는 난도과 전반은 다르게 봅니다. 같이 사는 난도은 열립니다, 전반은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = SUPPORTS·부처궁, CONSTRAINS·명궁
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·부처궁→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·부처궁→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [관계] B · 재회

**QUESTION** = 재회 가능성이 있을까요?
**INTENT** = PROBABILITY · **ASKED_AXIS** = GENERAL · **VERDICT** = INSUFFICIENT_EVIDENCE
**결론** = 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
**전제 수** = 27 · **명제 수** = 22 · **후보(runtime)** = 6

#### CONTESTED_SHARE — `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = B · **TARGET** = 벌이는 몫과 남는 몫 (`COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
- **INPUT_PREMISES** = SUPPORTS·원국 재물, OPPOSES·지금의 큰 흐름의 겁재, OPPOSES·올해 흐름의 겁재
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·원국 재물→결론 변함 / remove OPPOSES·지금의 큰 흐름의 겁재→결론 변함 / remove OPPOSES·올해 흐름의 겁재→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·원국 재물→결론 변함 / reverse OPPOSES→SUPPORTS·지금의 큰 흐름의 겁재→변화 없음 / reverse OPPOSES→SUPPORTS·올해 흐름의 겁재→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `SUPPORTS·원국 재물` → **MATERIAL**
    - `OPPOSES·지금의 큰 흐름의 겁재` → **MATERIAL**
    - `OPPOSES·올해 흐름의 겁재` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:MONTH`

- **AXIS** = CAREER · **SUBJECT** = B · **TARGET** = 원국 월주 해 (`NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 월주 해에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 월주 해, CONSTRAINS·원국 월주 해
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 월주 해→결론 변함 / remove CONSTRAINS·원국 월주 해→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 월주 해→결론 변함 / reverse CONSTRAINS→ENABLES·원국 월주 해→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 월주 해` → **MATERIAL**
    - `CONSTRAINS·원국 월주 해` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:HOUR`

- **AXIS** = OUTCOME · **SUBJECT** = B · **TARGET** = 원국 시주 파 (`NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 시주 파에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 시주 파, CONSTRAINS·원국 시주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 시주 파→결론 변함 / remove CONSTRAINS·원국 시주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 시주 파→결론 변함 / reverse CONSTRAINS→ENABLES·원국 시주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 시주 파` → **MATERIAL**
    - `CONSTRAINS·원국 시주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### INFLOW_VS_RETENTION — `COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.`

- **AXIS** = MONEY_INFLOW · **SUBJECT** = B · **TARGET** = 유입과 보유 (`COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.
- **INPUT_PREMISES** = ACTIVATES·이 시기 흐름의 재물
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove ACTIVATES·이 시기 흐름의 재물→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse ACTIVATES→ABSENT·이 시기 흐름의 재물→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `ACTIVATES·이 시기 흐름의 재물` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:MONTH`

- **AXIS** = CAREER · **SUBJECT** = B · **TARGET** = 원국 월주 천간합 (`NATAL_SEAT:MONTH`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 월주 천간합에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = CONNECTS·원국 월주 천간합, CONSTRAINS·원국 월주 해
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 월주 천간합→변화 없음 / remove CONSTRAINS·원국 월주 해→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 월주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 월주 해→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 월주 천간합→변함 / retarget MYUNGRI:원국 월주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 월주 해→변함 / retarget MYUNGRI:원국 월주 해→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:HOUR`

- **AXIS** = OUTCOME · **SUBJECT** = B · **TARGET** = 원국 시주 천간합 (`NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 시주 천간합에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 천간합, CONSTRAINS·원국 시주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 천간합→변화 없음 / remove CONSTRAINS·원국 시주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 시주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 천간합→변함 / retarget MYUNGRI:원국 시주 천간합→변함 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 시주 파→변함 / retarget MYUNGRI:원국 시주 파→변함 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [시점] A · 지금 계약

**QUESTION** = 지금 계약해도 될까요?
**INTENT** = DECISION · **ASKED_AXIS** = DECISION · **VERDICT** = CONDITIONAL_AGAINST
**결론** = 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 그리고 같이 사는 난도과 결정은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 잡았을 때 남는 쪽과 결정은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 결정과 자리·직업은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다. 그리고 결정과 지금 시점은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
**전제 수** = 35 · **명제 수** = 27 · **후보(runtime)** = 8

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→결론 변함 / remove CONSTRAINS·원국 년주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 년주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 년주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### RECURRING_FRICTION_CAUSE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`

- **AXIS** = DECISION · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 결정 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 같이 사는 난도과 결정은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, CONSTRAINS·명궁
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:SELF_PALACE`

- **AXIS** = DECISION · **SUBJECT** = A · **TARGET** = 잡았을 때 남는 쪽과 결정 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 잡았을 때 남는 쪽과 결정은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 반합, CONSTRAINS·명궁, CONNECTS·원국 시주 육합, CONNECTS·원국 시주 반합
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 반합→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove CONNECTS·원국 시주 육합→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 육합→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 시주 육합→없음 / retarget MYUNGRI:원국 시주 육합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 육합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 육합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE`

- **AXIS** = DECISION · **SUBJECT** = A · **TARGET** = 결정과 자리·직업 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 결정과 자리·직업은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·명궁, SUPPORTS·관록궁
- **COUNTER_PREMISES** = SUPPORTS·명궁, OPPOSES·관록궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·관록궁→변화 없음 / remove SUPPORTS·명궁→변화 없음 / remove OPPOSES·관록궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·관록궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음 / reverse OPPOSES→SUPPORTS·관록궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:관록궁→변함 / retarget ZIWEI:관록궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:SELF_PALACE`

- **AXIS** = DECISION · **SUBJECT** = A · **TARGET** = 결정과 지금 시점 (`COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 결정과 지금 시점은 다르게 봅니다. 결정은 범위를 좁혀야 합니다, 지금 시점은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·명궁, ENABLES·기문 국
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·명궁→변화 없음 / remove ENABLES·기문 국→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse ENABLES→CONSTRAINS·기문 국→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove QIMEN:기문 국→변함 / retarget QIMEN:기문 국→변함 / rescope QIMEN:PRESENT_MOMENT→NATAL→없음 / redirect QIMEN:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [서술형(§12)] A · 성격

**QUESTION** = 제 타고난 성격이 어떤가요?
**INTENT** = DESCRIPTIVE · **ASKED_AXIS** = GENERAL · **VERDICT** = INSUFFICIENT_EVIDENCE
**결론** = 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
**전제 수** = 30 · **명제 수** = 30 · **후보(runtime)** = 13

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형 (`NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 년주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→결론 변함 / remove CONSTRAINS·원국 년주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 년주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 년주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 년주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### RECURRING_FRICTION_CAUSE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), DESTABILIZES·원국 일주 천간충, DESTABILIZES·원국 일주 충, DESTABILIZES·원국 일주 형
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→결론 변함 / remove DESTABILIZES·원국 일주 천간충→변화 없음 / remove DESTABILIZES·원국 일주 충→변화 없음 / remove DESTABILIZES·원국 일주 형→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→결론 변함 / reverse DESTABILIZES→CONNECTS·원국 일주 천간충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 충→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 일주 형→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `DESTABILIZES·원국 일지(배우자·자기 자리)` → **MATERIAL**
    - `DESTABILIZES·원국 일주 천간충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 충` → **REDUNDANT**
    - `DESTABILIZES·원국 일주 형` → **REDUNDANT**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_STANDOFF — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = A · **TARGET** = 원국 일지(배우자·자기 자리) (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 일지(배우자·자기 자리), CONNECTS·원국 일주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 일지(배우자·자기 자리)→변화 없음 / remove CONNECTS·원국 일주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리)→변화 없음 / reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일지(배우자·자기 자리)→변함 / retarget MYUNGRI:원국 일지(배우자·자기 자리)→변함 / rescope MYUNGRI:NATAL→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = COMPOUND/RESTRICTED
- **DERIVED_PROPOSITION** = 같이 사는 난도과 전반은 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove CONSTRAINS·원국 년주 자형→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 SCOPE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 같이 사는 난도과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 같이 사는 난도과 전반은 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 일주 천간합, CONSTRAINS·명궁
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 일주 천간합→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 일주 천간합→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 일주 천간합→변함 / retarget MYUNGRI:원국 일주 천간합→변함 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 잡았을 때 남는 쪽과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = COMPOUND/RESTRICTED
- **DERIVED_PROPOSITION** = 잡았을 때 남는 쪽과 전반은 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 반합, CONSTRAINS·원국 년주 자형, CONSTRAINS·원국 년주 파, CONNECTS·원국 시주 육합, CONNECTS·원국 시주 반합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 반합→변화 없음 / remove CONSTRAINS·원국 년주 자형→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음 / remove CONNECTS·원국 시주 육합→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 육합→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 반합→변함 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove MYUNGRI:원국 시주 육합→없음 / retarget MYUNGRI:원국 시주 육합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 ASSERTION); remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 SCOPE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 SCOPE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 육합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 육합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:SELF_PALACE`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 잡았을 때 남는 쪽과 전반 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 잡았을 때 남는 쪽과 전반은 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 시주 반합, CONSTRAINS·명궁, CONNECTS·원국 시주 육합, CONNECTS·원국 시주 반합
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 시주 반합→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove CONNECTS·원국 시주 육합→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 육합→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 시주 육합→없음 / retarget MYUNGRI:원국 시주 육합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 시주 반합→없음 / retarget MYUNGRI:원국 시주 반합→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 육합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 육합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 시주 반합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주 반합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_REINFORCEMENT — `COMPOSITE:RIVAL:NATAL_SEAT:YEAR|PALACE:SELF_PALACE`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 원국 년주 자형·명궁 (`COMPOSITE:RIVAL:NATAL_SEAT:YEAR|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = DIRECTIONAL/RESTRICTED
- **DERIVED_PROPOSITION** = 서로 다른 자리(원국 년주 자형 / 명궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 범위를 좁혀야 하는 자리입니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, CONSTRAINS·명궁, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→변화 없음 / remove CONSTRAINS·명궁→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 자형→변함 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 ASSERTION); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:CAREER_PALACE`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 전반과 자리·직업 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:CAREER_PALACE`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = COMPOUND/RESTRICTED
- **DERIVED_PROPOSITION** = 전반과 자리·직업은 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, SUPPORTS·관록궁, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = OPPOSES·관록궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→변화 없음 / remove SUPPORTS·관록궁→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음 / remove OPPOSES·관록궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse SUPPORTS→OPPOSES·관록궁→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음 / reverse OPPOSES→SUPPORTS·관록궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove ZIWEI:관록궁→변함 / retarget ZIWEI:관록궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 SCOPE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 SCOPE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:SPOUSE_PALACE`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 전반과 같이 사는 난도 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:YEAR|PALACE:SPOUSE_PALACE`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = COMPOUND/RESTRICTED
- **DERIVED_PROPOSITION** = 전반과 같이 사는 난도는 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·원국 년주 자형, SUPPORTS·부처궁, CONSTRAINS·원국 년주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 년주 자형→변화 없음 / remove SUPPORTS·부처궁→변화 없음 / remove CONSTRAINS·원국 년주 파→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 년주 자형→변화 없음 / reverse SUPPORTS→OPPOSES·부처궁→변화 없음 / reverse CONSTRAINS→ENABLES·원국 년주 파→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 자형→없음 / retarget MYUNGRI:원국 년주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→변함 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 년주 파→없음 / retarget MYUNGRI:원국 년주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 자형(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 자형(기대 ABSENT, 실제 SCOPE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 SCOPE); remove MYUNGRI:원국 년주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 전반과 자리·직업 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 전반과 자리·직업은 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·명궁, SUPPORTS·관록궁
- **COUNTER_PREMISES** = SUPPORTS·명궁, OPPOSES·관록궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·관록궁→변화 없음 / remove SUPPORTS·명궁→변화 없음 / remove OPPOSES·관록궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·관록궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음 / reverse OPPOSES→SUPPORTS·관록궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:관록궁→변함 / retarget ZIWEI:관록궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:PALACE:SELF_PALACE|PALACE:SPOUSE_PALACE`

- **AXIS** = GENERAL · **SUBJECT** = A · **TARGET** = 전반과 같이 사는 난도 (`COMPOSITE:DIFFERENT_DOMAIN:PALACE:SELF_PALACE|PALACE:SPOUSE_PALACE`)
- **TEMPORAL_SCOPE** = NATAL · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 전반과 같이 사는 난도는 다르게 봅니다. 전반은 범위를 좁혀야 합니다, 같이 사는 난도은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONSTRAINS·명궁, SUPPORTS·부처궁
- **COUNTER_PREMISES** = SUPPORTS·명궁
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·명궁→변화 없음 / remove SUPPORTS·부처궁→변화 없음 / remove SUPPORTS·명궁→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·명궁→변화 없음 / reverse SUPPORTS→OPPOSES·부처궁→변화 없음 / reverse SUPPORTS→OPPOSES·명궁→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove ZIWEI:명궁→변함 / retarget ZIWEI:명궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:RESTRICTED→FAVORABLE→변함 / remove ZIWEI:부처궁→변함 / retarget ZIWEI:부처궁→변함 / rescope ZIWEI:NATAL→NATAL→없음 / redirect ZIWEI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---

## [원인형(§22)] C · 왜 부딪히나

**QUESTION** = 왜 자꾸 부딪힐까요?
**INTENT** = CAUSE_WHY · **ASKED_AXIS** = GENERAL · **VERDICT** = STRUCTURAL_ANSWER
**결론** = 원국 일주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
**전제 수** = 26 · **명제 수** = 21 · **후보(runtime)** = 7

#### CONTESTED_SHARE — `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`

- **AXIS** = MONEY_RETENTION · **SUBJECT** = C · **TARGET** = 벌이는 몫과 남는 몫 (`COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = COMPOUND/RESTRICTED(SCOPE)
- **DERIVED_PROPOSITION** = 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.
- **INPUT_PREMISES** = SUPPORTS·원국 재물, OPPOSES·이 시기 흐름의 겁재
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove SUPPORTS·원국 재물→결론 변함 / remove OPPOSES·이 시기 흐름의 겁재→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse SUPPORTS→OPPOSES·원국 재물→결론 변함 / reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재→변화 없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `SUPPORTS·원국 재물` → **MATERIAL**
    - `OPPOSES·이 시기 흐름의 겁재` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CONVERGENT_SEAT_PRESSURE — `NATAL_SEAT:DAY`

- **AXIS** = RELATION_STABILITY · **SUBJECT** = C · **TARGET** = 원국 일주 자형 (`NATAL_SEAT:DAY`)
- **TEMPORAL_SCOPE** = SEWOON · **TYPE** = CAUSAL/NONE
- **DERIVED_PROPOSITION** = 원국 일주 자형에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **INPUT_PREMISES** = CONSTRAINS·원국 일주 자형, CONSTRAINS·원국 일주 파
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONSTRAINS·원국 일주 자형→결론 변함 / remove CONSTRAINS·원국 일주 파→결론 변함
- **PREMISE_REVERSAL_TESTS** = reverse CONSTRAINS→ENABLES·원국 일주 자형→결론 변함 / reverse CONSTRAINS→ENABLES·원국 일주 파→결론 변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함
- **PREMISE_MATERIALITY**:
    - `CONSTRAINS·원국 일주 자형` → **MATERIAL**
    - `CONSTRAINS·원국 일주 파` → **MATERIAL**
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = C · **TARGET** = 전반과 같이 사는 난도 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 같이 사는 난도는 다르게 봅니다. 전반은 열립니다, 같이 사는 난도은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 년주 반합, CONSTRAINS·원국 일주 자형, CONSTRAINS·원국 일주 파, CONNECTS·원국 년주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 년주 반합→변화 없음 / remove CONSTRAINS·원국 일주 자형→변화 없음 / remove CONSTRAINS·원국 일주 파→변화 없음 / remove CONNECTS·원국 년주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 년주 반합→변화 없음 / reverse CONSTRAINS→ENABLES·원국 일주 자형→변화 없음 / reverse CONSTRAINS→ENABLES·원국 일주 파→변화 없음 / reverse CONNECTS→SEPARATES·원국 년주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 반합→없음 / retarget MYUNGRI:원국 년주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:원국 일주 자형→없음 / retarget MYUNGRI:원국 일주 자형→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove MYUNGRI:원국 일주 파→없음 / retarget MYUNGRI:원국 일주 파→없음 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→없음 / remove MYUNGRI:원국 년주 천간합→없음 / retarget MYUNGRI:원국 년주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 반합(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 반합(기대 ABSENT, 실제 SCOPE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 SCOPE); remove MYUNGRI:원국 일주 자형(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 자형(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주 파(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주 파(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 년주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:LUCK_LAYER:WOLWOON:RIVAL|NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = C · **TARGET** = 전반과 서로 미치는 영향 (`COMPOSITE:DIFFERENT_DOMAIN:LUCK_LAYER:WOLWOON:RIVAL|NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 서로 미치는 영향은 다르게 봅니다. 전반은 열립니다, 서로 미치는 영향은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 년주 반합, OPPOSES·이 시기 흐름의 겁재, CONNECTS·원국 년주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 년주 반합→변화 없음 / remove OPPOSES·이 시기 흐름의 겁재→변화 없음 / remove CONNECTS·원국 년주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 년주 반합→변화 없음 / reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재→변화 없음 / reverse CONNECTS→SEPARATES·원국 년주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 반합→없음 / retarget MYUNGRI:원국 년주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:이 시기 흐름의 겁재→변함 / retarget MYUNGRI:이 시기 흐름의 겁재→변함 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 년주 천간합→없음 / retarget MYUNGRI:원국 년주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 반합(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 반합(기대 ABSENT, 실제 SCOPE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 SCOPE); remove MYUNGRI:원국 년주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = C · **TARGET** = 전반과 잡았을 때 남는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 잡았을 때 남는 쪽은 다르게 봅니다. 전반은 열립니다, 잡았을 때 남는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 년주 반합, DESTABILIZES·원국 시주 천간충, CONNECTS·원국 년주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 년주 반합→변화 없음 / remove DESTABILIZES·원국 시주 천간충→변화 없음 / remove CONNECTS·원국 년주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 년주 반합→변화 없음 / reverse DESTABILIZES→CONNECTS·원국 시주 천간충→변화 없음 / reverse CONNECTS→SEPARATES·원국 년주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 반합→없음 / retarget MYUNGRI:원국 년주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함 / remove MYUNGRI:원국 시주 천간충→변함 / retarget MYUNGRI:원국 시주 천간충→변함 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 년주 천간합→없음 / retarget MYUNGRI:원국 년주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 반합(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 반합(기대 ABSENT, 실제 SCOPE); remove MYUNGRI:원국 년주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_AXIS_COMPOUND — `COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|NATAL_SEAT:YEAR`

- **AXIS** = GENERAL · **SUBJECT** = C · **TARGET** = 전반과 돈이 남는 쪽 (`COMPOSITE:DIFFERENT_DOMAIN:COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|NATAL_SEAT:YEAR`)
- **TEMPORAL_SCOPE** = DAEWOON · **TYPE** = COMPOUND/FAVORABLE
- **DERIVED_PROPOSITION** = 전반과 돈이 남는 쪽은 다르게 봅니다. 전반은 열립니다, 돈이 남는 쪽은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.
- **INPUT_PREMISES** = CONNECTS·원국 년주 반합, SUPPORTS·원국 재물, OPPOSES·이 시기 흐름의 겁재, CONNECTS·원국 년주 천간합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove CONNECTS·원국 년주 반합→변화 없음 / remove SUPPORTS·원국 재물→변화 없음 / remove OPPOSES·이 시기 흐름의 겁재→변화 없음 / remove CONNECTS·원국 년주 천간합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse CONNECTS→SEPARATES·원국 년주 반합→변화 없음 / reverse SUPPORTS→OPPOSES·원국 재물→변화 없음 / reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재→변화 없음 / reverse CONNECTS→SEPARATES·원국 년주 천간합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 년주 반합→없음 / retarget MYUNGRI:원국 년주 반합→없음 / rescope MYUNGRI:DAEWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음 / remove MYUNGRI:벌이는 몫과 남는 몫→변함 / retarget MYUNGRI:벌이는 몫과 남는 몫→변함 / rescope MYUNGRI:WOLWOON→NATAL→없음 / redirect MYUNGRI:RESTRICTED→FAVORABLE→변함 / remove MYUNGRI:원국 년주 천간합→없음 / retarget MYUNGRI:원국 년주 천간합→없음 / rescope MYUNGRI:SEWOON→NATAL→없음 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→없음
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 년주 반합(기대 SEMANTIC, 실제 SCOPE); retarget MYUNGRI:원국 년주 반합(기대 ABSENT, 실제 SCOPE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 SCOPE); remove MYUNGRI:원국 년주 천간합(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 년주 천간합(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE)
- **INDEPENDENT_CLASSIFICATION** = **MULTI_FACT_SUMMARY**

#### CROSS_STANDOFF — `NATAL_SEAT:HOUR`

- **AXIS** = OUTCOME · **SUBJECT** = C · **TARGET** = 원국 시주 천간충 (`NATAL_SEAT:HOUR`)
- **TEMPORAL_SCOPE** = WOLWOON · **TYPE** = STRUCTURAL/NONE
- **DERIVED_PROPOSITION** = 원국 시주 천간충에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.
- **INPUT_PREMISES** = DESTABILIZES·원국 시주 천간충, CONNECTS·원국 시주 반합
- **COUNTER_PREMISES** = (없음)
- **PREMISE_REMOVAL_TESTS** = remove DESTABILIZES·원국 시주 천간충→변화 없음 / remove CONNECTS·원국 시주 반합→변화 없음
- **PREMISE_REVERSAL_TESTS** = reverse DESTABILIZES→CONNECTS·원국 시주 천간충→변화 없음 / reverse CONNECTS→SEPARATES·원국 시주 반합→변화 없음
- **TARGET/TIME_MUTATION_TESTS** = remove MYUNGRI:원국 시주 천간충→변함 / retarget MYUNGRI:원국 시주 천간충→변함 / rescope MYUNGRI:WOLWOON→NATAL→변함 / redirect MYUNGRI:UNFAVORABLE→FAVORABLE→변함 / remove MYUNGRI:원국 시주 반합→변함 / retarget MYUNGRI:원국 시주 반합→변함 / rescope MYUNGRI:WOLWOON→NATAL→변함 / redirect MYUNGRI:FAVORABLE→UNFAVORABLE→변함
- **EXPECTED_DELTA** = 필요한 전제를 지우거나 뒤집으면 이 결론이 사라지거나 진술이 바뀐다
- **ACTUAL_DELTA** = 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함
- **INDEPENDENT_CLASSIFICATION** = **REAL_SYNTHETIC_INFERENCE**

---
