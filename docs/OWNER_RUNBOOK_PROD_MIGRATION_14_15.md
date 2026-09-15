# 오너 런북 — production 마이그레이션 14·15 적용 (2026-09-10)

> ⚠ **CTO 판정 전에는 ③을 실행하지 마십시오.** ①·②는 읽기 전용이라 지금 해도 됩니다.
>
> ⚠ **DB 비밀번호는 이 문서에도, 채팅에도, 어떤 파일에도 적지 마십시오.** CLI 가 물어보면
> 터미널 입력창에 직접 치십시오. 화면에 안 보이는 것이 정상입니다.

---

## 0. 이번에 올라가는 것 — 딱 두 개

오너가 주신 스냅샷(`C:\Development\owner_inputs\prod_snapshot.txt`)과 레포 파일을
버전 문자열 그대로 대조했습니다. `[production · 오너 제공 CSV]`

| | |
|---|---|
| production 이력 | **59건** (`20260817000000` ~ `20260913000000`) |
| 레포 파일 | **61건** |
| **적용 대기** | **2건 — `20260914000000` · `20260915000000`** |
| 로컬 파일이 없는 production 버전 | **0건** |
| `--include-all` 필요 | **아니오** (대기 2건 모두 이력 최댓값보다 뒤) |
| `has_model_pricing` | `false` |
| RLS 꺼진 표 | 없음 |

**환경 판독: production 이 맞습니다.** 원가 표가 없고, RLS 꺼진 표가 없고, `20260913000000`
까지 들어가 있습니다(9/7 반영분).

| 파일 | 하는 일 | 판정 |
|---|---|---|
| `20260914000000_drop_legacy_message_policies.sql` | `conversation_messages` 옛 이름 정책 2개 삭제 | **접근 변화 없음** — 아래 §1 |
| `20260915000000_model_pricing.sql` | `model_pricing`·`fx_rate` 표 + `admin_ai_cost_window()` 함수 생성 | 새 객체만 만듦. 시드 insert 없음 |

---

## 1. 14가 지우는 정책 — 스냅샷으로 확인한 결론: **변화 없음**

production `conversation_messages` 에는 정책이 4개 있고, **조건이 글자까지 같은 두 쌍**입니다.

| 명령 | 옛 이름 (14가 지움) | 남는 이름 | 조건 |
|---|---|---|---|
| INSERT | `insert messages into own conversation` | `messages_insert_via_conversation` | `EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())` |
| SELECT | `select messages of own conversation` | `messages_select_via_conversation` | 같은 식 |

- **레포에서 옛 이름을 만드는 마이그레이션은 없습니다** (61개 파일 전수 검색 0건).
  초기에 대시보드나 커밋되지 않은 SQL 로 만들어진 것입니다.
- 남는 두 정책은 `20260817000300_consumer_core_conversations.sql:131,139` 이 만듭니다.
- 조건이 동일하므로 PostgreSQL 의 permissive OR 결합에서 **한쪽을 지워도 결과가 같습니다.**

**→ 결론: 변화 없음. 깨지는 기능 없음. 순수한 중복 정리입니다.**

### 13은 이미 적용돼 있습니다 (기록만)

`20260913000000` 은 이력에 있습니다. 스냅샷에 옛 이름 10개가 **하나도 없어서**, 실제로
지워진 것이 확인됩니다:

| 표 | 지워진 옛 정책 |
|---|---|
| `consultation_drafts` | `insert own draft` · `select own draft` · `update own draft` |
| `consultation_subjects` | `delete/insert/select/update own subjects` |
| `conversations` | `insert own conversations` · `select own conversations` · `update own conversations` |

⚠ **좋은 소식이 하나 있습니다.** `conversations` 의 INSERT 정책이 이제
`conversations_insert_own` **하나뿐**이고, 그것은 `subject_id` 가 본인 것인지까지 봅니다.
13 이전에는 옛 정책이 OR 로 붙어 그 제한이 무력화될 수 있었습니다. 지금은 살아 있습니다.

