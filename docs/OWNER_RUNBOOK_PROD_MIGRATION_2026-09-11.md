# 오너 런북 — production 반영 (2026-09-11 갱신)

> ⚠⚠ **전부 CTO 판정 후입니다.** ①·②는 읽기 전용이라 지금 해도 됩니다.
>
> ⚠ **순서가 중요합니다.** 새 코드가 새 DB 객체를 씁니다. 순서를 바꾸면 기능이 깨집니다:
>
> ```
> ① DB 마이그레이션  →  ② Edge 배포  →  ③ 웹 병합  →  ④ 앱 빌드
> ```
>
> ⚠ **DB 비밀번호는 어디에도 적지 마십시오.** CLI 가 물어보면 터미널에 직접 치십시오.

---

## 0. 적용 대기 목록 — **6건**

지난 판정분 2건에 이번 묶음 4건이 더해졌습니다.

| # | 파일 | 하는 일 | 판정 |
|---|---|---|---|
| 14 | `20260914000000_drop_legacy_message_policies.sql` | `conversation_messages` 옛 이름 정책 2개 삭제 | **변화 없음** (CTO 승인 완료) |
| 15 | `20260915000000_model_pricing.sql` | 원가 표 2개 + 집계 함수 | 새 객체만 · 시드 없음 (CTO 승인 완료) |
| **16** | `20260916000000_m13_share_server_snapshot.sql` | **M13 차단** — 공유 스냅샷 · 트리거 3 · `get_shared_report` 교체 · `conversations_update_own` 대칭 | 아래 §1 |
| **17** | `20260917000000_ai_content_reports.sql` | **AI 답변 신고** 표 + 관리자 RPC | 새 객체만 |
| **18** | `20260918000000_ai_processing_consent.sql` | **AI 처리 동의** 표 + RPC 3 | 새 객체만 |
| **19** | `20260919000000_iap_google_runtime.sql` | 결제 런타임 칸 5 + RPC 4 | `verified_purchases` 에 **칸만 추가** |

전부 staging 에 적용돼 있고, 16 은 **되돌렸다 다시 올려 멱등성을 확인**했습니다(2회).

### ⚠ 16 이 바꾸는 기존 동작 두 가지 (읽고 판정해 주십시오)

1. **`get_shared_report` 를 교체합니다.** 읽는 곳이 `consultation_reports.report_payload` 에서
   `report_shares.shared_payload`(서버 스냅샷)로 바뀝니다. DTO 여섯 칸과 인증 규칙은 그대로입니다.
   - ⚠ 원본 파일(`20260818000300`)의 `search_path` 에 `extensions` 가 **없어서** 그대로 다시
     만들면 `digest()` 를 못 찾습니다(실측: `42883`, PostgREST 는 404 로 보여 줍니다).
     16 은 `public, extensions, pg_temp` 로 고쳤습니다. **즉 레포 파일과 실제로 돌던 함수가
     달랐습니다** — 대시보드나 커밋되지 않은 SQL 로 고쳐진 계열입니다.
2. **`conversations_update_own` 정책을 교체합니다.** INSERT 가 이미 걸던 subject 소유 조건을
   UPDATE 에도 겁니다. 기존 앱 동작에는 영향이 없습니다(자기 subject 만 붙이므로).

### ⚠ 16 이 과거를 되돌리지는 않습니다

이미 만들어진 공유 링크는 마이그레이션 시점의 `report_payload` 를 스냅샷으로 받습니다.
그 사이에 위조된 것이 있다면 **그 위조본이 스냅샷됩니다.** staging 실측에서 그렇게 나왔고,
그건 마이그레이션의 결함이 아니라 시간의 방향입니다. production 에 공유 링크가 몇 개나
있는지는 아래 ① 로 확인하십시오.

---

## ① 적용 전 확인 조회 (읽기 전용 — SQL Editor)

```sql
-- 1. 이력의 끝
select version from supabase_migrations.schema_migrations order by version desc limit 3;

-- 2. ⚠ 14가 지울 정책의 현재 정의를 받아 적습니다 (되돌리기에 필요합니다)
select policyname, cmd, qual, with_check from pg_policies
 where schemaname='public' and tablename='conversation_messages' order by policyname;

-- 3. 16~19가 만들 객체가 아직 없는지
select to_regclass('public.model_pricing')        as t15_model_pricing,
       to_regclass('public.ai_content_reports')   as t17_reports,
       to_regclass('public.ai_processing_consents') as t18_consents,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='report_shares' and column_name='shared_payload') as c16_snapshot,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='verified_purchases' and column_name='is_test') as c19_is_test;

-- 4. ⚠ 지금 살아 있는 공유 링크가 몇 개인가 (16 의 backfill 대상)
select count(*) as 활성공유, min(created_at) as 가장오래된
  from public.report_shares where status='active' and revoked_at is null;
```

**기대**: 1 → `20260913000000` · 2 → **4행** · 3 → 전부 `null`/`0` · 4 → 숫자(0이어도 정상)

