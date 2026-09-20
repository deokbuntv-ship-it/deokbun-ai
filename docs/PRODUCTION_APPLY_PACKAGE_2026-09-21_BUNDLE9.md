# production 적용 패키지 — 출시 전 결함 일괄 수정 (묶음 9 · 2026-09-21)

> **한 줄** — 덕을 살 수 없던 문제 · 공유 링크 404 · 환불 구멍 둘 · 프리미엄 리포트 불능 · 옛 운세 캐시를 한 번에 올린다.
> **순서가 중요하다**: ① DB → ② Edge → ③ 웹 → ④ 앱. 앞이 끝나야 뒤가 맞는다.
> 이미 끝난 것(다시 하지 않는다): 잔액 뷰 보안(2026-09-20 적용 완료) · 가입 덕 소급 · 덕 차감 켜기.
>
> 🆕 **CTO 판정 2026-09-21 — 결제 확인을 기다리지 않고 ①②③을 먼저 올린다.**
> "404와 보안은 결제와 무관하고 지금 실사이트가 깨져 있다. 결제 코드는 올려도 켜지지 않으니 상관없다."
> → **지금 올린다**: ① DB · ② Edge · ③ 웹. **나중**: ④ 앱(판매자 계정 · 내부 테스트 트랙) · `iap-reconcile` 크론(실구매 확인 뒤).
> 결제 코드가 함께 올라가도 **스토어에 앱이 깔리기 전까지는 아무도 그 길로 들어올 수 없다** — 그래서 먼저 올려도 안전하다.

| | |
|---|---|
| 올리는 것 | 마이그레이션 **6** · Edge **5** · 웹 병합 **1** · 앱 빌드 **1**(내부 테스트 트랙) |
| 되돌리기 | 각 칸에 적어 두었다. DB 는 마이그레이션마다, Edge 는 이전 배포본 재배포 |
| 위험도 | 中 — 돈(환불 · 구매)과 화면이 함께 바뀐다. **한 칸씩** 하고 확인 문장을 본다 |
| staging | ✅ 마이그레이션 6개 적용 · chat Edge 배포 · 합성 반례 27/27 + 동시 환불 실제 재현 1건 · 골든 PASS(58.32 / baseline 58.28) |

---

## ① DB — 마이그레이션 6개

> SQL Editor 가 아니라 **레포 폴더에서 CLI** 로 올린다(한 번에 6개라 순서가 중요하다).

**①-1 미리 보기** — 무엇이 올라갈지만 본다.

```
npx.cmd supabase@2.117.0 db push --dry-run --project-ref olvkpaldrwvtexxpoaag
```

기대: 아래 **여섯 줄만** 나온다.

| 파일 | 무엇 | 되돌리기 |
|---|---|---|
| `20260924000000_refund_partial_offset_and_lock.sql` | 환불 빚 부분 상계(F-01) + 동시 환불 잠금(GAP-01) + PAID 음수 방지 트리거 | 아래 ⑤-1 |
| `20260925000000_premium_single_purchase.sql` | 프리미엄은 한 번 구매 — 24시간 무료 재생성 차단 | ⑤-2 |
| `20260926000000_set_primary_subject.sql` | 대표 대상자 교체를 한 트랜잭션으로(F-04) | ⑤-3 |
| `20260927000000_expired_reservations.sql` | 만료된 덕 예약이 잔액을 잡지 않게 + 정리 함수 | ⑤-4 |
| `20260928000000_find_user_by_email.sql` | 네이버 로그인 이메일 조회(F-03) | ⑤-5 |
| `20260929000000_worker_rpc_grants.sql` | 작업자 RPC 권한 명시(GAP-03) | 되돌릴 필요 없음(권한 부여뿐) |

**①-2 적용**

```
npx.cmd supabase@2.117.0 db push --project-ref olvkpaldrwvtexxpoaag
```

**①-3 확인** — SQL Editor 에 한 줄. 기대값은 오른쪽.

```sql
select (select count(*) from public.duk_debt where amount > original_amount) as debt_over_original, (select count(*) from public.duk_reserve where status = 'RESERVED' and expires_at <= now()) as stuck_reservations, (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('set_primary_subject','release_expired_reservations','find_auth_user_by_email')) as new_functions, (select count(*) from pg_trigger where tgname = 'duk_ledger_paid_never_negative') as paid_guard;
```

기대: `debt_over_original` **0** · `stuck_reservations` **0** · `new_functions` **3** · `paid_guard` **1**

## ② Edge — 5개

