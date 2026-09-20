-- 작업자 RPC 권한을 **명시**한다 (GAP-03) — 2026-09-21
--
-- 무엇이 애매했나
--   알림 · 메일 작업자 RPC 들은 `revoke all … from public, anon, authenticated` 만 하고
--   `grant execute … to service_role` 을 적지 않았다
--   (`20260840000000_retention_scheduler.sql:293` · `20260844000000_retention_workers.sql:156`
--    · `20260841000000_monthly_email_ops.sql:277`). 다른 service 전용 RPC 와 모양이 다르다.
--
--   staging 실측(2026-09-21): 일곱 함수 **모두 service_role 이 실행할 수 있다** — Supabase 의 기본 권한이
--   남아 있어서다. 즉 지금 깨져 있지는 않다. 그러나 **기본 권한에 기대고 있는 상태**라, 나중에 누가 기본
--   권한을 조이면 알림 · 메일 작업자가 조용히 멈춘다. 그래서 여기서 못을 박는다.
--
-- ⚠ 권한을 **넓히지 않는다.** anon · authenticated 에는 아무것도 주지 않는다.

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'run_birthday_notifications',
        'record_notification_delivery_result',
        'claim_pending_push_deliveries',
        'claim_pending_email_deliveries',
        'recompute_email_campaign',
        'record_email_delivery_result',
        'run_email_campaign',
        'release_expired_reservations'
      )
  loop
    execute format('grant execute on function %s to service_role', r.sig);
  end loop;
end $$;
