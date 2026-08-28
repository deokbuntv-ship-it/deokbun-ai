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
| RUNTIME_CANDIDATES (런타임이 지명) | 72 |
| CERTIFIED_RUNTIME_CANDIDATES (인증됨) | 55 |
| REAL_SYNTHETIC_INFERENCE | 55 |
| MULTI_FACT_SUMMARY | 17 |
| UNSUPPORTED_INFERENCE | 0 |
| UNCLASSIFIED_RUNTIME_CANDIDATES | 0 (집합 동일성으로 보장) |

### 런타임 스크리닝 총계 (참고 — 인증이 아님)

| 항목 | 값 |
|---|---|
| CANDIDATE_SYNTHESIS | 72 |
| MULTI_FACT_SUMMARY | 0 |
| STATIC_RULE_OUTPUT | 225 |
| UNSUPPORTED_INFERENCE | 0 |

### 공격 총계

| 공격 | 실행 | 결론을 바꿈 |
|---|---|---|
| `REMOVE_PREMISE` | 249 | 126 |
| `REVERSE_PREMISE` | 197 | 65 |
| `REMOVE_PARENT` | 69 | 55 |
| `RETARGET_PARENT` | 67 | 43 |
| `RESCOPE_PARENT` | 67 | 23 |
| `REDIRECT_PARENT` | 67 | 53 |

## 시나리오별 후보

### 재물

**A · 유입** — "올해 돈을 벌 수 있을까요?" → `AGAINST`

> 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

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

#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|MONEY_INFLOW|COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_27+p:zp_29` |
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
| SUPPORTING_PARENTS | `zp_27`, `zp_29` |
| OPPOSING_PARENTS | `zc_28` |
| DERIVED_FROM | `p:zp_27`, `p:zp_29` |
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


**A · 보유** — "저축이 남을까요?" → `FOR`

> 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 남는 쪽은 열립니다, 돈이 들어오는 쪽은 막힙니다. 둘 다 사실이라 나누어 말씀드립니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|OUTCOME|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_39+mp_48+mp_50+mp_54` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_54`, `mp_48`, `mp_50`, `mp_39` |
| SUPPORTING_PARENTS | `mp_54`, `mp_48`, `mp_50`, `mp_39` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_54`, `p:mp_48`, `p:mp_50`, `p:mp_39` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_49+mp_53` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_53`, `mp_49` |
| SUPPORTING_PARENTS | `mp_53`, `mp_49` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_53`, `p:mp_49` |
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
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_39+mp_48+mp_50+mp_54` |
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
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_39` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_48`, `mp_50`, `mp_54` |
| SUPPORTING_PARENTS | `mp_39`, `mp_48`, `mp_50`, `mp_54` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_39`, `p:mp_48`, `p:mp_50`, `p:mp_54` |
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

#### `CROSS_AXIS_COMPOUND|CROSS|A|OUTCOME|MONEY_RETENTION|COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_58+p:zp_59` |
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
| SUPPORTING_PARENTS | `zp_58`, `zp_59` |
| OPPOSING_PARENTS | `zc_60` |
| DERIVED_FROM | `p:zp_58`, `p:zp_59` |
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

> 돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.

#### `CONTESTED_SHARE|MYUNGRI|B|PROBABILITY|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_63+mp_75+mp_80` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_75`, `mp_80` · 원국의 재물 자리: `mp_63` |
| SUPPORTING_PARENTS | `mp_63`, `mp_75`, `mp_80` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_75`, `p:mp_80` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:CAREER:mp_77+mp_82` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_82`, `mp_77` |
| SUPPORTING_PARENTS | `mp_82`, `mp_77` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_82`, `p:mp_77` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_78+mp_83` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_83`, `mp_78` |
| SUPPORTING_PARENTS | `mp_83`, `mp_78` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_83`, `p:mp_78` |
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
| CANDIDATE_ID | `d:INFLOW_VS_RETENTION:MONEY_INFLOW:mp_84^d:CONTESTED_SHARE:MONEY_RETENTION:mp_63+mp_75+mp_80` |
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
| SUPPORTING_PARENTS | `mp_84` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_63+mp_75+mp_80`, `p:mp_84` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_76+p:mp_77` |
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
| SUPPORTING_PARENTS | `mp_76`, `mp_77` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_76`, `p:mp_77` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_81+p:mp_83` |
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
| SUPPORTING_PARENTS | `mp_81`, `mp_83` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_81`, `p:mp_83` |
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

