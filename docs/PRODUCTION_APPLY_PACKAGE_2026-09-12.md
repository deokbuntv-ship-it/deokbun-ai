# production 통합 적용 패키지 (2026-09-12) — ⚠ **CTO 판정 후 실행**

> 오너가 **한 번의 세션**으로 끝낼 수 있게 만들었습니다. 명령은 그대로 복사하십시오.
>
> ⚠⚠ **순서를 바꾸지 마십시오.** 새 코드가 새 DB 객체를 쓰고, 한 군데는 **순서가 바뀌면 보안 구멍이
> 실사이트에 열립니다**(아래 ⓓ). 각 단계 끝의 **🛑 멈춤 신호**가 보이면 거기서 멈추고 CTO 에게 보내십시오.
>
> ⚠ **DB 비밀번호는 이 문서에도, 채팅에도, 어떤 파일에도 적지 마십시오.** CLI 가 물으면 터미널에 직접.

```
⓪ 사전 확인  →  ① DB 마이그레이션  →  ② Edge 배포  →  ③ 동의 게이트 확인(꺼짐)
            →  ④ 커밋·푸시 → Preview → 웹 병합  →  ⑤ 동의 게이트 켜기  →  ⑥ 앱 빌드
```

⚠ 지시서의 순서에서 **한 곳을 바꿨습니다** — 동의 게이트를 **켜는 것**을 웹 병합 **뒤**(⑤)로 옮겼습니다.
이유: 지금 실사이트(main)에는 동의 화면이 없습니다. 병합 전에 켜면 **실사이트의 상담이 전부 막힙니다.**
③에서는 "꺼져 있는지" 만 확인합니다. → CTO 판정 항목 C1.

---

## ⓪ 사전 확인 (읽기 전용 — 5분)

| # | 확인 | 어떻게 | 🛑 멈춤 신호 |
|---|---|---|---|
| ⓪-1 | **DB 비밀번호를 최근에 리셋했는가** | 기억 확인. 리셋했다면 CLI 에 저장된 값이 낡았습니다 | ② dry-run 이 `password authentication failed` 로 실패 |
| ⓪-2 | **익명 로그인이 꺼져 있는가** | Supabase(production) → Authentication → Providers → **Anonymous Sign-Ins** | 켜져 있으면 멈춤 (staging 은 꺼져 있음을 실측) |
| ⓪-3 | **실사이트 공유 링크 수** | 아래 SQL ⓪-3 | **0 이 아니면 멈춤** (아래 설명) |
| ⓪-4 | **계정 삭제 외래키** | `docs/M4_HANDMADE_TABLES_AUDIT_2026-09-12.md` §5-1 | CASCADE 가 아닌 것이 있으면 멈춤 |
| ⓪-5 | **체크포인트 커밋이 인덱스에 그대로 있는가** | `git diff --cached --name-only \| wc -l` | **66 이 아니면 멈춤** |
| ⓪-6 | **완료된 답의 수** (①-7 백필 시간 가늠용) | 아래 SQL ⓪-6 | 없음 — 숫자 × 0.1초 ≈ 백필 시간 (staging 698건 65초) |

```sql
-- ⓪-3. 지금 production 에 살아 있는 공유 링크
select count(*) as 활성공유, min(created_at) as 가장오래된
  from public.report_shares where status = 'active' and revoked_at is null;

-- ⓪-6. 완료된 답의 수
select count(*) as 완료된답 from public.paid_request_idempotency
 where status = 'COMPLETED' and response_json is not null;
```

> ⚠ **⓪-3 이 0 이 아니면 왜 멈추나**: 실사이트(main) 코드에는 **공유 화면이 없습니다**(2026-09-12
> 확인). 그런데도 공유 링크가 있다면 누군가 API 를 **직접** 불러 만든 것입니다. 마이그레이션 16 은
> 기존 공유를 **그 시점의 본문 그대로** 스냅샷하므로, 그 링크가 위조본이면 위조본이 보존됩니다.

---

## ① DB 마이그레이션 — **7건**

### 대기 목록 (순서대로)

