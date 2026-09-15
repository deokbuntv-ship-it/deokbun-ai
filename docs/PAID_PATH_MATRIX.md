# 유료 경로 대조표 — 상품 × 방어

> 2026-09-06 신설 · 2026-09-06 H7 해소 반영.
>
> ## ⚠ 새 유료 상품·새 버킷·청구 경로 변경 시 — 이 세 가지를 하고 나서 머지한다
>
> 1. **§2 표에 열을 늘리고 12개 축을 전부 채운다.** `—` 를 쓸 때는 왜 해당 없는지 한 줄 적는다.
> 2. **`economyContractV1.test.ts` 에 추가만 한다** — 최소 (a)(b)(c)(k). 기존 항목을 고쳐서 통과시키면
>    계약이 아니라 기록이 된다.
> 3. **`.runtime/duk_bucket_matrix.mjs` 의 `PRODUCTS` 에 줄을 추가하고 돌린다.** LLM 0콜 · 40초다.
>    ⚠ **이 3번이 §4 의 다섯 번째를 막는 자리다.** 계약 테스트는 SQL 텍스트만 보고, DB 제약과 실제
>    배분의 상호작용은 오직 여기서만 드러난다 — H7 이 정확히 그 사각지대에서 나왔다.
>
> 이 문서가 존재하는 이유: "솔로에는 있는 방어가 다른 상품에는 없다" 가 **네 번** 반복됐다.
> 세 번은 궁합에서, 네 번째는 세 상품 전부에서. 매번 사람이 코드를 읽어서 찾았다.

---

## 1. 유료 상품 — 전체 (코드 실측, 2026-09-06)

덕을 쓰는 경로는 **`reserve_session_duk` 호출부 두 곳**뿐이다. 문서가 아니라 그 두 곳이 정본이다.

```
supabase/functions/chat/index.ts:1074   reserveSessionDuk(admin, userId, 'premium_report', requestId)
supabase/functions/chat/index.ts:1469   reserveSessionDuk(admin, userId, productType, requestId)   // 'general' | 'compatibility'
```

| 상품 | 가격 | product_type | 세션 | 경로 |
|---|---:|---|---|---|
| 일반 상담 | 5덕 | `general` | 5턴 / TTL 24h | Edge 상담 분기 → `buildServerConsultation` |
| 궁합 상담 | 12덕 | `compatibility` | 5턴 / TTL 24h | Edge 상담 분기 → `buildCompatibilityConsultation` |
| Premium 리포트 | 50덕 | `premium_report` | 단발(세션 행은 생김) | Edge premium 분기 → `buildPremiumReport` |

**무료로 확인된 것** (예약 호출이 없다 — fortune/paid 리스만 잡는다):

| 경로 | 확인 |
|---|---|
| 오늘의 운세 · 이번 달 운세 | `reserveSessionDuk` 호출 **없음**. `acquireFortuneLease` / `releaseFortuneLease` 만 |
| 요약 호출 (세션 내 메모리 압축) | `acquirePaidRequest(…, 'summary', …)` 만 — **덕 예약 없음** |
| 후속질문 (2~5턴) | 같은 세션 안이므로 `reserve_session_duk` 가 `ACTIVE_SESSION`(price 0) 을 돌려준다 |
| 6번째 질문 | **새 세션 = 새 청구.** 클라이언트가 동의 카드로 명시 고지(2026-09-05 수정) |

---

## 2. 방어 × 상품

`✅` 있음 · `❌` 없음 · `—` 해당 없음 · `⚠` 있으나 조건부

