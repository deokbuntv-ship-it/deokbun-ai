# production 스키마 승격 계획 — **진짜 production 실측 기준 (2026-09-05 전면 재작성)**

> 대상: ref `olvkpaldrwvtexxpoaag` (`deokbuntv-ship-it's Project`)
>
> ## ✅ **2026-09-06 승격 완료**
>
> | | 결과 |
> |---|---|
> | 스키마 | **38개 push 완료** |
> | 테이블 | **57/57** |
> | 함수 | **93/93** |
> | Edge | **13개 ACTIVE** (레포 18개 중 — 남은 5개는 §10) |
> | 시크릿 | `OPENAI_API_KEY` · `NAVER_CLIENT_ID/SECRET` · `VERCEL_DEPLOY_HOOK_URL` · `CRON_SECRET` |
> | H5 잠금 | 적용됨 · `global_reservation_requests` **위조 행 0건** |
> | DB 비밀번호 | 리셋 완료 |
>
> ⚠ **아래 §1~§8 은 승격 *전* 상태를 적은 것입니다.** 기록으로 남깁니다.
> 승격 후 확인해야 할 것은 **§9**, 남은 Edge 는 **§10** 입니다.

---

## 0. ⚠⚠ 이전 판을 왜 버렸나 — 측정을 엉뚱한 데서 했습니다

이전 판(2026-09-04)은 "테이블 57/57 · 함수 93/93 · 과적재 0 · 불일치 0" 을 근거로
**"거의 다 되어 있고 승격은 정의 갱신용"** 이라고 결론냈습니다.

**그 사전점검은 staging 에서 돌아간 것이었습니다.** 대시보드의 프로젝트 선택기가
`Deokbuni Staging` 이었습니다. 그 위에 세운 판단이 전부 무효입니다:

| 이전 판의 결론 | 진짜 |
|---|---|
| "테이블 57/57 있음" | **33 있음 / 24 없음** |
| "함수 93/93 있음" | **38 있음 / 55 없음** |
| "20260836 이 이미 적용됐다" | 적용된 적 없다 |
| "H5 구멍이 production 에 나 있다" | **테이블 자체가 없다. 구멍도 없다** |
| "승격은 대부분 no-op" | **37개가 실제로 실행된다** |
| "불일치 0건" | 옛 정책 12개 · 컬럼 드리프트 다수 |

⚠ **이것이 문서-실제 불일치 아홉 번째입니다.** 앞의 여덟과 다른 점 하나:
앞의 것들은 문서가 낡아서 생겼습니다. 이번에는 **CTO 와 에이전트가 같은 잘못된 데이터를
공유하고 그 위에서 일관되게 추론했습니다.** 대조가 맞아떨어질수록 확신이 커졌고,
그 확신 자체가 오류였습니다.

> **내부 일관성은 정확성의 증거가 아닙니다.**
> 그리고 **어느 환경에서 쟀는지가 결과에 함께 적혀 있지 않으면, 그 결과는 사실이 아니라 소문입니다.**

재발 방지는 §7 에 있습니다.

---

## 1. 지금 production 이 어떤 상태인가

| | |
|---|---|
| 마이그레이션 이력 | **21개** (`20260817000000` ~ `20260827000000`) |
| 레포 | **58개** → **미적용 37개** |
| 테이블 | 기대 57 · **있음 33 / 없음 24** |
| 함수 | 기대 93 · **있음 38 / 없음 55** |
| 함수 과적재 | 없음 |
| RLS 꺼진 테이블 | **없음 (전부 켜져 있음)** |
| 백업 | 일일 자동. 최신 **2026-09-05 00:26**. PITR 없음(유료 애드온) |
| 플랜 | 무료에서 자동 정지돼 있었고, Pro 업그레이드 후 재개 |

**이력이 2026-08-27 에서 멈춰 있습니다.** 그 뒤로 열흘치 작업이 통째로 안 올라가 있습니다.

### 1-1. 기록과 실제가 어긋나는가 — **어긋나지 않습니다**

이력의 `INSERTED AT` 이 전부 파일명 날짜와 같은 정각이라 "기록됨 ≠ 실행됨" 을 의심할 만했습니다.
확인했습니다:

- 기록된 21개가 만드는 **테이블 20개 · 함수 13개** 를 전부 뽑아, 오너가 준
  "없는 테이블 24 / 없는 함수(명시된 것)" 목록과 대조했습니다.
- **기록엔 있는데 객체가 없는 것: 0건.**
- 반대로 **없는 테이블 24개는 전부 미적용 마이그레이션이 만드는 것**이었습니다.

→ **이력은 신뢰할 수 있습니다.** `migration repair` 는 필요 없습니다.
(정각 타임스탬프는 Supabase CLI 가 파일명에서 version 을 취하는 방식 때문이지 위조가 아닙니다.)

### 1-2. ⚠⚠ 그런데 반대 방향에 큰 것이 있습니다 — **기록엔 없는데 객체가 있습니다**

production 에 **있는** 테이블 33개 중 **13개는 그것을 만드는 마이그레이션이 미적용**입니다.
즉 **레포 밖에서, 손으로 만들어졌습니다** (`docs/admin/*_SETUP.sql` 계열).

| 테이블 | 만드는(미적용) 마이그레이션 |
|---|---|
| `ai_usage_logs` | `20260902000000` |
| `admin_users` | `20260904000000` |
| `content_items` · `content_versions` · `content_publications` · `content_assets` | `20260904000100` |
| `famous_profiles` · `famous_snapshots` · `famous_ai_suggestions` · `provider_connections` | `20260904000100` |
| `advertisements` · `ad_tracking_events` · `user_acquisition_attribution` | `20260904000400` |

