# DIVINATION V4D — KERNEL INTEGRITY QA PACK

> 자동 생성 문서입니다. `npx jest generateV4dKernelQaPack` 으로 재생성됩니다.
> 여기의 분류는 **엔진이 스스로 붙인 라벨이 아닙니다.** 후보마다 그 후보의 입력을 지우고·뒤집고·
> 대상을 바꾸고·시기를 옮긴 뒤 다시 유도해서, **그 결론이 실제로 움직였는지**를 관찰한 결과입니다.

## 이 팩이 V4B 팩과 다른 점

| | V4B | V4C |
|---|---|---|
| 후보 모집단 | 팩이 자체적으로 만든 목록 | **런타임의 `candidatePropositions()` 하나** (집합 동일성 검증) |
| 결론 동일성 | rule·axis·target | rule·subject·axis·target·conclusionType·**temporalScope** |
| 인증 기준 | "아무 변형이나 뭔가 바꿨는가" | **변형마다 기대 변화를 선언**하고, 필수 변형이 모두 성립해야 함 |
| 교차 결론 공격 | 부모 삭제·대상·시기 | + **부모 방향 반전**(§18) |
| 무효 변형 | 그대로 집계 | **무효 변형은 제외**(§19) |

## 총계

| 항목 | 값 |
|---|---|
| 시나리오 | 14 / 14 |
| RUNTIME_CANDIDATES (런타임이 지명) | 87 |
| CERTIFIED_RUNTIME_CANDIDATES (인증됨) | 64 |
| REAL_SYNTHETIC_INFERENCE | 64 |
| MULTI_FACT_SUMMARY | 23 |
| UNSUPPORTED_INFERENCE | 0 |
| UNCLASSIFIED_RUNTIME_CANDIDATES | 0 (집합 동일성으로 보장) |

### 런타임 스크리닝 총계 (참고 — 인증이 아님)

| 항목 | 값 |
|---|---|
| CANDIDATE_SYNTHESIS | 87 |
| MULTI_FACT_SUMMARY | 0 |
| STATIC_RULE_OUTPUT | 236 |
| UNSUPPORTED_INFERENCE | 0 |

### 공격 총계

| 공격 | 실행 | 결론을 바꿈 |
|---|---|---|
| `REMOVE_PREMISE` | 288 | 128 |
| `REVERSE_PREMISE` | 236 | 65 |
| `REMOVE_PARENT` | 100 | 76 |
| `RETARGET_PARENT` | 98 | 63 |
| `RESCOPE_PARENT` | 98 | 35 |
| `REDIRECT_PARENT` | 98 | 74 |

## 시나리오별 후보

### 재물

**A · 유입** — "올해 돈을 벌 수 있을까요?" → `INSUFFICIENT_EVIDENCE`

