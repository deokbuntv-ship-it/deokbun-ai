-- 이메일로 계정을 **한 번에** 찾는다 (F-03) — 2026-09-21
--
-- 무엇이 틀렸나
--   `naver-auth` Edge 는 GoTrue 의 `listUsers` 를 200명씩 **30쪽(6,000명)** 까지만 훑어 이메일을 찾았다
--   (`naver-auth/index.ts:102-124`). 가입자가 6,000명을 넘고 그 계정이 뒤쪽에 있으면 "없음" 으로 판단해
--   같은 이메일로 새 계정을 만들려다 인증 서버가 거절하고 **500 USER_CREATE_FAILED** 가 났다.
--   네이버로 가입했던 사람이 **다시 로그인하지 못한다**(가입자가 늘수록 늘어난다).
--   남의 계정에 들어가거나 계정이 둘 생기지는 않는다 — 막히기만 한다.
--
-- 고치는 방법
--   서비스 롤만 부를 수 있는 함수 하나로 `auth.users` 를 **전체** 보고 이메일로 찾는다. 쪽 수 제한이 없다.
--   (이메일 비교는 소문자로 맞춘다 — GoTrue 가 대소문자를 구분하지 않는 것과 같게.)
--
-- ⚠ 이 함수는 `auth.users` 를 읽으므로 **서비스 롤 전용**이다. anon · authenticated 에는 주지 않는다.
--   앱에서는 절대 부를 수 없고, Edge(서비스 롤)만 부른다.

create or replace function public.find_auth_user_by_email(p_email text)
returns table (user_id uuid, naver_id text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_email is null or btrim(p_email) = '' then
    return;
  end if;

  return query
  select u.id,
         nullif(u.raw_app_meta_data ->> 'naver_id', '') as naver_id
  from auth.users u
  where lower(u.email) = lower(btrim(p_email))
  order by u.created_at
  limit 1;
end;
$$;

revoke all on function public.find_auth_user_by_email(text) from public, anon, authenticated;
grant execute on function public.find_auth_user_by_email(text) to service_role;

comment on function public.find_auth_user_by_email(text) is
  '이메일로 계정을 찾는다(서비스 롤 전용). naver-auth 가 6,000명까지만 훑던 것을 대신한다 (F-03, 2026-09-21).';
