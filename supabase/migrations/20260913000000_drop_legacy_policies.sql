-- ════════════════════════════════════════════════════════════════════════════
-- 옛 정책 제거 — production 에만 남아 있는 손으로 만든 정책들
-- ════════════════════════════════════════════════════════════════════════════
--
-- 무엇을 고치는가
--   production 사전점검(2026-09-05, ref olvkpaldrwvtexxpoaag)에서 네 테이블에 **이름이 다른
--   옛 정책**이 새 정책과 나란히 남아 있는 것이 나왔습니다:
--
--     consultation_drafts     새 4개 + 옛 3개  insert/select/update own draft
--     consultation_subjects   새 1개 + 옛 4개  delete/insert/select/update own subjects
--     conversations           새 3개 + 옛 3개  insert/select/update own conversations
--     conversation_messages   새 2개 + 옛 2개  insert/select messages ... own conversation
--
--   이 이름들은 **레포에도 git 이력에도 없습니다.** `ai_usage_logs`·`content_items` 와 같은
--   계열입니다 — 초기에 대시보드나 커밋되지 않은 SETUP SQL 로 만들어졌습니다.
--   승격은 **새 이름만** `drop policy if exists` 후 재생성하므로 옛 이름은 지워지지 않습니다.
--
-- ⚠ 왜 중요한가 — PostgreSQL 은 permissive 정책을 **OR 로 결합**합니다
--   같은 명령에 정책이 둘이면 **넓은 쪽이 이깁니다.** 새 정책이 아무리 좁아도 옛 정책이
--   넓으면 그 제한은 무의미해집니다.
--
--   구체적으로 걱정되는 곳이 하나 있습니다. 새 `conversations_insert_own` 은
--   `user_id = auth.uid()` 에 더해 **참조하는 subject_id 가 본인 것이어야 한다**는 조건을 겁니다:
--
--       and (subject_id is null or exists (
--             select 1 from public.consultation_subjects s
--             where s.id = subject_id and s.user_id = auth.uid()))
--
--   옛 `insert own conversations` 가 `user_id = auth.uid()` 뿐이라면, OR 결합으로 이 제한이
--   **통째로 무효**가 됩니다 — 남의 subject 를 자기 대화에 붙일 수 있게 됩니다.
--
--   ⚠ **옛 정책의 실제 조건은 확인하지 못했습니다.** production 조회가 금지된 상태에서
--   작성했고, 그 정의는 레포 어디에도 없습니다. 확인 질의는
--   `docs/PRODUCTION_SCHEMA_PROMOTION_PLAN.md` §3-2 에 있습니다.
--   다만 **확인 결과와 무관하게 지우는 것이 옳습니다** — 아래를 보십시오.
--
-- 지워도 앱이 깨지지 않는 근거 (동사 커버리지를 대조했습니다)
--   consultation_drafts     새: select·insert·update·delete own  ⊇ 옛: insert·select·update
--   consultation_subjects   새: for all own                      ⊇ 옛: delete·insert·select·update
--   conversations           새: select·insert·update own         ⊇ 옛: insert·select·update
--   conversation_messages   새: select·insert via conversation   ⊇ 옛: insert·select
--   **새 정책이 옛 정책의 동사를 전부 덮습니다.** 지우면 좁아질 뿐 기능이 사라지지 않습니다.
--   그리고 좁아지는 그 지점이 바로 위에서 걱정한 곳입니다.
--
-- staging 에서의 동작
--   이 이름들은 staging 에 **없습니다.** `drop policy if exists` 라 아무 일도 일어나지 않습니다.
--
-- 되돌리기
--   지운 정책의 정의를 레포가 모르므로 **자동 복구가 안 됩니다.**
--   그래서 §4 의 실행 순서는 이 마이그레이션 **앞에** 옛 정책 정의를 받아 적는 단계를 둡니다
--   (`pg_policies` 조회 한 줄). 되돌려야 하면 그 출력으로 되살립니다.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "insert own draft" on public.consultation_drafts;
drop policy if exists "select own draft" on public.consultation_drafts;
drop policy if exists "update own draft" on public.consultation_drafts;

drop policy if exists "delete own subjects" on public.consultation_subjects;
drop policy if exists "insert own subjects" on public.consultation_subjects;
drop policy if exists "select own subjects" on public.consultation_subjects;
drop policy if exists "update own subjects" on public.consultation_subjects;

drop policy if exists "insert own conversations" on public.conversations;
drop policy if exists "select own conversations" on public.conversations;
drop policy if exists "update own conversations" on public.conversations;

drop policy if exists "insert messages in own conversation" on public.conversation_messages;
drop policy if exists "select messages in own conversation" on public.conversation_messages;

-- ⚠ 위 두 줄의 이름은 **추정입니다.** 사전점검이 보고한 것은
--   "insert/select messages ... own conversation" 으로 가운데가 생략된 형태였습니다.
--   §4 의 옛 정책 받아 적기 단계에서 정확한 이름을 확인한 뒤 필요하면 이 두 줄을 고칩니다.
--   틀린 이름이어도 `if exists` 라 오류는 나지 않고, **다만 안 지워집니다.**