**이것이 이번 승격의 가장 큰 위험입니다.** 이유는 하나입니다 —
그 마이그레이션들은 전부 `create table if not exists` 로 시작하고,
**`if not exists` 는 이미 있는 테이블을 고치지 않습니다.**

손으로 만든 판에 없는 컬럼은 승격해도 **생기지 않고**, 바로 뒤따르는
**인덱스 23 · 정책 10 · 트리거 12 · alter 15** 가 그 컬럼을 참조하다
**그 지점에서 push 가 멈춥니다.**

**이미 그런 컬럼이 실측으로 확인됐습니다**: production 의 `content_items` 에 `video_url` 이 없습니다.
그 마이그레이션은 다행히 `add column if not exists video_url` 을 갖고 있습니다.
그런데 **13개 테이블의 나머지 151개 컬럼에는 그런 보정이 없습니다.**

→ 그래서 §4 의 순서에 **컬럼 보정 단계가 승격 앞에 들어갑니다**(`docs/PRODUCTION_COLUMN_RECONCILE.sql`).

---

## 2. 미적용 37개가 무엇을 하나

| version | 이름 | 만드는 것 |
|---|---|---|
| 20260828000000 | global_paid_generation_guard | 테이블 2 · 함수 3 · 시드 insert |
| 20260829000000 | consultation_decisions | 테이블 1 · 함수 1 |
| 20260830000000 | product_events_server_validation | 함수 1 |
| 20260831000000 | duk_economy_foundation | 테이블 3 · 함수 2 · 시드 insert |
| 20260832000000 | duk_economy_runtime | 테이블 6 · 함수 1 |
| 20260833000000 | duk_session_runtime | 함수 5 · **add column 6** |
| 20260834000000 | iap | 테이블 3 · 함수 2 |
| 20260835000000 | product_events_revoke_direct_insert | 권한만 |
| 20260836000000 | global_reservation_request_id | 테이블 1 · 함수 1 |
| 20260837000000 | fix_session_reason_reason_values | 함수 1 |
| 20260838000000 | welcome_duk_runtime | 함수 1 · 트리거 1 |
| 20260839000000 | server_analytics_derivation | 함수 3 · 트리거 3 |
| 20260840000000 | retention_scheduler | 테이블 2 · 함수 4 · 트리거 3 |
| 20260841000000 | monthly_email_ops | 테이블 2 · **함수 10** · 트리거 2 |
| 20260842000000 | admin_economy_ops | 테이블 1 · 함수 6 |
| 20260843000000 | duk_ledger_debt_offset_reason | 제약만 |
| 20260844000000 | retention_workers | 함수 5 |
| 20260845000000 | birthday_reward_runtime | 함수 1 |
| 20260846000000 | fix_reservation_release_reuse | 함수 2 |
| 20260847000000 | fix_reservation_request_uniq_partial | 인덱스만 |
| 20260902000000 | ai_usage_logs_schema_and_request_id | **add column 14** (⚠ §1-2) |
| 20260903000000 | account_deletion | 테이블 1 · 함수 2 |
| 20260904000000 | admin_foundation | 테이블 1 · 함수 7 · **drop fn 6** · 정책 1 |
| 20260904000100 | content_famous | **테이블 8 · 함수 13 · drop fn 5 · 정책 8 · 트리거 8** (⚠ §1-2) |
| 20260904000200 | content_media_storage | storage 정책 4 |
| 20260904000300 | admin_dashboard_trends | 함수 1 · drop fn 1 |
| 20260904000400 | advertisements_acquisition | 테이블 3 · 함수 5 · 트리거 5 (⚠ §1-2) |
| 20260905000000 | support_inquiries | 테이블 1 · 함수 3 · drop fn 2 |
| 20260905000100 | fix_inquiry_email_type | 함수 1 |
| 20260905000200 | famous_duplicate_guard | 함수 3 · drop fn 2 |
| 20260906000000 | shared_report_preview | 함수 1 |
| 20260907000000 | ai_usage_gate_firings | add column 1 |
| 20260908000000 | duk_ledger_bucket_unique | 인덱스만 |
| 20260909000000 | site_deploy_requests | 테이블 1 · 함수 1 · 정책 1 |
| 20260910000000 | famous_public_chart | 함수 1 |
| 20260911000000 | famous_chart_stale | 함수 1 · 트리거 1 |
| 20260912000000 | **global_reservation_requests_lockdown** | RLS 잠금 (§3-1) |
| 20260913000000 | **drop_legacy_policies** | 옛 정책 제거 (§3-2, **이번에 새로 만든 것**) |

합계: **테이블 37 · 함수 80 · drop function 19건 · 정책 14 · 트리거 24 · add column 27**

### 2-1. 위험도

- **`drop function` 19건** — 전부 같은 파일에서 바로 다음 줄에 재생성됩니다. 파일 하나가
  트랜잭션 하나라 중간 상태가 밖으로 보이지 않습니다. **production 에 트래픽이 없습니다.**
- **데이터를 건드리는 구문** — 시드 `insert ... on conflict do nothing` 계열이 대부분입니다.
  `drop table` · `truncate` · `drop column` **0건**. 파괴적 DDL이 없습니다.
