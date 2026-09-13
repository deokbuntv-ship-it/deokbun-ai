-- ════════════════════════════════════════════════════════════════════════════
-- M13 — 공유 페이지가 **사용자가 쓴 글**을 보여 주던 것을 막는다
-- ════════════════════════════════════════════════════════════════════════════
--
-- 무엇을 고치는가 (2026-09-11 staging 실측, 사용자 토큰 A·B)
--   `consultation_reports` 의 RLS 는 `reports_all_own (user_id = auth.uid())` **ALL** 이고
--   컬럼 단위 권한은 이 레포에 한 줄도 없다. 그래서 로그인한 사용자가 자기 리포트의
--   `report_payload` 를 통째로 다시 쓸 수 있었고, `get_shared_report` 가 그것을 **그대로**
--   공유 링크 수신자에게 돌려줬다. 실측에서 DTO 여섯 칸 중 **다섯 칸이 전부 위조본**이었다:
--
--     title · summary · keyFindings · cautions · coveredTopics
--
--   위조 문구에 "3개월 안에 반드시 성공합니다" 같은 **톤 규칙 위반 단정**을 넣어도 그대로 나갔다.
--   받는 사람은 그것을 덕분이가 만든 리포트로 읽는다.
--
-- ⚠ 원칙 (지시서 PART 3): **공개 공유 페이지에 보이는 것은 서버가 만들었거나 서버가 확인한 것만.**
--   자기 리포트를 자기가 고치는 것은 본인만 보므로 그대로 둔다. 막을 것은 공개 경로다.
--
-- 어떻게 (기존 구조에 맞는 가장 작은 변경)
--   1. `report_shares.shared_payload` — **서버 소유 칸.** 트리거만 채운다.
--      클라이언트가 이 칸에 무엇을 보내든 무시하고 덮어쓴다.
--   2. INSERT 트리거가 **그 시점의** `report_payload` 를 복사한다. 소유가 아니면 예외.
--   3. UPDATE 트리거가 화이트리스트 밖 칸을 얼린다 (`expires_at` 연장·`token_hash` 교체 차단).
--   4. `consultation_reports.report_payload` 가 **실제로 바뀌면** 그 리포트의 활성 공유를
--      전부 자동으로 revoke 한다 → 공유해 둔 링크에 위조본이 뜨는 일이 구조적으로 불가능하다.
--   5. `get_shared_report` 는 `shared_payload` 만 읽는다.
--
-- ⚠ 이 변경의 천장 (알고 남긴다)
--   리포트는 지금 **클라이언트가 합성해서 upsert** 한다(`reportService.ts:97,110`). 서버에는
--   대조할 원본이 없다. 그래서 "처음부터 위조본을 INSERT 한 뒤 공유" 는 이 마이그레이션으로
--   막히지 않는다 — 그건 **실제 상담을 한 적 없는 가짜 리포트**이고, 닫으려면 합성을 Edge 로
--   옮겨야 한다. 그건 RLS 수정이 아니라 설계 변경이라 CTO 판정 대상으로 남긴다.
--   **실제로 관측된 공격**(진짜 리포트를 받아서 결론만 바꿔 공유)은 여기서 완전히 닫힌다.
--
-- 옛 클라이언트 (이미 배포된 APK)
--   `report_shares` 에 직접 INSERT 하는 흐름을 **그대로 둔다.** 사용자 INSERT 권한을 빼지
--   않았기 때문에 옛 APK 의 공유 버튼이 깨지지 않는다. 트리거가 스냅샷을 대신 채운다.
--
-- 멱등성 3원칙: create ... if not exists · drop 후 create · 시드 insert 없음.
-- ⚠ 아래 backfill 은 시드가 아니라 **새 칸을 기존 행에서 채우는 것**이고
--   `where shared_payload is null` 이라 여러 번 돌려도 같다.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. 서버 소유 스냅샷 칸 ───────────────────────────────────────────────────
alter table public.report_shares
  add column if not exists shared_payload jsonb;

comment on column public.report_shares.shared_payload is
  '서버가 공유 시점에 뜬 리포트 사본. 트리거만 쓴다 — 클라이언트가 보낸 값은 무시된다 (M13).';