> 돈이 들어오는 쪽에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_17+mp_19+mp_23+mp_8` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_23`, `mp_17`, `mp_19`, `mp_8` |
| SUPPORTING_PARENTS | `mp_23`, `mp_17`, `mp_19`, `mp_8` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_23`, `p:mp_17`, `p:mp_19`, `p:mp_8` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|PROBABILITY|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_18+mp_22` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_22`, `mp_18` |
| SUPPORTING_PARENTS | `mp_22`, `mp_18` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_22`, `p:mp_18` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|A|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_17+mp_19+mp_23+mp_8` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_8` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_17`, `mp_19`, `mp_23` |
| SUPPORTING_PARENTS | `mp_8`, `mp_17`, `mp_19`, `mp_23` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_8`, `p:mp_17`, `p:mp_19`, `p:mp_23` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|PROBABILITY|MONEY_INFLOW|PALACE:WEALTH_PALACE|DIRECTIONAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_28+p:zp_29` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | MONEY_INFLOW |
| TARGET | `PALACE:WEALTH_PALACE` (PALACE) — 재백궁 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | OBSTRUCTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `zp_29` |
| OPPOSING_PARENTS | `zc_30`, `mp_28` |
| DERIVED_FROM | `p:zp_29`, `p:mp_28` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:명리 MONEY_INFLOW 판단(기대 ABSENT, 실제 NONE) |

> 재백에 화기가 들어와, 이 부분은 수월하게 풀리지 않고 막히기 쉽습니다. 반대 근거도 있으나, 한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명리 MONEY_INFLOW 판단 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:재백궁 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:명리 MONEY_INFLOW 판단 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명리 MONEY_INFLOW 판단 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget ZIWEI:재백궁 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:명리 MONEY_INFLOW 판단 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|MONEY_INFLOW|COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_29+p:zp_31` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | MONEY_INFLOW |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE` (COMPOSITE) — 돈이 들어오는 것과 남는 것 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `zp_29`, `zp_31` |
| OPPOSING_PARENTS | `zc_30` |
| DERIVED_FROM | `p:zp_29`, `p:zp_31` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:재백궁 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:전택궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget ZIWEI:재백궁 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:전택궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


**A · 보유** — "저축이 남을까요?" → `CONDITIONAL_FOR`

> 돈이 남는 쪽에 대해서는 서로 다른 근거 5가지가 모두 같은 쪽을 가리킵니다. 열려 있는 자리로 보셔도 됩니다. 다만 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 서 있는 상태입니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|OUTCOME|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_41+mp_50+mp_52+mp_56` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_56`, `mp_50`, `mp_52`, `mp_41` |
| SUPPORTING_PARENTS | `mp_56`, `mp_50`, `mp_52`, `mp_41` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_56`, `p:mp_50`, `p:mp_52`, `p:mp_41` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|OUTCOME|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_51+mp_55` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_55`, `mp_51` |
| SUPPORTING_PARENTS | `mp_55`, `mp_51` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_55`, `p:mp_51` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|A|OUTCOME|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_41+mp_50+mp_52+mp_56` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_41` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_50`, `mp_52`, `mp_56` |
| SUPPORTING_PARENTS | `mp_41`, `mp_50`, `mp_52`, `mp_56` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_41`, `p:mp_50`, `p:mp_52`, `p:mp_56` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_REINFORCEMENT|CROSS|A|OUTCOME|MONEY_RETENTION|COMPOSITE:RIVAL:ADAPTED_READING:MYUNGRI:MONEY_RETENTION|PALACE:PROPERTY_PALACE|DIRECTIONAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_REINFORCEMENT:p:mp_61+p:zp_62` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL:ADAPTED_READING:MYUNGRI:MONEY_RETENTION|PALACE:PROPERTY_PALACE` (COMPOSITE) — 명리 MONEY_RETENTION 판단·전택궁 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_REINFORCEMENT` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | OPENING |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_61`, `zp_62` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_61`, `p:zp_62` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 서로 다른 자리(명리 MONEY_RETENTION 판단 / 전택궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 열려 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·명리 MONEY_RETENTION 판단 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:명리 MONEY_RETENTION 판단 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:전택궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명리 MONEY_RETENTION 판단 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:명리 MONEY_RETENTION 판단 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:전택궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|OUTCOME|MONEY_RETENTION|COMPOSITE:INFLOW_VS_RETENTION:ADAPTED_READING:MYUNGRI:MONEY_RETENTION|PALACE:WEALTH_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_61+p:zp_63` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:ADAPTED_READING:MYUNGRI:MONEY_RETENTION|PALACE:WEALTH_PALACE` (COMPOSITE) — 돈이 들어오는 것과 남는 것 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_61`, `zp_63` |
| OPPOSING_PARENTS | `zc_64` |
| DERIVED_FROM | `p:mp_61`, `p:zp_63` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·명리 MONEY_RETENTION 판단 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:명리 MONEY_RETENTION 판단 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:재백궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명리 MONEY_RETENTION 판단 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:명리 MONEY_RETENTION 판단 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:재백궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|OUTCOME|MONEY_RETENTION|COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_62+p:zp_63` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE` (COMPOSITE) — 돈이 들어오는 것과 남는 것 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `zp_62`, `zp_63` |
| OPPOSING_PARENTS | `zc_64` |
| DERIVED_FROM | `p:zp_62`, `p:zp_63` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:전택궁 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:재백궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·재백궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget ZIWEI:전택궁 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:재백궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


**B · 유입** — "올해 돈을 벌 수 있을까요?" → `CONDITIONAL_AGAINST`

> 돈이 들어오는 쪽에 대해서는 서로 다른 근거 2가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.

#### `CONTESTED_SHARE|MYUNGRI|B|PROBABILITY|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_67+mp_79+mp_84` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_79`, `mp_84` · 원국의 재물 자리: `mp_67` |
| SUPPORTING_PARENTS | `mp_67`, `mp_79`, `mp_84` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_79`, `p:mp_84` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 몫을 나누는 기운 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 원국의 재물 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·지금의 큰 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·올해 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·지금의 큰 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·올해 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|B|PROBABILITY|CAREER|NATAL_SEAT:MONTH|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:CAREER:mp_81+mp_86` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_86`, `mp_81` |
| SUPPORTING_PARENTS | `mp_86`, `mp_81` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_86`, `p:mp_81` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|B|PROBABILITY|OUTCOME|NATAL_SEAT:HOUR|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_82+mp_87` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_87`, `mp_82` |
| SUPPORTING_PARENTS | `mp_87`, `mp_82` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_87`, `p:mp_82` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `INFLOW_VS_RETENTION|MYUNGRI|B|PROBABILITY|MONEY_INFLOW|COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:INFLOW_VS_RETENTION:MONEY_INFLOW:mp_88^d:CONTESTED_SHARE:MONEY_RETENTION:mp_67+mp_79+mp_84` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_INFLOW |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 유입과 보유 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `INFLOW_VS_RETENTION` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_88` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_67+mp_79+mp_84`, `p:mp_88` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ACTIVATES·이 시기 흐름의 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove parent CONTESTED_SHARE·벌이는 몫과 남는 몫 (전제 3건) | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse ACTIVATES→ABSENT·이 시기 흐름의 재물 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_STANDOFF|CROSS|B|PROBABILITY|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_80+p:mp_81` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_80`, `mp_81` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_80`, `p:mp_81` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


#### `CROSS_STANDOFF|CROSS|B|PROBABILITY|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_85+p:mp_87` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_85`, `mp_87` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_85`, `p:mp_87` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


**D · 보유** — "저축이 남을까요?" → `FOR`

> 서로 다른 자리(명리 MONEY_RETENTION 판단 / 전택궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 열려 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|D|OUTCOME|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_119+mp_122` |
| SUBJECT | D |
| INTENT | OUTCOME |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_122`, `mp_119` |
| SUPPORTING_PARENTS | `mp_122`, `mp_119` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_122`, `p:mp_119` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_STANDOFF|CROSS|D|OUTCOME|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_114+p:mp_116` |
| SUBJECT | D |
| INTENT | OUTCOME |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_114`, `mp_116` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_114`, `p:mp_116` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


#### `CROSS_REINFORCEMENT|CROSS|D|OUTCOME|MONEY_RETENTION|COMPOSITE:RIVAL:ADAPTED_READING:MYUNGRI:MONEY_RETENTION|PALACE:PROPERTY_PALACE|DIRECTIONAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_REINFORCEMENT:p:mp_126+p:zp_127` |
| SUBJECT | D |
| INTENT | OUTCOME |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL:ADAPTED_READING:MYUNGRI:MONEY_RETENTION|PALACE:PROPERTY_PALACE` (COMPOSITE) — 명리 MONEY_RETENTION 판단·전택궁 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_REINFORCEMENT` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | OPENING |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_126`, `zp_127` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_126`, `p:zp_127` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 서로 다른 자리(명리 MONEY_RETENTION 판단 / 전택궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 열려 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·명리 MONEY_RETENTION 판단 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:명리 MONEY_RETENTION 판단 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:전택궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명리 MONEY_RETENTION 판단 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·전택궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:명리 MONEY_RETENTION 판단 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:전택궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


### 사업·기회

**A · 확장** — "사업을 더 키워도 될까요?" → `INSUFFICIENT_EVIDENCE`

> 기회가 오는 쪽에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_138+mp_147+mp_149+mp_153` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_153`, `mp_147`, `mp_149`, `mp_138` |
| SUPPORTING_PARENTS | `mp_153`, `mp_147`, `mp_149`, `mp_138` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_153`, `p:mp_147`, `p:mp_149`, `p:mp_138` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|PROBABILITY|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_148+mp_152` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_152`, `mp_148` |
| SUPPORTING_PARENTS | `mp_152`, `mp_148` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_152`, `p:mp_148` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|A|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_138+mp_147+mp_149+mp_153` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_138` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_147`, `mp_149`, `mp_153` |
| SUPPORTING_PARENTS | `mp_138`, `mp_147`, `mp_149`, `mp_153` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_138`, `p:mp_147`, `p:mp_149`, `p:mp_153` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|OPPORTUNITY|COMPOSITE:DIFFERENT_DOMAIN:ADAPTED_READING:MYUNGRI:OPPORTUNITY|NATAL_SEAT:MONTH|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_144+p:mp_159` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:ADAPTED_READING:MYUNGRI:OPPORTUNITY|NATAL_SEAT:MONTH` (COMPOSITE) — 자리·직업과 기회가 오는 쪽 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_144`, `mp_159` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_144`, `p:mp_159` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 자리·직업과 기회가 오는 쪽은 다르게 봅니다. 기회가 오는 쪽은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명리 OPPORTUNITY 판단 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:명리 OPPORTUNITY 판단 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명리 OPPORTUNITY 판단 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:명리 OPPORTUNITY 판단 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_145+p:zp_160` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 것과 그것을 잡아서 남는 것 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_145`, `zp_160` |
| OPPOSING_PARENTS | `zc_161` |
| DERIVED_FROM | `p:mp_145`, `p:zp_160` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 NONE) |

> 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:명궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget ZIWEI:명궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_150+p:zp_160` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 것과 그것을 잡아서 남는 것 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_150`, `zp_160` |
| OPPOSING_PARENTS | `zc_161` |
| DERIVED_FROM | `p:mp_150`, `p:zp_160` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 NONE) |

> 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:명궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget ZIWEI:명궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_154+p:zp_160` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 것과 그것을 잡아서 남는 것 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_154`, `zp_160` |
| OPPOSING_PARENTS | `zc_161` |
| DERIVED_FROM | `p:mp_154`, `p:zp_160` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 NONE) |