- **staging 은 이 37개를 전부 통과했습니다.** 다만 출발점이 다릅니다 —
  staging 에는 §1-2 의 "손으로 만든 13개" 문제가 없었습니다. 그것이 이번의 미지수입니다.

---

## 3. 두 가지 별건

### 3-1. H5 (`global_reservation_requests` RLS) — **재판정: production 엔 구멍이 없었습니다**

이전 판은 "테이블이 이미 있고 RLS 가 꺼져 있으니 production 이 뚫려 있다" 고 적었습니다.
**틀렸습니다.** 그 테이블은 production 에 **아예 없습니다**(없는 24개 목록에 있습니다).
사전점검의 `RLS 꺼진 테이블: 없음` 도 같은 말을 하고 있었습니다.

staging 에서 익명 키로 718행이 읽힌 것은 **staging 의 사실**이고, 그건 이미 막았습니다
(`20260912000000` 적용·검증 완료, `KNOWN_RISKS` H5).

**⚠ 그런데 승격 중에 잠깐 열리는 창이 있습니다.**
`db push` 는 마이그레이션을 **파일마다 따로** 적용합니다. 그래서:

```
20260836000000  ← 테이블 생성 (이 순간 잠금 없음)
  … 24개 …          ← 이 동안 anon 에 노출된다
20260912000000  ← 잠금
```

그 사이 몇 분간 빈 테이블이 anon 에 열립니다. 그때 넣어진 행은
**잠근 뒤에도 남습니다**(RLS 는 기존 행을 지우지 않습니다).
그리고 나중에 Edge 를 배포하고 멱등 경로를 켜면 **그 행이 유효한 것으로 취급됩니다.**

- 실현 가능성은 낮습니다 — 그 창 동안 이 테이블을 읽거나 쓰는 코드가 하나도 없고,
  공격자가 그 몇 분을 노려야 합니다.
- **그래도 확인은 공짜입니다.** §4 단계 ⑦ 에 `select count(*) = 0` 확인을 넣었습니다.
  0이 아니면 `delete from public.global_reservation_requests;` — 중복 제거 장부라
  비우는 것이 안전한 상태입니다.

### 3-2. 옛 정책 12개 — **위험을 확정하지 못했습니다. 그래도 지웁니다**

네 테이블에 새 정책과 **옛 이름의 정책**이 같이 있습니다. 그 이름들은
**레포에도 git 이력에도 없습니다** — 손으로 만들어진 것입니다.
승격은 새 이름만 `drop if exists` 후 재생성하므로 **옛 것은 그대로 남습니다.**

**PostgreSQL 은 permissive 정책을 OR 로 결합합니다. 넓은 쪽이 이깁니다.**

가장 걱정되는 곳이 하나 있습니다. 새 `conversations_insert_own` 은 이렇게 좁힙니다:

```sql
with check (
  user_id = auth.uid()
  and (subject_id is null or exists (
        select 1 from public.consultation_subjects s
        where s.id = subject_id and s.user_id = auth.uid()))
)
```

옛 `insert own conversations` 가 `user_id = auth.uid()` 뿐이라면 **이 제한이 통째로 무효**가 되고,
남의 subject 를 자기 대화에 붙일 수 있게 됩니다.

⚠ **옛 정책의 실제 조건은 확인하지 못했습니다** — production 조회가 금지돼 있고, 정의가
레포에 없습니다. **확인 질의는 아래에 있고, 단계 ②-b 에서 돌립니다.**

```sql
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('consultation_drafts','consultation_subjects',
                    'conversations','conversation_messages')
order by tablename, policyname;
```

**확인 결과와 무관하게 지우는 것이 옳습니다.** 동사 커버리지를 대조했습니다 —
네 테이블 모두 **새 정책이 옛 정책의 동사를 전부 덮습니다**(drafts 는 delete 까지 더 많습니다).
지우면 좁아질 뿐 기능이 사라지지 않고, 좁아지는 그 지점이 위에서 걱정한 곳입니다.

→ `supabase/migrations/20260913000000_drop_legacy_policies.sql` 을 **만들어 두었습니다.**
   staging 에는 그 이름이 없어 `drop policy if exists` 가 아무 일도 하지 않습니다.
   ⚠ `conversation_messages` 의 두 이름은 **추정**입니다(사전점검 출력이 가운데를 줄였습니다).
   단계 ②-b 에서 정확한 이름을 확인하고 필요하면 그 두 줄을 고칩니다.

---

## 4. 승격 실행 순서

> ⚠ **production ref 는 오너가 직접 입력합니다.** 이 작업 폴더에는 production ref 를 거부하는
> 훅이 걸려 있어(`.claude/prod-ref-guard.mjs`) 개발이 대신 실행할 수 없습니다. 일부러 그렇습니다.
> 아래 `<PROD_REF>` 자리에 대시보드 URL 의 ref 를 넣으십시오.

### ① 사전점검 — ✅ **완료** (2026-09-05)

결과가 §1 입니다. 다시 하지 않아도 됩니다.

### ② 판독 — ✅ **이 문서가 판독입니다**

다만 **두 가지를 더 재야 합니다.** 둘 다 읽기만 합니다.

#### ②-a 손으로 만든 13개 테이블의 컬럼 (⚠ 필수)

사전점검 §8 은 9개 테이블만 봤습니다. §1-2 의 13개 중 절반은 **아직 안 재 봤습니다.**
Supabase 대시보드 → **production** → SQL Editor:

