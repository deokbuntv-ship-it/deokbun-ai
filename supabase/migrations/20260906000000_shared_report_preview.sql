-- ============================================================================
-- DeokbunAI — SHARED REPORT PREVIEW (익명 미리보기)
--
-- WHY: `get_shared_report` is granted to `authenticated` only, so a logged-out visitor is cut
-- off at the GRANT layer (42501) before the function body's `auth.uid() is null` check even
-- runs. That was deliberate (§22). But it means someone who taps a friend's link meets a login
-- wall before learning what the link even is, and leaves. Owner decision 2026-09-06: show the
-- conclusion first, ask for the account second.
--
-- ⚠ THIS DOES NOT OPEN `get_shared_report`. Full read and preview are different permissions, so
-- they are different functions. `get_shared_report` keeps its authenticated-only grant, its
-- body check, and its full DTO, untouched. This is a SECOND, NARROWER function.
--
-- WHAT ANONYMOUS CALLERS GET — and what they cannot get
--   ✅ `conclusion`   — the report's own `summary`, name-redacted (see below)
--   ✅ `lockedCounts` — how MANY findings / cautions / topics are behind the wall. Numbers only.
--   ❌ title          — the compatibility title is literally `X님과 Y님의 궁합 보고서`. Never returned.
--   ❌ keyFindings / cautions / coveredTopics — the substance. Never returned.
--   ❌ generatedAt, ids, owner, subject data — not returned.
-- The wall is in the RETURNED PAYLOAD, not in the client. Opening devtools on the preview page
-- shows exactly what this function chose to send and nothing more.
--
-- NAME REDACTION — belt and braces, because `summary` is not fully server-templated.
--   `summary` = "두 분은 전체적으로 <tier>이에요." + a tail taken from the consultation's stored
--   summary. The leading sentence is a fixed template and cannot contain a name; the TAIL is
--   prose and is not guaranteed clean. So:
--     1. Pull both names out of the title (fixed shape `A님과 B님의 궁합 보고서`).
--     2. Remove them from the conclusion if they appear.
--     3. If the title does not match that shape (a consultation report, not a pair report), fall
--        back to THE FIRST SENTENCE ONLY — which is the server-composed one and is structurally
--        name-free.
--   Step 3 is the fail-closed branch: when we cannot prove which words are names, we return only
--   text we authored ourselves.
--
-- TOKEN RULES ARE UNCHANGED: active + not revoked + not expired, and an invalid / revoked /
-- expired / nonexistent token is one indistinguishable null (§41).
--
-- OPEN COUNTING: the preview does NOT bump `opened_count`. That counter means "someone opened
-- the report"; a crawler fetching a link preview would inflate it and make the share funnel lie.
-- ============================================================================

create or replace function public.get_shared_report_preview(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_hash       text;
  v_share      public.report_shares;
  v_report     public.consultation_reports;
  v_payload    jsonb;
  v_title      text;
  v_conclusion text;
  v_names      text[];
  v_first      text;
begin
  -- No auth check: this function EXISTS to serve logged-out visitors. Everything it can return
  -- is chosen below; there is nothing to gate on identity.
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
    return null;  -- same indistinguishable "unavailable" as the full read (§41)
  end if;

  select * into v_report from public.consultation_reports where id = v_share.report_id limit 1;
  if not found then
    return null;
  end if;

  v_payload    := v_report.report_payload;
  v_title      := coalesce(nullif(v_payload->>'title', ''), v_report.title, '');
  v_conclusion := coalesce(nullif(v_payload->>'summary', ''), '');

  if v_conclusion = '' then
    return null;  -- nothing worth previewing; do not invent a teaser
  end if;

  -- The compatibility title is composed as `A님과 B님의 궁합 보고서` (compatibilityReportComposer).
  v_names := regexp_match(v_title, '^(.+?)님과 (.+?)님의');

  if v_names is not null then
    v_conclusion := replace(v_conclusion, v_names[1], '상대');
    v_conclusion := replace(v_conclusion, v_names[2], '상대');
  else
    -- Fail closed: keep only the first sentence, which the server composed itself.
    v_first := (regexp_match(v_conclusion, '^[^.!?\n]*[.!?]'))[1];
    v_conclusion := coalesce(v_first, v_conclusion);
  end if;

  return jsonb_build_object(
    'conclusion', v_conclusion,
    'reportKind', case when v_report.report_type = 'compatibility' then 'compatibility' else 'consultation' end,
    -- Counts, never content: enough to show there is more, not enough to be the product.
    'lockedCounts', jsonb_build_object(
      'findings', coalesce(jsonb_array_length(v_payload->'keyFindings'), 0),
      'cautions', coalesce(jsonb_array_length(v_payload->'cautions'), 0),
      'topics',   coalesce(jsonb_array_length(v_payload->'coveredTopics'), 0)
    )
  );
end;
$$;

-- Anonymous by design — this is the one function in the share path that a logged-out visitor may
-- call. `authenticated` too, so the preview renders identically while a session is still loading.
revoke all on function public.get_shared_report_preview(text) from public;
grant execute on function public.get_shared_report_preview(text) to anon, authenticated;
