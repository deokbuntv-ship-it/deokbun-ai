# 절기 경계일 게이트 — PHASE A 조사

Status: **PHASE A 완료 — 정지. 구현 미착수.**
Scope 준수: 소스 수정 0건, 상담 파이프라인·프롬프트·Cross·채점 코드 미변경, 교리 미변경,
commit/push 0건, 배포 0건. 조사(읽기) + 절기 시각 실측 계산만 수행.

---

## 0. 결론 먼저

| | |
|---|---|
| 모호 조건 | **`civilLocal.accuracy !== 'EXACT'`(= unknown **또는** approximate) AND 태양력 생일이 12절(節) 중 하나가 떨어지는 KST 달력일** |
| 모호 범위 | **그 날 하루 전체.** 절입이 몇 시든 무관 — 코드가 *날짜*를 비교한다 |
| 판정 함수 | `resolveSajuYearAndMonth(referenceEpochSeconds, adapter, { timeIsKnown })` — 이미 존재, 클라이언트·Edge 양쪽에서 호출 가능 |
| 기저 발생률 | **연 12일 = 전체 생일의 3.29%** (1970–2050 실측) |
| 영향 | 해당 사용자는 상담뿐 아니라 **오늘운세·월별운세까지 전부** CHART_UNAVAILABLE |
| ⚠ 예상 밖 | **`approximate`(오전/저녁)도 똑같이 막힌다.** `unknown` 전용 문제가 아니다 |

---

## 1) 절기 경계 판정에 쓸 수 있는 기존 함수

### 1-1. 판정 함수 (그대로 재사용 가능)

**[sajuTemporalAttribution.ts:117](src/features/interpretation/saju/sajuTemporalAttribution.ts:117)**

```ts
export function resolveSajuYearAndMonth(
  referenceEpochSeconds: number,
  solarTermAdapter: LunarJsSolarTermAdapter,
  options: { timeIsKnown?: boolean } = {},
): SajuYearMonthAttributionResult
// → { ok: true, value: { sajuYear, jieMonthOrdinal, governingJie } }
// → { ok: false, error: { code: 'AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE' | ... } }
```

`timeIsKnown: false` 로 호출하면 **경계일이면 정확히 `AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE` 를 반환**한다.
게이트가 필요로 하는 판정이 이미 이 한 줄이다. 새 절기 계산 불필요.

### 1-2. 호출 가능 위치

| 런타임 | 가능 여부 | 경로 |
|---|---|---|
| **클라이언트 (RN/Expo)** | **가능** | `src/features/interpretation/index.ts:266` 에서 `resolveSajuYearAndMonth` 를 이미 public export. `lunar-javascript@1.7.7` 은 `package.json:26` 의 정규 의존성 |
| **Edge (Deno)** | **가능하나 export 추가 필요** | 구현체는 이미 번들 안에 있음 — `supabase/functions/chat/_server/serverBundle.mjs:4096`. 단 번들 엔트리는 `src/features/chat/server/index.ts` 이므로, Edge 에서 직접 부르려면 그 엔트리에 re-export 추가 후 `node supabase/functions/chat/_server/build.mjs` 재생성 필요 |

기저 어댑터: `LUNAR_JS_SOLAR_TERM_ADAPTER` (lunar-javascript getPrevJie/getNextJie, MINUTE 정밀도,
지원 범위 1970-01-01 ~ 2050-12-31).

### 1-3. 월주가 실제로 결정되는 코드 경로

```
BirthInfoDraft
  → toSajuEngineInput()            src/features/manse/services/birthInputMapper.ts:122
  → executeSajuFromBirthInput()
  → calculateFourPillars()         src/features/interpretation/saju/fourPillars.ts:131
      ├ birthReferenceEpochSeconds()        (:38)  ← EXACT 아니면 현지 정오 12:00 고정
      ├ resolveSajuYearAndMonth({ timeIsKnown: civilLocal.accuracy === 'EXACT' })  (:170)
      │    └ 실패 → UNAVAILABLE { code:'YEAR_MONTH_ATTRIBUTION_FAILED', attributionReason }
      ├ calculateYearPillar(sajuYear)
      └ calculateMonthPillar(yearPillar, jieMonthOrdinal)   ← 여기서 월주 확정
```