```sql
select table_name, string_agg(column_name, ',' order by ordinal_position) as columns
from information_schema.columns
where table_schema = 'public'
  and table_name in ('ad_tracking_events','admin_users','advertisements','ai_usage_logs',
                     'content_assets','content_items','content_publications','content_versions',
                     'famous_ai_suggestions','famous_profiles','famous_snapshots',
                     'provider_connections','user_acquisition_attribution')
group by table_name order by table_name;
```

#### ②-b 옛 정책의 실제 조건 (⚠ 필수)

§3-2 의 질의를 돌립니다. **출력을 그대로 보관하십시오** — 옛 정책을 지운 뒤
되돌려야 할 때 이것이 유일한 복구 자료입니다.

#### ②-c `conversations.title` 이 NOT NULL 인가

```sql
select column_name, is_nullable, column_default
from information_schema.columns
where table_schema='public' and table_name='conversations' and column_name='title';
```

`is_nullable = NO` 이고 default 가 없으면 **지금 production 에서 대화 생성이 전부 실패하고 있습니다**
(앱은 `title` 없이 insert 합니다 — §5). 그 경우 승격 전에 `drop not null` 이 필요합니다.

### ③ 백업 — 자동 백업이 있습니다. **하나 더 뜨십시오**

최신 자동 백업이 **2026-09-05 00:26** 입니다. 그 뒤로 시간이 흘렀으므로,
Database → Backups → **수동 백업 생성**을 한 번 더 하고 **Completed** 를 확인하십시오.

⚠ **PITR 이 없습니다.** 되돌린다는 것은 **백업 시점으로 통째로 되돌린다**는 뜻이고,
그 사이 데이터는 사라집니다. 잃을 데이터가 있는지 먼저 재십시오:

```sql
select 'profiles' t, count(*) from public.profiles
union all select 'conversations', count(*) from public.conversations
union all select 'conversation_messages', count(*) from public.conversation_messages
union all select 'consultation_subjects', count(*) from public.consultation_subjects
union all select 'consultation_reports', count(*) from public.consultation_reports
union all select 'ai_usage_logs', count(*) from public.ai_usage_logs
order by 1;
```

전부 0에 가까우면 Restore 의 비용이 사실상 없습니다. 그 사실을 알고 시작하는 것과
모르고 시작하는 것은 다릅니다.

### ④ ⚠ 컬럼 보정 — **승격 앞에 반드시**

SQL Editor 에서 `docs/PRODUCTION_COLUMN_RECONCILE.sql` **전체**를 실행합니다.

- 13개 테이블 · 151개 컬럼에 `add column if not exists` 를 겁니다. 있으면 no-op 입니다.
- `primary key`·`unique`·`references` 는 뺐고, default 없는 `not null` 도 뺐습니다 —
  **실패할 수 있는 구문이 하나도 없습니다.**
- 파일 맨 아래 검증 질의가 **여전히 없는 컬럼**을 찍습니다. **비어 있어야** 다음으로 갑니다.
- 비어 있지 않다면 그 테이블은 이름만 같고 모양이 다른 것입니다. 멈추고 알려 주십시오.

### ⑤ 별도 폴더 — ⚠ **clone 이 아니라 복사입니다**

⚠⚠ **`git clone` 을 쓰면 안 됩니다.** 승격에 필요한 것의 상당수가 **아직 커밋되지 않았습니다**:

| | HEAD | 작업트리 |
|---|---:|---:|
| 마이그레이션 | **41** | **59** |

미커밋 18개는 전부 `20260902000000` 이후 — `ai_usage_logs` 스키마 · 관리자 · 유명인/콘텐츠 ·
광고 · 문의 · **H5 잠금(20260912)** · **옛 정책 제거(20260913)** 가 전부 여기 들어 있습니다.
Edge 도 `account-delete` · `famous-compose` · `site-deploy` 세 개가 미커밋이고
`config.toml` 과 `chat` 도 수정분이 안 올라가 있습니다.

**clone 하면 38개가 아니라 20개만 밀립니다.** 단계 ⑥ 의 dry-run 이 이것을 잡아 주지만,
애초에 복사로 시작하는 편이 맞습니다.

`supabase db push` 가 읽는 것은 `supabase/config.toml` 과 `supabase/migrations/` 뿐이고,
`supabase/` 전체가 **2.4MB** 입니다. 그것만 복사합니다 — 다른 것이 없으니 실수로 배포될 것도 없습니다.

정확한 명령은 아래 §8 에 있습니다.

### ⑥ dry-run — 무엇이 실행될지 먼저 봅니다

```bash
npx supabase db push --dry-run
```

**37 + 1 = 38개**가 나열되어야 합니다(`20260913000000` 포함).
21개 이하가 나오면 링크가 잘못된 것입니다. 멈추십시오.

### ⑦ 적용 — **유일한 쓰기 단계**

```bash
npx supabase db push
```

끝나면 바로:

```sql
-- H5 창 확인 (§3-1). 0 이어야 합니다.
select count(*) as forged_rows from public.global_reservation_requests;
-- 0 이 아니면:  delete from public.global_reservation_requests;
```

### ⑧ 사후 검증

`docs/PRODUCTION_PROMOTION_PREFLIGHT.sql` 을 **다시** 실행합니다.
기대값은 `docs/PRODUCTION_PROMOTION_EXPECTED.md` 에 있습니다.

| 행 | 기대 |
|---|---|
| `3_tables` 없는 것 | **(없음)** |
| `4_functions` 없는 것 | **(없음)** |
| `4_functions` 과적재 | **(없음)** |
| `5_policies` | 기대 목록과 일치 + **옛 이름 12개가 사라졌을 것** |
| `6_rls` | **(없음 — 전부 켜져 있음)** |
| `7_triggers` | 39개 |
| `8_columns` | 승격 전과 같거나 **늘어난 것만** |

