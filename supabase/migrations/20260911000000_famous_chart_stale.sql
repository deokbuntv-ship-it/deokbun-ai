-- ============================================================================
-- DeokbunAI — 생년월일이 바뀌면 명식이 낡았다고 표시한다 (S1 재계산 정책)
--
-- WHY. `famous_profiles.calculation_state` 에 `stale` 값이 타입에도 있고 화면에도 있는데
-- **아무도 그 값을 쓰지 않았다.** 그래서 이런 일이 조용히 일어난다:
--
--   1) 인물을 등록하고 명식을 계산한다 → `current`
--   2) 본문을 만들어 발행한다 → 공개 페이지에 명식 표와 해설이 뜬다
--   3) 운영자가 **생년월일을 고친다** (오타 정정, 새 자료 발견)
--   4) `calculation_state` 는 여전히 `current` 다. 발행 게이트(`canPublishFamous`)는
--      아무것도 막지 않고, 페이지는 **바뀐 생년월일과 맞지 않는 명식**을 계속 보여 준다.
--
-- 명식 해설형 콘텐츠에서 이것은 단순한 캐시 불일치가 아니다. 글의 모든 주장이 명식에서 나오므로,
-- 명식이 틀리면 **글 전체가 틀린다.** 그리고 그 사실이 화면 어디에도 안 보인다.
--
-- 무엇을 하는가. `birth_info` 가 바뀌면
--   · 스냅샷이 있으면  → `stale`          (있던 명식이 낡았다)
--   · 스냅샷이 없으면  → `not_calculated` (실패했던 것을 고친 경우 — 다시 해 볼 기회다)
--
-- ⚠ **발행을 자동으로 내리지는 않는다.** `birth_info` 에는 `birthPlace` 같은 필드도 들어 있어
-- 오타 하나를 고쳤다고 살아 있는 페이지가 사라지면 그것대로 사고다. 대신 재발행이 막히고
-- (`canPublishFamous` 가 `current` 만 통과시킨다) 편집기가 "다시 계산 필요" 를 크게 띄운다.
-- 이미 나가 있는 페이지는 **옛 명식 + 그 명식으로 쓴 글** 이라 그 안에서는 서로 맞는다.
--
-- ⚠ `current_snapshot_id` 도 지우지 않는다. 지우면 공개 페이지의 표가 사라져 글만 남는데,
-- 그것이 낡은 표보다 나쁘다 — 무엇을 설명하는 글인지 알 수 없게 된다.
--
-- 3 RULES: one domain, ordered inside · per-signature drop then create or replace · no unguarded insert.
-- 이 파일은 아무것도 seed 하지 않는다. 기존 행은 건드리지 않는다(트리거는 UPDATE 시에만 돈다).
-- ============================================================================

create or replace function public.famous_profiles_chart_staleness()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.birth_info is distinct from old.birth_info then
    new.calculation_state := case
      when new.current_snapshot_id is not null then 'stale'
      else 'not_calculated'
    end;
  end if;
  return new;
end;
$$;

-- ⚠ 이름이 `famous_profiles_touch_trg` 보다 뒤에 오도록 `z_` 를 붙였다. Postgres 는 같은 시점의
-- 트리거를 **이름 알파벳 순**으로 실행하고, touch 트리거가 `new` 를 다시 쓰기 때문에 순서가
-- 뒤바뀌면 여기서 정한 값이 덮일 여지가 생긴다. 지금은 두 트리거가 서로 다른 칼럼만 건드리지만,
-- 순서를 이름에 박아 두면 나중에 touch 가 늘어나도 이 판정이 마지막에 남는다.
drop trigger if exists famous_profiles_z_staleness_trg on public.famous_profiles;
create trigger famous_profiles_z_staleness_trg
  before update on public.famous_profiles
  for each row execute function public.famous_profiles_chart_staleness();
