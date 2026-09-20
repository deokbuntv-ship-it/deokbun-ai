# production 적용 패키지 — **잔액 뷰 보안** (2026-09-18) · 이것만 따로 올린다

## ✅ **production 적용 완료 — 2026-09-20 (오너 · SQL Editor)**

| 단계 | 결과 |
|---|---|
| ① 적용 전 확인 | `duk_balance` **true** · `duk_spendable` **true** (열려 있던 상태 확인) |
| ② 적용 | `Success. No rows returned` |
| ③ 적용 후 확인 | `views_anon_can_read` **0** · `views_fixed` **2** · `admin_fns_anon_can_call` **0** — staging 과 같은 값 |
| ④ 앱 확인 | 실사이트 지갑에서 **15덕 정상 표시** |

- staging: 2026-09-18 적용 · 검증 완료 / production: 2026-09-20 적용 · 검증 완료. **이 패키지는 닫힌다.**
- 📌 **개인정보 처리방침 초안의 "행 단위 접근통제(RLS) 적용" 문구가 이제 사실이 됐다.** 적용 전에는 표에만 맞고 **뷰에는 틀린 말**이었다(뷰가 행 보안을 지나쳤다). 지금은 뷰도 부른 사람의 권한으로 돌아 같은 정책을 지난다 — 문구를 고칠 필요는 없고, **문구가 사실이 되도록 코드를 고친 것**이다.

---

> **한 줄** — 로그인하지 않아도 모든 사용자의 덕 잔액이 읽히던 것을 막는다. 마이그레이션 **1개**, 다른 변경은 없다.
> **CTO 판정(2026-09-18)** — "지금 따로 고친다. 다른 작업과 묶지 말고 이것만 먼저 올린다."

| | |
|---|---|
| 올리는 것 | 마이그레이션 **1개** — `supabase/migrations/20260923000000_duk_view_security_invoker.sql` |
| 코드 · Edge · 웹 | **없음** (앱도 웹도 다시 배포하지 않는다) |
| 걸리는 시간 | 1~2분 |
| 위험도 | **낮음** — 뷰의 권한만 바꾼다. 데이터는 건드리지 않는다. 되돌리기 3줄 |
| staging 확인 | ✅ 적용 · 검증 끝(2026-09-18): 로그인 없이 **401** · 로그인 사용자는 **자기 1행만** · 관리자 함수는 로그인 없이 **permission denied** |

**무엇이 문제였나** — `duk_balance` · `duk_spendable` 는 만든 사람(postgres) 권한으로 도는 보통 뷰라, 표에 걸어 둔 행 보안을 지나쳤다.
거기에 로그인 없이도 읽을 권한이 있어서, 앱·웹에 들어 있는 공개 키만 있으면 **모든 사용자의 사용자 id 와 덕 잔액**이 읽혔다.
production 실측(오너, 2026-09-18): 두 뷰 모두 열려 있었고 **3명분**(전부 오너 계정)이 보였다. 이름·이메일·생년월일·상담 내용은 이 뷰에 없다.

**무엇을 고치나** — ① 두 뷰를 **부른 사람 권한**으로 돌린다(그러면 원장에 이미 있는 "자기 것만" 정책이 적용된다) ② 로그인 없는 조회 권한을 뺀다 ③ 관리자 함수를 로그인 없이 **호출조차** 못 하게 한다(데이터는 새지 않았다 — 함수마다 관리자 검사가 있다).

---

## ① 올리기 전 — 지금 상태 확인 (읽기만)

**Supabase → production 프로젝트 → SQL Editor** 에 아래 한 줄을 붙여 넣고 Run.

```sql
select c.relname, has_table_privilege('anon', c.oid, 'select') as anon_can_read, coalesce(array_to_string(c.reloptions, ','), '') as options from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'v' order by 1;
```

기대: `duk_balance` · `duk_spendable` 두 줄이 나오고 `anon_can_read` 가 **true**, `options` 는 비어 있다.
→ 이미 false 이고 `security_invoker=true` 라면 **이미 적용된 것이다. 여기서 멈춘다.**

