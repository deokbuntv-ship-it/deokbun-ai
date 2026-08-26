# DIVINATION V4C — KERNEL ONTOLOGY + EVALUATOR QA PACK

> 자동 생성 문서입니다. `npx jest generateV4cKernelQaPack` 으로 재생성됩니다.
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
| RUNTIME_CANDIDATES (런타임이 지명) | 75 |
| CERTIFIED_RUNTIME_CANDIDATES (인증됨) | 58 |
| REAL_SYNTHETIC_INFERENCE | 58 |
| MULTI_FACT_SUMMARY | 17 |
| UNSUPPORTED_INFERENCE | 0 |
| UNCLASSIFIED_RUNTIME_CANDIDATES | 0 (집합 동일성으로 보장) |

### 런타임 스크리닝 총계 (참고 — 인증이 아님)

| 항목 | 값 |
|---|---|
| CANDIDATE_SYNTHESIS | 75 |
| MULTI_FACT_SUMMARY | 0 |
| STATIC_RULE_OUTPUT | 225 |
| UNSUPPORTED_INFERENCE | 0 |

### 공격 총계

| 공격 | 실행 | 결론을 바꿈 |
|---|---|---|
| `REMOVE_PREMISE` | 245 | 130 |
| `REVERSE_PREMISE` | 205 | 79 |
| `REMOVE_PARENT` | 75 | 62 |
| `RETARGET_PARENT` | 73 | 49 |
| `RESCOPE_PARENT` | 73 | 30 |
| `REDIRECT_PARENT` | 73 | 65 |

## 시나리오별 후보

### 재물

**A · 유입** — "올해 돈을 벌 수 있을까요?" → `AGAINST`

> 돈이 들어오는 것과 남는 것은 다르게 봅니다. 돈이 들어오는 쪽은 막힙니다, 돈이 남는 쪽은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

#### `CONVERGENT_SEAT_PRESSURE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

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

#### `CONVERGENT_SEAT_PRESSURE|A|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

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

#### `RECURRING_FRICTION_CAUSE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

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

#### `CROSS_AXIS_COMPOUND|A|MONEY_INFLOW|COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_26+p:zp_28` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | MONEY_INFLOW |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE` (COMPOSITE) — 돈이 들어오는 것과 남는 것 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `zp_26`, `zp_28` |
| OPPOSING_PARENTS | `zc_27` |
| DERIVED_FROM | `p:zp_26`, `p:zp_28` |
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
  | `REDIRECT_PARENT` | redirect ZIWEI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONVERGENT_SEAT_PRESSURE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_38+mp_47+mp_49+mp_53` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_53`, `mp_47`, `mp_49`, `mp_38` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_53`, `p:mp_47`, `p:mp_49`, `p:mp_38` |
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

#### `CONVERGENT_SEAT_PRESSURE|A|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_48+mp_52` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_52`, `mp_48` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_52`, `p:mp_48` |
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

#### `RECURRING_FRICTION_CAUSE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_38+mp_47+mp_49+mp_53` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| SUPPORTING_PARENTS | `mp_38`, `mp_47`, `mp_49`, `mp_53` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_38`, `p:mp_47`, `p:mp_49`, `p:mp_53` |
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

