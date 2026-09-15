-- ════════════════════════════════════════════════════════════════════════════
-- 제3자 AI 처리 동의 — 애플 App Store 심사 지침 5.1.2(i)
-- ════════════════════════════════════════════════════════════════════════════
--
-- 왜 필요한가 (2026-09-10 원문 확인, developer.apple.com/app-store/review/guidelines)
--   "You must clearly disclose where personal data will be shared with third parties,
--    **including with third-party AI**, and obtain explicit permission before doing so."
--
-- 지금 상태 (2026-09-11 판정)
--   · 업체명(OpenAI·Supabase)은 개인정보 처리방침에 **있다** (`legalContent.ts:61`)
--   · 동의 전 LLM 호출도 **없다** (로그인 게이트 + 익명 Edge 실측 전부 401)
--   · ⚠ 그런데 **AI 전송 전용 동의 항목이 없다.** 필수 동의 3항목(약관·개인정보·만14세)에
--     녹아 있어서, 심사관이 "explicit permission" 을 따로 물으면 가리킬 것이 없다.
--
-- 이 마이그레이션이 만드는 것
--   버전·시각과 함께 기록되고 **철회할 수 있는** 동의 한 건. 그리고 그것을 서버가 확인한다.
--
-- ⚠ 왜 표인가 (칸이 아니라)
--   철회했다가 다시 동의할 수 있어야 하고, "언제 무엇에 동의했는지" 가 법적 증거로 남아야
--   한다. `profiles` 에 칸 하나를 두면 **덮어쓰기라 이력이 사라진다.**
--
-- ⚠ 왜 `granted_at` 을 사용자가 못 쓰게 하는가
--   이 컬럼은 "언제 동의했다" 는 **주장이 아니라 기록**이다. 클라이언트가 값을 정하면
--   증거로서의 값이 0이 된다. 그래서 RPC 로만 쓴다.
--
-- 멱등성 3원칙: create ... if not exists · drop 후 create · 시드 insert 없음.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.ai_processing_consents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  -- 동의 문안의 버전. 문안이 실질적으로 바뀌면 올리고, 사용자는 다시 동의해야 한다.
  consent_version text not null,
  granted_at      timestamptz not null default now(),
  revoked_at      timestamptz,
  -- 어디서 동의했나 (app / web). 분쟁 시 맥락이 된다. 개인 식별 정보가 아니다.
  surface         text not null default 'app' check (surface in ('app', 'web')),
  created_at      timestamptz not null default now()
);

create unique index if not exists ai_processing_consents_user_version_uniq
  on public.ai_processing_consents (user_id, consent_version);
create index if not exists ai_processing_consents_user_idx
  on public.ai_processing_consents (user_id, granted_at desc);

alter table public.ai_processing_consents enable row level security;

-- 사용자는 **읽기만** 한다. 쓰기는 아래 두 RPC 로만 — 그래야 시각이 기록으로 남는다.
drop policy if exists ai_processing_consents_select_own on public.ai_processing_consents;
create policy ai_processing_consents_select_own on public.ai_processing_consents
  for select using (user_id = auth.uid());

drop policy if exists ai_processing_consents_admin_read on public.ai_processing_consents;
create policy ai_processing_consents_admin_read on public.ai_processing_consents
  for select using (public.is_admin());

-- ── 동의 ────────────────────────────────────────────────────────────────────
create or replace function public.grant_ai_consent(p_version text, p_surface text default 'app')
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_row public.ai_processing_consents;
begin
  if auth.uid() is null then raise exception 'auth required' using errcode = '42501'; end if;
  if p_version is null or btrim(p_version) = '' then raise exception 'version required' using errcode = '22023'; end if;
  if coalesce(p_surface, 'app') not in ('app', 'web') then raise exception 'bad surface' using errcode = '22023'; end if;

  -- 같은 버전을 다시 동의하면 **되살린다**(철회 해제). 새 행을 쌓지 않는 이유는
  -- "지금 동의 상태인가" 를 한 행으로 답할 수 있어야 하기 때문이다.
  insert into public.ai_processing_consents (user_id, consent_version, surface)
       values (auth.uid(), btrim(p_version), coalesce(p_surface, 'app'))
  on conflict (user_id, consent_version)
    do update set revoked_at = null, granted_at = now(), surface = excluded.surface
  returning * into v_row;

  return jsonb_build_object('version', v_row.consent_version, 'grantedAt', v_row.granted_at, 'revoked', false);
end;
$$;

-- ── 철회 ────────────────────────────────────────────────────────────────────
create or replace function public.revoke_ai_consent(p_version text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_n int;
begin
  if auth.uid() is null then raise exception 'auth required' using errcode = '42501'; end if;
  -- 버전을 주지 않으면 **전부** 철회한다. 사용자가 "AI 처리를 그만 쓰겠다" 고 할 때
  -- 어느 버전에 동의했는지 기억할 필요가 없어야 한다.
  update public.ai_processing_consents
     set revoked_at = now()
   where user_id = auth.uid()
     and revoked_at is null
     and (p_version is null or consent_version = btrim(p_version));
  get diagnostics v_n = row_count;
  return jsonb_build_object('revoked', v_n);
end;
$$;

-- ── 현재 상태 ───────────────────────────────────────────────────────────────
create or replace function public.ai_consent_state(p_version text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare v_row public.ai_processing_consents;
begin
  if auth.uid() is null then return jsonb_build_object('granted', false, 'reason', 'auth'); end if;
  select * into v_row from public.ai_processing_consents
   where user_id = auth.uid() and consent_version = btrim(p_version)
   limit 1;
  if not found then return jsonb_build_object('granted', false, 'reason', 'none'); end if;
  if v_row.revoked_at is not null then
    return jsonb_build_object('granted', false, 'reason', 'revoked', 'revokedAt', v_row.revoked_at);
  end if;
  return jsonb_build_object('granted', true, 'grantedAt', v_row.granted_at, 'version', v_row.consent_version);
end;
$$;

revoke all on function public.grant_ai_consent(text, text) from public;
revoke all on function public.grant_ai_consent(text, text) from anon;
grant execute on function public.grant_ai_consent(text, text) to authenticated;

revoke all on function public.revoke_ai_consent(text) from public;
revoke all on function public.revoke_ai_consent(text) from anon;
grant execute on function public.revoke_ai_consent(text) to authenticated;

revoke all on function public.ai_consent_state(text) from public;
revoke all on function public.ai_consent_state(text) from anon;
grant execute on function public.ai_consent_state(text) to authenticated;

notify pgrst, 'reload schema';