> `_shared/googlePlay.ts` 가 바뀌어 그 파일을 쓰는 셋(`verify-purchase` · `google-rtdn` · `iap-reconcile`)도 함께 올린다.
> `iap-reconcile` 은 **설정(`config.toml`)이 바뀌어** 재배포가 필요하다 — 크론이 서버 입구에서 막히던 것을 푼다.
> ⚠ **크론 등록은 지금 하지 않는다**(CTO ③ 2026-09-21: 실구매 1회 확인 뒤에 켠다). 배포만 해 둔다.

```
npx.cmd supabase@2.117.0 functions deploy chat --project-ref olvkpaldrwvtexxpoaag
npx.cmd supabase@2.117.0 functions deploy naver-auth --project-ref olvkpaldrwvtexxpoaag
npx.cmd supabase@2.117.0 functions deploy verify-purchase --project-ref olvkpaldrwvtexxpoaag
npx.cmd supabase@2.117.0 functions deploy google-rtdn --project-ref olvkpaldrwvtexxpoaag
npx.cmd supabase@2.117.0 functions deploy iap-reconcile --project-ref olvkpaldrwvtexxpoaag
```

**②-1 시크릿 확인 (중요)** — 이번 묶음부터 **값이 없으면 production 은 막는 쪽**으로 동작한다.

| 시크릿 | production 에 있어야 하는 값 | 없으면 |
|---|---|---|
| `DUK_BILLING_ENABLED` | `true` (2026-09-20 에 넣음) | 유료 요청을 **거절**하고 로그를 남긴다 (공짜로 주지 않는다) |
| `AI_CONSENT_ENFORCED` | `true` (2026-09-16 에 넣음) | **동의를 요구한다**(기본이 뒤집혔다) |
| `APP_ENV` | 넣지 않는다 | 값이 없으면 production 으로 본다 — 그것이 맞다 |

> ⚠ staging 에는 반대로 `APP_ENV=staging` 이 **있어야** 한다(2026-09-21 넣음). 없으면 staging 이 production 처럼 막는다.

**②-2 확인** — 로그인 없이 부르면 401 이 나오면 된다(배포 확인용).

```
curl.exe -s -o NUL -w "%{http_code}\n" -X POST https://olvkpaldrwvtexxpoaag.supabase.co/functions/v1/chat
```

기대: `401`

## ③ 웹 — 병합 1회

- 바뀐 것: `vercel.json` 동적 주소 규칙 · 콘텐츠 상세 정적 생성 · **사이트맵 ↔ 결과물 대조**(빌드가 스스로 검사)
  · 🆕 **프리미엄 화면에서 "다시 보기(무료)" 와 "새로 만들기(50덕)" 를 나눔**(CTO ② — 웹에도 같이 올라간다)
- 방법: 평소처럼 `main` 으로 병합 → Vercel 자동 배포(약 3분)
- ⚠ 빌드 마지막에 `[sitemap-verify]` 줄이 나온다. **빠진 주소가 있으면 빌드가 실패한다** — 그것이 이번에 넣은 장치다.

**③-1 확인** — 로그인하지 않은 시크릿 창에서 **네 종류**를 연다.

| 주소 | 기대 |
|---|---|
| `https://www.deokbunai.com/content/jo-seyoung2026` | 글이 열린다 (전에는 404) |
| `https://www.deokbunai.com/content` | 목록이 열린다 |
| 리포트 공유 링크(직접 하나 만들어서) | 미리보기가 열린다 (전에는 404) |
| `https://www.deokbunai.com/privacy-policy` | 그대로 열린다 |

**③-2 공개 콘텐츠 수 확인** (오너 결정 2026-09-21: **지금 있는 1개만 연다.** 숏폼 발행을 시작할 때 늘린다)

```sql
select count(*) as published_content from public.content_items where status = 'published' and slug is not null;
```

기대: **1**. 이 숫자가 곧 `/content/<주소>` 로 열리는 글의 수다 — 늘리면 사이트맵과 정적 페이지도 함께 늘어난다(대조 장치가 자동으로 확인한다).

## ④ 앱 — 내부 테스트 트랙 (**나중** · 판매자 계정 뒤)

- staging 용 내부 APK 는 이 묶음에서 만들어 두었다(§8-9 체크리스트 A 1~26번용).
  https://expo.dev/artifacts/eas/SwC6fJHw2UorjwCvhdRJxoJ3Jht8bM5V9Oyls_0Fquk.apk