#### `CROSS_AXIS_COMPOUND|A|MONEY_RETENTION|COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_56+p:zp_57` |
| SUBJECT | A |
| INTENT | OUTCOME |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:PALACE:PROPERTY_PALACE|PALACE:WEALTH_PALACE` (COMPOSITE) — 돈이 들어오는 것과 남는 것 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `zp_56`, `zp_57` |
| OPPOSING_PARENTS | `zc_58` |
| DERIVED_FROM | `p:zp_56`, `p:zp_57` |
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
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONTESTED_SHARE|B|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_61+mp_73+mp_78` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| SUPPORTING_PARENTS | `mp_61`, `mp_73`, `mp_78` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_73`, `p:mp_78` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
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

#### `CONVERGENT_SEAT_PRESSURE|B|CAREER|NATAL_SEAT:MONTH|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:CAREER:mp_75+mp_80` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_80`, `mp_75` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_80`, `p:mp_75` |
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

#### `CONVERGENT_SEAT_PRESSURE|B|OUTCOME|NATAL_SEAT:HOUR|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_76+mp_81` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_81`, `mp_76` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_81`, `p:mp_76` |
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

#### `INFLOW_VS_RETENTION|B|MONEY_INFLOW|COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:INFLOW_VS_RETENTION:MONEY_INFLOW:mp_82^d:CONTESTED_SHARE:MONEY_RETENTION:mp_61+mp_73+mp_78` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_INFLOW |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 유입과 보유 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `INFLOW_VS_RETENTION` |
| SUPPORTING_PARENTS | `mp_82` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_61+mp_73+mp_78`, `p:mp_82` |
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

#### `CROSS_STANDOFF|B|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_74+p:mp_75` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_74`, `mp_75` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_74`, `p:mp_75` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_STANDOFF|B|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_79+p:mp_81` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_79`, `mp_81` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_79`, `p:mp_81` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONVERGENT_SEAT_PRESSURE|D|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_110+mp_113` |
| SUBJECT | D |
| INTENT | OUTCOME |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_113`, `mp_110` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_113`, `p:mp_110` |
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

#### `CROSS_STANDOFF|D|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_105+p:mp_107` |
| SUBJECT | D |
| INTENT | OUTCOME |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_105`, `mp_107` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_105`, `p:mp_107` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONVERGENT_SEAT_PRESSURE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_126+mp_135+mp_137+mp_141` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_141`, `mp_135`, `mp_137`, `mp_126` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_141`, `p:mp_135`, `p:mp_137`, `p:mp_126` |
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

#### `CONVERGENT_SEAT_PRESSURE|A|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_136+mp_140` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_140`, `mp_136` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_140`, `p:mp_136` |
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

#### `RECURRING_FRICTION_CAUSE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_126+mp_135+mp_137+mp_141` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| SUPPORTING_PARENTS | `mp_126`, `mp_135`, `mp_137`, `mp_141` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_126`, `p:mp_135`, `p:mp_137`, `p:mp_141` |
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

#### `CROSS_AXIS_COMPOUND|A|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_133+p:zp_144` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 것과 그것을 잡아서 남는 것 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_133`, `zp_144` |
| OPPOSING_PARENTS | `zc_145` |
| DERIVED_FROM | `p:mp_133`, `p:zp_144` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_AXIS_COMPOUND|A|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_138+p:zp_144` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 것과 그것을 잡아서 남는 것 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_138`, `zp_144` |
| OPPOSING_PARENTS | `zc_145` |
| DERIVED_FROM | `p:mp_138`, `p:zp_144` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_AXIS_COMPOUND|A|OPPORTUNITY|COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_142+p:zp_144` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:OPPORTUNITY_VS_OUTCOME:NATAL_SEAT:HOUR|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 것과 그것을 잡아서 남는 것 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_142`, `zp_144` |
| OPPOSING_PARENTS | `zc_145` |
| DERIVED_FROM | `p:mp_142`, `p:zp_144` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 시주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 시주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_AXIS_COMPOUND|A|OPPORTUNITY|COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:zp_144+p:zp_146` |
| SUBJECT | A |
| INTENT | PROBABILITY |
| AXIS | OPPORTUNITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:PALACE:CAREER_PALACE|PALACE:SELF_PALACE` (COMPOSITE) — 기회가 오는 쪽과 자리·직업 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `zp_144`, `zp_146` |
| OPPOSING_PARENTS | `zc_145`, `zc_147` |
| DERIVED_FROM | `p:zp_144`, `p:zp_146` |
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
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONTESTED_SHARE|C|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_153+mp_170` |
| SUBJECT | C |
| INTENT | PROBABILITY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| SUPPORTING_PARENTS | `mp_153`, `mp_170` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_170` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·이 시기 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|C|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_168+mp_173` |
| SUBJECT | C |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_173`, `mp_168` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_173`, `p:mp_168` |
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

#### `CROSS_STANDOFF|C|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_171+p:mp_174` |
| SUBJECT | C |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_171`, `mp_174` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_171`, `p:mp_174` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONVERGENT_SEAT_PRESSURE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_188+mp_197+mp_199+mp_203` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_203`, `mp_197`, `mp_199`, `mp_188` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_203`, `p:mp_197`, `p:mp_199`, `p:mp_188` |
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