> 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:명궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget ZIWEI:명궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|PROBABILITY|OPPORTUNITY|PALACE:SELF_PALACE|DIRECTIONAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_159+p:zp_160` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `PALACE:SELF_PALACE` (PALACE) — 명궁 |
| CONCLUSION_TYPE | DIRECTIONAL · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | SCOPE_LIMIT |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `zp_160` |
| OPPOSING_PARENTS | `zc_161`, `mp_159` |
| DERIVED_FROM | `p:zp_160`, `p:mp_159` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:명리 OPPORTUNITY 판단(기대 ABSENT, 실제 NONE) |

> 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다. 반대 근거도 있으나, 한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONSTRAINS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명리 OPPORTUNITY 판단 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:명궁 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:명리 OPPORTUNITY 판단 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명리 OPPORTUNITY 판단 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget ZIWEI:명궁 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:명리 OPPORTUNITY 판단 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|OPPORTUNITY|COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_160+p:zp_162` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 쪽과 자리·직업 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `zp_160`, `zp_162` |
| OPPOSING_PARENTS | `zc_161`, `zc_163` |
| DERIVED_FROM | `p:zp_160`, `p:zp_162` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 기회가 오는 쪽과 자리·직업은 다르게 봅니다. 기회가 오는 쪽은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONSTRAINS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove OPPOSES·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:명궁 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:관록궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget ZIWEI:명궁 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:관록궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