> 전택에 화과가 들어와 있어 이름과 신뢰는 받쳐줍니다. 다만 실제로 들어오는 몫까지는 기대하기 어렵습니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|D|OUTCOME|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_113+mp_116` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_116`, `mp_113` |
| SUPPORTING_PARENTS | `mp_116`, `mp_113` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_116`, `p:mp_113` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_108+p:mp_110` |
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
| SUPPORTING_PARENTS | `mp_108`, `mp_110` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_108`, `p:mp_110` |
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


### 사업·기회

**A · 확장** — "사업을 더 키워도 될까요?" → `CONDITIONAL_AGAINST`

> 기회가 오는 쪽에 대해서는 서로 다른 근거 5가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_130+mp_139+mp_141+mp_145` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_145`, `mp_139`, `mp_141`, `mp_130` |
| SUPPORTING_PARENTS | `mp_145`, `mp_139`, `mp_141`, `mp_130` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_145`, `p:mp_139`, `p:mp_141`, `p:mp_130` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_140+mp_144` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_144`, `mp_140` |
| SUPPORTING_PARENTS | `mp_144`, `mp_140` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_144`, `p:mp_140` |
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
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_130+mp_139+mp_141+mp_145` |
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
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_130` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_139`, `mp_141`, `mp_145` |
| SUPPORTING_PARENTS | `mp_130`, `mp_139`, `mp_141`, `mp_145` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_130`, `p:mp_139`, `p:mp_141`, `p:mp_145` |
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

#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_137+p:zp_149` |
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
| SUPPORTING_PARENTS | `mp_137`, `zp_149` |
| OPPOSING_PARENTS | `zc_150` |
| DERIVED_FROM | `p:mp_137`, `p:zp_149` |
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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_142+p:zp_149` |
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
| SUPPORTING_PARENTS | `mp_142`, `zp_149` |
| OPPOSING_PARENTS | `zc_150` |
| DERIVED_FROM | `p:mp_142`, `p:zp_149` |
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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_146+p:zp_149` |
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
| SUPPORTING_PARENTS | `mp_146`, `zp_149` |
| OPPOSING_PARENTS | `zc_150` |
| DERIVED_FROM | `p:mp_146`, `p:zp_149` |
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


#### `CROSS_AXIS_COMPOUND|CROSS|A|PROBABILITY|OPPORTUNITY|COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_149+p:zp_151` |
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
| SUPPORTING_PARENTS | `zp_149`, `zp_151` |
| OPPOSING_PARENTS | `zc_150`, `zc_152` |
| DERIVED_FROM | `p:zp_149`, `p:zp_151` |
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


**C · 확장** — "사업을 더 키워도 될까요?" → `INSUFFICIENT_EVIDENCE`

> 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)

#### `CONTESTED_SHARE|MYUNGRI|C|PROBABILITY|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_158+mp_175` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_175` · 원국의 재물 자리: `mp_158` |
| SUPPORTING_PARENTS | `mp_158`, `mp_175` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_175` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_173+mp_178` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_178`, `mp_173` |
| SUPPORTING_PARENTS | `mp_178`, `mp_173` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_178`, `p:mp_173` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_176+p:mp_179` |
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
| SUPPORTING_PARENTS | `mp_176`, `mp_179` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_176`, `p:mp_179` |
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


### 자리·이동

**A · 이직** — "이직해도 될까요?" → `FOR`