- **실구매(B1~B8)는 플레이 콘솔 내부 테스트 트랙 + 라이선스 테스터**로만 확인된다.
- ⚠ 결제가 실제로 되는지는 **그 확인 전까지 "고쳤다" 고 적지 않는다**(CTO 완료 기준).
- 실구매 1회가 끝나면 그때 **승인 재시도 크론**을 켠다(CTO ③). 방법은 기존 런북 그대로다
  (`docs/OWNER_RUNBOOK_IAP_2026-09-11.md` ⑨): Supabase → Database → **Cron Jobs** 에서 **1시간마다**
  `POST https://olvkpaldrwvtexxpoaag.supabase.co/functions/v1/iap-reconcile` · 헤더 `x-cron-secret: <CRON_SECRET 값>`.
  기대 응답 `{"ok":true,"status":"RAN",…}` — `NOT_CONFIGURED` 가 나오면 `CRON_SECRET` 시크릿이 없는 것이다.
  ⚠ **3일 안에 승인되지 않은 구매는 구글이 자동 환불한다** — 그래서 실구매를 시작하는 날 함께 켠다.

## ⑤ 되돌리기 (필요할 때만)

> DB 는 아래 순서의 **역순**으로 되돌린다. Edge 는 이전 커밋을 체크아웃한 폴더에서 다시 배포한다.

```sql
-- ⑤-4 만료 예약
create or replace view public.duk_spendable as
  with led as (select user_id, bucket, sum(delta)::integer as balance from public.duk_ledger
               where expires_at is null or expires_at > now() group by user_id, bucket),
       held as (select user_id, coalesce(sum(alloc_plus),0) h_plus, coalesce(sum(alloc_reward),0) h_reward,
                       coalesce(sum(alloc_paid),0) h_paid
                from public.duk_reserve where status = 'RESERVED' group by user_id)
  select l.user_id, l.bucket,
         l.balance - case l.bucket when 'PLUS' then coalesce(h.h_plus,0) when 'REWARD' then coalesce(h.h_reward,0)
                                   when 'PAID' then coalesce(h.h_paid,0) else 0 end as spendable
  from led l left join held h on h.user_id = l.user_id;
alter view public.duk_spendable set (security_invoker = true);
revoke select on table public.duk_spendable from anon;

-- ⑤-3 대표 대상자
drop function if exists public.set_primary_subject(uuid);

-- ⑤-5 네이버 조회
drop function if exists public.find_auth_user_by_email(text);

-- ⑤-1 환불(F-01 · GAP-01) — 함수만 옛 판으로 되돌린다. `original_amount` 칸은 그대로 두어도 해가 없다.
drop trigger if exists duk_ledger_paid_never_negative on public.duk_ledger;

-- ⑤-2 프리미엄 — 20260846 판의 reserve_session_duk 를 다시 적용한다(그 파일 본문을 그대로 실행).

-- 이력 지우기 (되돌린 것만)
delete from supabase_migrations.schema_migrations where version in ('20260929000000','20260928000000','20260927000000','20260926000000','20260925000000','20260924000000');
notify pgrst, 'reload schema';
```

## ⑥ 생일 5덕 크론 켜기 (**오너 승인 2026-09-21 — 이번에 켠다**)

**⑥-1 켜기 전에 확인** — 기대: `fn 1 · reward 5`

```sql
select (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='run_birthday_notifications') as fn, (select coalesce(birthday_reward,-1) from public.economy_policy where is_active limit 1) as reward;
```

**⑥-2 등록** — 한국 시간 새벽 0시 5분에 돈다.

```sql
select cron.schedule('birthday-duk', '5 15 * * *', $$select public.run_birthday_notifications()$$);
```

**⑥-3 확인** — 다음 날 아침. 기대: `birthday-duk` 가 `active = true` 로 보인다.

```sql
select jobname, schedule, active from cron.job order by jobid;
```

> 켜면 생일인 사용자에게 **지갑 +5덕**과 **앱 안 "새 소식" 1건**이 간다. **푸시는 가지 않는다**(기기 토큰이 아직 없다).
> 끄려면: `select cron.unschedule('birthday-duk');`

## ⑦ 올린 뒤 오너가 볼 것 (5분)

1. 실사이트 로그인 → 지갑에 잔액이 보인다
2. 상담 1회 → 답이 오고 5덕이 빠진다
3. 오늘의 운세 → 결과가 나온다(동의 전이면 **동의 시트**가 뜬다 — 전에는 "불러오지 못했어요" 였다)
4. 공유 링크 하나를 만들어 **다른 브라우저**에서 연다 → 미리보기가 보인다
5. MY → 대상자에서 다른 대상을 "본인으로 지정" → 대표가 바뀌고, 대표는 지울 수 없다고 안내가 보인다
6. 🆕 프리미엄 화면 → 이미 만든 리포트가 있으면 **[저장된 리포트 보기]**(무료)가 먼저 보이고, 유료는 **[새로 만들기 · 50덕]** 으로 값이 적혀 있다

## ⑧ 이번에 하지 않는 것

- 애플 IAP(계정 뒤) · 푸시 · 이메일(V1.1) · 관리자 오류 삼키기 25곳(다음 묶음)
- `iap-reconcile` 크론(위 ④ — 실구매 확인 뒤)