### ⑨ Edge 배포 — **스키마 다음입니다. 순서가 중요합니다**

⚠ **스키마 없이 Edge 를 먼저 배포하면 안 됩니다.** 아래 함수들이 지금 production 에 없는
테이블·RPC 를 부릅니다 — 배포는 되지만 **호출마다 실패**하고, 그 실패가 사용자에게 갑니다.

먼저 지금 무엇이 배포돼 있는지 보십시오:

```bash
npx supabase functions list --project-ref <PROD_REF>
```

레포에는 **18개**가 있습니다. 순서는 이렇게 잡습니다.

**1차 — 스키마 의존이 큰 것 (⑦ 성공 확인 후)**

| 함수 | 무엇을 필요로 하나 | 없으면 |
|---|---|---|
| `chat` | 덕 원장·전역 가드·세션 RPC 전부 | 상담 전체 |
| `account-delete` | `purge_account_data` | 탈퇴 불가 |
| `verify-purchase` | `record_verified_purchase` | 결제 검증 불가 |
| `famous-compose` · `famous-suggest` · `content-generate` | `famous_*` · `content_*` · `admin_users` | 관리자 콘텐츠 |
| `site-deploy` | `site_deploy_requests` | 발행 시 재배포 안 됨 |

**2차 — 공개 진입점 (`verify_jwt = false`)**

`ad-track` · `naver-auth` · `apple-notifications-v2` · `google-rtdn` ·
`run-scheduled-notifications` · `run-email-campaigns` ·
`retry-notification-deliveries` · `retry-email-deliveries`

⚠ `ad-track` 은 **JWT 없이 누구나 부를 수 있습니다.** 스키마가 준비된 뒤에 올리십시오.
이것이 없으면 **광고 퍼널이 통째로 0** 입니다 — 세 전환 트리거가 전부
`user_acquisition_attribution.signup_at` 을 조건으로 걸기 때문입니다.

**3차 — 나머지**

`media-generate` · `video-generate` · `video-status`

```bash
npx supabase functions deploy <name> --project-ref <PROD_REF>
```

**배포 전에 시크릿을 먼저 넣으십시오** — `OPENAI_API_KEY` · `VERCEL_DEPLOY_HOOK_URL` ·
`NAVER_CLIENT_ID` · `NAVER_CLIENT_SECRET`. 없으면 각 기능이 fail-closed 됩니다.

⚠ `GLOBAL_REQ_IDEMPOTENCY_ENABLED` 는 **⑦ 의 0행 확인을 마친 뒤에** 켜십시오(§3-1).

---

## 5. `conversations.title` — **남깁니다**

production 에만 있고 레포 어디에도 없는 컬럼입니다.
`ai_usage_logs`·`content_items` 와 같은 계열 — 초기 손 작업의 흔적으로 보입니다.

- **앱은 이 컬럼을 읽지도 쓰지도 않습니다.** `conversations` 에 대한 접근은
  `from('conversations').select('id')` 하나뿐이고, insert 페이로드는
  `subject_id`·`subject_snapshot`·`consultation_mode`·`compatibility_meta` 입니다
  (`conversationService.ts:83`). `title` 을 다루는 코드는 **`consultation_reports`** 쪽이지
  `conversations` 가 아닙니다.
- **승격은 이 컬럼을 건드리지 않습니다.** 미적용 37개 중 `conversations.title` 을 참조하는
  구문이 없습니다.
- **지우는 것은 파괴적이고, 얻는 것이 없습니다.** 남깁니다.

⚠ 단 하나 확인할 것: **NOT NULL 인지**(단계 ②-c). NOT NULL 이고 default 가 없다면
앱의 insert 가 지금도 실패하고 있는 것이므로, 그때는 `alter table public.conversations
alter column title drop not null;` 이 필요합니다.

---

## 6. 실패했을 때

### 6-1. 특정 마이그레이션에서 멈추면

`db push` 는 **파일 단위 트랜잭션**입니다. 실패한 파일은 통째로 롤백되고,
**그 앞의 파일들은 이미 커밋돼 있습니다.** 즉 부분 적용 상태로 멈춥니다.

1. **되돌리지 마십시오.** 적용된 것은 전부 가산적이라 데이터가 사라지지 않았습니다.
2. 오류 메시지와 **멈춘 version 번호**를 그대로 전달하십시오.
3. 가장 가능성 높은 원인은 §1-2 입니다 — 손으로 만든 테이블에 컬럼이 없어서
   인덱스나 함수가 실패. 단계 ④ 를 제대로 돌렸다면 이 계열은 거의 막힙니다.
4. 고친 뒤 `db push` 를 **다시** 돌리면 됩니다. 이미 커밋된 것은 건너뜁니다.

### 6-2. Restore 를 쓰는 기준 — **거의 안 씁니다**

Restore 는 **2026-09-05 00:26 시점으로 통째로 되돌립니다.** PITR 이 없어 중간 지점이 없고,
그 사이 데이터는 사라집니다.

**Restore 를 쓰는 경우는 하나뿐입니다** — 데이터가 실제로 손상됐을 때
(행이 지워졌거나 값이 뭉개졌을 때). 이번 37개에는 `drop table`·`truncate`·`drop column` 이
**0건**이므로 그런 일이 일어날 경로가 없습니다.

