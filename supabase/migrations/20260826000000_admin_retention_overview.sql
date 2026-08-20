-- ADMIN RETENTION OVERVIEW (launch-readiness §21-23). Additive, idempotent. OWNER_APPLY — NOT pushed.
--
-- The retention tables are owner-scoped (RLS all_own), so an operator cannot read them across users from the
-- client. This SECURITY DEFINER aggregate returns ONLY counts (never any user's title/body/dates) and is
-- guarded by public.is_admin() — the same authority the admin console already uses. Read-only; there is no
-- admin write path here (creating notifications for other users / audiences is intentionally NOT enabled yet —
-- see the report's remaining-work note).
--
-- DEPENDENCY: public.is_admin() (owner-applied via docs/admin/ADMIN_SETUP.sql). Reads tables from the
-- retention foundation migration (20260823000000) and product_events (20260819000300); apply those first.

create or replace function public.admin_retention_overview()
returns table (
  in_app_total bigint,
  in_app_unread bigint,
  in_app_read bigint,
  life_events_active bigint,
  notif_pref_users bigint,
  notif_pref_monthly_on bigint,
  notif_pref_birthday_on bigint,
  notif_pref_marketing_on bigint,
  notification_opened_30d bigint,
  birthday_opened_30d bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query
  select
    (select count(*) from public.in_app_notifications),
    (select count(*) from public.in_app_notifications where read_at is null),
    (select count(*) from public.in_app_notifications where read_at is not null),
    (select count(*) from public.life_events where status = 'ACTIVE'),
    (select count(*) from public.notification_preferences),
    (select count(*) from public.notification_preferences where monthly_fortune),
    (select count(*) from public.notification_preferences where birthday),
    (select count(*) from public.notification_preferences where marketing),
    (select count(*) from public.product_events
       where event_name = 'notification_opened' and created_at > now() - interval '30 days'),
    (select count(*) from public.product_events
       where event_name = 'birthday_message_opened' and created_at > now() - interval '30 days');
end;
$$;

revoke all on function public.admin_retention_overview() from public, anon;
grant execute on function public.admin_retention_overview() to authenticated;

comment on function public.admin_retention_overview() is
  'Admin-only (is_admin) read-only retention aggregate — counts only, no user content. SECURITY DEFINER to read across owner-scoped retention tables.';