#### `CONVERGENT_SEAT_PRESSURE|A|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_198+mp_202` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_202`, `mp_198` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_202`, `p:mp_198` |
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

#### `RECURRING_FRICTION_CAUSE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_188+mp_197+mp_199+mp_203` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| SUPPORTING_PARENTS | `mp_188`, `mp_197`, `mp_199`, `mp_203` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_188`, `p:mp_197`, `p:mp_199`, `p:mp_203` |
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

#### `CROSS_AXIS_COMPOUND|A|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_194+p:zp_206` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_194`, `zp_206` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_194`, `p:zp_206` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONVERGENT_SEAT_PRESSURE|D|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_233+mp_236` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_236`, `mp_233` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_236`, `p:mp_233` |
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

#### `CROSS_STANDOFF|D|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_228+p:mp_230` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_228`, `mp_230` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_228`, `p:mp_230` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_AXIS_COMPOUND|D|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_230+p:zp_238` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_230`, `zp_238` |
| OPPOSING_PARENTS | `zc_239` |
| DERIVED_FROM | `p:mp_230`, `p:zp_238` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 월주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 월주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |

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


#### `CROSS_AXIS_COMPOUND|D|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_232+p:zp_238` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:MONTH|PALACE:TRAVEL_PALACE` (COMPOSITE) — 자리·직업과 이동 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_232`, `zp_238` |
| OPPOSING_PARENTS | `zc_239` |
| DERIVED_FROM | `p:mp_232`, `p:zp_238` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 월주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 월주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:FAVORABLE→UNFAVORABLE(기대 SEMANTIC, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |

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


#### `CROSS_AXIS_COMPOUND|D|MOVEMENT|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:TRAVEL_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_234+p:zp_238` |
| SUBJECT | D |
| INTENT | DECISION |
| AXIS | MOVEMENT |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:HOUR|PALACE:TRAVEL_PALACE` (COMPOSITE) — 잡았을 때 남는 쪽과 이동 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_234`, `zp_238` |
| OPPOSING_PARENTS | `zc_239` |
| DERIVED_FROM | `p:mp_234`, `p:zp_238` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `DIRECTION_VS_EXECUTION|A|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_260+mp_262` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `DIRECTION_VS_EXECUTION` |
| SUPPORTING_PARENTS | `mp_256` |
| OPPOSING_PARENTS | `mp_260`, `mp_262` |
| DERIVED_FROM | `p:mp_256`, `p:mp_260`, `p:mp_262` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함 |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
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

#### `DIRECTION_VS_EXECUTION|A|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_266` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `DIRECTION_VS_EXECUTION` |
| SUPPORTING_PARENTS | `mp_256` |
| OPPOSING_PARENTS | `mp_266` |
| DERIVED_FROM | `p:mp_256`, `p:mp_266` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함 |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_251+mp_260+mp_262+mp_266` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_266`, `mp_260`, `mp_262`, `mp_251` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_266`, `p:mp_260`, `p:mp_262`, `p:mp_251` |
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

#### `CONVERGENT_SEAT_PRESSURE|A|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_261+mp_265` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_265`, `mp_261` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_265`, `p:mp_261` |
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

#### `RECURRING_FRICTION_CAUSE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_251+mp_260+mp_262+mp_266` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| SUPPORTING_PARENTS | `mp_251`, `mp_260`, `mp_262`, `mp_266` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_251`, `p:mp_260`, `p:mp_262`, `p:mp_266` |
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

#### `CROSS_STANDOFF|A|RELATION_STABILITY|COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE|STRUCTURAL|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_251+p:zp_269` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE` (COMPOSITE) — 원국 일지(배우자·자기 자리)·부처궁 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_251`, `zp_269` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_251`, `p:zp_269` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_AXIS_COMPOUND|A|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|NATAL`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_251+p:zp_272` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | NATAL |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_251`, `zp_272` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_251`, `p:zp_272` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_TIMING_SPLIT|A|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:p:mp_256+p:mp_260+p:mp_262` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| SUPPORTING_PARENTS | `mp_256`, `mp_260`, `mp_262` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_256`, `p:mp_260`, `p:mp_262` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:SEWOON→NATAL(기대 ABSENT, 실제 NONE); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:SEWOON→NATAL(기대 ABSENT, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | RESTRICTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | RESTRICTION | ✅ |

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


#### `CROSS_TIMING_SPLIT|A|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:p:mp_256+p:mp_266` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| SUPPORTING_PARENTS | `mp_256`, `mp_266` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_256`, `p:mp_266` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:WOLWOON→NATAL(기대 ABSENT, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | RESTRICTION | ✅ |

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


#### `CROSS_TIMING_SPLIT|A|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_260+mp_262+p:mp_256` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| SUPPORTING_PARENTS | `mp_256` |
| OPPOSING_PARENTS | `mp_260`, `mp_262` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_260+mp_262`, `p:mp_256` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:SEWOON→NATAL(기대 ABSENT, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | RESTRICTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_TIMING_SPLIT|A|RELATION_STABILITY|NATAL_SEAT:DAY|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_TIMING_SPLIT:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_266+p:mp_256` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_TIMING_SPLIT` |
| SUPPORTING_PARENTS | `mp_256` |
| OPPOSING_PARENTS | `mp_266` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_266`, `p:mp_256` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); rescope MYUNGRI:WOLWOON→NATAL(기대 ABSENT, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | RESTRICTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_REINFORCEMENT|A|RELATION_STABILITY|COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE|DIRECTIONAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_REINFORCEMENT:p:mp_256+p:zp_269` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:RIVAL:NATAL_SEAT:DAY|PALACE:SPOUSE_PALACE` (COMPOSITE) — 원국 일주·부처궁 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_REINFORCEMENT` |
| SUPPORTING_PARENTS | `mp_256`, `zp_269` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_256`, `p:zp_269` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 서로 다른 자리(원국 일주 / 부처궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 이 축은 열려 있습니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:DAEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_CONTRADICTION_RESOLVED|A|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_260+p:mp_262+p:zp_269` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| SUPPORTING_PARENTS | `mp_260`, `mp_262` |
| OPPOSING_PARENTS | `zp_269` |
| DERIVED_FROM | `p:mp_260`, `p:mp_262`, `p:zp_269` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 ASSERTION); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE) |

> 올해 흐름이 원국 일주 천간충를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | ASSERTION | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | ASSERTION | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ASSERTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_AXIS_COMPOUND|A|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_260+p:mp_262+p:zp_272` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_260`, `mp_262`, `zp_272` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_260`, `p:mp_262`, `p:zp_272` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE); remove MYUNGRI:원국 일주(기대 SEMANTIC, 실제 NONE); retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 NONE); redirect MYUNGRI:UNFAVORABLE→FAVORABLE(기대 SEMANTIC, 실제 NONE) |

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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_CONTRADICTION_RESOLVED|A|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:p:mp_266+p:zp_269` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| SUPPORTING_PARENTS | `mp_266` |
| OPPOSING_PARENTS | `zp_269` |
| DERIVED_FROM | `p:mp_266`, `p:zp_269` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 NONE) |

> 이 시기 흐름이 원국 일주 형를 정면으로 흔든다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | ASSERTION | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_AXIS_COMPOUND|A|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:p:mp_266+p:zp_272` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_266`, `zp_272` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_266`, `p:zp_272` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_CONTRADICTION_RESOLVED|A|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_260+mp_262+p:zp_269` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| SUPPORTING_PARENTS | `mp_256` |
| OPPOSING_PARENTS | `mp_260`, `mp_262`, `zp_269` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_260+mp_262`, `p:zp_269` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 DIRECTION) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 올해에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | DIRECTION | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | DIRECTION | ✅ |