### H5 와의 관계: **없습니다**

H5 는 `global_reservation_requests` 표의 RLS 문제였고, 조치는
`20260912000000_global_reservation_requests_lockdown.sql` 의 `enable row level security` +
`revoke`/`grant` 입니다 — **정책이 아닙니다.** 13·14 가 건드리는 표 넷 중에 없습니다.
그리고 `20260912000000` 은 **이미 적용**돼 있고 스냅샷의 `rls_off_tables` 가 `null` 입니다.

---

## 2. 실행

### 준비 — 별도 폴더에서 실행

⚠ 레포 폴더의 훅이 production ref 를 막습니다. `supabase/` 만 복사해서 그 폴더에서 실행하십시오.

```powershell
robocopy "C:\Development\DeokbunAI-app\supabase" "C:\Development\_prodpush\supabase" /E /XD .temp
```

### ① 적용 전 확인 조회 (읽기 전용 — SQL Editor)

```sql
-- 1. 지금 이력의 끝이 20260913000000 인가
select version from supabase_migrations.schema_migrations order by version desc limit 3;

-- 2. ⚠ 14가 지울 정책의 **현재 정의를 받아 적습니다.** 되돌리려면 이 출력이 필요합니다.
select policyname, permissive, roles, cmd,
       pg_get_expr(polqual,      polrelid) as using_expr,
       pg_get_expr(polwithcheck, polrelid) as check_expr
  from pg_policies
  join pg_policy on pg_policy.polname = pg_policies.policyname
 where schemaname = 'public' and tablename = 'conversation_messages'
 order by policyname;

-- 3. 15가 만들 객체가 아직 없는지
select to_regclass('public.model_pricing') as model_pricing,
       to_regclass('public.fx_rate')       as fx_rate,
       (select count(*) from pg_proc where proname = 'admin_ai_cost_window') as fn;
```

**기대**: 1 → `20260913000000` 이 맨 위 · 2 → **4행**(위 §1 표) · 3 → `null`, `null`, `0`.

> ⚠ 2번 출력을 **파일로 저장해 두십시오.** 되돌리기(⑤)가 이 출력을 씁니다.
> 다른 것이 보이면 **중단하고 CTO 에게 보내십시오.**

### ② 무엇이 올라갈지 먼저 봅니다 (dry-run)

```bash
cd C:\Development\_prodpush
npx supabase db push --dry-run --project-ref olvkpaldrwvtexxpoaag
```

**정확히 이 두 줄이 나와야 합니다:**

```
Would push these migrations:
 • 20260914000000_drop_legacy_message_policies.sql
 • 20260915000000_model_pricing.sql
```

⚠ **다른 것이 한 줄이라도 더 보이면 중단하고 CTO 에게 그 출력을 그대로 보내십시오.**
특히 `--include-all` 을 요구하거나 `20260914` 보다 앞선 번호가 보이면 멈추십시오.
(이번 대조에서는 필요 없는 것으로 확인됐습니다. 요구한다면 전제가 바뀐 것입니다.)

### ③ 적용 — **CTO 판정 후 실행**

```bash
cd C:\Development\_prodpush
npx supabase db push --project-ref olvkpaldrwvtexxpoaag
```

⚠ `--include-all` 을 **붙이지 마십시오.** 필요 없습니다.

### ④ 적용 후 확인 조회 (읽기 전용 — SQL Editor)

```sql
-- 표 두 개와 RLS
select tablename, rowsecurity from pg_tables
 where schemaname = 'public' and tablename in ('model_pricing','fx_rate');

-- ⚠ 시드가 없는 것이 정상입니다. 0 이 아니면 알려 주십시오.
select (select count(*) from public.model_pricing) as 단가행수,
       (select count(*) from public.fx_rate)       as 환율행수;

-- 함수
select proname, pronargs from pg_proc where proname = 'admin_ai_cost_window';

-- ⚠ 14가 **실제로 지웠는지**를 결과로 확인합니다.
--    `drop policy if exists` 는 이름이 틀려도 조용히 성공합니다 — 실행 성공은 증거가 아닙니다.
select policyname, cmd from pg_policies
 where schemaname = 'public' and tablename = 'conversation_messages'
 order by policyname;

-- 이력
select version from supabase_migrations.schema_migrations order by version desc limit 3;
```

