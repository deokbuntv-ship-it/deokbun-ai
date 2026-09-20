-- 대표 대상자 바꾸기를 **한 번에** 끝낸다 (F-04) — 2026-09-21
--
-- 무엇이 틀렸나
--   앱이 요청 **세 번**으로 바꿨다: 지금 대표 찾기 → 해제 → 새 대표 지정
--   (`consultationSubjectService.ts:167-203`, 스스로 "V1: sequential client updates (no RPC/transaction)" 라고
--   적어 두었다). 해제 다음에 끊기면(네트워크 · 앱 종료) **대표가 아무도 없는 상태**로 남는다.
--   대표가 없으면 상담 · 궁합이 403 으로 막히고, 다음 앱 실행 때 온보딩이 같은 사람을 하나 더 만든다.
--
-- 고치는 방법
--   서버 함수 하나가 한 트랜잭션 안에서 ① 소유 확인 ② 사용자별 잠금 ③ 기존 대표 해제 ④ 새 대표 지정.
--   중간에 실패하면 트랜잭션이 통째로 되돌아가 **원래 대표가 그대로 남는다**.
--
-- ⚠ 유니크 부분 인덱스(`consultation_subjects_one_self_per_user`)는 지연(deferrable)이 아니라서
--   "한 번에 둘 다 뒤집기" 는 쓸 수 없다. 그래서 **해제 → 지정** 순서를 함수 안에서 지킨다.

create or replace function public.set_primary_subject(p_subject_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_already boolean;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- 같은 사용자의 대표 변경을 한 줄로 세운다 — 동시 요청 둘이 각각 해제만 하고 끝나는 일을 막는다.
  perform pg_advisory_xact_lock(hashtext('subject:' || v_user::text));

  select user_id, is_self into v_owner, v_already
  from public.consultation_subjects where id = p_subject_id;

  if v_owner is null then
    raise exception 'subject not found' using errcode = 'P0002';
  end if;
  if v_owner <> v_user then
    -- 남의 대상은 손대지 못한다. 존재 여부도 알려 주지 않는다.
    raise exception 'subject not found' using errcode = 'P0002';
  end if;

  update public.consultation_subjects
     set is_self = false, updated_at = now()
   where user_id = v_user and is_self and id <> p_subject_id;

  update public.consultation_subjects
     set is_self = true, updated_at = now()
   where id = p_subject_id and user_id = v_user;

  return jsonb_build_object('ok', true, 'subject_id', p_subject_id, 'already_primary', coalesce(v_already, false));
end;
$$;

revoke all on function public.set_primary_subject(uuid) from public, anon;
grant execute on function public.set_primary_subject(uuid) to authenticated;
grant execute on function public.set_primary_subject(uuid) to service_role;

comment on function public.set_primary_subject(uuid) is
  '대표 대상자를 한 트랜잭션 안에서 바꾼다. 중간에 실패하면 원래 대표가 그대로 남는다 (F-04, 2026-09-21).';
