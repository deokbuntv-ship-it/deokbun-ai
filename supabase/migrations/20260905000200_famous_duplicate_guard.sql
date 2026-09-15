-- ============================================================================
-- DeokbunAI — FAMOUS DUPLICATE GUARD (유명인 중복 등록 방지)
--
-- PROBLEM: `famous_profiles` is unique on `slug` only, so the same person can be registered
-- twice as `hong-gildong` and `hong-gil-dong` — two profiles, two engine snapshots, two public
-- pages competing for the same search term.
--
-- ⚠ WHY THIS WARNS INSTEAD OF BLOCKING — the decision, and the reason.
--   동명이인 are real. 김민수 born 1980-03-04 and a different 김민수 born 1995-11-20 are two
--   people and both may be legitimate entries. A hard UNIQUE on the name would make the second
--   one impossible to register and the operator would work around it by mangling the name,
--   which is worse than a duplicate. So:
--     · name + birth date IDENTICAL  → almost certainly the same person → WARN LOUDLY, still allow
--     · name identical, birth differs → probably 동명이인 → mention it, do not fuss
--     · name identical, either birth unknown → cannot tell → mention it
--   The operator sees the existing profile and decides. A machine cannot make this call, and
--   pretending it can is how real people get locked out of the catalogue.
--
-- MATCHING KEY: `famous_name_key(name)` — NFC-ish normalization that folds whitespace and
-- case, because "홍길동" / "홍 길 동" / " 홍길동 " are one person, while it does NOT strip
-- punctuation or transliterate (that would collide 정우성 with 정우 성 or Jung Woo-sung).
-- Deliberately conservative: a missed match costs a warning, a false match costs a wrong block.
--
-- 3 RULES: one file = one domain · per-signature drop then create or replace · no unguarded insert.
-- Depends on: public.famous_profiles (20260904000100), public.is_admin() (20260904000000).
-- ============================================================================

-- IMMUTABLE so it can back an index; no table access, no search_path surprise.
create or replace function public.famous_name_key(p_name text)
returns text
language sql
immutable
strict
as $$
  -- lower + collapse all whitespace runs + trim. Nothing else: no punctuation stripping, no
  -- romanization. Those would merge people who are not the same person.
  select btrim(regexp_replace(lower(p_name), '\s+', '', 'g'));
$$;

-- A NON-UNIQUE index: the point is fast lookup for the warning, not enforcement.
create index if not exists famous_profiles_name_key_idx
  on public.famous_profiles (public.famous_name_key(name));

-- ── the check the admin screen calls before saving ──────────────────────────────────────────
-- Returns candidates, never a verdict. `confidence` tells the operator how hard to look.
drop function if exists public.famous_duplicate_candidates(text, jsonb, uuid);
create or replace function public.famous_duplicate_candidates(
  p_name       text,
  p_birth_info jsonb default null,
  p_exclude_id uuid  default null   -- the row being edited must not match itself
)
returns table (
  id           uuid,
  slug         text,
  name         text,
  occupation   text,
  status       text,
  birth_year   text,
  birth_month  text,
  birth_day    text,
  confidence   text                 -- SAME_PERSON_LIKELY | SAME_NAME_DIFFERENT_BIRTH | SAME_NAME_BIRTH_UNKNOWN
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_key text;
  v_y text; v_m text; v_d text;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if p_name is null or btrim(p_name) = '' then
    return;  -- nothing typed yet
  end if;

  v_key := public.famous_name_key(p_name);
  v_y := nullif(p_birth_info ->> 'birthYear', '');
  v_m := nullif(p_birth_info ->> 'birthMonth', '');
  v_d := nullif(p_birth_info ->> 'birthDay', '');

  return query
  select
    f.id, f.slug, f.name, f.occupation, f.status,
    nullif(f.birth_info ->> 'birthYear', ''),
    nullif(f.birth_info ->> 'birthMonth', ''),
    nullif(f.birth_info ->> 'birthDay', ''),
    case
      -- Month/day are compared numerically so '03' and '3' are the same date, which is how
      -- the app's BirthInfoDraft actually stores them (free-text strings).
      when v_y is not null
       and nullif(f.birth_info ->> 'birthYear', '') is not null
       and v_y = (f.birth_info ->> 'birthYear')
       and coalesce(nullif(v_m, '')::int, -1) = coalesce(nullif(f.birth_info ->> 'birthMonth', '')::int, -2)
       and coalesce(nullif(v_d, '')::int, -1) = coalesce(nullif(f.birth_info ->> 'birthDay', '')::int, -2)
        then 'SAME_PERSON_LIKELY'
      when v_y is null or nullif(f.birth_info ->> 'birthYear', '') is null
        then 'SAME_NAME_BIRTH_UNKNOWN'
      else 'SAME_NAME_DIFFERENT_BIRTH'
    end
  from public.famous_profiles f
  where public.famous_name_key(f.name) = v_key
    and (p_exclude_id is null or f.id <> p_exclude_id)
  order by
    case
      when v_y is not null and v_y = (f.birth_info ->> 'birthYear') then 0
      else 1
    end,
    f.created_at asc
  limit 20;
exception
  when invalid_text_representation then
    -- A non-numeric month/day somewhere in the data must not break the whole check; fall back
    -- to name-only matching rather than failing the operator's save.
    return query
    select f.id, f.slug, f.name, f.occupation, f.status,
           nullif(f.birth_info ->> 'birthYear', ''),
           nullif(f.birth_info ->> 'birthMonth', ''),
           nullif(f.birth_info ->> 'birthDay', ''),
           'SAME_NAME_BIRTH_UNKNOWN'::text
    from public.famous_profiles f
    where public.famous_name_key(f.name) = v_key
      and (p_exclude_id is null or f.id <> p_exclude_id)
    order by f.created_at asc
    limit 20;
end;
$$;

revoke all on function public.famous_duplicate_candidates(text, jsonb, uuid) from public;
grant execute on function public.famous_duplicate_candidates(text, jsonb, uuid) to authenticated;

-- ── one-off visibility: does the CURRENT data already contain duplicates? ────────────────────
drop function if exists public.admin_famous_duplicate_report();
create or replace function public.admin_famous_duplicate_report()
returns table (name_key text, profile_count bigint, slugs text[], names text[])
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query
  select public.famous_name_key(f.name), count(*), array_agg(f.slug order by f.created_at), array_agg(f.name order by f.created_at)
  from public.famous_profiles f
  group by public.famous_name_key(f.name)
  having count(*) > 1
  order by count(*) desc;
end;
$$;

revoke all on function public.admin_famous_duplicate_report() from public;
grant execute on function public.admin_famous_duplicate_report() to authenticated;