| # | 방어 | 일반 5덕 | 궁합 12덕 | Premium 50덕 | 소유 위치 |
|---|---|:--:|:--:|:--:|---|
| a | 근거 없을 때 조기 종료 (무근거 과금 금지) | ✅ | ✅ **2026-09-06 신설(H6)** | ✅ | 각 빌더 |
| b | LLM 실패 시 0덕 해제 | ✅ | ✅ | ✅ | Edge 실패 분기 |
| c | 첫 성공에서만 1회 청구 | ✅ | ✅ | ✅ | `commit_session_reservation` |
| d | 재시도·재생성 시 중복 청구 금지 | ✅ | ✅ | ✅ | `reserve_session_duk` 의 `ACTIVE_SESSION`(price 0) |
| e | 세션 소진 시 사용자 고지 | ✅ | ✅ | — (단발) | 화면 (`chat.tsx` · `compatibility-chat.tsx`) |
| f | 안전 라우팅 정지가 과금보다 앞 | ✅ | ✅ | — (질문 없음) | Edge `index.ts:1385` (예약 1469 보다 앞) |
| g | 절기 경계일을 **좁은 사유**로 구분 | ✅ | ✅ **2026-09-06** | ❌ **일반 사유만** | 빌더 |
| h | 예약 TTL 만료 시 처리 | ⚠ | ⚠ | ⚠ | `commit_session_reservation` — 만료면 커밋 실패 → 503 · 0덕 |
| i | 멱등성 (같은 requestId 재요청) | ✅ | ✅ | ✅ | `acquire_paid_request` → `status='completed'` 리플레이 |
| j | 부분 성공 / 반쪽 출력 처리 | ✅ | ✅ | ✅ | `SEMANTIC_REJECTED` · `INVALID_OUTPUT` → 해제 |
| **k** | **다중 버킷 배분에서 커밋이 성립** | ✅ **2026-09-06** | ✅ **2026-09-06** | ✅ **2026-09-06** | 원장 유니크 키 `(session_id, reason, bucket)` — **§3** |
| l | 화면이 결제 앞에서 불가 조건을 막는다 | ❌ | ✅ **2026-09-06** | ⚠ 문구만 | 화면 |

### 축을 추가한 이유

- **(k)** 는 이번 대조에서 **새로 만든 축**이다. 기존 축은 모두 "실패를 어떻게 끝내는가" 를 물었는데,
  이 결함은 **성공을 끝내지 못하는** 종류였다. 축이 없으면 영원히 안 보인다.
- **(l)** 도 새 축이다. 서버 방어가 다 있어도 사용자가 결제 화면까지 가서 실패하면 이탈이다.
  H6 트랙에서 "판정을 결제 앞으로 당긴다" 가 실제 개선이었으므로 축으로 남긴다.

---

## 3. (k) 다중 버킷 커밋 — **발견 2026-09-06 / 해소 2026-09-06**

### 무엇이 틀렸었나

`commit_session_reservation` 은 **할당된 버킷마다 원장 차변 한 행**을 넣는다(원장 설계상 지출은 나온
버킷에 귀속돼야 한다 — `duk_balance`·`duk_spendable` 이 버킷으로 group by 한다). 그런데 유니크
인덱스는 `(session_id, reason)` 뿐이었다 → 두 버킷이면 같은 키로 두 행 → **23505 → 전체 롤백.**

라이브에서의 모습: 궁합 요청이 **503**, `ai_usage_logs` 는 `status=success · total_tokens=7803` —
**답은 만들어졌고 LLM 값은 우리가 냈는데 사용자는 아무것도 받지 못했다.**

**왜 안 보였나**: 가입 WELCOME 10덕이 REWARD 라 **REWARD 만 있는 계정**은 5덕 상담이 단일 버킷으로
통과한다 — QA·미니팩·개발이 전부 그 조건이었다. 실패 조건 *"REWARD 가 남아 있는데 가격이 그보다
크다"* 는 **덕을 구매한 사용자의 기본 상태**이고 IAP 가 닫혀 존재하지 않았다.
마이그레이션 시점 staging 증거: **세션 차변 364행이 전부 `bucket=REWARD`.**

### 수정 (마이그레이션 `20260908000000_duk_ledger_bucket_unique.sql`)

```sql
drop index if exists public.duk_ledger_session_reason_uniq;
create unique index if not exists duk_ledger_session_reason_bucket_uniq
  on public.duk_ledger (session_id, reason, bucket) where session_id is not null;
```

**인덱스만 바뀌었다** — 함수·가격·정책 무변경. 유니크 키를 **넓히는** 것이라 좁은 키를 만족하던 기존
데이터는 원리상 위반할 수 없고, 적용 전 staging 에서 두 형태 모두 중복 0을 확인했다.
`drop` 이 `create` 보다 **먼저**여야 한다(`if not exists` 는 이름으로 판단하므로 순서가 뒤집히면
옛 정의가 조용히 남는다) — 그 순서를 계약 테스트가 잠근다.

**멱등성은 그대로다**: 같은 세션·같은 사유·**같은 버킷**의 두 번째 차변은 여전히 거부된다. 재시도가
만들 수 있는 것은 정확히 그 조합이므로 원래 인덱스의 목적이 100% 보존된다.

### 실측 — 상품 3 × 버킷 조합 6 전수 (`.runtime/duk_bucket_matrix.mjs`, **102/102 PASS, LLM 0콜**)

