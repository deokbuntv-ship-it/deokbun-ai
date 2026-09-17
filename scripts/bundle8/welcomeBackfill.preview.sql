-- 소급 지급 **미리 보기** — 읽기 전용. 누가 받게 되는지와 이미 받았는지만 본다(이메일은 보지 않는다).
select p.id, p.terms_accepted_at, (select count(*) from public.duk_ledger l where l.user_id = p.id and l.reason = 'WELCOME') as has_welcome from public.profiles p where p.terms_version is not null order by p.terms_accepted_at;
