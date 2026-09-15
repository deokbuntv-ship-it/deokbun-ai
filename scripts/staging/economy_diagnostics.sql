-- Sprint I §36 — READ-ONLY economy invariant diagnostics. Run in STAGING after migrations are applied. Every
-- query should return ZERO rows on a healthy system (each row is an anomaly to investigate). No mutation.

-- 1. Negative bucket balance (must be impossible).
select user_id, bucket, balance from public.duk_balance where balance < 0;

-- 2. Duplicate external purchase ids (idempotency broken).
select external_transaction_id, count(*) from public.verified_purchases
  group by external_transaction_id having count(*) > 1;

-- 3. Duplicate revocation ids.
select external_revocation_id, count(*) from public.purchase_revocations
  group by external_revocation_id having count(*) > 1;

-- 4. More than one committed session-price debit per (session, reason) (double charge).
select session_id, reason, count(*) from public.duk_ledger
  where session_id is not null and delta < 0 group by session_id, reason having count(*) > 1;

-- 5. A COMMITTED reserve that also has a RELEASED/EXPIRED sibling (terminal-once broken).
select session_id, count(distinct status) from public.duk_reserve
  where status in ('COMMITTED','RELEASED','EXPIRED') group by session_id having count(distinct status) > 1;

-- 6. Expired-but-still-RESERVED holds (reconciliation candidates).
select reservation_id, session_id, expires_at from public.duk_reserve
  where status = 'RESERVED' and expires_at <= now();

-- 7. Session marked charged (has charge_id) but no committed ledger debit for it.
select s.session_id from public.consultation_sessions s
  where s.charge_id is not null and s.successful_turn_count > 0
  and not exists (select 1 from public.duk_ledger l where l.session_id = s.session_id and l.delta < 0);

-- 8. Orphan purchase (verified_purchases with no corresponding PAID grant ledger row).
select vp.external_transaction_id from public.verified_purchases vp
  where vp.granted_duk > 0
  and not exists (select 1 from public.duk_ledger l where l.purchase_id = vp.external_transaction_id and l.reason = 'PURCHASE');

-- 9. Open debt with no originating revocation (should not happen for REFUND-origin debt).
select id, user_id, amount from public.duk_debt
  where not resolved and origin = 'REFUND' and revocation_id is null;

-- 10. First-pack granted more than once per user (lifetime rule broken — the partial unique index should prevent).
select user_id, count(*) from public.verified_purchases
  where internal_product_key = 'DUK_FIRST_20' group by user_id having count(*) > 1;

-- 11. Ledger supply sanity: total negative (spends) must never exceed total positive (grants) per user+bucket.
select user_id, bucket, sum(delta) from public.duk_ledger
  group by user_id, bucket having sum(delta) < 0;