**C · 확장** — "사업을 더 키워도 될까요?" → `CONDITIONAL_FOR`

> 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 열립니다, 잡았을 때 남는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.

#### `CONTESTED_SHARE|MYUNGRI|C|PROBABILITY|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_169+mp_186` |
| SUBJECT | C |
| INTENT | PROBABILITY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_186` · 원국의 재물 자리: `mp_169` |
| SUPPORTING_PARENTS | `mp_169`, `mp_186` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_186` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 몫을 나누는 기운 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 원국의 재물 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·이 시기 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|C|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_184+mp_189` |
| SUBJECT | C |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_189`, `mp_184` |
| SUPPORTING_PARENTS | `mp_189`, `mp_184` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_189`, `p:mp_184` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_STANDOFF|CROSS|C|PROBABILITY|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_187+p:mp_190` |
| SUBJECT | C |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_187`, `mp_190` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_187`, `p:mp_190` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


#### `CROSS_AXIS_COMPOUND|CROSS|C|PROBABILITY|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:ADAPTED_READING:MYUNGRI:OPPORTUNITY|NATAL_SEAT:HOUR|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_187+p:mp_195` |
| SUBJECT | C |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:OPPORTUNITY_VS_OUTCOME:ADAPTED_READING:MYUNGRI:OPPORTUNITY|NATAL_SEAT:HOUR` (COMPOSITE) — 기회가 오는 것과 그것을 잡아서 남는 것 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_187`, `mp_195` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_187`, `p:mp_195` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다. 기회가 오는 쪽은 열립니다, 잡았을 때 남는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명리 OPPORTUNITY 판단 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:명리 OPPORTUNITY 판단 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명리 OPPORTUNITY 판단 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:명리 OPPORTUNITY 판단 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |


### 자리·이동

**A · 이직** — "이직해도 될까요?" → `INSUFFICIENT_EVIDENCE`

> 이동에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_208+mp_217+mp_219+mp_223` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_223`, `mp_217`, `mp_219`, `mp_208` |
| SUPPORTING_PARENTS | `mp_223`, `mp_217`, `mp_219`, `mp_208` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_223`, `p:mp_217`, `p:mp_219`, `p:mp_208` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DECISION|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_218+mp_222` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_222`, `mp_218` |
| SUPPORTING_PARENTS | `mp_222`, `mp_218` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_222`, `p:mp_218` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_208+mp_217+mp_219+mp_223` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_208` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_217`, `mp_219`, `mp_223` |
| SUPPORTING_PARENTS | `mp_208`, `mp_217`, `mp_219`, `mp_223` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_208`, `p:mp_217`, `p:mp_219`, `p:mp_223` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_AXIS_COMPOUND|CROSS|A|DECISION|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_214+p:zp_229` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_214`, `zp_229` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_214`, `p:zp_229` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:천이궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:천이궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


**D · 이사** — "이사해도 될까요?" → `INSUFFICIENT_EVIDENCE`

> 이동에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|D|DECISION|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_257+mp_260` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_260`, `mp_257` |
| SUPPORTING_PARENTS | `mp_260`, `mp_257` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_260`, `p:mp_257` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_STANDOFF|CROSS|D|DECISION|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_252+p:mp_254` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_252`, `mp_254` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_252`, `p:mp_254` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


#### `CROSS_AXIS_COMPOUND|CROSS|D|DECISION|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|NATAL_SEAT:MONTH|COMPOUND|PRESENT_MOMENT`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_252+p:qp_271` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|NATAL_SEAT:MONTH` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | PRESENT_MOMENT |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_252`, `qp_271` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_252`, `p:qp_271` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ABSENT | ✅ |


#### `CROSS_AXIS_COMPOUND|CROSS|D|DECISION|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_254+p:zp_265` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_254`, `zp_265` |
| OPPOSING_PARENTS | `zc_266` |
| DERIVED_FROM | `p:mp_254`, `p:zp_265` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 월주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 월주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 NONE) |

