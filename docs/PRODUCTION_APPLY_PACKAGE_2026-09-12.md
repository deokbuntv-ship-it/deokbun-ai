# production 통합 적용 패키지 — **동결본** (2026-09-13) · ⚠ CTO 판정 후 실행

> 2026-09-14: **설명만 보강했습니다** — 맨 앞 CTO 요약 · 「창 구간」 절 · 오너 체크리스트 한 장
> (`docs/OWNER_CHECKLIST_PROD_SESSION_2026-09-14.md`).
> 2026-09-14 #2: **명령을 Windows PowerShell 5.1 용으로 고치고 staging 에서 한 번씩 리허설했습니다**(「명령 치는 법」 ·
> `docs/REPORT_2026-09-14b_REHEARSAL.md`). SQL 은 칸 하나에 문장 하나로 나눴습니다(문장 내용은 그대로).
> **마이그레이션 · Edge 는 한 글자도 바뀌지 않았습니다**(동결 테스트 21건 통과).

## 🧾 CTO 요약 — 한 장

| | |
|---|---|
| **단계** | **9** — 한 세션에 ①~⑧, ⑨ 앱 빌드는 Play Console 준비 뒤 따로 (`docs/PLAY_CONSOLE_FIRST_UPLOAD_2026-09-14.md`) |
| **예상 시간** | **1시간 40분 ~ 2시간** (+ ④ 한 시간 뒤 1분 확인) · 오너 혼자 · LLM 1콜(⑦-3 상담 1회) |
| **올리는 것** | 마이그레이션 **9** · Edge **4**(⑤ 에서 `verify-purchase` · `google-rtdn` · `iap-reconcile`, ⑦-2 에서 `chat`) · 웹 병합 **1** · 시크릿 **1**(⑧ 동의 게이트) |
| **가장 위험한 단계** | **⑦ 웹 병합 + ⑦-2 `chat` 배포.** ① 공유 화면이 **처음** 실사이트에 올라가는 순간이다 — ② · ③ · ④ 가 덜 끝났으면 지어낸 리포트를 덕분이 이름으로 퍼뜨리는 길이 열린다(ⓓ 세 조건이 막는다) ② 웹과 `chat` 의 상담 계약이 바뀌는 순간이라 1~2분 실패 창이 생긴다 ③ 병합 뒤에는 **DB 되돌리기가 해법이 아니다**(21 을 되돌리면 #25 가 열린다) — 되돌리는 값이 가장 비싸다 |
| **두 번째로 위험** | ② DB 마이그레이션 — 파일마다 한 트랜잭션이라 중간 실패 시 앞 파일만 들어간다(②-5 가 잡는다). 20 은 상담 완료 표에 트리거를 단다. production 에는 손으로 만든 표 13개가 있다(1-3 이 그 외래키를 본다) |

| # | 마이그레이션 — 한 줄 | 되돌리면 |
|---|---|---|
| 14 | 이름만 다른 중복 메시지 정책 2개 삭제 | 정책 재생성 (런북 ⑨) |
| 15 | AI 원가 표 2개 + 집계 함수 | 원가 화면이 "설치되지 않았습니다" 로 |
| 16 | 공유 시점 스냅샷 · 본문이 바뀌면 공유 자동 해지 | 공유가 클라이언트 본문을 다시 읽는다 |
| 17 | AI 답변 신고 표 | 신고 입구가 동작하지 않는다 |
| 18 | AI 처리 동의 표 · 함수 | ⑧ 게이트를 켤 수 없다 |
| 19 | 인앱 결제 런타임(구글) | 결제 검증이 멈춘다 (production 결제 없음) |
| 20 | 공유 증인(해시) · 백필 함수 · system 메시지 차단 · 조회수 잠금 | ⚠ 처음부터 지어낸 리포트 공유가 다시 열린다 |
| 21 | 답 원문 24시간 정리(C9) · 익명 미리보기 위조 차단(#25) · 궁합 공유 복구 | ⚠ 병합 뒤 단독으로 되돌리지 말 것 (#25) |
| 22 | 이용자 대화 삭제 · 삭제 즉시 답 원문 100% · 궁합 답 연결 · 증인 보존 | 새 웹 · `chat` 은 안전하게 동작 (staging 실측 4/4 · 되돌리기 SQL 은 staging 에서 그대로 확인) |

**멈춤 신호** — ① `user_id` 외래키가 없거나 CASCADE 아님 · 공유≠0 · pg_cron 없음 · HEAD≠`b31bb27` · 인덱스≠63 · 동결 테스트 실패 ·
② dry-run 9줄과 다름 · ②-5 불일치 · ③ 시간 초과 반복 · 안 줄어듦 · ④ `refused` · ⑤ 404 · 게이트 켜져 있음 ·
⑥ 모르는 파일 · "설치되지 않았습니다" · ⑦ ⓓ 미충족 · 배포 실패 · ⑦-3 상담 실패 · 삭제 뒤 `COMPLETED` ·
⑧ 동의 화면 없이 실패 문구.

> ⚠⚠⚠ **실사이트 상담 실패를 이유로 마이그레이션 20 · 21 을 되돌리지 마십시오.** 아래 「창 구간」.

## ⏱ 창 구간 — 실패해도 정상인 것 vs 되돌리거나 멈춰야 하는 신호

> ⚠⚠⚠ **실사이트 상담 실패를 이유로 20 · 21 을 되돌리지 마십시오.**
> ⑦-2 전까지의 실사이트 상담 실패는 **웹과 `chat` 의 계약 차이** 때문이지 DB 때문이 아닙니다(머리말의 순서 변경).
> 20 을 되돌리면 처음부터 지어낸 리포트 공유가, 21 을 되돌리면 익명 미리보기 위조(#25)가 **다시 열리고** —
> 상담은 **그래도 고쳐지지 않습니다.**

| 구간 | 실패해도 정상인 것 (멈추지 않는다) | 되돌리거나 멈춰야 하는 신호 |
|---|---|---|
| **A. ② 적용 뒤 ~ ⑦ 병합 전** | 실사이트 상담 실패("답을 받지 못했어요" · 400) — 1-9 가 실패였다면 원래 그렇다 · 실사이트 화면은 옛 그대로 · Preview 에서는 상담하지 않는다 | ②-5 불일치 → 멈춤. **이 구간만** 되돌리기 절 순서(22 → 21 → …)로 되돌릴 수 있다 · ③ 백필이 줄지 않음 · ④ `refused` · ⑤ 404 |
| **B. ⑦ 병합 ~ 실사이트가 새 화면** | 몇 분 동안 옛 화면이 보인다(Vercel 빌드 중) | Vercel 배포 **실패** → ⑦-2 · ⑧ 로 가지 말고 멈춤 |
| **C. 새 화면 ~ ⑦-2 끝 (1~2분)** | 새 웹의 상담 실패 — 1-9 가 "성공"(production `chat` 이 옛 버전)이었다면 생긴다. ⑦-2 가 끝나면 풀린다 | 없음 — 바로 ⑦-2 |
| **D. ⑦-2 뒤** | 없음 — 여기부터 상담은 되어야 한다 | ⑦-3 상담 실패 → **멈추고 CTO**(DB 되돌리기 아님) · 삭제 뒤 `COMPLETED` → 멈춤 · ⑧ 동의 화면 없이 실패 문구 → 게이트 끄기(⑧) |

---

> 오너가 **한 번의 세션**으로 끝낼 수 있게 만들었습니다. 명령은 그대로 복사하십시오.
>
> 🧊 **동결 (2026-09-13)** — CTO 판정대로 대화·리포트 삭제 묶음이 이 패키지의 **마지막 변경**입니다.
> production 에 올라가는 파일 17개(마이그레이션 9 · Edge 8)는 맨 아래 **「동결 목록」**의 SHA-256 과 같아야 하고,
> 계약 테스트가 그것을 지킵니다(① 의 1-8). 파일 이름은 다른 문서가 가리키고 있어 바꾸지 않았습니다.
>
> ⚠⚠ **순서를 바꾸지 마십시오.** 새 코드가 새 DB 객체를 쓰고, 두 군데는 순서가 바뀌면 **보안 구멍이
> 실사이트에 열립니다**(⑦ 의 ⓓ). 각 단계 끝의 **🛑 멈춤 신호**가 보이면 거기서 멈추고 CTO 에게 보내십시오.
>
> ⚠ **DB 비밀번호는 이 문서에도, 채팅에도, 어떤 파일에도 적지 마십시오.** CLI 가 물으면 터미널에 직접.

```
① 사전 확인 → ② DB 마이그레이션 9건 → ③ 백필(0 까지) → ④ C9 정리 켜기 → ⑤ Edge 3개 배포
           → ⑥ 커밋·푸시 → Preview → ⑦ 웹 병합 → 실사이트 → chat 배포 → 상담·삭제 확인
           → ⑧ AI 동의 게이트 켜기                                                  ⑨ 앱 빌드는 따로
```

| 단계 | 예상 시간 |
|---|---|
| ① 사전 확인 | 15분 |
| ② 마이그레이션 | 15분 (적용 자체는 1분 안팎) |
| ③ 백필 | ① 의 1-6 숫자 × 0.1초 (staging 698건 65초 · production 사용자 0명이면 수 초) |
| ④ C9 정리 켜기 | 5분 (+ 한 시간 뒤 1분 확인) |
| ⑤ Edge 3개 배포 | 5분 |
| ⑥ 커밋·푸시·Preview | 20분 (Preview 빌드 대기 포함) |
| ⑦ 병합·실사이트·chat 배포·상담 확인 | 30분 (production 빌드 대기 포함) |
| ⑧ 동의 게이트 | 10분 |
| **합계** | **약 1시간 40분 ~ 2시간** · ⑨ 는 Play Console 준비 뒤 별도 |

⚠ **순서 변경 1곳 (2026-09-13 · CTO 확인 필요)** — `chat` 배포를 ⑤ 에서 **⑦-2(실사이트가 새 화면이 된 직후)** 로
옮겼습니다. 실사이트(`main` = `28c406a`, 2026-08-15)의 웹은 옛 계약(`{messages}`)으로 상담을 보내고, 이 패키지의
`chat`(2026-08-17 서버 신뢰 계약 이후)은 그 요청을 `400 INVALID_INPUT` 으로 거절합니다. 반대로 새 웹의 요청은 옛
`chat` 이 거절합니다. 그래서 웹과 `chat` 을 **붙여서** 바꿉니다. 같은 이유로 직전판 ②-6 의 "웹이 아직 옛 코드여도
상담은 됩니다" 는 성립하지 않아, 그 확인을 ⑦-3 으로 옮겼습니다. (C1 승인대로 동의 게이트는 ⑧ — 웹 병합 뒤.)

---

## ⌨ 명령 치는 법 — Windows PowerShell 5.1 (2026-09-14 리허설로 확인)

이 문서의 명령은 **오너 PC 의 Windows PowerShell 5.1** 에서 그대로 돌도록 고쳤고, 같은 명령을 이 PC 의
`powershell.exe`(실행 정책 기본값 그대로 · 새 창과 같은 PATH)에서 staging 에 **실제로 한 번씩** 돌려 확인했습니다
(`docs/REPORT_2026-09-14b_REHEARSAL.md`).

| 칸 위의 표시 | 어디에 | 어떻게 |
|---|---|---|
| **▶ PowerShell** | **PowerShell** 창 | **칸 하나 = 명령 한 줄.** 한 칸만 복사 → 붙여 넣기 → Enter → 바로 아래 **기대** 와 맞는지 본 뒤 다음 칸. **여러 칸을 한꺼번에 붙이지 않습니다** |
| **▶ SQL Editor** | Supabase 대시보드 → **production 프로젝트** → SQL Editor | 칸 **통째로** 붙여 넣고 [Run]. PowerShell 에 붙이지 않습니다 |

- `>>` 가 뜨면 명령이 덜 끝났다고 PowerShell 이 기다리는 것입니다 — **Ctrl+C** 로 빠져나와 그 한 줄만 다시 붙이십시오.
- `npx` 가 아니라 **`npx.cmd`** 입니다 — 이 PC 의 실행 정책이 `npx.ps1` 을 막습니다(오너 PC · 리허설 PC 둘 다 실측).
  Supabase CLI 는 **`supabase@2.117.0`** 으로 고정했습니다 — 리허설한 판 그대로 돌게.
- **처음 한 번 묻는 것**: `npx.cmd supabase@2.117.0 …` 을 처음 치면 `Need to install the following packages: supabase@2.117.0
  Ok to proceed? (y)` → **y** Enter (1분 안팎). ⑨ 의 `eas-cli` 도 같습니다.
- **로그인 창이 뜨는 곳**: ① 1-10 에서 `Access token not provided` 가 나오면 `npx.cmd supabase@2.117.0 login` → **브라우저가 열림** →
  로그인 → 다시 1-10 · ⑥ `git push` 첫 회에 **GitHub 로그인 창** · ⑨ EAS 로그인.
- **확인 질문이 뜨는 곳**: ②-4 `db push` → 목록이 다시 나오고 `Do you want to push these migrations …? [Y/n]` → 9줄이 ②-3 과
  같으면 **Y** · 시크릿을 지울 때 `Do you want to unset these function secrets? [y/N]` → **y**.
- **비밀번호**: 이 문서의 명령은 DB 비밀번호를 **묻지 않았습니다**(리허설 — CLI 로그인으로 처리). 그래도 묻는다면 터미널 입력창에만
  직접 치십시오(1-1).
- 한글이 깨져 보이는 출력(`git log` 의 커밋 제목 등)은 괜찮습니다 — 확인은 **해시 · 숫자 · 영문**으로 합니다.

---

## ① 사전 확인 (읽기 전용)

| # | 확인 | 어떻게 | 🛑 멈춤 신호 |
|---|---|---|---|
| 1-1 | **DB 비밀번호를 최근에 리셋했는가** | 기억 확인. 리셋했다면 CLI 에 저장된 값이 낡았습니다 | ② dry-run 이 `password authentication failed` → 터미널에서 새 비밀번호로 다시 연결 |
| 1-2 | **익명 로그인이 꺼져 있는가** | Supabase(production) → Authentication → Sign In / Providers → **Anonymous Sign-Ins** | **켜져 있으면 끄고 진행**: 같은 화면에서 토글을 끄고 Save → 새로고침해서 꺼짐 확인 (staging 은 꺼져 있음 실측: 설정 false + 실제 시도 422) |
| 1-3 | **계정 삭제 외래키** | 아래 SQL 1-3 | `user_id` 세 줄 중 하나라도 없거나 `CASCADE` 가 아니면 멈춤 (광고 칸의 `SET NULL` 은 정상) |
| 1-4 | **실사이트 공유 링크 수** | 아래 SQL 1-4 | **0 이 아니면 멈춤** (아래 설명) |
| 1-5 | **git 상태** | 아래 명령 1-5 | HEAD 가 `b31bb27` 이 아니거나 인덱스가 **63** 이 아니면 멈춤 |
| 1-6 | **완료된 답의 수** (③ 시간 가늠) | 아래 SQL 1-6 | 없음 — 숫자만 적어 두기 |
| 1-7 | **pg_cron 을 쓸 수 있는가** (④) | 아래 SQL 1-7 | 행이 없으면 멈춤 (④ 를 할 수 없다) |
| 1-8 | **동결 확인** — 올릴 파일 17개가 동결 때와 같은가 | 아래 명령 1-8 | 실패하면 멈춤 — 동결 뒤 누가 파일을 고쳤다 |
| 1-9 | **실사이트 상담이 지금 되는가** (기록만) | 실사이트에 로그인 → 상담 1회 | 없음 — 결과만 적어 두기 (아래 설명) |
| 1-10 | **Supabase CLI 준비 · 로그인** | 아래 명령 1-10 | 버전이 `2.117.0` 이 아니면 멈춤 · `Access token not provided` → 로그인 후 다시 |

> SQL Editor 는 칸에 문장이 여럿이면 **마지막 결과만** 보여 줄 수 있습니다 — 그래서 **칸 하나에 문장 하나**로 나눴습니다.

**1-3. 계정 삭제가 기대는 외래키** (docs/M4_HANDMADE_TABLES_AUDIT_2026-09-12.md §5-1) ▶ SQL Editor

```sql
select c.conrelid::regclass::text as table_name,
       a.attname as column_name,
       case c.confdeltype when 'c' then 'CASCADE' when 'n' then 'SET NULL' when 'a' then 'NO ACTION'
                          when 'r' then 'RESTRICT' when 'd' then 'SET DEFAULT' end as delete_rule,
       c.confrelid::regclass::text as refers_to
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
 where c.contype = 'f'
   and c.conrelid in (select to_regclass(t) from unnest(array['public.ad_tracking_events',
                      'public.user_acquisition_attribution', 'public.admin_users']) as t)
 order by 1, 2;
```

**기대**: `user_id` 세 줄 — `ad_tracking_events` · `admin_users` · `user_acquisition_attribution` 모두 `CASCADE | auth.users`.
그 밖의 줄은 정상: `ad_id` · `first_ad_id` · `latest_ad_id` → `SET NULL | advertisements`, `admin_users.created_by` → `NO ACTION | auth.users`
(관리자 계정 전용 — M4 문서 §4). (staging 리허설: 7줄, 위와 같음)
🛑 `user_id` 줄이 **하나라도 없거나 `CASCADE` 가 아니면** 멈춤 — 없으면 탈퇴 뒤 개인 행이 남고, 다른 규칙이면 탈퇴가 실패합니다.

> ⚠ 2026-09-14 리허설에서 고친 조회입니다. 직전판(= M4 문서 §5-1)은 `information_schema` 를 읽었는데, SQL Editor 의 역할은
> `auth.users` 의 주인이 아니라서 **`auth.users` 를 가리키는 외래키가 결과에서 통째로 빠집니다**(staging 실측: `SET NULL` 3줄만 나옴).
> 그대로였다면 확인해야 할 줄은 안 보이고, "CASCADE 가 아닌 줄" 때문에 멈췄을 것입니다.

**1-4. 지금 production 에 살아 있는 공유 링크** ▶ SQL Editor

```sql
select count(*) as 활성공유, min(created_at) as 가장오래된
  from public.report_shares where status = 'active' and revoked_at is null;
```

**기대**: `활성공유 0`.

**1-6. 완료된 답의 수** ▶ SQL Editor

```sql
select count(*) as 완료된답 from public.paid_request_idempotency
 where status = 'COMPLETED' and response_json is not null;
```

**기대**: 숫자 하나 — 적어 두기(③ 시간 가늠).

**1-7. pg_cron** ▶ SQL Editor

```sql
select name, default_version, installed_version from pg_available_extensions where name = 'pg_cron';
```

**기대**: 1행(`pg_cron`).

**1-5. git** — 체크포인트는 커밋됨(`b31bb27`), 묶음 3·4 는 스테이징돼 있어야 한다. ▶ PowerShell — 한 칸씩:

```powershell
cd C:\Development\DeokbunAI-app
```

```powershell
git log --oneline -1
```

**기대**: `b31bb27 feat: …` — 앞 7자리 `b31bb27` 만 보십시오(뒤 한글은 깨져 보여도 됩니다).

```powershell
(git diff --cached --name-only | Measure-Object).Count
```

**기대**: `63` (목록: `C:\Development\owner_inputs\BUNDLE3_4_FILES.txt`).

**1-8. 동결 확인** — 이 문서가 production 에 올리는 파일이 동결 때와 글자까지 같은가. ▶ PowerShell (1-5 의 `cd` 그대로):

```powershell
npx.cmd jest src/features/chat/__tests__/productionPackageFreeze.test.ts
```

**기대**: 끝부분에 `Tests:       21 passed, 21 total`. 🛑 하나라도 실패하면 멈춤.

**1-10. Supabase CLI 준비 · 로그인** ▶ PowerShell:

```powershell
npx.cmd supabase@2.117.0 --version
```

**기대**: `2.117.0`. 처음이면 먼저 `Ok to proceed? (y)` → **y**. (로그인 확인은 ②-3 의 첫 명령이 합니다 —
거기서 `Access token not provided` 가 나오면 아래 한 줄 → 브라우저에서 로그인 → ②-3 을 다시.)

```powershell
npx.cmd supabase@2.117.0 login
```

> **1-9 를 왜 보나**: production 의 `chat` 이 어느 버전인지는 레포에서 알 수 없습니다(접속 금지). 실사이트 웹은
> 옛 계약이라, **성공하면** production `chat` 도 아직 옛 버전입니다 — ⑦-1 과 ⑦-2 사이 1~2분 동안 새 웹의 상담이
> 실패합니다(⑦-2 가 끝나면 풀립니다). **실패하면**("답을 받지 못했어요" 류) production `chat` 은 이미 새 계약이고
> 실사이트 상담은 **지금도 안 되는 상태**입니다(2026-09-06 승격 때 `chat` 이 올라갔다면 이쪽) — ⑦ 이 고칩니다.
> 어느 쪽이든 멈추지 않습니다. 결과는 CTO 보고에 한 줄로 적어 주십시오.

> ⚠ **1-4 가 0 이 아니면 왜 멈추나**: 실사이트(main)에는 공유 화면이 없습니다(2026-09-12 확인). 그런데도
> 공유 링크가 있다면 누군가 API 를 직접 불러 만든 것입니다. 마이그레이션 16 은 기존 공유를 그 시점 본문
> 그대로 스냅샷하므로, 위조본이면 위조본이 보존됩니다.

---

## ② DB 마이그레이션 — **9건**

| # | 파일 | 하는 일 | 판정 |
|---|---|---|---|
| 14 | `20260914000000_drop_legacy_message_policies.sql` | 옛 이름 정책 2개 삭제 (조건 동일한 중복) | 승인 |
| 15 | `20260915000000_model_pricing.sql` | 원가 표 2개 + 집계 함수 | 승인 |
| 16 | `20260916000000_m13_share_server_snapshot.sql` | 공유 시점 스냅샷 + 본문 변경 시 자동 해지 | 승인 |
| 17 | `20260917000000_ai_content_reports.sql` | AI 답변 신고 | 승인 |
| 18 | `20260918000000_ai_processing_consent.sql` | AI 처리 동의 | 승인 |
| 19 | `20260919000000_iap_google_runtime.sql` | 결제 런타임 | 승인 |
| 20 | `20260920000000_share_witness_and_gaps.sql` | 공유 증인 · 백필 함수 · system 메시지 차단 · 조회수 잠금 | 승인 |
| 21 | `20260921000000_answer_retention_and_preview.sql` | C9 답 원문 정리 · 익명 미리보기 위조 차단(#25) · 궁합 공유 복구 | 승인 (2026-09-12 #2) |
| **22** | `20260922000000_conversation_delete.sql` | **이용자 대화 삭제 · 삭제 즉시 답 원문 100% · 궁합 답 연결 · 증인 보존(남은 리포트 재공유용)** | **이번 묶음** |

전부 staging 에 적용돼 있고, 16 · 20 · 21 · 22 는 되돌렸다 다시 올려 **멱등성을 확인**했습니다(22: 아래 되돌리기
SQL 을 staging 에서 그대로 돌림 → `db push` 로 다시 올림 → 파일을 한 번 더 실행해도 상태 같음).

### ②-1 복사 (레포 폴더의 훅이 production ref 를 막으므로)

▶ PowerShell:

```powershell
robocopy "C:\Development\DeokbunAI-app\supabase" "C:\Development\_prodpush\supabase" /E /XD .temp
```

**기대**: 끝의 요약 표에서 **실패(FAILED) 칸이 전부 0**. (robocopy 는 복사에 성공해도 종료 코드가 1 입니다 — 오류가 아닙니다.)

### ②-2 적용 전 확인 조회

**이력 끝** ▶ SQL Editor

```sql
select version from supabase_migrations.schema_migrations order by version desc limit 3;
```

**기대**: 맨 위 `20260913000000`.

**14 가 지울 정책의 현재 정의** — 받아 적는다(되돌리기에 필요) ▶ SQL Editor

```sql
select policyname, cmd, qual, with_check from pg_policies
 where schemaname='public' and tablename='conversation_messages' order by policyname;
```

**기대**: **4행**.

**새 객체가 아직 없는지** ▶ SQL Editor

```sql
select to_regclass('public.model_pricing')               as t15,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='report_shares' and column_name='shared_payload') as c16,
       to_regclass('public.ai_content_reports')          as t17,
       to_regclass('public.ai_processing_consents')      as t18,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='verified_purchases' and column_name='is_test') as c19,
       to_regclass('public.consultation_answer_witness') as t20,
       to_regprocedure('public.run_answer_retention(integer)') as f21,
       to_regprocedure('public.link_compatibility_answer(text,uuid)') as f22,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='paid_request_idempotency' and column_name='conversation_id') as c22;
```

**기대**: 새 객체 전부 `null`/`0`.
🛑 **새 객체가 하나라도 이미 있으면 멈춤** — 누가 먼저 적용한 것입니다.

### ②-3 dry-run — **목록이 정확히 같을 때만 ②-4**

▶ PowerShell — 한 칸씩:

```powershell
cd C:\Development\_prodpush
```

```powershell
npx.cmd supabase@2.117.0 db push --dry-run --project-ref olvkpaldrwvtexxpoaag
```

**기대**: `Initialising login role...` → `Connecting to remote database...` 가 먼저 나오고(비밀번호를 묻지 않는다는 뜻), 이어서:

```
Would push these migrations:
 • 20260914000000_drop_legacy_message_policies.sql
 • 20260915000000_model_pricing.sql
 • 20260916000000_m13_share_server_snapshot.sql
 • 20260917000000_ai_content_reports.sql
 • 20260918000000_ai_processing_consent.sql
 • 20260919000000_iap_google_runtime.sql
 • 20260920000000_share_witness_and_gaps.sql
 • 20260921000000_answer_retention_and_preview.sql
 • 20260922000000_conversation_delete.sql
```

🛑 **한 줄이라도 다르면 멈춤.** `--include-all` 을 요구해도 멈춤. `Access token not provided` → 1-10 의 `login` 후 다시.

### ②-4 적용

▶ PowerShell (②-3 의 `cd` 그대로):

```powershell
npx.cmd supabase@2.117.0 db push --project-ref olvkpaldrwvtexxpoaag
```

**기대**: 목록 9줄이 다시 나오고 `Do you want to push these migrations …? [Y/n]` → ②-3 과 같으면 **Y** Enter →
`Applying migration 20260914000000_…` 부터 `…20260922000000_conversation_delete.sql` 까지 9줄 → `Finished supabase db push.`
🛑 `ERROR` 가 나오면 멈춤 — 그 앞까지는 적용됐습니다(파일마다 한 트랜잭션). ②-5 로 어디까지 들어갔는지 보고 CTO 에게.

### ②-5 적용 후 확인 조회 — 칸 하나씩 (하나라도 기대와 다르면 멈춤)

**ⓐ 이력** ▶ SQL Editor

```sql
select version from supabase_migrations.schema_migrations order by version desc limit 10;
```

**기대**: `20260922000000` 이 맨 위 · 10번째가 `20260913000000`

**ⓑ 표 넷** ▶ SQL Editor

```sql
select to_regclass('public.ai_content_reports')          as reports,
       to_regclass('public.ai_processing_consents')      as consents,
       to_regclass('public.consultation_answer_witness') as witness,
       to_regclass('public.model_pricing')               as pricing;
```

**기대**: 네 칸 전부 `null` 아님

**ⓒ 함수** ▶ SQL Editor

```sql
select proname from pg_proc
 where pronamespace = 'public'::regnamespace
   and proname in ('get_shared_report','witnessed_share_payload','record_answer_witness','backfill_answer_witness',
                   'grant_ai_consent','admin_ai_content_reports','record_purchase_runtime',
                   'answer_witness_backlog','run_answer_retention','purge_conversation_answers',
                   'link_compatibility_answer')
 order by proname;
```

**기대**: **11행**

**ⓓ 14 가 실제로 지웠는지** (drop if exists 는 이름이 틀려도 조용히 성공한다) ▶ SQL Editor

```sql
select policyname from pg_policies
 where schemaname='public' and tablename='conversation_messages' order by 1;
```

**기대**: **2행만** — `messages_insert_via_conversation` · `messages_select_via_conversation`

**ⓔ 트리거** ▶ SQL Editor

```sql
select tgname from pg_trigger
 where tgname in ('report_shares_snapshot_ins','report_shares_freeze_upd','consultation_reports_revoke_shares',
                  'paid_request_idempotency_witness','conversation_messages_role_guard','conversations_purge_answers')
 order by 1;
```

**기대**: **6행**

**ⓕ RLS** ▶ SQL Editor

```sql
select tablename, rowsecurity from pg_tables where schemaname='public'
   and tablename in ('ai_content_reports','ai_processing_consents','consultation_answer_witness','model_pricing','fx_rate');
```

**기대**: 다섯 행 모두 `rowsecurity = true`

**ⓖ 증인 표 정책** ▶ SQL Editor

```sql
select count(*) as witness_policies from pg_policies
 where schemaname='public' and tablename='consultation_answer_witness';
```

**기대**: `witness_policies 0`

**ⓗ 21 — 상태 CHECK 에 EXPIRED 가 있고 하나뿐인가** ▶ SQL Editor

```sql
select pg_get_constraintdef(oid) as status_check from pg_constraint
 where conrelid = 'public.paid_request_idempotency'::regclass and contype = 'c'
   and pg_get_constraintdef(oid) ilike '%PROCESSING%';
```

**기대**: **1행** · `… 'PROCESSING', 'COMPLETED', 'EXPIRED' …`

**ⓘ 21 — 익명 미리보기가 스냅샷을 읽는가** ▶ SQL Editor

```sql
select position('v_share.shared_payload' in pg_get_functiondef('public.get_shared_report_preview(text)'::regprocedure)) > 0
       as preview_reads_snapshot;
```

**기대**: `true`

**ⓙ 22 — 이용자 대화 삭제 · 답 연결 · 증인 보존** ▶ SQL Editor

```sql
select
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'conversations'
      and policyname = 'conversations_delete_own' and cmd = 'DELETE') as delete_policy,
  (select count(*) from information_schema.columns where table_schema = 'public'
      and table_name = 'paid_request_idempotency' and column_name = 'conversation_id') as link_column,
  has_function_privilege('anon', 'public.link_compatibility_answer(text,uuid)', 'execute') as anon_can_link,
  has_function_privilege('authenticated', 'public.link_compatibility_answer(text,uuid)', 'execute') as user_can_link,
  position('i.conversation_id = old.id' in pg_get_functiondef('public.purge_conversation_answers()'::regprocedure)) > 0 as purge_uses_link,
  position('consultation_answer_witness' in pg_get_functiondef('public.purge_conversation_answers()'::regprocedure)) = 0 as purge_keeps_witness;
```

**기대**: `delete_policy 1` · `link_column 1` · `anon_can_link false` · `user_can_link true` · `purge_uses_link true` · `purge_keeps_witness true`

🛑 **하나라도 다르면 멈춤.** (staging 실측 2026-09-13 · 2026-09-14 리허설: ⓐ~ⓙ 모두 기대와 같음 — ⓐ 는 staging 이 이미 22 까지라 같은 모양)

### ②-6 상담 실동작은 ⑦-3 에서

직전판은 여기서 실사이트 상담 1회로 증인 행을 확인했습니다. **옮겼습니다** — 실사이트 웹은 옛 계약이라 20~22 가
건드린 상담 완료 경로(재전송 표 · 증인 트리거)를 지나지 않습니다(머리말의 순서 변경). 이 경로는 새 웹과 새 `chat` 이
함께 올라간 ⑦-3 에서 처음 실제로 돕니다. 그 전까지의 보증은 ②-5 의 구조 확인과 staging 실측입니다(골든 미니팩
완료 25건 → 증인 25/25 · 대화 연결 25/25 · staging 최근 8시간 완료 113건 중 증인 111건을 모두 트리거가 완료 5초
안에 씀, 없는 2건은 21 본문이 대화 삭제 때 지운 것 — 설계대로).

---

## ③ 백필 — 이전 답의 증인 채우기 · **결과가 0 이 될 때까지**

마이그레이션 20 **이전**에 한 상담에는 증인이 없습니다. 그대로면 그 상담으로 만든 정상 리포트가 **빈 공유**가
됩니다(staging 표본 5/5). ④ 의 정리는 이게 끝나야 돌 수 있습니다 — 백필은 원문이 있어야 하기 때문입니다.

**3-1** ▶ SQL Editor

```sql
select public.backfill_answer_witness(300);
```

**기대**: 숫자 하나(이번에 채운 수). **0** 이 될 때까지 같은 칸을 다시 [Run](한 번 30초 안팎). 끝나면:

**3-2** ▶ SQL Editor

```sql
select public.answer_witness_backlog() as 남은것;
```

**기대**: `0`. (staging: 698 → 398 → 98 → 0, 세 번 · 24초 · 30초 · 10초)
🛑 한 번이 **시간 초과**로 실패하면 숫자를 `100` 으로 줄여 다시. 두 번 연속 줄지 않으면 멈춤.

---

## ④ C9 정리 켜기 — **③ 의 남은것이 0 일 때만**

⚠ 순서 보장은 **코드에도** 있습니다: 증인이 없는 답이 하나라도 남아 있으면 `run_answer_retention` 은
아무것도 지우지 않고 `{"status":"refused","reason":"BACKFILL_INCOMPLETE"}` 를 돌려줍니다(staging 실측).
주기 명령은 **백필 한 번 → 정리** 순서라, 그 사이 트리거가 드물게 놓친 답도 스스로 채웁니다.

**4-1. pg_cron 켜기** (Dashboard → Integrations → Cron 에서 켜도 같다) ▶ SQL Editor

```sql
create extension if not exists pg_cron;
```

**기대**: `Success. No rows returned` (이미 켜져 있으면 알림만 — 괜찮다).

**4-2. 한 번 손으로 돌려 본다** ▶ SQL Editor

```sql
select public.run_answer_retention(1000);
```

**기대**: `{"status": "ok", "answersExpired": N, "snapshotsCleared": M, "backlog": 0}` —
N 은 24시간이 지난 답 수. `answersExpired` 가 1000 이면 4-2 를 한 번 더.
🛑 `"status": "refused"` → ③ 으로 돌아가십시오.

**4-3. 매시 17분에 돌게 건다** ▶ SQL Editor (두 줄이지만 **한 문장** — 칸 통째로)

```sql
select cron.schedule('answer-retention', '17 * * * *',
  $$select public.backfill_answer_witness(300); select public.run_answer_retention(1000);$$);
```

**기대**: 숫자 하나(작업 번호).

**4-4. 확인 (바로)** ▶ SQL Editor — 두 칸

```sql
select count(*) as 창지난원문 from public.paid_request_idempotency
 where status = 'COMPLETED' and expires_at <= now();
```

**기대**: `창지난원문 0`.

```sql
select jobname, schedule from cron.job where jobname = 'answer-retention';
```

**기대**: 1행 · `answer-retention` · `17 * * * *`.

**4-5. 확인 (한 시간 뒤 · 17분이 지난 다음)** ▶ SQL Editor

```sql
select status, return_message, start_time from cron.job_run_details
 where jobid = (select jobid from cron.job where jobname = 'answer-retention')
 order by start_time desc limit 3;
```

**기대**: 맨 위 `succeeded`. (staging: 매분 걸어 2회 `succeeded` 확인 뒤 매시로 바꿈)

> 정리가 하는 일: ① 재생 창(24시간)이 지난 답 원문을 지우고 요청 식별자·시각만 남긴다(`EXPIRED`) ② 해지·만료된
> 공유의 스냅샷을 비운다. 지운 원문은 되살릴 수 없습니다 — 그게 목적입니다.

---

## ⑤ Edge 배포 — **3개** (`chat` 은 ⑦-2 — 머리말의 순서 변경)

▶ PowerShell — 한 칸씩:

```powershell
cd C:\Development\_prodpush
```

```powershell
npx.cmd supabase@2.117.0 functions deploy verify-purchase --project-ref olvkpaldrwvtexxpoaag
```

```powershell
npx.cmd supabase@2.117.0 functions deploy google-rtdn --project-ref olvkpaldrwvtexxpoaag
```

```powershell
npx.cmd supabase@2.117.0 functions deploy iap-reconcile --project-ref olvkpaldrwvtexxpoaag
```

**기대** (칸마다): `WARNING: Docker is not running` 이 먼저 나와도 **정상**(Docker 없이 올립니다) → `Uploading asset (…)` 몇 줄 →
끝에 `Deployed Functions` 가 든 줄(프로젝트 `olvkpaldrwvtexxpoaag` · 함수 이름). 🛑 `Error` 로 끝나면 멈춤. (staging 리허설: 세 칸 모두 이 모양)

⚠ `_prodpush` 는 ②-1 의 복사본입니다. ②-1 이후에 레포를 고쳤다면 다시 복사하십시오. ⚠ 여기서 `chat` 을 올리지
마십시오 — 실사이트 웹이 아직 옛 계약이라, 올리는 순간부터 ⑦ 이 끝날 때까지 실사이트 상담이 모두 실패합니다.

| 함수 | 이번 배포로 바뀌는 동작 |
|---|---|
| `verify-purchase` | 키가 없으면 `NOT_CONFIGURED` 로 실패(지급 없음). production 에 결제가 없으므로 영향 없음 |
| `google-rtdn` | 인증 설정이 없으면 처리 안 함(503) |
| `iap-reconcile` | 크론 시크릿 없이 부르면 401 |

**확인** ▶ PowerShell — 한 칸씩 (`curl` 이 아니라 **`curl.exe`** — PowerShell 5.1 의 `curl` 은 다른 명령입니다):

```powershell
curl.exe -s -o NUL -w "%{http_code}\n" -X POST https://olvkpaldrwvtexxpoaag.supabase.co/functions/v1/verify-purchase
```

**기대**: `401`. 🛑 `404` 면 배포 안 됨.

```powershell
npx.cmd supabase@2.117.0 secrets list --project-ref olvkpaldrwvtexxpoaag | Select-String AI_CONSENT_ENFORCED
```

**기대**: **아무것도 나오지 않음**(게이트 시크릿 없음). 🛑 한 줄이라도 나오면 지금 실사이트 상담이 막혀 있는 것 — 먼저 끄십시오 (`Do you want to unset these function secrets? [y/N]` 를 물으면 **y** · 끝에 `Finished supabase secrets unset.` · 이미 없으면 `Secret not found with given name` — 그것도 괜찮습니다):

```powershell
npx.cmd supabase@2.117.0 secrets unset AI_CONSENT_ENFORCED --project-ref olvkpaldrwvtexxpoaag
```

---

## ⑥ 커밋 · 푸시 → Preview

### ⑥-1 커밋 두 개 (체크포인트는 이미 커밋·푸시됨 — `b31bb27`)

▶ PowerShell — **한 칸씩, 순서대로**:

```powershell
cd C:\Development\DeokbunAI-app
```

**1) 묶음 3·4** — 이미 스테이징된 63 파일 그대로:

```powershell
git commit -F C:\Development\owner_inputs\BUNDLE3_4_COMMIT_MSG.txt
```

**기대**: `[admin/master-operations-content xxxxxxx] feat: …` 와 `63 files changed`.

**2) 묶음 5·6** (2026-09-12 #2 · 2026-09-13 · 2026-09-14) — 커밋 하나로:

```powershell
git add -A
```

**기대**: 아무것도 안 나오거나 `LF will be replaced by CRLF` 경고만 — 괜찮습니다.

```powershell
(git diff --cached --name-only | Measure-Object).Count
```

**기대**: `BUNDLE5_6_FILES.txt` 의 줄 수와 같은 숫자.

```powershell
Compare-Object (Get-Content C:\Development\owner_inputs\BUNDLE5_6_FILES.txt) (git diff --cached --name-only)
```

**기대**: **아무것도 나오지 않음**(두 목록이 같음). 🛑 `=>` 나 `<=` 가 붙은 줄이 나오면 멈춤 — 모르는 파일이 섞였다.

```powershell
git commit -F C:\Development\owner_inputs\BUNDLE5_6_COMMIT_MSG.txt
```

**기대**: `… files changed` (위 숫자와 같음).

```powershell
git push origin admin/master-operations-content
```

**기대**: `b31bb27..xxxxxxx  admin/master-operations-content -> admin/master-operations-content`. 처음이면 **GitHub 로그인 창**이 뜰 수 있습니다.

**기대 (2 의 목록)**: `C:\Development\owner_inputs\BUNDLE5_6_FILES.txt` 와 같은 파일들.
(`BUNDLE5_COMMIT_MSG.txt` · `BUNDLE5_FILES.txt` 는 직전판 것입니다 — 쓰지 마십시오.)
🛑 목록에 모르는 파일(빌드 산출물 · `dist/` · `.env`)이 있으면 커밋하지 말고 멈춤.

### ⑥-2 Preview 확인 (⚠ Preview 도 production DB 를 봅니다 — **쓰기 행동 금지**)

`docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md` ② 목록 + 아래 다섯:

| # | 확인 | 기대 |
|---|---|---|
| 8 | 관리자 → **AI 답변 신고** | 목록 화면(비어 있음). "설치되지 않았습니다" 가 **아니어야** 함 |
| 9 | 관리자 → AI 사용량 → 원가 카드 | "가격 미확인". "설치되지 않았습니다" 가 **아니어야** 함 |
| 10 | MY → **AI 처리 동의** 섹션 | 보인다 (보기만) |
| 11 | 상담 답변 아래 **"이 답변 신고하기"** | 보인다 (보기만) |
| 12 | MY → 분석 대상자 관리 → 상담 기록 → 상담마다 **[상담 삭제]** · 운세우편함 → 보고서 → **[보고서 삭제]** | 보인다 (**누르지 말 것** — production 기록이 지워집니다) |

🛑 하나라도 "설치되지 않았습니다" 면 ② 가 반영되지 않은 것 — 병합하지 말고 멈춤.
(Preview 에서 상담은 하지 마십시오 — `chat` 은 ⑦-2 에서 올라갑니다.)

---

## ⑦ 웹 병합 → 실사이트 확인

### ⓓ ⚠⚠ 병합 조건 — **셋 다** 참일 때만

1. ②-5 가 전부 기대대로
2. ③ 의 `남은것 = 0`
3. ④-4 의 `창지난원문 = 0`

> **왜**: 이 병합이 **공유 화면을 실사이트에 처음 올립니다.** production DB 에는 옛 `get_shared_report` 와
> 옛 익명 미리보기가 이미 있습니다. ② 전에 병합하면 **지어낸 리포트를 덕분이 이름으로 공유하는 경로**가
> 실사이트에 열리고(staging 실측: 전체 읽기 5칸 노출 · 익명 미리보기에 지어낸 결론), ③ 전에 병합하면
> 이전 상담으로 만든 리포트가 빈 페이지로 공유됩니다.

GitHub → Pull requests → New → base `main` ← compare `admin/master-operations-content` → Merge.

### ⑦-1 병합 뒤 확인

`docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md` ⑤ 목록 그대로 + 실사이트에서 ⑥-2 의 8~12 (12 는 보기만).

🛑 실사이트가 옛 화면이면 Vercel 배포가 끝나지 않은 것 — 기다린 뒤 다시. 배포가 실패했으면 ⑦-2 · ⑧ 로 가지 말 것.

### ⑦-2 `chat` 배포 — **실사이트가 새 화면인 것을 본 직후** (여기서 멈추지 말고 바로)

▶ PowerShell — 한 칸씩:

```powershell
cd C:\Development\_prodpush
```

```powershell
npx.cmd supabase@2.117.0 functions deploy chat --project-ref olvkpaldrwvtexxpoaag
```

**기대**: `WARNING: Docker is not running`(정상) → `Uploading asset (chat): …` 네 줄(deno.json · index.ts · globalSpendGuard.ts · serverBundle.mjs) →
끝에 `Deployed Functions` 가 든 줄. (staging 리허설: 이 모양)

| 함수 | 이번 배포로 바뀌는 동작 |
|---|---|
| `chat` | 새 웹의 상담 계약을 받는다 · 답을 소유 확인한 대화에 연결한다(상담 · 요약 — 궁합은 앱이 대화를 만든 뒤 연결) · 연결 쓰기가 실패해도 상담은 계속된다 · 동의 게이트는 시크릿이 없으면 꺼져 있다 |

⚠ ⑦-1 과 이 배포 사이에는 새 웹의 상담이 실패할 수 있습니다(1-9 가 "성공" 이었다면). 배포는 1분 안팎입니다.

### ⑦-3 상담 · 삭제 실동작 (실사이트 · 오너 계정 · 덕 5 · LLM 1콜)

1. 실사이트에서 **상담 1회** — 답을 받는다.
2. 아래 SQL — 방금 답이 대화에 연결됐고 증인이 남았는가:

```sql
select workload, conversation_id is not null as 대화연결, status, created_at
  from public.paid_request_idempotency where workload = 'chat' order by created_at desc limit 1;
select workload, cardinality(digests) as 해시수, created_at
  from public.consultation_answer_witness order by created_at desc limit 1;
```

3. MY → 분석 대상자 관리 → 상담 기록 → 방금 상담의 **[상담 삭제]** → **[삭제]** — 목록에서 사라진다.
4. 2 의 첫 줄을 다시 실행.

**기대**: (2) 방금 시각 · `대화연결 true` · `COMPLETED` · 증인 방금 시각 · 해시 수 수백 개 → (4) `EXPIRED`.
(staging 실측 2026-09-13: 상담·요약·궁합 답 3/3 이 삭제와 동시에 `EXPIRED` · 남의 대화 삭제 0행 · 남의 궁합 연결 false)

🛑 **1 이 실패하면** 멈추고 CTO 에게(화면 문구 · 시각). ⚠ 이때 DB 를 되돌리지 마십시오 — 공유 화면이 이미 실사이트에
있어 21 을 되돌리면 #25(익명 미리보기 위조)가 열립니다.
🛑 **4 가 `COMPLETED` 로 남으면** 멈춤 — 삭제가 답 원문을 지우지 못한 것(`대화연결` 이 false 였다면 ⑦-2 가 옛 `chat`).

---

## ⑧ AI 동의 게이트 켜기 — 웹 병합 확인 뒤 (C1 승인)

▶ PowerShell:

```powershell
npx.cmd supabase@2.117.0 secrets set AI_CONSENT_ENFORCED=true --project-ref olvkpaldrwvtexxpoaag
```

**기대**: `Finished supabase secrets set.`

### ⑧-1 확인 (세 가지)

| # | 행동 | 기대 |
|---|---|---|
| 1 | 동의하지 않은 계정으로 상담 | **AI 처리 동의 화면**이 뜬다(체크박스 비어 있음). 동의 없이는 진행 안 됨 |
| 2 | 동의 → 상담 | 정상 답변 |
| 3 | MY → AI 처리 동의 → **철회** → 다시 상담 | 동의 화면이 다시 뜬다 |

🛑 **동의 화면 없이 "지금 처리하지 못했어요" 류가 뜨면 즉시 끄십시오** (웹이 옛 코드라는 뜻 · `[y/N]` 를 물으면 **y**):

```powershell
npx.cmd supabase@2.117.0 secrets unset AI_CONSENT_ENFORCED --project-ref olvkpaldrwvtexxpoaag
```

⚠ 이 게이트는 출시 시점에 켜져 있어야 합니다(애플 5.1.2(i)). 켠 뒤로는 끄지 마십시오.

---

## ⑨ 앱 빌드 — **따로** (Play Console 준비 뒤)

⚠ **커밋한 뒤에 빌드하십시오.** EAS 는 커밋되지 않은 변경까지 올려 빌드하면서 빌드 기록에는 **HEAD 커밋
해시만** 남깁니다(2026-09-10 빌드: 해시 `455a249` 인데 번들에는 커밋 안 된 묶음 3 기능이 들어 있었다).
스토어 빌드는 커밋에서 재현될 수 있어야 합니다. ⑥ 이 끝나 작업 트리가 깨끗한지부터 봅니다.

▶ PowerShell — 한 칸씩:

```powershell
cd C:\Development\DeokbunAI-app
```

```powershell
git status --short
```

**기대**: **아무것도 나오지 않음**.

```powershell
npx.cmd expo install --check
```

**기대**: `Dependencies are up to date`.

```powershell
npx.cmd eas-cli@latest build --platform android --profile production
```

**기대**: 처음이면 `Ok to proceed? (y)` → **y** · EAS 로그인이 풀려 있으면 로그인(이메일 · 비밀번호 또는 브라우저) · 끝에 빌드 주소.
🛑 `git status` 에 무엇이든 나오면 빌드하지 말 것.

- `app.json` 의 `expo-iap` 줄은 **이미 들어가 있습니다**(오너 적용 · 준비한 diff 와 같음 · expo-doctor 21/21 ·
  묶음 3·4 커밋에 포함).
- target API: 같은 SDK 설정으로 만든 빌드 로그 `minSdk 24 · compileSdk 36 · targetSdk 36` — 구글 요구 충족.
- 이 빌드부터 앱에도 **상담 · 보고서 삭제**가 들어갑니다(⑥ 의 묶음 5·6 커밋).
- 스토어 문구: `docs/STORE_LISTING_COPY_2026-09-13.md` — 계약 테스트를 지난 붙여 넣기용. 제출 전 확인 둘(심사관 로그인
  수단 · 심사 노트의 "별도 동의" 는 ⑧ 뒤에만 참)이 그 문서 §4 에 있습니다.

---

## 되돌리기 — **적용의 역순** (22 → 21 → 20 → … → 14)

### 22 — 대화 삭제 (staging 에서 이 글자 그대로 돌려 확인한 SQL · 2026-09-13)

SQL 편집기에 **통째로** 붙여 한 번에 실행합니다(`begin` … `commit` — 중간에 실패하면 아무것도 바뀌지 않습니다).

```sql
-- 마이그레이션 22 (20260922000000_conversation_delete.sql) 되돌리기 — production 통합 적용 패키지 「되돌리기 · 22」
-- staging 에서 실제로 돌려 확인한 파일이다(2026-09-13). 통째로 한 번에 실행한다 — begin/commit 으로 묶여 있어
-- 중간에 실패하면 아무것도 바뀌지 않는다. ⚠ 순서를 바꾸지 말 것:
--   ② 트리거 함수를 21 본문으로 되돌린 **뒤에** ③ 연결 칸을 지운다. 22 의 본문은 그 칸을 읽으므로, 칸이 먼저
--   사라지면 대화 삭제 — 회원 탈퇴의 CASCADE 포함 — 가 이 트리거에서 실패한다.
-- 되돌린 뒤에도 새 앱·새 chat Edge 는 동작한다: 삭제 버튼은 0행 → "삭제하지 못했어요", 궁합 연결은 조용히
-- 실패, Edge 의 연결 쓰기는 결과를 보지 않는다. 연결이 없어진 답 원문은 21 의 24시간 정리가 지운다.
begin;

-- ① 이용자 대화 삭제 정책 · 궁합 답 연결 함수
drop policy if exists conversations_delete_own on public.conversations;
drop function if exists public.link_compatibility_answer(text, uuid);

-- ② 대화 삭제 트리거 함수 — 20260921000000 의 본문 그대로 (트리거 자체는 21 과 같아 손대지 않는다)
create or replace function public.purge_conversation_answers()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- ① 그 대화의 답 원문
  update public.paid_request_idempotency i
     set status = 'EXPIRED', response_json = null, updated_at = clock_timestamp()
    from public.consultation_decisions d
   where d.conversation_id = old.id
     and i.user_id = d.user_id and i.workload = d.workload and i.request_id = d.request_id
     and i.status = 'COMPLETED';

  -- ② 그 답의 증인 (지운 대화에서 나온 해시)
  delete from public.consultation_answer_witness w
   using public.consultation_decisions d
   where d.conversation_id = old.id
     and w.user_id = d.user_id and w.workload = d.workload and w.request_id = d.request_id;

  -- ③ 그 대화 리포트의 공유 — 해지 + 스냅샷 비움
  update public.report_shares s
     set status = 'revoked', revoked_at = coalesce(s.revoked_at, now()), shared_payload = null
    from public.consultation_reports r
   where r.conversation_id = old.id
     and s.report_id = r.id
     and (s.status = 'active' or s.revoked_at is null or s.shared_payload is not null);

  return old;
end;
$$;

-- ③ 재전송 행의 대화 연결 칸
drop index if exists public.paid_request_idempotency_conversation_idx;
alter table public.paid_request_idempotency drop column if exists conversation_id;

-- ④ 이력
delete from supabase_migrations.schema_migrations where version = '20260922000000';

commit;
notify pgrst, 'reload schema';
```

⚠ 22 만 되돌려도 새 웹·새 `chat` 은 동작합니다(staging 실측 4/4): 상담 정상 · 삭제 버튼은 0행 → "삭제하지 못했어요" ·
궁합 연결은 조용히 실패 · 탈퇴 CASCADE 와 같은 트리거 경로 정상. 연결을 잃은 답 원문은 21 의 24시간 정리가 지웁니다.
⚠ 되돌린 동안 처리방침 §5·§6 의 "대화 삭제" 문장은 사실이 아닙니다 — 하루 넘게 되돌려 둘 거라면 CTO 에게.

### 21 — C9 · 익명 미리보기 · 궁합

```sql
select cron.unschedule('answer-retention');   -- ④ 를 했다면
drop trigger if exists conversations_purge_answers on public.conversations;
drop function if exists public.purge_conversation_answers();
drop function if exists public.run_answer_retention(integer);
drop function if exists public.answer_witness_backlog();
-- report_shares_freeze · witnessed_share_payload 는 20260920000000 의 본문, get_shared_report_preview 는
-- 20260906000000 의 본문을 그대로 실행해 되돌린다.
-- 상태 CHECK: EXPIRED 행(원문 없는 키)은 지워도 동작이 같다 — acquire 가 없는 것으로 다룬다
delete from public.paid_request_idempotency where status = 'EXPIRED';
alter table public.paid_request_idempotency drop constraint paid_request_idempotency_status_check;
alter table public.paid_request_idempotency
  add constraint paid_request_idempotency_status_check check (status in ('PROCESSING', 'COMPLETED'));
delete from supabase_migrations.schema_migrations where version = '20260921000000';
```

⚠ 21 을 되돌리면 **익명 미리보기가 다시 클라이언트 본문을 읽습니다(#25)**. 웹에 공유 화면이 올라간 뒤라면
21 만 따로 되돌리지 마십시오. 이미 지운 답 원문은 되살릴 수 없습니다.

### 20 — 공유 증인

```sql
drop trigger if exists paid_request_idempotency_witness on public.paid_request_idempotency;
drop trigger if exists conversation_messages_role_guard on public.conversation_messages;
drop function if exists public.record_answer_witness();
drop function if exists public.backfill_answer_witness(integer);
drop function if exists public.conversation_messages_role_guard();
drop function if exists public.witnessed_share_payload(uuid, jsonb);
drop table if exists public.consultation_answer_witness;
drop function if exists public.jsonb_string_leaves(jsonb);
drop function if exists public.witness_digest(text);
drop function if exists public.witness_skeleton(text);
-- report_shares_snapshot · report_shares_freeze 는 20260916000000 의 두 함수 본문을 그대로 실행
delete from supabase_migrations.schema_migrations where version = '20260920000000';
```

⚠ 20 을 되돌리면 "처음부터 위조한 리포트 공유" 가 다시 열립니다(16 만으로는 막히지 않습니다).

### 19 · 18 · 17 · 16 · 15 · 14

`docs/OWNER_RUNBOOK_PROD_MIGRATION_2026-09-11.md` ⑨ 그대로입니다.

### Edge · 동의 게이트

- Edge: 이전 버전을 다시 배포 — 되돌릴 커밋을 체크아웃한 별도 폴더에서 `npx.cmd supabase@2.117.0 functions deploy <이름> --project-ref olvkpaldrwvtexxpoaag`.
  ⚠ `chat` 은 **삭제하지 마십시오**(상담이 멈춥니다). ⚠ `chat` 을 병합 전 `main`(`28c406a`)의 옛 버전으로 되돌리면
  새 웹의 상담이 모두 실패합니다(계약이 다르다) — `chat` 은 **웹을 되돌릴 때만** 함께 되돌립니다.
- 게이트 (▶ PowerShell · `[y/N]` → **y**): `npx.cmd supabase@2.117.0 secrets unset AI_CONSENT_ENFORCED --project-ref olvkpaldrwvtexxpoaag`

---

## 요약 카드 — 이 한 장만 보셔도 됩니다

| 단계 | 명령 | 🛑 멈춤 신호 |
|---|---|---|
| ① | SQL 1-3 · 1-4 · 1-6 · 1-7 · 익명 로그인 화면 · `git log --oneline -1` · `(git diff --cached --name-only \| Measure-Object).Count` · 동결 테스트 · CLI 준비 · 실사이트 상담 1회(기록만) | CASCADE 아님 · 공유≠0 · pg_cron 없음 · HEAD≠b31bb27 · 인덱스≠63 · 동결 테스트 실패 (익명 켜짐 → 끄고 진행) |
| ② | robocopy → `npx.cmd … db push --dry-run` **9줄** 확인 → `npx.cmd … db push` → ②-5 ⓐ~ⓙ | 목록 다름 · ②-5 불일치 |
| ③ | `select public.backfill_answer_witness(300);` 0 까지 → `answer_witness_backlog()` = 0 | 시간 초과 반복 · 안 줄어듦 |
| ④ | `create extension pg_cron` → `run_answer_retention(1000)` → `cron.schedule(…)` | `refused` |
| ⑤ | `npx.cmd … functions deploy` ×3 (**chat 아님**) → `curl.exe` 401 · 게이트 시크릿 없음 | 404 · 게이트 켜져 있음 |
| ⑥ | `git commit -F BUNDLE3_4…` → `git add -A` → `Compare-Object` 빈 출력 → `git commit -F BUNDLE5_6…` → push → Preview 8~12 (보기만) | 모르는 파일 · "설치되지 않았습니다" |
| ⑦ | ②-5 · ③=0 · ④-4=0 확인 → 병합 → 실사이트 확인 → **바로** `functions deploy chat` → 상담 1회 · SQL → [상담 삭제] → `EXPIRED` | 옛 화면 · 배포 실패 · 상담 실패(DB 는 되돌리지 말 것) · 삭제 뒤 `COMPLETED` |
| ⑧ | `secrets set AI_CONSENT_ENFORCED=true` → 동의 3단계 확인 | 동의 화면 없이 실패 문구 |
| ⑨ | (따로) `git status --short` 빈 출력 → `npx.cmd expo install --check` → `npx.cmd eas-cli@latest build … --profile production` | 작업 트리에 변경 있음 |

---

## 동결 목록 — 2026-09-13 (production 에 올라가는 파일 17개)

줄바꿈을 LF 로 맞춘 뒤의 SHA-256 입니다(Windows 체크아웃의 CRLF 와 무관하게 같은 값). ① 의 1-8 테스트
(`src/features/chat/__tests__/productionPackageFreeze.test.ts`)가 이 목록을 읽어 파일마다 대조하고, ②-3 의 dry-run
목록 · 레포의 새 마이그레이션 · ⑤/⑦-2 의 배포 대상 · 22 되돌리기 SQL 도 함께 맞춰 봅니다.
패키지를 production 에 적용한 뒤에는 그 테스트를 지웁니다.

```text
de43e9ebb9a52186dca37011aae6b2f3815d10cc7fcd29ab6d672899f6f8696b  supabase/migrations/20260914000000_drop_legacy_message_policies.sql
b35abf74c1c4e8a946506e514d2735aa29f548688131279b8878300ef3b30d27  supabase/migrations/20260915000000_model_pricing.sql
f56f666eb88b768584d42f474b5e61e539890ad481727d0d8ed97f3f2663b2b3  supabase/migrations/20260916000000_m13_share_server_snapshot.sql
d8212a3b786481a52992b6cfa939af1ea4422040b077fb319e0c94504507f9b1  supabase/migrations/20260917000000_ai_content_reports.sql
0920f0ebdc77cc69eb4011fc247005825f06306184bd77cb8c9d1d890c6e2c34  supabase/migrations/20260918000000_ai_processing_consent.sql
0c01e897b36bf795e9c79439d3f15c85b1ee7d27b70e6ce828437d542f243436  supabase/migrations/20260919000000_iap_google_runtime.sql
785026c35f6534284c4eb20770ca9a90505d17cba2781786103e12811b07df06  supabase/migrations/20260920000000_share_witness_and_gaps.sql
e10bab13f1515ec427d3a7d4483c71e8c43c4a68d2ecfaec4aa87cec84ff7d28  supabase/migrations/20260921000000_answer_retention_and_preview.sql
7570683e6705f65d5c4be20981b068971d007a38e286d8be660bb1066214b025  supabase/migrations/20260922000000_conversation_delete.sql
062a96694d13cf92f224454f6e593824fe96288ab1438424f57a32b754f2806b  supabase/functions/chat/index.ts
f18cdc20eb03150e26598e9c9df034a13fae56ffc9392494108c155d898e73f7  supabase/functions/chat/_server/serverBundle.mjs
29db0036ba4ac1847bc7ef0260cbc99f36ca223e3ff6c46a343bfb8eb368ec7a  supabase/functions/chat/deno.json
8d24dab1cf68c56898b63626ae0dbeda9e725590800a58c987f1e2207257fad6  supabase/functions/_shared/globalSpendGuard.ts
271480282479afdf104fa40f094048371982a544b5e150bc8869b61b0ca90c91  supabase/functions/verify-purchase/index.ts
fffd4062be8e48314ce094a16818061df25c76f207b9cf313455449762053278  supabase/functions/google-rtdn/index.ts
a263c6302c145a49095b7cfce3efd807966858fe4c484ab2ba3bb1b8cc5c0835  supabase/functions/iap-reconcile/index.ts
b335552246369db0892ceadf65bb850abb7cec341de92579264ecaca12943645  supabase/functions/_shared/googlePlay.ts
```