> ⚠ 3의 결과가 `null`/`0` 이 아니면 **중단하고 CTO 에게 보내십시오.** 이미 적용된 것입니다.

## ② dry-run — 무엇이 올라갈지 먼저 봅니다

⚠ 레포 폴더의 훅이 production ref 를 막습니다. `supabase/` 만 복사해서 그 폴더에서:

```powershell
robocopy "C:\Development\DeokbunAI-app\supabase" "C:\Development\_prodpush\supabase" /E /XD .temp
```

```bash
cd C:\Development\_prodpush
npx supabase db push --dry-run --project-ref olvkpaldrwvtexxpoaag
```

**정확히 이 여섯 줄이 나와야 합니다:**

```
Would push these migrations:
 • 20260914000000_drop_legacy_message_policies.sql
 • 20260915000000_model_pricing.sql
 • 20260916000000_m13_share_server_snapshot.sql
 • 20260917000000_ai_content_reports.sql
 • 20260918000000_ai_processing_consent.sql
 • 20260919000000_iap_google_runtime.sql
```

⚠ **한 줄이라도 다르면 중단하고 그 출력을 CTO 에게 보내십시오.**
`--include-all` 을 요구하면 전제가 바뀐 것입니다 (이번 대조에서는 필요 없습니다).

## ③ 적용 — **CTO 판정 후**

```bash
cd C:\Development\_prodpush
npx supabase db push --project-ref olvkpaldrwvtexxpoaag
```

## ④ Edge 배포 — **DB 다음**

```bash
cd C:\Development\_prodpush
npx supabase functions deploy chat            --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy verify-purchase --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy google-rtdn     --project-ref olvkpaldrwvtexxpoaag
npx supabase functions deploy iap-reconcile   --project-ref olvkpaldrwvtexxpoaag
```

⚠ `chat` 은 **AI 처리 동의 게이트**가 들어간 새 버전입니다. 게이트는 시크릿으로
**꺼져 있는 것이 기본**이라, 배포만으로는 동작이 바뀌지 않습니다.

## ⑤ 적용 후 확인 조회 (읽기 전용)

```sql
-- 이력
select version from supabase_migrations.schema_migrations order by version desc limit 7;

-- 표·칸
select to_regclass('public.ai_content_reports')     as reports,
       to_regclass('public.ai_processing_consents') as consents;
select column_name from information_schema.columns
 where table_schema='public' and table_name='report_shares' and column_name='shared_payload';
select column_name from information_schema.columns
 where table_schema='public' and table_name='verified_purchases'
   and column_name in ('is_test','purchase_token','acknowledged') order by column_name;

-- ⚠ 14가 **실제로** 지웠는지 결과로 확인 (drop if exists 는 이름이 틀려도 조용히 성공합니다)
select policyname, cmd from pg_policies
 where schemaname='public' and tablename='conversation_messages' order by policyname;

-- ⚠ 16의 backfill 이 돌았는지 — 스냅샷 없는 활성 공유가 0이어야 합니다
select count(*) as 스냅샷없는활성공유 from public.report_shares
 where status='active' and revoked_at is null and shared_payload is null;

-- 트리거 셋
select tgname from pg_trigger
 where tgname in ('report_shares_snapshot_ins','report_shares_freeze_upd','consultation_reports_revoke_shares');

-- RLS
select tablename, rowsecurity from pg_tables
 where schemaname='public' and tablename in ('ai_content_reports','ai_processing_consents','model_pricing','fx_rate');
```

**기대**:

| 조회 | 기대 |
|---|---|
| 이력 | `20260919000000` 이 맨 위 |
| 표 | 둘 다 `null` 이 아님 |
| 칸 | `shared_payload` 1행 · `acknowledged`·`is_test`·`purchase_token` 3행 |
| 정책 | **2행만** (`messages_insert_via_conversation`·`messages_select_via_conversation`) |
| 스냅샷 없는 활성 공유 | **0** |
| 트리거 | **3행** |
| RLS | 넷 다 `true` |

## ⑥ 웹 병합 — Edge 다음

`docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md` 를 따르십시오.
확인 목록에 두 가지를 더하십시오:

- 관리자 → **AI 답변 신고** 메뉴가 보이고, "설치되지 않았습니다" 가 **아닌** 목록이 뜬다
- MY 화면에 **AI 처리 동의** 섹션이 보이고 상태가 읽힌다

## ⑦ 앱 빌드 — 마지막

`app.json` 의 `expo-iap` 줄(→ `docs/OWNER_RUNBOOK_IAP_2026-09-11.md` ⓪)을 넣은 뒤:

```bash
npx eas-cli@latest build --platform android --profile production
```

## ⑧ ⚠ 출시 시점에 **서버 동의 확인을 켭니다**

애플 5.1.2(i) 를 만족하려면 production 에서 이 게이트가 **켜져 있어야** 합니다.