> 자리·직업과 이동은 다르게 봅니다. 이동은 열립니다, 자리·직업은 범위를 좁혀야 합니다. 둘 다 사실이라 나누어 말씀드립니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_194+mp_203+mp_205+mp_209` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_209`, `mp_203`, `mp_205`, `mp_194` |
| SUPPORTING_PARENTS | `mp_209`, `mp_203`, `mp_205`, `mp_194` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_209`, `p:mp_203`, `p:mp_205`, `p:mp_194` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_204+mp_208` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_208`, `mp_204` |
| SUPPORTING_PARENTS | `mp_208`, `mp_204` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_208`, `p:mp_204` |
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
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_194+mp_203+mp_205+mp_209` |
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
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_194` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_203`, `mp_205`, `mp_209` |
| SUPPORTING_PARENTS | `mp_194`, `mp_203`, `mp_205`, `mp_209` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_194`, `p:mp_203`, `p:mp_205`, `p:mp_209` |
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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_200+p:zp_213` |
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
| SUPPORTING_PARENTS | `mp_200`, `zp_213` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_200`, `p:zp_213` |
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


**D · 이사** — "이사해도 될까요?" → `CONDITIONAL_AGAINST`

> 이동에 대해서는 서로 다른 근거 4가지가 모두 같은 쪽을 가리킵니다. 해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|D|DECISION|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_240+mp_243` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_243`, `mp_240` |
| SUPPORTING_PARENTS | `mp_243`, `mp_240` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_243`, `p:mp_240` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_235+p:mp_237` |
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
| SUPPORTING_PARENTS | `mp_235`, `mp_237` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_235`, `p:mp_237` |
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


#### `CROSS_AXIS_COMPOUND|CROSS|D|DECISION|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_237+p:zp_246` |
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
| SUPPORTING_PARENTS | `mp_237`, `zp_246` |
| OPPOSING_PARENTS | `zc_247` |
| DERIVED_FROM | `p:mp_237`, `p:zp_246` |
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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_239+p:zp_246` |
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
| SUPPORTING_PARENTS | `mp_239`, `zp_246` |
| OPPOSING_PARENTS | `zc_247` |
| DERIVED_FROM | `p:mp_239`, `p:zp_246` |
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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_241+p:zp_246` |
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
| SUPPORTING_PARENTS | `mp_241`, `zp_246` |
| OPPOSING_PARENTS | `zc_247` |
| DERIVED_FROM | `p:mp_241`, `p:zp_246` |
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


### 관계

**A · 결혼** — "결혼해도 될까요?" → `INSUFFICIENT_EVIDENCE`

> 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.

#### `DIRECTION_VS_EXECUTION|MYUNGRI|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_268+mp_270` |
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
| REQUIRED_PARENT_IDS | 큰 흐름의 개방: `mp_264` |
| ALTERNATIVE_SUPPORT_GROUPS | 올해의 타격: `mp_268`, `mp_270` |
| SUPPORTING_PARENTS | `mp_264`, `mp_268`, `mp_270` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_264`, `p:mp_268`, `p:mp_270` |
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
| CANDIDATE_ID | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_274` |
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
| REQUIRED_PARENT_IDS | 큰 흐름의 개방: `mp_264` |
| ALTERNATIVE_SUPPORT_GROUPS | 이 달의 타격: `mp_274` |
| SUPPORTING_PARENTS | `mp_264`, `mp_274` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_264`, `p:mp_274` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_259+mp_268+mp_270+mp_274` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_274`, `mp_268`, `mp_270`, `mp_259` |
| SUPPORTING_PARENTS | `mp_274`, `mp_268`, `mp_270`, `mp_259` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_274`, `p:mp_268`, `p:mp_270`, `p:mp_259` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_269+mp_273` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_273`, `mp_269` |
| SUPPORTING_PARENTS | `mp_273`, `mp_269` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_273`, `p:mp_269` |
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
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_259+mp_268+mp_270+mp_274` |
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
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_259` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_268`, `mp_270`, `mp_274` |
| SUPPORTING_PARENTS | `mp_259`, `mp_268`, `mp_270`, `mp_274` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_259`, `p:mp_268`, `p:mp_270`, `p:mp_274` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_259+p:zp_278` |
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
| SUPPORTING_PARENTS | `mp_259`, `zp_278` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_259`, `p:zp_278` |
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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_259+p:zp_281` |
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
| SUPPORTING_PARENTS | `mp_259`, `zp_281` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_259`, `p:zp_281` |
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