> 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:천이궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget ZIWEI:천이궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|D|DECISION|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_256+p:zp_265` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_256`, `zp_265` |
| OPPOSING_PARENTS | `zc_266` |
| DERIVED_FROM | `p:mp_256`, `p:zp_265` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 월주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 월주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 NONE) |

> 자리·직업과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 자리·직업은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:천이궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget ZIWEI:천이궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|D|DECISION|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_258+p:zp_265` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:TRAVEL_PALACE` (COMPOSITE) — 잡았을 때 남는 쪽과 이동 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_258`, `zp_265` |
| OPPOSING_PARENTS | `zc_266` |
| DERIVED_FROM | `p:mp_258`, `p:zp_265` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 잡았을 때 남는 쪽과 이동은 다르게 봅니다. 이동은 범위를 좁혀야 합니다, 잡았을 때 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:천이궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:천이궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_STANDOFF|CROSS|D|DECISION|MOVEMENT|COMPOSITE:RIVAL:BOARD_SEAT:QIMEN_BOARD|PALACE:TRAVEL_PALACE|STRUCTURAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:qp_271+p:zp_265` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:RIVAL:BOARD_SEAT:QIMEN_BOARD|PALACE:TRAVEL_PALACE` (COMPOSITE) — 기문 국·천이궁 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `qp_271`, `zp_265` |
| OPPOSING_PARENTS | `zc_266` |
| DERIVED_FROM | `p:qp_271`, `p:zp_265` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 기문 국·천이궁에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:천이궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·천이궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:천이궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|D|DECISION|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:CAREER_PALACE|COMPOUND|PRESENT_MOMENT`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:qp_271+p:zp_267` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:BOARD_SEAT:QIMEN_BOARD|PALACE:CAREER_PALACE` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | PRESENT_MOMENT |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | FAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `qp_271`, `zp_267` |
| OPPOSING_PARENTS | `zc_268` |
| DERIVED_FROM | `p:qp_271`, `p:zp_267` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:관록궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·관록궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:관록궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


### 관계

**A · 결혼** — "결혼해도 될까요?" → `INSUFFICIENT_EVIDENCE`

> 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.

#### `DIRECTION_VS_EXECUTION|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `DIRECTION_VS_EXECUTION` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | 큰 흐름의 개방: `mp_284` |
| ALTERNATIVE_SUPPORT_GROUPS | 올해의 타격: `mp_288`, `mp_290` |
| SUPPORTING_PARENTS | `mp_284`, `mp_288`, `mp_290` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_284`, `p:mp_288`, `p:mp_290` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 큰 흐름의 개방 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 올해의 타격 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `DIRECTION_VS_EXECUTION|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `DIRECTION_VS_EXECUTION` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | 큰 흐름의 개방: `mp_284` |
| ALTERNATIVE_SUPPORT_GROUPS | 이 달의 타격: `mp_294` |
| SUPPORTING_PARENTS | `mp_284`, `mp_294` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_284`, `p:mp_294` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 큰 흐름의 개방 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 이 달의 타격 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_279+mp_288+mp_290+mp_294` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_294`, `mp_288`, `mp_290`, `mp_279` |
| SUPPORTING_PARENTS | `mp_294`, `mp_288`, `mp_290`, `mp_279` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_294`, `p:mp_288`, `p:mp_290`, `p:mp_279` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DECISION|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_289+mp_293` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_293`, `mp_289` |
| SUPPORTING_PARENTS | `mp_293`, `mp_289` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_293`, `p:mp_289` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_279+mp_288+mp_290+mp_294` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_279` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_288`, `mp_290`, `mp_294` |
| SUPPORTING_PARENTS | `mp_279`, `mp_288`, `mp_290`, `mp_294` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_279`, `p:mp_288`, `p:mp_290`, `p:mp_294` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_STANDOFF|CROSS|A|DECISION|RELATION_STABILITY|COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE|STRUCTURAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_279+p:zp_300` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE` (COMPOSITE) — 원국 일지(배우자·자기 자리)·부처궁 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_279`, `zp_300` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_279`, `p:zp_300` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 일지(배우자·자기 자리)·부처궁에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일지(배우자·자기 자리) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일지(배우자·자기 자리) | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|DECISION|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_279+p:zp_303` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_279`, `zp_303` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_279`, `p:zp_303` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일지(배우자·자기 자리) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:형제궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일지(배우자·자기 자리) | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:형제궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_STANDOFF|CROSS|A|DECISION|RELATION_STABILITY|COMPOSITE:RIVAL:BOARD_SEAT:QIMEN_BOARD|NATAL_SEAT:DAY|STRUCTURAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_279+p:qp_305` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:RIVAL:BOARD_SEAT:QIMEN_BOARD|NATAL_SEAT:DAY` (COMPOSITE) — 기문 국·원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_279`, `qp_305` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_279`, `p:qp_305` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 기문 국·원국 일지(배우자·자기 자리)에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일지(배우자·자기 자리) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일지(배우자·자기 자리) | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:NATAL→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ABSENT | ✅ |