| # | 파일 | 하는 일 | 판정 |
|---|---|---|---|
| 14 | `20260914000000_drop_legacy_message_policies.sql` | 옛 이름 정책 2개 삭제 (조건 동일한 중복) | CTO 승인 완료 |
| 15 | `20260915000000_model_pricing.sql` | 원가 표 2개 + 집계 함수 | CTO 승인 완료 |
| 16 | `20260916000000_m13_share_server_snapshot.sql` | **M13** — 공유 스냅샷 + 본문 변경 시 자동 해지 + `get_shared_report` 교체 + `conversations` UPDATE 대칭 | 직전 묶음 |
| 17 | `20260917000000_ai_content_reports.sql` | AI 답변 신고 표 + 관리자 RPC | 직전 묶음 |
| 18 | `20260918000000_ai_processing_consent.sql` | AI 처리 동의 표 + RPC 3 | 직전 묶음 |
| 19 | `20260919000000_iap_google_runtime.sql` | 결제 런타임 칸 + RPC 4 | 직전 묶음 |
| **20** | `20260920000000_share_witness_and_gaps.sql` | **공유 증인** — "처음부터 위조한 리포트" 차단 + system 메시지 차단 + 조회수 잠금 | **이번 묶음** |

전부 staging 에 적용돼 있고, **16 과 20 은 되돌렸다 다시 올려 멱등성을 확인**했습니다(각 2회).

### ①-1 복사 (레포 폴더의 훅이 production ref 를 막으므로)

```powershell
robocopy "C:\Development\DeokbunAI-app\supabase" "C:\Development\_prodpush\supabase" /E /XD .temp
```

### ①-2 적용 전 확인 조회 (SQL Editor, 읽기 전용)

```sql
-- 이력의 끝
select version from supabase_migrations.schema_migrations order by version desc limit 3;

-- ⚠ 14 가 지울 정책의 현재 정의를 받아 적는다 (되돌리기에 필요)
select policyname, cmd, qual, with_check from pg_policies
 where schemaname='public' and tablename='conversation_messages' order by policyname;

-- 새 객체가 아직 없는지
select to_regclass('public.model_pricing')               as t15,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='report_shares' and column_name='shared_payload') as c16,
       to_regclass('public.ai_content_reports')          as t17,
       to_regclass('public.ai_processing_consents')      as t18,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='verified_purchases' and column_name='is_test') as c19,
       to_regclass('public.consultation_answer_witness') as t20;
```

**기대**: 이력 끝 `20260913000000` · 정책 **4행** · 새 객체 전부 `null`/`0`.
🛑 **새 객체가 하나라도 이미 있으면 멈춤** — 누가 먼저 적용한 것입니다.

### ①-3 dry-run

```bash
cd C:\Development\_prodpush
npx supabase db push --dry-run --project-ref olvkpaldrwvtexxpoaag
```

**정확히 이 일곱 줄**이어야 합니다:

```
Would push these migrations:
 • 20260914000000_drop_legacy_message_policies.sql
 • 20260915000000_model_pricing.sql
 • 20260916000000_m13_share_server_snapshot.sql
 • 20260917000000_ai_content_reports.sql
 • 20260918000000_ai_processing_consent.sql
 • 20260919000000_iap_google_runtime.sql
 • 20260920000000_share_witness_and_gaps.sql
```

🛑 **한 줄이라도 다르면 멈춤.** `--include-all` 을 요구해도 멈춤(이번 대조에서는 필요 없습니다).

### ①-4 적용

```bash
cd C:\Development\_prodpush
npx supabase db push --project-ref olvkpaldrwvtexxpoaag
```

### ①-5 적용 후 확인 조회

```sql
-- 이력
select version from supabase_migrations.schema_migrations order by version desc limit 8;

-- 표·칸·함수
select to_regclass('public.ai_content_reports')          as reports,
       to_regclass('public.ai_processing_consents')      as consents,
       to_regclass('public.consultation_answer_witness') as witness,
       to_regclass('public.model_pricing')               as pricing;
select proname from pg_proc
 where proname in ('get_shared_report','witnessed_share_payload','record_answer_witness','backfill_answer_witness',
                   'grant_ai_consent','admin_ai_content_reports','record_purchase_runtime')
 order by proname;

-- ⚠ 14 가 실제로 지웠는지 (drop if exists 는 이름이 틀려도 조용히 성공한다)
select policyname from pg_policies
 where schemaname='public' and tablename='conversation_messages' order by 1;

-- 트리거 (16 셋 + 20 둘)
select tgname from pg_trigger
 where tgname in ('report_shares_snapshot_ins','report_shares_freeze_upd','consultation_reports_revoke_shares',
                  'paid_request_idempotency_witness','conversation_messages_role_guard')
 order by 1;

-- RLS
select tablename, rowsecurity from pg_tables where schemaname='public'
   and tablename in ('ai_content_reports','ai_processing_consents','consultation_answer_witness','model_pricing','fx_rate');

-- ⚠ 증인 표에 사용자 정책이 **하나도 없어야** 한다
select count(*) as witness_policies from pg_policies
 where schemaname='public' and tablename='consultation_answer_witness';
```