-- ── 2. INSERT: 서버가 스냅샷을 뜬다 ──────────────────────────────────────────
create or replace function public.report_shares_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_payload jsonb;
begin
  -- ⚠ 소유 확인을 여기서 한 번 더 한다. RLS 의 with-check 와 겹치지만, 트리거는
  --   security definer 로 돌기 때문에 여기서 확인하지 않으면 남의 리포트를 스냅샷할 수 있다.
  select r.report_payload into v_payload
    from public.consultation_reports r
   where r.id = new.report_id and r.user_id = auth.uid();
  if not found then
    raise exception 'report not found or not owned' using errcode = '42501';
  end if;

  -- ⚠ 클라이언트가 무엇을 보냈든 **덮어쓴다.**
  new.shared_payload := v_payload;
  new.owner_user_id  := auth.uid();
  -- 서버가 정하는 값들. 클라이언트가 조작해서 넣는 것을 막는다.
  new.opened_count   := 0;
  new.last_opened_at := null;
  new.status         := 'active';
  new.revoked_at     := null;
  new.expires_at     := now() + interval '30 days';
  return new;
end;
$$;

drop trigger if exists report_shares_snapshot_ins on public.report_shares;
create trigger report_shares_snapshot_ins
  before insert on public.report_shares
  for each row execute function public.report_shares_snapshot();

-- ── 3. 옛 공유 backfill ──────────────────────────────────────────────────────
-- ⚠ 시드가 아니다. 새 칸을 **같은 행이 이미 가리키는 리포트**에서 채운다.
--   `where shared_payload is null` 이라 여러 번 돌려도 결과가 같다.
--
-- ⚠ 순서가 중요하다 — 아래 freeze 트리거를 **먼저** 만들면 이 backfill 이 그 트리거에 걸린다
--   (실측: `ERROR: shared_payload is server-owned`). 트리거보다 앞에 둔다.
update public.report_shares s
   set shared_payload = r.report_payload
  from public.consultation_reports r
 where s.report_id = r.id and s.shared_payload is null;

-- ── 4. UPDATE: 화이트리스트 밖은 얼린다 ──────────────────────────────────────
create or replace function public.report_shares_freeze()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- 바뀌어도 되는 것: status · revoked_at (해지) · opened_count · last_opened_at (열람 집계) · updated_at
  -- 그 밖은 전부 옛 값으로 되돌린다. 조용히 되돌리지 않고 예외로 알린다 —
  -- 조용한 무시는 "바꿨다고 믿는" 상태를 만든다.
  if new.shared_payload is distinct from old.shared_payload then
    raise exception 'shared_payload is server-owned' using errcode = '42501';
  end if;
  if new.report_id     is distinct from old.report_id
     or new.owner_user_id is distinct from old.owner_user_id
     or new.token_hash    is distinct from old.token_hash
     or new.expires_at    is distinct from old.expires_at
     or new.channel       is distinct from old.channel then
    raise exception 'immutable column on report_shares' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists report_shares_freeze_upd on public.report_shares;
create trigger report_shares_freeze_upd
  before update on public.report_shares
  for each row execute function public.report_shares_freeze();

-- ── 5. 리포트 본문이 바뀌면 그 리포트의 활성 공유를 자동 해지 ─────────────────
create or replace function public.report_payload_change_revokes_shares()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- ⚠ `is distinct from` 이라 같은 값을 다시 써도(재생성 결과가 동일해도) 공유가 죽지 않는다.
  if new.report_payload is distinct from old.report_payload then
    update public.report_shares
       set status = 'revoked', revoked_at = now()
     where report_id = new.id and status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists consultation_reports_revoke_shares on public.consultation_reports;
create trigger consultation_reports_revoke_shares
  after update on public.consultation_reports
  for each row execute function public.report_payload_change_revokes_shares();