| 조합 | general 5덕 | compatibility 12덕 | premium 50덕 |
|---|---|---|---|
| REWARD 만으로 충분 | ✅ 1행 · 합 5 | ✅ 1행 · 합 12 | ✅ 1행 · 합 50 |
| PAID 만 (REWARD 0) | ✅ 1행 · 합 5 | ✅ 1행 · 합 12 | ✅ 1행 · 합 50 |
| **두 버킷** (REWARD 부분 + PAID 잔여) | ✅ **2행** · 합 5 | ✅ **2행** · 합 12 | ✅ **2행** · 합 50 |
| **두 버킷** (REWARD 1 + PAID 잔여) | ✅ **2행** · 합 5 | ✅ **2행** · 합 12 | ✅ **2행** · 합 50 |
| 총합이 가격과 정확히 같음 (두 버킷) | ✅ **2행** · 합 5 | ✅ **2행** · 합 12 | ✅ **2행** · 합 50 |
| 총합 부족 | `INSUFFICIENT` · 잔액 불변 | `INSUFFICIENT` · 잔액 불변 | `INSUFFICIENT` · 잔액 불변 |

각 성공 케이스마다 여섯 가지를 함께 확인한다: 커밋 성공 · **원장 행 수 = 할당 버킷 수** ·
**차변 합 = 가격** · **배분 합 = 예약 금액** · **잔액이 정확히 가격만큼 감소** · 사유가 상품별 정본.

**멱등성 (두 버킷 상태 — 이번에 새로 생긴 조건)**

| 검사 | 결과 |
|---|---|
| 같은 예약 재커밋 | `true` (idempotent) · **원장 2행 그대로 · 추가 차감 0** |
| 같은 requestId 재예약 | `ACTIVE_SESSION` price 0 · **잔액 불변** |
| 해제 후 커밋 시도 | `false` · 잔액 불변 (BUG-2 가드 유지) |

**실패 경로 (두 버킷 상태, `.runtime/duk_two_bucket_failpaths.mjs`, 10/10 PASS, LLM 0콜)**

| 경로 | 결과 |
|---|---|
| 예약 중 | 두 버킷 홀드가 정확히 가격만큼 잡힌다 |
| 해제 | **두 버킷 홀드가 모두 풀린다 — 0덕 · 차변 0행** |
| 절기 경계일 (Edge) | **422 · 0덕 · RESERVED 잔존 0 · LLM 토큰 0** |
| 안전 라우팅 정지 (Edge) | 200 + 안내 · **예약이 아예 생기지 않는다** · 0덕 · LLM 토큰 0 |

### ⚠ 남은 것 — 커밋 시점에는 배분 합을 재검증하지 않는다

`reserve_session_duk` 는 배분 시점에 강제한다(`if v_need <> 0 then raise exception
'allocation_mismatch'`). `commit_session_reservation` 은 그 값을 **믿고** 쓴다.
`duk_reserve` 행은 `reserve_session_duk` 에서만 만들어지므로 구조상 성립하지만, **강제가 사라지면
커밋이 잘못된 총액을 쓴다.** 계약 테스트가 "그 강제가 존재한다" 를 잠갔다.

고친다면 `commit_session_reservation` 앞에 세 줄이면 된다:

```sql
if v_res.alloc_plus + v_res.alloc_reward + v_res.alloc_paid <> v_res.amount then
  raise exception 'allocation_mismatch' using errcode = 'P0001';
end if;
```

⚠ **이번 트랙에서 넣지 않았다.** `create or replace` 는 본문 전체를 다시 써야 하는데, 도달 불가능한
데이터에 대한 방어를 위해 **돈을 다루는 함수 30줄을 옮겨 적는 것**이 그 방어가 막는 위험보다 크다고
판단했다. 그 함수를 다른 이유로 손볼 때 함께 넣는 것이 맞다.

### ⚠ PLUS 가 들어오면 조합이 늘어난다 (V1.1)

지금 버킷은 실질 둘(REWARD · PAID)이다. `PLUS` 는 스키마·배분 로직·인덱스에 **이미 있지만**
발급 경로가 없어 실사용 0이다(위 실측의 `alloc_plus` 는 전부 0).
PLUS 멤버십이 V1.1 에 들어오면 배분이 **세 버킷**이 되고 조합은 6 → 최대 14 로 늘어난다
(PLUS 단독 · PLUS+REWARD · PLUS+PAID · **PLUS+REWARD+PAID 3행** …).
⚠ **세 행 동시 삽입은 아직 한 번도 실행된 적이 없다.** 새 인덱스가 그것도 허용하지만
**허용한다는 것과 측정했다는 것은 다르다** — PLUS 착수 시 `duk_bucket_matrix.mjs` 의 `CASES` 에
PLUS 축을 추가하고 돌리는 것이 §5 절차의 3번이다.