#### `CROSS_TIMING_SPLIT|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:p:mp_284+p:mp_288+p:mp_290` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_288`, `mp_290` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_284`, `p:mp_288`, `p:mp_290` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:SEWOON→NATAL(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:SEWOON→NATAL(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE) |

> 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | **필수** | ABSENT | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | **필수** | ABSENT | NONE | — |


#### `CROSS_TIMING_SPLIT|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:p:mp_284+p:mp_294` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_294` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_284`, `p:mp_294` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:WOLWOON→NATAL(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE) |

> 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | **필수** | ABSENT | NONE | — |


#### `CROSS_TIMING_SPLIT|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290+p:mp_284` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_288`, `mp_290` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290`, `p:mp_284` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:SEWOON→NATAL(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 DIRECTION, 실제 NONE) |

> 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | **필수** | ABSENT | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_TIMING_SPLIT|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294+p:mp_284` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_294` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294`, `p:mp_284` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:WOLWOON→NATAL(기대 ABSENT, 실제 NONE); redirect MYUNGRI:RESTRICTED→FAVORABLE(기대 DIRECTION, 실제 NONE) |

> 원국 일주은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | **필수** | ABSENT | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_288+p:mp_290+p:zp_300` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | OBSTRUCTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_288`, `mp_290` |
| OPPOSING_PARENTS | `zp_300` |
| DERIVED_FROM | `p:mp_288`, `p:mp_290`, `p:zp_300` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 ASSERTION); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 ASSERTION); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 ASSERTION); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE); remove ZIWEI:부처궁(기대 SEMANTIC, 실제 ASSERTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE); redirect ZIWEI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 올해 흐름이 원국 일주 천간충를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ASSERTION | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | ASSERTION | — |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | ASSERTION | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|DECISION|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_288+p:mp_290+p:zp_303` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_288`, `mp_290`, `zp_303` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_288`, `p:mp_290`, `p:zp_303` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE) |

> 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:형제궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget ZIWEI:형제궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_288+p:mp_290+p:qp_305` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | OBSTRUCTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_288`, `mp_290` |
| OPPOSING_PARENTS | `qp_305` |
| DERIVED_FROM | `p:mp_288`, `p:mp_290`, `p:qp_305` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 ASSERTION); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 ASSERTION); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 ASSERTION); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE); remove QIMEN:기문 국(기대 SEMANTIC, 실제 ASSERTION); retarget QIMEN:기문 국(기대 ABSENT, 실제 NONE); redirect QIMEN:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 올해 흐름이 원국 일주 천간충를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ASSERTION | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | ASSERTION | — |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | NONE | — |
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | ASSERTION | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | NONE | — |
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ASSERTION | ✅ |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_294+p:zp_300` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | OBSTRUCTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_294` |
| OPPOSING_PARENTS | `zp_300` |
| DERIVED_FROM | `p:mp_294`, `p:zp_300` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); remove ZIWEI:부처궁(기대 SEMANTIC, 실제 ASSERTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE); redirect ZIWEI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 이 시기 흐름이 원국 일주 형를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|DECISION|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_294+p:zp_303` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_294`, `zp_303` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_294`, `p:zp_303` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION) |

> 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 막힙니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:형제궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:형제궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_294+p:qp_305` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | UNFAVORABLE |
| RESTRICTIONS | — |
| CLAIM_KIND | OBSTRUCTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_294` |
| OPPOSING_PARENTS | `qp_305` |
| DERIVED_FROM | `p:mp_294`, `p:qp_305` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); remove QIMEN:기문 국(기대 SEMANTIC, 실제 ASSERTION); retarget QIMEN:기문 국(기대 ABSENT, 실제 NONE); redirect QIMEN:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 이 시기 흐름이 원국 일주 형를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ASSERTION | ✅ |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290+p:zp_300` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | TIMING_WINDOW |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_288`, `mp_290` |
| OPPOSING_PARENTS | `zp_300` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290`, `p:zp_300` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); remove ZIWEI:부처궁(기대 SEMANTIC, 실제 ASSERTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE); redirect ZIWEI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|DECISION|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290+p:zp_303` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_288`, `mp_290`, `zp_303` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290`, `p:zp_303` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION) |

> 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:형제궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:형제궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290+p:qp_305` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | TIMING_WINDOW |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_288`, `mp_290` |
| OPPOSING_PARENTS | `qp_305` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_288+mp_290`, `p:qp_305` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); remove QIMEN:기문 국(기대 SEMANTIC, 실제 ASSERTION); retarget QIMEN:기문 국(기대 ABSENT, 실제 NONE); redirect QIMEN:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ASSERTION | ✅ |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294+p:zp_300` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | TIMING_WINDOW |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_294` |
| OPPOSING_PARENTS | `zp_300` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294`, `p:zp_300` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); remove ZIWEI:부처궁(기대 SEMANTIC, 실제 ASSERTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE); redirect ZIWEI:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_AXIS_COMPOUND|CROSS|A|DECISION|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294+p:zp_303` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | DIRECTION_VS_EXECUTION |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_294`, `zp_303` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294`, `p:zp_303` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION) |

