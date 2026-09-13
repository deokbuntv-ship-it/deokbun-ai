# M4 점검 — 손으로 만든 13개 표 (2026-09-12, 조사·제안만)

> ⚠ **마이그레이션은 만들지 않았습니다**(지시서 PART 7). 조사 결과와 제안만 있습니다.
>
> 대상 13개: `admin_users` · `advertisements` · `ad_tracking_events` · `user_acquisition_attribution` ·
> `content_items` · `content_versions` · `content_publications` · `content_assets` · `famous_profiles` ·
> `famous_snapshots` · `famous_ai_suggestions` · `provider_connections` · `ai_usage_logs`
> (근거: `docs/KNOWN_RISKS.md` M4)

---

## 1. 한 줄

**M4 의 위험은 처음 적었던 것보다 좁다.** 인덱스·트리거·정책은 **별도 문장**이라 production 에도
적용됐다. 남은 것은 **`create table` 안에 인라인으로 선언된 제약**뿐이고, 그중 출시 전에 확인해야
하는 것은 **계정 삭제가 기대는 외래키 두 개**다.

---

## 2. 왜 좁아졌나

`create table if not exists` 는 이미 있는 표를 **건드리지 않는다.** 그래서 손으로 만든 표에서는
그 문장 **안에** 들어 있던 것(칸 · 인라인 CHECK · UNIQUE · FK)이 적용되지 않았을 수 있다.

그러나 **별도 문장**은 다르다:

| 종류 | 문장 | 손으로 만든 표에서 |
|---|---|---|
| 인덱스 | `create index if not exists …` | **적용됨** (같은 이름이 없으면 만든다) |
| 트리거 | `drop trigger if exists` → `create trigger` | **적용됨** |
| 정책 | `drop policy if exists` → `create policy` | **적용됨** |
| 칸 | `create table` 안 | ⚠ **적용 안 됐을 수 있음** → `docs/PRODUCTION_COLUMN_RECONCILE.sql` 이 보정 |
| 인라인 제약 | `create table` 안 | ⚠ **적용 안 됐을 수 있음** ← 여기가 남은 위험 |

그리고 production 이력 **59건이 끝까지 적용됐다**(오너 스냅샷). 칸이 빠져 있었다면 뒤따르는 인덱스·
트리거 문장이 그 칸을 참조하다 push 가 **멈췄을** 것이다. 끝까지 갔다는 것은 칸 보정이 됐다는 뜻이다.

---

## 3. 실측 비교

### 3-1. 인덱스 `[staging]` — **차이 0**

`npx supabase inspect db index-stats --linked` 로 실제 인덱스를 읽어 레포 선언과 대조했다
(자동 생성되는 `_pkey` · `_key` 는 제외).

| 표 | 레포 선언 | staging 실제 | 누락 | 레포 밖 |
|---|---|---|---|---|
| ad_tracking_events | 3 | 4 | 0 | 0 |
| content_items | 6 | 7 | 0 | 0 |
| content_publications | 4 | 5 | 0 | 0 |
| content_assets | 2 | 3 | 0 | 0 |
| famous_profiles | 3 | 5 | 0 | 0 |
| ai_usage_logs | 3 | 4 | 0 | 0 |
| 그 밖 7개 | 0~1 | 1~2 | 0 | 0 |

**13개 표 전부 누락 0 · 레포 밖 인덱스 0.**

### 3-2. 정책 `[production · 오너 제공 스냅샷]` — **차이 0**

| 표 | production 정책 | 레포와 |
|---|---|---|
| admin_users | `admin_users self read` (SELECT, `auth.uid() = user_id`) | 일치 |
| user_acquisition_attribution | `attribution_select_own` (SELECT, 본인 또는 관리자) | 일치 |
| 콘텐츠·유명인·광고·연동 9개 | `… admin all` (ALL, `is_admin()`) | 일치 |
| ad_tracking_events · ai_usage_logs | **정책 없음** (RLS 켜짐 → 클라이언트 전면 차단, 서비스롤만) | 일치 |

이름뿐 아니라 **조건식도** 스냅샷에서 읽어 확인했다. 느슨한 옛 정책은 없다.

### 3-3. 트리거 — **레포 선언 14개. production 실제는 미확인**

| 표 | 트리거 | 빠지면 무엇이 조용히 멈추나 |
|---|---|---|
| famous_profiles | `famous_profiles_z_staleness_trg` | 출생정보를 고쳐도 명식이 **낡음 표시가 안 된다** |
| ai_usage_logs | `trg_ad_on_chat_success` | 광고 전환 집계가 멈춘다 |
| user_acquisition_attribution | `trg_ad_reconcile_attribution` | 유입 귀속이 멈춘다 |
| 콘텐츠·유명인·광고·연동 | `*_touch_trg` 10개 | `updated_at` 이 안 바뀐다 |

별도 문장이라 적용됐을 것이지만, **스냅샷에 트리거 칸이 없어 확인하지 못했다.** 아래 §5 조회 1회로 끝난다.