`toSajuEngineInput` 는 **단일 진입점**이며 다음 5개 소비자가 전부 이것을 쓴다:
[consultationGrounding.ts:86](src/features/chat/services/consultationGrounding.ts:86),
[buildCompatibilityConsultation.ts:42](src/features/chat/server/buildCompatibilityConsultation.ts:42),
[monthlyEvidence.ts:24](src/features/monthly/engine/monthlyEvidence.ts:24),
[todayEvidence.ts:20](src/features/today/engine/todayEvidence.ts:20),
[manseService.ts:9](src/features/manse/services/manseService.ts:9).

---

## 2) "경계일" 판정 기준 — 코드 + 데이터 확인

### 2-1. 정확한 모호 조건 (코드 원문)

[sajuTemporalAttribution.ts:165-175](src/features/interpretation/saju/sajuTemporalAttribution.ts:165)

```ts
// FIX 2 — unknown/approximate time AND a boundary falls on the reference date → AMBIGUOUS.
if (options.timeIsKnown === false) {
  const onGoverningDate =
    compareGregorianDates(epochToKstDate(governing.value...epochSeconds), referenceDate) === 0;
  const onNextDate =
    next.ok &&
    compareGregorianDates(epochToKstDate(next.value...epochSeconds), referenceDate) === 0;
  if (onGoverningDate || onNextDate) {
    return { ok: false, error: { code: 'AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE' } };
  }
}
```

**비교 대상이 `LocalDate`(달력일)다. 시각이 아니다.**

### 2-2. 절입 시각에 따라 모호 구간이 달라지는가 — **아니다. 하루 전체다.**

시각 미상일 때 기준 instant 는 **현지 정오 12:00 KST 로 고정**된다
([fourPillars.ts:43-44](src/features/interpretation/saju/fourPillars.ts:43), 주석: "a canonical local noon is used").
그 정오를 기준으로:

- 절입이 정오 **이후**(예: 15:00) → `next` 절기가 같은 날 → `onNextDate` = true → AMBIGUOUS
- 절입이 정오 **이전**(예: 08:18) → `governing` 절기가 같은 날 → `onGoverningDate` = true → AMBIGUOUS

**어느 쪽이든 AMBIGUOUS.** 절입이 00:01 이든 23:59 이든 결과가 같다.
→ 게이트는 "생일이 절기일인가" 하나만 보면 되고, 시간대별 부분 차단 같은 세분화는 **불가능하며 불필요**하다.

### 2-3. 함께 걸리는 다른 실패 (참고)

| 코드 | 조건 | 시각 미상과 무관? |
|---|---|---|
| `AMBIGUOUS_BOUNDARY_MINUTE` ([:150](src/features/interpretation/saju/sajuTemporalAttribution.ts:150)) | 출생 instant 가 절입과 **같은 UTC 분** | EXACT 여도 발생. 극히 희귀 |
| `UNSUPPORTED_DATE_RANGE` ([:133](src/features/interpretation/saju/sajuTemporalAttribution.ts:133)) | 1970-01-01 ~ 2050-12-31 밖 | 별개 |

### 2-4. 실측 — 12절(節)의 실제 절입 시각

경계가 되는 것은 **12 節뿐**이다 (12 中氣는 아님):
立春·驚蟄·清明·立夏·芒種·小暑·立秋·白露·寒露·立冬·大雪·小寒
([JIE_TERM_TO_SAJU_MONTH_ORDINAL](src/features/interpretation/saju/sajuTemporalAttribution.ts:44)).

`lunar-javascript@1.7.7` 로 실측 (KST):

| 1996 | | 2024 | |
|---|---|---|---|
| 小寒 | 01-06 09:31:27 | 小寒 | 01-06 04:49:22 |
| 立春 | 02-04 21:07:54 | 立春 | 02-04 16:27:07 |
| 驚蟄 | 03-05 15:09:39 | 驚蟄 | 03-05 10:22:45 |
| 清明 | 04-04 20:02:01 | 清明 | 04-04 15:02:17 |
| 立夏 | 05-05 13:26:02 | 立夏 | 05-05 08:10:05 |
| 芒種 | 06-05 17:40:47 | 芒種 | 06-05 12:09:54 |
| 小暑 | 07-07 04:00:00 | 小暑 | 07-06 22:20:03 |
| 立秋 | 08-07 13:48:49 | 立秋 | 08-07 08:09:16 |
| 白露 | 09-07 16:42:25 | 白露 | 09-07 11:11:20 |
| **寒露** | **10-08 08:18:42** | 寒露 | 10-08 02:59:57 |
| 立冬 | 11-07 11:26:33 | 立冬 | 11-07 06:20:04 |
| 大雪 | 12-07 04:14:00 | 大雪 | 12-06 23:17:03 |