## ② 적용 — SQL Editor 에 **한 번** 붙여 넣기 (오너 요청 방식)

> 아래는 마이그레이션 파일과 **같은 내용**이다. 전부 한 덩어리로 실행한다(중간에 실패하면 통째로 되돌아간다).
> 마지막 줄은 "이 마이그레이션은 이미 적용됨" 이라고 **기록**해 두는 것이다 — 나중에 파일이 병합돼도 다시 실행되지 않는다.
> staging 에서 **이 문장 그대로** 검증했다(2026-09-18, 되돌리기 방식).

```sql
begin;
alter view public.duk_balance set (security_invoker = true);
alter view public.duk_spendable set (security_invoker = true);
revoke select on table public.duk_balance from anon;
revoke select on table public.duk_spendable from anon;
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (p.proname like 'admin\_%' or p.proname = 'famous_duplicate_candidates')
      and has_function_privilege('anon', p.oid, 'execute')
  loop
    execute format('revoke execute on function %s from anon', r.sig);
  end loop;
end $$;
insert into supabase_migrations.schema_migrations (version, name)
values ('20260923000000', 'duk_view_security_invoker')
on conflict (version) do nothing;
commit;
notify pgrst, 'reload schema';
```

기대: `Success. No rows returned` 같은 성공 표시. 빨간 오류가 나오면 **멈추고 알려 주세요**(아무것도 바뀌지 않는다).

> (참고) 레포에서 CLI 로 올리는 방법도 같다: `npx.cmd supabase@2.117.0 db push --dry-run --project-ref olvkpaldrwvtexxpoaag` 로 **한 줄만** 나오는지 보고 `--dry-run` 없이 다시 실행. 둘 중 **하나만** 하면 된다.

## ③ 올린 뒤 — 확인 (읽기만)

SQL Editor 에 아래 한 줄.

```sql
select (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relkind='v' and has_table_privilege('anon', c.oid, 'select')) as views_anon_can_read, (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relname in ('duk_balance','duk_spendable') and coalesce(array_to_string(c.reloptions, ','), '') like '%security_invoker=true%') as views_fixed, (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname like 'admin\_%' and has_function_privilege('anon', p.oid, 'execute')) as admin_fns_anon_can_call;
```

**기대값 (staging 과 같아야 한다)**

| 칸 | 기대 |
|---|---|
| `views_anon_can_read` | **0** |
| `views_fixed` | **2** |
| `admin_fns_anon_can_call` | **0** |

## ④ 앱이 그대로 되는지 — 오너가 1분

1. 실사이트(www.deokbunai.com)에 **로그인**한다.
2. **지갑**을 연다 → 덕 잔액이 **전과 같이 보이면 통과**.
3. (선택) 관리자 화면 → 덕 화면이 열리면 통과.

→ 잔액이 비어 보이면 **바로 알려 주세요**(⑤ 로 되돌린다).

## ⑤ 되돌리기 — 필요할 때만

SQL Editor 에 아래를 붙여 넣고 Run. (권한을 원래대로 돌려놓는다.)

```sql
begin;
alter view public.duk_balance set (security_invoker = false);
alter view public.duk_spendable set (security_invoker = false);
grant select on table public.duk_balance to anon;
grant select on table public.duk_spendable to anon;
delete from supabase_migrations.schema_migrations where version = '20260923000000';
commit;
notify pgrst, 'reload schema';
```

> 관리자 함수의 anon 실행 권한은 **되돌리지 않는다** — 원래 열려 있을 이유가 없었다.

## 안 하는 것

- 코드 · Edge · 웹 배포 없음 · 앱 업데이트 없음
- 다른 마이그레이션 없음(②-1 에서 한 줄만 나오는 것으로 확인)
- 데이터 변경 없음(덕 · 원장 · 사용자 건드리지 않음)
