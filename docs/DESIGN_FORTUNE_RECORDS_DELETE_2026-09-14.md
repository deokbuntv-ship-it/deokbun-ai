# 설계 ① — 설정에서 운세 기록 전체 삭제 (2026-09-14 · 구현 금지 · production 세션 뒤 다음 패키지)

> 왜: 처리방침 §5 는 "이용자가 삭제를 요청하면 지체 없이 파기" 라고 적는데, 오늘의 운세 · 이번 달 운세는 **탈퇴하지 않고는
> 지울 방법이 없다**(`docs/DATA_SAFETY_DRAFT_2026-09-12.md` §4-3 `[법률 검토]` · 보고서 2026-09-14 C2). 이 설계가 그 틈을 닫는다.

## 1. 지금 상태 (레포 근거)

| 무엇 | 사실 | 근거 |
|---|---|---|
| 운세 표 | `daily_fortunes` · `monthly_fortunes` — `user_id → auth.users` **CASCADE**, `subject_id → consultation_subjects` SET NULL | `20260821000000` · `20260822000000` |
| 쓰기 권한 | 이용자는 **읽기만**(`*_select_own`). 쓰기는 서버만 — 2026-08-27 에 `for all` 정책을 지웠다 | `20260827000000_fortune_generation_claims.sql` |
| 한 기간 한 번 생성 | 고유 키 (user, 기간, subject, tier, semantic_version) = LLM 한 번. 다시 열면 캐시 | 같은 파일 |
| 생성 임대 | `fortune_generation_leases` — service_role 만, 이용자 · 대상 CASCADE | 같은 파일 |
| 메일 | `email_deliveries.monthly_fortune_id`(외래키 없음). ⚠ 재시도 작업(`retry-email-deliveries`)은 운세를 못 찾으면 **빈 내용으로 그대로 보낸다** — `SKIPPED_NO_FORTUNE` 상태는 표에 있지만 이 작업은 쓰지 않는다 | `20260841000000_monthly_email_ops.sql` · `retry-email-deliveries/index.ts` |
| 알림 | `in_app_notifications` 분류 `monthly_fortune`(제목 · 본문 글) | `20260823000000_retention_foundation.sql` |
| 탈퇴 | 위 전부 CASCADE 로 사라진다 | `20260903000000_account_deletion.sql` |

## 2. 설계

### 2-1 서버 함수 — 표에 삭제 정책을 **열지 않는다**

```sql
-- 새 마이그레이션 (번호는 구현 때 scripts/next-migration-name.mjs 로)
create table if not exists public.fortune_record_deletions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_deleted_at timestamptz not null
);
alter table public.fortune_record_deletions enable row level security;
revoke all on table public.fortune_record_deletions from public, anon, authenticated;

create or replace function public.delete_my_fortune_records()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid := auth.uid(); v_daily int; v_monthly int; v_notes int; v_last timestamptz;
begin
  if v_uid is null then return jsonb_build_object('status', 'unauthenticated'); end if;
  select last_deleted_at into v_last from public.fortune_record_deletions where user_id = v_uid for update;
  if v_last is not null and v_last > now() - interval '24 hours' then
    return jsonb_build_object('status', 'rate_limited', 'retryAfter', v_last + interval '24 hours');
  end if;
  delete from public.daily_fortunes   where user_id = v_uid; get diagnostics v_daily = row_count;
  delete from public.monthly_fortunes where user_id = v_uid; get diagnostics v_monthly = row_count;
  delete from public.fortune_generation_leases where user_id = v_uid;
  delete from public.in_app_notifications where user_id = v_uid and category = 'monthly_fortune';
  get diagnostics v_notes = row_count;
  -- 대기 중인 이번 달 메일은 취소 — 재시도 작업이 운세 없이 빈 메일을 보내지 않게
  update public.email_deliveries set status = 'CANCELLED'
   where user_id = v_uid and status = 'PENDING' and monthly_fortune_id is not null;
  insert into public.fortune_record_deletions (user_id, last_deleted_at) values (v_uid, now())
    on conflict (user_id) do update set last_deleted_at = excluded.last_deleted_at;
  return jsonb_build_object('status', 'ok', 'daily', v_daily, 'monthly', v_monthly, 'notifications', v_notes);
end $$;
revoke all on function public.delete_my_fortune_records() from public, anon;
grant execute on function public.delete_my_fortune_records() to authenticated;
```

- **남의 기록을 지울 수 없다**: 인자로 사용자를 받지 않는다 — `auth.uid()` 뿐.
- **표 삭제 정책은 그대로 없다**: 이용자가 REST 로 `delete` 를 보내도 0행(쓰기는 서버만 — 2026-08-27 결정 유지).
- **메일**: 대기 중인(`PENDING`) 이번 달 메일은 함수가 `CANCELLED` 로 바꾼다 — 그대로 두면 재시도 작업이 운세 없이 **빈 메일을
  보낸다**(위 §1). 이미 보낸 메일은 되돌릴 수 없다(처리방침에 적을 것).

### 2-2 ⚠ 결정 하나 — 지운 뒤 "오늘 · 이번 달" 이 다시 만들어지는가