**스키마가 어중간하게 걸린 것은 Restore 대상이 아닙니다.** 앞으로 고치는 것이 맞습니다.
단계 ③ 의 행 수 세기를 먼저 하는 이유가 이것입니다 — 잃을 것이 없다는 사실을
**미리 알고** 있으면, 급할 때 잘못된 Restore 를 누르지 않습니다.

---

## 7. 재발 방지 — 진단에 **환경을 함께 찍습니다**

이번 사고의 원인은 결과에 출처가 없었다는 것입니다. 표만 보면 어느 프로젝트인지 알 수 없었고,
받은 쪽은 production 이라고 가정했습니다.

`docs/PRODUCTION_PROMOTION_PREFLIGHT.sql` 과 `docs/PRODUCTION_COLUMN_RECONCILE.sql` 의
**맨 앞에 환경 표기 행**을 넣었습니다. 결과 표의 첫 줄이 언제나 이렇게 나옵니다:

```sql
select current_database() as db,
       inet_server_addr()::text as host,
       '⚠ 이 결과가 production 인지 확인하십시오' as check_first;
```

⚠ `current_database()` 는 두 환경 다 `postgres` 라 그것만으로는 못 가릅니다.
**`inet_server_addr()` 가 실질적인 구분자**입니다. 그리고 사람이 붙여 넣을 때
**대시보드 URL 의 ref 를 결과 위에 한 줄 적는 것**이 가장 확실합니다.
§4 의 각 질의 앞에 "**production** 프로젝트" 를 굵게 적어 둔 이유이기도 합니다.

> 규칙: **측정 결과를 전달할 때는 무엇을 쟀는지와 함께 어디서 쟀는지를 적는다.**
> 출처 없는 표는 사실이 아니라 소문이다.

---

## 8. 붙여넣는 명령 (⑤~⑦)

> `<PROD_REF>` 자리에 대시보드 URL 의 ref 를 넣으십시오.
> 이 폴더에는 production ref 를 거부하는 훅이 있어 **개발이 대신 실행할 수 없습니다.**

### ⑤-1. 복사 — ⚠ clone 이 아닙니다

`supabase db push` 가 읽는 것은 `supabase/config.toml` 과 `supabase/migrations/` 뿐입니다.
`supabase/` 전체가 2.4MB 이므로 그것만 복사합니다. **다른 것이 없으니 실수로 배포될 것도 없습니다.**

**PowerShell**

```powershell
$src = "C:\Development\DeokbunAI-app\supabase"
$dst = "C:\Development\deokbun-promote\supabase"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
robocopy $src $dst /E /XD .temp /NFL /NDL /NJH /NJS
```

⚠ robocopy 는 **성공해도 종료코드 1** 을 냅니다. 정상입니다.
⚠ `/XD .temp` 로 링크 상태 파일을 뺐습니다 — 그것을 가져오면 **staging 에 연결된 채로 시작**합니다.

**Git Bash 를 쓰신다면**

```bash
mkdir -p /c/Development/deokbun-promote
cp -r /c/Development/DeokbunAI-app/supabase /c/Development/deokbun-promote/
rm -rf /c/Development/deokbun-promote/supabase/.temp
```

### ⑤-2. 복사가 제대로 됐는지 — **밀기 전에 반드시**

```powershell
cd C:\Development\deokbun-promote
(Get-ChildItem supabase\migrations\*.sql).Count
Test-Path supabase\.temp\project-ref
```

- 첫 줄이 **59** 여야 합니다. 41 이면 clone 을 한 것이니 다시 복사하십시오.
- 둘째 줄이 **False** 여야 합니다.

### ⑤-3. 링크

```bash
cd C:\Development\deokbun-promote
npx --yes supabase@latest link --project-ref <PROD_REF>
```

DB 비밀번호를 묻습니다(대시보드 → Settings → Database).

### ⑥. dry-run — 무엇이 실행될지 먼저

```bash
npx --yes supabase@latest db push --dry-run
```

**38개**가 나열되어야 합니다(`20260828000000` ~ `20260913000000`).

| 나온 개수 | 뜻 |
|---|---|
| **38** | 정상. ⑦ 로 갑니다 |
| 20 | 복사가 아니라 clone 을 했습니다. ⑤-1 부터 다시 |
| 0 | 이미 최신이거나 **staging 에 링크**됐습니다. ⑤-3 을 다시 |
| 그 외 | 멈추고 목록을 그대로 전달해 주십시오 |

### ⑦. 적용

```bash
npx --yes supabase@latest db push
```

끝나면 SQL Editor 에서 곧바로:

```sql
select count(*) as forged_rows from public.global_reservation_requests;
```

**0 이어야 합니다.** 0이 아니면 `delete from public.global_reservation_requests;` (§3-1).

### ⑨. Edge 배포도 같은 폴더에서

`supabase/functions/` 를 함께 복사했으므로 그대로 씁니다.

```bash
cd C:\Development\deokbun-promote
npx --yes supabase@latest functions deploy <name> --project-ref <PROD_REF>
```

순서는 §4-⑨ 를 따르십시오. **시크릿을 먼저 넣으십시오.**

### 끝나면

```powershell
Remove-Item -Recurse -Force C:\Development\deokbun-promote
```

⚠ 이 폴더는 production 에 링크된 상태로 남습니다. 승격이 끝나면 지우는 편이 안전합니다.

---

## 9. ⚠ 승격 후 — "밀었다" 와 "돈다" 는 다릅니다