---

## 4. 왜 이 패턴이 반복되는가 — 구조적 원인

네 번의 반복:

| # | 무엇 | 어디 |
|---|---|---|
| 1 | 6번째 질문이 조용히 두 번째 세션을 열어 재과금 | 궁합 화면 (follow-up chip 이 컴포저 가드를 우회) |
| 2 | 세션 소진 고지가 없어 무음 결제 | 궁합 화면 |
| 3 | 근거 0인데 12덕 청구 (H6) | 궁합 서버 빌더 |
| 4 | 두 버킷 배분에서 커밋 롤백 (k) | **공유** SQL (원장 유니크 인덱스) — 셋 다 동시에 났다 |

### 원인 1 — 솔로가 정본이고 나머지는 복사됐다

`buildCompatibilityConsultation` 의 머리말이 스스로 적고 있다:
*"The solo `buildServerConsultation` is untouched → zero regression risk to the proven single-subject flow."*
회귀를 피하려고 **복사**한 것이고, 그 선택은 옳았다. 문제는 **복사 시점 이후 솔로에 추가된 방어가
궁합에 오지 않는다**는 것이다. H6 이 정확히 그것이다 — 솔로의 조기 종료는 V6 에서 추가됐고 궁합은
그 전에 갈라져 있었다.

### 원인 2 — 방어의 소유자가 흩어져 있다

(a) 는 빌더가, (b)(f) 는 Edge 분기가, (c)(d)(h)(k) 는 SQL 이, (e)(l) 은 화면이 소유한다.
**한 상품을 추가할 때 네 곳을 다 봐야 하고, 그 목록이 어디에도 없었다.** 이 문서가 그 목록이다.

### 원인 3 — 계약 테스트의 렌즈가 DB 를 못 본다

18건은 순수 모델(불변식) + 소스 스캔(배선)이다. 둘 다 옳지만 **DB 제약과 실제 배분의 상호작용**은
어느 쪽에도 안 걸린다. (k) 가 그 사각지대에서 나왔다.

### 제안 — 공유 코드로 뽑을 수 있는가

| 방어 | 공유 가능? | 판단 |
|---|---|---|
| (a) 근거 없을 때 종료 | **부분** | 조건이 상품마다 다르다(솔로는 후속턴 예외, 궁합은 예외 없음). **판정은 공유 불가, "종료해야 한다"는 계약은 공유 가능** |
| (b)(f)(i) | **이미 공유** | Edge 한 분기가 general/compatibility 를 함께 처리한다 |
| (c)(d)(h)(k) | **이미 공유** | 전부 SQL. 그래서 (k) 가 세 상품에 동시에 났고, **한 번의 인덱스 수정으로 셋이 함께 풀렸다** |
| (e)(l) | 어려움 | 화면마다 레이아웃이 다르다. **계약 테스트로 고정하는 편이 현실적** |

⚠ **리팩터를 권하지 않는다.** (b)(c)(d)(f)(i) 는 이미 공유돼 있고, 남은 (a)(e)(l) 은 상품마다 판정이
달라 억지로 합치면 조건에 플래그가 붙는다 — 그것이 다음 사고의 자리다.

### 대신 — 계약 테스트로 축을 고정한다 (실행됨)

`economyContractV1.test.ts` 에 **추가**했다(기존 18건 불변):

- 궁합 빌더가 근거 부재 시 typed non-success 로 종료하는가 (a)
- 그 종료가 **LLM 호출보다 앞**인가 — 뒤면 비용이 새고 풀이가 생성된다
- 0덕 해제가 **솔로와 같은 Edge 분기**인가 — 병렬 경로가 생기면 한쪽만 고치는 사고가 난다
- 궁합이 새 사유·새 반환 구조를 만들지 않았는가

이 형태는 **새 상품이 추가될 때 그대로 복제할 수 있다.** 그리고 (k) 처럼 DB 레벨인 축은
계약 테스트로는 안 잡히므로 **아래 절차의 실측 항목**으로 남긴다.

---

## 5. 새 유료 상품을 추가할 때 — 절차