**기대**:

| 조회 | 기대 |
|---|---|
| 표 | `model_pricing`·`fx_rate` 둘 다 `rowsecurity = true` |
| 행수 | 단가 `0` · 환율 `0` |
| 함수 | `admin_ai_cost_window` **1행** (`pronargs = 1`) |
| 정책 | **2행만** — `messages_insert_via_conversation`(INSERT) · `messages_select_via_conversation`(SELECT) |
| 이력 | `20260915000000` 이 맨 위 |

그리고 앱에서: 관리자 → AI 사용량 화면의 "최근 24시간 AI 비용" 카드가
**"이 환경에는 아직 원가 기능이 설치되지 않았습니다."** 대신 실제 집계를 보여야 합니다.
(단가를 아직 안 넣었으므로 금액 자리에는 **"가격 미확인"** 이 뜹니다. ₩0 이 뜨면 알려 주십시오 —
그건 "안 썼다" 로 읽히는 잘못된 표시입니다.)

### ⑤ 되돌리기

**15 — 만든 객체 제거** (다른 것이 쓰지 않습니다. `fx_rate` 도 이 마이그레이션이 처음 만듭니다):

```sql
drop function if exists public.admin_ai_cost_window(int);
drop table if exists public.model_pricing;
drop table if exists public.fx_rate;
delete from supabase_migrations.schema_migrations where version = '20260915000000';
```

**14 — 지운 정책 재생성.** ⚠ **①-2 에서 저장한 출력의 실제 정의를 쓰십시오.**
아래는 이번 스냅샷에서 읽은 정의 그대로입니다. ①-2 와 다르면 ①-2 가 맞습니다.

```sql
create policy "insert messages into own conversation"
  on public.conversation_messages for insert to public
  with check (exists (select 1 from public.conversations c
                       where c.id = conversation_id and c.user_id = auth.uid()));

create policy "select messages of own conversation"
  on public.conversation_messages for select to public
  using (exists (select 1 from public.conversations c
                  where c.id = conversation_id and c.user_id = auth.uid()));

delete from supabase_migrations.schema_migrations where version = '20260914000000';
```

⚠ 되돌려도 **접근은 달라지지 않습니다** — 같은 조건의 정책이 이미 있기 때문입니다.
이 SQL 은 "원래 모양으로 되돌린다" 는 뜻이지 "기능을 살린다" 는 뜻이 아닙니다.

---

## 3. 순서 — 웹 병합과의 관계

1. **먼저** 이 런북 ①·② (읽기 전용, 지금 가능)
2. CTO 판정
3. ③ 적용 → ④ 확인
4. 그 다음 웹 병합 (`docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md`)

⚠ 순서를 바꿔도 앱은 깨지지 않습니다. 관리자 원가 화면이 마이그레이션 전에는
"아직 설치되지 않았습니다" 를 보이도록 만들어 두었습니다(합성 검증 완료). 다만 **④의
"실제 집계가 보인다" 확인은 ③ 뒤에만** 할 수 있습니다.

---

## 4. 새 마이그레이션을 만들 일이 생기면

⚠ **`supabase migration new` 를 쓰지 마십시오.** 이 레포의 번호는 **날짜가 아니라 순번**이고
(이력에 `20260832000000`~`20260847000000` = 8월 32~47일이 있습니다) 현재 시각으로 만들면
기존 파일보다 앞에 끼어들어 순서가 뒤집힙니다.

```bash
node scripts/next-migration-name.mjs add_foo_table
```

레포 최대 번호보다 큰 번호를 찍어 줍니다(지금은 `20260916000000`).