#### `CROSS_AXIS_COMPOUND|A|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_260+mp_262+p:zp_272` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_256`, `zp_272` |
| OPPOSING_PARENTS | `mp_260`, `mp_262` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_260+mp_262`, `p:zp_272` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION) |

> 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·형제궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:형제궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·형제궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:형제궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | DIRECTION | ✅ |


#### `CROSS_CONTRADICTION_RESOLVED|A|RELATION_STABILITY|NATAL_SEAT:DAY|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_CONTRADICTION_RESOLVED:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_266+p:zp_269` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | DIRECTIONAL · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_CONTRADICTION_RESOLVED` |
| SUPPORTING_PARENTS | `mp_256` |
| OPPOSING_PARENTS | `mp_266`, `zp_269` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_266`, `p:zp_269` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION); retarget ZIWEI:부처궁(기대 ABSENT, 실제 DIRECTION) |

> 원국 일주은(는) 큰 흐름에서 열려 있는 자리인데, 이 달에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다. 반대 근거도 있으나, 한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·부처궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:부처궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·부처궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:부처궁 | **필수** | ABSENT | DIRECTION | — |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | DIRECTION | ✅ |


#### `CROSS_AXIS_COMPOUND|A|RELATION_STABILITY|COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_AXIS_COMPOUND:d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_266+p:zp_272` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `COMPOSITE:DIFFERENT_DOMAIN:NATAL_SEAT:DAY|PALACE:SIBLING_PALACE` (COMPOSITE) — 같이 사는 난도과 부딪힘 |
| CONCLUSION_TYPE | COMPOUND · TIMING |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_AXIS_COMPOUND` |
| SUPPORTING_PARENTS | `mp_256`, `zp_272` |
| OPPOSING_PARENTS | `mp_266` |
| DERIVED_FROM | `d:DIRECTION_VS_EXECUTION:RELATION_STABILITY:mp_256+mp_266`, `p:zp_272` |
| **CERTIFICATION_RESULT** | **MULTI_FACT_SUMMARY** |
| 판정 근거 | 필수 변형이 결론을 바꾸지 못함: retarget MYUNGRI:원국 일주(기대 ABSENT, 실제 DIRECTION) |