1. §1 의 표에 상품을 **먼저** 추가한다 (가격 · product_type · 세션 정책 · 빌더).
2. §2 의 열을 하나 늘리고 **12개 축을 전부 채운다.** `—` 를 쓸 때는 왜 해당 없는지 한 줄 적는다.
3. `economyContractV1.test.ts` 에 **추가만** 한다 — 최소 (a)(b)(c) 세 축.
   ⚠ 기존 항목을 고쳐서 통과시키지 말 것. 그 순간 계약이 아니라 기록이 된다.
4. **staging 실측** — 계약 테스트가 못 보는 축 (`.runtime/duk_bucket_matrix.mjs` 에 상품 줄을 추가하고 실행):
   - (k) **두 버킷 배분**으로 1회 (REWARD 를 가격보다 적게 남기고 PAID 를 채운다)
   - (a) 근거 부재 계정으로 1회 → 덕 차감 0 · LLM 토큰 0 확인
   - (c) 정상 1회 → 정확히 가격만큼 차감 확인
   `.runtime/h6_compat_grounding_e2e.mjs` 가 이 셋의 형판이다.
5. 골든 미니팩 1회.
6. 발견한 것을 `KNOWN_RISKS.md` 에 등재하고 이 문서를 갱신한다.

---

## 5-b. CI 자동화 — 가능하다 (설정은 만들지 않았다)

```bash
node .runtime/duk_bucket_matrix.mjs          # 사람이 읽는 표. 실패 시 exit 1
node .runtime/duk_bucket_matrix.mjs --json   # 기계 출력
node .runtime/duk_two_bucket_failpaths.mjs   # 두 버킷 Edge 실패 경로
```

| | 값 |
|---|---|
| 실행 시간 | **11초** (실측, 102 단언) |
| LLM 콜 | **0** — reserve/commit RPC 직접 호출 |
| 덕 비용 | **0** — 일회용 계정에 발급하고 계정째 삭제 |
| 필요 자격증명 | staging **SERVICE_ROLE** + **ANON** 키 (`.runtime/lib.mjs` 가 읽는 것) |
| 부작용 | 일회용 auth 계정 20개 생성 → **finally 에서 전량 삭제**(cascade 로 원장·세션도 함께 사라진다) |

**넣을 수 있다.** 미니팩(10분·28콜·유료)과 달리 **PR 단위로 돌려도 싸다.**
⚠ 다만 **staging DB 에 쓰기를 한다** — 계정을 만들고 지운다. 그래서:

- 자격증명이 **SERVICE_ROLE** 이다. CI 시크릿으로 넣는다면 **staging 전용 키**여야 하고,
  production 키가 그 자리에 들어가면 프로덕션에 계정을 만든다. 훅·deny 로 막히지 않는 경로다.
- **동시 실행 금지** — 같은 stamp 를 쓰는 두 실행이 겹치면 이메일이 충돌한다(현재 stamp + 랜덤 접미로
  완화돼 있으나 보장은 아니다).
- 정리는 `finally` 에 있지만 **프로세스가 강제 종료되면 계정이 남는다.** 주기적으로
  `bm-*@deokbun-qa.test` / `2b-*@deokbun-qa.test` 를 훑는 청소가 있으면 좋다.

⚠ **실제 CI 설정(`.github/workflows/`)은 만들지 않았다** — 지시서 범위 밖이고, 이 레포에는 아직
워크플로 디렉터리 자체가 없다. 위 목록이 붙일 때 필요한 전부다.

---

## 6. 근거

- 상품 목록: `src/features/duk/pricing.ts` · `supabase/functions/chat/index.ts:1074,1469`
- 방어 위치: `buildServerConsultation.ts` · `buildCompatibilityConsultation.ts` ·
  `buildPremiumReport.ts` · `supabase/migrations/20260833000000_duk_session_runtime.sql`
- (k) 실측: `.runtime/duk_bucket_matrix.mjs` **102/102** (상품 3 × 조합 6 + 멱등성 + 해제) ·
  `.runtime/duk_two_bucket_failpaths.mjs` **10/10** (두 버킷 Edge 실패 경로). 둘 다 **LLM 0콜**
- (k) 수정: `supabase/migrations/20260908000000_duk_ledger_bucket_unique.sql` (staging 적용 완료)
- H6 실측: `.runtime/h6_compat_grounding_e2e.mjs` 13/13
- 상세 서술: `PROJECT_STATE.md` §7.30 · `KNOWN_RISKS.md` H6(해소) · **H7**(신설)