### 3-4. 인라인 제약 — **production 에 없을 수 있는 유일한 부류**

레포 `create table` 안에 선언된 것:

| 종류 | 수 |
|---|---|
| CHECK | **5** (전부 `advertisements` — 예: `cost_krw is null or cost_krw >= 0`) |
| UNIQUE | **3** (`advertisements.public_tracking_code` · `famous_profiles.slug` · `provider_connections.channel`) |
| 외래키 | **20** (그중 `on delete cascade` 15) |

---

## 4. 출시 전 필요 / 나중에 해도 됨

### 🔴 출시 전 필요 — **계정 삭제가 기대는 외래키 2개**

`purge_account_data`(20260903000000)는 예약 표 둘만 직접 지우고, **나머지는 auth 삭제의 CASCADE 에
기댄다.** 그런데 아래 두 표는 **손으로 만든 표**다:

| 표 | 레포 선언 | production 에 CASCADE 가 없으면 |
|---|---|---|
| `ad_tracking_events.user_id` | `references auth.users(id) on delete cascade` | FK 가 있으면 **탈퇴가 실패**하고, FK 가 없으면 **개인 행이 남는다** |
| `user_acquisition_attribution.user_id` | `references auth.users(id) on delete cascade` | 같음 |

**둘 다 구글·애플의 계정 삭제 요건을 직접 깨는 결과다.** 계정 삭제 e2e(15/15)는 **staging 에서만**
돌았다. production 은 한 번도 재 본 적이 없다.

→ **§5 조회를 production 에서 한 번 돌려 CASCADE 를 확인할 것.** 없으면 CTO 판정 후 보정 마이그레이션.

### 🟠 출시 전 권장 — UNIQUE 3개

| 제약 | 없으면 |
|---|---|
| `famous_profiles.slug` | 같은 슬러그 두 개 → 정적 페이지가 하나를 덮는다 · 검색 색인 충돌 |
| `advertisements.public_tracking_code` | 같은 추적 코드 두 개 → 광고 귀속이 섞인다 |
| `provider_connections.channel` | 같은 채널 연동 두 개 → 어느 쪽이 쓰이는지 불명 |

### 🟢 나중에 해도 됨

| 항목 | 이유 |
|---|---|
| CHECK 5개 (`advertisements`) | 관리자만 쓰는 표. 음수 비용 같은 잘못된 입력은 관리자 실수 수준 |
| `created_by uuid references auth.users (id)` — **CASCADE·SET NULL 없음** 8곳 | ⚠ **레포 선언 자체의 문제**다(production 차이가 아니다). 콘텐츠를 만든 **관리자 계정을 지우려 하면 FK 가 막는다.** 소비자 계정과는 무관. 관리자 탈퇴는 드물다 |
| `docs/admin/ADMIN_04_SETUP.sql` 을 재현 가능한 마이그레이션으로 | 새 환경을 마이그레이션만으로 만들 수 있게. 부채 청산이지 출시 조건은 아니다 |

---

## 5. production 확인 조회 (읽기 전용 — 오너가 SQL Editor 에서)

```sql
-- 5-1. ⚠ 출시 전 필요 — 계정 삭제가 기대는 외래키
select tc.table_name, kcu.column_name, rc.delete_rule, ccu.table_schema || '.' || ccu.table_name as refers_to
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name
  join information_schema.referential_constraints rc on rc.constraint_name = tc.constraint_name
  join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name
 where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
   and tc.table_name in ('ad_tracking_events','user_acquisition_attribution','admin_users')
 order by tc.table_name;
```

**기대**: 세 표의 `user_id` 가 전부 `delete_rule = CASCADE` · `refers_to = auth.users`.
**하나라도 아니면 CTO 에게 보내십시오** — 그 상태에서 해당 표에 행이 있는 사용자는 탈퇴가 실패합니다.

```sql
-- 5-2. UNIQUE 3개
select tc.table_name, kcu.column_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name
 where tc.constraint_type = 'UNIQUE' and tc.table_schema = 'public'
   and (tc.table_name, kcu.column_name) in
       (('famous_profiles','slug'), ('advertisements','public_tracking_code'), ('provider_connections','channel'));
```

**기대**: 3행.

```sql
-- 5-3. 트리거 14개
select event_object_table, trigger_name from information_schema.triggers
 where event_object_schema = 'public'
   and event_object_table in ('advertisements','user_acquisition_attribution','content_items',
       'content_publications','content_assets','famous_profiles','provider_connections','ai_usage_logs')
 order by 1, 2;
```

**기대**: 레포 선언과 같은 이름들 (§3-3 표).

⚠ 이 조회들은 production 을 **읽기만** 합니다. 이번 지시서가 production 접속을 금지해서 제가 돌리지
못했습니다. 결과는 스냅샷 파일처럼 `C:\Development\owner_inputs\` 에 두시면 다음 묶음이 판정합니다.