#### `CROSS_TIMING_SPLIT|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:p:mp_264+p:mp_268+p:mp_270` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_268`, `mp_270` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_264`, `p:mp_268`, `p:mp_270` |
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
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:p:mp_264+p:mp_274` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_274` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_264`, `p:mp_274` |
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
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_268+mp_270+p:mp_264` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_268`, `mp_270` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_268+mp_270`, `p:mp_264` |
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
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_274+p:mp_264` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_274` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_274`, `p:mp_264` |
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
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_268+p:mp_270+p:zp_278` |
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
| SUPPORTING_PARENTS | `mp_268`, `mp_270` |
| OPPOSING_PARENTS | `zp_278` |
| DERIVED_FROM | `p:mp_268`, `p:mp_270`, `p:zp_278` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 ASSERTION); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 ASSERTION); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 ASSERTION); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 DIRECTION, 실제 NONE); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE) |

> 올해 흐름이 원국 일주 천간충를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | ASSERTION | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_268+p:mp_270+p:zp_281` |
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
| SUPPORTING_PARENTS | `mp_268`, `mp_270`, `zp_281` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_268`, `p:mp_270`, `p:zp_281` |
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


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_274+p:zp_278` |
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
| SUPPORTING_PARENTS | `mp_274` |
| OPPOSING_PARENTS | `zp_278` |
| DERIVED_FROM | `p:mp_274`, `p:zp_278` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE) |

> 이 시기 흐름이 원국 일주 형를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_274+p:zp_281` |
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
| SUPPORTING_PARENTS | `mp_274`, `zp_281` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_274`, `p:zp_281` |
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


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_268+mp_270+p:zp_278` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_268`, `mp_270` |
| OPPOSING_PARENTS | `zp_278` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_268+mp_270`, `p:zp_278` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_268+mp_270+p:zp_281` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_268`, `mp_270`, `zp_281` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_268+mp_270`, `p:zp_281` |
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


#### `CROSS_CONTRADICTION_RESOLVED|CROSS|A|DECISION|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_274+p:zp_278` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_274` |
| OPPOSING_PARENTS | `zp_278` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_274`, `p:zp_278` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | DIRECTION | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | DIRECTION | ABSENT | ✅ |

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
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_274+p:zp_281` |
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
| SUPPORTING_PARENTS | `mp_264`, `mp_274`, `zp_281` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_264+mp_274`, `p:zp_281` |
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


**B · 재회** — "재회 가능성이 있을까요?" → `INSUFFICIENT_EVIDENCE`

> 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)

#### `CONTESTED_SHARE|MYUNGRI|B|PROBABILITY|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_283+mp_295+mp_300` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_295`, `mp_300` · 원국의 재물 자리: `mp_283` |
| SUPPORTING_PARENTS | `mp_283`, `mp_295`, `mp_300` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_295`, `p:mp_300` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:CAREER:mp_297+mp_302` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_302`, `mp_297` |
| SUPPORTING_PARENTS | `mp_302`, `mp_297` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_302`, `p:mp_297` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_298+mp_303` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_303`, `mp_298` |
| SUPPORTING_PARENTS | `mp_303`, `mp_298` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_303`, `p:mp_298` |
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
| CANDIDATE_ID | `d:INFLOW_VS_RETENTION:MONEY_INFLOW:mp_304^d:CONTESTED_SHARE:MONEY_RETENTION:mp_283+mp_295+mp_300` |
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
| SUPPORTING_PARENTS | `mp_304` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_283+mp_295+mp_300`, `p:mp_304` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_296+p:mp_297` |
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
| SUPPORTING_PARENTS | `mp_296`, `mp_297` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_296`, `p:mp_297` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_301+p:mp_303` |
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
| SUPPORTING_PARENTS | `mp_301`, `mp_303` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_301`, `p:mp_303` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_318+mp_327+mp_329+mp_333` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_333`, `mp_327`, `mp_329`, `mp_318` |
| SUPPORTING_PARENTS | `mp_333`, `mp_327`, `mp_329`, `mp_318` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_333`, `p:mp_327`, `p:mp_329`, `p:mp_318` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_328+mp_332` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_332`, `mp_328` |
| SUPPORTING_PARENTS | `mp_332`, `mp_328` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_332`, `p:mp_328` |
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
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_318+mp_327+mp_329+mp_333` |
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
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_318` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_327`, `mp_329`, `mp_333` |
| SUPPORTING_PARENTS | `mp_318`, `mp_327`, `mp_329`, `mp_333` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_318`, `p:mp_327`, `p:mp_329`, `p:mp_333` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_354+mp_363+mp_365+mp_369` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_369`, `mp_363`, `mp_365`, `mp_354` |
| SUPPORTING_PARENTS | `mp_369`, `mp_363`, `mp_365`, `mp_354` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_369`, `p:mp_363`, `p:mp_365`, `p:mp_354` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_364+mp_368` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_368`, `mp_364` |
| SUPPORTING_PARENTS | `mp_368`, `mp_364` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_368`, `p:mp_364` |
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
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_354+mp_363+mp_365+mp_369` |
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
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_354` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_363`, `mp_365`, `mp_369` |
| SUPPORTING_PARENTS | `mp_354`, `mp_363`, `mp_365`, `mp_369` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_354`, `p:mp_363`, `p:mp_365`, `p:mp_369` |
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
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_378+mp_395` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 몫을 나누는 기운: `mp_395` · 원국의 재물 자리: `mp_378` |
| SUPPORTING_PARENTS | `mp_378`, `mp_395` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_395` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_393+mp_398` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_398`, `mp_393` |
| SUPPORTING_PARENTS | `mp_398`, `mp_393` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_398`, `p:mp_393` |
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
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_396+p:mp_399` |
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
| SUPPORTING_PARENTS | `mp_396`, `mp_399` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_396`, `p:mp_399` |
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

**E · 시간 미상 확장** — "사업을 더 키워도 될까요?" → `INSUFFICIENT_EVIDENCE`

> 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)

#### `CONVERGENT_SEAT_PRESSURE|MYUNGRI|E|PROBABILITY|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_412+mp_416+mp_418+mp_421` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_421`, `mp_416`, `mp_418`, `mp_412` |
| SUPPORTING_PARENTS | `mp_421`, `mp_416`, `mp_418`, `mp_412` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_421`, `p:mp_416`, `p:mp_418`, `p:mp_412` |
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
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_417+mp_420` |
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
| ALTERNATIVE_SUPPORT_GROUPS | 같은 자리에 겹친 압력: `mp_420`, `mp_417` |
| SUPPORTING_PARENTS | `mp_420`, `mp_417` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_420`, `p:mp_417` |
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
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_412+mp_416+mp_418+mp_421` |
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
| REQUIRED_PARENT_IDS | 원국의 약한 자리: `mp_412` |
| ALTERNATIVE_SUPPORT_GROUPS | 그 자리를 다시 건드리는 운: `mp_416`, `mp_418`, `mp_421` |
| SUPPORTING_PARENTS | `mp_412`, `mp_416`, `mp_418`, `mp_421` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_412`, `p:mp_416`, `p:mp_418`, `p:mp_421` |
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

- **C · 확장** — "사업을 더 키워도 될까요?" → `INSUFFICIENT_EVIDENCE`: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
- **A · 결혼** — "결혼해도 될까요?" → `INSUFFICIENT_EVIDENCE`: 같이 사는 난도에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.
- **B · 재회** — "재회 가능성이 있을까요?" → `INSUFFICIENT_EVIDENCE`: 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)
- **A · 성격** — "제 타고난 성격이 어떤가요?" → `INSUFFICIENT_EVIDENCE`: 지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.
- **C · 왜 부딪히나** — "왜 자꾸 부딪힐까요?" → `STRUCTURAL_ANSWER`: 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.
- **E · 시간 미상 확장** — "사업을 더 키워도 될까요?" → `INSUFFICIENT_EVIDENCE`: 기회가 오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리·기문둔갑에는 이 축을 직접 보는 자리가 없습니다.)