**기대**:

| 조회 | 기대 |
|---|---|
| 이력 | `20260920000000` 이 맨 위 |
| 표 넷 | 전부 `null` 아님 |
| 함수 | **7행** |
| conversation_messages 정책 | **2행만** (`messages_insert_via_conversation` · `messages_select_via_conversation`) |
| 트리거 | **5행** |
| RLS | 다섯 다 `true` |
| witness_policies | **0** |

🛑 **하나라도 다르면 멈춤.**

### ①-6 ⚠ 상담이 여전히 되는가 (마이그레이션 20 이 상담 완료 경로에 트리거를 붙였다)

production 에 로그인할 수 있는 계정으로 **상담 1회**를 하십시오(웹이 아직 옛 코드여도 상담은 됩니다).
그 뒤:

```sql
-- 방금 상담이 증인을 남겼는가
select workload, cardinality(digests) as 해시수, created_at
  from public.consultation_answer_witness order by created_at desc limit 3;
```

**기대**: 방금 시각의 행 1개 · 해시 수 수백 개.
🛑 **상담이 실패하면 즉시 멈추고 ⑨ 되돌리기 20 을 실행하십시오.**
(설계상 트리거는 예외를 삼켜 상담을 막지 않습니다. staging 실측: 미니팩 25건 + 양성 대조 2건 = 완료 27건에서
누락 0 · 실패 0.)

### ①-7 ⚠ 이전 답의 증인 채우기 (백필) — **④ 웹 병합 전에 끝낼 것**

마이그레이션 20 **이전**에 한 상담에는 증인이 없습니다. 그대로 두면 그 상담으로 만든 **정상 리포트를
공유해도 빈 페이지**가 나갑니다(staging 실측: 표본 5건 전부 핵심·주의·요약 0). 위험이 아니라 품질 문제지만,
웹 병합 뒤에는 사용자가 공유할 수 있으므로 **병합 전에** 끝냅니다.

SQL Editor 에서 아래 한 줄을 **결과가 0 이 될 때까지** 반복 실행하십시오(한 번에 최대 300건 · 30초 안팎):

```sql
select public.backfill_answer_witness(300);
```

끝나면 확인:

```sql
select count(*) as 남은것 from public.paid_request_idempotency i
 where i.status = 'COMPLETED' and i.response_json is not null
   and not exists (select 1 from public.consultation_answer_witness w
                    where w.user_id = i.user_id and w.workload = i.workload and w.request_id = i.request_id);
```

**기대**: `남은것 = 0`. (staging: 698 → 398 → 98 → 0, 세 번 · 24초 · 30초 · 10초)

🛑 한 번 실행이 **시간 초과**로 실패하면 숫자를 `100` 으로 줄여 다시. 두 번 연속 결과가 **줄지 않으면** 멈춤.

> 왜 마이그레이션 안에서 한 번에 하지 않나: staging 에서 한 문장으로 돌렸더니 698건에서 **statement
> timeout(2분)**. 그리고 `db push` 는 파일 하나를 한 트랜잭션으로 돌려서, 그동안 `paid_request_idempotency`
> 잠금이 남아 **상담 완료가 멈춥니다.** 짧게 끊어 부르면 잠금이 없습니다.

---

## ② Edge 배포 — **4개**

```bash
cd C:\Development\_prodpush
npx supabase functions deploy chat            --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy verify-purchase --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy google-rtdn     --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy iap-reconcile   --project-ref olvkpaldrwvtexxpoaag
```

⚠ `_prodpush` 폴더는 ①-1 에서 복사한 것입니다. **Edge 코드도 그 복사본에서** 올라갑니다.
①-1 이후에 레포를 고쳤다면 다시 복사하십시오.

| 함수 | 이번 배포로 바뀌는 동작 |
|---|---|
| `chat` | **없음** — 동의 게이트가 들어갔지만 시크릿이 없으면 꺼져 있습니다 |
| `verify-purchase` | 키가 없으면 **`NOT_CONFIGURED` 로 실패**(지급 없음). 지금 production 에 결제가 없으므로 영향 없음 |
| `google-rtdn` | 인증 설정이 없으면 **처리 안 함**(503) |
| `iap-reconcile` | 크론 시크릿 없이 부르면 401. 크론을 아직 걸지 않았으므로 영향 없음 |