**REG4-SUBJ-10 의 1996-10-08 은 정확히 寒露 절입일(08:18:42 KST)이다.** 원인 실측 확인 완료.

### 2-5. 기저 발생률 (1970–2050 전수 계산)

```
distinct Jie 달력일 : 972일 / 81년 = 연 12.00일
전체 생일 중 비율    : 3.29%
절입 시각 분포       : 0~23시에 거의 균등 (시간당 37~48회) — 특정 시간대 편중 없음
```

→ 시각 미상/대략 사용자 100명당 **약 3.3명**이 이 조건에 걸린다.
→ 절입 시각이 균등 분포이므로 "새벽 절입이라 대부분 안전" 같은 완화 논리는 성립하지 않는다.

---

## 3) 자미 · 기문

### 3-1. 자미 — 시각 없으면 명궁을 못 잡는 조건

[ziweiInputAdapter.ts:70](src/features/ziwei/adapters/ziweiInputAdapter.ts:70)

```ts
// Exact birth time required — no fabricated 시진 for approximate/unknown.
if (birth.birthTimeAccuracy !== 'exact' || !isIntString(birth.birthHour)) {
  return { ok: false, availability: 'missing_birth_time', reason: 'BIRTH_TIME_REQUIRED' };
}
```

**조건: `birthTimeAccuracy !== 'exact'`.** 절기와 무관하게 exact 가 아니면 무조건 `missing_birth_time`.
파일 헤더(§7/§20): 命宮은 정확한 시진에 의존하므로 시진을 지어내지 않는다.

### 3-2. 기문 — 출생시각 비의존, 코드로 확인됨

[consultationGrounding.ts:152](src/features/chat/services/consultationGrounding.ts:152)

```ts
function buildQimenParts(question: string | undefined, questionEpochSeconds: number) { ... }
```

**인자에 birth 가 전혀 없다.** 질문 텍스트 + 질문 시각만 소비한다.
→ SUBJ-09/11/12 에서 `ziwei=missing_birth_time` 인데 `qimen=available` 이었던 것은 설계대로다.

### 3-3. ⚠ 그런데 기문이 살아 있어도 소용이 없다

[consultationGrounding.ts:588](src/features/chat/services/consultationGrounding.ts:588)

```ts
const groundingAvailable = myungri.availability === 'available' || ziwei.availability === 'available';
if (!groundingAvailable) return { status: 'unavailable', reason: 'calculation_failed' };
```

**기문은 grounding 성립에 기여하지 않는다** (주석: "natal spine (Saju/Ziwei) governs availability").
따라서 SUBJ-10 의 경우:

| 엔진 | 상태 | 이유 |
|---|---|---|
| 명리 | ✗ UNAVAILABLE | `YEAR_MONTH_ATTRIBUTION_FAILED / AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE` |
| 자미 | ✗ missing_birth_time | accuracy ≠ exact |
| 기문 | ○ available | 그러나 availability 에 기여 못 함 |

→ **7문항 전건 GROUNDING_UNAVAILABLE.** 문항 난이도와 무관한 100% 실패. 보고된 관측과 일치.

### 3-4. ⚠ 상담만의 문제가 아니다

같은 `executeSajuFromBirthInput` 를 쓰는 다른 표면도 동일하게 죽는다:

| 표면 | 결과 |
|---|---|
| 오늘운세 | [todayEvidence.ts:83](src/features/today/engine/todayEvidence.ts:83) → `unavailable('CHART_UNAVAILABLE')` |
| 월별운세 | [monthlyEvidence.ts:109](src/features/monthly/engine/monthlyEvidence.ts:109) → `unavailable('CHART_UNAVAILABLE')` |
| 만세력 | 동일 엔진 진입점 |
| 궁합 | 동일 엔진 진입점 |