> 같이 사는 난도과 부딪힘은 다르게 봅니다. 같이 사는 난도은 범위를 좁혀야 합니다, 부딪힘은 열립니다. 둘 다 사실이라 나누어 말씀드립니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove SUPPORTS·형제궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PREMISE` | remove DESTABILIZES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 일주 | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:형제궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONNECTS→SEPARATES·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·형제궁 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REVERSE_PREMISE` | reverse DESTABILIZES→CONNECTS·원국 일주 | 참고 | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | DIRECTION | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 일주 | **필수** | ABSENT | DIRECTION | — |
  | `RETARGET_PARENT` | retarget ZIWEI:형제궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | DIRECTION | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | DIRECTION | ✅ |


**B · 재회** — "재회 가능성이 있을까요?" → `INSUFFICIENT_EVIDENCE`

> 전반에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다. (명리에는 이 축을 직접 보는 자리가 없습니다.)

#### `CONTESTED_SHARE|B|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_274+mp_286+mp_291` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL|LUCK_LAYER:SEWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| SUPPORTING_PARENTS | `mp_274`, `mp_286`, `mp_291` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_286`, `p:mp_291` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
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

#### `CONVERGENT_SEAT_PRESSURE|B|CAREER|NATAL_SEAT:MONTH|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:CAREER:mp_288+mp_293` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_293`, `mp_288` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_293`, `p:mp_288` |
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

