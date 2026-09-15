# RUBRIC KNOWN LIMITATIONS

Scope: the controlled same-scorer rubric `FINAL_BLIND_84_100PT_V1`, as implemented in
`C:\Development\DeokbunAI-blind84-final\.runtime\v8_compare_score.mjs`
(sha256 `43c9c001e8a604736b87512f2d656e3f8a44d052366d6dabaf8c0a8634c39bdd`).

Status: **DRAFT — not committed.** Recorded during Phase 0.5 of the V8 controlled scoring task.

---

## L-1 — Internal structure metadata drives the quality score

현 rubric의 `sys` 는 `AUTHORITATIVE_REFERENCE.material_contributors` 의 **길이**이며,
Personalization / Depth / Cross / Contradiction 네 축과 PUV 의 `ungrounded` 판정을 구동한다.
사용자 가시 텍스트가 아닌 **내부 구조 metadata 가 품질점수를 구동하는 구조적 한계**다.
V1 비교에서는 same-scorer 유지를 위해 변경하지 않는다.

### 영향 범위 (총 100점 중 60점)

| 축 | 배점 | `sys` 의존 방식 |
|---|---|---|
| Personalization | 20 | 기저값이 `sys≥3→12 / sys==2→11 / else 8`, `ungrounded→2` |
| Interpretive depth | 15 | `7 + (sys≥3 ? 2 : 0) − (sys==1 ? 2 : 0)`, `ungrounded→6` |
| Cross | 15 | **전적으로** `sys`: `≥3→10 / ==2→8 / else 5`, `ungrounded→1` |
| Contradiction | 10 | `ungrounded→3` (그 외에는 텍스트 마커로 결정) |
| PUV | — | `ungrounded`(= `sys === 0`)이면 무조건 `BORDERLINE` |

### 왜 문제인가

- **Cross 축은 교차가 답변에 보이는지를 전혀 측정하지 않는다.** 기여 엔진 *개수*만 센다.
  세 엔진이 기여했지만 답변 본문에 교차 서술이 한 줄도 없는 케이스와, 세 엔진이 기여하고
  교차가 명시적으로 서술된 케이스가 동일 점수를 받는다.
- **Depth 축의 실효 상한은 9/15**이고, 그중 2점이 `sys` 에서 나온다. 해석의 깊이가 아니라
  파이프라인 결선 상태를 측정한다.
- 결과적으로 **엔진 결선을 늘리면 사용자 답변을 한 글자도 바꾸지 않고 점수가 오른다.**
  이는 rubric 이 측정하려는 "유료 사용자 체감 가치"와 방향이 어긋난다.

### 왜 지금 고치지 않는가

Original / V6.1 / V7.1 / V8 4-way 비교의 유일한 타당성 근거는 **네 버전에 완전히 동일한
채점기를 적용했다**는 점이다. `sys` 의존을 걷어내면 그 순간 V7.1 패스와 같은 rubric 이
아니게 되고, 기존 baseline 수치(75건 패널 기준)도 함께 이동하여 역사적 비교가 전부 무효화된다.
따라서 **V1 비교 종료 시점까지 동결**한다.

### 해제 조건 / 후속

- V1 비교 리포트 확정 후, `cross_15` 를 답변 텍스트 기반 *cross visibility* 로 교체하고
  `depth_15` 에서 `sys` 항을 제거한 `V2` rubric 을 별도 정의한다.
- V2 도입 시 네 버전 전체를 V2 로 재채점해 신·구 스케일을 같은 문서에 병기한다.
  V1 점수와 V2 점수를 섞어서 인용하지 않는다.

---

## L-2 — "Blind" 는 절차적 장치이며 평가자 편향 방어가 아니다

채점기는 버전 분기가 없는 결정론적 코드다. `VERSION_A..D` 라벨링과 sealed mapping 은
*버전별 분기 코드가 실수로 작성되는 것*을 막는 장치이지, LLM 평가자의 편향을 막는 장치가 아니다.
리포트에서 "blind 채점"이라고 쓸 때 LLM judge 가 blind 였다는 의미로 읽히지 않도록 명시할 것.
덧붙여 mapping 파일은 채점기와 같은 `.runtime/` 에 있으므로, seal 은 관례이지 강제가 아니다.

---

## L-3 — 여러 축의 실효 상한이 명목 배점보다 낮다

명목 100점이지만 어떤 답변도 도달할 수 없는 구간이 있다.

| 축 | 명목 | 실효 상한 |
|---|---|---|
| Interpretive depth | 15 | 9 |
| Cross | 15 | 10 |
| Actionability | 5 | 3 |
| Readability | 5 | 3 |
| Trust | 5 | 4 |

따라서 "총점 100점 만점 대비 X%" 형태의 서술은 오독을 부른다.
점수는 **버전 간 상대 비교로만** 사용하고, 절대 백분율로 해석하지 않는다.

---

## L-4 — PUV YES 는 Specific Evidence 에 종속된다

`paying_user_value === 'YES'` 는 `specific_evidence_visible === true` 를 필수 전제로 한다
(추가로 `action_lines ≥ 1`, 비-DECLINED, 비-RAW_ENGINE_FACT, non-directional close 아님).
두 지표를 나란히 놓은 표에서 **독립 지표처럼 읽히지 않게** 각주를 달 것.
`specific_evidence_visible` 자체도 `axis` 를 요구하므로 `decisionMeta.divinationVerdict` 부재 시
자동으로 false 가 된다 — 이 역시 L-1 과 같은 계열의 metadata 의존이다.

---

## L-5 — Actionability 의 `+1` 은 V7 이후 섹션 구조에만 존재한다

`action_lines` 는 액션 섹션 라인 수에 더해, `이 결론을 어떻게 보면 되나요` 섹션이 존재하면 **+1**
한다. 이 섹션은 V7 계열에서 도입된 구조이므로, 이 `+1` 은 Original / V6.1 에는 사실상
적용되지 않는다. 채점기는 이를 인지하고 `consultation_score_no_compound_action` (해당 `+1`
없는 총점)을 병행 산출한다. **버전 비교표에는 두 값을 모두 싣고**, 한쪽만 인용하지 않는다.
