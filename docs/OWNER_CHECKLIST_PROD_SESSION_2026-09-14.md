# production 세션 — 오너 체크리스트 (한 장)

> 명령 · SQL · 기대값은 `docs/PRODUCTION_APPLY_PACKAGE_2026-09-12.md` 의 **같은 번호**에 있습니다. 이 장은 **순서와 멈춤**만.
> **CTO 최종 GO 를 받은 뒤** 시작합니다. DB 비밀번호는 터미널 입력창에만 — 여기에도, 채팅에도 적지 않습니다.
> 🛑 가 나오면 그 자리에서 멈추고 CTO 에게 보냅니다.

> ⌨ **PowerShell 규칙** (2026-09-14 리허설로 확인 — 패키지 「명령 치는 법」)
> - **한 칸 = 한 줄.** 한 칸만 붙여 넣고 Enter → 기대와 맞으면 다음 칸. `>>` 가 뜨면 **Ctrl+C** 후 그 줄만 다시.
> - `npx` 가 아니라 **`npx.cmd`**, `curl` 이 아니라 **`curl.exe`**. Supabase CLI 는 `supabase@2.117.0` 고정.
> - 처음 한 번 `Ok to proceed? (y)` → **y** · `db push` 의 `[Y/n]` → 9줄 확인 후 **Y** · 시크릿 삭제의 `[y/N]` → **y**.
> - **정상인 경고**: Edge 배포의 `WARNING: Docker is not running` · `db push` 의 `Initialising login role...` · `git add` 의 `LF will be replaced by CRLF`.
> - 로그인 창: `Access token not provided` → `npx.cmd supabase@2.117.0 login`(브라우저) · 첫 `git push` 의 GitHub 창 · ⑨ EAS.
> - SQL 은 PowerShell 이 아니라 **Supabase 대시보드 → production → SQL Editor** 에, 칸 하나씩 [Run].

## 사전 확인 3가지 (패키지 ①) — 하나라도 🛑 이면 시작하지 않는다

- [ ] **1. 코드가 동결 그대로인가** — `git log --oneline -1` 앞 7자리 `b31bb27` · `(git diff --cached --name-only | Measure-Object).Count` = **63** · 동결 테스트 **21 passed** (1-5 · 1-8)
- [ ] **2. production DB 가 준비됐나** — 계정 삭제 외래키 — `user_id` 세 줄이 `CASCADE | auth.users`(광고 칸 `SET NULL` 은 정상) · 살아 있는 공유 **0** · pg_cron 있음 · 완료 답 수 적어 두기 (1-3 · 1-4 · 1-7 · 1-6)
- [ ] **3. 콘솔 · CLI** — 익명 로그인 **꺼짐**(켜져 있으면 끄고 진행) · `npx.cmd supabase@2.117.0 --version` = **2.117.0** · 실사이트 상담 1회 결과 적기(성공/실패 — 멈추지 않음) (1-2 · 1-10 · 1-9)

## 9단계 — 한 줄씩

- [ ] **①** 위 사전 확인 3가지
- [ ] **②** `robocopy` 복사(실패 칸 0) → `npx.cmd … db push --dry-run` **9줄** 그대로 → `npx.cmd … db push` 에 **Y** → ②-5 ⓐ~ⓙ 전부 기대대로
- [ ] **③** `select public.backfill_answer_witness(300);` 을 0 이 될 때까지 → `answer_witness_backlog()` = **0**
- [ ] **④** pg_cron 켜기 → `run_answer_retention(1000)` = `ok` → 매시 17분 등록 → 창지난원문 **0**
- [ ] **⑤** Edge **3개** 배포 (`chat` 은 **아직 아님**) → `curl.exe` **401** · 게이트 시크릿 **없음**(빈 출력)
- [ ] **⑥** 커밋 2개(아래 순서) → push → Preview 8~12 **보기만**
- [ ] **⑦** ⓓ 세 조건 확인 → 병합 → 실사이트가 새 화면 → **바로** `chat` 배포 → 상담 1회 · SQL 두 칸 → [상담 삭제] → `EXPIRED`
- [ ] **⑧** `npx.cmd … secrets set AI_CONSENT_ENFORCED=true` → 동의 3단계 확인 (동의 화면 없이 실패하면 즉시 끄기)
- [ ] **⑨** (따로 · Play Console 준비 뒤) `git status --short` 빈 출력 → `npx.cmd eas-cli@latest build --platform android --profile production` — `docs/PLAY_CONSOLE_FIRST_UPLOAD_2026-09-14.md`

> ⚠⚠ **실사이트 상담이 실패해도 20 · 21 을 되돌리지 않습니다.** ⑦-2 전의 실패는 웹과 `chat` 의 계약 차이 때문입니다
> (패키지 「창 구간」). ⑦-2 **뒤에도** 실패하면 멈추고 CTO — 그때도 DB 되돌리기는 아닙니다.

## 커밋 순서 — 3·4 → 5·6 (▶ PowerShell · 한 칸씩 · 순서대로)

```powershell
cd C:\Development\DeokbunAI-app
```

```powershell
git commit -F C:\Development\owner_inputs\BUNDLE3_4_COMMIT_MSG.txt
```

**기대**: `63 files changed` (첫 커밋 = 이미 스테이징된 묶음 3·4 그대로).

```powershell
git add -A
```

```powershell
Compare-Object (Get-Content C:\Development\owner_inputs\BUNDLE5_6_FILES.txt) (git diff --cached --name-only)
```

**기대**: **아무것도 나오지 않음** — 두 목록이 같다. 🛑 `=>` · `<=` 가 붙은 줄이 나오면 커밋하지 않는다(모르는 파일 · `dist/` · `.env`).

```powershell
git commit -F C:\Development\owner_inputs\BUNDLE5_6_COMMIT_MSG.txt
```

**기대**: `… files changed` — `BUNDLE5_6_FILES.txt` 의 줄 수와 같은 숫자 (묶음 5·6 · 2026-09-14 마무리 · 리허설 포함).

```powershell
git push origin admin/master-operations-content
```

**기대**: `b31bb27..xxxxxxx  admin/master-operations-content -> admin/master-operations-content` (처음이면 GitHub 로그인 창).

## 끝난 뒤 확인

- [ ] **한 시간 뒤**(17분이 지난 다음) ④-5 — cron 기록이 `succeeded`
- [ ] ⑦-3 · ⑧-1 결과와 1-9 결과를 CTO 에게 한 줄씩
- [ ] **다음 날** — SQL 4-4 의 창지난원문 = **0** · 게이트가 켜진 채인지: `npx.cmd supabase@2.117.0 secrets list --project-ref olvkpaldrwvtexxpoaag | Select-String AI_CONSENT_ENFORCED` 에 한 줄
- [ ] 스토어 제출은 ⑧ 뒤 (`docs/STORE_LISTING_COPY_2026-09-13.md` §4 의 제출 전 확인 둘)