**이 사용자는 앱에서 받을 수 있는 것이 사실상 없다.** Phase B 문안은 "이 상담을 못 한다"가 아니라
"이 정보로는 사주를 세울 수 없다" 수준으로 잡는 게 맞다.

---

## 4) 출생정보 등록 화면 · 검증 로직 · 저장 위치

### 4-1. 입력 화면과 검증 (두 벌이 존재 — Phase B 주의)

| # | 위치 | 검증 |
|---|---|---|
| 1 | **[src/app/birth-info.tsx](src/app/birth-info.tsx)** (메인 등록/수정 화면) | 자체 `isFormValid` ([:255](src/app/birth-info.tsx:255)), `isBirthTimeValid` ([:249](src/app/birth-info.tsx:249)) |
| 2 | [src/features/consultation/birthProfileValidation.ts](src/features/consultation/birthProfileValidation.ts) | `isCompleteBirthInfo()` — 주석상 "single source of truth", 그러나 **1번과 중복 구현** ("Mirrors birth-info.tsx's isFormValid exactly") |
| 3 | [BirthProfileForm.tsx](src/features/consultation/components/BirthProfileForm.tsx) | 2번 사용 |
| 4 | [FamousEditor.tsx](src/features/famous/components/FamousEditor.tsx) (어드민, 유명인) | 자체 검증 |

`isCompleteBirthInfo` 소비자: `BirthProfileForm.tsx`, `OnboardingContext.tsx`.

⚠ **게이트를 한 곳에만 넣으면 새는 경로가 남는다.** 최소 1번과 2번 둘 다 필요.
그리고 `birthProfileValidation.ts` 헤더는 명시적으로
*"No engine calendar math here — it only checks that the required APP fields are present and in range"* 라고
선언한다. 절기 호출을 여기에 넣으면 그 설계 선언과 충돌하므로, **별도 모듈(예: `birthBoundaryGate.ts`)로
빼고 두 검증기가 그것을 호출하는 형태**가 깔끔하다. (Phase B 결정 사항)

### 4-2. `birth_time_accuracy` 저장 위치

```sql
-- supabase/migrations/20260817000000_consumer_birth_profiles.sql:33
birth_time_accuracy   text check (birth_time_accuracy in ('exact','approximate','unknown')),
birth_hour            integer check (birth_hour between 0 and 23),
birth_minute          integer check (birth_minute between 0 and 59),
approximate_time_period text check (approximate_time_period in
                          ('dawn','morning','afternoon','evening','night')),
calendar_type         text check (calendar_type in ('solar','lunar')),
lunar_month_type      text check (lunar_month_type in ('regular','leap')),
birth_year / birth_month / birth_day  integer not null
```

테이블: `public.consumer_birth_profiles`, RLS owner-only + FORCE.

### 4-3. `approximate_time_period` 소비자 — 사실 확인 결과

**"자미가 소비하지 않는다"는 관측은 정확합니다.** 전수 추적 결과:

| 소비자 | 실제로 쓰는가 |
|---|---|
| **자미** (`ziweiInputAdapter`) | ❌ **전혀 읽지 않음.** `birthTimeAccuracy !== 'exact'` 하나로 컷 |
| **기문** | ❌ birth 자체를 안 받음 |
| **명리** ([birthInputMapper.ts:87-92](src/features/manse/services/birthInputMapper.ts:87)) | ⚠ **읽기는 함** → `{ accuracy:'APPROXIMATE', period }` 로 엔진에 전달 |
| LLM 프롬프트 | ✅ `contextSelector.ts:24-28` 에서 "저녁 무렵" 같은 라벨로 문맥에 들어감 |
| 화면 표시 | ✅ `BirthInfoSummary.tsx` |

⚠ 그러나 **명리도 실질적으로는 소비하지 않는다.** `APPROXIMATE` 는
`civilLocal.accuracy === 'EXACT'` 가 아니므로 [fourPillars.ts:171](src/features/interpretation/saju/fourPillars.ts:171)
에서 `timeIsKnown: false` 가 되고, 기준 instant 도 period 를 무시한 **정오 고정**이다.
`period` 가 실제로 쓰이는 곳은 시주를 `AMBIGUOUS` 로 표시하는 용도뿐
([birthExecutionBridgeValidation.ts:209](src/features/interpretation/saju/birthExecutionBridgeValidation.ts:209)).