-- ── 6. 공유 조회는 스냅샷만 읽는다 ───────────────────────────────────────────
-- ⚠ 원본(20260818000300)에서 바뀐 곳은 **v_payload 의 출처 한 줄뿐**이다.
--   나머지(인증 필수 · 토큰 길이 · 상태·만료 확인 · 열람 집계 · BOUNDED DTO)는 그대로다.
-- ⚠ `search_path` 에 `extensions` 를 넣는다. 원본 파일(20260818000300)은 `public, pg_temp` 만
--   적어 두었는데, 그대로 다시 만들면 `digest()` 를 못 찾는다 — 실측 오류 그대로:
--     `function digest(text, unknown) does not exist` (SQLSTATE 42883)
--   `pgcrypto` 가 이 프로젝트에서 `extensions` 스키마에 설치돼 있기 때문이다. 즉 **레포 파일과
--   실제로 돌던 함수가 달랐다** — 대시보드나 커밋되지 않은 SQL 로 고쳐진 계열이다.
--   ⚠ PostgREST 는 이 오류를 404 로 돌려준다. "함수가 없다" 로 읽히지만 실제로는
--   **함수 안에서 다른 함수를 못 찾은 것**이다. 짧게 자른 오류 메시지로는 구분되지 않는다.
create or replace function public.get_shared_report(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_hash    text;
  v_share   public.report_shares;
  v_payload jsonb;
begin
  if auth.uid() is null then
    return null;
  end if;
  if p_token is null or length(p_token) < 32 then
    return null;
  end if;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_share
    from public.report_shares
   where token_hash = v_hash
     and status = 'active'
     and revoked_at is null
     and (expires_at is null or expires_at > now())
   limit 1;
  if not found then
    return null;
  end if;

  -- ⚠ **여기가 M13 수정의 핵심.** 사용자가 쓰는 `consultation_reports.report_payload` 가 아니라
  --   서버가 공유 시점에 뜬 `shared_payload` 를 읽는다. 스냅샷이 없으면(있을 수 없지만)
  --   보여 주지 않는다 — 없는 것을 살아 있는 원본으로 대체하면 구멍이 그대로 남는다.
  v_payload := v_share.shared_payload;
  if v_payload is null then
    return null;
  end if;

  update public.report_shares
     set opened_count = opened_count + 1, last_opened_at = now()
   where id = v_share.id;

  return jsonb_build_object(
    'title',         coalesce(nullif(v_payload->>'title', ''), '리포트'),
    'generatedAt',   v_payload->>'generatedAt',
    'summary',       coalesce(v_payload->>'summary', ''),
    'keyFindings',   coalesce(v_payload->'keyFindings',   '[]'::jsonb),
    'cautions',      coalesce(v_payload->'cautions',      '[]'::jsonb),
    'coveredTopics', coalesce(v_payload->'coveredTopics', '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_shared_report(text) from public;
revoke all on function public.get_shared_report(text) from anon;
grant execute on function public.get_shared_report(text) to authenticated;

-- ⚠ 실측(2026-09-11 staging): 함수를 `create or replace` 한 뒤 PostgREST 가 **권한 정보를 캐시에
--   들고 있어서**, service_role 호출은 200 인데 authenticated 호출은 `42883 No function matches`
--   로 떨어졌다. 없는 함수가 아니라 **그 역할에게 안 보이는 함수**다 — PostgREST 는 존재를
--   흘리지 않으려고 둘을 같은 오류로 말한다. 그래서 캐시를 명시적으로 다시 읽힌다.
notify pgrst, 'reload schema';

-- ── 7. 지난 실측에서 나온 비대칭 하나 (지시서 직전 보고서 C3) ────────────────
-- `conversations_insert_own` 은 subject 소유까지 보는데 `conversations_update_own` 은 보지 않아,
-- INSERT 뒤 UPDATE 로 남의 subject_id 를 붙일 수 있었다(실측 확인). 출생정보는 RLS 로 막혀
-- 읽히지 않으므로 실피해는 없었지만, 두 정책이 같은 것을 서로 다르게 말하는 상태였다.
drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own on public.conversations
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      subject_id is null
      or exists (
        select 1 from public.consultation_subjects s
        where s.id = subject_id and s.user_id = auth.uid()
      )
    )
  );
