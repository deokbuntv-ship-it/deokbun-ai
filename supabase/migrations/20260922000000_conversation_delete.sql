-- ════════════════════════════════════════════════════════════════════════════
-- 대화 삭제 기능 — 이용자가 자기 대화를 지우고, 그 대화의 답 원문이 **100%** 즉시 지워진다
-- ════════════════════════════════════════════════════════════════════════════
--
-- 결정 (2026-09-13)
--   · 오너: 대화 삭제 기능을 넣는다 (CTO 권고 동의)
--   · CTO: 대화 삭제 시 즉시 삭제 범위 100% 는 이 기능과 함께 한다 ·
--          대화를 지워도 리포트는 남긴다(리포트는 따로 지울 수 있다 — reports_all_own 이 이미 허용)
--
-- 21 까지는 대화→답 연결이 서버 판단 기록(consultation_decisions)에만 있었다. 그런데 판단 기록이
-- 생기지 않는 완료가 셋 있다 — 궁합(덕 과금 경로는 decision_meta 가 원래 없다) · 거절된 비답변 ·
-- 대화 요약. staging 커버리지 상담 619/710 · 궁합 25/34 · 요약 0/6.
--   → 재전송 행 자체에 대화 id 를 남긴다. 누가 적나:
--     · 상담 — chat Edge 가 **소유 확인을 마친** 대화 id 를 획득 직후 적는다(상담은 대화 없이 오지 못한다)
--     · 요약 — 앱이 요약하는 대화 id 를 함께 보내고, Edge 가 소유를 확인한 뒤 적는다
--     · 궁합 — 궁합 대화는 첫 답의 등급을 담아 **첫 답이 온 뒤에** 만들어진다(compatibility-chat.tsx
--       persistPair). 첫 요청 때는 대화가 없다 → 앱이 대화를 확보한 뒤 link_compatibility_answer 로 붙인다
--
-- ⚠ 이 칸에 외래키를 걸지 않는다. 연결은 정리용이다 — 연결이 틀리거나 비어도 요청이 실패하면 안 되고,
--   정리는 user_id 까지 맞춰야만 건드린다(남의 행을 지울 수 없다). 연결이 없는 행은 21 의 24시간 정리가 지운다.
--
-- ⚠ 21 과 달라진 곳 하나 — **증인은 남긴다.** 21 은 대화 삭제 때 그 답의 증인(해시)도 지웠다. 그러나
--   리포트는 남기로 했으므로(CTO), 증인을 지우면 남은 리포트를 다시 공유할 때 모든 문장이 빠진 빈 공유가
--   된다(증인 필터가 전부 탈락시킨다). 증인은 원문이 아닌 해시이고 탈퇴 시 CASCADE 로 사라진다(처리방침 §5).
--   공유 링크는 21 과 같이 해지한다 — 지운 대화에서 나간 링크는 거둔다. 다시 공유하는 것은 이용자의 새 결정이다.
--
-- 멱등성 3원칙: create ... if not exists · drop 후 create · 시드 insert 없음.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. 재전송 행의 대화 연결 ─────────────────────────────────────────────────
alter table public.paid_request_idempotency add column if not exists conversation_id uuid;

create index if not exists paid_request_idempotency_conversation_idx
  on public.paid_request_idempotency (conversation_id)
  where conversation_id is not null;

-- ── 2. 이용자가 자기 대화를 지운다 ───────────────────────────────────────────
-- 메시지 · 피드백 · 판단 기록은 CASCADE, 리포트 · AI 답변 신고는 연결만 끊긴다(set null — 신고는
-- 검토 기록으로 남아야 한다). 원문 · 공유는 아래 트리거가 정리한다.
drop policy if exists conversations_delete_own on public.conversations;
create policy conversations_delete_own on public.conversations
  for delete to authenticated
  using (user_id = auth.uid());

-- ── 3. 대화를 지우면 — 원문 100% · 공유 해지 (증인은 남긴다) ─────────────────
-- 21 의 함수를 바꾼다. BEFORE DELETE 는 그대로다(판단 기록이 CASCADE 로 사라지기 전에 읽어야 하는
-- 옛 행이 있다 — 연결 칸이 생기기 전에 완료된 답).
create or replace function public.purge_conversation_answers()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- ① 그 대화의 답 원문 — 연결 칸(이 마이그레이션 이후의 모든 답) 또는 판단 기록(그 전의 답)
  update public.paid_request_idempotency i
     set status = 'EXPIRED', response_json = null, updated_at = clock_timestamp()
   where i.user_id = old.user_id
     and i.status = 'COMPLETED'
     and (i.conversation_id = old.id
          or exists (select 1 from public.consultation_decisions d
                      where d.conversation_id = old.id
                        and d.user_id = i.user_id and d.workload = i.workload and d.request_id = i.request_id));

  -- ② 그 대화 리포트의 공유 — 해지 + 스냅샷 비움 (리포트 자체는 남는다)
  update public.report_shares s
     set status = 'revoked', revoked_at = coalesce(s.revoked_at, now()), shared_payload = null
    from public.consultation_reports r
   where r.conversation_id = old.id
     and s.report_id = r.id
     and (s.status = 'active' or s.revoked_at is null or s.shared_payload is not null);

  return old;
end;
$$;

drop trigger if exists conversations_purge_answers on public.conversations;
create trigger conversations_purge_answers
  before delete on public.conversations
  for each row execute function public.purge_conversation_answers();

-- ── 4. 궁합 답의 대화 연결 — 앱이 대화를 확보한 뒤에 붙인다 ───────────────────
-- 호출자 **자신의** 궁합 답을 호출자 **자신의** 대화에만, 아직 연결되지 않은 행만. 그 밖에는 0행(false).
-- 연결은 정리용이다 — 실패해도 24시간 정리가 원문을 지운다.
create or replace function public.link_compatibility_answer(p_request_id text, p_conversation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_n integer;
begin
  if auth.uid() is null or p_request_id is null or p_conversation_id is null then
    return false;
  end if;
  update public.paid_request_idempotency i
     set conversation_id = p_conversation_id
   where i.user_id = auth.uid()
     and i.workload = 'compatibility'
     and i.request_id = p_request_id
     and i.conversation_id is null
     and exists (select 1 from public.conversations c
                  where c.id = p_conversation_id and c.user_id = auth.uid());
  get diagnostics v_n = row_count;
  return v_n = 1;
end;
$$;

revoke all on function public.link_compatibility_answer(text, uuid) from public, anon;
grant execute on function public.link_compatibility_answer(text, uuid) to authenticated;

notify pgrst, 'reload schema';