#### `CONVERGENT_SEAT_PRESSURE|B|OUTCOME|NATAL_SEAT:HOUR|CAUSAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:OUTCOME:mp_289+mp_294` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_294`, `mp_289` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_294`, `p:mp_289` |
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

#### `INFLOW_VS_RETENTION|B|MONEY_INFLOW|COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:INFLOW_VS_RETENTION:MONEY_INFLOW:mp_295^d:CONTESTED_SHARE:MONEY_RETENTION:mp_274+mp_286+mp_291` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | MONEY_INFLOW |
| TARGET | `COMPOSITE:INFLOW_VS_RETENTION:TEN_GOD_FAMILY:WEALTH.COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:DAEWOON:RIVAL~pLUCK_LAYER:SEWOON:RIVAL~dTEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 유입과 보유 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `INFLOW_VS_RETENTION` |
| SUPPORTING_PARENTS | `mp_295` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_274+mp_286+mp_291`, `p:mp_295` |
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

#### `CROSS_STANDOFF|B|CAREER|NATAL_SEAT:MONTH|STRUCTURAL|DAEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_287+p:mp_288` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | CAREER |
| TARGET | `NATAL_SEAT:MONTH` (NATAL_SEAT) — 원국 월주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | DAEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_287`, `mp_288` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_287`, `p:mp_288` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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


#### `CROSS_STANDOFF|B|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_292+p:mp_294` |
| SUBJECT | B |
| INTENT | PROBABILITY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_292`, `mp_294` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_292`, `p:mp_294` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONVERGENT_SEAT_PRESSURE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_308+mp_317+mp_319+mp_323` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_323`, `mp_317`, `mp_319`, `mp_308` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_323`, `p:mp_317`, `p:mp_319`, `p:mp_308` |
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

#### `CONVERGENT_SEAT_PRESSURE|A|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_318+mp_322` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_322`, `mp_318` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_322`, `p:mp_318` |
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

#### `RECURRING_FRICTION_CAUSE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_308+mp_317+mp_319+mp_323` |
| SUBJECT | A |
| INTENT | DECISION |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| SUPPORTING_PARENTS | `mp_308`, `mp_317`, `mp_319`, `mp_323` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_308`, `p:mp_317`, `p:mp_319`, `p:mp_323` |
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

#### `CONVERGENT_SEAT_PRESSURE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_343+mp_352+mp_354+mp_358` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_358`, `mp_352`, `mp_354`, `mp_343` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_358`, `p:mp_352`, `p:mp_354`, `p:mp_343` |
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

#### `CONVERGENT_SEAT_PRESSURE|A|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_353+mp_357` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_357`, `mp_353` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_357`, `p:mp_353` |
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

#### `RECURRING_FRICTION_CAUSE|A|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_343+mp_352+mp_354+mp_358` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| SUPPORTING_PARENTS | `mp_343`, `mp_352`, `mp_354`, `mp_358` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_343`, `p:mp_352`, `p:mp_354`, `p:mp_358` |
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

