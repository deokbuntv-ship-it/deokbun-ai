-- ============================================================================
-- DeokbunAI — 유명인 공개 페이지에 명식과 고지 정보를 내보낸다 (F3 = C 수준, S2 고지)
--
-- WHY. (b) 명식 해설형으로 방향이 정해졌다(오너 결정 2026-09-08). 글이 명식을 설명하는데 정작
-- **명식이 화면에 없으면 교재 없는 교과서**다. 그리고 독자가 반드시 알아야 하는 두 가지가 지금
-- 공개 경로로 나가지 않는다:
--
--   1) **태어난 시각을 아는가.** 모르면 여덟 글자 중 두 글자가 비고 결론의 절반이 사라진다.
--      `birth_info.birthTimeAccuracy` 는 테이블에 있지만 `public_get_famous` 가 내보내지 않았다.
--      ⚠ 그리고 그 필드만으로는 부족하다 — 엔진은 EXACT 만 시각으로 취급하므로 '대략'은 계산상
--      '모름'과 같다. 그래서 **엔진이 실제로 시주를 세웠는지**(스냅샷의 hourKnown)를 내보낸다.
--   2) **출생정보의 출처.** `birth_source` 는 이미 나가지만 `birth_source_note` 는 안 나갔다.
--      (b) 에서는 "왜 추정인지" 가 교육적 가치가 있다.
--
-- ⚠ 대운은 내보내지 않는다. 스냅샷에 애초에 없다(`famousChart.ts` 가 담지 않는다) — 여기서 막는
-- 것이 아니라 **거기서 만들지 않는다.** 이중 방어가 아니라 단일 출처다.
--
-- 3 RULES: one domain, ordered inside · per-signature drop then create or replace · no unguarded insert.
-- 이 파일은 아무것도 seed 하지 않는다. 기존 `public_get_famous(text)` 를 대체한다 — 시그니처가
-- 같으므로 create or replace 로 충분하지만, 과거 시그니처를 남기지 않도록 drop 을 먼저 둔다.
-- ============================================================================

drop function if exists public.public_get_famous(text);

create or replace function public.public_get_famous(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  res jsonb;
begin
  select id into v_id
  from public.famous_profiles
  where slug = p_slug and status = 'published' and is_public = true
    and slug is not null;

  if v_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'slug', f.slug,
    'name', f.name,
    'category', f.category,
    'occupation', f.occupation,
    'short_description', f.short_description,
    'bio', f.bio,
    'birth_source', f.birth_source,
    -- 신설: 왜 그 출처인지. (b) 에서는 이것이 교육 정보다.
    'birth_source_note', f.birth_source_note,
    'seo_title', coalesce(f.seo_title, f.name),
    'seo_description', coalesce(f.seo_description, f.short_description),
    'canonical_url', f.canonical_url,
    'index_policy', f.index_policy,
    'published_at', f.published_at,
    -- 신설: 명식 스냅샷 전문. 화면이 표를 그리고 고지 문구가 hourKnown 을 읽는다.
    -- ⚠ 발행된 프로필의 **현재** 스냅샷만 나간다. 초안·과거 스냅샷은 나가지 않는다.
    'chart', (
      select s.result
      from public.famous_snapshots s
      where s.id = f.current_snapshot_id
    ),
    'related', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slug', r.slug, 'name', r.name, 'category', r.category
      ))
      from (
        select r2.slug, r2.name, r2.category
        from public.famous_profiles r2
        where r2.status = 'published' and r2.is_public = true
          and r2.slug is not null and r2.id <> f.id
          and (f.category is null or r2.category = f.category)
        order by r2.published_at desc nulls last
        limit 4
      ) r
    ), '[]'::jsonb)
  ) into res
  from public.famous_profiles f
  where f.id = v_id;

  return res;
end;
$$;

revoke all on function public.public_get_famous(text) from public;
grant execute on function public.public_get_famous(text) to anon, authenticated;