```bash
npx supabase secrets set AI_CONSENT_ENFORCED=true --project-ref olvkpaldrwvtexxpoaag
```

**켜기 전에 반드시 확인할 것**: 동의 화면이 들어간 **새 앱**이 배포돼 있는가.
옛 앱에는 동의 화면이 없어서, 게이트만 켜면 **상담이 통째로 막힙니다.**

켜진 것 확인:

```bash
npx supabase secrets list --project-ref olvkpaldrwvtexxpoaag
# AI_CONSENT_ENFORCED 가 목록에 있어야 합니다 (값은 해시로만 보입니다)
```

그리고 앱에서: 새 계정으로 상담을 시도 → **AI 처리 동의 화면이 뜨는지** 확인.

## ⑨ 되돌리기

**19 — 결제 런타임** (칸만 더했으므로 지워도 기존 동작이 그대로입니다):

```sql
drop function if exists public.find_purchase_by_token(text);
drop function if exists public.record_acknowledge_attempt(text, boolean);
drop function if exists public.iap_pending_acknowledgements(int);
drop function if exists public.record_purchase_runtime(text, text, text, boolean, boolean);
alter table public.verified_purchases
  drop column if exists is_test, drop column if exists purchase_token,
  drop column if exists store_product_id, drop column if exists acknowledged,
  drop column if exists consumed, drop column if exists last_retry_at, drop column if exists retry_count;
delete from supabase_migrations.schema_migrations where version = '20260919000000';
```

**18 — AI 동의**:

```sql
drop function if exists public.ai_consent_state(text);
drop function if exists public.revoke_ai_consent(text);
drop function if exists public.grant_ai_consent(text, text);
drop table if exists public.ai_processing_consents;
delete from supabase_migrations.schema_migrations where version = '20260918000000';
```
⚠ 먼저 `AI_CONSENT_ENFORCED` 를 **끄십시오.** 표가 없는데 게이트가 켜져 있으면
`chat` 이 조회 실패로 `unavailable` 을 돌려주어 상담이 멈춥니다(fail-closed 설계).

**17 — AI 신고**:

```sql
drop function if exists public.admin_ai_content_reports(text, int);
drop table if exists public.ai_content_reports;  -- 트리거·정책이 함께 사라집니다
delete from supabase_migrations.schema_migrations where version = '20260917000000';
```

**16 — M13** ⚠ 되돌리면 **공유 페이지가 다시 사용자가 쓴 글을 보여 줍니다**:

```sql
drop trigger if exists consultation_reports_revoke_shares on public.consultation_reports;
drop trigger if exists report_shares_freeze_upd on public.report_shares;
drop trigger if exists report_shares_snapshot_ins on public.report_shares;
drop function if exists public.report_payload_change_revokes_shares();
drop function if exists public.report_shares_freeze();
drop function if exists public.report_shares_snapshot();

-- get_shared_report 를 옛 정의로. ⚠ search_path 에 extensions 를 유지하십시오 —
--    빼면 digest() 를 못 찾아 함수가 404 로 죽습니다.
-- (원본은 supabase/migrations/20260818000300_report_shares.sql 63행부터,
--  `set search_path = public, extensions, pg_temp` 로만 고쳐서 붙여 넣으십시오)

alter table public.report_shares drop column if exists shared_payload;
delete from supabase_migrations.schema_migrations where version = '20260916000000';
```

**15 · 14** — `docs/OWNER_RUNBOOK_PROD_MIGRATION_14_15.md` ⑤ 그대로.

---

## ⑩ 체크포인트 커밋만 먼저 푸시·병합해도 되는가 — **판정**

**됩니다. 안전합니다.**

체크포인트 커밋(0-1, 66파일)은 **지난 두 묶음의 CTO 판정 완료분**이고, 그 안에 있는
DB 의존은 `20260915000000`(원가) 하나뿐입니다. 그리고 그 화면은 **RPC 가 없는 환경에서
"이 환경에는 아직 원가 기능이 설치되지 않았습니다" 를 보이도록** 이미 고쳐져 있습니다
(합성 검증 16건). 즉 **DB 를 건드리지 않고 병합해도 깨지는 것이 없습니다.**

⚠ 이번 묶음(신고·동의·결제)의 변경은 **커밋되어 있지 않습니다.** 스테이징만 돼 있고,
`git commit` 이 권한 계층에 막혔습니다. 그래서 지금 푸시하면 체크포인트까지만 올라갑니다 —
그것이 의도된 상태입니다.

커밋 명령 (오너):

```bash
cd C:\Development\DeokbunAI-app
git commit -F C:\Development\owner_inputs\CHECKPOINT_COMMIT_MSG.txt
git push origin admin/master-operations-content
```

⚠ `git add` 를 다시 하지 마십시오. 인덱스에 **체크포인트 66파일만** 담겨 있습니다.
`git add -A` 를 하면 이번 묶음까지 섞입니다.