### 9-1. 옛 정책이 정말 지워졌는가 — **10/12 만 지워졌습니다**

`20260913000000` 이 `conversation_messages` 의 둘을 **못 지웠습니다.** 이름을 틀렸습니다:

| 적은 것 | 실제 |
|---|---|
| `insert messages **in** own conversation` | `insert messages **into** own conversation` |
| `select messages **in** own conversation` | `select messages **of** own conversation` |

사전점검 출력이 이 둘만 `insert/select messages ... own conversation` 으로 **가운데를 줄여서**
보고했고, 그 파일 70행에 "추정입니다 · 틀려도 오류는 안 나고 안 지워집니다" 라고 적어 두었습니다.
**경고한 그대로 됐습니다.**

> ⚠ **`drop ... if exists` 는 이름이 틀려도 조용히 성공합니다.**
> 이런 문장은 **실행 성공이 아니라 결과로** 확인해야 합니다.

→ `20260914000000_drop_legacy_message_policies.sql` 을 만들어 두었습니다(**미적용**).

### 9-2. 같은 실수가 다른 데도 있는가 — 전수 질의

레포가 만드는 public 정책 **57개**와 production 의 실제를 대조합니다.
**결과가 비어 있어야** 합니다.

```sql
-- ⚠ 승격 후 전수 확인 — 레포에 없는 정책이 production 에 남아 있는가
-- drop policy if exists 는 이름이 틀려도 조용히 성공합니다. 결과로 확인해야 합니다.
with expected(tbl, pol) as (values
  ('admin_users','admin_users self read'),
  ('advertisements','advertisements_admin_all'),
  ('candle_state','candle_state_select_own'),
  ('consultation_decisions','consultation_decisions_select_own'),
  ('consultation_drafts','drafts_delete_own'),
  ('consultation_drafts','drafts_insert_own'),
  ('consultation_drafts','drafts_select_own'),
  ('consultation_drafts','drafts_update_own'),
  ('consultation_feedback','consultation_feedback_insert_own'),
  ('consultation_feedback','consultation_feedback_select_own'),
  ('consultation_feedback','consultation_feedback_update_own'),
  ('consultation_reports','reports_all_own'),
  ('consultation_sessions','consultation_sessions_select_own'),
  ('consultation_subjects','subjects_all_own'),
  ('consumer_birth_profiles','consumer_birth_profiles_delete_own'),
  ('consumer_birth_profiles','consumer_birth_profiles_insert_own'),
  ('consumer_birth_profiles','consumer_birth_profiles_select_own'),
  ('consumer_birth_profiles','consumer_birth_profiles_update_own'),
  ('content_assets','content_assets admin all'),
  ('content_items','content_items admin all'),
  ('content_publications','content_publications admin all'),
  ('content_versions','content_versions admin all'),
  ('conversation_messages','messages_insert_via_conversation'),
  ('conversation_messages','messages_select_via_conversation'),
  ('conversations','conversations_insert_own'),
  ('conversations','conversations_select_own'),
  ('conversations','conversations_update_own'),
  ('daily_fortunes','daily_fortunes_select_own'),
  ('duk_debt','duk_debt_select_own'),
  ('duk_ledger','duk_ledger_select_own'),
  ('duk_reserve','duk_reserve_select_own'),
  ('economy_policy','economy_policy_read_active'),
  ('event_campaigns','event_campaigns_read_active'),
  ('event_claims','event_claims_select_own'),
  ('famous_ai_suggestions','famous_ai_suggestions admin all'),
  ('famous_profiles','famous_profiles admin all'),
  ('famous_snapshots','famous_snapshots admin all'),
  ('in_app_notifications','in_app_notifications_all_own'),
  ('life_events','life_events_all_own'),
  ('monthly_fortunes','monthly_fortunes_select_own'),
  ('notification_preferences','notification_preferences_all_own'),
  ('plus_entitlements','plus_entitlements_select_own'),
  ('popular_consultation_questions','popular_questions_admin_all'),
  ('popular_consultation_questions','popular_questions_read_active'),
  ('product_catalog','product_catalog_read_active'),
  ('profiles','profiles_insert_own'),
  ('profiles','profiles_select_own'),
  ('profiles','profiles_update_own'),
  ('provider_connections','provider_connections admin all'),
  ('purchase_revocations','purchase_revocations_select_own'),
  ('push_devices','push_devices_all_own'),
  ('report_shares','report_shares_owner_all'),
  ('site_deploy_requests','site_deploy_requests admin read'),
  ('support_inquiries','support_inquiries_insert_own'),
  ('support_inquiries','support_inquiries_select_own'),
  ('user_acquisition_attribution','attribution_select_own'),
  ('verified_purchases','verified_purchases_select_own')
)
select p.tablename, p.policyname, p.cmd, '⚠ 레포에 없는 정책' as state
from pg_policies p
where p.schemaname = 'public'
  and not exists (select 1 from expected e where e.tbl = p.tablename and e.pol = p.policyname)
order by p.tablename, p.policyname;
```

### 9-3. Edge 가 살아 있는가 — **부작용 없는 프로브**

| 종류 | 프로브 | 정상 응답 |
|---|---|---|
| `verify_jwt = true` 10개 | Authorization 없이 POST | **401** (게이트웨이가 막음, 본문 미실행) |
| `ad-track` · `naver-auth` | `OPTIONS` (CORS preflight) | **200/204** |
| `apple-notifications-v2` · `google-rtdn` | 빈 본문 POST | **400 INVALID_INPUT** (검증 전에 거절) |
| `run-*` · `retry-*` 4개 | `x-cron-secret` 없이 POST | **401** (fail-closed) |