> 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:형제궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·형제궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:형제궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294+p:qp_305` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| DISCIPLINE | CROSS |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | TIMING |
| CLAIM_KIND | TIMING_WINDOW |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_284`, `mp_294` |
| OPPOSING_PARENTS | `qp_305` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_284+mp_294`, `p:qp_305` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); remove QIMEN:기문 국(기대 SEMANTIC, 실제 ASSERTION); retarget QIMEN:기문 국(기대 ABSENT, 실제 NONE); redirect QIMEN:FAVORABLE→UNFAVORABLE(기대 DIRECTION, 실제 ASSERTION) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove QIMEN:기문 국 | **필수** | SEMANTIC | ASSERTION | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·기문 국 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect QIMEN:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ASSERTION | — |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget QIMEN:기문 국 | **필수** | ABSENT | NONE | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope QIMEN:PRESENT_MOMENT→NATAL | 참고 | ANY | ASSERTION | ✅ |


**B · 재회** — "재회 가능성이 있을까요?" → `INSUFFICIENT_EVIDENCE`

> 끌리는 힘에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)

#### `CONTESTED_SHARE|MYUNGRI|B|PROBABILITY|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_306+mp_318+mp_323` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_318`, `mp_323` · 원국의 재물 자리: `mp_306` |
| SUPPORTING_PARENTS | `mp_306`, `mp_318`, `mp_323` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_318`, `p:mp_323` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 몫을 나누는 기운 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 원국의 재물 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·지금의 큰 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·올해 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·지금의 큰 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·올해 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|B|PROBABILITY|CAREER|NATAL_SEAT:MONTH|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:CAREER:mp_320+mp_325` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_325`, `mp_320` |
| SUPPORTING_PARENTS | `mp_325`, `mp_320` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_325`, `p:mp_320` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 월주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|B|PROBABILITY|OUTCOME|NATAL_SEAT:HOUR|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_321+mp_326` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_326`, `mp_321` |
| SUPPORTING_PARENTS | `mp_326`, `mp_321` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_326`, `p:mp_321` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 시주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 시주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `INFLOW_VS_RETENTION|MYUNGRI|B|PROBABILITY|MONEY_INFLOW|COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:INFLOW_VS_RETENTION:MONEY_INFLOW:mp_327^d:CONTESTED_SHARE:MONEY_RETENTION:mp_306+mp_318+mp_323` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_INFLOW |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 유입과 보유 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `INFLOW_VS_RETENTION` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_327` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_306+mp_318+mp_323`, `p:mp_327` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ACTIVATES·이 시기 흐름의 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove parent CONTESTED_SHARE·벌이는 몫과 남는 몫 (전제 3건) | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse ACTIVATES→ABSENT·이 시기 흐름의 재물 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_STANDOFF|CROSS|B|PROBABILITY|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_319+p:mp_320` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_319`, `mp_320` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_319`, `p:mp_320` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 월주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 월주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 월주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 월주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


#### `CROSS_STANDOFF|CROSS|B|PROBABILITY|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_324+p:mp_326` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_324`, `mp_326` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_324`, `p:mp_326` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


### 시점

**A · 지금 계약** — "지금 계약해도 될까요?" → `CONDITIONAL_AGAINST`

> 명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어와, 지금 크게 벌이기는 쉽지 않습니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_345+mp_354+mp_356+mp_360` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_360`, `mp_354`, `mp_356`, `mp_345` |
| SUPPORTING_PARENTS | `mp_360`, `mp_354`, `mp_356`, `mp_345` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_360`, `p:mp_354`, `p:mp_356`, `p:mp_345` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DECISION|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_355+mp_359` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_359`, `mp_355` |
| SUPPORTING_PARENTS | `mp_359`, `mp_355` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_359`, `p:mp_355` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_345+mp_354+mp_356+mp_360` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_345` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_354`, `mp_356`, `mp_360` |
| SUPPORTING_PARENTS | `mp_345`, `mp_354`, `mp_356`, `mp_360` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_345`, `p:mp_354`, `p:mp_356`, `p:mp_360` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

### 서술형(§12)

**A · 성격** — "제 타고난 성격이 어떤가요?" → `INSUFFICIENT_EVIDENCE`

> 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DESCRIPTIVE|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_382+mp_391+mp_393+mp_397` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_397`, `mp_391`, `mp_393`, `mp_382` |
| SUPPORTING_PARENTS | `mp_397`, `mp_391`, `mp_393`, `mp_382` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_397`, `p:mp_391`, `p:mp_393`, `p:mp_382` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DESCRIPTIVE|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_392+mp_396` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_396`, `mp_392` |
| SUPPORTING_PARENTS | `mp_396`, `mp_392` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_396`, `p:mp_392` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|A|DESCRIPTIVE|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_382+mp_391+mp_393+mp_397` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_382` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_391`, `mp_393`, `mp_397` |
| SUPPORTING_PARENTS | `mp_382`, `mp_391`, `mp_393`, `mp_397` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_382`, `p:mp_391`, `p:mp_393`, `p:mp_397` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