### ②-1 확인

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://olvkpaldrwvtexxpoaag.supabase.co/functions/v1/verify-purchase
```

**기대**: `401` (로그인 필요). 🛑 `404` 면 배포가 안 된 것입니다.

---

## ③ AI 동의 게이트 — **꺼져 있는지 확인**

```bash
npx supabase secrets list --project-ref olvkpaldrwvtexxpoaag
```

**기대**: 목록에 `AI_CONSENT_ENFORCED` 가 **없다**.
🛑 **있으면 멈춤** — 지금 켜져 있으면 실사이트 상담이 막혀 있는 상태입니다. 먼저 끄십시오:

```bash
npx supabase secrets unset AI_CONSENT_ENFORCED --project-ref olvkpaldrwvtexxpoaag
```

---

## ④ 커밋 · 푸시 → Preview → 웹 병합

### ④-1 커밋 두 개

⚠ **순서가 중요합니다.** 인덱스에 담긴 체크포인트(66파일)를 **먼저** 커밋하고, 그 다음에
나머지(묶음3 + 이번 묶음)를 커밋합니다.

```bash
cd C:\Development\DeokbunAI-app

# 1) 체크포인트 — 인덱스 그대로
git commit -F C:\Development\owner_inputs\CHECKPOINT_COMMIT_MSG.txt

# 2) 묶음3 + 이번 묶음
git add -A
git commit -F C:\Development\owner_inputs\BUNDLE3_4_COMMIT_MSG.txt