**404 면 미배포**입니다. 어느 경우에도 쓰기가 일어나지 않습니다.

#### ✅ 2026-09-06 실측 — `.runtime/prod_edge_probe.mjs` (쓰기 0 · 인증 0)

**18개 전수: 배포 확인 13 · 404 5 · 예상 밖 0.** 오너가 본 "13 ACTIVE" 와 일치합니다.

| 배포 확인 (13) | 미배포 (5) |
|---|---|
| `chat` · `account-delete` · `famous-compose` · `famous-suggest` · `content-generate` · `site-deploy` · `media-generate` (401) | `verify-purchase` |
| `ad-track` · `naver-auth` (OPTIONS 200) | `video-generate` · `video-status` |
| `run-scheduled-notifications` · `run-email-campaigns` · `retry-notification-deliveries` · `retry-email-deliveries` (401) | `apple-notifications-v2` · `google-rtdn` |

**미배포 5개가 §10 의 예측과 정확히 같습니다** — 전부 IAP·미디어 시크릿 대기입니다.

⚠ `media-generate` 는 **배포돼 있는데 `IMAGE_*` 시크릿이 없습니다.** 호출하면 실패합니다.
§10 표에서 미배포로 적었던 것을 정정합니다 — 올라는 가 있고, 시크릿만 없습니다.

#### ✅ CRON_SECRET fail-closed — **4/4 401**

`run-*` · `retry-*` 넷 모두 `x-cron-secret` 없이 부르면 401 입니다.
시크릿 없이 호출되는 경로가 없습니다.

### 9-4. 덕 경제 RPC — `duk_bucket_matrix.mjs` 는 **돌리지 않습니다**

그 스크립트는 실계정을 만들고 원장에 쓰고 지웁니다. 원장 FK 가 `on delete cascade` 라
정리는 되지만, **돌릴 값어치가 없습니다:**

`duk_ledger` · `duk_reserve` · `duk_debt` · `economy_policy` 는 승격 전 production 에
**없던 24개** 안에 있었습니다. 즉 이번 push 가 **새로 만들었고**, staging 과 **바이트 단위로 같은 DDL**
입니다. staging 에서 그 매트릭스가 통과했습니다.
production 이 staging과 다른 지점은 **손으로 만든 13개 테이블**인데, 덕 테이블은 거기 없습니다.

→ **읽기 전용 확인으로 충분합니다**(§9-5의 RPC 존재 확인). 실계정을 live 과금 DB에 만들 이유가 없습니다.

### 9-5. 상담 1회 — **이건 할 값어치가 있습니다**

Edge 가 배포됐다는 것과 상담이 된다는 것은 다릅니다. 한 번은 실제로 돌려 봐야 합니다.

- **비용**: LLM 1콜 ≈ 1만 토큰 · 덕 12 안팎
- **남는 것**: `conversations` · `conversation_messages` · `consultation_subjects` ·
  `duk_ledger` · `duk_reserve` — **전부 계정 삭제 시 cascade**
- ⚠ **`ai_usage_logs` 만 남습니다** — `user_id` 에 FK 가 없습니다(손으로 만든 테이블).
  비용 기록이라 남는 편이 맞습니다. 1행입니다.

### 9-6. 유명인 발행 → Vercel — ⚠ **가상 인물로만**

`VERCEL_DEPLOY_HOOK_URL` 이 실제로 먹는지는 **한 번 트리거해 봐야** 압니다.
Vercel 빌드가 실제로 돕니다(2~3분). 그래도 됩니다 — 사이트는 이미 배포돼 있고 빌드는 멱등입니다.

⚠⚠ **실존 인물로 하지 마십시오.** `OWNER_TODO` Z11(법률 검토)이 아직 미완입니다.
발행하는 순간 실명 공개 페이지가 생깁니다. **가상 명식으로 시험하고, 확인 후 비공개로 되돌리십시오.**

---

## 10. 남은 Edge 5개 — 전부 **시크릿이 선행 조건**입니다

현재 시크릿: `OPENAI_API_KEY` · `NAVER_CLIENT_ID/SECRET` · `VERCEL_DEPLOY_HOOK_URL` · `CRON_SECRET`

| 함수 | 없어서 못 올리는 것 |
|---|---|
| `apple-notifications-v2` | `APPLE_IAP_BUNDLE_ID` · `APPLE_IAP_ISSUER_ID` · `APPLE_IAP_KEY_ID` · `APPLE_IAP_PRIVATE_KEY` |
| `google-rtdn` | `GOOGLE_PLAY_PACKAGE_NAME` · `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` |
| `verify-purchase` | 위 6개 전부 |
| `media-generate` | `IMAGE_STANDARD_PROVIDER/MODEL/QUALITY` · `IMAGE_PREMIUM_*` |
| `video-generate` · `video-status` | `GEMINI_API_KEY`(또는 `GOOGLE_API_KEY`) · `VIDEO_STANDARD_*` · `VIDEO_PREMIUM_*` |

⚠ **먼저 올리고 나중에 시크릿을 넣는 순서는 안 됩니다.** 시크릿 없이 배포하면 호출마다 실패하고,
`verify-purchase`·`apple-notifications-v2`·`google-rtdn` 은 **결제 경로**라 그 실패가 매출에 닿습니다.
IAP 개통(`OWNER_TODO` B1)이 선행입니다.