### 원인형(§22)

**C · 왜 부딪히나** — "왜 자꾸 부딪힐까요?" → `STRUCTURAL_ANSWER`

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

#### `CONTESTED_SHARE|MYUNGRI|C|CAUSE_WHY|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_406+mp_423` |
| SUBJECT | C |
| INTENT | CAUSE_WHY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | RESTRICTED |
| RESTRICTIONS | SCOPE |
| CLAIM_KIND | COMPOUND_TRUTH |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_423` · 원국의 재물 자리: `mp_406` |
| SUPPORTING_PARENTS | `mp_406`, `mp_423` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_423` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 몫을 나누는 기운 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 원국의 재물 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·이 시기 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|C|CAUSE_WHY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_421+mp_426` |
| SUBJECT | C |
| INTENT | CAUSE_WHY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_426`, `mp_421` |
| SUPPORTING_PARENTS | `mp_426`, `mp_421` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_426`, `p:mp_421` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CROSS_STANDOFF|CROSS|C|CAUSE_WHY|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_424+p:mp_427` |
| SUBJECT | C |
| INTENT | CAUSE_WHY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| DISCIPLINE | CROSS |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | STATE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | — |
| SUPPORTING_PARENTS | `mp_424`, `mp_427` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_424`, `p:mp_427` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 원국 시주에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 시주 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 시주 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 시주 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | ABSENT | ✅ |


### 입력 불완전(§9)

**E · 시간 미상 확장** — "사업을 더 키워도 될까요?" → `CONDITIONAL_FOR`

> 기회가 오는 쪽은 전반적으로 열려 있는 쪽으로 봅니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|E|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_440+mp_444+mp_446+mp_449` |
| SUBJECT | E |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_449`, `mp_444`, `mp_446`, `mp_440` |
| SUPPORTING_PARENTS | `mp_449`, `mp_444`, `mp_446`, `mp_440` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_449`, `p:mp_444`, `p:mp_446`, `p:mp_440` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (4건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|E|PROBABILITY|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_445+mp_448` |
| SUBJECT | E |
| INTENT | PROBABILITY |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | — |
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_448`, `mp_445` |
| SUPPORTING_PARENTS | `mp_448`, `mp_445` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_448`, `p:mp_445` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(1건), 전제 삭제·역전에도 반응함 |

> 원국 년주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove ALL of 같은 자리에 겹친 압력 (2건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `RECURRING_FRICTION_CAUSE|MYUNGRI|E|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_440+mp_444+mp_446+mp_449` |
| SUBJECT | E |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| DISCIPLINE | MYUNGRI |
| DIRECTION | NONE |
| RESTRICTIONS | — |
| CLAIM_KIND | CAUSE |
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_440` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_444`, `mp_446`, `mp_449` |
| SUPPORTING_PARENTS | `mp_440`, `mp_444`, `mp_446`, `mp_449` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_440`, `p:mp_444`, `p:mp_446`, `p:mp_449` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(2건), 전제 삭제·역전에도 반응함 |

> 반복해서 부딪히는 데는 이유가 있다. 원국 일지(배우자·자기 자리)가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove required 원국의 약한 자리 (1건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove ALL of 그 자리를 다시 건드리는 운 (3건) | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일지(배우자·자기 자리) | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

## 판정 불가도 결과입니다 (§31)

정밀도가 커버리지보다 앞섭니다. 근거가 한쪽으로 모이지 않으면 이 커널은 승자를 만들지 않고
`UNRESOLVED` / `STANDOFF` 로 남깁니다. 아래는 이번 실행에서 방향을 정하지 않은 시나리오입니다.

- **A · 유입** — "올해 돈을 벌 수 있을까요?" → `INSUFFICIENT_EVIDENCE`: 돈이 들어오는 쪽에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- **A · 확장** — "사업을 더 키워도 될까요?" → `INSUFFICIENT_EVIDENCE`: 기회가 오는 쪽에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- **A · 이직** — "이직해도 될까요?" → `INSUFFICIENT_EVIDENCE`: 이동에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- **D · 이사** — "이사해도 될까요?" → `INSUFFICIENT_EVIDENCE`: 이동에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- **A · 결혼** — "결혼해도 될까요?" → `INSUFFICIENT_EVIDENCE`: 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- **B · 재회** — "재회 가능성이 있을까요?" → `INSUFFICIENT_EVIDENCE`: 끌리는 힘에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- **A · 성격** — "제 타고난 성격이 어떤가요?" → `INSUFFICIENT_EVIDENCE`: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- **C · 왜 부딪히나** — "왜 자꾸 부딪힐까요?" → `STRUCTURAL_ANSWER`: 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
