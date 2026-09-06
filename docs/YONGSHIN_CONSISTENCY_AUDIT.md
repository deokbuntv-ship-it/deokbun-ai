# 용신(Yongshin) 계산 내부 일관성 감사

작성: 2026-09-02 · 작성자: Claude (Claude Code, Opus 5) · **읽기 전용 감사 — 코드 수정 0건**

> **감사 대상은 명리 교리의 옳고 그름이 아니다.** 이 문서는 오직 "코드가 스스로 선언한 규칙을 스스로 어기는가"만
> 판정한다. 어느 유파가 맞는지, 억부가 옳은지는 다루지 않는다.

**판정: `INCONSISTENT`** — 자기모순 3건 확정(F1 · N2 · F8), 사용자에게 보이는 렌더 결함 1건 확정(N3),
소비 단계의 구조적 편향 1건 확정(N11). **Premium 에 결론 근거로 쓰는 것은 보류를 권고한다.** 상세는 §5.

---

## 0. 방법과 재현

| 항목 | 내용 |
|---|---|
| 실측 하네스 | 실제 파이프라인이 쓰는 그 함수를 그대로 호출: `executeSajuFromBirthInput` → `natalContextFromFourPillars` → `calculateDayMasterStrengthInputs`/`calculateMonthCommand`/`calculateRootingTransparency`/`calculateTenGodFacts`/`calculateNatalRelations` → `judgeMyungriStructuralV2FromStrengthInputs` → `judgeMyungriYongshin`. 재료 조립은 `reasoning/myungriReasoner.ts:147-168` 을 1:1로 복제 |
| 표본 | 로스터 REG4-SUBJ-01~12 (12명) + 합성 극단 8건 = **19개 차트** |
| 결정론 | **통과** — 전원 2회 계산 후 결과 객체 바이트 비교 동일 |
| 적대적 검증 | 후보 결함 7건 × 렌즈 3종(코드 오독 / 문서화된 의도 / 실제 도달 가능성) = 21회 반증 시도. **7건 중 2건만 2-of-3 다수결 생존** |
| 코퍼스 | B84 아티팩트 4개 파일 336 레코드(전달 314건) 스트리밍 집계 |
| LLM 제품 호출 | **0콜** (OpenAI/Edge 호출 없음) |
| 합성 입력 | 계산에만 사용, 저장하지 않음 |

임시 하네스 2개(`zzz_yongshin_audit_harness.test.ts`, `zzz_n3_probe.test.ts`)는 감사 후 삭제했다.
재현이 필요하면 이 문서의 §3 표와 §2 트리거 조건으로 다시 만들 수 있다.

---

## 1. 규칙 명문화 — 코드가 무엇을 하기로 했는가

### 1.1 신강/신약 — **임계값이 존재하지 않는다**

수치 비교가 코드 어디에도 없다. 판정은 단 하나의 순수 함수, 2×2 분기다.

```ts
// src/features/divination/myungriStructuralV2.ts:159
export function runStructuralSynthesis(rootFact: RootExistsFact, seasonFact: SeasonRoleFact): StructuralState {
  if (rootFact === 'ROOT_EXISTS_UNKNOWN') return 'UNRESOLVED';
  if (seasonFact === 'NEUTRAL') return rootFact === 'ROOT_EXISTS_TRUE' ? 'ANCHORED' : 'UNANCHORED';
  const seasonSupports = seasonFact === 'IN_COMMAND' || seasonFact === 'SUPPORTED';
  const rootSupports = rootFact === 'ROOT_EXISTS_TRUE';
  if (rootSupports && seasonSupports) return 'ANCHORED';
  if (!rootSupports && !seasonSupports) return 'UNANCHORED';
  return 'MIXED_STRUCTURE';
}
```

두 입력의 정의:

| 입력 | 산출 방식 | 위치 |
|---|---|---|
| `rootFact` | `dayMasterRootPositions`(통근) **∪** `peerHiddenPositions`(득지) 가 하나라도 있으면 `TRUE`. 하나도 없고 시주를 알면 `FALSE`. 하나도 없고 **시주 미상이면 `UNKNOWN`** | `myungriStructuralV2.ts:378-382` |
| `seasonFact` | 월령 왕상휴수사를 그대로 사상 — `WANG:'IN_COMMAND', XIANG:'SUPPORTED', XIU:'NEUTRAL', QIU:'DRAINED', SI:'OPPOSED'` | `:316` |

라벨은 1:1 전단사로 붙는다.

```ts
// :170
ANCHORED: 'STRONG_LEANING', UNANCHORED: 'WEAK_LEANING',
MIXED_STRUCTURE: 'MIXED_EVIDENCE', UNRESOLVED: 'UNRESOLVED',
```

### 1.2 다섯 rationale 의 발화 조건

| rationale | 발화 조건 | 코드 |
|---|---|---|
| `SPECIAL_STRUCTURE_CONSTRAINT` | `specialStructureStatus.status === 'CANDIDATE'` (= `OPPOSED` 계절 ∧ `ROOT_EXISTS_FALSE`) — **전체 결과를 게이트하고 즉시 반환**, 일반 용신을 세우지 않음 | `myungriYongshin.ts:225` |
| `EOKBU` | `structuralState` 가 `UNANCHORED` 또는 `ANCHORED` 일 때만. `MIXED_STRUCTURE`/`UNRESOLVED` 는 `null` | `:119, :139, :163` |
| `TONGGWAN` | 원국에 **실제 지지충**이 있고, 두 지지의 오행이 극(剋) 관계이며, 중재 원소가 존재할 때 | `:167-189` |
| `BYEONGYAK` | `structuralState === 'MIXED_STRUCTURE'` 일 때만. **후보를 만들지 않고** 문제 진술만 `uncertaintyReasons` 에 넣음 | `:191-195` |
| `JOHOO` | **영구 미발화.** `johooStatus: 'DEFERRED'` 는 리터럴이며 어떤 코드 경로도 조후를 계산하지 않음 | `:74` |

### 1.3 각 방식의 원소 선택 규칙

**EOKBU / UNANCHORED** (`:119-137`)
- 용신 = `PEER`(비겁, 일간과 같은 오행) · 희신 = `RESOURCE`(인성) · 기신 = `OFFICER`(관성)