#### `CROSS_REINFORCEMENT|A|GENERAL|COMPOSITE:RIVAL:NATAL_SEAT:YEAR|PALACE:SELF_PALACE|DIRECTIONAL|SEWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_REINFORCEMENT:p:mp_353+p:zp_361` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | GENERAL |
| TARGET | `COMPOSITE:RIVAL:NATAL_SEAT:YEAR|PALACE:SELF_PALACE` (COMPOSITE) — 원국 년주·명궁 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | SEWOON |
| DERIVATION_RULE | `CROSS_REINFORCEMENT` |
| SUPPORTING_PARENTS | `mp_353`, `zp_361` |
| OPPOSING_PARENTS | `zc_362` |
| DERIVED_FROM | `p:mp_353`, `p:zp_361` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 서로 다른 자리(원국 년주 / 명궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 범위를 좁혀야 하는 자리입니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 년주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:명궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 년주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:명궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:SEWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


#### `CROSS_REINFORCEMENT|A|GENERAL|COMPOSITE:RIVAL:NATAL_SEAT:YEAR|PALACE:SELF_PALACE|DIRECTIONAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_REINFORCEMENT:p:mp_357+p:zp_361` |
| SUBJECT | A |
| INTENT | DESCRIPTIVE |
| AXIS | GENERAL |
| TARGET | `COMPOSITE:RIVAL:NATAL_SEAT:YEAR|PALACE:SELF_PALACE` (COMPOSITE) — 원국 년주·명궁 |
| CONCLUSION_TYPE | DIRECTIONAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_REINFORCEMENT` |
| SUPPORTING_PARENTS | `mp_357`, `zp_361` |
| OPPOSING_PARENTS | `zc_362` |
| DERIVED_FROM | `p:mp_357`, `p:zp_361` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(6건), 전제 삭제·역전에도 반응함 |

> 서로 다른 자리(원국 년주 / 명궁)를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: 범위를 좁혀야 하는 자리입니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove CONSTRAINS·원국 년주 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove CONSTRAINS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PREMISE` | remove SUPPORTS·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REMOVE_PARENT` | remove MYUNGRI:원국 년주 | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PARENT` | remove ZIWEI:명궁 | **필수** | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·원국 년주 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse CONSTRAINS→ENABLES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·명궁 | 참고 | SEMANTIC | NONE | — |
  | `REDIRECT_PARENT` | redirect MYUNGRI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect ZIWEI:RESTRICTED→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

- TARGET_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RETARGET_PARENT` | retarget MYUNGRI:원국 년주 | **필수** | ABSENT | ABSENT | ✅ |
  | `RETARGET_PARENT` | retarget ZIWEI:명궁 | **필수** | ABSENT | ABSENT | ✅ |

- TIME_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `RESCOPE_PARENT` | rescope MYUNGRI:WOLWOON→NATAL | 참고 | ANY | ABSENT | ✅ |
  | `RESCOPE_PARENT` | rescope ZIWEI:NATAL→NATAL | 참고 | ANY | NONE | — |


### 원인형(§22)

**C · 왜 부딪히나** — "왜 자꾸 부딪힐까요?" → `STRUCTURAL_ANSWER`

> 원국 일주에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.

#### `CONTESTED_SHARE|C|MONEY_RETENTION|COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH|COMPOUND|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONTESTED_SHARE:MONEY_RETENTION:mp_366+mp_383` |
| SUBJECT | C |
| INTENT | CAUSE_WHY |
| AXIS | MONEY_RETENTION |
| TARGET | `COMPOSITE:RIVAL_VS_WEALTH:LUCK_LAYER:WOLWOON:RIVAL.TEN_GOD_FAMILY:WEALTH` (COMPOSITE) — 벌이는 몫과 남는 몫 |
| CONCLUSION_TYPE | COMPOUND · SCOPE |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONTESTED_SHARE` |
| SUPPORTING_PARENTS | `mp_366`, `mp_383` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_383` |
| **CERTIFICATION_RESULT** | **REAL_SYNTHETIC_INFERENCE** |
| 판정 근거 | 필수 변형이 모두 이 결론을 바꿨고(0건), 전제 삭제·역전에도 반응함 |

> 원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.

- REMOVAL_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REMOVE_PREMISE` | remove SUPPORTS·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REMOVE_PREMISE` | remove OPPOSES·이 시기 흐름의 겁재 | 참고 | SEMANTIC | ABSENT | ✅ |

- DIRECTION_MUTATIONS:

  | 변형 | 대상 | 필수 | 기대 변화 | 실제 변화 | 판정 |
  |---|---|---|---|---|---|
  | `REVERSE_PREMISE` | reverse SUPPORTS→OPPOSES·원국 재물 | 참고 | SEMANTIC | ABSENT | ✅ |
  | `REVERSE_PREMISE` | reverse OPPOSES→SUPPORTS·이 시기 흐름의 겁재 | 참고 | SEMANTIC | NONE | — |

- TARGET_MUTATIONS: 해당 없음
- TIME_MUTATIONS: 해당 없음

#### `CONVERGENT_SEAT_PRESSURE|C|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_381+mp_386` |
| SUBJECT | C |
| INTENT | CAUSE_WHY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_386`, `mp_381` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_386`, `p:mp_381` |
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

#### `CROSS_STANDOFF|C|OUTCOME|NATAL_SEAT:HOUR|STRUCTURAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `x:CROSS_STANDOFF:p:mp_384+p:mp_387` |
| SUBJECT | C |
| INTENT | CAUSE_WHY |
| AXIS | OUTCOME |
| TARGET | `NATAL_SEAT:HOUR` (NATAL_SEAT) — 원국 시주 |
| CONCLUSION_TYPE | STRUCTURAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CROSS_STANDOFF` |
| SUPPORTING_PARENTS | `mp_384`, `mp_387` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_384`, `p:mp_387` |
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
  | `REDIRECT_PARENT` | redirect MYUNGRI:UNFAVORABLE→FAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |
  | `REDIRECT_PARENT` | redirect MYUNGRI:FAVORABLE→UNFAVORABLE | **필수** | SEMANTIC | ABSENT | ✅ |

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

#### `CONVERGENT_SEAT_PRESSURE|E|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:RELATION_STABILITY:mp_399+mp_403+mp_405+mp_408` |
| SUBJECT | E |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_408`, `mp_403`, `mp_405`, `mp_399` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_408`, `p:mp_403`, `p:mp_405`, `p:mp_399` |
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

#### `CONVERGENT_SEAT_PRESSURE|E|GENERAL|NATAL_SEAT:YEAR|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:CONVERGENT_SEAT_PRESSURE:GENERAL:mp_404+mp_407` |
| SUBJECT | E |
| INTENT | PROBABILITY |
| AXIS | GENERAL |
| TARGET | `NATAL_SEAT:YEAR` (NATAL_SEAT) — 원국 년주 |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `CONVERGENT_SEAT_PRESSURE` |
| SUPPORTING_PARENTS | `mp_407`, `mp_404` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_407`, `p:mp_404` |
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

#### `RECURRING_FRICTION_CAUSE|E|RELATION_STABILITY|NATAL_SEAT:DAY|CAUSAL|WOLWOON`

| 항목 | 값 |
|---|---|
| CANDIDATE_ID | `d:RECURRING_FRICTION_CAUSE:RELATION_STABILITY:mp_399+mp_403+mp_405+mp_408` |
| SUBJECT | E |
| INTENT | PROBABILITY |
| AXIS | RELATION_STABILITY |
| TARGET | `NATAL_SEAT:DAY` (NATAL_SEAT) — 원국 일지(배우자·자기 자리) |
| CONCLUSION_TYPE | CAUSAL |
| TEMPORAL_SCOPE | WOLWOON |
| DERIVATION_RULE | `RECURRING_FRICTION_CAUSE` |
| SUPPORTING_PARENTS | `mp_399`, `mp_403`, `mp_405`, `mp_408` |
| OPPOSING_PARENTS | — |
| DERIVED_FROM | `p:mp_399`, `p:mp_403`, `p:mp_405`, `p:mp_408` |
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