git push origin admin/master-operations-content
```

⚠ 비밀값 검사를 두 번 했습니다(체크포인트 66건 · 나머지 60건). **staging 실제 키 원문은 레포
어디에도 없습니다**(메모리에 올린 키와 전 파일을 대조). 적중 1건은 보고서가 인용한 합성 자리표시자
(`sb_secret_AAAA…`)입니다.

### ④-2 Preview 확인 (⚠ Preview 도 production DB 를 봅니다 — 쓰기 행동 금지)

`docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md` ② 목록 + 아래 넷:

| # | 확인 | 기대 |
|---|---|---|
| 8 | 관리자 → **AI 답변 신고** | 목록 화면(비어 있음). "설치되지 않았습니다" 가 **아니어야** 함 |
| 9 | 관리자 → AI 사용량 → 원가 카드 | "가격 미확인" (단가 미입력). "설치되지 않았습니다" 가 **아니어야** 함 |
| 10 | MY → **AI 처리 동의** 섹션 | 보인다 (로그인 필요 — 보기만) |
| 11 | 상담 답변 아래 **"이 답변 신고하기"** | 보인다 (보기만) |

### ④-3 ⓓ ⚠⚠ 웹 병합은 **① 이 끝난 뒤에만**

> **왜**: 이 병합이 **공유 화면을 실사이트에 처음 올립니다.** 그런데 production DB 에는 옛
> `get_shared_report`(20260818000300)가 **이미 있습니다.** ①의 16·20 이 적용되기 전에 병합하면,
> 사용자가 **지어낸 리포트를 덕분이 이름으로 공유하는 경로가 실사이트에 열립니다**(staging 실측:
> DTO 다섯 칸 전부 노출). ①-5 가 통과하고 **①-7 의 `남은것` 이 0** 인 뒤에만 병합하십시오
> (①-7 이 안 끝났으면 이전 상담으로 만든 리포트가 빈 페이지로 공유됩니다).

GitHub → Pull requests → New → base `main` ← compare `admin/master-operations-content` → Merge.

### ④-4 병합 후 5분 확인

`docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md` ⑤ 목록 그대로.

---

## ⑤ AI 동의 게이트 켜기 — **웹 병합 확인 뒤**

이제 실사이트에 동의 화면이 있습니다.

```bash
npx supabase secrets set AI_CONSENT_ENFORCED=true --project-ref olvkpaldrwvtexxpoaag
```

### ⑤-1 확인

1. **새 계정**(또는 동의하지 않은 계정)으로 실사이트에서 상담 시도
2. **AI 처리 동의 화면이 떠야 합니다.** 체크박스는 **비어 있어야** 합니다
3. 동의 → 상담이 됩니다
4. MY → AI 처리 동의 → **철회** → 다시 상담 → 동의 화면이 다시 떠야 합니다

🛑 **동의 화면 없이 "지금 처리하지 못했어요" 류가 뜨면 즉시 끄십시오**:

```bash
npx supabase secrets unset AI_CONSENT_ENFORCED --project-ref olvkpaldrwvtexxpoaag
```

(그건 웹이 옛 코드라는 뜻입니다 — 병합이 반영되지 않은 것.)

⚠ **이 게이트는 출시 시점에 켜져 있어야 합니다**(애플 5.1.2(i)). 켠 뒤로는 끄지 마십시오.

---

## ⑥ 앱 빌드

`app.json` 의 `expo-iap` 줄을 먼저 넣으십시오(`docs/APPENDIX_C_APP_JSON_DIFFS_2026-09-11.md` C-1).

```bash
cd C:\Development\DeokbunAI-app
npx expo install --check
npx eas-cli@latest build --platform android --profile production
```

⚠ **커밋한 뒤에 빌드하십시오.** 이번에 확인한 사실: EAS 는 커밋되지 않은 변경까지 올려 빌드하면서
빌드 기록에는 **HEAD 커밋 해시만** 남깁니다(2026-09-10 빌드: 해시는 `455a249` 인데 실제 번들에는
커밋 안 된 묶음3 기능이 들어 있었습니다). 스토어 빌드는 커밋에서 재현될 수 있어야 합니다.

✅ **target API 는 확인됐습니다** — 같은 SDK 설정으로 만든 빌드의 로그: `minSdk 24 · compileSdk 36 ·
targetSdk 36`. 구글 요구치(API 36)를 충족합니다. `expo-build-properties` 는 필요 없습니다.

---

## ⑨ 되돌리기

**순서는 적용의 역순**입니다. 20 → 19 → … → 14.

### 20 — 공유 증인

```sql
drop trigger if exists paid_request_idempotency_witness on public.paid_request_idempotency;
drop trigger if exists conversation_messages_role_guard on public.conversation_messages;
drop function if exists public.record_answer_witness();
drop function if exists public.backfill_answer_witness(integer);
drop function if exists public.conversation_messages_role_guard();
drop function if exists public.witnessed_share_payload(uuid, jsonb);
drop table if exists public.consultation_answer_witness;
drop function if exists public.jsonb_string_leaves(jsonb);
drop function if exists public.witness_digest(text);
drop function if exists public.witness_skeleton(text);
-- report_shares_snapshot · report_shares_freeze 는 16 의 정의로 되돌린다:
--   supabase/migrations/20260916000000_m13_share_server_snapshot.sql 의 두 함수 본문을 그대로 실행
delete from supabase_migrations.schema_migrations where version = '20260920000000';
```

⚠ 20 만 되돌리면 **"처음부터 위조한 리포트 공유" 가 다시 열립니다**(16 만으로는 막히지 않습니다).

### 19 · 18 · 17 · 16 · 15 · 14

`docs/OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md` ⑨ 그대로입니다.

### Edge

이전 버전을 다시 배포합니다 — `main` 을 체크아웃한 별도 폴더에서 `supabase functions deploy <이름>`.
⚠ `chat` 은 **삭제하지 마십시오**(상담이 멈춥니다).

### 동의 게이트

```bash
npx supabase secrets unset AI_CONSENT_ENFORCED --project-ref olvkpaldrwvtexxpoaag
```

---

## 요약 카드 — 이 한 장만 보셔도 됩니다

| 단계 | 명령 한 줄 | 🛑 멈춤 신호 |
|---|---|---|
| ⓪ | SQL ⓪-3 · ⓪-6 · M4 §5-1 · 익명 로그인 · `git diff --cached --name-only \| wc -l` | 공유≠0 · CASCADE 아님 · 익명 켜짐 · 인덱스≠66 |
| ① | `npx supabase db push --dry-run …` → 7줄 확인 → `db push` → ①-7 `backfill_answer_witness(300)` 을 0 까지 | 목록 다름 · ①-5 불일치 · 상담 실패 · 백필이 안 줄어듦 |
| ② | `functions deploy` ×4 | `verify-purchase` 가 404 |
| ③ | `secrets list` → `AI_CONSENT_ENFORCED` 없음 | 있음 |
| ④ | 커밋 2개 → push → Preview → **①-5 통과 · ①-7 남은것 0 확인 후** 병합 | Preview 11항목 중 하나라도 실패 |
| ⑤ | `secrets set AI_CONSENT_ENFORCED=true` → 동의 화면 확인 | 동의 화면 없이 실패 문구 |
| ⑥ | `app.json` 한 줄 → 커밋 → `eas build --profile production` | `expo install --check` 불일치 |