**EOKBU / ANCHORED** (`:139-162`)
- 우선순위 배열 `['OUTPUT','WEALTH','OFFICER']` 를 순회하며 **원국에 실제로 존재하는(존재 여부만, 개수 아님)** 첫 계열을 용신으로
- 희신 = 남은 것 중 존재하는 첫 계열, 없으면 용신과 동일 (`?? chosen` — **N3 의 원인**)
- 기신 = `RESOURCE` 고정
- 세 계열이 하나도 없으면 `null` 반환 → 억부 미발화

**TONGGWAN** (`:167-189`)
- 충 쌍 중 극 관계인 첫 쌍을 찾아 `mediatorBetween(극하는쪽, 극당하는쪽)` — 오행 상생 순환에서 기계적으로 계산
- 희신·기신 없음

**BYEONGYAK** — 원소를 만들지 않음.

### 1.4 희신 · 기신 · 구신

| 개념 | 필드 | 비고 |
|---|---|---|
| 용신 | `primaryCandidate: FiveElement \| null` | |
| 희신 | `supportingCandidates: FiveElement[]` | **중복 제거 없음** (§2 N3) |
| 기신 | `contraindicatedCandidates: FiveElement[]` | 억부가 발화했을 때만 채워짐 |
| **구신** | **존재하지 않음** | 모듈 말미 핸드오프 노트: *"Heesin/Gisin as a separate labelled taxonomy — supportingCandidates/contraindicatedCandidates already cover the V1 product need (§22); no separate expansion attempted."* |

### 1.5 조후 DEFERRED 사유 — 원문 인용

`myungriYongshin.ts:16-21`:

> JOHOO (조후) — DEFERRED. The live pipeline has never asserted an extreme-season fact
> (`NatalStructureInput.strengthInputs.extremeSeason` is always `null` in production — see
> `consultationGrounding.ts`'s own comment: "조후는 억부와 다른 학파의 관점이라, 억부 판정을 대신하지
> 않습니다" / "조후는 canonical extreme-season rule 없이 assert하지 않는다"). This module does not
> invent that rule either — deferred, not guessed.

`:325-328` 핸드오프 노트:

> JOHOO (조후) — no canonical extreme-season rule exists anywhere in this repository (confirmed by
> reading consultationGrounding.ts's own `extremeSeason: null` comment); inventing one here would be
> exactly the kind of doctrine invention this whole program has repeatedly rejected elsewhere.

**평가: 이 보류는 정직하고 일관된다.** 규칙이 없어서 안 한다고 적어 두고 실제로 안 한다.

### 1.6 방식이 충돌할 때 무엇이 이기는가

우선순위는 **데이터가 아니라 제어 흐름에 하드코딩**돼 있다 (`:243-321`):

1. `SPECIAL_STRUCTURE_CONSTRAINT` — 있으면 즉시 반환, 나머지 전부 무시
2. 억부·통관 **둘 다 발화** → 상충 검사
   - `worsens` 이면 `MULTI_CANDIDATE` (용신 없음, **기신은 유지** — F2)
   - 아니면 `SELECTED`, **통관이 용신**, 억부의 primary/supporting 은 희신으로 강등
   - 근거는 인라인 한국어 주석 한 줄: *"통관(즉각적 구조 장애 해소)이 억부(일반 보강)보다 우선"*
3. 억부만 → 억부가 용신
4. 통관만 → 통관이 용신
5. 둘 다 없음 → `UNRESOLVED`

상충 검사 자체:
```ts
// :267-270
const eokbuNeedsSupport = sv2.structuralState === 'UNANCHORED';
const worsens = eokbuNeedsSupport
  ? tongFamily === 'OUTPUT' || tongFamily === 'WEALTH' || tongFamily === 'OFFICER'
  : tongFamily === 'RESOURCE' || tongFamily === 'PEER';
```

---

## 2. 자기모순 검사 결과

### 판정 요약

| # | 항목 | 결과 | 근거 |
|---|---|---|---|
| **F1** | ANCHORED 근거 문장이 없는 계절 지원을 사실로 단언 | **확정 (3/3)** | 코드 + 실측 |
| **F2** | `MULTI_CANDIDATE` 가 용신은 접고 기신만 남김 | **확정 (2/3)** | 코드 + 실측 |
| F3 | 통관이 일간 자신의 오행을 용신으로 | **기각 (0/3)** | 설계·테스트로 명시됨 |
| F4 | `SELECTED` 와 병약 불확실성 공존 | **기각 (0/3)** | status 는 후보 **개수** 의미, 확신도 아님 |
| F5 | 우선순위 분기 도달 불가 | **기각 (0/3)** | 도달함 (SUBJ-06 등) |
| F6 | `familyOf`/`elementForFamily` fail-soft | **기각 (0/3)** | 25쌍 전수로 도달 불가 증명 |
| F7 | 표본 편향 | **기각 (0/3)** | 편향은 사실이나 규칙 위반 아님 → §3 으로 이동 |
| **F8** | 같은 문장이 LLM 이 쓰면 답변 폐기, 서버가 쓰면 정상 출고 | **확정** | 정규식 실행으로 증명 |
| **N2** | 헤더 "라벨만으로 판단 안 한다" 선언 ↔ 실제 시그니처 | **확정** | 코드 |
| **N3** | `supportingCandidates` 중복 → 사용자에게 "금(金), 금(金)" | **확정** | 실행으로 재현 |
| **N11** | 지지 쪽만 status 가드, 경고 쪽은 없음 | **확정** | 코드 |
| N1 | 통관 후보는 구조적으로 `{WOOD, WATER}` 2개뿐 | 확정(사실) | 코드 |
| N9 | Structural V2 의 불확실성 신호 4종을 용신이 전혀 안 읽음 | 확정(사실) | 코드 |
| N12 | 최다 경로(억부 단독 ANCHORED SELECTED)의 `status`/`primary` 를 검증하는 테스트가 없음 | 확정(사실) | 테스트 |

---

### (a) 방향 모순 — **위반 0건**

신약이면 돕는 오행, 신강이면 덜어내는 오행이라는 방향은 19개 차트 전부에서 지켜졌다.

- `UNANCHORED`(2건, SYN-B/F): 용신 `PEER`, 희신 `RESOURCE`, 기신 `OFFICER` — 전부 보강 방향
- `ANCHORED`(13건): 용신은 `OUTPUT`/`WEALTH` 만, 기신은 예외 없이 `RESOURCE` — 전부 배출 방향
- 뒤집힌 사례 **0건**

테스트가 이 불변식을 직접 잠그고 있다 (`myungriYongshin.test.ts:72-76`).

> ⚠ 다만 **방향의 근거가 되는 "신강" 판정 자체**가 F1 의 문제를 안고 있다. 방향은 라벨과 일치하지만,
> 라벨이 틀린 근거로 붙은 경우가 있다.

### (b) 용신–기신 충돌 — **위반 0건**

19건 전부에서 `primaryCandidate ∉ contraindicatedCandidates`. 오행 5개 체계에서 십신 계열은 전단사이므로
`OUTPUT ≠ RESOURCE`, `PEER ≠ OFFICER` 가 구조적으로 보장된다. 상생 관계로 잘못 배정된 사례도 없다.

### (c) 방식 선택의 자의성 — **명시적이나, 근거가 코드 밖에 없다**

같은 조건에서 다른 방식이 선택되는 사례는 **없다** — 선택은 완전히 결정론적이다. 그러나:

- 우선순위는 **배열이 아니라 if/else 제어 흐름**에 있다. 유일한 근거 진술은 인라인 주석 한 줄이다:
  `"통관(즉각적 구조 장애 해소)이 억부(일반 보강)보다 우선 — 서로 상충하지 않을 때만."`
- `docs/` 어디에도 이 우선순위를 정당화한 문서가 없다.
- 이 우선순위를 기록하는 필드 `reasoning[]` 은 **소비자가 0명**이다 (N10).

즉 자의적이지는 않으나 **감사 불가능**하다.

### (d) 결정론 — **통과**

19개 차트 전원 2회 계산, 결과 객체 JSON 바이트 동일. 시계·난수·네트워크·LLM 의존 없음.

### (e) 경계값

| 입력 | 동작 | 평가 |
|---|---|---|
| 시각 미상 + 뿌리 0 | `rootFact = ROOT_EXISTS_UNKNOWN` → `UNRESOLVED` → 용신 세우지 않음 (SUBJ-11) | **정직** |
| 시각 미상 + 뿌리 있음 | 그대로 진행, **불확실성 표시 0** (SUBJ-09, SUBJ-12) | ⚠ N9 |
| 절기 경계일 + 시각 미상 | 차트 자체가 `UNAVAILABLE` → 용신 이전에 차단 (SUBJ-10) | **정직** |
| 배출구 계열이 하나도 없음 | 억부 `null` → 통관 없으면 `UNRESOLVED` | **정직** |
| 배출구 계열이 **정확히 하나** | `?? chosen` 폴백 → 희신 = 용신 → 경로에 따라 **중복 배열** | ⚠ **N3** |
| 극 관계 아닌 충(丑未·辰戌) | `continue` 로 버림 | 의도됨 |
| 예외 던짐 | **없음.** 모든 실패는 `UNRESOLVED`/빈 배열로 표현 | 일관됨 |

---

### F1 — ANCHORED 근거 문장이 없는 사실을 단언한다 ★ 확정 3/3

`XIU`(휴)는 `NEUTRAL` 로 사상되고, `NEUTRAL` 은 뿌리만으로 `ANCHORED` 를 결정한다. 계절은 아무것도
기여하지 않았다. `myungriStructuralV2.ts:179` 는 그 사실을 스스로 이렇게 쓴다:

> `case 'NEUTRAL': return '계절이 일간의 힘을 밀지도 빼지도 않습니다(休).';`

그런데 같은 상태에서 용신 모듈은 이렇게 출력한다:

```ts
// myungriYongshin.ts:140  (주석)
// DM has both root and season support — no deficiency to reinforce.
// :157
reasoning: `일간이 뿌리와 계절 양쪽에서 힘을 받아 여유가 있어, ...`
// :158
evidence: [ev(`구조 상태 ${structuralState}`, '일간이 뿌리와 계절 양쪽에서 힘을 받는 구조입니다.'), ...]
```

**구조적 원인**: `runEokbu(structuralState, dayMasterElement, familyExists)` — `seasonFact` 파라미터가
**아예 없다**. 함수는 `TRUE+NEUTRAL` 과 `TRUE+SUPPORTED` 를 구별할 수단이 없는데도 후자를 단언한다.
이는 모듈 헤더 `:8-10` 의 선언과 정면으로 어긋난다:

> Every candidate is derived by inspecting the ACTUAL structural facts (root existence, **season role**, ...)

**실측 도달**: SUBJ-06 (FIRE / 겨울 / XIU / 뿌리 1). 19건 중 유일하다 — SYN-B 는 다른 XIU 차트이나
뿌리 0 이라 `UNANCHORED` 로 가고, 그 쪽 문장(`'일간이 뿌리도 계절의 도움도 받지 못해'`)은 부정 진술이라
NEUTRAL/DRAINED/OPPOSED 어디서나 참이다. **UNANCHORED 분기는 결함이 아니다.**

**⚠ 사용자 도달 — 감사 중 가장 중요한 발견**
용신 모듈의 `candidates[].reasoning`/`.evidence` 는 소비자가 0명이라 이 문장 자체는 내부에 머문다.
그러나 **동일한 거짓 절이 사용자에게 나가는 쌍둥이가 있다**:

```ts
// src/features/divination/reasoning/myungriPremises.ts:82
STRONG_LEANING: '일간이 계절과 뿌리 양쪽에서 힘을 받는 구조입니다.',
```

이것은 `docs/DIVINATION_QA_PACK.md:24` 에 실제 전달문으로 기록돼 있다. 즉 **F1 은 내부 문자열 문제가
아니라 출고 문장 문제다.** (이 쌍둥이는 용신 모듈 밖이므로 수정은 별도 트랙이다 — 이번 감사는 보고만 한다.)

**테스트 공백**: 픽스처 `CHART.ANCHORED_NEUTRAL`(甲/午月/NEUTRAL/뿌리 있음)이 이미 존재하고 테스트 B 가
이 분기를 실행하지만, **출력 한국어 문장을 검증하는 테스트는 레포 전체에 0건**이다.

---

### F2 — MULTI_CANDIDATE 가 용신은 접고 기신만 남긴다 ★ 확정 2/3

```ts
// :271-283
return {
  status: 'MULTI_CANDIDATE', primaryCandidate: null,
  supportingCandidates: [], contraindicatedCandidates: [eokbu.contraindicated],
  ...
  conclusion: '억부가 필요로 하는 방향과 통관 후보가 서로 상충해, 우선순위를 하나로 정할 근거가 없습니다.',
};
```

반증 렌즈 하나(self-consistency)는 *"`contraindicated` 는 억부의 발화 여부만 추적하며 6개 반환 경로 전부가
같은 불변식을 지킨다 — 코드가 세운 규칙을 어긴 것은 아니다"* 라며 기각했고, 이는 타당한 지적이다.
그러나 나머지 두 렌즈가 더 날카로운 형태로 확정했다:

> **`MULTI_CANDIDATE` 분기는 오직 기신 쪽에 대한 이견이 있을 때만 발화한다.** `ANCHORED` 에서
> `worsens = tongFamily ∈ {RESOURCE, PEER}` 이고(`:270`), 억부의 기신은 바로 그 `RESOURCE` 원소다(`:151`).
> 관측된 4건 전부 `ANCHORED` 이고, FIRE 일간 3건은 `tonggwan.element === WOOD === contraindicated` 임이
> 증명된다. 따라서 한 결과 안에 `"WOOD가 후보로 성립합니다"`(`:184`)와 `contraindicated: [WOOD]` 가
> 동시에 실린다. **"정할 근거가 없다"고 선언한 바로 그 명제를 억부 편으로 정해 버린다.**

**실측 도달**: 4/19 (SUBJ-06, SYN-A, SYN-E, SYN-H).
**테스트 공백**: `myungriYongshin.test.ts:161-165` 는 `primaryCandidate` 가 null 임만 단언하고
`contraindicatedCandidates` 는 보지 않는다.

---

### F8 — 같은 문장이 LLM 이 쓰면 답변 전체 폐기, 서버가 쓰면 정상 출고 ★ 확정 (실행 증명)

`src/features/chat/prompts/structuredConsultation.ts:259` 의 `FORBIDDEN_THEORY` 는
`용신(은|이)\s*(?!아직|없|미|계산|불명|모름|따로|판정)\S` 를 잡아 **LLM 답변 전체를 폐기**한다(`:402`).
그런데 엔진이 스스로 만드는 문장이 이 정규식에 매치된다. 직접 실행 결과:

```
MATCH  억부용신이 피해야 할 방향이 활동·재물 계열과 겹쳐, 무리한 확장은 구조를 해칠 수 있습니다.
MATCH  억부용신이 재물 계열과 겹쳐, 재물 흐름이 구조적으로 막혀 있지 않습니다.
no     억부용신 방향이 활동·재물 계열과 맞아, 사업 실행을 구조적으로 뒷받침합니다.
```

앞의 두 문장은 `myungriConsultationJudge.ts:137` / `:204` 의 리터럴이다. 이 문자열들은
① `renderContentPlanDirective` 를 통해 **LLM 프롬프트에 참고 근거로 주어지고**,
② 동시에 서버가 `renderVerifiedEvidenceSection` 으로 **검열 없이 사용자에게 출력**한다.
`FORBIDDEN_THEORY` 는 LLM 파싱 출력에만 걸리고 서버 렌더 섹션은 통과하지 않는다.

즉 LLM 이 서버가 준 근거를 그대로 인용하면 그 답변은 통째로 버려진다. 규칙이 자기 자신을 문다.

세 번째 문장(`억부용신 방향이`, 조사 없음)만 통과하는데, **코퍼스에서 실제로 사용자에게 도달한 4개
템플릿이 전부 이 형태다** (§4). 우연한 정합이다.

---

### N2 — 헤더의 "라벨만으로 판단하지 않는다"가 실제 시그니처와 반대 ★ 확정

헤더 `:5-10`:
> STRENGTH != YONGSHIN. This module NEVER shortcuts: `STRONG_LEANING -> WEALTH/OFFICER/OUTPUT`,
> `WEAK_LEANING -> RESOURCE/PEER`. Every candidate is derived by inspecting the ACTUAL structural facts
> ... never the label alone.

그러나 `runEokbu(structuralState, ...)` 와 `runByeongyak(structuralState)` 는 `structuralState` **하나만**
받는다. `rootFact`/`seasonFact` 는 이 모듈에 전달조차 되지 않는다(`MyungriStructuralV2Result` 가 필드로
노출하지 않고 `reasoningTrace[].conclusion` 문자열 안에만 있다). 헤더가 나열한 세 사실 중 실제로 읽히는
것은 **충 오행 하나뿐**이다.

그리고 `STRUCTURAL_STATE_TO_STRENGTH` 는 엄격한 1:1 전단사이므로
`structuralState === 'UNANCHORED'` ⟺ `classification === 'WEAK_LEANING'` 이다.
**정보이론적으로 라벨 분기와 완전히 동일하다.** 이름만 다르다.

이를 막으려는 테스트 L(`myungriYongshin.test.ts:196-206`)은 **소스 텍스트를 grep 해
`/strengthView\.|WEAK_LEANING|STRONG_LEANING/` 이 없음을 확인할 뿐**이다. 동형 이름 `structuralState`
를 쓰면 무조건 통과한다. 행동 보증은 0이다.

---

### N3 — 희신 배열에 같은 원소가 두 번 들어가 "금(金), 금(金)" 으로 출고된다 ★ 확정 (실행 재현)

```ts
// :150  배출구 계열이 정확히 하나뿐이면 `?? chosen` 이 발동해 supporting === primary
const supporting = elementForFamily(dayMasterElement, priority.find((f) => f !== chosen && familyExists(f)) ?? chosen);
// :288  중재자가 둘 중 어느 쪽도 아니면 필터가 아무것도 못 걸러 [X, X] 가 남는다
supportingCandidates: [eokbu.primary, eokbu.supporting].filter((e) => e !== tonggwan.element),
```

억부 단독 경로(`:304`)는 `.filter(e => e !== eokbu.primary)` 로 `[]` 를 만들어 정직한데,
억부+통관 SELECTED 경로만 중복을 남긴다. 렌더러는 중복 제거를 하지 않는다:

```ts
// reasoning/myungriPremises.ts:356-357
? ` 함께 쓸 수 있는 방향은 ${y.supportingCandidates.map((e) => ELEMENT_LABEL[e]).join(', ')}입니다.`
```

**실행 재현** (EARTH 일간 / ANCHORED / OUTPUT 계열만 존재 / 子午충):
```json
{"status":"SELECTED","primary":"WOOD","supporting":["METAL","METAL"],"contra":["FIRE"],
 "fired":["EOKBU","TONGGWAN"],"rendered":"METAL, METAL"}
```
→ 유료 사용자 화면: **"함께 쓸 수 있는 방향은 금(金), 금(金)입니다."**

19개 표본에서는 발화하지 않았다. SUBJ-02/04/07 이 EARTH·ANCHORED 이지만 충이 0이라 **한 칸 차이로**
비켜갔다. 즉 우연히 안 나온 것이지 막혀 있는 것이 아니다.

---

### N11 — 지지 쪽만 status 가드가 있고 경고 쪽은 없다 ★ 확정

```ts
// myungriConsultationJudge.ts:65-73
function yongshinSupportsFamily(...) {
  if (yongshin.status !== 'SELECTED' && yongshin.status !== 'MULTI_CANDIDATE') return null;   // 가드 O
  const candidates = [yongshin.primaryCandidate, ...yongshin.supportingCandidates]...
}
function yongshinWarnsAgainstFamily(...) {
  return yongshin.contraindicatedCandidates.find(...) ?? null;                                 // 가드 X
}
```

`MULTI_CANDIDATE` 에서는 `primaryCandidate=null`, `supportingCandidates=[]` 이므로
`yongshinSupportsFamily` 는 **항상 null**이다. 반면 `contraindicatedCandidates` 는 채워져 있고 가드가
없으므로 경고는 정상 작동한다.

→ **"방향을 하나로 정할 근거가 없다"고 선언한 사주에서 용신은 RISK 만 만들고 OPPORTUNITY 는 원리적으로
만들 수 없다.** F2 의 필드 비대칭을 소비 단계에서 한 번 더 증폭한다. 4/19 가 여기 해당한다.

---

### 그 외 확정 사실 (규칙 위반은 아니나 기록)

- **N1 — 통관 후보 원소는 `{WOOD, WATER}` 2개뿐.** 프로즌 육충 6쌍 중 극 관계인 것은 子午·巳亥(→WOOD),
  寅申·卯酉(→WATER) 넷뿐이고 丑未·辰戌은 버려진다. FIRE·EARTH·METAL 은 **어떤 사주에서도** 통관 용신이
  될 수 없다. 헤더는 *"고정 표로 조회하지 않고 기계적으로 계산"* 한다고 선언하지만 입력 정의역이 닫혀
  있어 결과적으로 2원소 룩업과 동치다. 파생 결과로 `worsens` 판정은 사실상 **일간 오행 상수**로 결정된다
  (WOOD 일간 + ANCHORED + 통관 가능 충 → 항상 MULTI_CANDIDATE).
- **N9 — Structural V2 의 불확실성 신호 4종을 용신이 전혀 읽지 않는다**: `confidenceClass`, `hourKnown`,
  `numerousnessEvidence.incompleteCount`, `strengthView.doesNotImply`. 결과적으로 억부 단독 `SELECTED`
  의 `uncertaintyReasons` 는 **항상 `[]`** 이다(병약은 MIXED 에서만 나오는데 거기선 억부가 null).
  시주가 통째로 없는 SUBJ-09·SUBJ-12 도 불확실성 0으로 나간다.
- **N10 — `MyungriYongshinResult` 11개 필드 중 4개(`candidates`/`evidence`/`reasoning`/`johooStatus`)는
  라이브 소비자가 0.** 우선순위를 기록하는 `reasoning[]` 자체가 읽히지 않는다. 부수적 다행: `:157` 의
  `"실제로 존재하는 OUTPUT 계열 기운을…"` 같이 영문 enum 이 한국어에 보간된 문자열이 노출되지 않는다.
  이 필드가 표면화되는 순간 조사 처리 없이 그대로 나간다.
- **N12 — 최다 경로에 테스트가 없다.** 19장 중 13장이 도는 `ANCHORED + 억부 단독 SELECTED` 경로의
  `status`/`primaryCandidate` 를 검증하는 테스트가 레포 전체에 없다. 억부 SELECTED 커버리지는
  `UNANCHORED` 에만 있다. 더불어 테스트 `:168` "억부의 필요와 통관 중재자가 일치" 는 `NO_FAMILIES` 를
  쓰므로 억부가 아예 발화하지 않아 **제목이 주장하는 상황을 한 번도 실행하지 않는다**. 테스트 B(`:63`)는
  제목이 *"selects an outlet"* 이지만 실제 결과는 `MULTI_CANDIDATE`(아무것도 선택 안 함)다.

---

## 3. 표본 분포 (19개 차트)

### 3.1 전체

| who | 일간 | 계절 | 왕상휴수사 | 뿌리 | 시주 | structuralState | 강약 라벨 | 충 | status | 용신(계열) | 희신 | 기신 | 발화 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SUBJ-01 | 火 | 봄 | 相 | 2 | O | ANCHORED | STRONG | 0 | SELECTED | 土(OUTPUT) | 金 | 木 | 억부 |
| SUBJ-02 | 土 | 여름 | 旺 | 3 | O | ANCHORED | STRONG | 0 | SELECTED | 金(OUTPUT) | 木 | 火 | 억부 |
| SUBJ-03 | 木 | 가을 | 囚 | 1 | O | MIXED_STRUCTURE | MIXED | 2 | SELECTED | 木(PEER) | — | — | 병약+통관 |
| SUBJ-04 | 土 | 여름 | 相 | 3 | O | ANCHORED | STRONG | 0 | SELECTED | 金(OUTPUT) | 木 | 火 | 억부 |
| SUBJ-05 | 水 | 가을 | 相 | 0 | O | MIXED_STRUCTURE | MIXED | 1 | SELECTED | 水(PEER) | — | — | 병약+통관 |
| SUBJ-06 | 火 | 겨울 | 休 | 1 | O | ANCHORED | STRONG | 1 | **MULTI** | — | — | 木 | 억부+통관 |
| SUBJ-07 | 土 | 여름 | 旺 | 3 | O | ANCHORED | STRONG | 0 | SELECTED | 金(OUTPUT) | 水 | 火 | 억부 |
| SUBJ-08 | 水 | 겨울 | 旺 | 2 | O | ANCHORED | STRONG | 0 | SELECTED | 火(WEALTH) | 土 | 金 | 억부 |
| SUBJ-09 | 土 | 봄 | 旺 | 3 | **X** | ANCHORED | STRONG | 0 | SELECTED | 水(WEALTH) | 木 | 火 | 억부 |
| SUBJ-10 | — | — | — | — | X | **차트 UNAVAILABLE** (절기 경계일 + 시각 미상) | | | | | | | |
| SUBJ-11 | 金 | 봄 | 囚 | 0 | **X** | UNRESOLVED | UNRESOLVED | 0 | UNRESOLVED | — | — | — | 없음 |
| SUBJ-12 | 火 | 여름 | 旺 | 2 | **X** | ANCHORED | STRONG | 0 | SELECTED | 土(OUTPUT) | 水 | 木 | 억부 |
| SYN-A 여름정오 | 火 | 여름 | 旺 | 3 | O | ANCHORED | STRONG | 2 | **MULTI** | — | — | 木 | 억부+통관 |
| SYN-B 겨울자정 | 金 | 겨울 | 休 | 0 | O | **UNANCHORED** | **WEAK** | 0 | SELECTED | 金(PEER) | 土 | 火 | 억부 |
| SYN-C 춘분 | 火 | 봄 | 相 | 1 | O | ANCHORED | STRONG | 0 | SELECTED | 土(OUTPUT) | 金 | 木 | 억부 |
| SYN-D 추분 | 水 | 가을 | 相 | 1 | O | ANCHORED | STRONG | 0 | SELECTED | 木(OUTPUT) | 火 | 金 | 억부 |
| SYN-E 시각미상 | 火 | 여름 | 旺 | 2 | **X** | ANCHORED | STRONG | 1 | **MULTI** | — | — | 木 | 억부+통관 |
| SYN-F 입춘직후 | 金 | 봄 | 囚 | 0 | O | **UNANCHORED** | **WEAK** | 0 | SELECTED | 金(PEER) | 土 | 火 | 억부 |
| SYN-G 입추직후 | 木 | 가을 | 死 | 2 | O | MIXED_STRUCTURE | MIXED | 0 | UNRESOLVED | — | — | — | 병약 |
| SYN-H 윤년229 | 木 | 봄 | 旺 | 2 | O | ANCHORED | STRONG | 1 | **MULTI** | — | — | 水 | 억부+통관 |

### 3.2 분포

**신강/신약** — 실제 12명: `ANCHORED`(신강) 8 · `MIXED` 2 · `UNRESOLVED` 1 · 차트 불가 1.
**신약(WEAK_LEANING)은 12명 중 0명이다.** 19건 전체로도 신약은 2건이며 **둘 다 합성**이다.

> 코드상 원인(반증 렌즈가 확인): `rootPositions` 가 통근 **∪** 득지의 합집합이라 어느 지지든 같은 오행
> 지장간 하나만 있으면 `ROOT_EXISTS_TRUE` 가 된다. 그리고 뿌리 없음 + 시주 미상은 `UNANCHORED` 가
> 아니라 `UNRESOLVED` 로 빠진다. 즉 `UNANCHORED` 는 **뿌리 없음 ∧ 시주 앎 ∧ 계절 비지원** 세 조건을
> 모두 요구한다. 편향은 규칙 위반이 아니라 규칙의 귀결이다.

**채택 방식** — 억부 단독 11 · 억부+통관 4 · 병약+통관 2 · 병약 단독 1 · 없음 1.

- **조후 0회** — 설계상 영구 미발화
- **특수구조 0회** — 게이트(`OPPOSED` ∧ 뿌리 없음)를 만족한 차트가 없음. SYN-G 만 `死`(OPPOSED)인데 뿌리 2
- **억부+통관이 동시 발화한 4건은 100% `MULTI_CANDIDATE`** — 즉 둘 다 발화하면 답이 안 나온다

**용신 오행** — 金 5 · 土 3 · 木 2 · 水 2 · 火 1 · (없음) 6. 특정 오행 쏠림은 없다.
**용신 십신계열** — `OUTPUT` 7 · `PEER` 4 · `WEALTH` 2 · (없음) 6.
**`OFFICER` 와 `RESOURCE` 는 한 번도 용신이 되지 않았다.**

> 코드상 원인: `RESOURCE` 는 `ANCHORED` 의 기신으로만 등장하고 용신 경로가 없다. `OFFICER` 는 억부
> 우선순위 `['OUTPUT','WEALTH','OFFICER']` 의 마지막이라 **OUTPUT 과 WEALTH 가 둘 다 원국에 없을 때만**
> 도달한다 — 19건 중 그런 차트가 없었다. 둘 다 규칙의 귀결이며 위반이 아니다.

**기신** — `ANCHORED` 13건 전부 `RESOURCE` 고정 · `UNANCHORED` 2건 `OFFICER` · 나머지 4건 없음.
**희신 없음이 8건(42%)** 이다.

### 3.3 조건이 같은데 결과가 갈리는 쌍

| 쌍 | 공통 | 차이 | 결과 |
|---|---|---|---|
| **SUBJ-12 ↔ SYN-E** | 火 일간 · 旺 · 뿌리 2 · ANCHORED | **충 0 vs 충 1** | `SELECTED` 土 ↔ **`MULTI_CANDIDATE` (용신 없음)** |
| SUBJ-07 ↔ SUBJ-09 | 土 일간 · 旺 · 뿌리 3 · 충 0 · ANCHORED | 원국의 십신 계열 구성 | 金(OUTPUT) ↔ 水(WEALTH) |
| SUBJ-02 ↔ SUBJ-09 | 土 일간 · 旺 · 뿌리 3 · 충 0 · ANCHORED | 원국의 십신 계열 구성 | 金(OUTPUT) ↔ 水(WEALTH) |
| SUBJ-03/05 ↔ SYN-G | 모두 MIXED_STRUCTURE | 충 유무 | `SELECTED` ↔ `UNRESOLVED` |

- 2~3행은 **설명 가능하다** — 억부 사다리가 "존재 여부"로 갈리므로 OUTPUT 계열이 없는 SUBJ-09 는 WEALTH 로
  내려간다. 자의적이지 않다.
- **1행이 문제다.** 나머지 조건이 전부 같은데 **지지충 한 개**가 확정 답을 "정할 수 없음"으로 지운다.
  급변점(cliff)이며, 원인은 §2 F2 의 상충 판정이다.

---

## 4. 현재 상담에서의 실제 사용 실태

### 4.1 도달 경로

```
myungriReasoner.ts:164  judgeMyungriYongshin(...)
  ├─(A)→ :182  judgeAllMyungriConsultationDomains({..., yongshin})
  │        └→ myungriConsultationJudge.ts:119/194/283/422   ← BUSINESS·MONEY·CAREER·CHANGE 4개 도메인만
  │             └→ consultationJudgeCore.ts:50  combineStatus   ← 여기서 도메인 status 가 바뀐다
  │                  ├→ myungriPremises.ts:411-424 → myungriReasoner.ts:311 directEvidence
  │                  │    └→ consultationContentPlan.ts:184 → :352 → 「전문근거·명리」 렌더
  │                  └→ consultationGrounding.ts:665-676 → decisionJudgment.ts:211/278/394 → stance
  └─(B)→ myungriPremises.ts:351-403  DAY_MASTER_YONGSHIN 전제 → **막다른 길** (directEvidence 미진입)
```

### 4.2 결론을 좌우하는가 — **좌우한다. 다만 조건부 권한이다.**

코드가 스스로 선언한 한계(`myungriConsultationJudge.ts:17-21`)는 지켜지고 있다:
*"Yongshin only ever ADDS or WITHHOLDS a supporting/risk signal … removing it never flips a domain's
status from FAVORABLE to UNRESOLVED."*

| 용신이 할 수 있는 것 | 할 수 없는 것 |
|---|---|
| `FAVORABLE → MIXED` (진행 → 유보) | `UNRESOLVED → 방향성` (첫 룰 생성 불가) |
| `CAUTION → MIXED` (보류 → 유보) | 명리 패널이 이미 방향을 낸 축 덮어쓰기 |
| `decisionStance = 'MIXED'` 강제 (`decisionJudgment.ts:394` 가 도메인 status 를 **직접** 읽음) | `FOR`/`AGAINST` 확정 stance (최대 `CONDITIONAL_*`) |
| `conclusionState` 를 OPEN/BLOCKED → MIXED 로 | Cross 의 `favorableFactors`/`riskFactors` (evidence 가 `[]`) |
| BUSINESS·MONEY·CAREER·CHANGE | LOVE·REUNION·TIMING (용신을 아예 안 읽음) |

**즉 "부가 정보"가 아니다.** 확정 방향을 만들 수는 없지만 **확정을 유보로 바꿀 수 있다.**

「왜 이렇게 보나요」에는 **노출되지 않는다**(용신 DomainRule 의 `evidence: []` 때문에 Cross 합의점에
기여하지 못함). 노출되는 곳은 **「전문근거 · 명리」** 한 곳이다.

### 4.3 코퍼스 실측 — 전달 답변 314건

| 용어 | 사용자 노출 답변 수 | 비율 |
|---|---|---|
| 용신 | 44 | **14.01%** |
| 억부 | 44 | **14.01%** |
| 희신 · 기신 · 구신 · 통관 · 병약 · 조후 | **0** | **0.00%** |

**핵심**: 44건은 같은 44개 답변, 같은 44개 문장이다. 전부 **`억부용신` 이라는 단일 복합어**로만 등장하며
독립된 「용신」·「억부」 용례는 0건이다. 등장 템플릿은 **4종뿐**(총 67회):

| 회수 | 문장 |
|---|---|
| 27 | 억부용신 방향이 재물 계열과 맞아, 재물 흐름을 구조적으로 뒷받침합니다. |
| 16 | 억부용신 방향이 활동·전환 계열과 맞아, 새로운 시도를 시작하기에 구조적으로 유리한 방향입니다. |
| 14 | 억부용신 방향이 활동·재물 계열과 맞아, 사업 실행을 구조적으로 뒷받침합니다. |
| 10 | 억부용신 방향이 조직·자리 계열과 맞아, 지금 자리를 지키거나 승진 방향을 구조적으로 뒷받침합니다. |

`myungriConsultationJudge.ts` 의 `kind:'OPPORTUNITY'` 리터럴 4개(124/198/287/426행)와 1:1 대응한다.
**RISK 측 문구(137행·211행)는 336건 중 0건 발화**했다 — 용신은 현재 **긍정 방향으로만** 사용자에게 도달한다.

### 4.4 틀렸을 때의 영향 범위

**전제 조건 3개를 모두 만족해야 영향이 0보다 크다**: ① 구조 판정 `AVAILABLE` ∧ 특수구조 후보 아님,
② 질문이 BUSINESS·MONEY·CAREER·CHANGE 로 라우팅, ③ 같은 도메인에서 다른 사실이 이미 룰을 세웠을 것.

만족했을 때 사용자가 보는 것:

1. **「전문근거·명리」에 틀린 근거 문장 한 줄** — 가장 확실한 피해. 위 4개 템플릿 중 하나.
2. **결론의 유보화** — 맞는 결론이 `MIXED` 로 흐려짐(반대 방향으로 뒤집히지는 않음).
3. **「이 결론을 어떻게 보면 되나요」의 상태 변화** — OPEN/BLOCKED → MIXED.

**하지 않는 것**: 확정 결론을 반대로 뒤집기, Cross 의 강점/위험 요인 오염, 시기 판정 오염,
연애·재회 도메인 오염.

**규모**: 전달 답변의 약 **14%**, 그중 실제로 문장이 나가는 것은 4개 템플릿뿐이다.
Premium 은 현재 용신을 **아예 쓰지 않는다**(`premiumEvidence.ts` 헤더가 명시적으로 제외).

---

## 5. 판정

# `INCONSISTENT`

### 근거

**자기모순 3건이 확정됐다.** 셋 다 "코드가 스스로 선언한 규칙을 스스로 어긴다"는 기준을 충족한다.

| # | 무엇 | 어긴 규칙 |
|---|---|---|
| **F1** | `ANCHORED` 근거 문장이 계절 지원을 사실로 단언 | 모듈 헤더 `:8-10` "실제 구조 사실(뿌리 존재, **계절 역할**, 충 오행)을 검사해 도출". `runEokbu` 에는 `seasonFact` 파라미터가 없다 |
| **N2** | 억부 분기가 사실상 강약 라벨 분기 | 헤더 `:5-7` "NEVER shortcuts: `STRONG_LEANING -> …`". `structuralState` ⟺ 라벨이 전단사라 정보적으로 동일하며, 이를 막는 테스트는 소스 grep 이라 무효 |
| **F8** | 같은 문장이 LLM 이 쓰면 답변 폐기, 서버가 쓰면 출고 | `structuredConsultation.ts:76`/`:259` 의 금지 규칙을 서버 렌더 경로가 우회 |

**더해 사용자에게 보이는 결함 2건**:
- **N3** — 희신 배열 중복 → **"금(金), 금(金)"** (실행 재현 완료, 19개 표본에서는 한 칸 차이로 비켜감)
- **N11** — `MULTI_CANDIDATE` 에서 용신은 OPPORTUNITY 를 **원리적으로 못 만들고** RISK 만 만든다

**F1 이 가장 무겁다.** 용신 모듈 안의 문자열은 소비자가 없어 내부에 머물지만, **동일한 거짓 절이
`myungriPremises.ts:82` 에 있고 그쪽은 사용자에게 나간다**(`docs/DIVINATION_QA_PACK.md:24` 에 실제 전달문
기록). 즉 이것은 죽은 문자열 문제가 아니다.

### 반대편도 기록한다 — 잘 만들어진 부분

7건 중 5건이 **코드 근거로 기각**됐다. 기각 사유가 전부 튼튼했다.

- **방향 모순 0건, 용신–기신 충돌 0건, 결정론 통과.** 원소 산술 자체는 건전하다.
- **경계값 처리가 정직하다** — 시각 미상 + 뿌리 없음은 `UNRESOLVED`, 절기 경계일은 차트 단계에서 차단,
  예외를 던지지 않고 전부 상태로 표현한다.
- **조후 보류가 모범적이다** — 규칙이 없어서 안 한다고 적어 두고 실제로 안 한다.
- **`familyOf` fail-soft 는 25쌍 전수로 도달 불가가 증명됐다** — 실제 위험이 아니다.
- 상담 판정의 자기 제한("용신은 방향을 만들지 못하고 유보만 만든다")이 코드에서 지켜지고 있다.

### 권고

| 대상 | 권고 |
|---|---|
| **Premium** | **결론 근거로 쓰지 말 것.** 현재도 안 쓰고 있으며, 그 상태를 유지하는 것이 맞다. F1·N2 는 "왜 이렇게 보나요"에 넣는 순간 거짓 근거가 되고, N3·N11 은 유료 출고물에 그대로 나타난다 |
| **상담(현행)** | 즉시 중단할 사유는 아니다 — 14% 노출, 4개 템플릿, 긍정 방향만, 결론을 뒤집지는 못한다. 다만 **F1 의 사용자 도달 쌍둥이(`myungriPremises.ts:82`)는 별도 트랙으로 고칠 것** |
| **다음 트랙** | 우선순위: ① `myungriPremises.ts:82` 문장 ② N3 중복 제거 ③ N11 가드 대칭화 ④ F8 규칙 정합 ⑤ N12 테스트 공백(19장 중 13장이 도는 경로에 테스트가 없다) |

**이 감사는 코드를 한 줄도 고치지 않았다.** 위 권고는 제안이며, 적용 여부는 오너 판단이다.

---

## 부록 A. 기각된 후보와 그 사유

| # | 후보 | 기각 사유 (요약) |
|---|---|---|
| F3 | 통관이 일간 자신의 오행을 용신으로 선택 | **설계다.** `:125` 가 `UNANCHORED` 에서 `PEER`(=일간 오행)를 명시적으로 고르고 테스트 `:58` 가 단언한다. 통관 단독 + 중재자=일간 경로도 `test.ts:103-105`, `:168-171` 이 이미 통과 중인 테스트다. 빈 `contraindicatedCandidates` 도 타입상 합법이고 소비자가 전부 가드한다 |
| F4 | `SELECTED` 와 병약 불확실성 공존 | `YongshinStatus` 는 **후보 개수**의 의미이지 확신도가 아니다. `UNRESOLVED`=0개, `MULTI_CANDIDATE`=2개 충돌, `SELECTED`=1개. `uncertaintyReasons` 를 읽어 status 를 정하는 분기는 없고, 헤더는 병약을 *"contributes honest uncertainty, never a fabricated candidate"* 로 명시한다 |
| F5 | 우선순위 분기 도달 불가 | 반대다. `else` 분기가 `ANCHORED` 에서 정확히 실행되며 SUBJ-06·SYN-A/E/H 가 그 증거다. 도달 안 하는 쪽은 `if` 분기(`UNANCHORED`)다 |
| F6 | `familyOf`/`elementForFamily` fail-soft 마스킹 | 도달 불가가 증명됐다. `ELEMENT_YANG_STEM` 5개 전부 `STEM_YIN_YANG`/`STEM_ELEMENTS` 에 등록돼 있고 `ELEMENT_GENERATES`/`ELEMENT_CONTROLS` 가 완전 순열이라 `calculateTenGod` 의 실패 경로가 없다. 25쌍 전수 열거 결과 `ok:false` 0건. `familyOf` 표가 라틴 방진이므로 `?? reference` 도 발화 불가 |
| F7 | 표본 편향이 자기모순 | 편향은 사실이나 **규칙 위반이 아니다.** 각 편향에 코드상 결정론적 이유가 있다(§3.2). 사실로서 §3 에 기록했다 |

## 부록 B. 사용한 도구

- 실측 하네스 — 임시(`zzz_yongshin_audit_harness.test.ts`, `zzz_n3_probe.test.ts`), 감사 후 삭제
- 적대적 검증 — 21회(후보 7 × 렌즈 3), 완전성 비평 1회, 사용 추적 1회, 코퍼스 집계 1회
- **죽은 코드 스캐너 — `scripts/dead-code-scan.mjs` (신규, 상시 사용 가능)**. 실행: `node scripts/dead-code-scan.mjs`
  (`--json` / `--category=exports|tables|functions` / `--quiet`). 자기 검증 내장 — 실패 시 비정상 종료