**결론: `approximate` 는 계산상 `unknown` 과 동등하다.** 경계일 게이트는 두 값 모두에 걸어야 한다.
사용자에게 "오전/저녁이라도 골라주세요"라고 유도하는 문안은 **문제를 해결하지 못한다.**

---

## 5) 영향 범위 추산

### 5-1. 결정론적 기저 발생률 (DB 불필요, 실측 완료)

- 절기 경계일 = **연 12일**, 전체 생일의 **3.29%**
- 조건부 실패율 = `P(accuracy ∈ {unknown, approximate}) × 3.29%`
- 해당자에게는 **100% 실패** (문항 무관, 표면 무관)

### 5-2. staging 실계정 수 — **측정 못 함 (권한 차단)**

staging 자격증명 파일 읽기가 auto-mode classifier 에 의해 차단되었습니다. 우회하지 않았습니다.
production 은 지시대로 조회하지 않았습니다.

측정하려면 다음 중 하나가 필요합니다:

**(a) staging service-role 접근 승인** — 아래 쿼리로 후보를 뽑고, 음력 행은 로컬에서 양력 변환 후
절기 판정을 돌려 정확한 수를 냅니다 (SQL 만으로는 음력→양력 변환이 안 됩니다).

```sql
select id, calendar_type, lunar_month_type,
       birth_year, birth_month, birth_day, birth_time_accuracy
from public.consumer_birth_profiles
where birth_time_accuracy in ('approximate', 'unknown');
```

**(b) 직접 실행 후 결과만 전달** — 위 쿼리 결과 CSV 를 주시면 절기 판정은 제가 로컬에서 돌립니다.

⚠ 판정은 반드시 **양력 변환 후**에 해야 합니다. `birth_year/month/day` 는 `calendar_type='lunar'` 일 때
음력 값이고, 경계 판정은 `calendar.gregorianDate` 기준입니다
([fourPillars.ts:163](src/features/interpretation/saju/fourPillars.ts:163)).

---

## 6) Phase B 진입 전 확인이 필요한 결정 사항

전부 보고만 하고 실행하지 않았습니다.

1. **차단 대상에 `approximate` 포함 여부** — 계산상 `unknown` 과 동등하므로 포함해야 실효가 있습니다.
   포함하면 "오전/저녁" 선택지는 경계일 사용자에게 사실상 무의미해집니다.
2. **차단 강도** — 저장 자체를 막을지(hard block), 저장은 허용하되 상담 진입을 막을지,
   경고만 띄우고 통과시킬지. 이미 등록된 기존 계정 처리도 함께 결정 필요.
3. **게이트 위치** — 클라이언트 폼만인지, Edge 도 방어할지. Edge 방어를 하려면
   `src/features/chat/server/index.ts` 에 re-export 추가 + 번들 재생성이 필요합니다.
4. **검증기 중복** — `birth-info.tsx` 의 `isFormValid` 와 `birthProfileValidation.ts` 두 벌 모두 손대야
   새는 경로가 없습니다. 별도 `birthBoundaryGate.ts` 로 빼는 안을 권합니다.
5. **문안 범위** — 상담만이 아니라 오늘운세/월별운세/만세력/궁합 전부 막히므로,
   "이 상담은 어렵습니다" 가 아니라 "정확한 출생시각이 있어야 사주를 세울 수 있습니다" 쪽이 사실에 맞습니다.

---

## 7) 무결성 스냅샷

작업 전후 동일:

| 파일 | bytes | mtime |
|---|---|---|
| `app.json` | 1469 | 2026-08-24 14:01:41 |
| `docs/DIVINATION_QA_PACK.md` | 158134 | 2026-09-01 21:46:55 |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_REPORT.md` | 10186 | 2026-08-22 20:54:12 |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_2_REPORT.md` | 7736 | 2026-08-22 21:42:44 |
| `docs/DEOKBUNI_AUTONOMOUS_BATCH_3_REPORT.md` | 8685 | 2026-08-22 22:18:27 |
| `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` | 16768 | 2026-08-15 23:36:53 |

HEAD `d5e51743d146e3d29cb9b77f0d250f586e006aed`, 브랜치 `admin/master-operations-content`. 커밋 0건.

**STOP. 구현 미착수.**