지우면 고유 키가 비어, 다음에 오늘의 운세를 열 때 **새로 생성**된다(LLM 1콜). 세 가지 중 **(C) 를 권한다**:

| 안 | 동작 | Edge 변경 | 비용 위험 |
|---|---|---|---|
| A. 그냥 허용 | 지우고 열면 새로 생성 | 없음 | 지우기 · 열기를 반복하면 LLM 이 반복 — 막는 장치 없음 |
| B. 지운 기간은 그 기간이 끝날 때까지 생성 안 함 | "오늘 운세는 내일 다시 받을 수 있어요" | **있음** — chat Edge 생성 경로가 삭제 기록을 읽어야 한다 → **골든 미니팩 필요** | 0 |
| **C. 24시간에 한 번만 삭제** (위 함수의 `rate_limited`) | 지우고 열면 새로 생성 · 다음 삭제는 24시간 뒤 | **없음** | 사용자당 하루 최대 오늘 1 + 이번 달 1 추가 |

### 2-3 화면 — MY → 나의 기록 → **[운세 기록 전체 삭제]**

- `src/app/(tabs)/my.tsx` 의 `RECORD_ROWS` 에 한 줄 → 확인 시트는 묶음 6 의 `DeleteConfirmSheet` 를 그대로 쓴다.
- 시트 문구(안): "오늘의 운세 · 이번 달 운세 기록을 모두 지울까요?" · 지워지는 것(운세 기록 전부 · 이번 달 운세 알림) ·
  남는 것(상담 기록 · 보고서 · 분석 대상자) · "오늘의 운세는 다시 열면 새로 받습니다" · "삭제는 하루에 한 번".
- 결과: `ok` → "운세 기록을 지웠어요" · `rate_limited` → "오늘은 이미 지웠어요. 내일 다시 할 수 있어요" · 그 밖 → 실패 안내(지웠다고 말하지 않는다).
- 서비스: `src/features/today/services/fortuneRecordService.ts`(새) — `supabase.rpc('delete_my_fortune_records')`.

### 2-4 문서

- 처리방침 §5 운세 문장: "… 회원 탈퇴 시 **또는 [MY] → [운세 기록 전체 삭제]로** 삭제됩니다" · §6 에 경로 한 줄 — 법률 검토 반영 때 버전을 함께 올린다(CTO 판정).
- 데이터 보안 초안: 운세 행 "삭제 요청: 예 — 앱에서 전체 삭제 · 탈퇴" · `[법률 검토]` 해소.

## 3. 합성 반례 계획 (staging · 사용자 토큰 A · B)

| # | 반례 | 기대 |
|---|---|---|
| 1 | A 가 지운다 | A 의 daily · monthly **0행** · **B 의 행 수 그대로**(전후 대조) |
| 2 | 로그인 없이(anon 키) 부른다 | `unauthenticated` · 아무것도 안 지워짐 |
| 3 | A 가 REST 로 `daily_fortunes` 를 직접 `delete` | **0행** — 표 삭제 정책을 열지 않았다 |
| 4 | 24시간 안에 두 번째 호출 | `rate_limited` · 삭제 수 0 |
| 5 | 생성 임대가 잡혀 있는 중에 삭제 → 다시 생성 | 고유 키 충돌 없음 · 새 행 1개 |
| 6 | 탈퇴 경로 | 그대로 CASCADE (계정 삭제 계약 테스트 불변) |
| 7 | 대기 중인 이번 달 메일이 지운 운세를 가리킴 → 삭제 → 재시도 작업 실행 | 그 메일 `CANCELLED` · **보내지 않음**(빈 메일 없음) · 다른 사용자의 대기 메일은 그대로 |
| 8 | 알림 | `monthly_fortune` 분류만 사라지고 `important_schedule` · `birthday` 는 그대로 |
| 9 | 관리자 화면(운세 메일 · 리텐션) | 지운 뒤에도 오류 없이 숫자만 줄어든다 |
| 10 | 함수 계약 | `security definer` · `search_path` 고정 · anon 실행 권한 없음 · 사용자 인자 없음(소스 대조 테스트) |

판정은 HTTP 상태가 아니라 **돌아온 행 · 다시 읽은 행 수**로 한다(묶음 6 규칙).

## 4. 변경 목록

| 종류 | 무엇 |
|---|---|
| **마이그레이션** | **1건** — `fortune_record_deletions` 표 · `delete_my_fortune_records()`(운세 · 임대 · 운세 알림 삭제 + 대기 메일 취소) · 권한 |
| **Edge** | **없음** (안 C). 안 B 를 고르면 `chat`(운세 생성 경로) 변경 + 골든 미니팩 |
| 앱 | `my.tsx` 한 줄 · `fortuneRecordService.ts`(새) · 시트 문구 · 처리방침 §5 · §6 |
| 테스트 | 함수 계약(소스) · 화면 렌더(성공 · 제한 · 실패 문구) · staging 반례 1~10 |
| 비용 | LLM: 삭제 뒤 재생성만 — 사용자당 24시간에 최대 2콜 |
